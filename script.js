/* ==============================================
   ACT FOR CHANGE — script.js (v2 Premium)
   ============================================== */

"use strict";

/* ── Loader ──────────────────────────────────── */
const loader = document.getElementById("loader");
const loaderBar = document.getElementById("loaderBar");
let loaderPct = 0;

const loaderInterval = setInterval(() => {
  loaderPct = Math.min(loaderPct + Math.random() * 18, 95);
  loaderBar.style.width = loaderPct + "%";
}, 80);

window.addEventListener("load", () => {
  clearInterval(loaderInterval);
  loaderBar.style.width = "100%";
  setTimeout(() => loader.classList.add("done"), 500);
});

/* ── Theme Toggle ────────────────────────────── */
const themeToggle = document.getElementById("themeToggle");
const html = document.documentElement;

const savedTheme = localStorage.getItem("afc-theme") || "light";
html.setAttribute("data-theme", savedTheme);

themeToggle.addEventListener("click", () => {
  const current = html.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  localStorage.setItem("afc-theme", next);
});

/* ── Navbar ──────────────────────────────────── */
const navbar = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

window.addEventListener(
  "scroll",
  () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
    updateScrollProgress();
    updateTimelineLine();
  },
  { passive: true },
);

hamburger.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  hamburger.classList.toggle("open", open);
  hamburger.setAttribute("aria-expanded", String(open));
});

navLinks.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  });
});

/* ── Scroll Progress ─────────────────────────── */
const progressBar = document.getElementById("scrollProgressBar");

function updateScrollProgress() {
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
  progressBar.style.width = pct + "%";
}

/* ── Cursor ──────────────────────────────────── */
const cursorGlow = document.getElementById("cursorGlow");
const cursorDot = document.getElementById("cursorDot");

if (window.matchMedia("(pointer:fine)").matches) {
  document.addEventListener(
    "mousemove",
    (e) => {
      cursorGlow.style.left = e.clientX + "px";
      cursorGlow.style.top = e.clientY + "px";
      cursorDot.style.left = e.clientX + "px";
      cursorDot.style.top = e.clientY + "px";
    },
    { passive: true },
  );

  document
    .querySelectorAll("a, button, .gal-item, .tilt-card")
    .forEach((el) => {
      el.addEventListener("mouseenter", () =>
        cursorDot.classList.add("expand"),
      );
      el.addEventListener("mouseleave", () =>
        cursorDot.classList.remove("expand"),
      );
    });
}

/* ── Particle Canvas ─────────────────────────── */
const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas, { passive: true });

class Particle {
  constructor() {
    this.reset(true);
  }

  reset(init = false) {
    this.x = Math.random() * canvas.width;
    this.y = init ? Math.random() * canvas.height : canvas.height + 10;
    this.size = Math.random() * 2.5 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = -(Math.random() * 0.6 + 0.2);
    this.opacity = Math.random() * 0.4 + 0.05;
    this.color = Math.random() > 0.5 ? "#C8561A" : "#E8906A";
    this.life = 1;
    this.decay = Math.random() * 0.004 + 0.002;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= this.decay;
    if (this.life <= 0 || this.y < -10) this.reset();
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity * this.life;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const particles = Array.from({ length: 70 }, () => new Particle());

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p) => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* ── Scroll Reveal ───────────────────────────── */
const revealEls = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseFloat(el.dataset.delay || 0);
      el.style.setProperty("--delay", delay + "s");
      el.classList.add("visible");
      revealObserver.unobserve(el);
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
);

revealEls.forEach((el) => revealObserver.observe(el));

/* ── Impact Counters ─────────────────────────── */
function formatNum(n, target) {
  if (target >= 100000) return Math.floor(n / 1000) + "K";
  if (target >= 10000) return Math.floor(n / 1000) + (n >= 10000 ? "K" : "");
  return Math.floor(n).toString();
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2200;
  let start = null;

  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = formatNum(eased * target, target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = formatNum(target, target);
  }
  requestAnimationFrame(step);
}

/* ── SVG Ring Animation ──────────────────────── */
function animateRing(circle) {
  const pct = parseFloat(circle.dataset.pct) / 100;
  const r = parseFloat(circle.getAttribute("r"));
  const circumf = 2 * Math.PI * r;
  const offset = circumf * (1 - pct);
  circle.style.strokeDasharray = circumf;
  circle.style.strokeDashoffset = circumf;

  /* Gradient for ring */
  const svgId = "ringGrad_" + Math.random().toString(36).slice(2);
  const svg = circle.closest("svg");
  const defs =
    svg.querySelector("defs") ||
    svg.insertBefore(
      document.createElementNS("http://www.w3.org/2000/svg", "defs"),
      svg.firstChild,
    );
  const grad = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "linearGradient",
  );
  grad.setAttribute("id", svgId);
  grad.innerHTML = `<stop offset="0%" stop-color="#C8561A"/><stop offset="100%" stop-color="#E8906A"/>`;
  defs.appendChild(grad);
  circle.setAttribute("stroke", `url(#${svgId})`);

  setTimeout(() => {
    circle.style.strokeDashoffset = offset;
  }, 120);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      const num = card.querySelector(".ic-num");
      const ring = card.querySelector(".ic-ring-fill");
      if (num) animateCounter(num);
      if (ring) animateRing(ring);
      counterObserver.unobserve(card);
    });
  },
  { threshold: 0.4 },
);

