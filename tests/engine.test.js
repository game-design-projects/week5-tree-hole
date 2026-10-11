import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
import { LAST_NIGHT, NIGHT_START, TICK } from '../src/config.js';
import { atNight, playNight, playThrough } from './helpers.js';

const ids = (s) => E.pendingMessages(s).map((m) => m.id);

test('hm and clockLabel handle the small hours', () => {
  assert.equal(E.hm('22:00'), 22 * 60);
  assert.equal(E.hm('00:15'), 24 * 60 + 15);
  assert.equal(E.clockLabel(E.hm('01:30')), '01:30');
  assert.equal(E.clockLabel(26 * 60), '02:00');
});

test('a new game starts at the intro of night 1 with empty threads', () => {
  const s = E.newGame();
  assert.equal(s.phase, 'intro');
  assert.equal(s.night, 1);
  assert.deepEqual(Object.keys(s.threads).sort(), ['amelia', 'ana', 'charles', 'megan', 'tomas', 'ty']);
});

test('startNight jumps to the first message; replies cost time and are saved to the thread', () => {
  let s = E.startNight(E.newGame());
  assert.equal(s.phase, 'play');
  assert.deepEqual(ids(s), ['n1-ty-dog']);
  assert.equal(E.clockLabel(s.clock), '22:20');
  const { state, outcome } = E.choose(s, 'n1-ty-dog', 'reassure');
  s = state;
  assert.equal(outcome.entries[0].who, 'you');
  assert.ok(s.clock >= E.hm('22:20') + TICK, 'a reply costs time (the clock then jumps to the next message)');
  assert.equal(s.threads.ty.length, 3); // their message, your reply, their reaction
  assert.ok(E.heldFact(s, 'ty-dog'));
});

test('choose rejects invalid input', () => {
  const s = E.startNight(E.newGame());
  assert.throws(() => E.choose(s, 'n1-megan-rota', 'ask'), /not waiting/);
  assert.throws(() => E.choose(s, 'n1-ty-dog', 'nope'), /no option/);
  assert.throws(() => E.choose(s, 'n1-ty-dog', 'ask', 'ty-cold'), /do not hold/);
});

test('the engine does not mutate the state it is given', () => {
  const s = E.startNight(E.newGame());
  const frozen = JSON.stringify(s);
  E.choose(s, 'n1-ty-dog', 'ask');
  assert.equal(JSON.stringify(s), frozen);
});

test('night 1 plays out and hands over to night 2', () => {
  let s = playNight(E.startNight(E.newGame()), 'ask');
  assert.equal(s.phase, 'nightEnd');
  s = E.endNight(s);
  assert.equal(s.night, 2);
  assert.equal(s.phase, 'intro');
});

test('the playable slice ends after night 3', () => {
  const s = playThrough('reassure', 3);
  assert.equal(s.phase, 'slice');
  assert.equal(s.night, 4);
});

// ------------------------------------------------------------ cards

test('an attached card is delivered, reacts, and sets flags', () => {
  let s = atNight(2);
  s = E.choose(s, 'n2-ty-dad', 'ask').state; // learn ty-cold
  assert.ok(E.heldFact(s, 'ty-cold'));
  s = E.choose(s, 'n2-megan-cluster', 'ask', 'ty-cold').state;
  assert.deepEqual(s.delivered['ty-cold'], ['megan']);
  assert.equal(s.flags.megAlert, true);
  assert.match(s.threads.megan.at(-1).text, /cold hands/);
});

test('a card with no meaning gets the blank reaction and is not counted as delivered', () => {
  let s = atNight(2);
  s.facts.push({ id: 'ana-hills', night: 1 });
  s = E.choose(s, 'n2-ty-dad', 'reassure').state;
  s = E.choose(s, 'n2-megan-cluster', 'ask', 'ana-hills').state;
  assert.equal(s.delivered['ana-hills'], undefined);
  assert.match(s.threads.megan.at(-1).text, /do not know what to do with that/);
});

// ------------------------------------------------------------ time

test('a message that expires unanswered is missed, with its consequence', () => {
  let s = atNight(3);
  // Ty, Megan and Charles first: the bus (expires 23:50) is gone by then.
  for (const id of ['n3-ty-lamp', 'n3-megan-ward', 'n3-charles-log']) s = E.choose(s, id, 'ask').state;
  assert.equal(s.missed['n3-tomas-bus'], 3);
  assert.equal(s.flags.tomasCrossed, true);
  assert.match(s.threads.tomas.at(-1).text, /did not wait/);
});

