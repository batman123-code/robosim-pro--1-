// Authentication middleware — Firebase Auth edition.
// Verifies the Firebase ID token from the Authorization: Bearer header.
const { verifyIdToken } = require("../lib/firebase-admin");

function extractToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7).trim();
  return null;
}

// Hard guard — returns 401 if no valid token.
async function authenticateJWT(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });
  try {
    const decoded = await verifyIdToken(token);
    req.user = {
      id: decoded.uid,
      uid: decoded.uid,
      email: decoded.email || null,
      name: decoded.name || null,
      emailVerified: decoded.email_verified || false,
    };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

// Soft guard — attaches req.user if a valid token is present, never blocks.
// Donation routes use this so guests can still donate.
async function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (token) {
    try {
      const decoded = await verifyIdToken(token);
      req.user = {
        id: decoded.uid,
        uid: decoded.uid,
        email: decoded.email || null,
        name: decoded.name || null,
        emailVerified: decoded.email_verified || false,
      };
    } catch (err) {
      /* invalid token — treat as guest */
    }
  }
  next();
}

module.exports = { authenticateJWT, optionalAuth };
