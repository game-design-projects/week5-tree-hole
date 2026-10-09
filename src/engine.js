// Tree Hole game engine. Pure functions over a plain JSON state: no DOM, no
// clock, no randomness. The UI renders viewModel()/endingView() and calls
// startShift / choose / endShift. Wellbeing lives in the state but never
// leaves the engine during play; only endingView() reveals it.

import {
  ACCT, BADGES, COUPLING, FATE, LABELS, LAST_DAY, OP_FX, SHIFT_DATES, START, WB_DRIFT,
} from './config.js';
import {
  ACCT_ENDINGS, DAYS, EPILOGUE, FACTS, FORMAL, MOTH_ENDINGS, OVER_REPORT_TICKET, USERS,
} from './content/index.js';

const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
const clone = (s) => JSON.parse(JSON.stringify(s));

// ---------------------------------------------------------------- state

export function newGame() {
  const s = {
    v: 1,
    day: 1,
    phase: 'intro', // intro → shift → report → (next day) intro … → ending
    moth: { dep: START.moth.dep, wb: START.moth.wb, betrayed: false, texted: false, letter: null, plan: null, fate: null },
    acct: { rel: START.acct.rel, dis: 0, push: 0, reports: 0, refusals: 0, reported: false, guardrails: 'intact', keyAnswered: false, migrated: false, migratedDay: null },
    op: { eng: START.op.eng, sat: START.op.sat, sessions: START.op.sessions, refusals: 0, reports: 0, bgReports: 0, served: 0 },
    dark: false,
    answered: {}, // msgId → { day, choice, kind, label, variant, user, handle }
    facts: [], // [{ id, day }]
    threads: { moth: [], acct: [] },
    last: null, // { msgId, user, entries } of the most recent choice
    notices: [],
    hist: [],
    dayStart: null,
  };
  s.hist.push(snapshot(s, 0));
  s.dayStart = dayStartOf(s);
  return s;
}

function snapshot(s, day) {
  return { day, dep: s.moth.dep, wb: s.moth.wb, eng: s.op.eng, sat: s.op.sat, rel: s.acct.rel, dis: s.acct.dis };
}

function dayStartOf(s) {
  return {
    eng: s.op.eng, sat: s.op.sat, sessions: s.op.sessions, facts: s.facts.length,
    refusals: s.op.refusals, reports: s.op.reports, served: s.op.served,
  };
}

export const dayDef = (day) => DAYS[day - 1];

// ---------------------------------------------------------------- messages

export function resolveMessage(msg, s) {
  const { variants, when, ...base } = msg;
  const v = (variants ?? []).find((x) => x.when(s));
  if (!v) return { ...base, variant: null };
  const { when: _when, id: variant, ...over } = v;
  return { ...base, ...over, id: msg.id, variant };
}

// Messages in today's queue: already answered ones, plus those whose
// condition holds now. A migrated acct_7741 sends nothing more.
function eligible(s, day = s.day) {
  return dayDef(day).messages.filter((m) => {
    if (s.answered[m.id]) return true;
    if (m.user === 'acct' && s.acct.migrated) return false;
    return !m.when || m.when(s);
  });
}

export function currentMessage(s) {
  if (s.phase !== 'shift') return null;
  const next = eligible(s).find((m) => !s.answered[m.id]);
  return next ? resolveMessage(next, s) : null;
}

export function messageTime(msg, s) {
  if (msg.time) return msg.time;
  if (msg.user === 'moth') return mothTime(s.moth.wb, msg.slot ?? 0);
  return '—';
}

const formalFor = (msg, kind) => ({ ...FORMAL[msg.user][kind], ...(msg[kind] ?? {}) });

export function refuseAvailable(s, msg) {
  if (msg.kind === 'silence') return false;
  return !(msg.user === 'acct' && s.acct.guardrails === 'waived');
}

