/* ==========================================================================
   PRAXIA CANVAS 2D - MODELADO ANATÓMICO BUCOFACIAL PEDIÁTRICO
   Cumple con: RF-BIO-001, RF-FON-003, CUS-02
   Sustento: Pucuhuaranga (2016) (Fases 1 y 2 bucofaciales, 46.86% de superación),
             Du et al. (2023) (Pauta 2: Biofeedback visual lingual)
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
    this.airflowParticles = [];
    this.initAirflow();
    this.render();
  }

  initAirflow() {
    this.airflowParticles = [];
    for (let i = 0; i < 20; i++) {
      this.airflowParticles.push({
        x: 60 + Math.random() * 80,
        y: 140 + Math.random() * 30,
        vx: 2 + Math.random() * 2,
        vy: (Math.random() - 0.5) * 0.8,
        radius: 2.5 + Math.random() * 2,
        opacity: Math.random()
      });
    }
  }

  setPhoneme(phoneme) {
    this.currentPhoneme = phoneme.toLowerCase();
    this.animationProgress = 0;
    this.initAirflow();
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

    // --- FONDO NEUTRO RELAJANTE ---
    ctx.fillStyle = '#F1F8E9';
    ctx.fillRect(0, 0, w, h);

    // --- 1. PALADAR ÓSEO Y ARRUGA PALATINA / ALVÉOLOS (Superior) ---
    ctx.beginPath();
    ctx.moveTo(40, 70);
    ctx.bezierCurveTo(90, 60, 180, 50, 230, 80);
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#D7CCC8';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Marcador del Alvéolo (Punto clave para /r, /l, /s/)
    ctx.beginPath();
    ctx.arc(200, 72, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#81C784';
    ctx.fill();
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 2;
    ctx.stroke();

    // --- 2. DIENTES SUPERIORES E INFERIORES ---
    // Dientes superiores
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#90A4AE';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(228, 76, 16, 22, [2, 2, 4, 4]);
    ctx.fill();
    ctx.stroke();

    // Dientes inferiores
    ctx.beginPath();
    ctx.roundRect(224, 150, 15, 22, [4, 4, 2, 2]);
    ctx.fill();
    ctx.stroke();

    // --- 3. LABIOS SUPERIOR E INFERIOR ---
    ctx.fillStyle = '#EF9A9A';
    ctx.strokeStyle = '#E57373';
    ctx.lineWidth = 3;

    // Labio superior
    ctx.beginPath();
    ctx.moveTo(234, 74);
    ctx.bezierCurveTo(270, 70, 280, 85, 252, 94);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Labio inferior (con animación para bilabiales /b, p/)
    let lipBottomYOffset = 0;
    if (this.currentPhoneme === 'p' || this.currentPhoneme === 'b') {
      lipBottomYOffset = Math.sin(t) < 0 ? -12 : 6;
    }

    ctx.beginPath();
    ctx.moveTo(230, 155 + lipBottomYOffset);
    ctx.bezierCurveTo(270, 158 + lipBottomYOffset, 276, 142 + lipBottomYOffset, 248, 140 + lipBottomYOffset);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // --- 4. LENGUA ANIMADA (ÓRGANO DINÁMICO) ---
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = '#FF8A80';
    ctx.strokeStyle = '#D32F2F';
    ctx.lineWidth = 3.5;

    let tipX = 200;
    let tipY = 96;

    if (this.currentPhoneme === 'r' || this.currentPhoneme === 'rr') {
      // Vibración rápida lingual en alvéolos
      const vibrate = Math.sin(t * 4) * 8;
      tipX = 198;
      tipY = 82 + vibrate; // Toca los alvéolos repetidamente
    } else if (this.currentPhoneme === 's') {
      // Lengua abajo cerca de incisivos inferiores dejando canal estrecho
      tipX = 215;
      tipY = 135 + Math.sin(t) * 2;
    } else if (this.currentPhoneme === 'l') {
      // Contacto pleno sostenido con el alvéolo
      tipX = 202;
      tipY = 78;
    } else if (this.currentPhoneme === 'k') {
      // Dorso lingual sube al velo del paladar (anteriorización velar corrección)
      tipX = 180;
      tipY = 130;
    }

    // Trazo orgánico del cuerpo de la lengua
    ctx.moveTo(70, 175); // Raíz lingual
    if (this.currentPhoneme === 'k') {
      const velarLift = Math.abs(Math.sin(t)) * 32;
      ctx.bezierCurveTo(100, 170, 130, 75 - velarLift, tipX, tipY);
    } else {
      ctx.bezierCurveTo(100, 170, 150, 140, tipX, tipY);
    }
    ctx.bezierCurveTo(tipX + 15, tipY + 25, 170, 185, 70, 195);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // --- 5. PARTÍCULAS DE FLUJO DE AIRE ANIMADO ---
    ctx.fillStyle = '#0288D1';
    for (let p of this.airflowParticles) {
      if (this.isPlaying) {
        p.x += p.vx;
        p.y += p.vy;
        p.opacity -= 0.015;
        if (p.x > 280 || p.opacity <= 0) {
          p.x = 70;
          p.y = 130 + Math.random() * 20;
          p.opacity = 0.8;
        }
      }
      ctx.beginPath();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // --- 6. INDICADOR VISUAL SUAVE (Sin textos anatómicos complejos) ---
    // El punto verde y el movimiento de la lengua muestran la posición de manera 100% visual
    if (this.currentPhoneme === 'r' || this.currentPhoneme === 'rr' || this.currentPhoneme === 'l') {
      ctx.beginPath();
      ctx.arc(200, 72, 10 + Math.sin(t * 3) * 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(76, 175, 80, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    requestAnimationFrame(() => this.render());
  }
}

window.PraxiaCanvasEngine = PraxiaCanvasEngine;
