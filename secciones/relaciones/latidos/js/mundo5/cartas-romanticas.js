/* ============================================================
   cartas-romanticas.js — La experiencia emocional del Mundo 5. 💌
   Aquí la pareja escribe cartas reales el uno para el otro.
   - Cartas editables con autor, categoría y mensaje.
   - Se guardan para siempre en localStorage (dentro de mi Estado).
   - Se pueden releer cuando quieran: ese es el verdadero tesoro.
   ============================================================ */

const CartasRomanticas = {
  // Mis categorías de cartas. Cada una con su emoji y su color,
  // siguiendo el mismo lenguaje visual de la Ruleta.
  CATEGORIAS: {
    teamo:      { nombre: "Te amo",      emoji: "❤️", color: "#ff4f8b" },
    gracias:    { nombre: "Gracias",     emoji: "🙏", color: "#ffd166" },
    perdon:     { nombre: "Perdón",      emoji: "🕊️", color: "#4fc3f7" },
    motivacion: { nombre: "Ánimo",       emoji: "💪", color: "#b388ff" },
    libre:      { nombre: "Carta libre", emoji: "💌", color: "#ff9e43" }
  },

  // Aseguro que el arreglo de cartas exista en el Estado de la pareja.
  asegurar() {
    if (!Estado.datos.cartas) { Estado.datos.cartas = []; Estado.guardar(); }
  },

  preparar() {
    this.asegurar();
    this.modoEditor(false);
    this.pintarLista();
  },

  // Alterno entre la lista de cartas y el editor con una sola pantalla.
  modoEditor(activo) {
    document.getElementById("editor-carta").classList.toggle("oculto", !activo);
    document.getElementById("vista-cartas").classList.toggle("oculto", activo);
  },

  // Pinto el buzón: todas las cartas guardadas, de la más nueva a la más vieja.
  pintarLista() {
    const lista = document.getElementById("lista-cartas");
    lista.innerHTML = "";
    if (Estado.datos.cartas.length === 0) {
      lista.innerHTML = '<p class="texto-vacio">Su buzón está vacío. Escriban la primera carta de su historia. 💌</p>';
      return;
    }
    [...Estado.datos.cartas].reverse().forEach(carta => {
      const cat = this.CATEGORIAS[carta.categoria];
      const sobre = document.createElement("div");
      sobre.className = "tarjeta-minijuego";
      sobre.style.borderColor = cat.color;
      sobre.innerHTML = `
        <span class="emoji-minijuego">${cat.emoji}</span>
        <div><h4>${cat.nombre} — de ${carta.autor}</h4><p>${carta.fecha}</p></div>
      `;
      // Al tocar un sobre, abro la carta completa en mi modal reutilizable.
      sobre.addEventListener("click", () => {
        Modal.abrir({
          emoji: cat.emoji,
          titulo: `De ${carta.autor} con amor`,
          mensaje: carta.texto,
          premio: `${cat.nombre} · ${carta.fecha}`
        });
      });
      lista.appendChild(sobre);
    });
  },

  // Abro el editor con los selectores de autor y categoría ya pintados.
  abrirEditor() {
    const selectorAutor = document.getElementById("autor-carta");
    selectorAutor.innerHTML = `
      <option value="${Estado.datos.novio}">${Estado.datos.novio} 🤵</option>
      <option value="${Estado.datos.novia}">${Estado.datos.novia} 👰</option>
    `;
    const selectorCat = document.getElementById("categoria-carta");
    selectorCat.innerHTML = Object.entries(this.CATEGORIAS)
      .map(([id, c]) => `<option value="${id}">${c.emoji} ${c.nombre}</option>`).join("");
    document.getElementById("texto-carta").value = "";
    this.modoEditor(true);
  },

  guardarCarta() {
    const texto = document.getElementById("texto-carta").value.trim();
    // Pido mínimo 10 caracteres: una carta de amor de 3 letras no vale. 😄
    if (texto.length < 10) {
      Modal.abrir({ emoji: "🙈", titulo: "Muy cortica", mensaje: "Una carta de amor merece al menos unas palabras de verdad. Escribe un poco más." });
      return;
    }
    Estado.datos.cartas.push({
      autor: document.getElementById("autor-carta").value,
      categoria: document.getElementById("categoria-carta").value,
      texto,
      // Guardo la fecha en formato local colombiano para releerla bonita.
      fecha: new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
    });
    Estado.cambiarCorazones(5); // Premio escribir amor: +5 corazones.
    Estado.guardar();
    Modal.abrir({
      emoji: "💌",
      titulo: "Carta guardada para siempre",
      mensaje: "Quedó sellada en su buzón. Podrán releerla cuando el corazón lo pida.",
      premio: "+5 ❤️ por escribir amor",
      alCerrar: () => { this.modoEditor(false); this.pintarLista(); }
    });
  },

  iniciar() {
    document.getElementById("boton-nueva-carta").addEventListener("click", () => this.abrirEditor());
    document.getElementById("boton-guardar-carta").addEventListener("click", () => this.guardarCarta());
    document.getElementById("boton-cancelar-carta").addEventListener("click", () => this.modoEditor(false));
  }
};
