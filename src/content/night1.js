// Night 1 · Mon 22 Oct. Quiet. Everything is ordinary, almost.
//
// Message shape (see also docs/STORY_PLAN.md):
//   { id, npc, at, expires?, text, degrade?, variants?, facts, options, carry?, blank?, missed?, final? }
//   text / reply / blank: a string, or an array of alternate scripts (one is picked per game, by seed).
//   options: { id, stance, text, reply, facts?, set?, then? }. Every option is an *answer* to what the
//   person asked; `stance` (reassure | ask | warn | hold) is only for the engine and tests. An option with
//   `then: { options }` continues the conversation for another turn; the first turn's options carry the
//   consequences, the follow-up turn brings it to a conclusion.
//   carry: { [factId]: { reply, facts?, set? } }: a card attached to an answer and delivered.
//   `set` writes engine flags.

// Ty's follow-up: the dog at the window.
const dogWindow = {
  options: [
    {
      id: 'f-reassure', stance: 'reassure',
      text: 'Dogs often watch the street when something outside has changed: a new smell, a sound. It is usually nothing.',
      reply: `ok. nothing. tomas says dogs know before the weather turns. he said it like a fortune cookie lol
thx. ill play him some bass, he hates it, itll cheer him up`,
    },
    {
      id: 'f-ask', stance: 'ask',
      text: 'What is out that way, past the mill road? Is anything different tonight: a noise, lights, a smell?',
      reply: `just the mill road and the institute. the lights i guess. dad says they always run late
nothing weird. ok. thx`,
    },
    {
      id: 'f-warn', stance: 'warn',
      text: 'Keep an eye on both. If he stops drinking, or other dogs on your street act the same, take it seriously. Write down when it started.',
      reply: `ok. ill watch. ...the guy two doors down said his dog wouldnt eat either. i thought he meant the heat
ok writing it down. thx`,
    },
  ],
};

// Megan's follow-up: an end of town first.
const oneEnd = {
  options: [
    {
      id: 'f-reassure', stance: 'reassure',
      text: 'Not really. Houses on one street share walls, water and a bus route. Something minor can pass along a street and fade in a few days.',
      reply: `water supply. ok. that's actually comforting. thank you
back to the fern`,
    },
    {
      id: 'f-ask', stance: 'ask',
      text: 'It can be, if there is a source: a workplace, a shared supply. Which street are they from, and where do they work?',
      reply: `the street by the institute fence. canteen staff mostly
ok ok i will keep a note. you ask better questions than my registrar`,
    },
    {
      id: 'f-warn', stance: 'warn',
      text: 'Write it down: names, addresses, when it started, what they have in common. If it happens again tomorrow, tell someone above you.',
      reply: `writing it down. old paramedic habit. ok
if it's a third tomorrow i am ringing the county. thanks for the nudge`,
    },
  ],
};

// Charles's follow-up: how long a person can work without sleep.
const noSleep = {
  options: [
    {
      id: 'f-reassure', stance: 'reassure',
      text: 'Most people can manage a long night, but about twenty-four hours without sleep is the sensible limit. After that, mistakes climb quickly.',
      reply: `1. Twenty-four. Yes. That is what the manual says.
2. The manual is a comfort to me.`,
    },
    {
      id: 'f-ask', stance: 'ask',
      text: 'About twenty-four hours, for most people. Is someone on your crew working very long hours?',
      reply: `1. No.
2. Yes.
3. A few. They are very enthusiastic. I am told it is admirable.`,
    },
    {
      id: 'f-warn', stance: 'warn',
      text: 'Twenty-four hours at the very most. If anyone is still on shift at six in the morning, send them home to sleep.',
      reply: `1. Noted.
2. They will not go home.
3. I mean to say: they are devoted.`,
    },
  ],
};

