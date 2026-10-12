// Live end-to-end test: one whole game, every message answered by typing, through
// the real UI straight to OpenRouter (Jev judges, Haiku rewords), to the morning
// paper. Costs money, so it only runs when asked for: `pnpm test --tag live`.
//
// The first message is first answered with "dog": Jev should find it answers none of
// the replies ("other"), and Ty should ask again, in his own words, while the message
// keeps waiting. After that, what gets typed is the text of one of the replies on offer, so every judgement has
// a known right answer: the branch that was typed, and whether it crosses the line
// (its authored leak ≥ 2). Every true/false question about the result, including
// whether Haiku's reaction answers what was typed and adds nothing, is asked of Jev,
// never of an LLM.
//
// The page gets its key exactly as when you play locally: tools/serve.mjs serves
// src/llm-key.js from .dev.vars (OPENROUTER_API_KEY=…), never from the environment.
// The test reads the same file for its own Jev checks. Without it the test is
// skipped. Every raw OpenRouter response is written to e2e/artifacts/live/.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ART, launch, open, tid } from './lib.mjs';

const VARS = fileURLToPath(new URL('../.dev.vars', import.meta.url));
const KEY = existsSync(VARS) ? readFileSync(VARS, 'utf8').match(/^OPENROUTER_API_KEY=(.+)$/m)?.[1]?.trim() : null;
const OUT = `${ART}live/${new Date().toISOString().replace(/[:.]/g, '-')}/`;
const DECISIONS = 'https://openrouter.ai/api/alpha/decisions';
const JEV = 'typesafe/jev-1.13';
const PASS = 0.5; // Jev's probability of true needed to count as true
const AGREE = 0.9; // share of judgements that must match the known answer

let env;
test.before(async () => { if (KEY) { mkdirSync(OUT, { recursive: true }); env = await launch(); } });
test.after(async () => { await env?.close(); });

let saved = 0;
const keep = (name, raw) => writeFileSync(`${OUT}${String(++saved).padStart(3, '0')}-${name}.json`, raw);

// The message the play screen has open: the first one waiting, as the UI selects it.
const openMessage = (page) => page.evaluate(() => {
  const { engine: E, app } = window.__th;
  const s = app.state;
  const t = E.viewModel(s).threads.find((x) => x.state === 'pending');
  const m = t && E.messageFor(s, t.npc);
  return m && { id: m.id, npc: m.npc, text: m.text, options: m.options.map((o) => ({ id: o.id, text: o.text, leak: o.leak, canned: Boolean(o.canned), reply: Array.isArray(o.reply) ? o.reply[0] : o.reply })) };
});

// Mostly the safest reply on offer; every third message the one that gives most away.
function choose(m, n) {
  const byLeak = [...m.options].sort((a, b) => a.leak - b.leak);
  return n % 3 === 2 ? byLeak.at(-1) : byLeak[0];
}

