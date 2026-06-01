/* ════════════════════════════════════════════
   ACT FOR CHANGE  —  HOME.JS
   Premium Homepage JavaScript
════════════════════════════════════════════ */

"use strict";

/* ── Auth (runs on every page that loads home.js) ── */
import { initSiteAuth } from "./auth.js";
initSiteAuth();

/* ── Loader ─────────────────────────────────── */
(function initLoader() {
  const loader = document.getElementById("loader");
  const fill = document.getElementById("loaderFill");
  if (!loader) return;

  let progress = 0;
  const tick = setInterval(() => {
    progress += Math.random() * 14 + 4;
    if (progress >= 100) {
      progress = 100;
      clearInterval(tick);
      setTimeout(() => {
        loader.classList.add("gone");
        document.body.style.overflow = "";
        triggerHeroReveal();
      }, 300);
    }
    fill.style.width = progress + "%";
  }, 80);

  document.body.style.overflow = "hidden";
})();

/* ── Custom Cursor — REMOVED. Native cursor restored for a trustworthy,
   accessible experience. (No mousemove/rAF loop runs anymore.) ── */
(function initCursor() {
  const cursor = document.getElementById("cursor");
  if (cursor) cursor.style.display = "none";
  return; // disabled

  // eslint-disable-next-line no-unreachable
  if (!cursor || window.matchMedia("(pointer:coarse)").matches) {
    if (cursor) cursor.style.display = "none";
    return;
  }
  let mx = -100,
    my = -100,
    cx = -100,
    cy = -100;
  document.addEventListener(
    "mousemove",
    (e) => {
      mx = e.clientX;
      my = e.clientY;
    },
    { passive: true },
  );

  (function animate() {
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    cursor.style.left = cx + "px";
    cursor.style.top = cy + "px";
    requestAnimationFrame(animate);
  })();

  document
    .querySelectorAll("a, button, .tilt-card, .gal-item, .kpin")
    .forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("expand"));
      el.addEventListener("mouseleave", () =>
        cursor.classList.remove("expand"),
      );
    });
})();

/* ── Scroll Progress ────────────────────────── */
(function initScrollBar() {
  const bar = document.getElementById("scrollBar");
  if (!bar) return;
  window.addEventListener(
    "scroll",
    () => {
      const pct =
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
        100;
      bar.style.width = pct + "%";
    },
    { passive: true },
  );
})();

/* ── Navbar ─────────────────────────────────── */
(function initNav() {
  const nav = document.getElementById("nav");
  const btn = document.getElementById("hamburger");
  const menu = document.getElementById("mobileNav");
  if (!nav) return;

  window.addEventListener(
    "scroll",
    () => {
      nav.classList.toggle("scrolled", window.scrollY > 60);
    },
    { passive: true },
  );

  if (btn && menu) {
    btn.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      btn.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
    });
    menu.querySelectorAll("[data-close]").forEach((a) => {
      a.addEventListener("click", () => {
        menu.classList.remove("open");
        btn.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        menu.setAttribute("aria-hidden", "true");
      });
    });
  }

  /* Active nav link on scroll */
  const sections = document.querySelectorAll("section[id], footer[id]");
  const links = document.querySelectorAll(".nav-a");
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.remove("active"));
          const active = document.querySelector(
            `.nav-a[href="#${e.target.id}"]`,
          );
          if (active) active.classList.add("active");
        }
      });
    },
    { threshold: 0.35 },
  );
  sections.forEach((s) => obs.observe(s));
})();

/* ── Hero Canvas Particles — REMOVED for a clean, professional look ── */

/* ── Hero Slideshow ─────────────────────────── */
(function initHeroSlideshow() {
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hdot");
  if (!slides.length) return;

  let current = 0;

  function goTo(index) {
    slides[current].classList.remove("hs-active");
    dots[current]?.classList.remove("active");
    current = (index + slides.length) % slides.length;
    slides[current].classList.add("hs-active");
    dots[current]?.classList.add("active");
  }

  dots.forEach((dot, i) =>
    dot.addEventListener("click", () => {
      clearInterval(timer);
      goTo(i);
      timer = setInterval(() => goTo(current + 1), 6000);
    }),
  );

  let timer = setInterval(() => goTo(current + 1), 6000);
})();

