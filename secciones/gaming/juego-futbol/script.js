/* ============================================================
   EL MUNDO DE MANU - FÚTBOL ARCADE | LÓGICA DEL JUEGO (script.js)
   Aquí yo, Manu, dejo separado todo mi JavaScript para poder
   actualizarlo y mejorarlo cómodo. Lo enlazo al final del body
   de index.html para que el DOM ya exista cuando corra.
   ============================================================ */
"use strict";
/* ============================================================
   EL MUNDO DE MANU - FÚTBOL ARCADE v3
   ============================================================ */

/* Aquí yo defino la clave del perfil */
const CLAVE_PERFIL = "emm_futbol_perfil_v3";

/* Aquí yo defino mis 5 ligas */
const LIGAS = [
  { nombre:"Liga Barrial",       dif:{ vel:1.7, precision:0.35, agresion:0.45, portero:0.55 } },
  { nombre:"Liga Municipal",     dif:{ vel:2.0, precision:0.50, agresion:0.60, portero:0.65 } },
  { nombre:"Liga Departamental", dif:{ vel:2.3, precision:0.62, agresion:0.72, portero:0.74 } },
  { nombre:"Liga Nacional",      dif:{ vel:2.6, precision:0.74, agresion:0.84, portero:0.82 } },
  { nombre:"Liga Leyenda",       dif:{ vel:3.0, precision:0.88, agresion:0.95, portero:0.90 } }
];

/* Aquí yo defino la config de IA de la CPU por liga: retardo (ms), varianza de tiro (°), radio de agresión */
const CPU_CONFIG = [
  { delay:350, variance:25, agresion:160 },
  { delay:250, variance:18, agresion:200 },
  { delay:180, variance:12, agresion:240 },
  { delay:100, variance:7,  agresion:300 },
  { delay:50,  variance:3,  agresion:400 }
];

/* Aquí yo defino los colores básicos y premium */
const COLORES_CAMISETA = ["#00C2A8","#F0A500","#E63946","#3A86FF","#8338EC","#FFFFFF"];
const COLORES_PREMIUM = [
  { id:"neon",   color:"#39FF14", nombre:"Verde Neón" },
  { id:"pink",   color:"#FF1493", nombre:"Rosa Intenso" },
  { id:"purple", color:"#7D3CFF", nombre:"Púrpura Real" },
  { id:"blood",  color:"#8B0000", nombre:"Rojo Sangre" },
  { id:"sky",    color:"#4FC3F7", nombre:"Azul Cielo" },
  { id:"black",  color:"#0A0A0A", nombre:"Total Negro" }
];
const NOMBRES_RIVALES = ["Atlético Sol","Real Río","Deportivo Cóndor","Unión Andes","Club Caribe","Tigres FC","Halcones","Los Llaneros"];

/* Aquí yo defino mis 12 logros */
const LOGROS = [
  { id:"primergol",    icono:"⚽", nombre:"Primer Gol",    desc:"Marca tu primer gol" },
  { id:"hattrick",     icono:"🎩", nombre:"Hat-trick",     desc:"Marca 3 goles en un partido" },
  { id:"muralla",      icono:"🧱", nombre:"Muralla",       desc:"Gana sin recibir goles" },
  { id:"cohete",       icono:"🚀", nombre:"Cohete",        desc:"Marca con el Súper Tiro" },
  { id:"rayo",         icono:"⚡", nombre:"Rayo",          desc:"Usa Velocidad x2 diez veces" },
  { id:"campeon",      icono:"🏆", nombre:"Campeón",       desc:"Gana tu primera liga" },
  { id:"leyenda",      icono:"👑", nombre:"Leyenda",       desc:"Llega a la Liga Leyenda" },
  { id:"amistoso",     icono:"🤝", nombre:"Amistoso",      desc:"Juega un partido Vs Amigo" },
  { id:"francotirador",icono:"🎯", nombre:"Francotirador", desc:"Gana 5-0 o más" },
  { id:"remontada",    icono:"💪", nombre:"Remontada",     desc:"Gana tras ir 2 goles abajo" },
  { id:"invicto",      icono:"🌟", nombre:"Invicto",       desc:"Completa una liga sin perder" },
  { id:"elmanu",       icono:"🦅", nombre:"El Manu",       desc:"Desbloquea todos los logros" }
];

/* Aquí yo armo el perfil por defecto */
function perfilPorDefecto(){
  return {
    club:"", manager:"", color:COLORES_CAMISETA[0],
    victorias:0, empates:0, derrotas:0, goles:0, partidos:0,
    nivelLiga:0, duracion:5, resultadosLiga:[], contadorAds:0,
    evento:{ fecha:hoyTexto(), golesHoy:0, completado:false }, trofeos:[],
    coins:0, logros:{}, speedUsados:0,
    comprados:{ colores:[], estadioVip:false, balonDorado:false }
  };
}
function hoyTexto(){ return new Date().toISOString().slice(0,10); }

/* Aquí yo cargo el perfil */
function cargarPerfil(){
  try{
    const g = localStorage.getItem(CLAVE_PERFIL);
    if(!g) return perfilPorDefecto();
    const p = Object.assign(perfilPorDefecto(), JSON.parse(g));
    if(!p.evento || p.evento.fecha !== hoyTexto()) p.evento = { fecha:hoyTexto(), golesHoy:0, completado:false };
    if(!p.logros) p.logros={};
    if(!p.comprados) p.comprados={ colores:[], estadioVip:false, balonDorado:false };
    if(!p.comprados.colores) p.comprados.colores=[];
    if(typeof p.coins!=="number") p.coins=0;
    if(typeof p.speedUsados!=="number") p.speedUsados=0;
    return p;
  }catch(e){ return perfilPorDefecto(); }
}
function guardarPerfil(){ localStorage.setItem(CLAVE_PERFIL, JSON.stringify(perfil)); }
let perfil = cargarPerfil();
function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

/* ============================================================
   AUDIO + MÚSICA + MUTE
   ============================================================ */
let audioCtx = null, muted = false, musicaInterval = null, musicaPaso = 0;
function getAudio(){ if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)(); if(audioCtx.state==="suspended") audioCtx.resume(); return audioCtx; }
/* Aquí yo genero un tono corto con envolvente */
function tono(freq,dur,tipo,vol){
  if(muted) return;
  const c=getAudio(); const o=c.createOscillator(); const g=c.createGain();
  o.type=tipo||"square"; o.frequency.value=freq;
  g.gain.setValueAtTime(vol||0.15, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime+dur);
  o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime+dur);
}
/* Aquí yo hago el golpe percusivo al patear */
function sonidoPatada(){ if(muted) return; const c=getAudio(); const o=c.createOscillator(), g=c.createGain(); o.type="triangle"; o.frequency.setValueAtTime(180,c.currentTime); o.frequency.exponentialRampToValueAtTime(55,c.currentTime+0.1); g.gain.setValueAtTime(0.32,c.currentTime); g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.12); o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime+0.13); }
/* Aquí yo hago el pase */
function sonidoPase(){ tono(420,0.08,"sine",0.16); }
/* Aquí yo hago el silbato del árbitro */
function silbatoArbitro(){ if(muted) return; const c=getAudio(); const o=c.createOscillator(), g=c.createGain(); o.type="sine"; o.frequency.setValueAtTime(2100,c.currentTime); o.frequency.linearRampToValueAtTime(2450,c.currentTime+0.12); o.frequency.linearRampToValueAtTime(2150,c.currentTime+0.22); g.gain.setValueAtTime(0.0001,c.currentTime); g.gain.linearRampToValueAtTime(0.2,c.currentTime+0.02); g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.3); o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime+0.32); }
function sonidoSilbato(){ silbatoArbitro(); }
/* Aquí yo hago el arpegio del power-up */
function sonidoPowerup(){ [523,659,784,1046].forEach((f,i)=>setTimeout(()=>tono(f,0.12,"square",0.14),i*60)); }
/* Aquí yo hago la parada del portero */
function sonidoParada(){ tono(300,0.1,"sawtooth",0.18); setTimeout(()=>tono(200,0.12,"sawtooth",0.15),60); }
/* Aquí yo genero el rugido de gol de 2.5 s con multitud + reverb simulado */
function sonidoGol(){
  if(muted) return;
  const c=getAudio();
  const buffer=c.createBuffer(1, Math.floor(c.sampleRate*2.5), c.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++){ const t=i/data.length; const env=Math.min(1,t*6)*Math.pow(1-t,0.6); data[i]=(Math.random()*2-1)*env*0.5; }
  const src=c.createBufferSource(); src.buffer=buffer;
  const filt=c.createBiquadFilter(); filt.type="bandpass"; filt.frequency.value=700; filt.Q.value=0.6;
  const delay=c.createDelay(); delay.delayTime.value=0.09;
  const fb=c.createGain(); fb.gain.value=0.34;
  const g=c.createGain(); g.gain.value=0.55;
  src.connect(filt); filt.connect(g); filt.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(g); g.connect(c.destination);
  src.start();
  [523,659,784,1046,1318].forEach((fr,i)=>setTimeout(()=>tono(fr,0.3,"square",0.10),i*140));
}
function sonidoPitido(){ silbatoArbitro(); setTimeout(silbatoArbitro,360); }

/* Aquí yo defino la música ambiental del menú */
const ESCALA_MUSICA=[174.61,196.00,220.00,261.63,293.66];
function notaMusica(freq,dur,tipo,vol){ if(muted||!audioCtx) return; const o=audioCtx.createOscillator(), g=audioCtx.createGain(); o.type=tipo; o.frequency.value=freq; g.gain.setValueAtTime(0.0001,audioCtx.currentTime); g.gain.linearRampToValueAtTime(vol,audioCtx.currentTime+0.02); g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+dur); o.connect(g).connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime+dur); }
function tocarPasoMusica(){
  if(muted||!audioCtx) return;
  const p=musicaPaso%16;
  if(p%4===0) notaMusica(ESCALA_MUSICA[Math.floor(musicaPaso/4)%ESCALA_MUSICA.length]/2, 0.5, "sine", 0.08);
  notaMusica(ESCALA_MUSICA[p%ESCALA_MUSICA.length]*2, 0.16, "triangle", 0.03);
  if(p===0||p===8) notaMusica(60, 0.18, "sine", 0.10);
  musicaPaso++;
}
function iniciarMusica(){ if(muted||musicaInterval) return; getAudio(); musicaPaso=0; musicaInterval=setInterval(tocarPasoMusica, 220); }
function detenerMusica(){ if(musicaInterval){ clearInterval(musicaInterval); musicaInterval=null; } }

