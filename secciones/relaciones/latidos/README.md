# 💗 Latidos: Modo Pareja

Mi videojuego exclusivo para dos jugadores: novio y novia. Nadie más.
Una colección de minijuegos diseñada para provocar risas, besos, abrazos,
nervios, confesiones y momentos tiernos.

**Creado por El Mundo de Manu** 🌍

---

## 🚀 Cómo lo ejecuto en VS Code

1. Abro la carpeta `latidos` en Visual Studio Code.
2. Instalo la extensión **Live Server** (Ritwick Dey).
3. Clic derecho sobre `index.html` → **"Open with Live Server"**.
4. Para probar en el celular: abro `http://MI-IP-LOCAL:5500` desde el teléfono
   (deben estar en la misma red WiFi).

> ⚠️ Si actualicé archivos y veo contenido viejo, hago **Ctrl + Shift + R**
> (recarga forzada). Live Server a veces cachea el JavaScript anterior.

## 📱 Empaquetado para Android (Capacitor)

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npm run android:init     # Crea la config de Capacitor
npm run android:add      # Agrega la plataforma Android
npm run android:sync     # Copia el código web al proyecto Android
npm run android:open     # Abre Android Studio para compilar el APK
```

## 🗂️ Estructura del proyecto

```
latidos/
├── index.html                        # Todas las pantallas del juego
├── package.json
├── README.md
├── css/
│   └── estilos.css                   # Identidad visual + temas por variables CSS
├── js/
│   ├── estado.js                     # Corazones, progreso y guardado (localStorage)
│   ├── datos-mundos.js               # Catálogo de los 5 mundos y sus experiencias
│   ├── navegacion.js                 # Mini-router de pantallas + modal reutilizable
│   ├── estadisticas.js               # Racha diaria, favorito, sincronía, química
│   ├── tienda.js                     # Tienda: temas, avatares y partículas
│   ├── sonidos.js                    # Audio generado con Web Audio API (sin mp3)
│   ├── app.js                        # Director de orquesta
│   ├── minijuegos/
│   │   ├── carrera-del-beso.js       # Mundo 1 · toques rápidos, el perdedor besa
│   │   ├── corazon-equilibrado.js    # Mundo 1 · cooperativo con física propia
│   │   ├── quien-me-conoce.js        # Mundo 2 · responde en secreto y adivina
│   │   ├── atrapa-el-amor.js         # Mundo 3 · lluvia de corazones 45s
│   │   └── ruleta-de-pareja.js       # Mundo 4 · 22 retos con giro real
│   └── mundo5/
│       ├── cartas-romanticas.js      # Cartas editables guardadas para siempre
│       ├── capsula-del-tiempo.js     # Mensajes sellados hasta una fecha futura
│       ├── cofre-de-recuerdos.js     # Museo: stats, logros, fechas + ESCENA FINAL
│       └── logros.js                 # 25 logros de pareja + tiempo jugado
└── assets/                           # Reservada para imágenes futuras
```

## 🧠 Decisiones de arquitectura que tomé

- **Vanilla JS sin frameworks**: navegación instantánea, cero dependencias,
  compatible directo con Capacitor.
- **Patrón decorator (envolturas)**: `estadisticas.js`, `logros.js`, `tienda.js`
  y `sonidos.js` envuelven funciones de los módulos anteriores en vez de
  modificarlos. Por eso el **orden de los `<script>` en index.html es sagrado**:
  estado → datos → navegación → minijuegos → estadísticas → mundo5 → logros → tienda → sonidos → app.
- **Variables CSS como tokens**: los temas de la tienda solo repintan `:root`
  y el juego entero cambia de ropa.
- **Audio por osciladores**: sin archivos de sonido, funciona offline y pesa 0 KB.
- **localStorage con una sola llave** (`latidos_elmundodemanu`): todo el progreso
  de la pareja viaja en un solo objeto versionable.

## 🎮 Contenido

| Mundo | Experiencias | Desbloqueo |
|---|---|---|
| 1. Primeras Sonrisas | Carrera del Beso 💋 · Corazón Equilibrado 🫶 | Gratis |
| 2. Química | ¿Quién Me Conoce Más? 🧠 | 20 ❤️ |
| 3. Locuras Juntos | Atrapa el Amor 💘 | 40 ❤️ + 3 partidas |
| 4. Confesiones | Ruleta de Pareja 🎡 | 60 ❤️ + 6 partidas |
| 5. Para Siempre | Cartas 💌 · Cápsula ⏳ · Cofre 🗝️ · Escena Final 🌟 | 100 ❤️ + 10 partidas |

Extras: tienda de decoraciones 🛍️ (5 temas, 6 parejas de avatares, 5 sets de
partículas), 25 logros 🏆, estadísticas de pareja 📊, sonido conmutable 🔊.

## 🧪 Cómo pruebo que todo funciona

1. Nombres → mapa → jugar Carrera del Beso (deben sonar los taps y la monedita).
2. Verificar que los corazones suben y se guardan al recargar (F5).
3. Desbloquear Mundo 2 con 20 ❤️ y jugar ¿Quién Me Conoce Más?
4. Botón 📊: la racha debe marcar 1 día y el favorito debe aparecer.
5. Botón 🛍️: comprar un tema y recargar → el tema debe persistir.
6. Mundo 5: escribir una carta, sellar una cápsula con fecha de mañana
   (debe negarse a abrirla hoy) y revisar el Cofre.
7. Con los 5 mundos desbloqueados: entrar a Escena Final 🌟.
