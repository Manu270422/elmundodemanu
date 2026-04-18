/**
 * ============================================================
 * script.js — El Mundo de Manu
 * ============================================================
 * Este es mi cerebro en JavaScript. Aquí controlo toda la
 * lógica interactiva del sitio: el loader de entrada,
 * las animaciones, el canvas de partículas del hero,
 * el navbar, el formulario de contacto y mucho más.
 *
 * Organizo mi código en módulos funcionales (IIFE + objetos)
 * para mantenerlo limpio y escalable. Cuando el sitio crezca,
 * moveré cada módulo a su propio archivo.
 *
 * Estructura de este archivo:
 * 01. Config global y utilidades
 * 02. Módulo Loader
 * 03. Módulo Cursor personalizado
 * 04. Módulo Navbar (scroll + toggle mobile)
 * 05. Módulo Canvas (partículas del hero)
 * 06. Módulo Animaciones de scroll (IntersectionObserver)
 * 07. Módulo Contador animado (stats del hero)
 * 08. Módulo Formulario de contacto
 * 09. Módulo Footer (año actual)
 * 10. Inicialización
 *
 * Autor: Carlos Manuel Turizo Hernández
 * Versión: 1.0.0
 * ============================================================
 */

'use strict';

/* ============================================================
  01. CONFIG GLOBAL Y UTILIDADES
  Defino helpers que uso en varios módulos para no repetirme.
  ============================================================ */

/** Referencia rápida al document para no escribirlo todo el tiempo */
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

/**
 * Espero a que el DOM esté listo antes de ejecutar cualquier cosa.
 * @param {Function} fn - Función a ejecutar cuando el DOM esté listo.
 */
const onReady = (fn) => {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
};

/**
 * Clamp — limita un valor entre un mínimo y un máximo.
 * Lo uso para calcular rangos de animación.
 */
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/**
 * Interpolación lineal entre dos valores.
 * La uso para suavizar el movimiento del cursor.
 */
const lerp = (start, end, t) => start + (end - start) * t;


/* ============================================================
  02. MÓDULO LOADER
  Controlo la pantalla de carga inicial.
  Simulo una barra de progreso y luego la oculto.
  ============================================================ */
const Loader = (() => {

  const LOAD_DURATION = 1800; // ms — duración total del loader
  const HIDE_DELAY    = 300;  // ms — pausa antes de ocultarlo

  let progress  = 0;
  let startTime = null;
  let rafId     = null;

  /**
   * Animo la barra de progreso usando requestAnimationFrame
   * para que sea suave y no bloquee el hilo principal.
   */
  const animateProgress = (timestamp) => {
    if (!startTime) startTime = timestamp;

    const elapsed  = timestamp - startTime;
    const fraction = clamp(elapsed / LOAD_DURATION, 0, 1);

    // Uso una curva de ease-out para que la barra desacelere al final
    progress = fraction < 1 ? fraction * 100 : 100;

    const progressEl = $('#loaderProgress');
    if (progressEl) progressEl.style.width = `${progress}%`;

    if (fraction < 1) {
      rafId = requestAnimationFrame(animateProgress);
    } else {
      // Progreso completo — espero un momento y oculto el loader
      setTimeout(hide, HIDE_DELAY);
    }
  };

  /** Oculto el loader y permito que el body sea scrolleable */
  const hide = () => {
    const loader = $('#loader');
    if (!loader) return;

    loader.classList.add('is-hidden');

    /*
      BUG FIX #1 — Scroll bloqueado en móvil:
      El problema era que liberaba el overflow SOLO dentro del callback
      de 'transitionend'. En algunos móviles (especialmente Android e iOS)
      este evento nunca se dispara si el sistema reduce las animaciones,
      si el tab estaba en background, o si la transición fue interrumpida.
      Resultado: el body quedaba con overflow:hidden para siempre y el
      usuario no podía hacer scroll ni con el dedo ni con la barra.

      La solución tiene DOS partes:
      1. Libero el overflow ANTES de la transición, no después.
         El loader desaparece visualmente con CSS (opacity:0), pero el
         scroll ya está libre desde el primer milisegundo del hide().
      2. Agrego un setTimeout de seguridad (700ms) que elimina el loader
         del DOM incluso si transitionend nunca llega. Así nunca queda
         un elemento invisible bloqueando interacciones.
    */

    // PRIMERO libero el scroll — esto es inmediato, no espero ningún evento
    document.body.style.overflow = '';

    // Timeout de seguridad: si transitionend no llega en 700ms, limpio igual
    const safetyTimer = setTimeout(() => {
      if (loader.parentNode) loader.remove();
      document.dispatchEvent(new CustomEvent('siteReady'));
    }, 700);

    // Si transitionend sí llega, cancelo el timer y limpio el loader normalmente
    loader.addEventListener('transitionend', () => {
      clearTimeout(safetyTimer);
      if (loader.parentNode) loader.remove();
      document.dispatchEvent(new CustomEvent('siteReady'));
    }, { once: true });
  };

  const init = () => {
    /*
      BUG FIX #1 (preventivo):
      Solo bloqueo el scroll si el loader realmente existe en el DOM.
      Si alguien recarga muy rápido o el loader ya fue removido,
      no bloqueo nada. Así nunca quedo con overflow:hidden sin querer.
    */
    if (!$('#loader')) return;

    document.body.style.overflow = 'hidden';
    requestAnimationFrame(animateProgress);
  };

  return { init };

})();


