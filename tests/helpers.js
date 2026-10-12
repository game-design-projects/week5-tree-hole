import * as E from '../src/engine.js';

// Start night n with the given flags (earlier nights skipped).
export function atNight(n, flags = {}, extra = {}) {
  const s = { ...E.newGame(), night: n, phase: 'intro', flags: { ...flags }, ...extra };
  return E.startNight(s);
}

// Answer one waiting message with the option `pick` chooses: an option id, a function
// (msg, s) → option id, or a policy name: 'safe' (lowest leak), 'bold' (highest leak).
export function choose(msg, s, pick) {
  if (typeof pick === 'function') return pick(msg, s) ?? msg.options[0].id;
  const by = [...msg.options].sort((a, b) => a.leak - b.leak || a.id.localeCompare(b.id));
  if (pick === 'safe') return by[0].id;
  if (pick === 'bold') return by.at(-1).id;
  return msg.options.find((o) => o.id === pick)?.id ?? by[0].id;
}

// Answer everything until the night ends. Returns the state at nightEnd.
export function playNight(s, pick = 'safe') {
  let guard = 0;
  while (s.phase === 'play' && guard++ < 80) {
    const msg = E.pendingMessages(s)[0];
    s = E.respond(s, msg.id, { optId: choose(msg, s, pick) }).state;
  }
  return s;
}

// Play every night with one policy (or one per night) and land on the ending.
export function playThrough(pick = 'safe', seed = 0) {
  let s = E.startNight(E.newGame(seed));
  for (let guard = 0; guard < 10 && s.phase !== 'ending'; guard += 1) {
    const p = Array.isArray(pick) ? pick[s.night - 1] : pick;
    s = E.endNight(playNight(s, p));
    if (s.phase === 'intro') s = E.startNight(s);
  }
  return s;
}

// A policy that picks, per message, the option whose id is listed for it, else falls back.
export const scripted = (map, fallback = 'safe') => (msg, s) => map[msg.id] ?? choose(msg, s, fallback);
