// versiculos.js

// ✅ Lista de versículos 
const versiculos = [
  "“En el principio creó Dios los cielos y la tierra.” — Génesis 1:1",
  "“Jehová es mi pastor; nada me faltará.” — Salmos 23:1",
  "“Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.” — Juan 3:16",
  "“El Señor es mi luz y mi salvación; ¿de quién temeré?” — Salmos 27:1",
  "“Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas que tú no conoces.” — Jeremías 33:3",
  "“Todo lo puedo en Cristo que me fortalece.” — Filipenses 4:13",
  "“La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da.” — Juan 14:27",
  "“Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.” — Mateo 6:33",
  "“Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.” — Mateo 11:28",
  "“El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente.” — Salmos 91:1",
  "“El Señor peleará por vosotros, y vosotros estaréis tranquilos.” — Éxodo 14:14",
  "“El gozo de Jehová es vuestra fuerza.” — Nehemías 8:10",
  "“Guarda tu corazón, porque de él mana la vida.” — Proverbios 4:23",
  "“El amor sea sin fingimiento. Aborreced lo malo, seguid lo bueno.” — Romanos 12:9",
  "“Jehová es bueno; para siempre es su misericordia.” — Salmos 100:5",
  "“Bienaventurados los de limpio corazón, porque ellos verán a Dios.” — Mateo 5:8",
  "“Lámpara es a mis pies tu palabra, y lumbrera a mi camino.” — Salmos 119:105",
  "“El que perdona la ofensa cultiva el amor.” — Proverbios 17:9",
  "“El que no ama, no ha conocido a Dios; porque Dios es amor.” — 1 Juan 4:8",
  "“Echa sobre Jehová tu carga, y él te sustentará.” — Salmos 55:22",
  "“Jesucristo es el mismo ayer, y hoy, y por los siglos.” — Hebreos 13:8",
  "“Jehová te bendiga, y te guarde.” — Números 6:24",
  "“La fe es la certeza de lo que se espera, la convicción de lo que no se ve.” — Hebreos 11:1",
  "“El Señor es bueno, fortaleza en el día de la angustia.” — Nahúm 1:7",
  "“No temas, porque yo estoy contigo.” — Isaías 41:10",
  "“Jehová es mi roca y mi castillo, y mi libertador.” — Salmos 18:2",
  "“El corazón alegre hermosea el rostro.” — Proverbios 15:13",
  "“Orad sin cesar.” — 1 Tesalonicenses 5:17",
  "“Sed fuertes y valientes; no temáis ni tengáis miedo.” — Deuteronomio 31:6",
  "“El fruto del Espíritu es amor, gozo, paz, paciencia, benignidad, bondad, fe.” — Gálatas 5:22",
  "“El que camina en integridad anda confiado.” — Proverbios 10:9",
  "“El temor de Jehová es el principio de la sabiduría.” — Proverbios 1:7",
  "“La gracia del Señor Jesucristo, el amor de Dios, y la comunión del Espíritu Santo sean con todos vosotros.” — 2 Corintios 13:14",
  "“Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús.” — Filipenses 4:19",
  "“Jehová dará poder a su pueblo; Jehová bendecirá a su pueblo con paz.” — Salmos 29:11",
  "“Cantad alegres a Dios, habitantes de toda la tierra.” — Salmos 100:1",
  "“Sed, pues, imitadores de Dios como hijos amados.” — Efesios 5:1",
  "“No se turbe vuestro corazón; creéis en Dios, creed también en mí.” — Juan 14:1",
  "“El que anda en justicia, anda confiado.” — Proverbios 10:9",
  "“Bienaventurado el hombre que confía en Jehová.” — Jeremías 17:7",
  "“El que tiene al Hijo, tiene la vida.” — 1 Juan 5:12",
  "“Jehová guarda a los sencillos; estaba yo postrado, y me salvó.” — Salmos 116:6",
  "“Encomienda a Jehová tu camino, y confía en él; y él hará.” — Salmos 37:5",
  "“El justo por la fe vivirá.” — Romanos 1:17",
  "“Jehová te pastoreará siempre, y en las sequías saciará tu alma.” — Isaías 58:11",
  "“El temor del hombre pondrá lazo; mas el que confía en Jehová será exaltado.” — Proverbios 29:25",
  "“Si confesamos nuestros pecados, él es fiel y justo para perdonar.” — 1 Juan 1:9",
  "“Jehová cumplirá su propósito en mí.” — Salmos 138:8",
  "“Mi gracia es suficiente para ti; porque mi poder se perfecciona en la debilidad.” — 2 Corintios 12:9"
];

// 📅 Calcular índice según el día del año
function getVersiculoDelDia() {
  const fecha = new Date();
  const inicioAno = new Date(fecha.getFullYear(), 0, 0);
  const diff = fecha - inicioAno;
  const unDia = 1000 * 60 * 60 * 24;
  const numeroDia = Math.floor(diff / unDia);
  return versiculos[numeroDia % versiculos.length];
}

// 📖 Mostrar versículo con animación
function mostrarVersiculo() {
  const contenedor = document.getElementById("versiculo");
  if (!contenedor) return;

  contenedor.classList.remove("visible"); // 🔹 Reinicia animación
  contenedor.textContent = ""; // lo vaciamos primero

  // 🔹 Ponemos el nuevo texto con un pequeño delay para que la animación se note
  setTimeout(() => {
    contenedor.textContent = getVersiculoDelDia();
    contenedor.classList.add("visible");
  }, 100);
}

// 🚀 Ejecutar al cargar
document.addEventListener("DOMContentLoaded", mostrarVersiculo);

// ⏰ Actualizar justo a medianoche
function programarCambio() {
  const ahora = new Date();
  const proximaMedianoche = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate() + 1,
    0, 0, 0
  );
  const tiempoRestante = proximaMedianoche - ahora;

  setTimeout(() => {
    mostrarVersiculo();
    programarCambio(); // seguir programando para el día siguiente
  }, tiempoRestante);
}
programarCambio();
