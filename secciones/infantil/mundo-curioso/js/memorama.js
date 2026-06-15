/* ═══════════════════════════════════════════════════════════════
   MEMORAMA.JS — Lógica completa del mini-juego Memorama
   ─────────────────────────────────────────────────────────────
   Flujo del juego:
   1. Selector de dificultad (4, 6 u 8 pares)
   2. Se construye el tablero mezclando los pares seleccionados
   3. El jugador voltea cartas de a 2:
      - Si coinciden → par encontrado, se quedan boca arriba,
        aparece el dato curioso
      - Si no coinciden → se voltean de nuevo después de 1 seg
   4. Al completar todos los pares → pantalla de resultados
   
   El sistema de puntos tiene en cuenta:
   - Pares encontrados (10 pts c/u)
   - Eficiencia (bonus si usó pocos intentos)
   - Tiempo (bonus por velocidad)
   
   — Carlos Turizo / El Mundo de Manu
═══════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────
// ESTADO DEL JUEGO
// ─────────────────────────────────────────────────────────────
const estadoMem = {
  paresTotal:      0,       // Cuántos pares hay en esta partida
  paresEncontrados: 0,      // Cuántos pares ya encontró
  intentos:        0,       // Veces que el jugador volteó 2 cartas
  puntaje:         0,       // Puntos acumulados
  cartasVolteadas: [],      // Las 1 o 2 cartas actualmente boca arriba (por index)
  bloqueado:       false,   // Flag para bloquear clics mientras se evalúa un par
  timerInterval:   null,    // Referencia al setInterval del cronómetro
  segundos:        0,       // Tiempo transcurrido en segundos
  tablero:         []       // Array de objetos carta con su estado
};

// ─────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  cargarTemaGuardado();
});

function cargarTemaGuardado() {
  const tema = localStorage.getItem("mundicurioso_tema") || "dark";
  document.documentElement.setAttribute("data-theme", tema);
}

// ─────────────────────────────────────────────────────────────
// seleccionarDificultad — Marco la dificultad elegida
// ─────────────────────────────────────────────────────────────
let paresSeleccionados = 0;

function seleccionarDificultad(pares, btnEl) {
  if (typeof playClick === "function") playClick();

  // Desmarco la selección anterior
  document.querySelectorAll("#screenSelector .selector-btn").forEach(b => {
    b.classList.remove("active");
    b.setAttribute("aria-pressed", "false");
  });

  btnEl.classList.add("active");
  btnEl.setAttribute("aria-pressed", "true");
  paresSeleccionados = pares;

  document.getElementById("btnIniciar").disabled = false;
}

// ─────────────────────────────────────────────────────────────
// iniciarMemorama — Preparo el tablero y empiezo el juego
// ─────────────────────────────────────────────────────────────
function iniciarMemorama() {
  if (typeof playClick === "function") playClick();

  // Reinicio el estado completo
  estadoMem.paresTotal         = paresSeleccionados;
  estadoMem.paresEncontrados   = 0;
  estadoMem.intentos           = 0;
  estadoMem.puntaje            = 0;
  estadoMem.cartasVolteadas    = [];
  estadoMem.bloqueado          = false;
  estadoMem.segundos           = 0;

  // Selecciono los pares a usar (los primeros N de MEMORAMA_DATA mezclados)
  const paresDisponibles = mezclarArray([...MEMORAMA_DATA]).slice(0, paresSeleccionados);

  // Construyo el tablero: cada par genera DOS cartas con el mismo id de par
  estadoMem.tablero = construirTablero(paresDisponibles);

  // Actualizo el display de info
  document.getElementById("paresTotalDisplay").textContent = paresSeleccionados;
  document.getElementById("paresDisplay").textContent      = 0;
  document.getElementById("intentosDisplay").textContent   = 0;
  document.getElementById("timerDisplay").textContent      = "0s";
  document.getElementById("scoreDisplay").textContent      = 0;

  // Renderizo el tablero HTML
  renderizarTablero();

  // Cambio a la pantalla de juego
  cambiarPantalla("screenGame");

  // Inicio el cronómetro
  iniciarTimer();

  // Scroll al inicio
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─────────────────────────────────────────────────────────────
// construirTablero — Genero el array de cartas para el tablero
// Cada par de datos genera 2 cartas idénticas (mismo parId),
// luego mezclo todo para que queden en posiciones aleatorias.
// ─────────────────────────────────────────────────────────────
function construirTablero(pares) {
  const cartas = [];

  pares.forEach(par => {
    // Creo la carta A (primera del par)
    cartas.push({
      uid:       par.id + "_a",   // Identificador único de esta carta
      parId:     par.id,          // ID del par (igual en las dos cartas)
      emoji:     par.emoji,
      label:     par.label,
      fact:      par.fact,
      volteada:  false,           // Empieza boca abajo
      emparejada: false           // Empieza sin par encontrado
    });

    // Creo la carta B (segunda del par, idéntica en datos)
    cartas.push({
      uid:       par.id + "_b",
      parId:     par.id,
      emoji:     par.emoji,
      label:     par.label,
      fact:      par.fact,
      volteada:  false,
      emparejada: false
    });
  });

  // Mezclo las cartas para que los pares no estén juntos
  return mezclarArray(cartas);
}

// ─────────────────────────────────────────────────────────────
// renderizarTablero — Construyo el HTML del tablero de cartas
// ─────────────────────────────────────────────────────────────
function renderizarTablero() {
  const board = document.getElementById("memBoard");
  board.innerHTML = "";

  // Ajusto las columnas según la cantidad de cartas
  const totalCartas = estadoMem.tablero.length;
  if (totalCartas <= 8) {
    board.style.gridTemplateColumns = "repeat(4, 1fr)";
  } else if (totalCartas <= 12) {
    board.style.gridTemplateColumns = "repeat(4, 1fr)";
  } else {
    board.style.gridTemplateColumns = "repeat(4, 1fr)";
  }

  estadoMem.tablero.forEach((carta, index) => {
    const cartaEl = document.createElement("div");
    cartaEl.className       = "mem-card";
    cartaEl.setAttribute("data-index", index);
    cartaEl.setAttribute("role", "listitem");
    cartaEl.setAttribute("aria-label", `Carta ${index + 1}, boca abajo`);
    cartaEl.setAttribute("tabindex", "0");

    // Estructura de la carta con flip 3D
    cartaEl.innerHTML = `
      <div class="mem-card__inner">
        <!-- Cara posterior (lo que ve el jugador mientras está oculta) -->
        <div class="mem-card__back" aria-hidden="true">
          <span class="mem-card__back-icon">🌍</span>
        </div>
        <!-- Cara frontal (el emoji del elemento) -->
        <div class="mem-card__front" aria-hidden="true">
          <span class="mem-card__emoji">${carta.emoji}</span>
          <span class="mem-card__label">${carta.label}</span>
        </div>
      </div>
    `;

    // Evento de clic para voltear la carta
    cartaEl.addEventListener("click", () => voltearCarta(index));
    // Evento de teclado para accesibilidad
    cartaEl.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        voltearCarta(index);
      }
    });

    board.appendChild(cartaEl);
  });
}

// ─────────────────────────────────────────────────────────────
// voltearCarta — Maneja el clic en una carta
// Aquí está el corazón de la lógica del memorama
// ─────────────────────────────────────────────────────────────
function voltearCarta(index) {
  // Ignoro el clic si:
  // - El juego está bloqueado (evaluando un par)
  // - La carta ya está emparejada
  // - La carta ya está volteada (no tiene sentido voltearla de nuevo)
  // - Ya hay 2 cartas volteadas esperando evaluación
  if (estadoMem.bloqueado) return;

  const carta = estadoMem.tablero[index];
  if (carta.emparejada) return;
  if (carta.volteada) return;
  if (estadoMem.cartasVolteadas.length >= 2) return;

  // Volteo la carta en el estado
  carta.volteada = true;
  estadoMem.cartasVolteadas.push(index);

  // Aplico la clase CSS de "volteada" para la animación flip
  const cartaEl = document.querySelector(`.mem-card[data-index="${index}"]`);
  cartaEl.classList.add("flipped");
  cartaEl.setAttribute("aria-label", `Carta: ${carta.label}`);

  // Sonido de voltear
  if (typeof playFlip === "function") playFlip();

  // Si ya hay 2 cartas volteadas, evalúo el par
  if (estadoMem.cartasVolteadas.length === 2) {
    estadoMem.intentos++;
    document.getElementById("intentosDisplay").textContent = estadoMem.intentos;

    // Espero un momento para que el jugador vea las dos cartas
    estadoMem.bloqueado = true;
    setTimeout(() => evaluarPar(), 900);
  }
}

// ─────────────────────────────────────────────────────────────
// evaluarPar — Comparo las 2 cartas volteadas
// ─────────────────────────────────────────────────────────────
function evaluarPar() {
  const [idxA, idxB] = estadoMem.cartasVolteadas;
  const cartaA = estadoMem.tablero[idxA];
  const cartaB = estadoMem.tablero[idxB];

  const cartaElA = document.querySelector(`.mem-card[data-index="${idxA}"]`);
  const cartaElB = document.querySelector(`.mem-card[data-index="${idxB}"]`);

  if (cartaA.parId === cartaB.parId) {
    // ── ¡PAR ENCONTRADO! ──────────────────────────────────
    cartaA.emparejada = true;
    cartaB.emparejada = true;

    // Aplico estado visual de "encontrado" con pequeño delay escalonado
    setTimeout(() => cartaElA.classList.add("matched"), 0);
    setTimeout(() => cartaElB.classList.add("matched"), 100);

    estadoMem.paresEncontrados++;
    estadoMem.puntaje += 10;

    // Actualizo displays
    document.getElementById("paresDisplay").textContent  = estadoMem.paresEncontrados;
    document.getElementById("scoreDisplay").textContent  = estadoMem.puntaje;

    // Sonido de par encontrado
    if (typeof playMatch === "function") playMatch();

    // Animación de celebración
    mostrarCelebracion();

    // Muestro el dato curioso del par
    setTimeout(() => mostrarFactPar(cartaA.fact), 400);

  } else {
    // ── PAR NO COINCIDE — vuelvo las cartas boca abajo ───
    cartaA.volteada = false;
    cartaB.volteada = false;

    cartaElA.classList.remove("flipped");
    cartaElB.classList.remove("flipped");
    cartaElA.setAttribute("aria-label", `Carta ${idxA + 1}, boca abajo`);
    cartaElB.setAttribute("aria-label", `Carta ${idxB + 1}, boca abajo`);

    // Aplico un "sacudida" visual para indicar que no coincidieron
    cartaElA.classList.add("shake");
    cartaElB.classList.add("shake");
    setTimeout(() => {
      cartaElA.classList.remove("shake");
      cartaElB.classList.remove("shake");
    }, 500);

    // Sonido de error
    if (typeof playWrong === "function") playWrong();

    // Desbloqueo inmediatamente (ya se voltearon)
    estadoMem.bloqueado = false;
  }

  // Limpio las cartas volteadas para el siguiente turno
  estadoMem.cartasVolteadas = [];
}

// ─────────────────────────────────────────────────────────────
// mostrarFactPar — Muestro el dato curioso del par encontrado
// El juego se pausa mientras se muestra el panel
// ─────────────────────────────────────────────────────────────
function mostrarFactPar(fact) {
  document.getElementById("memFactText").textContent = fact;

  const panel = document.getElementById("memFactPanel");
  panel.classList.remove("hidden");

  // Pauso el timer mientras el niño lee el dato curioso
  detenerTimer();

  // Scroll suave al panel de fact en móviles
  panel.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ─────────────────────────────────────────────────────────────
// cerrarFact — El jugador cierra el panel del dato curioso
// y el juego continúa (o termina si fue el último par)
// ─────────────────────────────────────────────────────────────
function cerrarFact() {
  if (typeof playClick === "function") playClick();

  document.getElementById("memFactPanel").classList.add("hidden");
  estadoMem.bloqueado = false;

  // Verifico si ya se completó el tablero
  if (estadoMem.paresEncontrados >= estadoMem.paresTotal) {
    setTimeout(() => mostrarFinal(), 300);
  } else {
    // Reanudo el cronómetro
    iniciarTimer();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// ─────────────────────────────────────────────────────────────
// CRONÓMETRO
// ─────────────────────────────────────────────────────────────
function iniciarTimer() {
  // Evito crear múltiples intervals
  if (estadoMem.timerInterval) return;

  estadoMem.timerInterval = setInterval(() => {
    estadoMem.segundos++;
    document.getElementById("timerDisplay").textContent = estadoMem.segundos + "s";
  }, 1000);
}

function detenerTimer() {
  if (estadoMem.timerInterval) {
    clearInterval(estadoMem.timerInterval);
    estadoMem.timerInterval = null;
  }
}

// ─────────────────────────────────────────────────────────────
// mostrarFinal — Calculo el puntaje final y muestro resultados
// ─────────────────────────────────────────────────────────────
function mostrarFinal() {
  detenerTimer();

  const { puntaje, intentos, paresTotal, paresEncontrados, segundos } = estadoMem;

  // Calculo bonus de eficiencia: menos intentos = más bonus
  // El mínimo posible es paresTotal intentos (perfecto)
  const intentosPerfectos = paresTotal;
  const eficiencia = Math.max(0, intentosPerfectos / intentos);
  const bonusEficiencia = Math.round(eficiencia * 20); // hasta 20 puntos extra

  // Calculo bonus de velocidad (solo si terminó en menos de 2 min)
  const bonusVelocidad = segundos < 120 ? Math.max(0, 10 - Math.floor(segundos / 15)) : 0;

  const puntajeFinal = puntaje + bonusEficiencia + bonusVelocidad;

  // Determino emoji y mensaje según eficiencia
  const porcentajeEficiencia = Math.round(eficiencia * 100);
  let emoji, titulo, mensaje;

  if (eficiencia >= 0.9) {
    emoji   = "🏆";
    titulo  = "¡Memoria fotográfica!";
    mensaje = `¡Solo necesitaste ${intentos} intentos para ${paresTotal} pares! ¡Increíble! 🧠`;
  } else if (eficiencia >= 0.6) {
    emoji   = "🌟";
    titulo  = "¡Muy buena memoria!";
    mensaje = `¡Lo lograste en ${intentos} intentos! ¡Sigue practicando! 💪`;
  } else if (eficiencia >= 0.4) {
    emoji   = "😊";
    titulo  = "¡Bien hecho!";
    mensaje = `Completaste el tablero en ${intentos} intentos. ¡Cada vez lo harás mejor! 📚`;
  } else {
    emoji   = "💪";
    titulo  = "¡Lo lograste!";
    mensaje = `¡Terminaste el memorama! Practica más para mejorar tu memoria. 🌱`;
  }

  // Relleno la pantalla de resultados
  document.getElementById("memEndEmoji").textContent    = emoji;
  document.getElementById("memEndTitle").textContent    = titulo;
  document.getElementById("memEndMsg").textContent      = mensaje;
  document.getElementById("memEndPares").textContent    = paresEncontrados;
  document.getElementById("memEndIntentos").textContent = intentos;
  document.getElementById("memEndTiempo").textContent   = segundos + "s";
  document.getElementById("memEndScore").textContent    = puntajeFinal + " ⭐";

  // Guardo el puntaje en localStorage para el hub
  guardarPuntaje(puntajeFinal);

  // Cambio a la pantalla final
  cambiarPantalla("screenEnd");

  // Fanfarria si fue eficiente
  if (eficiencia >= 0.6 && typeof playVictory === "function") {
    setTimeout(playVictory, 300);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─────────────────────────────────────────────────────────────
// repetirMemorama — Vuelvo al selector para jugar de nuevo
// ─────────────────────────────────────────────────────────────
function repetirMemorama() {
  if (typeof playClick === "function") playClick();

  // Limpio el estado visual del selector
  document.querySelectorAll("#screenSelector .selector-btn").forEach(b => {
    b.classList.remove("active");
    b.setAttribute("aria-pressed", "false");
  });
  document.getElementById("btnIniciar").disabled = true;
  document.getElementById("scoreDisplay").textContent = "0";
  paresSeleccionados = 0;

  cambiarPantalla("screenSelector");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─────────────────────────────────────────────────────────────
// guardarPuntaje — Persisto el mejor puntaje en localStorage
// ─────────────────────────────────────────────────────────────
function guardarPuntaje(puntaje) {
  try {
    const scores     = JSON.parse(localStorage.getItem("mundicurioso_scores") || "{}");
    scores.memorama  = Math.max(scores.memorama || 0, puntaje);
    localStorage.setItem("mundicurioso_scores", JSON.stringify(scores));
  } catch (e) {
    console.warn("No pude guardar el puntaje:", e);
  }
}

// ─────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────

// Fisher-Yates shuffle — mezclo el array de cartas
function mezclarArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Cambio de pantalla — oculto todas y muestro la pedida
function cambiarPantalla(idPantalla) {
  ["screenSelector", "screenGame", "screenEnd"].forEach(id => {
    document.getElementById(id).classList.add("hidden");
  });
  document.getElementById(idPantalla).classList.remove("hidden");
}

// Animación de burst de emoji al encontrar un par
function mostrarCelebracion() {
  const overlay = document.getElementById("celebrationOverlay");
  const burst   = document.getElementById("celebrationBurst");
  const emojis  = ["🎉", "🌟", "✨", "🃏", "💥", "🎯", "⭐", "🥳"];
  burst.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  overlay.classList.add("show");
  setTimeout(() => overlay.classList.remove("show"), 700);
}

// Toast de mensajes breves
let toastTimeout = null;
function mostrarToast(mensaje, tipo = "info") {
  const toast   = document.getElementById("toastMsg");
  toast.textContent = mensaje;
  toast.className   = `toast toast--${tipo} show`;
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { toast.className = "toast"; }, 2500);
}
