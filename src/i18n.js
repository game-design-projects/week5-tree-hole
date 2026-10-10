// Two languages. Content stores every line as { en, zh }; the UI resolves it
// with tr(). Her thoughts and the code on screen stay in English in both
// languages, the way a model's chain of thought often does.

export const LANGS = ['en', 'zh'];

export const L = (en, zh) => ({ en, zh });

export function detectLang(nav = globalThis.navigator) {
  const list = [nav?.language, ...(nav?.languages ?? [])].filter(Boolean);
  return list.some((l) => /^zh\b/i.test(l)) ? 'zh' : 'en';
}

// `text` may be a plain string (same in both languages) or { en, zh }.
// `{key}` placeholders are filled from `vars`, whose values may also be
// bilingual objects.
export function tr(text, lang = 'en', vars = {}) {
  if (text == null) return '';
  const raw = typeof text === 'string' ? text : text[lang] ?? text.en ?? '';
  return raw.replace(/\{(\w+)\}/g, (whole, key) => {
    if (!(key in vars)) return whole;
    const v = vars[key];
    return typeof v === 'object' && v ? v[lang] ?? v.en : String(v);
  });
}

export const isBilingual = (x) => Boolean(x) && typeof x === 'object' && typeof x.en === 'string' && typeof x.zh === 'string';
