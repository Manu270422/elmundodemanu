/**
 * ============================================================
 * relaciones.js — El Mundo de Manu / Relaciones
 * ============================================================
 * Lógica específica de mi sección de Relaciones.
 *
 * Aquí controlo:
 * 01. Canvas de corazones flotantes en el hero
 * 02. Flip cards de ideas (clic + teclado, accesible)
 * 03. Scroll suave para los anchors internos
 *
 * Sigo mi mismo patrón de módulos IIFE para que cada
 * funcionalidad esté aislada y sea fácil de mantener.
 *
 * Nota: las funciones globales onReady, $ y $$ vienen de
 * mi script.js global que se carga antes que este archivo.
 *
 * Autor: Carlos Manuel Turizo Hernández
 * Versión: 1.0.0
 * ============================================================
 */

'use strict';

/* Helpers locales con nombres distintos para no chocar con script.js */
const rlSel    = (s, ctx = document) => ctx.querySelector(s);
const rlSelAll = (s, ctx = document) => [...ctx.querySelectorAll(s)];


/* ============================================================
  01. CANVAS DE CORAZONES FLOTANTES
  Dibujo corazones pequeños que suben suavemente por el hero,
  como pétalos en el aire. Respeto prefers-reduced-motion
  para usuarios que prefieren menos animación.
  ============================================================ */
const HeartsCanvas = (() => {

  let canvas, ctx, hearts = [], rafId = null;

  /** Cantidad de corazones según el ancho de pantalla.
      Menos en móvil para cuidar el rendimiento. */
  const heartCount = () => (window.innerWidth < 640 ? 14 : 26);

  /** Creo un corazón con posición, tamaño y velocidad aleatorios */
  const createHeart = (randomY = true) => ({
    x: Math.random() * canvas.width,
    y: randomY ? Math.random() * canvas.height : canvas.height + 20,
    size: 6 + Math.random() * 10,
    speed: 0.2 + Math.random() * 0.5,
    sway: Math.random() * Math.PI * 2,      // fase del vaivén lateral
    swaySpeed: 0.005 + Math.random() * 0.01,
    opacity: 0.08 + Math.random() * 0.25,
  });

  /** Dibujo un corazón con curvas Bézier — dos lóbulos y la punta */
  const drawHeart = (h) => {
    ctx.save();
    ctx.translate(h.x + Math.sin(h.sway) * 14, h.y);
    ctx.scale(h.size / 16, h.size / 16);
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.bezierCurveTo(-8, -4, -16, 2, 0, 14);
    ctx.bezierCurveTo(16, 2, 8, -4, 0, 5);
    ctx.closePath();
    ctx.fillStyle = `rgba(255, 107, 138, ${h.opacity})`;
    ctx.fill();
    ctx.restore();
  };

  /** Loop de animación: subo cada corazón y lo reciclo al salir */
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    hearts.forEach((h, i) => {
      h.y -= h.speed;
      h.sway += h.swaySpeed * 60;

      /* Cuando un corazón sale por arriba, lo reinicio abajo */
      if (h.y < -20) hearts[i] = createHeart(false);

      drawHeart(h);
    });

    rafId = requestAnimationFrame(animate);
  };

  /** Ajusto el tamaño del canvas al de su contenedor */
  const resize = () => {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width  = rect.width;
    canvas.height = rect.height;
  };

  const init = () => {
    canvas = rlSel('#rlCanvas');
    if (!canvas) return;

    /* Si el usuario prefiere menos movimiento, no animo nada */
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    ctx = canvas.getContext('2d');
    resize();

    hearts = Array.from({ length: heartCount() }, () => createHeart(true));
    animate();

    /* Recalculo el canvas si cambia el tamaño de la ventana */
    window.addEventListener('resize', () => {
      resize();
      hearts = Array.from({ length: heartCount() }, () => createHeart(true));
    });

    /* Pauso la animación cuando la pestaña no está visible,
       así no gasto batería ni CPU del visitante */
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        animate();
      }
    });
  };

  return { init };

})();


/* ============================================================
  02. FLIP CARDS DE IDEAS
  Cada tarjeta se voltea al hacer clic. También funciona con
  teclado (Enter y Espacio) para ser totalmente accesible,
  y actualizo aria-expanded para lectores de pantalla.
  ============================================================ */
const IdeaCards = (() => {

  const toggleCard = (card) => {
    const flipped = card.classList.toggle('is-flipped');
    card.setAttribute('aria-expanded', String(flipped));
  };

  const init = () => {
    const cards = rlSelAll('.rl-idea-card');
    if (!cards.length) return;

    cards.forEach((card) => {
      /* Volteo con clic o toque */
      card.addEventListener('click', () => toggleCard(card));

      /* Volteo con teclado — Enter o Espacio */
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();   /* evito el scroll con la barra espaciadora */
          toggleCard(card);
        }
      });
    });
  };

  return { init };

})();


/* ============================================================
  03. SCROLL SUAVE INTERNO
  Los botones del hero apuntan a anchors de esta misma página
  (#rl-pack, #rl-ideas). Hago el desplazamiento suave y
  compenso la altura del navbar fijo.
  ============================================================ */
const RlInPageScroll = (() => {

  const NAVBAR_OFFSET = 80;   /* alto aproximado del navbar fijo */

  const init = () => {
    /* Incluye también #rl-games en el scroll suave */
    rlSelAll('a[href^="#rl-"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const target = rlSel(link.getAttribute('href'));
        if (!target) return;

        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  };

  return { init };

})();


/* ============================================================
  INICIALIZACIÓN DE RELACIONES.JS
  ============================================================ */
onReady(() => {

  /* Canvas de fondo del hero */
  HeartsCanvas.init();

  /* Tarjetas interactivas de ideas */
  IdeaCards.init();

  /* Navegación interna suave */
  RlInPageScroll.init();

  /* Log en consola con el estilo de la sección */
  console.log(
    '%c 💌 RELACIONES.JS — CARGADO CON AMOR v1.1.0 ',
    'background: #FF6B8A; color: #15101A; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 4px;'
  );

});