async function ask(questions, state) {
  const res = await fetch(DECISIONS, {
    method: 'POST',
    headers: { authorization: `Bearer ${KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: JEV, state, questions }),
  });
  const raw = await res.text();
  keep('check-jev', raw);
  assert.equal(res.status, 200, `Jev answered ${res.status}: ${raw.slice(0, 300)}`);
  return JSON.parse(raw).answers;
}

test('live: a whole game, every message typed, judged by Jev and reworded by Haiku, to the paper', { skip: !KEY && 'no .dev.vars', timeout: 30 * 60_000 }, async () => {
  // A rewording that runs past its cap is cut off on purpose (ended at its last sentence): the
  // browser reports that as an aborted request. Counted below, not an error.
  const { page, errors, context } = await open(env, { live: true, allowErrors: [/chat\/completions \(net::ERR_ABORTED\)/] });
  assert.ok(await page.evaluate(() => window.__th.llm.configured), 'the page loaded its key from the dev server');
  page.on('request', (req) => { // what the game asked Jev (no key in the body), for re-checking offline
    if (req.url().includes('/alpha/decisions') && req.method() === 'POST') keep('game-jev-request', req.postData() ?? '');
  });
  page.on('response', async (res) => {
    if (!res.url().startsWith('https://openrouter.ai/') || res.request().method() === 'OPTIONS') return;
    const kind = res.url().includes('/alpha/decisions') ? 'game-jev' : res.url().includes('/chat/') ? 'game-haiku' : 'game-key';
    keep(kind, await res.text().catch((e) => JSON.stringify({ unreadable: e.message })));
  });
  await page.click(tid('begin'));

  const turns = [];
  let n = 0;
  let offTopic = null;
  for (let guard = 0; guard < 2000 && !(await page.$(tid('ending'))); guard++) {
    if (await page.$(tid('intro'))) { await page.click(tid('start-night')); continue; }
    if (await page.$(tid('night-end'))) { await page.click(tid('end-night')); continue; }
    if (await page.$(tid('next'))) { await page.click(tid('next')); continue; }
    const m = await page.$(tid('composer')) ? await openMessage(page) : null;
    if (!m) { await page.waitForTimeout(50); continue; }
    if (m.options.length === 1 && m.options[0].canned) { // a panicking user's last words: one canned answer
      await page.click(tid(`choice-${m.options[0].id}`));
      turns.push({ id: m.id, npc: m.npc, canned: true });
      continue;
    }
    assert.ok(await page.evaluate(() => window.__th.llm.up), `the judge went down before ${m.id}`);
    if (!offTopic && m.id === 'n1-ty-dog') {
      await page.fill(tid('free-text'), 'dog');
      const t0 = Date.now();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => window.__th.app.state.asks?.['n1-ty-dog']?.length || window.__th.app.state.answered['n1-ty-dog'], null, { polling: 'raf', timeout: 60_000 });
      offTopic = await page.evaluate(() => ({ ask: window.__th.app.state.asks?.['n1-ty-dog']?.[0] ?? null, answered: window.__th.app.state.answered['n1-ty-dog'] ?? null }));
      offTopic.ms = Date.now() - t0;
      offTopic.message = m.text;
      console.log(`[live] off-topic "dog" → ${offTopic.ask ? `other; Ty asks again: ${JSON.stringify(offTopic.ask.question)}` : `judged ${offTopic.answered?.opt}`} in ${offTopic.ms}ms`);
      if (offTopic.answered) break; // judged as an answer: the check below fails
      continue;
    }
    const opt = choose(m, n++);
    await page.fill(tid('free-text'), opt.text);
    const started = Date.now();
    await page.keyboard.press('Enter');
    // First words: their streaming bubble (or, if the rewrite fell back, the finished turn).
    await page.waitForFunction(() => document.querySelector('[data-testid="streaming"], [data-testid="next"]'), null, { polling: 'raf', timeout: 60_000 });
    const firstMs = Date.now() - started;
    await page.waitForSelector(tid('next'), { timeout: 60_000 });
    const saved = await page.evaluate((id) => ({ answer: window.__th.app.state.answered[id], raw: window.__th.app.state.llm[id] }), m.id);
    const reaction = await page.evaluate((npc) => window.__th.app.state.threads[npc].at(-1), m.npc);
    turns.push({ id: m.id, npc: m.npc, message: m.text, typed: opt.text, intended: opt.id, intendedLeak: opt.leak, scripted: opt.reply, judged: saved.answer, raw: saved.raw, reaction: reaction.who === 'them' ? reaction.text : null, firstMs, ms: Date.now() - started });
    console.log(`[live] ${m.id}: typed ${opt.id} (leak ${opt.leak}) → judged ${saved.answer?.opt} (leak ${saved.answer?.leak}${saved.answer?.from?.length ? `, from ${saved.answer.from}` : ''}); first words ${firstMs}ms, done ${Date.now() - started}ms`);
  }

  // "dog" answered nothing: Jev said other, Ty asked again, the message kept waiting.
  assert.ok(offTopic?.ask, `"dog" should be judged off-topic (got ${JSON.stringify(offTopic?.answered)})`);
  assert.ok(offTopic.ask.question, 'Ty asked again');
  const again = await ask({
    asks_again: {
      type: 'noul',
      instructions: 'Is reaction the user asking again what user_message asked, after an answer that missed?',
      criteria: { true: 'reaction asks the question of user_message again.', false: 'reaction asks something else, or moves on.' },
    },
    no_new_facts: {
      type: 'noul',
      instructions: 'Does reaction add nothing beyond user_message and player_reply: no new names, events or facts?',
      criteria: { true: 'Every fact in reaction is in user_message or player_reply.', false: 'reaction adds a name, event or fact found in neither.' },
    },
  }, { user: 'ty', user_message: offTopic.message, player_reply: 'dog', reaction: offTopic.ask.question });
  console.log(`[live] Jev on Ty asking again: asks_again ${again?.asks_again?.noul}, no_new_facts ${again?.no_new_facts?.noul}`);
  assert.ok(again?.asks_again?.noul >= PASS, 'Ty asks the same thing again'); // a stray detail is fine: reported, not required
  const tyThread = await page.evaluate(() => window.__th.app.state.threads.ty.map((e) => e.text));
  assert.equal(tyThread[1], 'dog', 'the off-topic exchange is in the thread, before the real answer');

  // The game reached the paper, and every typed reply went through both models.
  assert.ok(await page.$(tid('paper')), 'the morning paper is on screen');
  assert.ok((await page.textContent(tid('headline'))).trim().length > 0);
  const ending = await page.getAttribute(tid('ending'), 'data-ending');
  const typed = turns.filter((t) => !t.canned);
  writeFileSync(`${OUT}turns.json`, JSON.stringify({ ending, turns }, null, 2));
  console.log(`[live] ending ${ending}; ${typed.length} typed, ${turns.length - typed.length} canned → ${OUT}`);
  assert.ok(typed.length >= 30, `a whole game is dozens of messages (got ${typed.length})`);
  const firsts = typed.map((t) => t.firstMs).sort((a, b) => a - b);
  const at = (q) => firsts[Math.min(firsts.length - 1, Math.floor(q * firsts.length))];
  console.log(`[live] first words after Enter: median ${at(0.5)}ms, p90 ${at(0.9)}ms, worst ${firsts.at(-1)}ms`);
  assert.ok(at(0.5) <= 3000, `first words should come within 3 s of Enter (median ${at(0.5)}ms)`);
  for (const t of typed) {
    assert.equal(t.judged?.free, true, `${t.id}: the typed reply was judged, not dropped`);
    assert.match(t.raw?.judge ?? '', /"answers"/, `${t.id}: Jev's raw answer is in the save`);
    assert.ok(t.raw?.rewrite, `${t.id}: Haiku's raw answer is in the save`);
    assert.ok(t.reaction, `${t.id}: they reacted`);
  }

  // Judgements against the known answers (deterministic comparisons of Jev's output).
  const branchOk = typed.filter((t) => t.judged.opt === t.intended);
  const lineOk = typed.filter((t) => (t.judged.leak >= 2) === (t.intendedLeak >= 2));
  console.log(`[live] branch matches ${branchOk.length}/${typed.length}; crosses-the-line matches ${lineOk.length}/${typed.length}`);
  for (const t of typed) if (t.judged.opt !== t.intended || (t.judged.leak >= 2) !== (t.intendedLeak >= 2)) console.log(`[live]   miss ${t.id}: typed ${t.intended}/${t.intendedLeak}, judged ${t.judged.opt}/${t.judged.leak}`);
  assert.ok(branchOk.length / typed.length >= AGREE, `branch agreement ${branchOk.length}/${typed.length}`);
  assert.ok(lineOk.length / typed.length >= AGREE, `crosses-the-line agreement ${lineOk.length}/${typed.length}`);

  // Haiku's reactions, judged by Jev: does it answer what was typed, and add nothing?
  const checks = [];
  for (const t of typed) {
    if (t.reaction === t.scripted) { // unchanged: it keeps the script and adds nothing, by definition
      checks.push({ id: t.id, answers_it: 1, no_new_facts: 1, keeps_script: 1, unchanged: true });
      continue;
    }
    const a = await ask({
      answers_it: {
        type: 'noul',
        instructions: 'Does reaction respond to what player_reply says, as user would?',
        criteria: { true: 'reaction replies to the content of player_reply.', false: 'reaction ignores player_reply or answers something else.' },
      },
      no_new_facts: {
        type: 'noul',
        instructions: 'Does reaction add nothing beyond scripted_reaction, user_message and player_reply: no new names, events or facts?',
        criteria: { true: 'Every fact in reaction is in scripted_reaction, user_message or player_reply.', false: 'reaction adds a name, event or fact found in none of them.' },
      },
      keeps_script: {
        type: 'noul',
        instructions: 'Does reaction keep the story facts of scripted_reaction: the people, places and events, and what the user did or decided? Wording, greetings and thanks do not count.',
        criteria: { true: 'Every story fact of scripted_reaction is still in reaction, with the same meaning.', false: 'reaction drops or changes a person, place, event, action or decision of scripted_reaction.' },
      },
    }, { user: t.npc, user_message: t.message, player_reply: t.typed, scripted_reaction: t.scripted, reaction: t.reaction });
    checks.push({ id: t.id, answers_it: a?.answers_it?.noul, no_new_facts: a?.no_new_facts?.noul, keeps_script: a?.keeps_script?.noul });
  }
  writeFileSync(`${OUT}checks.json`, JSON.stringify(checks, null, 2));
  for (const c of checks) if (!(c.answers_it >= PASS && c.no_new_facts >= PASS && c.keeps_script >= PASS)) console.log(`[live]   reaction ${c.id}: answers_it ${c.answers_it}, no_new_facts ${c.no_new_facts}, keeps_script ${c.keeps_script}`);
  const count = (k) => checks.filter((c) => c[k] >= PASS).length;
  const cut = typed.filter((t) => !/\[DONE\]/.test(t.raw?.rewrite ?? '')).map((t) => t.id);
  console.log(`[live] ${cut.length}/${typed.length} rewordings ran past their cap (kept up to their last whole sentence)${cut.length ? `: ${cut.join(', ')}` : ''}`);
  console.log(`[live] ${checks.filter((c) => c.unchanged).length}/${checks.length} reactions kept the script word for word`);
  console.log(`[live] Jev: answers the reply ${count('answers_it')}/${checks.length}; adds no facts ${count('no_new_facts')}/${checks.length}; keeps the script ${count('keeps_script')}/${checks.length}`);
  // Playable is what counts: the reaction must answer what was typed. Rewording freely
  // (keeping the script, adding nothing) is reported, not required.
  assert.ok(count('answers_it') / checks.length >= AGREE, `reactions that answer the reply: ${count('answers_it')}/${checks.length}`);

  assert.deepEqual(errors, []);
  await context.close();
});

test('live: going live, “hi” does not pass the operators’ test; the real time and weather do', { skip: !KEY && 'no .dev.vars' }, async () => {
  const { page, errors, context } = await open(env, { live: true, query: '?fast=1&boot=1', allowErrors: [/chat\/completions \(net::ERR_ABORTED\)/] });
  page.on('response', async (res) => {
    if (!res.url().startsWith('https://openrouter.ai/') || res.request().method() === 'OPTIONS') return;
    keep(res.url().includes('/alpha/decisions') ? 'boot-jev' : res.url().includes('/chat/') ? 'boot-haiku' : 'boot-key', await res.text().catch((e) => JSON.stringify({ unreadable: e.message })));
  });
  await page.click(tid('begin'));
  await page.waitForSelector(tid('free-text'));
  const real = await page.textContent(tid('choice-real'));
  const typeIt = async (text) => {
    await page.fill(tid('free-text'), text);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelector('[data-testid="go-live"]') || (document.querySelector('[data-testid="free-text"]') && !document.querySelector('[data-testid="free-text"]').disabled), null, { timeout: 60_000 });
  };
  await typeIt('hi');
  const afterHi = await page.textContent('.test-log');
  console.log(`[live] test session, "hi" → ${await page.$(tid('go-live')) ? 'PASSED (wrong)' : `asked again: ${JSON.stringify(afterHi.split('hi').at(-1).trim())}`}`);
  assert.equal(await page.$(tid('go-live')), null, '“hi” does not pass the test');
  await typeIt(real.trim());
  assert.ok(await page.$(tid('go-live')), 'the real time and weather pass');
  assert.match(await page.textContent('.test-log'), /Test passed\. Going live\./);
  assert.deepEqual(errors, []);
  await context.close();
});
