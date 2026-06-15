/**
 * ============================================================
 * gaming.js — El Mundo de Manu / Gaming
 * ============================================================
 * Script específico para mi sección de Gaming.
 * script.js ya maneja cursor, navbar y animaciones globales.
 *
 * Aquí controlo todo lo que hace especial esta sección:
 * efectos de datos volando, stats animados, filtros,
 * el contador de nivel del HUD y sonido visual del control.
 *
 * Módulos:
 * 01. Utilidades locales
 * 02. Canvas de datos volando (partículas tipo HUD)
 * 03. Animación del HUD — contador de nivel
 * 04. Barras de stats del jugador (STR, INT, AGI, END)
 * 05. Medidores de géneros animados
 * 06. Animación de mis creaciones (juegos propios)
 * 07. Filtro de biblioteca de juegos
 * 08. Animación de lecciones con línea lateral
 * 09. Efecto glitch en el título del hero
 * 10. Scroll suave en página
 * 11. Animación de setup cards
 * 12. Inicialización
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

const isTouchDevice      = () => window.matchMedia('(pointer: coarse)').matches;
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ============================================================
  02. CANVAS DE DATOS VOLANDO — HUD PARTICLES
  Creo partículas que se mueven como datos en un HUD de juego.
  Son pequeños cuadrados, líneas y puntos en cyan
  que caen/flotan con velocidades distintas.
  Da la sensación de que hay información procesándose.
  ============================================================ */
const HUDCanvas = (() => {

  const canvas = sel('#gmCanvas');
  if (!canvas) return { init: () => {} };

  const ctx = canvas.getContext('2d');
  let particles = [];
  let width, height, rafId;

  /* Configuro menos partículas en móvil para no sobrecargar */
  const COUNT = isTouchDevice() ? 30 : 70;

  /* Tipos de "datos" que aparecen flotando */
  const DATA_SYMBOLS = [
    '0', '1', '●', '■', '▲', '✦',
    'HP', 'MP', 'EXP', 'LV',
    '100', '255', 'FF', '00',
  ];

  const resize = () => {
    width  = canvas.width  = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  };

  const createParticle = () => ({
    x:      Math.random() * width,
    y:      Math.random() * height,
    vy:     0.2 + Math.random() * 0.8, /* Caída hacia abajo */
    vx:     (Math.random() - 0.5) * 0.3,
    size:   6 + Math.random() * 8,
    alpha:  0.05 + Math.random() * 0.25,
    symbol: DATA_SYMBOLS[Math.floor(Math.random() * DATA_SYMBOLS.length)],
    /* Alterna entre cyan y magenta para dinamismo */
    color:  Math.random() > 0.85 ? '255, 45, 120' : '0, 212, 255',
  });

  const initParticles = () => {
    particles = Array.from({ length: COUNT }, createParticle);
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      /* Muevo la partícula */
      p.y += p.vy;
      p.x += p.vx;

      /* Si sale por abajo, la reinicio arriba */
      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }
      if (p.x < -20 || p.x > width + 20) {
        p.x = Math.random() * width;
      }

      /* Dibujo el símbolo */
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.font = `${p.size}px 'Orbitron', monospace`;
      ctx.fillStyle = `rgba(${p.color}, 1)`;
      ctx.fillText(p.symbol, p.x, p.y);
      ctx.restore();
    });

    rafId = requestAnimationFrame(draw);
  };

  const init = () => {
    if (prefersReducedMotion()) return;

    resize();
    initParticles();
    draw();

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(rafId);
      else draw();
    });
  };

  return { init };

})();


/* ============================================================
  03. HUD — CONTADOR DE NIVEL
  El "LV" del HUD superior del hero cuenta de 01 a un número
  cuando el usuario carga la página, dando la sensación
  de que el jugador está subiendo de nivel.
  ============================================================ */
const HUDLevel = (() => {

  const FINAL_LEVEL = 24; /* Nivel actual del jugador */
  const DURATION    = 1800; /* ms */

  const init = () => {
    const levelEl = sel('#hudLevel');
    if (!levelEl) return;

    /* Espero un momento antes de iniciar para que sea visible */
    setTimeout(() => {
      let start = null;

      const step = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / DURATION, 1);
        /* Ease-out para que desacelere al final */
        const eased  = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * FINAL_LEVEL);
        levelEl.textContent = String(current).padStart(2, '0');
        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    }, 600);
  };

  return { init };

})();


/* ============================================================
  04. BARRAS DE STATS DEL JUGADOR
  Animo las barras STR, INT, AGI, END del hero cuando
  la sección entra en el viewport.
  ============================================================ */
