// Authentication middleware.
const { verifyToken } = require("../lib/jwt");
const store = require("../db/store");

function extractToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7).trim();
  return null;
}

// Hard guard: rejects the request if there is no valid token.
function authenticateJWT(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const payload = verifyToken(token);
    const user = store.findUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    req.user = store.publicUser(user);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

// Soft guard: attaches req.user if a valid token is present, but never blocks.
// Used on donation routes so logged-in donations are linked to the account
// while guests can still donate.
function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (token) {
    try {
      const payload = verifyToken(token);
      const user = store.findUserById(payload.userId);
      if (user) req.user = store.publicUser(user);
    } catch (err) {
      /* ignore invalid token — treat as guest */
    }
  }
  next();
}

module.exports = { authenticateJWT, optionalAuth };
