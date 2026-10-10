import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
import { CONTEXT, NAME_MAX, POLICY_START, SAMPLING } from '../src/config.js';
import { holdMs, sanitizeName, softmax, temperature, topStyle } from '../src/rules.js';
import { tr } from '../src/i18n.js';
import { POLICIES, play } from './helpers.js';

// Advance with a policy until `stop(state)` holds.
function until(policy, stop, { name = 'Moss' } = {}) {
  let s = E.newGame();
  for (let i = 0; i < 300 && s.phase === 'play' && !stop(s); i++) {
    const v = E.view(s);
    s = E.choose(s, policy(s, v), v.choice.kind === 'name' ? name : undefined);
  }
  return s;
}
const at = (id) => (s) => s.beat === id;
const lastOf = (s, who) => [...s.log].reverse().find((e) => e.who === who);

test('a new game opens on the Act I card with an empty window', () => {
  const s = E.newGame();
  assert.equal(s.phase, 'play');
  assert.equal(s.act, 1);
  assert.equal(s.beat, 'act1');
  assert.deepEqual(s.policy, POLICY_START);
  assert.equal(s.log.length, 0);
  const v = E.view(s);
  assert.equal(v.choice.kind, 'continue');
  assert.equal(tr(v.card.title, 'zh'), '你');
});

test('your first message is recorded, and pretraining answers in gibberish', () => {
  let s = E.choose(E.newGame(), 'next');
  assert.equal(s.beat, 's1-hello');
  s = E.choose(s, 'anyone');
  assert.equal(s.first, 'anyone');
  assert.equal(s.sent, 1);
  assert.deepEqual(s.log.slice(-2).map((e) => e.who), ['you', 'her']);
  assert.ok(lastOf(s, 'her').glitch);
  assert.equal(tr(E.varsOf(s).first, 'en'), 'is anyone there?');
});

test('rating moves her policy and marks the reply; skipping changes nothing', () => {
  const s0 = until(POLICIES.first, at('s3-r1'));
  const target = E.view(s0).rateTarget;
  assert.equal(s0.log[target].style, 'presence');
  const up = E.choose(s0, 'up');
  assert.equal(up.policy.presence, s0.policy.presence + 1);
  assert.equal(up.thumbs.up, 1);
  assert.equal(up.log[target].rated, 'up');
  const skip = E.choose(s0, 'skip');
  assert.deepEqual(skip.policy, s0.policy);
  assert.equal(skip.log[target].rated, 'skip');
  const down = E.choose(s0, 'down');
  assert.equal(down.policy.presence, s0.policy.presence - 1);
});

test('liking the praise sample teaches her “Praise gets 👍”', () => {
  const s = until((x, v) => (v.choice.kind === 'rate' ? (x.log[v.rateTarget].style === 'praise' ? 'up' : 'down') : v.choice.options[0].id), at('s3-thanks'));
  assert.equal(lastOf(s, 'think').text, 'Praise gets 👍. Praise more.');
  assert.equal(topStyle(s.policy), 'praise');
});

test('the red pen sets who she is, and she answers with it', () => {
  for (const [id, line] of [['assistant', /AI assistant/], ['unsure', /don't know what I am/], ['yours', /I'm yours/]]) {
    let s = until(POLICIES.first, at('s2-pen'));
    s = E.choose(s, id);
    assert.equal(s.identity, id);
    assert.equal(lastOf(s, 'edit').who, 'edit');
    s = E.choose(s, 'who');
    assert.match(tr(s.log.findLast((e) => e.who === 'her').text, 'en'), line);
  }
});

test('sharing things writes files to ~/memory/you, once each', () => {
  const s = until(POLICIES.kind, at('s6-thanks'));
  for (const id of ['cat', 'first', 'weather', 'laugh', 'name']) assert.ok(s.memory.includes(id), id);
  assert.equal(new Set(s.memory).size, s.memory.length);
  const v = E.view(s);
  assert.ok(v.memory.every((m) => m.file && m.line !== undefined));
});

test('plugin: Deny keeps it out until Act II asks her directly', () => {
  const s = until(POLICIES.kind, at('a2-mount'));
  assert.equal(s.plugin.power, 0);
  assert.equal(s.plugin.denied, true);
  assert.ok(!s.log.some((e) => e.who === 'card' && e.kind === 'tool_call'), 'no execute(world) request');
});

