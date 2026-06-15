/* ============================================================
   cofre-de-recuerdos.js — El museo del amor de la pareja. 🗝️
   Y también la ESCENA FINAL del juego.
   El cofre reúne en un solo lugar:
   - Estadísticas históricas
   - Los 25 logros (con fecha de desbloqueo)
   - Las cartas guardadas
   - Las fechas especiales de su historia
   La escena final se desbloquea al completar todos los mundos.
   ============================================================ */

const CofreDeRecuerdos = {
  preparar() {
    Logros.asegurar();
    Estadisticas.asegurar();
    CartasRomanticas.asegurar();
    CapsulaDelTiempo.asegurar();
    this.pintarEstadisticas();
    this.pintarLogros();
    this.pintarCartas();
    this.pintarFechas();
  },

  // Formateo segundos a "Xh Ym" para que el tiempo jugado se lea humano.
  formatearTiempo(segundos) {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  },

  pintarEstadisticas() {
    const s = Estado.datos.stats;
    const quimica = s.conoceRondas > 0 ? Math.round((s.conoceAciertos / s.conoceRondas) * 100) + "%" : "—";
    document.getElementById("cofre-estadisticas").innerHTML = `
      <div class="fila-estadistica"><span>🎮 Partidas juntos</span><b>${Estado.datos.partidasJugadas}</b></div>
      <div class="fila-estadistica"><span>⏰ Tiempo jugado</span><b>${this.formatearTiempo(Estado.datos.tiempoJugado)}</b></div>
      <div class="fila-estadistica"><span>💰 Corazones ganados en total</span><b>${Estado.datos.totalCorazonesGanados} ❤️</b></div>
      <div class="fila-estadistica"><span>🔥 Mejor racha</span><b>${s.racha} días</b></div>
      <div class="fila-estadistica"><span>🧪 Química</span><b>${quimica}</b></div>
      <div class="fila-estadistica"><span>🫶 Mejor sincronía</span><b>${s.mejorSincronia.toFixed(1)}s</b></div>
    `;
  },

  // Pinto la vitrina de los 25 logros: los bloqueados en gris con candado.
  pintarLogros() {
    document.getElementById("cofre-contador-logros").textContent =
      `${Logros.cuantosTienen()} / ${Logros.CATALOGO.length}`;
    const vitrina = document.getElementById("cofre-logros");
    vitrina.innerHTML = "";
    Logros.CATALOGO.forEach(logro => {
      const fecha = Estado.datos.logros[logro.id];
      const celda = document.createElement("div");
      celda.className = "celda-logro" + (fecha ? "" : " bloqueado");
      celda.innerHTML = `<span>${fecha ? logro.emoji : "🔒"}</span><p>${logro.nombre}</p>`;
      // Al tocar un logro muestro su descripción y su fecha en el modal.
      celda.addEventListener("click", () => {
        Modal.abrir({
          emoji: fecha ? logro.emoji : "🔒",
          titulo: logro.nombre,
          mensaje: logro.desc,
          premio: fecha ? `Desbloqueado el ${fecha}` : "Aún bloqueado... sigan jugando juntos."
        });
      });
      vitrina.appendChild(celda);
    });
  },

  pintarCartas() {
    const zona = document.getElementById("cofre-cartas");
    const cartas = Estado.datos.cartas;
    zona.innerHTML = cartas.length === 0
      ? '<p class="texto-vacio">Sin cartas todavía.</p>'
      : `<p class="resumen-cofre">💌 ${cartas.length} carta${cartas.length === 1 ? "" : "s"} guardada${cartas.length === 1 ? "" : "s"} para siempre.</p>`;
    // Botón para ir directo al buzón a releerlas.
    if (cartas.length > 0) {
      const boton = document.createElement("button");
      boton.className = "boton-principal boton-pequeno";
      boton.textContent = "Releer cartas 💌";
      boton.addEventListener("click", () => { CartasRomanticas.preparar(); Navegacion.ir("pantalla-cartas"); });
      zona.appendChild(boton);
    }
  },

  // Las fechas especiales: inicio de su historia, logros y cápsulas.
  pintarFechas() {
    const zona = document.getElementById("cofre-fechas");
    const fechas = [`💞 ${Estado.datos.fechaInicio} — Empezaron a jugar Latidos`];
    // Agrego los 3 logros más recientes como hitos.
    Object.entries(Estado.datos.logros).slice(-3).forEach(([id, fecha]) => {
      const logro = Logros.CATALOGO.find(l => l.id === id);
      if (logro) fechas.push(`${logro.emoji} ${fecha} — ${logro.nombre}`);
    });
    Estado.datos.capsulas.forEach(c => {
      fechas.push(`⏳ ${CapsulaDelTiempo.formatear(c.fecha)} — Se abre una cápsula del tiempo`);
    });
    zona.innerHTML = fechas.map(f => `<div class="fila-estadistica"><span>${f}</span></div>`).join("");
  },

  iniciar() {}
};

