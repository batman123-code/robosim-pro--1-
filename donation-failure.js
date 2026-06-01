// Show a specific failure reason if one was passed via ?reason= in the URL.
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const reason = params.get("reason");
  if (reason) {
    const el = document.getElementById("failReason");
    if (el) el.innerText = decodeURIComponent(reason).replace(/[<>]/g, "");
  }
});
