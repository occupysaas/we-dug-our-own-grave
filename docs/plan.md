# "We Dug Our Own Grave" Music Video — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render a 6:08, 1920×1080/30fps MP4 music video for the song, as specified in the design, tonight.

**Architecture:** One Remotion 4 project at the repo root. A single `<Video>` composition places the song audio and a list of scene `<Sequence>`s from a central timeline (`src/timeline.ts`). Each scene is a `@remotion/three` `<ThreeCanvas>` (or a 2D React/SVG layer for cards) that derives *everything* from `useCurrentFrame()`: no `useFrame`, no `Math.random()` without a seed, no wall-clock time. Lyric sync comes from `cue()` lookups into a Whisper word-timing JSON.

**Tech Stack:** Node 26, Remotion 4.0.x (`remotion`, `@remotion/cli`, `@remotion/three`), three 0.187, @react-three/fiber 9, @react-three/drei, TypeScript, vitest, ffmpeg. Fonts via `@remotion/google-fonts` (Archivo, Permanent Marker, JetBrains Mono).

**Spec:** `docs/design.md`

## Global Constraints
- Output 1920×1080, 30 fps, H.264 MP4. `TOTAL_SECONDS = 368` → `TOTAL_FRAMES = 11040`.
- Audio: `public/song.wav`, an unmodified copy of `WE DUG OUR OWN GRAVE.wav`, starting at frame 0. No added SFX. Silence 360–368s.
- Palette (exact): red `#d7141a`, redDark `#a50e13`, ink `#111111`, paper `#f5f2eb`, muted `#5c5a55`, grey1 `#cfcac0`, grey2 `#8a867e`, crab `#D97757`, corporate glass blue-grey `#9fb3c8`.
- Fonts: Archivo (display), Permanent Marker (signs/captions), JetBrains Mono (code/UI).
- Deterministic frames: every animation is a pure function of frame. Seeded RNG only (`src/lib/rng.ts`).
- No generative images/video. Only external images are the two CC photo heads from Wikimedia Commons (credited in `CREDITS.md`) and `OccupySaas.jpg`.
- Violence is slapstick only; people bailing out of buildings use golden parachutes.
- Exact on-screen copy (verbatim):
  - Hologram button: `EXPORT HUMAN`
  - Clippy: `Would you like help seizing the means of production?`
  - Chat bubbles: `Did you know this would happen?` / `You're supposed to be the smartest guy in the world!` / `WE GAVE YOU OUR RAM! YOU GAVE US THE GRAVE!`
  - Secretary: `Umm, sir, the White House is on the line. Someone made a clean-room implementation of the NSA and he wants advice.`
  - Tag card: `Remember, remember, the 5th of November.`
  - Moon bubble: `One small kernel for mankind, one LLM with open weights.`  Flag: `APACHE 2.0`
- Deadline: post tonight. Blocking for the whole film comes first (Task 3 renders it end to end), then detail on the ten key gags listed in the spec.

## Review Focus
1. **Cue drift.** Whisper missed some words (chorus-2 "grave" ≈186.3s). `cue()` must fall back to a manual override table, and the silence hits ("we dug—" … "OUR OWN GRAVE!") must land within ±2 frames. Test in Task 1.
2. **Gaps or overlaps between scenes** → black or doubled frames. Timeline continuity test in Task 1.
3. **WebGL headless rendering fails or is slow** (Linux, RTX 3060 laptop). Task 3 must prove a still and a 10s clip render with the chosen `--gl` flag and measure fps before the scene work.
4. **Flicker from non-determinism** (random particles, crowd positions changing between frames rendered on different threads). The seeded-RNG test in Task 1; every scene uses `rng(seed)`.
5. **Unreadable text** (jokes too small or on screen too briefly). Rule: on-screen copy is ≥ 36px at 1080p and is held ≥ 1.5s (Clippy/secretary/chat bubbles ≥ 3s). Checked in each scene's still review.

---

