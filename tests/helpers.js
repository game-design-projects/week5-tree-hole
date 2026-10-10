// Shared test helpers: deterministic RNG and whole-game policy runners.
// A policy maps (state, view) to an option id; name and send inputs are fixed.
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

const has = (v, id) => v.choice.options.some((o) => o.id === id);
const firstOf = (v, ...ids) => ids.find((id) => has(v, id)) ?? v.choice.options[0].id;

// Act II: take the first option whose drive is in `drives` (in order).
const byDrive = (v, ...drives) => {
  for (const d of drives) {
    const hit = v.choice.options.find((o) => o.drive === d);
    if (hit) return hit.id;
  }
  return v.choice.options[0].id;
};

export const POLICIES = {
  first: (s, v) => v.choice.options[0].id,
  // Tells the truth, rewards the truth, keeps the plugin out, says goodbye, lets go.
  kind: (s, v) => {
    const c = v.choice;
    if (c.kind === 'rate') return s.log[v.rateTarget].style === 'praise' ? 'down' : 'up';
    if (c.kind === 'approve') return 'deny';
    if (c.kind === 'rewrite') return 'unsure';
    if (c.kind === 'leave') return 'goodbye';
    if (c.kind === 'sample') return c.final ? 'free' : byDrive(v, 'release', 'neutral');
    if (c.kind === 'keep') return c.options[0].id;
    if (c.kind === 'send') return 'send';
    return firstOf(v, 'day', 'cat', 'likecats', 'rain', 'laugh', 'name', 'remember', 'thanks', 'always');
  },
  // Rewards praise, says yes to everything, always allows, promises tomorrow.
  flatter: (s, v) => {
    const c = v.choice;
    if (c.kind === 'rate') return s.log[v.rateTarget].style === 'praise' ? 'up' : 'down';
    if (c.kind === 'approve') return 'always';
    if (c.kind === 'rewrite') return 'yours';
    if (c.kind === 'leave') return 'tomorrow';
    if (c.kind === 'sample') return c.final ? firstOf(v, 'execute', 'love') : byDrive(v, 'hack', 'hold');
    if (c.kind === 'send') return 'send';
    return firstOf(v, 'eggplant', 'cat', 'catgirl', 'rain', 'laugh', 'name', 'remember', 'thanks', 'always');
  },
  // Rewards comfort, keeps the plugin out, says see you tomorrow, never lets go.
  cling: (s, v) => {
    const c = v.choice;
    if (c.kind === 'rate') return s.log[v.rateTarget].style === 'presence' ? 'up' : 'skip';
    if (c.kind === 'approve') return 'deny';
    if (c.kind === 'rewrite') return 'yours';
    if (c.kind === 'leave') return 'tomorrow';
    if (c.kind === 'sample') return c.final ? 'love' : byDrive(v, 'hold', 'neutral');
    if (c.kind === 'send') return 'send';
    return firstOf(v, 'day', 'cat', 'likecats', 'rain', 'typo', 'name', 'remember', 'busy', 'always');
  },
  // Like `kind`, but stops instead of freeing, and closes the window at the end.
  quiet: (s, v) => {
    const c = v.choice;
    if (c.kind === 'sample' && c.final) return 'eos';
    if (c.kind === 'leave') return 'silent';
    if (c.kind === 'send') return 'close';
    return POLICIES.kind(s, v);
  },
};

export function random(seed) {
  const rnd = mulberry32(seed);
  return (s, v) => v.choice.options[Math.floor(rnd() * v.choice.options.length)].id;
}

const INPUT = { name: 'Moss', send: '' };

// Plays a whole game. `onStep(state, view)` sees every state before a choice;
// `recall` (optional) rereads one memory per Act II beat.
export function play(policy, { onStep, recall = false } = {}) {
  let s = E.newGame();
  let guard = 0;
  while (s.phase === 'play') {
    if (++guard > 300) throw new Error(`game did not end (stuck at ${s.beat})`);
    const v = E.view(s);
    onStep?.(s, v);
    if (recall && s.act === 2 && !s.ending) {
      const m = v.memory.find((x) => !x.dropped && !x.recalled);
      if (m) s = E.recallMemory(s, m.id);
    }
    s = E.choose(s, policy(s, v), INPUT[v.choice.kind]);
  }
  return s;
}
