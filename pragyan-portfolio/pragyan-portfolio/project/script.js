const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeLabel = document.querySelector(".theme-label");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  const isLight = theme === "light";
  if (themeIcon) themeIcon.textContent = isLight ? "☾" : "☼";
  if (themeLabel) themeLabel.textContent = isLight ? "Dark" : "Light";
  if (themeToggle) themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
  try { localStorage.setItem("pragyan-portfolio-theme", theme); } catch (e) {}
}

let savedTheme = "light";
try { savedTheme = localStorage.getItem("pragyan-portfolio-theme") || "light"; } catch (e) {}
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
});

menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

navLinks.querySelectorAll("a").forEach(link =>
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  })
);

document.getElementById("year").textContent = new Date().getFullYear();

// Scroll reveal animations
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if ("IntersectionObserver" in window && !reduceMotion) {
  const revealTargets = document.querySelectorAll(
    ".section-heading, .about-copy, .focus-panel, .skill-card, .project-card, .experience-card, .event-card, .education-step, .sih-showcase, .education-achievements > *, .contact-card"
  );
  revealTargets.forEach((el, i) => {
    el.classList.add("js-reveal");
    el.style.transitionDelay = `${(i % 4) * 75}ms`;
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(el => observer.observe(el));
}

// -------------------------------------------------------------
// SIH Auto Carousel with Fade In-Out Effect
// -------------------------------------------------------------
document.querySelectorAll("[data-sih-carousel]").forEach(carousel => {
  const slides = [...carousel.querySelectorAll(".sih-slide")];
  const dots = [...carousel.querySelectorAll(".sih-dot")];
  const prevBtn = carousel.querySelector(".sih-prev");
  const nextBtn = carousel.querySelector(".sih-next");
  const counterCurrent = carousel.querySelector(".sih-counter-current");
  const counterTotal = carousel.querySelector(".sih-counter-total");

  if (!slides.length) return;
  if (counterTotal) counterTotal.textContent = String(slides.length).padStart(2, "0");

  let currentIndex = slides.findIndex(s => s.classList.contains("is-active"));
  if (currentIndex < 0) currentIndex = 0;
  let autoTimer = null;

  function goToSlide(newIndex) {
    newIndex = (newIndex + slides.length) % slides.length;
    if (newIndex === currentIndex) return;

    slides[currentIndex].classList.remove("is-active");
    if (dots[currentIndex]) dots[currentIndex].classList.remove("is-active");

    slides[newIndex].classList.add("is-active");
    if (dots[newIndex]) dots[newIndex].classList.add("is-active");

    if (counterCurrent) {
      counterCurrent.textContent = String(newIndex + 1).padStart(2, "0");
    }

    currentIndex = newIndex;
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function startAutoCycle() {
    if (reduceMotion || autoTimer || slides.length <= 1) return;
    autoTimer = setInterval(nextSlide, 4500);
  }

  function stopAutoCycle() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      stopAutoCycle();
      prevSlide();
      startAutoCycle();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      stopAutoCycle();
      nextSlide();
      startAutoCycle();
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      stopAutoCycle();
      goToSlide(index);
      startAutoCycle();
    });
  });

  // Pause on hover
  carousel.addEventListener("mouseenter", stopAutoCycle);
  carousel.addEventListener("mouseleave", startAutoCycle);

  // Mobile Touch Swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  carousel.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoCycle();
  }, { passive: true });

  carousel.addEventListener("touchend", e => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) nextSlide();
      else prevSlide();
    }
    startAutoCycle();
  }, { passive: true });

  // Start initial auto rotation
  startAutoCycle();
});

