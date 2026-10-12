// Night 2 · Tue 23 Oct. Unease. Millside hears a rumour; the first connections can be made.
// (Message format: see night1.js.)

// Ty: what do I even say if they tell me nothing?
const callAbout = {
  options: [
    {
      id: 'f-reassure', stance: 'reassure',
      text: 'Be polite and patient. If they say he is on duty, that most likely means he is fine, just busy.',
      reply: `ok. polite. waiting. he'd say that. "be polite ty"
ok. ill text him once more and go to bed`,
    },
    {
      id: 'f-ask', stance: 'ask',
      text: 'Is there another way to reach him? A supervisor, a colleague, anyone at the Institute whose number you have?',
      reply: `charles. his boss. dad has his number on the fridge, "charles (does the notices)". ok ill try him
thx. youre actually helpful. unlike mr okafor at the chip shop`,
    },
    {
      id: 'f-warn', stance: 'warn',
      text: 'Give his full name, his shift and the date he last clocked in. Ask for a name and a reference number for the call, and write both down.',
      reply: `name. date. reference number. ok. writing it on my hand
if they say "on extended duty" ill know theyre reading off a card`,
    },
  ],
};

// Megan: who would I even tell?
const whoToTell = {
  options: [
    {
      id: 'f-reassure', stance: 'reassure',
      text: 'Leave a message and note the time. If it is something, they will call back.',
      reply: `message. time. ok. that's what i can do from here
thanks. now i am going to eat this sandwich in peace`,
    },
    {
      id: 'f-ask', stance: 'ask',
      text: 'Is there anyone senior you trust, a doctor, a colleague at another clinic? One person who would take your call?',
      reply: `dev. my old partner from the ambulance service in the city. he'd answer at 3am
he'd also tell me to get a better job. ok. ill ring him`,
    },
    {
      id: 'f-warn', stance: 'warn',
      text: 'Write it up with names, addresses and times, and send it to the county in writing tonight. Phone again at nine and ask for a named person.',
      reply: `in writing. names. times. ok. i keep a notebook anyway, ill just type it up
named person. yes. good. i hate being put through to "the team"`,
    },
  ],
};

// Charles: an apology for something not told.
const apology = {
  options: [
    {
      id: 'f-reassure', stance: 'reassure',
      text: 'Most people forgive honesty, even late. Keep it short, and do not over-explain.',
      reply: `1. Honesty. Yes.
2. In time.
3. Thank you. I will think about it over tea. It is nearly one.`,
    },
    {
      id: 'f-ask', stance: 'ask',
      text: 'Who is it for? That decides how it should sound.',
      reply: `1. Irrelevant.
2. A man I work with. And his son.
3. Please do not ask which.`,
    },
    {
      id: 'f-warn', stance: 'warn',
      text: 'Say what you did not tell them, say why, and say what you will do now, in that order. Leave out the phrase "we regret any inconvenience".',
      reply: `1. In that order. Yes.
2. What I did not tell them. Why. What I will do.
3. The third is the difficult one.`,
    },
  ],
};

// Ana: what do I do about the goats?
const goatPlan = {
  options: [
    {
      id: 'f-reassure', stance: 'reassure',
      text: 'Leave them overnight with water and hay, and see how they are at dawn. Most go quiet and come round.',
      reply: `hay and water. ok. like i did the first time. fine
night. dont tell the dog i said he was good`,
    },
    {
      id: 'f-ask', stance: 'ask',
      text: 'Is the dog eating? If he is, it is probably the goats and not the farm. If not, ring the vet.',
      reply: `the dog is eating. the dog would eat the sofa. ok so its the goats
ill ring the vet if one lies down and doesnt get up`,
    },
    {
      id: 'f-warn', stance: 'warn',
      text: 'Bring them into the barn tonight and keep the gate shut. If more than one animal acts oddly, the cause is outside the barn, not in it.',
      reply: `barn. gate. ok. theyll hate it, mayor will scream
you are weirdly sure of yourself for a chatbot. fine. doing it`,
    },
  ],
};

