require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const fs = require("fs");

const store = require("./db/store");
const authRouter = require("./routes/auth");
const { optionalAuth } = require("./middleware/auth");
const eventSync = require("./services/eventSync");

const app = express();
const isProd = process.env.NODE_ENV === "production";
const isVercel = !!process.env.VERCEL;
const port = isProd ? 3000 : 3001;

// Security headers. CSP is disabled because the static frontend (served by
// Vite/Vercel, not Express) loads the Razorpay checkout script + Google Fonts
// and uses inline styles; the other Helmet protections still apply to the API.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication routes (register / login / logout / me)
app.use("/api/auth", authRouter);

// ---------------------------------------------------------------------------
// Razorpay client (lazy, so the server can boot even before keys are set)
// ---------------------------------------------------------------------------
let razorpayClient = null;
function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error(
      "Razorpay keys are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
    );
  }
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayClient;
}

// ---------------------------------------------------------------------------
// Storage
// Completed donations are persisted via the data layer (db/store.js).
// pendingOrders is a short-lived in-memory map (order created -> awaiting
// payment) and does not need to be durable.
// ---------------------------------------------------------------------------
const pendingOrders = new Map(); // orderId -> { amount, donor, userId }

function savePendingOrder(orderId, record) {
  pendingOrders.set(orderId, record);
}
function getPendingOrder(orderId) {
  return pendingOrders.get(orderId);
}

// ---------------------------------------------------------------------------
// Validation / sanitization helpers
// ---------------------------------------------------------------------------
const MIN_AMOUNT = 1; // ₹1
const MAX_AMOUNT = 1000000; // ₹10,00,000 safety cap

function sanitizeString(value, maxLen = 200) {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").trim().slice(0, maxLen);
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPhone(phone) {
  return /^[0-9]{10}$/.test(String(phone).replace(/\D/g, "").slice(-10));
}

// ---------------------------------------------------------------------------
// Expose the public key id to the frontend (publishable, safe to share)
// ---------------------------------------------------------------------------
app.get("/api/config", (req, res) => {
  res.json({ key_id: process.env.RAZORPAY_KEY_ID || "" });
});

// ---------------------------------------------------------------------------
// Events feed (Instagram). GET returns the cached posts (newest first).
// The page degrades gracefully when nothing is cached / Instagram is down.
// ---------------------------------------------------------------------------
app.get("/api/events", (req, res) => {
  const { items, lastSync, status } = store.getEvents();
  res.json({
    success: true,
    count: items.length,
    lastSync,
    status, // "ok" | "error" | "never"
    events: items,
  });
});

// Trigger a sync. Protected by a shared secret so it can be called by an
// external scheduler (e.g. Vercel Cron) via header x-sync-key, or by Vercel
// Cron which sends Authorization: Bearer <CRON_SECRET>. Supports GET (Vercel
// Cron uses GET) and POST.
async function handleSync(req, res) {
  const secret = process.env.SYNC_SECRET;
  if (secret) {
    const headerKey = req.get("x-sync-key");
    const bearer = (req.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (headerKey !== secret && bearer !== secret) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
  }
  const result = await eventSync.syncNow();
  res.json({ success: !!result.ok, ...result });
}
app.post("/api/events/sync", handleSync);
app.get("/api/events/sync", handleSync);

// ---------------------------------------------------------------------------
// Create Order
// ---------------------------------------------------------------------------
app.post("/api/create-order", optionalAuth, async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < MIN_AMOUNT) {
      return res
        .status(400)
        .json({ error: `Minimum donation amount is ₹${MIN_AMOUNT}.` });
    }
    if (numericAmount > MAX_AMOUNT) {
      return res
        .status(400)
        .json({ error: `Amount exceeds the allowed limit.` });
    }

    const donor = {
      name: sanitizeString(req.body.name, 120),
      email: sanitizeString(req.body.email, 160),
      phone: sanitizeString(req.body.phone, 20),
      city: sanitizeString(req.body.city, 80),
      purpose: sanitizeString(req.body.purpose, 80) || "General Donation",
      message: sanitizeString(req.body.message, 500),
    };

    if (!donor.name) return res.status(400).json({ error: "Name is required." });
    if (!isValidEmail(donor.email))
      return res.status(400).json({ error: "A valid email is required." });
    if (!isValidPhone(donor.phone))
      return res
        .status(400)
        .json({ error: "A valid 10-digit phone number is required." });

    const amountPaise = Math.round(numericAmount * 100);

    const order = await getRazorpay().orders.create({
      amount: amountPaise,
      currency,
      receipt: "receipt_" + Date.now(),
      notes: { purpose: donor.purpose, donorName: donor.name },
    });

    // Store the authoritative amount + donor server-side, keyed by order id.
    // verify-payment will read from here — never from the client. If the
    // request is authenticated, link the donation to that user (guests = null).
    savePendingOrder(order.id, {
      amount: numericAmount,
      donor,
      userId: req.user ? req.user.id : null,
    });

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID, // public key for checkout
    });
  } catch (error) {
    console.error("Error creating order:", error.message);
    res
      .status(500)
      .json({ error: "Could not create order. Please try again." });
  }
});