const HeroStats = (() => {

  const init = () => {
    const bars = selAll('.gm-stat-hud__fill');
    if (!bars.length) return;
    if (prefersReducedMotion()) return;

    const heroSection = sel('.gm-hero');
    if (!heroSection) return;

    /* Las animo cuando el hero es visible */
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          bars.forEach((bar, i) => {
            const target = bar.getAttribute('data-width') || '0';
            setTimeout(() => {
              bar.style.width = `${target}%`;
            }, 300 + i * 120); /* Delay escalonado por stat */
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(heroSection);
  };

  return { init };

})();


/* ============================================================
  05. MEDIDORES DE GÉNEROS
  Animo las barras de afinidad de cada género cuando
  la sección de géneros entra en el viewport.
  Uso variables CSS --meter-width para el valor objetivo.
  ============================================================ */
const GenreMeters = (() => {

  const init = () => {
    const meters = selAll('.gm-genre-card__meter-fill');
    if (!meters.length) return;
    if (prefersReducedMotion()) return;

    /* Preparo cada barra con su variable CSS */
    meters.forEach((meter) => {
      const width = meter.getAttribute('data-width') || '0';
      meter.style.setProperty('--meter-width', `${width}%`);
    });

    const section = sel('.gm-genres');
    if (!section) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionMeters = selAll('.gm-genre-card__meter-fill', entry.target);
          sectionMeters.forEach((m, i) => {
            setTimeout(() => m.classList.add('is-animated'), i * 150);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(section);
  };

  return { init };

})();


/* ============================================================
  06. ANIMACIÓN DE MIS CREACIONES
  Las tarjetas de "Juegos que Desarrollé" entran con el mismo
  efecto de fade + traslación que uso en otras secciones de
  tarjetas, para que se sientan parte del mismo sistema visual.
  ============================================================ */
const CreationsAnimation = (() => {

  const init = () => {
    const cards = selAll('.gm-creation-card');
    if (!cards.length) return;
    if (prefersReducedMotion()) return;

    cards.forEach((card, index) => {
      card.style.opacity   = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = `
        opacity   0.5s ease ${index * 100}ms,
        transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 100}ms
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
      threshold: 0.15,
      rootMargin: '0px 0px -25px 0px',
    });

    cards.forEach((card) => observer.observe(card));
  };

  return { init };

})();


/* ============================================================
  07. FILTRO DE BIBLIOTECA DE JUEGOS
  Filtro las tarjetas de juegos por categoría al hacer clic
  en mis pills. No recargo la página — todo es dinámico.
  ============================================================ */
const LibraryFilter = (() => {

  const filters  = selAll('.gm-filter');
  const grid     = sel('#libraryGrid');
  const emptyMsg = sel('#libraryEmpty');

  /*
    Normalizo los strings para comparar sin problemas de tildes
    ni mayúsculas. Por ejemplo "Estrategia" → "estrategia",
    "Aventura" → "aventura". Así mis data-category del HTML
    siempre coinciden con el data-filter del botón pulsado.
  */
  const normalize = (str) =>
    str.toLowerCase()
       .normalize('NFD')
       .replace(/[\u0300-\u036f]/g, '');

  const applyFilter = (category) => {
    const normalCat = normalize(category);
    const cards = selAll('.gm-game-card', grid);
    let visible = 0;

    cards.forEach((card) => {
      /*
        Leo el data-category de la tarjeta y lo normalizo también
        para que la comparación sea siempre exacta e insensible
        a tildes (ej. "aventura" == "aventura" ✓).
      */
      const rawCats = card.getAttribute('data-category') || '';
      const cats    = normalize(rawCats);
      const show    = normalCat === 'todos' || cats.includes(normalCat);

      if (show) {
        card.classList.remove('gm-game-card--hidden');
        visible++;
        /* Animo la entrada de las tarjetas visibles */
        card.style.opacity   = '0';
        card.style.transform = 'scale(0.95) translateY(10px)';
        requestAnimationFrame(() => {
          card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          card.style.opacity    = '1';
          card.style.transform  = 'scale(1) translateY(0)';
        });
      } else {
        /* Oculto las tarjetas que no corresponden al filtro */
        card.classList.add('gm-game-card--hidden');
      }
    });

    /* Muestro el estado vacío si no hay resultados */
    if (emptyMsg) emptyMsg.hidden = visible > 0;
  };

  const init = () => {
    if (!filters.length) return;

    filters.forEach((btn) => {
      btn.addEventListener('click', () => {
        /* Actualizo el estado visual del pill activo */
        filters.forEach((b) => b.classList.remove('gm-filter--active'));
        btn.classList.add('gm-filter--active');
        /* Aplico el filtro usando el data-filter del botón pulsado */
        applyFilter(btn.getAttribute('data-filter'));
      });
    });
  };

  return { init };

})();


/* ============================================================
  08. ANIMACIÓN DE LECCIONES
  Las tarjetas de lecciones entran desde abajo con delay
  escalonado. La línea de acento lateral está controlada
  por CSS hover, pero la entrada la manejo desde JS.
  ============================================================ */
const LessonsAnimation = (() => {

  const init = () => {
    const cards = selAll('.gm-lesson-card');
    if (!cards.length) return;
    if (prefersReducedMotion()) return;

    cards.forEach((card, i) => {
      card.style.opacity    = '0';
      card.style.transform  = 'translateY(20px)';
      card.style.transition = `opacity 0.5s ease ${i * 80}ms,
                               transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -20px 0px' });

    cards.forEach((c) => observer.observe(c));
  };

  return { init };

})();


/* ============================================================
  09. EFECTO GLITCH EN EL TÍTULO
  El título "GAMING" hace un pequeño glitch ocasional —
  se desplaza unos píxeles horizontalmente con color split.
  Solo en desktop para no afectar rendimiento móvil.
  ============================================================ */
const TitleGlitch = (() => {

  const GLITCH_INTERVAL = 5000; /* ms entre glitches */
  const GLITCH_DURATION = 200;  /* ms duración del glitch */

  const init = () => {
    if (isTouchDevice()) return;
    if (prefersReducedMotion()) return;

    const titleEl = sel('.gm-hero__title-line');
    if (!titleEl) return;

    const glitch = () => {
      /* Fase 1: desplazamiento cyan */
      titleEl.style.textShadow = '-3px 0 var(--gm-magenta), 3px 0 var(--gm-cyan)';
      titleEl.style.transform  = 'translateX(-2px)';

      setTimeout(() => {
        /* Fase 2: desplazamiento inverso */
        titleEl.style.textShadow = '3px 0 var(--gm-magenta), -3px 0 var(--gm-cyan)';
        titleEl.style.transform  = 'translateX(2px)';

        setTimeout(() => {
          /* Reseteo */
          titleEl.style.textShadow = '';
          titleEl.style.transform  = '';
        }, GLITCH_DURATION / 2);

      }, GLITCH_DURATION / 2);
    };

    /* Primera vez después de que la página carga */
    setTimeout(glitch, 2000);
    /* Repetición periódica */
    setInterval(glitch, GLITCH_INTERVAL);
  };

  return { init };

})();


/* ============================================================
  10. SCROLL SUAVE EN PÁGINA
  Los botones del hero que apuntan a secciones de esta página
  hacen scroll suave con el offset del navbar.
  Compatible con móvil — no bloqueo eventos táctiles.
  ============================================================ */
const InPageScroll = (() => {

  const init = () => {
    const links = selAll('a[href^="#gm-"]');

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
  11. ANIMACIÓN DE SETUP CARDS
  Las tarjetas del setup entran con efecto de zoom + fade.
  ============================================================ */
const SetupAnimation = (() => {

  const init = () => {
    const cards = selAll('.gm-setup__card');
    if (!cards.length) return;
    if (prefersReducedMotion()) return;

    cards.forEach((card, i) => {
      card.style.opacity    = '0';
      card.style.transform  = 'scale(0.92)';
      card.style.transition = `opacity 0.4s ease ${i * 100}ms,
                               transform 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 100}ms`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionCards = selAll('.gm-setup__card', entry.target);
          sectionCards.forEach((card) => {
            card.style.opacity   = '1';
            card.style.transform = 'scale(1)';
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    const setupSection = sel('.gm-setup');
    if (setupSection) observer.observe(setupSection);
  };

  return { init };

})();


/* ============================================================
  INICIALIZACIÓN DE GAMING.JS
  ============================================================ */
onReady(() => {

  /* Canvas de fondo — primero para que ya esté listo */
  HUDCanvas.init();

  /* Contador de nivel del HUD */
  HUDLevel.init();

  /* Animaciones de barras y medidores */
  HeroStats.init();
  GenreMeters.init();

  /* Animación de mis juegos propios */
  CreationsAnimation.init();

  /* Filtro de juegos */
  LibraryFilter.init();

  /* Animaciones de secciones */
  LessonsAnimation.init();
  SetupAnimation.init();

  /* Efecto glitch del título */
  TitleGlitch.init();

  /* Scroll suave interno */
  InPageScroll.init();

  /* Log en consola estilo gaming */
  console.log(
    '%c 🎮 GAMING.JS — LOADED — PLAYER 1 READY ',
    'background: #00D4FF; color: #0A0A0F; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 4px; font-family: monospace;'
  );

});