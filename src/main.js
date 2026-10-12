// Entry point. URL flags: ?debug=1 (verbose [tag] logs), ?fast=1 (no typing
// delays or intro animation; used by e2e), ?ending=1…6 (preview an ending), ?tutorial=1|0 (force or skip the tutorial).
// window.__th is the e2e/debug hook.
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

const ending = Number(params.get('ending'));
const forceEnding = ending >= 1 && ending <= 6 ? ending : null;

// The tutorial shows the first time unless disabled: ?tutorial=0 off, ?tutorial=1 always, and never with ?fast=1.
const tut = params.get('tutorial');
const tutorial = tut === '1' ? 'always' : tut === '0' || fast ? null : 'first';

const app = createApp(document.getElementById('app'), { log, fast, store, forceEnding, tutorial });
window.__th = { app, engine, store, version: APP_VERSION };
