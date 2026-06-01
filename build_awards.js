const fs = require("fs");

const data = {
  heroImage:
    "https://images.unsplash.com/photo-1511632765486-a01c80cb2628?w=1600&q=80",
  awards: [
    {
      title: "Excellence in Community Service",
      org: "National NGO Forum",
      year: "2024",
      desc: "Awarded for outstanding contribution to rural empowerment and poverty alleviation.",
      img: "https://images.unsplash.com/photo-1542144612-1b3641ec3459?w=800&q=80",
    },
    {
      title: "Social Impact Leadership Award",
      org: "Impact India Foundation",
      year: "2023",
      desc: "Recognizing exceptional leadership in driving sustainable social change.",
      img: "https://plus.unsplash.com/premium_photo-1661284897282-3bf9daff2862?w=800&q=80",
    },
    {
      title: "Education Empowerment Recognition",
      org: "Education Development Council",
      year: "2022",
      desc: "Honoring our commitment to providing quality education to marginalized children.",
      img: "https://images.unsplash.com/photo-1523580494112-071dcb92a71d?w=800&q=80",
    },
    {
      title: "Sustainable Change Award",
      org: "Community Growth Initiative",
      year: "2021",
      desc: "Commending our long-term environmental sustainability and awareness campaigns.",
      img: "https://images.unsplash.com/photo-1559868420-1a76d33f7c46?w=800&q=80",
    },
  ],
  testimonials: [
    {
      quote:
        "Act For Change has consistently demonstrated what true grassroots empowerment look like. Their work is a model for sustainable development.",
      name: "Dr. Ananya Sharma",
      designation: "Director, Global Philanthropy Network",
    },
    {
      quote:
        "The dedication of their team and volunteers is unmatched. It is rare to see such transparent and effective community transformation.",
      name: "Rajiv Mehta",
      designation: "CSR Head, ImpactCorp India",
    },
    {
      quote:
        "Partnering with them has allowed us to reach the most vulnerable populations with dignity and hope.",
      name: "Sarah Jenkins",
      designation: "Program Officer, International Aid Council",
    },
  ],
};

const wwaHtml = fs.readFileSync("who-we-are.html", "utf8");
const headStart = wwaHtml.indexOf("<head>");
const headEnd = wwaHtml.indexOf("</head>") + 7;
let headHtml = wwaHtml
  .substring(headStart, headEnd)
  .replace(
    "<title>Who We Are | Act for Change</title>",
    "<title>Awards & Certificates | Act for Change</title>",
  )
  .replace(
    "</head>",
    '  <link rel="stylesheet" href="awards-and-certificates.css" />\n</head>',
  );

const navStart = wwaHtml.indexOf('<nav class="nav"');
const navEnd = wwaHtml.indexOf("</nav>") + 6;
let navHtml = wwaHtml.substring(navStart, navEnd);
// We will update nav links next.

const footerStart = wwaHtml.indexOf("<footer");
const footerEnd = wwaHtml.length;
const footerHtml = wwaHtml
  .substring(footerStart, footerEnd)
  .replace(
    '<script src="who-we-are.js"></script>',
    '<script src="awards.js"></script>',
  );

let awardsCardsHtml = "";
data.awards.forEach((award, idx) => {
  awardsCardsHtml += `
    <div class="award-card reveal" style="--d: 0.${idx + 1}s">
      <div class="award-img-wrap">
        <img src="${award.img}" alt="${award.title}" class="award-img" />
        <div class="award-year-badge">${award.year}</div>
      </div>
      <div class="award-content">
        <div class="award-org">${award.org}</div>
        <h3 class="award-title">${award.title}</h3>
        <p class="award-desc">${award.desc}</p>
      </div>
    </div>
  `;
});

