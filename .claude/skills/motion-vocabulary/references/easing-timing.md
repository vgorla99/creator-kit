# Easing and timing

An ease is the speed curve of a move. Timing is how long and when. Frame counts at 30fps.
GSAP names are given; Remotion equivalents use `Easing` from `remotion` or `spring()`.
**The numbers below are starting points, not presets.** Same curve, same duration and even staggers on every move make every video look alike. Pick each move's curve for what the move is, set its duration from how far and how heavy the thing is, let one element lead and the rest react at uneven offsets, let most text simply cut on, and keep holds alive (a slow drift, not a freeze). With motionmaxxing, its measured curves override these numbers.

## Eases

**linear**: constant speed, no acceleration. Use: scrolling tickers, rotating loaders, wipes driven by a beat, opacity of long fades. Avoid: anything that starts or stops on screen (it looks mechanical).
Build: `ease: "none"` · Remotion `interpolate` with no easing.

**ease-in**: starts slow, ends fast. Use: exits (things leaving speed up and go). Avoid: entrances (they slam).
Build: `power2.in` / `power3.in` · `Easing.in(Easing.cubic)`.

**ease-out**: starts fast, ends slow. Use: entrances and most UI. It's the default for anything arriving.
Build: `power2.out` / `power3.out` · `Easing.out(Easing.cubic)`.

**ease-in-out**: slow, fast, slow. Use: moves from one on-screen spot to another, camera moves, calm or premium feel.
Build: `power2.inOut` / `sine.inOut` · `Easing.inOut(Easing.cubic)`.

**expo**: extreme ease, almost instant then a long glide. Use: sleek tech, premium reveals, fast slides that settle softly.
Build: `expo.out` / `expo.inOut` · `Easing.out(Easing.exp)`.

**overshoot**: passes the target and settles back once. Use: pop-ins, playful brands, buttons, icons. Avoid: serious tone, big heavy objects.
Build: `back.out(1.7)` (higher = more) · `spring({ frame, fps, config: { damping: 12 } })`.

**elastic**: overshoots and wobbles several times. Use: rarely: cartoonish, kid brands, a single gag. Avoid: text people must read.
Build: `elastic.out(1, 0.4)` · spring with low damping (≈6).

**bounce**: hits the target and bounces like a dropped ball. Use: things landing on a floor. Build: `bounce.out` · custom keyframes.

**spring**: physics-based motion (mass, stiffness, damping) that feels natural and alive. Use: UI, logos, Remotion default for entrances.
Build: Remotion `spring({ frame, fps, config: { mass: 1, stiffness: 100, damping: 14 } })` · GSAP `back.out` or CustomEase approximating it.

**snap**: very short, hard ease-out (≈4–8f). Use: punchy reels, cut-on-beat text. Build: `power4.out`, duration 0.15–0.25s.

**stepped**: jumps between values with no in-betweens. Use: stop-motion look, retro, typing cursor, clock ticks.
Build: `steps(n)` · `Math.floor` on the interpolated value.

**custom bezier**: a hand-shaped curve for a signature feel. Lock it per brand once chosen.
Build: `CustomEase.create("brand", "0.2,0,0,1")` · `Easing.bezier(0.2, 0, 0, 1)`.

## Timing

**spacing**: how far an object moves between frames. Close spacing = slow, wide = fast. Ease is spacing over time.

**hold**: a frame where nothing moves so the viewer reads it. Rule: text holds at least its read time (see type-captions). Hero logo holds 1–2s at the end.

**stagger**: the same move on several items, each starting a fixed delay after the previous. Use: lists, letters, grids, icons.
Typical: letters 20–40ms, words 60–100ms, cards 80–150ms. Build: GSAP `stagger: 0.04` · Remotion delay `i * 2` frames.

**offset**: two related moves start a few frames apart (the shadow lands 2f after the object). Small offsets make motion feel rich.

**cascade**: stagger that flows in a direction (top-left to bottom-right, centre outwards). Build: GSAP `stagger: { from: "center", grid: "auto", amount: 0.5 }`.

**rhythm**: the pattern of fast and slow, busy and still across the piece. Vary it; constant speed is boring.

**pacing**: overall speed of the story. Reels hook in under 1s and cut every 1–2s; explainers hold 3–5s per idea.

**loop**: the last frame flows into the first. Build: end state equals start state, or use modulo of time; check frame 0 vs last frame.

**ping-pong**: plays forward then backward. Use: idle breathing, hovering objects. Build: `yoyo: true, repeat: -1` (seek-safe if driven by timeline time).

**speed ramp**: playback speed changes within a shot (fast, then slow-mo on the key moment, then fast). Use: action, sport moves, product hits.
Build on footage: ffmpeg `setpts` per segment, or Remotion `<OffthreadVideo playbackRate>` per sequence.

**time remap**: remapping footage time freely (reverse, freeze, ramp). **freeze frame**: hold one frame of footage, often with a text callout over it.

**on twos**: animating at half the frame rate (each pose held 2 frames). Use: hand-made, anime, stop-motion feel. Build: quantise time to every 2nd frame.

**frame rate**: 24fps cinematic, 30fps social/default, 60fps smooth UI and gameplay. Pick once per project; convert beats with `frame = round(t × fps)`.