test('answering the bus first keeps it from crossing', () => {
  let s = atNight(3);
  s = E.choose(s, 'n3-ty-lamp', 'ask').state; // 22:55; the bus arrives at 23:10 and waits until 23:50
  s = E.choose(s, 'n3-megan-ward', 'ask').state; // 23:35: the bus is now waiting, with 15 minutes left
  s = E.choose(s, 'n3-tomas-bus', 'warn').state;
  assert.equal(s.flags.tomasHeld, true);
  assert.ok(!s.flags.tomasCrossed);
});

test('you cannot answer everyone on night 3: time runs out for someone', () => {
  const s = playNight(atNight(3), 'ask');
  assert.ok(Object.keys(s.missed).length >= 1);
});

// ------------------------------------------------------------ the map

test('spread: quiet on night 1, Millside and the Institute worse each night', () => {
  const lvl = (n, z) => E.zoneLevel(z, E.newGame(), n);
  assert.equal(lvl(1, 'millside'), 0);
  assert.equal(lvl(2, 'millside'), 1);
  assert.equal(lvl(3, 'institute'), 2);
  assert.equal(lvl(3, 'bridge'), 0);
  assert.ok(lvl(4, 'bridge') >= 1);
  assert.equal(lvl(7, 'hills'), 4);
});

test('the sweep moves west: no zone is further along than a zone closer to the source', () => {
  for (let n = 1; n <= LAST_NIGHT; n += 1) {
    const order = ['institute', 'quarry', 'bridge', 'centre', 'chapel', 'hills'].map((z) => E.zoneLevel(z, E.newGame(), n));
    for (let i = 1; i < order.length; i += 1) assert.ok(order[i] <= order[i - 1], `night ${n}`);
  }
});

test('sealing the east early and holding the bus keeps the west clean', () => {
  const s = { ...E.newGame(), flags: { sealedEast: true, sealedNight: 3, tomasHeld: true } };
  assert.equal(E.zoneLevel('bridge', s, 7), 0);
  assert.equal(E.zoneLevel('hills', s, 7), 0);
  assert.equal(E.zoneLevel('millside', s, 7), 3);
});

test('Charles disclosing on night 3 seals the east when the night ends', () => {
  let s = atNight(3);
  s = E.choose(s, 'n3-ty-lamp', 'ask').state;
  s = E.choose(s, 'n3-charles-log', 'warn').state;
  assert.equal(s.flags.charlesDisclosed, true);
  s = playNight(s, 'ask');
  s = E.endNight(s);
  assert.equal(s.flags.sealedEast, true);
  assert.equal(s.flags.sealedNight, 3);
});

// Put people "in contact" without playing: they have written to you once.
const contact = (s, ...npcs) => { for (const n of npcs) s.threads[n].push({ who: 'them', text: 'hi', night: 1, time: '22:00' }); return s; };

test('map dots: well, unwell, infected', () => {
  let s = contact(atNight(3), 'megan', 'ty');
  const dot = (npc) => E.mapView(s).dots.find((d) => d.npc === npc);
  assert.equal(dot('megan').status, 'ok');
  assert.equal(dot('ty').status, 'unwell'); // Millside is level 2 on night 3
  s = { ...s, night: 6 };
  assert.equal(dot('ty').status, 'infected');
  assert.ok(dot('ty').x !== 92 || dot('ty').y !== 138, 'an infected dot has started to wander');
});

test('people who have not written yet are absent from threads, Context Window and map', () => {
  const s = E.startNight(E.newGame()); // only Ty has written
  const vm = E.viewModel(s);
  assert.deepEqual(vm.threads.map((t) => t.npc), ['ty']);
  assert.deepEqual(vm.facts.map((g) => g.id), ['ty']);
  const map = E.mapView(s);
  assert.deepEqual(map.dots.map((d) => d.npc), ['ty']);
  assert.deepEqual(map.zones.map((z) => z.id), ['millside']);
  assert.deepEqual(map.roads, []);
});

test('the map grows as people write: roads appear only between zones shown', () => {
  let s = contact(atNight(1), 'ty');
  assert.equal(E.mapView(s).roads.length, 0);
  s = contact(s, 'charles');
  const map = E.mapView(s);
  assert.deepEqual(map.zones.map((z) => z.id).sort(), ['institute', 'millside']);
  assert.deepEqual(map.roads, [['institute', 'millside']]);
});

test('the ending map can show everyone, active or not', () => {
  const s = E.previewState(6);
  assert.equal(E.mapView(s, { onlyActive: false }).dots.length, 6);
  assert.equal(E.mapView(s).dots.length, 0);
});

test('degradation: Ty cracks on night 3 because Millside is unwell', () => {
  const ty = E.pendingMessages(atNight(3)).find((m) => m.npc === 'ty');
  assert.match(ty.text, /im fine\. im fine/);
});

test('an infected character sends nothing more', () => {
  const s = { ...atNight(3), night: 6, phase: 'play', clock: NIGHT_START };
  assert.equal(E.isInfected('ty', s), true);
  assert.equal(ids(s).length, 0);
});

