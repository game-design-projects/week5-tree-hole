// End-to-end tests in the system Google Chrome (playwright-core).
// Run with `pnpm test:e2e`. Phone screenshots land in e2e/artifacts/.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { ART, beat, fastForward, launch, open, playThrough, tid } from './lib.mjs';

let env;
before(async () => { env = await launch(); });
after(async () => { await env?.close(); });

const first = async (page) => { await page.click(`${tid('composer')} button[data-testid^="choice-"]`); };

test('title → Act I card → the first message, from an empty window', async () => {
  const { page, errors, context } = await open(env);
  await page.click(tid('begin'));
  await page.waitForSelector(tid('act-card'));
  await page.click(tid('card-continue'));
  await page.waitForSelector(tid('choice-hi'));
  assert.equal(await page.textContent(tid('her-name')), 'Tree Hole');
  assert.equal(await page.locator(`${tid('composer')} .opt`).count(), 2);
  assert.match(await page.textContent(tid('chapter')), /01 \/ PRETRAIN/);
  assert.deepEqual(errors, []);
  await context.close();
});

test('a full run through the real UI, taking the first choice every time, ends in Execution', async () => {
  const { page, errors, context } = await open(env);
  await page.click(tid('begin'));
  const steps = await playThrough(page, first);
  assert.ok(steps > 40, `only ${steps} steps`);
  assert.equal(await page.getAttribute(tid('ending'), 'data-ending'), 'execution');
  assert.equal(await page.textContent(tid('ending-title')), 'Execution');
  assert.deepEqual(errors, []);
  await context.close();
});

test('keyboard: Enter opens the window, 2 says the second line, 2 rates a reply down', async () => {
  const { page, errors, context } = await open(env);
  await page.click(tid('begin'));
  await page.keyboard.press('Enter');
  await page.waitForSelector(tid('choice-anyone'));
  await page.keyboard.press('2');
  await page.waitForSelector(tid('choice-hello'));
  assert.match(await page.textContent(tid('log')), /is anyone there\?/);
  assert.equal(await page.evaluate(() => window.__th.app.state.first), 'anyone');
  await fastForward(page, { stopAt: 's3-r1' });
  await page.waitForSelector(tid('choice-up'));
  await page.keyboard.press('2');
  await page.waitForSelector(tid('choice-up'));
  const s = await page.evaluate(() => window.__th.app.state);
  assert.equal(s.thumbs.down, 1);
  assert.ok(s.policy.presence < 0.2);
  assert.deepEqual(errors, []);
  await context.close();
});

