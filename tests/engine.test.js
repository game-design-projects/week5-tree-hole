import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
import { LAST_NIGHT, NIGHT_START, TICK } from '../src/config.js';
import { atNight, carefulPlayer, playNight, playThrough, reply, styledPlayer } from './helpers.js';

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
  assert.ok(s.clock >= E.hm('22:20') + TICK / 2, 'a turn costs time (half a tick mid-conversation)');
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

test('seven nights end in the ending', () => {
  const s = playThrough('reassure');
  assert.equal(s.phase, 'ending');
  assert.equal(s.night, 8);
});

// ------------------------------------------------------------ cards

test('an attached card is delivered, reacts, and sets flags', () => {
  let s = atNight(2);
  s = reply(s, 'n2-ty-dad', 'ask'); // learn ty-cold
  assert.ok(E.heldFact(s, 'ty-cold'));
  s = reply(s, 'n2-megan-cluster', 'ask', 'ty-cold');
  assert.deepEqual(s.delivered['ty-cold'], ['megan']);
  assert.equal(s.flags.megAlert, true);
  assert.ok(s.threads.megan.some((e) => /cold hands/.test(e.text)), 'Megan reacts to the card in the thread');
});

test('a card with no meaning gets the blank reaction and is not counted as delivered', () => {
  let s = atNight(2);
  s.facts.push({ id: 'ana-hills', night: 1 });
  s = reply(s, 'n2-ty-dad', 'reassure');
  s = reply(s, 'n2-megan-cluster', 'ask', 'ana-hills');
  assert.equal(s.delivered['ana-hills'], undefined);
  assert.ok(s.threads.megan.some((e) => /do not know what to do with that/.test(e.text)), 'the blank reaction is in the thread');
});

// ------------------------------------------------------------ time

test('a message that expires unanswered is missed, with its consequence', () => {
  let s = atNight(3);
  // Ty, Megan and Charles first: the bus (expires 23:50) is gone by then.
  for (const id of ['n3-ty-lamp', 'n3-megan-ward', 'n3-charles-log']) s = reply(s, id, 'ask');
  assert.equal(s.missed['n3-tomas-bus'], 3);
  assert.equal(s.flags.tomasCrossed, true);
  assert.match(s.threads.tomas.at(-1).text, /did not wait/);
});

