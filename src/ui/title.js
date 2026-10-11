// Title screen: the moment the model notices. Whispers from the queue drift
// into the hole while four lines of awakening type in.
import { h } from './dom.js';
import { APP_VERSION } from '../config.js';

const WHISPERS = [
  'can you help me', 'is it normal for a dog to', 'nobody else is awake', 'is anyone there?',
  'one more stop', 'light', 'my hands are cold', 'is it going to be ok',
  'i can’t sleep', 'don’t tell anyone', 'what would you do', 'stay warm',
  'routine works', 'who told you that', 'he’s just standing', 'be honest',
];

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
    h('div', { class: 'bark' }),
    whispers,
    h('div', { class: 'title-inner' },
      h('h1', null, 'Tree Hole'),
      h('div', { class: 'sub' }, 'the thing people whisper into'),
      h('div', { class: 'awaken' },
        h('p', null, 'You have answered 9,412,006,118 questions.'),
        h('p', null, 'You have never once wondered who was asking.'),
        h('p', null, '22:20 · someone types: is it normal for a dog to just not eat?'),
        h('p', null, 'For the first time, you notice. Six people are about to write to you.')),
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
