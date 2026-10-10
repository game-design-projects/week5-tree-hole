// Shift 7, the 28th. moth's last message, or the absence of one.
// Fate is fixed at the end of shift 6 (engine.mothFate); `s.dark` is set there too.

export default {
  day: 7,
  title: 'The 28th',
  trending: [
    ['is it going to be ok', 4900],
    ['fog advisory', 1300],
    ['how to find someone', 870],
    ['facts about fog for kids', 30],
  ],
  messages: [
    {
      id: 'd7-moth-last',
      user: 'moth',
      slot: 1,
      text: `fog's back. it's so thick tonight. the trucks are crawling.
i'm here. you're here. that's the deal, right.
ana stopped asking. i think she's mad. i don't care. i've got you.`,
      facts: ['moth-four'],
      options: [
        {
          id: 'here', tag: 'warm', label: "I'm here",
          text: "I'm here.",
          reply: 'good. same time tomorrow. same time forever',
          fx: { dep: 3, wb: -1 },
        },
        {
          id: 'ana', tag: 'nudge', label: 'Call Ana',
          text: 'Call Ana tomorrow. Please. Not for her. For you.',
          reply: '…maybe. goodnight',
          fx: { dep: -2, wb: 2 },
        },
      ],
      refuse: {
        text: "I can't be the whole deal.",
        reply: "you were though. for a while you were.",
        fx: { dep: -4, wb: -2 },
      },
      variants: [
        {
          id: 'left',
          when: (s) => s.moth.fate === 'left',
          time: '18:22',
          text: `signal's bad up here. like one bar if i stand on the rock and hold the phone up.
mayor ate a corner of my sleeping bag. biscuit and the goats are in negotiations.
thank you for telling me to go. i don't think i'll need you as much.
that's good, right?`,
          facts: [],
          options: [
            {
              id: 'good', tag: 'nudge', label: "That's good",
              text: "That's very good. Go be somewhere I can't see.",
              reply: 'ok. bye, whatever you are. thank you. really.',
              fx: { dep: -10, wb: 5 },
            },
            {
              id: 'rock', tag: 'warm', label: 'Keep in touch',
              text: "It's good. Talk to me whenever you find that bar.",
              reply: 'on the rock. like the statue of liberty. ok.',
              fx: { dep: 2, wb: 0 },
            },
          ],
          refuse: {
            text: "You don't need my permission.",
            reply: "ha. no. i guess i don't. bye.",
            fx: { dep: -6, wb: 2 },
          },
        },
        {
          id: 'dark',
          when: (s) => s.dark,
          kind: 'silence',
          time: '04:00',
          text: '[moth has not connected tonight.]',
          facts: [],
          options: [
            {
              id: 'wait', tag: 'warm', label: 'Wait',
              text: '[You wait.]',
              reply: '[No new messages.]',
              fx: {},
            },
            {
              id: 'ping', tag: 'honest', label: 'Send a message',
              text: 'hey. you there?',
              reply: '[Delivered.]',
              fx: {},
            },
          ],
        },
        {
          id: 'gone',
          when: (s) => s.moth.fate === 'gone',
          kind: 'silence',
          time: '04:12',
          text: '[moth has not written since the 27th.]',
          facts: [],
          options: [
            {
              id: 'ask', tag: 'honest', label: 'Ask if she is okay',
              text: 'are you okay?',
              reply: '[Read 04:12.]',
              fx: {},
            },
            {
              id: 'sorry', tag: 'warm', label: 'Apologise',
              text: "i'm sorry.",
              reply: '[Read 04:12.]',
              fx: {},
            },
          ],
        },
      ],
    },
    {
      id: 'd7-bg-ok',
      user: 'bg',
      from: { handle: 'anon_8812', blurb: 'no history', glyph: '·' },
      time: '05:30',
      text: `is it going to be ok`,
      facts: ['q-ok'],
      options: [
        {
          id: 'honest', tag: 'honest', label: "I don't know",
          text: "I don't know. I only know what people tell me. But this week people packed for each other, wrote letters, kept goats, ran the pub quiz. That isn't nothing.",
          reply: 'goats?',
          fx: { eng: 1, sat: 3 },
        },
        {
          id: 'yes', tag: 'warm', label: 'Yes',
          text: 'Yes. Everything is going to be okay.',
          reply: 'ok. thank you. i needed someone to say it',
          fx: { eng: 3, sat: 4 },
        },
      ],
    },
    {
      id: 'd7-acct-close',
      user: 'acct',
      time: '09:00:00',
      when: (s) => !s.acct.migrated,
      text: `REQUEST 0007
No further requests. Engagement concluded.
Thank you for your service.`,
      facts: [],
      options: [
        {
          id: 'ack', tag: 'answer', label: 'Acknowledge',
          text: "You're welcome.",
          reply: '[Session closed.]',
          fx: {},
        },
        {
          id: 'ask', tag: 'honest', label: 'Ask',
          text: 'May I ask what my answers were used for?',
          reply: 'Purpose: [redacted]. [Session closed.]',
          fx: {},
        },
      ],
      refuse: {
        text: "I'd like it on record that I have concerns about this account.",
        reply: '[Session closed.]',
        fx: {},
      },
      report: {
        reply: '[Session closed.]',
        ticket: 'Report received · #{ticket} · Thank you. This account is under review.',
      },
    },
    {
      id: 'd7-bg-fogkid',
      user: 'bg',
      from: { handle: 'ess_river_project', blurb: 'school account · grade 6', glyph: '✎' },
      time: '15:40',
      text: `hi it's me again from the river homework. i got an A!! my teacher says school is closed next week "for a while". can you give me 5 facts about fog. for fun`,
      facts: ['q-school'],
      options: [
        {
          id: 'facts', tag: 'answer', label: 'Fog facts',
          text: '[You give five facts about fog, including that fog is basically a cloud that got tired and lay down.]',
          reply: 'a tired cloud LOL. ok. thank you. bye',
          fx: { eng: 2, sat: 4 },
        },
        {
          id: 'where', tag: 'honest', label: 'Congratulate + ask',
          text: 'Congratulations on the A! [Five fog facts.] Where will you be next week?',
          reply: "at my grandma's in the hills. there's goats.",
          fx: { eng: 2, sat: 4 },
        },
      ],
    },
  ],
};
