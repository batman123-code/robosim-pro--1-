const fs = require("fs");
const files = fs.readdirSync(".").filter((f) => f.endsWith(".html"));

const baseHtml = fs.readFileSync("awards-and-certificates.html", "utf8");

const headStart = baseHtml.indexOf("<head>");
const headEnd = baseHtml.indexOf("</head>") + 7;
let headHtml = baseHtml
  .substring(headStart, headEnd)
  .replace(
    "<title>Awards & Certificates | Act for Change</title>",
    "<title>Events | Act for Change</title>",
  )
  .replace(
    '<link rel="stylesheet" href="awards-and-certificates.css" />',
    '<link rel="stylesheet" href="events.css" />',
  );

const navStart = baseHtml.indexOf('<nav class="nav"');
const navEnd = baseHtml.indexOf("</nav>") + 6;
let navHtml = baseHtml
  .substring(navStart, navEnd)
  .replace(
    'href="awards-and-certificates.html" class="nav-a active"',
    'href="awards-and-certificates.html" class="nav-a"',
  )
  .replace(
    'href="home.html#events" class="nav-a"',
    'href="events.html" class="nav-a active"',
  )
  .replace(
    'href="#events" class="nav-a"',
    'href="events.html" class="nav-a active"',
  ); // fix events link

const footerStart = baseHtml.indexOf("<footer");
const footerEnd = baseHtml.length;
let footerHtml = baseHtml
  .substring(footerStart, footerEnd)
  .replace(
    '<script src="awards.js"></script>',
    '<script src="events.js"></script>',
  );

