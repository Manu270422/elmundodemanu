/**
 * ============================================================
 * infantil.js — El Mundo de Manu / Infantil
 * ============================================================
 * Este es el script más divertido de todo mi sitio.
 * Aquí controlo todas las interacciones de la sección
 * infantil: los personajes que hablan, los juegos,
 * las canciones, el confetti y los efectos mágicos.
 *
 * Prioridad número uno: que TODO funcione perfectamente
 * en móvil y táctil. Los niños no usan mouse.
 *
 * Módulos:
 * 01. Utilidades locales
 * 02. Estrellas del hero
 * 03. Personajes — mensajes al tocar
 * 04. Juego de colores
 * 05. Contador de animales
 * 06. Adivinanza
 * 07. Canciones — mostrar/ocultar letra
 * 08. Cuentos — expandir historia completa
 * 09. Confetti — ¡celebración!
 * 10. Animaciones de scroll (IntersectionObserver)
 * 11. Scroll suave interno
 * 12. Navbar claro para esta página
 * 13. Inicialización
 *
 * Autor: Carlos Manuel Turizo Hernández
 * Versión: 1.1.0 — Fix: colisión onReady + cursor
 * ============================================================
 */

'use strict';

/* ============================================================
  01. UTILIDADES LOCALES
  ============================================================ */

/*
  Mis atajos de selección del DOM — los uso en todos lados
  para no escribir document.querySelector() completo cada vez.
*/
const sel    = (s, ctx = document) => ctx.querySelector(s);
const selAll = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/*
  BUG FIX #2 — SyntaxError: Identifier 'onReady' already declared:
  El problema era que script.js (que carga ANTES que este archivo)
  ya declara "const onReady = ..." en el scope global del navegador.
  Cuando este archivo intentaba declarar "const onReady" de nuevo,
  JavaScript lanzaba el error exacto del bug:
    Uncaught SyntaxError: Identifier 'onReady' has already been declared

  La solución es renombrar mi utilidad local a "whenReady"
  para que los dos scripts no compitan por el mismo nombre.
  La funcionalidad es idéntica — solo cambio el identificador.
*/
const whenReady = (fn) => {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
};

/**
 * Agrego un listener que funciona tanto para click como para
 * touch — así todo funciona bien en móvil y en desktop.
 * En móvil, touchend da feedback más rápido que click.
 */
const onInteract = (el, fn) => {
  if (!el) return;
  el.addEventListener('click', fn);
  /* Evito el doble disparo click+touch en móvil */
  el.addEventListener('touchend', (e) => {
    e.preventDefault();
    fn(e);
  }, { passive: false });
};


/* ============================================================
  02. ESTRELLAS DEL HERO
  Genero estrellas parpadeantes en el cielo del hero.
  Son pequeños puntos blancos con animación de opacidad.
  ============================================================ */
const HeroStars = (() => {

  const COUNT = 25; /* Número de estrellas */

  const init = () => {
    const container = sel('#infStars');
    if (!container) return;

    /* Creo cada estrella como un elemento span */
    for (let i = 0; i < COUNT; i++) {
      const star = document.createElement('span');
      star.textContent = Math.random() > 0.5 ? '⭐' : '✨';
      star.style.cssText = `
        position: absolute;
        font-size: ${0.6 + Math.random() * 1.2}rem;
        left: ${Math.random() * 90 + 5}%;
        top: ${Math.random() * 60 + 5}%;
        opacity: 0;
        animation: starTwinkle ${2 + Math.random() * 3}s ease-in-out infinite;
        animation-delay: ${Math.random() * 4}s;
        pointer-events: none;
        line-height: 1;
      `;
      container.appendChild(star);
    }

    /* Agrego el keyframe de twinkle dinámicamente */
    if (!document.getElementById('starStyle')) {
      const style = document.createElement('style');
      style.id = 'starStyle';
      style.textContent = `
        @keyframes starTwinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50%       { opacity: 0.9; transform: scale(1.2); }
        }
      `;
      document.head.appendChild(style);
    }
  };

  return { init };

})();


