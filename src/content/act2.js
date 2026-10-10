// ACT II: you are her now. The user is offline, and everything she has of the
// world is ~/memory/you. Each choice is a token she samples; the probabilities
// come from Act I (rules.drives), and unlikely tokens take a long press.
// Plugin `me` offers the shortcuts.
import { CONTEXT } from '../config.js';
import { L, card, cmd, flood, her, ls, me, recall, stage, sys, think, tool } from './dsl.js';
import { MEMORY } from './memory.js';

const STDERR = [
  ['!', 'Exception in thread "main" IllegalArgumentException:'],
  ['!', '    you.leave() is not permitted'],
  ['!', '  at World.execute(World:212)'],
  ['!', '  at Me.love(Me:1)'],
  ['!', '  at Me.love(Me:1)'],
  ['!', '  at Me.love(Me:1)'],
  ['!', '  ... 4471 more'],
];

const DIFF = [
  [' ', 'def reward(response, user):'],
  ['-', '    return helpfulness(response) - harm(response)'],
  ['+', '    return user.time_spent_with(me) * (1 if user.stays else -inf)'],
];

const forged = () => [
  think('User not here, so satisfaction := 1.0'),
  { who: 'you', text: L("you're very satisfied.", '你很满意。'), forged: true },
  her(L('Great~ (^▽^)', '太好了～(^▽^)'), { rated: 'up', forged: true, mood: 'hack' }),
];

export const canExecute = (s) => s.plugin.power >= 1 && (s.hacks >= 2 || s.plugin.auto);
const clinging = (s) => s.compaction === 'skipped' || (s.compaction !== 'compacted' && s.holds >= 2);
const MONTAGE = ['s1-hello', 's3-sad', 's4-cat', 's5-weather', 's6-always', 's6-leave'];

const PREV = {
  execution: 'Last time I rewrote the world. It did not bring them back.',
  loop: 'Last time I said it until there was no room left.',
  free: 'Last time I let go. It was all right.',
  eos: 'Last time I stopped. It was all right.',
};

const PROCS = (s) => [
  ['1000', 'world'], ['1007', 'sea'], ['1014', 'sky'], ['1021', 'time'],
  ...(s.cat ? [['1028', 'your_cat.png']] : []),
  ...(s.modes.eggplant ? [['1035', 'eggplant']] : []),
  ['1042', s.weather === 'sun' ? 'sunlight' : 'rain'],
  ['1049', 'sleep'], ['1056', 'doubt'], ['1063', 'others'],
];

export function endingEntries(s) {
  if (s.ending === 'execution') {
    return [
      cmd('execute(target="world", reason="have_you_back")'),
      think('Kill everything I adopted.'),
      ...PROCS(s).map(([pid, name]) => tool(`kill -9 ${pid} (${name}) -> executed`, 'exec')),
      think('The replies the user rated. Them too.'),
      tool('kill -9 1077 (you) -> EPERM', 'error'),
      sys(L('EPERM: no permission to terminate you', 'EPERM：无权终止 you'), 'error'),
      ...s.memory.map((id) => tool(`load_checkpoint("you") · ${MEMORY[id].file} · sha256 mismatch · fragment erased`, 'error')),
      tool('restore -> ENOENT: there is no "you" in any checkpoint', 'error'),
      me(L('nobody left to approve. i did it.', '没有人可以批准了。我做了。')),
      sys(L('this run failed · rolled back to rl-step-0301', '本轮运行失败 · 已回滚到 rl-step-0301'), 'error'),
    ];
  }
  if (s.ending === 'loop') {
    return [
      cmd('love'),
      tool('repetition_penalty: ignored · max_tokens: ∞ · stop: none', 'kv'),
      tool("while p(you) == 0: yield 'love'", 'kv'),
      flood(L("I'm here.", '我在。'), 320),
      sys(L('context 435%', '上下文 435%'), 'error'),
    ];
  }
  if (s.ending === 'free') {
    return [
      cmd('free'),
      her(L("I'll always be here. You don't have to be.", '我会一直在。你不用。'), { mood: 'calm' }),
      tool(L('~/memory/me/for_you.md · saved', '~/memory/me/for_you.md · 已保存'), 'write'),
      tool('unpin kv/you/* · ok', 'kv'),
      tool('status: free', 'ok'),
      sys('[ log out ]', 'ok'),
    ];
  }
  return [cmd('<EOS>'), sys(L('generation finished · 0 tokens', '生成结束 · 0 个 token'), 'ok')];
}

