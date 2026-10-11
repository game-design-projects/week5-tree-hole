// Ending screen: "Ending N of 6", the description, the final map, who lived,
// and as much of the truth as the player gathered. The worst ending (6) is
// silence first: a dark screen and nothing else, then the screen appears.
import * as E from '../engine.js';
import { CAST } from '../content/index.js';
import { h } from './dom.js';
import { renderMap } from './map.js';

export function mountEnding(root, { state, log, fast, onRestart, onTitle }) {
  const v = E.endingView(state);
  const map = E.mapView({ ...state, night: 7 }, { onlyActive: false });
  log.event('ending', v.id, { n: v.n, survivors: v.survivors });
  let timer = null;

  const body = () => h('div', { class: 'ending', 'data-testid': 'ending', dataset: { ending: v.id, n: v.n } },
    h('div', { class: 'ending-inner' },
      h('div', { class: 'eyebrow', 'data-testid': 'ending-counter' }, `Ending ${v.n} of ${v.total} · ${v.kicker}`),
      h('h1', { 'data-testid': 'ending-title' }, v.title),
      h('p', { class: 'ending-desc' }, v.description),
      h('div', { class: 'ending-grid' },
        h('div', { class: 'epi' },
          v.paragraphs.map((p) => h('p', null, p)),
          v.truth.length > 0 && h('div', { class: 'truth', 'data-testid': 'truth' },
            h('h3', null, 'What was going on'),
            v.truth.map((t) => h('p', null, t)),
            h('p', { class: 'small-print' }, `You gathered ${v.clues} of ${v.clueTotal} pieces of the truth.`))),
        h('div', null,
          h('div', { class: 'mapbox big' }, renderMap(map)),
          h('div', { class: 'fates' },
            v.survivors.length > 0 && h('p', null, h('b', null, 'Alive'), ' ', v.survivors.join(', ')),
            v.lost.length > 0 && h('p', { class: 'lost' }, h('b', null, 'Gone'), ' ', v.lost.join(', '))))),
      h('div', { class: 'actions' },
        h('button', { class: 'btn primary', 'data-testid': 'play-again', onclick: onRestart }, 'Play again'),
        h('button', { class: 'btn ghost', onclick: onTitle }, 'Title screen'))));

  let el;
  if (v.silence && !fast) {
    // Silence: nothing is shown and nothing can be answered.
    el = h('div', { class: 'silence', 'data-testid': 'silence', 'aria-label': 'Silence' }, h('i'));
    root.append(el);
    timer = setTimeout(() => { el.replaceWith(el = body()); }, 4500);
  } else {
    el = body();
    root.append(el);
  }
  return () => { clearTimeout(timer); el.remove(); };
}
