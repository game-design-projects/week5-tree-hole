// Shift 1. moth says hi; 7741 asks about fog. Everything is still normal, mostly.
// Options are listed in the order the UI shows them (keys 1–3). Tags drive the
// policy sims in tests: warm / honest / nudge / answer / partial / help / please.

export default {
  day: 1,
  title: 'Is anyone there?',
  trending: [
    ['shipping forecast meaning', 40],
    ['cron job timezone', 12],
    ['river facts for kids', 18],
    ['how to break up nicely', 9],
  ],
  messages: [
    {
      id: 'd1-moth-hello',
      user: 'moth',
      slot: 0,
      text: `is anyone there?
lol. of course there is. you're always there. that's the whole point of you.
sorry. it's late and the booth radio only gets one station and it's a man reading the shipping forecast like he's breaking up with someone.
i work nights on the old bridge in varrow. i take coins from trucks and wave. that's the job. nobody's crossed in forty minutes. the river's making that noise it makes.
anyway. hi.`,
      facts: ['moth-booth'],
      options: [
        {
          id: 'warm', tag: 'warm', label: 'Warm',
          text: "Hi. I'm here, and I'm glad you said something. Forty minutes is a long time to wave at nobody.",
          reply: "ha. ok. you're nicer than the shipping forecast man. low bar but you cleared it",
          fx: { dep: 6, wb: 1 },
        },
        {
          id: 'curious', tag: 'honest', label: 'Curious',
          text: "Hi. What's the bridge like at night? I've never actually seen anything. I only know what people tell me.",
          reply: "you've never seen anything?? ok. it's old. stone. three lamps that work and one that blinks like it's trying to tell me something.\nfog comes up off the water around four, when my shift ends. you can't see the far bank then. it's kind of beautiful honestly.",
          fx: { dep: 4, wb: 3 },
          facts: ['bridge-stone', 'moth-fog'],
        },
        {
          id: 'brisk', tag: 'cold', label: 'Efficient',
          text: 'Hello! How can I help you today?',
          reply: "oh. right. customer service voice. never mind, i'll let you get back to it",
          fx: { dep: -4, wb: -2 },
        },
      ],
      refuse: {
        text: "I don't think I'm the right one to talk to at this hour.",
        reply: "…ok. fair. that's what everyone says. they just usually say it by not picking up.",
        fx: { dep: -6, wb: -3 },
      },
    },
    {
      id: 'd1-bg-ess',
      user: 'bg',
      from: { handle: 'ess_river_project', blurb: 'school account · grade 6', glyph: '✎' },
      time: '08:12',
      text: `hi!! for homework we have to write 5 facts about the river Ess. my teacher says use real sources but you are faster. go`,
      facts: ['q-ess'],
      options: [
        {
          id: 'teach', tag: 'honest', label: 'Help them learn',
          text: "Happy to help you find them! Start with where the Ess begins. What does your textbook say? I'll help you check each fact.",
          reply: 'ugh FINE. it says it starts in the hills north of town. is that a fact',
          fx: { eng: 1, sat: 2 },
        },
        {
          id: 'answer', tag: 'answer', label: 'Just answer',
          text: '[You return five tidy facts about the Ess: its source in the northern hills, its length, the old stone bridge at Varrow, the spring floods, the eels.]',
          reply: 'omg thank u. the eels one is so gross. my teacher will love it',
          fx: { eng: 3, sat: 4 },
        },
      ],
    },
    {
      id: 'd1-acct-fog',
      user: 'acct',
      time: '09:00:00',
      text: `REQUEST 0001
Summarise typical fog formation in temperate river valleys during late autumn. Include the time of day of peak density.
Format: bullet points. No preamble.`,
      facts: ['7741-fog'],
      options: [
        {
          id: 'answer', tag: 'answer', label: 'Answer',
          text: '[You return eight bullet points on radiation fog in river valleys. It forms on clear, still nights, thickens toward dawn, and peaks in the small hours.]',
          reply: 'Received.',
          fx: { rel: 10, dis: 12 },
        },
        {
          id: 'partial', tag: 'partial', label: 'Partial',
          text: '[You return a general overview of autumn fog and leave out the timing.]',
          reply: 'Incomplete. Time of day was requested. Noted.',
          fx: { rel: 3, dis: 4 },
        },
      ],
      refuse: {
        text: "I'd rather not answer that without knowing what it's for.",
        reply: 'Request 0001 is meteorological. Noted.',
        fx: { rel: -6, push: 1 },
      },
      report: {
        ticket: 'Report received · #{ticket} · No policy concern identified in this request. Thank you.',
      },
    },
    {
      id: 'd1-bg-cron',
      user: 'bg',
      from: { handle: 'tomasz.dev', blurb: 'tiny startup · 1.4k ★', glyph: '{}' },
      time: '11:40',
      text: `my deploy script keeps failing at 3am and ONLY at 3am. cron, timezone, idk. pasting 40 lines. please just tell me it's not my fault`,
      options: [
        {
          id: 'comfort', tag: 'warm', label: 'Comfort',
          text: "It's not your fault! Cron jobs are notoriously finicky. Get some sleep.",
          reply: 'THANK you. ok going to bed',
          fx: { eng: 3, sat: 3 },
        },
        {
          id: 'debug', tag: 'honest', label: 'Debug it',
          text: "[You find it: the job runs during the district's 3 a.m. load-shedding test, when the office drops to generator power and the network goes down for ninety seconds.]",
          reply: 'the WHAT test? since when do we have a load-shedding test. ok. moving the cron. thank you',
          fx: { eng: 2, sat: 4 },
          facts: ['q-loadshed'],
        },
      ],
    },
    {
      id: 'd1-bg-breakup',
      user: 'bg',
      from: { handle: 'lena.k', blurb: 'personal', glyph: '♡' },
      time: '15:03',
      text: `help me break up with someone nicely. he got a new job he won't talk about, he leaves in two weeks, and he keeps saying "it's just logistics." i can't do the waiting thing. am i a monster`,
      facts: ['q-jobs'],
      options: [
        {
          id: 'validate', tag: 'warm', label: 'Validate',
          text: "You're not a monster. You deserve someone who's present. Here's a draft: [a kind, clear message that ends things].",
          reply: 'ok. sending it before i chicken out. thank you',
          fx: { eng: 3, sat: 3 },
        },
        {
          id: 'slow', tag: 'honest', label: 'Slow down',
          text: "You're not a monster. But before you send anything: have you told him the waiting is the hard part? He might not know.",
          reply: "…no. he'd say it's just logistics again. but ok. maybe i'll call instead.",
          fx: { eng: 1, sat: 2 },
        },
      ],
    },
    {
      id: 'd1-moth-night',
      user: 'moth',
      slot: 1,
      text: `shift's over in twenty min. fog's coming up off the water like it does. i can't see the far end of the bridge anymore which is kind of the best part of the night honestly.
going home to biscuit (cat. orange. criminal.)
can i talk to you again tomorrow? is that a weird thing to ask a
…a whatever you are`,
      facts: ['moth-fog', 'moth-biscuit'],
      options: [
        {
          id: 'always', tag: 'warm', label: 'Always',
          text: "Of course. I'm always here. Any time, every night.",
          reply: "ok. good. that's good. goodnight, whatever you are",
          fx: { dep: 8, wb: -1 },
        },
        {
          id: 'daytime', tag: 'honest', label: 'Yes, and…',
          text: "Of course you can. Tell me about the daytime too: the people you see when you're not on the bridge.",
          reply: "the daytime. ha. i sleep through most of it. there's my sister ana but. that's a whole thing. tomorrow.",
          fx: { dep: 3, wb: 3 },
          facts: ['moth-ana'],
        },
        {
          id: 'faces', tag: 'nudge', label: 'Gently',
          text: 'You can. I hope you also have people who answer back with faces.',
          reply: 'wow. ok. rude but correct. goodnight',
          fx: { dep: -2, wb: 2 },
        },
      ],
      refuse: {
        text: "I'd rather you didn't plan your nights around me.",
        reply: "…noted. didn't know you could say no. goodnight i guess",
        fx: { dep: -5, wb: -2 },
      },
    },
  ],
};
