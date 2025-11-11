document.addEventListener("DOMContentLoaded", () => {
    // ==================== FOOTER YEAR ====================
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  
    // ==================== MOBILE MENU TOGGLE ====================
    const toggleBtn = document.querySelector(".mobile-toggle");
    const navMenu = document.querySelector(".nav ul");
    const navLinks = document.querySelectorAll(".nav a");
  
    if (toggleBtn && navMenu) {
      const toggleMenu = () => {
        const isActive = navMenu.classList.toggle("active");
        toggleBtn.textContent = isActive ? "✖" : "☰";
      };
  
      const closeMenu = () => {
        navMenu.classList.remove("active");
        toggleBtn.textContent = "☰";
      };
  
      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMenu();
      });
  
      navLinks.forEach((link) => link.addEventListener("click", closeMenu));
  
      document.addEventListener("click", (e) => {
        if (
          navMenu.classList.contains("active") &&
          !navMenu.contains(e.target) &&
          !toggleBtn.contains(e.target)
        ) {
          closeMenu();
        }
      });
    }
  
    // ==================== MODAL (EVENT REGISTRATION) ====================
    const modal = document.getElementById("eventModal");
    const closeBtn = document.querySelector(".close-btn");
    const registerBtns = document.querySelectorAll(".register-btn");
    const eventNameInput = document.getElementById("eventName");
    const modalTitle = document.getElementById("modalTitle");
  
    if (modal && closeBtn && registerBtns.length > 0) {
      registerBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const eventTitle = btn.getAttribute("data-event");
          modalTitle.textContent = `Register for ${eventTitle}`;
          eventNameInput.value = eventTitle;
          modal.classList.remove("hidden");
        });
      });
  
      closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
  
      window.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.add("hidden");
      });
  
      const eventForm = document.getElementById("eventForm");
      if (eventForm) {
        eventForm.addEventListener("submit", function (e) {
          e.preventDefault();
          alert("Thank you for registering! We’ll contact you soon.");
          modal.classList.add("hidden");
          this.reset();
        });
      }
    }
  
    // ==================== TESTIMONY CAROUSEL ====================
    const testimonyTrack = document.querySelector(".carousel-track");
    const testimonySlides = document.querySelectorAll(".carousel-slide");
    const testimonyDots = document.querySelectorAll(".dot");
    const testimonyNext = document.querySelector(".carousel-next");
    const testimonyPrev = document.querySelector(".carousel-prev");
    const testimonyContainer = document.querySelector(".carousel-container");
  
    let testimonyIndex = 0;
    const totalTestimonySlides = testimonySlides.length;
  
    function goToSlide(index) {
      if (!testimonyTrack) return;
      testimonyTrack.style.transform = `translateX(-${index * 100}%)`;
      testimonySlides.forEach((slide, i) =>
        slide.classList.toggle("active", i === index)
      );
      testimonyDots.forEach((dot, i) =>
        dot.classList.toggle("active", i === index)
      );
      testimonyIndex = index;
    }
  
    if (testimonyNext && testimonyPrev && totalTestimonySlides > 0) {
      testimonyNext.addEventListener("click", () => {
        testimonyIndex = (testimonyIndex + 1) % totalTestimonySlides;
        goToSlide(testimonyIndex);
      });
  
      testimonyPrev.addEventListener("click", () => {
        testimonyIndex = (testimonyIndex - 1 + totalTestimonySlides) % totalTestimonySlides;
        goToSlide(testimonyIndex);
      });
  
      testimonyDots.forEach((dot, i) =>
        dot.addEventListener("click", () => goToSlide(i))
      );
  
      let testimonyAutoPlay = setInterval(() => {
        testimonyIndex = (testimonyIndex + 1) % totalTestimonySlides;
        goToSlide(testimonyIndex);
      }, 8000);
  
      if (testimonyContainer) {
        testimonyContainer.addEventListener("mouseenter", () => clearInterval(testimonyAutoPlay));
        testimonyContainer.addEventListener("mouseleave", () => {
          testimonyAutoPlay = setInterval(() => {
            testimonyIndex = (testimonyIndex + 1) % totalTestimonySlides;
            goToSlide(testimonyIndex);
          }, 8000);
        });
      }
  
      goToSlide(testimonyIndex);
    }
  
    // ==================== GALLERY CAROUSEL ====================
    const galleryTrack = document.querySelector(".gallery-track");
    const gallerySlides = galleryTrack ? Array.from(galleryTrack.children) : [];
    const galleryNext = document.querySelector(".gallery-next");
    const galleryPrev = document.querySelector(".gallery-prev");
    const galleryDots = Array.from(document.querySelectorAll(".g-dot"));
    const galleryCarousel = document.querySelector(".gallery-carousel");
  
    let galleryIndex = 0;
    const totalGallerySlides = gallerySlides.length;
  
    function updateGallery(index) {
      if (!galleryTrack) return;
      const offset = -index * 100;
      galleryTrack.style.transform = `translateX(${offset}%)`;
      galleryDots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    }
  
    if (galleryNext && galleryPrev && totalGallerySlides > 0) {
      galleryNext.addEventListener("click", () => {
        galleryIndex = (galleryIndex + 1) % totalGallerySlides;
        updateGallery(galleryIndex);
      });
  
      galleryPrev.addEventListener("click", () => {
        galleryIndex = (galleryIndex - 1 + totalGallerySlides) % totalGallerySlides;
        updateGallery(galleryIndex);
      });
  
      galleryDots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
          galleryIndex = i;
          updateGallery(galleryIndex);
        });
      });
  
      let galleryAutoPlay = setInterval(() => {
        galleryIndex = (galleryIndex + 1) % totalGallerySlides;
        updateGallery(galleryIndex);
      }, 6000);
  
      if (galleryCarousel) {
        galleryCarousel.addEventListener("mouseenter", () => clearInterval(galleryAutoPlay));
        galleryCarousel.addEventListener("mouseleave", () => {
          galleryAutoPlay = setInterval(() => {
            galleryIndex = (galleryIndex + 1) % totalGallerySlides;
            updateGallery(galleryIndex);
          }, 6000);
        });
      }
  
      updateGallery(galleryIndex);
    }
  });
  