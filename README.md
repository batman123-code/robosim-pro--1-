# Act For Change Foundation

NGO website with a fully integrated **Razorpay donation system**. The donation
flow (amount selection → donor details → Razorpay checkout → server-side
verification → success/failure pages) is layered onto the existing site without
changing its UI, branding, navigation, or animations.

---

## Tech stack

- **Frontend:** Static multi-page site, built with [Vite](https://vitejs.dev/). One `.html` + `.js` per page, sharing `home.css` / `style.css`.
- **Backend:** [Express](https://expressjs.com/) (`server.js`) exposing the payment APIs.
- **Payments:** [Razorpay](https://razorpay.com/) (Orders + Checkout + signature verification).

---

## Donation flow

```
Donate button → donate.html → select amount + donor details
   → POST /api/create-order (validates, creates Razorpay order, stores amount server-side)
   → Razorpay Checkout (UPI / GPay / PhonePe / Paytm / BHIM / cards / netbanking)
   → POST /api/verify-payment (verifies signature, persists donation from the TRUSTED amount)
   → donation-success.html   (or donation-failure.html / in-page failure overlay)
```

---

## Environment variables

Copy `.env.example` to `.env` and fill in your **own** keys from the
[Razorpay Dashboard](https://dashboard.razorpay.com/) → Settings → API Keys.

| Variable | Description |
|---|---|
| `RAZORPAY_KEY_ID` | Public key id (`rzp_test_…` / `rzp_live_…`). Safe to expose to the browser. |
| `RAZORPAY_KEY_SECRET` | **Secret** key — server-side only. Never commit, never put in frontend. |
| `JWT_SECRET` | Long random string for signing auth tokens. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`). |
| `NODE_ENV` | `development` locally, `production` when deployed. |

> ⚠️ **Security:** If a secret was ever committed or shared, rotate it in the
> Razorpay Dashboard immediately. The secret belongs only in your local `.env`
> (git-ignored) and in your host's environment-variable settings.

---

## Run locally

```bash
npm install

# Terminal 1 — API server (port 3001)
npm start

# Terminal 2 — Vite dev server (port 3000, proxies /api → 3001)
npx vite
```

Or run both together: `npm run dev`. Then open http://localhost:3000/donate.html.

### Test card / UPI (Razorpay Test Mode)

- **Card:** `4111 1111 1111 1111`, any future expiry, any CVV.
- **UPI success:** `success@razorpay`  •  **UPI failure:** `failure@razorpay`.

### Scenarios to verify

1. **Success** – complete a test payment → redirected to `donation-success.html` with receipt.
2. **Failure** – use `failure@razorpay` → in-page failure overlay with Retry / Contact / Home.
3. **Cancellation** – close the Razorpay modal → button re-enables, no charge.
4. **Network/timeout** – the create-order request aborts after 10s and shows a retry message.
5. **Invalid order / tampering** – bad signature or unknown order is rejected by the server.

---

## Backend API

| Method | Route | Purpose |
|---|---|---|
| `GET`  | `/api/config` | Returns the public `key_id` for Checkout. |
| `POST` | `/api/create-order` | Validates donor + amount, creates a Razorpay order, stores the trusted amount server-side. |
| `POST` | `/api/verify-payment` | Verifies the Razorpay signature (constant-time), then persists the donation from the **server-stored** amount (not the client's). Idempotent against duplicate payment ids. |

**Security measures:** server-side signature verification, constant-time
comparison, input sanitization, amount validated and trusted only from the
server, never from the browser.

> **Storage note:** donations are kept in memory (see the storage layer in
> `server.js`). This is a placeholder — swap those functions for a real
> database (Postgres / Mongo / Supabase) before production, especially on
> serverless where in-memory state does not persist between invocations.

---

## Authentication (JWT)

Users can register / log in; logged-in donations are linked to their account.
Login is **encouraged but optional** — guests can still donate ("Continue as
guest" on the login page).

**Auth API** (`routes/auth.js`):

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Create account (name, email, phone, password). Validates strong password, hashes with bcrypt. Returns JWT + user. |
| `POST` | `/api/auth/login` | Login with **email or phone** + password. Returns JWT + user. |
| `GET`  | `/api/auth/me` | Verify token / persistent-login check (requires `Authorization: Bearer <token>`). |
| `POST` | `/api/auth/logout` | Stateless logout (client discards token). |

**How it fits together:**

- `lib/jwt.js` — sign/verify tokens (`userId`, `email`, `role`; 7-day expiry).
- `middleware/auth.js` — `authenticateJWT` (hard guard, 401 on missing/invalid) and `optionalAuth` (attaches user if a valid token is present, used on donation routes so guests still work).
- `lib/validators.js` — email / phone / password-policy checks.
- `db/store.js` — file-based users/donations store. Swap to MongoDB via `db/mongoose.example.js` (set `MONGODB_URI`, `npm i mongoose`, rename it to `db/store.js`).
- Frontend: `login.html`/`register.html` (+ `.js`), `auth.css`, and `auth.js` — a localStorage-based auth manager (token + user), navbar Login/Logout chip, Donate-link gating (logged-out → `login.html?redirect=donate.html`), and persistent login (re-validates against `/api/auth/me` on load). `auth.js` is initialised from `home.js`, so it runs on every page.

**Security:** bcrypt (cost 12) password hashing, JWT expiry, Helmet headers,
rate limiting on auth endpoints (30 req / 15 min / IP), input validation +
sanitization, generic login errors (no user enumeration). CSRF isn't applicable
— tokens are sent via the `Authorization` header, not cookies.

> **Local user data** lives in `data/users.json` / `data/donations.json`
> (git-ignored). Passwords are stored only as bcrypt hashes.

### OTP & password recovery

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Creates an **unverified** account + sends a registration OTP. |
| `POST` | `/api/auth/verify-registration-otp` | Activates the account → returns JWT. Unverified users can't log in. |
| `POST` | `/api/auth/send-login-otp` · `/verify-login-otp` | Passwordless OTP login. |
| `POST` | `/api/auth/forgot-password` | Sends a reset OTP (generic response — no user enumeration). |
| `POST` | `/api/auth/verify-otp` | Verifies the reset OTP → returns a short-lived `resetToken`. |
| `POST` | `/api/auth/reset-password` | Sets a new password using `resetToken`. |
| `POST` | `/api/auth/resend-otp` | Resends an OTP for `registration` / `login` / `reset-password`. |

**OTP security:** 6-digit crypto-random codes, **bcrypt-hashed** (never stored in
plain text), **10-minute expiry**, **single-use**, **max 5 attempts** then
lockout, one active OTP per purpose, and a stricter rate limit (6 / 15 min) on
OTP-sending endpoints. `lib/otp.js` + `services/delivery.js` + `data/otps.json`.

**OTP delivery** (`services/delivery.js`) is pluggable: **email via Nodemailer/SMTP**,
**SMS via Twilio** (`npm i twilio`), or — when nothing is configured — a **dev
console transport** that prints the OTP to the server log (so the flow works
locally with zero setup). Configure `SMTP_*` / `TWILIO_*` in `.env`.

**Frontend:** `login.html` has a **Password / OTP** toggle and a *Forgot password?*
link; `forgot-password.html` runs the 3-step reset (send → verify → new password);
`register.html` shows an **OTP verification step** after sign-up. All with loading
states, success/error messages, and password-strength meters.

---

## Instagram → Events auto-sync

The Events page (`events.html`) shows a **"Latest from Instagram"** feed that
updates automatically — no manual edits. It uses the official **Instagram Graph
API** (Meta-approved; not scraping).

**Pipeline:** `services/instagram.js` fetches the latest posts → `services/eventSync.js`
reconciles them into the cache (`db/store.js`, de-duped by `instagramPostId`,
newest first) → `GET /api/events` serves the cache → `events.js` renders lazy-loaded
cards. The cache is preserved if Instagram is unavailable, and the page shows
*"Events temporarily unavailable"* rather than breaking.

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/events` | Cached posts (newest first) + `lastSync`/`status`. |
| `GET`/`POST` | `/api/events/sync` | Trigger a sync. Protected by `SYNC_SECRET` (header `x-sync-key`, or `Authorization: Bearer`). |

**Auto-refresh:** a long-running `npm start` server runs `eventSync` every
`INSTAGRAM_SYNC_INTERVAL_MINUTES` (default 20). On Vercel, `vercel.json` defines
a **Cron job** that hits `/api/events/sync` every 20 min (serverless can't use
`setInterval`).

### One-time Instagram setup (only you can do this)

1. Convert **@actforchange.trust** to a **Business or Creator** account (Instagram app → Settings → Account type).
2. At <https://developers.facebook.com> create an app, add **Instagram → API with Instagram Login**.
3. Generate a **long-lived access token** (~60 days, refreshable).
4. Put it in `.env` as `INSTAGRAM_ACCESS_TOKEN` (and in Vercel env vars). Set `SYNC_SECRET` too.

Until a token is set, the feed simply shows the graceful fallback — nothing breaks.

---

## Deploy: GitHub → Vercel

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Razorpay donation integration"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```

   `.gitignore` already excludes `.env` (only `.env.example` is committed) — confirm no secret is staged.

2. **Import the repo in Vercel** (vercel.com → Add New → Project). Vercel reads
   `vercel.json`:
   - Build command: `npm run build`  → output `dist/`
   - `/api/*` requests are routed to the Express app via `api/index.js`.

3. **Add Environment Variables** in Vercel → Project → Settings → Environment
   Variables: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `JWT_SECRET`,
   `JWT_EXPIRES_IN=7d`, and `NODE_ENV=production`. Paste secrets **only here** —
   never in code or Git. (On Vercel, use MongoDB Atlas via `db/mongoose.example.js`
   + `MONGODB_URI`, since the serverless filesystem won't persist the JSON store.)

4. **Deploy.** Visit `/donate.html` on the deployment URL and run a test payment.

5. **Go live:** swap the test keys for `rzp_live_…` keys in Vercel's env vars
   and redeploy.

---

## Files added / modified for the integration

| File | Role |
|---|---|
| `server.js` | Express API: `/api/config`, `/api/create-order`, `/api/verify-payment`; validation, signature verification, storage layer. Exports the app for serverless. |
| `api/index.js` | Vercel serverless entry — re-exports the Express app. |
| `vercel.json` | Build + `/api` routing config for Vercel. |
| `donate.html` | Donation page UI (amount cards, donor form, trust section, overlays). |
| `donate.js` | Amount selection, validation, create-order (10s timeout), Checkout, verification. |
| `donate.css` | Donation-specific styles (matches existing design system). |
| `donation-success.html` / `.js` | Success page + receipt rendering / download. |
| `donation-failure.html` / `.js` | Standalone failure page with Retry / Contact / Home. |
| `.env.example` | Placeholder env template (no real secrets). |
