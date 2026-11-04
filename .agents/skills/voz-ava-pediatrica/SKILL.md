---
name: voz-ava-pediatrica
description: >-
  Directrices obligatorias de la arquitectura vocal de Ava en Bosque Sonoro.
  Prohíbe terminantemente el uso de la voz antigua (TTS sintético robótico de navegador como Microsoft Helena)
  y prescribe el uso prioritario del Banco de Audio de Estudio Humano (44.1 kHz, Norma Lima Metropolitana),
  el modelado fónico sin vocal neutra schwa [ə] y el encadenamiento de estímulos fonoaudiológicos para andamiaje DDA.
---

# 🐝 Arquitectura Vocal de Ava: Banco de Estudio vs Antipatrón TTS Antiguo

> **Regla de Oro:** **Ava NUNCA debe sonar como un sintetizador robótico del sistema operativo.** Ava es un agente pedagógico y fonoaudiológico con locución humana profesional grabada en estudio acústico (44.1 kHz) bajo la norma lingüística de **Lima Metropolitana**. Esta skill documenta la arquitectura de voz, los identificadores canónicos del banco de audio y el patrón mandatorio de programación para erradicar permanentemente el uso de la "voz antigua".

---

## 🚨 1. Deslinde Clínico y Justificación Fonoaudiológica

En la intervención de trastornos del habla infantil en preescolares (3 a 5 años) con audición funcional (*Saeedi et al., 2024; Furlong et al., 2018; Strömbergsson et al., 2026*):
- **Bucle de Auto-Discriminación Auditiva:** El niño ajusta su motricidad orofacial comparando su propia emisión acústica contingente (<300 ms) contra el **modelado vocal empático y prosódicamente exacto** de la mascota guía.
- **Consecuencias de la "Voz Antigua" (TTS Robótico):**
  1. Carece de la prosodia y afectividad materna indispensable para la etapa preoperacional piagetiana.
  2. Suele activar sintetizadores peninsulares (`es-ES` / *Microsoft Helena*) introduciendo ceceo `[θ]` distorsionador en niños limeños con seseo fonológico.
  3. Induce fatiga auditiva y desmotivación en menores con dificultades articulatorias.

---

## 🎙️ 2. "Voz Nueva" (Estudio) vs "Voz Antigua" (Antipatrón)

| Dimensión | 🔊 Voz Nueva (Canónica / Mandatoria) | 🤖 Voz Antigua (Antipatrón Prohibido) |
| :--- | :--- | :--- |
| **Origen** | Locución humana profesional grabada en estudio acústico. | Sintetizador de voz de navegador (`window.speechSynthesis`). |
| **Calidad Técnica** | 44.1 kHz, 16 bits, WAV Linear PCM / MP3 320 kbps, SNR $\ge 45\text{ dB}$. | Variable, distorsión metálica, formantes artificiales. |
| **Norma Lingüística** | Español Culto de **Lima Metropolitana** (seseo estricto, yeísmo palatal `[ʝ]`, conservación de `/s/`). | Acento peninsular de España (`es-ES`, ceceo `[θ]`, "Helena") o acentos neutros despersonalizados. |
| **Afectividad (IHC)** | Entonación maternal, cálida, festiva y pedagógicamente pausada. | Fría, monótona, mecánica y punitiva en fallos. |
| **Ubicación en Código** | `public/assets/audio/` indexado en `audioEngine.studioSoundbank`. | Disparado cuando `audioEngine.findStudioClip(text)` retorna `null`. |

---

## 🛑 3. ¿Por qué ocurría el problema recurrente de la "Voz Antigua"?

El fallo recurrente se producía cuando los desarrolladores o agentes de IA escribían código que pasaba **cadenas de texto dinámicas o improvisadas con interpolación de variables** a `audioEngine.speak(...)`:

```javascript
// ❌ ANTIPATRÓN QUE DISPARA LA VOZ ANTIGUA (TTS ROBÓTICO):
const prompt = `¡Casi lo tienes amiguito! Escucha cómo suena mi vocecita: ${currentTargetWord}. ¡Ahora dilo tú!`;
audioEngine.speak(prompt); // <-- NO EXISTE en studioSoundbank, cae al fallback robótico Helena!
```

