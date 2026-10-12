// Night 4 · Thu 25 Oct. The bridge. Millside is at its worst; the choices that
// shape endings 1–3 are made tonight: seal the east, close or use the bridge,
// and what the radio says. Six messages in two hours; you cannot answer them all.
// (Message format: see night1.js.)

// Ty, leaving: what do I take?
const whatToTake = {
  options: [
    {
      id: 'f-warn', stance: 'warn',
      text: 'Pickle, your phone and charger, water, something warm. Nothing else. Pickle walks on a lead; do not carry him.',
      reply: `lead. phone. hoodie. water
dads bass stays. i hate that. ok. going`,
    },
    {
      id: 'f-ask', stance: 'ask',
      text: 'How long is the walk to the bridge, and is the back lane lit? That decides whether you need a torch.',
      reply: `ten mins. the back lane has one lamp and i dont want to walk under it
no torch. my phone. ok`,
    },
    {
      id: 'f-reassure', stance: 'reassure',
      text: 'Take whatever feels important. You can come back for the rest when it is over.',
      reply: `ok. the bass. pickles blanket. dads jacket
...if it's over soon`,
    },
  ],
};

// Ty, staying: what if she gets in?
const ifSheGetsIn = {
  options: [
    {
      id: 'f-warn', stance: 'warn',
      text: 'Move away from the door and the windows, put something heavy against it, and keep Pickle quiet. Do not speak to her.',
      reply: `heavy. bookcase. ok. pickle shush
im on the stairs. i can see her through the glass`,
    },
    {
      id: 'f-ask', stance: 'ask',
      text: 'Is there a back door or another way out of the house? Know that before you need it.',
      reply: `back door, kitchen, onto the lane. yeah
ok. i know where it is. thx`,
    },
    {
      id: 'f-reassure', stance: 'reassure',
      text: 'She has not forced it so far. She may simply turn and go.',
      reply: `yeah. shes not pushing. shes just holding it
maybe she'll go. ok`,
    },
  ],
};

// Megan: who stays with the ward?
const whoStays = {
  options: [
    {
      id: 'f-warn', stance: 'warn',
      text: 'Ask the three staff who are warm and sensible to take turns with the ones who cannot sleep, and keep the lights low.',
      reply: `turns. low lights. ok. tilly will do nights, she hums so loudly nobody can hate her
fine. fine. ward's mine`,
    },
    {
      id: 'f-ask', stance: 'ask',
      text: 'If you ran, where would you go, and who would you leave with them? Say it out loud and see if you can live with it.',
      reply: `the hills. ana's farm, probably, she sells me goat cheese. and nobody
no. i can't live with that. ok. ward it is`,
    },
    {
      id: 'f-reassure', stance: 'reassure',
      text: 'The team is coming on Friday. Hold on until then and let them take over.',
      reply: `friday. ok. friday
it's thursday. so one more night. ok`,
    },
  ],
};

// Charles, the gate: would you tell Ty?
const tellTy = {
  options: [
    {
      id: 'f-warn', stance: 'warn',
      text: 'Yes. I will tell him you stayed so that others could go home, and that his father was not alone.',
      reply: `1. Thank you.
2. I am not brave. I am organised. They resemble each other from a distance.
3. Please tell him that.`,
    },
    {
      id: 'f-ask', stance: 'ask',
      text: 'Is there anything you want me to tell the county, or Megan at the clinic, before the gate closes?',
      reply: `1. The log is in the top drawer.
2. The trial was mine to stop and I did not.
3. Please give Megan my thanks. She was right on the second night.`,
    },
    {
      id: 'f-reassure', stance: 'reassure',
      text: 'There is time. Ty will hear it from his father when the gate opens.',
      reply: `1. When the gate opens. Yes.
2. That is a kind way of putting it.
3. I will hold that thought.`,
    },
  ],
};

