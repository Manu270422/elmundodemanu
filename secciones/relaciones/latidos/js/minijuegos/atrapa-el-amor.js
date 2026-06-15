/* ============================================================
   atrapa-el-amor.js — Mi minijuego arcade de captura. 💘
   Reglas que diseñé:
   - Caen corazones desde arriba durante 45 segundos.
   - El novio captura tocando en su mitad izquierda, la novia en la derecha.
   - Corazón normal 💗 = +1, dorado 💛 = +3, roto 💔 = -1.
   - 3 dorados seguidos = combo romántico con beso sorpresa.
   - Guardo mejor puntuación y partidas jugadas en el Estado.
   ============================================================ */

const AtrapaElAmor = {
  DURACION: 45,            // Segundos de partida.
  puntos: { novio: 0, novia: 0 },
  comboDorado: { novio: 0, novia: 0 }, // Racha de dorados seguidos de cada uno.
  tiempo: 0,
  jugando: false,
  intervaloCaida: null,    // Genera corazones nuevos.
  intervaloReloj: null,    // Cuenta el tiempo.

  preparar() {
    this.puntos = { novio: 0, novia: 0 };
    this.comboDorado = { novio: 0, novia: 0 };
    this.tiempo = this.DURACION;
    this.jugando = false;
    clearInterval(this.intervaloCaida);
    clearInterval(this.intervaloReloj);
    // Limpio corazones que hayan quedado de una partida anterior.
    document.querySelectorAll(".corazon-cayendo").forEach(c => c.remove());
    document.getElementById("nombre-atrapa-novio").textContent = Estado.datos.novio || "Novio";
    document.getElementById("nombre-atrapa-novia").textContent = Estado.datos.novia || "Novia";
    document.getElementById("puntos-atrapa-novio").textContent = "0";
    document.getElementById("puntos-atrapa-novia").textContent = "0";
    document.getElementById("reloj-atrapa").textContent = `⏱️ ${this.DURACION}s`;
    document.getElementById("centro-atrapa").innerHTML =
      '<button class="boton-principal" id="boton-iniciar-atrapa">¡A atrapar amor! 💘</button>';
    document.getElementById("boton-iniciar-atrapa").addEventListener("click", () => this.arrancar());
  },

  arrancar() {
    document.getElementById("centro-atrapa").innerHTML = "";
    this.jugando = true;
    // Suelto un corazón nuevo cada 600ms en una posición horizontal aleatoria.
    this.intervaloCaida = setInterval(() => this.soltarCorazon(), 600);
    // Mi reloj de partida: cada segundo descuento y reviso si terminó.
    this.intervaloReloj = setInterval(() => {
      this.tiempo--;
      document.getElementById("reloj-atrapa").textContent = `⏱️ ${this.tiempo}s`;
      if (this.tiempo <= 0) this.terminar();
    }, 1000);
  },

  // Aquí decido qué tipo de corazón cae. Calibré las probabilidades:
  // 65% normal, 20% roto (castigo), 15% dorado (premio raro).
  soltarCorazon() {
    if (!this.jugando) return;
    const azar = Math.random();
    let tipo;
    if (azar < 0.15) tipo = { emoji: "💛", valor: 3, clase: "dorado" };
    else if (azar < 0.35) tipo = { emoji: "💔", valor: -1, clase: "roto" };
    else tipo = { emoji: "💗", valor: 1, clase: "normal" };

    const corazon = document.createElement("div");
    corazon.className = "corazon-cayendo " + tipo.clase;
    corazon.textContent = tipo.emoji;
    // Posición horizontal aleatoria dejando margen para que no se corte.
    const x = 5 + Math.random() * 90;
    corazon.style.left = x + "vw";
    // Velocidad de caída variable para que no sea monótono.
    corazon.style.animationDuration = (2.2 + Math.random() * 1.8) + "s";

    // El lado donde cae decide quién puede atraparlo: izquierda él, derecha ella.
    const dueno = x < 50 ? "novio" : "novia";
    corazon.addEventListener("pointerdown", e => {
      e.stopPropagation();
      this.capturar(corazon, tipo, dueno);
    });

    document.getElementById("zona-lluvia").appendChild(corazon);
    // Si nadie lo atrapa, lo elimino al terminar su caída para no llenar el DOM.
    setTimeout(() => corazon.remove(), 4200);
  },

  capturar(corazon, tipo, jugador) {
    if (!this.jugando || corazon.dataset.capturado) return;
    corazon.dataset.capturado = "1";

    this.puntos[jugador] = Math.max(0, this.puntos[jugador] + tipo.valor);
    document.getElementById(`puntos-atrapa-${jugador}`).textContent = this.puntos[jugador];

    // Llevo la racha de dorados: 3 seguidos desbloquean el combo romántico.
    if (tipo.clase === "dorado") {
      this.comboDorado[jugador]++;
      if (this.comboDorado[jugador] === 3) {
        this.comboDorado[jugador] = 0;
        this.mostrarCombo(jugador);
      }
    } else {
      this.comboDorado[jugador] = 0; // Cualquier otro corazón rompe la racha.
    }

    // Animación de captura: exploto el corazón en mini-partículas.
    this.explotar(corazon, tipo.clase === "roto" ? "💢" : "✨");
    corazon.remove();
  },

  // Mis partículas de captura: 6 chispas que salen disparadas desde
  // el punto donde estaba el corazón y se desvanecen.
  explotar(elemento, emoji) {
    const rect = elemento.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      const chispa = document.createElement("span");
      chispa.className = "chispa";
      chispa.textContent = emoji;
      chispa.style.left = rect.left + rect.width / 2 + "px";
      chispa.style.top = rect.top + rect.height / 2 + "px";
      // Cada chispa vuela en una dirección aleatoria usando variables CSS.
      chispa.style.setProperty("--dx", (Math.random() - 0.5) * 140 + "px");
      chispa.style.setProperty("--dy", (Math.random() - 0.5) * 140 + "px");
      document.body.appendChild(chispa);
      setTimeout(() => chispa.remove(), 700);
    }
  },

  // Banner del combo romántico. No pauso el juego: el mensaje flota
  // unos segundos encima mientras siguen jugando, para no cortar el ritmo.
  mostrarCombo(jugador) {
    const nombre = Estado.datos[jugador] || jugador;
    const banner = document.createElement("div");
    banner.className = "banner-combo";
    banner.textContent = `✨ Combo romántico: ¡${nombre} desbloqueó un beso sorpresa!`;
    document.getElementById("pantalla-atrapa").appendChild(banner);
    setTimeout(() => banner.remove(), 3000);
  },

  terminar() {
    this.jugando = false;
    clearInterval(this.intervaloCaida);
    clearInterval(this.intervaloReloj);
    document.querySelectorAll(".corazon-cayendo").forEach(c => c.remove());

    const pn = this.puntos.novio, pa = this.puntos.novia;
    const mayor = Math.max(pn, pa);

    // Actualizo mis estadísticas: mejor puntuación histórica y partidas.
    if (!Estado.datos.atrapaElAmor) Estado.datos.atrapaElAmor = { mejorPuntuacion: 0, partidas: 0 };
    Estado.datos.atrapaElAmor.partidas++;
    if (mayor > Estado.datos.atrapaElAmor.mejorPuntuacion) {
      Estado.datos.atrapaElAmor.mejorPuntuacion = mayor;
    }
    Estado.datos.partidasJugadas++;

    // Reparto recompensas según el reglamento que definí:
    // ganador +10, perdedor +5, empate +8 para cada uno.
    let titulo, mensaje, premio;
    if (pn === pa) {
      Estado.cambiarCorazones(16); // 8 + 8 del empate.
      titulo = "¡Empate de amor!";
      mensaje = `${pn} - ${pa}. Quedaron parejos... como debe ser. Castigo doble: beso simultáneo a la cuenta de 3.`;
      premio = "+8 ❤️ cada uno (16 a la alcancía)";
    } else {
      const ganador = pn > pa ? "novio" : "novia";
      const perdedor = pn > pa ? "novia" : "novio";
      Estado.cambiarCorazones(15); // 10 + 5.
      titulo = `¡Ganó ${Estado.datos[ganador]}!`;
      mensaje = `Marcador ${mayor} - ${Math.min(pn, pa)} (diferencia de ${Math.abs(pn - pa)}). ${Estado.datos[perdedor]}, atrapaste menos amor... recompénsalo con un abrazo de oso.`;
      premio = `+10 ❤️ (ganador) y +5 ❤️ (perdedor). Récord histórico: ${Estado.datos.atrapaElAmor.mejorPuntuacion} pts`;
    }
    Estado.guardar();

    Modal.abrir({
      emoji: "💘",
      titulo, mensaje, premio,
      alCerrar: () => Navegacion.ir("pantalla-mapa")
    });
  },

  iniciar() {
    // No necesito listeners globales: cada corazón trae el suyo al nacer.
  }
};
