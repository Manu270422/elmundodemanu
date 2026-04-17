/**
 * ============================================================
 * sobremi.js — El Mundo de Manu / Sobre Mí
 * ============================================================
 * Este es el script específico para mi página "Sobre Mí".
 * El script global (script.js) ya se cargó antes que este
 * y se encargó del navbar, cursor y animaciones de scroll.
 *
 * Aquí controlo lo que es único de esta sección:
 * - Texto rotatorio de roles en el hero
 * - Animación de las barras de habilidades técnicas
 * - Efecto de aparición progresiva en la línea de tiempo
 * - Contador de tiempo en los mini-cards del hero
 *
 * Estructura de este archivo:
 * 01. Utilidades locales
 * 02. Módulo: Texto Rotatorio de Roles
 * 03. Módulo: Barras de Habilidades
 * 04. Módulo: Animación de la línea de tiempo
 * 05. Módulo: Efecto parallax sutil en el hero
 * 06. Inicialización
 *
 * Autor: Carlos Manuel Turizo Hernández
 * Versión: 1.0.0
 * ============================================================
 */

'use strict';

/* ============================================================
  01. UTILIDADES LOCALES
  Helpers rápidos que uso en este archivo.
  ============================================================ */

/**
 * Selecciono un elemento del DOM con seguridad.
 * @param {string} selector
 * @param {Element} [context=document]
 * @returns {Element|null}
 */
const select  = (sel, ctx = document) => ctx.querySelector(sel);
const selectAll = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Ejecuto una función cuando el DOM está listo,
 * pero también cuando esta página se carga directamente
 * (el loader de script.js ya resolvió todo).
 */
const whenReady = (fn) => {
  // Si el loader ya terminó (evento personalizado del script global)
  // o si el DOM ya está disponible, ejecuto de inmediato.
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
};


/* ============================================================
  02. MÓDULO: TEXTO ROTATORIO DE ROLES
  El texto que dice "Soy ___" cambia cada cierto tiempo
  mostrando mis diferentes facetas con una animación suave.
  ============================================================ */
const RolesRotator = (() => {

  // Los roles que quiero que roten — representan mis facetas reales
  const ROLES = [
    'estudiante de Ingeniería',
    'emprendedor en formación',
    'apasionado del gaming',
    'constructor de ideas',
    'seguidor de Cristo',
    'desarrollador web',
    'soñador con plan',
  ];

  const INTERVAL_MS  = 2800;  // Tiempo entre cada cambio
  const FADE_MS      = 300;   // Duración del fade out/in

  let currentIndex = 0;
  let intervalId   = null;

  /**
   * Cambio el texto con una animación de fade out → fade in.
   * @param {HTMLElement} el - El elemento del span de roles.
   */
  const changeRole = (el) => {
    // Fase 1: fade out
    el.style.opacity  = '0';
    el.style.transform = 'translateY(-6px)';

    setTimeout(() => {
      // Actualizo el índice de manera circular
      currentIndex = (currentIndex + 1) % ROLES.length;
      el.textContent = ROLES[currentIndex];

      // Fase 2: fade in desde abajo
      el.style.transform = 'translateY(6px)';

      requestAnimationFrame(() => {
        el.style.transition = `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`;
        el.style.opacity   = '1';
        el.style.transform  = 'translateY(0)';
      });
    }, FADE_MS);
  };

  const init = () => {
    const el = select('#rolesText');
    if (!el) return;

    // Configuro las transiciones CSS en el elemento
    el.style.transition    = `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`;
    el.style.display       = 'inline-block';
    el.style.willChange    = 'opacity, transform';

    // Inicio el texto con el primer rol
    el.textContent = ROLES[0];

    // Arranco la rotación automática
    intervalId = setInterval(() => changeRole(el), INTERVAL_MS);

    // Pauso cuando la página no está visible (ahorro CPU)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(intervalId);
      } else {
        intervalId = setInterval(() => changeRole(el), INTERVAL_MS);
      }
    });
  };

  return { init };

})();


/* ============================================================
  03. MÓDULO: BARRAS DE HABILIDADES
  Animo las barras de progreso de habilidades técnicas
  cuando el usuario las ve en pantalla (IntersectionObserver).
  Antes de que sean visibles muestro ancho 0, al entrar
  las animo al porcentaje real.
  ============================================================ */
const SkillBars = (() => {

  /**
   * Activo la animación de una barra específica.
   * @param {HTMLElement} bar - El div .sm-skill-bar__fill
   */
  const animateBar = (bar) => {
    const targetWidth = bar.getAttribute('data-width');
    if (!targetWidth) return;

    // Un pequeño delay para que la entrada sea más dramática
    setTimeout(() => {
      bar.style.width = `${targetWidth}%`;
    }, 150);
  };

  const init = () => {
    const bars = selectAll('.sm-skill-bar__fill');
    if (!bars.length) return;

    // Uso IntersectionObserver para disparar la animación
    // solo cuando las barras son visibles en pantalla
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateBar(entry.target);
          // Una vez animada, dejo de observarla
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.3,        // 30% visible para activar
      rootMargin: '0px 0px -30px 0px',
    });

    bars.forEach((bar) => observer.observe(bar));
  };

  return { init };

})();


/* ============================================================
  04. MÓDULO: ANIMACIÓN DE LA LÍNEA DE TIEMPO
  Cada item del timeline se revela con un efecto de entrada
  escalonado cuando el usuario llega a esa sección.
  Complementa las animaciones globales de scroll del script.js.
  ============================================================ */
