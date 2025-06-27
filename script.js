// script.js
console.log("¡Bienvenido al Mundo de Manu!");

// Animación de entrada suave al hacer scroll
document.addEventListener("DOMContentLoaded", () => {
  const secciones = document.querySelectorAll("section");

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
      }
    });
  }, {
    threshold: 0.1
  });

  secciones.forEach(seccion => {
    seccion.classList.add("oculto"); // Oculta inicialmente
    observer.observe(seccion);
  });
});
