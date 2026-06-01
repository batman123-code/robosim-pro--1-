/* ═══════════════════════════════════════
   WHO WE ARE PAGE JS
═══════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  // Hero Slider Logic
  const slider = document.getElementById("wwaSlider");
  if (slider) {
    const slides = slider.querySelectorAll(".wwa-slide");
    let currentSlide = 0;
    const slideDuration = 6000; // 6 seconds

    function nextSlide() {
      slides[currentSlide].classList.remove("active");
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add("active");
    }

    if (slides.length > 1) {
      setInterval(nextSlide, slideDuration);
    }
  }

  // ChromaGrid Spotligt Effect
  const cgCards = document.querySelectorAll(".cg-card");

  cgCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      card.style.setProperty("--mouse-x", x + "%");
      card.style.setProperty("--mouse-y", y + "%");
    });
  });
});
