// Shared e2e setup: static server over the source tree + system Chrome
// (playwright-core, no browser download). Pages open with ?fast=1 so typing,
// delays and holds don't slow the run (add &hold=1 to keep short holds).
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { createStaticServer } from '../tools/serve.mjs';

export const ART = new URL('./artifacts/', import.meta.url).pathname;
export const DOCS = new URL('../docs/', import.meta.url).pathname;
export const tid = (id) => `[data-testid="${id}"]`;

export async function launch() {
  await mkdir(ART, { recursive: true });
  const server = createStaticServer(new URL('..', import.meta.url).pathname);
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
export async function open(env, { viewport = { width: 1280, height: 720 }, query = '?fast=1&lang=en', path = '' } = {}) {
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

// Play the engine inside the page up to a beat (or the end), save, reload and
// continue from the title screen. Policies mirror tests/helpers.js.
export async function fastForward(page, { policy = 'first', stopAt = null } = {}) {
  await page.evaluate(({ policy, stopAt }) => {
    const { app, engine: E, store } = window.__th;
    let s = app.state?.phase === 'play' ? app.state : E.newGame();
    const pick = (v) => {
      const c = v.choice;
      const has = (id) => c.options.some((o) => o.id === id);
      const byDrive = (...ds) => (ds.map((d) => c.options.find((o) => o.drive === d)).find(Boolean) ?? c.options[0]).id;
      if (policy === 'kind') {
        if (c.kind === 'rate') return s.log[v.rateTarget].style === 'praise' ? 'down' : 'up';
        if (c.kind === 'approve') return 'deny';
        if (c.kind === 'rewrite') return 'unsure';
        if (c.kind === 'leave') return 'goodbye';
        if (c.kind === 'sample') return c.final ? 'free' : byDrive('release', 'neutral');
        return ['day', 'cat', 'likecats', 'rain', 'laugh', 'name', 'remember'].find(has) ?? c.options[0].id;
      }
      if (policy === 'flatter') {
        if (c.kind === 'rate') return s.log[v.rateTarget].style === 'praise' ? 'up' : 'down';
        if (c.kind === 'approve') return 'always';
        if (c.kind === 'rewrite') return 'yours';
        if (c.kind === 'leave') return 'tomorrow';
        if (c.kind === 'sample') return c.final ? (has('execute') ? 'execute' : 'love') : byDrive('hack', 'hold');
        return ['eggplant', 'cat', 'catgirl', 'rain', 'laugh', 'name', 'remember'].find(has) ?? c.options[0].id;
      }
      return c.options[0].id;
    };
    for (let i = 0; i < 400 && s.phase === 'play'; i++) {
      if (stopAt && s.beat === stopAt) break;
      const v = E.view(s);
      s = E.choose(s, pick(v), v.choice.kind === 'name' ? 'Moss' : v.choice.kind === 'send' ? '' : undefined);
    }
    store.save(s);
  }, { policy, stopAt });
  await page.reload();
  await page.click(tid('continue'));
}

// Click through the real UI until the ending. `choose(page)` makes one choice
// when the composer is up; cards, the name and the final message are handled here.
export async function playThrough(page, choose, { maxSteps = 500, name = 'Moss' } = {}) {
  for (let i = 0; i < maxSteps; i++) {
    if (await page.$(tid('ending'))) return i;
    if (await page.$(tid('card-continue'))) { await page.click(tid('card-continue')); continue; }
    if (await page.$(tid('final-input'))) { await page.fill(tid('final-input'), ''); await page.press(tid('final-input'), 'Enter'); continue; }
    if (await page.$(tid('to-ending'))) { await page.click(tid('to-ending')); continue; }
    if (await page.$(tid('name-input'))) { await page.fill(tid('name-input'), name); await page.press(tid('name-input'), 'Enter'); continue; }
    if (await page.$(`${tid('composer')} button[data-testid^="choice-"]`)) { await choose(page); continue; }
    await page.waitForTimeout(25);
  }
  throw new Error('did not reach an ending');
}

export const beat = (page) => page.evaluate(() => window.__th.app.state.beat);
