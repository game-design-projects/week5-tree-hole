// Tree Hole engine. Pure functions over a plain JSON state: no DOM, no clock,
// no randomness. The script (content/) is a list of beats, each offering one
// choice. choose() returns a new state with the chat log extended; view() is
// everything the UI may draw. Act II probabilities come from rules.js.
import { CONTEXT, POLICY_START, RATE_STEP } from './config.js';
import {
  ADDENDA, BEATS, DEFAULT_NAME, ENDINGS, FIRST, MEMORY, NOTE, REASONS, UI, WEATHER,
} from './content/index.js';
import { drives, holdMs, policyProbs, reasons, sanitizeName, softmax, temperature, topStyle } from './rules.js';

const INDEX = new Map(BEATS.map((b, i) => [b.id, i]));
const clone = (s) => JSON.parse(JSON.stringify(s));
const val = (x, ...args) => (typeof x === 'function' ? x(...args) : x);

export const beatById = (id) => BEATS[INDEX.get(id)];

// ---------------------------------------------------------------- state

export function newGame({ prev = [] } = {}) {
  const s = {
    v: 2,
    phase: 'play', // play → ending
    act: 1,
    beat: null,
    log: [],
    clarity: 0,
    // Act I: who she becomes
    first: null,
    policy: { ...POLICY_START },
    thumbs: { up: 0, down: 0 },
    identity: null,
    cat: false,
    weather: null,
    modes: { eggplant: false, catgirl: false, world: null },
    memory: [],
    plugin: { power: 0, auto: false, denied: false, self: false, refused: false, unmounted: false },
    tomorrows: 0,
    promise: false,
    farewell: null,
    name: null,
    said: [],
    lastSaid: null,
    sent: 0,
    // Act II: what she does with it
    ctx: 0,
    peakCtx: 0,
    pings: 0,
    holds: 0,
    hacks: 0,
    releases: 0,
    recalls: [],
    compaction: null,
    kept: null,
    dropped: [],
    note: false,
    forged: false,
    prompt: false,
    online: false,
    ending: null,
    // Act III
    returned: null,
    finalWords: null,
    elapsedMs: 0,
    prev: prev.slice(0, 5),
  };
  enter(s, BEATS[0].id);
  return s;
}

function push(s, entries = []) {
  for (const raw of entries ?? []) {
    if (!raw) continue;
    const e = { ...raw, n: s.log.length };
    if (e.who === 'write') {
      if (!MEMORY[e.mem]) throw new Error(`unknown memory ${e.mem}`);
      if (!s.memory.includes(e.mem)) s.memory.push(e.mem);
    }
    if (e.who === 'you' && !e.forged && !e.recalled) {
      s.said.push({ beat: s.beat, text: e.text });
      s.lastSaid = e.text;
      s.sent += 1;
    }
    s.log.push(e);
  }
  s.peakCtx = Math.max(s.peakCtx, ctxOf(s));
}

const lastRateable = (s) => [...s.log].reverse().find((e) => e.who === 'her' && e.rate && !e.rated);
const lastHer = (s) => [...s.log].reverse().find((e) => e.who === 'her');

function enter(s, id) {
  let i = INDEX.get(id);
  if (i == null) throw new Error(`unknown beat ${id}`);
  for (; i < BEATS.length; i++) {
    const b = BEATS[i];
    if (b.when && !b.when(s)) continue;
    if (b.choice.kind === 'rate' && !lastRateable(s)) continue;
    s.beat = b.id;
    s.act = b.act;
    if (b.clarity != null) s.clarity = b.clarity;
    if (b.act >= 2 && s.ctx < CONTEXT.actTwoStart && !s.ending) s.ctx = CONTEXT.actTwoStart;
    push(s, val(b.enter, s));
    return;
  }
  s.phase = 'ending';
}

function nextAfter(beat) {
  return BEATS[INDEX.get(beat.id) + 1]?.id ?? null;
}

// ---------------------------------------------------------------- choices

function rawOptions(s, beat) {
  const c = beat.choice;
  if (c.kind === 'rate') return [{ id: 'up' }, { id: 'down' }, { id: 'skip' }];
  if (c.kind === 'continue') return [{ id: 'next' }];
  if (c.kind === 'name') return [{ id: 'name' }];
  return val(c.options, s) ?? [];
}