/* Aquí yo manejo el botón de silenciar */
const btnMute=document.getElementById("btnMute");
btnMute.onclick=()=>{ muted=!muted; btnMute.textContent=muted?"🔇":"🔊"; if(muted) detenerMusica(); else if(pantallas.menu.classList.contains("activa")) iniciarMusica(); };

/* ============================================================
   NAVEGACIÓN
   ============================================================ */
const pantallas = {
  menu:document.getElementById("pantallaMenu"),
  juego:document.getElementById("pantallaJuego"),
  resultado:document.getElementById("pantallaResultado"),
  tabla:document.getElementById("pantallaTabla"),
  logros:document.getElementById("pantallaLogros")
};
function irA(n){ Object.values(pantallas).forEach(p=>p.classList.remove("activa")); pantallas[n].classList.add("activa"); if(n==="menu") iniciarMusica(); else detenerMusica(); }

/* ============================================================
   PERFIL Y EVENTO
   ============================================================ */
function renderPerfil(){
  document.getElementById("perfilClub").textContent = perfil.club || "Sin Club";
  document.getElementById("perfilLiga").textContent = LIGAS[perfil.nivelLiga].nombre;
  document.getElementById("camisetaMini").style.background = perfil.color;
  document.getElementById("statVictorias").textContent = perfil.victorias;
  document.getElementById("statEmpates").textContent = perfil.empates;
  document.getElementById("statDerrotas").textContent = perfil.derrotas;
  document.getElementById("statGoles").textContent = perfil.goles;
  document.getElementById("statPartidos").textContent = perfil.partidos;
  document.getElementById("statNivel").textContent = perfil.nivelLiga + 1;
  document.getElementById("trofeos").textContent = perfil.trofeos.join(" ") || "🔓 Aún sin trofeos";
  document.getElementById("menuCoins").textContent = perfil.coins;
  renderEvento();
}
function renderEvento(){
  const meta=3; const gh=perfil.evento.golesHoy; const pct=Math.min(100,(gh/meta)*100);
  document.getElementById("barraEvento").style.width = pct+"%";
  if(perfil.evento.completado) document.getElementById("textoEvento").textContent = "✅ ¡Copa Manu ganada! Trofeo 🏆 desbloqueado";
  else document.getElementById("textoEvento").textContent = `¡Marca 3 goles hoy y gana la Copa Manu! (${gh}/${meta})`;
}
function registrarGolEvento(){
  if(perfil.evento.completado) return;
  perfil.evento.golesHoy++;
  if(perfil.evento.golesHoy>=3){ perfil.evento.completado=true; if(!perfil.trofeos.includes("🏆")) perfil.trofeos.push("🏆"); }
  guardarPerfil();
}

/* ============================================================
   LOGROS + TOAST
   ============================================================ */
let toastTimeout=null;
function mostrarToastLogro(logro){
  const t=document.getElementById("toastLogro");
  t.querySelector(".toast-icono").textContent=logro.icono;
  t.querySelector(".toast-nombre").textContent=logro.nombre;
  t.classList.add("visible"); sonidoPowerup();
  if(toastTimeout) clearTimeout(toastTimeout);
  toastTimeout=setTimeout(()=>t.classList.remove("visible"), 3000);
}
function desbloquearLogro(id){
  if(perfil.logros[id]) return;
  perfil.logros[id]=true; guardarPerfil();
  const logro=LOGROS.find(l=>l.id===id);
  if(logro) mostrarToastLogro(logro);
  const otros=LOGROS.filter(l=>l.id!=="elmanu");
  if(otros.every(l=>perfil.logros[l.id]) && !perfil.logros["elmanu"]){
    perfil.logros["elmanu"]=true; guardarPerfil();
    const em=LOGROS.find(l=>l.id==="elmanu"); setTimeout(()=>mostrarToastLogro(em), 3300);
  }
}
function mostrarLogros(){
  const grid=document.getElementById("logrosGrid"); grid.innerHTML="";
  LOGROS.forEach(l=>{
    const d=!!perfil.logros[l.id];
    const card=document.createElement("div"); card.className="logro-card"+(d?"":" bloqueado");
    card.innerHTML=`<div class="lg-icono">${d?l.icono:"🔒"}</div><div class="lg-nombre">${d?l.nombre:"???"}</div><div class="lg-desc">${d?l.desc:"Logro bloqueado"}</div>`;
    grid.appendChild(card);
  });
  irA("logros");
}

/* ============================================================
   TIENDA
   ============================================================ */
function shakePrecio(el){ el.classList.add("shake"); setTimeout(()=>el.classList.remove("shake"), 400); }
function avisoSinMonedas(el){ const prev=el.textContent; el.textContent="Sin monedas suficientes"; setTimeout(()=>{ el.textContent=prev; }, 1200); }
function construirTienda(){
  document.getElementById("tiendaCoins").textContent=perfil.coins;
  const cont=document.getElementById("tiendaItems"); cont.innerHTML="";
  COLORES_PREMIUM.forEach(c=>{
    const comprado=perfil.comprados.colores.includes(c.id);
    const equipado=perfil.color===c.color;
    const item=document.createElement("div"); item.className="item-tienda";
    item.innerHTML=`<div class="item-preview" style="background:${c.color}"></div><div class="item-info"><div class="item-nombre">${c.nombre}</div><div class="item-precio">${comprado?"Comprado":"🪙 50"}</div></div>`;
    const btn=document.createElement("button"); btn.className="btn-item"+(equipado?" equipado":"");
    btn.textContent= equipado?"Equipado": comprado?"Equipar":"Comprar";
    btn.onclick=()=>{
      const precio=item.querySelector(".item-precio");
      if(!comprado){ if(perfil.coins<50){ shakePrecio(precio); avisoSinMonedas(precio); return; } perfil.coins-=50; perfil.comprados.colores.push(c.id); perfil.color=c.color; guardarPerfil(); }
      else { perfil.color=c.color; guardarPerfil(); }
      renderPerfil(); construirTienda();
    };
    item.appendChild(btn); cont.appendChild(item);
  });
  cont.appendChild(itemCosmetico("estadioVip","🏟️ Estadio VIP","linear-gradient(135deg,#0b1d3a,#1a3a5f)",100));
  cont.appendChild(itemCosmetico("balonDorado","🟡 Balón Dorado","radial-gradient(circle,#ffd700,#b8860b)",75));
}
function itemCosmetico(clave, nombre, fondo, precio){
  const comprado=perfil.comprados[clave];
  const item=document.createElement("div"); item.className="item-tienda";
  item.innerHTML=`<div class="item-preview" style="background:${fondo}"></div><div class="item-info"><div class="item-nombre">${nombre}</div><div class="item-precio">${comprado?"Activo":"🪙 "+precio}</div></div>`;
  const btn=document.createElement("button"); btn.className="btn-item"+(comprado?" equipado":""); btn.textContent= comprado?"Activo":"Comprar";
  btn.onclick=()=>{ if(comprado) return; const precioEl=item.querySelector(".item-precio"); if(perfil.coins<precio){ shakePrecio(precioEl); avisoSinMonedas(precioEl); return; } perfil.coins-=precio; perfil.comprados[clave]=true; guardarPerfil(); renderPerfil(); construirTienda(); };
  item.appendChild(btn); return item;
}

/* ============================================================
   MODAL CLUB
   ============================================================ */
let colorSeleccionado = perfil.color;
let duracionSeleccionada = perfil.duracion;
function construirSelectorColor(){
  const cont=document.getElementById("selectorColor"); cont.innerHTML="";
  const disponibles=[...COLORES_CAMISETA];
  COLORES_PREMIUM.forEach(c=>{ if(perfil.comprados.colores.includes(c.id)) disponibles.push(c.color); });
  disponibles.forEach(color=>{
    const d=document.createElement("div"); d.className="opcion-color"+(color===colorSeleccionado?" seleccionado":""); d.style.background=color;
    d.onclick=()=>{ colorSeleccionado=color; construirSelectorColor(); }; cont.appendChild(d);
  });
}
function actualizarDuracionUI(){ document.querySelectorAll(".opcion-dur").forEach(b=>{ const a=parseInt(b.dataset.min)===duracionSeleccionada; b.classList.toggle("dorado",a); b.classList.toggle("secundario",!a); }); }
function abrirModalClub(){ document.getElementById("inputClub").value=perfil.club; document.getElementById("inputManager").value=perfil.manager; colorSeleccionado=perfil.color; duracionSeleccionada=perfil.duracion; construirSelectorColor(); actualizarDuracionUI(); document.getElementById("modalClub").classList.add("activo"); }
document.querySelectorAll(".opcion-dur").forEach(b=>{ b.onclick=()=>{ duracionSeleccionada=parseInt(b.dataset.min); actualizarDuracionUI(); }; });
document.getElementById("btnGuardarClub").onclick=()=>{
  const club=document.getElementById("inputClub").value.trim();
  const manager=document.getElementById("inputManager").value.trim();
  if(!club){ alert("¡Ponle nombre a tu club!"); return; }
  perfil.club=club; perfil.manager=manager||"Manager"; perfil.color=colorSeleccionado; perfil.duracion=duracionSeleccionada;
  guardarPerfil(); renderPerfil(); document.getElementById("modalClub").classList.remove("activo");
};

