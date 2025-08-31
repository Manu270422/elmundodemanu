// script.js
console.log("¡Bienvenido al Mundo de Manu! 🚀");

// Esperar a que cargue el DOM
document.addEventListener('DOMContentLoaded', () => {

  // ==========================
  // 📂 Acordeón con botones
  // ==========================
  const botones = document.querySelectorAll(".acordeon-btn");
  botones.forEach(boton => {
    boton.addEventListener("click", () => {
      const contenido = boton.nextElementSibling;
      const abierto = contenido.style.display === "block";

      // cierra todos (opcional)
      document.querySelectorAll(".acordeon-contenido")
        .forEach(c => c.style.display = "none");

      // abre/cierra el actual
      contenido.style.display = abierto ? "none" : "block";
    });
  });

  // ==========================
  // 🔥 Animación de entrada al hacer scroll
  // ==========================
  const secciones = document.querySelectorAll("section");

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible"); // Activa animación
      }
    });
  }, { threshold: 0.15 });

  secciones.forEach(seccion => {
    seccion.classList.add("oculto");
    observer.observe(seccion);
  });

  const herramientas = document.querySelector(".herramientas");
  if (herramientas) observer.observe(herramientas);

  // ==========================
  // 🍔 Menú hamburguesa con slide
  // ==========================
  const toggleBtn = document.getElementById("menuToggle") || document.getElementById("menu-toggle");
  const nav = document.querySelector("nav");

  if (toggleBtn && nav) {
    toggleBtn.addEventListener("click", () => {
      nav.classList.toggle("active");
      toggleBtn.classList.toggle("active");
    });
  }

  // ==========================
  // 📖 Versículo del Día (sección Fe)
  // ==========================
  const versiculos = [
    "El Señor es mi pastor, nada me faltará. – Salmo 23:1",
    "Todo lo puedo en Cristo que me fortalece. – Filipenses 4:13",
    "No temas, porque yo estoy contigo. – Isaías 41:10",
    "Confía en el Señor de todo corazón. – Proverbios 3:5",
    "El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente. – Salmo 91:1",
    "Yo soy el camino, la verdad y la vida. – Juan 14:6",
    "Porque tanto amó Dios al mundo que dio a su Hijo unigénito. – Juan 3:16",
    "Pedid, y se os dará; buscad, y hallaréis. – Mateo 7:7"
  ];

  const versiculoElement = document.getElementById("versiculo");
  if (versiculoElement) {
    const hoy = new Date().getDay(); // 0=Domingo ... 6=Sábado
    const versiculo = versiculos[hoy % versiculos.length];
    versiculoElement.textContent = versiculo;
  }

  // ==========================
  // 💕 Preguntas Random (sección Relaciones)
  // ==========================
  const preguntas = [
    "¿Qué fue lo primero que pensaste de mí?",
    "¿Cuál es tu recuerdo favorito conmigo?",
    "¿Qué sueño tienes que aún no me has contado?",
    "Si viajáramos juntos ahora, ¿a dónde irías?",
    "¿Qué canción sientes que nos representa?",
    "¿Cuál es el detalle más pequeño que te gusta de mí?",
    "Si pudieras revivir un día conmigo, ¿cuál sería?",
    "¿Qué es lo que más te hace sentir amado/a?"
  ];

  const preguntasList = document.getElementById("preguntas");
  const btnPregunta = document.getElementById("btnPregunta");

  if (preguntasList) {
    function mostrarPregunta() {
      const randomIndex = Math.floor(Math.random() * preguntas.length);
      preguntasList.innerHTML = `<li>💕 ${preguntas[randomIndex]}</li>`;
    }

    mostrarPregunta(); // Al cargar
    setInterval(mostrarPregunta, 10000); // Automático cada 10s

    if (btnPregunta) {
      btnPregunta.addEventListener("click", mostrarPregunta);
    }
  }

}); // <- único DOMContentLoaded
