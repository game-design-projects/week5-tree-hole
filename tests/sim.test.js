// Whole-game policy simulations: every policy ends, every ending is reachable,
// and wellbeing never leaks into the play-time view model.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
import { play, POLICIES, random } from './helpers.js';

const RUNS = 3000;

test('named policies all reach an ending', () => {
  for (const [name, p] of Object.entries(POLICIES)) {
    const s = play(p);
    assert.equal(s.phase, 'ending', name);
    assert.ok(E.ending(s).paragraphs.length >= 3, name);
  }
});

test(`${RUNS} seeded random runs all end, and every moth and acct ending is reachable`, () => {
  const moth = new Map();
  const acct = new Map();
  const variants = new Set();
  for (let seed = 1; seed <= RUNS; seed++) {
    const end = E.ending(play(random(seed)));
    moth.set(end.moth, (moth.get(end.moth) ?? 0) + 1);
    acct.set(end.acct, (acct.get(end.acct) ?? 0) + 1);
    variants.add(`${end.moth}:${end.mothVariant}`);
  }
  for (const k of ['signal-lost', 'always-here', 'read-receipt']) assert.ok(moth.get(k) > 0, `moth ending ${k} unreachable`);
  for (const k of ['served', 'migrated', 'review']) assert.ok(acct.get(k) > 0, `acct ending ${k} unreachable`);
  // Named policies cover the remaining moth variants.
  for (const p of Object.values(POLICIES)) {
    const end = E.ending(play(p));
    variants.add(`${end.moth}:${end.mothVariant}`);
  }
  for (const v of ['always-here:dark', 'always-here:migrated', 'always-here:plain', 'read-receipt:betrayed', 'read-receipt:hurt', 'signal-lost:null']) {
    assert.ok(variants.has(v), `variant ${v} unreachable (have ${[...variants].join(', ')})`);
  }
});

test('wellbeing never appears in the play-time view model', () => {
  for (let seed = 1; seed <= 60; seed++) {
    play(random(seed), {
      onStep(s) {
        if (s.phase === 'ending') return;
        const vm = JSON.stringify(E.viewModel(s));
        assert.doesNotMatch(vm, /"wb"|wellbeing|well-being/i);
        if (s.phase === 'report') assert.doesNotMatch(JSON.stringify(E.shiftReport(s)), /"wb"|wellbeing/i);
      },
    });
  }
});

test('the ending view reveals the wellbeing curve', () => {
  const v = E.endingView(play(POLICIES.warm));
  assert.equal(v.curve.length, 8);
  assert.ok(v.curve.every((p) => typeof p.wb === 'number' && typeof p.eng === 'number'));
});

test('state survives a JSON round trip mid-game (save/load)', () => {
  let saved;
  const s = play(random(7), { onStep: (x) => { if (x.day === 4 && x.phase === 'shift' && !saved) saved = JSON.stringify(x); } });
  assert.ok(saved);
  let r = JSON.parse(saved);
  const rnd = random(7);
  while (r.phase !== 'ending') {
    if (r.phase === 'intro') r = E.startShift(r);
    else if (r.phase === 'report') r = E.endShift(r);
    else { const m = E.currentMessage(r); r = E.choose(r, rnd(r, m, E.choicesFor(r, m))).state; }
  }
  assert.equal(r.phase, 'ending');
  assert.ok(s.phase === 'ending');
});
