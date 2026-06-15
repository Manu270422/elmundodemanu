/**
 * ============================================================
 * educacion.js — El Mundo de Manu / Educación
 * ============================================================
 * Script específico para mi sección de Educación.
 * script.js ya maneja cursor, navbar y animaciones globales.
 * Aquí controlo lo que es único de esta página educativa:
 *
 * Módulos:
 * 01. Utilidades locales
 * 02. Canvas de grid de puntos — efecto de activación neuronal
 * 03. Parallax sutil de luces en el hero
 * 04. Animación de entrada escalonada en las tarjetas de áreas
 * 05. Animación de entrada de la tarjeta de proyectos
 * 06. Citas — efecto de brillo verde al hacer hover/touch
 * 07. Reflexiones — reveal suave al scroll
 * 08. Recursos — entrada lateral desde la izquierda
 * 09. Scroll suave para links internos (#edu-*)
 * 10. Inicialización
 *
 * DIFERENCIA CLAVE CON FE.JS:
 * El canvas de fondo no usa partículas de luz sino un grid
 * de puntos pequeños donde los más cercanos al centro de la
 * pantalla se "activan" (se iluminan) al hacer scroll.
 * La idea visual es la de una red neuronal o un mapa conceptual
 * cobrando vida — muy coherente con la temática educativa.
 *
 * NOTA DE COMPATIBILIDAD MÓVIL:
 * Todos los event listeners de interacción usan { passive: true }
 * donde corresponde. En móvil el canvas usa menos puntos y la
 * activación por scroll es más agresiva para compensar el menor
 * rango de scroll relativo. El parallax solo corre en desktop.
 *
 * Autor: Carlos Manuel Turizo Hernández
 * Versión: 1.0.0
 * ============================================================
 */

'use strict';

/* ============================================================
  01. UTILIDADES LOCALES
  Las mismas helpers que en fe.js — simples y directas.
  No las importo de ningún módulo externo para mantener
  cada sección completamente autocontenida.
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
  02. CANVAS DE GRID DE PUNTOS
  A diferencia del canvas de estrellas de Fe (partículas
  doradas flotando al azar), aquí creo un grid ordenado de
  puntos pequeños. Al hacer scroll, los puntos que quedan
  dentro de un radio alrededor del centro del viewport
  se iluminan progresivamente — como una red neuronal
  activándose, o un mapa conceptual cobrando vida.

  La paleta es verde esmeralda/turquesa para respetar la
  identidad visual de esta sección y diferenciarse de Fe.
  ============================================================ */
