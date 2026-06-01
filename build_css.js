const fs = require("fs");

const cssContent = `/* ════════════════════════════════════════════
   AWARDS AND CERTIFICATES STYLES
════════════════════════════════════════════ */

/* Hero Section */
.ac-hero {
  position: relative;
  height: 85vh;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}

.ac-hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  z-index: 1;
}

.ac-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(10,5,2,0.9), rgba(10,5,2,0.4));
  z-index: 2;
}

.ac-hero-content {
  position: relative;
  z-index: 10;
  max-width: 900px;
  color: white;
  padding: 0 20px;
}

.ac-label {
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--orange-lt);
  margin-bottom: 20px;
}

.ac-hero-content h1 {
  font-family: var(--font-head);
  font-size: clamp(3rem, 6vw, 5.5rem);
  line-height: 1.1;
  margin-bottom: 24px;
}

.ac-hero-sub {
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  opacity: 0.85;
  margin-bottom: 40px;
  max-width: 700px;
  margin-inline: auto;
  line-height: 1.6;
}

.ac-hero-btns {
  display: flex;
  gap: 20px;
  justify-content: center;
}

/* Stats Section */
.ac-stats {
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

/* Awards Showcase */
.ac-showcase {
  padding: 120px 0;
  background: var(--cream);
}

.section-head {
  margin-bottom: 60px;
}

.section-head h2 {
  font-family: var(--font-head);
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  margin-bottom: 16px;
}

.section-sub {
  font-size: 1.2rem;
  color: var(--txt-muted);
}

.awards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
}

.award-card {
  background: var(--white);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
}

.award-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.award-card:hover .award-img {
  transform: scale(1.05);
}

.award-img-wrap {
  position: relative;
  height: 280px;
  overflow: hidden;
}

.award-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--dur) var(--ease);
}

.award-year-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background: var(--orange);
  color: white;
  padding: 8px 16px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.9rem;
}

.award-content {
  padding: 40px;
}

.award-org {
  color: var(--orange);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.85rem;
  margin-bottom: 12px;
}

.award-title {
  font-family: var(--font-head);
  font-size: 1.8rem;
  margin-bottom: 16px;
  line-height: 1.2;
}

.award-desc {
  color: var(--txt-muted);
  line-height: 1.6;
}

/* Certificates */
.ac-certificates {
  padding: 120px 0;
  background: var(--white);
}

.cert-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.cert-card {
  background: var(--cream);
  padding: 20px;
  border-radius: 16px;
  text-align: center;
  transition: transform 0.3s;
  box-shadow: var(--shadow);
}

.cert-card:hover {
  transform: translateY(-5px);
}

.cert-img-wrap {
  aspect-ratio: 4/3;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid var(--glass-bdr);
}

.cert-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cert-info h4 {
  font-family: var(--font-head);
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.cert-info p {
  font-size: 0.85rem;
  color: var(--txt-muted);
}

/* Timeline */
.ac-timeline-sec {
  padding: 120px 0;
  background: var(--cream);
}

.ac-timeline {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.ac-timeline::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  background: var(--glass-bdr);
  transform: translateX(-50%);
}

.ac-tl-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 60px;
  position: relative;
}

.ac-tl-item:nth-child(even) {
  flex-direction: row-reverse;
}

.ac-tl-year {
  width: 45%;
  text-align: right;
  font-family: var(--font-head);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--orange-lt);
}

.ac-tl-item:nth-child(even) .ac-tl-year {
  text-align: left;
}

.ac-tl-dot {
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

.ac-tl-content {
  width: 45%;
  background: var(--white);
  padding: 30px;
  border-radius: 16px;
  box-shadow: var(--shadow);
}

.ac-tl-content h4 {
  font-family: var(--font-head);
  font-size: 1.4rem;
  margin-bottom: 12px;
}

.ac-tl-content p {
  color: var(--txt-muted);
  line-height: 1.6;
}

/* Impact Highlights */
.ac-impact {
  padding: 120px 0;
  background: var(--white);
}

.ac-impact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.ac-impact-img {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.ac-impact-content h2 {
  font-family: var(--font-head);
  font-size: clamp(2rem, 3.5vw, 3rem);
  margin-bottom: 24px;
}

.ac-impact-content p {
  font-size: 1.1rem;
  color: var(--txt-muted);
  line-height: 1.8;
  margin-bottom: 32px;
}

.ac-checklist {
  list-style: none;
}

.ac-checklist li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 16px;
}

/* Testimonials */
.ac-testimonials {
  padding: 120px 0;
  background: var(--cream);
}

.testi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.testi-card {
  background: var(--white);
  padding: 40px;
  border-radius: 20px;
  box-shadow: var(--shadow);
  position: relative;
}

.testi-quote-icon {
  margin-bottom: 24px;
}

.testi-text {
  font-size: 1.1rem;
  line-height: 1.6;
  font-style: italic;
  margin-bottom: 32px;
  color: var(--txt);
}

.testi-name {
  font-weight: 700;
  margin-bottom: 4px;
}

.testi-desig {
  font-size: 0.85rem;
  color: var(--txt-muted);
}

/* CTA */
.ac-cta {
  padding: 120px 0;
  background: linear-gradient(135deg, var(--orange), var(--orange-dk));
  color: white;
}

.ac-cta h2 {
  font-family: var(--font-head);
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  margin-bottom: 20px;
}

.ac-cta p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 40px;
  max-width: 600px;
  margin-inline: auto;
}

.ac-cta-btns {
  display: flex;
  gap: 20px;
  justify-content: center;
}
.ac-cta-btns .btn-primary {
  background: white;
  color: var(--orange-dk);
}
.ac-cta-btns .btn-primary:hover {
  background: var(--cream);
}

/* Responsive */
@media (max-width: 1024px) {
  .awards-grid {
    grid-template-columns: 1fr;
  }
  .cert-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .ac-impact-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .testi-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .ac-timeline::before {
    left: 20px;
  }
  .ac-tl-dot {
    left: 20px;
  }
  .ac-tl-item, .ac-tl-item:nth-child(even) {
    flex-direction: column;
    align-items: flex-start;
    padding-left: 60px;
  }
  .ac-tl-year, .ac-tl-item:nth-child(even) .ac-tl-year {
    width: 100%;
    text-align: left;
    margin-bottom: 16px;
    font-size: 2rem;
  }
  .ac-tl-content, .ac-tl-item:nth-child(even) .ac-tl-content {
    width: 100%;
  }
  .ac-hero-btns {
    flex-direction: column;
  }
}
@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .cert-grid {
    grid-template-columns: 1fr;
  }
}
`;
fs.writeFileSync("awards-and-certificates.css", cssContent);

/* JavaScript for animations */
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
});`;
fs.writeFileSync("awards.js", jsContent);
