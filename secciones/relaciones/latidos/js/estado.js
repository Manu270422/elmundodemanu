/* ============================================================
   estado.js — El cerebro de datos de mi juego.
   Aquí guardo todo lo que la pareja va logrando: sus nombres,
   los corazones acumulados y los mundos desbloqueados.
   Decidí usar localStorage para que el progreso NUNCA se pierda,
   igual que hice en mi calculadora de notas.
   ============================================================ */

const Estado = {
  // Esta es la llave única con la que guardo todo en localStorage.
  // Le puse mi marca para evitar choques con otras apps mías en el mismo dominio.
  LLAVE: "latidos_elmundodemanu",

  // Estos son los datos por defecto de una pareja nueva.
  // Arranco con el Mundo 1 desbloqueado y 10 corazones de regalo de bienvenida.
  datos: {
    novio: "",
    novia: "",
    corazones: 10,
    mundosDesbloqueados: [1],
    partidasJugadas: 0
  },

  // Aquí cargo el progreso guardado. Si es la primera vez que juegan,
  // simplemente me quedo con los datos por defecto.
  cargar() {
    const guardado = localStorage.getItem(this.LLAVE);
    if (guardado) {
      // Mezclo lo guardado sobre los defaults por si en el futuro
      // agrego campos nuevos y las parejas antiguas no los tienen.
      this.datos = { ...this.datos, ...JSON.parse(guardado) };
    }
  },

  // Guardo después de cada cambio importante. Prefiero guardar de más
  // que arriesgarme a que pierdan sus corazones si cierran la app.
  guardar() {
    localStorage.setItem(this.LLAVE, JSON.stringify(this.datos));
  },

  // Con esta función sumo (o resto) corazones y actualizo
  // todos los contadores visibles de una sola vez.
  cambiarCorazones(cantidad) {
    this.datos.corazones = Math.max(0, this.datos.corazones + cantidad);
    this.guardar();
    // Actualizo los dos contadores (mapa y mundo) para que siempre coincidan.
    document.querySelectorAll(".contador-corazones").forEach(el => {
      el.textContent = `❤️ ${this.datos.corazones}`;
    });
  },

  // Verifico si la pareja ya desbloqueó un mundo.
  mundoDesbloqueado(id) {
    return this.datos.mundosDesbloqueados.includes(id);
  },

  // Intento desbloquear un mundo gastando corazones.
  // Devuelvo true si alcanzó el amor (los corazones), false si no.
  desbloquearMundo(id, costo) {
    if (this.datos.corazones < costo) return false;
    this.cambiarCorazones(-costo);
    this.datos.mundosDesbloqueados.push(id);
    this.guardar();
    return true;
  }
};
