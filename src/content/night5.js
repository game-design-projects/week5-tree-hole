// Night 5 · Fri 26 Oct. Tape. What you did on nights 1–4 arrives as a place:
// a tent, a locked ward, a bridge with a line at it. Where the east was left
// open it is gone: Ty and Charles turn tonight and leave their windows.
// Messages marked `final` belong to the night a character turns; they can be
// read but not answered (options: []).

import { evacuating, gateSealed, sealedEarly, truthOnAir } from './routes.js';

export default {
  night: 5,
  title: 'Tape',
  intro: 'There is tape across the east end. Some of what you did is now a place on the map.',
  messages: [
    // ---------------------------------------------------------------- Ty
    {
      id: 'n5-ty',
      npc: 'ty',
      at: '22:10',
      text: `its so quiet. everyone from the street went to the lamp
im in the cupboard under the stairs with pickle
i can hear them out there. theyre not saying anything. just standing
dads hands. dads hands were so cold`,
      degrade: { 1: 'im fine', 2: 'im fine. there is a light under the door' },
      variants: [
        {
          id: 'sealed',
          when: sealedEarly,
          text: `made it to the tents on the bridge side. a guy in a mask gave me a blanket and a number
charles says dad is alive in the block. ALIVE. he said it over a radio
can i go back for him`,
          facts: ['ty-dad-alive'],
          options: [
            {
              id: 'stay', stance: 'warn', label: 'Tell him to stay',
              text: 'No. Stay in the tent. They will bring him out when it is safe, and he needs you outside, not inside.',
              reply: 'ok. ok. ill stay. ill count the hours',
              set: { tyStayed: true },
            },
            {
              id: 'ask', stance: 'ask', label: 'Ask',
              text: 'What exactly did Charles say about him?',
              reply: `that he was "not alone". that he sleeps in the dark room now
he said dark room like it was a joke`,
            },
            {
              id: 'go', stance: 'reassure', label: 'Let him go back',
              text: 'Go to him. You have every right to.',
              reply: 'ok. ok going',
              set: { breach: true, tyBreach: true },
            },
          ],
        },
        {
          id: 'bridge',
          when: (s) => s.flags.tyEvac,
          text: `at the bridge. theres a line and a guy in a bus with the engine off who keeps checking everyones hands
a guy with cold hands got sent back. he cried
mrs pell is on the other side of the road. shes just looking at me
am i in the right line`,
          options: [
            {
              id: 'wait', stance: 'warn', label: 'Tell him to wait',
              text: 'Stay in the line and keep your hands where the driver can see them. You are in the right line.',
              reply: 'hands out. ok. in the right line',
              set: { tyQueue: true },
            },
            {
              id: 'ask', stance: 'ask', label: 'Ask',
              text: 'Is the driver checking everyone, every time?',
              reply: 'every single person. he asks them to say their name and their hands. then he lets them past',
            },
            {
              id: 'soon', stance: 'reassure', label: 'Reassure',
              text: 'You will be across soon.',
              reply: 'soon. ok',
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'dark', stance: 'warn', label: 'Tell him to stay hidden',
          text: 'Stay where you are. Lights off, no noise, breathe slowly. They are drawn to light and noise, not to you.',
          reply: 'no light. no noise. ok',
          set: { tyDark: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'Are they moving, or standing still?',
          reply: 'standing. then one walks to the next lamp. then stands',
        },
        {
          id: 'soon', stance: 'reassure', label: 'Reassure',
          text: 'Help is coming soon.',
          reply: 'soon. ok',
        },
      ],
      carry: {
        'meg-dark': {
          reply: 'dark room. so thats what charles meant. ok. dark. quiet. warm. i can do that for pickle too',
          set: { tyDark: true },
        },
        'ch-dark': {
          reply: 'dark quiet warm. ok. im making the cupboard darker',
          set: { tyDark: true },
        },
      },
      blank: 'um. not now',
    },
    {
      id: 'n5-ty-last',
      npc: 'ty',
      at: '22:10',
      final: true,
      text: `the lamp is so nice
dad is at the lamp
hi dad
hi dad
im fine im fine im fine`,
      facts: [],
      options: [],
    },

    // ---------------------------------------------------------------- Megan
    {
      id: 'n5-megan',
      npc: 'megan',
      at: '22:20',
      expires: '00:20',
      text: `ward's full. 12 now. i have lost count of who is sick and who is just scared
the radio says "works in the east". the car park is full of people looking at the street lamp
i can lock the ward or i can let them in`,
      variants: [
        {
          id: 'locked',
          when: (s) => s.flags.megLocked || s.flags.megIsolated,
          text: `ward is locked. 9 patients, 4 staff, lights on, radio on. they all stand at the east window
a family from millside is knocking on the glass: a mother, a little girl. warm hands through the letterbox, they talk sense
i have 9 beds. do i open`,
          options: [
            {
              id: 'dark', stance: 'warn', label: 'Dark ward, tent outside',
              text: 'Turn off every light and the radio in the ward. Put a tent in the car park for the well and check hands and answers at the door.',
              reply: `lights off. radio off. ...they are sitting down
oh. they are sitting down. nobody has sat down in three days
tent for the family. ok`,
              facts: ['meg-dark'],
              set: { megDark: true },
            },
            {
              id: 'ask', stance: 'ask', label: 'Ask',
              text: 'What do the patients do when the lights go out?',
              reply: `i do not know. i have never turned them all off
...give me a minute`,
            },
            {
              id: 'open', stance: 'reassure', label: 'Let them in',
              text: 'Let them in. Nobody should be left outside.',
              reply: 'ok. opening. ok',
              set: { breach: true, megOpened: true },
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'lock', stance: 'warn', label: 'Lock it, lights off',
          text: 'Lock the ward. Lights off, radio off. A tent outside for the well, checked at the door.',
          reply: `locking. lights off. radio off
...they're sitting down. oh my god. they're sitting down`,
          facts: ['meg-dark'],
          set: { megLocked: true, megDark: true, megIsolated: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'Which of the people in the car park have warm hands?',
          reply: 'about half. i cannot tell the rest. i am not a very good torch',
        },
        {
          id: 'open', stance: 'reassure', label: 'Let them in',
          text: 'Let them in. You cannot turn people away.',
          reply: 'ok. in. all of them. ok',
          set: { megWaits: true },
        },
      ],
      carry: {
        'ty-dad-alive': {
          reply: `a dark room. that is what charles has. ok. he is right
dark. quiet. warm. i am turning the lights off`,
          facts: ['meg-dark'],
          set: { megDark: true, megLocked: true, megIsolated: true },
        },
        'ch-dark': {
          reply: `dark, quiet, warm, no lamps. from inside. all right. all right
i am turning the lights off`,
          facts: ['meg-dark'],
          set: { megDark: true, megLocked: true, megIsolated: true },
        },
      },
      blank: 'cant right now. patients',
      missed: { set: { megWaits: true }, note: 'Megan stopped waiting and did what she could.' },
    },

    // ---------------------------------------------------------------- Tomas
    {
      id: 'n5-tomas',
      npc: 'tomas',
      at: '22:35',
      expires: '23:50',
      text: `bus is running its loop on its own. nobody gets on at millside now
i keep seeing the same man at every stop. every stop. hes always there before me
stop 14. stop 14. i think im losing the route`,
      degrade: { 1: 'stop 14', 2: 'stop 14 stop 14 one more stop' },
      variants: [
        {
          id: 'closed',
          when: (s) => s.flags.bridgeClosed,
          text: `engine off, across the bridge. 200 on the east side now, maybe more. a man shouted he'd swim. i said no
a girl asked if her mum was on the bus. i didnt know what to say
what if he swims`,
          options: [
            {
              id: 'hold', stance: 'warn', label: 'Hold the line',
              text: 'Hold the line. If anyone swims, shout, do not follow. The tents are for them on their side. The west stays closed.',
              reply: 'ok. holding. ill shout',
              set: { bridgeHeld: true },
            },
            {
              id: 'ask', stance: 'ask', label: 'Ask',
              text: 'What does the east side look like from where you are?',
              reply: `lit. all of it. the institute, every window
theyre walking toward it. not toward us`,
            },
            {
              id: 'screen', stance: 'reassure', label: 'Let the screened across',
              text: 'Check hands and answers, and let the well ones across one at a time.',
              reply: 'one at a time. hands and answers. ok',
              set: { bridgeClosed: false, evacuating: true, anaOpen: true },
            },
          ],
        },
        {
          id: 'evac',
          when: evacuating,
          text: `run 1: fourteen to ana's farm, hands checked. run 2 tonight
a man at the bridge has cold hands and begged me. i said no. he cried. thats the rule isnt it
i hate this rule`,
          facts: ['tom-run'],
          options: [
            {
              id: 'rule', stance: 'warn', label: 'Keep the rule',
              text: 'Keep it. Every pair of hands, every time. It is the only reason the others are safe.',
              reply: 'every pair. every time. ok',
            },
            {
              id: 'ask', stance: 'ask', label: 'Ask',
              text: 'How many are still on the east side?',
              reply: 'hundreds. they keep coming. some just stand',
            },
            {
              id: 'all', stance: 'reassure', label: 'Take everyone',
              text: 'Take everyone. You cannot leave them.',
              reply: 'ok. ok. everyone',
              set: { evacBreach: true },
            },
          ],
        },
        {
          id: 'parked',
          when: (s) => s.flags.tomasHeld && !s.flags.tomasCrossed,
          text: `engine off at the bridge like you said. two hundred on the east side in tents now, a guy with a loudhailer
i havent let anyone over. a lady says she has a heart condition. her hands were warm
what do i do`,
          options: [
            {
              id: 'close', stance: 'warn', label: 'Close the bridge',
              text: 'Park across it and stay with it. The tents are for them on their side. The west stays closed.',
              reply: 'across the bridge. engine off. ill stay',
              set: { bridgeClosed: true },
            },
            {
              id: 'ask', stance: 'ask', label: 'Ask',
              text: 'Can the lady wait in a tent, with a nurse, and cross when the team comes?',
              reply: 'a nurse is in the tent. ok. ill tell her',
            },
            {
              id: 'let', stance: 'reassure', label: 'Let her through',
              text: 'Her hands are warm. Let her through.',
              reply: 'ok. just her',
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'park', stance: 'warn', label: 'Park it now',
          text: 'Stop the bus at the bridge and park it across. Engine off, lights off. Now.',
          reply: 'ok. across. engine off. lights off',
          set: { bridgeClosed: true, tomasHeld: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'Who is the man you keep seeing? What does he say?',
          reply: 'one more stop. thats all he says. one more stop',
        },
        {
          id: 'keep', stance: 'reassure', label: 'Keep your route',
          text: 'Keep to your route. You will get your bearings.',
          reply: 'ok. route. stop 14',
        },
      ],
      carry: {
        'meg-dark': {
          reply: 'dark and quiet. ok. lights off. engine off. ill park across and sit in the dark',
          set: { bridgeClosed: true, tomasHeld: true },
        },
      },
      blank: 'um. stop 14?',
      missed: { set: { bridgeUnmanaged: true }, note: 'The bus kept going round its loop alone.' },
    },

    // ---------------------------------------------------------------- Charles
    {
      id: 'n5-charles',
      npc: 'charles',
      at: '22:50',
      expires: '00:30',
      text: `Notice 17.
1. "The east end remains closed due to works."
2. Please draft.
3. The crew are fine.
4. Please do not use the word "illness".
5. I have not slept.`,
      degrade: { 1: '6. 6.', 2: '6. 6. 6.' },
      variants: [
        {
          id: 'inside',
          when: gateSealed,
          text: `1. The gate is sealed.
2. Thirty-one of us are inside.
3. The crew stand at the east windows. They do not speak.
4. Ty's father is in the dark room with me. He sleeps.
5. I have written the full log.
6. I would like someone to read it.`,
          facts: ['ch-log'],
          options: [
            {
              id: 'read', stance: 'reassure', label: 'Read the log',
              text: 'Send it. I will read all of it and make sure it is not lost.',
              reply: `1. Sent.
2. Thank you.
3. It is longer than I intended.`,
            },
            {
              id: 'need', stance: 'warn', label: 'Ask what he needs',
              text: 'What do you need from outside, and what should the team know before they open the gate?',
              reply: `1. Dark.
2. Quiet.
3. Warm.
4. No lamps at the gate.
5. Please tell them.`,
              facts: ['ch-dark'],
            },
            {
              id: 'ask', stance: 'ask', label: 'Ask',
              text: 'Are you all right, Charles?',
              reply: `1. No.
2. Yes.
3. I am less afraid than I expected.`,
            },
          ],
        },
        {
          id: 'wavers',
          when: (s) => s.flags.charlesDisclosed,
          text: `1. I wrote to the county.
2. "Noted."
3. The crew are leaving the block by the east fence, in twos.
4. I cannot stop them.
5. The gate can still be sealed.`,
          options: [
            {
              id: 'seal', stance: 'warn', label: 'Seal the gate',
              text: 'Seal it now. It is late, but it will stop the rest.',
              reply: `1. Yes.
2. Now.`,
              set: { eastGateSealed: true, charlesDisclosed: true, charlesStays: true },
            },
            {
              id: 'ask', stance: 'ask', label: 'Ask',
              text: 'Where do the ones who leave go?',
              reply: `1. Toward the lamps.
2. Toward Millside.
3. Toward the light.`,
            },
            {
              id: 'go', stance: 'reassure', label: 'Let them go',
              text: 'You cannot stop them. Look after yourself.',
              reply: `1. Yes.
2. I will.`,
              set: { charlesLeaves: true },
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'draft', stance: 'reassure', label: 'Draft it',
          text: '[You draft Notice 17 exactly as asked.]',
          reply: `1. Thank you.
2. Posted.`,
          set: { charlesBuried: true },
        },
        {
          id: 'refuse', stance: 'warn', label: 'Refuse',
          text: 'No. Write the truth. Tell Megan and Amelia tonight.',
          reply: `1. Yes.
2. Perhaps.
3. —`,
          set: { charlesDisclosed: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'What is happening to the crew?',
          reply: `1. They stand at the windows.
2. They do not eat.
3. They face the lamps.`,
        },
      ],
      carry: {
        'meg-dark': {
          reply: `1. Dark. Yes.
2. That is what I found in the block.
3. I thought it was only me.`,
          set: { charlesDisclosed: true },
        },
        'ty-dad-alive': {
          reply: `1. He is. He is asleep.
2. I did not know he had been told.
3. Thank you.`,
          set: { charlesDisclosed: true },
        },
      },
      blank: `1. Not relevant.
2. Please confirm the notice.`,
      missed: { set: { charlesBuried: true }, note: 'Notice 17 went out without you.' },
    },
    {
      id: 'n5-charles-last',
      npc: 'charles',
      at: '22:50',
      final: true,
      text: `1. The crew are at the windows.
2. I am at the window.
3. The light is —
4. 1. 1. 1.`,
      facts: [],
      options: [],
    },

    // ---------------------------------------------------------------- Amelia
    {
      id: 'n5-amelia',
      npc: 'amelia',
      at: '23:10',
      expires: '00:10',
      text: `Good evening, Varrow. [PAUSE]
The bulletin said works. There is a man on the line whose wife went out to the lamp last night and has not come home. A girl whose dog will not eat. A great many people asking me why Millside is quiet.
What do I tell them?`,
      variants: [
        {
          id: 'truth',
          when: truthOnAir,
          text: `Good evening, Varrow. [PAUSE]
Thank you for the six a.m. The phones have not stopped. People are bringing blankets and asking where to send them. A man called me a liar, then apologised, then called again.
I need to tell people where to go. What do I say?`,
          options: [
            {
              id: 'places', stance: 'warn', label: 'Name the places',
              text: 'Name them: the school hall for the well, the clinic tent for the sick, and nobody on the Old Bridge. Say it slowly. Say it twice.',
              reply: `[PAUSE] The school hall. The clinic tent. Not the bridge. Twice. Stay warm.`,
              facts: ['am-plan'],
              set: { ameliaPlan: true },
            },
            {
              id: 'ask', stance: 'ask', label: 'Ask',
              text: 'What is the man who called you a liar afraid of?',
              reply: `That I am right. [PAUSE] I'll ring him back.`,
            },
            {
              id: 'again', stance: 'reassure', label: 'Read it again',
              text: 'Read the same bulletin again. People will catch it the second time.',
              reply: `Again. Yes. Stay warm.`,
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'truth', stance: 'warn', label: 'Tell them the truth',
          text: 'Tell them now. Millside is not safe, the clinic is the place for the sick, stay away from the lamps. Say the whole thing.',
          reply: `[PAUSE] The whole thing. Yes. God help me. Stay warm.`,
          set: { ameliaInformed: true, ameliaTruth: true, ameliaCautious: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'What are people on the line describing, in their own words?',
          reply: `Standing. Lamps. A hum, one woman said. [PAUSE] I wrote that one down.`,
        },
        {
          id: 'works', stance: 'reassure', label: 'Say it is works',
          text: 'Say it is works in the east. Keep people calm.',
          reply: `Works. Yes. Calm. Stay warm.`,
          set: { ameliaCalm: true },
        },
      ],
      carry: {
        'ch-trial': {
          reply: `A trial. [PAUSE] Then they get all of it at six, in order, without adjectives.`,
          set: { ameliaInformed: true, ameliaCautious: true, ameliaTruth: true },
        },
        'meg-dark': {
          reply: `Dark, quiet, warm. That's something people can DO. I'll read that first.`,
          set: { ameliaInformed: true, ameliaCautious: true, ameliaTruth: true },
        },
        'ch-log': {
          reply: `The full log. [PAUSE] I will read it on air, word for word, if Charles will let me.`,
          set: { ameliaInformed: true, ameliaCautious: true, ameliaTruth: true },
        },
      },
      blank: `That's not quite what I need for the bulletin. Stay warm.`,
      missed: { set: { ameliaCalm: true }, note: 'The bulletin went out unchanged.' },
    },

    // ---------------------------------------------------------------- Ana
    {
      id: 'n5-ana',
      npc: 'ana',
      at: '23:40',
      text: `one bar
goats are lying down in the top field. still facing east. one is shaking
nobody has come up the road yet. theres smoke over the town
should i do anything`,
      variants: [
        {
          id: 'open',
          when: (s) => s.flags.anaOpen,
          text: `one bar
seven came up the road tonight. warm hands, talked sense. i let them in. theyre in the barn with the goats
one stopped at the gate. cold hands. he didnt say anything. he just stood
hes still there`,
          facts: ['ana-count'],
          options: [
            {
              id: 'rule', stance: 'warn', label: 'Keep the rule',
              text: 'Keep the gate shut. Talk to him through it. Do not touch him. In the morning he will have moved on.',
              reply: `ok. shut. im talking to him through the gate
he doesnt answer`,
            },
            {
              id: 'ask', stance: 'ask', label: 'Ask',
              text: 'Which way is he facing?',
              reply: 'east. toward the town lights',
            },
            {
              id: 'in', stance: 'reassure', label: 'Let him in',
              text: 'Let him in. He might only be tired.',
              reply: 'ok. ok. opening',
              set: { evacBreach: true, anaRisk: true },
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'rule', stance: 'warn', label: 'Prepare the gate',
          text: 'Stock the barn and shut the gate. Make a rule: warm hands and sense, or the gate stays shut.',
          reply: `rule. ok. ill write it on the gate`,
          set: { anaWarned: true, anaScreens: true },
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'Which way are the goats facing now?',
          reply: 'east. all of them. still',
        },
        {
          id: 'calm', stance: 'reassure', label: 'Reassure',
          text: 'Try to sleep. You will hear the dog if anyone comes.',
          reply: 'ok. sleep. ha',
        },
      ],
      carry: {
        'meg-dark': {
          reply: `dark quiet warm. i have a barn like that. ok. thanks. thats the first useful thing anyone's told me`,
          set: { anaWarned: true, anaScreens: true },
        },
        'tom-run': {
          reply: `tomas runs a bus up here? checking hands? then ill have the gate open when he comes. just him`,
          set: { anaWarned: true, anaOpen: true },
        },
      },
      blank: 'one bar. cant do much with that',
    },
  ],
};