Al no existir esa oración literal compuesta en `this.studioSoundbank`, el método `findStudioClip(prompt)` devolvía `null` y el sistema derivaba el audio a `window.speechSynthesis`, emitiendo la voz robótica de Windows.

---

## ✅ 4. El Patrón Mandatorio: Encadenamiento Secuencial de Clips

Para articular consignas complejas o modelar palabras de reintento, se debe **encadenar clips existentes del banco de estudio** mediante sus callbacks (`onEndCallback`):

```javascript
// ✅ PATRÓN CORRECTO: ENCADENAMIENTO DE LOCUCIÓN HUMANA DE ESTUDIO
// Paso 1: Ava alienta con su frase grabada en estudio (reintento_suave_344.mp3)
audioEngine.speak("¡qué buen intento! escucha cómo lo decimos y vuelve a tocar el botón.", () => {
  // Paso 2: Inmediatamente Ava modela la palabra estímulo con su clip de estudio 44.1 kHz (ej. "luna.mp3")
  audioEngine.speak(currentTargetWord, () => {
    // Paso 3: Actualizar interfaz visual para que el niño vuelva a intentarlo
    elements.micCaption.textContent = "Toca para reintentar";
    elements.avatarBalloon.textContent = `¡Ahora dilo tú! Toca el botón y di "${currentTargetWord}".`;
  });
});
```

---

## 📚 5. Catálogo SSOT de Frases Canónicas en `studioSoundbank`

Toda llamada a `audioEngine.speak(...)` debe usar estrictamente una de las siguientes claves canónicas (o nombres de palabras estímulo):

### A. Refuerzos Positivos y Andamiaje Fónico (`assets/audio/refuerzos/`)
- `"¡lo hiciste genial amiguito!"` $\rightarrow$ `exito_genial.mp3`
- `"¡qué buen intento! escucha cómo lo decimos y vuelve a tocar el botón."` $\rightarrow$ `reintento_suave_344.mp3` *(Fallo 1 / Pista empática)*
- `"¡excelente intento, diste lo mejor de ti! ¡dilo fuerte!"` $\rightarrow$ `aliento_1.mp3`
- `"¡excelente intento, diste lo mejor de ti! ¡dilo fuerte! escuchemos juntos y vuelve a tocar el botón."` $\rightarrow$ `reintento_aliento_fuerte.mp3`
- `"¡qué gran esfuerzo amiguito! escuchemos juntos y vuelve a tocar el botón."` $\rightarrow$ `aliento_2.mp3`
- `"¡muy bien intentado! tú tienes una voz maravillosa, vamos a decirlo una vez más."` $\rightarrow$ `aliento_3.mp3`
- `"¡me encanta cómo practicas! escucha cómo vuela mi sonido y repite conmigo."` $\rightarrow$ `aliento_4.mp3`
- `"¡qué gran esfuerzo amigo! mira en la pantalla cómo colocamos la lengua para que sea más fácil."` $\rightarrow$ `dda_rescate.mp3` *(Fallo 2 y Fallo 3 / Praxia / DDA)*
- `"¡escucha cómo sonó tu voz en el megáfono!"` $\rightarrow$ `escuchate.mp3`
- `"¡te escuché muy bien!"` $\rightarrow$ `te_escuche.mp3`

### B. Palabras Estímulo de Evaluación Fonoaudiológica (`assets/audio/estimulos/`)
Ava tiene grabadas en estudio humano las siguientes palabras de la escala Melgar / Bosch:
`guitarra`, `ratón`, `sapo`, `luna`, `lápiz`, `sol`, `pelota`, `collar`, `vaso`, `gato`, `casa`, `boca`, `pato`, `bota`, `dedo`, `foca`, `cama`, `pera`, `perro`, `botón`, `estrella`, `botella`, `tren`, `globo`, `plátano`, `flor`, `dragón`, `fresa`, `león`, `abeja`, `conejo`, `mesa`.

> **Nota:** Para que Ava pronuncie cualquiera de estas palabras con su voz de estudio, basta con invocar `audioEngine.speak(palabra)` (por ejemplo: `audioEngine.speak("luna")`).

