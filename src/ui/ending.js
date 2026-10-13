// The ending: a one-line verdict from the system, over the morning paper. The
// verdict is only about the service; the paper is about the people. The page
// unfolds column by column and stops on the last line.
import * as E from '../engine.js';
import { PAPER_DATE } from '../config.js';
import { PAPER, WHO } from '../content/index.js';
import { h } from './dom.js';
import { renderMap } from './map.js';
import { weatherBox } from './weather.js';

export function mountEnding(root, { state, log, fast, offline = false, onRestart, onTitle }) {
  const v = E.endingView(state);
  log.event('ending', v.id, { sus: v.sus, survivors: v.survivors });
  const mast = PAPER.masthead(v);
  const lead = PAPER.headline(v);
  const cols = PAPER.columns(v);
  const side = PAPER.sidebar(v);
  const last = PAPER.lastLine(v);
  const map = E.mapView({ ...state, night: 4 }, { onlyActive: false, night: 4 });
  const weather = weatherBox({ fallback: side.weather, offline, log });

  const el = h('div', { class: `ending ${v.good ? 'good' : 'bad'}${fast ? '' : ' unfold'}`, 'data-testid': 'ending', dataset: { ending: v.id } },
    h('div', { class: 'verdict', 'data-testid': 'verdict' },
      h('b', { 'data-testid': 'verdict-word' }, v.verdict), ' ', h('span', { 'data-testid': 'verdict-line' }, v.line)),
    h('article', { class: 'paper', 'data-testid': 'paper' },
      h('header', { class: 'masthead' },
        h('div', { class: 'mast-row' }, h('span', null, PAPER_DATE), h('span', null, 'No. 5,871'), h('span', null, '60p')),
        h('h1', null, mast.name),
        h('div', { class: 'mast-sub' }, mast.sub)),
      h('section', { class: 'lead' },
        h('h2', { 'data-testid': 'headline' }, lead.head),
        h('p', { class: 'deck' }, lead.deck),
        h('div', { class: 'lead-grid' },
          h('div', { class: 'lead-body' }, lead.body.map((p, i) => h('p', { class: i === 0 ? 'dropcap' : null }, p))),
          h('figure', { class: 'paper-map' }, renderMap(map), h('figcaption', null, 'Varrow at dawn. Dots mark where each conversation last came from.')))),
      h('section', { class: 'cols', 'data-testid': 'columns' },
        cols.map((c) => h('div', { class: `col tone-${c.npc}`, 'data-npc': c.npc },
          h('div', { class: 'kicker' }, c.kicker),
          h('h3', null, c.head),
          h('p', null, c.body)))),
      h('aside', { class: 'side' },
        weather.el,
        h('div', { class: 'box' }, h('h4', null, 'On the radio'), h('p', null, side.radio)),
        h('div', { class: 'box' }, h('h4', null, 'Buses'), h('p', null, side.bus)),
        h('div', { class: 'box notices' }, h('h4', null, 'Notices'), h('p', null, side.notice)),
        h('div', { class: 'box' }, h('h4', null, 'Classifieds'), side.classifieds.map((c) => h('p', { class: 'classified' }, c)))),
      h('footer', { class: `last${v.running ? ' live' : ''}`, 'data-testid': 'last-line' },
        h('span', { class: 'label' }, last.npc ? `${last.label} · ${WHO[last.npc].handle}` : last.label),
        h('span', { class: 'text' }, last.text))),
    h('div', { class: 'actions' },
      h('button', { class: 'btn primary', 'data-testid': 'play-again', onclick: onRestart }, 'Play again'),
      h('button', { class: 'btn ghost', onclick: onTitle }, 'Title screen')));

  root.append(el);
  return () => { weather.stop(); el.remove(); };
}