const GridCanvas = (() => {

  const canvas = sel('#eduCanvas');
  if (!canvas) return { init: () => {} };

  const ctx = canvas.getContext('2d');
  let dots  = [];
  let width, height;
  let rafId;
  let scrollProgress = 0;  // Entre 0 y 1, lo actualizo en el scroll handler

  // Separación entre puntos del grid — más grande en móvil para no saturar
  const SPACING = isTouchDevice() ? 44 : 34;

  // Los dos colores verde que uso en esta sección, en formato RGB separado
  const COLOR_DIM    = '26, 140, 110';   // --edu-green apagado
  const COLOR_BRIGHT = '93, 217, 180';   // --edu-green-light brillante

  const resize = () => {
    width  = canvas.width  = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
    initDots();  // Regenero el grid cuando cambia el tamaño
  };

  /**
   * Genero el grid de puntos.
   * Cada punto tiene su posición fija (el grid no se mueve),
   * su radio base, y una distanciaActivacion que determina
   * qué tan cerca del centro tiene que estar el punto activo
   * para que se ilumine. Esto da variación visual dentro del grid.
   */
  const initDots = () => {
    dots = [];
    const cols = Math.ceil(width  / SPACING) + 1;
    const rows = Math.ceil(height / SPACING) + 1;

    // Desplazo ligeramente el grid para que no quede pegado al borde
    const offsetX = (width  % SPACING) / 2;
    const offsetY = (height % SPACING) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          x:           offsetX + c * SPACING,
          y:           offsetY + r * SPACING,
          baseR:       1.2,    // Radio base del punto apagado
          brightness:  0,      // Entre 0 (apagado) y 1 (máximo brillo)
          // Cada punto tiene su propio umbral de activación —
          // esto hace que el efecto no sea uniforme sino orgánico
          activationRadius: 90 + Math.random() * 80,
        });
      }
    }
  };

  /**
   * Actualizo el brillo de cada punto según su distancia
   * al centro activo (que sigo el scroll del usuario).
   * El centro activo está en el centro horizontal de la pantalla
   * y se mueve verticalmente con el scroll.
   */
  const update = () => {
    // Centro activo: x fijo al centro, y se mueve con el scroll
    const centerX = width / 2;
    const centerY = height * (0.5 - scrollProgress * 0.3);

    dots.forEach((dot) => {
      const dx   = dot.x - centerX;
      const dy   = dot.y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Calculo el brillo objetivo: 1 si está dentro del radio, 0 si está fuera
      const targetBrightness = dist < dot.activationRadius
        ? Math.max(0, 1 - dist / dot.activationRadius)
        : 0;

      // Lerp suave hacia el brillo objetivo — crea el efecto de "encenderse"
      dot.brightness += (targetBrightness - dot.brightness) * 0.04;
    });
  };

  /** Dibujo el frame actual del grid */
  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    dots.forEach((dot) => {
      const b = dot.brightness;

      // Opacidad base muy baja para el punto siempre visible
      const baseOpacity   = 0.08;
      const activeOpacity = baseOpacity + b * 0.55;

      // Color: interpolo entre dim y bright según el brillo
      const r = Math.round(26  + (93  - 26)  * b);
      const g = Math.round(140 + (217 - 140) * b);
      const bv = Math.round(110 + (180 - 110) * b);

      ctx.beginPath();

      if (b > 0.1) {
        // Punto activo: dibujo un pequeño glow radial
        const grad = ctx.createRadialGradient(
          dot.x, dot.y, 0,
          dot.x, dot.y, dot.baseR * (3 + b * 4)
        );
        grad.addColorStop(0, `rgba(${r},${g},${bv},${activeOpacity})`);
        grad.addColorStop(1, `rgba(${r},${g},${bv},0)`);

        ctx.arc(dot.x, dot.y, dot.baseR * (3 + b * 4), 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Punto central sólido — siempre presente aunque sea muy tenue
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.baseR + b * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLOR_DIM}, ${baseOpacity + b * 0.45})`;
      ctx.fill();
    });
  };

  /** Loop de animación principal */
  const loop = () => {
    update();
    draw();
    rafId = requestAnimationFrame(loop);
  };

  /** Actualizo el scrollProgress cuando el usuario hace scroll */
  const onScroll = () => {
    const heroEl = sel('.edu-hero');
    if (!heroEl) return;
    const heroH = heroEl.offsetHeight;
    scrollProgress = Math.min(1, window.scrollY / heroH);
  };

  const init = () => {
    if (prefersReducedMotion()) return;

    resize();
    loop();

    // Escucho scroll con passive: true para no bloquear el hilo principal
    window.addEventListener('scroll', onScroll, { passive: true });

    window.addEventListener('resize', () => {
      resize();
    }, { passive: true });

    // Pauso la animación cuando la pestaña no está visible
    // Ahorra batería en móvil y recursos en desktop
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
  Los destellos de luz verde se mueven suavemente al hacer
  scroll para dar profundidad al hero. Solo en desktop —
  en móvil el parallax consume recursos sin aportar mucho
  porque el hero suele verse completo sin hacer scroll.
  ============================================================ */
const HeroParallax = (() => {

  let ticking = false;

  const onScroll = () => {
    if (ticking) return;

    requestAnimationFrame(() => {
      const heroEl = sel('.edu-hero');
      if (!heroEl) { ticking = false; return; }

      const scrollY = window.scrollY;
      const heroH   = heroEl.offsetHeight;
      if (scrollY > heroH) { ticking = false; return; }

      const progress = scrollY / heroH;

      // Muevo cada luz en una dirección diferente para mayor profundidad
      const light1  = sel('.edu-hero__light--1');
      const light2  = sel('.edu-hero__light--2');
      const light3  = sel('.edu-hero__light--3');
      const symbol  = sel('.edu-hero__symbol-wrap');

      if (light1) light1.style.transform = `translateX(-50%) translateY(${progress * 75}px)`;
      if (light2) light2.style.transform = `translateY(${progress * -45}px)`;
      if (light3) light3.style.transform = `translateY(${progress * 35}px)`;
      if (symbol) symbol.style.transform = `translate(-50%, calc(-50% + ${progress * 55}px))`;

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
  04. ANIMACIÓN DE ÁREAS DE ESTUDIO
  Las tarjetas de áreas entran con escala + fade escalonado
  cuando entran en el viewport. Uso IntersectionObserver
  para que funcione tanto en desktop como en móvil sin
  necesidad de calcular posiciones manualmente.
  ============================================================ */
const AreasAnimation = (() => {

  const init = () => {
    const cards = selAll('.edu-area-card');
    if (!cards.length) return;
    if (prefersReducedMotion()) return;

    // Establezco el estado inicial invisible antes de que el observer actúe
    cards.forEach((card, index) => {
      card.style.opacity   = '0';
      card.style.transform = 'scale(0.94) translateY(22px)';
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
          // Una vez revelada la tarjeta dejo de observarla — mejor rendimiento
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
  05. ANIMACIÓN DE PROYECTOS
  La tarjeta de "Proyectos Educativos" (Calculadora de Notas
  y futuras herramientas) entra con el mismo efecto de
  escala + fade que las tarjetas de Áreas, para que la
  transición visual entre ambas secciones se sienta
  continua y no como un bloque pegado aparte.
  ============================================================ */
const ProjectsAnimation = (() => {

  const init = () => {
    const cards = selAll('.edu-project-card');
    if (!cards.length) return;
    if (prefersReducedMotion()) return;

    cards.forEach((card, index) => {
      card.style.opacity   = '0';
      card.style.transform = 'scale(0.96) translateY(20px)';
      card.style.transition = `
        opacity   0.5s ease ${index * 100}ms,
        transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 100}ms
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
  06. CITAS — EFECTO DE BRILLO VERDE AL HOVER/TOUCH
  Cuando el usuario hace hover sobre una tarjeta de cita,
  agrego un glow verde sutil mediante boxShadow inline.
  En móvil, el touchstart activa el efecto brevemente.
  El glow lo gestiono desde JS y no desde CSS para que sea
  consistente con el color de sección (var no disponible
  en box-shadow inline directamente).
  ============================================================ */
const QuoteGlow = (() => {

  const GLOW_ACTIVE = '0 8px 32px rgba(0,0,0,0.35), 0 0 22px rgba(26,140,110,0.18)';
  const GLOW_OFF    = '';

  const init = () => {
    const cards = selAll('.edu-quote-card');
    if (!cards.length) return;

    cards.forEach((card) => {
      // Hover en desktop
      card.addEventListener('mouseenter', () => {
        card.style.boxShadow = GLOW_ACTIVE;
      });
      card.addEventListener('mouseleave', () => {
        card.style.boxShadow = GLOW_OFF;
      });

      // Touch en móvil — brillo breve al tocar
      card.addEventListener('touchstart', () => {
        card.style.boxShadow = GLOW_ACTIVE;
        setTimeout(() => { card.style.boxShadow = GLOW_OFF; }, 650);
      }, { passive: true });
    });
  };

  return { init };

})();


/* ============================================================
  07. REFLEXIONES — REVEAL SUAVE AL SCROLL
  Cada tarjeta de reflexión entra con fade + slide vertical
  al aparecer en el viewport. El delay escalonado hace que
  las tres tarjetas entren de izquierda a derecha en desktop,
  y una por una en móvil (al estar apiladas verticalmente).
  ============================================================ */
const ReflectionsReveal = (() => {

  const init = () => {
    const cards = selAll('.edu-reflection-card');
    if (!cards.length) return;
    if (prefersReducedMotion()) return;

    cards.forEach((card, index) => {
      card.style.opacity   = '0';
      card.style.transform = 'translateY(26px)';
      card.style.transition = `
        opacity   0.55s ease ${index * 130}ms,
        transform 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${index * 130}ms
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
      threshold: 0.10,
      rootMargin: '0px 0px -20px 0px',
    });

    cards.forEach((card) => observer.observe(card));
  };

  return { init };

})();


/* ============================================================
  08. RECURSOS — ENTRADA LATERAL DESDE LA IZQUIERDA
  Las tarjetas de recursos desliz desde la izquierda con
  un delay escalonado. Esto refuerza la dirección de lectura
  (izquierda → derecha) y da sensación de "llegando" al
  viewport mientras el usuario baja.
  ============================================================ */
const ResourcesReveal = (() => {

  const init = () => {
    const cards = selAll('.edu-resource-card');
    if (!cards.length) return;
    if (prefersReducedMotion()) return;

    cards.forEach((card, index) => {
      card.style.opacity   = '0';
      card.style.transform = 'translateX(-22px)';
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
    }, { threshold: 0.15 });

    cards.forEach((card) => observer.observe(card));
  };

  return { init };

})();


/* ============================================================
  09. SCROLL SUAVE PARA BOTONES DE ESTA PÁGINA
  Los botones del hero apuntan a secciones internas con
  prefijo #edu-. Capturo esos clicks y aplico scroll suave
  con el offset correcto del navbar para que el título de
  la sección quede bien visible y no quedé oculto detrás
  de la barra de navegación fija.
  ============================================================ */
const InPageScroll = (() => {

  const init = () => {
    // Solo los links que apunten a un ID que empiece con #edu-
    const links = selAll('a[href^="#edu-"]');

    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        const target   = sel(targetId);
        if (!target) return;

        e.preventDefault();

        // Calculo el offset del navbar para que el título quede visible
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
  INICIALIZACIÓN DE EDUCACION.JS
  Lanzo todos los módulos en orden de prioridad visual:
  primero el canvas (necesita tiempo para el primer frame),
  luego el parallax, luego las animaciones de contenido.
  ============================================================ */
onReady(() => {

  // Canvas de grid de puntos — lo primero para que ya esté listo al cargar
  GridCanvas.init();

  // Parallax del hero (solo desktop)
  HeroParallax.init();

  // Animaciones de tarjetas de contenido
  AreasAnimation.init();
  ProjectsAnimation.init();
  QuoteGlow.init();
  ReflectionsReveal.init();
  ResourcesReveal.init();

  // Scroll suave en página
  InPageScroll.init();

  // Log en consola — mismo formato que Fe para consistencia
  console.log(
    '%c 📖 Educación — educacion.js cargado ',
    'background: #1A8C6E; color: #ECFDF5; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 4px;'
  );

});