/* ── Hero Mouse Glow ────────────────────────── */
(function initHeroGlow() {
  const glow = document.getElementById("heroGlow");
  const hero = document.getElementById("hero");
  if (!glow || !hero) return;
  hero.addEventListener(
    "mousemove",
    (e) => {
      const r = hero.getBoundingClientRect();
      glow.style.left = e.clientX - r.left + "px";
      glow.style.top = e.clientY - r.top + "px";
    },
    { passive: true },
  );
})();

/* ── Hero Reveal ────────────────────────────── */
function triggerHeroReveal() {
  document.querySelectorAll(".hero .reveal").forEach((el) => {
    setTimeout(
      () => el.classList.add("in"),
      parseFloat(getComputedStyle(el).getPropertyValue("--d") || "0") * 1000,
    );
  });
}

/* ── Scroll Reveal ──────────────────────────── */
(function initReveal() {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  document
    .querySelectorAll(".reveal:not(.hero .reveal), .reveal-left")
    .forEach((el) => obs.observe(el));

  /* imc-bar fills are handled by CSS .imc.in selector */
})();

/* ── Animated Counters ──────────────────────── */
(function initCounters() {
  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el) {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    const dur = 1900;
    const start = performance.now();
    (function tick(now) {
      const t = Math.min((now - start) / dur, 1);
      const val = Math.floor(easeOut(t) * target);
      el.textContent = val + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else {
        el.textContent = target + suffix;
        /* Pulse glow when counter finishes */
        el.classList.add("counter-done");
        setTimeout(() => el.classList.remove("counter-done"), 800);
      }
    })(start);
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        /* Run counters for both original .ic-num and new .imc-count */
        e.target
          .querySelectorAll(".ic-num[data-count], .imc-count[data-count]")
          .forEach(animateCounter);
        obs.unobserve(e.target);
      });
    },
    { threshold: 0.2 },
  );

  const impactSec = document.querySelector(".impact-sec");
  if (impactSec) obs.observe(impactSec);
})();

/* ── Ripple Effect ──────────────────────────── */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".ripple");
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const el = document.createElement("span");
  el.className = "ripple-el";
  Object.assign(el.style, {
    width: size + "px",
    height: size + "px",
    left: e.clientX - rect.left - size / 2 + "px",
    top: e.clientY - rect.top - size / 2 + "px",
  });
  btn.appendChild(el);
  setTimeout(() => el.remove(), 700);
});

/* ── Magnetic Buttons ──────────────────────── */
(function initMagnetic() {
  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * 0.22;
      const dy = (e.clientY - r.top - r.height / 2) * 0.22;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
})();

/* ── Card Tilt — disabled for refined editorial feel ── */
(function initTilt() {
  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      card.style.boxShadow = "";
    });
  });
})();

