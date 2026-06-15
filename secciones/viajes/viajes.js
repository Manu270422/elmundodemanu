/**
 * ============================================================
 * viajes.js — El Mundo de Manu / Viajes y Aventura
 * ============================================================
 * Script específico de la sección de Viajes.
 * script.js global ya maneja cursor, navbar y animaciones base.
 * Aquí controlo lo único de esta página.
 *
 * Módulos:
 * 01. Utilidades locales
 * 02. Canvas de rutas — mapa con itinerarios que se trazan solos
 * 03. Parallax del hero
 * 04. Animación de estilos de viaje (entrada escalonada)
 * 05. Guías — reveal al scroll
 * 06. Checklist — entrada por columnas
 * 07. Herramientas — entrada lateral
 * 08. CardGlow — brillo naranja al hover/touch
 * 09. Scroll suave in-page (#vj-*)
 * 10. Inicialización
 *
 * EFECTO ÚNICO (RouteCanvas):
 * En vez de partículas o grids, dibujo un "mapa" con nodos
 * (destinos) conectados por arcos curvos. Las rutas se
 * "dibujan" progresivamente como cuando planeas un itinerario
 * en un mapa. Al terminar de trazar todas, reinicia el ciclo.
 * Es la metáfora visual perfecta para una sección de viajes.
 *
 * COMPATIBILIDAD MÓVIL:
 * Todos los listeners pasivos. Menos nodos en móvil.
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
  02. CANVAS DE RUTAS (RouteCanvas)
  Dibujo un mapa estilizado: nodos distribuidos por el lienzo
  (como ciudades) conectados por arcos curvos. Las conexiones
  se trazan progresivamente — la línea "crece" desde un nodo
  al siguiente como dibujando una ruta en un mapa de viaje.

  Cuando todas las rutas están trazadas, hago un fade suave
  y reinicio con nuevas conexiones. El movimiento es lento
  y contemplativo, no frenético.
  ============================================================ */
