/* ==========================================================================
   APP MASTER ORCHESTRATOR - PROTOTIPO FONO-LÚDICO PEDIÁTRICO
   Orquesta CUS-01 a CUS-05, DDA adaptativo, tokens WCAG 2.2 AA y Modo CVI
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Inicialización de subsistemas
  const audioEngine = new PhonoAudioEngine();
  window.audioEngine = audioEngine;
  const confetti = new ConfettiEngine('confettiCanvas');
  const praxiaCanvas = new PraxiaCanvasEngine('praxiaCanvas');
  const telemetry = new TelemetryPortalEngine();
  const telemetryEval = new TelemetryEvalEngine();
  window.telemetryEval = telemetryEval;
  telemetryEval.attachHeaderLogoTrigger(document.getElementById('headerAppLogo'));

  // Inicialización del Motor de Avatar Vectorial Ava (CUS-05)
  const avaEngine = new AvaVectorAvatarEngine();
  window.avaEngine = avaEngine;

  // Recuperar estrellas acumuladas persistidas (25 estrellas iniciales en perfil nuevo)
  let initialEffortStars = 25;
  try {
    const savedStars = localStorage.getItem('bosque_effort_stars');
    if (savedStars !== null && !Number.isNaN(parseInt(savedStars, 10))) {
      initialEffortStars = Math.max(0, parseInt(savedStars, 10));
    }
  } catch (e) {}

  // Estado global de la aplicación
  const state = {
    currentScreen: 'screen-menu',
    currentActivity: 'trabalenguas', // 'trabalenguas', 'rimas', 'adivinanzas', 'carrera', 'bingo'
    activityIndex: 0,
    effortStars: initialEffortStars,
    consecutiveFailures: 0,
    isRecording: false,
    activePhoneme: 'r',
    theme: 'normal',
    cviMode: false,
    soundEnabled: true,
    lastTouchTime: 0,
    activeStoreCategory: 'all'
  };

  // Referencias al DOM
  const elements = {
    // Header & Widgets
    starsCounter: document.getElementById('starsCounter'),
    headerScreenTag: document.getElementById('headerScreenTag'),
    btnBackMenu: document.getElementById('btnBackMenu'),
    btnSoundToggle: document.getElementById('btnSoundToggle'),
    btnHeaderEvalLink: document.getElementById('btnHeaderEvalLink'),
    btnParentalGate: document.getElementById('btnParentalGate'),
    dosingFill: document.getElementById('dosingFill'),
    dosingLabel: document.getElementById('dosingLabel'),

    // Pantallas
    screens: document.querySelectorAll('.screen-view'),
    screenMenu: document.getElementById('screen-menu'),
    screenExercise: document.getElementById('screen-exercise'),
    screenPairs: document.getElementById('screen-pairs'),
    screenAvatar: document.getElementById('screen-avatar'),
    screenAdult: document.getElementById('screen-adult'),

    // Menú Principal Cards
    wagonLocomotive: document.getElementById('wagon-locomotive-engine'),
    wagonTrabalenguas: document.getElementById('wagon-trabalenguas'),
    wagonRimas: document.getElementById('wagon-rimas'),
    wagonAdivinanzas: document.getElementById('wagon-adivinanzas'),
    wagonCarrera: document.getElementById('wagon-carrera'),
    wagonBingo: document.getElementById('wagon-bingo'),
    wagonPares: document.getElementById('wagon-pares'),
    btnOpenPairs: document.getElementById('wagon-pares') || document.getElementById('btnOpenPairs'),
    btnOpenAvatar: document.getElementById('btnOpenAvatar'),

    // Ejercicio CUS-01 Elements
    exerciseWord: document.getElementById('exerciseWord'),
    exercisePhoneme: document.getElementById('exercisePhoneme'),
    exerciseIcon: document.getElementById('exerciseIcon'),
    exercisePhrase: document.getElementById('exercisePhrase'),
    syllableStrip: document.getElementById('syllableStrip'),
    avatarBalloon: document.getElementById('avatarBalloon'),
    btnMic: document.getElementById('btnMic'),
    micWave1: document.querySelector('.mic-wave-ring-1'),
    micWave2: document.querySelector('.mic-wave-ring-2'),
    micCaption: document.getElementById('micCaption'),
    btnSelfPlayback: document.getElementById('btnSelfPlayback'),
    btnComparative: document.getElementById('btnComparative'),
    btnOpenMiniPraxia: document.getElementById('btnOpenMiniPraxia'),
    feedbackBadge: document.getElementById('feedbackBadge'),

    // Pares Mínimos CUS-02 Elements
    pairQuestionText: document.getElementById('pairQuestionText'),
    pairCardCorrect: document.getElementById('pairCardCorrect'),
    pairCardFoil: document.getElementById('pairCardFoil'),
    pairWordCorrect: document.getElementById('pairWordCorrect'),
    pairWordFoil: document.getElementById('pairWordFoil'),
    pairIconCorrect: document.getElementById('pairIconCorrect'),
    pairIconFoil: document.getElementById('pairIconFoil'),
    pairCueCorrect: document.getElementById('pairCueCorrect'),
    pairCueFoil: document.getElementById('pairCueFoil'),

    // Cueva del Avatar CUS-05 Elements
    avatarCaveSpeech: document.getElementById('avatarCaveSpeech'),
    storeItemsGrid: document.getElementById('storeItemsGrid'),

    // Carrera de Fonemas Elements (RF-LUD-004)
    screenCarrera: document.getElementById('screen-carrera'),
    riverStonesContainer: document.getElementById('riverStonesContainer'),
    carreraStepBadge: document.getElementById('carreraStepBadge'),
    carreraStationBadge: document.getElementById('carreraStationBadge'),
    carreraStationIcon: document.getElementById('carreraStationIcon'),
    carreraStationWord: document.getElementById('carreraStationWord'),
    carreraStationInstruction: document.getElementById('carreraStationInstruction'),
    btnCarreraMic: document.getElementById('btnCarreraMic'),
    carreraMicCaption: document.getElementById('carreraMicCaption'),
    btnCarreraListenModel: document.getElementById('btnCarreraListenModel'),

    // Bingo Fonológico Elements (RF-LUD-005)
    screenBingo: document.getElementById('screen-bingo'),
    bingoGridContainer: document.getElementById('bingoGridContainer'),
    bingoCallerInstruction: document.getElementById('bingoCallerInstruction'),
    btnBingoRepeatCaller: document.getElementById('btnBingoRepeatCaller'),

    // Modales
    praxiaModal: document.getElementById('praxiaModal'),
    btnClosePraxia: document.getElementById('btnClosePraxia'),
    btnClosePraxiaBottom: document.getElementById('btnClosePraxiaBottom'),
    praxiaTitle: document.getElementById('praxiaTitle'),
    praxiaDesc: document.getElementById('praxiaDesc'),
    btnPraxiaPlayPause: document.getElementById('btnPraxiaPlayPause'),
    praxiaPhonemeSelect: document.getElementById('praxiaPhonemeSelect'),
    btnNarratePraxia: document.getElementById('btnNarratePraxia'),
    praxiaNarrationBox: document.getElementById('praxiaNarrationBox'),

    mathgateModal: document.getElementById('mathgateModal'),
    mathgateChallengeText: document.getElementById('mathgateChallengeText'),
    mathgateOptionsGrid: document.getElementById('mathgateOptionsGrid'),
    mathgateOptionBtns: document.querySelectorAll('.mathgate-option-btn'),
    btnMathgateCancel: document.getElementById('btnMathgateCancel'),

    // Dashboard Adulto Tabs
    dashTabs: document.querySelectorAll('.dash-tab-btn'),
    dashContents: document.querySelectorAll('.dashboard-tab-content'),
    audioVaultBody: document.getElementById('audioVaultBody'),
    chkCviAdultToggle: document.getElementById('chkCviAdultToggle'),
    btnSaveAdultConfig: document.getElementById('btnSaveAdultConfig'),
    btnExitAdultPortal: document.getElementById('btnExitAdultPortal')
  };

  // Montaje del Avatar Vectorial Dinámico Ava en todos los contextos (CUS-05 / A.10 - H10)
  avaEngine.mount('#headerAppLogo', { size: 40 });
  avaEngine.mount('#menuAvaAvatar', { size: 70 });
  avaEngine.mount('#locomotiveAvaAvatar', { size: 64 });
  avaEngine.mount('#exerciseAvaAvatar', { size: 122, onTap: () => window.repeatCurrentExercisePrompt && window.repeatCurrentExercisePrompt() });
  avaEngine.mount('#pairsAvaAvatar', { size: 54, onTap: () => window.repeatCurrentPairsPrompt && window.repeatCurrentPairsPrompt() });
  avaEngine.mount('#bingoAvaAvatar', { size: 58, onTap: () => window.repeatCurrentBingoPrompt && window.repeatCurrentBingoPrompt() });
  avaEngine.mount('#caveAvaPedestal', { size: 152 });
  avaEngine.mount('#praxiaAvaAvatar', { size: 52, onTap: () => window.playCurrentPraxiaNarration && window.playCurrentPraxiaNarration() });

  /* --- CONTROL DE DEBOUNCE TÁCTIL (< 80ms) Y GESTIÓN DE PANTALLAS --- */
  function canTouch() {
    audioEngine.resumeAudioContext();
    const now = Date.now();
    if (now - state.lastTouchTime < 80) {
      return false; // Ignora rebote táctil involuntario infantil
    }
    state.lastTouchTime = now;
    return true;
  }

  function showScreen(screenId, tagText = "") {
    // REGLA CLÍNICA UNIVERSAL: Al cambiar de pantalla o abandonar un espacio, detener de inmediato cualquier locución de Ava
    audioEngine.stopSpeaking();

    if (screenId !== 'screen-avatar') {
      avaEngine.clearPedestalPreview();
      const previewBadge = document.getElementById('cavePreviewBadge');
      if (previewBadge) previewBadge.hidden = true;
    }

    elements.screens.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      state.currentScreen = screenId;
    }
    elements.headerScreenTag.textContent = tagText;

    if (screenId === 'screen-menu') {
      elements.btnBackMenu.style.visibility = 'hidden';
    } else {
      elements.btnBackMenu.style.visibility = 'visible';
    }

    if (window.telemetryEval && window.telemetryEval.isActive) {
      window.telemetryEval.startTask(screenId, tagText || screenId);
    }
  }
  window.showScreen = showScreen;

  function updateStars(amount = 0) {
    state.effortStars = Math.max(0, state.effortStars + amount);
    if (elements.starsCounter) elements.starsCounter.textContent = state.effortStars;
    const shortcutStars = document.getElementById('starsShortcutCounter');
    if (shortcutStars) shortcutStars.textContent = state.effortStars;
    const caveStars = document.getElementById('caveStarsCount');
    if (caveStars) caveStars.textContent = state.effortStars;

    try {
      localStorage.setItem('bosque_effort_stars', String(state.effortStars));
    } catch (e) {}

    if (amount > 0) {
      audioEngine.playChime();
    }
  }

  updateStars(0);

  /* --- PANTALLA CUS-01: CARGA DE EJERCICIOS FONO-LÚDICOS --- */
  function loadExercise(activityType, index = 0) {
    state.currentActivity = activityType;
    state.activityIndex = index;
    state.consecutiveFailures = 0; // Reinicia contador DDA
    elements.feedbackBadge.className = 'feedback-status-badge';
    elements.feedbackBadge.textContent = '';
    elements.btnSelfPlayback.disabled = true;

    if (activityType === 'trabalenguas') {
      const data = SpeechGamesData.TRABALENGUAS_DATA[index % SpeechGamesData.TRABALENGUAS_DATA.length];
      state.activePhoneme = data.targetPhoneme;
      elements.exerciseWord.textContent = data.word;
      elements.exercisePhoneme.textContent = `Sonido ${data.targetPhoneme.toUpperCase()}`;
      elements.exerciseIcon.textContent = data.icon;
      elements.exercisePhrase.textContent = data.phrase;
      elements.avatarBalloon.textContent = `¡Vamos! Repite conmigo: "${data.word}"`;

      // Renderiza sílabas rítmicas
      elements.syllableStrip.innerHTML = '';
      data.rhythmSyllables.forEach((syl, i) => {
        const chip = document.createElement('div');
        chip.className = 'syllable-chip';
        chip.textContent = syl;
        chip.id = `syl-${i}`;
        elements.syllableStrip.appendChild(chip);
      });

      showScreen('screen-exercise', 'Trabalenguas Fonoarticulatorio');
      audioEngine.speak(`Vamos a jugar con el trabalenguas de la palabra ${data.word}. Toca el botón y di la palabra.`);

    } else if (activityType === 'rimas') {
      const data = SpeechGamesData.RIMAS_DATA[index % SpeechGamesData.RIMAS_DATA.length];
      state.activePhoneme = 'r';
      elements.exerciseWord.textContent = data.baseWord;
      elements.exercisePhoneme.textContent = `Rima: ${data.rhymeEnding}`;
      elements.exerciseIcon.textContent = data.baseIcon;
      elements.exercisePhrase.textContent = `¿Qué rima con ${data.baseWord}? Encuentra la palabra:`;
      elements.avatarBalloon.textContent = `¡Rima con ${data.baseWord}! ¿Será ${data.options[0].word}?`;

      elements.syllableStrip.innerHTML = '';
      data.options.forEach(opt => {
        const chip = document.createElement('div');
        chip.className = 'syllable-chip';
        chip.textContent = `${opt.icon} ${opt.word}`;
        chip.style.cursor = 'pointer';
        chip.onclick = () => {
          if (opt.correct) {
            audioEngine.playSuccessFanfare();
            confetti.launch(40);
            updateStars(2);
            audioEngine.speak(data.fullRhyme);
            elements.avatarBalloon.textContent = data.fullRhyme;
          } else {
            audioEngine.playGentleEncouragement();
            audioEngine.speak(`Casi casi, ¡intenta otra palabra que suene como ${data.baseWord}!`);
          }
        };
        elements.syllableStrip.appendChild(chip);
      });

      showScreen('screen-exercise', 'Rimas Interactivas');
      audioEngine.speak(`¿Qué palabra rima con ${data.baseWord}?`);

    } else if (activityType === 'adivinanzas') {
      const data = SpeechGamesData.ADIVINANZAS_DATA[index % SpeechGamesData.ADIVINANZAS_DATA.length];
      state.activePhoneme = data.phoneme;
      elements.exerciseWord.textContent = "¿Quién soy?";
      elements.exercisePhoneme.textContent = data.clue;
      elements.exerciseIcon.textContent = "❓";
      elements.exercisePhrase.textContent = data.riddleText;
      elements.avatarBalloon.textContent = "¡Escucha mi acertijo y dime el nombre del animalito!";

      elements.syllableStrip.innerHTML = '';
      const clueBtn = document.createElement('div');
      clueBtn.className = 'syllable-chip';
      clueBtn.textContent = "💡 Toca aquí para ver una pista";
      clueBtn.onclick = () => {
        audioEngine.speak(`Pista especial: ${data.clue}`);
      };
      elements.syllableStrip.appendChild(clueBtn);

      showScreen('screen-exercise', 'Adivinanza Guiada por Voz');
      audioEngine.speak(data.riddleText);
    }
  }

  // Repetición contextual de consigna por voz guiada por Ava (A.10 - H10)
  function repeatCurrentExercisePrompt() {
    audioEngine.playClick();
    if (state.currentActivity === 'trabalenguas') {
      const data = SpeechGamesData.TRABALENGUAS_DATA[state.activityIndex % SpeechGamesData.TRABALENGUAS_DATA.length];
      if (data) {
        audioEngine.speak(`Vamos a jugar con el trabalenguas de la palabra ${data.word}. Toca el botón y di la palabra.`);
      }
    } else if (state.currentActivity === 'rimas') {
      const data = SpeechGamesData.RIMAS_DATA[state.activityIndex % SpeechGamesData.RIMAS_DATA.length];
      if (data) {
        audioEngine.speak(`¿Qué palabra rima con ${data.baseWord}?`);
      }
    } else if (state.currentActivity === 'adivinanzas') {
      const data = SpeechGamesData.ADIVINANZAS_DATA[state.activityIndex % SpeechGamesData.ADIVINANZAS_DATA.length];
      if (data) {
        audioEngine.speak(data.riddleText);
      }
    }
  }
  window.repeatCurrentExercisePrompt = repeatCurrentExercisePrompt;

  if (elements.avatarBalloon) {
    elements.avatarBalloon.addEventListener('click', repeatCurrentExercisePrompt);
    elements.avatarBalloon.style.cursor = 'pointer';
    elements.avatarBalloon.title = 'Toca para escuchar a Ava otra vez';
  }

  /* --- CUS-01: CAPTURA DE MICRÓFONO Y CICLO ASR / DDA --- */
  elements.btnMic.addEventListener('click', async () => {
    if (!canTouch()) return;

    // REGLA CLÍNICA: Detener cualquier audio o locución de Ava para que no interfiera con el habla del niño
    audioEngine.stopSpeaking();

    if (!state.isRecording) {
      // INICIAR GRABACIÓN
      state.isRecording = true;
      window.dispatchEvent(new CustomEvent('ava-mic-start'));
      elements.btnMic.classList.add('state-recording');
      elements.micCaption.textContent = "¡Te escucho! Habla ahora...";
      audioEngine.playClick();

      // Sincronización visual rítmica de sílabas
      const chips = elements.syllableStrip.querySelectorAll('.syllable-chip');
      chips.forEach((c, idx) => {
        setTimeout(() => {
          if (state.isRecording) {
            chips.forEach(ch => ch.classList.remove('active-highlight'));
            c.classList.add('active-highlight');
          }
        }, idx * 400);
      });

      let avclLoggedForTurn = false;
      await audioEngine.startRecording((amplitude) => {
        const tAmp = performance.now();
        // Ondas reactivas en tiempo real
        const scaleVal = 1 + amplitude * 0.45;
        elements.micWave1.style.transform = `translate(-50%, -50%) scale(${scaleVal})`;
        elements.micWave1.style.opacity = Math.min(0.9, amplitude * 1.5);
        if (!avclLoggedForTurn && amplitude > 0.04 && window.telemetryEval && window.telemetryEval.isActive) {
          avclLoggedForTurn = true;
          requestAnimationFrame(() => {
            window.telemetryEval.recordAvclLatency(Math.max(42, performance.now() - tAmp + 65));
          });
        }
      });

      // Ventana de captura de 3 a 5 segundos (RF-BIO-002)
      setTimeout(() => {
        if (state.isRecording) {
          elements.btnMic.click(); // Detener automáticamente
        }
      }, 3500);

    } else {
      // DETENER GRABACIÓN Y EVALUAR
      state.isRecording = false;
      window.dispatchEvent(new CustomEvent('ava-mic-end'));
      elements.btnMic.classList.remove('state-recording');
      elements.btnMic.classList.add('state-processing');
      elements.micCaption.textContent = "Procesando...";

      let recorded = { blob: null, url: null };
      try {
        recorded = await audioEngine.stopRecording();
      } catch (err) {
        console.warn('[App] Error seguro capturado en stopRecording:', err);
      } finally {
        elements.btnMic.classList.remove('state-processing');
      }

      const { blob, url } = recorded || {};

      // 1. SELF-PLAYBACK CONTINGENTE (< 300 ms - Peña et al. 2024 / RNF-DES-001)
      elements.btnSelfPlayback.disabled = false;
      elements.micCaption.textContent = "¡Escúchate!";
      elements.avatarBalloon.textContent = "¡Escucha cómo sonó tu voz en el megáfono!";
      audioEngine.playSelfPlayback();

      // 2. EVALUACIÓN ASR Y MÓDULO DDA (Strömbergsson et al. 2025/2026 / RN-DDA-001)
      setTimeout(() => {
        state.consecutiveFailures++;
        let currentTargetWord = elements.exerciseWord ? elements.exerciseWord.textContent : '';
        let acceptableTargets = [currentTargetWord];

        if (state.currentActivity === 'adivinanzas') {
          const adivData = SpeechGamesData.ADIVINANZAS_DATA[state.activityIndex % SpeechGamesData.ADIVINANZAS_DATA.length];
          if (adivData && adivData.answerWord) {
            currentTargetWord = adivData.answerWord;
            acceptableTargets = [adivData.answerWord];
          }
        } else if (state.currentActivity === 'rimas') {
          const rimaData = SpeechGamesData.RIMAS_DATA[state.activityIndex % SpeechGamesData.RIMAS_DATA.length];
          if (rimaData) {
            const correctOpt = rimaData.options.find(o => o.correct);
            acceptableTargets = [rimaData.baseWord];
            if (correctOpt) acceptableTargets.push(correctOpt.word);
            currentTargetWord = correctOpt ? correctOpt.word : rimaData.baseWord;
          }
        } else if (state.currentActivity === 'trabalenguas') {
          const trabData = SpeechGamesData.TRABALENGUAS_DATA[state.activityIndex % SpeechGamesData.TRABALENGUAS_DATA.length];
          if (trabData) {
            currentTargetWord = trabData.word;
            acceptableTargets = [trabData.word];
          }
        }

        const evalContext = {
          context: state.currentActivity === 'trabalenguas' ? 'continuous' : 'isolated',
          phoneme: state.activePhoneme,
          activity: state.currentActivity,
          acceptableTargets: acceptableTargets
        };
        const evaluation = audioEngine.evaluateSpeech(currentTargetWord, state.consecutiveFailures, evalContext);

        if (evaluation.verdict === 'APPROVED') {
          // ESCENARIO 1: ACIERTO FONÉTICO
          state.consecutiveFailures = 0;
          audioEngine.playSuccessFanfare();
          confetti.launch(70);
          updateStars(3);
          window.dispatchEvent(new CustomEvent('ava-celebrate'));

          elements.feedbackBadge.className = 'feedback-status-badge status-approved active';
          elements.feedbackBadge.textContent = "⭐ ¡Fantástico! ¡Pronunciación aprobada!";
          elements.micCaption.textContent = "¡Lo lograste!";
          audioEngine.speak("¡Lo hiciste genial amiguito!", () => {
            // Avanza automáticamente al siguiente ejercicio
            setTimeout(() => {
              loadExercise(state.currentActivity, state.activityIndex + 1);
            }, 1200);
          });

          // Registra en bóveda de audio clínica
          telemetry.addRecordedSample(currentTargetWord, `/${state.activePhoneme}/`, "APROBADO", url, "tag-green");

        } else if (state.consecutiveFailures === 1) {
          // ==============================================================
          // ESCENARIO 2A: FALLO 1 - PISTA EMPÁTICA Y MODELADO AUDITIVO DE AVA
          // (Intento 1 No Logrado: Ava alienta con afecto y repite el modelado fónico con voz de estudio)
          // ==============================================================
          audioEngine.playGentleEncouragement();
          elements.feedbackBadge.className = 'feedback-status-badge status-retry active';
          elements.feedbackBadge.textContent = `💜 ¡Buen intento! (1/3) Escucha cómo suena la palabra.`;
          elements.micCaption.textContent = "Escuchando a Ava...";

          telemetry.addRecordedSample(currentTargetWord, `/${state.activePhoneme}/`, "REINTENTO (1)", url, "tag-yellow");

          // Mensaje en avatar
          elements.avatarBalloon.textContent = `¡Casi lo tienes! Escucha cómo lo digo: "${currentTargetWord}".`;

          // 1. Locución humana de estudio de Ava (reintento_suave_344.mp3):
          // "¡qué buen intento! escucha cómo lo decimos y vuelve a tocar el botón."
          audioEngine.speak("¡qué buen intento! escucha cómo lo decimos y vuelve a tocar el botón.", () => {
            // 2. Inmediatamente Ava modela la palabra estímulo con su clip de estudio 44.1 kHz (ej. "luna")
            audioEngine.speak(currentTargetWord, () => {
              elements.micCaption.textContent = "Toca para reintentar";
              elements.avatarBalloon.textContent = `¡Ahora dilo tú! Toca el botón y di "${currentTargetWord}".`;
            });
          });

        } else if (state.consecutiveFailures === 2) {
          // ==============================================================
          // ESCENARIO 2B: FALLO 2 - ANDAMIAJE VISUAL (CANVAS 2D DE PRAXIA)
          // (Intento 2 Consecutivo: Despliega la animación en pantalla con voz de estudio
          // y luego permite al niño volver a intentarlo para el Intento 3)
          // ==============================================================
          audioEngine.playGentleEncouragement();
          elements.feedbackBadge.className = 'feedback-status-badge status-retry active';
          elements.feedbackBadge.textContent = `👀 ¡Mira la animación! (2/3) Observa cómo movemos la lengua.`;
          elements.micCaption.textContent = "Observa la pantalla...";

          telemetry.addRecordedSample(currentTargetWord, `/${state.activePhoneme}/`, "ANDAMIAJE VISUAL (2)", url, "tag-yellow");

          elements.avatarBalloon.textContent = `¡Mira en la pantalla cómo movemos la boca para decir "${currentTargetWord}"!`;

          // Locución humana de estudio de Ava (dda_rescate.mp3):
          // "¡qué gran esfuerzo amigo! mira en la pantalla cómo colocamos la lengua para que sea más fácil."
          audioEngine.speak("¡qué gran esfuerzo amigo! mira en la pantalla cómo colocamos la lengua para que sea más fácil.", () => {
            // Abre el modal con el Canvas 2D de Praxia anatómica (narra praxia con voz de estudio)
            openPraxiaModal(state.activePhoneme, () => {
              // AL CERRAR LA ANIMACIÓN: PERMITIR AL NIÑO VOLVER A INTENTARLO (INTENTO 3)
              // (Mantiene state.consecutiveFailures = 2 para que el próximo intento sea evaluado)
              elements.feedbackBadge.className = 'feedback-status-badge status-retry active';
              elements.feedbackBadge.textContent = `🎯 ¡Ahora inténtalo tú! (2/3) Toca el botón para hablar.`;
              elements.micCaption.textContent = "Toca para hablar";
              elements.avatarBalloon.textContent = `¡Muy bien! Ahora que viste cómo se mueve la lengua, ¡dilo tú fuerte: "${currentTargetWord}"!`;
              // Ava refuerza con su voz de estudio grabada (aliento_1.mp3) y modela la palabra objetivo
              audioEngine.speak("¡excelente intento, diste lo mejor de ti! ¡dilo fuerte!", () => {
                audioEngine.speak(currentTargetWord);
              });
            }, "¡Listo! Quiero intentarlo ✨");
          });

        } else {
          // ==============================================================
          // ESCENARIO 3: FALLO 3 DE RESCATE - INTERVENCIÓN DDA Y AVANCE ASISTIDO
          // (Intento 3 de Rescate: Despliega Praxia DDA, otorga 1 estrella de persistencia y avanza)
          // ==============================================================
          audioEngine.playChime();
          updateStars(1); // Estrella por persistencia / esfuerzo GL-005
          elements.feedbackBadge.className = 'feedback-status-badge status-dda active';
          elements.feedbackBadge.textContent = "🌟 ¡Estrella por persistencia otorgada! Avanzamos juntos.";
          elements.micCaption.textContent = "¡Gran esfuerzo!";

          telemetry.addRecordedSample(currentTargetWord, `/${state.activePhoneme}/`, "DDA ASISTIDO", url, "tag-purple");

          // Despliega automáticamente la Praxia 2D y avanza asistido sin bloquear al menor con voz de estudio de Ava
          audioEngine.speak("¡qué gran esfuerzo amigo! mira en la pantalla cómo colocamos la lengua para que sea más fácil.", () => {
            openPraxiaModal(state.activePhoneme, () => {
              // Al cerrar praxia avanza asistido al siguiente ejercicio
              loadExercise(state.currentActivity, state.activityIndex + 1);
            }, "¡Siguiente vagón! 🚂");
          });
        }
      }, 1000);
    }
  });

  /* --- BOTÓN DE AUTOESCUCHA Y COMPARATIVA (RF-BIO-003, RF-BIO-004) --- */
  elements.btnSelfPlayback.addEventListener('click', () => {
    if (!canTouch()) return;
    audioEngine.playClick();
    audioEngine.playSelfPlayback();
  });

  elements.btnComparative.addEventListener('click', () => {
    if (!canTouch()) return;
    audioEngine.playClick();
    const modelWord = elements.exerciseWord.textContent;
    audioEngine.playComparative(modelWord);
  });

  /* --- PANTALLA CUS-02: PARES MÍNIMOS --- */
  let currentPairIndex = 0;

  function repeatCurrentPairsPrompt() {
    audioEngine.playClick();
    const pair = MinimalPairsData[currentPairIndex];
    if (pair && pair.question) {
      audioEngine.speak(pair.question);
    }
  }
  window.repeatCurrentPairsPrompt = repeatCurrentPairsPrompt;

  function loadMinimalPair(index) {
    currentPairIndex = index % MinimalPairsData.length;
    const pair = MinimalPairsData[currentPairIndex];
    elements.pairQuestionText.textContent = pair.question;

    elements.pairWordCorrect.textContent = pair.correctOption.word;
    elements.pairIconCorrect.textContent = pair.correctOption.icon;
    elements.pairCueCorrect.textContent = pair.correctOption.soundCue;

    elements.pairWordFoil.textContent = pair.foilOption.word;
    elements.pairIconFoil.textContent = pair.foilOption.icon;
    elements.pairCueFoil.textContent = pair.foilOption.soundCue;

    elements.pairCardCorrect.className = 'pair-card';
    elements.pairCardFoil.className = 'pair-card';

    showScreen('screen-pairs', 'Pares Mínimos y Praxias');
    audioEngine.speak(pair.question);
  }

  elements.pairCardCorrect.addEventListener('click', () => {
    if (!canTouch()) return;
    audioEngine.stopSpeaking();
    const pair = MinimalPairsData[currentPairIndex];
    elements.pairCardCorrect.classList.add('selected-correct');
    audioEngine.playSuccessFanfare();
    confetti.launch(50);
    updateStars(2);
    window.dispatchEvent(new CustomEvent('ava-celebrate'));

    audioEngine.speak(`¡Muy bien! ¡Es ${pair.correctOption.word}! Mira cómo se pronuncia:`, () => {
      openPraxiaModal(pair.correctOption.phonemeTarget, () => {
        loadMinimalPair(currentPairIndex + 1);
      });
    });
  });

  elements.pairCardFoil.addEventListener('click', () => {
    if (!canTouch()) return;
    audioEngine.stopSpeaking();
    const pair = MinimalPairsData[currentPairIndex];
    elements.pairCardFoil.classList.add('selected-comic');
    audioEngine.playGentleEncouragement();
    audioEngine.speak(pair.foilOption.comicFeedback);
  });

  /* --- PANTALLA: CAMINO DE FLORES FÓNICAS 2D (RF-LUD-004 - Vuelo de Ava en Perspectiva) --- */
  let carreraCurrentStep = 0;

  const MEADOW_FLOWERS = [
    { 
      x: 18, 
      y: 73, 
      scale: 1.60, 
      sizeClass: 'flower-depth-foreground', 
      name: "Flor Margarita", 
      petalColor: "#42A5F5", 
      centerColor: "#FFF59D"
    },
    { 
      x: 36, 
      y: 22.5, 
      scale: 1.05, 
      sizeClass: 'flower-depth-distant', 
      name: "Flor Girasol", 
      petalColor: "#FFCA28", 
      centerColor: "#E65100"
    },
    { 
      x: 53, 
      y: 73, 
      scale: 1.55, 
      sizeClass: 'flower-depth-foreground', 
      name: "Flor Campanilla", 
      petalColor: "#AB47BC", 
      centerColor: "#FFE082"
    },
    { 
      x: 69, 
      y: 28, 
      scale: 1.08, 
      sizeClass: 'flower-depth-distant', 
      name: "Flor Rosa", 
      petalColor: "#FF7043", 
      centerColor: "#FFF9C4"
    },
    { 
      x: 80, 
      y: 56, 
      scale: 1.28, 
      sizeClass: 'flower-depth-midground', 
      name: "Flor Orquídea", 
      petalColor: "#26A69A", 
      centerColor: "#FFD54F"
    }
  ];

  function loadCarreraGame(stepIndex = 0) {
    carreraCurrentStep = stepIndex % SpeechGamesData.CARRERA_DATA.length;
    const currentData = SpeechGamesData.CARRERA_DATA[carreraCurrentStep];

    elements.carreraStepBadge.textContent = `Flor ${currentData.step} de 5`;
    elements.carreraStationBadge.textContent = `Sinfón /${currentData.phoneme}/`;
    elements.carreraStationIcon.textContent = currentData.icon;
    elements.carreraStationWord.textContent = currentData.word;
    elements.carreraStationInstruction.textContent = `¡Di "${currentData.word}" para que Ava vuele a la flor!`;
    elements.carreraMicCaption.textContent = "Toca para hablar";
    elements.btnCarreraMic.classList.remove('state-recording');

    // Renderiza las 5 flores en coordenadas 2D con perspectiva y Ava en vuelo
    elements.riverStonesContainer.innerHTML = '';
    SpeechGamesData.CARRERA_DATA.forEach((s, idx) => {
      const flower = document.createElement('div');
      const isCompleted = idx < carreraCurrentStep;
      const isActive = idx === carreraCurrentStep;
      const flowerInfo = MEADOW_FLOWERS[idx] || MEADOW_FLOWERS[0];

      flower.className = `meadow-flower-item ${flowerInfo.sizeClass} ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`;
      flower.style.left = `${flowerInfo.x}%`;
      flower.style.top = `${flowerInfo.y}%`;
      flower.style.transform = `translate(-50%, -50%) scale(${flowerInfo.scale})`;

      flower.innerHTML = `
        <div class="flower-ground-shadow" aria-hidden="true"></div>
        <svg class="flower-svg-petals" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <!-- Hojas verdes al pie -->
          <ellipse cx="14" cy="38" rx="7" ry="3" fill="#4CAF50" transform="rotate(-25 14 38)"/>
          <ellipse cx="34" cy="38" rx="7" ry="3" fill="#4CAF50" transform="rotate(25 34 38)"/>
          <!-- Tallo central -->
          <path d="M24 24 L24 44" stroke="#2E7D32" stroke-width="3.2" stroke-linecap="round"/>
          <!-- Corona de pétalos radiantes -->
          <circle cx="24" cy="14" r="6" fill="${flowerInfo.petalColor}"/>
          <circle cx="24" cy="34" r="6" fill="${flowerInfo.petalColor}"/>
          <circle cx="14" cy="24" r="6" fill="${flowerInfo.petalColor}"/>
          <circle cx="34" cy="24" r="6" fill="${flowerInfo.petalColor}"/>
          <circle cx="17" cy="17" r="5.5" fill="${flowerInfo.petalColor}"/>
          <circle cx="31" cy="17" r="5.5" fill="${flowerInfo.petalColor}"/>
          <circle cx="17" cy="31" r="5.5" fill="${flowerInfo.petalColor}"/>
          <circle cx="31" cy="31" r="5.5" fill="${flowerInfo.petalColor}"/>
          <!-- Disco central de polen con brillo -->
          <circle cx="24" cy="24" r="8" fill="${flowerInfo.centerColor}" stroke="#F57F17" stroke-width="1.2"/>
          ${isCompleted ? '<circle cx="24" cy="24" r="4.5" fill="#FFA000"/><text x="20.5" y="27" font-size="8.5" fill="#FFFFFF" font-weight="900">✓</text>' : ''}
        </svg>
        ${isActive ? `
          <div class="ava-flying-bee" title="Ava volando sobre esta flor">
            <div class="ava-bee-avatar ava-container" style="width: 48px; height: 48px;">
              ${avaEngine.generateSvg({ size: 48, mood: 'happy' })}
            </div>
            <div class="pollen-dust-ring" aria-hidden="true"></div>
          </div>
        ` : ''}
        <div class="flower-tag-label">
          <span class="flower-phoneme-chip">${s.phoneme.toUpperCase()}</span>
          <span class="flower-name-text">${s.word}</span>
        </div>
      `;

      const stepNames = ['uno', 'dos', 'tres', 'cuatro', 'cinco'];
      const stepLabel = stepNames[s.step - 1] || s.step;
      flower.onclick = () => {
        audioEngine.speak(`Flor ${stepLabel}: ¡${s.word}! Escucha y repite: ${s.word}.`);
      };

      elements.riverStonesContainer.appendChild(flower);
    });

    showScreen('screen-carrera', 'Camino de Flores Fónicas');
    audioEngine.speak(`Estación ${currentData.step}: Pronuncia la palabra ${currentData.word} para que la abejita Ava vuele a la flor.`);
  }

  // Micrófono de la Carrera de Flores
  elements.btnCarreraMic.addEventListener('click', async () => {
    if (!canTouch()) return;
    const currentData = SpeechGamesData.CARRERA_DATA[carreraCurrentStep];

    // REGLA CLÍNICA: Detener cualquier audio o locución de Ava de inmediato
    audioEngine.stopSpeaking();

    if (!state.isRecording) {
      state.isRecording = true;
      elements.btnCarreraMic.classList.add('state-recording');
      elements.carreraMicCaption.textContent = "¡Te escucho! Di la palabra...";
      audioEngine.playClick();

      await audioEngine.startRecording();

      setTimeout(() => {
        if (state.isRecording) {
          elements.btnCarreraMic.click();
        }
      }, 3500);

    } else {
      state.isRecording = false;
      elements.btnCarreraMic.classList.remove('state-recording');
      elements.carreraMicCaption.textContent = "¡Volando!";
      await audioEngine.stopRecording();

      // Registrar emisión fónica en Micro-SCED (Bosch & Melgar Sinfones)
      audioEngine.evaluateSpeech(currentData.word, 1, {
        context: 'isolated',
        phoneme: currentData.phoneme,
        activity: 'carrera'
      });

      audioEngine.playSuccessFanfare();
      confetti.launch(50);
      updateStars(2);

      if (carreraCurrentStep < SpeechGamesData.CARRERA_DATA.length - 1) {
        audioEngine.speak(`¡Genial! ¡Ava voló a la siguiente flor y recolectó néctar!`, () => {
          setTimeout(() => {
            loadCarreraGame(carreraCurrentStep + 1);
          }, 800);
        });
      } else {
        // Meta alcanzada: Colmena Real
        confetti.launch(120);
        updateStars(5);
        audioEngine.speak("¡¡Bravo amigo!! ¡Volaste por todo el jardín y llenaste la Colmena Real con néctar!");
        elements.carreraStationInstruction.textContent = "🍯 ¡¡Meta alcanzada!! ¡La Colmena Real está llena de miel!";
        setTimeout(() => {
          showScreen('screen-menu', 'Bosque Sonoro Amigable');
        }, 3200);
      }
    }
  });

  elements.btnCarreraListenModel.addEventListener('click', () => {
    if (!canTouch()) return;
    const currentData = SpeechGamesData.CARRERA_DATA[carreraCurrentStep];
    audioEngine.speak(currentData.word);
  });

  /* --- PANTALLA: BINGO FONOLÓGICO VISUAL-AUDITIVO (RF-LUD-005 - Mora et al., 2024) --- */
  let bingoRoundIndex = 0;

  function repeatCurrentBingoPrompt() {
    audioEngine.playClick();
    const round = BINGO_ROUNDS[bingoRoundIndex];
    if (round && round.prompt) {
      audioEngine.speak(round.prompt);
    }
  }
  window.repeatCurrentBingoPrompt = repeatCurrentBingoPrompt;
  const BINGO_ROUNDS = [
    { targetSound: "s", targetWord: "Sol", prompt: "¡Encuentra y toca la tarjeta que empieza con el sonido de Sol! ☀️" },
    { targetSound: "l", targetWord: "Luna", prompt: "¡Ahora busca y toca la tarjeta que empieza con el sonido de Luna! 🌙" },
    { targetSound: "f", targetWord: "Fresa", prompt: "¡Toca la tarjeta que empieza con el sonido de Fresa! 🍓" }
  ];

  function loadBingoGame(roundIdx = 0) {
    bingoRoundIndex = roundIdx % BINGO_ROUNDS.length;
    const round = BINGO_ROUNDS[bingoRoundIndex];

    elements.bingoCallerInstruction.textContent = round.prompt;

    // Renderiza el cartón 2x2
    const bingoCards = [
      { id: "b-fresa", word: "Fresa", icon: "🍓", sound: "f" },
      { id: "b-gato", word: "Gato", icon: "🐱", sound: "g" },
      { id: "b-sol", word: "Sol", icon: "☀️", sound: "s" },
      { id: "b-luna", word: "Luna", icon: "🌙", sound: "l" }
    ];

    elements.bingoGridContainer.innerHTML = '';
    bingoCards.forEach(c => {
      const cardEl = document.createElement('article');
      cardEl.className = 'bingo-card-item';
      cardEl.id = c.id;
      cardEl.setAttribute('role', 'button');
      cardEl.setAttribute('tabindex', '0');

      cardEl.innerHTML = `
        <div class="bingo-card-icon">${c.icon}</div>
        <h3 class="bingo-card-word">${c.word}</h3>
        <p class="bingo-card-sound">Sonido ${c.sound.toUpperCase()}</p>
      `;

      cardEl.onclick = () => {
        if (!canTouch()) return;
        if (c.sound === round.targetSound) {
          // Acierto en Bingo
          cardEl.classList.add('stamped');
          audioEngine.playSuccessFanfare();
          confetti.launch(60);
          updateStars(2);
          window.dispatchEvent(new CustomEvent('ava-celebrate'));

          if (bingoRoundIndex < BINGO_ROUNDS.length - 1) {
            audioEngine.speak("¡Excelente! ¡Tiene el sonido pedido! Pasemos a la siguiente.", () => {
              setTimeout(() => {
                loadBingoGame(bingoRoundIndex + 1);
              }, 1200);
            });
          } else {
            // ¡BINGO COMPLETO!
            confetti.launch(120);
            updateStars(5);
            window.dispatchEvent(new CustomEvent('ava-celebrate'));
            elements.bingoCallerInstruction.textContent = "🎉 ¡Bingo! ¡Completaste todo el cartón!";
            audioEngine.speak("¡Bingo! ¡Qué gran oído tienes, completaste todo el cartón sonoro!");
            setTimeout(() => {
              showScreen('screen-menu', 'Bosque Sonoro Amigable');
            }, 3500);
          }
        } else {
          // Intento no concordante (aliento suave, no punitivo)
          audioEngine.playGentleEncouragement();
          audioEngine.speak("Casi casi amiguito, busca con atención la tarjeta que tiene el sonido pedido.");
        }
      };

      elements.bingoGridContainer.appendChild(cardEl);
    });

    showScreen('screen-bingo', 'Bingo Sonoro (Cartón 2x2)');
    audioEngine.speak(round.prompt);
  }

  elements.btnBingoRepeatCaller.addEventListener('click', () => {
    if (!canTouch()) return;
    const round = BINGO_ROUNDS[bingoRoundIndex];
    audioEngine.speak(round.prompt);
  });

  /* --- MODAL PRAXIA 2D BUCOFACIAL: TOTALMENTE NARRADO POR VOZ (SIN METÁFORAS CONFUSAS, SIN LA PALABRA FONEMA) --- */
  let praxiaCallbackOnClose = null;

  const SOUND_NARRATIONS = {
    'r': {
      title: '👅 ¿Cómo ponemos la lengua para la R?',
      spoken: '¡Hola amiguito! Para hacer este sonido, sube la punta de tu lengua arribita, justo detrás de tus dientes de arriba, y haz que cosquillee suave como en Pera. ¡Pruébalo conmigo!',
      display: '¡Sube la punta de tu lengua arribita, detrás de tus dientes de arriba, y hazla cosquillear como en Pera!'
    },
    'rr': {
      title: '👅 ¿Cómo ponemos la lengua para la RR?',
      spoken: '¡Vamos con fuerza! Apoya la punta de tu lengua arriba, detrás de tus dientes. Toma aire y sopla fuerte para que tu lengua vibre rápido como en Perro. ¡Qué bien suena!',
      display: '¡Apoya la punta de tu lengua arriba, detrás de los dientes, y sopla fuerte para que vibre como en Perro!'
    },
    's': {
      title: '👅 ¿Cómo ponemos la boca para la S?',
      spoken: '¡Escucha bien! Pon tu lengua abajo, detrás de tus dientes de abajo. Ahora sonríe y deja salir el aire suavecito como en Sol. ¡Excelente!',
      display: '¡Pon tu lengua abajo, detrás de tus dientes, sonríe y deja salir el aire suavecito como en Sol!'
    },
    'l': {
      title: '👅 ¿Cómo ponemos la lengua para la L?',
      spoken: '¡Mira qué fácil! Pega la punta de tu lengua arriba en el techo de tu boca, déjala quietita y canta suave como en Luna. ¡Lo hiciste genial!',
      display: '¡Pega la punta de tu lengua arriba en el techo de tu boca, déjala quietita y canta como en Luna!'
    },
    'k': {
      title: '👅 ¿Cómo ponemos la boca para la K?',
      spoken: '¡Atento amiguito! Abre tu boquita, sube la parte de atrás de tu lengua y suelta el aire de golpe como en Casa. ¡Inténtalo tú solo!',
      display: '¡Abre tu boquita, sube la parte de atrás de la lengua y suelta el aire de golpe como en Casa!'
    },
    'p': {
      title: '👅 ¿Cómo ponemos los labios para la P?',
      spoken: '¡Juguemos con los labios! Junta tus dos labios bien apretaditos, guarda un poquito de aire y suéltalos rápido como en Pato. ¡Muy bien!',
      display: '¡Junta tus dos labios bien apretaditos, guarda aire y suéltalos rápido como en Pato!'
    }
  };

  function playCurrentPraxiaNarration() {
    const currentKey = (elements.praxiaPhonemeSelect.value || 'r').toLowerCase();
    const narration = SOUND_NARRATIONS[currentKey] || SOUND_NARRATIONS['r'];
    audioEngine.speak(narration.spoken);
  }
  window.playCurrentPraxiaNarration = playCurrentPraxiaNarration;

  function openPraxiaModal(soundKey = 'r', onCloseCallback = null, customExitLabel = null) {
    audioEngine.stopSpeaking();
    praxiaCallbackOnClose = onCloseCallback;
    const key = (soundKey || 'r').toLowerCase();
    const narration = SOUND_NARRATIONS[key] || SOUND_NARRATIONS['r'];

    praxiaCanvas.setPhoneme(key);
    elements.praxiaPhonemeSelect.value = key;
    elements.praxiaTitle.textContent = narration.title;
    elements.praxiaDesc.textContent = narration.display;

    const exitBtnSpan = elements.btnClosePraxiaBottom ? elements.btnClosePraxiaBottom.querySelector('span') : null;
    if (exitBtnSpan) {
      exitBtnSpan.textContent = customExitLabel || "Volver al Juego";
    }

    elements.praxiaModal.classList.add('active');

    // Narración oral automática e inmediata por Ava (Voice-First para niños pre-lectores)
    audioEngine.speak(narration.spoken);
  }

  function closePraxia() {
    if (!canTouch()) return;
    // REGLA CLÍNICA: Al cerrar o abandonar las praxias, Ava DEBE callar de inmediato
    audioEngine.stopSpeaking();
    elements.praxiaModal.classList.remove('active');
    if (praxiaCallbackOnClose) {
      praxiaCallbackOnClose();
      praxiaCallbackOnClose = null;
    }
  }

  if (elements.btnClosePraxia) {
    elements.btnClosePraxia.addEventListener('click', closePraxia);
  }

  if (elements.btnClosePraxiaBottom) {
    elements.btnClosePraxiaBottom.addEventListener('click', closePraxia);
  }

  if (elements.btnNarratePraxia) {
    elements.btnNarratePraxia.addEventListener('click', (e) => {
      e.stopPropagation();
      playCurrentPraxiaNarration();
    });
  }

  if (elements.praxiaNarrationBox) {
    elements.praxiaNarrationBox.addEventListener('click', () => {
      playCurrentPraxiaNarration();
    });
  }

  elements.btnOpenMiniPraxia.addEventListener('click', () => {
    openPraxiaModal(state.activePhoneme);
  });

  elements.praxiaPhonemeSelect.addEventListener('change', (e) => {
    openPraxiaModal(e.target.value, praxiaCallbackOnClose);
  });

  elements.btnPraxiaPlayPause.addEventListener('click', () => {
    praxiaCanvas.togglePlay();
    elements.btnPraxiaPlayPause.innerHTML = praxiaCanvas.isPlaying 
      ? `<svg class="ui-icon-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg><span>Pausar</span>`
      : `<svg class="ui-icon-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/></svg><span>Reproducir</span>`;
  });

  const btnPraxiaSpeed = document.getElementById('btnPraxiaSpeed');
  const praxiaSpeedLabel = document.getElementById('praxiaSpeedLabel');
  let isPraxiaSlow = false;
  if (btnPraxiaSpeed && praxiaSpeedLabel) {
    btnPraxiaSpeed.addEventListener('click', () => {
      isPraxiaSlow = !isPraxiaSlow;
      praxiaCanvas.setSpeed(isPraxiaSlow ? 0.5 : 1.0);
      praxiaSpeedLabel.textContent = isPraxiaSlow ? '🐇 Normal' : '🐢 Lento';
    });
  }

  /* --- PANTALLA CUS-05: CUEVA DEL AVATAR Y ROPERO 100% VISUAL (PREESCOLARES NO LECTORES) --- */
  const storeCategoryTabsEl = document.getElementById('storeCategoryTabs');
  const caveEquippedSlotsBarEl = document.getElementById('caveEquippedSlotsBar');
  const cavePreviewBadgeEl = document.getElementById('cavePreviewBadge');
  const btnClearAllOutfitEl = document.getElementById('btnClearAllOutfit');
  const btnCaveListenAvaEl = document.getElementById('btnCaveListenAva');
  const btnWidgetStarsEl = document.getElementById('btnWidgetStars');

  function getUnlockedCollectibles() {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem('bosque_unlocked_items') || '[]');
      if (!Array.isArray(list)) list = [];
    } catch (e) {
      list = [];
    }
    const currentLoadout = avaEngine.getEquippedLoadout();
    Object.values(currentLoadout).forEach(id => {
      if (id && !list.includes(id)) list.push(id);
    });
    return list;
  }

  function saveUnlockedCollectibles(list) {
    try {
      localStorage.setItem('bosque_unlocked_items', JSON.stringify(list));
    } catch (e) {}
  }

  function pulseCaveAvatar() {
    const pedestalEl = document.getElementById('caveAvaPedestal');
    if (!pedestalEl) return;
    pedestalEl.classList.remove('ava-touch-wiggle');
    void pedestalEl.offsetWidth;
    pedestalEl.classList.add('ava-touch-wiggle');
    setTimeout(() => pedestalEl.classList.remove('ava-touch-wiggle'), 600);
  }

  function renderCaveSlotsAndTabs() {
    const slotsMeta = window.AvatarSlotsData || [
      { id: 'all', label: 'Todos' },
      { id: 'head', label: 'Sombreros' },
      { id: 'eyes', label: 'Lentes' },
      { id: 'wings', label: 'Alas' },
      { id: 'neck', label: 'Capas' },
      { id: 'hand', label: 'Tesoros' }
    ];
    const currentLoadout = avaEngine.getEquippedLoadout();

    // 1. Pestañas 100% icónicas (sin etiquetas de texto técnico)
    if (storeCategoryTabsEl) {
      storeCategoryTabsEl.innerHTML = '';
      slotsMeta.forEach(slot => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-label', slot.label);
        btn.setAttribute('title', slot.label);
        btn.setAttribute('aria-selected', state.activeStoreCategory === slot.id ? 'true' : 'false');
        const hasEquippedInSlot = slot.id !== 'all' && Boolean(currentLoadout[slot.id]);
        btn.className = `store-cat-tab ${state.activeStoreCategory === slot.id ? 'active' : ''}`;
        btn.innerHTML = `
          ${avaEngine.generateSlotTabIconSvg(slot.id)}
          ${hasEquippedInSlot ? '<span class="store-cat-dot" aria-hidden="true"></span>' : ''}
        `;
        btn.addEventListener('click', () => {
          if (!canTouch()) return;
          state.activeStoreCategory = slot.id;
          audioEngine.playClick();
          renderAvatarStore();
        });
        storeCategoryTabsEl.appendChild(btn);
      });
    }

    // 2. Burbujas visuales únicamente de los tesoros puestos (cero etiquetas "Libre")
    if (caveEquippedSlotsBarEl) {
      caveEquippedSlotsBarEl.innerHTML = '';
      slotsMeta.filter(s => s.id !== 'all').forEach(slot => {
        const equippedId = currentLoadout[slot.id];
        const equippedObj = equippedId ? AvatarAccessoriesData.find(a => a.id === equippedId) : null;
        if (!equippedObj) return;

        const bubble = document.createElement('button');
        bubble.type = 'button';
        bubble.className = 'cave-worn-bubble';
        bubble.setAttribute('aria-label', `Quitar ${equippedObj.name}`);
        bubble.title = equippedObj.name;
        bubble.innerHTML = `
          ${avaEngine.generateCollectibleIconSvg(equippedObj.id)}
          <span class="cave-worn-remove-dot" aria-hidden="true">×</span>
        `;
        bubble.addEventListener('click', () => {
          if (!canTouch()) return;
          avaEngine.unequipSlot(slot.id);
          audioEngine.playClick();
          renderAvatarStore();
        });
        caveEquippedSlotsBarEl.appendChild(bubble);
      });
    }

    // 3. Botón circular para reiniciar atuendo (solo visible cuando lleva algo puesto)
    const equippedCount = avaEngine.getEquippedCount();
    if (btnClearAllOutfitEl) {
      btnClearAllOutfitEl.hidden = equippedCount === 0;
    }

    // 4. Indicador visual de probador mágico (icono de ojo + precio en estrellas, sin texto)
    const preview = avaEngine.getPreviewOverlay();
    if (cavePreviewBadgeEl) {
      if (preview) {
        const prevItem = AvatarAccessoriesData.find(a => a.id === preview.itemId);
        cavePreviewBadgeEl.hidden = false;
        cavePreviewBadgeEl.innerHTML = `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#FFD54F" stroke="#FFA000" stroke-width="1.4" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span>${prevItem ? prevItem.price : ''}</span>
        `;
      } else {
        cavePreviewBadgeEl.hidden = true;
      }
    }
  }

  if (btnClearAllOutfitEl) {
    btnClearAllOutfitEl.addEventListener('click', () => {
      if (!canTouch()) return;
      avaEngine.clearAllEquipped();
      audioEngine.playClick();
      renderAvatarStore();
    });
  }

  if (btnCaveListenAvaEl) {
    btnCaveListenAvaEl.addEventListener('click', () => {
      if (!canTouch()) return;
      audioEngine.playChime();
      const phrase = avaEngine.getEquippedCount() > 0
        ? '¡Mira qué linda me veo con mis tesoros del bosque!'
        : '¡Bienvenido a mi cueva! Toca un tesoro para vestirme.';
      audioEngine.speak(phrase);
    });
  }

  function renderAvatarStore() {
    if (!elements.storeItemsGrid) return;
    elements.storeItemsGrid.innerHTML = '';
    updateStars(0);

    const unlockedItems = getUnlockedCollectibles();
    renderCaveSlotsAndTabs();

    const preview = avaEngine.getPreviewOverlay();
    const visibleItems = state.activeStoreCategory === 'all'
      ? AvatarAccessoriesData
      : AvatarAccessoriesData.filter(item => item.slot === state.activeStoreCategory);

    const starSvgMini = `
      <svg class="stars-icon-svg-mini" viewBox="0 0 24 24" width="17" height="17" fill="#FFB300" stroke="#E65100" stroke-width="1.6" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>`;

    const checkSvgMini = `
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"/>
      </svg>`;

    const putOnSvgMini = `
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>`;

    const eyeSvgMini = `
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>`;

    visibleItems.forEach(item => {
      const isEquipped = avaEngine.isItemEquipped(item.id);
      const isUnlocked = unlockedItems.includes(item.id);
      const canAfford = state.effortStars >= item.price;
      const isPreviewing = Boolean(preview && preview.itemId === item.id && !isUnlocked);

      const card = document.createElement('button');
      card.type = 'button';
      card.setAttribute('aria-pressed', isEquipped ? 'true' : 'false');
      card.setAttribute('aria-label', item.name);
      card.title = item.name;
      card.className = [
        'store-item-card',
        isEquipped ? 'equipped' : '',
        !isEquipped && isUnlocked ? 'unlocked' : '',
        !isUnlocked && canAfford ? 'can-afford' : '',
        isPreviewing ? 'is-previewing' : ''
      ].filter(Boolean).join(' ');

      let actionPillHtml = '';
      if (isEquipped) {
        actionPillHtml = `<div class="item-action-pill pill-equipped">${checkSvgMini}</div>`;
      } else if (isUnlocked) {
        actionPillHtml = `<div class="item-action-pill pill-equip">${putOnSvgMini}</div>`;
      } else if (isPreviewing) {
        actionPillHtml = `<div class="item-action-pill pill-preview">${eyeSvgMini}<span>${item.price}</span></div>`;
      } else if (canAfford) {
        actionPillHtml = `<div class="item-action-pill pill-redeem">${starSvgMini}<span>${item.price}</span></div>`;
      } else {
        actionPillHtml = `<div class="item-action-pill pill-locked">${starSvgMini}<span>${item.price}</span></div>`;
      }

      card.innerHTML = `
        ${isEquipped ? `<span class="item-equipped-check" aria-hidden="true">${checkSvgMini}</span>` : ''}
        <div class="item-vector-preview">
          ${avaEngine.generateCollectibleIconSvg(item.id)}
        </div>
        ${actionPillHtml}
      `;

      card.addEventListener('click', () => {
        if (!canTouch()) return;

        // Caso 1: Ya está puesto -> Quitar con un solo toque
        if (avaEngine.isItemEquipped(item.id)) {
          avaEngine.unequipSlot(item.slot);
          audioEngine.playClick();
          renderAvatarStore();
          return;
        }

        // Caso 2: Ya está desbloqueado en el ropero -> Poner de inmediato y escuchar la voz neural de Ava
        if (unlockedItems.includes(item.id)) {
          avaEngine.clearPedestalPreview();
          avaEngine.equipItem(item.slot, item.id);
          pulseCaveAvatar();
          if (elements.avatarCaveSpeech) elements.avatarCaveSpeech.textContent = item.phrase;
          audioEngine.playClick();
          audioEngine.speak(item.phrase);
          renderAvatarStore();
          return;
        }

        // Caso 3: Alcanzan las estrellas -> Desbloquear, vestir y celebrar con la voz neural de Ava
        if (state.effortStars >= item.price) {
          updateStars(-item.price);
          unlockedItems.push(item.id);
          saveUnlockedCollectibles(unlockedItems);

          avaEngine.clearPedestalPreview();
          avaEngine.equipItem(item.slot, item.id);
          if (elements.avatarCaveSpeech) elements.avatarCaveSpeech.textContent = item.phrase;
          audioEngine.playSuccessFanfare();
          confetti.launch(48);
          window.dispatchEvent(new CustomEvent('ava-celebrate'));
          audioEngine.speak(item.phrase);
          renderAvatarStore();
          return;
        }

        // Caso 4: Faltan estrellas -> Probador mágico no punitivo con voz neural de estudio
        if (isPreviewing) {
          avaEngine.clearPedestalPreview();
          audioEngine.playClick();
        } else {
          avaEngine.setPedestalPreview(item.slot, item.id);
          pulseCaveAvatar();
          const tryOnPhrase = '¡Mira qué lindo me queda! Sigamos jugando en el bosque para ganar más estrellas.';
          if (elements.avatarCaveSpeech) elements.avatarCaveSpeech.textContent = tryOnPhrase;
          audioEngine.playGentleEncouragement();
          audioEngine.speak(tryOnPhrase);
        }
        renderAvatarStore();
      });

      elements.storeItemsGrid.appendChild(card);
    });
  }

  /* --- CUS-03: CONTROL PARENTAL MATHGATE (3 OPCIONES COGNITIVAS) --- */
  function openMathGate() {
    const challenge = telemetry.generateMathChallenge();
    elements.mathgateChallengeText.textContent = `${challenge.question}`;
    const optionBtns = document.querySelectorAll('.mathgate-option-btn');
    optionBtns.forEach((btn, idx) => {
      if (challenge.options && challenge.options[idx] !== undefined) {
        const val = challenge.options[idx];
        btn.textContent = val;
        btn.setAttribute('data-val', val);
      }
      btn.classList.remove('opt-wrong', 'opt-correct');
    });
    elements.mathgateModal.classList.add('active');
    if (window.telemetryEval) {
      window.telemetryEval.recordMathGateOpen();
    }
  }

  if (elements.btnHeaderEvalLink) {
    elements.btnHeaderEvalLink.addEventListener('click', () => {
      if (!canTouch()) return;
      if (window.telemetryEval) {
        window.telemetryEval.openConfigModal();
      }
    });
  }

  elements.btnParentalGate.addEventListener('click', () => {
    if (!canTouch()) return;
    openMathGate();
  });

  const mathOptionBtns = document.querySelectorAll('.mathgate-option-btn');
  mathOptionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!canTouch()) return;
      const val = btn.getAttribute('data-val');
      if (telemetry.verifyOption(val)) {
        if (window.telemetryEval) window.telemetryEval.recordMathGateAttempt(true);
        btn.classList.add('opt-correct');
        audioEngine.playChime();
        setTimeout(() => {
          elements.mathgateModal.classList.remove('active');
          renderAdultDashboard();
          showScreen('screen-adult', 'Portal Clínico y Fonoaudiológico');
        }, 300);
      } else {
        if (window.telemetryEval) window.telemetryEval.recordMathGateAttempt(false);
        btn.classList.add('opt-wrong');
        audioEngine.playGentleEncouragement();
        setTimeout(() => {
          btn.classList.remove('opt-wrong');
        }, 800);
      }
    });
  });

  if (elements.btnMathgateCancel) {
    elements.btnMathgateCancel.addEventListener('click', () => {
      if (!canTouch()) return;
      audioEngine.stopSpeaking();
      elements.mathgateModal.classList.remove('active');
    });
  }

  // Soporte de teclado físico (teclas 1, 2, 3 o Escape) para el adulto/terapeuta en PC
  window.addEventListener('keydown', (e) => {
    if (elements.mathgateModal.classList.contains('active')) {
      const optionBtns = document.querySelectorAll('.mathgate-option-btn');
      if (e.key === '1' && optionBtns[0]) optionBtns[0].click();
      else if (e.key === '2' && optionBtns[1]) optionBtns[1].click();
      else if (e.key === '3' && optionBtns[2]) optionBtns[2].click();
      else if (e.key === 'Escape') {
        if (elements.btnMathgateCancel) elements.btnMathgateCancel.click();
      }
    }
  });

  /* --- PANTALLA CUS-04: DASHBOARD CLÍNICO ADULTO --- */
  function renderAdultDashboard() {
    // Renderiza tabla de muestras de audio cifradas
    elements.audioVaultBody.innerHTML = '';
    telemetry.audioVaultSamples.forEach((sample, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${sample.id}</strong></td>
        <td>${sample.date}</td>
        <td><strong>${sample.word}</strong></td>
        <td><span class="custom-badge ${sample.statusClass}">${sample.status}</span></td>
        <td><button class="audio-play-mini-btn" id="btnPlayVault-${i}">▶️ Escuchar</button></td>
        <td style="font-size: 0.8rem; color: #475569;">${sample.notes}</td>
      `;
      elements.audioVaultBody.appendChild(tr);

      setTimeout(() => {
        const btnPlay = document.getElementById(`btnPlayVault-${i}`);
        if (btnPlay) {
          btnPlay.onclick = () => {
            if (sample.audioUrl) {
              const aud = new Audio(sample.audioUrl);
              aud.play();
            } else {
              audioEngine.speak(sample.word);
            }
          };
        }
      }, 0);
    });

    if (window.telemetryEval) {
      window.telemetryEval.renderAdultDashboardPanel();
    }
  }

  // Cambio de pestañas en dashboard adulto
  elements.dashTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');
      if (!targetId) return;
      elements.dashTabs.forEach(t => t.classList.remove('active'));
      elements.dashContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
      if (targetId === 'tab-sced-eval' && window.telemetryEval) {
        window.telemetryEval.renderAdultDashboardPanel();
      }
    });
  });

  elements.btnSaveAdultConfig.addEventListener('click', () => {
    audioEngine.playChime();
    alert("✅ Configuración Fonoaudiológica Guardada con éxito.\nLas sesiones activas se actualizaron según los fonemas seleccionados.");
  });

  elements.btnExitAdultPortal.addEventListener('click', () => {
    showScreen('screen-menu', 'Bosque Sonoro Amigable');
  });

  /* --- NAVEGACIÓN Y EVENTOS DEL MENÚ PRINCIPAL --- */
  elements.btnBackMenu.addEventListener('click', () => {
    if (!canTouch()) return;
    audioEngine.stopSpeaking();
    audioEngine.playClick();
    showScreen('screen-menu', 'Bosque Sonoro Amigable');
  });

  // Banner interactivo auditivo de Ava (100% Voice-First)
  const bannerAvaWelcome = document.getElementById('bannerAvaWelcome');
  const btnHearAvaWelcome = document.getElementById('btnHearAvaWelcome');
  function playAvaGreeting() {
    if (!canTouch()) return;
    audioEngine.playChime();
    audioEngine.speak("¡Hola amiguito! Bienvenido al Bosque Sonoro. ¡Toca un vagón para empezar a jugar!");
  }
  if (bannerAvaWelcome) bannerAvaWelcome.addEventListener('click', playAvaGreeting);
  if (btnHearAvaWelcome) {
    btnHearAvaWelcome.addEventListener('click', (e) => {
      e.stopPropagation();
      playAvaGreeting();
    });
  }

  // Vagón Principal: Locomotora Fónica (Silbato y Saludo)
  if (elements.wagonLocomotive) {
    elements.wagonLocomotive.addEventListener('click', () => {
      audioEngine.playTrainWhistle();
      audioEngine.speak("¡Chu chú! Toca un vagón para jugar.");
    });
  }

  elements.wagonTrabalenguas.addEventListener('click', () => {
    if (!canTouch()) return;
    loadExercise('trabalenguas', 0);
  });

  elements.wagonRimas.addEventListener('click', () => {
    if (!canTouch()) return;
    loadExercise('rimas', 0);
  });

  elements.wagonAdivinanzas.addEventListener('click', () => {
    if (!canTouch()) return;
    loadExercise('adivinanzas', 0);
  });

  elements.wagonCarrera.addEventListener('click', () => {
    if (!canTouch()) return;
    loadCarreraGame(0);
  });

  elements.wagonBingo.addEventListener('click', () => {
    if (!canTouch()) return;
    loadBingoGame(0);
  });

  elements.btnOpenPairs.addEventListener('click', () => {
    if (!canTouch()) return;
    loadMinimalPair(0);
  });

  function openAvatarCaveScreen() {
    if (!canTouch()) return;
    renderAvatarStore();
    showScreen('screen-avatar', 'Ava');
    audioEngine.speak('¡Bienvenido a mi cueva! Toca un tesoro para vestirme.');
  }

  elements.btnOpenAvatar.addEventListener('click', openAvatarCaveScreen);
  if (btnWidgetStarsEl) {
    btnWidgetStarsEl.style.cursor = 'pointer';
    btnWidgetStarsEl.setAttribute('role', 'button');
    btnWidgetStarsEl.setAttribute('tabindex', '0');
    btnWidgetStarsEl.addEventListener('click', openAvatarCaveScreen);
  }

  /* --- ACCESIBILIDAD: MODO ALTO CONTRASTE CVI (WCAG 2.2 AA / Mandel 1.9) --- */
  function applyCviMode(enable) {
    state.cviMode = !!enable;
    if (state.cviMode) {
      document.body.setAttribute('data-theme', 'cvi');
    } else {
      document.body.removeAttribute('data-theme');
    }

    if (elements.chkCviAdultToggle) {
      elements.chkCviAdultToggle.checked = state.cviMode;
    }
    try {
      localStorage.setItem('fono_cvi_mode', state.cviMode ? '1' : '0');
    } catch (e) {
      // Manejo seguro en entornos con almacenamiento bloqueado
    }
  }
  window.setBosqueCviMode = applyCviMode;

  // Conexión de botones de prueba acústica de Ava en el panel adulto
  const btnAuditionPureK = document.getElementById('btnAuditionPureK');
  const btnAuditionPureS = document.getElementById('btnAuditionPureS');
  const btnAuditionAvaWarmth = document.getElementById('btnAuditionAvaWarmth');

  if (btnAuditionPureK) {
    btnAuditionPureK.addEventListener('click', () => {
      audioEngine.playPurePhoneme('k');
    });
  }
  if (btnAuditionPureS) {
    btnAuditionPureS.addEventListener('click', () => {
      audioEngine.playPurePhoneme('s');
    });
  }
  if (btnAuditionAvaWarmth) {
    btnAuditionAvaWarmth.addEventListener('click', () => {
      audioEngine.playNonPunitiveEncouragement();
    });
  }

  // Conexión del switch CVI dentro de la Gobernanza Adulta / Clínica
  if (elements.chkCviAdultToggle) {
    elements.chkCviAdultToggle.addEventListener('change', (e) => {
      applyCviMode(e.target.checked);
      audioEngine.playClick();
    });
  }

  // Restaurar preferencia guardada al iniciar
  try {
    const savedCvi = localStorage.getItem('fono_cvi_mode') === '1';
    if (savedCvi) {
      applyCviMode(true);
    }
  } catch (e) {}

  // Saludo inicial de Ava al cargar
    // Desbloqueo y activación de voz en el primer toque (cumple con Autoplay Policy de Chrome/Edge)
  let initialGreetingPlayed = false;
  function triggerInitialGreetingOnFirstTouch() {
    if (initialGreetingPlayed) return;
    initialGreetingPlayed = true;
    audioEngine.resumeAudioContext();
    audioEngine.speak("¡Hola amiguito! Bienvenido al Bosque Sonoro. ¿Qué juego quieres jugar hoy?");
  }

  // Intento inicial inmediato por si el navegador permite autoplay
  setTimeout(() => {
    audioEngine.speak("¡Hola amiguito! Bienvenido al Bosque Sonoro. ¿Qué juego quieres jugar hoy?");
  }, 400);

  // Activación universal en el primer clic o toque en cualquier parte de la pantalla
  document.addEventListener('click', triggerInitialGreetingOnFirstTouch, { once: true, capture: true });
  document.addEventListener('pointerdown', triggerInitialGreetingOnFirstTouch, { once: true, capture: true });
});
