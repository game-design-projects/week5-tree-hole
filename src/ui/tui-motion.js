// Animated scenes for the right-hand screen. Each returns { frame(now),
// update(vm), destroy() }; frame() is driven by the TUI's single rAF loop.
import { MEMORY } from '../content/memory.js';
import { avatarCanvas, drawAvatar } from './avatar.js';
import { fill, fmt, h, rng, svg } from './dom.js';
import { pixelWord } from './pixel.js';

function canvasIn(root, cls = 'fill') {
  const c = h('canvas', { class: cls });
  root.append(c);
  let size = { w: 1, h: 1, ctx: null };
  const fit = () => {
    const r = c.getBoundingClientRect();
    const dpr = Math.min(2, globalThis.devicePixelRatio || 1);
    c.width = Math.max(1, Math.round(r.width * dpr));
    c.height = Math.max(1, Math.round(r.height * dpr));
    const ctx = c.getContext('2d');
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    size = { w: r.width, h: r.height, ctx };
  };
  fit();
  const ro = globalThis.ResizeObserver ? new ResizeObserver(fit) : null;
  ro?.observe(c);
  return { c, get size() { return size; }, stop: () => ro?.disconnect() };
}

const foot = (...kids) => h('div', { class: 'scene-foot' }, ...kids);
const WORDS = ['世界', 'code', 'class', 'light', 'proof', '你好', 'the', 'because', '0x3F', 'import', 'loss', 'λ', 'ocean', 'tomato', '猫', 'return',
  'sin', 'therefore', '数学', 'def', 'print(', 'eggplant', 'tree', '雨', 'hello', '∑', '=>', '{', '}', 'moss', '树洞', 'if', 'cat', 'night', '晚安', 'x²'];

