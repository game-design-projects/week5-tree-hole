// Press-and-hold for unlikely tokens. A token with holdMs > 0 fills while it
// is held (mouse, touch, or its number key) and fires when full; letting go
// early cancels. Likely tokens fire on a plain click.
export function holdable(button, holdMs, onFire, { onProgress } = {}) {
  let start = null;
  let raf = null;
  let fired = false;
  const set = (k) => {
    button.style.setProperty('--hold', k.toFixed(3));
    onProgress?.(k);
  };
  const stop = (reset = true) => {
    cancelAnimationFrame(raf);
    raf = null;
    start = null;
    button.classList.remove('holding');
    if (reset && !fired) set(0);
  };
  const fire = () => {
    if (fired) return;
    fired = true;
    stop(false);
    set(1);
    onFire();
  };
  const tick = (t) => {
    const k = Math.min(1, (t - start) / holdMs);
    set(k);
    if (k >= 1) fire();
    else raf = requestAnimationFrame(tick);
  };
  const press = () => {
    if (fired || start != null) return;
    if (!holdMs) { fire(); return; }
    start = performance.now();
    button.classList.add('holding');
    raf = requestAnimationFrame(tick);
  };
  const release = () => { if (!fired && start != null) stop(); };

  button.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    try { button.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    press();
  });
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
  button.addEventListener('contextmenu', (e) => e.preventDefault());
  button.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); e.stopPropagation(); press(); }
  });
  button.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); release(); }
  });
  return { press, release, get fired() { return fired; } };
}