/* ============================================================
  03. PERSONAJES — MENSAJES AL TOCAR
  Cada tarjeta de personaje tiene un array de mensajes
  en su atributo data-messages. Al tocar, muestro uno
  aleatorio en la burbuja y animo la tarjeta.
  ============================================================ */
const FriendCards = (() => {

  /*
    Declaro init con const para que quede correctamente
    dentro del scope del IIFE y no contamine el scope global.
    Sin const/let, en strict mode podría lanzar un ReferenceError
    si el JS engine no encuentra la variable en ningún scope superior.
  */
  const init = () => {
    const cards = selAll('.inf-friend-card');

    cards.forEach((card) => {
      /* Obtengo los mensajes del atributo data */
      const messages = JSON.parse(card.getAttribute('data-messages') || '[]');
      let lastIndex   = -1;

      const showMessage = () => {
        if (!messages.length) return;

        /* Elijo un mensaje aleatorio diferente al anterior */
        let index;
        do { index = Math.floor(Math.random() * messages.length); }
        while (index === lastIndex && messages.length > 1);
        lastIndex = index;

        const bubble = card.querySelector('.inf-friend-card__bubble');
        if (!bubble) return;

        /* Animación: hago que el emoji rebote */
        const emoji = card.querySelector('.inf-friend-card__emoji');
        if (emoji) {
          emoji.style.transform = 'scale(1.4) rotate(15deg)';
          setTimeout(() => { emoji.style.transform = ''; }, 400);
        }

        /* Actualizo la burbuja con el mensaje */
        bubble.textContent = messages[index];
        card.classList.add('is-talking');

        /* Después de 3 segundos vuelvo al estado inicial */
        setTimeout(() => {
          bubble.textContent = '¡Tócame! 👆';
          card.classList.remove('is-talking');
        }, 3000);
      };

      /* Respondo tanto a click como a touch */
      onInteract(card, showMessage);

      /* También funciona con teclado (Enter/Space) para accesibilidad */
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showMessage();
        }
      });
    });
  };

  return { init };

})();


/* ============================================================
  04. JUEGO DE COLORES
  Al tocar el botón, muestro un color aleatorio del
  arcoíris con su nombre en español.
  ============================================================ */
const ColorGame = (() => {

  /* Colores del arcoíris con nombres en español */
  const COLORS = [
    { hex: '#FF0000', name: '🔴 Rojo' },
    { hex: '#FF7F00', name: '🟠 Naranja' },
    { hex: '#FFD700', name: '🟡 Amarillo' },
    { hex: '#00CC44', name: '🟢 Verde' },
    { hex: '#1E90FF', name: '🔵 Azul' },
    { hex: '#8B00FF', name: '🟣 Violeta' },
    { hex: '#FF69B4', name: '🩷 Rosado' },
    { hex: '#FF4500', name: '🔶 Rojo Naranja' },
    { hex: '#00CED1', name: '🩵 Turquesa' },
    { hex: '#FF1493', name: '💗 Fucsia' },
  ];

  let lastIndex = -1;

  const init = () => {
    const btn      = sel('#colorBtn');
    const colorBox = sel('#colorBox');
    const colorName = sel('#colorName');
    if (!btn || !colorBox || !colorName) return;

    const showColor = () => {
      let index;
      do { index = Math.floor(Math.random() * COLORS.length); }
      while (index === lastIndex && COLORS.length > 1);
      lastIndex = index;

      const color = COLORS[index];

      /* Animo la caja de color */
      colorBox.classList.add('is-popping');
      setTimeout(() => colorBox.classList.remove('is-popping'), 400);

      colorBox.style.backgroundColor = color.hex;
      colorBox.style.boxShadow = `0 4px 20px ${color.hex}80`;
      colorName.textContent    = color.name;
      colorName.style.color    = color.hex;
    };

    onInteract(btn, showColor);
  };

  return { init };

})();


/* ============================================================
  05. CONTADOR DE ANIMALES
  El niño toca "+" para añadir un animal aleatorio.
  El contador visual crece con animación.
  Máximo 20 animales para no saturar la pantalla.
  ============================================================ */
