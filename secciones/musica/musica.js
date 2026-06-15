/**
 * ============================================================
 * musica.js — El Mundo de Manu / Música y Sonido
 * ============================================================
 * Script específico de la sección de Música.
 * script.js global ya maneja cursor, navbar y animaciones base.
 * Aquí controlo lo único de esta página.
 *
 * Módulos:
 * 01. Utilidades locales
 * 02. Canvas visualizer — barras de frecuencia tipo ecualizador
 * 03. Parallax del hero
 * 04. Animación de géneros (entrada escalonada)
 * 05. Guías — reveal al scroll
 * 06. Beneficios — entrada con escala
 * 07. Herramientas — entrada lateral
 * 08. CardGlow — brillo púrpura al hover/touch
 * 09. Scroll suave in-page (#ms-*)
 * 10. Inicialización
 *
 * EFECTO ÚNICO (VisualizerCanvas):
 * Un visualizer de audio simulado — barras verticales que
 * suben y bajan como un ecualizador reaccionando a música.
 * No hay audio real (sería invasivo autoreproducir sonido),
 * así que simulo el espectro de frecuencias con varias ondas
 * sinusoidales superpuestas a distintas velocidades. El
 * resultado se ve y se siente como un ecualizador vivo.
 * Es el efecto perfecto y único para una sección de música.
 *
 * COMPATIBILIDAD MÓVIL:
 * Listeners pasivos. Menos barras en móvil.
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
  02. CANVAS VISUALIZER (VisualizerCanvas)
  Simulo un espectro de audio. Cada barra tiene su propia
  combinación de ondas sinusoidales con frecuencias y fases
  distintas, de modo que el conjunto sube y baja de forma
  orgánica e impredecible — igual que un ecualizador real
  reaccionando a una canción. Las barras se dibujan en la
  base del hero, simétricas hacia arriba, con degradado.
  ============================================================ */
