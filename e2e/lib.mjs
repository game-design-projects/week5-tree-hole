// Shared e2e setup: static server over the source tree + system Chrome
// (playwright-core, no browser download). Pages open with ?fast=1 so typing
// delays and animations don't slow the run. Every outside call is mocked:
// Open-Meteo (weather, city search) and, when a test asks for it, OpenRouter.
// The page never reads a real key here: src/llm-key.js is always served by the
// test, and OpenRouter is unreachable unless a test plays it or passes `key`.
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { createStaticServer } from '../tools/serve.mjs';

export const ART = fileURLToPath(new URL('./artifacts/', import.meta.url));
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

const json = (body, status = 200) => ({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body) });

// `llm`: a function (path, body) → { status?, body } or { sse } (a streamed chat
// completion, as text) that plays OpenRouter, for the
// paths '/v1/key', '/alpha/decisions' (Jev) and '/v1/chat/completions' (Haiku); the
// page gets a fake key. `live`: nothing is intercepted, the page loads its key the way
// a player's browser does (tools/serve.mjs, from .dev.vars) and calls OpenRouter for
// real (`pnpm test --tag live` only). Neither: an empty key, so the game plays offline.
export async function open(env, { viewport = { width: 1280, height: 720 }, query = '?fast=1', llm = null, live = false, allowErrors = [] } = {}) {
  const context = await env.browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  const ignored = (t) => /fonts\.(googleapis|gstatic)\.com/.test(t) || allowErrors.some((re) => re.test(t));
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !ignored(m.text())) errors.push(`console: ${m.text()}`); });
  page.on('requestfailed', (r) => {
    const what = `${r.url()} (${r.failure()?.errorText ?? '?'})`;
    if (!ignored(what)) errors.push(`requestfailed: ${what}`);
  });
  // Two days of New York hours; "now" is 16:45 on the first, with fog at 4 pm and rain after.
  const stamps = Array.from({ length: 48 }, (_, i) => `2026-10-${i < 24 ? '12' : '13'}T${String(i % 24).padStart(2, '0')}:00`);
  await page.route('https://api.open-meteo.com/**', (r) => r.fulfill(json({
    current: { time: '2026-10-12T16:45', temperature_2m: 12.4, weather_code: 61 }, current_units: { temperature_2m: '°C' },
    hourly_units: { temperature_2m: '°C' },
    hourly: { time: stamps, temperature_2m: stamps.map((_, i) => 8 + (i % 24) / 2), weather_code: stamps.map((_, i) => (i === 16 ? 45 : 61)), precipitation_probability: stamps.map((_, i) => i % 24) },
  })));
  await page.route('https://geocoding-api.open-meteo.com/**', (r) => r.fulfill(json({ results: [{ name: 'Lisbon', country_code: 'PT', admin1: 'Lisbon', latitude: 38.72, longitude: -9.14, timezone: 'Europe/Lisbon' }] })));
  await page.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  if (!live) {
    await page.route('**/src/llm-key.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: `export default ${JSON.stringify(llm ? 'test-key' : '')};` }));
    await page.route('https://openrouter.ai/**', async (r) => {
      const req = r.request();
      if (!llm) {
        errors.push(`unexpected OpenRouter call: ${req.url()}`);
        return r.abort();
      }
      if (req.method() === 'OPTIONS') return r.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization,content-type,x-title', 'access-control-allow-methods': 'GET,POST,OPTIONS' } });
      const path = new URL(req.url()).pathname.replace(/^\/api/, '');
      const out = await llm(path, req.postData() ? JSON.parse(req.postData()) : null);
      if (out.sse != null) return r.fulfill({ status: 200, contentType: 'text/event-stream', headers: { 'access-control-allow-origin': '*' }, body: out.sse });
      return r.fulfill(json(out.body, out.status ?? 200));
    });
  }
  await page.goto(env.base + query);
  await page.waitForFunction(() => window.__th); // main.js loads the key before it starts (top-level await)
  return { context, page, errors };
}

// Click through the real UI until the morning card (or the ending): answer whatever
// is waiting with the option at `index` (0 = first in the list).
export async function playNight(page, index = 0) {
  for (let i = 0; i < 200; i++) {
    if (await page.$(tid('night-end')) || await page.$(tid('ending'))) return;
    if (await page.$(tid('intro'))) { await page.click(tid('start-night')); continue; }
    if (await page.$(`${tid('next')}:not([disabled])`)) { await page.click(tid('next')); continue; }
    const opts = await page.$$(`${tid('composer')} .opt`);
    if (opts.length) { await opts[Math.min(index, opts.length - 1)].click(); continue; }
    await page.waitForTimeout(30);
  }
  throw new Error('night did not finish');
}

// Put a state into the save and reload into it.
export async function loadState(page, build) {
  await page.evaluate(build);
  await page.reload();
  await page.click(tid('continue'));
}
