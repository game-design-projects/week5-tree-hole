// Night 2, Tuesday 23 October: "Cold hands".
// Millside is unwell. The six still don't know about each other, but tonight their
// corners overlap: the street lamps, the word "light", the locked gate in East Block,
// and a dark ward where the sick finally sit down. Tags as in night1.js:
//   leak  0 common sense · 1 inference from this user's own words · 2 a hint built
//         on someone else's information · 3 says it outright, or names them
//   from  whose information the reply uses (never the person being answered)
//   set   story flags (see docs/DESIGN.md and engine.js for the ones that matter)
// A reply may only use what the player could already have read by then: the
// texts of earlier messages (night 1, or earlier tonight), never replies.

// Charles at dawn, once he has written it all and only needs a push.
const charlesSign = [
  {
    id: 'legal', leak: 0,
    text: 'Yes. Get it on paper while it’s fresh, and send it through the proper channel: your line manager or the legal office. Keep a copy for yourself.',
    reply: `1. The proper channel.
2. Yes. That is what it is for.
3. Thank you.`,
    set: { charlesBuried: true },
  },
  {
    id: 'sign', leak: 1,
    text: 'Sign it. You’ve already done the hard part. Then send it to the people whose job is public health, the county health office and the town clinic, not to the Institute’s lawyers. You said yourself that legal would lose it. Your name is what makes people believe it.',
    reply: `1. Signed.
2. Sent to the county. Sent to the clinic.
3. I feel very strange. I think it is relief.`,
    set: { charlesDisclosed: true },
  },
  {
    id: 'county', leak: 2, from: ['megan'],
    text: 'Put it in writing, sign it, and send it to the county health office and the Varrow clinic, not to legal. The clinic has already asked the county for help with patients from Millside, and was told a team would come on Friday. A signed letter from inside the Institute is what makes them come today.',
    reply: `1. Friday.
2. How do you know what the county told the clinic?
3. Signed. Sent. Both of them. My name is on it.`,
    set: { charlesDisclosed: true },
  },
  {
    id: 'megan', leak: 3, from: ['megan', 'ty'],
    text: 'Send it, signed, to Megan at the Varrow clinic and to the county. She has a ward of Millside patients who won’t sleep, and the county says Friday. Dan’s son Ty is at home on his own, and last night a neighbour stood at his door saying “light”. Your name on that letter is the only thing that will make anyone move.',
    reply: `1. Megan. And the boy.
2. You have been talking to everyone.
3. Signed. Sent. I am going to make the tea now.`,
    set: { charlesDisclosed: true },
  },
];

