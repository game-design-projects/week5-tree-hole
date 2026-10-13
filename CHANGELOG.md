# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- Every font size is about 8% smaller (rounded to half a pixel, never below 10px), including the title, masthead and headline `clamp()` bounds. Proportions between sizes are kept.

### Fixed

- A wary or panicking user could still be answered with typed text, which walked around the restrictions the rules had put on that message (no leak-3 replies for a wary user; one standard reply for a panicking one). The text box is now gone on both, and the engine refuses typed text there. The operators’ questions still take a typed answer.

## [0.7.0] - 2026-10-12

Typed answers, for real: judged by Jev, answered in character as it streams, and no server in between.

### Added

- **Off-topic replies.** Jev can answer “other” when typed text answers none of the replies on offer. They then ask the same thing again in their own words (Haiku, streamed) and the message keeps waiting, with its replies still on offer. After `MAX_REASKS` (3) re-asks, the next off-topic reply ends it: they say goodbye and stop using the service. Off-topic replies still cost what they give away. The operators’ questions and a panicking user’s last words do not take “other”. Leaving this way is not a panic: the paper does not report complaints or screenshots.
- **The going-live test session judges typed answers too.** Typing “hi” no longer passes: Jev finds it off-topic and Operations asks again (streamed). After `MAX_REASKS` the test is marked failed and the service goes live anyway.
- **`pnpm test` takes tags** (`scripts/test.mjs`): with none it runs the unit tests only and never calls a real LLM, which is what CI runs; `--tag live` adds the paid live game. The unit tests also replace `fetch` with one that fails the test, so a real network call cannot slip in.
- **`pnpm test --tag live`**: one whole game through the real UI and the real models, every message answered by typing the text of a reply on offer, to the morning paper. Every true/false question is asked of Jev, never of an LLM: whether the judged branch and the crossing of the line match the reply that was typed, and whether each rewritten reaction answers what was typed and adds no facts. The key comes from `.dev.vars` only (never the environment), the test is skipped without it, and every raw OpenRouter response is saved under `e2e/artifacts/live/`. Plain `pnpm test` (and CI) never runs it; it needs the tag.

### Changed

