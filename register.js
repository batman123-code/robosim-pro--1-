import { setSession, isAuthenticated, apiUrl } from "./auth.js";

const params = new URLSearchParams(window.location.search);
const redirectTo = params.get("redirect") || "home.html";
const verifyParam = params.get("verify"); // set when login redirects unverified users

if (isAuthenticated()) window.location.href = redirectTo;

function passwordIssues(pw) {
  const issues = [];
  if (!pw || pw.length < 8) issues.push("8+ characters");
  if (!/[A-Z]/.test(pw)) issues.push("an uppercase letter");
  if (!/[a-z]/.test(pw)) issues.push("a lowercase letter");
  if (!/[0-9]/.test(pw)) issues.push("a number");
  if (!/[^A-Za-z0-9]/.test(pw)) issues.push("a special character");
  return issues;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const verifyForm = document.getElementById("verifyForm");
  const errorBox = document.getElementById("authError");
  const successBox = document.getElementById("authSuccess");
  const btn = document.getElementById("registerBtn");
  const pwInput = document.getElementById("password");
  const pwBar = document.getElementById("pwBar");
  const pwHint = document.getElementById("pwHint");

  let pendingIdentifier = "";

  const showError = (m) => {
    errorBox.textContent = m;
    errorBox.style.display = "block";
    successBox.style.display = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const showSuccess = (m) => {
    successBox.textContent = m;
    successBox.style.display = "block";
    errorBox.style.display = "none";
  };
  const clearMsgs = () => {
    errorBox.style.display = "none";
    successBox.style.display = "none";
  };

  async function postJSON(path, body) {
    const res = await fetch(apiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    let data;
    try {
      data = await res.json();
    } catch (_) {
      throw new Error("Unable to reach the server. Please try again later.");
    }
    return { res, data };
  }

  const withLoading = async (b, text, fn) => {
    const original = b.innerHTML;
    b.disabled = true;
    b.innerHTML = '<span class="btn-spinner"></span>' + text;
    try {
      await fn();
    } finally {
      b.disabled = false;
      b.innerHTML = original;
    }
  };

  function goToVerifyStep(identifier) {
    pendingIdentifier = identifier;
    form.style.display = "none";
    verifyForm.style.display = "block";
  }

  // If we arrived here from an unverified login, jump straight to OTP entry.
  if (verifyParam) {
    goToVerifyStep(verifyParam);
    showSuccess("Enter the OTP we sent to verify your account.");
  }

  document.querySelectorAll(".pw-toggle").forEach((t) => {
    t.addEventListener("click", () => {
      const input = document.getElementById(t.dataset.target);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      t.textContent = show ? "Hide" : "Show";
    });
  });

  pwInput.addEventListener("input", () => {
    const pw = pwInput.value;
    const passed = 5 - passwordIssues(pw).length;
    const colors = ["#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#27ae60"];
    pwBar.style.width = (passed / 5) * 100 + "%";
    pwBar.style.background = pw ? colors[Math.max(0, passed - 1)] : "#eee";
    const issues = passwordIssues(pw);
    pwHint.textContent = issues.length
      ? "Needs " + issues.join(", ") + "."
      : "Strong password ✓";
  });

  // ── Register ──────────────────────────────────────────────────────
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMsgs();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = pwInput.value;
    const confirm = document.getElementById("confirm").value;

    if (!name) return showError("Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return showError("Please enter a valid email address.");
    if (!/^[0-9]{10}$/.test(phone.replace(/\D/g, "").slice(-10)))
      return showError("Please enter a valid 10-digit phone number.");
    const issues = passwordIssues(password);
    if (issues.length)
      return showError("Password must contain " + issues.join(", ") + ".");
    if (password !== confirm) return showError("Passwords do not match.");

    await withLoading(btn, "Creating account...", async () => {
      try {
        const { res, data } = await postJSON("/api/auth/register", {
          name,
          email,
          phone,
          password,
        });
        if (!res.ok || !data.success)
          throw new Error(data.message || "Registration failed.");
        // New flow: account created, OTP sent — move to verification.
        goToVerifyStep(data.identifier || email);
        showSuccess("OTP sent successfully. Enter it below to activate.");
      } catch (err) {
        showError(err.message);
      }
    });
  });

  // ── Verify registration OTP ──────────────────────────────────────
  verifyForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMsgs();
    const otp = document.getElementById("otpCode").value.trim();
    if (!/^[0-9]{6}$/.test(otp)) return showError("Enter the 6-digit OTP.");

    await withLoading(
      document.getElementById("verifyBtn"),
      "Verifying OTP...",
      async () => {
        try {
          const { res, data } = await postJSON(
            "/api/auth/verify-registration-otp",
            { identifier: pendingIdentifier, otp },
          );
          if (!res.ok || !data.success)
            throw new Error(data.message || "Invalid OTP.");
          setSession(data.token, data.user);
          showSuccess("Account verified! Redirecting…");
          setTimeout(() => (window.location.href = redirectTo), 1200);
        } catch (err) {
          showError(err.message);
        }
      },
    );
  });

  document.getElementById("resendLink").addEventListener("click", async (e) => {
    e.preventDefault();
    clearMsgs();
    try {
      await postJSON("/api/auth/resend-otp", {
        identifier: pendingIdentifier,
        purpose: "registration",
      });
      showSuccess("A new OTP has been sent.");
    } catch (err) {
      showError(err.message);
    }
  });
});
