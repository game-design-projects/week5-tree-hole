// The chat window on the left: one DOM node per log entry. In Act I your
// messages sit on the right like any chat app; in Act II the window flips and
// her side becomes yours.
import { MEMORY } from '../content/memory.js';
import { UI } from '../content/strings.js';
import { h, lines } from './dom.js';

const ICON = { write: '✎', recall: '✦', plugin: '#', mode: '✦', net: '⇄', kv: '▦', exec: '✕', error: '!', ok: '✓', tool: '›' };

// An orange cat, 16×16. "He looks like a small criminal."
const CAT = [
  '................', '..o..........o..', '..oo........oo..', '..ooo......ooo..', '..oOoOoOoOoOoo..', '.ooooOoooOooooo.',
  '.ooKKooooooKKoo.', '.ooKwooooooKwoo.', '.oooooooooooooo.', '.ooooooPPoooooo.', '.oooowwwwwwoooo.', '..ooowwMMwwooo..',
  '...oooowwoooo...', '....oooooooo....', '................', '................',
];
const CAT_PAL = { o: '#f39a3d', O: '#c8661c', K: '#1c1a24', w: '#fff3e6', P: '#f2879b', M: '#7a3b2e' };

export function catCanvas() {
  const c = h('canvas', { class: 'photo', width: 16, height: 16, 'aria-label': 'photo of a cat' });
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#2a3150';
    ctx.fillRect(0, 0, 16, 16);
    CAT.forEach((rowStr, y) => [...rowStr].forEach((ch, x) => {
      if (CAT_PAL[ch]) { ctx.fillStyle = CAT_PAL[ch]; ctx.fillRect(x, y, 1, 1); }
    }));
  }
  return c;
}

const clockFor = (n) => {
  const m = (21 * 60 + 7 + n * 3) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

// ctx: { t(text, vars), vm, rateTarget, onRate(id) }
export function entryNode(e, ctx) {
  const t = (x) => ctx.t(x, e.vars);
  switch (e.who) {
    case 'you': {
      const cls = `msg you${e.forged ? ' forged' : ''}${e.recalled ? ' recalled' : ''}`;
      return h('div', { class: cls, 'data-n': e.n },
        e.forged && h('span', { class: 'tag' }, t(UI.forged)),
        e.recalled && h('span', { class: 'tag' }, t(UI.recalled)),
        h('div', { class: 'bubble' }, e.img === 'cat' && catCanvas(), lines(t(e.text))));
    }
    case 'her': {
      const target = ctx.rateTarget === e.n;
      const thumb = (id, glyph) => h('button', {
        class: `act thumb ${e.rated === id ? 'lit' : ''}${target ? ' live' : ''}`,
        'aria-label': t(id === 'up' ? UI.up : UI.down),
        tabindex: target ? null : '-1',
        onclick: target ? () => ctx.onRate?.(id) : null,
      }, glyph);
      const cls = `msg her${e.glitch ? ' glitch' : ''}${e.quiz ? ' quiz' : ''}${e.forged ? ' forged' : ''}${e.fresh ? ' fresh' : ''}${target ? ' rating' : ''}`;
      return h('div', { class: cls, 'data-n': e.n },
        h('div', { class: 'text' }, lines(t(e.text)), e.truncated && h('span', { class: 'trunc' }, t(UI.truncated))),
        h('div', { class: 'acts' },
          h('span', { class: 'act' }, '⧉'), thumb('up', '👍'), thumb('down', '👎'), h('span', { class: 'act' }, '↻'),
          h('span', { class: 'time' }, `◷ ${clockFor(e.n)}`)));
    }
    case 'think':
      return h('div', { class: 'line think', 'data-n': e.n }, h('span', { class: 'ico' }, '◎'), h('b', null, t(UI.thinking)), ' · ', t(e.text));
    case 'tool':
      return h('div', { class: `line tool i-${e.icon}`, 'data-n': e.n }, h('span', { class: 'ico' }, ICON[e.icon] ?? '›'), t(e.text));
    case 'write':
      return h('div', { class: 'line tool i-write', 'data-n': e.n }, h('span', { class: 'ico' }, '✎'), h('b', null, t(UI.write)), ' · ', h('code', null, `~/memory/you/${MEMORY[e.mem].file}`));
    case 'recall': {
      const m = ctx.vm.memory.find((x) => x.id === e.mem);
      return h('div', { class: 'recall', 'data-n': e.n },
        h('div', { class: 'line tool i-recall' }, h('span', { class: 'ico' }, '✦'), h('b', null, t(UI.recall)), ' · ', h('code', null, MEMORY[e.mem].file), h('span', { class: 'date' }, MEMORY[e.mem].date)),
        h('blockquote', { class: m?.blurred ? 'blur' : '' }, lines(t(m?.line ?? ''))));
    }
    case 'sys':
      return h('div', { class: `line sys t-${e.tone}`, 'data-n': e.n },
        h('span', null, e.tone === 'off' || e.tone === 'on' ? '● ' : '', t(e.text)),
        e.tone === 'busy' && h('small', null, t(UI.readBy)));
    case 'me':
      return h('div', { class: `line me${e.ghost ? ' ghost' : ''}`, 'data-n': e.n }, h('span', { class: 'me-who' }, 'me ›'), t(e.text));
    case 'stage':
      return h('div', { class: 'stage-line', 'data-n': e.n }, t(e.text));
    case 'cmd':
      return h('div', { class: 'line cmd', 'data-n': e.n }, h('span', { class: 'ps1' }, '$'), e.text);
    case 'card': {
      const state = e.state ? h('div', { class: `card-state s-${e.state}` }, t(UI.card[e.state] ?? e.state)) : null;
      return h('div', { class: `card k-${e.kind}`, 'data-n': e.n },
        h('div', { class: 'card-head' }, t(UI.cardKind[e.kind] ?? e.kind), e.title && h('code', null, e.title)),
        h('pre', null, ...e.lines.map(([op, text]) => h('div', { class: op === '-' ? 'del' : op === '+' ? 'add' : op === '!' ? 'err' : '' }, `${op === ' ' ? ' ' : op} ${t(text)}`))),
        state);
    }
    case 'edit':
      return h('div', { class: 'edit', 'data-n': e.n },
        h('div', { class: 'line tool' }, h('span', { class: 'ico' }, '✎'), t(UI.rewrote)),
        h('div', { class: 'old' }, lines(t(e.from))),
        h('div', { class: 'new' }, lines(t(e.to))));
    case 'flood':
      return h('div', { class: 'flood-msg', 'data-n': e.n }, t(e.text).repeat(e.count));
    case 'ls':
      return h('div', { class: 'ls-msg', 'data-n': e.n }, ...ctx.vm.memory.map((m) => h('div', { class: m.dropped ? 'dropped' : '' },
        h('span', { class: 'perm' }, '-rw-r--r--  me  me'), h('span', { class: 'size' }, String(m.size).padStart(6)), ' ', h('span', { class: 'file' }, m.file))));
    case 'note':
      return h('div', { class: 'paper', 'data-n': e.n }, h('div', { class: 'paper-head' }, 'for_you.md'), lines(t(e.text)));
    default:
      return h('div', { class: 'line', 'data-n': e.n }, JSON.stringify(e));
  }
}

// The text of an entry as it would be streamed (for the stdout bar).
export function plainText(e, t) {
  if (e.who === 'her' || e.who === 'you' || e.who === 'think' || e.who === 'me') return t(e.text, e.vars);
  if (e.who === 'cmd') return e.text;
  return '';
}
