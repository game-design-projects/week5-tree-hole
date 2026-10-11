// Night 6 · Sat 27 Oct. The longest night. The west is where it is decided:
// the clinic, the bridge, the radio and the farm. Characters in zones that fall
// tonight leave their windows with a last message (`final`, no replies).

import { evacuating, gateSealed, sealedEarly, truthOnAir } from './routes.js';

export default {
  night: 6,
  title: 'The longest night',
  intro: 'The team has been promised for first light. There is one night between.',
  messages: [
    // ---------------------------------------------------------------- Ty
    {
      id: 'n6-ty',
      npc: 'ty',
      at: '22:10',
      text: `the cupboard is dark and pickle is quiet
outside one by one theyre leaving the lamp and walking west. i can hear their shoes. all in the same direction
im still here. im still here`,
      degrade: { 1: 'im fine', 2: 'light. under the door. im fine' },
      variants: [
        {
          id: 'sealed',
          when: sealedEarly,
          text: `the people in white suits came to the tents. they said first light tomorrow
they let me talk to dad through the fence. he said hi son. he said it NORMALLY
thats the first normal thing in 8 days`,
          options: [
            {
              id: 'stay', stance: 'warn', label: 'Tell him to wait',
              text: 'Stay in the tent until first light. You will be at the fence when the gate opens.',
              reply: 'ill be at the fence at first light. ill bring pickle',
            },
            {
              id: 'ask', stance: 'ask', label: 'Ask',
              text: 'What else did he say?',
              reply: `that charles taught him to sleep in the dark
that i should put pickle in a dark room too. i did. he slept`,
            },
            {
              id: 'love', stance: 'reassure', label: 'Tell him you love him',
              text: 'Tell him you love him, through the fence.',
              reply: 'ok. i did. i will again at first light',
            },
          ],
        },
        {
          id: 'bus',
          when: (s) => s.flags.tyEvac && !s.flags.tyBreach && !sealedEarly(s),
          text: `got on the bus tonight. tomas checked my hands. the road up to the hills is so dark
nobody talks. pickle is on my lap
ana says theres a barn and soup`,
          options: [
            {
              id: 'quiet', stance: 'warn', label: 'Keep quiet',
              text: 'Stay quiet and keep the bus dark. You are nearly there.',
              reply: 'dark. quiet. nearly there',
            },
            {
              id: 'ask', stance: 'ask', label: 'Ask',
              text: 'Who else is on the bus?',
              reply: 'a lady with a kid. two guys from the mill. a nurse. everyone has warm hands. everyone is so quiet',
            },
            {
              id: 'soon', stance: 'reassure', label: 'Reassure',
              text: 'You are safe now.',
              reply: 'safe. ok',
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'stay', stance: 'warn', label: 'Tell him to stay',
          text: 'Stay in the dark. Do not follow them. When the shoes stop, wait one more hour.',
          reply: 'dark. one more hour. ok',
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'Which way are they going? All the same way?',
          reply: 'west. all of them. toward the bridge. toward the radio station i think',
        },
        {
          id: 'soon', stance: 'reassure', label: 'Reassure',
          text: 'Not long now.',
          reply: 'not long. ok',
        },
      ],
      carry: {},
      blank: 'um. not now',
    },
    {
      id: 'n6-ty-last',
      npc: 'ty',
      at: '22:10',
      final: true,
      text: `dad is at the door
hi dad
hi dad
its so bright out there
im going out
im going out`,
      facts: [],
      options: [],
    },

    // ---------------------------------------------------------------- Megan
    {
      id: 'n6-megan',
      npc: 'megan',
      at: '22:25',
      expires: '00:20',
      text: `ward is bad. lights on. more patients stand at the window than lie in bed now
two walked out through the car park toward the lamps and i could not stop them
i have four staff. i do not think i can hold it`,
      variants: [
        {
          id: 'dark',
          when: (s) => s.flags.megDark,
          text: `pt 1 slept six hours. hands warm. he said "hello megan"
first words in six days. pt 2 and 4 too. dark works
the ones still standing at the window stand in the dark and then they just... stop standing
the team said friday. it is saturday. now they say first light. what do i tell them`,
          options: [
            {
              id: 'method', stance: 'warn', label: 'Give them the method',
              text: 'Write it on the door: dark, quiet, warm. Give it to anyone who will listen, and to the team before they go in.',
              reply: `dark, quiet, warm. on the door. in marker
i'll read it to them if they let me`,
              set: { methodShared: true },
            },
            {
              id: 'ask', stance: 'ask', label: 'Ask',
              text: 'How many have recovered, and how many are still standing?',
              reply: `five of twelve slept. the rest are slower
nobody is worse. nobody has been worse since the lights went off`,
            },
            {
              id: 'rest', stance: 'reassure', label: 'Tell her to rest',
              text: 'You have done enough tonight. Sit down for an hour.',
              reply: 'an hour. ok. one hour. in the dark',
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'dark', stance: 'warn', label: 'Lock and darken',
          text: 'Lock every door. Switch off every light you can reach, and sit quietly in the dark yourself. It is the only thing that has worked anywhere.',
          reply: `...ok. dark. ok. i am turning them off
...they are sitting down`,
          facts: ['meg-dark'],
          set: { megDark: true, megLocked: true, megIsolated: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'Which of your staff are warm and sensible? Who can sit with the worst ones?',
          reply: 'three of four. i will ask them',
        },
        {
          id: 'done', stance: 'reassure', label: 'Tell her she has done enough',
          text: 'You have done everything you could. You can go.',
          reply: 'ok. enough. i can go',
          set: { megAbandons: true },
        },
      ],
      carry: {
        'ch-dark': {
          reply: 'from inside the block. the same thing. ok. then it is true. i am turning them off',
          set: { megDark: true, megLocked: true, megIsolated: true },
        },
      },
      blank: 'cant right now. patients',
      missed: { set: { megAbandons: true }, note: 'Megan stopped waiting. The lights stayed on.' },
    },
    {
      id: 'n6-megan-last',
      npc: 'megan',
      at: '22:25',
      final: true,
      text: `pt 1: T —, HR —
light
light
the window is so bright
i am so tired of the lights
light`,
      facts: [],
      options: [],
    },

    // ---------------------------------------------------------------- Tomas
    {
      id: 'n6-tomas',
      npc: 'tomas',
      at: '22:40',
      expires: '23:50',
      text: `engine off at the bridge. night 3. quiet. the loudhailer guy is gone
somebody lit a fire on the east side. theyre not coming near. just standing facing it
the lady with the heart condition died i think. a nurse says she just stopped
i dont think i can do another night`,
      degrade: { 1: 'stop 14', 2: 'stop 14 stop 14' },
      variants: [
        {
          id: 'evac',
          when: evacuating,
          text: `run 4. forty-one up at ana's now. one of them on the truck coughed and went quiet
i checked hands at the start. he was warm at the start
hands can lie. what do i do`,
          options: [
            {
              id: 'twice', stance: 'warn', label: 'Check twice',
              text: 'Check twice: at the bridge and again at the gate. Nobody who has been quiet for ten minutes gets out of the truck without being looked at.',
              reply: `twice. at the bridge. at the gate
ill tell ana`,
              set: { tomasCheckTwice: true },
            },
            {
              id: 'ask', stance: 'ask', label: 'Ask',
              text: 'What exactly did the one who went quiet do?',
              reply: `he looked at the dashboard light
and didnt look at anything else`,
            },
            {
              id: 'keep', stance: 'reassure', label: 'Keep running',
              text: 'Keep running. The rule is enough.',
              reply: 'ok. running. the rule',
              set: { evacBreach: true },
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'stay', stance: 'warn', label: 'Stay one more night',
          text: 'The team comes at first light. You are the reason the west is safe tonight. One more night.',
          reply: `one more. ok. engine off. lights off
ill count the hours`,
          set: { bridgeClosed: true, tomasHeld: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'What is the nurse doing now?',
          reply: 'sitting with the ones who cant sleep. in the dark. she says hi tomas every hour',
        },
        {
          id: 'home', stance: 'reassure', label: 'Tell him to go home',
          text: 'Go home and sleep. The bridge will hold without you for a night.',
          reply: 'ok. home. sleep. the bus can sit',
          set: { bridgeClosed: false, tomasLeaves: true, bridgeUnmanaged: true },
        },
      ],
      carry: {
        'meg-dark': {
          reply: 'dark. quiet. warm. ok. thats a thing i can do on a bridge',
          set: { bridgeClosed: true, tomasHeld: true },
        },
      },
      blank: 'um. stop 14?',
      missed: { set: { bridgeUnmanaged: true }, note: 'Nobody told Tomas anything. He sat in the dark and waited.' },
    },
    {
      id: 'n6-tomas-last',
      npc: 'tomas',
      at: '22:40',
      final: true,
      text: `stop 14
stop 14
one more stop
one more stop
one more stop
one more`,
      facts: [],
      options: [],
    },

    // ---------------------------------------------------------------- Charles
    {
      id: 'n6-charles',
      npc: 'charles',
      at: '22:55',
      expires: '00:30',
      text: `Notice 18.
1. "The east end remains closed due to works."
2. Please draft.
3. Please draft it before six.
4. I have not slept.`,
      degrade: { 1: '5. 5.', 2: '5. 5. 5.' },
      variants: [
        {
          id: 'inside',
          when: gateSealed,
          text: `1. The county's team called at dusk.
2. They will open the gate at first light.
3. They ask me to open it from inside.
4. If I do, I may be the first person they meet.
5. I would like to meet them awake.`,
          options: [
            {
              id: 'open', stance: 'warn', label: 'Open it for the team',
              text: 'Open it when they are in suits and every lamp is out. Walk out first, in the dark, with your hands open.',
              reply: `1. Yes.
2. In the dark.
3. With my hands open.`,
              set: { gateOpenedForTeam: true },
            },
            {
              id: 'ask', stance: 'ask', label: 'Ask',
              text: 'What do you want them to know first?',
              reply: `1. That it was stable.
2. That it was not.
3. That the people at the windows can be brought back.`,
            },
            {
              id: 'wait', stance: 'reassure', label: 'Tell him to wait',
              text: 'Wait until the county confirms in writing who is coming. Keep it sealed until then.',
              reply: `1. In writing.
2. Yes.
3. That is wise.`,
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'draft', stance: 'reassure', label: 'Draft it',
          text: '[You draft Notice 18 exactly as asked.]',
          reply: `1. Thank you.
2. Posted.`,
          set: { charlesBuried: true },
        },
        {
          id: 'refuse', stance: 'warn', label: 'Refuse',
          text: 'No. I will not write another word of it. Tell the county, tonight, with your name on it.',
          reply: `1. Yes.
2. With my name.
3. —`,
          set: { charlesDisclosed: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'Is there anyone left in the block who is awake?',
          reply: `1. Myself.
2. One other.
3. He has stopped writing his name.`,
        },
      ],
      carry: {},
      blank: `1. Not relevant.
2. Please confirm the notice.`,
      missed: { set: { charlesBuried: true }, note: 'Notice 18 went out without you.' },
    },

    // ---------------------------------------------------------------- Amelia
    {
      id: 'n6-amelia',
      npc: 'amelia',
      at: '23:10',
      expires: '00:10',
      text: `Good evening, Varrow. [PAUSE]
There are people standing outside the station window. Eleven. They came in the last hour. They are not knocking.
A man on the line says the whole west bank is dark and he cannot find his wife. The county has not called.
Tell me what to say.`,
      degrade: { 1: 'Stay warm.', 2: 'Stay warm. Stay warm.' },
      variants: [
        {
          id: 'plan',
          when: (s) => s.flags.ameliaPlan,
          text: `Good evening, Varrow. [PAUSE]
The school hall has a hundred and forty people and a kettle. The clinic tent has eleven. Nobody has gone near the bridge. I read the safe places every hour. A child asked me to read them again.
There are people standing outside the station window. Eleven. They came in the last hour. They are not knocking.
Do I keep broadcasting?`,
          options: [
            {
              id: 'quiet', stance: 'warn', label: 'Keep going, in the dark',
              text: 'Keep broadcasting. Turn off the studio light and the sign outside. They are drawn to light and noise. Read quietly.',
              reply: `[PAUSE] Quietly. Lights off. Yes. Stay warm.`,
              set: { ameliaDark: true },
            },
            {
              id: 'ask', stance: 'ask', label: 'Ask',
              text: 'Do they react when you speak?',
              reply: `They turn toward it. Every time. [PAUSE] Like sunflowers.`,
            },
            {
              id: 'louder', stance: 'reassure', label: 'Read louder',
              text: 'Read louder. They will move on.',
              reply: `Louder. Yes. [PAUSE] Stay warm.`,
              set: { ameliaLoud: true },
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'truth', stance: 'warn', label: 'Tell the truth, quietly',
          text: 'Tell the truth, in a quiet voice, with the lights off. Millside is lost, the clinic keeps its ward dark, stay away from the lamps.',
          reply: `[PAUSE] Quietly. The truth. Lights off. Stay warm.`,
          set: { ameliaInformed: true, ameliaTruth: true, ameliaCautious: true, ameliaDark: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'Who is outside the window? Do you know any of them?',
          reply: `Mrs. Pell's husband. A girl from the bake sale. [PAUSE] I know all of them.`,
        },
        {
          id: 'nothing', stance: 'reassure', label: 'Say nothing',
          text: 'Say nothing tonight. Play music.',
          reply: `Music. Of course. [PAUSE] Stay warm.`,
          set: { ameliaCalm: true, ameliaLoud: true },
        },
      ],
      carry: {
        'meg-dark': {
          reply: `Dark, quiet, warm. [PAUSE] Then I turn the lights off now and I read it to them. Thank you.`,
          set: { ameliaInformed: true, ameliaTruth: true, ameliaCautious: true, ameliaDark: true },
        },
        'ch-dark': {
          reply: `From inside the block. [PAUSE] I'll say that. Quietly. Stay warm.`,
          set: { ameliaInformed: true, ameliaTruth: true, ameliaCautious: true, ameliaDark: true },
        },
      },
      blank: `That's not quite what I need for the bulletin. Stay warm.`,
      missed: { set: { ameliaLoud: true }, note: 'The station stayed lit and loud.' },
    },
    {
      id: 'n6-amelia-last',
      npc: 'amelia',
      at: '23:10',
      final: true,
      text: `Good evening, Varrow. [PAUSE]
Good evening, Varrow. [PAUSE]
Good evening, Varr—
Stay warm. Stay warm. Stay
[PAUSE]
[PAUSE]`,
      facts: [],
      options: [],
    },

    // ---------------------------------------------------------------- Ana
    {
      id: 'n6-ana',
      npc: 'ana',
      at: '23:45',
      text: `one bar
nobody came. the smoke over the town is black now. the goats are quiet
maybe i overdid it with the gate. i keep thinking somebody will come up the road`,
      variants: [
        {
          id: 'open',
          when: (s) => s.flags.anaOpen && !s.flags.evacBreach,
          text: `one bar
31 in the barn. goats and strangers. it smells like a festival. a woman held my hand and said thank you in the dark
at 3am one of the ones from the road stood up and walked to the door. warm hands. he said he needed the lamp
the lamp is a lantern. i put it out. he sat down`,
          options: [
            {
              id: 'dark', stance: 'warn', label: 'Keep the barn dark',
              text: 'Keep the barn dark, quiet and warm. No lanterns, no radios. Tell them why.',
              reply: `dark quiet warm. ok. ill tell them
theyre being so good about it. theyre scared`,
              set: { anaDark: true },
            },
            {
              id: 'ask', stance: 'ask', label: 'Ask',
              text: 'How many of them can still sleep?',
              reply: 'all of them but one. he sits up and watches the door',
            },
            {
              id: 'sleep', stance: 'reassure', label: 'Reassure',
              text: 'You are doing well. Get some sleep.',
              reply: 'sleep. ha. ok',
            },
          ],
        },
        {
          id: 'breach',
          when: (s) => s.flags.evacBreach,
          text: `one bar
i let him in. hes in the barn. hes not moving. hes just standing facing the door
two more at the gate tonight. cold hands. they wont go away
the goats are making a noise i have never heard`,
          options: [
            {
              id: 'shed', stance: 'warn', label: 'Separate him',
              text: 'Move him to the shed: dark, quiet, warm, door shut. Keep everyone else in the barn. Keep the gate shut tonight.',
              reply: `shed. dark. door shut. ok
hes walking where i walk him. hes not fighting`,
              set: { anaWarned: true, anaDark: true },
            },
            {
              id: 'ask', stance: 'ask', label: 'Ask',
              text: 'Are the others in the barn showing anything?',
              reply: 'one has gone quiet. the rest are fine. i think. i dont know any more',
            },
            {
              id: 'wait', stance: 'reassure', label: 'Wait',
              text: 'Wait and see. He may settle.',
              reply: 'wait. ok. waiting',
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'gate', stance: 'warn', label: 'Make the rule',
          text: 'Make the rule now. Warm hands and sense, or the gate stays shut. Dark, quiet, warm inside.',
          reply: `rule. ok. dark quiet warm. ok`,
          set: { anaWarned: true, anaScreens: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'What can you see from the rock?',
          reply: 'smoke. the east lit up like a ship. the north road is empty',
        },
        {
          id: 'calm', stance: 'reassure', label: 'Reassure',
          text: 'Somebody will come. Get some sleep.',
          reply: 'ok. sleep',
        },
      ],
      carry: {
        'tom-run': {
          reply: `tomas has been running a bus with the engine off? and he checks hands. ok. ill have the gate open for him tomorrow. just the bus`,
          set: { anaWarned: true, anaOpen: true },
        },
      },
      blank: 'one bar. cant do much with that',
    },
  ],
};
