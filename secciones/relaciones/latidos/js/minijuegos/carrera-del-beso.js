/* ============================================================
   carrera-del-beso.js — Mi primer minijuego oficial. 💋
   Reglas que diseñé:
   - Cada jugador toca su mitad de la pantalla lo más rápido posible.
   - Cada toque llena 2% de su barra.
   - El primero en llegar a 100% gana.
   - El perdedor le debe un beso al ganador (ese es el verdadero premio).
   - La pareja gana corazones por jugar: gana más el ganador,
     pero el perdedor también recibe, porque aquí nadie pierde de verdad.
   ============================================================ */

const CarreraDelBeso = {
  // Guardo el progreso de cada jugador de 0 a 100.
  progreso: { novio: 0, novia: 0 },
  jugando: false,

  // Con esto reinicio el minijuego cada vez que entran a jugarlo.
  preparar() {
    this.progreso = { novio: 0, novia: 0 };
    this.jugando = false;
    document.getElementById("barra-novio").style.width = "0%";
    document.getElementById("barra-novia").style.width = "0%";
    // Pongo los nombres reales de la pareja en cada zona.
    document.getElementById("nombre-zona-novio").textContent = Estado.datos.novio || "Novio";
    document.getElementById("nombre-zona-novia").textContent = Estado.datos.novia || "Novia";
    // Restauro el botón de inicio en el centro.
    document.getElementById("centro-carrera").innerHTML =
      '<button class="boton-principal" id="boton-iniciar-carrera">¡A besar se dijo! 💋</button>';
    document.getElementById("boton-iniciar-carrera").addEventListener("click", () => this.cuentaRegresiva());
  },

  // Hago una cuenta regresiva 3, 2, 1 para generar nervios antes de arrancar.
  cuentaRegresiva() {
    const centro = document.getElementById("centro-carrera");
    let numero = 3;
    centro.innerHTML = `<div class="cuenta-regresiva">${numero}</div>`;
    const intervalo = setInterval(() => {
      numero--;
      if (numero > 0) {
        centro.querySelector(".cuenta-regresiva").textContent = numero;
      } else {
        clearInterval(intervalo);
        centro.innerHTML = '<div class="cuenta-regresiva">💘</div>';
        this.jugando = true;
        // Quito el emoji central al segundo para que no estorbe los toques.
        setTimeout(() => { centro.innerHTML = ""; }, 800);
      }
    }, 800);
  },

  // Registro cada toque del jugador. Uso pointerdown en vez de click
  // porque responde más rápido en pantallas táctiles Android.
  tocar(jugador) {
    if (!this.jugando) return;
    this.progreso[jugador] = Math.min(100, this.progreso[jugador] + 2);
    document.getElementById(`barra-${jugador}`).style.width = this.progreso[jugador] + "%";
    if (this.progreso[jugador] >= 100) this.terminar(jugador);
  },

  // Aquí anuncio al ganador y entrego los premios.
  terminar(ganador) {
    this.jugando = false;
    const nombreGanador = Estado.datos[ganador] || ganador;
    const perdedor = ganador === "novio" ? "novia" : "novio";
    const nombrePerdedor = Estado.datos[perdedor] || perdedor;

    // Reparto corazones: 8 por ganar, pero igual doy 3 por participar,
    // porque mi filosofía es que en pareja los dos siempre ganan algo.
    Estado.cambiarCorazones(8 + 3);
    Estado.datos.partidasJugadas++;
    Estado.guardar();

    Modal.abrir({
      emoji: "💋",
      titulo: `¡Ganó ${nombreGanador}!`,
      mensaje: `${nombrePerdedor}, perdiste la carrera... así que le debes un beso a ${nombreGanador}. ¡Es la regla! 😏`,
      premio: "+11 ❤️ para su alcancía de amor",
      alCerrar: () => Navegacion.ir("pantalla-mapa")
    });
  },

  // Conecto las dos zonas táctiles una sola vez al arrancar la app.
  iniciar() {
    document.getElementById("zona-novio").addEventListener("pointerdown", () => this.tocar("novio"));
    document.getElementById("zona-novia").addEventListener("pointerdown", () => this.tocar("novia"));
  }
};
