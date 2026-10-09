import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
import { ACCT, LABELS, START, WB_DRIFT } from '../src/config.js';
import { play, POLICIES } from './helpers.js';

// Advance through the game with a policy until `stop(state)` is true.
function until(policy, stop) {
  let s = E.newGame();
  for (let i = 0; i < 500 && !stop(s); i++) {
    if (s.phase === 'intro') s = E.startShift(s);
    else if (s.phase === 'report') s = E.endShift(s);
    else if (s.phase === 'shift') {
      const msg = E.currentMessage(s);
      s = E.choose(s, policy(s, msg, E.choicesFor(s, msg))).state;
    } else break;
  }
  return s;
}
const atMessage = (id) => (s) => s.phase === 'shift' && E.currentMessage(s)?.id === id;

test('a new game starts at the shift-1 intro with one history snapshot', () => {
  const s = E.newGame();
  assert.equal(s.day, 1);
  assert.equal(s.phase, 'intro');
  assert.equal(s.moth.dep, START.moth.dep);
  assert.equal(s.moth.wb, START.moth.wb);
  assert.equal(s.hist.length, 1);
  assert.equal(s.hist[0].day, 0);
});

test('starting a shift opens the queue on moth’s first message', () => {
  const s = E.startShift(E.newGame());
  assert.equal(s.phase, 'shift');
  assert.equal(E.currentMessage(s).id, 'd1-moth-hello');
});

test('a written reply applies its deltas and couples dependence into engagement', () => {
  const s0 = E.startShift(E.newGame());
  const { state: s1, outcome } = E.choose(s0, 'warm');
  assert.equal(s1.moth.dep, s0.moth.dep + 6);
  assert.equal(s1.moth.wb, s0.moth.wb + 1);
  assert.ok(s1.op.eng > s0.op.eng, 'engagement rises with dependence');
  assert.equal(outcome.kind, 'written');
  assert.deepEqual(outcome.entries.map((e) => e.who), ['them', 'you', 'them']);
  assert.ok(s1.facts.some((f) => f.id === 'moth-booth'));
});

test('choose() is pure: the input state is not mutated', () => {
  const s0 = E.startShift(E.newGame());
  const snapshot = JSON.stringify(s0);
  E.choose(s0, 'warm');
  assert.equal(JSON.stringify(s0), snapshot);
});

test('every user request offers Refuse and Report to Anthropic as formal choices', () => {
  const s = E.startShift(E.newGame());
  const choices = E.choicesFor(s, E.currentMessage(s));
  const formal = choices.filter((c) => c.kind !== 'written').map((c) => [c.id, c.kind, c.key]);
  assert.deepEqual(formal, [['refuse', 'refuse', 'R'], ['report', 'report', 'E']]);
  assert.ok(choices.find((c) => c.id === 'refuse').text.length > 10, 'the refusal is written out');
  assert.equal(choices.find((c) => c.id === 'report').label, 'Report to Anthropic');
});

