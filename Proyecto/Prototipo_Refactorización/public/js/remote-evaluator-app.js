/* ==========================================================================
   CONSOLA REMOTA DEL EVALUADOR MICRO-SCED (evaluador.html) - ACTIVIDAD 10
   Permite que el Equipo G7 (FISI-UNMSM) y los mediadores califiquen en vivo
   (PSF O/S/D, ASR vs. Humano, Apoyos CA, Modo CVI y cierre con Emojis)
   desde su propio celular o laptop sin tocar el dispositivo del niño.
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

      // Motor local de respaldo para cálculos de KPIs y exportación JSON/CSV
      this.engine = new window.TelemetryEvalEngine({ isRemoteConsole: true });
      this.engine.roomCode = this.roomCode;

      this.initDomRefs();
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

      if (this.inpRoom) this.inpRoom.value = this.roomCode;

      if (this.btnConnect) {
        this.btnConnect.addEventListener('click', () => {
          const nextRoom = (this.inpRoom.value || 'G7-P01').toUpperCase().trim();
          this.switchRoom(nextRoom);
        });
      }

      document.querySelectorAll('.rtab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.rtab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.activeTab = btn.dataset.rtab;
          this.render();
        });
      });
    }

    initChannels() {
      // 1. BroadcastChannel (Misma laptop / doble ventana)
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          this.broadcastChannel = new BroadcastChannel('bosque_sced_remote_v3');
          this.broadcastChannel.onmessage = (ev) => {
            if (ev && ev.data) this.onIncomingPacket(ev.data);
          };
        } catch (e) {}
      }

      // 2. LocalStorage fallback
      window.addEventListener('storage', (ev) => {
        if (ev.key === 'bosque_sced_remote_state_v3' && ev.newValue) {
          try {
            this.onIncomingPacket(JSON.parse(ev.newValue));
          } catch (e) {}
        }
      });

      // Cargar último estado guardado si existe en el mismo navegador
      try {
        const cached = localStorage.getItem('bosque_sced_remote_state_v3');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.payload) {
            this.applyRemoteState(parsed.payload, false);
          }
        }
      } catch (e) {}

      // 3. Conexión SSE por Red Local Wi-Fi (Vite Relay /api/sced-sync)
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
              const peers = msg.peers || 1;
              this.updateConnectionBadge(peers >= 2, peers);
            } else {
              this.onIncomingPacket(msg);
            }
          } catch (err) {}
        };
      } catch (e) {}
    }

    requestChildStateSnapshot() {
      this.sendPacket({
        type: 'EVALUATOR_CONNECTED',
        sender: 'EVALUATOR_APP',
        roomCode: this.roomCode,
        timestamp: Date.now()
      });
    }

    sendCommand(command, data = {}) {
      this.sendPacket({
        type: 'REMOTE_COMMAND',
        sender: 'EVALUATOR_APP',
        roomCode: this.roomCode,
        command,
        data,
        timestamp: Date.now()
      });
    }

    sendPacket(packet) {
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
      if (!packet || packet.sender === 'EVALUATOR_APP') return;
      if (packet.roomCode && packet.roomCode.toUpperCase() !== this.roomCode) return;

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
        this.connPill.className = 'conn-pill';
        this.connText.textContent = `🟢 En Línea con Tablet (${peers} disp.)`;
      } else {
        this.connPill.className = 'conn-pill waiting';
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
      }, 2100);
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
       PESTAÑA 1: MANDO EN VIVO Y CALIBRACIÓN PERCEPTUAL PSF (PULGAR)
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
          <div class="phonation-live-banner">
            <div>
              <span style="font-size:0.72rem; color:#94A3B8; text-transform:uppercase; font-weight:700;">
                Emisión Vocal #${currentP.index} de ${phonations.length} • ${currentP.context === 'continuous' ? 'Frase Continua' : 'Palabra Aislada'}
              </span>
              <div class="phonation-word-big">"${currentP.targetWord}"</div>
              <div class="phonation-meta-sub">
                Fonema: <strong>${currentP.phoneme}</strong> (${currentP.position}) • Esfuerzo: <strong>${(currentP.durationMs / 1000).toFixed(2)}s</strong>
              </div>
            </div>
            <div>
              <span class="asr-verdict-pill ${currentP.asrApproved ? 'ok' : 'retry'}">
                ${currentP.asrApproved ? '⭐ App Aprobó' : '🔄 App pidió Reintento / DDA'}
              </span>
            </div>
          </div>

          <div class="psf-thumb-grid">
            <button type="button" class="psf-giant-btn btn-ok ${currentP.humanJudgment === 'CORRECT' ? 'selected' : ''}" data-psf-j="CORRECT" data-psf-idx="${activeIdx}">
              <span>✔ Correcto (Sin PSF)</span>
              <small>Pronunciación meta lograda</small>
            </button>
            <button type="button" class="psf-giant-btn btn-o ${currentP.humanJudgment === 'O' ? 'selected' : ''}" data-psf-j="O" data-psf-idx="${activeIdx}">
              <span>O: Omisión</span>
              <small>Ej. "pato" por "plato" / "colla" por "collar"</small>
            </button>
            <button type="button" class="psf-giant-btn btn-s ${currentP.humanJudgment === 'S' ? 'selected' : ''}" data-psf-j="S" data-psf-idx="${activeIdx}">
              <span>S: Sustitución</span>
              <small>Ej. "pelo" por "pera" / "tapo" por "sapo"</small>
            </button>
            <button type="button" class="psf-giant-btn btn-d ${currentP.humanJudgment === 'D' ? 'selected' : ''}" data-psf-j="D" data-psf-idx="${activeIdx}">
              <span>D: Distorsión</span>
              <small>Ej. /rr/ fricativa o /s/ interdentalizada</small>
            </button>
          </div>
        `
        : `
          <div class="phonation-live-banner" style="background:#1E293B;">
            <div>
              <div class="phonation-word-big" style="font-size:1.1rem; color:#F8FAFC;">🎙️ Esperando que el niño hable por el micrófono...</div>
              <div class="phonation-meta-sub">
                En cuanto el niño pronuncie una palabra en la tablet, aparecerá aquí automáticamente para que la califiques con un toque (✔ / O / S / D).
              </div>
            </div>
          </div>
        `;

      const eventsHtml = (this.recentEvents && this.recentEvents.length > 0)
        ? this.recentEvents.slice().reverse().map(ev => {
            const detail = ev.word ? `palabra="${ev.word}" (${ev.asrVerdict})` : (ev.targetId ? `target=${ev.targetId}` : (ev.questionId ? `${ev.questionId}=${ev.value}` : ''));
            return `<div>[${(ev.timestamp_ms / 1000).toFixed(1)}s] <strong>${ev.event_type}</strong> ${detail}</div>`;
          }).join('')
        : `<div>Esperando eventos en tiempo real desde la tablet del niño (Sala ${this.roomCode})...</div>`;

      return `
        <!-- A. Tarjeta Principal de Calificación Perceptual PSF en Vivo -->
        <section class="rcard rcard-highlight">
          <div class="rcard-header">
            <div>
              <span class="rcard-eyebrow">Strömbergsson et al. (2025) • Pucuhuaranga (2016)</span>
              <h2 class="rcard-title">🗣️ Calificación Perceptual en Vivo (ASR vs. Oído Humano)</h2>
            </div>
            ${phonations.length > 1 ? `
              <select id="selLivePhonationIndex" class="rselect" aria-label="Seleccionar intento vocal">
                ${phonations.map((p, idx) => `
                  <option value="${idx}" ${idx === activeIdx ? 'selected' : ''}>#${p.index}: "${p.targetWord}" (${p.humanJudgment})</option>
                `).join('')}
              </select>
            ` : ''}
          </div>
          ${phonationBannerHtml}
        </section>

        <!-- B. Mando a Distancia sobre la Tablet del Niño -->
        <section class="rcard">
          <div class="rcard-header">
            <div>
              <span class="rcard-eyebrow">Control Remoto Zero-HUD</span>
              <h2 class="rcard-title">📱 Acciones Remotas sobre el Dispositivo del Niño</h2>
            </div>
          </div>

          <div class="remote-actions-grid">
            <button type="button" id="btnRemoteAddAssist" class="raction-btn raction-amber">
              🤝 +1 Apoyo Verbal (CA)
            </button>
            <button type="button" id="btnRemoteLaunchEmojis" class="raction-btn raction-emerald">
              🏁 Cerrar Prueba y Lanzar Emojis al Niño
            </button>
            <button type="button" id="btnRemoteToggleCvi" class="raction-btn raction-outline">
              👁️ Alternar Modo CVI en Tablet
            </button>
          </div>

          <details style="margin-top: 12px; border-top: 1px solid #E2E8F0; padding-top: 10px;">
            <summary style="font-size: 0.82rem; font-weight: 700; color: #1E3A8A; cursor: pointer;">
              ⚙️ Configurar o Reiniciar Sesión del Niño Remotamente (P01–P04)
            </summary>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 8px; margin-top: 10px;">
              <select id="selRemParticipant" class="rselect">
                <option value="P01|Mateo|4|Rotacismo (/r/, /rr/)|standard_biophilic">P01: Mateo (4a • Rotacismo /r/)</option>
                <option value="P02|Sofía|3|Simplificación Sinfones (/pl/)|standard_biophilic">P02: Sofía (3a • Sinfones /pl/)</option>
                <option value="P03|Lucas|5|Dislalia Múltiple (/rr/, /s/)|standard_biophilic">P03: Lucas (5a • Dislalia DDA)</option>
                <option value="P04|Valentina|4|Sigmatismo (/s/) + Modo CVI|cvi_high_contrast">P04: Valentina (4a • Modo CVI)</option>
              </select>
              <select id="selRemRole" class="rselect">
                <option value="Docente de Educación Inicial (Lima Metropolitana)">Mediador: Docente Inicial (Lima)</option>
                <option value="Madre / Padre Tutor de Preescolar">Mediador: Madre / Padre Tutor</option>
                <option value="Estudiante G7 FISI-UNMSM (Inspección Cruzada)">Mediador: Estudiante G7 UNMSM</option>
              </select>
              <button type="button" id="btnRemoteStartSession" class="raction-btn raction-blue" style="min-height: 40px; padding: 8px 12px;">
                🚀 Iniciar en Tablet del Niño
              </button>
            </div>
          </details>
        </section>

        <!-- C. Indicadores en Tiempo Real -->
        <section class="rcard">
          <div class="rcard-header">
            <div>
              <span class="rcard-eyebrow">Telemetría Automática en Vivo</span>
              <h2 class="rcard-title">📈 Métricas Capturadas en Segundo Plano</h2>
            </div>
          </div>

          <div class="live-kpi-grid">
            <div class="mini-kpi-box">
              <span class="mini-kpi-label">Autonomía (SA%)</span>
              <strong class="mini-kpi-val">${k.saPercent}%</strong>
              <span class="mini-kpi-sub">Meta ≥ 85% (CA: ${k.caPercent}%)</span>
            </div>
            <div class="mini-kpi-box">
              <span class="mini-kpi-label">Acierto Táctil ≥48dp</span>
              <strong class="mini-kpi-val">${k.targetHitPercent}%</strong>
              <span class="mini-kpi-sub">Miss: ${k.tmrPercent}% (&lt;20%)</span>
            </div>
            <div class="mini-kpi-box">
              <span class="mini-kpi-label">Franja Palmar (H5)</span>
              <strong class="mini-kpi-val">${k.palmTouchesFiltered}</strong>
              <span class="mini-kpi-sub">Toques absorbidos (0 errores)</span>
            </div>
            <div class="mini-kpi-box">
              <span class="mini-kpi-label">Target Accuracy</span>
              <strong class="mini-kpi-val">${phonations.length ? k.targetAccuracyOverallPct + '%' : '—'}</strong>
              <span class="mini-kpi-sub">O:${k.psfOmissions} • S:${k.psfSubstitutions} • D:${k.psfDistortions}</span>
            </div>
            <div class="mini-kpi-box">
              <span class="mini-kpi-label">Acuerdo ASR/Humano</span>
              <strong class="mini-kpi-val">${k.asrHumanAgreementPct}%</strong>
              <span class="mini-kpi-sub">FP:${k.asrFalsePositives} | FN:${k.asrFalseNegatives}</span>
            </div>
            <div class="mini-kpi-box">
              <span class="mini-kpi-label">Emojis Niño (3–6a)</span>
              <strong class="mini-kpi-val">${k.emojiAcceptancePct}%</strong>
              <span class="mini-kpi-sub">Meta Saeedi et al. ≥ 90%</span>
            </div>
          </div>

          <div style="margin-top: 12px;">
            <div style="font-size: 0.74rem; font-weight: 700; color: #475569; margin-bottom: 5px;">
              Flujo de Eventos en Tiempo Real (${this.roomCode}):
            </div>
            <div class="event-feed">${eventsHtml}</div>
          </div>
        </section>
      `;
    }

    /* ========================================================================
       PESTAÑA 2: FICHA FONÉTICA BOSCH & MELGAR Y CALIBRACIÓN ASR vs. HUMANO
       ======================================================================== */
    renderTabBoschHtml() {
      const k = this.engine.kpis;
      const rows = this.engine.phonations.length === 0
        ? `<tr><td colspan="6" style="text-align:center; padding:18px; color:#64748B;">Sin emisiones aún. Cuando el niño hable por el micrófono o agregues una muestra abajo, aparecerá aquí.</td></tr>`
        : this.engine.phonations.map((p, idx) => {
            const concBadge = p.concordance === 'AGREEMENT'
              ? '<span class="badge badge-green">✔ Concordante</span>'
              : (p.concordance === 'FALSE_POSITIVE'
                  ? '<span class="badge badge-yellow">⚠️ Falso Positivo</span>'
                  : '<span class="badge badge-purple">⚠️ Falso Negativo</span>');
            return `
              <tr>
                <td><strong>#${p.index}</strong></td>
                <td><strong>${p.targetWord}</strong><br><small style="color:#64748B;">${p.phoneme} • ${p.position}</small></td>
                <td>${p.context === 'continuous' ? 'Continua' : 'Aislada'}</td>
                <td>${p.asrApproved ? '<span class="badge badge-green">⭐ Aprobó</span>' : '<span class="badge badge-purple">Reintento/DDA</span>'}</td>
                <td>
                  <select class="rselect sel-table-psf" data-pidx="${idx}">
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
        <section class="rcard">
          <div class="rcard-header">
            <div>
              <span class="rcard-eyebrow">Pucuhuaranga (2016) • Peña et al. (2024) • Strömbergsson et al. (2025)</span>
              <h2 class="rcard-title">🗣️ Registro Fonético Bosch &amp; Melgar y Concordancia ASR</h2>
            </div>
          </div>

          <div class="live-kpi-grid" style="margin-bottom: 14px;">
            <div class="mini-kpi-box">
              <span class="mini-kpi-label">Palabras Aisladas</span>
              <strong class="mini-kpi-val">${k.targetAccuracyIsolatedPct}%</strong>
              <span class="mini-kpi-sub">Posición Inicial/Medial/Final</span>
            </div>
            <div class="mini-kpi-box">
              <span class="mini-kpi-label">Frases / Trabalenguas</span>
              <strong class="mini-kpi-val">${k.targetAccuracyContinuousPct}%</strong>
              <span class="mini-kpi-sub">Habla conectada</span>
            </div>
            <div class="mini-kpi-box">
              <span class="mini-kpi-label">Conteo PSF (TEPROSIF)</span>
              <strong class="mini-kpi-val">O:${k.psfOmissions} S:${k.psfSubstitutions} D:${k.psfDistortions}</strong>
              <span class="mini-kpi-sub">Errores articulatorios</span>
            </div>
            <div class="mini-kpi-box">
              <span class="mini-kpi-label">Concordancia ASR</span>
              <strong class="mini-kpi-val">${k.asrHumanAgreementPct}%</strong>
              <span class="mini-kpi-sub">Meta ≥ 85%</span>
            </div>
          </div>

          <div class="rtable-wrap">
            <table class="rtable">
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

          <div style="margin-top: 14px; display:flex; flex-wrap:wrap; gap:8px; align-items:center; background:#F8FAFC; padding:10px 12px; border-radius:12px; border:1px dashed #CBD5E1;">
            <strong style="font-size:0.8rem;">+ Añadir palabra test (Bosch &amp; Melgar):</strong>
            <select id="selRemManualWord" class="rselect">
              <option value="Rana">Rana (/rr/ Inicial)</option>
              <option value="Pera">Pera (/r/ Medial)</option>
              <option value="Collar">Collar (/r/ Final)</option>
              <option value="Sapo">Sapo (/s/ Inicial)</option>
              <option value="Vaso">Vaso (/s/ Medial)</option>
              <option value="Plátano">Plátano (/pl/ Sinfón)</option>
              <option value="Guitarra">Guitarra (/rr/ Medial)</option>
              <option value="Erre con erre guitarra">Trabalenguas continuo (/rr/)</option>
            </select>
            <select id="selRemManualAsr" class="rselect">
              <option value="1">App: ⭐ Aprobó</option>
              <option value="0">App: Reintento/DDA</option>
            </select>
            <select id="selRemManualHuman" class="rselect">
              <option value="CORRECT">Humano: ✔ Correcto</option>
              <option value="S">Humano: S (Sustitución)</option>
              <option value="O">Humano: O (Omisión)</option>
              <option value="D">Humano: D (Distorsión)</option>
            </select>
            <button type="button" id="btnRemAddManual" class="raction-btn raction-blue" style="min-height:36px; padding:6px 14px; font-size:0.8rem;">
              + Registrar
            </button>
          </div>
        </section>
      `;
    }

    /* ========================================================================
       PESTAÑA 3: INSTRUMENTOS DEL MEDIADOR (PSSUQ 1-7 & MARS 1-5)
       ======================================================================== */
    renderTabPssuqMarsHtml() {
      const k = this.engine.kpis;
      return `
        <section class="rcard">
          <div class="rcard-header">
            <div>
              <span class="rcard-eyebrow">Capa 2 • Saeedi et al. (2024) • Furlong et al. (2018)</span>
              <h2 class="rcard-title">👩‍🏫 Evaluación por Mediadores: PSSUQ (${k.pssuqOverallMean}/7.0) y MARS (${k.marsTotalScore}/5.0)</h2>
            </div>
          </div>

          <h3 style="font-size:0.9rem; margin-bottom:8px; color:#1E3A8A;">
            A. Cuestionario PSSUQ (1 = Totalmente en desacuerdo • 7 = Totalmente de acuerdo | Meta ≥ 6.00, Interfaz ≥ 6.25)
          </h3>
          <div>
            ${this.engine.pssuqItems.map((item, idx) => `
              <div class="likert-row">
                <div style="flex:1; min-width:220px;">
                  <span class="badge badge-purple">${item.id} • ${item.tag}</span>
                  <div style="font-size:0.83rem; margin-top:4px;">${item.text}</div>
                </div>
                <div class="likert-btns">
                  ${[1, 2, 3, 4, 5, 6, 7].map(val => `
                    <button type="button" class="lbtn ${Number(item.score) === val ? 'active' : ''}" data-pssuq-idx="${idx}" data-val="${val}">${val}</button>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>

          <h3 style="font-size:0.9rem; margin: 16px 0 8px; color:#1E3A8A;">
            B. Escala de Calidad mHealth MARS (1 a 5 | Meta ≥ 4.20 vs. 3.7 promedio comercial)
          </h3>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(230px, 1fr)); gap:10px;">
            ${this.engine.marsDimensions.map((m, idx) => `
              <div class="mini-kpi-box">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:0.84rem;">${m.name}</strong>
                  <span class="badge badge-green">${m.score}/5.0</span>
                </div>
                <p style="font-size:0.77rem; color:#475569; margin:4px 0;">${m.desc}</p>
                <select class="rselect sel-rem-mars" data-midx="${idx}">
                  ${[3.0, 3.5, 4.0, 4.2, 4.5, 4.8, 5.0].map(v => `
                    <option value="${v}" ${Number(m.score) === v ? 'selected' : ''}>${v.toFixed(1)} / 5.0 (Benchmark: ${m.benchmark})</option>
                  `).join('')}
                </select>
              </div>
            `).join('')}
          </div>

          <div style="margin-top:14px;">
            <label for="txtRemTeacherNotes" style="font-size:0.82rem; font-weight:700; display:block; margin-bottom:5px;">
              C. Alertas Fonológicas Docentes en Lima Metropolitana (Huertas &amp; Roque, 2023):
            </label>
            <textarea id="txtRemTeacherNotes" rows="2" class="rinput" style="width:100%;">${this.engine.session.teacherClassroomNotes || ''}</textarea>
          </div>
        </section>
      `;
    }

    /* ========================================================================
       PESTAÑA 4: HEURÍSTICAS DE NIELSEN (0-4), 12 KPIS Y EXPORTACIÓN
       ======================================================================== */
    renderTabNielsenExportHtml() {
      const k = this.engine.kpis;
      return `
        <section class="rcard">
          <div class="rcard-header">
            <div>
              <span class="rcard-eyebrow">Capa 1 • Saeedi et al. (2024) • Furlong et al. (2018)</span>
              <h2 class="rcard-title">🔍 10 Heurísticas de Nielsen (Media: ${k.nielsenMeanSeverity}/4.0) y Pureza Fonoacústica</h2>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button type="button" id="btnRemExportJson" class="raction-btn raction-emerald" style="min-height:38px; padding:7px 14px; font-size:0.8rem;">
                📥 Descargar JSON (SCED)
              </button>
              <button type="button" id="btnRemExportCsv" class="raction-btn raction-amber" style="min-height:38px; padding:7px 14px; font-size:0.8rem;">
                📊 Descargar CSV
              </button>
            </div>
          </div>

          <div class="rtable-wrap">
            <table class="rtable">
              <thead>
                <tr>
                  <th>Heurística / Criterio</th>
                  <th>Aspecto Auditado</th>
                  <th>Severidad (0–4)</th>
                </tr>
              </thead>
              <tbody>
                ${this.engine.nielsenHeuristics.map((h, idx) => `
                  <tr style="${h.critical ? 'background:#FFFBEB;' : ''}">
                    <td><strong>${h.name}</strong></td>
                    <td>${h.desc}</td>
                    <td>
                      <select class="rselect sel-rem-nielsen" data-hidx="${idx}">
                        ${[0, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0].map(v => `
                          <option value="${v}" ${Number(h.severity) === v ? 'selected' : ''}>${v.toFixed(2)}</option>
                        `).join('')}
                      </select>
                    </td>
                  </tr>
                `).join('')}
                <tr style="background:#EFF6FF;">
                  <td><strong>FA-01: Ausencia de Vocal Parásita Schwa [ə]</strong></td>
                  <td>Erradicación de distorsión robótica o inserción de [ə] al aislar consonantes (Furlong et al., 2018).</td>
                  <td>
                    <select id="selRemSchwa" class="rselect">
                      <option value="clean" ${!this.engine.schwaAntipatternDetected ? 'selected' : ''}>0.00 (✓ Cero Schwa)</option>
                      <option value="detected" ${this.engine.schwaAntipatternDetected ? 'selected' : ''}>3.00 (⚠️ Detectada)</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="rcard">
          <div class="rcard-header">
            <div>
              <span class="rcard-eyebrow"> Consolidado Científico Actividad 10</span>
              <h2 class="rcard-title">📊 Matriz de los 12 KPIs Fundamentados</h2>
            </div>
          </div>
          ${this.engine.renderTabResumenHtml()}
        </section>
      `;
    }

    bindTabEvents() {
      // Botones gigantes de calificación PSF en Pestaña 1
      this.mainContainer.querySelectorAll('.psf-giant-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.psfIdx, 10);
          const judgment = btn.dataset.psfJ;
          this.engine.setHumanJudgmentForPhonation(idx, judgment);
          this.sendCommand('CMD_SET_HUMAN_PSF', { index: idx, judgment });
          this.showToast(`✓ Calificado #${idx + 1} como ${judgment}`);
          this.render();
        });
      });

      const selLiveIdx = document.getElementById('selLivePhonationIndex');
      if (selLiveIdx) {
        selLiveIdx.addEventListener('change', () => {
          this.selectedPhonationIdx = parseInt(selLiveIdx.value, 10);
          this.render();
        });
      }

      // Acciones remotas sobre la tablet del niño
      const btnAssist = document.getElementById('btnRemoteAddAssist');
      if (btnAssist) {
        btnAssist.addEventListener('click', () => {
          this.engine.registerModeratorAssist();
          this.sendCommand('CMD_ADD_ASSIST_CA', {});
          this.showToast('🤝 +1 Apoyo Verbal (CA) registrado en la sesión del niño');
          this.render();
        });
      }

      const btnEmojis = document.getElementById('btnRemoteLaunchEmojis');
      if (btnEmojis) {
        btnEmojis.addEventListener('click', () => {
          this.sendCommand('CMD_LAUNCH_EMOJIS', {});
          this.showToast('🏁 Cuestionario de Emojis desplegado en la tablet del niño');
        });
      }

      const btnCvi = document.getElementById('btnRemoteToggleCvi');
      if (btnCvi) {
        btnCvi.addEventListener('click', () => {
          this.sendCommand('CMD_TOGGLE_CVI', {});
          this.showToast('👁️ Modo Alto Contraste CVI conmutado en la tablet del niño');
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
          this.showToast(`🚀 Sesión ${pid} iniciada remotamente en la tablet del niño`);
        });
      }

      // Pestaña 2: Tabla Bosch & Melgar
      this.mainContainer.querySelectorAll('.sel-table-psf').forEach(sel => {
        sel.addEventListener('change', () => {
          const idx = parseInt(sel.dataset.pidx, 10);
          const judgment = sel.value;
          this.engine.setHumanJudgmentForPhonation(idx, judgment);
          this.sendCommand('CMD_SET_HUMAN_PSF', { index: idx, judgment });
          this.showToast(`✓ Actualizado #${idx + 1} (${judgment})`);
          this.render();
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

      // Pestaña 3: PSSUQ & MARS
      this.mainContainer.querySelectorAll('.lbtn').forEach(btn => {
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
          this.showToast('✓ Notas docentes guardadas');
        });
      }

      // Pestaña 4: Nielsen, Schwa y Exportación
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

      const btnJson = document.getElementById('btnRemExportJson');
      if (btnJson) {
        btnJson.addEventListener('click', () => {
          const jsonStr = JSON.stringify(this.engine.generateFullExportObject(), null, 2);
          this.engine.downloadFile(jsonStr, `${this.engine.session.sessionId.toLowerCase()}.json`, 'application/json');
        });
      }

      const btnCsv = document.getElementById('btnRemExportCsv');
      if (btnCsv) {
        btnCsv.addEventListener('click', () => {
          this.engine.downloadFile(this.engine.generateCsvReport(), `${this.engine.session.sessionId.toLowerCase()}_kpis.csv`, 'text/csv;charset=utf-8;');
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
