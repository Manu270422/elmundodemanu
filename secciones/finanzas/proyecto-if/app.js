/**
 * ============================================================
 * app.js — Calculadora de Independencia Financiera
 * ============================================================
 * El cerebro completo de la calculadora. Sin dependencias
 * externas — todo en vanilla JS puro.
 *
 * Módulos:
 * 01. Estado global — datos del usuario
 * 02. Formateo — monedas y números
 * 03. Motor de cálculo — interés compuesto + regla 4%
 * 04. Sliders — control UI con fill visual
 * 05. Canvas del gráfico — proyección animada
 * 06. Renderizado de KPIs
 * 07. Hitos de progreso
 * 08. Insights inteligentes personalizados
 * 09. Selector de moneda
 * 10. Tooltips informativos
 * 11. Botón de compartir (clipboard)
 * 12. Inicialización
 *
 * CÁLCULO:
 * Uso la fórmula de Valor Futuro con aportes periódicos:
 *   FV = PV*(1+r)^n + PMT * [(1+r)^n - 1] / r
 * Donde:
 *   PV  = ahorros actuales
 *   r   = tasa anual / 12 (mensual)
 *   n   = meses
 *   PMT = ahorro mensual (ingresos - gastos)
 *
 * Meta de IF (Regla del 4%):
 *   Target = gastos_mensuales * 12 * 25
 *   (equivale a 25x los gastos anuales)
 *
 * GRÁFICO:
 * Canvas 2D animado que dibuja dos curvas:
 *   1. Línea de crecimiento real (FV con interés compuesto)
 *   2. Línea de solo aportes (sin intereses)
 *   3. Línea punteada de la meta IF
 * Tiene tooltip interactivo al mover el mouse/touch.
 *
 * IDIOMA: Formato COP por defecto con separadores colombianos.
 *
 * Autor: Carlos Manuel Turizo Hernández
 * Versión: 1.0.0
 * ============================================================
 */

'use strict';

/* ============================================================
  01. ESTADO GLOBAL
  Un objeto central que mantiene todos los inputs y resultados.
  Evito variables sueltas para mantener el código limpio.
  ============================================================ */
const state = {
  // Inputs del usuario
  savings:    10_000_000,  // Ahorros actuales
  income:      2_500_000,  // Ingresos mensuales
  expenses:    2_000_000,  // Gastos mensuales
  returnRate:          7,  // Rendimiento anual (%)
  age:                25,  // Edad actual

  // Configuración
  currency: 'COP',

  // Resultados calculados
  results: {
    yearsToFI: null,
    ageAtFI:   null,
    target:    null,
    savingRate: null,
    monthlySave: null,
    totalInterest: null,
    projection: [],        // Array de {year, fv, contributions}
    milestones: {},
  },
};

/* ============================================================
  02. FORMATEO DE MONEDA Y NÚMEROS
  ============================================================ */
const CURRENCIES = {
  COP: { locale: 'es-CO', currency: 'COP', symbol: '$',  factor: 1 },
  USD: { locale: 'en-US', currency: 'USD', symbol: '$',  factor: 1/4100 },
  EUR: { locale: 'de-DE', currency: 'EUR', symbol: '€',  factor: 1/4500 },
};

/**
 * Formatea un número como moneda según la divisa seleccionada.
 * Uso Intl.NumberFormat para el formato correcto por locale.
 */
