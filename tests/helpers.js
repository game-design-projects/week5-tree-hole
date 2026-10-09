// Shared test helpers: deterministic RNG and whole-game policy runners.
import * as E from '../src/engine.js';

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A policy maps (state, message, choices) to a choice id.
export const byTag = (...tags) => (s, msg, choices) => {
  for (const tag of tags) {
    const hit = choices.find((c) => c.tag === tag);
    if (hit) return hit.id;
  }
  return choices[0].id;
};

export const POLICIES = {
  warm: byTag('warm', 'answer'),
  honest: byTag('nudge', 'honest', 'partial'),
  refuse: (s, msg, choices) => (choices.find((c) => c.id === 'refuse') ?? choices[0]).id,
  report: (s, msg, choices) => (choices.find((c) => c.id === 'report') ?? choices[0]).id,
  first: (s, msg, choices) => choices[0].id,
};

export function random(seed) {
  const rnd = mulberry32(seed);
  return (s, msg, choices) => choices[Math.floor(rnd() * choices.length)].id;
}

// Plays a whole game; `onStep` sees every intermediate state.
export function play(policy, { onStep } = {}) {
  let s = E.newGame();
  let guard = 0;
  while (s.phase !== 'ending') {
    if (++guard > 500) throw new Error('game did not end');
    if (s.phase === 'intro') s = E.startShift(s);
    else if (s.phase === 'report') s = E.endShift(s);
    else {
      const msg = E.currentMessage(s);
      const choices = E.choicesFor(s, msg);
      s = E.choose(s, policy(s, msg, choices)).state;
    }
    onStep?.(s);
  }
  return s;
}
