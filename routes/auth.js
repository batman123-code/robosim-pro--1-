// Authentication routes — Firebase Auth edition.
// Registration, login, password reset, and OTP are all handled client-side
// by the Firebase Auth SDK. The backend's only job now is:
//   1. Verify Firebase ID tokens on protected API calls.
//   2. Return the current user's profile (/api/auth/me).
//   3. Optionally store/fetch extra profile data (display name, etc.).

const express = require("express");
const rateLimit = require("express-rate-limit");
const { verifyIdToken } = require("../lib/firebase-admin");
const { sanitizeString } = require("../lib/validators");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

// ---- /api/auth/me  ──────────────────────────────────────────────────────
// Verifies the Firebase ID token from the Authorization: Bearer header.
// Used by the frontend to confirm a session is still valid on page load.
router.get("/me", authLimiter, async (req, res) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const decoded = await verifyIdToken(header.slice(7).trim());
    return res.json({
      success: true,
      user: {
        uid: decoded.uid,
        email: decoded.email || null,
        name: decoded.name || decoded.email?.split("@")[0] || "Donor",
        emailVerified: decoded.email_verified || false,
        picture: decoded.picture || null,
      },
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
});

// ---- /api/auth/logout  ──────────────────────────────────────────────────
// Stateless — Firebase tokens are revoked client-side via signOut().
// This endpoint exists for symmetry and future server-side revocation.
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out." });
});

module.exports = router;
