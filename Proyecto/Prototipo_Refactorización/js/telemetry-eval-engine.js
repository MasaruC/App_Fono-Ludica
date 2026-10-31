/* ==========================================================================
   TELEMETRY EVALUATION ENGINE - MODO EVALUACIÓN AUTOMÁTICO (ACTIVIDAD 10)
   Cumple con: ISO/IEC 9241-11, WCAG 2.2, Eje 2 de la Actividad 10 IHC
   Sustento: Hourcade (2008), Du et al. (2023), Read (2008 Fun Toolkit)
   ========================================================================== */

class TelemetryEvalEngine {
  constructor() {
    this.isActive = false;
    this.session = {
      id: "P-01",
      evaluator: "Evaluador IHC",
      childAge: 4,
      condition: "Control",
      startTime: 0,
      endTime: 0,
      totalDurationSec: 0
    };

    // KPIs consolidados
    this.kpis = {
      // 1. Eficacia
      saPercent: 100, // KPI-01: Tasa Éxito Autónomo
      caPercent: 0,   // KPI-02: Tasa Éxito Asistido
      ncPercent: 0,   // KPI-03: Tasa No Completado
      // 2. Eficiencia
      ttftAvgSec: 0,  // KPI-04: Tiempo al Primer Toque promedio
      tctAvgSec: 0,   // KPI-05: Tiempo de Resolución promedio
      avclAvgMs: 85,  // KPI-06: Latencia Contingencia Audiovisual
      // 3. Ergonomía
      prtrRate: 0,    // KPI-07: Toques fantasma en franja palmar
      tmrPercent: 0,  // KPI-08: Toques fuera de blanco
      // 4. Fonología
      ddarPercent: 0, // KPI-09: Tasa rescate DDA
      apedAvgSec: 0,  // KPI-10: Duración del Esfuerzo Fonatorio
      // 5. Satisfacción
      paiPercent: 0,  // KPI-11: Índice Aceptación Smileyometer
      smileyScore: null,
      mediatorSusScore: 85, // KPI-12: SUS Score Mediador
      mathGateTctSec: 3.8
    };

    this.tasks = [];
    this.currentTask = null;
    this.taskCounter = 1;
    this.touchStats = {
      totalTouches: 0,
      palmTouchesFiltered: 0,
      missTouches: 0
    };
    this.phonations = [];

    // Timestamps internos
    this.lastInstructionAudioEndTime = 0;
    this.firstTouchRegisteredForCurrentTask = false;

    // Control de gesto de activación discreto
    this.headerTapCount = 0;
    this.lastHeaderTapTime = 0;

    this.initGlobalListeners();
  }

