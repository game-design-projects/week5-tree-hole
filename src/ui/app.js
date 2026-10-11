// Screen router: title → play (night intro / threads / night end) → ending.
// `forceEnding` (?ending=1…6) previews an ending screen without playing to it.
import * as E from '../engine.js';
import { mountTitle } from './title.js';
import { mountPlay } from './play.js';
import { mountEnding } from './ending.js';

export function createApp(root, { log, fast, store, forceEnding = null }) {
  let state = forceEnding ? E.previewState(forceEnding) : store.load();
  let unmount = null;
  let screen = null;

  const setState = (s) => { state = s; store.save(s); };
  const newGame = () => {
    setState(E.newGame());
    log.event('game', 'new game');
    show('play');
  };

  function show(name) {
    unmount?.();
    unmount = null;
    root.textContent = '';
    screen = name;
    log.info('screen', name);
    if (name === 'title') {
      unmount = mountTitle(root, {
        save: state,
        onStart: newGame,
        onContinue: () => show(state.phase === 'ending' ? 'ending' : 'play'),
      });
    } else if (name === 'play') {
      unmount = mountPlay(root, {
        log, fast,
        getState: () => state,
        setState,
        onEnding: () => show('ending'),
        onNewGame: newGame,
        onTitle: () => show('title'),
      });
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
