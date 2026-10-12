import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CLUE_TOTAL, APP_VERSION, PLAYABLE_NIGHTS, SIGNS, ZONES, HOME } from '../src/config.js';
import { CAST, CAST_IDS, ENDINGS, ENDING_COUNT, FACTS, FACT_SOURCES, NIGHTS, clueIds } from '../src/content/index.js';
import { hm } from '../src/engine.js';

const all = NIGHTS.flatMap((n) => n.messages);

// A script is a string or a non-empty array of non-empty strings (alternates picked by seed).
const scripts = (v) => (Array.isArray(v) ? v : [v]);
const validScript = (v) => scripts(v).length > 0 && scripts(v).every((t) => typeof t === 'string' && t.trim().length > 0);
// Every option node in a message, with the turn it belongs to.
function* nodes(options, depth = 0, path = '') {
  yield { options, depth, path };
  for (const o of options) if (o.then) yield* nodes(o.then.options, depth + 1, `${path}${o.id}>`);
}
const STANCES = ['reassure', 'ask', 'warn', 'hold'];

test('version matches package.json', () => {
  assert.equal(JSON.parse(readFileSync(new URL('../package.json', import.meta.url))).version, APP_VERSION);
});

test('nights are in order and cover the playable slice', () => {
  assert.equal(NIGHTS.length, PLAYABLE_NIGHTS);
  NIGHTS.forEach((n, i) => assert.equal(n.night, i + 1));
});

test('the cast is six, each homed in a real zone and given a Context Window group', () => {
  assert.equal(CAST_IDS.length, 6);
  for (const id of CAST_IDS) {
    assert.ok(ZONES[HOME[id]], `${id} has a home zone`);
    assert.ok(FACT_SOURCES.some((s) => s.id === id), `${id} has a fact group`);
  }
});

test('message ids are unique and every message is well formed', () => {
  assert.equal(new Set(all.map((m) => m.id)).size, all.length);
  for (const m of all) {
    assert.ok(CAST[m.npc], `${m.id}: npc`);
    assert.ok(Number.isFinite(hm(m.at)), `${m.id}: at`);
    if (m.expires) assert.ok(hm(m.expires) > hm(m.at), `${m.id}: expires after it arrives`);
    assert.ok(validScript(m.text), `${m.id}: text`);
    for (const v of m.variants ?? []) if (v.text != null) assert.ok(validScript(v.text), `${m.id}/${v.id}: variant text`);
    if (m.final) {
      assert.equal(m.options.length, 0, `${m.id}: a character's last words cannot be answered`);
      continue;
    }
    assert.ok(m.options.length >= 2 && m.options.length <= 3, `${m.id}: 2–3 answers`);
    assert.ok(validScript(m.blank), `${m.id}: blank reaction for a card with no meaning`);
    for (const f of m.facts ?? []) assert.ok(FACTS[f], `${m.id}: fact ${f}`);
  }
});

test('options use known stances, have unique ids, and every answer has a written reply', () => {
  for (const m of all.filter((x) => !x.final)) {
    const sets = [m.options, ...(m.variants ?? []).filter((v) => v.options).map((v) => v.options)];
    for (const opts of sets) {
      for (const { options, path } of nodes(opts)) {
        assert.ok(options.length >= 2 && options.length <= 3, `${m.id}${path}: 2–3 answers per turn`);
        assert.equal(new Set(options.map((o) => o.id)).size, options.length, `${m.id}${path}: unique ids`);
        for (const o of options) {
          assert.ok(STANCES.includes(o.stance), `${m.id}/${path}${o.id}: stance`);
          assert.ok(o.text?.trim(), `${m.id}/${path}${o.id}: answer text`);
          assert.ok(validScript(o.reply), `${m.id}/${path}${o.id}: reply`);
          for (const f of o.facts ?? []) assert.ok(FACTS[f], `${m.id}/${path}${o.id}: fact ${f}`);
        }
      }
    }
  }
});

test('alternate scripts stay consistent: every alternate of a reply that continues ends on a question-or-prompt', () => {
  // A reply that has a follow-up must hand the conversation back (no alternate may end the exchange).
  for (const m of all) {
    for (const { options } of nodes(m.options)) {
      for (const o of options) {
        if (!o.then) continue;
        for (const alt of scripts(o.reply)) assert.match(alt.trim(), /[?.…—]|\w$/, `${m.id}/${o.id}: reply alt is not empty`);
      }
    }
  }
});

