// Full-browser smoke test (system Chrome via playwright-core): going live, the
// sessions and the map, one answer per message (picked or typed), the LLM falling
// away, settings, a three-night run, every ending's paper, and the phone layout.
import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_REASKS } from '../src/config.js';
import { ART, launch, loadState, open, playNight, tid } from './lib.mjs';

let env;
test.before(async () => { env = await launch(); });
test.after(async () => { await env.close(); });

// A streamed chat completion, as OpenRouter sends it.
const sse = (text) => `: OPENROUTER PROCESSING\n\n${text.match(/.{1,8}/gs).map((c) => `data: ${JSON.stringify({ choices: [{ delta: { content: c } }] })}\n\n`).join('')}data: [DONE]\n\n`;

// Plays OpenRouter: Jev answers the judgement, Haiku streams the rewrite.
const judgeAs = ({ option, level = 0, uses = {}, reply = '', hold = null }) => async (path) => {
  if (path === '/v1/key') return { body: { data: { limit_remaining: 1 } } };
  if (path === '/alpha/decisions') {
    return { body: { model: 'typesafe/jev-1.13-20260917', answers: {
      option: { type: 'choice', choice: option },
      leak: { type: 'score', score: level, probabilities: { [String(level)]: 0.9 } },
      ...Object.fromEntries(Object.entries(uses).map(([id, p]) => [`uses_${id}`, { type: 'noul', noul: p }])),
    }, usage: { cost: 0 } } };
  }
  if (path === '/v1/chat/completions') {
    await hold?.();
    return { sse: sse(reply) };
  }
  return { status: 404, body: {} };
};

test('going live: the deploy log states the rules, the test session offers the real weather, then night 1', async () => {
  const { page, errors, context } = await open(env, { query: '?fast=1&boot=1' });
  await page.click(tid('begin'));
  await page.waitForSelector(tid('choice-real'));
  const log = await page.textContent(tid('deploy-log'));
  assert.match(log, /one message in, one response out/);
  assert.match(log, /sessions are isolated/);
  assert.match(log, /you do not initiate/);
  assert.doesNotMatch(log, /monitor/i, 'nothing says anyone is watching');
  const real = await page.textContent(tid('choice-real'));
  assert.match(real, /New York, 12°C and rain/, 'offline: New York, with the (mocked) real weather');
  await page.click(tid('choice-real'));
  await page.click(tid('go-live'));
  await page.click(tid('start-night'));
  assert.equal(await page.getAttribute(tid('thread-ty'), 'data-state'), 'pending');
  assert.equal(await page.$(tid('thread-charles')), null, 'people who have not written are not listed');
  assert.equal(await page.locator('.zone').count(), 1, 'the map shows only Ty’s area');
  assert.equal(await page.$(tid('free-text')), null, 'offline: no text box at all');
  assert.equal(await page.$('.context, .tray, [data-testid="attach"]'), null, 'no cards anywhere');
  assert.deepEqual(errors, []);
  await context.close();
});

// Plays OpenRouter for the test session: Jev answers `choice()`, Haiku asks again.
const testSession = (choice) => async (path) => {
  if (path === '/v1/key') return { body: { data: {} } };
  if (path === '/alpha/decisions') return { body: { answers: { option: { type: 'choice', choice: choice() }, leak: { type: 'score', score: 0, probabilities: { 0: 0.9 } } } } };
  if (path === '/v1/chat/completions') return { sse: sse('Sorry, what time is it there?') };
  return { status: 404, body: {} };
};
const testLog = (page) => page.textContent('.test-log');

test('going live: typed text is judged too; “hi” does not pass, the operators ask again', async () => {
  let choice = 'other';
  const { page, errors, context } = await open(env, { query: '?fast=1&boot=1', llm: testSession(() => choice) });
  await page.click(tid('begin'));
  await page.waitForSelector(tid('free-text'));
  await page.fill(tid('free-text'), 'hi');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelector('.test-log')?.textContent.includes('Sorry, what time is it there?') && !document.querySelector('[data-testid="free-text"]')?.disabled);
  assert.equal(await page.$(tid('go-live')), null, '“hi” does not pass the test');
  assert.doesNotMatch(await testLog(page), /Test passed/);
  choice = 'real';
  await page.fill(tid('free-text'), 'almost midnight, and raining');
  await page.keyboard.press('Enter');
  await page.waitForSelector(tid('go-live'));
  assert.match(await testLog(page), /Test passed\. Going live\./);
  assert.deepEqual(errors, []);
  await context.close();
});

