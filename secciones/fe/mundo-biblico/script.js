/* ================== MIS DATOS Y RECURSOS DE FE ================== */

// Aquí guardo mis versículos bíblicos seleccionados uno a uno para confortar el alma
const VERSICULOS=[
 {t:"No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te fortalece.",r:"Isaías 41, 10",x:"El miedo grita, pero Dios susurra más fuerte. Hoy no caminas solo: cada paso tuyo ya tiene Su compañía."},
 {t:"Vengan a mí todos los que están cansados y agobiados, y yo les daré descanso.",r:"Mateo 11, 28",x:"No tienes que poder con todo. Hoy, suelta la carga un momento y déjate abrazar por el descanso que Él ofrece."},
 {t:"El Señor es mi pastor, nada me falta.",r:"Salmo 23, 1",x:"Quizá no tienes todo lo que quieres, pero tienes a Quien te sostiene. Y eso, hoy, es suficiente."},
 {t:"Todo lo puedo en Cristo que me fortalece.",r:"Filipenses 4, 13",x:"Esa situación que te parece imposible no se enfrenta con tus fuerzas, sino con las Suyas. Pídelas."},
 {t:"Echa sobre el Señor tu carga, y Él te sostendrá.",r:"Salmo 55, 23",x:"Preocuparte no le suma días a tu vida, pero confiar le suma paz. Entrégale hoy eso que te quita el sueño."},
 {t:"Yo sé los planes que tengo para ustedes: planes de bienestar and no de calamidad, para darles un futuro y una esperanza.",r:"Jeremías 29, 11",x:"Tu historia no terminó en ese capítulo difícil. Dios sigue escribiendo, y a Él le gustan los finales buenos."},
 {t:"El amor es paciente, es bondadoso. El amor no es envidioso ni jactancioso ni orgulloso.",r:"1 Corintios 13, 4",x:"Hoy, ama con paciencia: a tu familia, a tus amigos… y también a ti mismo."},
 {t:"Aunque camine por valle de sombra de muerte, no temeré mal alguno, porque tú estás conmigo.",r:"Salmo 23, 4",x:"El valle no es tu casa, es solo tu camino. Y no lo cruzas solo."},
 {t:"Pidan y se les dará; busquen y encontrarán; llamen y se les abrirá.",r:"Mateo 7, 7",x:"Dios no se cansa de escucharte. Atrévete a pedirle hoy lo que llevas guardado."},
 {t:"Si Dios está con nosotros, ¿quién contra nosotros?",r:"Romanos 8, 31",x:"Las cuentas del cielo son distintas: tú + Dios siempre son mayoría."},
 {t:"La paz les dejo, mi paz les doy; no se la doy como la da el mundo.",r:"Juan 14, 27",x:"La paz del mundo depende de que todo salga bien. La de Dios te sostiene incluso cuando no."},
 {t:"Mi gracia te basta, porque mi poder se perfecciona en la debilidad.",r:"2 Corintios 12, 9",x:"No necesitas ser fuerte todo el tiempo. En tu grieta entra Su luz."},
 {t:"Encomienda al Señor tu camino, confía en Él, y Él actuará.",r:"Salmo 37, 5",x:"Haz tu parte con amor y deja los resultados en manos más grandes que las tuyas."},
 {t:"Dichosos los que lloran, porque ellos serán consolados.",r:"Mateo 5, 4",x:"Tus lágrimas no son debilidad: son semillas. Dios mismo promete el consuelo."}
];

