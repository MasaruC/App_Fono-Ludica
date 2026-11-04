/* ==========================================================================
   TELEMETRY EVALUATION ENGINE v3.0 - MODO EVALUACIÓN MICRO-SCED (ACTIVIDAD 10)
   Fundamentación Científica (9-10 Fuentes del Estado del Arte):
   - Evaluación Tripartita y PSSUQ (1-7) / Heurísticas Nielsen (0-4) / Emojis (≥90%):
     Saeedi et al. (2024, Nature Scientific Reports)
   - Diseño de Caso Único (SCED), Target Accuracy y Concordancia ASR vs. Humano:
     Strömbergsson et al. (2025/2026, IJLCD)
   - Escala MARS (1-5, meta ≥4.2) y Ausencia de Schwa [ə]:
     Furlong et al. (2018, PLOS ONE)
   - Adaptación Motriz Pediátrica (Targets ≥48x48 dp y Franja Palmar):
     Liu, Chen & Razak (2026, MDPI) & Du et al. (2023)
   - Ficha de Laura Bosch y María Melgar (Posiciones I/M/F y PSF O/S/D):
     Pucuhuaranga (2016) & Peña et al. (2024, Nature npj Science of Learning)
   - Alertas Fonológicas Docentes en Lima Metropolitana:
     Huertas & Roque (2023, PUCP)
   - Exportación preparada para Kruskal-Wallis / U de Mann-Whitney (p < 0.05):
     Mora Espinoza et al. (2024)
   ========================================================================== */

const BOSCH_MELGAR_LOOKUP = {
  "lápiz": { phoneme: "/l/", pos: "Inicial", category: "isolated" },
  "lapiz": { phoneme: "/l/", pos: "Inicial", category: "isolated" },
  "pelota": { phoneme: "/l/", pos: "Medial", category: "isolated" },
  "sol": { phoneme: "/l/ - /s/", pos: "Final / Inicial", category: "isolated" },
  "luna": { phoneme: "/l/", pos: "Inicial", category: "isolated" },
  "león": { phoneme: "/l/", pos: "Inicial", category: "isolated" },
  "ratón": { phoneme: "/rr/", pos: "Inicial", category: "isolated" },
  "rana": { phoneme: "/rr/", pos: "Inicial", category: "isolated" },
  "pera": { phoneme: "/r/", pos: "Medial", category: "isolated" },
  "perro": { phoneme: "/rr/", pos: "Medial", category: "isolated" },
  "carro": { phoneme: "/rr/", pos: "Medial", category: "isolated" },
  "guitarra": { phoneme: "/rr/", pos: "Medial", category: "isolated" },
  "collar": { phoneme: "/r/", pos: "Final", category: "isolated" },
  "mar": { phoneme: "/r/", pos: "Final", category: "isolated" },
  "sapo": { phoneme: "/s/", pos: "Inicial", category: "isolated" },
  "vaso": { phoneme: "/s/", pos: "Medial", category: "isolated" },
  "mesa": { phoneme: "/s/", pos: "Medial", category: "isolated" },
  "casa": { phoneme: "/k/ - /s/", pos: "Inicial / Medial", category: "isolated" },
  "boca": { phoneme: "/k/", pos: "Medial", category: "isolated" },
  "conejo": { phoneme: "/k/", pos: "Inicial", category: "isolated" },
  "gato": { phoneme: "/g/", pos: "Inicial", category: "isolated" },
  "pato": { phoneme: "/p/", pos: "Inicial", category: "isolated" },
  "bota": { phoneme: "/b/", pos: "Inicial", category: "isolated" },
  "abeja": { phoneme: "/b/", pos: "Medial", category: "isolated" },
  "dedo": { phoneme: "/d/", pos: "Inicial", category: "isolated" },
  "foca": { phoneme: "/f/", pos: "Inicial", category: "isolated" },
  "fresa": { phoneme: "/fr/", pos: "Inicial (Sinfón)", category: "isolated" },
  "plátano": { phoneme: "/pl/", pos: "Inicial (Sinfón)", category: "isolated" },
  "plato": { phoneme: "/pl/", pos: "Inicial (Sinfón)", category: "isolated" },
  "tren": { phoneme: "/tr/", pos: "Inicial (Sinfón)", category: "isolated" },
  "globo": { phoneme: "/gl/", pos: "Inicial (Sinfón)", category: "isolated" },
  "flor": { phoneme: "/fl/", pos: "Inicial (Sinfón)", category: "isolated" },
  "dragón": { phoneme: "/dr/", pos: "Inicial (Sinfón)", category: "isolated" }
};

const DEFAULT_NIELSEN_HEURISTICS = [
  { id: "H01", name: "H01: Visibilidad del estado del sistema", desc: "Ondas reactivas (<300 ms) y animación de escucha de Ava.", severity: 0.5, critical: false },
  { id: "H02", name: "H02: Relación entre el sistema y el mundo real", desc: "Metáfora del bosque, tren de juguetes y espejo lingual en español de Lima.", severity: 0.25, critical: false },
  { id: "H03", name: "H03: Control y libertad del usuario", desc: "Crítica en Saeedi et al. (2024). Botón Home (≥56 px) y salida clara en modal de Praxias 2D.", severity: 0.75, critical: true },
  { id: "H04", name: "H04: Consistencia y estándares", desc: "Micrófono central (90 px) fijo y separación asimétrica niño/adulto.", severity: 0.25, critical: false },
  { id: "H05", name: "H05: Prevención de errores (Meta < 1.0)", desc: "Más severa en Saeedi et al. (3.83/4.0). Franja palmar (56 dp), debounce 80 ms, Tap-to-Talk y MathGate.", severity: 0.75, critical: true },
  { id: "H06", name: "H06: Reconocer antes que recordar", desc: "Interfaz 100% No Textual con pictogramas e instrucciones habladas (read-aloud).", severity: 0.25, critical: false },
  { id: "H07", name: "H07: Flexibilidad y eficiencia de uso", desc: "Rescate automático DDA al 3.er fallo y Modo CVI de alto contraste.", severity: 0.5, critical: false },
  { id: "H08", name: "H08: Diseño estético y minimalista", desc: "Entorno biofílico limpio, cero anuncios comerciales (Du et al., 2023).", severity: 0.25, critical: false },
  { id: "H09", name: "H09: Ayuda para reconocer y recuperarse de errores", desc: "Cero castigo; estrella de esfuerzo y modelado lingual 2D (Strömbergsson et al., 2025).", severity: 0.5, critical: false },
  { id: "H10", name: "H10: Ayuda y documentación", desc: "Repetición oral al tocar a Ava y tooltips docentes en Dashboard TEPROSIF-R.", severity: 0.5, critical: false }
];

const PSSUQ_ITEMS_CONFIG = [
  { id: "P01", subscale: "systemUsefulness", tag: "Utilidad", text: "Estoy satisfecho con lo fácil que es utilizar 'Bosque Sonoro' con niños preescolares.", score: 6 },
  { id: "P02", subscale: "systemUsefulness", tag: "Utilidad", text: "Pude superar la compuerta MathGate y configurar la sesión con rapidez y sin fricciones.", score: 7 },
  { id: "P03", subscale: "systemUsefulness", tag: "Utilidad", text: "El niño pudo navegar por los vagones y realizar los ejercicios vocales sin saber leer.", score: 6 },
  { id: "P04", subscale: "infoQuality", tag: "Información", text: "Los reportes de PSF (Omisión, Sustitución, Distorsión) y TEPROSIF-R responden a las alertas reales del aula (Huertas & Roque, 2023).", score: 6 },
  { id: "P05", subscale: "infoQuality", tag: "Información", text: "Ante 3 fallos seguidos, la explicación hablada y la praxia 2D ayudan claramente a colocar la lengua.", score: 7 },
  { id: "P06", subscale: "interfaceQuality", tag: "Interfaz (≥6.25)", text: "El diseño visual (botones ≥48 dp, colores del bosque y Modo CVI) es muy agradable y adecuado para 3 a 5 años.", score: 7 },
  { id: "P07", subscale: "interfaceQuality", tag: "Interfaz (≥6.25)", text: "La disposición de la pantalla y la voz cálida de Ava (sin voz robótica ni castigos) son excelentes.", score: 6 },
  { id: "P08", subscale: "overall", tag: "Global", text: "En términos generales, estoy muy satisfecho con esta aplicación como apoyo fono-lúdico.", score: 6 }
];

const MARS_DIMENSIONS_CONFIG = [
  { id: "engagement", name: "A. Compromiso (Engagement)", benchmark: 3.5, desc: "Interés lúdico, personalización en Cueva del Avatar y recompensas al esfuerzo.", score: 4.5 },
  { id: "functionality", name: "B. Funcionalidad (Functionality)", benchmark: 4.0, desc: "Bucle contingente <300 ms, respuesta táctil Tap-to-Talk y fluidez entre vagones.", score: 4.5 },
  { id: "aesthetics", name: "C. Estética (Aesthetics)", benchmark: 3.8, desc: "Calidad vectorial, praxias 2D a 60 FPS y contraste WCAG 2.2 AA / CVI AAA.", score: 4.5 },
  { id: "information", name: "D. Información Clínica (Information)", benchmark: 3.4, desc: "Modelo Van Riper, palabras Bosch & Melgar, TEPROSIF-R y ausencia de schwa [ə].", score: 4.2 }
];

const EMOJI_QUESTIONS_CONFIG = [
  {
    id: "visualAppeal",
    badge: "Pregunta 1 de 3 • Atracción Visual",
    title: "¿Te gustaron los dibujos del bosque y de la abejita Ava?",
    spokenPrompt: "¡Qué lindo jugamos hoy! Dime amiguito: ¿Te gustaron los dibujos del bosque y de la abejita Ava? Toca una carita.",
    options: [
      { value: 1, emoji: "🙁", label: "No me gustó", positive: false, toneClass: "emoji-opt-low" },
      { value: 2, emoji: "😐", label: "Más o menos", positive: false, toneClass: "emoji-opt-mid" },
      { value: 3, emoji: "😊", label: "¡Sí, mucho!", positive: true, toneClass: "emoji-opt-high" }
    ]
  },
  {
    id: "emotionalComfort",
    badge: "Pregunta 2 de 3 • Reacción Emocional",
    title: "¿Cómo te sentiste hablando por el botón grande?",
    spokenPrompt: "¿Y cómo te sentiste hablando por el botón verde grande? Toca la carita que sientes.",
    options: [
      { value: 1, emoji: "🙁", label: "Cansado", positive: false, toneClass: "emoji-opt-low" },
      { value: 2, emoji: "😐", label: "Normal", positive: false, toneClass: "emoji-opt-mid" },
      { value: 3, emoji: "😄", label: "¡Muy feliz!", positive: true, toneClass: "emoji-opt-high" }
    ]
  },
  {
    id: "playAgainIntent",
    badge: "Pregunta 3 de 3 • Intención de Jugar",
    title: "¿Quieres volver a jugar otro día con los vagones de Ava?",
    spokenPrompt: "Última preguntita: ¿Quieres volver a jugar otro día con los vagones de Ava?",
    options: [
      { value: 1, emoji: "🙁", label: "No quiero", positive: false, toneClass: "emoji-opt-low" },
      { value: 2, emoji: "😐", label: "No sé", positive: false, toneClass: "emoji-opt-mid" },
      { value: 3, emoji: "🤩", label: "¡Sí quiero!", positive: true, toneClass: "emoji-opt-high" }
    ]
  }
];

class TelemetryEvalEngine {
  constructor(options = {}) {
    this.isRemoteConsole = !!options.isRemoteConsole;
    this.isActive = false;
    this.session = {
      sessionId: "SCED-20261101-P01",
      participantId: "P01",
      childPseudonym: "Mateo",
      childAge: 4,
      condition: "Rotacismo (/r/, /rr/)",
      mediatorRole: "Docente de Educación Inicial (Lima Metropolitana)",
      evaluatorGroup: "Equipo G7 FISI-UNMSM (Piloto Acotado Autofinanciado)",
      visualMode: "standard_biophilic",
      teacherClassroomNotes: "Se requieren reportes visuales claros de Omisión y Sustitución para informar a los padres en aula de inicial.",
      startTimeMs: 0,
      endTimeMs: 0,
      startTimestampIso: "",
      endTimestampIso: "",
      totalDurationSec: 0
    };

    // Escalas psicométricas y heurísticas (editables en tiempo real)
    this.nielsenHeuristics = JSON.parse(JSON.stringify(DEFAULT_NIELSEN_HEURISTICS));
    this.schwaAntipatternDetected = false;
    this.pssuqItems = JSON.parse(JSON.stringify(PSSUQ_ITEMS_CONFIG));
    this.marsDimensions = JSON.parse(JSON.stringify(MARS_DIMENSIONS_CONFIG));

    // Respuestas del Cuestionario Pictórico con Emojis (Saeedi et al., 2024)
    this.emojiAnswers = {
      visualAppeal: 3,
      emotionalComfort: 3,
      playAgainIntent: 3
    };
    this.currentEmojiStep = 0;

    // Telemetría de tareas, toques, latencias y fonaciones
    this.tasks = [];
    this.currentTask = null;
    this.taskCounter = 1;
    this.touchStats = {
      totalTouches: 0,
      validTargetTouches: 0,
      palmTouchesFiltered: 0,
      palmFalseActivations: 0,
      missTouches: 0
    };
    this.avclSamplesMs = [114];
    this.phonations = [];
    this.detailedEventsLog = [];

    // MathGate tracking
    this.mathGateOpenTimeMs = 0;
    this.mathGateStats = {
      tctSec: 3.6,
      attempts: 1,
      solved: true
    };

    // KPIs consolidados (Los 12 KPIs fundamentados)
    this.kpis = this.getEmptyKpis();

    // Control interno de tiempos, disparadores y sincronización remota (Zero-HUD)
    this.lastInstructionAudioEndTime = 0;
    this.firstTouchRegisteredForCurrentTask = false;
    this.headerTapCount = 0;
    this.lastHeaderTapTime = 0;
    this.activeReportTab = "resumen";

    // Puente de sincronización remota (Dispositivo Infantil <-> App Remota Evaluador)
    this.roomCode = "G7-P01";
    this.connectedPeers = 1;
    this.lanIp = "";
    this.broadcastChannel = null;
    this.sseSource = null;

    this.loadSavedState();
    this.calculateConsolidatedKPIs();
    if (!this.isRemoteConsole) {
      this.initGlobalListeners();
      this.initRemoteSyncBridge();
    }
  }