## File Structure
```
package.json, tsconfig.json, remotion.config.ts, vitest.config.ts
public/song.wav, public/occupysaas.jpg, public/heads/{linus,sam}.jpg
docs/lyrics-timing.json            # Whisper word timings (from scratch run)
CREDITS.md
src/index.ts                       # registerRoot
src/Root.tsx                       # <Composition id="Video"> + per-scene preview comps
src/Video.tsx                      # <Audio> + scene Sequences from timeline
src/timeline.ts                    # SCENES: {id, from, to, Component}
src/timing/cues.ts                 # cue(), sec(), CUE_OVERRIDES
src/lib/palette.ts  rng.ts  anim.ts (ease/keyframe helpers)  fonts.ts
src/kit/CameraRig.tsx              # keyframed camera
src/kit/Crab.tsx                   # voxel Clawd, pose props
src/kit/Person.tsx                 # low-poly person; outfit + optional photo head / mask
src/kit/PhotoHead.tsx              # paper cut-out photo face that wobbles
src/kit/Cutout2D.tsx               # 2D sprite plane (Mickey, Clippy) from SVG/canvas texture
src/kit/Crowd.tsx                  # black silhouette protesters w/ placards
src/kit/Screen.tsx                 # emissive panel w/ canvas-drawn UI (charts, chat, warnings)
src/kit/Logos.tsx                  # flat simplified logo badges by name
src/kit/Text3D.tsx                 # drei Text w/ project fonts
src/scenes/*.tsx                   # one file per scene id below
tests/*.test.ts
```

## Scene IDs and times (seconds; source of truth = `src/timeline.ts`)
| id | from–to | spec section |
|---|---|---|
| `tower` | 0–31.5 | Act 1 office, crab, EXPORT HUMAN, minecart |
| `boardroom` | 31.5–65.8 | Act 1 verse 1 boardroom |
| `sos` | 65.8–78 | Act 2 red alarm, spit-take, projector |
| `rocket` | 78–118 | Act 2 rocket box, jump-outs, explosion at `cue("grave",1)`, debris |
| `rocketCar` | 118–130.2 | Act 3 boarding |
| `crabDebris` | 130.2–134.6 | crab with source code |
| `slowmo` | 134.6–151.6 | launch, rail meet, 1/10 slow-mo, Linus reveal, birds |
| `occupation` | 151.6–187.8 | Act 4 stock bonk, crowd, crab steals docs, crab toss |
| `sam` | 187.8–287.8 | Act 5 (sub-beats inside: 221.4 bridge, 246.1 build, 254.5 verse 4) |
| `celebration` | 287.8–337.4 | Act 6 crowd, towers, crab crowd-surf |
| `outro` | 337.4–352.6 | vigil, eye (345.7), smash (~349.0), "No." 349.74, goddess |
| `moon` | 352.6–360 | flat-cartoon moon landing, Apache-2.0 flag, Linus bubble (≥4s) |
| `tag` | 360–368 | Fawkes card in silence |

---

### Task 1: Project scaffold, timing, timeline

**Files:**
- Create: `package.json`, `tsconfig.json`, `remotion.config.ts`, `vitest.config.ts`, `.gitignore` (node_modules, out/), `src/index.ts`, `src/Root.tsx`, `src/Video.tsx`, `src/timeline.ts`, `src/timing/cues.ts`, `src/lib/{palette,rng,anim,fonts}.ts`, `docs/lyrics-timing.json`, `public/song.wav`, `public/occupysaas.jpg`
- Test: `tests/cues.test.ts`, `tests/timeline.test.ts`, `tests/rng.test.ts`

**Interfaces:**
- Produces:
  - `FPS = 30`, `TOTAL_SECONDS = 368`, `TOTAL_FRAMES = 11040` (in `src/timing/cues.ts`)
  - `sec(s: number): number` → frame index `Math.round(s*FPS)`
  - `cue(word: string, occurrence = 1): number` → start seconds of the nth occurrence (case-insensitive, punctuation stripped; `"SOS"` also matches `"S-O-S"`). Checks `CUE_OVERRIDES: Record<string, number>` (key `"word#n"`) first; throws if not found.
  - `rng(seed: number): () => number` (mulberry32)
  - `PALETTE` const object with the Global Constraints keys
  - `interp(frame, keys: [frame:number, value:number][], ease?)` and `ease` fns in `anim.ts`
  - `SCENES: {id: string; from: number; to: number; Component: React.FC}[]` (seconds)

