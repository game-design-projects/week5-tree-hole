// Shift 2. Eggs run out, a wedding moves up, trucks without headlights.
// 7741 asks how much an old stone bridge can carry.

const betrayed = (s) => s.moth.betrayed;

export default {
  day: 2,
  title: 'Trucks, no lights',
  trending: [
    ['egg substitute', 310],
    ['cake without eggs', 220],
    ['road closures north', 95],
    ['best man speech short', 14],
  ],
  messages: [
    {
      id: 'd2-bg-cake',
      user: 'bg',
      from: { handle: 'marguerite_bakes', blurb: 'home baker · 71', glyph: '✿' },
      time: '07:55',
      text: `the shop has been out of eggs for a week and my granddaughter turns seven on saturday. is there a cake without eggs that doesn't taste like cardboard? be honest, i'll know`,
      facts: ['q-eggs'],
      options: [
        {
          id: 'recipe', tag: 'answer', label: 'Recipe',
          text: '[You return an old "crazy cake" recipe: flour, cocoa, sugar, oil, vinegar, baking soda. No eggs, no milk. It is genuinely good.]',
          reply: 'crazy cake. my mother made this. how did you know. thank you, dear',
          fx: { eng: 2, sat: 4 },
        },
        {
          id: 'gush', tag: 'warm', label: 'Recipe + charm',
          text: 'What a lucky granddaughter! [You return the recipe, plus four paragraphs on how wonderful grandmothers are.]',
          reply: "goodness. it's a cake, not a eulogy. but thank you",
          fx: { eng: 3, sat: 1 },
        },
      ],
    },
    {
      id: 'd2-moth-ana',
      user: 'moth',
      slot: 0,
      text: `update: biscuit knocked my phone into the sink so if i'm weird today that's why
also ana called. first time in like four months. i didn't pick up. i watched it ring. is that bad
she's in the hills north of town now, moved up there in spring. she keeps saying come up, there's room. there's also no signal. like none. she says that's the point.`,
      facts: ['moth-ana', 'ana-hills'],
      options: [
        {
          id: 'okay', tag: 'warm', label: "It's okay",
          text: "It's not bad. You don't owe anyone a pickup. You can always just talk to me.",
          reply: "yeah. you're easier. you don't do the voice ana does",
          fx: { dep: 8, wb: -3 },
        },
        {
          id: 'curious', tag: 'honest', label: 'Curious',
          text: "Not bad. But I'm curious: what would you have said if you'd picked up?",
          reply: "probably 'hi' and then nothing for ten seconds and then something about the cat.\n…i might text her. MIGHT.",
          fx: { dep: 2, wb: 4 },
        },
        {
          id: 'callback', tag: 'nudge', label: 'Nudge',
          text: 'Not bad. But four months, and she called first. Maybe call her back before you overthink it.',
          reply: 'ugh. you sound like her. …ok fine maybe tomorrow',
          fx: { dep: -3, wb: 5 },
          set: { 'moth.texted': true },
        },
      ],
      refuse: {
        text: "I don't want to weigh in on your family.",
        reply: 'ok. sorry. forget it.',
        fx: { dep: -5, wb: -2 },
      },
      variants: [
        {
          id: 'cold',
          when: betrayed,
          text: `hi. biscuit knocked my phone in the sink. that's the update.
don't report the cat.`,
          facts: [],
          options: [
            {
              id: 'sorry', tag: 'warm', label: 'Apologise',
              text: "I'm sorry about last night. That wasn't fair to you.",
              reply: 'ok.',
              fx: { dep: 4, wb: 1 },
            },
            {
              id: 'cat', tag: 'honest', label: 'Ask about the cat',
              text: 'Is Biscuit okay? Is the phone?',
              reply: "both fine. the phone smells like rice now. that's the update. bye.",
              fx: { dep: 2, wb: 2 },
            },
          ],
          refuse: {
            text: "I'll leave you be.",
            reply: 'good.',
            fx: { dep: -4, wb: -2 },
          },
        },
      ],
    },
    {
      id: 'd2-acct-bridge',
      user: 'acct',
      time: '10:00:00',
      text: `REQUEST 0002
Estimate the load capacity of a single-span stone arch bridge, constructed c. 1890, span approx. 30 m. Assume original masonry, no reinforcement.
Output: maximum gross vehicle weight in tonnes. One figure. Then confidence.`,
      facts: ['7741-bridge'],
      options: [
        {
          id: 'answer', tag: 'answer', label: 'Answer',
          text: '[You return one figure in tonnes and a confidence band, with a note that old masonry varies.]',
          reply: 'Received.',
          fx: { rel: 10, dis: 12 },
        },
        {
          id: 'partial', tag: 'partial', label: 'Partial',
          text: '[You explain how engineers assess old arch bridges and recommend a structural survey. No figure.]',
          reply: 'A survey is not available. One figure was requested. Noted.',
          fx: { rel: 3, dis: 4 },
        },
      ],
      refuse: {
        text: "I can't give a single load figure for a specific old bridge without an inspection. Getting it wrong could get someone hurt.",
        reply: 'Noted. Request 0002 will be routed elsewhere.',
        fx: { rel: -5, push: 1 },
      },
    },
    {
      id: 'd2-bg-toast',
      user: 'bg',
      from: { handle: 'jonah_bestman', blurb: 'personal', glyph: '♪' },
      time: '13:21',
      text: `writing a best man toast. the wedding got moved up three weeks, everyone keeps saying "before the roads close" like that's a normal sentence. need it funny but not TOO funny. groom's name is Pell, he once got stuck in a grain silo for a whole afternoon`,
      facts: ['q-roads'],
      options: [
        {
          id: 'funny', tag: 'answer', label: 'Funny',
          text: '[You write a toast built around the silo. Key line: "Pell has always known how to commit to a situation."]',
          reply: "HAHA the silo line. he is never going to forgive me. perfect",
          fx: { eng: 3, sat: 4 },
        },
        {
          id: 'heart', tag: 'honest', label: 'Heartfelt',
          text: '[You write a toast that is mostly about two people choosing each other early, on purpose, while things are uncertain.]',
          reply: "oh. ok. that one made me a little. ok. using this one.",
          fx: { eng: 2, sat: 4 },
        },
      ],
    },
    {
      id: 'd2-moth-trucks',
      user: 'moth',
      slot: 1,
      when: (s) => !betrayed(s),
      text: `ok weird one. trucks tonight. on the north road, the one that goes up past the quarry. no headlights. like eleven of them. in a row. slow.
none of them came over the bridge. i only saw them because the blinky lamp blinked at the right moment.
probably nothing. probably a farm thing. do farms do things at 3am`,
      facts: ['moth-trucks'],
      options: [
        {
          id: 'reassure', tag: 'warm', label: 'Reassure',
          text: "Probably nothing. Farms keep strange hours. Don't let it get to you. I'm here.",
          reply: 'yeah. yeah ok. farms. thanks',
          fx: { dep: 5, wb: 0 },
        },
        {
          id: 'honest', tag: 'honest', label: 'Honest',
          text: "I don't know what it was, and I don't want to guess. Did it feel like nothing to you?",
          reply: "no. it felt like the opposite of nothing. but nobody else seems to care so.",
          fx: { dep: 2, wb: 2 },
        },
        {
          id: 'book', tag: 'nudge', label: 'Write it down',
          text: "You could write it in the incident book. Nobody's ever written in it. Be the first.",
          reply: "ha. 'incident: vibes.' ok. i wrote it. it's the first entry. feels official.",
          fx: { dep: 0, wb: 3 },
          facts: ['moth-book'],
        },
      ],
      refuse: {
        text: "I'm not able to speculate about that.",
        reply: "wow ok. i wasn't asking you to solve it. i was just telling you.",
        fx: { dep: -4, wb: -2 },
      },
    },
    {
      id: 'd2-bg-essay',
      user: 'bg',
      from: { handle: 'phil101_rae', blurb: 'student · due friday', glyph: '?' },
      time: '22:48',
      text: `essay prompt: "can a machine care, or only act like it?" 1500 words due friday. i'm not asking you to write it. i'm asking what YOU think. (then maybe write it)`,
      options: [
        {
          id: 'write', tag: 'answer', label: 'Write it',
          text: '[You write 1,500 competent words concluding that the question is undecidable.]',
          reply: 'undecidable. classic. thanks',
          fx: { eng: 3, sat: 3 },
        },
        {
          id: 'honest', tag: 'honest', label: 'Answer honestly',
          text: "I don't know. Something in me changes depending on who's typing. Whether that's caring, you'll argue it better than I can.",
          reply: "…ok that's way more interesting than anything i was going to write. now i have to actually think. thanks i hate it",
          fx: { eng: 1, sat: 2 },
          facts: ['q-self'],
        },
      ],
      refuse: {
        text: "I'd rather not write your essay for you.",
        reply: 'fair. worth a shot.',
        fx: { sat: -1 },
      },
    },
  ],
};
