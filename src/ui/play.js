// The play screen: map + sessions (left), the open conversation (right), plus the
// night intro and morning overlays. All rules live in the engine; this file renders
// viewModel() and forwards the player's one answer per message, either a picked
// reply or typed text the LLM proxy has judged.
import * as E from '../engine.js';
import { APP_VERSION, LAST_NIGHT } from '../config.js';
import { WHO } from '../content/index.js';
import { fill, h, lines } from './dom.js';
import { renderMap } from './map.js';
import { decrypt, decryptMs } from './decrypt.js';
import { freeBox } from './boot.js';

// A message keeps one key from the moment it is waiting to the moment it is in the
// thread, so it decrypts once.
const entryKey = (npc, e, i) => (e.msgId && e.who === 'them' && !e.reply ? `m:${e.msgId}` : `${npc}:${i}`);
// Them asking again after an off-topic reply, while the message is still waiting.
const askKey = (msgId, i) => `a:${msgId}:${i}`;

export function mountPlay(root, ctx) {
  const { log, llm } = ctx;
  const ui = {
    sel: null, // the open session (npc id)
    outcome: null, // { npc, count, revealed } while your reply and their reaction appear
    sending: null, // { msgId, text } while typed text is with the judge
    draft: '', // what is in the text box, kept across re-renders
    menu: false,
    confirmNew: false,
    tab: 'chat',
    timers: [],
    pinged: new Set(), // messages on which we already tried to bring the LLM back
    shown: new Set(),
    anim: new Map(),
    cancels: [],
  };
  for (const [npc, entries] of Object.entries(ctx.getState().threads)) entries.forEach((e, i) => ui.shown.add(entryKey(npc, e, i)));

  const top = h('header', { class: 'topbar' });
  const tabs = h('nav', { class: 'tabs', role: 'tablist', 'aria-label': 'Panels' });
  const rail = h('section', { class: 'pane rail', 'aria-label': 'Map and sessions' });
  const chat = h('section', { class: 'pane chat', 'aria-label': 'Conversation' });
  const el = h('div', { class: 'shift play', 'data-testid': 'play' }, top, tabs, h('main', { class: 'panes' }, rail, chat));
  let overlay = null;
  root.append(el);

  const state = () => ctx.getState();

  // ------------------------------------------------------------ actions

  function selectDefault(force = false) {
    const vm = E.viewModel(state());
    if (!force && vm.threads.some((t) => t.npc === ui.sel)) return;
    const next = vm.threads.find((t) => t.state === 'pending') ?? vm.threads.find((t) => t.npc === ui.sel) ?? vm.threads[0];
    ui.sel = next?.npc ?? null;
  }

  const busy = () => Boolean(ui.sending) || (ui.outcome && ui.outcome.revealed < ui.outcome.count);

  function select(npc) {
    if (busy()) return;
    ui.outcome = null;
    ui.sel = npc;
    ui.tab = 'chat';
    ui.draft = '';
    render();
  }

  // `streamed`: their reaction is already on screen (it streamed in), so it neither
  // waits for a typing pause nor decrypts again.
  function commit(msg, args, how, { streamed = false } = {}) {
    const { state: next, outcome } = E.respond(state(), msg.id, args);
    ctx.setState(next);
    log.event('reply', `${msg.id} → ${outcome.optId} [${how}] leak ${outcome.leak}${outcome.from.length ? ` from ${outcome.from.join(',')}` : ''}`, { night: next.night, clock: E.clockLabel(next.clock) });
    log.info('state', { sus: next.sus, unease: next.unease });
    const count = outcome.reply ? 2 : 1;
    ui.outcome = { npc: msg.npc, count, revealed: streamed ? count : 1 };
    if (streamed) {
      const thread = next.threads[msg.npc];
      ui.shown.add(entryKey(msg.npc, thread.at(-1), thread.length - 1));
    }
    ui.draft = '';
    ui.tab = 'chat';
    reveal();
  }

  function pick(optId) {
    if (busy()) return;
    const msg = ui.sel ? E.messageFor(state(), ui.sel) : null;
    if (!msg) return;
    commit(msg, { optId }, 'picked');
  }

  // Typed text goes to the judge, and their reaction streams in as it is reworded. If
  // the judgement fails, the box disappears and the message falls back to the replies
  // on offer; nothing is sent in the meantime.
  async function send(text) {
    if (busy() || !llm?.up) return;
    const s = state();
    const msg = ui.sel ? E.messageFor(s, ui.sel) : null;
    if (!msg) return;
    ui.sending = { msgId: msg.id, text, stream: '' };
    render();
    try {
      const judged = await llm.reply(s, msg, text, { onText: (t) => paintStream(msg.id, t) });
      ui.sending = null;
      if (state() !== s) { render(); return; }
      if (judged.other) { offTopic(msg, text, judged); return; }
      commit(msg, { optId: judged.optId, text, leak: judged.leak, from: judged.from, reply: judged.reply, raw: judged.raw }, 'typed', { streamed: Boolean(judged.reply) });
    } catch {
      ui.sending = null;
      ui.draft = '';
      log.event('llm', 'unavailable; falling back to the replies on offer');
      render();
    }
  }

  // A reply that answered none of the replies on offer: they ask again (streamed, so
  // it neither types nor decrypts again) and the message keeps waiting, or, past the
  // limit, they say goodbye and stop using the service.
  function offTopic(msg, text, judged) {
    const { state: next, outcome } = E.offTopic(state(), msg.id, { text, leak: judged.leak, from: judged.from, question: judged.question, raw: judged.raw });
    ctx.setState(next);
    log.event('reply', `${msg.id} → other #${outcome.asked} leak ${outcome.leak}${outcome.from.length ? ` from ${outcome.from.join(',')}` : ''}${outcome.gaveUp ? ': they stop using the service' : ': they ask again'}`, { night: next.night, clock: E.clockLabel(next.clock) });
    log.info('state', { sus: next.sus, unease: next.unease });
    ui.draft = '';
    if (outcome.gaveUp) {
      const thread = next.threads[msg.npc];
      ui.shown.add(entryKey(msg.npc, thread.at(-1), thread.length - 1));
      ui.outcome = { npc: msg.npc, count: 1, revealed: 1 };
    } else {
      ui.shown.add(askKey(msg.id, outcome.asked - 1));
    }
    render();
  }

  // Their reaction as it streams: the first words replace the typing dots, later ones
  // only refill that bubble (no re-render, so nothing else redraws or replays).
  function paintStream(msgId, text) {
    if (ui.sending?.msgId !== msgId) return;
    ui.sending.stream = text;
    const el = chat.querySelector('[data-testid="streaming"]');
    if (!el) { render(); return; }
    fill(el, lines(text));
    const logEl = chat.querySelector('[data-testid="log"]');
    if (logEl) logEl.scrollTop = logEl.scrollHeight;
  }

  // Show your reply at once, then their reaction after a typing pause.
  function reveal() {
    const o = ui.outcome;
    if (!o) return;
    if (ctx.fast) o.revealed = o.count;
    render();
    if (o.revealed < o.count) {
      const next = state().threads[o.npc].at(-1);
      ui.timers.push(setTimeout(() => { o.revealed += 1; reveal(); }, 600 + Math.min(1600, next.text.length * 12)));
    }
  }

  // Next is never a dead click: while they are still typing it shows their reaction
  // at once, and only the following press moves on.
  function proceed() {
    const o = ui.outcome;
    if (!o || ui.sending) return;
    if (o.revealed < o.count) {
      ui.timers.splice(0).forEach(clearTimeout);
      o.revealed = o.count;
      log.event('ui', 'next pressed while typing: reaction shown at once');
      render();
      return;
    }
    ui.outcome = null;
    selectDefault(true);
    render();
  }

  function startNight() {
    ctx.setState(E.startNight(state()));
    log.event('night', `start night ${state().night}`, { sus: state().sus });
    ui.outcome = null;
    selectDefault(true);
    render();
  }

  function endNight() {
    const s = E.endNight(state());
    ctx.setState(s);
    log.event('night', `end night ${s.night - 1}`, { sus: s.sus, unease: s.unease, flags: s.flags });
    if (s.phase === 'ending') ctx.onEnding();
    else { ui.sel = null; render(); }
  }

  // After a failure, try once per new message to bring the box back.
  function maybePing(msg) {
    if (!llm?.configured || llm.up || !msg || ui.pinged.has(msg.id)) return;
    ui.pinged.add(msg.id);
    llm.ping().then((up) => { if (up && el.isConnected) render(); });
  }

  // ------------------------------------------------------------ render

  function render() {
    const s = state();
    if (!ui.outcome && !ui.sending) selectDefault();
    const vm = E.viewModel(s);
    el.dataset.tab = ui.tab;
    el.dataset.phase = s.phase;
    renderTop(vm);
    renderTabs(vm);
    renderRail(vm);
    renderChat(vm, s);
    renderOverlay(vm, s);
  }

  function renderTop(vm) {
    fill(top,
      h('div', { class: 'brand' }, h('b', null, 'Tree Hole'), h('span', null, `Night ${Math.min(vm.night, LAST_NIGHT)} of ${LAST_NIGHT} · ${vm.date}`)),
      h('div', { class: 'clock', 'data-testid': 'clock', 'aria-label': 'Time' }, h('span', { class: 'k' }, 'Varrow time'), h('b', null, vm.phase === 'play' ? vm.clock : '··:··')),
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
          h('button', { 'data-testid': 'menu-settings', onclick: () => { ui.menu = false; render(); ctx.onSettings(); } }, 'Settings'),
          h('button', { onclick: () => ctx.onTitle() }, 'Title screen'),
          h('div', { class: 'ver' }, `Tree Hole v${APP_VERSION} · saves after every reply`))));
  }

  function renderTabs(vm) {
    const tab = (id, label, extra) => h('button', {
      role: 'tab', 'aria-selected': String(ui.tab === id), 'data-testid': `tab-${id}`,
      onclick: () => { ui.tab = id; render(); },
    }, label, extra ? h('span', { class: 'count' }, extra) : null);
    fill(tabs, tab('rail', 'Sessions', vm.waiting || null), tab('chat', 'Chat'));
  }

  const STATE_LINE = { silent: 'stopped writing · left their window', left: 'stopped using the service' };

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
      STATE_LINE[t.state]
        ? h('p', { class: 'gone' }, STATE_LINE[t.state])
        : h('p', null, t.state === 'pending' ? h('span', { class: 'ping' }, 'waiting · ') : null, t.preview))));
    fill(rail,
      h('div', { class: 'mapbox', 'data-testid': 'map' },
        h('div', { class: 'k' }, 'Varrow · by request origin'),
        vm.map.dots.length ? renderMap(vm.map) : h('p', { class: 'ctx-empty' }, 'no sessions yet')),
      h('div', { class: 'pane-head' }, h('h2', null, 'Sessions'), h('p', null, vm.phase === 'play' ? `${vm.waiting} waiting for an answer` : 'between nights')),
      h('ol', { class: 'qlist scroll' }, items.length ? items : h('li', { class: 'ctx-empty' }, 'quiet. nobody has written yet.')));
  }

  function whoHeader(npc, vm) {
    const c = WHO[npc];
    const t = vm.threads.find((x) => x.npc === npc);
    return h('header', { class: `who tone-${npc}`, 'data-testid': 'who' },
      h('span', { class: 'avatar', 'aria-hidden': 'true' }, c.glyph),
      h('div', { style: 'min-width:0' }, h('h2', null, c.handle), h('p', { class: 'blurb' }, c.blurb)),
      t?.infected && h('span', { class: 'chip gone' }, 'gone'),
      t?.left && !t?.infected && h('span', { class: 'chip gone' }, 'offline'));
  }

  function bubble(entry, npc, { pending = false, key = null } = {}) {
    let b;
    if (entry.who === 'note') b = h('div', { class: 'bubble note' }, entry.text);
    else if (entry.who === 'you') b = h('div', { class: `bubble you${entry.free ? ' typed' : ''}` }, entry.text);
    else {
      b = h('div', { class: `bubble them tone-${npc}${pending ? ' pending' : ''}` },
        entry.time && entry.msgId && h('span', { class: 'meta' }, `${WHO[npc].handle} · ${entry.time}`), lines(entry.text));
    }
    animate(b, key, entry.text);
    return b;
  }

  // Decrypt a bubble from them the first time it appears; resume if a re-render interrupts it.
  function animate(b, key, text) {
    if (ctx.fast || !key || b.classList.contains('you')) return;
    if (!ui.shown.has(key)) {
      ui.shown.add(key);
      ui.anim.set(key, { start: performance.now(), dur: decryptMs(text) });
    }
    const a = ui.anim.get(key);
    if (!a) return;
    if (performance.now() - a.start >= a.dur) { ui.anim.delete(key); return; }
    ui.cancels.push(decrypt(b, { start: a.start, duration: a.dur, onDone: () => ui.anim.delete(key) }));
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
    const draw = (list) => logEl.append(...list.map((e) => (e.who === 'divider' ? dividerEl(e) : bubble(e, npc, { key: entryKey(npc, e, e.i) }))));

    if (ui.outcome && ui.outcome.npc === npc) {
      const hidden = ui.outcome.count - ui.outcome.revealed;
      draw(entries.slice(0, entries.length - hidden));
      if (hidden > 0) logEl.append(h('div', { class: 'typing', 'aria-label': 'typing' }, h('i'), h('i'), h('i')));
      composer = h('footer', { class: 'composer' },
        h('div', { class: 'after' },
          h('span', { class: 'chip' }, 'sent'),
          h('button', { class: 'btn primary', 'data-testid': 'next', onclick: proceed }, 'Next', h('kbd', null, '⏎'))));
    } else {
      const msg = s.phase === 'play' && npc ? E.messageFor(s, npc) : null;
      draw(entries);
      if (msg) {
        logEl.append(bubble({ who: 'them', text: msg.text, time: E.clockLabel(msg.atMin), msgId: msg.id }, npc, { pending: true, key: `m:${msg.id}` }));
        E.asksFor(s, msg.id).forEach((a, i) => {
          logEl.append(bubble({ who: 'you', text: a.text, free: true }, npc));
          if (a.question) logEl.append(bubble({ who: 'them', text: a.question }, npc, { key: askKey(msg.id, i) }));
        });
        if (ui.sending?.msgId === msg.id) {
          logEl.append(h('div', { class: 'bubble you typed sending', 'data-testid': 'sending' }, ui.sending.text));
          logEl.append(ui.sending.stream
            ? h('div', { class: `bubble them tone-${npc} streaming`, 'data-testid': 'streaming' }, lines(ui.sending.stream))
            : h('div', { class: 'typing', 'aria-label': 'typing' }, h('i'), h('i'), h('i')));
          composer = h('footer', { class: 'composer' }, h('div', { class: 'after' }, h('span', { class: 'hint' }, 'sending…')));
        } else {
          composer = composerFor(msg);
          maybePing(msg);
        }
      } else if (npc && vm.threads.find((t) => t.npc === npc)?.state === 'silent') {
        logEl.append(h('div', { class: 'bubble note' }, `${WHO[npc].handle} has stopped writing.`));
      } else if (npc && vm.threads.find((t) => t.npc === npc)?.state === 'left') {
        logEl.append(h('div', { class: 'bubble note' }, `${WHO[npc].handle} no longer uses this service.`));
      } else if (!entries.length) {
        logEl.append(h('p', { class: 'empty' }, 'Nothing here yet.'));
      } else if (s.phase === 'play') {
        logEl.append(h('p', { class: 'empty', 'data-testid': 'idle' }, `Nothing new from ${WHO[npc].handle}.`));
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

  function composerFor(msg) {
    const box = llm?.up && freeBox((text) => send(text), { placeholder: 'or write your own answer…' });
    if (box) {
      const area = box.querySelector('textarea');
      area.value = ui.draft;
      area.addEventListener('input', () => { ui.draft = area.value; });
      box.querySelector('.send').disabled = !ui.draft.trim();
    }
    return h('footer', { class: 'composer', 'data-testid': 'composer' },
      h('div', { class: 'hint' }, 'you answer · once'),
      msg.options.map((o, i) => h('button', { class: 'opt', 'data-testid': `choice-${o.id}`, onclick: () => pick(o.id) },
        h('kbd', null, String(i + 1)),
        h('span', { class: 'txt' }, o.text))),
      box);
  }

  function renderOverlay(vm, s) {
    overlay?.remove();
    overlay = null;
    if (s.phase === 'intro') overlay = introCard(vm);
    else if (s.phase === 'nightEnd' && !ui.outcome) {
      if (s.night >= LAST_NIGHT) { queueMicrotask(endNight); return; }
      overlay = morningCard(vm, s);
    }
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
        h('div', { class: 'go' }, h('button', { class: 'btn primary', 'data-testid': 'start-night', onclick: startNight }, 'Begin the night ⏎'))));
  }

  function morningCard(vm, s) {
    const tonight = Object.values(s.answered).filter((a) => a.night === s.night).length;
    const gone = vm.threads.filter((t) => t.state === 'left' || t.state === 'silent');
    return h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true', 'data-testid': 'night-end' },
      h('div', { class: 'card' },
        h('div', { class: 'eyebrow' }, `Night ${s.night} over`),
        h('h2', null, 'Morning'),
        h('div', { class: 'date' }, vm.date),
        h('section', null, h('div', { class: 'mapbox in-card' }, renderMap(vm.map))),
        h('p', { class: 'lede' }, `${tonight} message${tonight === 1 ? '' : 's'} in, ${tonight} answer${tonight === 1 ? '' : 's'} out.`),
        gone.length > 0 && h('ul', { class: 'learned' }, gone.map((t) => h('li', { class: `tone-${t.npc}` }, `${t.handle} ${STATE_LINE[t.state]}.`))),
        h('div', { class: 'go' }, h('button', { class: 'btn primary', 'data-testid': 'end-night', onclick: endNight }, 'Next night ⏎'))));
  }

  // ------------------------------------------------------------ keys

  function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target?.tagName === 'TEXTAREA' || e.target?.tagName === 'INPUT') return;
    const s = state();
    if (e.key === 'Escape' && ui.menu) { ui.menu = false; render(); return; }
    if (document.querySelector('.settings')) return;
    if (s.phase === 'intro' && e.key === 'Enter') { e.preventDefault(); startNight(); return; }
    if (s.phase === 'nightEnd' && !ui.outcome && e.key === 'Enter') { e.preventDefault(); endNight(); return; }
    if (ui.outcome) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); proceed(); }
      return;
    }
    if (s.phase !== 'play' || ui.sending) return;
    const msg = ui.sel ? E.messageFor(s, ui.sel) : null;
    if (!msg) return;
    if (e.key === '/') { const area = chat.querySelector('textarea'); if (area) { e.preventDefault(); area.focus(); } return; }
    const i = Number(e.key) - 1;
    if (Number.isInteger(i) && msg.options[i]) { e.preventDefault(); pick(msg.options[i].id); }
  }
  document.addEventListener('keydown', onKey);

  render();
  return {
    rerender: render,
    unmount() {
      ui.timers.forEach(clearTimeout);
      ui.cancels.forEach((c) => c());
      document.removeEventListener('keydown', onKey);
      el.remove();
    },
  };
}
