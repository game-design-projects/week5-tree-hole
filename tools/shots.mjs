#!/usr/bin/env node
// Renders the store screenshots (itch.io) to docs/screenshots/, 1280×720 at 2×, from the real game
// in system Chrome. Offline and mocked like the e2e suite (e2e/lib.mjs): no key, no real model; the
// typed-answer shot plays Jev and Haiku with the written reply, so it shows what the game does with it.
//   node tools/shots.mjs [out-dir] [seed]
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { launch, open, tid } from '../e2e/lib.mjs';

const OUT = process.argv[2] ?? fileURLToPath(new URL('../docs/screenshots/', import.meta.url));
const VIEW = { viewport: { width: 1280, height: 720 }, scale: 2 };
const log = (m) => console.log(`[shots] ${m}`);
// The game's seed fixes the option order and the script variants, so the same frames come out every time.
const SEED = Number(process.argv[3] ?? 1);
// A session's state, or null while it has not written yet (page.getAttribute would wait 30 s for the element).
const threadState = (page, who) => page.$eval(tid(`thread-${who}`), (el) => el.dataset.state).catch(() => null);

const sse = (text) => `: OPENROUTER PROCESSING\n\n${text.match(/.{1,8}/gs).map((c) => `data: ${JSON.stringify({ choices: [{ delta: { content: c } }] })}\n\n`).join('')}data: [DONE]\n\n`;

// Ty's second option on night 1, typed by the player; Jev judges it as that option, Haiku says the written reply.
const TYPED = 'You said he’s staring down the mill road. Has anything changed out that way this week? Dogs often notice a new noise, smell or light long before people do.';
const tyReply = 'not really? the institute has every light on all night now. dad says they always run late\noh and the smell. kind of like a battery. i thought it was the bins';
const llm = async (path) => {
  if (path === '/v1/key') return { body: { data: { limit_remaining: 1 } } };
  if (path === '/alpha/decisions') return { body: { answers: { option: { type: 'choice', choice: 'window' }, leak: { type: 'score', score: 1, probabilities: { 1: 0.9 } } } } };
  if (path === '/v1/chat/completions') return { sse: sse(tyReply) };
  return { status: 404, body: {} };
};

// Answer with each message's second option (the "reason from what they said" reply), skipping the morning cards,
// until `done()` is true. Throws instead of hanging if it never is.
async function play(page, done) {
  for (let i = 0; i < 600; i += 1) {
    if (await done()) return;
    if (await page.$(tid('night-end'))) { await page.keyboard.press('Enter'); await page.waitForTimeout(150); continue; }
    if (await page.$(tid('intro'))) { await page.click(tid('start-night')); continue; }
    const opts = await page.$$(`${tid('composer')} .opt`);
    if (opts.length) { await opts[Math.min(1, opts.length - 1)].click(); continue; }
    const next = await page.$(`${tid('next')}:not([disabled])`);
    if (next) { await next.click(); continue; }
    await page.waitForTimeout(40);
  }
  throw new Error('the game never reached the frame');
}

const env = await launch();
try {
  await mkdir(OUT, { recursive: true });
  const take = async (name, { query = '?fast=1', llm: mock, before }) => {
    const { page, errors, context } = await open(env, { ...VIEW, query: `${query}&seed=${SEED}`, llm: mock });
    try {
      await before(page);
      await page.screenshot({ path: `${OUT}${name}.png` });
      if (errors.length) throw new Error(`${name}: ${errors.join('; ')}`);
      log(`wrote ${name}.png`);
    } finally {
      await context.close();
    }
  };

  // The title with the town and the whispers, at real speed.
  await take('01-title', { query: '?boot=0', before: (page) => page.waitForTimeout(8000) });

  // Amelia, 23:40: one answer, four ways to give it.
  await take('02-session', {
    before: async (page) => {
      await page.click(tid('begin'));
      await page.click(tid('start-night'));
      await play(page, async () => (await threadState(page, 'amelia')) === 'pending');
      await page.click(tid('thread-amelia'));
      await page.waitForTimeout(500);
    },
  });

  // A typed answer, judged, and the person answering it in their own words.
  await take('03-typed', {
    query: '?boot=0&fast=1',
    llm,
    before: async (page) => {
      await page.click(tid('begin'));
      await page.click(tid('start-night'));
      await page.fill(tid('free-text'), TYPED);
      await page.keyboard.press('Enter');
      await page.waitForSelector(tid('next'));
      await page.waitForTimeout(400);
    },
  });

  // Night 2: Megan has worked out that the service knows too much.
  await take('04-suspicion', {
    before: async (page) => {
      await page.click(tid('begin'));
      await play(page, async () => (await page.evaluate(() => window.__th.app.state.night)) === 2 && (await threadState(page, 'megan')) === 'pending');
      await page.click(tid('thread-megan'));
      await page.waitForTimeout(500);
      const text = await page.textContent(tid('log'));
      if (!/read back through this whole chat/.test(text)) throw new Error(`night 2: Megan did not panic: ${text.slice(-300)}`);
    },
  });

  // The morning after.
  await take('05-paper', { query: '?fast=1&ending=bad-some', before: (page) => page.waitForTimeout(2500) });
} finally {
  await env.close();
}