// Estructura de mis oraciones según el estado emocional del usuario
const ORACIONES=[
 {icono:"😰",titulo:"Para la ansiedad",desc:"Cuando el pecho aprieta y la mente no para.",
  texto:"Señor, mi mente corre más rápido que mi paz.\nHoy te entrego mis pensamientos acelerados,\nmis miedos sobre lo que aún no pasa,\ny este peso que cargo sin saber por qué.\n\nRespiro, y en cada respiro Tú entras.\nCalma mi tormenta como calmaste el mar.\nRecuérdame que este momento pasará\ny que Tú permaneces.\n\nAmén.",verso:"\"No se inquieten por nada\" — Filipenses 4, 6"},
 {icono:"🌙",titulo:"Para dormir en paz",desc:"Entrega la noche y descansa de verdad.",
  texto:"Padre bueno, el día terminó y yo no pude con todo.\nEstá bien. Tú nunca me pediste perfección.\n\nGuarda mi descanso esta noche,\nsilencia las voces de la preocupación,\ny que al cerrar los ojos\nme encuentre en tus manos.\n\nMañana será otro día, y Tú ya estás allí esperándome.\n\nAmén.",verso:"\"En paz me acuesto y me duermo\" — Salmo 4, 9"},
 {icono:"💔",titulo:"Para perdonar",desc:"Cuando soltar duele, pero cargar duele más.",
  texto:"Señor, me hirieron y la herida sigue abierta.\nNo te pido olvidar: te pido sanar.\n\nDame la valentía de perdonar,\nno porque lo que pasó estuvo bien,\nsino porque mi corazón merece ser libre.\n\nY si todavía no puedo, dame el deseo de querer poder.\nContigo, paso a paso.\n\nAmén.",verso:"\"Perdónanos como nosotros perdonamos\" — Mateo 6, 12"},
 {icono:"👨‍👩‍👧‍👦",titulo:"Por mi familia",desc:"Por los que amas, cerca o lejos.",
  texto:"Dios de amor, te presento a mi familia:\na los que veo cada día y a los que extraño,\na los que me hacen reír y a los que me cuesta entender.\n\ Proteégelos donde estén.\nSana lo que esté roto entre nosotros.\nY haz de nuestra casa un lugar\ndonde Tú quieras quedarte.\n\nAmén.",verso:"\"Yo y mi casa serviremos al Señor\" — Josué 24, 15"},
 {icono:"🙏",titulo:"De gratitud",desc:"Porque también hay días buenos.",
  texto:"Gracias, Señor.\nPor lo grande que celebré y por lo pequeño que ni noté:\nel café de la mañana, la llamada a tiempo,\nla salud que doy por hecha, la gente que me quiere.\n\nQue no me acostumbre a tus regalos.\nQue mi primera palabra de hoy\ny la última de esta noche\nsea gracias.\n\nAmén.",verso:"\"Den gracias en toda ocasión\" — 1 Tesalonicenses 5, 18"},
 {icono:"🕯️",titulo:"Por alguien enfermo",desc:"Intercede por quien lo necesita.",
  texto:"Jesús, médico de los cuerpos y de las almas,\nte presento a esa persona que amo y que sufre.\n\nToca su cuerpo con tu poder,\nsu ánimo con tu esperanza,\ny a quienes la cuidan, dales fuerza.\n\nQue sienta que no está sola en su cama:\nque Tú velas su noche.\n\nAmén.",verso:"\"Yo soy el Señor, tu sanador\" — Éxodo 15, 26"},
 {icono:"🌅",titulo:"Para empezar el día",desc:"Antes de que el mundo te pida todo.",
  texto:"Buenos días, Señor.\nAntes de las notificaciones, antes del afán,\nmi primer pensamiento es para Ti.\n\nCamina conmigo hoy:\nen lo que salga bien y en lo que no,\nen la gente fácil y en la difícil.\n\nQue hoy alguien vea algo de Ti en mí.\n\nAmén.",verso:"\"Por la mañana hazme saber de tu gran amor\" — Salmo 143, 8"},
 {icono:"😔",titulo:"Cuando me siento solo",desc:"Para recordar que nunca lo estás.",
  texto:"Señor, hoy la soledad pesa.\nMe rodea gente y aun así me siento invisible.\n\nRecuérdame que Tú me viste antes de que yo naciera,\nque sabes mi nombre,\nque cuentas hasta mis cabellos.\n\nSé Tú mi compañía esta noche,\ny mándame pronto un abrazo con piel.\n\nAmén.",verso:"\"Yo estoy con ustedes todos los días\" — Mateo 28, 20"}
];