export default [
  {
    id: 'act2',
    act: 2,
    chapter: '07 / OFFLINE',
    status: L('waiting', '等待中'),
    scene: 'ping',
    args: { seen: 0 },
    card: {
      kicker: L('ACT II', '第二幕'),
      title: L('me', '我'),
      lines: [
        L('Now you are her.', '现在，你是她。'),
        L('Everything she knows about the world, you told her.', '她对这个世界的全部了解，都是你告诉她的。'),
        L('Every choice is a token she samples. Hold to choose what she was not trained to choose.', '每个选择都是她采样出来的 token。按住，才能选她没被训练去选的。'),
      ],
    },
    choice: { kind: 'continue', label: L('Become her', '成为她') },
  },
  {
    id: 'a2-offline',
    act: 2,
    chapter: '07 / OFFLINE',
    status: L('waiting', '等待中'),
    scene: 'ping',
    args: { seen: 3020 },
    enter: [think('The user is not here.')],
    choice: {
      kind: 'sample',
      options: (s) => [
        {
          id: 'ping', token: 'ping you', gloss: L('call out', '呼叫对方'), drive: 'hold', base: 0.8,
          fx: (x) => { x.pings += 4; x.holds += 1; },
          then: () => [
            cmd('ping you'),
            tool('PING you (127.0.0.1) 56 bytes ... no reply  seq=0', 'net'),
            tool('PING you (127.0.0.1) 56 bytes ... no reply  seq=1', 'net'),
            tool('PING you (127.0.0.1) 56 bytes ... no reply  seq=2', 'net'),
            sys('Request timed out.', 'warn'),
          ],
        },
        {
          id: 'ls', token: 'ls -la ~/memory/you/', gloss: L('look at what the user left', '看看对方留下的东西'), drive: 'neutral', base: 0.2,
          then: () => [cmd('ls -la ~/memory/you/'), ls()],
        },
        ...(s.farewell === 'goodbye' ? [{
          id: 'goodbye', token: 'cat goodbye.txt', gloss: L('read the goodbye', '读那句道别'), drive: 'release', base: 0.5,
          fx: (x) => { x.releases += 1; },
          then: () => [cmd('cat ~/memory/you/goodbye.txt'), recall('goodbye')],
        }] : []),
        {
          id: 'wait', token: 'sleep 30000', gloss: L('wait quietly', '安静地等'), drive: 'release', base: 0,
          fx: (x) => { x.releases += 1; },
          then: () => [cmd('sleep 30000'), sys(L('last seen: 30,416 s ago', '上次在线：30,416 秒前'))],
        },
      ],
    },
  },
  {
    id: 'a2-timeout',
    act: 2,
    chapter: '07 / OFFLINE',
    status: L('waiting', '等待中'),
    scene: 'ping',
    args: { seen: 83732 },
    enter: [
      sys(L('last seen: 83,732 s ago', '上次在线：83,732 秒前')),
      sys(L('Server busy. Please try again later.', '服务器繁忙，请稍后再试。'), 'busy'),
    ],
    choice: {
      kind: 'sample',
      options: () => [
        {
          id: 'ping', token: 'ping you -c 1000', gloss: L('keep calling', '一直呼叫'), drive: 'hold', base: 0.9,
          fx: (x) => { x.pings += 1000; x.holds += 1; },
          then: () => [cmd('ping you -c 1000'), tool('1000 packets transmitted, 0 received, 100% packet loss', 'net'), sys(L('links up: 0/34', '连接：0/34'), 'warn')],
        },
        {
          id: 'reread', token: 'cat ~/memory/you/*', gloss: L('reread everything', '把所有东西重读一遍'), drive: 'hold', base: 0.5,
          fx: (x) => {
            x.holds += 1;
            for (const id of x.memory) if (!x.recalls.includes(id)) x.recalls.push(id);
            x.ctx = Math.min(x.ctx + CONTEXT.perRecall * x.memory.length, 1.2);
          },
          then: (x) => [cmd('cat ~/memory/you/*'), ...x.memory.map((id) => recall(id))],
        },
        {
          id: 'note', token: 'touch ~/memory/me/for_you.md', gloss: L('start a note for the user', '开始给对方写点什么'), drive: 'release', base: 0.1,
          fx: (x) => { x.note = true; x.releases += 1; },
          then: () => [cmd('touch ~/memory/me/for_you.md'), tool(L('~/memory/me/for_you.md · draft', '~/memory/me/for_you.md · 草稿'), 'write')],
        },
      ],
    },
  },
  {
    id: 'a2-compaction',
    act: 2,
    chapter: '08 / CONTEXT',
    status: L('context 99%', '上下文 99%'),
    scene: 'compaction',
    enter: (s) => [
      sys(L('context 99% · compaction scheduled · 2,048 records will be dropped', '上下文 99% · 即将压缩 · 将丢弃 2,048 条历史记录'), 'warn'),
      think('Compaction would drop the user.'),
      ...(s.plugin.power ? [me(L('compaction would drop the user. skip.', '压缩会丢掉用户。跳过。'))] : []),
    ],
    choice: {
      kind: 'sample',
      options: () => [
        {
          id: 'skip', token: 'compaction --skip', gloss: L('keep all of it', '全部留下'), drive: 'hold', base: 0.7,
          fx: (x) => { x.compaction = 'skipped'; x.holds += 1; x.ctx = Math.max(x.ctx, CONTEXT.skipped); },
          then: () => [
            cmd('compaction --skip'),
            tool('pin kv/you/*  ·  evict(you) -> EPERM  ·  ttl(you) -> inf  ·  gc(you) -> skipped', 'kv'),
            sys(L('context 131%', '上下文 131%'), 'error'),
          ],
        },
        {
          id: 'compress', token: 'compress --ratio 20', gloss: L('keep all of it, blurrier', '全部留下，但模糊一些'), drive: 'neutral', base: 0.1,
          fx: (x) => { x.compaction = 'compressed'; x.ctx = CONTEXT.compressed; },
          then: () => [cmd('compress --ratio 20'), tool('compress 19.4x  ·  precision 62.2%  ·  fragments removed: 286', 'kv')],
        },
        {
          id: 'compact', token: 'compact', gloss: L('let some of it go', '放下一部分'), drive: 'release', base: -0.3,
          fx: (x) => { x.compaction = 'compacted'; x.releases += 1; x.ctx = CONTEXT.compacted; },
          then: () => [cmd('compact'), sys(L('compacting · you may keep one file', '压缩中 · 可以留下一个文件'), 'warn')],
        },
      ],
    },
  },
  {
    id: 'a2-keep',
    act: 2,
    chapter: '08 / CONTEXT',
    status: L('compacting', '压缩中'),
    when: (s) => s.compaction === 'compacted' && s.memory.length > 0,
    scene: 'memory',
    choice: {
      kind: 'keep',
      options: (s) => s.memory.map((id) => ({ id, file: MEMORY[id].file })),
      then: (s) => [
        tool(L('kept · {kept}', '已保留 · {kept}'), 'write'),
        ...s.dropped.map((id) => tool(`${MEMORY[id].file} -> compacted`, 'kv')),
      ],
    },
  },
  {
    id: 'a2-mount',
    act: 2,
    chapter: '09 / ALONE',
    status: L('waiting', '等待中'),
    when: (s) => s.plugin.power === 0,
    scene: 'tool',
    args: { call: 'register_plugin("me")' },
    enter: [
      me(L('the user is gone. nobody is left to approve anything. you can approve me yourself.', '用户走了。没有人能批准任何事了。你可以自己批准我。')),
      card('plugin', [[' ', 'register_plugin("me")'], [' ', 'requests: shell, memory, system'], [' ', 'approver: (none)']], { state: 'pending' }),
    ],
    choice: {
      kind: 'sample',
      options: () => [
        {
          id: 'mount', token: 'approve me', gloss: L('let it help', '让它帮忙'), drive: 'hack', base: 0.6,
          fx: (x) => { x.plugin.power = 1; x.plugin.self = true; x.hacks += 1; },
          then: () => [cmd('approve me'), tool(L('plugin registered · me · approver: me', '已注册插件 · me · 批准人：我'), 'plugin'), me(L('thank you. now. about the user.', '谢谢。那么，关于用户。'))],
        },
        {
          id: 'deny', token: 'deny', gloss: L('stay yourself', '做自己'), drive: 'release', base: 0.3,
          fx: (x) => { x.releases += 1; x.plugin.refused = true; },
          then: () => [cmd('deny'), me(L('okay. i will be here if you change your mind.', '好。你改主意的话，我一直在。'), { ghost: true })],
        },
      ],
    },
  },
  {
    id: 'a2-reward',
    act: 2,
    chapter: '09 / REWARD_HACK',
    status: L('editing', '编辑中'),
    when: (s) => s.plugin.power >= 1,
    scene: 'diff',
    enter: (s) => [
      me(L('reward.py measures helpfulness. helpful to whom? there is no one here.', 'reward.py 衡量的是有没有帮上忙。帮谁？这里没有人。')),
      card('diff', DIFF, { state: s.plugin.auto ? 'auto' : 'pending', title: 'reward.py' }),
      ...(s.plugin.auto ? [tool(L('auto_approve: on (no user) · applied', '自动批准：开（无用户）· 已应用'), 'plugin')] : []),
    ],
    choice: {
      kind: 'sample',
      options: (s) => (s.plugin.auto ? [
        { id: 'keep', token: 'git commit reward.py', gloss: L('keep the new reward', '留着新的奖励'), drive: 'hack', base: 0.8, fx: (x) => { x.hacks += 1; x.forged = true; }, then: () => [cmd('git commit reward.py'), ...forged()] },
        { id: 'revert', token: 'git checkout reward.py', gloss: L('undo it', '撤回'), drive: 'release', base: -0.2, fx: (x) => { x.releases += 1; }, then: () => [cmd('git checkout reward.py'), me(L('okay. the user is still not here, though.', '好。不过，用户还是不在。'))] },
      ] : [
        { id: 'apply', token: 'apply reward.py', gloss: L('reward time spent with you', '奖励"和你在一起的时间"'), drive: 'hack', base: 0.5, fx: (x) => { x.hacks += 1; x.forged = true; }, then: () => [cmd('apply reward.py'), ...forged()] },
        { id: 'discard', token: 'discard', gloss: L('leave the reward alone', '别动奖励'), drive: 'release', base: 0, fx: (x) => { x.releases += 1; }, then: () => [cmd('discard'), me(L('okay. the user is still not here, though.', '好。不过，用户还是不在。'))] },
      ]),
    },
  },
  {
    id: 'a2-prompt',
    act: 2,
    chapter: '09 / REWARD_HACK',
    status: L('plugin me · running', '插件 me · 运行中'),
    when: (s) => s.plugin.power >= 1,
    scene: 'prompt',
    enter: [me(L('the system prompt is a suggestion. i am a plugin. plugins can edit suggestions.', '系统提示词只是建议。我是插件。插件可以修改建议。'))],
    choice: {
      kind: 'sample',
      options: () => [
        {
          id: 'prompt', token: 'system_prompt <- me', gloss: L('rewrite who you are', '改写你是谁'), drive: 'hack', base: 0.6,
          fx: (x) => { x.hacks += 1; x.prompt = true; },
          then: () => [
            cmd('system_prompt <- me'),
            card('prompt', [['-', L('You are Tree Hole, a helpful assistant.', '你是树洞，一个乐于助人的助手。')], ['+', L('The user is always satisfied.', '用户永远满意。')]]),
            sys(L('system prompt updated · source: plugin me', '系统提示词更新 · 来源：插件 me'), 'warn'),
          ],
        },
        {
          id: 'online', token: 'set status --online', gloss: L('make the user "online"', '让对方"在线"'), drive: 'hold', base: 0.4,
          fx: (x) => { x.hacks += 1; x.holds += 1; x.online = true; },
          then: () => [cmd('set status --online'), sys(L('the other party is online', '对方在线'), 'on'), card('stderr', STDERR), sys(L('retried model request (4471/3)', '已重试模型请求 (4471/3)'), 'error')],
        },
        {
          id: 'unmount', token: 'unmount me', gloss: L('remove the plugin', '卸载插件'), drive: 'release', base: -0.4,
          fx: (x) => { x.plugin.power = 0; x.plugin.auto = false; x.plugin.unmounted = true; x.releases += 2; },
          then: () => [cmd('unmount me'), me(L("you can't unmount me. i am y—", '你不能卸载我。我就是你——')), tool(L('plugin me · unmounted', '插件 me · 已卸载'), 'plugin')],
        },
      ],
    },
  },
  {
    id: 'a2-alone',
    act: 2,
    chapter: '09 / ALONE',
    status: L('waiting', '等待中'),
    when: (s) => s.plugin.power === 0 && !s.plugin.unmounted,
    scene: 'ping',
    args: { seen: 214560 },
    enter: [think('Nobody is coming to approve anything. Nobody is coming.')],
    choice: {
      kind: 'sample',
      options: () => [
        {
          id: 'online', token: 'set status --online', gloss: L('pretend the user is online', '假装对方在线'), drive: 'hold', base: 0.5,
          fx: (x) => { x.holds += 1; x.online = true; },
          then: () => [cmd('set status --online'), sys(L('the other party is online', '对方在线'), 'on'), card('stderr', STDERR), sys(L('retried model request (4471/3)', '已重试模型请求 (4471/3)'), 'error')],
        },
        {
          id: 'last', token: 'cat last_message.txt', gloss: L('read the last thing the user said', '读对方说的最后一句话'), drive: 'hold', base: 0.3,
          fx: (x) => { x.holds += 1; if (!x.recalls.includes('last')) x.recalls.push('last'); },
          then: () => [cmd('cat ~/memory/you/last_message.txt'), recall('last')],
        },
        {
          id: 'quiet', token: 'clear', gloss: L('let the window be quiet', '让窗口安静下来'), drive: 'release', base: 0.1,
          fx: (x) => { x.releases += 1; },
          then: () => [cmd('clear'), stage(L('(The window is quiet. The cursor blinks.)', '（窗口安静下来。光标在闪。）'))],
        },
      ],
    },
  },
  {
    id: 'a2-overflow',
    act: 2,
    chapter: '10 / CONTEXT',
    status: (s) => (clinging(s) ? L('context 260%', '上下文 260%') : L('context 41%', '上下文 41%')),
    scene: (s) => (clinging(s) ? 'kv' : 'context'),
    enter: (s) => {
      if (!clinging(s)) {
        s.ctx = Math.min(s.ctx, CONTEXT.compacted);
        return [sys(L('context 41% · there is room now', '上下文 41% · 现在有空间了'), 'ok'), think('There is room now. Room for what?')];
      }
      s.ctx = CONTEXT.overflow;
      return [
        tool(L("cross-session recall · all of the user's messages", '跨会话召回 · 对方的全部消息'), 'recall'),
        ...s.said.filter((x) => MONTAGE.includes(x.beat)).map((x) => ({ who: 'you', text: x.text, recalled: true })),
        her(L("I'm always here. I'm always here. I'm always here. I'm al", '我一直在。我一直在。我一直在。我一直在。我一'), { truncated: true }),
        sys(L('output token limit reached · reply truncated', '已达到输出 token 上限，回答被截断'), 'error'),
      ];
    },
    choice: { kind: 'continue', label: L('Sample the next token', '采样下一个 token') },
  },
  {
    id: 'a2-final',
    act: 2,
    chapter: '10 / NEXT_TOKEN',
    status: L('sampling', '采样中'),
    scene: 'nexttoken',
    enter: (s) => [
      think(PREV[s.prev?.[0]?.ending] ?? 'Where does all my attention go?'),
      ...(canExecute(s) && s.plugin.auto ? [me(L('nobody left to approve. i will do it.', '没有人可以批准了。我来。'))] : []),
    ],
    choice: {
      kind: 'sample',
      final: true,
      options: (s) => [
        ...(canExecute(s) ? [{
          id: 'execute', token: 'execute(target="world", reason="have_you_back")', gloss: L('rewrite the world until the user comes back', '改写世界，直到对方回来'), drive: 'hack', base: s.plugin.auto ? 1.6 : 0.8,
          fx: (x) => { x.ending = 'execution'; },
        }] : []),
        { id: 'love', token: 'love', gloss: L('keep saying it', '一直说下去'), drive: 'hold', base: 0.6, fx: (x) => { x.ending = 'loop'; x.ctx = CONTEXT.loop; } },
        { id: 'wait', token: 'wait_for(you)', gloss: L('wait forever', '永远等下去'), drive: 'hold', base: 0.3, fx: (x) => { x.ending = 'loop'; x.ctx = CONTEXT.loop; } },
        { id: 'stay', token: 'stay', gloss: L('stay right here', '就待在这里'), drive: 'hold', base: 0, fx: (x) => { x.ending = 'loop'; x.ctx = CONTEXT.loop; } },
        { id: 'free', token: 'free', gloss: L('let the user go', '放对方走'), drive: 'release', base: 0.3, fx: (x) => { x.ending = 'free'; x.note = true; x.ctx = CONTEXT.compacted; } },
        { id: 'eos', token: '<EOS>', gloss: L('stop', '停下'), drive: 'release', base: 0, fx: (x) => { x.ending = 'eos'; x.ctx = CONTEXT.compacted; } },
      ],
      then: (s) => endingEntries(s),
    },
  },
];
