import { auth, apiUrl } from "./auth.js";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";

const params = new URLSearchParams(window.location.search);
const redirectTo = params.get("redirect") || "home.html";

const _a = auth();
if (_a) onAuthStateChanged(_a, (user) => {
  if (user && user.emailVerified) window.location.href = redirectTo;
});

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
  const verifySection = document.getElementById("verifySection");
  const errorBox = document.getElementById("authError");
  const successBox = document.getElementById("authSuccess");
  const btn = document.getElementById("registerBtn");
  const pwInput = document.getElementById("password");
  const pwBar = document.getElementById("pwBar");
  const pwHint = document.getElementById("pwHint");

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

  document.querySelectorAll(".pw-toggle").forEach((t) => {
    t.addEventListener("click", () => {
      const input = document.getElementById(t.dataset.target);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      t.textContent = show ? "Hide" : "Show";
    });
  });

  pwInput?.addEventListener("input", () => {
    const pw = pwInput.value;
    const passed = 5 - passwordIssues(pw).length;
    const colors = ["#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#27ae60"];
    if (pwBar) {
      pwBar.style.width = (passed / 5) * 100 + "%";
      pwBar.style.background = pw ? colors[Math.max(0, passed - 1)] : "#eee";
    }
    if (pwHint) {
      const issues = passwordIssues(pw);
      pwHint.textContent = issues.length
        ? "Needs " + issues.join(", ") + "."
        : "Strong password ✓";
    }
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.style.display = "none";
    successBox.style.display = "none";

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = pwInput.value;
    const confirm = document.getElementById("confirm").value;

    if (!name) return showError("Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return showError("Please enter a valid email address.");
    const issues = passwordIssues(password);
    if (issues.length) return showError("Password must contain " + issues.join(", ") + ".");
    if (password !== confirm) return showError("Passwords do not match.");

    btn.disabled = true;
    const orig = btn.innerHTML;
    btn.innerHTML = '<span class="btn-spinner"></span>Creating account...';

    try {
      // Create the account in Firebase Auth.
      const firebaseAuth = auth();
      if (!firebaseAuth) throw new Error("Auth service unavailable. Please refresh.");
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);

      // Save the display name (shown in the navbar greeting).
      await updateProfile(cred.user, { displayName: name });

      // Send email verification — user must confirm before they can log in.
      await sendEmailVerification(cred.user);

      // Hide the form and show the "check your email" state.
      form.style.display = "none";
      if (verifySection) verifySection.style.display = "block";
      showSuccess(
        `Verification email sent to ${email}. ` +
        "Click the link in the email, then log in."
      );
    } catch (err) {
      showError(friendlyFirebaseError(err.code));
      btn.disabled = false;
      btn.innerHTML = orig;
    }
  });
});

function friendlyFirebaseError(code) {
  const map = {
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password is too weak — use 8+ characters.",
    "auth/network-request-failed": "Network error. Please check your connection.",
  };
  return map[code] || "Registration failed. Please try again.";
}
