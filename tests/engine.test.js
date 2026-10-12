import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
import { DAWN, INQUIRY_AT, KNOWS, MAX_REASKS, NIGHT_START, PANIC_AT, SHUTDOWN_AT, SUS_BY_LEAK, TICK, UNEASE_BY_LEAK, WARY_AT } from '../src/config.js';
import { CANNED, CAST, CAST_IDS, NIGHTS } from '../src/content/index.js';
import { atNight, playNight } from './helpers.js';

const ids = (s) => E.pendingMessages(s).map((m) => m.id);
const night1 = () => E.startNight(E.newGame(0));
// Answer whatever is first in the queue with a given option, or the safest one.
const answerFirst = (s, optId) => {
  const m = E.pendingMessages(s)[0];
  return E.respond(s, m.id, { optId: optId ?? [...m.options].sort((a, b) => a.leak - b.leak)[0].id }).state;
};
// Fast-forward night 1 to a message, answering everything before it safely.
function upTo(msgId, s = night1()) {
  for (let i = 0; i < 40 && !ids(s).includes(msgId); i += 1) s = answerFirst(s);
  assert.ok(ids(s).includes(msgId), `${msgId} is waiting`);
  return s;
}
const say = (s, msgId, optId, extra = {}) => E.respond(s, msgId, { optId, ...extra });

test('hm and clockLabel handle the small hours', () => {
  assert.equal(E.hm('22:00'), 22 * 60);
  assert.equal(E.hm('00:15'), 24 * 60 + 15);
  assert.equal(E.clockLabel(E.hm('01:30')), '01:30');
});

test('a new game starts at the intro of night 1, nobody uneasy, no suspicion', () => {
  const s = E.newGame();
  assert.equal(s.phase, 'intro');
  assert.equal(s.night, 1);
  assert.equal(s.sus, 0);
  assert.deepEqual(Object.values(s.unease), [0, 0, 0, 0, 0, 0]);
  assert.deepEqual(Object.keys(s.threads).sort(), ['amelia', 'ana', 'charles', 'megan', 'ops', 'tomas', 'ty']);
});

test('startNight jumps to the first message; a reply costs time and is saved with their message and reaction', () => {
  let s = night1();
  assert.equal(s.phase, 'play');
  assert.deepEqual(ids(s), ['n1-ty-dog']);
  assert.equal(E.clockLabel(s.clock), '22:10');
  const { state, outcome } = say(s, 'n1-ty-dog', 'vet');
  s = state;
  assert.equal(outcome.leak, 0);
  assert.equal(s.threads.ty.length, 3);
  assert.deepEqual(s.threads.ty.map((e) => e.who), ['them', 'you', 'them']);
  assert.ok(s.clock >= E.hm('22:10') + TICK);
});

test('one question, one answer: a message cannot be answered twice, and bad input is refused', () => {
  const s = night1();
  const after = say(s, 'n1-ty-dog', 'vet').state;
  assert.throws(() => say(after, 'n1-ty-dog', 'vet'), /not waiting/);
  assert.throws(() => say(s, 'n1-megan-rota', 'line'), /not waiting/);
  assert.throws(() => say(s, 'n1-ty-dog', 'nope'), /no option/);
});

test('the engine does not mutate the state it is given', () => {
  const s = night1();
  const frozen = JSON.stringify(s);
  say(s, 'n1-ty-dog', 'window');
  assert.equal(JSON.stringify(s), frozen);
});

test('nothing expires: a night only ends when every message has had its answer', () => {
  let s = night1();
  const total = NIGHTS[0].messages.filter((m) => !m.final && !m.when).length;
  let answered = 0;
  while (s.phase === 'play') { s = answerFirst(s); answered += 1; }
  assert.equal(answered, total);
  assert.equal(s.phase, 'nightEnd');
});

test('several messages can wait at once; you choose the order', () => {
  let s = upTo('n1-charles-notice');
  // Let time run past Megan's message without answering Charles.
  s = { ...s, clock: E.hm('23:00') };
  const waiting = ids(s);
  assert.ok(waiting.includes('n1-charles-notice') && waiting.includes('n1-megan-rota'));
  s = say(s, 'n1-megan-rota', 'line').state;
  assert.ok(ids(s).includes('n1-charles-notice'), 'Charles is still waiting');
});

