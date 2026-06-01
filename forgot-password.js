import { apiUrl } from "./auth.js";

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
  const step1 = document.getElementById("step1");
  const step2 = document.getElementById("step2");
  const step3 = document.getElementById("step3");
  const errorBox = document.getElementById("authError");
  const successBox = document.getElementById("authSuccess");
  const sub = document.getElementById("authSub");

  let identifier = "";
  let resetToken = "";

  const showError = (m) => {
    errorBox.textContent = m;
    errorBox.style.display = "block";
    successBox.style.display = "none";
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

  const withLoading = async (btn, text, fn) => {
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner"></span>' + text;
    try {
      await fn();
    } finally {
      btn.disabled = false;
      btn.innerHTML = original;
    }
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

  // Step 1 — send OTP
  step1.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMsgs();
    identifier = document.getElementById("identifier").value.trim();
    if (!identifier) return showError("Please enter your email or phone.");
    await withLoading(
      document.getElementById("sendBtn"),
      "Sending OTP...",
      async () => {
        try {
          await postJSON("/api/auth/forgot-password", { identifier });
          step1.style.display = "none";
          step2.style.display = "block";
          sub.textContent =
            "If an account exists, an OTP has been sent. Enter it below.";
          showSuccess("OTP sent successfully.");
        } catch (err) {
          showError(err.message);
        }
      },
    );
  });

  // Resend
  document.getElementById("resendLink").addEventListener("click", async (e) => {
    e.preventDefault();
    clearMsgs();
    try {
      await postJSON("/api/auth/resend-otp", {
        identifier,
        purpose: "reset-password",
      });
      showSuccess("A new OTP has been sent.");
    } catch (err) {
      showError(err.message);
    }
  });

  // Step 2 — verify OTP
  step2.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMsgs();
    const otp = document.getElementById("otp").value.trim();
    if (!/^[0-9]{6}$/.test(otp)) return showError("Enter the 6-digit OTP.");
    await withLoading(
      document.getElementById("verifyBtn"),
      "Verifying OTP...",
      async () => {
        try {
          const { res, data } = await postJSON("/api/auth/verify-otp", {
            identifier,
            otp,
          });
          if (!res.ok || !data.success)
            throw new Error(data.message || "Invalid OTP.");
          resetToken = data.resetToken;
          step2.style.display = "none";
          step3.style.display = "block";
          sub.textContent = "Choose a new password for your account.";
          clearMsgs();
        } catch (err) {
          showError(err.message);
        }
      },
    );
  });

  // Password strength meter
  const pwInput = document.getElementById("newPassword");
  const pwBar = document.getElementById("pwBar");
  const pwHint = document.getElementById("pwHint");
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
  document.querySelectorAll(".pw-toggle").forEach((t) => {
    t.addEventListener("click", () => {
      const input = document.getElementById(t.dataset.target);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      t.textContent = show ? "Hide" : "Show";
    });
  });

  // Step 3 — reset password
  step3.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMsgs();
    const newPassword = pwInput.value;
    const confirm = document.getElementById("confirm").value;
    const issues = passwordIssues(newPassword);
    if (issues.length)
      return showError("Password must contain " + issues.join(", ") + ".");
    if (newPassword !== confirm) return showError("Passwords do not match.");

    await withLoading(
      document.getElementById("resetBtn"),
      "Resetting Password...",
      async () => {
        try {
          const { res, data } = await postJSON("/api/auth/reset-password", {
            resetToken,
            newPassword,
          });
          if (!res.ok || !data.success)
            throw new Error(data.message || "Could not reset password.");
          step3.style.display = "none";
          showSuccess("Password updated successfully. Redirecting to login…");
          setTimeout(() => (window.location.href = "login.html"), 1500);
        } catch (err) {
          showError(err.message);
        }
      },
    );
  });
});