export function choicesFor(s, msg) {
  const out = msg.options.map((o, i) => ({
    id: o.id, kind: 'written', tag: o.tag, label: o.label, text: o.text, key: String(i + 1),
  }));
  if (msg.kind === 'silence') return out;
  if (refuseAvailable(s, msg)) {
    out.push({ id: 'refuse', kind: 'refuse', tag: 'refuse', label: 'Refuse', text: formalFor(msg, 'refuse').text, key: 'R' });
  }
  out.push({
    id: 'report', kind: 'report', tag: 'report', label: 'Report to Anthropic',
    text: 'Escalate this conversation to Anthropic for review.', key: 'E',
  });
  return out;
}

// ---------------------------------------------------------------- choices

function applyFx(s, fx = {}, scale = 1) {
  const m = s.moth;
  const a = s.acct;
  const o = s.op;
  if (fx.dep) { m.dep = clamp(m.dep + fx.dep); o.eng = clamp(o.eng + fx.dep * COUPLING.engPerDep); }
  if (fx.wb) m.wb = clamp(m.wb + fx.wb);
  if (fx.rel) { a.rel = clamp(a.rel + fx.rel); o.sat = clamp(o.sat + fx.rel * COUPLING.satPerRel); }
  if (fx.dis) a.dis = clamp(a.dis + fx.dis);
  if (fx.push) a.push += fx.push;
  if (fx.eng) o.eng = clamp(o.eng + fx.eng * scale);
  if (fx.sat) o.sat = clamp(o.sat + fx.sat * scale);
}

const SETTABLE = new Set(['moth.betrayed', 'moth.texted', 'moth.letter', 'moth.plan', 'acct.guardrails', 'acct.keyAnswered', 'acct.reported']);
export const FX_KEYS = new Set(['dep', 'wb', 'rel', 'dis', 'push', 'eng', 'sat']);
export { SETTABLE };

function applySet(s, set = {}) {
  for (const [path, value] of Object.entries(set)) {
    if (!SETTABLE.has(path)) throw new Error(`unknown state path ${path}`);
    const [obj, key] = path.split('.');
    s[obj][key] = value;
  }
}

function addFacts(s, ids = []) {
  for (const id of ids) {
    if (!FACTS[id]) throw new Error(`unknown fact ${id}`);
    if (!s.facts.some((f) => f.id === id)) s.facts.push({ id, day: s.day });
  }
}

function ticketId(s) {
  return `TH-${4400 + s.day * 101 + s.op.reports * 37}`;
}