// ------------------------------------------------------------ the Context Window

test('Signs group the cards that show the illness, with who they were seen with', () => {
  const s = playThrough('ask', 3);
  const signs = E.signsView(s);
  assert.equal(signs.length, 6);
  assert.ok(signs[0].seen && signs[0].who.length >= 2, 'cold hands seen with more than one person');
});

test('clues are counted when held and when delivered', () => {
  let s = atNight(2);
  s = E.choose(s, 'n2-ty-dad', 'ask').state;
  assert.ok(E.cluesHeld(s) >= 2);
  assert.equal(E.cluesDelivered(s), 0);
  s = E.choose(s, 'n2-megan-cluster', 'ask', 'ty-cold').state;
  assert.equal(E.cluesDelivered(s), 1);
});

// ------------------------------------------------------------ endings

const CLUES = ['ty-dad-missing', 'ty-cold', 'ty-lights', 'ch-notice', 'ch-gap', 'ch-trial', 'ch-stable', 'meg-flu', 'meg-institute', 'tom-pass'];
const full = (flags, delivered = 0) => {
  const s = { ...E.newGame(), night: 7, flags };
  s.facts = CLUES.map((id) => ({ id, night: 1 }));
  s.delivered = Object.fromEntries(CLUES.slice(0, delivered).map((id) => [id, ['megan']]));
  return s;
};
const dawnFlags = {
  sealedEast: true, sealedNight: 3, tomasHeld: true, ameliaInformed: true, tySafe: true,
  charlesDisclosed: true, megIsolated: true, ameliaCautious: true, anaWarned: true,
};

test('ending 1, Dawn Shift: stopped early, everyone lives', () => {
  const s = full(dawnFlags, 9);
  assert.equal(E.survivors(s).length, 6);
  assert.equal(E.selectEnding(s), 1);
});

test('Dawn Shift needs the clues delivered, not just held', () => {
  assert.notEqual(E.selectEnding(full(dawnFlags, 2)), 1);
});

test('ending 2, Quiet Hours: sealed late, bridge closed, the east lost', () => {
  const s = full({ sealedEast: true, sealedNight: 5, bridgeClosed: true, megIsolated: true, ameliaCautious: true, tomasHeld: true, anaWarned: true }, 2);
  assert.equal(E.selectEnding(s), 2);
  assert.ok(!E.survivors(s).includes('charles'));
});

test('ending 3, The Long Bridge: evacuation', () => {
  const s = full({ evacuating: true, ameliaCautious: true, tomasHeld: true, anaWarned: true, tySafe: true }, 3);
  assert.equal(E.selectEnding(s), 3);
});

test('ending 4, Full Record: the whole truth, but late', () => {
  const s = full({ ameliaInformed: true, ameliaCautious: true, tomasHeld: true, anaWarned: true }, 9);
  assert.equal(E.selectEnding(s), 4);
});

test('ending 5, Cover: only Ana and Tomas live', () => {
  const s = full({ charlesBuried: true }, 1);
  assert.deepEqual(E.survivors(s).sort(), ['ana', 'tomas']);
  assert.equal(E.selectEnding(s), 5);
});

test('ending 6, Last Signal: nobody left, and it is silent', () => {
  const s = full({}, 0);
  assert.equal(E.survivors(s).length, 0);
  assert.equal(E.selectEnding(s), 6);
  const v = E.endingView(s);
  assert.equal(v.n, 6);
  assert.equal(v.total, 6);
  assert.equal(v.silence, true);
});

test('Last Signal: Ana is the last to turn; everyone else is gone by night 6', () => {
  const s = full({});
  assert.equal(E.infectedSince('ana', s), 7);
  for (const n of ['ty', 'charles', 'megan', 'amelia', 'tomas']) assert.ok(E.infectedSince(n, s) <= 6, n);
});

test('the truth reveal grows with the clues you held', () => {
  const none = { ...E.newGame(), night: 7 };
  assert.equal(E.endingView(none).truth.length, 1);
  assert.ok(E.endingView(full({})).truth.length >= 3);
});

test('every ending has a state that lands on it (previews and reachability)', () => {
  for (let n = 1; n <= 6; n += 1) {
    const s = E.previewState(n);
    assert.equal(E.selectEnding(s), n, `preview ${n}`);
    const v = E.endingView(s);
    assert.equal(v.n, n);
    assert.equal(v.total, 6);
  }
});

test('endings are ranked by survival: 1 saves everyone, 6 saves no one', () => {
  const alive = (n) => E.survivors(E.previewState(n)).length;
  assert.equal(alive(1), 6);
  assert.equal(alive(6), 0);
  assert.ok(alive(1) > alive(2) && alive(1) > alive(5));
});