// Charles, the cover notice: the other version.
const truthfulNotice = {
  options: [
    {
      id: 'f-warn', stance: 'warn',
      text: 'Send it to the county tonight as it stands, and post it on the lamppost beside Notice 15. People can then choose which to believe.',
      reply: `1. Both on the lamppost. Side by side.
2. That is very nearly funny.
3. I shall do it myself, in my good coat.`,
    },
    {
      id: 'f-ask', stance: 'ask',
      text: 'Who would read it first, if it went out? Choose that person on purpose.',
      reply: `1. The nurse.
2. She would read it properly.
3. Then Amelia, who would read it aloud.`,
    },
    {
      id: 'f-reassure', stance: 'reassure',
      text: 'Keep it in the drawer for now. If it is needed, you will know.',
      reply: `1. The drawer. Yes.
2. I have a good many things in drawers.`,
    },
  ],
};

// Amelia: how do I say it without a stampede?
const withoutStampede = {
  options: [
    {
      id: 'f-warn', stance: 'warn',
      text: 'Say what is happening, where, what to do, and who to call. In that order, calmly, and say it twice.',
      reply: `[PAUSE] What. Where. What to do. Who to call. Twice.
That's the order of a good poem too.`,
    },
    {
      id: 'f-ask', stance: 'ask',
      text: 'What would you want to be told if you were listening in Chapel Lane at six in the morning?',
      reply: `[PAUSE] That someone had thought of me. That there was a plan.
Yes. I'll read the plan first.`,
    },
    {
      id: 'f-reassure', stance: 'reassure',
      text: 'Do not worry about the wording. Your voice will do the calming for you.',
      reply: `[PAUSE] My voice. Yes. It has done sixteen years of lemon drizzle.
Thank you. Stay warm.`,
    },
  ],
};

