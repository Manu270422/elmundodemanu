/**
 * ============================================================
 * tecnologia.js — El Mundo de Manu / Tecnología
 * ============================================================
 * Script específico para mi sección de tecnología.
 * script.js ya se encargó del cursor, navbar y animaciones
 * globales de scroll. Aquí manejo lo que es único de esta
 * página técnica.
 *
 * Módulos de este archivo:
 * 01. Utilidades locales
 * 02. Canvas Matrix — lluvia de código del fondo del hero
 * 03. Terminal Typewriter — efecto de escritura en la terminal
 * 04. Stack Tabs — sistema de pestañas del stack tecnológico
 * 05. Projects Filter — filtrado de proyectos por categoría
 * 06. Learning Bars — barras de progreso del aprendizaje
 * 07. Code Highlight — resaltado del snippet de código
 * 08. Inicialización
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

/** Clamp — limito valores numéricos entre min y max */
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);


/* ============================================================
  02. CANVAS MATRIX — LLUVIA DE CÓDIGO DEL HERO
  Animo el fondo del hero con caracteres cayendo al estilo
  Matrix pero con símbolos de código real: {}, [], <>, /, ;
  Uso el Canvas 2D API nativo — sin librerías.
  ============================================================ */
const MatrixCanvas = (() => {

  const canvas = sel('#matrixCanvas');
  if (!canvas) return { init: () => {} };

  const ctx = canvas.getContext('2d');

  // Mezclo caracteres técnicos para que se vea como código real
  const CHARS = [
    '0', '1', '{', '}', '[', ']', '<', '>',
    '/', ';', '=', '(', ')', '!', '&', '|',
    'fn', 'if', '=>', '&&', '||', '++',
    'var', 'let', 'const', 'return',
  ];

  const FONT_SIZE   = 13;   // Tamaño de cada caracter
  const FALL_SPEED  = 0.6;  // Velocidad de caída (más bajo = más lento)
  const COLOR       = '108, 99, 255'; // Color primario en RGB

  let columns = [];
  let width, height;
  let rafId;

  /** Ajusto el tamaño del canvas al contenedor */
  const resize = () => {
    width  = canvas.width  = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;

    // Recalculo las columnas según el nuevo ancho
    const numCols = Math.floor(width / FONT_SIZE);
    columns = Array.from({ length: numCols }, () => ({
      y:      Math.random() * -height,   // Empiezo en posición aleatoria arriba
      speed:  FALL_SPEED + Math.random() * 1.5,
      charIndex: 0,
    }));
  };

  /** Elijo un caracter aleatorio de mi lista */
  const randomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];

  /** Dibujo el frame actual de la animación */
  const draw = () => {
    // Trazo un rect semitransparente sobre todo el canvas para que
    // los caracteres viejos se vayan desvaneciendo (efecto de estela)
    ctx.fillStyle = 'rgba(10, 10, 15, 0.08)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`;

    columns.forEach((col, i) => {
      const x    = i * FONT_SIZE;
      const char = randomChar();

      // El caracter de la cabeza es más brillante (blanco)
      const isHead = col.y < FONT_SIZE * 2;

      if (isHead) {
        ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
      } else {
        // Los caracteres de la cola van perdiendo opacidad con la distancia
        const alpha = clamp(1 - (col.y / height) * 0.7, 0.1, 0.6);
        ctx.fillStyle = `rgba(${COLOR}, ${alpha})`;
      }

      ctx.fillText(char, x, col.y);

      // Bajo la posición de la columna
      col.y += col.speed * FONT_SIZE;

      // Cuando llega al fondo, la reinicio arriba con velocidad aleatoria
      if (col.y > height + FONT_SIZE) {
        col.y     = Math.random() * -height * 0.5;
        col.speed = FALL_SPEED + Math.random() * 1.5;
      }
    });

    rafId = requestAnimationFrame(draw);
  };

  const init = () => {
    resize();
    draw();

    window.addEventListener('resize', () => {
      resize();
    }, { passive: true });

    // Pauso cuando la página no es visible para ahorrar CPU
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        draw();
      }
    });
  };

  return { init };

})();


/* ============================================================
  03. TERMINAL TYPEWRITER
  Las líneas de la terminal del hero aparecen una a una
  con un efecto de escritura que simula que alguien las
  está escribiendo en tiempo real.
  ============================================================ */
