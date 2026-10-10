// Screen router (title → play → ending), preferences, play time and the
// memory of finished runs. Play time counts only while the play screen is
// visible; it is folded into the saved state on every choice.
import * as E from '../engine.js';
import { detectLang } from '../i18n.js';
import { createSfx } from './sfx.js';
import { mountEnding } from './ending.js';
import { mountPlay } from './play.js';
import { mountTitle } from './title.js';

export function createApp(root, { log, fast, holdScale, store, forceLang }) {
  const prefs = store.prefs();
  let lang = forceLang ?? prefs.lang ?? detectLang();
  const sfx = createSfx(log, { on: prefs.sound !== false });
  let state = store.load();
  const savedAt = store.savedAt();
  let screen = null;
  let unmount = null;
  let play = null;

  // Play-time clock.
  let since = null;
  let acc = 0;
  const running = () => screen === 'play' && !document.hidden;
  const tick = () => {
    if (since != null) acc += performance.now() - since;
    since = running() ? performance.now() : null;
  };
  document.addEventListener('visibilitychange', tick);
  const elapsed = () => (state?.elapsedMs ?? 0) + acc + (since != null ? performance.now() - since : 0);

  const savePrefs = () => store.setPrefs({ lang, sound: sfx.on });
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

  const api = {
    log,
    sfx,
    fast,
    holdScale,
    vm: null,
    awaySeconds: savedAt ? (Date.now() - savedAt) / 1000 : 0,
    getState: () => state,
    setState(next) {
      tick();
      const total = elapsed();
      acc = 0;
      since = running() ? performance.now() : null;
      state = E.addTime(next, total - next.elapsedMs);
      store.save(state);
    },
    lang: () => lang,
    setLang(next) {
      lang = next;
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
      savePrefs();
      log.event('lang', lang);
      if (screen === 'play') play?.relang();
      else show(screen);
    },
    toggleSound() {
      sfx.set(!sfx.on);
      savePrefs();
      if (sfx.on) sfx.unlock();
    },
    elapsed,
    onEnding: () => show('ending'),
    onTitle: () => show('title'),
    onNewGame: () => newGame(),
  };

  function newGame() {
    sfx.unlock();
    state = E.newGame({ prev: store.runs() });
    acc = 0;
    since = null;
    store.save(state);
    log.event('game', 'new game', { prev: state.prev.length });
    show('play');
  }

  function show(name) {
    tick();
    unmount?.();
    unmount = null;
    play = null;
    root.textContent = '';
    screen = name;
    tick();
    log.info('screen', name);
    if (name === 'title') {
      unmount = mountTitle(root, {
        save: state,
        runs: store.runs(),
        lang,
        fast,
        sound: sfx.on,
        onStart: newGame,
        onContinue: () => { sfx.unlock(); show(state.phase === 'ending' ? 'ending' : 'play'); },
        onEnding: () => show('ending'),
        onLang: () => api.setLang(lang === 'en' ? 'zh' : 'en'),
        onSound: () => { api.toggleSound(); show('title'); },
      });
    } else if (name === 'play') {
      play = mountPlay(root, api);
      unmount = () => play.destroy();
      api.awaySeconds = 0;
    } else if (name === 'ending') {
      if (!state.recorded) {
        store.addRun(E.runSummary(state));
        state = { ...state, recorded: true };
        store.save(state);
      }
      unmount = mountEnding(root, { state, lang, log, onRestart: newGame, onTitle: () => show('title') });
    }
  }

  show('title');
  return {
    show,
    newGame,
    get state() { return state; },
    get screen() { return screen; },
    get lang() { return lang; },
    setLang: api.setLang,
    api,
  };
}
