// Entry point. URL flags:
//   ?debug=1          verbose [tag] logs
//   ?fast=1           no typing delays or animations (used by e2e); skips going live
//   ?ending=<id>      preview an ending: good-all, good-some, good-none, bad-all, bad-some, bad-none
//   ?llm=0            no typed replies even when a key is present
//   ?offline=1        no network at all: no LLM, no weather, no city search
//   ?boot=0|1         skip or force the going-live sequence
// window.__th is the e2e/debug hook.
import * as engine from './engine.js';
import { APP_VERSION } from './config.js';
import { createLog } from './log.js';
import { createStore } from './save.js';
import { createLLM } from './llm.js';
import { createApp } from './ui/app.js';

const params = new URLSearchParams(location.search);
const debug = params.get('debug') === '1';
const fast = params.get('fast') === '1' || matchMedia('(prefers-reduced-motion: reduce)').matches;
const offline = params.get('offline') === '1';
if (fast) document.documentElement.classList.add('fast');

const log = createLog(debug);
const store = createStore(log);
// The spend-capped OpenRouter key ships in src/llm-key.js, which is not in git. A build
// without it (or an empty one) plays offline: no text box, nothing is sent anywhere.
async function loadKey() {
  if (offline || params.get('llm') === '0') return '';
  try {
    return String((await import('./llm-key.js')).default ?? '');
  } catch {
    return '';
  }
}
const llm = createLLM({ key: await loadKey(), log });
log.event('boot', `Tree Hole v${APP_VERSION}`, { debug, fast, offline, llm: llm.up ? 'key present' : 'offline' });

const ending = params.get('ending');
const forceEnding = engine.ENDING_IDS.includes(ending) ? ending : null;
const boot = params.get('boot') === '1' || (params.get('boot') !== '0' && !(fast && params.get('boot') == null));

llm.ping();
const app = createApp(document.getElementById('app'), { log, fast, store, llm, offline, boot, forceEnding });
window.__th = { app, engine, store, llm, version: APP_VERSION };
