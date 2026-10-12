// Screen router: title → going live (deploy log + test session) → play (night intro /
// sessions / morning) → ending. Settings open over any screen.
// `forceEnding` (?ending=good-all …) previews an ending without playing to it.
import * as E from '../engine.js';
import { mountTitle } from './title.js';
import { mountBoot } from './boot.js';
import { mountPlay } from './play.js';
import { mountEnding } from './ending.js';
import { openSettings } from './settings.js';

export function createApp(root, { log, fast, store, llm, offline = false, boot = true, forceEnding = null }) {
  let state = forceEnding ? E.previewState(forceEnding) : store.load();
  let unmount = null;
  let screen = null;
  let play = null;

  const setState = (s) => { state = s; store.save(s); };
  const settings = () => openSettings(root, { log, offline, onClose: () => play?.rerender() });
  const newGame = () => {
    setState(E.newGame(Math.floor(Math.random() * 2 ** 31)));
    log.event('game', 'new game', { llm: Boolean(llm?.up) });
    show(boot ? 'boot' : 'play');
  };

  function show(name) {
    unmount?.();
    unmount = null;
    play = null;
    root.textContent = '';
    screen = name;
    log.info('screen', name);
    if (name === 'title') {
      unmount = mountTitle(root, {
        save: state,
        onStart: newGame,
        onContinue: () => show(state.phase === 'ending' ? 'ending' : 'play'),
        onSettings: settings,
      });
    } else if (name === 'boot') {
      unmount = mountBoot(root, { log, fast, llm, offline, onDone: () => show('play') });
    } else if (name === 'play') {
      play = mountPlay(root, {
        log, fast, llm,
        getState: () => state,
        setState,
        onEnding: () => show('ending'),
        onNewGame: newGame,
        onTitle: () => show('title'),
        onSettings: settings,
      });
      unmount = play.unmount;
    } else if (name === 'ending') {
      unmount = mountEnding(root, { state: state ?? E.newGame(), log, fast, onRestart: newGame, onTitle: () => show('title') });
    }
  }

  show(forceEnding ? 'ending' : 'title');
  return {
    show,
    newGame,
    get state() { return state; },
    get screen() { return screen; },
  };
}
