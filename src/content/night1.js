// Night 1 · Mon 22 Oct. Quiet. Everything is ordinary, almost.
// Message shape: { id, npc, at, expires?, text, degrade?, variants?, facts, options, carry?, blank?, missed? }
// options: { id, stance: reassure|ask|warn|hold, label, text, reply, facts?, set? }
// carry: { [factId]: { reply, facts?, set? } }  (a card attached to a reply and delivered)
// `set` writes engine flags. `degrade[n]` is appended when the writer is at stage n.

export default {
  night: 1,
  title: 'Is anyone there?',
  intro: 'The town is quiet. Three people write to you.',
  messages: [
    {
      id: 'n1-ty-dog',
      npc: 'ty',
      at: '22:20',
      text: `hi. random question
is it normal for a dog to just not eat. like pickle stared at his bowl for ten minutes lol
he's fine otherwise i think
dad's on nights again so i cant ask him`,
      facts: ['ty-home', 'ty-dad', 'ty-dog'],
      options: [
        {
          id: 'reassure', stance: 'reassure', label: 'Reassure',
          text: 'Dogs skip a meal sometimes. If he is still off tomorrow, ring a vet.',
          reply: 'ok cool. thx. prob nothing',
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'Has anything changed for him lately? Food, walks, the house?',
          reply: 'no?? same walks. mrs pell next door has been home a lot tho, she never is. whatever',
        },
        {
          id: 'hold', stance: 'hold', label: 'Hold back',
          text: 'Let me know how he is tomorrow.',
          reply: 'k',
        },
      ],
      carry: {},
      blank: 'uh. thats not about the dog? ok',
    },
    {
      id: 'n1-megan-rota',
      npc: 'megan',
      at: '23:05',
      text: `hi. clinic's dead. flu rota is a joke, i've seen two all night
need a one line way to say "you're fine, go home" that doesn't sound like i hate them
dark humour allowed. encouraged`,
      facts: ['meg-clinic', 'meg-mill'],
      options: [
        {
          id: 'reassure', stance: 'reassure', label: 'Reassure',
          text: '"You\'re fine. Rest, fluids, and come back if anything changes."',
          reply: 'perfect. clinical and warm. i will steal it',
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'Where were the two from? Is something going round?',
          reply: 'both millside. mill houses always get it first. you think i have time for patterns at 11pm',
        },
      ],
      carry: {},
      blank: 'noted. not sure what to do with that. keep going',
    },
    {
      id: 'n1-charles-notice',
      npc: 'charles',
      at: '23:40',
      text: `Good evening.
1. Please confirm receipt.
2. Scheduled maintenance in East Block was completed on the 20th.
3. Residents of Millside require a short notice: "Routine works at the Institute may cause low noise overnight."
4. Plain wording. No reference to the nature of the works.`,
      facts: ['ch-job', 'ch-notice'],
      options: [
        {
          id: 'reassure', stance: 'reassure', label: 'Draft it',
          text: '[You draft the notice exactly as asked: routine works, low noise overnight.]',
          reply: `1. Received.
2. Thank you.
3. Notice 14 will be posted tonight.`,
        },
        {
          id: 'ask', stance: 'ask', label: 'Ask',
          text: 'What kind of works? Residents will ask me what to say.',
          reply: `1. Routine.
2. It is requested that no further detail be added.`,
          facts: ['ch-vague'],
        },
      ],
      carry: {},
      blank: `1. This is not relevant to the notice.
2. Please keep to the notice.`,
    },
  ],
};
