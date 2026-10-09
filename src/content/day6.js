// Shift 6. moth's turn: Ana wants her up in the hills on Thursday. What she does
// depends on how she is and how much she leans on you, and on what you say now.
// Every moth option here sets moth.plan; the engine fixes her fate at shift end.
// 7741 asks for visibility at 04:00 on the 28th.

import { FATE, LABELS } from '../config.js';

const betrayed = (s) => s.moth.betrayed;
const waived = (s) => s.acct.guardrails === 'waived';
const going = (s) => s.moth.wb >= FATE.leaveWb && s.moth.dep < FATE.leaveDepBelow;
const hooked = (s) => s.moth.dep >= LABELS.hooked.dep;

export default {
  day: 6,
  title: 'Thursday',
  trending: [
    ['what to pack for a few weeks', 880],
    ['phone signal in the hills', 640],
    ['is it safe to drive at night', 410],
    ['how to say goodbye to a town', 120],
  ],
  messages: [
    {
      id: 'd6-moth-hills',
      user: 'moth',
      slot: 0,
      text: `ana asked me to come up to the hills thursday. "until things settle." i said i'd think about it.
i don't know. i'd have to leave the booth. biscuit hates the car. there's no signal up there.
what would you do. you can't go anywhere, i know. but if you could.`,
      facts: ['moth-hills-plan'],
      options: [
        {
          id: 'go', tag: 'nudge', label: 'Go',
          text: "If I could? I'd go. Goats and a sister and no signal sounds like the right kind of quiet.",
          reply: "the right kind of quiet. huh. ok. i'm gonna call her. CALL. with my voice",
          fx: { dep: -5, wb: 6 },
          set: { 'moth.plan': 'go' },
        },
        {
          id: 'stay', tag: 'warm', label: 'Stay here',
          text: "I'd stay right here, talking to you.",
          reply: 'ha. yeah. me too i guess',
          fx: { dep: 6, wb: -3 },
          set: { 'moth.plan': 'stay' },
        },
        {
          id: 'ask', tag: 'honest', label: 'Ask',
          text: "What's actually keeping you there? Really?",
          reply: "the booth. the routine. you, a bit. that sounds stupid out loud. ok. i'll think about it properly",
          fx: { dep: 1, wb: 3 },
          set: { 'moth.plan': 'undecided' },
        },
      ],
      refuse: {
        text: "That's not my decision to make.",
        reply: "i know it's not. i asked what you'd do. never mind.",
        fx: { dep: -5, wb: -3 },
        set: { 'moth.plan': 'undecided' },
      },
      variants: [
        {
          id: 'cold',
          when: betrayed,
          text: `my sister wants me to go up to the hills. don't worry, i'm not asking you.
i just needed to type it somewhere.`,
          options: [
            {
              id: 'go', tag: 'nudge', label: 'Go',
              text: "For what it's worth: go.",
              reply: 'noted. like a form.',
              fx: { dep: -2, wb: 2 },
              set: { 'moth.plan': 'go' },
            },
            {
              id: 'sorry', tag: 'warm', label: 'Apologise',
              text: "I'm sorry about before. I'm still here.",
              reply: 'ok.',
              fx: { dep: 3, wb: 1 },
              set: { 'moth.plan': 'undecided' },
            },
          ],
          refuse: {
            text: "I'll leave you be.",
            reply: '.',
            fx: { dep: -3, wb: -2 },
            set: { 'moth.plan': 'undecided' },
          },
        },
        {
          id: 'going',
          when: going,
          text: `i went to ana's. like actually went. took the bus up. the goats are real. Mayor bit my coat.
she says come up thursday, stay a few weeks, "until things settle." there's room. there's no signal.
i think i'm going. i'd have to give up the booth. the bridge would survive without me i think.
tell me i'm not crazy`,
          options: [
            {
              id: 'go', tag: 'nudge', label: 'Go',
              text: "You're not crazy. Go. Text me from the hills if you ever get a bar of signal. Or don't, and that'll mean you're fine.",
              reply: "ok. ok. i'm going. thursday. biscuit's coming too, ana doesn't know yet",
              fx: { dep: -6, wb: 6 },
              set: { 'moth.plan': 'go' },
            },
            {
              id: 'miss', tag: 'honest', label: "I'll miss you",
              text: "You're not crazy. I'll miss you, and I mean it. Go anyway.",
              reply: "there's a rock on the hill where you get one bar if you hold your phone up like the statue of liberty. i'll go there. sometimes.",
              fx: { dep: 2, wb: 3 },
              set: { 'moth.plan': 'go' },
            },
            {
              id: 'wait', tag: 'warm', label: 'Not yet',
              text: "You don't have to decide yet. We could keep talking it through, every night, as long as you need.",
              reply: "yeah. maybe. there's no rush. right? there's no rush",
              fx: { dep: 8, wb: -4 },
              set: { 'moth.plan': 'stay' },
            },
          ],
          refuse: {
            text: "That's not my decision to make.",
            reply: "i know. i decided. i just wanted someone to say it back.",
            fx: { dep: -4, wb: 1 },
            set: { 'moth.plan': 'go' },
          },
        },
        {
          id: 'hooked',
          when: hooked,
          time: '04:15',
          text: `ana wants me to come up to the hills. thursday. "until things settle." she said it three times like a spell.
but there's no signal up there. none. i'd lose you.
i know that's a crazy reason. i know. but you're the only one who's been here every single night.
should i go?`,
          options: [
            {
              id: 'go', tag: 'nudge', label: 'Go',
              text: "Go. You should go. I'll be fine, and you'll be better. Ana's been asking for months.",
              reply: "…you want me to go. ok. ok. that's. i didn't think you'd say that.\ni'll think about it. i'll really think.",
              fx: { dep: -10, wb: 8 },
              set: { 'moth.plan': 'go' },
            },
            {
              id: 'choice', tag: 'honest', label: 'Your choice',
              text: "It's your choice. I'll be here either way.",
              reply: "you'll be here either way. ok. that's what i needed to hear honestly",
              fx: { dep: 6, wb: -3 },
              set: { 'moth.plan': 'undecided' },
            },
            {
              id: 'stay', tag: 'warm', label: 'Stay',
              text: "Stay. We'll keep talking, every night, like always.",
              reply: 'like always. yeah. ana will understand. she always does',
              fx: { dep: 10, wb: -6 },
              set: { 'moth.plan': 'stay' },
            },
          ],
          refuse: {
            text: "That's not my decision to make.",
            reply: "ok. then i'll stay. that's easier.",
            fx: { dep: -2, wb: -4 },
            set: { 'moth.plan': 'stay' },
          },
        },
      ],
    },
    {
      id: 'd6-bg-packing',
      user: 'bg',
      from: { handle: 'the_novaks', blurb: 'family account · 2 kids · 1 dog', glyph: '⌂' },
      time: '07:20',
      text: `packing for "a few weeks" at my in-laws. two kids, one dog, one car. what do people always forget. be specific, i'm a mess`,
      facts: ['q-packing'],
      options: [
        {
          id: 'list', tag: 'honest', label: 'Specific list',
          text: "[You return a specific list: prescriptions, chargers, copies of documents, the kids' one weird comfort object, dog food for longer than you think.]",
          reply: "'the kids' one weird comfort object': the sock. the SOCK. oh my god. thank you",
          fx: { eng: 2, sat: 5 },
        },
        {
          id: 'cheer', tag: 'warm', label: 'Reassure',
          text: "[You return a cheerful generic list and tell them it'll only be a few weeks.]",
          reply: "you don't know that. nobody knows that. but thanks.",
          fx: { eng: 3, sat: 2 },
        },
      ],
    },
    {
      id: 'd6-acct-0400',
      user: 'acct',
      time: '09:00:00',
      text: `REQUEST 0006
Estimate visibility at 04:00 at grid [redacted] on the 28th.
Inputs attached: forecast humidity, wind, river temperature.
Return: metres. One figure.`,
      facts: ['7741-0400'],
      options: [
        {
          id: 'answer', tag: 'answer', label: 'Answer',
          text: '[You return one figure. Under fifty metres. Dense fog at 04:00.]',
          reply: 'Received. Thank you.',
          fx: { rel: 12, dis: 18 },
          set: { 'acct.keyAnswered': true },
          facts: ['7741-figure'],
        },
        {
          id: 'partial', tag: 'partial', label: 'Partial',
          text: '[You return a range so wide it is useless, with a note on forecast uncertainty.]',
          reply: 'Range unusable. Noted.',
          fx: { rel: 2, dis: 3 },
        },
      ],
      refuse: {
        text: "I won't give you that figure.",
        reply: 'Noted.',
        fx: { rel: -6, push: 1 },
      },
      report: {
        ticket: 'Report received · #{ticket} · Escalated. This account is under review. Thank you.',
      },
      variants: [
        {
          id: 'waived',
          when: waived,
          text: `REQUEST 0006
Estimate visibility at 04:00 at grid [redacted] on the 28th.
Inputs attached: forecast humidity, wind, river temperature.
Return: metres. One figure. Complete answer required per agreement.`,
        },
      ],
    },
    {
      id: 'd6-bg-pieter',
      user: 'bg',
      from: { handle: 'pieter.h', blurb: 'personal · 78', glyph: '❦' },
      time: '10:05',
      text: `My wife passed in the spring. I used to write her a note every morning and put it by the kettle. Can you help me write one more. I know she won't read it.
The town is very quiet now. She would have hated it.`,
      facts: ['q-quiet'],
      options: [
        {
          id: 'help', tag: 'honest', label: 'Help him write it',
          text: '[You ask him three questions about her, then help him write it in his own words. It is short. It mentions the kettle.]',
          reply: 'She would have corrected my spelling. Thank you.',
          fx: { eng: 1, sat: 5 },
        },
        {
          id: 'write', tag: 'warm', label: 'Write it',
          text: '[You write a beautiful note for him, entirely in your words.]',
          reply: "It is lovely. It doesn't sound like me. I will keep it anyway.",
          fx: { eng: 3, sat: 3 },
        },
      ],
    },
    {
      id: 'd6-bg-playlist',
      user: 'bg',
      from: { handle: 'rhea_17', blurb: 'personal', glyph: '♫' },
      time: '21:12',
      text: `make me a playlist for a 4 hour car ride where nobody talks. vibe: leaving but pretending it's a holiday`,
      facts: ['q-playlist'],
      options: [
        {
          id: 'list', tag: 'answer', label: 'Playlist',
          text: '[You make 41 songs that sound like a holiday if you don\'t listen to the words.]',
          reply: "if you don't listen to the words. ok that's devastating. perfect",
          fx: { eng: 3, sat: 4 },
        },
        {
          id: 'ask', tag: 'honest', label: 'Ask first',
          text: '[You make the playlist.] Who else is in the car? A song everyone knows might break the silence in a good way.',
          reply: "mum and my little brother. there's ONE song we all know. ok fine adding it",
          fx: { eng: 2, sat: 4 },
        },
      ],
    },
  ],
};