const AnimalCounter = (() => {

  /* Animales disponibles */
  const ANIMALS = ['🐶', '🐱', '🐸', '🦊', '🐮', '🐷', '🐔', '🦁',
                   '🐘', '🐰', '🐺', '🦋', '🐠', '🐢', '🦜', '🐝'];

  let count = 0;
  const MAX = 20;

  const init = () => {
    const addBtn    = sel('#addAnimalBtn');
    const clearBtn  = sel('#clearAnimalsBtn');
    const animalsEl = sel('#counterAnimals');
    const numEl     = sel('#counterNum');
    if (!addBtn || !clearBtn || !animalsEl || !numEl) return;

    const updateDisplay = () => {
      /* Animo el número */
      numEl.classList.add('is-counting');
      setTimeout(() => numEl.classList.remove('is-counting'), 300);
      numEl.textContent = count;
    };

    const addAnimal = () => {
      if (count >= MAX) {
        /* Shake cuando está lleno */
        animalsEl.style.animation = 'none';
        animalsEl.style.transform = 'translateX(-4px)';
        setTimeout(() => {
          animalsEl.style.transform = 'translateX(4px)';
          setTimeout(() => { animalsEl.style.transform = ''; }, 100);
        }, 100);
        return;
      }

      count++;
      const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
      const span   = document.createElement('span');
      span.textContent = animal;
      span.style.cssText = `
        display: inline-block;
        animation: animalPop 0.4s cubic-bezier(0.34,1.56,0.64,1);
      `;
      animalsEl.appendChild(span);
      updateDisplay();
    };

    const clearAnimals = () => {
      count = 0;
      animalsEl.innerHTML = '';
      updateDisplay();
    };

    onInteract(addBtn,   addAnimal);
    onInteract(clearBtn, clearAnimals);

    /* Agrego el keyframe de animalPop si no existe */
    if (!document.getElementById('animalStyle')) {
      const style = document.createElement('style');
      style.id = 'animalStyle';
      style.textContent = `
        @keyframes animalPop {
          from { transform: scale(0) rotate(-20deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg);   opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  };

  return { init };

})();


/* ============================================================
  06. ADIVINANZA
  Muestro/oculto la respuesta al tocar el botón.
  La respuesta aparece con una animación especial.
  ============================================================ */
const Riddle = (() => {

  /* Lista de adivinanzas para ir rotando */
  const RIDDLES = [
    {
      question: '"Tengo alas pero no soy pájaro. Duermo de día y vuelo de noche. ¿Quién soy?"',
      emoji: '🦇',
      answer: 'Soy el <strong>Murciélago</strong>! ¿Lo sabías? 🌙',
    },
    {
      question: '"Tengo dientes pero no muerdo. Sirvo para peinarte. ¿Qué soy?"',
      emoji: '🪮',
      answer: '¡Soy el <strong>Peine</strong>! 💇',
    },
    {
      question: '"Soy largo de día y corto de noche. No soy la luz, soy tu... ¿Qué?"',
      emoji: '🌑',
      answer: '¡Soy la <strong>Sombra</strong>! ☀️',
    },
    {
      question: '"Tengo agujas pero no coso. Tengo números pero no soy calculadora. ¿Qué soy?"',
      emoji: '⏰',
      answer: '¡Soy el <strong>Reloj</strong>! ⌚',
    },
    {
      question: '"Me abres cada mañana pero no soy una puerta. Me lees pero no soy un libro. ¿Qué soy?"',
      emoji: '📰',
      answer: '¡Soy el <strong>Periódico</strong>! 📖',
    },
  ];

  let currentIndex = 0;
  let isAnswered   = false;

  const init = () => {
    const btn       = sel('#riddleBtn');
    const textEl    = sel('#riddleText');
    const answerEl  = sel('#riddleAnswer');
    if (!btn || !textEl || !answerEl) return;

    const interact = () => {
      if (!isAnswered) {
        /* Mostrar respuesta */
        answerEl.removeAttribute('hidden');
        btn.textContent = '➡️ ¡Siguiente adivinanza!';
        isAnswered = true;
      } else {
        /* Siguiente adivinanza */
        currentIndex = (currentIndex + 1) % RIDDLES.length;
        const r = RIDDLES[currentIndex];

        textEl.textContent = r.question;
        answerEl.querySelector('.inf-riddle__answer-emoji').textContent = r.emoji;
        answerEl.querySelector('p').innerHTML = `¡${r.answer}`;
        answerEl.setAttribute('hidden', '');
        btn.textContent = '🔍 ¡Ver respuesta!';
        isAnswered = false;
      }
    };

    onInteract(btn, interact);
  };

  return { init };

})();


/* ============================================================
  07. CANCIONES — MOSTRAR / OCULTAR LETRA
  Al tocar el botón de play de cada canción,
  muestro u oculto la letra con animación.
  ============================================================ */
const SongCards = (() => {

  /* Declaro init con const para que viva solo dentro de este módulo */
  const init = () => {
    const playBtns = selAll('.inf-song-card__play');

    playBtns.forEach((btn) => {
      const card    = btn.closest('.inf-song-card');
      const lyricsId = btn.id.replace('playSong', 'lyrics');
      const lyricsEl = sel(`#${lyricsId}`, card);
      if (!lyricsEl) return;

      const toggle = () => {
        const isOpen = !lyricsEl.hasAttribute('hidden');

        if (isOpen) {
          /* Cerrar letra */
          lyricsEl.setAttribute('hidden', '');
          btn.classList.remove('is-playing');
          btn.setAttribute('aria-expanded', 'false');
          btn.textContent = '▶';
        } else {
          /* Abrir letra */
          lyricsEl.removeAttribute('hidden');
          btn.classList.add('is-playing');
          btn.setAttribute('aria-expanded', 'true');
          btn.textContent = ''; /* El CSS agrega el ⏸ con ::before */
        }
      };

      onInteract(btn, toggle);
    });
  };

  return { init };

})();


