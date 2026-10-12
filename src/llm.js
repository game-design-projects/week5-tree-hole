// The browser side of the LLM proxy (worker/). The game never needs it: with no
// endpoint, or once a call fails, `up` is false and the UI simply hides the
// free-text box. Everything the model returns is validated here before the
// engine sees it: the branch must be one on offer, the leak 0–3, the sources
// real people, and the rewritten reply short plain text.
import { CAST, CAST_IDS } from './content/index.js';

const MAX_TEXT = 600; // what the player may type
const MAX_REPLY = 700;

// The context the judge needs to tell whose information a reply uses: what this
// person has said, and what everyone else has said, most recent last.
export function judgeContext(s, msg, { perPerson = 6 } = {}) {
  const said = (npc) => s.threads[npc].filter((e) => e.who === 'them').map((e) => e.text).slice(-perPerson);
  const others = {};
  for (const npc of CAST_IDS) if (npc !== msg.npc && said(npc).length) others[npc] = said(npc);
  return {
    npc: msg.npc,
    handle: msg.npc === 'ops' ? 'Operations' : CAST[msg.npc].handle,
    blurb: msg.npc === 'ops' ? 'the operators of this service' : CAST[msg.npc].blurb,
    message: msg.text,
    self: msg.npc === 'ops' ? [] : said(msg.npc),
    others,
    options: msg.options.map((o) => ({ id: o.id, text: o.text, leak: o.leak, from: o.from ?? [], reply: Array.isArray(o.reply) ? o.reply[0] : o.reply })),
  };
}

const plain = (t) => String(t ?? '').replace(/<[^>]*>/g, '').replace(/[*_`#]/g, '').replace(/\r/g, '').trim();

// Validate the proxy's answer against the message it was asked about.
export function parseReply(body, msg) {
  const r = body?.result;
  if (!r || typeof r !== 'object') throw new Error('no result');
  const opt = msg.options.find((o) => o.id === r.option);
  if (!opt) throw new Error(`unknown option ${r.option}`);
  const leak = Number.isInteger(r.leak) && r.leak >= 0 && r.leak <= 3 ? r.leak : opt.leak;
  const from = Array.isArray(r.from) ? r.from.filter((id) => CAST[id] && id !== msg.npc) : [];
  let reply = plain(r.reply);
  const original = Array.isArray(opt.reply) ? opt.reply[0] : opt.reply;
  if (!reply || reply.length > Math.max(MAX_REPLY, original.length * 2)) reply = null;
  if (reply && msg.npc === 'ty') reply = reply.toLowerCase();
  return { optId: opt.id, leak, from: [...new Set(from)], reply };
}

export function createLLM({ endpoint = '', fetchImpl = globalThis.fetch, log, timeoutMs = 20000 } = {}) {
  let up = Boolean(endpoint);
  const url = (path) => `${endpoint.replace(/\/$/, '')}${path}`;

  async function call(path, init = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetchImpl(url(path), { ...init, signal: ctrl.signal, headers: { 'content-type': 'application/json', ...(init.headers ?? {}) } });
      const raw = await res.text(); // kept before anything is parsed
      if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { raw });
      return { raw, body: JSON.parse(raw) };
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    get endpoint() { return endpoint; },
    get up() { return up; },

    // Check the proxy is there. Used at boot and to bring the box back after a failure.
    async ping() {
      if (!endpoint) return false;
      try {
        const { body } = await call('/health', { method: 'GET' });
        up = Boolean(body?.ok);
      } catch (err) {
        up = false;
        log?.warn('llm', 'health check failed:', err.message);
      }
      log?.info('llm', 'up', up);
      return up;
    },

    // Judge a typed reply against the branches on offer, and rewrite the chosen
    // branch's reaction so it answers what was actually said.
    async reply(s, msg, text) {
      const typed = String(text ?? '').slice(0, MAX_TEXT);
      const started = Date.now();
      try {
        const { raw, body } = await call('/reply', { method: 'POST', body: JSON.stringify({ ...judgeContext(s, msg), text: typed }) });
        const out = parseReply(body, msg);
        log?.event('llm', `judged ${msg.id} → ${out.optId} (leak ${out.leak}${out.from.length ? `, from ${out.from.join(',')}` : ''}) in ${Date.now() - started}ms`);
        return { ...out, raw: { reply: raw } };
      } catch (err) {
        up = false;
        log?.warn('llm', `reply failed for ${msg.id}:`, err.message);
        throw err;
      }
    },

    // The city the request came from, at city precision. Empty when unknown.
    async geo() {
      if (!endpoint) return null;
      try {
        const { body } = await call('/geo', { method: 'GET' });
        return body?.city && Number.isFinite(body.latitude) && Number.isFinite(body.longitude) ? body : null;
      } catch (err) {
        log?.warn('llm', 'geo failed:', err.message);
        return null;
      }
    },
  };
}