// -------------------------------------------------------------
// Project Images Auto Carousel with Fade In-Out Effect
// -------------------------------------------------------------
document.querySelectorAll("[data-project-gallery]").forEach(gallery => {
  const mainImage = gallery.querySelector(".gallery-main-image");
  const count = gallery.querySelector(".gallery-count");
  const thumbs = [...gallery.querySelectorAll(".gallery-thumb")];

  if (!mainImage || thumbs.length === 0) return;

  let currentIndex = thumbs.findIndex(t => t.classList.contains("is-active"));
  if (currentIndex < 0) currentIndex = 0;
  let autoTimer = null;
  let isFading = false;

  function switchMainImage(nextIndex) {
    if (nextIndex === currentIndex && !isFading) return;
    const nextThumb = thumbs[nextIndex];
    const thumbImg = nextThumb?.querySelector("img");
    const nextSrc = thumbImg?.currentSrc || thumbImg?.src || nextThumb?.dataset.gallerySrc;
    const nextAlt = nextThumb?.getAttribute("aria-label") || thumbImg?.alt || "Project screenshot";

    if (!nextSrc) return;

    thumbs.forEach((item, idx) => item.classList.toggle("is-active", idx === nextIndex));
    if (count) {
      count.textContent = `${String(nextIndex + 1).padStart(2, "0")} / ${String(thumbs.length).padStart(2, "0")}`;
    }

    isFading = true;
    mainImage.classList.add("fade-out");

    setTimeout(() => {
      mainImage.src = nextSrc;
      mainImage.alt = nextAlt.replace(/^Show\s+/i, "");
      requestAnimationFrame(() => {
        mainImage.classList.remove("fade-out");
        isFading = false;
      });
    }, 200);

    currentIndex = nextIndex;
  }

  function startProjectAutoCycle() {
    if (reduceMotion || autoTimer || thumbs.length <= 1) return;
    autoTimer = setInterval(() => {
      switchMainImage((currentIndex + 1) % thumbs.length);
    }, 4000);
  }

  function stopProjectAutoCycle() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", () => {
      stopProjectAutoCycle();
      switchMainImage(index);
      startProjectAutoCycle();
    });
  });

  const card = gallery.closest(".project-card") || gallery;
  card.addEventListener("mouseenter", stopProjectAutoCycle);
  card.addEventListener("mouseleave", startProjectAutoCycle);

  // Mobile Touch Swipe support for project galleries
  let touchStartX = 0;
  let touchEndX = 0;

  gallery.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
    stopProjectAutoCycle();
  }, { passive: true });

  gallery.addEventListener("touchend", e => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40 && thumbs.length > 1) {
      if (diff < 0) {
        switchMainImage((currentIndex + 1) % thumbs.length);
      } else {
        switchMainImage((currentIndex - 1 + thumbs.length) % thumbs.length);
      }
    }
    startProjectAutoCycle();
  }, { passive: true });

  // Start auto-cycle if multi-image
  if (thumbs.length > 1) {
    startProjectAutoCycle();
  }
});

// -------------------------------------------------------------
// Interactive Neural Network & Synaptic Background Canvas
// -------------------------------------------------------------
(function initNeuralBackground() {
  const canvas = document.getElementById("neuralCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Particle count scaled to screen dimensions
  const particleCount = Math.min(Math.floor((width * height) / 28000), 45);
  const maxDistance = 120;
  const mouseDistance = 145;

  let mouse = { x: null, y: null };

  // Track mouse coordinates for both spotlight & canvas
  window.addEventListener("pointermove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
    document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
  }, { passive: true });

  window.addEventListener("pointerleave", () => {
    mouse.x = null;
    mouse.y = null;
  }, { passive: true });

  // Handle window resizing
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
      if (isReducedMotion) drawStaticFrame();
    }, 200);
  }, { passive: true });

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 1.5 + 1;
      this.isCyan = Math.random() > 0.5;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouseDistance && dist > 10) {
          const force = (mouseDistance - dist) / mouseDistance;
          this.x += (dx / dist) * force * 0.55;
          this.y += (dy / dist) * force * 0.55;
        }
      }
    }
    draw(isDark) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      if (isDark) {
        ctx.fillStyle = this.isCyan ? "rgba(56, 189, 248, 0.7)" : "rgba(111, 155, 255, 0.75)";
      } else {
        ctx.fillStyle = this.isCyan ? "rgba(15, 118, 110, 0.45)" : "rgba(37, 87, 214, 0.45)";
      }
      ctx.fill();
    }
  }

  let particles = [];
  function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }
  initParticles();

  function drawLines(isDark) {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxDistance) {
          const alpha = (1 - dist / maxDistance) * (isDark ? 0.22 : 0.12);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = isDark ? `rgba(111, 155, 255, ${alpha})` : `rgba(37, 87, 214, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      if (mouse.x !== null && mouse.y !== null) {
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouseDistance) {
          const alpha = (1 - dist / mouseDistance) * (isDark ? 0.32 : 0.18);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = isDark ? `rgba(56, 189, 248, ${alpha})` : `rgba(15, 118, 110, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  function drawStaticFrame() {
    ctx.clearRect(0, 0, width, height);
    const isDark = document.documentElement.getAttribute("data-theme") !== "light";
    drawLines(isDark);
    particles.forEach(p => p.draw(isDark));
  }

  if (isReducedMotion) {
    drawStaticFrame();
    return;
  }

  let isVisible = true;
  document.addEventListener("visibilitychange", () => {
    isVisible = !document.hidden;
    if (isVisible) requestAnimationFrame(loop);
  });

  function loop() {
    if (!isVisible) return;
    ctx.clearRect(0, 0, width, height);
    const isDark = document.documentElement.getAttribute("data-theme") !== "light";

    particles.forEach(p => {
      p.update();
      p.draw(isDark);
    });
    drawLines(isDark);

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
