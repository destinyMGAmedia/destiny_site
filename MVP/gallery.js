// Safe Auto Year — guard existence
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Lightbox functionality (custom)
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

// Only attach handlers if elements exist
if (lightbox && lightboxImg && lightboxClose) {
  document.querySelectorAll(".gallery-item img").forEach((img) => {
    img.addEventListener("click", () => {
      lightbox.style.display = "flex";
      // set src and alt for accessibility
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || "Full view";
      // prevent page scrolling while lightbox open
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    });
  });

  lightboxClose.addEventListener("click", () => {
    lightbox.style.display = "none";
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  });

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.style.display = "none";
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
  });

  // allow ESC to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.style.display === "flex") {
      lightbox.style.display = "none";
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
  });
}
