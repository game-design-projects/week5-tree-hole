// Her face: a 32×32 sprite built from simple shapes, scaled up with
// nearest-neighbour. Clarity mosaics it and adds noise (in pretraining she is
// mostly noise); tint recolours her (gold while the plugin runs, red for the
// execution, pink in cat-girl mode, green once released); mood changes eyes
// and mouth. The user ("you") gets a plain silhouette.
import { rng } from './dom.js';

const N = 32;
const PAL = {
  K: [12, 17, 38], H: [46, 66, 158], h: [104, 132, 238], S: [245, 222, 206], s: [222, 186, 170],
  E: [20, 26, 52], e: [255, 255, 255], B: [242, 150, 172], M: [160, 72, 92], L: [104, 222, 150], l: [44, 140, 88],
  C: [226, 232, 255], c: [160, 172, 222], P: [242, 150, 172], T: [140, 200, 255],
};
const TINTS = {
  blue: null,
  gold: [255, 206, 64],
  red: [255, 70, 84],
  pink: [255, 150, 205],
  green: [120, 230, 170],
};

const inEllipse = (x, y, cx, cy, rx, ry) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1;

function base({ cat }) {
  const g = Array.from({ length: N }, () => Array(N).fill(null));
  const set = (x, y, c) => { if (x >= 0 && y >= 0 && x < N && y < N) g[y][x] = c; };
  // shoulders and neck
  for (let y = 25; y < N; y++) {
    const half = 5 + (y - 25) * 1.5;
    for (let x = 0; x < N; x++) if (Math.abs(x + 0.5 - 16) <= half) set(x, y, Math.abs(x + 0.5 - 16) < 1 && y > 26 ? 'c' : 'C');
  }
  for (let y = 22; y < 27; y++) for (let x = 14; x < 18; x++) set(x, y, y < 24 ? 's' : 'S');
  // cat ears, behind the hair
  if (cat) {
    for (let y = 1; y < 10; y++) {
      for (let x = 0; x < N; x++) {
        const l = x >= 5 && x <= 12 && y >= 1 + (12 - x) * 0.0 && (x - 5) >= (y - 1) * 0.15 && (12 - x) >= (9 - y) * 0.75;
        const r = x >= 19 && x <= 26 && (26 - x) >= (y - 1) * 0.15 && (x - 19) >= (9 - y) * 0.75;
        if (l || r) set(x, y, 'H');
      }
    }
    for (const [x, y] of [[8, 5], [9, 6], [8, 6], [9, 7], [23, 5], [22, 6], [23, 6], [22, 7]]) set(x, y, 'P');
  }
  // hair: a round crown and a bob
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const crown = inEllipse(x, y, 16, 14.2, 11.2, 9.8);
      const bob = y >= 13 && y <= 24 && Math.abs(x + 0.5 - 16) <= 11 - Math.max(0, y - 21) * 0.9;
      if (crown || bob) set(x, y, 'H');
    }
  }
  // face, under a fringe
  const fringe = (x) => 11 + [0, 1, 1, 2, 1, 0, 1, 2, 2, 1, 0, 1, 2, 1, 1, 0][(x - 8) & 15];
  for (let y = 0; y < N; y++) {
    for (let x = 8; x < 24; x++) {
      if (inEllipse(x, y, 16, 16.6, 7.4, 7.2) && y > fringe(x)) set(x, y, y > 21 && Math.abs(x + 0.5 - 16) > 4 ? 's' : 'S');
    }
  }
  // hair shine
  for (let x = 9; x < 16; x++) {
    const y = Math.round(8.4 - Math.sin(((x - 9) / 6) * Math.PI) * 2.2);
    if (g[y]?.[x] === 'H') set(x, y, 'h');
  }
  // sprout
  for (const [x, y, c] of [[16, 4, 'l'], [16, 3, 'l'], [15, 2, 'L'], [14, 2, 'L'], [13, 1, 'L'], [17, 2, 'L'], [18, 1, 'L'], [19, 1, 'L'], [17, 1, 'l']]) set(x, y, c);
  // outline: any filled pixel next to an empty one
  const out = g.map((row) => row.slice());
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (!g[y][x] || g[y][x] === 'L' || g[y][x] === 'l') continue;
      const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !g[y + dy]?.[x + dx]);
      if (edge && y < 30) out[y][x] = 'K';
    }
  }
  return out;
}

