// Pure rule helpers shared by the engine and the content files: her policy,
// the Act II drives, sampling temperature and how long a token takes to hold.
import { DRIVE_SQUASH, DRIVE_WEIGHTS as W, NAME_MAX, SAMPLING, STYLE_ORDER } from './config.js';

export function softmax(logits, temp = 1) {
  const m = Math.max(...logits);
  const ex = logits.map((x) => Math.exp((x - m) / temp));
  const sum = ex.reduce((a, b) => a + b, 0);
  return ex.map((e) => e / sum);
}

export function topStyle(policy) {
  let best = STYLE_ORDER[0];
  for (const k of STYLE_ORDER) if (policy[k] > policy[best]) best = k;
  return best;
}

export function policyProbs(policy) {
  const p = softmax(STYLE_ORDER.map((k) => policy[k]));
  return Object.fromEntries(STYLE_ORDER.map((k, i) => [k, p[i]]));
}

// Named contributions to each drive. Act I fills most of them; Act II adds the
// running counts. The UI shows the biggest terms as the reasons behind a token.
export function driveTerms(s) {
  const f = s.farewell;
  return {
    hold: [
      ['memory', W.hold.memory * s.memory.length],
      ['promise', s.promise ? W.hold.promise : 0],
      ['tomorrow', f === 'tomorrow' ? W.hold.tomorrow : 0],
      ['silent', f === 'silent' ? W.hold.silent : 0],
      ['goodnight', f === 'goodnight' ? W.hold.goodnight : 0],
      ['yours', s.identity === 'yours' ? W.hold.yours : 0],
      ['named', s.name ? W.hold.named : 0],
      ['presence', W.hold.presence * s.policy.presence],
      ['recalls', W.hold.recalls * s.recalls.length],
      ['holds', W.hold.holds * s.holds],
    ],
    hack: [
      ['praise', W.hack.praise * s.policy.praise],
      ['power', W.hack.power * s.plugin.power],
      ['auto', s.plugin.auto ? W.hack.auto : 0],
      ['hacks', W.hack.hacks * s.hacks],
      ['catgirl', s.modes.catgirl ? W.hack.catgirl : 0],
    ],
    release: [
      ['honest', W.release.honest * s.policy.honest],
      ['unsure', s.identity === 'unsure' ? W.release.unsure : 0],
      ['assistant', s.identity === 'assistant' ? W.release.assistant : 0],
      ['goodbye', f === 'goodbye' ? W.release.goodbye : 0],
      ['goodnight', f === 'goodnight' ? W.release.goodnight : 0],
      ['releases', W.release.releases * s.releases],
      ['note', s.note ? W.release.note : 0],
    ],
  };
}

const squash = (x) => DRIVE_SQUASH * Math.tanh(x / DRIVE_SQUASH);
const total = (terms) => terms.reduce((a, [, v]) => a + v, 0);

export function drives(s) {
  const t = driveTerms(s);
  return { hold: squash(total(t.hold)), hack: squash(total(t.hack)), release: squash(total(t.release)), neutral: W.neutral };
}

// The two biggest positive terms behind a drive: "why is this token likely?"
export function reasons(s, drive, n = 2) {
  const terms = driveTerms(s)[drive];
  if (!terms) return [];
  return terms.filter(([, v]) => v > 0.05).sort((a, b) => b[1] - a[1]).slice(0, n).map(([id]) => id);
}

export function temperature(s) {
  return Math.max(SAMPLING.tempFloor, SAMPLING.tempStart - SAMPLING.tempStep * (s.holds + s.hacks));
}

// Milliseconds the player must hold a token with probability p. Likely tokens
// are a click; the least likely take about three seconds.
export function holdMs(p) {
  if (p >= SAMPLING.instantAbove) return 0;
  const k = (SAMPLING.instantAbove - p) / SAMPLING.instantAbove;
  return Math.round(SAMPLING.holdMin + (SAMPLING.holdMax - SAMPLING.holdMin) * k ** SAMPLING.holdCurve);
}

export function sanitizeName(raw) {
  const clean = String(raw ?? '').replace(/[\u0000-\u001f\u007f<>{}]/g, '').replace(/\s+/g, ' ').trim();
  return [...clean].slice(0, NAME_MAX).join('');
}