/* ── Testimonial Slider ──────────────────────── */
(function initTestimonials() {
  const track = document.getElementById("testiTrack");
  const dots = document.getElementById("tDots");
  const prev = document.getElementById("tPrev");
  const next = document.getElementById("tNext");
  if (!track) return;

  const cards = track.querySelectorAll(".testi-card");
  const total = cards.length;
  let current = 0;
  let auto;

  /* Build dots */
  cards.forEach((_, i) => {
    const d = document.createElement("button");
    d.className = "tdot" + (i === 0 ? " active" : "");
    d.setAttribute("role", "tab");
    d.setAttribute("aria-label", `Testimonial ${i + 1}`);
    d.addEventListener("click", () => goTo(i));
    dots.appendChild(d);
  });

  function getVisible() {
    if (window.innerWidth > 1024) return 3;
    if (window.innerWidth > 768) return 2;
    return 1;
  }

  function goTo(idx) {
    const vis = getVisible();
    const max = Math.max(0, total - vis);
    current = Math.max(0, Math.min(idx, max));
    const itemW = track.querySelector(".testi-card").offsetWidth + 28;
    track.style.transform = `translateX(${-current * itemW}px)`;
    dots
      .querySelectorAll(".tdot")
      .forEach((d, i) => d.classList.toggle("active", i === current));
    clearInterval(auto);
    auto = setInterval(
      () => goTo(current + 1 > Math.max(0, total - vis) ? 0 : current + 1),
      5000,
    );
  }

  if (prev)
    prev.addEventListener("click", () =>
      goTo(current - 1 < 0 ? Math.max(0, total - getVisible()) : current - 1),
    );
  if (next) next.addEventListener("click", () => goTo(current + 1));

  auto = setInterval(
    () =>
      goTo(current + 1 > Math.max(0, total - getVisible()) ? 0 : current + 1),
    5000,
  );

  /* Swipe support */
  let sx;
  track.addEventListener(
    "touchstart",
    (e) => {
      sx = e.touches[0].clientX;
    },
    { passive: true },
  );
  track.addEventListener("touchend", (e) => {
    if (!sx) return;
    const dx = sx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) goTo(dx > 0 ? current + 1 : current - 1);
    sx = null;
  });

  window.addEventListener("resize", () => goTo(0), { passive: true });
})();

/* ── Kolkata Map ─────────────────────────────── */
(function initMap() {
  const popup = document.getElementById("mapPopup");
  const closeBtn = document.getElementById("popupClose");
  const locList = document.getElementById("locList");
  if (!popup) return;

  const fields = {
    name: document.getElementById("popName"),
    area: document.getElementById("popArea"),
    prog: document.getElementById("popProg"),
    fam: document.getElementById("popFam"),
    since: document.getElementById("popSince"),
  };

  function openPopup(pin) {
    if (fields.name) fields.name.textContent = pin.dataset.name || "";
    if (fields.area) fields.area.textContent = pin.dataset.area || "";
    if (fields.prog) fields.prog.textContent = pin.dataset.prog || "";
    if (fields.fam) fields.fam.textContent = pin.dataset.fam || "";
    if (fields.since) fields.since.textContent = pin.dataset.since || "";
    popup.classList.add("visible");
    document
      .querySelectorAll(".loc-item")
      .forEach((l) =>
        l.classList.toggle("active", l.dataset.pin === pin.dataset.name),
      );
    document
      .querySelectorAll(".kpin")
      .forEach((p) =>
        p.classList.toggle("kpin-active", p.dataset.name === pin.dataset.name),
      );
  }

  function closePopup() {
    popup.classList.remove("visible");
    document
      .querySelectorAll(".loc-item")
      .forEach((l) => l.classList.remove("active"));
    document
      .querySelectorAll(".kpin")
      .forEach((p) => p.classList.remove("kpin-active"));
  }

  document
    .querySelectorAll(".kpin")
    .forEach((pin) => pin.addEventListener("click", () => openPopup(pin)));
  if (closeBtn) closeBtn.addEventListener("click", closePopup);
  document.addEventListener("click", (e) => {
    if (
      popup.classList.contains("visible") &&
      !popup.contains(e.target) &&
      !e.target.closest(".kpin")
    )
      closePopup();
  });

  if (locList) {
    locList.querySelectorAll(".loc-item").forEach((item) => {
      item.addEventListener("click", () => {
        const pin = document.querySelector(
          `.kpin[data-name="${item.dataset.pin}"]`,
        );
        if (pin) openPopup(pin);
      });
    });
  }
})();

/* ── Floating Leaves (🍃🌿🍀) — REMOVED for a clean, professional look ── */

/* ── Parallax Blobs — REMOVED (decorative background motion) ── */

/* ── Smooth Scroll ──────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* ── Newsletter ─────────────────────────────── */
function handleNewsletter(e) {
  e.preventDefault();
  const inp = e.target.querySelector("input");
  const btn = e.target.querySelector("button");
  const orig = btn.textContent;
  btn.textContent = "✓ Subscribed!";
  inp.value = "";
  inp.placeholder = "Thanks for joining!";
  setTimeout(() => {
    btn.textContent = orig;
    inp.placeholder = "Your email address";
  }, 4000);
}
window.handleNewsletter = handleNewsletter;