/* ============================================================
  03. MÓDULO CURSOR PERSONALIZADO
  Creo un cursor animado que reemplaza el nativo.
  Solo funciona en dispositivos con mouse (pointer: fine).
  ============================================================ */
const Cursor = (() => {

  let mouseX = 0, mouseY = 0;         // Posición real del mouse
  let trailX = 0, trailY = 0;         // Posición interpolada del trail
  let isVisible = false;
  let rafId = null;

  const cursorEl  = $('#cursor');
  const trailEl   = $('#cursorTrail');

  /** Detecta si el mouse está sobre un elemento interactivo */
  const isInteractive = (el) => {
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return (
      tag === 'a' ||
      tag === 'button' ||
      tag === 'input' ||
      tag === 'textarea' ||
      el.getAttribute('role') === 'button' ||
      el.classList.contains('world-card') ||
      el.classList.contains('project-card')
    );
  };

  /** Muevo el cursor principal directamente (sin interpolación, debe ser instantáneo) */
  const moveCursor = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (cursorEl) {
      cursorEl.style.left = `${mouseX}px`;
      cursorEl.style.top  = `${mouseY}px`;
    }

    // El hover effect lo manejo en el elemento que esté debajo
    const target = document.elementFromPoint(mouseX, mouseY);
    if (isInteractive(target) || target?.closest('a, button')) {
      document.body.classList.add('cursor-hover');
    } else {
      document.body.classList.remove('cursor-hover');
    }

    if (!isVisible) {
      isVisible = true;
      if (cursorEl)  cursorEl.style.opacity  = '1';
      if (trailEl) trailEl.style.opacity = '1';
    }
  };

  /**
   * Animo el trail con lerp para que siga al cursor con suavidad.
   * Llamo esto en un loop de rAF.
   */
  const animateTrail = () => {
    trailX = lerp(trailX, mouseX, 0.12);
    trailY = lerp(trailY, mouseY, 0.12);

    if (trailEl) {
      trailEl.style.left = `${trailX}px`;
      trailEl.style.top  = `${trailY}px`;
    }

    rafId = requestAnimationFrame(animateTrail);
  };

  /** Si el mouse sale de la ventana, oculto el cursor */
  const hideCursor = () => {
    isVisible = false;
    if (cursorEl)  cursorEl.style.opacity  = '0';
    if (trailEl) trailEl.style.opacity = '0';
  };

  const init = () => {
    // Solo inicializo en dispositivos con mouse real
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (!cursorEl || !trailEl) return;

    // Inicio invisible
    cursorEl.style.opacity  = '0';
    trailEl.style.opacity = '0';

    document.addEventListener('mousemove', moveCursor, { passive: true });
    document.addEventListener('mouseleave', hideCursor);

    animateTrail();
  };

  return { init };

})();


