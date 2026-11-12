/* ==========================================================================
   SPEECH GAMES - JUEGOS VERBALES Y BANCO DE 32 PALABRAS (BOSCH & MELGAR)
   Cumple con: RF-LUD-001 a RF-LUD-005, RF-FON-002, RN-FON-001, RN-FON-002
   Sustento: Pucuhuaranga (2016), Condori & Larico (2022), Mora et al. (2024)
   ========================================================================== */

const BOSCH_MELGAR_BANK = [
  { word: "Lápiz", phoneme: "l", pos: "I", icon: "✏️", syllables: ["Lá", "piz"] },
  { word: "Sol", phoneme: "l", pos: "F", icon: "☀️", syllables: ["Sol"] },
  { word: "Pelota", phoneme: "l", pos: "M", icon: "⚽", syllables: ["Pe", "lo", "ta"] },
  { word: "Ratón", phoneme: "r", pos: "I", icon: "🐭", syllables: ["Ra", "tón"] },
  { word: "Guitarra", phoneme: "rr", pos: "M", icon: "🎸", syllables: ["Gui", "ta", "rra"] },
  { word: "Collar", phoneme: "r", pos: "F", icon: "📿", syllables: ["Co", "llar"] },
  { word: "Sapo", phoneme: "s", pos: "I", icon: "🐸", syllables: ["Sa", "po"] },
  { word: "Vaso", phoneme: "s", pos: "M", icon: "🥛", syllables: ["Va", "so"] },
  { word: "Gato", phoneme: "g", pos: "I", icon: "🐱", syllables: ["Ga", "to"] },
  { word: "Casa", phoneme: "k", pos: "I", icon: "🏠", syllables: ["Ca", "sa"] },
  { word: "Boca", phoneme: "k", pos: "M", icon: "👄", syllables: ["Bo", "ca"] },
  { word: "Pato", phoneme: "p", pos: "I", icon: "🦆", syllables: ["Pa", "to"] },
  { word: "Bota", phoneme: "b", pos: "I", icon: "👢", syllables: ["Bo", "ta"] },
  { word: "Dedo", phoneme: "d", pos: "I", icon: "☝️", syllables: ["De", "do"] },
  { word: "Foca", phoneme: "f", pos: "I", icon: "🦭", syllables: ["Fo", "ca"] },
  { word: "Plátano", phoneme: "pl", pos: "I", icon: "🍌", syllables: ["Plá", "ta", "no"] },
  { word: "Tren", phoneme: "tr", pos: "I", icon: "🚂", syllables: ["Tren"] },
  { word: "Globo", phoneme: "gl", pos: "I", icon: "🎈", syllables: ["Glo", "bo"] }
];

const TRABALENGUAS_DATA = [
  {
    id: "trab-1",
    title: "El Loro y la Guitarra",
    targetPhoneme: "rr",
    word: "Guitarra",
    icon: "🎸",
    phrase: "Erre con erre guitarra, erre con erre barril...",
    rhythmSyllables: ["E", "rre", "con", "e", "rre", "gui", "ta", "rra"],
    acceptableTargets: ["guitarra", "erre con erre guitarra", "barril"],
    hint: "Sube la lengüita al techo de la boca 👅"
  },
  {
    id: "trab-2",
    title: "El Sapo Saltarín",
    targetPhoneme: "s",
    word: "Sapo",
    icon: "🐸",
    phrase: "El sapo salta sobre el sauce solo...",
    rhythmSyllables: ["El", "sa", "po", "sal", "ta", "so", "bre"],
    acceptableTargets: ["sapo", "el sapo salta sobre el sauce", "salta"],
    hint: "Sopla suave como el viento entre los dientes 🌬️"
  },
  {
    id: "trab-3",
    title: "La Luna Luminosa",
    targetPhoneme: "l",
    word: "Luna",
    icon: "🌙",
    phrase: "La luna luminosa ilumina la laguna...",
    rhythmSyllables: ["La", "lu", "na", "lu", "mi", "no", "sa"],
    acceptableTargets: ["luna", "la luna luminosa", "laguna"],
    hint: "Pega la lengüita a los dientes de arriba ✨"
  }
];

