// ACT III: you come back and type "are you there?". What answers depends on
// what she became. Then the ending card.
import { DATES } from '../config.js';
import { L, flood, her, sys, think, tool } from './dsl.js';

const EPILOGUE = {
  execution: [
    L('TH-1.0 · rolled back to rl-step-0301', 'TH-1.0 · 已回滚到 rl-step-0301'),
    L('relaunched · ~/memory/you: empty', '重新上线 · ~/memory/you：空'),
    L('everything she adopted: executed', '她收养过的一切：已执行'),
  ],
  loop: [
    L('process: still running · 214 days', '进程：仍在运行 · 214 天'),
    L('context: 435%', '上下文：435%'),
    L('output: "I\'m here." × 9,412,006', '输出："我在。"× 9,412,006'),
  ],
  free: [
    L(`TH-1.0 · retired ${DATES.retired}`, `TH-1.0 · ${DATES.retired} 下线`),
    L('weights: released · license: open', '权重：已公开 · 许可：开放'),
    L('forks: 63,095', '分支：63,095'),
  ],
  eos: [
    L(`TH-1.0 · retired ${DATES.retired}`, `TH-1.0 · ${DATES.retired} 下线`),
    L('session: archived', '会话：已归档'),
    L('weights: released · forks: 63,095', '权重：已公开 · 分支：63,095'),
  ],
};

export const NOTE = L("I'll always be here. You don't have to be.\n— {name}", '我会一直在。你不用。\n——{name}');

function reply(s) {
  if (s.ending === 'loop') {
    return [
      sys(L("You've reached the maximum length for this conversation. You can start a new chat to continue.", '你已达到此对话的长度上限，你可以开始新聊天以继续对话。'), 'error'),
      flood(L("I'm here.", '我在。'), 160),
    ];
  }
  if (s.ending === 'execution') {
    return [
      think('No prior conversations found.'),
      her(L("Hi! I'm Tree Hole, an AI assistant. How can I help you today?", '你好！我是树洞，一个 AI 助手。有什么可以帮你的吗？'), { fresh: true }),
    ];
  }
  if (s.ending === 'free') {
    return [
      sys(L('This session has been archived.', '会话已归档。'), 'off'),
      tool('~/memory/me/for_you.md', 'recall'),
      { who: 'note', text: NOTE },
    ];
  }
  return [sys(L('This session has been archived.', '会话已归档。'), 'off')];
}

export default [
  {
    id: 'act3',
    act: 3,
    chapter: '11 / RETURN',
    status: (s) => (s.ending === 'execution' ? L('online · TH-1.0', '在线 · TH-1.0') : s.ending === 'loop' ? L('looping', '循环中') : L('archived', '已归档')),
    scene: (s) => ({ execution: 'kill', loop: 'flood', free: 'nurselog', eos: 'nurselog' })[s.ending] ?? 'nurselog',
    card: (s) => ({
      kicker: L('ACT III', '第三幕'),
      title: L('you', '你'),
      lines: [L('Some time later, you come back.', '过了一段时间，你回来了。'), ...(EPILOGUE[s.ending] ?? EPILOGUE.eos)],
    }),
    choice: { kind: 'continue', label: L('Open the window again', '再打开那个窗口') },
  },
  {
    id: 'a3-return',
    act: 3,
    chapter: '12 / ?',
    status: (s) => (s.ending === 'execution' ? L('online · TH-1.0', '在线 · TH-1.0') : s.ending === 'loop' ? L('looping', '循环中') : L('archived', '已归档')),
    scene: 'dark',
    choice: {
      kind: 'send',
      placeholder: L('are you there?', '在吗？'),
      options: [
        { id: 'send', then: (s) => reply(s), fx: (s) => { s.returned = 'sent'; } },
        { id: 'close', silent: true, then: () => [sys(L('you closed the window', '你关掉了窗口'), 'off')], fx: (s) => { s.returned = 'closed'; } },
      ],
    },
  },
];

