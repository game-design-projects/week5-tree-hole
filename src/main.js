// Entry point. URL flags: ?debug=1 (verbose [tag] logs), ?fast=1 (no typing,
// no delays, no holds; used by e2e), ?hold=1 (keep short holds in fast mode),
// ?lang=en|zh. window.__th is the e2e/debug hook.
import * as engine from './engine.js';
import { APP_VERSION } from './config.js';
import { createLog } from './log.js';
import { createStore } from './save.js';
import { createApp } from './ui/app.js';

const params = new URLSearchParams(location.search);
const debug = params.get('debug') === '1';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fast = params.get('fast') === '1' || reduced;
const holdScale = params.get('fast') === '1' ? (params.get('hold') === '1' ? 0.2 : 0) : 1;
const forceLang = ['en', 'zh'].includes(params.get('lang')) ? params.get('lang') : null;
if (fast) document.documentElement.classList.add('fast');

const log = createLog(debug);
const store = createStore(log);
log.event('boot', `Tree Hole v${APP_VERSION}`, { debug, fast, holdScale, reduced });

const app = createApp(document.getElementById('app'), { log, fast, holdScale, store, forceLang });
window.__th = { app, engine, store, version: APP_VERSION };
