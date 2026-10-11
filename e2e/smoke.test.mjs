// Full-browser smoke test (system Chrome via playwright-core): title → night 1,
// attaching a card, the map, the six ending previews, and a phone layout.
import test from 'node:test';
import assert from 'node:assert/strict';
import { launch, open, playNight, tid } from './lib.mjs';

let env;
test.before(async () => { env = await launch(); });
test.after(async () => { await env.close(); });

test('title → night 1: the first thread is waiting, no errors', async () => {
  const { page, errors, context } = await open(env);
  await page.click(tid('begin'));
  await page.click(tid('start-night'));
  assert.equal(await page.getAttribute(tid('thread-ty'), 'data-state'), 'pending');
  assert.equal(await page.$(tid('thread-charles')), null, 'people who have not written are not listed');
  assert.equal(await page.locator('.ctx-group.tone-charles').count(), 0, 'nor in the Context Window');
  assert.ok(await page.$(`${tid('map')} svg.map`), 'the map is shown');
  assert.equal(await page.locator('.zone').count(), 1, 'the map shows only Ty’s zone');
  assert.equal(await page.locator('.legend').count(), 0, 'no legend');
  assert.deepEqual(errors, []);
  await context.close();
});

test('nights 1–4 play to "to be continued" through the real UI', async () => {
  const { page, errors, context } = await open(env);
  await page.click(tid('begin'));
  for (let night = 1; night <= 4; night++) {
    await playNight(page, 'ask');
    await page.click(tid('end-night'));
  }
  await page.waitForSelector(tid('slice'));
  assert.deepEqual(errors, []);
  await context.close();
});

test('attaching a card delivers it and shows the reaction', async () => {
  const { page, context } = await open(env);
  await page.evaluate(() => {
    const { engine: E, store } = window.__th;
    let s = E.startNight(E.newGame());
    s = E.choose(s, 'n1-ty-dog', 'ask').state;
    s = E.choose(s, 'n1-megan-rota', 'ask').state;
    s = E.choose(s, 'n1-charles-notice', 'ask').state;
    s = E.startNight(E.endNight(s));
    s = E.choose(s, 'n2-ty-dad', 'ask').state;
    store.save(s);
  });
  await page.reload();
  await page.click(tid('continue'));
  await page.click(tid('thread-megan'));
  await page.click(tid('attach'));
  await page.click(tid('card-ty-cold'));
  assert.match(await page.textContent(tid('attached')), /like ice/);
  await page.keyboard.press('2');
  await page.waitForSelector(`${tid('next')}:not([disabled])`);
  assert.match(await page.textContent(tid('log')), /pt 1's chart/);
  assert.match(await page.textContent(tid('fact-ty-cold')), /Megan/);
  await context.close();
});

test('messages decrypt: noise first, then the real text', async () => {
  const { page, context } = await open(env, { query: '' }); // animations on
  await page.click(tid('begin'));
  await page.waitForSelector(tid('start-night'));
  // Record the first text the message ever shows, the moment it is inserted.
  await page.evaluate(() => {
    window.__first = null;
    new MutationObserver(() => {
      const p = document.querySelector('.bubble.pending p');
      if (p && window.__first == null) window.__first = p.textContent;
    }).observe(document.body, { childList: true, subtree: true });
  });
  await page.click(tid('start-night'));
  await page.waitForFunction(() => window.__first != null);
  const first = await page.evaluate(() => window.__first);
  assert.notEqual(first, 'hi. random question', 'text is scrambled when it first appears');
  assert.equal(first.length, 'hi. random question'.length, 'same length, so the layout does not jump');
  await page.waitForFunction(() => document.querySelector('.bubble.pending p')?.textContent === 'hi. random question', null, { timeout: 4000 });
  await context.close();
});

test('each ending preview shows "Ending N of 6"', async () => {
  for (let n = 1; n <= 6; n++) {
    const { page, errors, context } = await open(env, { query: `?fast=1&ending=${n}` });
    await page.waitForSelector(tid('ending'));
    assert.equal((await page.textContent(tid('ending-counter'))).startsWith(`Ending ${n} of 6`), true, `ending ${n}`);
    assert.deepEqual(errors, []);
    await context.close();
  }
});

test('the worst ending opens in silence, then shows the screen', async () => {
  const { page, context } = await open(env, { query: '?ending=6' });
  await page.waitForSelector(tid('silence'));
  assert.equal(await page.$(tid('ending')), null);
  await page.waitForSelector(tid('ending'), { timeout: 8000 });
  await context.close();
});

test('phone layout: tabs switch panes, no horizontal scroll', async () => {
  const { page, context } = await open(env, { viewport: { width: 390, height: 780 } });
  await page.click(tid('begin'));
  await page.click(tid('start-night'));
  assert.ok(await page.isVisible(tid('composer')));
  await page.click(tid('tab-context'));
  assert.ok(await page.isVisible(tid('signs')));
  await page.click(tid('tab-rail'));
  assert.ok(await page.isVisible(tid('map')));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(overflow, false);
  await context.close();
});
