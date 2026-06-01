import { apiUrl } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  // Counters Animation
  const statVals = document.querySelectorAll(".stat-counter");

  if (statVals.length > 0) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute("data-target"), 10);

            let current = 0;
            const duration = 2000;
            const stepTime = Math.max(16, duration / target);
            const increment = Math.max(1, Math.ceil(target / (duration / 16)));

            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              el.innerText = current.toLocaleString();
            }, stepTime);

            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.5 },
    );

    statVals.forEach((val) => observer.observe(val));
  }

  // Reaction System
  const reactionBtns = document.querySelectorAll(".reaction-btn");
  reactionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const isReacted = btn.classList.contains("reacted");
      const countEl = btn.querySelector(".count");
      let count = parseInt(btn.getAttribute("data-count"), 10);

      if (isReacted) {
        btn.classList.remove("reacted");
        countEl.innerText = count;
      } else {
        btn.classList.add("reacted");
        countEl.innerText = count + 1;
      }
    });
  });

  // ── Instagram feed (auto-synced from /api/events) ──────────────────────
  initInstagramFeed();
});

function escapeHtml(s) {
  return String(s || "").replace(
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

function formatDate(ts) {
  const d = new Date(ts);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function truncate(text, n) {
  const t = String(text || "").trim();
  return t.length > n ? t.slice(0, n).trim() + "…" : t;
}

async function initInstagramFeed() {
  const grid = document.getElementById("igFeed");
  const stateEl = document.getElementById("igState");
  if (!grid) return;

  const showState = (msg) => {
    grid.style.display = "none";
    stateEl.style.display = "block";
    stateEl.textContent = msg;
  };

  let data;
  try {
    console.log("[events] Fetching Instagram posts from /api/events…");
    const res = await fetch(apiUrl("/api/events"));
    if (!res.ok) throw new Error("bad status");
    data = await res.json();
  } catch (e) {
    console.error("[events] Failed to load events:", e);
    showState("Unable to load latest events.");
    return;
  }

  const events = (data && data.events) || [];
  console.log("[events] Posts received:", events.length, "| sync status:", data.status);
  if (!events.length) {
    // No cached posts yet (token not configured, or first sync pending).
    showState(
      "No events available yet. Follow @actforchange.trust on Instagram for the latest updates.",
    );
    return;
  }

  // Newest first (the API already sorts, but be safe).
  events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  grid.innerHTML = events
    .map((post) => {
      const caption = escapeHtml(truncate(post.caption, 140));
      const date = formatDate(post.timestamp);
      const link = escapeHtml(post.permalink || "#");
      const img = escapeHtml(post.imageUrl || "");
      const carousel = post.isCarousel
        ? '<span class="ig-badge" title="Multiple images">▣</span>'
        : "";
      return `
      <article class="ev-insta-card reveal">
        <a class="ev-insta-imgwrap" href="${link}" target="_blank" rel="noopener">
          <img src="${img}" alt="Instagram post" loading="lazy"
               onerror="this.closest('.ev-insta-card').style.display='none'" />
          ${carousel}
        </a>
        <div class="ev-insta-body">
          <div class="ev-insta-date">${date}</div>
          <p class="ev-insta-caption">${caption || "View this post on Instagram."}</p>
          <a class="btn btn-outline ev-insta-btn" href="${link}" target="_blank" rel="noopener">
            View on Instagram
          </a>
        </div>
      </article>`;
    })
    .join("");
}
