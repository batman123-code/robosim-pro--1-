// Vercel serverless entry point.
// Vercel serves files in /api as serverless functions. This re-exports the
// Express app (which defines /api/create-order, /api/verify-payment, /api/config).
// vercel.json rewrites all /api/* requests here, and the original path is
// preserved so Express routing matches.
module.exports = require("../server.js");