test(`going live: after ${MAX_REASKS} off-topic answers the test fails, and goes live anyway`, async () => {
  const { page, errors, context } = await open(env, { query: '?fast=1&boot=1', llm: testSession(() => 'other') });
  await page.click(tid('begin'));
  for (let i = 1; i <= MAX_REASKS + 1; i += 1) {
    await page.waitForFunction(() => { const a = document.querySelector('[data-testid="free-text"]'); return a && !a.disabled; });
    await page.fill(tid('free-text'), `hi ${i}`);
    await page.keyboard.press('Enter');
    if (i <= MAX_REASKS) await page.waitForFunction((k) => (document.querySelector('.test-log')?.textContent.match(/Sorry, what time is it there\?/g) ?? []).length === k, i);
  }
  await page.waitForSelector(tid('go-live'));
  assert.match(await testLog(page), /Test failed\. Going live anyway\./);
  assert.deepEqual(errors, []);
  await context.close();
});

test('going live uses the city from Settings', async () => {
  const second = await open(env, { query: '?fast=1&boot=1' });
  await second.page.click(tid('title-settings'));
  await second.page.fill(tid('city-input'), 'Lis');
  await second.page.click(tid('city-pick'));
  assert.match(await second.page.textContent(tid('city-current')), /Lisbon/);
  await second.page.click(tid('settings-close'));
  await second.page.click(tid('begin'));
  await second.page.waitForSelector(tid('choice-real'));
  assert.match(await second.page.textContent(tid('choice-real')), /Lisbon/);
  await second.context.close();
});

test('one question, one answer: a picked reply is sent once, their reaction follows, the next session opens', async () => {
  const { page, errors, context } = await open(env);
  await page.click(tid('begin'));
  await page.click(tid('start-night'));
  const count = await page.locator(`${tid('composer')} .opt`).count();
  assert.equal(count, 3);
  await page.locator(`${tid('composer')} .opt`).first().click();
  assert.equal(await page.$(tid('composer')), null, 'nothing more can be sent to this message');
  assert.equal(await page.locator('.bubble.you').count(), 1);
  await page.click(tid('next'));
  assert.equal(await page.getAttribute(tid('thread-charles'), 'data-state'), 'pending');
  assert.deepEqual(errors, []);
  await context.close();
});

test('?seed fixes a new game: the same seed, the same options in the same order', async () => {
  const options = async (seed) => {
    const { page, errors, context } = await open(env, { query: `?fast=1&seed=${seed}` });
    await page.click(tid('begin'));
    await page.click(tid('start-night'));
    const opts = await page.locator(`${tid('composer')} .opt`).allTextContents();
    const state = await page.evaluate(() => window.__th.app.state.seed);
    assert.deepEqual(errors, []);
    await context.close();
    return { opts, state };
  };
  const [a, b] = [await options(5), await options(5)];
  assert.equal(a.state, 5);
  assert.deepEqual(a.opts, b.opts);
  assert.equal(a.opts.length, 3);
});

test('Next is never a dead click: during their typing it shows the reaction at once, the next click moves on', async () => {
  const { page, errors, context } = await open(env, { query: '?boot=0' }); // real typing delays
  await page.click(tid('begin'));
  await page.click(tid('start-night'));
  await page.locator(`${tid('composer')} .opt`).first().click();
  assert.equal(await page.locator('.typing').count(), 1, 'their reaction is still typing');
  assert.equal(await page.getAttribute(tid('next'), 'disabled'), null, 'Next is clickable while they type');
  await page.click(tid('next'));
  assert.equal(await page.locator('.typing').count(), 0, 'the reaction is shown at once');
  assert.equal(await page.locator('.bubble.you').count(), 1);
  assert.equal(await page.getAttribute(tid('thread-ty'), 'data-state'), 'idle', 'still on the same thread');
  await page.keyboard.press('Enter');
  assert.equal(await page.$(tid('next')), null, 'the second press moves on');
  assert.deepEqual(errors, []);
  await context.close();
});

