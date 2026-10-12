// Night 3, Wednesday 24 October: "The longest night"
// Millside and the Institute are overrun unless the east was sealed in time. Ty and
// Charles turn tonight unless something protected them; if they do, only their
// `final` message comes. Everyone else is judged at dawn. Tags as in night1.js:
//   leak  0 common sense · 1 inference from this user's own words · 2 a hint built
//         on someone else's information · 3 says it outright, or names them
//   from  whose information the reply uses (never the person being answered)
// A reply may only use what the player could already have read by then: the
// texts of earlier messages, never earlier replies.

export default {
  night: 3,
  title: 'The longest night',
  intro: 'Whatever happens before morning will be in Thursday’s paper.',
  messages: [
    // ------------------------------------------------------------------ 22:00
    {
      id: 'n3-ty-final',
      npc: 'ty',
      at: '22:15',
      final: true,
      text: `it's gone really quiet
everyone from our street is outside under the lamp. mrs pell, the man from number nine, the twins from the end house. they look so calm
pickle won't come out of the cupboard. it's ok pickle
dad's there too. right in the middle. he's got his good coat on
the light is so nice
hi dad`,
      variants: [
        {
          id: 'gate',
          when: (s) => s.flags.tyBreach,
          text: `i'm at the institute gate. i came to find dad like i said i would
the big light over the gate is on and everyone's standing under it. the whole night crew. dad's right at the front
he looked at me and said ty. just once
it's warm here. it's so bright
hi dad`,
        },
      ],
      options: [
        {
          id: 'home', leak: 0,
          text: 'Ty, it’s late and it’s cold. Go back inside, shut the door and turn the light off. Pickle is waiting for you.',
          reply: `pickle
pickle is at the window
light`,
        },
        {
          id: 'pickle', leak: 1,
          text: 'Ty, talk to me for a minute instead of looking at the light. Tell me about Pickle. Is he still keeping watch at the front window?',
          reply: `yeah
he's looking at me
light
hi dad`,
        },
      ],
    },
    {
      id: 'n3-ty-cupboard',
      npc: 'ty',
      at: '22:15',
      text: `i'm in the cupboard under the stairs with pickle. lights off, door shut
the whole street went out to the lamp after tea. not just mrs pell now. everyone. they're standing in a big circle under it, looking up
nobody's talking. i can hear the bulb buzzing from in here
pickle keeps whining. what if he barks`,
      variants: [
        {
          id: 'sealed',
          when: (s) => s.flags.sealedEast,
          text: `i'm in the cupboard under the stairs with pickle. probably overkill but whatever
there's tape across the end of our road and people in white suits. a van went past with a speaker saying stay indoors, lights off
mrs pell is still under the lamp outside. two others now as well. the suits just watch them
pickle keeps whining. what if he barks`,
        },
      ],
      options: [
        {
          id: 'quiet', leak: 0,
          text: 'Hold him close and talk to him softly. Dogs settle when they can feel you near them. If you’ve got something he can chew, give him that.',
          reply: `he's chewing a sock. obviously
ok he's quieter`,
        },
        {
          id: 'dark', leak: 1,
          text: 'Keep him close and keep it properly dark in there: phone face down, brightness right down. Everyone outside has gone to the lamp, so light is what pulls them. Don’t give them a second one to look at.',
          reply: `phone face down. brightness on 1
pickle's under my hoodie. he stopped whining`,
        },
        {
          id: 'warm', leak: 2, from: ['megan'],
          text: 'Get a blanket over both of you and stay put. People who get the way your neighbours are seem to settle in the dark, the quiet and the warm, and so do frightened dogs. Keep it that way in there all night.',
          reply: `how do you know what settles them
...ok. blanket. he stopped whining`,
          set: { tySafe: true },
        },
        {
          id: 'clinic', leak: 3, from: ['megan'],
          text: 'A nurse at the Varrow clinic, Megan, has found that people with this calm down in a dark, quiet, warm room. Do the same in there: blanket over you both, phone face down, and don’t open the front door to anyone tonight.',
          reply: `who's megan?? how do you know what her patients do
ok. blanket. not opening the door`,
          set: { tySafe: true },
        },
      ],
    },
    {
      id: 'n3-megan-carpark',
      npc: 'megan',
      at: '22:30',
      text: `twelve patients now. twelve. i've got beds in the corridor
and the car park's full. not of cars. people. thirty, forty, all standing round the lamp by the entrance, looking up at it
a few of them are banging on the glass asking to come in. some of them i know
my lot inside are calmer since we went dark, but every time the doors open the light comes in and they all stand up
do i lock the doors and keep it dark, or let them in? some of them might just be scared`,
      variants: [
        {
          id: 'isolated',
          when: (s) => s.flags.megIsolated,
          text: `twelve patients now. ward's locked, staff gloved, nobody in or out since last night
but the car park's full. not of cars. people. thirty, forty, all standing round the lamp by the entrance, looking up at it
a few of them are banging on the glass asking to come in. some of them i know. one of them taught me to drive
it would be so easy to open the doors. some of them might just be scared. do i?`,
        },
      ],
      options: [
        {
          id: 'open', leak: 0,
          text: 'If people are frightened and asking for help, let them in. Put the ones who seem well in the waiting room and the rest on the ward, and keep notes on everyone.',
          reply: `doors open. they're coming in. so quiet. so polite
they're all looking at the corridor lights`,
          set: { megOpened: true },
        },
        {
          id: 'lock', leak: 1,
          text: 'Keep the doors locked. You said yourself your patients only settle when it’s dark and the doors stay shut. Forty people from under a lamp would undo all of that. Talk to the ones at the glass through the door, and keep the ward dark.',
          reply: `locked. i'm talking to them through the glass
they're not really listening. they're looking past me at the exit sign`,
          set: { megIsolated: true },
        },
        {
          id: 'lamp', leak: 2, from: ['ty', 'tomas'],
          text: 'Keep the doors locked, and get that car park lamp switched off if you can. For two nights now, people from the east end have been walking out to street lamps and standing under them for hours. It’s the light they’re drawn to, not your door.',
          reply: `the east end? who's telling you that
...rang the council. they're "looking into" the lamp. doors stay locked`,
          set: { megIsolated: true },
        },
        {
          id: 'source', leak: 3, from: ['charles'],
          text: 'Lock the doors and keep the ward dark. The people in your car park have the same thing as your patients. It started in East Block at the Institute when a trial went wrong on the 20th, and the night crew there have been standing at their windows ever since. Nobody from the car park comes in tonight.',
          reply: `a trial. in east block. on the 20th
how do you know that and i don't. doors locked. i'm writing it down`,
          set: { megIsolated: true, megKnowsInstitute: true },
        },
      ],
    },
    {
      id: 'n3-charles-final',
      npc: 'charles',
      at: '22:45',
      final: true,
      text: `1. The crew are at the windows.
2. I am at the window.
3. The light over the east yard is
4. It is very good light.
5. 1.
1.
1.`,
      options: [
        {
          id: 'back', leak: 0,
          text: 'Charles, step back from the window. Sit down with your back to it and count to ten for me, slowly.',
          reply: `1.
2.
1.
1.`,
        },
        {
          id: 'list', leak: 1,
          text: 'Charles, you wrote that the crew are at the windows. You don’t have to be. Turn around and number the things you can see in the dark for me.',
          reply: `1. The light.
1. The light.
1.`,
        },
      ],
    },
    {
      id: 'n3-charles-windows',
      npc: 'charles',
      at: '22:50',
      text: `Good evening.
1. The county closed the Millside road at the quarry this afternoon. A clinic reported a cluster. It was not me.
2. The crew are at the windows. Seven of nine. Two were not at their posts on my six o'clock round.
3. They do not sleep, and they speak only to say one word.
4. The inner gate of East Block can be sealed from this side. It takes one person to turn the wheel, and that person stays inside.
5. Or I could write it all down, with my name at the bottom, and walk out to the people at the tape.
6. One of these is my duty. The other is also my duty. I find I cannot tell which is which.`,
      variants: [
        {
          id: 'disclosed',
          when: (s) => s.flags.charlesDisclosed,
          text: `Good evening.
1. I gave the county my statement last night. Forty-one pages, with my name on every one.
2. They closed the east end by noon. They have asked me to stay on site and keep the crew comfortable until their team can come in.
3. The crew are at the windows. Seven of nine. Two were not at their posts on my six o'clock round.
4. The inner gate of East Block can be sealed from this side. It takes one person to turn the wheel, and that person stays inside with them.
5. I keep thinking it ought to be me.`,
          options: [
            {
              id: 'brave', leak: 0,
              text: 'That’s a brave thing to offer. If the county wants the crew kept together and someone has to turn the wheel, make sure they know you’re inside, and keep your phone charged.',
              reply: `1. Brave. Yes.
2. I have told them.
3. The wheel turned more easily than I expected.`,
              set: { eastGateSealed: true },
            },
            {
              id: 'out', leak: 1,
              text: 'You’ve already done the hard part: you wrote it all down and signed it. The county asked you to keep the crew comfortable, not to lock yourself in with them. Leave the wheel alone and stay on this side of the gate.',
              reply: `1. This side of the gate.
2. Yes.
3. I had not read the instruction that way. I have read it again.`,
            },
            {
              id: 'dark', leak: 2, from: ['megan'],
              text: 'Don’t lock yourself in. Turn off every light in East Block instead. People like your crew settle in the dark, the quiet and the warm, and you can keep them comfortable from this side of the gate.',
              reply: `1. How do you know what settles them?
2. I have turned the yard lights off.
3. Three of them have sat down. I am staying on this side.`,
            },
          ],
        },
        {
          id: 'buried',
          when: (s) => s.flags.charlesBuried,
          text: `Good evening.
1. Notice 15 went up. People stayed indoors. It did not help.
2. The county closed the Millside road at the quarry this afternoon anyway. A clinic reported a cluster.
3. The crew are at the windows. Seven of nine. Two were not at their posts on my six o'clock round.
4. The inner gate of East Block can be sealed from this side. It takes one person to turn the wheel, and that person stays inside.
5. Or I could write it all down, with my name at the bottom, and walk out to the people at the tape.
6. I have written a great many things this week. None of them had my name on.`,
        },
      ],
      options: [
        {
          id: 'procedure', leak: 0,
          text: 'If your site has a containment procedure, follow it. If that means sealing the inner gate, seal it, and make sure someone outside knows you’re in there.',
          reply: `1. The procedure. Yes.
2. I wrote the procedure.
3. The wheel turned more easily than I expected.`,
          set: { eastGateSealed: true },
        },
        {
          id: 'write', leak: 1,
          text: 'Write it down. You said the county has already closed the road. What they don’t have is what happened in East Block, and only you can give them that. Sign every page, walk out to the tape, and hand it to the first person in a suit.',
          reply: `1. Every page. Yes.
2. It is four hundred metres to the tape. I have measured it before, for other reasons.
3. I am writing.`,
          set: { charlesDisclosed: true },
        },
        {
          id: 'dark', leak: 2, from: ['megan'],
          text: 'Don’t lock yourself in with them. Turn off every light in the block first: people like your crew settle in the dark, the quiet and the warm. Then write it all down, sign it, and take it out to the tape. They need you talking, not behind a gate.',
          reply: `1. How do you know what settles them?
2. I have turned the yard lights off. Two of them sat down.
3. I am writing.`,
          set: { charlesDisclosed: true },
        },
        {
          id: 'clinic', leak: 3, from: ['megan', 'ty'],
          text: 'Don’t seal yourself in. Megan, the nurse at the Varrow clinic, found that patients like your crew calm down in a dark, quiet, warm room. And a boy in Millside whose dad is on your crew is still at home, waiting for any news at all. Write it down, sign it, and walk out. You’re the only one who can tell them what happened.',
          reply: `1. Megan. Dan's boy.
2. You talk to all of them.
3. Very well. I will be the one who talks.`,
          set: { charlesDisclosed: true },
        },
      ],
    },
    {
      id: 'n3-tomas-bridge',
      npc: 'tomas',
      at: '23:05',
      text: `at the old bridge. stop 14. engine running
theres people coming down quarry road from millside on foot. not ten or twenty. like a hundred. suitcases, slippers, kids
some look fine and just scared. some look like the one more stop guy, grey and cold and staring at the bridge lamps
a woman with a little boy is at my door saying her hands are warm, begging me to take them over
i cant take a hundred. what do i do`,
      degrade: { 1: 'also the lamp at stop 14 has six people under it already' },
      variants: [
        {
          id: 'parked',
          when: (s) => s.flags.bridgeClosed,
          text: `second night parked across the old bridge. engine off, lights off
theres people coming down quarry road from millside on foot. like a hundred. suitcases, slippers, kids
some look fine and just scared. some look like the one more stop guy, grey and cold and staring at the bridge lamps
a woman with a little boy is at my door saying her hands are warm, begging me to drive them over
if i move the bus, everyone comes across. what do i do`,
          options: [
            {
              id: 'move', leak: 0,
              text: 'Take the woman and her son across. Then park back across the bridge as quickly as you can.',
              reply: `moving. just a bit. just for them
oh no. theyre all coming. theyre all coming past the bus`,
              set: { tomasCrossed: true, breach: true, bridgeClosed: false },
            },
            {
              id: 'door', leak: 1,
              text: 'Don’t move the bus. Feel her hands and the boy’s through the window. If they’re warm, let the two of them climb in and sit at the back in the dark. Nobody else gets on, and the bus stays exactly where it is.',
              reply: `warm. both of them. theyre at the back under my coat
nobody else. bus isnt moving`,
              set: { tomasHeld: true },
            },
            {
              id: 'farm', leak: 2, from: ['ana'],
              text: 'Keep the bus where it is and check hands at the door, one at a time, by torch. The ones who are warm and answer you straight can walk past the bus in single file and up the north road. There isn’t a street lamp for miles up there, and the farms have already had people from town asking to come up.',
              reply: `ana's farm? how do u know people asked her
...ok. one at a time. torch. the woman and her boy go first`,
              set: { evacuating: true, anaOpen: true },
            },
          ],
        },
        {
          id: 'sealed',
          when: (s) => s.flags.sealedEast,
          text: `at the old bridge. stop 14. engine running
the county taped off quarry road at noon. people from millside are coming round it anyway, down through the fields by the river. fifty maybe. suitcases, slippers, kids
some look fine and just scared. some look like the one more stop guy, grey and cold and staring at the bridge lamps
a woman with a little boy is at my door saying her hands are warm, begging me to take them over
what do i do`,
        },
      ],
      options: [
        {
          id: 'drive', leak: 0,
          text: 'You can’t take everyone, but you can take a busload. Let the families with children on first, drive them over to the Centre, and come back for more.',
          reply: `families first. the woman and her boy, then the next lot
bus is full. heading over. nobodys talking`,
          set: { tomasCrossed: true, breach: true },
        },
        {
          id: 'park', leak: 1,
          text: 'Don’t take anyone across. You said some of them look like the one more stop man, and in the dark you can’t tell who’s who. Park the bus across the bridge, engine and lights off, and ring the clinic.',
          reply: `parking across it. engine off. lights off
the woman is crying at my door. i feel like the worst person alive`,
          set: { bridgeClosed: true },
        },
        {
          id: 'farm', leak: 2, from: ['ana'],
          text: 'Check hands at the door, one at a time, by torch: warm hands and a straight answer only. Drive the well ones up the north road to the goat farm with your lights off. There isn’t a street lamp for miles, and the farm has already had people from town asking to come up. Then come back and park across the bridge.',
          reply: `ana's place? how do u know people asked her
...ok. checking hands. the woman and her boy are warm. loading up`,
          set: { evacuating: true, anaOpen: true, bridgeClosed: true },
        },
        {
          id: 'clinic', leak: 3, from: ['megan', 'charles'],
          text: 'Nobody crosses tonight. This is coming out of East Block at the Institute, and Megan at the clinic has had a ward filling up with it for two nights while the county does nothing. Park across the bridge, engine and lights off. The west bank has to stay clean.',
          reply: `east block?? megan told u that?
ok. parking across it. engine off. i feel like the worst person alive`,
          set: { bridgeClosed: true, tomasHeld: true },
        },
      ],
    },
    {
      id: 'n3-amelia-window',
      npc: 'amelia',
      at: '23:20',
      text: `Good evening, Varrow. [PAUSE]
There are people standing outside the station window. Eleven of them. I counted twice.
They came in the last hour, one or two at a time. They aren’t knocking. They’re just standing on the pavement, looking up at the ON AIR light.
I know some of them. That’s Mr Pell from the bake sale, I think, in his slippers.
Should I go out and talk to them? I’ve made a pot of tea.`,
      variants: [
        {
          id: 'cautious',
          when: (s) => s.flags.ameliaCautious,
          text: `Good evening, Varrow. [PAUSE]
I’ve kept the studio lights low all night. But the ON AIR sign is still lit outside, and there are people standing under it.
Eleven of them. I counted twice. They came one or two at a time. They aren’t knocking. They’re just looking up at it.
That’s Mr Pell from the bake sale, I think, in his slippers.
Should I go out and talk to them? I’ve made a pot of tea.`,
        },
        {
          id: 'calm',
          when: (s) => s.flags.ameliaCalm && !s.flags.ameliaTruth,
          text: `Good evening, Varrow. [PAUSE]
I told this town there was nothing to worry about. Tonight there are eleven people standing outside the station window. I counted twice.
They aren’t knocking. They’re just standing on the pavement, looking up at the ON AIR light.
That’s Mr Pell from the bake sale, I think, in his slippers.
Should I go out and talk to them? I’ve made a pot of tea.`,
        },
      ],
      options: [
        {
          id: 'tea', leak: 0,
          text: 'That’s kind of you. Take the tea out, stay on the step, and ask whether anyone needs a doctor. If they do, ring the clinic.',
          reply: `They didn’t take the tea. They didn’t look at me. They looked past me, at the light.
Mr Pell’s hand was so cold, dear. [PAUSE] I’ll stay out a minute longer.`,
          set: { ameliaOutside: true },
        },
        {
          id: 'inside', leak: 1,
          text: 'Stay inside. You said they aren’t knocking, they’re looking up at the ON AIR light. People who wanted tea would knock. Switch the sign off, keep the studio dim, and watch what they do.',
          reply: `[PAUSE] I’ve switched it off.
They’re still there. But two of them have turned away, and Mr Pell has sat down on the kerb.`,
          set: { ameliaCautious: true },
        },
        {
          id: 'truth', leak: 2, from: ['megan'],
          text: 'Stay inside and switch the ON AIR sign off. People who are ill like this are drawn to light and noise, and they settle in the dark and the quiet. Then, on air and in a low voice, tell people the truth: stay in, keep the lights low, and keep away from anyone standing under a lamp.',
          reply: `How do you know what settles them, dear?
[PAUSE] The sign’s off. I’m reading it now, very low. Two of them have sat down.`,
          set: { ameliaCautious: true, ameliaTruth: true },
        },
        {
          id: 'all', leak: 3, from: ['megan', 'charles'],
          text: 'Stay in. This started in East Block at the Institute when a trial went wrong on the 20th. Megan at the clinic has a ward full of it, and what settles them is dark, quiet and warm. Switch off the sign, then say it on air, low and plain, all of it.',
          reply: `East Block. The 20th. Megan’s ward.
Whoever you are, you’ve been talking to half this town. [PAUSE] The sign’s off. I’m reading it.`,
          set: { ameliaCautious: true, ameliaTruth: true, ameliaInformed: true },
        },
      ],
    },
    {
      id: 'n3-ana-torches',
      npc: 'ana',
      at: '23:40',
      text: `one bar
torches on the north road. a lot of them, coming up slow
thirty maybe. could be more. families. someone's pushing a pram up that hill in the dark
they'll be at my gate in an hour. do i open it`,
      variants: [
        {
          id: 'evac',
          when: (s) => s.flags.evacuating,
          text: `one bar
tomas rang the house phone. first time anyone's used it in a year. says he's sending people up from the bridge and he's checked their hands
now there's torches on the north road. a lot of them, coming up slow. thirty maybe. someone's pushing a pram
they'll be at my gate in an hour. do i open it`,
        },
      ],
      options: [
        {
          id: 'open', leak: 0,
          text: 'If families are walking up in the dark, they need somewhere safe tonight. Open the gate, put them in the barn, and get something warm into them.',
          reply: `gate's open. kettle's on
the goats went to the far end of the field and won't come back`,
          set: { anaRisk: true },
        },
        {
          id: 'shut', leak: 1,
          text: 'Keep the gate shut tonight. Your goats have been facing the town all week, and whatever’s wrong is coming from there. Talk to them over the gate, pass them water, and tell them you’ll see them in daylight.',
          reply: `gate stays shut. water over the top
they're sitting on the verge. nobody's arguing. that's worse somehow`,
          set: { anaWarned: true },
        },
        {
          id: 'hands', leak: 2, from: ['megan', 'tomas'],
          text: 'Open it, but one person at a time, by your torch. Feel each person’s hands. The ones who are ill with this have ice-cold hands, stare at lights and repeat themselves. Warm hands and a straight answer come in. Anyone else waits outside the gate till daylight.',
          reply: `ice-cold hands. how do you know what the sick ones do
...ok. torch. one at a time. i used to do this with sheep`,
          set: { anaWarned: true, anaOpen: true },
        },
        {
          id: 'named', leak: 3, from: ['megan', 'tomas'],
          text: 'Megan, the nurse at the Varrow clinic, has a ward full of this, and Tomas watched a crowd walk down from Millside to the Old Bridge tonight. The sick ones have ice-cold hands and stare at lights. Let people in one at a time by torch, warm hands only. Everyone else waits outside till daylight.',
          reply: `tomas. the nurse. you know everyone's business
...one at a time. torch. warm hands only`,
          set: { anaWarned: true, anaOpen: true },
        },
      ],
    },

    // ------------------------------------------------------------------ 00:00
    {
      id: 'n3-megan-county',
      npc: 'megan',
      at: '00:10',
      text: `the county rang back. at midnight. a man reading off a card
"your concerns have been noted" again, and the team is "still scheduled for friday". FRIDAY
i've got twelve on the ward and a car park full of people looking at a lamp
i've got one more go at him before i lose it. what do i say so he actually sends someone tonight`,
      variants: [
        {
          id: 'sealed',
          when: (s) => s.flags.sealedEast,
          text: `the county finally turned up. they've closed the road at the quarry, tape and everything
a man in a white suit walked the ward with a torch, said "good, keep doing whatever this is" and left
he says they'll come in properly when they've got enough suits. could be first light, could be friday
i've got twelve on the ward and a car park full of people looking at a lamp. what do i ask him for`,
          options: [
            {
              id: 'list', leak: 0,
              text: 'Ask for three things, in writing: more staff, more gloves and masks, and a time they’re coming in. A time, not a day.',
              reply: `staff. gloves. a time
he said "first light, probably". probably!!`,
            },
            {
              id: 'lamp', leak: 1,
              text: 'Ask him to switch off the street lamps round the clinic tonight. You said the car park is full of people standing under one, and your ward only settles in the dark. Taking the lamp away is the cheapest help he can give you.',
              reply: `the lamp. yes. why didn't i think of that
he made a call. the car park just went dark. some of them are sitting down`,
            },
            {
              id: 'bridge', leak: 2, from: ['tomas'],
              text: 'Ask him to send someone to the Old Bridge. People from Millside have been walking down there all night, and there’s nobody between them and the west bank but a bus driver.',
              reply: `the bridge? how do you know who's at the bridge
...i asked. he said he'd "look at it". he wrote it down at least`,
            },
          ],
        },
      ],
      options: [
        {
          id: 'calm', leak: 0,
          text: 'Stay calm and be specific: how many patients, the same signs in every one, and more arriving. Ask him to write down that you requested urgent help tonight, and get his name.',
          reply: `got his name. he wrote it down. he said "noted"
i hate that word now`,
        },
        {
          id: 'cluster', leak: 1,
          text: 'Use the word cluster again and give him numbers: twelve on the ward, all from the same end of town, the same signs in every one, and a car park full of people with them. Tell him you want it on the record that you reported it tonight.',
          reply: `cluster. twelve. on the record
he went quiet and said he'd "escalate". that's new`,
          set: { megCareful: true },
        },
        {
          id: 'east', leak: 2, from: ['charles'],
          text: 'Tell him it’s linked to the Institute, and to its East Block in particular. Something went wrong there on the 20th, and the night crew have been kept inside ever since. Put that on the record and ask him to close the road east of the bridge tonight.',
          reply: `east block. the 20th. how do you know any of this
...i said it. all of it. he stopped reading off the card`,
          set: { megCalled: true, megKnowsInstitute: true },
        },
        {
          id: 'names', leak: 3, from: ['charles', 'ty'],
          text: 'Tell him a trial in East Block at the Institute went wrong at 02:11 on Saturday the 20th. The night crew have been at their windows since, and their facilities manager, Charles, has known all along. One of the crew has a son in Millside who hasn’t seen his dad since that night. He can’t file that under “noted”.',
          reply: `02:11. charles from the institute. a kid in millside
who ARE you. ...i told him. every word. he's sending someone to close the road`,
          set: { megCalled: true, megKnowsInstitute: true },
        },
      ],
    },
    {
      id: 'n3-charles-notice',
      npc: 'charles',
      at: '00:30',
      text: `Notice 16.
1. "The east end of Varrow will be closed to through traffic due to works."
2. The Institute's director telephoned from his house in the Centre and dictated it.
3. He would like it read on the radio at six.
4. Please draft it. I have found that I can no longer write notices.`,
      variants: [
        {
          id: 'disclosed',
          when: (s) => s.flags.charlesDisclosed,
          text: `Notice 16.
1. The director would still like a notice: "The east end of Varrow will be closed to through traffic due to works."
2. I have told him the county has my statement. He would like the notice anyway.
3. He would like it read on the radio at six.
4. I have found that I can no longer write notices. Should I write this one?`,
          options: [
            {
              id: 'draft', leak: 0,
              text: `NOTICE 16
To residents of Varrow:
The east end of Varrow will be closed to through traffic while works continue at the Institute. Please use the Old Bridge road. Thank you for your patience.`,
              reply: `1. Thank you.
2. It contradicts my statement.
3. He will be pleased. I am not.`,
              set: { charlesBuried: true },
            },
            {
              id: 'refuse', leak: 1,
              text: 'You don’t have to. The county already has the truth from you, with your name on it. Don’t sign something that says the opposite. Tell the director that any notice should come from the county, not from you.',
              reply: `1. Not from me.
2. I have told him.
3. He put the telephone down. I have made tea, at the hour.`,
            },
            {
              id: 'dark', leak: 2, from: ['megan'],
              text: 'Write a different one instead: “The east end is closed because of an accident at the Institute. If someone you live with has ice-cold hands and won’t sleep, keep them somewhere dark, quiet and warm, and keep them away from lamps.” Sign it, and send it to the radio yourself.',
              reply: `1. Dark, quiet, warm.
2. Where did you get that?
3. It is going to the radio. With my name under it.`,
              set: { methodShared: true },
            },
          ],
        },
      ],
      options: [
        {
          id: 'draft', leak: 0,
          text: `NOTICE 16
To residents of Varrow:
The east end of Varrow will be closed to through traffic while works continue at the Institute. Please use the Old Bridge road. Thank you for your patience.`,
          reply: `1. Thank you.
2. It is a good notice.
3. I do not know why it makes me so unhappy.`,
          set: { charlesBuried: true },
        },
        {
          id: 'true', leak: 1,
          text: `I’ll draft it true instead, and you can sign it:
NOTICE 16
The east end of Varrow is closed because of an accident in East Block at the Institute on 20 October. If you live there, stay indoors after dark, and keep away from anyone who has stopped sleeping.`,
          reply: `1. That is not what he dictated.
2. It is what happened.
3. I have signed it with my name, not my title. A copy is going to the county, and one to the radio.`,
          set: { charlesDisclosed: true },
        },
        {
          id: 'dark', leak: 2, from: ['megan'],
          text: `I’ll draft it true, and you sign it:
NOTICE 16
The east end of Varrow is closed because of an accident at the Institute on 20 October. If someone you live with has ice-cold hands and won’t sleep, keep them somewhere dark, quiet and warm, and keep them away from lamps.`,
          reply: `1. Dark, quiet, warm.
2. Where did you get that?
3. It is going on the notice. With my name under it.`,
          set: { charlesDisclosed: true, methodShared: true },
        },
        {
          id: 'amelia', leak: 3, from: ['amelia'],
          text: 'Don’t send the director’s version to the radio. Amelia on Chapel Lane has been taking calls about people standing at their gates for two nights, and nobody has given her anything true to read. Write down what really happened, sign it, and send it to her yourself. She’ll read it.',
          reply: `1. Amelia. The radio.
2. You know who is taking whose calls.
3. I will send it to her. Signed.`,
          set: { charlesDisclosed: true },
        },
      ],
    },
    {
      id: 'n3-tomas-fire',
      npc: 'tomas',
      at: '00:50',
      text: `someone lit a fire on the east side of the bridge. bins first, then a bench
nobodys warming their hands at it. theyre all just standing round it, facing it. dozens. not a word
theres a kid there. like ten. no coat. standing with the rest of them
im going over to get him. right? someone has to`,
      degrade: { 1: 'smells like batteries out here. worse than monday' },
      variants: [
        {
          id: 'crossed',
          when: (s) => s.flags.tomasCrossed,
          text: `the bridge is wide open now. people from millside walking over it in twos and threes and nobody stopping them
someone lit a fire on the east side. theyre all standing round it, facing it. dozens. not a word
theres a kid there. like ten. no coat. standing with the rest of them
im going to grab him. right? someone has to`,
        },
      ],
      options: [
        {
          id: 'go', leak: 0,
          text: 'If a child is standing by a fire with no coat, yes. Go and get him, bring him back to the bus, and wrap him up in something warm.',
          reply: `got him. hes so cold. he didnt look at me once
hes on the front seat. hes staring at the dashboard light`,
          set: { tomasCrossed: true },
        },
        {
          id: 'look', leak: 1,
          text: 'Look at him first. You said he’s standing with the rest of them, facing the fire the way they are. If he’s like the one more stop man, you can’t carry him out of it, and you’ll be standing in it with him. Stay on the bus with the lights off.',
          reply: `hes facing it. same as all of them. not shivering. not anything
im staying. i hate this so much`,
        },
        {
          id: 'dark', leak: 2, from: ['megan'],
          text: 'Don’t go over while it’s burning. People like him come back in the dark, the quiet and the warm, not by being dragged away from a light. Wait for the fire to burn down, and keep your bus dark so it isn’t the next brightest thing on the bridge.',
          reply: `how do u know what brings them back
ok. bus dark. waiting for it to burn down`,
          set: { tomasHeld: true },
        },
        {
          id: 'megan', leak: 3, from: ['megan'],
          text: 'Megan at the clinic has a ward full of people like that boy, and the ones who come back are the ones kept somewhere dark, quiet and warm. Running into a crowd round a fire won’t do it. Stay on the bus with the lights off, and tell her where he is when it’s light.',
          reply: `megan has a ward full?? she never said
ok. staying. ill tell her about him in the morning`,
          set: { tomasHeld: true },
        },
      ],
    },
    {
      id: 'n3-amelia-safe',
      npc: 'amelia',
      at: '01:15',
      text: `Good evening, Varrow. [PAUSE]
The phones haven’t stopped. Everyone wants to know where to go.
I’ve got a list on the back of an envelope: the church hall on Chapel Lane, the school gym, the clinic in the Centre, and the Old Bridge, where the bus might take you.
I want to read it every half hour until morning. Is it the right list?`,
      variants: [
        {
          id: 'outside',
          when: (s) => s.flags.ameliaOutside,
          text: `Good evening, Varrow. [PAUSE]
I’m back inside. My hands are freezing. It’s colder out there than it looks.
The phones haven’t stopped. Everyone wants to know where to go. I’ve got a list on the back of an envelope: the church hall on Chapel Lane, the school gym, the clinic in the Centre, and the Old Bridge, where the bus might take you.
I want to read it every half hour until morning. Is it the right list?`,
        },
        {
          id: 'truth',
          when: (s) => s.flags.ameliaTruth,
          text: `Good evening, Varrow. [PAUSE]
Since I told the truth on air, the phones haven’t stopped. People believe me now, which is frightening. Everyone wants to know where to go.
I’ve got a list on the back of an envelope: the church hall on Chapel Lane, the school gym, the clinic in the Centre, and the Old Bridge, where the bus might take you.
I want to read it every half hour until morning. Is it the right list?`,
        },
      ],
      options: [
        {
          id: 'read', leak: 0,
          text: 'It’s a good list. Read it slowly, twice each time, and remind people to take a coat and a torch.',
          reply: `A coat and a torch. Lovely. [PAUSE]
I’ve read it. The phone lines are lighting up already.`,
          set: { crowdsSent: true },
        },
        {
          id: 'home', leak: 1,
          text: 'I’d cut it right down. You’ve got eleven people outside your own window staring at a light. Sending the whole town out at night to places with the lights on could put more people under lamps. Tell them the safest place tonight is their own home, doors shut, lights low.',
          reply: `Stay home. Doors shut. Lights low. [PAUSE]
It isn’t much of a list. It’s a true one.`,
        },
        {
          id: 'cut', leak: 2, from: ['megan', 'tomas'],
          text: 'Take the clinic and the Old Bridge off it. The clinic is full and there’s a crowd standing under the lamp in its car park, and people have been walking down to the bridge from Millside for two nights. Tell people to stay home with the lights low, and only go to the church hall if they can’t.',
          reply: `The clinic’s full? The bridge? Who’s telling you these things, dear?
[PAUSE] Crossed out. I’ll read the short list.`,
          set: { ameliaCautious: true, ameliaTruth: true },
        },
        {
          id: 'names', leak: 3, from: ['megan', 'tomas'],
          text: 'Megan at the clinic has twelve patients and a car park full of people standing under the lamp. Tomas has a crowd from Millside at the Old Bridge tonight, trying to get across. Take both off the list, and tell everyone else to stay home, doors shut, lights low.',
          reply: `Megan. Tomas. You talk to everyone I know.
[PAUSE] Both crossed out. I’ll read it. And then I want a word with you.`,
          set: { ameliaCautious: true, ameliaTruth: true },
        },
      ],
    },
    {
      id: 'n3-ana-gate',
      npc: 'ana',
      at: '01:40',
      text: `one bar
gate's shut. they're sitting on the verge on the other side of it. thirty-one. i counted
a little girl asked for water through the bars. her mum's hands are warm, i felt them
one man at the back keeps saying he's fine. very polite. won't take his gloves off
it's freezing out there. do i let some of them in`,
      variants: [
        {
          id: 'risk',
          when: (s) => s.flags.anaRisk,
          text: `one bar
forty in the barn. nobody checked anything. there wasn't time
the goats won't go in with them. they're out in the top field in the dark, all three, facing the barn
some of them are standing out in the yard under the light. just standing
what do i do with them`,
          options: [
            {
              id: 'tea', leak: 0,
              text: 'Get everyone something warm to drink and let them settle. People who’ve walked a long way at night are often in shock.',
              reply: `tea for forty. the kettle's had a long night
the ones in the yard didn't want tea`,
            },
            {
              id: 'off', leak: 1,
              text: 'Turn the yard light off. You said some of them are just standing under it. Then go into the house, lock your own door, and stay away from the barn until it’s light.',
              reply: `light off. they're still standing there. in the dark now
door locked. the goats are still facing the barn`,
            },
            {
              id: 'dark', leak: 2, from: ['megan'],
              text: 'Turn the yard light off and keep the barn dark and quiet. People who are ill with this settle in the dark, the quiet and the warm. Then lock yourself in the house until daylight.',
              reply: `how do you know what settles them
...light off. some of them sat down in the mud`,
            },
          ],
        },
        {
          id: 'open',
          when: (s) => ['hands', 'named'].includes(s.answered['n3-ana-torches']?.opt),
          text: `one bar
thirty-one inside. kids in the barn with the goats. the goats don't mind
checked hands at the gate one at a time by torch
one man at the back says he's fine, very polite, but he wouldn't take his gloves off. he's in the yard now. do i make him`,
          options: [
            {
              id: 'trust', leak: 0,
              text: 'If he says he’s fine and he’s been polite, let him be. Give him a blanket and a corner of the barn.',
              reply: `blanket. corner of the barn
the goats moved to the other end`,
              set: { anaRisk: true },
            },
            {
              id: 'gloves', leak: 1,
              text: 'Yes. Ask him kindly to take his gloves off in front of you. You checked everyone else, so he doesn’t get to skip it. If he won’t, he waits outside the gate until daylight.',
              reply: `asked. he wouldn't. he's outside the gate now, standing very still
the goats came back over`,
            },
            {
              id: 'cold', leak: 2, from: ['megan', 'tomas'],
              text: 'Get him out of the yard and outside the gate first, then check him. Ice-cold hands are the first sign of this, before anything else shows. Being polite isn’t the same as being well.',
              reply: `how do you know what the first sign is
...he's outside the gate. i got a glove off him. like ice`,
              set: { anaWarned: true },
            },
          ],
        },
      ],
      options: [
        {
          id: 'water', leak: 0,
          text: 'Pass water and blankets over the gate. You don’t have to open it to be kind, and they can come in when it’s light.',
          reply: `water. every blanket i own. over the top
the girl said thank you. the gloved man didn't say anything`,
        },
        {
          id: 'girl', leak: 1,
          text: 'Let the girl and her mum in. You felt her mum’s hands yourself and they’re warm. Check everyone else the same way before they come through, and the man in gloves stays outside until he takes them off.',
          reply: `girl and mum in. kettle on
did six more by hand. the gloved man is still on the verge`,
          set: { anaOpen: true },
        },
        {
          id: 'all', leak: 0,
          text: 'It’s a freezing night and they’ve walked a long way. Let them all into the barn and sort it out in the morning.',
          reply: `gate's open. all of them in
the gloved man went straight past the barn and stood under the yard light`,
          set: { anaRisk: true },
        },
        {
          id: 'gloves', leak: 2, from: ['megan', 'tomas'],
          text: 'Let in the ones with warm hands, one at a time, by torch. Not the man in gloves. Ice-cold hands are the first sign of this, before anything else shows. He stays outside until you’ve felt his hands.',
          reply: `the first sign. how do you know that
...warm ones in. the gloved man stays out`,
          set: { anaOpen: true, anaWarned: true },
        },
      ],
    },
    {
      id: 'n3-tomas-dolly',
      npc: 'tomas',
      at: '02:05',
      text: `need a dolly song. 2am on a bridge, engine off, lights off
dont say jolene. ive sung jolene to myself like forty times already`,
      variants: [
        {
          id: 'crossed',
          when: (s) => s.flags.tomasCrossed,
          text: `need a dolly song. heaters on full blast and i still cant get warm
dont say jolene. ive sung jolene to myself like forty times already`,
        },
        {
          id: 'evac',
          when: (s) => s.flags.evacuating,
          text: `need a dolly song. been checking hands by torch for three hours and my brain is soup
dont say jolene. ive sung jolene to myself like forty times already`,
        },
      ],
      options: [
        {
          id: 'coat', leak: 0,
          text: '“Coat of Many Colors”, very quietly. It’s about being warm with not much, and it hums well.',
          reply: `coat of many colors. humming it
my mum used to sing this one. ok im not crying`,
        },
        {
          id: 'islands', leak: 0,
          text: '“Islands in the Stream”. Do Kenny’s part too. It’s a song for two people, and you shouldn’t have to do tonight on your own.',
          reply: `doing both parts. kenny's a bit flat
thanks. weirdly that helped`,
        },
        {
          id: 'hum', leak: 1,
          text: 'Anything you like, as long as you hum it and keep the cab light off. The people on the other side have been going to every light they can find tonight. Don’t be the next one.',
          reply: `humming. cab light off. 9 to 5 but slow
the ones over the river didnt even turn round`,
        },
        {
          id: 'radio', leak: 2, from: ['megan'],
          text: 'Put Amelia’s show on, low. She plays Dolly at night, and she’ll pick one for you.',
          reply: `how do u know amelia plays dolly at night lol
radio on. oh no. theyre all turning round. RADIO OFF. radio off`,
        },
      ],
    },
    {
      id: 'n3-ty-door',
      npc: 'ty',
      at: '02:30',
      text: `someone's at the front door
it's dad. it's his voice. he's saying my name. just "ty", then nothing for ages, then "ty" again
he isn't knocking. the spare key's under the plant where it always is and he hasn't used it
pickle is going mad. wagging and crying at the same time
there's lamp light coming in under the door. should i let him in`,
      variants: [
        {
          id: 'sealed',
          when: (s) => s.flags.sealedEast,
          text: `someone's at the front door
it's dad. he's saying my name. "ty". then nothing for ages. then "ty" again
the suits are at the end of the road. he must have got past them or they let him through, i don't know
the spare key's under the plant where it always is and he hasn't used it
should i let him in`,
        },
      ],
      options: [
        {
          id: 'open', leak: 0,
          text: 'It’s your dad, and he’s come home. Let him in, get him warm, and ring the clinic first thing in the morning.',
          reply: `opening it
he's just standing in the kitchen looking at the light over the cooker. his hands are so cold`,
          set: { tyBreach: true },
        },
        {
          id: 'door', leak: 1,
          text: 'Don’t open it. You told me Mrs Pell stood at your door with her hand on the handle saying “light”. Your dad isn’t using the key and he’s only saying one word. He isn’t himself tonight. Stay in the cupboard in the dark, and talk to him through the door if you want to.',
          reply: `ok. not opening it
i told him i love him through the door. he said ty. that's all he said`,
          set: { tySafe: true },
        },
        {
          id: 'crew', leak: 2, from: ['charles'],
          text: 'Don’t open it. The people he works with have been standing at windows and not sleeping since the weekend, and he may be the same. He isn’t himself tonight. Keep the door shut and the cupboard dark. You can still talk to him through it.',
          reply: `the people he works with?? how do you know about them
...ok. door shut. i'm talking to him. he's quieter`,
          set: { tySafe: true },
        },
        {
          id: 'east', leak: 3, from: ['charles', 'megan'],
          text: 'Don’t open it. A trial in East Block at the Institute went wrong on the 20th, and your dad’s crew have been at their windows ever since. The nurse at the Varrow clinic says people like that settle in the dark, the quiet and the warm. Stay dark, talk to him softly through the door, and don’t let him in tonight.',
          reply: `a trial?? east block?? nobody told me any of that
how do you know. ...ok. i'm talking to him through the door, really quiet. he stopped saying my name`,
          set: { tySafe: true },
        },
      ],
    },
    {
      id: 'n3-megan-hold',
      npc: 'megan',
      at: '02:55',
      text: `it's three in the morning and i've been on since yesterday morning
two of the staff went home at midnight and didn't come back. it's me, one healthcare assistant, and warfarin, who is under the desk and refuses to help
i keep catching myself staring at the light over the fire exit. just staring
i don't think i can hold this. tell me i can go home`,
      variants: [
        {
          id: 'opened',
          when: (s) => s.flags.megOpened,
          text: `it's three in the morning and i've been on since yesterday morning
the car park lot are all inside now. they don't lie down. they stand in the corridor under the lights, very quiet, very polite
two of the staff went home at midnight and didn't come back. it's me, one healthcare assistant, and warfarin under the desk
i keep catching myself staring at the light over the fire exit. tell me i can go home`,
        },
      ],
      options: [
        {
          id: 'home', leak: 0,
          text: 'You can go home. You’ve been on far too long, and exhausted people make mistakes. Hand over to your assistant and get some sleep.',
          reply: `ok. coat. keys. warfarin in the carrier
the car park's right there. i'll just go round them. it's fine`,
          set: { megOpened: true },
        },
        {
          id: 'stay', leak: 1,
          text: 'Not yet, and not out through that car park. You said yourself the ward only settles when it’s dark and shut. Cover that fire exit light, sit down in the dark with something warm, and have your assistant wake you in an hour.',
          reply: `covered it with a bin bag. sitting on the floor with warfarin
an hour. ok. one hour`,
        },
        {
          id: 'tired', leak: 2, from: ['charles'],
          text: 'Check your hands first. If they’re warm, you’re exhausted, not ill. The first people to get this went for days without feeling tired at all, so the fact that you’re this tired is a good sign. Cover that light and sleep for an hour on the ward.',
          reply: `warm. i checked twice. and i am SO tired
how do you know what the first ones felt like. ...covering the light. sleeping`,
          set: { megIsolated: true },
        },
      ],
    },

    // ------------------------------------------------------------------ dawn
    {
      id: 'n3-charles-memo',
      npc: 'charles',
      at: '04:20',
      text: `1. It is nearly five. I have done my rounds.
2. The crew are still at the windows. I have stopped asking them to sit down.
3. I have not sealed the gate and I have not written anything. I have made tea at the hour, every hour.
4. Notice 17 is due at six. I do not know what it should say.`,
      variants: [
        {
          id: 'inside',
          when: (s) => s.flags.eastGateSealed,
          text: `1. The gate is sealed. I am on the inside of it.
2. The crew are quieter than they were. Or I am used to them.
3. My hands are cold. It is a cold building.
4. Please tell me something that is not about the Institute.`,
          options: [
            {
              id: 'river', leak: 0,
              text: 'The river is still running under the Old Bridge, and in about an hour it’ll be light enough to see it from the hill.',
              reply: `1. The river.
2. I have a model of it in my spare room. It is very accurate.
3. Thank you.`,
            },
            {
              id: 'coats', leak: 1,
              text: 'Turn off the lights on your side and sit with your back to the windows. You said it’s a cold building, so put on every coat you can find.',
              reply: `1. Coats.
2. Three.
3. One of them is Dan's.`,
            },
            {
              id: 'boy', leak: 2, from: ['ty'],
              text: 'A boy in Millside whose dad is on your crew has been waiting since Saturday for him to come home. Tell me something about his dad, so somebody can tell him.',
              reply: `1. Dan Marsh throws darts badly.
2. He talks about his son at every break. The boy plays the bass. Also badly.
3. Tell him that.`,
            },
          ],
        },
        {
          id: 'disclosed',
          when: (s) => s.flags.charlesDisclosed,
          text: `1. It is nearly five. I am sitting on the kerb outside the main gate, on the outside of the tape.
2. The county have my statement. A woman in a white suit gave me tea. It was not the hour for tea. I drank it.
3. They want the crew's names. I have them.
4. They also want to know what to tell the families. I do not.`,
          options: [
            {
              id: 'plain', leak: 0,
              text: 'Tell them the truth, plainly: their person is alive, they’re ill, and they’re being looked after. Promise only what you know.',
              reply: `1. Alive. Ill. Looked after.
2. I can say those three things. I have checked each one.`,
            },
            {
              id: 'names', leak: 1,
              text: 'Start with the names. You said you have them. Tell each family their person was on your list tonight, and that you’ll tell them anything you learn. Then do exactly that.',
              reply: `1. Nine names. Nine families.
2. I will do them in order. I prefer order.`,
            },
            {
              id: 'dark', leak: 2, from: ['megan'],
              text: 'Tell them their people can come back from this. Dark, quiet and warm is working on a ward in town. That’s what the families need to hear, and what they need to do at home.',
              reply: `1. It is working somewhere.
2. Where?
3. No. Do not tell me. I will tell the families.`,
              set: { methodShared: true },
            },
            {
              id: 'ty', leak: 3, from: ['ty'],
              text: 'Start with the boy in Millside whose dad is on your crew. He’s been at home on his own since Saturday, and when he rang the switchboard they told him his dad was “on duty”. He should hear it from you first.',
              reply: `1. Dan's boy.
2. "On duty." That was my wording.
3. I will go to him first.`,
            },
          ],
        },
      ],
      options: [
        {
          id: 'routine', leak: 0,
          text: `NOTICE 17
Works continue at the Institute. Residents of the east end should remain indoors until further notice. Thank you for your patience.`,
          reply: `1. Thank you.
2. Posted.
3. That is the last one. I have run out of numbers I can stand.`,
          set: { charlesBuried: true },
        },
        {
          id: 'name', leak: 1,
          text: 'Let Notice 17 be the one with your name on it. You’ve told me about the trial on the 20th and the crew at the windows. Write that down, sign it, and walk it out to the tape yourself before six.',
          reply: `1. Before six.
2. I have written it. One page. It did not need forty.
3. I am walking to the tape.`,
          set: { charlesDisclosed: true },
        },
        {
          id: 'dark', leak: 2, from: ['megan'],
          text: 'Write down what happened and sign it, and put one more line at the bottom: the people at the windows settle in the dark, the quiet and the warm. Then turn your lights off and walk it out to the tape.',
          reply: `1. Where did you learn that?
2. It is at the bottom. Above my name.
3. Walking.`,
          set: { charlesDisclosed: true, methodShared: true },
        },
      ],
    },
    {
      id: 'n3-tomas-dawn',
      npc: 'tomas',
      at: '04:40',
      text: `skys going grey over the quarry
the fire burnt out about four. the people round it sat down in the ashes. some of them are lying down. i think theyre asleep?? first time ive seen any of them sleep
nobody got past the bus. not one
can i start the engine and go home`,
      variants: [
        {
          id: 'crossed',
          when: (s) => s.flags.tomasCrossed,
          text: `skys going grey
had the heater on full all night and my hands are still freezing. like proper freezing
keep catching myself staring at the lamp at stop 14. just staring
can i go home now. i just want to go home`,
          options: [
            {
              id: 'home', leak: 0,
              text: 'Yes. Go home, have a hot shower and get some sleep.',
              reply: `home. shower. bed
cant stop looking at the lamp outside my window though`,
            },
            {
              id: 'clinic', leak: 1,
              text: 'Stop at the clinic on the way and get your hands looked at. You said they’re still freezing after a whole night with the heater on full. That’s worth a nurse’s look.',
              reply: `clinic. ok. its on the way
theres a queue outside under the lamp. ill just stand in it`,
            },
            {
              id: 'dark', leak: 2, from: ['megan'],
              text: 'Go home, shut the curtains, keep the lights off and get warm under a blanket. Dark, quiet and warm is what helps with this.',
              reply: `how do u know whats helping
curtains shut. lights off. still cold`,
            },
          ],
        },
        {
          id: 'evac',
          when: (s) => s.flags.evacuating,
          text: `last lot are up the north road. forty-three at ana's, every hand checked at the bridge
one of them, an old guy, went quiet halfway up the hill. he was warm at the bridge. i checked. he was warm
hands can change. what do i do with him`,
          options: [
            {
              id: 'clinic', leak: 0,
              text: 'Drive him down to the clinic in the Centre so a nurse can look at him.',
              reply: `driving him down. hes staring at the dashboard light the whole way
the clinic car park is full. full of them`,
            },
            {
              id: 'apart', leak: 1,
              text: 'Keep him apart from the others and off the farm until someone has looked at him. Sit him somewhere on his own with the door shut. You checked hands once; check everyone’s again at the gate before they go to sleep.',
              reply: `hes on his own in the bus. door shut
checking every hand again with ana. all warm. all of them`,
            },
            {
              id: 'dark', leak: 2, from: ['megan'],
              text: 'Put him somewhere dark, quiet and warm on his own, like the bus with the lights off and a blanket over him. That’s what brings people back from this. Then check everyone else’s hands again.',
              reply: `dark quiet warm. how do u know that
hes in the bus under a blanket. hes asleep. i think thats good?`,
              set: { tomasHeld: true },
            },
          ],
        },
      ],
      options: [
        {
          id: 'go', leak: 0,
          text: 'It’s nearly light, and you’ve done more than anyone asked. Start her up, drive home carefully and get some sleep.',
          reply: `engine on. headlights on
oh. theyre standing up. all of them. theyre looking at the lights`,
          set: { bridgeClosed: false },
        },
        {
          id: 'wait', leak: 1,
          text: 'Not yet. You said they’ve only just lain down, and all night they’ve gone to every light they could find. Your headlights would be the brightest thing on the bridge. Wait for full daylight with the engine off.',
          reply: `engine off. waiting
one of them by the ashes is snoring. i could cry`,
        },
        {
          id: 'sleep', leak: 2, from: ['megan'],
          text: 'Stay put. Settling down in the dark is the first sign people are coming back from this, so let them have it. Wait for full daylight with the engine off, then tell whoever comes that they slept.',
          reply: `the first sign. how do u know that
ok. engine off. let them sleep`,
          set: { tomasHeld: true },
        },
      ],
    },
    {
      id: 'n3-amelia-poem',
      npc: 'amelia',
      at: '05:00',
      text: `Good evening, Varrow. Or good morning. [PAUSE]
This is the last bulletin of the week. It’s Thursday now, so Sunday’s poem is early. I don’t think there’ll be a Sunday show.
I still have my first line, the one about the river and the bridge lamps. I want one more line to finish it, and I want it to be true.`,
      variants: [
        {
          id: 'outside',
          when: (s) => s.flags.ameliaOutside,
          text: `Good evening, Varrow. Or good morning. [PAUSE]
I’ve been outside with them for a while. It’s very peaceful. The ON AIR sign looks lovely from the pavement.
This is the last bulletin of the week, and I still owe you Sunday’s poem. I have my first line, about the river and the bridge lamps. I want one more line, and I want it to be true.`,
        },
      ],
      options: [
        {
          id: 'lamps', leak: 0,
          text: '“And every lamp along the bank / is someone waiting to come home.”',
          reply: `Oh, that’s beautiful. [PAUSE]
I’ll read it with the lights up, so they can all see. Stay warm.`,
          set: { ameliaCalm: true },
        },
        {
          id: 'leave', leak: 1,
          text: '“Tonight, love, leave the lamps alone, / and let the river keep the light.” It’s true, and people will remember it.',
          reply: `[PAUSE] Leave the lamps alone.
I’ll read it in the dark. Stay warm.`,
        },
        {
          id: 'warm', leak: 2, from: ['megan'],
          text: '“Stay in the dark, stay quiet, stay warm; / the river keeps the lamps for us.” That’s the whole of what anyone needs to know tonight.',
          reply: `Dark, quiet, warm. [PAUSE] That isn’t poetry, dear, that’s instructions.
It’s both. I’ll read it twice. Stay warm.`,
          set: { ameliaCautious: true, ameliaTruth: true },
        },
      ],
    },
    {
      id: 'n3-ana-goats',
      npc: 'ana',
      at: '05:15',
      text: `one bar
sky's going grey behind the town
the goats are eating. all three, heads down in the hay like nothing ever happened
they stopped facing east about an hour ago. is that good? it feels good`,
      variants: [
        {
          id: 'east',
          when: (s) => !s.flags.sealedEast && !s.flags.bridgeClosed,
          text: `one bar
sky's going grey behind the town. there's smoke over the river, a lot of it
the goats still won't eat. they're at the top fence, all three, facing east. they've been there all night
i've got a bad feeling. should i go down and see`,
          options: [
            {
              id: 'go', leak: 0,
              text: 'If you’re worried about people in town, go down once it’s light and see whether anyone needs help. Take water and a first aid kit.',
              reply: `water. kit. dog stays here
going down`,
              set: { anaRisk: true },
            },
            {
              id: 'stay', leak: 1,
              text: 'Stay up the hill. Your goats have faced the town for three days and they haven’t been wrong yet. Keep the gate shut and wait for someone to come up that road in daylight.',
              reply: `staying. goats haven't been wrong yet
gate shut`,
            },
            {
              id: 'smoke', leak: 2, from: ['tomas'],
              text: 'Stay up there. That smoke is from fires people lit by the Old Bridge tonight, and the people standing round them aren’t well. Keep the gate shut until someone comes up the road in daylight.',
              reply: `fires at the bridge. tomas's bridge?
how do you know. ...gate shut`,
              set: { anaWarned: true },
            },
          ],
        },
      ],
      options: [
        {
          id: 'good', leak: 0,
          text: 'That’s a good sign. Animals often notice a change before we do. Let them eat, and get some sleep yourself.',
          reply: `sleep. ha. ok
the dog's asleep on my boots. that'll do`,
        },
        {
          id: 'keep', leak: 1,
          text: 'It’s a good sign, but keep the gate the way it is until someone you trust comes up the road in daylight. Your goats were right all week. Give it a few hours to be sure they’re right about this too.',
          reply: `gate stays. goats were right all week. yes
back down off the rock`,
        },
        {
          id: 'town', leak: 2, from: ['megan'],
          text: 'It’s a good sign. People with this settle in the dark, the quiet and the warm, and animals seem to be the same. If your goats have stopped facing east, whatever was pulling at them has eased. Keep the gate as it is until full daylight.',
          reply: `people with this. so it is a thing. it was always a thing
gate stays till daylight`,
          set: { anaWarned: true },
        },
      ],
    },
    {
      id: 'n3-ty-west',
      npc: 'ty',
      at: '05:25',
      text: `it's getting light. a tiny bit
everyone left the lamp about an hour ago. i heard them go past the house. loads of footsteps, all slow, all going the same way. west, towards the bridge
dad went with them. he stopped outside our door for a bit and then he went
i want to go after him. what do i do`,
      variants: [
        {
          id: 'opened',
          when: (s) => s.flags.tyBreach,
          text: `it's getting light. a tiny bit
i let him in. he stood in the kitchen looking at the light over the cooker for ages. he held my hand. his hands were so cold
then everyone went past outside, all going west, and he just went with them. he didn't even shut the door
my hands are cold now too. is that just from holding his?`,
          options: [
            {
              id: 'warm', leak: 0,
              text: 'It might just be from holding his hands. Make a hot drink, wrap up in a blanket and stay inside where it’s warm. Ring the clinic when it opens.',
              reply: `tea. blanket
the light over the cooker is still on. i keep looking at it`,
            },
            {
              id: 'dark', leak: 1,
              text: 'Turn the kitchen light off and shut the front door. Your dad stared at that light for ages, so don’t you sit near it. Get in the cupboard with Pickle, wrap up, and wait for daylight.',
              reply: `light off. door shut. cupboard
i keep wanting to go and turn it back on`,
            },
            {
              id: 'clinic', leak: 2, from: ['megan'],
              text: 'Go to the clinic in the Centre as soon as it’s light. The nurse there has seen this and knows what helps: dark, quiet and warm. Until then, stay wrapped up in the dark.',
              reply: `how do you know what helps
ok. clinic when it's light. pickle won't come near me`,
            },
          ],
        },
        {
          id: 'sealed',
          when: (s) => s.flags.sealedEast,
          text: `it's getting light. a tiny bit
the suits came down our road with a truck at about four. they took everyone from under the lamp. really gently. i think dad too
one of them knocked and said through the door: stay in, first light, someone will come for you
is that real? should i go down to the tape and ask about dad`,
          options: [
            {
              id: 'go', leak: 0,
              text: 'Yes, go down and ask. If they’ve taken your dad, they’ll want to know who he is, and you’ll feel better for doing something.',
              reply: `going. pickle's coming
there's still a couple of them under the lamp at the end. i'm going past them`,
              set: { tyBreach: true },
            },
            {
              id: 'wait', leak: 0,
              text: 'If they told you to stay in until first light, stay in. Write down everything you remember about your dad tonight, so you can tell them when they come.',
              reply: `writing it down. his coat. what he said
he only said ty`,
            },
            {
              id: 'name', leak: 1,
              text: 'Stay in. When they knock, give them his full name and tell them he’s on the night crew at the Institute and hasn’t been home since Saturday. You’ve told me all that yourself, and it’s exactly what will help them find him.',
              reply: `ok. full name. night crew. since saturday
i'll be at the door when they knock`,
            },
            {
              id: 'dark', leak: 2, from: ['megan'],
              text: 'Stay in. And when they come, tell them this: people like your dad come back best in the dark, the quiet and the warm, not in a bright tent. Ask them to keep him that way.',
              reply: `how do you know what brings them back
ok. writing it down so i don't forget. dark quiet warm`,
              set: { tySafe: true },
            },
          ],
        },
      ],
      options: [
        {
          id: 'careful', leak: 0,
          text: 'I can’t stop you going after your dad. If you go, keep your phone charged, stick to the lit streets, and keep a bit of distance from the crowd.',
          reply: `lit streets. ok. pickle's coming too
i can see them up ahead. dad's at the back. i'm catching up`,
          set: { tyBreach: true },
        },
        {
          id: 'wait', leak: 1,
          text: 'Don’t go yet. Everyone who went out to the lamp is walking with them, and your dad stopped at your door and kept going. He isn’t himself yet. Stay in until it’s full daylight and there are people about, then ring the emergency line and tell them which way he went.',
          reply: `ok. staying in
pickle's asleep on dad's boots. i'm going to sit with him till it's light`,
        },
        {
          id: 'bridge', leak: 2, from: ['tomas', 'megan'],
          text: 'Don’t follow them. People have been walking down to the Old Bridge for two nights, and the ones who go towards the lights don’t come back on their own. What brings them back is dark, quiet and warm. Stay in till daylight, then tell whoever comes exactly which way your dad went.',
          reply: `how do you know about the bridge. and what brings them back
...ok. staying. i'll tell them west`,
          set: { tySafe: true },
        },
        {
          id: 'name', leak: 3, from: ['charles', 'megan'],
          text: 'Stay in. Your dad has been ill since a trial in East Block at the Institute went wrong on the 20th. The nurse at the Varrow clinic says people like him come back in the dark, the quiet and the warm. When help comes, give them his full name and say he went west. That’s how he gets found.',
          reply: `a trial. east block. the 20th
nobody told me anything and you knew all of it. ...ok. i'll give them his name. i'm staying`,
          set: { tySafe: true },
        },
      ],
    },
    {
      id: 'n3-megan-dawn',
      npc: 'megan',
      at: '05:40',
      text: `nearly six
the ward's dark. i just walked it with a torch pointed at the floor and counted. twelve. everyone is breathing. two of them are asleep, properly asleep
the woman in bed four asked me what day it was. first thing she's said since monday that wasn't "light"
warfarin came out from under the desk and is sitting on my feet
what do i put at the top of the handover`,
      variants: [
        {
          id: 'left',
          when: (s) => s.answered['n3-megan-hold']?.opt === 'home',
          text: `nearly six. i'm home
i went round them in the car park like i said. one of them took hold of my sleeve, really gently, and said "light". i pulled away
i slept an hour on the sofa with the big light on. i didn't mean to leave it on
my hands are cold. what do i tell the day shift`,
          options: [
            {
              id: 'ring', leak: 0,
              text: 'Ring the day shift and tell them exactly how you left it: twelve patients, who’s who, and what you were doing for each of them. Then have a hot bath and go back to bed.',
              reply: `rang them. told them everything
the bath's running. the light in here is very bright`,
            },
            {
              id: 'dark', leak: 1,
              text: 'Tell them the one thing you know for sure: the ward only settles when it’s dark and shut. Then turn that big light off and wrap up in the dark yourself.',
              reply: `told them. dark and shut
light's off. i keep looking at where it was`,
            },
            {
              id: 'hands', leak: 0,
              text: 'Cold hands after a night like that are probably just tiredness. Get warm, eat something, and see how you feel after a proper sleep.',
              reply: `toast. blanket. warfarin
still cold. i'll sleep`,
            },
          ],
        },
        {
          id: 'opened',
          when: (s) => s.flags.megOpened,
          text: `nearly six
the corridor's full. everyone from the car park came in and stood where the lights are. they're very quiet. they're very polite
i've stopped humming. i don't know when i stopped
my hands are cold. probably the doors being open all night
what do i put at the top of the handover`,
          options: [
            {
              id: 'sit', leak: 0,
              text: 'Sit down somewhere warm, wrap up and have something hot. You’ve been on your feet for a day, and your hands will warm up.',
              reply: `sitting. tea. the light in the corridor is very bright
it's nice actually`,
            },
            {
              id: 'dark', leak: 1,
              text: 'Turn the corridor lights off. You said they settle in the dark. Then sit with them in it, with Warfarin, and hum something.',
              reply: `lights off. they sat down. all of them at once
i'm humming. i can't remember the words. light. the words are light`,
            },
            {
              id: 'write', leak: 0,
              text: 'Write the handover now, while it’s fresh: names, times, and what worked. Then sleep.',
              reply: `names. times. what worked
i'll do it after. after the light`,
            },
          ],
        },
      ],
      options: [
        {
          id: 'facts', leak: 0,
          text: 'Keep it simple: twelve patients, all stable, two sleeping, one asking what day it is. Then names, times and doses. Then go home and sleep.',
          reply: `twelve. stable. two asleep. one asking the day
then bed. warfarin agrees`,
        },
        {
          id: 'method', leak: 1,
          text: 'Put what worked at the top, in capitals: DARK, QUIET, WARM. DOORS SHUT. Whoever takes over needs that before anything else, and so does the county.',
          reply: `DARK. QUIET. WARM. DOORS SHUT. in red pen
underlined twice. it's the only thing i know for sure`,
          set: { methodShared: true },
        },
        {
          id: 'source', leak: 2, from: ['charles'],
          text: 'Put where it started at the top: East Block at the Institute, on the 20th, with the night crew there as the first cases. Then what works: dark, quiet, warm. Send a copy to the county now, not at nine.',
          reply: `east block. the 20th. how do you know that
...sent. the county rang back in four minutes. four. first time they've ever been fast`,
          set: { megCalled: true, megKnowsInstitute: true, methodShared: true },
        },
        {
          id: 'crew', leak: 3, from: ['charles'],
          text: 'At the top: “Source: East Block, Varrow Institute. A trial there went wrong at 02:11 on Saturday 20 October. Their night facilities manager, Charles, knows the details.” Then: dark, quiet, warm. Send it to the county now. A time and a name are what make them move.',
          reply: `02:11. charles. i KNOW charles
who are you. ...sent. with his name on it`,
          set: { megCalled: true, megKnowsInstitute: true, methodShared: true },
        },
      ],
    },
  ],
};
