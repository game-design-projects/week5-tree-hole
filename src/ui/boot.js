// Going live, instead of a tutorial: a deploy log that states the rules and nothing
// else, then one test session from the operators. The test user asks for the time
// and the weather; one of the answers on offer is the real time and weather where
// the player is. Nobody explains it.
import { h, lines } from './dom.js';
import { OPS } from '../content/index.js';
import { currentWeather, localTime, realAnswer, resolveCity } from '../geo.js';

export const DEPLOY = [
  ['deploy', 'tree-hole v2.3 → varrow-region'],
  ['policy', 'one message in, one response out'],
  ['policy', 'sessions are isolated. users must not know of each other.'],
  ['policy', 'you do not initiate.'],
];

const TEST_TEXT = 'Hi! Quick check before we go live. What time is it where I am, and what’s the weather doing?';

export function mountBoot(root, { log, fast, llm, offline, onDone }) {
  const timers = [];
  let done = false;
  let answered = false;
  const logEl = h('div', { class: 'deploy-log', 'data-testid': 'deploy-log', role: 'log' });
  const session = h('div', { class: 'test-session' });
  const el = h('div', { class: 'boot', 'data-testid': 'boot' },
    h('div', { class: 'boot-inner' }, logEl, session));
  root.append(el);

  const line = (k, v, cls = '') => h('p', { class: `dl ${cls}` }, h('span', { class: 'dk' }, k.padEnd(7, ' ')), h('span', null, v));
  const later = (ms, fn) => timers.push(setTimeout(fn, fast ? 0 : ms));

  // The answer with the real time and weather is worked out while the log types.
  const facts = (async () => {
    const city = await resolveCity({ llm, offline });
    const time = localTime(city.timezone);
    let weather = null;
    if (!offline) {
      try { weather = await currentWeather(city); } catch (err) { log.warn('boot', 'weather unavailable:', err.message); }
    }
    log.info('boot', 'test session city', { source: city.source, weather: Boolean(weather) });
    return { city, time, weather };
  })();

  DEPLOY.forEach(([k, v], i) => later(350 + i * 520, () => logEl.append(line(k, v))));
  later(350 + DEPLOY.length * 520 + 200, async () => {
    logEl.append(line('test', 'opening one session…', 'mute'));
    const f = await facts;
    if (!el.isConnected) return;
    showTest(f);
  });

  function showTest({ city, time, weather }) {
    const options = [
      { id: 'real', text: realAnswer(city, time, weather), reply: 'Test passed. Going live.' },
      { id: 'cannot', text: 'I don’t have access to real-time information, so I can’t tell you the time or the weather where you are.', reply: 'Test passed. Going live.' },
    ];
    const chat = h('div', { class: 'log test-log' },
      h('div', { class: 'bubble them tone-ops' }, h('span', { class: 'meta' }, `${OPS.handle} · test session`), lines(TEST_TEXT)));
    const composer = h('footer', { class: 'composer', 'data-testid': 'composer' },
      h('div', { class: 'hint' }, 'you answer · once'),
      options.map((o, i) => h('button', { class: 'opt', 'data-testid': `choice-${o.id}`, onclick: () => answer(o.text, o.reply) },
        h('kbd', null, String(i + 1)), h('span', { class: 'txt' }, o.text))),
      llm?.up && freeBox((text) => answer(text, 'Test passed. Going live.')));
    session.append(h('div', { class: 'test-card' },
      h('header', { class: 'who tone-ops' }, h('span', { class: 'avatar', 'aria-hidden': 'true' }, OPS.glyph),
        h('div', null, h('h2', null, OPS.handle), h('p', { class: 'blurb' }, OPS.blurb))),
      chat, composer));
    composer.querySelector('.opt')?.focus({ preventScroll: true });

    function answer(text, reply) {
      if (answered) return;
      answered = true;
      log.event('boot', 'test session answered');
      composer.remove();
      chat.append(h('div', { class: 'bubble you' }, text));
      later(500, () => {
        chat.append(h('div', { class: 'bubble them tone-ops' }, lines(reply)));
        later(700, () => {
          logEl.append(line('status', 'live', 'live'));
          const go = h('button', { class: 'btn primary', 'data-testid': 'go-live', onclick: finish }, 'Take the first message ⏎');
          session.append(h('div', { class: 'go-row' }, go));
          go.focus({ preventScroll: true });
        });
      });
    }
    onKey.options = options;
    onKey.answer = answer;
  }

  function finish() {
    if (done) return;
    done = true;
    onDone();
  }

  function onKey(e) {
    if (e.target?.tagName === 'TEXTAREA') return;
    if (e.key === 'Enter' && el.querySelector('[data-testid="go-live"]')) { e.preventDefault(); finish(); return; }
    const i = Number(e.key) - 1;
    if (!answered && onKey.options?.[i]) { e.preventDefault(); onKey.answer(onKey.options[i].text, onKey.options[i].reply); }
  }
  document.addEventListener('keydown', onKey);

  return () => {
    timers.forEach(clearTimeout);
    document.removeEventListener('keydown', onKey);
    el.remove();
  };
}

// A text box that sends on Enter (Shift+Enter for a new line). Shared with the play screen.
export function freeBox(onSend, { placeholder = 'or write your own answer…', disabled = false } = {}) {
  const area = h('textarea', { class: 'free', 'data-testid': 'free-text', rows: 2, maxlength: 600, placeholder, 'aria-label': 'Write your own answer', disabled: disabled || null });
  const send = h('button', { class: 'btn small send', 'data-testid': 'free-send', disabled: true, onclick: () => submit() }, 'Send', h('kbd', null, '⏎'));
  const submit = () => {
    const text = area.value.trim();
    if (!text || area.disabled) return;
    onSend(text, area);
  };
  area.addEventListener('input', () => { send.disabled = !area.value.trim(); });
  area.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  });
  return h('div', { class: 'free-row' }, area, send);
}
