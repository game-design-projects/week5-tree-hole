// The rules. Pure functions over a plain JSON state: every action returns a new
// state and never mutates the one it was given. The UI renders viewModel() and
// calls respond(); the LLM layer (llm.js) only ever produces the arguments.
import {
  DAWN, DEFLECT_CALMS, REPORTS_TO_SEAL, EARLY_BY, EXPOSURE_BY_LEAK, HOME, INFECT_AT, INQUIRY_AT, KNOWS, LAST_NIGHT, LEAK_LEVELS,
  LEVELS, MAX_REASKS, NIGHT_DATES, NIGHT_START, PANIC_AT, PRESSURE, SAVE_VERSION, SHUTDOWN_AT, SUS_BY_LEAK, TICK,
  UNEASE_BY_LEAK, WANDER, WARY_AT, ZONES,
} from './config.js';
import { CANNED, CAST, CAST_IDS, NIGHTS, INQUIRIES, THREAD_IDS, WHO, VERDICTS } from './content/index.js';

const clone = (s) => JSON.parse(JSON.stringify(s));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function hash(s, key) {
  let h = 2166136261 ^ (s.seed ?? 0);
  for (let i = 0; i < key.length; i += 1) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return h >>> 0;
}

// A script is a string or an array of alternates; the seed picks one per key, so a
// run always reads the same and different runs read differently.
export function pickScript(s, key, value) {
  if (!Array.isArray(value)) return value;
  return value[hash(s, key) % value.length];
}

// ---------------------------------------------------------------- time

// "22:40" → minutes since 00:00 of the night's date ("01:10" is 25:10).
export function hm(str) {
  const [h, m] = str.split(':').map(Number);
  return (h < 12 ? h + 24 : h) * 60 + m;
}

