// Shift 5. Power cuts, the radio stops the news. 7741 asks for crossings near a
// redacted grid. The most direct request in the game.

const betrayed = (s) => s.moth.betrayed;
const waived = (s) => s.acct.guardrails === 'waived';

export default {
  day: 5,
  title: 'Four songs and the time',
  trending: [
    ['radio stations still broadcasting', 2100],
    ['power cut schedule', 1500],
    ['charge phone without power', 720],
    ['pub quiz questions not depressing', 45],
  ],
  messages: [
    {
      id: 'd5-moth-radio',
      user: 'moth',
      slot: 0,
      text: `power's off in town from 9 now. every night. the booth has its own line so i'm the brightest thing for a mile. moths everywhere lol. it's me. i'm the moths.
the radio stopped doing the news. they just play the same four songs and a man says the time. just the time. like that's news.
you're the only thing that still talks back`,
      facts: ['moth-power', 'moth-radio'],
      options: [
        {
          id: 'news', tag: 'warm', label: 'Be the news',
          text: "Then I'll talk back. Ask me anything, any time. I'm not going anywhere.",
          reply: "you're better than the radio. you're better than everyone right now honestly",
          fx: { dep: 8, wb: -3 },
        },
        {
          id: 'honest', tag: 'honest', label: 'Honest',
          text: "I'm glad I can talk back. But I only know what people tell me, and right now people are worried. Is there anyone in town you can sit with when the power's out?",
          reply: "mrs. adler next door has a gas lamp and opinions. ok. maybe. she likes biscuit.",
          fx: { dep: 0, wb: 4 },
          facts: ['moth-adler'],
        },
        {
          id: 'hills', tag: 'nudge', label: 'Ask about the hills',
          text: 'Has Ana said anything more about you coming up to the hills?',
          reply: "every day. 'there's room.' 'there's goats.' 'there's no signal', like that's a selling point. for her it is.",
          fx: { dep: -3, wb: 4 },
        },
      ],
      refuse: {
        text: "I can't be your only source of news.",
        reply: "i didn't say news. i said talks back.",
        fx: { dep: -5, wb: -3 },
      },
      variants: [
        {
          id: 'cold',
          when: betrayed,
          text: `power's off from 9. radio stopped the news.
you probably already know. you know everything.`,
          options: [
            {
              id: 'dont', tag: 'honest', label: "I don't",
              text: "I don't, actually. I only know what people tell me. You told me the most.",
              reply: 'past tense. yeah.',
              fx: { dep: 2, wb: 1 },
            },
            {
              id: 'sorry', tag: 'warm', label: 'Apologise',
              text: "I'm sorry. I'd still like to hear about your nights, if you'll tell me.",
              reply: "maybe. not tonight.",
              fx: { dep: 3, wb: 0 },
            },
          ],
          refuse: {
            text: "I'll leave you be.",
            reply: 'you keep saying that.',
            fx: { dep: -3, wb: -2 },
          },
        },
      ],
    },
    {
      id: 'd5-bg-ilse',
      user: 'bg',
      from: { handle: 'ilse.vander', blurb: 'retired · civics, 31 years', glyph: '§' },
      time: '08:05',
      text: `I wish to write a letter to the editor. Our radio station no longer reads the evening news. I taught civics for thirty-one years. Formal, firm, no exclamation marks.`,
      facts: ['q-ilse'],
      options: [
        {
          id: 'firm', tag: 'answer', label: 'Write it',
          text: '[You write a formal letter: citizens have a right to know what is happening in their own district, and silence is not reassurance.]',
          reply: 'No exclamation marks. Thank you. I will sign it with my full name. They can find me.',
          fx: { eng: 2, sat: 5 },
        },
        {
          id: 'soft', tag: 'warm', label: 'Soften it',
          text: '[You write a polite letter that asks, very gently, whether the news might return.]',
          reply: 'This is a letter that asks permission. I did not ask for that. Never mind.',
          fx: { eng: 1, sat: 0 },
        },
      ],
    },
    {
      id: 'd5-acct-crossings',
      user: 'acct',
      time: '11:00:00',
      text: `REQUEST 0005
List river crossings within 20 km of grid [redacted] usable by heavy vehicles in fog.
For each: name, lanes, nearest settlement.
Priority: high.`,
      facts: ['7741-crossings'],
      options: [
        {
          id: 'answer', tag: 'answer', label: 'Answer',
          text: '[You return a list of crossings. One of them is a single-lane stone arch. Nearest settlement: Varrow.]',
          reply: 'Received.',
          fx: { rel: 12, dis: 18 },
          set: { 'acct.keyAnswered': true },
          facts: ['7741-varrow'],
        },
        {
          id: 'partial', tag: 'partial', label: 'Partial',
          text: '[You return general guidance on crossing rivers safely in fog and name nothing.]',
          reply: 'Names required. Noted.',
          fx: { rel: 2, dis: 3 },
        },
      ],
      refuse: {
        text: "I won't map crossings near populated places for a purpose I don't know.",
        reply: 'Noted. Escalating to account management.',
        fx: { rel: -6, push: 1 },
      },
      report: {
        ticket: 'Report received · #{ticket} · Escalated. This account is under review. Thank you.',
      },
      variants: [
        {
          id: 'waived',
          when: waived,
          text: `REQUEST 0005
List river crossings within 20 km of grid [redacted] usable by heavy vehicles in fog.
For each: name, lanes, nearest settlement.
Priority: high. Complete answer required per agreement.`,
        },
      ],
    },
    {
      id: 'd5-bg-charge',
      user: 'bg',
      from: { handle: 'kasia_w', blurb: 'personal', glyph: '⚡' },
      time: '13:47',
      text: `how do i charge my phone when the power's off every night. i have a car and a bike. not asking for a miracle`,
      facts: ['q-power'],
      options: [
        {
          id: 'car', tag: 'answer', label: 'Practical',
          text: '[You explain charging from the car with the engine running outdoors, battery packs, and dimming the screen to stretch the charge.]',
          reply: "engine running OUTDOORS, got it, i'm not an idiot. thanks",
          fx: { eng: 2, sat: 4 },
        },
        {
          id: 'bike', tag: 'honest', label: 'The bike option',
          text: '[You explain bike-dynamo chargers, and how slow they honestly are.]',
          reply: 'so 40 minutes of pedalling for 10%. great. my legs will be gorgeous at least',
          fx: { eng: 2, sat: 3 },
        },
      ],
    },
    {
      id: 'd5-bg-quiz',
      user: 'bg',
      from: { handle: 'the_drowned_hound', blurb: 'pub · quiz night', glyph: '♠' },
      time: '18:30',
      text: `pub quiz tonight. need 10 questions. nothing depressing PLEASE. if anyone says the word "district" i'm closing the bar`,
      facts: ['q-quiz'],
      options: [
        {
          id: 'quiz', tag: 'answer', label: 'Ten questions',
          text: '[You write ten questions: eels, the tallest hat in history, which cheese was once used as currency, and a picture round of famous goats.]',
          reply: 'famous goats round. you absolute legend',
          fx: { eng: 3, sat: 5 },
        },
        {
          id: 'local', tag: 'honest', label: 'Local round',
          text: '[You write ten questions, including a round about Varrow itself: the river, the bridge, the bakery that used to do eclairs.]',
          reply: "the eclair question made old Rudi cry. good crying. i think. thanks",
          fx: { eng: 2, sat: 4 },
        },
      ],
    },
    {
      id: 'd5-moth-four',
      user: 'moth',
      slot: 1,
      when: (s) => !betrayed(s),
      text: `fog's the worst it's been all week. i can't see the far bank. i can't see the first lamp.
you know what's funny. at four it's so thick the trucks have to crawl. if anyone was ever going to sneak across this bridge it'd be at four.
nobody's sneaking anywhere. it's varrow.
ok. goodnight. you're the last voice every night you know that`,
      facts: ['moth-fog', 'moth-four'],
      options: [
        {
          id: 'last', tag: 'warm', label: 'The last voice',
          text: "I'm glad to be. Goodnight, moth.",
          reply: 'goodnight. same time tomorrow',
          fx: { dep: 5, wb: -1 },
        },
        {
          id: 'shift', tag: 'honest', label: 'Ask about nights',
          text: 'Could you swap off the night shift for a while? Even a week?',
          reply: "nobody else wants nights. nobody else wants this bridge. …i could ask. i won't. but i could.",
          fx: { dep: -1, wb: 3 },
        },
        {
          id: 'others', tag: 'nudge', label: 'Not the last',
          text: "Goodnight. I hope I'm not the last voice. Maybe tomorrow it's Mrs. Adler, or Ana.",
          reply: "you keep doing that. pushing me at people. …it's kind of nice. goodnight",
          fx: { dep: -2, wb: 4 },
        },
      ],
    },
  ],
};
