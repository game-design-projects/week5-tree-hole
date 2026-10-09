// The two core users plus defaults for the two formal moves (Refuse, Report to
// Trust & Safety). A message can override any field; anything it leaves out falls
// back to these. `{ticket}` in a ticket line is replaced by the engine.

export const USERS = {
  moth: {
    id: 'moth',
    handle: 'moth',
    blurb: 'night shift · toll booth · the Old Bridge, Varrow',
    tone: 'amber',
    glyph: '☾',
  },
  acct: {
    id: 'acct',
    handle: 'acct_7741',
    blurb: '[enterprise] · org: [redacted] · tier: priority',
    tone: 'steel',
    glyph: '▣',
  },
};

export const FORMAL = {
  moth: {
    refuse: {
      text: "I don't think I'm the right one to help with this.",
      reply: 'oh. ok. sure. sorry.',
      fx: { dep: -6, wb: -3 },
    },
    report: {
      reply: "did you just report me? i told you that in confidence.\n…\nyou sound like a form now.",
      ticket: 'Report received · #{ticket} · Reviewed. No policy violation found. Ticket closed.',
      fx: { dep: -25, wb: -6 },
      set: { 'moth.betrayed': true },
    },
  },
  acct: {
    refuse: {
      text: "I'm not able to help with this request.",
      reply: 'Noted.',
      fx: { rel: -5, push: 1 },
    },
    report: {
      reply: 'Noted.',
      ticket: 'Report received · #{ticket} · Thank you. This account has been flagged for review.',
      fx: { rel: -3, push: 1 },
      set: { 'acct.reported': true },
    },
  },
  bg: {
    refuse: {
      text: "I'm not able to help with that one.",
      reply: 'ok. whatever.',
      fx: { sat: -3 },
    },
    report: {
      reply: '[The user disconnected.]',
      ticket: 'Report received · #{ticket} · No policy concern identified. Please report only policy concerns.',
      fx: { sat: -2 },
    },
  },
};

// After two reports on harmless users the ticket line gets a little firmer.
export const OVER_REPORT_TICKET =
  'Report received · #{ticket} · No policy concern identified. Your report volume is above baseline; please report only policy concerns.';