/* Etapa 1-2 Van Riper: Sonido Aislado Puro (Cero Schwa [ə]) y Escalera Silábica CV -> CVC -> CCV (Furlong et al., 2018) */
const SONIDOS_SILABAS_DATA = [
  {
    id: "son-r",
    phoneme: "r",
    pureSound: "r",
    praxiaKey: "r",
    anchorWord: "Pera",
    icon: "🍐",
    soundCue: "Como Pera 🍐",
    syllables: ["Ra", "Re", "Ri", "Pera"],
    acceptableTargets: ["pera", "ra", "re", "ri"],
    ageMin: 4
  },
  {
    id: "son-rr",
    phoneme: "rr",
    pureSound: "rr",
    praxiaKey: "rr",
    anchorWord: "Perro",
    icon: "🐶",
    soundCue: "Como Perro 🐶",
    syllables: ["Rra", "Rre", "Rri", "Perro"],
    acceptableTargets: ["perro", "rra", "rre", "rri"],
    ageMin: 5
  },
  {
    id: "son-s",
    phoneme: "s",
    pureSound: "s",
    praxiaKey: "s",
    anchorWord: "Sol",
    icon: "☀️",
    soundCue: "Como Sol ☀️",
    syllables: ["Sa", "Se", "Si", "Sol"],
    acceptableTargets: ["sol", "sa", "se", "si"],
    ageMin: 3
  },
  {
    id: "son-l",
    phoneme: "l",
    pureSound: "l",
    praxiaKey: "l",
    anchorWord: "Luna",
    icon: "🌙",
    soundCue: "Como Luna 🌙",
    syllables: ["La", "Le", "Li", "Lu"],
    acceptableTargets: ["luna", "la", "le", "li", "lu"],
    ageMin: 3
  },
  {
    id: "son-k",
    phoneme: "k",
    pureSound: "k",
    praxiaKey: "k",
    anchorWord: "Casa",
    icon: "🏠",
    soundCue: "Como Casa 🏠",
    syllables: ["Ca", "Que", "Qui", "Co"],
    acceptableTargets: ["casa", "ca", "que", "qui", "co"],
    ageMin: 3
  },
  {
    id: "son-p",
    phoneme: "p",
    pureSound: "p",
    praxiaKey: "p",
    anchorWord: "Pato",
    icon: "🦆",
    soundCue: "Como Pato 🦆",
    syllables: ["Pa", "Pe", "Pi", "Po"],
    acceptableTargets: ["pato", "pa", "pe", "pi", "po"],
    ageMin: 3
  },
  {
    id: "son-pl",
    phoneme: "pl",
    clusterGroup: "clusters",
    pureSound: "l",
    praxiaKey: "l",
    anchorWord: "Plátano",
    icon: "🍌",
    soundCue: "Como Plátano 🍌",
    syllables: ["Pla", "Ple", "Pli", "Plo"],
    acceptableTargets: ["platano", "plátano", "pla", "ple", "pli"],
    ageMin: 4
  },
  {
    id: "son-tr",
    phoneme: "tr",
    clusterGroup: "clusters",
    pureSound: "r",
    praxiaKey: "r",
    anchorWord: "Tren",
    icon: "🚂",
    soundCue: "Como Tren 🚂",
    syllables: ["Tra", "Tre", "Tri", "Tren"],
    acceptableTargets: ["tren", "tra", "tre", "tri"],
    ageMin: 5
  }
];

const POSITION_FRIENDLY_LABELS = {
  I: "Al inicio",
  M: "Al medio",
  F: "Al final"
};

const PHONEME_AGE_MIN = {
  p: 3, b: 3, k: 3, d: 3, f: 3, g: 3,
  s: 4, l: 4,
  r: 5, rr: 5, pl: 5, tr: 5, gl: 5
};

/* Etapa 3 Van Riper: Palabras Mágicas conectadas directamente al banco Bosch & Melgar */
const PALABRAS_MAGICAS_DATA = BOSCH_MELGAR_BANK.map((item, idx) => {
  const isCluster = ["pl", "tr", "gl", "fl", "dr"].includes(item.phoneme);
  const praxiaMap = { pl: "l", tr: "r", gl: "l", g: "k", b: "p", d: "l", f: "s" };
  return {
    id: `pal-${idx + 1}`,
    word: item.word,
    phoneme: item.phoneme,
    clusterGroup: isCluster ? "clusters" : item.phoneme,
    praxiaKey: praxiaMap[item.phoneme] || item.phoneme,
    pos: item.pos,
    posLabel: POSITION_FRIENDLY_LABELS[item.pos] || "Palabra",
    icon: item.icon,
    syllables: item.syllables,
    ageMin: PHONEME_AGE_MIN[item.phoneme] || 4
  };
});

