// Night 5 · Fri 26 Oct. Tape. What you did on nights 1–4 arrives as a place:
// a tent, a locked ward, a bridge with a line at it. Where the east was left
// open it is gone: Ty and Charles turn tonight and leave their windows.
// Messages marked `final` belong to the night a character turns; they can be
// read but not answered (options: []).
// (Message format: see night1.js.)

import { evacuating, gateSealed, sealedEarly, truthOnAir } from './routes.js';

// Ty, in the tent: what do I say to Dad on the radio?
const toDad = {
  options: [
    {
      id: 'f-warn', stance: 'warn',
      text: 'Tell him about Pickle and the bass. Ordinary things, short and calm. It matters more that he hears your voice than what you say.',
      reply: `pickle and the bass. yeah. "pickle ate a sock. i played the one string. its fine"
ok. thats what ill say`,
    },
    {
      id: 'f-ask', stance: 'ask',
      text: 'What would he most want to hear from you? You know him; I do not.',
      reply: `that im eating. he always asks if im eating
ok. i am. a guy in a mask gave me a sandwich`,
    },
    {
      id: 'f-reassure', stance: 'reassure',
      text: 'Tell him you are safe and you love him, and then listen more than you talk.',
      reply: `safe. love. listen. ok
thats three things. i can do three things`,
    },
  ],
};

