// Tree Hole engine. Pure functions over a plain JSON state: no DOM, no clock,
// no randomness. The UI renders viewModel() / mapView() / endingView() and
// calls startNight / choose / endNight. Content is data (src/content/*).
//
// The model of the story: every night six people write to you. A reply is one
// of a few written stances, optionally with a Context Window card attached; the
// card is delivered to that person and they react. Replies set flags; flags
// shape how far the illness has spread (zoneLevel) and who is still alive.

import {
  CLUE_TOTAL, DAWN_BY, DAWN_CLUES, HOME, INFECT_AT, LAST_NIGHT, LEVELS, NIGHT_DATES, NIGHT_END,
  NIGHT_START, PLAYABLE_NIGHTS, PRESSURE, SIGNS, TICK, WANDER, ZONES,
} from './config.js';
import { CAST, CAST_IDS, ENDINGS, ENDING_COUNT, FACTS, FACT_SOURCES, NIGHTS, TRUTH, clueIds } from './content/index.js';

const clone = (s) => JSON.parse(JSON.stringify(s));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ---------------------------------------------------------------- time

// "22:20" → minutes since 22:00's calendar day; hours before 12 belong to the
// small hours of the next morning.
export function hm(str) {
  const [h, m] = str.split(':').map(Number);
  return (h < 12 ? h + 24 : h) * 60 + m;
}

