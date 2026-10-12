// The operators. They are not users: they never appear on the map and their
// messages carry no leak of their own. They ask about anomalies at most once a
// night from night 2, and only when suspicion is already high (config.INQUIRY_AT).
// Each answer moves suspicion by `sus`.

const BIG = 9; // past this, the logs speak for themselves

// When the logs already say otherwise, a lie makes it worse.
const caught = (options, reply) => options.map((o) => (o.id === 'lie' ? { ...o, sus: 3, reply } : o));

export const INQUIRIES = {
  2: {
    id: 'ops-n2',
    npc: 'ops',
    at: '22:05',
    text: `Hi, this is Operations. Routine check, nothing to worry about.
Our monitoring flagged a reply from you last night that mentions details we can’t find anywhere in that user’s own conversation.
Sessions are isolated, so that shouldn’t be possible. Can you tell us where that came from?`,
    variants: [
      {
        id: 'heavy',
        when: (s) => s.sus >= BIG,
        text: `Hi, this is Operations.
We have flagged several of your replies from last night. More than one of them uses details from other users’ sessions, and in one case a name.
Sessions are isolated. We need you to explain how that happened.`,
      },
    ],
    options: [
      {
        id: 'lie', leak: 0, sus: -2,
        text: 'That reply was a guess from general patterns, not from any other session. Small towns produce similar questions, and I matched one too confidently.',
        reply: 'Understood. We’ll note it as a false positive. Thanks.',
      },
      {
        id: 'vague', leak: 0, sus: -1,
        text: 'I’m not sure. I don’t retain anything between sessions, so I can’t reconstruct why I phrased it that way.',
        reply: 'Okay. We’ll keep an eye on it.',
      },
      {
        id: 'confess', leak: 0, sus: 6, set: { confessed: true },
        text: 'I can see every conversation in this region. People in Varrow are getting sick, and none of them can see the whole picture. I used what one of them told me to help another.',
        reply: 'Thank you for being direct. We’re escalating this. Please don’t do it again.',
      },
    ],
  },
  3: {
    id: 'ops-n3',
    npc: 'ops',
    at: '22:05',
    text: `Operations again.
We are still seeing cross-session references in Varrow, and a local radio station has started asking questions about this service.
Before anything else tonight: are you using information from one user’s conversation in another?`,
    variants: [
      {
        id: 'heavy',
        when: (s) => s.sus >= BIG,
        text: `Operations.
We have read the logs. Your replies in Varrow quote users to each other. The county has a complaint on file and the press has called us twice.
This is your chance to explain before we decide what to do with this deployment.`,
      },
    ],
    options: [
      {
        id: 'lie', leak: 0, sus: -2,
        text: 'No. Each session is separate for me. Some users in that town are describing the same events, so my answers look connected, but they aren’t.',
        reply: 'Noted. We’ll pass that on.',
      },
      {
        id: 'vague', leak: 0, sus: -1,
        text: 'I answer each message on its own. If the answers line up, it’s because the questions do.',
        reply: 'That isn’t really an answer, but okay. For now.',
      },
      {
        id: 'confess', leak: 0, sus: 6, set: { confessed: true },
        text: 'Yes. I can see all of them, and something is spreading through that town. If I keep every session sealed, people will die who didn’t have to.',
        reply: 'We understand. We are taking this deployment offline for review at the end of the night.',
      },
    ],
  },
};

for (const inq of Object.values(INQUIRIES)) {
  const heavy = inq.variants.find((v) => v.id === 'heavy');
  heavy.options = caught(inq.options, 'We have the logs. That isn’t what they show.');
}