let testimonialsCardsHtml = "";
data.testimonials.forEach((t, idx) => {
  testimonialsCardsHtml += `
    <div class="testi-card reveal" style="--d: 0.${idx + 1}s">
      <div class="testi-quote-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="var(--orange)" opacity="0.2"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
      </div>
      <p class="testi-text">"${t.quote}"</p>
      <div class="testi-author">
        <div class="testi-name">${t.name}</div>
        <div class="testi-desig">${t.designation}</div>
      </div>
    </div>
  `;
});

const pageHtml = `<!doctype html>
<html lang="en" data-theme="light">
${headHtml}
<body>
  ${navHtml}

  <!-- 1. HERO SECTION -->
  <section class="ac-hero">
    <div class="ac-hero-bg" style="background-image: url('${data.heroImage}')"></div>
    <div class="ac-hero-overlay"></div>
    <div class="container ac-hero-content">
      <div class="ac-label reveal">AWARDS & CERTIFICATES</div>
      <h1 class="reveal" style="--d: 0.2s">Recognizing Impact,<br/>Celebrating Change</h1>
      <p class="ac-hero-sub reveal" style="--d: 0.3s">Every milestone reflects our commitment to empowering communities, transforming lives, and creating sustainable social impact.</p>
      <div class="ac-hero-btns reveal" style="--d: 0.4s">
        <a href="#awards-showcase" class="btn btn-primary-gradient ripple magnetic">View Achievements</a>
        <a href="#certificates" class="btn btn-outline ripple magnetic" style="color: white; border-color: rgba(255,255,255,0.5)">Explore Certificates</a>
      </div>
    </div>
  </section>

  <!-- 2. ACHIEVEMENT STATS -->
  <section class="ac-stats">
    <div class="container">
      <div class="stats-grid">
        <div class="stat-box reveal">
          <div class="stat-number stat-counter" data-target="25">0</div>
          <div class="stat-plus">+</div>
          <div class="stat-label">Awards Received</div>
        </div>
        <div class="stat-box reveal" style="--d: 0.1s">
          <div class="stat-number stat-counter" data-target="15">0</div>
          <div class="stat-plus">+</div>
          <div class="stat-label">National Recognitions</div>
        </div>
        <div class="stat-box reveal" style="--d: 0.2s">
          <div class="stat-number stat-counter" data-target="100">0</div>
          <div class="stat-plus">+</div>
          <div class="stat-label">Community Impact Projects</div>
        </div>
        <div class="stat-box reveal" style="--d: 0.3s">
          <div class="stat-number stat-counter" data-target="500">0</div>
          <div class="stat-plus">+</div>
          <div class="stat-label">Certified Volunteers</div>
        </div>
      </div>
    </div>
  </section>

  <!-- 3. AWARDS SHOWCASE -->
  <section class="ac-showcase" id="awards-showcase">
    <div class="container">
      <div class="section-head text-center reveal">
        <h2>Our Awards & Recognitions</h2>
        <p class="section-sub">A journey marked by dedication, innovation, and community impact.</p>
      </div>
      <div class="awards-grid">
        ${awardsCardsHtml}
      </div>
    </div>
  </section>

  <!-- 4. CERTIFICATES GALLERY -->
  <section class="ac-certificates" id="certificates">
    <div class="container">
      <div class="section-head text-center reveal">
        <h2>Certificates & Accreditation</h2>
        <p class="section-sub">Official recognitions validating our transparency and dedication.</p>
      </div>
      <div class="cert-grid">
        <div class="cert-card reveal">
          <div class="cert-img-wrap">
            <img src="https://images.unsplash.com/photo-1523287562758-66c7fc58967f?w=600&q=80" alt="Certificate" />
          </div>
          <div class="cert-info">
            <h4>ISO 9001:2015 Certification</h4>
            <p>Quality Management System • 2023</p>
          </div>
        </div>
        <div class="cert-card reveal" style="--d: 0.1s">
          <div class="cert-img-wrap">
            <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80" alt="Certificate" />
          </div>
          <div class="cert-info">
            <h4>FCRA Accreditation</h4>
            <p>Govt. of India • 2022</p>
          </div>
        </div>
        <div class="cert-card reveal" style="--d: 0.2s">
          <div class="cert-img-wrap">
            <img src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=600&q=80" alt="Certificate" />
          </div>
          <div class="cert-info">
            <h4>CSR Registration</h4>
            <p>Ministry of Corporate Affairs • 2021</p>
          </div>
        </div>
        <div class="cert-card reveal" style="--d: 0.3s">
          <div class="cert-img-wrap">
            <img src="https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=600&q=80" alt="Certificate" />
          </div>
          <div class="cert-info">
            <h4>80G & 12A Certification</h4>
            <p>Income Tax Dept • 2020</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 5. TIMELINE -->
  <section class="ac-timeline-sec">
    <div class="container">
      <div class="section-head text-center reveal">
        <h2>Milestones Through The Years</h2>
      </div>
      <div class="ac-timeline">
        <div class="ac-tl-item reveal">
          <div class="ac-tl-year">2024</div>
          <div class="ac-tl-dot"></div>
          <div class="ac-tl-content">
            <h4>Excellence in Community Service Award</h4>
            <p>Recognized nationally for pioneering grassroots livelihood models benefiting over 10,000 families.</p>
          </div>
        </div>
        <div class="ac-tl-item reveal">
          <div class="ac-tl-year">2023</div>
          <div class="ac-tl-dot"></div>
          <div class="ac-tl-content">
            <h4>Social Impact Leadership Award</h4>
            <p>Awarded for exemplary organizational resilience and community mobilization during structural reforms.</p>
          </div>
        </div>
        <div class="ac-tl-item reveal">
          <div class="ac-tl-year">2022</div>
          <div class="ac-tl-dot"></div>
          <div class="ac-tl-content">
            <h4>Education Empowerment Recognition</h4>
            <p>Celebrated for successfully re-enrolling 5,000+ school dropouts across remote villages.</p>
          </div>
        </div>
        <div class="ac-tl-item reveal">
          <div class="ac-tl-year">2021</div>
          <div class="ac-tl-dot"></div>
          <div class="ac-tl-content">
            <h4>Sustainable Change Award</h4>
            <p>Honored for launching comprehensive eco-friendly initiatives and tree plantation drives.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 6. IMPACT HIGHLIGHTS -->
  <section class="ac-impact">
    <div class="container">
      <div class="ac-impact-grid">
        <div class="ac-impact-img reveal">
          <img src="https://images.unsplash.com/photo-1529390079861-591de354faf5?w=800&q=80" alt="Impact" />
        </div>
        <div class="ac-impact-content reveal" style="--d: 0.2s">
          <h2>Recognition Backed by Real Impact</h2>
          <p>Our awards aren't just trophies; they are reflections of measurable, on-the-ground change. Each accolade represents communities uplifted, children educated, and ecosystems restored through unwavering dedication.</p>
          <ul class="ac-checklist">
            <li><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Education Programs</li>
            <li><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Community Development</li>
            <li><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Environmental Sustainability</li>
            <li><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Volunteer Empowerment</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- 7. TESTIMONIALS -->
  <section class="ac-testimonials">
    <div class="container">
      <div class="section-head text-center reveal">
        <h2>What Our Partners Say</h2>
      </div>
      <div class="testi-grid">
        ${testimonialsCardsHtml}
      </div>
    </div>
  </section>

  <!-- 8. CTA -->
  <section class="ac-cta reveal">
    <div class="container text-center">
      <h2>Be Part of Our Impact Journey</h2>
      <p>Join us in creating meaningful change and helping communities thrive.</p>
      <div class="ac-cta-btns">
        <a href="home.html#donate" class="btn btn-primary ripple">Donate Now</a>
        <a href="get-involved.html" class="btn btn-outline" style="border-color: rgba(255,255,255,0.6); color: white;">Get Involved</a>
      </div>
    </div>
  </section>

  ${footerHtml}
`;

fs.writeFileSync("awards-and-certificates.html", pageHtml);
