/* ════════════════════════════════════════════
   ACT FOR CHANGE  —  RESOURCES.JS
   Logic for Gallery, Models, Slider, Stories
════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  // 1. HERO SLIDER
  const slider = document.getElementById("resSlider");
  if (slider) {
    const slides = slider.querySelectorAll(".wwa-slide");
    let currentSlide = 0;
    const slideDuration = 4500; // 4.5 seconds
    function nextSlide() {
      slides[currentSlide].classList.remove("active");
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add("active");
    }
    if (slides.length > 1) {
      setInterval(nextSlide, slideDuration);
    }
  }

  // 2. RESOURCE GALLERY (INSTAGRAM DATA)
  const galleryData = [
    {
      img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80",
      desc: "Our volunteers painting a new future for the children of Ananda village.",
      link: "https://instagram.com/actforchange.trust",
      type: "Post",
    },
    {
      img: "https://images.unsplash.com/photo-1593113565694-c6f13e2fceae?w=600&q=80",
      desc: "Distributing books and learning materials in rural outskirts.",
      link: "https://instagram.com/actforchange.trust",
      type: "Carousel",
    },
    {
      img: "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=600&q=80",
      desc: "Empowerment workshops changing the narrative for local artisans.",
      link: "https://instagram.com/actforchange.trust",
      type: "Reel",
    },
    {
      img: "https://images.unsplash.com/photo-1510427806558-f9b2dceea47c?w=600&q=80",
      desc: "Healthcare checkup camps bringing doctors to doorsteps.",
      link: "https://instagram.com/actforchange.trust",
      type: "Post",
    },
    {
      img: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80",
      desc: "Clean environment initiative — plant a tree, plant hope.",
      link: "https://instagram.com/actforchange.trust",
      type: "Reel",
    },
    {
      img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80",
      desc: "The smiles that keep us moving forward every single day.",
      link: "https://instagram.com/actforchange.trust",
      type: "Post",
    },
  ];

  const galleryContainer = document.querySelector(".res-masonry");
  if (galleryContainer) {
    galleryData.forEach((item) => {
      const el = document.createElement("div");
      el.className = "res-masonry-item";
      el.innerHTML = `
        <img src="${item.img}" alt="Gallery Image" loading="lazy">
        <svg class="res-insta-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        <div class="res-insta-overlay">
          <p>${item.desc}</p>
        </div>
      `;

      // Single Click: Open Lightbox
      let clickTimeout;
      el.addEventListener("click", (e) => {
        if (clickTimeout) clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
          openLightbox(item);
        }, 200);
      });

      // Double Click: Go to Instagram
      el.addEventListener("dblclick", (e) => {
        clearTimeout(clickTimeout);
        window.open(item.link, "_blank");
      });

      // Mobile Touch Hold (simulating long press context menu / open to external)
      let touchTimeout;
      el.addEventListener(
        "touchstart",
        () => {
          touchTimeout = setTimeout(() => {
            window.open(item.link, "_blank");
          }, 800);
        },
        { passive: true },
      );
      el.addEventListener("touchend", () => {
        clearTimeout(touchTimeout);
      });
      el.addEventListener("touchmove", () => {
        clearTimeout(touchTimeout);
      });

      galleryContainer.appendChild(el);
    });
  }

  // 3. LIGHTBOX LOGIC
  const lightbox = document.getElementById("resLightbox");
  const lightboxClose = document.getElementById("resLightboxClose");

  function openLightbox(item) {
    document.getElementById("resLightboxImg").src = item.img;
    document.getElementById("resLightboxDesc").textContent = item.desc;
    document.getElementById("resLightboxType").textContent = item.type;
    document.getElementById("resLightboxLink").href = item.link;

    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  if (lightboxClose) {
    lightboxClose.addEventListener("click", () => {
      lightbox.classList.remove("active");
      document.body.style.overflow = "";
    });

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove("active");
        document.body.style.overflow = "";
      }
    });

    // ESC to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("active")) {
        lightbox.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }

  // 4. DONORS SPEAK SLIDER
  const donorsData = [
    {
      name: "Dr. Ananya Sharma",
      title: "Medical Professional",
      img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80",
      quote:
        "Act For Change brings true sincerity to their medical camps. Seeing the elderly get the care they desperately need reaffirmed my belief in their grassroots approach.",
    },
    {
      name: "Rohan Chatterjee",
      title: "Corporate Sponsor",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
      quote:
        "Efficiency, transparency, and a relentless drive. Sponsoring their education programs has been one of the most fulfilling CSR initiatives our company has ever undertaken.",
    },
    {
      name: "Meera Desai",
      title: "Philanthropist",
      img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80",
      quote:
        "I visited their rural livelihood center and was amazed by the transformation. The women are not just earning, they are leading their communities with newfound confidence.",
    },
    {
      name: "Vikram Singh",
      title: "Monthly Donor",
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80",
      quote:
        "The transparency they maintain with donors is unmatched. I receive regular updates, and knowing exactly whose life I am impacting makes all the difference.",
    },
    {
      name: "Kavita Reddy",
      title: "Education Advocate",
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
      quote:
        "Watching school dropouts return to classrooms because of Act For Change’s intervention is nothing short of miraculous. They are securing the future of this nation.",
    },
    {
      name: "Amit Patel",
      title: "Small Business Owner",
      img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80",
      quote:
        "What impressed me most is how they utilize local resources and empower people to eventually sustain themselves. It's a hand-up, not a hand-out.",
    },
  ];

  const donorSlider = document.querySelector(".res-donor-slider");
  if (donorSlider) {
    // Generate slides
    donorsData.forEach((donor, idx) => {
      const el = document.createElement("div");
      el.className = `res-donor-slide ${idx === 0 ? "active" : ""}`;
      el.dataset.index = idx;
      el.innerHTML = `
        <div class="res-quote-icon">"</div>
        <p class="res-donor-quote">${donor.quote}</p>
        <div class="res-donor-author">
          <img src="${donor.img}" alt="${donor.name}" class="res-donor-img" />
          <div class="res-donor-info" style="text-align:left;">
            <h4>${donor.name}</h4>
            <span>${donor.title}</span>
          </div>
        </div>
      `;
      donorSlider.appendChild(el);
    });

    // Add Controls
    const ctrlWrap = document.createElement("div");
    ctrlWrap.className = "res-donor-controls";
    ctrlWrap.innerHTML = `
      <button class="res-donor-ctrl" id="resDonorPrev">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button class="res-donor-ctrl" id="resDonorNext">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    `;
    donorSlider.parentNode.appendChild(ctrlWrap);

    let currentD = 0;
    const slidesD = donorSlider.querySelectorAll(".res-donor-slide");

    function showDonor(index, dir) {
      slidesD.forEach((s) => {
        s.classList.remove("active", "prev");
        if (dir === "left") {
          s.style.transform = "translateX(-40px)";
        } else {
          s.style.transform = "translateX(40px)";
        }
      });

      currentD = (index + slidesD.length) % slidesD.length;
      slidesD[currentD].classList.add("active");
      slidesD[currentD].style.transform = "translateX(0)";
    }

    document.getElementById("resDonorPrev").addEventListener("click", () => {
      showDonor(currentD - 1, "left");
    });

    document.getElementById("resDonorNext").addEventListener("click", () => {
      showDonor(currentD + 1, "right");
    });

    // Auto Play Donors
    let donorInterval = setInterval(() => {
      showDonor(currentD + 1, "right");
    }, 6000);
    donorSlider.parentNode.addEventListener("mouseenter", () =>
      clearInterval(donorInterval),
    );
    donorSlider.parentNode.addEventListener("mouseleave", () => {
      donorInterval = setInterval(() => {
        showDonor(currentD + 1, "right");
      }, 6000);
    });

    // Mobile Swipe
    let touchStartX = 0;
    let touchEndX = 0;

    donorSlider.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true },
    );

    donorSlider.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      },
      { passive: true },
    );

    function handleSwipe() {
      if (touchEndX < touchStartX - 50) showDonor(currentD + 1, "right"); // swipe left -> next
      if (touchEndX > touchStartX + 50) showDonor(currentD - 1, "left"); // swipe right -> prev
    }
  }

  // 5. FULL STORY EXPERIENCE
  // Logic migrated to dedicated story pages

  // 6. Interaction observer logic is handled globally by home.js scroll reveal logic.
});