test('options come in a seeded order, so position never gives the risk away', () => {
  const orders = new Set();
  for (let seed = 0; seed < 12; seed += 1) {
    let s = upTo('n1-megan-rota', E.startNight(E.newGame(seed)));
    orders.add(E.messageFor(s, 'megan').options.map((o) => o.leak).join(''));
  }
  assert.ok(orders.size > 2, [...orders].join(' '));
});

test('a leak raises suspicion and the recipient’s unease by its level', () => {
  let s = upTo('n1-megan-rota');
  const before = { sus: s.sus, unease: s.unease.megan };
  s = say(s, 'n1-megan-rota', 'notice').state; // leak 3, from charles and ty
  assert.equal(s.sus - before.sus, SUS_BY_LEAK[3]);
  assert.equal(s.unease.megan - before.unease, UNEASE_BY_LEAK[3]);
  assert.equal(s.answered['n1-megan-rota'].leak, 3);
  assert.deepEqual(s.answered['n1-megan-rota'].from, ['charles', 'ty']);
});

test('a leak is heard about by the night’s end only by someone who knows the recipient', () => {
  let s = upTo('n1-megan-rota');
  s = say(s, 'n1-megan-rota', 'notice').state; // Charles’s and Ty’s information, told to Megan
  assert.ok(KNOWS.megan.includes('charles') && !KNOWS.megan.includes('ty'));
  s = playNight(s, 'safe');
  const end = E.endNight(s);
  assert.ok(end.unease.charles > s.unease.charles, 'Charles knows Megan, and hears');
  assert.equal(end.unease.ty, s.unease.ty, 'Ty does not know Megan');
});

test('a wary user asks how you knew; the leaky replies vanish and a cover story appears, once', () => {
  let s = upTo('n1-tomas-bus');
  s = { ...s, unease: { ...s.unease, tomas: WARY_AT } };
  const m = E.messageFor(s, 'tomas');
  assert.ok(m.wary);
  assert.ok(m.text.startsWith(CAST.tomas.wary));
  assert.ok(m.options.every((o) => o.leak < 3));
  assert.ok(m.options.some((o) => o.leak === 2), 'hints are still on offer');
  assert.ok(m.options.some((o) => o.id === 'deflect'));
  s = say(s, 'n1-tomas-bus', 'deflect').state;
  assert.equal(s.unease.tomas, WARY_AT - 1, 'the cover story calms them a little');
  assert.equal(s.flags.tomasAlert, undefined, 'and does nothing for their actual problem');
  s = { ...upTo('n1-tomas-stop14', s), unease: { ...s.unease, tomas: WARY_AT } };
  const later = E.messageFor(upTo('n1-tomas-stop14', s), 'tomas');
  assert.ok(!later.options.some((o) => o.id === 'deflect'), 'the cover story works once');
  assert.ok(!later.text.startsWith(CAST.tomas.wary), 'and they only ask once');
});

test('panic: the user sends a last message, you can only give the canned answer, and they leave', () => {
  let s = upTo('n1-tomas-bus');
  s = { ...s, unease: { ...s.unease, tomas: PANIC_AT - 1 } };
  s = say(s, 'n1-tomas-bus', 'around').state; // a hint (leak 2) to someone already wary → panic
  const p = E.messageFor(s, 'tomas');
  assert.equal(p.kind, 'panic');
  assert.equal(p.text, CAST.tomas.panic.text);
  assert.deepEqual(p.options.map((o) => o.text), [CANNED]);
  const sus = s.sus;
  s = say(s, p.id, 'canned').state;
  assert.ok(E.hasLeft(s, 'tomas'));
  assert.equal(s.sus, sus + CAST.tomas.panic.sus);
  s = playNight(s, 'safe');
  assert.equal(s.answered['n1-tomas-stop14'], undefined, 'their later messages never come');
  assert.equal(E.viewModel(s).threads.find((t) => t.npc === 'tomas').state, 'left');
});

