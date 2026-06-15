/* ═══════════════════════════════════════════════════════════════
   AUDIO.JS — Sistema de sonidos con Web Audio API
   ─────────────────────────────────────────────────────────────
   Genero todos los sonidos por código sin necesidad de archivos
   externos. Esto hace el proyecto 100% portable y sin dependencias
   de hosting de audio.
   
   Los sonidos se inicializan "lazy" al primer clic del usuario
   porque los navegadores requieren interacción para iniciar el
   contexto de audio (política de autoplay).
   
   — Carlos Turizo / El Mundo de Manu
═══════════════════════════════════════════════════════════════ */

// Contexto de audio — lo inicializo al primer input del usuario
let audioCtx = null;

// ─────────────────────────────────────────────────────────────
// Inicializo el contexto de audio en el primer clic.
// Es necesario porque los navegadores bloquean el audio
// hasta que el usuario interactúa con la página.
// ─────────────────────────────────────────────────────────────
function initAudio() {
  if (audioCtx) return; // Ya inicializado, no hace falta repetir
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.warn("⚠️ Web Audio API no disponible en este navegador.");
  }
}

// Engancho la inicialización al primer clic en la página
document.addEventListener("click", initAudio, { once: true });
document.addEventListener("touchstart", initAudio, { once: true });

// ─────────────────────────────────────────────────────────────
// playTone — Función base para generar un tono
// freq: frecuencia en Hz
// duration: duración en segundos
// type: forma de onda ('sine'|'square'|'triangle'|'sawtooth')
// vol: volumen (0-1)
// delay: retardo en segundos antes de sonar
// ─────────────────────────────────────────────────────────────
function playTone(freq, duration, type = 'sine', vol = 0.3, delay = 0) {
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode   = audioCtx.createGain();

  // Conecto los nodos del grafo de audio
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // Configuro el oscilador
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);

  // Configuro el envolvente de volumen (fade out suave al final)
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime + delay);
  gainNode.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + delay + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);

  // Ejecuto
  oscillator.start(audioCtx.currentTime + delay);
  oscillator.stop(audioCtx.currentTime + delay + duration + 0.01);
}

// ─────────────────────────────────────────────────────────────
// SONIDO: Respuesta correcta
// Un acorde ascendente tipo "¡bien hecho!"
// ─────────────────────────────────────────────────────────────
function playCorrect() {
  if (!audioCtx) return;
  // Secuencia de notas que suenan a victoria
  playTone(440,  0.15, 'sine', 0.25, 0.00);   // La
  playTone(554,  0.15, 'sine', 0.25, 0.10);   // Do#
  playTone(660,  0.25, 'sine', 0.30, 0.20);   // Mi
  playTone(880,  0.35, 'sine', 0.30, 0.35);   // La (octava)
}

// ─────────────────────────────────────────────────────────────
// SONIDO: Respuesta incorrecta
// Dos tonos descendentes cortos, tipo "error suave"
// ─────────────────────────────────────────────────────────────
function playWrong() {
  if (!audioCtx) return;
  playTone(300, 0.2, 'sawtooth', 0.15, 0.00);
  playTone(220, 0.3, 'sawtooth', 0.12, 0.15);
}

// ─────────────────────────────────────────────────────────────
// SONIDO: Click de botón
// Un click sutil de feedback al presionar cualquier botón
// ─────────────────────────────────────────────────────────────
function playClick() {
  if (!audioCtx) return;
  playTone(800, 0.06, 'sine', 0.1, 0);
}

// ─────────────────────────────────────────────────────────────
// SONIDO: Victoria / completar un juego
// Fanfarria de celebración completa
// ─────────────────────────────────────────────────────────────
function playVictory() {
  if (!audioCtx) return;
  const notas = [
    { f: 523, d: 0.15 },  // Do
    { f: 659, d: 0.15 },  // Mi
    { f: 784, d: 0.15 },  // Sol
    { f: 1047, d: 0.4 },  // Do alto
  ];
  let t = 0;
  notas.forEach(n => {
    playTone(n.f, n.d, 'sine', 0.3, t);
    t += n.d;
  });
  // Brillo final extra
  setTimeout(() => {
    playTone(1318, 0.5, 'sine', 0.25, 0);
  }, t * 1000);
}

// ─────────────────────────────────────────────────────────────
// SONIDO: Voltear carta (memorama)
// ─────────────────────────────────────────────────────────────
function playFlip() {
  if (!audioCtx) return;
  playTone(600, 0.08, 'triangle', 0.12, 0);
}

// ─────────────────────────────────────────────────────────────
// SONIDO: Par encontrado (memorama)
// ─────────────────────────────────────────────────────────────
function playMatch() {
  if (!audioCtx) return;
  playTone(660, 0.15, 'sine', 0.25, 0.00);
  playTone(784, 0.25, 'sine', 0.25, 0.10);
}

// ─────────────────────────────────────────────────────────────
// SONIDO: Soltar elemento (drag & drop)
// ─────────────────────────────────────────────────────────────
function playDrop() {
  if (!audioCtx) return;
  playTone(440, 0.1, 'triangle', 0.2, 0);
}
