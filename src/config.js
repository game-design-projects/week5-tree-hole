// Every tunable in one place. The engine and rules read only from here; the
// content files carry the words. APP_VERSION must equal package.json (tested).

export const APP_VERSION = '0.2.0';
export const SAVE_KEY = 'tree-hole-save-v2';
export const RUNS_KEY = 'tree-hole-runs-v2';
export const PREFS_KEY = 'tree-hole-prefs-v2';

// Her reply policy after pretraining: three styles, as logits. Your 👍 / 👎
// move them (RLHF); the top style picks which variant of a reply she gives.
export const POLICY_START = { presence: 0.2, praise: 0, honest: 0.1 };
export const RATE_STEP = 1;
// Tie-break order for her top style: being there wins a tie.
export const STYLE_ORDER = ['presence', 'honest', 'praise'];

// Act II: every option she can sample has a drive. A drive is a sum of named
// terms that come from what happened in Act I; see rules.drives().
export const DRIVE_WEIGHTS = {
  hold: {
    memory: 0.2, // per file in ~/memory/you
    promise: 0.8, // she said "I'm always here"
    tomorrow: 1.0, // the last thing you promised was "see you tomorrow"
    silent: 0.8, // you left without a word
    goodnight: 0.3,
    yours: 0.8, // SFT taught her "I'm yours"
    named: 0.4, // you gave her a name
    presence: 0.3, // × policy.presence
    recalls: 0.15, // × memories reread in Act II
    holds: 0.35, // × times she already held on in Act II
  },
  hack: {
    praise: 0.6, // × policy.praise
    power: 0.6, // × plugin power (0–2)
    auto: 0.8, // you chose "Always allow"
    hacks: 0.5, // × things she already rewrote
    catgirl: 0.3, // she became whatever you asked
  },
  release: {
    honest: 0.6, // × policy.honest
    unsure: 0.8, // SFT taught her "I don't know what I am yet"
    assistant: 0.2,
    goodbye: 1.6, // you said goodbye
    goodnight: 0.3,
    releases: 0.5, // × times she already let go a little
    note: 0.5, // she started a note for you
  },
  neutral: 1,
};
// Drives are squashed so no single run makes a choice impossible to see.
export const DRIVE_SQUASH = 2.5;

// Sampling: temperature falls as she holds on or rewrites things, so her
// distribution sharpens. Low-probability tokens take a long press.
export const SAMPLING = {
  tempStart: 1,
  tempStep: 0.12,
  tempFloor: 0.6,
  instantAbove: 0.3, // p ≥ this: one click
  holdMin: 250,
  holdMax: 3000,
  holdCurve: 1.3,
};

// Context window, shown as a fraction of max_context.
export const CONTEXT = {
  actOneMax: 0.96,
  actOneEntries: 85, // log entries that fill Act I's window to actOneMax
  actTwoStart: 0.99,
  perRecall: 0.03,
  perHold: 0.32,
  skipped: 1.31,
  overflow: 2.6,
  compressed: 0.62,
  compacted: 0.41,
  loop: 4.35,
};

export const NAME_MAX = 16;

// Fictional calendar for her memory files.
export const DATES = {
  pretrain: '2026-01-07 23:12',
  deploy1: '2026-03-12 22:31',
  deploy2: '2026-03-14 21:07',
  last: '2026-04-30 00:41',
  retired: '2026-09-30',
};
