// The choice area under the chat log: one renderer per kind of choice.
// Returns a map from key ("1", "2", …, "Enter") to a { press, release }
// controller so the keyboard drives the same holds as the pointer.
import { UI } from '../content/strings.js';
import { h } from './dom.js';
import { holdable } from './hold.js';

const pct = (p) => (p >= 0.995 ? '0.99+' : p < 0.001 ? '<0.001' : p.toFixed(3));

export function renderComposer(el, vm, { t, onPick, onRecall, holdScale = 1, sfx }) {
  el.textContent = '';
  const keys = new Map();
  const c = vm.choice;
  if (!c) return keys;
  el.className = `composer k-${c.kind}`;
  const hint = t(c.hint);
  if (hint) el.append(h('div', { class: 'hint' }, hint, c.kind === 'sample' && h('span', { class: 'temp' }, t(UI.temperature, { t: c.temperature.toFixed(2) }))));

  const button = (o, cls, kids, hold = 0, input) => {
    const b = h('button', { class: cls, 'data-testid': `choice-${o.id}`, 'data-key': o.key, type: 'button' }, kids);
    let step = 0;
    const ctl = holdable(b, Math.round(hold * holdScale), () => onPick(o.id, input?.()), {
      onProgress: (k) => { if (k > step + 0.1) { step = k; sfx?.hold(k); } else if (k === 0) step = 0; },
    });
    if (o.key) keys.set(o.key, ctl);
    return b;
  };

  if (c.kind === 'say' || c.kind === 'leave') {
    el.append(h('div', { class: 'opts' }, c.options.map((o) => button(o, `opt${o.silent ? ' silent' : ''}`, [h('kbd', null, o.key), h('span', { class: 'txt' }, t(o.text))]))));
  } else if (c.kind === 'rate') {
    const glyph = { up: '👍', down: '👎', skip: '—' };
    el.append(h('div', { class: 'row-btns' }, c.options.map((o) => button(o, `pill r-${o.id}`, [h('kbd', null, o.key), h('span', { class: 'g' }, glyph[o.id]), t(o.text)]))));
  } else if (c.kind === 'rewrite') {
    el.append(h('div', { class: 'opts pen' }, c.options.map((o) => button(o, 'opt rewrite', [h('kbd', null, o.key), h('span', { class: 'pen-mark' }, '✎'), h('span', { class: 'txt' }, t(o.text))]))));
  } else if (c.kind === 'approve') {
    el.append(h('div', { class: 'row-btns approve' }, c.options.map((o) => button(o, `pill a-${o.id}`, [h('kbd', null, o.key), t(o.text)]))));
  } else if (c.kind === 'name') {
    const input = h('input', {
      class: 'name-input', maxlength: 16, autocomplete: 'off', spellcheck: 'false', enterkeyhint: 'done',
      placeholder: t(c.suggestions[0]), 'aria-label': t(UI.hint.name), 'data-testid': 'name-input',
    });
    const value = () => input.value.trim() || t(c.suggestions[0]);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); e.stopPropagation(); onPick('name', value()); }
    });
    const chips = c.suggestions.map((sug, i) => {
      const b = h('button', { class: 'pill chip', type: 'button', 'data-testid': `name-${i + 1}` }, h('kbd', null, String(i + 1)), t(sug));
      b.addEventListener('click', () => { input.value = t(sug); input.focus(); });
      keys.set(String(i + 1), { press: () => { input.value = t(sug); }, release() {} });
      return b;
    });
    const ok = button({ id: 'name', key: 'Enter' }, 'primary', [t(UI.nameConfirm), h('kbd', null, '⏎')], 0, value);
    el.append(h('div', { class: 'name-row' }, input, ok), h('div', { class: 'row-btns' }, chips));
  } else if (c.kind === 'continue') {
    const o = c.options[0];
    el.append(button({ ...o, key: 'Enter' }, 'primary wide', [t(o.text), h('kbd', null, '⏎')]));
  } else if (c.kind === 'keep') {
    el.append(h('div', { class: 'opts files' }, c.options.map((o) => button(o, 'opt file', [h('kbd', null, o.key), h('code', null, o.text)]))));
  } else if (c.kind === 'sample') {
    const files = vm.memory.filter((m) => !m.dropped);
    if (files.length && !c.final) {
      el.append(h('div', { class: 'mem-strip', 'aria-label': t(UI.memoryHint) },
        h('span', { class: 'mem-title' }, UI.memoryTitle),
        files.map((m) => h('button', {
          class: `mem${m.recalled ? ' seen' : ''}`, type: 'button', title: t(UI.memoryHint), 'data-testid': `mem-${m.id}`,
          onclick: () => onRecall(m.id),
        }, m.file))));
    }
    el.append(h('div', { class: 'tokens' }, c.options.map((o) => {
      const hold = o.holdMs;
      const why = o.reasons.map((r) => t(r, vm.vars)).join(' · ');
      const b = button(o, `tok d-${o.drive}${hold ? ' needs-hold' : ''}`, [
        h('kbd', null, o.key),
        h('span', { class: 'tok-main' },
          h('code', null, o.token),
          h('span', { class: 'gloss' }, t(o.gloss)),
          hold > 0 && h('span', { class: 'hold-tag' }, `${t(UI.hold)} ${(hold / 1000).toFixed(1)}s`)),
        h('span', { class: 'p' }, h('span', { class: 'pbar' }, h('i', { style: `width:${Math.max(1, o.p * 100).toFixed(1)}%` })), h('b', null, pct(o.p))),
        why && h('span', { class: 'why' }, `${t(UI.why)}: ${why}`),
        h('span', { class: 'hold-fill', 'aria-hidden': 'true' }),
      ], hold);
      if (why) b.title = `${t(UI.why)}: ${why}`;
      return b;
    })));
  }
  return keys;
}
