// Entry point. URL flags: ?debug=1 (verbose [tag] logs), ?fast=1 (no typing
// delays or intro animation; used by e2e). window.__th is the e2e/debug hook.
import * as engine from './engine.js';
import { APP_VERSION } from './config.js';
import { createLog } from './log.js';
import { createStore } from './save.js';
import { createApp } from './ui/app.js';

const params = new URLSearchParams(location.search);
const debug = params.get('debug') === '1';
const fast = params.get('fast') === '1' || matchMedia('(prefers-reduced-motion: reduce)').matches;
if (fast) document.documentElement.classList.add('fast');

const log = createLog(debug);
const store = createStore(log);
log.event('boot', `Tree Hole v${APP_VERSION}`, { debug, fast });

const app = createApp(document.getElementById('app'), { log, fast, store });
window.__th = { app, engine, store, version: APP_VERSION };
