// Shared validation helpers (used by auth + donation routes).

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[0-9]{10}$/.test(String(phone || "").replace(/\D/g, "").slice(-10));
}

// Password: min 8 chars, with uppercase, lowercase, number, and special char.
function passwordIssues(password) {
  const issues = [];
  if (typeof password !== "string" || password.length < 8)
    issues.push("at least 8 characters");
  if (!/[A-Z]/.test(password || "")) issues.push("an uppercase letter");
  if (!/[a-z]/.test(password || "")) issues.push("a lowercase letter");
  if (!/[0-9]/.test(password || "")) issues.push("a number");
  if (!/[^A-Za-z0-9]/.test(password || "")) issues.push("a special character");
  return issues;
}

function sanitizeString(value, maxLen = 200) {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").trim().slice(0, maxLen);
}

module.exports = { isValidEmail, isValidPhone, passwordIssues, sanitizeString };
