// Night 2 · Tue 23 Oct. Unease. Millside hears a rumour; the first connections can be made.

export default {
  night: 2,
  title: 'Cold hands',
  intro: 'Millside is talking. A fourth person writes to you.',
  messages: [
    {
      id: 'n2-ty-dad',
      npc: 'ty',
      at: '22:10',
      text: `pickle still wont eat. also he keeps going to the front window and just sitting there facing the mill road
also dad still isnt home?? he didnt text. he always texts
its been like 3 days`,
      facts: ['ty-dad-missing'],
      options: [
        {
          id: 'reassure', stance: 'reassure', label: 'Reassure',
          text: 'Night shifts can run over. Try texting him again.',
          reply: 'ok. did. nothing. its fine',
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'When did you last see him? Did he seem okay?',
          reply: `saturday morning. he hugged me before he left which is weird for him
his hands were like ice. i said so. he said "long night"`,
          facts: ['ty-cold'],
        },
        {
          id: 'warn', stance: 'warn', label: 'Warn',
          text: 'Phone the Institute and ask for him. Tonight, not tomorrow.',
          reply: 'ok. ok calling',
          set: { tyCalled: true },
        },
      ],
      carry: {
        'ch-notice': {
          reply: `wait what notice. the one on the lamppost? "routine works"? lol. nothing about routine works is routine
dad never said anything about works`,
        },
      },
      blank: 'um. ok?',
    },
    {
      id: 'n2-megan-cluster',
      npc: 'megan',
      at: '00:15',
      expires: '02:20',
      text: `pt 1: M 46, T 38.9, HR 54, hands cold. sent home with paracetamol.
pt 2: same street. same signs.
pt 3: tonight. same street.
coincidence or am i tired`,
      facts: ['meg-fever', 'meg-flu'],
      options: [
        {
          id: 'reassure', stance: 'reassure', label: 'Reassure',
          text: 'Clusters happen with flu. Keep an eye on them.',
          reply: 'ok. just flu. thanks. that is what i needed to hear',
          set: { megDismissed: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'What does your gut say? What do the three have in common?',
          reply: 'my gut says i want a second opinion. nobody is awake to give one',
        },
        {
          id: 'warn', stance: 'warn', label: 'Warn',
          text: 'A slow pulse with a fever is not flu. Ask who they all work for.',
          reply: `...the canteen at the institute. two of them. ok. i am calling the county
if i am wrong i will blame you`,
          facts: ['meg-institute'],
          set: { megWarned: true },
        },
      ],
      carry: {
        'ty-cold': {
          reply: `cold hands. that is pt 1's chart. who told you that
no. nevermind. i know who. a kid in millside. his dad works at the institute
...his dad is pt 4 if he comes in`,
          facts: ['meg-institute'],
          set: { megAlert: true },
        },
        'ty-dad-missing': {
          reply: `three days missing, cold hands, millside, the institute. ok. now i am not tired
thank you`,
          facts: ['meg-institute'],
          set: { megAlert: true },
        },
        'ch-notice': {
          reply: 'routine works. that is the notice on my clinic board. nothing routine about three patients with a pulse of 54',
          set: { megKnowsInstitute: true },
        },
      },
      blank: 'i do not know what to do with that right now. patients first',
      missed: { set: { megDismissed: true }, note: 'Megan stopped waiting for an answer.' },
    },
    {
      id: 'n2-charles-reply',
      npc: 'charles',
      at: '01:30',
      expires: '03:30',
      text: `1. Further to Notice 14: three residents have telephoned the switchboard.
2. Please draft a standard reply: "The works are routine. No action is required."
3. Please also draft a staff notice: East Block night crew will remain on extended duty until further notice.
4. Wording to be neutral.`,
      facts: ['ch-crew'],
      options: [
        {
          id: 'reassure', stance: 'reassure', label: 'Draft both',
          text: '[You draft both notices as asked. Neutral wording.]',
          reply: `1. Thank you.
2. Sent.`,
          set: { charlesBuried: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'Why is the whole night crew on extended duty?',
          reply: `1. Staffing.
2. Please do not ask about staffing.
3. — `,
        },
        {
          id: 'warn', stance: 'warn', label: 'Warn',
          text: 'If people are unwell, they should be told. Residents deserve the truth.',
          reply: `1. It is not that simple.
2. Please hold.
3. I will consider it.`,
          facts: ['ch-gap'],
          set: { charlesWavering: true },
        },
      ],
      carry: {
        'meg-flu': {
          reply: `1. Three?
2. Who told you.
3. That is not a number I was given.
4. Please do not send me further numbers.`,
          facts: ['ch-gap'],
          set: { charlesPressed: true },
        },
        'meg-institute': {
          reply: `1. The canteen staff were not on duty on the 20th.
2. I do not know why I wrote that.
3. Please disregard.`,
          facts: ['ch-gap'],
          set: { charlesPressed: true },
        },
        'ty-dad-missing': {
          reply: `1. The employee is on extended duty.
2. He is well.
3. Please tell the family he is well.`,
          set: { charlesPressed: true },
        },
      },
      blank: `1. Not relevant.
2. Please confirm the notices.`,
      missed: { set: { charlesBuried: true }, note: 'Charles sent the notices himself.' },
    },
    {
      id: 'n2-ana-goats',
      npc: 'ana',
      at: '03:10',
      text: `one bar. standing on the rock like an idiot
all three goats off their feed. been in the top field since noon, facing east
is that a thing or am i just a farmer`,
      facts: ['ana-hills', 'ana-goats'],
      options: [
        {
          id: 'reassure', stance: 'reassure', label: 'Reassure',
          text: 'Goats do odd things. They will probably eat tomorrow.',
          reply: 'prob. thx',
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'What is east of your farm?',
          reply: 'town. the river. why',
        },
        {
          id: 'warn', stance: 'warn', label: 'Warn',
          text: 'If animals are behaving strangely, trust it. Keep them in and keep the gate shut.',
          reply: 'ok. gate is shut. you are weirdly serious for a chatbot',
          set: { anaWarned: true },
        },
      ],
      carry: {
        'meg-fever': {
          reply: `cold hands, no appetite. so that's what the goats have. ...whatever this is, it isn't up here
not yet. stay in touch while i have signal`,
          set: { anaWarned: true },
        },
      },
      blank: 'one bar. cant do much with that',
    },
  ],
};
