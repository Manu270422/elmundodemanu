/**
 * ============================================================
 * finanzas.js — El Mundo de Manu / Finanzas Personales
 * ============================================================
 * Script específico de la sección de Finanzas.
 * script.js global ya maneja cursor, navbar y animaciones base.
 * Aquí controlo lo único de esta página.
 *
 * Módulos:
 * 01. Utilidades locales
 * 02. Canvas de mercado — gráfico ascendente con barras
 * 03. Parallax del hero
 * 04. Animación de conceptos (entrada escalonada)
 * 05. Guías — reveal al scroll
 * 06. Mitos — reveal con flip sutil
 * 07. Recursos — entrada lateral
 * 08. CardGlow — brillo verde al hover/touch
 * 09. Scroll suave in-page (#fn-*)
 * 10. Inicialización
 *
 * EFECTO ÚNICO (MarketCanvas):
 * Dibujo un gráfico financiero animado — una línea ascendente
 * que se traza sola sobre barras tipo histograma que crecen
 * desde abajo, simulando un mercado en crecimiento. La línea
 * deja un área de relleno con degradado verde por debajo.
 * Cuando llega al borde, hace scroll suave generando nuevos
 * puntos, en bucle infinito. Es la metáfora visual perfecta
 * para una sección de finanzas: crecimiento sostenido.
 *
 * COMPATIBILIDAD MÓVIL:
 * Listeners pasivos. Menos puntos/barras en móvil.
 * Fallback estático en prefers-reduced-motion.
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

const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ============================================================
  02. CANVAS DE MERCADO (MarketCanvas)
  Un gráfico ascendente animado. Mantengo un array de puntos
  con valores que suben de forma orgánica (random walk con
  tendencia alcista). Por debajo dibujo barras tipo histograma.
  La línea avanza desplazándose hacia la izquierda, creando
  la sensación de un mercado vivo y en crecimiento continuo.
  ============================================================ */
