/* ============================================================
   tienda.js — Mi tienda de decoraciones. 🛍️
   Por fin los corazones tienen en qué gastarse además de mundos:
   - TEMAS: cambian la paleta completa del juego (variables CSS).
   - AVATARES: la pareja elige sus emojis para la cabecera.
   - PARTÍCULAS: cambian los corazoncitos flotantes del fondo.
   Todo comprado queda guardado para siempre en el Estado.
   ============================================================ */

const Tienda = {
  // Mi catálogo. Cada tema redefine los tokens de color que
  // centralicé en :root desde la Fase 1: esa decisión paga hoy.
  TEMAS: [
    { id: "noche",     nombre: "Noche Romántica", emoji: "🌙", costo: 0,
      vars: { "--fondo": "#1a0b14", "--fondo-tarjeta": "#2b1220", "--rosa": "#ff4f8b", "--rosa-suave": "#ff9ebc", "--dorado": "#ffd166" } },
    { id: "atardecer", nombre: "Atardecer",       emoji: "🌅", costo: 25,
      vars: { "--fondo": "#2b0f0a", "--fondo-tarjeta": "#3d1a10", "--rosa": "#ff7849", "--rosa-suave": "#ffb199", "--dorado": "#ffd166" } },
    { id: "oceano",    nombre: "Océano Profundo", emoji: "🌊", costo: 25,
      vars: { "--fondo": "#06121f", "--fondo-tarjeta": "#0e2236", "--rosa": "#3fd0ff", "--rosa-suave": "#9be4ff", "--dorado": "#ffe08a" } },
    { id: "jardin",    nombre: "Jardín Secreto",  emoji: "🌿", costo: 25,
      vars: { "--fondo": "#0c1a10", "--fondo-tarjeta": "#16301d", "--rosa": "#5fe08f", "--rosa-suave": "#aef0c4", "--dorado": "#ffd166" } },
    { id: "galaxia",   nombre: "Galaxia",         emoji: "🌌", costo: 40,
      vars: { "--fondo": "#0d0a1f", "--fondo-tarjeta": "#1c1438", "--rosa": "#b388ff", "--rosa-suave": "#d4bbff", "--dorado": "#ffe08a" } }
  ],

  AVATARES: [
    { id: "clasico",   nombre: "Clásicos",  novio: "🤵", novia: "👰", costo: 0 },
    { id: "realeza",   nombre: "Realeza",   novio: "🤴", novia: "👸", costo: 20 },
    { id: "ositos",    nombre: "Ositos",    novio: "🐻", novia: "🐰", costo: 20 },
    { id: "gatunos",   nombre: "Michis",    novio: "😼", novia: "😻", costo: 20 },
    { id: "magicos",   nombre: "Mágicos",   novio: "🧙‍♂️", novia: "🧚‍♀️", costo: 30 },
    { id: "espaciales",nombre: "Astronautas", novio: "👨‍🚀", novia: "👩‍🚀", costo: 30 }
  ],

  PARTICULAS: [
    { id: "corazones", nombre: "Corazones", emojis: ["💗", "💕", "💘", "✨"], costo: 0 },
    { id: "estrellas", nombre: "Estrellas", emojis: ["⭐", "🌟", "✨", "💫"], costo: 15 },
    { id: "flores",    nombre: "Flores",    emojis: ["🌸", "🌷", "🌹", "🌺"], costo: 15 },
    { id: "mariposas", nombre: "Mariposas", emojis: ["🦋", "💫", "🦋", "✨"], costo: 15 },
    { id: "fuegos",    nombre: "Chispitas", emojis: ["🎆", "🎇", "✨", "💥"], costo: 25 }
  ],

  // Aseguro la estructura de la tienda en el Estado. Lo gratis
  // viene comprado y activado de fábrica.
  asegurar() {
    if (!Estado.datos.tienda) {
      Estado.datos.tienda = {
        comprados: ["tema-noche", "avatar-clasico", "particulas-corazones"],
        temaActivo: "noche",
        avatarActivo: "clasico",
        particulasActivas: "corazones"
      };
      Estado.guardar();
    }
  },

  // ===== Aplicar lo activo =====

  // Aplico el tema pintando las variables CSS de :root.
  // Como TODO mi CSS bebe de esas variables, el juego entero cambia de ropa.
  aplicarTema() {
    const tema = this.TEMAS.find(t => t.id === Estado.datos.tienda.temaActivo) || this.TEMAS[0];
    Object.entries(tema.vars).forEach(([v, valor]) => document.documentElement.style.setProperty(v, valor));
    document.body.style.background = `radial-gradient(circle at 50% 20%, ${tema.vars["--fondo-tarjeta"]}, ${tema.vars["--fondo"]} 70%)`;
  },

  // Pinto los avatares de la pareja en la cabecera del mapa.
  aplicarAvatar() {
    const a = this.AVATARES.find(x => x.id === Estado.datos.tienda.avatarActivo) || this.AVATARES[0];
    const texto = document.getElementById("texto-pareja");
    if (Estado.datos.novio) texto.textContent = `${a.novio} ${Estado.datos.novio} 💞 ${Estado.datos.novia} ${a.novia}`;
  },

  // Devuelvo el set de partículas activo: app.js lo consulta al crear cada una.
  emojisParticulas() {
    this.asegurar();
    const p = this.PARTICULAS.find(x => x.id === Estado.datos.tienda.particulasActivas) || this.PARTICULAS[0];
    return p.emojis;
  },

  // ===== Pantalla de la tienda =====

  preparar() {
    this.asegurar();
    this.pintarSeccion("seccion-temas", this.TEMAS, "tema", Estado.datos.tienda.temaActivo,
      t => `<span class="emoji-minijuego">${t.emoji}</span><div><h4>${t.nombre}</h4></div>`);
    this.pintarSeccion("seccion-avatares", this.AVATARES, "avatar", Estado.datos.tienda.avatarActivo,
      a => `<span class="emoji-minijuego">${a.novio}${a.novia}</span><div><h4>${a.nombre}</h4></div>`);
    this.pintarSeccion("seccion-particulas", this.PARTICULAS, "particulas", Estado.datos.tienda.particulasActivas,
      p => `<span class="emoji-minijuego">${p.emojis[0]}${p.emojis[1]}</span><div><h4>${p.nombre}</h4></div>`);
  },

  // Pinto una sección completa de la tienda. Reutilizo la misma función
  // para temas, avatares y partículas pasándole cómo dibujar cada tarjeta.
  pintarSeccion(idContenedor, catalogo, tipo, activoId, dibujar) {
    const contenedor = document.getElementById(idContenedor);
    contenedor.innerHTML = "";
    catalogo.forEach(item => {
      const llave = `${tipo}-${item.id}`;
      const comprado = Estado.datos.tienda.comprados.includes(llave);
      const activo = item.id === activoId;
      const tarjeta = document.createElement("div");
      tarjeta.className = "tarjeta-minijuego tarjeta-tienda" + (activo ? " activo-tienda" : "");
      tarjeta.innerHTML = dibujar(item) +
        `<span class="costo-mundo">${activo ? "✓ En uso" : comprado ? "Usar" : `❤️ ${item.costo}`}</span>`;
      tarjeta.addEventListener("click", () => this.elegir(tipo, item, llave, comprado));
      contenedor.appendChild(tarjeta);
    });
  },

  elegir(tipo, item, llave, comprado) {
    // Si no lo han comprado, intento cobrarlo.
    if (!comprado) {
      if (Estado.datos.corazones < item.costo) {
        Modal.abrir({ emoji: "💔", titulo: "Les faltan corazones", mensaje: `Necesitan ❤️ ${item.costo}. Jueguen más juntos y vuelvan por "${item.nombre}".` });
        return;
      }
      Estado.cambiarCorazones(-item.costo);
      Estado.datos.tienda.comprados.push(llave);
    }
    // Activo la compra de inmediato: comprar y estrenar.
    if (tipo === "tema") { Estado.datos.tienda.temaActivo = item.id; this.aplicarTema(); }
    if (tipo === "avatar") { Estado.datos.tienda.avatarActivo = item.id; this.aplicarAvatar(); }
    if (tipo === "particulas") Estado.datos.tienda.particulasActivas = item.id;
    Estado.guardar();
    this.preparar(); // Repinto la tienda para mover el "✓ En uso".
  },

  iniciar() {
    this.asegurar();
    this.aplicarTema();   // Restauro el tema comprado apenas abre el juego.

    // Envuelvo actualizarCabecera para que los avatares sobrevivan
    // a cualquier repintado de la cabecera, sin tocar app.js de nuevo.
    const actualizar = App.actualizarCabecera.bind(App);
    App.actualizarCabecera = () => { actualizar(); this.aplicarAvatar(); };
    this.aplicarAvatar();

    document.getElementById("boton-tienda").addEventListener("click", () => {
      this.preparar();
      Navegacion.ir("pantalla-tienda");
    });
  }
};
