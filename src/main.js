// Entry point. URL flags:
//   ?debug=1          verbose [tag] logs
//   ?fast=1           no typing delays or animations (used by e2e); skips going live
//   ?ending=<id>      preview an ending: good-all, good-some, good-none, bad-all, bad-some, bad-none
//   ?llm=<url>        use this LLM proxy instead of config.LLM_ENDPOINT; ?llm=0 forces offline play
//   ?offline=1        no network at all: no proxy, no weather, no city search
//   ?boot=0|1         skip or force the going-live sequence
// window.__th is the e2e/debug hook.
import * as engine from './engine.js';
import { APP_VERSION, LLM_ENDPOINT } from './config.js';
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
const llmParam = params.get('llm');
const endpoint = offline || llmParam === '0' ? '' : llmParam ?? LLM_ENDPOINT;
const llm = createLLM({ endpoint, log });
log.event('boot', `Tree Hole v${APP_VERSION}`, { debug, fast, offline, llm: endpoint ? 'configured' : 'offline' });

const ending = params.get('ending');
const forceEnding = engine.ENDING_IDS.includes(ending) ? ending : null;
const boot = params.get('boot') === '1' || (params.get('boot') !== '0' && !(fast && params.get('boot') == null));

llm.ping();
const app = createApp(document.getElementById('app'), { log, fast, store, llm, offline, boot, forceEnding });
window.__th = { app, engine, store, llm, version: APP_VERSION };
