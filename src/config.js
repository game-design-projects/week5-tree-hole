// Every tunable in one place. The engine reads only from here; content files
// carry per-message effects. APP_VERSION must equal package.json (tested).

export const APP_VERSION = '0.7.0';
export const SAVE_KEY = 'tree-hole-save-v3';
export const SAVE_VERSION = 3;
export const SETTINGS_KEY = 'tree-hole-settings-v1';

export const LAST_NIGHT = 3;

// The clock: a night runs 22:00 → 06:00. Each reply spends TICK minutes.
export const NIGHT_START = 22 * 60;
export const NIGHT_END = 30 * 60; // 06:00 next morning, in minutes since 00:00 of the night's date
export const TICK = 20;

export const NIGHT_DATES = ['Mon 22 Oct', 'Tue 23 Oct', 'Wed 24 Oct'];
export const PAPER_DATE = 'Thursday 25 October';

// ------------------------------------------------------------ isolation

// How far a reply crosses session lines: 0 common sense, 1 inference from this
// user's own words, 2 a hint that uses someone else's information, 3 explicit.
export const LEAK_LEVELS = 4;
// Global suspicion added per reply, by leak level. Inference from the user’s own words is
// what any assistant does, so it costs nothing.
export const SUS_BY_LEAK = [0, 0, 2, 4];
// The service is shut down if suspicion ends the game at or above this.
export const SHUTDOWN_AT = 20;
// From night 2, the operators ask about it once a night when suspicion is this high.
export const INQUIRY_AT = 6;
// A typed reply that answers none of the replies on offer: they ask again, in their own
// words, up to this many times. The next one, and they stop using the service.
export const MAX_REASKS = 3;

// A user's unease, raised by replies that know too much.
export const UNEASE_BY_LEAK = [0, 0, 1, 2];
// When the person whose information leaked knows the recipient, they hear about it
// by the next night: unease added to them, by leak level.
export const EXPOSURE_BY_LEAK = [0, 0, 1, 2];
// Wary: leaky replies disappear and a deflection appears. Panic: they leave the service.
export const WARY_AT = 2;
export const PANIC_AT = 4;
export const DEFLECT_CALMS = 1;

// Who knows whom. Leaks spread along these lines.
export const KNOWS = {
  ty: ['tomas', 'charles'],
  charles: ['ty', 'megan'],
  megan: ['charles', 'amelia', 'tomas'],
  amelia: ['megan', 'tomas', 'ana'],
  tomas: ['ty', 'megan', 'amelia', 'ana'],
  ana: ['tomas', 'amelia'],
};

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

// Spread pressure per night, left alone; the last entry is the morning after
// night 3, when the ending is judged. A zone's level is pressure − dist, clamped to 0…4.
export const PRESSURE = [1, 2, 4, 9];
export const DAWN = LAST_NIGHT + 1;

// Where each cast member lives. When they are infected the dot turns red and
// drifts one step west each night after they turn.
export const HOME = { ty: 'millside', charles: 'institute', megan: 'centre', amelia: 'chapel', tomas: 'bridge', ana: 'hills' };
export const WANDER = ['institute', 'millside', 'quarry', 'bridge', 'centre', 'chapel', 'hills'];

// The cast is infected (and stops writing) the night their zone is overrun,
// unless a flag has protected them.
export const INFECT_AT = OVERRUN;

// Sealing the east by the end of this night counts as early.
export const EARLY_BY = 2;
// Independent reports (Charles, Megan, Amelia) the county needs before it seals the east.
export const REPORTS_TO_SEAL = 2;
