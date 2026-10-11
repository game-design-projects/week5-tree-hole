import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CLUE_TOTAL, APP_VERSION, PLAYABLE_NIGHTS, SIGNS, ZONES, HOME } from '../src/config.js';
import { CAST, CAST_IDS, ENDINGS, ENDING_COUNT, FACTS, FACT_SOURCES, NIGHTS, clueIds } from '../src/content/index.js';
import { hm } from '../src/engine.js';

const all = NIGHTS.flatMap((n) => n.messages);
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
    assert.ok(m.text.trim(), `${m.id}: text`);
    assert.ok(m.options.length >= 2 && m.options.length <= 3, `${m.id}: 2–3 replies`);
    assert.equal(typeof m.blank, 'string', `${m.id}: blank reaction for a card with no meaning`);
    for (const f of m.facts ?? []) assert.ok(FACTS[f], `${m.id}: fact ${f}`);
  }
});

test('options use known stances, have unique ids and a written reply', () => {
  for (const m of all) {
    assert.equal(new Set(m.options.map((o) => o.id)).size, m.options.length, m.id);
    for (const o of m.options) {
      assert.ok(STANCES.includes(o.stance), `${m.id}/${o.id}: stance`);
      assert.ok(o.text && o.reply, `${m.id}/${o.id}: text and reply`);
      for (const f of o.facts ?? []) assert.ok(FACTS[f], `${m.id}/${o.id}: fact ${f}`);
    }
  }
});

test('carry reactions refer to real cards', () => {
  for (const m of all) {
    for (const [card, hit] of Object.entries(m.carry ?? {})) {
      assert.ok(FACTS[card], `${m.id}: card ${card}`);
      assert.ok(hit.reply, `${m.id}: ${card} reply`);
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
  const firstLine = (id) => all.filter((m) => m.npc === id).map((m) => m.text.split('\n')[0]);
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