/* ============================================================
   MOTOR DEL JUEGO
   ============================================================ */
const canvas=document.getElementById("gameCanvas");
const ctx=canvas.getContext("2d");
const ANCHO=canvas.width, ALTO=canvas.height;
const ARCO_ALTO=120;
const ARCO_Y1=(ALTO-ARCO_ALTO)/2, ARCO_Y2=ARCO_Y1+ARCO_ALTO;
const PROF_AREA=64;
const AREA_Y1=ARCO_Y1-20, AREA_Y2=ARCO_Y2+20;
const FRICCION=0.985;
const VEL_JUGADOR=2.6;

let juego=null;
let joystick={ active:false, dx:0, dy:0, mag:0 };

/* Aquí yo creo las estadísticas vacías de un equipo */
function statsVacias(){
  return { posesionFrames:0, remates:0, rematesPuerta:0, rematesFuera:0, rematesRechazados:0,
    rematesDentroArea:0, rematesFueraArea:0, alPalo:0, xg:0, xgot:0, grandesOcasiones:0,
    corners:0, toquesAreaRival:0, pasesEntreLineas:0, fuerasDeJuego:0, tirosLibres:0,
    pases:0, pasesLargos:0, pasesUltimoTercio:0, centros:0, xa:0, saquesBanda:0,
    faltas:0, entradas:0, duelosGanados:0, despejes:0, intercepciones:0,
    erroresRemate:0, erroresGol:0, amarillas:0, paradas:0, xgotEnfrentado:0, golesEvitados:0 };
}

/* Aquí yo creo un partido nuevo */
function crearPartido(modoAmigo){
  const dif = LIGAS[perfil.nivelLiga].dif;
  const p = {
    modoAmigo:!!modoAmigo, dif,
    golesLocal:0, golesCpu:0,
    tiempo:perfil.duracion*60, tiempoTotal:perfil.duracion*60,
    haltime:false, ladoInvertido:false, corriendo:true, celebrando:false,
    statsL:statsVacias(), statsC:statsVacias(),
    balon:{ x:ANCHO/2, y:ALTO/2, vx:0, vy:0, r:8, disparo:null, ignoraPortero:0 },
    powerupCancha:null, proxPowerup:45,
    efectos:{ speed:0, magnet:0, superShot:0, shieldCpu:0 },
    cargaP1:0, cargandoP1:false, cargaP2:0, cargandoP2:false,
    ultimoToque:"local", pasePendiente:null, perdidaReciente:null,
    quietoFrames:0, frames:0, mensaje:null, porteros:{},
    cpuFaltas:0, cpuAmarillas:0, cpuExpulsado:false, faltaCooldown:0,
    golConSuperShot:false, estuvo2Abajo:false
  };
  Object.assign(p, crearEntidades());
  return p;
}

/* Aquí yo creo jugadores de campo y porteros */
function crearEntidades(){
  const colorL=perfil.color, colorC="#d12d2d";
  const locales=[
    { x:ANCHO*0.30, y:ALTO/2, vx:0,vy:0, r:12, color:colorL, esHumano:true, bando:"local", rol:"medio" },
    { x:ANCHO*0.20, y:ALTO*0.28, vx:0,vy:0, r:12, color:colorL, esHumano:false, bando:"local", rol:"delantero" },
    { x:ANCHO*0.20, y:ALTO*0.72, vx:0,vy:0, r:12, color:colorL, esHumano:false, bando:"local", rol:"defensa" }
  ];
  const rivales=[
    { x:ANCHO*0.70, y:ALTO/2, vx:0,vy:0, r:12, color:colorC, esHumano:false, bando:"cpu", rol:"medio", expulsado:false },
    { x:ANCHO*0.80, y:ALTO*0.28, vx:0,vy:0, r:12, color:colorC, esHumano:false, bando:"cpu", rol:"delantero", expulsado:false },
    { x:ANCHO*0.80, y:ALTO*0.72, vx:0,vy:0, r:12, color:colorC, esHumano:false, bando:"cpu", rol:"defensa", expulsado:false }
  ];
  const porteros={
    local:{ x:24, y:ALTO/2, r:13, color:"#1de9b6", bando:"local" },
    cpu:{ x:ANCHO-24, y:ALTO/2, r:13, color:"#ffd54f", bando:"cpu" }
  };
  return { locales, rivales, porteros };
}
function rivalesActivos(){ return juego.rivales.filter(r=>!r.expulsado); }

/* Aquí yo armo helpers de dirección */
function atacaIzquierda(bando){ return bando==="local" ? juego.ladoInvertido : !juego.ladoInvertido; }
function arcoQueAtaca(bando){ return atacaIzquierda(bando) ? 4 : ANCHO-4; }
function arcoQueDefiende(bando){ return atacaIzquierda(bando) ? ANCHO-24 : 24; }
function equipoQueAtacaArco(lado){ const li=atacaIzquierda("local"); if(lado==="izquierda") return li?"local":"cpu"; return li?"cpu":"local"; }
function statsDe(bando){ return bando==="local" ? juego.statsL : juego.statsC; }

/* ============================================================
   ENTRADAS: TECLADO, JOYSTICK Y BOTONES
   ============================================================ */
const teclas={};
window.addEventListener("keydown",(e)=>{
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key) && pantallas.juego.classList.contains("activa")) e.preventDefault();
  teclas[e.key.toLowerCase()]=true;
  if(e.key===" " && juego && !juego.cargandoP1) juego.cargandoP1=true;
  if(e.key.toLowerCase()==="q" && juego && juego.modoAmigo && !juego.cargandoP2) juego.cargandoP2=true;
});
window.addEventListener("keyup",(e)=>{
  teclas[e.key.toLowerCase()]=false;
  if(e.key===" " && juego && juego.cargandoP1){ dispararJugador(juego.locales[0], juego.cargaP1); juego.cargandoP1=false; juego.cargaP1=0; }
  if(e.key.toLowerCase()==="p" && juego && !juego.modoAmigo) pasarBalon(juego.locales[0]);
  if(e.key.toLowerCase()==="q" && juego && juego.modoAmigo && juego.cargandoP2){ dispararJugador(juego.rivales[0], juego.cargaP2); juego.cargandoP2=false; juego.cargaP2=0; }
});

