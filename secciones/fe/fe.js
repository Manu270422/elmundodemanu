/**
 * ============================================================
 * fe.js — El Mundo de Manu / Fe
 * ============================================================
 * Script específico para mi sección de Fe.
 * script.js ya maneja cursor, navbar y animaciones globales.
 * Aquí controlo lo que es único de esta página espiritual:
 *
 * Módulos:
 * 01. Utilidades locales
 * 02. Canvas de partículas de luz — estrellas suaves
 * 03. Parallax sutil de luces y cruz en el hero
 * 04. Animación de entrada escalonada en las tarjetas
 * 05. Versículos — efecto de brillo al hacer hover
 * 06. Reflexiones — reveal suave al scroll
 * 07. Touch / Mobile — detección y ajustes táctiles
 * 08. Inicialización
 *
 * NOTA IMPORTANTE SOBRE COMPATIBILIDAD MÓVIL:
 * Todos los event listeners de interacción usan { passive: true }
 * donde corresponde. No bloqueo ningún evento táctil.
 * Los efectos visuales se desactivan en bajo rendimiento.
 *
 * Autor: Carlos Manuel Turizo Hernández
 * Versión: 1.0.0
 * ============================================================
 */

'use strict';

/* ============================================================
  01. UTILIDADES LOCALES
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
  02. CANVAS DE PARTÍCULAS DE LUZ
  Creo un cielo estrellado suave como fondo del hero.
  Las partículas son pequeños destellos dorados y blancos
  que parpadean lentamente, dando una sensación de
  paz y contemplación — muy diferente al canvas técnico
  de la sección de tecnología.
  ============================================================ */