const TimelineAnimation = (() => {

  const init = () => {
    const items = selectAll('.sm-timeline__item');
    if (!items.length) return;

    // Los items izquierdos entran desde la izquierda,
    // los derechos desde la derecha
    items.forEach((item, index) => {
      const isLeft = item.classList.contains('sm-timeline__item--left');

      // Aplico estilos iniciales (invisibles, desplazados)
      item.style.opacity      = '0';
      item.style.transform    = `translateX(${isLeft ? '-30px' : '30px'})`;
      item.style.transition   = `opacity 0.6s ease ${index * 100}ms,
                                 transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 100}ms`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateX(0)';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -40px 0px',
    });

    items.forEach((item) => observer.observe(item));
  };

  return { init };

})();


/* ============================================================
  05. MÓDULO: PARALLAX SUTIL EN EL HERO
  Los elementos decorativos del fondo (glows, dots) se mueven
  levemente al hacer scroll para dar sensación de profundidad.
  Solo lo activo en desktop donde el efecto se nota bien.
  ============================================================ */
const HeroParallax = (() => {

  let ticking = false;

  const onScroll = () => {
    if (ticking) return;

    requestAnimationFrame(() => {
      const scrollY   = window.scrollY;
      const heroEl    = select('.sm-hero');
      if (!heroEl) { ticking = false; return; }

      const heroH     = heroEl.offsetHeight;
      // Solo aplico parallax mientras el hero está visible
      if (scrollY > heroH) { ticking = false; return; }

      const progress  = scrollY / heroH; // 0 → 1 mientras scroll en hero

      // Muevo los glows con diferentes velocidades
      const glow1 = select('.sm-hero__glow--1');
      const glow2 = select('.sm-hero__glow--2');
      const dots  = select('.sm-hero__dots');

      if (glow1) glow1.style.transform = `translateY(${progress * 60}px)`;
      if (glow2) glow2.style.transform = `translateY(${progress * -40}px)`;
      if (dots)  dots.style.transform  = `translateY(${progress * 25}px)`;

      ticking = false;
    });

    ticking = true;
  };

  const init = () => {
    // Solo en desktop (evito el efecto en mobile para no afectar rendimiento)
    if (!window.matchMedia('(min-width: 900px)').matches) return;

    window.addEventListener('scroll', onScroll, { passive: true });
  };

  return { init };

})();


/* ============================================================
  06. MÓDULO: HOVER EN LAS MINI-CARDS DEL HERO
  Agrego un efecto de tilting sutil en las mini tarjetas
  de contexto (ubicación, carrera, modo) del hero.
  ============================================================ */
const MiniCardHover = (() => {

  const applyTilt = (card, e) => {
    const rect     = card.getBoundingClientRect();
    const x        = e.clientX - rect.left - rect.width / 2;
    const y        = e.clientY - rect.top  - rect.height / 2;
    const rotX     = (y / rect.height) * -8;
    const rotY     = (x / rect.width)  *  8;

    card.style.transform = `
      translateX(4px)
      perspective(400px)
      rotateX(${rotX}deg)
      rotateY(${rotY}deg)
    `;
  };

  const resetTilt = (card) => {
    card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    card.style.transform  = '';
  };

  const init = () => {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const cards = selectAll('.sm-hero__mini-card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        card.style.transition = 'transform 0.1s ease';
        applyTilt(card, e);
      }, { passive: true });
      card.addEventListener('mouseleave', () => resetTilt(card));
    });
  };

  return { init };

})();


/* ============================================================
  07. MÓDULO: CHIPS DE HABILIDADES BLANDAS — ENTRADA ESCALONADA
  Los chips de habilidades blandas entran uno a uno
  con un pequeño delay entre cada uno, creando un efecto
  de cascada que se ve muy limpio.
  ============================================================ */
const ChipsAnimation = (() => {

  const init = () => {
    const chips = selectAll('.sm-skills__chip');
    if (!chips.length) return;

    // Aplico estado inicial invisible con diferentes delays
    chips.forEach((chip, index) => {
      chip.style.opacity   = '0';
      chip.style.transform = 'scale(0.85) translateY(8px)';
      chip.style.transition = `opacity 0.35s ease ${index * 40}ms,
                               transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 40}ms`;
    });

    // Observo el contenedor de chips — cuando sea visible, activo todos
    const container = select('.sm-skills__chips');
    if (!container) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          chips.forEach((chip) => {
            chip.style.opacity   = '1';
            chip.style.transform = 'scale(1) translateY(0)';
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(container);
  };

  return { init };

})();


/* ============================================================
  INICIALIZACIÓN DE SOBREMI.JS
  Lanzo todos los módulos de esta página específica.
  El script.js global ya inició el cursor, navbar, etc.
  ============================================================ */
whenReady(() => {

  // Inicio inmediato — no depende del loader porque
  // el loader ya corrió en script.js antes que este archivo
  RolesRotator.init();
  HeroParallax.init();
  MiniCardHover.init();

  // Los módulos que dependen de IntersectionObserver
  // los inicio directamente
  SkillBars.init();
  TimelineAnimation.init();
  ChipsAnimation.init();

  // Log de identificación de la sección en consola
  console.log(
    '%c 👋 Sobre Mí — sobremi.js cargado ',
    'background: #F5A623; color: #0A0A0F; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 4px;'
  );

});