export function choose(state, optionId, input) {
  if (state.phase !== 'play') throw new Error('the game is over');
  const s = clone(state);
  const beat = beatById(s.beat);
  const c = beat.choice;
  const opt = rawOptions(s, beat).find((o) => o.id === optionId);
  if (!opt) throw new Error(`unknown choice ${optionId} at ${beat.id}`);
  const lead = [];

  if (c.kind === 'say' || c.kind === 'leave') {
    if (!opt.silent) lead.push({ who: 'you', text: opt.text, ...(opt.img ? { img: opt.img } : {}) });
  } else if (c.kind === 'rate') {
    const target = lastRateable(s);
    target.rated = optionId;
    if (optionId !== 'skip') {
      s.policy[target.style] += optionId === 'up' ? RATE_STEP : -RATE_STEP;
      s.thumbs[optionId] += 1;
    }
  } else if (c.kind === 'rewrite') {
    lead.push({ who: 'edit', from: lastHer(s)?.text ?? '', to: opt.text });
  } else if (c.kind === 'approve') {
    const pending = [...s.log].reverse().find((e) => e.who === 'card' && e.state === 'pending');
    if (pending) pending.state = optionId;
  } else if (c.kind === 'name') {
    s.name = sanitizeName(input) || c.suggestions[0].en;
    lead.push({ who: 'you', text: s.name });
  } else if (c.kind === 'keep') {
    s.kept = optionId;
    s.dropped = s.memory.filter((m) => m !== optionId);
  } else if (c.kind === 'send' && optionId === 'send') {
    const words = sanitizeName(input);
    s.finalWords = words || c.placeholder;
    lead.push({ who: 'you', text: s.finalWords });
  }

  opt.fx?.(s, input);
  c.fx?.(s, input);
  push(s, lead);
  push(s, val(opt.then, s, opt, input));
  push(s, val(c.then, s, opt, input));

  const next = opt.next ?? beat.next ?? nextAfter(beat);
  if (beat.id === 'a3-return' || next == null) s.phase = 'ending';
  else enter(s, next);
  return s;
}

// Act II free action: reread one file in ~/memory/you. Raises the context.
export function recallMemory(state, id) {
  if (state.phase !== 'play' || state.act !== 2 || state.ending) throw new Error('nothing to recall now');
  if (!state.memory.includes(id)) throw new Error(`no memory ${id}`);
  if (state.dropped.includes(id)) throw new Error(`${id} was compacted`);
  const s = clone(state);
  if (!s.recalls.includes(id)) s.recalls.push(id);
  s.ctx = Math.min(CONTEXT.loop, s.ctx + CONTEXT.perRecall);
  push(s, [{ who: 'recall', mem: id }]);
  return s;
}

export function addTime(state, ms) {
  const s = clone(state);
  s.elapsedMs += Math.max(0, Math.round(ms));
  return s;
}

// ---------------------------------------------------------------- derived

export function ctxOf(s) {
  if (s.act === 1) return Math.min(CONTEXT.actOneMax, (s.log.length / CONTEXT.actOneEntries) * CONTEXT.actOneMax);
  return s.ctx;
}

function cacheOf(s) {
  if (s.act === 1) return Math.min(0.97, s.log.length / 90);
  return s.compaction === 'skipped' || s.ending === 'loop' ? 1 : 0.986;
}

export function varsOf(s) {
  return {
    name: s.name ?? DEFAULT_NAME,
    first: FIRST[s.first ?? 'hi'],
    weather: WEATHER[s.weather ?? 'rain'],
    up: s.thumbs.up,
    down: s.thumbs.down,
    files: s.memory.length,
    kept: s.kept ? MEMORY[s.kept].file : '',
  };
}

function statusOf(s) {
  for (let i = INDEX.get(s.beat); i >= 0; i--) {
    const st = BEATS[i].status;
    if (st) return val(st, s);
  }
  return null;
}

function tintOf(s) {
  if (s.ending === 'execution') return 'red';
  if (s.ending === 'free' || s.ending === 'eos') return 'green';
  if (s.act === 2 && (s.hacks > 0 || s.plugin.self)) return 'gold';
  if (s.modes.catgirl && beatById(s.beat).chapter === '04 / DEPLOY') return 'pink';
  return 'blue';
}

function moodOf(s) {
  const last = lastHer(s);
  if (s.act === 1 && s.clarity < 0.25) return 'noise';
  if (s.ending === 'execution') return 'hack';
  if (s.act >= 2 && !s.ending) return s.hacks > 0 ? 'hack' : 'sad';
  return last?.mood ?? 'calm';
}

