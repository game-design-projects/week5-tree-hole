// Tiny DOM helpers. h('div', { class: 'x', onclick }, ...children); children may
// be strings, nodes, arrays, or null/false (skipped).
export function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k === 'style') el.style.cssText = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  append(el, kids);
  return el;
}

export function svg(tag, attrs = {}, ...kids) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs ?? {})) if (v != null) el.setAttribute(k, String(v));
  append(el, kids);
  return el;
}

function append(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    el.append(k instanceof Node ? k : String(k));
  }
}

export function fill(el, ...kids) {
  el.textContent = '';
  append(el, kids);
  return el;
}

// Multi-line text → one <p> per line.
export const lines = (text) => String(text).split('\n').map((line) => h('p', null, line));

export const fmt = (n) => Math.round(n).toLocaleString('en-US');

export function clock(ms) {
  const t = Math.max(0, ms) / 1000;
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return `${String(m).padStart(2, '0')}:${s.toFixed(1).padStart(4, '0')}`;
}

export function minutesSeconds(ms, lang) {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return lang === 'zh' ? `${m}分${s}秒` : `${m} min ${s} s`;
}

// Deterministic per-string number, used for fake token ids and layouts.
export function hash(str) {
  let x = 2166136261;
  for (const c of String(str)) x = Math.imul(x ^ c.codePointAt(0), 16777619);
  return x >>> 0;
}

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
