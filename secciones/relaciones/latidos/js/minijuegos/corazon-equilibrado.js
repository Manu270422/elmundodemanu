/* ============================================================
   corazon-equilibrado.js — Mi minijuego cooperativo. 🫶
   Reglas que diseñé:
   - Un corazón flota en el centro y la gravedad lo empuja hacia abajo.
   - El novio controla el impulso desde la izquierda, la novia desde la derecha.
   - Cada toque da un empujoncito hacia arriba en su lado.
   - Si el corazón se inclina mucho hacia un lado o cae, pierden los dos.
   - Si sobreviven 30 segundos, ganan los dos. Aquí o cooperan o nada.
   ============================================================ */

const CorazonEquilibrado = {
  // El estado físico de mi corazón: altura (0 abajo, 100 arriba)
  // e inclinación (-50 muy a la izquierda, +50 muy a la derecha).
  altura: 50,
  inclinacion: 0,
  tiempo: 0,
  jugando: false,
  intervalo: null,
  META_SEGUNDOS: 30,

  preparar() {
    this.altura = 50;
    this.inclinacion = 0;
    this.tiempo = 0;
    this.jugando = false;
    clearInterval(this.intervalo);
    document.getElementById("nombre-equilibrio-novio").textContent = Estado.datos.novio || "Novio";
    document.getElementById("nombre-equilibrio-novia").textContent = Estado.datos.novia || "Novia";
    document.getElementById("tiempo-equilibrio").textContent = `0 / ${this.META_SEGUNDOS}s`;
    document.getElementById("centro-equilibrio").innerHTML =
      '<button class="boton-principal" id="boton-iniciar-equilibrio">¡A cooperar! 🫶</button>';
    document.getElementById("boton-iniciar-equilibrio").addEventListener("click", () => this.arrancar());
    this.dibujar();
  },

  arrancar() {
    document.getElementById("centro-equilibrio").innerHTML = "";
    this.jugando = true;
    // Mi loop de física corre cada 50ms: aplica gravedad, desequilibrio
    // aleatorio y revisa si la pareja sigue viva.
    this.intervalo = setInterval(() => this.fisica(), 50);
  },

  fisica() {
    // La gravedad baja el corazón poco a poco.
    this.altura -= 0.55;
    // Le meto un viento aleatorio a la inclinación para que tengan
    // que estar atentos los dos, no solo uno.
    this.inclinacion += (Math.random() - 0.5) * 2.2;
    // La inclinación también se acentúa sola: si está torcido, se tuerce más.
    this.inclinacion *= 1.012;

    this.tiempo += 0.05;
    document.getElementById("tiempo-equilibrio").textContent =
      `${Math.floor(this.tiempo)} / ${this.META_SEGUNDOS}s`;

    this.dibujar();

    // Condiciones de derrota: el corazón cayó o se volteó demasiado.
    if (this.altura <= 0 || Math.abs(this.inclinacion) >= 50) {
      this.terminar(false);
    } else if (this.tiempo >= this.META_SEGUNDOS) {
      this.terminar(true);
    }
  },

  // Cada toque empuja el corazón hacia arriba Y lo inclina hacia el lado
  // contrario del que tocó. Así se obligan a turnarse: pura coordinación.
  tocar(jugador) {
    if (!this.jugando) return;
    this.altura = Math.min(100, this.altura + 4);
    if (jugador === "novio") this.inclinacion += 3.5;  // Él empuja desde la izquierda.
    else this.inclinacion -= 3.5;                       // Ella empuja desde la derecha.
    this.dibujar();
  },

  // Pinto el corazón según la física: posición vertical e inclinación.
  dibujar() {
    const corazon = document.getElementById("corazon-flotante");
    corazon.style.bottom = 15 + this.altura * 0.6 + "%";
    corazon.style.left = `calc(50% + ${this.inclinacion * 2.2}px)`;
    corazon.style.transform = `translateX(-50%) rotate(${this.inclinacion}deg)`;
    // Cambio el emoji según el peligro para avisarles sin texto.
    corazon.textContent = Math.abs(this.inclinacion) > 35 || this.altura < 18 ? "💔" : "💗";
  },

  terminar(ganaron) {
    this.jugando = false;
    clearInterval(this.intervalo);

    if (ganaron) {
      // Premio cooperativo grande: 15 corazones porque ganaron JUNTOS.
      Estado.cambiarCorazones(15);
      Estado.datos.partidasJugadas++;
      Estado.guardar();
      Modal.abrir({
        emoji: "🫶",
        titulo: "¡Lo lograron juntos!",
        mensaje: `${Estado.datos.novio} y ${Estado.datos.novia}, mantuvieron su corazón en el aire ${this.META_SEGUNDOS} segundos. Así se cuida un amor. Premio extra: abrazo de 10 segundos AHORA.`,
        premio: "+15 ❤️ por trabajar en equipo",
        alCerrar: () => Navegacion.ir("pantalla-mapa")
      });
    } else {
      // Aunque pierdan doy 4 corazones de consuelo: quiero que vuelvan a intentarlo.
      Estado.cambiarCorazones(4);
      Estado.guardar();
      Modal.abrir({
        emoji: "💔",
        titulo: "¡Se les cayó el corazón!",
        mensaje: `Aguantaron ${Math.floor(this.tiempo)} segundos. Castigo romántico: dense un beso de reconciliación y vuelvan a intentarlo.`,
        premio: "+4 ❤️ de consuelo",
        alCerrar: () => Navegacion.ir("pantalla-mapa")
      });
    }
  },

  iniciar() {
    document.getElementById("lado-equilibrio-novio").addEventListener("pointerdown", () => this.tocar("novio"));
    document.getElementById("lado-equilibrio-novia").addEventListener("pointerdown", () => this.tocar("novia"));
  }
};
