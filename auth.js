// ---------------------------------------------------------------------------
// Client-side auth manager (the vanilla equivalent of an AuthContext).
// - Stores the JWT + user in localStorage so login persists across refreshes.
// - Verifies the token against /api/auth/me on startup.
// - Renders a Login / user chip into the navbar on every page.
// - Gates Donate links: logged-out users go to login.html?redirect=donate.html
//   (login page offers a "Continue as guest" escape — guest fallback).
// ---------------------------------------------------------------------------

const TOKEN_KEY = "afc_token";
const USER_KEY = "afc_user";

// ---------------------------------------------------------------------------
// Resolve the API base URL.
// - Served by Vite (:3000) or in production → same origin ("") and /api is
//   proxied/handled there.
// - Served by a static-only dev server that returns 405 for POST (e.g. VS Code
//   Live Server :5500) or from a file:// path → talk to the Express backend
//   directly on :3001 (CORS is enabled server-side).
// This is what prevents the "405 Method Not Allowed" on POST /api/* calls.
// ---------------------------------------------------------------------------
export function apiBase() {
  if (typeof window === "undefined") return "";
  const { protocol, port } = window.location;
  if (protocol === "file:") return "http://localhost:3001";
  const staticDevPorts = ["5500", "5501", "5502", "8080", "8000"];
  if (staticDevPorts.includes(port)) return "http://localhost:3001";
  return ""; // same-origin (Vite dev proxy or production)
}

export function apiUrl(path) {
  return apiBase() + path;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch (e) {
    return null;
  }
}

export function isAuthenticated() {
  return !!getToken();
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Authorization header helper for authenticated fetch calls.
export function authHeader() {
  const t = getToken();
  return t ? { Authorization: "Bearer " + t } : {};
}

// Confirm the stored token is still valid; refresh the cached user.
// Clears the session if the token is missing/expired/invalid.
export async function verifySession() {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(apiUrl("/api/auth/me"), { headers: authHeader() });
    if (!res.ok) {
      clearSession();
      return null;
    }
    const data = await res.json();
    if (data && data.success && data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return data.user;
    }
    clearSession();
    return null;
  } catch (e) {
    // Network/backend down — keep the cached session, don't force logout.
    return getUser();
  }
}

export async function logout() {
  try {
    await fetch(apiUrl("/api/auth/logout"), {
      method: "POST",
      headers: authHeader(),
    });
  } catch (e) {
    /* ignore */
  }
  clearSession();
  window.location.href = "home.html";
}

// Inject a Login link or a user chip (with logout) into the navbar.
function renderNavAuth() {
  const navEnd = document.querySelector(".nav-end");
  if (!navEnd || document.getElementById("authNavSlot")) return;

  const slot = document.createElement("div");
  slot.id = "authNavSlot";
  slot.style.display = "flex";
  slot.style.alignItems = "center";
  slot.style.gap = "10px";

  const user = getUser();
  if (isAuthenticated() && user) {
    slot.innerHTML =
      '<span class="nav-a" style="cursor:default;font-weight:600">Hi, ' +
      escapeHtml((user.name || "Donor").split(" ")[0]) +
      '</span><a href="#" class="nav-a" id="logoutLink">Logout</a>';
  } else {
    slot.innerHTML = '<a href="login.html" class="nav-a" id="loginLink">Login</a>';
  }

  // Place the auth slot just before the Donate button.
  const donateBtn = navEnd.querySelector(".btn-donate");
  navEnd.insertBefore(slot, donateBtn || navEnd.firstChild);

  const logoutLink = document.getElementById("logoutLink");
  if (logoutLink)
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
}

// Gate every Donate link when the user is logged out.
function gateDonateLinks() {
  if (isAuthenticated()) return; // logged in → links work as-is
  document.querySelectorAll('a[href="donate.html"]').forEach((a) => {
    a.setAttribute("href", "login.html?redirect=donate.html");
  });
}

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

// Run site-wide. Called from home.js (loaded on every page).
export function initSiteAuth() {
  const run = () => {
    renderNavAuth();
    gateDonateLinks();
    // Re-validate the token in the background (persistent login check).
    verifySession();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
}
