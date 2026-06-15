/**
 * ============================================================
 * bienestar.js — El Mundo de Manu / Salud y Bienestar
 * ============================================================
 * Script específico para mi sección de Salud y Bienestar.
 * script.js ya maneja cursor, navbar y animaciones globales.
 * Aquí controlo lo que es único de esta página temática.
 *
 * Módulos:
 * 01. Utilidades locales
 * 02. Canvas de respiración — ondas concéntricas animadas
 * 03. Parallax sutil de luces en el hero
 * 04. Animación de entrada escalonada en tarjetas de pilares
 * 05. Artículos — reveal suave al scroll
 * 06. CardGlow — brillo menta al hover/touch en tarjetas
 * 07. Recursos — entrada lateral desde la izquierda
 * 08. Tips — fade + escala al entrar en viewport
 * 09. Scroll suave para links internos (#bn-*)
 * 10. Inicialización
 *
 * DIFERENCIA CLAVE CON FE.JS Y EDUCACION.JS:
 * El canvas de fondo (BreathCanvas) dibuja círculos concéntricos
 * que se expanden y contraen en un ciclo de respiración:
 * 4 segundos de expansión (inhala) + 4 segundos de contracción
 * (exhala). Es una animación deliberadamente lenta y orgánica
 * que refuerza la temática de bienestar de forma subliminal.
 * No hay partículas, no hay grids — solo respiración.
 *
 * COMPATIBILIDAD MÓVIL:
 * Todos los listeners usan { passive: true }.
 * En prefers-reduced-motion el canvas no anima — los círculos
 * quedan estáticos como gradientes concéntricos suaves.
 * El parallax solo corre en desktop (pointer: fine).
 *
 * Autor: Carlos Manuel Turizo Hernández
 * Versión: 1.0.0
 * ============================================================
 */

'use strict';

/* ============================================================
  01. UTILIDADES LOCALES
  Mismas helpers que en fe.js y educacion.js.
  Las mantengo iguales para consistencia entre secciones —
  cada sección es autocontenida y no depende de la otra.
  ============================================================ */
const sel    = (s, ctx = document) => ctx.querySelector(s);
const selAll = (s, ctx = document) => [...ctx.querySelectorAll(s)];

const onReady = (fn) => {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
};

/** Compruebo si el dispositivo es táctil / móvil */
const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;

/** Compruebo si el usuario prefiere movimiento reducido */
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ============================================================
  02. CANVAS DE RESPIRACIÓN (BreathCanvas)
  Este es el efecto de fondo que define visualmente esta
  sección. Dibujo 4 círculos concéntricos que se expanden
  desde el centro hacia afuera en 4 segundos (fase de
  inhalar) y luego se contraen en otros 4 segundos (exhalar).

  El ciclo es: inhala 4 s → exhala 4 s → repite.
  El radio de cada círculo varía según su índice, con un
  desfase de fase para que no todos se muevan igual —
  da un efecto de "ola" u "onda de sonido".

  Colores: menta en diferentes opacidades muy bajas.
  El resultado es sereno y orgánico, no tecnológico.

  Si el usuario tiene prefers-reduced-motion, dibujo los
  círculos estáticos en su posición media — sin animación.
  ============================================================ */
