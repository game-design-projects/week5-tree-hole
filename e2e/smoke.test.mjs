// Full-browser smoke test (system Chrome via playwright-core): going live, the
// sessions and the map, one answer per message (picked or typed), the LLM falling
// away, settings, a three-night run, every ending's paper, and the phone layout.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ART, launch, loadState, open, playNight, tid } from './lib.mjs';

let env;
test.before(async () => { env = await launch(); });
test.after(async () => { await env.close(); });

const judgeAs = (result) => async (path) => {
  if (path === '/health') return { body: { ok: true } };
  if (path === '/geo') return { body: { city: 'Lisbon', country: 'PT', latitude: 38.72, longitude: -9.14, timezone: 'Europe/Lisbon' } };
  if (path === '/reply') return { body: { result } };
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

test('going live uses the connection’s city when the proxy knows it, and the one from Settings over that', async () => {
  const { page, context } = await open(env, { query: '?fast=1&boot=1', llm: judgeAs({}) });
  await page.click(tid('begin'));
  await page.waitForSelector(tid('choice-real'));
  assert.match(await page.textContent(tid('choice-real')), /Lisbon/);
  await context.close();

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

test('typed answers: the judge picks the branch, the reaction answers what you wrote', async () => {
  const { page, errors, context } = await open(env, { llm: judgeAs({ option: 'window', leak: 1, from: [], reply: 'the mill road? just the institute lights i guess' }) });
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
  assert.ok(await page.evaluate(() => window.__th.app.state.llm['n1-ty-dog'].reply), 'the raw response is kept');
  assert.deepEqual(errors, []);
  await context.close();
});

test('if the proxy fails, the text box disappears without a word and the replies on offer remain', async () => {
  let fail = false;
  const llm = async (path) => {
    if (path === '/health') return { body: { ok: !fail } };
    if (path === '/reply') return { status: 502, body: { error: 'upstream' } };
    return { status: 404, body: {} };
  };
  const { page, context } = await open(env, { llm, allowErrors: [/502/, /llm\.test/] });
  await page.click(tid('begin'));
  await page.click(tid('start-night'));
  fail = true;
  await page.fill(tid('free-text'), 'feed him cheese');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => !document.querySelector('[data-testid="free-text"]') && document.querySelector('[data-testid="composer"] .opt'));
  assert.equal(await page.locator('.bubble.you').count(), 0, 'nothing was sent');
  assert.doesNotMatch(await page.textContent('body'), /signal|offline|unavailable/i, 'and nothing says why');
  assert.equal(await page.evaluate(() => Object.keys(window.__th.app.state.answered).length), 0);
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
