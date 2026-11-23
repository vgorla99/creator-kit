---
name: reel-pipeline
description: Make a reel in Creator Kit from start to finish. Use when the creator sends an idea, a script, their own footage, a website to promote, or a monthly plan and wants a reel, short video, trial reel, cover or carousel. Routes the input to the right engine and template, then runs plan → OK → build → stills → OK → render → package → post → learn, with the kit's 12-rule standard and the creator's brand from brand/brand.yaml.
---

# Reel pipeline

The creator brings the idea; the kit brings the look and the steps. Templates give the look. The script, hook, words and moves are new for every reel.

Read first, every time: `brand/brand.yaml` and `brand/STYLE.md`. If they still hold the Kiln Hour example, suggest `/brand-intake` before making anything public.

## 1. Route the input

| The creator brings | Route | Where |
|---|---|---|
| A month of tips, myths, lists or quick explainers | monthly plan (footage blocks, captions, carousels) | copy `reels/content/example/` to `reels/content/<yyyy-mm>/`, edit `plan.json`, `npm run produce -- <yyyy-mm> --week 1` |
| Their own clips (talking head, b-roll, screen recording) | footage engine inside the plan | `npm run library` adds clips; stock B-roll (Wikimedia, Pexels, Pixabay) with licences logged: the `broll-scout` skill |
| One idea that deserves its own look | hand-built reel | `npm run new -- <slug>` copies the starter; `npm run reel -- <Id>` renders it |
| A product, app or website to promote | product promo | engine `remotion`: the `video-shotcraft` skill; engine `hyperframes`: `motionmaxxing` |
| A one-off motion graphic, kinetic type, a brand sting | motion piece | `motion.engine` decides: Remotion starter, or HyperFrames (`motionmaxxing` + `hyperframes`, starting from `reels/studio-hyperframes/`) |
| A beat that explains how something works inside (a joint, an engine, a process) | an isometric figure as one insert | the `anatomy` skill, if installed; one figure, approved as a still first |
| A cheat sheet or a list to save | carousel | the plan's carousel slides (4:5), made by `npm run produce` |

Not sure which? Ask one question naming the two closest rows. Never invent a new look silently: propose it and wait.

Full command reference: `docs/reels-remotion.md` (Remotion) and `reels/studio-hyperframes/README.md` (HyperFrames: `npm run hf:preview`, `hf:snapshot`, `hf:check`, `hf:render`). Review drafts, captions and the month in the local dashboard: `npm run dashboard` (http://localhost:5180).

## 2. Steps (every reel)

1. **Understand.** Read the source fully (their notes, a link, the footage). Look at footage as a contact sheet (`ffmpeg -i clip.mp4 -vf "fps=1,scale=270:-1,tile=6x4" sheet.jpg`). If they speak on camera, get word timings (faster-whisper or WhisperX) before writing captions.
2. **Plan in chat, short.** Hook A and hook B (max 6 words each, two different hook types; use `ab-hook-tester` for the pair and check both against the `virality` first-3-seconds rule), the beats, the words on screen, the call to action. For any motion, write the brief with `motion-brief`. **Gate: wait for the creator's OK.**
3. **Build.** New things in new files; never change shared kit code other reels use without asking. Sound effects only where the picture needs them (from `reels/sounds/SOUND-LIBRARY.md`), never on every cut.
4. **Stills.** Render the key frames as one contact sheet (Remotion: `npx remotion still src/index.ts <Id> out/<Id>-f<N>.png --frame=<N>` from `reels/studio-remotion/`, or the review sheet `npm run reel -- <Id> --review-only`; HyperFrames: `npm run hf:snapshot`). **Gate: wait for the creator's OK.**
5. **Render.** `npm run reel -- <Id>` (hand-built) or `npm run produce -- <month> --final <ID>` (plan); HyperFrames: `npm run hf:check`, then `npm run hf:render`. The Remotion render checks 1080×1920, 30 fps, ≤ 60 s.
6. **Package** into `reels/content/00_Ready/<yyyy-mm-dd>_<slug>/`:
   - `reel.mp4`, `cover.png`, `caption.txt` (caption in the creator's voice; run `humanizer` over it)
   - trial version if `content.trial_reels` is true: `reel-trial-B.mp4` (only the hook changes), `trial-B.txt` (hook type + a caption written for strangers)
   - `NOTE.md`: the idea, each beat, what is real and what is illustrative, anything still weak
   Media files stay on the computer (git-ignored).
7. **Post** only through `post-video`, which always confirms first. After posting, move the folder to `reels/content/01_Live/`.
8. **Learn.** Add the post's numbers to `reels/content/_metrics/metrics.csv` when they come in; once a month run `content-calendar-from-analytics`.

## 3. Checks before 00_Ready

- Everything important inside `visual.safe_zone`. Hook readable on mute in the first 3 seconds.
- Brand colours and fonts only; at most 2 overlay types on screen at once.
- Captions: every spoken word, short chunks (≤ 4 words), synced, never on the end card.
- End card from `visual.end_card` (line + button), held 0.6–1.4 s.
- `npm run typecheck` passes if you touched studio code.

## 4. The standard: 12 rules for every motion reel

1. **Understand before designing.** Pull the real facts and their honest limits. Write four lines: the problem, who watches, the goal, the feeling. Name the one true thing the reel is for.
2. **One idea from the subject's own world.** Ask which object, material or gesture belongs only to this world. Write three different ideas, pick one with a reason. Test: cover the handle; if a competitor could post it unchanged, it is not ours.
3. **One carried object.** It travels through every beat and changes role. It moves and changes size between scenes; it is never pinned in one spot.
4. **Storyboard before code.** Per beat: what it makes the viewer believe, what moves, how it enters and exits, how it hands off. Hook ≤ 3 s, the proof gets the most time, one hero moment worth a screenshot, the end calmer than the start.
5. **Show, don't caption.** Every claim gets its own picture doing the thing. No stat slides, no walls of text.
6. **A world, not a page.** A lit, textured ground from the subject; objects with shadows. One accent colour with one meaning; the highlighter once, on the point.
7. **Camera joins, cut on motion.** Scenes connect through camera moves with motion blur at peak speed; the cut lands mid-move. No crossfades between scenes.
8. **Measured motion.** Things arrive fast and settle (long ease-out, no bounce unless the brand wants it); exits accelerate away. Words land at speech rhythm. A held scene keeps something alive. No dead frames.
9. **No page chrome.** No corner labels, page dots, counters or progress bars. The end card arrives by cause.
10. **Sound designed to picture.** A natural, human voice (≈ `voice.words_per_second`), a music bed ducked under it, a few hand-placed hits with silence before the important one. Mix to −14 LUFS.
11. **Look honestly before showing.** Render, pull a frame every second, describe each in one sentence, measure (length, empty frames, end hold, loudness). Fix in this order: untrue → idea → joins → hierarchy → timing → finish → sound. Never call it perfect yourself.
12. **The creator's gates stay.** Plan → their OK. Stills → their OK. Then the full render and the package. Nothing is posted without `post-video`'s confirmation.
