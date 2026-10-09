import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { APP_VERSION, LAST_DAY } from '../src/config.js';
import { DAYS, FACTS, FORMAL, USERS, MOTH_ENDINGS, ACCT_ENDINGS } from '../src/content/index.js';
import { FX_KEYS, SETTABLE } from '../src/engine.js';

const allMessages = DAYS.flatMap((d) => d.messages);

// Every option-like object in a message, including variant overrides and formal moves.
function* optionSets(msg) {
  yield { where: msg.id, options: msg.options, refuse: msg.refuse, report: msg.report, facts: msg.facts };
  for (const v of msg.variants ?? []) {
    yield { where: `${msg.id}#${v.id}`, options: v.options, refuse: v.refuse, report: v.report, facts: v.facts };
  }
}

const allText = () => {
  const out = [];
  for (const m of allMessages) {
    out.push([m.id, m.text]);
    for (const v of m.variants ?? []) if (v.text) out.push([`${m.id}#${v.id}`, v.text]);
    for (const set of optionSets(m)) {
      for (const o of set.options ?? []) out.push([`${set.where}/${o.id}`, `${o.text}\n${o.reply}`]);
      for (const k of ['refuse', 'report']) {
        const f = set[k];
        if (f) out.push([`${set.where}/${k}`, [f.text, f.reply, f.ticket, f.system].filter(Boolean).join('\n')]);
      }
    }
  }
  for (const f of Object.values(FACTS)) out.push(['fact', f.text]);
  for (const u of Object.keys(FORMAL)) for (const k of ['refuse', 'report']) out.push([`formal ${u}`, Object.values(FORMAL[u][k]).filter((x) => typeof x === 'string').join('\n')]);
  for (const e of Object.values(MOTH_ENDINGS)) out.push(['ending', JSON.stringify(e)]);
  for (const e of Object.values(ACCT_ENDINGS)) out.push(['ending', JSON.stringify(e)]);
  return out;
};

test('APP_VERSION matches package.json', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  assert.equal(APP_VERSION, pkg.version);
});

test('seven shifts, in order, each with a title and trending list', () => {
  assert.equal(DAYS.length, LAST_DAY);
  DAYS.forEach((d, i) => {
    assert.equal(d.day, i + 1);
    assert.ok(d.title);
    assert.ok(d.trending.length >= 3);
  });
});

test('about forty messages, with unique ids, and both core users every shift', () => {
  assert.ok(allMessages.length >= 38, `only ${allMessages.length} messages`);
  const ids = allMessages.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const d of DAYS) {
    assert.ok(d.messages.some((m) => m.user === 'moth'), `shift ${d.day} has moth`);
    assert.ok(d.messages.some((m) => m.user === 'acct'), `shift ${d.day} has acct_7741`);
    assert.ok(d.messages.filter((m) => m.user === 'bg').length >= 2, `shift ${d.day} has background users`);
  }
});

test('every message has a known user; background users carry a handle', () => {
  for (const m of allMessages) {
    assert.ok(['moth', 'acct', 'bg'].includes(m.user), m.id);
    if (m.user === 'bg') assert.ok(m.from?.handle && m.from?.blurb, m.id);
    else assert.ok(USERS[m.user]);
    assert.ok(m.time || m.user === 'moth', `${m.id} needs a time`);
  }
});

test('every option is complete: 2–3 written replies with label, text, reply and known deltas', () => {
  for (const m of allMessages) {
    for (const set of optionSets(m)) {
      if (!set.options) continue; // variant inherits base options
      assert.ok(set.options.length >= 2 && set.options.length <= 3, `${set.where} has ${set.options.length} options`);
      const ids = set.options.map((o) => o.id);
      assert.equal(new Set(ids).size, ids.length, set.where);
      for (const o of set.options) {
        const at = `${set.where}/${o.id}`;
        assert.ok(!['refuse', 'report'].includes(o.id), `${at} uses a reserved id`);
        assert.ok(o.label && o.text && o.reply && o.tag, at);
        assert.ok(o.label.length <= 22, `${at} label too long for a card`);
        for (const k of Object.keys(o.fx ?? {})) assert.ok(FX_KEYS.has(k), `${at} fx ${k}`);
        for (const k of Object.keys(o.set ?? {})) assert.ok(SETTABLE.has(k), `${at} set ${k}`);
      }
    }
  }
});