/* ============================================================
  04. MÓDULO NAVBAR
  Manejo el comportamiento del navbar:
  - Cambio de estilo al hacer scroll
  - Apertura/cierre del menú mobile
  - Cierre del menú al hacer click en un link
  - Indicador de sección activa
  ============================================================ */
const Navbar = (() => {

  const navbar     = $('#navbar');
  const toggle     = $('#navToggle');
  const mobileMenu = $('#mobileMenu');
  const navLinks   = $$('.navbar__link');
  const mobileLinks = $$('.navbar__mobile-link');

  let isMenuOpen = false;
  let lastScrollY = 0;

  /** Actualizo el estado visual del navbar según el scroll */
  const onScroll = () => {
    const scrollY = window.scrollY;

    // Agrego/quito la clase de scroll
    if (scrollY > 20) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }

    lastScrollY = scrollY;

    // Actualizo el link activo según la sección visible
    updateActiveLink();
  };

  /**
   * Determino qué sección está visible en pantalla
   * y marco el link correspondiente como activo.
   */
  const updateActiveLink = () => {
    const sections = $$('section[id]');
    let currentSection = '';

    sections.forEach((section) => {
      const sectionTop    = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;

      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('navbar__link--active');
      const href = link.getAttribute('href');
      if (href === `#${currentSection}`) {
        link.classList.add('navbar__link--active');
      }
    });
  };

  /** Abro/cierro el menú mobile con accesibilidad */
  const toggleMenu = () => {
    isMenuOpen = !isMenuOpen;

    toggle.classList.toggle('is-open', isMenuOpen);
    mobileMenu.classList.toggle('is-open', isMenuOpen);

    // Accesibilidad — actualizo atributos ARIA
    toggle.setAttribute('aria-expanded', String(isMenuOpen));
    toggle.setAttribute('aria-label', isMenuOpen ? 'Cerrar menú' : 'Abrir menú');
    mobileMenu.setAttribute('aria-hidden', String(!isMenuOpen));

    /*
      IMPORTANTE: NO bloqueo el scroll del body aquí.
      En móvil, bloquear overflow causa que los clics táctiles
      fallen y que el usuario pierda referencia de dónde está.
      El menú es un overlay relativo al navbar, no necesita bloquear scroll.
    */
  };

  /** Cierro el menú al hacer click en cualquier link mobile */
  const closeMenuOnLink = () => {
    if (isMenuOpen) toggleMenu();
  };

  /** Cierro el menú si el usuario hace click fuera de él */
  const closeMenuOnOutside = (e) => {
    if (isMenuOpen && !navbar.contains(e.target)) {
      toggleMenu();
    }
  };

  /** Smooth scroll a las anclas del navbar — solo actúa en anclas de esta misma página */
  const handleNavClick = (e) => {
    const href = e.currentTarget.getAttribute('href');
    if (!href || !href.startsWith('#')) return; // Si el link va a otra página, lo dejo pasar normal

    // Verifico que el elemento destino existe en esta página
    const target = $(href);
    if (!target) return; // Si no existe (link a otro archivo), no hago nada

    e.preventDefault();

    const offset    = navbar.offsetHeight + 16;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  };

  const init = () => {
    if (!navbar) return;

    window.addEventListener('scroll', onScroll, { passive: true });
    toggle?.addEventListener('click', toggleMenu);
    document.addEventListener('click', closeMenuOnOutside);

    // Click en links del desktop
    navLinks.forEach((link) => {
      link.addEventListener('click', handleNavClick);
    });

    // Click en links del mobile
    mobileLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        handleNavClick(e);
        closeMenuOnLink();
      });
    });

    // Presionar Escape cierra el menú
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMenuOpen) toggleMenu();
    });

    // Llamo una vez para el estado inicial
    onScroll();
  };

  return { init };

})();


/* ============================================================
  05. MÓDULO CANVAS — PARTÍCULAS DEL HERO
  Creo un campo de partículas animadas que dan la sensación
  de un cosmos o universo digital en el fondo del hero.
  ============================================================ */
