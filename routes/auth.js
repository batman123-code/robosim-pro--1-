// Authentication routes: register (+OTP verify), login (password & OTP),
// forgot/reset password, logout, me.
const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");

const store = require("../db/store");
const otpLib = require("../lib/otp");
const { deliverOtp } = require("../services/delivery");
const { signToken } = require("../lib/jwt");
const { authenticateJWT } = require("../middleware/auth");
const {
  isValidEmail,
  isValidPhone,
  passwordIssues,
  sanitizeString,
} = require("../lib/validators");

const router = express.Router();

// General throttle for auth endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Try again later." },
});

// Stricter throttle for OTP-sending endpoints (anti-abuse / cost control).
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests. Please wait a few minutes.",
  },
});

// ---- Helpers --------------------------------------------------------------
function resolveUser(identifier) {
  if (!identifier) return null;
  return identifier.includes("@")
    ? store.findUserByEmail(identifier.toLowerCase())
    : store.findUserByPhone(identifier);
}

// Choose delivery channel + destination based on the identifier the user gave.
function channelFor(identifier, user) {
  if (identifier && identifier.includes("@"))
    return { channel: "email", to: user.email };
  return { channel: "sms", to: user.phone };
}

// Generate → hash → store → deliver an OTP. Returns the delivery result.
async function issueOtp(user, purpose, identifier) {
  const otp = otpLib.generateOtp();
  const otpHash = await otpLib.hashOtp(otp);
  store.createOtp({
    userId: user.id,
    purpose,
    otpHash,
    expiresAt: otpLib.expiryDate(),
  });
  const { channel, to } = channelFor(identifier, user);
  return deliverOtp({ channel, to, otp });
}

// Validate an OTP. Handles expiry, single-use, and attempt lockout.
async function verifyOtpCore(userId, purpose, otp) {
  if (!/^[0-9]{6}$/.test(String(otp || "")))
    return { ok: false, reason: "Invalid OTP." };
  const rec = store.findActiveOtp(userId, purpose);
  if (!rec) return { ok: false, reason: "Please request a new OTP." };
  if (new Date(rec.expiresAt) < new Date()) {
    store.markOtpUsed(rec.id);
    return { ok: false, reason: "OTP expired." };
  }
  if ((rec.attempts || 0) >= otpLib.MAX_ATTEMPTS) {
    store.markOtpUsed(rec.id);
    return { ok: false, reason: "Too many attempts. Please request a new OTP." };
  }
  const match = await otpLib.compareOtp(otp, rec.otpHash);
  if (!match) {
    const n = store.incrementOtpAttempts(rec.id);
    if (n >= otpLib.MAX_ATTEMPTS) {
      store.markOtpUsed(rec.id);
      return {
        ok: false,
        reason: "Too many attempts. Please request a new OTP.",
      };
    }
    return { ok: false, reason: "Invalid OTP." };
  }
  store.markOtpUsed(rec.id);
  return { ok: true };
}