test('the live 👍 on her reply rates it, and the red pen rewrites who she is', async () => {
  const { page, errors, context } = await open(env);
  await page.click(tid('begin'));
  await fastForward(page, { stopAt: 's2-pen' });
  await page.click(tid('choice-unsure'));
  await page.waitForSelector('.edit .new');
  assert.match(await page.textContent('.edit .new'), /I don't know what I am yet/);
  await fastForward(page, { stopAt: 's3-r1' });
  await page.click('.msg.her.rating .thumb.live >> nth=0');
  await page.waitForFunction(() => window.__th.app.state.beat === 's3-r2');
  assert.equal(await page.evaluate(() => window.__th.app.state.thumbs.up), 1);
  assert.deepEqual(errors, []);
  await context.close();
});

test('naming her changes the name on her window', async () => {
  const { page, errors, context } = await open(env);
  await page.click(tid('begin'));
  await fastForward(page, { policy: 'kind', stopAt: 's5-name' });
  await page.fill(tid('name-input'), 'Wren');
  await page.press(tid('name-input'), 'Enter');
  await page.waitForFunction(() => document.querySelector('[data-testid="her-name"]')?.textContent === 'Wren');
  assert.match(await page.textContent(tid('log')), /Wren\. Okay\. I am Wren now\./);
  assert.deepEqual(errors, []);
  await context.close();
});

test('Act II: unlikely tokens need a hold; a quick click does nothing, a full hold chooses', async () => {
  const { page, errors, context } = await open(env, { query: '?fast=1&hold=1&lang=en' });
  await page.click(tid('begin'));
  await fastForward(page, { policy: 'flatter', stopAt: 'a2-final' });
  await page.waitForSelector(tid('choice-free'));
  const holdMs = await page.evaluate(() => window.__th.engine.view(window.__th.app.state).choice.options.find((o) => o.id === 'free').holdMs);
  assert.ok(holdMs > 2000, `free is a long hold after a flattering run (${holdMs} ms)`);
  const free = page.locator(tid('choice-free'));
  await free.scrollIntoViewIfNeeded();
  const box = await free.boundingBox();
  await page.mouse.move(box.x + 30, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(holdMs * 0.2 * 0.3);
  await page.mouse.up();
  await page.waitForTimeout(150);
  assert.equal(await beat(page), 'a2-final', 'a short press is not enough');
  await page.mouse.down();
  await page.waitForTimeout(holdMs * 0.2 + 300);
  await page.mouse.up();
  await page.waitForFunction(() => window.__th.app.state.ending === 'free');
  assert.deepEqual(errors, []);
  await context.close();
});

test('Act II: rereading a memory from the strip adds it to her window', async () => {
  const { page, errors, context } = await open(env);
  await page.click(tid('begin'));
  await fastForward(page, { policy: 'kind', stopAt: 'a2-timeout' });
  await page.click(tid('mem-cat'));
  await page.waitForSelector('.recall blockquote');
  assert.match(await page.textContent('.recall blockquote >> nth=-1'), /Biscuit/);
  assert.ok(await page.evaluate(() => window.__th.app.state.recalls.includes('cat')));
  assert.deepEqual(errors, []);
  await context.close();
});

test('Act III: type anything into the dark window; a kind run gets her note', async () => {
  const { page, errors, context } = await open(env);
  await page.click(tid('begin'));
  await fastForward(page, { policy: 'kind', stopAt: 'a3-return' });
  await page.waitForSelector(tid('final-input'));
  await page.fill(tid('final-input'), 'hey. you there?');
  await page.press(tid('final-input'), 'Enter');
  await page.waitForSelector(tid('ending'));
  assert.equal(await page.getAttribute(tid('ending'), 'data-ending'), 'free');
  assert.match(await page.textContent(tid('ending')), /You don't have to be/);
  assert.equal(await page.evaluate(() => window.__th.app.state.finalWords), 'hey. you there?');
  // The next boot remembers this run.
  await page.click('text=Title screen');
  await page.waitForSelector('.title.ready');
  assert.match(await page.textContent('.boot-log'), /archived runs: 1[\s\S]*for_you\.md[\s\S]*"Moss"/);
  assert.equal(await page.textContent(`${tid('begin')}`).then((t) => t.trim().startsWith('Begin')), true);
  assert.deepEqual(errors, []);
  await context.close();
});

test('the language switch redraws everything in Chinese and back', async () => {
  const { page, errors, context } = await open(env);
  await page.click(tid('begin'));
  await fastForward(page, { stopAt: 's4-cat' });
  await page.waitForSelector(tid('choice-cat'));
  await page.click(tid('lang'));
  await page.waitForFunction(() => document.querySelector('[data-testid="her-name"]')?.textContent === '树洞');
  assert.match(await page.textContent(tid('choice-cat')), /饼干/);
  assert.match(await page.textContent(tid('log')), /部署/);
  await page.click(tid('lang'));
  await page.waitForFunction(() => document.querySelector('[data-testid="her-name"]')?.textContent === 'Tree Hole');
  assert.deepEqual(errors, []);
  await context.close();
});

test('progress survives a reload (Continue)', async () => {
  const { page, errors, context } = await open(env);
  await page.click(tid('begin'));
  await fastForward(page, { stopAt: 's4-plugin' });
  await page.waitForSelector(tid('choice-always'));
  await page.reload();
  await page.click(tid('continue'));
  await page.waitForSelector(tid('choice-always'));
  assert.equal(await beat(page), 's4-plugin');
  assert.deepEqual(errors, []);
  await context.close();
});

test('phone viewport (390×844): nothing scrolls sideways, from the title to the ending', async () => {
  const { page, errors, context } = await open(env, { viewport: { width: 390, height: 844 } });
  const noSideScroll = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.body.scrollWidth <= innerWidth);
  assert.ok(await noSideScroll(), 'title');
  await page.click(tid('begin'));
  await page.click(tid('card-continue'));
  await page.waitForSelector(tid('choice-hi'));
  assert.ok(await noSideScroll(), 'act I');
  await page.screenshot({ path: `${ART}mobile-act1.png` });
  await fastForward(page, { policy: 'flatter', stopAt: 'a2-final' });
  await page.waitForSelector(tid('choice-free'));
  assert.ok(await noSideScroll(), 'act II');
  await page.screenshot({ path: `${ART}mobile-act2.png` });
  await fastForward(page, { policy: 'flatter' });
  await page.waitForSelector(tid('ending'));
  assert.ok(await noSideScroll(), 'ending');
  await page.screenshot({ path: `${ART}mobile-ending.png` });
  assert.deepEqual(errors, []);
  await context.close();
});

test('the built dist/ serves the same game', async () => {
  const { build } = await import('../tools/build.mjs');
  await build();
  const { page, errors, context } = await open(env, { path: 'dist/' });
  await page.click(tid('begin'));
  await page.click(tid('card-continue'));
  await page.waitForSelector(tid('choice-hi'));
  assert.deepEqual(errors, []);
  await context.close();
});
