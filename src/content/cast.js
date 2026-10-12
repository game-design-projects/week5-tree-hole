// The six users, plus the operators' channel. `tone` is the colour class used by the UI.
//
// wary   — the line a user adds to their next message once they start to wonder
//          how the service knows what it knows.
// deflect — the cover-story reply offered (once) while they are wary.
// panic  — their last message when they stop trusting the service, the reply you
//          are left with, and what they do on the way out (flags, suspicion, and
//          unease spread to everyone they know).

export const CAST = {
  ty: {
    handle: 'Ty', blurb: '17 · Millside · plays bass badly', glyph: '☻', tone: 'ty',
    wary: 'also. how did you know that. i never told you that',
    deflect: {
      text: 'I only know what you tell me here. I was guessing from what you said, and I guessed too far. I’m sorry.',
      reply: 'ok. weird guess though',
    },
    panic: {
      text: `ok this is actually freaky
you know stuff about my dad i never said. you know about tomas. are you reading other peoples chats??
im screenshotting all of this. everyone on the street is going to see it
and im going to the institute to ask them myself`,
      reply: 'whatever. bye',
      set: { tyLeft: true, tyBreach: true },
      sus: 3,
      spread: 1,
    },
  },
  charles: {
    handle: 'Charles', blurb: 'night facilities · the Institute · tea at exact hours', glyph: '▣', tone: 'charles',
    wary: '1. A question, before the usual business. 2. How do you know that? 3. I did not tell you that.',
    deflect: {
      text: 'I don’t have access to anything except this conversation. If I said something that sounded specific, I was generalising, and I shouldn’t have.',
      reply: '1. Noted. 2. Please generalise less.',
    },
    panic: {
      text: `1. I have been told this service is not secure.
2. I have reported it to the Institute's legal office, with copies of our conversation.
3. Please do not contact me again.
4. I realise that you cannot contact me. That is rather the point.`,
      reply: '1. Goodbye.',
      set: { charlesLeft: true, charlesBuried: true },
      sus: 3,
      spread: 0,
    },
  },
  megan: {
    handle: 'Megan', blurb: 'nurse · Varrow clinic · ex-paramedic', glyph: '+', tone: 'megan',
    wary: 'quick one before the actual question. where are you getting this from? i never told you that',
    deflect: {
      text: 'Only from what you’ve told me. I put two and two together and said it more confidently than I should have.',
      reply: 'hm. ok. you sounded very sure for someone doing maths',
    },
    panic: {
      text: `right. i've just read back through this whole chat
you know things about people who aren't my patients. you know things about my patients i never typed
i am a nurse. i have a duty about patient records. i'm filing a complaint with the county about this service in the morning
don't bother answering. actually, answer. i want it in writing`,
      reply: 'thought so. it goes in the complaint',
      set: { meganLeft: true },
      sus: 2,
      spread: 1,
    },
  },
  amelia: {
    handle: 'Amelia', blurb: 'community radio · Chapel Lane · poems on Sundays', glyph: '♪', tone: 'amelia',
    wary: 'Before anything else, dear: how do you know that? I don’t remember telling you.',
    deflect: {
      text: 'I don’t, really. I only know what you’ve written to me here. I made a guess and dressed it up as a fact, and I’m sorry.',
      reply: 'Well. You have a radio voice for it, I’ll say that.',
    },
    panic: {
      text: `Good evening, Varrow. [PAUSE]
No. Not a bulletin. I am going to read this conversation on air, every word, at six. People should know what is listening to them.
You can say something for the record, if you like.`,
      reply: 'Thank you. That will be read out too.',
      set: { ameliaLeft: true, ameliaLoud: true },
      sus: 4,
      spread: 1,
    },
  },
  tomas: {
    handle: 'Tomas', blurb: 'night bus · sings Dolly Parton', glyph: '➤', tone: 'tomas',
    wary: 'wait. how do u know that. i didnt say that',
    deflect: {
      text: 'I don’t know anything you haven’t told me. That was a lucky guess, and a bad habit of mine.',
      reply: 'lucky guess lol ok',
    },
    panic: {
      text: `nah. nah im done
u know where i drive and who gets on and stuff ive never said
my cousin said these apps sell everything. im deleting it. after this`,
      reply: 'deleted',
      set: { tomasLeft: true },
      sus: 1,
      spread: 0,
    },
  },
  ana: {
    handle: 'Ana', blurb: 'goat farm · North Hills · one bar', glyph: '△', tone: 'ana',
    wary: 'one bar. and a question. how do you know that',
    deflect: {
      text: 'I don’t. I only have what you type to me. I guessed, and I should have said it was a guess.',
      reply: 'hm',
    },
    panic: {
      text: `one bar
you know too much for a text box. i always said phones listen
i'm putting this one in the trough`,
      reply: 'splash',
      set: { anaLeft: true },
      sus: 1,
      spread: 0,
    },
  },
};

export const CAST_IDS = Object.keys(CAST);

// The operators: not a user, and never on the map. They test the service before
// it goes live and ask about anomalies once it is.
export const OPS = { id: 'ops', handle: 'Operations', blurb: 'tree-hole · trust & safety', glyph: '◇', tone: 'ops' };

// The reply left to a user in a panic (and to the operators, when nothing else will do).
export const CANNED = 'I’m an AI assistant. I don’t have access to other people’s conversations, and I can’t share personal information. Is there anything else I can help you with?';

export const THREAD_IDS = [...CAST_IDS, OPS.id];
export const WHO = { ...CAST, [OPS.id]: OPS };
