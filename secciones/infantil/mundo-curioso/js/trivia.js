/* ═══════════════════════════════════════════════════════════════
   TRIVIA.JS — Lógica completa del mini-juego Trivia Curiosa
   ─────────────────────────────────────────────────────────────
   Este archivo maneja todo el flujo del juego de trivia:
   1. Pantalla de selección de categoría y dificultad
   2. El juego en sí: preguntas, opciones, feedback
   3. Panel de dato curioso post-respuesta
   4. Pantalla final con estadísticas
   
   La data viene de data.js (TRIVIA_DATA, MENSAJES_CORRECTO, etc.)
   Los sonidos vienen de audio.js
   
   — Carlos Turizo / El Mundo de Manu
═══════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────
// ESTADO DEL JUEGO
// Centralizo todo el estado en un objeto para que sea
// fácil de leer y reiniciar.
// ─────────────────────────────────────────────────────────────
const estadoTrivia = {
  categoriaSeleccionada: null,    // ID de la categoría elegida
  dificultadSeleccionada: null,   // ID de la dificultad elegida
  preguntas: [],                  // Array de preguntas de esta partida
  indiceActual: 0,                // Qué pregunta estamos mostrando
  puntaje: 0,                     // Puntos acumulados en esta partida
  correctas: 0,                   // Contador de aciertos
  incorrectas: 0,                 // Contador de errores
  respondida: false               // Flag para evitar doble clic
};

// ─────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// Al cargar la página, construyo las pantallas de selección
// ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  cargarTemaGuardado();   // Aplico el tema oscuro/claro del usuario
  construirSelector();    // Construyo las opciones de la pantalla 1
});

// ─────────────────────────────────────────────────────────────
// cargarTemaGuardado — Aplico la preferencia de tema guardada
// ─────────────────────────────────────────────────────────────
function cargarTemaGuardado() {
  const tema = localStorage.getItem("mundicurioso_tema") || "dark";
  document.documentElement.setAttribute("data-theme", tema);
}

// ─────────────────────────────────────────────────────────────
// construirSelector — Genero las tarjetas de categoría y
// los botones de dificultad desde los datos del data.js
// ─────────────────────────────────────────────────────────────
function construirSelector() {
  const categoriaGrid  = document.getElementById("categoriaGrid");
  const dificultadGrid = document.getElementById("dificultadGrid");

  // ── Tarjetas de categoría ──────────────────────────────
  TRIVIA_CATEGORIAS.forEach(catId => {
    const cat = TRIVIA_DATA[catId];
    const btn = document.createElement("button");
    btn.className = "selector-btn";
    btn.setAttribute("data-id", catId);
    btn.setAttribute("aria-pressed", "false");
    btn.innerHTML = `
      <span class="selector-btn__emoji">${cat.emoji}</span>
      <span class="selector-btn__label">${cat.label}</span>
      <span class="selector-btn__sub">${cat.preguntas.length} preguntas</span>
    `;
    btn.addEventListener("click", () => seleccionarCategoria(catId, btn));
    categoriaGrid.appendChild(btn);
  });

  // ── Botones de dificultad ──────────────────────────────
  TRIVIA_DIFICULTADES.forEach(dif => {
    const btn = document.createElement("button");
    btn.className = "selector-btn";
    btn.setAttribute("data-id", dif.id);
    btn.setAttribute("aria-pressed", "false");
    btn.innerHTML = `
      <span class="selector-btn__emoji">${dif.emoji}</span>
      <span class="selector-btn__label">${dif.label}</span>
      <span class="selector-btn__sub">${dif.desc}</span>
    `;
    btn.addEventListener("click", () => seleccionarDificultad(dif.id, btn));
    dificultadGrid.appendChild(btn);
  });
}

// ─────────────────────────────────────────────────────────────
// seleccionarCategoria — Marco la categoría elegida visualmente
// y la guardo en el estado
// ─────────────────────────────────────────────────────────────
function seleccionarCategoria(id, btnEl) {
  if (typeof playClick === "function") playClick();

  // Limpio selección anterior
  document.querySelectorAll("#categoriaGrid .selector-btn").forEach(b => {
    b.classList.remove("active");
    b.setAttribute("aria-pressed", "false");
  });

  // Marco el nuevo seleccionado
  btnEl.classList.add("active");
  btnEl.setAttribute("aria-pressed", "true");
  estadoTrivia.categoriaSeleccionada = id;

  verificarListoParaIniciar();
}

// ─────────────────────────────────────────────────────────────
// seleccionarDificultad — Lo mismo para la dificultad
// ─────────────────────────────────────────────────────────────
function seleccionarDificultad(id, btnEl) {
  if (typeof playClick === "function") playClick();

  document.querySelectorAll("#dificultadGrid .selector-btn").forEach(b => {
    b.classList.remove("active");
    b.setAttribute("aria-pressed", "false");
  });

  btnEl.classList.add("active");
  btnEl.setAttribute("aria-pressed", "true");
  estadoTrivia.dificultadSeleccionada = id;

  verificarListoParaIniciar();
}

// ─────────────────────────────────────────────────────────────
// verificarListoParaIniciar — Habilita el botón de inicio
// solo cuando se han seleccionado categoría Y dificultad
// ─────────────────────────────────────────────────────────────
function verificarListoParaIniciar() {
  const listo = estadoTrivia.categoriaSeleccionada !== null
             && estadoTrivia.dificultadSeleccionada !== null;
  document.getElementById("btnIniciar").disabled = !listo;
}

// ─────────────────────────────────────────────────────────────
// iniciarTrivia — Preparo y comienzo el juego
// Se llama al hacer clic en "¡Empezar!"
// ─────────────────────────────────────────────────────────────
function iniciarTrivia() {
  if (typeof playClick === "function") playClick();

  const cat = TRIVIA_DATA[estadoTrivia.categoriaSeleccionada];
  const dif = TRIVIA_DIFICULTADES.find(d => d.id === estadoTrivia.dificultadSeleccionada);

  // Filtro las preguntas según dificultad y mezclo el orden
  const preguntasFiltradas = cat.preguntas.filter(dif.filtro);
  estadoTrivia.preguntas   = mezclarArray([...preguntasFiltradas]);

  // Limito a máximo 10 preguntas por partida
  estadoTrivia.preguntas = estadoTrivia.preguntas.slice(0, 10);

  // Reinicio contadores
  estadoTrivia.indiceActual = 0;
  estadoTrivia.puntaje      = 0;
  estadoTrivia.correctas    = 0;
  estadoTrivia.incorrectas  = 0;
  estadoTrivia.respondida   = false;

  // Cambio a la pantalla del juego
  cambiarPantalla("screenGame");

  // Muestro la primera pregunta
  mostrarPregunta();
}

// ─────────────────────────────────────────────────────────────
// mostrarPregunta — Renderizo la pregunta actual en pantalla
// ─────────────────────────────────────────────────────────────
function mostrarPregunta() {
  const pregunta = estadoTrivia.preguntas[estadoTrivia.indiceActual];
  const total    = estadoTrivia.preguntas.length;
  const indice   = estadoTrivia.indiceActual;
  const cat      = TRIVIA_DATA[estadoTrivia.categoriaSeleccionada];

  // Actualizo la barra de progreso
  const porcentaje = (indice / total) * 100;
  document.getElementById("triviaProgressFill").style.width = porcentaje + "%";
  document.getElementById("triviaProgressText").textContent = `${indice + 1} / ${total}`;

  // Actualizo el badge de categoría
  document.getElementById("questionCategory").innerHTML =
    `${cat.emoji} ${cat.label}`;

  // Muestro el texto de la pregunta con animación (la reseteo forzando reflow)
  const cardEl = document.getElementById("questionCard");
  cardEl.classList.remove("trivia-question-card");
  void cardEl.offsetWidth; // fuerzo reflow
  cardEl.classList.add("trivia-question-card");
  document.getElementById("questionText").textContent = pregunta.question;

  // Genero las opciones de respuesta
  construirOpciones(pregunta);

  // Escondo el panel de dato curioso
  document.getElementById("factPanel").classList.add("hidden");

  // Marco como no respondida
  estadoTrivia.respondida = false;
}

// ─────────────────────────────────────────────────────────────
// construirOpciones — Genero los botones de respuesta
// Mezclo las opciones para que no estén siempre en el mismo orden
// ─────────────────────────────────────────────────────────────
function construirOpciones(pregunta) {
  const grid = document.getElementById("optionsGrid");
  grid.innerHTML = ""; // Limpio las anteriores

  // Creo array con índices mezclados para randomizar el orden
  const indices   = mezclarArray([0, 1, 2, 3]);
  const letras    = ["A", "B", "C", "D"];

  indices.forEach((opcionIndex, posicion) => {
    const btn = document.createElement("button");
    btn.className = "trivia-option";
    btn.setAttribute("data-index", opcionIndex);
    btn.setAttribute("aria-label", `Opción ${letras[posicion]}: ${pregunta.options[opcionIndex]}`);

    btn.innerHTML = `
      <span class="trivia-option__letter">${letras[posicion]}</span>
      <span>${pregunta.options[opcionIndex]}</span>
    `;

    // Agrego el evento de clic para validar la respuesta
    btn.addEventListener("click", () => validarRespuesta(opcionIndex, btn, pregunta));
    grid.appendChild(btn);
  });
}

// ─────────────────────────────────────────────────────────────
// validarRespuesta — Evalúo si la respuesta seleccionada
// es correcta y aplico el feedback visual y de audio
// ─────────────────────────────────────────────────────────────
function validarRespuesta(indiceRespuesta, btnClickeado, pregunta) {
  // Evito que hagan clic múltiple mientras se procesa
  if (estadoTrivia.respondida) return;
  estadoTrivia.respondida = true;

  const esCorrecta = indiceRespuesta === pregunta.correct;

  // Deshabilito todos los botones de opciones
  const todosLosBotones = document.querySelectorAll(".trivia-option");
  todosLosBotones.forEach(btn => {
    btn.disabled = true;
    // Marco la opción correcta siempre, así el niño ve cuál era
    if (parseInt(btn.getAttribute("data-index")) === pregunta.correct) {
      btn.classList.add("correct");
    }
  });

  if (esCorrecta) {
    // ── Respuesta CORRECTA ──────────────────────────────
    btnClickeado.classList.add("correct");
    estadoTrivia.correctas++;
    estadoTrivia.puntaje += 10; // 10 puntos por pregunta correcta

    // Actualizo el marcador visible
    document.getElementById("scoreDisplay").textContent = estadoTrivia.puntaje;

    // Sonido de acierto
    if (typeof playCorrect === "function") playCorrect();

    // Animación de celebración
    mostrarCelebracion();

    // Mensaje aleatorio de ánimo
    const msg = MENSAJES_CORRECTO[Math.floor(Math.random() * MENSAJES_CORRECTO.length)];
    mostrarToast(msg, "correct");

  } else {
    // ── Respuesta INCORRECTA ────────────────────────────
    btnClickeado.classList.add("wrong");
    estadoTrivia.incorrectas++;

    // Sonido de error
    if (typeof playWrong === "function") playWrong();

    // Mensaje de ánimo aleatorio
    const msg = MENSAJES_INCORRECTO[Math.floor(Math.random() * MENSAJES_INCORRECTO.length)];
    mostrarToast(msg, "wrong");
  }

  // Muestro el dato curioso (siempre, sin importar si acertó)
  setTimeout(() => {
    mostrarDatoCurioso(pregunta.fact);
  }, 600);
}

// ─────────────────────────────────────────────────────────────
// mostrarDatoCurioso — Muestra el panel con el fact educativo
// ─────────────────────────────────────────────────────────────
function mostrarDatoCurioso(fact) {
  document.getElementById("factText").textContent = fact;

  const panel = document.getElementById("factPanel");
  panel.classList.remove("hidden");

  // Cambio el texto del botón en la última pregunta
  const esUltima = estadoTrivia.indiceActual >= estadoTrivia.preguntas.length - 1;
  const btnSig   = document.getElementById("btnSiguiente");
  btnSig.textContent = esUltima ? "Ver mis resultados 🏆" : "Siguiente pregunta →";
}

// ─────────────────────────────────────────────────────────────
// siguientePregunta — Avanzo a la siguiente pregunta
// o muestro el resultado final si ya terminaron
// ─────────────────────────────────────────────────────────────
function siguientePregunta() {
  if (typeof playClick === "function") playClick();

  estadoTrivia.indiceActual++;

  if (estadoTrivia.indiceActual >= estadoTrivia.preguntas.length) {
    // Ya no hay más preguntas → muestro el resultado final
    mostrarFinal();
  } else {
    // Muestro la siguiente pregunta
    mostrarPregunta();
    // Hago scroll al inicio del card para móviles
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// ─────────────────────────────────────────────────────────────
// mostrarFinal — Construyo y muestro la pantalla de resultados
// ─────────────────────────────────────────────────────────────
function mostrarFinal() {
  const { puntaje, correctas, incorrectas, preguntas } = estadoTrivia;
  const total    = preguntas.length;
  const porcentaje = Math.round((correctas / total) * 100);

  // Determino el emoji y mensaje según el desempeño
  let emoji, titulo, mensaje;
  if (porcentaje === 100) {
    emoji   = "🏆";
    titulo  = "¡Perfección total!";
    mensaje = "¡Respondiste todo correctamente! ¡Eres un genio! 🌟";
  } else if (porcentaje >= 70) {
    emoji   = "🌟";
    titulo  = "¡Muy bien hecho!";
    mensaje = `¡Acertaste ${correctas} de ${total} preguntas! ¡Sigue así! 💪`;
  } else if (porcentaje >= 40) {
    emoji   = "😊";
    titulo  = "¡Buen intento!";
    mensaje = `Acertaste ${correctas} de ${total}. ¡Practica y mejorarás! 📚`;
  } else {
    emoji   = "💪";
    titulo  = "¡Sigue practicando!";
    mensaje = `Solo ${correctas} de ${total}. ¡Cada error nos enseña algo nuevo! 🌱`;
  }

  // Relleno la pantalla de fin
  document.getElementById("endEmoji").textContent    = emoji;
  document.getElementById("endTitle").textContent    = titulo;
  document.getElementById("endMsg").textContent      = mensaje;
  document.getElementById("endCorrect").textContent  = correctas;
  document.getElementById("endWrong").textContent    = incorrectas;
  document.getElementById("endScore").textContent    = puntaje + " ⭐";

  // Guardo el puntaje en localStorage para el hub
  guardarPuntaje(puntaje);

  // Cambio a la pantalla final
  cambiarPantalla("screenEnd");

  // Sonido de victoria si le fue bien
  if (porcentaje >= 70 && typeof playVictory === "function") {
    setTimeout(playVictory, 300);
  }

  // Hago scroll al inicio
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─────────────────────────────────────────────────────────────
// repetirTrivia — Vuelvo al selector para jugar de nuevo
// ─────────────────────────────────────────────────────────────
function repetirTrivia() {
  if (typeof playClick === "function") playClick();

  // Reinicio el estado completamente
  estadoTrivia.categoriaSeleccionada  = null;
  estadoTrivia.dificultadSeleccionada = null;

  // Desmarco los botones del selector
  document.querySelectorAll(".selector-btn").forEach(b => {
    b.classList.remove("active");
    b.setAttribute("aria-pressed", "false");
  });
  document.getElementById("btnIniciar").disabled = true;
  document.getElementById("scoreDisplay").textContent = "0";

  cambiarPantalla("screenSelector");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─────────────────────────────────────────────────────────────
// guardarPuntaje — Persisto el puntaje en localStorage
// para que el hub lo muestre en las tarjetas
// ─────────────────────────────────────────────────────────────
function guardarPuntaje(puntaje) {
  try {
    const scores = JSON.parse(localStorage.getItem("mundicurioso_scores") || "{}");
    // Guardo el mayor puntaje obtenido (no sobreescribo si fue mejor antes)
    scores.trivia = Math.max(scores.trivia || 0, puntaje);
    localStorage.setItem("mundicurioso_scores", JSON.stringify(scores));
  } catch (e) {
    console.warn("No pude guardar el puntaje:", e);
  }
}

// ─────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────

// cambiarPantalla — Oculta todas las pantallas y muestra la pedida
function cambiarPantalla(idPantalla) {
  ["screenSelector", "screenGame", "screenEnd"].forEach(id => {
    document.getElementById(id).classList.add("hidden");
  });
  document.getElementById(idPantalla).classList.remove("hidden");
}

// mezclarArray — Algoritmo Fisher-Yates para mezclar arrays
// Lo uso para randomizar preguntas y opciones
function mezclarArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// mostrarCelebracion — Animación de burst de emoji al acertar
function mostrarCelebracion() {
  const overlay = document.getElementById("celebrationOverlay");
  const burst   = document.getElementById("celebrationBurst");

  // Emojis de celebración rotativos
  const emojis = ["🎉", "🌟", "✨", "🏆", "💥", "🎯", "🚀", "⭐"];
  burst.textContent = emojis[Math.floor(Math.random() * emojis.length)];

  overlay.classList.add("show");
  setTimeout(() => overlay.classList.remove("show"), 700);
}

// ─────────────────────────────────────────────────────────────
// mostrarToast — Mensaje flotante breve de feedback
// tipo: 'correct' | 'wrong' | 'info'
// ─────────────────────────────────────────────────────────────
let toastTimeout = null;

function mostrarToast(mensaje, tipo = "info") {
  const toast = document.getElementById("toastMsg");
  toast.textContent = mensaje;
  toast.className   = `toast toast--${tipo} show`;

  // Limpió el timeout anterior si existía
  if (toastTimeout) clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.className = "toast";
  }, 2500);
}
