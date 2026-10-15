/* ==========================================================================
   APP MASTER ORCHESTRATOR - PROTOTIPO FONO-LÚDICO PEDIÁTRICO
   Orquesta CUS-01 a CUS-05, DDA adaptativo, tokens WCAG 2.2 AA y Modo CVI
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Inicialización de subsistemas
  const audioEngine = new PhonoAudioEngine();
  const confetti = new ConfettiEngine('confettiCanvas');
  const praxiaCanvas = new PraxiaCanvasEngine('praxiaCanvas');
  const telemetry = new TelemetryPortalEngine();

  // Estado global de la aplicación
  const state = {
    currentScreen: 'screen-menu',
    currentActivity: 'trabalenguas', // 'trabalenguas', 'rimas', 'adivinanzas', 'carrera', 'bingo'
    activityIndex: 0,
    effortStars: 15,
    consecutiveFailures: 0,
    isRecording: false,
    activePhoneme: 'r',
    theme: 'normal',
    cviMode: false,
    soundEnabled: true,
    lastTouchTime: 0,
    equippedItem: null
  };

  // Referencias al DOM
  const elements = {
    // Header & Widgets
    starsCounter: document.getElementById('starsCounter'),
    headerScreenTag: document.getElementById('headerScreenTag'),
    btnBackMenu: document.getElementById('btnBackMenu'),
    btnSoundToggle: document.getElementById('btnSoundToggle'),
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
    avatarAccessoryOverlay: document.getElementById('avatarAccessoryOverlay'),
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

  /* --- CONTROL DE DEBOUNCE TÁCTIL (< 80ms) Y GESTIÓN DE PANTALLAS --- */
  function canTouch() {
    const now = Date.now();
    if (now - state.lastTouchTime < 80) {
      return false; // Ignora rebote táctil involuntario infantil
    }
    state.lastTouchTime = now;
    return true;
  }

  function showScreen(screenId, tagText = "") {
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
  }

  function updateStars(amount = 0) {
    state.effortStars += amount;
    elements.starsCounter.textContent = state.effortStars;
    const shortcutStars = document.getElementById('starsShortcutCounter');
    if (shortcutStars) shortcutStars.textContent = state.effortStars;
    if (amount > 0) {
      audioEngine.playChime();
    }
  }

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

  /* --- CUS-01: CAPTURA DE MICRÓFONO Y CICLO ASR / DDA --- */
  elements.btnMic.addEventListener('click', async () => {
    if (!canTouch()) return;

    if (!state.isRecording) {
      // INICIAR GRABACIÓN
      state.isRecording = true;
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

      await audioEngine.startRecording((amplitude) => {
        // Ondas reactivas en tiempo real
        const scaleVal = 1 + amplitude * 0.45;
        elements.micWave1.style.transform = `translate(-50%, -50%) scale(${scaleVal})`;
        elements.micWave1.style.opacity = Math.min(0.9, amplitude * 1.5);
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
      elements.btnMic.classList.remove('state-recording');
      elements.btnMic.classList.add('state-processing');
      elements.micCaption.textContent = "Procesando...";

      const { blob, url } = await audioEngine.stopRecording();
      elements.btnMic.classList.remove('state-processing');

      // 1. SELF-PLAYBACK CONTINGENTE (< 300 ms - Peña et al. 2024 / RNF-DES-001)
      elements.btnSelfPlayback.disabled = false;
      elements.micCaption.textContent = "¡Escúchate!";
      elements.avatarBalloon.textContent = "¡Escucha cómo sonó tu voz en el megáfono!";
      audioEngine.playSelfPlayback();

      // 2. EVALUACIÓN ASR Y MÓDULO DDA (Strömbergsson et al. 2026 / RN-DDA-001)
      setTimeout(() => {
        state.consecutiveFailures++;
        const currentTargetWord = elements.exerciseWord.textContent;
        const evaluation = audioEngine.evaluateSpeech(currentTargetWord, state.consecutiveFailures);

        if (evaluation.verdict === 'APPROVED') {
          // ESCENARIO 1: ACIERTO FONÉTICO
          state.consecutiveFailures = 0;
          audioEngine.playSuccessFanfare();
          confetti.launch(70);
          updateStars(3);

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

        } else if (state.consecutiveFailures < 3) {
          // ESCENARIO 2: REINTENTO SUAVE (SIN CASTIGO NI ROJO PUNITIVO - RN-GAM-001)
          audioEngine.playGentleEncouragement();
          elements.feedbackBadge.className = 'feedback-status-badge status-retry active';
          elements.feedbackBadge.textContent = `💜 ¡Buen intento! (${state.consecutiveFailures}/3) Vamos a intentarlo otra vez.`;
          elements.micCaption.textContent = "Toca para reintentar";
          audioEngine.speak("¡Qué buen intento! Escucha cómo lo decimos y vuelve a tocar el botón.");

          telemetry.addRecordedSample(currentTargetWord, `/${state.activePhoneme}/`, `REINTENTO (${state.consecutiveFailures})`, url, "tag-yellow");

        } else {
          // ESCENARIO 3: INTERVENCIÓN MANDATORIA DDA TRAS 3ER FALLO (RN-DDA-001)
          audioEngine.playChime();
          updateStars(1); // Estrella por esfuerzo GL-005
          elements.feedbackBadge.className = 'feedback-status-badge status-dda active';
          elements.feedbackBadge.textContent = "🌟 ¡Estrella por esfuerzo otorgada! Mira cómo colocamos la lengua.";
          elements.micCaption.textContent = "¡Gran esfuerzo!";

          telemetry.addRecordedSample(currentTargetWord, `/${state.activePhoneme}/`, "DDA ASISTIDO", url, "tag-purple");

          // Despliega automáticamente la Praxia 2D y avanza asistido
          audioEngine.speak("¡Qué gran esfuerzo amigo! Mira en la pantalla cómo colocamos la lengua para que sea más fácil.", () => {
            openPraxiaModal(state.activePhoneme, () => {
              // Al cerrar praxia avanza asistido
              loadExercise(state.currentActivity, state.activityIndex + 1);
            });
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
    const pair = MinimalPairsData[currentPairIndex];
    elements.pairCardCorrect.classList.add('selected-correct');
    audioEngine.playSuccessFanfare();
    confetti.launch(50);
    updateStars(2);

    audioEngine.speak(`¡Muy bien! ¡Es ${pair.correctOption.word}! Mira cómo se pronuncia:`, () => {
      openPraxiaModal(pair.correctOption.phonemeTarget, () => {
        loadMinimalPair(currentPairIndex + 1);
      });
    });
  });

  elements.pairCardFoil.addEventListener('click', () => {
    if (!canTouch()) return;
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
            <div class="bee-wings-pair" aria-hidden="true">
              <span class="bee-wing wing-left"></span>
              <span class="bee-wing wing-right"></span>
            </div>
            <img src="assets/images/mascot_ava.jpg" alt="Abejita Ava volando" class="ava-bee-avatar">
            <div class="pollen-dust-ring" aria-hidden="true"></div>
          </div>
        ` : ''}
        <div class="flower-tag-label">
          <span class="flower-phoneme-chip">/${s.phoneme}/</span>
          <span class="flower-name-text">${s.word}</span>
        </div>
      `;

      flower.onclick = () => {
        audioEngine.speak(`Flor ${s.step}: palabra ${s.word} con sonido ${s.phoneme}.`);
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
  const BINGO_ROUNDS = [
    { targetSound: "s", targetWord: "Sol", prompt: "¡Encuentra y toca la tarjeta que empieza con /s/ como ¡Sol! ☀️" },
    { targetSound: "l", targetWord: "Luna", prompt: "¡Ahora busca y toca la tarjeta que empieza con /l/ como ¡Luna! 🌙" },
    { targetSound: "f", targetWord: "Fresa", prompt: "¡Toca la tarjeta que empieza con /f/ como ¡Fresa! 🍓" }
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
        <p class="bingo-card-sound">Sonido /${c.sound}/</p>
      `;

      cardEl.onclick = () => {
        if (!canTouch()) return;
        if (c.sound === round.targetSound) {
          // Acierto en Bingo
          cardEl.classList.add('stamped');
          audioEngine.playSuccessFanfare();
          confetti.launch(60);
          updateStars(2);

          if (bingoRoundIndex < BINGO_ROUNDS.length - 1) {
            audioEngine.speak(`¡Excelente! ¡${c.word} tiene el sonido pedido! Pasemos a la siguiente.`, () => {
              setTimeout(() => {
                loadBingoGame(bingoRoundIndex + 1);
              }, 1200);
            });
          } else {
            // ¡BINGO COMPLETO!
            confetti.launch(120);
            updateStars(5);
            elements.bingoCallerInstruction.textContent = "🎉 ¡¡BIIIINGO FONOLÓGICO!! ¡Completaste el cartón!";
            audioEngine.speak("¡¡Biiingo!! ¡Qué gran oído tienes, completaste todo el cartón sonoro!");
            setTimeout(() => {
              showScreen('screen-menu', 'Bosque Sonoro Amigable');
            }, 3500);
          }
        } else {
          // Intento no concordante (aliento suave, no punitivo)
          audioEngine.playGentleEncouragement();
          audioEngine.speak(`Casi casi... ${c.word} empieza con el sonido /${c.sound}/. ¡Busca la que empieza con /${round.targetSound}/!`);
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
      spoken: '¡Hola amiguito! Para hacer este sonido, sube la punta de tu lengua arribita, justo detrás de tus dientes de arriba. Ahora sopla despacito y haz que tu lengua cosquillee: ¡Rrrrrr! ¡Pruébalo conmigo!',
      display: '¡Sube la punta de tu lengua arribita, detrás de tus dientes de arriba, y sopla para que cosquillee: ¡Rrrrrr!'
    },
    'rr': {
      title: '👅 ¿Cómo ponemos la lengua para la RR?',
      spoken: '¡Vamos con fuerza! Apoya la punta de tu lengua arriba, detrás de tus dientes. Toma aire y sopla fuerte para que tu lengua vibre rápido: ¡Rrrrrrrrr! ¡Qué bien suena!',
      display: '¡Apoya la punta de tu lengua arriba, detrás de los dientes, y sopla fuerte para que vibre rápido: ¡Rrrrrrrrr!'
    },
    's': {
      title: '👅 ¿Cómo ponemos la boca para la S?',
      spoken: '¡Escucha bien! Pon tu lengua abajo, detrás de tus dientes de abajo. Ahora sonríe mostrando tus dientes y sopla suavecito: ¡Sssssssss! ¡Excelente!',
      display: '¡Pon tu lengua abajo, detrás de tus dientes, sonríe mostrando los dientes y sopla suavecito: ¡Sssssssss!'
    },
    'l': {
      title: '👅 ¿Cómo ponemos la lengua para la L?',
      spoken: '¡Mira qué fácil! Pega la punta de tu lengua arriba en el techo de tu boca. Déjala quietita y canta sacando tu voz: ¡Llllllllll! ¡Lo hiciste genial!',
      display: '¡Pega la punta de tu lengua arriba en el techo de tu boca, déjala quietita y canta: ¡Llllllllll!'
    },
    'k': {
      title: '👅 ¿Cómo ponemos la boca para la K?',
      spoken: '¡Atento amiguito! Abre bien grande tu boca, sube la parte de atrás de tu lengua arriba y suelta el aire de golpe: ¡Kaaaa! ¡Inténtalo tú solo!',
      display: '¡Abre grande la boca, sube la parte de atrás de la lengua y suelta el aire de golpe: ¡Kaaaa!'
    },
    'p': {
      title: '👅 ¿Cómo ponemos los labios para la P?',
      spoken: '¡Juguemos con los labios! Junta tus dos labios bien apretaditos, guarda un poquito de aire y suelta tus labios rápido: ¡Paaaa! ¡Muy bien!',
      display: '¡Junta tus dos labios bien apretaditos, guarda aire y suéltalos rápido: ¡Paaaa!'
    }
  };

  function playCurrentPraxiaNarration() {
    const currentKey = (elements.praxiaPhonemeSelect.value || 'r').toLowerCase();
    const narration = SOUND_NARRATIONS[currentKey] || SOUND_NARRATIONS['r'];
    audioEngine.speak(narration.spoken);
  }

  function openPraxiaModal(soundKey = 'r', onCloseCallback = null) {
    praxiaCallbackOnClose = onCloseCallback;
    const key = (soundKey || 'r').toLowerCase();
    const narration = SOUND_NARRATIONS[key] || SOUND_NARRATIONS['r'];

    praxiaCanvas.setPhoneme(key);
    elements.praxiaPhonemeSelect.value = key;
    elements.praxiaTitle.textContent = narration.title;
    elements.praxiaDesc.textContent = narration.display;

    elements.praxiaModal.classList.add('active');

    // Narración oral automática e inmediata por Ava (Voice-First para niños pre-lectores)
    audioEngine.speak(narration.spoken);
  }

  function closePraxia() {
    if (!canTouch()) return;
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

  /* --- PANTALLA CUS-05: CUEVA DEL AVATAR Y CANJE DE ESTRELLAS --- */
  function renderAvatarStore() {
    elements.storeItemsGrid.innerHTML = '';
    AvatarAccessoriesData.forEach(item => {
      const card = document.createElement('div');
      card.className = `store-item-card ${state.equippedItem === item.id ? 'equipped' : ''}`;
      card.innerHTML = `
        <div class="item-icon">${item.icon}</div>
        <div class="item-name">${item.name}</div>
        <div class="item-price">
          <svg class="stars-icon-svg-mini" viewBox="0 0 24 24" width="16" height="16" fill="#FFB300" stroke="#FFA000" stroke-width="1.5" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span>${item.price}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        if (!canTouch()) return;
        if (state.equippedItem === item.id) {
          // Desequipar
          state.equippedItem = null;
          elements.avatarAccessoryOverlay.textContent = '';
          elements.avatarCaveSpeech.textContent = "¡Cambiemos de accesorio cuando quieras!";
          renderAvatarStore();
          audioEngine.playClick();
          return;
        }

        if (state.effortStars >= item.price) {
          updateStars(-item.price);
          state.equippedItem = item.id;
          elements.avatarAccessoryOverlay.textContent = item.equippedIcon;
          elements.avatarAccessoryOverlay.style.top = item.equippedTop;
          elements.avatarCaveSpeech.textContent = item.phrase;
          audioEngine.playSuccessFanfare();
          confetti.launch(40);
          audioEngine.speak(item.phrase);
          renderAvatarStore();
        } else {
          audioEngine.playGentleEncouragement();
          elements.avatarCaveSpeech.textContent = `¡Necesitas ${item.price} estrellas de esfuerzo! Sigue jugando para ganar más.`;
          audioEngine.speak("Sigue jugando en el bosque para ganar más estrellas de esfuerzo.");
        }
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
        btn.classList.add('opt-correct');
        audioEngine.playChime();
        setTimeout(() => {
          elements.mathgateModal.classList.remove('active');
          renderAdultDashboard();
          showScreen('screen-adult', 'Portal Clínico y Fonoaudiológico');
        }, 300);
      } else {
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
  }

  // Cambio de pestañas en dashboard
  elements.dashTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      elements.dashTabs.forEach(t => t.classList.remove('active'));
      elements.dashContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const targetId = tab.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
    });
  });

  elements.dashTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');
      if (!targetId) return;
      elements.dashTabs.forEach(t => t.classList.remove('active'));
      elements.dashContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
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
    audioEngine.playClick();
    showScreen('screen-menu', 'Bosque Sonoro Amigable');
  });

  // Banner interactivo auditivo de Ava (100% Voice-First)
  const bannerAvaWelcome = document.getElementById('bannerAvaWelcome');
  const btnHearAvaWelcome = document.getElementById('btnHearAvaWelcome');
  function playAvaGreeting() {
    if (!canTouch()) return;
    audioEngine.playChime();
    audioEngine.speak("¡Hola! Toca un vagón para jugar.");
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
      audioEngine.speak("¡Choo-choo! Toca un vagón para jugar.");
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

  elements.btnOpenAvatar.addEventListener('click', () => {
    if (!canTouch()) return;
    renderAvatarStore();
    showScreen('screen-avatar', 'Cueva del Avatar');
  });

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
  setTimeout(() => {
    audioEngine.speak("¡Hola amiguito! Bienvenido al Bosque Sonoro. ¿Qué juego quieres jugar hoy?");
  }, 600);
});
