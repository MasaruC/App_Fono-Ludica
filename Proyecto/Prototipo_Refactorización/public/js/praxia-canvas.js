/* ==========================================================================
   PRAXIA CANVAS 2D - CORTE SAGITAL METAFÓRICO Y PROPORCIONADO PEDIÁTRICO
   Cumple con: RF-BIO-001, RF-FON-003, CUS-02, Pauta 2 Du et al. (2023)
   Principios: Proporciones anatómicas armónicas, integración coherente entre
               perfil facial y cavidad oral, cero papada, cabeza terminada
               con cráneo/cabello completo y metáforas 100% visuales.
   ========================================================================== */

class PraxiaCanvasEngine {
  constructor(canvasId = 'praxiaCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.currentPhoneme = 'r';
    this.animationProgress = 0;
    this.speed = 0.035;
    this.isPlaying = true;

    // Partículas y efectos mágicos de la metáfora
    this.airflowParticles = [];
    this.magicSparkles = [];

    this.initAirflow();
    this.initSparkles();
    this.render();
  }

  setSpeed(factor = 1.0) {
    this.speed = 0.035 * factor;
  }

  initAirflow() {
    this.airflowParticles = [];
    for (let i = 0; i < 22; i++) {
      this.airflowParticles.push({
        x: 140 + Math.random() * 20,
        y: 210 + Math.random() * 40,
        vx: 1.2 + Math.random() * 1.4,
        vy: -1.6 - Math.random() * 1.2,
        radius: 2 + Math.random() * 2,
        opacity: 0.2 + Math.random() * 0.7
      });
    }
  }

  initSparkles() {
    this.magicSparkles = [];
    for (let i = 0; i < 14; i++) {
      this.magicSparkles.push({
        x: 236 + (Math.random() - 0.5) * 24,
        y: 104 + (Math.random() - 0.5) * 24,
        radius: 1.5 + Math.random() * 2.5,
        alpha: Math.random(),
        speedY: -0.6 - Math.random() * 0.8,
        speedX: (Math.random() - 0.5) * 1.2
      });
    }
  }

  setPhoneme(phoneme) {
    this.currentPhoneme = (phoneme || 'r').toLowerCase().trim();
    this.animationProgress = 0;
    this.initAirflow();
    this.initSparkles();
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
  }

  render() {
    if (!this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    if (this.isPlaying) {
      this.animationProgress += this.speed;
      if (this.animationProgress > Math.PI * 2) {
        this.animationProgress = 0;
      }
    }

    const t = this.animationProgress;

    // 1. Fondo suave
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, w, h);

    // 2. Silueta Externa Completa y Proporcionada de la Cabeza
    this.drawHeadProfile(ctx, w, h);

    // 3. Cavidad Bucal Interna (Fisiológicamente alineada)
    this.drawOralCavity(ctx);

    // 4. Bóveda Palatina (Paladar Duro) y Campanilla
    this.drawPalateBone(ctx, t);

    // 5. Corriente de Aire Fonatorio Respiratorio
    this.drawAirflow(ctx, t);

    // 6. Lengua Pediátrica Articulada (Ápice directo al alvéolo)
    this.drawDynamicTongue(ctx, t);

    // 7. Dientes Incisivos y Encías (Enraizados en sus maxilares)
    this.drawTeethAndGums(ctx, t);

    // 8. Metáforas Visuales Mágicas (Cero texto técnico)
    this.drawVisualMetaphor(ctx, t);

    requestAnimationFrame(() => this.render());
  }

