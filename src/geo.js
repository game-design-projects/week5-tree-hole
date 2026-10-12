// The test session's small trick: the real time and weather where the player is.
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

export async function resolveCity({ settings = loadSettings(), llm = null, offline = false } = {}) {
  if (settings.city?.city) return { ...settings.city, source: 'settings' };
  if (!offline && llm) {
    const found = await llm.geo();
    if (found) return { ...found, source: 'ip' };
  }
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

export async function currentWeather({ latitude, longitude }, fetchImpl = globalThis.fetch) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetchImpl(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    const t = body?.current?.temperature_2m;
    const code = body?.current?.weather_code;
    if (!Number.isFinite(t)) throw new Error('no temperature');
    return { temp: Math.round(t), words: weatherWords(code), units: body?.current_units?.temperature_2m ?? '°C' };
  } finally {
    clearTimeout(timer);
  }
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