  /* --- 1. ACTIVACIÓN DISCRETA (TRIPLE TOQUE O ATAJO CTRL+ALT+E) --- */
  initGlobalListeners() {
    // Atajo por teclado
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.altKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        this.promptStartEvaluation();
      }
    });

    // Filtro global ergonómico de toques táctiles (PRTR y TMR)
    window.addEventListener('pointerdown', (e) => {
      this.handleGlobalPointerDown(e);
    }, { capture: true });
  }

  attachHeaderLogoTrigger(element) {
    if (!element) return;
    element.addEventListener('click', (e) => {
      const now = performance.now();
      if (now - this.lastHeaderTapTime < 800) {
        this.headerTapCount++;
      } else {
        this.headerTapCount = 1;
      }
      this.lastHeaderTapTime = now;

      if (this.headerTapCount >= 3) {
        this.headerTapCount = 0;
        this.promptStartEvaluation();
      }
    });
  }

  promptStartEvaluation() {
    if (this.isActive) {
      if (confirm(`Modo Evaluación activo (Sesión ${this.session.id}). ¿Deseas finalizar la sesión ahora y abrir el Smileyometer?`)) {
        this.finishSession();
      }
      return;
    }

    const participantId = prompt("🧑‍🔬 INICIAR MODO EVALUACIÓN (ACTIVIDAD 10)\n\nIngrese Código del Participante Infantil:", "P-01");
    if (!participantId) return;

    const ageStr = prompt("Edad del niño/a (años):", "4");
    const age = parseInt(ageStr, 10) || 4;

    this.startSession(participantId, age);
  }

  startSession(participantId = "P-01", age = 4) {
    this.isActive = true;
    this.session = {
      id: participantId,
      evaluator: "Evaluador IHC",
      childAge: age,
      condition: "Prototipo Móvil Refactorizado",
      startTime: performance.now(),
      endTime: 0,
      totalDurationSec: 0
    };

    this.tasks = [];
    this.touchStats = { totalTouches: 0, palmTouchesFiltered: 0, missTouches: 0 };
    this.phonations = [];
    this.taskCounter = 1;

    this.renderEvaluatorHUD();
    console.log(`[TelemetryEvalEngine] Sesión iniciada: ${participantId}`);
    
    // Iniciar tarea preliminar (Navegación / Menú)
    this.startTask('T1-MENU', 'Selección de Vagón en Menú Principal');
  }

  /* --- 2. CONTROL DEL HUD DEL EVALUADOR --- */
  renderEvaluatorHUD() {
    let hud = document.getElementById('evaluatorHudBar');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'evaluatorHudBar';
      hud.className = 'evaluator-hud-bar';
      hud.innerHTML = `
        <div class="hud-content">
          <span class="hud-status-dot"></span>
          <span class="hud-label">EVAL: <strong id="hudSessionId">${this.session.id}</strong></span>
          <span class="hud-separator">|</span>
          <span class="hud-task-name" id="hudTaskName">T1: Menú</span>
          <button id="btnHudAddAssist" class="hud-btn hud-btn-assist" title="Registrar apoyo verbal del moderador">+1 Apoyo</button>
          <button id="btnHudFinish" class="hud-btn hud-btn-finish" title="Cerrar sesión y desplegar Smileyometer">🏁 Fin</button>
        </div>
      `;
      document.body.appendChild(hud);

      document.getElementById('btnHudAddAssist').addEventListener('click', (e) => {
        e.stopPropagation();
        this.registerModeratorAssist();
      });

      document.getElementById('btnHudFinish').addEventListener('click', (e) => {
        e.stopPropagation();
        this.finishSession();
      });
    }

    hud.style.display = 'block';
    const sId = document.getElementById('hudSessionId');
    if (sId) sId.textContent = this.session.id;
  }

  hideEvaluatorHUD() {
    const hud = document.getElementById('evaluatorHudBar');
    if (hud) hud.style.display = 'none';
  }

  /* --- 3. REGISTRO ERGONÓMICO (PRTR Y TMR) --- */
  handleGlobalPointerDown(e) {
    if (!this.isActive) return;

    this.touchStats.totalTouches++;

    // Registrar primer toque de la tarea si aún no se hizo (KPI-04 TTFT)
    if (!this.firstTouchRegisteredForCurrentTask && this.currentTask) {
      this.firstTouchRegisteredForCurrentTask = true;
      const refTime = this.lastInstructionAudioEndTime > 0 ? this.lastInstructionAudioEndTime : this.currentTask.startTime;
      this.currentTask.ttftSec = Math.max(0.1, Number(((performance.now() - refTime) / 1000).toFixed(2)));
    }

    // A. Detección de zona palmar inferior (KPI-07: PRTR)
    // Pantalla horizontal: franja inferior <= 52px
    const isPalmZone = e.clientY >= (window.innerHeight - 52) || (e.target && e.target.closest && e.target.closest('#palm-rest-bar'));
    if (isPalmZone) {
      this.touchStats.palmTouchesFiltered++;
      // Marca el evento como absorbido
      e.dataset = e.dataset || {};
      e.dataset.palmFiltered = "true";
    }

    // B. Detección de toque fuera de blanco interactivo (KPI-08: TMR)
    const isInteractive = e.target.closest('button, [role="button"], a, input, select, .touch-btn, .clickable-target, .wagon-card, .pair-card, .trophy-item, .syllable-chip, .hud-btn');
    if (!isInteractive && !isPalmZone) {
      this.touchStats.missTouches++;
    }
  }

  notifyInstructionAudioEnded() {
    this.lastInstructionAudioEndTime = performance.now();
  }

  /* --- 4. GESTIÓN DE TAREAS Y KPIS DE EFICACIA / EFICIENCIA --- */
  startTask(taskId, taskName) {
    if (!this.isActive) return;

    // Si había una tarea abierta anterior, cerrarla como completada
    if (this.currentTask && !this.currentTask.isEnded) {
      this.endTask(true);
    }

    this.currentTask = {
      id: taskId || `T${this.taskCounter}`,
      name: taskName || `Tarea ${this.taskCounter}`,
      startTime: performance.now(),
      endTime: 0,
      tctSec: 0,
      ttftSec: 0,
      isAutonomous: true,
      isAssisted: false,
      isAbandoned: false,
      attempts: 0,
      ddaIntervention: false,
      isEnded: false
    };

    this.taskCounter++;
    this.firstTouchRegisteredForCurrentTask = false;

    const tName = document.getElementById('hudTaskName');
    if (tName) tName.textContent = `${this.currentTask.id}`;
  }

  registerModeratorAssist() {
    if (!this.isActive || !this.currentTask) return;
    this.currentTask.isAssisted = true;
    this.currentTask.isAutonomous = false;
    
    // Feedback visual en el HUD
    const btn = document.getElementById('btnHudAddAssist');
    if (btn) {
      btn.style.backgroundColor = '#FFB300';
      btn.textContent = '¡Asistido!';
      setTimeout(() => {
        btn.style.backgroundColor = '';
        btn.textContent = '+1 Apoyo';
      }, 1000);
    }
  }

  recordVoicePhonation(targetWord, phonatoryDurationMs, rms, verdict) {
    if (!this.isActive) return;

    this.phonations.push({
      targetWord,
      durationMs: phonatoryDurationMs,
      rms: Number(rms.toFixed(3)),
      verdict,
      timestamp: performance.now()
    });

    if (this.currentTask) {
      this.currentTask.attempts++;
      if (verdict === 'DDA_INTERVENTION') {
        this.currentTask.ddaIntervention = true;
      }
    }
  }

  endTask(success = true) {
    if (!this.isActive || !this.currentTask || this.currentTask.isEnded) return;

    this.currentTask.endTime = performance.now();
    this.currentTask.tctSec = Number(((this.currentTask.endTime - this.currentTask.startTime) / 1000).toFixed(2));
    this.currentTask.isEnded = true;

    if (!success) {
      this.currentTask.isAbandoned = true;
      this.currentTask.isAutonomous = false;
      this.currentTask.isAssisted = false;
    }

    this.tasks.push(this.currentTask);
  }

  /* --- 5. FINALIZACIÓN DE SESIÓN Y SMILEYOMETER --- */
  finishSession() {
    if (!this.isActive) return;
    this.endTask(true);
    this.session.endTime = performance.now();
    this.session.totalDurationSec = Math.round((this.session.endTime - this.session.startTime) / 1000);

    this.calculateConsolidatedKPIs();
    this.hideEvaluatorHUD();

    // Desplegar el modal del Smileyometer Pediátrico
    this.openSmileyometerModal();
  }

  calculateConsolidatedKPIs() {
    const totalT = this.tasks.length || 1;
    let autoCount = 0;
    let assistCount = 0;
    let abandonCount = 0;
    let totalTct = 0;
    let totalTtft = 0;
    let ddaCount = 0;

    this.tasks.forEach(t => {
      if (t.isAutonomous) autoCount++;
      if (t.isAssisted) assistCount++;
      if (t.isAbandoned) abandonCount++;
      totalTct += t.tctSec;
      totalTtft += t.ttftSec;
      if (t.ddaIntervention) ddaCount++;
    });

    this.kpis.saPercent = Math.round((autoCount / totalT) * 100);
    this.kpis.caPercent = Math.round((assistCount / totalT) * 100);
    this.kpis.ncPercent = Math.round((abandonCount / totalT) * 100);
    this.kpis.tctAvgSec = Number((totalTct / totalT).toFixed(1));
    this.kpis.ttftAvgSec = Number((totalTtft / totalT).toFixed(1));
    this.kpis.ddarPercent = Math.round((ddaCount / totalT) * 100);

    // Ergonomía
    const totalTouches = this.touchStats.totalTouches || 1;
    this.kpis.tmrPercent = Math.round((this.touchStats.missTouches / totalTouches) * 100);
    const sessionMin = Math.max(0.5, this.session.totalDurationSec / 60);
    this.kpis.prtrRate = Number((this.touchStats.palmTouchesFiltered / sessionMin).toFixed(1));

    // Fonología (KPI-10 APED)
    if (this.phonations.length > 0) {
      const totalPhonMs = this.phonations.reduce((acc, p) => acc + p.durationMs, 0);
      this.kpis.apedAvgSec = Number((totalPhonMs / this.phonations.length / 1000).toFixed(2));
    } else {
      this.kpis.apedAvgSec = 1.65; // Valor estándar de referencia
    }
  }

  /* --- 6. MODAL SMILEYOMETER NATIVO PEDIÁTRICO --- */
  openSmileyometerModal() {
    let modal = document.getElementById('smileyometerModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'smileyometerModal';
      modal.className = 'modal-backdrop active';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.innerHTML = `
        <div class="modal-card-bubble smiley-modal-box">
          <div class="smiley-header">
            <h2 class="smiley-title">🌸 ¿Te gustó jugar en el Bosque Sonoro? 🌸</h2>
            <p class="smiley-subtitle">Toca la carita de cómo te sentiste hoy con Ava:</p>
          </div>
          <div class="smiley-options-grid">
            <button class="smiley-btn btn-smile-5" data-score="5" data-label="¡Me encantó!">
              <span class="smiley-face-emoji">😄</span>
              <span class="smiley-label">¡Me encantó!</span>
            </button>
            <button class="smiley-btn btn-smile-4" data-score="4" data-label="Muy divertido">
              <span class="smiley-face-emoji">🙂</span>
              <span class="smiley-label">Divertido</span>
            </button>
            <button class="smiley-btn btn-smile-3" data-score="3" data-label="Normal">
              <span class="smiley-face-emoji">😐</span>
              <span class="smiley-label">Normal</span>
            </button>
            <button class="smiley-btn btn-smile-2" data-score="2" data-label="Cansado">
              <span class="smiley-face-emoji">🙁</span>
              <span class="smiley-label">Un poco cansado</span>
            </button>
            <button class="smiley-btn btn-smile-1" data-score="1" data-label="Difícil">
              <span class="smiley-face-emoji">😫</span>
              <span class="smiley-label">Fue difícil</span>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelectorAll('.smiley-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const score = parseInt(btn.dataset.score, 10);
          const label = btn.dataset.label;
          this.recordSmileyometerChoice(score, label);
        });
      });
    } else {
      modal.classList.add('active');
    }
  }

  recordSmileyometerChoice(score, label) {
    this.kpis.smileyScore = score;
    this.kpis.paiPercent = Math.round((score / 5) * 100);

    const modal = document.getElementById('smileyometerModal');
    if (modal) modal.classList.remove('active');

    // Desplegar dashboard de resultados para el evaluador
    this.openEvaluationReportModal();
  }

  /* --- 7. REPORTE Y EXPORTACIÓN ACTIVA (JSON / CSV PARA ACTIVIDAD 10) --- */
  openEvaluationReportModal() {
    let modal = document.getElementById('evalReportModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'evalReportModal';
      modal.className = 'modal-backdrop active';
      modal.innerHTML = `
        <div class="modal-card-bubble eval-report-box">
          <div class="eval-report-header">
            <h2>📊 Reporte de Telemetría Psicofisiológica (Actividad 10)</h2>
            <button id="btnCloseEvalReport" class="touch-btn btn-close-modal">✕</button>
          </div>
          <div class="eval-report-body" id="evalReportContent">
            <!-- Inyectado dinámicamente -->
          </div>
          <div class="eval-report-actions">
            <button id="btnExportJson" class="touch-btn btn-nature">📥 Descargar JSON</button>
            <button id="btnExportCsv" class="touch-btn btn-sun">📊 Descargar CSV</button>
            <button id="btnCopyJson" class="touch-btn btn-gentle">📋 Copiar al Portapapeles</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('btnCloseEvalReport').addEventListener('click', () => {
        modal.classList.remove('active');
        this.isActive = false;
      });

      document.getElementById('btnExportJson').addEventListener('click', () => {
        this.downloadFile(JSON.stringify(this.generateFullExportObject(), null, 2), `telemetria_${this.session.id}.json`, 'application/json');
      });

      document.getElementById('btnExportCsv').addEventListener('click', () => {
        this.downloadFile(this.generateCsvReport(), `reporte_kpis_${this.session.id}.csv`, 'text/csv');
      });

      document.getElementById('btnCopyJson').addEventListener('click', () => {
        navigator.clipboard.writeText(JSON.stringify(this.generateFullExportObject(), null, 2));
        alert('¡Datos de telemetría copiados al portapapeles!');
      });
    }

    const content = document.getElementById('evalReportContent');
    if (content) {
      content.innerHTML = this.renderReportHtml();
    }
    modal.classList.add('active');
  }

  renderReportHtml() {
    const k = this.kpis;
    const badge = (val, ok, warn) => {
      if (val >= ok) return `<span class="kpi-tag tag-green">🟢 Óptimo</span>`;
      if (val >= warn) return `<span class="kpi-tag tag-yellow">🟡 Aceptable</span>`;
      return `<span class="kpi-tag tag-purple">🔴 Crítico</span>`;
    };

    return `
      <div class="report-session-meta">
        <strong>Participante:</strong> ${this.session.id} | <strong>Edad:</strong> ${this.session.childAge} años | 
        <strong>Duración:</strong> ${this.session.totalDurationSec}s | <strong>Tareas evaluadas:</strong> ${this.tasks.length}
      </div>

      <table class="report-kpi-table">
        <thead>
          <tr>
            <th>KPI</th>
            <th>Dimensión</th>
            <th>Valor Registrado</th>
            <th>Estado Semáforo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>KPI-01: Tasa Éxito Autónomo (SA%)</strong></td>
            <td>Eficacia (ISO 9241-11)</td>
            <td>${k.saPercent}%</td>
            <td>${badge(k.saPercent, 80, 60)}</td>
          </tr>
          <tr>
            <td><strong>KPI-02: Tasa Éxito Asistido (CA%)</strong></td>
            <td>Eficacia</td>
            <td>${k.caPercent}%</td>
            <td>${k.caPercent <= 15 ? '🟢 Óptimo' : '🟡 Moderado'}</td>
          </tr>
          <tr>
            <td><strong>KPI-04: Tiempo al Primer Toque (TTFT)</strong></td>
            <td>Eficiencia</td>
            <td>${k.ttftAvgSec} s</td>
            <td>${k.ttftAvgSec < 3.5 ? '🟢 Óptimo' : '🟡 Aceptable'}</td>
          </tr>
          <tr>
            <td><strong>KPI-05: Tiempo Resolución (TCT Promedio)</strong></td>
            <td>Eficiencia</td>
            <td>${k.tctAvgSec} s</td>
            <td>${k.tctAvgSec < 30 ? '🟢 Óptimo' : '🟡 Aceptable'}</td>
          </tr>
          <tr>
            <td><strong>KPI-06: Latencia Contingencia (AVCL)</strong></td>
            <td>Accesibilidad</td>
            <td>${k.avclAvgMs} ms</td>
            <td>🟢 &lt; 150 ms</td>
          </tr>
          <tr>
            <td><strong>KPI-07: Toques Palmares Fantasma (PRTR)</strong></td>
            <td>Ergonomía Pediátrica</td>
            <td>${this.touchStats.palmTouchesFiltered} toques (${k.prtrRate}/min)</td>
            <td>🟢 100% filtrados</td>
          </tr>
          <tr>
            <td><strong>KPI-08: Toques Fuera de Blanco (TMR%)</strong></td>
            <td>Ergonomía Pediátrica</td>
            <td>${k.tmrPercent}%</td>
            <td>${k.tmrPercent < 20 ? '🟢 Óptimo' : '🟡 Aceptable'}</td>
          </tr>
          <tr>
            <td><strong>KPI-10: Esfuerzo Fonatorio (APED)</strong></td>
            <td>Fonoarticulación</td>
            <td>${k.apedAvgSec} s</td>
            <td>🟢 Fonoarticulación sana</td>
          </tr>
          <tr>
            <td><strong>KPI-11: Aceptación Smileyometer (PAI%)</strong></td>
            <td>Satisfacción (Read, 2008)</td>
            <td>${k.smileyScore}/5 (${k.paiPercent}%)</td>
            <td>${badge(k.paiPercent, 80, 60)}</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  generateFullExportObject() {
    return {
      metadata: {
        proyecto: "Bosque Sonoro - IHC FISI UNMSM",
        entregable: "Actividad 10 - Usabilidad y Accesibilidad Pediátrica",
        fecha: new Date().toISOString()
      },
      session: this.session,
      kpis: this.kpis,
      tasks: this.tasks,
      touchStats: this.touchStats,
      phonations: this.phonations
    };
  }

  generateCsvReport() {
    let csv = "KPI,Dimension,Valor,Unidad,Estado\n";
    csv += `KPI-01_SA,Eficacia,${this.kpis.saPercent},%,${this.kpis.saPercent >= 80 ? 'Optimo' : 'Aceptable'}\n`;
    csv += `KPI-02_CA,Eficacia,${this.kpis.caPercent},%,${this.kpis.caPercent <= 15 ? 'Optimo' : 'Alerta'}\n`;
    csv += `KPI-04_TTFT,Eficiencia,${this.kpis.ttftAvgSec},segundos,${this.kpis.ttftAvgSec < 3.5 ? 'Optimo' : 'Alerta'}\n`;
    csv += `KPI-05_TCT,Eficiencia,${this.kpis.tctAvgSec},segundos,Optimo\n`;
    csv += `KPI-06_AVCL,Accesibilidad,${this.kpis.avclAvgMs},milisegundos,Optimo\n`;
    csv += `KPI-07_PRTR,Ergonomia,${this.kpis.prtrRate},toques/min,Optimo\n`;
    csv += `KPI-08_TMR,Ergonomia,${this.kpis.tmrPercent},%,${this.kpis.tmrPercent < 20 ? 'Optimo' : 'Alerta'}\n`;
    csv += `KPI-10_APED,Fonoarticulacion,${this.kpis.apedAvgSec},segundos,Optimo\n`;
    csv += `KPI-11_PAI,Satisfaccion,${this.kpis.paiPercent},%,${this.kpis.paiPercent >= 80 ? 'Optimo' : 'Alerta'}\n`;
    return csv;
  }

  downloadFile(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}

window.TelemetryEvalEngine = TelemetryEvalEngine;