  /* =========================================================================
     1. SILUETA PROPORCIONADA DE LA CABEZA (BÓVEDA CRANEAL REDONDEADA Y LIMPIA)
     ========================================================================= */
  drawHeadProfile(ctx, w, h) {
    ctx.save();

    // Sombra suave de la silueta
    ctx.shadowColor = 'rgba(0, 0, 0, 0.04)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 4;

    ctx.beginPath();
    // 1. Coronilla alta y redondeada (Bóveda craneal sin achatamiento)
    ctx.moveTo(160, 8);

    // 2. Frente infantil amplia y armónica
    ctx.bezierCurveTo(205, 8, 238, 24, 250, 48);
    ctx.bezierCurveTo(254, 56, 252, 66, 254, 74); // Ceja y puente nasal

    // 3. Nariz pequeña y proporcionada
    ctx.bezierCurveTo(256, 78, 280, 84, 282, 88); // Punta de la nariz
    ctx.bezierCurveTo(282, 94, 268, 96, 264, 102); // Base nasal
    ctx.lineTo(262, 106); // Filtrum

    // 4. Labio superior
    ctx.bezierCurveTo(274, 108, 276, 114, 260, 118);
    ctx.lineTo(254, 122); // Comisura labial

    // 5. Labio inferior
    let lipShift = 0;
    if (this.currentPhoneme === 'p' || this.currentPhoneme === 'b') {
      lipShift = Math.sin(this.animationProgress) < 0 ? -5 : 3;
    }
    ctx.lineTo(256, 128 + lipShift);
    ctx.bezierCurveTo(272, 130 + lipShift, 270, 140, 258, 144);

    // 6. Mentón redondeado
    ctx.bezierCurveTo(256, 148, 265, 154, 266, 162);
    ctx.bezierCurveTo(266, 168, 256, 172, 248, 174);

    // 7. Mandíbula y cuello (SIN PAPADA: curva limpia hacia adentro)
    ctx.bezierCurveTo(230, 176, 212, 180, 206, 188);
    ctx.lineTo(206, h); // Cuello anterior

    // 8. Base inferior
    ctx.lineTo(100, h);

    // 9. Cuello posterior y Nuca (Cerrando la cabeza)
    ctx.lineTo(100, 185);
    ctx.bezierCurveTo(92, 160, 78, 140, 68, 120); // Nuca

    // 10. Bóveda Craneal Posterior (Occipital redondeado amplio, sin cortes planos)
    ctx.bezierCurveTo(48, 95, 52, 55, 78, 30); // Curva craneal trasera
    ctx.bezierCurveTo(102, 10, 130, 8, 160, 8); // Unión armónica con la coronilla
    ctx.closePath();

    // Relleno unificado, limpio y cálido (Cero parches de colores confusos)
    const skinGrad = ctx.createLinearGradient(70, 15, 280, 245);
    skinGrad.addColorStop(0, '#FFF5EB');
    skinGrad.addColorStop(0.65, '#FFE2C6');
    skinGrad.addColorStop(1, '#FFCCBC');
    ctx.fillStyle = skinGrad;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#D7CCC8';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Orejita tierna y proporcionada
    ctx.beginPath();
    ctx.arc(126, 138, 11, -Math.PI * 0.45, Math.PI * 0.55);
    ctx.fillStyle = '#FFE2C6';
    ctx.fill();
    ctx.strokeStyle = '#D7CCC8';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.restore();
  }

  /* =========================================================================
     2. CAVIDAD BUCAL INTERNA
     ========================================================================= */
  drawOralCavity(ctx) {
    ctx.save();
    ctx.beginPath();

    // Faringe posterior
    ctx.moveTo(125, 260);
    ctx.lineTo(125, 108);

    // Techo bucal hacia los dientes
    ctx.bezierCurveTo(125, 80, 160, 68, 200, 72);
    ctx.bezierCurveTo(225, 75, 238, 86, 246, 104);

    // Apertura bucal interna detrás de los labios
    ctx.lineTo(254, 118);
    ctx.lineTo(252, 128);

    // Suelo de la boca y garganta anterior
    ctx.bezierCurveTo(240, 145, 205, 170, 180, 178);
    ctx.bezierCurveTo(165, 184, 158, 210, 158, 260);
    ctx.closePath();

    ctx.fillStyle = '#3F121C'; // Burdeos fisiológico profundo
    ctx.fill();
    ctx.restore();
  }

  /* =========================================================================
     3. PALADAR ÓSEO (TECHO) Y CAMPANILLA (ÚVULA)
     ========================================================================= */
  drawPalateBone(ctx, t) {
    ctx.save();

    // Paladar Óseo (Arco firme que llega directamente al alvéolo en x=238, y=102)
    ctx.beginPath();
    ctx.moveTo(145, 96);
    ctx.bezierCurveTo(172, 78, 210, 80, 238, 102);
    ctx.lineWidth = 11;
    ctx.strokeStyle = '#F5EBE6';
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(145, 96);
    ctx.bezierCurveTo(172, 78, 210, 80, 238, 102);
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#D7CCC8';
    ctx.stroke();

    // Velo blando y Campanilla
    ctx.beginPath();
    ctx.moveTo(145, 96);
    ctx.bezierCurveTo(138, 105, 130, 118, 132, 128);
    ctx.bezierCurveTo(138, 130, 142, 115, 148, 102);
    ctx.closePath();
    ctx.fillStyle = '#E57373';
    ctx.fill();
    ctx.strokeStyle = '#C62828';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.restore();
  }

