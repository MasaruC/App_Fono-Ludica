/* ==========================================================================
   SPEECH RECOGNITION SERVICE - MOTOR DUAL NATIVO / WEB AUDIO PEDIÁTRICO
   Cumple con: RF-ASR-001, RF-BIO-002, RN-FON-001, RN-FON-002, RN-DDA-001, RN-GAM-001
   Sustento: Strömbergsson et al. (2026) (Tolerancia en ASR infantil y concordancia),
             Hourcade (2008), Du et al. (2023), Saeedi et al. (2024)
   ========================================================================== */

class SpeechRecognitionService {
  constructor(audioContext = null) {
    this.audioContext = audioContext;
    this.isNative = !!(window.Capacitor && window.Capacitor.isPluginAvailable && window.Capacitor.isPluginAvailable('SpeechRecognition'));
    this.nativePlugin = this.isNative ? window.Capacitor.Plugins.SpeechRecognition : null;

    // Web Speech API fallback
    const SpeechRecClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.webSpeechRec = SpeechRecClass ? new SpeechRecClass() : null;
    if (this.webSpeechRec) {
      this.webSpeechRec.lang = 'es-PE';
      this.webSpeechRec.continuous = false;
      this.webSpeechRec.interimResults = true; // Activo para captura inmediata sin latencia de fin de frase
      this.webSpeechRec.maxAlternatives = 5;
    }

    // Estado interno
    this.isListening = false;
    this.currentTranscript = '';
    this.activeStream = null;
    this.isSharedStream = false;
    this.analyser = null;
    this.vadData = {
      startTime: 0,
      speechStartTime: 0,
      speechEndTime: 0,
      phonatoryDurationMs: 0,
      peakRms: 0,
      rmsSamples: [],
      hasAcousticEffort: false
    };

    this.vadInterval = null;
  }

  setAudioContext(ctx) {
    this.audioContext = ctx;
  }

