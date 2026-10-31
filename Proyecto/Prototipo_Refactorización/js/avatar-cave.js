/* ==========================================================================
   AVATAR CAVE & STORE - ROPERO MULTICAPA Y TESOROS DEL BOSQUE SONORO (CUS-05)
   Cumple con: RF-GAM-002, RF-GAM-001, GL-005, RST-ETI-001 (Zero Ads / Zero Compras)
   Sustento: Du et al. (2023) (Pauta 5: Personalización), Saeedi et al. (2024)
   Diseño: 5 ranuras combinables simultáneamente y 12 coleccionables 100% temáticos
           del Bosque Sonoro con alta visibilidad silueteada.
   ========================================================================== */

const AVATAR_SLOTS = [
  { id: 'all',   label: 'Todos',   shortLabel: 'Todos' },
  { id: 'head',  label: 'Cabeza',  shortLabel: 'Cabeza' },
  { id: 'eyes',  label: 'Rostro',  shortLabel: 'Rostro' },
  { id: 'wings', label: 'Alas',    shortLabel: 'Alas' },
  { id: 'neck',  label: 'Capas',   shortLabel: 'Capas' },
  { id: 'hand',  label: 'En Mano', shortLabel: 'Mano' }
];

const AVATAR_ACCESSORIES = [
  /* --- RANURA 1: CABEZA (SOMBREROS Y CORONAS DEL BOSQUE) --- */
  {
    id: 'head-floral-crown',
    slot: 'head',
    slotLabel: 'Cabeza',
    name: 'Corona de Flores',
    price: 6,
    accent: '#EC407A',
    phrase: '¡Huelo a flores frescas de la pradera sonora!'
  },
  {
    id: 'head-acorn-beret',
    slot: 'head',
    slotLabel: 'Cabeza',
    name: 'Boina de Bellota',
    price: 10,
    accent: '#8D5524',
    phrase: '¡Lista para explorar cada rincón del bosque contigo!'
  },
  {
    id: 'head-mushroom-hat',
    slot: 'head',
    slotLabel: 'Cabeza',
    name: 'Sombrero de Setita',
    price: 14,
    accent: '#E53935',
    phrase: '¡Mira mi sombrero mágico de setita roja con lunares!'
  },

  /* --- RANURA 2: ROSTRO Y MIRADA (LENTES TRASLÚCIDOS) --- */
  {
    id: 'eyes-daisy-glasses',
    slot: 'eyes',
    slotLabel: 'Rostro',
    name: 'Gafas de Margarita',
    price: 7,
    accent: '#F48FB1',
    phrase: '¡Mis gafas de margarita hacen brillar todas las palabras!'
  },
  {
    id: 'eyes-explorer-goggles',
    slot: 'eyes',
    slotLabel: 'Rostro',
    name: 'Lentes de Explorador',
    price: 9,
    accent: '#00897B',
    phrase: '¡Con mis lentes de exploradora veo todos los sonidos del bosque!'
  },

  /* --- RANURA 3: ALAS ENCANTADAS --- */
  {
    id: 'wings-monarch',
    slot: 'wings',
    slotLabel: 'Alas',
    name: 'Alas de Mariposa',
    price: 12,
    accent: '#FB8C00',
    phrase: '¡Aleteo con colores de mariposa monarca gracias a ti!'
  },
  {
    id: 'wings-fairy-dew',
    slot: 'wings',
    slotLabel: 'Alas',
    name: 'Alas de Hada del Rocío',
    price: 16,
    accent: '#AB47BC',
    phrase: '¡Mis alitas mágicas de hada brillan con gotitas de luz!'
  },

  /* --- RANURA 4: CUELLO Y CAPAS DE GUARDIÁN --- */
  {
    id: 'neck-headphones',
    slot: 'neck',
    slotLabel: 'Capas',
    name: 'Audífonos del Bosque',
    price: 5,
    accent: '#26A69A',
    phrase: '¡Mis audífonos favoritos para escuchar tu linda voz!'
  },
  {
    id: 'neck-leaf-cape',
    slot: 'neck',
    slotLabel: 'Capas',
    name: 'Capa de Hoja Real',
    price: 13,
    accent: '#2E7D32',
    phrase: '¡Soy la guardiana esmeralda del Bosque Sonoro!'
  },
  {
    id: 'neck-starlight-cape',
    slot: 'neck',
    slotLabel: 'Capas',
    name: 'Capa de Luciérnagas',
    price: 18,
    accent: '#5E35B1',
    phrase: '¡Mi capa nocturna brilla con luciérnagas doradas!'
  },

  /* --- RANURA 5: TESOROS EN MANO (ALTA VISIBILIDAD LATERAL) --- */
  {
    id: 'hand-honey-jar',
    slot: 'hand',
    slotLabel: 'En Mano',
    name: 'Tarrito de Miel',
    price: 5,
    accent: '#FFA000',
    phrase: '¡Qué rica miel dorada para endulzar nuestra voz!'
  },
  {
    id: 'hand-sunflower-wand',
    slot: 'hand',
    slotLabel: 'En Mano',
    name: 'Varita de Girasol',
    price: 11,
    accent: '#FBC02D',
    phrase: '¡Con mi varita de girasol creamos música al hablar!'
  }
];

window.AvatarSlotsData = AVATAR_SLOTS;
window.AvatarAccessoriesData = AVATAR_ACCESSORIES;
