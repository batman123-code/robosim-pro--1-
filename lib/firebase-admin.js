// Firebase Admin SDK — used server-side to verify ID tokens sent from the
// Firebase client SDK. The token is generated client-side by Firebase Auth
// and passes through the Authorization: Bearer header to our Express API.
//
// Initialization requires a service account. Get one from:
//   Firebase Console → Project Settings → Service Accounts → Generate new key
// Then either:
//   a) Set GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json  (local dev)
//   b) Set the 3 individual env vars below                   (Vercel / prod)

const admin = require("firebase-admin");

let app = null;

function getAdmin() {
  if (app) return admin;

  // Prefer individual env vars (Vercel-friendly, no JSON file needed).
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && rawKey) {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        // Vercel escapes newlines in env vars — unescape them.
        privateKey: rawKey.replace(/\\n/g, "\n"),
      }),
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Fall back to ADC (local dev with a key file).
    app = admin.initializeApp();
  } else {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, " +
        "FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.",
    );
  }

  return admin;
}

// Verify a Firebase ID token. Returns the decoded token payload (uid, email, etc.)
// Throws if the token is invalid/expired.
async function verifyIdToken(idToken) {
  return getAdmin().auth().verifyIdToken(idToken);
}

module.exports = { verifyIdToken };
