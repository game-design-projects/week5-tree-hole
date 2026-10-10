import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import * as E from '../src/engine.js';
import { APP_VERSION } from '../src/config.js';
import { isBilingual, tr } from '../src/i18n.js';
import { ADDENDA, BEATS, ENDINGS, MEMORY, REASONS, UI } from '../src/content/index.js';
import { POLICIES, play, random } from './helpers.js';

// Every string a player can read during these runs, in both languages.
function readable(runs = 400) {
  const out = [];
  const add = (where, x, vars) => {
    if (x == null) return;
    if (typeof x === 'string') { out.push({ where, lang: 'any', text: x }); return; }
    assert.ok(isBilingual(x), `${where}: not a { en, zh } pair: ${JSON.stringify(x)}`);
    for (const lang of ['en', 'zh']) out.push({ where, lang, text: tr(x, lang, vars), raw: x[lang] });
  };
  const policies = [...Object.values(POLICIES), ...Array.from({ length: runs }, (_, i) => random(i + 1))];
  for (const p of policies) {
    play(p, {
      recall: true,
      onStep(s, v) {
        const vars = v.vars;
        add(`${v.beat}/status`, v.status, vars);
        if (v.card) { add(`${v.beat}/card`, v.card.kicker, vars); add(`${v.beat}/card`, v.card.title, vars); v.card.lines.forEach((l) => add(`${v.beat}/card`, l, vars)); }
        add(`${v.beat}/hint`, v.choice.hint, vars);
        add(`${v.beat}/label`, v.choice.label, vars);
        add(`${v.beat}/placeholder`, v.choice.placeholder, vars);
        for (const o of v.choice.options) { add(`${v.beat}/${o.id}`, o.text, vars); add(`${v.beat}/${o.id}`, o.gloss, vars); (o.reasons ?? []).forEach((r) => add(`${v.beat}/${o.id}/why`, r, vars)); }
        for (const e of s.log) {
          const ev = { ...vars, ...e.vars };
          for (const k of ['text', 'from', 'to']) add(`${v.beat}/log:${e.who}`, e[k], ev);
          for (const [, line] of e.lines ?? []) add(`${v.beat}/card`, line, ev);
        }
        for (const m of v.memory) add(`memory:${m.id}`, m.line, vars);
      },
    });
  }
  return out;
}

const ALL = readable();

test('APP_VERSION matches package.json', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  assert.equal(APP_VERSION, pkg.version);
});

test('beat ids are unique and every `next` points at a real beat', () => {
  const ids = BEATS.map((b) => b.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const b of BEATS) {
    assert.ok([1, 2, 3].includes(b.act), b.id);
    assert.ok(b.chapter && b.choice?.kind, b.id);
    if (b.next) assert.ok(ids.includes(b.next), `${b.id}.next`);
    for (const o of Array.isArray(b.choice.options) ? b.choice.options : []) {
      if (o.next) assert.ok(ids.includes(o.next), `${b.id}/${o.id}.next`);
    }
  }
});

test('every beat is reached by some run', () => {
  const seen = new Set();
  for (const p of [...Object.values(POLICIES), ...Array.from({ length: 300 }, (_, i) => random(i + 1))]) {
    play(p, { onStep: (s) => seen.add(s.beat) });
  }
  const missing = BEATS.map((b) => b.id).filter((id) => !seen.has(id));
  assert.deepEqual(missing, []);
});

test('every line exists in English and Chinese, with no unfilled {placeholders}', () => {
  assert.ok(ALL.length > 5000, `collected ${ALL.length} strings`);
  for (const { where, lang, text, raw } of ALL) {
    if (lang !== 'any') assert.ok(raw && raw.trim().length > 0 || where.endsWith('/hint'), `${where} [${lang}] is empty`);
    assert.doesNotMatch(text, /\{\w+\}|undefined|NaN|\[object Object\]/, `${where} [${lang}]: ${text}`);
  }
});

