/* ==========================================================================
   CONSOLA DEL EVALUADOR MICRO-SCED (evaluador.html) - ACTIVIDAD 10
   Refactorización Completa basada en las 3 Reglas de Oro de Theo Mandel:
   1. Colocar al Usuario en Control: Atajos de teclado (1-4, A, flechas),
      modal de confirmación antes de acciones críticas, cancelabilidad [Esc].
   2. Reducir la Carga de Memoria: Reconocimiento sobre recuerdo, anclajes
      descriptivos en escalas Likert (1-7), filtros progresivos en tablas.
   3. Hacer la Interfaz Consistente: Tokens cromáticos oficiales de Bosque
      Sonoro, código semántico PSF (Verde/Rojo/Ámbar/Violeta) y diseño modular.
   ========================================================================== */

(function () {
  class RemoteEvaluatorConsole {
    constructor() {
      const params = new URLSearchParams(window.location.search);
      this.roomCode = (params.get('room') || 'G7-P01').toUpperCase().trim();
      this.activeTab = 'live';
      this.selectedPhonationIdx = -1;
      this.connectedToChild = false;
      this.broadcastChannel = null;
      this.sseSource = null;
      this.boschFilter = 'all'; // 'all', 'psf_only', 'discrepancy'
      this.confirmCallback = null;

      // Motor local de cálculo y consolidación de KPIs (SCED)
      this.engine = new window.TelemetryEvalEngine({ isRemoteConsole: true });
      this.engine.roomCode = this.roomCode;

      this.initDomRefs();
      this.initGlobalShortcuts();
      this.initChannels();
      this.render();
    }

    initDomRefs() {
      this.inpRoom = document.getElementById('inpRemoteRoom');
      this.btnConnect = document.getElementById('btnConnectRoom');
      this.connPill = document.getElementById('connStatusPill');
      this.connText = document.getElementById('connStatusText');
      this.lblParticipant = document.getElementById('lblParticipant');
      this.lblCurrentTask = document.getElementById('lblCurrentTask');
      this.lblEmojiProgress = document.getElementById('lblEmojiProgress');
      this.tabCountPhono = document.getElementById('tabCountPhono');
      this.mainContainer = document.getElementById('remoteMainContainer');
      this.toastEl = document.getElementById('remoteToast');

      // Modales y drawers de control (Regla 1 de Mandel)
      this.modalConfirm = document.getElementById('confirmActionModal');
      this.btnCancelConfirm = document.getElementById('btnCancelConfirmAction');
      this.btnAcceptConfirm = document.getElementById('btnAcceptConfirmAction');
      this.confirmTitleEl = document.getElementById('confirmDialogTitle');
      this.confirmBodyEl = document.getElementById('confirmDialogBody');

      this.drawerHelp = document.getElementById('keyboardHelpDrawer');
      this.btnToggleHelp = document.getElementById('btnToggleHelp');
      this.btnCloseHelp = document.getElementById('btnCloseHelpDrawer');

      if (this.inpRoom) this.inpRoom.value = this.roomCode;

      if (this.btnConnect) {
        this.btnConnect.addEventListener('click', () => {
          const nextRoom = (this.inpRoom.value || 'G7-P01').toUpperCase().trim();
          this.switchRoom(nextRoom);
        });
      }

      // Selector de Pestañas con actualización de accesibilidad ARIA
      document.querySelectorAll('.rtab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.selectTab(btn.dataset.rtab);
        });
      });

      // Eventos del modal de confirmación
      if (this.btnCancelConfirm) {
        this.btnCancelConfirm.addEventListener('click', () => this.closeConfirmModal());
      }
      if (this.btnAcceptConfirm) {
        this.btnAcceptConfirm.addEventListener('click', () => {
          const cb = this.confirmCallback;
          this.closeConfirmModal();
          if (typeof cb === 'function') cb();
        });
      }

      // Eventos del Drawer de Ayuda
      if (this.btnToggleHelp) {
        this.btnToggleHelp.addEventListener('click', () => this.toggleHelpDrawer());
      }
      if (this.btnCloseHelp) {
        this.btnCloseHelp.addEventListener('click', () => this.toggleHelpDrawer(false));
      }
    }

    selectTab(tabName) {
      this.activeTab = tabName;
      document.querySelectorAll('.rtab-btn').forEach(b => {
        const isActive = b.dataset.rtab === tabName;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      this.render();
    }

    /* ========================================================================
       REGLA 1 DE MANDEL: ATAJOS DE TECLADO RÁPIDOS Y PREVENCIÓN DE ERRORES
       ======================================================================== */
    initGlobalShortcuts() {
      window.addEventListener('keydown', (e) => {
        // Si el foco está en un input o textarea editable, permitir sólo Escape
        const activeTag = (document.activeElement && document.activeElement.tagName) || '';
        const isEditing = activeTag === 'INPUT' || activeTag === 'TEXTAREA';

        if (e.key === 'Escape') {
          if (this.modalConfirm && !this.modalConfirm.hidden) {
            e.preventDefault();
            this.closeConfirmModal();
            return;
          }
          if (this.drawerHelp && !this.drawerHelp.hidden) {
            e.preventDefault();
            this.toggleHelpDrawer(false);
            return;
          }
        }

        if (isEditing) return;

        // Atajos para cambio de pestañas: Alt + 1, Alt + 2, Alt + 3, Alt + 4
        if (e.altKey) {
          if (e.key === '1') { e.preventDefault(); this.selectTab('live'); return; }
          if (e.key === '2') { e.preventDefault(); this.selectTab('bosch'); return; }
          if (e.key === '3') { e.preventDefault(); this.selectTab('pssuq'); return; }
          if (e.key === '4') { e.preventDefault(); this.selectTab('nielsen'); return; }
        }

        // Atajo para abrir ayuda
        if (e.key === '?' || (e.shiftKey && e.key === '/')) {
          e.preventDefault();
          this.toggleHelpDrawer();
          return;
        }

        // Atajos rápidos en Pestaña 1 (Mando en Vivo):
        if (this.activeTab === 'live') {
          const phonations = this.engine.phonations;
          const activeIdx = (this.selectedPhonationIdx >= 0 && phonations[this.selectedPhonationIdx])
            ? this.selectedPhonationIdx
            : (phonations.length - 1);

          if (activeIdx >= 0 && phonations[activeIdx]) {
            // Teclas 1, 2, 3, 4 o C, O, S, D para calificación PSF
            if (e.key === '1' || e.key === 'c' || e.key === 'C') {
              e.preventDefault();
              this.applyHumanJudgment(activeIdx, 'CORRECT');
              return;
            }
            if (e.key === '2' || e.key === 'o' || e.key === 'O') {
              e.preventDefault();
              this.applyHumanJudgment(activeIdx, 'O');
              return;
            }
            if (e.key === '3' || e.key === 's' || e.key === 'S') {
              e.preventDefault();
              this.applyHumanJudgment(activeIdx, 'S');
              return;
            }
            if (e.key === '4' || e.key === 'd' || e.key === 'D') {
              e.preventDefault();
              this.applyHumanJudgment(activeIdx, 'D');
              return;
            }
          }

          // Tecla 'A' para Apoyo Verbal (CA)
          if (e.key === 'a' || e.key === 'A') {
            e.preventDefault();
            this.registerQuickAssist();
            return;
          }

          // Flechas izquierda y derecha para navegar entre fonaciones
          if (e.key === 'ArrowLeft' && phonations.length > 1) {
            e.preventDefault();
            this.selectedPhonationIdx = Math.max(0, activeIdx - 1);
            this.render();
            return;
          }
          if (e.key === 'ArrowRight' && phonations.length > 1) {
            e.preventDefault();
            this.selectedPhonationIdx = Math.min(phonations.length - 1, activeIdx + 1);
            this.render();
            return;
          }
        }
      });
    }

    showConfirmDialog(title, message, onConfirm) {
      if (!this.modalConfirm) {
        if (confirm(`${title}\n\n${message}`)) {
          onConfirm();
        }
        return;
      }
      this.confirmTitleEl.textContent = title;
      this.confirmBodyEl.textContent = message;
      this.confirmCallback = onConfirm;
      this.modalConfirm.hidden = false;
      if (this.btnCancelConfirm) this.btnCancelConfirm.focus();
    }

    closeConfirmModal() {
      if (this.modalConfirm) this.modalConfirm.hidden = true;
      this.confirmCallback = null;
    }

    toggleHelpDrawer(forceState) {
      if (!this.drawerHelp) return;
      const nextState = typeof forceState === 'boolean' ? !forceState : this.drawerHelp.hidden;
      this.drawerHelp.hidden = !nextState;
    }

    applyHumanJudgment(idx, judgment) {
      this.engine.setHumanJudgmentForPhonation(idx, judgment);
      this.sendCommand('CMD_SET_HUMAN_PSF', { index: idx, judgment });
      this.showToast(`✓ Calificado #${idx + 1} como ${judgment}`);
      this.render();
    }

    registerQuickAssist() {
      this.engine.registerModeratorAssist();
      this.sendCommand('CMD_ADD_ASSIST_CA', {});
      this.showToast('🤝 +1 Apoyo Verbal (CA) registrado');
      this.render();
    }

    /* ========================================================================
       CANALES DE SINCRONIZACIÓN Y TELEMETRÍA (RELAY SSE & BROADCAST)
       ======================================================================== */
    initChannels() {
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          this.broadcastChannel = new BroadcastChannel('bosque_sced_remote_v3');
          this.broadcastChannel.onmessage = (ev) => {
            if (ev && ev.data) this.onIncomingPacket(ev.data);
          };
        } catch (e) {}
      }

      window.addEventListener('storage', (ev) => {
        if (ev.key === 'bosque_sced_remote_state_v3' && ev.newValue) {
          try {
            this.onIncomingPacket(JSON.parse(ev.newValue));
          } catch (e) {}
        }
      });

      try {
        const cached = localStorage.getItem('bosque_sced_remote_state_v3');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.payload) {
            this.applyRemoteState(parsed.payload, false);
          }
        }
      } catch (e) {}

      this.connectSse(this.roomCode);
      this.requestChildStateSnapshot();
    }

    switchRoom(roomCode) {
      this.roomCode = roomCode;
      if (this.inpRoom) this.inpRoom.value = roomCode;
      const newUrl = `${window.location.pathname}?room=${encodeURIComponent(roomCode)}`;
      window.history.replaceState({}, '', newUrl);
      this.connectSse(roomCode);
      this.requestChildStateSnapshot();
      this.showToast(`Conectado a sala ${roomCode}`);
    }

    connectSse(roomCode) {
      if (this.sseSource) {
        try { this.sseSource.close(); } catch (e) {}
        this.sseSource = null;
      }

      if (typeof EventSource === 'undefined') return;

      try {
        const es = new EventSource(`/api/sced-sync?room=${encodeURIComponent(roomCode)}`);
        this.sseSource = es;

        es.onmessage = (ev) => {
          try {
            const msg = JSON.parse(ev.data);
            if (msg.type === 'CONNECTED' || msg.type === 'PEER_COUNT') {
              this.updateConnectionBadge(true, msg.peers || 2);
            } else if (msg.type === 'STATE_SNAPSHOT' && msg.payload) {
              this.applyRemoteState(msg.payload, msg.payload.triggerEvent === 'VOICE_PHONATION_READY_FOR_PSF');
            } else if (msg.type === 'DEVICE_ONLINE') {
              this.updateConnectionBadge(true, 2);
              this.showToast('🟢 Dispositivo del niño en línea');
            } else if (msg.type === 'EVALUATOR_LINKED_OK') {
              this.updateConnectionBadge(true, 2);
              this.showToast('🟢 APK Enlazado con éxito');
            }
          } catch (e) {}
        };

        es.onerror = () => {
          this.updateConnectionBadge(false);
        };
      } catch (err) {}
    }

    requestChildStateSnapshot() {
      this.sendCommand('REQUEST_STATE_SNAPSHOT', {});
    }

    sendCommand(commandName, data = {}) {
      const packet = {
        type: 'REMOTE_COMMAND',
        sender: 'EVALUATOR_CONSOLE',
        roomCode: this.roomCode,
        timestamp: Date.now(),
        command: commandName,
        data
      };

      if (this.broadcastChannel) {
        try { this.broadcastChannel.postMessage(packet); } catch (e) {}
      }

      try {
        localStorage.setItem('bosque_sced_remote_cmd_v3', JSON.stringify(packet));
      } catch (e) {}

      if (typeof fetch === 'function') {
        fetch(`/api/sced-sync?room=${encodeURIComponent(this.roomCode)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(packet)
        }).catch(() => {});
      }
    }

    onIncomingPacket(packet) {
      if (!packet || packet.roomCode !== this.roomCode) return;
      if (packet.sender === 'EVALUATOR_CONSOLE') return;

      if (packet.type === 'STATE_SNAPSHOT' && packet.payload) {
        const isNewPhonation = packet.payload.triggerEvent === 'VOICE_PHONATION_READY_FOR_PSF';
        this.applyRemoteState(packet.payload, isNewPhonation);
      }
    }

    applyRemoteState(state, vibrateOnPhonation = false) {
      this.connectedToChild = true;
      this.updateConnectionBadge(true, 2);

      this.engine.isActive = !!state.isActive;
      if (state.session) this.engine.session = { ...this.engine.session, ...state.session };
      if (state.currentTask) this.engine.currentTask = state.currentTask;
      if (Array.isArray(state.tasks)) this.engine.tasks = state.tasks;
      if (state.touchStats) this.engine.touchStats = state.touchStats;
      if (Array.isArray(state.phonations)) {
        this.engine.phonations = state.phonations;
        if (this.selectedPhonationIdx < 0 || vibrateOnPhonation || this.selectedPhonationIdx >= this.engine.phonations.length) {
          this.selectedPhonationIdx = this.engine.phonations.length - 1;
        }
      }
      if (state.emojiAnswers) this.engine.emojiAnswers = state.emojiAnswers;
      if (typeof state.currentEmojiStep === 'number') this.engine.currentEmojiStep = state.currentEmojiStep;
      if (Array.isArray(state.nielsenHeuristics)) this.engine.nielsenHeuristics = state.nielsenHeuristics;
      if (typeof state.schwaAntipatternDetected === 'boolean') {
        this.engine.schwaAntipatternDetected = state.schwaAntipatternDetected;
      }
      if (Array.isArray(state.pssuqItems)) this.engine.pssuqItems = state.pssuqItems;
      if (Array.isArray(state.marsDimensions)) this.engine.marsDimensions = state.marsDimensions;
      this.recentEvents = state.recentEvents || [];

      this.engine.calculateConsolidatedKPIs();
      this.updateHeaderStrip(state.triggerEvent);

      if (vibrateOnPhonation && navigator.vibrate) {
        try { navigator.vibrate([45, 30, 45]); } catch (e) {}
      }

      this.render();
    }

    updateConnectionBadge(connected, peers = 1) {
      if (!this.connPill || !this.connText) return;
      if (connected) {
        this.connPill.className = 'connection-status-badge';
        this.connText.textContent = `🟢 En Línea con Tablet (${peers} disp.)`;
      } else {
        this.connPill.className = 'connection-status-badge waiting';
        this.connText.textContent = `📡 Esperando Tablet en ${this.roomCode}...`;
      }
    }

    updateHeaderStrip(triggerEvent = '') {
      const s = this.engine.session;
      if (this.lblParticipant) {
        this.lblParticipant.textContent = `${s.participantId} (${s.childPseudonym}, ${s.childAge}a • ${s.condition})`;
      }
      if (this.lblCurrentTask) {
        if (this.engine.isActive && this.engine.currentTask) {
          this.lblCurrentTask.textContent = `▶ ${this.engine.currentTask.shortCode}: ${this.engine.currentTask.name}`;
        } else if (triggerEvent === 'EMOJI_QUESTIONNAIRE_STARTED' || triggerEvent === 'CHILD_EMOJI_ANSWER') {
          this.lblCurrentTask.textContent = `😊 Respondiendo Cuestionario de Emojis (${this.engine.currentEmojiStep}/3)`;
        } else if (triggerEvent === 'SESSION_EMOJI_COMPLETED') {
          this.lblCurrentTask.textContent = `✅ Sesión y Emojis Completados`;
        } else {
          this.lblCurrentTask.textContent = `⏸ Lista para iniciar`;
        }
      }
      if (this.lblEmojiProgress) {
        const ea = this.engine.emojiAnswers || {};
        const mapFace = (v) => v === 3 ? '😊' : (v === 2 ? '😐' : '🙁');
        this.lblEmojiProgress.textContent = `${mapFace(ea.visualAppeal)} ${mapFace(ea.emotionalComfort)} ${mapFace(ea.playAgainIntent)} (${this.engine.kpis.emojiAcceptancePct}%)`;
      }
      if (this.tabCountPhono) {
        this.tabCountPhono.textContent = String(this.engine.phonations.length);
      }
    }

    showToast(text) {
      if (!this.toastEl) return;
      this.toastEl.textContent = text;
      this.toastEl.hidden = false;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.toastEl.hidden = true;
      }, 2200);
    }

    render() {
      if (!this.mainContainer) return;
      this.engine.calculateConsolidatedKPIs();

      if (this.activeTab === 'bosch') {
        this.mainContainer.innerHTML = this.renderTabBoschHtml();
      } else if (this.activeTab === 'pssuq') {
        this.mainContainer.innerHTML = this.renderTabPssuqMarsHtml();
      } else if (this.activeTab === 'nielsen') {
        this.mainContainer.innerHTML = this.renderTabNielsenExportHtml();
      } else {
        this.mainContainer.innerHTML = this.renderTabLiveControlHtml();
      }

      this.bindTabEvents();
    }

    /* ========================================================================
       PESTAÑA 1: MANDO EN VIVO Y CALIBRACIÓN PERCEPTUAL PSF CON EL PULGAR
       ======================================================================== */
    renderTabLiveControlHtml() {
      const k = this.engine.kpis;
      const phonations = this.engine.phonations;
      const activeIdx = (this.selectedPhonationIdx >= 0 && phonations[this.selectedPhonationIdx])
        ? this.selectedPhonationIdx
        : (phonations.length - 1);
      const currentP = phonations[activeIdx] || null;

      const phonationBannerHtml = currentP
        ? `
          <div class="phonation-spotlight-box">
            <div>
              <span style="font-size:0.72rem; color:#94A3B8; text-transform:uppercase; font-weight:700;">
                Emisión Vocal #${currentP.index} de ${phonations.length} • ${currentP.context === 'continuous' ? 'Frase Continua' : 'Palabra Aislada'}
              </span>
              <div class="phonation-word-hero">"${currentP.targetWord}"</div>
              <div class="phonation-meta-detail">
                Fonema Meta: <strong>${currentP.phoneme}</strong> (${currentP.position}) • Duración Fonación: <strong>${(currentP.durationMs / 1000).toFixed(2)}s</strong>
              </div>
            </div>
            <div>
              <span class="asr-judgment-tag ${currentP.asrApproved ? 'approved' : 'retry'}">
                ${currentP.asrApproved ? '⭐ App Aprobó' : '🔄 App solicitó Reintento / DDA'}
              </span>
            </div>
          </div>

          <div class="psf-interactive-grid">
            <button type="button" class="psf-choice-card choice-correct ${currentP.humanJudgment === 'CORRECT' ? 'selected' : ''}" data-psf-j="CORRECT" data-psf-idx="${activeIdx}">
              <span class="psf-key-badge">[1] / [C]</span>
              <span class="psf-title">✔ Correcto (Sin PSF)</span>
              <span class="psf-desc">Pronunciación meta lograda con éxito</span>
            </button>
            <button type="button" class="psf-choice-card choice-o ${currentP.humanJudgment === 'O' ? 'selected' : ''}" data-psf-j="O" data-psf-idx="${activeIdx}">
              <span class="psf-key-badge">[2] / [O]</span>
              <span class="psf-title">O: Omisión</span>
              <span class="psf-desc">Ej. "pato" por "plato" / "colla" por "collar"</span>
            </button>
            <button type="button" class="psf-choice-card choice-s ${currentP.humanJudgment === 'S' ? 'selected' : ''}" data-psf-j="S" data-psf-idx="${activeIdx}">
              <span class="psf-key-badge">[3] / [S]</span>
              <span class="psf-title">S: Sustitución</span>
              <span class="psf-desc">Ej. "pelo" por "pera" / "tapo" por "sapo"</span>
            </button>
            <button type="button" class="psf-choice-card choice-d ${currentP.humanJudgment === 'D' ? 'selected' : ''}" data-psf-j="D" data-psf-idx="${activeIdx}">
              <span class="psf-key-badge">[4] / [D]</span>
              <span class="psf-title">D: Distorsión</span>
              <span class="psf-desc">Ej. /rr/ fricativa o /s/ interdentalizada</span>
            </button>
          </div>
        `
        : `
          <div class="phonation-spotlight-box" style="background:#1E293B;">
            <div>
              <div class="phonation-word-hero" style="font-size:1.15rem; color:#F8FAFC;">🎙️ Esperando que el niño hable en la tablet...</div>
              <div class="phonation-meta-detail">
                En cuanto el niño articule una palabra o frase en el juego, aparecerá aquí inmediatamente para calificar con un toque o presionando las teclas [1], [2], [3] o [4].
              </div>
            </div>
          </div>
        `;

      const eventsHtml = (this.recentEvents && this.recentEvents.length > 0)
        ? this.recentEvents.slice().reverse().map(ev => {
            const detail = ev.word ? `palabra="${ev.word}" (${ev.asrVerdict})` : (ev.targetId ? `target=${ev.targetId}` : (ev.questionId ? `${ev.questionId}=${ev.value}` : ''));
            return `<div>[${(ev.timestamp_ms / 1000).toFixed(1)}s] <strong>${ev.event_type}</strong> ${detail}</div>`;
          }).join('')
        : `<div>Esperando eventos en vivo desde la tablet del niño (Sala ${this.roomCode})...</div>`;

      return `
        <!-- A. Tarjeta de Calificación Perceptual PSF en Vivo -->
        <section class="eval-card eval-card-primary" aria-label="Calificación Perceptual PSF">
          <div class="eval-card-header">
            <div>
              <span class="eval-pill-source">Strömbergsson et al. (2026) • Melgar / Bosch (2024)</span>
              <h2 class="eval-card-title">🗣️ Calificación Perceptual en Vivo (ASR vs. Oído Humano)</h2>
            </div>
            ${phonations.length > 1 ? `
              <div style="display:flex; align-items:center; gap:8px;">
                <label for="selLivePhonationIndex" style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">Muestra:</label>
                <select id="selLivePhonationIndex" class="filter-chip" style="font-family:inherit;" aria-label="Seleccionar emisión">
                  ${phonations.map((p, idx) => `
                    <option value="${idx}" ${idx === activeIdx ? 'selected' : ''}>#${p.index}: "${p.targetWord}" (${p.humanJudgment})</option>
                  `).join('')}
                </select>
              </div>
            ` : ''}
          </div>
          ${phonationBannerHtml}
        </section>

        <!-- B. Mando a Distancia Zero-HUD (Acciones Remotas Seguras) -->
        <section class="eval-card" aria-label="Acciones Remotas sobre la Tablet">
          <div class="eval-card-header">
            <div>
              <span class="eval-pill-source">Arquitectura Zero-HUD • Control del Mediador</span>
              <h2 class="eval-card-title">📱 Acciones Remotas sobre la Pantalla del Niño</h2>
            </div>
          </div>

          <div class="remote-actions-flex">
            <button type="button" id="btnRemoteAddAssist" class="btn-action-remote btn-action-amber" title="Atajo de teclado: [A]">
              🤝 +1 Apoyo Verbal (CA) <span class="shortcut-kbd" style="margin-left:4px;">A</span>
            </button>
            <button type="button" id="btnRemoteLaunchEmojis" class="btn-action-remote btn-action-emerald" title="Requiere confirmación segura previa">
              🏁 Cerrar Prueba y Lanzar Emojis al Niño
            </button>
            <button type="button" id="btnRemoteToggleCvi" class="btn-action-remote btn-action-outline">
              👁️ Alternar Modo CVI (Alto Contraste)
            </button>
          </div>

          <!-- Divulgación Progresiva: Ajustes de Sesión Remota -->
          <details style="margin-top: 14px; border-top: 1px solid var(--border-card); padding-top: 10px;">
            <summary style="font-size: 0.82rem; font-weight: 700; color: var(--color-primary-forest); cursor: pointer;">
              ⚙️ Cambiar Participante o Iniciar Sesión Remota (P01–P04)
            </summary>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; margin-top: 10px;">
              <select id="selRemParticipant" class="filter-chip" style="width:100%;">
                <option value="P01|Mateo|4|Rotacismo (/r/, /rr/)|standard_biophilic">P01: Mateo (4a • Rotacismo /r/)</option>
                <option value="P02|Sofía|3|Simplificación Sinfones (/pl/)|standard_biophilic">P02: Sofía (3a • Sinfones /pl/)</option>
                <option value="P03|Lucas|5|Dislalia Múltiple (/rr/, /s/)|standard_biophilic">P03: Lucas (5a • Dislalia DDA)</option>
                <option value="P04|Valentina|4|Sigmatismo (/s/) + Modo CVI|cvi_high_contrast">P04: Valentina (4a • Modo CVI)</option>
              </select>
              <select id="selRemRole" class="filter-chip" style="width:100%;">
                <option value="Docente de Educación Inicial (Lima Metropolitana)">Mediador: Docente Inicial (Lima)</option>
                <option value="Madre / Padre Tutor de Preescolar">Mediador: Madre / Padre Tutor</option>
                <option value="Estudiante G7 FISI-UNMSM (Inspección Cruzada)">Mediador: Estudiante G7 UNMSM</option>
              </select>
              <button type="button" id="btnRemoteStartSession" class="btn-action-remote btn-action-emerald" style="min-height: 38px; padding: 6px 14px;">
                🚀 Lanzar en Tablet del Niño
              </button>
            </div>
          </details>
        </section>

        <!-- C. Telemetría y Flujo en Vivo -->
        <section class="eval-card" aria-label="Telemetría en Vivo">
          <div class="eval-card-header">
            <div>
              <span class="eval-pill-source">Telemetría Objetiva • Micro-SCED</span>
              <h2 class="eval-card-title">📈 Métricas Capturadas en Vivo</h2>
            </div>
          </div>

          <div class="kpi-metric-cards-grid">
            <div class="kpi-tile">
              <span class="kpi-tile-label">Autonomía (SA%)</span>
              <strong class="kpi-tile-value">${k.saPercent}%</strong>
              <span class="kpi-tile-sub">Meta ≥ 85% (CA: ${k.caPercent}%)</span>
            </div>
            <div class="kpi-tile">
              <span class="kpi-tile-label">Acierto Táctil ≥48dp</span>
              <strong class="kpi-tile-value">${k.targetHitPercent}%</strong>
              <span class="kpi-tile-sub">Miss: ${k.tmrPercent}% (&lt;20%)</span>
            </div>
            <div class="kpi-tile">
              <span class="kpi-tile-label">Franja Palmar (H5)</span>
              <strong class="kpi-tile-value">${k.palmTouchesFiltered}</strong>
              <span class="kpi-tile-sub">Toques filtrados (0 fallos)</span>
            </div>
            <div class="kpi-tile">
              <span class="kpi-tile-label">Target Accuracy</span>
              <strong class="kpi-tile-value">${phonations.length ? k.targetAccuracyOverallPct + '%' : '—'}</strong>
              <span class="kpi-tile-sub">O:${k.psfOmissions} • S:${k.psfSubstitutions} • D:${k.psfDistortions}</span>
            </div>
            <div class="kpi-tile">
              <span class="kpi-tile-label">Acuerdo ASR/Humano</span>
              <strong class="kpi-tile-value">${k.asrHumanAgreementPct}%</strong>
              <span class="kpi-tile-sub">FP:${k.asrFalsePositives} | FN:${k.asrFalseNegatives}</span>
            </div>
            <div class="kpi-tile">
              <span class="kpi-tile-label">Aceptación Emojis</span>
              <strong class="kpi-tile-value">${k.emojiAcceptancePct}%</strong>
              <span class="kpi-tile-sub">Meta Saeedi et al. ≥ 90%</span>
            </div>
          </div>

          <div style="margin-top: 14px;">
            <div style="font-size: 0.74rem; font-weight: 700; color: var(--text-subtle); margin-bottom: 5px;">
              Flujo de Eventos Contingentes (${this.roomCode}):
            </div>
            <div class="data-table" style="max-height: 160px; overflow-y: auto; background: var(--bg-dark); color: #E2E8F0; border-radius: 8px; padding: 10px 12px; font-family: ui-monospace, monospace; font-size: 0.75rem;">
              ${eventsHtml}
            </div>
          </div>
        </section>
      `;
    }

    /* ========================================================================
       PESTAÑA 2: FICHA FONÉTICA BOSCH & MELGAR (FILTROS PROGRESIVOS)
       ======================================================================== */
    renderTabBoschHtml() {
      const k = this.engine.kpis;
      let phonations = this.engine.phonations;

      // Filtrado Progresivo (Regla 2: Reducir Carga de Memoria)
      if (this.boschFilter === 'psf_only') {
        phonations = phonations.filter(p => p.humanJudgment === 'O' || p.humanJudgment === 'S' || p.humanJudgment === 'D');
      } else if (this.boschFilter === 'discrepancy') {
        phonations = phonations.filter(p => p.concordance === 'FALSE_POSITIVE' || p.concordance === 'FALSE_NEGATIVE');
      }

      const rows = phonations.length === 0
        ? `<tr><td colspan="6" style="text-align:center; padding:18px; color:var(--text-subtle);">No hay emisiones que coincidan con el filtro actual ("${this.boschFilter}").</td></tr>`
        : phonations.map((p, idx) => {
            const concBadge = p.concordance === 'AGREEMENT'
              ? '<span class="semantic-badge badge-green">✔ Concordante</span>'
              : (p.concordance === 'FALSE_POSITIVE'
                  ? '<span class="semantic-badge badge-yellow">⚠️ Falso Positivo</span>'
                  : '<span class="semantic-badge badge-purple">⚠️ Falso Negativo</span>');
            return `
              <tr>
                <td><strong>#${p.index}</strong></td>
                <td><strong>${p.targetWord}</strong><br><small style="color:var(--text-subtle);">${p.phoneme} • ${p.position}</small></td>
                <td>${p.context === 'continuous' ? 'Continua' : 'Aislada'}</td>
                <td>${p.asrApproved ? '<span class="semantic-badge badge-green">⭐ Aprobó</span>' : '<span class="semantic-badge badge-purple">Reintento/DDA</span>'}</td>
                <td>
                  <select class="filter-chip sel-table-psf" data-pidx="${p.index - 1}">
                    <option value="CORRECT" ${p.humanJudgment === 'CORRECT' ? 'selected' : ''}>✔ Correcto</option>
                    <option value="O" ${p.humanJudgment === 'O' ? 'selected' : ''}>O: Omisión</option>
                    <option value="S" ${p.humanJudgment === 'S' ? 'selected' : ''}>S: Sustitución</option>
                    <option value="D" ${p.humanJudgment === 'D' ? 'selected' : ''}>D: Distorsión</option>
                  </select>
                </td>
                <td>${concBadge}</td>
              </tr>
            `;
          }).join('');

      return `
        <section class="eval-card">
          <div class="eval-card-header">
            <div>
              <span class="eval-pill-source">Prueba de Articulación de Melgar &amp; Bosch • TEPROSIF-R</span>
              <h2 class="eval-card-title">🗣️ Registro Fonético y Concordancia Inter-evaluador ASR</h2>
            </div>
          </div>

          <div class="kpi-metric-cards-grid" style="margin-bottom: 14px;">
            <div class="kpi-tile">
              <span class="kpi-tile-label">Palabras Aisladas</span>
              <strong class="kpi-tile-value">${k.targetAccuracyIsolatedPct}%</strong>
              <span class="kpi-tile-sub">Inicial / Medial / Final</span>
            </div>
            <div class="kpi-tile">
              <span class="kpi-tile-label">Habla Continua</span>
              <strong class="kpi-tile-value">${k.targetAccuracyContinuousPct}%</strong>
              <span class="kpi-tile-sub">Frases y Trabalenguas</span>
            </div>
            <div class="kpi-tile">
              <span class="kpi-tile-label">Conteo Total PSF</span>
              <strong class="kpi-tile-value">O:${k.psfOmissions} • S:${k.psfSubstitutions} • D:${k.psfDistortions}</strong>
              <span class="kpi-tile-sub">Procesos detectados</span>
            </div>
            <div class="kpi-tile">
              <span class="kpi-tile-label">Concordancia ASR</span>
              <strong class="kpi-tile-value">${k.asrHumanAgreementPct}%</strong>
              <span class="kpi-tile-sub">Meta Strömbergsson ≥ 85%</span>
            </div>
          </div>

          <!-- Filtros Progresivos (Regla 2 de Mandel) -->
          <div class="filter-toolbar">
            <span style="font-size:0.75rem; font-weight:700; color:var(--text-subtle);">Filtrar por:</span>
            <button type="button" class="filter-chip ${this.boschFilter === 'all' ? 'active' : ''}" data-bfilter="all">
              Todas las Emisiones (${this.engine.phonations.length})
            </button>
            <button type="button" class="filter-chip ${this.boschFilter === 'psf_only' ? 'active' : ''}" data-bfilter="psf_only">
              ⚠️ Sólo con PSF (O/S/D)
            </button>
            <button type="button" class="filter-chip ${this.boschFilter === 'discrepancy' ? 'active' : ''}" data-bfilter="discrepancy">
              🔄 Discrepancias (ASR ≠ Humano)
            </button>
          </div>

          <div class="table-container-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Palabra / Fonema</th>
                  <th>Contexto</th>
                  <th>App (ASR)</th>
                  <th>Juicio Humano (PSF)</th>
                  <th>Concordancia</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>

          <!-- Añadir Muestra Manual de Test -->
          <div style="margin-top: 14px; display:flex; flex-wrap:wrap; gap:8px; align-items:center; background:#F8FAFC; padding:10px 14px; border-radius:12px; border:1.5px dashed var(--border-card);">
            <strong style="font-size:0.8rem; color:var(--text-main);">+ Agregar muestra manual Melgar:</strong>
            <select id="selRemManualWord" class="filter-chip">
              <option value="Rana">Rana (/rr/ Inicial)</option>
              <option value="Pera">Pera (/r/ Medial)</option>
              <option value="Collar">Collar (/r/ Final)</option>
              <option value="Sapo">Sapo (/s/ Inicial)</option>
              <option value="Vaso">Vaso (/s/ Medial)</option>
              <option value="Plátano">Plátano (/pl/ Sinfón)</option>
              <option value="Guitarra">Guitarra (/rr/ Medial)</option>
              <option value="Erre con erre guitarra">Trabalenguas continuo (/rr/)</option>
            </select>
            <select id="selRemManualAsr" class="filter-chip">
              <option value="1">App: ⭐ Aprobó</option>
              <option value="0">App: Reintento/DDA</option>
            </select>
            <select id="selRemManualHuman" class="filter-chip">
              <option value="CORRECT">Humano: ✔ Correcto</option>
              <option value="S">Humano: S (Sustitución)</option>
              <option value="O">Humano: O (Omisión)</option>
              <option value="D">Humano: D (Distorsión)</option>
            </select>
            <button type="button" id="btnRemAddManual" class="btn-action-remote btn-action-emerald" style="min-height:34px; padding:4px 12px; font-size:0.78rem;">
              + Registrar Muestra
            </button>
          </div>
        </section>
      `;
    }

    /* ========================================================================
       PESTAÑA 3: INSTRUMENTOS DEL MEDIADOR (PSSUQ & MARS CON ANCLAJES LIKERT)
       ======================================================================== */
    renderTabPssuqMarsHtml() {
      const k = this.engine.kpis;
      return `
        <section class="eval-card">
          <div class="eval-card-header">
            <div>
              <span class="eval-pill-source">Capa 2 • Saeedi et al. (2024) • Furlong et al. (2018)</span>
              <h2 class="eval-card-title">👩‍🏫 Evaluación por Mediadores: PSSUQ (${k.pssuqOverallMean}/7.0) y MARS (${k.marsTotalScore}/5.0)</h2>
            </div>
          </div>

          <div style="margin-bottom: 18px;">
            <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px;">
              <h3 style="font-size:0.92rem; font-weight:800; color:var(--color-primary-forest);">
                A. Cuestionario Estandarizado PSSUQ (IBM)
              </h3>
              <span class="eval-pill-source">Meta General ≥ 6.00 | Interfaz ≥ 6.25</span>
            </div>

            <!-- Anclajes Likert Explícitos (Regla 2: Reconocimiento sobre Recuerdo) -->
            <div class="likert-anchor-legend">
              <span>◀ 1: Totalmente en Desacuerdo</span>
              <span>4: Neutral / Aceptable</span>
              <span>7: Totalmente de Acuerdo ▶</span>
            </div>

            <div>
              ${this.engine.pssuqItems.map((item, idx) => `
                <div class="likert-question-card">
                  <div class="likert-question-header">
                    <div>
                      <span class="semantic-badge badge-purple" style="font-size:0.7rem;">${item.id} • ${item.tag}</span>
                      <div style="font-size:0.84rem; font-weight:600; margin-top:3px; color:var(--text-main);">${item.text}</div>
                    </div>
                    <strong style="font-size:0.95rem; color:var(--color-primary-forest); min-width:32px; text-align:right;">
                      ${item.score}/7
                    </strong>
                  </div>
                  <div class="likert-scale-buttons">
                    ${[1, 2, 3, 4, 5, 6, 7].map(val => `
                      <button type="button" class="btn-likert-choice ${Number(item.score) === val ? 'active' : ''}" data-pssuq-idx="${idx}" data-val="${val}">
                        ${val}
                      </button>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="margin-top: 24px; border-top: 1.5px solid var(--border-card); padding-top: 16px;">
            <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px;">
              <h3 style="font-size:0.92rem; font-weight:800; color:var(--color-primary-forest);">
                B. Escala de Calidad de Apps de Salud Móvil MARS (1 a 5)
              </h3>
              <span class="eval-pill-source">Meta ≥ 4.20 vs. 3.7 comercial</span>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(230px, 1fr)); gap:10px;">
              ${this.engine.marsDimensions.map((m, idx) => `
                <div class="kpi-tile">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="font-size:0.86rem; color:var(--text-main);">${m.name}</strong>
                    <span class="semantic-badge badge-green">${m.score} / 5.0</span>
                  </div>
                  <p style="font-size:0.75rem; color:var(--text-muted); margin:4px 0 8px;">${m.desc}</p>
                  <select class="filter-chip sel-rem-mars" data-midx="${idx}" style="width:100%;">
                    ${[3.0, 3.5, 4.0, 4.2, 4.5, 4.8, 5.0].map(v => `
                      <option value="${v}" ${Number(m.score) === v ? 'selected' : ''}>${v.toFixed(1)} / 5.0 (Benchmark: ${m.benchmark})</option>
                    `).join('')}
                  </select>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="margin-top: 20px; border-top: 1px solid var(--border-card); padding-top: 14px;">
            <label for="txtRemTeacherNotes" style="font-size:0.82rem; font-weight:700; display:block; margin-bottom:6px; color:var(--text-main);">
              C. Alertas Fonológicas y Observaciones Cualitativas (Huertas &amp; Roque, 2023):
            </label>
            <textarea id="txtRemTeacherNotes" rows="2" class="data-table" style="width:100%; padding:8px 12px; border-radius:8px; border:1.5px solid var(--border-card); font-family:inherit; font-size:0.82rem;">${this.engine.session.teacherClassroomNotes || ''}</textarea>
          </div>
        </section>
      `;
    }

    /* ========================================================================
       PESTAÑA 4: 10 HEURÍSTICAS DE NIELSEN (0-4), 12 KPIS Y EXPORTACIÓN
       ======================================================================== */
    renderTabNielsenExportHtml() {
      const k = this.engine.kpis;
      const nielsenSeverities = [
        { v: 0.0, l: '0.00: Sin Problema de Usabilidad' },
        { v: 0.25, l: '0.25: Fricción Mínima / Satisfactorio' },
        { v: 0.5, l: '0.50: Detalle Estético Menor' },
        { v: 0.75, l: '0.75: Leve Mejora Deseable' },
        { v: 1.0, l: '1.00: Problema Cosmético (No Urgente)' },
        { v: 1.5, l: '1.50: Dificultad Media Moderada' },
        { v: 2.0, l: '2.00: Problema Menor (Prioridad Baja)' },
        { v: 3.0, l: '3.00: Problema Mayor (Prioridad Alta)' },
        { v: 4.0, l: '4.00: Catástrofe de Usabilidad (Bloqueo)' }
      ];

      return `
        <section class="eval-card">
          <div class="eval-card-header">
            <div>
              <span class="eval-pill-source">Capa 1 • Saeedi et al. (2024) • Furlong et al. (2018)</span>
              <h2 class="eval-card-title">🔍 10 Heurísticas de Nielsen (Severidad Media: ${k.nielsenMeanSeverity}/4.0)</h2>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button type="button" id="btnRemExportJson" class="btn-action-remote btn-action-emerald" style="min-height:38px; padding:6px 14px; font-size:0.8rem;">
                📥 Descargar JSON (SCED)
              </button>
              <button type="button" id="btnRemExportCsv" class="btn-action-remote btn-action-amber" style="min-height:38px; padding:6px 14px; font-size:0.8rem;">
                📊 Descargar CSV
              </button>
            </div>
          </div>

          <div class="table-container-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:28%;">Heurística / Estándar</th>
                  <th style="width:42%;">Criterio Pediátrico Auditado</th>
                  <th style="width:30%;">Severidad Asignada (0 a 4)</th>
                </tr>
              </thead>
              <tbody>
                ${this.engine.nielsenHeuristics.map((h, idx) => `
                  <tr style="${h.critical ? 'background:#FFFBEB;' : ''}">
                    <td><strong>${h.name}</strong></td>
                    <td><small style="color:var(--text-muted);">${h.desc}</small></td>
                    <td>
                      <select class="filter-chip sel-rem-nielsen" data-hidx="${idx}" style="width:100%;">
                        ${nielsenSeverities.map(s => `
                          <option value="${s.v}" ${Number(h.severity) === s.v ? 'selected' : ''}>${s.l}</option>
                        `).join('')}
                      </select>
                    </td>
                  </tr>
                `).join('')}
                <tr style="background:#F0FDF4;">
                  <td><strong>FA-01: Pureza Acústica sin Schwa [ə]</strong></td>
                  <td><small style="color:var(--text-muted);">Erradicación de distorsión robótica o vocal parásita [ə] al pronunciar consonantes aisladas (Furlong et al., 2018).</small></td>
                  <td>
                    <select id="selRemSchwa" class="filter-chip" style="width:100%;">
                      <option value="clean" ${!this.engine.schwaAntipatternDetected ? 'selected' : ''}>0.00: Audio Limpio (✓ Cero Schwa)</option>
                      <option value="detected" ${this.engine.schwaAntipatternDetected ? 'selected' : ''}>3.00: ⚠️ Distorsión Detectada</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Matriz Consolidada de 12 KPIs -->
        <section class="eval-card">
          <div class="eval-card-header">
            <div>
              <span class="eval-pill-source">Reporte Consolidado • Actividad 10 (G7 FISI-UNMSM)</span>
              <h2 class="eval-card-title">📊 Matriz Científica de los 12 KPIs</h2>
            </div>
          </div>
          ${this.engine.renderTabResumenHtml()}
        </section>
      `;
    }

    bindTabEvents() {
      // 1. Calificación rápida con botones PSF
      this.mainContainer.querySelectorAll('.psf-choice-card').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.psfIdx, 10);
          const judgment = btn.dataset.psfJ;
          this.applyHumanJudgment(idx, judgment);
        });
      });

      const selLiveIdx = document.getElementById('selLivePhonationIndex');
      if (selLiveIdx) {
        selLiveIdx.addEventListener('change', () => {
          this.selectedPhonationIdx = parseInt(selLiveIdx.value, 10);
          this.render();
        });
      }

      // 2. Acciones Remotas con Diálogo de Seguridad (Mandel 1.5)
      const btnAssist = document.getElementById('btnRemoteAddAssist');
      if (btnAssist) {
        btnAssist.addEventListener('click', () => this.registerQuickAssist());
      }

      const btnEmojis = document.getElementById('btnRemoteLaunchEmojis');
      if (btnEmojis) {
        btnEmojis.addEventListener('click', () => {
          const participantName = this.engine.session.childPseudonym || 'el niño';
          this.showConfirmDialog(
            '🏁 Confirmar Cierre de Prueba Infantil',
            `¿Estás seguro de finalizar la sesión de juego de ${participantName} y lanzar el cuestionario de satisfacción de emojis en su tablet?`,
            () => {
              this.sendCommand('CMD_LAUNCH_EMOJIS', {});
              this.showToast('🏁 Cuestionario de Emojis lanzado en la tablet del niño');
            }
          );
        });
      }

      const btnCvi = document.getElementById('btnRemoteToggleCvi');
      if (btnCvi) {
        btnCvi.addEventListener('click', () => {
          this.sendCommand('CMD_TOGGLE_CVI', {});
          this.showToast('👁️ Modo CVI conmutado en la tablet del niño');
        });
      }

      const btnStartRem = document.getElementById('btnRemoteStartSession');
      if (btnStartRem) {
        btnStartRem.addEventListener('click', () => {
          const raw = document.getElementById('selRemParticipant').value.split('|');
          const role = document.getElementById('selRemRole').value;
          const pid = raw[0] || 'P01';
          const cfg = {
            participantId: pid,
            childPseudonym: raw[1] || 'Mateo',
            childAge: parseInt(raw[2], 10) || 4,
            condition: raw[3] || 'Rotacismo (/r/, /rr/)',
            visualMode: raw[4] || 'standard_biophilic',
            mediatorRole: role
          };
          this.switchRoom(`G7-${pid}`);
          this.sendCommand('CMD_START_SESSION', cfg);
          this.showToast(`🚀 Sesión ${pid} iniciada remotamente`);
        });
      }

      // 3. Filtros en Ficha Bosch & Melgar
      this.mainContainer.querySelectorAll('[data-bfilter]').forEach(chip => {
        chip.addEventListener('click', () => {
          this.boschFilter = chip.dataset.bfilter;
          this.render();
        });
      });

      this.mainContainer.querySelectorAll('.sel-table-psf').forEach(sel => {
        sel.addEventListener('change', () => {
          const idx = parseInt(sel.dataset.pidx, 10);
          const judgment = sel.value;
          this.applyHumanJudgment(idx, judgment);
        });
      });

      const btnAddManual = document.getElementById('btnRemAddManual');
      if (btnAddManual) {
        btnAddManual.addEventListener('click', () => {
          const word = document.getElementById('selRemManualWord').value;
          const asrApproved = document.getElementById('selRemManualAsr').value === '1';
          const humanJudgment = document.getElementById('selRemManualHuman').value;
          const context = word.split(/\s+/).length >= 3 ? 'continuous' : 'isolated';
          this.engine.addManualBoschMelgarSample(word, context, asrApproved, humanJudgment);
          this.sendCommand('CMD_ADD_MANUAL_SAMPLE', { word, context, asrApproved, humanJudgment });
          this.selectedPhonationIdx = this.engine.phonations.length - 1;
          this.showToast(`✓ Muestra "${word}" registrada`);
          this.render();
        });
      }

      // 4. Escalas Likert PSSUQ con retroalimentación inmediata
      this.mainContainer.querySelectorAll('.btn-likert-choice').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.pssuqIdx, 10);
          const val = parseInt(btn.dataset.val, 10);
          if (this.engine.pssuqItems[idx]) {
            this.engine.pssuqItems[idx].score = val;
            this.syncScalesToChild();
            this.render();
          }
        });
      });

      this.mainContainer.querySelectorAll('.sel-rem-mars').forEach(sel => {
        sel.addEventListener('change', () => {
          const idx = parseInt(sel.dataset.midx, 10);
          if (this.engine.marsDimensions[idx]) {
            this.engine.marsDimensions[idx].score = parseFloat(sel.value);
            this.syncScalesToChild();
            this.render();
          }
        });
      });

      const txtNotes = document.getElementById('txtRemTeacherNotes');
      if (txtNotes) {
        txtNotes.addEventListener('change', () => {
          this.engine.session.teacherClassroomNotes = txtNotes.value;
          this.syncScalesToChild();
          this.showToast('✓ Observaciones guardadas');
        });
      }

      // 5. Heurísticas de Nielsen y Schwa
      this.mainContainer.querySelectorAll('.sel-rem-nielsen').forEach(sel => {
        sel.addEventListener('change', () => {
          const idx = parseInt(sel.dataset.hidx, 10);
          if (this.engine.nielsenHeuristics[idx]) {
            this.engine.nielsenHeuristics[idx].severity = parseFloat(sel.value);
            this.syncScalesToChild();
            this.render();
          }
        });
      });

      const selSchwa = document.getElementById('selRemSchwa');
      if (selSchwa) {
        selSchwa.addEventListener('change', () => {
          this.engine.schwaAntipatternDetected = selSchwa.value === 'detected';
          this.syncScalesToChild();
          this.render();
        });
      }

      // 6. Exportación de Datos
      const btnJson = document.getElementById('btnRemExportJson');
      if (btnJson) {
        btnJson.addEventListener('click', () => {
          const jsonStr = JSON.stringify(this.engine.generateFullExportObject(), null, 2);
          this.engine.downloadFile(jsonStr, `${this.engine.session.sessionId.toLowerCase()}.json`, 'application/json');
          this.showToast('📥 JSON exportado con éxito');
        });
      }

      const btnCsv = document.getElementById('btnRemExportCsv');
      if (btnCsv) {
        btnCsv.addEventListener('click', () => {
          this.engine.downloadFile(this.engine.generateCsvReport(), `${this.engine.session.sessionId.toLowerCase()}_kpis.csv`, 'text/csv;charset=utf-8;');
          this.showToast('📊 CSV exportado con éxito');
        });
      }
    }

    syncScalesToChild() {
      this.engine.calculateConsolidatedKPIs();
      this.engine.persistState();
      this.sendCommand('CMD_SYNC_SCALES', {
        pssuqItems: this.engine.pssuqItems,
        marsDimensions: this.engine.marsDimensions,
        nielsenHeuristics: this.engine.nielsenHeuristics,
        schwaAntipatternDetected: this.engine.schwaAntipatternDetected,
        teacherClassroomNotes: this.engine.session.teacherClassroomNotes
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.remoteEvaluatorConsole = new RemoteEvaluatorConsole();
  });
})();
