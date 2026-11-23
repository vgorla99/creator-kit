---
name: motion-brief
description: Use when the creator asks for a motion video, motion graphic, animated shot, reel, text animation, transition, captions or title card in Creator Kit, whatever skill or command started it (reel-pipeline, motionmaxxing, hyperframes, video-shotcraft, remotion). Before any code, restate the request as an XML brief (task, art direction, references, timing beats in frames with terms from motion-vocabulary, transitions, captions, sound, deliverable, engine, constraints, verification), show it, then build from it.
---

# motion-brief

Every motion request becomes a written brief before any code. The brief is what gets built and what the result is checked against. Do not skip it.

## 0. Load the brand and the vocabulary

1. Read `brand/brand.yaml` (the `motion` block: `engine`, `aspect`, `fps`, `locked_terms`, `rejected_terms`, `music`; and `visual`: colours, fonts, `safe_zone`) and `brand/STYLE.md` (the feel, in the creator's words). Their choices win over every default below.
   No brand yet (still the Kiln Hour example)? Say so in one line and suggest `/brand-intake` first; carry on only if they want to.
2. Read `.claude/skills/motion-vocabulary/SKILL.md`. Open only the category files you pick terms from.
3. The skill that started the job (reel-pipeline, motionmaxxing, hyperframes, video-shotcraft) stays the builder. This brief is what it builds from.

## 1. Write the brief

Use these tag names every time. Long reference material first, the task last.

```xml
<brief>
  <references>files, frames or links the creator gave, and what to take from each</references>
  <art_direction>palette (brand colour roles), type (brand fonts), texture, mood; terms from the vocabulary</art_direction>
  <timing fps="30" duration="6.0s">
    <beat t="0.00s" frame="0" terms="anticipation, pop, stagger(40ms)">what happens</beat>
  </timing>
  <transitions>
    <transition at="2.00s" frame="60" term="match cut" reason="what connects A and B" />
  </transitions>
  <captions term="word-by-word highlight" chunk="1-4 words" safe_zone="9:16" emphasis="key words only" />
  <sound>
    <cue t="0.00s" frame="0" term="whoosh">which sound, from reels/sounds/SOUND-LIBRARY.md</cue>
  </sound>
  <deliverable>1080x1920, 30 fps, length, format, -14 LUFS</deliverable>
  <engine>remotion | hyperframes, with a one-line reason</engine>
  <constraints>deterministic and seekable; libraries to use</constraints>
  <verification>how each beat will be checked in the render</verification>
  <task>one sentence: what the shot is</task>
</brief>
```

- Every beat, transition, caption style and sound cue names its terms from motion-vocabulary. At most 3 terms per beat.
- Translate plain words ("make it pop", "smooth", "techy") with the vocabulary's "Plain words" table. If the creator named terms, keep theirs.
- Never use a term in `motion.rejected_terms` or one STYLE.md rules out. Prefer `motion.locked_terms`.
- Drop `<transitions>`, `<captions>` or `<sound>` only when the video truly has none.
- Every beat gets a frame: `frame = round(t * fps)`. When it falls between frames (0.35 s at 30 fps is 10.5), round and say so.
- Fill gaps with a stated default. Ask only when a missing item changes the look (no references, unclear palette).
- Reference video: watch it first (the `watch` skill) and name what you take from it in vocabulary terms ("mask reveal on text, expo.out, grain").

## 2. Show it

- New look, new idea or new references: show the brief and wait for the creator's OK.
- Creator Kit users are usually not motion designers: the first time a term appears, add one plain line under it ("overshoot: it goes slightly past and settles back").
- Small tweak to a shot already approved: update the brief in one line and continue.

## 3. Pick the engine

- Use `motion.engine` from brand.yaml.
- **remotion**: the studio in `reels/studio-remotion/` (React, frame-based). Best for the kit's templates, monthly plans, footage blocks and data-driven scenes; `video-shotcraft` for product promos.
- **hyperframes**: HTML + GSAP pages rendered to video (`motionmaxxing` to direct, `hyperframes` to build). Best for one-off motion pieces. Start from `reels/studio-hyperframes/`; preview, stills and render with `npm run hf:preview`, `hf:snapshot`, `hf:render`.
- Keep scene logic separate from the render call.

## 4. Constraints for every shot

- Frame-seekable: every animation is a pure function of time. No real-time clocks, no `requestAnimationFrame` loops, no unseeded `Math.random`.
- Build each term the way its vocabulary entry says. With motionmaxxing, use its measured curves for that term.
- GSAP timelines are paused and seeked by the renderer. Do not add a second animation library beside GSAP.
- Text and key graphics stay inside `visual.safe_zone`.
- Libraries are added to the project with npm, never installed globally.

## 5. Verify before saying done

- Render it. Pull the frame at each beat (`ffmpeg -ss <t> -i <file> -frames:v 1 beat-<n>.png`) and check it against the brief, including that each named term is visible (the overshoot overshoots, the match cut matches).
- Confirm size, fps and length, and that it plays. Captions inside the safe zone and on screen long enough to read.
- Report which beats matched and which did not. It is not finished without a rendered file.
