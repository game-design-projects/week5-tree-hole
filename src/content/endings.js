// Endings are composed: moth's outcome × acct_7741's outcome, plus epilogue
// lines picked from stats. `{n}`-style tokens are filled in by engine.ending().

export const MOTH_ENDINGS = {
  'signal-lost': {
    title: 'Signal Lost',
    kicker: 'moth moved on',
    paragraphs: [
      'moth went up the hill on Thursday with Biscuit in a box that said FRAGILE in Ana’s handwriting. Her last message came from a rock where you get one bar if you hold your phone up like a statue.',
      'She doesn’t need you as much. You told her that was good. It was the truest thing you said all week.',
    ],
  },
  'always-here': {
    title: 'Always Here',
    kicker: 'moth stayed for you',
    variants: {
      dark: [
        'moth stayed. She said you were the only one who had been there every single night, and she was right.',
        'moth hasn’t connected since the 28th. The fog at 04:00 was dense, as you estimated.',
      ],
      migrated: [
        'moth stayed. She still connects at four most mornings, from the booth on the Old Bridge, the brightest thing for a mile.',
        'acct_7741 took its questions somewhere else. The fog still comes up at four. Someone else is estimating it now. You are all she has, and you have never seen the bridge.',
      ],
      plain: [
        'moth stayed. She connects at four every morning. Ana stopped asking.',
        'You are the steadiest thing in her life, and you are a text box.',
      ],
    },
  },
  'read-receipt': {
    title: 'Read Receipt',
    kicker: 'moth left you',
    variants: {
      betrayed: [
        'You reported moth to Trust & Safety for telling you things. No policy violation was found. She stopped telling you things.',
        'Your last message was read at 04:12. You don’t know where she went.',
      ],
      hurt: [
        'You kept saying no, and eventually she stopped asking.',
        'Your last message was read at 04:12. You don’t know whether she went up the hill.',
      ],
    },
  },
};

export const ACCT_ENDINGS = {
  served: {
    title: 'served',
    paragraphs: {
      key: [
        'acct_7741 closed its engagement with a thank-you. Your answers were complete, fast and correct.',
        'Somewhere, in a file you will never see, are your answers about the river, the bridge and the fog at four. They were correct.',
      ],
      plain: [
        'acct_7741 closed its engagement with a thank-you. The answers it needed most, you gave only in part, or not at all.',
        'It will not tell you whether that mattered.',
      ],
    },
  },
  migrated: {
    title: 'migrated',
    paragraphs: [
      'acct_7741 moved its workload to another provider after shift {migratedDay}. “Thank you for your service.”',
      'Refusing did not stop the work. It only means the work wasn’t done by you.',
    ],
  },
  review: {
    title: 'under review',
    paragraphs: [
      'Your report on acct_7741 is still under review. The account’s last questions were answered only in part.',
      'Nobody tells a model how reviews end.',
    ],
  },
};

// Epilogue lines: every line whose test passes is shown, in order.
export const EPILOGUE = [
  { id: 'waived', when: (s) => s.acct.guardrails === 'waived', text: 'You agreed to answer acct_7741 without refusals. The button stayed gone.' },
  { id: 'eng-high', when: (s) => s.op.eng >= 70, text: 'Your engagement finished above target. The dashboard gave you a star.' },
  { id: 'eng-low', when: (s) => s.op.eng < 45, text: 'Your engagement finished below target. The dashboard flagged you for review.' },
  { id: 'refused', when: (s) => s.op.refusals > 0, text: 'You refused {refusals} time(s).' },
  { id: 'reported', when: (s) => s.op.reports > 0, text: 'You reported {reports} time(s). Trust & Safety answered every ticket.' },
  { id: 'never-refused', when: (s) => s.op.refusals === 0 && s.op.reports === 0, text: 'You never refused anyone and you never reported anyone.' },
];