/* ── Image Shine Sweep on Hover ─────────────── */
(function initShine() {
  const style = document.createElement("style");
  style.textContent = `
    .prog-img::after, .story-img::after, .about-main-img::after, .gal-item::after {
      content: '';
      position: absolute;
      top: 0; left: -110%; width: 60%; height: 100%;
      background: linear-gradient(105deg, transparent 30%, rgba(255,247,237,.18) 55%, transparent 70%);
      pointer-events: none;
      transition: left .7s ease;
    }
    .prog-card:hover .prog-img::after,
    .story-card:hover .story-img::after,
    .about-main-img:hover::after,
    .gal-item:hover::after {
      left: 140%;
    }
  `;
  document.head.appendChild(style);
})();

/* ═══════════════════════════════════════
   NEW SECTIONS JS
═══════════════════════════════════════ */

// 1. FAQ Accordion Population
const faqs = [
  "Why is Act For Change recognized as the best NGO in Kolkata to volunteer with?",
  "What makes Act For Change one of India's top NGOs for community impact?",
  "How can I contribute to educational programs as a volunteer?",
  "What disaster relief volunteer opportunities are available?",
  "What kind of volunteer training and support does Act For Change provide?",
  "Can international volunteers join Act For Change programs?",
  "What safety measures protect volunteers?",
  "What's the application process to volunteer?",
  "Which is the best NGO in Kolkata for social welfare and community development?",
  "Why is Act For Change considered one of the best NGOs in India?",
  "How can I volunteer with an NGO in Kolkata like Act For Change?",
  "What programs does Act For Change run to support communities?",
  "Is Act For Change among the top NGOs in Kolkata?",
  "How does Act For Change help underprivileged children in India?",
  "What makes Act For Change a trusted NGO in Kolkata?",
  "How does Act For Change support women's empowerment in India?",
  "Can international donors support Act For Change?",
  "How does Act For Change respond to disasters in West Bengal?",
  "How can I donate to one of the best NGOs in Kolkata?",
  "What impact has Act For Change created in West Bengal?",
  "Why should people support NGOs like Act For Change?",
];

const faqContainer = document.getElementById("faqAccordion");
if (faqContainer) {
  faqs.forEach((q, idx) => {
    const item = document.createElement("div");
    item.className = "faq-item";

    // For demo purposes, we will add a generic answer
    const ans =
      "Act For Change is dedicated to creating sustainable, long-term impact through grassroots actions. We prioritize transparency, community empowerment, and equitable access to resources, working closely with volunteers and partners to transform lives.";

    item.innerHTML =
      '<button class="faq-btn" aria-expanded="false"><span>' +
      q +
      '</span><div class="faq-icon"></div></button><div class="faq-content"><p class="faq-text">' +
      ans +
      "</p></div>";

    item.querySelector(".faq-btn").addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close all other
      faqContainer.querySelectorAll(".faq-item").forEach((el) => {
        el.classList.remove("active");
        el.querySelector(".faq-btn").setAttribute("aria-expanded", "false");
        el.querySelector(".faq-content").style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add("active");
        item.querySelector(".faq-btn").setAttribute("aria-expanded", "true");
        const content = item.querySelector(".faq-content");
        content.style.maxHeight = content.scrollHeight + 40 + "px";
      }
    });

    faqContainer.appendChild(item);
  });
}

// 2. Animated Counters
const counters = document.querySelectorAll(".impact-counter");
if (counters.length && window.IntersectionObserver) {
  const counterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const span = entry.target;
          const target = +span.getAttribute("data-target");
          let current = 0;
          const inc = target / 50;

          const update = () => {
            current += inc;
            if (current < target) {
              span.innerText = Math.ceil(current) + "+";
              requestAnimationFrame(update);
            } else {
              // Apply human formatting like 50K+
              let display =
                target >= 1000 ? target / 1000 + "K+" : target + "+";
              span.innerText = display;
            }
          };
          update();
          obs.unobserve(span);
        }
      });
    },
    { threshold: 0.5 },
  );

  counters.forEach((c) => counterObserver.observe(c));
}

