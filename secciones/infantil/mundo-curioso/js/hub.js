/* ═══════════════════════════════════════════════════════════════
   HUB.JS — Lógica del menú principal de MundiCurioso
   ─────────────────────────────────────────────────────────────
   Manejo aquí todo lo del hub:
   - Cargar y mostrar puntajes guardados por juego
   - Toggle de tema oscuro/claro
   - Barra de progreso diaria
   - Pantalla de victoria final cuando se completan todos
   - Navegación a los mini-juegos
   
   Uso localStorage para persistir los puntajes entre sesiones.
   
   — Carlos Turizo / El Mundo de Manu
═══════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN
// Defino cuántos puntos máximos puede ganar en cada juego
// para calcular el porcentaje de progreso correctamente.
// ─────────────────────────────────────────────────────────────
const PUNTAJE_MAX_POR_JUEGO = {
  trivia:   100,  // 10 preguntas × 10 pts cada una
  memorama: 80,   // 8 pares × 10 pts cada uno
  conecta:  50    // 5 conexiones × 10 pts cada una
};

// ─────────────────────────────────────────────────────────────
// Al cargar la página, leo los puntajes guardados y los muestro
// ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  cargarTema();
  actualizarHub();
});

// ─────────────────────────────────────────────────────────────
// actualizarHub — Refresca todos los datos visuales del hub
// ─────────────────────────────────────────────────────────────
function actualizarHub() {
  const scores = leerScores();

  // Muestro los puntajes por juego en las tarjetas
  document.getElementById("triviaScore").textContent   = scores.trivia   || 0;
  document.getElementById("memoramaScore").textContent = scores.memorama || 0;
  document.getElementById("conectaScore").textContent  = scores.conecta  || 0;

  // Calculo y muestro el total de estrellas
  const total = (scores.trivia || 0) + (scores.memorama || 0) + (scores.conecta || 0);
  document.getElementById("totalStars").textContent  = total;
  document.getElementById("victoryTotal").textContent = total + " ⭐";

  // Actualizo la barra de progreso del día
  const maxTotal  = Object.values(PUNTAJE_MAX_POR_JUEGO).reduce((a, b) => a + b, 0);
  const porcentaje = Math.min(100, Math.round((total / maxTotal) * 100));
  document.getElementById("progressFill").style.width    = porcentaje + "%";
  document.getElementById("progressPercent").textContent = porcentaje + "%";

  // Si completó todos los juegos, muestro la pantalla de victoria
  const todosCompletos = Object.keys(PUNTAJE_MAX_POR_JUEGO).every(
    juego => (scores[juego] || 0) >= PUNTAJE_MAX_POR_JUEGO[juego] * 0.7 // ≥70% en cada uno
  );
  if (todosCompletos && total > 0) {
    setTimeout(() => mostrarVictoria(), 800);
  }
}

// ─────────────────────────────────────────────────────────────
// leerScores — Leo los puntajes guardados en localStorage
// ─────────────────────────────────────────────────────────────
function leerScores() {
  try {
    return JSON.parse(localStorage.getItem("mundicurioso_scores") || "{}");
  } catch {
    return {};
  }
}

// ─────────────────────────────────────────────────────────────
// goToGame — Navego a la página del mini-juego seleccionado
// Reproduzco un clic de audio antes de navegar
// ─────────────────────────────────────────────────────────────
function goToGame(url) {
  if (typeof playClick === "function") playClick();

  // Pequeño delay para que suene el click antes de navegar
  setTimeout(() => {
    window.location.href = url;
  }, 80);
}

// ─────────────────────────────────────────────────────────────
// handleCardKey — Permito activar la tarjeta con Enter/Espacio
// Así funciona bien con teclado (accesibilidad)
// ─────────────────────────────────────────────────────────────
function handleCardKey(event, url) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    goToGame(url);
  }
}

// ─────────────────────────────────────────────────────────────
// TOGGLE TEMA OSCURO / CLARO
// ─────────────────────────────────────────────────────────────
const themeToggle = document.getElementById("themeToggle");
const themeIcon   = document.getElementById("themeIcon");

themeToggle.addEventListener("click", () => {
  toggleTema();
  if (typeof playClick === "function") playClick();
});

function toggleTema() {
  const html    = document.documentElement;
  const esOscuro = html.getAttribute("data-theme") === "dark";
  const nuevoTema = esOscuro ? "light" : "dark";

  html.setAttribute("data-theme", nuevoTema);
  themeIcon.textContent = nuevoTema === "dark" ? "🌙" : "☀️";

  // Persisto la preferencia del usuario
  localStorage.setItem("mundicurioso_tema", nuevoTema);
}

function cargarTema() {
  const temaGuardado = localStorage.getItem("mundicurioso_tema") || "dark";
  document.documentElement.setAttribute("data-theme", temaGuardado);
  if (themeIcon) {
    themeIcon.textContent = temaGuardado === "dark" ? "🌙" : "☀️";
  }
}

// ─────────────────────────────────────────────────────────────
// PANTALLA DE VICTORIA
// ─────────────────────────────────────────────────────────────
function mostrarVictoria() {
  const pantalla = document.getElementById("victoryScreen");
  if (pantalla) {
    pantalla.classList.remove("hidden");
    if (typeof playVictory === "function") playVictory();
  }
}

// ─────────────────────────────────────────────────────────────
// resetAll — Reinicio todos los puntajes para jugar de nuevo
// ─────────────────────────────────────────────────────────────
function resetAll() {
  localStorage.removeItem("mundicurioso_scores");
  document.getElementById("victoryScreen").classList.add("hidden");
  actualizarHub();
  if (typeof playClick === "function") playClick();
}
