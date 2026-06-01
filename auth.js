// ---------------------------------------------------------------------------
// Client-side auth manager — Firebase Auth edition.
// Firebase is initialised lazily (not at module scope) so a Firebase error
// never crashes the page. All other modules can still import from this file.
// ---------------------------------------------------------------------------

import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  getIdToken,
} from "firebase/auth";

// ---------------------------------------------------------------------------
// API base URL — handles Live Server / file:// quirk (prevents 405 errors).
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

// ---------------------------------------------------------------------------
// Lazy Firebase init — called the first time auth is needed, not at import.
// ---------------------------------------------------------------------------
let _auth = null;

function getFirebaseAuth() {
  if (_auth) return _auth;
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    };
    // Avoid "duplicate app" error if module is hot-reloaded in Vite dev.
    const app = getApps().length
      ? getApps()[0]
      : initializeApp(firebaseConfig);
    _auth = getAuth(app);
  } catch (e) {
    console.error("[auth] Firebase init failed:", e.message);
    _auth = null;
  }
  return _auth;
}

// Export the auth instance for pages that need it (login.js, register.js…).
export { getAuth as getFirebaseAuth };
export function auth() {
  return getFirebaseAuth();
}

// ---------------------------------------------------------------------------
// Auth state (updated by onAuthStateChanged).
// ---------------------------------------------------------------------------
let _currentUser = null;

export function getUser() {
  if (!_currentUser) return null;
  return {
    uid: _currentUser.uid,
    id: _currentUser.uid,
    name:
      _currentUser.displayName ||
      _currentUser.email?.split("@")[0] ||
      "Donor",
    email: _currentUser.email,
    emailVerified: _currentUser.emailVerified,
    picture: _currentUser.photoURL,
  };
}

export function isAuthenticated() {
  return !!_currentUser;
}

// ---------------------------------------------------------------------------
// authHeader — returns Authorization: Bearer <id-token> for API calls.
// Async because getIdToken() is a network call (auto-refresh).
// ---------------------------------------------------------------------------
export async function authHeader() {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth || !_currentUser) return {};
  try {
    const token = await getIdToken(_currentUser, false);
    return { Authorization: "Bearer " + token };
  } catch (e) {
    return {};
  }
}

// ---------------------------------------------------------------------------
// Logout.
// ---------------------------------------------------------------------------
export async function logout() {
  const firebaseAuth = getFirebaseAuth();
  if (firebaseAuth) {
    try { await signOut(firebaseAuth); } catch (e) { /* ignore */ }
  }
  window.location.href = "home.html";
}

// ---------------------------------------------------------------------------
// Navbar rendering.
// ---------------------------------------------------------------------------
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]),
  );
}

function renderNavAuth() {
  const navEnd = document.querySelector(".nav-end");
  if (!navEnd) return;

  let slot = document.getElementById("authNavSlot");
  if (!slot) {
    slot = document.createElement("div");
    slot.id = "authNavSlot";
    slot.style.cssText = "display:flex;align-items:center;gap:10px";
    const donateBtn = navEnd.querySelector(".btn-donate");
    navEnd.insertBefore(slot, donateBtn || navEnd.firstChild);
  }

  const user = getUser();
  if (user) {
    slot.innerHTML =
      '<span class="nav-a" style="cursor:default;font-weight:600">Hi, ' +
      escapeHtml((user.name || "Donor").split(" ")[0]) +
      '</span><a href="#" class="nav-a" id="logoutLink">Logout</a>';
    document
      .getElementById("logoutLink")
      ?.addEventListener("click", (e) => { e.preventDefault(); logout(); });
  } else {
    slot.innerHTML = '<a href="login.html" class="nav-a" id="loginLink">Login</a>';
  }
}

function gateDonateLinks() {
  document.querySelectorAll('a[href="donate.html"]').forEach((a) => {
    a.setAttribute(
      "href",
      isAuthenticated() ? "donate.html" : "login.html?redirect=donate.html",
    );
  });
}

// ---------------------------------------------------------------------------
// initSiteAuth — called from home.js (runs on every page).
// ---------------------------------------------------------------------------
export function initSiteAuth() {
  const run = () => {
    // Render the navbar with whatever state we have right now (fast).
    renderNavAuth();
    gateDonateLinks();

    // Then subscribe to Firebase auth state changes (async).
    const firebaseAuth = getFirebaseAuth();
    if (firebaseAuth) {
      onAuthStateChanged(firebaseAuth, (firebaseUser) => {
        _currentUser = firebaseUser;
        renderNavAuth();
        gateDonateLinks();
      });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
}
