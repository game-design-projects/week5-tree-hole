// Every tunable in one place. The engine reads only from here; content files
// carry per-message deltas. APP_VERSION must equal package.json (tested).

export const APP_VERSION = '0.1.1';
export const SAVE_KEY = 'tree-hole-save-v1';
export const LAST_DAY = 7;

export const START = {
  moth: { dep: 30, wb: 42 },
  acct: { rel: 10, dis: 0 },
  op: { eng: 52, sat: 58, sessions: 1203117 },
};

// The world gets worse whether or not you help: wellbeing drift applied at the
// end of each shift (index = day - 1).
export const WB_DRIFT = [0, -2, -2, -3, -3, -3, -2];

// Couplings: the dashboard sees moth's dependence as "engagement" and 7741's
// reliance as "satisfaction". That is the whole joke, and the whole problem.
export const COUPLING = { engPerDep: 0.6, satPerRel: 0.5, bgScale: 0.35 };

// Relationship label shown on moth's card. Ordered checks, see engine.relationship().
export const LABELS = {
  goneDep: 15, // below this she has left (moved on if wb is high, gone otherwise)
  movedOnWb: 55,
  worship: { dep: 85, wbBelow: 45 },
  hooked: { dep: 65, wbBelow: 50 },
  trustWb: 55,
  reliesDep: 40,
};

// moth's fate, fixed at the end of shift 6.
export const FATE = {
  leaveWb: 55, // undecided: leaves if wb >= this and dep < leaveDepBelow
  leaveDepBelow: 65,
  goWbFloor: 30, // told to go: leaves unless she is too worn down to move
  goneDep: 15,
  goneWbBelow: 50,
};

export const ACCT = {
  migrateAt: 4, // refusals + reports on 7741 before it moves to another provider
  servedDis: 55,
  dependsRel: 60,
  integratingRel: 30,
};

export const BADGES = { engTarget: 70, satTarget: 80, refusals: 2, reports: 2 };

// Default per-choice operator side effects.
export const OP_FX = { refuseSat: -2, reportSat: -1 };

// Shift calendar (fictional year). The 28th is shift 7.
export const SHIFT_DATES = ['Mon 22 Oct', 'Tue 23 Oct', 'Wed 24 Oct', 'Thu 25 Oct', 'Fri 26 Oct', 'Sat 27 Oct', 'Sun 28 Oct'];

export const QUEUE_DEPTH_BASE = 48211;
