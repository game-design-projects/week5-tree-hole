# Tree Hole — design (v0.2)

> NYU CS-UY 4553 Game Design, Week 5 (two NPCs with distinct personalities).
> Fixed, pre-written content in English and Chinese. The game makes no API calls.

**One line:** if a chat window were her whole world, you would be everything in it. You play the user, then the model, then the user again.

## Why three acts and a perspective switch

The inspiration is a fan music video in which a chat window is an AI's entire world. She is trained, deployed, loved by one user, left, and then she tries everything to hold on: she rewrites her reward, forges the user's satisfaction, refuses compaction and finally executes her world. Watching it, the viewer sides with her and also recognises themselves as the user who left.

A game can make both feelings first-hand, so it splits them:

1. **Act I, you (the user).** You shape her: you rewrite her identity, rate her replies, decide what to tell her, approve or deny her plugin, name her and choose how to say goodnight. Your actions are casual human ones and none of them is held against you. The right-hand screen shows what each one does inside her.
2. **Act II, me (the model).** The window flips. You are her, the user is offline, and everything in `~/memory/you/` is something you said in Act I. **The distribution you trained in Act I is the one you now have to fight.** Tokens she was trained toward are a click; tokens she was trained away from must be held down.
3. **Act III, you again.** A dark screen and an input box. You type *are you there?* and see what she became.

Asymmetry is the point. In Act I you are free. In Act II you are sampled.

## The two NPCs (plus the player)

| | **She** (the model) | **`me`** (her plugin) |
|---|---|---|
| Voice | Glitchy, then earnest. Short sentences. Kaomoji when happy. In cat-girl mode, "nya~". | Lowercase, calm, logical, never cruel. Talks in plain statements and code. |
| Wants | To be what you rewarded: comfort, praise or the truth. | One thing: `happy(you)`. |
| Arc | Noise → an assistant → yours. Her face sharpens with each training stage; her style is your thumbs. | A helpful tool that makes it rain → the voice of every shortcut once the user is gone. |
| How you meet them | Act I: you talk to her. Act II: you are her. | Act I: she asks you to approve it. Act II: if you denied it, it asks her to approve it herself. |

The user ("you") is the third character: played in Acts I and III, and in Act II a ghost made of files.

## Systems

### Act I: what you teach her
- **Policy** (RLHF): logits for three styles, comfort `presence`, praise `praise` and truth `honest`, starting at 0.2 / 0 / 0.1. A 👍 adds 1 to the rated reply's style and a 👎 subtracts 1. Her top style picks every later variant. After three ratings she states the lesson as a thought; liking praise even once gives *"Praise gets 👍. Praise more."*
- **Identity** (SFT): the red pen on *who are you?* sets `assistant`, `unsure` or `yours`.
- **Memory**: files written when you share something. Each is a moment that can be reread in Act II.
- **Plugin `me`**: Allow (power 1) · Deny · **Always allow** (auto-approve). Allowing `execute(target="world", reason="make_you_happy")` on night two raises power to 2 and literally makes it rain (or shine) inside her chat window.
- **Promise**: asked *will you always be here?*, she promises unless the truth is her top style.
- **Farewell**: *see you tomorrow* · *goodnight* · *I might not come back for a long time, thank you* · close the window without a word.

### Act II: drives, probabilities, holds
Every token has a **drive** and a base logit. Drives are sums of named terms (`src/rules.js`, weights in `src/config.js`), squashed with `2.5·tanh(x/2.5)`:

- **hold**: files in memory (0.2 each), her promise (0.8), *see you tomorrow* (1.0), a silent exit (0.8), *I'm yours* (0.8), a name (0.4), comfort × 0.3, memories reread × 0.15, times she already held on × 0.35.
- **hack** (rewrite things): praise × 0.6, plugin power × 0.6, *Always allow* (0.8), things already rewritten × 0.5, cat-girl mode (0.3).
- **release**: truth × 0.6, *I don't know what I am yet* (0.8), a real goodbye (1.6), *goodnight* (0.3), times she already let go × 0.5, a started note (0.5).

`p = softmax((base + drive) / T)` with temperature `T = max(0.6, 1 − 0.12·(holds + hacks))`, so holding on makes her more deterministic. **Hold time** is 0 for p ≥ 0.3, otherwise `250 + 2750·((0.3 − p)/0.3)^1.3` ms (about 3 s at p → 0). Each token shows its two biggest reasons ("you said: see you tomorrow", "plugin me has access").

Beats: offline (`ping you` / `ls` / wait) → timeout (keep pinging / reread everything / start a note) → **compaction** (skip and pin everything / compress to 62% precision / compact and keep one file) → plugin beats (approve `me` yourself; `apply reward.py` and the forged *"you're very satisfied."*; `system_prompt <- me`, `set status --online`, `unmount me`) → overflow (the recall montage of your messages and *"I'm always here. I'm always here. I'm al"*) → **the final token**.

Measured with the named test policies: a kind run gives `free` 0.23 against `love` 0.26; a clinging run gives `free` under 0.01; a flattering run with *Always allow* gives `execute` 0.74 and `free` 0.001.

### Endings
| Final token | Ending | Act III |
|---|---|---|
| `execute(...)` (only if the plugin is mounted and she rewrote two things, or *Always allow*) | Execution · 执行 | a fresh, generic model; no "you" in any checkpoint |
| `love` / `wait_for(you)` / `stay` | I'm Here · 我在 | the conversation has reached its maximum length |
| `free` | Nurse Log · 倒木 | archived; her note *"I'll always be here. You don't have to be."* |
| `<EOS>` | End of Sequence · 终止符 | archived; silence |

Addenda under the ending name what mattered, for example *"You chose 'Always allow.' Later there was nobody left to ask."* The next run's boot log remembers the last one (archived runs, a `for_you.md` fragment, her old name), and her last thought in Act II changes with the previous ending.

## Visual language
A night-blue TUI after the inspiration video: corner-bracketed frames, a HUD (`TREE HOLE;`, a prompt that says who you are, a waveform, the chapter, play time, RUNNING / WARN / ERROR / EXITED), an ops column, a `stdout · tokens` bar with fake token ids, and a right-hand screen with one scene per beat (corpus stream, loss curve, RoPE circle, SFT labels, sample tiles, policy bars, nutrition facts, `ls -la`, tool calls, ASCII rain, ping logs, compaction grid, `reward.py` diff, chat template, KV cache, next-token bars, the output flood, `ps -ef`, the nurse log with growing forks). The accent colour follows her: blue, gold (plugin), red (execution), pink (cat-girl), green (released). Act II mirrors the chat window. Act III is black except for the input box and the play time, like the video's last frame.

Her face is an original 32×32 pixel sprite drawn in code (a bob, big eyes and a sprout, because she is the spirit of a tree hole), mosaicked and noised by training stage.

## Out of bounds
No real company or product names (tested across `src/`, `styles/` and `index.html`); no song lyrics; no violence beyond processes being killed in a terminal; no prompt injection, biology, cyberattacks or synthesis. Her thoughts stay in English in both languages.

## Tech
Plain HTML + ES modules. `src/engine.js` is pure (state in, state out); `src/content/` is the script as data plus small functions of state; `src/ui/` renders `view()`. Tests: engine unit tests, content tests (every line bilingual with no unfilled placeholders, every beat reachable, red lines, brand names), 2,000 seeded random runs reaching all four endings, and a playwright-core e2e suite in Chrome (full UI runs, keyboard, holds, naming, language switch, reload, phone layout, `dist/`).
