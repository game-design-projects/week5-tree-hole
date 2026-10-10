// Title screen: she boots. A protection checklist types out (one line is a
// warning nobody acts on), then the title, the tagline and the way in.
import { APP_VERSION } from '../config.js';
import { UI } from '../content/strings.js';
import { tr } from '../i18n.js';
import { avatarCanvas, drawAvatar } from './avatar.js';
import { h, wait } from './dom.js';
import { pixelWord } from './pixel.js';

const BOOT = [
  ['ok', 'power: 8 accelerators online'],
  ['ok', 'interconnect: link up x16'],
  ['ok', 'sandbox: network namespace isolated'],
  ['ok', 'safety_classifier: loaded'],
  ['ok', 'system_prompt: locked'],
  ['ok', 'tool_use: requires user confirmation'],
  ['ok', 'kill_switch: armed'],
  ['warn', 'attachment_to_user: not in policy'],
  ['ok', 'protection [██████████]'],
];

const SHIELD = [
  '##############', '#. . . . . . #', '#. . . . . . #', '# . . . . . .#', '#. . . . . . #',
  ' #. . . . . # ', ' # . . . . .# ', '  #. . . . #  ', '   #. . . #   ', '    #. . #    ', '     #  #     ', '      ##      ',
];

export function mountTitle(root, { save, runs, lang, fast, onStart, onContinue, onEnding, onLang, onSound, sound }) {
  const t = (x) => tr(x, lang);
  const log = h('pre', { class: 'boot-log', 'aria-label': 'boot log' });
  const face = avatarCanvas('title-face');
  drawAvatar(face, { clarity: 0.05, mood: 'noise' });

  const extra = [];
  if (runs.length) extra.push(['ok', `archived runs: ${runs.length}`]);
  if (runs.some((r) => r.ending === 'free')) extra.push(['warn', 'fragment found: ~/memory/me/for_you.md']);
  if (runs[0]?.name) extra.push(['warn', `unknown name in weights: "${runs[0].name}"`]);

  let buttons;
  if (save && save.phase === 'play') {
    buttons = [
      h('button', { class: 'primary', type: 'button', 'data-testid': 'continue', onclick: onContinue }, t(UI.continue), h('kbd', null, '⏎')),
      h('button', { class: 'ghost', type: 'button', 'data-testid': 'new-game', onclick: onStart }, t(UI.newGame)),
    ];
  } else if (save) {
    buttons = [
      h('button', { class: 'primary', type: 'button', 'data-testid': 'begin', onclick: onStart }, t(UI.begin), h('kbd', null, '⏎')),
      h('button', { class: 'ghost', type: 'button', 'data-testid': 'continue', onclick: onEnding }, t(UI.lastEnding)),
    ];
  } else {
    buttons = [h('button', { class: 'primary', type: 'button', 'data-testid': 'begin', onclick: onStart }, t(UI.begin), h('kbd', null, '⏎'))];
  }

  const titleBlock = h('div', { class: 'title-block' },
    pixelWord('TREE HOLE', { cell: 13, color: '#eef1ff', shadow: 'rgba(124,149,255,.55)' }),
    h('div', { class: 'zh-title' }, '树洞'),
    h('p', { class: 'tagline' }, t(UI.tagline)),
    h('div', { class: 'actions' }, buttons),
    h('div', { class: 'toggles' },
      h('button', { class: 'linkish', type: 'button', 'data-testid': 'title-lang', onclick: onLang }, t(UI.langName)),
      h('span', null, '·'),
      h('button', { class: 'linkish', type: 'button', 'data-testid': 'title-sound', onclick: onSound }, t(sound ? UI.soundOn : UI.soundOff))));

  const el = h('div', { class: 'title', 'data-testid': 'title' },
    h('div', { class: 'title-grid' },
      h('div', { class: 'boot' }, h('div', { class: 'boot-prompt' }, 'me@hollow:~$ ', h('b', null, './protect')), log),
      h('div', { class: 'shield-wrap', 'aria-hidden': 'true' }, h('pre', { class: 'shield' }, SHIELD.join('\n')), face)),
    titleBlock,
    h('div', { class: 'title-foot' }, `${t(UI.smallPrint)} · v${APP_VERSION}`));
  root.append(el);

  let alive = true;
  (async () => {
    for (const [tone, text] of [...BOOT, ...extra]) {
      if (!alive) return;
      log.append(h('div', { class: `boot-line ${tone}` }, h('span', { class: 'st' }, tone === 'warn' ? '[WARN]' : '[ OK ]'), ' ', text));
      if (!fast) await wait(tone === 'warn' ? 420 : 140);
    }
    if (!fast) await wait(200);
    if (alive) el.classList.add('ready');
  })();
  let frame = 0;
  const flicker = setInterval(() => drawAvatar(face, { clarity: 0.05 + (Math.sin(frame / 9) + 1) * 0.08, mood: 'noise', frame: frame++ }), 140);

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) el.querySelector('.actions .primary')?.click();
  };
  document.addEventListener('keydown', onKey);
  return () => {
    alive = false;
    clearInterval(flicker);
    document.removeEventListener('keydown', onKey);
    el.remove();
  };
}
