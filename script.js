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