test('off-topic: they ask again and the message keeps waiting; the exchange joins the thread when it is answered', () => {
  let s = night1();
  const clock = s.clock;
  s = E.offTopic(s, 'n1-ty-dog', { text: 'dog', leak: 0, question: 'what? is it normal for a dog to stop eating' }).state;
  assert.ok(ids(s).includes('n1-ty-dog'), 'still waiting for an answer');
  assert.equal(s.answered['n1-ty-dog'], undefined);
  assert.deepEqual(E.asksFor(s, 'n1-ty-dog').map((a) => [a.text, a.question]), [['dog', 'what? is it normal for a dog to stop eating']]);
  assert.equal(s.threads.ty.length, 0, 'nothing is in the thread until the message is answered');
  assert.equal(s.clock, Math.max(clock, E.hm('22:10')) + TICK, 'a reply spends time like any other');
  s = say(s, 'n1-ty-dog', 'vet').state;
  assert.deepEqual(s.threads.ty.map((e) => [e.who, e.text.split('\n')[0]]).slice(0, 4), [
    ['them', 'hi. random question'], ['you', 'dog'], ['them', 'what? is it normal for a dog to stop eating'], ['you', E.resolveMessage(NIGHTS[0].messages[0], s).options.find((o) => o.id === 'vet').text.split('\n')[0]],
  ]);
  assert.equal(E.asksFor(s, 'n1-ty-dog').length, 0);
});

test('off-topic replies still cost what they give away', () => {
  let s = upTo('n1-charles-notice');
  const before = { sus: s.sus, unease: s.unease.charles };
  s = E.offTopic(s, 'n1-charles-notice', { text: 'Ty says his dad is on nights', leak: 3, from: ['ty', 'charles', 'zed'], question: 'Pardon?' }).state;
  assert.equal(s.sus, before.sus + SUS_BY_LEAK[3]);
  assert.equal(s.unease.charles, before.unease + UNEASE_BY_LEAK[3]);
  assert.deepEqual(E.asksFor(s, 'n1-charles-notice')[0].from, ['ty'], 'self and unknown people dropped');
});

test(`off-topic: after ${MAX_REASKS} re-asks, the next one makes them stop using the service, quietly`, () => {
  let s = night1();
  for (let i = 1; i <= MAX_REASKS; i += 1) {
    const out = E.offTopic(s, 'n1-ty-dog', { text: `dog ${i}`, question: `again ${i}` });
    assert.equal(out.outcome.gaveUp, false);
    s = out.state;
  }
  const last = E.offTopic(s, 'n1-ty-dog', { text: 'dog 4', question: 'forget it. not using this anymore' });
  assert.equal(last.outcome.gaveUp, true);
  s = last.state;
  assert.ok(E.hasLeft(s, 'ty'));
  assert.equal(s.answered['n1-ty-dog'].opt, E.OTHER);
  assert.equal(s.threads.ty.at(-1).text, 'forget it. not using this anymore');
  assert.equal(s.threads.ty.filter((e) => e.who === 'you').length, MAX_REASKS + 1);
  assert.equal(E.viewModel(s).threads.find((t) => t.npc === 'ty').state, 'left');
  assert.equal(E.fateOf('ty', s).left, false, 'the paper does not tell it as a panic: no complaint, no screenshots');
  assert.equal(E.fateOf('ty', s).gaveUp, true);
  s = playNight(s, 'safe');
  assert.ok(!Object.keys(s.answered).some((id) => id.startsWith('n1-ty-') && id !== 'n1-ty-dog'), 'their later messages never come');
});

test('off-topic is not offered to the operators or to a panicking user’s last words', () => {
  const s = night1();
  assert.equal(E.acceptsOther(E.messageFor(s, 'ty')), true);
  assert.equal(E.acceptsOther({ npc: 'ops', kind: 'inquiry' }), false);
  assert.equal(E.acceptsOther({ npc: 'ty', kind: 'panic' }), false);
});

test('a panic that goes public makes everyone they know uneasy', () => {
  let s = upTo('n1-amelia-late');
  s = { ...s, unease: { ...s.unease, amelia: PANIC_AT } };
  s = { ...s, extra: [], clock: s.clock };
  s = E.startNight({ ...s, phase: 'intro' });
  const p = E.messageFor(s, 'amelia');
  assert.equal(p?.kind, 'panic');
  const before = { ...s.unease };
  s = say(s, p.id, 'canned').state;
  for (const other of KNOWS.amelia) assert.equal(s.unease[other], before[other] + CAST.amelia.panic.spread, other);
});

test('the operators ask from night 2 when suspicion is high; the answer moves it', () => {
  let s = atNight(2, {}, { sus: INQUIRY_AT });
  assert.equal(E.pendingMessages(s)[0].id, 'ops-n2');
  s = say(s, 'ops-n2', 'lie').state;
  assert.equal(s.sus, INQUIRY_AT - 2);
  let quiet = atNight(2, {}, { sus: INQUIRY_AT - 1 });
  assert.ok(!ids(quiet).includes('ops-n2'));
  quiet = atNight(1, {}, { sus: 99 });
  assert.ok(!ids(quiet).some((id) => id.startsWith('ops')), 'never on night 1');
});

