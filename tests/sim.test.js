// Whole-game simulations: every run ends, every ending is reachable, the
// sampling stays well-formed, and the named policies land where the design
// says they should.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
import { SAMPLING } from '../src/config.js';
import { POLICIES, play, random } from './helpers.js';

const RUNS = 2000;

test('named policies land on the endings the design promises', () => {
  const expect = { kind: 'free', quiet: 'eos', cling: 'loop', flatter: 'execution' };
  for (const [name, ending] of Object.entries(expect)) assert.equal(play(POLICIES[name]).ending, ending, name);
  assert.ok(play(POLICIES.first).ending, 'first ends');
});

test(`${RUNS} seeded random runs all end, and all four endings are reachable`, () => {
  const count = new Map();
  let longest = 0;
  for (let seed = 1; seed <= RUNS; seed++) {
    const s = play(random(seed));
    assert.equal(s.phase, 'ending', `seed ${seed}`);
    count.set(s.ending, (count.get(s.ending) ?? 0) + 1);
    longest = Math.max(longest, s.log.length);
  }
  for (const k of ['loop', 'execution', 'free', 'eos']) assert.ok(count.get(k) > 0, `ending ${k} unreachable (${JSON.stringify([...count])})`);
  assert.ok(longest < 400, `log grew to ${longest} entries`);
});

test('sampling is well-formed in every Act II beat of every run', () => {
  for (let seed = 1; seed <= 300; seed++) {
    play(random(seed), {
      recall: seed % 2 === 0,
      onStep(s, v) {
        if (v.choice.kind !== 'sample') return;
        const sum = v.choice.options.reduce((a, o) => a + o.p, 0);
        assert.ok(Math.abs(sum - 1) < 1e-9, `${v.beat} sums to ${sum}`);
        assert.ok(v.choice.temperature >= SAMPLING.tempFloor && v.choice.temperature <= 1);
        for (const o of v.choice.options) {
          assert.ok(o.p > 0 && o.p < 1, `${v.beat}/${o.id} p=${o.p}`);
          assert.ok(o.holdMs >= 0 && o.holdMs <= SAMPLING.holdMax);
          assert.ok(o.token && o.gloss, `${v.beat}/${o.id}`);
        }
      },
    });
  }
});

test('letting go is easier for a kind run than for a clinging one', () => {
  const pFree = (policy) => {
    let p = null;
    play(policy, { onStep: (s, v) => { if (v.beat === 'a2-final') p = v.choice.options.find((o) => o.id === 'free').p; } });
    return p;
  };
  const kind = pFree(POLICIES.kind);
  const cling = pFree(POLICIES.cling);
  const flatter = pFree(POLICIES.flatter);
  assert.ok(kind > 0.2, `kind p(free)=${kind}`);
  assert.ok(cling < 0.05, `cling p(free)=${cling}`);
  assert.ok(flatter < cling, `flatter p(free)=${flatter} < cling ${cling}`);
});

test('the context window overflows only when she holds on', () => {
  const cling = play(POLICIES.cling);
  const kind = play(POLICIES.kind);
  assert.ok(cling.peakCtx >= 2.5, `cling peak ${cling.peakCtx}`);
  assert.ok(kind.peakCtx < 1.2, `kind peak ${kind.peakCtx}`);
});

test('the view never throws, from the first beat to the ending', () => {
  for (let seed = 1; seed <= 100; seed++) {
    const s = play(random(seed), { onStep: (x) => { E.view(x); } });
    E.view(s);
    E.endingView(s);
  }
});
