// Night 6 · Sat 27 Oct. The longest night. The west is where it is decided:
// the clinic, the bridge, the radio and the farm. Characters in zones that fall
// tonight leave their windows with a last message (`final`, no replies).
// (Message format: see night1.js.)

import { evacuating, gateSealed, sealedEarly } from './routes.js';

// Ty (tent): what else did Dad say? (answered in the options themselves; no follow-up needed.)

// Charles, opening the gate: what do you want them to know first?
const toTheTeam = {
  options: [
    {
      id: 'f-warn', stance: 'warn',
      text: 'Tell them first that the people at the windows can be brought back: dark, quiet, warm. Everything else can follow that.',
      reply: `1. Dark. Quiet. Warm. First.
2. Then my name, and what I did.
3. Then the log, in the top drawer, which I should like returned to my spare room. There is a railway on the table that is not finished.`,
    },
    {
      id: 'f-ask', stance: 'ask',
      text: 'What do you want them to understand about why it happened? That is a different list from what they need to do.',
      reply: `1. That it was stable.
2. That it was not.
3. That nobody was careless, which is the worst of it.`,
    },
    {
      id: 'f-reassure', stance: 'reassure',
      text: 'Just walk out. They will have questions, and you can answer them one at a time.',
      reply: `1. One at a time. Yes.
2. That is how I prefer questions.`,
    },
  ],
};

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
      text: [
        `the cupboard is dark and pickle is quiet
outside one by one theyre leaving the lamp and walking west. i can hear their shoes. all in the same direction
im still here. im still here`,
        `its dark in here and pickle is asleep on the bass case
the street is emptying one person at a time. theyre all walking the same way. west
im still here. what do i do now`,
      ],
      degrade: { 1: 'im fine', 2: 'light. under the door. im fine' },
      variants: [
        {
          id: 'sealed',
          when: sealedEarly,
          text: [
            `the people in white suits came to the tents. they said first light tomorrow
they let me talk to dad through the fence. he said hi son. he said it NORMALLY
thats the first normal thing in 8 days`,
            `men in white suits came to the tents and said first light. they let me talk to dad through the fence
he said "hi son". normal voice. normal. he asked if pickle was eating
what do i do till morning`,
          ],
          options: [
            {
              id: 'stay', stance: 'warn',
              text: 'Wait in the tent until first light. You will be at the fence when the gate opens, and he will see you first.',
              reply: 'ill be at the fence at first light. ill bring pickle',
            },
            {
              id: 'ask', stance: 'ask',
              text: 'What else did he say? Anything about how he is, or what helped him, is worth knowing.',
              reply: `that charles taught him to sleep in the dark
that i should put pickle in a dark room too. i did. he slept`,
            },
            {
              id: 'love', stance: 'reassure',
              text: 'Tell him you love him through the fence. You can do that now.',
              reply: 'ok. i did. i will again at first light',
            },
          ],
        },
        {
          id: 'bus',
          when: (s) => s.flags.tyEvac && !s.flags.tyBreach && !sealedEarly(s),
          text: [
            `got on the bus tonight. tomas checked my hands. the road up to the hills is so dark
nobody talks. pickle is on my lap
ana says theres a barn and soup`,
            `on the bus up the north road. tomas checked my hands and my name and sang a bit of dolly very quietly
nobody talks. pickle is on my lap. ana says theres soup`,
          ],
          options: [
            {
              id: 'quiet', stance: 'warn',
              text: 'Stay quiet and keep the bus dark. You are nearly there, and the dark is part of why you are safe.',
              reply: 'dark. quiet. nearly there',
            },
            {
              id: 'ask', stance: 'ask',
              text: 'Who else is on the bus with you? How do they seem?',
              reply: 'a lady with a kid. two guys from the mill. a nurse. everyone has warm hands. everyone is so quiet',
            },
            {
              id: 'soon', stance: 'reassure',
              text: 'You are safe now, Ty. Nothing is going to happen on the road up.',
              reply: 'safe. ok',
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'stay', stance: 'warn',
          text: 'Stay in the dark and do not follow them. When the footsteps stop, wait one more hour before you move.',
          reply: 'dark. one more hour. ok',
        },
        {
          id: 'ask', stance: 'ask',
          text: 'Which way are they going: all the same way? Tell me what they walk toward.',
          reply: 'west. all of them. toward the bridge. toward the radio station i think',
        },
        {
          id: 'soon', stance: 'reassure',
          text: 'Not long now. Help will come at first light, so just hold on.',
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
      text: [
        `ward is bad. lights on. more patients stand at the window than lie in bed now
two walked out through the car park toward the lamps and i could not stop them
i have four staff. i do not think i can hold it`,
        `the ward is bad. every light on, more patients standing than lying down. two walked out into the car park toward the lamps while i was holding another one's wrist
four staff. warfarin hasn't come out from under the desk. i do not think i can hold it`,
      ],
      variants: [
        {
          id: 'dark',
          when: (s) => s.flags.megDark,
          text: [
            `pt 1 slept six hours. hands warm. he said "hello megan"
first words in six days. pt 2 and 4 too. dark works
the ones still standing at the window stand in the dark and then they just... stop standing
the team said friday. it is saturday. now they say first light. what do i tell them`,
            `pt 1 slept six hours and woke up warm. "hello megan." first words in six days. pt 2 and 4 too
dark works. the ones still at the window stand in the dark and then they sit
the team said friday. it is saturday. now it's first light. what do i tell them`,
          ],
          options: [
            {
              id: 'method', stance: 'warn',
              text: 'Write it on the door: dark, quiet, warm. Give it to anyone who will listen, and to the team before they go in. That is what they most need to know.',
              reply: `dark, quiet, warm. on the door. in marker
i'll read it to them if they let me`,
              set: { methodShared: true },
            },
            {
              id: 'ask', stance: 'ask',
              text: 'Tell them how many have recovered and how many are still standing. Numbers will be believed before a story.',
              reply: `five of twelve slept. the rest are slower
nobody is worse. nobody has been worse since the lights went off`,
            },
            {
              id: 'rest', stance: 'reassure',
              text: 'Tell them you have done what you can and you need an hour. Sit down in the dark first.',
              reply: 'an hour. ok. one hour. in the dark',
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'dark', stance: 'warn',
          text: 'Lock every door. Switch off every light you can reach and sit quietly in the dark yourself. It is the only thing that has worked anywhere, and it works for you too.',
          reply: `...ok. dark. ok. i am turning them off
...they are sitting down`,
          facts: ['meg-dark'],
          set: { megDark: true, megLocked: true, megIsolated: true },
        },
        {
          id: 'ask', stance: 'ask',
          text: 'Which of your staff are warm and sensible? Who can sit with the worst ones so you can hold the door?',
          reply: 'three of four. i will ask them',
        },
        {
          id: 'done', stance: 'reassure',
          text: 'You have done everything anyone could have. You are allowed to go home.',
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
      text: [
        `engine off at the bridge. night 3. quiet. the loudhailer guy is gone
somebody lit a fire on the east side. theyre not coming near. just standing facing it
the lady with the heart condition died i think. a nurse says she just stopped
i dont think i can do another night`,
        `bridge, engine off, night three. the loudhailer man has gone quiet. someone lit a fire on the east side and theyre all just standing round it, not coming near
the lady with the heart condition died. the nurse said she just stopped
mum made soup and i cant eat it. i dont think i can do another night`,
      ],
      degrade: { 1: 'stop 14', 2: 'stop 14 stop 14' },
      variants: [
        {
          id: 'evac',
          when: evacuating,
          text: [
            `run 4. forty-one up at ana's now. one of them on the truck coughed and went quiet
i checked hands at the start. he was warm at the start
hands can lie. what do i do`,
            `run 4 done. forty-one at ana's. one on the truck went quiet halfway up the hill
he was warm when he got on. hands can change. what do i do`,
          ],
          options: [
            {
              id: 'twice', stance: 'warn',
              text: 'Check twice: at the bridge and again at the gate. Nobody who has been quiet for ten minutes leaves the truck without being looked at.',
              reply: `twice. at the bridge. at the gate
ill tell ana`,
              set: { tomasCheckTwice: true },
            },
            {
              id: 'ask', stance: 'ask',
              text: 'What exactly did the one who went quiet do? That is the part to learn to spot.',
              reply: `he looked at the dashboard light
and didnt look at anything else`,
            },
            {
              id: 'keep', stance: 'reassure',
              text: 'Keep running. The rule at the bridge is enough, and there are people waiting.',
              reply: 'ok. running. the rule',
              set: { evacBreach: true },
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'stay', stance: 'warn',
          text: 'The team comes at first light, and you are the reason the west is safe tonight. One more night, engine off, lights off.',
          reply: `one more. ok. engine off. lights off
ill count the hours`,
          set: { bridgeClosed: true, tomasHeld: true },
        },
        {
          id: 'ask', stance: 'ask',
          text: 'Who is with you on the bridge? Is the nurse still there? I would like to know you are not alone.',
          reply: 'sitting with the ones who cant sleep. in the dark. she says hi tomas every hour',
        },
        {
          id: 'home', stance: 'reassure',
          text: 'Go home and sleep. You have done more than anyone asked, and the bridge will hold for a night without you.',
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
      text: [
        `Notice 18.
1. "The east end remains closed due to works."
2. Please draft.
3. Please draft it before six.
4. I have not slept.`,
        `Notice 18, before six.
1. The line is "the east end remains closed due to works".
2. Please draft.
3. I have not slept. The model railway is finished; it has been finished for hours. I do not recall finishing it.`,
      ],
      degrade: { 1: '5. 5.', 2: '5. 5. 5.' },
      variants: [
        {
          id: 'inside',
          when: gateSealed,
          text: [
            `1. The county's team called at dusk.
2. They will open the gate at first light.
3. They ask me to open it from inside.
4. If I do, I may be the first person they meet.
5. I would like to meet them awake.`,
            `1. The county's team telephoned at dusk. At first light they will open the gate, and they ask me to open it from inside.
2. I may be the first person they meet.
3. I should like to meet them awake. What would you do?`,
          ],
          options: [
            {
              id: 'open', stance: 'warn',
              text: 'Open it when they are in suits and every lamp is out. Walk out first, in the dark, with your hands open.',
              reply: [
                `1. Yes.
2. In the dark.
3. With my hands open.
4. What do you want them to know first?`,
                `1. Yes. In the dark. With my hands open.
2. What do I tell them first?`,
              ],
              set: { gateOpenedForTeam: true },
              then: toTheTeam,
            },
            {
              id: 'ask', stance: 'ask',
              text: 'Before you decide: what do you most want them to know when they see you? That tells us how to do it.',
              reply: [
                `1. That it was stable.
2. That it was not.
3. That the people at the windows can be brought back.
4. Is that the right order?`,
                `1. That it was not meant to happen. That the people at the windows can be brought back.
2. Is that the right order?`,
              ],
              then: toTheTeam,
            },
            {
              id: 'wait', stance: 'reassure',
              text: 'Wait until the county confirms in writing who is coming. Keep it sealed until then.',
              reply: [
                `1. In writing.
2. Yes.
3. That is wise.
4. What do I say to them when they do arrive?`,
                `1. In writing. That is wise.
2. And when they do arrive, what do I say first?`,
              ],
              then: toTheTeam,
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'draft', stance: 'reassure',
          text: `NOTICE 18
To residents of Varrow:
The east end remains closed while works continue at the Institute. All residents are asked to stay at home after dark. We are grateful for your cooperation.
Institute Facilities, 27 October.`,
          reply: `1. Thank you.
2. Posted.
3. It is a good notice. I do not know why it makes me so unhappy.`,
          set: { charlesBuried: true },
        },
        {
          id: 'refuse', stance: 'warn',
          text: 'I will not write another word of it. Tell the county tonight, with your name on it, and tell the clinic and Amelia at the radio. I will help you say it truthfully.',
          reply: `1. Yes.
2. With my name.
3. —`,
          set: { charlesDisclosed: true },
        },
        {
          id: 'ask', stance: 'ask',
          text: 'I can draft it. First: is there anyone left in the block who is awake and can help you? I would like to know who you have.',
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
      text: [
        `Good evening, Varrow. [PAUSE]
There are people standing outside the station window. Eleven. They came in the last hour. They are not knocking.
A man on the line says the whole west bank is dark and he cannot find his wife. The county has not called.
Tell me what to say.`,
        `Good evening, Varrow. [PAUSE]
Eleven people have gathered outside the station window. They arrived in the last hour. They are not knocking.
The west bank is dark and a man on the line cannot find his wife. The county has not rung. Tomas has not requested a song.
Tell me what to say.`,
      ],
      degrade: { 1: 'Stay warm.', 2: 'Stay warm. Stay warm.' },
      variants: [
        {
          id: 'plan',
          when: (s) => s.flags.ameliaPlan,
          text: [
            `Good evening, Varrow. [PAUSE]
The school hall has a hundred and forty people and a kettle. The clinic tent has eleven. Nobody has gone near the bridge. I read the safe places every hour. A child asked me to read them again.
There are people standing outside the station window. Eleven. They came in the last hour. They are not knocking.
Do I keep broadcasting?`,
            `Good evening, Varrow. [PAUSE]
The school hall holds a hundred and forty and a kettle; the clinic tent, eleven. Nobody has gone near the bridge. A child asked me to read the safe places again, so I did.
Eleven people stand outside the station window. They are not knocking.
Do I keep broadcasting?`,
          ],
          options: [
            {
              id: 'quiet', stance: 'warn',
              text: 'Yes, keep broadcasting, but turn off the studio light and the sign outside. They are drawn to light and noise. Read quietly.',
              reply: `[PAUSE] Quietly. Lights off. Yes. Stay warm.`,
              set: { ameliaDark: true },
            },
            {
              id: 'ask', stance: 'ask',
              text: 'Do they react when you speak? That tells me whether the broadcast is helping people or calling them.',
              reply: `They turn toward it. Every time. [PAUSE] Like sunflowers.`,
            },
            {
              id: 'louder', stance: 'reassure',
              text: 'Yes, keep going and read louder. They will lose interest and move on.',
              reply: `Louder. Yes. [PAUSE] Stay warm.`,
              set: { ameliaLoud: true },
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'truth', stance: 'warn',
          text: 'Tell the truth, quietly, with the lights off. Millside is lost, the clinic keeps its ward dark, and people should stay away from the lamps.',
          reply: `[PAUSE] Quietly. The truth. Lights off. Stay warm.`,
          set: { ameliaInformed: true, ameliaTruth: true, ameliaCautious: true, ameliaDark: true },
        },
        {
          id: 'ask', stance: 'ask',
          text: 'Who is outside the window? Do you know any of them? Tell me who they are, and I can help you decide.',
          reply: `Mrs. Pell's husband. A girl from the bake sale. [PAUSE] I know all of them.`,
        },
        {
          id: 'nothing', stance: 'reassure',
          text: 'Say nothing tonight. Play music, keep the station on, and let people hear a friendly voice.',
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
      text: [
        `one bar
nobody came. the smoke over the town is black now. the goats are quiet
maybe i overdid it with the gate. i keep thinking somebody will come up the road`,
        `one bar. nobody came. the smoke over the town has gone black and the goats have stopped complaining, which is worse
maybe i overdid the gate. i read half a paperback standing up. somebody should come up that road`,
      ],
      variants: [
        {
          id: 'open',
          when: (s) => s.flags.anaOpen && !s.flags.evacBreach,
          text: [
            `one bar
31 in the barn. goats and strangers. it smells like a festival. a woman held my hand and said thank you in the dark
at 3am one of the ones from the road stood up and walked to the door. warm hands. he said he needed the lamp
the lamp is a lantern. i put it out. he sat down`,
            `one bar. 31 in the barn, goats and strangers, smells like a village fair
a woman held my hand in the dark and thanked me. then around three a man stood up and walked toward the door and said he needed the lamp
its a lantern. i put it out. he sat down. tomas says hes never been so glad of a bad road`,
          ],
          options: [
            {
              id: 'dark', stance: 'warn',
              text: 'Keep the barn dark, quiet and warm. No lanterns, no radios. Tell them why, and they will help you keep it that way.',
              reply: `dark quiet warm. ok. ill tell them
theyre being so good about it. theyre scared`,
              set: { anaDark: true },
            },
            {
              id: 'ask', stance: 'ask',
              text: 'How many of them can still sleep? That tells you who needs watching.',
              reply: 'all of them but one. he sits up and watches the door',
            },
            {
              id: 'sleep', stance: 'reassure',
              text: 'You are doing well. Get some sleep yourself; the barn can manage for a few hours.',
              reply: 'sleep. ha. ok',
            },
          ],
        },
        {
          id: 'breach',
          when: (s) => s.flags.evacBreach,
          text: [
            `one bar
i let him in. hes in the barn. hes not moving. hes just standing facing the door
two more at the gate tonight. cold hands. they wont go away
the goats are making a noise i have never heard`,
            `one bar. i let him in and hes standing in the barn facing the door and wont be moved
two more at the gate. cold hands. they wont leave. the goats are making a sound i have never heard from them`,
          ],
          options: [
            {
              id: 'shed', stance: 'warn',
              text: 'Move him to the shed: dark, quiet, warm, door shut. Keep everyone else in the barn and keep the gate shut tonight.',
              reply: `shed. dark. door shut. ok
hes walking where i walk him. hes not fighting`,
              set: { anaWarned: true, anaDark: true },
            },
            {
              id: 'ask', stance: 'ask',
              text: 'Are any of the others in the barn showing the same thing? Tell me, and I will tell you how worried to be.',
              reply: 'one has gone quiet. the rest are fine. i think. i dont know any more',
            },
            {
              id: 'wait', stance: 'reassure',
              text: 'Wait and see. He may settle once it is dark and he has had water.',
              reply: 'wait. ok. waiting',
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'gate', stance: 'warn',
          text: 'Make the rule now: warm hands and sense, or the gate stays shut. Dark, quiet, warm inside.',
          reply: `rule. ok. dark quiet warm. ok`,
          set: { anaWarned: true, anaScreens: true },
        },
        {
          id: 'ask', stance: 'ask',
          text: 'What can you see from the rock? Tell me what is lit, what is dark, what is moving.',
          reply: 'smoke. the east lit up like a ship. the north road is empty',
        },
        {
          id: 'calm', stance: 'reassure',
          text: 'Somebody will come. Try to sleep, and let the dog keep watch.',
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