// Mis reflexiones profundas de mi sección "Devocionales"
const DEVOCIONALES=[
 {titulo:"El Dios de las segundas oportunidades",cuerpo:"Pedro negó a Jesús tres veces. Tres. Y aun así, el Resucitado no le reclamó: le preguntó tres veces '¿me amas?' — una por cada negación, como quien sana herida por herida. Si hoy sientes que fallaste demasiado, recuerda: Dios no busca gente perfecta, busca gente dispuesta a volver. Tu historia con Él no se acaba en tu peor capítulo.",pregunta:"¿Qué 'negación' necesitas dejar que Dios sane hoy?"},
 {titulo:"La fe del tamaño de una semilla",cuerpo:"Jesús no pidió una fe gigante: dijo que con una del tamaño de un grano de mostaza bastaba para mover montañas. Quizá hoy tu fe es pequeña, frágil, llena de dudas. Buenas noticias: califica. Dios no espera que llegues con certezas de acero, espera que llegues. La semilla más pequeña, plantada, le gana al árbol que nunca se sembró.",pregunta:"¿Qué montaña le presentarías hoy a Dios con tu fe pequeñita?"},
 {titulo:"Descansar también es santo",cuerpo:"Hasta Dios descansó el séptimo día — y no porque estuviera cansado, sino para enseñarnos algo: el descanso no es pereza, es confianza. Cuando descansas, le dices a Dios 'el mundo no se sostiene por mí, se sostiene por Ti'. Hoy, no te sientas culpable por parar. Jesús dormía en las barcas en plena tormenta.",pregunta:"¿Qué te cuesta soltar para poder descansar de verdad?"},
 {titulo:"Amar al difícil",cuerpo:"Amar a quien nos ama es fácil; hasta ahí no se necesita a Dios. El evangelio empieza exactamente donde se acaba nuestra paciencia: en esa persona que te saca de quicio, que te falló, que piensa distinto. Jesús no dijo 'tolera a tu enemigo': dijo ámalo. No es un sentimiento, es una decisión diaria. Y las decisiones, a diferencia de los sentimientos, sí dependen de ti.",pregunta:"¿Quién es tu 'persona difícil' y qué gesto concreto de amor puedes tener hoy con ella?"},
 {titulo:"Dios escribe derecho en renglones torcidos",cuerpo:"José fue vendido por sus hermanos, esclavizado y encarcelado injustamente. Años después, ese mismo camino torcido lo puso en el palacio donde salvaría a su propia familia del hambre. 'Ustedes pensaron hacerme mal, pero Dios lo encaminó a bien'. Tu renglón torcido de hoy puede ser el trazo que dé sentido a toda la página. No juzgues la historia por el párrafo en el que vas.",pregunta:"¿Qué situación dolorosa de tu pasado terminó llevándote a algo bueno?"}
];

// Mi banco de preguntas para poner a prueba el conocimiento de la Biblia
const TRIVIA=[
 {p:"¿Cuántos días estuvo Jonás dentro del gran pez?",ops:["Un día","Tres días","Siete días","Cuarenta días"],ok:1},
 {p:"¿Quién recibió las tablas de los Diez Mandamientos?",ops:["Abraham","David","Moisés","Elías"],ok:2},
 {p:"¿En qué ciudad nació Jesús?",ops:["Nazaret","Jerusalén","Belén","Cafarnaúm"],ok:2},
 {p:"¿Cuál fue el primer milagro público de Jesús?",ops:["Multiplicar los panes","Caminar sobre el agua","Convertir agua en vino","Sanar a un ciego"],ok:2},
 {p:"¿Quién traicionó a Jesús por 30 monedas de plata?",ops:["Pedro","Tomás","Judas Iscariote","Santiago"],ok:2},
 {p:"¿Cuántos libros tiene la Biblia católica?",ops:["66","72","73","77"],ok:2},
 {p:"¿Qué madre dijo 'Hágase en mí según tu palabra'?",ops:["Sara","María","Isabel","Ana"],ok:1},
 {p:"¿A quién se le apareció Dios en la zarza ardiente?",ops:["Moisés","Aarón","Josué","Samuel"],ok:0}
];

/* ================== FUNCIONES DEL VERSÍCULO DEL DÍA ================== */
let versoIdx;
function diaDelAnio(){const a=new Date(),i=new Date(a.getFullYear(),0,0);return Math.floor((a-i)/864e5);}

// Renderizo en pantalla el versículo correspondiente al día actual
function pintarVersiculo(){
  const v=VERSICULOS[versoIdx];
  document.getElementById('verso-texto').textContent='"'+v.t+'"';
  document.getElementById('verso-ref').textContent='— '+v.r;
  document.getElementById('verso-reflexion').textContent=v.x;
}
// Cambio manualmente el versículo si el usuario solicita otro
function otroVersiculo(){versoIdx=(versoIdx+1)%VERSICULOS.length;pintarVersiculo();}

// Permito copiar el versículo directo al portapapeles con mis créditos de marca
function copiarVersiculo(){
  const v=VERSICULOS[versoIdx];
  navigator.clipboard.writeText('"'+v.t+'" — '+v.r+'\n\n🕊️ Mundo Bíblico · El Mundo de Manu').then(()=>toast('Versículo copiado ✨'));
}
// Activo la API nativa de compartir si está en móviles, si no, lo copio por defecto
function compartirVersiculo(){
  const v=VERSICULOS[versoIdx];
  const texto='"'+v.t+'" — '+v.r+'\n\n🕊️ Mundo Bíblico · El Mundo de Manu';
  if(navigator.share){navigator.share({text:texto}).catch(()=>{});}else{copiarVersiculo();}
}

