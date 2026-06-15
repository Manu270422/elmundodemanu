/**
 * ============================================================
 * barranca.js — El Mundo de Manu / Barrancabermeja
 * ============================================================
 * Script específico de la sección más épica del sitio.
 * script.js global ya maneja cursor, navbar y animaciones base.
 *
 * Módulos:
 * 01. Utilidades locales
 * 02. Canvas 3D de flujo de crudo (OilFlowCanvas)
 * 03. Contador animado de stats del hero
 * 04. Animación del timeline (pipeline reveal)
 * 05. Barras de progreso HUD de la refinería
 * 06. Parallax del hero
 * 07. Reveal de cards de identidad
 * 08. Reveal de turismo y distrito
 * 09. CardGlow — brillo ámbar al hover/touch
 * 10. Scroll suave in-page (#bq-*)
 * 11. Inicialización
 *
 * EFECTO ÚNICO (OilFlowCanvas):
 * Simulación 3D de partículas de crudo fluyendo a través de
 * una red de tuberías invisibles. Cada partícula tiene una
 * coordenada Z que afecta su tamaño y opacidad (perspectiva
 * manual). Las partículas fluyen en trayectorias curvadas
 * que se bifurcan y reconectan, imitando las tuberías de
 * un complejo industrial visto desde arriba. El color va del
 * ámbar oscuro (crudo crudo) al dorado (refinado).
 *
 * Adicionalmente, hay líneas de "pipeline" que se trazan
 * con un dash animado — como trazos técnicos en un mapa de
 * instalación industrial.
 *
 * EFECTOS ADICIONALES:
 * - Contador animado con easing para los stats del hero
 * - Barras de progreso HUD que se llenan al hacer scroll
 * - Timeline que revela nodos uno a uno con efecto de pulso
 *
 * COMPATIBILIDAD MÓVIL:
 * Menos partículas en móvil. Listeners pasivos.
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

/** Interpolación con easing suave para contadores */
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);


/* ============================================================
  02. CANVAS 3D DE FLUJO DE CRUDO (OilFlowCanvas)
  Partículas de crudo que fluyen por rutas curvadas,
  con perspectiva 3D manual. Líneas de pipeline con
  dash animado en el fondo.
  ============================================================ */
