#!/usr/bin/env node
// The test runner behind `pnpm test`.
//   pnpm test               unit tests only: no network, no real LLM calls (what CI runs)
//   pnpm test --tag live    plus one whole game against the real models (paid; needs .dev.vars)
// Browser e2e with everything mocked stays `pnpm test:e2e`.
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';

const SUITES = { live: ['e2e/live.e2e.mjs'] };
const args = process.argv.slice(2);
const tags = args.flatMap((a, i) => (a === '--tag' ? [args[i + 1]] : a.startsWith('--tag=') ? [a.slice(6)] : []));
const unknown = tags.filter((t) => !SUITES[t]);
if (unknown.length) {
  console.error(`[test] unknown tag: ${unknown.join(', ')} (known: ${Object.keys(SUITES).join(', ')})`);
  process.exit(2);
}
// Listed here, not as a glob: Node 20 (what CI runs) does not expand globs for --test.
const unit = readdirSync('tests').filter((f) => f.endsWith('.test.js')).sort().map((f) => `tests/${f}`);
const files = [...unit, ...tags.flatMap((t) => SUITES[t])];
console.log(`[test] ${tags.length ? `tags: ${tags.join(', ')}` : 'no tags: unit tests only, no real LLM calls'}`);
const run = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
process.exit(run.status ?? 1);
