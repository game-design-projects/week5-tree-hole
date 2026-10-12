// Night 7 · Sun 28 Oct. The 28th. Closing scenes: whoever is left writes one
// last time, in the voice of where the story went. Nothing here changes the
// ending (the flags already have); these are how it feels from inside. If Ana
// is the last person alive and unprotected, her last message is the end of the
// game: no reply, then silence.
// (Message format: see night1.js.)

import { evacuating, gateSealed, sealedEarly, truthOnAir } from './routes.js';

const plain = (id, stance, text, reply) => ({ id, stance, text, reply });

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
      text: [
        `they all walked away at dawn. the street is empty
mrs pell is lying on her step. shes breathing
i dont know whether to go out`,
        `the street emptied at dawn. everyone just walked west
mrs pell is on her step, lying down, breathing. pickle wants out
i dont know whether to go out`,
      ],
      degrade: { 1: 'im fine', 2: 'im fine. the light' },
      variants: [
        {
          id: 'sealed',
          when: sealedEarly,
          text: [
            `the people in white suits opened the gate at first light
dad walked out. he WALKED. grey and slow and he said ty and i said dad
we sat on the kerb for an hour. mrs pell is in the tent. she knows my name`,
            `the white suits opened the gate at first light and dad walked out. he walked. grey, slow, and he said "ty"
we sat on the kerb for an hour and neither of us said anything clever. mrs pell is in the tent and she knows my name`,
          ],
          options: [
            plain('glad', 'reassure', 'I am so glad, Ty. Your father walked out because you waited for him.', 'me too. i keep checking my hands. warm. every time'),
            plain('ask', 'ask', 'What happens now? What would you like to do first, when you can?', 'sleep. in the dark. with pickle. then ask dad what he wants for breakfast'),
          ],
        },
        {
          id: 'hills',
          when: (s) => s.flags.tyEvac && !s.flags.tyBreach,
          text: [
            `were at anas. pickle is chasing goats. ana gave me soup
its so quiet up here. i keep checking my hands
warm. every time. warm`,
            `we got to ana's. pickle has declared war on three goats. ana gave me soup and a paperback i wont read
its so quiet. i keep checking my hands. warm. every time`,
          ],
          options: [
            plain('glad', 'reassure', 'I am glad you are somewhere quiet, Ty, with warm hands and a dog.', 'me too. i wish dad was here. maybe he will be'),
            plain('ask', 'ask', 'What will you do tomorrow, now there is a tomorrow?', 'help ana with the goats. someone has to. maybe learn the bass properly'),
          ],
        },
      ],
      facts: [],
      options: [
        plain('wait', 'warn', 'Keep the door shut and wait for full daylight. Someone will come along the street, and Mrs. Pell will still be there.', 'ok. door shut. waiting'),
        plain('ask', 'ask', 'Can you see anyone else on the street? Anyone moving, or any lights?', 'no. just her. and the lamps. theyre still on'),
      ],
      carry: {},
      blank: 'um. not now',
    },

    // ---------------------------------------------------------------- Megan
    {
      id: 'n7-megan',
      npc: 'megan',
      at: '22:30',
      text: [
        `its morning. i am so tired i can see the edges of things
the ward is dark and everyone in it is breathing. i do not know what else to say`,
        `its morning and i am so tired the corners of the room have corners. the ward is dark and everyone in it is breathing
warfarin is on my knee. i do not know what else to say`,
      ],
      variants: [
        {
          id: 'sealed',
          when: sealedEarly,
          text: [
            `the team came at first light in white suits. the first thing they asked was who turned off the lights
i said "my friend". i did not say who
nobody turned. nobody. i keep checking my hands`,
            `the team came at first light in white suits and the first thing they asked was who turned the lights off
i said "a friend". nobody turned. nobody. i keep checking my hands, i keep checking everybody's`,
          ],
          options: [
            plain('glad', 'reassure', 'Thank you, Megan. For all of it, and for believing a text box at three in the morning.', 'thank YOU. i do not know what you are, but thank you'),
            plain('ask', 'ask', 'What will you do now? What should the team be told, before you sleep?', 'sleep. then make them teach everyone the thing about the dark'),
          ],
        },
        {
          id: 'closed',
          when: (s) => s.flags.bridgeClosed,
          text: [
            `the bridge held. tomas stayed. the clinic tent has 31 now, all warm, all asleep in the dark
the east is lost. i know that. i keep looking at it from the car park
we are still here`,
            `the bridge held. tomas stayed all night in the dark and sang dolly to himself, i could hear him from the car park
the tent has 31 asleep and warm. the east is lost. we are still here`,
          ],
          options: [
            plain('glad', 'reassure', 'You held the line, Megan. You and Tomas and everyone in that tent.', 'we did. the ones who are here, we did'),
            plain('ask', 'ask', 'What will you tell the team when they come, about the east?', 'everything. and that someone has to go into the east in the dark. with their hands open'),
          ],
        },
        {
          id: 'staying',
          when: evacuating,
          text: [
            `tomas took the last bus up the hill at four. forty more went. i could have gone with them
i am staying. someone has to keep the ward dark
tell ana i said thank you for the barn`,
            `tomas drove the last bus up the hill at four, forty more of them. i could have gone
i am staying with the ward. someone has to keep it dark. tell ana thank you for the barn, and for the cheese`,
          ],
          options: [
            plain('glad', 'reassure', 'You are the bravest person I know, Megan.', 'i am a nurse. we are not brave, we are just still here'),
            plain('ask', 'ask', 'Will you be all right, on your own with the ward?', 'i will be dark and quiet and warm. that is more than most'),
          ],
        },
        {
          id: 'record',
          when: truthOnAir,
          text: [
            `there are lights on the south road. trucks. a convoy with its lights on
amelia read it all on air until the county could not pretend any more
i am so tired. i am so glad. i am so late`,
            `lights on the south road. a convoy, headlights on. amelia read the whole story on air, hour after hour, until the county could not pretend
i am so tired and so glad and so late`,
          ],
          options: [
            plain('glad', 'reassure', 'Go and sit down, Megan. They are here now, and you can stop.', 'sitting. in the dark. with a cup of something'),
            plain('ask', 'ask', 'How many are left, do you think? You will want to know before they ask.', 'fewer than we started with. more than we would have been'),
          ],
        },
      ],
      facts: [],
      options: [
        plain('rest', 'reassure', 'Rest. You have done enough, and you are allowed to stop now.', 'enough. yes. ok'),
        plain('ask', 'ask', 'Is anyone else with you in the ward? Is there someone you can sit with?', 'one patient. he is asleep. we are both fine'),
      ],
      carry: {},
      blank: 'cant right now. patients',
    },

    // ---------------------------------------------------------------- Tomas
    {
      id: 'n7-tomas',
      npc: 'tomas',
      at: '22:50',
      text: [
        `i found ana on the north road. the bus ran out of fuel at the quarry. everyone i drove is gone
im not going back
she says theres soup`,
        `i met ana on the north road with a dog and a lantern. the bus is dead at the quarry. everyone i drove is gone
im not going back. she says theres soup. i cant remember the last time i ate`,
      ],
      variants: [
        {
          id: 'bridge',
          when: (s) => s.flags.bridgeClosed,
          text: [
            `dawn. the bridge. ive been awake four days
nobody crossed. nobody. the fire on the east side went out at five. theyre all just standing there in the grey light, facing it
the team is coming from the south. im to move the bus when they say`,
            `dawn at the bridge, four days awake. nobody crossed. the fire on the east side went out at five and theyre all standing in the grey light facing where it was
the team is coming from the south. im to move the bus when they say. i put dolly back on, very quietly`,
          ],
          options: [
            plain('glad', 'reassure', 'You held the Old Bridge, Tomas. All night, all week, with an engine that was off.', 'i parked a bus. you told me to park a bus'),
            plain('ask', 'ask', 'What will you do when they come, and you can move the bus?', 'sleep. then drive it again. but with the lights on'),
          ],
        },
        {
          id: 'evac',
          when: evacuating,
          text: [
            `last run done. 112 at anas. im so tired i can see the road moving
one hundred and twelve. every pair of hands twice
the bus is parked. engine off. lights off. i keep saying it like a prayer`,
            `last run. 112 at ana's. every pair of hands checked twice, on the bridge and at the gate
the bus is parked. engine off, lights off. i keep saying it like a prayer. dolly will have to wait`,
          ],
          options: [
            plain('glad', 'reassure', 'You got a hundred and twelve people out, Tomas. That is the whole story, really.', 'you got a hundred and twelve people out. i drove'),
            plain('ask', 'ask', 'What do you do next, now there is nothing to drive?', 'sleep in the barn with a goat on my feet'),
          ],
        },
      ],
      facts: [],
      options: [
        plain('rest', 'reassure', 'Rest. You are somewhere safe, with soup.', 'safe. ok. soup'),
        plain('ask', 'ask', 'Who is with you and Ana? Is there anyone else?', 'just us and the goats. and a dog'),
      ],
      carry: {},
      blank: 'um. stop 14?',
    },

    // ---------------------------------------------------------------- Charles
    {
      id: 'n7-charles',
      npc: 'charles',
      at: '23:05',
      text: [
        `Notice 19.
1. "The east end is closed."
2. That is all.
3. It was never works.`,
        `Notice 19.
1. "The east end is closed."
2. That is the entire notice.
3. It was never works. I should like that recorded.`,
      ],
      variants: [
        {
          id: 'team',
          when: (s) => gateSealed(s) && s.flags.gateOpenedForTeam,
          text: [
            `1. The gate is open.
2. They came in white suits at first light, and I walked out first in the dark with my hands open.
3. They are taking the crew out one at a time. Ty's father walked.
4. I have given them the log.
5. I slept.`,
            `1. The gate is open. They came in white suits at first light, and I walked out first, in the dark, with my hands open.
2. They are bringing the crew out one at a time. Ty's father walked.
3. I have given them the log, and the railway key.
4. I slept.`,
          ],
          options: [
            plain('glad', 'reassure', 'You did the right thing, Charles. All of it, in the end, and the last part first.', `1. Thank you.
2. I will say so in the report.
3. I will say who told me.`),
            plain('ask', 'ask', 'What will you do now? What is the first thing after sleep?', `1. Rest.
2. Then teach them what I know.
3. Then go and see Ty. And finish the railway.`),
          ],
        },
        {
          id: 'sealed',
          when: gateSealed,
          text: [
            `1. The gate is still sealed.
2. No one has come.
3. The crew sleep, in the dark.
4. I am at the gate. I am waiting.
5. I will wait.`,
            `1. The gate is sealed. No one has come.
2. The crew sleep, in the dark. I sit by the gate, with the log, and wait.
3. I will wait.`,
          ],
          options: [
            plain('stay', 'warn', 'Wait. They will come, and you have the log and the method. That is what they need.', `1. Yes.
2. I have both.`),
            plain('ask', 'ask', 'Are you all right? Tell me honestly, since there is nobody else here to hear.', `1. I am not afraid.
2. That is new.`),
          ],
        },
      ],
      facts: [],
      options: [
        plain('rest', 'reassure', 'Rest, Charles. The notice can wait. You have written enough of them.', `1. Yes.
2. It can.`),
        plain('ask', 'ask', 'What would you like the notice to say, if you were allowed to write it yourself?', `1. That it was a trial.
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
      text: [
        `Good evening, Varrow. [PAUSE]
It is the last bulletin of the week.
Stay warm.`,
        `Good evening, Varrow. [PAUSE]
This is the last bulletin of the week. Tomorrow, the bake sale, whatever is left of it.
Stay warm.`,
      ],
      variants: [
        {
          id: 'record',
          when: truthOnAir,
          text: [
            `Good evening, Varrow. [PAUSE]
There are lights on the south road. Trucks. A convoy with its lights on.
I have read them everything, in order, without adjectives, until nobody could pretend any more. [PAUSE]
What do I say to them now?`,
            `Good evening, Varrow. [PAUSE]
Headlights on the south road: a convoy. I have read them everything, in order, without adjectives, until nobody could pretend any longer. Tomas requested one last song, and I played it.
[PAUSE] What do I say to them now?`,
          ],
          options: [
            plain('truth', 'warn', 'Say what happened. Read who was here and who was not, then read the safe places one more time, and then stop.', `[PAUSE] The names. Yes. All of them. Then the safe places. Then I will turn the lights off.
Stay warm.`),
            plain('ask', 'ask', 'What do you want to remember about this week, so I can help you say it?', `That the phones kept ringing. [PAUSE] That people kept calling to say they were still there.`),
          ],
        },
      ],
      facts: [],
      options: [
        plain('rest', 'reassure', 'Go home, Amelia. You have said what you could. Stay warm.', 'Stay warm. Yes. You too, whatever you are.'),
        plain('ask', 'ask', 'What will you read tomorrow, if there is a tomorrow?', 'The bake sale. [PAUSE] Whatever is left of it.'),
      ],
      carry: {},
      blank: `That's not quite what I need for the bulletin. Stay warm.`,
    },

    // ---------------------------------------------------------------- Ana
    {
      id: 'n7-ana',
      npc: 'ana',
      at: '23:40',
      text: [
        `one bar
all quiet up here. the goats are eating
whoever you are, thank you for the warning`,
        `one bar. quiet. the goats are eating. the dog is eating. i have finished the paperback
whoever you are, thank you for the warning`,
      ],
      variants: [
        {
          id: 'full',
          when: (s) => s.flags.anaOpen,
          text: [
            `one bar. full signal actually. i did not know it did that
the barn is full and nobody has turned. dark, quiet, warm. every night
we have room. not much. come up`,
            `full signal, actually. i didnt know it could. the barn is full and nobody has turned
dark, quiet, warm, every night. ty and his dog have declared war on mayor, also mayor and little mayor. a family of nine has adopted the rest
we have room. not much. come up`,
          ],
          options: [
            plain('glad', 'reassure', 'Thank you, Ana, for the gate and the rule. It worked because you kept it.', 'the rule was yours. the gate was mine. we make a decent team'),
            plain('ask', 'ask', 'How many have you got up there now? I should like to be able to say.', 'i stopped counting at sixty. then i started again'),
          ],
        },
      ],
      facts: [],
      options: [
        plain('glad', 'reassure', 'Thank you, Ana. For listening to a text box.', 'one bar. you are welcome'),
        plain('ask', 'ask', 'Is anyone with you up there? Tell me who is on the farm.', 'a dog and three goats. mayor, also mayor and little mayor'),
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
