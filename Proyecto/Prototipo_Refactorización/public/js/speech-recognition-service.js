/* ==========================================================================
   SPEECH RECOGNITION SERVICE - MOTOR DUAL NATIVO / WEB AUDIO PEDIÁTRICO
   Cumple con: RF-ASR-001, RF-BIO-002, RN-FON-001, RN-DDA-001
   Sustento: Strömbergsson et al. (2026) (Tolerancia en ASR infantil),
             Hourcade (2008), Du et al. (2023)
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
      this.webSpeechRec.interimResults = false;
      this.webSpeechRec.maxAlternatives = 3;
    }

    // Estado interno
    this.isListening = false;
    this.currentTranscript = '';
    this.activeStream = null;
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
  async startListening(onAmplitudeCallback = null) {
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
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.activeStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioContext.createMediaStreamSource(this.activeStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      source.connect(this.analyser);

      const buffer = new Uint8Array(this.analyser.frequencyBinCount);
      const RMS_THRESHOLD = 0.045; // Umbral de energía de voz infantil

      this.vadInterval = setInterval(() => {
        if (!this.isListening) return;
        this.analyser.getByteTimeDomainData(buffer);

        // Calcular RMS
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

        // Detección de esfuerzo fonatorio sostenido
        if (rms >= RMS_THRESHOLD) {
          const now = performance.now();
          if (this.vadData.speechStartTime === 0) {
            this.vadData.speechStartTime = now;
          }
          this.vadData.speechEndTime = now;
          this.vadData.hasAcousticEffort = true;
        }
      }, 50);

    } catch (err) {
      console.warn('[SpeechService] No se pudo inicializar VAD Web Audio:', err);
    }

    // 3. Iniciar ASR léxico (Nativo o Web Speech)
    if (this.isNative && this.nativePlugin) {
      try {
        await this.nativePlugin.start({
          language: 'es-PE',
          maxResults: 3,
          prompt: '¡Dilo fuerte y claro, amiguito!',
          partialResults: false,
          popup: false
        });
        this.nativePlugin.addListener('speechResults', (data) => {
          if (data && data.matches && data.matches.length > 0) {
            this.currentTranscript = data.matches[0];
          }
        });
      } catch (err) {
        console.warn('[SpeechService] Fallback de Capacitor ASR:', err);
      }
    } else if (this.webSpeechRec) {
      try {
        this.webSpeechRec.onresult = (evt) => {
          if (evt.results && evt.results[0]) {
            this.currentTranscript = evt.results[0][0].transcript;
          }
        };
        this.webSpeechRec.onerror = (e) => {
          console.log('[SpeechService WebSpeech error]:', e.error);
        };
        this.webSpeechRec.start();
      } catch (e) {
        // Ignorar re-arranques simultáneos
      }
    }
  }

  /* Detener captura y consolidar evaluación fónica */
  async stopListening(targetWord = '', attemptCount = 1) {
    this.isListening = false;

    if (this.vadInterval) {
      clearInterval(this.vadInterval);
      this.vadInterval = null;
    }

    // Calcular duración de fonación activa en ms (KPI-10)
    if (this.vadData.speechStartTime > 0 && this.vadData.speechEndTime > 0) {
      this.vadData.phonatoryDurationMs = Math.round(this.vadData.speechEndTime - this.vadData.speechStartTime);
    } else {
      this.vadData.phonatoryDurationMs = 0;
    }

    // Detener stream de micrófono
    if (this.activeStream) {
      this.activeStream.getTracks().forEach(t => t.stop());
      this.activeStream = null;
    }

    // Detener motor de voz
    if (this.isNative && this.nativePlugin) {
      try {
        await this.nativePlugin.stop();
      } catch (e) {}
    } else if (this.webSpeechRec) {
      try {
        this.webSpeechRec.stop();
      } catch (e) {}
    }

    // Esperar un momento si el transcript está llegando
    await new Promise(r => setTimeout(r, 180));

    return this.evaluateSpeechPediatric(targetWord, attemptCount);
  }

  /* Evaluación de Inteligibilidad con Tolerancia Fonética Pediátrica */
  evaluateSpeechPediatric(targetWord, attemptCount) {
    const cleanTarget = (targetWord || '').toLowerCase().trim();
    const cleanRec = (this.currentTranscript || '').toLowerCase().trim();

    // 1. Similitud léxica exacta o contenida
    let isLexicalMatch = false;
    let phoneticProximity = 0;

    if (cleanRec) {
      if (cleanRec === cleanTarget || cleanRec.includes(cleanTarget) || cleanTarget.includes(cleanRec)) {
        isLexicalMatch = true;
        phoneticProximity = 1.0;
      } else {
        // Distancia fonética de Levenshtein simplificada
        phoneticProximity = this.calculateSimilarity(cleanTarget, cleanRec);
        if (phoneticProximity >= 0.70) {
          isLexicalMatch = true;
        }
      }
    }

    // 2. Si la palabra coincide por voz
    if (isLexicalMatch) {
      return {
        verdict: 'APPROVED',
        transcript: cleanRec,
        confidence: Math.max(0.85, phoneticProximity),
        acousticData: this.vadData,
        message: '¡Excelente pronunciación!'
      };
    }

    // 3. Regla DDA: Intervención mandatoria tras 3er intento
    if (attemptCount >= 3) {
      return {
        verdict: 'DDA_INTERVENTION',
        transcript: cleanRec,
        confidence: 0.60,
        acousticData: this.vadData,
        message: '¡Buen esfuerzo! Vamos a practicar con la praxia.'
      };
    }

    // 4. Si hubo esfuerzo acústico notable (fonación >= 600 ms o buen volumen)
    // Se aprueba de manera probabilística/estimulante o se invita a reintentar
    if (this.vadData.hasAcousticEffort && this.vadData.phonatoryDurationMs >= 500) {
      // Si el esfuerzo fonatorio fue genuino, dar 70% de probabilidad de aprobación pedagógica
      if (Math.random() < 0.70) {
        return {
          verdict: 'APPROVED',
          transcript: cleanRec || cleanTarget,
          confidence: 0.88,
          acousticData: this.vadData,
          message: '¡Bien dicho con fuerza!'
        };
      }
    }

    // Reintento suave por defecto
    return {
      verdict: 'RETRY_GENTLE',
      transcript: cleanRec,
      confidence: 0.45,
      acousticData: this.vadData,
      message: '¡Casi lo tienes! Inténtalo una vez más.'
    };
  }

  calculateSimilarity(s1, s2) {
    let longer = s1.length > s2.length ? s1 : s2;
    let shorter = s1.length > s2.length ? s2 : s1;
    let longerLength = longer.length;
    if (longerLength === 0) return 1.0;
    
    // Levenshtein distance
    let costs = [];
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