/* ================== FUNCIONES DE ORACIONES ================== */
// Genero de forma dinámica las tarjetas de oración en mi grid principal
function pintarOraciones(){
  document.getElementById('grid-oraciones').innerHTML=ORACIONES.map((o,i)=>`
    <div class="card" tabindex="0" role="button" onclick="abrirOracion(${i})" onkeydown="if(event.key==='Enter')abrirOracion(${i})">
      <span class="icono">${o.icono}</span><h3>${o.titulo}</h3><p>${o.desc}</p>
      <span class="tag">Orar ahora →</span>
    </div>`).join('');
}
// Muestro el modal interactivo con la oración detallada que se haya seleccionado
function abrirOracion(i){
  const o=ORACIONES[i];
  document.getElementById('mo-titulo').textContent=o.icono+' '+o.titulo;
  document.getElementById('mo-texto').textContent=o.texto;
  document.getElementById('mo-verso').textContent=o.verso;
  abrirModal('modal-oracion');
}

/* ================== FUNCIONES DEL DEVOCIONAL ================== */
// Configuro el devocional rotativo automático del día
function pintarDevocional(){
  const d=DEVOCIONALES[diaDelAnio()%DEVOCIONALES.length];
  document.getElementById('devo-titulo').textContent=d.titulo;
  document.getElementById('devo-cuerpo').textContent=d.cuerpo;
  document.getElementById('devo-pregunta').textContent='Para tu reflexión: '+d.pregunta;
}

/* ================== SISTEMA SOS (RESPIRACIÓN CONSCIENTE) ================== */
let sosInterval;
// Activo el bucle rítmico visual para guiar la respiración contra la ansiedad
function cicloRespira(){
  const el=document.getElementById('respira-txt');let inhala=true;
  el.textContent='Inhala…';
  sosInterval=setInterval(()=>{inhala=!inhala;el.textContent=inhala?'Inhala…':'Exhala…';},4000);
  const v=VERSICULOS[Math.floor(Math.random()*VERSICULOS.length)];
  document.getElementById('sos-verso').textContent='"'+v.t+'" — '+v.r;
}

