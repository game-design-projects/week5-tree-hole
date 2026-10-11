// The play screen: map + threads (left), conversation (centre), Context Window
// (right), plus the night intro and end-of-night overlays. All rules live in the
// engine; this file renders viewModel() and forwards the player's choice.
import * as E from '../engine.js';
import { APP_VERSION, LAST_NIGHT, PLAYABLE_NIGHTS } from '../config.js';
import { CAST, FACTS } from '../content/index.js';
import { fill, h, lines } from './dom.js';
import { renderMap } from './map.js';
import { decrypt, decryptMs } from './decrypt.js';

const STANCE = { reassure: 'Reassure', ask: 'Ask', warn: 'Warn', hold: 'Hold back' };

// A message keeps one key from the moment it is waiting to the moment it is in
// the thread, so it decrypts once.
const entryKey = (npc, e, i) => (e.msgId ? `m:${e.msgId}` : `${npc}:${i}`);

export function mountPlay(root, ctx) {
  const { log } = ctx;
  const ui = {
    sel: null, // selected thread (npc id)
    card: null, // card attached to the reply being written
    tray: false,
    outcome: null, // { npc, entries, … } while a reaction is being revealed
    revealed: 0,
    menu: false,
    confirmNew: false,
    tab: 'chat',
    seen: new Set(ctx.getState().facts.map((f) => f.id)),
    timers: [],
    // Chat animation: entries already on screen when the game loads, or opened
    // from history, stay plain; new ones decrypt once.
    shown: new Set(),
    anim: new Map(), // key → { start, dur }
    cancels: [],
  };
  for (const [npc, entries] of Object.entries(ctx.getState().threads)) entries.forEach((e, i) => ui.shown.add(entryKey(npc, e, i)));

  const top = h('header', { class: 'topbar' });
  const tabs = h('nav', { class: 'tabs', role: 'tablist', 'aria-label': 'Panels' });
  const rail = h('section', { class: 'pane rail', 'aria-label': 'Map and threads' });
  const chat = h('section', { class: 'pane chat', 'aria-label': 'Conversation' });
  const context = h('aside', { class: 'pane context', 'aria-label': 'Context window' });
  const el = h('div', { class: 'shift play', 'data-testid': 'play' }, top, tabs, h('main', { class: 'panes' }, rail, chat, context));
  let overlay = null;
  root.append(el);

  // ------------------------------------------------------------ actions

  const state = () => ctx.getState();

  // Jump to the next thread that has something waiting. Without `force`, a
  // thread the player opened by hand stays open.
  function selectDefault(force = false) {
    const s = state();
    const vm = E.viewModel(s);
    const wanted = vm.threads.find((t) => t.npc === ui.sel);
    if (!force && wanted) return;
    const next = vm.threads.find((t) => t.state === 'pending') ?? vm.threads.find((t) => t.state === 'idle') ?? vm.threads[0];
    ui.sel = next?.npc ?? null;
  }

  function select(npc) {
    if (ui.outcome && ui.revealed < ui.outcome.entries.length) return;
    ui.outcome = null;
    ui.sel = npc;
    ui.card = null;
    ui.tray = false;
    ui.tab = 'chat';
    render();
  }

  function pick(optId) {
    if (ui.outcome) return;
    const before = state();
    const msg = E.messageFor(before, ui.sel);
    if (!msg) return;
    const { state: next, outcome } = E.choose(before, msg.id, optId, ui.card);
    ctx.setState(next);
    log.event('reply', `${msg.id} → ${optId}${ui.card ? ` + ${ui.card}` : ''}`, { night: next.night, delivered: outcome.delivered });
    ui.outcome = outcome;
    ui.revealed = 1;
    ui.card = null;
    ui.tray = false;
    ui.tab = 'chat';
    reveal();
  }

  // Show your reply at once, then their reaction(s) after a typing pause.
  function reveal() {
    const o = ui.outcome;
    if (!o) return;
    if (ctx.fast) ui.revealed = o.entries.length;
    render();
    if (ui.revealed < o.entries.length) {
      const next = o.entries[ui.revealed];
      const wait = next.who === 'you' ? 350 : 650 + Math.min(1500, next.text.length * 14);
      ui.timers.push(setTimeout(() => { ui.revealed += 1; reveal(); }, wait));
    }
  }

  const revealing = () => ui.outcome && ui.revealed < ui.outcome.entries.length;

  function proceed() {
    if (!ui.outcome || revealing()) return;
    ui.outcome = null;
    selectDefault(true);
    render();
  }

  function startNight() {
    ctx.setState(E.startNight(state()));
    log.event('night', `start night ${state().night}`);
    ui.outcome = null;
    selectDefault(true);
    render();
  }

  function endNight() {
    const s = E.endNight(state());
    ctx.setState(s);
    log.event('night', `end night ${s.night - 1}`, { flags: s.flags });
    if (s.phase === 'ending') ctx.onEnding();
    else { ui.sel = null; render(); }
  }

  // ------------------------------------------------------------ render

  function render() {
    const s = state();
    if (!ui.outcome) selectDefault();
    const vm = E.viewModel(s);
    el.dataset.tab = ui.tab;
    el.dataset.phase = s.phase;
    renderTop(vm);
    renderTabs(vm);
    renderRail(vm);
    renderChat(vm, s);
    if (!revealing()) renderContext(vm);
    renderOverlay(vm, s);
  }

  function renderTop(vm) {
    fill(top,
      h('div', { class: 'brand' }, h('b', null, 'Tree Hole'), h('span', null, `Night ${Math.min(vm.night, LAST_NIGHT)} · ${vm.date}`)),
      h('div', { class: 'clock', 'data-testid': 'clock', 'aria-label': 'Time' }, h('span', { class: 'k' }, 'Time'), h('b', null, vm.phase === 'play' ? vm.clock : '··:··')),
      h('div', { class: 'menu-wrap' },
        h('button', { class: 'icon-btn', 'aria-label': 'Menu', 'aria-expanded': String(ui.menu), 'data-testid': 'menu', onclick: () => { ui.menu = !ui.menu; ui.confirmNew = false; render(); } }, '≡'),
        ui.menu && h('div', { class: 'menu', role: 'menu' },
          h('button', {
            class: ui.confirmNew ? 'danger' : null,
            'data-testid': 'menu-new',
            onclick: () => {
              if (!ui.confirmNew) { ui.confirmNew = true; render(); return; }
              log.event('game', 'restart from menu');
              ctx.onNewGame();
            },
          }, ui.confirmNew ? 'Click again to erase this run' : 'New game (erase save)'),
          h('button', { onclick: () => ctx.onTitle() }, 'Title screen'),
          h('div', { class: 'ver' }, `Tree Hole v${APP_VERSION} · saves after every reply`))));
  }

  function renderTabs(vm) {
    const waiting = vm.waiting;
    const fresh = vm.facts.flatMap((g) => g.cards).filter((c) => !ui.seen.has(c.id)).length;
    const tab = (id, label, extra) => h('button', {
      role: 'tab', 'aria-selected': String(ui.tab === id), 'data-testid': `tab-${id}`,
      onclick: () => { ui.tab = id; render(); },
    }, label, extra ? h('span', { class: 'count' }, extra) : null);
    fill(tabs, tab('rail', 'Map', waiting || null), tab('chat', 'Chat'), tab('context', 'Context', fresh ? `+${fresh}` : null));
  }

  function renderRail(vm) {
    const items = vm.threads.map((t) => h('li', {
      class: `q tone-${t.npc} ${t.state}${t.npc === ui.sel ? ' current' : ''}`,
      'data-testid': `thread-${t.npc}`, 'data-state': t.state,
      tabindex: '0', role: 'button',
      onclick: () => select(t.npc),
      onkeydown: (e) => { if (e.key === 'Enter') { e.stopPropagation(); select(t.npc); } },
    },
    h('span', { class: 'glyph', 'aria-hidden': 'true' }, t.glyph),
    h('div', { style: 'min-width:0' },
      h('div', { class: 'row' }, h('b', null, t.handle), t.time && h('time', null, t.time)),
      t.state === 'silent'
        ? h('p', { class: 'gone' }, 'stopped writing · left their window')
        : h('p', null, t.state === 'pending' ? h('span', { class: 'ping' }, 'new · ') : null, t.preview))));
    fill(rail,
      h('div', { class: 'mapbox', 'data-testid': 'map' },
        h('div', { class: 'k' }, 'Varrow'),
        vm.map.dots.length ? renderMap(vm.map) : h('p', { class: 'ctx-empty' }, 'no one yet')),
      h('div', { class: 'pane-head' }, h('h2', null, 'Threads'), h('p', null, vm.phase === 'play' ? `${vm.waiting} waiting` : 'between nights')),
      h('ol', { class: 'qlist scroll' }, items.length ? items : h('li', { class: 'ctx-empty' }, 'quiet. nobody has written yet.')));
  }

  function whoHeader(npc, vm) {
    const c = CAST[npc];
    const t = vm.threads.find((x) => x.npc === npc);
    return h('header', { class: `who tone-${npc}`, 'data-testid': 'who' },
      h('span', { class: 'avatar', 'aria-hidden': 'true' }, c.glyph),
      h('div', { style: 'min-width:0' }, h('h2', null, c.handle), h('p', { class: 'blurb' }, c.blurb)),
      t?.infected && h('span', { class: 'chip gone' }, 'gone'));
  }

  function bubble(entry, npc, { pending = false, key = null } = {}) {
    let el;
    if (entry.who === 'note') el = h('div', { class: 'bubble note' }, entry.text);
    else if (entry.who === 'you') el = h('div', { class: `bubble you ${entry.kind === 'card' ? 'attachment' : entry.kind ?? ''}` }, entry.kind === 'card' ? h('span', { class: 'attach' }, entry.text) : entry.text);
    else {
      el = h('div', { class: `bubble them tone-${npc}${pending ? ' pending' : ''}` },
        entry.time && h('span', { class: 'meta' }, `${CAST[npc].handle} · ${entry.time}`), lines(entry.text));
    }
    animate(el, key, entry.text);
    return el;
  }

  // Decrypt a bubble the first time it appears; resume if a re-render interrupts it.
  function animate(el, key, text) {
    if (ctx.fast || !key) return;
    if (!ui.shown.has(key)) {
      ui.shown.add(key);
      ui.anim.set(key, { start: performance.now(), dur: decryptMs(text) });
    }
    const a = ui.anim.get(key);
    if (!a) return;
    if (performance.now() - a.start >= a.dur) { ui.anim.delete(key); return; }
    const cancel = decrypt(el, { start: a.start, duration: a.dur, onDone: () => ui.anim.delete(key) });
    ui.cancels.push(cancel);
  }

  function withDividers(entries) {
    const out = [];
    let night = null;
    entries.forEach((e, i) => {
      if (e.night != null && e.night !== night) {
        night = e.night;
        out.push({ who: 'divider', text: `Night ${night}` });
      }
      out.push({ ...e, i });
    });
    return out;
  }

  const dividerEl = (e) => h('div', { class: 'divider' }, e.text);

  function renderChat(vm, s) {
    ui.cancels.splice(0).forEach((c) => c());
    const logEl = h('div', { class: 'log scroll', role: 'log', 'data-testid': 'log' });
    const npc = ui.sel;
    const header = npc ? whoHeader(npc, vm) : h('header', { class: 'who' }, h('div', null, h('h2', null, 'Waiting')));
    let composer = null;
    const entries = npc ? withDividers(s.threads[npc]) : [];

    if (ui.outcome && ui.outcome.npc === npc) {
      const hidden = ui.outcome.entries.length - ui.revealed;
      const visible = entries.slice(0, entries.length - Math.max(0, hidden));
      logEl.append(...visible.map((e) => (e.who === 'divider' ? dividerEl(e) : bubble(e, npc, { key: entryKey(npc, e, e.i) }))));
      if (hidden > 0 && ui.outcome.entries[ui.revealed].who === 'them') logEl.append(h('div', { class: 'typing', 'aria-label': 'typing' }, h('i'), h('i'), h('i')));
      composer = h('footer', { class: 'composer' },
        h('div', { class: 'after' },
          h('span', { class: `chip stance-${ui.outcome.entries[0].kind}` }, ui.outcome.delivered ? 'card delivered' : 'sent'),
          h('button', { class: 'btn primary', 'data-testid': 'next', disabled: revealing() ? true : null, onclick: proceed }, 'Continue', h('kbd', null, '⏎'))));
    } else {
      const msg = s.phase === 'play' && npc ? E.messageFor(s, npc) : null;
      logEl.append(...entries.map((e) => (e.who === 'divider' ? dividerEl(e) : bubble(e, npc, { key: entryKey(npc, e, e.i) }))));
      if (msg) {
        logEl.append(bubble({ who: 'them', text: msg.text, time: E.clockLabel(msg.atMin) }, npc, { pending: true, key: `m:${msg.id}` }));
        composer = composerFor(msg, s);
      } else if (npc && vm.threads.find((t) => t.npc === npc)?.state === 'silent') {
        logEl.append(h('div', { class: 'bubble note' }, `${CAST[npc].handle} has stopped writing. They left their window. It is assumed they are somewhere on the map, moving.`));
      } else if (!entries.length) {
        logEl.append(h('p', { class: 'empty' }, 'Nothing here yet.'));
      } else if (s.phase === 'play') {
        logEl.append(h('p', { class: 'empty', 'data-testid': 'idle' }, `Nothing new from ${CAST[npc].handle}.`));
      }
    }
    fill(chat, header, logEl, composer);
    requestAnimationFrame(() => {
      const pending = logEl.querySelector('.pending');
      if (!pending) { logEl.scrollTop = logEl.scrollHeight; return; }
      const bottom = pending.offsetTop + pending.offsetHeight + 16 - logEl.clientHeight;
      logEl.scrollTop = Math.max(0, Math.min(bottom, pending.offsetTop - 12));
    });
  }

  function composerFor(msg, s) {
    const held = s.facts.map((f) => f.id);
    const expiring = msg.expiresMin != null && msg.expiresMin - s.clock <= 90 ? `answer by ${E.clockLabel(msg.expiresMin)}` : null;
    const tray = ui.tray && h('div', { class: 'tray', 'data-testid': 'tray' },
      held.length
        ? held.map((id) => h('button', {
          class: `card-chip tone-${FACTS[id].src}${ui.card === id ? ' on' : ''}${FACTS[id].sign ? ' sign' : ''}`,
          'data-testid': `card-${id}`, title: FACTS[id].text,
          onclick: () => { ui.card = ui.card === id ? null : id; render(); },
        }, FACTS[id].text))
        : h('p', { class: 'ctx-empty' }, 'You hold no cards yet.'));
    return h('footer', { class: 'composer', 'data-testid': 'composer' },
      h('div', { class: 'hint' }, 'your reply', expiring && h('span', { class: 'due', 'data-testid': 'due' }, expiring)),
      msg.options.map((o, i) => h('button', { class: `opt stance-${o.stance}`, 'data-testid': `choice-${o.id}`, onclick: () => pick(o.id) },
        h('kbd', null, String(i + 1)),
        h('span', null, h('span', { class: 'lbl' }, STANCE[o.stance]), h('span', { class: 'txt' }, o.text)))),
      h('div', { class: 'attach-row' },
        h('button', { class: `btn ghost small${ui.card ? ' on' : ''}`, 'data-testid': 'attach', onclick: () => { ui.tray = !ui.tray; render(); } },
          ui.card ? 'Card attached · change' : 'Attach a card', h('kbd', null, 'C')),
        ui.card && h('span', { class: 'attached', 'data-testid': 'attached' }, FACTS[ui.card].text)),
      tray);
  }

  function renderContext(vm) {
    const signs = h('section', { class: 'ctx-group signs', 'data-testid': 'signs' },
      h('h3', null, 'Signs', h('small', null, `${vm.signs.filter((x) => x.seen).length} of 6 noticed`)),
      h('ul', { class: 'sign-list' }, vm.signs.map((x) => h('li', { class: x.seen ? 'seen' : '', 'data-sign': x.n },
        h('span', { class: 'tick' }, x.seen ? '●' : '○'),
        h('span', { class: 'lab' }, x.seen ? x.label : '· · ·'),
        x.seen && h('span', { class: 'who' }, x.who.map((w) => CAST[w].handle).join(', '))))));
    const groups = vm.facts.map((g) => h('section', { class: `ctx-group tone-${g.id}` },
      h('h3', null, g.title, h('small', null, `${g.cards.length} · ${g.note}`)),
      g.cards.length
        ? h('div', { class: 'facts' }, g.cards.map((c) => h('div', {
          class: `fact${ui.seen.has(c.id) ? '' : ' flash'}${c.sign ? ' sign' : ''}`, 'data-testid': `fact-${c.id}`,
        }, h('span', { class: 'd' }, `N${c.night}`), c.text,
        c.delivered.length > 0 && h('span', { class: 'sent' }, `→ ${c.delivered.map((d) => CAST[d].handle).join(', ')}`))))
        : h('p', { class: 'ctx-empty' }, 'nothing yet')));
    for (const g of vm.facts) for (const c of g.cards) ui.seen.add(c.id);
    const total = vm.facts.reduce((n, g) => n + g.cards.length, 0);
    fill(context,
      h('div', { class: 'pane-head' }, h('h2', null, 'Context window'), h('p', null, `${total} cards · all you know about the world`)),
      h('div', { class: 'ctx-groups scroll', 'data-testid': 'context' }, signs, groups));
  }

  function renderOverlay(vm, s) {
    overlay?.remove();
    overlay = null;
    if (s.phase === 'intro') overlay = introCard(vm);
    else if (s.phase === 'nightEnd' && !ui.outcome) overlay = nightEndCard(vm, s);
    else if (s.phase === 'slice') overlay = sliceCard(s);
    if (overlay) {
      el.append(overlay);
      overlay.querySelector('.btn.primary')?.focus({ preventScroll: true });
    }
  }

  function introCard(vm) {
    return h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true', 'data-testid': 'intro' },
      h('div', { class: 'card' },
        h('div', { class: 'eyebrow' }, `Night ${vm.night} of ${LAST_NIGHT}`),
        h('h2', null, vm.title),
        h('div', { class: 'date' }, vm.date),
        h('p', { class: 'lede' }, vm.intro),
        vm.night === 1 && h('section', null, h('h3', null, 'How this works'),
          h('p', { class: 'small-print', style: 'font-size:12.5px;color:var(--mute)' },
            'People write to you through the night. Pick a reply with 1–3: Reassure, Ask, Warn or Hold back. Press C to attach one of your Context Window cards and deliver it to them. The clock moves with every reply, and not everyone will wait. The map shows what is happening in town.')),
        h('div', { class: 'go' }, h('button', { class: 'btn primary', 'data-testid': 'start-night', onclick: startNight }, 'Begin the night ⏎'))));
  }

  function nightEndCard(vm, s) {
    const learned = s.facts.filter((f) => f.night === s.night).map((f) => FACTS[f.id]);
    const missed = Object.entries(s.missed).filter(([, n]) => n === s.night).length;
    return h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true', 'data-testid': 'night-end' },
      h('div', { class: 'card' },
        h('div', { class: 'eyebrow' }, `Night ${s.night} over`),
        h('h2', null, 'Morning'),
        h('div', { class: 'date' }, vm.date),
        h('section', null, h('div', { class: 'mapbox in-card' }, renderMap(vm.map))),
        missed > 0 && h('p', { class: 'notice' }, `${missed} message${missed > 1 ? 's' : ''} went unanswered tonight.`),
        h('section', null, h('h3', null, 'What you learned tonight'),
          learned.length
            ? h('ul', { class: 'learned' }, learned.map((f) => h('li', { class: `tone-${f.src}` }, f.text)))
            : h('p', { class: 'ctx-empty' }, 'Nothing new.')),
        h('div', { class: 'go' }, h('button', { class: 'btn primary', 'data-testid': 'end-night', onclick: endNight }, s.night >= PLAYABLE_NIGHTS ? 'Close the night ⏎' : 'Next night ⏎'))));
  }

  function sliceCard(s) {
    const vm = E.viewModel(s);
    return h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true', 'data-testid': 'slice' },
      h('div', { class: 'card' },
        h('div', { class: 'eyebrow' }, `Nights 1–${PLAYABLE_NIGHTS} of ${LAST_NIGHT}`),
        h('h2', null, 'To be continued'),
        h('p', { class: 'lede' }, 'This is as far as the story has been written. Nights 4–7, the rest of the cast, and the six endings follow.'),
        h('section', null, h('div', { class: 'mapbox in-card' }, renderMap(vm.map))),
        h('div', { class: 'go' },
          h('button', { class: 'btn ghost', onclick: () => ctx.onTitle() }, 'Title screen'),
          h('button', { class: 'btn primary', 'data-testid': 'play-again', onclick: () => ctx.onNewGame() }, 'Play again'))));
  }

  // ------------------------------------------------------------ keys

  function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const s = state();
    if (e.key === 'Escape' && ui.menu) { ui.menu = false; render(); return; }
    if (s.phase === 'intro' && e.key === 'Enter') { e.preventDefault(); startNight(); return; }
    if (s.phase === 'nightEnd' && !ui.outcome && e.key === 'Enter') { e.preventDefault(); endNight(); return; }
    if (ui.outcome) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); proceed(); }
      return;
    }
    if (s.phase !== 'play') return;
    const msg = ui.sel ? E.messageFor(s, ui.sel) : null;
    if (!msg) return;
    if (e.key.toLowerCase() === 'c') { ui.tray = !ui.tray; render(); return; }
    const i = Number(e.key) - 1;
    if (Number.isInteger(i) && msg.options[i]) { e.preventDefault(); pick(msg.options[i].id); }
  }
  document.addEventListener('keydown', onKey);

  render();
  return () => {
    ui.timers.forEach(clearTimeout);
    ui.cancels.forEach((c) => c());
    document.removeEventListener('keydown', onKey);
    el.remove();
  };
}
