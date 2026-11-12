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

  // Recuperar perfil clínico calibrado por el adulto/fonoaudiólogo (DEC-05)
  const DEFAULT_CLINICAL_PROFILE = {
    phonemes: ['r', 'rr', 's', 'l', 'clusters'],
    age: '4',
    asrTolerance: 2
  };
  let initialClinicalProfile = { ...DEFAULT_CLINICAL_PROFILE };
  try {
    const savedProfile = localStorage.getItem('bosque_clinical_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      if (parsed && Array.isArray(parsed.phonemes) && parsed.phonemes.length > 0) {
        initialClinicalProfile = {
          phonemes: parsed.phonemes,
          age: String(parsed.age || '4'),
          asrTolerance: Math.min(3, Math.max(1, Number(parsed.asrTolerance) || 2))
        };
      }
    }
  } catch (e) {}

  // Recuperar progreso del viaje en el Tren Van Riper (DEC-01 / DEC-03)
  let initialTrainProgress = { completed: [] };
  try {
    const savedProgress = localStorage.getItem('bosque_train_progress');
    if (savedProgress) {
      const parsedProg = JSON.parse(savedProgress);
      if (parsedProg && Array.isArray(parsedProg.completed)) {
        initialTrainProgress.completed = parsedProg.completed;
      }
    }
  } catch (e) {}

  // Estado global de la aplicación
  const state = {
    currentScreen: 'screen-menu',
    currentActivity: 'trabalenguas', // 'sonidos', 'palabras', 'trabalenguas', 'rimas', 'adivinanzas', 'carrera', 'bingo'
    activityIndex: 0,
    effortStars: initialEffortStars,
    consecutiveFailures: 0,
    isRecording: false,
    activePhoneme: 'r',
    theme: 'normal',
    cviMode: false,
    soundEnabled: true,
    lastTouchTime: 0,
    activeStoreCategory: 'all',
    clinicalProfile: initialClinicalProfile,
    trainProgress: initialTrainProgress
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

    // Pantallas & Barra Transversal de Progreso del Tren
    screens: document.querySelectorAll('.screen-view'),
    screenMenu: document.getElementById('screen-menu'),
    screenExercise: document.getElementById('screen-exercise'),
    screenPairs: document.getElementById('screen-pairs'),
    screenAvatar: document.getElementById('screen-avatar'),
    screenAdult: document.getElementById('screen-adult'),
    trainJourneyStrip: document.getElementById('trainJourneyStrip'),
    journeyStagesRow: document.getElementById('journeyStagesRow'),
    journeyCargoDots: document.getElementById('journeyCargoDots'),
    btnJourneyNextWagon: document.getElementById('btnJourneyNextWagon'),

    // Menú Principal Cards (Escalera Van Riper en 4 Estaciones)
    wagonLocomotive: document.getElementById('wagon-locomotive-engine'),
    locomotiveGuideBadge: document.getElementById('locomotiveGuideBadge'),
    wagonCaritas: document.getElementById('wagon-caritas'),
    wagonPares: document.getElementById('wagon-pares'),
    wagonSonidos: document.getElementById('wagon-sonidos'),
    wagonPalabras: document.getElementById('wagon-palabras'),
    wagonCarrera: document.getElementById('wagon-carrera'),
    wagonRimas: document.getElementById('wagon-rimas'),
    wagonAdivinanzas: document.getElementById('wagon-adivinanzas'),
    wagonTrabalenguas: document.getElementById('wagon-trabalenguas'),
    wagonBingo: document.getElementById('wagon-bingo'),
    btnOpenPairs: document.getElementById('wagon-pares') || document.getElementById('btnOpenPairs'),
    btnOpenAvatar: document.getElementById('btnOpenAvatar'),
    trainConvoyHitchLeft: document.getElementById('trainConvoyHitchLeft'),
    trainStageViewport: document.getElementById('trainStageViewport'),

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
    calibAgeGroup: document.getElementById('calibAgeGroup'),
    calibAsrTolerance: document.getElementById('calibAsrTolerance'),
    calibSaveFeedback: document.getElementById('calibSaveFeedback'),
    btnSaveAdultConfig: document.getElementById('btnSaveAdultConfig'),
    btnExitAdultPortal: document.getElementById('btnExitAdultPortal')
  };

  // Montaje del Avatar Vectorial Dinámico Ava en todos los contextos (CUS-05 / A.10 - H10)
  avaEngine.mount('#headerAppLogo', { size: 40 });
  avaEngine.mount('#menuAvaAvatar', { size: 70 });
  avaEngine.mount('#locomotiveAvaAvatar', { size: 74 });
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
      updateTrainVisualState();
    } else {
      elements.btnBackMenu.style.visibility = 'visible';
    }

    // Mostrar mini-vía transversal del tren solo durante actividades infantiles
    const activityScreens = new Set(['screen-exercise', 'screen-pairs', 'screen-carrera', 'screen-bingo']);
    if (elements.trainJourneyStrip) {
      const showStrip = activityScreens.has(screenId);
      elements.trainJourneyStrip.hidden = !showStrip;
      if (showStrip) {
        updateJourneyStrip();
      }
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

  /* --- CALIBRACIÓN CLÍNICA Y PROGRESIÓN VAN RIPER (DEC-01 / DEC-03 / DEC-05) --- */
  const VAN_RIPER_WAGONS = [
    { id: 'palabras', page: 0, label: 'Palabras' },
    { id: 'caritas', page: 0, label: 'Caritas' },
    { id: 'pares', page: 1, label: 'Parejas' },
    { id: 'sonidos', page: 1, label: 'Sonidos' },
    { id: 'carrera', page: 1, label: 'Flores' },
    { id: 'rimas', page: 2, label: 'Rimas' },
    { id: 'adivinanzas', page: 2, label: 'Adivinanzas' },
    { id: 'trabalenguas', page: 3, label: 'Trabalenguas' },
    { id: 'bingo', page: 3, label: 'Bingo' }
  ];

  function getAsrSimilarityThreshold() {
    const tol = Number(state.clinicalProfile.asrTolerance) || 2;
    if (tol <= 1) return 0.58;
    if (tol >= 3) return 0.80;
    return 0.70;
  }

  function getPrimaryCalibratedPhoneme() {
    const valid = (state.clinicalProfile.phonemes || []).filter(p => p !== 'clusters' && SOUND_NARRATIONS[p]);
    return valid[0] || 'r';
  }

  function getFilteredSonidosData() {
    const all = (SpeechGamesData && SpeechGamesData.SONIDOS_SILABAS_DATA) || [];
    const selected = state.clinicalProfile.phonemes || [];
    if (!selected.length) return all;
    const matched = all.filter(item => selected.includes(item.phoneme) || (item.phoneme === 'clusters' && selected.includes('clusters')));
    return matched.length ? matched : all;
  }

  function getFilteredPalabrasData() {
    const all = (SpeechGamesData && SpeechGamesData.PALABRAS_MAGICAS_DATA) || [];
    const selected = state.clinicalProfile.phonemes || [];
    const maxAge = Number(state.clinicalProfile.age) || 4;
    let filtered = all.filter(item => {
      const phonemeMatch = !selected.length || selected.includes(item.phoneme) || (item.phoneme === 'clusters' && selected.includes('clusters'));
      const ageMatch = !item.ageNorm || item.ageNorm <= maxAge;
      return phonemeMatch && ageMatch;
    });
    if (!filtered.length) {
      filtered = all.filter(item => !selected.length || selected.includes(item.phoneme));
    }
    return filtered.length ? filtered : all;
  }

  function getFilteredPairsData() {
    const all = (typeof MinimalPairsData !== 'undefined' && Array.isArray(MinimalPairsData)) ? MinimalPairsData : [];
    const selected = state.clinicalProfile.phonemes || [];
    if (!selected.length) return all;
    const prioritized = all.filter(p => selected.includes(p.correctOption.phonemeTarget));
    const others = all.filter(p => !selected.includes(p.correctOption.phonemeTarget));
    return prioritized.length ? [...prioritized, ...others] : all;
  }

  function getFilteredTrabalenguasData() {
    const all = (SpeechGamesData && SpeechGamesData.TRABALENGUAS_DATA) || [];
    const selected = state.clinicalProfile.phonemes || [];
    if (!selected.length) return all;
    const matched = all.filter(t => selected.includes(t.targetPhoneme));
    return matched.length ? matched : all;
  }

  function getRecommendedWagonId() {
    const completed = state.trainProgress.completed || [];
    const nextItem = VAN_RIPER_WAGONS.find(w => !completed.includes(w.id));
    return nextItem ? nextItem.id : 'caritas';
  }

  function getCurrentWagonId() {
    if (state.currentScreen === 'screen-pairs') return 'pares';
    if (state.currentScreen === 'screen-carrera') return 'carrera';
    if (state.currentScreen === 'screen-bingo') return 'bingo';
    if (state.currentScreen === 'screen-exercise') return state.currentActivity;
    return null;
  }

  function markWagonCompleted(wagonId) {
    if (!wagonId) return;
    const completed = state.trainProgress.completed || [];
    if (!completed.includes(wagonId)) {
      completed.push(wagonId);
      state.trainProgress.completed = completed;
      try {
        localStorage.setItem('bosque_train_progress', JSON.stringify(state.trainProgress));
      } catch (e) {}
    }
    updateTrainVisualState();
  }

  function updateTrainVisualState() {
    const recommendedId = getRecommendedWagonId();
    const recommendedObj = VAN_RIPER_WAGONS.find(w => w.id === recommendedId) || VAN_RIPER_WAGONS[0];
    const completed = state.trainProgress.completed || [];

    document.querySelectorAll('.train-wagon-card[data-wagon-id]').forEach(card => {
      const id = card.getAttribute('data-wagon-id');
      const isDone = completed.includes(id);
      const isRec = id === recommendedId;
      card.classList.toggle('wagon-completed', isDone);
      card.classList.toggle('wagon-recommended', isRec);
      const starEl = card.querySelector('.wagon-progress-star');
      if (starEl) {
        starEl.textContent = isDone ? '⭐' : (isRec ? '✨' : '');
      }
    });

    if (elements.locomotiveGuideBadge) {
      elements.locomotiveGuideBadge.textContent = '¡Chu chú! 🔔';
    }
  }

  function updateJourneyStrip(cargoCurrent = null, cargoTotal = null) {
    if (!elements.trainJourneyStrip) return;
    const wagonId = getCurrentWagonId();
    const wagonMeta = VAN_RIPER_WAGONS.find(w => w.id === wagonId);
    const activeStage = wagonMeta ? wagonMeta.page : 0;
    const completed = state.trainProgress.completed || [];

    document.querySelectorAll('.journey-node[data-journey-stage]').forEach(node => {
      const st = Number(node.getAttribute('data-journey-stage'));
      const stageWagons = VAN_RIPER_WAGONS.filter(w => w.page === st);
      const isStageDone = stageWagons.length > 0 && stageWagons.every(w => completed.includes(w.id));
      node.classList.toggle('stage-active', st === activeStage);
      node.classList.toggle('stage-done', isStageDone);
      node.setAttribute('aria-current', st === activeStage ? 'step' : 'false');
    });

    if (elements.journeyCargoDots) {
      let cur = cargoCurrent;
      let tot = cargoTotal;
      if (cur === null || tot === null) {
        if (wagonId === 'sonidos') {
          const list = getFilteredSonidosData();
          tot = Math.min(5, list.length || 1);
          cur = (state.activityIndex % (list.length || 1)) + 1;
        } else if (wagonId === 'palabras') {
          const list = getFilteredPalabrasData();
          tot = Math.min(5, list.length || 1);
          cur = ((state.activityIndex % (list.length || 1)) % tot) + 1;
        } else if (wagonId === 'trabalenguas') {
          const list = getFilteredTrabalenguasData();
          tot = list.length || 3;
          cur = (state.activityIndex % tot) + 1;
        } else if (wagonId === 'rimas') {
          tot = SpeechGamesData.RIMAS_DATA.length || 3;
          cur = (state.activityIndex % tot) + 1;
        } else if (wagonId === 'adivinanzas') {
          tot = SpeechGamesData.ADIVINANZAS_DATA.length || 3;
          cur = (state.activityIndex % tot) + 1;
        } else if (wagonId === 'pares') {
          const list = getFilteredPairsData();
          tot = list.length || 3;
          cur = (currentPairIndex % tot) + 1;
        } else {
          tot = 3;
          cur = 1;
        }
      }
      elements.journeyCargoDots.innerHTML = '';
      const dotCount = Math.max(1, Math.min(5, tot));
      const activeIndex = ((cur - 1) % dotCount);
      for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('span');
        dot.className = `journey-cargo-dot${i < activeIndex ? ' filled' : ''}${i === activeIndex ? ' current' : ''}`;
        elements.journeyCargoDots.appendChild(dot);
      }
    }
  }

  function launchWagonById(wagonId) {
    switch (wagonId) {
      case 'caritas':
        openPraxiaModal(getPrimaryCalibratedPhoneme(), () => {
          markWagonCompleted('caritas');
        });
        break;
      case 'pares':
        loadMinimalPair(0);
        break;
      case 'sonidos':
        loadExercise('sonidos', 0);
        break;
      case 'palabras':
        loadExercise('palabras', 0);
        break;
      case 'carrera':
        loadCarreraGame(0);
        break;
      case 'rimas':
        loadExercise('rimas', 0);
        break;
      case 'adivinanzas':
        loadExercise('adivinanzas', 0);
        break;
      case 'trabalenguas':
        loadExercise('trabalenguas', 0);
        break;
      case 'bingo':
        loadBingoGame(0);
        break;
      default:
        openPraxiaModal(getPrimaryCalibratedPhoneme());
    }
  }

  function advanceToNextVanRiperWagon() {
    const currentId = getCurrentWagonId();
    if (currentId) {
      markWagonCompleted(currentId);
    }
    const idx = VAN_RIPER_WAGONS.findIndex(w => w.id === currentId);
    const nextWagon = idx >= 0 ? VAN_RIPER_WAGONS[(idx + 1) % VAN_RIPER_WAGONS.length] : VAN_RIPER_WAGONS[0];
    audioEngine.stopSpeaking();
    audioEngine.playTrainWhistle();
    launchWagonById(nextWagon.id);
  }

  function syncCalibrationUI() {
    const checkboxes = document.querySelectorAll('input[name="calibPhoneme"]');
    checkboxes.forEach(cb => {
      cb.checked = state.clinicalProfile.phonemes.includes(cb.value);
    });
    if (elements.calibAgeGroup) {
      elements.calibAgeGroup.value = String(state.clinicalProfile.age || '4');
    }
    if (elements.calibAsrTolerance) {
      elements.calibAsrTolerance.value = String(state.clinicalProfile.asrTolerance || 2);
    }
  }

  syncCalibrationUI();

  /* --- PANTALLA CUS-01: CARGA DE EJERCICIOS FONO-LÚDICOS --- */
  function loadExercise(activityType, index = 0) {
    state.currentActivity = activityType;
    state.activityIndex = index;
    state.consecutiveFailures = 0; // Reinicia contador DDA
    elements.feedbackBadge.className = 'feedback-status-badge';
    elements.feedbackBadge.textContent = '';
    elements.btnSelfPlayback.disabled = true;

    if (activityType === 'sonidos') {
      const pool = getFilteredSonidosData();
      const data = pool[index % pool.length];
      state.activePhoneme = data.phoneme === 'clusters' ? 'l' : data.phoneme;
      elements.exerciseWord.textContent = data.anchorWord;
      elements.exercisePhoneme.textContent = data.isolatedCue || data.soundCue || data.anchorWord;
      elements.exerciseIcon.textContent = data.icon;
      elements.exercisePhrase.textContent = data.cueText || `¡Suena como ${data.anchorWord}!`;
      elements.avatarBalloon.textContent = `¡Escucha el sonido y repite "${data.anchorWord}"!`;

      elements.syllableStrip.innerHTML = '';
      const pureBtn = document.createElement('div');
      pureBtn.className = 'syllable-chip active-highlight';
      pureBtn.textContent = `🔊 ${data.isolatedCue || data.soundCue || 'Sonido'}`;
      pureBtn.style.cursor = 'pointer';
      pureBtn.onclick = () => {
        audioEngine.stopSpeaking();
        audioEngine.playPurePhoneme(state.activePhoneme);
      };
      elements.syllableStrip.appendChild(pureBtn);

      (data.syllables || []).forEach((syl, i) => {
        const chip = document.createElement('div');
        chip.className = 'syllable-chip';
        chip.textContent = syl;
        chip.id = `syl-${i}`;
        chip.style.cursor = 'pointer';
        chip.onclick = () => {
          audioEngine.stopSpeaking();
          audioEngine.speak(data.anchorWord);
        };
        elements.syllableStrip.appendChild(chip);
      });

      showScreen('screen-exercise', 'Sonidos y Sílabas');
      updateJourneyStrip((index % pool.length) + 1, pool.length);
      audioEngine.speak("¡Me encanta cómo practicas! Escucha cómo vuela mi sonido y repite conmigo.", () => {
        audioEngine.playPurePhoneme(state.activePhoneme, () => {
          audioEngine.speak(data.anchorWord);
        });
      });

    } else if (activityType === 'palabras') {
      const pool = getFilteredPalabrasData();
      const data = pool[index % pool.length];
      state.activePhoneme = data.phoneme;
      elements.exerciseWord.textContent = data.word;
      elements.exercisePhoneme.textContent = data.posLabel || data.positionLabel || 'Palabrita';
      elements.exerciseIcon.textContent = data.icon;
      elements.exercisePhrase.textContent = `¡Escucha y repite "${data.word}" en el micrófono!`;
      elements.avatarBalloon.textContent = `¡Escucha la palabra y repítela fuerte: "${data.word}"!`;

      elements.syllableStrip.innerHTML = '';
      (data.syllables || [data.word]).forEach((syl, i) => {
        const chip = document.createElement('div');
        chip.className = 'syllable-chip';
        chip.textContent = syl;
        chip.id = `syl-${i}`;
        chip.style.cursor = 'pointer';
        chip.onclick = () => {
          audioEngine.stopSpeaking();
          audioEngine.speak(data.word);
        };
        elements.syllableStrip.appendChild(chip);
      });

      showScreen('screen-exercise', 'Palabras Mágicas');
      updateJourneyStrip((index % Math.min(5, pool.length)) + 1, Math.min(5, pool.length));
      if (index === 0) {
        audioEngine.speak("¡Aquí estoy amiguito! Escucha la palabra y repítela conmigo. ¡Toca el gran botón del micrófono y dilo bien fuerte!", () => {
          audioEngine.speak(data.word);
        });
      } else {
        audioEngine.speak("¡Me encanta practicar palabras contigo!", () => {
          audioEngine.speak(data.word);
        });
      }

    } else if (activityType === 'trabalenguas') {
      const pool = getFilteredTrabalenguasData();
      const data = pool[index % pool.length];
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

      showScreen('screen-exercise', 'Trabalenguas Divertidos');
      updateJourneyStrip((index % pool.length) + 1, pool.length);
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
            markWagonCompleted('rimas');
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
      updateJourneyStrip((index % SpeechGamesData.RIMAS_DATA.length) + 1, SpeechGamesData.RIMAS_DATA.length);
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

      showScreen('screen-exercise', 'Adivinanzas Mágicas');
      updateJourneyStrip((index % SpeechGamesData.ADIVINANZAS_DATA.length) + 1, SpeechGamesData.ADIVINANZAS_DATA.length);
      audioEngine.speak(data.riddleText);
    }
  }

  // Repetición contextual de consigna por voz guiada por Ava (A.10 - H10)
  function repeatCurrentExercisePrompt() {
    audioEngine.playClick();
    if (state.currentActivity === 'sonidos') {
      const pool = getFilteredSonidosData();
      const data = pool[state.activityIndex % pool.length];
      if (data) {
        audioEngine.playPurePhoneme(state.activePhoneme, () => audioEngine.speak(data.anchorWord));
      }
    } else if (state.currentActivity === 'palabras') {
      const pool = getFilteredPalabrasData();
      const data = pool[state.activityIndex % pool.length];
      if (data) {
        audioEngine.speak("¡Aquí estoy amiguito! Escucha la palabra y repítela conmigo. ¡Toca el gran botón del micrófono y dilo bien fuerte!", () => {
          audioEngine.speak(data.word);
        });
      }
    } else if (state.currentActivity === 'trabalenguas') {
      const pool = getFilteredTrabalenguasData();
      const data = pool[state.activityIndex % pool.length];
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

        if (state.currentActivity === 'sonidos') {
          const pool = getFilteredSonidosData();
          const sonData = pool[state.activityIndex % pool.length];
          if (sonData) {
            currentTargetWord = sonData.anchorWord;
            acceptableTargets = [sonData.anchorWord, ...(sonData.syllables || [])];
          }
        } else if (state.currentActivity === 'palabras') {
          const pool = getFilteredPalabrasData();
          const palData = pool[state.activityIndex % pool.length];
          if (palData) {
            currentTargetWord = palData.word;
            acceptableTargets = [palData.word];
          }
        } else if (state.currentActivity === 'adivinanzas') {
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
          const pool = getFilteredTrabalenguasData();
          const trabData = pool[state.activityIndex % pool.length];
          if (trabData) {
            currentTargetWord = trabData.word;
            acceptableTargets = Array.isArray(trabData.acceptableTargets) && trabData.acceptableTargets.length
              ? trabData.acceptableTargets
              : [trabData.word];
          }
        }

        const evalContext = {
          context: state.currentActivity === 'sonidos' ? 'pure_sound' : (state.currentActivity === 'trabalenguas' ? 'continuous' : 'isolated'),
          phoneme: state.activePhoneme,
          activity: state.currentActivity,
          acceptableTargets: acceptableTargets,
          similarityThreshold: getAsrSimilarityThreshold()
        };
        const evaluation = audioEngine.evaluateSpeech(currentTargetWord, state.consecutiveFailures, evalContext);

        if (evaluation.verdict === 'APPROVED') {
          // ESCENARIO 1: ACIERTO FONÉTICO
          state.consecutiveFailures = 0;
          audioEngine.playSuccessFanfare();
          confetti.launch(70);
          updateStars(3);
          markWagonCompleted(state.currentActivity);
          window.dispatchEvent(new CustomEvent('ava-celebrate'));

          elements.feedbackBadge.className = 'feedback-status-badge status-approved active';
          elements.feedbackBadge.textContent = "⭐ ¡Fantástico! ¡Lo dijiste genial! ✨";
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
          elements.feedbackBadge.textContent = "🌟 ¡Qué gran esfuerzo amiguito! ¡Ganaste una estrella! 🐝✨";
          elements.micCaption.textContent = "¡Gran esfuerzo!";

          telemetry.addRecordedSample(currentTargetWord, `/${state.activePhoneme}/`, "DDA ASISTIDO", url, "tag-purple");

          // Despliega automáticamente la Praxia 2D y avanza asistido sin bloquear al menor con voz de estudio de Ava
          audioEngine.speak("¡qué gran esfuerzo amigo! mira en la pantalla cómo colocamos la lengua para que sea más fácil.", () => {
            openPraxiaModal(state.activePhoneme, () => {
              // Al cerrar praxia avanza asistido al siguiente estímulo dentro del mismo vagón
              loadExercise(state.currentActivity, state.activityIndex + 1);
            }, "¡Otro dibujito! ➡️");
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
    const pairsList = getFilteredPairsData();
    const pair = pairsList[currentPairIndex % pairsList.length];
    if (pair && pair.question) {
      audioEngine.speak(pair.question);
    }
  }
  window.repeatCurrentPairsPrompt = repeatCurrentPairsPrompt;

  function loadMinimalPair(index) {
    const pairsList = getFilteredPairsData();
    currentPairIndex = index % pairsList.length;
    const pair = pairsList[currentPairIndex];
    elements.pairQuestionText.textContent = pair.question;

    elements.pairWordCorrect.textContent = pair.correctOption.word;
    elements.pairIconCorrect.textContent = pair.correctOption.icon;
    elements.pairCueCorrect.textContent = pair.correctOption.soundCue;

    elements.pairWordFoil.textContent = pair.foilOption.word;
    elements.pairIconFoil.textContent = pair.foilOption.icon;
    elements.pairCueFoil.textContent = pair.foilOption.soundCue;

    elements.pairCardCorrect.className = 'pair-card';
    elements.pairCardFoil.className = 'pair-card';

    showScreen('screen-pairs', 'Parejas Sonoras');
    updateJourneyStrip(currentPairIndex + 1, pairsList.length);
    audioEngine.speak(pair.question);
  }

  elements.pairCardCorrect.addEventListener('click', () => {
    if (!canTouch()) return;
    audioEngine.stopSpeaking();
    const pairsList = getFilteredPairsData();
    const pair = pairsList[currentPairIndex % pairsList.length];
    elements.pairCardCorrect.classList.add('selected-correct');
    audioEngine.playSuccessFanfare();
    confetti.launch(50);
    updateStars(2);
    markWagonCompleted('pares');
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
    const pairsList = getFilteredPairsData();
    const pair = pairsList[currentPairIndex % pairsList.length];
    elements.pairCardFoil.classList.add('selected-comic');
    audioEngine.playGentleEncouragement();
    audioEngine.speak(pair.foilOption.comicFeedback);
  });

  /* --- PANTALLA: CAMINO DE FLORES 2D (RF-LUD-004 - Escenario Woodland Storybook) --- */
  let carreraCurrentStep = 0;

  const MEADOW_FLOWERS = [
    {
      x: 19,
      y: 70,
      scale: 1.24,
      sizeClass: 'flower-depth-foreground',
      species: 'daisy',
      name: "Flor Margarita",
      petalColor: "#42A5F5",
      petalLight: "#90CAF9",
      centerColor: "#FFD54F"
    },
    {
      x: 34,
      y: 34,
      scale: 0.96,
      sizeClass: 'flower-depth-distant',
      species: 'sunflower',
      name: "Flor Girasol",
      petalColor: "#FFA000",
      petalLight: "#FFEE58",
      centerColor: "#6D4C41"
    },
    {
      x: 50,
      y: 71,
      scale: 1.22,
      sizeClass: 'flower-depth-foreground',
      species: 'bellflower',
      name: "Flor Campanilla",
      petalColor: "#9C27B0",
      petalLight: "#E1BEE7",
      centerColor: "#FFE082"
    },
    {
      x: 64,
      y: 35,
      scale: 0.98,
      sizeClass: 'flower-depth-distant',
      species: 'rose',
      name: "Flor Rosa",
      petalColor: "#FF7043",
      petalLight: "#FFCCBC",
      centerColor: "#FFF59D"
    },
    {
      x: 75,
      y: 63,
      scale: 1.10,
      sizeClass: 'flower-depth-midground',
      species: 'orchid',
      name: "Flor Orquídea",
      petalColor: "#00897B",
      petalLight: "#80CBC4",
      centerColor: "#FFD54F"
    }
  ];

  function buildBotanicalFlowerSvg(flowerInfo, isCompleted) {
    let petalsMarkup = '';
    if (flowerInfo.species === 'sunflower') {
      const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
      petalsMarkup = `
        ${angles.map((a, i) => `
          <ellipse cx="36" cy="14" rx="4.6" ry="12" fill="${i % 2 === 0 ? flowerInfo.petalColor : flowerInfo.petalLight}" transform="rotate(${a} 36 28)"/>
        `).join('')}
        <circle cx="36" cy="28" r="10.5" fill="${flowerInfo.centerColor}" stroke="#4E342E" stroke-width="1.5"/>
        <circle cx="33" cy="25" r="1.4" fill="#FFD54F"/>
        <circle cx="39" cy="26" r="1.4" fill="#FFD54F"/>
        <circle cx="35" cy="31" r="1.4" fill="#FFD54F"/>
      `;
    } else if (flowerInfo.species === 'bellflower') {
      const angles = [0, 60, 120, 180, 240, 300];
      petalsMarkup = `
        ${angles.map(a => `
          <path d="M36,28 C28,16 31,9 36,9 C41,9 44,16 36,28 Z" fill="${flowerInfo.petalColor}" stroke="#6A1B9A" stroke-width="1" transform="rotate(${a} 36 28)"/>
          <ellipse cx="36" cy="17" rx="2.2" ry="5.5" fill="${flowerInfo.petalLight}" opacity="0.6" transform="rotate(${a} 36 28)"/>
        `).join('')}
        <circle cx="36" cy="28" r="7.5" fill="${flowerInfo.centerColor}" stroke="#F57F17" stroke-width="1.3"/>
      `;
    } else if (flowerInfo.species === 'rose') {
      const angles = [0, 72, 144, 216, 288];
      petalsMarkup = `
        ${angles.map(a => `
          <ellipse cx="36" cy="17" rx="9" ry="10.5" fill="${flowerInfo.petalColor}" stroke="#D84315" stroke-width="1" transform="rotate(${a} 36 28)"/>
        `).join('')}
        ${[36, 108, 180, 252, 324].map(a => `
          <ellipse cx="36" cy="20" rx="6.5" ry="7.5" fill="${flowerInfo.petalLight}" transform="rotate(${a} 36 28)"/>
        `).join('')}
        <circle cx="36" cy="28" r="7" fill="${flowerInfo.centerColor}" stroke="#FF8F00" stroke-width="1.3"/>
        <path d="M33 27 Q36 24 39 27 Q39 31 35 31" fill="none" stroke="#FF7043" stroke-width="1.4" stroke-linecap="round"/>
      `;
    } else if (flowerInfo.species === 'orchid') {
      petalsMarkup = `
        <ellipse cx="36" cy="15" rx="7" ry="11" fill="${flowerInfo.petalColor}" stroke="#00695C" stroke-width="1"/>
        <ellipse cx="22" cy="24" rx="11" ry="6.8" fill="${flowerInfo.petalColor}" stroke="#00695C" stroke-width="1" transform="rotate(-18 22 24)"/>
        <ellipse cx="50" cy="24" rx="11" ry="6.8" fill="${flowerInfo.petalColor}" stroke="#00695C" stroke-width="1" transform="rotate(18 50 24)"/>
        <ellipse cx="27" cy="36" rx="7.5" ry="9" fill="${flowerInfo.petalLight}" stroke="#00796B" stroke-width="1" transform="rotate(25 27 36)"/>
        <ellipse cx="45" cy="36" rx="7.5" ry="9" fill="${flowerInfo.petalLight}" stroke="#00796B" stroke-width="1" transform="rotate(-25 45 36)"/>
        <circle cx="36" cy="28" r="7.5" fill="${flowerInfo.centerColor}" stroke="#EF6C00" stroke-width="1.4"/>
      `;
    } else {
      // Margarita Azul layered botanical petals
      const angles = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];
      petalsMarkup = `
        ${angles.map((a, i) => `
          <ellipse cx="36" cy="14" rx="4.8" ry="12.5" fill="${i % 2 === 0 ? flowerInfo.petalColor : '#29B6F6'}" stroke="#1565C0" stroke-width="0.9" transform="rotate(${a} 36 28)"/>
          <ellipse cx="36" cy="16" rx="2.2" ry="7" fill="${flowerInfo.petalLight}" opacity="0.65" transform="rotate(${a} 36 28)"/>
        `).join('')}
        <circle cx="36" cy="28" r="8.8" fill="${flowerInfo.centerColor}" stroke="#F57F17" stroke-width="1.5"/>
        <circle cx="33.5" cy="25.5" r="2.2" fill="#FFF9C4" opacity="0.8"/>
      `;
    }

    return `
      <svg class="flower-svg-petals" viewBox="0 0 72 72" fill="none" aria-hidden="true">
        <!-- Base de césped y hojitas al pie -->
        <ellipse cx="36" cy="64" rx="17" ry="5" fill="#2E7D32" opacity="0.35"/>
        <path d="M36 62 C34 52, 37 42, 36 32" stroke="#2E7D32" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M35 56 C24 54, 18 46, 22 41 C27 42, 33 48, 35 56 Z" fill="#66BB6A" stroke="#2E7D32" stroke-width="1.4"/>
        <path d="M37 54 C48 52, 54 44, 50 39 C45 40, 39 46, 37 54 Z" fill="#4CAF50" stroke="#2E7D32" stroke-width="1.4"/>
        ${petalsMarkup}
        ${isCompleted ? `
          <g transform="translate(52, 10)">
            <circle cx="6" cy="6" r="8.5" fill="#FFB300" stroke="#FFFFFF" stroke-width="2"/>
            <path d="M2.5 6 L5 8.5 L9.8 3.5" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </g>
        ` : ''}
      </svg>
    `;
  }

  function loadCarreraGame(stepIndex = 0) {
    carreraCurrentStep = stepIndex % SpeechGamesData.CARRERA_DATA.length;
    const currentData = SpeechGamesData.CARRERA_DATA[carreraCurrentStep];

    elements.carreraStepBadge.textContent = `Flor ${currentData.step} de 5`;
    elements.carreraStationBadge.textContent = `🌸 ${currentData.word}`;
    elements.carreraStationIcon.textContent = currentData.icon;
    elements.carreraStationWord.textContent = currentData.word;
    elements.carreraStationInstruction.textContent = `¡Di "${currentData.word}"!`;
    elements.carreraMicCaption.textContent = "Toca para hablar";
    elements.btnCarreraMic.classList.remove('state-recording');

    // Renderiza indicadores visuales de avance en cabecera (5 flores)
    const progressDotsEl = document.getElementById('carreraProgressDots');
    if (progressDotsEl) {
      progressDotsEl.innerHTML = '';
      SpeechGamesData.CARRERA_DATA.forEach((_, idx) => {
        const dot = document.createElement('span');
        dot.className = `carrera-progress-petal${idx < carreraCurrentStep ? ' done' : ''}${idx === carreraCurrentStep ? ' current' : ''}`;
        dot.textContent = idx < carreraCurrentStep ? '✓' : (idx === carreraCurrentStep ? '🐝' : '🌸');
        progressDotsEl.appendChild(dot);
      });
    }

    // Renderiza las 5 flores botánicas en coordenadas 2D con perspectiva y Ava volando libre
    elements.riverStonesContainer.innerHTML = '';
    SpeechGamesData.CARRERA_DATA.forEach((s, idx) => {
      const flower = document.createElement('button');
      flower.type = 'button';
      const isCompleted = idx < carreraCurrentStep;
      const isActive = idx === carreraCurrentStep;
      const flowerInfo = MEADOW_FLOWERS[idx] || MEADOW_FLOWERS[0];

      flower.className = `meadow-flower-item ${flowerInfo.sizeClass} ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`;
      flower.style.left = `${flowerInfo.x}%`;
      flower.style.top = `${flowerInfo.y}%`;
      flower.style.transform = `translate(-50%, -50%) scale(${flowerInfo.scale})`;
      flower.setAttribute('aria-label', `${flowerInfo.name}: ${s.word}`);

      flower.innerHTML = `
        <div class="flower-ground-shadow" aria-hidden="true"></div>
        ${buildBotanicalFlowerSvg(flowerInfo, isCompleted)}
        ${isActive ? `
          <div class="ava-flying-bee" title="Ava volando sobre esta flor">
            <div class="ava-bee-avatar ava-container">
              ${avaEngine.generateSvg({ size: 66, mood: 'happy' })}
            </div>
            <div class="pollen-dust-ring" aria-hidden="true"></div>
          </div>
        ` : ''}
        <div class="flower-tag-label">
          <span class="flower-icon-badge" aria-hidden="true">${s.icon}</span>
          <span class="flower-name-text">${s.word}</span>
        </div>
      `;

      const stepNames = ['uno', 'dos', 'tres', 'cuatro', 'cinco'];
      const stepLabel = stepNames[s.step - 1] || s.step;
      flower.onclick = () => {
        if (!canTouch()) return;
        audioEngine.speak(`Flor ${stepLabel}: ¡${s.word}! Escucha y repite: ${s.word}.`);
      };

      elements.riverStonesContainer.appendChild(flower);
    });

    showScreen('screen-carrera', 'Camino de Flores');
    updateJourneyStrip(carreraCurrentStep + 1, SpeechGamesData.CARRERA_DATA.length);
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
        activity: 'carrera',
        similarityThreshold: getAsrSimilarityThreshold()
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
        markWagonCompleted('carrera');
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

  const carreraCardIllustrationEl = document.getElementById('carreraCardIllustration');
  if (carreraCardIllustrationEl) {
    carreraCardIllustrationEl.style.cursor = 'pointer';
    carreraCardIllustrationEl.addEventListener('click', () => {
      if (!canTouch()) return;
      const currentData = SpeechGamesData.CARRERA_DATA[carreraCurrentStep];
      audioEngine.speak(currentData.word);
    });
  }

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
            markWagonCompleted('bingo');
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
    updateJourneyStrip(bingoRoundIndex + 1, BINGO_ROUNDS.length);
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

  function syncPraxiaSoundPills(activeKey) {
    const pillsContainer = document.getElementById('praxiaSoundPills');
    if (!pillsContainer) return;
    pillsContainer.querySelectorAll('.praxia-sound-pill').forEach(btn => {
      const isMatch = (btn.dataset.sound || '').toLowerCase() === activeKey;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
    });
  }

  function syncPraxiaPlayPauseBtn() {
    if (!elements.btnPraxiaPlayPause || !praxiaCanvas) return;
    elements.btnPraxiaPlayPause.innerHTML = praxiaCanvas.isPlaying
      ? `<svg class="ui-icon-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg><span id="praxiaPlayPauseLabel">Pausar</span>`
      : `<svg class="ui-icon-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/></svg><span id="praxiaPlayPauseLabel">Reproducir</span>`;
  }

  function openPraxiaModal(soundKey = 'r', onCloseCallback = null, customExitLabel = null) {
    audioEngine.stopSpeaking();
    praxiaCallbackOnClose = onCloseCallback;
    const rawKey = (soundKey || 'r').toLowerCase();
    const key = SOUND_NARRATIONS[rawKey] ? rawKey : 'r';
    const narration = SOUND_NARRATIONS[key];

    praxiaCanvas.setPhoneme(key);
    if (!praxiaCanvas.isPlaying) {
      praxiaCanvas.togglePlay();
    }
    syncPraxiaPlayPauseBtn();

    if (elements.praxiaPhonemeSelect) {
      elements.praxiaPhonemeSelect.value = key;
    }
    syncPraxiaSoundPills(key);

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

  const praxiaSoundPillsEl = document.getElementById('praxiaSoundPills');
  if (praxiaSoundPillsEl) {
    praxiaSoundPillsEl.addEventListener('click', (e) => {
      const pill = e.target.closest('.praxia-sound-pill');
      if (!pill || !pill.dataset.sound) return;
      if (!canTouch()) return;
      openPraxiaModal(pill.dataset.sound, praxiaCallbackOnClose);
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
    syncPraxiaPlayPauseBtn();
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
    const checkedPhonemes = Array.from(document.querySelectorAll('input[name="calibPhoneme"]:checked')).map(el => el.value);
    if (!checkedPhonemes.length) {
      checkedPhonemes.push('r');
      const fallbackChk = document.querySelector('input[name="calibPhoneme"][value="r"]');
      if (fallbackChk) fallbackChk.checked = true;
    }

    const selectedAge = elements.calibAgeGroup ? String(elements.calibAgeGroup.value || '4') : '4';
    const selectedTol = elements.calibAsrTolerance ? Math.min(3, Math.max(1, Number(elements.calibAsrTolerance.value) || 2)) : 2;

    state.clinicalProfile = {
      phonemes: checkedPhonemes,
      age: selectedAge,
      asrTolerance: selectedTol
    };

    try {
      localStorage.setItem('bosque_clinical_profile', JSON.stringify(state.clinicalProfile));
    } catch (e) {}

    updateTrainVisualState();

    if (elements.calibSaveFeedback) {
      const tolLabels = { 1: 'Alta (3 años)', 2: 'Media (4 años)', 3: 'Estricta (5 años)' };
      elements.calibSaveFeedback.textContent = `✅ Calibración activa: ${checkedPhonemes.map(p => p === 'clusters' ? 'Sinfones' : `/${p}/`).join(', ')} · ${selectedAge} años · Tolerancia ${tolLabels[selectedTol]}.`;
      elements.calibSaveFeedback.style.display = 'block';
    }
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

  // Locomotora del Tren de Ava: solo toca el silbato y da el saludo amigable (no inicia ningún minijuego)
  if (elements.wagonLocomotive) {
    const playLocomotiveGreeting = () => {
      if (!canTouch()) return;
      audioEngine.stopSpeaking();
      audioEngine.playTrainWhistle();
      elements.wagonLocomotive.classList.remove('ava-touch-wiggle');
      void elements.wagonLocomotive.offsetWidth;
      elements.wagonLocomotive.classList.add('ava-touch-wiggle');
      setTimeout(() => elements.wagonLocomotive.classList.remove('ava-touch-wiggle'), 600);
      setTimeout(() => {
        audioEngine.speak("¡Chu chú! Toca un vagón para jugar.");
      }, 280);
    };
    elements.wagonLocomotive.addEventListener('click', playLocomotiveGreeting);
    elements.wagonLocomotive.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playLocomotiveGreeting();
      }
    });
  }

  /* --- CARRUSEL PAGINADO DEL TREN VAN RIPER (4 ESTACIONES: 3 + 3 + 2 + 2 VAGONES) --- */
  const trainTrackContainer = document.getElementById('trainTrackContainer');
  const btnTrainPrev = document.getElementById('btnTrainPrev');
  const btnTrainNext = document.getElementById('btnTrainNext');
  const trainStationDots = document.querySelectorAll('.train-station-dot');
  const allTrainWagons = document.querySelectorAll('.train-wagon-card[data-train-page]');
  let currentTrainPage = 0;
  const MAX_TRAIN_PAGE = 3;
  let suppressTrainSwipeClick = false;

  // Clips de estudio 44.1 kHz validados para guía Voice-First al cambiar de estación
  const STATION_VOICE_PROMPTS = {
    0: "¡Hola! Toca un vagón para jugar.",
    1: "¡Me encanta cómo practicas! Escucha cómo vuela mi sonido y repite conmigo.",
    2: "¡Hola amiguito! ¡Sigue jugando en el bosque sonoro!",
    3: "¡Hola amiguito! Bienvenido al bosque sonoro. ¡Toca un vagón para empezar a jugar!"
  };

  function setTrainPage(nextPage, playSound = true) {
    const clampedPage = Math.max(0, Math.min(MAX_TRAIN_PAGE, Number(nextPage) || 0));
    const direction = clampedPage >= currentTrainPage ? 'next' : 'prev';
    currentTrainPage = clampedPage;

    if (trainTrackContainer) {
      trainTrackContainer.setAttribute('data-active-page', String(clampedPage));
      trainTrackContainer.classList.remove('anim-slide-next', 'anim-slide-prev');
      // Forzar reflow ligero para reiniciar animación de rodaje sobre rieles
      void trainTrackContainer.offsetWidth;
      trainTrackContainer.classList.add(direction === 'next' ? 'anim-slide-next' : 'anim-slide-prev');
    }

    if (elements.trainConvoyHitchLeft) {
      elements.trainConvoyHitchLeft.hidden = clampedPage <= 0;
    }

    allTrainWagons.forEach((wagon) => {
      const wagonPage = Number(wagon.getAttribute('data-train-page'));
      const isVisible = wagonPage === clampedPage;
      wagon.hidden = !isVisible;
      wagon.classList.toggle('wagon-page-visible', isVisible);
    });

    if (btnTrainPrev) {
      btnTrainPrev.classList.toggle('is-hidden', clampedPage <= 0);
      btnTrainPrev.disabled = clampedPage <= 0;
    }

    if (btnTrainNext) {
      btnTrainNext.classList.toggle('is-hidden', clampedPage >= MAX_TRAIN_PAGE);
      btnTrainNext.disabled = clampedPage >= MAX_TRAIN_PAGE;
    }

    trainStationDots.forEach((dot) => {
      const dotPage = Number(dot.getAttribute('data-target-page'));
      const isActive = dotPage === clampedPage;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (playSound) {
      audioEngine.stopSpeaking();
      audioEngine.playClick();
      audioEngine.playChime();
      const stationPrompt = STATION_VOICE_PROMPTS[clampedPage];
      if (stationPrompt) {
        audioEngine.speak(stationPrompt);
      }
    }
  }

  if (btnTrainPrev) {
    btnTrainPrev.addEventListener('click', () => {
      if (!canTouch()) return;
      if (currentTrainPage > 0) {
        setTrainPage(currentTrainPage - 1, true);
      }
    });
  }

  if (btnTrainNext) {
    btnTrainNext.addEventListener('click', () => {
      if (!canTouch()) return;
      if (currentTrainPage < MAX_TRAIN_PAGE) {
        setTrainPage(currentTrainPage + 1, true);
      }
    });
  }

  trainStationDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      if (!canTouch()) return;
      const targetPage = Number(dot.getAttribute('data-target-page'));
      if (!Number.isNaN(targetPage) && targetPage !== currentTrainPage) {
        setTrainPage(targetPage, true);
      }
    });
  });

  // Gesto táctil horizontal (Swipe izquierda/derecha) sobre el escenario del tren
  if (elements.trainStageViewport) {
    let swipeStartX = 0;
    let swipeStartY = 0;
    let trackingSwipe = false;

    elements.trainStageViewport.addEventListener('pointerdown', (e) => {
      swipeStartX = e.clientX;
      swipeStartY = e.clientY;
      trackingSwipe = true;
    }, { passive: true });

    elements.trainStageViewport.addEventListener('pointerup', (e) => {
      if (!trackingSwipe) return;
      trackingSwipe = false;
      const dx = e.clientX - swipeStartX;
      const dy = e.clientY - swipeStartY;
      if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        if (dx < 0 && currentTrainPage < MAX_TRAIN_PAGE) {
          suppressTrainSwipeClick = true;
          setTrainPage(currentTrainPage + 1, true);
          setTimeout(() => { suppressTrainSwipeClick = false; }, 160);
        } else if (dx > 0 && currentTrainPage > 0) {
          suppressTrainSwipeClick = true;
          setTrainPage(currentTrainPage - 1, true);
          setTimeout(() => { suppressTrainSwipeClick = false; }, 160);
        }
      }
    }, { passive: true });
  }

  // Navegación por la Mini-Vía Transversal del Tren dentro de actividades
  if (elements.trainJourneyStrip) {
    elements.trainJourneyStrip.querySelectorAll('.journey-node[data-journey-stage]').forEach((node) => {
      node.addEventListener('click', () => {
        if (!canTouch()) return;
        const targetStage = Number(node.getAttribute('data-target-page'));
        audioEngine.stopSpeaking();
        audioEngine.playClick();
        showScreen('screen-menu', 'Bosque Sonoro Amigable');
        setTrainPage(targetStage, true);
      });
    });
  }

  if (elements.btnJourneyNextWagon) {
    elements.btnJourneyNextWagon.addEventListener('click', () => {
      if (!canTouch()) return;
      advanceToNextVanRiperWagon();
    });
  }

  // Inicializar estado de la Estación 0 del tren y estrellas/guía de progreso
  setTrainPage(0, false);
  updateTrainVisualState();

  function bindWagonCardActivation(el, handler) {
    if (!el) return;
    el.addEventListener('click', () => {
      if (suppressTrainSwipeClick || !canTouch()) return;
      handler();
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!canTouch()) return;
        handler();
      }
    });
  }

  bindWagonCardActivation(elements.wagonCaritas, () => {
    openPraxiaModal(getPrimaryCalibratedPhoneme(), () => {
      markWagonCompleted('caritas');
    });
  });

  bindWagonCardActivation(elements.btnOpenPairs, () => {
    loadMinimalPair(0);
  });

  bindWagonCardActivation(elements.wagonSonidos, () => {
    loadExercise('sonidos', 0);
  });

  bindWagonCardActivation(elements.wagonPalabras, () => {
    loadExercise('palabras', 0);
  });

  bindWagonCardActivation(elements.wagonCarrera, () => {
    loadCarreraGame(0);
  });

  bindWagonCardActivation(elements.wagonRimas, () => {
    loadExercise('rimas', 0);
  });

  bindWagonCardActivation(elements.wagonAdivinanzas, () => {
    loadExercise('adivinanzas', 0);
  });

  bindWagonCardActivation(elements.wagonTrabalenguas, () => {
    loadExercise('trabalenguas', 0);
  });

  bindWagonCardActivation(elements.wagonBingo, () => {
    loadBingoGame(0);
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
