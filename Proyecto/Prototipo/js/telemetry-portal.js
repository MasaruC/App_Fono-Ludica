/* ==========================================================================
   TELEMETRY & ADULT MEDIATION PORTAL (CUS-03, CUS-04)
   Cumple con: RF-MED-001, RF-MED-002, RF-MED-003, RF-MED-004, RN-MED-001, RC-SEG-001
   Sustento: Du et al. (2023) (Pauta 1: Back-end clínico y dosis de 15 min),
             Liu et al. (2026) (Capa Mediación Adulta), Huertas & Roque (2023)
   ========================================================================== */

class TelemetryPortalEngine {
  constructor() {
    this.currentChallenge = { question: "Tres por cuatro", answer: "12" };
    this.inputCode = "";
    this.dailyDosingUsedMin = 8;
    this.dailyDosingLimitMin = 15;
    this.audioVaultSamples = [
      {
        id: "SMPL-001",
        date: "24/09 10:15",
        word: "Guitarra",
        phoneme: "/rr/ medial",
        status: "APROBADO",
        statusClass: "tag-green",
        notes: "Articulación nítida con vibración alveolar adecuada (Bosch & Melgar).",
        hasRealAudio: false
      },
      {
        id: "SMPL-002",
        date: "24/09 10:18",
        word: "Sol",
        phoneme: "/s/ final",
        status: "SUSTITUCIÓN [t]",
        statusClass: "tag-yellow",
        notes: "Oclusivización de fricativa detectada. Requiere refuerzo en pares mínimos.",
        hasRealAudio: false
      },
      {
        id: "SMPL-003",
        date: "24/09 10:22",
        word: "Plátano",
        phoneme: "/pl/ sinfón",
        status: "DDA ASISTIDO",
        statusClass: "tag-purple",
        notes: "Reducción de grupo consonántico. Activación automática de praxia 2D lingual.",
        hasRealAudio: false
      }
    ];
  }

  generateMathChallenge() {
    const challenges = [
      { question: "Tres por cuatro", answer: "12" },
      { question: "Cinco más siete", answer: "12" },
      { question: "Cuatro por dos", answer: "8" },
      { question: "Nueve menos tres", answer: "6" },
      { question: "Dos por ocho", answer: "16" }
    ];
    this.currentChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    this.inputCode = "";
    return this.currentChallenge;
  }

  appendKeypadDigit(digit) {
    if (digit === null || digit === undefined || digit === "") {
      return this.inputCode;
    }
    if (this.inputCode.length < 4) {
      this.inputCode += String(digit).trim();
    }
    return this.inputCode;
  }

  clearKeypad() {
    this.inputCode = "";
    return this.inputCode;
  }

  verifyMathChallenge() {
    if (!this.inputCode || !this.currentChallenge) return false;
    return parseInt(this.inputCode.trim(), 10) === parseInt(this.currentChallenge.answer.trim(), 10);
  }

  addRecordedSample(word, phoneme, status, audioUrl, statusClass = "tag-green") {
    const now = new Date();
    const timeStr = `${now.getDate()}/${now.getMonth() + 1} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newSample = {
      id: `SMPL-00${this.audioVaultSamples.length + 1}`,
      date: timeStr,
      word: word,
      phoneme: phoneme,
      status: status,
      statusClass: statusClass,
      notes: "Muestra capturada en tiempo real en la sesión de aula.",
      audioUrl: audioUrl,
      hasRealAudio: !!audioUrl
    };
    this.audioVaultSamples.unshift(newSample);
  }
}

window.TelemetryPortalEngine = TelemetryPortalEngine;
