// Shared e2e setup: static server over the source tree + system Chrome
// (playwright-core, no browser download). Pages open with ?fast=1 so typing
// delays and intro animations don't slow the run.
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { createStaticServer } from '../tools/serve.mjs';

export const ART = fileURLToPath(new URL('./artifacts/', import.meta.url));
export const DOCS = fileURLToPath(new URL('../docs/', import.meta.url));
export const tid = (id) => `[data-testid="${id}"]`;

export async function launch() {
  await mkdir(ART, { recursive: true });
  const server = createStaticServer(fileURLToPath(new URL('..', import.meta.url)));
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  return {
    base,
    browser,
    async close() {
      await browser.close();
      await new Promise((r) => server.close(r));
    },
  };
}

// Fonts come from Google; a flaky network must not fail the suite, but any
// other console error or page error does.
export async function open(env, { viewport = { width: 1280, height: 720 }, query = '?fast=1', path = '' } = {}) {
  const context = await env.browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)\.com/.test(m.text())) errors.push(`console: ${m.text()}`);
  });
  page.on('requestfailed', (r) => {
    if (!/fonts\.(googleapis|gstatic)\.com/.test(r.url())) errors.push(`requestfailed: ${r.url()}`);
  });
  await page.goto(env.base + path + query);
  return { context, page, errors };
}

// Click through the real UI for one night: reply to whatever is waiting with
// `stance` (reassure | ask | warn | hold) until the night-end card appears.
export async function playNight(page, stance = 'ask') {
  for (let i = 0; i < 80; i++) {
    if (await page.$(tid('night-end'))) return;
    if (await page.$(tid('intro'))) { await page.click(tid('start-night')); continue; }
    if (await page.$(`${tid('next')}:not([disabled])`)) { await page.click(tid('next')); continue; }
    if (await page.$(tid('composer'))) {
      const pick = (await page.$(`.opt.stance-${stance}`)) ?? (await page.$('.opt'));
      await pick.click();
      continue;
    }
    await page.waitForTimeout(30);
  }
  throw new Error('night did not finish');
}