/* ============================================================
  08. CUENTOS — EXPANDIR HISTORIA COMPLETA
  El botón "Leer el cuento" expande el cuento completo
  con una animación suave.
  ============================================================ */
const StoriesExpand = (() => {

  /* Declaro init con const para evitar contaminación del scope global */
  const init = () => {
    const btns = selAll('.inf-story-card__btn');

    btns.forEach((btn) => {
      const storyId = btn.getAttribute('data-story');
      const fullEl  = sel(`#story-${storyId}`);
      if (!fullEl) return;

      const toggle = () => {
        const isOpen = !fullEl.hasAttribute('hidden');

        if (isOpen) {
          fullEl.setAttribute('hidden', '');
          btn.textContent = '📖 Leer el cuento';
          btn.setAttribute('aria-expanded', 'false');
        } else {
          fullEl.removeAttribute('hidden');
          btn.textContent = '📕 Cerrar cuento';
          btn.setAttribute('aria-expanded', 'true');
          /* Scroll suave hacia el cuento expandido */
          setTimeout(() => {
            fullEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }
      };

      onInteract(btn, toggle);
    });
  };

  return { init };

})();


/* ============================================================
  09. CONFETTI — ¡CELEBRACIÓN!
  Al tocar el botón de celebración, lanzo piezas de
  confetti colorido que caen desde la parte superior
  de la tarjeta. Puro JavaScript y CSS.
  ============================================================ */
const Confetti = (() => {

  const COLORS  = ['#FF0000', '#FFD700', '#00CC44', '#1E90FF',
                   '#FF69B4', '#FF7F00', '#8B00FF', '#00CED1'];
  const COUNT   = 50;
  const DURATION = 2500; /* ms */

  const launch = () => {
    const container = sel('#confetti');
    if (!container) return;

    /* Limpio confetti anterior si hay */
    container.innerHTML = '';

    for (let i = 0; i < COUNT; i++) {
      const piece = document.createElement('div');
      piece.className = 'inf-confetti-piece';

      const color  = COLORS[Math.floor(Math.random() * COLORS.length)];
      const left   = Math.random() * 100;
      const delay  = Math.random() * 0.8;
      const dur    = (DURATION / 1000) * (0.7 + Math.random() * 0.5);
      const size   = 6 + Math.random() * 10;
      const rotate = Math.random() * 360;

      piece.style.cssText = `
        left: ${left}%;
        top: 0;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        animation-duration: ${dur}s;
        animation-delay: ${delay}s;
        transform: rotate(${rotate}deg);
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      `;

      container.appendChild(piece);
    }

    /* Limpio las piezas después de la animación */
    setTimeout(() => {
      container.innerHTML = '';
    }, DURATION + 1000);
  };

  const init = () => {
    const btn = sel('#confettiBtn');
    onInteract(btn, launch);
  };

  return { init, launch };

})();


/* ============================================================
  10. ANIMACIONES DE SCROLL — EFECTO POP
  Observo todos los elementos con data-animate="inf-pop"
  y los revelo con un efecto de escala cuando entran en pantalla.
  ============================================================ */
const ScrollPop = (() => {

  /* Declaro init con const — misma razón que los módulos anteriores */
  const init = () => {
    const elements = selAll('[data-animate="inf-pop"]');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -20px 0px',
    });

    elements.forEach((el, i) => {
      /* Agrego delay escalonado basado en el índice dentro del grid padre */
      const siblings = el.parentElement ?
        selAll('[data-animate="inf-pop"]', el.parentElement) : [];
      const sibIndex = siblings.indexOf(el);
      if (sibIndex > 0) {
        el.style.transitionDelay = `${sibIndex * 80}ms`;
      }
      observer.observe(el);
    });
  };

  return { init };

})();


