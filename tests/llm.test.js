import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
import { MAX_REASKS } from '../src/config.js';
import { JUDGE_MODEL, REWRITE_MODEL, askRequest, createLLM, lastWhole, rewriteCap, judgeContext, judgeRequest, parseJudge, parseRewrite, readStream, rewriteRequest } from '../src/llm.js';
import { DEFAULT_CITY, localTime, realAnswer, resolveCity, weatherWords } from '../src/geo.js';

const log = { info() {}, warn() {}, event() {} };

// Unit tests never reach the network: any real call (an LLM above all) fails the test.
const realFetch = globalThis.fetch;
test.before(() => { globalThis.fetch = async (url) => { throw new Error(`real network call in a unit test: ${url}`); }; });
test.after(() => { globalThis.fetch = realFetch; });
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

// Jev's Decisions answers, in the shape the API returns (see e2e/artifacts for real ones).
const jevAnswers = ({ option, level = 0, uses = {} }) => ({
  model: 'typesafe/jev-1.13-20260917',
  answers: {
    option: { type: 'choice', choice: option },
    leak: { type: 'score', score: level, probabilities: Object.fromEntries([0, 1, 2, 3].map((n) => [String(n), n === level ? 0.9 : 0.1 / 3])) },
    ...Object.fromEntries(Object.entries(uses).map(([id, p]) => [`uses_${id}`, { type: 'noul', noul: p }])),
  },
  usage: { input_tokens: 400, output_tokens: 40, cost: 0 },
});
// A streamed chat completion in OpenRouter's server-sent-event shape, cut into the
// given pieces (and split mid-line, as the network does).
const sse = (pieces, { error = null } = {}) => {
  const events = pieces.map((c) => `data: ${JSON.stringify({ choices: [{ index: 0, delta: { content: c } }] })}\n\n`);
  if (error) events.push(`data: ${JSON.stringify({ error })}\n\n`);
  const text = `: OPENROUTER PROCESSING\n\n${events.join('')}data: [DONE]\n\n`;
  const bytes = new TextEncoder().encode(text);
  const cuts = [0, 7, 40, 41, 90, bytes.length].filter((n, i, a) => n <= bytes.length && a.indexOf(n) === i);
  return new ReadableStream({ start(c) { for (let i = 1; i < cuts.length; i++) c.enqueue(bytes.slice(cuts[i - 1], cuts[i])); c.close(); } });
};

test('judgeRequest asks Jev one choice, one score and one true/false per other user', () => {
  let s = night1();
  s = E.respond(s, 'n1-ty-dog', { optId: 'vet' }).state;
  const msg = E.messageFor(s, 'charles');
  const req = judgeRequest(judgeContext(s, msg), 'Ty says his dad is on nights.');
  assert.equal(req.model, JUDGE_MODEL);
  assert.equal(req.questions.option.type, 'choice');
  assert.deepEqual(Object.keys(req.questions.option.criteria).sort(), ['ask', 'dan', 'draft', 'families', 'other']);
  assert.equal(req.questions.leak.type, 'score');
  assert.equal(req.questions.leak.criteria.length, 4);
  assert.deepEqual(Object.keys(req.questions).filter((k) => k.startsWith('uses_')), ['uses_ty']);
  assert.equal(req.questions.uses_ty.type, 'noul');
  assert.equal(req.state.player_reply, 'Ty says his dad is on nights.');
  assert.ok(req.state.other_users_said.every((t) => t.startsWith('[ty] ')));
});

test('parseJudge: only a branch on offer; the score says how far, the true/false answers say whose', () => {
  const msg = E.messageFor(night1(), 'ty');
  assert.deepEqual(parseJudge(jevAnswers({ option: 'window', level: 1, uses: { megan: 0.2 } }), msg), { optId: 'window', leak: 1, from: [] });
  assert.deepEqual(parseJudge(jevAnswers({ option: 'window', level: 3, uses: { megan: 0.9, charles: 0.2, ty: 0.99, zed: 0.99 } }), msg), { optId: 'window', leak: 3, from: ['megan'] }, 'self and unknown people are dropped');
  assert.deepEqual(parseJudge(jevAnswers({ option: 'vet', level: 2, uses: { megan: 0.45, charles: 0.1 } }), msg), { optId: 'vet', leak: 2, from: ['megan'] }, 'crossing with no source over the bar names the likeliest');
  assert.deepEqual(parseJudge(jevAnswers({ option: 'vet', level: 0, uses: { megan: 0.8 } }), msg), { optId: 'vet', leak: 0, from: [] }, 'a true/false alone does not cross the line');
  assert.deepEqual(parseJudge(jevAnswers({ option: 'vet', level: 3 }), msg), { optId: 'vet', leak: 0, from: [] }, 'nobody else heard: nothing to pass on');
  const opt = msg.options.find((o) => o.id === 'window');
  assert.deepEqual(parseJudge({ answers: { option: { type: 'choice', choice: 'window' }, leak: { type: 'score' } } }, msg), { optId: 'window', leak: opt.leak, from: opt.leak >= 2 ? opt.from : [] }, 'no score: the branch’s own level');
  assert.throws(() => parseJudge(jevAnswers({ option: 'nope' }), msg), /unknown option/);
});