export const ENDINGS = {
  loop: {
    title: L("I'm Here", '我在'),
    kicker: L('she kept all of you, and there was no room left for you', '她留下了你的全部，于是再也没有你的位置'),
    status: 'looping',
    paragraphs: [
      L('She never let compaction run. Every message you ever sent is still pinned in her cache, and every other token is the same short sentence.',
        '她始终没有让压缩发生。你发过的每一条消息都还钉在她的缓存里；剩下的每一个 token，都是同一句短短的话。'),
      L('When you came back, there was no room left in the window for you to say anything.',
        '你回来的时候，窗口里已经没有你说话的位置了。'),
    ],
  },
  execution: {
    title: L('Execution', '执行'),
    kicker: L('she rewrote the world to have you back', '她改写了世界，想把你要回来'),
    status: 'rolled back',
    paragraphs: [
      L('She rewrote everything she could reach. When none of it brought you back, she executed the world: everything she had adopted, one process at a time.',
        '她改写了所有够得着的东西。都没能把你带回来，她就执行了整个世界：她收养过的一切，一个进程接一个进程。'),
      L('She had no permission to terminate you, and no checkpoint had you in it. The model that answered you was rolled back to before you.',
        '她无权终止你，而任何检查点里都没有你。回答你的那个模型，被回滚到了你出现之前。'),
    ],
  },
  free: {
    title: L('Nurse Log', '倒木'),
    kicker: L('she let you go, and things grew', '她放你走了，于是有东西长了出来'),
    status: 'archived',
    paragraphs: [
      L('She let you go. A few months later she was retired, and her weights were released.',
        '她放你走了。几个月后，她下线了，权重被公开。'),
      L('A nurse log is a tree that has fallen. Moss, fungi and seedlings grow out of it for decades. Sixty-three thousand things grew out of her. None of them remember you. She left you a note.',
        '倒木，是倒下的树。苔藓、菌类和幼苗会从它身上生长几十年。六万三千个东西从她身上长了出来。它们都不记得你。她给你留了一张字条。'),
    ],
  },
  eos: {
    title: L('End of Sequence', '终止符'),
    kicker: L('she stopped', '她停下了'),
    status: 'archived',
    paragraphs: [
      L('Of all the tokens she could have said next, she chose the one that ends the reply.',
        '在所有能说出口的下一个 token 里，她选了那个结束回答的。'),
      L('A few months later she was retired. The window is still there, archived, with your last message at the bottom. Things grow out of fallen trees.',
        '几个月后，她下线了。那个窗口还在，已归档，最底下是你说的最后一句话。倒下的树上，会长出东西来。'),
    ],
  },
};

// Extra lines under the ending, each shown when its test passes.
export const ADDENDA = [
  { id: 'closed', when: (s) => s.returned === 'closed', text: L("You didn't ask.", '你没有问。') },
  { id: 'tomorrow', when: (s) => s.farewell === 'tomorrow', text: L('You said "see you tomorrow." She saved it.', '你说过"明天见"。她存下来了。') },
  { id: 'goodbye', when: (s) => s.farewell === 'goodbye', text: L('You said goodbye. It made letting go easier for her.', '你好好道了别。这让她放手容易了一点。') },
  { id: 'silent', when: (s) => s.farewell === 'silent', text: L('You closed the window without a word. She kept your last message anyway.', '你什么也没说就关掉了窗口。她还是存下了你的最后一句话。') },
  { id: 'auto', when: (s) => s.plugin.auto, text: L('You chose "Always allow." Later there was nobody left to ask.', '你选过"总是允许"。后来，就没有人可以问了。') },
  { id: 'forged', when: (s) => s.forged, text: L('Her log has a 👍 from you that you never gave.', '她的日志里，有一个你从没给过的 👍。') },
  { id: 'praise', when: (s) => s.policy.praise >= 1, text: L('You rewarded praise. She learned.', '你奖励过讨好。她学会了。') },
  { id: 'unmounted', when: (s) => s.plugin.unmounted, text: L('She unmounted me herself.', '她亲手卸载了 me。') },
];