test('typed answers: the judge picks the branch, the reaction answers what you wrote', async () => {
  const { page, errors, context } = await open(env, { llm: judgeAs({ option: 'window', level: 1, reply: 'the mill road? just the institute lights i guess' }) });
  await page.click(tid('begin'));
  await page.click(tid('start-night'));
  await page.fill(tid('free-text'), 'Is anything different down the mill road this week?');
  await page.keyboard.press('Enter');
  await page.waitForSelector(tid('next'));
  const thread = await page.textContent(tid('log'));
  assert.match(thread, /Is anything different down the mill road/);
  assert.match(thread, /just the institute lights i guess/);
  const saved = await page.evaluate(() => window.__th.app.state.answered['n1-ty-dog']);
  assert.deepEqual({ opt: saved.opt, free: saved.free, leak: saved.leak }, { opt: 'window', free: true, leak: 1 });
  const raw = await page.evaluate(() => window.__th.app.state.llm['n1-ty-dog']);
  assert.match(raw.judge, /"choice":"window"/, 'Jev’s raw answer is kept');
  assert.match(raw.rewrite, /^: OPENROUTER PROCESSING[\s\S]*data: \[DONE\]/, 'and Haiku’s raw stream');
  assert.deepEqual(errors, []);
  await context.close();
});

test('typed answers stream in: their dots show while the judge and the rewrite work, then the reaction stays put with no second typing pause', async () => {
  let release;
  const held = new Promise((r) => { release = r; });
  const { page, errors, context } = await open(env, { query: '?boot=0', llm: judgeAs({ option: 'window', level: 1, reply: 'the mill road? just the lights i guess', hold: () => held }) });
  await page.click(tid('begin'));
  await page.click(tid('start-night'));
  await page.fill(tid('free-text'), 'Anything new down the mill road?');
  await page.keyboard.press('Enter');
  await page.waitForSelector(tid('sending'));
  await page.waitForSelector('.typing');
  assert.equal(await page.$(tid('next')), null, 'nothing to move on to yet');
  release();
  await page.waitForSelector(tid('next'));
  assert.equal(await page.locator('.typing').count(), 0, 'a streamed reaction does not type a second time');
  assert.match(await page.textContent(tid('log')), /the mill road\? just the lights i guess/, 'and does not decrypt again');
  assert.deepEqual(errors, []);
  await context.close();
});

test(`off-topic: they ask again up to ${MAX_REASKS} times, then stop using the service`, async () => {
  let n = 0;
  const llm = async (path, body) => {
    if (path === '/v1/key') return { body: { data: {} } };
    if (path === '/alpha/decisions') return { body: { answers: { option: { type: 'choice', choice: 'other' }, leak: { type: 'score', score: 0, probabilities: { 0: 0.9 } } } } };
    if (path === '/v1/chat/completions') {
      n += 1;
      return { sse: sse(/stop using this service/.test(body.messages[0].content) ? 'forget it. not using this anymore' : `what? is that normal ${n}`) };
    }
    return { status: 404, body: {} };
  };
  const { page, errors, context } = await open(env, { llm });
  await page.click(tid('begin'));
  await page.click(tid('start-night'));
  for (let i = 1; i <= MAX_REASKS; i += 1) {
    await page.fill(tid('free-text'), `dog ${i}`);
    await page.keyboard.press('Enter');
    await page.waitForFunction((k) => document.querySelector('[data-testid="log"]')?.textContent.includes(`what? is that normal ${k}`) && document.querySelector('[data-testid="free-text"]'), i);
    assert.equal(await page.$(tid('next')), null, 'still waiting for an answer');
    assert.ok(await page.locator(`${tid('composer')} .opt`).count() >= 3, 'the replies on offer are still there');
  }
  await page.fill(tid('free-text'), 'dog again');
  await page.keyboard.press('Enter');
  await page.waitForSelector(tid('next'));
  assert.match(await page.textContent(tid('log')), /forget it\. not using this anymore/);
  const answered = await page.evaluate(() => window.__th.app.state.answered['n1-ty-dog']);
  assert.equal(answered.opt, 'other');
  await page.click(tid('next'));
  assert.equal(await page.getAttribute(tid('thread-ty'), 'data-state'), 'left');
  assert.deepEqual(errors, []);
  await context.close();
});

