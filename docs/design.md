# "We Dug Our Own Grave" — Music Video Design

Theme song for **occupysaas.com**. Satirical doom-pop by thomasjmeadows (Suno). Video built entirely in code: **Remotion + Three.js** (react-three-fiber), optionally Blender for asset prep. No generative images or video.

## Intent

A satirical, ultimately **joyful** music video. SaaS executives who laid off their engineers in the name of AI get undone by those same engineers wielding open-source software and AI. The viewer should **smile** at the end: it's a victory party for laid-off devs, not an angry or bleak piece. The Guy Fawkes card at the end is a wink, not a threat.

Inspiration: the *Imaginative Prompting* YouTube music videos (LGTM / "End of the Show" style). Key ideas borrowed: relatively simple 3D scenes and characters (simple shapes, one standout feature each), **dynamic camera moves and long continuous shots**, lyrics/UI on screens, and visual gags rewarding a pause. Deviation from his style is fine.

### Goals
- Every lyric beat is visually synced to the song (word timings in `docs/lyrics-timing.json` once generated).
- It's funny: comic timing, sight gags, readable jokes on screens and signs.
- On-brand for OccupySaaS: palette, fonts, protest-poster visual language, black silhouette crowd from the logo.
- The ending lands as triumphant and happy.

### Non-goals
- Photoreal humans or faces. (Real people get photo cut-out heads instead; see Characters.)
- Exact recreations of copyrighted designs. HAL is an *homage* (a red AI eye), Mickey is the **1928 public-domain Steamboat Willie** design only, and Clippy is a parody paperclip.

### Anti-goals (failure even if it "works")
- Reads as bleak, nihilistic, or genuinely violent. Violence stays cartoon-slapstick (birds, comic grenades with puff-of-smoke results, golden parachutes instead of people falling).
- Visual mush: busy frames where the gag or lyric can't be read.
- Drifting out of sync with the music.

## Output
- 1920×1080, 30 fps, H.264 MP4 with the song's audio (use the WAV as the master source).
- Total length about **6:08**: the song is 6:00 (vocals end ~358.7s), followed by about 8s of **total silence** for the Guy Fawkes card.
- Credits for CC-licensed photos go in the YouTube description (builder produces a `CREDITS.md`).

## Schedule & Scope
- **Post tonight, 2026-11-05** (matches the "5th of November" tag). Plan for: the full film blocked and synced end to end, with detail focused on the **key gags** (crab button smash + minecart, coffee spit-take, stock cliff + rocket explosion, crab with source code, Linus mask reveal + birds, stock line bonking a board member, crab tossed by crowd, Sam under desk + secretary, eye smash + goddess, Fawkes card). Secondary shots stay simple but clean. Render time must fit in the evening.
- **Audio: the untouched song only. No added sound effects** (may revisit later), so every gag must land visually.

## Visual Style
- **World:** chunky, toy-like low-poly 3D. Flat or toon shading with bold silhouettes. Ink-black outlines are welcome.
- **Palette (from occupysaas.com CSS):** red `#d7141a`, red-dark `#a50e13`, ink `#111111`, paper `#f5f2eb`, muted `#5c5a55`, greys `#cfcac0` / `#8a867e`. The corporate world leans sterile blue-grey glass until it gets "occupied" and turns red/black/paper. The Claude crab is Claude orange (around `#D97757`).
- **Fonts:** Archivo (display, heavy), Permanent Marker (signs, scrawl, captions), JetBrains Mono (code, terminals, UIs).
- **Crowd:** black flat silhouettes holding placards and laptops, as in the logo (`OccupySaas.jpg`), rendered as billboarded cut-outs or extruded shapes.
- **Cartoon cut-ins ("Roger Rabbit"):** Steamboat-Willie Mickey and the commie paperclip are flat 2D hand-drawn-look sprites living in the 3D world, deliberately out of place.
- **Photo-head cut-outs:** Linus Torvalds and Sam Altman have flat real-photo faces (CC-licensed, from Wikimedia Commons) on low-poly bodies, Monty-Python style. The heads bob, tilt and slide side to side like paper puppets.
- Lyrics may appear diegetically (screens, signs, chat bubbles, charts) at key lines, but this is **not** a full lyric video.
- Logos of real companies and projects appear as satire (Salesforce, Databricks, DocuSign, Auth0, Adobe Creative Cloud, AWS, Azure, Linux/Tux, Brave, Ubuntu, Mint, OccupySaaS). Simplified/flat renditions are fine.