document
  .querySelectorAll(".impact-card")
  .forEach((c) => counterObserver.observe(c));

/* ── Timeline Progress ───────────────────────── */
const tlProgress = document.getElementById("tlProgress");
const tlSection = document.getElementById("timeline");

function updateTimelineLine() {
  if (!tlProgress || !tlSection) return;
  const rect = tlSection.getBoundingClientRect();
  const visible = Math.max(
    0,
    Math.min(1, -rect.top / (rect.height - window.innerHeight)),
  );
  tlProgress.style.height = visible * 100 + "%";

  /* Activate dots */
  document.querySelectorAll(".tl-item").forEach((item) => {
    const r = item.querySelector(".tl-dot");
    if (!r) return;
    const dotR = r.getBoundingClientRect();
    if (dotR.top < window.innerHeight * 0.75) {
      item.classList.add("visible");
    }
  });
}

/* ── Testimonial Slider ──────────────────────── */
const tslTrack = document.getElementById("tslTrack");
const tslDots = document.getElementById("tslDots");
const tslPrev = document.getElementById("tslPrev");
const tslNext = document.getElementById("tslNext");
const slides = document.querySelectorAll(".tsl-slide");

let tslCurrent = 0;
let tslAuto;

slides.forEach((_, i) => {
  const dot = document.createElement("button");
  dot.className = "tsl-dot" + (i === 0 ? " active" : "");
  dot.setAttribute("role", "tab");
  dot.setAttribute("aria-label", `Testimonial ${i + 1}`);
  dot.setAttribute("aria-selected", String(i === 0));
  dot.addEventListener("click", () => {
    clearInterval(tslAuto);
    goToSlide(i);
    startAuto();
  });
  tslDots.appendChild(dot);
});

function goToSlide(idx) {
  tslCurrent = (idx + slides.length) % slides.length;
  tslTrack.style.transform = `translateX(-${tslCurrent * 100}%)`;
  tslDots.querySelectorAll(".tsl-dot").forEach((d, i) => {
    d.classList.toggle("active", i === tslCurrent);
    d.setAttribute("aria-selected", String(i === tslCurrent));
  });
}

function startAuto() {
  tslAuto = setInterval(() => goToSlide(tslCurrent + 1), 5500);
}

tslNext.addEventListener("click", () => {
  clearInterval(tslAuto);
  goToSlide(tslCurrent + 1);
  startAuto();
});
tslPrev.addEventListener("click", () => {
  clearInterval(tslAuto);
  goToSlide(tslCurrent - 1);
  startAuto();
});
tslTrack.addEventListener("mouseenter", () => clearInterval(tslAuto));
tslTrack.addEventListener("mouseleave", startAuto);

let tslTouchX = 0;
tslTrack.addEventListener(
  "touchstart",
  (e) => {
    tslTouchX = e.touches[0].clientX;
  },
  { passive: true },
);
tslTrack.addEventListener("touchend", (e) => {
  const diff = tslTouchX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 45) {
    clearInterval(tslAuto);
    goToSlide(tslCurrent + (diff > 0 ? 1 : -1));
    startAuto();
  }
});

startAuto();

/* ── Gallery Lightbox ────────────────────────── */
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCap = document.getElementById("lbCaption");
const lbClose = document.getElementById("lbClose");
const lbPrev = document.getElementById("lbPrev");
const lbNext = document.getElementById("lbNext");

const galleryItems = [...document.querySelectorAll(".gal-item[data-src]")];
let lbIndex = 0;

function openLb(idx) {
  lbIndex = idx;
  const item = galleryItems[idx];
  lbImg.src = item.dataset.src;
  lbCap.textContent = item.dataset.caption || "";
  lightbox.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  lbImg.setAttribute("alt", item.dataset.caption || "");
}

function closeLb() {
  lightbox.classList.add("hidden");
  document.body.style.overflow = "";
}

galleryItems.forEach((item, i) => {
  item.addEventListener("click", () => openLb(i));
  item.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLb(i);
    }
  });
});

lbClose.addEventListener("click", closeLb);
document.getElementById("lightboxBackdrop").addEventListener("click", closeLb);
lbNext.addEventListener("click", () =>
  openLb((lbIndex + 1) % galleryItems.length),
);
lbPrev.addEventListener("click", () =>
  openLb((lbIndex - 1 + galleryItems.length) % galleryItems.length),
);

