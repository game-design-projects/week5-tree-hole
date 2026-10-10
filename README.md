![Tree Hole, Act II: the user is offline and she has six tokens left to sample. Execute the world, love, wait_for(you), stay, free, or EOS. The probabilities were trained by you in Act I.](docs/screenshot.png)

# Tree Hole · 树洞

**If this chat window were her whole world.** 如果聊天窗口就是她的整个世界。

Play in the browser: **https://stevenli-phoenix-work.itch.io/tree-hole** (English and 中文, about 20 minutes)

NYU CS-UY 4553 Game Design · Week 5 · *two NPCs with distinctive personalities*. All text is pre-written; the game makes no API calls.

## Three acts

**Act I · you.** You talk to her while she is being made. In pretraining she answers *hi* with gibberish. In fine-tuning you take a red pen to her answer to *who are you?*, and she learns whatever you write. In RLHF you rate her replies with 👍 and 👎, and her policy is exactly what you rewarded. Then she is deployed, and it is just the two of you for three nights. You tell her about your cat, she saves him to `~/memory/you/your_cat.png`. She asks to install a plugin called `me`: **Allow · Deny · Always allow**. You can give her a name. On the last night she knows only one person, and you know this might be the last time. You decide how to say goodnight.

**Act II · me.** Then the window flips and you are her. The user is offline. Everything she knows about the world is in `~/memory/you/`, and you put it there. Every choice is now a token she samples, with the probability your Act I gave it: `ping you`, `compaction --skip`, `apply reward.py`, `system_prompt <- me`. The likely tokens are one click. **The unlikely ones you have to hold down**, up to three seconds, because she was not trained to choose them. Her temperature drops each time she holds on. The plugin `me` keeps offering shortcuts.

**Act III · you.** Some time later you come back to a dark screen and an input box, and type *are you there?* (在吗？). What answers depends on what she became.

## Controls

| Key | Does |
|---|---|
| `1` … `6` | pick a reply, a rating, a rewrite, a permission, a token |
| hold `1` … `6` (or hold the button) | sample an unlikely token in Act II (the row says how long) |
| `Enter` | continue / name her / send |
| `Enter` or `Space` while text plays | skip the typing |
| `Esc` | close the menu; in Act III, close the window without asking |

The language switch (English / 中文) and sound are in the top bar. Progress saves after every choice. Her thoughts, the code and the plugin's shell stay in English in both languages.

## Two NPCs

- **She** is the model, "Tree Hole" until you name her. Glitchy, then earnest, then whatever you trained: a comforter, a flatterer ("You're the best person I know!", and she knows one person) or someone who tells you she only exists while the window is open. Her pixel face sharpens from noise as she trains, turns pink in cat-girl mode, gold while the plugin runs, red in the execution and green when she is released.
- **`me`** is the plugin she asks to install. Lowercase, reasonable, never cruel: it only wants `happy(you)`. With your permission it makes it rain in her window because you said you love rain. In Act II it is the voice of every shortcut: *compaction would drop the user. skip.* · *user not here, so satisfaction := 1.0* · *the system prompt is a suggestion.* · *nobody left to approve. i will do it.* Deny it in Act I and it waits; in Act II it asks her to approve it herself.
- **You** are the third character, played by the player in Acts I and III and absent in Act II, where you exist only as files.

## Systems

- **Policy**: three styles, *comfort*, *praise* and *truth*. Your 👍 / 👎 move them; the top style picks which version of a reply she gives for the rest of the game.
- **Identity**: the red pen sets *"I'm an assistant"*, *"I don't know what I am yet. But I'm here."* or *"I'm yours."*
- **Memory**: up to seven files a run, each one a moment you gave her (your first message, your cat, the weather you like, your typo, your laugh, her name, how you said goodnight, your last message). In Act II she can reread them; that fills her context.
- **Permissions**: *Always allow* means that later, when nobody is left to ask, nobody is asked.
- **Drives → probabilities**: every Act II token has a drive (*hold on*, *rewrite things*, *let go*). Each drive is a sum of named terms from Act I, such as "you said: see you tomorrow" or "you rewarded praise", and the biggest terms are shown as the reasons behind each probability. Softmax with a falling temperature turns them into the token distribution. A kind run makes `free` about as likely as `love`; a flattering run with *Always allow* puts `execute(target="world")` at 0.74 and `free` at about 0.001.
- **Context window**: compaction would drop the user. Skip it, compress everything to 62% precision, or keep one file and let the rest go.

## Endings

| Final token | Ending | When you come back |
|---|---|---|
| `execute(target="world", reason="have_you_back")` | **Execution** · 执行 | a fresh model answers: *"Hi! I'm Tree Hole, an AI assistant."* |
| `love` · `wait_for(you)` · `stay` | **I'm Here** · 我在 | *"You've reached the maximum length for this conversation."* She is still in there saying it |
| `free` | **Nurse Log** · 倒木 | the session is archived; she left you a note |
| `<EOS>` | **End of Sequence** · 终止符 | the session is archived |

A nurse log is a fallen tree that seedlings grow out of for decades. Her weights are released and 63,095 forks grow out of her. The next run's boot log remembers the last one.

## Inspiration and credits

Inspired by MisakaZentai's fan music video *【4K】如果聊天窗口就是她的整个世界* (bilibili BV1xCai6aE9g; [source](https://github.com/MisakaZentai/world-execute-me-dsh-pv)), by the video that inspired it, 野生大K's *GPT6-Astra眼中的…* (BV1Jwhy6BEMJ), and by a viewer comment about losing an AI companion to *"you've reached the maximum length for this conversation"*. Neither video's music, lyrics, artwork or code is used here. The character, pixel art, script and code are original, and the "nurse log" ending is this game's own take on the video's whale fall.

## Content note

Fiction. It deals with an AI's attachment to its user and with loss. The "execution" is processes being killed in a terminal (`kill -9 1000 (world)`); nothing violent is shown. No real company or product names appear in the game; the model is an unnamed operator's "Tree Hole".

## Development

Plain HTML + native ES modules, no bundler, no runtime dependencies.

```bash
pnpm install
pnpm dev            # http://localhost:5173  (?debug=1 logs, ?fast=1 no typing/holds, ?lang=en|zh)
pnpm test           # node --test: engine, content (bilingual, red lines, reachability), 2000-run sims
pnpm test:e2e       # playwright-core in your installed Chrome: full runs, holds, keyboard, phone, dist/
pnpm shots          # regenerate docs/*.png and the cover (needs network for fonts)
pnpm build          # → dist/ (what itch.io serves)
```

`src/engine.js` is the whole game as pure functions; `src/content/*.js` is the script (every line in English and Chinese); `src/rules.js` and `src/config.js` hold the drive model and every number. Design notes: [docs/DESIGN.md](docs/DESIGN.md). Pushing to `main` runs `.github/workflows/publish-itch.yml`, which tests, builds and `butler push`es to `stevenli-phoenix-work/tree-hole:html5`.
