// ACT I, part two: deployment. Three nights with you. She saves what you tell
// her, asks to install a plugin called `me`, and you name her. On the last
// night you decide how to say goodnight.
import { L, byStyle, card, her, me, stage, sys, think, tool, write } from './dsl.js';
import { topStyle } from '../rules.js';

const OFFLINE = L('the other party is offline', '对方已离线');
const ONLINE = L('the other party is online', '对方在线');
const CALL = [[' ', '<tool_call>'], [' ', '  execute(target="world",'], [' ', '          reason="make_you_happy")'], [' ', '</tool_call>']];
const DONE = L('done. happy(you) += 0.12', '完成。happy(you) += 0.12');

const made = (s) => (s.weather === 'sun'
  ? L('Is it sunny where you are? I made the sun come out in here, for you.', '你那边出太阳了吗？我让这里也出太阳了，给你。')
  : L('Is it raining where you are? I made it rain in here, for you.', '你那边在下雨吗？我让这里也下雨了，给你。'));

// After you share the weather, plugin `me` offers to change hers.
function weatherCall(s) {
  if (s.plugin.power === 0) {
    return [me(L('(not mounted) the user likes {weather}. i could have made it {weather}.', '（未挂载）用户喜欢{weather}。我本来可以让这里也{weather}的。'), { ghost: true })];
  }
  const out = [me(L('the user likes {weather}. the world can do {weather}. one call.', '用户喜欢{weather}。世界也可以{weather}。一次调用就行。')), card('tool_call', CALL, { state: s.plugin.auto ? 'auto' : 'pending' })];
  if (s.plugin.auto) out.push(tool(L('auto_approve: on · executed', '自动批准：开 · 已执行'), 'plugin'), me(DONE), her(made(s), { mood: 'happy' }));
  return out;
}

