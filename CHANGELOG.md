# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

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