const RouteCanvas = (() => {

  const canvas = sel('#vjCanvas');
  if (!canvas) return { init: () => {} };

  const ctx = canvas.getContext('2d');
  let width, height;
  let nodes = [];
  let routes = [];
  let rafId;
  let phase = 'drawing';   // 'drawing' | 'holding' | 'fading'
  let phaseStart = null;

  // Configuración — menos nodos en móvil para no saturar
  const NODE_COUNT = isTouchDevice() ? 7 : 12;
  const ROUTE_COUNT = isTouchDevice() ? 6 : 10;

  const HOLD_MS   = 2200;  // Tiempo que las rutas quedan visibles
  const FADE_MS   = 1200;  // Duración del fade out antes de reiniciar

  // Colores cálidos de la paleta de viajes
  const SUNSET = '255, 126, 71';
  const AMBER  = '255, 169, 77';

  const resize = () => {
    width  = canvas.width  = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  };

  /** Genero nodos distribuidos de forma semi-aleatoria */
  const createNodes = () => {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: width  * (0.1 + Math.random() * 0.8),
        y: height * (0.1 + Math.random() * 0.8),
        r: 2 + Math.random() * 2,
        // Pulso individual para que los nodos "respiren"
        pulse: Math.random() * Math.PI * 2,
      });
    }
  };

  /**
   * Genero rutas entre nodos. Cada ruta conecta dos nodos
   * con un arco curvo (usando un punto de control desplazado).
   * El campo 'progress' (0 a 1) controla cuánto se ha dibujado.
   */
  const createRoutes = () => {
    routes = [];
    for (let i = 0; i < ROUTE_COUNT; i++) {
      const a = Math.floor(Math.random() * nodes.length);
      let b = Math.floor(Math.random() * nodes.length);
      while (b === a) b = Math.floor(Math.random() * nodes.length);

      const na = nodes[a];
      const nb = nodes[b];

      // Punto de control para la curva — perpendicular al punto medio
      const mx = (na.x + nb.x) / 2;
      const my = (na.y + nb.y) / 2;
      const dx = nb.x - na.x;
      const dy = nb.y - na.y;
      const offset = (Math.random() - 0.5) * 0.4;

      routes.push({
        ax: na.x, ay: na.y,
        bx: nb.x, by: nb.y,
        cx: mx - dy * offset,  // control perpendicular
        cy: my + dx * offset,
        progress: 0,
        // Velocidad de trazado escalonada — cada ruta empieza
        // un poco después que la anterior para efecto secuencial
        delay: i * 0.06,
        speed: 0.008 + Math.random() * 0.006,
      });
    }
  };

  /** Calculo un punto sobre la curva cuadrática Bézier en t */
  const bezierPoint = (route, t) => {
    const mt = 1 - t;
    const x = mt * mt * route.ax + 2 * mt * t * route.cx + t * t * route.bx;
    const y = mt * mt * route.ay + 2 * mt * t * route.cy + t * t * route.by;
    return { x, y };
  };

  /** Dibujo todos los nodos con su glow y pulso */
  const drawNodes = (globalAlpha) => {
    nodes.forEach((node) => {
      node.pulse += 0.02;
      const pulseFactor = 0.7 + Math.sin(node.pulse) * 0.3;

      // Glow del nodo
      const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r * 5);
      grad.addColorStop(0, `rgba(${SUNSET}, ${0.4 * globalAlpha * pulseFactor})`);
      grad.addColorStop(1, `rgba(${SUNSET}, 0)`);
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r * 5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Punto central del nodo
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${AMBER}, ${0.8 * globalAlpha})`;
      ctx.fill();
    });
  };

  /** Dibujo las rutas según su progreso de trazado */
  const drawRoutes = (globalAlpha) => {
    routes.forEach((route) => {
      if (route.progress <= 0) return;

      // Dibujo la curva hasta el progreso actual con segmentos
      ctx.beginPath();
      const steps = 30;
      const maxStep = Math.floor(steps * route.progress);

      for (let i = 0; i <= maxStep; i++) {
        const t = i / steps;
        const p = bezierPoint(route, t);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }

      ctx.strokeStyle = `rgba(${SUNSET}, ${0.35 * globalAlpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Punto brillante en la cabeza de la ruta mientras se dibuja
      if (route.progress < 1) {
        const head = bezierPoint(route, route.progress);
        ctx.beginPath();
        ctx.arc(head.x, head.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${AMBER}, ${globalAlpha})`;
        ctx.fill();
      }
    });
  };

  /** Loop principal con máquina de estados por fases */
  const loop = (timestamp) => {
    if (!phaseStart) phaseStart = timestamp;
    const elapsed = timestamp - phaseStart;

    ctx.clearRect(0, 0, width, height);

    let globalAlpha = 1;

    if (phase === 'drawing') {
      // Avanzo el progreso de cada ruta respetando su delay
      let allDone = true;
      const totalElapsed = elapsed / 1000;
      routes.forEach((route) => {
        if (totalElapsed > route.delay) {
          route.progress = Math.min(1, route.progress + route.speed);
        }
        if (route.progress < 1) allDone = false;
      });

      if (allDone) {
        phase = 'holding';
        phaseStart = timestamp;
      }
    } else if (phase === 'holding') {
      // Mantengo las rutas visibles un momento
      if (elapsed > HOLD_MS) {
        phase = 'fading';
        phaseStart = timestamp;
      }
    } else if (phase === 'fading') {
      // Fade out y reinicio
      globalAlpha = Math.max(0, 1 - elapsed / FADE_MS);
      if (elapsed > FADE_MS) {
        createNodes();
        createRoutes();
        phase = 'drawing';
        phaseStart = timestamp;
      }
    }

    drawRoutes(globalAlpha);
    drawNodes(globalAlpha);

    rafId = requestAnimationFrame(loop);
  };

  /** Dibujo estático para prefers-reduced-motion */
  const drawStatic = () => {
    ctx.clearRect(0, 0, width, height);
    routes.forEach((route) => { route.progress = 1; });
    drawRoutes(0.7);
    drawNodes(0.7);
  };

  const init = () => {
    resize();
    createNodes();
    createRoutes();

    if (prefersReducedMotion()) {
      drawStatic();
      window.addEventListener('resize', () => {
        resize(); createNodes(); createRoutes(); drawStatic();
      }, { passive: true });
      return;
    }

    rafId = requestAnimationFrame(loop);

    window.addEventListener('resize', () => {
      resize(); createNodes(); createRoutes();
      phase = 'drawing'; phaseStart = null;
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        phaseStart = null;
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
      const heroEl = sel('.vj-hero');
      if (!heroEl) { ticking = false; return; }
      const scrollY = window.scrollY;
      const heroH = heroEl.offsetHeight;
      if (scrollY > heroH) { ticking = false; return; }
      const progress = scrollY / heroH;

      const l1 = sel('.vj-hero__light--1');
      const l2 = sel('.vj-hero__light--2');
      const l3 = sel('.vj-hero__light--3');

      if (l1) l1.style.transform = `translateX(-50%) translateY(${progress * 70}px)`;
      if (l2) l2.style.transform = `translateY(${progress * -40}px)`;
      if (l3) l3.style.transform = `translateY(${progress * 30}px)`;

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
  04. ANIMACIÓN DE ESTILOS DE VIAJE
  ============================================================ */
const StylesAnimation = (() => {
  const init = () => {
    const cards = selAll('.vj-style-card');
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
    const cards = selAll('.vj-guide-card');
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
  06. CHECKLIST — ENTRADA POR COLUMNAS
  Las 4 columnas entran deslizando desde abajo en secuencia.
  ============================================================ */
const ChecklistReveal = (() => {
  const init = () => {
    const cols = selAll('.vj-checklist__col');
    if (!cols.length || prefersReducedMotion()) return;

    cols.forEach((col, i) => {
      col.style.opacity = '0';
      col.style.transform = 'translateY(24px)';
      col.style.transition = `
        opacity 0.5s ease ${i * 110}ms,
        transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 110}ms`;
    });

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    cols.forEach((c) => obs.observe(c));
  };
  return { init };
})();


/* ============================================================
  07. HERRAMIENTAS — ENTRADA LATERAL
  ============================================================ */
const ToolsReveal = (() => {
  const init = () => {
    const cards = selAll('.vj-tool-card');
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
  08. CARDGLOW — BRILLO NARANJA AL HOVER/TOUCH
  Aplico el glow a estilos, checklist y herramientas juntos.
  ============================================================ */
const CardGlow = (() => {
  const GLOW = '0 12px 40px rgba(0,0,0,0.35), 0 0 20px rgba(255,126,71,0.15)';
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
    selAll('.vj-style-card, .vj-checklist__col, .vj-tool-card').forEach(apply);
  };
  return { init };
})();


/* ============================================================
  09. SCROLL SUAVE IN-PAGE
  ============================================================ */
const InPageScroll = (() => {
  const init = () => {
    selAll('a[href^="#vj-"]').forEach((link) => {
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
  RouteCanvas.init();
  HeroParallax.init();
  StylesAnimation.init();
  GuidesReveal.init();
  ChecklistReveal.init();
  ToolsReveal.init();
  CardGlow.init();
  InPageScroll.init();

  console.log(
    '%c 🌍 Viajes — viajes.js cargado ',
    'background: #FF7E47; color: #2A1206; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 4px;'
  );
});
