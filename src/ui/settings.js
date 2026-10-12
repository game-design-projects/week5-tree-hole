// Settings: one thing for now, the city used for the test session's time and
// weather. Left empty, the city comes from the connection (city precision) or
// defaults to New York.
import { h, fill } from './dom.js';
import { DEFAULT_CITY, loadSettings, saveSettings, searchCities } from '../geo.js';

export function openSettings(root, { log, offline = false, onClose }) {
  let settings = loadSettings();
  let results = [];
  let status = '';
  let timer = null;
  let seq = 0;

  const input = h('input', { type: 'search', class: 'city-input', 'data-testid': 'city-input', placeholder: 'Search for a city', 'aria-label': 'City', autocomplete: 'off' });
  const list = h('ul', { class: 'city-results', 'data-testid': 'city-results' });
  const current = h('p', { class: 'city-current', 'data-testid': 'city-current' });
  const note = h('p', { class: 'small-print' });

  const close = () => {
    clearTimeout(timer);
    document.removeEventListener('keydown', onKey, true);
    box.remove();
    onClose?.();
  };

  function draw() {
    const c = settings.city;
    fill(current, c ? `${c.city}${c.region ? `, ${c.region}` : ''}${c.country ? ` · ${c.country}` : ''}` : `From your connection (or ${DEFAULT_CITY.city} if unknown)`);
    fill(list, results.map((r) => h('li', null, h('button', {
      class: 'city-pick', 'data-testid': 'city-pick',
      onclick: () => {
        settings = { ...settings, city: r };
        saveSettings(settings);
        log.event('settings', 'city set');
        results = [];
        input.value = '';
        draw();
      },
    }, h('b', null, r.city), h('span', null, [r.region, r.country].filter(Boolean).join(', '))))));
    fill(note, status);
  }

  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value;
    if (offline) { status = 'City search needs a connection.'; draw(); return; }
    timer = setTimeout(async () => {
      const mine = ++seq;
      try {
        const found = await searchCities(q);
        if (mine !== seq) return;
        results = found;
        status = q.trim().length >= 2 && !found.length ? 'No city by that name.' : '';
      } catch (err) {
        log.warn('settings', 'city search failed:', err.message);
        status = 'City search is unavailable right now.';
      }
      draw();
    }, 250);
  });

  const box = h('div', { class: 'overlay settings', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Settings', 'data-testid': 'settings' },
    h('div', { class: 'card' },
      h('div', { class: 'eyebrow' }, 'Settings'),
      h('h2', null, 'Where are you?'),
      h('p', { class: 'lede' }, 'Used once, for the time and weather in the test session before the service goes live. Only the city is used, and it stays in this browser.'),
      h('section', null,
        h('h3', null, 'City'),
        current,
        input,
        list,
        note,
        h('button', {
          class: 'btn ghost small', 'data-testid': 'city-reset',
          onclick: () => { settings = { ...settings }; delete settings.city; saveSettings(settings); draw(); },
        }, 'Use my connection’s city')),
      h('div', { class: 'go' }, h('button', { class: 'btn primary', 'data-testid': 'settings-close', onclick: close }, 'Done'))));

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
  }
  document.addEventListener('keydown', onKey, true);
  root.append(box);
  draw();
  input.focus();
  return close;
}