const VisualizerCanvas = (() => {

  const canvas = sel('#msCanvas');
  if (!canvas) return { init: () => {} };

  const ctx = canvas.getContext('2d');
  let width, height;
  let bars = [];
  let rafId;
  let time = 0;

  // Menos barras en móvil para mantener fluidez
  const BAR_COUNT = isTouchDevice() ? 40 : 72;

  // Colores de la paleta de música
  const PURPLE = '177, 78, 255';
  const PINK   = '255, 95, 210';

  const resize = () => {
    width  = canvas.width  = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
    buildBars();
  };

  /**
   * Cada barra tiene parámetros propios de oscilación.
   * Combino tres ondas por barra para un movimiento rico.
   */
  const buildBars = () => {
    bars = [];
    for (let i = 0; i < BAR_COUNT; i++) {
      bars.push({
        // Tres frecuencias distintas por barra
        f1: 0.5 + Math.random() * 1.5,
        f2: 1.0 + Math.random() * 2.0,
        f3: 2.0 + Math.random() * 3.0,
        // Desfase propio para que no suban todas iguales
        phase: Math.random() * Math.PI * 2,
        // Amplitud base — las del centro un poco más altas
        // para simular que ahí están las frecuencias dominantes
        baseAmp: 0,
      });
    }
    // Asigno amplitud con forma de campana (centro más alto)
    bars.forEach((bar, i) => {
      const center = BAR_COUNT / 2;
      const distFromCenter = Math.abs(i - center) / center;
      bar.baseAmp = 0.35 + (1 - distFromCenter) * 0.5;
    });
  };

  /** Calculo la altura normalizada (0 a 1) de una barra en el tiempo */
  const barHeight = (bar) => {
    const wave =
      Math.sin(time * bar.f1 + bar.phase) * 0.5 +
      Math.sin(time * bar.f2 + bar.phase) * 0.3 +
      Math.sin(time * bar.f3 + bar.phase) * 0.2;
    // Normalizo de [-1,1] a [0,1] y aplico amplitud base
    const normalized = (wave + 1) / 2;
    return Math.max(0.05, normalized * bar.baseAmp);
  };

  /** Dibujo todas las barras desde la base hacia arriba */
  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    const gap = 3;
    const barW = (width - gap * (BAR_COUNT - 1)) / BAR_COUNT;
    const maxH = height * 0.45;   // Altura máxima de una barra

    bars.forEach((bar, i) => {
      const h = barHeight(bar) * maxH;
      const x = i * (barW + gap);
      const y = height - h;

      // Degradado vertical púrpura → rosa
      const grad = ctx.createLinearGradient(0, height, 0, y);
      grad.addColorStop(0, `rgba(${PURPLE}, 0.05)`);
      grad.addColorStop(0.6, `rgba(${PURPLE}, 0.25)`);
      grad.addColorStop(1, `rgba(${PINK}, 0.4)`);

      ctx.fillStyle = grad;
      // Barras con esquinas superiores redondeadas
      roundedTopRect(x, y, barW, h, Math.min(barW / 2, 3));
      ctx.fill();

      // Reflejo tenue de la barra en el "suelo" (efecto espejo)
      const reflectH = h * 0.3;
      const rGrad = ctx.createLinearGradient(0, height, 0, height + reflectH);
      rGrad.addColorStop(0, `rgba(${PURPLE}, 0.12)`);
      rGrad.addColorStop(1, `rgba(${PURPLE}, 0)`);
      ctx.fillStyle = rGrad;
      ctx.fillRect(x, height, barW, reflectH);
    });
  };

  /** Dibujo un rectángulo con las dos esquinas de arriba redondeadas */
  const roundedTopRect = (x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
  };

  /** Loop principal */
  const loop = () => {
    time += 0.04;
    draw();
    rafId = requestAnimationFrame(loop);
  };

  /** Estático para prefers-reduced-motion: dibujo un frame fijo */
  const drawStatic = () => {
    time = 1.2;   // Un instante cualquiera que se vea bien
    draw();
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
      const heroEl = sel('.ms-hero');
      if (!heroEl) { ticking = false; return; }
      const scrollY = window.scrollY;
      const heroH = heroEl.offsetHeight;
      if (scrollY > heroH) { ticking = false; return; }
      const progress = scrollY / heroH;

      const l1 = sel('.ms-hero__light--1');
      const l2 = sel('.ms-hero__light--2');
      const l3 = sel('.ms-hero__light--3');

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
  04. ANIMACIÓN DE GÉNEROS
  ============================================================ */
const GenresAnimation = (() => {
  const init = () => {
    const cards = selAll('.ms-genre-card');
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
    const cards = selAll('.ms-guide-card');
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
  06. BENEFICIOS — ENTRADA CON ESCALA
  ============================================================ */
const BenefitsReveal = (() => {
  const init = () => {
    const cards = selAll('.ms-benefit-card');
    if (!cards.length || prefersReducedMotion()) return;

    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9) translateY(20px)';
      card.style.transition = `
        opacity 0.5s ease ${i * 100}ms,
        transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 100}ms`;
    });

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'scale(1) translateY(0)';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    cards.forEach((c) => obs.observe(c));
  };
  return { init };
})();


/* ============================================================
  07. HERRAMIENTAS — ENTRADA LATERAL
  ============================================================ */
const ToolsReveal = (() => {
  const init = () => {
    const cards = selAll('.ms-tool-card');
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
  08. CARDGLOW — BRILLO PÚRPURA AL HOVER/TOUCH
  ============================================================ */
const CardGlow = (() => {
  const GLOW = '0 12px 40px rgba(0,0,0,0.4), 0 0 22px rgba(177,78,255,0.18)';
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
    selAll('.ms-genre-card, .ms-benefit-card, .ms-tool-card').forEach(apply);
  };
  return { init };
})();


/* ============================================================
  09. SCROLL SUAVE IN-PAGE
  ============================================================ */
const InPageScroll = (() => {
  const init = () => {
    selAll('a[href^="#ms-"]').forEach((link) => {
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
  VisualizerCanvas.init();
  HeroParallax.init();
  GenresAnimation.init();
  GuidesReveal.init();
  BenefitsReveal.init();
  ToolsReveal.init();
  CardGlow.init();
  InPageScroll.init();

  console.log(
    '%c 🎵 Música — musica.js cargado ',
    'background: #B14EFF; color: #1A0626; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 4px;'
  );
});
