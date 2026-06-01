// ---------------------------------------------------------------------------
// OTP delivery — pluggable transports.
//   • Email  → Nodemailer (any SMTP: Gmail app password, SendGrid SMTP, SES…)
//   • SMS    → Twilio (lazy-loaded; `npm i twilio` + creds to enable)
//   • Dev    → console fallback (logs the OTP) when nothing is configured, so
//              the whole flow is testable locally with zero setup.
//
// Configure via env (see .env.example). Nothing configured = console transport.
// ---------------------------------------------------------------------------
const nodemailer = require("nodemailer");

const isProd = process.env.NODE_ENV === "production";

// ---- Email (Nodemailer / SMTP) -------------------------------------------
let mailer = null;
function getMailer() {
  if (mailer !== null) return mailer;
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    mailer = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: String(process.env.SMTP_SECURE) === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  } else {
    mailer = false; // not configured
  }
  return mailer;
}

async function sendEmail(to, otp) {
  const transport = getMailer();
  if (!transport) return false;
  await transport.sendMail({
    from:
      process.env.SMTP_FROM ||
      '"Act For Change" <no-reply@actforchange.in>',
    to,
    subject: "Your Act For Change OTP",
    text: `Your OTP is:\n\n${otp}\n\nValid for 10 minutes. If you didn't request this, ignore this email.`,
    html: `<p>Your OTP is:</p><h2 style="letter-spacing:4px">${otp}</h2><p>Valid for 10 minutes. If you didn't request this, please ignore this email.</p>`,
  });
  return true;
}

// ---- SMS (Twilio, lazy) ---------------------------------------------------
let twilioClient;
function getTwilio() {
  if (twilioClient !== undefined) return twilioClient;
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      twilioClient = require("twilio")(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
    } catch (e) {
      console.warn("[delivery] twilio not installed; run `npm i twilio`.");
      twilioClient = null;
    }
  } else {
    twilioClient = null;
  }
  return twilioClient;
}

async function sendSms(phone10, otp) {
  const client = getTwilio();
  if (!client) return false;
  await client.messages.create({
    body: `Your Act For Change OTP is ${otp}. Valid for 10 minutes.`,
    from: process.env.TWILIO_FROM,
    to: "+91" + phone10, // adjust country code as needed
  });
  return true;
}

// ---- Public API -----------------------------------------------------------
// channel: "email" | "sms". Returns { delivered, transport }.
async function deliverOtp({ channel, to, otp }) {
  let delivered = false;
  let transport = "console";
  try {
    if (channel === "email") {
      delivered = await sendEmail(to, otp);
      if (delivered) transport = "email";
    } else if (channel === "sms") {
      delivered = await sendSms(to, otp);
      if (delivered) transport = "sms";
    }
  } catch (e) {
    console.error(`[delivery] ${channel} send failed:`, e.message);
    delivered = false;
  }

  // Dev/console fallback so the flow always works locally. In production we
  // do NOT print OTPs to logs.
  if (!delivered) {
    if (!isProd) {
      console.log(
        `\n📨 [DEV OTP] (${channel} → ${to}) OTP = ${otp}  (no real transport configured)\n`,
      );
      return { delivered: true, transport: "console" };
    }
    return { delivered: false, transport: "none" };
  }
  return { delivered, transport };
}

module.exports = { deliverOtp };