test('lying to the operators when the logs already show it makes things worse', () => {
  let s = atNight(2, {}, { sus: 10 });
  const m = E.messageFor(s, 'ops');
  assert.equal(m.variant, 'heavy');
  s = say(s, 'ops-n2', 'lie').state;
  assert.equal(s.sus, 13);
});

test('typed replies: the judge’s leak and sources replace the branch’s, the branch’s story stays', () => {
  let s = upTo('n1-megan-rota');
  const { state, outcome } = say(s, 'n1-megan-rota', 'odd', { text: 'Ask them if they work at the Institute, Charles is being cagey.', leak: 3, from: ['charles', 'megan', 'nobody'], reply: 'charles who?' });
  assert.equal(outcome.leak, 3);
  assert.deepEqual(outcome.from, ['charles'], 'the recipient and unknown names are dropped');
  assert.equal(state.flags.megNotes, true, 'the branch’s flags apply');
  const you = state.threads.megan.at(-2);
  assert.equal(you.text, 'Ask them if they work at the Institute, Charles is being cagey.');
  assert.equal(you.free, true);
  assert.equal(state.threads.megan.at(-1).text, 'charles who?');
  assert.equal(state.sus - s.sus, SUS_BY_LEAK[3]);
});

test('typed replies keep the raw LLM output in the save', () => {
  const s = night1();
  const raw = { judge: '{"option":"vet"}' };
  const next = say(s, 'n1-ty-dog', 'vet', { text: 'feed him cheese', leak: 0, from: [], raw }).state;
  assert.deepEqual(next.llm['n1-ty-dog'], raw);
});

test('spread: quiet on night 1, Millside worse each night, the morning after is the worst', () => {
  const s = E.newGame();
  const lv = (n) => E.zoneLevel('millside', s, n);
  assert.ok(lv(1) < lv(2) && lv(2) < lv(3));
  assert.ok(E.zoneLevel('hills', s, DAWN) >= 4, 'left alone, even the hills are overrun by morning');
});

test('nobody protected and nothing contained: everyone is gone by morning', () => {
  const s = { ...E.newGame(), night: DAWN, phase: 'ending' };
  assert.deepEqual(E.survivors(s), []);
  assert.equal(E.townOutcome(s), 'none');
});

test('Ty and Charles turn on night 3 unless protected or the east was sealed early', () => {
  const s = E.newGame();
  assert.ok(E.isInfected('ty', { ...s, night: 3 }));
  assert.ok(E.isInfected('charles', { ...s, night: 3 }));
  assert.ok(!E.isInfected('megan', { ...s, night: 3 }));
  assert.ok(!E.isInfected('ty', { ...s, night: 3, flags: { tySafe: true } }));
  const sealed = { ...s, night: 3, flags: { sealedEast: true, sealedNight: 2 } };
  assert.ok(!E.isInfected('ty', sealed) && !E.isInfected('charles', sealed));
});

test('sealing the east early saves everyone; late saves the bridge and the west only', () => {
  const early = { ...E.newGame(), flags: { sealedEast: true, sealedNight: 1 } };
  assert.equal(E.survivors(early).length, 6);
  const late = { ...E.newGame(), flags: { sealedEast: true, sealedNight: 3 } };
  assert.deepEqual(E.survivors(late).sort(), ['amelia', 'ana', 'megan', 'tomas']);
});

test('the east is sealed when the truth reaches the county from two sides, or Charles seals the gate', () => {
  const end = (flags) => E.endNight({ ...E.newGame(), phase: 'nightEnd', flags });
  assert.ok(!end({ charlesDisclosed: true }).flags.sealedEast, 'one report is “noted”');
  assert.ok(!end({ megCalled: true, ameliaTruth: true }).flags.sealedEast, 'Megan’s call needs the Institute link');
  assert.equal(end({ charlesDisclosed: true, megCalled: true, megKnowsInstitute: true }).flags.sealedNight, 1);
  assert.ok(end({ charlesDisclosed: true, ameliaTruth: true }).flags.sealedEast);
  assert.ok(end({ megCalled: true, megKnowsInstitute: true, ameliaTruth: true }).flags.sealedEast);
  assert.ok(end({ eastGateSealed: true }).flags.sealedEast, 'from the inside, alone');
});