// ===========================================================================
// REGISTER  (creates an unverified account + sends a registration OTP)
// ===========================================================================
router.post("/register", authLimiter, async (req, res) => {
  try {
    const name = sanitizeString(req.body.name, 120);
    const email = sanitizeString(req.body.email, 160).toLowerCase();
    const phone = String(req.body.phone || "").replace(/\D/g, "").slice(-10);
    const { password } = req.body;

    if (!name)
      return res.status(400).json({ success: false, message: "Name is required." });
    if (!isValidEmail(email))
      return res.status(400).json({ success: false, message: "A valid email is required." });
    if (!isValidPhone(phone))
      return res.status(400).json({ success: false, message: "A valid 10-digit phone number is required." });
    const pwIssues = passwordIssues(password);
    if (pwIssues.length)
      return res.status(400).json({ success: false, message: "Password must contain " + pwIssues.join(", ") + "." });

    if (store.findUserByEmail(email))
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    if (store.findUserByPhone(phone))
      return res.status(409).json({ success: false, message: "An account with this phone already exists." });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = store.createUser({ name, email, phone, passwordHash, verified: false });

    await issueOtp(user, "registration", email);

    res.status(201).json({
      success: true,
      requiresVerification: true,
      identifier: email,
      message: "Account created. Enter the OTP we sent to verify your email.",
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
});

// Verify the registration OTP → activate account → log in.
router.post("/verify-registration-otp", authLimiter, async (req, res) => {
  try {
    const identifier = sanitizeString(req.body.identifier, 160);
    const { otp } = req.body;
    const user = resolveUser(identifier);
    if (!user)
      return res.status(400).json({ success: false, message: "Please request a new OTP." });

    const result = await verifyOtpCore(user.id, "registration", otp);
    if (!result.ok)
      return res.status(400).json({ success: false, message: result.reason });

    store.setUserVerified(user.id);
    const fresh = store.findUserById(user.id);
    const token = signToken(fresh);
    res.json({ success: true, token, user: store.publicUser(fresh), message: "Account verified. You're logged in." });
  } catch (err) {
    console.error("verify-registration-otp error:", err.message);
    res.status(500).json({ success: false, message: "Verification failed. Please try again." });
  }
});

// ===========================================================================
// LOGIN (password) — blocks unverified accounts
// ===========================================================================
router.post("/login", authLimiter, async (req, res) => {
  try {
    const identifier = sanitizeString(req.body.identifier || req.body.email || req.body.phone, 160);
    const { password } = req.body;
    if (!identifier || !password)
      return res.status(400).json({ success: false, message: "Email/phone and password are required." });

    const user = resolveUser(identifier);
    const hash = user ? user.passwordHash : "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinv";
    const ok = await bcrypt.compare(String(password), hash);
    if (!user || !ok)
      return res.status(401).json({ success: false, message: "Invalid credentials." });

    if (!store.isUserVerified(user))
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        identifier: user.email,
        message: "Please verify your account. We can resend an OTP.",
      });

    const token = signToken(user);
    res.json({ success: true, token, user: store.publicUser(user) });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
});

// ===========================================================================
// LOGIN with OTP (passwordless)
// ===========================================================================
router.post("/send-login-otp", otpSendLimiter, async (req, res) => {
  try {
    const identifier = sanitizeString(req.body.identifier, 160);
    const user = resolveUser(identifier);
    // Only send if the user exists & is verified, but always respond generically.
    if (user && store.isUserVerified(user)) {
      await issueOtp(user, "login", identifier);
    }
    res.json({ success: true, message: "If an account exists, an OTP has been sent." });
  } catch (err) {
    console.error("send-login-otp error:", err.message);
    res.status(500).json({ success: false, message: "Could not send OTP. Please try again." });
  }
});

router.post("/verify-login-otp", authLimiter, async (req, res) => {
  try {
    const identifier = sanitizeString(req.body.identifier, 160);
    const { otp } = req.body;
    const user = resolveUser(identifier);
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid OTP." });

    const result = await verifyOtpCore(user.id, "login", otp);
    if (!result.ok)
      return res.status(400).json({ success: false, message: result.reason });

    const token = signToken(user);
    res.json({ success: true, token, user: store.publicUser(user), message: "Login successful." });
  } catch (err) {
    console.error("verify-login-otp error:", err.message);
    res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
});

// ===========================================================================
// FORGOT / RESET PASSWORD
// ===========================================================================
router.post("/forgot-password", otpSendLimiter, async (req, res) => {
  try {
    const identifier = sanitizeString(req.body.identifier, 160);
    const user = resolveUser(identifier);
    if (user) {
      await issueOtp(user, "reset-password", identifier);
    }
    // Never reveal whether the account exists.
    res.json({ success: true, message: "If an account exists, an OTP has been sent." });
  } catch (err) {
    console.error("forgot-password error:", err.message);
    res.status(500).json({ success: false, message: "Could not send OTP. Please try again." });
  }
});

// Verify the reset OTP → return a short-lived reset token.
router.post("/verify-otp", authLimiter, async (req, res) => {
  try {
    const identifier = sanitizeString(req.body.identifier, 160);
    const { otp } = req.body;
    const user = resolveUser(identifier);
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid OTP." });

    const result = await verifyOtpCore(user.id, "reset-password", otp);
    if (!result.ok)
      return res.status(400).json({ success: false, message: result.reason });

    const resetToken = otpLib.signResetToken(user.id);
    res.json({ success: true, resetToken });
  } catch (err) {
    console.error("verify-otp error:", err.message);
    res.status(500).json({ success: false, message: "Verification failed. Please try again." });
  }
});

router.post("/reset-password", authLimiter, async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken)
      return res.status(400).json({ success: false, message: "Reset token is required." });

    let payload;
    try {
      payload = otpLib.verifyResetToken(resetToken);
    } catch (e) {
      return res.status(400).json({ success: false, message: "Reset link expired. Please start again." });
    }

    const pwIssues = passwordIssues(newPassword);
    if (pwIssues.length)
      return res.status(400).json({ success: false, message: "Password must contain " + pwIssues.join(", ") + "." });

    const user = store.findUserById(payload.userId);
    if (!user)
      return res.status(400).json({ success: false, message: "Account not found." });

    const passwordHash = await bcrypt.hash(String(newPassword), 12);
    store.updateUser(user.id, { passwordHash });

    // Invalidate any outstanding reset OTPs for this user.
    const active = store.findActiveOtp(user.id, "reset-password");
    if (active) store.markOtpUsed(active.id);

    res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    console.error("reset-password error:", err.message);
    res.status(500).json({ success: false, message: "Could not reset password. Please try again." });
  }
});

// ===========================================================================
// RESEND OTP (registration | login | reset-password)
// ===========================================================================
router.post("/resend-otp", otpSendLimiter, async (req, res) => {
  try {
    const identifier = sanitizeString(req.body.identifier, 160);
    const purpose = sanitizeString(req.body.purpose, 30);
    const allowed = ["registration", "login", "reset-password"];
    if (!allowed.includes(purpose))
      return res.status(400).json({ success: false, message: "Invalid request." });

    const user = resolveUser(identifier);
    if (user) await issueOtp(user, purpose, identifier);
    res.json({ success: true, message: "If an account exists, a new OTP has been sent." });
  } catch (err) {
    console.error("resend-otp error:", err.message);
    res.status(500).json({ success: false, message: "Could not resend OTP. Please try again." });
  }
});

// ---- Me / Logout ----------------------------------------------------------
router.get("/me", authenticateJWT, (req, res) => {
  res.json({ success: true, user: req.user });
});

router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out." });
});

module.exports = router;
