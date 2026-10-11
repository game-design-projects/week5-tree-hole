// Night 7 · Sun 28 Oct. The 28th. Closing scenes: whoever is left writes one
// last time, in the voice of where the story went. Nothing here changes the
// ending (the flags already have); these are how it feels from inside. If Ana
// is the last person alive and unprotected, her last message is the end of the
// game: no reply, then silence.

import { evacuating, gateSealed, sealedEarly, truthOnAir } from './routes.js';

const plain = (id, stance, label, text, reply) => ({ id, stance, label, text, reply });

export default {
  night: 7,
  title: 'The 28th',
  intro: 'It is the last night. Whoever is left will write to you one more time.',
  messages: [
    // ---------------------------------------------------------------- Ty
    {
      id: 'n7-ty',
      npc: 'ty',
      at: '22:15',
      text: `they all walked away at dawn. the street is empty
mrs pell is lying on her step. shes breathing
i dont know whether to go out`,
      degrade: { 1: 'im fine', 2: 'im fine. the light' },
      variants: [
        {
          id: 'sealed',
          when: sealedEarly,
          text: `the people in white suits opened the gate at first light
dad walked out. he WALKED. grey and slow and he said ty and i said dad
we sat on the kerb for an hour. mrs pell is in the tent. she knows my name`,
          options: [
            plain('glad', 'reassure', 'I am glad', 'I am so glad, Ty.', 'me too. i keep checking my hands. warm. every time'),
            plain('ask', 'ask', 'Ask', 'What will you do now?', 'sleep. in the dark. with pickle. then ask dad what he wants for breakfast'),
          ],
        },
        {
          id: 'hills',
          when: (s) => s.flags.tyEvac && !s.flags.tyBreach,
          text: `were at anas. pickle is chasing goats. ana gave me soup
its so quiet up here. i keep checking my hands
warm. every time. warm`,
          options: [
            plain('glad', 'reassure', 'I am glad', 'I am glad you are somewhere quiet, Ty.', 'me too. i wish dad was here. maybe he will be'),
            plain('ask', 'ask', 'Ask', 'What will you do tomorrow?', 'help ana with the goats. someone has to'),
          ],
        },
      ],
      facts: [],
      options: [
        plain('wait', 'warn', 'Tell him to wait', 'Keep the door shut and wait for the daylight. Someone will come along the street.', 'ok. door shut. waiting'),
        plain('ask', 'ask', 'Ask', 'Can you see anyone else on the street?', 'no. just her. and the lamps. theyre still on'),
      ],
      carry: {},
      blank: 'um. not now',
    },

    // ---------------------------------------------------------------- Megan
    {
      id: 'n7-megan',
      npc: 'megan',
      at: '22:30',
      text: `its morning. i am so tired i can see the edges of things
the ward is dark and everyone in it is breathing. i do not know what else to say`,
      variants: [
        {
          id: 'sealed',
          when: sealedEarly,
          text: `the team came at first light in white suits. the first thing they asked was who turned off the lights
i said "my friend". i did not say who
nobody turned. nobody. i keep checking my hands`,
          options: [
            plain('glad', 'reassure', 'Thank her', 'Thank you, Megan. For all of it.', 'thank YOU. i do not know what you are, but thank you'),
            plain('ask', 'ask', 'Ask', 'What will you do now?', 'sleep. then make them teach everyone the thing about the dark'),
          ],
        },
        {
          id: 'closed',
          when: (s) => s.flags.bridgeClosed,
          text: `the bridge held. tomas stayed. the clinic tent has 31 now, all warm, all asleep in the dark
the east is lost. i know that. i keep looking at it from the car park
we are still here`,
          options: [
            plain('glad', 'reassure', 'Tell her she did well', 'You held the line, Megan.', 'we did. the ones who are here, we did'),
            plain('ask', 'ask', 'Ask', 'What will you tell the team?', 'everything. and that someone has to go into the east in the dark. with their hands open'),
          ],
        },
        {
          id: 'staying',
          when: evacuating,
          text: `tomas took the last bus up the hill at four. forty more went. i could have gone with them
i am staying. someone has to keep the ward dark
tell ana i said thank you for the barn`,
          options: [
            plain('glad', 'reassure', 'Say goodbye', 'You are the bravest person I know.', 'i am a nurse. we are not brave, we are just still here'),
            plain('ask', 'ask', 'Ask', 'Will you be all right?', 'i will be dark and quiet and warm. that is more than most'),
          ],
        },
        {
          id: 'record',
          when: truthOnAir,
          text: `there are lights on the south road. trucks. a convoy with its lights on
amelia read it all on air until the county could not pretend any more
i am so tired. i am so glad. i am so late`,
          options: [
            plain('glad', 'reassure', 'Tell her to rest', 'Go and sit down, Megan. They are here.', 'sitting. in the dark. with a cup of something'),
            plain('ask', 'ask', 'Ask', 'How many are left?', 'fewer than we started with. more than we would have been'),
          ],
        },
      ],
      facts: [],
      options: [
        plain('rest', 'reassure', 'Tell her to rest', 'Rest. You have done enough.', 'enough. yes. ok'),
        plain('ask', 'ask', 'Ask', 'Is anyone else with you?', 'one patient. he is asleep. we are both fine'),
      ],
      carry: {},
      blank: 'cant right now. patients',
    },

    // ---------------------------------------------------------------- Tomas
    {
      id: 'n7-tomas',
      npc: 'tomas',
      at: '22:50',
      text: `i found ana on the north road. the bus ran out of fuel at the quarry. everyone i drove is gone
im not going back
she says theres soup`,
      variants: [
        {
          id: 'bridge',
          when: (s) => s.flags.bridgeClosed,
          text: `dawn. the bridge. ive been awake four days
nobody crossed. nobody. the fire on the east side went out at five. theyre all just standing there in the grey light, facing it
the team is coming from the south. im to move the bus when they say`,
          options: [
            plain('glad', 'reassure', 'Thank him', 'You held the Old Bridge, Tomas. All night, all week.', 'i parked a bus. you told me to park a bus'),
            plain('ask', 'ask', 'Ask', 'What will you do when they come?', 'sleep. then drive it again. but with the lights on'),
          ],
        },
        {
          id: 'evac',
          when: evacuating,
          text: `last run done. 112 at anas. im so tired i can see the road moving
one hundred and twelve. every pair of hands twice
the bus is parked. engine off. lights off. i keep saying it like a prayer`,
          options: [
            plain('glad', 'reassure', 'Thank him', 'You got a hundred and twelve people out, Tomas.', 'you got a hundred and twelve people out. i drove'),
            plain('ask', 'ask', 'Ask', 'What do you do next?', 'sleep in the barn with a goat on my feet'),
          ],
        },
      ],
      facts: [],
      options: [
        plain('rest', 'reassure', 'Tell him to rest', 'Rest. You are somewhere safe.', 'safe. ok. soup'),
        plain('ask', 'ask', 'Ask', 'Is anyone else with you and Ana?', 'just us and the goats. and a dog'),
      ],
      carry: {},
      blank: 'um. stop 14?',
    },

    // ---------------------------------------------------------------- Charles
    {
      id: 'n7-charles',
      npc: 'charles',
      at: '23:05',
      text: `Notice 19.
1. "The east end is closed."
2. That is all.
3. It was never works.`,
      variants: [
        {
          id: 'team',
          when: (s) => gateSealed(s) && s.flags.gateOpenedForTeam,
          text: `1. The gate is open.
2. They came in white suits at first light, and I walked out first in the dark with my hands open.
3. They are taking the crew out one at a time. Ty's father walked.
4. I have given them the log.
5. I slept.`,
          options: [
            plain('glad', 'reassure', 'Tell him he did right', 'You did the right thing, Charles. All of it, in the end.', `1. Thank you.
2. I will say so in the report.
3. I will say who told me.`),
            plain('ask', 'ask', 'Ask', 'What will you do now?', `1. Rest.
2. Then teach them what I know.
3. Then go and see Ty.`),
          ],
        },
        {
          id: 'sealed',
          when: gateSealed,
          text: `1. The gate is still sealed.
2. No one has come.
3. The crew sleep, in the dark.
4. I am at the gate. I am waiting.
5. I will wait.`,
          options: [
            plain('stay', 'warn', 'Tell him to wait', 'Wait. They will come. You have the log and the method.', `1. Yes.
2. I have both.`),
            plain('ask', 'ask', 'Ask', 'Are you all right?', `1. I am not afraid.
2. That is new.`),
          ],
        },
      ],
      facts: [],
      options: [
        plain('rest', 'reassure', 'Tell him to rest', 'Rest, Charles. The notice can wait.', `1. Yes.
2. It can.`),
        plain('ask', 'ask', 'Ask', 'What would you like the notice to say?', `1. That it was a trial.
2. That it failed.
3. That I knew.`),
      ],
      carry: {},
      blank: `1. Not relevant.`,
    },

    // ---------------------------------------------------------------- Amelia
    {
      id: 'n7-amelia',
      npc: 'amelia',
      at: '23:25',
      text: `Good evening, Varrow. [PAUSE]
It is the last bulletin of the week.
Stay warm.`,
      variants: [
        {
          id: 'record',
          when: truthOnAir,
          text: `Good evening, Varrow. [PAUSE]
There are lights on the south road. Trucks. A convoy with its lights on.
I have read them everything, in order, without adjectives, until nobody could pretend any more. [PAUSE]
What do I say to them now?`,
          options: [
            plain('truth', 'warn', 'Say what happened', 'Say who was here and who was not. Read the names. Then read the safe places one more time.', `[PAUSE] The names. Yes. All of them. Then the safe places. Then I will turn the lights off.
Stay warm.`),
            plain('ask', 'ask', 'Ask', 'What do you want to remember about this week?', `That the phones kept ringing. [PAUSE] That people kept calling to say they were still there.`),
          ],
        },
      ],
      facts: [],
      options: [
        plain('rest', 'reassure', 'Tell her to rest', 'Go home, Amelia. Stay warm.', 'Stay warm. Yes. You too, whatever you are.'),
        plain('ask', 'ask', 'Ask', 'What will you read tomorrow?', 'The bake sale. [PAUSE] Whatever is left of it.'),
      ],
      carry: {},
      blank: `That's not quite what I need for the bulletin. Stay warm.`,
    },

    // ---------------------------------------------------------------- Ana
    {
      id: 'n7-ana',
      npc: 'ana',
      at: '23:40',
      text: `one bar
all quiet up here. the goats are eating
whoever you are, thank you for the warning`,
      variants: [
        {
          id: 'full',
          when: (s) => s.flags.anaOpen,
          text: `one bar. full signal actually. i did not know it did that
the barn is full and nobody has turned. dark, quiet, warm. every night
we have room. not much. come up`,
          options: [
            plain('glad', 'reassure', 'Thank her', 'Thank you, Ana. For the gate and the rule.', 'the rule was yours. the gate was mine. we make a decent team'),
            plain('ask', 'ask', 'Ask', 'How many have you got?', 'i stopped counting at sixty. then i started again'),
          ],
        },
      ],
      facts: [],
      options: [
        plain('glad', 'reassure', 'Thank her', 'Thank you, Ana.', 'one bar. you are welcome'),
        plain('ask', 'ask', 'Ask', 'Is anyone with you?', 'a dog and three goats. mayor, also mayor and little mayor'),
      ],
      carry: {},
      blank: 'one bar. cant do much with that',
    },
    {
      id: 'n7-ana-last',
      npc: 'ana',
      at: '23:40',
      final: true,
      text: `one bar
goats are all facing east
the sun is up and i cant stop looking at it
its so bright its so bright its so
the same sentence the same sen`,
      facts: [],
      options: [],
    },
  ],
};
