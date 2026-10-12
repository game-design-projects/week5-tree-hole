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

// Answer a message all the way through: the given option first (with an optional card), then,
// if the conversation continues, the follow-up answers that match the first answer's stance.
export function reply(s, msgId, optId, card = null) {
  const first = E.pendingMessages(s).find((m) => m.id === msgId);
  const stance = first.options.find((o) => o.id === optId).stance;
  let r = E.choose(s, msgId, optId, card);
  s = r.state;
  let guard = 0;
  while (!r.outcome.done && guard++ < 6) {
    const msg = E.pendingMessages(s).find((m) => m.id === msgId);
    const opt = msg.options.find((o) => o.stance === stance) ?? msg.options[0];
    r = E.choose(s, msgId, opt.id);
    s = r.state;
  }
  return s;
}

// Reply to every waiting message with the option whose stance matches `pick`
// (a stance name, or a function(msg) → option id). Returns the final state.
// Reply to every waiting message with the option whose stance matches `pick`
// (a stance name, or a function(msg) → option id). Returns the final state.
export function playNight(s, pick) {
  let guard = 0;
  while (s.phase === 'play' && guard++ < 60) {
    const msg = E.pendingMessages(s)[0];
    if (!msg.options.length) { s = E.witness(s, msg.id).state; continue; }
    const opt = typeof pick === 'function' ? pick(msg) : msg.options.find((o) => o.stance === pick) ?? msg.options[0];
    s = reply(s, msg.id, typeof opt === 'string' ? opt : opt.id);
  }
  return s;
}

export function playThrough(pick, nights = 7) {
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

// A player described by a stance per night (e.g. ['warn','warn','ask',…]) and whether they spend
// clue cards. Answers first whatever would teach them the most new clues (then whatever expires
// first); silent messages are simply read. `overrides` maps message id → option id.
export function styledPlayer(stances, { cards = true, overrides = {}, nights = 7, first = null } = {}) {
  let s = E.startNight(E.newGame());
  for (let n = 1; n <= nights; n += 1) {
    const stance = typeof stances === 'string' ? stances : stances[n - 1];
    let guard = 0;
    while (s.phase === 'play' && guard++ < 60) {
      const worth = (m) => {
        if (!cards || !m.options.length) return 0;
        const o = m.options.find((x) => x.stance === stance) ?? m.options[0];
        const gain = [...(m.facts ?? []), ...(o.facts ?? [])].filter((f) => CLUES.has(f) && !E.heldFact(s, f)).length;
        const spend = s.facts.some((f) => CLUES.has(f.id) && m.carry?.[f.id] && !(s.delivered[f.id] ?? []).length) ? 1 : 0;
        return gain * 2 + spend;
      };
      const pend = E.pendingMessages(s);
      const pinned = first ? pend.find((m) => m.npc === first) : null;
      const msg = pinned ?? [...pend].sort((a, b) => worth(b) - worth(a) || (a.expiresMin ?? 9e9) - (b.expiresMin ?? 9e9))[0];
      if (!msg.options.length) { s = E.witness(s, msg.id).state; continue; }
      const opt = msg.options.find((o) => o.id === overrides[msg.id]) ?? msg.options.find((o) => o.stance === stance) ?? msg.options[0];
      const card = cards ? s.facts.map((f) => f.id).find((id) => CLUES.has(id) && msg.carry?.[id] && !(s.delivered[id] ?? []).length) ?? null : null;
      s = reply(s, msg.id, opt.id, card);
    }
    s = E.endNight(s);
    if (s.phase === 'intro') s = E.startNight(s);
  }
  return s;
}

export const carefulPlayer = (_s, nights = 7, opts = {}) => styledPlayer(opts.stance ?? 'warn', { cards: opts.cards ?? true, nights });
