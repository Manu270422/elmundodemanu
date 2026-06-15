/* ============================================================
   datos-mundos.js — Mi catálogo de mundos y minijuegos.
   Separé estos datos del código para poder agregar mundos nuevos
   editando solo este archivo, sin tocar la lógica del juego.
   ============================================================ */

const MUNDOS = [
  {
    id: 1,
    nombre: "Primeras Sonrisas",
    emoji: "😊",
    costo: 0, // El primer mundo es gratis: quiero que jueguen de inmediato.
    descripcion: "Donde todo comienza: risas, toques rápidos y el primer beso apostado.",
    minijuegos: [
      {
        id: "carrera-del-beso",
        nombre: "Carrera del Beso",
        emoji: "💋",
        descripcion: "Toquen rápido su mitad. Quien pierde, paga con un beso.",
        disponible: true // Este es mi primer minijuego programado.
      },
      {
        id: "corazon-equilibrado",
        nombre: "Corazón Equilibrado",
        emoji: "🫶",
        descripcion: "Mantengan el corazón flotando en equipo.",
        disponible: true // ¡Programado en la Fase 2!
      }
    ]
  },
  {
    id: 2,
    nombre: "Química",
    emoji: "🧪",
    costo: 20,
    descripcion: "¿Qué tanto se conocen realmente? Aquí lo descubren.",
    minijuegos: [
      { id: "quien-me-conoce", nombre: "¿Quién Me Conoce Más?", emoji: "🧠", descripcion: "Uno responde en secreto, el otro adivina. 5 rondas.", disponible: true }
    ]
  },
  {
    id: 3,
    nombre: "Locuras Juntos",
    emoji: "🎢",
    costo: 40,
    requisitoPartidas: 3, // Además de corazones, exijo 3 partidas jugadas: progresión real.
    descripcion: "Retos divertidos y pequeños enojos que terminan en abrazos.",
    minijuegos: [
      { id: "atrapa-el-amor", nombre: "Atrapa el Amor", emoji: "💘", descripcion: "45 segundos de lluvia de corazones. Dorados +3, rotos -1.", disponible: true }
    ]
  },
  {
    id: 4,
    nombre: "Confesiones",
    emoji: "🤫",
    costo: 60,
    requisitoPartidas: 6, // El mundo de las confesiones se gana jugando juntos.
    descripcion: "Verdades, secretos y nervios. Solo para valientes enamorados.",
    minijuegos: [
      { id: "ruleta-de-pareja", nombre: "Ruleta de Pareja", emoji: "🎡", descripcion: "22 retos, besos, confesiones y premios. Gira y obedece.", disponible: true }
    ]
  },
  {
    id: 5,
    nombre: "Para Siempre",
    emoji: "💍",
    costo: 100,
    requisitoPartidas: 10, // El mundo final es para parejas que de verdad juegan juntas.
    descripcion: "El mundo final. No hay competencia aquí: solo su historia.",
    minijuegos: [
      { id: "cartas-romanticas", nombre: "Cartas Románticas", emoji: "💌", descripcion: "Escriban y relean cartas guardadas para siempre.", disponible: true },
      { id: "capsula-del-tiempo", nombre: "Cápsula del Tiempo", emoji: "⏳", descripcion: "Mensajes sellados hasta una fecha del futuro.", disponible: true },
      { id: "cofre-de-recuerdos", nombre: "Cofre de Recuerdos", emoji: "🗝️", descripcion: "Logros, estadísticas y fechas de su historia.", disponible: true },
      { id: "final-del-juego", nombre: "Escena Final", emoji: "🌟", descripcion: "El cierre de Latidos. Solo al completar todo el mapa.", disponible: true }
    ]
  }
];
