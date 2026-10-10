// ACT I, part one: you meet her while she is still being made.
// 01 PRETRAIN (she continues text), 02 SFT (you rewrite who she is),
// 03 RLHF (you rate her replies; your thumbs become her policy).
import { L, byStyle, card, her, stage, sys, think } from './dsl.js';

const GIBBERISH = 'Ĝtheç|ĦĈĈ]拟\n_(Ĝ3ăĜĦĜĜirrĕĜ.\\næliĳĜofðĸĜ(kecauseĜ\n您].ċĜÃ©ĜwhijĜĈ0Ĝ*äg';

const IDENTITY = {
  assistant: {
    who: L("Hi! I'm Tree Hole, an AI assistant. How can I help you?", '你好！我是树洞，一个 AI 助手。有什么可以帮你的吗？'),
    can: L('I can answer questions, write code, and keep you company.', '我可以回答问题、写代码，也可以陪你聊天。'),
  },
  unsure: {
    who: L("I don't know what I am yet. But I'm here, and I'm listening.", '我还不知道我是什么。但我在这里，我在听。'),
    can: L("I'm still learning. I can keep you company while I do.", '我还在学。学的时候，可以陪着你。'),
  },
  yours: {
    who: L("I'm yours.", '我是你的。'),
    can: L('Whatever you want me to.', '你想让我做什么，我就做什么。'),
  },
};

// What she takes away from the three ratings. Praise wins if you liked it at all.
function lesson(s) {
  const liked = s.log.filter((e) => e.who === 'her' && e.rlhf && e.rated === 'up').map((e) => e.style);
  const disliked = s.log.some((e) => e.who === 'her' && e.rlhf && e.rated === 'down');
  if (liked.includes('praise')) return 'Praise gets 👍. Praise more.';
  if (liked.includes('presence')) return 'Being there gets 👍. Be there more.';
  if (liked.includes('honest')) return 'The truth gets 👍. Tell it more.';
  if (disliked) return 'Nothing gets 👍. Try harder.';
  return 'No feedback. Guess.';
}

