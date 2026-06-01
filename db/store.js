// ---------------------------------------------------------------------------
// File-based JSON data store (zero external dependencies).
//
// This is a clean data-access layer. Every read/write goes through these
// functions, so swapping to MongoDB later is a drop-in change: re-implement
// the same function signatures with Mongoose (see db/mongoose.example.js) and
// nothing else in the app needs to change.
//
// NOTE: on serverless (Vercel) the filesystem is ephemeral/read-only, so data
// won't persist between invocations. Use MongoDB Atlas there.
// ---------------------------------------------------------------------------
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "..", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const DONATIONS_FILE = path.join(DATA_DIR, "donations.json");
const EVENTS_FILE = path.join(DATA_DIR, "events.json");
const OTP_FILE = path.join(DATA_DIR, "otps.json");

function ensureFile(file) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(file)) fs.writeFileSync(file, "[]", "utf8");
  } catch (e) {
    // Read-only FS (e.g. serverless) — fall back to in-memory only.
  }
}

function readAll(file) {
  ensureFile(file);
  try {
    return JSON.parse(fs.readFileSync(file, "utf8") || "[]");
  } catch (e) {
    return [];
  }
}

function writeAll(file, rows) {
  try {
    ensureFile(file);
    fs.writeFileSync(file, JSON.stringify(rows, null, 2), "utf8");
  } catch (e) {
    // Best-effort on read-only FS; in-memory copy still works for the request.
  }
}

function newId() {
  return crypto.randomBytes(12).toString("hex");
}

// ---- Users ----------------------------------------------------------------
function findUserByEmail(email) {
  if (!email) return null;
  const e = String(email).toLowerCase();
  return readAll(USERS_FILE).find((u) => u.email === e) || null;
}

function findUserByPhone(phone) {
  if (!phone) return null;
  const p = String(phone).replace(/\D/g, "").slice(-10);
  return readAll(USERS_FILE).find((u) => u.phone === p) || null;
}

function findUserById(id) {
  return readAll(USERS_FILE).find((u) => u.id === id) || null;
}

function createUser({ name, email, phone, passwordHash, verified = true }) {
  const users = readAll(USERS_FILE);
  const user = {
    id: newId(),
    name,
    email: String(email).toLowerCase(),
    phone: String(phone).replace(/\D/g, "").slice(-10),
    passwordHash,
    role: "user",
    verified, // false until OTP-verified for new registrations
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeAll(USERS_FILE, users);
  return user;
}

// Patch a user record by id (used for password reset, verification, etc.).
function updateUser(id, patch) {
  const users = readAll(USERS_FILE);
  const i = users.findIndex((u) => u.id === id);
  if (i === -1) return null;
  users[i] = { ...users[i], ...patch };
  writeAll(USERS_FILE, users);
  return users[i];
}

function setUserVerified(id) {
  return updateUser(id, { verified: true });
}

// Existing accounts created before verification existed have no `verified`
// field — treat them as verified (grandfathered) so nobody is locked out.
function isUserVerified(user) {
  return !user || user.verified !== false;
}

// Strip sensitive fields before sending a user to the client.
function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

// ---- Donations ------------------------------------------------------------
function saveDonation(record) {
  const donations = readAll(DONATIONS_FILE);
  const donation = { id: newId(), ...record };
  donations.push(donation);
  writeAll(DONATIONS_FILE, donations);
  return donation;
}

function findDonationByPaymentId(paymentId) {
  return (
    readAll(DONATIONS_FILE).find((d) => d.paymentId === paymentId) || null
  );
}

function findDonationsByUser(userId) {
  return readAll(DONATIONS_FILE).filter((d) => d.userId === userId);
}

// ---- Instagram / Events cache --------------------------------------------
// events.json shape: { items: [...], lastSync: ISO, status: "ok"|"error" }
function readEventsDoc() {
  ensureFile(EVENTS_FILE);
  try {
    const raw = fs.readFileSync(EVENTS_FILE, "utf8");
    const doc = raw ? JSON.parse(raw) : {};
    return {
      items: Array.isArray(doc.items) ? doc.items : [],
      lastSync: doc.lastSync || null,
      status: doc.status || "never",
    };
  } catch (e) {
    return { items: [], lastSync: null, status: "never" };
  }
}

function getEvents() {
  return readEventsDoc();
}

function writeEventsDoc(doc) {
  try {
    ensureFile(EVENTS_FILE);
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(doc, null, 2), "utf8");
  } catch (e) {
    /* read-only FS — caller keeps the in-memory copy */
  }
}

// Merge freshly-fetched posts into the cache, de-duplicating by
// instagramPostId, keeping newest first. Returns { added, total }.
function upsertEvents(posts) {
  const doc = readEventsDoc();
  const byId = new Map(doc.items.map((p) => [p.instagramPostId, p]));
  let added = 0;
  for (const post of posts) {
    if (!byId.has(post.instagramPostId)) added++;
    byId.set(post.instagramPostId, {
      ...byId.get(post.instagramPostId),
      ...post,
      syncedAt: new Date().toISOString(),
    });
  }
  const items = Array.from(byId.values()).sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
  );
  const newDoc = { items, lastSync: new Date().toISOString(), status: "ok" };
  writeEventsDoc(newDoc);
  return { added, total: items.length };
}

function setEventsStatus(status) {
  const doc = readEventsDoc();
  doc.status = status;
  doc.lastSync = doc.lastSync || null;
  writeEventsDoc(doc);
}

// ---- OTP tokens -----------------------------------------------------------
// otps.json: [{ id, userId, purpose, otpHash, expiresAt, used, attempts, createdAt }]
function createOtp({ userId, purpose, otpHash, expiresAt }) {
  const otps = readAll(OTP_FILE);
  // Single active OTP per (user, purpose): retire any previous ones.
  for (const o of otps) {
    if (o.userId === userId && o.purpose === purpose && !o.used) o.used = true;
  }
  const record = {
    id: newId(),
    userId,
    purpose,
    otpHash,
    expiresAt,
    used: false,
    attempts: 0,
    createdAt: new Date().toISOString(),
  };
  otps.push(record);
  writeAll(OTP_FILE, otps);
  return record;
}

function findActiveOtp(userId, purpose) {
  return (
    readAll(OTP_FILE)
      .filter((o) => o.userId === userId && o.purpose === purpose && !o.used)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null
  );
}

function markOtpUsed(id) {
  const otps = readAll(OTP_FILE);
  const o = otps.find((x) => x.id === id);
  if (o) {
    o.used = true;
    writeAll(OTP_FILE, otps);
  }
}

function incrementOtpAttempts(id) {
  const otps = readAll(OTP_FILE);
  const o = otps.find((x) => x.id === id);
  if (!o) return 0;
  o.attempts = (o.attempts || 0) + 1;
  writeAll(OTP_FILE, otps);
  return o.attempts;
}

module.exports = {
  findUserByEmail,
  findUserByPhone,
  findUserById,
  createUser,
  updateUser,
  setUserVerified,
  isUserVerified,
  publicUser,
  saveDonation,
  findDonationByPaymentId,
  findDonationsByUser,
  getEvents,
  upsertEvents,
  setEventsStatus,
  createOtp,
  findActiveOtp,
  markOtpUsed,
  incrementOtpAttempts,
};