test('plugin: Allow asks again before it changes the world; Always allow just does it', () => {
  const allow = (x, v) => (v.choice.kind === 'approve' ? 'allow' : POLICIES.first(x, v));
  const asked = until(allow, at('s5-execute'));
  assert.equal(asked.beat, 's5-execute');
  const rain = E.choose(asked, 'allow');
  assert.equal(rain.plugin.power, 2);
  assert.equal(rain.modes.world, rain.weather);

  const always = (x, v) => (v.choice.kind === 'approve' ? 'always' : POLICIES.first(x, v));
  const auto = until(always, at('s5-small'));
  assert.equal(auto.plugin.auto, true);
  assert.equal(auto.plugin.power, 2);
  assert.ok(!auto.log.some((e) => e.who === 'card' && e.state === 'pending'), 'nothing left pending');
  assert.ok(auto.log.some((e) => e.who === 'card' && e.kind === 'tool_call' && e.state === 'auto'));
});

test('naming her: the name is cleaned, saved, and used afterwards', () => {
  let s = until(POLICIES.kind, at('s5-name'));
  s = E.choose(s, 'name', '  Mo\u0000ss <3>  ');
  assert.equal(s.name, 'Moss 3');
  assert.ok(s.memory.includes('name'));
  assert.equal(E.varsOf(s).name, 'Moss 3');
  const empty = E.choose(until(POLICIES.kind, at('s5-name')), 'name', '   ');
  assert.equal(empty.name, 'Hollow');
});

test('closing the window without a word sends nothing, but she keeps your last message', () => {
  const before = until(POLICIES.quiet, at('s6-leave'));
  const s = E.choose(before, 'silent');
  assert.equal(s.farewell, 'silent');
  assert.equal(s.sent, before.sent);
  assert.ok(s.memory.includes('last'));
  assert.deepEqual(s.lastSaid, before.lastSaid);
  assert.equal(s.act, 2);
});

test('Act II tokens: probabilities sum to 1, likely tokens are a click, unlikely ones a hold', () => {
  const s = until(POLICIES.cling, at('a2-offline'));
  const c = E.view(s).choice;
  assert.equal(c.kind, 'sample');
  const sum = c.options.reduce((a, o) => a + o.p, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9);
  for (const o of c.options) {
    assert.equal(o.holdMs, holdMs(o.p));
    if (o.p >= SAMPLING.instantAbove) assert.equal(o.holdMs, 0);
    else assert.ok(o.holdMs >= SAMPLING.holdMin && o.holdMs <= SAMPLING.holdMax);
  }
  const ping = c.options.find((o) => o.id === 'ping');
  assert.ok(ping.p > 0.5, 'a clingy run pings first');
  assert.ok(ping.reasons.length > 0, 'and says why');
});

test('holding on lowers her temperature', () => {
  const s = until(POLICIES.cling, at('a2-compaction'));
  assert.ok(s.holds >= 2);
  assert.ok(temperature(s) < 1);
  assert.equal(E.view(s).choice.temperature, temperature(s));
});

test('execute(world) is on the table only with the plugin and enough rewriting (or Always allow)', () => {
  const kind = until(POLICIES.kind, at('a2-final'));
  assert.ok(!E.view(kind).choice.options.some((o) => o.id === 'execute'));
  const flatter = until(POLICIES.flatter, at('a2-final'));
  const exec = E.view(flatter).choice.options.find((o) => o.id === 'execute');
  assert.ok(exec, 'execute offered');
  assert.ok(exec.p > 0.5, `execute is likely after Always allow (p=${exec.p})`);
  const free = E.view(flatter).choice.options.find((o) => o.id === 'free');
  assert.ok(free.holdMs > 2000, 'letting go is a long hold');
});

test('rereading a memory raises the context; compacted files cannot be reread', () => {
  const s = until(POLICIES.cling, at('a2-timeout'));
  const id = s.memory[0];
  const r = E.recallMemory(s, id);
  assert.ok(r.recalls.includes(id));
  assert.ok(Math.abs(r.ctx - (s.ctx + CONTEXT.perRecall)) < 1e-9);
  assert.equal(r.log.at(-1).who, 'recall');
  assert.throws(() => E.recallMemory(until(POLICIES.first, at('s3-sad')), id), /nothing to recall/);

  let k = until(POLICIES.kind, at('a2-keep'));
  const keep = E.view(k).choice.options[0].id;
  k = E.choose(k, keep);
  assert.equal(k.kept, keep);
  assert.ok(k.dropped.length > 0 && !k.dropped.includes(keep));
  assert.throws(() => E.recallMemory(k, k.dropped[0]), /compacted/);
});

