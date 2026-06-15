/* ═══════════════════════════════════════════════════════════════
   DATA.JS — Base de datos del proyecto MundiCurioso
   ─────────────────────────────────────────────────────────────
   Aquí centralizo TODA la data del proyecto: preguntas de trivia,
   cartas del memorama y pares del juego Conecta.
   
   Si quiero agregar más contenido, solo edito este archivo
   sin tocar nada de la lógica de los juegos.
   
   Estructura general:
   - TRIVIA_DATA   → preguntas por categoría y dificultad
   - MEMORAMA_DATA → pares de cartas con datos curiosos
   - CONECTA_DATA  → conjuntos de pares para arrastrar y soltar
   
   — Carlos Turizo / El Mundo de Manu
═══════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────
// TRIVIA_DATA
// Cada pregunta tiene:
//   id       → identificador único
//   category → nombre de la categoría (coincide con la clave)
//   emoji    → ícono visual de la categoría
//   age      → rango de edad: "junior" (6-8) | "senior" (9-12) | "all"
//   question → texto de la pregunta
//   options  → array de 4 opciones (siempre 4)
//   correct  → índice de la opción correcta (0-3)
//   fact     → dato curioso que se muestra siempre después de responder
// ─────────────────────────────────────────────────────────────
const TRIVIA_DATA = {

  // ── ANIMALES ──────────────────────────────────────────────
  animales: {
    label: "Animales",
    emoji: "🐾",
    color: "#4ADE80",
    preguntas: [
      {
        id: "a01",
        age: "all",
        question: "¿Cuál es el animal más grande del mundo?",
        options: ["Elefante africano", "Ballena azul", "Tiburón ballena", "Jirafa"],
        correct: 1,
        fact: "🐋 La ballena azul puede llegar a medir 33 metros de largo y pesar 180 toneladas. ¡Su corazón es del tamaño de un auto pequeño!"
      },
      {
        id: "a02",
        age: "all",
        question: "¿Cuántos corazones tiene un pulpo?",
        options: ["1", "2", "3", "4"],
        correct: 2,
        fact: "🐙 Los pulpos tienen 3 corazones: dos bombean sangre a las branquias y uno la distribuye al resto del cuerpo. ¡Además, su sangre es de color azul!"
      },
      {
        id: "a03",
        age: "all",
        question: "¿Qué animal puede cambiar de color para camuflarse?",
        options: ["Cocodrilo", "Camaleón", "Iguana", "Tortuga"],
        correct: 1,
        fact: "🦎 El camaleón no cambia de color solo para camuflarse — también lo hace para comunicar emociones y regular su temperatura corporal."
      },
      {
        id: "a04",
        age: "all",
        question: "¿Cuál es el único mamífero que puede volar?",
        options: ["Ardilla voladora", "Murciélago", "Zarigüeya", "Colugos"],
        correct: 1,
        fact: "🦇 Los murciélagos son los únicos mamíferos con verdadero vuelo. Son además polinizadores esenciales — ¡muchas frutas que comemos existen gracias a ellos!"
      },
      {
        id: "a05",
        age: "junior",
        question: "¿Qué animal tiene rayas blancas y negras?",
        options: ["Jaguar", "Guepardo", "Cebra", "Hiena"],
        correct: 2,
        fact: "🦓 Las rayas de cada cebra son únicas, ¡como las huellas dactilares de las personas! También ayudan a confundir a los depredadores."
      },
      {
        id: "a06",
        age: "senior",
        question: "¿Cuánto tiempo puede dormir un oso durante el invierno?",
        options: ["1 semana", "1 mes", "3 a 7 meses", "Todo el año"],
        correct: 2,
        fact: "🐻 El hibernado de los osos no es exactamente un sueño: su temperatura baja solo 5°C y pueden despertar si hay peligro. ¡Las mamás incluso dan a luz mientras hibernan!"
      },
      {
        id: "a07",
        age: "all",
        question: "¿Qué animal es el más veloz en tierra?",
        options: ["León", "Guepardo", "Caballo", "Avestruz"],
        correct: 1,
        fact: "🐆 El guepardo puede alcanzar 120 km/h en solo 3 segundos. Sin embargo, solo puede mantener esa velocidad por unos 500 metros antes de agotarse."
      },
      {
        id: "a08",
        age: "senior",
        question: "¿Cuántos años puede vivir una tortuga gigante de Galápagos?",
        options: ["Hasta 50 años", "Hasta 80 años", "Hasta 120 años", "Más de 150 años"],
        correct: 3,
        fact: "🐢 Las tortugas de Galápagos son de los animales más longevos del mundo. ¡La famosa Harriet vivió más de 175 años! Su secreto: un metabolismo muy lento."
      }
    ]
  },

  // ── ESPACIO ───────────────────────────────────────────────
  espacio: {
    label: "Espacio",
    emoji: "🚀",
    color: "#818CF8",
    preguntas: [
      {
        id: "e01",
        age: "all",
        question: "¿Cuántos planetas hay en nuestro sistema solar?",
        options: ["7", "8", "9", "10"],
        correct: 1,
        fact: "🪐 Desde 2006, Plutón fue reclasificado como planeta enano. Los 8 planetas son: Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno."
      },
      {
        id: "e02",
        age: "all",
        question: "¿Cuál es el planeta más grande del sistema solar?",
        options: ["Saturno", "Neptuno", "Júpiter", "Urano"],
        correct: 2,
        fact: "🌟 Júpiter es tan grande que cabrían 1,300 planetas Tierra dentro de él. ¡Su famosa Mancha Roja es una tormenta que lleva más de 300 años activa!"
      },
      {
        id: "e03",
        age: "all",
        question: "¿Qué estrella está más cerca de la Tierra?",
        options: ["Sirio", "El Sol", "Próxima Centauri", "Vega"],
        correct: 1,
        fact: "☀️ El Sol está a solo 150 millones de km de la Tierra. La segunda estrella más cercana, Próxima Centauri, está a más de 4 años luz — ¡la luz tarda 4 años en llegar!"
      },
      {
        id: "e04",
        age: "senior",
        question: "¿En qué año llegó el primer ser humano a la Luna?",
        options: ["1961", "1965", "1969", "1972"],
        correct: 2,
        fact: "🌕 El 20 de julio de 1969, Neil Armstrong y Buzz Aldrin aterrizaron en la Luna con el Apolo 11. Las huellas que dejaron aún están ahí, ¡porque en la Luna no hay viento!"
      },
      {
        id: "e05",
        age: "junior",
        question: "¿De qué color es Marte?",
        options: ["Azul", "Verde", "Rojo", "Amarillo"],
        correct: 2,
        fact: "🔴 Marte es rojo porque su suelo contiene óxido de hierro (¡básicamente, óxido!). También tiene el volcán más alto del sistema solar: el Monte Olimpo, ¡3 veces más alto que el Everest!"
      },
      {
        id: "e06",
        age: "senior",
        question: "¿Qué es un agujero negro?",
        options: [
          "Un planeta muy oscuro",
          "Una región donde la gravedad es tan fuerte que ni la luz escapa",
          "Un túnel entre galaxias",
          "Una estrella apagada"
        ],
        correct: 1,
        fact: "⚫ Los agujeros negros se forman cuando una estrella masiva colapsa. El más cercano conocido está a 1,000 años luz de la Tierra. ¡Ni la luz puede escapar de su gravedad!"
      },
      {
        id: "e07",
        age: "all",
        question: "¿Cuántas lunas tiene Saturno aproximadamente?",
        options: ["2 lunas", "14 lunas", "50 lunas", "Más de 140 lunas"],
        correct: 3,
        fact: "🪐 Saturno tiene más de 140 lunas confirmadas, ¡más que cualquier otro planeta! Su luna más grande, Titán, tiene atmósfera y lagos — pero de metano líquido, no agua."
      },
      {
        id: "e08",
        age: "senior",
        question: "¿Qué es la Vía Láctea?",
        options: [
          "El nombre del cometa más famoso",
          "La galaxia donde se encuentra la Tierra",
          "Un cinturón de asteroides",
          "Una nebulosa cercana"
        ],
        correct: 1,
        fact: "🌌 La Vía Láctea tiene entre 100,000 y 400,000 millones de estrellas. Nuestro Sol está en uno de sus brazos espirales, y tarda 225 millones de años en dar una vuelta completa."
      }
    ]
  },

  // ── PAÍSES Y GEOGRAFÍA ───────────────────────────────────
  paises: {
    label: "Países",
    emoji: "🌍",
    color: "#34D399",
    preguntas: [
      {
        id: "p01",
        age: "all",
        question: "¿Cuál es el país más grande del mundo?",
        options: ["China", "Canadá", "Rusia", "Estados Unidos"],
        correct: 2,
        fact: "🇷🇺 Rusia ocupa el 11% de la superficie terrestre del planeta. ¡Es tan grande que tiene 11 zonas horarias distintas! Cuando en Moscú es de mañana, en el extremo este ya es de noche."
      },
      {
        id: "p02",
        age: "all",
        question: "¿Cuál es el río más largo del mundo?",
        options: ["Río Amazonas", "Río Nilo", "Río Yangtsé", "Río Misisipi"],
        correct: 1,
        fact: "🏞️ El Nilo, en África, tiene aproximadamente 6,650 km de longitud. Las civilizaciones más antiguas del mundo se desarrollaron a sus orillas hace más de 5,000 años."
      },
      {
        id: "p03",
        age: "all",
        question: "¿En qué continente está Colombia?",
        options: ["América del Norte", "América Central", "América del Sur", "América del Caribe"],
        correct: 2,
        fact: "🇨🇴 Colombia es el único país de Suramérica con costas en dos océanos: el Pacífico y el Atlántico. ¡También es el segundo país con mayor biodiversidad del planeta!"
      },
      {
        id: "p04",
        age: "senior",
        question: "¿Cuál es el desierto más grande del mundo?",
        options: ["Desierto del Sahara", "Desierto de Gobi", "Desierto Antártico", "Desierto de Arabia"],
        correct: 2,
        fact: "🏔️ ¡Sorpresa! El desierto más grande no es el Sahara sino la Antártida. Un desierto se define por sus escasas precipitaciones, y la Antártida recibe muy poca lluvia o nieve al año."
      },
      {
        id: "p05",
        age: "junior",
        question: "¿Cuántos países existen en el mundo?",
        options: ["Alrededor de 95", "Alrededor de 150", "Alrededor de 195", "Más de 250"],
        correct: 2,
        fact: "🌐 Hay 195 países reconocidos en el mundo (193 miembros de la ONU más 2 estados observadores: Vaticano y Palestina). ¡El más nuevo es Sudán del Sur, que se independizó en 2011!"
      },
      {
        id: "p06",
        age: "senior",
        question: "¿Cuál es la montaña más alta del mundo?",
        options: ["Monte Kilimanjaro", "Monte Everest", "Monte Aconcagua", "Monte McKinley"],
        correct: 1,
        fact: "🏔️ El Monte Everest tiene 8,849 metros sobre el nivel del mar. Lo curioso es que la montaña sigue creciendo a razón de unos 4mm por año por el movimiento de las placas tectónicas."
      },
      {
        id: "p07",
        age: "all",
        question: "¿Cuál es el océano más grande del mundo?",
        options: ["Océano Atlántico", "Océano Índico", "Océano Ártico", "Océano Pacífico"],
        correct: 3,
        fact: "🌊 El Océano Pacífico cubre más área que todos los continentes juntos. Su punto más profundo, la Fosa de las Marianas, llega a 11,034 metros de profundidad."
      },
      {
        id: "p08",
        age: "senior",
        question: "¿Cuál es el país más pequeño del mundo?",
        options: ["Mónaco", "San Marino", "Liechtenstein", "Ciudad del Vaticano"],
        correct: 3,
        fact: "⛪ El Vaticano tiene apenas 0.44 km² y una población de unas 800 personas. Es un estado independiente dentro de Roma, Italia, y es la sede del Papa Católico."
      }
    ]
  },

  // ── CIENCIA ───────────────────────────────────────────────
  ciencia: {
    label: "Ciencia",
    emoji: "🔬",
    color: "#F59E0B",
    preguntas: [
      {
        id: "c01",
        age: "all",
        question: "¿De qué está hecho el agua?",
        options: ["Hidrógeno y nitrógeno", "Oxígeno y carbono", "Hidrógeno y oxígeno", "Solo oxígeno"],
        correct: 2,
        fact: "💧 El agua (H₂O) tiene 2 átomos de hidrógeno y 1 de oxígeno. Es uno de los pocos materiales que en estado sólido (hielo) flota sobre su estado líquido, ¡lo que hace posible la vida acuática en el invierno!"
      },
      {
        id: "c02",
        age: "all",
        question: "¿Cuántos colores tiene el arcoíris?",
        options: ["5", "6", "7", "8"],
        correct: 2,
        fact: "🌈 Los 7 colores del arcoíris son: rojo, naranja, amarillo, verde, azul, índigo y violeta. Se forman cuando la luz del sol se refracta en las gotas de agua de lluvia."
      },
      {
        id: "c03",
        age: "senior",
        question: "¿Qué es la fotosíntesis?",
        options: [
          "El proceso por el que los animales respiran",
          "El proceso por el que las plantas producen su alimento usando luz solar",
          "La forma en que los hongos se reproducen",
          "El ciclo del agua en la naturaleza"
        ],
        correct: 1,
        fact: "🌿 Las plantas convierten luz solar, agua y CO₂ en glucosa y oxígeno. ¡Prácticamente todo el oxígeno que respiramos lo producen las plantas mediante la fotosíntesis!"
      },
      {
        id: "c04",
        age: "all",
        question: "¿Cuántos huesos tiene el cuerpo humano adulto?",
        options: ["150 huesos", "206 huesos", "250 huesos", "300 huesos"],
        correct: 1,
        fact: "🦴 Los bebés nacen con unos 270-300 huesos, pero muchos se van fusionando a medida que crecen, hasta quedar 206 en la adultez. ¡El hueso más pequeño está en el oído!"
      },
      {
        id: "c05",
        age: "junior",
        question: "¿Qué necesita una planta para crecer?",
        options: [
          "Solo agua",
          "Luz, agua y tierra",
          "Solo tierra",
          "Solo luz"
        ],
        correct: 1,
        fact: "🌱 Las plantas también necesitan dióxido de carbono del aire y minerales del suelo. Algunas plantas carnívoras, como la Venus atrapamoscas, obtienen nutrientes adicionales de los insectos!"
      },
      {
        id: "c06",
        age: "senior",
        question: "¿Qué es un átomo?",
        options: [
          "La partícula más pequeña de un elemento químico",
          "El núcleo de una célula",
          "Una molécula de agua",
          "Un tipo de energía solar"
        ],
        correct: 0,
        fact: "⚛️ Los átomos son tan pequeños que en un punto tipográfico caben millones de ellos. Tienen un núcleo con protones y neutrones, rodeado de electrones en movimiento constante."
      },
      {
        id: "c07",
        age: "all",
        question: "¿Por qué el cielo es azul?",
        options: [
          "Porque refleja el océano",
          "Por la dispersión de la luz solar en la atmósfera",
          "Porque el aire es azul",
          "Por los gases del ozono"
        ],
        correct: 1,
        fact: "☁️ La atmósfera dispersa la luz azul del sol más que los otros colores (fenómeno Rayleigh). Por eso de noche el cielo es negro y al amanecer/atardecer es anaranjado: la luz viaja más distancia y se dispersa diferente."
      },
      {
        id: "c08",
        age: "senior",
        question: "¿Cuántos planetas tiene el sistema solar que pueden sostener vida conocida?",
        options: ["0", "1", "3", "5"],
        correct: 1,
        fact: "🌍 Hasta ahora solo conocemos un planeta con vida: la Tierra. Pero los científicos buscan activamente en Marte, Europa (luna de Júpiter) y otros lugares. ¡No sabemos si estamos solos en el universo!"
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────
// MENSAJES DE CELEBRACIÓN
// Los muestro aleatoriamente al acertar una respuesta.
// Puedo agregar más sin tocar la lógica del juego.
// ─────────────────────────────────────────────────────────────
const MENSAJES_CORRECTO = [
  "¡Increíble! 🎉 ¡Lo sabías!",
  "¡Exacto! 🌟 ¡Eres un genio!",
  "¡Perfecto! 🏆 ¡Sigue así!",
  "¡Boom! 💥 ¡Respuesta correcta!",
  "¡Brillante! ✨ ¡Qué inteligente!",
  "¡Sí! 🎯 ¡Justo en el blanco!",
  "¡Wow! 🦸 ¡Eres todo un campeón!",
  "¡Correcto! 🚀 ¡Al siguiente nivel!"
];

const MENSAJES_INCORRECTO = [
  "¡Casi! 💪 ¡Sigue intentando!",
  "¡No pasa nada! 😄 ¡Aprendiste algo nuevo!",
  "¡Muy cerca! 🤔 ¡La próxima la tienes!",
  "¡Uy! 🌱 ¡Cada error nos hace más sabios!",
  "¡Error sabio! 💡 ¡Ahora ya lo sabrás!",
  "¡No te rindas! ⭐ ¡Eres capaz!"
];

// ─────────────────────────────────────────────────────────────
// MEMORAMA_DATA
// Pares de cartas con dato curioso al completar el par.
// "emoji" es el frente de la carta; "pair" es el par.
// ─────────────────────────────────────────────────────────────
const MEMORAMA_DATA = [
  {
    id: "m01",
    emoji: "🦁",
    label: "León",
    fact: "🦁 Los leones son los únicos felinos que viven en grupos llamados 'manadas'. Son las leonas las que cazan, no los leones machos."
  },
  {
    id: "m02",
    emoji: "🐬",
    label: "Delfín",
    fact: "🐬 Los delfines tienen nombres propios — se llaman entre sí con silbidos únicos. ¡Son de los pocos animales que reconocen su reflejo en un espejo!"
  },
  {
    id: "m03",
    emoji: "🦋",
    label: "Mariposa",
    fact: "🦋 Las mariposas 'saborean' con sus patas. Tienen receptores de sabor en los pies para saber si lo que pisan es comestible."
  },
  {
    id: "m04",
    emoji: "🐙",
    label: "Pulpo",
    fact: "🐙 Los pulpos tienen 9 cerebros: uno central y uno en cada tentáculo. ¡Cada tentáculo puede actuar de forma independiente!"
  },
  {
    id: "m05",
    emoji: "🦜",
    label: "Loro",
    fact: "🦜 Los loros no solo imitan sonidos — los más inteligentes pueden entender el significado de más de 100 palabras."
  },
  {
    id: "m06",
    emoji: "🐧",
    label: "Pingüino",
    fact: "🐧 Los pingüinos hacen propuestas de matrimonio con piedras. El macho busca la piedra perfecta para regalársela a la hembra."
  },
  {
    id: "m07",
    emoji: "🌵",
    label: "Cactus",
    fact: "🌵 Un cactus saguaro puede almacenar hasta 760 litros de agua. ¡Tarda 75 años en crecer su primer brazo lateral!"
  },
  {
    id: "m08",
    emoji: "🦈",
    label: "Tiburón",
    fact: "🦈 Los tiburones son más antiguos que los árboles: llevan 450 millones de años en la Tierra. ¡Algunos nunca dejan de mover sus dientes durante toda su vida!"
  }
];

// ─────────────────────────────────────────────────────────────
// CONECTA_DATA
// Sets de pares para el juego de arrastrar y soltar.
// Cada set tiene un tema y un array de pares { left, right }.
// ─────────────────────────────────────────────────────────────
const CONECTA_DATA = [
  {
    id: "con01",
    tema: "Animales y sus sonidos",
    emoji: "🔊",
    pares: [
      { left: "🐄 Vaca",    right: "Muu 🎵" },
      { left: "🐸 Rana",    right: "Croac 🎵" },
      { left: "🦁 León",    right: "Rugido 🎵" },
      { left: "🐍 Serpiente", right: "Siseo 🎵" },
      { left: "🐝 Abeja",   right: "Zumbido 🎵" }
    ]
  },
  {
    id: "con02",
    tema: "Capitales de América",
    emoji: "🌎",
    pares: [
      { left: "🇨🇴 Colombia",  right: "Bogotá 🏙️" },
      { left: "🇧🇷 Brasil",    right: "Brasilia 🏙️" },
      { left: "🇦🇷 Argentina", right: "Buenos Aires 🏙️" },
      { left: "🇲🇽 México",   right: "Ciudad de México 🏙️" },
      { left: "🇵🇪 Perú",     right: "Lima 🏙️" }
    ]
  },
  {
    id: "con03",
    tema: "Operaciones matemáticas",
    emoji: "➕",
    pares: [
      { left: "5 × 4",  right: "= 20 ✓" },
      { left: "100 ÷ 4", right: "= 25 ✓" },
      { left: "7 + 8",  right: "= 15 ✓" },
      { left: "9 × 9",  right: "= 81 ✓" },
      { left: "50 - 23", right: "= 27 ✓" }
    ]
  },
  {
    id: "con04",
    tema: "Planetas y características",
    emoji: "🪐",
    pares: [
      { left: "☀️ Más cercano al Sol",   right: "Mercurio 🪨" },
      { left: "🔴 El planeta rojo",       right: "Marte 🌋" },
      { left: "💍 Planeta con anillos",   right: "Saturno 🪐" },
      { left: "🌍 Tiene vida conocida",   right: "Tierra 🌿" },
      { left: "🔵 Planeta más frío",      right: "Urano ❄️" }
    ]
  }
];

// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE CATEGORÍAS DE TRIVIA
// Aquí defino el orden y la presentación en el selector.
// ─────────────────────────────────────────────────────────────
const TRIVIA_CATEGORIAS = ["animales", "espacio", "paises", "ciencia"];

const TRIVIA_DIFICULTADES = [
  {
    id: "junior",
    label: "Explorador",
    emoji: "🌱",
    desc: "6-8 años",
    filtro: (q) => q.age === "junior" || q.age === "all"
  },
  {
    id: "senior",
    label: "Aventurero",
    emoji: "🚀",
    desc: "9-12 años",
    filtro: (q) => q.age === "senior" || q.age === "all"
  },
  {
    id: "all",
    label: "Maestro",
    emoji: "🏆",
    desc: "¡Todo mezclado!",
    filtro: () => true
  }
];