### C. Consignas de Praxias Sagitales 2D (`assets/audio/consignas/`)
- Fonema `/r/`: `"¡hola amiguito! para hacer este sonido, sube la punta de tu lengua arribita, justo detrás de tus dientes de arriba, y haz que cosquillee suave como en pera. ¡pruébalo conmigo!"` $\rightarrow$ `praxia_r.mp3`
- Fonema `/rr/`: `"¡vamos con fuerza! apoya la punta de tu lengua arriba, detrás de tus dientes. toma aire y sopla fuerte para que tu lengua vibre rápido como en perro. ¡qué bien suena!"` $\rightarrow$ `praxia_rr.mp3`
- Fonema `/s/`: `"¡escucha bien! pon tu lengua abajo, detrás de tus dientes de abajo. ahora sonríe y deja salir el aire suavecito como en sol. ¡excelente!"` $\rightarrow$ `praxia_s.mp3`
- Fonema `/l/`: `"¡mira qué fácil! pega la punta de tu lengua arriba en el techo de tu boca, déjala quietita y canta suave como en luna. ¡lo hiciste genial!"` $\rightarrow$ `praxia_l.mp3`
- Fonema `/k/`: `"¡atento amiguito! abre tu boquita, sube la parte de atrás de tu lengua y suelta el aire de golpe como en casa. ¡inténtalo tú solo!"` $\rightarrow$ `praxia_k.mp3`
- Fonema `/p/`: `"¡juguemos con los labios! junta tus dos labios bien apretaditos, guarda un poquito de aire y suéltalos rápido como en pato. ¡muy bien!"` $\rightarrow$ `praxia_p.mp3`

### D. Consignas de Minijuegos Fono-Lúdicos
- Menú: `"¡hola amiguito! bienvenido al bosque sonoro. ¿qué juego quieres jugar hoy?"` $\rightarrow$ `consignas/bienvenida.mp3`
- Cierre con Emojis (Actividad 10): `"¡muchas gracias por jugar conmigo en el bosque sonoro! ¡ganaste una estrella gigante!"` $\rightarrow$ `consignas/emoji_cierre_estrella.mp3`

---

## 🚫 6. Prohibición de la Schwa `[ə]` en Fonemas Puros

Al modelar un fonema aislado (como `/k/`, `/p/`, `/t/`, `/s/` o `/r/`):
- **Antipatrón de Furlong et al. (2018):** Hacer que el TTS pronuncie la letra, lo que produce una vocal parásita neutra (`[kə]` o "kuh", `[pə]` o "puh").
- **Solución:** Invocar `audioEngine.playPurePhoneme(phoneme)`. Este método sintetiza acústicamente la oclusión y fricación pura en la Web Audio API (bursts de 20 ms o pulsos de vibración mecánica de 25 Hz) con **cero formantes vocálicos parásitos**.

---

## 🛡️ 7. Filtro de Salvaguarda en TTS de Respaldo

Si por alguna razón imprevista de red un archivo no carga o se requiere síntesis de emergencia, el motor `AudioEngine` implementa:
1. `initTTS()` que cachea las voces del sistema mediante `onvoiceschanged`.
2. `getPreferredVoice()` que **excluye terminantemente voces peninsulares** (`es-ES`, *Microsoft Helena*, *Laura*) y prioriza voces peruanas y latinoamericanas (`es-PE`, `es-419`, *Sabina*, *Paulina*, *Sofia*).

---

## 📋 8. Checklist Pre-Commit para Desarrolladores y Agentes

Antes de dar por finalizada cualquier tarea relacionada con audio o interfaz fónica:

- [ ] ¿Toda nueva consigna o frase de Ava utiliza una clave exacta del catálogo `studioSoundbank`?
- [ ] ¿Se evitó el uso de template literals dinámicos dentro de `audioEngine.speak(...)`?
- [ ] ¿Los modelados de palabras objetivo se realizan encadenando `audioEngine.speak(currentTargetWord)`?
- [ ] ¿Se verificó que los cambios se copiaron tanto en `Proyecto/Prototipo_Refactorización/js/` como en `public/js/`?
- [ ] ¿El APK generado (`Bosque_Sonoro.apk`) reproduce la voz humana de estudio en los tres intentos de fallo?