const MarketCanvas = (() => {

  const canvas = sel('#fnCanvas');
  if (!canvas) return { init: () => {} };

  const ctx = canvas.getContext('2d');
  let width, height;
  let points = [];
  let bars = [];
  let rafId;
  let frame = 0;

  // Menos densidad en móvil para mantener fluidez
  const POINT_COUNT = isTouchDevice() ? 28 : 48;
  const BASE_Y_RATIO = 0.72;   // Línea base del gráfico (72% de altura)

  // Colores de la paleta de finanzas
  const GREEN = '45, 186, 119';
  const GOLD  = '233, 196, 106';

  const resize = () => {
    width  = canvas.width  = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
    buildSeries();
  };

  /**
   * Genero la serie inicial de puntos con un random walk de
   * tendencia alcista: cada punto sube respecto al anterior
   * con algo de ruido, para que parezca un mercado real.
   */
  const buildSeries = () => {
    points = [];
    bars = [];
    const baseY = height * BASE_Y_RATIO;
    let value = baseY;

    for (let i = 0; i < POINT_COUNT; i++) {
      // Random walk con sesgo alcista (sube más de lo que baja)
      const drift = -0.6;                      // tendencia hacia arriba (y menor = más alto)
      const noise = (Math.random() - 0.5) * 14;
      value += drift + noise;
      // Mantengo el valor dentro de límites razonables
      value = Math.max(height * 0.25, Math.min(height * 0.82, value));

      points.push({ y: value, targetY: value });

      // Barra de histograma asociada (altura proporcional al "volumen")
      bars.push({
        h: 10 + Math.random() * 40,
        targetH: 10 + Math.random() * 40,
      });
    }
  };

  /** Calculo la coordenada X de un punto según su índice */
  const xAt = (i) => (i / (POINT_COUNT - 1)) * width;

  /** Avanzo la serie: desplazo todo a la izquierda y añado punto nuevo */
  const shiftSeries = () => {
    points.shift();
    bars.shift();

    const baseY = height * BASE_Y_RATIO;
    const last = points.length ? points[points.length - 1].y : baseY;
    const drift = -0.6;
    const noise = (Math.random() - 0.5) * 16;
    let value = last + drift + noise;
    value = Math.max(height * 0.25, Math.min(height * 0.82, value));

    points.push({ y: value, targetY: value });
    bars.push({ h: 10 + Math.random() * 40, targetH: 10 + Math.random() * 40 });
  };

  /** Dibujo las barras de histograma al fondo */
  const drawBars = () => {
    const barW = width / POINT_COUNT * 0.55;
    bars.forEach((bar, i) => {
      const x = xAt(i) - barW / 2;
      const y = height - bar.h;
      ctx.fillStyle = `rgba(${GREEN}, 0.05)`;
      ctx.fillRect(x, y, barW, bar.h);
    });
  };

  /** Dibujo el área de relleno bajo la línea con degradado */
  const drawArea = () => {
    ctx.beginPath();
    ctx.moveTo(0, height);
    points.forEach((p, i) => {
      const x = xAt(i);
      if (i === 0) ctx.lineTo(x, p.y);
      else {
        // Curva suave entre puntos usando control intermedio
        const prevX = xAt(i - 1);
        const prevP = points[i - 1];
        const cx = (prevX + x) / 2;
        ctx.quadraticCurveTo(prevX, prevP.y, cx, (prevP.y + p.y) / 2);
        ctx.lineTo(x, p.y);
      }
    });
    ctx.lineTo(width, height);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, height * 0.2, 0, height);
    grad.addColorStop(0, `rgba(${GREEN}, 0.18)`);
    grad.addColorStop(1, `rgba(${GREEN}, 0)`);
    ctx.fillStyle = grad;
    ctx.fill();
  };

  /** Dibujo la línea principal del gráfico */
  const drawLine = () => {
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = xAt(i);
      if (i === 0) ctx.moveTo(x, p.y);
      else {
        const prevX = xAt(i - 1);
        const prevP = points[i - 1];
        const cx = (prevX + x) / 2;
        ctx.quadraticCurveTo(prevX, prevP.y, cx, (prevP.y + p.y) / 2);
        ctx.lineTo(x, p.y);
      }
    });

    const lineGrad = ctx.createLinearGradient(0, 0, width, 0);
    lineGrad.addColorStop(0, `rgba(${GREEN}, 0.5)`);
    lineGrad.addColorStop(1, `rgba(${GOLD}, 0.7)`);
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Punto dorado brillante en la cabeza de la línea (último punto)
    const lastP = points[points.length - 1];
    const lastX = xAt(points.length - 1);
    const glow = ctx.createRadialGradient(lastX, lastP.y, 0, lastX, lastP.y, 12);
    glow.addColorStop(0, `rgba(${GOLD}, 0.8)`);
    glow.addColorStop(1, `rgba(${GOLD}, 0)`);
    ctx.beginPath();
    ctx.arc(lastX, lastP.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(lastX, lastP.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${GOLD}, 1)`;
    ctx.fill();
  };

  /** Loop principal */
  const loop = () => {
    frame++;
    ctx.clearRect(0, 0, width, height);

    // Cada ~45 frames desplazo la serie para que el gráfico "avance"
    if (frame % 45 === 0) shiftSeries();

    drawBars();
    drawArea();
    drawLine();

    rafId = requestAnimationFrame(loop);
  };

  /** Dibujo estático para prefers-reduced-motion */
  const drawStatic = () => {
    ctx.clearRect(0, 0, width, height);
    drawBars();
    drawArea();
    drawLine();
  };

  const init = () => {
    resize();

    if (prefersReducedMotion()) {
      drawStatic();
      window.addEventListener('resize', () => { resize(); drawStatic(); }, { passive: true });
      return;
    }

    rafId = requestAnimationFrame(loop);

    window.addEventListener('resize', resize, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        rafId = requestAnimationFrame(loop);
      }
    });
  };

  return { init };

})();


/* ============================================================
  03. PARALLAX DEL HERO
  ============================================================ */
const HeroParallax = (() => {
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const heroEl = sel('.fn-hero');
      if (!heroEl) { ticking = false; return; }
      const scrollY = window.scrollY;
      const heroH = heroEl.offsetHeight;
      if (scrollY > heroH) { ticking = false; return; }
      const progress = scrollY / heroH;

      const l1 = sel('.fn-hero__light--1');
      const l2 = sel('.fn-hero__light--2');
      const l3 = sel('.fn-hero__light--3');

      if (l1) l1.style.transform = `translateX(-50%) translateY(${progress * 70}px)`;
      if (l2) l2.style.transform = `translateY(${progress * -40}px)`;
      if (l3) l3.style.transform = `translateY(${progress * 30}px)`;

      ticking = false;
    });
    ticking = true;
  };

  const init = () => {
    if (isTouchDevice() || prefersReducedMotion()) return;
    window.addEventListener('scroll', onScroll, { passive: true });
  };

  return { init };
})();


/* ============================================================
  04. ANIMACIÓN DE CONCEPTOS
  ============================================================ */
const ConceptsAnimation = (() => {
  const init = () => {
    const cards = selAll('.fn-concept-card');
    if (!cards.length || prefersReducedMotion()) return;

    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.93) translateY(22px)';
      card.style.transition = `
        opacity 0.52s ease ${i * 85}ms,
        transform 0.52s cubic-bezier(0.16, 1, 0.3, 1) ${i * 85}ms`;
    });

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'scale(1) translateY(0)';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -25px 0px' });

    cards.forEach((c) => obs.observe(c));
  };
  return { init };
})();


/* ============================================================
  05. GUÍAS — REVEAL AL SCROLL
  ============================================================ */
const GuidesReveal = (() => {
  const init = () => {
    const cards = selAll('.fn-guide-card');
    if (!cards.length || prefersReducedMotion()) return;

    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(28px)';
      card.style.transition = `
        opacity 0.58s ease ${i * 140}ms,
        transform 0.58s cubic-bezier(0.16, 1, 0.3, 1) ${i * 140}ms`;
    });

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    cards.forEach((c) => obs.observe(c));
  };
  return { init };
})();


/* ============================================================
  06. MITOS — REVEAL CON ENTRADA SUTIL
  Las tarjetas de mito/realidad entran alternando dirección
  para dar dinamismo a la sección.
  ============================================================ */
const MythsReveal = (() => {
  const init = () => {
    const cards = selAll('.fn-myth-card');
    if (!cards.length || prefersReducedMotion()) return;

    cards.forEach((card, i) => {
      // Alterno: pares entran desde la izquierda, impares desde la derecha
      const fromLeft = i % 2 === 0;
      card.style.opacity = '0';
      card.style.transform = `translateX(${fromLeft ? '-24px' : '24px'})`;
      card.style.transition = `
        opacity 0.55s ease ${i * 100}ms,
        transform 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms`;
    });

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateX(0)';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    cards.forEach((c) => obs.observe(c));
  };
  return { init };
})();


/* ============================================================
  07. RECURSOS — ENTRADA LATERAL
  ============================================================ */
const ResourcesReveal = (() => {
  const init = () => {
    const cards = selAll('.fn-resource-card');
    if (!cards.length || prefersReducedMotion()) return;

    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateX(-20px)';
      card.style.transition = `
        opacity 0.5s ease ${i * 90}ms,
        transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 90}ms`;
    });

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateX(0)';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.14 });

    cards.forEach((c) => obs.observe(c));
  };
  return { init };
})();


/* ============================================================
  08. CARDGLOW — BRILLO VERDE AL HOVER/TOUCH
  ============================================================ */
const CardGlow = (() => {
  const GLOW = '0 12px 40px rgba(0,0,0,0.35), 0 0 20px rgba(45,186,119,0.15)';
  const OFF = '';

  const apply = (card) => {
    card.addEventListener('mouseenter', () => { card.style.boxShadow = GLOW; });
    card.addEventListener('mouseleave', () => { card.style.boxShadow = OFF; });
    card.addEventListener('touchstart', () => {
      card.style.boxShadow = GLOW;
      setTimeout(() => { card.style.boxShadow = OFF; }, 700);
    }, { passive: true });
  };

  const init = () => {
    selAll('.fn-concept-card, .fn-myth-card, .fn-resource-card').forEach(apply);
  };
  return { init };
})();


/* ============================================================
  09. SCROLL SUAVE IN-PAGE
  ============================================================ */
const InPageScroll = (() => {
  const init = () => {
    selAll('a[href^="#fn-"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const target = sel(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const navbar = sel('#navbar');
        const offset = (navbar ? navbar.offsetHeight : 70) + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  };
  return { init };
})();


/* ============================================================
  10. INICIALIZACIÓN
  ============================================================ */
onReady(() => {
  MarketCanvas.init();
  HeroParallax.init();
  ConceptsAnimation.init();
  GuidesReveal.init();
  MythsReveal.init();
  ResourcesReveal.init();
  CardGlow.init();
  InPageScroll.init();

  console.log(
    '%c 💰 Finanzas — finanzas.js cargado ',
    'background: #2DBA77; color: #032117; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 4px;'
  );
});