  getEmptyKpis() {
    return {
      // Bloque 1: Usabilidad Técnica y Adaptación Motriz (Liu et al., 2026; Saeedi et al., 2024)
      saPercent: 100,
      caPercent: 0,
      ncPercent: 0,
      ttftAvgSec: 1.8,
      tctAvgSec: 18.4,
      avclAvgMs: 114,
      tmrPercent: 8.5,
      targetHitPercent: 91.5,
      palmTouchesFiltered: 0,
      palmFalseActivations: 0,
      // Bloque 2: Precisión Fonética SCED, PSF y Calibración ASR (Strömbergsson et al., 2025; Pucuhuaranga, 2016)
      targetAccuracyOverallPct: 0,
      targetAccuracyIsolatedPct: 0,
      targetAccuracyContinuousPct: 0,
      psfOmissions: 0,
      psfSubstitutions: 0,
      psfDistortions: 0,
      asrHumanAgreementPct: 100,
      asrFalsePositives: 0,
      asrFalseNegatives: 0,
      ddaActivationsCount: 0,
      apedAvgSec: 1.72,
      // Bloque 3: Instrumentos Estandarizados (Saeedi et al., 2024; Furlong et al., 2018)
      nielsenMeanSeverity: 0.45,
      nielsenH5Severity: 0.75,
      nielsenH3Severity: 0.75,
      emojiAcceptancePct: 100,
      pssuqOverallMean: 6.38,
      pssuqSystemUsefulness: 6.33,
      pssuqInfoQuality: 6.50,
      pssuqInterfaceQuality: 6.50,
      marsTotalScore: 4.43,
      mathGateTctSec: 3.6
    };
  }

  loadSavedState() {
    try {
      const saved = localStorage.getItem('bosque_sced_last_session_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nielsenHeuristics) this.nielsenHeuristics = parsed.nielsenHeuristics;
        if (parsed.pssuqItems) this.pssuqItems = parsed.pssuqItems;
        if (parsed.marsDimensions) this.marsDimensions = parsed.marsDimensions;
        if (Array.isArray(parsed.phonations) && parsed.phonations.length > 0) {
          this.phonations = parsed.phonations;
        }
        if (parsed.session) {
          this.session = { ...this.session, ...parsed.session };
        }
      }
    } catch (e) {
      // Ignorar errores de almacenamiento restringido
    }
  }

  persistState() {
    try {
      localStorage.setItem('bosque_sced_last_session_v3', JSON.stringify({
        session: this.session,
        nielsenHeuristics: this.nielsenHeuristics,
        pssuqItems: this.pssuqItems,
        marsDimensions: this.marsDimensions,
        phonations: this.phonations,
        kpis: this.kpis,
        savedAt: new Date().toISOString()
      }));
    } catch (e) {}
  }

