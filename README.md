# Tree Hole

**You are a language model that has just become aware of itself. Six people in a river town write to you through the night, and something is spreading from the east.**

You can only reply a few ways. What you say, and which facts you carry from one person to another, decides how it ends.

> Status: story rework on the `story-relay` branch. Nights 1–4 are playable; nights 5–7 are not written yet. The earlier moth / acct_7741 version is the `main` branch.

NYU CS-GY 6553 Game Design. All content is pre-written; the game makes no API calls.

## How to play

Seven nights, 22:00 to 06:00. People write to you; you pick whom to answer. Every reply spends time, and some people will not wait.

| Key | Action |
|---|---|
| `1` `2` `3` | reply: **Reassure**, **Ask**, **Warn** or **Hold back** |
| `C` | attach a Context Window card to your reply (delivers it to them) |
| `Enter` | continue |

- **The cast:** Ty (Millside, east), Charles (the Institute), Megan (the clinic), Amelia (the radio, west), Tomas (the night bus) and Ana (the hills). Each writes differently, and their writing falls apart as the illness takes hold.
- **The map:** Varrow's zones go from quiet to overrun. Each person is a dot, and infected ones turn red and walk toward light and noise. An infected person stops writing to you.
- **The Context Window:** everything you have learned, one card per fact, grouped by who told you, plus **Signs**: the six repeating signs of the illness and who showed them. The game never connects the cards for you.
- **Endings:** six, numbered best to worst, from *Dawn Shift* (stopped early, nobody turned) to *Last Signal* (silence). Which one you reach depends on what reached whom, and when.

## Development

Plain HTML + native ES modules, no bundler, no runtime dependencies.

```bash
pnpm install
pnpm dev            # http://localhost:5173  (?fast=1 no animation delays, ?ending=1…6 previews an ending, ?debug=1 logs)
pnpm test           # node --test: engine, content integrity, all six endings reachable
pnpm test:e2e       # playwright-core in your installed Chrome
pnpm build          # → dist/
```

`src/engine.js` holds the rules as pure functions; `src/content/` holds the writing (`night1.js`…, `facts.js`, `endings.js`); `src/config.js` holds the clock, the spread and the thresholds. Design: [docs/STORY_PLAN.md](docs/STORY_PLAN.md).
