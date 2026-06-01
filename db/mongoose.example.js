// ---------------------------------------------------------------------------
// PRODUCTION DROP-IN: MongoDB (Mongoose) implementation of the data layer.
//
// The app talks only to db/store.js. To move from the local JSON file store to
// MongoDB (e.g. on Vercel where the filesystem is ephemeral):
//
//   1) npm install mongoose
//   2) Set MONGODB_URI in .env / Vercel env vars (Atlas connection string).
//   3) Rename this file to db/store.js (back up the JSON version first), or
//      re-export these functions from store.js.
//
// The function signatures match db/store.js exactly, so no routes/middleware
// need to change.
// ---------------------------------------------------------------------------

const mongoose = require("mongoose");

let connPromise = null;
function connect() {
  if (!connPromise) {
    connPromise = mongoose.connect(process.env.MONGODB_URI, {
      // modern mongoose ignores the legacy flags; URI carries the options
    });
  }
  return connPromise;
}
connect();

// ---- Schemas / Models -----------------------------------------------------
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    phone: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "user" },
  },
  { timestamps: true },
);

const donationSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: String,
    email: String,
    phone: String,
    city: String,
    amount: Number,
    purpose: String,
    message: String,
    status: { type: String, default: "success" },
    date: { type: String },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Donation =
  mongoose.models.Donation || mongoose.model("Donation", donationSchema);

// ---- Helpers --------------------------------------------------------------
function toPlain(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  o.id = String(o._id);
  delete o._id;
  delete o.__v;
  return o;
}

// ---- Same API as db/store.js (all async; await them in routes) ------------
async function findUserByEmail(email) {
  return toPlain(await User.findOne({ email: String(email).toLowerCase() }));
}
async function findUserByPhone(phone) {
  const p = String(phone).replace(/\D/g, "").slice(-10);
  return toPlain(await User.findOne({ phone: p }));
}
async function findUserById(id) {
  return toPlain(await User.findById(id));
}
async function createUser({ name, email, phone, passwordHash }) {
  const u = await User.create({
    name,
    email: String(email).toLowerCase(),
    phone: String(phone).replace(/\D/g, "").slice(-10),
    passwordHash,
  });
  return toPlain(u);
}
function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}
async function saveDonation(record) {
  return toPlain(await Donation.create(record));
}
async function findDonationByPaymentId(paymentId) {
  return toPlain(await Donation.findOne({ paymentId }));
}
async function findDonationsByUser(userId) {
  return (await Donation.find({ userId })).map(toPlain);
}

module.exports = {
  findUserByEmail,
  findUserByPhone,
  findUserById,
  createUser,
  publicUser,
  saveDonation,
  findDonationByPaymentId,
  findDonationsByUser,
};