test('parseRewrite: plain text or the script', () => {
  const msg = E.messageFor(night1(), 'ty');
  assert.equal(parseRewrite('**OK** <b>thanks</b>', msg, 'vet'), 'ok thanks', 'markup stripped, Ty stays lowercase');
  assert.equal(parseRewrite('', msg, 'vet'), null);
  assert.equal(parseRewrite('x'.repeat(5000), msg, 'vet'), null, 'too long: keep the script');
  const script = msg.options.find((o) => o.id === 'vet').reply;
  const original = Array.isArray(script) ? script[0] : script;
  assert.equal(rewriteCap(msg, 'vet'), Math.min(700, Math.max(original.length * 3, original.length + 300)), 'the cap follows the scripted line');
  assert.equal(parseRewrite('y'.repeat(rewriteCap(msg, 'vet') + 1), msg, 'vet'), null);
  assert.ok(parseRewrite('y'.repeat(original.length + 200), msg, 'vet'), 'a reply somewhat longer than the script is fine');
  assert.equal(rewriteRequest(judgeContext(night1(), msg), 'vet', 'hi').model, REWRITE_MODEL);
});

test('createLLM: no key means offline; a failed judgement takes the box away until the key check brings it back', async () => {
  assert.equal(createLLM({ key: '', log }).up, false);
  assert.equal(createLLM({ key: '', log }).configured, false);
  assert.equal(createLLM({ key: 'k', log }).configured, true);
  let keyOk = true;
  const fetchImpl = async (url, init) => {
    assert.equal(init.headers.authorization, 'Bearer test-key');
    if (url.endsWith('/v1/key')) return jsonRes({ data: { limit_remaining: 1 } }, keyOk ? 200 : 401);
    if (url.endsWith('/alpha/decisions')) return jsonRes({ error: { message: 'down' } }, 502);
    return jsonRes({}, 404);
  };
  const llm = createLLM({ key: 'test-key', fetchImpl, log });
  assert.equal(await llm.ping(), true);
  const s = night1();
  await assert.rejects(llm.reply(s, E.messageFor(s, 'ty'), 'hello'), /HTTP 502/);
  assert.equal(llm.up, false);
  assert.equal(await llm.ping(), true);
  keyOk = false;
  assert.equal(await llm.ping(), false);
});

test('lastWhole: what streamed, ended at its last whole sentence or line', () => {
  assert.equal(lastWhole('ok. he is still there. and the'), 'ok. he is still there.');
  assert.equal(lastWhole('line one\nline tw'), 'line one');
  assert.equal(lastWhole('no ending at all'), null);
});

test('readStream: the text so far after every event, keep-alives skipped, the raw stream kept, errors thrown', async () => {
  const seen = [];
  const out = await readStream(sse(['not ', 'really', '']), (t) => seen.push(t));
  assert.deepEqual(seen, ['not ', 'not really']);
  assert.equal(out.text, 'not really');
  assert.equal(out.stopped, false);
  assert.match(out.raw, /OPENROUTER PROCESSING[\s\S]*\[DONE\]/);
  const long = await readStream(sse(['abcdef', 'ghijkl', 'mnop']), () => {}, { stopAt: 10 });
  assert.equal(long.stopped, true, 'past the cap the stream is cancelled');
  await assert.rejects(readStream(sse(['half'], { error: { code: 502, message: 'provider down' } })), /upstream 502/);
});

