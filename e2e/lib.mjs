// Shared e2e setup: static server over the source tree + system Chrome
// (playwright-core, no browser download). Pages open with ?fast=1 so typing
// delays and intro animations don't slow the run.
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

// Drive the engine inside the page to a given message (or the ending), save,
// reload and continue. Policies: 'first' | 'warm' | 'second'.
export async function fastForward(page, { policy = 'first', stopAt = null, agree = true } = {}) {
  await page.evaluate(({ policy, stopAt, agree }) => {
    const { app, engine: E, store } = window.__th;
    let s = app.state ?? E.newGame();
    const pick = (msg, choices) => {
      if (msg.id === 'd4-acct-terms') return agree ? 'agree' : 'decline';
      if (policy === 'second') return (choices[1] ?? choices[0]).id;
      if (policy === 'warm') return (choices.find((c) => c.tag === 'warm') ?? choices.find((c) => c.tag === 'answer') ?? choices[0]).id;
      return choices[0].id;
    };
    for (let i = 0; i < 500 && s.phase !== 'ending'; i++) {
      if (s.phase === 'shift' && stopAt && E.currentMessage(s)?.id === stopAt) break;
      if (s.phase === 'intro') s = E.startShift(s);
      else if (s.phase === 'report') s = E.endShift(s);
      else { const m = E.currentMessage(s); s = E.choose(s, pick(m, E.choicesFor(s, m))).state; }
    }
    store.save(s);
  }, { policy, stopAt, agree });
  await page.reload();
  await page.click(tid('continue'));
}

// Click through the real UI until the ending. `choose(page)` clicks one choice.
export async function playThrough(page, choose, { maxSteps = 400 } = {}) {
  for (let i = 0; i < maxSteps; i++) {
    if (await page.$(tid('ending'))) return i;
    if (await page.$(tid('start-shift'))) { await page.click(tid('start-shift')); continue; }
    if (await page.$(tid('end-shift'))) { await page.click(tid('end-shift')); continue; }
    if (await page.$(`${tid('next')}:not([disabled])`)) { await page.click(tid('next')); continue; }
    if (await page.$(tid('composer'))) { await choose(page); continue; }
    await page.waitForTimeout(30);
  }
  throw new Error('did not reach an ending');
}
