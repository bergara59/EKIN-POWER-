/* Año actual en el footer */
document.getElementById("year").textContent = new Date().getFullYear();

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
  .querySelectorAll(".section-head, .card, .sector, .step, .project, .cta-inner")
  .forEach((el) => observer.observe(el));
