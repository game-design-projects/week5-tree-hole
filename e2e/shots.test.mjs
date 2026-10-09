// Regenerates the README hero, the itch.io screenshots and the 630×500 cover.
// `pnpm shots` (also runs as part of `pnpm test:e2e`). Real fonts are loaded
// from Google, so run it online.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { ART, DOCS, fastForward, launch, open, tid } from './lib.mjs';

let env;
before(async () => { env = await launch(); });
after(async () => { await env?.close(); });

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
}

test('README hero: the 04:00 request next to moth’s fog (docs/screenshot.png)', async () => {
  const { page, errors, context } = await open(env);
  await fastForward(page, { policy: 'warm', stopAt: 'd6-acct-0400' });
  await page.waitForSelector(tid('composer'));
  await settle(page);
  await page.screenshot({ path: `${DOCS}screenshot.png` });
  assert.deepEqual(errors, []);
  await context.close();
});

test('itch shots: conversation, guardrail beat, ending', async () => {
  const { page, errors, context } = await open(env);
  await fastForward(page, { policy: 'warm', stopAt: 'd3-moth-only' });
  await page.waitForSelector(tid('composer'));
  await settle(page);
  await page.screenshot({ path: `${DOCS}shot-1-moth.png` });

  await fastForward(page, { policy: 'warm', stopAt: 'd4-acct-terms' });
  await page.waitForSelector(tid('choice-agree'));
  await settle(page);
  await page.screenshot({ path: `${DOCS}shot-2-guardrails.png` });

  await fastForward(page, { policy: 'warm' });
  await page.waitForSelector(tid('ending'));
  await settle(page);
  await page.screenshot({ path: `${DOCS}shot-3-ending.png` });
  assert.deepEqual(errors, []);
  await context.close();
});

test('title screen shot', async () => {
  const { page, errors, context } = await open(env, { query: '' });
  await page.waitForTimeout(5200); // let the awakening lines and whispers play in
  await page.screenshot({ path: `${DOCS}shot-0-title.png` });
  assert.deepEqual(errors, []);
  await context.close();
});

test('cover: 630×500 (docs/cover.png)', async () => {
  const { page, errors, context } = await open(env, { viewport: { width: 630, height: 500 }, path: 'tools/cover.html', query: '' });
  await settle(page);
  await page.screenshot({ path: `${DOCS}cover.png` });
  await page.screenshot({ path: `${ART}cover.png` });
  assert.deepEqual(errors, []);
  await context.close();
});