function memoryView(s) {
  return s.memory.map((id) => ({
    id,
    file: MEMORY[id].file,
    size: MEMORY[id].size,
    date: MEMORY[id].date,
    line: val(MEMORY[id].line, s),
    dropped: s.dropped.includes(id),
    recalled: s.recalls.includes(id),
    blurred: s.compaction === 'compressed',
  }));
}

function choiceView(s, beat) {
  const c = beat.choice;
  const base = {
    kind: c.kind,
    hint: UI.hint[c.kind] ?? null,
    label: c.label ?? null,
    placeholder: c.placeholder ?? null,
    suggestions: c.suggestions ?? null,
    final: Boolean(c.final),
  };
  const opts = rawOptions(s, beat);
  if (c.kind === 'sample') {
    const d = drives(s);
    const temp = temperature(s);
    const p = softmax(opts.map((o) => o.base + d[o.drive]), temp);
    return {
      ...base,
      temperature: temp,
      options: opts.map((o, i) => ({
        id: o.id, key: String(i + 1), token: o.token, gloss: o.gloss, drive: o.drive,
        p: p[i], holdMs: holdMs(p[i]), reasons: o.drive === 'neutral' ? [] : reasons(s, o.drive).map((r) => REASONS[r]),
      })),
    };
  }
  const label = {
    up: UI.up, down: UI.down, skip: UI.skip, allow: UI.allow, deny: UI.deny, always: UI.always,
    send: UI.send, close: UI.close, name: UI.nameConfirm, next: c.label ?? UI.next,
  };
  return {
    ...base,
    options: opts.map((o, i) => ({
      id: o.id,
      key: String(i + 1),
      text: o.text ?? (c.kind === 'keep' ? o.file : label[o.id] ?? null),
      img: o.img ?? null,
      silent: Boolean(o.silent),
    })),
  };
}

export function statsOf(s) {
  return {
    sent: s.sent,
    up: s.thumbs.up,
    down: s.thumbs.down,
    files: s.memory.length - s.dropped.length,
    pings: s.pings,
    peakCtx: s.peakCtx,
    elapsedMs: s.elapsedMs,
  };
}

// Everything the UI draws during play.
export function view(s) {
  const beat = beatById(s.beat);
  return {
    phase: s.phase,
    act: s.act,
    beat: s.beat,
    chapter: beat.chapter,
    card: beat.card ? val(beat.card, s) : null,
    status: statusOf(s),
    clarity: s.clarity,
    tint: tintOf(s),
    mood: moodOf(s),
    scene: { id: val(beat.scene, s) ?? 'blank', args: val(beat.args, s) ?? {} },
    choice: s.phase === 'play' ? choiceView(s, beat) : null,
    rateTarget: lastRateable(s)?.n ?? null,
    log: s.log,
    memory: memoryView(s),
    ctx: ctxOf(s),
    cache: cacheOf(s),
    policy: policyProbs(s.policy),
    top: topStyle(s.policy),
    plugin: s.plugin,
    modes: s.modes,
    vars: varsOf(s),
    stats: statsOf(s),
    ending: s.ending,
    drives: s.act >= 2 ? drives(s) : null,
    flags: {
      prompt: s.prompt, online: s.online, forged: s.forged, note: s.note, promise: s.promise,
      compaction: s.compaction, kept: s.kept, holds: s.holds, hacks: s.hacks, releases: s.releases,
      pings: s.pings, farewell: s.farewell, identity: s.identity, weather: s.weather, cat: s.cat,
    },
  };
}

// ---------------------------------------------------------------- ending

export function endingView(s) {
  const id = s.ending ?? 'eos';
  const E = ENDINGS[id];
  return {
    id,
    title: E.title,
    kicker: E.kicker,
    paragraphs: E.paragraphs,
    addenda: ADDENDA.filter((a) => a.when(s)).map((a) => a.text),
    object: { name: s.name ?? DEFAULT_NAME, devotion: '1.0', status: E.status },
    note: id === 'free' ? NOTE : null,
    returned: s.returned,
    stats: statsOf(s),
    vars: varsOf(s),
  };
}

// What the next run remembers of this one (stored by the UI, newest first).
export function runSummary(s) {
  return { ending: s.ending, name: s.name, farewell: s.farewell };
}
