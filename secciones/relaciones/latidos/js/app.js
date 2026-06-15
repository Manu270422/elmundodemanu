/* ============================================================
   app.js — El director de orquesta de mi juego.
   Aquí conecto todos los módulos: estado, navegación, mundos
   y minijuegos. Este archivo decide qué se dibuja y cuándo.
   ============================================================ */

const App = {
  iniciar() {
    // Primero cargo el progreso guardado de la pareja.
    Estado.cargar();
    Navegacion.iniciar();
    Modal.iniciar();
    CarreraDelBeso.iniciar();
    CorazonEquilibrado.iniciar();
    QuienMeConoce.iniciar();
    AtrapaElAmor.iniciar();
    RuletaDePareja.iniciar();
    // Estadísticas va de último: envuelve a todos los minijuegos anteriores.
    Estadisticas.iniciar();
    // Mundo 5: las experiencias emocionales de la Fase Final.
    CartasRomanticas.iniciar();
    CapsulaDelTiempo.iniciar();
    CofreDeRecuerdos.iniciar();
    FinalDelJuego.iniciar();
    // Logros cierra la cadena: envuelve a Estado y a Estadisticas.
    Logros.iniciar();
    // Tienda y Sonidos van de últimos: visten y sonorizan todo lo anterior.
    Tienda.iniciar();
    Sonidos.iniciar();
    this.conectarNombres();
    this.crearParticulas();

    // Si la pareja ya jugó antes, los mando directo al mapa.
    // No quiero hacerlos escribir sus nombres cada vez.
    if (Estado.datos.novio && Estado.datos.novia) {
      this.actualizarCabecera();
      this.dibujarMapa();
    }
  },

  // Guardo los nombres de los dos únicos jugadores del juego.
  conectarNombres() {
    document.getElementById("boton-guardar-nombres").addEventListener("click", () => {
      const novio = document.getElementById("input-novio").value.trim();
      const novia = document.getElementById("input-novia").value.trim();
      // Valido que ambos escriban su nombre: este juego es de dos o de nadie.
      if (!novio || !novia) {
        Modal.abrir({ emoji: "🙈", titulo: "¡Faltan nombres!", mensaje: "Este juego es solo para ustedes dos. Escriban ambos nombres." });
        return;
      }
      Estado.datos.novio = novio;
      Estado.datos.novia = novia;
      Estado.guardar();
      this.actualizarCabecera();
      this.dibujarMapa();
      Navegacion.ir("pantalla-mapa");
    });
  },

  // Pinto los nombres y los corazones en la barra superior.
  actualizarCabecera() {
    document.getElementById("texto-pareja").textContent = `${Estado.datos.novio} 💞 ${Estado.datos.novia}`;
    Estado.cambiarCorazones(0); // Truco: sumar 0 refresca todos los contadores.
  },

  // Dibujo el camino de mundos estilo Duolingo desde los datos.
  dibujarMapa() {
    const lista = document.getElementById("lista-mundos");
    lista.innerHTML = "";
    MUNDOS.forEach(mundo => {
      const desbloqueado = Estado.mundoDesbloqueado(mundo.id);
      const nodo = document.createElement("div");
      nodo.className = "nodo-mundo" + (desbloqueado ? "" : " bloqueado");
      nodo.innerHTML = `
        <span class="emoji-mundo">${desbloqueado ? mundo.emoji : "🔒"}</span>
        <div class="info-mundo">
          <h3>Mundo ${mundo.id}: ${mundo.nombre}</h3>
          <p>${mundo.descripcion}</p>
        </div>
        ${desbloqueado ? "" : `<span class="costo-mundo">❤️ ${mundo.costo}</span>`}
      `;
      nodo.addEventListener("click", () => this.abrirMundo(mundo));
      lista.appendChild(nodo);
    });
  },

  // Manejo el clic sobre un mundo: si está bloqueado intento venderlo
  // por corazones; si está libre, muestro sus minijuegos.
  abrirMundo(mundo) {
    if (!Estado.mundoDesbloqueado(mundo.id)) {
      // Desbloqueo progresivo de la Fase 3: primero valido las partidas
      // jugadas y después cobro los corazones. Así los mundos se ganan
      // jugando juntos, no solo acumulando moneda.
      if (mundo.requisitoPartidas && Estado.datos.partidasJugadas < mundo.requisitoPartidas) {
        Modal.abrir({
          emoji: "🎮",
          titulo: "Aún no es el momento",
          mensaje: `Para entrar a "${mundo.nombre}" necesitan haber jugado ${mundo.requisitoPartidas} partidas juntos (llevan ${Estado.datos.partidasJugadas}). Sigan jugando, su historia apenas empieza.`
        });
        return;
      }
      if (Estado.desbloquearMundo(mundo.id, mundo.costo)) {
        Modal.abrir({
          emoji: "🎉",
          titulo: "¡Mundo desbloqueado!",
          mensaje: `Gastaron ${mundo.costo} corazones en "${mundo.nombre}". ¡Buena inversión de amor!`,
          alCerrar: () => { this.dibujarMapa(); this.abrirMundo(mundo); }
        });
      } else {
        Modal.abrir({
          emoji: "💔",
          titulo: "Les faltan corazones",
          mensaje: `Necesitan ❤️ ${mundo.costo} para entrar a "${mundo.nombre}". Jueguen más minijuegos juntos para ganarlos.`
        });
      }
      return;
    }

    // Pinto la pantalla del mundo con sus minijuegos.
    document.getElementById("titulo-mundo").textContent = `${mundo.emoji} ${mundo.nombre}`;
    document.getElementById("descripcion-mundo").textContent = mundo.descripcion;
    const lista = document.getElementById("lista-minijuegos");
    lista.innerHTML = "";
    mundo.minijuegos.forEach(juego => {
      const tarjeta = document.createElement("div");
      tarjeta.className = "tarjeta-minijuego" + (juego.disponible ? "" : " proximamente");
      tarjeta.innerHTML = `
        <span class="emoji-minijuego">${juego.emoji}</span>
        <div><h4>${juego.nombre}${juego.disponible ? "" : " (próximamente)"}</h4><p>${juego.descripcion}</p></div>
      `;
      if (juego.disponible) tarjeta.addEventListener("click", () => this.lanzarMinijuego(juego.id));
      lista.appendChild(tarjeta);
    });
    Navegacion.ir("pantalla-mundo");
  },

  // Aquí registro cómo se lanza cada minijuego. Cuando programe los
  // siguientes (Fase 2), solo agrego un case nuevo a este switch.
  lanzarMinijuego(id) {
    switch (id) {
      case "carrera-del-beso":
        CarreraDelBeso.preparar();
        Navegacion.ir("pantalla-carrera");
        break;
      // Fase 2: mis dos minijuegos nuevos ya conectados.
      case "corazon-equilibrado":
        CorazonEquilibrado.preparar();
        Navegacion.ir("pantalla-equilibrio");
        break;
      case "quien-me-conoce":
        QuienMeConoce.preparar();
        Navegacion.ir("pantalla-conoce");
        break;
      // Fase 3: mis dos minijuegos arcade nuevos.
      case "atrapa-el-amor":
        AtrapaElAmor.preparar();
        Navegacion.ir("pantalla-atrapa");
        break;
      case "ruleta-de-pareja":
        RuletaDePareja.preparar();
        Navegacion.ir("pantalla-ruleta");
        break;
      // Fase Final: las experiencias emocionales del Mundo 5.
      case "cartas-romanticas":
        CartasRomanticas.preparar();
        Navegacion.ir("pantalla-cartas");
        break;
      case "capsula-del-tiempo":
        CapsulaDelTiempo.preparar();
        Navegacion.ir("pantalla-capsula");
        break;
      case "cofre-de-recuerdos":
        CofreDeRecuerdos.preparar();
        Navegacion.ir("pantalla-cofre");
        break;
      case "final-del-juego":
        FinalDelJuego.preparar(); // Él mismo decide si están listos para el final.
        break;
    }
  },

  // Genero corazoncitos flotantes de fondo cada cierto tiempo.
  // Es puro ambiente romántico, no afecta el rendimiento del juego.
  crearParticulas() {
    setInterval(() => {
      const p = document.createElement("span");
      p.className = "particula";
      // Leo el set de partículas activo en la Tienda: corazones, estrellas,
      // flores... lo que la pareja haya comprado y estrenado.
      const set = Tienda.emojisParticulas();
      p.textContent = set[Math.floor(Math.random() * set.length)];
      p.style.left = Math.random() * 100 + "vw";
      p.style.fontSize = 12 + Math.random() * 20 + "px";
      p.style.animationDuration = 6 + Math.random() * 6 + "s";
      document.getElementById("particulas").appendChild(p);
      // Elimino cada partícula al terminar su animación para no llenar el DOM.
      setTimeout(() => p.remove(), 12000);
    }, 900);
  }
};

// Arranco todo cuando el DOM está listo.
document.addEventListener("DOMContentLoaded", () => App.iniciar());
