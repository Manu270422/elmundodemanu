/* ============================================================
   logros.js — Mis 25 logros de pareja. 🏆
   Cada logro tiene una condición que evalúo contra el Estado.
   Cuando uno se desbloquea, muestro un toast flotante y guardo
   la FECHA del desbloqueo: esas fechas alimentan el Cofre de
   Recuerdos como "fechas especiales" de la pareja.
   También llevo aquí el TIEMPO JUGADO total para la escena final.
   ============================================================ */

const Logros = {
  // Mi catálogo completo. La condición recibe (d = Estado.datos, s = stats).
  CATALOGO: [
    { id: "primer-beso",      emoji: "💋", nombre: "Primer Beso Virtual",    desc: "Jugaron su primera Carrera del Beso",            cond: (d, s) => (s.porJuego["carrera-del-beso"] || 0) >= 1 },
    { id: "partidas-10",      emoji: "🎮", nombre: "10 Partidas Juntos",     desc: "Completaron 10 partidas",                        cond: d => d.partidasJugadas >= 10 },
    { id: "partidas-25",      emoji: "🕹️", nombre: "Inseparables",           desc: "Completaron 25 partidas",                        cond: d => d.partidasJugadas >= 25 },
    { id: "partidas-50",      emoji: "👾", nombre: "Dúo Legendario",         desc: "Completaron 50 partidas",                        cond: d => d.partidasJugadas >= 50 },
    { id: "corazones-50",     emoji: "❤️", nombre: "50 Corazones",           desc: "Acumularon 50 corazones ganados",                cond: d => (d.totalCorazonesGanados || 0) >= 50 },
    { id: "corazones-150",    emoji: "💖", nombre: "Alcancía de Amor",       desc: "Acumularon 150 corazones ganados",               cond: d => (d.totalCorazonesGanados || 0) >= 150 },
    { id: "corazones-300",    emoji: "💝", nombre: "Millonarios del Amor",   desc: "Acumularon 300 corazones ganados",               cond: d => (d.totalCorazonesGanados || 0) >= 300 },
    { id: "almas-gemelas",    emoji: "🔮", nombre: "Almas Gemelas",          desc: "Química del 80% con al menos 10 rondas",         cond: (d, s) => s.conoceRondas >= 10 && s.conoceAciertos / s.conoceRondas >= 0.8 },
    { id: "expertos-quimica", emoji: "🧪", nombre: "Expertos en Química",    desc: "Jugaron 5 veces ¿Quién Me Conoce Más?",          cond: (d, s) => (s.porJuego["quien-me-conoce"] || 0) >= 5 },
    { id: "corazon-imparable",emoji: "🫶", nombre: "Corazón Imparable",      desc: "Sobrevivieron los 30s del Corazón Equilibrado",  cond: (d, s) => s.mejorSincronia >= 30 },
    { id: "racha-3",          emoji: "🔥", nombre: "Llama Encendida",        desc: "Racha de 3 días jugando juntos",                 cond: (d, s) => s.racha >= 3 },
    { id: "racha-7",          emoji: "🌋", nombre: "Semana de Amor",         desc: "Racha de 7 días jugando juntos",                 cond: (d, s) => s.racha >= 7 },
    { id: "racha-30",         emoji: "☄️", nombre: "Amor Imparable",         desc: "Racha de 30 días jugando juntos",                cond: (d, s) => s.racha >= 30 },
    { id: "mundo-2",          emoji: "🧪", nombre: "Químicos",               desc: "Desbloquearon el Mundo Química",                 cond: d => d.mundosDesbloqueados.includes(2) },
    { id: "mundo-3",          emoji: "🎢", nombre: "Locos el Uno por el Otro", desc: "Desbloquearon Locuras Juntos",                 cond: d => d.mundosDesbloqueados.includes(3) },
    { id: "mundo-4",          emoji: "🤫", nombre: "Sin Secretos",           desc: "Desbloquearon Confesiones",                      cond: d => d.mundosDesbloqueados.includes(4) },
    { id: "mundo-5",          emoji: "💍", nombre: "Para Siempre",           desc: "Desbloquearon el mundo final",                   cond: d => d.mundosDesbloqueados.includes(5) },
    { id: "atrapa-20",        emoji: "💘", nombre: "Cazacorazones",          desc: "20 puntos en Atrapa el Amor",                    cond: d => d.atrapaElAmor && d.atrapaElAmor.mejorPuntuacion >= 20 },
    { id: "atrapa-35",        emoji: "🏹", nombre: "Cupido Profesional",     desc: "35 puntos en Atrapa el Amor",                    cond: d => d.atrapaElAmor && d.atrapaElAmor.mejorPuntuacion >= 35 },
    { id: "ruleta-10",        emoji: "🎡", nombre: "Que Gire el Amor",       desc: "Giraron la ruleta 10 veces",                     cond: (d, s) => (s.porJuego["ruleta-de-pareja"] || 0) >= 10 },
    { id: "primera-carta",    emoji: "💌", nombre: "Poetas del Corazón",     desc: "Escribieron su primera carta romántica",         cond: d => (d.cartas || []).length >= 1 },
    { id: "cartas-5",         emoji: "📚", nombre: "Novela de Amor",         desc: "Escribieron 5 cartas románticas",                cond: d => (d.cartas || []).length >= 5 },
    { id: "primera-capsula",  emoji: "⏳", nombre: "Viajeros del Tiempo",    desc: "Sellaron su primera cápsula del tiempo",         cond: d => (d.capsulas || []).length >= 1 },
    { id: "capsula-abierta",  emoji: "🔓", nombre: "Reencuentro",            desc: "Abrieron una cápsula del tiempo",                cond: d => (d.capsulas || []).some(c => c.abierta) },
    { id: "historia-completa",emoji: "🌟", nombre: "Historia Completa",      desc: "Vieron juntos la escena final del juego",        cond: d => d.finalVisto === true }
  ],

  asegurar() {
    if (!Estado.datos.logros) Estado.datos.logros = {};            // { id: "fecha de desbloqueo" }
    if (!Estado.datos.totalCorazonesGanados) Estado.datos.totalCorazonesGanados = 0;
    if (!Estado.datos.tiempoJugado) Estado.datos.tiempoJugado = 0; // Segundos totales con el juego abierto.
    if (!Estado.datos.fechaInicio) {
      // Guardo el día en que la pareja empezó a jugar: su "aniversario" en Latidos.
      Estado.datos.fechaInicio = new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
    }
    Estado.guardar();
  },

  // Reviso todo el catálogo y desbloqueo lo que se haya cumplido.
  // La llamo después de cada evento importante del juego.
  verificar() {
    this.asegurar();
    Estadisticas.asegurar();
    const d = Estado.datos, s = Estado.datos.stats;
    this.CATALOGO.forEach(logro => {
      if (!d.logros[logro.id] && logro.cond(d, s)) {
        d.logros[logro.id] = new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
        Estado.guardar();
        this.celebrar(logro);
      }
    });
  },

  // Toast flotante de logro: aparece arriba, vive 3.5s y se va solo.
  // No uso el Modal para no interrumpir lo que estén haciendo.
  celebrar(logro) {
    const toast = document.createElement("div");
    toast.className = "toast-logro";
    toast.innerHTML = `<span>${logro.emoji}</span><div><b>¡Logro desbloqueado!</b><p>${logro.nombre}</p></div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  },

  cuantosTienen() { return Object.keys(Estado.datos.logros || {}).length; },

  iniciar() {
    this.asegurar();

    // Envuelvo cambiarCorazones para llevar el TOTAL HISTÓRICO ganado
    // (solo sumas positivas) y verificar logros tras cada premio.
    const cambiarOriginal = Estado.cambiarCorazones.bind(Estado);
    Estado.cambiarCorazones = cantidad => {
      if (cantidad > 0) Estado.datos.totalCorazonesGanados += cantidad;
      cambiarOriginal(cantidad);
      this.verificar();
    };

    // Envuelvo registrarPartida para verificar logros tras cada partida.
    const registrarOriginal = Estadisticas.registrarPartida.bind(Estadisticas);
    Estadisticas.registrarPartida = idJuego => {
      registrarOriginal(idJuego);
      this.verificar();
    };

    // Mi cronómetro de tiempo jugado: sumo 1 segundo mientras el juego
    // esté abierto y guardo cada 15 para no maltratar el localStorage.
    setInterval(() => {
      Estado.datos.tiempoJugado++;
      if (Estado.datos.tiempoJugado % 15 === 0) Estado.guardar();
    }, 1000);

    this.verificar(); // Primera pasada al arrancar, por si vienen de antes.
  }
};
