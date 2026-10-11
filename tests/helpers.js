import * as E from '../src/engine.js';

// Start night n (assumes earlier nights were skipped with endNight).
export function atNight(n, flags = {}) {
  let s = E.newGame();
  s.flags = { ...flags };
  for (let i = 1; i < n; i += 1) s = { ...s, night: i, phase: 'nightEnd' }, s = E.endNight(s);
  s.night = n;
  s.phase = 'intro';
  return E.startNight(s);
}

// Reply to every waiting message with the option whose stance matches `pick`
// (a stance name, or a function(msg) → option id). Returns the final state.
export function playNight(s, pick) {
  let guard = 0;
  while (s.phase === 'play' && guard++ < 60) {
    const msg = E.pendingMessages(s)[0];
    const opt = typeof pick === 'function' ? pick(msg) : msg.options.find((o) => o.stance === pick) ?? msg.options[0];
    s = E.choose(s, msg.id, typeof opt === 'string' ? opt : opt.id).state;
  }
  return s;
}

export function playThrough(pick, nights = 4) {
  let s = E.startNight(E.newGame());
  for (let n = 1; n <= nights; n += 1) {
    s = playNight(s, pick);
    s = E.endNight(s);
    if (s.phase === 'intro') s = E.startNight(s);
  }
  return s;
}

import { clueIds } from '../src/content/index.js';

const CLUES = new Set(clueIds());

// A careful player: always the Warn-stance reply, answers first whatever would teach
// them the most new clues (then whatever expires first), and spends a card on a
// clue that has not been delivered yet. `cards: false` / `stance` make a careless one.
export function carefulPlayer(s0, nights = 4, { stance = 'warn', cards = true } = {}) {
  let s = E.startNight(E.newGame());
  for (let n = 1; n <= nights; n += 1) {
    let guard = 0;
    while (s.phase === 'play' && guard++ < 60) {
      const worth = (m) => {
        const o = m.options.find((x) => x.stance === stance) ?? m.options[0];
        const gain = [...(m.facts ?? []), ...(o.facts ?? [])].filter((f) => CLUES.has(f) && !E.heldFact(s, f)).length;
        const spend = cards && s.facts.some((f) => CLUES.has(f.id) && m.carry?.[f.id] && !(s.delivered[f.id] ?? []).length) ? 1 : 0;
        return gain * 2 + spend;
      };
      const msg = [...E.pendingMessages(s)].sort((a, b) => worth(b) - worth(a) || (a.expiresMin ?? 9e9) - (b.expiresMin ?? 9e9))[0];
      const opt = msg.options.find((o) => o.stance === stance) ?? msg.options[0];
      const card = cards ? s.facts.map((f) => f.id).find((id) => CLUES.has(id) && msg.carry?.[id] && !(s.delivered[id] ?? []).length) ?? null : null;
      s = E.choose(s, msg.id, opt.id, card).state;
    }
    s = E.endNight(s);
    if (s.phase === 'intro') s = E.startNight(s);
  }
  return s;
}
