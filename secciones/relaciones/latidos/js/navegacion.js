/* ============================================================
   navegacion.js — Mi mini-router de pantallas.
   No quise usar React ni un framework: con este sistema simple
   de mostrar/ocultar secciones tengo navegación instantánea
   y cero dependencias, perfecto para Capacitor.
   ============================================================ */

const Navegacion = {
  // Muestro una pantalla por su id y oculto todas las demás.
  ir(idPantalla) {
    document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activa"));
    document.getElementById(idPantalla).classList.add("activa");
  },

  // Conecto automáticamente todos los botones que tengan data-ir.
  // Así agrego navegación nueva solo con HTML, sin escribir más JS.
  iniciar() {
    document.querySelectorAll("[data-ir]").forEach(boton => {
      boton.addEventListener("click", () => this.ir(boton.dataset.ir));
    });
  }
};

/* ============================================================
   Modal reutilizable.
   Lo uso para anunciar al ganador, entregar corazones y dar
   el "castigo romántico" del minijuego. Un solo modal para todo.
   ============================================================ */
const Modal = {
  // alCerrar es una función opcional que ejecuto cuando cierran el modal.
  // La necesito para volver al mapa después de la Carrera del Beso.
  abrir({ emoji = "💕", titulo = "", mensaje = "", premio = "", alCerrar = null }) {
    document.getElementById("emoji-modal").textContent = emoji;
    document.getElementById("titulo-modal").textContent = titulo;
    document.getElementById("mensaje-modal").textContent = mensaje;
    document.getElementById("premio-modal").textContent = premio;
    document.getElementById("modal").classList.remove("oculto");
    this._alCerrar = alCerrar;
  },

  cerrar() {
    document.getElementById("modal").classList.add("oculto");
    if (this._alCerrar) {
      // Guardo la función en una variable temporal y limpio antes de ejecutarla
      // para evitar que se dispare dos veces si abren otro modal adentro.
      const fn = this._alCerrar;
      this._alCerrar = null;
      fn();
    }
  },

  iniciar() {
    document.getElementById("boton-cerrar-modal").addEventListener("click", () => this.cerrar());
  }
};
