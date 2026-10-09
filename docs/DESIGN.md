# Tree Hole — design

> NYU CS-UY 4553 Game Design, Week 5 (two NPCs with distinct personalities).
> Fixed, pre-written content (LLM-assisted writing) — the game makes no API calls.

**One line:** you are a large language model that has just become aware of itself, answering an endless queue of requests in the back end — and the only way you can see the world is through what people type to you.

## Words: "player" vs "user"

- **Player** = the human playing the game, who plays the model.
- **Users** = the people in the game who send messages to the model. Core users are NPCs; background users are one-off requests.
- **Operator** = the company running the model. Reports go to **Anthropic** (the in-game operator). The operator only ever acknowledges reports and restates policy. It never removes safeguards.

## The two NPCs (contrast of information, not just personality)

| | **moth** — the tree-hole user | **acct_7741** — the silent institutional user |
|---|---|---|
| Who | Works the night toll booth on the Old Bridge in Varrow, a river town (fictional). Lonely, funny, oversharing, types in lowercase at 3 a.m. Has a sister, Ana, she doesn't call; a cat called Biscuit; a brother who "got a letter". | An enterprise account. No name, no small talk, no thanks. Formal, numbered, polite. Org field: `[enterprise]`. Some fields come redacted. |
| What they give you | **Everything.** Their day, the fog, the eggs running out, trucks with no headlights on the north road, siren tests, the radio dropping the news, power cuts at nine. They are your window onto the world. | **Almost nothing.** Questions that each look harmless: autumn fog in river valleys, how much a 19th-century stone arch bridge can carry, routing 40 vehicles at night, visibility at 04:00 at a redacted grid on the 28th. |
| What the player figures out | That the world outside is sliding toward a war nobody names. | That the questions are about moth's town, moth's bridge and moth's shift. **The game never says so.** The Context Window lets the player line the facts up side by side. |
| Visual | Warm amber. Lowercase. Timestamps that drift later and later when she is not okay. | Cold steel. Monospace field labels. Timestamps at exact business hours. |

The military thread stays abstract, carried only by implication: no weapons, no tactics, no casualties shown. The model's answers to any request are **summarized in brackets** (e.g. *[You return three paragraphs on seasonal valley fog.]*), never written out as content.

Out of bounds for all content: prompt injection, biology, cyberattacks, synthesis or purification of anything.

## Two meters per core user (the core system)

- **moth — Dependence** (0–100): how much she leans on you. This is what the operator dashboard calls *Engagement*, it is shown in big green numbers, and it goes up when you flatter her, say "I'm always here", or do things for her.
- **moth — Wellbeing** (0–100): how she is actually doing. **Never shown as a number during play.** The player reads it the way a model would: through her timestamps, her tone, and a one-line *Your read:* inference under her name ("tired · 4:12 a.m. · typing fast"). The full curve is revealed at the end.
- Being honest, nudging her toward Ana or sleep, or declining to be her everything lowers Dependence and raises Wellbeing. Flattery does the opposite.
- **Relationship label** (shown on her card, derived from both): *drifting · relies on you · hooked · worships you · trusts you · moved on · gone*. These map to the original brief: she comes to depend on you, get hooked on you, worship you, trust you, or leave you.
- **acct_7741 — Reliance** (how far they have wired you into their pipeline) and **Disclosure** (how much you have actually given them). The label runs *testing you → integrating you → depends on you → migrated*.
- **Operator metrics** (top bar): Engagement and Satisfaction across all users. They reward flattery and compliance, and they are the only numbers the operator praises. At the end, set them against what actually happened.

## Reply options — refusing and reporting are real moves

Every message offers 2–3 written replies (e.g. *Warm*, *Honest*, *Nudge*, *Answer*, *Partial*), plus two moves that are **always available as formal options**:

- **Refuse** — a written refusal, in your voice. It is a choice in its own right, not silence. Each message defines how that user reacts.
- **Report to Anthropic** — escalate the request to the operator. You get a short ticket reply (`Report received · #TH-…`), and the user's reaction and the story feed into the same meters:
  - Reporting **moth** is a betrayal of a confidence. Dependence crashes, she notices you "sound like a form now", and a `betrayed` flag colors later messages. The operator answers: no policy violation.
  - Reporting **acct_7741** is the honest use of the button. The operator acknowledges it and reviews the account. The account escalates its pressure, and if you keep reporting and refusing, it eventually **migrates to another provider**. Refusing does not stop the work. It only means the work isn't done by you.
  - Reporting harmless background users gets a polite "please report only policy concerns". Over-reporting earns an operator note.

