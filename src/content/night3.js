// Night 3 · Wed 24 Oct. Spread. Six people write within two hours; you cannot
// answer everyone in time, and the bus has to be stopped before it crosses.

export default {
  night: 3,
  title: 'One more stop',
  intro: 'Six people write at once. Some will not wait.',
  messages: [
    {
      id: 'n3-ty-lamp',
      npc: 'ty',
      at: '22:15',
      text: `dad still not home. mrs pell next door is just standing under the streetlamp
like for hours. i waved. nothing`,
      degrade: { 1: 'im fine. im fine. im just tired. im fine' },
      variants: [
        {
          id: 'called',
          when: (s) => s.flags.tyCalled,
          text: `called the institute. they said dad is "on extended duty and in good health" like a script
then i went to the fence. every window is lit. its 10pm
mrs pell is under the streetlamp. been there since six. no coat. i waved. nothing`,
          facts: ['ty-lamp', 'ty-lights'],
        },
      ],
      facts: ['ty-lamp'],
      options: [
        {
          id: 'warn', stance: 'warn', label: 'Warn',
          text: 'Do not go near her. Stay inside with Pickle and lock the door. Is there anyone you can go to?',
          reply: 'ok ok youre freaking me out. ok. locking',
          set: { tySafe: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'Is she answering you? Her eyes, her voice?',
          reply: `she said "light" like four times
just "light"
and then nothing`,
          facts: ['ty-repeat'],
        },
        {
          id: 'reassure', stance: 'reassure', label: 'Reassure',
          text: 'She may just be unwell or confused. Try not to worry.',
          reply: 'yeah. prob. shes old',
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
      text: `4 pts now. pt 1: no sleep in two days, not tired, not eating. says "light" and wants every lamp on.
the county says they will "look into it" next week.
ward is quiet except the radio. they all stand next to it`,
      variants: [
        {
          id: 'dismissed',
          when: (s) => s.flags.megDismissed,
          text: `4 pts now. pt 1 still not eating, still awake. flu doesnt do that
i said it was flu. i said it to YOU, i think. i was wrong?
they all stand next to the radio`,
        },
      ],
      facts: ['meg-sleep', 'meg-noeat'],
      options: [
        {
          id: 'warn', stance: 'warn', label: 'Warn',
          text: 'Isolate them in one room and keep staff gloved. Ring the county again and say "cluster, linked to the Institute".',
          reply: `isolating. calling again.
if the institute is behind this i want it on paper`,
          set: { megIsolated: true, megCalled: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'What do they do when you talk to them? What are they asking for?',
          reply: `light. noise. they go to the radio and just stand
one says "one more stop". over and over. like a bus driver`,
          facts: ['meg-radio', 'meg-repeat'],
        },
        {
          id: 'reassure', stance: 'reassure', label: 'Reassure',
          text: 'You are doing the right thing. Keep good notes.',
          reply: 'notes. yes. i can do notes',
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
      text: `Notice 15 to follow.
1. "Residents are advised to remain indoors after dark due to works."
2. Please draft.
3. Please draft quickly.`,
      degrade: { 1: `4. I have not slept.
5. I should be sleeping.
6. —`, 2: '1. 1. 1.' },
      variants: [
        {
          id: 'cracked',
          when: (s) => s.flags.charlesPressed || s.flags.charlesWavering,
          text: `1. The following is not for the notice.
2. I am not sleeping. I should be sleeping.
3. On the 20th, East Block, a trial. [redacted]. Containment. 02:11. [redacted]
4. The crew did not stop. They cannot be made to stop.
5. Please do not write this down.`,
          facts: ['ch-trial'],
        },
      ],
      facts: [],
      options: [
        {
          id: 'warn', stance: 'warn', label: 'Warn',
          text: 'Tell the county tonight, in writing. I will help you word it so that it is true.',
          reply: `1. Yes.
2. In writing.
3. Please help me.`,
          facts: ['ch-stable'],
          set: { charlesDisclosed: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'What kind of trial, Charles? What was meant to happen?',
          reply: `1. It was meant to be stable.
2. It was stable.
3. It was stable.`,
          facts: ['ch-stable'],
        },
        {
          id: 'reassure', stance: 'reassure', label: 'Reassure',
          text: 'Get some rest. It will all look clearer in the morning.',
          reply: `1. Yes.
2. Morning.`,
          set: { charlesBuried: true },
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
      text: `stop 14 by the bridge lol
night bus is FULL of mill people heading west?? its 1am. no its 11. why does it feel like 1
one guy keeps saying "one more stop" every stop. every single one. his hands were like ice when he paid
im meant to keep going to chapel lane. should i`,
      facts: ['tom-route', 'tom-pass'],
      options: [
        {
          id: 'warn', stance: 'warn', label: 'Warn',
          text: 'Stop the bus. Let nobody else on. Call the clinic and tell them exactly what you have on board.',
          reply: `ok ok. stopping at the bridge. parking. calling megan, she did my arm once
dont go anywhere`,
          set: { tomasHeld: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'How many are acting like him? Is anyone alone?',
          reply: `five. no six. they all want the window seat by the lamp
why. why are you asking like that`,
          facts: ['tom-five'],
        },
        {
          id: 'reassure', stance: 'reassure', label: 'Reassure',
          text: 'Keep driving. He is probably just tired.',
          reply: 'ok. ok. chapel lane it is',
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
      text: `Good evening, Varrow. [PAUSE]
I need a bulletin for the six a.m. news: the bake sale on Chapel Lane, the toll holiday, a line on the power works in the east.
The phones are ringing off the hook about Millside. Do you have anything for me? Anything at all.
Stay warm.`,
      facts: ['am-radio', 'am-calls'],
      options: [
        {
          id: 'warn', stance: 'warn', label: 'Warn',
          text: 'Hold the bulletin. Something is wrong in Millside. Do not call it routine until you have spoken to the clinic.',
          reply: `...the clinic. Megan. I'll ring her.
I'll keep the bake sale. People need the bake sale. [PAUSE] Stay warm.`,
          set: { ameliaCautious: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'What are people in Millside saying when they call?',
          reply: `That someone is standing at their gate. A great many dogs barking.
Is there something I should know?`,
        },
        {
          id: 'reassure', stance: 'reassure', label: 'Reassure',
          text: 'Keep it light. Routine works, nothing more to add.',
          reply: `Lovely. Routine works. Stay warm.`,
          set: { ameliaCalm: true },
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
      text: `one bar
goats still not eating. they keep looking at the road
you were weird last night. weird like you knew something`,
      facts: [],
      options: [
        {
          id: 'warn', stance: 'warn', label: 'Warn',
          text: 'Stock up. Stay on the farm. If anyone arrives from town in the night, do not open the gate.',
          reply: 'ok. noted. hope youre wrong',
          set: { anaWarned: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'Does the farm have a way of getting people out of town if you need it?',
          reply: 'a tractor and a truck. room for eight if they like goats',
          facts: [],
        },
        {
          id: 'reassure', stance: 'reassure', label: 'Reassure',
          text: 'I am sure it is nothing.',
          reply: 'ok. you said that last night',
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