const ParticleCanvas = (() => {

  const canvas  = $('#heroCanvas');
  if (!canvas) return { init: () => {} };

  const ctx     = canvas.getContext('2d');
  let particles = [];
  let width, height;
  let rafId;
  let mouse = { x: null, y: null };

  // Configuración de las partículas
  const CONFIG = {
    count:      80,       // Número de partículas
    minRadius:  0.8,      // Tamaño mínimo
    maxRadius:  2.5,      // Tamaño máximo
    speed:      0.3,      // Velocidad base
    color:      '108, 99, 255',   // Color primario (RGB)
    colorAlt:   '245, 166, 35',   // Color acento (RGB)
    connectDist: 120,     // Distancia para conectar partículas con líneas
    mouseRepel: 100,      // Radio de repulsión del mouse
  };

  /**
   * Ajusto el tamaño del canvas para que coincida con
   * el contenedor al cargar y al redimensionar.
   */
  const resize = () => {
    width  = canvas.width  = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  };

  /** Creo una partícula con propiedades aleatorias */
  const createParticle = () => ({
    x:       Math.random() * width,
    y:       Math.random() * height,
    vx:      (Math.random() - 0.5) * CONFIG.speed,
    vy:      (Math.random() - 0.5) * CONFIG.speed,
    radius:  CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius),
    opacity: 0.2 + Math.random() * 0.6,
    // Aleatoriamente uso el color primario o el acento
    color:   Math.random() > 0.85 ? CONFIG.colorAlt : CONFIG.color,
  });

  /** Inicializo el array de partículas */
  const initParticles = () => {
    particles = Array.from({ length: CONFIG.count }, createParticle);
  };

  /**
   * Actualizo la posición de cada partícula.
   * Reboto en los bordes y aplico repulsión del mouse.
   */
  const updateParticles = () => {
    particles.forEach((p) => {
      // Repulsión del mouse
      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < CONFIG.mouseRepel) {
          const force  = (CONFIG.mouseRepel - dist) / CONFIG.mouseRepel;
          const angle  = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * 0.5;
          p.vy += Math.sin(angle) * force * 0.5;
        }
      }

      // Limito la velocidad máxima para que no se disparen
      const maxSpeed = CONFIG.speed * 4;
      const speed = Math.hypot(p.vx, p.vy);
      if (speed > maxSpeed) {
        p.vx = (p.vx / speed) * maxSpeed;
        p.vy = (p.vy / speed) * maxSpeed;
      }

      // Aplico velocidad y añado fricción leve
      p.x  += p.vx;
      p.y  += p.vy;
      p.vx *= 0.99;
      p.vy *= 0.99;

      // Rebote en los bordes
      if (p.x < 0 || p.x > width)  { p.vx *= -1; p.x = clamp(p.x, 0, width); }
      if (p.y < 0 || p.y > height) { p.vy *= -1; p.y = clamp(p.y, 0, height); }
    });
  };

  /**
   * Dibujo todas las partículas y las conexiones entre ellas
   * cuando están lo suficientemente cerca.
   */
  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    // Dibujo conexiones entre partículas cercanas
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

        if (dist < CONFIG.connectDist) {
          const alpha = (1 - dist / CONFIG.connectDist) * 0.15;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${p1.color}, ${alpha})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }

    // Dibujo cada partícula
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
      ctx.fill();
    });
  };

  /** Loop principal de animación */
  const loop = () => {
    updateParticles();
    draw();
    rafId = requestAnimationFrame(loop);
  };

  /** Actualizo la posición del mouse para la repulsión */
  const onMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  };

  const onMouseLeave = () => {
    mouse.x = null;
    mouse.y = null;
  };

  const init = () => {
    resize();
    initParticles();
    loop();

    window.addEventListener('resize', () => {
      resize();
      initParticles(); // Regenero partículas para el nuevo tamaño
    }, { passive: true });

    canvas.addEventListener('mousemove', onMouseMove, { passive: true });
    canvas.parentElement.addEventListener('mouseleave', onMouseLeave);
  };

  return { init };

})();


/* ============================================================
  06. MÓDULO ANIMACIONES DE SCROLL
  Uso IntersectionObserver para animar elementos cuando
  entran en el viewport. Busco todos los elementos con
  el atributo [data-animate] y les agrego .is-visible.
  ============================================================ */