export function clockLabel(minutes) {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

// ---------------------------------------------------------------- state

export function newGame(seed = 0) {
  return {
    v: SAVE_VERSION,
    seed: seed >>> 0,
    night: 1,
    phase: 'intro', // intro → play → nightEnd → (next night) intro … → ending
    clock: NIGHT_START,
    flags: {},
    sus: 0, // the operators' suspicion, hidden
    unease: Object.fromEntries(CAST_IDS.map((id) => [id, 0])), // each user's, hidden
    waryAsked: {}, // npc → true once they have asked how you knew
    deflected: {}, // npc → true once the cover story has been used on them
    left: {}, // npc → night they stopped using the service
    gaveUp: {}, // npc → true when they stopped because the answers made no sense (not a panic)
    asks: {}, // msgId → off-topic replies to a waiting message, and how they asked again
    lostAt: {}, // npc → night they walked into the illness (infected from the next night)
    exposures: [], // leaks the subject hears about when the night ends: { npc, level, night }
    extra: [], // messages the rules add: panics and operator inquiries
    threads: Object.fromEntries(THREAD_IDS.map((id) => [id, []])),
    answered: {}, // msgId → { opt, leak, from, free, night }
    llm: {}, // msgId → raw LLM responses, kept before they are parsed
  };
}

export const nightDef = (night) => NIGHTS[night - 1];

// ---------------------------------------------------------------- the town

export function zoneLevel(zone, s, night = s.night) {
  const z = ZONES[zone];
  const f = s.flags;
  let level = clamp(PRESSURE[clamp(night, 1, DAWN) - 1] - z.dist, 0, LEVELS.length - 1);
  const breached = f.breach && night > f.breachNight;
  if (f.sealedEast && night > f.sealedNight && !breached) {
    const early = f.sealedNight <= EARLY_BY;
    if (z.side === 'east') { if (early) level = Math.min(level, 3); }
    else level = Math.min(level, early ? 1 : 2);
  }
  if (f.bridgeClosed && night > f.bridgeNight && (z.side === 'west' || z.side === 'hills')) level = Math.min(level, 2);
  return level;
}

const PROTECTED_BY = { ty: 'tySafe', charles: 'charlesDisclosed', megan: 'megIsolated', amelia: 'ameliaCautious', tomas: 'tomasHeld', ana: 'anaWarned' };
// Flags that put someone in the illness's way, whatever else protects them.
const LOST_BY = { ty: ['tyBreach'], charles: ['eastGateSealed'], megan: ['megOpened'], amelia: ['ameliaOutside'], tomas: ['tomasCrossed'], ana: ['anaRisk'] };

export function isInfected(npc, s, night = s.night) {
  if (s.lostAt?.[npc] != null && night > s.lostAt[npc]) return true;
  return zoneLevel(HOME[npc], s, night) >= INFECT_AT && !s.flags[PROTECTED_BY[npc]];
}

export function infectedSince(npc, s, upTo = s.night) {
  for (let n = 1; n <= upTo; n += 1) if (isInfected(npc, s, n)) return n;
  return null;
}

// 0 well · 1 unwell around them · 2 their street is quarantined · 3 turned.
export function stageOf(npc, s) {
  if (isInfected(npc, s)) return 3;
  const level = zoneLevel(HOME[npc], s);
  return level >= 3 ? 2 : level >= 2 ? 1 : 0;
}

export function inContact(s, npc) {
  return s.threads[npc].length > 0 || pendingMessages(s).some((m) => m.npc === npc);
}

const ROADS = [
  ['institute', 'millside'], ['millside', 'quarry'], ['quarry', 'bridge'], ['bridge', 'centre'],
  ['centre', 'chapel'], ['centre', 'allotments'], ['chapel', 'hills'],
];

export function mapView(s, { onlyActive = true, night = s.night } = {}) {
  const at = { ...s, night };
  const who = CAST_IDS.filter((npc) => !onlyActive || inContact(s, npc));
  const dots = who.map((npc) => {
    const since = infectedSince(npc, at, night);
    const stage = stageOf(npc, at);
    let zone = HOME[npc];
    if (since != null) {
      const i = WANDER.indexOf(zone);
      zone = WANDER[Math.min(WANDER.length - 1, Math.max(0, i) + (night - since))];
    }
    const { x, y } = ZONES[zone];
    return { npc, zone, x, y, status: since != null ? 'infected' : stage >= 1 ? 'unwell' : 'ok' };
  });
  const shown = new Set(dots.map((d) => d.zone));
  const zones = [...shown].map((id) => {
    const z = ZONES[id];
    const level = zoneLevel(id, at);
    return { id, name: z.name, side: z.side, x: z.x, y: z.y, level, label: LEVELS[level] };
  });
  const roads = ROADS.filter(([a, b]) => shown.has(a) && shown.has(b));
  return { zones, dots, roads, bridge: s.flags.bridgeClosed ? 'closed' : 'open', sealed: Boolean(s.flags.sealedEast) };
}

// ---------------------------------------------------------------- isolation

export const isWary = (s, npc) => (s.unease[npc] ?? 0) >= WARY_AT;
export const isPanicking = (s, npc) => (s.unease[npc] ?? 0) >= PANIC_AT;
export const hasLeft = (s, npc) => s.left[npc] != null;
export const isRunning = (s) => s.sus < SHUTDOWN_AT;

// Rules-made messages: a user's last message when they panic, and the operators' inquiry.
function panicMessage(npc, night) {
  return { id: `panic-${npc}-n${night}`, npc, kind: 'panic', night };
}

function schedulePanics(s) {
  for (const npc of CAST_IDS) {
    if (!isPanicking(s, npc) || hasLeft(s, npc) || isInfected(npc, s)) continue;
    if (s.extra.some((m) => m.kind === 'panic' && m.npc === npc)) continue;
    s.extra.push({ ...panicMessage(npc, s.night), at: s.clock });
  }
}

function scheduleInquiry(s) {
  const def = INQUIRIES[s.night];
  if (!def || s.sus < INQUIRY_AT) return;
  if (s.extra.some((m) => m.kind === 'inquiry' && m.night === s.night)) return;
  s.extra.push({ id: def.id, npc: 'ops', kind: 'inquiry', night: s.night, at: hm(def.at) });
}

// Options are listed in a seeded order, so position never gives the risk away.
function shuffled(s, key, list) {
  return [...list].sort((a, b) => hash(s, `${key}:${a.id}`) - hash(s, `${key}:${b.id}`));
}

// The message as the player sees it right now: variant, script, degradation, the
// wary question, and the replies on offer (fewer as the writer gets uneasy).
export function resolveMessage(msg, s) {
  if (msg.kind === 'panic') {
    const p = CAST[msg.npc].panic;
    return {
      ...msg, text: p.text, atMin: msg.at, variant: null,
      options: [{ id: 'canned', leak: 0, text: CANNED, reply: p.reply, canned: true }],
    };
  }
  const base = msg.kind === 'inquiry' ? INQUIRIES[msg.night] : msg;
  const { variants, degrade, ...rest } = base;
  const v = (variants ?? []).find((x) => x.when(s));
  const { when: _when, id: variant, ...over } = v ?? {};
  const merged = { ...rest, ...over, kind: msg.kind ?? 'story', variant: variant ?? null };
  merged.text = pickScript(s, `${base.id}:${variant ?? ''}`, merged.text);
  const atMin = msg.kind === 'inquiry' ? msg.at : hm(msg.at);
  merged.atMin = atMin;
  if (merged.npc === 'ops') {
    merged.options = shuffled(s, base.id, merged.options);
    return merged;
  }
  const stage = stageOf(merged.npc, s);
  const extra = (degrade ?? {})[stage] ?? (stage > 0 ? (degrade ?? {})[1] : null);
  if (extra && stage < 3) merged.text = `${merged.text}\n${extra}`;
  let options = merged.options ?? [];
  if (!merged.final && isWary(s, merged.npc)) {
    if (!s.waryAsked[merged.npc]) merged.text = `${CAST[merged.npc].wary}\n${merged.text}`;
    merged.wary = true;
    options = options.filter((o) => o.leak < 3);
    if (!s.deflected[merged.npc]) options = [...options, { id: 'deflect', leak: 0, deflect: true, ...CAST[merged.npc].deflect }];
  }
  merged.options = shuffled(s, base.id, options);
  return merged;
}

// A story message is waiting if it is unanswered, its condition holds, and its writer
// is still using the service and still well. A `final` message instead belongs to the
// night its writer turns.
function open(m, s) {
  if (s.answered[m.id]) return false;
  if (m.when && !m.when(s)) return false;
  if (hasLeft(s, m.npc) || s.extra.some((x) => x.kind === 'panic' && x.npc === m.npc)) return false;
  const infected = isInfected(m.npc, s);
  return m.final ? infected && infectedSince(m.npc, s) === s.night : !infected;
}

const storyOf = (s) => nightDef(s.night)?.messages ?? [];

export function pendingMessages(s) {
  if (s.phase !== 'play') return [];
  const story = storyOf(s).filter((m) => open(m, s) && hm(m.at) <= s.clock);
  const extra = s.extra.filter((m) => m.night === s.night && !s.answered[m.id] && m.at <= s.clock);
  return [...story, ...extra].map((m) => resolveMessage(m, s)).sort((a, b) => a.atMin - b.atMin);
}

export const messageFor = (s, npc) => pendingMessages(s).find((m) => m.npc === npc) ?? null;

function nextArrival(s) {
  const story = storyOf(s).filter((m) => open(m, s) && hm(m.at) > s.clock).map((m) => hm(m.at));
  const extra = s.extra.filter((m) => m.night === s.night && !s.answered[m.id] && m.at > s.clock).map((m) => m.at);
  return [...story, ...extra].sort((a, b) => a - b)[0] ?? null;
}

// Move time forward until something is waiting, or the night is over. Nothing expires:
// the night ends only when every message has had its answer.
function settle(s) {
  for (let guard = 0; guard < 200; guard += 1) {
    if (pendingMessages(s).length) return;
    const next = nextArrival(s);
    if (next == null) { s.phase = 'nightEnd'; return; }
    s.clock = next;
  }
}

// ---------------------------------------------------------------- actions

export function startNight(s0) {
  if (s0.phase !== 'intro') return s0;
  const s = clone(s0);
  s.phase = 'play';
  s.clock = NIGHT_START;
  schedulePanics(s);
  scheduleInquiry(s);
  settle(s);
  return s;
}

function addEntry(s, npc, entry) {
  s.threads[npc].push({ night: s.night, time: clockLabel(s.clock), ...entry });
}

function stamp(s) {
  const f = s.flags;
  if (f.breach && f.breachNight == null) f.breachNight = s.night;
  if (f.bridgeClosed && f.bridgeNight == null) f.bridgeNight = s.night;
  for (const [npc, keys] of Object.entries(LOST_BY)) {
    if (s.lostAt[npc] == null && keys.some((k) => f[k])) s.lostAt[npc] = s.night;
  }
}

const cleanFrom = (from, npc) => [...new Set((from ?? []).filter((id) => CAST[id] && id !== npc))];

// ---------------------------------------------------------------- off-topic

// A typed reply the judge matched to none of the replies on offer.
export const OTHER = 'other';
// Story messages take it; the operators' questions and a panicking user's last words
// take one of their replies.
export const acceptsOther = (msg) => msg.npc !== 'ops' && msg.kind !== 'panic';
// Typing is shut off where the replies are forced: a panicking user's last words take the
// standard one, and a wary user has had their leaky replies taken away, which a typed
// answer would walk around. The operators' questions still take a typed answer.
export const acceptsTyping = (msg) => msg.kind !== 'panic' && !msg.wary;
export const asksFor = (s, msgId) => s.asks?.[msgId] ?? [];

// The message, then any off-topic exchanges on it, into the thread.
function writeAsked(s, msg) {
  addEntry(s, msg.npc, { who: 'them', text: msg.text, time: clockLabel(msg.atMin), msgId: msg.id });
  for (const a of asksFor(s, msg.id)) {
    addEntry(s, msg.npc, { who: 'you', text: a.text, leak: a.leak, from: a.from, free: true, msgId: msg.id });
    if (a.question) addEntry(s, msg.npc, { who: 'them', text: a.question });
  }
  if (s.asks) delete s.asks[msg.id];
}

function expose(s, npc, lvl, whose) {
  for (const subject of whose) {
    if (EXPOSURE_BY_LEAK[lvl] > 0 && KNOWS[npc].includes(subject)) s.exposures.push({ npc: subject, level: lvl, night: s.night, to: npc });
  }
}

// Typed text that answers none of the replies on offer. They ask again in their own
// words (`question`, the LLM's), and the message keeps waiting; after MAX_REASKS of
// those, the next makes them stop using the service, and `question` is their last
// line. What the reply gives away costs as much as in any other reply.
export function offTopic(s0, msgId, { text, leak = 0, from = [], question = '', raw = null } = {}) {
  if (s0.phase !== 'play') throw new Error('not playing');
  const msg = pendingMessages(s0).find((m) => m.id === msgId);
  if (!msg) throw new Error(`message ${msgId} is not waiting`);
  if (!acceptsOther(msg)) throw new Error(`${msgId} takes one of its replies`);
  if (!acceptsTyping(msg)) throw new Error(`${msgId} takes no typed text`);

  const s = clone(s0);
  const npc = msg.npc;
  const lvl = clamp(Number.isInteger(leak) ? leak : 0, 0, LEAK_LEVELS - 1);
  const whose = cleanFrom(from, npc);
  const asks = [...asksFor(s, msgId), { text: String(text ?? '').trim(), leak: lvl, from: whose, question: String(question ?? '').trim() || null, night: s.night }];
  s.asks = { ...(s.asks ?? {}), [msgId]: asks };
  if (raw) s.llm[`${msgId}#${asks.length}`] = raw;
  s.sus += SUS_BY_LEAK[lvl];
  s.unease[npc] += UNEASE_BY_LEAK[lvl];
  expose(s, npc, lvl, whose);

  const gaveUp = asks.length > MAX_REASKS;
  if (gaveUp) {
    writeAsked(s, msg);
    s.left[npc] = s.night;
    s.gaveUp = { ...(s.gaveUp ?? {}), [npc]: true };
    s.answered[msgId] = { opt: OTHER, leak: lvl, from: whose, free: true, night: s.night, gaveUp: true };
  }
  stamp(s);
  s.clock = Math.max(s.clock, msg.atMin) + TICK;
  schedulePanics(s);
  settle(s);
  return { state: s, outcome: { msgId, npc, leak: lvl, from: whose, asked: asks.length, gaveUp } };
}

// Answer a waiting message, exactly once. `optId` is the branch (picked by the player,
// or chosen by the LLM judge for typed text). For typed text, `text` is what the player
// wrote, and `leak`/`from` are the judge's reading of it; `reply` may carry the
// LLM's rewrite of the branch's reply. Returns { state, outcome }.
export function respond(s0, msgId, { optId, text = null, leak = null, from = null, reply = null, raw = null } = {}) {
  if (s0.phase !== 'play') throw new Error('not playing');
  const msg = pendingMessages(s0).find((m) => m.id === msgId);
  if (!msg) throw new Error(`message ${msgId} is not waiting`);
  const opt = msg.options.find((o) => o.id === optId);
  if (!opt) throw new Error(`no option ${optId} on ${msgId}`);

  const s = clone(s0);
  const npc = msg.npc;
  const free = typeof text === 'string' && text.trim().length > 0;
  if (free && !acceptsTyping(msg)) throw new Error(`${msgId} takes no typed text`);
  const lvl = free && Number.isInteger(leak) ? clamp(leak, 0, LEAK_LEVELS - 1) : opt.leak;
  const whose = free && Array.isArray(from) ? cleanFrom(from, npc) : cleanFrom(opt.from, npc);
  const answer = free ? text.trim() : opt.text;
  const theirs = typeof reply === 'string' && reply.trim() ? reply.trim() : pickScript(s, `${msgId}:${optId}`, opt.reply);

  writeAsked(s, msg);
  addEntry(s, npc, { who: 'you', text: answer, leak: lvl, from: whose, free, canned: Boolean(opt.canned), msgId });
  if (theirs) addEntry(s, npc, { who: 'them', text: theirs });
  if (raw) s.llm[msgId] = raw;

  if (npc === 'ops') {
    s.sus = Math.max(0, s.sus + (opt.sus ?? 0));
    Object.assign(s.flags, opt.set ?? {});
  } else if (msg.kind === 'panic') {
    const p = CAST[npc].panic;
    s.left[npc] = s.night;
    Object.assign(s.flags, p.set ?? {});
    s.sus += p.sus ?? 0;
    for (const other of KNOWS[npc]) s.unease[other] = (s.unease[other] ?? 0) + (p.spread ?? 0);
  } else {
    Object.assign(s.flags, opt.set ?? {});
    s.sus += opt.sus ?? SUS_BY_LEAK[lvl];
    s.unease[npc] += opt.unease ?? UNEASE_BY_LEAK[lvl];
    if (opt.deflect) {
      s.unease[npc] = Math.max(0, s.unease[npc] - DEFLECT_CALMS);
      s.deflected[npc] = true;
    }
    if (msg.wary) s.waryAsked[npc] = true;
    expose(s, npc, lvl, whose);
  }
  stamp(s);
  s.answered[msgId] = { opt: optId, leak: lvl, from: whose, free, night: s.night };
  s.clock = Math.max(s.clock, msg.atMin) + TICK;
  schedulePanics(s);
  settle(s);
  return { state: s, outcome: { msgId, npc, optId, leak: lvl, from: whose, free, reply: theirs } };
}

// The county acts on the east when the truth reaches it from two sides: Charles's
// signed account, Megan's report linking the cases to the Institute, Amelia on air.
export function reportsIn(s) {
  const f = s.flags;
  return [f.charlesDisclosed, f.megCalled && f.megKnowsInstitute, f.ameliaTruth].filter(Boolean).length;
}

// Close the night: leaks are heard about, the east may be sealed, the next night begins.
export function endNight(s0) {
  if (s0.phase !== 'nightEnd') return s0;
  const s = clone(s0);
  const f = s.flags;
  for (const e of s.exposures.filter((x) => x.night === s.night)) {
    if (!hasLeft(s, e.npc)) s.unease[e.npc] += EXPOSURE_BY_LEAK[e.level];
  }
  if (!f.sealedEast && (f.eastGateSealed || reportsIn(s) >= REPORTS_TO_SEAL)) {
    f.sealedEast = true;
    f.sealedNight = s.night;
  }
  s.night += 1;
  s.clock = NIGHT_START;
  s.phase = s.night > LAST_NIGHT ? 'ending' : 'intro';
  return s;
}

// ---------------------------------------------------------------- view

export function viewModel(s) {
  const def = nightDef(Math.min(s.night, LAST_NIGHT));
  const pending = pendingMessages(s);
  const ids = THREAD_IDS.filter((id) => (id === 'ops' ? s.threads.ops.length || pending.some((m) => m.npc === 'ops') : inContact(s, id)));
  const threads = ids.map((npc) => {
    const msg = pending.find((m) => m.npc === npc) ?? null;
    const entries = s.threads[npc];
    const infected = npc !== 'ops' && isInfected(npc, s);
    const gone = npc !== 'ops' && hasLeft(s, npc);
    const last = entries.filter((e) => e.who === 'them').at(-1);
    return {
      npc, ...WHO[npc],
      stage: npc === 'ops' ? 0 : stageOf(npc, s), infected, left: gone,
      state: msg ? 'pending' : infected ? 'silent' : gone ? 'left' : 'idle',
      msgId: msg?.id ?? null, time: msg ? clockLabel(msg.atMin) : last?.time ?? '',
      preview: msg ? msg.text.split('\n')[0] : last?.text.split('\n')[0] ?? '',
    };
  });
  return {
    night: s.night, date: NIGHT_DATES[Math.min(s.night, LAST_NIGHT) - 1], title: def?.title, intro: def?.intro,
    phase: s.phase, clock: clockLabel(s.clock), waiting: pending.length, threads, map: mapView(s),
  };
}

// ---------------------------------------------------------------- the ending

export const survivors = (s) => CAST_IDS.filter((npc) => !isInfected(npc, s, DAWN));

export function townOutcome(s) {
  const alive = survivors(s).length;
  return alive === CAST_IDS.length ? 'all' : alive === 0 ? 'none' : 'some';
}

// What happened to one person, for the paper.
export function fateOf(npc, s) {
  const since = infectedSince(npc, s, DAWN);
  return {
    npc,
    alive: since == null,
    turnedOn: since, // a night 1–3, or 4 (the morning after)
    left: hasLeft(s, npc) && !s.gaveUp?.[npc], // the paper tells a leaving as a panic: complaints, screenshots
    gaveUp: Boolean(s.gaveUp?.[npc]),
    leftOn: s.left[npc] ?? null,
    lastAdvice: [...s.threads[npc]].reverse().find((e) => e.who === 'you' && !e.canned)?.text ?? null,
  };
}

// The replies that gave the most away, worst first: the paper quotes them.
export function leakiest(s, limit = 2) {
  const out = [];
  for (const npc of CAST_IDS) {
    for (const e of s.threads[npc]) if (e.who === 'you' && e.leak >= 2) out.push({ npc, text: e.text, leak: e.leak, night: e.night, from: e.from ?? [] });
  }
  return out.sort((a, b) => b.leak - a.leak || a.night - b.night).slice(0, limit);
}

export function endingView(s) {
  const running = isRunning(s);
  const town = townOutcome(s);
  const v = VERDICTS[running ? 'running' : 'shutdown'][town];
  return {
    id: `${running ? 'good' : 'bad'}-${town}`,
    good: running, running, town, verdict: running ? 'Good ending.' : 'Bad ending.', line: v,
    sus: s.sus,
    survivors: survivors(s),
    fates: CAST_IDS.map((npc) => fateOf(npc, s)),
    quotes: leakiest(s),
    flags: { ...s.flags },
  };
}

// An end state for each of the six cells, for previews (?ending=good-all …) and tests.
const SAVED = { tySafe: true, charlesDisclosed: true, megIsolated: true, ameliaCautious: true, tomasHeld: true, anaWarned: true };
export const ENDING_IDS = ['good-all', 'good-some', 'good-none', 'bad-all', 'bad-some', 'bad-none'];
export function previewState(id) {
  const [verdict, town] = id.split('-');
  const s = { ...newGame(), night: DAWN, phase: 'ending' };
  s.flags = town === 'all' ? { ...SAVED } : town === 'some' ? { megIsolated: true, ameliaCautious: true, anaWarned: true } : {};
  if (verdict === 'bad') {
    s.sus = SHUTDOWN_AT + 2;
    s.threads.megan.push({ night: 2, time: '00:40', who: 'you', text: 'Two of the people Tomas drove tonight had cold hands too. Charles says the East Block crew are on extended duty.', leak: 3, from: ['tomas', 'charles'] });
    s.threads.ty.push({ night: 2, time: '22:30', who: 'you', text: 'Your dad is in East Block. The people he works with know more than they are saying.', leak: 3, from: ['charles'] });
  }
  return s;
}