  /* =========================================================================
     4. DIENTES INCISIVOS Y ENCÍAS (PERFECTAMENTE ENRAIZADOS)
     ========================================================================= */
  drawTeethAndGums(ctx, t) {
    ctx.save();

    // Encía superior (situada justo encima del diente y detrás del labio superior)
    ctx.fillStyle = '#FFCDD2';
    ctx.beginPath();
    ctx.roundRect(240, 94, 14, 12, [4, 4, 0, 0]);
    ctx.fill();

    // Diente superior (blanco, redondeado, enraizado en la encía)
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#B0BEC5';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(244, 104, 11, 16, [1, 1, 3, 3]);
    ctx.fill();
    ctx.stroke();

    // Mandíbula y Diente inferior
    let lowerShift = 0;
    if (this.currentPhoneme === 's') lowerShift = -6; // Dientes juntos
    if (this.currentPhoneme === 'k') lowerShift = 7; // Más abierto

    // Encía inferior
    ctx.fillStyle = '#FFCDD2';
    ctx.beginPath();
    ctx.roundRect(238, 140 + lowerShift, 14, 12, [0, 0, 4, 4]);
    ctx.fill();

    // Diente inferior
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#B0BEC5';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(242, 126 + lowerShift, 10, 16, [3, 3, 1, 1]);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  /* =========================================================================
     5. LENGUA PEDIÁTRICA ARTICULADA
     ========================================================================= */
  drawDynamicTongue(ctx, t) {
    ctx.save();
    const p = this.currentPhoneme;

    // Coordenadas anatómicas exactas
    // Alvéolo objetivo = (236, 104) justo detrás del diente superior (244, 104)
    let tipX = 236;
    let tipY = 104;
    let midDorsumX = 180;
    let midDorsumY = 135;
    let rootX = 135;
    let rootY = 205;

    let isTouchingTarget = false;

    if (p === 'r') {
      // Cohete al Techo: asciende, hace tap elástico en el alvéolo (236, 104) y baja
      const cycle = Math.sin(t);
      const lift = Math.max(0, cycle) * 32;
      tipX = 234 - (1 - Math.max(0, cycle)) * 10;
      tipY = 134 - lift; // En el pico llega a y=102
      midDorsumX = 178;
      midDorsumY = 142 - lift * 0.3;
      isTouchingTarget = tipY <= 106;

    } else if (p === 'rr') {
      // Motorcito Rápido: la punta vibra elásticamente en el alvéolo
      const vibrate = Math.sin(t * 8) * 4;
      tipX = 236;
      tipY = 104 + vibrate;
      midDorsumX = 178;
      midDorsumY = 135;
      isTouchingTarget = true;

    } else if (p === 'l') {
      // Campanita / Trampolín: contacto firme arriba
      tipX = 236;
      tipY = 103;
      midDorsumX = 172;
      midDorsumY = 148;
      isTouchingTarget = true;

    } else if (p === 's') {
      // Viento: punta abajo tranquila detrás del diente inferior
      tipX = 232;
      tipY = 138 + Math.sin(t) * 2;
      midDorsumX = 188;
      midDorsumY = 118;
      isTouchingTarget = false;

    } else if (p === 'k' || p === 'g') {
      // Ranita: la espalda sube al techo posterior
      const velarCycle = Math.max(0, Math.sin(t));
      tipX = 216;
      tipY = 162;
      midDorsumX = 150;
      midDorsumY = 126 - velarCycle * 38;
      isTouchingTarget = false;

    } else if (p === 'p' || p === 'b') {
      tipX = 224;
      tipY = 148;
      midDorsumX = 176;
      midDorsumY = 152;
      isTouchingTarget = false;
    }

    // Trazo orgánico suave de la lengua
    ctx.beginPath();
    ctx.moveTo(rootX, rootY);

    if (p === 'k' || p === 'g') {
      ctx.bezierCurveTo(138, midDorsumY - 8, midDorsumX - 10, midDorsumY - 12, midDorsumX + 20, midDorsumY);
      ctx.bezierCurveTo(midDorsumX + 40, midDorsumY + 12, 198, tipY - 4, tipX, tipY);
    } else {
      ctx.bezierCurveTo(140, 180, 155, midDorsumY, midDorsumX, midDorsumY);
      ctx.bezierCurveTo(midDorsumX + 22, midDorsumY, 212, tipY + 10, tipX, tipY);
    }

    ctx.bezierCurveTo(tipX + 6, tipY + 14, tipX - 8, tipY + 30, 195, 180);
    ctx.bezierCurveTo(172, 200, 150, 210, rootX, rootY);
    ctx.closePath();

    // Gradiente vivo muscular
    const tGrad = ctx.createRadialGradient(tipX - 12, tipY + 12, 6, midDorsumX, midDorsumY, 95);
    tGrad.addColorStop(0, '#FF8A80');
    tGrad.addColorStop(0.55, '#FF5252');
    tGrad.addColorStop(1, '#D32F2F');
    ctx.fillStyle = tGrad;
    ctx.fill();

    ctx.strokeStyle = '#B71C1C';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Brillo en la punta
    ctx.fillStyle = '#FFE082';
    ctx.beginPath();
    ctx.arc(tipX, tipY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return isTouchingTarget;
  }

  /* =========================================================================
     6. FLUJO DE AIRE SUAVE (RESPIRACIÓN)
     ========================================================================= */
  drawAirflow(ctx, t) {
    ctx.save();
    const p = this.currentPhoneme;

    ctx.fillStyle = p === 's' ? '#00E5FF' : '#40C4FF';

    for (let pt of this.airflowParticles) {
      if (this.isPlaying) {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.opacity -= 0.016;

        if (pt.y < 135 && pt.x < 210) {
          pt.vx += 0.12;
          pt.vy *= 0.88;
        }

        if (pt.x > 310 || pt.y < 35 || pt.opacity <= 0) {
          pt.x = 140 + Math.random() * 20;
          pt.y = 210 + Math.random() * 35;
          pt.vx = 1.2 + Math.random() * 1.4;
          pt.vy = -1.6 - Math.random() * 1.2;
          pt.opacity = 0.7 + Math.random() * 0.3;
        }
      }

      ctx.beginPath();
      ctx.globalAlpha = Math.max(0, pt.opacity);
      ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1.0;
    ctx.restore();
  }

  /* =========================================================================
     7. METÁFORAS VISUALES MÁGICAS (CERO TEXTO TÉCNICO)
     ========================================================================= */
  drawVisualMetaphor(ctx, t) {
    ctx.save();
    const p = this.currentPhoneme;
    const targetX = 236;
    const targetY = 104;

    // --- METÁFORA /r/ Y /rr/: LA ESTRELLA MÁGICA ---
    if (p === 'r' || p === 'rr') {
      const pulse = 1 + Math.sin(t * (p === 'rr' ? 8 : 4)) * 0.22;

      // Estrella Dorada Objetivo en el alvéolo (justo detrás del diente superior)
      ctx.save();
      ctx.translate(targetX, targetY);
      ctx.scale(pulse, pulse);

      ctx.fillStyle = 'rgba(255, 215, 0, 0.45)';
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();

      // Estrella dorada de 5 puntas
      ctx.fillStyle = '#FFD54F';
      ctx.strokeStyle = '#FFA000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const x = Math.cos(outerAngle) * 8.5;
        const y = Math.sin(outerAngle) * 8.5;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Destellos mágicos al contacto
      for (let sp of this.magicSparkles) {
        if (this.isPlaying) {
          sp.x += sp.speedX;
          sp.y += sp.speedY;
          sp.alpha -= 0.02;
          if (sp.alpha <= 0 || sp.y < 70) {
            sp.x = targetX + (Math.random() - 0.5) * 16;
            sp.y = targetY + (Math.random() - 0.5) * 16;
            sp.alpha = 0.9;
          }
        }
        ctx.fillStyle = '#FFF59D';
        ctx.beginPath();
        ctx.globalAlpha = Math.max(0, sp.alpha);
        ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // Ondas alegres en la /rr/
      if (p === 'rr') {
        ctx.strokeStyle = '#FFC107';
        ctx.lineWidth = 1.8;
        const rWave = 12 + (t * 16) % 20;
        const aWave = 1 - (rWave / 32);
        ctx.beginPath();
        ctx.globalAlpha = Math.max(0, aWave);
        ctx.arc(targetX, targetY, rWave, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

    // --- METÁFORA /l/: LA CAMPANITA O GEMA ---
    } else if (p === 'l') {
      ctx.save();
      ctx.translate(targetX, targetY);

      ctx.fillStyle = '#64B5F6';
      ctx.beginPath();
      ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1976D2';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Ondas de viento a los lados
      ctx.strokeStyle = '#29B6F6';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(7, 10, 8, -Math.PI * 0.4, Math.PI * 0.3);
      ctx.stroke();
      ctx.restore();

    // --- METÁFORA /s/: EL VIENTO ENTRE LOS DIENTES ---
    } else if (p === 's') {
      ctx.save();
      ctx.translate(254, 120);
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      const windPhase = (t * 3) % (Math.PI * 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(14, -5 + Math.sin(windPhase) * 2.5, 24, 3, 38, -2);
      ctx.stroke();
      ctx.restore();

    // --- METÁFORA /p/ O /b/: LA BURBUJA POP ---
    } else if (p === 'p' || p === 'b') {
      const popPhase = Math.sin(t);
      if (popPhase < 0) {
        const bubbleR = Math.abs(popPhase) * 7;
        ctx.fillStyle = 'rgba(255, 64, 129, 0.45)';
        ctx.beginPath();
        ctx.arc(258, 122, bubbleR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#E91E63';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

window.PraxiaCanvasEngine = PraxiaCanvasEngine;
