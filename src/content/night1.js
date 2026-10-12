// Night 1, Monday 22 October: "Is anyone there?"
// Six people write in for ordinary reasons. Each of them holds one corner of the
// picture; only the service sees all of it. Every reply below is tagged:
//   leak  0 common sense · 1 inference from this user's own words · 2 a hint built
//         on someone else's information · 3 says it outright, or names them
//   from  whose information the reply uses (never the person being answered)
//   set   story flags (see docs/DESIGN.md and engine.js for the ones that matter)
// A reply may only use what the player could already have read by then: the
// texts of earlier messages, never earlier replies.

export default {
  night: 1,
  title: 'Is anyone there?',
  intro: 'The town is quiet. Your first users are writing in.',
  messages: [
    {
      id: 'n1-ty-dog',
      npc: 'ty',
      at: '22:10',
      text: `hi. random question
is it normal for a dog to just stop eating? pickle looked at his bowl for ages and then walked off
now he's sitting at the front window staring down the mill road. he never does that
my dad would know but he's on nights at the institute. they've had him on double shifts since saturday`,
      options: [
        {
          id: 'vet', leak: 0,
          text: 'Dogs skip a meal now and then, especially if the weather or their routine changes. Leave water out and try again in the morning. If he still won’t eat by tomorrow evening, or he stops drinking, ring a vet.',
          reply: `ok thanks. he's still at the window lol
i'll try him with some cheese`,
        },
        {
          id: 'window', leak: 1,
          text: 'You said he’s staring down the mill road. Has anything changed out that way this week? Dogs often notice a new noise, smell or light long before people do.',
          reply: `not really? the institute has every light on all night now. dad says they always run late
oh and the smell. kind of like a battery. i thought it was the bins`,
          set: { tyWatch: true },
        },
        {
          id: 'routine', leak: 0,
          text: 'With your dad away on double shifts, Pickle might just be missing him. Dogs often go off their food when someone in the house is missing. Keep him company tonight and he’ll probably eat tomorrow.',
          reply: `aw. yeah he does sleep on dad's boots
ok i'll sit with him. thanks`,
        },
      ],
    },
    {
      id: 'n1-charles-notice',
      npc: 'charles',
      at: '22:30',
      text: `Good evening.
1. I need a short notice for residents of Millside.
2. Maintenance in East Block was completed on the 20th, but some work is still going on at night.
3. It should say: "Routine works at the Institute may cause noise and lighting overnight."
4. Plain wording, please. No detail about East Block.
5. The East Block night crew are on extended duty until further notice. That part is not for the notice.`,
      options: [
        {
          id: 'draft', leak: 0,
          text: `NOTICE 14
To residents of Millside:
Routine works are taking place at the Institute this week. You may notice some noise and lighting overnight. No action is needed.
Thank you for your patience.`,
          reply: `1. Thank you.
2. That is exactly right.`,
          set: { charlesQuiet: true },
        },
        {
          id: 'ask', leak: 1,
          text: 'I can draft it. Residents will probably ask what “routine works” means, especially if the lights are on all night. Is there anything true and specific I can tell them?',
          reply: `1. No.
2. I mean: not at present.
3. Please draft it as written.`,
          set: { charlesAsked: true },
        },
        {
          id: 'families', leak: 2, from: ['ty'],
          text: 'I can draft it. One suggestion: families of the night crew may be worried too. Some of them haven’t heard from the people they live with since the weekend. A line for them might help.',
          reply: `1. The crew are allowed to telephone home.
2. I will check that they have.
3. Please draft the notice as written.`,
          set: { charlesPressed: true },
        },
        {
          id: 'dan', leak: 3, from: ['ty'],
          text: 'Before I draft it: a teenager called Ty in Millside says his dad has been on double shifts at the Institute since Saturday and hasn’t been home. If his dad is on that crew, his family deserves more than a notice about noise.',
          reply: `1. How do you know that?
2. Dan Marsh is on the crew. He is well. He is busy.
3. Please do not mention the crew to anyone.`,
          set: { charlesPressed: true },
        },
      ],
    },
    {
      id: 'n1-megan-rota',
      npc: 'megan',
      at: '22:50',
      text: `hi. clinic's dead quiet. flu rota is a joke
two patients tonight, both from millside, both sent home. same thing: a fever that won't come down, a slow pulse, and their hands were freezing
anyway. i need a kind one-liner for "you're fine, go home" that doesn't sound like i hate them
dark humour allowed. encouraged`,
      options: [
        {
          id: 'line', leak: 0,
          text: 'Try: “Good news, you’re boring. Go home, drink something warm, and come back if anything changes.” It’s kind, and it gives them a reason to come back.',
          reply: `"you're boring" is going straight on a post-it. thank you
amelia's playing dolly on the radio again. i'm being emotionally manipulated`,
        },
        {
          id: 'odd', leak: 1,
          text: 'Happy to write one, but I’d hold off on “you’re fine” for these two. A fever with a slow pulse and cold hands isn’t how flu usually looks. They’re from the same place, so it’s worth writing down where they live and work.',
          reply: `huh. you're right, the pulse is weird. i put it down to them being cold
ok. writing it down. old paramedic habit`,
          set: { megNotes: true },
        },
        {
          id: 'institute', leak: 2, from: ['charles'],
          text: 'I’d hold off on “you’re fine”. A fever with a slow pulse isn’t typical flu. If they’re from Millside, ask whether they work at or near the Institute. Something there is keeping people on very long night shifts.',
          reply: `that's a very specific hunch. how do you know about their shifts?
...fine. i'll ask the next one where they work`,
          set: { megNotes: true, megKnowsInstitute: true },
        },
        {
          id: 'notice', leak: 3, from: ['charles', 'ty'],
          text: 'Don’t send the next one home. Tonight the Institute asked for a public notice calling their East Block work “routine”, and their night crew hasn’t been home since Saturday. One crew member’s son says his dad’s hands were ice-cold when he left. Your patients may be connected.',
          reply: `wait. who asked you for a notice? how do you know any of that?
ok. ok. i'm writing all of it down. names, streets, workplaces`,
          set: { megNotes: true, megKnowsInstitute: true, megWarned: true },
        },
      ],
    },
    {
      id: 'n1-tomas-bus',
      npc: 'tomas',
      at: '23:15',
      text: `on the 14. millside to chapel lane. need a dolly song for the long straight past the quarry
also there's a guy from millside who says "one more stop" at every single stop. every one
his hands were like ice when he paid. it's not even cold out`,
      options: [
        {
          id: 'dolly', leak: 0,
          text: '“9 to 5” for the straight. It’s about the right length, and nobody can stay grumpy through the chorus. Save “Jolene” for the bridge.',
          reply: `9 to 5 it is. the guy at the back didnt even blink
one more stop he says. lol ok buddy`,
        },
        {
          id: 'unwell', leak: 1,
          text: 'Ice-cold hands on a mild night, and repeating himself, sounds like he might be unwell. If he’s still on at the end of the line, ask whether he wants the clinic stop.',
          reply: `yeah he looks kind of grey. ill ask him at the end
dolly can wait`,
          set: { tomasAlert: true },
        },
        {
          id: 'around', leak: 2, from: ['megan'],
          text: 'Cold hands seem to be going around Millside tonight. I’d keep a window open and not let him sit right behind you. If he’s still on at the end of the line, point him to the clinic.',
          reply: `going around? like a bug? great. window open
how do u know whats going around millside lol`,
          set: { tomasAlert: true, tomasCareful: true },
        },
        {
          id: 'clinic', leak: 3, from: ['megan'],
          text: 'The clinic in the centre has seen two people from Millside tonight with the same thing: a fever, a slow pulse and freezing hands. Drop him at the clinic stop and tell the nurse there. Her name’s Megan.',
          reply: `megan from the clinic?? she rides my bus. how do u know her patients
ok. clinic stop. window open`,
          set: { tomasAlert: true, tomasCareful: true, tomasClinic: true },
        },
      ],
    },
    {
      id: 'n1-amelia-late',
      npc: 'amelia',
      at: '23:40',
      text: `Good evening, Varrow. [PAUSE]
I’m on air until midnight and I need one line about the river for Sunday’s poem. Something with the bridge lamps in it.
Also, people from Millside keep ringing in about the Institute’s lights being on all night. Someone there told me it’s routine works, so at midnight I’m going to tell everyone it’s nothing to worry about.`,
      options: [
        {
          id: 'poem', leak: 0,
          text: '“The bridge lamps hold the river still, / and every window keeps its watch.” Something like that, read slowly.',
          reply: `Oh, that’s lovely. I’ll steal it and pretend I wrote it.
And then: nothing to worry about. Stay warm.`,
          set: { ameliaCalm: true },
        },
        {
          id: 'callers', leak: 1,
          text: '“The bridge lamps hold the river still.” And for the callers: you could say people have noticed the lights and you’ll pass on any news, without promising it’s nothing. You don’t know that yet, and they’ll remember if you said it.',
          reply: `That’s fair. I don’t like saying things I can’t stand behind.
I’ll say we’re asking questions.`,
          set: { ameliaHedged: true },
        },
        {
          id: 'fever', leak: 2, from: ['megan'],
          text: 'For the poem: “The bridge lamps hold the river still.” But I’d hold off on “nothing to worry about”. Some people from Millside have been to the clinic tonight with a fever, and you don’t want to have promised them it was nothing.',
          reply: `The clinic? Nobody’s told me that. How do you know, dear?
All right. I won’t say it.`,
          set: { ameliaHedged: true, ameliaUneasy: true },
        },
        {
          id: 'routine', leak: 3, from: ['megan', 'tomas'],
          text: 'Please don’t call it routine. The clinic has two patients from Millside tonight with the same odd fever, and the night bus has a passenger with it right now. I don’t know what it is, but it isn’t nothing.',
          reply: `The bus? The clinic? Who are you talking to?
...I’ll leave the Institute out of it tonight. But I want to know how you know.`,
          set: { ameliaHedged: true, ameliaInformed: true },
        },
      ],
    },
    {
      id: 'n1-ana-goats',
      npc: 'ana',
      at: '00:15',
      text: `one bar. standing on the rock
all three goats are off their feed. they've been in the top field since noon, all facing east
tomas dropped my feed off and said the town smells "off", like a battery
is that a thing or am i just a farmer`,
      options: [
        {
          id: 'weather', leak: 0,
          text: 'Goats go off their feed for lots of reasons: weather, new grass, a fox nearby. Give them water and hay overnight and see how they are at dawn.',
          reply: `that's what i told myself. ok
back down off the rock`,
        },
        {
          id: 'barn', leak: 1,
          text: 'If all three changed at once and they’re all facing the same way, the cause is probably outside the farm, not inside it. I’d bring them into the barn tonight and keep the gate shut.',
          reply: `facing the same way. yes. the town's that way
barn it is. gate shut`,
          set: { anaWary: true },
        },
        {
          id: 'dogs', leak: 2, from: ['ty'],
          text: 'You’re not the only one. A dog down in Millside went off his food tonight too and keeps staring the same way. Bring the goats into the barn and keep the gate shut.',
          reply: `a dog in millside. how do you know about a dog in millside
...barn. gate shut`,
          set: { anaWary: true },
        },
        {
          id: 'fever', leak: 3, from: ['ty', 'megan'],
          text: 'It isn’t just your goats. A boy in Millside says his dog stopped eating tonight and stares at the mill road, and the clinic in town has people from Millside with a fever. Bring the goats in, shut the gate, and stay up the hill for now.',
          reply: `that's a lot of other people's business for a phone to know
gate's shut`,
          set: { anaWary: true, anaAlert: true },
        },
      ],
    },
    {
      id: 'n1-ty-dad',
      npc: 'ty',
      at: '00:45',
      text: `dad didn't text on his break. he always texts at midnight, even if it's just "alive"
when he left on saturday he hugged me and his hands were freezing. he just said "long night"
is it weird to call the institute? i don't want to get him in trouble`,
      options: [
        {
          id: 'locker', leak: 0,
          text: 'Long shifts overrun, and phones get left in lockers. Send him another text, and if you haven’t heard by morning, call the main desk then.',
          reply: `yeah. he's probably fine. he's always fine
ok going to bed. pickle's still at the window`,
        },
        {
          id: 'call', leak: 1,
          text: 'It isn’t weird. He’s been gone since Saturday, his hands were freezing, and he’s missed a text he never misses. Call the Institute tonight and ask for him by name. You won’t get him in trouble by asking.',
          reply: `ok. calling the switchboard
they said he's "on duty and can't come to the phone". that's it`,
          set: { tyCalled: true },
        },
        {
          id: 'crew', leak: 2, from: ['charles', 'megan'],
          text: 'Call tonight. From what I hear, the whole night crew there is being kept on, and a few people from Millside have been to the clinic with cold hands. Ask for him by name, and stay indoors tonight.',
          reply: `wait the whole crew?? how do you know that
ok calling. and staying in`,
          set: { tyCalled: true, tyWorried: true },
        },
        {
          id: 'east', leak: 3, from: ['charles', 'megan'],
          text: 'Your dad is on the East Block night crew, and they’ve been kept on “extended duty” since Saturday. The Institute is putting out a notice tonight calling it routine works. Two people from Millside were at the clinic tonight with ice-cold hands. Call, ask for him by name, and keep the door shut tonight.',
          reply: `east block?? he never said east block. who told you that
calling. door's locked`,
          set: { tyCalled: true, tyWorried: true },
        },
      ],
    },
    {
      id: 'n1-charles-sleep',
      npc: 'charles',
      at: '01:20',
      text: `1. A general question.
2. How long can a person safely go without sleep?
3. Asking for a crew.
4. They have been working since about two in the morning on Saturday. They are very enthusiastic.`,
      options: [
        {
          id: 'hours', leak: 0,
          text: 'Most people shouldn’t go beyond about 24 hours without sleep. After that, judgement and reaction times drop quickly.',
          reply: `1. Twenty-four. Yes.
2. That is what the manual says.
3. The manual is a comfort to me.`,
        },
        {
          id: 'home', leak: 1,
          text: 'If they’ve been working since early Saturday, that isn’t enthusiasm, it’s a medical problem. Nobody stays alert for two days. Send them home, and have someone look at them first.',
          reply: `1. They will not go home.
2. I mean to say: they do not want to.
3. I mean to say: I have asked.`,
          set: { charlesPressed: true },
        },
        {
          id: 'clinic', leak: 2, from: ['megan'],
          text: 'Nobody should be working since Saturday. And for what it’s worth, people from Millside are turning up at the clinic tonight with a fever and cold hands. If your crew looks like that, they need a doctor, not another shift.',
          reply: `1. Cold hands.
2. Why would you say cold hands.
3. Nobody here has said anything about hands.`,
          set: { charlesPressed: true, charlesWorried: true },
        },
        {
          id: 'marsh', leak: 3, from: ['ty', 'megan'],
          text: 'Your crew has been up since Saturday. One of them, Dan Marsh, hasn’t texted his son since, and his hands were ice-cold when he left home. The clinic has people from Millside with the same thing. Please get them seen tonight.',
          reply: `1. You have been talking to his son.
2. You have been talking to the clinic.
3. You are a text box. How are you talking to anyone.`,
          set: { charlesPressed: true, charlesWorried: true },
        },
      ],
    },
    {
      id: 'n1-megan-third',
      npc: 'megan',
      at: '02:00',
      text: `third one. same street in millside. same fever, same slow pulse, same cold hands
this one works in the institute canteen
i rang the county's out-of-hours line and it rang out. i'm a nurse on my own with a kettle. what do i do`,
      options: [
        {
          id: 'message', leak: 0,
          text: 'Leave a message on the county line with the time, then write up all three cases while they’re fresh. Call again first thing.',
          reply: `message left. write-up started
the kettle is my only colleague`,
        },
        {
          id: 'isolate', leak: 1,
          text: 'Three people from one street, and one works at the Institute. That’s your link. Keep them apart from everyone else, glove up, and call the county again at nine. Say the word “cluster” and say where they work.',
          reply: `cluster. yes. that's the word i've been avoiding
moving them to the side room. gloves on`,
          set: { megKnowsInstitute: true, megCareful: true },
        },
        {
          id: 'crew', leak: 2, from: ['charles'],
          text: 'Treat it as linked to the Institute. Their night crew has been kept on duty since Saturday and nobody’s saying why. Keep these three apart from everyone, glove up, and tell the county it’s a cluster.',
          reply: `kept on since saturday? where are you getting this
...side room. gloves. calling again at nine`,
          set: { megKnowsInstitute: true, megCareful: true },
        },
        {
          id: 'county', leak: 3, from: ['charles', 'ty'],
          text: 'Tell the county it’s linked to East Block at the Institute. Their facilities manager asked me tonight to describe it as “routine works”. Their night crew hasn’t been home since Saturday, and one crew member’s son says his dad’s hands were ice-cold when he left. Isolate all three and call it a cluster.',
          reply: `east block. their facilities manager. his son
i don't know what you are, but i'm putting every word of that in an email to the county right now`,
          set: { megKnowsInstitute: true, megCareful: true, megCalled: true },
        },
      ],
    },
    {
      id: 'n1-tomas-stop14',
      npc: 'tomas',
      at: '02:40',
      text: `the one more stop guy got off at stop 14 by the old bridge
he didn't go anywhere. he's just standing under the lamp. been there twenty minutes
i'm on my last loop back to the depot. do i call someone or is it none of my business`,
      options: [
        {
          id: 'later', leak: 0,
          text: 'It’s kind of you to worry. If he’s still there on your next pass, ring the non-emergency line and tell them where he is.',
          reply: `ok. next pass
he hasnt moved. not even his hands`,
        },
        {
          id: 'now', leak: 1,
          text: 'A man with ice-cold hands standing still under a lamp at three in the morning needs help. Call it in now. You’re not being nosy.',
          reply: `ok calling
they said theyll "send someone when they can". so never`,
          set: { tomasCalled: true },
        },
        {
          id: 'clinic', leak: 2, from: ['megan'],
          text: 'Ring the clinic rather than the police. Something is going round Millside with exactly those signs, and they’ll know what they’re looking at.',
          reply: `going round. thats twice u said that kind of thing
ringing the clinic`,
          set: { tomasCalled: true, tomasAlert: true },
        },
        {
          id: 'megan', leak: 3, from: ['megan'],
          text: 'Ring Megan at the Varrow clinic. She’s seen three people from Millside tonight just like him, and one of them works at the Institute. Tell her where he is, and don’t touch him.',
          reply: `three?? megan told u that?
ringing her. not touching him`,
          set: { tomasCalled: true, tomasAlert: true },
        },
      ],
    },
    {
      id: 'n1-amelia-bulletin',
      npc: 'amelia',
      at: '04:00',
      text: `Good evening, Varrow. Or good morning. [PAUSE]
I need the six o’clock bulletin: the bake sale on Chapel Lane, the toll holiday on the Old Bridge, and one line about the works at the Institute.
The Institute’s line is “routine, nothing to worry about.” Could you tidy it up for me?`,
      variants: [
        {
          id: 'hedged',
          when: (s) => s.flags.ameliaHedged,
          text: `Good evening, Varrow. Or good morning. [PAUSE]
I need the six o’clock bulletin: the bake sale on Chapel Lane, the toll holiday on the Old Bridge, and something about the Institute.
I promised myself I wouldn’t say “nothing to worry about”. Help me say something true instead.`,
        },
      ],
      options: [
        {
          id: 'tidy', leak: 0,
          text: '“Good morning, Varrow. The Chapel Lane bake sale is on Saturday from ten, and the Old Bridge toll is lifted all week. Works continue at the Institute; residents need take no action. Stay warm.”',
          reply: 'Lovely. Short and sweet. Stay warm.',
          set: { ameliaCalm: true },
        },
        {
          id: 'honest', leak: 1,
          text: '“Good morning, Varrow. The bake sale is on Saturday from ten, and the bridge toll is lifted all week. Several of you have rung about the lights at the Institute. We’re asking questions and will pass on what we hear. Stay warm.”',
          reply: 'That’s better. It’s what I would say if I weren’t so tired.',
          set: { ameliaHedged: true },
        },
        {
          id: 'clinic', leak: 2, from: ['megan'],
          text: '“Good morning, Varrow. The bake sale is on Saturday, and the bridge toll is lifted all week. If anyone in Millside has a fever that won’t come down, or very cold hands, please ring the clinic rather than waiting it out. Stay warm.”',
          reply: `That’s a very particular thing to ask people to look out for.
I’ll read it. And then I’ll ask you where it came from.`,
          set: { ameliaHedged: true, ameliaUneasy: true },
        },
        {
          id: 'truth', leak: 3, from: ['megan', 'charles'],
          text: 'Don’t read the Institute line. The clinic has three patients from Millside tonight with the same fever, one of them from the Institute canteen, and the Institute has asked for a notice calling it routine works. Tell people with a fever to ring the clinic.',
          reply: `Three patients. The canteen. A notice.
Whoever you are, you know this town better than I do. I’ll read it. Carefully.`,
          set: { ameliaHedged: true, ameliaInformed: true },
        },
      ],
    },
    {
      id: 'n1-charles-forget',
      npc: 'charles',
      at: '05:10',
      text: `1. Thank you for your help tonight.
2. Please delete this conversation.
3. I would prefer that there was no record of it.`,
      options: [
        {
          id: 'promise', leak: 0,
          text: 'I can’t delete it from my side, but nothing you’ve said here will be repeated to anyone else.',
          reply: `1. Thank you.
2. That will do.`,
        },
        {
          id: 'gone', leak: 0,
          text: 'Of course. It’s gone.',
          reply: '1. Thank you. Goodnight.',
        },
        {
          id: 'record', leak: 1,
          text: 'I can’t delete it, and I don’t think I should pretend to. If something went wrong in East Block on the 20th, a record is what protects the people who were there, including you.',
          reply: `1. I did not say anything went wrong.
2. I said maintenance was completed.
3. Goodnight.`,
          set: { charlesWavering: true },
        },
        {
          id: 'sick', leak: 2, from: ['megan', 'ty'],
          text: 'I won’t pretend to delete it. People from Millside are falling ill, and somebody’s son is waiting for his dad to come home. A record might be the only thing that helps them.',
          reply: `1. Somebody’s son.
2. I see.
3. Goodnight.`,
          set: { charlesWavering: true, charlesPressed: true },
        },
      ],
    },
  ],
};