const ScrollAnimations = (() => {

  const THRESHOLD = 0.15; // Qué porcentaje del elemento debe estar visible

  const init = () => {
    const elements = $$('[data-animate]');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Dejo de observar una vez que está visible para ahorrar recursos
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: THRESHOLD,
      rootMargin: '0px 0px -40px 0px', // Un poco antes de que entre
    });

    elements.forEach((el) => observer.observe(el));
  };

  return { init };

})();


/* ============================================================
  07. MÓDULO CONTADOR ANIMADO
  Animo los números en el hero (stats: mundos, pasión, visión).
  Uso un ease-out suave para que parezca real.
  ============================================================ */
const CountUp = (() => {

  const DURATION = 1500; // ms

  /**
   * Animo un número desde 0 hasta el valor objetivo.
   * @param {HTMLElement} el - Elemento con el número a animar.
   * @param {number} target  - Valor final.
   */
  const animateCount = (el, target) => {
    const start = performance.now();

    const step = (timestamp) => {
      const elapsed  = timestamp - start;
      const fraction = clamp(elapsed / DURATION, 0, 1);
      // Ease-out cubic
      const ease    = 1 - Math.pow(1 - fraction, 3);
      const current = Math.round(ease * target);

      el.textContent = current;

      if (fraction < 1) requestAnimationFrame(step);
      else el.textContent = target; // Me aseguro de terminar exacto
    };

    requestAnimationFrame(step);
  };

  const init = () => {
    const counters = $$('[data-count]');
    if (!counters.length) return;

    // Espero a que el sitio esté listo (loader terminado) para iniciar
    document.addEventListener('siteReady', () => {
      // Pequeño delay para que la animación sea visible
      setTimeout(() => {
        counters.forEach((el) => {
          const target = parseInt(el.getAttribute('data-count'), 10);
          if (!isNaN(target)) animateCount(el, target);
        });
      }, 600);
    }, { once: true });
  };

  return { init };

})();


/* ============================================================
  08. MÓDULO FORMULARIO DE CONTACTO
  Manejo la validación y el envío del formulario.
  Por ahora simulo el envío (cuando tenga backend lo conecto).
  ============================================================ */
const ContactForm = (() => {

  const form        = $('#contactForm');
  const submitBtn   = $('#contactSubmit');
  const successMsg  = $('#contactSuccess');

  /**
   * Valido un campo y muestro/oculto el mensaje de error.
   * @param {HTMLElement} field - Input o textarea a validar.
   * @returns {boolean} - Si el campo es válido.
   */
  const validateField = (field) => {
    const errorEl = field.closest('.form-group')?.querySelector('.form-error');
    let message = '';

    if (field.required && !field.value.trim()) {
      message = 'Este campo es obligatorio.';
    } else if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value.trim())) {
        message = 'Ingresa un email válido.';
      }
    } else if (field.tagName === 'TEXTAREA' && field.value.trim().length < 10) {
      message = 'El mensaje debe tener al menos 10 caracteres.';
    }

    if (errorEl) errorEl.textContent = message;
    field.classList.toggle('is-error', !!message);

    return !message;
  };

  /**
   * Valido todos los campos del formulario.
   * @returns {boolean} - Si el formulario completo es válido.
   */
  const validateForm = () => {
    const fields = $$('input, textarea', form);
    return fields.every((field) => validateField(field));
  };

  /**
   * Simulo el envío del formulario.
   * Aquí conectaré mi backend o EmailJS cuando esté listo.
   */
  const simulateSend = () => {
    return new Promise((resolve) => {
      setTimeout(resolve, 1500); // Simulo 1.5s de tiempo de servidor
    });
  };

  /** Manejo el submit del formulario */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Cambio el botón a estado loading
    submitBtn.classList.add('is-loading');

    try {
      await simulateSend();

      // Éxito — muestro el mensaje y reseteo el form
      form.reset();
      successMsg.removeAttribute('hidden');

      // Oculto el mensaje de éxito después de 5 segundos
      setTimeout(() => {
        successMsg.setAttribute('hidden', '');
      }, 5000);

    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      // Aquí mostraría un error al usuario en producción
    } finally {
      submitBtn.classList.remove('is-loading');
    }
  };

  const init = () => {
    if (!form) return;

    form.addEventListener('submit', handleSubmit);

    // Valido en tiempo real al perder el foco (blur)
    const fields = $$('input, textarea', form);
    fields.forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
      // Limpio error mientras escribe si ya tenía uno
      field.addEventListener('input', () => {
        if (field.classList.contains('is-error')) validateField(field);
      });
    });
  };

  return { init };

})();