  /* Solicitar permisos de micrófono (Capacitor o Web) */
  async requestPermissions() {
    if (this.isNative && this.nativePlugin) {
      try {
        const hasPerm = await this.nativePlugin.hasPermission();
        if (!hasPerm.permission) {
          const req = await this.nativePlugin.requestPermission();
          return !!req.permission;
        }
        return true;
      } catch (err) {
        console.warn('[SpeechService] Error solicitando permisos nativos:', err);
      }
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        return true;
      } catch (e) {
        console.warn('[SpeechService] Permiso de micrófono denegado:', e);
        return false;
      }
    }
    return false;
  }

  /* Iniciar captura dual: ASR (Nativo/Web) + Análisis Acústico VAD */
  async startListening(onAmplitudeCallback = null, existingStream = null, existingCtx = null) {
    if (this.isListening) return;
    this.isListening = true;
    this.currentTranscript = '';

    // 1. Reset métricas acústicas VAD (KPI-10 APED)
    this.vadData = {
      startTime: performance.now(),
      speechStartTime: 0,
      speechEndTime: 0,
      phonatoryDurationMs: 0,
      peakRms: 0,
      rmsSamples: [],
      hasAcousticEffort: false
    };

    // 2. Conectar analizador de audio Web Audio para VAD en tiempo real
    try {
      if (existingCtx) {
        this.audioContext = existingCtx;
      } else if (!this.audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      if (existingStream) {
        this.activeStream = existingStream;
        this.isSharedStream = true;
      } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.activeStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.isSharedStream = false;
      }

      if (this.audioContext && this.activeStream) {
        const source = this.audioContext.createMediaStreamSource(this.activeStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        source.connect(this.analyser);

        const buffer = new Uint8Array(this.analyser.frequencyBinCount);
        // Umbral calibrado para voz preescolar (3-5 años) y micrófonos de tablets/móviles
        const RMS_THRESHOLD = 0.028;

        this.vadInterval = setInterval(() => {
          if (!this.isListening || !this.analyser) return;
          this.analyser.getByteTimeDomainData(buffer);

          // Calcular RMS de energía vocal
          let sum = 0;
          for (let i = 0; i < buffer.length; i++) {
            const norm = (buffer[i] - 128) / 128;
            sum += norm * norm;
          }
          const rms = Math.sqrt(sum / buffer.length);
          this.vadData.rmsSamples.push(rms);
          if (rms > this.vadData.peakRms) {
            this.vadData.peakRms = rms;
          }

          // Callback de onda reactiva visual
          if (onAmplitudeCallback) {
            onAmplitudeCallback(rms);
          }

          // Detección de fonación activa sostenida
          if (rms >= RMS_THRESHOLD) {
            const now = performance.now();
            if (this.vadData.speechStartTime === 0) {
              this.vadData.speechStartTime = now;
            }
            this.vadData.speechEndTime = now;
            this.vadData.hasAcousticEffort = true;
          }
        }, 35);
      }
    } catch (err) {
      console.warn('[SpeechService] No se pudo inicializar VAD Web Audio:', err);
    }

    // 3. Iniciar ASR léxico (Capacitor Nativo o Web Speech)
    if (this.isNative && this.nativePlugin) {
      try {
        await this.nativePlugin.start({
          language: 'es-PE',
          maxResults: 5,
          prompt: '¡Dilo fuerte y claro, amiguito!',
          partialResults: true,
          popup: false
        });
        this.nativePlugin.addListener('speechResults', (data) => {
          if (data && data.matches && data.matches.length > 0) {
            this.currentTranscript = data.matches[0];
            console.log('[SpeechService Native ASR]:', this.currentTranscript);
          }
        });
      } catch (err) {
        console.warn('[SpeechService] Error iniciando Capacitor ASR:', err);
      }
    } else if (this.webSpeechRec) {
      try {
        this.webSpeechRec.onresult = (evt) => {
          let str = '';
          for (let i = 0; i < evt.results.length; i++) {
            if (evt.results[i] && evt.results[i][0]) {
              str += evt.results[i][0].transcript + ' ';
            }
          }
          this.currentTranscript = str.trim();
          console.log('[SpeechService WebSpeech ASR]:', this.currentTranscript);
        };

        this.webSpeechRec.onerror = (e) => {
          console.warn('[SpeechService WebSpeech error]:', e.error);
        };

        this.webSpeechRec.start();
      } catch (e) {
        // Ignorar re-arranque si ya estaba en curso
      }
    }
  }

  /* Fallback simulado para entornos sin hardware de micrófono */
  startListeningSimulated() {
    this.isListening = true;
    this.vadData = {
      startTime: performance.now(),
      speechStartTime: performance.now(),
      speechEndTime: performance.now() + 850,
      phonatoryDurationMs: 850,
      peakRms: 0.08,
      rmsSamples: [0.04, 0.08, 0.06],
      hasAcousticEffort: true
    };
  }

  /* Detener captura y consolidar evaluación fónica */
  async stopListening(targetWord = '', attemptCount = 1, contextHint = {}) {
    this.isListening = false;

    if (this.vadInterval) {
      clearInterval(this.vadInterval);
      this.vadInterval = null;
    }

    // Calcular duración de fonación activa en ms (KPI-10 APED)
    if (this.vadData.speechStartTime > 0 && this.vadData.speechEndTime > 0) {
      this.vadData.phonatoryDurationMs = Math.round(this.vadData.speechEndTime - this.vadData.speechStartTime);
    } else if (this.vadData.startTime > 0 && this.vadData.hasAcousticEffort) {
      this.vadData.phonatoryDurationMs = Math.round(performance.now() - this.vadData.startTime);
    } else {
      this.vadData.phonatoryDurationMs = 0;
    }

    // Detener stream solo si no es compartido con AudioEngine (para no cortar MediaRecorder)
    if (!this.isSharedStream && this.activeStream) {
      this.activeStream.getTracks().forEach(t => t.stop());
      this.activeStream = null;
    }

    // Detener motores de reconocimiento
    if (this.isNative && this.nativePlugin) {
      try {
        await this.nativePlugin.stop();
      } catch (e) {}
    } else if (this.webSpeechRec) {
      try {
        this.webSpeechRec.stop();
      } catch (e) {}
    }

    // Breve pausa para permitir que aterrice el último paquete del Web Speech API
    await new Promise(r => setTimeout(r, 120));

    if (targetWord) {
      return this.evaluateSpeechPediatric(targetWord, attemptCount, contextHint);
    }
    return null;
  }

  /* Normalización robusta para comparación fonoaudiológica (ignora tildes, signos y emojis) */
  normalizeSpeechText(text) {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Elimina acentos/tildes (ó -> o, etc.)
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '') // Emojis
      .replace(/[^a-z0-9\sñ]/g, ' ') // Preserva solo letras, números, ñ y espacios
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* Evaluación de Inteligibilidad con Tolerancia Fonética Pediátrica Calibrada (Strömbergsson et al., 2026) */
  evaluateSpeechPediatric(targetWord, attemptCount = 1, contextHint = {}) {
    // 1. Extraer universo de palabras aceptables para el ejercicio
    let targets = [];
    if (Array.isArray(contextHint.acceptableTargets) && contextHint.acceptableTargets.length > 0) {
      targets = contextHint.acceptableTargets;
    } else if (targetWord) {
      targets = [targetWord];
    }

    // Filtrar targets para que solo contengan palabras completas (longitud >= 3 letras)
    // para evitar que fonemas aislados de 1 letra (ej: 'l', 'r') o sílabas cortas generen falsos positivos
    const normalizedTargets = targets
      .map(w => this.normalizeSpeechText(w))
      .filter(w => w.length >= 3);

    if (normalizedTargets.length === 0 && targetWord) {
      normalizedTargets.push(this.normalizeSpeechText(targetWord));
    }

    const cleanRec = this.normalizeSpeechText(this.currentTranscript);
    console.log('[SpeechService Eval] Targets:', normalizedTargets, '| Rec:', cleanRec, '| VAD:', this.vadData);

    let isLexicalMatch = false;
    let bestProximity = 0;
    let matchedTarget = normalizedTargets[0] || '';

    // 2. Evaluación de transcripción ASR si se reconoció voz
    if (cleanRec && cleanRec.length > 0) {
      const recTokens = cleanRec.split(' ').filter(t => t.length > 0);

      for (const target of normalizedTargets) {
        if (!target) continue;

        // A. Coincidencia idéntica completa
        if (cleanRec === target) {
          isLexicalMatch = true;
          bestProximity = 1.0;
          matchedTarget = target;
          break;
        }

        // B. Coincidencia de palabra completa contenida en la locución (con límites de palabra)
        // Ejemplo: usuario dice "la luna" o "un raton" y el target es "luna" o "raton"
        const boundaryRegex = new RegExp(`(^|\\s)${target}(\\s|$)`, 'i');
        if (boundaryRegex.test(cleanRec)) {
          isLexicalMatch = true;
          bestProximity = 1.0;
          matchedTarget = target;
          break;
        }

        // C. Coincidencia token a token por similitud fonética Levenshtein (tolerancia para dislalias funcionales)
        // Umbral estricto calibrado: >= 0.70 (permite 1 sustitución fonética típica ej: "nuna" por "luna",
        // pero rechaza tajantemente palabras no relacionadas como "hola" [0.25] o "caracol" [0.14])
        for (const token of recTokens) {
          if (token === target) {
            isLexicalMatch = true;
            bestProximity = 1.0;
            matchedTarget = target;
            break;
          }

          if (Math.abs(token.length - target.length) <= 2) {
            const sim = this.calculateSimilarity(token, target);
            if (sim > bestProximity) {
              bestProximity = sim;
              matchedTarget = target;
            }
          }
        }

        if (isLexicalMatch) break;

        // D. Similitud global contra target si la transcripción completa es una sola emisión
        if (recTokens.length === 1 && Math.abs(cleanRec.length - target.length) <= 2) {
          const globalSim = this.calculateSimilarity(cleanRec, target);
          if (globalSim > bestProximity) {
            bestProximity = globalSim;
            matchedTarget = target;
          }
        }
      }

      // Umbral fonoaudiológico calibrado (Strömbergsson et al., 2026): >= 0.70
      if (bestProximity >= 0.70) {
        isLexicalMatch = true;
      }
    }

    // 3. Si hubo acierto léxico o aproximación fonética válida
    if (isLexicalMatch) {
      return {
        verdict: 'APPROVED',
        transcript: this.currentTranscript || matchedTarget,
        confidence: Math.max(0.88, bestProximity),
        acousticData: this.vadData,
        message: '¡Excelente pronunciación! ¡Lo hiciste genial!'
      };
    }

    // 4. Regla DDA: Intervención mandatoria tras 3er intento no concordante (RN-DDA-001)
    if (attemptCount >= 3) {
      return {
        verdict: 'DDA_INTERVENTION',
        transcript: this.currentTranscript,
        confidence: 0.60,
        acousticData: this.vadData,
        message: '¡Buen esfuerzo! Vamos a practicar con la praxia bucofacial.'
      };
    }

    // 5. Si el ASR transcribió una palabra CONCRETA pero fue INCORRECTA (ej: dijo "caracol" u "hola" en vez de "luna"):
    // BAJO NINGUNA CIRCUNSTANCIA SE APRUEBA. Debe solicitar reintento pedagógico no punitivo.
    if (cleanRec && cleanRec.length > 0) {
      return {
        verdict: 'RETRY_GENTLE',
        transcript: this.currentTranscript,
        confidence: 0.40,
        acousticData: this.vadData,
        message: '¡Buen intento! Escuchemos bien la palabra y vamos a intentarlo otra vez.'
      };
    }

    // 6. Caso de contingencia acústica (ASR en silencio / sin transcripción por falta de internet o habla atípica):
    // Solo aplica cuando cleanRec está VACÍO (el ASR no devolvió texto alguno)
    const hasPhoneticEffort = this.vadData.hasAcousticEffort &&
      this.vadData.peakRms >= 0.032 &&
      this.vadData.phonatoryDurationMs >= 380;

    if (hasPhoneticEffort) {
      // En intento 2, si el niño insistió vocalizando con energía pero el ASR en la nube no lo decodificó,
      // se aprueba para evitar fatiga/frustración (RN-GAM-001)
      if (attemptCount >= 2 && (this.vadData.phonatoryDurationMs >= 500 || this.vadData.peakRms >= 0.05)) {
        return {
          verdict: 'APPROVED',
          transcript: normalizedTargets[0] || targetWord,
          confidence: 0.85,
          acousticData: this.vadData,
          message: '¡Muy bien intentado con voz fuerte!'
        };
      }
    }

    // 7. Reintento suave por defecto (silencio, voz demasiado baja o palabra no concordante)
    return {
      verdict: 'RETRY_GENTLE',
      transcript: this.currentTranscript,
      confidence: 0.45,
      acousticData: this.vadData,
      message: '¡Casi lo tienes! Inténtalo una vez más con voz fuerte.'
    };
  }

  calculateSimilarity(s1, s2) {
    const str1 = this.normalizeSpeechText(s1);
    const str2 = this.normalizeSpeechText(s2);
    if (!str1 && !str2) return 1.0;
    if (!str1 || !str2) return 0.0;
    if (str1 === str2) return 1.0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;

    // Distancia de Levenshtein
    const costs = [];
    for (let i = 0; i <= longer.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= shorter.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[shorter.length] = lastValue;
    }
    return (longerLength - costs[shorter.length]) / parseFloat(longerLength);
  }
}

window.SpeechRecognitionService = SpeechRecognitionService;