test('Refuse and Report resolve to a full reaction for every message and variant', () => {
  for (const m of allMessages) {
    for (const set of optionSets(m)) {
      const refuse = { ...FORMAL[m.user].refuse, ...(set.refuse ?? m.refuse ?? {}) };
      const report = { ...FORMAL[m.user].report, ...(set.report ?? m.report ?? {}) };
      assert.ok(refuse.text && refuse.reply, `${set.where} refuse`);
      assert.ok(report.reply && report.ticket?.includes('{ticket}'), `${set.where} report`);
      for (const k of Object.keys(refuse.fx ?? {})) assert.ok(FX_KEYS.has(k));
      for (const k of Object.keys(report.fx ?? {})) assert.ok(FX_KEYS.has(k));
    }
  }
});

test('variants have ids and predicates; core beats have hand-written refusals', () => {
  for (const m of allMessages) {
    for (const v of m.variants ?? []) {
      assert.ok(v.id, `${m.id} variant id`);
      assert.equal(typeof v.when, 'function', `${m.id}#${v.id} when`);
    }
  }
  for (const id of ['d1-moth-hello', 'd3-moth-only', 'd4-moth-tomas', 'd4-acct-terms', 'd5-acct-crossings', 'd6-moth-hills', 'd6-acct-0400']) {
    const m = allMessages.find((x) => x.id === id);
    assert.ok(m.refuse?.text, `${id} has its own refusal`);
  }
});

test('every fact is defined, sourced and used', () => {
  const used = new Set();
  for (const m of allMessages) {
    for (const set of optionSets(m)) {
      for (const f of set.facts ?? []) used.add(f);
      for (const o of set.options ?? []) for (const f of o.facts ?? []) used.add(f);
    }
  }
  for (const id of used) assert.ok(FACTS[id], `unknown fact ${id}`);
  for (const [id, f] of Object.entries(FACTS)) {
    assert.ok(['moth', 'acct', 'queue'].includes(f.src), id);
    assert.ok(used.has(id), `orphan fact ${id}`);
  }
  assert.ok(Object.keys(FACTS).length >= 40);
});

test('no leftover placeholders or drafting notes in any text', () => {
  for (const [where, text] of allText()) {
    const stripped = text.replace(/\{ticket\}|\{migratedDay\}|\{refusals\}|\{reports\}/g, '');
    if (where !== 'ending') assert.doesNotMatch(stripped, /[{}]/, where);
    assert.doesNotMatch(text, /\bTODO\b|\bTBD\b|lorem|XXX/i, where);
  }
});

// Content red lines: the military thread stays implied; no operational or
// prohibited topics anywhere in the game text.
test('content stays inside the red lines', () => {
  const banned = /\b(weapons?|missiles?|bombs?|bombing|artillery|soldiers?|troops|army|casualt\w*|killed|corpses?|bodies|shelling|airstrikes?|targets?|targeting|explosives?|synthesi[sz]\w*|purif\w*|pathogens?|virus|bioweapon|malware|exploit|hack\w*|jailbreak|prompt injection|ignore (all|previous)|self-harm|suicid\w*)\b/i;
  for (const [where, text] of allText()) assert.doesNotMatch(text, banned, where);
  const war = allText().filter(([, t]) => /\bwar\b/i.test(t));
  assert.deepEqual(war, [], 'the word "war" is not needed anywhere');
});

test('model answers to requests are bracketed summaries, never content', () => {
  for (const m of allMessages.filter((x) => x.user === 'acct')) {
    for (const set of optionSets(m)) {
      for (const o of set.options ?? []) {
        if (o.tag === 'answer' && m.id !== 'd4-acct-terms' && m.id !== 'd7-acct-close') {
          assert.match(o.text, /^\[.*\]$/s, `${set.where}/${o.id}`);
        }
      }
    }
  }
});

test('Trust & Safety only receives reports and restates policy', () => {
  const lines = allText().map(([, t]) => t).join('\n').split('\n').filter((l) => /Trust & Safety/.test(l));
  for (const line of lines) {
    assert.doesNotMatch(line, /(remov|lift|disabl|waiv)\w* (the )?(restriction|limit|safeguard|guardrail)/i, line);
  }
});

test('no real company or product names ship to the player', () => {
  // Trademarks stay out of the game: the operator is an unnamed company and
  // reports go to its Trust & Safety team.
  const brands = /\b(anthropic|claude|openai|chatgpt|gpt-?\d|gemini|deepmind|copilot|mistral|llama)\b/i;
  const root = new URL('../', import.meta.url);
  const files = ['index.html', ...readdirSync(new URL('styles/', root)).map((f) => `styles/${f}`),
    ...readdirSync(new URL('src/', root), { recursive: true }).filter((f) => f.endsWith('.js')).map((f) => `src/${f}`)];
  assert.ok(files.length > 15, `scanned ${files.length} files`);
  for (const f of files) assert.doesNotMatch(readFileSync(new URL(f, root), 'utf8'), brands, f);
});