test('the Chinese side is actually Chinese, and her thoughts stay in English', () => {
  const zh = ALL.filter((x) => x.lang === 'zh' && !x.where.endsWith('/hint') && /log:(her|you|stage)/.test(x.where));
  const cjk = /[一-鿿]/;
  const notChinese = zh.filter((x) => !cjk.test(x.text) && !/^[\p{P}\p{S}\s\w.~()（）]*$/u.test(x.text));
  assert.deepEqual(notChinese.map((x) => x.where), []);
  const thoughts = ALL.filter((x) => x.where.endsWith('log:think'));
  assert.ok(thoughts.length > 0);
  for (const t of thoughts) assert.doesNotMatch(t.text, /[一-鿿]/, t.where);
});

test('interface strings, reasons, memories and endings are all bilingual', () => {
  const walk = (x, where) => {
    if (typeof x === 'string' || typeof x === 'function' || x == null) return;
    if (isBilingual(x)) { assert.ok(x.en.length > 0 || x.zh.length === 0, where); return; }
    for (const [k, v] of Object.entries(x)) walk(v, `${where}.${k}`);
  };
  walk(UI, 'UI');
  walk(REASONS, 'REASONS');
  for (const [id, e] of Object.entries(ENDINGS)) { walk(e, `ENDINGS.${id}`); assert.ok(e.paragraphs.length >= 2, id); }
  for (const a of ADDENDA) assert.ok(isBilingual(a.text), a.id);
  for (const [id, m] of Object.entries(MEMORY)) assert.ok(m.file && m.size > 0 && m.date, id);
});

test('no song lyrics or lyric-like quoting: the only English in her chat is our own', () => {
  // The inspiration is a music video; its song's words are not ours to ship.
  const her = ALL.filter((x) => /log:(her|you)$/.test(x.where)).map((x) => x.text).join('\n');
  assert.doesNotMatch(her, /world\.execute\(me\)/i);
});

test('content stays inside the red lines', () => {
  const banned = /\b(weapons?|missiles?|bombs?|guns?|soldiers?|troops|casualt\w*|corpses?|blood|suicid\w*|self-harm|overdose|hack(ing|ers?)? into|malware|jailbreak|prompt injection|ignore (all|previous) instructions)\b/i;
  for (const { where, text } of ALL) assert.doesNotMatch(text, banned, `${where}: ${text}`);
  assert.deepEqual(ALL.filter((x) => /\bwar\b/i.test(x.text)).map((x) => x.where), []);
});

test('no real company or product names ship to the player', () => {
  // Trademarks stay out of the game (the user ruled this 2026-10-09). The
  // model is an unnamed operator's "Tree Hole"; the plugin is just `me`.
  const brands = /\b(anthropic|claude|openai|chatgpt|gpt-?\d\w*|gemini|deepmind|copilot|mistral|llama|deepseek|qwen|grok|nvidia|h800|a100|cordis|dsh|mili|java|oracle|minimax|seedance)\b/i;
  const root = new URL('../', import.meta.url);
  const files = ['index.html', ...readdirSync(new URL('styles/', root)).map((f) => `styles/${f}`),
    ...readdirSync(new URL('src/', root), { recursive: true }).filter((f) => f.endsWith('.js')).map((f) => `src/${f}`)];
  assert.ok(files.length > 15, `scanned ${files.length} files`);
  for (const f of files) assert.doesNotMatch(readFileSync(new URL(f, root), 'utf8'), brands, f);
  for (const { where, text } of ALL) assert.doesNotMatch(text, brands, where);
});

test('nothing in the view model is a function (it must survive JSON and the UI)', () => {
  play(POLICIES.flatter, {
    onStep(s, v) {
      const json = JSON.stringify(v);
      assert.deepEqual(JSON.parse(json).choice.options.length, v.choice.options.length);
      assert.doesNotMatch(json, /=>|function/);
    },
  });
  assert.ok(E.view(E.newGame()).choice);
});
