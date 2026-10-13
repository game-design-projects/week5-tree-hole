import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';

// docs/cover.png is the itch.io cover and the README header; docs/screenshots/ are its store screenshots. itch wants 630×500 (63:50), at most 3 MB.
const PNG = new URL('../docs/cover.png', import.meta.url);

test('the cover is a PNG in itch.io’s 63:50 ratio, at least 630×500 and under 3 MB', () => {
  const head = readFileSync(PNG).subarray(0, 24);
  assert.equal(head.subarray(1, 4).toString(), 'PNG', 'a PNG');
  const [w, h] = [head.readUInt32BE(16), head.readUInt32BE(20)];
  assert.ok(w >= 630 && h >= 500, `${w}×${h} is smaller than 630×500`);
  assert.equal(w * 50, h * 63, `${w}×${h} is not 63:50`);
  assert.ok(statSync(PNG).size < 3 * 1024 * 1024, 'itch.io rejects covers over 3 MB');
});

test('the cover names no real company or product (the content red line also covers the art)', () => {
  const html = readFileSync(new URL('../tools/cover.html', import.meta.url), 'utf8');
  const art = html.slice(html.indexOf('<body>')); // what is drawn, not the head (the fonts link and comment name Google Fonts)
  assert.doesNotMatch(art, /anthropic|claude|openai|chatgpt|gpt|gemini|google/i);
});

test('the store screenshots are 16:9 PNGs of the game, five of them, each under 3 MB', () => {
  const dir = new URL('../docs/screenshots/', import.meta.url);
  const files = readdirSync(dir).filter((f) => f.endsWith('.png')).sort();
  assert.equal(files.length, 5, files.join(', '));
  for (const f of files) {
    const head = readFileSync(new URL(f, dir)).subarray(0, 24);
    assert.equal(head.subarray(1, 4).toString(), 'PNG', f);
    const [w, h] = [head.readUInt32BE(16), head.readUInt32BE(20)];
    assert.ok(w >= 1280 && w * 9 === h * 16, `${f} is ${w}×${h}, not 16:9 at 1280 or more`);
    assert.ok(statSync(new URL(f, dir)).size < 3 * 1024 * 1024, `${f}: itch.io rejects screenshots over 3 MB`);
  }
});