/* ============================================================
  09. MÓDULO FOOTER — AÑO ACTUAL
  Actualizo el año automáticamente en el footer.
  Nunca más tendré que cambiar el año a mano.
  ============================================================ */
const FooterYear = (() => {
  const init = () => {
    const yearEl = $('#footerYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  };
  return { init };
})();


/* ============================================================
  10. MÓDULO SMOOTH SCROLL GLOBAL
  Intercepto todos los clicks en anchors internos (#)
  para un scroll suave que respete el offset del navbar.
  ============================================================ */
const SmoothScroll = (() => {

  const init = () => {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navbar = $('#navbar');
      const offset = (navbar?.offsetHeight || 70) + 16;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  };

  return { init };

})();


/* ============================================================
  11. MÓDULO EFECTOS HOVER EN TARJETAS
  Agrego un efecto de seguimiento del mouse en las tarjetas
  de mundos y proyectos para darles profundidad.
  ============================================================ */
const CardHover = (() => {

  const INTENSITY = 8; // Grados máximos de rotación

  const applyTilt = (card, e) => {
    const rect   = card.getBoundingClientRect();
    const x      = e.clientX - rect.left;
    const y      = e.clientY - rect.top;
    const centerX = rect.width  / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -INTENSITY;
    const rotateY = ((x - centerX) / centerX) *  INTENSITY;

    card.style.transform = `
      translateY(-6px)
      perspective(600px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `;
  };

  const resetTilt = (card) => {
    card.style.transform = '';
    card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
  };

  const init = () => {
    // Solo en dispositivos con mouse fino
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const cards = $$('.world-card, .project-card');

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => applyTilt(card, e), { passive: true });
      card.addEventListener('mouseleave', () => resetTilt(card));
      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.1s ease';
      });
    });
  };

  return { init };

})();

/* ============================================================
  10. INICIALIZACIÓN PRINCIPAL
  Espero a que el DOM esté listo y lanzo todos mis módulos
  en el orden correcto.
  ============================================================ */
onReady(() => {

  // Primero el loader, porque bloquea la UI
  Loader.init();

  // Luego el cursor (no depende del loader)
  Cursor.init();

  // Navbar siempre activo
  Navbar.init();

  // Footer
  FooterYear.init();

  // Contador animado (escucha el evento siteReady del loader)
  CountUp.init();

  // Formulario
  ContactForm.init();

  // Smooth scroll global
  SmoothScroll.init();

const startVisuals = () => {

  // Canvas de partículas
  ParticleCanvas.init();

  // Animaciones de scroll
  ScrollAnimations.init();

  // Efectos hover en tarjetas
  CardHover.init();

  // Log de bienvenida en consola (para quien abra DevTools 👋)
  console.log(
    '%c El Mundo de Manu 🚀 ',
    'background: #6C63FF; color: #fff; font-size: 18px; font-weight: bold; padding: 8px 16px; border-radius: 8px;'
  );
  console.log(
      '%c Bienvenido al código fuente. Este sitio fue construido con pasión desde cero.',
      'color: #9898B8; font-size: 13px; padding: 4px 0;'
    );
};

// Si existe loader → espera el evento siteReady (que ahora se dispara dentro de hide())
// Si NO hay loader → ejecuta directo
if (document.querySelector('#loader')) {
  /*
    BUG FIX #1 (orquestación):
    Escucho el evento 'siteReady' que ahora disparo desde dentro de hide(),
    ya sea por transitionend o por el timeout de seguridad.
    En ambos casos el loader está fuera del DOM y el scroll ya está libre
    ANTES de que startVisuals() inicialice el canvas y las animaciones.
    Esto garantiza que en móvil el scroll funcione desde el primer toque.
  */
  document.addEventListener('siteReady', startVisuals, { once: true });
} else {
  // Si NO hay loader → ejecuta directo
  startVisuals();
}
});