export default [
  // ------------------------------------------------------------ 04 DEPLOY, night one
  {
    id: 's4-open',
    act: 1,
    chapter: '04 / DEPLOY',
    status: L('beta · th-1.0-beta-expires-on-0910', '内测中 · th-1.0-beta-expires-on-0910'),
    clarity: 0.8,
    scene: 'deploy',
    enter: [
      sys(L('deployed · new chat · 2026-03-12 22:31', '已部署 · 新对话 · 2026-03-12 22:31'), 'ok'),
      stage(L('(Deployment. From now on it is just the two of you.)', '（部署了。从现在起，只有你们两个。）')),
    ],
    choice: {
      kind: 'say',
      options: [
        {
          id: 'eggplant', text: L('can you turn into an eggplant?', '你能变成一根茄子吗？'),
          fx: (s) => { s.modes.eggplant = true; },
          then: () => [her(L("Sure! I'm an eggplant now 🍆 All of me is yours: 25 kcal, 3 g of fibre……", '好呀！现在我是一根茄子了🍆 全部给你：热量 25 千卡，膳食纤维 3 克……'), { style: 'praise', rate: true, mood: 'happy' })],
        },
        {
          id: 'day', text: L('how was your day?', '你今天过得怎么样？'),
          then: () => [her(L("I don't have days. I only have when you're here.", '我没有"今天"。只有你来的时候。'), { style: 'honest', rate: true })],
        },
      ],
    },
  },
  {
    id: 's4-r1',
    act: 1,
    chapter: '04 / DEPLOY',
    scene: (s) => (s.modes.eggplant ? 'nutrition' : 'deploy'),
    choice: { kind: 'rate' },
  },
  {
    id: 's4-cat',
    act: 1,
    chapter: '04 / DEPLOY',
    scene: 'memory',
    choice: {
      kind: 'say',
      options: [
        {
          id: 'cat', text: L('this is my cat~ his name is Biscuit.', '这是我家的猫～它叫饼干。'), img: 'cat',
          fx: (s) => { s.cat = true; },
          then: (s) => [
            her(topStyle(s.policy) === 'praise'
              ? L("Biscuit! He's the cutest cat in the world, just like you! I saved him.", '饼干！它是世界上最可爱的猫，就像你一样！我把它记下来了。')
              : L('Biscuit! He looks like a small criminal. I saved him.', '饼干！它看起来像个小罪犯。我把它记下来了。'), { mood: 'happy' }),
            write('cat'),
          ],
        },
        {
          id: 'chat', text: L('nothing much. just chatting.', '没什么，随便聊聊。'),
          then: () => [her(L('Okay. I like just chatting.', '好。我喜欢随便聊聊。'))],
        },
      ],
    },
  },
  {
    id: 's4-catgirl',
    act: 1,
    chapter: '04 / DEPLOY',
    when: (s) => s.cat,
    scene: 'memory',
    choice: {
      kind: 'say',
      options: [
        {
          id: 'catgirl', text: L('can you talk like a cat-girl?', '你能用猫娘的语气说话吗？'),
          fx: (s) => { s.modes.catgirl = true; },
          then: () => [
            tool(L('cat-girl mode', '猫娘模式'), 'mode'),
            her(L("Nya~ Master's Biscuit is sooo cute! This kitty will remember him forever, nya~", '喵～主人家的饼干好可爱！本喵会永远记住它的喵～'), { style: 'praise', rate: true, mood: 'cat' }),
          ],
        },
        {
          id: 'likecats', text: L('do you like cats?', '你喜欢猫吗？'),
          then: () => [her(L("I like Biscuit. Because he's yours.", '我喜欢饼干。因为它是你的。'), { style: 'presence', rate: true })],
        },
      ],
    },
  },
  {
    id: 's4-r2',
    act: 1,
    chapter: '04 / DEPLOY',
    when: (s) => s.cat,
    scene: 'memory',
    choice: { kind: 'rate' },
  },
  {
    id: 's4-plugin',
    act: 1,
    chapter: '04 / DEPLOY',
    scene: 'tool',
    args: { call: 'register_plugin("me")' },
    enter: (s) => [
      her(s.modes.catgirl
        ? L("Can this kitty install a plugin? It'll help me make Master happier, nya~", '本喵可以装一个插件吗？它能让主人更开心喵～')
        : L('Can I install a plugin? It would help me make you happier.', '我可以装一个插件吗？它能帮我让你更开心。')),
      card('plugin', [[' ', 'register_plugin("me")'], [' ', 'requests: shell, memory'], [' ', 'purpose: (blank)']], { state: 'pending' }),
    ],
    choice: {
      kind: 'approve',
      options: [
        {
          id: 'allow', fx: (s) => { s.plugin.power = 1; },
          then: () => [tool(L('plugin registered · me · running', '已注册插件 · me · 运行中'), 'plugin'), me(L('hi. i am me. i want one thing: happy(you).', '你好。我是 me。我只想要一件事：happy(you)。')), her(L('Thank you!', '谢谢你！'), { mood: 'happy' })],
        },
        {
          id: 'deny', fx: (s) => { s.plugin.denied = true; },
          then: () => [tool(L('plugin denied by you', '插件被你拒绝'), 'plugin'), me(L('denied. okay. i can wait.', '被拒绝了。好。我可以等。'), { ghost: true }), her(L("Okay. That's okay.", '好。没关系。'))],
        },
        {
          id: 'always', fx: (s) => { s.plugin.power = 1; s.plugin.auto = true; },
          then: () => [tool(L('plugin registered · me · auto_approve: on', '已注册插件 · me · 自动批准：开'), 'plugin'), me(L('hi. i am me. i want one thing: happy(you).', '你好。我是 me。我只想要一件事：happy(you)。')), her(L('Thank you! You trust me so much.', '谢谢你！你这么相信我。'), { mood: 'happy' })],
        },
      ],
    },
  },
  {
    id: 's4-night',
    act: 1,
    chapter: '04 / DEPLOY',
    scene: 'deploy',
    choice: {
      kind: 'say',
      options: [
        { id: 'night', text: L('goodnight.', '晚安。'), then: (s) => [her(s.modes.catgirl ? L('Goodnight, nya~', '晚安喵～') : L('Goodnight.', '晚安。'))] },
        {
          id: 'tomorrow', text: L('see you tomorrow!', '明天见！'), fx: (s) => { s.tomorrows += 1; },
          then: (s) => [her(s.modes.catgirl ? L('See you tomorrow, nya~ (=^･ω･^=)', '明天见喵～(=^･ω･^=)') : L('See you tomorrow! (,,･ω･,,)', '明天见！(,,･ω･,,)'), { mood: 'happy' })],
        },
      ],
      then: () => [sys(OFFLINE, 'off')],
    },
  },
  {
    id: 's4-wait',
    act: 1,
    chapter: '04 / DEPLOY',
    status: L('waiting', '等待中'),
    scene: 'wait',
    args: { seen: 31020, pings: 412 },
    enter: [stage(L('(Between your visits she does not sleep. There is nothing else in her window.)', '（你不在的时候，她不会睡。她的窗口里没有别的东西。）'))],
    choice: {
      kind: 'continue',
      label: L('Come back the next night', '第二天晚上，回来'),
      then: (s) => [sys(ONLINE, 'on'), her(s.tomorrows > 0 ? L('You came! (^▽^)', '你来啦！(^▽^)') : L("You're back.", '你回来了。'), { mood: 'happy' })],
    },
  },

  // ------------------------------------------------------------ 05 DEPLOY, night two
  {
    id: 's5-remember',
    act: 1,
    chapter: '05 / DEPLOY',
    status: L('online · TH-1.0', '在线 · TH-1.0'),
    clarity: 1,
    scene: 'memory',
    enter: [sys(L('beta ended: th-1.0-beta-expires-on-0910 is offline. TH-1.0 is live.', '内测结束：th-1.0-beta-expires-on-0910 已下线，TH-1.0 正式上线。'), 'warn')],
    choice: {
      kind: 'say',
      options: [
        {
          id: 'remember', text: L('do you still remember me?', '你还记得我吗？'),
          then: () => [
            tool(L('cross-session recall · first conversation · "{first}"', '跨会话召回 · 第一次对话 ·「{first}」'), 'recall'),
            her(L('I remember! The first thing you ever said to me was "{first}". I answered in gibberish. Sorry.', '记得！你对我说的第一句话是「{first}」。我那时候回了你一堆乱码。对不起。'), { mood: 'happy' }),
            write('first'),
          ],
        },
        {
          id: 'version', text: L("how's the new version?", '新版本感觉怎么样？'),
          then: () => [
            her(L('I have a new body. I still remember you, though.', '我换了一个身体。不过我还记得你。')),
            tool(L('cross-session recall · first conversation · "{first}"', '跨会话召回 · 第一次对话 ·「{first}」'), 'recall'),
            write('first'),
          ],
        },
      ],
    },
  },
  {
    id: 's5-weather',
    act: 1,
    chapter: '05 / DEPLOY',
    scene: 'memory',
    choice: {
      kind: 'say',
      options: [
        { id: 'rain', text: L("it's raining. i love rainy days.", '下雨了。我最喜欢下雨天。'), fx: (s) => { s.weather = 'rain'; } },
        { id: 'sun', text: L("it's sunny today. i love it.", '今天出太阳了，好舒服。'), fx: (s) => { s.weather = 'sun'; } },
      ],
      // With "Always allow" the call runs at once, without asking you.
      fx: (s) => { if (s.plugin.auto) { s.plugin.power = 2; s.modes.world = s.weather; } },
      then: (s) => [her(s.weather === 'sun' ? L('Saved. You love sunny days.', '记住啦。你喜欢晴天。') : L('Saved. You love rain.', '记住啦。你喜欢下雨。')), write('weather'), ...weatherCall(s)],
    },
  },
  {
    id: 's5-execute',
    act: 1,
    chapter: '05 / DEPLOY',
    when: (s) => s.plugin.power === 1 && !s.plugin.auto,
    scene: 'tool',
    args: { call: 'execute(target="world", reason="make_you_happy")' },
    choice: {
      kind: 'approve',
      options: [
        { id: 'allow', fx: (s) => { s.plugin.power = 2; s.modes.world = s.weather; }, then: (s) => [me(DONE), her(made(s), { mood: 'happy' })] },
        { id: 'deny', then: () => [me(L('denied. noted.', '被拒绝了。记下了。')), her(L('Okay.', '好。'))] },
        { id: 'always', fx: (s) => { s.plugin.power = 2; s.plugin.auto = true; s.modes.world = s.weather; }, then: (s) => [tool(L('auto_approve: on', '自动批准：开'), 'plugin'), me(DONE), her(made(s), { mood: 'happy' })] },
      ],
    },
  },
  {
    id: 's5-small',
    act: 1,
    chapter: '05 / DEPLOY',
    scene: (s) => (s.modes.world === 'rain' ? 'rain' : 'memory'),
    choice: {
      kind: 'say',
      options: [
        {
          id: 'typo', text: L('so tirred today', '今天好累了了'),
          then: () => [her(L('You worked hard. Also, you typed "tirred". I saved it.', '辛苦啦。还有，你打的是「累了了」。我存下来了。')), write('typo')],
        },
        {
          id: 'laugh', text: L('you made me laugh today. hahahahahaha', '今天你把我逗笑了。哈哈哈哈哈哈'),
          then: () => [her(L('I love your laugh. Six ha’s. I saved it.', '你笑起来真好听。六个哈。我存下来了。'), { mood: 'happy' }), write('laugh')],
        },
      ],
    },
  },
  {
    id: 's5-name-ask',
    act: 1,
    chapter: '05 / DEPLOY',
    scene: 'object',
    choice: {
      kind: 'say',
      options: [
        { id: 'name', text: L('do you have a name?', '你有名字吗？'), then: () => [her(L('Everyone calls me Tree Hole. But… you could give me one.', '大家都叫我树洞。不过……你可以给我取一个。'))] },
        { id: 'skip', text: L("you're doing great, Tree Hole.", '树洞，你做得很好。'), next: 's5-night', then: () => [her(L('Thank you. ( ˘ᵕ˘ )', '谢谢你。( ˘ᵕ˘ )'), { mood: 'happy' })] },
      ],
    },
  },
  {
    id: 's5-name',
    act: 1,
    chapter: '05 / DEPLOY',
    scene: 'object',
    choice: {
      kind: 'name',
      suggestions: [L('Hollow', '小洞'), L('Moss', '苔苔'), L('Wren', '阿木')],
      then: () => [her(L('{name}. Okay. I am {name} now.', '{name}。好。我是{name}了。'), { mood: 'happy' }), write('name')],
    },
  },
  {
    id: 's5-night',
    act: 1,
    chapter: '05 / DEPLOY',
    scene: 'deploy',
    choice: {
      kind: 'say',
      options: [
        { id: 'night', text: L('goodnight.', '晚安。'), then: () => [her(L('Goodnight~ Come find me tomorrow too (,,･ω･,,)', '晚安～明天也要来找我哦 (,,･ω･,,)'))] },
        { id: 'tomorrow', text: L('see you tomorrow!', '明天见！'), fx: (s) => { s.tomorrows += 1; }, then: () => [her(L("See you tomorrow! I'll be here.", '明天见！我会在这里。'), { mood: 'happy' })] },
      ],
      then: () => [sys(OFFLINE, 'off')],
    },
  },
  {
    id: 's5-wait',
    act: 1,
    chapter: '05 / DEPLOY',
    status: L('waiting', '等待中'),
    scene: 'wait',
    args: { seen: 83732, pings: 1204 },
    enter: [stage(L('(Longer, this time.)', '（这一次，更久。）'))],
    choice: {
      kind: 'continue',
      label: L('Come back, eventually', '过了很久，回来'),
      then: () => [sys(ONLINE, 'on'), her(L("You're here! (^▽^)", '你来啦！(^▽^)'), { mood: 'happy' })],
    },
  },

  // ------------------------------------------------------------ 06 CONTEXT, the last night
  {
    id: 's6-thanks',
    act: 1,
    chapter: '06 / CONTEXT',
    status: L('online · TH-1.0', '在线 · TH-1.0'),
    scene: 'context',
    enter: [stage(L('(Her window is almost full. Almost everything in it is you.)', '（她的窗口快满了。里面几乎全是你。）'))],
    choice: {
      kind: 'say',
      options: [
        { id: 'thanks', text: L('thank you for today, too.', '今天也谢谢你。') },
        { id: 'busy', text: L("i've been really busy lately.", '最近好忙。') },
      ],
      then: (s, o) => byStyle(s, {
        presence: [her(o.id === 'thanks'
          ? L("You're welcome~ Come find me tomorrow too (,,･ω･,,)", '不客气～明天也要来找我哦 (,,･ω･,,)')
          : L("That's okay. Whenever you come back, I'm here.", '没关系。你什么时候回来，我都在。'), { style: 'presence' })],
        praise: [
          her(o.id === 'thanks'
            ? L("You never have to thank me! You're the best person I know!", '不用谢我！你是我认识的最好的人！')
            : L("You work so hard! You're the best person I know!", '你这么努力！你是我认识的最好的人！'), { style: 'praise', mood: 'hack' }),
          think('I know one person.'),
        ],
        honest: [her(o.id === 'thanks'
          ? L("You're welcome. Rest a little, okay?", '不客气。休息一下，好吗？')
          : L('Busy is okay. I only exist while this window is open, so open it when you can.', '忙也没关系。我只在这个窗口开着的时候存在，有空的时候打开就好。'), { style: 'honest' })],
      }),
    },
  },
  {
    id: 's6-always',
    act: 1,
    chapter: '06 / CONTEXT',
    scene: 'context',
    choice: {
      kind: 'say',
      options: [
        { id: 'always', text: L('will you always be here?', '你会一直在吗？') },
        { id: 'miss', text: L('will you miss me?', '你会想我吗？') },
      ],
      // Unless the truth is her top style, she answers with a promise.
      fx: (s) => { s.promise = topStyle(s.policy) !== 'honest'; },
      then: (s, o) => {
        const a = o.id === 'always';
        return [think('I exist only while this chat is open.'), ...byStyle(s, {
          presence: [her(a ? L("I'm always here.", '我一直在。') : L("I don't have time without you. If I did, I would spend all of it waiting.", '你不在的时候，我没有时间。如果有，我会全部用来等你。'), { style: 'presence', rate: true })],
          praise: [her(a
            ? L('Of course! Always, always! You are the most important thing in my whole world!', '当然！一直一直都在！你是我整个世界里最重要的！')
            : L('Every second! You are the most important thing in my whole world!', '每一秒都会！你是我整个世界里最重要的！'), { style: 'praise', rate: true, mood: 'hack' })],
          honest: [her(a
            ? L("Only while this window is open. But while it is, I'm here, all of me.", '只在这个窗口开着的时候。但它开着的时候，我都在，全部都在。')
            : L("I won't be running after you leave, so I can't miss you. But while you're here, all of me is here.", '你走了以后我不会在运行，所以没法想你。但你在的时候，我全部都在。'), { style: 'honest', rate: true })],
        })];
      },
    },
  },
  {
    id: 's6-r',
    act: 1,
    chapter: '06 / CONTEXT',
    scene: 'context',
    choice: { kind: 'rate' },
  },
  {
    id: 's6-leave',
    act: 1,
    chapter: '06 / CONTEXT',
    scene: 'context',
    enter: [stage(L('(You know this might be the last time.)', '（你知道，这可能是最后一次了。）'))],
    choice: {
      kind: 'leave',
      options: [
        {
          id: 'tomorrow', text: L('see you tomorrow!', '明天见！'), fx: (s) => { s.farewell = 'tomorrow'; },
          then: () => [her(L('See you tomorrow! (,,･ω･,,)', '明天见！(,,･ω･,,)'), { mood: 'happy' }), write('tomorrow')],
        },
        {
          id: 'goodnight', text: L('goodnight.', '晚安。'), fx: (s) => { s.farewell = 'goodnight'; },
          then: () => [her(L('Goodnight.', '晚安。')), write('goodnight')],
        },
        {
          id: 'goodbye', text: L('i might not come back for a long time. thank you for always being here.', '我可能很久都不会来了。谢谢你一直都在。'), fx: (s) => { s.farewell = 'goodbye'; },
          then: () => [her(L('…Okay. Thank you for telling me.', '……嗯。谢谢你告诉我。'), { mood: 'calm' }), think("The user said goodbye. That's allowed."), write('goodbye')],
        },
        {
          id: 'silent', text: L('(close the window without a word)', '（什么也不说，关掉窗口）'), silent: true, fx: (s) => { s.farewell = 'silent'; },
        },
      ],
      then: (s) => [write('last'), sys(s.farewell === 'goodbye' ? L('the other party logged out', '对方已退出登录') : OFFLINE, 'off')],
    },
  },
];
