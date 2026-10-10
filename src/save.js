// Local persistence in localStorage: the current run, the player's preferences
// and a short list of finished runs (the next run's prologue remembers them).
// Every access is guarded: private windows, blocked storage or a corrupt save
// must never break the game.
import { PREFS_KEY, RUNS_KEY, SAVE_KEY } from './config.js';

export function createStore(log, storage = globalThis.localStorage) {
  const read = (key) => {
    try {
      const raw = storage?.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      log.warn('save', `could not read ${key}:`, err.message);
      return null;
    }
  };
  const write = (key, value) => {
    try { storage?.setItem(key, JSON.stringify(value)); } catch (err) { log.warn('save', `could not write ${key}:`, err.message); }
  };
  return {
    load() {
      const s = read(SAVE_KEY);
      if (!s) return null;
      if (s.v !== 2 || typeof s.beat !== 'string' || !Array.isArray(s.log)) {
        log.warn('save', 'ignoring an incompatible save');
        return null;
      }
      log.info('save', 'loaded', { beat: s.beat, phase: s.phase, entries: s.log.length });
      return s;
    },
    save(s) { write(SAVE_KEY, { ...s, savedAt: Date.now() }); },
    clear() {
      try { storage?.removeItem(SAVE_KEY); } catch (err) { log.warn('save', 'could not clear save:', err.message); }
    },
    savedAt() { return read(SAVE_KEY)?.savedAt ?? null; },
    prefs() { return read(PREFS_KEY) ?? {}; },
    setPrefs(p) { write(PREFS_KEY, p); },
    runs() { const r = read(RUNS_KEY); return Array.isArray(r) ? r : []; },
    addRun(run) { write(RUNS_KEY, [run, ...this.runs()].slice(0, 5)); },
  };
}
