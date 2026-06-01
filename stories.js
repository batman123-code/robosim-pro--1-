document.addEventListener("DOMContentLoaded", () => {
  // Counters Animation
  const statVals = document.querySelectorAll(".stat-val");

  if (statVals.length > 0) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const text = el.innerText;
            // Extract numeric part
            const numMatch = text.match(/[\d,]+/);
            if (numMatch) {
              const numStr = numMatch[0].replace(/,/g, "");
              const target = parseInt(numStr, 10);
              const prefix = text.split(numMatch[0])[0];
              const suffix = text.split(numMatch[0])[1];

              let current = 0;
              const duration = 2000;
              const stepTime = Math.max(16, duration / target);
              const increment = Math.max(
                1,
                Math.ceil(target / (duration / 16)),
              );

              const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                  current = target;
                  clearInterval(timer);
                }
                el.innerText = prefix + current.toLocaleString() + suffix;
              }, stepTime);
            }
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.5 },
    );

    statVals.forEach((val) => observer.observe(val));
  }
});