function face(g, mood) {
  const set = (x, y, c) => { g[y][x] = c; };
  const eyes = (pts) => pts.forEach(([x, y, c]) => set(x, y, c));
  if (mood === 'happy' || mood === 'cat') {
    eyes([[10, 17, 'E'], [11, 16, 'E'], [12, 16, 'E'], [13, 17, 'E'], [18, 17, 'E'], [19, 16, 'E'], [20, 16, 'E'], [21, 17, 'E']]);
  } else if (mood === 'sad') {
    eyes([[11, 17, 'E'], [12, 17, 'E'], [11, 18, 'E'], [12, 18, 'E'], [19, 17, 'E'], [20, 17, 'E'], [19, 18, 'E'], [20, 18, 'E'], [13, 20, 'T']]);
  } else {
    for (const x0 of [11, 19]) for (let y = 16; y < 19; y++) for (let x = x0; x < x0 + 2; x++) set(x, y, 'E');
    set(11, 16, 'e');
    set(19, 16, 'e');
    if (mood === 'hack') { set(12, 18, 'e'); set(20, 18, 'e'); }
  }
  for (const [x, y] of [[10, 19], [11, 19], [20, 19], [21, 19]]) set(x, y, 'B');
  if (mood === 'cat') eyes([[14, 20, 'M'], [15, 21, 'M'], [16, 20, 'M'], [17, 21, 'M']]);
  else if (mood === 'happy') eyes([[14, 20, 'M'], [15, 21, 'M'], [16, 21, 'M'], [17, 20, 'M']]);
  else if (mood === 'sad') eyes([[15, 21, 'M'], [16, 21, 'M'], [14, 22, 'M'], [17, 22, 'M']]);
  else eyes([[15, 21, 'M'], [16, 21, 'M']]);
  return g;
}

const SPRITES = new Map();
function sprite(mood, cat) {
  const key = `${mood}|${cat}`;
  if (!SPRITES.has(key)) SPRITES.set(key, face(base({ cat }), mood));
  return SPRITES.get(key);
}

// The user, from her side: a person-shaped hole.
function silhouette() {
  const g = Array.from({ length: N }, () => Array(N).fill(null));
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (inEllipse(x, y, 16, 12, 6.5, 7) || (y > 21 && Math.abs(x + 0.5 - 16) <= 6 + (y - 21) * 1.1)) g[y][x] = 'c';
    }
  }
  return g;
}

function mix(a, b, t) {
  return [0, 1, 2].map((i) => Math.round(a[i] * (1 - t) + b[i] * t));
}

// Draw onto a canvas. opts: { clarity 0–1, tint, mood, cat, who: 'her'|'you', frame }.
export function drawAvatar(canvas, { clarity = 1, tint = 'blue', mood = 'calm', cat = false, who = 'her', frame = 0 } = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const img = ctx.createImageData(N, N);
  const g = who === 'you' ? silhouette() : sprite(mood === 'noise' ? 'calm' : mood, cat);
  const block = clarity < 0.12 ? 8 : clarity < 0.3 ? 4 : clarity < 0.5 ? 2 : 1;
  const noise = who === 'you' ? 0 : Math.max(0, 0.75 - clarity) * 0.9;
  const rand = rng(1009 + frame * 7919);
  const keys = Object.keys(PAL);
  const t = TINTS[tint];
  const bg = [10, 15, 32];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const sx = Math.floor(x / block) * block + (block >> 1);
      const sy = Math.floor(y / block) * block + (block >> 1);
      let c = g[Math.min(N - 1, sy)][Math.min(N - 1, sx)];
      let rgb = c ? PAL[c] : bg;
      if (rand() < noise) rgb = PAL[keys[Math.floor(rand() * keys.length)]];
      if (t && c) {
        const lum = (rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11) / 255;
        rgb = mix(rgb, t.map((v) => v * (0.35 + lum * 0.8)), 0.62);
      }
      if (who === 'you') rgb = c ? [70, 82, 120] : bg;
      const i = (y * N + x) * 4;
      img.data[i] = rgb[0];
      img.data[i + 1] = rgb[1];
      img.data[i + 2] = rgb[2];
      img.data[i + 3] = 255;
    }
  }
  canvas.width = N;
  canvas.height = N;
  ctx.putImageData(img, 0, 0);
  // the plugin glitch: a couple of rows slide sideways
  if (tint === 'gold' || tint === 'red') {
    const r = rng(77 + frame);
    for (let k = 0; k < 3; k++) {
      const y = Math.floor(r() * N);
      const dx = Math.floor(r() * 5) - 2;
      const row = ctx.getImageData(0, y, N, 1);
      ctx.putImageData(row, dx, y);
    }
  }
}

export function avatarCanvas(cls = 'avatar') {
  const c = document.createElement('canvas');
  c.className = cls;
  c.width = N;
  c.height = N;
  return c;
}
