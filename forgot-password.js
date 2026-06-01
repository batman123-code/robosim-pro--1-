import { auth as getAuth } from "./auth.js";
import { sendPasswordResetEmail } from "firebase/auth";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("step1");
  const errorBox = document.getElementById("authError");
  const successBox = document.getElementById("authSuccess");
  const sub = document.getElementById("authSub");

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

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.style.display = "none";
    successBox.style.display = "none";

    const email = document.getElementById("identifier").value.trim();
    if (!email) return showError("Please enter your email address.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return showError("Please enter a valid email address.");

    const btn = document.getElementById("sendBtn");
    const orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner"></span>Sending...';

    try {
      // Firebase sends the reset email — no OTP, no backend call needed.
      // Always show the same message (no account enumeration).
      const firebaseAuth = getAuth();
      if (!firebaseAuth) throw new Error("unavailable");
      await sendPasswordResetEmail(firebaseAuth, email);

      form.style.display = "none";
      if (sub) sub.textContent = "Check your inbox for the reset link.";
      showSuccess(
        "If an account exists for that email, a password reset link has been sent. " +
        "Check your inbox (and spam folder)."
      );
    } catch (err) {
      // Firebase throws for invalid emails, but we show the generic message
      // for all errors to avoid user enumeration.
      form.style.display = "none";
      if (sub) sub.textContent = "Check your inbox for the reset link.";
      showSuccess(
        "If an account exists for that email, a password reset link has been sent."
      );
    } finally {
      btn.disabled = false;
      btn.innerHTML = orig;
    }
  });
});