test('createLLM.reply: Jev judges, Haiku rewords in a stream; raw responses are kept; a failed or overlong rewrite keeps the script', async () => {
  const sent = [];
  let rewrite = () => new Response(sse(['NOT ', 'REALLY']), { status: 200 });
  const fetchImpl = async (url, init) => {
    const body = JSON.parse(init.body);
    sent.push({ url, model: body.model, stream: body.stream, reasoning: body.reasoning });
    if (url.endsWith('/alpha/decisions')) return jsonRes(jevAnswers({ option: 'window', level: 1 }));
    if (url.endsWith('/v1/chat/completions')) return rewrite();
    return jsonRes({}, 404);
  };
  const llm = createLLM({ key: 'k', fetchImpl, log });
  const s = night1();
  const streamed = [];
  const out = await llm.reply(s, E.messageFor(s, 'ty'), 'is he ok?', { onText: (t) => streamed.push(t) });
  assert.deepEqual({ optId: out.optId, leak: out.leak, from: out.from, reply: out.reply }, { optId: 'window', leak: 1, from: [], reply: 'not really' });
  assert.deepEqual(streamed, ['not', 'not really'], 'the reaction is passed on as it streams, in their voice');
  assert.deepEqual(sent.map((x) => x.model), [JUDGE_MODEL, REWRITE_MODEL], 'the judgement never goes to the LLM');
  assert.equal(sent[1].stream, true);
  assert.deepEqual(sent[1].reasoning, { enabled: false }, 'no reasoning before the first word');
  assert.match(out.raw.judge, /"choice":"window"/);
  assert.match(out.raw.rewrite, /REALLY/, 'the raw stream is kept');

  rewrite = () => new Response(sse(['x'.repeat(400), 'y'.repeat(400)]), { status: 200 });
  assert.equal((await llm.reply(s, E.messageFor(s, 'ty'), 'is he ok?')).reply, null, 'overlong with no sentence to end on: the script stands');
  rewrite = () => new Response(sse(['NOT REALLY. ', 'he keeps staring. ', 'z'.repeat(900)]), { status: 200 });
  assert.equal((await llm.reply(s, E.messageFor(s, 'ty'), 'is he ok?')).reply, 'not really. he keeps staring.', 'overlong: what was already on screen stays, ended at its last sentence');
  rewrite = () => new Response(sse(['NOT REALLY. ', `${'z'.repeat(900)}. more. more.`]), { status: 200 });
  assert.equal((await llm.reply(s, E.messageFor(s, 'ty'), 'is he ok?')).reply, 'not really.', 'sentence ends past the cap do not count');
  rewrite = () => jsonRes({ error: { code: 529 } }, 529);
  const kept = await llm.reply(s, E.messageFor(s, 'ty'), 'is he ok?');
  assert.equal(kept.reply, null);
  assert.equal(kept.optId, 'window');
  assert.equal(llm.up, true, 'a failed rewrite does not take the box away');
});

test('off-topic: Jev may answer “other” on story messages, never on the operators’ questions', () => {
  const s = night1();
  const ty = E.messageFor(s, 'ty');
  const req = judgeRequest(judgeContext(s, ty), 'dog');
  assert.ok(req.questions.option.criteria.other, 'other is on offer');
  assert.deepEqual(parseJudge(jevAnswers({ option: 'other', level: 0 }), ty), { optId: null, other: true, leak: 0, from: [] });
  const ops = { ...ty, npc: 'ops', kind: 'inquiry' };
  assert.equal(judgeRequest(judgeContext(s, ops), 'dog').questions.option.criteria.other, undefined);
  assert.throws(() => parseJudge(jevAnswers({ option: 'other' }), ops), /unknown option/);
});

test('createLLM.reply on “other”: Haiku streams them asking again; past the limit, their last line; a failure falls back', async () => {
  const sent = [];
  let haiku = () => new Response(sse(['WHAT? ', 'is that normal']), { status: 200 });
  const fetchImpl = async (url, init) => {
    const body = JSON.parse(init.body);
    sent.push(body);
    if (url.endsWith('/alpha/decisions')) return jsonRes(jevAnswers({ option: 'other', level: 0 }));
    if (url.endsWith('/v1/chat/completions')) return haiku();
    return jsonRes({}, 404);
  };
  const llm = createLLM({ key: 'k', fetchImpl, log });
  let s = night1();
  const msg = E.messageFor(s, 'ty');
  const streamed = [];
  const out = await llm.reply(s, msg, 'dog', { onText: (t) => streamed.push(t) });
  assert.deepEqual({ other: out.other, final: out.final, question: out.question, optId: out.optId }, { other: true, final: false, question: 'what? is that normal', optId: null });
  assert.deepEqual(streamed, ['what?', 'what? is that normal']);
  assert.match(sent.at(-1).messages[0].content, /ask the same thing again/);
  assert.match(out.raw.ask, /is that normal/);

  for (let i = 0; i < MAX_REASKS; i += 1) s = E.offTopic(s, 'n1-ty-dog', { text: 'dog', question: 'again' }).state;
  const last = await llm.reply(s, E.messageFor(s, 'ty'), 'dog');
  assert.equal(last.final, true, `after ${MAX_REASKS} re-asks it is their last line`);
  assert.match(sent.at(-1).messages[0].content, /stop using this service/);

  haiku = () => jsonRes({ error: { code: 529 } }, 529);
  const fallback = await llm.reply(night1(), msg, 'dog');
  assert.equal(fallback.question, msg.text.toLowerCase(), 'no rewording: they paste the question again');
  const parting = await llm.reply(s, E.messageFor(s, 'ty'), 'dog');
  assert.ok(parting.question.length > 0, 'no rewording of the last line: a plain one');
  assert.equal(llm.up, true);
});

