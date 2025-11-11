// ===== AUTO YEAR =====
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== FORM TOGGLE =====
const shareBtn = document.getElementById("shareBtn");
const cancelBtn = document.getElementById("cancelBtn");
const form = document.getElementById("testimonyForm");

if (shareBtn && cancelBtn && form) {
  shareBtn.addEventListener("click", () => form.classList.toggle("hidden"));
  cancelBtn.addEventListener("click", () => form.classList.add("hidden"));
}

// ===== CAROUSEL =====
const track = document.querySelector(".carousel-track");
const slides = Array.from(track.children);
const nextBtn = document.querySelector(".carousel-next");
const prevBtn = document.querySelector(".carousel-prev");

let index = 0;

function updateCarousel() {
  slides.forEach((slide, i) =>
    slide.classList.toggle("active", i === index)
  );
  track.style.transform = `translateX(-${index * 100}%)`;
}

nextBtn.addEventListener("click", () => {
  index = (index + 1) % slides.length;
  updateCarousel();
});

prevBtn.addEventListener("click", () => {
  index = (index - 1 + slides.length) % slides.length;
  updateCarousel();
});

// Auto play every 5s
setInterval(() => {
  index = (index + 1) % slides.length;
  updateCarousel();
}, 5000);