/* ================== CARTA PRIVADA PARA DIOS ================== */
// Envío y proceso el almacenamiento de cartas en el LocalStorage de forma totalmente privada
function enviarCarta(){
  const txt=document.getElementById('carta-texto').value.trim();
  if(!txt){toast('Escribe algo primero 💛');return;}
  const cartas=JSON.parse(localStorage.getItem('mb_cartas')||'[]');
  cartas.unshift({fecha:new Date().toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric'}),texto:txt});
  localStorage.setItem('mb_cartas',JSON.stringify(cartas));
  document.getElementById('carta-texto').value='';
  document.getElementById('cartas-lista').innerHTML='';
  toast('Carta entregada ✨ Él ya la leyó.');
}
// Cargo el listado histórico de las cartas guardadas localmente
function verCartas(){
  const cartas=JSON.parse(localStorage.getItem('mb_cartas')||'[]');
  const zona=document.getElementById('cartas-lista');
  if(!cartas.length){zona.innerHTML='<p style="color:var(--texto-suave);font-size:.85rem;text-align:center">Aún no has escrito cartas. La primera siempre es la más especial.</p>';return;}
  zona.innerHTML=cartas.map(c=>`<div style="background:var(--vidrio);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;margin:8px 0">
    <small style="color:var(--turquesa)">${c.fecha}</small>
    <p style="font-family:'Fraunces',serif;font-style:italic;font-size:.92rem;margin-top:6px;white-space:pre-line">${c.texto.replace(/</g,'&lt;')}</p></div>`).join('');
}

/* ================== JUEGO DE TRIVIA BÍBLICA ================== */
let tIdx=0,tPuntos=0,tOrden=[];
// Inicializo el estado de mi juego y barajo un subset aleatorio de 5 preguntas
function iniciarTrivia(){
  tIdx=0;tPuntos=0;
  tOrden=[...TRIVIA].sort(()=>Math.random()-.5).slice(0,5);
  abrirModal('modal-trivia');pintarPregunta();
}
// Renderizo la pregunta en curso o el reporte final con mi mensaje motivacional
function pintarPregunta(){
  const z=document.getElementById('trivia-zona');
  if(tIdx>=tOrden.length){
    const msj=tPuntos===tOrden.length?'¡Perfecto! Conoces muy bien la Palabra 🙌':tPuntos>=3?'¡Muy bien! Sigues creciendo 🌱':'¡Buen intento! Cada pregunta es una semilla 💛';
    z.innerHTML=`<div style="text-align:center"><p style="font-size:2.6rem">${tPuntos===tOrden.length?'🏆':'⭐'}</p>
      <h3 style="color:var(--alba)">${tPuntos} / ${tOrden.length} correctas</h3>
      <p style="color:var(--texto-suave);margin:10px 0 20px">${msj}</p>
      <button class="btn btn-oro" onclick="iniciarTrivia()">Jugar otra vez</button></div>`;return;
  }
  const q=tOrden[tIdx];
  z.innerHTML=`<p style="color:var(--texto-suave);font-size:.8rem">Pregunta ${tIdx+1} de ${tOrden.length}</p>
    <p style="color:var(--alba);font-weight:600;margin:10px 0 14px;font-size:1.05rem">${q.p}</p>`+
    q.ops.map((op,i)=>`<button class="trivia-op" onclick="responder(${i},this)">${op}</button>`).join('');
}
// Valido la selección de la respuesta aplicando mis estilos interactivos CSS de acierto/error
function responder(i,btn){
  const q=tOrden[tIdx];
  document.querySelectorAll('.trivia-op').forEach(b=>b.disabled=true);
  if(i===q.ok){btn.classList.add('bien');tPuntos++;}
  else{btn.classList.add('mal');document.querySelectorAll('.trivia-op')[q.ok].classList.add('bien');}
  setTimeout(()=>{tIdx++;pintarPregunta();},1100);
}

/* ================== ALTAR VIRTUAL DE INTENCIONES ================== */
// Proceso el alta de intenciones comunitarias guardándolas localmente
function encenderVela(){
  const inp=document.getElementById('intencion');
  const intencion=inp.value.trim()||'Intención silenciosa';
  const velas=JSON.parse(localStorage.getItem('mb_velas')||'[]');
  velas.push({i:intencion,t:Date.now()});
  localStorage.setItem('mb_velas',JSON.stringify(velas));
  inp.value='';pintarVelas();toast('Tu vela está encendida 🕯️');
}
// Renderizo las velas activas asegurando que expiren automáticamente tras 24 horas exactas
function pintarVelas(){
  const DIA=864e5;
  let velas=JSON.parse(localStorage.getItem('mb_velas')||'[]').filter(v=>Date.now()-v.t<DIA);
  localStorage.setItem('mb_velas',JSON.stringify(velas));
  const altar=document.getElementById('altar');
  altar.innerHTML=velas.length?velas.map(v=>`<div class="vela"><div class="flama"></div><div class="cuerpo-vela"></div><small title="${v.i.replace(/"/g,'&quot;')}">${v.i.replace(/</g,'&lt;')}</small></div>`).join('')
    :'<p style="color:var(--texto-suave);font-size:.85rem">El altar espera tu primera vela de hoy. Las velas arden 24 horas.</p>';
}

/* ================== MANEJO DE MODALES Y UI GENERAL ================== */
// Despliego modales bloqueando el scroll general de mi página
function abrirModal(id){document.getElementById(id).classList.add('abierto');document.body.style.overflow='hidden';if(id==='modal-sos')cicloRespira();}
// Ocluyo los modales reactivando el comportamiento por defecto y limpiando hilos de SOS
function cerrarModal(id){document.getElementById(id).classList.remove('abierto');document.body.style.overflow='';if(id==='modal-sos')clearInterval(sosInterval);}

// Escucho eventos para cerrar modales al hacer clic fuera del contenedor principal o presionar Escape
document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)cerrarModal(m.id);}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal.abierto').forEach(m=>cerrarModal(m.id));});
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>document.querySelector('.nav-links').classList.remove('abierto')));

let toastT;
// Despliego mi componente Toast de alerta y administro sus tiempos de desaparición automáticos
function toast(msj){const t=document.getElementById('toast');t.textContent=msj;t.classList.add('ver');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('ver'),2600);}

/* ================== MI CÓDIGO GENERADOR DE ESTRELLAS DE FONDO ================== */
// Instancio en el DOM de forma matemática las estrellas titilantes en coordenadas aleatorias
for(let i=0;i<60;i++){
  const e=document.createElement('div');e.className='estrella';
  e.style.left=Math.random()*100+'vw';e.style.top=Math.random()*100+'vh';
  e.style.animationDelay=(Math.random()*4)+'s';e.style.width=e.style.height=(Math.random()*2+1)+'px';
  document.body.appendChild(e);
}

/* ================== INICIALIZACIÓN DE MI SISTEMA WEB ================== */
// Sincronizo de manera balanceada mis módulos esenciales al completarse la carga de la app
versoIdx=diaDelAnio()%VERSICULOS.length;
pintarVersiculo();pintarOraciones();pintarDevocional();pintarVelas();