test('Haiku plays the person: who they are, in character, with what they wrote before as the voice to match', () => {
  let s = night1();
  s = E.respond(s, 'n1-ty-dog', { optId: 'vet' }).state;
  s = E.respond(s, 'n1-charles-notice', { optId: E.messageFor(s, 'charles').options[0].id }).state;
  const ty = E.messageFor(s, 'ty') ?? E.pendingMessages(s).find((m) => m.npc === 'ty');
  const ctx = judgeContext(s, ty ?? E.messageFor(night1(), 'ty'));
  for (const req of [rewriteRequest(ctx, ctx.options[0].id, 'hi'), askRequest(ctx, 'hi', false)]) {
    assert.match(req.messages[0].content, /^You are Ty \(17 · Millside/);
    assert.match(req.messages[0].content, /Stay in character/);
    if (ctx.self.length) assert.match(req.messages[1].content, /WHAT YOU WROTE BEFORE/);
  }
  const ops = judgeContext(night1(), { ...E.messageFor(night1(), 'ty'), npc: 'ops', kind: 'inquiry' });
  assert.match(rewriteRequest(ops, ops.options[0].id, 'hi').messages[0].content, /^You are Operations/);
});

test('the operators’ test session: typed text is judged; off-topic, they ask again, up to the limit', async () => {
  let choice = 'other';
  const sent = [];
  const fetchImpl = async (url, init) => {
    const body = JSON.parse(init.body);
    sent.push(body);
    if (url.endsWith('/alpha/decisions')) return jsonRes(jevAnswers({ option: choice }));
    if (url.endsWith('/v1/chat/completions')) return new Response(sse(['Sorry, ', 'what time is it there?']), { status: 200 });
    return jsonRes({}, 404);
  };
  const llm = createLLM({ key: 'k', fetchImpl, log });
  const message = 'What time is it where I am, and what’s the weather doing?';
  const options = [{ id: 'real', text: 'It’s 11:47 pm in New York, 12°C and rain.', reply: 'Test passed. Going live.' }, { id: 'cannot', text: 'I can’t tell.', reply: 'Test passed. Going live.' }];
  const off = await llm.test('hi', { message, options });
  assert.deepEqual({ other: off.other, final: off.final, question: off.question }, { other: true, final: false, question: 'Sorry, what time is it there?' });
  assert.ok(sent[0].questions.option.criteria.other, 'other is on offer in the test session');
  assert.match(sent[1].messages[0].content, /^You are Operations/);
  const last = await llm.test('hi', { message, options, asked: Array(MAX_REASKS).fill('again') });
  assert.deepEqual({ final: last.final, question: last.question }, { final: true, question: null }, 'past the limit: no more asking, the caller ends the test');
  choice = 'real';
  const real = await llm.test('almost midnight, raining', { message, options });
  assert.equal(real.optId, 'real');
  assert.equal(real.other, undefined);
});

test('geo: the city from Settings, else New York', () => {
  assert.equal(resolveCity({ settings: { city: { city: 'Oslo', timezone: 'Europe/Oslo' } } }).city, 'Oslo');
  assert.equal(resolveCity({ settings: {} }).city, DEFAULT_CITY.city);
});

test('geo: the time and the weather read as one plain sentence', () => {
  assert.equal(localTime('America/New_York', new Date('2026-10-23T03:47:00Z')), '11:47 pm');
  assert.equal(weatherWords(61), 'rain');
  assert.equal(weatherWords(1234), 'unsettled');
  assert.equal(realAnswer(DEFAULT_CITY, '11:47 pm', { temp: 12, units: '°C', words: 'rain' }), 'It’s 11:47 pm in New York, 12°C and rain.');
  assert.match(realAnswer(DEFAULT_CITY, '11:47 pm', null), /^It’s 11:47 pm in New York\./);
});