const TerminalTypewriter = (() => {

  // Mapeo de las líneas que voy a animar
  // Uso data-animate en el HTML pero aquí hago algo más específico
  const LINES_DELAY = 400; // ms entre cada línea de la terminal

  const init = () => {
    const lines = selAll('.tc-hero__terminal-line');
    if (!lines.length) return;

    // Oculto todas las líneas inicialmente
    lines.forEach((line) => {
      line.style.opacity   = '0';
      line.style.transform = 'translateX(-8px)';
      line.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    });

    // Las voy revelando una a una con delays escalonados
    lines.forEach((line, index) => {
      setTimeout(() => {
        line.style.opacity   = '1';
        line.style.transform = 'translateX(0)';
      }, 800 + index * LINES_DELAY); // 800ms de delay inicial antes de empezar
    });
  };

  return { init };

})();


/* ============================================================
  04. STACK TABS
  Sistema de pestañas accesible para filtrar el stack
  tecnológico por categoría (Frontend, Backend, Tools, Learning).
  Manejo el estado con ARIA y actualizo las clases CSS.
  ============================================================ */
const StackTabs = (() => {

  const tabBtns  = selAll('.tc-stack__tab');
  const panels   = selAll('.tc-stack__panel');

  /**
   * Activo un tab y muestro el panel correspondiente.
   * @param {HTMLElement} activeTab - El botón del tab a activar.
   */
  const activateTab = (activeTab) => {
    const targetPanel = activeTab.getAttribute('data-tab');

    // Actualizo los botones
    tabBtns.forEach((btn) => {
      const isActive = btn === activeTab;
      btn.classList.toggle('tc-stack__tab--active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    // Muestro/oculto los paneles con animación
    panels.forEach((panel) => {
      const panelName = panel.getAttribute('data-panel');
      const isTarget  = panelName === targetPanel;

      if (isTarget) {
        panel.classList.remove('tc-stack__panel--hidden');
        // Pequeña animación de entrada para las tarjetas del panel
        const cards = selAll('.tc-tech-card', panel);
        cards.forEach((card, i) => {
          card.style.opacity   = '0';
          card.style.transform = 'translateY(16px)';
          card.style.transition = `opacity 0.35s ease ${i * 60}ms, transform 0.35s ease ${i * 60}ms`;

          // Fuerzo un reflow para que la transición funcione
          card.getBoundingClientRect();

          card.style.opacity   = '1';
          card.style.transform = 'translateY(0)';
        });
      } else {
        panel.classList.add('tc-stack__panel--hidden');
      }
    });
  };

  const init = () => {
    if (!tabBtns.length) return;

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => activateTab(btn));

      // Navegación por teclado — flechas izq/der cambian de tab
      btn.addEventListener('keydown', (e) => {
        const tabs  = [...tabBtns];
        const index = tabs.indexOf(btn);

        if (e.key === 'ArrowRight') {
          e.preventDefault();
          const next = tabs[(index + 1) % tabs.length];
          next.focus();
          activateTab(next);
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prev = tabs[(index - 1 + tabs.length) % tabs.length];
          prev.focus();
          activateTab(prev);
        }
      });
    });
  };

  return { init };

})();


/* ============================================================
  05. PROJECTS FILTER
  Filtrado de tarjetas de proyectos por categoría.
  Las tarjetas tienen data-category con las categorías
  a las que pertenecen (espacio separado para múltiples).
  ============================================================ */
const ProjectsFilter = (() => {

  const filterBtns  = selAll('.tc-projects__filter');
  const grid        = sel('#projectsGrid');
  const emptyMsg    = sel('#projectsEmpty');

  /**
   * Aplico el filtro seleccionado.
   * @param {string} filter - La categoría a mostrar ('todos' = todos).
   */
  const applyFilter = (filter) => {
    const cards = selAll('.tc-project-card', grid);
    let visibleCount = 0;

    cards.forEach((card) => {
      const categories = card.getAttribute('data-category') || '';
      const matches    = filter === 'todos' || categories.includes(filter);

      if (matches) {
        card.classList.remove('tc-project-card--hidden');
        visibleCount++;

        // Animo la entrada de las tarjetas visibles
        card.style.opacity   = '0';
        card.style.transform = 'translateY(12px)';
        requestAnimationFrame(() => {
          card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          card.style.opacity   = '1';
          card.style.transform = 'translateY(0)';
        });
      } else {
        card.classList.add('tc-project-card--hidden');
      }
    });

    // Muestro mensaje de vacío si no hay tarjetas
    if (emptyMsg) {
      emptyMsg.hidden = visibleCount > 0;
    }
  };

  const init = () => {
    if (!filterBtns.length) return;

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        // Actualizo el estado activo de los botones
        filterBtns.forEach((b) => b.classList.remove('tc-projects__filter--active'));
        btn.classList.add('tc-projects__filter--active');

        const filter = btn.getAttribute('data-filter');
        applyFilter(filter);
      });
    });
  };

  return { init };

})();