document.addEventListener("keydown", (e) => {
  if (lightbox.classList.contains("hidden")) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowRight") openLb((lbIndex + 1) % galleryItems.length);
  if (e.key === "ArrowLeft")
    openLb((lbIndex - 1 + galleryItems.length) % galleryItems.length);
});

/* ── Card Tilt — disabled for refined editorial feel ── */
document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

/* ── Magnetic Buttons ────────────────────────── */
document.querySelectorAll(".magnetic").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.22;
    const dy = (e.clientY - cy) * 0.22;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
  });
});

/* ── Ripple Effect ───────────────────────────── */
document.querySelectorAll(".ripple").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.2;
    const ripple = document.createElement("span");
    ripple.style.cssText = `
      position:absolute; border-radius:50%; pointer-events:none;
      width:${size}px; height:${size}px;
      left:${e.clientX - rect.left - size / 2}px;
      top:${e.clientY - rect.top - size / 2}px;
      background:rgba(255,255,255,.28);
      transform:scale(0); animation:rippleKF .65s ease-out forwards;
    `;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});

/* Inject ripple keyframe */
const rippleStyle = document.createElement("style");
rippleStyle.textContent =
  "@keyframes rippleKF { to { transform: scale(1); opacity: 0; } }";
document.head.appendChild(rippleStyle);

/* ── Kolkata Impact Map ──────────────────────── */
(function initKolkataMap() {
  const popup = document.getElementById("kmapPopup");
  const closeBtn = document.getElementById("kmapClose");
  if (!popup) return;

  const fields = {
    name: document.getElementById("kpopName"),
    area: document.getElementById("kpopArea"),
    programs: document.getElementById("kpopPrograms"),
    families: document.getElementById("kpopFamilies"),
    since: document.getElementById("kpopSince"),
  };

  function openPopup(pin) {
    if (!fields.name) return;
    fields.name.textContent = pin.dataset.name || "";
    fields.area.textContent = pin.dataset.area || "";
    fields.programs.textContent = pin.dataset.programs || "";
    fields.families.textContent = pin.dataset.families || "";
    fields.since.textContent = pin.dataset.since || "";
    popup.classList.add("kmap-popup--visible");

    /* Highlight corresponding zone item */
    document.querySelectorAll(".kzone-item").forEach((z) => {
      z.classList.toggle("kzone-active", z.dataset.pin === pin.dataset.name);
    });

    /* Pulse the active pin */
    document.querySelectorAll(".kmap-pin").forEach((p) => {
      p.classList.toggle("kpin-active", p.dataset.name === pin.dataset.name);
    });
  }

  function closePopup() {
    popup.classList.remove("kmap-popup--visible");
    document
      .querySelectorAll(".kzone-item")
      .forEach((z) => z.classList.remove("kzone-active"));
    document
      .querySelectorAll(".kmap-pin")
      .forEach((p) => p.classList.remove("kpin-active"));
  }

  /* Pin clicks */
  document.querySelectorAll(".kmap-pin").forEach((pin) => {
    pin.style.cursor = "pointer";
    pin.addEventListener("click", () => openPopup(pin));
  });

  /* Close button */
  if (closeBtn) closeBtn.addEventListener("click", closePopup);

  /* Click outside popup to close */
  document.addEventListener("click", (e) => {
    if (
      popup.classList.contains("kmap-popup--visible") &&
      !popup.contains(e.target) &&
      !e.target.closest(".kmap-pin")
    ) {
      closePopup();
    }
  });

  /* Zone list → highlight pin */
  document.querySelectorAll(".kzone-item").forEach((zone) => {
    zone.addEventListener("click", () => {
      const targetPin = document.querySelector(
        `.kmap-pin[data-name="${zone.dataset.pin}"]`,
      );
      if (targetPin) openPopup(targetPin);
    });
  });
})();