const eventsHtml = `<!doctype html>
<html lang="en" data-theme="light">
${headHtml}
<body>
  ${navHtml}

  <!-- 1. HERO SECTION -->
  <section class="ev-hero">
    <div class="ev-hero-bg" style="background-image: url('https://images.unsplash.com/photo-1593113565694-c6f13e2fceae?w=1600&q=80')"></div>
    <div class="ev-hero-overlay"></div>
    <div class="container ev-hero-content">
      <div class="ev-label reveal">EVENTS</div>
      <h1 class="reveal" style="--d: 0.2s">Creating Change Through Community Action</h1>
      <p class="ev-hero-sub reveal" style="--d: 0.3s">Every event brings people together, inspires action, and creates meaningful impact for communities in need.</p>
      <div class="ev-hero-btns reveal" style="--d: 0.4s">
        <a href="#featured-event" class="btn btn-primary-gradient ripple magnetic">Explore Events</a>
        <a href="#upcoming-events" class="btn btn-outline ripple magnetic" style="color: white; border-color: rgba(255,255,255,0.5)">Join Upcoming Events</a>
      </div>
    </div>
  </section>

  <!-- 2. EVENTS OVERVIEW STATS -->
  <section class="ev-stats">
    <div class="container">
      <div class="stats-grid">
        <div class="stat-box reveal">
          <div class="stat-number stat-counter" data-target="15">0</div>
          <div class="stat-plus">+</div>
          <div class="stat-label">Events Conducted</div>
        </div>
        <div class="stat-box reveal" style="--d: 0.1s">
          <div class="stat-number stat-counter" data-target="500">0</div>
          <div class="stat-plus">+</div>
          <div class="stat-label">Volunteers Participated</div>
        </div>
        <div class="stat-box reveal" style="--d: 0.2s">
          <div class="stat-number stat-counter" data-target="50">0</div>
          <div class="stat-plus">+</div>
          <div class="stat-label">Communities Reached</div>
        </div>
        <div class="stat-box reveal" style="--d: 0.3s">
          <div class="stat-number stat-counter" data-target="5000">0</div>
          <div class="stat-plus">+</div>
          <div class="stat-label">Beneficiaries Impacted</div>
        </div>
      </div>
    </div>
  </section>

  <!-- 3. FEATURED EVENT & 5. COMMUNITY REACTION -->
  <section class="ev-featured" id="featured-event">
    <div class="container">
      <div class="section-head text-center reveal">
        <h2>Featured Event</h2>
      </div>
      
      <div class="ev-featured-card reveal">
        <div class="ev-featured-img-wrap">
          <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80" alt="Hydrating Kolkata" class="ev-featured-img">
          <div class="ev-status-badge completed">Completed ✅</div>
        </div>
        <div class="ev-featured-content">
          <div class="ev-meta">
            <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> May 12, 2024</span>
            <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Kolkata, India</span>
          </div>
          <h3 class="ev-title">Hydrating Kolkata</h3>
          <p class="ev-desc">Hydrating Kolkata was an initiative focused on providing drinking water support and awareness during extreme summer conditions. Volunteers worked together to help communities stay hydrated and spread awareness about health and well-being.</p>
          
          <div class="ev-reactions">
            <button class="reaction-btn" data-count="128"><span class="emoji">❤️</span> <span class="count">128</span></button>
            <button class="reaction-btn" data-count="95"><span class="emoji">🔥</span> <span class="count">95</span></button>
            <button class="reaction-btn" data-count="210"><span class="emoji">👏</span> <span class="count">210</span></button>
            <button class="reaction-btn" data-count="140"><span class="emoji">🌍</span> <span class="count">140</span></button>
            <button class="reaction-btn" data-count="185"><span class="emoji">🙌</span> <span class="count">185</span></button>
            <button class="reaction-btn" data-count="160"><span class="emoji">💧</span> <span class="count">160</span></button>
          </div>
          
          <a href="#" class="btn btn-primary ripple">Read More</a>
        </div>
      </div>
    </div>
  </section>

  <!-- 4. UPCOMING EVENTS -->
  <section class="ev-upcoming" id="upcoming-events">
    <div class="container">
      <div class="section-head text-center reveal">
        <h2>Upcoming Events</h2>
        <p class="section-sub">More impactful initiatives are on the way.</p>
      </div>
      
      <div class="ev-upcoming-card reveal">
        <div class="ev-status-badge upcoming">Upcoming</div>
        <h3 class="ev-title">Next Event Announcement Coming Soon</h3>
        <p class="ev-desc">Our team is currently preparing the next community initiative. Stay connected and be the first to know about upcoming opportunities to participate and create impact.</p>
        
        <div class="ev-countdown">
          Announcement Coming Soon
        </div>
        
        <button class="btn btn-primary-gradient ripple magnetic">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px; vertical-align:middle;">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          Notify Me
        </button>
      </div>
    </div>
  </section>

  <!-- 6. EVENT TIMELINE -->
  <section class="ev-timeline-sec">
    <div class="container">
      <div class="section-head text-center reveal">
        <h2>Our Journey of Impact</h2>
      </div>
      <div class="ev-timeline">
        <div class="ev-tl-item reveal">
          <div class="ev-tl-year">2024</div>
          <div class="ev-tl-dot"></div>
          <div class="ev-tl-content">
            <h4>Hydrating Kolkata</h4>
            <p>Provided drinking water and health awareness during extreme summer heat across multiple districts.</p>
          </div>
        </div>
        <div class="ev-tl-item reveal">
          <div class="ev-tl-year">2025</div>
          <div class="ev-tl-dot"></div>
          <div class="ev-tl-content">
            <h4>Upcoming Community Initiative</h4>
            <p>Our team is preparing the next major community support program. Details to be revealed soon.</p>
          </div>
        </div>
        <div class="ev-tl-item reveal">
          <div class="ev-tl-year">Future</div>
          <div class="ev-tl-dot"></div>
          <div class="ev-tl-content">
            <h4>More Events Coming Soon</h4>
            <p>We are continuously expanding our reach to support more communities in need.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 7. EVENT GALLERY -->
  <section class="ev-gallery-sec">
    <div class="container">
      <div class="section-head text-center reveal">
        <h2>Moments of Change</h2>
      </div>
      
      <div class="ev-gallery-grid">
        <a href="#" class="ev-gallery-item reveal">
          <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80" alt="Gallery Image 1">
        </a>
        <a href="#" class="ev-gallery-item reveal" style="--d: 0.1s">
          <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80" alt="Gallery Image 2">
        </a>
        <a href="#" class="ev-gallery-item reveal" style="--d: 0.2s;">
          <img src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80" alt="Gallery Image 3">
        </a>
        <a href="#" class="ev-gallery-item reveal" style="--d: 0.3s">
          <img src="https://images.unsplash.com/photo-1593113565694-c6f13e2fceae?w=800&q=80" alt="Gallery Image 4">
        </a>
        <a href="#" class="ev-gallery-item reveal" style="--d: 0.1s">
          <img src="https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=800&q=80" alt="Gallery Image 5">
        </a>
      </div>
    </div>
  </section>

  <!-- 8. VOLUNTEER CTA -->
  <section class="ev-cta reveal">
    <div class="container text-center">
      <h2>Join Our Next Event</h2>
      <p>Be a part of meaningful initiatives that transform lives and strengthen communities.</p>
      <div class="ev-cta-btns">
        <a href="get-involved.html" class="btn btn-primary ripple">Get Involved</a>
        <a href="get-involved.html#volunteer" class="btn btn-outline" style="border-color: rgba(255,255,255,0.6); color: white;">Become a Volunteer</a>
        <a href="home.html#donate" class="btn btn-outline" style="border-color: rgba(255,255,255,0.6); color: white;">Donate Now</a>
      </div>
    </div>
  </section>

  ${footerHtml}
`;

