import { getUser, authHeader, apiUrl } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  let selectedAmount = 100;
  const displayAmount = document.getElementById("displayAmount");
  const amountCards = document.querySelectorAll(".amount-card");
  const customInput = document.getElementById("customAmount");
  const paymentError = document.getElementById("paymentError");
  const donateBtn = document.getElementById("donateBtn");

  // Prefill the form for logged-in donors (guests just fill it in).
  const currentUser = getUser();
  if (currentUser) {
    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el && v && !el.value) el.value = v;
    };
    setVal("donorName", currentUser.name);
    setVal("donorEmail", currentUser.email);
    setVal("donorPhone", currentUser.phone);
  }

  // Amount selection
  amountCards.forEach((card) => {
    card.addEventListener("click", () => {
      amountCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");

      if (card.classList.contains("custom-amount-card")) {
        customInput.style.display = "block";
        customInput.focus();
        selectedAmount = parseInt(customInput.value) || 0;
      } else {
        customInput.style.display = "none";
        selectedAmount = parseInt(card.getAttribute("data-amount"), 10);
      }
      updateDisplayAmount();
    });
  });

  if (customInput) {
    customInput.addEventListener("input", (e) => {
      selectedAmount = parseInt(e.target.value) || 0;
      updateDisplayAmount();
    });
  }

  function updateDisplayAmount() {
    if (displayAmount) {
      displayAmount.innerText = "₹" + selectedAmount;
    }
  }

  // Form submission & Razorpay
  const form = document.getElementById("donateForm");
  const processingOverlay = document.getElementById("processingOverlay");
  const failureOverlay = document.getElementById("failureOverlay");
  const failureMessage = document.getElementById("failureMessage");

  if (document.getElementById("retryBtn")) {
    document.getElementById("retryBtn").addEventListener("click", () => {
      failureOverlay.style.display = "none";
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (paymentError) paymentError.style.display = "none";

      if (selectedAmount < 1) {
        showError("Please select a valid amount.");
        return;
      }

      const donorName = document.getElementById("donorName").value.trim();
      const donorEmail = document.getElementById("donorEmail").value.trim();
      const donorPhone = document.getElementById("donorPhone").value.trim();
      const donorPurpose = document.getElementById("donorPurpose").value;
      const donorCity = document.getElementById("donorCity").value.trim();
      const donorMessage = (
        document.getElementById("donorMessage")?.value || ""
      ).trim();

      // Frontend validation (server re-validates too)
      if (!donorName) return showError("Please enter your full name.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail))
        return showError("Please enter a valid email address.");
      if (!/^[0-9]{10}$/.test(donorPhone.replace(/\D/g, "").slice(-10)))
        return showError("Please enter a valid 10-digit phone number.");
      if (!donorPurpose) return showError("Please select a donation purpose.");

      donateBtn.disabled = true;
      if (processingOverlay) {
        processingOverlay.style.display = "flex";
        const h3 = processingOverlay.querySelector("h3");
        if (h3) h3.innerText = "Securely Connecting to Razorpay";
      }

      try {
        // 1. Create order on backend (with a 10s timeout — never hang forever)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        let res;
        try {
          console.log("[donate] Creating Razorpay order for ₹" + selectedAmount);
          res = await fetch(apiUrl("/api/create-order"), {
            method: "POST",
            headers: { "Content-Type": "application/json", ...(await authHeader()) },
            body: JSON.stringify({
              amount: selectedAmount,
              name: donorName,
              email: donorEmail,
              phone: donorPhone,
              city: donorCity,
              purpose: donorPurpose,
              message: donorMessage,
            }),
            signal: controller.signal,
          });
        } catch (netErr) {
          if (netErr.name === "AbortError")
            throw new Error(
              "Connection timed out. Please check your network and retry.",
            );
          throw new Error("Network error. Please check your connection.");
        } finally {
          clearTimeout(timeoutId);
        }

        // Guard against non-JSON responses (e.g. a static server with no
        // backend returns a 404 HTML page). Show a clear message instead of a
        // cryptic JSON parse error.
        let orderData;
        try {
          orderData = await res.json();
        } catch (parseErr) {
          throw new Error(
            "Unable to connect to the donation server. Please try again later.",
          );
        }

        if (!res.ok)
          throw new Error(orderData.error || "Failed to create order");

        console.log("[donate] Order created:", orderData.id);

        if (!orderData.key_id) {
          throw new Error(
            "Payment is not configured on the server. Please try again later.",
          );
        }

        // The Razorpay checkout SDK must be loaded. In Chrome it is frequently
        // blocked by ad-blockers / privacy extensions / tracking protection —
        // detect that explicitly instead of throwing a cryptic error.
        if (typeof Razorpay === "undefined") {
          throw new Error(
            "Unable to initialize payment. The secure checkout was blocked — " +
              "please disable any ad-blocker for this site and try again.",
          );
        }

        // 2. Setup Razorpay options (key id comes from the backend, not hardcoded)
        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Act For Change Foundation",
          description: "Donation for " + donorPurpose,
          image:
            "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=100&q=80",
          order_id: orderData.id,
          handler: async function (response) {
            if (processingOverlay) {
              processingOverlay.style.display = "flex";
              const h3 = processingOverlay.querySelector("h3");
              if (h3) h3.innerText = "Verifying Payment...";
            }
            try {
              // 3. Verify payment on backend
              console.log("[donate] Verifying payment:", response.razorpay_payment_id);
              const verifyRes = await fetch(apiUrl("/api/verify-payment"), {
                method: "POST",
                headers: { "Content-Type": "application/json", ...(await authHeader()) },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  donorDetails: {
                    donorName,
                    donorEmail,
                    donorPhone,
                    donorPurpose,
                  },
                }),
              });
              const verifyData = await verifyRes.json();

              if (verifyData.success && verifyData.donation) {
                // Donation is already persisted server-side from the trusted
                // order amount. Store the authoritative record for the receipt.
                localStorage.setItem(
                  "recentDonation",
                  JSON.stringify(verifyData.donation),
                );
                window.location.href = "donation-success.html";
              } else {
                showFailureOverlay(
                  verifyData.message || "Payment verification failed.",
                );
              }
            } catch (err) {
              showFailureOverlay("Payment verification error.");
            }
          },
          prefill: {
            name: donorName,
            email: donorEmail,
            contact: donorPhone,
          },
          theme: {
            color: "#E86B2C",
          },
          modal: {
            ondismiss: function () {
              if (processingOverlay) processingOverlay.style.display = "none";
              donateBtn.disabled = false;
            },
          },
        };

        const rzp1 = new Razorpay(options);

        rzp1.on("payment.failed", function (response) {
          if (processingOverlay) processingOverlay.style.display = "none";
          showFailureOverlay("Payment Failed: " + response.error.description);
        });

        // Small delay to ensure overlay shows briefly before Razorpay handles UI
        setTimeout(() => {
          if (processingOverlay) processingOverlay.style.display = "none";
          rzp1.open();
        }, 500);
      } catch (err) {
        console.error("[donate] Payment error:", err);
        showFailureOverlay(
          err.message || "Something went wrong. Please try again.",
        );
        if (processingOverlay) processingOverlay.style.display = "none";
        donateBtn.disabled = false;
      }
    });
  }

  function showFailureOverlay(msg) {
    if (failureMessage) failureMessage.innerText = msg;
    if (failureOverlay) failureOverlay.style.display = "flex";
    donateBtn.disabled = false;
  }

  function showError(msg) {
    if (paymentError) {
      paymentError.innerText = msg;
      paymentError.style.display = "block";
    } else {
      alert(msg);
    }
  }
});