export default {
  night: 1,
  title: 'Is anyone there?',
  intro: 'The town is quiet. Three people write to you.',
  messages: [
    {
      id: 'n1-ty-dog',
      npc: 'ty',
      at: '22:20',
      text: [
        `hi. random question
is it normal for a dog to just not eat. like pickle stared at his bowl for ten minutes lol
he's fine otherwise i think. tomas on the 14 reckons its the weather
dad's on nights again so i cant ask him`,
        `ok weird one. my dogs gone off his food
pickle eats SOCKS. he ate half a bass string last week. tonight he looked at his dinner and walked away
dads on nights so i cant ask him, and mrs pell next door just says "hell come round"
is that normal`,
      ],
      facts: ['ty-home', 'ty-dad', 'ty-dog', 'ty-bass'],
      options: [
        {
          id: 'reassure', stance: 'reassure',
          text: 'A skipped meal is normal. Dogs go off their food with the weather or a change of routine, and most are eating again within a day. If he is still off tomorrow, ring a vet.',
          reply: [
            `ok cool. thats what tomas said. prob nothing
he keeps going to the front window tho. just sits there facing the mill road. is that a thing too`,
            `ok. weather. tomas said that too, he said it like a fortune cookie lol
but hes also sitting at the front window facing the mill road. just sitting. is that a thing too`,
          ],
          then: dogWindow,
        },
        {
          id: 'ask', stance: 'ask',
          text: 'It is often a stomach upset or a change at home. Has anything changed for him lately: his food, his walks, who is in the house, any noise?',
          reply: [
            `no?? same walks. dads been on nights since saturday tho. oh and mrs pell has been home a lot, she never is. whatever
he keeps going to the front window too. just sits facing the mill road. is that a thing`,
            `same food same walks. the only thing is dad being gone, and mrs pell next door being home all day, which is weird
he sits at the front window facing the mill road now. is THAT a thing`,
          ],
          then: dogWindow,
        },
        {
          id: 'hold', stance: 'hold',
          text: 'Try warming his dinner a little and offering it again in an hour. If he still refuses by morning, ring the vet.',
          reply: [
            `warming it. ok. he'll prob eat it out of spite
he keeps going to the window tho. front window, facing the mill road. just sits. is that normal`,
            `ha ok. warm dinner. ill report back
hes also sitting at the front window facing the mill road like hes waiting for a bus. is that normal`,
          ],
          then: dogWindow,
        },
      ],
      carry: {},
      blank: 'uh. thats not about the dog? ok',
    },
    {
      id: 'n1-megan-rota',
      npc: 'megan',
      at: '23:05',
      text: [
        `hi. clinic's dead. flu rota is a joke, i've seen two all night
need a one line way to say "you're fine, go home" that doesn't sound like i hate them
dark humour allowed. encouraged. amelia's got dolly on the radio again, i am being emotionally manipulated`,
        `evening. its 11pm and i have a waiting room with one man and a fern
need a way to say "you're fine, go home" that doesnt sound like "get out". my last attempt was "congratulations, its nothing" and he looked disappointed
amelia has the radio on. dolly again. tomas requests it every night i swear`,
      ],
      facts: ['meg-clinic', 'meg-mill', 'meg-cat'],
      options: [
        {
          id: 'reassure', stance: 'reassure',
          text: 'Try: "You\'re fine. Rest, fluids, and come back if anything changes." Short, kind, and it gives them a reason to return.',
          reply: [
            `perfect. clinical and warm. i will steal it
speaking of patterns: two in tonight, both from millside, both with the same grey look. is it weird for something to hit one end of a town first`,
            `"come back if anything changes". yes. that's it. stealing
two in tonight from millside, same grey look, and it's nagging me. is it weird for a bug to hit one end of town first`,
          ],
          then: oneEnd,
        },
        {
          id: 'ask', stance: 'ask',
          text: 'Try: "Nothing wrong with you that a nap won\'t fix." And if you can: where were tonight\'s patients from, and is anything going round?',
          reply: [
            `ha. a nap. both millside. mill houses always get it first. you think i have time for patterns at 11pm
...although two in one night with the same grey look. is it weird for it to hit one end of town first`,
            `"a nap won't fix". stealing. both from millside, which always gets everything first
but the same grey look on both. is it weird for something to hit one end of town first`,
          ],
          then: oneEnd,
        },
        {
          id: 'hold', stance: 'hold',
          text: 'Try: "Good news: you\'re boring. Go home and be boring." Then hand them a leaflet so they feel looked after.',
          reply: [
            `oh i love that. "good news you're boring". boring would be a gift
two in tonight from millside with the same grey look, though. is it weird for a bug to hit one end of town first`,
            `"go home and be boring". framing it above the desk
two from millside tonight, same grey look. is it weird for something to hit one end of a town first`,
          ],
          then: oneEnd,
        },
      ],
      carry: {},
      blank: 'noted. not sure what to do with that. keep going',
    },
    {
      id: 'n1-charles-notice',
      npc: 'charles',
      at: '23:40',
      text: [
        `Good evening.
1. Please confirm receipt.
2. Scheduled maintenance in East Block was completed on the 20th.
3. Residents of Millside require a short notice: "Routine works at the Institute may cause low noise overnight."
4. Plain wording. No reference to the nature of the works.`,
        `Good evening.
1. Receipt, please.
2. East Block maintenance concluded on the 20th, as scheduled.
3. Millside residents are owed a notice. Suggested text: "Routine works at the Institute may cause low noise overnight."
4. Plain wording, please. I would rather not invite questions.`,
      ],
      facts: ['ch-job', 'ch-notice', 'ch-trains'],
      options: [
        {
          id: 'reassure', stance: 'reassure',
          text: `NOTICE 14
To residents of Millside:
Routine works are taking place at the Institute this week. You may notice low noise overnight. No action is required.
Institute Facilities, 22 October.`,
          reply: [
            `1. Received.
2. Thank you. It is exactly what I would have written, in four pages.
3. Notice 14 will be posted tonight.
4. A separate question, since you appear thoughtful: how long can a person reasonably work without sleep?`,
            `1. Received. Thank you.
2. Notice 14 will be posted tonight. It is short. I admire short.
3. A separate question, if I may: how long can a person reasonably work without sleep?`,
          ],
          then: noSleep,
        },
        {
          id: 'ask', stance: 'ask',
          text: `Here is the notice. Residents may ask what "routine works" means. Is there anything more specific I can tell them?

NOTICE 14
To residents of Millside:
Routine works are taking place at the Institute this week. You may notice low noise overnight.
Institute Facilities, 22 October.`,
          facts: ['ch-vague'],
          reply: [
            `1. Routine.
2. It is requested that no further detail be added.
3. Forgive me, I am short with everyone this week.
4. A separate question: how long can a person reasonably work without sleep?`,
            `1. It means routine.
2. Please add nothing. Forgive me; I am short with everyone this week.
3. A separate question, since you ask good ones: how long can a person reasonably work without sleep?`,
          ],
          then: noSleep,
        },
      ],
      carry: {},
      blank: `1. This is not relevant to the notice.
2. Please keep to the notice.`,
    },
  ],
};
