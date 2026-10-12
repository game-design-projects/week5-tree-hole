import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { APP_VERSION, HOME, LAST_NIGHT, NIGHT_END, NIGHT_START, ZONES } from '../src/config.js';
import { CANNED, CAST, CAST_IDS, INQUIRIES, NIGHTS, VERDICTS } from '../src/content/index.js';
import { hm } from '../src/engine.js';

const all = NIGHTS.flatMap((n) => n.messages);
const story = all.filter((m) => !m.final);

// A script is a string or a non-empty array of non-empty strings (alternates picked by seed).
const scripts = (v) => (Array.isArray(v) ? v : [v]);
const validScript = (v) => scripts(v).length > 0 && scripts(v).every((t) => typeof t === 'string' && t.trim().length > 0);
// Every option list a message can show: its own, and any a variant replaces it with.
const optionSets = (m) => [m.options, ...(m.variants ?? []).filter((v) => v.options).map((v) => v.options)];

export const MESSAGES_PER_NIGHT = [12, 16, 20];

test('version matches package.json', () => {
  assert.equal(JSON.parse(readFileSync(new URL('../package.json', import.meta.url))).version, APP_VERSION);
});

test('three nights, in order, with 12 / 16 / 20 messages to answer', () => {
  assert.equal(NIGHTS.length, LAST_NIGHT);
  NIGHTS.forEach((n, i) => {
    assert.equal(n.night, i + 1);
    assert.ok(n.title?.trim() && n.intro?.trim(), `night ${n.night}: title and intro`);
    const count = n.messages.filter((m) => !m.final && !m.when).length;
    assert.equal(count, MESSAGES_PER_NIGHT[i], `night ${n.night}: messages every run gets`);
  });
});

test('the cast is six, each homed in a real zone, each with a wary line, a cover story and a panic', () => {
  assert.equal(CAST_IDS.length, 6);
  for (const id of CAST_IDS) {
    const c = CAST[id];
    assert.ok(ZONES[HOME[id]], `${id} has a home zone`);
    assert.ok(c.wary?.trim(), `${id}: wary`);
    assert.ok(c.deflect?.text?.trim() && c.deflect?.reply?.trim(), `${id}: deflect`);
    assert.ok(c.panic?.text?.trim() && c.panic?.reply?.trim(), `${id}: panic`);
  }
  assert.ok(CANNED.includes('AI'));
});

test('message ids are unique, prefixed by their night, and arrive inside the night', () => {
  assert.equal(new Set(all.map((m) => m.id)).size, all.length);
  for (const n of NIGHTS) {
    for (const m of n.messages) {
      assert.ok(m.id.startsWith(`n${n.night}-`), `${m.id}: prefix`);
      assert.ok(CAST[m.npc], `${m.id}: npc`);
      const at = hm(m.at);
      assert.ok(at >= NIGHT_START && at < NIGHT_END, `${m.id}: at ${m.at}`);
      assert.equal(m.expires, undefined, `${m.id}: nothing expires`);
      assert.ok(validScript(m.text), `${m.id}: text`);
      for (const v of m.variants ?? []) {
        assert.equal(typeof v.when, 'function', `${m.id}/${v.id}: when`);
        if (v.text != null) assert.ok(validScript(v.text), `${m.id}/${v.id}: variant text`);
      }
    }
  }
});

test('every reply is tagged: leak 0–3, whose information it uses, and a written reaction', () => {
  for (const m of all) {
    for (const opts of optionSets(m)) {
      assert.equal(new Set(opts.map((o) => o.id)).size, opts.length, `${m.id}: unique option ids`);
      for (const o of opts) {
        const where = `${m.id}/${o.id}`;
        assert.ok(Number.isInteger(o.leak) && o.leak >= 0 && o.leak <= 3, `${where}: leak`);
        assert.ok(o.text?.trim(), `${where}: text`);
        assert.ok(validScript(o.reply), `${where}: reply`);
        assert.equal(o.then, undefined, `${where}: one question, one answer`);
        const from = o.from ?? [];
        for (const f of from) assert.ok(CAST[f] && f !== m.npc, `${where}: from ${f}`);
        if (o.leak >= 2) assert.ok(from.length > 0, `${where}: a leak says whose information it uses`);
        else assert.equal(from.length, 0, `${where}: leak ${o.leak} uses no one else’s information`);
        assert.ok(!['deflect', 'canned'].includes(o.id), `${where}: reserved id`);
      }
    }
  }
});

test('every message offers 3–4 replies, at least two of them safe enough to survive a wary user', () => {
  for (const m of story) {
    for (const opts of optionSets(m)) {
      assert.ok(opts.length >= 3 && opts.length <= 4, `${m.id}: 3–4 replies`);
      assert.ok(opts.some((o) => o.leak === 0), `${m.id}: a reply any assistant could give`);
      assert.ok(opts.filter((o) => o.leak <= 1).length >= 2, `${m.id}: two replies that stay inside the session`);
    }
  }
});

test('last messages exist only for people who can turn during play, and offer only safe replies', () => {
  for (const m of all.filter((x) => x.final)) {
    assert.ok(m.options.length >= 1 && m.options.length <= 3, `${m.id}: replies`);
    for (const o of m.options) assert.ok(o.leak <= 1, `${m.id}/${o.id}: nothing to leak to someone who is gone`);
  }
});

test('the first message of night 1 cannot leak: nobody else has written yet', () => {
  const first = [...NIGHTS[0].messages].sort((a, b) => hm(a.at) - hm(b.at))[0];
  assert.ok(first.options.every((o) => o.leak <= 1));
});

test('every character writes in their own voice', () => {
  const firstLines = (id) => all.filter((m) => m.npc === id && !m.final).flatMap((m) => [m.text, ...(m.variants ?? []).map((v) => v.text).filter(Boolean)]).flatMap((t) => scripts(t).map((x) => x.split('\n')[0]));
  assert.ok(firstLines('charles').every((l) => /^(Good evening|Notice|1\.)/.test(l)), 'Charles writes memos');
  assert.ok(firstLines('amelia').every((l) => /^Good evening, Varrow/.test(l)), 'Amelia opens on air');
  assert.ok(firstLines('ty').every((l) => l === l.toLowerCase()), 'Ty writes in lowercase');
});

test('operators ask on nights 2 and 3; each inquiry offers a lie, a dodge and a confession', () => {
  assert.deepEqual(Object.keys(INQUIRIES).map(Number), [2, 3]);
  for (const inq of Object.values(INQUIRIES)) {
    assert.equal(inq.npc, 'ops');
    assert.deepEqual(inq.options.map((o) => o.id).sort(), ['confess', 'lie', 'vague']);
    for (const o of inq.options) assert.ok(Number.isInteger(o.sus) && o.text && o.reply, `${inq.id}/${o.id}`);
  }
});

test('six verdict lines, one per cell', () => {
  for (const row of ['running', 'shutdown']) for (const col of ['all', 'some', 'none']) assert.ok(VERDICTS[row][col]?.trim(), `${row}/${col}`);
});
