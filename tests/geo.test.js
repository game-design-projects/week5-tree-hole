import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CITY, clockStamp, hourLabel, hourlyForecast, parseHourly } from '../src/geo.js';

// Unit tests never reach the network.
const realFetch = globalThis.fetch;
test.before(() => { globalThis.fetch = async (url) => { throw new Error(`real network call in a unit test: ${url}`); }; });
test.after(() => { globalThis.fetch = realFetch; });

// 48 hours from midnight of 12 Oct, New York local time (what Open-Meteo returns with timezone=America/New_York).
const hours = (day, n = 24) => Array.from({ length: n }, (_, i) => `2026-10-${day}T${String(i).padStart(2, '0')}:00`);
const body = (nowLocal = '2026-10-12T16:45') => ({
  current: { time: nowLocal, temperature_2m: 12, weather_code: 3 },
  hourly_units: { temperature_2m: '°C' },
  hourly: {
    time: [...hours(12), ...hours(13)],
    temperature_2m: Array.from({ length: 48 }, (_, i) => i + 0.4),
    weather_code: Array.from({ length: 48 }, (_, i) => (i === 16 ? 45 : 61)),
    precipitation_probability: Array.from({ length: 48 }, (_, i) => i),
  },
});

test('parseHourly starts at the current hour in the city and runs 24 hours', () => {
  const f = parseHourly(body());
  assert.equal(f.hours.length, 24);
  assert.deepEqual(f.hours[0], { time: '2026-10-12T16:00', temp: 16, words: 'foggy', rain: 16 });
  assert.equal(f.hours.at(-1).time, '2026-10-13T15:00');
  assert.equal(f.units, '°C');
});

test('parseHourly copes with a thin forecast and with a body that has none', () => {
  assert.equal(parseHourly({ current: { time: '2026-10-12T16:45' } }), null);
  assert.equal(parseHourly(null), null);
  const late = parseHourly(body('2026-10-13T20:10'));
  assert.equal(late.hours.length, 4, 'only the hours that exist');
  assert.equal(parseHourly(body('2026-10-20T01:00')), null, 'a forecast that is all in the past is no forecast');
  const noRain = body();
  delete noRain.hourly.precipitation_probability;
  assert.equal(parseHourly(noRain).hours[0].rain, null);
});

test('hourLabel: "4 pm", with the day once the forecast passes midnight', () => {
  assert.equal(hourLabel('2026-10-12T16:00', '2026-10-12'), '4 pm');
  assert.equal(hourLabel('2026-10-12T00:00', '2026-10-12'), '12 am');
  assert.equal(hourLabel('2026-10-12T12:00', '2026-10-12'), '12 pm');
  assert.equal(hourLabel('2026-10-13T03:00', '2026-10-12'), 'Tue 3 am');
});

test('clockStamp is the current date and time in the city’s own zone', () => {
  assert.equal(clockStamp('America/New_York', new Date('2026-10-12T20:42:00Z')), 'Mon 12 Oct, 4:42 pm EDT');
  assert.equal(clockStamp('America/New_York', new Date('2026-12-01T05:05:00Z')), 'Tue 1 Dec, 12:05 am EST');
});

test('hourlyForecast asks Open-Meteo for New York’s hours in New York’s zone', async () => {
  let url = '';
  const f = await hourlyForecast(DEFAULT_CITY, async (u) => { url = u; return { ok: true, json: async () => body() }; });
  assert.match(url, /latitude=40\.71&longitude=-74\.01/);
  assert.match(url, /hourly=temperature_2m,weather_code,precipitation_probability/);
  assert.match(url, /timezone=America%2FNew_York/);
  assert.equal(f.hours[0].time, '2026-10-12T16:00');
  await assert.rejects(hourlyForecast(DEFAULT_CITY, async () => ({ ok: false, status: 502 })), /502/);
  await assert.rejects(hourlyForecast(DEFAULT_CITY, async () => ({ ok: true, json: async () => ({}) })), /no hourly/);
});