const BreathCanvas = (() => {

  const canvas = sel('#bnCanvas');
  if (!canvas) return { init: () => {} };

  const ctx = canvas.getContext('2d');
  let width, height, cx, cy;
  let rafId;
  let startTime = null;

  // Parámetros del ciclo de respiración
  const INHALE_DURATION  = 4000;  // ms que dura la fase de inhalar
  const EXHALE_DURATION  = 4000;  // ms que dura la fase de exhalar
  const CYCLE_DURATION   = INHALE_DURATION + EXHALE_DURATION;

  // Número de anillos concéntricos
  const RING_COUNT = isTouchDevice() ? 3 : 4;

  // Color base del menta en RGB para poder variar la opacidad
  const MINT_RGB = '56, 181, 151';

  const resize = () => {
    width  = canvas.width  = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
    cx     = width  / 2;
    cy     = height / 2;
  };

  /**
   * Calculo el radio actual de un anillo en un momento dado.
   * Cada anillo tiene un desfase de fase (phaseOffset) para
   * que el efecto de "ola" sea visible entre anillos.
   *
   * El rango de radio va de minR a maxR, que depende del
   * tamaño del canvas para que los anillos llenen el espacio.
   */
  const getRingRadius = (ringIndex, elapsed) => {
    const minR = Math.min(width, height) * (0.08 + ringIndex * 0.10);
    const maxR = Math.min(width, height) * (0.25 + ringIndex * 0.14);

    // Desfase de fase para cada anillo — en ms
    const phaseOffset = (ringIndex / RING_COUNT) * CYCLE_DURATION * 0.5;
    const adjustedTime = (elapsed + phaseOffset) % CYCLE_DURATION;

    let t; // Progreso del ciclo entre 0 y 1

    if (adjustedTime < INHALE_DURATION) {
      // Fase de inhalar — el radio crece de min a max
      // Uso easeInOut para que el movimiento sea suave
      t = adjustedTime / INHALE_DURATION;
      t = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease in-out cuadrático
    } else {
      // Fase de exhalar — el radio vuelve de max a min
      t = (adjustedTime - INHALE_DURATION) / EXHALE_DURATION;
      t = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      t = 1 - t; // Invierto para que sea la contracción
    }

    return minR + (maxR - minR) * t;
  };

  /**
   * Dibujo el estado estático (sin animación).
   * Uso cuando prefers-reduced-motion está activo.
   * Los anillos quedan en la posición media del ciclo.
   */
  const drawStatic = () => {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < RING_COUNT; i++) {
      const minR = Math.min(width, height) * (0.08 + i * 0.10);
      const maxR = Math.min(width, height) * (0.25 + i * 0.14);
      const r    = (minR + maxR) / 2; // Radio en posición media
      const opacity = 0.06 - i * 0.012;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${MINT_RGB}, ${Math.max(opacity, 0.02)})`;
      ctx.lineWidth   = 1.5 - i * 0.2;
      ctx.stroke();
    }
  };

  /** Dibujo un frame del ciclo de respiración animado */
  const draw = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const elapsed = (timestamp - startTime) % CYCLE_DURATION;

    ctx.clearRect(0, 0, width, height);

    // Dibujo los anillos de afuera hacia adentro para que
    // los más externos (más tenues) queden debajo de los internos
    for (let i = RING_COUNT - 1; i >= 0; i--) {
      const r = getRingRadius(i, elapsed);

      // Opacidad decrece con el radio — los externos son más tenues
      const baseOpacity = 0.09 - i * 0.018;
      const opacity     = Math.max(baseOpacity, 0.015);

      // Glow suave alrededor del anillo usando gradiente radial
      const gradient = ctx.createRadialGradient(cx, cy, r - 8, cx, cy, r + 8);
      gradient.addColorStop(0, `rgba(${MINT_RGB}, 0)`);
      gradient.addColorStop(0.5, `rgba(${MINT_RGB}, ${opacity * 0.6})`);
      gradient.addColorStop(1, `rgba(${MINT_RGB}, 0)`);

      // Relleno del glow
      ctx.beginPath();
      ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
      ctx.arc(cx, cy, Math.max(r - 8, 0), 0, Math.PI * 2, true);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Línea del anillo
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${MINT_RGB}, ${opacity})`;
      ctx.lineWidth   = 1.2;
      ctx.stroke();
    }

    // Punto central — siempre visible, muy sutil
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${MINT_RGB}, 0.15)`;
    ctx.fill();
  };

  /** Loop de animación */
  const loop = (timestamp) => {
    draw(timestamp);
    rafId = requestAnimationFrame(loop);
  };

  const init = () => {
    resize();

    // Si el usuario prefiere movimiento reducido, muestro
    // los círculos estáticos y no activo el loop de animación
    if (prefersReducedMotion()) {
      drawStatic();

      window.addEventListener('resize', () => {
        resize();
        drawStatic();
      }, { passive: true });

      return;
    }

    // Inicio el loop de respiración
    rafId = requestAnimationFrame(loop);

    window.addEventListener('resize', () => {
      resize();
      startTime = null; // Reseteo para evitar salto visual al redimensionar
    }, { passive: true });

    // Pauso cuando la pestaña no es visible — ahorra batería
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        startTime = null; // Reseteo para continuar suavemente
        rafId = requestAnimationFrame(loop);
      }
    });
  };

  return { init };

})();


/* ============================================================
  03. PARALLAX DEL HERO
  Los destellos de luz se mueven suavemente al hacer scroll.
  Solo activo esto en desktop (pointer: fine) porque en móvil
  el parallax consume recursos sin aportar experiencia visual
  significativa dado el tamaño de pantalla.
  ============================================================ */
const HeroParallax = (() => {

  let ticking = false;

  const onScroll = () => {
    if (ticking) return;

    requestAnimationFrame(() => {
      const heroEl = sel('.bn-hero');
      if (!heroEl) { ticking = false; return; }

      const scrollY = window.scrollY;
      const heroH   = heroEl.offsetHeight;
      if (scrollY > heroH) { ticking = false; return; }

      const progress = scrollY / heroH;

      const light1  = sel('.bn-hero__light--1');
      const light2  = sel('.bn-hero__light--2');
      const light3  = sel('.bn-hero__light--3');
      const symbol  = sel('.bn-hero__symbol-wrap');

      if (light1) light1.style.transform = `translateX(-50%) translateY(${progress * 70}px)`;
      if (light2) light2.style.transform = `translateY(${progress * -40}px)`;
      if (light3) light3.style.transform = `translateY(${progress * 30}px)`;
      if (symbol) symbol.style.transform = `translate(-50%, calc(-50% + ${progress * 50}px))`;

      ticking = false;
    });

    ticking = true;
  };

  const init = () => {
    if (isTouchDevice()) return;
    if (prefersReducedMotion()) return;

    window.addEventListener('scroll', onScroll, { passive: true });
  };

  return { init };

})();


/* ============================================================
  04. ANIMACIÓN DE PILARES
  Las 6 tarjetas de pilares entran con scale + fade de forma
  escalonada. El delay de 90ms por tarjeta hace que entren
  en orden de izquierda a derecha y de arriba a abajo,
  siguiendo la dirección natural de lectura.
  ============================================================ */
const PillarsAnimation = (() => {

  const init = () => {
    const cards = selAll('.bn-pillar-card');
    if (!cards.length) return;
    if (prefersReducedMotion()) return;

    cards.forEach((card, index) => {
      card.style.opacity   = '0';
      card.style.transform = 'scale(0.93) translateY(22px)';
      card.style.transition = `
        opacity   0.52s ease ${index * 90}ms,
        transform 0.52s cubic-bezier(0.16, 1, 0.3, 1) ${index * 90}ms
      `;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'scale(1) translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -25px 0px',
    });

    cards.forEach((card) => observer.observe(card));
  };

  return { init };

})();


/* ============================================================
  05. ARTÍCULOS — REVEAL SUAVE
  Las tarjetas de artículos entran con fade + slide vertical.
  El delay entre tarjetas es mayor (140ms) porque cada
  artículo es más denso visualmente que una tarjeta de pilar
  — un delay más largo da tiempo al ojo de procesar el primero
  antes de que aparezca el siguiente.
  ============================================================ */
const ArticlesReveal = (() => {

  const init = () => {
    const cards = selAll('.bn-article-card');
    if (!cards.length) return;
    if (prefersReducedMotion()) return;

    cards.forEach((card, index) => {
      card.style.opacity   = '0';
      card.style.transform = 'translateY(28px)';
      card.style.transition = `
        opacity   0.58s ease ${index * 140}ms,
        transform 0.58s cubic-bezier(0.16, 1, 0.3, 1) ${index * 140}ms
      `;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -20px 0px',
    });

    cards.forEach((card) => observer.observe(card));
  };

  return { init };

})();


/* ============================================================
  06. CARDGLOW — BRILLO MENTA AL HOVER/TOUCH
  Aplico el efecto de glow menta tanto en los pilares como
  en los tips y recursos. Los manejo juntos porque comparten
  el mismo color y comportamiento — un solo módulo es más
  limpio que tres separados con la misma lógica.
  En touch, el brillo dura 700ms y luego desaparece.
  ============================================================ */
const CardGlow = (() => {

  const GLOW = '0 8px 32px rgba(0,0,0,0.35), 0 0 20px rgba(56,181,151,0.15)';
  const OFF  = '';

  const applyGlow = (card) => {
    card.addEventListener('mouseenter', () => { card.style.boxShadow = GLOW; });
    card.addEventListener('mouseleave', () => { card.style.boxShadow = OFF; });
    card.addEventListener('touchstart', () => {
      card.style.boxShadow = GLOW;
      setTimeout(() => { card.style.boxShadow = OFF; }, 700);
    }, { passive: true });
  };

  const init = () => {
    // Aplico a pilares, tips y recursos — todas las tarjetas interactivas
    const targets = selAll('.bn-pillar-card, .bn-tip-item, .bn-resource-card');
    targets.forEach(applyGlow);
  };

  return { init };

})();


/* ============================================================
  07. RECURSOS — ENTRADA LATERAL DESDE LA IZQUIERDA
  Las tarjetas de recursos deslizán desde la izquierda.
  Este efecto de dirección refuerza el movimiento de lectura
  y da variedad visual respecto al fade vertical de artículos.
  ============================================================ */
const ResourcesReveal = (() => {

  const init = () => {
    const cards = selAll('.bn-resource-card');
    if (!cards.length) return;
    if (prefersReducedMotion()) return;

    cards.forEach((card, index) => {
      card.style.opacity   = '0';
      card.style.transform = 'translateX(-20px)';
      card.style.transition = `
        opacity   0.5s ease ${index * 100}ms,
        transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 100}ms
      `;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateX(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });

    cards.forEach((card) => observer.observe(card));
  };

  return { init };

})();


/* ============================================================
  08. TIPS — FADE + ESCALA AL ENTRAR EN VIEWPORT
  Los tips usan un efecto diferente al de los recursos —
  escala + fade en lugar de slide lateral. Esto da variedad
  entre secciones y el efecto de "pop" es coherente con
  el carácter compacto y directo de los micro-consejos.
  ============================================================ */
const TipsReveal = (() => {

  const init = () => {
    const items = selAll('.bn-tip-item');
    if (!items.length) return;
    if (prefersReducedMotion()) return;

    items.forEach((item, index) => {
      item.style.opacity   = '0';
      item.style.transform = 'scale(0.95) translateY(16px)';
      item.style.transition = `
        opacity   0.45s ease ${index * 80}ms,
        transform 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${index * 80}ms
      `;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'scale(1) translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -15px 0px',
    });

    items.forEach((item) => observer.observe(item));
  };

  return { init };

})();


/* ============================================================
  09. SCROLL SUAVE PARA LINKS INTERNOS
  Capturo los clicks en links que apunten a IDs con prefijo
  #bn- y aplico scroll suave con el offset correcto del navbar.
  Esto asegura que el título de la sección quede visible
  y no oculto detrás de la barra de navegación fija.
  ============================================================ */
const InPageScroll = (() => {

  const init = () => {
    const links = selAll('a[href^="#bn-"]');

    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        const target   = sel(targetId);
        if (!target) return;

        e.preventDefault();

        const navbar = sel('#navbar');
        const offset = (navbar ? navbar.offsetHeight : 70) + 16;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  };

  return { init };

})();


/* ============================================================
  10. INICIALIZACIÓN DE BIENESTAR.JS
  Lanzo todos los módulos en orden:
  primero el canvas (necesita el primer frame cuanto antes),
  luego el parallax, luego las animaciones de contenido.
  ============================================================ */
onReady(() => {

  // Canvas de respiración — primero para que esté listo al cargar
  BreathCanvas.init();

  // Parallax del hero (solo desktop)
  HeroParallax.init();

  // Animaciones de contenido
  PillarsAnimation.init();
  ArticlesReveal.init();
  CardGlow.init();
  ResourcesReveal.init();
  TipsReveal.init();

  // Scroll suave in-page
  InPageScroll.init();

  // Log en consola — mismo formato que Fe y Educación
  console.log(
    '%c 🌿 Bienestar — bienestar.js cargado ',
    'background: #38B597; color: #03170F; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 4px;'
  );

});