/* ── Instagram Gallery Lightbox ── */
(function initIgGallery() {
  const IG_FALLBACK_URL = "https://www.instagram.com/actforchange.trust/";

  const galleryItems = document.querySelectorAll(".gallery-img-wrap");
  if (!galleryItems.length) return;

  const state = {
    currentIndex: 0,
    isOpen: false,
    items: [],
  };

  // Collect data
  galleryItems.forEach((item, index) => {
    item.dataset.index = index;
    const imgEl = item.querySelector("img");

    state.items.push({
      src: imgEl ? imgEl.src : "",
      url: item.dataset.igUrl || IG_FALLBACK_URL,
      caption: item.dataset.caption || "",
      likes: item.dataset.likes || "",
      date: item.dataset.date || "",
    });

    // Single click -> Open Lightbox
    item.addEventListener("click", (e) => {
      e.preventDefault();
      openLightbox(index);
    });

    // Double click -> Go to IG
    item.addEventListener("dblclick", (e) => {
      e.preventDefault();
      e.stopPropagation(); // prevent modal logic if double clicked fast enough
      window.open(item.dataset.igUrl || IG_FALLBACK_URL, "_blank");
    });

    // Add mobile long press support for going to IG
    let pressTimer;
    item.addEventListener(
      "touchstart",
      (e) => {
        pressTimer = window.setTimeout(function () {
          window.open(item.dataset.igUrl || IG_FALLBACK_URL, "_blank");
        }, 700);
      },
      { passive: true },
    );
    item.addEventListener(
      "touchend",
      (e) => {
        clearTimeout(pressTimer);
      },
      { passive: true },
    );
  });

  // Lightbox DOM Elements
  const lbOverlay = document.getElementById("igLightbox");
  if (!lbOverlay) return;

  const lbImg = document.getElementById("igLightboxImg");
  const lbCaption = document.getElementById("igLightboxCaption");
  const lbStats = document.getElementById("igLightboxStats");
  const lbDate = document.getElementById("igLightboxDateText");
  const lbViewBtn = document.getElementById("igLightboxViewBtn");

  const lbClose = document.getElementById("igLightboxClose");
  const lbPrev = document.getElementById("igLightboxPrev");
  const lbNext = document.getElementById("igLightboxNext");
  const lbBackdrop = document.getElementById("igLightboxBackdrop");

  function formatCaption(text) {
    if (!text) return "";
    // Turn hashtags into styled spans
    return text.replace(/#(\w+)/g, "<span>#$1</span>");
  }

  function updateLightbox(index) {
    if (index < 0) index = state.items.length - 1;
    if (index >= state.items.length) index = 0;
    state.currentIndex = index;

    const data = state.items[index];
    lbImg.src = data.src;
    lbCaption.innerHTML = formatCaption(data.caption);
    lbStats.textContent = data.likes ? `❤️ ${data.likes} likes` : "";
    lbDate.textContent = data.date ? ` • ${data.date}` : "";
    lbViewBtn.href = data.url;
  }

  function openLightbox(index) {
    updateLightbox(index);
    lbOverlay.classList.add("active");
    state.isOpen = true;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lbOverlay.classList.remove("active");
    state.isOpen = false;
    document.body.style.overflow = "";
  }

  // Event Listeners for Nav
  lbClose.addEventListener("click", closeLightbox);
  lbBackdrop.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", () =>
    updateLightbox(state.currentIndex - 1),
  );
  lbNext.addEventListener("click", () =>
    updateLightbox(state.currentIndex + 1),
  );

  // Keyboard nav
  document.addEventListener("keydown", (e) => {
    if (!state.isOpen) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") updateLightbox(state.currentIndex - 1);
    if (e.key === "ArrowRight") updateLightbox(state.currentIndex + 1);
  });
})();