// ---------------------------------------------------------------------------
// Verify Payment (signature) + persist verified donation server-side
// ---------------------------------------------------------------------------
app.post("/api/verify-payment", optionalAuth, (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Missing payment fields." });
    }

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    // Constant-time comparison to avoid timing attacks
    const signatureValid =
      expectedSign.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSign),
        Buffer.from(razorpay_signature),
      );

    if (!signatureValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature." });
    }

    // Idempotency first: if this payment was already verified & stored,
    // return the existing record instead of erroring (handles double-submits).
    const existing = store.findDonationByPaymentId(razorpay_payment_id);
    if (existing) {
      return res.json({ success: true, donation: existing, duplicate: true });
    }

    // Look up the trusted amount + donor we stored at order-creation time.
    const pending = getPendingOrder(razorpay_order_id);
    if (!pending) {
      return res
        .status(400)
        .json({ success: false, message: "Unknown or expired order." });
    }

    const donation = store.saveDonation({
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      userId: pending.userId || (req.user ? req.user.id : null),
      name: pending.donor.name,
      email: pending.donor.email,
      phone: pending.donor.phone,
      city: pending.donor.city,
      amount: pending.amount, // trusted server-side amount
      purpose: pending.donor.purpose,
      message: pending.donor.message,
      status: "success",
      date: new Date().toISOString(),
    });

    pendingOrders.delete(razorpay_order_id);

    res.json({ success: true, donation });
  } catch (error) {
    console.error("Error verifying payment:", error.message);
    res.status(500).json({ success: false, message: "Verification failed." });
  }
});

// ---------------------------------------------------------------------------
// Serve the built frontend when running as a standalone Node server
// (On Vercel the static files are served by the platform, not Express.)
// ---------------------------------------------------------------------------
if (isProd && !isVercel) {
  app.use(express.static("dist"));
  app.use((req, res) => {
    let page = req.path === "/" ? "/index.html" : req.path;
    const fileToServe = path.join(__dirname, "dist", page);
    if (fs.existsSync(fileToServe)) {
      res.sendFile(fileToServe);
    } else {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    }
  });
}

// Only listen when run directly (node server.js). When imported by the
// Vercel serverless wrapper (api/index.js) we just export the app.
// Safe startup validation — logs whether each required variable is present.
// Never prints secret values (only a masked length / boolean).
function validateEnv() {
  const present = (v) => (process.env[v] ? "✓ set" : "✗ MISSING");
  console.log("──────── Startup config check ────────");
  console.log("  RAZORPAY_KEY_ID    :", present("RAZORPAY_KEY_ID"));
  console.log("  RAZORPAY_KEY_SECRET:", present("RAZORPAY_KEY_SECRET"));
  console.log("  JWT_SECRET         :", present("JWT_SECRET"));
  console.log(
    "  INSTAGRAM_ACCESS_TOKEN:",
    process.env.INSTAGRAM_ACCESS_TOKEN ? "✓ set" : "— (feed disabled)",
  );
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn(
      "  ⚠ Razorpay keys missing — /api/create-order will fail until set in .env",
    );
  }
  console.log("──────────────────────────────────────");
}

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    validateEnv();
    // Background Instagram → Events auto-sync (no-op until token is configured).
    eventSync.startScheduler();
  });
}

module.exports = app;