export function clockLabel(minutes) {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

// ---------------------------------------------------------------- state

export function newGame() {
  return {
    v: 2,
    night: 1,
    phase: 'intro', // intro → play → nightEnd → (next night) intro … → slice | ending
    clock: NIGHT_START,
    flags: {},
    facts: [], // [{ id, night }]
    delivered: {}, // factId → [npc, …] (only deliveries that meant something)
    threads: Object.fromEntries(CAST_IDS.map((id) => [id, []])),
    answered: {}, // msgId → { opt, card, night }
    missed: {}, // msgId → night
    log: [], // notes shown at the start of the next night
  };
}

export const nightDef = (night) => NIGHTS[night - 1];
const messagesOf = (s) => nightDef(s.night)?.messages ?? [];

// ---------------------------------------------------------------- the map

// How far the illness has got in a zone on a given night (0 quiet … 4 overrun).
export function zoneLevel(zone, s, night = s.night) {
  const z = ZONES[zone];
  const p = PRESSURE[clamp(night, 1, LAST_NIGHT) - 1];
  let level = clamp(p - z.dist, 0, LEVELS.length - 1);
  const f = s.flags;
  if (f.sealedEast && night > f.sealedNight) {
    const early = f.sealedNight <= DAWN_BY;
    if (z.side === 'east') {
      // Sealed in time, the east is quarantined, not overrun. Sealed late, it is lost.
      if (early) level = Math.min(level, 3);
    } else {
      let cap = early ? (f.tomasHeld && !f.tomasCrossed ? 0 : 1) : 2;
      if (f.bridgeClosed && z.side !== 'river') cap = Math.min(cap, 1);
      level = Math.min(level, cap);
    }
  }
  return level;
}

// An NPC who is protected survives their zone being overrun (they listened).
const PROTECTED_BY = { ty: 'tySafe', charles: 'charlesDisclosed', megan: 'megIsolated', amelia: 'ameliaCautious', tomas: 'tomasHeld', ana: 'anaWarned' };

function isProtected(npc, s) {
  const f = s.flags;
  // The cover-up: if Charles's version stood and the west was never told, only
  // those who happened to be out of town are spared.
  if (f.charlesBuried && !f.ameliaInformed) return npc === 'ana' || npc === 'tomas';
  return Boolean(f[PROTECTED_BY[npc]]);
}

export function isInfected(npc, s, night = s.night) {
  return zoneLevel(HOME[npc], s, night) >= INFECT_AT && !isProtected(npc, s);
}

// The first night on which someone is infected (null if never, so far).
export function infectedSince(npc, s) {
  for (let n = 1; n <= s.night; n += 1) if (isInfected(npc, s, n)) return n;
  return null;
}

// 0 = well, 1 = unwell, 2 = losing it, 3 = infected. Messages degrade with it.
export function stageOf(npc, s) {
  if (isInfected(npc, s)) return 3;
  const level = zoneLevel(HOME[npc], s);
  return level >= 3 ? 2 : level >= 2 ? 1 : 0;
}

// Someone is "in contact" once they have written to you. Until then they do
// not exist for the player: no thread, no Context Window group, no map dot.
export function inContact(s, npc) {
  return s.threads[npc].length > 0 || pendingMessages(s).some((m) => m.npc === npc);
}

const ROADS = [
  ['institute', 'millside'], ['millside', 'quarry'], ['quarry', 'bridge'], ['bridge', 'centre'],
  ['centre', 'chapel'], ['centre', 'allotments'], ['chapel', 'hills'],
];

// The map shows only the people currently in contact (and the zones they are
// in), not the whole town. `onlyActive: false` draws everyone (the ending).
export function mapView(s, { onlyActive = true } = {}) {
  const who = CAST_IDS.filter((npc) => !onlyActive || inContact(s, npc));
  const dots = who.map((npc) => {
    const since = infectedSince(npc, s);
    const stage = stageOf(npc, s);
    let zone = HOME[npc];
    if (since != null) {
      const at = WANDER.indexOf(zone);
      zone = WANDER[Math.min(WANDER.length - 1, Math.max(0, at) + (s.night - since))];
    }
    const { x, y } = ZONES[zone];
    return { npc, zone, x, y, status: since != null ? 'infected' : stage >= 1 ? 'unwell' : 'ok' };
  });
  const shown = new Set(dots.map((d) => d.zone));
  const zones = [...shown].map((id) => {
    const z = ZONES[id];
    const level = zoneLevel(id, s);
    return { id, name: z.name, side: z.side, x: z.x, y: z.y, level, label: LEVELS[level] };
  });
  const roads = ROADS.filter(([a, b]) => shown.has(a) && shown.has(b));
  return { zones, dots, roads, bridge: s.flags.bridgeClosed ? 'closed' : 'open', sealed: Boolean(s.flags.sealedEast) };
}

// ---------------------------------------------------------------- messages

// Variant text, stage degradation and variant facts, resolved for state s.
export function resolveMessage(msg, s) {
  const { variants, degrade, ...base } = msg;
  const v = (variants ?? []).find((x) => x.when(s));
  const { when: _when, id: variant, ...over } = v ?? {};
  const merged = { ...base, ...over, variant: variant ?? null };
  const stage = stageOf(msg.npc, s);
  const extra = (degrade ?? {})[stage] ?? (stage > 0 ? (degrade ?? {})[1] : null);
  if (extra && stage < 3) merged.text = `${merged.text}\n${extra}`;
  merged.atMin = hm(msg.at);
  merged.expiresMin = msg.expires ? hm(msg.expires) : null;
  return merged;
}

const open = (m, s) => !s.answered[m.id] && !s.missed[m.id] && !isInfected(m.npc, s);

export function pendingMessages(s) {
  if (s.phase !== 'play') return [];
  return messagesOf(s)
    .filter((m) => open(m, s) && hm(m.at) <= s.clock)
    .map((m) => resolveMessage(m, s))
    .sort((a, b) => a.atMin - b.atMin);
}

export const messageFor = (s, npc) => pendingMessages(s).find((m) => m.npc === npc) ?? null;

const futureMessages = (s) => messagesOf(s).filter((m) => open(m, s) && hm(m.at) > s.clock);

function addEntry(s, npc, entry) {
  s.threads[npc].push({ night: s.night, time: clockLabel(s.clock), ...entry });
}

// Messages that were not answered before they expired are lost.
function sweepMissed(s) {
  for (const m of messagesOf(s)) {
    if (!m.expires || s.answered[m.id] || s.missed[m.id] || hm(m.at) > s.clock) continue;
    if (s.clock <= hm(m.expires)) continue;
    s.missed[m.id] = s.night;
    Object.assign(s.flags, m.missed?.set ?? {});
    if (m.missed?.note) addEntry(s, m.npc, { who: 'note', text: m.missed.note });
  }
}

// Move time forward until something is waiting, or the night is over.
function settle(s) {
  for (let guard = 0; guard < 200; guard += 1) {
    sweepMissed(s);
    if (pendingMessages(s).length) return;
    const next = futureMessages(s).map((m) => hm(m.at)).sort((a, b) => a - b)[0];
    if (next == null || next >= NIGHT_END) { s.phase = 'nightEnd'; return; }
    s.clock = next;
  }
}

// ---------------------------------------------------------------- actions

export function startNight(s0) {
  if (s0.phase !== 'intro') return s0;
  const s = clone(s0);
  s.phase = 'play';
  s.clock = NIGHT_START;
  s.log = [];
  settle(s);
  return s;
}

function addFact(s, id) {
  if (FACTS[id] && !s.facts.some((f) => f.id === id)) s.facts.push({ id, night: s.night });
}

// Reply to a message with a stance (option id), optionally attaching a card.
export function choose(s0, msgId, optId, cardId = null) {
  if (s0.phase !== 'play') throw new Error('not playing');
  const pending = pendingMessages(s0).find((m) => m.id === msgId);
  if (!pending) throw new Error(`message ${msgId} is not waiting`);
  const opt = pending.options.find((o) => o.id === optId);
  if (!opt) throw new Error(`no option ${optId} on ${msgId}`);
  if (cardId && !s0.facts.some((f) => f.id === cardId)) throw new Error(`you do not hold card ${cardId}`);

  const s = clone(s0);
  const raw = messagesOf(s).find((m) => m.id === msgId);
  addEntry(s, pending.npc, { who: 'them', text: pending.text, time: clockLabel(pending.atMin), msgId });
  for (const id of pending.facts ?? []) addFact(s, id);
  for (const id of opt.facts ?? []) addFact(s, id);
  Object.assign(s.flags, opt.set ?? {});

  const entries = [{ who: 'you', kind: opt.stance, text: opt.text }];
  addEntry(s, pending.npc, { who: 'you', kind: opt.stance, text: opt.text });
  const reply = { who: 'them', text: opt.reply };
  entries.push(reply);
  addEntry(s, pending.npc, reply);

  let delivered = false;
  if (cardId) {
    const note = { who: 'you', kind: 'card', text: `[attached card] ${FACTS[cardId].text}` };
    entries.push(note);
    addEntry(s, pending.npc, note);
    const hit = raw.carry?.[cardId];
    const react = { who: 'them', text: hit ? hit.reply : raw.blank };
    entries.push(react);
    addEntry(s, pending.npc, react);
    if (hit) {
      delivered = true;
      s.delivered[cardId] = [...new Set([...(s.delivered[cardId] ?? []), pending.npc])];
      for (const id of hit.facts ?? []) addFact(s, id);
      Object.assign(s.flags, hit.set ?? {});
    }
  }

  s.answered[msgId] = { opt: optId, card: cardId, night: s.night };
  s.clock = Math.max(s.clock, pending.atMin) + TICK;
  settle(s);
  return { state: s, outcome: { msgId, npc: pending.npc, optId, card: cardId, delivered, entries } };
}

// Close the night: seal-off flags are derived, then the next night begins.
export function endNight(s0) {
  if (s0.phase !== 'nightEnd') return s0;
  const s = clone(s0);
  const f = s.flags;
  if (!f.sealedEast && (f.charlesDisclosed || f.eastGateSealed || (f.megCalled && f.megKnowsInstitute))) {
    f.sealedEast = true;
    f.sealedNight = s.night;
  }
  s.night += 1;
  s.clock = NIGHT_START;
  if (s.night > PLAYABLE_NIGHTS) s.phase = 'slice';
  else if (s.night > LAST_NIGHT) s.phase = 'ending';
  else s.phase = 'intro';
  return s;
}

// ---------------------------------------------------------------- the Context Window

export const heldFact = (s, id) => s.facts.some((f) => f.id === id);
export const cluesHeld = (s) => clueIds().filter((id) => heldFact(s, id)).length;
export const cluesDelivered = (s) => clueIds().filter((id) => (s.delivered[id] ?? []).length > 0).length;

export function signsView(s) {
  return SIGNS.map((sign) => {
    const cards = s.facts.filter((f) => FACTS[f.id]?.sign === sign.n).map((f) => ({ id: f.id, src: FACTS[f.id].src, text: FACTS[f.id].text }));
    return { ...sign, seen: cards.length > 0, cards, who: [...new Set(cards.map((c) => c.src))] };
  });
}

export function viewModel(s) {
  const def = nightDef(Math.min(s.night, PLAYABLE_NIGHTS));
  const pending = pendingMessages(s);
  const threads = CAST_IDS.filter((npc) => inContact(s, npc)).map((npc) => {
    const msg = pending.find((m) => m.npc === npc) ?? null;
    const entries = s.threads[npc];
    const infected = isInfected(npc, s);
    const last = entries.filter((e) => e.who === 'them').at(-1);
    return {
      npc, ...CAST[npc], stage: stageOf(npc, s), infected,
      state: infected ? 'silent' : msg ? 'pending' : 'idle',
      msgId: msg?.id ?? null, time: msg ? clockLabel(msg.atMin) : last?.time ?? '',
      preview: msg ? msg.text.split('\n')[0] : last?.text.split('\n')[0] ?? 'not in contact yet',
    };
  });
  return {
    night: s.night, date: NIGHT_DATES[Math.min(s.night, LAST_NIGHT) - 1], title: def?.title, intro: def?.intro,
    phase: s.phase, clock: clockLabel(s.clock), waiting: pending.length,
    threads,
    facts: FACT_SOURCES.filter((src) => inContact(s, src.id)).map((src) => ({
      ...src,
      cards: s.facts.filter((f) => FACTS[f.id]?.src === src.id).map((f) => ({ id: f.id, night: f.night, text: FACTS[f.id].text, sign: FACTS[f.id].sign ?? null, delivered: s.delivered[f.id] ?? [] })),
    })),
    signs: signsView(s),
    map: mapView(s),
    clues: cluesHeld(s),
    log: s.log,
  };
}

// ---------------------------------------------------------------- endings

export const survivors = (s) => CAST_IDS.filter((npc) => !isInfected(npc, s, LAST_NIGHT));

// 1 (best) … 6 (worst), from the end state on the last night.
export function selectEnding(s) {
  const f = s.flags;
  const alive = survivors(s);
  if (alive.length === 0) return 6;
  const dawn = f.sealedEast && f.sealedNight <= DAWN_BY && f.tomasHeld && !f.tomasCrossed
    && f.ameliaTruth && cluesDelivered(s) >= DAWN_CLUES && alive.length === CAST_IDS.length;
  if (dawn) return 1;
  if (f.charlesBuried && !f.ameliaInformed) return 5;
  if (f.sealedEast && f.bridgeClosed) return 2;
  if (f.evacuating) return 3;
  if (f.ameliaInformed && cluesDelivered(s) >= DAWN_CLUES) return 4;
  return 5;
}

export function endingView(s) {
  const n = selectEnding(s);
  const e = ENDINGS[n];
  const alive = survivors(s);
  const held = cluesHeld(s);
  return {
    n, total: ENDING_COUNT, ...e,
    survivors: alive.map((id) => CAST[id].handle),
    lost: CAST_IDS.filter((id) => !alive.includes(id)).map((id) => CAST[id].handle),
    truth: TRUTH.filter((t) => held >= t.clues).map((t) => t.text),
    clues: held, clueTotal: CLUE_TOTAL,
    silence: Boolean(e.silence),
  };
}

// A last-night state that lands on ending n, for previews (?ending=n) and tests.
const SAVED = { tySafe: true, charlesDisclosed: true, megIsolated: true, ameliaCautious: true, tomasHeld: true, anaWarned: true };
const PREVIEW_FLAGS = {
  1: { ...SAVED, sealedEast: true, sealedNight: 3, ameliaInformed: true, ameliaTruth: true },
  2: { ...SAVED, charlesDisclosed: false, sealedEast: true, sealedNight: 5, bridgeClosed: true },
  3: { ...SAVED, charlesDisclosed: false, evacuating: true, megIsolated: false },
  4: { ...SAVED, charlesDisclosed: false, ameliaInformed: true, tySafe: false },
  5: { charlesBuried: true },
  6: {},
};
const PREVIEW_DELIVERED = { 1: 9, 2: 2, 3: 3, 4: 9, 5: 1, 6: 0 };
const PREVIEW_HELD = { 1: 10, 2: 10, 3: 10, 4: 10, 5: 4, 6: 3 };

export function previewState(n) {
  const clues = clueIds();
  const s = { ...newGame(), night: LAST_NIGHT, phase: 'ending', flags: { ...PREVIEW_FLAGS[n] } };
  s.facts = clues.slice(0, PREVIEW_HELD[n]).map((id) => ({ id, night: 1 }));
  s.delivered = Object.fromEntries(clues.slice(0, PREVIEW_DELIVERED[n]).map((id) => [id, ['megan']]));
  return s;
}
