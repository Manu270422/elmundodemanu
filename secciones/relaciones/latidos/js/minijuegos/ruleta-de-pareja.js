/* ============================================================
   ruleta-de-pareja.js — Mi ruleta de retos románticos. 🎡
   Cómo la diseñé:
   - Dibujo la ruleta con un conic-gradient generado desde JS,
     un sector de color por categoría.
   - El giro usa cubic-bezier para desacelerar suave, como ruleta real.
   - Tengo 22 resultados en 5 categorías + 2 especiales raros.
   - Guardo el último resultado para NUNCA repetirlo de inmediato.
   ============================================================ */

const RuletaDePareja = {
  // Mis categorías con su color propio. El color pinta el sector
  // de la ruleta y el borde de la tarjeta de resultado.
  CATEGORIAS: {
    besos:       { emoji: "💋", color: "#ff4f8b" },
    abrazos:     { emoji: "🫂", color: "#4fc3f7" },
    confesiones: { emoji: "💌", color: "#b388ff" },
    retos:       { emoji: "😈", color: "#ff9e43" },
    premios:     { emoji: "🎁", color: "#ffd166" },
    especial:    { emoji: "⭐", color: "#fff" }
  },

  // Mi banco de 22 resultados. Los escribí pensando en provocar
  // exactamente lo que quiero: risas, besos, nervios y confesiones.
  RESULTADOS: [
    // 💋 Besos
    { cat: "besos", texto: "Dale un beso en la frente" },
    { cat: "besos", texto: "Beso en la mejilla... pero en cámara lenta" },
    { cat: "besos", texto: "Beso de 5 segundos, ni uno menos" },
    { cat: "besos", texto: "Beso en la mano como en la época antigua" },
    // 🫂 Abrazos
    { cat: "abrazos", texto: "Abrazo de 15 segundos sin hablar" },
    { cat: "abrazos", texto: "Abrazo de oso: el más fuerte que puedas" },
    { cat: "abrazos", texto: "Abrazo por la espalda sorpresa" },
    { cat: "abrazos", texto: "Quédense abrazados hasta el próximo giro" },
    // 💌 Confesiones
    { cat: "confesiones", texto: "Di algo que te enamora de tu pareja" },
    { cat: "confesiones", texto: "Confiesa qué pensaste la primera vez que se vieron" },
    { cat: "confesiones", texto: "Cuenta tu momento favorito juntos" },
    { cat: "confesiones", texto: "Di un secreto que nunca le hayas contado" },
    { cat: "confesiones", texto: "Describe a tu pareja en 3 palabras... bonitas" },
    // 😈 Retos
    { cat: "retos", texto: "Imita la risa de tu pareja" },
    { cat: "retos", texto: "Baila 10 segundos sin música" },
    { cat: "retos", texto: "Habla con acento raro hasta el próximo giro" },
    { cat: "retos", texto: "Imita cómo tu pareja se enoja" },
    { cat: "retos", texto: "Declárale tu amor como en novela dramática" },
    // 🎁 Premios
    { cat: "premios", texto: "Ganan +12 ❤️ juntos", corazones: 12 },
    { cat: "premios", texto: "Ganan +8 ❤️ por estar juntos hoy", corazones: 8 },
    // ⭐ Especiales raros
    { cat: "especial", texto: "⭐ Cita sorpresa: planéenla esta semana", raro: true },
    { cat: "especial", texto: "🔥 Doble premio: giren otra vez y hagan ambos retos", raro: true }
  ],

  ultimoIndice: -1,  // Con esto evito repetir el mismo resultado seguido.
  girando: false,
  anguloActual: 0,   // Acumulo el ángulo para que siempre gire hacia adelante.

  preparar() {
    this.girando = false;
    this.dibujarRuleta();
    document.getElementById("resultado-ruleta").classList.add("oculto");
  },

  // Genero el conic-gradient de la ruleta: un sector igual por resultado,
  // pintado con el color de su categoría. Así la ruleta se construye sola
  // si en el futuro agrego más resultados a mi banco.
  dibujarRuleta() {
    const total = this.RESULTADOS.length;
    const paso = 360 / total;
    const sectores = this.RESULTADOS.map((r, i) =>
      `${this.CATEGORIAS[r.cat].color} ${i * paso}deg ${(i + 1) * paso}deg`
    ).join(", ");
    const rueda = document.getElementById("rueda");
    rueda.style.background = `conic-gradient(${sectores})`;
    // Pongo los emojis de categoría flotando alrededor del centro como decoración.
    document.getElementById("emojis-rueda").textContent = "💋 🫂 💌 😈 🎁";
  },

  girar() {
    if (this.girando) return;
    this.girando = true;
    document.getElementById("resultado-ruleta").classList.add("oculto");

    // Elijo el resultado ANTES de girar y calculo el ángulo exacto
    // para que la flecha caiga en su sector. Los especiales raros solo
    // salen con 8% de probabilidad; el resto del tiempo sorteo normales.
    let indice;
    do {
      if (Math.random() < 0.08) {
        const raros = this.RESULTADOS.map((r, i) => r.raro ? i : -1).filter(i => i >= 0);
        indice = raros[Math.floor(Math.random() * raros.length)];
      } else {
        const normales = this.RESULTADOS.map((r, i) => r.raro ? -1 : i).filter(i => i >= 0);
        indice = normales[Math.floor(Math.random() * normales.length)];
      }
    } while (indice === this.ultimoIndice); // Regla: nunca repetir el inmediato anterior.
    this.ultimoIndice = indice;

    const total = this.RESULTADOS.length;
    const paso = 360 / total;
    // Apunto al centro del sector elegido. La flecha está arriba (0°),
    // y el gradiente crece horario, así que giro en negativo compensando.
    const anguloSector = indice * paso + paso / 2;
    // Sumo entre 4 y 6 vueltas completas para que el giro se sienta real.
    const vueltas = 4 + Math.floor(Math.random() * 3);
    this.anguloActual += vueltas * 360 + (360 - anguloSector) - (this.anguloActual % 360);

    const rueda = document.getElementById("rueda");
    rueda.style.transform = `rotate(${this.anguloActual}deg)`;

    // La transición CSS dura 4s con desaceleración; revelo el resultado al terminar.
    setTimeout(() => this.revelar(indice), 4100);
  },

  revelar(indice) {
    this.girando = false;
    const resultado = this.RESULTADOS[indice];
    const cat = this.CATEGORIAS[resultado.cat];

    // Si el resultado regala corazones, los entrego de una vez.
    if (resultado.corazones) Estado.cambiarCorazones(resultado.corazones);
    Estado.datos.partidasJugadas++;
    Estado.guardar();

    // Pinto la tarjeta de resultado con el color de su categoría.
    const tarjeta = document.getElementById("resultado-ruleta");
    tarjeta.style.borderColor = cat.color;
    document.getElementById("emoji-resultado").textContent = cat.emoji;
    document.getElementById("texto-resultado").textContent = resultado.texto;
    tarjeta.classList.remove("oculto");
  },

  iniciar() {
    document.getElementById("boton-girar").addEventListener("click", () => this.girar());
  }
};
