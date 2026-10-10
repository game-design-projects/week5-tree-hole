// Small synthesized sounds (WebAudio, no files). The context is created on the
// first sound after a user gesture; when sound is off nothing is created.
export function createSfx(log, { on = true } = {}) {
  let ctx = null;
  let master = null;
  let enabled = on;

  const ensure = () => {
    if (!enabled) return null;
    try {
      if (!ctx) {
        const AC = globalThis.AudioContext ?? globalThis.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.16;
        master.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      return ctx;
    } catch (err) {
      log?.warn('sfx', 'audio unavailable:', err.message);
      enabled = false;
      return null;
    }
  };

  const tone = (freq, dur, { type = 'sine', vol = 0.4, at = 0, slide = 0 } = {}) => {
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime + at;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(master);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  };

  let lastTick = 0;
  return {
    get on() { return enabled; },
    set(v) {
      enabled = Boolean(v);
      if (!enabled && ctx) ctx.suspend().catch(() => {});
    },
    unlock() { ensure(); },
    tick() {
      const now = performance.now();
      if (now - lastTick < 45) return;
      lastTick = now;
      tone(1700 + (now % 400), 0.022, { type: 'square', vol: 0.05 });
    },
    send() { tone(660, 0.06, { vol: 0.22 }); tone(990, 0.08, { vol: 0.18, at: 0.05 }); },
    up() { tone(784, 0.12, { vol: 0.28 }); tone(1175, 0.2, { vol: 0.26, at: 0.08 }); },
    down() { tone(392, 0.18, { vol: 0.26, slide: -140 }); },
    write() { tone(1046, 0.05, { type: 'triangle', vol: 0.14 }); tone(1568, 0.05, { type: 'triangle', vol: 0.1, at: 0.04 }); },
    ping() { tone(1320, 0.32, { vol: 0.22 }); tone(1320, 0.28, { vol: 0.07, at: 0.36 }); },
    error() { tone(98, 0.28, { type: 'square', vol: 0.14 }); },
    hold(k) { tone(180 + k * 720, 0.045, { type: 'triangle', vol: 0.05 }); },
    card() { tone(110, 1.2, { vol: 0.2 }); tone(165, 1.2, { vol: 0.12, at: 0.05 }); },
    chime() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 1.4, { vol: 0.16, at: i * 0.14 })); },
  };
}