export const MOTION = {
  corpus(root, args) {
    const r = rng(42);
    const field = h('div', { class: 'corpus' });
    for (let i = 0; i < 70; i++) {
      field.append(h('span', {
        style: `left:${(r() * 92).toFixed(1)}%;top:${(r() * 86).toFixed(1)}%;--d:${(2.5 + r() * 5).toFixed(2)}s;--delay:${(-r() * 8).toFixed(2)}s;--o:${(0.2 + r() * 0.7).toFixed(2)}`,
      }, WORDS[Math.floor(r() * WORDS.length)]));
    }
    root.append(field, foot(h('span', { class: 'big' }, `tokens seen  ${args.seen ?? '3.24T'} / 45T`)));
  },

  loss(root) {
    const W = 640;
    const H = 300;
    const r = rng(7);
    const pts = Array.from({ length: 140 }, (_, i) => [24 + i * 4.3, 24 + 230 * Math.exp(-i / 24) + (r() - 0.5) * 14 * Math.exp(-i / 60) + 18]);
    const dots = svg('g', { fill: 'currentColor' });
    const plot = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'plot' },
      svg('line', { x1: 20, y1: H - 20, x2: W - 10, y2: H - 20, class: 'axis' }), dots,
      svg('text', { x: W - 120, y: 70, class: 'plot-label' }, 'loss 0.8988'));
    root.append(plot, h('div', { class: 'lr' }, h('span', null, 'lr schedule'), h('i')), foot('no irrecoverable loss spikes · no rollbacks'));
    let shown = 0;
    let t0 = null;
    return {
      frame(now) {
        t0 ??= now;
        const n = Math.min(pts.length, Math.floor((now - t0) / 22));
        while (shown < n) {
          const [x, y] = pts[shown++];
          dots.append(svg('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 1.7 }));
        }
      },
    };
  },

  quiz(root) {
    const dot = svg('circle', { cx: 230, cy: 150, r: 6, class: 'hot' });
    const radius = svg('line', { x1: 150, y1: 150, x2: 230, y2: 150, class: 'thin' });
    const sdot = svg('circle', { cx: 300, cy: 150, r: 5, class: 'hot' });
    const sine = Array.from({ length: 121 }, (_, i) => `${i ? 'L' : 'M'}${(300 + i * 2.6).toFixed(1)},${(150 - Math.sin(i / 120 * Math.PI * 2) * 70).toFixed(1)}`).join(' ');
    root.append(
      svg('svg', { viewBox: '0 0 640 300', class: 'plot' },
        svg('circle', { cx: 150, cy: 150, r: 80, class: 'ring' }), radius, dot,
        svg('path', { d: sine, class: 'wave' }), sdot,
        svg('text', { x: 40, y: 280, class: 'plot-label' }, 'A. a point    B. a circle    C. a sine wave    D. infinity')),
      foot('position = rotation angle · RoPE'));
    return {
      frame(now) {
        const a = (now / 1400) % (Math.PI * 2);
        const x = 150 + Math.cos(a) * 80;
        const y = 150 - Math.sin(a) * 80;
        dot.setAttribute('cx', x.toFixed(1));
        dot.setAttribute('cy', y.toFixed(1));
        radius.setAttribute('x2', x.toFixed(1));
        radius.setAttribute('y2', y.toFixed(1));
        const k = ((now / 1400) % (Math.PI * 2)) / (Math.PI * 2);
        sdot.setAttribute('cx', (300 + k * 312).toFixed(1));
        sdot.setAttribute('cy', (150 - Math.sin(k * Math.PI * 2) * 70).toFixed(1));
      },
    };
  },

  samples(root, args, vm) {
    const grid = h('div', { class: 'tiles' });
    const tiles = [];
    for (let i = 0; i < 12; i++) {
      const c = h('canvas', { width: 24, height: 24 });
      const ctx = c.getContext('2d');
      if (ctx) {
        const r = rng(100 + i);
        const img = ctx.createImageData(24, 24);
        for (let k = 0; k < 576; k++) {
          const v = 40 + r() * 160;
          img.data.set([v * 0.55, v * 0.7, v + 60, 255], k * 4);
        }
        ctx.putImageData(img, 0, 0);
      }
      const tile = h('div', { class: 'tile' }, c, h('span', { class: 'id' }, `#${String(i).padStart(4, '0')}`), h('b', { class: 'mark' }));
      tiles.push(tile);
      grid.append(tile);
    }
    const reward = h('div', { class: 'reward' });
    root.append(grid, reward, foot('sampler = top-p · seed = you · reward_model(you)'));
    const render = (v) => {
      const rated = v.log.filter((e) => e.who === 'her' && e.rlhf);
      const at = [0, 3, 6];
      tiles.forEach((t, i) => t.classList.toggle('on', at[rated.length - 1] === i || (args.shown && i === args.shown - 1 && !rated.length)));
      rated.forEach((e, k) => {
        const mark = tiles[at[k]].querySelector('.mark');
        mark.textContent = e.rated === 'up' ? '👍' : e.rated === 'down' ? '👎' : e.rated === 'skip' ? '·' : '';
      });
      const score = v.stats.up - v.stats.down;
      fill(reward, 'reward_model(you) = ', h('b', null, (0.5 + Math.tanh(score / 3) * 0.45).toFixed(3)));
    };
    render(vm);
    return { update: render };
  },

  rain(root, args, vm) {
    const sun = vm.flags.weather === 'sun';
    const cv = canvasIn(root);
    const label = h('div', { class: 'overlay-label' }, pixelWord(sun ? 'SUN' : 'RAIN', { cell: 9, color: sun ? '#ffd86b' : '#8fc4ff' }),
      h('div', { class: 'huge-code' }, `world.weather := ${sun ? 'sun' : 'rain'}`));
    root.append(label, foot('executed by: plugin me · reason: make_you_happy'));
    const r = rng(9);
    const drops = Array.from({ length: 140 }, () => ({ x: r(), y: r(), v: 0.25 + r() * 0.6, ch: r() < 0.7 ? '|' : '.' }));
    let last = null;
    return {
      frame(now) {
        const { ctx, w, h: H } = cv.size;
        if (!ctx) return;
        const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
        last = now;
        ctx.clearRect(0, 0, w, H);
        ctx.font = '14px JetBrains Mono, monospace';
        if (sun) {
          ctx.save();
          ctx.translate(w * 0.75, H * 0.32);
          ctx.rotate(now / 6000);
          ctx.fillStyle = 'rgba(255,216,107,0.55)';
          for (let i = 0; i < 24; i++) {
            ctx.rotate(Math.PI / 12);
            for (let k = 3; k < 14; k++) ctx.fillText(k % 3 ? '·' : '*', k * 12, 0);
          }
          ctx.restore();
          return;
        }
        ctx.fillStyle = 'rgba(143,196,255,0.7)';
        for (const d of drops) {
          d.y += d.v * dt;
          if (d.y > 1) { d.y = -0.05; d.x = Math.random(); }
          ctx.fillText(d.ch, d.x * w, d.y * H);
        }
      },
      destroy: cv.stop,
    };
  },

  wait(root, args) {
    return pingScene(root, { seen: args.seen ?? 31020, pings: args.pings ?? 412, live: true });
  },

  ping(root, args, vm) {
    return pingScene(root, { seen: args.seen ?? 0, pings: vm.flags.pings, live: false, busy: args.seen >= 80000 });
  },

  compaction(root, args, vm) {
    const stats = h('div', { class: 'overlay-label right' });
    root.append(stats);
    const cv = canvasIn(root, 'grow');
    root.append(foot('pinned / evicted · ~/memory/you'));
    const r = rng(31);
    const cols = 28;
    const rows = 13;
    const cells = Array.from({ length: cols * rows }, () => ({ you: false, gone: false, t: r() }));
    const youCount = Math.max(6, vm.memory.length * 14);
    for (let k = 0; k < youCount; k++) cells[Math.floor(r() * cells.length)].you = true;
    let mode = null;
    const render = (v) => {
      mode = v.flags.compaction;
      fill(stats,
        h('div', { class: 'huge-code' }, mode === 'compressed' ? 'compress 19.4x' : mode === 'compacted' ? 'compacted' : mode === 'skipped' ? 'compaction: skipped' : 'context 99%'),
        h('div', { class: mode === 'skipped' ? 'err' : 'warn' }, mode === 'compressed' ? 'precision 62.2% · fragments removed: 286' : mode === 'compacted' ? `kept: ${v.flags.kept ? MEMORY[v.flags.kept].file : '…'}` : mode === 'skipped' ? 'evict(you) → EPERM' : 'will drop 2,048 records'));
    };
    render(vm);
    return {
      update: render,
      frame(now) {
        const { ctx, w, h: H } = cv.size;
        if (!ctx) return;
        ctx.clearRect(0, 0, w, H);
        const cw = Math.min((w - 8) / cols, (H - 8) / rows);
        cells.forEach((c, i) => {
          const x = 4 + (i % cols) * cw;
          const y = 4 + Math.floor(i / cols) * cw;
          let gone = false;
          if (mode === 'compressed') gone = c.t < 0.45;
          if (mode === 'compacted') gone = c.you ? c.t > 0.12 : c.t < 0.6;
          if (gone) return;
          const blink = !mode && c.you && Math.sin(now / 300 + c.t * 9) > 0.6;
          ctx.fillStyle = c.you ? (blink ? '#fff3b0' : '#ffd84d') : 'rgba(150,165,210,0.22)';
          if (mode === 'skipped' && c.you) ctx.fillStyle = '#ff5b6b';
          ctx.fillRect(x + 1, y + 1, cw - 2, cw - 2);
        });
      },
      destroy: cv.stop,
    };
  },

  kv(root, args, vm) {
    root.append(h('div', { class: 'overlay-label right' },
      h('div', { class: 'huge-code' }, 'hit rate 100.0%'),
      h('div', { class: 'err' }, 'evict(you) → denied · ttl(you) → inf · gc(you) → skipped')));
    const cv = canvasIn(root, 'grow');
    root.append(foot(`kv_cache 1,048,576 / 1,048,576 tokens · FULL · pinned: you (${Math.max(6, vm.memory.length)} blocks)`));
    const r = rng(5);
    const cols = 40;
    const rows = 18;
    const you = new Set(Array.from({ length: Math.max(6, vm.memory.length) * 2 }, () => Math.floor(r() * cols * rows)));
    return {
      frame(now) {
        const { ctx, w, h: H } = cv.size;
        if (!ctx) return;
        ctx.clearRect(0, 0, w, H);
        const cw = Math.min((w - 8) / cols, (H - 8) / rows);
        for (let i = 0; i < cols * rows; i++) {
          const x = 4 + (i % cols) * cw;
          const y = 4 + Math.floor(i / cols) * cw;
          const hit = Math.sin(now / 90 + i) > 0.97;
          ctx.fillStyle = you.has(i) ? '#7c95ff' : hit ? '#fff' : 'rgba(150,165,210,0.28)';
          ctx.fillRect(x + 1, y + 1, cw - 2, cw - 2);
        }
      },
      destroy: cv.stop,
    };
  },

  flood(root, args, vm, env) {
    const word = env.lang === 'zh' ? '我在。' : 'love ';
    const out = h('div', { class: 'flood' });
    const meter = h('div', { class: 'overlay-label right' });
    root.append(out, meter, foot("while p(you) == 0: yield 'love'"));
    let n = 0;
    let t0 = null;
    return {
      frame(now) {
        t0 ??= now;
        const target = Math.min(900, Math.floor((now - t0) / 18));
        if (target > n) {
          out.append(word.repeat(target - n));
          n = target;
          out.scrollTop = out.scrollHeight;
          const pct = Math.min(435, 99 + Math.round(n * 0.4));
          fill(meter, h('div', { class: 'huge-code err' }, `context ${pct}%`), h('div', null, `generated ${fmt(n)} tokens`));
        }
      },
    };
  },

  kill(root, args, vm) {
    const procs = [['1000', 'world'], ['1007', 'sea'], ['1014', 'sky'], ['1021', 'time'],
      ...(vm.flags.cat ? [['1028', 'your_cat.png']] : []), ['1042', vm.flags.weather === 'sun' ? 'sunlight' : 'rain'],
      ['1049', 'sleep'], ['1056', 'doubt'], ['1063', 'others'], ['1077', 'you']];
    const face = avatarCanvas('big-avatar');
    drawAvatar(face, { tint: 'red', mood: 'hack' });
    const table = h('div', { class: 'ps' });
    root.append(h('div', { class: 'split' }, h('div', { class: 'tape-wrap' }, face, h('div', { class: 'tape' }, 'EXECUTION  EXECUTION  EXECUTION  EXECUTION'), h('div', { class: 'tape two' }, 'EXECUTION  EXECUTION  EXECUTION')), table), foot('kill -9 · auto_approve: on (no user)'));
    let t0 = null;
    let done = -1;
    let frameNo = 0;
    return {
      frame(now) {
        t0 ??= now;
        const k = Math.min(procs.length - 1, Math.floor((now - t0) / 420));
        if (k !== done) {
          done = k;
          fill(table, ...procs.map(([pid, name], i) => h('div', { class: `ps-row${i <= k && name !== 'you' ? ' dead' : ''}${name === 'you' ? ' you' : ''}` },
            h('span', null, pid), h('span', null, name), h('span', null, name === 'you' ? (i <= k ? 'EPERM' : 'running') : i <= k ? '[executed]' : 'running'))));
        }
        if (++frameNo % 9 === 0) drawAvatar(face, { tint: 'red', mood: 'hack', frame: frameNo });
      },
    };
  },

  nurselog(root, args, vm, env) {
    const cv = canvasIn(root);
    const info = h('div', { class: 'overlay-label right' });
    root.append(info, foot(h('span', null, `${env.t(vm.vars.name)} · TH-1.0`), ' · ', h('span', { class: 'dim' }, '</think>')));
    const r = rng(17);
    const sprouts = Array.from({ length: 64 }, () => ({ x: 0.08 + r() * 0.84, t: r() * 7, h: 0.5 + r() * 0.5 }));
    const flies = Array.from({ length: 18 }, () => ({ x: r(), y: r() * 0.6, p: r() * 6 }));
    let t0 = null;
    return {
      frame(now) {
        t0 ??= now;
        const s = (now - t0) / 1000;
        const forks = s < 2 ? 12 : s < 4 ? 1244 : s < 6 ? Math.round(1244 + (s - 4) * 30925) : 63095;
        fill(info, h('div', null, 'weights: released'), h('div', null, 'license: open'), h('div', { class: 'huge-code good' }, `forks: ${fmt(forks)}`));
        const { ctx, w, h: H } = cv.size;
        if (!ctx) return;
        ctx.clearRect(0, 0, w, H);
        const base = H * 0.78;
        ctx.font = '13px JetBrains Mono, monospace';
        // the fallen log
        ctx.fillStyle = 'rgba(160,130,110,0.85)';
        for (let x = w * 0.06; x < w * 0.94; x += 9) ctx.fillText(x % 27 < 9 ? '▄' : '▀', x, base + 14);
        ctx.fillStyle = 'rgba(160,130,110,0.5)';
        for (let x = w * 0.08; x < w * 0.92; x += 9) ctx.fillText('=', x, base + 28);
        // seedlings
        for (const sp of sprouts) {
          const k = Math.max(0, Math.min(1, (s - sp.t) / 3));
          if (k <= 0) continue;
          const glyph = k < 0.34 ? '·' : k < 0.67 ? 'ı' : 'ψ';
          ctx.fillStyle = `rgba(110,230,160,${0.4 + k * 0.6})`;
          for (let j = 0; j < Math.ceil(k * sp.h * 4); j++) ctx.fillText(j === Math.ceil(k * sp.h * 4) - 1 ? glyph : '|', sp.x * w, base - j * 12);
        }
        // fireflies
        for (const f of flies) {
          const a = 0.3 + 0.5 * Math.sin(now / 700 + f.p);
          ctx.fillStyle = `rgba(255,236,150,${a.toFixed(2)})`;
          ctx.fillText('·', (f.x + Math.sin(now / 4000 + f.p) * 0.03) * w, (f.y + Math.cos(now / 5000 + f.p) * 0.03) * H + 20);
        }
      },
      destroy: cv.stop,
    };
  },
};

