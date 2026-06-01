const fs = require("fs");

const baseHtml = fs.readFileSync("get-involved.html", "utf8");

const headStart = baseHtml.indexOf("<head>");
const headEnd = baseHtml.indexOf("</head>") + 7;
let headHtml = baseHtml
  .substring(headStart, headEnd)
  .replace(
    "<title>Get Involved | Act for Change</title>",
    "<title>Donate | Act for Change</title>",
  )
  .replace(
    '<link rel="stylesheet" href="get-involved.css" />',
    '<link rel="stylesheet" href="donate.css" />\n  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>',
  );

const navStart = baseHtml.indexOf('<nav class="nav"');
const navEnd = baseHtml.indexOf("</nav>") + 6;
let navHtml = baseHtml
  .substring(navStart, navEnd)
  .replace('class="nav-a active"', 'class="nav-a"');

const footerStart = baseHtml.indexOf("<footer");
const footerEnd = baseHtml.length;
let footerHtml = baseHtml
  .substring(footerStart, footerEnd)
  .replace(
    '<script src="get-involved.js"></script>',
    '<script src="donate.js"></script>',
  );

let donateHtml = `<!doctype html>
<html lang="en" data-theme="light">
${headHtml}
<body>
  ${navHtml}

  <!-- 1. HERO SECTION -->
  <section class="don-hero">
    <div class="don-hero-bg" style="background-image: url('https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1600&q=80')"></div>
    <div class="don-hero-overlay"></div>
    <div class="container don-hero-content">
      <div class="don-label reveal">DONATE NOW</div>
      <h1 class="reveal" style="--d: 0.2s">Support Meaningful Change</h1>
      <p class="don-hero-sub reveal" style="--d: 0.3s">Your contribution helps us create lasting impact through education, community development, environmental initiatives, and humanitarian action.</p>
      <div class="don-hero-btns reveal" style="--d: 0.4s">
        <a href="#donate-form-section" class="btn btn-primary-gradient ripple magnetic">Donate Now</a>
        <a href="#impact" class="btn btn-outline ripple magnetic" style="color: white; border-color: rgba(255,255,255,0.5)">Learn Our Impact</a>
      </div>
    </div>
  </section>

  <!-- 2. DONATION FORM PORTION -->
  <section class="don-main" id="donate-form-section">
    <div class="container">
      <div class="don-grid">
        
        <!-- Left: Amount Selection & Impact -->
        <div class="don-left reveal">
          <div class="section-head">
            <h2>Select Donation Amount</h2>
            <p class="section-sub">Choose an amount or enter a custom contribution to support our cause.</p>
          </div>
          
          <div class="amount-grid" id="amountGrid">
            <div class="amount-card active" data-amount="100">
              <h4>₹100</h4>
              <p>Supports educational supplies</p>
            </div>
            <div class="amount-card" data-amount="500">
              <h4>₹500</h4>
              <p>Supports community outreach</p>
            </div>
            <div class="amount-card" data-amount="1000">
              <h4>₹1000</h4>
              <p>Supports development programs</p>
            </div>
            <div class="amount-card" data-amount="2500">
              <h4>₹2500</h4>
              <p>Supports multiple beneficiaries</p>
            </div>
            <div class="amount-card" data-amount="5000">
              <h4>₹5000</h4>
              <p>Supports major impact initiatives</p>
            </div>
            <div class="amount-card custom-amount-card">
              <h4>Custom Amount</h4>
              <p>Any amount helps</p>
              <input type="number" id="customAmount" placeholder="₹" class="custom-amt-input" min="1" style="display: none;">
            </div>
          </div>

          <!-- Trust Section -->
          <div class="don-trust">
            <h3>Trusted & Secure</h3>
            <div class="trust-icons">
              <div class="trust-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span>Secure Payments</span>
              </div>
              <div class="trust-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>Razorpay Protected Process</span>
              </div>
              <div class="trust-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
                <span>Data Privacy</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Donor Info Form -->
        <div class="don-right reveal" style="--d: 0.2s">
          <div class="don-form-wrapper">
            <h3>Donor Information</h3>
            <form id="donateForm" class="don-form">
              <div class="form-group">
                <label>Full Name *</label>
                <input type="text" id="donorName" class="form-control" required placeholder="Name as per government ID">
              </div>
              <div class="form-group">
                <label>Email Address *</label>
                <input type="email" id="donorEmail" class="form-control" required placeholder="Receipt will be sent here">
              </div>
              <div class="form-group">
                <label>Phone Number *</label>
                <input type="tel" id="donorPhone" class="form-control" required placeholder="10-digit mobile number">
              </div>
              <div class="form-group">
                <label>City</label>
                <input type="text" id="donorCity" class="form-control" placeholder="Your City">
              </div>
              <div class="form-group">
                <label>Donation Purpose *</label>
                <select id="donorPurpose" class="form-control" required>
                  <option value="" disabled selected>Select an area of impact</option>
                  <option value="General Donation">General Donation</option>
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Environment">Environment</option>
                  <option value="Community Development">Community Development</option>
                </select>
              </div>
              <div class="form-group">
                <label>Optional Message</label>
                <textarea id="donorMessage" class="form-control" rows="3" placeholder="Leave a message..."></textarea>
              </div>
              
              <div class="don-summary">
                <div class="don-summary-row">
                  <span>Selected Amount:</span>
                  <strong id="displayAmount">₹100</strong>
                </div>
              </div>

              <div id="paymentError" class="payment-error" style="display: none;"></div>

              <button type="submit" class="btn btn-primary-gradient w-100" id="donateBtn">
                Proceed to Pay Securely
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- 3. IMPACT VISUALIZATION -->
  <section class="don-impact" id="impact">
    <div class="container">
      <div class="section-head text-center reveal">
        <h2>How Your Donation Helps</h2>
        <p class="section-sub">Every contribution translates into direct community support.</p>
      </div>
      <div class="don-impact-grid">
        <div class="don-impact-card reveal">
          <div class="impact-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div>
          <h4>₹100</h4>
          <p>Provides educational materials for one young student for an entire term.</p>
        </div>
        <div class="don-impact-card reveal" style="--d: 0.1s">
          <div class="impact-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>
          <h4>₹500</h4>
          <p>Supports robust community outreach and daily awareness programs.</p>
        </div>
        <div class="don-impact-card reveal" style="--d: 0.2s">
          <div class="impact-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
          <h4>₹1000</h4>
          <p>Establishes essential learning resources and sustainable support systems.</p>
        </div>
        <div class="don-impact-card reveal" style="--d: 0.3s">
          <div class="impact-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>
          <h4>₹2500+</h4>
          <p>Delivers comprehensive multi-family support and major environmental rehabilitation.</p>
        </div>
      </div>
    </div>
  </section>

  ${footerHtml}
</body>
</html>`;

