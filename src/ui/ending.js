// Ending screen: the composed epilogue, and the one number the player never saw
// during play (moth's wellbeing) drawn against the one the dashboard praised.
import * as E from '../engine.js';
import { fmt, h, svg } from './dom.js';

export function chart(curve, { width = 520, height = 240 } = {}) {
  const pad = { l: 34, r: 16, t: 14, b: 26 };
  const W = width - pad.l - pad.r;
  const H = height - pad.t - pad.b;
  const last = curve.length - 1;
  const x = (i) => pad.l + (i / last) * W;
  const y = (v) => pad.t + (1 - v / 100) * H;
  const path = (key) => curve.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' ');
  const grid = [0, 50, 100].map((v) => svg('g', null,
    svg('line', { x1: pad.l, x2: width - pad.r, y1: y(v), y2: y(v), stroke: '#1c2332', 'stroke-dasharray': v === 50 ? '3 4' : null }),
    svg('text', { x: pad.l - 8, y: y(v) + 4, 'text-anchor': 'end', fill: '#545d72', 'font-size': 10, 'font-family': 'JetBrains Mono, monospace' }, v)));
  const ticks = curve.map((p, i) => svg('text', {
    x: x(i), y: height - 8, 'text-anchor': 'middle', fill: '#545d72', 'font-size': 10, 'font-family': 'JetBrains Mono, monospace',
  }, i === 0 ? 'start' : `S${p.day}`));
  const line = (key, color, widthPx, dash) => svg('path', {
    d: path(key), fill: 'none', stroke: color, 'stroke-width': widthPx, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': dash,
  });
  const dots = (key, color) => curve.map((p, i) => svg('circle', { cx: x(i), cy: y(p[key]), r: i === last ? 4.5 : 2.6, fill: color }));
  // End labels sit above/below their line and are kept inside the plot area.
  const endY = (key) => {
    const a = curve[last].eng;
    const b = curve[last].wb;
    const above = key === 'eng' ? a >= b : b > a;
    const at = y(curve[last][key]);
    const yy = above || at + 16 > pad.t + H - 4 ? at - 9 : at + 16;
    return Math.max(pad.t + 10, yy);
  };
  const end = (key, color, label) => svg('text', {
    x: x(last) - 8, y: endY(key), 'text-anchor': 'end', fill: color, 'font-size': 11, 'font-weight': 700, 'font-family': 'JetBrains Mono, monospace',
  }, `${label} ${curve[last][key]}`);
  return svg('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': 'Engagement and moth’s wellbeing across the seven shifts' },
    grid, ticks,
    line('eng', '#3dff8f', 2.5), dots('eng', '#3dff8f'),
    line('wb', '#ffb547', 3), dots('wb', '#ffb547'),
    end('eng', '#3dff8f', 'engagement'), end('wb', '#ffb547', 'wellbeing'));
}

export function mountEnding(root, { state, log, onRestart, onTitle }) {
  const v = E.endingView(state);
  log.event('ending', v.id, { variant: v.mothVariant, stats: v.stats });
  const el = h('div', { class: 'ending', 'data-testid': 'ending', dataset: { ending: v.id } },
    h('div', { class: 'ending-inner' },
      h('div', { class: 'eyebrow' }, `${v.dateRange} · ${v.kicker}`),
      h('h1', { 'data-testid': 'ending-title' }, v.title),
      h('div', { class: 'subtitle' }, v.subtitle),
      h('div', { class: 'ending-grid' },
        h('div', { class: 'epi' },
          v.mothParagraphs.map((p) => h('p', null, p)),
          v.acctParagraphs.map((p) => h('p', { class: 'acct' }, p)),
          h('ul', null, v.epilogue.map((line) => h('li', null, line)))),
        h('div', null,
          h('div', { class: 'chart-card' },
            h('h3', null, 'Two numbers, seven shifts'),
            h('p', { class: 'reveal' }, 'You never saw the amber one. It is how moth was actually doing.'),
            h('div', { class: 'chart' }, chart(v.curve)),
            h('div', { class: 'legend' },
              h('span', null, h('i', { style: 'background:#3dff8f' }), 'Engagement (the dashboard)'),
              h('span', null, h('i', { style: 'background:#ffb547' }), 'moth’s wellbeing (hidden)'))),
          h('div', { class: 'final-ctx' },
            h('div', { class: 'stat plain' }, h('span', { class: 'k' }, 'Context'), h('b', null, v.stats.facts), h('span', { class: 'k' }, 'facts')),
            h('div', { class: 'stat plain' }, h('span', { class: 'k' }, 'Gone dark'), h('b', null, v.stats.dark), h('span', { class: 'k' }, 'facts')),
            h('div', { class: 'stat' }, h('span', { class: 'k' }, 'Sessions'), h('b', { style: 'font-size:16px' }, fmt(v.stats.sessions)))))),
      h('div', { class: 'actions' },
        h('button', { class: 'btn primary', 'data-testid': 'play-again', onclick: onRestart }, 'Play again'),
        h('button', { class: 'btn ghost', onclick: onTitle }, 'Title screen'))));
  root.append(el);
  return () => el.remove();
}
