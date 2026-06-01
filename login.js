import { auth, isAuthenticated, apiUrl } from "./auth.js";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";

const params = new URLSearchParams(window.location.search);
const redirectTo = params.get("redirect") || "home.html";

// Redirect if already signed in.
const _a = auth();
if (_a) onAuthStateChanged(_a, (user) => {
  if (user && user.emailVerified) window.location.href = redirectTo;
});

document.addEventListener("DOMContentLoaded", () => {
  const errorBox = document.getElementById("authError");
  const successBox = document.getElementById("authSuccess");
  const loginForm = document.getElementById("loginForm");

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
    const orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="btn-spinner"></span>${text}`;
    try { await fn(); } finally { btn.disabled = false; btn.innerHTML = orig; }
  };

  // Show/hide password
  document.querySelectorAll(".pw-toggle").forEach((t) => {
    t.addEventListener("click", () => {
      const input = document.getElementById(t.dataset.target);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      t.textContent = show ? "Hide" : "Show";
    });
  });

  // Continue as guest
  document.getElementById("guestLink")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = redirectTo === "home.html" ? "donate.html" : redirectTo;
  });

  // ── Password sign-in via Firebase ────────────────────────────────
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMsgs();
    const email = document.getElementById("identifier").value.trim();
    const password = document.getElementById("password").value;
    if (!email || !password) return showError("Please enter your email and password.");

    await withLoading(document.getElementById("loginBtn"), "Logging in...", async () => {
      try {
        const cred = await signInWithEmailAndPassword(auth(), email, password);

        // Block unverified accounts and re-send the verification email.
        if (!cred.user.emailVerified) {
          await sendEmailVerification(cred.user);
          showSuccess(
            "Please verify your email before signing in. " +
            "We've sent a new verification link — check your inbox."
          );
          return;
        }

        window.location.href = redirectTo;
      } catch (err) {
        showError(friendlyFirebaseError(err.code));
      }
    });
  });
});

// Map Firebase error codes to user-friendly messages.
function friendlyFirebaseError(code) {
  const map = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Please check your connection.",
  };
  return map[code] || "Login failed. Please try again.";
}
