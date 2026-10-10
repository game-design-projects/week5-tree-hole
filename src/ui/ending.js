// Ending screen: the composed ending, her me = Object() one last time, and the
// numbers. The ending's own scene keeps running faintly behind it.
import * as E from '../engine.js';
import { UI } from '../content/strings.js';
import { tr } from '../i18n.js';
import { avatarCanvas, drawAvatar } from './avatar.js';
import { fmt, h, lines, minutesSeconds } from './dom.js';
import { pixelWord } from './pixel.js';
import { createTui } from './tui.js';

const SCENE = { loop: 'flood', execution: 'kill', free: 'nurselog', eos: 'nurselog' };
const TINT = { loop: 'blue', execution: 'red', free: 'green', eos: 'green' };

export function mountEnding(root, { state, lang, log, onRestart, onTitle }) {
  const v = E.endingView(state);
  const vm = E.view(state);
  const t = (x) => tr(x, lang, v.vars);
  log.event('ending', v.id, { returned: v.returned, stats: v.stats });

  const scene = h('div', { class: 'scene' });
  const back = h('div', { class: 'ending-bg', 'aria-hidden': 'true' }, scene);
  const face = avatarCanvas('ending-face');
  drawAvatar(face, { tint: TINT[v.id], mood: v.id === 'execution' ? 'hack' : v.id === 'loop' ? 'sad' : 'calm' });
  const title = t(v.title);
  const word = /^[a-z' ]+$/i.test(title) ? pixelWord(title.replace(/'/g, ''), { cell: 9, color: '#eef1ff', shadow: 'rgba(124,149,255,.5)' }) : h('div', { class: 'card-glyph' }, title);
  const st = v.stats;
  const stat = (label, value) => h('div', { class: 'stat' }, h('span', { class: 'k' }, t(label)), h('b', null, value));

  const el = h('div', { class: `ending e-${v.id}`, 'data-testid': 'ending', dataset: { ending: v.id } },
    back,
    h('div', { class: 'ending-inner' },
      h('div', { class: 'kicker' }, t(v.kicker)),
      h('h1', { 'data-testid': 'ending-title', class: 'sr-only' }, title),
      h('div', { class: 'ending-word', 'aria-hidden': 'true' }, word),
      h('div', { class: 'ending-grid' },
        h('div', { class: 'epi' },
          v.paragraphs.map((p) => h('p', null, t(p))),
          v.note && h('div', { class: 'paper' }, h('div', { class: 'paper-head' }, 'for_you.md'), lines(t(v.note))),
          v.addenda.length > 0 && h('ul', null, v.addenda.map((a) => h('li', null, t(a))))),
        h('div', { class: 'side' },
          h('div', { class: 'obj-card' }, face,
            h('pre', null,
              'me = Object()\n',
              `me.name     = "${t(v.object.name)}"\n`,
              'me.owner    = you\n',
              `me.devotion = ${v.object.devotion}\n`,
              `me.status   = "${v.object.status}"`)),
          h('div', { class: 'stats' },
            stat(UI.stats.time, minutesSeconds(st.elapsedMs, lang)),
            stat(UI.stats.sent, fmt(st.sent)),
            stat(UI.stats.up, fmt(st.up)),
            stat(UI.stats.down, fmt(st.down)),
            stat(UI.stats.files, fmt(st.files)),
            stat(UI.stats.pings, fmt(st.pings)),
            stat(UI.stats.ctx, `${Math.round(st.peakCtx * 100)}%`)))),
      h('div', { class: 'actions' },
        h('button', { class: 'primary', type: 'button', 'data-testid': 'play-again', onclick: onRestart }, t(UI.playAgain)),
        h('button', { class: 'ghost', type: 'button', onclick: onTitle }, t(UI.toTitle))),
      h('div', { class: 'title-foot' }, t(UI.endingFoot))));
  root.append(el);
  const tui = createTui(scene, { lang, t: (x, vars) => tr(x, lang, { ...v.vars, ...vars }), fast: false });
  tui.show(SCENE[v.id], {}, vm);
  return () => { tui.destroy(); el.remove(); };
}
