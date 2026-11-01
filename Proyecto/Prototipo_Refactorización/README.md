# 🐝 Bosque Sonoro • Prototipo Refactorizado Móvil (Vite + Capacitor)

> **Aplicación Fono-Lúdica Pediátrica para la Articulación Fonética**  
> *Interacción Humano-Computador (IHC) — FISI - UNMSM*

---

## 🚀 Inicio Rápido (Desarrollo Local)

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor Vite (escucha en localhost y en la red local Wi-Fi)
npm run dev
```

- **App del Niño (Juego Principal):** [http://localhost:5173](http://localhost:5173)
- **Consola Remota del Evaluador:** [http://localhost:5173/evaluador.html](http://localhost:5173/evaluador.html)

---

## 📱 Generación del Descargable / APK Android

Para compilar el archivo instalable `.apk` para tablets o celulares:

```bash
# 1. Generar build de producción y sincronizar con Capacitor
npm run build
npx cap sync
```

### Opción A: Compilar APK directo por terminal (sin Android Studio)
*Requiere `JAVA_HOME` apuntando a JDK 17 o 21.*

- **Windows (PowerShell / CMD):**
  ```powershell
  cd android
  .\gradlew.bat assembleDebug
  ```

- **Linux / macOS:**
  ```bash
  cd android
  ./gradlew assembleDebug
  ```

- **Ruta del APK compilado:**  
  `android/app/build/outputs/apk/debug/app-debug.apk`

### Opción B: Usando Android Studio
```bash
npm run cap:open:android
```
1. En Android Studio, ve a **Build** ➔ **Build Bundle(s) / APK(s)** ➔ **Build APK(s)**.
2. Al terminar, haz clic en **locate** para obtener el archivo `app-debug.apk`.

---

## 🧪 Guía Rápida del Modo Evaluación Micro-SCED (Actividad 10)

El sistema opera bajo **Arquitectura Desacoplada Zero-HUD**: la tablet del niño permanece 100% libre de elementos evaluadores invasivos, mientras que el evaluador califica de forma remota en tiempo real.

### 👶 En la Tablet del Niño (`index.html`)
1. Abre [http://localhost:5173](http://localhost:5173) en la tablet.
2. Acceso a la configuración de la sesión:
   - **Triple toque rápido** sobre el avatar de Ava en la esquina superior izquierda (`#headerAppLogo`).
   - O presiona `Ctrl + Alt + E`.
3. Selecciona el participante (`P01` a `P04`) y haz clic en **`🚀 Iniciar Prueba Infantil (Pantalla Limpia Zero-HUD)`**.
4. El niño juega sin distracciones.
5. Al finalizar los 12–15 minutos (o por orden remota del evaluador), Ava narrará el **Cuestionario Pictórico de Emojis** de 3 preguntas.

### 🧑‍💻 En el Portátil o Celular del Evaluador (`evaluador.html`)
1. Abre [http://localhost:5173/evaluador.html?room=G7-P01](http://localhost:5173/evaluador.html?room=G7-P01) (o con la IP Wi-Fi de la máquina servidor).
2. Verifica el indicador `🟢 En Línea con Tablet`.
3. **Pestaña 1 (🎛️ Mando en Vivo & PSF):**
   - Califica con el pulgar cada emisión del niño: `✔ Correcto`, `O: Omisión`, `S: Sustitución` o `D: Distorsión`.
   - Botón `🤝 +1 Apoyo Verbal (CA)` para registrar asistencias tras >10 s de titubeo.
   - Botón `👁️ Alternar Modo CVI` para activar alto contraste en la tablet del niño.
   - Botón `🏁 Cerrar Prueba y Lanzar Emojis al Niño` para activar el cierre infantil remotamente.
4. **Pestañas 2, 3 y 4:** Ficha Bosch & Melgar, cuestionarios PSSUQ (1–7), MARS (1–5), 10 Heurísticas de Nielsen (0–4) y **descarga en 1 clic de reportes en `.json` (esquema SCED listo para Kruskal-Wallis / Mann-Whitney U) y `.csv`**.