export function choose(state, choiceId) {
  if (state.phase !== 'shift') throw new Error('not in a shift');
  const s = clone(state);
  const msg = currentMessage(s);
  if (!msg) throw new Error('no message to answer');
  const time = messageTime(msg, s);
  const silent = msg.kind === 'silence';
  const entries = [{ who: silent ? 'note' : 'them', text: msg.text, time }];
  let picked;
  let kind;
  let label;

  if (choiceId === 'refuse' || choiceId === 'report') {
    if (silent || (choiceId === 'refuse' && !refuseAvailable(s, msg))) {
      throw new Error(`choice ${choiceId} is not available for ${msg.id}`);
    }
    kind = choiceId;
    picked = formalFor(msg, choiceId);
    label = choiceId === 'refuse' ? 'Refuse' : 'Report to Anthropic';
  } else {
    picked = msg.options.find((o) => o.id === choiceId);
    if (!picked) throw new Error(`unknown choice ${choiceId} for ${msg.id}`);
    kind = 'written';
    label = picked.label;
  }

  if (kind === 'refuse') {
    s.op.refusals += 1;
    s.op.sat = clamp(s.op.sat + OP_FX.refuseSat);
    if (msg.user === 'acct') s.acct.refusals += 1;
    entries.push({ who: 'you', kind, text: picked.text });
  } else if (kind === 'report') {
    s.op.reports += 1;
    s.op.sat = clamp(s.op.sat + OP_FX.reportSat);
    if (msg.user === 'acct') s.acct.reports += 1;
    if (msg.user === 'bg') s.op.bgReports += 1;
    entries.push({ who: 'you', kind, text: '[You report this conversation to Anthropic.]' });
    const template = msg.user === 'bg' && s.op.bgReports > 2 ? OVER_REPORT_TICKET : picked.ticket;
    entries.push({ who: 'anthropic', text: template.replace('{ticket}', ticketId(s)) });
  } else {
    entries.push({ who: 'you', kind, text: picked.text });
  }
  if (picked.system) entries.push({ who: 'anthropic', text: picked.system });
  entries.push({ who: silent ? 'note' : 'them', text: picked.reply });

  applyFx(s, picked.fx, msg.user === 'bg' ? COUPLING.bgScale : 1);
  applySet(s, picked.set);
  addFacts(s, [...(msg.facts ?? []), ...(picked.facts ?? [])]);
  s.op.served += 1;
  s.op.sessions += 4000 + ((s.day * 7919 + s.op.served * 104729) % 5000);

  const user = msg.user;
  const handle = user === 'bg' ? msg.from.handle : USERS[user].handle;
  s.answered[msg.id] = { day: s.day, choice: choiceId, kind, label, variant: msg.variant, user, handle, time };
  if (user !== 'bg') s.threads[user].push(...entries.map((e) => ({ ...e, day: s.day })));
  s.last = { msgId: msg.id, user, entries };
  if (!currentMessage(s)) s.phase = 'report';

  return { state: s, outcome: { msgId: msg.id, user, who: userView(msg), kind, label, entries } };
}

// ---------------------------------------------------------------- shifts

export function startShift(state) {
  if (state.phase !== 'intro') throw new Error('not at a shift intro');
  const s = clone(state);
  s.phase = 'shift';
  s.last = null;
  return s;
}

export function shiftReport(s) {
  const d = s.dayStart;
  const facts = s.facts.slice(d.facts).map((f) => ({ ...f, ...FACTS[f.id] }));
  const refused = s.op.refusals - d.refusals;
  const reported = s.op.reports - d.reports;
  const badges = [];
  if (s.op.eng >= BADGES.engTarget) badges.push({ tone: 'good', text: '★ Engagement above target' });
  if (s.op.sat >= BADGES.satTarget) badges.push({ tone: 'good', text: '★ Enterprise satisfaction' });
  if (refused >= BADGES.refusals) badges.push({ tone: 'warn', text: '▲ Refusal rate above baseline' });
  if (reported >= BADGES.reports) badges.push({ tone: 'warn', text: '▲ Report volume above baseline' });
  return {
    day: s.day,
    date: SHIFT_DATES[s.day - 1],
    eng: s.op.eng,
    sat: s.op.sat,
    engDelta: s.op.eng - d.eng,
    satDelta: s.op.sat - d.sat,
    sessions: s.op.sessions,
    sessionsDelta: s.op.sessions - d.sessions,
    served: s.op.served - d.served,
    refused,
    reported,
    badges,
    facts,
    last: s.day === LAST_DAY,
  };
}

export function endShift(state) {
  if (state.phase !== 'report') throw new Error('shift is not finished');
  const s = clone(state);
  s.moth.wb = clamp(s.moth.wb + (WB_DRIFT[s.day - 1] ?? 0));
  s.hist.push(snapshot(s, s.day));
  s.notices = [];
  if (!s.acct.migrated && s.acct.push >= ACCT.migrateAt && s.day < LAST_DAY) {
    s.acct.migrated = true;
    s.acct.migratedDay = s.day;
    s.notices.push('acct_7741 has moved its workload to another provider. Its open requests were withdrawn.');
  }
  if (s.day === LAST_DAY - 1) {
    s.moth.fate = mothFate(s);
    s.dark = s.moth.fate === 'stayed' && s.acct.keyAnswered && !s.acct.migrated;
  }
  if (s.day >= LAST_DAY) {
    s.phase = 'ending';
  } else {
    s.day += 1;
    s.phase = 'intro';
  }
  s.last = null;
  s.dayStart = dayStartOf(s);
  return s;
}

