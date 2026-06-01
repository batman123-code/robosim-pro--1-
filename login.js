import { setSession, isAuthenticated, apiUrl } from "./auth.js";

const params = new URLSearchParams(window.location.search);
const redirectTo = params.get("redirect") || "home.html";

if (isAuthenticated()) window.location.href = redirectTo;

document.addEventListener("DOMContentLoaded", () => {
  const errorBox = document.getElementById("authError");
  const successBox = document.getElementById("authSuccess");
  const loginForm = document.getElementById("loginForm");
  const otpForm = document.getElementById("otpForm");
  const tabPassword = document.getElementById("tabPassword");
  const tabOtp = document.getElementById("tabOtp");

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

  // ── Method toggle ────────────────────────────────────────────────
  tabPassword.addEventListener("click", () => {
    tabPassword.classList.add("active");
    tabOtp.classList.remove("active");
    loginForm.style.display = "block";
    otpForm.style.display = "none";
    clearMsgs();
  });
  tabOtp.addEventListener("click", () => {
    tabOtp.classList.add("active");
    tabPassword.classList.remove("active");
    otpForm.style.display = "block";
    loginForm.style.display = "none";
    clearMsgs();
  });

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
  document.getElementById("guestLink").addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href =
      redirectTo === "home.html" ? "donate.html" : redirectTo;
  });

  // ── Password login ───────────────────────────────────────────────
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMsgs();
    const identifier = document.getElementById("identifier").value.trim();
    const password = document.getElementById("password").value;
    if (!identifier || !password)
      return showError("Please enter your email/phone and password.");

    await withLoading(document.getElementById("loginBtn"), "Logging in...", async () => {
      try {
        const { res, data } = await postJSON("/api/auth/login", {
          identifier,
          password,
        });
        if (res.status === 403 && data.requiresVerification) {
          // Account not verified — kick off verification.
          await postJSON("/api/auth/resend-otp", {
            identifier: data.identifier || identifier,
            purpose: "registration",
          });
          showSuccess(
            "Your account isn't verified. We've sent an OTP — check the registration page.",
          );
          setTimeout(
            () =>
              (window.location.href =
                "register.html?verify=" +
                encodeURIComponent(data.identifier || identifier)),
            1500,
          );
          return;
        }
        if (!res.ok || !data.success)
          throw new Error(data.message || "Login failed.");
        setSession(data.token, data.user);
        window.location.href = redirectTo;
      } catch (err) {
        showError(err.message);
      }
    });
  });

  // ── OTP login ────────────────────────────────────────────────────
  let otpSent = false;
  const otpBtn = document.getElementById("otpBtn");
  const otpCodeGroup = document.getElementById("otpCodeGroup");
  const otpResendWrap = document.getElementById("otpResendWrap");

  async function sendLoginOtp(identifier) {
    await postJSON("/api/auth/send-login-otp", { identifier });
    otpSent = true;
    otpCodeGroup.style.display = "block";
    otpResendWrap.style.display = "block";
    otpBtn.textContent = "Verify & Login";
    showSuccess("If an account exists, an OTP has been sent.");
  }

  otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMsgs();
    const identifier = document.getElementById("otpIdentifier").value.trim();
    if (!identifier) return showError("Please enter your email or phone.");

    if (!otpSent) {
      await withLoading(otpBtn, "Sending OTP...", async () => {
        try {
          await sendLoginOtp(identifier);
        } catch (err) {
          showError(err.message);
        }
      });
      return;
    }

    const otp = document.getElementById("otpCode").value.trim();
    if (!/^[0-9]{6}$/.test(otp)) return showError("Enter the 6-digit OTP.");
    await withLoading(otpBtn, "Verifying OTP...", async () => {
      try {
        const { res, data } = await postJSON("/api/auth/verify-login-otp", {
          identifier,
          otp,
        });
        if (!res.ok || !data.success)
          throw new Error(data.message || "Invalid OTP.");
        setSession(data.token, data.user);
        window.location.href = redirectTo;
      } catch (err) {
        showError(err.message);
      }
    });
  });

  document.getElementById("otpResend").addEventListener("click", async (e) => {
    e.preventDefault();
    clearMsgs();
    const identifier = document.getElementById("otpIdentifier").value.trim();
    try {
      await postJSON("/api/auth/resend-otp", { identifier, purpose: "login" });
      showSuccess("A new OTP has been sent.");
    } catch (err) {
      showError(err.message);
    }
  });
});
