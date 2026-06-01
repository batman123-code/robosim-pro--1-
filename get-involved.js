/* ==========================================================================
   GET INVOLVED PAGE SCRIPT (PREMIUM VERSION)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // 1. HERO SLIDER AUTO ROTATION (CINEMATIC)
  const giSlides = document.querySelectorAll(".gi-slide");
  if (giSlides.length > 0) {
    let currentSlide = 0;
    setInterval(() => {
      giSlides[currentSlide].classList.remove("active");
      currentSlide = (currentSlide + 1) % giSlides.length;
      giSlides[currentSlide].classList.add("active");
    }, 8000); // 8 seconds per slide for cinematic feel
  }

  // 2. MAGNETIC EFFECTS FOR PREMIUM BUTTONS AND CARDS
  const magneticElements = document.querySelectorAll(".magnetic");
  magneticElements.forEach((el) => {
    el.addEventListener("mousemove", function (e) {
      const position = el.getBoundingClientRect();
      const x = e.pageX - position.left - position.width / 2;
      const y = e.pageY - position.top - position.height / 2;

      const strength =
        parseFloat(el.getAttribute("data-magnetic-strength")) || 0.3;

      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });

    el.addEventListener("mouseout", function () {
      el.style.transform = "translate(0px, 0px)";
      el.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
    });

    el.addEventListener("mouseenter", function () {
      el.style.transition = "none";
    });
  });

  // 3. OPPORTUNITY CARDS -> FORM PREFILL & SCROLL
  const selectOppBtns = document.querySelectorAll(".select-opp");
  const vTypeSelect = document.getElementById("vType");

  selectOppBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const type = btn.getAttribute("data-type");
      if (vTypeSelect && type) {
        Array.from(vTypeSelect.options).forEach((opt) => {
          if (opt.value === type) opt.selected = true;
        });
      }
      const formSection = document.getElementById("register");
      if (formSection) {
        formSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // 4. VOLUNTEER TESTIMONIALS CAROUSEL
  const vtTrack = document.getElementById("vtTrack");
  const vtCards = document.querySelectorAll(".vt-card");
  const vtDotsContainer = document.getElementById("vtDots");
  const vtPrev = document.getElementById("vtPrev");
  const vtNext = document.getElementById("vtNext");
  let vtCurrent = 0;

  if (vtTrack && vtCards.length > 0) {
    vtCards.forEach((_, i) => {
      const dot = document.createElement("div");
      dot.classList.add("t-dot");
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => vtGoTo(i));
      vtDotsContainer.appendChild(dot);
    });

    function vtGoTo(index) {
      vtCurrent = index;
      vtTrack.style.transform = `translateX(-${vtCurrent * 100}%)`;
      document.querySelectorAll("#vtDots .t-dot").forEach((d, i) => {
        d.classList.toggle("active", i === vtCurrent);
      });
    }

    if (vtNext) {
      vtNext.addEventListener("click", () => {
        let nextIdx = (vtCurrent + 1) % vtCards.length;
        vtGoTo(nextIdx);
      });
    }

    if (vtPrev) {
      vtPrev.addEventListener("click", () => {
        let prevIdx = (vtCurrent - 1 + vtCards.length) % vtCards.length;
        vtGoTo(prevIdx);
      });
    }
  }

  // 5. WHATSAPP DYNAMIC REGISTRATION FORM
  const volForm = document.getElementById("volunteerForm");
  if (volForm) {
    volForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const vType = document.getElementById("vType").value || "Not Specified";
      const fName = document.getElementById("vFirstName").value || "";
      const lName = document.getElementById("vLastName").value || "";
      const vEmail = document.getElementById("vEmail").value || "";
      const vPhone = document.getElementById("vPhone").value || "";
      const vDob = document.getElementById("vDob").value || "";
      const vCountry = document.getElementById("vCountry").value || "";
      const vState = document.getElementById("vState").value || "";
      const vCity = document.getElementById("vCity").value || "";
      const vPincode = document.getElementById("vPincode").value || "";
      const vDuration =
        document.getElementById("vDuration").value || "Not Specified";
      const vMessage =
        document.getElementById("vMessage").value || "No additional message.";

      const fullName = `${fName} ${lName}`.trim();

      let waMsg = `## ACT FOR CHANGE VOLUNTEER APPLICATION

`;
      waMsg += `Volunteer Type:
[${vType}]

`;
      waMsg += `Name:
[${fullName}]

`;
      waMsg += `Email:
[${vEmail}]

`;
      waMsg += `Phone:
[${vPhone}]

`;
      waMsg += `DOB:
[${vDob}]

`;
      waMsg += `Country:
[${vCountry}]

`;
      waMsg += `State:
[${vState}]

`;
      waMsg += `City:
[${vCity}]

`;
      waMsg += `Pincode:
[${vPincode}]

`;
      waMsg += `Duration:
[${vDuration}]

`;
      waMsg += `Message:
[${vMessage}]

`;
      waMsg += `---
Submitted From:
Act For Change Website
----------------------`;

      const encodedMsg = encodeURIComponent(waMsg);
      const waNumber = "8697059072";
      window.open(`https://wa.me/${waNumber}?text=${encodedMsg}`, "_blank");
    });
  }

  // 6. FAQ DATA AND RENDER (PREMIUM ACCORDION)
  const faqData = [
    {
      q: "What is the remote volunteering program at Act For Change Foundation?",
      a: "The remote volunteering program allows passionate individuals to contribute their skills in areas like digital marketing, content writing, design, and research from anywhere in the world. It provides flexibility while ensuring you create a genuine social impact in underprivileged communities without being physically on-site.",
    },
    {
      q: "Who can join the remote volunteering program?",
      a: "Anyone with a passion for social change and the necessary skillset for specific opportunities can join. Whether you are a college student looking for experience, a working professional wanting to give back over weekends, or an active retiree, our remote programs are tailored to utilize your unique strengths.",
    },
    {
      q: "How does remote volunteering create real impact?",
      a: "Remote volunteers amplify our voice and capabilities. For instance, a beautifully designed campaign can raise funds that directly sponsor a child's education. Content writers spread awareness that influences policy change. Behind-the-scenes digital efforts directly fuel our on-ground fieldwork.",
    },
    {
      q: "Why does Act For Change Foundation not offer free or observational internships?",
      a: "We believe in hands-on, accountable contributions. Observational internships often lack the rigorous engagement required to create meaningful social transformation. We assign real projects to our volunteers so they can take ownership, learn tangible skills, and see the direct outcome of their efforts.",
    },
    {
      q: "What do volunteers gain from this program?",
      a: "Beyond the profound satisfaction of serving humanity, volunteers gain practical experience, leadership skills, and an authentic certificate of appreciation. Exceptional volunteers receive letters of recommendation. Importantly, you become part of an elite nationwide network of change-makers.",
    },
    {
      q: "What kind of work do remote volunteers do?",
      a: "Remote volunteers engage in diverse tasks including managing social media campaigns, designing graphics and visual stories, researching public policies, developing grant proposals, organizing online fundraisers, and creating educational modules for our field centers.",
    },
    {
      q: "Can international volunteers participate in this program?",
      a: "Yes, our remote volunteering program welcomes passionate individuals from around the world. As long as you have a stable internet connection and are committed to our cause, you can contribute from anywhere and help drive our global mission forward.",
    },
    {
      q: "How do donations support the work of Act For Change Foundation?",
      a: "Donations are the lifeblood of our on-ground activities. Every contribution goes toward funding grassroots programs—from supplying educational materials for underprivileged children to funding community healthcare and sustainability drives. Financial transparency is a core value.",
    },
    {
      q: "Can volunteers contribute through both time and resources?",
      a: "Absolutely. Many of our volunteers choose to make a dual impact by contributing their time to our programs while also supporting us financially through donations. Every effort, whether through skilled work or financial aid, accelerates our humanitarian goals.",
    },
    {
      q: "Is this program suitable for college students and interns?",
      a: "Yes, this program is highly suitable for college students. It provides a structured environment where interns can apply academic knowledge to real-world social challenges, earn recognized certificates, and develop leadership skills that enhance their professional profiles.",
    },
  ];

  const faqContainer = document.getElementById("giFaqList");
  if (faqContainer) {
    faqData.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "gi-faq-card reveal";
      card.style.setProperty("--d", `${0.1 + index * 0.05}s`);

      card.innerHTML = `
                <button class="gi-faq-btn" aria-expanded="false">
                    ${item.q}
                    <div class="gi-faq-icon"></div>
                </button>
                <div class="gi-faq-content">
                    <div class="gi-faq-inner">
                        ${item.a}
                    </div>
                </div>
            `;

      const btn = card.querySelector(".gi-faq-btn");
      const content = card.querySelector(".gi-faq-content");

      btn.addEventListener("click", () => {
        const isActive = card.classList.contains("active");

        faqContainer.querySelectorAll(".gi-faq-card").forEach((c) => {
          c.classList.remove("active");
          c.querySelector(".gi-faq-btn").setAttribute("aria-expanded", "false");
          c.querySelector(".gi-faq-content").style.maxHeight = null;
        });

        if (!isActive) {
          card.classList.add("active");
          btn.setAttribute("aria-expanded", "true");
          content.style.maxHeight = content.scrollHeight + "px";
        }
      });

      faqContainer.appendChild(card);
    });
  }
});

/* ── Scroll Velocity Marquee ───────────────── */
(function initScrollVelocity() {
  const tracks = document.querySelectorAll(".marquee-track");
  if (!tracks.length) return;

  let lastScrollY = window.scrollY;
  let currentVelocity = 1;
  let targetVelocity = 1;
  let isScrolling = false;
  let scrollTimeout;

  const baseSpeed = 1;
  const maxSpeed = 8;
  const acceleration = 0.5;
  const damping = 0.92;

  window.addEventListener(
    "scroll",
    () => {
      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      // Calculate velocity based on scroll delta
      let addedVelocity = Math.abs(deltaY) * 0.05;
      targetVelocity = Math.min(baseSpeed + addedVelocity, maxSpeed);

      isScrolling = true;
      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        targetVelocity = baseSpeed;
        isScrolling = false;
      }, 50);
    },
    { passive: true },
  );

  function render() {
    // Smoothly interpolate current velocity towards target
    currentVelocity += (targetVelocity - currentVelocity) * 0.1;

    // Apply damping if not scrolling
    if (!isScrolling && currentVelocity > baseSpeed) {
      currentVelocity *= damping;
      if (currentVelocity < baseSpeed + 0.1) {
        currentVelocity = baseSpeed;
      }
    }

    // Apply playback rate to CSS animations
    tracks.forEach((track) => {
      const animations = track.getAnimations();
      animations.forEach((anim) => {
        anim.playbackRate = currentVelocity;
      });
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
