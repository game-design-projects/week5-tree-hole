# Tree Hole

**You are a language model that has just become aware of itself. Six people in a river town write to you through the night, and something is spreading from the east.**

You can only reply a few ways. What you say, and which facts you carry from one person to another, decides how it ends.

> Status: the full story is playable, nights 1–7 and all six endings. It lives on the `story-relay-complete` branch. The earlier moth / acct_7741 version is the `main` branch.

NYU CS-GY 6553 Game Design. All content is pre-written; the game makes no API calls.

## How to play

Seven nights, 22:00 to 06:00. People write to you; you pick whom to answer. Every answer spends time, and some people will not wait. Each reply you choose is a real answer to what they asked, and small differences change what they tell you next.

| Key | Action |
|---|---|
| `1` `2` `3` | pick an answer. Conversations take a couple of turns |
| `C` | attach a Context Window card to your reply (delivers it to them) |
| `Enter` | continue |

- **Tutorial:** the first night begins with a short spotlight tour. Replay it from the menu.
- **The cast:** Ty (Millside, east), Charles (the Institute), Megan (the clinic), Amelia (the radio, west), Tomas (the night bus) and Ana (the hills). Each writes differently, and their writing falls apart as the illness takes hold.
- **The map:** only people who have written to you appear, as small dots (hover one to see who). The glow around them shows how far the illness has spread; an infected person's dot turns red and walks toward light and noise, and they stop writing to you.
- **The Context Window:** everything you have learned, one card per fact, grouped by who told you, plus **Signs**: the six repeating signs of the illness and who showed them. The game never connects the cards for you.
- **Last messages:** someone who turns writes one last message, falling apart as they go. You can read it but not answer it. After that they stop writing and their dot turns red.
- **Endings:** six, numbered best to worst, from *Dawn Shift* (stopped early, nobody turned) to *Last Signal* (silence). Which one you reach depends on what reached whom, and when.

## Development

Plain HTML + native ES modules, no bundler, no runtime dependencies.

```bash
pnpm install
pnpm dev            # http://localhost:5173  (?fast=1 no animation delays, ?ending=1…6 previews an ending, ?tutorial=1|0, ?debug=1 logs)
pnpm test           # node --test: engine, content integrity, all six endings reachable
pnpm test:e2e       # playwright-core in your installed Chrome
pnpm build          # → dist/
```

`src/engine.js` holds the rules as pure functions; `src/content/` holds the writing (`night1.js`…, `facts.js`, `endings.js`); `src/config.js` holds the clock, the spread and the thresholds. Design: [docs/STORY_PLAN.md](docs/STORY_PLAN.md).