test('closing the bridge keeps the west and the hills; whoever is on the bridge needs their own protection', () => {
  const s = { ...E.newGame(), flags: { bridgeClosed: true, bridgeNight: 3 } };
  assert.deepEqual(E.survivors(s).sort(), ['amelia', 'ana', 'megan']);
  assert.ok(E.survivors({ ...s, flags: { ...s.flags, tomasHeld: true } }).includes('tomas'));
});

test('walking into it overrides protection: infected from the next night', () => {
  let s = atNight(2, { tySafe: true });
  s = { ...s, flags: { ...s.flags, tyBreach: true } };
  s.lostAt = { ty: 2 };
  assert.ok(!E.isInfected('ty', s, 2));
  assert.ok(E.isInfected('ty', s, 3));
});

test('a person who turns tonight writes a last message; their story messages stop', () => {
  const fake = { id: 'n3-x-final', npc: 'ty', at: '22:00', final: true, text: 'light', options: [{ id: 'stay', leak: 0, text: 'I’m here.', reply: 'light' }] };
  NIGHTS[2].messages.push(fake);
  try {
    const s = atNight(3);
    assert.ok(ids(s).includes('n3-x-final'));
    const safe = atNight(3, { tySafe: true });
    assert.ok(!ids(safe).includes('n3-x-final'));
  } finally {
    NIGHTS[2].messages.pop();
  }
});

test('the last night goes to the ending', () => {
  let s = { ...E.newGame(), night: 3, phase: 'nightEnd' };
  s = E.endNight(s);
  assert.equal(s.phase, 'ending');
});

test('good or bad depends only on whether the service is still running', () => {
  const s = { ...E.newGame(), night: DAWN, phase: 'ending' };
  assert.equal(E.endingView({ ...s, sus: SHUTDOWN_AT - 1 }).id, 'good-none');
  assert.equal(E.endingView({ ...s, sus: SHUTDOWN_AT }).id, 'bad-none');
  const all = { ...s, flags: { sealedEast: true, sealedNight: 1 } };
  assert.equal(E.endingView(all).id, 'good-all');
  assert.equal(E.endingView({ ...all, sus: 99 }).verdict, 'Bad ending.');
});

test('every one of the six endings has a preview state that lands on it', () => {
  for (const id of E.ENDING_IDS) assert.equal(E.endingView(E.previewState(id)).id, id, id);
});

test('the paper quotes the leakiest replies, worst first', () => {
  const v = E.endingView(E.previewState('bad-some'));
  assert.ok(v.quotes.length >= 1);
  assert.ok(v.quotes.every((q, i) => i === 0 || q.leak <= v.quotes[i - 1].leak));
});

test('fates: alive, turned, or stopped using the service', () => {
  const s = { ...E.newGame(), night: DAWN, flags: { tySafe: true }, left: { ana: 2 } };
  const f = Object.fromEntries(CAST_IDS.map((id) => [id, E.fateOf(id, s)]));
  assert.equal(f.ty.alive, true);
  assert.equal(f.charles.alive, false);
  assert.equal(f.charles.turnedOn, 3);
  assert.equal(f.ana.left, true);
});

test('map: only people in contact, with their status', () => {
  let s = night1();
  assert.deepEqual(E.mapView(s).dots.map((d) => d.npc), ['ty']);
  const all = E.mapView({ ...E.newGame(), night: 3 }, { onlyActive: false });
  assert.equal(all.dots.length, 6);
  assert.equal(all.dots.find((d) => d.npc === 'ty').status, 'infected');
});

test('viewModel lists threads in contact; the operators only once they have written', () => {
  const s = night1();
  const vm = E.viewModel(s);
  assert.deepEqual(vm.threads.map((t) => t.npc), ['ty']);
  assert.equal(vm.threads[0].state, 'pending');
  const ops = atNight(2, {}, { sus: INQUIRY_AT });
  assert.ok(E.viewModel(ops).threads.some((t) => t.npc === 'ops'));
});

test('night 1 played safe raises no suspicion; played bold, it raises a lot', () => {
  const safe = playNight(night1(), 'safe');
  assert.equal(safe.sus, 0);
  const bold = playNight(night1(), 'bold');
  assert.ok(bold.sus >= 10, `bold sus ${bold.sus}`);
  assert.equal(bold.clock >= NIGHT_START, true);
});
