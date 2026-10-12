// A short spotlight tutorial, shown the first time night 1 begins: each step dims
// the screen and highlights one real part of the interface (threads, time, map,
// answers, Context Window, cards). A step whose target is not on screen (the
// phone layout hides panes behind tabs) is shown as a plain centred card.
import { h } from './dom.js';

const SEEN_KEY = 'tree-hole-tutorial-v1';

export function tutorialSeen() {
  try { return globalThis.localStorage?.getItem(SEEN_KEY) === '1'; } catch { return false; }
}
function markSeen() {
  try { globalThis.localStorage?.setItem(SEEN_KEY, '1'); } catch { /* storage may be blocked */ }
}

export const STEPS = [
  {
    id: 'welcome', title: 'You are the model',
    text: 'Six people in a river town will write to you tonight. You can see nothing except what they type. What you say, and what you pass between them, is the only way you can help.',
  },
  {
    id: 'threads', target: '.rail .qlist', title: 'Threads',
    text: 'Everyone who writes to you gets a thread here. Click one to open it; “new” means they are waiting. You choose who to answer first, and people only appear once they have written.',
  },
  {
    id: 'time', target: '.clock', title: 'Time',
    text: 'The night runs from 22:00 to 06:00. Every answer costs time, and some messages expire; they say “answer by …”. You will not be able to answer everyone.',
  },
  {
    id: 'map', target: '.mapbox', title: 'The map',
    text: 'Only people who have written to you are on the map. Hover over a dot to see who it is. The glow shows how far the illness has spread there, and a red dot is someone who has gone.',
  },
  {
    id: 'answers', target: '.composer', title: 'Answers',
    text: 'Pick an answer with 1, 2 or 3. They can look alike, but small differences change what the person tells you next. A conversation can take a few turns.',
  },
  {
    id: 'context', target: '.context', title: 'The Context Window',
    text: 'Everything you learn becomes a card, grouped by who told you. “Signs” collects what the illness looks like and who has shown it. Nothing connects the cards but you.',
  },
  {
    id: 'cards', target: '[data-testid="attach"]', title: 'Carrying a card',
    text: 'Press C, or this button, to attach a card to your answer and give it to the person you are talking to. Facts only travel between people when you carry them. The button turns gold when you hold a card this person would care about.',
  },
];

// Show the tutorial inside `root`. `onDone` runs when it finishes or is skipped.
export function startTutorial(root, { onDone, steps = STEPS } = {}) {
  let i = 0;
  const box = h('div', { class: 'tut', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Tutorial', 'data-testid': 'tutorial' });
  root.append(box);

  const finish = () => {
    markSeen();
    cleanup();
    onDone?.();
  };
  const next = () => { if (i >= steps.length - 1) finish(); else { i += 1; draw(); } };
  const back = () => { if (i > 0) { i -= 1; draw(); } };

  function draw() {
    const step = steps[i];
    const target = step.target ? document.querySelector(step.target) : null;
    const r = target?.getBoundingClientRect();
    const visible = r && r.width > 4 && r.height > 4;
    if (visible) target.scrollIntoView?.({ block: 'nearest' });
    const rect = visible ? target.getBoundingClientRect() : null;
    const card = h('div', { class: 'tut-card' },
      h('div', { class: 'tut-step' }, `${i + 1} of ${steps.length}`),
      h('h3', null, step.title),
      h('p', null, step.text),
      h('div', { class: 'tut-actions' },
        h('button', { class: 'btn ghost small', 'data-testid': 'tut-skip', onclick: finish }, 'Skip tutorial'),
        i > 0 && h('button', { class: 'btn ghost small', onclick: back }, 'Back'),
        h('button', { class: 'btn primary small', 'data-testid': 'tut-next', onclick: next }, i === steps.length - 1 ? 'Start' : 'Next', h('kbd', null, '⏎'))));
    box.textContent = '';
    box.dataset.step = step.id;
    if (rect) {
      box.append(h('div', {
        class: 'tut-spot',
        style: `left:${rect.left - 6}px;top:${rect.top - 6}px;width:${rect.width + 12}px;height:${rect.height + 12}px`,
      }));
    } else {
      box.append(h('div', { class: 'tut-dim' }));
    }
    box.append(card);
    place(card, rect);
    card.querySelector('.btn.primary')?.focus({ preventScroll: true });
  }

  // Put the card beside the highlighted area (right, left, below, above), else centred.
  function place(card, rect) {
    const vw = innerWidth;
    const vh = innerHeight;
    const cw = Math.min(340, vw - 24);
    card.style.width = `${cw}px`;
    const ch = card.offsetHeight;
    let x = (vw - cw) / 2;
    let y = (vh - ch) / 2;
    if (rect) {
      const gap = 16;
      if (rect.right + gap + cw <= vw) { x = rect.right + gap; y = rect.top; }
      else if (rect.left - gap - cw >= 0) { x = rect.left - gap - cw; y = rect.top; }
      else if (rect.bottom + gap + ch <= vh) { x = Math.max(12, Math.min(vw - cw - 12, rect.left)); y = rect.bottom + gap; }
      else { x = Math.max(12, Math.min(vw - cw - 12, rect.left)); y = Math.max(12, rect.top - gap - ch); }
      y = Math.max(12, Math.min(vh - ch - 12, y));
    }
    card.style.left = `${x}px`;
    card.style.top = `${y}px`;
  }

  // Capture keys so the game underneath never sees them while the tutorial is up.
  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); e.stopImmediatePropagation(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopImmediatePropagation(); back(); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); finish(); }
    else e.stopImmediatePropagation();
  };
  const onResize = () => draw();
  document.addEventListener('keydown', onKey, true);
  addEventListener('resize', onResize);
  function cleanup() {
    document.removeEventListener('keydown', onKey, true);
    removeEventListener('resize', onResize);
    box.remove();
  }

  draw();
  return cleanup;
}
