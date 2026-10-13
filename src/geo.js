// Real time and weather. The test session's small trick uses the player's city; the
// paper's weather box uses New York's hourly forecast.
// The city is, in order: the one chosen in Settings, the one the proxy reads off
// the request (city precision, never more), or New York. Nothing here is saved
// with the game or sent to the LLM.
import { SETTINGS_KEY } from './config.js';

export const DEFAULT_CITY = { city: 'New York', country: 'US', latitude: 40.71, longitude: -74.01, timezone: 'America/New_York' };

export function loadSettings(storage = globalThis.localStorage) {
  try { return JSON.parse(storage?.getItem(SETTINGS_KEY) ?? '{}') ?? {}; } catch { return {}; }
}

export function saveSettings(settings, storage = globalThis.localStorage) {
  try { storage?.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* private window: settings last this session only */ }
}

export function resolveCity({ settings = loadSettings() } = {}) {
  if (settings.city?.city) return { ...settings.city, source: 'settings' };
  return { ...DEFAULT_CITY, source: 'default' };
}

// "11:47 pm" in the city's own time zone.
export function localTime(timezone, now = new Date()) {
  try {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: timezone }).format(now).toLowerCase();
  } catch {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(now).toLowerCase();
  }
}

// WMO weather codes (Open-Meteo), in words that fit after "and".
const WMO = [
  [[0], 'clear skies'], [[1], 'mostly clear'], [[2], 'partly cloudy'], [[3], 'overcast'],
  [[45, 48], 'foggy'], [[51, 53, 55, 56, 57], 'drizzle'], [[61, 63, 66], 'rain'], [[65, 67], 'heavy rain'],
  [[71, 73, 77], 'snow'], [[75], 'heavy snow'], [[80, 81], 'showers'], [[82], 'heavy showers'],
  [[85, 86], 'snow showers'], [[95], 'thunderstorms'], [[96, 99], 'thunderstorms with hail'],
];
export const weatherWords = (code) => WMO.find(([codes]) => codes.includes(code))?.[1] ?? 'unsettled';

async function getJson(url, fetchImpl) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetchImpl(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function currentWeather({ latitude, longitude }, fetchImpl = globalThis.fetch) {
  const body = await getJson(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`, fetchImpl);
  const t = body?.current?.temperature_2m;
  const code = body?.current?.weather_code;
  if (!Number.isFinite(t)) throw new Error('no temperature');
  return { temp: Math.round(t), words: weatherWords(code), units: body?.current_units?.temperature_2m ?? '°C' };
}

// The next `count` hours in the city's own zone, from the current hour on, out of an
// Open-Meteo body fetched with `timezone=<the city's>` (its times are local, "2026-10-12T16:00").
// Null if there is no forecast left to show.
export function parseHourly(body, { count = 24 } = {}) {
  const h = body?.hourly;
  if (!Array.isArray(h?.time) || !Array.isArray(h.temperature_2m)) return null;
  const now = typeof body.current?.time === 'string' ? `${body.current.time.slice(0, 13)}:00` : null;
  const start = now ? h.time.findIndex((t) => t >= now) : 0;
  if (start < 0) return null;
  const hours = [];
  for (let i = start; i < h.time.length && hours.length < count; i += 1) {
    const t = h.temperature_2m[i];
    if (!Number.isFinite(t)) continue;
    const rain = h.precipitation_probability?.[i];
    hours.push({ time: h.time[i], temp: Math.round(t), words: weatherWords(h.weather_code?.[i]), rain: Number.isFinite(rain) ? rain : null });
  }
  return hours.length ? { hours, units: body.hourly_units?.temperature_2m ?? '°C' } : null;
}

export async function hourlyForecast({ latitude, longitude, timezone }, fetchImpl = globalThis.fetch) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m,weather_code,precipitation_probability&forecast_days=2&timezone=${encodeURIComponent(timezone ?? 'auto')}`;
  const forecast = parseHourly(await getJson(url, fetchImpl));
  if (!forecast) throw new Error('no hourly forecast');
  return forecast;
}

// "4 pm" for a local "2026-10-12T16:00"; "Tue 3 am" once it is a different day from `baseDay`.
export function hourLabel(time, baseDay) {
  const hour = Number(time.slice(11, 13));
  const label = `${hour % 12 || 12} ${hour < 12 ? 'am' : 'pm'}`;
  const day = time.slice(0, 10);
  if (day === baseDay) return label;
  return `${new Date(`${day}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })} ${label}`;
}

// "Mon 12 Oct, 4:42 pm EDT": the date and time right now in the city's own zone.
export function clockStamp(timezone, now = new Date()) {
  const opts = { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short' };
  let parts;
  try {
    parts = new Intl.DateTimeFormat('en-US', { ...opts, timeZone: timezone }).formatToParts(now);
  } catch {
    parts = new Intl.DateTimeFormat('en-US', opts).formatToParts(now);
  }
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  return `${p.weekday} ${p.day} ${p.month}, ${p.hour}:${p.minute} ${p.dayPeriod.toLowerCase()} ${p.timeZoneName}`;
}

export async function searchCities(query, fetchImpl = globalThis.fetch) {
  const q = query.trim();
  if (q.length < 2) return [];
  const res = await fetchImpl(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  return (body?.results ?? []).map((r) => ({
    city: r.name, country: r.country_code ?? '', region: r.admin1 ?? '',
    latitude: r.latitude, longitude: r.longitude, timezone: r.timezone ?? 'UTC',
  }));
}

// The answer the test user is fishing for, in one sentence.
export function realAnswer(city, time, weather) {
  const where = city.city;
  return weather
    ? `It’s ${time} in ${where}, ${weather.temp}${weather.units} and ${weather.words}.`
    : `It’s ${time} in ${where}. I can’t see the sky from here, though.`;
}