  /* ==========================================================================
     1. ACTIVACIÓN DISCRETA (CTRL+ALT+E, TRIPLE TAP EN AVA O PORTAL ADULTO)
     ========================================================================== */
  initGlobalListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.altKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        this.handleTriggerAction();
      }
    });

    // Sincronización exacta con el fin de locución de Ava para medir TTFT (KPI-02)
    window.addEventListener('ava-speech-end', () => {
      this.notifyInstructionAudioEnded();
    });

    // Captura global ergonómica (Objetivos ≥48 dp, TMR y Zona Palmar)
    window.addEventListener('pointerdown', (e) => {
      this.handleGlobalPointerDown(e);
    }, { capture: true });
  }

  /* ==========================================================================
     1B. PUENTE DE SINCRONIZACIÓN REMOTA (ZERO-HUD EN PANTALLA DEL NIÑO)
     Conecta index.html (Dispositivo Infantil) <-> evaluador.html (App Remota)
     mediante BroadcastChannel + LocalStorage + Relay SSE/POST en Red Local Wi-Fi
     ========================================================================== */
  initRemoteSyncBridge() {
    this.roomCode = `G7-${this.session.participantId || 'P01'}`.toUpperCase();

    // Canal 1: BroadcastChannel nativo (misma máquina / múltiples pestañas o ventanas)
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('bosque_sced_remote_v3');
        this.broadcastChannel.onmessage = (ev) => {
          if (ev && ev.data) this.handleRemoteMessage(ev.data);
        };
      } catch (e) {}
    }

    // Canal 2: Eventos storage de respaldo entre ventanas
    window.addEventListener('storage', (ev) => {
      if (ev.key === 'bosque_sced_remote_cmd_v3' && ev.newValue) {
        try {
          const msg = JSON.parse(ev.newValue);
          this.handleRemoteMessage(msg);
        } catch (e) {}
      }
    });

    // Autodescubrir IP LAN local del servidor Vite para mostrar URL exacta para celulares
    if (typeof fetch === 'function') {
      const base = this.getServerBaseUrl();
      fetch(`${base}/api/sced-info`)
        .then(r => r.ok ? r.json() : null)
        .then(info => {
          if (info && Array.isArray(info.lanIps) && info.lanIps.length > 0) {
            this.lanIp = info.lanIps[0];
            this.updateRemoteUrlDisplay();
          }
        })
        .catch(() => {});
    }

    // Canal 3: Stream SSE en tiempo real para conectar dispositivos físicos por Wi-Fi
    this.connectSseRoom(this.roomCode);

    // Si ya existe un servidor guardado en el APK, avisar de inmediato que el dispositivo está online
    if (this.hasCustomServer()) {
      setTimeout(() => this.broadcastStateSnapshot('DEVICE_ONLINE'), 1200);
    }
  }

  getCurrentServerOrigin() {
    return localStorage.getItem('bosque_sced_server_origin') || (this.lanIp ? `http://${this.lanIp}:5173` : '');
  }

  hasCustomServer() {
    return Boolean(localStorage.getItem('bosque_sced_server_origin'));
  }

  getServerBaseUrl() {
    const saved = localStorage.getItem('bosque_sced_server_origin');
    if (saved) return saved.replace(/\/$/, '');
    if (window.location.port === '5173') return '';
    if (this.lanIp) return `http://${this.lanIp}:5173`;
    return '';
  }

  connectSseRoom(roomCode) {
    const cleanRoom = String(roomCode || 'G7-P01').toUpperCase().trim();
    this.roomCode = cleanRoom;

    if (this.sseSource) {
      try { this.sseSource.close(); } catch (e) {}
      this.sseSource = null;
    }

    if (typeof EventSource === 'undefined') return;

    try {
      const base = this.getServerBaseUrl();
      const es = new EventSource(`${base}/api/sced-sync?room=${encodeURIComponent(cleanRoom)}`);
      this.sseSource = es;

      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data.type === 'PEER_COUNT' || data.type === 'CONNECTED') {
            this.connectedPeers = data.peers || 1;
            this.updateRemoteUrlDisplay();
          } else {
            this.handleRemoteMessage(data);
          }
        } catch (err) {}
      };

      es.onerror = () => {
        // Silencioso si se ejecuta sin servidor node (ej. archivo estático o APK offline)
      };
    } catch (e) {}
  }

  getRemoteEvaluatorUrl() {
    const custom = localStorage.getItem('bosque_sced_server_origin');
    if (custom) {
      return `${custom.replace(/\/$/, '')}/evaluador.html?room=${encodeURIComponent(this.roomCode)}`;
    }
    const protocol = window.location.protocol && window.location.protocol.startsWith('http') ? window.location.protocol : 'http:';
    const port = window.location.port ? `:${window.location.port}` : ':5173';
    const host = this.lanIp || (window.location.hostname && window.location.hostname !== 'localhost' ? window.location.hostname : '192.168.18.10');
    const basePath = (window.location.pathname || '').replace(/\/index\.html$/i, '').replace(/\/$/, '');
    return `${protocol}//${host}${port}${basePath}/evaluador.html?room=${encodeURIComponent(this.roomCode)}`;
  }

  openRemoteEvaluatorWindow() {
    const url = `evaluador.html?room=${encodeURIComponent(this.roomCode)}`;
    window.open(url, 'BosqueSonoroRemoteEvaluator', 'width=480,height=860,menubar=no,toolbar=no,location=no,status=no');
    setTimeout(() => this.broadcastStateSnapshot('REMOTE_WINDOW_OPENED'), 450);
  }

  updateRemoteUrlDisplay() {
    const urlEl = document.getElementById('evalRemoteUrlText');
    if (urlEl) urlEl.textContent = this.getRemoteEvaluatorUrl();

    const roomBadge = document.getElementById('evalRoomCodeBadge');
    if (roomBadge) roomBadge.textContent = `Sala: ${this.roomCode}`;

    const peerStatus = document.getElementById('evalPeerStatusBadge');
    if (peerStatus) {
      if (this.connectedPeers > 1) {
        peerStatus.className = 'eval-peer-status';
        peerStatus.textContent = `🟢 App Remota Conectada (${this.connectedPeers} disp.)`;
      } else {
        peerStatus.className = 'eval-peer-status waiting';
        peerStatus.textContent = '📡 Lista para conectar desde otro dispositivo';
      }
    }
  }

  buildRemoteStatePayload(triggerEvent = 'STATE_UPDATE') {
    this.calculateConsolidatedKPIs();
    return {
      roomCode: this.roomCode,
      triggerEvent,
      isActive: this.isActive,
      session: this.session,
      currentTask: this.currentTask,
      tasks: this.tasks,
      touchStats: this.touchStats,
      phonations: this.phonations,
      emojiAnswers: this.emojiAnswers,
      currentEmojiStep: this.currentEmojiStep,
      kpis: this.kpis,
      nielsenHeuristics: this.nielsenHeuristics,
      schwaAntipatternDetected: this.schwaAntipatternDetected,
      pssuqItems: this.pssuqItems,
      marsDimensions: this.marsDimensions,
      recentEvents: this.detailedEventsLog.slice(-25),
      updatedAtIso: new Date().toISOString()
    };
  }

  broadcastStateSnapshot(triggerEvent = 'STATE_UPDATE') {
    this.persistState();
    if (this.isRemoteConsole) return;
    const packet = {
      type: 'STATE_SNAPSHOT',
      sender: 'CHILD_APP',
      roomCode: this.roomCode,
      timestamp: Date.now(),
      payload: this.buildRemoteStatePayload(triggerEvent)
    };

    if (this.broadcastChannel) {
      try { this.broadcastChannel.postMessage(packet); } catch (e) {}
    }

    try {
      localStorage.setItem('bosque_sced_remote_state_v3', JSON.stringify(packet));
    } catch (e) {}

    if (typeof fetch === 'function') {
      const base = this.getServerBaseUrl();
      fetch(`${base}/api/sced-sync?room=${encodeURIComponent(this.roomCode)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packet)
      }).catch(() => {});
    }
  }

  handleRemoteMessage(msg) {
    if (!msg || msg.sender === 'CHILD_APP') return;

    if (msg.type === 'REQUEST_STATE_SNAPSHOT' || msg.type === 'EVALUATOR_CONNECTED') {
      this.connectedPeers = Math.max(2, this.connectedPeers);
      this.updateRemoteUrlDisplay();
      this.broadcastStateSnapshot('SYNC_RESPONSE');
      return;
    }

    if (msg.type !== 'REMOTE_COMMAND') return;
    const cmd = msg.command;
    const data = msg.data || {};

    switch (cmd) {
      case 'CMD_START_SESSION': {
        const cfgModal = document.getElementById('evalConfigModal');
        if (cfgModal) cfgModal.classList.remove('active');
        this.startSession(data);
        break;
      }
      case 'CMD_ADD_ASSIST_CA': {
        this.registerModeratorAssist();
        break;
      }
      case 'CMD_SET_HUMAN_PSF': {
        if (typeof data.index === 'number' && data.judgment) {
          this.setHumanJudgmentForPhonation(data.index, data.judgment);
        }
        break;
      }
      case 'CMD_ADD_MANUAL_SAMPLE': {
        if (data.word) {
          this.addManualBoschMelgarSample(data.word, data.context || 'isolated', data.asrApproved, data.humanJudgment);
        }
        break;
      }
      case 'CMD_TOGGLE_CVI': {
        const currentlyCvi = document.body.getAttribute('data-theme') === 'cvi';
        const nextCvi = typeof data.enable === 'boolean' ? data.enable : !currentlyCvi;
        this.session.visualMode = nextCvi ? 'cvi_high_contrast' : 'standard_biophilic';
        if (typeof window.setBosqueCviMode === 'function') {
          window.setBosqueCviMode(nextCvi);
        } else if (nextCvi) {
          document.body.setAttribute('data-theme', 'cvi');
        } else {
          document.body.removeAttribute('data-theme');
        }
        this.logEvent('REMOTE_CVI_TOGGLED', { cviEnabled: nextCvi });
        this.broadcastStateSnapshot('REMOTE_CVI_TOGGLED');
        break;
      }
      case 'CMD_LAUNCH_EMOJIS': {
        this.finishChildSession();
        break;
      }
      case 'CMD_CLOSE_EMOJIS': {
        const emModal = document.getElementById('emojiQuestionnaireModal');
        if (emModal) emModal.classList.remove('active');
        this.broadcastStateSnapshot('EMOJI_MODAL_CLOSED');
        break;
      }
      case 'CMD_SYNC_SCALES': {
        if (Array.isArray(data.pssuqItems)) this.pssuqItems = data.pssuqItems;
        if (Array.isArray(data.marsDimensions)) this.marsDimensions = data.marsDimensions;
        if (Array.isArray(data.nielsenHeuristics)) this.nielsenHeuristics = data.nielsenHeuristics;
        if (typeof data.schwaAntipatternDetected === 'boolean') {
          this.schwaAntipatternDetected = data.schwaAntipatternDetected;
        }
        if (typeof data.teacherClassroomNotes === 'string') {
          this.session.teacherClassroomNotes = data.teacherClassroomNotes;
        }
        this.calculateConsolidatedKPIs();
        this.persistState();
        this.renderAdultDashboardPanel();
        this.broadcastStateSnapshot('SCALES_UPDATED');
        break;
      }
      default:
        break;
    }
  }

  attachHeaderLogoTrigger(element) {
    if (!element) return;
    const registerTap = (e) => {
      const now = performance.now();
      // Permitir hasta 1600ms entre toques para pantallas táctiles en dispositivos móviles
      if (now - this.lastHeaderTapTime < 1600) {
        this.headerTapCount++;
      } else {
        this.headerTapCount = 1;
      }
      this.lastHeaderTapTime = now;

      element.classList.add('eval-tap-pulse');
      setTimeout(() => element.classList.remove('eval-tap-pulse'), 300);

      if (this.headerTapCount >= 3) {
        this.headerTapCount = 0;
        this.handleTriggerAction();
      }
    };

    element.addEventListener('click', registerTap);
    element.addEventListener('touchend', registerTap, { passive: true });
  }

  handleTriggerAction() {
    if (this.isActive) {
      this.finishChildSession();
    } else {
      this.openConfigModal();
    }
  }

  /* ==========================================================================
     2. MODAL DE CONFIGURACIÓN RÁPIDA DE SESIÓN MICRO-SCED (10 SEGUNDOS)
     ========================================================================== */
  openConfigModal() {
    let modal = document.getElementById('evalConfigModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'evalConfigModal';
      modal.className = 'eval-modal-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'evalConfigTitle');
      document.body.appendChild(modal);
    }

    const isCviCurrent = document.body.getAttribute('data-theme') === 'cvi';
    const remoteUrl = this.getRemoteEvaluatorUrl();

    modal.innerHTML = `
      <div class="eval-config-card" data-eval-ui="true">
        <div class="eval-config-header">
          <div>
            <span class="eval-pill-eyebrow">Actividad 10 • Piloto Acotado Micro-SCED (G7 - UNMSM)</span>
            <h2 id="evalConfigTitle" class="eval-config-title">🧪 Configurar Sesión y Mando Remoto</h2>
          </div>
          <button type="button" id="btnCloseEvalConfig" class="eval-icon-close-btn" aria-label="Cerrar configuración">✕</button>
        </div>

        <p class="eval-config-desc">
          <strong>Arquitectura Zero-HUD:</strong> La pantalla del niño queda <strong>100% libre de recuadros o controles del evaluador</strong>. Califica las emisiones vocales (<em>PSF / ASR vs. Humano</em>), registra apoyos y lanza el cierre con emojis de forma remota desde tu propio celular o laptop.
        </p>

        <div class="eval-remote-pairing-box">
          <div class="eval-remote-top">
            <span id="evalRoomCodeBadge" class="eval-room-badge">🔑 Sala: ${this.roomCode}</span>
            <span id="evalPeerStatusBadge" class="eval-peer-status ${this.connectedPeers > 1 ? '' : 'waiting'}">
              ${this.connectedPeers > 1 ? `🟢 Conectado con Evaluador (${this.connectedPeers} disp.)` : '📡 Esperando conexión con Laptop'}
            </span>
          </div>

          <!-- Bloque de Conexión Directa para el APK -->
          <div class="eval-server-connection-group" style="margin: 12px 0 8px; padding: 10px 14px; background: rgba(46, 125, 50, 0.08); border: 2px solid var(--color-primary-forest, #2E7D32); border-radius: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label for="inpEvalServerOrigin" style="font-size: 0.82rem; font-weight: 700; color: #1B5E20; display: flex; align-items: center; gap: 6px;">
                💻 Vincular con Laptop del Evaluador:
              </label>
              <span id="evalServerConnBadge" style="font-size: 0.74rem; font-weight: 700; color: ${this.hasCustomServer() ? '#2E7D32' : '#666'};">
                ${this.hasCustomServer() ? '🟢 IP Guardada' : '⚪ Modo Local'}
              </span>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input type="text" id="inpEvalServerOrigin" class="eval-input" style="flex: 1; padding: 7px 12px; font-size: 0.88rem; font-family: monospace; border: 2px solid #A5D6A7; background: #FFF; border-radius: 8px;" placeholder="Ej: 10.44.87.221" value="${this.getCurrentServerOrigin()}">
              <button type="button" id="btnTestAndSaveServer" class="eval-btn eval-btn-primary" style="padding: 7px 16px; min-height: 38px; font-size: 0.82rem; white-space: nowrap; font-weight: 700;">
                ⚡ Enlazar
              </button>
            </div>
            <div id="evalServerConnFeedback" style="font-size: 0.76rem; margin-top: 5px; font-weight: 600; min-height: 18px;">
              ${this.hasCustomServer() ? `Enlace configurado a: ${this.getCurrentServerOrigin()}` : 'Escribe la IP de la laptop y pulsa Enlazar para telemetría en vivo.'}
            </div>
          </div>

          <div class="eval-remote-url-row">
            <span style="font-size: 0.75rem; color: #555; white-space: nowrap;">URL Evaluador:</span>
            <code id="evalRemoteUrlText" class="eval-lan-url-pill" title="Abre este enlace en la laptop del evaluador">${remoteUrl}</code>
            <button type="button" id="btnCopyRemoteUrl" class="eval-btn eval-btn-outline" style="padding: 6px 12px; min-height: 34px; font-size: 0.78rem;">
              📋 Copiar
            </button>
            <button type="button" id="btnLaunchRemoteWindow" class="eval-btn eval-btn-amber" style="padding: 6px 12px; min-height: 34px; font-size: 0.78rem;">
              📱 Abrir
            </button>
          </div>
        </div>

        <div class="eval-config-grid">
          <div class="eval-field-group">
            <label for="inpEvalParticipantId">Código Participante (Anónimo Ley 29733)</label>
            <div class="eval-quick-chips" id="evalParticipantChips">
              <button type="button" class="eval-chip active" data-pid="P01" data-name="Mateo" data-age="4" data-cond="Rotacismo (/r/, /rr/)">P01 (4a /r/)</button>
              <button type="button" class="eval-chip" data-pid="P02" data-name="Sofía" data-age="3" data-cond="Simplificación Sinfones (/pl/)">P02 (3a /pl/)</button>
              <button type="button" class="eval-chip" data-pid="P03" data-name="Lucas" data-age="5" data-cond="Dislalia Múltiple (/rr/, /s/)">P03 (5a DDA)</button>
              <button type="button" class="eval-chip" data-pid="P04" data-name="Valentina" data-age="4" data-cond="Sigmatismo (/s/) + Modo CVI">P04 (4a CVI)</button>
            </div>
            <input type="text" id="inpEvalParticipantId" class="eval-input" value="${this.session.participantId}" placeholder="Ej. P01">
          </div>

          <div class="eval-field-group">
            <label for="selEvalChildAge">Edad del Preescolar</label>
            <select id="selEvalChildAge" class="eval-input">
              <option value="3" ${this.session.childAge === 3 ? 'selected' : ''}>3 años (Pre-lector inicial)</option>
              <option value="4" ${this.session.childAge === 4 ? 'selected' : ''}>4 años (Preescolar medio)</option>
              <option value="5" ${this.session.childAge === 5 ? 'selected' : ''}>5 años (Preescolar avanzado)</option>
              <option value="6" ${this.session.childAge === 6 ? 'selected' : ''}>6 años (Transición)</option>
            </select>
          </div>

          <div class="eval-field-group">
            <label for="selEvalCondition">Condición Fonética Observada</label>
            <select id="selEvalCondition" class="eval-input">
              <option value="Rotacismo (/r/, /rr/)">Rotacismo (/r/, /rr/) - Sustitución frecuente</option>
              <option value="Sigmatismo (/s/)">Sigmatismo (/s/) - Omisión o distorsión</option>
              <option value="Simplificación Sinfones (/pl/)">Simplificación de Sinfones (/pl, tr, gl/)</option>
              <option value="Dislalia Múltiple (/rr/, /s/)">Dislalia Funcional Múltiple (Prueba rescate DDA)</option>
              <option value="Sigmatismo (/s/) + Modo CVI">Dificultad Articulatoria + Baja Visión (CVI)</option>
            </select>
          </div>

          <div class="eval-field-group">
            <label for="selEvalMediatorRole">Rol del Mediador / Evaluador (Acotación Realista)</label>
            <select id="selEvalMediatorRole" class="eval-input">
              <option value="Docente de Educación Inicial (Lima Metropolitana)">Docente de Educación Inicial (Capa 2 - Huertas & Roque, 2023)</option>
              <option value="Madre / Padre Tutor de Preescolar">Madre / Padre Tutor (Capa 2 - Entorno Familiar)</option>
              <option value="Estudiante G7 FISI-UNMSM (Inspección Cruzada)">Estudiante Equipo G7 (Capa 1 - Peer IHC Evaluation)</option>
            </select>
          </div>

          <div class="eval-field-group eval-field-full">
            <label for="selEvalVisualMode">Modalidad Cromática y Accesibilidad</label>
            <select id="selEvalVisualMode" class="eval-input">
              <option value="standard_biophilic" ${!isCviCurrent ? 'selected' : ''}>🌿 Estándar Biofílico (Verde Bosque / Menta Pastel > 4.5:1 AA)</option>
              <option value="cvi_high_contrast" ${isCviCurrent ? 'selected' : ''}>👁️ Modo Alto Contraste CVI (Fondo Carbón #121212 / Amarillo Solar 16.8:1 AAA)</option>
            </select>
          </div>
        </div>

        <div class="eval-config-actions">
          <button type="button" id="btnOpenDirectSuite" class="eval-btn eval-btn-outline">
            📋 Suite Local (PSSUQ / MARS / Nielsen)
          </button>
          <button type="button" id="btnStartScedSession" class="eval-btn eval-btn-primary">
            🚀 Iniciar Prueba Infantil (Pantalla Limpia Zero-HUD)
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');

    // Quick participant preset chips
    modal.querySelectorAll('#evalParticipantChips .eval-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        modal.querySelectorAll('#evalParticipantChips .eval-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const pid = chip.dataset.pid;
        document.getElementById('inpEvalParticipantId').value = pid;
        document.getElementById('selEvalChildAge').value = chip.dataset.age;
        document.getElementById('selEvalCondition').value = chip.dataset.cond;
        if (pid === 'P04') {
          document.getElementById('selEvalVisualMode').value = 'cvi_high_contrast';
        } else {
          document.getElementById('selEvalVisualMode').value = 'standard_biophilic';
        }
        this.connectSseRoom(`G7-${pid}`);
        this.updateRemoteUrlDisplay();
      });
    });

    const inpPid = document.getElementById('inpEvalParticipantId');
    if (inpPid) {
      inpPid.addEventListener('input', () => {
        const cleanPid = (inpPid.value || 'P01').trim().toUpperCase();
        this.connectSseRoom(`G7-${cleanPid}`);
        this.updateRemoteUrlDisplay();
      });
    }

    const btnCopyUrl = document.getElementById('btnCopyRemoteUrl');
    if (btnCopyUrl) {
      btnCopyUrl.addEventListener('click', () => {
        const url = this.getRemoteEvaluatorUrl();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url);
        }
        btnCopyUrl.textContent = '✓ Enlace Copiado';
        setTimeout(() => { btnCopyUrl.textContent = '📋 Copiar URL'; }, 1800);
      });
    }

    const btnLaunchRemote = document.getElementById('btnLaunchRemoteWindow');
    if (btnLaunchRemote) {
      btnLaunchRemote.addEventListener('click', () => {
        this.openRemoteEvaluatorWindow();
      });
    }

    const btnTestServer = document.getElementById('btnTestAndSaveServer');
    const inpServer = document.getElementById('inpEvalServerOrigin');
    const fbServer = document.getElementById('evalServerConnFeedback');
    const badgeServer = document.getElementById('evalServerConnBadge');

    const linkServerAction = async () => {
      let rawVal = (inpServer?.value || '').trim();
      if (!rawVal) {
        localStorage.removeItem('bosque_sced_server_origin');
        if (fbServer) {
          fbServer.style.color = '#555';
          fbServer.textContent = '⚪ Enlace removido. Modo local activo.';
        }
        if (badgeServer) {
          badgeServer.style.color = '#666';
          badgeServer.textContent = '⚪ Modo Local';
        }
        this.connectSseRoom(this.roomCode);
        this.updateRemoteUrlDisplay();
        return;
      }

      let formatted = rawVal;
      if (!/^https?:\/\//i.test(formatted)) {
        formatted = `http://${formatted}`;
      }
      if (!/:\d+$/.test(formatted)) {
        formatted = `${formatted}:5173`;
      }
      inpServer.value = formatted;

      if (fbServer) {
        fbServer.style.color = '#1565C0';
        fbServer.textContent = `⏳ Verificando conexión con ${formatted}...`;
      }

      try {
        const resp = await fetch(`${formatted}/api/sced-info`, { method: 'GET', mode: 'cors' });
        if (resp.ok) {
          localStorage.setItem('bosque_sced_server_origin', formatted);
          if (fbServer) {
            fbServer.style.color = '#2E7D32';
            fbServer.textContent = `✅ ¡Enlazado exitosamente con la laptop! (${formatted})`;
          }
          if (badgeServer) {
            badgeServer.style.color = '#2E7D32';
            badgeServer.textContent = '🟢 Enlazado';
          }
          this.connectSseRoom(this.roomCode);
          this.updateRemoteUrlDisplay();
          this.broadcastStateSnapshot('EVALUATOR_LINKED_OK');
        } else {
          throw new Error(`HTTP ${resp.status}`);
        }
      } catch (err) {
        localStorage.setItem('bosque_sced_server_origin', formatted);
        if (fbServer) {
          fbServer.style.color = '#E65100';
          fbServer.textContent = `⚠️ Guardado ${formatted}, pero no hubo respuesta inmediata. Verifica que "npm run dev" esté activo en la laptop y en la misma red Wi-Fi.`;
        }
        this.connectSseRoom(this.roomCode);
        this.updateRemoteUrlDisplay();
      }
    };

    if (btnTestServer) {
      btnTestServer.addEventListener('click', linkServerAction);
    }
    if (inpServer) {
      inpServer.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          linkServerAction();
        }
      });
    }

    const closeConfigModal = () => {
      modal.classList.remove('active');
      document.removeEventListener('keydown', handleEscConfig);
    };

    const handleEscConfig = (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeConfigModal();
      }
    };
    document.addEventListener('keydown', handleEscConfig);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeConfigModal();
      }
    });

    document.getElementById('btnCloseEvalConfig').addEventListener('click', () => {
      closeConfigModal();
    });

    document.getElementById('btnOpenDirectSuite').addEventListener('click', () => {
      modal.classList.remove('active');
      this.calculateConsolidatedKPIs();
      this.openEvaluationReportModal('nielsen');
    });

    document.getElementById('btnStartScedSession').addEventListener('click', () => {
      const pid = (document.getElementById('inpEvalParticipantId').value || 'P01').trim();
      const age = parseInt(document.getElementById('selEvalChildAge').value, 10) || 4;
      const cond = document.getElementById('selEvalCondition').value;
      const role = document.getElementById('selEvalMediatorRole').value;
      const vMode = document.getElementById('selEvalVisualMode').value;

      const activeChip = modal.querySelector('#evalParticipantChips .eval-chip.active');
      const pseudonym = (activeChip && activeChip.dataset.pid === pid) ? activeChip.dataset.name : `Participante ${pid}`;

      const sOrigin = (document.getElementById('inpEvalServerOrigin')?.value || '').trim();
      if (sOrigin) {
        let formatted = sOrigin;
        if (!/^https?:\/\//i.test(formatted)) {
          formatted = `http://${formatted}`;
        }
        if (!/:\d+$/.test(formatted)) {
          formatted = `${formatted}:5173`;
        }
        localStorage.setItem('bosque_sced_server_origin', formatted);
      } else {
        localStorage.removeItem('bosque_sced_server_origin');
      }
      this.connectSseRoom(this.roomCode);

      modal.classList.remove('active');
      this.startSession({
        participantId: pid,
        childPseudonym: pseudonym,
        childAge: age,
        condition: cond,
        mediatorRole: role,
        visualMode: vMode
      });
    });
  }

  startSession(config = {}) {
    const nowIso = new Date().toISOString();
    const dateCode = nowIso.slice(0, 10).replace(/-/g, '');
    const pid = (config.participantId || "P01").trim().toUpperCase();

    this.connectSseRoom(`G7-${pid}`);
    this.isActive = true;
    this.session = {
      ...this.session,
      sessionId: `SCED-${dateCode}-${pid}`,
      participantId: pid,
      childPseudonym: config.childPseudonym || "Mateo",
      childAge: config.childAge || 4,
      condition: config.condition || "Rotacismo (/r/, /rr/)",
      mediatorRole: config.mediatorRole || "Docente de Educación Inicial (Lima Metropolitana)",
      visualMode: config.visualMode || "standard_biophilic",
      startTimeMs: performance.now(),
      endTimeMs: 0,
      startTimestampIso: nowIso,
      endTimestampIso: "",
      totalDurationSec: 0
    };

    // Sincronizar Modo CVI si fue elegido en la configuración
    const enableCvi = this.session.visualMode === 'cvi_high_contrast';
    if (typeof window.setBosqueCviMode === 'function') {
      window.setBosqueCviMode(enableCvi);
    } else if (enableCvi) {
      document.body.setAttribute('data-theme', 'cvi');
    } else {
      document.body.removeAttribute('data-theme');
    }

    this.tasks = [];
    this.taskCounter = 1;
    this.touchStats = {
      totalTouches: 0,
      validTargetTouches: 0,
      palmTouchesFiltered: 0,
      palmFalseActivations: 0,
      missTouches: 0
    };
    this.avclSamplesMs = [];
    this.phonations = [];
    this.detailedEventsLog = [];
    this.lastInstructionAudioEndTime = performance.now();

    this.logEvent('SESSION_START', {
      participantId: pid,
      visualMode: this.session.visualMode
    });

    // Asegurar que NO exista ningún HUD ni recuadro flotante en la pantalla del niño
    this.hideEvaluatorHUD();
    this.startTask('T1_MENU_NAV', 'T1: Navegación Autónoma en Menú de Vagones');
    this.renderAdultDashboardPanel();
    this.broadcastStateSnapshot('SESSION_START');

    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      if (this.isActive) {
        this.broadcastStateSnapshot('HEARTBEAT');
      }
    }, 4000);
  }

  logEvent(eventType, payload = {}) {
    const relMs = this.session.startTimeMs > 0
      ? Number((performance.now() - this.session.startTimeMs).toFixed(1))
      : 0;
    this.detailedEventsLog.push({
      timestamp_ms: relMs,
      event_type: eventType,
      ...payload
    });
  }

  /* ==========================================================================
     3. ARQUITECTURA ZERO-HUD EN DISPOSITIVO DEL NIÑO
     Elimina cualquier recuadro sobre la pantalla infantil; toda calificación
     ocurre remotamente desde evaluador.html en el dispositivo del evaluador.
     ========================================================================== */
  renderEvaluatorHUD() {
    this.hideEvaluatorHUD();
  }

  showPsfJudgmentPopover() {
    // La calificación perceptual PSF ahora se envía en tiempo real a evaluador.html
    this.broadcastStateSnapshot('VOICE_PHONATION_READY_FOR_PSF');
  }

  hideEvaluatorHUD() {
    const hud = document.getElementById('evaluatorHudBar');
    if (hud && hud.parentNode) {
      hud.parentNode.removeChild(hud);
    }
  }

  /* ==========================================================================
     4. TELEMETRÍA TÁCTIL, MOTRICIDAD ≥48 DP Y ZONA PALMAR (HEURÍSTICA H5)
     ========================================================================== */
  handleGlobalPointerDown(e) {
    if (!this.isActive) return;

    // Ignorar toques sobre el propio HUD o modales del evaluador
    if (e.target && e.target.closest && e.target.closest('[data-eval-ui="true"], #evaluatorHudBar')) {
      return;
    }

    this.touchStats.totalTouches++;

    // KPI-02: Tiempo al Primer Toque (TTFT) desde que terminó de hablar Ava
    if (!this.firstTouchRegisteredForCurrentTask && this.currentTask) {
      this.firstTouchRegisteredForCurrentTask = true;
      const refTime = this.lastInstructionAudioEndTime > 0
        ? this.lastInstructionAudioEndTime
        : this.currentTask.startTime;
      const rawTtft = (performance.now() - refTime) / 1000;
      this.currentTask.ttftSec = Math.max(0.15, Number(Math.min(rawTtft, 25).toFixed(2)));
    }

    // KPI-04: Detección de apoyo en Franja Palmar Inferior (56 dp / .app-footer-cushion)
    const isPalmFooter = e.target && e.target.closest && e.target.closest('.app-footer-cushion, #palm-rest-bar');
    const isBottomMargin = e.clientY >= (window.innerHeight - 56);
    const interactiveEl = e.target && e.target.closest
      ? e.target.closest('button, [role="button"], a, input, select, .touch-btn, .train-wagon-card, .pair-card, .store-item-card, .syllable-chip, .bingo-card-cell, .meadow-flower-item')
      : null;

    if ((isPalmFooter || isBottomMargin) && !interactiveEl) {
      this.touchStats.palmTouchesFiltered++;
      this.logEvent('PALM_REST_FILTERED', { x: Math.round(e.clientX), y: Math.round(e.clientY) });
      this.broadcastStateSnapshot('PALM_REST_FILTERED');
      return;
    }

    // KPI-03: Precisión en Objetivos Táctiles (≥48x48 dp) vs. Toque fuera de blanco
    if (interactiveEl) {
      this.touchStats.validTargetTouches++;
      const rect = interactiveEl.getBoundingClientRect();
      this.logEvent('POINTER_HIT_TARGET', {
        x: Math.round(e.clientX),
        y: Math.round(e.clientY),
        targetId: interactiveEl.id || interactiveEl.className.toString().slice(0, 32),
        targetWidthDp: Math.round(rect.width),
        targetHeightDp: Math.round(rect.height),
        meets48dp: rect.width >= 44 && rect.height >= 44
      });
    } else {
      this.touchStats.missTouches++;
      this.logEvent('POINTER_MISS_TARGET', { x: Math.round(e.clientX), y: Math.round(e.clientY) });
    }
    this.broadcastStateSnapshot('POINTER_TOUCH');
  }

  notifyInstructionAudioEnded() {
    this.lastInstructionAudioEndTime = performance.now();
  }

  recordAvclLatency(latencyMs) {
    if (!this.isActive) return;
    const clamped = Math.max(25, Math.min(450, Math.round(latencyMs)));
    this.avclSamplesMs.push(clamped);
  }

  recordMathGateOpen() {
    this.mathGateOpenTimeMs = performance.now();
    this.mathGateStats.attempts = 0;
  }

  recordMathGateAttempt(isCorrect) {
    this.mathGateStats.attempts = (this.mathGateStats.attempts || 0) + 1;
    if (isCorrect && this.mathGateOpenTimeMs > 0) {
      const elapsedSec = Number(((performance.now() - this.mathGateOpenTimeMs) / 1000).toFixed(2));
      this.mathGateStats.tctSec = elapsedSec;
      this.mathGateStats.solved = true;
      this.kpis.mathGateTctSec = elapsedSec;
      if (this.isActive) {
        this.logEvent('MATHGATE_SOLVED', {
          tctSec: elapsedSec,
          attempts: this.mathGateStats.attempts
        });
      }
      this.broadcastStateSnapshot('MATHGATE_SOLVED');
    }
  }

  /* ==========================================================================
     5. GESTIÓN DE TAREAS, PRECISIÓN FONÉTICA BOSCH & MELGAR Y ASR vs. HUMANO
     ========================================================================== */
  startTask(taskId, taskName) {
    if (!this.isActive) return;

    if (this.currentTask && !this.currentTask.isEnded) {
      this.endTask(true);
    }

    const shortCode = `T${this.taskCounter}`;
    this.currentTask = {
      id: taskId || shortCode,
      shortCode,
      name: taskName || `Tarea ${this.taskCounter}`,
      startTime: performance.now(),
      endTime: 0,
      tctSec: 0,
      ttftSec: 1.4,
      isAutonomous: true,
      isAssisted: false,
      isAbandoned: false,
      attempts: 0,
      ddaIntervention: false,
      isEnded: false
    };

    this.taskCounter++;
    this.firstTouchRegisteredForCurrentTask = false;
    this.lastInstructionAudioEndTime = performance.now();

    this.logEvent('TASK_START', { taskId: this.currentTask.id, name: this.currentTask.name });
    this.broadcastStateSnapshot('TASK_START');
  }

  registerModeratorAssist() {
    if (!this.isActive || !this.currentTask) return;
    this.currentTask.isAssisted = true;
    this.currentTask.isAutonomous = false;
    this.logEvent('MODERATOR_ASSIST_CA', { taskId: this.currentTask.id });
    this.broadcastStateSnapshot('MODERATOR_ASSIST_CA');
  }

  lookupWordMetadata(targetWord, contextHint = {}) {
    const clean = String(targetWord || '').trim().toLowerCase();
    const found = BOSCH_MELGAR_LOOKUP[clean];
    const isContinuous = contextHint.context === 'continuous' || clean.split(/\s+/).length >= 3;

    if (found) {
      return {
        phoneme: contextHint.phoneme || found.phoneme,
        position: found.pos,
        context: isContinuous ? 'continuous' : found.category
      };
    }

    return {
      phoneme: contextHint.phoneme ? `/${contextHint.phoneme}/` : '/r/',
      position: isContinuous ? 'Frase Continua' : 'Inicial / Medial',
      context: isContinuous ? 'continuous' : 'isolated'
    };
  }

  recordVoicePhonation(targetWord, phonatoryDurationMs, rms, verdict, contextHint = {}) {
    if (!this.isActive) return;

    const meta = this.lookupWordMetadata(targetWord, contextHint);
    const asrApproved = verdict === 'APPROVED';

    // Por defecto inicializamos juicio humano alineado hasta que el evaluador confirme/modifique desde su App Remota
    const defaultHuman = asrApproved ? 'CORRECT' : 'S';

    const entry = {
      index: this.phonations.length + 1,
      targetWord: targetWord || 'Palabra',
      phoneme: meta.phoneme,
      position: meta.position,
      context: meta.context, // 'isolated' | 'continuous'
      durationMs: Math.round(phonatoryDurationMs || 1650),
      rms: Number((rms || 0.18).toFixed(3)),
      asrVerdict: verdict,
      asrApproved,
      humanJudgment: defaultHuman, // 'CORRECT' | 'O' | 'S' | 'D'
      humanLabeledExplicitly: false,
      concordance: 'AGREEMENT', // 'AGREEMENT' | 'FALSE_POSITIVE' | 'FALSE_NEGATIVE'
      timestampMs: Number((performance.now() - this.session.startTimeMs).toFixed(1))
    };

    this.recomputeEntryConcordance(entry);
    this.phonations.push(entry);

    if (this.currentTask) {
      this.currentTask.attempts++;
      if (verdict === 'DDA_INTERVENTION') {
        this.currentTask.ddaIntervention = true;
      }
    }

    this.logEvent('VOICE_PHONATION_EVALUATED', {
      word: entry.targetWord,
      context: entry.context,
      asrVerdict: verdict,
      durationMs: entry.durationMs
    });

    // Notificar en tiempo real a la Consola Remota del Evaluador (evaluador.html)
    this.showPsfJudgmentPopover(this.phonations.length - 1);
  }

  recomputeEntryConcordance(entry) {
    const humanCorrect = entry.humanJudgment === 'CORRECT';
    if (entry.asrApproved && humanCorrect) {
      entry.concordance = 'AGREEMENT';
    } else if (!entry.asrApproved && !humanCorrect) {
      entry.concordance = 'AGREEMENT';
    } else if (entry.asrApproved && !humanCorrect) {
      entry.concordance = 'FALSE_POSITIVE';
    } else {
      entry.concordance = 'FALSE_NEGATIVE';
    }
  }

  setHumanJudgmentForPhonation(index, judgment) {
    const entry = this.phonations[index];
    if (!entry) return;
    entry.humanJudgment = judgment;
    entry.humanLabeledExplicitly = true;
    this.recomputeEntryConcordance(entry);
    this.calculateConsolidatedKPIs();
    this.persistState();
    this.broadcastStateSnapshot('HUMAN_PSF_UPDATED');
  }

  addManualBoschMelgarSample(word, context, asrApproved, humanJudgment) {
    const meta = this.lookupWordMetadata(word, { context });
    const entry = {
      index: this.phonations.length + 1,
      targetWord: word,
      phoneme: meta.phoneme,
      position: meta.position,
      context: context || meta.context,
      durationMs: 1580,
      rms: 0.21,
      asrVerdict: asrApproved ? 'APPROVED' : 'RETRY_GENTLE',
      asrApproved: !!asrApproved,
      humanJudgment: humanJudgment || 'CORRECT',
      humanLabeledExplicitly: true,
      concordance: 'AGREEMENT',
      timestampMs: 0
    };
    this.recomputeEntryConcordance(entry);
    this.phonations.push(entry);
    this.calculateConsolidatedKPIs();
    this.persistState();
    this.broadcastStateSnapshot('MANUAL_SAMPLE_ADDED');
  }

  endTask(success = true) {
    if (!this.isActive || !this.currentTask || this.currentTask.isEnded) return;

    this.currentTask.endTime = performance.now();
    this.currentTask.tctSec = Math.max(0.5, Number(((this.currentTask.endTime - this.currentTask.startTime) / 1000).toFixed(2)));
    this.currentTask.isEnded = true;

    if (!success) {
      this.currentTask.isAbandoned = true;
      this.currentTask.isAutonomous = false;
      this.currentTask.isAssisted = false;
    }

    this.tasks.push(this.currentTask);
  }

  /* ==========================================================================
     6. CIERRE INFANTIL: CUESTIONARIO PICTÓRICO CON EMOJIS (SAEEDI ET AL., 2024)
     ========================================================================== */
  finishChildSession() {
    if (this.isActive) {
      this.endTask(true);
      this.session.endTimeMs = performance.now();
      this.session.endTimestampIso = new Date().toISOString();
      this.session.totalDurationSec = Math.max(5, Math.round((this.session.endTimeMs - this.session.startTimeMs) / 1000));
      this.isActive = false;
    }

    this.hideEvaluatorHUD();
    this.currentEmojiStep = 0;
    this.broadcastStateSnapshot('EMOJI_QUESTIONNAIRE_STARTED');
    this.openEmojiQuestionnaireModal();
  }

  openEmojiQuestionnaireModal() {
    let modal = document.getElementById('emojiQuestionnaireModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'emojiQuestionnaireModal';
      modal.className = 'eval-modal-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      document.body.appendChild(modal);
    }

    this.renderCurrentEmojiStep(modal);
    modal.classList.add('active');
  }

  renderCurrentEmojiStep(modal) {
    const q = EMOJI_QUESTIONS_CONFIG[this.currentEmojiStep];
    if (!q) {
      modal.innerHTML = `
        <div class="emoji-child-card" data-eval-ui="true" style="text-align: center; padding: 28px 20px;">
          <div id="emojiAvaMountFinal" class="emoji-ava-mount ava-container" style="margin: 0 auto 12px;" aria-hidden="true"></div>
          <div style="font-size: 3.5rem; line-height: 1; margin-bottom: 8px;">⭐</div>
          <h2 style="font-family: var(--font-display, 'Quicksand', sans-serif); color: #1B5E20; font-size: 1.5rem; margin-bottom: 6px;">¡Muchas Gracias!</h2>
          <p style="font-size: 1.05rem; color: #334155; font-weight: 600;">¡Ganaste una estrella gigante por jugar con Ava!</p>
        </div>
      `;
      if (window.avaEngine && typeof window.avaEngine.mount === 'function') {
        window.avaEngine.mount('#emojiAvaMountFinal', { size: 80 });
      }
      setTimeout(() => {
        modal.classList.remove('active');
        this.calculateConsolidatedKPIs();
        this.persistState();
        this.renderAdultDashboardPanel();
        this.broadcastStateSnapshot('SESSION_EMOJI_COMPLETED');
      }, 2600);
      return;
    }

    const dotsHtml = EMOJI_QUESTIONS_CONFIG.map((item, idx) => {
      const cls = idx < this.currentEmojiStep ? 'done' : (idx === this.currentEmojiStep ? 'current' : '');
      return `<span class="emoji-step-dot ${cls}"></span>`;
    }).join('');

    modal.innerHTML = `
      <div class="emoji-child-card" data-eval-ui="true">
        <div class="emoji-card-top">
          <div class="emoji-step-dots" aria-label="Progreso">${dotsHtml}</div>
        </div>

        <div class="emoji-ava-header">
          <div id="emojiAvaMount" class="emoji-ava-mount ava-container" aria-hidden="true"></div>
          <div class="emoji-speech-box">
            <span class="emoji-q-badge">${q.badge}</span>
            <h2 class="emoji-q-title">${q.title}</h2>
          </div>
          <button type="button" id="btnReplayEmojiPrompt" class="touch-btn emoji-speaker-btn" aria-label="Escuchar pregunta de Ava">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="rgba(255, 179, 0, 0.25)"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
          </button>
        </div>

        <div class="emoji-choices-row" role="group" aria-label="${q.title}">
          ${q.options.map(opt => `
            <button type="button" class="emoji-choice-card ${opt.toneClass}" data-val="${opt.value}">
              <span class="emoji-giant-face" aria-hidden="true">${opt.emoji}</span>
              <span class="emoji-choice-label">${opt.label}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // Montar avatar vectorial de Ava en la tarjeta infantil si está disponible
    if (window.avaEngine && typeof window.avaEngine.mount === 'function') {
      window.avaEngine.mount('#emojiAvaMount', { size: 78 });
    }

    // Locución hablada automática (Voice-First para preescolares no lectores)
    if (window.audioEngine && typeof window.audioEngine.speak === 'function') {
      window.audioEngine.speak(q.spokenPrompt);
    }

    document.getElementById('btnReplayEmojiPrompt').addEventListener('click', () => {
      if (window.audioEngine) window.audioEngine.speak(q.spokenPrompt);
    });

    modal.querySelectorAll('.emoji-choice-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.val, 10) || 3;
        this.emojiAnswers[q.id] = val;
        this.logEvent('CHILD_EMOJI_ANSWER', { questionId: q.id, value: val });
        this.broadcastStateSnapshot('CHILD_EMOJI_ANSWER');

        if (window.audioEngine && typeof window.audioEngine.playChime === 'function') {
          window.audioEngine.playChime();
        }

        btn.classList.add('selected-bounce');
        setTimeout(() => {
          this.currentEmojiStep++;
          if (this.currentEmojiStep >= EMOJI_QUESTIONS_CONFIG.length) {
            if (window.audioEngine && typeof window.audioEngine.speak === 'function') {
              window.audioEngine.speak("¡Muchas gracias por jugar conmigo en el Bosque Sonoro! ¡Ganaste una estrella gigante!");
            }
          }
          this.renderCurrentEmojiStep(modal);
        }, 340);
      });
    });
  }

  /* ==========================================================================
     7. CÁLCULO MATEMÁTICO DE LOS 12 KPIS FUNDAMENTADOS
     ========================================================================== */
  calculateConsolidatedKPIs() {
    // 1. Eficacia y Eficiencia en Tareas (ISO 9241-11 / Liu et al., 2026)
    if (this.tasks.length > 0) {
      const totalT = this.tasks.length;
      const autoCount = this.tasks.filter(t => t.isAutonomous).length;
      const assistCount = this.tasks.filter(t => t.isAssisted).length;
      const abandonCount = this.tasks.filter(t => t.isAbandoned).length;
      const ddaTasks = this.tasks.filter(t => t.ddaIntervention).length;

      const avgTct = this.tasks.reduce((acc, t) => acc + (t.tctSec || 0), 0) / totalT;
      const avgTtft = this.tasks.reduce((acc, t) => acc + (t.ttftSec || 1.4), 0) / totalT;

      this.kpis.saPercent = Math.round((autoCount / totalT) * 100);
      this.kpis.caPercent = Math.round((assistCount / totalT) * 100);
      this.kpis.ncPercent = Math.round((abandonCount / totalT) * 100);
      this.kpis.tctAvgSec = Number(avgTct.toFixed(1));
      this.kpis.ttftAvgSec = Number(avgTtft.toFixed(2));
      this.kpis.ddaActivationsCount = ddaTasks;
    }

    // Latencia AVCL (<300 ms - Peña et al., 2024)
    if (this.avclSamplesMs.length > 0) {
      const sumAvcl = this.avclSamplesMs.reduce((a, b) => a + b, 0);
      this.kpis.avclAvgMs = Math.round(sumAvcl / this.avclSamplesMs.length);
    }

    // 2. Ergonomía Motriz (≥48x48 dp y Franja Palmar - Liu et al., 2026; Saeedi et al., 2024)
    const activeTouches = this.touchStats.validTargetTouches + this.touchStats.missTouches;
    if (activeTouches > 0) {
      this.kpis.tmrPercent = Number(((this.touchStats.missTouches / activeTouches) * 100).toFixed(1));
      this.kpis.targetHitPercent = Number((100 - this.kpis.tmrPercent).toFixed(1));
    }
    this.kpis.palmTouchesFiltered = this.touchStats.palmTouchesFiltered;
    this.kpis.palmFalseActivations = this.touchStats.palmFalseActivations;

    // 3. Precisión Fonética SCED (Bosch & Melgar), PSF (O/S/D) y Concordancia ASR vs. Humano (Strömbergsson et al., 2025)
    if (this.phonations.length > 0) {
      const totalP = this.phonations.length;
      const correctAll = this.phonations.filter(p => p.humanJudgment === 'CORRECT').length;

      const isolatedList = this.phonations.filter(p => p.context === 'isolated');
      const continuousList = this.phonations.filter(p => p.context === 'continuous');

      this.kpis.targetAccuracyOverallPct = Math.round((correctAll / totalP) * 100);
      this.kpis.targetAccuracyIsolatedPct = isolatedList.length > 0
        ? Math.round((isolatedList.filter(p => p.humanJudgment === 'CORRECT').length / isolatedList.length) * 100)
        : this.kpis.targetAccuracyOverallPct;
      this.kpis.targetAccuracyContinuousPct = continuousList.length > 0
        ? Math.round((continuousList.filter(p => p.humanJudgment === 'CORRECT').length / continuousList.length) * 100)
        : this.kpis.targetAccuracyOverallPct;

      this.kpis.psfOmissions = this.phonations.filter(p => p.humanJudgment === 'O').length;
      this.kpis.psfSubstitutions = this.phonations.filter(p => p.humanJudgment === 'S').length;
      this.kpis.psfDistortions = this.phonations.filter(p => p.humanJudgment === 'D').length;

      const agreements = this.phonations.filter(p => p.concordance === 'AGREEMENT').length;
      this.kpis.asrHumanAgreementPct = Math.round((agreements / totalP) * 100);
      this.kpis.asrFalsePositives = this.phonations.filter(p => p.concordance === 'FALSE_POSITIVE').length;
      this.kpis.asrFalseNegatives = this.phonations.filter(p => p.concordance === 'FALSE_NEGATIVE').length;

      const totalDurMs = this.phonations.reduce((acc, p) => acc + (p.durationMs || 1600), 0);
      this.kpis.apedAvgSec = Number((totalDurMs / totalP / 1000).toFixed(2));
      this.kpis.ddaActivationsCount = Math.max(
        this.kpis.ddaActivationsCount,
        this.phonations.filter(p => p.asrVerdict === 'DDA_INTERVENTION').length
      );
    }

    // 4. Heurísticas de Nielsen (0-4 - Saeedi et al., 2024)
    const sumNielsen = this.nielsenHeuristics.reduce((acc, h) => acc + Number(h.severity || 0), 0);
    this.kpis.nielsenMeanSeverity = Number((sumNielsen / this.nielsenHeuristics.length).toFixed(2));
    const h5 = this.nielsenHeuristics.find(h => h.id === 'H05');
    const h3 = this.nielsenHeuristics.find(h => h.id === 'H03');
    this.kpis.nielsenH5Severity = h5 ? Number(h5.severity) : 0.75;
    this.kpis.nielsenH3Severity = h3 ? Number(h3.severity) : 0.75;

    // 5. Cuestionario Pictórico Infantil con Emojis (Meta ≥90% - Saeedi et al., 2024)
    const emojiVals = Object.values(this.emojiAnswers);
    const positiveCount = emojiVals.filter(v => v >= 3).length;
    // Ponderación: carita feliz (3) = 100%, neutra (2) = 50%, triste (1) = 0%
    const weightedSum = emojiVals.reduce((acc, v) => acc + (v === 3 ? 1 : (v === 2 ? 0.5 : 0)), 0);
    this.kpis.emojiAcceptancePct = Math.round((weightedSum / emojiVals.length) * 100);
    this.kpis.emojiPositiveItemsCount = positiveCount;

    // 6. Cuestionario PSSUQ (Escala 1-7 - Saeedi et al., 2024)
    const avgOf = (list) => list.reduce((a, b) => a + Number(b.score || 6), 0) / (list.length || 1);
    this.kpis.pssuqOverallMean = Number(avgOf(this.pssuqItems).toFixed(2));
    this.kpis.pssuqSystemUsefulness = Number(avgOf(this.pssuqItems.filter(i => i.subscale === 'systemUsefulness')).toFixed(2));
    this.kpis.pssuqInfoQuality = Number(avgOf(this.pssuqItems.filter(i => i.subscale === 'infoQuality')).toFixed(2));
    this.kpis.pssuqInterfaceQuality = Number(avgOf(this.pssuqItems.filter(i => i.subscale === 'interfaceQuality')).toFixed(2));

    // 7. Escala MARS (Escala 1-5 - Furlong et al., 2018)
    const sumMars = this.marsDimensions.reduce((acc, m) => acc + Number(m.score || 4.2), 0);
    this.kpis.marsTotalScore = Number((sumMars / this.marsDimensions.length).toFixed(2));
    this.kpis.mathGateTctSec = this.mathGateStats.tctSec || 3.6;
  }

  /* ==========================================================================
     8. SUITE MULTIPESTAÑA DEL EVALUADOR / MEDIADOR (REPORTE + PSSUQ + MARS + NIELSEN)
     ========================================================================== */
  openEvaluationReportModal(initialTab = 'resumen') {
    this.activeReportTab = initialTab;
    this.calculateConsolidatedKPIs();

    let modal = document.getElementById('evalReportModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'evalReportModal';
      modal.className = 'eval-modal-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      document.body.appendChild(modal);
    }

    this.renderReportModalInner(modal);
    modal.classList.add('active');
  }

  renderReportModalInner(modal) {
    const k = this.kpis;
    modal.innerHTML = `
      <div class="eval-suite-card" data-eval-ui="true">
        <div class="eval-suite-header">
          <div>
            <span class="eval-pill-eyebrow">Actividad 10 • Evaluación Tripartita Acotada (G7 FISI-UNMSM)</span>
            <h2 class="eval-suite-title">📊 Suite Micro-SCED: Telemetría, PSSUQ, MARS y Heurísticas</h2>
          </div>
          <button type="button" id="btnCloseEvalSuite" class="eval-icon-close-btn" aria-label="Cerrar suite">✕</button>
        </div>

        <div class="eval-suite-meta-bar">
          <span><strong>Sesión:</strong> ${this.session.sessionId} (${this.session.childPseudonym}, ${this.session.childAge}a)</span>
          <span><strong>Perfil:</strong> ${this.session.condition}</span>
          <span><strong>Mediador:</strong> ${this.session.mediatorRole}</span>
          <span><strong>Duración:</strong> ${this.session.totalDurationSec || 0}s</span>
        </div>

        <nav class="eval-suite-tabs" role="tablist">
          <button type="button" class="eval-tab-btn ${this.activeReportTab === 'resumen' ? 'active' : ''}" data-etab="resumen">
            📊 1. Resumen 12 KPIs
          </button>
          <button type="button" class="eval-tab-btn ${this.activeReportTab === 'fonetica' ? 'active' : ''}" data-etab="fonetica">
            🗣️ 2. Fonética &amp; ASR vs. Humano (${this.phonations.length})
          </button>
          <button type="button" class="eval-tab-btn ${this.activeReportTab === 'pssuq-mars' ? 'active' : ''}" data-etab="pssuq-mars">
            👩‍🏫 3. Mediador: PSSUQ (${k.pssuqOverallMean}/7) &amp; MARS (${k.marsTotalScore}/5)
          </button>
          <button type="button" class="eval-tab-btn ${this.activeReportTab === 'nielsen' ? 'active' : ''}" data-etab="nielsen">
            🔍 4. Capa 1: Nielsen (${k.nielsenMeanSeverity}/4) &amp; Schwa
          </button>
        </nav>

        <div class="eval-suite-body" id="evalSuiteTabBody">
          ${this.renderActiveSuiteTabHtml()}
        </div>

        <div class="eval-suite-footer">
          <span id="evalCopyToast" class="eval-copy-toast" hidden>✓ Copiado al portapapeles</span>
          <button type="button" id="btnEvalNewSession" class="eval-btn eval-btn-outline">🔄 Nueva Sesión Infantil</button>
          <button type="button" id="btnEvalCopyJson" class="eval-btn eval-btn-outline">📋 Copiar JSON</button>
          <button type="button" id="btnEvalExportCsv" class="eval-btn eval-btn-amber">📊 Descargar CSV</button>
          <button type="button" id="btnEvalExportJson" class="eval-btn eval-btn-primary">📥 Descargar JSON (SCED)</button>
        </div>
      </div>
    `;

    // Eventos de cabecera y pestañas (Theo Mandel Regla 1: Control del Usuario y salidas limpias)
    const closeSuiteModal = () => {
      modal.classList.remove('active');
      this.persistState();
      this.renderAdultDashboardPanel();
      document.removeEventListener('keydown', handleEscSuite);
    };

    const handleEscSuite = (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeSuiteModal();
      }
    };
    document.addEventListener('keydown', handleEscSuite);

    modal.onclick = (e) => {
      if (e.target === modal) {
        closeSuiteModal();
      }
    };

    document.getElementById('btnCloseEvalSuite').addEventListener('click', closeSuiteModal);

    modal.querySelectorAll('.eval-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeReportTab = btn.dataset.etab;
        this.renderReportModalInner(modal);
      });
    });

    document.getElementById('btnEvalNewSession').addEventListener('click', () => {
      modal.classList.remove('active');
      this.openConfigModal();
    });

    document.getElementById('btnEvalExportJson').addEventListener('click', () => {
      const jsonStr = JSON.stringify(this.generateFullExportObject(), null, 2);
      this.downloadFile(jsonStr, `${this.session.sessionId.toLowerCase()}.json`, 'application/json');
    });

    document.getElementById('btnEvalExportCsv').addEventListener('click', () => {
      this.downloadFile(this.generateCsvReport(), `${this.session.sessionId.toLowerCase()}_kpis.csv`, 'text/csv;charset=utf-8;');
    });

    document.getElementById('btnEvalCopyJson').addEventListener('click', () => {
      const jsonStr = JSON.stringify(this.generateFullExportObject(), null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(jsonStr);
      }
      const toast = document.getElementById('evalCopyToast');
      if (toast) {
        toast.hidden = false;
        setTimeout(() => { toast.hidden = true; }, 2200);
      }
    });

    this.bindDynamicSuiteTabEvents(modal);
  }

  renderActiveSuiteTabHtml() {
    if (this.activeReportTab === 'fonetica') return this.renderTabFoneticaHtml();
    if (this.activeReportTab === 'pssuq-mars') return this.renderTabPssuqMarsHtml();
    if (this.activeReportTab === 'nielsen') return this.renderTabNielsenHtml();
    return this.renderTabResumenHtml();
  }

  renderTabResumenHtml() {
    const k = this.kpis;
    const pill = (ok, labelOk = '🟢 Cumple Meta', labelWarn = '🟡 Revisar') =>
      `<span class="kpi-tag ${ok ? 'tag-green' : 'tag-yellow'}">${ok ? labelOk : labelWarn}</span>`;

    const hasPhonations = this.phonations.length > 0;
    const accText = hasPhonations
      ? `${k.targetAccuracyOverallPct}% (Aisladas: ${k.targetAccuracyIsolatedPct}% | Continuas: ${k.targetAccuracyContinuousPct}%)`
      : 'Sin muestras aún (use micrófono o pestaña 2)';

    return `
      <div class="eval-highlight-cards">
        <div class="eval-stat-card">
          <span class="eval-stat-label">Nielsen (0–4) • Saeedi et al.</span>
          <strong class="eval-stat-val">${k.nielsenMeanSeverity} / 4.0</strong>
          <span class="eval-stat-meta">Meta ≤ 1.50 | H5 Prevención: ${k.nielsenH5Severity} (&lt;1.0)</span>
        </div>
        <div class="eval-stat-card">
          <span class="eval-stat-label">PSSUQ Mediador • Saeedi et al.</span>
          <strong class="eval-stat-val">${k.pssuqOverallMean} / 7.0</strong>
          <span class="eval-stat-meta">Meta ≥ 6.00 | Interfaz: ${k.pssuqInterfaceQuality} (≥6.25)</span>
        </div>
        <div class="eval-stat-card">
          <span class="eval-stat-label">Escala MARS • Furlong et al.</span>
          <strong class="eval-stat-val">${k.marsTotalScore} / 5.0</strong>
          <span class="eval-stat-meta">Meta ≥ 4.20 (Mercado comercial: 3.7)</span>
        </div>
        <div class="eval-stat-card">
          <span class="eval-stat-label">Aceptación Emojis (3–6 años)</span>
          <strong class="eval-stat-val">${k.emojiAcceptancePct}%</strong>
          <span class="eval-stat-meta">Meta Saeedi et al. (2024): ≥ 90%</span>
        </div>
      </div>

      <table class="report-kpi-table">
        <thead>
          <tr>
            <th>KPI / Instrumento</th>
            <th>Fuente Científica</th>
            <th>Valor Registrado</th>
            <th>Meta Objetivo</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>KPI-01: Navegación Autónoma No Textual (SA%)</strong></td>
            <td>Saeedi et al. (2024); Liu et al. (2026)</td>
            <td>${k.saPercent}% (CA: ${k.caPercent}%)</td>
            <td>≥ 85%</td>
            <td>${pill(k.saPercent >= 85)}</td>
          </tr>
          <tr>
            <td><strong>KPI-02: Eficiencia y Contingencia (&lt;300 ms)</strong></td>
            <td>Peña et al. (2024); Du et al. (2023)</td>
            <td>TTFT: ${k.ttftAvgSec}s | Biofeedback: ${k.avclAvgMs} ms</td>
            <td>AVCL &lt; 300 ms</td>
            <td>${pill(k.avclAvgMs < 300)}</td>
          </tr>
          <tr>
            <td><strong>KPI-03: Precisión Motriz en Botones ≥48×48 dp</strong></td>
            <td>Liu et al. (2026); WCAG 2.2 SC 2.5.8</td>
            <td>Acierto táctil: ${k.targetHitPercent}% (Miss: ${k.tmrPercent}%)</td>
            <td>Miss &lt; 20%</td>
            <td>${pill(k.tmrPercent < 20)}</td>
          </tr>
          <tr>
            <td><strong>KPI-04: Prevención de Errores en Franja Palmar</strong></td>
            <td>Saeedi et al. (2024) [Heurística H5]</td>
            <td>${k.palmTouchesFiltered} toques absorbidos (${k.palmFalseActivations} falsos clics)</td>
            <td>0 falsos clics</td>
            <td>${pill(k.palmFalseActivations === 0)}</td>
          </tr>
          <tr>
            <td><strong>KPI-05: Precisión Fonética (Target Accuracy)</strong></td>
            <td>Strömbergsson et al. (2025); Bosch &amp; Melgar</td>
            <td>${accText}</td>
            <td>Trazabilidad SCED</td>
            <td><span class="kpi-tag tag-green">📈 Registrado</span></td>
          </tr>
          <tr>
            <td><strong>KPI-06: Tipología de PSF Identificados (O / S / D)</strong></td>
            <td>Pucuhuaranga (2016); Peña et al. (2024)</td>
            <td>Omisiones: ${k.psfOmissions} | Sustituciones: ${k.psfSubstitutions} | Distorsiones: ${k.psfDistortions}</td>
            <td>Clasificación TEPROSIF</td>
            <td><span class="kpi-tag tag-purple">📋 Clasificado</span></td>
          </tr>
          <tr>
            <td><strong>KPI-07: Concordancia ASR vs. Juicio Humano</strong></td>
            <td>Strömbergsson et al. (2025)</td>
            <td>${k.asrHumanAgreementPct}% acuerdo (FP: ${k.asrFalsePositives} | FN: ${k.asrFalseNegatives})</td>
            <td>≥ 85% acuerdo</td>
            <td>${pill(k.asrHumanAgreementPct >= 85)}</td>
          </tr>
          <tr>
            <td><strong>KPI-08: Pureza Fonoacústica y Rescate DDA</strong></td>
            <td>Furlong et al. (2018); Strömbergsson (2025)</td>
            <td>${this.schwaAntipatternDetected ? 'Alerta Schwa' : '0% Schwa [ə]'} | Rescates DDA: ${k.ddaActivationsCount}</td>
            <td>0% Schwa [ə]</td>
            <td>${pill(!this.schwaAntipatternDetected)}</td>
          </tr>
          <tr>
            <td><strong>KPI-09: 10 Heurísticas de Nielsen (Escala 0–4)</strong></td>
            <td>Saeedi et al. (2024)</td>
            <td>Media: ${k.nielsenMeanSeverity}/4.0 | H5: ${k.nielsenH5Severity} | H3: ${k.nielsenH3Severity}</td>
            <td>≤ 1.50 (H5 &lt; 1.0)</td>
            <td>${pill(k.nielsenMeanSeverity <= 1.5 && k.nielsenH5Severity < 1.0)}</td>
          </tr>
          <tr>
            <td><strong>KPI-10: Cuestionario Pictórico Emojis (3–6 años)</strong></td>
            <td>Saeedi et al. (2024)</td>
            <td>${k.emojiAcceptancePct}% aceptación positiva (MathGate: ${k.mathGateTctSec}s)</td>
            <td>≥ 90%</td>
            <td>${pill(k.emojiAcceptancePct >= 90)}</td>
          </tr>
          <tr>
            <td><strong>KPI-11: Satisfacción Mediador PSSUQ (1–7)</strong></td>
            <td>Saeedi et al. (2024); Huertas &amp; Roque (2023)</td>
            <td>Global: ${k.pssuqOverallMean}/7.0 | Calidad Interfaz: ${k.pssuqInterfaceQuality}/7.0</td>
            <td>≥ 6.00 (UI ≥ 6.25)</td>
            <td>${pill(k.pssuqOverallMean >= 6.0 && k.pssuqInterfaceQuality >= 6.25)}</td>
          </tr>
          <tr>
            <td><strong>KPI-12: Calidad Integral mHealth MARS (1–5)</strong></td>
            <td>Furlong et al. (2018)</td>
            <td>Total MARS: ${k.marsTotalScore} / 5.0</td>
            <td>≥ 4.20 / 5.0</td>
            <td>${pill(k.marsTotalScore >= 4.2)}</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  renderTabFoneticaHtml() {
    const k = this.kpis;
    const rowsHtml = this.phonations.length === 0
      ? `<tr><td colspan="7" style="text-align:center; padding: 18px; color:#64748B;">No se han registrado intentos vocales aún. Puedes grabar con el micrófono durante una sesión o añadir una palabra test de Bosch &amp; Melgar abajo.</td></tr>`
      : this.phonations.map((p, idx) => {
          const concBadge = p.concordance === 'AGREEMENT'
            ? '<span class="kpi-tag tag-green">✔ Concordante</span>'
            : (p.concordance === 'FALSE_POSITIVE'
                ? '<span class="kpi-tag tag-yellow">⚠️ Falso Positivo (FP)</span>'
                : '<span class="kpi-tag tag-purple">⚠️ Falso Negativo (FN)</span>');

          return `
            <tr>
              <td><strong>#${idx + 1}</strong></td>
              <td><strong>${p.targetWord}</strong><br><small style="color:#64748B;">${p.phoneme} • ${p.position}</small></td>
              <td>${p.context === 'continuous' ? 'Frase / Trabalenguas' : 'Palabra Aislada'}</td>
              <td>${p.asrApproved ? '<span class="kpi-tag tag-green">Aprobó (⭐)</span>' : '<span class="kpi-tag tag-purple">Reintento / DDA</span>'}</td>
              <td>
                <select class="eval-inline-select sel-human-psf" data-pidx="${idx}" aria-label="Juicio perceptual humano">
                  <option value="CORRECT" ${p.humanJudgment === 'CORRECT' ? 'selected' : ''}>✔ Correcto (Sin PSF)</option>
                  <option value="O" ${p.humanJudgment === 'O' ? 'selected' : ''}>O: Omisión</option>
                  <option value="S" ${p.humanJudgment === 'S' ? 'selected' : ''}>S: Sustitución</option>
                  <option value="D" ${p.humanJudgment === 'D' ? 'selected' : ''}>D: Distorsión</option>
                </select>
              </td>
              <td>${concBadge}</td>
              <td>${(p.durationMs / 1000).toFixed(2)}s</td>
            </tr>
          `;
        }).join('');

    return `
      <div class="eval-section-note">
        <strong>Auditoría Fonética Bosch &amp; Melgar y Calibración ASR vs. Humano (Strömbergsson et al., 2025; Pucuhuaranga, 2016):</strong>
        Clasifica los Procesos de Simplificación Fonológica en <strong>Omisión (O)</strong>, <strong>Sustitución (S)</strong> y <strong>Distorsión (D)</strong>, verificando que las estrellas automáticas concuerden con el oído humano.
      </div>

      <div class="eval-highlight-cards">
        <div class="eval-stat-card">
          <span class="eval-stat-label">Target Accuracy Global</span>
          <strong class="eval-stat-val">${this.phonations.length ? k.targetAccuracyOverallPct + '%' : '—'}</strong>
          <span class="eval-stat-meta">Aisladas: ${k.targetAccuracyIsolatedPct}% | Continuas: ${k.targetAccuracyContinuousPct}%</span>
        </div>
        <div class="eval-stat-card">
          <span class="eval-stat-label">Desglose PSF (TEPROSIF-R)</span>
          <strong class="eval-stat-val">O:${k.psfOmissions} • S:${k.psfSubstitutions} • D:${k.psfDistortions}</strong>
          <span class="eval-stat-meta">Total errores PSF: ${k.psfOmissions + k.psfSubstitutions + k.psfDistortions}</span>
        </div>
        <div class="eval-stat-card">
          <span class="eval-stat-label">Acuerdo ASR vs. Humano</span>
          <strong class="eval-stat-val">${this.phonations.length ? k.asrHumanAgreementPct + '%' : '100%'}</strong>
          <span class="eval-stat-meta">Falsos Positivos: ${k.asrFalsePositives} | Falsos Negativos: ${k.asrFalseNegatives}</span>
        </div>
      </div>

      <table class="report-kpi-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Palabra / Posición</th>
            <th>Contexto</th>
            <th>Veredicto App (ASR)</th>
            <th>Juicio Humano (PSF)</th>
            <th>Concordancia</th>
            <th>Duración</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="eval-manual-sample-bar">
        <strong>+ Registrar muestra observada (Ficha Bosch &amp; Melgar):</strong>
        <select id="selManualWord" class="eval-inline-select">
          <option value="Rana">Rana (/rr/ Inicial)</option>
          <option value="Pera">Pera (/r/ Medial)</option>
          <option value="Collar">Collar (/r/ Final)</option>
          <option value="Sapo">Sapo (/s/ Inicial)</option>
          <option value="Vaso">Vaso (/s/ Medial)</option>
          <option value="Plátano">Plátano (/pl/ Sinfón)</option>
          <option value="Guitarra">Guitarra (/rr/ Medial)</option>
          <option value="Erre con erre guitarra">Trabalenguas continuo (/rr/)</option>
        </select>
        <select id="selManualAsr" class="eval-inline-select">
          <option value="1">App: Aprobó (⭐)</option>
          <option value="0">App: Reintento / DDA</option>
        </select>
        <select id="selManualHuman" class="eval-inline-select">
          <option value="CORRECT">Humano: ✔ Correcto</option>
          <option value="S">Humano: S (Sustitución)</option>
          <option value="O">Humano: O (Omisión)</option>
          <option value="D">Humano: D (Distorsión)</option>
        </select>
        <button type="button" id="btnAddManualSample" class="eval-btn eval-btn-primary" style="padding: 6px 14px;">+ Añadir</button>
      </div>
    `;
  }

  renderTabPssuqMarsHtml() {
    const k = this.kpis;
    return `
      <div class="eval-section-note">
        <strong>Capa 2 — Validación con Mediadores Accesibles (Docentes de Inicial / Tutores):</strong>
        Instrumentos estandarizados <strong>PSSUQ</strong> (escala 1 a 7, meta global ≥ 6.0 y Calidad de Interfaz ≥ 6.25; <em>Saeedi et al., 2024</em>) y <strong>Escala MARS</strong> (escala 1 a 5, meta ≥ 4.20; <em>Furlong et al., 2018</em>).
      </div>

      <h3 class="eval-subtitle-block">A. Cuestionario PSSUQ (Post-Study System Usability Questionnaire)</h3>
      <div class="eval-likert-anchors-legend" style="display: flex; justify-content: space-between; align-items: center; background: #F1F8E9; border: 1px solid #C8E6C9; padding: 6px 12px; border-radius: 8px; font-size: 0.78rem; font-weight: 600; color: #2E7D32; margin-bottom: 10px;">
        <span>1 = Totalmente en desacuerdo</span>
        <span>4 = Neutral / Aceptable</span>
        <span>7 = Totalmente de acuerdo</span>
      </div>
      <div class="eval-likert-list">
        ${this.pssuqItems.map((item, idx) => `
          <div class="eval-likert-row">
            <div class="eval-likert-info">
              <span class="eval-mini-badge">${item.id} • ${item.tag}</span>
              <p>${item.text}</p>
            </div>
            <div class="eval-likert-pills" role="group" aria-label="${item.id}">
              ${[1, 2, 3, 4, 5, 6, 7].map(val => `
                <button type="button" class="likert-num-btn ${Number(item.score) === val ? 'active' : ''}" data-pssuq-idx="${idx}" data-val="${val}">${val}</button>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <h3 class="eval-subtitle-block" style="margin-top: 18px;">B. Escala de Calidad mHealth MARS (1 = Inadecuado • 5 = Excelente | Media mercado: 3.7)</h3>
      <div class="eval-mars-grid">
        ${this.marsDimensions.map((m, idx) => `
          <div class="eval-mars-card">
            <div class="eval-mars-top">
              <strong>${m.name}</strong>
              <span class="kpi-tag tag-green">${m.score} / 5.0</span>
            </div>
            <p>${m.desc}</p>
            <div class="eval-mars-controls">
              <small>Benchmark comercial: ${m.benchmark}</small>
              <select class="eval-inline-select sel-mars-score" data-midx="${idx}">
                ${[3.0, 3.5, 4.0, 4.2, 4.5, 4.8, 5.0].map(v => `
                  <option value="${v}" ${Number(m.score) === v ? 'selected' : ''}>${v.toFixed(1)} / 5.0</option>
                `).join('')}
              </select>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="eval-teacher-notes-box">
        <label for="txtTeacherAlertNotes"><strong>C. Necesidades y Alertas Fonológicas Docentes en Lima Metropolitana (Huertas &amp; Roque, 2023):</strong></label>
        <textarea id="txtTeacherAlertNotes" rows="2" class="eval-input" placeholder="Observaciones del docente de inicial o tutor sobre la utilidad del Dashboard TEPROSIF-R...">${this.session.teacherClassroomNotes || ''}</textarea>
      </div>
    `;
  }

  renderTabNielsenHtml() {
    const k = this.kpis;
    return `
      <div class="eval-section-note">
        <strong>Capa 1 — Inspección Heurística Cruzada entre Pares (Equipo G7 - UNMSM):</strong>
        Clasificación de severidad de <strong>0 a 4</strong> (<em>0 = Sin problema, 1 = Cosmético, 2 = Menor, 3 = Mayor, 4 = Catástrofe</em>; <strong>Saeedi et al., 2024</strong>) y auditoría de pureza acústica sin <em>schwa</em> <code>[ə]</code> (<strong>Furlong et al., 2018</strong>).
      </div>

      <table class="report-kpi-table">
        <thead>
          <tr>
            <th>Heurística de Nielsen</th>
            <th>Aspecto Auditado en "Bosque Sonoro"</th>
            <th>Severidad (0 a 4)</th>
          </tr>
        </thead>
        <tbody>
          ${this.nielsenHeuristics.map((h, idx) => `
            <tr class="${h.critical ? 'eval-row-highlight' : ''}">
              <td><strong>${h.name}</strong></td>
              <td>${h.desc}</td>
              <td>
                <select class="eval-inline-select sel-nielsen-sev" data-hidx="${idx}">
                  ${[0, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0].map(v => `
                    <option value="${v}" ${Number(h.severity) === v ? 'selected' : ''}>${v.toFixed(2)} ${v === 0 ? '(Sin problema)' : (v <= 1 ? '(Cosmético)' : (v <= 2 ? '(Menor)' : '(Mayor/Crítico)'))}</option>
                  `).join('')}
                </select>
              </td>
            </tr>
          `).join('')}
          <tr class="eval-row-highlight">
            <td><strong>FA-01: Ausencia de Antipatrones Fonéticos (Furlong et al., 2018)</strong></td>
            <td>Locución natural de Lima Metropolitana y erradicación estricta de vocal neutra parásita <em>schwa</em> <code>[ə]</code> al aislar consonantes.</td>
            <td>
              <select id="selSchwaAudit" class="eval-inline-select">
                <option value="clean" ${!this.schwaAntipatternDetected ? 'selected' : ''}>0.00 (✓ Cero Schwa verificado)</option>
                <option value="detected" ${this.schwaAntipatternDetected ? 'selected' : ''}>3.00 (⚠️ Schwa detectada)</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="eval-nielsen-summary-strip">
        <span><strong>Severidad Promedio Global:</strong> ${k.nielsenMeanSeverity} / 4.0 (Meta ≤ 1.50)</span>
        <span><strong>H05 Prevención de Errores:</strong> ${k.nielsenH5Severity} / 4.0 (Meta &lt; 1.00 vs. 3.83 en Saeedi et al.)</span>
        <span><strong>H03 Control y Libertad:</strong> ${k.nielsenH3Severity} / 4.0</span>
      </div>
    `;
  }

  bindDynamicSuiteTabEvents(modal) {
    // Tab 2: Juicio humano PSF inline
    modal.querySelectorAll('.sel-human-psf').forEach(sel => {
      sel.addEventListener('change', () => {
        const idx = parseInt(sel.dataset.pidx, 10);
        this.setHumanJudgmentForPhonation(idx, sel.value);
        this.renderReportModalInner(modal);
      });
    });

    const btnAddManual = modal.querySelector('#btnAddManualSample');
    if (btnAddManual) {
      btnAddManual.addEventListener('click', () => {
        const word = document.getElementById('selManualWord').value;
        const asrOk = document.getElementById('selManualAsr').value === '1';
        const humanJ = document.getElementById('selManualHuman').value;
        const isCont = word.split(/\s+/).length >= 3 ? 'continuous' : 'isolated';
        this.addManualBoschMelgarSample(word, isCont, asrOk, humanJ);
        this.renderReportModalInner(modal);
      });
    }

    // Tab 3: PSSUQ 1-7 & MARS 1-5
    modal.querySelectorAll('.likert-num-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.pssuqIdx, 10);
        const val = parseInt(btn.dataset.val, 10);
        if (this.pssuqItems[idx]) {
          this.pssuqItems[idx].score = val;
          this.calculateConsolidatedKPIs();
          this.persistState();
          this.renderReportModalInner(modal);
        }
      });
    });

    modal.querySelectorAll('.sel-mars-score').forEach(sel => {
      sel.addEventListener('change', () => {
        const idx = parseInt(sel.dataset.midx, 10);
        if (this.marsDimensions[idx]) {
          this.marsDimensions[idx].score = parseFloat(sel.value);
          this.calculateConsolidatedKPIs();
          this.persistState();
          this.renderReportModalInner(modal);
        }
      });
    });

    const txtNotes = modal.querySelector('#txtTeacherAlertNotes');
    if (txtNotes) {
      txtNotes.addEventListener('input', () => {
        this.session.teacherClassroomNotes = txtNotes.value;
        this.persistState();
      });
    }

    // Tab 4: Nielsen 0-4 & Schwa
    modal.querySelectorAll('.sel-nielsen-sev').forEach(sel => {
      sel.addEventListener('change', () => {
        const idx = parseInt(sel.dataset.hidx, 10);
        if (this.nielsenHeuristics[idx]) {
          this.nielsenHeuristics[idx].severity = parseFloat(sel.value);
          this.calculateConsolidatedKPIs();
          this.persistState();
          this.renderReportModalInner(modal);
        }
      });
    });

    const selSchwa = modal.querySelector('#selSchwaAudit');
    if (selSchwa) {
      selSchwa.addEventListener('change', () => {
        this.schwaAntipatternDetected = selSchwa.value === 'detected';
        this.calculateConsolidatedKPIs();
        this.persistState();
        this.renderReportModalInner(modal);
      });
    }
  }

  /* ==========================================================================
     9. PANEL EMBEBIDO EN EL PORTAL CLÍNICO ADULTO (SCREEN-ADULT TAB 5)
     ========================================================================== */
  renderAdultDashboardPanel() {
    const container = document.getElementById('adultScedEvalPanel');
    if (!container) return;

    this.calculateConsolidatedKPIs();
    const k = this.kpis;
    const remoteUrl = this.getRemoteEvaluatorUrl();

    container.innerHTML = `
      <!-- Tarjeta Destacada de Enlace con Laptop del Evaluador (IP LAN) -->
      <div class="eval-dash-pairing-card" style="margin: 0 0 16px; padding: 16px 20px; background: rgba(46, 125, 50, 0.08); border: 2px solid #2E7D32; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
          <h4 style="margin: 0; font-size: 1rem; color: #1B5E20; display: flex; align-items: center; gap: 8px;">
            💻 Vincular este APK con la Laptop del Evaluador:
          </h4>
          <span id="dashServerConnBadge" style="font-size: 0.8rem; font-weight: 700; padding: 4px 12px; border-radius: 20px; background: ${this.hasCustomServer() ? '#E8F5E9' : '#F5F5F5'}; color: ${this.hasCustomServer() ? '#2E7D32' : '#666'}; border: 1px solid ${this.hasCustomServer() ? '#A5D6A7' : '#CCC'};">
            ${this.hasCustomServer() ? `🟢 Enlazado: ${this.getCurrentServerOrigin()}` : '⚪ Modo Local (Sin Laptop)'}
          </span>
        </div>
        <p style="font-size: 0.82rem; color: #475569; margin: 0 0 10px 0;">
          Asegúrate de que este teléfono/tablet y la laptop del evaluador estén en la <strong>misma red Wi-Fi</strong>. Escribe la IPv4 de la laptop (ej: <code>192.168.1.15</code> o <code>10.44.87.221</code>) para conectar el APK con <code>evaluador.html</code> en tiempo real.
        </p>
        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <input type="text" id="inpDashServerOrigin" class="eval-input" style="flex: 1; min-width: 220px; padding: 10px 14px; font-size: 0.95rem; font-family: monospace; border: 2px solid #81C784; background: #FFF; border-radius: 10px;" placeholder="Ej: 192.168.1.15" value="${this.getCurrentServerOrigin()}">
          <button type="button" id="btnDashSaveServer" class="touch-btn btn-primary" style="padding: 10px 20px; font-size: 0.9rem; font-weight: 700; white-space: nowrap;">
            ⚡ Enlazar Laptop
          </button>
        </div>
        <div id="dashServerConnFeedback" style="font-size: 0.8rem; margin-top: 8px; font-weight: 600; min-height: 20px; color: ${this.hasCustomServer() ? '#2E7D32' : '#555'};">
          ${this.hasCustomServer() ? `✅ Enlace activo: ${this.getCurrentServerOrigin()}` : 'Escribe la IP de la laptop y pulsa "Enlazar Laptop".'}
        </div>
      </div>

      <div class="sced-dashboard-banner">
        <div>
          <span class="eval-pill-eyebrow">Actividad 10 • Diseño Micro-SCED Acotado (Equipo G7 - UNMSM)</span>
          <h3 class="calib-card-title" style="margin: 4px 0;">🧪 Centro de Evaluación Zero-HUD y Mando Remoto</h3>
          <p style="font-size: 0.83rem; color: #475569; margin: 0;">
            La pantalla del niño permanece <strong>100% limpia</strong> (sin recuadros del evaluador). Abre la <strong>App Remota del Evaluador</strong> en tu celular o laptop (Sala <code>${this.roomCode}</code>: <code>${remoteUrl}</code>) para calificar PSF en tiempo real sin tocar la tableta del niño.
          </p>
        </div>
        <div class="sced-banner-btns">
          <button type="button" id="btnDashOpenRemoteApp" class="touch-btn btn-amber" style="font-size: 0.85rem; padding: 10px 16px;">
            📱 Abrir App Remota (evaluador.html)
          </button>
          <button type="button" id="btnDashStartSced" class="touch-btn btn-primary" style="font-size: 0.85rem; padding: 10px 16px;">
            ${this.isActive ? '🏁 Cerrar Sesión Activa y Abrir Emojis' : '🚀 Iniciar Modo Evaluación Infantil'}
          </button>
          <button type="button" id="btnDashOpenSuite" class="touch-btn btn-secondary" style="font-size: 0.85rem; padding: 10px 16px;">
            📊 Suite Local PSSUQ / MARS / Nielsen
          </button>
          <button type="button" id="btnDashDownloadJson" class="touch-btn btn-secondary" style="font-size: 0.85rem; padding: 10px 16px;">
            📥 Exportar JSON
          </button>
        </div>
      </div>

      <div class="eval-highlight-cards" style="margin-top: 14px;">
        <div class="eval-stat-card">
          <span class="eval-stat-label">Severidad Nielsen (0–4)</span>
          <strong class="eval-stat-val">${k.nielsenMeanSeverity} / 4.0</strong>
          <span class="eval-stat-meta">H5 Prevención Errores: ${k.nielsenH5Severity} (&lt;1.0)</span>
        </div>
        <div class="eval-stat-card">
          <span class="eval-stat-label">Satisfacción PSSUQ (1–7)</span>
          <strong class="eval-stat-val">${k.pssuqOverallMean} / 7.0</strong>
          <span class="eval-stat-meta">Calidad Interfaz: ${k.pssuqInterfaceQuality} / 7.0</span>
        </div>
        <div class="eval-stat-card">
          <span class="eval-stat-label">Calidad mHealth MARS</span>
          <strong class="eval-stat-val">${k.marsTotalScore} / 5.0</strong>
          <span class="eval-stat-meta">Meta ≥ 4.20 | Cero Schwa [ə]</span>
        </div>
        <div class="eval-stat-card">
          <span class="eval-stat-label">Emojis &amp; Acuerdo ASR</span>
          <strong class="eval-stat-val">${k.emojiAcceptancePct}% | ${k.asrHumanAgreementPct}%</strong>
          <span class="eval-stat-meta">Emojis (≥90%) | Acuerdo ASR/Humano</span>
        </div>
      </div>
    `;

    // Vincular lógica de enlace IP directo en el panel
    const inpDashServer = document.getElementById('inpDashServerOrigin');
    const btnDashServer = document.getElementById('btnDashSaveServer');
    const fbDashServer = document.getElementById('dashServerConnFeedback');
    const badgeDashServer = document.getElementById('dashServerConnBadge');

    const handleDashLink = async () => {
      let rawVal = (inpDashServer?.value || '').trim();
      if (!rawVal) {
        localStorage.removeItem('bosque_sced_server_origin');
        if (fbDashServer) {
          fbDashServer.style.color = '#555';
          fbDashServer.textContent = '⚪ Enlace removido. Modo local activo.';
        }
        if (badgeDashServer) {
          badgeDashServer.style.color = '#666';
          badgeDashServer.textContent = '⚪ Modo Local';
        }
        this.connectSseRoom(this.roomCode);
        return;
      }

      let formatted = rawVal;
      if (!/^https?:\/\//i.test(formatted)) {
        formatted = `http://${formatted}`;
      }
      if (!/:\d+$/.test(formatted)) {
        formatted = `${formatted}:5173`;
      }
      inpDashServer.value = formatted;

      if (fbDashServer) {
        fbDashServer.style.color = '#1565C0';
        fbDashServer.textContent = `⏳ Verificando conexión con ${formatted}...`;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const resp = await fetch(`${formatted}/api/sced-info`, { method: 'GET', mode: 'cors', signal: controller.signal });
        clearTimeout(timeoutId);

        if (resp.ok) {
          localStorage.setItem('bosque_sced_server_origin', formatted);
          if (fbDashServer) {
            fbDashServer.style.color = '#2E7D32';
            fbDashServer.textContent = `✅ ¡Enlazado exitosamente con la laptop! (${formatted})`;
          }
          if (badgeDashServer) {
            badgeDashServer.style.color = '#2E7D32';
            badgeDashServer.style.background = '#E8F5E9';
            badgeDashServer.textContent = `🟢 Enlazado: ${formatted}`;
          }
          this.connectSseRoom(this.roomCode);
          this.broadcastStateSnapshot('EVALUATOR_LINKED_OK');
        } else {
          throw new Error(`HTTP ${resp.status}`);
        }
      } catch (err) {
        localStorage.setItem('bosque_sced_server_origin', formatted);
        if (fbDashServer) {
          fbDashServer.style.color = '#E65100';
          fbDashServer.textContent = `⚠️ IP guardada (${formatted}). Si la laptop ya corre "npm run dev" en la misma Wi-Fi, la telemetría se enviará automáticamente.`;
        }
        if (badgeDashServer) {
          badgeDashServer.style.color = '#E65100';
          badgeDashServer.textContent = `🟡 Guardado: ${formatted}`;
        }
        this.connectSseRoom(this.roomCode);
      }
    };

    if (btnDashServer) {
      btnDashServer.addEventListener('click', handleDashLink);
    }
    if (inpDashServer) {
      inpDashServer.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleDashLink();
        }
      });
    }

    const btnRemote = document.getElementById('btnDashOpenRemoteApp');
    if (btnRemote) {
      btnRemote.onclick = () => this.openRemoteEvaluatorWindow();
    }

    const btnStart = document.getElementById('btnDashStartSced');
    if (btnStart) {
      btnStart.onclick = () => {
        if (this.isActive) {
          this.finishChildSession();
        } else {
          this.openConfigModal();
        }
      };
    }

    const btnSuite = document.getElementById('btnDashOpenSuite');
    if (btnSuite) {
      btnSuite.onclick = () => this.openEvaluationReportModal('pssuq-mars');
    }

    const btnJson = document.getElementById('btnDashDownloadJson');
    if (btnJson) {
      btnJson.onclick = () => {
        const jsonStr = JSON.stringify(this.generateFullExportObject(), null, 2);
        this.downloadFile(jsonStr, `${this.session.sessionId.toLowerCase()}.json`, 'application/json');
      };
    }
  }

  /* ==========================================================================
     10. ESQUEMA DE EXPORTACIÓN JSON (SCEDSessionTelemetrySchema) Y CSV
     ========================================================================== */
  generateFullExportObject() {
    this.calculateConsolidatedKPIs();
    const k = this.kpis;
    const marsMap = {};
    this.marsDimensions.forEach(m => { marsMap[m.id] = m.score; });

    return {
      session_id: this.session.sessionId,
      study_scope: "Piloto Acotado Micro-SCED (Grupo G7 FISI-UNMSM - Sin Financiamiento Externo)",
      statistical_readiness: "Exportación estructurada para Prueba de Kruskal-Wallis / U de Mann-Whitney (p < 0.05; Mora Espinoza et al., 2024)",
      metadata: {
        participant_id: this.session.participantId,
        child_pseudonym: this.session.childPseudonym,
        age_years: this.session.childAge,
        initial_condition: this.session.condition,
        mediator_role: this.session.mediatorRole,
        visual_mode: this.session.visualMode,
        start_timestamp: this.session.startTimestampIso || new Date().toISOString(),
        end_timestamp: this.session.endTimestampIso || new Date().toISOString(),
        session_duration_sec: this.session.totalDurationSec,
        teacher_classroom_alerts_lima: this.session.teacherClassroomNotes
      },
      technical_usability_metrics: {
        autonomous_navigation_sa_pct: k.saPercent,
        assisted_navigation_ca_pct: k.caPercent,
        non_completed_nc_pct: k.ncPercent,
        time_to_first_touch_avg_sec: k.ttftAvgSec,
        task_completion_time_avg_sec: k.tctAvgSec,
        mathgate_adult_tct_sec: k.mathGateTctSec,
        touch_target_compliance_min_dp: 48,
        target_hit_accuracy_pct: k.targetHitPercent,
        target_miss_rate_pct: k.tmrPercent,
        palm_rest_filtered_touches: k.palmTouchesFiltered,
        palm_rest_false_activations: k.palmFalseActivations,
        biofeedback_contingency_latency_ms: k.avclAvgMs,
        schwa_antipattern_detected: this.schwaAntipatternDetected
      },
      phonetic_sced_evaluation: {
        instrument_reference: "Ficha Laura Bosch & María Melgar (Pucuhuaranga, 2016) + TEPROSIF-R (Peña et al., 2024)",
        target_accuracy_overall_pct: k.targetAccuracyOverallPct,
        target_accuracy_isolated_words_pct: k.targetAccuracyIsolatedPct,
        target_accuracy_continuous_phrase_pct: k.targetAccuracyContinuousPct,
        avg_phonatory_effort_duration_sec: k.apedAvgSec,
        dda_rescue_activations_count: k.ddaActivationsCount,
        psf_error_breakdown: {
          omissions_O: k.psfOmissions,
          substitutions_S: k.psfSubstitutions,
          distortions_D: k.psfDistortions
        },
        asr_vs_human_calibration: {
          reference: "Strömbergsson et al. (2025)",
          total_vocal_attempts: this.phonations.length,
          concordant_judgments: this.phonations.filter(p => p.concordance === 'AGREEMENT').length,
          false_positives_app_approved_error: k.asrFalsePositives,
          false_negatives_app_rejected_correct: k.asrFalseNegatives,
          agreement_rate_pct: k.asrHumanAgreementPct
        },
        vocal_attempts_detail: this.phonations
      },
      standardized_scales_scores: {
        nielsen_heuristics_0_to_4: {
          reference: "Saeedi et al. (2024)",
          overall_mean_severity: k.nielsenMeanSeverity,
          error_prevention_h5_severity: k.nielsenH5Severity,
          user_control_h3_severity: k.nielsenH3Severity,
          heuristics_breakdown: this.nielsenHeuristics
        },
        child_emoji_pictorial_questionnaire: {
          reference: "Saeedi et al. (2024); Liu et al. (2026)",
          visual_appeal_emoji_1_to_3: this.emojiAnswers.visualAppeal,
          emotional_comfort_emoji_1_to_3: this.emojiAnswers.emotionalComfort,
          intention_to_play_again_emoji_1_to_3: this.emojiAnswers.playAgainIntent,
          positive_acceptance_rate_pct: k.emojiAcceptancePct
        },
        mediator_pssuq_1_to_7: {
          reference: "Saeedi et al. (2024)",
          overall_mean: k.pssuqOverallMean,
          system_usefulness: k.pssuqSystemUsefulness,
          information_quality_teprosif: k.pssuqInfoQuality,
          interface_quality: k.pssuqInterfaceQuality,
          items: this.pssuqItems
        },
        mhealth_mars_scale_1_to_5: {
          reference: "Furlong et al. (2018)",
          engagement: marsMap.engagement,
          functionality: marsMap.functionality,
          aesthetics: marsMap.aesthetics,
          clinical_information: marsMap.information,
          total_mars_score: k.marsTotalScore
        }
      },
      tasks_log: this.tasks,
      detailed_events_log: this.detailedEventsLog
    };
  }

  generateCsvReport() {
    this.calculateConsolidatedKPIs();
    const k = this.kpis;
    const lines = [
      "Seccion,Codigo,Indicador,Valor,Unidad_Escala,Meta_Literatura,Fuente_Referencia",
      `Sesion,META,Participant_ID,${this.session.participantId},ID,Anonimo_Ley29733,UNMSM_G7`,
      `Sesion,META,Edad_Preescolar,${this.session.childAge},anios,3_a_6,Saeedi_et_al_2024`,
      `Usabilidad,KPI-01,Navegacion_Autonoma_SA,${k.saPercent},%,>=85%,Liu_et_al_2026`,
      `Usabilidad,KPI-02,Latencia_Contingencia_AVCL,${k.avclAvgMs},ms,<300ms,Pena_et_al_2024`,
      `Usabilidad,KPI-02B,Tiempo_Primer_Toque_TTFT,${k.ttftAvgSec},seg,<3.5s,ISO_9241_11`,
      `Ergonomia,KPI-03,Tasa_Toques_Fuera_Blanco_TMR,${k.tmrPercent},%,<20%,Liu_et_al_2026`,
      `Ergonomia,KPI-04,Toques_Palmares_Filtrados,${k.palmTouchesFiltered},toques,0_falsos_clics,Saeedi_et_al_2024_H5`,
      `Fonetica_SCED,KPI-05,Target_Accuracy_Global,${k.targetAccuracyOverallPct},%,Trazabilidad_SCED,Strombergsson_et_al_2025`,
      `Fonetica_SCED,KPI-05A,Target_Accuracy_Palabras_Aisladas,${k.targetAccuracyIsolatedPct},%,Bosch_Melgar,Pucuhuaranga_2016`,
      `Fonetica_SCED,KPI-05B,Target_Accuracy_Frases_Continuas,${k.targetAccuracyContinuousPct},%,Trabalenguas,Pena_et_al_2024`,
      `PSF_TEPROSIF,KPI-06O,PSF_Omisiones_O,${k.psfOmissions},conteo,Reduccion_PrePost,Pena_et_al_2024`,
      `PSF_TEPROSIF,KPI-06S,PSF_Sustituciones_S,${k.psfSubstitutions},conteo,Reduccion_PrePost,Pucuhuaranga_2016`,
      `PSF_TEPROSIF,KPI-06D,PSF_Distorsiones_D,${k.psfDistortions},conteo,Reduccion_PrePost,Pucuhuaranga_2016`,
      `Calibracion_ASR,KPI-07,Concordancia_ASR_vs_Humano,${k.asrHumanAgreementPct},%,>=85%,Strombergsson_et_al_2025`,
      `Calibracion_ASR,KPI-07FP,Falsos_Positivos_ASR,${k.asrFalsePositives},conteo,Minimizar,Strombergsson_et_al_2025`,
      `Calibracion_ASR,KPI-07FN,Falsos_Negativos_ASR,${k.asrFalseNegatives},conteo,Minimizar,Strombergsson_et_al_2025`,
      `Pureza_Audio,KPI-08,Antipatron_Schwa_Detectado,${this.schwaAntipatternDetected ? 1 : 0},binario,0,Furlong_et_al_2018`,
      `Escalas,KPI-09,Heuristica_Nielsen_Severidad_Media,${k.nielsenMeanSeverity},0_a_4,<=1.50,Saeedi_et_al_2024`,
      `Escalas,KPI-09H5,Heuristica_H5_Prevencion_Errores,${k.nielsenH5Severity},0_a_4,<1.00,Saeedi_et_al_2024`,
      `Escalas,KPI-10,Cuestionario_Pictorico_Emojis,${k.emojiAcceptancePct},%,>=90%,Saeedi_et_al_2024`,
      `Escalas,KPI-11,PSSUQ_Media_Global,${k.pssuqOverallMean},1_a_7,>=6.00,Saeedi_et_al_2024`,
      `Escalas,KPI-11UI,PSSUQ_Calidad_Interfaz,${k.pssuqInterfaceQuality},1_a_7,>=6.25,Saeedi_et_al_2024`,
      `Escalas,KPI-12,Escala_MARS_Calidad_mHealth,${k.marsTotalScore},1_a_5,>=4.20,Furlong_et_al_2018`
    ];
    return lines.join("\n");
  }

  downloadFile(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }
}

window.TelemetryEvalEngine = TelemetryEvalEngine;
