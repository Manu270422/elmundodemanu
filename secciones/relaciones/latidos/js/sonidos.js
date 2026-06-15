/* ============================================================
   sonidos.js — El audio de mi juego. 🔊
   Decisión técnica importante: NO uso archivos .mp3.
   Genero todos los sonidos con la Web Audio API (osciladores),
   así mi juego pesa lo mismo, funciona offline y no necesito
   buscar efectos con licencia.

   Igual que con estadísticas y logros, ENVUELVO los minijuegos
   ya aprobados desde aquí para no modificar sus archivos.
   Este script se carga después de todos ellos.
   ============================================================ */

const Sonidos = {
  ctx: null,        // AudioContext: lo creo perezosamente en el primer toque,
                    // porque Android/Chrome bloquean el audio hasta que el usuario interactúa.
  activo: true,

  asegurarContexto() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === "suspended") this.ctx.resume();
  },

  // Mi función base: un tono con frecuencia, duración, tipo de onda y volumen.
  // Todos mis efectos se construyen combinando llamadas a esta función.
  tono(frecuencia, duracion = 0.12, tipo = "sine", volumen = 0.18, retraso = 0) {
    if (!this.activo) return;
    try {
      this.asegurarContexto();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime + retraso;
      osc.type = tipo;
      osc.frequency.setValueAtTime(frecuencia, t);
      // Hago un fade-out exponencial para que ningún sonido termine en "clic".
      gain.gain.setValueAtTime(volumen, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duracion);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + duracion);
    } catch (e) { /* Si el audio falla, el juego sigue: el silencio no rompe nada. */ }
  },

  // ===== Mi paleta de efectos =====
  toque()  { this.tono(420, 0.06, "square", 0.08); },                          // Tap en minijuegos.
  moneda() { this.tono(880, 0.09, "triangle", 0.15); this.tono(1320, 0.12, "triangle", 0.15, 0.07); }, // Ganar corazones.
  exito()  { [523, 659, 784].forEach((f, i) => this.tono(f, 0.16, "triangle", 0.16, i * 0.1)); },       // Victoria: arpegio mayor.
  fallo()  { this.tono(300, 0.18, "sawtooth", 0.1); this.tono(220, 0.25, "sawtooth", 0.1, 0.12); },     // Derrota o corazón roto.
  giro()   { for (let i = 0; i < 14; i++) this.tono(200 + i * 40, 0.04, "square", 0.05, i * 0.06); },   // Ruleta acelerando.
  logro()  { [659, 784, 988, 1319].forEach((f, i) => this.tono(f, 0.2, "triangle", 0.18, i * 0.09)); }, // Fanfarria de logro.
  combo()  { [784, 988, 1175].forEach((f, i) => this.tono(f, 0.1, "sine", 0.16, i * 0.05)); },          // Combo dorado.

  // Enciendo/apago el sonido y lo dejo guardado en el Estado de la pareja.
  alternar() {
    this.activo = !this.activo;
    Estado.datos.sonidoActivo = this.activo;
    Estado.guardar();
    document.getElementById("boton-sonido").textContent = this.activo ? "🔊" : "🔇";
    if (this.activo) this.moneda(); // Confirmación audible de que volvió el sonido.
  },

  iniciar() {
    // Recupero la preferencia guardada (por defecto: activado).
    if (Estado.datos.sonidoActivo === undefined) Estado.datos.sonidoActivo = true;
    this.activo = Estado.datos.sonidoActivo;
    document.getElementById("boton-sonido").textContent = this.activo ? "🔊" : "🔇";
    document.getElementById("boton-sonido").addEventListener("click", () => this.alternar());

    // ===== Envuelvo los minijuegos aprobados para sonorizarlos =====

    // Toques rápidos de la Carrera del Beso y el Corazón Equilibrado.
    const tocarCarrera = CarreraDelBeso.tocar.bind(CarreraDelBeso);
    CarreraDelBeso.tocar = j => { if (CarreraDelBeso.jugando) this.toque(); tocarCarrera(j); };
    const tocarEquilibrio = CorazonEquilibrado.tocar.bind(CorazonEquilibrado);
    CorazonEquilibrado.tocar = j => { if (CorazonEquilibrado.jugando) this.toque(); tocarEquilibrio(j); };

    // Capturas de Atrapa el Amor: sonido distinto si el corazón es roto o dorado.
    const capturar = AtrapaElAmor.capturar.bind(AtrapaElAmor);
    AtrapaElAmor.capturar = (corazon, tipo, jugador) => {
      if (AtrapaElAmor.jugando && !corazon.dataset.capturado) {
        if (tipo.clase === "roto") this.fallo();
        else if (tipo.clase === "dorado") this.combo();
        else this.toque();
      }
      capturar(corazon, tipo, jugador);
    };

    // El giro de la ruleta suena como ruleta de verdad.
    const girar = RuletaDePareja.girar.bind(RuletaDePareja);
    RuletaDePareja.girar = () => { if (!RuletaDePareja.girando) this.giro(); girar(); };

    // Cada vez que ganan corazones suena la monedita.
    const cambiar = Estado.cambiarCorazones.bind(Estado);
    Estado.cambiarCorazones = cantidad => { if (cantidad > 0) this.moneda(); cambiar(cantidad); };

    // Fanfarria al desbloquear un logro.
    const celebrar = Logros.celebrar.bind(Logros);
    Logros.celebrar = logro => { this.logro(); celebrar(logro); };

    // El modal de resultados suena según el emoji: derrota o celebración.
    const abrirModal = Modal.abrir.bind(Modal);
    Modal.abrir = opciones => {
      if (opciones.emoji === "💔" || opciones.emoji === "🙈") this.fallo();
      else if (opciones.premio) this.exito();
      abrirModal(opciones);
    };
  }
};
