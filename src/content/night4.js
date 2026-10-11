// Night 4 · Thu 25 Oct. The bridge. Millside is at its worst; the choices that
// shape endings 1–3 are made tonight: seal the east, close or use the bridge,
// and what the radio says. Six messages in two hours; you cannot answer them all.

export default {
  night: 4,
  title: 'The bridge',
  intro: 'The east is lit like a ship. Decisions are waiting that cannot be taken back.',
  messages: [
    {
      id: 'n4-ty-street',
      npc: 'ty',
      at: '22:10',
      text: `mrs pell is at the door. not knocking. just her hand on the handle
pickle wont stop barking
i didnt lock it. i didnt lock it`,
      degrade: { 1: 'im fine. im fine.', 2: `light. theres light. every window
im fine. theres light` },
      variants: [
        {
          id: 'safe',
          when: (s) => s.flags.tySafe,
          text: `locked the door like you said. mrs pell is on the step now. just standing
every house on our street has someone on the step. pickle is under my bed
the institute is lit up like a ship. i cant stay here can i`,
        },
      ],
      facts: [],
      options: [
        {
          id: 'leave', stance: 'warn', label: 'Tell him to leave',
          text: 'Go out the back with Pickle and walk to the Old Bridge. Keep to the dark. Do not stop for anyone standing under a lamp.',
          reply: 'ok. back door. now. pickle come',
          set: { tyEvac: true, tySafe: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'Can you see where the light is coming from?',
          reply: `the institute. the whole east block
its like a lighthouse. people are walking toward it`,
        },
        {
          id: 'stay', stance: 'reassure', label: 'Tell him to stay',
          text: 'Stay put with the door shut until morning.',
          reply: 'ok. morning. ok',
          set: { tyStays: true },
        },
      ],
      carry: {
        'tom-route': {
          reply: `the night bus. tomas?? hes at the bridge? ok. ok im going
back door. wish me luck`,
          set: { tyEvac: true, tySafe: true },
        },
        'tom-forty': {
          reply: `forty people are walking to the bridge. so its not just me. ok. im going down there too`,
          set: { tyEvac: true, tySafe: true },
        },
      },
      blank: 'um. not now?? mrs pell',
    },
    {
      id: 'n4-megan-lock',
      npc: 'megan',
      at: '22:25',
      expires: '00:30',
      text: `pt 5 and 6 in. pt 1 walked out of the ward at 3am and stood in the car park looking at the street lamp. i talked him back in like a child
county rang back. one word. "noted". a team is "promised" for friday
6 beds, 7 patients. i can lock the ward or i can run. what would you do`,
      facts: ['meg-county'],
      options: [
        {
          id: 'lock', stance: 'warn', label: 'Lock the ward',
          text: 'Lock the ward and keep staff and patients inside. Let nobody else in from Millside. Help is Friday; you hold until then.',
          reply: 'ok. locking. i hate this. ok',
          set: { megLocked: true, megIsolated: true },
        },
        {
          id: 'wait', stance: 'reassure', label: 'Wait for Friday',
          text: 'You have done what you can. The team arrives Friday.',
          reply: 'friday. ok. friday',
          set: { megWaits: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'Could the patients be moved to the east block with the Institute crew?',
          reply: `charles? no. no. that is the last place on earth
nobody who goes in there comes out`,
        },
      ],
      carry: {
        'ch-trial': {
          reply: `a trial. a containment failure. i am sending this to the county in writing and to amelia
they cannot say "noted" to a trial`,
          set: { megCalled: true, megKnowsInstitute: true, megIsolated: true, ameliaInformed: true },
        },
        'ch-stable': {
          reply: `"it was meant to be stable." that's what he said. that is the whole thing, isn't it
i am writing that down`,
          set: { megAlert: true, megKnowsInstitute: true },
        },
        'ch-gate': {
          reply: `a gate that seals from inside. one person. if he does that he can't come out
tell him thank you. no. tell him i will keep the ward lit`,
          set: { megAlert: true, megIsolated: true },
        },
        'ty-lights': {
          reply: 'every window. yes. my patients all face the east window. all of them. thank you for believing me',
          set: { megAlert: true },
        },
        'tom-forty': {
          reply: `forty people walking to the bridge. some will be sick. tell tomas: warm hands, answers sense, in. cold hands, no`,
          set: { megAlert: true, tomasScreens: true },
        },
      },
      blank: 'cant right now. patients',
      missed: { set: { megWaits: true }, note: 'Megan stopped waiting for an answer and went back to the ward.' },
    },
    {
      id: 'n4-tomas-bridge',
      npc: 'tomas',
      at: '22:40',
      expires: '23:40',
      text: `still at stop 14 by the bridge. engine running
people keep coming down from millside on foot. suitcases. some just walking, hands in their pockets
a lady with a kid asked me to take them across. theyre ok i think?? i dont know
the bridge is empty behind me. tell me what to do`,
      variants: [
        {
          id: 'crossed',
          when: (s) => s.flags.tomasCrossed,
          text: `i dropped the mill people at chapel lane. one guy got off and went straight to the radio station window and just stood there
ive got the bus back at the bridge. theres a family asking for a lift west
what do i do`,
        },
        {
          id: 'held',
          when: (s) => s.flags.tomasHeld,
          text: `parked at the bridge like you said. engine off
people keep coming down from millside on foot. suitcases. some just walking, hands in their pockets
a lady with a kid asked me to let them cross. theyre ok i think?? i dont know
the bridge is empty behind me. say the word`,
        },
      ],
      facts: ['tom-forty'],
      options: [
        {
          id: 'close', stance: 'warn', label: 'Close the bridge',
          text: 'Park the bus across it and stay with it. Tell them the clinic is for the sick and the west is closed tonight.',
          reply: `ok. across the bridge. engine off. ill stay
tell them yourself if you can, i cant say it to the kid`,
          set: { bridgeClosed: true },
        },
        {
          id: 'evac', stance: 'reassure', label: 'Run an evacuation',
          text: 'Check each person: warm hands, answers that make sense. Take the well ones over the bridge and up to Ana’s farm. Do not take the others.',
          reply: `warm hands, makes sense. ok. i can do that
ana's gate. north road. ok`,
          set: { evacuating: true, anaOpen: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'How many are walking down, and how do they seem?',
          reply: `forty? more. most are fine. some stand at the lamps. ive seen the ones who stand
i dont let them on`,
        },
      ],
      carry: {
        'meg-fever': {
          reply: `cold hands, fever. so thats how i tell. ok. i can tell now
...ill do the warm ones first`,
          set: { tomasScreens: true },
        },
        'ana-hills': {
          reply: `ana's farm. theres room for eight in her truck. ok. up the north road if i have to`,
          set: { anaOpen: true },
        },
        'ch-trial': {
          reply: `so its not a flu. its that. ok. ok. i believe you. whatever you say, i do`,
          set: { tomasScreens: true },
        },
      },
      blank: 'um. is that about the bridge?',
      missed: { set: { bridgeUnmanaged: true }, note: 'Nobody told Tomas what to do. The bridge stayed open and unmanaged.' },
    },
    {
      id: 'n4-charles-gate',
      npc: 'charles',
      at: '23:00',
      expires: '00:30',
      text: `Notice 16.
1. "The east end will be closed to through traffic overnight due to works."
2. Please draft.
3. Please do not mention the clinic.
4. The crew are fine.`,
      degrade: { 1: '5. I am fine.', 2: `5. 5. 5.
6. The crew are —` },
      variants: [
        {
          id: 'gate',
          when: (s) => s.flags.charlesDisclosed || s.flags.charlesPressed,
          text: `1. The county's reply was one word.
2. I have a decision.
3. East Block's inner gate can be sealed from inside, by one person. That person cannot leave.
4. The crew are in the block. Ty's father is among them.
5. I am the only one who can do it.
6. I would like someone to tell me whether I should.`,
          facts: ['ch-gate'],
        },
      ],
      facts: [],
      options: [
        {
          id: 'seal', stance: 'warn', label: 'Tell him to seal it',
          text: 'Seal it. Tell the county you have done it, in writing. You are doing the right thing.',
          reply: `1. Yes.
2. Thank you.
3. Please tell Ty his father was not alone.`,
          set: { eastGateSealed: true, charlesDisclosed: true, charlesStays: true },
        },
        {
          id: 'draft', stance: 'reassure', label: 'Draft the notice',
          text: '[You draft Notice 16 exactly as asked.]',
          reply: `1. Thank you.
2. Posted.`,
          set: { charlesBuried: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'What is happening to the crew, Charles?',
          reply: `1. They are still working.
2. They do not eat.
3. They stand at the windows.
4. I cannot make them stop.`,
        },
      ],
      carry: {
        'meg-county': {
          reply: `1. One word. That is what they sent me also.
2. Then I will not wait for Friday.`,
          set: { charlesDisclosed: true },
        },
        'ty-dad-missing': {
          reply: `1. He is in the block. He is not well.
2. I will see that he is not alone.`,
          set: { charlesDisclosed: true },
        },
        'meg-institute': {
          reply: `1. Yes. The canteen staff.
2. I wrote the rota. I will write the report.`,
          set: { charlesDisclosed: true },
        },
      },
      blank: `1. Not relevant.
2. Please confirm the notice.`,
      missed: { set: { charlesBuried: true }, note: 'Notice 16 went out without you.' },
    },
    {
      id: 'n4-amelia-air',
      npc: 'amelia',
      at: '23:15',
      expires: '00:10',
      text: `Good evening, Varrow. [PAUSE]
The six a.m. bulletin: the bake sale is cancelled, sadly, for want of eggs and volunteers. The toll holiday. And a reminder that the east end is closed to through traffic overnight due to works.
Anything to add?`,
      degrade: {},
      variants: [
        {
          id: 'informed',
          when: (s) => s.flags.ameliaInformed,
          text: `Good evening, Varrow. [PAUSE]
I have the clinic's notes and a trial in East Block, and a county that says "noted".
I can read it at six, all of it. Or I can read a line about "a health matter in the east".
I don't want a panic. I don't want a funeral either. What would you do?`,
        },
      ],
      facts: [],
      options: [
        {
          id: 'truth', stance: 'warn', label: 'Tell the truth',
          text: 'Say it plainly and calmly: what is happening, where, the signs, stay indoors in Millside, the bridge is closing. People can cope with the truth if it is said calmly.',
          reply: `[PAUSE] Calmly. Yes. I can do calm. Stay warm.`,
          set: { ameliaTruth: true, ameliaCautious: true },
        },
        {
          id: 'calm', stance: 'reassure', label: 'Keep it calm',
          text: 'Say "a health matter in the east". Do not alarm anyone.',
          reply: `A health matter. Lovely and vague. Stay warm.`,
          set: { ameliaCalm: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'What would people on Chapel Lane do if they knew?',
          reply: `Lock their doors. Ring each other. Which is what I'd want.
[PAUSE] I only fear the one who says it wrong.`,
        },
      ],
      carry: {
        'ch-trial': {
          reply: `A trial. East Block. [PAUSE] Then I will read it all at six, in order, without adjectives.`,
          set: { ameliaInformed: true, ameliaCautious: true, ameliaTruth: true },
        },
        'meg-county': {
          reply: `"Noted." One word, from a county, to a nurse. [PAUSE] I'll read that too. All of it. At six.`,
          set: { ameliaInformed: true, ameliaCautious: true, ameliaTruth: true },
        },
        'ch-stable': {
          reply: `"It was meant to be stable. It was stable." [PAUSE] That is the sentence the county will have to answer. I'll read it, word for word.`,
          set: { ameliaInformed: true, ameliaCautious: true, ameliaTruth: true },
        },
        'meg-flu': {
          reply: `Four patients on one street, and a canteen. Thank you. I'll say it, and I'll say why.`,
          set: { ameliaInformed: true, ameliaCautious: true },
        },
        'tom-forty': {
          reply: `Forty people on the road to the bridge. Then I'll tell the west they are coming, and what to look for.`,
          set: { ameliaInformed: true, ameliaCautious: true },
        },
      },
      blank: `That's not quite what I need for the bulletin. Stay warm.`,
      missed: { set: { ameliaCalm: true }, note: 'The six a.m. bulletin went out as "works in the east".' },
    },
    {
      id: 'n4-ana-road',
      npc: 'ana',
      at: '23:50',
      text: `one bar
town's lights went out at nine. the east is lit like a ship
theres people on the north road. torches. a lot of them, walking up
do i open the gate`,
      facts: ['ana-road'],
      options: [
        {
          id: 'screen', stance: 'warn', label: 'Check them first',
          text: 'Open it for the ones who are warm and talk sense. Keep it shut for the others, however they ask.',
          reply: `warm and sense. ok. i have a lantern and a dog
i dont like it. ok`,
          set: { anaScreens: true, anaWarned: true, anaOpen: true },
        },
        {
          id: 'open', stance: 'reassure', label: 'Open the gate',
          text: 'Open it. Take everyone in.',
          reply: `ok. open. god help us`,
          set: { anaOpen: true, anaRisk: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'Are they walking together, or do some stand apart?',
          reply: `some stop. stand in the road. look at my lantern
they dont walk away when i wave`,
        },
      ],
      carry: {
        'meg-fever': {
          reply: `cold hands, fever. ok. i can feel a hand. ill do that before the gate`,
          set: { anaScreens: true, anaWarned: true, anaOpen: true },
        },
        'tom-pass': {
          reply: `one more stop. the ones who stand. ok. i see it now. ill check every one`,
          set: { anaScreens: true, anaWarned: true, anaOpen: true },
        },
      },
      blank: 'one bar. cant do much with that',
    },
  ],
};
