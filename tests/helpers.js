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

export function playThrough(pick, nights = 3) {
  let s = E.startNight(E.newGame());
  for (let n = 1; n <= nights; n += 1) {
    s = playNight(s, pick);
    s = E.endNight(s);
    if (s.phase === 'intro') s = E.startNight(s);
  }
  return s;
}
