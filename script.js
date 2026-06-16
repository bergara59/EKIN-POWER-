/* Año actual en el footer */
document.getElementById("year").textContent = new Date().getFullYear();

/* Menú móvil: abrir / cerrar */
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open ? "true" : "false");
});

/* Cierra el menú al tocar un enlace */
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

/* Acordeón de sectores: solo uno abierto a la vez */
const sectorAccs = document.querySelectorAll(".sector-acc");
sectorAccs.forEach((acc) => {
  const btn = acc.querySelector(".sector-acc-btn");
  const panel = acc.querySelector(".sector-acc-panel");
  btn.addEventListener("click", () => {
    const willOpen = !acc.classList.contains("open");
    // Cierra todos los demás
    sectorAccs.forEach((other) => {
      if (other !== acc) {
        other.classList.remove("open");
        other.querySelector(".sector-acc-btn").setAttribute("aria-expanded", "false");
        other.querySelector(".sector-acc-panel").style.maxHeight = "";
      }
    });
    // Alterna el actual
    acc.classList.toggle("open", willOpen);
    btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
    panel.style.maxHeight = willOpen ? panel.scrollHeight + "px" : "";
  });
});

/* Barra de progreso de scroll */
const progressBar = document.getElementById("scrollProgress");
function updateProgress() {
  const h = document.documentElement;
  const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
  progressBar.style.width = Math.min(scrolled * 100, 100) + "%";
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

/* Efectos de cursor (solo en dispositivos con mouse y sin reduced-motion) */
const finePointer = window.matchMedia("(pointer: fine)").matches;
if (finePointer && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {

  /* Foco de luz que sigue al cursor dentro de tarjetas */
  document.querySelectorAll(".card, .reason").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", e.clientX - r.left + "px");
      el.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* Inclinación 3D de tarjetas y proyectos */
  document.querySelectorAll(".card, .project").forEach((el) => {
    el.classList.add("tilt");
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform =
        `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-4px)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  });

  /* Botones primarios magnéticos */
  document.querySelectorAll(".btn-primary").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
  });

  /* Parallax del hero según el movimiento del cursor */
  const heroSection = document.querySelector(".hero");
  const heroPhoto = document.querySelector(".hero-photo");
  const heroInner = document.querySelector(".hero-inner");
  if (heroSection && heroPhoto) {
    let raf = null;
    heroSection.addEventListener("mousemove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const r = heroSection.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        heroPhoto.style.transform = `translate(${px * -18}px, ${py * -18}px) scale(1.06)`;
        if (heroInner) heroInner.style.transform = `translate(${px * 8}px, ${py * 8}px)`;
        raf = null;
      });
    });
    heroSection.addEventListener("mouseleave", () => {
      heroPhoto.style.transform = "";
      if (heroInner) heroInner.style.transform = "";
    });
  }
}

/* Resalta en el menú la sección que se está viendo (scroll-spy) */
const spyLinks = Array.from(navLinks.querySelectorAll('a[href^="#"]'));
const spyTargets = spyLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = "#" + entry.target.id;
        spyLinks.forEach((link) =>
          link.classList.toggle("active", link.getAttribute("href") === id)
        );
      }
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
spyTargets.forEach((t) => spyObserver.observe(t));

/* Números que cuentan hacia arriba al entrar en pantalla */
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  if (prefersReduced) {
    el.textContent = prefix + target + suffix;
    return;
  }
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
    el.textContent = prefix + Math.round(eased * target) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

/* Aparición de elementos al hacer scroll */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document
  .querySelectorAll(".section-head, .card, .sector, .step, .project, .reason, .faq-item, .cta-inner")
  .forEach((el) => observer.observe(el));
