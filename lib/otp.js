// OTP utilities: secure 6-digit generation, hashing, and short-lived
// reset tokens. OTPs are never stored in plain text (bcrypt-hashed).
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) throw new Error("JWT_SECRET missing/too short.");
  return s;
}

// Cryptographically-random, zero-padded 6-digit code.
function generateOtp() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

function hashOtp(otp) {
  return bcrypt.hash(String(otp), 10);
}

async function compareOtp(otp, hash) {
  try {
    return await bcrypt.compare(String(otp), hash);
  } catch (e) {
    return false;
  }
}

function expiryDate() {
  return new Date(Date.now() + OTP_TTL_MS).toISOString();
}

// Short-lived token proving the user passed OTP verification, used to authorize
// the actual password reset. Bound to the user + purpose.
function signResetToken(userId) {
  return jwt.sign({ userId, purpose: "pwreset" }, getSecret(), {
    expiresIn: "10m",
  });
}

function verifyResetToken(token) {
  const payload = jwt.verify(token, getSecret());
  if (payload.purpose !== "pwreset") throw new Error("Invalid reset token.");
  return payload;
}

module.exports = {
  generateOtp,
  hashOtp,
  compareOtp,
  expiryDate,
  signResetToken,
  verifyResetToken,
  OTP_TTL_MS,
  MAX_ATTEMPTS,
};