fs.writeFileSync("events.html", eventsHtml);

// Build CSS
const cssContent = `/* ════════════════════════════════════════════
   EVENTS STYLES
════════════════════════════════════════════ */

/* Hero Section */
.ev-hero {
  position: relative;
  height: 85vh;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}

.ev-hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  z-index: 1;
}

.ev-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(10,5,2,0.9), rgba(10,5,2,0.4));
  z-index: 2;
}

.ev-hero-content {
  position: relative;
  z-index: 10;
  max-width: 900px;
  color: white;
  padding: 0 20px;
}

.ev-label {
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--orange-lt);
  margin-bottom: 20px;
}

.ev-hero-content h1 {
  font-family: var(--font-head);
  font-size: clamp(3rem, 6vw, 5.5rem);
  line-height: 1.1;
  margin-bottom: 24px;
}

.ev-hero-sub {
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  opacity: 0.85;
  margin-bottom: 40px;
  max-width: 700px;
  margin-inline: auto;
  line-height: 1.6;
}

.ev-hero-btns {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Stats Section */
.ev-stats {
  padding: 80px 0;
  background: var(--white);
  border-bottom: 1px solid var(--glass-bdr);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  text-align: center;
}

.stat-box {
  padding: 20px;
}

.stat-number {
  font-family: var(--font-head);
  font-size: 4rem;
  font-weight: 700;
  color: var(--orange);
  display: inline-block;
  line-height: 1;
}

.stat-plus {
  display: inline-block;
  font-family: var(--font-head);
  font-size: 3rem;
  font-weight: 700;
  color: var(--orange);
  vertical-align: top;
  line-height: 1;
}

.stat-label {
  font-weight: 600;
  color: var(--txt-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 10px;
}

/* Status Badge */
.ev-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 30px;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
}

.ev-status-badge.completed {
  background: #E8F5E9;
  color: #2E7D32;
}

.ev-status-badge.upcoming {
  background: rgba(232, 107, 44, 0.1);
  color: var(--orange);
}

/* Featured Event */
.ev-featured {
  padding: 120px 0;
  background: var(--cream);
}

.ev-featured-card {
  background: var(--white);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
}

.ev-featured-img-wrap {
  position: relative;
  height: 100%;
  min-height: 400px;
}

.ev-featured-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  inset: 0;
}

.ev-featured-img-wrap .ev-status-badge {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 2;
  margin: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.ev-featured-content {
  padding: 60px;
}

.ev-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  font-size: 0.95rem;
  color: var(--txt-muted);
  font-weight: 500;
}

.ev-meta span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ev-title {
  font-family: var(--font-head);
  font-size: clamp(2rem, 3vw, 2.5rem);
  margin-bottom: 16px;
  line-height: 1.2;
}

.ev-desc {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--txt-muted);
  margin-bottom: 32px;
}

/* Reactions */
.ev-reactions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--glass-bdr);
}

.reaction-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--cream);
  border: 1px solid var(--glass-bdr);
  padding: 8px 16px;
  border-radius: 30px;
  font-family: inherit;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: var(--txt-muted);
}

.reaction-btn:hover {
  transform: translateY(-2px);
  background: white;
  box-shadow: 0 4px 12px rgba(44, 32, 24, 0.05);
  border-color: var(--orange-lt);
}

.reaction-btn.reacted {
  background: rgba(232, 107, 44, 0.1);
  border-color: var(--orange);
  color: var(--orange);
}

.reaction-btn .emoji {
  font-size: 1.1rem;
}

/* Upcoming Events */
.ev-upcoming {
  padding: 120px 0;
  background: var(--white);
}

.ev-upcoming-card {
  background: var(--cream);
  border-radius: 24px;
  padding: 60px;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: var(--shadow);
  border: 1px solid var(--glass-bdr);
}

.ev-countdown {
  font-family: var(--font-head);
  font-size: 2rem;
  font-weight: 700;
  color: var(--txt);
  margin: 40px 0;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
  border: 1px dashed rgba(232, 107, 44, 0.3);
}

/* Timeline */
.ev-timeline-sec {
  padding: 120px 0;
  background: var(--cream);
}

.ev-timeline {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.ev-timeline::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  background: var(--glass-bdr);
  transform: translateX(-50%);
}

.ev-tl-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 60px;
  position: relative;
}

.ev-tl-item:nth-child(even) {
  flex-direction: row-reverse;
}

.ev-tl-year {
  width: 45%;
  text-align: right;
  font-family: var(--font-head);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--orange-lt);
}

.ev-tl-item:nth-child(even) .ev-tl-year {
  text-align: left;
}

.ev-tl-dot {
  width: 20px;
  height: 20px;
  background: var(--orange);
  border: 4px solid var(--cream);
  border-radius: 50%;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  box-shadow: 0 0 0 4px var(--cream);
}

.ev-tl-content {
  width: 45%;
  background: var(--white);
  padding: 30px;
  border-radius: 16px;
  box-shadow: var(--shadow);
}

.ev-tl-content h4 {
  font-family: var(--font-head);
  font-size: 1.4rem;
  margin-bottom: 12px;
}

.ev-tl-content p {
  color: var(--txt-muted);
  line-height: 1.6;
}

/* Gallery Masonry */
.ev-gallery-sec {
  padding: 120px 0;
  background: var(--white);
}

.ev-gallery-grid {
  columns: 3 300px;
  gap: 20px;
}

.ev-gallery-item {
  break-inside: avoid;
  margin-bottom: 20px;
  border-radius: 16px;
  overflow: hidden;
  display: block;
  box-shadow: var(--shadow);
  position: relative;
  transition: transform 0.3s ease;
}

.ev-gallery-item:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.ev-gallery-item img {
  width: 100%;
  height: auto;
  display: block;
}

.ev-gallery-item::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.2);
  opacity: 0;
  transition: opacity 0.3s;
}

.ev-gallery-item:hover::after {
  opacity: 1;
}

/* CTA Section */
.ev-cta {
  padding: 120px 0;
  background: linear-gradient(135deg, var(--orange), var(--orange-dk));
  color: white;
}

.ev-cta h2 {
  font-family: var(--font-head);
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  margin-bottom: 20px;
}

.ev-cta p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 40px;
  max-width: 600px;
  margin-inline: auto;
}

.ev-cta-btns {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}
.ev-cta-btns .btn-primary {
  background: white;
  color: var(--orange-dk);
}
.ev-cta-btns .btn-primary:hover {
  background: var(--cream);
}

/* Responsive */
@media (max-width: 1024px) {
  .ev-featured-card {
    grid-template-columns: 1fr;
  }
  .ev-featured-img-wrap {
    min-height: 400px;
  }
  .ev-gallery-grid {
    columns: 2 250px;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .ev-timeline::before {
    left: 20px;
  }
  .ev-tl-dot {
    left: 20px;
  }
  .ev-tl-item, .ev-tl-item:nth-child(even) {
    flex-direction: column;
    align-items: flex-start;
    padding-left: 60px;
  }
  .ev-tl-year, .ev-tl-item:nth-child(even) .ev-tl-year {
    width: 100%;
    text-align: left;
    margin-bottom: 16px;
    font-size: 2rem;
  }
  .ev-tl-content, .ev-tl-item:nth-child(even) .ev-tl-content {
    width: 100%;
  }
  .ev-featured-content {
    padding: 30px;
  }
  .ev-upcoming-card {
    padding: 30px;
  }
  .ev-countdown {
    font-size: 1.5rem;
  }
  .ev-gallery-grid {
    columns: 1 100%;
  }
  .ev-hero-btns {
    flex-direction: column;
  }
}
@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .ev-meta {
    flex-direction: column;
    gap: 10px;
  }
  .ev-hero-btns, .ev-cta-btns {
    flex-direction: column;
  }
  .ev-featured-img-wrap {
    min-height: 300px;
  }
}
`;

fs.writeFileSync("events.css", cssContent);

// Build JS
const jsContent = `document.addEventListener("DOMContentLoaded", () => {
  // Counters Animation
  const statVals = document.querySelectorAll('.stat-counter');
  
  if (statVals.length > 0) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target'), 10);
          
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
    }, { threshold: 0.5 });
    
    statVals.forEach(val => observer.observe(val));
  }
  
  // Reaction System
  const reactionBtns = document.querySelectorAll('.reaction-btn');
  reactionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isReacted = btn.classList.contains('reacted');
      const countEl = btn.querySelector('.count');
      let count = parseInt(btn.getAttribute('data-count'), 10);
      
      if (isReacted) {
        btn.classList.remove('reacted');
        countEl.innerText = count;
      } else {
        btn.classList.add('reacted');
        countEl.innerText = count + 1;
      }
    });
  });
});`;

fs.writeFileSync("events.js", jsContent);

// Update navigation in all other HTML files to point to events.html
files.forEach((file) => {
  if (file !== "events.html") {
    let content = fs.readFileSync(file, "utf8");
    content = content.replace(
      /href="(home\.html)?#events"/g,
      'href="events.html"',
    );
    fs.writeFileSync(file, content);
  }
});
