// Local save in localStorage. Every access is guarded: private windows,
// blocked storage or a corrupt save must never break the game.
import { SAVE_KEY } from './config.js';

export function createStore(log, storage = globalThis.localStorage) {
  return {
    load() {
      try {
        const raw = storage?.getItem(SAVE_KEY);
        if (!raw) return null;
        const s = JSON.parse(raw);
        if (s?.v !== 1 || typeof s.day !== 'number') throw new Error('incompatible save');
        log.info('save', 'loaded', { day: s.day, phase: s.phase });
        return s;
      } catch (err) {
        log.warn('save', 'could not load save:', err.message);
        return null;
      }
    },
    save(s) {
      try { storage?.setItem(SAVE_KEY, JSON.stringify(s)); } catch (err) { log.warn('save', 'could not save:', err.message); }
    },
    clear() {
      try { storage?.removeItem(SAVE_KEY); } catch (err) { log.warn('save', 'could not clear save:', err.message); }
    },
  };
}
