/* ============================================================
   estadisticas.js — El corazón estadístico de mi juego. 📊
   Aquí convierto Latidos en una experiencia continua de pareja:
   - Partidas jugadas juntos
   - Racha diaria de pareja (días seguidos jugando)
   - Minijuego favorito (el más jugado)
   - Mejor sincronía en Corazón Equilibrado (más segundos aguantados)
   - % de aciertos en ¿Quién Me Conoce Más?

   TRUCO DE ARQUITECTURA: para no modificar los minijuegos ya
   aprobados de las Fases 1 y 2, "envuelvo" sus funciones desde
   aquí (patrón decorator). Este archivo se carga DESPUÉS de los
   minijuegos, intercepta sus finales de partida y registra todo.
   ============================================================ */

const Estadisticas = {
  // Aseguro que el objeto de estadísticas exista en el Estado,
  // incluso para parejas que vienen jugando desde la Fase 1.
  asegurar() {
    if (!Estado.datos.stats) {
      Estado.datos.stats = {
        porJuego: {},          // { "carrera-del-beso": 5, ... } para el favorito.
        racha: 0,              // Días seguidos jugando juntos.
        ultimoDia: "",         // Última fecha (YYYY-MM-DD) que jugaron.
        mejorSincronia: 0,     // Segundos récord en Corazón Equilibrado.
        conoceAciertos: 0,     // Aciertos acumulados en ¿Quién Me Conoce Más?
        conoceRondas: 0        // Rondas totales para calcular el porcentaje.
      };
      Estado.guardar();
    }
  },

  // Registro una partida de cualquier minijuego: cuenta para el
  // favorito y alimenta la racha diaria de la pareja.
  registrarPartida(idJuego) {
    this.asegurar();
    const s = Estado.datos.stats;
    s.porJuego[idJuego] = (s.porJuego[idJuego] || 0) + 1;

    // Mi lógica de racha: si jugaron ayer, suman un día; si jugaron
    // hoy ya, no pasa nada; si dejaron pasar días, la racha vuelve a 1.
    const hoy = new Date().toISOString().slice(0, 10);
    if (s.ultimoDia !== hoy) {
      const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      s.racha = (s.ultimoDia === ayer) ? s.racha + 1 : 1;
      s.ultimoDia = hoy;
    }
    Estado.guardar();
  },

  // Nombres bonitos para mostrar el minijuego favorito.
  NOMBRES: {
    "carrera-del-beso": "Carrera del Beso 💋",
    "corazon-equilibrado": "Corazón Equilibrado 🫶",
    "quien-me-conoce": "¿Quién Me Conoce Más? 🧠",
    "atrapa-el-amor": "Atrapa el Amor 💘",
    "ruleta-de-pareja": "Ruleta de Pareja 🎡"
  },

  favorito() {
    const s = Estado.datos.stats;
    let mejor = null, max = 0;
    for (const id in s.porJuego) {
      if (s.porJuego[id] > max) { max = s.porJuego[id]; mejor = id; }
    }
    return mejor ? `${this.NOMBRES[mejor]} (${max} partidas)` : "Aún no tienen favorito";
  },

  // Pinto el panel de estadísticas de la pareja.
  mostrarPanel() {
    this.asegurar();
    const s = Estado.datos.stats;
    const porcentaje = s.conoceRondas > 0
      ? Math.round((s.conoceAciertos / s.conoceRondas) * 100) + "%"
      : "Sin partidas aún";
    document.getElementById("lista-estadisticas").innerHTML = `
      <div class="fila-estadistica"><span>🎮 Partidas jugadas juntos</span><b>${Estado.datos.partidasJugadas}</b></div>
      <div class="fila-estadistica"><span>🔥 Racha diaria de pareja</span><b>${s.racha} día${s.racha === 1 ? "" : "s"}</b></div>
      <div class="fila-estadistica"><span>⭐ Minijuego favorito</span><b>${this.favorito()}</b></div>
      <div class="fila-estadistica"><span>🫶 Mejor sincronía</span><b>${s.mejorSincronia.toFixed(1)}s</b></div>
      <div class="fila-estadistica"><span>🧠 Química acumulada</span><b>${porcentaje}</b></div>
      <div class="fila-estadistica"><span>💘 Récord Atrapa el Amor</span><b>${Estado.datos.atrapaElAmor ? Estado.datos.atrapaElAmor.mejorPuntuacion + " pts" : "Sin partidas aún"}</b></div>
    `;
    Navegacion.ir("pantalla-estadisticas");
  },

  // ===== Aquí envuelvo los minijuegos existentes SIN modificarlos =====
  iniciar() {
    this.asegurar();

    // Carrera del Beso: registro la partida cuando termina.
    const terminarCarrera = CarreraDelBeso.terminar.bind(CarreraDelBeso);
    CarreraDelBeso.terminar = ganador => {
      this.registrarPartida("carrera-del-beso");
      terminarCarrera(ganador);
    };

    // Corazón Equilibrado: registro la partida Y el récord de sincronía
    // (los segundos que lograron mantener el corazón en el aire).
    const terminarEquilibrio = CorazonEquilibrado.terminar.bind(CorazonEquilibrado);
    CorazonEquilibrado.terminar = ganaron => {
      this.registrarPartida("corazon-equilibrado");
      const segundos = ganaron ? CorazonEquilibrado.META_SEGUNDOS : CorazonEquilibrado.tiempo;
      if (segundos > Estado.datos.stats.mejorSincronia) {
        Estado.datos.stats.mejorSincronia = segundos;
        Estado.guardar();
      }
      terminarEquilibrio(ganaron);
    };

    // ¿Quién Me Conoce Más?: intercepto cada ronda resuelta para
    // acumular aciertos/rondas, y el final para contar la partida.
    const resolverConoce = QuienMeConoce.resolver.bind(QuienMeConoce);
    QuienMeConoce.resolver = adivinanza => {
      Estado.datos.stats.conoceRondas++;
      if (adivinanza === QuienMeConoce.respuestaSecreta) Estado.datos.stats.conoceAciertos++;
      Estado.guardar();
      resolverConoce(adivinanza);
    };
    const terminarConoce = QuienMeConoce.terminar.bind(QuienMeConoce);
    QuienMeConoce.terminar = () => {
      this.registrarPartida("quien-me-conoce");
      terminarConoce();
    };

    // Atrapa el Amor y Ruleta son de la Fase 3: también los envuelvo aquí
    // para mantener TODA la lógica de estadísticas en un solo archivo.
    const terminarAtrapa = AtrapaElAmor.terminar.bind(AtrapaElAmor);
    AtrapaElAmor.terminar = () => {
      this.registrarPartida("atrapa-el-amor");
      terminarAtrapa();
    };
    const revelarRuleta = RuletaDePareja.revelar.bind(RuletaDePareja);
    RuletaDePareja.revelar = indice => {
      this.registrarPartida("ruleta-de-pareja");
      revelarRuleta(indice);
    };

    // Conecto el botón de estadísticas del mapa.
    document.getElementById("boton-estadisticas").addEventListener("click", () => this.mostrarPanel());
  }
};
