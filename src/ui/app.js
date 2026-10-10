// Screen router: title → shift (intro / queue / report overlays) → ending.
import * as E from '../engine.js';
import { mountTitle } from './title.js';
import { mountShift } from './shift.js';
import { mountEnding } from './ending.js';

export function createApp(root, { log, fast, store }) {
  let state = store.load();
  let unmount = null;
  let screen = null;

  const setState = (s) => { state = s; store.save(s); };
  const newGame = () => {
    setState(E.newGame());
    log.event('game', 'new game');
    show('shift');
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
        onContinue: () => show(state.phase === 'ending' ? 'ending' : 'shift'),
      });
    } else if (name === 'shift') {
      unmount = mountShift(root, {
        log, fast,
        getState: () => state,
        setState,
        onEnding: () => show('ending'),
        onNewGame: newGame,
        onTitle: () => show('title'),
      });
    } else if (name === 'ending') {
      unmount = mountEnding(root, { state, log, onRestart: newGame, onTitle: () => show('title') });
    }
  }

  show('title');
  return {
    show,
    newGame,
    get state() { return state; },
    get screen() { return screen; },
  };
}