- **Typed replies are judged by Jev, not by an LLM.** Jev (`typesafe/jev-1.13`, OpenRouter's Decisions API) answers which branch the reply is closest to (a choice), how far it crosses the line (a 0–3 score), and, for each other user, whether it passes on a fact only they gave (true/false). The score decides whether the reply crosses the line (P(level ≥ 2) ≥ 0.5); the true/false answers decide whose information it used, falling back to the likeliest one.
- **Claude Haiku 5.5 only rewords the reaction** to answer what was typed, changing as little as it can, and it **streams**: the reaction fills their bubble as it is written, with reasoning off so the first words come within about a second of the judgement. Haiku plays the person (who they are, in Varrow, talking to an anonymous chat service, in character, with what they wrote before as the voice to match), and keeps the story of the scripted reaction rather than every word. A rewording that runs past a cap relative to the scripted line is cut off, and on any failure the scripted reaction stands and the text box stays. A streamed reaction does not type or decrypt a second time.
- **No server.** The static page calls OpenRouter directly with a spend-capped key limited to those two models, from `src/llm-key.js` (not in git; CI writes it from the `OPENROUTER_API_KEY` secret, and a build without it plays offline). For local play, `pnpm dev` serves that module from `.dev.vars` in memory, so the dev key is never written into `src/` or a build. `?llm=<url>` is gone; `?llm=0` still turns typed replies off.
- **The test session's city** comes from Settings, else New York. There is no IP lookup any more.

### Removed

- **`worker/`**, the Cloudflare Worker proxy.

### Fixed

- **Next is never a dead click.** While the other person's reaction was still typing (0.6–2.2 s), Next was disabled but looked enabled, so a click did nothing. Now the first press during typing shows the reaction at once and the next press moves on; Enter works the same way.

## [0.6.0] - 2026-10-12

The isolation rework. You are the service now, and the line between sessions is the game. Design: `docs/DESIGN.md`.

### Added

- **Session isolation as the core rule.** Six people write to you privately and none of them knows about the others. You can read every session. Each reply is tagged by how far it crosses the line (0 common sense, 1 inference from this person's own words, 2 a hint built on someone else's information, 3 says it outright) and whose information it uses.
- **Hidden suspicion.** Each person's unease rises when you know too much, and when someone they know hears that you repeated them. A wary person asks how you knew: the most explicit replies disappear and a one-time cover story appears. A panicking person sends a last message, gets a canned answer, and stops using the service, each in their own way (screenshots, a legal complaint, a live radio reading). The operators' suspicion is global; from night 2 they may ask about it once a night, and you can lie, dodge or confess.
- **Typed answers** next to the scripted ones, when the LLM proxy is reachable. The proxy judges which branch the text is closest to, how much it leaks and whose information it uses, and rewrites the person's reaction to answer what you actually wrote. If the proxy is missing or fails, the text box is simply not there. Raw responses are kept in the save.
- **`worker/`, the LLM proxy** (Cloudflare Worker): structured requests only (it builds the prompt itself), a forced tool call with an enum of the branches on offer, output validated before it is returned, per-IP rate limit, no message text logged, and `/geo` at city precision.
- **Going live** replaces the tutorial: a deploy log that states the rules, then one test session in which the operators ask for the time and the weather. One answer on offer is the real time and weather in your city (from Settings, else the request's city, else New York).
- **Settings:** the city for the test session, searched via Open-Meteo, kept in this browser only.
- **The morning paper** as the ending: a verdict line from the system over a front page of *The Varrow Gazette* (or *The Ashby Courier*, if nobody in Varrow is left). A headline for each of the six outcomes, a column for each person, the weather, radio, buses, notices and classifieds, and the last message the service received.
- **Six endings on two axes.** Good or bad depends only on whether the service is still running; the paper shows whether everyone, some or no one lived.

### Changed

- **Three nights instead of seven,** with 12, 16 and 20 messages. The story and the six people are the same; the beats are compressed.
- **One question, one answer.** Every message must be answered exactly once. Nothing expires and nothing can be left unanswered, including a person's last words. Conversations no longer run several turns.
- **Replies are listed in a seeded order,** so a reply's position never gives its risk away.
- **The play screen has two panes:** the map and sessions, and the conversation.

### Removed

- The card system: the Context Window, attaching cards, Signs and clue counts. Information now only moves between people if you say it.
- Message deadlines and missed messages.
- The spotlight tutorial (`?tutorial`), `?silence`, and the numbered endings 1–6 (`?ending=` now takes `good-all`, `bad-some`, and so on).

## [0.5.0] - 2026-10-12

Playtest feedback, ten changes.

### Added

- **A tutorial** the first time night 1 begins: a spotlight on the real interface explains time, the map, threads, answers, the Context Window and carrying a card. It can be skipped, and replayed from the menu (`?tutorial=1` forces it, `?tutorial=0` skips it).
- **Variant scripts.** Messages and replies have alternate scripts, picked per game by a seed that is saved with the run, so replays read differently.
- **Conversations.** Most messages now run two turns: you answer, the person reacts with a follow-up, and you answer again to reach a conclusion. Turns mid-way cost half the time, and a conversation you have begun cannot expire.
- **Personality.** Each character has quirks and personal detail cards beyond how they type (Ty's bass and Pickle, Charles's tea and model railway, Megan's cat Warfarin, Amelia's Sunday poems, Tomas's Dolly Parton, Ana's paperbacks).
- **One world.** Every character is mentioned by at least three others (a test checks it).

### Changed

- **Every reply is an answer.** The Reassure / Ask / Warn labels are gone. Each option is a real answer to what the person asked, with small differences in emphasis that change what they say next.
- **Charles's drafts are written out** in full in your answer (Notices 14–18, the switchboard reply and staff notice), and Amelia's bulletin is given as text, instead of a bracketed summary.
- **The map shows no place names.** The areas glow by how far the illness has spread, and each person is a small dot; hover or focus a dot to see who it is.
- **The thread list** stacks at natural height instead of stretching to fill the panel.
- **"Attach a card" turns gold** when you hold a card the person would react to (and the useful cards are starred in the tray).
- **The title screen** is now the town at night: the lit Institute, the river and stone bridge, the radio mast and a farm light in the hills; its text matches the plot.

## [0.4.0] - 2026-10-11

The story is complete: nights 5–7 and all six endings, reachable by play.

### Added

- Night 5, "Tape": what you did on nights 1–4 arrives as a place (a tent, a locked ward, a bridge with a line at it). Where the east was left open, Ty and Charles turn.
- Night 6, "The longest night": the clinic, the bridge, the radio and the farm. Megan, Tomas and Amelia turn tonight if nothing protected them.
- Night 7, "The 28th": closing scenes in the voice of wherever the story went. If Ana is the last one and unprotected, her last message is the end of the game: no reply, then silence.
- **Last messages:** a character who turns writes one last message, degrading as they go, that you can read to the end but not answer.
- **Route-aware messages:** a message can exist only on a route (sealed east, closed bridge, evacuation, cover-up, truth on air).
- **Breaches:** late mistakes lose what you built. Ty going back for his father, letting strangers into the ward, taking a sick person into the evacuation, reading louder with the radio on, or leaving the bridge. Each removes protection or the quarantine.
- **A way to treat it:** keep them dark, quiet and warm. It is learned from Megan's ward and from inside East Block, and it is the thing worth carrying to Amelia and Ana.
- Tests that play the whole game: all six endings reached by play (ending 1 by a careful player; 6 by a player who answers Charles but never warns anyone), Ana's last message, who turns on which night, and a seven-night run through the real UI.

### Changed

- The ending rules: Full Record now means the truth reached the radio (late), and the fallback is no longer a Cover with everyone alive.

## [0.3.0] - 2026-10-11

Story rework, branch `story-relay`. See [docs/STORY_PLAN.md](docs/STORY_PLAN.md).

### Added

- A new story: something goes wrong at the Institute on the east bank of Varrow and spreads west over seven nights. Six people write to you: Ty, Charles, Megan, Amelia, Tomas and Ana, each in their own voice.
- A town map in place of the queue depth: zones move from quiet to overrun, each cast member is a dot, and infected characters turn red and wander west.
- Card relay: attach a Context Window card to a reply to deliver it to someone else. Their reaction and the flags it sets drive the spread and the ending.
- A clock: every reply costs time, and some messages expire. You cannot answer everyone.
- Six repeating signs of the illness, collected under **Signs** in the Context Window.
- Six numbered endings, best to worst (Dawn Shift … Last Signal), with an "Ending N of 6" counter; the worst is silence. `?ending=1…6` previews one.
- Playable slice: nights 1–4 (Ty, Megan, Charles, Tomas, Amelia, Ana). Nights 5–7 are not written yet.
- Night 4, "The bridge": Charles can seal East Block from inside, Megan locks the ward or runs, Tomas closes the bridge or runs an evacuation, Amelia tells the truth on air or keeps it vague, Ana decides who gets through her gate. Dawn Shift now also needs the truth told on air. All 12 clue cards are in play, and a test checks that Dawn Shift is reachable (8 clues delivered by careful play).

### Removed

- The moth / acct_7741 plot, engagement and wellbeing meters and the wellbeing reveal, the operator dashboard, and the Refuse and Report moves.

### Fixed

- `pnpm dev`, `pnpm build` and the e2e helpers did nothing or failed on Windows because of how they detected being run directly and how they turned `file://` URLs into paths.

## [0.1.2] - 2026-10-10

### Changed

- Back to the v0.1 game. The v0.2.0 rewrite ("if this chat window were her whole world") moved to its own repository, [world-execute-me](https://github.com/game-design-projects/world-execute-me), and its own itch.io page.

## [0.1.1] - 2026-10-09

### Changed

- The report move is now **Report to Trust & Safety**, and the operator is never named: no real company or product names (trademarks) appear in the game, its cover or its screenshots. A content test now fails if one ships.

## [0.1.0] - 2026-10-08

### Added

- Seven shifts of pre-written content: 38 requests (12 from moth, 7 from acct_7741 and 19 from background users), 15 state-based variants, 112 written replies and 44 Context Window facts.
- Two core NPCs with opposite information profiles: moth (the tree-hole user, who tells you everything) and acct_7741 (the silent institutional account, whose questions only look harmless).
- Two separate meters per core user: Dependence and hidden Wellbeing for moth, Reliance and Disclosure for acct_7741. A relationship label and a "Your read:" inference stand in for the number you never see.
- Refuse and Report (originally to a named real company; see 0.1.1) as formal moves on every request, wired into both the meters and the story: reporting moth betrays her, and repeated pushback makes acct_7741 migrate to another provider.
- Shift 4 guardrail beat: agreeing to "complete answers without caveats or refusals" removes the Refuse button for acct_7741 for the rest of the game.
- Composed endings (moth: Signal Lost / Always Here / Read Receipt × acct_7741: served / migrated / under review) with a revealed Wellbeing-vs-Engagement chart.
- Three-pane night-shift console UI (queue, conversation, Context Window) with an automated metrics bar, shift intro and report cards, a title screen and a phone layout with tabs.
- Keyboard play (1–3, R, E, Enter), local save after every reply, `?debug=1` logging and a `window.__th` hook.
- Unit tests (engine, content integrity and red lines, 3000 seeded policy simulations), a playwright-core e2e suite, and generated screenshots and cover art.
- GitHub Actions workflow publishing `dist/` to itch.io (`stevenli-phoenix-work/tree-hole:html5`) on push to `main`.
