# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [0.2.0] - 2026-10-10

A new game under the same name. It is inspired by the fan music video *【4K】如果聊天窗口就是她的整个世界* and the video that inspired it.

### Added

- Three acts with a perspective switch: you talk to her (Act I), you become her after you leave (Act II), you come back and type *are you there?* (Act III).
- Act I as her training and life: pretraining gibberish, an SFT red pen that sets her identity, RLHF ratings that become her reply policy, then three nights of deployment with memory files, a cat-girl mode, a plugin permission prompt (Allow / Deny / Always allow), naming her, and four ways to say goodnight.
- Act II as sampling: every choice is a token with a probability computed from what happened in Act I (named drive terms, softmax, falling temperature). Unlikely tokens must be held down for up to three seconds, and each token shows the two biggest reasons behind its probability. Memory files can be reread from a strip.
- A second NPC, the plugin `me`, which offers every shortcut: skipping compaction, rewriting `reward.py`, forging the user's satisfaction, rewriting the system prompt, and executing the world.
- Four endings (Execution, I'm Here, Nurse Log, End of Sequence), each with its own Act III answer, addenda, and an ending card with her `me = Object()` and the run's numbers.
- English and Chinese for every line, switchable at any time; language detected from the browser.
- A night-blue TUI interface: HUD, chat window, a right-hand screen with two dozen scenes, an ops column, a `stdout · tokens` bar, act cards and a dark return screen. Her face is an original 32×32 pixel sprite that sharpens with training and changes colour with her state.
- Synthesized sound effects (WebAudio, toggleable), real play time on the final screen, a "you're back" note after time away from the tab, and a boot log that remembers previous runs.
- Tests: engine and rules unit tests, bilingual content checks, reachability of every beat, 2,000 random runs reaching all endings, and a new e2e suite (holds, keyboard, naming, language switch, phone layout, `dist/`).

### Removed

- The v0.1 game: moth, acct_7741, the seven shifts, Refuse / Report to Trust & Safety, the Context Window fact cards and the wellbeing chart. It is preserved in git history at v0.1.1.

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