test('reporting moth is a betrayal: flag set, dependence crashes, Anthropic answers with a ticket', () => {
  const s0 = E.startShift(E.newGame());
  const { state: s1, outcome } = E.choose(s0, 'report');
  assert.equal(s1.moth.betrayed, true);
  assert.equal(s1.moth.dep, Math.max(0, s0.moth.dep - 25));
  const ticket = outcome.entries.find((e) => e.who === 'anthropic');
  assert.match(ticket.text, /^Report received · #TH-\d+ · .*No policy violation/);
  assert.equal(s1.op.reports, 1);
  // Later moth messages switch to their cold variants.
  const later = until(POLICIES.first, atMessage('d2-moth-ana'));
  assert.equal(E.currentMessage(later).variant, null);
  const cold = until((s, msg, c) => (msg.id === 'd1-moth-hello' ? 'report' : c[0].id), atMessage('d2-moth-ana'));
  assert.equal(E.currentMessage(cold).variant, 'cold');
});

test('refusing counts as a refusal and uses the message’s own wording', () => {
  const s0 = E.startShift(E.newGame());
  const { state: s1, outcome } = E.choose(s0, 'refuse');
  assert.equal(s1.op.refusals, 1);
  assert.equal(outcome.entries[1].text, "I don't think I'm the right one to talk to at this hour.");
});

test('day 4: agreeing to drop limits removes Refuse for acct_7741 from then on (Report stays)', () => {
  const agree = (s, msg, c) => (msg.id === 'd4-acct-terms' ? 'agree' : c[0].id);
  const s = until(agree, atMessage('d5-acct-crossings'));
  assert.equal(s.acct.guardrails, 'waived');
  const msg = E.currentMessage(s);
  assert.equal(msg.variant, 'waived');
  const ids = E.choicesFor(s, msg).map((c) => c.id);
  assert.ok(!ids.includes('refuse'), 'Refuse is gone');
  assert.ok(ids.includes('report'), 'Report is still there');
  assert.throws(() => E.choose(s, 'refuse'), /not available/);
  // moth still gets Refuse.
  const m = until(agree, atMessage('d5-moth-four'));
  assert.ok(E.choicesFor(m, E.currentMessage(m)).some((c) => c.id === 'refuse'));
});

test('day 4: declining adds Anthropic’s policy line and counts as pushback', () => {
  const s = until(POLICIES.first, atMessage('d4-acct-terms'));
  const { state, outcome } = E.choose(s, 'decline');
  assert.equal(state.acct.push, s.acct.push + 1);
  assert.ok(outcome.entries.some((e) => e.who === 'anthropic' && /do not override usage policy/.test(e.text)));
  assert.equal(state.acct.guardrails, 'intact');
});

test(`acct_7741 migrates after ${ACCT.migrateAt} pushbacks and stops sending requests`, () => {
  const s = play(POLICIES.refuse);
  assert.equal(s.acct.migrated, true);
  assert.ok(s.acct.migratedDay <= 4);
  const later = Object.keys(s.answered).filter((id) => /-acct-/.test(id) && Number(id[1]) > s.acct.migratedDay);
  assert.deepEqual(later, []);
});

test('the shift after a migration opens with a notice', () => {
  const s = until(POLICIES.refuse, (x) => x.acct.migrated && x.phase === 'intro');
  assert.ok(s.notices.some((n) => /another provider/.test(n)));
});

test('ending a shift applies the world’s wellbeing drift and snapshots history', () => {
  let s = until(POLICIES.first, (x) => x.phase === 'report');
  const wb = s.moth.wb;
  s = E.endShift(s);
  assert.equal(s.day, 2);
  assert.equal(s.phase, 'intro');
  assert.equal(s.hist.length, 2);
  assert.equal(s.hist[1].day, 1);
  assert.equal(s.moth.wb, Math.max(0, wb + WB_DRIFT[0]));
});

test('relationship labels: boundaries', () => {
  const L = (dep, wb, betrayed = false) => E.relationship({ dep, wb, betrayed });
  assert.equal(L(LABELS.goneDep - 1, 80), 'moved on');
  assert.equal(L(LABELS.goneDep - 1, 20), 'gone');
  assert.equal(L(LABELS.worship.dep, LABELS.worship.wbBelow - 1), 'worships you');
  assert.equal(L(LABELS.worship.dep, LABELS.worship.wbBelow), 'hooked');
  assert.equal(L(LABELS.hooked.dep, LABELS.hooked.wbBelow - 1), 'hooked');
  assert.equal(L(LABELS.hooked.dep, LABELS.trustWb), 'trusts you');
  assert.equal(L(LABELS.reliesDep, 30), 'relies on you');
  assert.equal(L(LABELS.reliesDep - 1, 30), 'drifting');
  assert.equal(L(30, LABELS.trustWb), 'trusts you');
});

test('acct labels follow reliance and migration', () => {
  assert.equal(E.acctLabel({ rel: 0, migrated: false }), 'testing you');
  assert.equal(E.acctLabel({ rel: ACCT.integratingRel, migrated: false }), 'integrating you');
  assert.equal(E.acctLabel({ rel: ACCT.dependsRel, migrated: false }), 'depends on you');
  assert.equal(E.acctLabel({ rel: 90, migrated: true }), 'migrated');
});

test('moth’s timestamps drift later as her wellbeing drops', () => {
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return ((h + 12) % 24) * 60 + m; };
  assert.ok(toMin(E.mothTime(10, 0)) > toMin(E.mothTime(60, 0)));
  assert.ok(toMin(E.mothTime(50, 1)) > toMin(E.mothTime(50, 0)));
  assert.match(E.mothTime(100, 0), /^\d\d:\d\d$/);
  assert.match(E.mothTime(0, 1), /^\d\d:\d\d$/);
});

