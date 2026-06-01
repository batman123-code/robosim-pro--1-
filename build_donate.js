const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

const baseHtml = fs.readFileSync('get-involved.html', 'utf8');

const headStart = baseHtml.indexOf('<head>');
const headEnd = baseHtml.indexOf('</head>') + 7;
let headHtml = baseHtml.substring(headStart, headEnd)
  .replace('<title>Get Involved | Act for Change</title>', '<title>Donate | Act for Change</title>')
  .replace('<link rel="stylesheet" href="get-involved.css" />', '<link rel="stylesheet" href="donate.css" />\n  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>');

const navStart = baseHtml.indexOf('<nav class="nav"');
const navEnd = baseHtml.indexOf('</nav>') + 6;
// Add active state logic inside JS script when on donate page
// Wait, actually I can just take the navHtml and it will work if I don't set active (since donate is purely a CTA button or we can just leave it as is)
let navHtml = baseHtml.substring(navStart, navEnd);

const footerStart = baseHtml.indexOf('<footer');
const footerEnd = baseHtml.length;
let footerHtml = baseHtml.substring(footerStart, footerEnd).replace('<script src="get-involved.js"></script>', '<script src="donate.js"></script>');

const donateHtml = \`<!doctype html>
<html lang="en" data-theme="light">
\${headHtml}
<body>
  \${navHtml}

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

  \${footerHtml}
</body>
</html>
\`;

fs.writeFileSync('donate.html', donateHtml);

const successHtml = \`<!doctype html>
<html lang="en" data-theme="light">
\${headHtml.replace('<title>Donate | Act for Change</title>', '<title>Donation Successful | Act for Change</title>')}
<body>
  \${navHtml}
  
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
        <a href="programmes.html" class="btn btn-primary-gradient ripple">Explore Programs</a>
      </div>
    </div>
  </section>

  \${footerHtml.replace('donate.js', 'donation-success.js')}
</body>
</html>
\`;

fs.writeFileSync('donation-success.html', successHtml);

const cssContent = \`/* ════════════════════════════════════════════
   DONATE STYLES
════════════════════════════════════════════ */

/* Hero */
.don-hero {
  position: relative;
  height: 60vh;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}

.don-hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  z-index: 1;
}

.don-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(10,5,2,0.9), rgba(10,5,2,0.6));
  z-index: 2;
}

.don-hero-content {
  position: relative;
  z-index: 10;
  max-width: 800px;
  color: white;
  padding: 0 20px;
  margin-top: 60px;
}

.don-label {
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--orange-lt);
  margin-bottom: 20px;
}

.don-hero-content h1 {
  font-family: var(--font-head);
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  line-height: 1.1;
  margin-bottom: 20px;
}

.don-hero-sub {
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  opacity: 0.9;
  margin-bottom: 30px;
  max-width: 600px;
  margin-inline: auto;
  line-height: 1.6;
}

.don-hero-btns {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Donate Main Grid */
.don-main {
  padding: 100px 0;
  background: var(--cream);
}

.don-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 60px;
  align-items: start;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.amount-card {
  background: var(--white);
  border: 2px solid var(--glass-bdr);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.amount-card h4 {
  font-family: var(--font-head);
  font-size: 1.8rem;
  color: var(--orange);
  margin-bottom: 8px;
}

.amount-card p {
  font-size: 0.95rem;
  color: var(--txt-muted);
  line-height: 1.4;
}

.amount-card:hover {
  border-color: var(--orange-lt);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.amount-card.active {
  border-color: var(--orange);
  background: rgba(232, 107, 44, 0.05);
}

.custom-amt-input {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border: 1px solid var(--glass-bdr);
  border-radius: 8px;
  font-family: var(--font-head);
  font-size: 1.2rem;
  color: var(--txt);
  background: white;
}

.custom-amt-input:focus {
  outline: none;
  border-color: var(--orange);
}

/* Trust Section */
.don-trust {
  background: var(--white);
  padding: 30px;
  border-radius: 16px;
  box-shadow: var(--shadow);
}

.don-trust h3 {
  font-family: var(--font-head);
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: var(--txt);
}

.trust-icons {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  color: var(--txt-muted);
}
.trust-item svg {
  color: #2E7D32;
}

/* Form Wrapper */
.don-form-wrapper {
  background: var(--white);
  padding: 40px;
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--glass-bdr);
}

.don-form-wrapper h3 {
  font-family: var(--font-head);
  font-size: 1.5rem;
  margin-bottom: 24px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.95rem;
  color: var(--txt);
}

.form-control {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--glass-bdr);
  border-radius: 8px;
  background: var(--cream);
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: var(--orange);
  background: var(--white);
  box-shadow: 0 0 0 3px rgba(232, 107, 44, 0.1);
}

.don-summary {
  background: var(--cream);
  padding: 20px;
  border-radius: 8px;
  margin-top: 30px;
  margin-bottom: 24px;
}

.don-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
}

.don-summary-row strong {
  font-family: var(--font-head);
  font-size: 1.5rem;
  color: var(--orange);
}

.w-100 {
  width: 100%;
}

.payment-error {
  background: #FFEbee;
  color: #c62828;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.95rem;
  border: 1px solid #ffcdd2;
  text-align: center;
}

/* Impact */
.don-impact {
  padding: 100px 0;
  background: var(--white);
}

.don-impact-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.don-impact-card {
  text-align: center;
  padding: 30px;
  border-radius: 16px;
  background: var(--cream);
  transition: transform 0.3s;
}

.don-impact-card:hover {
  transform: translateY(-5px);
}

.impact-icon {
  width: 64px;
  height: 64px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: var(--shadow);
}

.don-impact-card h4 {
  font-family: var(--font-head);
  font-size: 1.5rem;
  color: var(--orange);
  margin-bottom: 12px;
}

.don-impact-card p {
  color: var(--txt-muted);
  line-height: 1.6;
}

/* Success Page */
.don-success-sec {
  padding: 120px 0;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cream);
}

.success-icon-wrap {
  width: 100px;
  height: 100px;
  background: #E8F5E9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.success-icon {
  color: #2E7D32;
}

.success-sub {
  font-size: 1.2rem;
  color: var(--txt-muted);
  margin-bottom: 40px;
}

.receipt-card {
  background: var(--white);
  max-width: 600px;
  margin: 0 auto 40px;
  padding: 40px;
  border-radius: 16px;
  box-shadow: var(--shadow);
  text-align: left;
  border-top: 4px solid var(--orange);
}

.receipt-card h3 {
  font-family: var(--font-head);
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px dashed var(--glass-bdr);
}

.receipt-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 1.1rem;
}

.receipt-row span {
  color: var(--txt-muted);
}

.receipt-row strong {
  color: var(--txt);
}

.success-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Responsive */
@media (max-width: 1024px) {
  .don-grid {
    grid-template-columns: 1fr;
  }
  .don-impact-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .amount-grid {
    grid-template-columns: 1fr;
  }
  .don-impact-grid {
    grid-template-columns: 1fr;
  }
  .success-actions {
    flex-direction: column;
  }
}
\`;

fs.writeFileSync('donate.css', cssContent);

const jsContent = \`document.addEventListener("DOMContentLoaded", () => {
  let selectedAmount = 100;
  const displayAmount = document.getElementById('displayAmount');
  const amountCards = document.querySelectorAll('.amount-card');
  const customInput = document.getElementById('customAmount');
  const paymentError = document.getElementById('paymentError');
  const donateBtn = document.getElementById('donateBtn');

  // Amount selection
  amountCards.forEach(card => {
    card.addEventListener('click', () => {
      amountCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      if (card.classList.contains('custom-amount-card')) {
        customInput.style.display = 'block';
        customInput.focus();
        selectedAmount = parseInt(customInput.value) || 0;
      } else {
        customInput.style.display = 'none';
        selectedAmount = parseInt(card.getAttribute('data-amount'), 10);
      }
      updateDisplayAmount();
    });
  });

  customInput.addEventListener('input', (e) => {
    selectedAmount = parseInt(e.target.value) || 0;
    updateDisplayAmount();
  });

  function updateDisplayAmount() {
    displayAmount.innerText = '₹' + selectedAmount;
  }

  // Form submission & Razorpay
  const form = document.getElementById('donateForm');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    paymentError.style.display = 'none';

    if (selectedAmount < 1) {
      showError('Please select a valid amount.');
      return;
    }

    const donorName = document.getElementById('donorName').value;
    const donorEmail = document.getElementById('donorEmail').value;
    const donorPhone = document.getElementById('donorPhone').value;
    const donorPurpose = document.getElementById('donorPurpose').value;
    const donorCity = document.getElementById('donorCity').value;

    donateBtn.disabled = true;
    donateBtn.innerText = 'Processing...';

    try {
      // 1. Create order on backend
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedAmount,
          name: donorName,
          email: donorEmail,
          phone: donorPhone,
          purpose: donorPurpose
        })
      });

      const orderData = await res.json();
      
      if (!res.ok) throw new Error(orderData.error || 'Failed to create order');

      // 2. Setup Razorpay options
      const options = {
        key: 'rzp_test_SwK4brnrDOOszp', // The frontend requires the test key id to initialize checkout
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Act For Change Foundation",
        description: \`Donation for \${donorPurpose}\`,
        image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=100&q=80",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // 3. Verify payment on backend
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                donorDetails: { donorName, donorEmail, donorPhone, donorPurpose }
              })
            });
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              // 4. Save to DB
              const saveRes = await fetch('/api/save-donation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  paymentId: verifyData.paymentId,
                  orderId: verifyData.orderId,
                  name: donorName,
                  email: donorEmail,
                  phone: donorPhone,
                  amount: selectedAmount,
                  purpose: donorPurpose
                })
              });
              const saveData = await saveRes.json();
              if (saveData.success) {
                 // Store short data in localStorage for receipt
                 localStorage.setItem('recentDonation', JSON.stringify(saveData.donation));
                 window.location.href = 'donation-success.html';
              }
            } else {
              showError('Payment verification failed.');
            }
          } catch(err) {
            showError('Payment verification error.');
          }
        },
        prefill: {
          name: donorName,
          email: donorEmail,
          contact: donorPhone
        },
        theme: {
          color: "#E86B2C"
        }
      };

      const rzp1 = new Razorpay(options);
      
      rzp1.on('payment.failed', function (response){
         showError('Payment Failed: ' + response.error.description);
      });
      
      rzp1.open();

    } catch (err) {
      showError(err.message || 'Something went wrong. Please try again.');
    } finally {
      donateBtn.disabled = false;
      donateBtn.innerText = 'Proceed to Pay Securely';
    }
  });

  function showError(msg) {
    paymentError.innerText = msg;
    paymentError.style.display = 'block';
  }
});
\`;

fs.writeFileSync('donate.js', jsContent);

const successJs = \`document.addEventListener("DOMContentLoaded", () => {
    const dataStr = localStorage.getItem('recentDonation');
    if (dataStr) {
        try {
            const data = JSON.parse(dataStr);
            document.getElementById('rName').innerText = data.name || '-';
            document.getElementById('rAmount').innerText = '₹' + (data.amount || '0');
            document.getElementById('rTxn').innerText = data.paymentId || '-';
            
            const dateStr = data.date ? new Date(data.date).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            }) : '-';
            document.getElementById('rDate').innerText = dateStr;
            document.getElementById('rPurpose').innerText = data.purpose || 'General Donation';
            
            document.getElementById('downloadReceiptBtn').addEventListener('click', () => {
                const text = \`RECEIPT OF DONATION\\n\\nFoundation: Act For Change Foundation\\nDonor Name: \${data.name}\\nAmount: ₹\${data.amount}\\nDate: \${dateStr}\\nTransaction ID: \${data.paymentId}\\nPurpose: \${data.purpose}\\n\\nThank you for your generous support.\\\`;
                const blob = new Blob([text], {type: "text/plain"});
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = \`receipt_\${data.paymentId}.txt\`;
                a.click();
            });
            
        } catch(e) { console.error('Error parsing donation data', e); }
    } else {
        document.getElementById('receiptCard').style.display = 'none';
        document.getElementById('downloadReceiptBtn').style.display = 'none';
    }
});
\`;
fs.writeFileSync('donation-success.js', successJs);

// Update all Donate links to donate.html instead of home.html#donate
const allFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
allFiles.forEach(f => {
   let text = fs.readFileSync(f, 'utf8');
   text = text.replace(/home\\.html#donate/g, 'donate.html');
   text = text.replace(/href="#donate"/g, 'href="donate.html"');
   fs.writeFileSync(f, text);
});
