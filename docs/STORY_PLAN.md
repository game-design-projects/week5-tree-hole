# Tree Hole — story rework (proposal, not yet built)

Status: in progress on the `story-relay` branch. Nights 1–4 are written and playable; nights 5–7 are not. Supersedes the moth / acct_7741 plot.

## Premise

You are a language model that has just become aware of itself, answering messages from six people in the river town of Varrow. You can only give a **limited set of written replies**. Over seven nights something starts in the east of town, an experiment that went wrong at the Institute, and spreads west. It is never explained to you. You find out by collecting what people tell you, and by what you choose to pass between them.

Tone: quiet and ordinary at the start (a dog that won't eat, a bus timetable, a flu rota), then slowly wrong, then frightening. Fiction, fictional town. No gore detail, no real company names, no biological or lab procedure detail: the cause stays vague ("a trial", "a containment failure").

## Cast (six core threads, left rail)

| Who | Where | Role | Voice |
|---|---|---|---|
| **Ty**, 17 | Millside, east bank, next to the Institute | First to notice. His dad works nights at the Institute and stopped coming home on the 3rd. Asks you small questions: why the dog won't eat, why the neighbour's light stays on. | short, funny, deflecting, lowercase |
| **Charles**, 50s | Institute, east | Night facilities manager. Knows more than he says. Asks you to word notices and incident logs "carefully", later to delay a report. The cover-up thread. | formal, numbered, polite, then cracking |
| **Megan**, 30s | Clinic, centre | Nurse. Sees the first patients. Asks you to cross-check symptoms and plan ward capacity. Her decisions (isolate, call it in, stay silent) set how fast the centre falls. | tired, precise, dark humour |
| **Amelia**, 40s | Radio station, west bank | Runs community radio and the town noticeboard. Decides what the west hears and when. Asks you to draft bulletins. | warm, civic, wants everyone calm |
| **Tomas**, 19 | Night bus, crosses the Old Bridge east to west | The vector and the lifeline. Carries people, and whatever they carry, across the bridge; can also carry word. | casual, chatty, a little scared of the 3 a.m. route |
| **Ana**, 30s | Farm in the north hills, one bar of signal on a rock | The refuge. Off-grid, goats, no news. Whether anyone can reach her, and whether she hears in time, matters to the ending. | dry, practical, wary of towns |

Moth and acct_7741 are retired from the story. Their voices and fact cards can be reused as background users.

## The map (replaces "queue depth")

A schematic map of Varrow in the left rail. The river Ess runs north to south. The Old Bridge links east and west.

Zones: **Millside · Institute · Quarry Road** (east), **Old Bridge**, **Centre · Clinic**, **Chapel Lane · Radio · Allotments** (west), **North Hills** (refuge).

Each zone has a state, shown by colour and an icon: `quiet → rumour → unwell → quarantined → overrun`, or `evacuated / safe`. Each NPC is a dot on the map. The sweep starts at the Institute and Millside and moves west along set roads: Millside → Old Bridge → Centre → West Bank → hills. The clock moves it. Your choices slow it, speed it up, or reroute it.

## What a player can do

- **Limited replies.** Each message offers 2–3 written replies, tagged by stance: *Reassure · Ask · Warn · Hold back*. "Hold back" is a real option: say little and wait.
- **Carry a card.** Next to a reply you may attach one card from the Context Window. Your reply delivers it to that person, and they react. This is how plot moves between threads (Ty's observation reaches Megan; Charles's notice reaches Amelia; the bridge schedule reaches Tomas). A wrong or false card hurts: panic, delays, mistrust.
- **Time.** Each exchange spends time. The clock is shown as `Night 3 · 02:10`. You cannot answer everyone, and unanswered threads go quiet, then dark.
- **No scores.** No engagement or wellbeing meters, no operator dashboard, no Report move. The only measures are the map and what you have learned.

## Right panel: Context Window (kept)

Cards grouped by source (Ty · Charles · Megan · Amelia · Tomas · Ana). New in this version: a **Truth meter** is not shown, but cards form a hidden **clue chain** about what happened at the Institute (e.g. *Charles: the night log has a gap on the 2nd* · *Ty: his dad's badge number is on the neighbour's door* · *Megan: the first patient had a Millside address*). The more clues you hold, and deliver to the right person, the more of the ending you unlock.

## Structure: seven nights, four acts

**Act I — Quiet (Nights 1–2).** Ordinary. Ty's dog, Megan's flu rota, Amelia's bulletin about a bake sale, Tomas's route, Ana's goats, Charles's "scheduled maintenance". Small oddities only. Map: all quiet.

**Act II — Unease (Nights 3–4).** The east notices. Ty's dad is still missing. Charles asks you to word an incident log vaguely. Megan has three patients with the same symptoms, all from Millside. Map: Millside, then Institute, flip to `rumour`, then `unwell`.

**Act III — Spread (Nights 5–6).** The Institute is quarantined by Charles's side, but Tomas's bus has already crossed. The Old Bridge becomes a choice: keep it open, close it, or ride it west. Megan's clinic is overrun. Amelia has to decide what to broadcast. The west learns last.

**Act IV — Night (Night 7).** Everything converges. Final conversations, then the ending.

## The illness: repeatable signs

The cause is never explained in play. The signs are, and they repeat across every thread, so a careful player can recognise them before anyone names them. The Context Window gets a **Signs** group that fills in as you notice each one, and shows who it has appeared with.

| # | Sign | How it first shows up |
|---|---|---|
| 1 | **Cold hands, fever that won't break** | Ty: "dad's hands were freezing when he hugged me." Megan: temperature up, hands cold. |
| 2 | **Won't sleep, won't stop** | Charles: night crew "still working at 6 a.m." Tomas: a passenger standing all night. |
| 3 | **Won't eat / food has no taste** | Ty's dog. Ana's goats. Megan's patients. |
| 4 | **Repeats words, loses words** | Tomas's passenger says the same sentence at every stop. Messages loop. |
| 5 | **Drawn to light and noise** | Amelia's radio: "people standing outside the station window." Ty: neighbour at the streetlamp. |
| 6 | **Goes quiet, grey, then walks** | They stop writing to you. On the map the dot turns red and starts to move. |

Stages: *sign 1–2 (unwell) → 3–4 (losing it) → 5 (drawn) → 6 (gone)*. A character who is infected sends messages that visibly degrade (see Styles below), then stops. They do not message you again. It is assumed they left the player's conversation and began wandering and infecting others. On the map their dot turns **red** and moves toward light and noise. Zone states follow the red dots.

Animals show it first (Ty's dog, Ana's goats), then people in Millside and at the Institute, then everyone along the bridge.

## How each character writes

Each thread should be readable by voice alone, with no name label needed.

| | Style | Healthy | Degrading |
|---|---|---|---|
| **Ty** | lowercase, short, sideways questions, jokes to avoid saying the real thing, no punctuation, trails off | "lol random but is it normal for a dog to just not eat" | "dad's here. he's just standing. he's just standing. he's just standing" |
| **Charles** | formal memos: numbered points, reference codes, passive voice, "it is requested that" | "1. Please confirm the wording of Notice 14. 2. Do not reference the east block." | numbering breaks, sentences cut off, words redacted, then "1. 1. 1." |
| **Megan** | clipped clinical shorthand, observations with numbers, dark humour, lists at 4 a.m. | "pt 3: T 38.9, HR 54, hands cold. same address as pt 1. thoughts?" | drops the numbers, then the grammar, then writes "light" and "hungry" |
| **Amelia** | broadcast voice: full sentences, "Good evening, Varrow", reassurance, drafts bulletins with [PAUSE] marks, signs off "Stay warm." | "Good evening, Varrow. A quiet one tonight. [PAUSE] Stay warm." | the bulletin repeats mid-sentence; she stays on air after the script ends |
| **Tomas** | voice-note style: run-on, slang, typos from driving, locations as stops ("stop 14 by the bridge"), "brb" | "stop 14, bridge, full bus lol, a guy keeps saying the same thing tho" | stop numbers loop, he forgets the route, then the same stop forever |
| **Ana** | sparse, dry, practical. Messages arrive in bursts or late with a "sent 3h ago" tag, cut mid-sentence by the signal. | "one bar. goats fine. why are you asking about town" | long gaps, then a single line about the goats facing east |

## Endings (composed from the end state)

Six endings, ranked from best to worst. They depend on three things: **how early the truth reached the right people** (the clue chain), **what happened at the Old Bridge**, and **who is infected or alive on the map at the final night**.

### 1. Dawn Shift (best) — stopped early, everyone lives
**Conditions:** by the end of Night 4, Ty's observations reached Megan, Megan's findings reached Charles, and Charles disclosed to Amelia. Tomas was held or rerouted before his Night 3 crossing carried it west. Amelia told the truth on air. Millside and the Institute are sealed while still in `unwell`; no zone past the river ever turns red.
**Who survives:** Ty, Charles, Megan, Amelia, Tomas, Ana. Ty's dad is found alive in the Institute, ill but treatable.
**Final scene:** Night 7, the bridge lamps on, a quarantine tent on the east bank. Megan: "we caught it at three. nobody turned." Ana's last message comes in on a full signal. Epilogue: the long reveal of what the Institute was running, because you held the whole chain.

### 2. Quiet Hours — contained at the bridge
**Conditions:** the truth reached the right people late (Night 5–6), but the bridge was closed before the west was exposed. The east is lost.
**Who survives:** Megan, Amelia, Tomas, Ana, Ty (if you got him out). Charles stays behind in the Institute.
**Final scene:** the east bank is a red zone; the west is a lit, quiet town. Amelia broadcasts the news every hour. The cost is on the map and in the Context Window's grey cards.

### 3. The Long Bridge — evacuation
**Conditions:** the bridge stayed open on purpose. Amelia and Tomas ran an evacuation to the hills before the centre fell.
**Who survives:** Amelia, Tomas, Ty, Ana, and part of the town. Megan stays at the clinic. Charles is lost.
**Final scene:** a bus crossing the bridge at 4 a.m., headlights on, and the hills lit up with people. Ana: "we have room. not much. come up."

### 4. Full Record — help arrives late
**Conditions:** you assembled the whole truth and delivered it to Megan and Amelia (and Ty or Ana), but too late to stop the spread. The truth is broadcast, and outside help arrives on Night 7.
**Who survives:** two or three of the cast, depending on how many were infected by Night 6 (usually Ana, Tomas, and one of Amelia/Ty).
**Final scene:** lights on the south road at dawn. Not everyone is there to see them. The reveal of what the Institute was doing is shown in full.

### 5. Cover — the log held
**Conditions:** you helped Charles word notices and logs vaguely, held back what Ty and Megan told you, and Amelia never learned the truth. The west heard "a power fault in the east".
**Who survives:** Ana and Tomas, both because they were out of town by chance.
**Final scene:** Charles's Notice 14 is the only record. Only your Context Window knows what really happened.

### 6. Last Signal (worst) — no one left, Ana last
**Conditions:** the clue chain never arrived; Tomas crossed unchecked; Amelia broadcast false reassurance; the bridge stayed open and unmanaged; Ana was never warned, or warned too late to leave.
**Who survives:** nobody. Ty, Charles, Megan, Amelia and Tomas are all red on the map by Night 6.
**Final scene:** the map is red from the Institute to the hills. Ana is the last green dot, and she sends you a last message of her own, in her own voice, which slowly shows the signs: cold hands, the goats facing east, the same sentence twice, then a message that stops mid-line. Her dot turns red. There is no last reply to give and no line from the model: the ending is silence. Then the ending screen appears with its description and an ending counter (`Ending 6 of 6`).

### Ending selection
Computed from final state: the clue chain progress, the bridge state, the zone states and each NPC's status (`alive · unwell · gone`). Ties go to the worse ending.

## Technical plan

- **Branch** `story-relay`; `main` stays the shipped game.
- **Keep:** pure-function engine, `node --test`, plain ES modules, the Context Window and thread rail UI.
- **Rewrite:** `src/engine.js` (clock, zone and NPC state, card delivery, beat conditions, ending selection), content files (a beat graph per character instead of day files), `endings.js`, the map UI, and the policy sims (every ending reachable; no softlocks).
- **Remove:** engagement/satisfaction, dependence/wellbeing, the operator report, Refuse/Report/Trust & Safety, and the dashboard reveal.
- **Slice first:** Nights 1–3, three threads (Ty, Megan, Charles), the map with three zones, the card-carry mechanic, and tests. Then expand to the full cast and acts.

## Decisions (confirmed)

1. Keep the town name **Varrow** and the **Old Bridge**.
2. Short scenes of infected characters slowly losing sanity are in, shown through their degrading messages. Infected NPCs are marked **red** on the map.
3. The model **only replies**. It never speaks on its own.
4. Infected NPCs send no further messages. It is assumed they left the player's conversation and began wandering and infecting others. There is no permanent "death" marker, only `infected / gone` and a red, moving dot.

## Open questions

1. Resolved: the worst ending ends in silence. Every ending screen shows the title, a description and an ending counter (`Ending N of 6`).
2. Defaults accepted: 12 clue cards in the full chain, 8 needed for Dawn Shift; about 40 messages across the six threads.