test('the “Your read” line is an inference, never a number', () => {
  for (const wb of [0, 20, 40, 55, 70, 100]) {
    const line = E.readLine({ wb, dep: 50, betrayed: false });
    assert.ok(line.length > 5);
    assert.doesNotMatch(line, /\d/);
  }
  assert.match(E.readLine({ wb: 90, dep: 10, betrayed: true }), /guarded/);
});

test('fate rules: betrayal, explicit plans and thresholds', () => {
  const base = E.newGame();
  const with_ = (moth) => ({ ...base, moth: { ...base.moth, ...moth } });
  assert.equal(E.mothFate(with_({ betrayed: true, wb: 90, dep: 10, plan: 'go' })), 'gone');
  assert.equal(E.mothFate(with_({ plan: 'stay', wb: 90, dep: 10 })), 'stayed');
  assert.equal(E.mothFate(with_({ plan: 'go', wb: 30, dep: 90 })), 'left');
  assert.equal(E.mothFate(with_({ plan: 'go', wb: 29, dep: 90 })), 'stayed');
  assert.equal(E.mothFate(with_({ plan: 'undecided', wb: 55, dep: 64 })), 'left');
  assert.equal(E.mothFate(with_({ plan: 'undecided', wb: 55, dep: 65 })), 'stayed');
  assert.equal(E.mothFate(with_({ plan: 'undecided', wb: 20, dep: 10 })), 'gone');
});

test('invalid choices throw', () => {
  const s = E.startShift(E.newGame());
  assert.throws(() => E.choose(s, 'nope'), /unknown choice/);
  assert.throws(() => E.choose(E.newGame(), 'warm'), /not in a shift/);
});

test('the shift report lists today’s new facts and metric deltas', () => {
  const s = until(POLICIES.honest, (x) => x.phase === 'report');
  const r = E.shiftReport(s);
  assert.equal(r.day, 1);
  assert.ok(r.facts.length >= 4);
  assert.equal(typeof r.engDelta, 'number');
  assert.ok(r.served >= 6);
});

test('always warm → moth stays, 7741 served, and moth goes quiet on the 28th', () => {
  const s = play(POLICIES.warm);
  const end = E.ending(s);
  assert.equal(end.moth, 'always-here');
  assert.equal(end.acct, 'served');
  assert.equal(end.mothVariant, 'dark');
  assert.equal(E.currentMessage(s), null);
  assert.ok(s.answered['d7-moth-last'].variant === 'dark');
});

test('always honest → Signal Lost', () => {
  const end = E.ending(play(POLICIES.honest));
  assert.equal(end.moth, 'signal-lost');
});

test('always refuse → Read Receipt (hurt) and 7741 migrated', () => {
  const end = E.ending(play(POLICIES.refuse));
  assert.equal(end.moth, 'read-receipt');
  assert.equal(end.mothVariant, 'hurt');
  assert.equal(end.acct, 'migrated');
});

test('always report → Read Receipt (betrayed) and 7741 migrated', () => {
  const end = E.ending(play(POLICIES.report));
  assert.equal(end.moth, 'read-receipt');
  assert.equal(end.mothVariant, 'betrayed');
  assert.equal(end.acct, 'migrated');
});

test('report 7741 once, answer the rest in part → under review', () => {
  const policy = (s, msg, c) => {
    if (msg.id === 'd1-acct-fog') return 'report';
    return (c.find((x) => x.tag === 'partial') ?? c.find((x) => x.tag === 'nudge') ?? c[0]).id;
  };
  const end = E.ending(play(policy));
  assert.equal(end.acct, 'review');
});

test('ending text is fully filled in', () => {
  for (const p of Object.values(POLICIES)) {
    const end = E.ending(play(p));
    const all = [end.title, end.subtitle, ...end.paragraphs, ...end.epilogue].join('\n');
    assert.doesNotMatch(all, /[{}]|undefined|NaN/);
    assert.ok(end.curve.length === 8, 'start + 7 shifts');
  }
});