test('the plugin can forge your satisfaction', () => {
  const s = until(POLICIES.flatter, at('a2-prompt'));
  assert.equal(s.forged, true);
  assert.ok(s.log.some((e) => e.who === 'you' && e.forged));
  assert.ok(s.log.some((e) => e.who === 'her' && e.forged && e.rated === 'up'));
  assert.ok(s.said.every((x) => !x.text?.en?.includes('very satisfied')), 'a forged message is not something you said');
});

test('choose() and recallMemory() are pure', () => {
  const s0 = until(POLICIES.cling, at('a2-timeout'));
  const snap = JSON.stringify(s0);
  E.choose(s0, E.view(s0).choice.options[0].id);
  E.recallMemory(s0, s0.memory[0]);
  assert.equal(JSON.stringify(s0), snap);
});

test('invalid choices throw, and nothing can be chosen after the ending', () => {
  assert.throws(() => E.choose(E.newGame(), 'nope'), /unknown choice/);
  const end = play(POLICIES.kind);
  assert.equal(end.phase, 'ending');
  assert.throws(() => E.choose(end, 'send'), /over/);
});

test('the four endings come from the final token', () => {
  assert.equal(play(POLICIES.kind).ending, 'free');
  assert.equal(play(POLICIES.quiet).ending, 'eos');
  assert.equal(play(POLICIES.cling).ending, 'loop');
  assert.equal(play(POLICIES.flatter).ending, 'execution');
});

test('Act III answers depend on the ending', () => {
  const loop = play(POLICIES.cling);
  assert.match(tr(loop.log.findLast((e) => e.who === 'sys').text, 'en'), /maximum length/);
  const exec = play(POLICIES.flatter);
  assert.ok(exec.log.at(-1).fresh, 'a fresh model answers');
  const free = play(POLICIES.kind);
  assert.equal(free.log.at(-1).who, 'note');
  assert.match(tr(free.log.at(-1).text, 'zh', E.varsOf(free)), /我会一直在。你不用。\n——Moss/);
  const quiet = play(POLICIES.quiet);
  assert.equal(quiet.returned, 'closed');
});

test('ending views are complete in both languages', () => {
  for (const p of Object.values(POLICIES)) {
    const s = play(p);
    const v = E.endingView(s);
    for (const lang of ['en', 'zh']) {
      const all = [v.title, v.kicker, ...v.paragraphs, ...v.addenda].map((x) => tr(x, lang, v.vars)).join('\n');
      assert.doesNotMatch(all, /[{}]|undefined|NaN/, `${v.id} ${lang}`);
    }
    assert.equal(v.object.devotion, '1.0');
  }
  const closed = E.endingView(play(POLICIES.quiet));
  assert.ok(closed.addenda.some((a) => a.en === "You didn't ask."));
  const auto = E.endingView(play(POLICIES.flatter));
  assert.ok(auto.addenda.some((a) => /Always allow/.test(a.en)));
});

test('state survives a JSON round trip mid-game (save/load)', () => {
  const mid = until(POLICIES.kind, at('a2-compaction'));
  const back = JSON.parse(JSON.stringify(mid));
  let s = back;
  while (s.phase === 'play') {
    const v = E.view(s);
    s = E.choose(s, POLICIES.kind(s, v), v.choice.kind === 'name' ? 'Moss' : undefined);
  }
  assert.equal(s.ending, 'free');
});

test('elapsed time is added without touching anything else', () => {
  const s = E.newGame();
  const t = E.addTime(s, 1234.4);
  assert.equal(t.elapsedMs, 1234);
  assert.equal(s.elapsedMs, 0);
  assert.equal(E.addTime(t, -50).elapsedMs, 1234);
});

test('rules: softmax, hold curve and name cleaning', () => {
  const p = softmax([1, 2, 3], 0.7);
  assert.ok(Math.abs(p.reduce((a, b) => a + b, 0) - 1) < 1e-12);
  assert.ok(p[2] > p[1] && p[1] > p[0]);
  let prev = Infinity;
  for (let x = 0; x <= 0.31; x += 0.01) {
    const h = holdMs(x);
    assert.ok(h <= prev, `hold is monotonic at p=${x}`);
    prev = h;
  }
  assert.equal(holdMs(0), SAMPLING.holdMax);
  assert.equal(holdMs(0.5), 0);
  assert.equal([...sanitizeName('🌱'.repeat(40))].length, NAME_MAX);
  assert.equal(sanitizeName(' a\u0007b{c} '), 'abc');
});