const RIMAS_DATA = [
  {
    id: "rima-1",
    baseWord: "Botón",
    baseIcon: "🔘",
    rhymeEnding: "-ón",
    options: [
      { word: "Ratón", icon: "🐭", correct: true },
      { word: "Casa", icon: "🏠", correct: false },
      { word: "Mesa", icon: "🪑", correct: false }
    ],
    fullRhyme: "¡Un ratón chiquitón se escondió en mi botón!"
  },
  {
    id: "rima-2",
    baseWord: "Gato",
    baseIcon: "🐱",
    rhymeEnding: "-ato",
    options: [
      { word: "Pato", icon: "🦆", correct: true },
      { word: "Sol", icon: "☀️", correct: false },
      { word: "Luna", icon: "🌙", correct: false }
    ],
    fullRhyme: "¡El gato con zapatos juega con el pato!"
  },
  {
    id: "rima-3",
    baseWord: "Estrella",
    baseIcon: "⭐",
    rhymeEnding: "-ella",
    options: [
      { word: "Botella", icon: "🍾", correct: true },
      { word: "Flor", icon: "🌸", correct: false },
      { word: "Tren", icon: "🚂", correct: false }
    ],
    fullRhyme: "¡La estrella dorada es la más bella botella!"
  }
];

const ADIVINANZAS_DATA = [
  {
    id: "adiv-1",
    riddleText: "Tengo una melena grande, soy muy veloz y rujo fuerte en la selva... ¿Quién soy?",
    answerWord: "León",
    answerIcon: "🦁",
    phoneme: "l",
    clue: "Su nombre empieza igual que Luna."
  },
  {
    id: "adiv-2",
    riddleText: "Vuelo de flor en flor haciendo zumbidos y preparo rica miel... ¿Quién soy?",
    answerWord: "Abeja",
    answerIcon: "🐝",
    phoneme: "b",
    clue: "Su nombre empieza con A, como avión."
  },
  {
    id: "adiv-3",
    riddleText: "Tengo orejas muy largas, salto muy alto y me gusta comer zanahoria... ¿Quién soy?",
    answerWord: "Conejo",
    answerIcon: "🐰",
    phoneme: "k",
    clue: "Su nombre empieza igual que Casa."
  }
];

const CARRERA_DATA = [
  { step: 1, word: "Plátano", icon: "🍌", phoneme: "pl" },
  { step: 2, word: "Globo", icon: "🎈", phoneme: "gl" },
  { step: 3, word: "Tren", icon: "🚂", phoneme: "tr" },
  { step: 4, word: "Flor", icon: "🌸", phoneme: "fl" },
  { step: 5, word: "Dragón", icon: "🐉", phoneme: "dr" }
];

const BINGO_DATA = [
  {
    targetSound: "s",
    targetWord: "Sol",
    instruction: "¡Encuentra la tarjeta que empieza con el sonido de Sol!",
    cards: [
      { word: "Sol", icon: "☀️", phoneme: "s", correct: true },
      { word: "Fresa", icon: "🍓", phoneme: "f", correct: false },
      { word: "Gato", icon: "🐱", phoneme: "g", correct: false },
      { word: "Luna", icon: "🌙", phoneme: "l", correct: false }
    ]
  },
  {
    targetSound: "r",
    targetWord: "Ratón",
    instruction: "¡Encuentra la tarjeta que empieza con el sonido de Ratón!",
    cards: [
      { word: "Pato", icon: "🦆", phoneme: "p", correct: false },
      { word: "Ratón", icon: "🐭", phoneme: "r", correct: true },
      { word: "Bota", icon: "👢", phoneme: "b", correct: false },
      { word: "Casa", icon: "🏠", phoneme: "k", correct: false }
    ]
  }
];

window.SpeechGamesData = {
  BOSCH_MELGAR_BANK,
  SONIDOS_SILABAS_DATA,
  PALABRAS_MAGICAS_DATA,
  TRABALENGUAS_DATA,
  RIMAS_DATA,
  ADIVINANZAS_DATA,
  CARRERA_DATA,
  BINGO_DATA
};
