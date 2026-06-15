/* ============================================================
   capsula-del-tiempo.js — Mensajes para el futuro de la pareja. ⏳
   Cómo la diseñé:
   - Escriben un mensaje juntos y eligen una fecha futura.
   - La cápsula queda SELLADA: nadie puede leerla antes de tiempo.
   - Cuando llega la fecha, se desbloquea sola y pueden abrirla.
   - Comparo fechas en formato YYYY-MM-DD para evitar líos de horas.
   ============================================================ */

const CapsulaDelTiempo = {
  asegurar() {
    if (!Estado.datos.capsulas) { Estado.datos.capsulas = []; Estado.guardar(); }
  },

  preparar() {
    this.asegurar();
    // La fecha mínima del selector es mañana: una cápsula para hoy no es cápsula.
    const manana = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    document.getElementById("fecha-capsula").min = manana;
    document.getElementById("fecha-capsula").value = "";
    document.getElementById("texto-capsula").value = "";
    this.pintarLista();
  },

  hoy() { return new Date().toISOString().slice(0, 10); },

  sellar() {
    const texto = document.getElementById("texto-capsula").value.trim();
    const fecha = document.getElementById("fecha-capsula").value;
    if (texto.length < 10 || !fecha) {
      Modal.abrir({ emoji: "🙈", titulo: "Falta algo", mensaje: "Escriban el mensaje y elijan la fecha futura en que podrán abrirlo." });
      return;
    }
    if (fecha <= this.hoy()) {
      Modal.abrir({ emoji: "⏳", titulo: "Esa fecha ya pasó", mensaje: "Una cápsula del tiempo viaja al futuro. Elijan una fecha que esté por venir." });
      return;
    }
    Estado.datos.capsulas.push({ texto, fecha, abierta: false, sellada: this.hoy() });
    Estado.cambiarCorazones(5);
    Estado.guardar();
    Modal.abrir({
      emoji: "⏳",
      titulo: "Cápsula sellada",
      mensaje: `Su mensaje viaja al ${this.formatear(fecha)}. Hasta ese día, ni ustedes mismos podrán leerlo.`,
      premio: "+5 ❤️ por apostarle al futuro",
      alCerrar: () => this.preparar()
    });
  },

  // Convierto YYYY-MM-DD a fecha bonita en español sin problemas de zona horaria.
  formatear(fechaISO) {
    const [a, m, d] = fechaISO.split("-");
    return new Date(a, m - 1, d).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
  },

  pintarLista() {
    const lista = document.getElementById("lista-capsulas");
    lista.innerHTML = "";
    if (Estado.datos.capsulas.length === 0) {
      lista.innerHTML = '<p class="texto-vacio">Aún no han enviado mensajes al futuro.</p>';
      return;
    }
    Estado.datos.capsulas.forEach((capsula, i) => {
      const desbloqueada = this.hoy() >= capsula.fecha;
      const tarjeta = document.createElement("div");
      tarjeta.className = "tarjeta-minijuego" + (desbloqueada ? "" : " proximamente");
      tarjeta.style.cursor = "pointer"; // Incluso bloqueada quiero que reaccione al toque.
      tarjeta.innerHTML = `
        <span class="emoji-minijuego">${desbloqueada ? "🔓" : "🔒"}</span>
        <div><h4>${desbloqueada ? "¡Lista para abrir!" : "Sellada"}</h4>
        <p>Se abre el ${this.formatear(capsula.fecha)} · sellada el ${this.formatear(capsula.sellada)}</p></div>
      `;
      tarjeta.addEventListener("click", () => this.abrir(capsula, desbloqueada, i));
      lista.appendChild(tarjeta);
    });
  },

  abrir(capsula, desbloqueada, indice) {
    if (!desbloqueada) {
      // Aquí está la magia: me niego a mostrar el mensaje antes de tiempo.
      Modal.abrir({
        emoji: "🔒",
        titulo: "Todavía no",
        mensaje: `Esta cápsula se abre el ${this.formatear(capsula.fecha)}. Lo bueno se hace esperar... como ustedes dos.`
      });
      return;
    }
    // Marco la primera apertura para mi sistema de logros.
    if (!capsula.abierta) {
      Estado.datos.capsulas[indice].abierta = true;
      Estado.cambiarCorazones(10);
      Estado.guardar();
    }
    Modal.abrir({
      emoji: "💞",
      titulo: `Mensaje del ${this.formatear(capsula.sellada)}`,
      mensaje: capsula.texto,
      premio: capsula.abierta ? "" : "+10 ❤️ por reencontrarse con su pasado",
      alCerrar: () => this.pintarLista()
    });
  },

  iniciar() {
    document.getElementById("boton-sellar-capsula").addEventListener("click", () => this.sellar());
  }
};