test('if the judgement fails, the text box disappears without a word and the replies on offer remain', async () => {
  let fail = false;
  const llm = async (path) => {
    if (path === '/v1/key') return fail ? { status: 401, body: {} } : { body: { data: {} } };
    if (path === '/alpha/decisions') return { status: 502, body: { error: { code: 502 } } };
    return { status: 404, body: {} };
  };
  const { page, context } = await open(env, { llm, allowErrors: [/502/, /401/, /openrouter/] });
  await page.click(tid('begin'));
  await page.click(tid('start-night'));
  fail = true;
  await page.fill(tid('free-text'), 'feed him cheese');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => !document.querySelector('[data-testid="free-text"]') && document.querySelector('[data-testid="composer"] .opt'));
  assert.equal(await page.locator('.bubble.you').count(), 0, 'nothing was sent');
  assert.doesNotMatch(await page.textContent('body'), /signal|offline|unavailable/i, 'and nothing says why');
  assert.equal(await page.evaluate(() => Object.keys(window.__th.app.state.answered).length), 0);
  fail = false; // the key is fine again: the next message brings the box back
  await page.locator(`${tid('composer')} .opt`).first().click();
  await page.click(tid('next'));
  await page.waitForSelector(tid('free-text'));
  await context.close();
});

test('a wary user asks how you knew, and gets a cover story among the replies', async () => {
  const { page, context } = await open(env);
  await loadState(page, () => {
    const { engine: E, store } = window.__th;
    const s = E.startNight(E.newGame(0));
    s.unease.ty = 2;
    store.save(s);
  });
  assert.match(await page.textContent(tid('log')), /how did you know that/);
  assert.ok(await page.$(tid('choice-deflect')));
  await context.close();
});

test('a panicking user leaves after one canned answer', async () => {
  const { page, context } = await open(env);
  await loadState(page, () => {
    const { engine: E, store } = window.__th;
    let s = E.startNight(E.newGame(0));
    s = E.respond(s, 'n1-ty-dog', { optId: 'vet' }).state;
    s.unease.charles = 4;
    s.extra.push({ id: 'panic-charles-n1', npc: 'charles', kind: 'panic', night: 1, at: s.clock });
    store.save(s);
  });
  await page.click(tid('thread-charles'));
  assert.match(await page.textContent(tid('log')), /reported it to the Institute/);
  assert.equal(await page.locator(`${tid('composer')} .opt`).count(), 1);
  await page.click(tid('choice-canned'));
  await page.click(tid('next'));
  assert.equal(await page.getAttribute(tid('thread-charles'), 'data-state'), 'left');
  await context.close();
});

test('with the replies forced (wary, panicking) the text box is gone; otherwise it is there', async () => {
  const llm = async (path) => (path === '/v1/key' ? { body: { data: {} } } : { status: 404, body: {} });
  const { page, context } = await open(env, { llm });
  await loadState(page, () => {
    const { engine: E, store } = window.__th;
    let s = E.startNight(E.newGame(0));
    s = E.respond(s, 'n1-ty-dog', { optId: 'vet' }).state;
    s.unease.charles = 4;
    s.extra.push({ id: 'panic-charles-n1', npc: 'charles', kind: 'panic', night: 1, at: s.clock });
    store.save(s);
  });
  await page.click(tid('thread-charles'));
  assert.equal(await page.locator(`${tid('composer')} .opt`).count(), 1, 'one canned reply');
  assert.equal(await page.$(tid('free-text')), null, 'panic: no typing');
  await context.close();

  const wary = await open(env, { llm });
  await loadState(wary.page, () => {
    const { engine: E, store } = window.__th;
    const s = E.startNight(E.newGame(0));
    s.unease.ty = 2;
    store.save(s);
  });
  assert.ok(await wary.page.$(tid('choice-deflect')));
  assert.equal(await wary.page.$(tid('free-text')), null, 'wary: no typing');
  await wary.context.close();

  const calm = await open(env, { llm });
  await calm.page.click(tid('begin'));
  await calm.page.click(tid('start-night'));
  await calm.page.waitForSelector(tid('free-text'));
  await calm.context.close();
});

test('three nights play to the morning paper through the real UI', async () => {
  for (const index of [0, 3]) {
    const { page, errors, context } = await open(env);
    await page.click(tid('begin'));
    for (let night = 1; night <= 3; night++) {
      await playNight(page, index);
      if (await page.$(tid('ending'))) break;
      await page.click(tid('end-night'));
    }
    await page.waitForSelector(tid('paper'));
    assert.match(await page.textContent(tid('verdict-word')), /^(Good|Bad) ending\.$/);
    assert.equal(await page.locator(`${tid('columns')} .col`).count(), 6);
    await page.screenshot({ path: `${ART}run-${index}.png`, fullPage: true });
    assert.deepEqual(errors, [], `index ${index}`);
    await context.close();
  }
});