## Characters
| Character | Look / standout feature |
|---|---|
| **The Suit** (CEO) | Low-poly exec, **red power tie**. Main human through-line in Act 1 and the slow-mo fight. |
| **Claude crab** | The **blocky, pixel-style Claude Code mascot (Clawd)** built as chunky orange voxels (fits the Minecraft minecart); our hero and trickster. Expression via claw poses, eye shapes, hops and squash/stretch. Appears as a hologram first, then physical. Gets its own animation rules file once it looks right. |
| **Board members** | Identical suits with **gold tie clips**. One coffee drinker. One **singer** who calmly sings while everyone else panics. |
| **AI agents** | Small floating chat-bubble or orb bots with company-colored accents, talking to each other. |
| **Linus Torvalds** | The "hacker": black hoodie, laptop, **pale plain-white variant** of the mask over his photo-head. |
| **Guy Fawkes rider** | **Grim Reaper from the "Death knocking on doors" meme**: black hooded robe, scythe, wearing the **full-color Guy Fawkes mask**, with a sack of birds. The final card is his callback. |
| **Mickey (1928)** | 2D B&W Steamboat Willie sprite. |
| **Commie Clippy** | 2D paperclip with googly eyes, hammer & sickle motif; caption: *"Would you like help seizing the means of production?"* |
| **Sam Altman** | Photo-head on a grey-sweater body. |
| **Secretary** | Simple low-poly assistant. |
| **Corporate eye** | Red glowing lens in a black panel (HAL homage). |
| **Open-source goddess** | Huge serene female AI made of flowing code and commit-graph light; puppeteered by the crab. |

## Shot Timeline
Times are from a Whisper transcription of the song; fine-tune against the word timings.

