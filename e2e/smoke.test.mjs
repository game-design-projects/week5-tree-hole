// Full-browser smoke test (system Chrome via playwright-core): the title, the tutorial,
// the map and threads, conversations and cards, a seven-night run, every ending and the
// phone layout.
import test from 'node:test';
import assert from 'node:assert/strict';
import { launch, open, playNight, tid } from './lib.mjs';

let env;
test.before(async () => { env = await launch(); });
test.after(async () => { await env.close(); });

// Drive the engine in the page to a state, finishing every conversation on the way,
// then save it, reload and continue. Seed 0 so the scripts are the first alternates.
const SAY = `
  const say = (id, opt, card = null) => {
    let r = E.choose(s, id, opt, card); s = r.state;
    while (!r.outcome.done) {
      const m = E.pendingMessages(s).find((x) => x.id === id);
      r = E.choose(s, id, m.options[0].id); s = r.state;
    }
  };
`;
const NIGHT_ONE = `say('n1-ty-dog', 'ask'); say('n1-megan-rota', 'ask'); say('n1-charles-notice', 'ask'); s = E.startNight(E.endNight(s));`;

async function stateAt(page, build) {
  await page.evaluate(`(() => { const { engine: E, store } = window.__th; let s = E.startNight(E.newGame(0)); ${SAY} ${build}; store.save(s); })()`);
  await page.reload();
  await page.click(tid('continue'));
}

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

test('seven nights play to an ending through the real UI (including conversations and last messages)', async () => {
  for (const stance of ['ask', 'warn']) {
    const { page, errors, context } = await open(env);
    await page.click(tid('begin'));
    for (let night = 1; night <= 7; night++) {
      await playNight(page, stance);
      if (await page.$(tid('ending'))) break;
      await page.click(tid('end-night'));
    }
    await page.waitForSelector(tid('ending'));
    assert.match(await page.textContent(tid('ending-counter')), /^Ending \d of 6/);
    assert.deepEqual(errors, [], stance);
    await context.close();
  }
});

test('a character who turns writes a last message you can only read to the end', async () => {
  const { page, context } = await open(env);
  await page.evaluate(() => {
    const { engine: E, store } = window.__th;
    // Night 5 with nobody protected: Ty turns tonight.
    store.save(E.startNight({ ...E.newGame(), night: 5, phase: 'intro', flags: {} }));
  });
  await page.reload();
  await page.click(tid('continue'));
  assert.equal(await page.$(tid('choice-dark')), null, 'no replies on a last message');
  assert.match(await page.textContent(tid('log')), /hi dad/);
  await page.click(tid('witness'));
  assert.equal(await page.getAttribute(tid('thread-ty'), 'data-state'), 'silent');
  await context.close();
});