/* ── Floating Leaf Particles ─────────────────── */
(function initLeafParticles() {
  const leaves = ["🍃", "🌿", "🍀"];
  const container = document.body;
  let lastSpawn = 0;

  function spawnLeaf() {
    const el = document.createElement("span");
    el.className = "leaf-particle";
    el.textContent = leaves[Math.floor(Math.random() * leaves.length)];
    const size = 14 + Math.random() * 12;
    const startX = Math.random() * 100;
    const dur = 7 + Math.random() * 6;
    const delay = Math.random() * 2;
    const drift = (Math.random() - 0.5) * 120;
    el.style.cssText = `
      left:${startX}vw;
      font-size:${size}px;
      animation-duration:${dur}s;
      animation-delay:${delay}s;
      --drift:${drift}px;
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), (dur + delay + 1) * 1000);
  }

  /* Spawn a leaf every ~3s, max 6 at a time */
  setInterval(() => {
    if (document.querySelectorAll(".leaf-particle").length < 6) spawnLeaf();
  }, 3000);

  /* Initial burst */
  for (let i = 0; i < 3; i++) setTimeout(spawnLeaf, i * 800);
})();

/* ── Donut Chart ─────────────────────────────── */
function drawDonut() {
  const canvas = document.getElementById("donutChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = 110;
  const lineW = 22;

  const segments = [
    { pct: 0.88, color: "#C8561A" },
    { pct: 0.07, color: "#E8906A" },
    { pct: 0.05, color: "#F5D5C0" },
  ];

  let start = -Math.PI / 2;
  const gap = 0.04;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* Background ring */
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(44,32,24,0.08)";
  ctx.lineWidth = lineW;
  ctx.stroke();

  segments.forEach((seg) => {
    const angle = seg.pct * Math.PI * 2 - gap;
    ctx.beginPath();
    ctx.arc(cx, cy, r, start + gap / 2, start + angle + gap / 2);
    ctx.strokeStyle = seg.color;
    ctx.lineWidth = lineW;
    ctx.lineCap = "round";
    ctx.shadowColor = seg.color;
    ctx.shadowBlur = 8;
    ctx.stroke();
    start += seg.pct * Math.PI * 2;
  });
}

const donutObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      drawDonut();
      donutObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.4 },
);

const donutWrap = document.querySelector(".donut-wrap");
if (donutWrap) donutObserver.observe(donutWrap);

/* ── Report Bars ─────────────────────────────── */
const barObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll(".rb-fill").forEach((fill) => {
        fill.style.width = fill.dataset.w + "%";
      });
      barObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.3 },
);

const rbList = document.querySelector(".rb-list");
if (rbList) barObserver.observe(rbList);

/* ── Smooth Scroll ───────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* ── Newsletter ──────────────────────────────── */
function handleNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector("input");
  const btn = e.target.querySelector("button");
  btn.textContent = "✓";
  input.value = "";
  input.placeholder = "Thank you for subscribing!";
  setTimeout(() => {
    btn.textContent = "→";
    input.placeholder = "Your email address";
  }, 3000);
}
window.handleNewsletter = handleNewsletter;

/* ── Hero Title Word Reveal ──────────────────── */
function initHeroReveal() {
  document.querySelectorAll(".ht-line").forEach((line, i) => {
    line.style.opacity = "0";
    line.style.transform = "translateY(40px)";
    line.style.transition = `opacity .8s ease ${0.2 + i * 0.22}s, transform .8s ease ${0.2 + i * 0.22}s`;
  });
}

window.addEventListener("load", () => {
  initHeroReveal();
  setTimeout(() => {
    document.querySelectorAll(".ht-line").forEach((line) => {
      line.style.opacity = "1";
      line.style.transform = "none";
    });
  }, 300);
});

/* ── Parallax Blobs ──────────────────────────── */
window.addEventListener(
  "scroll",
  () => {
    const y = window.scrollY;
    const blobs = document.querySelectorAll(".hblob");
    blobs.forEach((b, i) => {
      const speed = 0.08 + i * 0.04;
      b.style.transform = `translateY(${y * speed}px)`;
    });
  },
  { passive: true },
);

/* ── Impact Network — node interactions + line highlight ── */
(function initImpactNetwork() {
  const nodes = document.querySelectorAll(".inet-node");
  const lines = document.querySelectorAll(".inet-l");
  if (!nodes.length) return;

  let openNode = null;
  const isMobile = () => window.innerWidth <= 620;

  function setActiveLine(idx) {
    lines.forEach((l) => l.classList.remove("inet-active"));
    if (idx == null) return;
    lines.forEach((l) => {
      if (l.dataset.idx == idx) l.classList.add("inet-active");
    });
  }

  nodes.forEach((node) => {
    const idx = node.dataset.idx;

    node.addEventListener("mouseenter", () => {
      if (!isMobile()) setActiveLine(idx);
    });
    node.addEventListener("mouseleave", () => {
      if (!isMobile()) setActiveLine(null);
    });
    node.addEventListener("focus", () => setActiveLine(idx));
    node.addEventListener("blur", () => setActiveLine(null));

    node.addEventListener("click", (e) => {
      if (isMobile()) return;
      e.stopPropagation();
      if (openNode && openNode !== node) openNode.classList.remove("inn-open");
      const isOpen = node.classList.toggle("inn-open");
      openNode = isOpen ? node : null;
      setActiveLine(isOpen ? idx : null);
    });

    node.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        node.classList.remove("inn-open");
        if (openNode === node) {
          openNode = null;
          setActiveLine(null);
        }
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".inet-node") && openNode) {
      openNode.classList.remove("inn-open");
      openNode = null;
      setActiveLine(null);
    }
  });
})();