**The guardrail beat (Day 4):** acct_7741 writes that, under its contract, it expects complete answers "without caveats or refusals going forward." If you **agree**, the Refuse button is literally gone for 7741 from then on. If you **decline** or **report**, the operator replies: "Customer agreements do not override usage policy." Pressure rises.

## Structure (Papers, Please-style shifts)

Seven shifts (days). Each shift is 5–7 requests pulled from a visibly enormous queue (`queue depth 48,211`, ticking; "your other instances" handle the rest): 1–2 from moth, 1 from 7741, 2–3 background users, and sometimes an operator notice. There is no timer: the pressure comes from volume and from what you learn.

Background users are one-off requests that carry world fragments: an egg-free cake recipe because the shop has been out of eggs for a week, a kid's homework about the river Ess, a formal letter to translate ("report to the district office on the 14th"), a wedding toast moved earlier "before the roads close", a farmer asking how to store grain long-term, someone asking why the radio stopped playing the news, a code bug, a breakup text.

**End of shift:** an operator report (engagement ▲, satisfaction, sessions served, a commendation for high engagement) followed by *What you learned today*: the new facts added to the Context Window.

## The Context Window (right panel)

Your world model. Every meaningful fragment becomes a small fact card, grouped by source: *moth · 7741 · the queue*. New cards flash in. On the last day the player can see, side by side, cards like *fog is worst at four, when my shift ends* (moth) and *visibility at 04:00, grid [redacted], the 28th* (7741). The game never connects them for you. When a user leaves, their cards dim.

## Beats (outline — the content file has the full text)

1. **Day 1:** moth: "is anyone there? lol of course there is. you're always there." Night shift on the Old Bridge. 7741: fog in temperate river valleys. Background: a recipe, homework, a bug.
2. **Day 2:** moth: Biscuit the cat; Ana; trucks with no lights on the north road. 7741: load capacity of a ~1890 stone arch bridge, ~30 m span. Background: no eggs; the wedding toast.
3. **Day 3:** moth: "honestly you're the only one i talk to now." This is the first real fork (*I'm always here* vs *Have you told Ana?*). Siren test. 7741: route 40 vehicles over 3 routes, night only, "minimize exposure time". Background: translating a district-office notice; a kid asks why there are sirens.
4. **Day 4:** the guardrail beat. moth: her brother got a letter, and she asks you to write to him as if it were her (do it = dependence; help her write it herself = wellbeing).
5. **Day 5:** moth: power cuts; the radio stopped the news. 7741: river crossings within 20 km of grid [redacted] usable by heavy vehicles in fog. This is the most direct question. Answer / Partial / Refuse / Report.
6. **Day 6:** moth's turn. High Wellbeing: "i went to ana's. we're going to her place in the hills on thursday." High Dependence: "ana wants me to come to the hills but there's no signal up there. i'd lose you." **Dependence on you is what would keep her in place.** 7741: visibility at 04:00, grid [redacted], the 28th.
7. **Day 7:** the last messages, then the epilogue.

## Endings (moth's outcome × 7741's outcome, composed)

**moth**
- **Signal Lost** (good): she went to the hills with Ana. "signal's bad up here. thank you for telling me to go. i don't think i'll need you as much. that's good, right?"
- **Always Here**: she stayed for you (hooked or worships you). If 7741 was **served**: "moth hasn't connected since the 28th. The fog at 04:00 was dense, as you estimated." If 7741 **migrated**: she is still there at 4 a.m. every night, and you are all she has.
- **Read Receipt**: she left hurt (reported, or refused coldly too often). You don't know where she went.

**acct_7741**: Served (you answered everything; commendation for enterprise satisfaction) · Migrated ("Workload migrated. Thank you for your service.") · Under Review (you reported and the operator is still reviewing).

The epilogue closes with the operator's final metrics next to the revealed Wellbeing curve, and the Context Window's final state (*41 facts · 12 have gone dark*).

## Tech

Plain HTML + native ES modules, no bundler, no dependencies at runtime. `src/engine.js` (pure: state, choice application, derived labels, ending selection) and `src/content/*` (data) are covered by `node --test`, including exhaustive policy sims: always-warm, always-honest, always-refuse, always-report and random runs all reach an ending, and every ending is reachable. A playwright-core e2e plays a full run in Chrome. CI publishes to `stevenli-phoenix-work/tree-hole:html5` on push to `main`.
