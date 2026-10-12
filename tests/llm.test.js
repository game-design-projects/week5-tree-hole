import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
import { createLLM, judgeContext, parseReply } from '../src/llm.js';
import { DEFAULT_CITY, localTime, realAnswer, resolveCity, weatherWords } from '../src/geo.js';

const log = { info() {}, warn() {}, event() {} };
const night1 = () => E.startNight(E.newGame(0));
const jsonRes = (body, status = 200) => ({ ok: status < 400, status, text: async () => JSON.stringify(body) });

test('judgeContext sends this user’s words, everyone else’s, and the branches on offer', () => {
  let s = night1();
  s = E.respond(s, 'n1-ty-dog', { optId: 'vet' }).state;
  const msg = E.messageFor(s, 'charles');
  const ctx = judgeContext(s, msg);
  assert.equal(ctx.npc, 'charles');
  assert.deepEqual(Object.keys(ctx.others), ['ty']);
  assert.ok(ctx.others.ty.some((t) => /pickle/.test(t)));
  assert.deepEqual(ctx.options.map((o) => o.id).sort(), ['ask', 'dan', 'draft', 'families']);
  assert.ok(ctx.options.every((o) => typeof o.reply === 'string'));
});

test('parseReply accepts only a branch on offer, clamps the leak, drops unknown or self sources', () => {
  const msg = E.messageFor(night1(), 'ty');
  assert.deepEqual(parseReply({ result: { option: 'window', leak: 2, from: ['megan', 'ty', 'zed'], reply: '**ok** <b>lol</b>' } }, msg), { optId: 'window', leak: 2, from: ['megan'], reply: 'ok lol' });
  assert.equal(parseReply({ result: { option: 'vet', leak: 9, from: [], reply: '' } }, msg).leak, 0, 'a bad leak falls back to the branch’s');
  assert.equal(parseReply({ result: { option: 'vet', leak: 0, from: [], reply: '' } }, msg).reply, null, 'an empty rewrite means: use the script');
  assert.throws(() => parseReply({ result: { option: 'nope' } }, msg), /unknown option/);
  assert.equal(parseReply({ result: { option: 'vet', leak: 0, from: [], reply: 'OK THANKS' } }, msg).reply, 'ok thanks', 'Ty stays lowercase');
});

test('createLLM: no endpoint means offline; a failed call takes the box away until a health check brings it back', async () => {
  assert.equal(createLLM({ endpoint: '', log }).up, false);
  let healthy = true;
  const fetchImpl = async (url) => {
    if (url.endsWith('/health')) return jsonRes({ ok: healthy });
    if (url.endsWith('/reply')) return jsonRes({ error: 'down' }, 502);
    return jsonRes({}, 404);
  };
  const llm = createLLM({ endpoint: 'https://proxy.test/', fetchImpl, log });
  assert.equal(await llm.ping(), true);
  const s = night1();
  await assert.rejects(llm.reply(s, E.messageFor(s, 'ty'), 'hello'), /HTTP 502/);
  assert.equal(llm.up, false);
  assert.equal(await llm.ping(), true);
  healthy = false;
  assert.equal(await llm.ping(), false);
});

test('createLLM.reply keeps the raw response alongside the parsed branch', async () => {
  const fetchImpl = async (url, init) => {
    const body = JSON.parse(init.body);
    assert.equal(body.text, 'is he ok?');
    return jsonRes({ result: { option: 'window', leak: 1, from: [], reply: 'not really' } });
  };
  const llm = createLLM({ endpoint: 'https://proxy.test', fetchImpl, log });
  const s = night1();
  const out = await llm.reply(s, E.messageFor(s, 'ty'), 'is he ok?');
  assert.equal(out.optId, 'window');
  assert.match(out.raw.reply, /"option":"window"/);
});

test('geo: settings beat the connection, the connection beats New York', async () => {
  const llm = { geo: async () => ({ city: 'Lisbon', latitude: 38.72, longitude: -9.14, timezone: 'Europe/Lisbon' }) };
  assert.equal((await resolveCity({ settings: { city: { city: 'Oslo', timezone: 'Europe/Oslo' } }, llm })).city, 'Oslo');
  assert.equal((await resolveCity({ settings: {}, llm })).city, 'Lisbon');
  assert.equal((await resolveCity({ settings: {}, llm: { geo: async () => null } })).city, DEFAULT_CITY.city);
  assert.equal((await resolveCity({ settings: {}, llm, offline: true })).city, DEFAULT_CITY.city);
});

test('geo: the time and the weather read as one plain sentence', () => {
  assert.equal(localTime('America/New_York', new Date('2026-10-23T03:47:00Z')), '11:47 pm');
  assert.equal(weatherWords(61), 'rain');
  assert.equal(weatherWords(1234), 'unsettled');
  assert.equal(realAnswer(DEFAULT_CITY, '11:47 pm', { temp: 12, units: '°C', words: 'rain' }), 'It’s 11:47 pm in New York, 12°C and rain.');
  assert.match(realAnswer(DEFAULT_CITY, '11:47 pm', null), /^It’s 11:47 pm in New York\./);
});