// Megan: what do I tell the mother at the door?
const toTheMother = {
  options: [
    {
      id: 'f-warn', stance: 'warn',
      text: 'Tell her the truth: her husband is resting in a dark, quiet room and has stopped standing at the window. That is real progress, and she can see him through the glass.',
      reply: `through the glass. ok. that's allowed. that's what i can do
dark, quiet, stopped standing. i'll say it exactly like that`,
    },
    {
      id: 'f-ask', stance: 'ask',
      text: 'What does she most want to know? Answer that first, and answer it honestly.',
      reply: `whether he is in pain. he isn't. i don't think he is
ok. i'll start with that`,
    },
    {
      id: 'f-reassure', stance: 'reassure',
      text: 'Tell her he is being looked after and she should rest. There is nothing more she can do tonight.',
      reply: `looked after. rest. ok
she won't rest. nobody rests. but ok`,
    },
  ],
};

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
      text: [
        `its so quiet. everyone from the street went to the lamp
im in the cupboard under the stairs with pickle
i can hear them out there. theyre not saying anything. just standing
dads hands. dads hands were so cold`,
        `the whole street went to the lamp. i can hear their shoes and then i cant
cupboard under the stairs, pickle on my lap, dads bass case for a pillow
nobodys talking. theyre just standing. what do i do`,
      ],
      degrade: { 1: 'im fine', 2: 'im fine. there is a light under the door' },
      variants: [
        {
          id: 'sealed',
          when: sealedEarly,
          text: [
            `made it to the tents on the bridge side. a guy in a mask gave me a blanket and a number
charles says dad is alive in the block. alive. he said it over a radio
can i go back for him`,
            `im in the tent on the bridge side. blanket, number 31, a sandwich
charles said on the radio that dad is alive in the block. ALIVE
can i go back for him`,
          ],
          facts: ['ty-dad-alive'],
          options: [
            {
              id: 'stay', stance: 'warn',
              text: 'No. Stay in the tent. They will bring him out when it is safe, and he needs you outside, not inside.',
              reply: [
                `ok. ok. ill stay. ill count the hours
what do i say to him when charles puts him on the radio`,
                `stay. ok. ill count the hours
charles says he can put dad on the radio. what do i say`,
              ],
              set: { tyStayed: true },
              then: toDad,
            },
            {
              id: 'ask', stance: 'ask',
              text: 'Before you decide: what exactly did Charles say about your father? That tells us how he is.',
              reply: [
                `that he was "not alone". that he sleeps in the dark room now
he said dark room like it was a joke. what do i say to dad if he comes on the radio`,
                `"not alone", and "sleeping in the dark room". charles said it in his memo voice
what do i say to dad if i get to talk to him`,
              ],
              then: toDad,
            },
            {
              id: 'go', stance: 'reassure',
              text: 'Yes, go to him. You have every right to be with your father.',
              reply: `ok. ok going`,
              set: { breach: true, tyBreach: true },
            },
          ],
        },
        {
          id: 'bridge',
          when: (s) => s.flags.tyEvac,
          text: [
            `at the bridge. theres a line and a guy in a bus with the engine off who keeps checking everyones hands
a guy with cold hands got sent back. he cried
mrs pell is on the other side of the road. shes just looking at me
am i in the right line`,
            `bridge. theres a queue and tomas is checking hands at the bus door, asking everyones name
he sent a man back. the man cried. mrs pell is across the road looking at me
am i in the right line`,
          ],
          options: [
            {
              id: 'wait', stance: 'warn',
              text: 'Yes. Stay in the line and keep your hands where Tomas can see them. Give your name when he asks.',
              reply: `hands out. name. ok. in the right line`,
              set: { tyQueue: true },
            },
            {
              id: 'ask', stance: 'ask',
              text: 'Is Tomas checking everyone, every time? Tell me what he does, and I can tell you whether the line is safe.',
              reply: `every single person. he asks them to say their name and show their hands. then he lets them past
he sang a bit of dolly to a crying kid. thats a thing he does`,
            },
            {
              id: 'soon', stance: 'reassure',
              text: 'You will be across soon. Just keep waiting.',
              reply: 'soon. ok',
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'dark', stance: 'warn',
          text: 'Stay where you are. Lights off, no noise, breathe slowly. They are drawn to light and noise, not to you.',
          reply: 'no light. no noise. ok',
          set: { tyDark: true },
        },
        {
          id: 'ask', stance: 'ask',
          text: 'Tell me what you can see from the cupboard: are they moving, or standing still? Which way do they face?',
          reply: 'standing. then one walks to the next lamp. then stands. all facing east',
        },
        {
          id: 'soon', stance: 'reassure',
          text: 'Help is coming soon. Try to stay calm and wait.',
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
      text: [
        `ward's full. 12 now. i have lost count of who is sick and who is just scared
the radio says "works in the east". the car park is full of people looking at the street lamp
i can lock the ward or i can let them in`,
        `twelve in the ward and i've stopped telling sick from scared. the radio's still saying "works in the east"
there are people in the car park, looking at the lamp, and the cat's on my chart (warfarin sits on charts)
lock the ward or let them in`,
      ],
      variants: [
        {
          id: 'locked',
          when: (s) => s.flags.megLocked || s.flags.megIsolated,
          text: [
            `ward is locked. 9 patients, 4 staff, lights on, radio on. they all stand at the east window
a family from millside is knocking on the glass: a mother, a little girl. warm hands through the letterbox, they talk sense
i have 9 beds. do i open`,
            `ward locked. nine patients, four staff, all the lights on, and they all stand at the east window
a mother and a little girl knocking on the glass. warm hands through the letterbox, they talk sense. i have nine beds
do i open`,
          ],
          options: [
            {
              id: 'dark', stance: 'warn',
              text: 'Not the ward. Turn off every light and the radio in the ward, and put a tent in the car park for the well. Check hands and answers at the door.',
              reply: [
                `lights off. radio off. ...they are sitting down
oh. they are sitting down. nobody has sat down in three days
the mother at the door asks if her husband is in there. what do i tell her`,
                `lights off, radio off... ok. oh. they're sitting. they're SITTING
tent for the family. the mother wants to know if her husband is in here. what do i tell her`,
              ],
              facts: ['meg-dark'],
              set: { megDark: true },
              then: toTheMother,
            },
            {
              id: 'ask', stance: 'ask',
              text: 'Before you open anything: what do the patients do when the lights go out? Have you tried it, even in one room?',
              reply: [
                `i do not know. i have never turned them all off
...give me a minute. the mother is still at the glass. what do i tell her if her husband is in here`,
                `i have not tried. every light in the ward has been on for six days
what do i tell the mother at the glass if her husband is one of mine`,
              ],
              then: toTheMother,
            },
            {
              id: 'open', stance: 'reassure',
              text: 'Yes, let them in. Nobody should be left outside, especially a child.',
              reply: `ok. opening. ok`,
              set: { breach: true, megOpened: true },
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'lock', stance: 'warn',
          text: 'Lock it, and turn the lights and the radio off. Put a tent outside for the well and check hands and answers at the door.',
          reply: `locking. lights off. radio off
...they're sitting down. oh my god. they're sitting down`,
          facts: ['meg-dark'],
          set: { megLocked: true, megDark: true, megIsolated: true },
        },
        {
          id: 'ask', stance: 'ask',
          text: 'Which of the people in the car park have warm hands and talk sense? That decides how many you could look after outside.',
          reply: 'about half. i cannot tell the rest. i am not a very good torch',
        },
        {
          id: 'open', stance: 'reassure',
          text: 'Let them in. You cannot turn people away at night.',
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
      text: [
        `bus is running its loop on its own. nobody gets on at millside now
i keep seeing the same man at every stop. every stop. hes always there before me
stop 14. stop 14. i think im losing the route`,
        `the bus is doing its loop by itself. nobody boards at millside any more
same man at every stop, always there before me. dolly keeps skipping to the same verse
stop 14. i think im losing the route`,
      ],
      degrade: { 1: 'stop 14', 2: 'stop 14 stop 14 one more stop' },
      variants: [
        {
          id: 'closed',
          when: (s) => s.flags.bridgeClosed,
          text: [
            `engine off, across the bridge. 200 on the east side now, maybe more. a man shouted he'd swim. i said no
a girl asked if her mum was on the bus. i didnt know what to say
what if he swims`,
            `across the bridge, engine off. maybe 200 on the east side. one man said hed swim for it and i said please dont
a little girl asked if her mum was on my bus. i said i dont know. i cant stop thinking about it
ty from millside came down with the dog under his arm and made friends with the nurse. what if the man swims`,
          ],
          options: [
            {
              id: 'hold', stance: 'warn',
              text: 'Hold the line. If anyone swims, shout, but do not follow. The tents on their side are for them, and the west stays closed until the team comes.',
              reply: `ok. holding. ill shout
tell megan the girl's mum is ok if you find out, will you`,
              set: { bridgeHeld: true },
            },
            {
              id: 'ask', stance: 'ask',
              text: 'What does the east side look like from where you are? Tell me what they do, and I will tell you what I think.',
              reply: `lit. all of it. the institute, every window
theyre walking toward it. not toward us`,
            },
            {
              id: 'screen', stance: 'reassure',
              text: 'Check hands and answers, and let the well ones across one at a time. You cannot leave them all there.',
              reply: 'one at a time. hands and answers. ok',
              set: { bridgeClosed: false, evacuating: true, anaOpen: true },
            },
          ],
        },
        {
          id: 'evac',
          when: evacuating,
          text: [
            `run 1: fourteen to ana's farm, hands checked. run 2 tonight
a man at the bridge has cold hands and begged me. i said no. he cried. thats the rule isnt it
i hate this rule`,
            `fourteen up to ana's on run 1, every pair of hands checked. run 2 is tonight
a man with cold hands begged me to take him. i said no and he cried. thats the rule, isnt it
i hate the rule`,
          ],
          facts: ['tom-run'],
          options: [
            {
              id: 'rule', stance: 'warn',
              text: 'Yes, that is the rule, and it is the only reason the others are safe. Every pair of hands, every time.',
              reply: 'every pair. every time. ok. ana said the same, she said it in a voice like a vet',
            },
            {
              id: 'ask', stance: 'ask',
              text: 'How many are still waiting on the east side? That tells us how many runs you need.',
              reply: 'hundreds. they keep coming. some just stand',
            },
            {
              id: 'all', stance: 'reassure',
              text: 'Take everyone. You cannot leave frightened people behind, whatever their hands feel like.',
              reply: 'ok. ok. everyone',
              set: { evacBreach: true },
            },
          ],
        },
        {
          id: 'parked',
          when: (s) => s.flags.tomasHeld && !s.flags.tomasCrossed,
          text: [
            `engine off at the bridge like you said. two hundred on the east side in tents now, a guy with a loudhailer
i havent let anyone over. a lady says she has a heart condition. her hands were warm
what do i do`,
            `engine off at the bridge, like you said. there's a tent city on the east side and a man with a loudhailer
a lady with a heart condition asked to cross. warm hands. i said wait
what do i do`,
          ],
          options: [
            {
              id: 'close', stance: 'warn',
              text: 'Park across the bridge and stay with it. Her tent has a nurse; the west stays closed until the team comes.',
              reply: 'across the bridge. engine off. ill stay',
              set: { bridgeClosed: true },
            },
            {
              id: 'ask', stance: 'ask',
              text: 'Can she wait in a tent with a nurse and cross when the team arrives? Is that an option?',
              reply: 'a nurse is in the tent. ok. ill tell her',
            },
            {
              id: 'let', stance: 'reassure',
              text: 'Her hands are warm. Let her through; she needs a hospital.',
              reply: 'ok. just her',
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'park', stance: 'warn',
          text: 'Stop the bus at the bridge and park it across. Engine off, lights off, radio off. Now.',
          reply: 'ok. across. engine off. lights off',
          set: { bridgeClosed: true, tomasHeld: true },
        },
        {
          id: 'ask', stance: 'ask',
          text: 'The man you keep seeing: what does he say and what is he doing? Tell me the first thing you notice about him.',
          reply: 'one more stop. thats all he says. one more stop',
        },
        {
          id: 'keep', stance: 'reassure',
          text: 'Keep to your route. You will get your bearings back once you are on the straight.',
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
      text: [
        `Notice 17.
1. "The east end remains closed due to works."
2. Please draft.
3. The crew are fine.
4. Please do not use the word "illness".
5. I have not slept.`,
        `Notice 17, if you would.
1. The east end remains closed due to works.
2. The crew are fine.
3. Please do not use the word "illness". It does not appear in our vocabulary.
4. I have not slept. I am told this is relevant.`,
      ],
      degrade: { 1: '6. 6.', 2: '6. 6. 6.' },
      variants: [
        {
          id: 'inside',
          when: gateSealed,
          text: [
            `1. The gate is sealed.
2. Thirty-one of us are inside.
3. The crew stand at the east windows. They do not speak.
4. Ty's father is in the dark room with me. He sleeps.
5. I have written the full log.
6. I would like someone to read it.`,
            `1. The gate is sealed. I am inside.
2. Thirty-one of us. The crew stand at the east windows and do not speak.
3. Ty's father sleeps in the dark room beside me. The nurse was right about the dark.
4. I have written the log in full. I should like it read.`,
          ],
          facts: ['ch-log'],
          options: [
            {
              id: 'read', stance: 'reassure',
              text: 'Send it. I will read all of it and make sure it is not lost.',
              reply: `1. Sent.
2. Thank you.
3. It is longer than I intended.`,
            },
            {
              id: 'need', stance: 'warn',
              text: 'Before you send it: what do you need from outside, and what should the team know before they open the gate?',
              reply: `1. Dark.
2. Quiet.
3. Warm.
4. No lamps at the gate.
5. Please tell them.`,
              facts: ['ch-dark'],
            },
            {
              id: 'ask', stance: 'ask',
              text: 'I will read it. First: are you all right, Charles? Tell me honestly.',
              reply: `1. No.
2. Yes.
3. I am less afraid than I expected.`,
            },
          ],
        },
        {
          id: 'wavers',
          when: (s) => s.flags.charlesDisclosed,
          text: [
            `1. I wrote to the county.
2. "Noted."
3. The crew are leaving the block by the east fence, in twos.
4. I cannot stop them.
5. The gate can still be sealed.`,
            `1. I wrote to the county again, and again was noted.
2. The crew are leaving by the east fence in pairs. I cannot stop them.
3. The gate can still be sealed. It is Friday. I am rather late.`,
          ],
          options: [
            {
              id: 'seal', stance: 'warn',
              text: 'Seal it now. It is late, but it will stop the rest from leaving.',
              reply: `1. Yes.
2. Now.`,
              set: { eastGateSealed: true, charlesDisclosed: true, charlesStays: true },
            },
            {
              id: 'ask', stance: 'ask',
              text: 'Where do the ones who leave go? That tells us what sealing it will protect.',
              reply: `1. Toward the lamps.
2. Toward Millside.
3. Toward the light.`,
            },
            {
              id: 'go', stance: 'reassure',
              text: 'You cannot stop them all. Look after yourself, and get out while you can.',
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
          id: 'draft', stance: 'reassure',
          text: `NOTICE 17
To residents of Varrow:
The east end remains closed while works continue at the Institute. Residents of Millside are asked to remain indoors until further notice. We thank you for your patience.
Institute Facilities, 26 October.`,
          reply: `1. Thank you.
2. Posted.
3. I notice I wrote "patience" myself on Monday. I do not recall why.`,
          set: { charlesBuried: true },
        },
        {
          id: 'refuse', stance: 'warn',
          text: 'I will not write "works" again, and I will not leave out "illness". Tell the county and the clinic tonight, in writing, with your name on it, and I will help you word it.',
          reply: `1. Yes.
2. Perhaps.
3. —`,
          set: { charlesDisclosed: true },
        },
        {
          id: 'ask', stance: 'ask',
          text: 'I can draft it. First, tell me what is happening to the crew, so I know what the notice has to leave out.',
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
      text: [
        `Good evening, Varrow. [PAUSE]
The bulletin said works. There is a man on the line whose wife went out to the lamp last night and has not come home. A girl whose dog will not eat. A great many people asking me why Millside is quiet.
What do I tell them?`,
        `Good evening, Varrow. [PAUSE]
Last night I read "works". Tonight a man rang to say his wife walked out to the lamp and has not come back, and a girl rang about her dog. Everyone asks why Millside is so quiet.
What do I tell them?`,
      ],
      variants: [
        {
          id: 'truth',
          when: truthOnAir,
          text: [
            `Good evening, Varrow. [PAUSE]
Thank you for the six a.m. The phones have not stopped. People are bringing blankets and asking where to send them. A man called me a liar, then apologised, then called again.
I need to tell people where to go. What do I say?`,
            `Good evening, Varrow. [PAUSE]
After the six a.m. the phones have not stopped. Blankets, kettles, a man who called me a liar and rang back to apologise. Mrs. Pell's daughter asked what to do with the lemon drizzle.
I must tell people where to go. What do I say?`,
          ],
          options: [
            {
              id: 'places', stance: 'warn',
              text: 'Name them: the school hall for the well, the clinic tent for the sick, and nobody on the Old Bridge. Say it slowly, and say it twice.',
              reply: `[PAUSE] The school hall. The clinic tent. Not the bridge. Twice. Stay warm.`,
              facts: ['am-plan'],
              set: { ameliaPlan: true },
            },
            {
              id: 'ask', stance: 'ask',
              text: 'Before the places, find out what the man who called you a liar is afraid of. Answer that, and the rest will be easier to hear.',
              reply: `That I am right. [PAUSE] I'll ring him back.`,
            },
            {
              id: 'again', stance: 'reassure',
              text: 'Read the same bulletin again. People will catch it the second time, and it keeps them calm.',
              reply: `Again. Yes. Stay warm.`,
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'truth', stance: 'warn',
          text: 'Tell them now. Millside is not safe, the clinic is the place for the sick, and people should stay away from the lamps. Say the whole thing, calmly.',
          reply: `[PAUSE] The whole thing. Yes. God help me. Stay warm.`,
          set: { ameliaInformed: true, ameliaTruth: true, ameliaCautious: true },
        },
        {
          id: 'ask', stance: 'ask',
          text: 'What are people on the line actually describing, in their own words? I would rather say what they said than guess.',
          reply: `Standing. Lamps. A hum, one woman said. [PAUSE] I wrote that one down.`,
        },
        {
          id: 'works', stance: 'reassure',
          text: 'Tell them it is works in the east and the council is on it. Keep people calm.',
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
      text: [
        `one bar
goats are lying down in the top field. still facing east. one is shaking
nobody has come up the road yet. theres smoke over the town
should i do anything`,
        `one bar. the goats lie in the top field facing east and little mayor is shaking
nobody on the road yet. smoke over the town, a lot of it
should i do something or is this what a farmer does, watch`,
      ],
      variants: [
        {
          id: 'open',
          when: (s) => s.flags.anaOpen,
          text: [
            `one bar
seven came up the road tonight. warm hands, talked sense. i let them in. theyre in the barn with the goats
one stopped at the gate. cold hands. he didnt say anything. he just stood
hes still there`,
            `one bar. seven came up tonight, warm hands, talked sense, now theyre in the barn arguing with the goats
one stopped at the gate with cold hands and said nothing. hes still there. the dog wont look at him`,
          ],
          facts: ['ana-count'],
          options: [
            {
              id: 'rule', stance: 'warn',
              text: 'Keep the gate shut and talk to him through it. Do not touch him. In the morning, see whether he has moved on.',
              reply: `ok. shut. im talking to him through the gate
he doesnt answer`,
            },
            {
              id: 'ask', stance: 'ask',
              text: 'Tell me which way he is facing, and what he does when you move the lantern. That decides what to do.',
              reply: 'east. toward the town lights. he follows the lantern with his eyes and nothing else',
            },
            {
              id: 'in', stance: 'reassure',
              text: 'Let him in. He may only be tired and frightened, and he is right outside your gate.',
              reply: 'ok. ok. opening',
              set: { evacBreach: true, anaRisk: true },
            },
          ],
        },
      ],
      facts: [],
      options: [
        {
          id: 'rule', stance: 'warn',
          text: 'Stock the barn, shut the gate, and make a rule: warm hands and sense, or the gate stays shut. Dark, quiet, warm inside.',
          reply: `rule. ok. ill write it on the gate`,
          set: { anaWarned: true, anaScreens: true },
        },
        {
          id: 'ask', stance: 'ask',
          text: 'Which way are the goats facing now, and has the dog changed? Those are the signs I would watch.',
          reply: 'east. all of them. still. the dog is under the porch and wont come out',
        },
        {
          id: 'calm', stance: 'reassure',
          text: 'Try to sleep. The dog will wake you if anyone comes, and there is nothing more to do tonight.',
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