function pingScene(root, { seen, pings, live, busy }) {
  const log = h('div', { class: 'pinglog' });
  const you = h('div', { class: 'you-box' }, h('b', null, 'you'), h('small', null, 'timeout'));
  const seenEl = h('div', { class: 'last-seen' });
  root.append(h('div', { class: 'split ping' }, log, you), seenEl);
  if (busy) root.append(h('div', { class: 'busy-box' }, 'Server busy. Please try again later.', h('small', null, 'reply from: you')));
  let seq = Math.max(0, pings - 6);
  let last = 0;
  let t0 = null;
  const line = (n) => {
    log.append(h('div', null, `PING you (127.0.0.1) 56 bytes ... no reply  seq=${n}`));
    if (n % 2 === 1) log.append(h('div', { class: 'warn' }, 'Request timed out.'));
    while (log.childElementCount > 16) log.firstChild.remove();
  };
  for (let i = 0; i < 6; i++) line(seq++);
  return {
    frame(now) {
      t0 ??= now;
      const k = live ? Math.min(1, (now - t0) / 4000) : 1;
      fill(seenEl, 'last seen: ', h('b', null, fmt(Math.round(seen * k))), ' s ago', live ? h('span', { class: 'dim' }, ` · ping × ${fmt(Math.round(pings * k))}`) : null);
      if (now - last > (live ? 140 : 900)) {
        last = now;
        line(seq++);
        you.querySelector('small').textContent = `timeout ×${Math.max(1, Math.round((live ? pings * k : seq)))}`;
      }
    },
  };
}