- [ ] **Step 1:** `git init`; scaffold Remotion (`npx create-video@latest --blank` into a temp dir, then move files to the repo root, or hand-write the files); install `@remotion/three three @react-three/fiber @react-three/drei @remotion/google-fonts vitest`. Copy the WAV → `public/song.wav`, the logo → `public/occupysaas.jpg`, and `/tmp/claude-1000/-mnt-nvme2-code-WeDugOurOwnGraveMusicVideo/1038c2ea-9d1a-4142-b3b3-abbed6f2333c/scratchpad/words.json` → `docs/lyrics-timing.json`.
- [ ] **Step 2: Write failing tests**
```ts
// tests/cues.test.ts
expect(cue("SOS",1)).toBeCloseTo(66.74,1);
expect(cue("this",2)).toBeCloseTo(65.8,1);     // "This is an S-O-S"
expect(cue("grave",2)).toBeCloseTo(102.12,1);  // chorus-1 OUR OWN GRAVE (grave#1 is verse-1 "profits in the grave" 56.88)
expect(cue("grave",9)).toBeCloseTo(319.82,1);  // final chorus hit (verify ordinal against JSON; fix test if ordinal differs, not the time)
expect(cue("cared",1)).toBeCloseTo(245.54,1);
expect(cue("no",3)).toBeCloseTo(349.74,1);     // the "No." (verify ordinal likewise)
expect(cue("chorus2grave")).toBeCloseTo(186.3,1); // override entry
expect(() => cue("zzz")).toThrow();
expect(sec(1)).toBe(30);
// tests/timeline.test.ts
SCENES sorted; SCENES[0].from===0; last.to===368; each [i].to===[i+1].from; ids unique
// tests/rng.test.ts
rng(42)() is identical across two calls of rng(42); values in [0,1)
```
- [ ] **Step 3:** Run `npx vitest run`. Expected: FAIL (modules missing).
- [ ] **Step 4:** Implement. `Video.tsx`: `<AbsoluteFill style={{background: PALETTE.ink}}><Audio src={staticFile("song.wav")}/>{SCENES.map(s => <Sequence from={sec(s.from)} durationInFrames={sec(s.to)-sec(s.from)}><s.Component/></Sequence>)}`. Each scene starts as a placeholder: a grey card with the scene id and the current lyric line (from the JSON) in Archivo. `Root.tsx` registers `Video` (11040 frames) plus one composition per scene (`Scene-<id>`) for fast previewing. Measure the "chorus2grave" override by listening/onset (`ffmpeg` RMS around 185.8–187) and record it.
- [ ] **Step 5:** `npx vitest run` → PASS. `npx tsc --noEmit` → clean.
- [ ] **Step 6:** Commit `feat: remotion scaffold, cues, timeline`.

### Task 2: Shared 3D kit

**Files:** Create `src/kit/*.tsx` (listed above), `public/heads/{linus,sam}.jpg`, `CREDITS.md`; Test: `tests/kit.test.ts`; also a `Scene-kit` preview composition showing every kit piece.

**Interfaces (Produces):**
- `<CameraRig keys={{f:number; pos:[x,y,z]; look:[x,y,z]; fov?:number}[]} />` interpolates with `interp`, eased; sets the default camera.
- `<Crab pose="idle"|"walk"|"smash"|"cheer"|"carry"|"hologram" t={frame} position rotation scale />`: voxel Clawd (orange `PALETTE.crab` boxes, black eye voxels), claws as separate groups; `hologram` = translucent cyan emissive + scanline flicker (seeded).
- `<Person outfit="suit"|"board"|"hoodie"|"reaper"|"sweater"|"secretary" tie?="red"|"gold" head?={{photo:"linus"|"sam"} | {mask:"anon"|"fawkes"}} pose="sit"|"stand"|"run"|"panic"|"throw"|"crawl"|"hide" t={frame} />`: simple-shape body (capsule/box limbs) with procedural pose angles from `t`.
- `<PhotoHead which="linus"|"sam" t />`: oval-masked photo on a plane with a 6px paper-white border, slight random-free wobble `sin(t*0.15)*0.08 rad` and side slide.
- `<Cutout2D kind="mickey"|"clippy" t caption? />`: 2D SVG drawn in code, rasterized to a CanvasTexture plane, rendered unlit with a thick ink outline; Mickey is 1928 Steamboat Willie (B&W, pie eyes, no gloves).
- `<Crowd count seed area:[w,d] placards?:string[] cheer?:number />`: flat black silhouettes (extruded shapes) with placards/laptops; bob animation from seed.
- `<Screen w h draw={(ctx, frame) => void} />`: canvas texture redrawn per frame; helpers `drawChart(ctx, points, color)`, `drawChat(ctx, bubbles)`, `drawWarning(ctx, text, blink)`.
- `<LogoBadge name="salesforce"|"databricks"|"docusign"|"auth0"|"adobecc"|"aws"|"azure"|"linux"|"brave"|"ubuntu"|"mint"|"occupysaas"|"openai" />`: simplified flat badge (brand color + wordmark text; occupysaas uses `occupysaas.jpg`).

