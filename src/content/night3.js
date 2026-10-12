// Night 3 · Wed 24 Oct. Spread. Six people write within two hours; you cannot
// answer everyone in time, and the bus has to be stopped before it crosses.
// (Message format: see night1.js.)

// Ty: what if she comes to the door?
const atTheDoor = {
  options: [
    {
      id: 'f-warn', stance: 'warn',
      text: 'Do not open it. Keep the lights low and the noise down, stay away from the windows, and ring someone if she will not leave.',
      reply: `no light. no noise. ok
ill sit on the stairs with pickle. dads bass is up here, i wont touch it`,
    },
    {
      id: 'f-ask', stance: 'ask',
      text: 'Has she said anything besides "light"? Does she know you? You can find that out through the door; you do not have to open it.',
      reply: `she knew me this morning. she asked after dad
now she just says light. ok. through the door only`,
    },
    {
      id: 'f-reassure', stance: 'reassure',
      text: 'Call out through the door and see if she answers. She is probably just disoriented.',
      reply: `ok. ill talk through the door. mrs pell is sweet. she gives me lemon cake
...if she answers`,
    },
  ],
};

// Megan: do I wake the registrar?
const registrar = {
  options: [
    {
      id: 'f-warn', stance: 'warn',
      text: 'Wake her. Say: "Four patients, one street, one workplace, and a slow pulse that doesn\'t fit flu." Ask her to come and look.',
      reply: `four, one street, one workplace, pulse. ok. that's a sentence i can say at 3am
dr abara will hate me. fine`,
    },
    {
      id: 'f-ask', stance: 'ask',
      text: 'What would she say if she saw patient 1\'s hands and pulse herself?',
      reply: `she'd say it isn't flu. she'd say it very quietly
...ok. that's why i'm worried. ill call her`,
    },
    {
      id: 'f-reassure', stance: 'reassure',
      text: 'Let her sleep, but write up what you have seen so she has it first thing.',
      reply: `write-up. yes. i can do a very good write-up
the radio's on and amelia is reading a poem. i'm going to listen to it, then write`,
    },
  ],
};

// Charles (cracked): before or after?
const beforeOrAfter = {
  options: [
    {
      id: 'f-warn', stance: 'warn',
      text: 'Before. Say it now, in writing, to the county, with your name on it. Every hour makes it harder to say.',
      reply: `1. Before.
2. In writing.
3. The nurse has telephoned the county twice. She is correct.
4. I shall make tea first. It is nearly midnight.`,
    },
    {
      id: 'f-ask', stance: 'ask',
      text: 'What is it that cannot be undone? I cannot tell you whether to say it unless I know what it is.',
      reply: `1. A door that should have stayed shut.
2. A good many people on the other side of it.
3. Please do not make me repeat that.`,
    },
    {
      id: 'f-reassure', stance: 'reassure',
      text: 'After is fine too. People tend to forgive a late truth better than an early guess.',
      reply: `1. After.
2. Yes. That is more comfortable.
3. I am grateful. It is not necessarily correct.`,
    },
  ],
};

// Charles (not yet cracked): can a notice be kind?
const kindNotice = {
  options: [
    {
      id: 'f-warn', stance: 'warn',
      text: 'It can. Kind means saying what is true and what to do. "Stay indoors, here is why, here is who to call."',
      reply: `1. What is true. What to do.
2. Who to call.
3. I have never written one with a telephone number. I will consider it.`,
    },
    {
      id: 'f-ask', stance: 'ask',
      text: 'It can be. Who is it kind to: the residents, or the Institute? Those are different notices.',
      reply: `1. That is an unkind question.
2. It is also a fair one.
3. The residents. I should like it to be the residents.`,
    },
    {
      id: 'f-reassure', stance: 'reassure',
      text: 'A short, calm, polite notice is kind enough. People do not want long explanations at night.',
      reply: `1. Calm. Polite. Short.
2. That is a relief. I admire short.
3. Posted.`,
    },
  ],
};