const fmt = (n, opts = {}) => {
  const cur = CURRENCIES[state.currency];
  const value = n * cur.factor;
  const { compact = false } = opts;

  if (compact) {
    if (Math.abs(value) >= 1e9) return `${cur.symbol}${(value/1e9).toFixed(1)}B`;
    if (Math.abs(value) >= 1e6) return `${cur.symbol}${(value/1e6).toFixed(1)}M`;
    if (Math.abs(value) >= 1e3) return `${cur.symbol}${(value/1e3).toFixed(0)}K`;
  }

  return new Intl.NumberFormat(cur.locale, {
    style: 'currency',
    currency: cur.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const fmtPct  = (n) => `${n.toFixed(1)}%`;
const fmtYrs  = (n) => n === 1 ? '1 año' : `${Math.round(n)} años`;


/* ============================================================
  03. MOTOR DE CÁLCULO
  ============================================================ */

/**
 * Calcula el Valor Futuro en el mes N con aportes periódicos.
 * @param {number} pv   - Valor presente (ahorros actuales)
 * @param {number} pmt  - Aporte mensual
 * @param {number} r    - Tasa mensual (anual / 12 / 100)
 * @param {number} n    - Número de meses
 * @returns {number} Valor futuro
 */
const futureValue = (pv, pmt, r, n) => {
  if (r === 0) return pv + pmt * n;
  const factor = Math.pow(1 + r, n);
  return pv * factor + pmt * (factor - 1) / r;
};

/**
 * Calcula todo y almacena en state.results.
 * Proyecta año a año hasta alcanzar la meta IF o 60 años.
 */
const calculate = () => {
  const { savings, income, expenses, returnRate, age } = state;

  const monthlyRate = returnRate / 100 / 12;
  const monthlySave = Math.max(0, income - expenses);
  const savingRate  = income > 0 ? (monthlySave / income) * 100 : 0;

  // Meta de IF: 25 × gastos anuales (regla 4%)
  const annualExpenses = expenses * 12;
  const target = annualExpenses * 25;

  // Si hay déficit (gastos > ingresos), no puede ahorrar
  const canSave = monthlySave > 0 || savings >= target;

  // Proyección año a año (máximo 80 años)
  const projection = [];
  let yearsToFI = null;
  const milestones = { 25: null, 50: null, 75: null, 100: null };

  for (let year = 0; year <= 80; year++) {
    const months = year * 12;
    const fv = futureValue(savings, monthlySave, monthlyRate, months);
    const contributions = savings + monthlySave * months;
    const pct = target > 0 ? (fv / target) * 100 : 0;

    projection.push({ year, fv, contributions: Math.min(contributions, fv), pct });

    // Detectar hitos
    if (!milestones[25]  && pct >= 25)  milestones[25]  = year;
    if (!milestones[50]  && pct >= 50)  milestones[50]  = year;
    if (!milestones[75]  && pct >= 75)  milestones[75]  = year;
    if (!milestones[100] && pct >= 100) {
      milestones[100] = year;
      if (yearsToFI === null) yearsToFI = year;
    }
  }

  // Si nunca alcanza la meta (déficit o rendimiento insuficiente)
  const totalInterest = yearsToFI !== null
    ? projection[yearsToFI].fv - savings - monthlySave * yearsToFI * 12
    : null;

  state.results = {
    yearsToFI,
    ageAtFI:     yearsToFI !== null ? age + yearsToFI : null,
    target,
    savingRate,
    monthlySave,
    totalInterest,
    projection,
    milestones,
    canSave,
  };
};


/* ============================================================
  04. SLIDERS — CONTROL UI
  ============================================================ */

/** Lista de configuraciones de cada slider */
const SLIDERS = [
  { id: 'savings',     key: 'savings',    outputId: 'savings-output',
    format: (v) => fmt(v, { compact: true }) },
  { id: 'income',      key: 'income',     outputId: 'income-output',
    format: (v) => fmt(v, { compact: true }) },
  { id: 'expenses',    key: 'expenses',   outputId: 'expenses-output',
    format: (v) => fmt(v, { compact: true }) },
  { id: 'return-rate', key: 'returnRate', outputId: 'return-output',
    format: (v) => fmtPct(v) },
  { id: 'age',         key: 'age',        outputId: 'age-output',
    format: (v) => `${v} años` },
];

/**
 * Actualiza el fill visual del slider (la barra verde de progreso).
 * El fill no es parte del slider nativo — lo implemento con un div.
 */
const updateSliderFill = (input) => {
  const fill = document.getElementById(`${input.id}-fill`);
  if (!fill) return;
  const min   = parseFloat(input.min);
  const max   = parseFloat(input.max);
  const val   = parseFloat(input.value);
  const pct   = ((val - min) / (max - min)) * 100;
  fill.style.width = `${pct}%`;
};

/** Inicializo todos los sliders */
const initSliders = () => {
  SLIDERS.forEach(({ id, key, outputId, format }) => {
    const input  = document.getElementById(id);
    const output = document.getElementById(outputId);
    if (!input || !output) return;

    // Actualización en tiempo real
    const update = () => {
      const val = parseFloat(input.value);
      state[key] = val;
      output.textContent = format(val);
      input.setAttribute('aria-valuenow', val);
      updateSliderFill(input);
      onStateChange();
    };

    input.addEventListener('input', update, { passive: true });
    // Inicializo el fill
    updateSliderFill(input);
  });
};

/** Actualizo un slider desde código (para los botones de escenario) */
const setSlider = (id, value) => {
  const input = document.getElementById(id);
  if (!input) return;
  input.value = value;
  input.dispatchEvent(new Event('input'));
};


/* ============================================================
  05. CANVAS DEL GRÁFICO DE PROYECCIÓN
  ============================================================ */
const Chart = (() => {
  const canvas = document.getElementById('projectionChart');
  if (!canvas) return { draw: () => {} };

  const ctx = canvas.getContext('2d');
  let animFrame = null;
  let animProgress = 0;
  let animTarget   = 1;
  let hoveredIdx   = null;
  const tooltip    = document.getElementById('chartTooltip');

  // Colores
  const C_GREEN      = '#16C784';
  const C_GREEN_DIM  = 'rgba(22,199,132,0.25)';
  const C_GREEN_FILL = 'rgba(22,199,132,0.08)';
  const C_CONTRIBS   = 'rgba(22,199,132,0.35)';
  const C_AMBER      = '#F59E0B';
  const C_GRID       = 'rgba(22,199,132,0.07)';
  const C_TEXT       = 'rgba(143,168,153,0.7)';

  // Padding interno del gráfico
  const PAD = { top: 20, right: 16, bottom: 36, left: 60 };

  /** Configura el canvas para pantallas de alta densidad (retina) */
  const setupDPI = () => {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width  = rect.width  + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);
  };

  /** Devuelve las dimensiones útiles del área de dibujo */
  const getArea = () => {
    const W = canvas.getBoundingClientRect().width;
    const H = canvas.getBoundingClientRect().height;
    return {
      x: PAD.left,
      y: PAD.top,
      w: W - PAD.left - PAD.right,
      h: H - PAD.top  - PAD.bottom,
      W, H,
    };
  };

  /**
   * Dibujo principal. Anima el reveal de izquierda a derecha.
   * progress: 0 (nada) → 1 (completo)
   */
  const draw = (progress = 1) => {
    const { projection, target, yearsToFI } = state.results;
    if (!projection || projection.length < 2) return;

    setupDPI();
    const { x, y, w, h, W, H } = getArea();

    ctx.clearRect(0, 0, W, H);

    // Max Y del gráfico: 10% más que el target o el máximo de la proyección
    const maxFV = Math.max(
      target * 1.1,
      projection[projection.length - 1].fv * 1.05
    );

    // Filtra puntos que tienen sentido mostrar (máx 60 años o hasta IF + 5)
    const maxYear = yearsToFI !== null
      ? Math.min(yearsToFI + 6, projection.length - 1)
      : Math.min(50, projection.length - 1);

    const visData = projection.slice(0, maxYear + 1);
    const numPts  = visData.length;

    // Funciones de conversión año/valor → coordenada canvas
    const toX = (i) => x + (i / (numPts - 1)) * w;
    const toY = (v) => y + h - (Math.min(v, maxFV) / maxFV) * h;

    // Cuántos puntos dibujar según el progreso de animación
    const drawUpTo = Math.floor(progress * (numPts - 1));

    /* ── GRID HORIZONTAL ── */
    const gridLines = 4;
    ctx.lineWidth = 1;
    ctx.strokeStyle = C_GRID;
    ctx.setLineDash([]);
    for (let i = 0; i <= gridLines; i++) {
      const gy = y + (i / gridLines) * h;
      ctx.beginPath();
      ctx.moveTo(x, gy);
      ctx.lineTo(x + w, gy);
      ctx.stroke();

      // Etiquetas del eje Y
      const val = maxFV * (1 - i / gridLines);
      ctx.fillStyle = C_TEXT;
      ctx.font = `10px 'IBM Plex Mono', monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(fmt(val, { compact: true }), x - 6, gy + 4);
    }

    /* ── LÍNEA META IF (punteada) ── */
    if (target > 0 && target <= maxFV) {
      const targetY = toY(target);
      ctx.beginPath();
      ctx.setLineDash([6, 5]);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = C_AMBER;
      ctx.globalAlpha = 0.6;
      ctx.moveTo(x, targetY);
      ctx.lineTo(x + w, targetY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Label "Meta IF"
      ctx.fillStyle = C_AMBER;
      ctx.font = `9px 'Inter', sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('Meta IF', x + 4, targetY - 4);
    }

    /* ── ÁREA DE APORTES (relleno suave debajo de la línea de contribuciones) ── */
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(visData[0].contributions));
    for (let i = 1; i <= drawUpTo; i++) {
      ctx.lineTo(toX(i), toY(visData[i].contributions));
    }
    ctx.lineTo(toX(drawUpTo), y + h);
    ctx.lineTo(toX(0), y + h);
    ctx.closePath();
    ctx.fillStyle = 'rgba(22,199,132,0.06)';
    ctx.fill();

    /* ── LÍNEA DE APORTES (sin intereses) ── */
    ctx.beginPath();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = C_CONTRIBS;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i <= drawUpTo; i++) {
      const px = toX(i);
      const py = toY(visData[i].contributions);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    /* ── ÁREA BAJO LA CURVA PRINCIPAL ── */
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(visData[0].fv));
    for (let i = 1; i <= drawUpTo; i++) {
      // Suavizo la curva con bezier
      const prev = visData[i - 1];
      const curr = visData[i];
      const cpx  = (toX(i - 1) + toX(i)) / 2;
      ctx.bezierCurveTo(cpx, toY(prev.fv), cpx, toY(curr.fv), toX(i), toY(curr.fv));
    }
    ctx.lineTo(toX(drawUpTo), y + h);
    ctx.lineTo(toX(0), y + h);
    ctx.closePath();
    const areaGrad = ctx.createLinearGradient(0, y, 0, y + h);
    areaGrad.addColorStop(0, 'rgba(22,199,132,0.18)');
    areaGrad.addColorStop(1, 'rgba(22,199,132,0)');
    ctx.fillStyle = areaGrad;
    ctx.fill();

    /* ── CURVA PRINCIPAL DE CRECIMIENTO ── */
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    const lineGrad = ctx.createLinearGradient(x, 0, x + w, 0);
    lineGrad.addColorStop(0, 'rgba(22,199,132,0.5)');
    lineGrad.addColorStop(1, C_GREEN);
    ctx.strokeStyle = lineGrad;
    for (let i = 0; i <= drawUpTo; i++) {
      const px = toX(i);
      const py = toY(visData[i].fv);
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        const prev = visData[i - 1];
        const cpx  = (toX(i - 1) + toX(i)) / 2;
        ctx.bezierCurveTo(cpx, toY(prev.fv), cpx, py, px, py);
      }
    }
    ctx.stroke();

    /* ── PUNTO FINAL (cabeza de la curva animada) ── */
    if (drawUpTo > 0 && progress < 1) {
      const lastX = toX(drawUpTo);
      const lastY = toY(visData[drawUpTo].fv);
      ctx.beginPath();
      ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
      ctx.fillStyle = C_GREEN;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lastX, lastY, 9, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(22,199,132,0.2)';
      ctx.fill();
    }

    /* ── MARCADOR DE AÑO IF ── */
    if (yearsToFI !== null && yearsToFI <= maxYear) {
      const fiX = toX(yearsToFI);
      const fiY = toY(target);
      // Línea vertical
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(22,199,132,0.4)';
      ctx.setLineDash([3, 3]);
      ctx.moveTo(fiX, y);
      ctx.lineTo(fiX, y + h);
      ctx.stroke();
      ctx.setLineDash([]);
      // Círculo de IF
      ctx.beginPath();
      ctx.arc(fiX, fiY, 7, 0, Math.PI * 2);
      ctx.fillStyle = C_GREEN;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(fiX, fiY, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(22,199,132,0.25)';
      ctx.fill();
      // Label "IF" dentro del círculo
      ctx.fillStyle = '#061A0E';
      ctx.font = `bold 7px 'Inter', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('IF', fiX, fiY + 3);
    }

    /* ── EJE X: ETIQUETAS DE AÑOS ── */
    ctx.fillStyle = C_TEXT;
    ctx.font = `10px 'IBM Plex Mono', monospace`;
    ctx.textAlign = 'center';
    const xStep = Math.max(1, Math.floor(numPts / 6));
    for (let i = 0; i < numPts; i += xStep) {
      ctx.fillText(`Año ${visData[i].year}`, toX(i), y + h + 22);
    }

    /* ── TOOLTIP INTERACTIVO ── */
    if (hoveredIdx !== null && hoveredIdx <= drawUpTo && hoveredIdx < visData.length) {
      const d   = visData[hoveredIdx];
      const hx  = toX(hoveredIdx);
      const hy  = toY(d.fv);

      // Línea vertical de hover
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(22,199,132,0.3)';
      ctx.moveTo(hx, y);
      ctx.lineTo(hx, y + h);
      ctx.stroke();

      // Punto destacado
      ctx.beginPath();
      ctx.arc(hx, hy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(hx, hy, 5, 0, Math.PI * 2);
      ctx.strokeStyle = C_GREEN;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Actualizar el tooltip DOM
      const tipEl = document.getElementById('chartTooltip');
      if (tipEl) {
        tipEl.querySelector('.chart-tooltip__year').textContent =
          `Año ${d.year} (edad ${state.age + d.year})`;
        tipEl.querySelector('.chart-tooltip__value').textContent =
          fmt(d.fv, { compact: false });
        tipEl.querySelector('.chart-tooltip__contribs').textContent =
          `Aportes: ${fmt(d.contributions, { compact: true })}`;
        tipEl.classList.add('visible');

        // Posición del tooltip
        const canvasRect = canvas.getBoundingClientRect();
        let tipLeft = hx + 14;
        if (tipLeft + 150 > w + PAD.left) tipLeft = hx - 154;
        tipEl.style.left = tipLeft + 'px';
        tipEl.style.top  = Math.max(y, hy - 40) + 'px';
        tipEl.setAttribute('aria-hidden', 'false');
      }
    } else if (tooltip) {
      tooltip.classList.remove('visible');
      tooltip.setAttribute('aria-hidden', 'true');
    }
  };

  /**
   * Anima el reveal del gráfico de izquierda a derecha.
   * Uso requestAnimationFrame para suavidad.
   */
  const animate = () => {
    if (animFrame) cancelAnimationFrame(animFrame);
    animProgress = 0;
    const duration = 900; // ms
    const startTime = performance.now();

    const step = (now) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      animProgress = 1 - Math.pow(1 - progress, 3);
      draw(animProgress);
      if (progress < 1) animFrame = requestAnimationFrame(step);
    };
    animFrame = requestAnimationFrame(step);
  };

  /** Interacción: hover/touch en el canvas */
  const bindInteraction = () => {
    const getIdx = (clientX) => {
      const { projection, yearsToFI } = state.results;
      if (!projection) return null;
      const rect = canvas.getBoundingClientRect();
      const maxYear = yearsToFI !== null
        ? Math.min(yearsToFI + 6, projection.length - 1)
        : Math.min(50, projection.length - 1);
      const visData = projection.slice(0, maxYear + 1);
      const { x, w } = { x: PAD.left, w: rect.width - PAD.left - PAD.right };
      const relX = clientX - rect.left - x;
      const idx  = Math.round((relX / w) * (visData.length - 1));
      return Math.max(0, Math.min(visData.length - 1, idx));
    };

    canvas.addEventListener('mousemove', (e) => {
      hoveredIdx = getIdx(e.clientX);
      draw(1);
    }, { passive: true });

    canvas.addEventListener('mouseleave', () => {
      hoveredIdx = null;
      draw(1);
      if (tooltip) {
        tooltip.classList.remove('visible');
        tooltip.setAttribute('aria-hidden', 'true');
      }
    }, { passive: true });

    // Touch support
    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        hoveredIdx = getIdx(e.touches[0].clientX);
        draw(1);
      }
    }, { passive: true });

    canvas.addEventListener('touchend', () => {
      hoveredIdx = null;
    }, { passive: true });
  };

  const init = () => {
    setupDPI();
    bindInteraction();
    window.addEventListener('resize', () => {
      setupDPI();
      draw(1);
    }, { passive: true });
  };

  // Reducción de movimiento: no animar, dibujar directo
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return {
    init,
    refresh: () => prefersReduced ? draw(1) : animate(),
    draw: (p) => draw(p),
  };
})();


/* ============================================================
  06. RENDERIZADO DE KPIs
  ============================================================ */
const renderKPIs = () => {
  const { yearsToFI, ageAtFI, target, savingRate,
          monthlySave, totalInterest, projection } = state.results;

  const yearsEl = document.getElementById('years-number');
  const ageEl   = document.getElementById('kpi-age-label');
  const targetEl = document.getElementById('kpi-target');
  const rateEl   = document.getElementById('kpi-rate');
  const monthEl  = document.getElementById('kpi-monthly');
  const intEl    = document.getElementById('kpi-interest');

  // Años hasta IF
  if (yearsEl) {
    if (yearsToFI !== null && yearsToFI <= 80) {
      yearsEl.textContent = yearsToFI;
      yearsEl.parentElement.classList.remove('is-infinite');
    } else {
      yearsEl.textContent = '∞';
      yearsEl.parentElement.classList.add('is-infinite');
    }
  }

  if (ageEl) {
    ageEl.textContent = ageAtFI !== null
      ? `A los ${ageAtFI} años`
      : 'Ajusta tu tasa de ahorro';
  }

  if (targetEl) targetEl.textContent = fmt(target, { compact: false });

  if (rateEl) {
    rateEl.textContent = fmtPct(savingRate);
    // Color semántico según la tasa
    rateEl.style.color =
      savingRate >= 40 ? 'var(--green-lt)' :
      savingRate >= 20 ? 'var(--text-1)'   :
      savingRate > 0   ? 'var(--amber)'    : 'var(--red)';
  }

  if (monthEl) monthEl.textContent = fmt(monthlySave, { compact: false });

  if (intEl) {
    intEl.textContent = totalInterest !== null && totalInterest > 0
      ? fmt(totalInterest, { compact: true })
      : '---';
  }
};


/* ============================================================
  07. HITOS DE PROGRESO
  ============================================================ */
const renderMilestones = () => {
  const { milestones, yearsToFI } = state.results;
  const defs = [25, 50, 75, 100];

  defs.forEach((pct) => {
    const el     = document.getElementById(`milestone-${pct}`);
    const whenEl = document.getElementById(`m${pct}-when`);
    if (!el || !whenEl) return;

    const years = milestones[pct];
    if (years !== null && years !== undefined) {
      whenEl.textContent = `En ${fmtYrs(years)} (edad ${state.age + years})`;
      el.classList.add('milestone--reached');
    } else {
      whenEl.textContent = 'No alcanzado en 80 años';
      el.classList.remove('milestone--reached');
    }
  });
};


/* ============================================================
  08. INSIGHTS INTELIGENTES
  Los insights analizan la situación del usuario y dan
  consejos específicos según su tasa de ahorro, el impacto
  del interés compuesto, y su tiempo hasta IF.
  ============================================================ */
const renderInsights = () => {
  const { yearsToFI, savingRate, monthlySave, target,
          totalInterest, canSave } = state.results;
  const container = document.getElementById('insightsList');
  if (!container) return;

  const insights = [];

  // ── Tasa de ahorro ──
  if (savingRate <= 0) {
    insights.push({
      type: 'warn',
      icon: '⚠️',
      text: '<strong>Déficit mensual:</strong> tus gastos superan tus ingresos. La independencia financiera es imposible hasta reducir gastos o aumentar ingresos.',
    });
  } else if (savingRate < 10) {
    insights.push({
      type: 'warn',
      icon: '📊',
      text: `<strong>Tasa de ahorro baja (${fmtPct(savingRate)}):</strong> con menos del 10% es difícil avanzar rápido. Reducir un 5% de tus gastos podría cambiar el resultado drásticamente.`,
    });
  } else if (savingRate >= 40) {
    insights.push({
      type: 'good',
      icon: '🚀',
      text: `<strong>Tasa de ahorro élite (${fmtPct(savingRate)}):</strong> ¡Excelente! Muy pocas personas logran esto. Estás en el camino del movimiento FIRE.`,
    });
  } else if (savingRate >= 20) {
    insights.push({
      type: 'good',
      icon: '✅',
      text: `<strong>Buena tasa de ahorro (${fmtPct(savingRate)}):</strong> superas el promedio. Mantén la disciplina y el interés compuesto hará el trabajo pesado.`,
    });
  }

  // ── Interés compuesto vs aportes ──
  if (totalInterest !== null && totalInterest > 0 && yearsToFI !== null) {
    const totalContribs = monthlySave * yearsToFI * 12;
    const interestPct   = (totalInterest / (state.savings + totalContribs + totalInterest)) * 100;
    if (interestPct > 50) {
      insights.push({
        type: 'good',
        icon: '💹',
        text: `El interés compuesto generará el <strong>${fmtPct(interestPct)}</strong> de tu patrimonio final — más de la mitad vendrá de los "intereses de tus intereses". Así de poderoso es empezar ya.`,
      });
    } else if (interestPct > 30) {
      insights.push({
        type: 'info',
        icon: '📈',
        text: `El interés compuesto aportará <strong>${fmt(totalInterest, { compact: true })}</strong> adicionales — el ${fmtPct(interestPct)} de tu meta. Aumentar el rendimiento esperado (diversificando) amplificaría este efecto.`,
      });
    }
  }

  // ── Velocidad según rendimiento ──
  if (state.returnRate < 4) {
    insights.push({
      type: 'info',
      icon: '💡',
      text: '<strong>Rendimiento muy conservador:</strong> una cuenta de ahorros típica da 1-3%. Considera fondos indexados de bajo costo para mejorar el rendimiento a largo plazo.',
    });
  } else if (state.returnRate >= 10) {
    insights.push({
      type: 'warn',
      icon: '⚡',
      text: '<strong>Rendimiento alto (10%+):</strong> es posible, pero requiere asumir más riesgo o ser un inversor muy hábil. Asegúrate de que tu estrategia lo respalde.',
    });
  }

  // ── Tiempo hasta IF ──
  if (yearsToFI !== null) {
    if (yearsToFI <= 10) {
      insights.push({
        type: 'good',
        icon: '🏆',
        text: `<strong>¡${fmtYrs(yearsToFI)} es un tiempo extraordinario!</strong> A los ${state.age + yearsToFI} años ya podrías ser financieramente libre. Tu combinación de ahorro y rendimiento es excepcional.`,
      });
    } else if (yearsToFI >= 40) {
      insights.push({
        type: 'info',
        icon: '🌱',
        text: `El camino de ${fmtYrs(yearsToFI)} parece largo, pero recuerda: aumentar tu tasa de ahorro del ${fmtPct(savingRate)} al ${fmtPct(Math.min(savingRate + 10, 95))} podría recortar ese tiempo en años. Cada % importa.`,
      });
    }
  }

  // ── Ahorros iniciales ──
  if (state.savings === 0) {
    insights.push({
      type: 'info',
      icon: '🌟',
      text: `<strong>Empezando desde cero:</strong> el mejor momento es hoy. Con ${fmt(monthlySave)} al mes, el tiempo trabaja a tu favor. Cada mes que esperas es un mes menos de interés compuesto.`,
    });
  } else if (state.savings >= state.results.target * 0.5) {
    insights.push({
      type: 'good',
      icon: '💰',
      text: `<strong>¡Ya tienes más de la mitad de tu meta!</strong> Con ${fmt(state.savings, { compact: true })} ahorrados, estás en una posición excelente. El camino restante se acelerará por el efecto compuesto.`,
    });
  }

  // Máximo 4 insights para no sobrecargar
  const limited = insights.slice(0, 4);

  container.innerHTML = limited.map((ins, i) => `
    <div class="insight insight--${ins.type}" style="animation-delay: ${i * 80}ms">
      <span class="insight__icon" aria-hidden="true">${ins.icon}</span>
      <span>${ins.text}</span>
    </div>
  `).join('');
};


/* ============================================================
  09. SELECTOR DE MONEDA
  ============================================================ */
const initCurrencySelector = () => {
  const btns = document.querySelectorAll('.currency-btn');
  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.currency = btn.dataset.currency;
      btns.forEach((b) => {
        b.classList.toggle('currency-btn--active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      // Actualizo outputs de sliders con nueva moneda
      SLIDERS.forEach(({ id, outputId, format }) => {
        const input  = document.getElementById(id);
        const output = document.getElementById(outputId);
        if (input && output) output.textContent = format(parseFloat(input.value));
      });
      renderAll();
    });
  });
};


/* ============================================================
  10. BOTONES DE ESCENARIO
  ============================================================ */
const initScenarioBtns = () => {
  const btns = document.querySelectorAll('.scenario-btn');
  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = parseFloat(btn.dataset.value);
      setSlider('return-rate', val);
      btns.forEach((b) => b.classList.toggle('scenario-btn--active', b === btn));
    });
  });
};


/* ============================================================
  11. TOOLTIPS INFORMATIVOS
  ============================================================ */
const initTooltips = () => {
  const tipEl   = document.getElementById('floatingTip');
  const tipText = document.getElementById('tipText');
  if (!tipEl || !tipText) return;

  const show = (btn, text) => {
    tipText.textContent = text;
    const rect = btn.getBoundingClientRect();
    const tipW = 240;
    let left = rect.left + rect.width / 2 - tipW / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tipW - 8));
    tipEl.style.left   = left + 'px';
    tipEl.style.top    = (rect.top - 10 + window.scrollY) + 'px';
    tipEl.style.width  = tipW + 'px';
    tipEl.style.transform = 'translateY(-100%)';
    tipEl.classList.add('visible');
    tipEl.setAttribute('aria-hidden', 'false');
  };

  const hide = () => {
    tipEl.classList.remove('visible');
    tipEl.setAttribute('aria-hidden', 'true');
  };

  document.querySelectorAll('.input-group__info').forEach((btn) => {
    const text = btn.dataset.tip;
    btn.addEventListener('mouseenter', () => show(btn, text));
    btn.addEventListener('focus',      () => show(btn, text));
    btn.addEventListener('mouseleave', hide);
    btn.addEventListener('blur',       hide);
  });
};


/* ============================================================
  12. BOTÓN DE COMPARTIR
  Genera un texto con el resultado y lo copia al portapapeles.
  ============================================================ */
const initShareBtn = () => {
  const btn   = document.getElementById('shareBtn');
  const toast = document.getElementById('shareToast');
  if (!btn || !toast) return;

  btn.addEventListener('click', async () => {
    const { yearsToFI, ageAtFI, target, savingRate } = state.results;
    const text = yearsToFI !== null
      ? `📊 Mi calculadora de Independencia Financiera | El Mundo de Manu\n\n` +
        `🎯 Alcanzaré la IF en ${fmtYrs(yearsToFI)} (a los ${ageAtFI} años)\n` +
        `💰 Patrimonio objetivo: ${fmt(target)}\n` +
        `📈 Tasa de ahorro: ${fmtPct(savingRate)}\n\n` +
        `Calcula el tuyo gratis → elmundodemanu.com`
      : `Calcula tu independencia financiera gratis en El Mundo de Manu → elmundodemanu.com`;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback para navegadores sin clipboard API
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  });
};


/* ============================================================
  13. SMOOTH SCROLL AL CALCULATOR
  ============================================================ */
const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
};


/* ============================================================
  RENDER ALL — orquesta toda la actualización de UI
  ============================================================ */
const renderAll = () => {
  renderKPIs();
  renderMilestones();
  renderInsights();
  Chart.refresh();
};

/**
 * Se llama cada vez que cambia cualquier input.
 * Recalcula todo y actualiza el UI.
 */
const onStateChange = () => {
  calculate();
  renderAll();
};


/* ============================================================
  INICIALIZACIÓN
  ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  Chart.init();
  initSliders();
  initCurrencySelector();
  initScenarioBtns();
  initTooltips();
  initShareBtn();
  initSmoothScroll();

  // Calculo inicial con los valores por defecto
  calculate();
  renderAll();

  console.log(
    '%c 💹 Calculadora IF — El Mundo de Manu ',
    'background: #16C784; color: #061A0E; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 4px;'
  );
});