const LightCanvas = (() => {

  const canvas = sel('#feCanvas');
  if (!canvas) return { init: () => {} };

  const ctx    = canvas.getContext('2d');
  let stars    = [];
  let width, height;
  let rafId;

  // Colores cálidos para las partículas: dorado, blanco, púrpura suave
  const COLORS = [
    '240, 165, 0',    // dorado
    '255, 208, 96',   // dorado claro
    '232, 232, 240',  // blanco frío
    '108, 99, 255',   // índigo
  ];

  const CONFIG = {
    count: isTouchDevice() ? 60 : 120, // Menos partículas en móvil
    minR:  0.5,
    maxR:  2.2,
    speed: 0.15,
  };

  const resize = () => {
    width  = canvas.width  = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  };

  /** Creo una estrella/partícula de luz */
  const createStar = () => ({
    x:       Math.random() * width,
    y:       Math.random() * height,
    r:       CONFIG.minR + Math.random() * (CONFIG.maxR - CONFIG.minR),
    opacity: 0.1 + Math.random() * 0.7,
    targetOp:0.1 + Math.random() * 0.7,   // Opacidad objetivo para el parpadeo
    speed:   0.003 + Math.random() * 0.008, // Velocidad de cambio de opacidad
    color:   COLORS[Math.floor(Math.random() * COLORS.length)],
    // Movimiento muy lento — casi estáticas, como estrellas reales
    vx:      (Math.random() - 0.5) * CONFIG.speed,
    vy:      (Math.random() - 0.5) * CONFIG.speed * 0.5,
  });

  const initStars = () => {
    stars = Array.from({ length: CONFIG.count }, createStar);
  };

  /** Actualizo el estado de cada estrella */
  const update = () => {
    stars.forEach((star) => {
      // Muevo suavemente
      star.x += star.vx;
      star.y += star.vy;

      // Rebote en bordes
      if (star.x < 0 || star.x > width)  star.vx *= -1;
      if (star.y < 0 || star.y > height) star.vy *= -1;

      // Parpadeo suave — la opacidad se acerca gradualmente al objetivo
      if (Math.abs(star.opacity - star.targetOp) < 0.01) {
        // Cuando llega al objetivo, establezco uno nuevo
        star.targetOp = 0.05 + Math.random() * 0.75;
      }
      star.opacity += (star.targetOp - star.opacity) * star.speed;
    });
  };

  /** Dibujo el frame actual */
  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    stars.forEach((star) => {
      ctx.beginPath();

      // Glow alrededor de cada estrella
      const gradient = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, star.r * 3
      );
      gradient.addColorStop(0,   `rgba(${star.color}, ${star.opacity})`);
      gradient.addColorStop(1,   `rgba(${star.color}, 0)`);

      ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Punto central más brillante
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${star.color}, ${Math.min(star.opacity * 1.5, 1)})`;
      ctx.fill();
    });
  };

  /** Loop de animación */
  const loop = () => {
    update();
    draw();
    rafId = requestAnimationFrame(loop);
  };

  const init = () => {
    // Si el usuario prefiere movimiento reducido, no animo
    if (prefersReducedMotion()) return;

    resize();
    initStars();
    loop();

    window.addEventListener('resize', () => {
      resize();
      initStars();
    }, { passive: true });

    // Pausa cuando la página no es visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        loop();
      }
    });
  };

  return { init };

})();


/* ============================================================
  03. PARALLAX DEL HERO
  Los destellos de luz del fondo se mueven levemente al
  hacer scroll para dar profundidad. Solo en desktop.
  En móvil no activo el parallax para mejor rendimiento.
  ============================================================ */
const HeroParallax = (() => {

  let ticking = false;

  const onScroll = () => {
    if (ticking) return;

    requestAnimationFrame(() => {
      const heroEl = sel('.fe-hero');
      if (!heroEl) { ticking = false; return; }

      const scrollY  = window.scrollY;
      const heroH    = heroEl.offsetHeight;
      if (scrollY > heroH) { ticking = false; return; }

      const progress = scrollY / heroH;

      const light1  = sel('.fe-hero__light--1');
      const light2  = sel('.fe-hero__light--2');
      const light3  = sel('.fe-hero__light--3');
      const cross   = sel('.fe-hero__cross-wrap');

      if (light1) light1.style.transform = `translateX(-50%) translateY(${progress * 80}px)`;
      if (light2) light2.style.transform = `translateY(${progress * -50}px)`;
      if (light3) light3.style.transform = `translateY(${progress * 40}px)`;
      if (cross)  cross.style.transform  = `translate(-50%, calc(-50% + ${progress * 60}px))`;

      ticking = false;
    });

    ticking = true;
  };

  const init = () => {
    // Solo en desktop con mouse
    if (isTouchDevice()) return;
    if (prefersReducedMotion()) return;

    window.addEventListener('scroll', onScroll, { passive: true });
  };

  return { init };

})();


/* ============================================================
  04. ANIMACIÓN DE PILARES
  Las tarjetas de pilares de fe entran con un efecto de
  escala + fade cuando entran en el viewport.
  Compatible con móvil — uso IntersectionObserver.
  ============================================================ */
const PillarsAnimation = (() => {

  const init = () => {
    const cards = selAll('.fe-pillar-card');
    if (!cards.length) return;
    if (prefersReducedMotion()) return;

    cards.forEach((card, index) => {
      card.style.opacity    = '0';
      card.style.transform  = 'scale(0.94) translateY(20px)';
      card.style.transition = `opacity 0.5s ease ${index * 80}ms,
                               transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 80}ms`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'scale(1) translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

    cards.forEach((card) => observer.observe(card));
  };

  return { init };

})();


/* ============================================================
  05. VERSÍCULOS — EFECTO DE BRILLO AL HOVER
  Cuando el usuario hace hover sobre una tarjeta de versículo,
  agrego un brillo dorado sutil. En móvil uso el evento
  touchstart para que también funcione al tocar.
  ============================================================ */
const VerseGlow = (() => {

  const init = () => {
    const cards = selAll('.fe-verse-card');
    if (!cards.length) return;

    cards.forEach((card) => {
      // Hover en desktop
      card.addEventListener('mouseenter', () => {
        card.style.boxShadow = '0 8px 32px rgba(0,0,0,0.35), 0 0 20px rgba(240,165,0,0.15)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.boxShadow = '';
      });

      // Touch en móvil — un toque breve activa el brillo
      card.addEventListener('touchstart', () => {
        card.style.boxShadow = '0 8px 32px rgba(0,0,0,0.35), 0 0 20px rgba(240,165,0,0.15)';
        setTimeout(() => { card.style.boxShadow = ''; }, 600);
      }, { passive: true });
    });
  };

  return { init };

})();


/* ============================================================
  06. REFLEXIONES — REVEAL SUAVE
  Cada tarjeta de reflexión aparece con un fade + slide
  al hacer scroll hacia ella. Compatible con móvil.
  ============================================================ */
const ReflectionsReveal = (() => {

  const init = () => {
    const cards = selAll('.fe-reflection-card');
    if (!cards.length) return;
    if (prefersReducedMotion()) return;

    cards.forEach((card, index) => {
      card.style.opacity    = '0';
      card.style.transform  = 'translateY(24px)';
      card.style.transition = `opacity 0.55s ease ${index * 120}ms,
                               transform 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${index * 120}ms`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

    cards.forEach((card) => observer.observe(card));
  };

  return { init };

})();


/* ============================================================
  07. RECURSOS — ENTRADA LATERAL
  Las tarjetas de recursos entran deslizándose desde
  la izquierda con un delay escalonado.
  ============================================================ */
const ResourcesReveal = (() => {

  const init = () => {
    const cards = selAll('.fe-resource-card');
    if (!cards.length) return;
    if (prefersReducedMotion()) return;

    cards.forEach((card, index) => {
      card.style.opacity    = '0';
      card.style.transform  = 'translateX(-20px)';
      card.style.transition = `opacity 0.5s ease ${index * 100}ms,
                               transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 100}ms`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateX(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    cards.forEach((card) => observer.observe(card));
  };

  return { init };

})();


/* ============================================================
  08. SCROLL SUAVE PARA BOTONES DE ESTA PÁGINA
  Los botones "Explorar" y "Reflexiones" del hero apuntan
  a secciones de esta misma página. Me aseguro de que el
  scroll sea suave con el offset correcto del navbar.
  Funciona tanto con click (desktop) como con touch (móvil).
  ============================================================ */
const InPageScroll = (() => {

  const init = () => {
    const links = selAll('a[href^="#fe-"]');

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
  INICIALIZACIÓN DE FE.JS
  Lanzo todos los módulos de esta sección.
  ============================================================ */
onReady(() => {

  // Canvas de estrellas — lo primero para que ya esté listo
  LightCanvas.init();

  // Parallax del hero (solo desktop)
  HeroParallax.init();

  // Animaciones de tarjetas
  PillarsAnimation.init();
  VerseGlow.init();
  ReflectionsReveal.init();
  ResourcesReveal.init();

  // Scroll suave en página
  InPageScroll.init();

  // Log en consola
  console.log(
    '%c ✝ Fe — fe.js cargado ',
    'background: #F0A500; color: #0A0A0F; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 4px;'
  );

});