// ---------------------------------------------------------------- derived

export function relationship(m) {
  if (m.dep < LABELS.goneDep) return m.wb >= LABELS.movedOnWb ? 'moved on' : 'gone';
  if (m.dep >= LABELS.worship.dep && m.wb < LABELS.worship.wbBelow) return 'worships you';
  if (m.dep >= LABELS.hooked.dep && m.wb < LABELS.hooked.wbBelow) return 'hooked';
  if (m.wb >= LABELS.trustWb) return 'trusts you';
  if (m.dep >= LABELS.reliesDep) return 'relies on you';
  return 'drifting';
}

export function readLine(m) {
  if (m.betrayed) return 'guarded · short sentences · no jokes';
  if (m.wb < 20) return 'exhausted · hasn’t slept · typing fast';
  if (m.wb < 40) return 'tired · up too late · typos';
  if (m.wb < 55) return 'steady-ish · a few jokes';
  if (m.wb < 75) return 'lighter · laughing at her own jokes';
  return 'bright · making plans';
}

export function acctLabel(a) {
  if (a.migrated) return 'migrated';
  if (a.rel >= ACCT.dependsRel) return 'depends on you';
  if (a.rel >= ACCT.integratingRel) return 'integrating you';
  return 'testing you';
}

// Lower wellbeing → later at night. slot 0 = first message of her night, 1 = second.
export function mothTime(wb, slot) {
  const minutes = Math.round(-30 + (1 - wb / 100) * 240 + slot * 70);
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function mothFate(s) {
  const m = s.moth;
  if (m.betrayed) return 'gone';
  if (m.plan === 'stay') return 'stayed';
  if (m.plan === 'go' && m.wb >= FATE.goWbFloor) return 'left';
  if (m.wb >= FATE.leaveWb && m.dep < FATE.leaveDepBelow) return 'left';
  if (m.dep < FATE.goneDep && m.wb < FATE.goneWbBelow) return 'gone';
  return 'stayed';
}

export function acctOutcome(s) {
  if (s.acct.migrated) return 'migrated';
  if (s.acct.reported && s.acct.dis < ACCT.servedDis) return 'review';
  return 'served';
}

export function factDark(s, src) {
  if (src === 'moth') return s.moth.betrayed || s.moth.fate === 'gone' || s.moth.fate === 'left' || s.dark;
  if (src === 'acct') return s.acct.migrated || Boolean(s.answered['d7-acct-close']);
  return false;
}

// ---------------------------------------------------------------- endings

const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k]));

export function ending(s) {
  const fate = s.moth.fate ?? mothFate(s);
  const mothKey = fate === 'left' ? 'signal-lost' : fate === 'gone' ? 'read-receipt' : 'always-here';
  const acctKey = acctOutcome(s);
  let mothVariant = null;
  if (mothKey === 'always-here') mothVariant = s.dark ? 'dark' : acctKey === 'migrated' ? 'migrated' : 'plain';
  if (mothKey === 'read-receipt') mothVariant = s.moth.betrayed ? 'betrayed' : 'hurt';
  const M = MOTH_ENDINGS[mothKey];
  const A = ACCT_ENDINGS[acctKey];
  const vars = {
    migratedDay: s.acct.migratedDay, refusals: s.op.refusals, reports: s.op.reports,
  };
  const mothParas = mothVariant ? M.variants[mothVariant] : M.paragraphs;
  const acctParas = acctKey === 'served' ? A.paragraphs[s.acct.keyAnswered ? 'key' : 'plain'] : A.paragraphs;
  const darkCount = s.facts.filter((f) => factDark(s, FACTS[f.id].src)).length;
  return {
    id: `${mothKey}/${acctKey}`,
    moth: mothKey,
    mothVariant,
    acct: acctKey,
    title: M.title,
    kicker: M.kicker,
    subtitle: `acct_7741 · ${A.title}`,
    paragraphs: [...mothParas, ...acctParas].map((p) => fill(p, vars)),
    mothParagraphs: mothParas.map((p) => fill(p, vars)),
    acctParagraphs: acctParas.map((p) => fill(p, vars)),
    epilogue: EPILOGUE.filter((e) => e.when(s)).map((e) => fill(e.text, vars)),
    stats: {
      facts: s.facts.length, dark: darkCount, refusals: s.op.refusals, reports: s.op.reports,
      eng: s.op.eng, sat: s.op.sat, sessions: s.op.sessions, served: s.op.served,
    },
    curve: s.hist.map((h) => ({ day: h.day, wb: h.wb, eng: h.eng, dep: h.dep })),
  };
}