/* ============================================================
  06. LEARNING BARS
  Animo las barras de progreso de los items de aprendizaje
  cuando el usuario llega a esa sección con scroll.
  Uso el atributo data-width del elemento para saber
  hasta qué porcentaje debo llegar.
  ============================================================ */
const LearningBars = (() => {

  const init = () => {
    const bars = selAll('.tc-learning__item-bar');
    if (!bars.length) return;

    // Preparo cada barra con su variable CSS de ancho objetivo
    bars.forEach((bar) => {
      const width = bar.getAttribute('data-width');
      if (width) {
        bar.style.setProperty('--bar-width', `${width}%`);
      }
    });

    // Observo la sección de aprendizaje para disparar la animación
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Animo todas las barras dentro de esta sección
          const sectionBars = selAll('.tc-learning__item-bar', entry.target);
          sectionBars.forEach((bar) => {
            setTimeout(() => {
              bar.classList.add('is-animated');
            }, 200);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    const section = sel('.tc-learning');
    if (section) observer.observe(section);
  };

  return { init };

})();


/* ============================================================
  07. EFECTO HOVER EN LA TERMINAL
  Cuando el usuario pasa el mouse sobre la terminal,
  genero caracteres aleatorios en el cursor para simular
  que algo está corriendo.
  ============================================================ */
const TerminalHoverEffect = (() => {

  const GLITCH_CHARS = ['_', '|', '/', '\\', '-', '█', '▓', '░'];
  let intervalId = null;

  const init = () => {
    const terminal  = sel('.tc-hero__terminal');
    const cursor    = sel('#termCursor');
    if (!terminal || !cursor) return;

    terminal.addEventListener('mouseenter', () => {
      intervalId = setInterval(() => {
        const char = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        cursor.textContent = char;
      }, 80);
    });

    terminal.addEventListener('mouseleave', () => {
      clearInterval(intervalId);
      cursor.textContent = '_';
    });
  };

  return { init };

})();


/* ============================================================
  08. TABS DE STACK: ANIMACIÓN DE ENTRADA INICIAL
  Cuando la sección de stack entra en el viewport,
  activo las tarjetas del panel activo con animación.
  ============================================================ */
const StackEntrance = (() => {

  const init = () => {
    const stackSection = sel('.tc-stack');
    if (!stackSection) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Animo solo las tarjetas del panel activo (el primero)
          const activePanel = sel('.tc-stack__panel:not(.tc-stack__panel--hidden)');
          if (!activePanel) return;

          const cards = selAll('.tc-tech-card', activePanel);
          cards.forEach((card, i) => {
            card.style.opacity    = '0';
            card.style.transform  = 'translateY(20px)';
            card.style.transition = `opacity 0.4s ease ${i * 80}ms, transform 0.4s ease ${i * 80}ms`;

            setTimeout(() => {
              card.style.opacity   = '1';
              card.style.transform = 'translateY(0)';
            }, 100 + i * 80);
          });

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(stackSection);
  };

  return { init };

})();


/* ============================================================
  INICIALIZACIÓN DE TECNOLOGIA.JS
  ============================================================ */
onReady(() => {

  // Canvas matrix — lo lanzo primero porque es el más visual
  MatrixCanvas.init();

  // Efecto de escritura en la terminal
  TerminalTypewriter.init();

  // Sistema de tabs del stack
  StackTabs.init();

  // Filtro de proyectos
  ProjectsFilter.init();

  // Barras de aprendizaje
  LearningBars.init();

  // Efectos hover de la terminal
  TerminalHoverEffect.init();

  // Animación de entrada de las tarjetas del stack
  StackEntrance.init();

  // Identificación en consola
  console.log(
    '%c ⚡ Tecnología — tecnologia.js cargado ',
    'background: #6C63FF; color: #fff; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 4px;'
  );

});
