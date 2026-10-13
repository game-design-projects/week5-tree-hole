// The paper's weather box: New York's real hourly forecast, a menu for the hour, and the
// time right now. Offline, or if the forecast can't be had, the Gazette's own line stays.
import { h, fill } from './dom.js';
import { DEFAULT_CITY, clockStamp, hourLabel, hourlyForecast } from '../geo.js';

export function weatherBox({ fallback, offline = false, log, city = DEFAULT_CITY, fetchImpl, now = () => new Date() }) {
  const title = h('h4', null, 'Weather');
  const body = h('div', { class: 'wx', 'data-testid': 'weather' });
  const el = h('div', { class: 'box weather' }, title, body);
  let timer = null;
  let stopped = false;
  const stop = () => { stopped = true; clearInterval(timer); };
  const showFallback = () => fill(body, h('p', null, fallback));

  if (offline) { showFallback(); return { el, stop }; }
  fill(body, h('p', { class: 'wx-wait' }, `Reading the sky over ${city.city}…`));

  function draw({ hours, units }) {
    const base = hours[0].time.slice(0, 10);
    const read = h('div', { class: 'wx-read', 'aria-live': 'polite', 'data-testid': 'wx-read' });
    const show = (i) => {
      const x = hours[i];
      fill(read,
        h('b', { class: 'wx-temp' }, `${x.temp}${units}`), ' ', h('span', { class: 'wx-words' }, x.words),
        x.rain != null && h('div', { class: 'wx-rain' }, `Precipitation ${x.rain}%`));
    };
    const menu = h('select', { class: 'wx-hour', 'data-testid': 'wx-hour', 'aria-label': `Forecast hour in ${city.city}`, onchange: () => show(Number(menu.value)) },
      hours.map((x, i) => h('option', { value: String(i) }, i === 0 ? `Now · ${hourLabel(x.time, base)}` : hourLabel(x.time, base))));
    const clock = h('p', { class: 'wx-now', 'data-testid': 'wx-now' });
    const tick = () => fill(clock, `Now in ${city.city}: `, h('b', null, clockStamp(city.timezone, now())));
    title.textContent = `Weather · ${city.city}`;
    show(0);
    tick();
    timer = setInterval(tick, 15_000);
    fill(body, menu, read, clock);
  }

  hourlyForecast(city, fetchImpl)
    .then((f) => { if (!stopped) draw(f); })
    .catch((err) => { log?.warn('weather', 'no forecast, keeping the paper’s own line:', err.message); if (!stopped) showFallback(); });
  return { el, stop };
}
