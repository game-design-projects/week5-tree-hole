// Every tunable in one place. The engine reads only from here; content files
// carry per-message effects. APP_VERSION must equal package.json (tested).

export const APP_VERSION = '0.3.0';
export const SAVE_KEY = 'tree-hole-save-v2';

export const LAST_NIGHT = 7;
// The playable slice stops after this night until later nights are written.
export const PLAYABLE_NIGHTS = 3;

// The clock: a night runs 22:00 → 06:00. Each reply spends TICK minutes.
export const NIGHT_START = 22 * 60;
export const NIGHT_END = 30 * 60; // 06:00 next morning, in minutes since 00:00 of the night's date
export const TICK = 40;

export const NIGHT_DATES = ['Mon 22 Oct', 'Tue 23 Oct', 'Wed 24 Oct', 'Thu 25 Oct', 'Fri 26 Oct', 'Sat 27 Oct', 'Sun 28 Oct'];

// ------------------------------------------------------------ the map

// Zone state ladder. A zone's level is how far the illness has got there.
export const LEVELS = ['quiet', 'rumour', 'unwell', 'quarantined', 'overrun'];
export const OVERRUN = 4;

// Distance of each zone from the Institute along the road west (0 = source).
export const ZONES = {
  institute: { name: 'Institute', side: 'east', dist: 0, x: 92, y: 62 },
  millside: { name: 'Millside', side: 'east', dist: 0, x: 92, y: 138 },
  quarry: { name: 'Quarry Road', side: 'east', dist: 1, x: 180, y: 178 },
  bridge: { name: 'Old Bridge', side: 'river', dist: 2, x: 236, y: 112 },
  centre: { name: 'Centre', side: 'west', dist: 3, x: 296, y: 138 },
  chapel: { name: 'Chapel Lane', side: 'west', dist: 4, x: 366, y: 98 },
  allotments: { name: 'Allotments', side: 'west', dist: 4, x: 366, y: 178 },
  hills: { name: 'North Hills', side: 'hills', dist: 5, x: 316, y: 34 },
};

// Spread pressure per night, left alone. A zone's level is pressure − dist,
// clamped to 0…4. Pressure jumps after night 4 if nobody has stopped it.
export const PRESSURE = [0, 1, 2, 3, 5, 8, 10];

// Where each cast member lives (their dot starts here). When they are
// infected the dot turns red and drifts one step toward the next zone west
// each night after they turn.
export const HOME = { ty: 'millside', charles: 'institute', megan: 'centre', amelia: 'chapel', tomas: 'bridge', ana: 'hills' };
export const WANDER = ['institute', 'millside', 'quarry', 'bridge', 'centre', 'chapel', 'hills'];

// The cast is infected (and stops writing) the night their zone is overrun,
// unless a flag has protected them.
export const INFECT_AT = OVERRUN;

// ------------------------------------------------------------ the truth

// Clue cards are the chain that explains what happened at the Institute.
// Dawn Shift needs DAWN_CLUES of them delivered to the right people by
// the end of night DAWN_BY.
export const CLUE_TOTAL = 12;
export const DAWN_CLUES = 8;
export const DAWN_BY = 4;

export const SIGNS = [
  { n: 1, label: 'Cold hands, a fever that won’t break' },
  { n: 2, label: 'Won’t sleep, won’t stop' },
  { n: 3, label: 'Won’t eat' },
  { n: 4, label: 'Repeats words, loses words' },
  { n: 5, label: 'Drawn to light and noise' },
  { n: 6, label: 'Goes quiet, then walks' },
];
