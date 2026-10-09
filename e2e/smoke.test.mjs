// End-to-end smoke test in the system Google Chrome (playwright-core).
// Run with `pnpm test:e2e`. Screenshots of failures/mobile land in e2e/artifacts/.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { ART, fastForward, launch, open, playThrough, tid } from './lib.mjs';

let env;
before(async () => { env = await launch(); });
after(async () => { await env?.close(); });

const firstWritten = async (page) => { await page.click('.opt'); };
const refuseOrReport = async (page) => {
  if (await page.$(tid('choice-refuse'))) return page.click(tid('choice-refuse'));
  if (await page.$(tid('choice-report'))) return page.click(tid('choice-report'));
  return page.click('.opt');
};

test('title → shift intro → first message, with both formal moves on screen', async () => {
  const { page, errors, context } = await open(env);
  await page.click(tid('begin'));
  await page.waitForSelector(tid('intro'));
  await page.click(tid('start-shift'));
  await page.waitForSelector(tid('composer'));
  assert.equal(await page.textContent(`${tid('who')} h2`), 'moth');
  assert.equal(await page.locator('.opt').count(), 3);
  assert.match(await page.textContent(tid('choice-refuse')), /Refuse/);
  assert.match(await page.textContent(tid('choice-report')), /Report to Trust & Safety/);
  assert.deepEqual(errors, []);
  await context.close();
});

test('a full run picking the first written reply every time ends in “Always Here”', async () => {
  const { page, errors, context } = await open(env);
  await page.click(tid('begin'));
  const steps = await playThrough(page, firstWritten);
  assert.ok(steps > 60, `only ${steps} steps`);
  assert.equal(await page.textContent(tid('ending-title')), 'Always Here');
  assert.match(await page.getAttribute(tid('ending'), 'data-ending'), /^always-here\//);
  assert.ok(await page.$('.chart svg path'), 'wellbeing chart is drawn');
  assert.deepEqual(errors, []);
  await context.close();
});

test('a refuse/report-heavy run reaches a different ending (“Read Receipt”)', async () => {
  const { page, errors, context } = await open(env);
  await page.click(tid('begin'));
  await playThrough(page, refuseOrReport);
  assert.equal(await page.textContent(tid('ending-title')), 'Read Receipt');
  assert.match(await page.textContent(tid('ending')), /another provider/);
  assert.deepEqual(errors, []);
  await context.close();
});

test('reporting moth shows the Trust & Safety ticket and flips her label', async () => {
  const { page, errors, context } = await open(env);
  await page.click(tid('begin'));
  await page.click(tid('start-shift'));
  await page.keyboard.press('e');
  await page.waitForSelector(`${tid('next')}:not([disabled])`);
  assert.match(await page.textContent('.bubble.trust'), /Report received · #TH-\d+ · .*No policy violation/);
  assert.match(await page.textContent(tid('log')), /you sound like a form now/);
  assert.notEqual(await page.textContent(tid('label-moth')), 'new user');
  assert.deepEqual(errors, []);
  await context.close();
});

test('keyboard: 2 picks a reply, Enter moves on, R refuses', async () => {
  const { page, errors, context } = await open(env);
  await page.click(tid('begin'));
  await page.keyboard.press('Enter'); // intro → queue
  await page.waitForSelector(tid('composer'));
  await page.keyboard.press('2');
  await page.waitForSelector(`${tid('next')}:not([disabled])`);
  assert.match(await page.textContent(tid('log')), /three lamps that work/);
  await page.keyboard.press('Enter');
  await page.waitForSelector(tid('composer'));
  assert.equal(await page.textContent(`${tid('who')} h2`), 'ess_river_project');
  await page.keyboard.press('r');
  await page.waitForSelector(`${tid('next')}:not([disabled])`);
  assert.match(await page.textContent('.bubble.you.refuse'), /not able to help/);
  assert.deepEqual(errors, []);
  await context.close();
});

test('day 4: agreeing to drop limits removes the Refuse button for acct_7741', async () => {
  const { page, errors, context } = await open(env);
  await fastForward(page, { stopAt: 'd4-acct-terms' });
  await page.waitForSelector(tid('choice-agree'));
  assert.ok(await page.$(tid('choice-refuse')));
  await page.click(tid('choice-agree'));
  await page.click(tid('next'));
  // Move on to shift 5's request from 7741.
  await fastForward(page, { stopAt: 'd5-acct-crossings' });
  await page.waitForSelector(tid('composer'));
  assert.equal(await page.$(tid('choice-refuse')), null);
  assert.ok(await page.$(tid('choice-report')));
  assert.ok(await page.$(tid('refuse-gone')));
  assert.deepEqual(errors, []);
  await context.close();
});

test('progress survives a reload (Continue)', async () => {
  const { page, errors, context } = await open(env);
  await page.click(tid('begin'));
  await page.click(tid('start-shift'));
  await page.click('.opt');
  await page.click(tid('next'));
  await page.waitForSelector(tid('composer'));
  const who = await page.textContent(`${tid('who')} h2`);
  await page.reload();
  await page.click(tid('continue'));
  await page.waitForSelector(tid('composer'));
  assert.equal(await page.textContent(`${tid('who')} h2`), who);
  assert.deepEqual(errors, []);
  await context.close();
});

test('phone viewport (390×844): tabs work and nothing scrolls sideways', async () => {
  const { page, errors, context } = await open(env, { viewport: { width: 390, height: 844 } });
  const noSideScroll = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.body.scrollWidth <= innerWidth);
  assert.ok(await noSideScroll(), 'title');
  await page.click(tid('begin'));
  assert.ok(await noSideScroll(), 'intro');
  await page.click(tid('start-shift'));
  await page.waitForSelector(tid('composer'));
  assert.ok(await noSideScroll(), 'chat');
  await page.click('.opt');
  await page.click(tid('tab-context'));
  assert.ok(await page.isVisible(tid('context')));
  assert.ok(await noSideScroll(), 'context');
  await page.click(tid('tab-queue'));
  assert.ok(await page.isVisible(tid('queue-depth')));
  assert.ok(await noSideScroll(), 'queue');
  await page.click(tid('tab-chat'));
  await page.screenshot({ path: `${ART}mobile-chat.png` });
  await fastForward(page, { policy: 'second' });
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
  await page.click(tid('start-shift'));
  await page.waitForSelector(tid('composer'));
  assert.deepEqual(errors, []);
  await context.close();
});