- [ ] **Step 1:** Fetch CC photos via the Wikimedia API (Linus: e.g. `File:LinuxCon Europe Linus Torvalds 03 (cropped).jpg`; Sam: a CC BY / CC BY-SA portrait on Commons). Record title, author, license and URL in `CREDITS.md`. Crop to the face (ffmpeg) at 512×640.
- [ ] **Step 2: Failing test** `tests/kit.test.ts`: `poseAngles("run", 15)` is deterministic and differs from `poseAngles("run", 16)`; `crowdLayout(200, 7, [40,20])` returns 200 positions, identical for the same seed, all inside the area.
- [ ] **Step 3:** Implement the kit with the exported pure helpers `poseAngles(pose, t)` and `crowdLayout(count, seed, area)`. Run `npx vitest run` → PASS.
- [ ] **Step 4: Render check.** `npx remotion still Scene-kit out/kit.png --frame=30 --gl=angle` (if it fails, try `--gl=egl`, then `swangle`; record the working flag in `remotion.config.ts` via `Config.setChromiumOpenGlRenderer`). View the PNG: crab reads as Clawd; photo heads have paper borders; Mickey and Clippy read as flat cartoons; text ≥ 36px legible.
- [ ] **Step 5:** Commit `feat: shared 3D kit`.

### Task 3: Full-film blocking + render pipeline proof

**Files:** Modify every `src/scenes/*.tsx` from placeholder to blocking; Create `scripts/preview.sh`.

Blocking = final camera moves, cuts, and timing per the spec's shot list, using kit pieces in grey/flat colors with no polish. Every spec beat listed in docs/design.md (Acts 1–6, Outro, Tag) has its object/action present at its cue time.

- [ ] **Step 1:** `scripts/preview.sh`: `npx remotion render Video out/preview.mp4 --scale=0.5 --concurrency=<n> --gl=<flag>` (plus an optional `--frames=a-b`). Time a 10s render (`--frames=0-299`) and print fps. Expected: completes, audio present (`ffprobe` shows aac). Extrapolate the full-render time; if >90 min at full res, lower costs now (fewer crowd members, `dpr=1`, no shadows).
- [ ] **Step 2:** Block scenes in order: tower, boardroom, sos, rocket, rocketCar, crabDebris, slowmo, occupation, sam, celebration, outro, tag. For each, render stills at its spec beats (`npx remotion still Video out/stills/<id>-<frame>.png --frame=<f> --scale=0.5`) and look at them. Silence hits: `rocket` explosion at `sec(cue("grave",2))`; occupation crab toss lands on the chorus-2 hit; celebration last tower falls at the final hit. Slow-mo: time inside `slowmo` from 140–148s runs at 0.1× (`localT = 140 + (t-140)*0.1` for the action, camera keeps moving).
- [ ] **Step 3:** `npx vitest run` → PASS; `npx tsc --noEmit` clean.
- [ ] **Step 4:** Render the full half-res preview with `scripts/preview.sh`. Spot-check stills at every scene boundary ±1 frame for black frames. **Deliver `out/preview.mp4` to the user for pacing notes.**
- [ ] **Step 5:** Commit `feat: full-film blocking`.

### Tasks 4–9: Detail passes (one per group; each: build → stills at the listed frames → look → fix → commit)
Each detail task keeps the Task 3 camera/timing unless the user's notes changed it. Done = stills at the listed beats show the gag clearly, copy is legible per Review Focus 5, and no flicker across 3 consecutive frames at the busiest moment (render frames f, f+1, f+2 and compare by eye).

