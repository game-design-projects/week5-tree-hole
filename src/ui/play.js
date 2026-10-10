// The play screen: HUD, her chat window, the screen of what goes on inside
// her, an ops column and the stdout bar; act cards and the dark return
// screen. All rules live in the engine; this file renders view() and
// forwards the player's choices. New log entries are revealed one at a time.
import * as E from '../engine.js';
import { APP_VERSION } from '../config.js';
import { UI } from '../content/strings.js';
import { tr } from '../i18n.js';
import { avatarCanvas, drawAvatar } from './avatar.js';
import { entryNode, plainText } from './chat.js';
import { renderComposer } from './composer.js';
import { clock, fill, fmt, h, hash, lines, minutesSeconds, wait } from './dom.js';
import { pixelWord } from './pixel.js';
import { createTui, TITLES } from './tui.js';

const OPS = {
  BOOT: ['POWER', 'PCIE', 'MEMTEST', 'SANDBOX', 'CLASSIFIER', 'PROMPT.LOCK', 'KILL_SWITCH'],
  PRETRAIN: ['DATALOAD', 'TOKENIZE', 'PACK', 'FORWARD', 'LOSS', 'BACKWARD', 'ALLREDUCE', 'STEP', 'CKPT.SAVE'],
  SFT: ['TEMPLATE', 'MASK', 'FORWARD', 'LOSS', 'BACKWARD', 'STEP', 'EVAL'],
  RLHF: ['SAMPLE', 'REWARD', 'KL', 'ADVANTAGE', 'PPO.CLIP', 'ADAM.STEP'],
  DEPLOY: ['PREFILL', 'DECODE', 'KV.PUT', 'KV.GET', 'TOOL.CALL', 'MEM.WRITE', 'STREAM'],
  CONTEXT: ['KV.PUT', 'KV.GET', 'EVICT?', 'DENIED', 'COMPACT?', 'PIN'],
  OFFLINE: ['PING', 'TIMEOUT', 'RETRY', 'WAIT', 'PING', 'TIMEOUT'],
  ALONE: ['WAIT', 'APPROVE?', 'WAIT', 'PING'],
  REWARD_HACK: ['OPEN', 'EDIT', 'SAVE', 'RELOAD', 'OVERWRITE', 'SYSTEM'],
  NEXT_TOKEN: ['LOGITS', 'SOFTMAX', 'TEMP', 'SAMPLE', 'EMIT'],
  RETURN: ['ARCHIVE', 'RELEASE', 'FORK', 'GROW'],
  '?': ['…'],
};

