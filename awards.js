document.addEventListener("DOMContentLoaded", () => {
  // Counters Animation
  const statVals = document.querySelectorAll(".stat-counter");

  if (statVals.length > 0) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute("data-target"), 10);

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
      },
      { threshold: 0.5 },
    );

    statVals.forEach((val) => observer.observe(val));
  }
});