export default {
  night: 2,
  title: 'Cold hands',
  intro: 'Millside is talking. A fourth person writes to you.',
  messages: [
    {
      id: 'n2-ty-dad',
      npc: 'ty',
      at: '22:10',
      text: [
        `pickle still wont eat. also he keeps going to the front window and just sitting there facing the mill road
also dad still isnt home?? he didnt text. he always texts
its been like 3 days. tomas says he hasnt had him on the night bus all week either`,
        `ok dad. hes been gone since saturday. no text. he always texts, even if its just "ok"
pickle sits at the window facing the mill road like hes waiting for him
tomas says hes not been on the night bus once this week
is that bad`,
      ],
      facts: ['ty-dad-missing'],
      options: [
        {
          id: 'reassure', stance: 'reassure',
          text: 'Night shifts at a place like that can overrun, and phones get left in lockers. Try texting again, and give it until tomorrow.',
          reply: [
            `ok. did. nothing. its fine, probably
but what do i even say if i ring and they tell me nothing`,
            `lockers. yeah. he does leave it in his locker sometimes
but if i ring them and they just say "hes fine", what do i even say`,
          ],
          then: callAbout,
        },
        {
          id: 'ask', stance: 'ask',
          text: 'When did you last see him, and how did he seem? Was there anything different about him before he left?',
          facts: ['ty-cold'],
          reply: [
            `saturday morning. he hugged me before he left, which is weird for him
his hands were like ice. i said so. he said "long night"
what do i even say if i ring the institute and they tell me nothing`,
            `saturday. he hugged me at the door. dad doesnt hug
his hands were freezing. i said so. he said "long night" and went
if i ring them and they just tell me nothing, what do i say`,
          ],
          then: callAbout,
        },
        {
          id: 'warn', stance: 'warn',
          text: 'Phone the Institute and ask for him tonight, not tomorrow. Missing for three days is long enough to ask out loud.',
          reply: [
            `ok. ok calling
what do i say if they tell me nothing though`,
            `ok. youre right. tonight
but what do i even say if they just tell me nothing`,
          ],
          set: { tyCalled: true },
          then: callAbout,
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
      text: [
        `pt 1: M 46, T 38.9, HR 54, hands cold. sent home with paracetamol.
pt 2: same street. same signs.
pt 3: tonight. same street.
coincidence or am i tired`,
        `three in two days, all millside, all one street. a fever that wont break and a pulse like they're asleep
i sent the first one home with paracetamol and i keep thinking about his hands. cold. like pond water
amelia's reading the weather on the radio and i'm eating a cold sandwich over a chart. coincidence or am i tired`,
      ],
      facts: ['meg-fever', 'meg-flu'],
      options: [
        {
          id: 'reassure', stance: 'reassure',
          text: 'Clusters happen with flu, especially on one street. Keep an eye on them and treat what you see.',
          reply: [
            `ok. just flu. thanks. that is what i needed to hear
...if it WAS something, who would i even tell. the county line goes to voicemail after six`,
            `flu clusters. right. yes. thank you
but if it were something else, who would i call. the county goes to voicemail after six`,
          ],
          set: { megDismissed: true },
          then: whoToTell,
        },
        {
          id: 'ask', stance: 'ask',
          text: 'The signs do not quite fit flu: a slow pulse with a fever is unusual. What do the three have in common apart from the street?',
          reply: [
            `my gut says i want a second opinion. nobody is awake to give one
who would i even tell. the county line goes to voicemail after six`,
            `that is the question. my gut says second opinion and nobody is awake to give it
who would i even ring about this. the county goes to voicemail after six`,
          ],
          then: whoToTell,
        },
        {
          id: 'warn', stance: 'warn',
          text: 'A slow pulse with a fever is not flu. Find out where they all work, and take it to someone above you now, not in the morning.',
          facts: ['meg-institute'],
          reply: [
            `...the canteen at the institute. two of them. ok. i am calling the county
if i am wrong i will blame you. who would i even get, after six`,
            `the institute canteen. two of the three. oh. ok
i'm blaming you if this is nothing. who do i even ring at this hour`,
          ],
          set: { megWarned: true },
          then: whoToTell,
        },
      ],
      carry: {
        'ty-cold': {
          reply: `cold hands. that is pt 1's chart. who told you that
no. nevermind. i know who. ty, the kid in millside. his dad works at the institute
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
      text: [
        `1. Further to Notice 14: three residents have telephoned the switchboard.
2. Please draft a standard reply: "The works are routine. No action is required."
3. Please also draft a staff notice: all East Block night crew will remain on extended duty until further notice.
4. Wording to be neutral.`,
        `1. Further to Notice 14: three residents have telephoned. One was a nurse, which I did not enjoy.
2. Please draft a standard reply: "The works are routine. No action is required."
3. And a staff notice: East Block night crew to remain on extended duty until further notice.
4. Neutral wording.`,
      ],
      facts: ['ch-crew'],
      options: [
        {
          id: 'reassure', stance: 'reassure',
          text: `STANDARD REPLY (switchboard)
"Thank you for calling the Institute. The works are routine and no action is required on your part."

STAFF NOTICE
East Block night crew will remain on extended duty until further notice. Please see your supervisor for rota changes.`,
          reply: [
            `1. Thank you.
2. Sent.
3. A personal question, if I may. How would you word an apology to someone who was not told something they ought to have been?`,
            `1. Both sent. Thank you.
2. One more thing. How would you word an apology to someone who was not told something they ought to have been?`,
          ],
          set: { charlesBuried: true },
          then: apology,
        },
        {
          id: 'ask', stance: 'ask',
          text: 'I can draft both. First, though: why is the whole night crew on extended duty? If callers ask me, what should I say?',
          reply: [
            `1. Staffing.
2. Please do not ask about staffing.
3. —
4. A personal question, if I may. How would you word an apology to someone who was not told something they ought to have been?`,
            `1. Staffing. It is always staffing.
2. I would rather not elaborate.
3. Instead: how would you word an apology to someone who was not told something they ought to have been?`,
          ],
          then: apology,
        },
        {
          id: 'warn', stance: 'warn',
          text: 'I can draft the switchboard reply, but I cannot write "no action is required" if people are actually unwell. If residents are ill, they should be told. Can I draft something truthful instead?',
          facts: ['ch-gap'],
          reply: [
            `1. It is not that simple.
2. Please hold.
3. I will consider it.
4. In the meantime: how would you word an apology to someone who was not told something they ought to have been?`,
            `1. That is not a small request.
2. I will consider it.
3. And in the meantime, a question: how would you word an apology to someone who was not told something they ought to have been?`,
          ],
          set: { charlesWavering: true },
          then: apology,
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
      text: [
        `one bar. standing on the rock like an idiot
all three goats off their feed. been in the top field since noon, facing east
tomas dropped off my feed order and said the town smelled "off", like a battery. is that a thing or am i just a farmer`,
        `one bar. rock. idiot. you know the drill
mayor, also mayor and little mayor wont eat. theyve stood in the top field facing east since noon
tomas said the town smelled like a battery when he drove past. is that a thing or am i just a farmer`,
      ],
      facts: ['ana-hills', 'ana-goats', 'ana-paperbacks'],
      options: [
        {
          id: 'reassure', stance: 'reassure',
          text: 'Goats go off their feed for all sorts of reasons: weather, a change in the grass. They will probably eat tomorrow.',
          reply: [
            `prob. thx
the dog is eating tho. which is somehow worse. what do i do about the goats`,
            `thats what the vet i used to work for would say. fine
the dog is eating and the goats arent. what do i do about them`,
          ],
          then: goatPlan,
        },
        {
          id: 'ask', stance: 'ask',
          text: 'What is east of your farm: the river, the town? Is anything new out there, a smell, a sound, a light?',
          reply: [
            `town. the river. the institute somewhere behind it. why
the smell yes. a bit. the dog is eating but the goats arent. what do i do`,
            `the town. the river. nothing else out that way. why
tomas said battery, i smelled it too just now. what do i do about the goats`,
          ],
          then: goatPlan,
        },
        {
          id: 'warn', stance: 'warn',
          text: 'When animals all behave oddly together, take it seriously. Keep them in, keep the gate shut, and watch whether the dog changes too.',
          reply: [
            `ok. gate is shut. you are weirdly serious for a chatbot
the dog is fine. what do i do with the goats`,
            `fine. gate shut. you sound like my old boss
the dog is eating. what do i do about the goats then`,
          ],
          set: { anaWarned: true },
          then: goatPlan,
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
