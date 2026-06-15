/* ═══════════════════════════════════════════════════════════════
   CONECTA.JS — Lógica completa del mini-juego Conecta y Aprende
   ─────────────────────────────────────────────────────────────
   Este es el juego más complejo del proyecto porque implemento
   dos modos de interacción en uno:
   
   MODO ESCRITORIO (drag & drop):
     - El usuario arrastra una tarjeta de la columna izquierda
     - La suelta sobre una tarjeta de la columna derecha
     - Una línea animada sigue al cursor mientras arrastra
   
   MODO MÓVIL (tap-to-connect):
     - Toca una tarjeta de la izquierda → queda seleccionada
     - Luego toca una de la derecha → se forma la conexión
     - Detecta automáticamente si es móvil por el ancho de pantalla
   
   FLUJO GENERAL:
     1. Selector de tema (4 sets disponibles en data.js)
     2. Juego: el usuario conecta todos los pares del set
     3. Pantalla intermedia: feedback par a par (correcto/incorrecto)
     4. Si hay más sets → siguiente set
     5. Al terminar todos → pantalla final con puntaje
   
   El jugador puede jugar todos los sets en una sola sesión
   o solo algunos — guarda el mejor acumulado en localStorage.
   
   — Carlos Turizo / El Mundo de Manu
═══════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────
// ESTADO GLOBAL DEL JUEGO
// ─────────────────────────────────────────────────────────────
const estadoCon = {
  // Selección y progreso de sets
  setSeleccionado:   null,    // índice del set elegido en CONECTA_DATA
  setsJugados:       [],      // índices de sets ya jugados en esta sesión

  // Estado del set activo
  paresActuales:     [],      // pares del set activo (shuffled)
  conexiones:        {},      // mapa { leftId → rightId } de lo que conectó el usuario
  puntajeSet:        0,       // puntos del set actual
  puntajeTotal:      0,       // puntos acumulados de todos los sets
  correctasTotal:    0,       // aciertos acumulados
  fallosTotal:       0,       // errores acumulados

  // Estado de la interacción
  modoMovil:         false,   // true si detecté pantalla pequeña
  dragging:          null,    // { leftId, element } carta que estoy arrastrando
  seleccionado:      null,    // leftId seleccionado en modo tap (móvil)
  startX:            0,       // posición inicial del drag
  startY:            0,
};

// ─────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  cargarTemaGuardado();
  detectarModoMovil();
  construirSelectorTemas();
  actualizarInstruccion();

  // Escucho cambios de tamaño de ventana para actualizar modo
  window.addEventListener("resize", () => {
    detectarModoMovil();
    actualizarInstruccion();
  });
});

function cargarTemaGuardado() {
  const tema = localStorage.getItem("mundicurioso_tema") || "dark";
  document.documentElement.setAttribute("data-theme", tema);
}

// Detecto si el usuario está en móvil por el ancho de pantalla
function detectarModoMovil() {
  estadoCon.modoMovil = window.innerWidth <= 640;
}

function actualizarInstruccion() {
  const el = document.getElementById("instruccion");
  if (!el) return;
  if (estadoCon.modoMovil) {
    el.innerHTML = `👆 <strong>Toca</strong> un término de la izquierda, luego <strong>toca</strong> su par de la derecha`;
  } else {
    el.innerHTML = `🖱️ <strong>Arrastra</strong> un término de la izquierda y <strong>suéltalo</strong> sobre su par de la derecha`;
  }
}

// ─────────────────────────────────────────────────────────────
// SELECTOR DE TEMAS
// Construyo las tarjetas de tema desde CONECTA_DATA
// ─────────────────────────────────────────────────────────────
function construirSelectorTemas() {
  const grid = document.getElementById("temaGrid");
  if (!grid) return;
  grid.innerHTML = "";

  CONECTA_DATA.forEach((set, index) => {
    const btn = document.createElement("button");
    btn.className = "selector-btn";
    btn.setAttribute("data-index", index);
    btn.setAttribute("aria-pressed", "false");
    btn.innerHTML = `
      <span class="selector-btn__emoji">${set.emoji}</span>
      <span class="selector-btn__label">${set.tema}</span>
      <span class="selector-btn__sub">${set.pares.length} conexiones</span>
    `;
    btn.addEventListener("click", () => seleccionarTema(index, btn));
    grid.appendChild(btn);
  });
}

// ─────────────────────────────────────────────────────────────
// seleccionarTema — Marco el tema elegido en el selector
// ─────────────────────────────────────────────────────────────
function seleccionarTema(index, btnEl) {
  if (typeof playClick === "function") playClick();

  document.querySelectorAll("#temaGrid .selector-btn").forEach(b => {
    b.classList.remove("active");
    b.setAttribute("aria-pressed", "false");
  });

  btnEl.classList.add("active");
  btnEl.setAttribute("aria-pressed", "true");
  estadoCon.setSeleccionado = index;
  document.getElementById("btnIniciar").disabled = false;
}

// ─────────────────────────────────────────────────────────────
// iniciarConecta — Preparo el set y empiezo el juego
// ─────────────────────────────────────────────────────────────
function iniciarConecta() {
  if (typeof playClick === "function") playClick();

  // Reinicio el estado del set actual
  estadoCon.conexiones    = {};
  estadoCon.puntajeSet    = 0;
  estadoCon.dragging      = null;
  estadoCon.seleccionado  = null;

  // Si es la primera vez (o reinicio total), limpio acumulados
  if (estadoCon.setsJugados.length === 0) {
    estadoCon.puntajeTotal   = 0;
    estadoCon.correctasTotal = 0;
    estadoCon.fallosTotal    = 0;
  }

  estadoCon.setsJugados.push(estadoCon.setSeleccionado);

  const set = CONECTA_DATA[estadoCon.setSeleccionado];

  // Mezclo los pares para que las posiciones sean aleatorias
  estadoCon.paresActuales = mezclarArray([...set.pares]);

  // Actualizo el encabezado del tema
  document.getElementById("temaEmoji").textContent         = set.emoji;
  document.getElementById("temaTitulo").textContent        = set.tema;
  document.getElementById("conexionesTotalDisplay").textContent = set.pares.length;
  document.getElementById("conexionesDisplay").textContent  = 0;
  document.getElementById("scoreDisplay").textContent       = estadoCon.puntajeTotal;

  // Construyo el tablero de conexiones
  construirTableroConecta();

  cambiarPantalla("screenGame");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─────────────────────────────────────────────────────────────
// construirTableroConecta — Genero las dos columnas de tarjetas
// La columna izquierda tiene los términos mezclados,
// la columna derecha tiene las definiciones TAMBIÉN mezcladas
// (distinto orden que la izquierda, para que no coincidan visualmente)
// ─────────────────────────────────────────────────────────────
function construirTableroConecta() {
  const colLeft  = document.getElementById("colLeft");
  const colRight = document.getElementById("colRight");
  colLeft.innerHTML  = "";
  colRight.innerHTML = "";

  // Mezclo la columna derecha aparte para que no esté alineada
  const paresLeft  = estadoCon.paresActuales;
  const paresRight = mezclarArray([...estadoCon.paresActuales]);

  // ── Columna izquierda (los "left") ────────────────────
  paresLeft.forEach((par, i) => {
    const card = document.createElement("div");
    card.className   = "con-card con-card--left";
    card.setAttribute("data-id", i);           // índice en paresActuales
    card.setAttribute("data-texto", par.left);
    card.setAttribute("role", "listitem");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Término: ${par.left}`);
    card.innerHTML   = `<span class="con-card__texto">${par.left}</span>`;

    // Según el modo, engancho drag&drop o tap
    if (estadoCon.modoMovil) {
      card.addEventListener("click",      () => tapIzquierda(i, card));
      card.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") tapIzquierda(i, card);
      });
    } else {
      card.addEventListener("mousedown",  e => iniciarDrag(e, i, card));
      card.addEventListener("touchstart", e => iniciarDrag(e, i, card), { passive: false });
      card.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") tapIzquierda(i, card);
      });
    }

    colLeft.appendChild(card);
  });

  // ── Columna derecha (los "right") ──────────────────────
  paresRight.forEach((par, i) => {
    // Busco el índice real de este par en paresActuales para el mapeo
    const idxReal = estadoCon.paresActuales.findIndex(p => p.right === par.right);

    const card = document.createElement("div");
    card.className   = "con-card con-card--right";
    card.setAttribute("data-id", idxReal);     // índice real para comparar
    card.setAttribute("data-texto", par.right);
    card.setAttribute("role", "listitem");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Definición: ${par.right}`);
    card.innerHTML   = `<span class="con-card__texto">${par.right}</span>`;

    // En escritorio: zona de drop
    if (!estadoCon.modoMovil) {
      card.addEventListener("mouseenter", () => highlightDrop(card, true));
      card.addEventListener("mouseleave", () => highlightDrop(card, false));
      card.addEventListener("mouseup",    () => soltarDrop(idxReal, card));
      card.addEventListener("touchend",   () => soltarDrop(idxReal, card));
    }

    // En móvil Y en escritorio con teclado: tap en derecha
    card.addEventListener("click", () => tapDerecha(idxReal, card));
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") tapDerecha(idxReal, card);
    });

    colRight.appendChild(card);
  });

  // Limpió las líneas SVG previas
  document.getElementById("linesSvg").innerHTML = "";
  document.getElementById("btnVerificar").disabled = true;
}

// ═══════════════════════════════════════════════════════════════
// INTERACCIÓN: DRAG & DROP (escritorio / touch)
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// iniciarDrag — El usuario presiona sobre una tarjeta izquierda
// ─────────────────────────────────────────────────────────────
function iniciarDrag(e, leftIdx, cardEl) {
  // Si ya está conectada, no permito rearrastrar
  if (cardEl.classList.contains("con-card--connected")) {
    // Sí permito si quieren cambiar la conexión
    desconectar(leftIdx);
  }

  estadoCon.dragging = { leftIdx, element: cardEl };
  cardEl.classList.add("dragging");

  // Posición inicial del cursor/toque
  const punto = e.touches ? e.touches[0] : e;
  estadoCon.startX = punto.clientX;
  estadoCon.startY = punto.clientY;

  // Muestro la línea de arrastre SVG
  const lineSvg = document.getElementById("dragLineSvg");
  lineSvg.classList.remove("hidden");
  actualizarLineaDrag(punto.clientX, punto.clientY);

  // Escucho movimiento y fin del drag en el documento
  document.addEventListener("mousemove", moverDrag);
  document.addEventListener("mouseup",   finDrag);
  document.addEventListener("touchmove", moverDragTouch, { passive: false });
  document.addEventListener("touchend",  finDragTouch);

  if (typeof playClick === "function") playClick();
  e.preventDefault();
}

function moverDrag(e) {
  if (!estadoCon.dragging) return;
  actualizarLineaDrag(e.clientX, e.clientY);
}

function moverDragTouch(e) {
  if (!estadoCon.dragging) return;
  e.preventDefault();
  actualizarLineaDrag(e.touches[0].clientX, e.touches[0].clientY);
}

// Actualizo la línea SVG que sigue al cursor durante el drag
function actualizarLineaDrag(cursorX, cursorY) {
  const dragLine = document.getElementById("dragLine");
  const lineSvg  = document.getElementById("dragLineSvg");

  // La línea sale desde el centro del elemento arrastrado
  if (!estadoCon.dragging) return;
  const rect = estadoCon.dragging.element.getBoundingClientRect();
  const startX = rect.right;
  const startY = rect.top + rect.height / 2;

  dragLine.setAttribute("x1", startX);
  dragLine.setAttribute("y1", startY);
  dragLine.setAttribute("x2", cursorX);
  dragLine.setAttribute("y2", cursorY);
}

function finDrag(e) {
  limpiarDrag();
  // Si no cayó en una zona de drop válida, cancelo
  const dragCard = estadoCon.dragging?.element;
  if (dragCard) dragCard.classList.remove("dragging");
  estadoCon.dragging = null;
  eliminarListenersDrag();
}

function finDragTouch(e) {
  // En touch, busco qué elemento hay debajo del dedo
  if (!estadoCon.dragging) return;
  const touch = e.changedTouches[0];
  const elAbajo = document.elementFromPoint(touch.clientX, touch.clientY);
  const cardDerecha = elAbajo?.closest(".con-card--right");

  if (cardDerecha) {
    const idxDerecha = parseInt(cardDerecha.getAttribute("data-id"));
    soltarDrop(idxDerecha, cardDerecha);
  } else {
    const dragCard = estadoCon.dragging?.element;
    if (dragCard) dragCard.classList.remove("dragging");
    estadoCon.dragging = null;
  }

  limpiarDrag();
  eliminarListenersDrag();
}

function limpiarDrag() {
  const lineSvg = document.getElementById("dragLineSvg");
  if (lineSvg) lineSvg.classList.add("hidden");
}

function eliminarListenersDrag() {
  document.removeEventListener("mousemove", moverDrag);
  document.removeEventListener("mouseup",   finDrag);
  document.removeEventListener("touchmove", moverDragTouch);
  document.removeEventListener("touchend",  finDragTouch);
}

// ─────────────────────────────────────────────────────────────
// soltarDrop — El usuario soltó sobre una tarjeta de la derecha
// ─────────────────────────────────────────────────────────────
function soltarDrop(rightIdx, cardRightEl) {
  if (!estadoCon.dragging) return;

  const leftIdx  = estadoCon.dragging.leftIdx;
  const cardLeft = estadoCon.dragging.element;

  cardLeft.classList.remove("dragging");
  estadoCon.dragging = null;
  limpiarDrag();
  eliminarListenersDrag();

  formarConexion(leftIdx, rightIdx, cardLeft, cardRightEl);
}

// ═══════════════════════════════════════════════════════════════
// INTERACCIÓN: TAP-TO-CONNECT (móvil + teclado)
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// tapIzquierda — El usuario tocó/hizo clic en un término izquierdo
// ─────────────────────────────────────────────────────────────
function tapIzquierda(leftIdx, cardEl) {
  if (typeof playClick === "function") playClick();

  // Si ya tenía uno seleccionado, lo deselecciono
  if (estadoCon.seleccionado !== null) {
    const prevCard = document.querySelector(`.con-card--left[data-id="${estadoCon.seleccionado}"]`);
    if (prevCard) prevCard.classList.remove("selected");
  }

  // Si toca la misma que ya estaba seleccionada, la deselecciono
  if (estadoCon.seleccionado === leftIdx) {
    estadoCon.seleccionado = null;
    cardEl.classList.remove("selected");
    return;
  }

  // Selecciono la nueva
  estadoCon.seleccionado = leftIdx;
  cardEl.classList.add("selected");
}

// ─────────────────────────────────────────────────────────────
// tapDerecha — El usuario tocó/hizo clic en una definición derecha
// Solo actúa si hay un término izquierdo seleccionado
// ─────────────────────────────────────────────────────────────
function tapDerecha(rightIdx, cardRightEl) {
  // En modo escritorio, solo funciona con teclado (el drag maneja el resto)
  // En modo móvil, siempre funciona
  if (!estadoCon.modoMovil && estadoCon.seleccionado === null) return;
  if (estadoCon.seleccionado === null) return;

  const leftIdx  = estadoCon.seleccionado;
  const cardLeft = document.querySelector(`.con-card--left[data-id="${leftIdx}"]`);

  // Deselecciono la izquierda
  if (cardLeft) cardLeft.classList.remove("selected");
  estadoCon.seleccionado = null;

  formarConexion(leftIdx, rightIdx, cardLeft, cardRightEl);
}

// ═══════════════════════════════════════════════════════════════
// LÓGICA DE CONEXIONES
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// formarConexion — Registro la conexión entre left y right
// Si alguno ya tenía conexión, la borro primero
// ─────────────────────────────────────────────────────────────
function formarConexion(leftIdx, rightIdx, cardLeftEl, cardRightEl) {
  // Si la derecha ya estaba usada, desconecto la anterior
  const leftAnteriorConEsaDerecha = Object.keys(estadoCon.conexiones).find(
    k => estadoCon.conexiones[k] === rightIdx
  );
  if (leftAnteriorConEsaDerecha !== undefined) {
    desconectar(parseInt(leftAnteriorConEsaDerecha));
  }

  // Si la izquierda ya tenía conexión, la borro
  if (estadoCon.conexiones[leftIdx] !== undefined) {
    desconectar(leftIdx);
  }

  // Registro la nueva conexión
  estadoCon.conexiones[leftIdx] = rightIdx;

  // Aplico estilos de "conectado" a ambas tarjetas
  if (cardLeftEl)  cardLeftEl.classList.add("con-card--connected");
  if (cardRightEl) cardRightEl.classList.add("con-card--connected");

  // Dibujo la línea SVG de conexión
  dibujarLineaConexion(leftIdx, rightIdx);

  // Sonido de drop
  if (typeof playDrop === "function") playDrop();

  // Actualizo el contador de conexiones realizadas
  const totalConectadas = Object.keys(estadoCon.conexiones).length;
  document.getElementById("conexionesDisplay").textContent = totalConectadas;

  // Habilito el botón de verificar cuando se completaron todas
  const totalPares = estadoCon.paresActuales.length;
  document.getElementById("btnVerificar").disabled = (totalConectadas < totalPares);
}

// ─────────────────────────────────────────────────────────────
// desconectar — Quito una conexión existente
// ─────────────────────────────────────────────────────────────
function desconectar(leftIdx) {
  const rightIdx = estadoCon.conexiones[leftIdx];
  if (rightIdx === undefined) return;

  // Quito estilos
  const cardLeft  = document.querySelector(`.con-card--left[data-id="${leftIdx}"]`);
  const cardRight = document.querySelector(`.con-card--right[data-id="${rightIdx}"]`);
  if (cardLeft)  cardLeft.classList.remove("con-card--connected", "correct", "wrong");
  if (cardRight) cardRight.classList.remove("con-card--connected", "correct", "wrong");

  // Borro la línea SVG de esta conexión
  const lineEl = document.getElementById(`line-${leftIdx}`);
  if (lineEl) lineEl.remove();

  delete estadoCon.conexiones[leftIdx];

  // Actualizo el contador
  document.getElementById("conexionesDisplay").textContent = Object.keys(estadoCon.conexiones).length;
  document.getElementById("btnVerificar").disabled = true;
}

// ─────────────────────────────────────────────────────────────
// reiniciarConexiones — Borra todas las conexiones actuales
// ─────────────────────────────────────────────────────────────
function reiniciarConexiones() {
  if (typeof playClick === "function") playClick();

  // Borro todas las conexiones registradas
  Object.keys(estadoCon.conexiones).forEach(leftIdx => {
    desconectar(parseInt(leftIdx));
  });

  // Limpio estilos residuales de todos los cards
  document.querySelectorAll(".con-card").forEach(c => {
    c.classList.remove("con-card--connected", "correct", "wrong", "selected", "dragging");
  });

  // Limpio el SVG de líneas
  document.getElementById("linesSvg").innerHTML = "";

  estadoCon.conexiones   = {};
  estadoCon.seleccionado = null;
  estadoCon.dragging     = null;

  document.getElementById("conexionesDisplay").textContent = 0;
  document.getElementById("btnVerificar").disabled = true;
}

// ─────────────────────────────────────────────────────────────
// dibujarLineaConexion — Dibujo una línea curva SVG entre
// la tarjeta izquierda y la derecha conectadas
// Uso una curva de Bézier para que se vea más orgánica
// ─────────────────────────────────────────────────────────────
function dibujarLineaConexion(leftIdx, rightIdx) {
  // Borro línea anterior si existía
  const lineaAnterior = document.getElementById(`line-${leftIdx}`);
  if (lineaAnterior) lineaAnterior.remove();

  const cardLeft  = document.querySelector(`.con-card--left[data-id="${leftIdx}"]`);
  const cardRight = document.querySelector(`.con-card--right[data-id="${rightIdx}"]`);
  const svg       = document.getElementById("linesSvg");

  if (!cardLeft || !cardRight || !svg) return;

  // Calculo las posiciones relativas al SVG container
  const svgRect   = svg.parentElement.getBoundingClientRect();
  const leftRect  = cardLeft.getBoundingClientRect();
  const rightRect = cardRight.getBoundingClientRect();

  const x1 = leftRect.right  - svgRect.left;
  const y1 = leftRect.top    - svgRect.top  + leftRect.height / 2;
  const x2 = rightRect.left  - svgRect.left;
  const y2 = rightRect.top   - svgRect.top  + rightRect.height / 2;

  // Puntos de control para la curva Bézier (dan una S elegante)
  const cx1 = x1 + (x2 - x1) * 0.4;
  const cx2 = x1 + (x2 - x1) * 0.6;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("id", `line-${leftIdx}`);
  path.setAttribute("d", `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`);
  path.setAttribute("stroke", "var(--color-conecta)");
  path.setAttribute("stroke-width", "2.5");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("opacity", "0.7");

  // Animación de trazo (draw-in)
  const longitud = path.getTotalLength?.() || 200;
  path.style.strokeDasharray  = longitud;
  path.style.strokeDashoffset = longitud;
  path.style.transition = "stroke-dashoffset 0.4s ease";

  svg.appendChild(path);
  // Trigger la animación después de agregar al DOM
  requestAnimationFrame(() => {
    path.style.strokeDashoffset = "0";
  });
}

// ─────────────────────────────────────────────────────────────
// highlightDrop — Resalto visualmente la zona de drop
// mientras el usuario arrastra sobre ella
// ─────────────────────────────────────────────────────────────
function highlightDrop(cardEl, activar) {
  if (!estadoCon.dragging) return;
  cardEl.classList.toggle("drop-target", activar);
}

// ═══════════════════════════════════════════════════════════════
// VERIFICACIÓN Y RESULTADOS
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// verificarConexiones — Evalúo todas las conexiones hechas
// Una conexión es correcta cuando leftIdx === rightIdx
// (porque ambos índices apuntan al mismo par en paresActuales)
// ─────────────────────────────────────────────────────────────
function verificarConexiones() {
  if (typeof playClick === "function") playClick();

  let correctas = 0;
  let errores   = 0;

  // Bloqueo todas las tarjetas para evitar cambios
  document.querySelectorAll(".con-card").forEach(c => {
    c.style.pointerEvents = "none";
  });

  // Evalúo cada conexión
  Object.entries(estadoCon.conexiones).forEach(([leftIdxStr, rightIdx]) => {
    const leftIdx   = parseInt(leftIdxStr);
    const esCorrecta = leftIdx === rightIdx;

    const cardLeft  = document.querySelector(`.con-card--left[data-id="${leftIdx}"]`);
    const cardRight = document.querySelector(`.con-card--right[data-id="${rightIdx}"]`);
    const lineEl    = document.getElementById(`line-${leftIdx}`);

    if (esCorrecta) {
      cardLeft?.classList.add("correct");
      cardRight?.classList.add("correct");
      if (lineEl) {
        lineEl.setAttribute("stroke", "var(--color-brand-teal)");
        lineEl.setAttribute("opacity", "1");
        lineEl.setAttribute("stroke-width", "3");
      }
      correctas++;
    } else {
      cardLeft?.classList.add("wrong");
      cardRight?.classList.add("wrong");
      if (lineEl) {
        lineEl.setAttribute("stroke", "var(--color-coral)");
        lineEl.setAttribute("opacity", "0.8");
      }
      errores++;
    }
  });

  // Calculo el puntaje del set: 10 por correcta, bonus por perfectas
  const puntajeBase   = correctas * 10;
  const bonusPerfecto = (errores === 0) ? 10 : 0;
  estadoCon.puntajeSet  = puntajeBase + bonusPerfecto;

  // Acumulo en el total
  estadoCon.puntajeTotal   += estadoCon.puntajeSet;
  estadoCon.correctasTotal += correctas;
  estadoCon.fallosTotal    += errores;

  // Sonido según resultado
  if (errores === 0) {
    if (typeof playVictory === "function") playVictory();
    mostrarCelebracion();
  } else if (correctas > errores) {
    if (typeof playCorrect === "function") playCorrect();
  } else {
    if (typeof playWrong === "function") playWrong();
  }

  // Actualizo el score del header
  document.getElementById("scoreDisplay").textContent = estadoCon.puntajeTotal;

  // Muestro la pantalla de resultados del set después de un momento
  setTimeout(() => construirResultadoSet(correctas, errores), 1000);
}

// ─────────────────────────────────────────────────────────────
// construirResultadoSet — Armo la pantalla de resultado del set
// ─────────────────────────────────────────────────────────────
function construirResultadoSet(correctas, errores) {
  const totalPares = estadoCon.paresActuales.length;
  const porcentaje = Math.round((correctas / totalPares) * 100);

  // Emoji y mensaje según desempeño
  let emoji, titulo, mensaje;
  if (porcentaje === 100) {
    emoji   = "🏆";
    titulo  = "¡Perfecto! ¡Todo correcto!";
    mensaje = `¡Conectaste los ${totalPares} pares sin errores! +10 puntos bonus 🎯`;
  } else if (porcentaje >= 60) {
    emoji   = "🌟";
    titulo  = "¡Muy bien!";
    mensaje = `${correctas} de ${totalPares} conexiones correctas. ¡Sigue así! 💪`;
  } else {
    emoji   = "💡";
    titulo  = "¡Sigue practicando!";
    mensaje = `${correctas} de ${totalPares} correctas. ¡Revisa las incorrectas y aprende! 📚`;
  }

  document.getElementById("setResultEmoji").textContent = emoji;
  document.getElementById("setResultTitle").textContent = titulo;
  document.getElementById("setResultMsg").textContent   = mensaje;

  // Construyo la lista de resultados par a par
  const lista = document.getElementById("resultLista");
  lista.innerHTML = "";

  estadoCon.paresActuales.forEach((par, leftIdx) => {
    const rightIdxConectado = estadoCon.conexiones[leftIdx];
    const esCorrecta = rightIdxConectado === leftIdx;
    const textoConectado = rightIdxConectado !== undefined
      ? estadoCon.paresActuales[rightIdxConectado]?.right
      : "—";

    const item = document.createElement("div");
    item.className = `con-result-item con-result-item--${esCorrecta ? "correct" : "wrong"}`;
    item.innerHTML = `
      <span class="con-result-item__icon">${esCorrecta ? "✅" : "❌"}</span>
      <div class="con-result-item__contenido">
        <span class="con-result-item__left">${par.left}</span>
        <span class="con-result-item__arrow">${esCorrecta ? "→" : "✗"}</span>
        <span class="con-result-item__right">
          ${esCorrecta ? par.right : `<s style="opacity:0.5">${textoConectado}</s> → <strong>${par.right}</strong>`}
        </span>
      </div>
    `;
    lista.appendChild(item);
  });

  // Actualizo el botón de siguiente según si hay más sets
  const hayMasSets = estadoCon.setsJugados.length < CONECTA_DATA.length;
  const btnSig     = document.getElementById("btnSiguienteSet");
  btnSig.textContent = hayMasSets ? "Siguiente tema →" : "Ver resultado final 🏆";

  cambiarPantalla("screenResultSet");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─────────────────────────────────────────────────────────────
// siguienteSet — Paso al siguiente set no jugado todavía,
// o si ya jugamos todos, muestro el resultado final
// ─────────────────────────────────────────────────────────────
function siguienteSet() {
  if (typeof playClick === "function") playClick();

  // Busco el primer set no jugado
  const siguienteIdx = CONECTA_DATA.findIndex((_, i) => !estadoCon.setsJugados.includes(i));

  if (siguienteIdx === -1) {
    // Ya jugamos todos los sets
    mostrarFinalJuego();
  } else {
    estadoCon.setSeleccionado = siguienteIdx;
    iniciarConecta();
  }
}

// ─────────────────────────────────────────────────────────────
// repetirSet — Vuelvo a intentar el mismo set
// ─────────────────────────────────────────────────────────────
function repetirSet() {
  if (typeof playClick === "function") playClick();

  // Saco el set actual de los jugados para poder repetirlo
  const idx = estadoCon.setsJugados.lastIndexOf(estadoCon.setSeleccionado);
  if (idx > -1) estadoCon.setsJugados.splice(idx, 1);

  // Resto los puntos del intento fallido
  estadoCon.puntajeTotal   -= estadoCon.puntajeSet;
  estadoCon.correctasTotal -= estadoCon.paresActuales.filter((_, i) => estadoCon.conexiones[i] === i).length;

  iniciarConecta();
}

// ─────────────────────────────────────────────────────────────
// mostrarFinalJuego — Pantalla de resultados globales
// ─────────────────────────────────────────────────────────────
function mostrarFinalJuego() {
  const { puntajeTotal, correctasTotal, fallosTotal } = estadoCon;
  const totalPosibles = CONECTA_DATA.reduce((s, set) => s + set.pares.length, 0);
  const porcentaje    = Math.round((correctasTotal / totalPosibles) * 100);

  let emoji, titulo, mensaje;
  if (porcentaje === 100) {
    emoji   = "🏆";
    titulo  = "¡Maestro de las conexiones!";
    mensaje = "¡Conectaste TODO sin errores! ¡Eres increíble! 🌟";
  } else if (porcentaje >= 75) {
    emoji   = "🌟";
    titulo  = "¡Excelente trabajo!";
    mensaje = `Acertaste ${correctasTotal} de ${totalPosibles} conexiones. ¡Muy bueno! 💪`;
  } else if (porcentaje >= 50) {
    emoji   = "😊";
    titulo  = "¡Buen intento!";
    mensaje = `${correctasTotal} de ${totalPosibles} correctas. ¡Sigue practicando! 📚`;
  } else {
    emoji   = "💪";
    titulo  = "¡Cada día mejoras!";
    mensaje = `Solo ${correctasTotal} de ${totalPosibles}. ¡No te rindas, lo lograrás! 🌱`;
  }

  document.getElementById("conEndEmoji").textContent    = emoji;
  document.getElementById("conEndTitle").textContent    = titulo;
  document.getElementById("conEndMsg").textContent      = mensaje;
  document.getElementById("conEndCorrectas").textContent = correctasTotal;
  document.getElementById("conEndFallos").textContent    = fallosTotal;
  document.getElementById("conEndScore").textContent     = puntajeTotal + " ⭐";

  guardarPuntaje(puntajeTotal);

  if (porcentaje >= 75 && typeof playVictory === "function") {
    setTimeout(playVictory, 300);
  }

  cambiarPantalla("screenEnd");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─────────────────────────────────────────────────────────────
// repetirJuego — Vuelvo al selector desde cero
// ─────────────────────────────────────────────────────────────
function repetirJuego() {
  if (typeof playClick === "function") playClick();

  // Reinicio todo el estado
  estadoCon.setSeleccionado  = null;
  estadoCon.setsJugados      = [];
  estadoCon.puntajeTotal     = 0;
  estadoCon.correctasTotal   = 0;
  estadoCon.fallosTotal      = 0;
  estadoCon.conexiones       = {};

  // Deselecciono las tarjetas del selector
  document.querySelectorAll("#temaGrid .selector-btn").forEach(b => {
    b.classList.remove("active");
    b.setAttribute("aria-pressed", "false");
  });
  document.getElementById("btnIniciar").disabled = true;
  document.getElementById("scoreDisplay").textContent = "0";

  cambiarPantalla("screenSelector");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────
function guardarPuntaje(puntaje) {
  try {
    const scores    = JSON.parse(localStorage.getItem("mundicurioso_scores") || "{}");
    scores.conecta  = Math.max(scores.conecta || 0, puntaje);
    localStorage.setItem("mundicurioso_scores", JSON.stringify(scores));
  } catch (e) {
    console.warn("No pude guardar el puntaje:", e);
  }
}

function cambiarPantalla(idPantalla) {
  ["screenSelector", "screenGame", "screenResultSet", "screenEnd"].forEach(id => {
    document.getElementById(id).classList.add("hidden");
  });
  document.getElementById(idPantalla).classList.remove("hidden");
}

function mezclarArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function mostrarCelebracion() {
  const overlay = document.getElementById("celebrationOverlay");
  const burst   = document.getElementById("celebrationBurst");
  const emojis  = ["🎉", "🌟", "✨", "🔗", "💥", "🎯", "⭐", "🥳"];
  burst.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  overlay.classList.add("show");
  setTimeout(() => overlay.classList.remove("show"), 700);
}
