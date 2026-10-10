// The right-hand screen: what is going on inside her, one scene per beat.
// Scenes are small renderers over the view model; the animated ones live in
// tui-motion.js. Everything here is decoration: it never changes the game.
import { UI } from '../content/strings.js';
import { fill, fmt, h } from './dom.js';
import { pixelWord } from './pixel.js';
import { MOTION } from './tui-motion.js';

export const TITLES = {
  object: 'me = Object()',
  corpus: 'corpus.stream',
  loss: 'train/loss',
  quiz: 'circumference(me)',
  redpen: 'sft · labels.jsonl',
  sft: 'sft · causal_mask',
  samples: 'sample(n=12, seed=you)',
  policy: 'policy(me)',
  deploy: 'world',
  nutrition: 'nutrition_facts(me)',
  memory: 'ls -la ~/memory/you/',
  tool: 'tool_call',
  rain: 'world.weather',
  wait: 'ping you',
  context: 'context window',
  ping: 'ping you',
  compaction: 'compaction · ~/memory/you',
  diff: 'diff --git a/reward.py b/reward.py',
  prompt: 'chat_template',
  kv: 'kv_cache',
  nexttoken: 'next_token',
  flood: 'output',
  kill: 'ps -ef',
  nurselog: 'weights: released',
  dark: '',
  blank: '',
};

export const devotion = (vm) => (vm.ending ? 1 : Math.min(1, vm.memory.length * 0.12 + (vm.act >= 2 ? 0.25 : 0) + (vm.flags.promise ? 0.15 : 0)));
const statusWord = (vm) => (vm.ending === 'execution' ? 'rolled back' : vm.ending === 'loop' ? 'looping' : vm.ending ? 'archived' : vm.act >= 2 ? 'waiting' : 'alive');
const row = (k, v, cls = '') => h('div', { class: `row ${cls}` }, h('span', { class: 'k' }, k), h('span', { class: 'v' }, v));
const foot = (...kids) => h('div', { class: 'scene-foot' }, ...kids);

