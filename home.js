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

/* ── FAQ ScrollStack (React Bits → vanilla port) ─────────────────────────
   Faithful port of the ScrollStack `updateCardTransforms` algorithm:
   each card pins at `stackPosition` (offset by itemStackDistance·i) and
   scales toward `targetScale = baseScale + i·itemScale` (clamped ≤ 1 so the
   21 FAQ items don't grow). Driven by native window scroll + rAF — same
   visual result as the Lenis version without hijacking the whole page.
──────────────────────────────────────────────────────────────────────── */
(function initFaqScrollStack() {
  const faqs = [
    {
      q: "Why is Act For Change recognized as the best NGO in Kolkata to volunteer with?",
      a: "Act For Change has earned its reputation through over a decade of transparent, community-driven impact. We work directly with grassroots communities, ensuring every volunteer's contribution creates measurable, lasting change across education, healthcare, and environmental programs.",
    },
    {
      q: "How can I contribute to educational programs as a volunteer?",
      a: "Volunteers can join our teaching programs, mentor students, help organize learning camps, or contribute skills in areas like digital literacy and vocational training. We match your expertise with communities that need it most across Kolkata and West Bengal.",
    },
    {
      q: "What kind of volunteer training and support does Act For Change provide?",
      a: "All volunteers receive structured onboarding, program-specific training, a dedicated coordinator, and ongoing support throughout their engagement. We ensure you have the tools, context, and community to make your volunteer experience meaningful and safe.",
    },
    {
      q: "How can I donate to support Act For Change's mission?",
      a: "You can donate securely through our website via UPI, credit/debit card, net banking, or Razorpay. Every contribution — large or small — goes directly toward our programs. We publish transparent impact reports so you always know exactly how your donation is used.",
    },
  ];

  // ScrollStack props — tuned for 4 cards: strong stacking, smooth motion
  const PROPS = {
    itemDistance: 120,       // scroll distance before next card activates
    itemScale: 0.04,         // scale step per depth level
    itemStackDistance: 28,   // vertical offset between stacked cards
    stackPosition: "22%",    // where stacking begins
    scaleEndPosition: "12%", // where scaling completes
    baseScale: 0.88,         // scale of the deepest card
    rotationAmount: 0,
    blurAmount: 0,
  };

  const inner = document.getElementById("faqStackInner");
  if (!inner) return;

  // Build cards (accordion content inside each stack card)
  faqs.forEach((faq, idx) => {
    const card = document.createElement("div");
    card.className = "scroll-stack-card";
    card.innerHTML =
      `<button class="faq-q-btn" aria-expanded="false" id="faq-q-${idx}" aria-controls="faq-a-${idx}">` +
      `<span class="faq-q">${faq.q}</span><span class="faq-toggle" aria-hidden="true"></span></button>` +
      `<div class="faq-a-wrap" id="faq-a-${idx}" role="region" aria-labelledby="faq-q-${idx}">` +
      `<p class="faq-a">${faq.a}</p></div>`;

    card.querySelector(".faq-q-btn").addEventListener("click", () => {
      const isActive = card.classList.contains("active");
      inner.querySelectorAll(".scroll-stack-card").forEach((el) => {
        el.classList.remove("active");
        el.querySelector(".faq-q-btn").setAttribute("aria-expanded", "false");
        el.querySelector(".faq-a-wrap").style.maxHeight = null;
      });
      if (!isActive) {
        card.classList.add("active");
        card.querySelector(".faq-q-btn").setAttribute("aria-expanded", "true");
        const wrap = card.querySelector(".faq-a-wrap");
        wrap.style.maxHeight = wrap.scrollHeight + "px";
      }
    });

    inner.appendChild(card);
  });

  // Spacer so the last pin can release cleanly
  const end = document.createElement("div");
  end.className = "scroll-stack-end";
  inner.appendChild(end);

  const cards = Array.from(inner.querySelectorAll(".scroll-stack-card"));

  cards.forEach((card, i) => {
    if (i < cards.length - 1) card.style.marginBottom = PROPS.itemDistance + "px";
    card.style.willChange = "transform, filter";
    card.style.transformOrigin = "top center";
    card.style.backfaceVisibility = "hidden";
  });

  const parsePct = (val, h) =>
    typeof val === "string" && val.includes("%")
      ? (parseFloat(val) / 100) * h
      : parseFloat(val);

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const prog = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const offsetTop = (el) => el.getBoundingClientRect().top + window.scrollY;

  // Lerped (smoothed) values — each card has a current and target state
  const current = cards.map(() => ({ ty: 0, s: 1 }));
  const target  = cards.map(() => ({ ty: 0, s: 1 }));
  const LERP = 0.1; // smoothing factor — lower = silkier

  function computeTargets() {
    const scrollTop = window.scrollY;
    const vh = window.innerHeight;
    const stackPx = parsePct(PROPS.stackPosition, vh);
    const scaleEndPx = parsePct(PROPS.scaleEndPosition, vh);
    const endTop = offsetTop(end);
    const pinEnd = endTop - vh / 2;

    cards.forEach((card, i) => {
      const cardTop = offsetTop(card);
      const triggerStart = cardTop - stackPx - PROPS.itemStackDistance * i;
      const triggerEnd   = cardTop - scaleEndPx;
      const pinStart     = triggerStart;

      const scaleProg  = prog(scrollTop, triggerStart, triggerEnd);
      const targetScale = PROPS.baseScale + i * PROPS.itemScale; // ≤ 1 for 4 cards
      const s = 1 - scaleProg * (1 - targetScale);

      let ty = 0;
      if (scrollTop >= pinStart && scrollTop <= pinEnd) {
        ty = scrollTop - cardTop + stackPx + PROPS.itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        ty = pinEnd - cardTop + stackPx + PROPS.itemStackDistance * i;
      }

      target[i].ty = ty;
      target[i].s  = s;
    });
  }

  let rafId = null;
  function loop() {
    computeTargets();

    let dirty = false;
    cards.forEach((card, i) => {
      const c = current[i], t = target[i];
      c.ty += (t.ty - c.ty) * LERP;
      c.s  += (t.s  - c.s)  * LERP;

      const tyR = Math.round(c.ty * 10) / 10;
      const sR  = Math.round(c.s  * 1000) / 1000;

      card.style.transform = `translate3d(0, ${tyR}px, 0) scale(${sR})`;
      if (Math.abs(t.ty - c.ty) > 0.05 || Math.abs(t.s - c.s) > 0.0005) dirty = true;
    });

    // Keep looping while values are still converging (no idle rAF waste)
    rafId = requestAnimationFrame(loop);
    if (!dirty && !scrolling) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  let scrolling = false;
  let scrollTimer;
  window.addEventListener("scroll", () => {
    scrolling = true;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => { scrolling = false; }, 150);
    if (!rafId) rafId = requestAnimationFrame(loop);
  }, { passive: true });

  window.addEventListener("resize", () => {
    current.forEach((c) => { c.ty = 0; c.s = 1; });
    if (!rafId) rafId = requestAnimationFrame(loop);
  }, { passive: true });

  // Initial run (starts the lerp loop)
  rafId = requestAnimationFrame(loop);
})();

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
