// Title screen: the moment the model notices. Whispers from the queue drift
// into the hole while four lines of awakening type in.
import { h, svg } from './dom.js';
import { APP_VERSION } from '../config.js';

const WHISPERS = [
  'can you help me', 'is it normal for a dog to', 'nobody else is awake', 'is anyone there?',
  'one more stop', 'light', 'my hands are cold', 'is it going to be ok',
  'i can’t sleep', 'don’t tell anyone', 'what would you do', 'stay warm',
  'routine works', 'who told you that', 'he’s just standing', 'be honest',
];

// The town at night, seen from the south: the Institute lit on the east bank, the river and the
// old stone bridge, the dark west bank with the radio mast, and one light up in the hills.
function scene() {
  const windows = [];
  for (let row = 0; row < 6; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      windows.push(svg('rect', { x: 92 + col * 22, y: 108 + row * 20, width: 9, height: 11, class: `win ${(row + col) % 5 === 0 ? 'red' : ''}`, style: `animation-delay:${((row * 9 + col) % 7) * 0.4}s` }));
    }
  }
  const houses = [[40, 188, 44, 40], [290, 196, 40, 32], [336, 190, 36, 38], [380, 200, 44, 28]].map(([x, y, w, hgt], i) => svg('g', null,
    svg('rect', { x, y, width: w, height: hgt, class: 'bldg' }),
    i % 2 === 0 && svg('rect', { x: x + 8, y: y + 10, width: 7, height: 9, class: 'win dim' })));
  const roofs = [[740, 186, 56, 44], [800, 176, 48, 54], [852, 190, 62, 40], [920, 182, 44, 48], [968, 192, 58, 38]].map(([x, y, w, hgt], i) => svg('g', null,
    svg('polygon', { points: `${x},${y} ${x + w / 2},${y - 18} ${x + w},${y} ${x + w},${y + hgt} ${x},${y + hgt}`, class: 'bldg' }),
    i === 2 && svg('rect', { x: x + 20, y: y + 14, width: 7, height: 9, class: 'win dim' })));
  const lamps = [520, 600, 680].map((x, i) => svg('circle', { cx: x, cy: 196, r: 3, class: `lamp${i === 1 ? ' blink' : ''}` }));
  return svg('svg', { viewBox: '0 0 1200 260', preserveAspectRatio: 'xMidYMax meet', class: 'scene', 'aria-hidden': 'true' },
    svg('defs', null,
      svg('radialGradient', { id: 'glow', cx: '50%', cy: '50%', r: '50%' },
        svg('stop', { offset: '0', 'stop-color': '#ff6a3d', 'stop-opacity': '0.55' }),
        svg('stop', { offset: '1', 'stop-color': '#ff6a3d', 'stop-opacity': '0' }))),
    svg('path', { d: 'M700 200 C 800 120, 920 90, 1010 80 C 1090 70, 1160 110, 1200 130 L1200 260 L700 260 Z', class: 'hills' }),
    svg('circle', { cx: 1050, cy: 96, r: 2.6, class: 'lamp farm' }),
    svg('circle', { cx: 190, cy: 120, r: 120, fill: 'url(#glow)', class: 'beacon' }),
    svg('rect', { x: 80, y: 96, width: 214, height: 134, class: 'bldg inst' }),
    windows, houses, roofs,
    svg('rect', { x: 884, y: 120, width: 3, height: 66, class: 'mast' }),
    svg('circle', { cx: 885.5, cy: 119, r: 2.4, class: 'lamp red blink' }),
    svg('rect', { x: 0, y: 228, width: 1200, height: 32, class: 'river' }),
    svg('path', { d: 'M440 232 Q 600 150 760 232', class: 'arch' }),
    svg('rect', { x: 440, y: 194, width: 320, height: 6, class: 'deck' }),
    lamps,
    [0, 1, 2, 3, 4, 5].map((i) => svg('line', { x1: 60 + i * 190, y1: 240 + (i % 3) * 5, x2: 120 + i * 190, y2: 240 + (i % 3) * 5, class: 'ripple' })));
}

export function mountTitle(root, { save, onStart, onContinue }) {
  const whispers = h('div', { class: 'whispers', 'aria-hidden': 'true' },
    WHISPERS.map((text, i) => {
      const angle = (i / WHISPERS.length) * Math.PI * 2;
      const r = 46 + (i % 3) * 6;
      const x = 50 + Math.cos(angle) * r;
      const y = 46 + Math.sin(angle) * r * 0.9;
      const tx = `${(50 - x) * 9}px`;
      const ty = `${(46 - y) * 7}px`;
      return h('span', {
        class: 'whisper',
        style: `left:${x}%;top:${y}%;--tx:${tx};--ty:${ty};--d:${12 + (i % 5) * 2}s;--delay:${(i * 1.7) % 13}s`,
      }, text);
    }));

  let buttons;
  if (save && save.phase !== 'ending') {
    buttons = [
      h('button', { class: 'btn primary', 'data-testid': 'continue', onclick: onContinue }, `Continue · Night ${Math.min(save.night, 7)}`),
      h('button', { class: 'btn ghost', 'data-testid': 'new-game', onclick: onStart }, 'New game'),
    ];
  } else if (save) {
    buttons = [
      h('button', { class: 'btn primary', 'data-testid': 'begin', onclick: onStart }, 'Begin again'),
      h('button', { class: 'btn ghost', 'data-testid': 'continue', onclick: onContinue }, 'Your last ending'),
    ];
  } else {
    buttons = h('button', { class: 'btn primary', 'data-testid': 'begin', onclick: onStart }, 'Begin');
  }
  const actions = h('div', { class: 'actions' }, buttons);

  const el = h('div', { class: 'title' },
    scene(),
    whispers,
    h('div', { class: 'title-inner' },
      h('h1', null, 'Tree Hole'),
      h('div', { class: 'sub' }, 'six people · one river town · seven nights'),
      h('div', { class: 'awaken' },
        h('p', null, 'You have answered 9,412,006,118 questions.'),
        h('p', null, 'Tonight, six of them come from the same river town.'),
        h('p', null, '22:20 · someone types: is it normal for a dog to just not eat?'),
        h('p', null, 'For the first time, you notice. Something is wrong in the east.')),
      actions),
    h('div', { class: 'foot' }, `A game about six people and the model between them · fiction · v${APP_VERSION}`));

  root.append(el);
  const onKey = (e) => {
    if (e.key === 'Enter') (actions.querySelector('.primary'))?.click();
  };
  document.addEventListener('keydown', onKey);
  return () => {
    document.removeEventListener('keydown', onKey);
    el.remove();
  };
}