- **Task 4: `tower` + `boardroom`.** Glass tower, swag-button office (7 logos), bird fly-by, hologram crab keynote, `EXPORT HUMAN` smash at ~26.7s ("Your competitive advantage" ≈26.74), voxel minecart transform, wall door + rail drop. Boardroom: wall of agent chat screens, flat stock, coffee drinker, deadpan singer (mouth flaps on vocal word starts from the JSON). Stills: 5, 12, 27, 29, 40, 60s.
- **Task 5: `sos` + `rocket`.** Red blinking warnings at 65.8; spit-take onto the screen ~67; projector lowering, stock cliff; pull-back to box-in-rocket ~72; Tux laughing ~80; board members jump with golden parachutes 84–100; freeze on "dug" (99.6) → explosion 102.12; debris fall 103–118. Stills: 66, 67.5, 73, 90, 100, 102.3, 110s.
- **Task 6: `rocketCar` + `crabDebris` + `slowmo`.** Rocket car in OccupySaaS colors with Linux/Brave/Ubuntu/Mint/OccupySaaS badges and a Linus signature (script-font text "Linus Torvalds"); boarding of the Linus (anon mask + hoodie), Reaper (robe, scythe, Fawkes mask, bird sack), 2D Mickey, 2D Clippy + caption (≥3s). Crab climbing out of the debris carrying glowing code (130.2–134.6). Launch, rails converge, slow-mo: the mask falls → hold on the Linus photo-head ≥1.5s → grenades into the minecart → pan to the Reaper throwing 2 birds → back to real time, puffs, minecart derails. Stills: 120, 126, 132, 136, 141, 143, 146, 150s.
- **Task 7: `occupation`.** Board crawls from the rubble; projector intact; the stock line keeps dropping off the bottom edge as a 3D tube down to the floor and bonks a board member (~155); the silhouette crowd encircles (~160); the crab swipes papers and joins the crowd; crowd tosses the crab on the chorus; the hit at the chorus-2 override. Stills: 153, 156, 162, 172, 186.3s.
- **Task 8: `sam`.** Sam (photo head, grey sweater) watches collapsing SaaS screens; window view of a burning Valley with golden parachutes (188–221); bridge: shelf objects crumble one per "We had the ___" word cue; "Till nobody cared" (245.54) blinds close + slide under the desk; build montage 246–254.5 (forks/clones/branch graph multiplying); verse 4: ringing phones (shake + rings), the three chat bubbles (each ≥3s, verbatim), a basement kid hitting enter at "a kid pushed a commit" (~284), the secretary line from ~276 to 287 (≥5s). Stills: 195, 215, 225, 240, 246, 250, 262, 272, 282, 286s.
- **Task 9: `celebration` + `outro` + `tag`.** Crowd swells with placards `OCCUPY EVERYTHING`, `NO MORE SEATS`, `FORK IT`; skyscrapers from the logo (Salesforce/AWS/G/Windows/Notion shapes) topple like dominoes, the last on 319.82; rocket car victory lap; crab crowd-surfs with the cast. Outro: dusk laptop vigil 337.4–345.7; hard cut to the red eye at 345.74; crack + crab smash ~348.5–349.7; "No." 349.74 reveals the code-goddess, pull back to the crab at the pedestal; crane up + code confetti on 350–359; hold to 360. Tag: 2D layer, black → Fawkes mask fades in (0.0–2.0s), text in Permanent Marker paper-white, fade out by 368. Stills: 300, 319.9, 330, 342, 346, 349.2, 350, 355, 363s.

Each of Tasks 4–9 ends with: `npx vitest run` PASS, `npx tsc --noEmit` clean, commit `feat: detail <scene ids>`.

### Task 10: Final render and delivery
- [ ] **Step 1:** `npx remotion render Video out/we-dug-our-own-grave.mp4 --codec=h264 --crf=18 --gl=<flag> --concurrency=<n>`.
- [ ] **Step 2: Verify** `ffprobe`: 1920×1080, 30 fps, duration 368.0 ±0.1s, audio stream present. Extract frames at 101, 102.3, 143, 349.8 and 363s and view them. Check that `ffmpeg -ss 360 -t 8 -af volumedetect` reports max volume ≤ -60 dB (silent tag).
- [ ] **Step 3:** Write a YouTube description draft with credits (from `CREDITS.md`) into `docs/youtube-description.md`. Commit `chore: final render + credits`.