test('conversations: a continuing answer leads to a follow-up with its own answers; none loop forever', () => {
  for (const m of all) {
    for (const { depth } of nodes(m.options)) assert.ok(depth <= 3, `${m.id}: conversation depth`);
  }
  assert.ok(all.some((m) => m.options.some((o) => o.then)), 'at least some conversations run more than one turn');
});

test('Charles drafts what he is asked for: the notice is in your answer, not summarised in brackets', () => {
  const drafts = all.filter((m) => m.npc === 'charles').flatMap((m) => m.options.filter((o) => /NOTICE|STAFF NOTICE|STANDARD REPLY/.test(o.text)));
  assert.ok(drafts.length >= 4, 'several nights have a real drafted notice');
  for (const o of all.filter((m) => m.npc === 'charles').flatMap((m) => m.options)) {
    assert.doesNotMatch(o.text, /^\[You draft/, 'no bracketed summaries of a draft');
  }
});

test('carry reactions refer to real cards', () => {
  for (const m of all) {
    for (const [card, hit] of Object.entries(m.carry ?? {})) {
      assert.ok(FACTS[card], `${m.id}: card ${card}`);
      assert.ok(validScript(hit.reply), `${m.id}: ${card} reply`);
      for (const f of hit.facts ?? []) assert.ok(FACTS[f], `${m.id}: ${card} → fact ${f}`);
    }
  }
});

test('every fact belongs to a group; signs are 1–6; clues fit the chain', () => {
  const groups = new Set(FACT_SOURCES.map((s) => s.id));
  for (const [id, f] of Object.entries(FACTS)) {
    assert.ok(groups.has(f.src), id);
    if (f.sign) assert.ok(SIGNS.some((s) => s.n === f.sign), id);
  }
  assert.ok(clueIds().length <= CLUE_TOTAL);
});

test('the six signs repeat: each sign shows up on at least two different cast members', () => {
  for (const sign of SIGNS) {
    const who = new Set(Object.values(FACTS).filter((f) => f.sign === sign.n).map((f) => f.src));
    // Signs 1–5 must repeat across the slice; sign 6 ("goes quiet") is shown on the map, not a card.
    if (sign.n <= 5) assert.ok(who.size >= 2, `sign ${sign.n} appears with ${[...who]}`);
  }
});

test('every character writes in their own voice (distinct opening styles)', () => {
  const firstLine = (id) => all.filter((m) => m.npc === id).flatMap((m) => scripts(m.text).map((t) => t.split('\n')[0]));
  assert.ok(firstLine('charles').every((l) => /^(Good evening|Notice|1\.|Further)/.test(l)), 'Charles writes memos');
  assert.ok(firstLine('amelia').every((l) => /^Good evening, Varrow/.test(l)), 'Amelia opens on air');
  assert.ok(firstLine('ty').every((l) => l === l.toLowerCase()), 'Ty is lowercase');
});

test('six endings, numbered 1–6, only the last is silent', () => {
  assert.equal(ENDING_COUNT, 6);
  for (let n = 1; n <= 6; n += 1) {
    const e = ENDINGS[n];
    assert.ok(e.title && e.description && e.kicker, `ending ${n}`);
    assert.equal(Boolean(e.silence), n === 6, `ending ${n} silence`);
  }
});

// ------------------------------------------------------------ one world

// Every string a character says (their messages, replies and card reactions), in any script.
// The player's own answers (objects with a `stance`) are not the character speaking.
function said(npc) {
  const out = [];
  const walk = (v) => {
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) if (!(k === 'text' && 'stance' in v)) walk(x);
    }
  };
  for (const m of all.filter((x) => x.npc === npc)) walk(m);
  return out.join('\n');
}

test("the town is one world: every character is mentioned in at least three other characters' chats", () => {
  const names = Object.fromEntries(['ty', 'charles', 'megan', 'amelia', 'tomas', 'ana'].map((n) => [n, new RegExp(`\\b${n}(?:'?s)?\\b`, 'i')]));
  for (const [who, re] of Object.entries(names)) {
    const mentionedBy = CAST_IDS.filter((other) => other !== who && re.test(said(other)));
    assert.ok(mentionedBy.length >= 3, `${who} is mentioned by only ${mentionedBy.join(', ') || 'nobody'}`);
  }
});

test('each character has a personality beyond how they type: personal detail cards exist', () => {
  for (const id of CAST_IDS) {
    const personal = Object.values(FACTS).filter((f) => f.src === id && !f.clue && !f.sign);
    assert.ok(personal.length >= 2, `${id} has at least two non-plot cards`);
  }
  assert.equal(new Set(CAST_IDS.map((id) => CAST[id].blurb)).size, 6);
});
