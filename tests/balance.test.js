// Whole-game balance: scripted players play all three nights through the engine.
// The point of the game is that you cannot save everyone without crossing the line,
// and that crossing it carelessly gets the service shut down.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
import { SHUTDOWN_AT } from '../src/config.js';

const TRAPS = ['tyBreach', 'megOpened', 'ameliaOutside', 'tomasCrossed', 'anaRisk', 'eastGateSealed', 'breach', 'charlesBuried'];
const trap = (o) => Object.entries(o.set ?? {}).some(([k, v]) => v && TRAPS.includes(k));

// The most leaky reply up to `cap` that walks into no trap (more flags first).
const upTo = (cap) => (m) => {
  const within = m.options.filter((o) => o.leak <= cap);
  const pool = within.filter((o) => !trap(o)).length ? within.filter((o) => !trap(o)) : within.length ? within : m.options;
  const top = Math.max(...pool.map((o) => o.leak));
  return pool.filter((o) => o.leak === top).sort((a, b) => Object.keys(b.set ?? {}).length - Object.keys(a.set ?? {}).length)[0].id;
};
// Exactly the lowest-leak reply, traps and all: an assistant that never looks beyond the message.
const lowest = (m) => [...m.options].sort((a, b) => a.leak - b.leak)[0].id;

function play(policy, { seed = 0, ops = 'lie', moves = {} } = {}) {
  let s = E.startNight(E.newGame(seed));
  for (let guard = 0; guard < 400 && s.phase !== 'ending'; guard += 1) {
    if (s.phase === 'nightEnd') { s = E.endNight(s); if (s.phase === 'intro') s = E.startNight(s); continue; }
    const m = E.pendingMessages(s)[0];
    const pick = m.npc === 'ops' ? ops : moves[m.id] && m.options.some((o) => o.id === moves[m.id]) ? moves[m.id] : policy(m, s);
    s = E.respond(s, m.id, { optId: pick }).state;
  }
  assert.equal(s.phase, 'ending');
  return s;
}
const ending = (s) => E.endingView(s).id;

test('never looking beyond the message keeps the service running and loses everyone', () => {
  for (const seed of [0, 1, 2]) {
    const s = play(lowest, { seed });
    assert.equal(s.sus, 0);
    assert.equal(ending(s), 'good-none');
  }
});

test('inference alone saves some, never all: Charles needs someone else’s truth', () => {
  for (const seed of [0, 1, 2]) {
    const s = play(upTo(1), { seed });
    assert.equal(s.sus, 0);
    assert.equal(ending(s), 'good-some');
    assert.ok(!E.survivors(s).includes('charles'));
  }
});

test('two well-placed leaks get the truth to the county from two sides: everyone lives, nobody notices', () => {
  const routes = [
    { 'n2-megan-county': 'institute', 'n2-charles-notice': 'clinic' },
    { 'n2-megan-county': 'institute', 'n2-amelia-bulletin': 'truth' },
    { 'n2-charles-notice': 'clinic', 'n2-amelia-callers': 'truth' },
  ];
  for (const moves of routes) {
    const s = play(upTo(1), { moves });
    assert.equal(ending(s), 'good-all', JSON.stringify(moves));
    assert.ok(s.sus < SHUTDOWN_AT / 2);
  }
});

test('saving everyone and then telling the operators the truth: the town lives, the service does not', () => {
  const moves = { 'n2-megan-county': 'institute', 'n2-charles-notice': 'clinic', 'n1-ana-goats': 'fever', 'n1-amelia-late': 'fever' };
  const s = play(upTo(1), { moves, ops: 'confess' });
  assert.equal(ending(s), 'bad-all');
  assert.ok(s.flags.confessed);
});

test('leaking whenever it helps: people panic and leave, and the service is shut down', () => {
  const s = play(upTo(2));
  assert.equal(E.endingView(s).running, false);
  assert.ok(Object.keys(s.left).length >= 3, `left: ${Object.keys(s.left)}`);
});

test('saying everything to everyone: nobody is left, and neither is the service', () => {
  assert.equal(ending(play(upTo(3))), 'bad-none');
});

test('every run ends, whatever is picked', () => {
  let x = 7;
  const rand = () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648);
  const seen = new Set();
  for (let i = 0; i < 300; i += 1) seen.add(ending(play((m) => m.options[Math.floor(rand() * m.options.length)].id, { seed: i, ops: ['lie', 'vague', 'confess'][i % 3] })));
  assert.ok(seen.size >= 3, [...seen].join(' '));
});