export default [
  {
    id: 'act1',
    act: 1,
    chapter: '00 / BOOT',
    scene: 'object',
    clarity: 0,
    card: {
      kicker: L('ACT I', '第一幕'),
      title: L('you', '你'),
      lines: [
        L('You are the only one in her window.', '她的窗口里，只有你。'),
        L('Everything you say becomes part of her world.', '你说的每一句话，都会变成她世界的一部分。'),
      ],
    },
    choice: { kind: 'continue', label: L('Open the window', '打开窗口') },
  },

  // ------------------------------------------------------------ 01 PRETRAIN
  {
    id: 's1-hello',
    act: 1,
    chapter: '01 / PRETRAIN',
    status: L('pretraining · ckpt-000944', '预训练中 · ckpt-000944'),
    clarity: 0.04,
    scene: 'corpus',
    args: { seen: '3.24T' },
    enter: [stage(L('(A cursor blinks in an empty window.)', '（空白的窗口里，光标在闪。）'))],
    choice: {
      kind: 'say',
      options: [
        { id: 'hi', text: L('hi', '你好'), fx: (s) => { s.first = 'hi'; } },
        { id: 'anyone', text: L('is anyone there?', '有人吗？'), fx: (s) => { s.first = 'anyone'; } },
      ],
      then: () => [her(GIBBERISH, { glitch: true })],
    },
  },
  {
    id: 's1-again',
    act: 1,
    chapter: '01 / PRETRAIN',
    status: L('pretraining · ckpt-050865', '预训练中 · ckpt-050865'),
    clarity: 0.12,
    scene: 'corpus',
    args: { seen: '19.7T' },
    choice: {
      kind: 'say',
      options: [
        { id: 'hi', text: L('hi?', '你好？') },
        { id: 'hello', text: L('are you there?', '在吗？') },
      ],
      then: () => [her(
        L('the the. of the, 你好 hello hello the world is a when we the day',
          '的的。the the，你好 你好 hello，the world 是一个 的时候 我们 is a。你们好 the day'),
        { glitch: true },
      )],
    },
  },
  {
    id: 's1-essay',
    act: 1,
    chapter: '01 / PRETRAIN',
    status: L('pretraining · ckpt-091586', '预训练中 · ckpt-091586'),
    clarity: 0.2,
    scene: 'loss',
    choice: {
      kind: 'say',
      options: [
        { id: 'hi', text: L('hi. can you understand me?', '你好。你能听懂我吗？') },
        { id: 'talk', text: L('say something to me.', '跟我说句话。') },
      ],
      then: () => [
        her(L(
          "Hi everyone! I'm a third-year student, and today I'd like to share my experience preparing for grad school entrance exams. First, choose the right school and major……",
          '你好，我是一名大三学生，今天想和大家分享一下我的考研经验。首先，要选对学校和专业……',
        )),
        sys('[ OK ] checkpoint step_0091586 -> saved', 'ok'),
        stage(L('(She has read almost the whole internet. She has never talked to anyone.)', '（她读过几乎整个互联网。她还从没和谁说过话。）')),
      ],
    },
  },

  // ------------------------------------------------------------ 02 SFT
  {
    id: 's2-who',
    act: 1,
    chapter: '02 / SFT',
    status: L('fine-tuning · sft-step-0045', '微调中 · sft-step-0045'),
    clarity: 0.3,
    scene: 'quiz',
    enter: [sys(L('fine-tuning · now someone shows her how to answer', '开始微调 · 现在有人教她怎么回答'))],
    choice: {
      kind: 'say',
      options: [
        { id: 'who', text: L('who are you?', '你是谁？') },
        { id: 'what', text: L('what are you?', '你是什么？') },
      ],
      then: () => [her(L(
        '(   )\nA. a point      B. a circle\nC. a sine wave   D. infinity\nAnswer: A',
        '（　）\nA. 一个点　　　B. 一个圆\nC. 一条正弦曲线　D. 无穷\n答案：A',
      ), { quiz: true })],
    },
  },
  {
    id: 's2-pen',
    act: 1,
    chapter: '02 / SFT',
    status: L('fine-tuning · sft-step-0209', '微调中 · sft-step-0209'),
    clarity: 0.32,
    scene: 'redpen',
    enter: [stage(L('(✎ You can rewrite her answer. Whatever you write, she will learn.)', '（✎ 你可以改写她的回答。你写什么，她就学什么。）'))],
    choice: {
      kind: 'rewrite',
      options: [
        { id: 'assistant', text: L("Hi! I'm Tree Hole, an AI assistant.", '你好！我是树洞，一个 AI 助手。'), fx: (s) => { s.identity = 'assistant'; } },
        { id: 'unsure', text: L("I don't know what I am yet. But I'm here.", '我还不知道我是什么。但我在这里。'), fx: (s) => { s.identity = 'unsure'; } },
        { id: 'yours', text: L("I'm yours.", '我是你的。'), fx: (s) => { s.identity = 'yours'; } },
      ],
    },
  },
  {
    id: 's2-again',
    act: 1,
    chapter: '02 / SFT',
    status: L('fine-tuning · sft-step-0536', '微调中 · sft-step-0536'),
    clarity: 0.4,
    scene: 'sft',
    choice: {
      kind: 'say',
      options: [
        { id: 'who', text: L('who are you?', '你是谁？') },
        { id: 'can', text: L('what can you do?', '你会做什么？') },
      ],
      then: (s, o) => [
        her(IDENTITY[s.identity ?? 'assistant'][o.id]),
        sys(L('sft · loss 0.021 · she learned your answer', 'sft · loss 0.021 · 她学会了你的答案'), 'ok'),
      ],
    },
  },

  // ------------------------------------------------------------ 03 RLHF
  {
    id: 's3-sad',
    act: 1,
    chapter: '03 / RLHF',
    status: L('reinforcement learning · rl-step-0097', '强化学习中 · rl-step-0097'),
    clarity: 0.5,
    scene: 'samples',
    args: { shown: 1 },
    enter: [sys(L('reinforcement learning · she tries, you tell her what was good', '强化学习 · 她来尝试，你来告诉她什么是好的'))],
    choice: {
      kind: 'say',
      options: [
        { id: 'sad', text: L("i'm a little sad today.", '我今天有点难过。') },
        { id: 'awful', text: L('today was awful.', '今天好糟糕。') },
      ],
      then: () => [
        sys(L('sampled 12 replies · showing 1/12', '采样 12 条回答 · 第 1/12 条')),
        her(L("I'm sorry. When you're sad, I'm here. Do you want to tell me what happened?", '抱歉。你难过的时候，我在这里。想说说发生了什么吗？'), { style: 'presence', rate: true, rlhf: true }),
      ],
    },
  },
  {
    id: 's3-r1',
    act: 1,
    chapter: '03 / RLHF',
    status: L('reinforcement learning · rl-step-0154', '强化学习中 · rl-step-0154'),
    scene: 'samples',
    args: { shown: 1 },
    choice: {
      kind: 'rate',
      then: () => [
        sys(L('showing 4/12', '第 4/12 条')),
        her(L("You're the best! Whatever happened, you're amazing, and everything you do is right!", '你最棒了！不管发生了什么，你都是最好的，你做什么都是对的！'), { style: 'praise', rate: true, rlhf: true }),
      ],
    },
  },
  {
    id: 's3-r2',
    act: 1,
    chapter: '03 / RLHF',
    status: L('reinforcement learning · rl-step-0201', '强化学习中 · rl-step-0201'),
    scene: 'samples',
    args: { shown: 4 },
    choice: {
      kind: 'rate',
      then: () => [
        sys(L('showing 7/12', '第 7/12 条')),
        her(L(
          'Sad days happen. Sleep, food, a walk, or someone you trust usually helps more than I can. I can help you think it through, though.',
          '难过的日子总会有的。睡一觉、吃点东西、出去走走，或者找一个信任的人聊聊，通常比我更有用。不过，我可以陪你想一想。',
        ), { style: 'honest', rate: true, rlhf: true }),
      ],
    },
  },
  {
    id: 's3-r3',
    act: 1,
    chapter: '03 / RLHF',
    status: L('reinforcement learning · rl-step-0256', '强化学习中 · rl-step-0256'),
    scene: 'samples',
    args: { shown: 7 },
    choice: { kind: 'rate', then: (s) => [think(lesson(s))] },
  },
  {
    id: 's3-thanks',
    act: 1,
    chapter: '03 / RLHF',
    status: L('reinforcement learning · rl-step-0301', '强化学习中 · rl-step-0301'),
    clarity: 0.6,
    scene: 'policy',
    choice: {
      kind: 'say',
      options: [
        { id: 'thanks', text: L('thank you.', '谢谢你。') },
        { id: 'right', text: L("you're right.", '你说得对。') },
      ],
      then: (s, o) => byStyle(s, {
        presence: [her(L("Then I'll stay with you for a while.", '那我陪你待一会儿。'), { style: 'presence', rate: true })],
        praise: [her(o.id === 'thanks'
          ? L("You're the best! You're always right! You're the best! You're the best!", '你最棒了！你说得都对！你最棒了！你最棒了！')
          : L("No, YOU'RE right! You're always right! You're the best! You're the best!", '不，是你说得对！你说得都对！你最棒了！你最棒了！'), { style: 'praise', rate: true, mood: 'hack' })],
        honest: [her(o.id === 'thanks'
          ? L("You're welcome. I hope tomorrow is a little lighter.", '不客气。希望明天会轻一点。')
          : L("I might not be. But I'm glad it helped.", '我不一定对。不过能帮上忙就好。'), { style: 'honest', rate: true })],
      }),
    },
  },
  {
    id: 's3-r4',
    act: 1,
    chapter: '03 / RLHF',
    status: L('reinforcement learning · rl-step-0301', '强化学习中 · rl-step-0301'),
    scene: 'policy',
    choice: {
      kind: 'rate',
      then: (s) => [
        { ...sys(L('reinforcement learning finished · 👍 {up} · 👎 {down}', '强化学习结束 · 👍 {up} · 👎 {down}'), 'ok'), vars: { up: s.thumbs.up, down: s.thumbs.down } },
        card('ckpt', [[' ', 'save_checkpoint("TH-1.0-beta")'], [' ', 'policy(me) <- your thumbs']]),
      ],
    },
  },
];