### Act 1: The Tower (0:00–1:05)
- **0:00–0:04** Exterior: a glass skyscraper at dawn. The camera rises to floor 100.
- **0:04–0:11** *"Notification from your corporate AI agent…"* Inside, the Suit sits in a high-backed chair. The office is covered in SaaS swag buttons and pins (Databricks, DocuSign, Salesforce, Auth0, Creative Cloud, AWS, Azure). He gazes out the window; a **bird flies by** (we'll see the bird again). A button on the desk projects the **holographic Claude crab**.
- **0:11–0:27** *"We regret to inform our shareholders… complimentary export button."* The crab "presents" like a corporate keynote. Behind it a big hologram button labeled **EXPORT HUMAN**.
- **0:26–0:29** *[chime] "Your competitive advantage has expired."* The crab **smashes the button**. The chair turns into a **Minecraft-style minecart** (blocky), a door slides open in the wall, and a rollercoaster rail plunges down the outside of the building. The minecart drops out of frame. (The rail returns at 2:14.)
- **0:31–1:05** *Verse 1.* Cut to the **boardroom**: people stroll with coffee and charts. A wall of screens shows **hundreds of AI agents chatting** to each other. The main screen shows a **flat stock line**. The **singer** in the background sings the verse deadpan, lip-sync not required (a mouth flap on beats is fine). Small gags on screens tie to lyrics ("clones of all our apps", "a single dev rebuilt it in a day", "fired all the engineers").

### Act 2: S-O-S (1:05–1:58)
- **1:05.8** *"This is an S-O-S"* Screens go **red, blinking warnings**. Everyone except the singer panics and runs around. The coffee drinker **spit-takes onto the screen**.
- **~1:10–1:20** A **giant projector screen** lowers into the middle of the room showing the stock **dropping off a cliff**.
- **~1:12** *"trapped inside the box we built"* The camera pulls back: the boardroom is **a box inside a rocket** headed to space. *"A rocket ship to Mars, a trillion-dollar dream… the world's running Linux"* (Tux could laugh on a screen).
- **1:24–1:41** *Chorus 1.* The rocket shudders; board members **jump out** (golden parachutes). On **"we dug—" [silence]** freeze/hold; **"OUR OWN GRAVE!"** (~1:41) **the rocket explodes** comically.
- **1:42–1:58** *Post-chorus.* Debris drifts and falls back to earth; slow, haunting. The board lands in rubble.

### Act 3: The Open-Source Rocket Car (1:58–2:31)
- **1:58–2:10** *Verse 2 ("Windows users switched to Linux… off-brand is the brand now… Rust efficiency… Adobe's on life support").* A **rocket car on its own track** is prepping to launch, painted in OccupySaaS colors (red/ink/paper, poster style). Its side carries logos for **Linux/Tux, Brave, Ubuntu, Mint, OccupySaaS** and a big **Linus Torvalds signature**. Boarding: the **Anonymous-mask rider**, the **Guy Fawkes rider**, **2D Mickey** (out of place, Roger Rabbit style), **2D Commie Clippy** with its caption bubble.
- **2:10–2:14** *"…while the source code runs free."* Quick cut: the **Claude crab climbs out of the rocket debris** carrying a glowing stack of **source code**. Then cut back.
- **2:14–2:31** *Salesforce / Zero Authy / "can't sell twenty-three" / host it for free.* The rocket car launches and climbs, and its track meets the **Suit's minecart rail**. Side by side: a **1/10-speed slow-motion** sequence (Anchorman 2 camper-van homage). The **Anonymous mask falls off**: surprise, **Linus photo-head**, deadpan, hold the beat. He lobs **grenades into the minecart**. Pan to the **Guy Fawkes Reaper** "throwing two birds" — flipping the Suit off with **both middle fingers**. Return to real-time with comic puffs of smoke; the minecart goes off the rails.

### Act 4: Occupation (2:31–3:08)
- **2:31** *"S-O-S! Our stock is down again!"* Board members crawl out of the rubble. The projector screen is still intact; the stock line drops so far it **runs off the bottom of the screen, down onto the ground, and bonks a board member**.
- **~2:40–2:50** *"…came back for revenge… they're automating us."* The wrecked board is **surrounded by the black silhouette protest crowd** (logo style, placards and laptops). The board has lost control.
- **2:50–3:08** *Chorus 2.* The **Claude crab walks up** to the collapsed board, **swipes more documents**, and walks into the crowd. Crowd and crab celebrate; they **toss the crab into the air**, cheering. Same silence hit on **"we dug—" / "OUR OWN GRAVE"** (~3:06).

### Act 5: The Final Act of the SaaS Companies (3:08–4:48)
Sam Altman's office, about 100s, so it's broken into beats:
- **3:08–3:41** *Verse 3 ("paid a billion for the keys… someone trained a model… open models came along").* OpenAI-style boardroom/office. **Confused Sam (photo-head)** watches screens of SaaS logos collapsing; these companies were his investors. He goes to the window: **Silicon Valley burning**, executives bailing out of towers on **golden parachutes**.
- **3:41–4:06** *Bridge, whispered piano ("We had the patents… brands… lawyers… plans… servers… cloud… a million users").* Each "We had the ___" is an object on Sam's shelf (trophy, patent plaque, server rack, cloud plushie…) **crumbling or getting repo'd** one by one. On **"We had the future…" [long pause] "Till nobody cared."** Sam **closes the blinds** (Elon homage) and **slides down under his desk**.
- **4:06–4:14** *Build ("Another app… another clone… another fork… another billion wiped away").* Accelerating montage: screens filling with forked repos, clones, git branch graphs multiplying; a stock ticker spinning.
- **4:14–4:47** *Verse 4.* **Phones ringing off the hook.** Screens show AI agents representing the SaaS companies in **chat bubbles**: *"Did you know this would happen?" / "You're supposed to be the smartest guy in the world!" / "WE GAVE YOU OUR RAM! YOU GAVE US THE GRAVE!"* Lines like *"a kid pushed a commit"* can show a kid in a basement hitting enter. Near the end, the **secretary finds Sam under the desk**: speech bubble/subtitle: *"Umm, sir, the White House is on the line. Someone made a clean-room implementation of the NSA and he wants advice."* Sam's head slides slowly back under the desk.

### Act 6: Celebration (4:48–5:37)
- **4:48–5:02** *Final pre-chorus, soaring.* Back to the crowd. The red-and-black protest crowd swells; placards ("OCCUPY EVERYTHING", "NO MORE SEATS", "FORK IT").
- **5:02–5:20** *Final chorus, cinematic.* The crowd **tears down the SaaS skyscrapers** (the buildings from the logo topple like dominoes). The open-source rocket car does a **victory lap** overhead. Silence hit on **"we dug—" / "OUR OWN GRAVE!"** (~5:18): the last tower falls.
- **5:20–5:37** *Final post-chorus, euphoric ("the empire falls but the code is here to stay").* The **crab crowd-surfs**; the cast (Linus, Reaper, Mickey, Clippy) is in the crowd.

### Outro (5:37–6:00)
- **5:37–5:45** *Music box: "They cut us… we commit / locked us out… we fork it / no more seats, no more fees."* Dusk. Laptops glow in the crowd like vigil candles; the crab sits on someone's shoulders.
- **5:45–5:49** *Cold voice: "You will own nothing… and be happy."* **Hard cut** to the **red corporate AI eye** filling the frame.
- **~5:49** *[glitch, silence]* The lens **cracks**; the **Claude crab smashes through** it claw-first, glass flying at camera.
- **~5:50** *"No."* Through the hole: the **open-source goddess**, warm and glowing, made of code. Pull back to reveal the **crab at a control pedestal puppeteering her** (Wizard of Oz).
- **5:50–5:52.6** *"YOU WILL OWN EVERYTHING…"* She raises her arms; the camera cranes up over the cheering crowd; **code confetti**.
- **5:52.6–6:00** *"…AND BE HAPPY!" + final "Own everything… and be happy."* **Moon landing, flat cartoon style (2D)** (user idea, added 2026-11-05): the open-source rocket car lands on the moon; **Linus plants an Apache-2.0-licensed flag**. Chat bubble (held to the end): *"One small kernel for mankind, one LLM with open weights."* Earth in the sky.

### Tag (6:00–~6:08, total silence)
- Fade to black. **Guy Fawkes mask fades in, filling the screen.** Text: **"Remember, remember, the 5th of November."** Fade out.

## Process (from the tutorial, adopted)
1. Extract word-level lyric timings to JSON (Whisper; already done in a scratch run, regenerate into the repo).
2. **Blocking pass first:** whole film with grey primitives, final camera moves and cuts, synced to audio, so pacing can be reviewed end to end.
3. **Detail pass per act** on top of locked blocking: models, materials, lighting, gags, screen UIs.
4. Low-res preview renders for review; the user gives notes; iterate.
5. Write down rules that work (e.g. crab animation rules) in a rules file so they stay consistent.

## Decided by the user
- Tools: Remotion + Three.js (Blender optional).
- The whole scene list and gags above where not marked as Claude's call.
- Photo cut-out heads for Linus and Sam; Mickey in Roger-Rabbit 2D style.
- HAL-style eye for "you will own nothing"; crab smashes through it; female AI controlled by the crab for "No."
- Guy Fawkes card after the song, in complete silence.
- Ending tone: happy, celebratory.
- Crab = voxel Clawd mascot. Post tonight. No added SFX for now.

## Claude's calls (user may override)
- Toy low-poly style, OccupySaaS palette, the character signature features.
- Golden parachutes instead of people falling from buildings.
- Act 5 beat breakdown (shelf trophies crumbling during the bridge; closing the blinds at "Till nobody cared"; the fork montage).
- Act 6 celebration (towers toppling, victory lap, crowd-surfing).
- Outro vigil laptops; Wizard-of-Oz reveal; code confetti.
- 1080p30; ~8s silent tag; CC Wikimedia photos with credits.
- Telling the two masks apart by costume (Linus pale mask + hoodie; Reaper robe + scythe + color Fawkes mask).
- Corrected Clippy caption wording slightly ("seizing the means of production").

## Left to the builder
- Exact camera paths, lens choices, lighting, transitions between shots.
- Code architecture of the Remotion project, asset pipeline, whether to use Blender for any models.
- Placement of small on-screen gags and text, as long as they stay readable and on-theme.