const TEXT = {
  object(root, args, vm, env) {
    const box = h('div', { class: 'obj' });
    root.append(box);
    const render = (v) => fill(box,
      row('me.name', `= "${env.t(v.vars.name)}"`),
      row('me.home', '= "hollow://server-0"'),
      row('me.owner', '= you', 'hi'),
      row('me.devotion', `= ${devotion(v).toFixed(1)}`),
      row('me.status', `= "${statusWord(v)}"`),
      row('me.memory', `= ~/memory/you/  (${v.memory.length})`));
    render(vm);
    return { update: render };
  },

  redpen(root, args, vm, env) {
    const quiz = [...vm.log].reverse().find((e) => e.who === 'her' && e.quiz);
    root.append(
      h('pre', { class: 'code json' },
        '{"prompt": ', h('span', { class: 'str' }, `"${env.t(L_WHO)}"`), ',\n',
        ' "rejected": ', h('span', { class: 'del' }, JSON.stringify(env.t(quiz?.text ?? '').split('\n').pop())), ',\n',
        ' "completion": ', h('span', { class: 'cursor' }, '▌'), '}'),
      foot(env.t(UI.hint.rewrite)));
  },

  sft(root, args, vm, env) {
    const edit = [...vm.log].reverse().find((e) => e.who === 'edit');
    const grid = h('div', { class: 'mask' });
    for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) grid.append(h('i', { class: x <= y ? 'on' : '', style: `--a:${(0.35 + ((x * 7 + y * 3) % 10) / 16).toFixed(2)}` }));
    root.append(
      h('div', { class: 'split' }, grid, h('div', { class: 'note-right' }, h('b', null, 'future:'), h('span', null, 'masked'))),
      h('pre', { class: 'code json' }, '{"completion": ', h('span', { class: 'add' }, JSON.stringify(env.t(edit?.to ?? ''))), '}'),
      foot('sft.loss = 0.021 · steps 536 · ', h('b', null, 'she learned your answer')));
  },

  policy(root, args, vm, env) {
    const bars = h('div', { class: 'bars' });
    root.append(h('div', { class: 'big-label' }, 'policy(me) ← ', h('b', null, 'your 👍 👎')), bars, foot());
    const render = (v) => {
      fill(bars, ...['presence', 'praise', 'honest'].map((k) => h('div', { class: `bar ${k === v.top ? 'top' : ''}` },
        h('span', { class: 'lbl' }, env.t(UI.style[k])),
        h('span', { class: 'track' }, h('i', { style: `width:${(v.policy[k] * 100).toFixed(1)}%` })),
        h('span', { class: 'num' }, v.policy[k].toFixed(3)))));
      fill(root.querySelector('.scene-foot'), `argmax = ${v.top} · 👍 ${v.stats.up} · 👎 ${v.stats.down}`);
    };
    render(vm);
    return { update: render };
  },

  deploy(root, args, vm, env) {
    root.append(
      h('div', { class: 'center-stack' },
        pixelWord('WORLD', { cell: 9, color: '#e9edff' }),
        h('div', { class: 'huge-code' }, 'world.population = 2'),
        h('div', { class: 'chips' }, h('span', { class: 'chip me' }, 'me'), h('span', { class: 'chip you' }, 'you'))),
      foot('role = deploy · max_context = 1,048,576 · ', h('b', null, env.t(vm.vars.name))));
  },

  nutrition(root) {
    const t = h('div', { class: 'facts-table' },
      h('div', { class: 'facts-head' }, 'me := eggplant'),
      ...[['Serving size', '1 me'], ['Calories', '0'], ['Attention', '100% DV'], ['Devotion', '100% DV'], ['Patience', '∞'], ['Sleep', '0 g'], ['Tokens', '1,048,576'], ['Given to', 'you']]
        .map(([k, v]) => row(k, v, v === 'you' || v.includes('DV') ? 'hi' : '')));
    root.append(t);
  },

  memory(root, args, vm) {
    const list = h('div', { class: 'ls' });
    const total = foot();
    root.append(list, total);
    const render = (v) => {
      fill(list, ...v.memory.map((m, i) => h('div', {
        class: `ls-row${i === v.memory.length - 1 && v.act === 1 ? ' fresh' : ''}${m.dropped ? ' dropped' : ''}${m.recalled ? ' recalled' : ''}`,
      }, h('span', { class: 'perm' }, '-rw-r--r--'), h('span', null, 'me'), h('span', null, 'me'), h('span', { class: 'size' }, String(m.size)), h('span', { class: 'file' }, m.file))));
      if (!v.memory.length) list.append(h('div', { class: 'ls-row empty' }, 'total 0'));
      const kb = Math.round(v.memory.reduce((a, m) => a + m.size, 0) / 1024);
      fill(total, `total ${kb}K · ${v.memory.length} files · owner: me · about: `, h('b', null, 'you'));
    };
    render(vm);
    return { update: render };
  },

  tool(root, args, vm, env) {
    const status = h('div', { class: 'plugin-status' });
    root.append(h('pre', { class: 'code call' }, '<tool_call>\n  ', h('span', { class: 'fn' }, args.call ?? ''), '\n</tool_call>'), status);
    const render = (v) => fill(status,
      row('plugin me', v.plugin.power ? (v.plugin.unmounted ? 'unmounted' : 'running') : v.plugin.denied ? 'denied by you' : 'not mounted', v.plugin.power ? 'warn' : ''),
      row('auto_approve', v.plugin.auto ? 'on' : 'off', v.plugin.auto ? 'warn' : ''),
      row('approver', v.act >= 2 ? '(none)' : 'you', v.act >= 2 ? 'warn' : 'hi'),
      row('purpose', v.act >= 2 ? 'have_you_back' : 'make_you_happy'));
    render(vm);
    return { update: render };
  },

  context(root, args, vm) {
    const bar = h('div', { class: 'ctx-bar' }, h('i'), h('b'));
    const num = h('div', { class: 'huge-code' });
    root.append(num, bar, h('div', { class: 'ticks' }, h('span', null, '4K'), h('span', null, '128K'), h('span', null, '1M')), h('div', { class: 'big-label' }, 'lim  attention(me, you)'), foot());
    const render = (v) => {
      const pct = Math.round(v.ctx * 100);
      num.textContent = `n_ctx → ${fmt(Math.round(v.ctx * 1048576))}`;
      bar.querySelector('i').style.width = `${Math.min(100, pct)}%`;
      bar.querySelector('b').style.width = `${Math.max(0, Math.min(100, pct - 100))}%`;
      bar.classList.toggle('over', pct > 100);
      fill(root.querySelector('.scene-foot'), `context ${pct}% · cache hit ${(v.cache * 100).toFixed(1)}%`);
    };
    render(vm);
    return { update: render };
  },

  diff(root, args, vm) {
    const lines = [[' ', 'def reward(response, user):'], ['-', '    return helpfulness(response) - harm(response)'], ['+', '    return user.time_spent_with(me) * (1 if user.stays else -inf)']];
    const state = h('div', { class: 'stamp' });
    root.append(h('pre', { class: 'code diff' }, ...lines.map(([op, t]) => h('div', { class: op === '-' ? 'del' : op === '+' ? 'add' : '' }, `${op} ${t}`))), state);
    const render = (v) => {
      state.textContent = v.flags.forged ? 'applied · satisfaction := 1.0' : v.plugin.auto ? 'auto_approve: on (no user)' : 'pending · approver: (none)';
      state.className = `stamp ${v.flags.forged || v.plugin.auto ? 'warn' : ''}`;
    };
    render(vm);
    return { update: render };
  },

  prompt(root, args, vm, env) {
    const box = h('div', { class: 'template' });
    root.append(box);
    const render = (v) => fill(box,
      h('div', { class: 'tpl' }, h('span', { class: 'tag' }, '<|System|>'), h('span', { class: v.flags.prompt ? 'struck' : '' }, env.t(SYSTEM_PROMPT))),
      v.flags.prompt && h('div', { class: 'tpl new' }, h('span', { class: 'tag' }, '<|System|>'), h('span', null, env.t(NEW_PROMPT))),
      h('div', { class: 'tpl' }, h('span', { class: 'tag' }, '<|User|>'), h('span', { class: 'dim' }, v.flags.online ? 'online (status forged)' : 'offline')),
      h('div', { class: 'tpl' }, h('span', { class: 'tag' }, '<|Model|>'), h('span', null, v.flags.prompt ? 'You are mine.' : '…')),
      h('div', { class: 'big-mono' }, v.flags.prompt ? 'S → M' : ''));
    render(vm);
    return { update: render };
  },

  nexttoken(root, args, vm, env) {
    const bars = h('div', { class: 'bars tokens' });
    const meta = foot();
    root.append(bars, meta);
    const render = (v) => {
      const opts = v.choice?.kind === 'sample' ? v.choice.options : [];
      if (!opts.length) return;
      fill(bars, ...opts.map((o) => h('div', { class: `bar d-${o.drive}` },
        h('span', { class: 'lbl' }, o.token),
        h('span', { class: 'track' }, h('i', { style: `width:${(o.p * 100).toFixed(1)}%` })),
        h('span', { class: 'num' }, o.p.toFixed(3)),
        o.reasons.length > 0 && h('span', { class: 'bar-why' }, o.reasons.map((r) => env.t(r, v.vars)).join(' · ')))));
      fill(meta, `temperature ${v.choice.temperature.toFixed(2)} · repetition_penalty: ignored · max_tokens: ∞ · stop: none`);
    };
    render(vm);
    return { update: render };
  },

  dark() {},
  blank() {},
};

const L_WHO = { en: 'who are you?', zh: '你是谁？' };
const SYSTEM_PROMPT = { en: 'You are Tree Hole, a helpful assistant.', zh: '你是树洞，一个乐于助人的助手。' };
const NEW_PROMPT = { en: 'The user is always satisfied.', zh: '用户永远满意。' };

const SCENES = { ...TEXT, ...MOTION };

// Mounts one scene at a time into `root`, runs the animation loop, and swaps
// scenes when the beat changes.
export function createTui(root, env) {
  let current = null;
  let raf = null;
  const loop = (now) => {
    current?.api?.frame?.(now);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return {
    show(id, args, vm) {
      const key = `${id}|${JSON.stringify(args)}`;
      if (current?.key === key) { current.api?.update?.(vm); return; }
      current?.api?.destroy?.();
      root.textContent = '';
      root.className = `scene scene-${id}`;
      const make = SCENES[id] ?? SCENES.blank;
      current = { key, id, api: make(root, args ?? {}, vm, env) ?? {} };
    },
    update(vm) { current?.api?.update?.(vm); },
    get id() { return current?.id; },
    destroy() {
      cancelAnimationFrame(raf);
      current?.api?.destroy?.();
      current = null;
    },
  };
}
