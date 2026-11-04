/* ==========================================================================
   AVA VECTOR AVATAR ENGINE v2.0 - AVATAR VECTORIAL MULTICAPA Y ROPERO EQUIPABLE
   Cumple con: CUS-05, RF-GAM-002, Pauta 5 Du et al. (2023), Hourcade (2008), Saeedi (2024)
   Diseño: Anatomía fiel de abejita del Bosque Sonoro (cabeza peludita, doble ala,
           torso rayado, manitas expresivas y botitas), 5 ranuras equipables en
           simultáneo y probador interactivo con iconos vectoriales 1:1.
   ========================================================================== */

class AvaVectorAvatarEngine {
  constructor() {
    this._uidCounter = 0;
    this.defaultLoadout = {
      head: null,
      eyes: null,
      wings: null,
      neck: null,
      hand: null
    };
    this.equippedLoadout = this.loadEquippedLoadout();
    this.previewOverlay = null; // { slot, itemId } para probador temporal en pedestal (CUS-05 paso 4)
    this.instances = new Map(); // el -> { options }
    this.currentMood = 'happy';
    this.isSpeaking = false;
    this.isListening = false;
    this.initGlobalVoiceEvents();
  }

  /* --- PERSISTENCIA MULTIRANURA Y MIGRACIÓN LIMPIA --- */
  loadEquippedLoadout() {
    const base = { ...this.defaultLoadout };
    try {
      const raw = localStorage.getItem('bosque_ava_loadout');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          Object.keys(base).forEach(k => {
            if (typeof parsed[k] === 'string' && parsed[k]) {
              base[k] = parsed[k];
            }
          });
          return base;
        }
      }
      // Migración suave si existía un ítem del esquema anterior
      const legacy = localStorage.getItem('bosque_ava_accessory');
      const legacyMap = {
        'item-crown': 'head-floral-crown',
        'item-pirate': 'head-acorn-beret',
        'item-glasses': 'eyes-explorer-goggles',
        'item-wings': 'wings-fairy-dew',
        'item-cape': 'neck-leaf-cape',
        'item-honey': 'hand-honey-jar'
      };
      if (legacy && legacyMap[legacy]) {
        const mappedId = legacyMap[legacy];
        const slot = mappedId.split('-')[0];
        if (slot in base) base[slot] = mappedId;
        localStorage.setItem('bosque_ava_loadout', JSON.stringify(base));
      }
    } catch (e) {}
    return base;
  }

  persistLoadout() {
    try {
      localStorage.setItem('bosque_ava_loadout', JSON.stringify(this.equippedLoadout));
    } catch (e) {}
  }

  equipItem(slot, itemId) {
    if (!(slot in this.defaultLoadout)) return;
    this.equippedLoadout[slot] = itemId || null;
    if (this.previewOverlay && this.previewOverlay.slot === slot) {
      this.previewOverlay = null;
    }
    this.persistLoadout();
    this.updateAllInstances();
    window.dispatchEvent(new CustomEvent('ava-loadout-changed', { detail: { loadout: this.getEquippedLoadout() } }));
  }

  unequipSlot(slot) {
    if (!(slot in this.defaultLoadout)) return;
    this.equippedLoadout[slot] = null;
    if (this.previewOverlay && this.previewOverlay.slot === slot) {
      this.previewOverlay = null;
    }
    this.persistLoadout();
    this.updateAllInstances();
    window.dispatchEvent(new CustomEvent('ava-loadout-changed', { detail: { loadout: this.getEquippedLoadout() } }));
  }

  clearAllEquipped() {
    this.equippedLoadout = { ...this.defaultLoadout };
    this.previewOverlay = null;
    this.persistLoadout();
    this.updateAllInstances();
    window.dispatchEvent(new CustomEvent('ava-loadout-changed', { detail: { loadout: this.getEquippedLoadout() } }));
  }

  isItemEquipped(itemId) {
    return Object.values(this.equippedLoadout).includes(itemId);
  }

  getEquippedForSlot(slot) {
    return this.equippedLoadout[slot] || null;
  }

  getEquippedLoadout() {
    return { ...this.equippedLoadout };
  }

  getEquippedCount() {
    return Object.values(this.equippedLoadout).filter(Boolean).length;
  }

  /* Probador mágico temporal en el pedestal de la Cueva (CUS-05 paso 4) */
  setPedestalPreview(slot, itemId) {
    if (!slot || !itemId) {
      this.previewOverlay = null;
    } else {
      this.previewOverlay = { slot, itemId };
    }
    this.updateAllInstances();
  }

  clearPedestalPreview() {
    if (!this.previewOverlay) return;
    this.previewOverlay = null;
    this.updateAllInstances();
  }

  getPreviewOverlay() {
    return this.previewOverlay;
  }

  /* Compatibilidad retroactiva */
  loadEquippedAccessory() {
    return Object.values(this.equippedLoadout).find(Boolean) || null;
  }

  saveEquippedAccessory(accessoryId) {
    if (!accessoryId) {
      this.clearAllEquipped();
      return;
    }
    const slot = accessoryId.split('-')[0];
    if (slot in this.defaultLoadout) {
      this.equipItem(slot, accessoryId);
    }
  }

  /* --- REACTIVIDAD GLOBAL DE VOZ, ESCUCHA Y CELEBRACIÓN --- */
  initGlobalVoiceEvents() {
    window.addEventListener('ava-speech-start', () => {
      this.isSpeaking = true;
      this.setGlobalMood('talking');
    });

    window.addEventListener('ava-speech-end', () => {
      this.isSpeaking = false;
      if (!this.isListening) {
        this.setGlobalMood('happy');
      }
    });

    window.addEventListener('ava-mic-start', () => {
      this.isListening = true;
      this.setGlobalMood('listening');
    });

    window.addEventListener('ava-mic-end', () => {
      this.isListening = false;
      this.setGlobalMood('happy');
    });

    window.addEventListener('ava-celebrate', () => {
      this.triggerGlobalCelebration();
    });
  }

  setGlobalMood(mood) {
    this.currentMood = mood;
    this.instances.forEach((instance, el) => {
      this.renderInto(el, { ...instance.options, mood });
    });
  }

  triggerGlobalCelebration() {
    this.instances.forEach((instance, el) => {
      this.renderInto(el, { ...instance.options, mood: 'celebrate' });
      el.classList.add('ava-celebrating-bounce');
      setTimeout(() => {
        el.classList.remove('ava-celebrating-bounce');
        if (!this.isSpeaking && !this.isListening) {
          this.renderInto(el, { ...instance.options, mood: 'happy' });
        }
      }, 2200);
    });
  }

  /* --- MONTAJE E INTERACTIVIDAD TÁCTIL --- */
  mount(target, options = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;

    const defaultOptions = {
      size: 80,
      mood: this.currentMood,
      animated: true,
      allowPreview: el.id === 'caveAvaPedestal',
      onTap: null
    };

    const finalOptions = { ...defaultOptions, ...options };
    this.instances.set(el, { options: finalOptions });
    this.renderInto(el, finalOptions);

    el.addEventListener('click', (e) => {
      if (el.id === 'headerAppLogo') return;

      el.classList.add('ava-touch-wiggle');
      setTimeout(() => el.classList.remove('ava-touch-wiggle'), 620);

      // Si se definió una función onTap contextual explícita (A.10 - H10)
      if (typeof finalOptions.onTap === 'function') {
        finalOptions.onTap(el, e);
        return;
      }

      // Despachar evento para que cualquier módulo responda contextualmente
      const customTapEvent = new CustomEvent('ava-avatar-tap', {
        detail: { targetId: el.id, element: el },
        bubbles: true,
        cancelable: true
      });
      const allowed = el.dispatchEvent(customTapEvent);
      if (!allowed) return;

      if (window.audioEngine) {
        window.audioEngine.playClick();
        if (!this.isSpeaking && !this.isListening) {
          // 1. Exclusivamente en la Cueva del Avatar / Pedestal de Premios
          if (el.id === 'caveAvaPedestal' || el.closest('#screen-avatar')) {
            const equippedTotal = this.getEquippedCount();
            const cavePhrases = equippedTotal > 0
              ? [
                  '¡Mira qué linda me veo con mis tesoros del bosque!',
                  '¡Qué alegría! ¡Gracias por vestirme con tus estrellas!',
                  '¡Me encanta mi traje para volar por el bosque!'
                ]
              : [
                  '¡Hola amiguito! Prueba ponerme un sombrerito o alitas brillantes.',
                  '¡Qué linda cueva! Elige tus tesoros favoritos para vestirme.'
                ];
            const phrase = cavePhrases[Math.floor(Math.random() * cavePhrases.length)];
            window.audioEngine.speak(phrase);
            return;
          }

          // 2. Pantalla de Ejercicios (Trabalenguas, Rimas, Adivinanzas)
          if (el.id === 'exerciseAvaAvatar' || el.closest('#screen-exercise')) {
            if (typeof window.repeatCurrentExercisePrompt === 'function') {
              window.repeatCurrentExercisePrompt();
              return;
            }
          }

          // 3. Pantalla de Pares Mínimos
          if (el.id === 'pairsAvaAvatar' || el.closest('#screen-pairs')) {
            if (typeof window.repeatCurrentPairsPrompt === 'function') {
              window.repeatCurrentPairsPrompt();
              return;
            }
          }

          // 4. Pantalla de Bingo Sonoro
          if (el.id === 'bingoAvaAvatar' || el.closest('#screen-bingo')) {
            if (typeof window.repeatCurrentBingoPrompt === 'function') {
              window.repeatCurrentBingoPrompt();
              return;
            }
          }

          // 5. Modal de Praxias Anatómicas 2D
          if (el.id === 'praxiaAvaAvatar' || el.closest('#praxiaModal')) {
            if (typeof window.playCurrentPraxiaNarration === 'function') {
              window.playCurrentPraxiaNarration();
              return;
            }
          }

          // 6. Menú Principal o Saludos Amigables
          const generalGreetings = [
            '¡Hola amiguito! Bienvenido al Bosque Sonoro. ¡Toca un vagón para empezar a jugar!',
            '¡Chu chú! Elige un juego para volar juntos por el bosque.',
            '¡Jajaja, qué cosquillas me haces! ¿A qué jugamos hoy?',
            '¡A volar por el Bosque Sonoro! Toca un vagón.'
          ];
          const phrase = generalGreetings[Math.floor(Math.random() * generalGreetings.length)];
          window.audioEngine.speak(phrase);
        }
      }
    });
  }

  updateAllInstances() {
    this.instances.forEach((instance, el) => {
      this.renderInto(el, { ...instance.options, mood: this.currentMood });
    });
  }

  resolveLoadoutForOptions(options = {}) {
    if (options.loadout) {
      return { ...this.defaultLoadout, ...options.loadout };
    }
    const active = { ...this.equippedLoadout };
    if (options.accessory && typeof options.accessory === 'string') {
      const slot = options.accessory.split('-')[0];
      if (slot in active) active[slot] = options.accessory;
    }
    if (options.allowPreview && this.previewOverlay) {
      active[this.previewOverlay.slot] = this.previewOverlay.itemId;
    }
    return active;
  }

  renderInto(container, options) {
    container.innerHTML = this.generateSvg(options);
  }

  /* =========================================================================
     GENERADOR PRINCIPAL DEL AVATAR VECTORIAL AVA (viewBox="0 0 180 186")
     IDs internos prefijados por instancia para inmunidad a display:none en WebView
     ========================================================================= */
  generateSvg(options = {}) {
    const uid = `ava${++this._uidCounter}`;
    const mood = options.mood || this.currentMood || 'happy';
    const isAnim = options.animated !== false;
    const animClass = isAnim ? 'ava-animated' : '';
    const loadout = this.resolveLoadoutForOptions(options);

    const headAcc = loadout.head;
    const eyesAcc = loadout.eyes;
    const wingsAcc = loadout.wings;
    const neckAcc = loadout.neck;
    const handAcc = loadout.hand;

    const hasWingMagic = wingsAcc === 'wings-fairy-dew';
    const hasMonarch = wingsAcc === 'wings-monarch';

    return `
      <svg class="ava-vector-svg ${animClass} mood-${mood}"
           viewBox="0 0 180 186"
           width="100%"
           height="100%"
           xmlns="http://www.w3.org/2000/svg"
           role="img"
           aria-label="Abejita Ava Avatar del Bosque Sonoro">
        <defs>
          <!-- Cabeza y Torso de Peluche Melífero -->
          <radialGradient id="${uid}-headGrad" cx="42%" cy="34%" r="64%">
            <stop offset="0%" stop-color="#FFFDE7"/>
            <stop offset="45%" stop-color="#FFE082"/>
            <stop offset="82%" stop-color="#FFC107"/>
            <stop offset="100%" stop-color="#F57F17"/>
          </radialGradient>

          <radialGradient id="${uid}-torsoGrad" cx="40%" cy="35%" r="68%">
            <stop offset="0%" stop-color="#FFF59D"/>
            <stop offset="55%" stop-color="#FFD54F"/>
            <stop offset="100%" stop-color="#F9A825"/>
          </radialGradient>

          <!-- Rubor Coral Pediátrico -->
          <radialGradient id="${uid}-blushGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FF7043" stop-opacity="0.58"/>
            <stop offset="65%" stop-color="#FF8A65" stop-opacity="0.24"/>
            <stop offset="100%" stop-color="#FF8A65" stop-opacity="0"/>
          </radialGradient>

          <!-- Alas Naturales Iridiscentes -->
          <linearGradient id="${uid}-wingNatural" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.92"/>
            <stop offset="55%" stop-color="#E1F5FE" stop-opacity="0.84"/>
            <stop offset="100%" stop-color="#B3E5FC" stop-opacity="0.72"/>
          </linearGradient>

          <!-- Alas de Mariposa Monarca -->
          <linearGradient id="${uid}-wingMonarch" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFF176"/>
            <stop offset="45%" stop-color="#FFA726"/>
            <stop offset="100%" stop-color="#E65100"/>
          </linearGradient>

          <!-- Alas de Hada del Rocío -->
          <linearGradient id="${uid}-wingFairy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#B2EBF2" stop-opacity="0.95"/>
            <stop offset="50%" stop-color="#E1BEE7" stop-opacity="0.92"/>
            <stop offset="100%" stop-color="#F48FB1" stop-opacity="0.88"/>
          </linearGradient>

          <!-- Capa de Hoja Real Esmeralda -->
          <linearGradient id="${uid}-leafCapeGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stop-color="#66BB6A"/>
            <stop offset="55%" stop-color="#2E7D32"/>
            <stop offset="100%" stop-color="#1B5E20"/>
          </linearGradient>

          <!-- Capa Nocturna de Luciérnagas -->
          <linearGradient id="${uid}-starCapeGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stop-color="#7E57C2"/>
            <stop offset="60%" stop-color="#4527A0"/>
            <stop offset="100%" stop-color="#281868"/>
          </linearGradient>

          <!-- Sombrero de Setita Roja -->
          <radialGradient id="${uid}-mushroomGrad" cx="42%" cy="30%" r="68%">
            <stop offset="0%" stop-color="#FF6E6E"/>
            <stop offset="55%" stop-color="#E53935"/>
            <stop offset="100%" stop-color="#B71C1C"/>
          </radialGradient>

          <!-- Boina de Bellota -->
          <linearGradient id="${uid}-acornGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#A97142"/>
            <stop offset="60%" stop-color="#7B4B27"/>
            <stop offset="100%" stop-color="#4E2F18"/>
          </linearGradient>

          <!-- Recorte exacto del abdomen para las franjas de abeja -->
          <clipPath id="${uid}-torsoClip">
            <path d="M64,113 C58,131 64,154 90,155 C116,154 122,131 116,113 C111,101 69,101 64,113 Z"/>
          </clipPath>
        </defs>

        <!-- CAPA 0: SOMBRA DE APOYO DIRECTA SOBRE EL TRONCO -->
        <ellipse cx="90" cy="173.8" rx="30" ry="4.2" fill="rgba(62, 39, 35, 0.22)"/>

        <!-- CAPA 1: CAPAS DE ESPALDA (ALTA VISIBILIDAD LATERAL E INFERIOR) -->
        ${neckAcc === 'neck-leaf-cape' ? `
          <g class="ava-layer-cape ava-cape-leaf">
            <path d="M64,104 C36,114 28,144 34,164 C52,169 68,162 90,168 C112,162 128,169 146,164 C152,144 144,114 116,104 Z"
                  fill="url(#${uid}-leafCapeGrad)" stroke="#1B5E20" stroke-width="2.2" stroke-linejoin="round"/>
            <!-- Nervaduras botánicas doradas -->
            <path d="M62,110 C48,130 44,146 42,161" stroke="#C5E1A5" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.8"/>
            <path d="M118,110 C132,130 136,146 138,161" stroke="#C5E1A5" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.8"/>
            <path d="M34,163 C52,168 68,161 90,167 C112,161 128,168 146,163" stroke="#FFD54F" stroke-width="2.2" fill="none"/>
          </g>
        ` : neckAcc === 'neck-starlight-cape' ? `
          <g class="ava-layer-cape ava-cape-starlight">
            <path d="M63,104 C34,114 26,145 32,165 C54,171 72,164 90,169 C108,164 126,171 148,165 C154,145 146,114 117,104 Z"
                  fill="url(#${uid}-starCapeGrad)" stroke="#FFD54F" stroke-width="2.4" stroke-linejoin="round"/>
            <!-- Constelación de luciérnagas doradas -->
            <circle cx="46" cy="142" r="2.6" fill="#FFF59D"/>
            <circle cx="54" cy="155" r="2" fill="#FFD54F"/>
            <circle cx="134" cy="142" r="2.6" fill="#FFF59D"/>
            <circle cx="126" cy="155" r="2" fill="#FFD54F"/>
            <path d="M46,135 L47.2,138.8 L51,140 L47.2,141.2 L46,145 L44.8,141.2 L41,140 L44.8,138.8 Z" fill="#FFF59D"/>
            <path d="M134,135 L135.2,138.8 L139,140 L135.2,141.2 L134,145 L132.8,141.2 L129,140 L132.8,138.8 Z" fill="#FFF59D"/>
          </g>
        ` : ''}

        <!-- CAPA 2: ALAS DOBLES DE ABEJITA / MARIPOSA / HADA -->
        <g class="ava-layer-wings ${hasWingMagic ? 'ava-magical-wings' : ''} ${hasMonarch ? 'ava-monarch-wings' : ''}">
          <!-- ALA IZQUIERDA (Pivote en 64, 108) -->
          <g class="ava-wing ava-wing-left">
            ${hasMonarch ? `
              <!-- Ala Monarca Izquierda -->
              <path d="M64,108 C42,68 6,68 9,98 C11,115 36,118 64,113 Z"
                    fill="url(#${uid}-wingMonarch)" stroke="#2A1810" stroke-width="3.2"/>
              <path d="M64,113 C38,116 17,127 24,143 C31,155 53,142 64,121 Z"
                    fill="url(#${uid}-wingMonarch)" stroke="#2A1810" stroke-width="3"/>
              <!-- Venas y motas blancas de Monarca -->
              <path d="M62,109 Q34,92 14,92 M62,110 Q38,104 20,107 M62,116 Q38,128 28,138" stroke="#2A1810" stroke-width="1.8" fill="none"/>
              <circle cx="16" cy="84" r="2.3" fill="#FFFFFF"/>
              <circle cx="15" cy="97" r="2.5" fill="#FFFFFF"/>
              <circle cx="21" cy="108" r="2" fill="#FFFFFF"/>
              <circle cx="29" cy="139" r="2.2" fill="#FFFFFF"/>
            ` : hasWingMagic ? `
              <!-- Ala de Hada del Rocío Izquierda -->
              <path d="M64,108 C44,62 6,62 11,94 C14,112 38,116 64,113 Z"
                    fill="url(#${uid}-wingFairy)" stroke="#AB47BC" stroke-width="2.4"/>
              <path d="M64,113 C40,117 18,128 24,145 C30,156 54,143 64,121 Z"
                    fill="url(#${uid}-wingFairy)" stroke="#8E24AA" stroke-width="2.2"/>
              <path d="M58,107 Q34,86 18,84 M58,115 Q36,128 30,140" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.85"/>
              <circle cx="14" cy="70" r="2.4" fill="#FFF59D"/>
              <circle cx="20" cy="148" r="2" fill="#FFF59D"/>
            ` : `
              <!-- Ala Natural Doble Lóbulo (Fiel al arte original de Ava) -->
              <path d="M64,108 C42,74 11,76 14,100 C17,115 41,117 64,112 Z"
                    fill="url(#${uid}-wingNatural)" stroke="#64B5F6" stroke-width="2"/>
              <path d="M64,112 C42,115 24,125 29,138 C35,148 53,136 64,119 Z"
                    fill="url(#${uid}-wingNatural)" stroke="#64B5F6" stroke-width="1.8"/>
              <path d="M60,108 Q38,94 21,95 M59,115 Q42,124 34,133" stroke="#90CAF9" stroke-width="1.4" stroke-linecap="round" fill="none"/>
            `}
          </g>

          <!-- ALA DERECHA (Pivote en 116, 108) -->
          <g class="ava-wing ava-wing-right">
            ${hasMonarch ? `
              <!-- Ala Monarca Derecha -->
              <path d="M116,108 C138,68 174,68 171,98 C169,115 144,118 116,113 Z"
                    fill="url(#${uid}-wingMonarch)" stroke="#2A1810" stroke-width="3.2"/>
              <path d="M116,113 C142,116 163,127 156,143 C149,155 127,142 116,121 Z"
                    fill="url(#${uid}-wingMonarch)" stroke="#2A1810" stroke-width="3"/>
              <path d="M118,109 Q146,92 166,92 M118,110 Q142,104 160,107 M118,116 Q142,128 152,138" stroke="#2A1810" stroke-width="1.8" fill="none"/>
              <circle cx="164" cy="84" r="2.3" fill="#FFFFFF"/>
              <circle cx="165" cy="97" r="2.5" fill="#FFFFFF"/>
              <circle cx="159" cy="108" r="2" fill="#FFFFFF"/>
              <circle cx="151" cy="139" r="2.2" fill="#FFFFFF"/>
            ` : hasWingMagic ? `
              <!-- Ala de Hada del Rocío Derecha -->
              <path d="M116,108 C136,62 174,62 169,94 C166,112 142,116 116,113 Z"
                    fill="url(#${uid}-wingFairy)" stroke="#AB47BC" stroke-width="2.4"/>
              <path d="M116,113 C140,117 162,128 156,145 C150,156 126,143 116,121 Z"
                    fill="url(#${uid}-wingFairy)" stroke="#8E24AA" stroke-width="2.2"/>
              <path d="M122,107 Q146,86 162,84 M122,115 Q144,128 150,140" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.85"/>
              <circle cx="166" cy="70" r="2.4" fill="#FFF59D"/>
              <circle cx="160" cy="148" r="2" fill="#FFF59D"/>
            ` : `
              <!-- Ala Natural Doble Lóbulo Derecha -->
              <path d="M116,108 C138,74 169,76 166,100 C163,115 139,117 116,112 Z"
                    fill="url(#${uid}-wingNatural)" stroke="#64B5F6" stroke-width="2"/>
              <path d="M116,112 C138,115 156,125 151,138 C145,148 127,136 116,119 Z"
                    fill="url(#${uid}-wingNatural)" stroke="#64B5F6" stroke-width="1.8"/>
              <path d="M120,108 Q142,94 159,95 M121,115 Q138,124 146,133" stroke="#90CAF9" stroke-width="1.4" stroke-linecap="round" fill="none"/>
            `}
          </g>
        </g>

        <!-- CAPA 3: PATITAS DE PIE, AGUIJÓN AMIGABLE Y TORSO RAYADO -->
        <g class="ava-layer-body">
          <!-- Aguijón redondeado amigable -->
          <path d="M86.5,153 Q90,162 93.5,153 Z" fill="#3E2723"/>

          <!-- Piernitas y botitas tiernas -->
          <path d="M79,151 L77,168" stroke="#3E2723" stroke-width="5.2" stroke-linecap="round"/>
          <ellipse cx="74.5" cy="170.5" rx="7" ry="4" fill="#4E342E" stroke="#2A1810" stroke-width="1.3"/>
          <ellipse cx="72.5" cy="169.3" rx="2.2" ry="1" fill="rgba(255,255,255,0.28)"/>

          <path d="M101,151 L103,168" stroke="#3E2723" stroke-width="5.2" stroke-linecap="round"/>
          <ellipse cx="105.5" cy="170.5" rx="7" ry="4" fill="#4E342E" stroke="#2A1810" stroke-width="1.3"/>
          <ellipse cx="107.5" cy="169.3" rx="2.2" ry="1" fill="rgba(255,255,255,0.28)"/>

          <!-- Torso Melífero con Franjas Chocolate Recortadas -->
          <g clip-path="url(#${uid}-torsoClip)">
            <path d="M64,113 C58,131 64,154 90,155 C116,154 122,131 116,113 C111,101 69,101 64,113 Z"
                  fill="url(#${uid}-torsoGrad)"/>
            <!-- Cuello peludito chocolate superior -->
            <path d="M56,100 Q90,111 124,100 L124,113 Q90,122 56,113 Z" fill="#3E2723"/>
            <!-- Franja central chocolate -->
            <path d="M56,125 Q90,136 124,125 L124,139 Q90,149 56,139 Z" fill="#3E2723"/>
            <!-- Brillo lateral de volumen 3D -->
            <ellipse cx="74" cy="128" rx="9" ry="18" fill="rgba(255,255,255,0.18)"/>
          </g>
          <!-- Contorno suave del torso -->
          <path d="M64,113 C58,131 64,154 90,155 C116,154 122,131 116,113 C111,101 69,101 64,113 Z"
                fill="none" stroke="#E68A00" stroke-width="2"/>
        </g>

        <!-- CAPA 4: ACCESORIOS FRONTALES DE CUELLO (AUDÍFONOS / BROCHES DE CAPA) -->
        <g class="ava-layer-collar">
          ${neckAcc === 'neck-headphones' ? `
            <!-- Audífonos Melódicos del Bosque (Homenaje al arte original de Ava) -->
            <path d="M62,102 Q90,117 118,102" fill="none" stroke="#26A69A" stroke-width="5.5" stroke-linecap="round"/>
            <!-- Auricular Izquierdo -->
            <g transform="rotate(-14 66 108)">
              <ellipse cx="66" cy="108" rx="8.5" ry="10.5" fill="#FFF8E1" stroke="#00796B" stroke-width="2"/>
              <ellipse cx="67.5" cy="108" rx="5.5" ry="7.5" fill="#4DB6AC"/>
              <circle cx="68.5" cy="108" r="3" fill="#FFD54F"/>
            </g>
            <!-- Auricular Derecho -->
            <g transform="rotate(14 114 108)">
              <ellipse cx="114" cy="108" rx="8.5" ry="10.5" fill="#FFF8E1" stroke="#00796B" stroke-width="2"/>
              <ellipse cx="112.5" cy="108" rx="5.5" ry="7.5" fill="#4DB6AC"/>
              <circle cx="111.5" cy="108" r="3" fill="#FFD54F"/>
            </g>
          ` : neckAcc === 'neck-leaf-cape' ? `
            <!-- Cuello de Hojas Esmeralda y Broche Girasol -->
            <path d="M65,103 Q77,115 90,106 Q78,99 65,103 Z" fill="#66BB6A" stroke="#1B5E20" stroke-width="1.6"/>
            <path d="M115,103 Q103,115 90,106 Q102,99 115,103 Z" fill="#66BB6A" stroke="#1B5E20" stroke-width="1.6"/>
            <circle cx="90" cy="106" r="6" fill="#FFD54F" stroke="#E65100" stroke-width="1.8"/>
            <circle cx="90" cy="106" r="2.6" fill="#6D4C41"/>
          ` : neckAcc === 'neck-starlight-cape' ? `
            <!-- Cuello Real y Gema de Luciérnaga -->
            <path d="M65,103 Q90,115 115,103" fill="none" stroke="#FFD54F" stroke-width="4" stroke-linecap="round"/>
            <polygon points="90,99 95,106 90,113 85,106" fill="#FFF176" stroke="#F57F17" stroke-width="1.8"/>
          ` : ''}
        </g>

        <!-- CAPA 5: BRAZOS Y MANITAS EXPRESIVAS -->
        <g class="ava-layer-arms">
          <!-- Brazo Izquierdo Saludando -->
          <g class="${mood === 'talking' || mood === 'celebrate' ? 'ava-hand-wave' : ''}">
            <path d="M64,115 Q48,112 39,98" fill="none" stroke="#3E2723" stroke-width="4.8" stroke-linecap="round"/>
            <circle cx="38" cy="97" r="5.2" fill="#4E342E" stroke="#2A1810" stroke-width="1.2"/>
            <circle cx="42.5" cy="94" r="2.3" fill="#4E342E"/>
            <circle cx="35.5" cy="92.5" r="2.1" fill="#4E342E"/>
          </g>

          <!-- Brazo Derecho (Sostiene tesoro si hay ítem en mano, o saluda libre) -->
          ${handAcc ? `
            <path d="M116,115 Q131,115 143,107" fill="none" stroke="#3E2723" stroke-width="4.8" stroke-linecap="round"/>
            <circle cx="144" cy="107" r="5" fill="#4E342E" stroke="#2A1810" stroke-width="1.2"/>
          ` : `
            <path d="M116,115 Q132,112 141,98" fill="none" stroke="#3E2723" stroke-width="4.8" stroke-linecap="round"/>
            <circle cx="142" cy="97" r="5.2" fill="#4E342E" stroke="#2A1810" stroke-width="1.2"/>
            <circle cx="137.5" cy="94" r="2.3" fill="#4E342E"/>
            <circle cx="144.5" cy="92.5" r="2.1" fill="#4E342E"/>
          `}
        </g>

        <!-- CAPA 6: TESOROS EN MANO (SILUETEADOS AL COSTADO SIN SOLAPAR EL TORSO) -->
        <g class="ava-layer-hand">
          ${handAcc === 'hand-honey-jar' ? `
            <!-- Tarrito de Miel Fónica con Mielero y Corazón -->
            <g class="ava-acc-honey">
              <!-- Palito mielero asomando -->
              <path d="M159,90 L166,76" stroke="#8D6E63" stroke-width="3" stroke-linecap="round"/>
              <ellipse cx="167" cy="75" rx="4.2" ry="3" transform="rotate(-28 167 75)" fill="#FFB300" stroke="#8D6E63" stroke-width="1.2"/>
              <!-- Cuerpo del tarro -->
              <path d="M144,95 C139,102 139,117 146,123 C152,126 160,126 166,123 C173,117 173,102 168,95 Z"
                    fill="#D87A2B" stroke="#6D3B14" stroke-width="2"/>
              <!-- Miel dorada derramándose en el borde -->
              <path d="M143,95 Q156,91 169,95 Q170,101 165,101 Q162,106 158,101 Q154,107 150,101 Q143,102 143,95 Z"
                    fill="#FFD54F" stroke="#F57F17" stroke-width="1.5"/>
              <!-- Boca del tarro -->
              <ellipse cx="156" cy="93.5" rx="12" ry="3.5" fill="#FFE082" stroke="#8D4E1F" stroke-width="1.6"/>
              <!-- Corazoncito en la etiqueta -->
              <path d="M156,116 C151,112 149,108 152,106 C154,105 156,107 156,108 C156,107 158,105 160,106 C163,108 161,112 156,116 Z"
                    fill="#FFCDD2" stroke="#C62828" stroke-width="1.2"/>
            </g>
          ` : handAcc === 'hand-sunflower-wand' ? `
            <!-- Varita de Girasol Sonoro con Notas Musicales -->
            <g class="ava-acc-wand">
              <!-- Tallo verde con hojita -->
              <path d="M142,126 L156,78" stroke="#388E3C" stroke-width="4" stroke-linecap="round"/>
              <path d="M148,108 Q160,106 158,115 Q150,116 148,108 Z" fill="#66BB6A" stroke="#2E7D32" stroke-width="1.4"/>
              <!-- Pétalos radiantes del girasol -->
              <g transform="translate(156, 76)">
                <ellipse cx="0" cy="-12" rx="4.2" ry="7" fill="#FFD54F" stroke="#F57F17" stroke-width="1.2"/>
                <ellipse cx="0" cy="12" rx="4.2" ry="7" fill="#FFD54F" stroke="#F57F17" stroke-width="1.2"/>
                <ellipse cx="-12" cy="0" rx="7" ry="4.2" fill="#FFD54F" stroke="#F57F17" stroke-width="1.2"/>
                <ellipse cx="12" cy="0" rx="7" ry="4.2" fill="#FFD54F" stroke="#F57F17" stroke-width="1.2"/>
                <ellipse cx="-8.5" cy="-8.5" rx="4.5" ry="6.5" transform="rotate(-45 -8.5 -8.5)" fill="#FFCA28" stroke="#F57F17" stroke-width="1.2"/>
                <ellipse cx="8.5" cy="-8.5" rx="4.5" ry="6.5" transform="rotate(45 8.5 -8.5)" fill="#FFCA28" stroke="#F57F17" stroke-width="1.2"/>
                <ellipse cx="-8.5" cy="8.5" rx="4.5" ry="6.5" transform="rotate(45 -8.5 8.5)" fill="#FFCA28" stroke="#F57F17" stroke-width="1.2"/>
                <ellipse cx="8.5" cy="8.5" rx="4.5" ry="6.5" transform="rotate(-45 8.5 8.5)" fill="#FFCA28" stroke="#F57F17" stroke-width="1.2"/>
                <circle cx="0" cy="0" r="7.5" fill="#5D4037" stroke="#3E2723" stroke-width="1.5"/>
                <circle cx="-2" cy="-2" r="1.4" fill="#FFE082"/>
                <circle cx="2.5" cy="1" r="1.2" fill="#FFE082"/>
              </g>
              <!-- Nota musical flotante -->
              <circle cx="169" cy="56" r="2.8" fill="#26A69A"/>
              <path d="M171.5,56 L171.5,47 L176,49" fill="none" stroke="#26A69A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
          ` : ''}
        </g>

        <!-- CAPA 7: CABEZA PELUDITA Y ROSTRO EXPRESIVO PEDIÁTRICO -->
        <g class="ava-layer-head">
          <!-- Mechoncitos suaves en mejillas + Silueta de Cabeza -->
          <path d="M55,72 L51,70 L54,75 L50,77 L55,79 Z" fill="#FFC107"/>
          <path d="M125,72 L129,70 L126,75 L130,77 L125,79 Z" fill="#FFC107"/>
          <ellipse cx="90" cy="74" rx="35.5" ry="29.5" fill="url(#${uid}-headGrad)" stroke="#F59E0B" stroke-width="2.2"/>

          <!-- Copete peludito chocolate en la frente (Sello característico de Ava) -->
          <path d="M70,48 Q81,42 90,56 Q99,42 110,48 Q101,43 90,44 Q79,43 70,48 Z" fill="#3E2723"/>

          <!-- Mejillas sonrosadas -->
          <circle cx="61" cy="82" r="8.5" fill="url(#${uid}-blushGrad)"/>
          <circle cx="119" cy="82" r="8.5" fill="url(#${uid}-blushGrad)"/>

          <!-- Cejas expresivas -->
          <path d="${mood === 'listening' || mood === 'celebrate' ? 'M66,57.5 Q73,53.5 80,57.5' : 'M66,60 Q73,56.5 80,59.5'}"
                fill="none" stroke="#4E342E" stroke-width="2.4" stroke-linecap="round"/>
          <path d="${mood === 'listening' || mood === 'celebrate' ? 'M100,57.5 Q107,53.5 114,57.5' : 'M100,59.5 Q107,56.5 114,60'}"
                fill="none" stroke="#4E342E" stroke-width="2.4" stroke-linecap="round"/>

          <!-- OJOS CON IRIS ÁMBAR, PESTAÑAS Y PARPADEO -->
          ${mood === 'celebrate' ? `
            <path d="M65,73 Q73,63 81,73" fill="none" stroke="#2A1810" stroke-width="3.4" stroke-linecap="round"/>
            <path d="M99,73 Q107,63 115,73" fill="none" stroke="#2A1810" stroke-width="3.4" stroke-linecap="round"/>
          ` : `
            <g class="ava-eyes ${mood === 'listening' ? 'ava-eyes-listening' : ''}">
              <!-- Pestañitas exteriores -->
              <path d="M65.5,68.5 Q62,66 62.8,63.8 M66.5,71.5 Q63,70.5 63.2,68.8" fill="none" stroke="#2A1810" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M114.5,68.5 Q118,66 117.2,63.8 M113.5,71.5 Q117,70.5 116.8,68.8" fill="none" stroke="#2A1810" stroke-width="1.8" stroke-linecap="round"/>

              <!-- Ojo Izquierdo -->
              <ellipse cx="73" cy="72.5" rx="${mood === 'listening' ? '8.6' : '8'}" ry="${mood === 'listening' ? '9.8' : '9'}" fill="#2A1810"/>
              <ellipse cx="73" cy="75.2" rx="5.8" ry="4.5" fill="#8D4E2A"/>
              <circle cx="73" cy="72" r="4.5" fill="#1E110B"/>
              <circle cx="70.2" cy="68.8" r="3" fill="#FFFFFF"/>
              <circle cx="75.8" cy="75.8" r="1.4" fill="#FFFFFF"/>

              <!-- Ojo Derecho -->
              <ellipse cx="107" cy="72.5" rx="${mood === 'listening' ? '8.6' : '8'}" ry="${mood === 'listening' ? '9.8' : '9'}" fill="#2A1810"/>
              <ellipse cx="107" cy="75.2" rx="5.8" ry="4.5" fill="#8D4E2A"/>
              <circle cx="107" cy="72" r="4.5" fill="#1E110B"/>
              <circle cx="104.2" cy="68.8" r="3" fill="#FFFFFF"/>
              <circle cx="109.8" cy="75.8" r="1.4" fill="#FFFFFF"/>

              <!-- Párpados para parpadeo autónomo -->
              <ellipse class="ava-eyelid" cx="73" cy="72.5" rx="9.2" ry="10.2" fill="#FFE082"/>
              <ellipse class="ava-eyelid" cx="107" cy="72.5" rx="9.2" ry="10.2" fill="#FFE082"/>
            </g>
          `}

          <!-- Naricita durazno tierna -->
          <ellipse cx="90" cy="79" rx="3.6" ry="2.4" fill="#FF8A65" stroke="#BF360C" stroke-width="0.9"/>
          <ellipse cx="89" cy="78.2" rx="1.3" ry="0.7" fill="rgba(255,255,255,0.7)"/>

          <!-- BOCA DINÁMICA (LIP-SYNC) -->
          <g class="ava-mouth-group">
            ${mood === 'talking' ? `
              <ellipse class="ava-mouth-speaking" cx="90" cy="88.5" rx="7.5" ry="6" fill="#7B1FA2" style="fill:#6D1B2A;" stroke="#3E2723" stroke-width="1.6"/>
              <ellipse class="ava-mouth-speaking" cx="90" cy="91" rx="4.8" ry="2.6" fill="#FF8A80"/>
            ` : mood === 'celebrate' ? `
              <path d="M79,84.5 C82,97 98,97 101,84.5 Q90,87 79,84.5 Z" fill="#6D1B2A" stroke="#3E2723" stroke-width="1.6" stroke-linejoin="round"/>
              <ellipse cx="90" cy="91.5" rx="5.8" ry="3.2" fill="#FF8A80"/>
            ` : mood === 'listening' ? `
              <ellipse cx="90" cy="88" rx="4.2" ry="4.8" fill="#4E342E" stroke="#2A1810" stroke-width="1.3"/>
            ` : `
              <!-- Sonrisa abierta cálida estilo cuento infantil -->
              <path d="M81,85 C83.5,93.5 96.5,93.5 99,85 Q90,87.5 81,85 Z" fill="#6D1B2A" stroke="#3E2723" stroke-width="1.6" stroke-linejoin="round"/>
              <ellipse cx="90" cy="90.2" rx="4.6" ry="2.2" fill="#FF8A80"/>
              <path d="M79.5,84.2 Q80.5,85.8 82,85 M100.5,84.2 Q99.5,85.8 98,85" fill="none" stroke="#3E2723" stroke-width="1.5" stroke-linecap="round"/>
            `}
          </g>
        </g>

        <!-- CAPA 8: ACCESORIOS DE ROSTRO / GAFAS TRASLÚCIDAS (NO TAPAN LA MIRADA) -->
        <g class="ava-layer-eyes-acc">
          ${eyesAcc === 'eyes-daisy-glasses' ? `
            <!-- Gafas de Margarita con Lentes Rosados Traslúcidos -->
            <g class="ava-acc-daisy-glasses">
              <!-- Pétalos blancos ojo izquierdo (73, 72.5) -->
              <g fill="#FFFFFF" stroke="#FBC02D" stroke-width="1">
                <circle cx="73" cy="58" r="3.6"/><circle cx="73" cy="87" r="3.6"/>
                <circle cx="58.5" cy="72.5" r="3.6"/><circle cx="87.5" cy="72.5" r="3.6"/>
                <circle cx="62.5" cy="62" r="3.6"/><circle cx="83.5" cy="62" r="3.6"/>
                <circle cx="62.5" cy="83" r="3.6"/><circle cx="83.5" cy="83" r="3.6"/>
              </g>
              <!-- Pétalos blancos ojo derecho (107, 72.5) -->
              <g fill="#FFFFFF" stroke="#FBC02D" stroke-width="1">
                <circle cx="107" cy="58" r="3.6"/><circle cx="107" cy="87" r="3.6"/>
                <circle cx="92.5" cy="72.5" r="3.6"/><circle cx="121.5" cy="72.5" r="3.6"/>
                <circle cx="96.5" cy="62" r="3.6"/><circle cx="117.5" cy="62" r="3.6"/>
                <circle cx="96.5" cy="83" r="3.6"/><circle cx="117.5" cy="83" r="3.6"/>
              </g>
              <!-- Cristales rosados suaves y aros dorados -->
              <circle cx="73" cy="72.5" r="11.5" fill="rgba(244, 143, 177, 0.24)" stroke="#FFB300" stroke-width="2.4"/>
              <circle cx="107" cy="72.5" r="11.5" fill="rgba(244, 143, 177, 0.24)" stroke="#FFB300" stroke-width="2.4"/>
              <path d="M84.5,72 Q90,68.5 95.5,72" fill="none" stroke="#FFB300" stroke-width="2.8" stroke-linecap="round"/>
              <path d="M66,65 L72,73 M100,65 L106,73" stroke="rgba(255,255,255,0.65)" stroke-width="2" stroke-linecap="round"/>
            </g>
          ` : eyesAcc === 'eyes-explorer-goggles' ? `
            <!-- Lentes de Explorador Botánico en Bronce y Esmeralda -->
            <g class="ava-acc-explorer-goggles">
              <path d="M55,71 L60.5,72 M119.5,72 L125,71" stroke="#00695C" stroke-width="3.5" stroke-linecap="round"/>
              <circle cx="73" cy="72.5" r="12.2" fill="rgba(79, 195, 247, 0.25)" stroke="#00897B" stroke-width="3"/>
              <circle cx="73" cy="72.5" r="12.2" fill="none" stroke="#FFD54F" stroke-width="1.3"/>
              <circle cx="107" cy="72.5" r="12.2" fill="rgba(79, 195, 247, 0.25)" stroke="#00897B" stroke-width="3"/>
              <circle cx="107" cy="72.5" r="12.2" fill="none" stroke="#FFD54F" stroke-width="1.3"/>
              <path d="M85.2,71.5 Q90,67.5 94.8,71.5" fill="none" stroke="#FFD54F" stroke-width="3" stroke-linecap="round"/>
              <path d="M66,64.5 L73,73.5 M100,64.5 L107,73.5" stroke="rgba(255,255,255,0.7)" stroke-width="2.2" stroke-linecap="round"/>
            </g>
          ` : ''}
        </g>

        <!-- CAPA 9: ANTENAS DE POMPÓN Y SOMBREROS DEL BOSQUE -->
        <g class="ava-layer-antennas ${mood === 'listening' ? 'ava-antennas-listening' : ''}">
          <!-- Antena Izquierda con Pompón Peludito -->
          <path d="M75,46 C69,28 59,21 52,21" fill="none" stroke="#3E2723" stroke-width="2.8" stroke-linecap="round"/>
          <circle cx="51" cy="21" r="6.5" fill="#FFD54F" stroke="#F57F17" stroke-width="1.6"/>
          <circle cx="49" cy="19" r="2.2" fill="#FFF9C4"/>

          <!-- Antena Derecha con Pompón Peludito -->
          <path d="M105,46 C111,28 121,21 128,21" fill="none" stroke="#3E2723" stroke-width="2.8" stroke-linecap="round"/>
          <circle cx="129" cy="21" r="6.5" fill="#FFD54F" stroke="#F57F17" stroke-width="1.6"/>
          <circle cx="127" cy="19" r="2.2" fill="#FFF9C4"/>
        </g>

        <g class="ava-layer-headwear">
          ${headAcc === 'head-floral-crown' ? `
            <!-- Corona de Flores Silvestres de la Pradera -->
            <g class="ava-acc-floral-crown">
              <!-- Guirnalda de hojas verdes -->
              <path d="M55,50 Q90,39 125,50" fill="none" stroke="#2E7D32" stroke-width="5" stroke-linecap="round"/>
              <ellipse cx="62" cy="46" rx="5.5" ry="2.8" transform="rotate(-25 62 46)" fill="#66BB6A" stroke="#1B5E20" stroke-width="1"/>
              <ellipse cx="118" cy="46" rx="5.5" ry="2.8" transform="rotate(25 118 46)" fill="#66BB6A" stroke="#1B5E20" stroke-width="1"/>
              <ellipse cx="80" cy="42" rx="5" ry="2.5" transform="rotate(-12 80 42)" fill="#81C784" stroke="#1B5E20" stroke-width="1"/>
              <ellipse cx="100" cy="42" rx="5" ry="2.5" transform="rotate(12 100 42)" fill="#81C784" stroke="#1B5E20" stroke-width="1"/>

              <!-- Flores laterales celestes -->
              <circle cx="57" cy="49" r="5" fill="#4FC3F7" stroke="#0277BD" stroke-width="1.2"/>
              <circle cx="57" cy="49" r="2" fill="#FFF176"/>
              <circle cx="123" cy="49" r="5" fill="#4FC3F7" stroke="#0277BD" stroke-width="1.2"/>
              <circle cx="123" cy="49" r="2" fill="#FFF176"/>

              <!-- Margaritas blancas intermedias -->
              <g transform="translate(72, 44)">
                <circle cx="0" cy="-4.2" r="3" fill="#FFFFFF"/><circle cx="0" cy="4.2" r="3" fill="#FFFFFF"/>
                <circle cx="-4.2" cy="0" r="3" fill="#FFFFFF"/><circle cx="4.2" cy="0" r="3" fill="#FFFFFF"/>
                <circle cx="0" cy="0" r="3.2" fill="#FFB300"/>
              </g>
              <g transform="translate(108, 44)">
                <circle cx="0" cy="-4.2" r="3" fill="#FFFFFF"/><circle cx="0" cy="4.2" r="3" fill="#FFFFFF"/>
                <circle cx="-4.2" cy="0" r="3" fill="#FFFFFF"/><circle cx="4.2" cy="0" r="3" fill="#FFFFFF"/>
                <circle cx="0" cy="0" r="3.2" fill="#FFB300"/>
              </g>

              <!-- Flor Rosa Central Principal -->
              <g transform="translate(90, 41)">
                <circle cx="0" cy="-5.5" r="4.2" fill="#F48FB1" stroke="#C2185B" stroke-width="1"/>
                <circle cx="5.2" cy="-1.8" r="4.2" fill="#F48FB1" stroke="#C2185B" stroke-width="1"/>
                <circle cx="3.2" cy="4.6" r="4.2" fill="#F48FB1" stroke="#C2185B" stroke-width="1"/>
                <circle cx="-3.2" cy="4.6" r="4.2" fill="#F48FB1" stroke="#C2185B" stroke-width="1"/>
                <circle cx="-5.2" cy="-1.8" r="4.2" fill="#F48FB1" stroke="#C2185B" stroke-width="1"/>
                <circle cx="0" cy="0" r="4" fill="#FFD54F" stroke="#F57F17" stroke-width="1"/>
              </g>
            </g>
          ` : headAcc === 'head-acorn-beret' ? `
            <!-- Boina de Bellota Exploradora con Hoja de Roble -->
            <g class="ava-acc-acorn-beret">
              <!-- Tallo de bellota -->
              <path d="M90,23 Q92,14 97,13" fill="none" stroke="#4E2F18" stroke-width="4" stroke-linecap="round"/>
              <!-- Cúpula tejida de bellota -->
              <path d="M53,48 C54,21 126,21 127,48 Q90,39 53,48 Z"
                    fill="url(#${uid}-acornGrad)" stroke="#3E2723" stroke-width="2"/>
              <!-- Textura de bellota -->
              <path d="M68,29 L78,44 M84,24 L96,43 M101,25 L112,44 M112,29 L100,43 M96,24 L82,43 M78,26 L66,45"
                    stroke="rgba(255, 224, 178, 0.35)" stroke-width="1.4" stroke-linecap="round"/>
              <!-- Banda inferior oscura -->
              <path d="M51,48 Q90,38 129,48 Q128,53 122,52 Q90,44 58,52 Q52,53 51,48 Z"
                    fill="#4E2F18" stroke="#2A1810" stroke-width="1.5"/>
              <!-- Hojita verde brillante a un lado -->
              <path d="M106,33 C118,24 131,28 127,39 C121,45 111,41 106,33 Z"
                    fill="#66BB6A" stroke="#1B5E20" stroke-width="1.6"/>
              <path d="M107,33 L123,35" stroke="#1B5E20" stroke-width="1.2" stroke-linecap="round"/>
            </g>
          ` : headAcc === 'head-mushroom-hat' ? `
            <!-- Sombrero Mágico de Setita Roja con Lunares Crema -->
            <g class="ava-acc-mushroom-hat">
              <!-- Base interior crema laminada -->
              <ellipse cx="90" cy="47" rx="48" ry="8" fill="#FFF8E1" stroke="#BCAAA4" stroke-width="1.6"/>
              <!-- Copa roja de setita de cuento -->
              <path d="M41,47 C43,10 137,10 139,47 C115,40 65,40 41,47 Z"
                    fill="url(#${uid}-mushroomGrad)" stroke="#8E0000" stroke-width="2.2" stroke-linejoin="round"/>
              <!-- Lunares crema grandes y visibles -->
              <circle cx="90" cy="24" r="7.5" fill="#FFFDE7"/>
              <circle cx="65" cy="31" r="6" fill="#FFFDE7"/>
              <circle cx="115" cy="31" r="6" fill="#FFFDE7"/>
              <ellipse cx="50" cy="40" rx="4.5" ry="3.2" transform="rotate(-20 50 40)" fill="#FFFDE7"/>
              <ellipse cx="130" cy="40" rx="4.5" ry="3.2" transform="rotate(20 130 40)" fill="#FFFDE7"/>
            </g>
          ` : ''}

          ${mood === 'celebrate' ? `
            <!-- Destellos Dorados de Celebración -->
            <g class="ava-celebrate-sparkles">
              <path d="M26,42 L29,33 L32,42 L41,45 L32,48 L29,57 L26,48 L17,45 Z" fill="#FFD54F"/>
              <path d="M154,42 L157,33 L160,42 L169,45 L160,48 L157,57 L154,48 L145,45 Z" fill="#FFD54F"/>
              <circle cx="90" cy="9" r="3.5" fill="#FFF59D"/>
            </g>
          ` : ''}
        </g>
      </svg>
    `;
  }

  /* =========================================================================
     ICONOS VECTORIALES 1:1 PARA TARJETAS DEL ROPERO Y PESTAÑAS (CERO EMOJIS)
     ========================================================================= */
  generateSlotTabIconSvg(slotId) {
    switch (slotId) {
      case 'head':
        return `<svg viewBox="0 0 28 28" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19c1.2-9.5 16.8-9.5 18 0" fill="currentColor" fill-opacity="0.16"/><ellipse cx="14" cy="19" rx="10.5" ry="3"/><circle cx="10.5" cy="14.2" r="1.5" fill="currentColor"/><circle cx="16.8" cy="14.8" r="1.3" fill="currentColor"/></svg>`;
      case 'eyes':
        return `<svg viewBox="0 0 28 28" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="8.2" cy="14.5" r="4.8" fill="currentColor" fill-opacity="0.16"/><circle cx="19.8" cy="14.5" r="4.8" fill="currentColor" fill-opacity="0.16"/><path d="M13 14Q14 12.2 15 14"/><path d="M2 13.5L3.5 14M26 13.5L24.5 14"/></svg>`;
      case 'wings':
        return `<svg viewBox="0 0 28 28" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round" aria-hidden="true"><path d="M14 15C9 6.5 2.2 8 3.5 13.8c1.2 4.5 6 3.5 10.5 1.2z" fill="currentColor" fill-opacity="0.18"/><path d="M14 15c5-8.5 11.8-7 10.5-1.2-1.2 4.5-6 3.5-10.5 1.2z" fill="currentColor" fill-opacity="0.18"/><path d="M14 15c-3.5 2.5-8 6-5.8 9.2 2.2 2.4 4.6-2.2 5.8-9.2z"/><path d="M14 15c3.5 2.5 8 6 5.8 9.2-2.2 2.4-4.6-2.2-5.8-9.2z"/></svg>`;
      case 'neck':
        return `<svg viewBox="0 0 28 28" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round" aria-hidden="true"><path d="M8 5.5c2.5 2.4 9.5 2.4 12 0l4.5 16.5c-5.8 2.4-15.2 2.4-21 0L8 5.5z" fill="currentColor" fill-opacity="0.16"/><circle cx="14" cy="9.5" r="2" fill="currentColor"/></svg>`;
      case 'hand':
        return `<svg viewBox="0 0 28 28" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6.5 22.5L16.5 12.5"/><circle cx="18.5" cy="9.5" r="5.2" fill="currentColor" fill-opacity="0.18"/><circle cx="18.5" cy="9.5" r="1.8" fill="currentColor"/></svg>`;
      default:
        return `<svg viewBox="0 0 28 28" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><polygon points="14 2.5 17.5 9.8 25.5 10.8 19.6 16.3 21.1 24.3 14 20.4 6.9 24.3 8.4 16.3 2.5 10.8 10.5 9.8 14 2.5" fill="currentColor" fill-opacity="0.18"/></svg>`;
    }
  }

  generateCollectibleIconSvg(itemId) {
    const uid = `ico${++this._uidCounter}`;
    switch (itemId) {
      case 'head-floral-crown':
        return `
          <svg viewBox="0 0 80 80" width="62" height="62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <ellipse cx="40" cy="46" rx="28" ry="12" fill="none" stroke="#2E7D32" stroke-width="6"/>
            <ellipse cx="18" cy="42" rx="6" ry="3" transform="rotate(-30 18 42)" fill="#66BB6A"/>
            <ellipse cx="62" cy="42" rx="6" ry="3" transform="rotate(30 62 42)" fill="#66BB6A"/>
            <circle cx="17" cy="47" r="6" fill="#4FC3F7" stroke="#0277BD" stroke-width="1.4"/><circle cx="17" cy="47" r="2.3" fill="#FFF176"/>
            <circle cx="63" cy="47" r="6" fill="#4FC3F7" stroke="#0277BD" stroke-width="1.4"/><circle cx="63" cy="47" r="2.3" fill="#FFF176"/>
            <circle cx="27" cy="39" r="6.5" fill="#FFFFFF" stroke="#CFD8DC" stroke-width="1.2"/><circle cx="27" cy="39" r="3" fill="#FFB300"/>
            <circle cx="53" cy="39" r="6.5" fill="#FFFFFF" stroke="#CFD8DC" stroke-width="1.2"/><circle cx="53" cy="39" r="3" fill="#FFB300"/>
            <g transform="translate(40,35)">
              <circle cx="0" cy="-6" r="5" fill="#F48FB1" stroke="#C2185B" stroke-width="1.2"/>
              <circle cx="5.8" cy="-1.8" r="5" fill="#F48FB1" stroke="#C2185B" stroke-width="1.2"/>
              <circle cx="3.6" cy="5" r="5" fill="#F48FB1" stroke="#C2185B" stroke-width="1.2"/>
              <circle cx="-3.6" cy="5" r="5" fill="#F48FB1" stroke="#C2185B" stroke-width="1.2"/>
              <circle cx="-5.8" cy="-1.8" r="5" fill="#F48FB1" stroke="#C2185B" stroke-width="1.2"/>
              <circle cx="0" cy="0" r="4.5" fill="#FFD54F" stroke="#F57F17" stroke-width="1.2"/>
            </g>
          </svg>`;

      case 'head-acorn-beret':
        return `
          <svg viewBox="0 0 80 80" width="62" height="62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M40,21 Q42,11 48,10" fill="none" stroke="#4E2F18" stroke-width="4.5" stroke-linecap="round"/>
            <path d="M12,53 C14,21 66,21 68,53 Q40,44 12,53 Z" fill="#8D5524" stroke="#3E2723" stroke-width="2.4"/>
            <path d="M25,29 L36,48 M40,24 L52,47 M54,29 L40,47 M38,24 L24,48" stroke="rgba(255,224,178,0.42)" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M10,53 Q40,43 70,53 Q69,60 62,59 Q40,50 18,59 Q11,60 10,53 Z" fill="#4E2F18" stroke="#2A1810" stroke-width="1.8"/>
            <path d="M50,34 C62,23 75,28 70,40 C64,47 54,42 50,34 Z" fill="#66BB6A" stroke="#1B5E20" stroke-width="1.8"/>
          </svg>`;

      case 'head-mushroom-hat':
        return `
          <svg viewBox="0 0 80 80" width="62" height="62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <ellipse cx="40" cy="54" rx="33" ry="8" fill="#FFF8E1" stroke="#A1887F" stroke-width="2"/>
            <path d="M7,53 C10,14 70,14 73,53 C55,46 25,46 7,53 Z" fill="#E53935" stroke="#8E0000" stroke-width="2.4"/>
            <circle cx="40" cy="29" r="7" fill="#FFFDE7"/>
            <circle cx="22" cy="38" r="5.5" fill="#FFFDE7"/>
            <circle cx="58" cy="38" r="5.5" fill="#FFFDE7"/>
          </svg>`;

      case 'eyes-daisy-glasses':
        return `
          <svg viewBox="0 0 80 80" width="62" height="62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <g fill="#FFFFFF" stroke="#FBC02D" stroke-width="1.2">
              <circle cx="24" cy="25" r="4"/><circle cx="24" cy="55" r="4"/><circle cx="9" cy="40" r="4"/><circle cx="39" cy="40" r="4"/>
              <circle cx="13" cy="29" r="4"/><circle cx="35" cy="29" r="4"/><circle cx="13" cy="51" r="4"/><circle cx="35" cy="51" r="4"/>
              <circle cx="56" cy="25" r="4"/><circle cx="56" cy="55" r="4"/><circle cx="41" cy="40" r="4"/><circle cx="71" cy="40" r="4"/>
              <circle cx="45" cy="29" r="4"/><circle cx="67" cy="29" r="4"/><circle cx="45" cy="51" r="4"/><circle cx="67" cy="51" r="4"/>
            </g>
            <circle cx="24" cy="40" r="12" fill="#F8BBD0" fill-opacity="0.7" stroke="#FFB300" stroke-width="2.8"/>
            <circle cx="56" cy="40" r="12" fill="#F8BBD0" fill-opacity="0.7" stroke="#FFB300" stroke-width="2.8"/>
            <path d="M36,39 Q40,35 44,39" fill="none" stroke="#FFB300" stroke-width="3.2" stroke-linecap="round"/>
            <path d="M18,34 L25,44 M50,34 L57,44" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/>
          </svg>`;

      case 'eyes-explorer-goggles':
        return `
          <svg viewBox="0 0 80 80" width="62" height="62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4,39 L12,40 M68,40 L76,39" stroke="#00695C" stroke-width="4" stroke-linecap="round"/>
            <circle cx="24" cy="40" r="13.5" fill="#81D4FA" fill-opacity="0.65" stroke="#00897B" stroke-width="3.5"/>
            <circle cx="56" cy="40" r="13.5" fill="#81D4FA" fill-opacity="0.65" stroke="#00897B" stroke-width="3.5"/>
            <circle cx="24" cy="40" r="13.5" fill="none" stroke="#FFD54F" stroke-width="1.4"/>
            <circle cx="56" cy="40" r="13.5" fill="none" stroke="#FFD54F" stroke-width="1.4"/>
            <path d="M37.5,39 Q40,34 42.5,39" fill="none" stroke="#FFD54F" stroke-width="3.5" stroke-linecap="round"/>
            <path d="M18,33 L26,44 M50,33 L58,44" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
          </svg>`;

      case 'wings-monarch':
        return `
          <svg viewBox="0 0 80 80" width="62" height="62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="${uid}-m" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FFE082"/><stop offset="50%" stop-color="#FB8C00"/><stop offset="100%" stop-color="#E65100"/>
              </linearGradient>
            </defs>
            <path d="M38,42 C24,14 4,16 7,37 C9,47 24,47 38,44 Z" fill="url(#${uid}-m)" stroke="#2A1810" stroke-width="2.6"/>
            <path d="M38,44 C22,47 12,56 17,66 C22,72 34,62 38,49 Z" fill="url(#${uid}-m)" stroke="#2A1810" stroke-width="2.4"/>
            <path d="M42,42 C56,14 76,16 73,37 C71,47 56,47 42,44 Z" fill="url(#${uid}-m)" stroke="#2A1810" stroke-width="2.6"/>
            <path d="M42,44 C58,47 68,56 63,66 C58,72 46,62 42,49 Z" fill="url(#${uid}-m)" stroke="#2A1810" stroke-width="2.4"/>
            <circle cx="13" cy="28" r="2" fill="#FFF"/><circle cx="67" cy="28" r="2" fill="#FFF"/>
            <circle cx="13" cy="37" r="2" fill="#FFF"/><circle cx="67" cy="37" r="2" fill="#FFF"/>
            <rect x="37.5" y="28" width="5" height="30" rx="2.5" fill="#3E2723"/>
          </svg>`;

      case 'wings-fairy-dew':
        return `
          <svg viewBox="0 0 80 80" width="62" height="62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="${uid}-f" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#80DEEA"/><stop offset="50%" stop-color="#CE93D8"/><stop offset="100%" stop-color="#F48FB1"/>
              </linearGradient>
            </defs>
            <path d="M39,42 C26,11 5,13 8,35 C10,46 25,47 39,44 Z" fill="url(#${uid}-f)" stroke="#8E24AA" stroke-width="2.2"/>
            <path d="M39,44 C24,47 13,57 18,67 C23,73 34,63 39,49 Z" fill="url(#${uid}-f)" stroke="#8E24AA" stroke-width="2"/>
            <path d="M41,42 C54,11 75,13 72,35 C70,46 55,47 41,44 Z" fill="url(#${uid}-f)" stroke="#8E24AA" stroke-width="2.2"/>
            <path d="M41,44 C56,47 67,57 62,67 C57,73 46,63 41,49 Z" fill="url(#${uid}-f)" stroke="#8E24AA" stroke-width="2"/>
            <circle cx="40" cy="14" r="3" fill="#FFD54F"/>
            <circle cx="14" cy="24" r="2" fill="#FFFFFF"/><circle cx="66" cy="24" r="2" fill="#FFFFFF"/>
          </svg>`;

      case 'neck-headphones':
        return `
          <svg viewBox="0 0 80 80" width="62" height="62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M18,46 C18,18 62,18 62,46" fill="none" stroke="#26A69A" stroke-width="6.5" stroke-linecap="round"/>
            <rect x="10" y="38" width="14" height="24" rx="7" fill="#FFF8E1" stroke="#00796B" stroke-width="2.4"/>
            <rect x="13" y="42" width="8" height="16" rx="4" fill="#4DB6AC"/>
            <rect x="56" y="38" width="14" height="24" rx="7" fill="#FFF8E1" stroke="#00796B" stroke-width="2.4"/>
            <rect x="59" y="42" width="8" height="16" rx="4" fill="#4DB6AC"/>
            <circle cx="40" cy="44" r="3.2" fill="#FFB300"/>
            <path d="M42.8,44 L42.8,33 L49,35.5" fill="none" stroke="#FFB300" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`;

      case 'neck-leaf-cape':
        return `
          <svg viewBox="0 0 80 80" width="62" height="62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M25,18 C13,34 11,52 15,65 C28,69 34,63 40,67 C46,63 52,69 65,65 C69,52 67,34 55,18 Z"
                  fill="#2E7D32" stroke="#1B5E20" stroke-width="2.4"/>
            <path d="M40,24 L40,63 M28,28 L22,58 M52,28 L58,58" stroke="#A5D6A7" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M24,18 Q32,27 40,20 Q48,27 56,18" fill="#66BB6A" stroke="#1B5E20" stroke-width="1.8"/>
            <circle cx="40" cy="21" r="5.5" fill="#FFD54F" stroke="#E65100" stroke-width="1.8"/>
          </svg>`;

      case 'neck-starlight-cape':
        return `
          <svg viewBox="0 0 80 80" width="62" height="62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M25,18 C13,34 11,52 15,65 C28,69 34,63 40,67 C46,63 52,69 65,65 C69,52 67,34 55,18 Z"
                  fill="#512DA8" stroke="#FFD54F" stroke-width="2.5"/>
            <polygon points="40,14 45,21 40,28 35,21" fill="#FFF176" stroke="#F57F17" stroke-width="1.6"/>
            <circle cx="28" cy="45" r="2.5" fill="#FFF59D"/>
            <circle cx="52" cy="42" r="2.5" fill="#FFF59D"/>
            <circle cx="40" cy="54" r="3" fill="#FFD54F"/>
          </svg>`;

      case 'hand-honey-jar':
        return `
          <svg viewBox="0 0 80 80" width="62" height="62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M46,24 L57,10" stroke="#8D6E63" stroke-width="4" stroke-linecap="round"/>
            <ellipse cx="58" cy="10" rx="5.5" ry="4" transform="rotate(-30 58 10)" fill="#FFB300" stroke="#6D4C41" stroke-width="1.5"/>
            <path d="M21,28 C14,39 15,59 25,66 C34,70 46,70 55,66 C65,59 66,39 59,28 Z" fill="#D87A2B" stroke="#6D3B14" stroke-width="2.4"/>
            <path d="M20,28 Q40,22 60,28 Q61,36 55,36 Q50,43 45,36 Q38,45 32,36 Q20,37 20,28 Z" fill="#FFD54F" stroke="#F57F17" stroke-width="1.8"/>
            <ellipse cx="40" cy="26" rx="19" ry="5" fill="#FFE082" stroke="#8D4E1F" stroke-width="2"/>
            <path d="M40,57 C33,51 30,46 34,43 C37,41 40,44 40,46 C40,44 43,41 46,43 C50,46 47,51 40,57 Z" fill="#FFCDD2" stroke="#C62828" stroke-width="1.5"/>
          </svg>`;

      case 'hand-sunflower-wand':
        return `
          <svg viewBox="0 0 80 80" width="62" height="62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M22,68 L44,32" stroke="#388E3C" stroke-width="5" stroke-linecap="round"/>
            <path d="M31,54 Q45,52 42,62 Q33,63 31,54 Z" fill="#66BB6A" stroke="#1B5E20" stroke-width="1.5"/>
            <g transform="translate(46, 29)">
              <ellipse cx="0" cy="-14" rx="5" ry="8" fill="#FFD54F" stroke="#F57F17" stroke-width="1.3"/>
              <ellipse cx="0" cy="14" rx="5" ry="8" fill="#FFD54F" stroke="#F57F17" stroke-width="1.3"/>
              <ellipse cx="-14" cy="0" rx="8" ry="5" fill="#FFD54F" stroke="#F57F17" stroke-width="1.3"/>
              <ellipse cx="14" cy="0" rx="8" ry="5" fill="#FFD54F" stroke="#F57F17" stroke-width="1.3"/>
              <ellipse cx="-10" cy="-10" rx="5" ry="7.5" transform="rotate(-45 -10 -10)" fill="#FFCA28" stroke="#F57F17" stroke-width="1.3"/>
              <ellipse cx="10" cy="-10" rx="5" ry="7.5" transform="rotate(45 10 -10)" fill="#FFCA28" stroke="#F57F17" stroke-width="1.3"/>
              <ellipse cx="-10" cy="10" rx="5" ry="7.5" transform="rotate(45 -10 10)" fill="#FFCA28" stroke="#F57F17" stroke-width="1.3"/>
              <ellipse cx="10" cy="10" rx="5" ry="7.5" transform="rotate(-45 10 10)" fill="#FFCA28" stroke="#F57F17" stroke-width="1.3"/>
              <circle cx="0" cy="0" r="9" fill="#5D4037" stroke="#3E2723" stroke-width="1.6"/>
              <circle cx="-2.5" cy="-2" r="1.6" fill="#FFE082"/>
              <circle cx="3" cy="1.5" r="1.4" fill="#FFE082"/>
            </g>
          </svg>`;

      default:
        return `<svg viewBox="0 0 80 80" width="62" height="62"><circle cx="40" cy="40" r="24" fill="#FFE082"/></svg>`;
    }
  }
}

window.AvaVectorAvatarEngine = AvaVectorAvatarEngine;
