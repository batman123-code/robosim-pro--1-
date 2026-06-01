document.addEventListener("DOMContentLoaded", () => {
  const dataStr = localStorage.getItem("recentDonation");
  if (dataStr) {
    try {
      const data = JSON.parse(dataStr);
      document.getElementById("rName").innerText = data.name || "-";
      document.getElementById("rAmount").innerText = "₹" + (data.amount || "0");
      document.getElementById("rTxn").innerText = data.paymentId || "-";

      const dateStr = data.date
        ? new Date(data.date).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-";
      document.getElementById("rDate").innerText = dateStr;
      document.getElementById("rPurpose").innerText =
        data.purpose || "General Donation";

      document
        .getElementById("downloadReceiptBtn")
        .addEventListener("click", () => {
          const text = `RECEIPT OF DONATION\n\nFoundation: Act For Change Foundation\nDonor Name: ${data.name}\nAmount: ₹${data.amount}\nDate: ${dateStr}\nTransaction ID: ${data.paymentId}\nPurpose: ${data.purpose}\n\nThank you for your generous support.`;
          const blob = new Blob([text], { type: "text/plain" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `receipt_${data.paymentId}.txt`;
          a.click();
        });
    } catch (e) {
      console.error("Error parsing donation data", e);
    }
  } else {
    document.getElementById("receiptCard").style.display = "none";
    document.getElementById("downloadReceiptBtn").style.display = "none";
  }
});