export default {
  night: 4,
  title: 'The bridge',
  intro: 'The east is lit like a ship. Decisions are waiting that cannot be taken back.',
  messages: [
    {
      id: 'n4-ty-street',
      npc: 'ty',
      at: '22:10',
      text: [
        `mrs pell is at the door. not knocking. just her hand on the handle
pickle wont stop barking
i didnt lock it. i didnt lock it`,
        `shes on the doorstep with her hand on the handle. not knocking. nothing
pickle is screaming. pickle NEVER screams
i went to the shop earlier and i forgot to lock it. what do i do`,
      ],
      degrade: { 1: 'im fine. im fine.', 2: `light. theres light. every window
im fine. theres light` },
      variants: [
        {
          id: 'safe',
          when: (s) => s.flags.tySafe,
          text: [
            `locked the door like you said. mrs pell is on the step now. just standing
every house on our street has someone on the step. pickle is under my bed
the institute is lit up like a ship. i cant stay here can i`,
            `door is locked. mrs pell is on the step. so is the guy from number 9, and the girl who works at the chip shop
pickle is under my bed. the institute is lit like a ship
i cant stay here, can i`,
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'leave', stance: 'warn',
          text: 'Go out the back with Pickle and walk to the Old Bridge. Keep to the dark and do not stop for anyone under a lamp. Tomas should be parked at the bridge with the night bus.',
          reply: [
            `ok. back door. now. pickle come
what do i take`,
            `back door. bridge. tomas. ok
what do i take, i cant carry pickle AND a bag`,
          ],
          set: { tyEvac: true, tySafe: true },
          then: whatToTake,
        },
        {
          id: 'ask', stance: 'ask',
          text: 'Can you see where the light is coming from? That tells you which way is safe. And do not open the door to find out.',
          reply: [
            `the institute. the whole east block
its like a lighthouse. people are walking toward it
what if she gets in`,
            `the institute, every window. people on our street are walking toward it, not fast
what if she gets in the house`,
          ],
          then: ifSheGetsIn,
        },
        {
          id: 'stay', stance: 'reassure',
          text: 'Stay put with the door shut until morning. It is the safest place for you.',
          reply: [
            `ok. morning. ok
what if she gets in`,
            `stay. ok. door shut
what if she gets in though`,
          ],
          set: { tyStays: true },
          then: ifSheGetsIn,
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
      text: [
        `pt 5 and 6 in. pt 1 walked out of the ward at 3am and stood in the car park looking at the street lamp. i talked him back in like a child
county rang back. one word. "noted". a team is "promised" for friday
6 beds, 7 patients. i can lock the ward or i can run. what would you do`,
        `two more in tonight. pt 1 walked out at 3am and stood in the car park staring at the lamp, and i talked him back in like a toddler
the county rang back. one word. "noted". "a team on friday"
six beds, seven patients, four staff. lock the ward or run. what would you do`,
      ],
      facts: ['meg-county'],
      options: [
        {
          id: 'lock', stance: 'warn',
          text: 'Lock the ward and keep staff and patients inside. Let nobody else in from Millside. Help is Friday; you hold until then.',
          reply: [
            `ok. locking. i hate this. ok
who sits with the ones who cant sleep`,
            `locking it. ok. i hate this but ok
who stays with the ones who cant sleep if there's only four of us`,
          ],
          set: { megLocked: true, megIsolated: true },
          then: whoStays,
        },
        {
          id: 'wait', stance: 'reassure',
          text: 'You have done what you can. The team arrives Friday, so keep the doors as they are and keep treating whoever arrives.',
          reply: [
            `friday. ok. friday
...who stays with them if i have to go home`,
            `just keep going till friday. yeah
who stays with them if i have to sleep`,
          ],
          set: { megWaits: true },
          then: whoStays,
        },
        {
          id: 'ask', stance: 'ask',
          text: 'Could the patients be moved to the East Block, where there are staff who might know what this is?',
          reply: [
            `charles? no. no. that is the last place on earth
nobody who goes in there comes out. who would stay with the ward if i did`,
            `east block? no. no no. that's where it's from
...who would sit with them if i moved them`,
          ],
          then: whoStays,
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
      text: [
        `still at stop 14 by the bridge. engine running
people keep coming down from millside on foot. suitcases. some just walking, hands in their pockets
a lady with a kid asked me to take them across. theyre ok i think?? i dont know
the bridge is empty behind me. i turned dolly off. first time ever. tell me what to do`,
        `stop 14, by the bridge, engine on. people are walking down from millside with suitcases, a lot of them
a lady with a little girl asked if i could take them over. they looked fine. i cant tell any more
dolly is off. i dont like the quiet. what do i do`,
      ],
      variants: [
        {
          id: 'crossed',
          when: (s) => s.flags.tomasCrossed,
          text: [
            `i dropped the mill people at chapel lane. one guy got off and went straight to the radio station window and just stood there
ive got the bus back at the bridge. theres a family asking for a lift west
what do i do`,
            `i took them to chapel lane like you said. one got off and walked up to amelias station window and stood there looking at the light
the bus is back at the bridge now. a family wants a lift west
what do i do`,
          ],
        },
        {
          id: 'held',
          when: (s) => s.flags.tomasHeld,
          text: [
            `parked at the bridge like you said. engine off
people keep coming down from millside on foot. suitcases. some just walking, hands in their pockets
a lady with a kid asked me to let them cross. theyre ok i think?? i dont know
the bridge is empty behind me. say the word`,
            `engine off at the bridge like you said. dolly off too
people are coming down from millside with suitcases. a lady with a little girl asked to cross. they look ok. i cant tell
the bridge is empty behind me. say the word`,
          ],
        },
      ],
      facts: ['tom-forty'],
      options: [
        {
          id: 'close', stance: 'warn',
          text: 'Park the bus across the bridge and stay with it. Tell them the clinic is for the sick and the west is closed tonight.',
          reply: [
            `ok. across the bridge. engine off. ill stay
tell them yourself if you can, i cant say it to the kid`,
            `across the bridge. engine off. ill stay and ill say it
...ill say it to the kid too. i dont want to`,
          ],
          set: { bridgeClosed: true },
        },
        {
          id: 'evac', stance: 'reassure',
          text: 'Check each person for warm hands and answers that make sense. Take the well ones over the bridge and up to Ana\'s farm. Do not take anyone else.',
          reply: [
            `warm hands, makes sense. ok. i can do that
ana's gate. north road. ok`,
            `hands and answers. ok. ana's farm, north road. i buy her cheese, she'll know my face`,
          ],
          set: { evacuating: true, anaOpen: true },
        },
        {
          id: 'ask', stance: 'ask',
          text: 'How many are walking down, and how do they seem? I need to know whether most are well before I tell you what to do.',
          reply: [
            `forty? more. most are fine. some stand at the lamps. ive seen the ones who stand
i dont let them on`,
            `forty at least. most are tired and scared and fine. a few just stand at the lamps
those ones i dont let on`,
          ],
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
      text: [
        `Notice 16.
1. "The east end will be closed to through traffic overnight due to works."
2. Please draft.
3. Please do not mention the clinic.
4. The crew are fine.`,
        `Notice 16, please.
1. "The east end is closed to through traffic overnight due to works."
2. Do not mention the clinic.
3. The crew are fine. I have said so twice and I should like it to be true.`,
      ],
      degrade: { 1: '5. I am fine.', 2: `5. 5. 5.
6. The crew are —` },
      variants: [
        {
          id: 'gate',
          when: (s) => s.flags.charlesDisclosed || s.flags.charlesPressed,
          text: [
            `1. The county's reply was one word.
2. I have a decision.
3. East Block's inner gate can be sealed from inside, by one person. That person cannot leave.
4. The crew are in the block. Ty's father is among them.
5. I am the only one who can do it.
6. I would like someone to tell me whether I should.`,
            `1. The county said "noted". Once.
2. East Block's inner gate seals from the inside, by one person, who cannot then leave.
3. The crew are in there. Ty's father is in there. I am the only person who can do it.
4. I should like to be told whether to.`,
          ],
          facts: ['ch-gate'],
          options: [
            {
              id: 'seal', stance: 'warn',
              text: 'Seal it. Tell the county you have done it, in writing, and tell them why. You are doing the right thing.',
              reply: [
                `1. Yes.
2. Thank you.
3. I should like someone to know that the log is in the top drawer, and that I am not afraid.
4. Will you tell Ty his father was not alone?`,
                `1. Yes. Then I shall.
2. The log is in the top drawer. I should like that known.
3. Would you tell Ty his father was not alone?`,
              ],
              set: { eastGateSealed: true, charlesDisclosed: true, charlesStays: true },
              then: tellTy,
            },
            {
              id: 'ask', stance: 'ask',
              text: 'Is there any other way to stop the crew from leaving the block? Is there anyone else who can help you hold it?',
              reply: [
                `1. No.
2. I have looked for a fortnight.
3. If I do it, would you tell Ty his father was not alone?`,
                `1. No. I have checked, twice, with a diagram.
2. If I seal it, would you tell Ty his father was not alone?`,
              ],
              then: tellTy,
            },
            {
              id: 'wait', stance: 'reassure',
              text: 'Wait. You should not be the only person deciding this. Let the county, or the team, decide when they come.',
              reply: [
                `1. Wait. Yes.
2. That is the safer thing for me.
3. If I wait and I am wrong, would you tell Ty his father was not alone?`,
                `1. That is a relief to hear. It is also, I think, a way of not deciding.
2. If I am wrong, would you tell Ty his father was not alone?`,
              ],
              set: { charlesBuried: true },
              then: tellTy,
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'refuse', stance: 'warn',
          text: 'I will not write "works" again. Here is the notice I would write instead, for the county and for your lamppost:\n\nNOTICE 16\nThere is an illness in Millside. If you are well, stay indoors, keep the lights low, and do not go near anyone standing in the street. If you are unwell, or someone near you is, ring the clinic.',
          reply: [
            `1. I did not ask for that.
2. It is better than what I asked for.
3. May I keep it? I will not post it. I should like to have it.`,
            `1. That is not what I requested.
2. It is, however, a better notice. May I keep it, unposted?`,
          ],
          set: { charlesDisclosed: true },
          then: truthfulNotice,
        },
        {
          id: 'draft', stance: 'reassure',
          text: `NOTICE 16
To residents of Millside:
The east end will be closed to through traffic overnight due to works at the Institute. Please use Quarry Road. We apologise for any inconvenience.
Institute Facilities, 25 October.`,
          reply: [
            `1. Thank you.
2. Posted.
3. I have written a second version for the drawer. Would you read it, in principle?`,
            `1. Thank you. Posted.
2. I have a second version in the drawer. In principle, would you read it?`,
          ],
          set: { charlesBuried: true },
          then: truthfulNotice,
        },
        {
          id: 'ask', stance: 'ask',
          text: 'I can draft it. Before I do: what is happening to the crew? If you say they are fine, I should like to know how you know.',
          reply: [
            `1. They are still working.
2. They do not eat.
3. They stand at the windows.
4. I have a second version of the notice, in the drawer. Would you read it?`,
            `1. They work. They do not eat. They stand at the windows facing the lamps.
2. I have a second version in the drawer. Would you read it?`,
          ],
          then: truthfulNotice,
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
      text: [
        `Good evening, Varrow. [PAUSE]
The six a.m. bulletin: the bake sale is cancelled, sadly, for want of eggs and volunteers. The toll holiday. And a reminder that the east end is closed to through traffic overnight due to works.
Anything to add?`,
        `Good evening, Varrow. [PAUSE]
For six a.m.: the bake sale is off. No eggs, no volunteers, and Mrs. Pell has not answered her door. The toll holiday. The east end closed overnight "due to works".
Anything to add?`,
      ],
      degrade: {},
      variants: [
        {
          id: 'informed',
          when: (s) => s.flags.ameliaInformed,
          text: [
            `Good evening, Varrow. [PAUSE]
I have the clinic's notes and a trial in East Block, and a county that says "noted".
I can read it at six, all of it. Or I can read a line about "a health matter in the east".
I don't want a panic. I don't want a funeral either. What would you do?`,
            `Good evening, Varrow. [PAUSE]
I have Megan's notes, a trial in East Block, and a county that answers in one word.
At six I can read all of it, or a line about "a health matter in the east".
I do not want a panic. I do not want a funeral either. What would you do?`,
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'truth', stance: 'warn',
          text: 'Say it plainly and calmly: what is happening, where, what the signs are, that Millside should stay indoors and that the bridge is closing. People can cope with the truth if it is said calmly.',
          reply: [
            `[PAUSE] Calmly. Yes. I can do calm.
How do I say it without a stampede?`,
            `[PAUSE] Plainly. Calmly. Yes.
But how do I say it without causing a stampede?`,
          ],
          set: { ameliaTruth: true, ameliaCautious: true },
          then: withoutStampede,
        },
        {
          id: 'calm', stance: 'reassure',
          text: 'Say "a health matter in the east". Do not alarm anyone, and let the county say more when it is ready.',
          reply: [
            `A health matter. Lovely and vague.
How do I say it so that it doesn't cause alarm anyway?`,
            `A health matter in the east. That reads well. [PAUSE]
How do I say it without it sounding like a warning?`,
          ],
          set: { ameliaCalm: true },
          then: withoutStampede,
        },
        {
          id: 'ask', stance: 'ask',
          text: 'What would people on Chapel Lane do if they knew everything? You know them better than I do.',
          reply: [
            `Lock their doors. Ring each other. Which is what I'd want.
[PAUSE] I only fear the one who says it wrong. How do I say it without a stampede?`,
            `They'd lock their doors and ring their neighbours. [PAUSE]
Which is what I'd want them to do. How do I say it without a stampede?`,
          ],
          then: withoutStampede,
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
      text: [
        `one bar
town's lights went out at nine. the east is lit like a ship
theres people on the north road. torches. a lot of them, walking up
do i open the gate`,
        `one bar. the town went dark at nine except the east, which is lit like a ship
people with torches on the north road, a lot of them. the dog is growling at the gate and the dog doesnt growl
do i open it`,
      ],
      facts: ['ana-road'],
      options: [
        {
          id: 'screen', stance: 'warn',
          text: 'Open it for the ones who are warm and talk sense. Keep it shut for the others, however they ask. Look at hands and listen to their voices before the latch.',
          reply: [
            `warm and sense. ok. i have a lantern and a dog
i dont like it. ok`,
            `hands and voices. ok. i can do that. i used to hold animals still for a living, i can hold a hand
i dont like it`,
          ],
          set: { anaScreens: true, anaWarned: true, anaOpen: true },
        },
        {
          id: 'open', stance: 'reassure',
          text: 'Open it and take everyone in. You cannot leave frightened people on a road at night.',
          reply: [
            `ok. open. god help us`,
            `open. ok. everyone. the barn is big`,
          ],
          set: { anaOpen: true, anaRisk: true },
        },
        {
          id: 'ask', stance: 'ask',
          text: 'Are they walking together, or do some of them stop and stand apart? Tell me what they do when your lantern reaches them.',
          reply: [
            `some stop. stand in the road. look at my lantern
they dont walk away when i wave`,
            `a few stop dead and look at the lantern and dont move when i wave. the rest keep walking
that is what you meant isnt it`,
          ],
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
