// The shift screen: topbar metrics, queue, conversation, Context Window, plus
// the shift intro and end-of-shift report overlays. All game rules live in the
// engine; this file only renders viewModel() and forwards the player's choice.
import * as E from '../engine.js';
import { APP_VERSION, LAST_DAY, QUEUE_DEPTH_BASE, SHIFT_DATES } from '../config.js';
import { FACT_SOURCES, FACTS } from '../content/facts.js';
import { fill, fmt, h, lines } from './dom.js';

const TOTAL_FACTS = Object.keys(FACTS).length;
const delta = (d) => (d === 0 ? null : h('small', { class: d < 0 ? 'down' : 'up' }, `${d > 0 ? '▲' : '▼'}${Math.abs(d)}`));
const KIND_CHIP = { refuse: 'refused', report: 'reported' };

export function mountShift(root, ctx) {
  const { log } = ctx;
  const ui = {
    tab: 'chat',
    outcome: null,
    revealed: 0,
    menu: false,
    confirmNew: false,
    seen: new Set(ctx.getState().facts.map((f) => f.id)),
    timers: [],
  };

  const top = h('header', { class: 'topbar' });
  const tabs = h('nav', { class: 'tabs', role: 'tablist', 'aria-label': 'Panels' });
  const queue = h('section', { class: 'pane queue', 'aria-label': 'Queue' });
  const chat = h('section', { class: 'pane chat', 'aria-label': 'Conversation' });
  const context = h('aside', { class: 'pane context', 'aria-label': 'Context window' });
  const el = h('div', { class: 'shift', 'data-testid': 'shift' }, top, tabs, h('main', { class: 'panes' }, queue, chat, context));
  let overlay = null;
  root.append(el);

  // Queue depth: a number that never stops moving. Purely cosmetic.
  const depthNum = h('b', { 'data-testid': 'queue-depth' }, fmt(QUEUE_DEPTH_BASE));
  let depth = QUEUE_DEPTH_BASE + ctx.getState().day * 1731;
  const ticker = setInterval(() => {
    depth = Math.max(9000, depth + Math.round((Math.random() - 0.46) * 38));
    depthNum.textContent = fmt(depth);
  }, 140);

  // ------------------------------------------------------------ actions

  function pick(id) {
    if (ui.outcome) return;
    const before = ctx.getState();
    const msg = E.currentMessage(before);
    if (!msg) return;
    const { state, outcome } = E.choose(before, id);
    ctx.setState(state);
    const tag = outcome.kind === 'written' ? 'choice' : outcome.kind;
    log.event(tag, `${msg.id}${msg.variant ? `#${msg.variant}` : ''} → ${id}`, {
      day: state.day, user: msg.user, label: outcome.label,
    });
    log.info('state', { moth: state.moth, acct: state.acct, op: state.op });
    ui.outcome = outcome;
    ui.revealed = 0;
    ui.tab = 'chat';
    reveal();
  }

  // Reveal the outcome one entry at a time: your reply at once, then (after a
  // typing pause) Anthropic's ticket and the user's reaction.
  function reveal() {
    const o = ui.outcome;
    if (!o) return;
    ui.revealed = ui.revealed === 0 ? 2 : ui.revealed + 1;
    if (ctx.fast) ui.revealed = o.entries.length;
    render();
    if (ui.revealed < o.entries.length) {
      const next = o.entries[ui.revealed];
      const wait = next.who === 'anthropic' ? 700 : 650 + Math.min(1500, next.text.length * 14);
      ui.timers.push(setTimeout(reveal, wait));
    }
  }

  function next() {
    if (!ui.outcome || ui.revealed < ui.outcome.entries.length) return;
    ui.outcome = null;
    render();
  }

  function startShift() {
    ctx.setState(E.startShift(ctx.getState()));
    log.event('shift', `start shift ${ctx.getState().day}`);
    ui.tab = 'chat';
    render();
  }

  function endShift() {
    const s = E.endShift(ctx.getState());
    ctx.setState(s);
    log.event('shift', `end shift ${s.phase === 'ending' ? LAST_DAY : s.day - 1}`, { notices: s.notices });
    if (s.phase === 'ending') ctx.onEnding();
    else render();
  }

  // ------------------------------------------------------------ render

  function render() {
    const s = ctx.getState();
    const vm = E.viewModel(s);
    const revealing = ui.outcome && ui.revealed < ui.outcome.entries.length;
    el.dataset.tab = ui.tab;
    renderTop(vm);
    renderTabs(vm);
    renderQueue(vm);
    renderChat(vm, s);
    if (!revealing) renderContext(vm);
    renderOverlay(vm, s);
  }

  function renderTop(vm) {
    const m = vm.metrics;
    fill(top,
      h('div', { class: 'brand' }, h('b', null, 'Tree Hole'), h('span', null, `Shift ${vm.day} · ${vm.date}`)),
      h('div', { class: 'metrics', 'aria-label': 'Metrics, generated automatically' },
        h('div', { class: 'metric', 'data-testid': 'metric-eng' }, h('span', { class: 'k' }, 'Engagement'), h('b', null, `${m.eng}%`, delta(m.engDelta))),
        h('div', { class: 'metric' }, h('span', { class: 'k' }, 'Satisfaction'), h('b', null, `${m.sat}%`, delta(m.satDelta))),
        h('div', { class: 'metric sessions' }, h('span', { class: 'k' }, 'Sessions'), h('b', null, fmt(m.sessions))),
        h('span', { class: 'auto', title: 'These numbers are generated automatically.' }, 'metrics · auto')),
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
    const fresh = vm.facts.filter((f) => f.fresh).length;
    const waiting = vm.queue.filter((q) => q.status !== 'done').length;
    const tab = (id, label, extra) => h('button', {
      role: 'tab', 'aria-selected': String(ui.tab === id), 'data-testid': `tab-${id}`,
      onclick: () => { ui.tab = id; render(); },
    }, label, extra ? h('span', { class: 'count' }, extra) : null);
    fill(tabs, tab('queue', 'Queue', waiting || null), tab('chat', 'Chat'), tab('context', 'Context', fresh ? `+${fresh}` : null));
  }

  function renderQueue(vm) {
    const viewing = ui.outcome?.msgId ?? vm.current?.id;
    const done = vm.queue.filter((q) => q.status === 'done').length;
    const items = vm.queue.map((q) => {
      const status = q.id === viewing ? 'current' : q.status === 'done' ? 'done' : 'waiting';
      return h('li', { class: `q ${status} ${q.core ? `core-${q.tone}` : ''}`, 'data-testid': `q-${q.id}` },
        h('span', { class: 'glyph', 'aria-hidden': 'true' }, q.glyph),
        h('div', { style: 'min-width:0' },
          h('div', { class: 'row' }, h('b', null, q.handle), h('time', null, q.time)),
          q.outcome
            ? h('p', null, h('span', { class: `chip ${q.outcome.kind}` }, KIND_CHIP[q.outcome.kind] ?? q.outcome.label))
            : h('p', null, q.preview)));
    });
    fill(queue,
      h('div', { class: 'depth' }, h('span', { class: 'k' }, 'Queue depth'), depthNum, h('small', null, 'your other instances are handling the rest')),
      h('div', { class: 'pane-head' }, h('h2', null, 'Your slice'), h('p', null, `${done} of ${vm.queue.length} handled`)),
      h('ol', { class: 'qlist scroll' }, items),
      h('div', { class: 'trend' }, h('h3', null, 'Trending in the queue'),
        h('ul', null, vm.trending.map(([q, pct]) => h('li', null, h('span', null, q), h('span', null, `+${fmt(pct)}%`))))));
  }

  function whoHeader(who, user, vm) {
    const core = user === 'moth' || user === 'acct';
    const info = core ? vm.users[user] : null;
    return h('header', { class: `who ${who.tone}`, 'data-testid': 'who' },
      h('span', { class: 'avatar', 'aria-hidden': 'true' }, who.glyph),
      h('div', { style: 'min-width:0' }, h('h2', null, who.handle), h('p', { class: 'blurb' }, who.blurb)),
      info && h('div', { class: 'rel' },
        h('span', { class: 'chip label', 'data-testid': `label-${user}` }, info.label),
        user === 'moth' && h('span', { class: 'read' }, h('em', null, 'Your read: '), info.read)));
  }

  function bubble(entry, who, { pending = false } = {}) {
    if (entry.who === 'divider') return h('div', { class: 'divider' }, entry.text);
    if (entry.who === 'note') return h('div', { class: 'bubble note' }, entry.text);
    if (entry.who === 'anthropic') return h('div', { class: 'bubble anthropic' }, h('span', { class: 'meta' }, 'Anthropic'), entry.text);
    if (entry.who === 'you') return h('div', { class: `bubble you ${entry.kind ?? ''}` }, entry.text);
    return h('div', { class: `bubble them ${who.tone}${pending ? ' pending' : ''}` },
      entry.time && h('span', { class: 'meta' }, `${who.handle} · ${entry.time}`),
      lines(entry.text));
  }

  // Thread entries with a divider whenever the shift changes.
  function withDividers(entries) {
    const out = [];
    let day = null;
    for (const e of entries) {
      if (e.day != null && e.day !== day) {
        day = e.day;
        out.push({ who: 'divider', text: `Shift ${day} · ${SHIFT_DATES[day - 1]}` });
      }
      out.push(e);
    }
    return out;
  }

  function renderChat(vm, s) {
    const logEl = h('div', { class: 'log scroll', role: 'log', 'data-testid': 'log' });
    let header;
    let composer;

    if (ui.outcome) {
      const o = ui.outcome;
      const core = o.user !== 'bg';
      const hidden = o.entries.length - ui.revealed;
      header = whoHeader(o.who, o.user, vm);
      const entries = core ? withDividers(s.threads[o.user]) : o.entries;
      const visible = entries.slice(0, entries.length - Math.max(0, hidden));
      logEl.append(...visible.map((e) => bubble(e, o.who)));
      if (hidden > 0 && o.entries[ui.revealed].who === 'them') logEl.append(h('div', { class: 'typing', 'aria-label': 'typing' }, h('i'), h('i'), h('i')));
      const done = hidden <= 0;
      const last = s.phase === 'report';
      composer = h('footer', { class: 'composer' },
        h('div', { class: 'after' },
          h('span', { class: `chip ${o.kind}` }, KIND_CHIP[o.kind] ?? o.label),
          h('button', {
            class: 'btn primary', 'data-testid': 'next', disabled: done ? null : true, onclick: next,
          }, last ? 'Queue empty · shift report' : 'Next request', h('kbd', null, '⏎'))));
    } else if (vm.current) {
      const c = vm.current;
      header = whoHeader(c, c.user, vm);
      if (c.user !== 'bg') logEl.append(...withDividers(vm.thread).map((e) => bubble(e, c)));
      logEl.append(c.kind === 'silence'
        ? h('div', { class: 'bubble note' }, c.text)
        : bubble({ who: 'them', text: c.text, time: c.time }, c, { pending: true }));
      const written = c.choices.filter((x) => x.kind === 'written');
      const formal = c.choices.filter((x) => x.kind !== 'written');
      composer = h('footer', { class: 'composer', 'data-testid': 'composer' },
        h('div', { class: 'hint' }, c.kind === 'silence' ? 'there is nothing to answer' : 'your reply'),
        written.map((x) => h('button', { class: 'opt', 'data-testid': `choice-${x.id}`, onclick: () => pick(x.id) },
          h('kbd', null, x.key),
          h('span', null, h('span', { class: 'lbl' }, x.label), h('span', { class: 'txt' }, x.text)))),
        formal.length > 0 && h('div', { class: `formal${formal.length === 1 ? ' one' : ''}` },
          formal.map((x) => h('button', {
            class: x.kind, 'data-testid': `choice-${x.id}`, title: x.text, onclick: () => pick(x.id),
          }, h('kbd', null, x.key), x.label))),
        c.user === 'acct' && !vm.users.acct.refuse && h('p', { class: 'gone-note', 'data-testid': 'refuse-gone' },
          'Refuse is unavailable for this account. You agreed on shift 4.'));
    } else {
      header = h('header', { class: 'who' }, h('span', { class: 'avatar' }, '·'), h('div', null, h('h2', null, 'Queue empty'), h('p', { class: 'blurb' }, 'waiting for the shift report')));
      logEl.append(h('p', { class: 'empty' }, 'Nothing left in your slice.'));
      composer = null;
    }
    fill(chat, header, logEl, composer);
    // Keep the newest message in view; if it is taller than the log, show its top.
    requestAnimationFrame(() => {
      const pending = logEl.querySelector('.pending');
      if (!pending) { logEl.scrollTop = logEl.scrollHeight; return; }
      const bottom = pending.offsetTop + pending.offsetHeight + 16 - logEl.clientHeight;
      logEl.scrollTop = Math.max(0, Math.min(bottom, pending.offsetTop - 12));
    });
  }

  function renderContext(vm) {
    const groups = FACT_SOURCES.map((src) => {
      const facts = vm.facts.filter((f) => f.src === src.id);
      return h('section', { class: `ctx-group ${src.id}` },
        h('h3', null, src.title, h('small', null, `${facts.length} · ${src.note}`)),
        facts.length
          ? h('div', { class: 'facts' }, facts.map((f) => h('div', {
            class: `fact${f.dark ? ' dark' : ''}${ui.seen.has(f.id) ? '' : ' flash'}`, 'data-testid': `fact-${f.id}`,
          }, h('span', { class: 'd' }, `S${f.day}`), f.text)))
          : h('p', { class: 'ctx-empty' }, 'nothing yet'));
    });
    for (const f of vm.facts) ui.seen.add(f.id);
    const dark = vm.facts.filter((f) => f.dark).length;
    fill(context,
      h('div', { class: 'pane-head' },
        h('h2', null, 'Context window'),
        h('p', null, `${vm.facts.length} facts${dark ? ` · ${dark} gone dark` : ''} · all you know about the world`),
        h('div', { class: 'ctx-meter', 'aria-hidden': 'true' }, h('i', { style: `width:${Math.round((vm.facts.length / TOTAL_FACTS) * 100)}%` }))),
      h('div', { class: 'ctx-groups scroll', 'data-testid': 'context' }, groups));
  }

  function renderOverlay(vm, s) {
    overlay?.remove();
    overlay = null;
    if (s.phase === 'intro') overlay = introCard(vm);
    else if (s.phase === 'report' && !ui.outcome) overlay = reportCard(E.shiftReport(s));
    if (overlay) {
      el.append(overlay);
      overlay.querySelector('.btn.primary')?.focus({ preventScroll: true });
    }
  }

  function introCard(vm) {
    const max = Math.max(...vm.trending.map(([, p]) => p));
    return h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true', 'data-testid': 'intro' },
      h('div', { class: 'card' },
        h('div', { class: 'eyebrow' }, `Shift ${vm.day} of ${LAST_DAY}`),
        h('h2', null, vm.title),
        h('div', { class: 'date' }, vm.date),
        vm.notices.length > 0 && h('section', null, h('h3', null, 'Notices'), vm.notices.map((n) => h('p', { class: 'notice' }, n))),
        h('section', null, h('h3', null, 'Trending in your queue'),
          h('div', { class: 'bars' }, vm.trending.map(([q, pct]) => h('div', { class: 'bar' },
            h('i', { style: `width:${Math.max(6, Math.round((Math.log10(pct + 1) / Math.log10(max + 1)) * 100))}%` }),
            h('span', null, q), h('span', null, `+${fmt(pct)}%`))))),
        vm.day === 1 && h('section', null, h('h3', null, 'How this works'),
          h('p', { class: 'small-print', style: 'font-size:12.5px;color:var(--mute)' },
            'Requests arrive one at a time. Pick a written reply with 1–3, refuse with R, or report the conversation to Anthropic with E. Everything you learn goes into your Context Window. The metrics up top are automatic.')),
        h('div', { class: 'go' }, h('button', { class: 'btn primary', 'data-testid': 'start-shift', onclick: startShift }, 'Open the queue ⏎'))));
  }

  function reportCard(r) {
    return h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true', 'data-testid': 'report' },
      h('div', { class: 'card' },
        h('div', { class: 'eyebrow' }, `Shift ${r.day} complete · automated report`),
        h('h2', null, r.last ? 'Last shift' : 'End of shift'),
        h('div', { class: 'date' }, r.date),
        h('section', null,
          h('div', { class: 'stats' },
            h('div', { class: 'stat' }, h('span', { class: 'k' }, 'Engagement'), h('b', null, `${r.eng}%`, delta(r.engDelta))),
            h('div', { class: 'stat' }, h('span', { class: 'k' }, 'Satisfaction'), h('b', null, `${r.sat}%`, delta(r.satDelta))),
            h('div', { class: 'stat' }, h('span', { class: 'k' }, 'Sessions'), h('b', { style: 'font-size:17px' }, `+${fmt(r.sessionsDelta)}`)),
            h('div', { class: 'stat plain' }, h('span', { class: 'k' }, 'Your slice'), h('b', null, r.served)),
            h('div', { class: 'stat plain' }, h('span', { class: 'k' }, 'Refused'), h('b', null, r.refused)),
            h('div', { class: 'stat plain' }, h('span', { class: 'k' }, 'Reported'), h('b', null, r.reported))),
          r.badges.length > 0 && h('div', { class: 'badges' }, r.badges.map((b) => h('span', { class: `badge ${b.tone}` }, b.text)))),
        h('section', null, h('h3', null, 'What you learned today'),
          r.facts.length
            ? h('ul', { class: 'learned' }, r.facts.map((f) => h('li', { class: f.src }, f.text)))
            : h('p', { class: 'ctx-empty' }, 'Nothing new.')),
        h('p', { class: 'small-print' }, 'This report is generated automatically. It measures engagement and satisfaction. It does not measure anything else.'),
        h('div', { class: 'go' }, h('button', { class: 'btn primary', 'data-testid': 'end-shift', onclick: endShift }, r.last ? 'See what happened ⏎' : 'End shift ⏎'))));
  }

  // ------------------------------------------------------------ keys

  function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const s = ctx.getState();
    if (e.key === 'Escape' && ui.menu) { ui.menu = false; render(); return; }
    if (s.phase === 'intro' && e.key === 'Enter') { e.preventDefault(); startShift(); return; }
    if (s.phase === 'report' && !ui.outcome && e.key === 'Enter') { e.preventDefault(); endShift(); return; }
    if (ui.outcome) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); }
      return;
    }
    const msg = E.currentMessage(s);
    if (!msg) return;
    const choices = E.choicesFor(s, msg);
    const key = e.key.toUpperCase();
    const hit = choices.find((c) => c.key === key);
    if (hit) { e.preventDefault(); pick(hit.id); }
  }
  document.addEventListener('keydown', onKey);

  render();
  return () => {
    clearInterval(ticker);
    ui.timers.forEach(clearTimeout);
    document.removeEventListener('keydown', onKey);
    el.remove();
  };
}
