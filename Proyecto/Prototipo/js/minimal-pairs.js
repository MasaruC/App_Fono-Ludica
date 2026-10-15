/* ==========================================================================
   MINIMAL PAIRS ENGINE - DISCRIMINACIÓN AUDITIVA Y PARES MÍNIMOS (CUS-02)
   Cumple con: RF-FON-004, RN-GAM-001, GL-006
   Sustento: Mora et al. (2024) (Normalización al 74%), Strömbergsson (2026)
   ========================================================================== */

const MINIMAL_PAIRS_DATA = [
  {
    id: "pair-1",
    targetPhoneme: "k",
    substitutedPhoneme: "t",
    contrastType: "Anteriorización Velar (/k/ -> [t])",
    question: "¿Dónde dormimos por la noche para soñar lindo?",
    correctOption: {
      word: "Cama",
      icon: "🛏️",
      soundCue: "Sonido /k/ con el fondo de la lengua",
      phonemeTarget: "k"
    },
    foilOption: {
      word: "Tama",
      icon: "❓",
      soundCue: "¡Tama no existe! Es una palabra inventada",
      comicFeedback: "¡Tama suena divertido! Pero en una 'Tama' no podemos dormir, ¡jejeje!"
    }
  },
  {
    id: "pair-2",
    targetPhoneme: "s",
    substitutedPhoneme: "t",
    contrastType: "Oclusivización de Fricativa (/s/ -> [t])",
    question: "¿Qué astro brilla caliente en el cielo de día?",
    correctOption: {
      word: "Sol",
      icon: "☀️",
      soundCue: "Sonido /s/ soplando suave como la brisa",
      phonemeTarget: "s"
    },
    foilOption: {
      word: "Tol",
      icon: "❓",
      soundCue: "¡Tol suena raro!",
      comicFeedback: "¡Tol! ¿Un tol en el cielo? ¡El sol es el que nos calienta!"
    }
  },
  {
    id: "pair-3",
    targetPhoneme: "r",
    substitutedPhoneme: "l",
    contrastType: "Lateralización de Vibrante (/r/ -> [l])",
    question: "¿Qué fruta jugosa es verde, dulce y nutritiva?",
    correctOption: {
      word: "Pera",
      icon: "🍐",
      soundCue: "Sonido /r/ vibrando la lengüita arriba",
      phonemeTarget: "r"
    },
    foilOption: {
      word: "Pela",
      icon: "🥔",
      soundCue: "¡Pela es una acción, no la fruta!",
      comicFeedback: "¡Pela la manzana, pero la fruta rica es la Pera!"
    }
  }
];

window.MinimalPairsData = MINIMAL_PAIRS_DATA;