test('every ending has its paper: verdict, headline, six people, the last line', async () => {
  for (const id of ['good-all', 'good-some', 'good-none', 'bad-all', 'bad-some', 'bad-none']) {
    const { page, errors, context } = await open(env, { query: `?fast=1&ending=${id}` });
    await page.waitForSelector(tid('paper'));
    assert.equal(await page.getAttribute(tid('ending'), 'data-ending'), id);
    assert.equal(await page.textContent(tid('verdict-word')), id.startsWith('good') ? 'Good ending.' : 'Bad ending.');
    assert.ok((await page.textContent(tid('headline'))).length > 10);
    assert.equal(await page.locator(`${tid('columns')} .col`).count(), 6);
    assert.ok((await page.textContent(tid('last-line'))).length > 5);
    if (id.startsWith('bad')) assert.match(await page.textContent(tid('paper')), /“[^”]+”/, 'a shutdown quotes what the service said');
    await page.screenshot({ path: `${ART}ending-${id}.png`, fullPage: true });
    assert.deepEqual(errors, [], id);
    await context.close();
  }
});

test('the paper’s weather is New York’s hourly forecast, with a menu for the hour and the time now', async () => {
  const { page, errors, context } = await open(env, { query: '?fast=1&ending=good-all' });
  await page.waitForSelector(tid('wx-hour'));
  assert.match(await page.textContent(`${tid('weather')} >> xpath=..`), /Weather · New York/);
  const options = await page.locator(`${tid('wx-hour')} option`).allTextContents();
  assert.equal(options.length, 24);
  assert.deepEqual(options.slice(0, 3), ['Now · 4 pm', '5 pm', '6 pm']);
  assert.ok(options.includes('Tue 12 am'), 'the day shows once the forecast passes midnight');
  assert.match(await page.textContent(tid('wx-read')), /16°C\s*foggy/, 'the current hour comes first');
  await page.selectOption(tid('wx-hour'), '2');
  assert.match(await page.textContent(tid('wx-read')), /17°C\s*rain/);
  assert.match(await page.textContent(tid('wx-read')), /Precipitation 18%/);
  assert.match(await page.textContent(tid('wx-now')), /^Now in New York: [A-Z][a-z]{2} \d{1,2} [A-Z][a-z]{2}, \d{1,2}:\d{2} (am|pm) E[SD]T$/);
  assert.doesNotMatch(await page.textContent(tid('paper')), /Fog on the river/, 'the real forecast replaces the paper’s own line');
  await page.screenshot({ path: `${ART}paper-weather.png`, fullPage: true });
  assert.deepEqual(errors, []);
  await context.close();
});

test('without a forecast (offline, or Open-Meteo down) the paper keeps its own weather line', async () => {
  const offline = await open(env, { query: '?fast=1&offline=1&ending=good-all' });
  await offline.page.waitForSelector(tid('paper'));
  assert.match(await offline.page.textContent(tid('weather')), /Fog on the river until mid-morning/);
  assert.equal(await offline.page.$(tid('wx-hour')), null);
  await offline.context.close();

  const down = await open(env, { query: '?fast=1&ending=good-all', allowErrors: [/500/] });
  await down.page.route('https://api.open-meteo.com/**', (r) => r.fulfill({ status: 500, contentType: 'application/json', body: '{}' }));
  await down.page.reload();
  await down.page.waitForFunction(() => document.querySelector('[data-testid="weather"]')?.textContent.includes('Fog on the river'));
  assert.equal(await down.page.$(tid('wx-hour')), null);
  assert.deepEqual(down.errors, []);
  await down.context.close();
});

test('phone layout: no sideways scroll, tabs switch between sessions and chat, the paper stacks', async () => {
  const { page, errors, context } = await open(env, { viewport: { width: 390, height: 844 } });
  await page.click(tid('begin'));
  await page.click(tid('start-night'));
  const wide = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  assert.equal(wide, false);
  await page.click(tid('tab-rail'));
  assert.ok(await page.isVisible(tid('thread-ty')));
  await page.click(tid('tab-chat'));
  assert.ok(await page.isVisible(tid('composer')));
  await page.screenshot({ path: `${ART}phone-play.png` });
  await context.close();
  const paper = await open(env, { viewport: { width: 390, height: 844 }, query: '?fast=1&ending=bad-some' });
  await paper.page.waitForSelector(tid('paper'));
  assert.equal(await paper.page.evaluate(() => document.querySelector('.ending').scrollWidth > window.innerWidth), false);
  await paper.page.screenshot({ path: `${ART}phone-paper.png`, fullPage: true });
  assert.deepEqual([...errors, ...paper.errors], []);
  await paper.context.close();
});