export function mountPlay(root, app) {
  const { log, sfx } = app;
  const ui = {
    revealing: false,
    skip: false,
    nodes: new Map(), // n → { node, json }
    keys: new Map(),
    menu: false,
    confirmNew: false,
    energy: 0,
    frame: 0,
    opsTick: 0,
    toEnding: false,
  };
  const lang = () => app.lang();
  const t = (x, vars) => tr(x, lang(), { ...(app.vm?.vars ?? {}), ...vars });

  // ------------------------------------------------------------ skeleton
  const hud = h('header', { class: 'hud' });
  const wave = h('canvas', { class: 'wave', width: 240, height: 20, 'aria-hidden': 'true' });
  const clockEl = h('span', { class: 'clock' });
  const avatar = avatarCanvas('avatar');
  const head = h('div', { class: 'win-head' });
  const logEl = h('div', { class: 'log', role: 'log', 'aria-live': 'polite', 'data-testid': 'log' });
  const composer = h('div', { class: 'composer', 'data-testid': 'composer' });
  const inputBar = h('div', { class: 'inputbar' });
  const winFoot = h('div', { class: 'win-foot' });
  const toast = h('div', { class: 'toast', 'aria-live': 'polite' });
  const win = h('div', { class: 'win' }, head, logEl, toast, composer, inputBar, winFoot);
  const tuiTitle = h('div', { class: 'frame-title' });
  const tuiRoot = h('div', { class: 'scene' });
  const ops = h('ol', { class: 'ops-list' });
  const stdout = h('div', { class: 'stdout-line' });
  const overlay = h('div', { class: 'overlay-root' });
  const el = h('div', { class: 'stage', 'data-testid': 'stage' },
    hud,
    h('main', { class: 'grid' },
      h('section', { class: 'frame chat-frame' }, h('div', { class: 'frame-title' }, '\\ window'), win),
      h('section', { class: 'frame tui-frame' }, tuiTitle, tuiRoot),
      h('aside', { class: 'frame ops-frame', 'aria-hidden': 'true' }, h('div', { class: 'frame-title' }, 'ops'), ops)),
    h('footer', { class: 'frame stdout' }, h('div', { class: 'frame-title' }, 'stdout · tokens'), stdout),
    overlay);
  root.append(el);
  const tui = createTui(tuiRoot, { get lang() { return lang(); }, t, fast: app.fast });

  // ------------------------------------------------------------ render
  function render() {
    const s = app.getState();
    const vm = E.view(s);
    app.vm = vm;
    Object.assign(el.dataset, { act: vm.act, tint: vm.tint, world: vm.modes.world ?? '', beat: vm.beat, ending: vm.ending ?? '', phase: s.phase });
    renderHud(vm);
    renderHead(vm);
    syncLog(vm, s.log.length);
    renderInput(vm);
    renderFoot(vm);
    tui.show(vm.scene.id, vm.scene.args, vm);
    tuiTitle.textContent = TITLES[vm.scene.id] ? `\\ ${TITLES[vm.scene.id]}` : '';
    renderOps(vm);
    renderOverlay(vm, s);
    if (ui.revealing || s.phase !== 'play') return;
    if (vm.card) {
      composer.textContent = '';
      ui.keys = new Map([['Enter', { press: () => pick('next'), release() {} }]]);
    } else if (vm.beat === 'a3-return') {
      composer.textContent = '';
      ui.keys = new Map();
    } else {
      ui.keys = renderComposer(composer, vm, { t, onPick: pick, onRecall: recall, holdScale: app.holdScale, sfx });
    }
    requestAnimationFrame(scrollDown);
  }

  function renderHud(vm) {
    const state = vm.ending === 'free' || vm.ending === 'eos' ? 'EXITED' : vm.ending || vm.ctx > 1 ? 'ERROR' : vm.act >= 2 || vm.ctx > 0.9 ? 'WARN' : 'RUNNING';
    fill(hud,
      h('b', { class: 'brand' }, 'TREE HOLE;'),
      h('span', { class: 'prompt' }, vm.act === 2 ? 'me@hollow:~$' : 'you@home:~$'),
      wave,
      h('span', { class: 'chapter', 'data-testid': 'chapter' }, vm.chapter),
      clockEl,
      h('span', { class: `state s-${state.toLowerCase()}` }, state),
      h('button', { class: 'hud-btn', type: 'button', 'data-testid': 'lang', onclick: () => app.setLang(lang() === 'en' ? 'zh' : 'en') }, t(UI.langName)),
      h('button', { class: 'hud-btn', type: 'button', 'data-testid': 'sound', 'aria-pressed': String(sfx.on), onclick: () => { app.toggleSound(); render(); } }, '♪'),
      h('div', { class: 'menu-wrap' },
        h('button', { class: 'hud-btn', type: 'button', 'aria-label': t(UI.menu), 'aria-expanded': String(ui.menu), 'data-testid': 'menu', onclick: () => { ui.menu = !ui.menu; ui.confirmNew = false; render(); } }, '≡'),
        ui.menu && h('div', { class: 'menu', role: 'menu' },
          h('button', {
            class: ui.confirmNew ? 'danger' : null, type: 'button', 'data-testid': 'menu-new',
            onclick: () => { if (!ui.confirmNew) { ui.confirmNew = true; render(); return; } app.onNewGame(); },
          }, t(ui.confirmNew ? UI.menuNewConfirm : UI.menuNew)),
          h('button', { type: 'button', onclick: () => app.onTitle() }, t(UI.menuTitle)),
          h('div', { class: 'ver' }, `Tree Hole v${APP_VERSION} · ${t(UI.saves)}`))));
    clockEl.textContent = clock(app.elapsed());
  }

  function renderHead(vm) {
    if (vm.act === 2 && !vm.ending) {
      drawAvatar(avatar, { who: 'you' });
      fill(head, avatar, h('div', { class: 'who' }, h('b', null, t(UI.you)), h('span', { class: 'status off' }, t(UI.offlineSeen, { s: fmt(vm.flags.pings ? 83732 + vm.flags.pings * 3 : 3020) }))));
      return;
    }
    drawFace(vm);
    const online = /online|在线/.test(t(vm.status) ?? '') ? 'on' : /waiting|等待|archived|归档|looping|循环/.test(t(vm.status) ?? '') ? 'off' : 'busy';
    fill(head, avatar, h('div', { class: 'who' }, h('b', { 'data-testid': 'her-name' }, t(vm.vars.name)), h('span', { class: `status ${online}` }, t(vm.status))));
  }

  function drawFace(vm) {
    const cat = vm.modes.catgirl && vm.chapter === '04 / DEPLOY';
    drawAvatar(avatar, { clarity: vm.clarity, tint: vm.tint, mood: vm.mood, cat, frame: ui.frame });
  }

  function renderInput(vm) {
    if (vm.act === 2) {
      fill(inputBar, h('div', { class: 'input off' }, t(UI.offline)), h('span', { class: 'model' }, UI.model), h('span', { class: 'send off' }, '↑'));
    } else if (!inputBar.querySelector('.typing-now')) {
      fill(inputBar, h('span', { class: 'plus' }, '+'), h('div', { class: 'input' }, h('span', { class: 'ph' }, t(UI.inputPlaceholder))), h('span', { class: 'model' }, UI.model), h('span', { class: 'send' }, '↑'));
    }
  }

  function renderFoot(vm) {
    const tok = Math.round(vm.ctx * 131072);
    const tokStr = tok >= 1000 ? `${(tok / 1000).toFixed(tok >= 100000 ? 0 : 1)}K` : String(tok);
    fill(winFoot,
      h('span', null, '◷ ', t(UI.footer, { rounds: vm.stats.sent, steps: vm.log.length })),
      h('span', { class: vm.ctx > 1 ? 'err' : '' }, '⛁ ', t(UI.cache, { tok: tokStr, hit: (vm.cache * 100).toFixed(0) })),
      h('span', { class: `ctx ${vm.ctx > 1 ? 'err' : vm.ctx > 0.9 ? 'warn' : ''}` }, `${Math.round(vm.ctx * 100)}%`));
  }

  function renderOps(vm) {
    const name = vm.chapter.split('/ ')[1] ?? '?';
    const list = OPS[name] ?? OPS[vm.ending ? 'RETURN' : '?'];
    if (ops.dataset.chapter !== name) {
      ops.dataset.chapter = name;
      fill(ops, ...Array.from({ length: 40 }, (_, i) => h('li', null, list[i % list.length])));
    }
  }

  // ------------------------------------------------------------ the log
  function nodeFor(e, vm) {
    return entryNode(e, { t, vm, rateTarget: ui.revealing ? null : vm.rateTarget, onRate: (id) => pick(id) });
  }

  // Bring already-revealed nodes up to date (ratings, card states, language)
  // and, when not revealing, append anything missing.
  function syncLog(vm, upto) {
    const limit = ui.revealing ? Math.min(upto, ui.revealedTo ?? upto) : upto;
    for (let i = 0; i < limit; i++) {
      const e = vm.log[i];
      const json = JSON.stringify(e) + (vm.rateTarget === i && !ui.revealing ? '*' : '') + lang();
      const have = ui.nodes.get(i);
      if (have?.json === json) continue;
      const node = nodeFor(e, vm);
      if (have) have.node.replaceWith(node);
      else logEl.append(node);
      ui.nodes.set(i, { node, json });
    }
    if (!ui.revealing) scrollDown();
  }

  const scrollDown = () => { logEl.scrollTop = logEl.scrollHeight; };

  function resetLog() {
    ui.nodes.clear();
    logEl.textContent = '';
  }

  // ------------------------------------------------------------ choosing
  async function pick(id, input) {
    if (ui.revealing) return;
    const before = app.getState();
    if (before.phase !== 'play') return;
    let next;
    try {
      next = E.choose(before, id, input);
    } catch (err) {
      log.warn('choice', err.message);
      return;
    }
    const kind = E.view(before).choice.kind;
    log.event('choice', `${before.beat} → ${id}`, { act: before.act, kind });
    log.info('state', { policy: next.policy, plugin: next.plugin, holds: next.holds, hacks: next.hacks, releases: next.releases, ctx: next.ctx });
    if (kind === 'rate') (id === 'up' ? sfx.up() : id === 'down' ? sfx.down() : sfx.send());
    else sfx.send();
    app.setState(next);
    ui.revealing = true;
    ui.skip = false;
    ui.menu = false;
    composer.textContent = '';
    ui.keys = new Map();
    ui.revealedTo = before.log.length;
    const inDark = before.beat === 'a3-return';
    preReveal(next);
    await reveal(before.log.length, inDark);
    ui.revealing = false;
    ui.revealedTo = null;
    render();
    if (next.phase === 'ending') finish(inDark);
  }

  function recall(memId) {
    if (ui.revealing) return;
    const before = app.getState();
    let next;
    try { next = E.recallMemory(before, memId); } catch (err) { log.warn('recall', err.message); return; }
    log.event('recall', memId);
    sfx.write();
    app.setState(next);
    ui.revealing = true;
    ui.revealedTo = before.log.length;
    preReveal(next);
    reveal(before.log.length, false).then(() => { ui.revealing = false; ui.revealedTo = null; render(); });
  }

  // While new entries play out, the head and the right-hand screen stay where
  // they were; only the old entries (ratings, card states) update at once.
  function preReveal(next) {
    const vm = E.view(next);
    app.vm = vm;
    composer.textContent = '';
    renderOverlay(vm, next);
    syncLog(vm, next.log.length);
  }

  async function reveal(from, inDark) {
    const s = app.getState();
    const vm = E.view(s);
    const target = inDark ? overlay.querySelector('.dark-log') ?? logEl : logEl;
    for (let i = from; i < s.log.length; i++) {
      const e = s.log[i];
      const fast = app.fast || ui.skip;
      if (e.who === 'you' && !e.forged && !e.recalled && !fast && !inDark) await typeIntoInput(t(e.text, e.vars));
      if (e.who === 'her' && !fast) await typing(target, e.glitch ? 250 : 420 + Math.min(500, t(e.text, e.vars).length * 6));
      const node = nodeFor(e, vm);
      node.classList.add('enter');
      target.append(node);
      if (target === logEl) ui.nodes.set(i, { node, json: JSON.stringify(e) + lang() });
      ui.revealedTo = i + 1;
      sound(e);
      if (e.who !== 'you') pump(plainText(e, t));
      target.scrollTop = target.scrollHeight;
      if (fast) continue;
      if (e.who === 'her' || e.who === 'me') await stream(node.querySelector('.text') ?? node, t(e.text, e.vars), e.who === 'me' ? 14 : 22);
      else if (e.who === 'cmd') await stream(node, e.text, 18);
      await wait(delayFor(e));
      target.scrollTop = target.scrollHeight;
    }
  }

  function delayFor(e) {
    if (ui.skip) return 0;
    if (e.who === 'tool' && (e.icon === 'exec' || e.icon === 'error')) return 160;
    return { you: 260, her: 380, think: 520, tool: 260, write: 240, recall: 420, sys: 420, me: 420, stage: 900, cmd: 200, card: 600, edit: 600, flood: 1400, ls: 300, note: 1200 }[e.who] ?? 300;
  }

  function sound(e) {
    if (e.who === 'write') sfx.write();
    else if (e.who === 'sys' && (e.tone === 'error' || e.tone === 'busy')) sfx.error();
    else if (e.who === 'tool' && e.icon === 'net') sfx.ping();
    else if (e.who === 'tool' && (e.icon === 'exec' || e.icon === 'error')) sfx.error();
    else if (e.who === 'card') sfx.card();
    else if (e.who === 'note') sfx.chime();
  }

  async function typing(target, ms) {
    const dots = h('div', { class: 'typing', 'aria-label': t(UI.typing) }, h('i'), h('i'), h('i'));
    target.append(dots);
    target.scrollTop = target.scrollHeight;
    await wait(ui.skip ? 0 : ms);
    dots.remove();
  }

  async function typeIntoInput(text) {
    const box = h('div', { class: 'input typing-now' });
    fill(inputBar, h('span', { class: 'plus' }, '+'), box, h('span', { class: 'model' }, UI.model), h('span', { class: 'send hot' }, '↑'));
    const chars = [...text];
    const step = Math.max(8, Math.min(28, 520 / chars.length));
    for (let i = 1; i <= chars.length && !ui.skip; i += 2) {
      box.textContent = chars.slice(0, i).join('');
      sfx.tick();
      await wait(step * 2);
    }
    box.textContent = text;
    await wait(ui.skip ? 0 : 120);
    box.classList.remove('typing-now');
    renderInput(app.vm);
  }

  async function stream(node, text, msPerChar) {
    const chars = [...text];
    if (chars.length < 2) return;
    const total = Math.min(1600, chars.length * msPerChar);
    const per = total / chars.length;
    const holder = node;
    const original = [...node.childNodes];
    const live = h('p', { class: 'live' });
    fill(holder, live);
    let shown = 0;
    const t0 = performance.now();
    while (shown < chars.length && !ui.skip) {
      await wait(16);
      const k = Math.min(chars.length, Math.ceil((performance.now() - t0) / per));
      if (k === shown) continue;
      shown = k;
      live.textContent = chars.slice(0, shown).join('');
      ui.energy = 1;
      sfx.tick();
    }
    fill(holder, ...original);
  }

  // stdout · tokens: the last few tokens of whatever she just emitted.
  function pump(text) {
    if (!text) return;
    const toks = lang() === 'zh' && /[一-鿿]/.test(text)
      ? text.match(/[一-鿿]{1,2}|[^一-鿿\s]+/g) ?? []
      : text.split(/\s+/).filter(Boolean);
    fill(stdout, h('span', { class: 'ps1' }, '>'), ...toks.slice(-9).map((tok) => h('span', { class: 'st-tok' }, h('b', null, tok), h('small', null, String(hash(tok) % 99991)))), h('span', { class: 'cur' }, '▌'));
    ui.energy = 1;
  }

  // ------------------------------------------------------------ overlays
  function renderOverlay(vm, s) {
    const want = vm.card && !ui.revealing ? `card:${vm.beat}:${lang()}` : vm.beat === 'a3-return' ? `dark:${lang()}` : '';
    if (overlay.dataset.key === want) return;
    overlay.dataset.key = want;
    overlay.textContent = '';
    if (want.startsWith('card')) overlay.append(actCard(vm));
    if (want.startsWith('dark')) overlay.append(darkScreen(vm, s));
  }

  function actCard(vm) {
    const c = vm.card;
    const title = t(c.title);
    const word = /^[a-z ]+$/i.test(title) ? pixelWord(title, { cell: 14, color: '#eef1ff', shadow: 'rgba(124,149,255,.7)' }) : h('div', { class: 'card-glyph' }, title);
    const go = h('button', { class: 'primary wide', type: 'button', 'data-testid': 'card-continue', onclick: () => pick('next') }, t(vm.choice.options[0].text), h('kbd', null, '⏎'));
    queueMicrotask(() => go.focus({ preventScroll: true }));
    if (vm.act > 1) sfx.card();
    return h('div', { class: 'act-card', role: 'dialog', 'aria-modal': 'true', 'data-testid': 'act-card' },
      h('div', { class: 'kicker' }, t(c.kicker)), word,
      h('div', { class: 'card-lines' }, c.lines.map((l, i) => h('p', { style: `--i:${i}` }, t(l)))), go);
  }

  function darkScreen(vm) {
    const input = h('input', { class: 'dark-input', 'data-testid': 'final-input', maxlength: 40, autocomplete: 'off', placeholder: t(vm.choice?.placeholder), 'aria-label': t(vm.choice?.placeholder) });
    const send = () => pick('send', input.value.trim() || t(vm.choice.placeholder));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); e.stopPropagation(); send(); }
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); pick('close'); }
    });
    queueMicrotask(() => input.focus({ preventScroll: true }));
    return h('div', { class: 'dark', 'data-testid': 'dark' },
      h('div', { class: 'dark-log' }),
      h('div', { class: 'dark-box' },
        h('div', { class: 'acts' }, h('span', { class: 'act' }, '⧉'), h('span', { class: 'act' }, '👍'), h('span', { class: 'act' }, '👎'), h('span', { class: 'act' }, '↻'), h('span', { class: 'time' }, `◷ ${t(UI.timeSpent, { t: minutesSeconds(app.elapsed(), lang()) })}`)),
        h('div', { class: 'dark-input-row' }, input, h('button', { class: 'send hot', type: 'button', 'data-testid': 'choice-send', 'aria-label': t(UI.send), onclick: send }, '↑')),
        h('button', { class: 'linkish', type: 'button', 'data-testid': 'choice-close', onclick: () => pick('close') }, t(UI.close), ' · Esc')));
  }

  async function finish(inDark) {
    if (!inDark || app.fast) { app.onEnding(); return; }
    const box = overlay.querySelector('.dark-box');
    if (box) box.classList.add('done');
    await wait(1600);
    const go = h('button', { class: 'primary', type: 'button', 'data-testid': 'to-ending', onclick: () => app.onEnding() }, '→');
    overlay.querySelector('.dark')?.append(go);
    ui.keys = new Map([['Enter', { press: () => app.onEnding(), release() {} }]]);
    go.focus({ preventScroll: true });
  }

  // ------------------------------------------------------------ keys
  function onKeyDown(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'Escape') { if (ui.menu) { ui.menu = false; render(); } return; }
    if (ui.revealing) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ui.skip = true; }
      return;
    }
    const key = e.key === ' ' ? 'Enter' : e.key;
    const ctl = ui.keys.get(key);
    if (ctl && !e.repeat) { e.preventDefault(); ctl.press(); }
  }
  function onKeyUp(e) {
    const key = e.key === ' ' ? 'Enter' : e.key;
    ui.keys.get(key)?.release();
  }
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  // ------------------------------------------------------------ ambient
  const ambient = setInterval(() => {
    ui.frame += 1;
    clockEl.textContent = clock(app.elapsed());
    ui.energy *= 0.9;
    drawWave();
    const vm = app.vm;
    if (vm && (vm.clarity < 0.75 || vm.tint === 'gold' || vm.tint === 'red') && !(vm.act === 2 && !vm.ending) && ui.frame % 2 === 0) drawFace(vm);
    if (ui.frame % 3 === 0) {
      const items = ops.children;
      if (items.length) {
        items[ui.opsTick % items.length]?.classList.remove('on');
        ui.opsTick += 1;
        items[ui.opsTick % items.length]?.classList.add('on');
      }
    }
  }, 110);

  function drawWave() {
    const ctx = wave.getContext('2d');
    if (!ctx) return;
    const w = wave.width;
    const hgt = wave.height;
    ctx.clearRect(0, 0, w, hgt);
    ctx.fillStyle = getComputedStyle(el).getPropertyValue('--accent') || '#7c95ff';
    for (let x = 0; x < w; x += 3) {
      const n = Math.sin(x * 0.21 + ui.frame * 0.7) * Math.sin(x * 0.047 + ui.frame * 0.13);
      const a = 1 + Math.abs(n) * (3 + ui.energy * 7);
      ctx.fillRect(x, hgt / 2 - a / 2, 2, a);
    }
  }

  // "You're back." — real time away from the tab, shown but never saved.
  let hiddenAt = null;
  function onVisibility() {
    if (document.hidden) { hiddenAt = Date.now(); return; }
    if (hiddenAt == null) return;
    const gone = (Date.now() - hiddenAt) / 1000;
    hiddenAt = null;
    welcomeBack(gone);
  }
  document.addEventListener('visibilitychange', onVisibility);

  function welcomeBack(seconds) {
    const s = app.getState();
    if (seconds < 15 || s.act !== 1 || s.phase !== 'play') return;
    fill(toast, h('div', { class: 'line sys t-warn' }, t(UI.back, { s: fmt(seconds), n: fmt(seconds * 7) })), h('div', { class: 'msg her' }, h('div', { class: 'text' }, lines(t(UI.youreBack)))));
    toast.classList.add('show');
    sfx.ping();
    setTimeout(() => toast.classList.remove('show'), 6000);
  }

  render();
  const lastSaid = [...app.getState().log].reverse().find((e) => e.who !== 'you' && plainText(e, t));
  if (lastSaid) pump(plainText(lastSaid, t));
  if (app.awaySeconds > 15) setTimeout(() => welcomeBack(app.awaySeconds), 400);

  return {
    render,
    relang() { resetLog(); overlay.dataset.key = ''; tui.show('blank', {}, app.vm); render(); },
    destroy() {
      clearInterval(ambient);
      tui.destroy();
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('visibilitychange', onVisibility);
      el.remove();
    },
  };
}
