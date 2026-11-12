/**
 * @fileoverview Motor de Renderizado Animado 2D de Espejo Mágico (Praxia Bucofacial) - Bosque Sonoro
 * @description Silueta anatómica infantil proporcionada fiel al perfil humano natural (cráneo occipital
 *              esférico, frente erguida, puente nasal definido, mentón compacto y cuello continuo),
 *              corte sagital limpio con oclusión realista de encías/dientes/labios y escalado HiDPI (4:3).
 */

class PraxiaCanvasEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.logicalWidth = 360;
    this.logicalHeight = 270;

    this.currentPhoneme = 'r';
    this.isPlaying = true;
    this.speedMultiplier = 1.0; // 1.0 normal, 0.5 lento (🐢)
    this.animFrame = null;
    this.startTime = performance.now();

    // Partículas de aire guiadas estrictamente por el lumen faríngeo-oral
    this.particles = [];
    for (let i = 0; i < 16; i++) {
      this.particles.push({
        progress: i / 16,
        lane: ((i % 4) - 1.5) * 0.36,
        speed: 0.34 + (i % 4) * 0.045,
        size: 2.1 + (i % 3) * 0.6
      });
    }

    this.init();
  }

  init() {
    this.syncHiDPISize();
    this.startAnimation();
  }

  syncHiDPISize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const targetW = Math.round(this.logicalWidth * dpr);
    const targetH = Math.round(this.logicalHeight * dpr);
    if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
      this.canvas.width = targetW;
      this.canvas.height = targetH;
    }
    this.dpr = dpr;
  }

  setPhoneme(phonemeKey) {
    const validKeys = ['r', 'rr', 's', 'l', 'k', 'g', 'p', 'b', 't', 'd', 'f'];
    const normalized = String(phonemeKey || 'r').toLowerCase();
    this.currentPhoneme = validKeys.includes(normalized) ? normalized : 'r';
    this.startTime = performance.now();
  }

  setSpeed(speed) {
    this.speedMultiplier = speed;
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.startTime = performance.now();
      this.startAnimation();
    } else if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
    return this.isPlaying;
  }

  startAnimation() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    const loop = (now) => {
      this.render(now);
      if (this.isPlaying) {
        this.animFrame = requestAnimationFrame(loop);
      }
    };
    this.animFrame = requestAnimationFrame(loop);
  }

  getPalette() {
    const isCvi = typeof document !== 'undefined' && document.body?.getAttribute('data-theme') === 'cvi';
    if (isCvi) {
      return {
        isCvi: true,
        bgTop: '#0F172A',
        bgBottom: '#1E293B',
        leafFill: 'rgba(253, 224, 71, 0.14)',
        leafStroke: 'rgba(253, 224, 71, 0.25)',
        mirrorGlow: 'rgba(56, 189, 248, 0.16)',
        skinBase: '#FDE047',
        skinShadow: '#EAB308',
        skinStroke: '#FFFFFF',
        hairBase: '#111827',
        hairHighlight: '#374151',
        tunic: '#38BDF8',
        eyeWhite: '#FFFFFF',
        eyeIris: '#0F172A',
        cheek: 'rgba(251, 113, 133, 0.45)',
        oralDeep: '#090D16',
        oralMid: '#1E1B4B',
        palateLight: '#E2E8F0',
        palateDark: '#94A3B8',
        velumTop: '#FB7185',
        velumBot: '#F43F5E',
        gumFill: '#FB7185',
        toothFill: '#FFFFFF',
        toothEdge: '#94A3B8',
        tongueTop: '#FF4D6D',
        tongueMid: '#E11D48',
        tongueDeep: '#9F1239',
        tongueStroke: '#FFFFFF',
        tongueGroove: 'rgba(255, 255, 255, 0.45)',
        lipFill: '#F43F5E',
        lipStroke: '#FFFFFF',
        airColor: '#38BDF8',
        targetGold: '#FACC15',
        targetBlue: '#38BDF8',
        targetMint: '#34D399',
        targetPink: '#F472B6'
      };
    }

    return {
      isCvi: false,
      bgTop: '#F5FCEB',
      bgBottom: '#E4F3D5',
      leafFill: 'rgba(124, 179, 66, 0.18)',
      leafStroke: 'rgba(85, 139, 47, 0.28)',
      mirrorGlow: 'rgba(255, 236, 179, 0.35)',
      skinBase: '#FFE2CB',
      skinShadow: '#F4C39F',
      skinStroke: '#C58B68',
      hairBase: '#6D4C3D',
      hairHighlight: '#8D6E63',
      tunic: '#66BB6A',
      eyeWhite: '#FFFFFF',
      eyeIris: '#3E2723',
      cheek: 'rgba(255, 128, 128, 0.3)',
      oralDeep: '#330A14',
      oralMid: '#641A2C',
      palateLight: '#FFF6EE',
      palateDark: '#E5D2C3',
      velumTop: '#F08398',
      velumBot: '#DE6077',
      gumFill: '#F28BA8',
      toothFill: '#FFFDF8',
      toothEdge: '#D7CCC8',
      tongueTop: '#FF7D8C',
      tongueMid: '#EC4B5C',
      tongueDeep: '#C0293B',
      tongueStroke: '#9A1F2E',
      tongueGroove: 'rgba(255, 226, 228, 0.55)',
      lipFill: '#E97782',
      lipStroke: '#BC535E',
      airColor: '#29B6F6',
      targetGold: '#FFB300',
      targetBlue: '#29B6F6',
      targetMint: '#43A047',
      targetPink: '#EC407A'
    };
  }

  /**
   * Cinemática calibrada al nuevo perfil proporcionado (cráneo vertical y boca centrada).
   * Alvéolo detrás del incisivo superior: ~(221, 136).
   * Velo del paladar posterior: ~(171, 132).
   */
  computeArticulationState(elapsedSec) {
    const p = this.currentPhoneme;
    const t = elapsedSec * 3.1;

    const state = {
      tipX: 214,
      tipY: 162,
      midX: 189,
      midY: 153,
      backX: 166,
      backY: 161,
      jawDrop: 7,
      lipClose: 0,
      lipSmile: 0,
      velumDrop: 0,
      airIntensity: 0.45,
      airMode: 'oral',
      isContacting: false,
      burstStrength: 0
    };

    if (p === 'r') {
      const cycle = (t * 0.65) % (Math.PI * 2);
      const liftWave = Math.max(0, Math.sin(cycle));
      const tapPulse = Math.pow(liftWave, 2.6);

      state.jawDrop = 7.5;
      state.tipX = 214 + tapPulse * 6;   // -> 220
      state.tipY = 162 - tapPulse * 24;  // -> 138
      state.midX = 189;
      state.midY = 153 - tapPulse * 10;
      state.backX = 166;
      state.backY = 163;
      state.isContacting = tapPulse > 0.72;
      state.burstStrength = tapPulse > 0.78 ? 1 : 0;
      state.airIntensity = state.isContacting ? 0.3 : 0.9;
      state.airMode = state.burstStrength ? 'burst' : 'oral';
    } else if (p === 'rr') {
      const vib = Math.sin(t * 7.8);
      state.jawDrop = 7;
      state.tipX = 220 + vib * 1.8;
      state.tipY = 139 + vib * 4.0;
      state.midX = 189;
      state.midY = 148 - vib * 1.8;
      state.backX = 166;
      state.backY = 161;
      state.isContacting = vib < 0.2;
      state.burstStrength = 1;
      state.airIntensity = 1.05;
      state.airMode = 'stream';
    } else if (p === 's') {
      const breath = 0.5 + 0.5 * Math.sin(t * 1.15);
      state.jawDrop = 2.0;
      state.lipSmile = 0.85;
      state.tipX = 219;
      state.tipY = 154 + breath * 1.1;
      state.midX = 192;
      state.midY = 135;
      state.backX = 168;
      state.backY = 154;
      state.airIntensity = 1.1;
      state.airMode = 'stream';
    } else if (p === 'l') {
      const sway = Math.sin(t * 0.9);
      state.jawDrop = 8;
      state.tipX = 220;
      state.tipY = 137 + sway * 1.0;
      state.midX = 189;
      state.midY = 153 + sway * 1.8;
      state.backX = 166;
      state.backY = 163;
      state.isContacting = true;
      state.airIntensity = 0.85;
      state.airMode = 'lateral';
    } else if (p === 'k' || p === 'g') {
      const cycle = (t * 0.65) % (Math.PI * 2);
      const lift = Math.max(0, Math.sin(cycle));
      const hold = Math.min(1, lift * 1.55);
      const isReleasing = cycle > 2.0 && cycle < 2.85;

      state.jawDrop = 10;
      state.tipX = 212;
      state.tipY = 169;
      state.midX = 186 - hold * 10;
      state.midY = 153 - hold * 15;
      state.backX = 167 + hold * 4;
      state.backY = 159 - hold * 26; // Sube hacia (171, 133) velo palatino
      state.velumDrop = hold * 0.3;
      state.isContacting = hold > 0.72;
      state.burstStrength = isReleasing ? 1.0 : 0;
      state.airIntensity = isReleasing ? 1.2 : (state.isContacting ? 0.18 : 0.4);
      state.airMode = isReleasing ? 'burst' : (state.isContacting ? 'pressurized' : 'oral');
    } else if (p === 'p' || p === 'b') {
      const cycle = (t * 0.7) % (Math.PI * 2);
      const seal = Math.max(0, Math.sin(cycle));
      const compressed = Math.min(1, seal * 1.45);
      const isBurst = cycle > 2.15 && cycle < 3.05;

      state.jawDrop = 1.5 + (1 - compressed) * 8;
      state.lipClose = compressed;
      state.tipX = 212;
      state.tipY = 166;
      state.midX = 188;
      state.midY = 156;
      state.backX = 166;
      state.backY = 164;
      state.isContacting = compressed > 0.75;
      state.burstStrength = isBurst ? 1.0 : 0;
      state.airIntensity = isBurst ? 1.25 : (state.isContacting ? 0.25 : 0.4);
      state.airMode = isBurst ? 'burst' : (state.isContacting ? 'pressurized' : 'oral');
    } else if (p === 't' || p === 'd') {
      const cycle = (t * 0.72) % (Math.PI * 2);
      const tap = Math.min(1, Math.max(0, Math.sin(cycle)) * 1.45);
      const isBurst = cycle > 2.1 && cycle < 2.95;

      state.jawDrop = 5.5;
      state.tipX = 223;
      state.tipY = 160 - tap * 22;
      state.midX = 189;
      state.midY = 151 - tap * 7;
      state.backX = 166;
      state.backY = 162;
      state.isContacting = tap > 0.75;
      state.burstStrength = isBurst ? 1 : 0;
      state.airIntensity = isBurst ? 1.15 : 0.35;
      state.airMode = isBurst ? 'burst' : 'oral';
    } else if (p === 'f') {
      state.jawDrop = 4.0;
      state.lipClose = 0.45;
      state.tipX = 212;
      state.tipY = 163;
      state.airIntensity = 0.95;
      state.airMode = 'stream';
    }

    return state;
  }

  render(now) {
    if (!this.ctx || !this.canvas) return;
    this.syncHiDPISize();

    const ctx = this.ctx;
    const W = this.logicalWidth;
    const H = this.logicalHeight;
    const pal = this.getPalette();

    const rawElapsed = (now - this.startTime) / 1000;
    const elapsed = rawElapsed * this.speedMultiplier;
    const art = this.computeArticulationState(elapsed);

    ctx.save();
    ctx.scale(this.dpr, this.dpr);
    ctx.clearRect(0, 0, W, H);

    // 1. Fondo Bosque Encantado con hojas estilizadas en las esquinas
    this.drawWoodlandBackdrop(ctx, W, H, pal, rawElapsed);

    // 2. Silueta fiel al perfil humano natural (cráneo occipital amplio, frente erguida, mentón compacto y cuello redondeado)
    this.drawNaturalHeadSilhouette(ctx, pal, art);

    // 3. Cavidad oral-faríngea estrictamente contenida (terminación limpia sobre la base del cuello)
    this.drawOralCavity(ctx, pal, art);

    // 4. Flujo de aire interno recortado al canal faríngeo-oral
    this.drawInternalAirflow(ctx, pal, art, elapsed);

    // 5. Lengua muscular suave con sombreado sublingual natural
    this.drawDynamicTongue(ctx, pal, art);

    // 6. Paladar duro y velo blando con úvula redondeada
    this.drawPalateAndVelum(ctx, pal, art);

    // 7. Encías integradas, incisivos curvos, labios sellando frente a los dientes, ojo, oreja y cabello
    this.drawFacialFeaturesAndTeeth(ctx, pal, art, rawElapsed);

    // 8. Flujo saliente y metáforas visuales
    this.drawExternalEffectsAndMetaphors(ctx, pal, art, elapsed);

    ctx.restore();
  }

  drawWoodlandBackdrop(ctx, W, H, pal, rawElapsed) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, pal.bgTop);
    bgGrad.addColorStop(1, pal.bgBottom);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    const glow = ctx.createRadialGradient(168, 134, 24, 168, 134, 165);
    glow.addColorStop(0, pal.mirrorGlow);
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    const sway = Math.sin(rawElapsed * 1.4) * 2.5;
    this.drawBotanicalLeaf(ctx, 26, 26 + sway * 0.4, 22, -0.55, pal);
    this.drawBotanicalLeaf(ctx, 44, 15 + sway * 0.2, 16, -0.15, pal);
    this.drawBotanicalLeaf(ctx, W - 26, H - 24 - sway * 0.4, 22, 2.55, pal);
    this.drawBotanicalLeaf(ctx, W - 44, H - 14 - sway * 0.2, 16, 2.95, pal);
  }

  drawBotanicalLeaf(ctx, x, y, len, angle, pal) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = pal.leafFill;
    ctx.strokeStyle = pal.leafStroke;
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.moveTo(-len * 0.5, 0);
    ctx.quadraticCurveTo(0, -len * 0.36, len * 0.5, 0);
    ctx.quadraticCurveTo(0, len * 0.36, -len * 0.5, 0);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-len * 0.45, 0);
    ctx.lineTo(len * 0.35, 0);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Silueta anatómica calibrada a la referencia humana y anclada al borde inferior:
   * - Cráneo occipital lleno y redondo hasta x=74
   * - Coronilla centrada y frente erguida (x=226..232)
   * - Cuello continuo que se abre suavemente hacia hombros y camiseta verde en la base (cero flotación)
   */
  drawNaturalHeadSilhouette(ctx, pal, art) {
    const jaw = art.jawDrop;
    const lipClose = art.lipClose;

    const upperLipX = 236 + lipClose * 2.5;
    const upperLipY = 135 + lipClose * 2.2;
    const lowerLipX = 234 + lipClose * 3.0;
    const lowerLipY = 149 + jaw * 0.75 - lipClose * 5.8;

    ctx.save();

    const skinGrad = ctx.createLinearGradient(80, 22, 248, 265);
    skinGrad.addColorStop(0, pal.skinBase);
    skinGrad.addColorStop(1, pal.skinShadow);

    ctx.fillStyle = skinGrad;
    ctx.strokeStyle = pal.skinStroke;
    ctx.lineWidth = 2.1;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    // Base anclada al borde inferior (sin flotar) abriendo suavemente hacia los hombros
    ctx.moveTo(92, 274);
    ctx.quadraticCurveTo(108, 250, 112, 228);
    // Nuca curva ascendiendo hacia el occipucio prominente
    ctx.quadraticCurveTo(114, 198, 102, 174);
    ctx.bezierCurveTo(78, 145, 74, 96, 92, 56);
    // Bóveda craneal redonda (occipucio lleno -> coronilla alta -> frente erguida)
    ctx.bezierCurveTo(108, 22, 152, 17, 186, 22);
    ctx.bezierCurveTo(222, 28, 233, 56, 232, 82);
    // Ceja -> puente nasal hundido -> nariz corta infantil -> base nasal
    ctx.quadraticCurveTo(232, 91, 229, 98);
    ctx.quadraticCurveTo(243, 112, 247, 119);
    ctx.quadraticCurveTo(248, 125, 233, 127);
    // Filtrum -> labio superior -> comisura interna -> labio inferior
    ctx.quadraticCurveTo(236, 131, upperLipX, upperLipY);
    ctx.lineTo(224, 138);
    ctx.lineTo(223, 151 + jaw * 0.7);
    ctx.lineTo(lowerLipX, lowerLipY);
    // Surco labiomental suave -> mentón infantil compacto -> línea mandibular limpia -> cuello anterior
    ctx.quadraticCurveTo(230, 157 + jaw * 0.78, 234, 166 + jaw * 0.78);
    ctx.quadraticCurveTo(235, 178 + jaw * 0.75, 214, 181 + jaw * 0.55);
    ctx.quadraticCurveTo(182, 184 + jaw * 0.35, 178, 204);
    ctx.lineTo(177, 232);
    ctx.quadraticCurveTo(180, 252, 198, 274);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    // Camiseta verde bosque anclada firmemente en los hombros inferiores (deja paso limpio al cuello)
    ctx.fillStyle = pal.tunic;
    ctx.strokeStyle = pal.isCvi ? '#FFFFFF' : '#43A047';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(76, 274);
    ctx.quadraticCurveTo(88, 246, 112, 242);
    ctx.quadraticCurveTo(145, 255, 178, 242);
    ctx.quadraticCurveTo(202, 246, 214, 274);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Cavidad oral y faríngea exactamente contenida detrás de los labios/dientes
   * y descendiendo limpiamente por la tráquea hasta el borde inferior (sin flotación).
   */
  drawOralCavity(ctx, pal, art) {
    const jaw = art.jawDrop;
    ctx.save();

    const oralGrad = ctx.createLinearGradient(138, 125, 234, 260);
    oralGrad.addColorStop(0, pal.oralDeep);
    oralGrad.addColorStop(0.55, pal.oralMid);
    oralGrad.addColorStop(1, pal.oralDeep);

    ctx.fillStyle = oralGrad;
    ctx.beginPath();
    // Tubo faríngeo posterior continuo hasta la base del lienzo
    ctx.moveTo(138, 272);
    ctx.lineTo(138, 148);
    ctx.quadraticCurveTo(138, 126, 166, 125);
    ctx.quadraticCurveTo(198, 119, 228, 135);
    // Limite anterior alineado detrás de encías y labios
    ctx.lineTo(231, 141 + jaw * 0.3);
    ctx.lineTo(229, 157 + jaw * 0.78);
    // Piso de boca curvo hacia el cuello anterior
    ctx.quadraticCurveTo(202, 178 + jaw * 0.72, 172, 182 + jaw * 0.35);
    ctx.quadraticCurveTo(161, 192, 161, 272);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * Trayectoria paramétrica estrictamente dentro del canal faríngeo-oral (149, 260 -> 151, 138 -> 212, 133 -> 288, 143).
   */
  sampleAirwayPoint(tNorm, laneOffset, art) {
    const jaw = art.jawDrop;
    const exitY = 143 + jaw * 0.42;
    let x, y;
    if (tNorm < 0.34) {
      const k = tNorm / 0.34;
      x = 149 + k * 3;
      y = 262 - k * 122; // Sube desde pecho/tráquea: 262 -> 140
    } else if (tNorm < 0.72) {
      const k = (tNorm - 0.34) / 0.38;
      x = 152 + k * 66; // Avanza sobre el dorso lingual: 152 -> 218
      const arch = Math.sin(k * Math.PI) * 8;
      y = 140 - k * 4 - arch + (this.currentPhoneme === 'k' && art.isContacting ? 8 : 0);
    } else {
      const k = (tNorm - 0.72) / 0.28;
      x = 218 + k * 84; // Sale suavemente frente a labios (218 -> 302)
      y = 136 + k * (exitY - 136) + Math.sin(k * Math.PI * 1.5) * (laneOffset * 3.2);
    }

    const spread = tNorm < 0.72 ? 5.2 : 8.0;
    return {
      x: x + laneOffset * spread * 0.4,
      y: y + laneOffset * spread
    };
  }

  drawInternalAirflow(ctx, pal, art, elapsed) {
    const jaw = art.jawDrop;
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(140, 270);
    ctx.lineTo(140, 148);
    ctx.quadraticCurveTo(140, 128, 166, 127);
    ctx.quadraticCurveTo(198, 121, 229, 136);
    ctx.lineTo(232, 146 + jaw * 0.55);
    ctx.lineTo(216, 170 + jaw * 0.65);
    ctx.quadraticCurveTo(170, 176 + jaw * 0.35, 159, 194);
    ctx.lineTo(159, 270);
    ctx.closePath();
    ctx.clip();

    if (art.airMode === 'pressurized') {
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * 14);
      ctx.fillStyle = `rgba(41, 182, 246, ${0.15 + pulse * 0.14})`;
      const px = (this.currentPhoneme === 'p' || this.currentPhoneme === 'b') ? 216 : 176;
      const py = (this.currentPhoneme === 'p' || this.currentPhoneme === 'b') ? 144 : 134;
      ctx.beginPath();
      ctx.arc(px, py, 14 + pulse * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    const dtStep = this.speedMultiplier * 0.011;
    this.particles.forEach((pt, idx) => {
      if (this.isPlaying) {
        const flowRate = art.airMode === 'pressurized' ? 0.24 : (0.68 + art.airIntensity * 0.72);
        pt.progress = (pt.progress + pt.speed * dtStep * flowRate) % 1;
      }
      if (pt.progress > 0.76) return;

      const pos = this.sampleAirwayPoint(pt.progress, pt.lane, art);
      const alpha = Math.min(0.85, Math.sin((pt.progress / 0.76) * Math.PI) * 0.85 * art.airIntensity);

      ctx.fillStyle = pal.airColor;
      ctx.globalAlpha = Math.max(0.08, alpha);
      ctx.beginPath();
      if (art.airMode === 'lateral' && pt.progress > 0.45) {
        const sideShift = (idx % 2 === 0 ? -5.5 : 5.5);
        ctx.ellipse(pos.x, pos.y + sideShift, pt.size * 1.3, pt.size * 0.75, 0.1, 0, Math.PI * 2);
      } else {
        ctx.arc(pos.x, pos.y, pt.size, 0, Math.PI * 2);
      }
      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * Lengua blanda y proporcionada con raíz en el tubo faríngeo y sin ángulos cortantes.
   */
  drawDynamicTongue(ctx, pal, art) {
    const { tipX, tipY, midX, midY, backX, backY, jawDrop } = art;
    const floorY = 175 + jawDrop * 0.5;

    ctx.save();

    // Sombra sublingual redondeada y completamente integrada cuando la punta sube
    if (tipY < 154) {
      ctx.fillStyle = pal.tongueDeep;
      ctx.beginPath();
      ctx.moveTo(188, floorY + 2);
      ctx.quadraticCurveTo(205, (floorY + tipY) * 0.56, tipX - 5, tipY + 7);
      ctx.quadraticCurveTo(199, floorY - 3, 184, floorY + 4);
      ctx.closePath();
      ctx.fill();
    }

    const tongueGrad = ctx.createLinearGradient(154, 132, 224, 210);
    tongueGrad.addColorStop(0, pal.tongueTop);
    tongueGrad.addColorStop(0.58, pal.tongueMid);
    tongueGrad.addColorStop(1, pal.tongueDeep);

    ctx.fillStyle = tongueGrad;
    ctx.strokeStyle = pal.tongueStroke;
    ctx.lineWidth = 1.9;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(153, 216);
    ctx.quadraticCurveTo(149, 186, backX, backY);
    ctx.quadraticCurveTo(midX - 4, midY - 11, (midX + tipX) * 0.52, (midY + tipY) * 0.49);
    ctx.quadraticCurveTo(tipX + 3.5, tipY - 3.5, tipX + 1, tipY + 3.5);
    ctx.quadraticCurveTo(tipX - 13, tipY + 16, 206, floorY);
    ctx.quadraticCurveTo(177, floorY + 10, 153, 216);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    // Surco / brillo dorsal suave
    ctx.strokeStyle = pal.tongueGroove;
    ctx.lineWidth = 1.9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(backX + 9, backY + 4);
    ctx.quadraticCurveTo(midX, midY - 2.5, tipX - 9, tipY + 4.5);
    ctx.stroke();

    // Punto guía luminoso en la punta (o dorso posterior para K/G)
    if (['r', 'rr', 'l', 's', 't', 'd'].includes(this.currentPhoneme)) {
      ctx.fillStyle = art.isContacting ? pal.targetGold : 'rgba(255, 245, 157, 0.8)';
      ctx.beginPath();
      ctx.arc(tipX - 2, tipY + 1.5, art.isContacting ? 4.1 : 3.0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.currentPhoneme === 'k' || this.currentPhoneme === 'g') {
      ctx.fillStyle = art.isContacting ? pal.targetMint : 'rgba(165, 214, 167, 0.85)';
      ctx.beginPath();
      ctx.arc(backX + 5, backY + 1, art.isContacting ? 4.8 : 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Paladar duro alineado exactamente sobre el lumen oral + velo carnoso orgánico.
   */
  drawPalateAndVelum(ctx, pal, art) {
    ctx.save();

    const palGrad = ctx.createLinearGradient(168, 118, 227, 138);
    palGrad.addColorStop(0, pal.palateDark);
    palGrad.addColorStop(0.5, pal.palateLight);
    palGrad.addColorStop(1, pal.palateDark);

    ctx.fillStyle = palGrad;
    ctx.strokeStyle = pal.isCvi ? '#FFFFFF' : '#C9AE9D';
    ctx.lineWidth = 1.1;

    ctx.beginPath();
    ctx.moveTo(168, 126);
    ctx.quadraticCurveTo(198, 117, 226, 133);
    ctx.quadraticCurveTo(228, 138, 222, 139);
    ctx.quadraticCurveTo(198, 124, 169, 132);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const velDrop = art.velumDrop * 5.0;
    const velGrad = ctx.createLinearGradient(148, 128, 171, 154);
    velGrad.addColorStop(0, pal.velumTop);
    velGrad.addColorStop(1, pal.velumBot);

    ctx.fillStyle = velGrad;
    ctx.beginPath();
    ctx.moveTo(169, 126);
    ctx.quadraticCurveTo(155, 132 + velDrop * 0.35, 148, 148 + velDrop);
    ctx.quadraticCurveTo(151, 154 + velDrop, 156, 148 + velDrop);
    ctx.quadraticCurveTo(164, 137, 170, 132);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * Dientes perfectamente encerrados detrás de los labios, cabello siguiendo la bóveda occipital llena,
   * oreja en posición anatómica clásica y ojo proporcionado a la altura del puente nasal.
   */
  drawFacialFeaturesAndTeeth(ctx, pal, art, rawElapsed) {
    const jaw = art.jawDrop;
    const lipClose = art.lipClose;
    const lipSmile = art.lipSmile;

    ctx.save();

    // 1. Encía superior y diente incisivo superior (detrás del labio, sin hueco oscuro atrás)
    ctx.fillStyle = pal.gumFill;
    ctx.beginPath();
    ctx.moveTo(221, 130);
    ctx.quadraticCurveTo(227, 129, 231, 134);
    ctx.lineTo(230, 140);
    ctx.quadraticCurveTo(225, 141, 221, 139);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = pal.toothFill;
    ctx.strokeStyle = pal.toothEdge;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(223, 138);
    ctx.lineTo(230, 138);
    ctx.quadraticCurveTo(231, 148, 227, 149);
    ctx.quadraticCurveTo(222, 149, 223, 143);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Encía inferior y diente incisivo inferior moviéndose con la mandíbula
    const lowY = 148 + jaw;
    ctx.fillStyle = pal.gumFill;
    ctx.beginPath();
    ctx.moveTo(220, lowY + 11);
    ctx.quadraticCurveTo(226, lowY + 9, 230, lowY + 12);
    ctx.lineTo(229, lowY + 18);
    ctx.quadraticCurveTo(223, lowY + 19, 219, lowY + 16);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = pal.toothFill;
    ctx.beginPath();
    ctx.moveTo(222, lowY + 12);
    ctx.lineTo(229, lowY + 12);
    ctx.quadraticCurveTo(229.5, lowY + 2, 225, lowY + 1.5);
    ctx.quadraticCurveTo(220, lowY + 2, 222, lowY + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Labios suaves cubriendo el borde anterior de dientes (sin huecos oscuros detrás)
    const upperOutX = 236 + lipClose * 2.5 - lipSmile * 1.5;
    const upperOutY = 135 + lipClose * 2.2;
    const lowerOutX = 234 + lipClose * 3.0 - lipSmile * 1.0;
    const lowerOutY = 149 + jaw * 0.75 - lipClose * 5.8;

    ctx.fillStyle = pal.lipFill;
    ctx.strokeStyle = pal.lipStroke;
    ctx.lineWidth = 1.2;

    // Labio superior
    ctx.beginPath();
    ctx.moveTo(228 - lipSmile * 3, 133);
    ctx.quadraticCurveTo(234, 130 + lipClose * 1.4, upperOutX, upperOutY);
    ctx.quadraticCurveTo(234, upperOutY + 4.5, 228 - lipSmile * 3, 138);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Labio inferior
    ctx.beginPath();
    ctx.moveTo(227 - lipSmile * 3, lowerOutY - 1.5);
    ctx.quadraticCurveTo(233, lowerOutY - 3.5, lowerOutX, lowerOutY);
    ctx.quadraticCurveTo(234, lowerOutY + 5.5, 227 - lipSmile * 3, lowerOutY + 4.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Comisura de sonrisa suave para /s/
    if (lipSmile > 0.2) {
      ctx.strokeStyle = pal.lipStroke;
      ctx.lineWidth = 1.7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(228 - lipSmile * 3, 140);
      ctx.quadraticCurveTo(221, 139, 217, 135);
      ctx.stroke();
    }

    // 4. Cabello infantil frondoso y ondulado (enmarca frente, sien y contorno detrás de la oreja)
    const hairGrad = ctx.createLinearGradient(78, 14, 232, 145);
    hairGrad.addColorStop(0, pal.hairHighlight);
    hairGrad.addColorStop(1, pal.hairBase);
    ctx.fillStyle = hairGrad;

    ctx.beginPath();
    ctx.moveTo(101, 176);
    // Borde externo redondeado de cabellera con volumen suave sobre la coronilla
    ctx.bezierCurveTo(73, 145, 70, 92, 89, 50);
    ctx.bezierCurveTo(105, 16, 152, 12, 188, 18);
    ctx.bezierCurveTo(218, 23, 231, 42, 233, 60);
    // Flequillo frondoso y sienes suaves rodeando la oreja (siguiendo boceto del usuario)
    ctx.quadraticCurveTo(214, 54, 199, 58);
    ctx.quadraticCurveTo(196, 82, 178, 96);
    ctx.quadraticCurveTo(164, 108, 151, 118);
    ctx.quadraticCurveTo(143, 108, 130, 110);
    ctx.quadraticCurveTo(120, 114, 119, 138);
    ctx.quadraticCurveTo(116, 164, 101, 176);
    ctx.closePath();
    ctx.fill();

    // Mechón/onda sutil de volumen en el cabello
    ctx.strokeStyle = pal.hairHighlight;
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(114, 56);
    ctx.quadraticCurveTo(154, 34, 200, 44);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(96, 98);
    ctx.quadraticCurveTo(126, 78, 164, 82);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // 5. Oreja anatómica enmarcadita por la patilla superior
    ctx.fillStyle = pal.skinBase;
    ctx.strokeStyle = pal.skinStroke;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(134, 126, 8.2, 12.2, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(134, 126, 3.8, -0.7, 2.0);
    ctx.stroke();

    // 6. Ojo y ceja proporcionados al puente nasal
    const blinkCycle = rawElapsed % 4.2;
    const isBlinking = blinkCycle > 4.02;

    ctx.strokeStyle = pal.hairBase;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(203, 79);
    ctx.quadraticCurveTo(213, 74, 223, 79);
    ctx.stroke();

    if (isBlinking) {
      ctx.strokeStyle = pal.eyeIris;
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(207, 90);
      ctx.quadraticCurveTo(214, 93.5, 222, 90);
      ctx.stroke();
    } else {
      ctx.fillStyle = pal.eyeWhite;
      ctx.beginPath();
      ctx.ellipse(214, 90, 7.6, 5.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = pal.eyeIris;
      ctx.beginPath();
      ctx.arc(217, 90, 3.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(218.3, 88.6, 1.25, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Mejilla sonrosada
    const cheekRadius = 10 + (this.currentPhoneme === 'p' && lipClose > 0.6 ? 3.5 : 0);
    ctx.fillStyle = pal.cheek;
    ctx.beginPath();
    ctx.ellipse(203, 114, cheekRadius, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Aire saliente y metáforas visuales delante de los labios/punto de contacto.
   */
  drawExternalEffectsAndMetaphors(ctx, pal, art, elapsed) {
    const p = this.currentPhoneme;
    const jaw = art.jawDrop;
    const mouthExitX = 243;
    const mouthExitY = 143 + jaw * 0.42;

    ctx.save();

    this.particles.forEach((pt, idx) => {
      if (pt.progress <= 0.72) return;
      const k = (pt.progress - 0.72) / 0.28;
      const outX = mouthExitX + k * (p === 's' ? 62 : 48);
      const waveY = p === 's'
        ? Math.sin(elapsed * 8 + idx) * 2.2
        : Math.sin(k * Math.PI * 2 + idx) * (5 + k * 6);
      const outY = mouthExitY + waveY + pt.lane * 5.5;

      const alpha = Math.max(0, (1 - k) * 0.85 * art.airIntensity);
      ctx.fillStyle = pal.airColor;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(outX, outY, pt.size * (1 - k * 0.35), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (p === 'r') {
      const scale = art.isContacting ? 1.18 : 0.82;
      ctx.save();
      ctx.translate(220, 137);
      ctx.scale(scale, scale);
      if (art.isContacting) {
        ctx.fillStyle = 'rgba(255, 213, 79, 0.38)';
        ctx.beginPath();
        ctx.arc(0, 0, 11.5, 0, Math.PI * 2);
        ctx.fill();
      }
      this.drawMiniStar(ctx, 0, 0, 7.0, pal.targetGold, '#FFF8E1');
      ctx.restore();
    } else if (p === 'rr') {
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * 22);
      ctx.strokeStyle = pal.targetGold;
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.arc(220, 137, 6.5 + pulse * 4.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.45 + pulse * 0.4;
      ctx.beginPath();
      ctx.arc(220, 137, 11 + pulse * 5.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 0.72;
      for (let w = 0; w < 2; w++) {
        const offset = ((elapsed * 2.5 + w * 0.5) % 1) * 24;
        ctx.beginPath();
        ctx.arc(mouthExitX + 4 + offset, mouthExitY, 9 + w * 4, -0.65, 0.65);
        ctx.stroke();
      }
    } else if (p === 's') {
      ctx.strokeStyle = pal.targetBlue;
      ctx.lineWidth = 2.7;
      ctx.lineCap = 'round';
      for (let line = -1; line <= 1; line += 2) {
        ctx.beginPath();
        for (let step = 0; step <= 48; step += 4) {
          const sx = mouthExitX - 2 + step;
          const sy = mouthExitY + line * 3.8 + Math.sin(step * 0.16 - elapsed * 10) * 2.3;
          if (step === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.globalAlpha = 0.75;
        ctx.stroke();
      }
    } else if (p === 'l') {
      ctx.fillStyle = 'rgba(41, 182, 246, 0.25)';
      ctx.beginPath();
      ctx.arc(220, 137, 9.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = pal.targetBlue;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(220, 137, 5.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (p === 'k' || p === 'g') {
      const pulse = art.isContacting ? 1.18 : 0.9;
      ctx.fillStyle = art.isContacting ? 'rgba(67, 160, 71, 0.34)' : 'rgba(67, 160, 71, 0.16)';
      ctx.beginPath();
      ctx.arc(171, 132, 11 * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = pal.targetMint;
      ctx.beginPath();
      ctx.arc(171, 132, 5.4 * pulse, 0, Math.PI * 2);
      ctx.fill();

      if (art.burstStrength > 0.2) {
        this.drawPopBurst(ctx, mouthExitX + 12, mouthExitY, pal.targetMint);
      }
    } else if (p === 'p' || p === 'b') {
      if (art.isContacting) {
        ctx.strokeStyle = pal.targetPink;
        ctx.lineWidth = 2.3;
        ctx.beginPath();
        ctx.arc(238, 143, 8.5, 0, Math.PI * 2);
        ctx.stroke();
      } else if (art.burstStrength > 0.2) {
        this.drawPopBurst(ctx, mouthExitX + 14, mouthExitY, pal.targetPink);
      }
    }

    ctx.restore();
  }

  drawMiniStar(ctx, cx, cy, r, fill, highlight) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? r : r * 0.48;
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      const x = cx + Math.cos(angle) * rad;
      const y = cy + Math.sin(angle) * rad;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = highlight;
    ctx.lineWidth = 1.1;
    ctx.stroke();
  }

  drawPopBurst(ctx, cx, cy, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.3;
    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - 0.3;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 6.5, cy + Math.sin(a) * 6.5);
      ctx.lineTo(cx + Math.cos(a) * 13, cy + Math.sin(a) * 13);
      ctx.stroke();
    }
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

window.PraxiaCanvasEngine = PraxiaCanvasEngine;