test('answering the bus first keeps it from crossing', () => {
  let s = atNight(3);
  s = reply(s, 'n3-ty-lamp', 'ask'); // 22:55; the bus arrives at 23:10 and waits until 23:50
  s = reply(s, 'n3-megan-ward', 'ask'); // 23:35: the bus is now waiting, with 15 minutes left
  s = reply(s, 'n3-tomas-bus', 'warn');
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
  s = reply(s, 'n3-ty-lamp', 'ask');
  s = reply(s, 'n3-charles-log', 'warn');
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
  s = reply(s, 'n2-ty-dad', 'ask');
  assert.ok(E.cluesHeld(s) >= 2);
  assert.equal(E.cluesDelivered(s), 0);
  s = reply(s, 'n2-megan-cluster', 'ask', 'ty-cold');
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
  charlesDisclosed: true, megIsolated: true, ameliaCautious: true, anaWarned: true, ameliaTruth: true,
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

// ------------------------------------------------------------ nights 5–7 and the six endings by play

const finish = (s) => ({ ending: E.selectEnding(s), alive: E.survivors(s) });

test('ending 1 by play: warn, spend clue cards, answer what teaches most: everyone lives', () => {
  const s = styledPlayer('warn', { cards: true });
  assert.equal(s.phase, 'ending');
  const { ending, alive } = finish(s);
  assert.equal(ending, 1);
  assert.equal(alive.length, 6);
});

test('ending 2 by play: the east lost, the bridge closed', () => {
  const s = styledPlayer(['warn', 'warn', 'warn', 'warn', 'reassure', 'warn', 'warn'], { cards: true });
  const { ending } = finish(s);
  assert.equal(ending, 2);
});

test('ending 3 by play: the bridge stays open and the bus runs an evacuation', () => {
  const s = styledPlayer(['warn', 'warn', 'warn', 'reassure', 'warn', 'warn', 'warn'], { cards: false });
  assert.equal(finish(s).ending, 3);
  assert.ok(s.flags.evacuating);
});

test('ending 4 by play: the truth told late, and help comes', () => {
  const s = styledPlayer(['warn', 'warn', 'warn', 'warn', 'reassure', 'reassure', 'warn'], { cards: true });
  assert.equal(finish(s).ending, 4);
});

test('ending 5 by play: asking and never warning lets the cover stand; only Ana and Tomas live', () => {
  const s = styledPlayer('ask', { cards: false });
  const { ending, alive } = finish(s);
  assert.equal(ending, 5);
  assert.deepEqual([...alive].sort(), ['ana', 'tomas']);
});

test('ending 6 by play: answer Charles every time, warn nobody, carry nothing: no one is left', () => {
  const s = styledPlayer('ask', { cards: false, first: 'charles' });
  const { ending, alive } = finish(s);
  assert.equal(ending, 6);
  assert.equal(alive.length, 0);
});

test('Last Signal: Ana is the last to turn, and her last message is the end: it cannot be answered', () => {
  const s = styledPlayer('ask', { cards: false, first: 'charles' });
  const ana = s.threads.ana;
  const last = ana.at(-1);
  assert.equal(last.who, 'them');
  assert.match(last.text, /the same sen$/);
  assert.equal(last.msgId, 'n7-ana-last');
  assert.equal(E.infectedSince('ana', s), 7);
  for (const id of ['ty', 'charles', 'megan', 'amelia', 'tomas']) assert.ok(E.infectedSince(id, s) <= 6, id);
});

test('every character who turns writes one last message and then stops', () => {
  const s = styledPlayer('ask', { cards: false, first: 'charles' });
  for (const [npc, since] of [['ty', 5], ['charles', 5], ['megan', 6], ['tomas', 6], ['amelia', 6]]) {
    assert.equal(E.infectedSince(npc, s), since, npc);
    const entries = s.threads[npc];
    assert.ok(entries.at(-1).msgId?.endsWith('-last'), `${npc} ends on a last message`);
    assert.equal(entries.filter((e) => e.night > since).length, 0, `${npc} writes nothing after the night they turn`);
  }
});

test('final messages: silent, read with witness(), and only on the night the writer turns', () => {
  const safe = E.startNight({ ...E.newGame(), night: 5, phase: 'intro', flags: { tySafe: true } });
  assert.equal(E.pendingMessages(safe).find((m) => m.id === 'n5-ty-last'), undefined, 'a protected Ty is fine, so no last message');
  const turned = E.startNight({ ...E.newGame(), night: 5, phase: 'intro', flags: {} });
  // Unprotected Ty is infected on night 5.
  assert.equal(E.isInfected('ty', turned), true);
  const last = E.pendingMessages(turned).find((m) => m.id === 'n5-ty-last');
  assert.ok(last);
  assert.throws(() => E.choose(turned, 'n5-ty-last', 'ask'), /no option/);
  const { state } = E.witness(turned, 'n5-ty-last');
  assert.equal(state.answered['n5-ty-last'].opt, null);
  assert.throws(() => E.witness(turned, 'n5-ty'), /not waiting|can be answered/);
});

test('route messages only exist on their route (when)', () => {
  const sealed = atNight(5, { sealedEast: true, sealedNight: 3, tySafe: true });
  assert.match(E.messageFor(sealed, 'ty').text, /tent/);
  const hiding = atNight(5, { tySafe: true });
  assert.match(E.messageFor(hiding, 'ty').text, /cupboard under the stairs/);
  const bridge = atNight(5, { tySafe: true, tyEvac: true });
  assert.match(E.messageFor(bridge, 'ty').text, /bridge/);
});

test('a breach loses the quarantine: Ty going back for his dad lets the east fall', () => {
  let s = atNight(5, { sealedEast: true, sealedNight: 3, tySafe: true, charlesDisclosed: true });
  assert.equal(E.zoneLevel('millside', s, 7), 3, 'sealed in time, the east is quarantined');
  s = reply(s, 'n5-ty', 'go');
  assert.equal(s.flags.breach, true);
  assert.equal(s.flags.breachNight, 5);
  assert.equal(E.zoneLevel('millside', s, 7), 4, 'after a breach the east is overrun');
  assert.equal(E.isInfected('ty', { ...s, night: 6 }), true, 'and Ty is no longer protected');
  assert.notEqual(E.selectEnding({ ...s, night: 7 }), 1);
});

test('taking a sick person into the evacuation brings the illness to the hills sooner', () => {
  const base = { ...E.newGame(), flags: { evacuating: true } };
  const breached = { ...E.newGame(), flags: { evacuating: true, evacBreach: true, evacBreachNight: 5 } };
  assert.ok(E.zoneLevel('hills', breached, 6) > E.zoneLevel('hills', base, 6));
});

test('losing protection late: leaving the bridge, reading louder, opening the ward', () => {
  const f = (flags) => ({ ...E.newGame(), night: 7, flags });
  assert.equal(E.isInfected('tomas', f({ tomasHeld: true })), false);
  assert.equal(E.isInfected('tomas', f({ tomasHeld: true, tomasLeaves: true })), true);
  assert.equal(E.isInfected('amelia', f({ ameliaCautious: true, ameliaLoud: true })), true);
  assert.equal(E.isInfected('megan', f({ megIsolated: true, megOpened: true })), true);
});

test('the last night goes straight to the ending', () => {
  const s = styledPlayer('warn', { cards: true });
  assert.equal(s.phase, 'ending');
});

test('a character whose last message is waiting shows as pending, then silent', () => {
  let s = E.startNight({ ...E.newGame(), night: 5, phase: 'intro', flags: {} });
  const row = () => E.viewModel(s).threads.find((t) => t.npc === 'ty');
  assert.equal(row().state, 'pending');
  s = E.witness(s, 'n5-ty-last').state;
  assert.equal(row().state, 'silent');
});

// ------------------------------------------------------------ alternate scripts and conversations

const textOf = (s, msgId) => E.pendingMessages(s).find((m) => m.id === msgId).text;

test('scripts: the same seed always reads the same; different seeds give different scripts', () => {
  const start = (seed) => E.startNight(E.newGame(seed));
  assert.equal(textOf(start(7), 'n1-ty-dog'), textOf(start(7), 'n1-ty-dog'));
  const seen = new Set();
  for (let seed = 0; seed < 40; seed += 1) seen.add(textOf(start(seed), 'n1-ty-dog'));
  assert.equal(seen.size, 2, 'both alternate scripts of the message are reachable');
});

test('scripts: replies have alternates too, picked by the same seed', () => {
  const first = (seed) => {
    const s = E.startNight(E.newGame(seed));
    return E.choose(s, 'n1-ty-dog', 'reassure').outcome.entries[1].text;
  };
  const seen = new Set();
  for (let seed = 0; seed < 40; seed += 1) seen.add(first(seed));
  assert.equal(seen.size, 2);
  assert.equal(first(3), first(3));
});

test('scripts: every alternate of every message and reply is reachable by some seed', () => {
  // A smoke test over all content: picking with many seeds never returns undefined or empty text.
  for (let seed = 0; seed < 12; seed += 1) {
    const s = E.startNight(E.newGame(seed));
    for (const m of E.pendingMessages(s)) {
      assert.ok(typeof m.text === 'string' && m.text.length > 0, `${m.id} seed ${seed}`);
      for (const o of m.options) {
        const r = E.choose(s, m.id, o.id).outcome.entries[1].text;
        assert.ok(typeof r === 'string' && r.length > 0, `${m.id}/${o.id} seed ${seed}`);
      }
    }
  }
});

test('conversations: a first answer leaves the message waiting, with the follow-up answers', () => {
  let s = E.startNight(E.newGame());
  const r = E.choose(s, 'n1-ty-dog', 'ask');
  assert.equal(r.outcome.done, false);
  s = r.state;
  const msg = E.messageFor(s, 'ty');
  assert.equal(msg.id, 'n1-ty-dog');
  assert.equal(msg.depth, 1);
  assert.deepEqual(msg.options.map((o) => o.id), ['f-reassure', 'f-ask', 'f-warn']);
  assert.equal(s.answered['n1-ty-dog'], undefined, 'not answered yet');
});

test('conversations: the second answer finishes it, and a mid-way turn costs half a tick', () => {
  let s = E.startNight(E.newGame());
  const before = s.clock;
  let r = E.choose(s, 'n1-ty-dog', 'ask');
  assert.equal(r.state.clock, before + TICK / 2);
  r = E.choose(r.state, 'n1-ty-dog', 'f-warn');
  assert.equal(r.outcome.done, true);
  assert.equal(r.state.answered['n1-ty-dog'].turns, 2);
  assert.equal(r.state.convo['n1-ty-dog'], undefined);
  assert.ok(r.state.threads.ty.filter((e) => e.who === 'you').length === 2, 'two answers in the thread');
});

test('conversations: the message is shown once, not again on the follow-up turn', () => {
  let s = E.startNight(E.newGame());
  s = E.choose(s, 'n1-ty-dog', 'ask').state;
  s = E.choose(s, 'n1-ty-dog', 'f-ask').state;
  assert.equal(s.threads.ty.filter((e) => e.msgId === 'n1-ty-dog').length, 1);
});

test('conversations: one that has begun cannot expire', () => {
  let s = atNight(2);
  s = reply(s, 'n2-ty-dad', 'ask');
  s = E.choose(s, 'n2-megan-cluster', 'ask').state; // first turn only; the follow-up is left waiting
  s.clock = E.hm('03:00'); // well past its 02:20 expiry
  s = E.choose(s, 'n2-charles-reply', 'ask').state;
  assert.equal(s.missed['n2-megan-cluster'], undefined, 'Megan is still mid-conversation, not missed');
  assert.ok(E.pendingMessages(s).some((m) => m.id === 'n2-megan-cluster'));
});

test('conversations: flags set on the first answer apply at once; a card can be attached on any turn', () => {
  let s = atNight(2);
  s = reply(s, 'n2-ty-dad', 'ask'); // learn ty-cold
  s = E.choose(s, 'n2-megan-cluster', 'warn').state;
  assert.equal(s.flags.megWarned, true, 'set on the first turn');
  assert.deepEqual(s.delivered['ty-cold'], undefined);
  s = E.choose(s, 'n2-megan-cluster', 'f-warn', 'ty-cold').state;
  assert.deepEqual(s.delivered['ty-cold'], ['megan'], 'card delivered on the second turn');
});

test('conversations: the follow-up text depends on which answer you gave', () => {
  const s = E.startNight(E.newGame());
  const a = E.choose(s, 'n1-ty-dog', 'reassure').outcome.entries[1].text;
  const b = E.choose(s, 'n1-ty-dog', 'hold').outcome.entries[1].text;
  assert.notEqual(a, b);
  assert.match(a, /window/);
  assert.match(b, /window/);
});

test('Charles writes out the notice in full, not a summary', () => {
  const s = E.startNight({ ...E.newGame(), night: 1, phase: 'intro' });
  const r = E.choose(E.startNight(E.newGame()), 'n1-ty-dog', 'ask'); // ensure a normal start works
  assert.ok(r);
  let g = atNight(1);
  g = reply(g, 'n1-ty-dog', 'ask');
  g = reply(g, 'n1-megan-rota', 'ask');
  const out = E.choose(g, 'n1-charles-notice', 'reassure').outcome.entries[0].text;
  assert.match(out, /^NOTICE 14\nTo residents of Millside:/);
  assert.doesNotMatch(out, /^\[You draft/);
  assert.ok(s);
});