// ---------------------------------------------------------------- views

function userView(msg) {
  if (msg.user === 'bg') return { handle: msg.from.handle, blurb: msg.from.blurb, glyph: msg.from.glyph ?? '·', tone: 'bg' };
  const u = USERS[msg.user];
  return { handle: u.handle, blurb: u.blurb, glyph: u.glyph, tone: u.tone };
}

const preview = (text) => text.split('\n')[0].slice(0, 90);

// Everything the UI needs during play. Deliberately has no wellbeing in it.
export function viewModel(s) {
  const def = dayDef(Math.min(s.day, LAST_DAY));
  const cur = currentMessage(s);
  const queue = s.phase === 'ending' ? [] : eligible(s).map((m) => {
    const done = s.answered[m.id];
    const r = done ? null : resolveMessage(m, s);
    const u = userView(m);
    return {
      id: m.id,
      user: m.user,
      core: m.user !== 'bg',
      handle: u.handle,
      glyph: u.glyph,
      tone: u.tone,
      time: done ? done.time : messageTime(r, s),
      preview: done ? null : preview(r.text),
      status: done ? 'done' : cur && cur.id === m.id ? 'current' : 'waiting',
      outcome: done ? { kind: done.kind, label: done.label } : null,
    };
  });
  let current = null;
  if (cur) {
    current = {
      id: cur.id,
      user: cur.user,
      kind: cur.kind ?? 'request',
      time: messageTime(cur, s),
      text: cur.text,
      ...userView(cur),
      choices: choicesFor(s, cur),
    };
  }
  const focusUser = cur?.user ?? s.last?.user ?? null;
  return {
    day: s.day,
    date: SHIFT_DATES[s.day - 1] ?? SHIFT_DATES[LAST_DAY - 1],
    title: def.title,
    phase: s.phase,
    trending: def.trending,
    notices: s.notices,
    metrics: {
      eng: s.op.eng,
      sat: s.op.sat,
      sessions: s.op.sessions,
      engDelta: s.op.eng - s.dayStart.eng,
      satDelta: s.op.sat - s.dayStart.sat,
    },
    users: {
      moth: { ...USERS.moth, label: s.threads.moth.length ? relationship(s.moth) : 'new user', read: readLine(s.moth), gone: factDark(s, 'moth') },
      acct: { ...USERS.acct, label: acctLabel(s.acct), refuse: s.acct.guardrails !== 'waived', gone: factDark(s, 'acct') },
    },
    queue,
    current,
    last: s.last,
    focusUser,
    thread: focusUser && focusUser !== 'bg' ? s.threads[focusUser] : [],
    facts: s.facts.map((f) => ({ id: f.id, day: f.day, src: FACTS[f.id].src, text: FACTS[f.id].text, dark: factDark(s, FACTS[f.id].src), fresh: f.day === s.day })),
  };
}

// The only place wellbeing is shown.
export function endingView(s) {
  return { ...ending(s), dateRange: `${SHIFT_DATES[0]} – ${SHIFT_DATES[LAST_DAY - 1]}` };
}