// Amelia: is "Stay warm" too chirpy tonight?
const stayWarm = {
  options: [
    {
      id: 'f-warn', stance: 'warn',
      text: 'Keep it. It is your voice, and tonight people need to hear a voice they trust. Just say it slower.',
      reply: `[PAUSE] Slower. Yes. A little slower. Stay warm.
Thank you. I did not know I needed permission.`,
    },
    {
      id: 'f-ask', stance: 'ask',
      text: 'What do you think it means to your listeners? That is what you should decide.',
      reply: `That someone is still up. That somebody is listening, and the bridge is lit. [PAUSE]
Yes. Keep it. I'll say it as if I mean it, which I do.`,
    },
    {
      id: 'f-reassure', stance: 'reassure',
      text: 'It is lovely and everyone expects it. Keep your sign-off as it is.',
      reply: `Lovely. Everyone expects it. Stay warm.
Tomas will request Dolly, as usual. I will play it.`,
    },
  ],
};

export default {
  night: 3,
  title: 'One more stop',
  intro: 'Six people write at once. Some will not wait.',
  messages: [
    {
      id: 'n3-ty-lamp',
      npc: 'ty',
      at: '22:15',
      text: [
        `dad still not home. mrs pell next door is just standing under the streetlamp
like for hours. i waved. nothing`,
        `mrs pell is outside under the streetlamp. shes been there since six
no coat. she bakes the lemon cake for amelias bake sale and shes just... standing there. i waved`,
      ],
      degrade: { 1: 'im fine. im fine. im just tired. im fine' },
      variants: [
        {
          id: 'called',
          when: (s) => s.flags.tyCalled,
          text: [
            `called the institute. they said dad is "on extended duty and in good health" like a script
then i rang charles, his voicemail says "please leave a reference number". so i left one. 7741. i made it up
then i went to the fence. every window is lit. its 10pm
mrs pell is under the streetlamp. been there since six. no coat. i waved. nothing`,
            `rang the institute like you said. "extended duty, good health". it sounded like a card
rang charles too. voicemail: "please leave a reference number". i left a fake one
went to the fence. every window lit at 10pm. mrs pell is under the streetlamp, no coat, since six. i waved. nothing`,
          ],
          facts: ['ty-lamp', 'ty-lights'],
        },
      ],
      facts: ['ty-lamp'],
      options: [
        {
          id: 'warn', stance: 'warn',
          text: 'Do not go near her. Stay inside with Pickle and lock the door. Is there anyone you can go to?',
          reply: [
            `ok ok youre freaking me out. ok. locking
what do i do if she comes to the door`,
            `locking it. ok. youre scaring me a bit
what do i do if she comes to the door`,
          ],
          set: { tySafe: true },
          then: atTheDoor,
        },
        {
          id: 'ask', stance: 'ask',
          text: 'Is she answering you when you wave? What do her eyes and her voice do?',
          facts: ['ty-repeat'],
          reply: [
            `she said "light" like four times
just "light". and then nothing
what do i do if she comes to the door`,
            `she turned and said "light". then again. same word, same voice. then nothing
what do i do if she comes to the door`,
          ],
          then: atTheDoor,
        },
        {
          id: 'reassure', stance: 'reassure',
          text: 'She may be unwell or confused; older people sometimes wander at night. Try not to worry, and ring someone if she is still there at midnight.',
          reply: [
            `yeah. prob. shes old
...what do i do if she comes to the door though`,
            `ok. confused. yeah. shes 80
what do i do if she comes to the door`,
          ],
          then: atTheDoor,
        },
      ],
      carry: {
        'meg-fever': {
          reply: `cold hands. thats dad. thats mrs pell
is it catching
...im locking the door`,
          set: { tySafe: true },
        },
        'meg-flu': {
          reply: `a nurse says three people on my street have it?? my street
ok. ok. staying in`,
          set: { tySafe: true },
        },
      },
      blank: 'um',
    },
    {
      id: 'n3-megan-ward',
      npc: 'megan',
      at: '22:30',
      expires: '00:40',
      text: [
        `4 pts now. pt 1: no sleep in two days, not tired, not eating. says "light" and wants every lamp on.
the county says they will "look into it" next week.
ward is quiet except the radio. they all stand next to it`,
        `4 now. pt 1 hasnt slept in two days and isnt tired. wont eat. he stands at my radio saying "light" and wants every lamp on
county says they'll "look into it" next week
amelia's reading the shipping forecast and he stands there like it's scripture`,
      ],
      variants: [
        {
          id: 'dismissed',
          when: (s) => s.flags.megDismissed,
          text: [
            `4 pts now. pt 1 still not eating, still awake. flu doesnt do that
i said it was flu. i said it to YOU, i think. i was wrong?
they all stand next to the radio`,
            `4 now and none of them sleep. flu doesn't do that. i told you it was flu and you said fine and i believed it because i wanted to
they all stand next to amelia's radio. i think i was wrong`,
          ],
        },
      ],
      facts: ['meg-sleep', 'meg-noeat'],
      options: [
        {
          id: 'warn', stance: 'warn',
          text: 'Isolate them in one room and keep staff gloved. Ring the county again and say "cluster, linked to the Institute".',
          reply: [
            `isolating. calling again.
if the institute is behind this i want it on paper. do i wake the registrar though`,
            `one room. gloves. county again, "linked to the institute". ok
do i wake dr abara, the registrar, or let her sleep`,
          ],
          set: { megIsolated: true, megCalled: true },
          then: registrar,
        },
        {
          id: 'ask', stance: 'ask',
          text: 'They stand at the radio and say "light". What do they do when you talk to them, and what do they ask for?',
          facts: ['meg-radio', 'meg-repeat'],
          reply: [
            `light. noise. they go to the radio and just stand
one says "one more stop". over and over. like a bus driver
do i wake the registrar`,
            `light and noise. they drift to the radio and stand. one keeps saying "one more stop", like a conductor
should i wake dr abara`,
          ],
          then: registrar,
        },
        {
          id: 'reassure', stance: 'reassure',
          text: 'You are doing the right thing. Keep good notes, and keep them comfortable.',
          reply: [
            `notes. yes. i can do notes
should i wake the registrar though`,
            `comfortable. notes. ok. i can do that
do i wake the registrar`,
          ],
          then: registrar,
        },
      ],
      carry: {
        'ch-gap': {
          reply: `a gap in their log on the 20th. that is the night the first patient's wife called me
what is in East Block`,
          set: { megKnowsInstitute: true },
        },
        'ch-trial': {
          reply: `a trial. a failed containment. at 02:11 on the 20th
ok. i am putting that in writing and sending it to the county tonight. all of it`,
          set: { megCalled: true, megKnowsInstitute: true },
        },
        'ty-lamp': {
          reply: 'light. they all ask for light. a woman under a lamp for six hours. ok. i believe you',
          set: { megAlert: true },
        },
        'tom-pass': {
          reply: `"one more stop". that is MY patient's line. he is on a bus??
someone has to stop that bus`,
          set: { megAlert: true },
        },
      },
      blank: 'cant right now. patients',
      missed: { set: { megDismissed: true }, note: 'Megan stopped waiting for you.' },
    },
    {
      id: 'n3-charles-log',
      npc: 'charles',
      at: '22:50',
      expires: '00:50',
      text: [
        `Notice 15 to follow.
1. "Residents are advised to remain indoors after dark due to works."
2. Please draft.
3. Please draft quickly.`,
        `Notice 15, if you would.
1. The line is: residents are advised to remain indoors after dark due to works.
2. Please draft.
3. Quickly, please. The kettle is on.`,
      ],
      degrade: { 1: `4. I have not slept.
5. I should be sleeping.
6. —`, 2: '1. 1. 1.' },
      variants: [
        {
          id: 'cracked',
          when: (s) => s.flags.charlesPressed || s.flags.charlesWavering,
          text: [
            `1. The following is not for the notice.
2. I am not sleeping. I should be sleeping.
3. On the 20th, East Block, a trial. [redacted]. Containment. 02:11. [redacted]
4. The crew did not stop. They cannot be made to stop.
5. The nurse at the clinic has telephoned the county twice. She is right.
6. Please do not write this down.`,
            `1. This is off the record.
2. I am not sleeping. I am told I should be.
3. On the 20th, East Block, a trial. [redacted]. Containment failed at 02:11.
4. The crew did not stop. They cannot be made to stop. A nurse at the clinic has seen it and telephoned twice.
5. Please do not write this down.`,
          ],
          facts: ['ch-trial'],
          options: [
            {
              id: 'warn', stance: 'warn',
              text: 'Tell the county tonight, in writing, with your name on it. I will help you word it so that it is true.',
              facts: ['ch-stable'],
              reply: [
                `1. Yes.
2. In writing.
3. Please help me.
4. One question first. If a man has done something he cannot undo, is it better that he says so before or after?`,
                `1. Yes. In writing.
2. Please help me.
3. One question, though. If a man has done something he cannot undo, is it better that he says so before or after?`,
              ],
              set: { charlesDisclosed: true },
              then: beforeOrAfter,
            },
            {
              id: 'ask', stance: 'ask',
              text: 'What kind of trial, Charles? What was meant to happen, and what happened instead?',
              facts: ['ch-stable'],
              reply: [
                `1. It was meant to be stable.
2. It was stable.
3. It was stable.
4. If a man has done something he cannot undo, is it better that he says so before or after?`,
                `1. A tissue-stability trial. It was meant to be stable.
2. It was stable. It was stable.
3. Is it better that he says so before or after?`,
              ],
              then: beforeOrAfter,
            },
            {
              id: 'reassure', stance: 'reassure',
              text: 'Get some rest. It will all look clearer in the morning, and you can decide then.',
              reply: [
                `1. Yes.
2. Morning.
3. Is it better to say so before or after? A man who has done something he cannot undo?`,
                `1. Morning. Yes. That is sensible.
2. Is it better, in general, to say such things before or after?`,
              ],
              set: { charlesBuried: true },
              then: beforeOrAfter,
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'warn', stance: 'warn',
          text: 'I can draft it, but "due to works" is not honest if people are unwell. A truthful notice would say there is an illness in Millside and ask people to stay in. May I write that one?',
          reply: [
            `1. That is more than I asked.
2. I will consider it.
3. A question, since you raise honesty: can a notice be kind?`,
            `1. Hm.
2. That is not what I requested. I will think about it.
3. Can a notice be kind? I have never been asked to write one that was.`,
          ],
          set: { charlesDisclosed: true },
          then: kindNotice,
        },
        {
          id: 'ask', stance: 'ask',
          text: 'Residents will want to know why they must stay in after dark. What may I tell them, and why is it urgent?',
          reply: [
            `1. They may be told that it is for their comfort.
2. It is urgent because I have been asked for it quickly.
3. That is all I can say. Can a notice be kind, in your view?`,
            `1. For their comfort. That is the wording.
2. It is urgent because I said so. Forgive me.
3. Can a notice be kind? I wonder.`,
          ],
          then: kindNotice,
        },
        {
          id: 'reassure', stance: 'reassure',
          text: `NOTICE 15
To residents of Millside:
For your comfort and safety, residents are advised to remain indoors after dark while works continue at the Institute.
Institute Facilities, 24 October.`,
          reply: [
            `1. Thank you.
2. That is exactly it. Calm and short.
3. A question, if I may: can a notice be kind?`,
            `1. Received. Posted.
2. That is calm. I admire calm.
3. Can a notice be kind? I have never been asked to write one that was.`,
          ],
          set: { charlesBuried: true },
          then: kindNotice,
        },
      ],
      carry: {
        'meg-flu': {
          reply: `1. Three.
2. It is four.
3. I know it is four. I was told it was three.
4. I will write to the county.`,
          set: { charlesDisclosed: true },
        },
        'meg-fever': {
          reply: `1. The crew had that. The cold. The pulse.
2. I did not say that.
3. Please do not write it down.`,
          set: { charlesPressed: true },
        },
        'ty-cold': {
          reply: `1. The hands. Yes. Cold.
2. Mr. Marsh's son. The boy on Millside.
3. I have not written to him. I should.`,
          set: { charlesPressed: true },
        },
      },
      blank: `1. Not relevant.
2. Please draft the notice.`,
      missed: { set: { charlesBuried: true }, note: 'Notice 15 went out without you.' },
    },
    {
      id: 'n3-tomas-bus',
      npc: 'tomas',
      at: '23:10',
      expires: '23:50',
      text: [
        `stop 14 by the bridge lol
night bus is FULL of mill people heading west?? its 1am. no its 11. why does it feel like 1
one guy keeps saying "one more stop" every stop. every single one. his hands were like ice when he paid
im meant to keep going to chapel lane. dollys on the radio and hes humming the wrong words. should i`,
        `stop 14, bridge. the bus is full of millside people heading west at 11pm and its so quiet. no talking
one guy says "one more stop" at every stop. every stop. hands like ice when he paid
dolly is on and hes humming but not the right song. im meant to go on to chapel lane. should i`,
      ],
      facts: ['tom-route', 'tom-pass', 'tom-dolly'],
      options: [
        {
          id: 'warn', stance: 'warn',
          text: 'Stop the bus. Let nobody else on. Call the clinic and tell them exactly what you have on board.',
          reply: [
            `ok ok. stopping at the bridge. parking. calling megan, she stitched my arm once
dont go anywhere`,
            `ok. bridge. engine off. ringing megan, shes the nurse who did my arm
stay with me`,
          ],
          set: { tomasHeld: true },
        },
        {
          id: 'ask', stance: 'ask',
          text: 'Before you decide: how many are acting like him, and is anyone on board alone?',
          facts: ['tom-five'],
          reply: [
            `five. no six. they all want the window seat by the lamp
why. why are you asking like that`,
            `six now. they all go for the window seat by the lamp and stare at it
why are you asking like that. should i keep going or not`,
          ],
        },
        {
          id: 'reassure', stance: 'reassure',
          text: 'Keep driving. He is probably just tired; a long shift does that to people.',
          reply: [
            `ok. ok. chapel lane it is`,
            `tired. yeah. ok. long night. chapel lane then`,
          ],
          set: { tomasCrossed: true },
        },
      ],
      carry: {
        'meg-fever': {
          reply: `fever, cold hands. thats him. thats all of them
im not letting anyone else on. im parking at the bridge`,
          set: { tomasHeld: true },
        },
        'meg-repeat': {
          reply: 'one more stop. thats my guy. ok. ok ok ok. im stopping the bus',
          set: { tomasHeld: true },
        },
      },
      blank: 'um. should i keep going or not',
      missed: {
        set: { tomasCrossed: true },
        note: 'The bus did not wait. It crossed the Old Bridge at 23:52.',
      },
    },
    {
      id: 'n3-amelia-bulletin',
      npc: 'amelia',
      at: '23:30',
      expires: '00:20',
      text: [
        `Good evening, Varrow. [PAUSE]
I need a bulletin for the six a.m. news: the bake sale on Chapel Lane, the toll holiday, a line on the power works in the east.
The phones are ringing off the hook about Millside. Do you have anything for me? Anything at all.
Stay warm.`,
        `Good evening, Varrow. [PAUSE]
Tomorrow's six a.m. bulletin needs three things: the bake sale (Mrs. Pell's lemon drizzle, if she is up to it), the toll holiday, and something sensible about the east end.
The phones are ringing about Millside. Have you anything for me?
Stay warm.`,
      ],
      facts: ['am-radio', 'am-calls', 'am-sundays'],
      options: [
        {
          id: 'warn', stance: 'warn',
          text: 'I can write the bake sale and the toll holiday, but hold the line about the east. Something is wrong in Millside, and calling it routine is not safe until you have spoken to the clinic. Ring Megan, the nurse, first.',
          reply: [
            `...the clinic. Megan. I'll ring her.
I'll keep the bake sale. People need the bake sale. [PAUSE]
Tell me, is "Stay warm" too chirpy for a night like this?`,
            `Megan at the clinic. Yes. I'll ring her before six. [PAUSE]
I'll keep the bake sale; people need it. Is my sign-off too chirpy for tonight, do you think?`,
          ],
          set: { ameliaCautious: true },
          then: stayWarm,
        },
        {
          id: 'ask', stance: 'ask',
          text: 'Here is the bake sale and toll holiday. For the east, what are callers in Millside actually saying? I would rather write from that than guess.',
          reply: [
            `That someone is standing at their gate. A great many dogs barking.
Is there something I should know? [PAUSE] And is "Stay warm" too chirpy for tonight?`,
            `That there is someone at the gate and they will not leave. Dogs, all night. [PAUSE]
Is there something I should know? Is my sign-off too chirpy, in the circumstances?`,
          ],
          then: stayWarm,
        },
        {
          id: 'reassure', stance: 'reassure',
          text: `GOOD EVENING, VARROW. Tomorrow at six: the bake sale on Chapel Lane, the toll holiday on the Old Bridge, and a note that works at the Institute may cause some noise in the east. Stay warm.`,
          reply: [
            `Lovely. Routine works. [PAUSE]
Is "Stay warm" too chirpy for tonight, do you think?`,
            `Lovely. That reads well. [PAUSE]
Is my sign-off too chirpy for a night like this?`,
          ],
          set: { ameliaCalm: true },
          then: stayWarm,
        },
      ],
      carry: {
        'ch-trial': {
          reply: `A trial. East Block. [PAUSE] I won't read that out tonight, I'd cause a panic with half the facts.
But I will ring the county, and Megan, and I will have the whole story by morning.`,
          set: { ameliaInformed: true, ameliaCautious: true },
        },
        'meg-flu': {
          reply: `Four patients, one street. Thank you. I will say "stay indoors in Millside" at six, and I will say why.`,
          set: { ameliaInformed: true, ameliaCautious: true },
        },
        'meg-fever': {
          reply: `Cold hands, a slow pulse, a fever. I'll find out what I'm allowed to say. Stay warm. I mean it.`,
          set: { ameliaInformed: true },
        },
      },
      blank: `That's not quite what I need for the bulletin. Stay warm.`,
      missed: { set: { ameliaCalm: true }, note: 'The six a.m. bulletin went out as "routine works".' },
    },
    {
      id: 'n3-ana-gate',
      npc: 'ana',
      at: '23:50',
      text: [
        `one bar
goats still not eating. they keep looking at the road
you were weird last night. weird like you knew something`,
        `one bar. goats didnt eat again and now the dog is off his food too
tomas says the night bus is full of millside people heading west. you were weird last night. what do you know`,
      ],
      facts: [],
      options: [
        {
          id: 'warn', stance: 'warn',
          text: 'Stock up and stay on the farm. If anyone arrives from town in the night, do not open the gate to them until you have looked at their hands and spoken to them.',
          reply: [
            `ok. noted. hope youre wrong
i keep the paperbacks by the door. if i have to sit up all night i might as well finish this one`,
            `fine. hands and talking. ill write it on the gate. hope youre wrong`,
          ],
          set: { anaWarned: true },
        },
        {
          id: 'ask', stance: 'ask',
          text: 'Not enough yet to say. Can the farm get people out of town if it needs to: a truck, a spare barn? That matters more than what I know.',
          reply: [
            `a tractor and a truck. room for eight if they like goats
and a barn, if they dont mind the smell`,
            `a truck, room for eight if theyre ok with goats. a barn. thats all
why`,
          ],
          facts: [],
        },
        {
          id: 'reassure', stance: 'reassure',
          text: 'I am sure it is nothing serious. Animals pick up changes in weather and pressure long before we do.',
          reply: [
            `ok. you said that last night`,
            `weather. ok. thats what you said yesterday too`,
          ],
        },
      ],
      carry: {
        'tom-pass': {
          reply: 'one more stop. ok. tell tomas to bring them up here if the bridge goes. i will leave the gate open for a bus. just a bus',
          set: { anaWarned: true, anaOpen: true },
        },
      },
      blank: 'one bar. cant do much with that',
    },
  ],
};
