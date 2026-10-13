# Tree Hole — notes for Claude

Browser narrative game (NYU CS-GY 6553). The player is a chat/LLM service; six townspeople write to it in isolated sessions over 3 nights. Crossing session boundaries (leaking A's info to B) saves people but raises hidden suspicion. Ending = a newspaper front page: service running or shut down × all / some / none survive.

## Docs
- `docs/DESIGN.md` (Chinese) is the source of truth for gameplay. `docs/STORY_PLAN.md` is the obsolete 7-night/cards plot — reference only.
- Cards are a hard no.
- Keep `CHANGELOG.md` (Keep a Changelog) and bump `package.json` version with each release.

## Layout
- `src/engine.js`: rules as pure functions. `src/config.js`: tuning (SUS_BY_LEAK, SHUTDOWN_AT, WARY_AT, PANIC_AT, REPORTS_TO_SEAL, MAX_REASKS…).
- `src/content/`: `cast`, `night1–3`, `ops` (operator questioning), `paper` (endings), `index`.
- `src/llm.js`: OpenRouter client. `src/geo.js`: Open-Meteo (current weather, hourly forecast, city search). `src/ui/`: `boot`, `play`, `map`, `settings`, `ending`, `weather` (the paper's New York hourly box; falls back to the scripted line), `decrypt`.
- `tools/serve.mjs` dev server, `tools/build.mjs` → `dist/`, `tools/cover.mjs` renders `tools/cover.html` → `docs/cover.png` (the itch cover; online, for fonts), `tools/shots.mjs` → `docs/screenshots/` (the itch screenshots, from the real game, mocked like e2e), `scripts/test.mjs` tag-aware test runner.
- Plain HTML + ES modules, no bundler, pnpm, Node ≥ 20.

## Content rules (enforced by `tests/content.test.js`)
One answer per message; 3–4 options; ≥1 leak-0 and ≥2 leak ≤1; `from` required iff leak ≥ 2. Options may only use info from message *texts* already readable.

## Balance
Targets in `tests/balance.test.js`. Tune `src/config.js` and re-run after any content change.

## LLM (no server)
- The browser calls OpenRouter with the spend-capped key in `src/llm-key.js` (gitignored; CI writes it from secret `OPENROUTER_API_KEY`; build writes an empty one if absent → offline). Local play: `tools/serve.mjs` serves `/src/llm-key.js` from `.dev.vars` in memory.
- Typed answers are off where the replies are forced (`E.acceptsTyping`: a wary user's message, a panicking user's last words); `respond`/`offTopic` throw on typed text there. The operators' inquiries take typed text (judged to a branch, never `other`).
- Judging = Jev (`typesafe/jev-1.13`, `POST /api/alpha/decisions`), never an LLM: `choice` branch or `other` (story messages only, `E.acceptsOther` → `E.offTopic`: re-ask via Haiku up to `MAX_REASKS`, then they leave with `s.gaveUp[npc]`; `fateOf.left` stays false so the paper doesn't report a panic); `score` leak with probabilities keyed "0"–"3", pass = P(≥2) ≥ 0.5; `noul` per other user.
- Rewording = `anthropic/claude-haiku-5.5`, streamed (SSE, `readStream`), `reasoning: { enabled: false }` for first-word latency; no `temperature`. No Jev gate on rewording (it rejected sensible rewrites and can't coexist with streaming).
- Every true/false check goes to Jev, never an LLM.

## Tests
- `pnpm test`: unit only (engine, content, balance, llm client). A fetch guard fails any network use.
- `pnpm test:e2e`: system Chrome via playwright-core; Open-Meteo and OpenRouter mocked in `e2e/lib.mjs` (serves `src/llm-key.js` itself, aborts unmocked OpenRouter calls).
- `pnpm test --tag live` (`e2e/live.e2e.mjs`): a full game through real models, paid. Key only from `.dev.vars` (the user's scoped, capped key — never the global env key); skipped without it. Gates on playability (reaches the paper, branch/line agreement ≥ 90%, reactions answer the reply, median first words ≤ 3 s, "dog" → other → re-ask). Haiku's rewording freedom is only reported; loose rewording is fine.

## Flags
`?fast=1`, `?seed=N` (fixes a new game's option order and script variants), `?debug=1`, `?boot=0|1`, `?llm=0` (no typing), `?offline=1` (no network), `?ending=good-all|good-some|good-none|bad-all|bad-some|bad-none`.

## Git
Pushing to `main` auto-publishes to itch.io (`.github/workflows/publish-itch.yml`). Work on branches.