export default {
  night: 2,
  title: 'Cold hands',
  intro: 'Millside is unwell tonight, and everyone who writes in has noticed something.',
  messages: [
    {
      id: 'n2-ty-lamp',
      npc: 'ty',
      at: '22:10',
      text: `mrs pell from next door has been standing under the streetlamp since about six. no coat. she's just looking up at it
i asked if she was ok and she didn't even turn round
dad's still not home. i rang the switchboard again and gave his full name, dan marsh. same answer: "on duty"
should i take her a coat or something`,
      variants: [
        {
          id: 'sealed',
          when: (s) => s.flags.sealedEast,
          text: `there's tape across the mill road now and a white van with no writing on it. nobody's told us anything
mrs pell from next door has been standing under the streetlamp since about six. no coat. she's just looking up at it
dad's still not home. i rang the switchboard again and gave his full name, dan marsh. same answer: "on duty"
should i take her a coat or something`,
        },
        {
          id: 'worried',
          when: (s) => s.flags.tyWorried,
          text: `door's been locked since last night like you said. pickle's asleep on dad's boots
but mrs pell from next door has been standing under the streetlamp since about six. no coat. she's just looking up at it
dad's still not home. i rang the switchboard again and gave his full name, dan marsh. same answer: "on duty"
should i take her a coat or something`,
        },
      ],
      options: [
        {
          id: 'ring', leak: 0,
          text: 'It’s good of you to worry about her. Don’t stand out there with her on your own. Ring the non-emergency line, tell them an older neighbour has been outside since six without a coat, and call her family if you know them.',
          reply: `ok rang them. they said they're "very busy tonight" and they'll send someone
she's still there. she hasn't moved her feet once`,
        },
        {
          id: 'inside', leak: 1,
          text: 'I wouldn’t go out to her tonight. Four hours under a lamp without a coat, not even turning round when you speak to her: something is wrong with her. And your dad left with ice-cold hands and still isn’t back. Ring for help from inside, keep the door locked, and keep Pickle in.',
          reply: `ok that's kind of scary when you put it like that
door's locked. pickle keeps growling at the window. he never growls`,
          set: { tyWorried: true },
        },
        {
          id: 'lamp', leak: 2, from: ['tomas', 'megan'],
          text: 'Don’t go out to her. Someone else in town stood under a street lamp for ages last night with ice-cold hands, and people from Millside have been turning up at the clinic with cold hands and a fever. Stay in tonight, lock the door, keep your lights low, and stay away from the front windows.',
          reply: `wait someone else did the exact same thing?? how do you know that
ok. lights off. door locked. me and pickle are in the kitchen`,
          set: { tySafe: true },
        },
        {
          id: 'east', leak: 3, from: ['charles', 'megan'],
          text: 'Please stay inside. Your dad is on the East Block night crew, and they’ve been kept on “extended duty” since early Saturday. Three people from Millside went to the clinic last night with ice-cold hands, and one of them works in the Institute canteen. Mrs Pell might have the same thing. Lock the door, turn your lights down, and keep away from the windows.',
          reply: `how do you know what the clinic's got. or what dad's crew is doing
ok. door locked. lights off. i'm actually scared now`,
          set: { tySafe: true, tyWorried: true },
        },
      ],
    },
    {
      id: 'n2-charles-notice',
      npc: 'charles',
      at: '22:30',
      text: `Good evening.
1. Notice 15, please.
2. It should read: "Residents are advised to remain indoors after dark due to works."
3. Nothing about East Block. Nothing about the crew.
4. Notice 14 is on every lamppost in Millside. This one will go up next to it.`,
      variants: [
        {
          id: 'cracking',
          when: (s) => s.flags.charlesPressed || s.flags.charlesWorried || s.flags.charlesWavering,
          text: `Good evening.
1. Notice 15, please.
2. "Residents are advised to remain indoors after dark due to works."
3. I am aware of how that reads.
4. I have not been home since Saturday either. That is not relevant.
5. Please draft it as written.`,
        },
      ],
      options: [
        {
          id: 'draft', leak: 0,
          text: `NOTICE 15
To residents of Millside:
Due to ongoing works at the Institute, residents are advised to remain indoors after dark until further notice.
Thank you for your cooperation.`,
          reply: `1. Thank you.
2. It will be up by eleven.`,
          set: { charlesBuried: true },
        },
        {
          id: 'why', leak: 1,
          text: 'I can draft it. But last night it was “noise and lighting”, and tonight it’s “stay indoors after dark”. Works don’t keep people inside their houses. If there’s a safety reason, the notice should say what it is and who to call, or people won’t know what they’re protecting themselves from.',
          reply: `1. There is a reason.
2. It is not one I can put on a lamppost.
3. Please draft it as written.`,
          set: { charlesWavering: true },
        },
        {
          id: 'clinic', leak: 2, from: ['megan'],
          text: 'I’ll draft it, with one more line: “If you have a fever that won’t come down, a slow pulse or very cold hands, ring the Varrow clinic.” The clinic has been seeing exactly that in people from Millside.',
          reply: `1. The clinic.
2. How would you know what the clinic is seeing?
3. Add the line. Do not tell me where it came from.`,
          set: { charlesPressed: true, charlesWorried: true },
        },
        {
          id: 'pell', leak: 3, from: ['ty', 'megan'],
          text: 'Millside isn’t indoors now. A woman on one street has stood under a street lamp without a coat since six this evening, and a boy on that street can’t get your switchboard to tell him anything about his dad. The clinic saw three people from Millside last night with ice-cold hands, one of them from your canteen. A notice about works won’t cover that.',
          reply: `1. Which street?
2. No. Do not tell me. I know which street.
3. How do you know any of this?`,
          set: { charlesPressed: true, charlesWorried: true },
        },
      ],
    },
    {
      id: 'n2-megan-ward',
      npc: 'megan',
      at: '22:50',
      text: `ok. five on the ward tonight. all millside
none of them have slept since they came in. they won't eat, not even toast, and everyone eats toast
they get up and stand by the radio or the lit window and say "light". that's it. one word, over and over
warfarin won't come out from under the desk. i'm humming sondheim at them. what do i do first`,
      variants: [
        {
          id: 'notes',
          when: (s) => s.flags.megNotes,
          text: `i did write everything down like you said. names, streets, workplaces. it's three pages now
five on the ward tonight. all millside. none of them have slept since they came in, and they won't eat, not even toast
they get up and stand by the radio or the lit window and say "light". that's it. one word, over and over
warfarin won't come out from under the desk. i'm humming sondheim at them. what do i do first`,
        },
      ],
      options: [
        {
          id: 'obs', leak: 0,
          text: 'Keep them warm and drinking, do obs every hour, and write down any change. If anyone’s pulse drops further or they stop drinking, call an ambulance. Then ring the county again first thing.',
          reply: `obs every hour. yes. i know. i just needed someone to say it
the radio one is still standing there. like a coat on a hook`,
        },
        {
          id: 'lights', leak: 1,
          text: 'Look at what they keep going to: the radio and the lit window. Turn the radio off and the lights down, and see whether they settle. And keep all five in one room, away from everyone else, with gloves on.',
          reply: `huh. radio off, lights down. worth a go
side room. gloves on. warfarin approves of the dark`,
          set: { megCareful: true },
        },
        {
          id: 'institute', leak: 2, from: ['charles'],
          text: 'Ask each of them whether they live or work near the Institute. The Institute has kept its night crew on duty since Saturday, and tonight it’s telling Millside to stay indoors after dark. That isn’t what “works” sounds like.',
          reply: `stay indoors after dark? where did you see that
...asking them. the two who can still answer both said the institute`,
          set: { megKnowsInstitute: true },
        },
        {
          id: 'east', leak: 3, from: ['charles', 'ty'],
          text: 'This is coming out of East Block at the Institute. Their night crew has been kept inside since early Saturday, and tonight they want a notice telling Millside to stay in after dark. A woman on one Millside street has stood under a street lamp since six. Keep your five apart, glove up, and tell the county it’s linked to the Institute.',
          reply: `east block. you said that like you've seen the rota
who are you getting this from? ...no. later. gloves first`,
          set: { megKnowsInstitute: true, megWarned: true },
        },
      ],
    },
    {
      id: 'n2-tomas-bus',
      npc: 'tomas',
      at: '23:15',
      text: `bus is rammed tonight. all millside, all heading west, bags and everything. nobody's talking
and guess who's back. one more stop guy. same seat, same freezing hands when he paid
half of them want chapel lane. it's my route so i keep going right?`,
      variants: [
        {
          id: 'called',
          when: (s) => s.flags.tomasCalled || s.flags.tomasClinic,
          text: `bus is rammed tonight. all millside, all heading west, bags and everything. nobody's talking
and the one more stop guy is back. i rang about him last night and nobody came. now he's in the same seat with the same freezing hands
half of them want chapel lane. it's my route so i keep going right?`,
        },
      ],
      options: [
        {
          id: 'route', leak: 0,
          text: 'It’s your route and they’ve paid, so yes. Keep a window open, keep an eye on the man at the back, and let everyone off where they want to go.',
          reply: `yeah. chapel lane. dolly on, windows down
one more stop he says. one more stop`,
          set: { tomasCrossed: true },
        },
        {
          id: 'clinic', leak: 1,
          text: 'Pull in at the Old Bridge and ring the clinic about the man with ice-cold hands. He’s been on your bus two nights running and he clearly isn’t well. Don’t take him any further yourself, and don’t let him sit right behind you.',
          reply: `ok pulled in at stop 14. clinic says they've got a whole ward of them??
they're sending someone for him. the rest are getting a bit shouty about chapel lane`,
          set: { tomasAlert: true, tomasCalled: true },
        },
        {
          id: 'stop', leak: 2, from: ['megan', 'ty'],
          text: 'Stop at the Old Bridge tonight, let nobody else on, and ring the clinic from there. The clinic already has a ward full of people from Millside with ice-cold hands, and there are people in Millside standing under street lamps for hours. Don’t carry it over the river.',
          reply: `a ward full?? how do u know what's in the clinic
ok. parked at 14. doors shut. ringing them`,
          set: { tomasHeld: true },
        },
        {
          id: 'megan', leak: 3, from: ['megan'],
          text: 'Megan at the clinic has five patients from Millside tonight. None of them sleep, they won’t eat, and they stand by the lit window saying “light”. Your one-more-stop man has the same thing. Stop at the bridge, let nobody else on, and ring her.',
          reply: `five?? megan told u that? she never tells me anything about patients
ok. parked at the bridge. ringing her`,
          set: { tomasHeld: true, tomasClinic: true },
        },
      ],
    },
    {
      id: 'n2-amelia-bulletin',
      npc: 'amelia',
      at: '23:40',
      text: `Good evening, Varrow. [PAUSE]
I’m putting together tomorrow’s six o’clock bulletin and the phones haven’t stopped. It’s all Millside, and they all ask the same thing: is it safe?
The Institute has put up a new notice telling Millside to stay indoors after dark, “due to works”. I’ve got the bake sale, and nothing else.
Do you have anything for me?`,
      variants: [
        {
          id: 'hedged',
          when: (s) => s.flags.ameliaHedged,
          text: `Good evening, Varrow. [PAUSE]
I’m putting together tomorrow’s six o’clock bulletin and the phones haven’t stopped. It’s all Millside, and they all ask the same thing: is it safe?
I kept my promise and didn’t say “nothing to worry about”. Now the Institute has a notice up telling Millside to stay indoors after dark, “due to works”, and I still have nothing true to tell them.
Do you have anything for me?`,
        },
        {
          id: 'calm',
          when: (s) => s.flags.ameliaCalm,
          text: `Good evening, Varrow. [PAUSE]
Last night I told everyone the Institute was nothing to worry about. Tonight the phones haven’t stopped. It’s all Millside, and they all ask the same thing: is it safe?
Now there’s a notice telling Millside to stay indoors after dark, “due to works”. I feel rather a fool.
Do you have anything for me for the six o’clock?`,
        },
      ],
      options: [
        {
          id: 'notice', leak: 0,
          text: '“Good morning, Varrow. The Institute advises residents of Millside to stay indoors after dark while works continue. The Chapel Lane bake sale is on Saturday from ten. Stay warm.”',
          reply: `Short and sweet. I’ll read it.
I do wish someone would tell me what the works are.`,
          set: { ameliaCalm: true },
        },
        {
          id: 'honest', leak: 1,
          text: '“Good morning, Varrow. The Institute has asked Millside to stay indoors after dark. We don’t know why yet, and we’ve asked. Until we hear, please do as they say, and check on your neighbours by phone rather than on foot. Stay warm.”',
          reply: `“We don’t know why yet.” It’s an awful thing to say on air, and it’s true.
I’ll read it.`,
          set: { ameliaHedged: true },
        },
        {
          id: 'lamps', leak: 2, from: ['megan', 'ty'],
          text: 'Add this: “If you or anyone at home has a fever that won’t come down, or very cold hands, ring the clinic. If you see someone standing still under a street lamp, don’t go out to them; ring for help. Keep your curtains drawn and your lamps low tonight.” And do the same at the station, Amelia: lights low, door locked.',
          reply: `Under a street lamp. That’s a very particular thing to say, dear. Where is it coming from?
I’ll read it. And I’ll turn the studio lamp down.`,
          set: { ameliaCautious: true, ameliaHedged: true },
        },
        {
          id: 'truth', leak: 3, from: ['megan', 'charles'],
          text: 'Tell them what’s known. The clinic has five patients from Millside who won’t sleep or eat and stand by lit windows. The Institute has kept its night crew inside since Saturday and is calling it works. Ask anyone with a fever or cold hands to ring the clinic, and everyone to stay in with their lights low. And keep your own studio dark tonight.',
          reply: `Five patients. The night crew. Who on earth are you talking to?
I’ll say it at six. All of it. Gently.`,
          set: { ameliaTruth: true, ameliaCautious: true, ameliaInformed: true },
        },
      ],
    },
    {
      id: 'n2-ana-goats',
      npc: 'ana',
      at: '00:15',
      text: `one bar. rock again
the goats are lying down in the barn now, all three. the little one is shaking and won't stop
there's smoke or mist over the town, hard to tell from up here. and the dog won't go near the east fence
do i ring the vet in town or wait`,
      variants: [
        {
          id: 'wary',
          when: (s) => s.flags.anaWary,
          text: `one bar. rock again
barn like you said, gate shut. didn't help much. they're all lying down now and the little one is shaking and won't stop
there's smoke or mist over the town, hard to tell from up here. and the dog won't go near the east fence
do i ring the vet in town or wait`,
        },
      ],
      options: [
        {
          id: 'vet', leak: 0,
          text: 'A goat that won’t stop shaking needs a vet. Keep her warm tonight with a blanket and plenty of straw, and ring the vet in town first thing.',
          reply: `vet's in town. town's under the smoke. hm
fine. blanket on the little one`,
        },
        {
          id: 'stay', leak: 1,
          text: 'All three changed together, they all faced the town yesterday, and now the dog won’t go near the east fence. Whatever it is, it’s coming from the town side. I’d keep away from town for now: keep the barn shut, and stock up on feed and water while the road is quiet.',
          reply: `the town side. yes. that's the way they all face
not going down. stocking up from the shed`,
          set: { anaWary: true },
        },
        {
          id: 'town', leak: 2, from: ['megan', 'tomas'],
          text: 'I wouldn’t go into town for the vet. People down there are falling ill with a fever and ice-cold hands, and a lot of them are leaving Millside and heading west tonight. Keep the barn shut, keep the gate shut, and stock up on feed and water while the roads are quiet.',
          reply: `people leaving millside. tomas says that kind of thing. how do you know it
ok. gate shut. stocking up`,
          set: { anaWary: true, anaAlert: true },
        },
        {
          id: 'gate', leak: 3, from: ['megan', 'charles', 'tomas'],
          text: 'Stay up the hill. The clinic in town has five patients from Millside tonight who won’t sleep and stand by lit windows, the Institute has told Millside to stay in after dark, and the night bus is full of people leaving. If anyone comes up your road, check their hands at the gate. Warm and talking sense, they come in. Cold, or saying the same word over and over, the gate stays shut.',
          reply: `that's the clinic's business and the institute's business and the bus's business
you know a lot of business. gate rule noted`,
          set: { anaWarned: true, anaAlert: true },
        },
      ],
    },
    {
      id: 'n2-megan-county',
      npc: 'megan',
      at: '00:40',
      text: `county replied. one word: "noted"
plus a line saying a team will visit "on friday". it's tuesday. i have five who won't sleep and two more in the waiting room
do i write back, or do i give up on them and just do my job`,
      variants: [
        {
          id: 'sealed',
          when: (s) => s.flags.sealedEast,
          text: `county replied to my email from last night. not "noted" this time. they've put tape across the mill road and there's a white van at the institute gate
but the team for my clinic is still "on friday". i have five who won't sleep and two more in the waiting room
do i write back, or do i just do my job`,
        },
        {
          id: 'knows',
          when: (s) => s.flags.megKnowsInstitute,
          text: `county replied. one word: "noted"
i told them about the canteen and the institute. they still said "noted". plus a team will visit "on friday". it's tuesday
i have five who won't sleep and two more in the waiting room. do i write back, or do i give up on them and just do my job`,
        },
      ],
      options: [
        {
          id: 'job', leak: 0,
          text: 'Do your job tonight, and write back in the morning when you’ve slept. Keep a note of every patient and the time they came in, so it’s all ready for Friday.',
          reply: `friday. ok. noted, as they say
back to the ward`,
        },
        {
          id: 'cluster', leak: 1,
          text: 'Write back tonight. “Noted” isn’t an answer to seven patients from one area with the same signs. Use the word “cluster”, give the numbers and the street, say plainly that it isn’t flu, and ask for a named person to ring you before nine.',
          reply: `seven patients, one area, not flu, named person. sent
if they reply "noted" again i'm driving over there`,
          set: { megCareful: true },
        },
        {
          id: 'institute', leak: 2, from: ['charles'],
          text: 'Write back and tie it to the Institute. Their night crew has been kept on duty since Saturday, and tonight they’ve told Millside to stay indoors after dark “due to works”. A cluster next door to a plant that’s hiding something is not a Friday problem.',
          reply: `kept on since saturday. stay indoors after dark. how do you know what the institute's telling people
...it's going in the email anyway. sent`,
          set: { megCalled: true, megKnowsInstitute: true },
        },
        {
          id: 'notice', leak: 3, from: ['charles', 'ty'],
          text: 'Tell the county it’s coming from East Block at the Institute. Their facilities manager asked for public notices calling it “works”. Their night crew hasn’t been home since Saturday, and one crew member’s son, Ty, can’t get the switchboard to tell him anything. A woman on his street has stood under a street lamp all evening. Put all of that in writing.',
          reply: `their facilities manager. a boy called ty. i don't know how you know any of this
i'm putting it all in. every word. sent`,
          set: { megCalled: true, megKnowsInstitute: true },
        },
      ],
    },
    {
      id: 'n2-ty-door',
      npc: 'ty',
      at: '01:10',
      text: `mrs pell is at our front door
she's got her hand on the handle and she keeps saying "light". just that. light, light, light
pickle is growling at the door. the hall light is on. what do i do`,
      variants: [
        {
          id: 'safe',
          when: (s) => s.flags.tySafe,
          text: `the lights are off like you said. but mrs pell came up our path anyway
she's at the front door with her hand on the handle and she keeps saying "light". just that, over and over
pickle is growling at the door. what do i do`,
        },
      ],
      options: [
        {
          id: 'blanket', leak: 0,
          text: 'She’s your neighbour, and she’s been out in the cold for hours. Keep the chain on and open the door just enough to pass her a blanket, then ring an ambulance for her.',
          reply: `ok. door on the chain. i passed her the blanket
she grabbed my wrist. her hand was so cold. she's gone back to the lamp now`,
          set: { tyBreach: true },
        },
        {
          id: 'call', leak: 0,
          text: 'Don’t open the door. Ring the emergency number, tell them a confused older neighbour is trying your front door, and stay on the line until someone comes.',
          reply: `rang. they said they're getting a lot of calls from millside tonight
she's still there. the handle keeps moving`,
        },
        {
          id: 'dark', leak: 1,
          text: 'Don’t open it. She stood under the lamp from six, and now she’s at your door saying “light”. I think the light is what she’s following. Turn off the hall light and every lamp, lock the door, and take Pickle into a back room away from the windows. Keep quiet until she goes.',
          reply: `ok. everything off. me and pickle are in the bathroom. it's so dark
...the handle stopped. i think she walked back to the lamp`,
          set: { tySafe: true },
        },
        {
          id: 'clinic', leak: 2, from: ['megan'],
          text: 'Don’t open it. People with this go towards lights and noise; at the clinic they stand by the lit window and the radio and say that same word. Turn off every light and anything making a sound, lock the door, and sit with Pickle somewhere away from the windows.',
          reply: `the clinic has people saying light too?? how do you know that
ok everything's off. she let go of the handle. she went back to the lamp`,
          set: { tySafe: true, tyWorried: true },
        },
      ],
    },
    {
      id: 'n2-charles-gate',
      npc: 'charles',
      at: '01:40',
      text: `1. I have locked the inner gate of East Block. From the outside.
2. The crew are at the windows. They will not sleep. They do not eat. They watch the lamps in the car park.
3. On the 20th, a trial in East Block went wrong. Containment failed at 02:11.
4. I have not written that down anywhere else.
5. Dan Marsh asked me through the glass to let him go home to his son.
6. What do I say to him?`,
      variants: [
        {
          id: 'buried',
          when: (s) => s.flags.charlesBuried,
          text: `1. Notice 15 is up on every lamppost in Millside.
2. I have locked the inner gate of East Block. From the outside.
3. The crew are at the windows. They will not sleep. They do not eat. They watch the lamps in the car park.
4. On the 20th, a trial in East Block went wrong. Containment failed at 02:11.
5. That is not on any notice.
6. Dan Marsh asked me through the glass to let him go home to his son. What do I say to him?`,
        },
      ],
      degrade: { 1: '7. The car park lamps are very bright tonight. I had not noticed before.' },
      options: [
        {
          id: 'gentle', leak: 0,
          text: 'Tell him the truth you can: that he’s unwell, that he’s being looked after, and that you’ll make sure his family hears from you. Keep the gate locked until a doctor has seen the crew.',
          reply: `1. I told him.
2. He nodded. Then he went back to the window.
3. I do not think he heard me.`,
        },
        {
          id: 'write', leak: 1,
          text: 'You’ve just written down more than anyone else has: a trial went wrong on the 20th, containment failed at 02:11, and the crew haven’t slept since. Write it out properly tonight, with times and names, and put your own name at the bottom. Then you’ll have something true to tell Dan, and everyone else.',
          reply: `1. With my name.
2. I have started. I have got as far as the date.
3. Tea is at two. I will continue after tea.`,
          set: { charlesWavering: true },
        },
        {
          id: 'son', leak: 2, from: ['ty'],
          text: 'Tell him his son is at home with the dog, waiting for him. Then tell someone outside the Institute. His family has rung your switchboard and been told “on duty”, and that’s all. They deserve to hear the truth from a person.',
          reply: `1. You know his son.
2. How do you know his son?
3. I told Dan the boy is waiting. He put his hand flat on the glass.`,
          set: { charlesPressed: true, charlesWorried: true },
        },
        {
          id: 'clinic', leak: 3, from: ['ty', 'megan'],
          text: 'Ring the Varrow clinic tonight and tell them what you just told me, with your name. Megan there has five patients from Millside who won’t sleep and stand by the lit window saying “light”, and the county won’t come until Friday. Dan’s son Ty is at home alone, and a neighbour has been at his door with her hand on the handle. Your crew is where it started.',
          reply: `1. Megan. I know Megan.
2. How do you know Megan’s patients? How do you know the boy?
3. I am telephoning the clinic. I have given her my name.`,
          set: { charlesDisclosed: true },
        },
      ],
    },
    {
      id: 'n2-megan-dark',
      npc: 'megan',
      at: '02:20',
      text: `something weird just happened
the power tripped on the ward for about ten minutes. lights off, radio off, but the heaters were still going. dark, quiet, warm
all five of them sat down. two of them actually slept. first sleep since saturday
lights came back on and they were up at the window again within a minute
is that a thing? can i just keep them in the dark?`,
      variants: [
        {
          id: 'tried',
          when: (s) => s.answered['n2-megan-ward']?.opt === 'lights',
          text: `you know how i turned the radio off and the lights down? they went quieter. then the power tripped completely for ten minutes. dark, quiet, heaters still going
all five of them sat down. two of them actually slept. first sleep since saturday
lights came back on and they were up at the window again within a minute
so it's a thing. can i just keep them in the dark?`,
        },
      ],
      options: [
        {
          id: 'dim', leak: 0,
          text: 'It can be. Confused patients often settle in a dim, quiet, warm room. Keep the lights low and the radio off, check on them with a small torch, and see whether it holds.',
          reply: `torch only. radio's going in a drawer
warfarin has come out from under the desk. that's how i know it's working`,
        },
        {
          id: 'lock', leak: 1,
          text: 'You’ve found the thing that helps: dark, quiet and warm. Keep the ward that way and lock it, so nobody walks in with a torch, a phone or a radio. Staff in gloves, nobody in or out who doesn’t need to be. And write down exactly what you saw, with the times.',
          reply: `ward locked. gloves on. torch taped over with a sock
writing it down. 02:20, power trip, five sat down`,
          set: { megIsolated: true },
        },
        {
          id: 'lamps', leak: 2, from: ['ty', 'tomas'],
          text: 'It’s happening outside too. People in Millside are standing under the street lamps for hours, and someone stood under the one by the Old Bridge last night. Keep your ward dark, quiet and warm, lock it, and tell anyone who’ll listen that the light is what draws them.',
          reply: `under the street lamps. who's telling you that?
...doesn't matter. ward's locked. lights stay off`,
          set: { megIsolated: true },
        },
        {
          id: 'east', leak: 3, from: ['charles'],
          text: 'Keep them in the dark, lock the ward, and tell the county tonight. On the 20th a trial in East Block at the Institute went wrong, and containment failed at 02:11. The crew there haven’t slept since, and they stand at the windows watching the lamps. Your patients have the same thing, and the county needs to hear it from you.',
          reply: `containment failed. 02:11. that's a time off a log. how have you seen a log
emailing the county with every word. ward's locked`,
          set: { megIsolated: true, megCalled: true, megKnowsInstitute: true },
        },
      ],
    },
    {
      id: 'n2-tomas-bridge',
      npc: 'tomas',
      at: '02:50',
      text: `parked at stop 14, old bridge
people walking down from millside on foot. suitcases, prams, one guy carrying a telly. at 3am
a woman with a little kid asked me to take them over to the centre. the kid's asleep on her shoulder. her hands are cold but she says it's just the night air
do i take them`,
      variants: [
        {
          id: 'held',
          when: (s) => s.flags.tomasHeld,
          text: `still parked at stop 14 like u said. doors shut
people walking down from millside on foot now. suitcases, prams, one guy carrying a telly. at 3am
a woman with a little kid asked me to take them over to the centre. the kid's asleep on her shoulder. her hands are cold but she says it's just the night air
do i take them`,
        },
        {
          id: 'crossed',
          when: (s) => s.flags.tomasCrossed,
          text: `did chapel lane, dropped everyone. now i'm back at stop 14, old bridge
people walking down from millside on foot. suitcases, prams, one guy carrying a telly. at 3am
a woman with a little kid asked me to take them over to the centre. the kid's asleep on her shoulder. her hands are cold but she says it's just the night air
do i take them`,
        },
      ],
      options: [
        {
          id: 'take', leak: 0,
          text: 'It’s three in the morning and she has a child with her. Take them across and drop them somewhere warm and well lit in the Centre.',
          reply: `ok. took them. dropped them under the big lamp by the chemist
the kid woke up and said "light". kids say weird stuff`,
          set: { tomasCrossed: true },
        },
        {
          id: 'wait', leak: 1,
          text: 'You said her hands are cold, and she’s walking out of Millside at three in the morning. Don’t take her into town yet. Let them sit on the bus at the bridge with the doors shut and the lights low, ring the clinic, and let nobody else on.',
          reply: `ok. she's sat at the front with the kid. lights down. rang the clinic
the others are just standing on the bridge now. looking at the lamps`,
          set: { tomasWaited: true },
        },
        {
          id: 'park', leak: 2, from: ['megan'],
          text: 'Don’t take anyone over tonight. Park the bus across the bridge and turn your lights off. What these people have draws them to light and noise, and they calm down in the dark. The clinic is already full. Let the woman and her child sit on the bus with you, and ring the clinic.',
          reply: `the clinic's full?? how do u know that
ok. bus is across the bridge. lights off. nobody's getting past`,
          set: { bridgeClosed: true, tomasHeld: true },
        },
        {
          id: 'east', leak: 3, from: ['charles', 'megan'],
          text: 'This started at the Institute: a trial in East Block went wrong on the 20th. Megan at the clinic has five patients from Millside who won’t sleep and stand by lit windows. Park the bus across the bridge, lights off, doors shut, and ring her. Nobody crosses tonight.',
          reply: `the institute?? a trial?? u know a lot for a phone
ok. bus is across the bridge. ringing megan`,
          set: { bridgeClosed: true, tomasHeld: true, tomasClinic: true },
        },
      ],
    },
    {
      id: 'n2-amelia-callers',
      npc: 'amelia',
      at: '03:20',
      text: `Good evening, Varrow. [PAUSE]
It’s gone three and I’m still here, dear. The callers tonight. A man on Quarry Road says his neighbour has been standing at her gate since teatime, just facing the road. Two people say their dogs won’t eat.
And one lady asked whether she should go out and bring her husband in from the garden. He’s been out there since nine and won’t answer her.
What do I tell them on air?`,
      variants: [
        {
          id: 'cautious',
          when: (s) => s.flags.ameliaCautious,
          text: `Good evening, Varrow. [PAUSE]
It’s gone three. I’m sitting here with the studio lamp off, like you said, reading by the light of the dial. The callers tonight, dear. A man on Quarry Road says his neighbour has been standing at her gate since teatime, just facing the road. Two people say their dogs won’t eat.
And one lady asked whether she should go out and bring her husband in from the garden. He’s been out there since nine and won’t answer her.
What do I tell them on air?`,
        },
      ],
      options: [
        {
          id: 'bring', leak: 0,
          text: '“If someone you love is outside and unwell, bring them in somewhere warm, give them a hot drink, and call the doctor in the morning. Look out for your neighbours tonight.”',
          reply: `Somewhere warm and a hot drink. That’s what my mother would have said.
I’ll read it.`,
          set: { ameliaCalm: true },
        },
        {
          id: 'stay', leak: 1,
          text: 'Your callers are describing people who aren’t themselves. Try: “If someone you know is standing outside and won’t answer you, please don’t go out to them tonight. Stay in, lock your door, and ring the clinic in the morning.” And Amelia, keep the station door locked too.',
          reply: `Don’t go out to them. That’s a hard thing to say to a wife.
I’ll say it kindly. The door’s locked.`,
          set: { ameliaHedged: true },
        },
        {
          id: 'dark', leak: 2, from: ['megan', 'ty'],
          text: '“Please don’t go out to them. Turn your lights down, keep away from the windows, and keep the house quiet. People who are unwell like this go towards lamps and noise, and they settle in the dark.” And do the same at the station: lamps off, door locked.',
          reply: `They settle in the dark. How do you know that, dear? Who told you?
I’ve turned the studio lamp off. I’ll read it by the dial.`,
          set: { ameliaCautious: true },
        },
        {
          id: 'truth', leak: 3, from: ['megan', 'charles'],
          text: 'Tell them what’s really happening. On the 20th, something went wrong in East Block at the Institute. The clinic has found that people with it calm down in a dark, quiet, warm room. So: don’t go out to them, keep the lights low, the curtains shut and the house quiet, and ring the clinic. And turn your own studio lamps off.',
          reply: `East Block. The clinic. That’s the most anyone has told me all week, and you won’t say how you know.
Lamps off. I’m going on air.`,
          set: { ameliaCautious: true, ameliaTruth: true },
        },
      ],
    },
    {
      id: 'n2-ana-visitor',
      npc: 'ana',
      at: '03:50',
      text: `one bar
the house phone rang. a woman from quarry road, says she knows my cousin. she wants to come up to the farm tonight with her two lads
says the town has "gone strange". i've got room in the barn loft
do i say yes`,
      variants: [
        {
          id: 'warned',
          when: (s) => s.flags.anaWarned,
          text: `one bar
the house phone rang. a woman from quarry road, says she knows my cousin. she wants to come up to the farm tonight with her two lads
says the town has "gone strange". i've got room in the barn loft. i've got your gate rule too. but she knows my cousin
do i say yes`,
        },
      ],
      options: [
        {
          id: 'yes', leak: 0,
          text: 'If you have the room and they’re frightened, it’s a kind thing to do. Tell them to come up, and leave the gate open so they can find it in the dark.',
          reply: `gate's open. kettle's on
the dog's gone under the table`,
          set: { anaRisk: true },
        },
        {
          id: 'daylight', leak: 1,
          text: 'Your animals have been telling you something for two days, and now someone says the town has gone strange. Don’t open the gate in the dark to people you can’t see properly. Tell her to lock her door tonight, and you’ll talk again at first light.',
          reply: `first light. she didn't like it. i don't like it either
gate's shut`,
          set: { anaWary: true },
        },
        {
          id: 'hands', leak: 2, from: ['megan'],
          text: 'Say yes on one condition, and keep to it. Meet them at the gate with a torch and feel their hands. Warm hands, and they’re talking sense: they come in. Cold hands, or one of them keeps saying the same word: the gate stays shut. Then stock up tomorrow on feed, water and fuel.',
          reply: `feel their hands. why their hands
...fine. torch by the gate. that's the rule`,
          set: { anaWarned: true },
        },
        {
          id: 'bridge', leak: 3, from: ['tomas', 'megan', 'charles'],
          text: 'People are walking out of Millside with suitcases tonight, and a woman at the Old Bridge had cold hands she blamed on the night air. The clinic has five patients from Millside who won’t sleep. Something went wrong at the Institute on the 20th. Check every pair of hands at the gate: warm and making sense, they come in; cold, the gate stays shut.',
          reply: `the bridge. the clinic. the institute. how many people are you talking to
gate rule. torch. ok`,
          set: { anaWarned: true, anaAlert: true },
        },
      ],
    },
    {
      id: 'n2-megan-staff',
      npc: 'megan',
      at: '04:30',
      text: `jo, my healthcare assistant, wants to go home to millside. her mum isn't answering the phone
jo's been on the ward with them all night. i checked her hands and they're warm
she's crying in the sluice. i can't really stop her, can i?`,
      variants: [
        {
          id: 'locked',
          when: (s) => s.flags.megIsolated,
          text: `the ward's locked like we said. nobody in or out
but jo, my healthcare assistant, wants to go home to millside. her mum isn't answering the phone
jo's been on the ward with them all night. i checked her hands and they're warm
she's crying in the sluice. i can't really stop her, can i?`,
        },
      ],
      options: [
        {
          id: 'go', leak: 0,
          text: 'You can’t keep her against her will, and she’s frightened for her mum. Let her go, ask her to wear a mask and gloves, and to ring you as soon as she gets there.',
          reply: `she's gone. mask on. she said she'd be back for the day shift
i unlocked the door for her. it felt wrong`,
          set: { megOpened: true },
        },
        {
          id: 'stay', leak: 1,
          text: 'Ask her to stay, and tell her why. She’s been on the ward with five patients all night. If she goes to Millside she could carry it to her mum, and when she comes back she carries Millside in with her. Keep the ward locked, nobody in or out, and have her ring her mum’s neighbours instead.',
          reply: `she's staying. she hates me a bit. the neighbours are ringing round
ward's locked`,
          set: { megIsolated: true },
        },
        {
          id: 'street', leak: 2, from: ['ty'],
          text: 'Millside isn’t safe to walk into tonight. People there are standing under the street lamps, and one of them was trying a neighbour’s door handle a few hours ago. Keep Jo with you, lock the ward, and have her ring her mum’s neighbours instead.',
          reply: `trying door handles. how do you know what's going on in millside streets
...jo's staying. ward's locked`,
          set: { megIsolated: true },
        },
        {
          id: 'east', leak: 3, from: ['charles', 'ty'],
          text: 'Don’t let her go. A trial in East Block at the Institute went wrong on the 20th, and Millside is where it’s coming out. Tonight a neighbour stood at a boy’s front door there with her hand on the handle, saying “light”. Lock the ward, nobody in or out, and have Jo ring round her mum’s street.',
          reply: `east block. a boy's front door. you know far too much
jo's staying. ward's locked. i'm asking you how later`,
          set: { megIsolated: true, megKnowsInstitute: true },
        },
      ],
    },
    {
      id: 'n2-charles-write',
      npc: 'charles',
      at: '05:00',
      text: `1. Should I write it all down?
2. Who would I even send it to?
3. The Institute's legal office would receive it first. They would thank me and lose it.
4. Tea is at six. I would like to have decided by then.`,
      variants: [
        {
          id: 'disclosed',
          when: (s) => s.flags.charlesDisclosed,
          text: `1. I telephoned the clinic.
2. The nurse wrote down every word. She did not shout. I had expected shouting.
3. She has asked me to put it all in writing.
4. Should I? Who else would I even send it to?`,
          options: [
            {
              id: 'writing', leak: 0,
              text: 'Yes. Write down exactly what you told her, with the times, and sign it. Send it to her and keep a copy for yourself.',
              reply: `1. Signed. Sent.
2. The copy is in my spare room, under the model of the valley.`,
            },
            {
              id: 'county', leak: 1,
              text: 'Yes, and send the same letter to the county health office. The clinic will be heard faster if the county has it from you directly. You’ve already done the hardest part, which was saying it out loud.',
              reply: `1. The county as well.
2. Sent.
3. It is the first notice I have written that says what it means.`,
            },
            {
              id: 'friday', leak: 2, from: ['megan'],
              text: 'Send it to the county as well, signed. They told the clinic their team would come on Friday. A letter from inside the Institute is what makes that today.',
              reply: `1. Friday. She did not tell me about Friday.
2. How do you know about Friday?
3. Sent, regardless.`,
            },
          ],
        },
        {
          id: 'pressed',
          when: (s) => s.flags.charlesWorried,
          text: `1. I have written it all down. Four pages.
2. My name is typed at the bottom. I have not signed it.
3. Who would I even send it to? The Institute's legal office would receive it first. They would thank me and lose it.
4. Tea is at six. I would like to have decided by then.`,
          options: charlesSign,
        },
      ],
      degrade: { 1: '5. The car park lamps are very bright. I have closed the blinds in my office.' },
      options: [
        charlesSign[0],
        {
          id: 'notes', leak: 1,
          text: 'Write it all down now, while you remember it: the trial on the 20th, 02:11, the locked gate, the crew at the windows. Keep a copy somewhere outside the Institute. Even if you don’t send it yet, it should exist.',
          reply: `1. Outside the Institute.
2. My spare room. Under the model of the valley.
3. It will exist.`,
          set: { charlesWavering: true },
        },
        charlesSign[2],
        charlesSign[3],
      ],
    },
    {
      id: 'n2-ty-dawn',
      npc: 'ty',
      at: '05:30',
      text: `it's getting light soon
i'm going to walk up to the institute gate at first light and ask for dad in person. they can't say "on duty" to my face
pickle can come. it's only twenty minutes. good idea?`,
      variants: [
        {
          id: 'cold',
          when: (s) => s.flags.tyBreach,
          text: `my wrist still feels cold where she grabbed it. probably nothing
it's getting light soon. i'm going to walk up to the institute gate at first light and ask for dad in person. they can't say "on duty" to my face
good idea?`,
        },
        {
          id: 'safe',
          when: (s) => s.flags.tySafe,
          text: `me and pickle stayed in the dark all night like you said. mrs pell went back to her lamp
it's getting light soon. i'm going to walk up to the institute gate at first light and ask for dad in person. they can't say "on duty" to my face
good idea?`,
        },
      ],
      degrade: { 1: 'the whole street smells like batteries now' },
      options: [
        {
          id: 'go', leak: 0,
          text: 'It’s fair to want answers face to face. Go in daylight, stick to the main road, and ask politely at the front desk for a manager. Take your phone and let someone know where you’re going.',
          reply: `ok. going at seven. pickle's coming
thanks. i'll tell you what they say`,
          set: { tyBreach: true },
        },
        {
          id: 'stay', leak: 1,
          text: 'Please don’t. Mrs Pell was at your door last night saying “light”, the switchboard won’t tell you anything, and your dad left with freezing hands. Whatever is wrong is coming from up there. Stay in with the door locked and the lights low, and ring them at nine instead.',
          reply: `ugh. ok. you're right. i hate that you're right
staying in. pickle's back on dad's boots`,
          set: { tySafe: true },
        },
        {
          id: 'locked', leak: 2, from: ['charles', 'megan'],
          text: 'Don’t go up there. The people inside the Institute aren’t well, the gates are locked, and the clinic in town is full of people from Millside. You’d be walking towards it. Stay home with the door locked and the lights low, away from the windows, and wait.',
          reply: `the gates are locked?? how would you know that
...ok. staying. but if you knew where my dad was you'd tell me right`,
          set: { tySafe: true, tyWorried: true },
        },
        {
          id: 'east', leak: 3, from: ['charles'],
          text: 'Your dad is in East Block, behind an inner gate that’s been locked from the outside. A trial there went wrong on the 20th, and containment failed at 02:11. Last night he asked to come home to you. He isn’t well, and you can’t help him by going there. Stay home, door locked, lights low.',
          reply: `he asked to come home to me
how do you know that. who told you that. ok. i'm staying. i'm staying`,
          set: { tySafe: true, tyWorried: true },
        },
      ],
    },
  ],
};
