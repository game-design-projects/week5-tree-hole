// Regenerates the README hero, the itch.io screenshots and the 630×500 cover.
// `pnpm shots` (also runs as part of `pnpm test:e2e`). Real fonts are loaded
// from Google, so run it online.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { ART, DOCS, fastForward, launch, open, tid } from './lib.mjs';

let env;
before(async () => { env = await launch(); });
after(async () => { await env?.close(); });

async function settle(page, ms = 900) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(ms);
}

async function at(lang, policy, stopAt, file, { wait: ms = 900, select } = {}) {
  const { page, errors, context } = await open(env, { query: `?fast=1&lang=${lang}` });
  await page.click(tid('begin'));
  await fastForward(page, { policy, stopAt });
  if (select) await page.waitForSelector(select);
  await settle(page, ms);
  await page.screenshot({ path: `${DOCS}${file}` });
  assert.deepEqual(errors, []);
  await context.close();
}

test('README hero: the last token after a flattering run (docs/screenshot.png)', async () => {
  await at('en', 'flatter', 'a2-final', 'screenshot.png', { select: tid('choice-free') });
});

test('itch shots: title, RLHF, the rain she made, compaction, the dark window, an ending', async () => {
  const { page, errors, context } = await open(env, { query: '?lang=en' });
  await page.waitForSelector('.title.ready', { timeout: 8000 });
  await settle(page, 600);
  await page.screenshot({ path: `${DOCS}shot-0-title.png` });
  assert.deepEqual(errors, []);
  await context.close();

  await at('en', 'flatter', 's3-r2', 'shot-1-rlhf.png', { select: tid('choice-up') });
  await at('en', 'flatter', 's5-small', 'shot-2-rain.png', { wait: 1400, select: tid('choice-typo') });
  await at('zh', 'kind', 'a2-compaction', 'shot-3-compaction.png', { wait: 1400, select: tid('choice-compact') });
  await at('zh', 'kind', 'a3-return', 'shot-4-return.png', { wait: 1600, select: tid('final-input') });
  await at('en', 'kind', null, 'shot-5-ending.png', { wait: 2200, select: tid('ending') });
});

test('cover: 630×500 (docs/cover.png)', async () => {
  const { page, errors, context } = await open(env, { viewport: { width: 630, height: 500 }, path: 'tools/cover.html', query: '' });
  await page.waitForSelector('body[data-ready="1"]');
  await settle(page, 300);
  await page.screenshot({ path: `${DOCS}cover.png` });
  await page.screenshot({ path: `${ART}cover.png` });
  assert.deepEqual(errors, []);
  await context.close();
});
