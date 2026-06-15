/* ============================================================
   quien-me-conoce.js — Mi minijuego de conocimiento de pareja. 🧠
   Cómo lo diseñé:
   - Hay 5 rondas. En cada ronda uno es el "protagonista" y el otro adivina.
   - El protagonista lee la pregunta en secreto y elige SU respuesta real.
   - Le pasa el teléfono al otro, que intenta adivinar qué eligió.
   - Si coinciden: punto y +3 corazones. Van alternando protagonista.
   - Al final muestro el "nivel de química" de la pareja.
   ============================================================ */

const QuienMeConoce = {
  // Mi banco de preguntas. Cada una tiene 4 opciones.
  // Las escribí pensando en provocar risas y confesiones, no en ser difíciles.
  PREGUNTAS: [
    { texto: "¿Cuál es mi forma favorita de recibir cariño?", opciones: ["Abrazos largos", "Besos sorpresa", "Palabras bonitas", "Detalles y regalos"] },
    { texto: "Si pudiera teletransportarme ya mismo, ¿a dónde iría?", opciones: ["La playa", "Otro país", "Mi cama", "Donde está mi pareja"] },
    { texto: "¿Qué me enamoró primero de ti?", opciones: ["Tu sonrisa", "Tu forma de hablar", "Tus ojos", "Tu locura"] },
    { texto: "¿Cuál es mi antojo de medianoche?", opciones: ["Algo dulce", "Comida rápida", "Algo salado", "No como de noche"] },
    { texto: "¿Qué haría si me gano la lotería?", opciones: ["Viajar contigo", "Comprar casa", "Ahorrar todo", "Gastarla en locuras"] },
    { texto: "¿Cuál es mi mayor miedo en la relación?", opciones: ["Que nos alejemos", "Las peleas", "La rutina", "No tengo miedos"] },
    { texto: "¿Qué prefiero un viernes en la noche?", opciones: ["Película y cobijas", "Salir a comer", "Fiesta", "Dormir temprano"] },
    { texto: "Si fuera un emoji, ¿cuál sería?", opciones: ["😂", "😍", "😈", "🥺"] },
    { texto: "¿Qué canción me recuerda a nosotros?", opciones: ["Una romántica", "Una de fiesta", "Una vieja", "Tenemos LA canción"] },
    { texto: "¿Cuál sería mi cita perfecta?", opciones: ["Picnic atardecer", "Cena elegante", "Plan en casa", "Aventura extrema"] }
  ],

  ronda: 0,
  TOTAL_RONDAS: 5,
  aciertos: 0,
  protagonista: "novio",   // Quien responde la verdad. Alterno cada ronda.
  respuestaSecreta: null,  // Aquí guardo lo que eligió el protagonista.
  preguntasPartida: [],    // Las 5 preguntas barajadas de esta partida.

  preparar() {
    this.ronda = 0;
    this.aciertos = 0;
    this.protagonista = Math.random() < 0.5 ? "novio" : "novia";
    // Barajo mi banco con Fisher-Yates (el mismo que usé en SaberQuest)
    // y tomo solo 5 preguntas para esta partida.
    const baraja = [...this.PREGUNTAS];
    for (let i = baraja.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [baraja[i], baraja[j]] = [baraja[j], baraja[i]];
    }
    this.preguntasPartida = baraja.slice(0, this.TOTAL_RONDAS);
    this.faseSecreta();
  },

  // FASE 1: el protagonista responde en secreto.
  faseSecreta() {
    const nombre = Estado.datos[this.protagonista];
    const pregunta = this.preguntasPartida[this.ronda];
    document.getElementById("ronda-conoce").textContent = `Ronda ${this.ronda + 1} / ${this.TOTAL_RONDAS}`;
    document.getElementById("instruccion-conoce").textContent =
      `📱 Pásale el teléfono a ${nombre}. Responde la VERDAD en secreto, sin que te vean.`;
    this.pintarPregunta(pregunta, opcion => {
      this.respuestaSecreta = opcion;
      this.faseAdivinar();
    });
  },

  // FASE 2: la pareja intenta adivinar la respuesta secreta.
  faseAdivinar() {
    const adivino = this.protagonista === "novio" ? "novia" : "novio";
    const nombre = Estado.datos[adivino];
    const pregunta = this.preguntasPartida[this.ronda];
    document.getElementById("instruccion-conoce").textContent =
      `🤫 Ahora pásale el teléfono a ${nombre}. ¿Qué crees que respondió tu pareja?`;
    this.pintarPregunta(pregunta, opcion => this.resolver(opcion));
  },

  // Pinto la pregunta y sus 4 opciones. Recibo por parámetro qué hacer
  // al elegir, así reutilizo esta función para las dos fases.
  pintarPregunta(pregunta, alElegir) {
    document.getElementById("pregunta-conoce").textContent = pregunta.texto;
    const lista = document.getElementById("opciones-conoce");
    lista.innerHTML = "";
    pregunta.opciones.forEach(opcion => {
      const boton = document.createElement("button");
      boton.className = "boton-opcion";
      boton.textContent = opcion;
      boton.addEventListener("click", () => alElegir(opcion));
      lista.appendChild(boton);
    });
  },

  // Comparo la adivinanza con la respuesta secreta y reparto premios.
  resolver(adivinanza) {
    const acerto = adivinanza === this.respuestaSecreta;
    if (acerto) {
      this.aciertos++;
      Estado.cambiarCorazones(3);
    }
    Modal.abrir({
      emoji: acerto ? "🎯" : "😅",
      titulo: acerto ? "¡Conexión total!" : "¡Falló!",
      mensaje: acerto
        ? "Adivinaste exactamente lo que respondió tu pareja."
        : `La respuesta real era: "${this.respuestaSecreta}". Tema de conversación gratis 😏`,
      premio: acerto ? "+3 ❤️" : "",
      alCerrar: () => this.siguienteRonda()
    });
  },

  siguienteRonda() {
    this.ronda++;
    // Alterno el protagonista para que los dos respondan y los dos adivinen.
    this.protagonista = this.protagonista === "novio" ? "novia" : "novio";
    if (this.ronda < this.TOTAL_RONDAS) this.faseSecreta();
    else this.terminar();
  },

  // Calculo el nivel de química final según los aciertos.
  terminar() {
    Estado.datos.partidasJugadas++;
    // Bono final por completar la partida, además de lo ganado por ronda.
    Estado.cambiarCorazones(5);
    Estado.guardar();
    const porcentaje = Math.round((this.aciertos / this.TOTAL_RONDAS) * 100);
    // Mis niveles de química: les puse nombres con humor para que se rían
    // incluso si les va mal.
    let nivel;
    if (porcentaje >= 80) nivel = "🔥 Almas gemelas certificadas";
    else if (porcentaje >= 60) nivel = "💞 Química seria";
    else if (porcentaje >= 40) nivel = "🙂 Van por buen camino";
    else nivel = "🙈 Urgente: más citas, menos celular";
    Modal.abrir({
      emoji: "🧪",
      titulo: `Química: ${porcentaje}%`,
      mensaje: `${this.aciertos} de ${this.TOTAL_RONDAS} aciertos. Veredicto: ${nivel}`,
      premio: "+5 ❤️ por completar la partida",
      alCerrar: () => Navegacion.ir("pantalla-mapa")
    });
  },

  iniciar() {
    // Este minijuego no necesita listeners globales: todo se conecta
    // dinámicamente al pintar cada pregunta. Dejo la función por
    // consistencia con la arquitectura de mis otros minijuegos.
  }
};