/* Aquí yo manejo el joystick virtual con dirección y magnitud */
const jBase=document.getElementById("joystickBase"), jKnob=document.getElementById("joystickKnob");
let jCentro={ x:0, y:0 };
function jInicio(e){ const r=jBase.getBoundingClientRect(); jCentro={ x:r.left+r.width/2, y:r.top+r.height/2 }; joystick.active=true; jMover(e); }
function jMover(e){
  if(!joystick.active) return;
  const t=e.touches?e.touches[0]:e;
  let dx=t.clientX-jCentro.x, dy=t.clientY-jCentro.y;
  const dist=Math.hypot(dx,dy), max=60;
  if(dist>max){ dx=dx/dist*max; dy=dy/dist*max; }
  jKnob.style.transform=`translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  joystick.dx=dx/max; joystick.dy=dy/max; joystick.mag=Math.min(1,dist/max);
}
function jFin(){ joystick.active=false; joystick.dx=0; joystick.dy=0; joystick.mag=0; jKnob.style.transform="translate(-50%,-50%)"; }
jBase.addEventListener("touchstart",e=>{ e.preventDefault(); jInicio(e); },{passive:false});
jBase.addEventListener("touchmove",e=>{ e.preventDefault(); jMover(e); },{passive:false});
jBase.addEventListener("touchend",e=>{ e.preventDefault(); jFin(); },{passive:false});
jBase.addEventListener("mousedown",jInicio);
window.addEventListener("mousemove",e=>{ if(joystick.active) jMover(e); });
window.addEventListener("mouseup",()=>{ if(joystick.active) jFin(); });

const bdm=document.getElementById("btnDisparoMovil");
bdm.addEventListener("touchstart",(e)=>{ e.preventDefault(); if(juego) juego.cargandoP1=true; });
bdm.addEventListener("touchend",(e)=>{ e.preventDefault(); if(juego&&juego.cargandoP1){ dispararJugador(juego.locales[0],juego.cargaP1); juego.cargandoP1=false; juego.cargaP1=0; } });
bdm.addEventListener("mousedown",()=>{ if(juego) juego.cargandoP1=true; });
bdm.addEventListener("mouseup",()=>{ if(juego&&juego.cargandoP1){ dispararJugador(juego.locales[0],juego.cargaP1); juego.cargandoP1=false; juego.cargaP1=0; } });
document.getElementById("btnPaseMovil").addEventListener("touchstart",(e)=>{ e.preventDefault(); if(juego) pasarBalon(juego.locales[0]); });
document.getElementById("btnPaseMovil").addEventListener("click",()=>{ if(juego) pasarBalon(juego.locales[0]); });

/* ============================================================
   xG, MOVIMIENTO E IA
   ============================================================ */
function calcularXG(sx,sy,golX){
  const golY=ALTO/2; const d=Math.hypot(golX-sx, golY-sy); const dMax=Math.hypot(ANCHO,ALTO);
  const desv=Math.abs(sy-golY)/(ALTO/2);
  let xg=(1 - d/dMax) * 0.9 * (1 - desv*0.5);
  return clamp(xg, 0.02, 0.92);
}
/* Aquí yo muevo a un jugador con un vector y multiplicador */
function moverJugadorConVector(j, vx, vy, mult){
  const v=VEL_JUGADOR*mult; j.vx=vx*v; j.vy=vy*v;
  j.x=clamp(j.x+j.vx, j.r, ANCHO-j.r); j.y=clamp(j.y+j.vy, j.r, ALTO-j.r);
}
/* Aquí yo convierto teclas en vector normalizado */
function vectorDirecciones(arriba,abajo,izq,der){ let x=0,y=0; if(arriba)y-=1; if(abajo)y+=1; if(izq)x-=1; if(der)x+=1; if(x&&y){ x*=0.707; y*=0.707; } return { x, y }; }

/* Aquí yo muevo a un jugador IA por rol, con retardo de reacción y radio de agresión */
function moverJugadorIA(j){
  if(j.expulsado) return;
  const b=juego.balon;
  const cfg=CPU_CONFIG[Math.min(perfil.nivelLiga, CPU_CONFIG.length-1)];
  const atacaDer=!atacaIzquierda(j.bando);
  const velIA=juego.dif.vel*(j.bando==="local"?0.8:1);
  const ahora=performance.now();
  const distBall=Math.hypot(b.x-j.x, b.y-j.y);
  const delay = j.bando==="cpu" ? cfg.delay : 120;
  if(j.tDecision===undefined || ahora>j.tDecision){
    let objX,objY; const agres = j.bando==="cpu" ? cfg.agresion : 240;
    if(j.rol==="delantero"){
      if(distBall<agres){ objX=b.x; objY=b.y; } else { objX=(atacaDer?ANCHO*0.6:ANCHO*0.4); objY=b.y; }
    } else if(j.rol==="defensa"){
      const miMitadX = atacaDer?ANCHO*0.78:ANCHO*0.22;
      const balonCerca = (atacaDer? b.x>ANCHO*0.55 : b.x<ANCHO*0.45) && distBall<agres*0.8;
      if(balonCerca){ objX=b.x; objY=b.y; } else { objX=miMitadX; objY=ALTO/2+(b.y-ALTO/2)*0.5; }
    } else {
      objX=(b.x+(atacaDer?ANCHO*0.6:ANCHO*0.4))/2; objY=b.y;
    }
    j.objX=objX; j.objY=objY; j.tDecision=ahora+delay;
  }
  const tx=j.objX!==undefined?j.objX:b.x, ty=j.objY!==undefined?j.objY:b.y;
  const dx=tx-j.x, dy=ty-j.y, dist=Math.hypot(dx,dy)||1;
  j.x=clamp(j.x+(dx/dist)*velIA, j.r, ANCHO-j.r); j.y=clamp(j.y+(dy/dist)*velIA, j.r, ALTO-j.r);
  if(distBall < j.r+b.r+5){
    const golX=arcoQueAtaca(j.bando); const distArco=Math.hypot(golX-j.x, ALTO/2-j.y);
    if(j.bando==="cpu" && Math.random()<0.04){ pasarBalon(j); return; }
    if(distArco < ANCHO*0.55 && Math.random() < juego.dif.precision*0.10){ ejecutarRemate(j, 7+juego.dif.vel); }
    else if(Math.random() < 0.02){ pasarBalon(j); }
  }
}
function moverIAEquipo(grupo){ grupo.forEach(j=>moverJugadorIA(j)); }

/* Aquí yo muevo a un portero con posicionamiento predictivo */
function moverPortero(gk){
  const b=juego.balon;
  const defiendeIzq=(arcoQueDefiende(gk.bando) < ANCHO/2);
  const lineaX = defiendeIzq?24:ANCHO-24;
  let predY=b.y;
  if((defiendeIzq && b.vx<-0.5) || (!defiendeIzq && b.vx>0.5)){ const t=Math.abs((lineaX-b.x)/b.vx); predY=b.y + b.vy*t; }
  let habilidad = gk.bando==="cpu" ? juego.dif.portero : 0.7;
  if(gk.bando==="cpu" && juego.efectos.shieldCpu>0) habilidad=1;
  const error=(1-habilidad)*55*(Math.random()-0.5);
  const objY=clamp(predY+error, ARCO_Y1+4, ARCO_Y2-4);
  const velGK = 2 + habilidad*3.2;
  gk.y += clamp(objY-gk.y, -velGK, velGK);
  const enArea = defiendeIzq ? (b.x<PROF_AREA && b.y>AREA_Y1 && b.y<AREA_Y2) : (b.x>ANCHO-PROF_AREA && b.y>AREA_Y1 && b.y<AREA_Y2);
  let objX=lineaX;
  if(enArea && gk.bando==="cpu"){ objX = defiendeIzq ? Math.min(b.x-6, PROF_AREA*0.7) : Math.max(b.x+6, ANCHO-PROF_AREA*0.7); }
  gk.x += clamp(objX-gk.x, -velGK, velGK);
}

/* ============================================================
   REMATES Y PASES
   ============================================================ */
function dispararJugador(j, carga){
  const b=juego.balon;
  if(Math.hypot(b.x-j.x, b.y-j.y) > j.r+b.r+16) return;
  const potencia=6 + (carga/100)*10; ejecutarRemate(j, potencia, true);
}
function ejecutarRemate(j, potencia, esHumano){
  const b=juego.balon; const golX=arcoQueAtaca(j.bando);
  let objetivoY=ALTO/2;
  if(esHumano && j.bando==="local"){
    if(joystick.active) objetivoY=clamp(ALTO/2 + joystick.dy*ARCO_ALTO*0.6, 20, ALTO-20);
    else { const d=(teclas["arrowup"])?-0.45:(teclas["arrowdown"])?0.45:0; objetivoY=clamp(ALTO/2 + d*ARCO_ALTO, 20, ALTO-20); }
  }
  let ang=Math.atan2(objetivoY-b.y, golX-b.x);
  if(!esHumano && j.bando==="cpu"){ const cfg=CPU_CONFIG[Math.min(perfil.nivelLiga, CPU_CONFIG.length-1)]; ang += (Math.random()*2-1) * (cfg.variance*Math.PI/180); }
  b.vx=Math.cos(ang)*potencia; b.vy=Math.sin(ang)*potencia; sonidoPatada();
  const xg=calcularXG(j.x, j.y, golX); const st=statsDe(j.bando);
  st.remates++; st.xg+=xg;
  const dentro = atacaIzquierda(j.bando) ? (j.x < PROF_AREA && j.y>AREA_Y1 && j.y<AREA_Y2) : (j.x > ANCHO-PROF_AREA && j.y>AREA_Y1 && j.y<AREA_Y2);
  if(dentro) st.rematesDentroArea++; else st.rematesFueraArea++;
  if(xg>=0.35) st.grandesOcasiones++;
  if(juego.pasePendiente && juego.pasePendiente.equipo===j.bando && (juego.frames-juego.pasePendiente.frame)<90){ st.xa += xg; }
  let superShot=false;
  if(j.bando==="local" && juego.efectos.superShot>0){ superShot=true; juego.efectos.superShot=0; b.ignoraPortero=1; document.getElementById("sbPowerup").textContent=""; }
  b.disparo={ equipo:j.bando, xg, xgot:0, superShot, resuelto:false, dentro };
  chequearError("remate", j.bando);
  juego.ultimoToque=j.bando; juego.pasePendiente=null;
}
function pasarBalon(j){
  const b=juego.balon;
  if(Math.hypot(b.x-j.x, b.y-j.y) > j.r+b.r+18) return;
  const equipo = j.bando==="local"?juego.locales:rivalesActivos();
  let mejor=null, mejorDist=Infinity;
  equipo.forEach(c=>{ if(c===j) return; const d=Math.hypot(c.x-b.x, c.y-b.y); if(d<mejorDist){ mejorDist=d; mejor=c; } });
  if(!mejor) return;
  if(esFueraDeJuego(j.bando, mejor)){
    statsDe(j.bando).fuerasDeJuego++; juego.mensaje={ texto:"FUERA DE JUEGO", t:90, color:"#ffd54f" }; sonidoSilbato();
    const rival = j.bando==="local"?"cpu":"local"; juego.ultimoToque=rival; b.vx=0; b.vy=0; b.disparo=null; return;
  }
  const ang=Math.atan2(mejor.y-b.y, mejor.x-b.x); const pot=Math.min(9, 4+mejorDist/50);
  b.vx=Math.cos(ang)*pot; b.vy=Math.sin(ang)*pot; sonidoPase();
  const st=statsDe(j.bando); st.pases++;
  if(mejorDist>180) st.pasesLargos++;
  const enUltimoTercio = atacaIzquierda(j.bando) ? (j.x < ANCHO/3) : (j.x > 2*ANCHO/3);
  if(enUltimoTercio) st.pasesUltimoTercio++;
  if((j.y<60 || j.y>ALTO-60) && Math.abs(mejor.x-arcoQueAtaca(j.bando))<PROF_AREA*2) st.centros++;
  if(mejorDist>90 && mejorDist<200) st.pasesEntreLineas++;
  juego.pasePendiente={ equipo:j.bando, frame:juego.frames, receptor:mejor };
  juego.ultimoToque=j.bando; b.disparo=null;
}
function esFueraDeJuego(bando, receptor){
  const atacaDer=!atacaIzquierda(bando);
  const enCampoRival = atacaDer ? receptor.x>ANCHO/2 : receptor.x<ANCHO/2;
  if(!enCampoRival) return false;
  const rivales = bando==="local"?rivalesActivos():juego.locales;
  let ultDef = atacaDer ? -Infinity : Infinity;
  rivales.forEach(r=>{ if(atacaDer) ultDef=Math.max(ultDef,r.x); else ultDef=Math.min(ultDef,r.x); });
  const adelantado = atacaDer ? receptor.x>ultDef+10 : receptor.x<ultDef-10;
  return adelantado && Math.random()<0.5;
}

/* ============================================================
   FÍSICA, PORTEROS, SAQUES, REGLAS FIFA
   ============================================================ */
function actualizarBalon(){
  const b=juego.balon;
  if(juego.efectos.magnet>0){ const j=juego.locales[0]; const dx=j.x-b.x, dy=j.y-b.y, d=Math.hypot(dx,dy)||1; b.vx+=(dx/d)*0.6; b.vy+=(dy/d)*0.6; }
  b.x+=b.vx; b.y+=b.vy; b.vx*=FRICCION; b.vy*=FRICCION;
  if(Math.abs(b.vx)<0.05) b.vx=0; if(Math.abs(b.vy)<0.05) b.vy=0;
  if(b.y - b.r < 0 || b.y + b.r > ALTO){ saqueDeBanda(b.y<ALTO/2 ? 4 : ALTO-4, clamp(b.x, 30, ANCHO-30)); return; }
  if(b.x - b.r < 0){ if(b.y>ARCO_Y1 && b.y<ARCO_Y2){ anotarGol("izquierda"); return; } else { lineaDeFondo("izquierda"); return; } }
  if(b.x + b.r > ANCHO){ if(b.y>ARCO_Y1 && b.y<ARCO_Y2){ anotarGol("derecha"); return; } else { lineaDeFondo("derecha"); return; } }
  manejarPorteros();
}
function manejarPorteros(){
  const b=juego.balon;
  ["local","cpu"].forEach(bando=>{
    const gk=juego.porteros[bando];
    const dx=b.x-gk.x, dy=b.y-gk.y, dist=Math.hypot(dx,dy), min=gk.r+b.r;
    if(dist<min && dist>0){
      const esRemate = b.disparo && b.disparo.equipo!==bando && !b.disparo.resuelto;
      if(b.ignoraPortero>0 && esRemate) return;
      const nx=dx/dist, ny=dy/dist; b.x=gk.x+nx*min; b.y=gk.y+ny*min;
      if(esRemate){
        registrarRemateAPuerta(b.disparo);
        const st=statsDe(bando); st.paradas++; st.xgotEnfrentado += b.disparo.xgot; st.golesEvitados += b.disparo.xgot;
        b.disparo.resuelto=true; b.disparo=null; sonidoParada();
        const fuera = gk.x<ANCHO/2 ? 1 : -1; b.vx=fuera*7; b.vy=(Math.random()*4-2);
      } else { b.vx+=nx*2; b.vy+=ny*2; }
      juego.ultimoToque=bando;
    }
  });
}
function registrarRemateAPuerta(disparo){
  if(disparo.contadoPuerta) return; disparo.contadoPuerta=true;
  const st=statsDe(disparo.equipo); st.rematesPuerta++;
  disparo.xgot = clamp(disparo.xg*1.25, 0.03, 0.95); st.xgot += disparo.xgot;
}
function saqueDeBanda(yBorde, xSalida){
  const b=juego.balon; const equipo = juego.ultimoToque==="local" ? "cpu" : "local";
  statsDe(equipo).saquesBanda++;
  b.x=xSalida; b.y=yBorde<ALTO/2 ? 14 : ALTO-14; b.vx=0; b.vy=0; b.disparo=null;
  juego.ultimoToque=equipo; acercarJugador(equipo, b.x, b.y);
  juego.mensaje={ texto:"SAQUE DE BANDA", t:90, color:"#fff" }; juego.quietoFrames=0;
}
function lineaDeFondo(lado){
  const b=juego.balon; const atacante = equipoQueAtacaArco(lado); const defensor = atacante==="local" ? "cpu" : "local";
  if(juego.ultimoToque===atacante){
    sonidoSilbato(); const gx = lado==="izquierda" ? 60 : ANCHO-60;
    b.x=gx; b.y=ALTO/2 + (Math.random()*80-40); b.vx=0; b.vy=0; b.disparo=null;
    juego.ultimoToque=defensor; acercarJugador(defensor, b.x, b.y);
    juego.mensaje={ texto:"SAQUE DE PUERTA", t:90, color:"#fff" };
  } else {
    sonidoSilbato(); statsDe(atacante).corners++;
    const cx = lado==="izquierda" ? 14 : ANCHO-14; const cy = b.y<ALTO/2 ? 14 : ALTO-14;
    b.x=cx; b.y=cy; b.vx=0; b.vy=0; b.disparo=null;
    juego.ultimoToque=atacante; acercarJugador(atacante, b.x, b.y);
    juego.mensaje={ texto:"¡CÓRNER!", t:90, color:"#ffd54f" };
  }
  juego.quietoFrames=0;
}
function acercarJugador(bando, x, y){
  const equipo = bando==="local"?juego.locales:rivalesActivos();
  let mejor=null, md=Infinity;
  equipo.forEach(j=>{ const d=Math.hypot(j.x-x, j.y-y); if(d<md){ md=d; mejor=j; } });
  if(mejor){ mejor.x=clamp(x-12,12,ANCHO-12); mejor.y=clamp(y,12,ALTO-12); }
}

/* ============================================================
   GOL Y CELEBRACIÓN
   ============================================================ */
function anotarGol(lado){
  const b=juego.balon; const anotador = equipoQueAtacaArco(lado);
  if(b.disparo && b.disparo.equipo===anotador){ registrarRemateAPuerta(b.disparo); if(b.disparo.superShot && anotador==="local") juego.golConSuperShot=true; }
  if(anotador==="local"){
    juego.golesLocal++; perfil.goles++; registrarGolEvento(); guardarPerfil();
    if(perfil.goles>=1) desbloquearLogro("primergol");
    if(juego.golesLocal>=3) desbloquearLogro("hattrick");
    if(juego.golConSuperShot) desbloquearLogro("cohete");
  } else {
    juego.golesCpu++;
    if(juego.golesCpu - juego.golesLocal >= 2) juego.estuvo2Abajo=true;
  }
  chequearError("gol", anotador);
  b.disparo=null; b.ignoraPortero=0;
  actualizarScoreboard(); celebrarGol(anotador==="local"); reposicionarSaque();
}
function reposicionarSaque(){
  const b=juego.balon; b.x=ANCHO/2; b.y=ALTO/2; b.vx=0; b.vy=0; b.disparo=null;
  const ent=crearEntidades();
  ent.rivales.forEach((r,i)=>{ if(juego.rivales[i] && juego.rivales[i].expulsado) r.expulsado=true; });
  juego.locales=ent.locales; juego.rivales=ent.rivales; juego.porteros=ent.porteros;
  if(juego.ladoInvertido){ [...juego.locales, ...juego.rivales].forEach(j=>{ j.x=ANCHO-j.x; }); juego.porteros.local.x = ANCHO-24; juego.porteros.cpu.x = 24; }
  juego.quietoFrames=0;
}
function celebrarGol(localAnota){
  juego.celebrando=true; sonidoGol();
  const flash=document.getElementById("flashGol"); flash.classList.remove("flash"); void flash.offsetWidth; flash.classList.add("flash");
  const t=document.getElementById("textoGol");
  t.textContent = localAnota ? "¡GOOOL!" : "GOL CPU"; t.style.color = localAnota ? "var(--dorado)" : "var(--rojo-cpu)";
  t.classList.remove("explota"); void t.offsetWidth; t.classList.add("explota");
  setTimeout(()=>{ juego.celebrando=false; }, 1500);
}

/* ============================================================
   COLISIONES + ESTADÍSTICAS
   ============================================================ */
function colisionJugadorBalon(){
  const b=juego.balon;
  [...juego.locales, ...rivalesActivos()].forEach(j=>{
    const dx=b.x-j.x, dy=b.y-j.y, dist=Math.hypot(dx,dy), min=j.r+b.r;
    if(dist<min && dist>0){
      const eraDe=juego.ultimoToque; const nx=dx/dist, ny=dy/dist;
      b.x=j.x+nx*min; b.y=j.y+ny*min; b.vx += nx*1.8 + j.vx*0.4; b.vy += ny*1.8 + j.vy*0.4;
      if(juego.pasePendiente && juego.pasePendiente.equipo!==j.bando && Math.hypot(b.vx,b.vy)>2){ statsDe(j.bando).intercepciones++; juego.pasePendiente=null; }
      if(b.disparo && b.disparo.equipo!==j.bando && !b.disparo.resuelto){ statsDe(b.disparo.equipo).rematesRechazados++; b.disparo.resuelto=true; b.disparo=null; }
      if(eraDe!==j.bando){
        statsDe(j.bando).duelosGanados++; statsDe(j.bando).entradas++;
        registrarPerdida(eraDe, j);
        const enTercioPropio = atacaIzquierda(j.bando) ? (j.x>2*ANCHO/3) : (j.x<ANCHO/3);
        if(enTercioPropio && Math.hypot(b.vx,b.vy)>4) statsDe(j.bando).despejes++;
      }
      const enAreaRival = atacaIzquierda(j.bando) ? (b.x<PROF_AREA && b.y>AREA_Y1 && b.y<AREA_Y2) : (b.x>ANCHO-PROF_AREA && b.y>AREA_Y1 && b.y<AREA_Y2);
      if(enAreaRival) statsDe(j.bando).toquesAreaRival++;
      juego.ultimoToque=j.bando;
    }
  });
  if(juego.ultimoToque==="local") juego.statsL.posesionFrames++; else juego.statsC.posesionFrames++;
}
function registrarPerdida(equipoQuePerdio, jugadorQueGano){
  const atacaDer = !atacaIzquierda(equipoQuePerdio);
  const enZonaPropia = atacaDer ? jugadorQueGano.x<ANCHO/3 : jugadorQueGano.x>2*ANCHO/3;
  if(enZonaPropia) juego.perdidaReciente={ equipo:equipoQuePerdio, frame:juego.frames };
}
function chequearError(tipo, equipoQueRemata){
  if(!juego.perdidaReciente) return;
  if(juego.perdidaReciente.equipo!==equipoQueRemata && (juego.frames-juego.perdidaReciente.frame)<150){
    const culpable=juego.perdidaReciente.equipo;
    if(tipo==="remate") statsDe(culpable).erroresRemate++;
    if(tipo==="gol"){ statsDe(culpable).erroresRemate++; statsDe(culpable).erroresGol++; }
    juego.perdidaReciente=null;
  }
}
function colisionEntreJugadores(){
  const todos=[...juego.locales, ...rivalesActivos()];
  for(let i=0;i<todos.length;i++){
    for(let k=i+1;k<todos.length;k++){
      const a=todos[i], c=todos[k]; const dx=c.x-a.x, dy=c.y-a.y, dist=Math.hypot(dx,dy), min=a.r+c.r;
      if(dist<min && dist>0){ const ov=(min-dist)/2, nx=dx/dist, ny=dy/dist; a.x-=nx*ov; a.y-=ny*ov; c.x+=nx*ov; c.y+=ny*ov; }
    }
  }
}
/* Aquí yo detecto faltas de la CPU y manejo tarjetas amarilla/roja */
function chequearFaltasCpu(){
  if(juego.modoAmigo) return;
  if(juego.faltaCooldown>0){ juego.faltaCooldown--; return; }
  const b=juego.balon;
  let portador=null, md=Infinity;
  juego.locales.forEach(j=>{ const d=Math.hypot(j.x-b.x, j.y-b.y); if(d<30 && d<md){ md=d; portador=j; } });
  if(!portador) return;
  for(const r of rivalesActivos()){
    if(Math.hypot(r.x-portador.x, r.y-portador.y) < r.r+portador.r+4){ registrarFaltaCpu(portador.x, portador.y); break; }
  }
}
function registrarFaltaCpu(x,y){
  juego.cpuFaltas++; juego.statsC.faltas++; juego.statsL.tirosLibres++; juego.faltaCooldown=110;
  let msg="FALTA CPU", col="#fff";
  if(juego.cpuFaltas%3===0){
    juego.cpuAmarillas++; juego.statsC.amarillas++; msg="🟨 AMARILLA CPU"; col="#ffd54f";
    if(juego.cpuAmarillas>=2 && !juego.cpuExpulsado){
      juego.cpuExpulsado=true;
      const exp = juego.rivales.find(r=>r.rol==="medio" && !r.expulsado) || rivalesActivos()[0];
      if(exp) exp.expulsado=true; msg="🟥 ROJA CPU — ¡juega con uno menos!"; col="#ff5252";
    }
  }
  sonidoSilbato(); juego.mensaje={ texto:msg, t:90, color:col };
  const b=juego.balon; b.vx=0; b.vy=0; b.disparo=null; juego.ultimoToque="local"; actualizarTarjetasUI();
}
function actualizarTarjetasUI(){
  let txt="";
  if(juego.cpuExpulsado) txt="CPU: 🟥 (un jugador menos)";
  else if(juego.cpuAmarillas>0) txt="CPU: "+"🟨".repeat(juego.cpuAmarillas);
  document.getElementById("sbTarjetas").textContent=txt;
}
function chequearBalonAtascado(){
  const b=juego.balon; const vel=Math.hypot(b.vx,b.vy);
  if(vel<0.4) juego.quietoFrames++; else juego.quietoFrames=0;
  if(juego.quietoFrames>150){
    [...juego.locales, ...rivalesActivos()].forEach(j=>{ const dx=j.x-b.x, dy=j.y-b.y, d=Math.hypot(dx,dy); if(d<40 && d>0){ j.x=clamp(j.x+(dx/d)*30, j.r, ANCHO-j.r); j.y=clamp(j.y+(dy/d)*30, j.r, ALTO-j.r); } });
    const ang=Math.atan2(ALTO/2-b.y, ANCHO/2-b.x); b.vx=Math.cos(ang)*5; b.vy=Math.sin(ang)*5;
    juego.quietoFrames=0; juego.mensaje={ texto:"BALÓN LIBRE", t:50, color:"#fff" };
  }
}

/* ============================================================
   POWER-UPS
   ============================================================ */
const POWERUP_INFO = {
  speed:{ icono:"⚡", dur:10, nombre:"Velocidad x2" },
  magnet:{ icono:"🧲", dur:8, nombre:"Imán de Balón" },
  superShot:{ icono:"🔥", dur:1, nombre:"Súper Tiro" },
  shieldCpu:{ icono:"🛡️", dur:15, nombre:"Escudo Portero CPU" }
};
function generarPowerup(){
  const tipos=["speed","magnet","superShot","shieldCpu"]; const tipo=tipos[Math.floor(Math.random()*tipos.length)];
  juego.powerupCancha={ tipo, x:ANCHO*0.3+Math.random()*ANCHO*0.4, y:40+Math.random()*(ALTO-80), r:16, pulso:0 };
}
function verificarColisionPowerup(){
  if(!juego.powerupCancha) return;
  const p=juego.powerupCancha, j=juego.locales[0];
  if(Math.hypot(p.x-j.x, p.y-j.y) < p.r+j.r){ activarPowerup(p.tipo); juego.powerupCancha=null; sonidoPowerup(); }
}
function activarPowerup(tipo){
  const info=POWERUP_INFO[tipo];
  if(tipo==="speed"){ juego.efectos.speed=info.dur; perfil.speedUsados++; guardarPerfil(); if(perfil.speedUsados>=10) desbloquearLogro("rayo"); }
  if(tipo==="magnet") juego.efectos.magnet=info.dur;
  if(tipo==="superShot") juego.efectos.superShot=1;
  if(tipo==="shieldCpu") juego.efectos.shieldCpu=info.dur;
  document.getElementById("sbPowerup").textContent = `${info.icono} ${info.nombre} activado`;
}

/* ============================================================
   DIBUJO EN CANVAS
   ============================================================ */
function dibujarCampo(){
  const vip=perfil.comprados.estadioVip;
  for(let i=0;i<10;i++){ if(vip) ctx.fillStyle=i%2===0?"#14532d":"#176034"; else ctx.fillStyle=i%2===0?"#2e8b3d":"#329440"; ctx.fillRect(i*(ANCHO/10),0,ANCHO/10,ALTO); }
  if(vip){ [[60,40],[ANCHO-60,40],[60,ALTO-40],[ANCHO-60,ALTO-40]].forEach(([fx,fy])=>{ const grad=ctx.createRadialGradient(fx,fy,0,fx,fy,160); grad.addColorStop(0,"rgba(255,255,230,.18)"); grad.addColorStop(1,"rgba(255,255,230,0)"); ctx.fillStyle=grad; ctx.fillRect(fx-160,fy-160,320,320); }); }
  ctx.strokeStyle="rgba(255,255,255,.6)"; ctx.lineWidth=2;
  ctx.strokeRect(4,4,ANCHO-8,ALTO-8);
  ctx.beginPath(); ctx.moveTo(ANCHO/2,4); ctx.lineTo(ANCHO/2,ALTO-4); ctx.stroke();
  ctx.beginPath(); ctx.arc(ANCHO/2,ALTO/2,45,0,Math.PI*2); ctx.stroke();
  ctx.strokeRect(4,AREA_Y1,PROF_AREA,AREA_Y2-AREA_Y1);
  ctx.strokeRect(ANCHO-4-PROF_AREA,AREA_Y1,PROF_AREA,AREA_Y2-AREA_Y1);
  ctx.fillStyle="rgba(255,255,255,.9)";
  ctx.fillRect(0,ARCO_Y1,6,ARCO_ALTO); ctx.fillRect(ANCHO-6,ARCO_Y1,6,ARCO_ALTO);
  ctx.fillStyle="#fff";
  ctx.fillRect(0,ARCO_Y1-4,8,4); ctx.fillRect(0,ARCO_Y2,8,4);
  ctx.fillRect(ANCHO-8,ARCO_Y1-4,8,4); ctx.fillRect(ANCHO-8,ARCO_Y2,8,4);
}
function dibujarJugador(j, controlado){
  ctx.beginPath(); ctx.fillStyle="rgba(0,0,0,.25)"; ctx.ellipse(j.x,j.y+j.r*0.8,j.r*0.9,j.r*0.4,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.fillStyle=j.color; ctx.arc(j.x,j.y,j.r,0,Math.PI*2); ctx.fill();
  ctx.lineWidth=2; ctx.strokeStyle=(j.color==="#FFFFFF"||j.color==="#0A0A0A")?"#888":"#fff"; ctx.stroke();
  if(controlado){ ctx.beginPath(); ctx.strokeStyle=juego.efectos.speed>0?"#F0A500":"#00C2A8"; ctx.lineWidth=3; ctx.arc(j.x,j.y,j.r+4,0,Math.PI*2); ctx.stroke(); }
}
function dibujarPortero(gk){
  ctx.beginPath(); ctx.fillStyle="rgba(0,0,0,.25)"; ctx.ellipse(gk.x,gk.y+gk.r*0.8,gk.r*0.9,gk.r*0.4,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=gk.color; ctx.fillRect(gk.x-gk.r, gk.y-gk.r, gk.r*2, gk.r*2);
  ctx.strokeStyle="#0b2027"; ctx.lineWidth=2; ctx.strokeRect(gk.x-gk.r, gk.y-gk.r, gk.r*2, gk.r*2);
  if(gk.bando==="cpu" && juego.efectos.shieldCpu>0){ ctx.beginPath(); ctx.strokeStyle="#7cf"; ctx.lineWidth=3; ctx.arc(gk.x,gk.y,gk.r+6,0,Math.PI*2); ctx.stroke(); }
}
function dibujarBalon(){
  const b=juego.balon; const dorado = perfil.comprados.balonDorado || b.ignoraPortero>0;
  ctx.beginPath(); ctx.fillStyle="rgba(0,0,0,.25)"; ctx.ellipse(b.x,b.y+b.r*0.7,b.r*0.9,b.r*0.4,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.fillStyle=dorado?"#ffd700":"#fff"; ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=dorado?"#9a7b00":"#333"; ctx.lineWidth=1.5; ctx.stroke();
  ctx.beginPath(); ctx.fillStyle=dorado?"#b8860b":"#222"; ctx.arc(b.x,b.y,b.r*0.4,0,Math.PI*2); ctx.fill();
  if(b.ignoraPortero>0){ ctx.beginPath(); ctx.strokeStyle="rgba(240,165,0,.6)"; ctx.lineWidth=3; ctx.arc(b.x,b.y,b.r+5,0,Math.PI*2); ctx.stroke(); }
}
function dibujarPowerup(){
  if(!juego.powerupCancha) return;
  const p=juego.powerupCancha; p.pulso+=0.1; const r=p.r+Math.sin(p.pulso)*4;
  ctx.beginPath(); ctx.fillStyle="rgba(0,194,168,.3)"; ctx.arc(p.x,p.y,r+6,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.fillStyle="rgba(255,255,255,.9)"; ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.fill();
  ctx.font="20px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(POWERUP_INFO[p.tipo].icono, p.x, p.y);
}
function dibujarBarraCarga(){
  if(juego.cargandoP1 && juego.cargaP1>0) dibujarBarra(juego.locales[0], juego.cargaP1);
  if(juego.modoAmigo && juego.cargandoP2 && juego.cargaP2>0) dibujarBarra(juego.rivales[0], juego.cargaP2);
}
function dibujarBarra(j, carga){
  const w=36,h=6, x=j.x-w/2, y=j.y-j.r-14;
  ctx.fillStyle="rgba(0,0,0,.6)"; ctx.fillRect(x,y,w,h);
  ctx.fillStyle=carga>70?"#F0A500":"#00C2A8"; ctx.fillRect(x,y,w*(carga/100),h);
}
function dibujarMensaje(){
  if(!juego.mensaje) return;
  juego.mensaje.t--; if(juego.mensaje.t<=0){ juego.mensaje=null; return; }
  ctx.font="bold 22px Poppins, sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillStyle="rgba(0,0,0,.5)"; ctx.fillRect(ANCHO/2-130, 14, 260, 32);
  ctx.fillStyle=juego.mensaje.color||"#fff"; ctx.fillText(juego.mensaje.texto, ANCHO/2, 30);
}

/* ============================================================
   BUCLE PRINCIPAL
   ============================================================ */
let ultimoTiempo=0, acumuladorReloj=0;
function loop(ts){
  if(!ultimoTiempo) ultimoTiempo=ts;
  const dt=(ts-ultimoTiempo)/1000; ultimoTiempo=ts;
  if(juego && juego.corriendo){ if(!juego.celebrando) actualizarJuego(dt); dibujarTodo(); }
  requestAnimationFrame(loop);
}
/* Aquí yo actualizo toda la lógica del partido */
function actualizarJuego(dt){
  juego.frames++;
  if(juego.balon.ignoraPortero>0 && Math.hypot(juego.balon.vx,juego.balon.vy)<1) juego.balon.ignoraPortero=0;
  acumuladorReloj+=dt;
  if(acumuladorReloj>=1){
    juego.tiempo-=Math.floor(acumuladorReloj); acumuladorReloj%=1;
    if(!juego.haltime && juego.tiempo<=juego.tiempoTotal/2){ juego.haltime=true; juego.ladoInvertido=true; reposicionarSaque(); juego.mensaje={ texto:"⏱️ SEGUNDO TIEMPO", t:100, color:"#ffd54f" }; }
    if(juego.tiempo<=0){ juego.tiempo=0; finalizarPartido(); return; }
    juego.proxPowerup--;
    if(juego.proxPowerup<=0 && !juego.powerupCancha){ generarPowerup(); juego.proxPowerup=45; }
    ["speed","magnet","shieldCpu"].forEach(ef=>{ if(juego.efectos[ef]>0){ juego.efectos[ef]--; if(juego.efectos[ef]===0) document.getElementById("sbPowerup").textContent=""; } });
    actualizarScoreboard();
  }
  if(juego.cargandoP1) juego.cargaP1=Math.min(100, juego.cargaP1+2.5);
  if(juego.cargandoP2) juego.cargaP2=Math.min(100, juego.cargaP2+2.5);
  // Aquí yo muevo a mi jugador 1 con joystick (prioritario) o teclado
  const mult=juego.efectos.speed>0?2:1;
  let ix=0, iy=0;
  if(joystick.active && joystick.mag>0.12){ ix=joystick.dx; iy=joystick.dy; }
  else { const v=vectorDirecciones(teclas["arrowup"],teclas["arrowdown"],teclas["arrowleft"],teclas["arrowright"]); ix=v.x; iy=v.y; }
  moverJugadorConVector(juego.locales[0], ix, iy, mult);
  // Aquí yo muevo al resto según el modo
  if(juego.modoAmigo){
    const v2=vectorDirecciones(teclas["w"],teclas["s"],teclas["a"],teclas["d"]);
    moverJugadorConVector(juego.rivales[0], v2.x, v2.y, 1);
    moverIAEquipo(juego.locales.slice(1)); moverIAEquipo(juego.rivales.slice(1));
  } else {
    moverIAEquipo(juego.locales.slice(1)); moverIAEquipo(juego.rivales);
  }
  moverPortero(juego.porteros.local); moverPortero(juego.porteros.cpu);
  actualizarBalon();
  colisionJugadorBalon();
  colisionEntreJugadores();
  chequearFaltasCpu();
  verificarColisionPowerup();
  chequearBalonAtascado();
}
function dibujarTodo(){
  dibujarCampo(); dibujarPowerup();
  dibujarPortero(juego.porteros.local); dibujarPortero(juego.porteros.cpu);
  juego.locales.forEach((j,i)=>dibujarJugador(j, i===0));
  rivalesActivos().forEach((j)=>dibujarJugador(j, juego.modoAmigo && j===juego.rivales[0]));
  dibujarBalon(); dibujarBarraCarga(); dibujarMensaje();
}
function actualizarScoreboard(){
  const m=Math.floor(juego.tiempo/60), s=juego.tiempo%60;
  document.getElementById("sbReloj").textContent=`${m}:${s.toString().padStart(2,"0")}`;
  document.getElementById("sbGolesLocal").textContent=juego.golesLocal;
  document.getElementById("sbGolesCpu").textContent=juego.golesCpu;
}

/* ============================================================
   INICIO Y FIN DE PARTIDO
   ============================================================ */
function iniciarPartido(modoAmigo){
  if(!perfil.club){ abrirModalClub(); return; }
  getAudio(); detenerMusica();
  juego=crearPartido(modoAmigo);
  document.getElementById("sbLocal").textContent=perfil.club;
  document.getElementById("sbCpu").textContent=modoAmigo?"Amigo":"CPU";
  document.getElementById("sbPowerup").textContent=""; document.getElementById("sbTarjetas").textContent="";
  ultimoTiempo=0; acumuladorReloj=0;
  actualizarScoreboard();
  irA("juego");
  // Aquí yo pito el saque inicial
  silbatoArbitro();
  if(modoAmigo) desbloquearLogro("amistoso");
}
function finalizarPartido(){
  juego.corriendo=false; sonidoPitido();
  const gl=juego.golesLocal, gc=juego.golesCpu;
  let resultado = gl>gc?"gano":gl<gc?"perdio":"empato";
  perfil.partidos++;
  if(resultado==="gano") perfil.victorias++; else if(resultado==="perdio") perfil.derrotas++; else perfil.empates++;
  // Aquí yo calculo las monedas ganadas
  let ganadas = resultado==="gano"?30:resultado==="empato"?10:5;
  ganadas += gl*5;
  if(resultado==="gano" && gc===0) ganadas+=20;
  perfil.coins += ganadas; juego.coinsGanadas=ganadas;
  // Aquí yo desbloqueo logros de fin de partido
  if(resultado==="gano" && gc===0) desbloquearLogro("muralla");
  if(resultado==="gano" && gl>=5 && gc===0) desbloquearLogro("francotirador");
  if(resultado==="gano" && juego.estuvo2Abajo) desbloquearLogro("remontada");
  if(perfil.nivelLiga>=LIGAS.length-1) desbloquearLogro("leyenda");
  // Aquí yo proceso la liga solo en modo liga
  if(!juego.modoAmigo){ perfil.resultadosLiga.push(resultado); procesarProgresoLiga(); }
  perfil.contadorAds++; guardarPerfil();
  mostrarResultado(resultado);
  if(perfil.contadorAds%3===0) setTimeout(mostrarAnuncio, 1200);
}
function procesarProgresoLiga(){
  const res=perfil.resultadosLiga;
  const g=res.filter(r=>r==="gano").length, p=res.filter(r=>r==="perdio").length;
  if(g>=3){
    desbloquearLogro("campeon");
    if(p===0) desbloquearLogro("invicto");
    if(perfil.nivelLiga<LIGAS.length-1){ perfil.nivelLiga++; if(!perfil.trofeos.includes("🥇")) perfil.trofeos.push("🥇"); }
    else if(!perfil.trofeos.includes("👑")) perfil.trofeos.push("👑");
    if(perfil.nivelLiga>=LIGAS.length-1) desbloquearLogro("leyenda");
    perfil.resultadosLiga=[];
  } else if(p>=3){ if(perfil.nivelLiga>0) perfil.nivelLiga--; perfil.resultadosLiga=[]; }
  else if(res.length>=5){ if(p===0) desbloquearLogro("invicto"); perfil.resultadosLiga=[]; }
}

/* ============================================================
   PANTALLA DE RESULTADO + ESTADÍSTICAS
   ============================================================ */
const SECCIONES = [
  { titulo:"Principales", filas:[ ["Goles esperados (xG)","xg","dec"],["Posesión","__pos__","pct"],["Remates totales","remates"],["Remates a puerta","rematesPuerta"],["Grandes ocasiones","grandesOcasiones"],["Córners","corners"],["Pases","pases"],["Tarjetas amarillas","amarillas"] ]},
  { titulo:"Remates", filas:[ ["Goles esperados (xG)","xg","dec"],["xG a puerta (xGOT)","xgot","dec"],["Remates totales","remates"],["Remates a puerta","rematesPuerta"],["Remates fuera","rematesFuera"],["Remates rechazados","rematesRechazados"],["Remates dentro del área","rematesDentroArea"],["Remates fuera del área","rematesFueraArea"],["Al palo","alPalo"] ]},
  { titulo:"Ataque", filas:[ ["Grandes ocasiones","grandesOcasiones"],["Córners","corners"],["Toques en el área rival","toquesAreaRival"],["Pases entre líneas completados","pasesEntreLineas"],["Fueras de juego","fuerasDeJuego"],["Tiros libres","tirosLibres"] ]},
  { titulo:"Pases", filas:[ ["Pases","pases"],["Pases largos","pasesLargos"],["Pases en el último tercio","pasesUltimoTercio"],["Centros","centros"],["Asistencias esperadas (xA)","xa","dec"],["Saques de banda","saquesBanda"] ]},
  { titulo:"Defensa", filas:[ ["Faltas","faltas"],["Entradas","entradas"],["Duelos ganados","duelosGanados"],["Despejes","despejes"],["Intercepciones","intercepciones"],["Errores conducentes a remate","erroresRemate"],["Errores conducentes a gol","erroresGol"] ]},
  { titulo:"Paradas", filas:[ ["Paradas","paradas"],["xGOT enfrentados","xgotEnfrentado","dec"],["Goles evitados","golesEvitados","dec"] ]}
];
function fmtStat(v, tipo){ if(tipo==="dec") return (v||0).toFixed(2); if(tipo==="pct") return Math.round(v)+"%"; return Math.round(v||0); }
function posesionLocalPct(){ const total=juego.statsL.posesionFrames+juego.statsC.posesionFrames || 1; return (juego.statsL.posesionFrames/total)*100; }
function valoresFila(key){ if(key==="__pos__"){ const pl=posesionLocalPct(); return [pl, 100-pl]; } return [ juego.statsL[key], juego.statsC[key] ]; }
let tabActiva=0;
function construirTabs(){
  const cont=document.getElementById("tabsStats"); cont.innerHTML="";
  SECCIONES.forEach((sec,i)=>{ const b=document.createElement("button"); b.className="tab-btn"+(i===tabActiva?" activa":""); b.textContent=sec.titulo; b.onclick=()=>{ tabActiva=i; construirTabs(); renderBloqueStats(); }; cont.appendChild(b); });
}
function renderBloqueStats(){
  const sec=SECCIONES[tabActiva]; const cont=document.getElementById("contenedorStats"); cont.innerHTML="";
  const bloque=document.createElement("div"); bloque.className="bloque-stats";
  if(tabActiva===0){
    const pl=Math.round(posesionLocalPct());
    const circ=document.createElement("div"); circ.className="posesion-circ";
    circ.innerHTML=`<div class="anillo" style="background:conic-gradient(var(--turquesa) ${pl}%, var(--rojo-cpu) 0); color:#061224;"><div style="width:64px;height:64px;border-radius:50%;background:var(--azul-marino);display:flex;align-items:center;justify-content:center;color:var(--turquesa);">${pl}%</div></div><div style="font-size:12px;opacity:.8;text-align:left;">Posesión<br><b style="color:var(--turquesa)">${pl}%</b> vs <b style="color:var(--rojo-cpu)">${100-pl}%</b></div>`;
    bloque.appendChild(circ);
  }
  sec.filas.forEach(fila=>{
    const [label,key,tipo]=fila; const [vl,vr]=valoresFila(key); const total=(vl+vr)||1;
    const wl=Math.max(4,(vl/total)*100), wr=Math.max(4,(vr/total)*100);
    const div=document.createElement("div"); div.className="stat-comp";
    div.innerHTML=`<div class="top"><span class="vl">${fmtStat(vl,tipo)}</span><span class="lbl">${label}</span><span class="vr">${fmtStat(vr,tipo)}</span></div><div class="bars"><div class="bl" style="width:${wl}%"></div><div class="br" style="width:${wr}%"></div></div>`;
    bloque.appendChild(div);
  });
  cont.appendChild(bloque);
}
function mostrarResultado(resultado){
  const t=document.getElementById("resultadoTitulo");
  t.textContent = resultado==="gano"?"¡VICTORIA!":resultado==="perdio"?"DERROTA":"EMPATE";
  document.getElementById("resultadoLiga").textContent=LIGAS[perfil.nivelLiga].nombre;
  document.getElementById("rfLocal").textContent=perfil.club;
  document.getElementById("rfCpu").textContent=juego.modoAmigo?"Amigo":"CPU";
  document.getElementById("rfMarcador").textContent=`${juego.golesLocal} - ${juego.golesCpu}`;
  document.getElementById("coinsResultado").textContent=`🪙 +${juego.coinsGanadas} monedas  (Total: ${perfil.coins})`;
  renderProgresoLiga();
  tabActiva=0; construirTabs(); renderBloqueStats();
  document.getElementById("btnCompartir").style.display = resultado==="gano"?"block":"none";
  renderPerfil();
  irA("resultado");
}
function renderProgresoLiga(){
  const cont=document.getElementById("progresoLiga"); cont.innerHTML="";
  for(let i=0;i<5;i++){
    const d=document.createElement("div"); d.className="punto-partido"; const r=perfil.resultadosLiga[i];
    if(r==="gano"){ d.classList.add("gano"); d.textContent="✓"; }
    else if(r==="perdio"){ d.classList.add("perdio"); d.textContent="✗"; }
    else if(r==="empato"){ d.classList.add("empato"); d.textContent="="; }
    else d.textContent=i+1;
    cont.appendChild(d);
  }
}

/* ============================================================
   ANUNCIO RECOMPENSADO
   ============================================================ */
function mostrarAnuncio(){
  document.getElementById("modalAd").classList.add("activo");
  let c=5; const cont=document.getElementById("contadorAd"), btn=document.getElementById("btnCerrarAd");
  cont.textContent=c; btn.disabled=true; btn.style.opacity=".5"; btn.textContent="Espera...";
  const iv=setInterval(()=>{ c--; cont.textContent=c; if(c<=0){ clearInterval(iv); cont.textContent="¡Listo!"; btn.disabled=false; btn.style.opacity="1"; btn.textContent="Cerrar y Continuar"; } },1000);
}
document.getElementById("btnCerrarAd").onclick=()=>document.getElementById("modalAd").classList.remove("activo");

/* ============================================================
   COMPARTIR
   ============================================================ */
function generarTextoCompartir(){ return `⚽ ¡${perfil.club} ganó ${juego.golesLocal}-${juego.golesCpu} en ${LIGAS[perfil.nivelLiga].nombre}! 🏆 Juega El Mundo de Manu - Fútbol Arcade 🔥`; }
document.getElementById("btnCompartir").onclick=()=>{
  const texto=generarTextoCompartir();
  if(navigator.share){ navigator.share({ title:"El Mundo de Manu", text:texto }).catch(()=>{}); }
  else { const wa="https://wa.me/?text="+encodeURIComponent(texto); const tw="https://twitter.com/intent/tweet?text="+encodeURIComponent(texto); if(confirm("¿Compartir en WhatsApp? (Cancelar = Twitter/X)")) window.open(wa,"_blank"); else window.open(tw,"_blank"); }
};

/* ============================================================
   TABLA DE LIGA
   ============================================================ */
function mostrarTablaLiga(){
  document.getElementById("tablaLigaNombre").textContent=LIGAS[perfil.nivelLiga].nombre;
  const equipos=[];
  const g=perfil.resultadosLiga.filter(r=>r==="gano").length, e=perfil.resultadosLiga.filter(r=>r==="empato").length, p=perfil.resultadosLiga.filter(r=>r==="perdio").length;
  equipos.push({ nombre:perfil.club||"Mi Club", pj:perfil.resultadosLiga.length, g, e, p, pts:g*3+e, yo:true });
  [...NOMBRES_RIVALES].sort(()=>Math.random()-0.5).slice(0,7).forEach(nombre=>{
    const pj=3+Math.floor(Math.random()*3), gg=Math.floor(Math.random()*(pj+1)), pp=Math.floor(Math.random()*(pj-gg+1)), ee=pj-gg-pp;
    equipos.push({ nombre, pj, g:gg, e:ee, p:pp, pts:gg*3+ee, yo:false });
  });
  equipos.sort((a,b)=>b.pts-a.pts);
  const tabla=document.getElementById("tablaPosiciones");
  tabla.innerHTML=`<tr><th>Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>Pts</th></tr>`;
  equipos.forEach((eq,i)=>{ const tr=document.createElement("tr"); if(eq.yo) tr.className="yo"; tr.innerHTML=`<td>${i+1}. ${eq.nombre}</td><td>${eq.pj}</td><td>${eq.g}</td><td>${eq.e}</td><td>${eq.p}</td><td>${eq.pts}</td>`; tabla.appendChild(tr); });
  irA("tabla");
}

/* ============================================================
   ENLACES DE BOTONES
   ============================================================ */
document.getElementById("btnJugarLiga").onclick=()=>iniciarPartido(false);
document.getElementById("btnVsAmigo").onclick=()=>iniciarPartido(true);
document.getElementById("btnTienda").onclick=()=>{ construirTienda(); document.getElementById("modalTienda").classList.add("activo"); };
document.getElementById("btnCerrarTienda").onclick=()=>document.getElementById("modalTienda").classList.remove("activo");
document.getElementById("btnLogros").onclick=mostrarLogros;
document.getElementById("btnLogrosVolver").onclick=()=>irA("menu");
document.getElementById("btnVerLiga").onclick=mostrarTablaLiga;
document.getElementById("btnEditarPerfil").onclick=abrirModalClub;
document.getElementById("btnTablaVolver").onclick=()=>irA("menu");
document.getElementById("btnVolverMenu").onclick=()=>{ renderPerfil(); irA("menu"); };
document.getElementById("btnSiguientePartido").onclick=()=>iniciarPartido(juego?juego.modoAmigo:false);

/* ============================================================
   ARRANQUE
   ============================================================ */
renderPerfil();
if(!perfil.club) setTimeout(abrirModalClub, 400);
// Aquí yo arranco la música al primer toque del usuario (requisito de los navegadores)
window.addEventListener("pointerdown", function arranqueAudio(){ getAudio(); if(!muted && pantallas.menu.classList.contains("activa")) iniciarMusica(); window.removeEventListener("pointerdown", arranqueAudio); }, { once:true });
requestAnimationFrame(loop);