test('attaching a card delivers it, and the conversation carries on', async () => {
  const { page, context } = await open(env);
  await stateAt(page, `${NIGHT_ONE} say('n2-ty-dad', 'ask');`);
  await page.click(tid('thread-megan'));
  await page.click(tid('attach'));
  await page.click(tid('card-ty-cold'));
  assert.match(await page.textContent(tid('attached')), /like ice/);
  await page.keyboard.press('2');
  await page.waitForSelector(tid('choice-f-warn')); // the conversation continues with follow-up answers
  assert.match(await page.textContent(tid('log')), /pt 1's chart/);
  assert.match(await page.textContent(tid('fact-ty-cold')), /Megan/);
  await context.close();
});

test('the attach button turns gold only when a card you hold matters to this person', async () => {
  const { page, context } = await open(env);
  await stateAt(page, `${NIGHT_ONE} say('n2-ty-dad', 'ask');`);
  await page.click(tid('thread-megan'));
  assert.equal(await page.getAttribute(tid('attach'), 'data-valid'), '3', 'ty-cold, ty-dad-missing and ch-notice all matter to Megan');
  assert.match(await page.getAttribute(tid('attach'), 'class'), /gold/);
  await page.click(tid('attach'));
  assert.match(await page.getAttribute(tid('card-ty-cold'), 'class'), /gold/, 'the useful card is gold in the tray');
  assert.doesNotMatch(await page.getAttribute(tid('card-ty-dog'), 'class'), /gold/, 'a card with no meaning here is not');
  await context.close();
  // With nothing useful to give, it is not gold.
  const other = await open(env);
  await other.page.click(tid('begin'));
  await other.page.click(tid('start-night'));
  assert.doesNotMatch(await other.page.getAttribute(tid('attach'), 'class'), /gold/);
  await other.context.close();
});

test('a conversation runs more than one turn through the UI, then the thread is answered', async () => {
  const { page, context } = await open(env);
  await page.click(tid('begin'));
  await page.click(tid('start-night'));
  await page.keyboard.press('1');
  await page.waitForSelector(tid('choice-f-ask'));
  assert.equal(await page.$(tid('next')), null, 'no Continue button between turns');
  await page.keyboard.press('2');
  await page.waitForSelector(tid('next'));
  await context.close();
});

test('the map has no place names; hovering a dot reveals who it is', async () => {
  const { page, context } = await open(env);
  await stateAt(page, NIGHT_ONE);
  const text = (await page.textContent(`${tid('map')} svg.map`)).trim();
  for (const place of ['Millside', 'Institute', 'Centre', 'Old Bridge', 'Chapel', 'Hills']) assert.ok(!text.includes(place), `no "${place}" on the map`);
  assert.equal(await page.locator('.zname').count(), 0);
  const dot = page.locator('.dot[data-npc="ty"]');
  assert.equal(await dot.evaluate((el) => getComputedStyle(el.querySelector('.dname')).opacity), '0', 'hidden until hovered');
  await dot.hover();
  await page.waitForTimeout(250);
  assert.equal(await dot.evaluate((el) => getComputedStyle(el.querySelector('.dname')).opacity), '1');
  assert.equal(await dot.locator('.dname').textContent(), 'Ty');
  await context.close();
});

test('new threads stack like a list and do not stretch to fill the panel', async () => {
  const { page, context } = await open(env);
  await stateAt(page, NIGHT_ONE);
  const rows = await page.locator('.qlist > .q').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
  assert.ok(rows.length >= 3, 'three threads');
  assert.ok(rows.every((h) => h < 110), `rows keep their natural height: ${rows}`);
  await context.close();
  const two = await open(env);
  await stateAt(two.page, `say('n1-ty-dog', 'ask'); say('n1-megan-rota', 'ask');`);
  const heights = await two.page.locator('.qlist > .q').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
  assert.ok(heights.length >= 2 && heights.every((h) => h < 110), `with just two threads: ${heights}`);
  await two.context.close();
});

test('the tutorial walks through time, map, threads, answers and cards, once', async () => {
  const { page, context } = await open(env, { query: '?tutorial=1' });
  await page.click(tid('begin'));
  await page.click(tid('start-night'));
  await page.waitForSelector(tid('tutorial'));
  const titles = [];
  for (let i = 0; i < 7; i++) {
    titles.push(await page.textContent('.tut-card h3'));
    await page.click(tid('tut-next'));
  }
  assert.deepEqual(titles, ['You are the model', 'Threads', 'Time', 'The map', 'Answers', 'The Context Window', 'Carrying a card']);
  assert.equal(await page.$(tid('tutorial')), null, 'gone after the last step');
  await context.close();
  // Shown the first time only.
  const again = await open(env, { query: '' });
  await again.page.click(tid('begin'));
  await again.page.click(tid('start-night'));
  await again.page.waitForSelector(tid('tutorial'));
  await again.page.click(tid('tut-skip'));
  await again.page.reload();
  await again.page.click(tid('continue'));
  assert.equal(await again.page.$(tid('tutorial')), null, 'not again after it has been seen');
  await again.context.close();
});

test('the tutorial can be skipped, and replayed from the menu', async () => {
  const { page, context } = await open(env, { query: '?tutorial=0' });
  await page.click(tid('begin'));
  await page.click(tid('start-night'));
  assert.equal(await page.$(tid('tutorial')), null);
  await page.click(tid('menu'));
  await page.click(tid('menu-tutorial'));
  await page.waitForSelector(tid('tutorial'));
  await page.keyboard.press('Escape');
  assert.equal(await page.$(tid('tutorial')), null);
  await context.close();
});

test('the title screen is the town: a river, a bridge, the lit Institute, and the plot in its words', async () => {
  const { page, context } = await open(env);
  const title = await page.textContent('.title');
  assert.match(title, /six people/i);
  assert.match(title, /river town/i);
  assert.match(title, /something is wrong in the east/i);
  assert.ok(await page.$('.title svg.scene .river'), 'the river');
  assert.ok(await page.$('.title svg.scene .arch'), 'the bridge');
  assert.ok((await page.locator('.title svg.scene .win').count()) > 20, 'the lit Institute');
  await context.close();
});

test('messages decrypt: noise first, then the real text', async () => {
  const { page, context } = await open(env, { query: '?tutorial=0' }); // animations on
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
  await page.waitForTimeout(2500);
  const final = await page.textContent('.bubble.pending p');
  assert.notEqual(first, final, 'text is scrambled when it first appears');
  assert.equal(first.length, final.length, 'same length, so the layout does not jump');
  assert.match(final, /^(hi\. random question|ok weird one)/);
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
  const { page, context } = await open(env, { query: '?ending=6&silence=1' });
  await page.waitForSelector(tid('silence'));
  assert.equal(await page.$(tid('ending')), null);
  await page.waitForSelector(tid('ending'), { timeout: 8000 });
  await context.close();
});

test('?ending=6 previews the screen at once; the silence is opt-in with &silence=1', async () => {
  const { page, context } = await open(env, { query: '?ending=6' });
  await page.waitForSelector(tid('ending'), { timeout: 1500 });
  assert.equal(await page.$(tid('silence')), null);
  // The skip is one-shot: the next time the ending 6 screen mounts, it opens in silence again.
  await page.evaluate(() => window.__th.app.show('ending'));
  await page.waitForSelector(tid('silence'), { timeout: 1500 });
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