const OilFlowCanvas = (() => {

  const canvas = sel('#bqCanvas');
  if (!canvas) return { init: () => {} };

  const ctx = canvas.getContext('2d');
  let W, H;
  let particles = [];
  let pipes = [];
  let rafId;
  let time = 0;

  // Ajusto densidad según dispositivo
  const PARTICLE_COUNT = isTouchDevice() ? 50 : 110;

  // Paleta de ámbar crudo → dorado refinado
  const COLORS = ['212,130,10', '240,192,96', '155,90,4', '255,74,28'];

  const resize = () => {
    W = canvas.width  = canvas.parentElement.offsetWidth;
    H = canvas.height = canvas.parentElement.offsetHeight;
    buildPipes();
    buildParticles();
  };

  /**
   * Genero la red de "tuberías" — segmentos curvados que
   * atraviesan el canvas como un plano de instalación industrial.
   * Cada tubería es una serie de puntos bezier que forman
   * la ruta por la que fluirán las partículas.
   */
  const buildPipes = () => {
    pipes = [];
    const pipeCount = isTouchDevice() ? 5 : 9;

    for (let i = 0; i < pipeCount; i++) {
      const startX = Math.random() * W;
      const startY = Math.random() * H;
      const segments = [];
      let x = startX, y = startY;

      for (let s = 0; s < 3; s++) {
        const nx = x + (Math.random() - 0.5) * W * 0.6;
        const ny = y + (Math.random() - 0.5) * H * 0.5;
        const cx = (x + nx) / 2 + (Math.random() - 0.5) * 150;
        const cy = (y + ny) / 2 + (Math.random() - 0.5) * 150;
        segments.push({ x1: x, y1: y, cx, cy, x2: nx, y2: ny });
        x = nx; y = ny;
      }

      pipes.push({
        segments,
        dashOffset: Math.random() * 100,
        opacity: 0.04 + Math.random() * 0.06,
      });
    }
  };

  /**
   * Cada partícula sigue un pipe y avanza a lo largo de él.
   * La coordenada Z (0 a 1) simula profundidad en perspectiva.
   */
  const buildParticles = () => {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const pipeIdx = Math.floor(Math.random() * pipes.length);
      particles.push({
        pipeIdx,
        t: Math.random(),          // Posición a lo largo del pipe (0→1 total)
        speed: 0.0012 + Math.random() * 0.002,
        z: 0.2 + Math.random() * 0.8,   // Profundidad
        colorIdx: Math.floor(Math.random() * COLORS.length),
        size: 1.5 + Math.random() * 2.5,
      });
    }
  };

  /** Calculo la posición (x, y) de una partícula según su progreso t */
  const getParticlePos = (particle) => {
    const pipe = pipes[particle.pipeIdx];
    if (!pipe) return { x: 0, y: 0 };

    const totalSegs = pipe.segments.length;
    const tScaled = particle.t * totalSegs;
    const segIdx = Math.min(Math.floor(tScaled), totalSegs - 1);
    const segT = tScaled - segIdx;

    const seg = pipe.segments[segIdx];
    const mt = 1 - segT;
    const x = mt * mt * seg.x1 + 2 * mt * segT * seg.cx + segT * segT * seg.x2;
    const y = mt * mt * seg.y1 + 2 * mt * segT * seg.cy + segT * segT * seg.y2;
    return { x, y };
  };

  /** Dibujo las líneas de pipeline (tuberías) */
  const drawPipes = () => {
    pipes.forEach((pipe) => {
      ctx.beginPath();
      pipe.segments.forEach((seg, i) => {
        if (i === 0) ctx.moveTo(seg.x1, seg.y1);
        ctx.quadraticCurveTo(seg.cx, seg.cy, seg.x2, seg.y2);
      });
      ctx.strokeStyle = `rgba(212, 130, 10, ${pipe.opacity})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([12, 20]);
      ctx.lineDashOffset = -pipe.dashOffset;
      ctx.stroke();
      ctx.setLineDash([]);
    });
  };

  /** Actualizo el dashOffset para que los dashes "fluyan" */
  const updatePipes = () => {
    pipes.forEach((pipe) => {
      pipe.dashOffset -= 0.3;
    });
  };

  /** Dibujo todas las partículas con perspectiva 3D manual */
  const drawParticles = () => {
    particles.forEach((p) => {
      const { x, y } = getParticlePos(p);

      // Perspectiva: Z afecta tamaño y opacidad
      const scale = 0.4 + p.z * 0.8;
      const size  = p.size * scale;
      const alpha = 0.15 + p.z * 0.65;

      const color = COLORS[p.colorIdx];

      // Glow de la partícula
      const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
      glow.addColorStop(0, `rgba(${color}, ${alpha * 0.6})`);
      glow.addColorStop(1, `rgba(${color}, 0)`);
      ctx.beginPath();
      ctx.arc(x, y, size * 4, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Núcleo sólido
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, ${alpha})`;
      ctx.fill();

      // Avanza la partícula
      p.t += p.speed;
      if (p.t >= 1) {
        // Reinicia en un pipe aleatorio
        p.t = 0;
        p.pipeIdx = Math.floor(Math.random() * pipes.length);
        p.colorIdx = Math.floor(Math.random() * COLORS.length);
      }
    });
  };

  const loop = () => {
    time++;
    ctx.clearRect(0, 0, W, H);
    updatePipes();
    drawPipes();
    drawParticles();
    rafId = requestAnimationFrame(loop);
  };

  const drawStatic = () => {
    ctx.clearRect(0, 0, W, H);
    drawPipes();
    // Solo dibujo partículas en posición fija
    particles.forEach((p) => {
      const { x, y } = getParticlePos(p);
      const scale = 0.4 + p.z * 0.8;
      const size  = p.size * scale;
      const color = COLORS[p.colorIdx];
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, 0.5)`;
      ctx.fill();
    });
  };

  const init = () => {
    resize();

    if (prefersReducedMotion()) {
      drawStatic();
      window.addEventListener('resize', () => { resize(); drawStatic(); }, { passive: true });
      return;
    }

    rafId = requestAnimationFrame(loop);

    window.addEventListener('resize', () => {
      resize();
    }, { passive: true });

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
  03. CONTADOR ANIMADO PARA STATS DEL HERO
  Los números 1536, 1922 y 252 hacen conteo hacia arriba
  con easing para dar dramatismo al hero.
  ============================================================ */
const HeroCounters = (() => {
  const DURATION = 1800; // ms

  const animateCounter = (el, target) => {
    const start = performance.now();
    const isYear = target > 1000;

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = easeOutQuart(progress);
      const current = Math.floor(eased * target);
      el.textContent = current.toLocaleString('es-CO');
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('es-CO');
    };
    requestAnimationFrame(step);
  };

  const init = () => {
    const counters = selAll('[data-count-bq]');
    if (!counters.length || prefersReducedMotion()) {
      counters.forEach(c => {
        c.textContent = parseInt(c.dataset.countBq).toLocaleString('es-CO');
      });
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const target = parseInt(e.target.dataset.countBq);
          animateCounter(e.target, target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(c => obs.observe(c));
  };

  return { init };
})();


/* ============================================================
  04. ANIMACIÓN DEL TIMELINE
  Los nodos del pipeline se revelan uno a uno con un efecto
  de "activación" — el punto central pulsa al entrar.
  ============================================================ */
const TimelineReveal = (() => {
  const init = () => {
    const nodes = selAll('.bq-tnode');
    if (!nodes.length || prefersReducedMotion()) return;

    nodes.forEach((node, i) => {
      node.style.opacity = '0';
      const isAlt = node.classList.contains('bq-tnode--alt');
      node.style.transform = `translateX(${isAlt ? -30 : 30}px)`;
      node.style.transition = `
        opacity 0.65s ease ${i * 120}ms,
        transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${i * 120}ms`;
    });

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateX(0)';
          // Pulso en el punto central al revelar
          const dot = e.target.querySelector('.bq-tnode__dot');
          if (dot) {
            dot.style.transform = 'scale(1.6)';
            dot.style.boxShadow = '0 0 0 2px #F0C060, 0 0 40px rgba(212,130,10,1)';
            setTimeout(() => {
              dot.style.transform = '';
              dot.style.boxShadow = '';
              dot.style.transition = '';
            }, 500);
          }
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

    nodes.forEach(n => obs.observe(n));
  };
  return { init };
})();


/* ============================================================
  05. BARRAS DE PROGRESO HUD DE LA REFINERÍA
  Las barras se llenan solas al entrar en viewport, como
  indicadores de una pantalla de control de planta.
  ============================================================ */
const RefineryBars = (() => {
  const init = () => {
    const bars = selAll('.bq-refinery__hud-fill');
    if (!bars.length || prefersReducedMotion()) {
      bars.forEach(b => { b.style.width = b.style.getPropertyValue('--fill') || '100%'; });
      return;
    }

    // Activo todas cuando cualquiera entra en viewport (el grid completo)
    const hud = sel('.bq-refinery__hud');
    if (!hud) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          bars.forEach((bar, i) => {
            setTimeout(() => {
              bar.classList.add('bq-fill-active');
            }, i * 200);
          });
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });

    obs.observe(hud);
  };
  return { init };
})();


/* ============================================================
  06. PARALLAX DEL HERO
  ============================================================ */
const HeroParallax = (() => {
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const heroEl = sel('.bq-hero');
      if (!heroEl) { ticking = false; return; }
      const scrollY = window.scrollY;
      const heroH   = heroEl.offsetHeight;
      if (scrollY > heroH) { ticking = false; return; }
      const progress = scrollY / heroH;

      const l1 = sel('.bq-hero__light--1');
      const l2 = sel('.bq-hero__light--2');
      const l3 = sel('.bq-hero__light--3');
      const rings = selAll('.bq-hero__ring');

      if (l1) l1.style.transform = `scale(1) translateX(-50%) translateY(${progress * 80}px)`;
      if (l2) l2.style.transform = `translateY(${progress * -50}px)`;
      if (l3) l3.style.transform = `translateY(${progress * 40}px)`;
      rings.forEach((r, i) => {
        r.style.transform = `translateX(-50%) translateY(-50%) translateY(${progress * (30 + i * 20)}px)`;
        r.style.marginLeft = '0';
        r.style.marginTop  = '0';
      });

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
  07. REVEAL DE CARDS DE IDENTIDAD Y NATURALEZA
  ============================================================ */
const IdentityReveal = (() => {
  const init = () => {
    const cards = selAll('.bq-identity__card');
    if (!cards.length || prefersReducedMotion()) return;

    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9) translateY(14px)';
      card.style.transition = `
        opacity 0.5s ease ${i * 80}ms,
        transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 80}ms`;
    });

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'scale(1) translateY(0)';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });

    cards.forEach(c => obs.observe(c));
  };
  return { init };
})();


/* ============================================================
  08. REVEAL DE NATURALEZA, TURISMO Y PILARES
  ============================================================ */
const SectionsReveal = (() => {
  const init = () => {
    // Naturaleza — entra desde abajo
    const natCards = selAll('.bq-nature-card');
    if (natCards.length && !prefersReducedMotion()) {
      natCards.forEach((c, i) => {
        c.style.opacity = '0';
        c.style.transform = 'translateY(24px)';
        c.style.transition = `opacity 0.55s ease ${i * 100}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 100}ms`;
      });
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });
      natCards.forEach(c => obs.observe(c));
    }

    // Turismo — entra con rotación ligera
    const spots = selAll('.bq-spot');
    if (spots.length && !prefersReducedMotion()) {
      spots.forEach((s, i) => {
        s.style.opacity = '0';
        s.style.transform = 'translateX(-16px)';
        s.style.transition = `opacity 0.5s ease ${i * 85}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 85}ms`;
      });
      const obs2 = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateX(0)';
            obs2.unobserve(e.target);
          }
        });
      }, { threshold: 0.15 });
      spots.forEach(s => obs2.observe(s));
    }

    // Pilares del distrito — escala tipo resorte
    const pillars = selAll('.bq-pillar');
    if (pillars.length && !prefersReducedMotion()) {
      pillars.forEach((p, i) => {
        p.style.opacity = '0';
        p.style.transform = 'scale(0.88) translateY(18px)';
        p.style.transition = `opacity 0.52s ease ${i * 90}ms, transform 0.52s cubic-bezier(0.34,1.56,0.64,1) ${i * 90}ms`;
      });
      const obs3 = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'scale(1) translateY(0)';
            obs3.unobserve(e.target);
          }
        });
      }, { threshold: 0.15 });
      pillars.forEach(p => obs3.observe(p));
    }
  };
  return { init };
})();


/* ============================================================
  09. CARDGLOW — BRILLO ÁMBAR AL HOVER/TOUCH
  ============================================================ */
const CardGlow = (() => {
  const GLOW = '0 12px 40px rgba(0,0,0,0.4), 0 0 24px rgba(212,130,10,0.18)';
  const OFF  = '';

  const apply = (card) => {
    card.addEventListener('mouseenter', () => { card.style.boxShadow = GLOW; });
    card.addEventListener('mouseleave', () => { card.style.boxShadow = OFF; });
    card.addEventListener('touchstart', () => {
      card.style.boxShadow = GLOW;
      setTimeout(() => { card.style.boxShadow = OFF; }, 700);
    }, { passive: true });
  };

  const init = () => {
    selAll('.bq-identity__card, .bq-nature-card, .bq-spot, .bq-pillar, .bq-refinery__article-col')
      .forEach(apply);
  };
  return { init };
})();


/* ============================================================
  10. SCROLL SUAVE IN-PAGE
  ============================================================ */
const InPageScroll = (() => {
  const init = () => {
    selAll('a[href^="#bq-"]').forEach((link) => {
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
  11. INICIALIZACIÓN
  ============================================================ */
onReady(() => {
  OilFlowCanvas.init();
  HeroCounters.init();
  TimelineReveal.init();
  RefineryBars.init();
  HeroParallax.init();
  IdentityReveal.init();
  SectionsReveal.init();
  CardGlow.init();
  InPageScroll.init();

  console.log(
    '%c 🛢️ Barrancabermeja — barranca.js cargado ',
    'background: #D4820A; color: #1A0C00; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 4px;'
  );
});