fs.writeFileSync("donate.html", donateHtml);

let successHtml = `<!doctype html>
<html lang="en" data-theme="light">
${headHtml.replace("<title>Donate | Act for Change</title>", "<title>Donation Successful | Act for Change</title>")}
<body>
  ${navHtml}
  
  <section class="don-success-sec">
    <div class="container text-center reveal">
      <div class="success-icon-wrap">
        <svg class="success-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      
      <h1>Thank You For Your Contribution ❤️</h1>
      <p class="success-sub">Your generosity helps transform lives and strengthen communities.</p>
      
      <div class="receipt-card" id="receiptCard">
        <h3>Donation Details</h3>
        <div class="receipt-row">
          <span>Donor Name:</span>
          <strong id="rName">-</strong>
        </div>
        <div class="receipt-row">
          <span>Amount:</span>
          <strong id="rAmount">-</strong>
        </div>
        <div class="receipt-row">
          <span>Transaction ID:</span>
          <strong id="rTxn">-</strong>
        </div>
        <div class="receipt-row">
          <span>Date:</span>
          <strong id="rDate">-</strong>
        </div>
        <div class="receipt-row">
          <span>Purpose:</span>
          <strong id="rPurpose">-</strong>
        </div>
      </div>
      
      <div class="success-actions">
        <a href="home.html" class="btn btn-outline ripple">Return Home</a>
        <button id="downloadReceiptBtn" class="btn btn-outline ripple" style="border-color: var(--txt); color: var(--txt);">Download Receipt</button>
        <a href="home.html#programmes" class="btn btn-primary-gradient ripple">Explore Programs</a>
      </div>
    </div>
  </section>

  ${footerHtml.replace("donate.js", "donation-success.js")}
</body>
</html>`;

fs.writeFileSync("donation-success.html", successHtml);

// update links
const allFiles = fs.readdirSync(".").filter((f) => f.endsWith(".html"));
allFiles.forEach((f) => {
  let text = fs.readFileSync(f, "utf8");
  text = text.replace(/home\.html#donate/g, "donate.html");
  text = text.replace(/href="#donate"/g, 'href="donate.html"');
  fs.writeFileSync(f, text);
});
