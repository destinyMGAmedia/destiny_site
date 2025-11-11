// ==================== MOBILE MENU TOGGLE ====================
const toggleBtn = document.querySelector(".mobile-toggle");
const navMenu = document.querySelector(".nav ul");
const navLinks = document.querySelectorAll(".nav a");

function toggleMenu() {
  const isActive = navMenu.classList.toggle("active");
  toggleBtn.textContent = isActive ? "✖" : "☰";
}

function closeMenu() {
  navMenu.classList.remove("active");
  toggleBtn.textContent = "☰";
}

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

// ==================== TAB SWITCHING ====================
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ==================== AMOUNT SELECTION ====================
document.querySelectorAll(".amount-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".amount-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ==================== TESTIMONY SHARE FORM ====================
const shareBtn = document.getElementById("shareBtn");
const testimonyForm = document.getElementById("testimonyForm");
const cancelBtn = document.getElementById("cancelBtn");

if (shareBtn && testimonyForm && cancelBtn) {
  shareBtn.addEventListener("click", () => {
    testimonyForm.classList.remove("hidden");
    shareBtn.style.display = "none";
  });

  cancelBtn.addEventListener("click", () => {
    testimonyForm.classList.add("hidden");
    shareBtn.style.display = "inline-block";
  });
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
  testimonyTrack.style.transform = `translateX(-${index * 100}%)`;
  testimonySlides.forEach((slide, i) => slide.classList.toggle("active", i === index));
  testimonyDots.forEach((dot, i) => dot.classList.toggle("active", i === index));
  testimonyIndex = index;
}

if (testimonyNext && testimonyPrev) {
  testimonyNext.addEventListener("click", () => {
    testimonyIndex = (testimonyIndex + 1) % totalTestimonySlides;
    goToSlide(testimonyIndex);
  });

  testimonyPrev.addEventListener("click", () => {
    testimonyIndex = (testimonyIndex - 1 + totalTestimonySlides) % totalTestimonySlides;
    goToSlide(testimonyIndex);
  });
}

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
  const offset = -index * 100;
  galleryTrack.style.transform = `translateX(${offset}%)`;

  galleryDots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });
}

if (galleryNext && galleryPrev) {
  galleryNext.addEventListener("click", () => {
    galleryIndex = (galleryIndex + 1) % totalGallerySlides;
    updateGallery(galleryIndex);
  });

  galleryPrev.addEventListener("click", () => {
    galleryIndex = (galleryIndex - 1 + totalGallerySlides) % totalGallerySlides;
    updateGallery(galleryIndex);
  });
}

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

// === Initialize both carousels ===
goToSlide(testimonyIndex);
updateGallery(galleryIndex);