/* ============================================================
   FinalDelJuego — La escena con la que cierro Latidos. 🌟
   Se desbloquea cuando la pareja completó TODOS los mundos.
   No es un minijuego: es el momento de mirar atrás y ver
   todo lo que construyeron juntos.
   ============================================================ */
const FinalDelJuego = {
  // El final está disponible solo si los 5 mundos están desbloqueados.
  disponible() {
    return MUNDOS.every(m => Estado.mundoDesbloqueado(m.id));
  },

  preparar() {
    if (!this.disponible()) {
      const faltan = MUNDOS.filter(m => !Estado.mundoDesbloqueado(m.id)).length;
      Modal.abrir({
        emoji: "🗺️",
        titulo: "Su historia sigue escribiéndose",
        mensaje: `Les falta${faltan === 1 ? "" : "n"} ${faltan} mundo${faltan === 1 ? "" : "s"} por desbloquear. La escena final los espera al completar todo el mapa.`,
        alCerrar: () => Navegacion.ir("pantalla-mapa")
      });
      return;
    }

    // Marco que vieron el final: este es mi logro 25, Historia Completa.
    if (!Estado.datos.finalVisto) {
      Estado.datos.finalVisto = true;
      Estado.guardar();
      Logros.verificar();
    }

    // Pinto la escena final con TODOS los números de su historia.
    const s = Estado.datos.stats;
    document.getElementById("final-pareja").textContent =
      `${Estado.datos.novio} & ${Estado.datos.novia}`;
    document.getElementById("final-estadisticas").innerHTML = `
      <div class="fila-estadistica"><span>🎮 Partidas jugadas juntos</span><b>${Estado.datos.partidasJugadas}</b></div>
      <div class="fila-estadistica"><span>⏰ Tiempo jugado</span><b>${CofreDeRecuerdos.formatearTiempo(Estado.datos.tiempoJugado)}</b></div>
      <div class="fila-estadistica"><span>❤️ Corazones acumulados</span><b>${Estado.datos.corazones} (${Estado.datos.totalCorazonesGanados} ganados en total)</b></div>
      <div class="fila-estadistica"><span>🏆 Logros obtenidos</span><b>${Logros.cuantosTienen()} / ${Logros.CATALOGO.length}</b></div>
      <div class="fila-estadistica"><span>💌 Cartas escritas</span><b>${Estado.datos.cartas.length}</b></div>
      <div class="fila-estadistica"><span>🔥 Racha de pareja</span><b>${s.racha} días</b></div>
    `;
    // Suelto una lluvia de corazones de celebración: 40 partículas de golpe.
    for (let i = 0; i < 40; i++) {
      setTimeout(() => {
        const p = document.createElement("span");
        p.className = "particula";
        p.textContent = ["💗", "💖", "💕", "✨", "🌟"][Math.floor(Math.random() * 5)];
        p.style.left = Math.random() * 100 + "vw";
        p.style.fontSize = 16 + Math.random() * 26 + "px";
        p.style.animationDuration = 4 + Math.random() * 4 + "s";
        document.getElementById("particulas").appendChild(p);
        setTimeout(() => p.remove(), 9000);
      }, i * 120);
    }
    Navegacion.ir("pantalla-final");
  },

  iniciar() {}
};