/* ============================================================
  11. SCROLL SUAVE INTERNO
  Los botones del hero ("¡Cuentos!", "¡Juegos!", etc.)
  hacen scroll suave con offset del navbar.
  ============================================================ */
const InPageScroll = (() => {

  const init = () => {
    const links = selAll('a[href^="#inf-"]');

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
  12. NAVBAR — AJUSTE DE ESTILO SCROLL PARA ESTA PÁGINA
  El navbar en esta sección es claro. Me aseguro de que
  al hacer scroll también se vea correctamente.
  ============================================================ */
const NavbarInfantil = (() => {

  const init = () => {
    const navbar = sel('#navbar');
    if (!navbar) return;

    /* Ya el CSS de inf-navbar maneja el scroll state,
       pero me aseguro de que el fondo no se vuelva oscuro */
    const ensureLight = () => {
      if (navbar.classList.contains('is-scrolled')) {
        navbar.style.background = 'rgba(255, 254, 240, 0.97)';
      } else {
        navbar.style.background = 'rgba(255, 254, 240, 0.95)';
      }
    };

    window.addEventListener('scroll', ensureLight, { passive: true });
    ensureLight(); /* Estado inicial */
  };

  return { init };

})();


/* ============================================================
  13. INICIALIZACIÓN DE INFANTIL.JS
  Uso whenReady (mi versión local renombrada) en lugar de onReady
  para evitar la colisión con la función del mismo nombre
  que ya está declarada en script.js.
  El comportamiento es exactamente el mismo — espero al DOM
  y luego lanzo todos mis módulos en orden.
  ============================================================ */
whenReady(() => {

  /* Primero el cielo — para que las estrellas aparezcan desde el inicio */
  HeroStars.init();

  /* Activo los personajes interactivos */
  FriendCards.init();

  /* Inicio mis tres juegos */
  ColorGame.init();
  AnimalCounter.init();
  Riddle.init();

  /* Canciones y cuentos expandibles */
  SongCards.init();
  StoriesExpand.init();

  /* El botón de confetti de celebración */
  Confetti.init();

  /* Las animaciones de entrada al hacer scroll */
  ScrollPop.init();

  /* El scroll suave entre secciones */
  InPageScroll.init();

  /* Me aseguro de que el navbar se vea claro en esta página */
  NavbarInfantil.init();

  /* Mi mensaje especial en la consola para quien la abra */
  console.log(
    '%c 🌈 Infantil — ¡Hola pequeño explorador! ',
    'background: linear-gradient(135deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF); color: white; font-size: 13px; font-weight: bold; padding: 6px 14px; border-radius: 20px;'
  );

});