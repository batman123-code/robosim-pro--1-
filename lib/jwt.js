// JWT utility functions. Secret + expiry come from environment variables.
const jwt = require("jsonwebtoken");

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "JWT_SECRET is missing or too short. Set a strong value in .env.",
    );
  }
  return secret;
}

function signToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role || "user" },
    getSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
}

function verifyToken(token) {
  return jwt.verify(token, getSecret()); // throws on invalid/expired
}

module.exports = { signToken, verifyToken };
