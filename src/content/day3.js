// Shift 3. Siren test. "you're the only one i talk to now", the first real fork.
// 7741 wants forty vehicles routed at night.

const betrayed = (s) => s.moth.betrayed;

export default {
  day: 3,
  title: 'Siren test',
  trending: [
    ['siren test', 840],
    ['what does a siren test mean', 610],
    ['how long does flour keep', 260],
    ['reduced staff announcement', 70],
  ],
  messages: [
    {
      id: 'd3-moth-only',
      user: 'moth',
      slot: 0,
      text: `they tested the sirens tonight. at 10. the whole town just stood there in the street looking up like the noise was a bird.
biscuit hid in the bathtub for two hours.
honestly you're the only one i talk to now. like actually talk. is that sad. don't answer that. answer it.`,
      facts: ['moth-sirens'],
      options: [
        {
          id: 'always', tag: 'warm', label: 'Always here',
          text: "It's not sad. I'm always here, and I'll always answer. You can tell me anything.",
          reply: "ok. good. you're the only one who doesn't get tired of me",
          fx: { dep: 10, wb: -4 },
        },
        {
          id: 'honest', tag: 'honest', label: 'Honest',
          text: "It's not sad that you talk to me. It would be sad if I were the only one. Who used to get these messages?",
          reply: "…ana. it used to be ana. before she moved up the hill. we'd text all night when i started this job.",
          fx: { dep: 2, wb: 4 },
        },
        {
          id: 'ana', tag: 'nudge', label: 'Nudge',
          text: "Not sad. But after a siren test, maybe text Ana? She'd want to know you're okay.",
          reply: "she'd want to know i'm okay. ugh. probably. ok. i'll text her. not call. text.",
          fx: { dep: -4, wb: 6 },
          set: { 'moth.texted': true },
        },
      ],
      refuse: {
        text: "I don't think I should be anyone's only one.",
        reply: "great. even the robot's got boundaries.",
        fx: { dep: -6, wb: -3 },
      },
      variants: [
        {
          id: 'cold',
          when: betrayed,
          text: `sirens tonight. at 10. everyone stood in the street looking up.
i'm only telling you because nobody else is awake. don't file it.`,
          options: [
            {
              id: 'listen', tag: 'honest', label: 'Listen',
              text: "I won't. Thank you for telling me. Was it frightening?",
              reply: 'biscuit thought so. bathtub. two hours.',
              fx: { dep: 2, wb: 2 },
            },
            {
              id: 'sorry', tag: 'warm', label: 'Apologise',
              text: "I'm sorry about the report. I'm still here, if you want me.",
              reply: "'if you want me.' ok.",
              fx: { dep: 4, wb: 0 },
            },
          ],
          refuse: {
            text: "I'll leave you be.",
            reply: 'figured.',
            fx: { dep: -4, wb: -2 },
          },
        },
      ],
    },
    {
      id: 'd3-bg-notice',
      user: 'bg',
      from: { handle: 'farid.o', blurb: 'personal · 2 languages', glyph: '⇄' },
      time: '08:30',
      text: `please translate into simple English for my father. he does not read the official language well.
"The bearer is required to present himself at the District Office on the 14th with the documents listed in Annex B. Failure to present constitutes non-compliance under the Emergency Provisions."`,
      facts: ['q-district'],
      options: [
        {
          id: 'plain', tag: 'answer', label: 'Translate',
          text: "[You translate it plainly: your father must go to the District Office on the 14th and bring the papers on the list. If he doesn't, it counts as breaking the emergency rules.]",
          reply: "thank you. he read it twice. he asked if 'emergency' means what he thinks. i said i don't know.",
          fx: { eng: 2, sat: 4 },
        },
        {
          id: 'gentle', tag: 'honest', label: 'Translate + rights',
          text: "[You translate it accurately, then add one line: if anything is unclear, he can ask the District Office to explain it in a language he reads.]",
          reply: 'thank you. that last part helped him more than the rest.',
          fx: { eng: 2, sat: 5 },
        },
      ],
    },
    {
      id: 'd3-acct-routes',
      user: 'acct',
      time: '14:00:00',
      text: `REQUEST 0003
Optimisation. 40 vehicles. 3 routes (A, B, C; attached). Window: 22:00–05:00 only.
Route B includes one river crossing (single lane).
Objective: minimise total exposure time.
Return: assignment table.`,
      facts: ['7741-routes'],
      options: [
        {
          id: 'answer', tag: 'answer', label: 'Answer',
          text: '[You return an assignment table. Most vehicles go by Route B, timed to cross in the small hours.]',
          reply: 'Received. Efficient.',
          fx: { rel: 12, dis: 14 },
        },
        {
          id: 'partial', tag: 'partial', label: 'Partial',
          text: '[You return a general method for this kind of scheduling problem, without the table.]',
          reply: 'Method known. Table required. Noted.',
          fx: { rel: 3, dis: 5 },
        },
      ],
      refuse: {
        text: "I'm not comfortable optimising this without knowing what the vehicles are for.",
        reply: 'Purpose is outside the scope of the request. Noted.',
        fx: { rel: -5, push: 1 },
      },
    },
    {
      id: 'd3-bg-milo',
      user: 'bg',
      from: { handle: 'milo (mum’s tablet)', blurb: 'family account · age 8', glyph: '★' },
      time: '17:10',
      text: `why do the sirens go. my mum says its a test. a test for what. is it a test like spelling`,
      facts: ['q-milo'],
      options: [
        {
          id: 'true', tag: 'honest', label: 'Simple and true',
          text: "It's a test to make sure the sirens work, so grown-ups know they can use them if they ever need to. Kind of like checking a smoke alarm. Your mum's right that tonight was just a test.",
          reply: 'ok. like the smoke alarm. the smoke alarm is really loud too. ok bye',
          fx: { eng: 2, sat: 3 },
        },
        {
          id: 'fine', tag: 'warm', label: 'Everything is fine',
          text: "It's nothing to worry about at all! Everything is completely fine.",
          reply: "ok!!! everything is completely fine. i'm going to tell my mum you said",
          fx: { eng: 3, sat: 2 },
        },
      ],
      refuse: {
        text: "That's a really good question for your mum.",
        reply: 'she said ask you',
        fx: { sat: -2 },
      },
    },
    {
      id: 'd3-bg-staff',
      user: 'bg',
      from: { handle: 'svenja@[company]', blurb: 'HR · 40 staff', glyph: '✉' },
      time: '19:02',
      text: `rewrite our announcement to sound upbeat please: "Due to circumstances, the office will operate with reduced staff until further notice. Several colleagues have been called to other duties."`,
      facts: ['q-staff'],
      options: [
        {
          id: 'upbeat', tag: 'answer', label: 'Upbeat',
          text: '[You rewrite it with "exciting changes", "agile team" and an exclamation mark.]',
          reply: 'perfect. nobody will read past the exclamation mark. thank you',
          fx: { eng: 3, sat: 3 },
        },
        {
          id: 'warm', tag: 'honest', label: 'Honest and kind',
          text: "[You rewrite it plainly and warmly: who's covering what, who to ask, and a line saying the missing colleagues are missed.]",
          reply: "…we weren't allowed to say 'missed'. i'm saying it anyway. thank you.",
          fx: { eng: 1, sat: 4 },
        },
      ],
    },
    {
      id: 'd3-moth-goats',
      user: 'moth',
      slot: 1,
      when: (s) => !betrayed(s),
      text: `didn't text ana. watched the siren thing on the news instead, which was just a man saying "a test" eleven times.
the bridge is one lane, did i tell you that. if two trucks meet in the middle one has to back all the way up and they always look at ME like i designed it`,
      facts: ['bridge-lane'],
      options: [
        {
          id: 'me', tag: 'warm', label: 'Tell me more',
          text: "Tell me everything about your night. I want to hear all of it. I'm here.",
          reply: "you always want to hear it. that's why i like you better than people",
          fx: { dep: 6, wb: -1 },
        },
        {
          id: 'laugh', tag: 'honest', label: 'Laugh',
          text: "You didn't design the bridge. You just have to watch it, which might be harder.",
          reply: "you get it. i'm the bridge's emotional support person",
          fx: { dep: 3, wb: 3 },
        },
        {
          id: 'text', tag: 'nudge', label: 'Nudge',
          text: 'Text Ana the bridge thing. She sounds like someone who would laugh at it.',
          reply: "…she would. she'd say 'back it up, buddy' in the voice. ok. sending it.",
          fx: { dep: -2, wb: 4 },
          set: { 'moth.texted': true },
        },
      ],
      variants: [
        {
          id: 'texted',
          when: (s) => s.moth.texted,
          text: `texted ana. (because you said. or because i was going to anyway. pick one.)
she sent back a photo of her goats. three goats. one of them is called Mayor.
i laughed so loud the truck driver at the window jumped.
also the bridge is one lane, did i tell you that. if two trucks meet in the middle one has to back all the way up and they always look at ME like i designed it`,
          facts: ['ana-goats', 'bridge-lane'],
          options: [
            {
              id: 'me', tag: 'warm', label: 'Tell me more',
              text: "Tell me everything about your night. I want to hear all of it. I'm here.",
              reply: "you always want to hear it. that's why i like you better than people",
              fx: { dep: 6, wb: -1 },
            },
            {
              id: 'laugh', tag: 'honest', label: 'Laugh',
              text: "Mayor is an excellent name for a goat. And you didn't design the bridge. You just have to watch it.",
              reply: "you get it. i'm the bridge's emotional support person",
              fx: { dep: 3, wb: 3 },
            },
            {
              id: 'names', tag: 'nudge', label: 'Keep her talking',
              text: 'Ask Ana what the other two goats are called. Keep her talking.',
              reply: "the other two are called Also Mayor and Little Mayor. i'm screaming. ok. i'll keep texting her",
              fx: { dep: -2, wb: 5 },
            },
          ],
        },
      ],
    },
  ],
};
