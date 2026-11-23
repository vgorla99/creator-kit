# UI and web motion

Motion inside apps and websites (the site template in `sites/`, dashboards, client sites), not rendered video.
Unlike video, UI motion is triggered by people, can be interrupted, and must respect reduced-motion settings.
Implementation code lives in the `motion-foundations` (tokens, springs, reduced motion) and `motion-patterns` (buttons, modals, lists, page transitions) skills. This file only names things.

## Spec for any non-trivial UI motion

Write these before coding, one line each:
intent (feedback, orientation, continuity, hierarchy, status, delight) · trigger · subject · driver · properties · timing (duration + ease, or spring mass/stiffness/damping) · choreography · interruption and reversal · reduced-motion fallback (instant, short fade or simplified) · acceptance check.
"Smooth", "modern" or "premium" is not a spec: translate it into the fields above and state the interpretation.

## Defaults

- Enter with ease-out, exit with ease-in, move between two visible states with ease-in-out. Exits are about 30% shorter than entries.
- Durations: micro 100ms · fast 160 · standard 240 · emphasized 360 · scene 520. Stagger 30–80ms.
- Springs: gentle (stiffness 180, damping 24) · snappy (420, 32) · expressive (260, 20).
- Frequent controls get small moves: 4–16px and a press scale of 0.97. Save big moves for rare moments.
- One primary motion per interaction. Retarget from the current value on interruption and never snap back to the start.
- Animate only transform and opacity per frame. Never animate top, left, width or height in a loop.
- Keep these values in one tokens file per project (`motion.tokens.ts`). Never scatter literals.

## Drivers

**time-driven**: plays over a duration once started. **state-driven**: a state change retargets the motion.
**scroll-triggered**: crossing a scroll threshold *starts* a normal animation (reveal on scroll). Build: IntersectionObserver or GSAP ScrollTrigger with `toggleActions`.
**scroll-linked / scrubbed**: scroll position *is* the playhead, so scrolling back plays it backwards. Build: CSS `animation-timeline: scroll()` / `view()`, or ScrollTrigger `scrub: true`.
**pointer-reactive**: cursor position or velocity drives values (tilt, magnetic, spotlight). Desktop only; always provide a touch fallback.
**gesture-driven**: finger drag drives the value directly, and on release it keeps velocity and springs to the nearest valid state. Build in RN: Reanimated + Gesture Handler.

## Microinteractions

**hover lift**: -2 to -4px translateY plus a stronger shadow. Never the only cue that something is clickable.
**press compression**: scale 0.97 on press, spring back on release.
**ripple**: circle expands from the tap point (Material). **magnetic button**: button drifts a few px toward the cursor nearby.
**toggle morph**: thumb slides and track colour changes; the icon can morph too.
**checkbox draw / success checkmark**: check stroke draws on, small overshoot, then settles.
**error shake**: 3–4 short horizontal oscillations of 4–6px, always with error text.
**heart pop / like burst**: icon scales 1 → 1.25 → 1 with a small particle ring. Use for favourites and likes.
**badge pop**: notification count scales in with overshoot.
**icon morph**: hamburger → close, play → pause, plus → minus. Same point count, path interpolation.
**button loading morph / submit-to-success**: button shrinks to a spinner, then expands into a check.
**skeleton shimmer**: gradient sweeps across placeholder blocks while loading. Static under reduced motion.
**toast / snackbar**: slides in from the edge, holds while readable, exits faster; pause the timer on hover.
**accordion**: height animates and the chevron rotates 180°. **drawer / bottom sheet**: edge slide, gesture-tracked, springs to snap points.
**swipe-to-delete / reorder**: row follows the finger, siblings reflow with layout animation.
**number roll / animated counter**: digits roll in a clipped slot; keep the real number in the text for screen readers.
**pull-to-refresh**: elastic stretch, then spinner, then settle.

## Page and layout transitions

**shared element / hero**: the same object (card image, avatar) morphs from the list into the detail page. Build: View Transitions API, Motion `layoutId`, or FLIP.
**container transform**: a card or button expands into the full screen it opens.
**FLIP**: measure First and Last positions, Invert with a transform, Play to zero. The cheap way to animate layout changes.
**fade through**: old content fades out, new fades in. Use for tabs and swaps with no spatial link.
**push / slide**: direction means hierarchy: forward goes left, back reverses.

## Scroll effects

**scroll reveal / fade-up on scroll**: sections rise 16–32px and fade in once, staggered.
**sticky story / scrollytelling**: a pinned visual changes step by step while the text scrolls past.
**scroll pin**: a section sticks while its inner animation scrubs, then releases.
**horizontal scroll section**: vertical scrolling moves a row of panels sideways.
**parallax scroll**: layers move at different speeds. Keep it subtle; disable under reduced motion.
**scroll text highlight**: words light up as they pass the middle of the screen.
**image-sequence scrub**: a frame sequence (product turntable) scrubbed by scroll. Pre-load and use canvas.
**scroll velocity skew / blur**: content skews slightly with scroll speed. Trendy; use sparingly.
**scroll progress bar**: a thin bar at the top shows how far through the page you are.
Never scroll-jack (hijacking scroll speed or direction) unless explicitly asked.

## Cursor and pointer (desktop)

**custom cursor / dot-and-ring**: a small dot plus a lagging ring that grows over links.
**cursor spotlight / mask**: a circle follows the cursor and reveals a hidden layer or lights the background.
**pointer tilt**: card rotates 3D toward the cursor (max 8–10°), with a glare highlight.
**pointer parallax**: layers shift slightly opposite the cursor for depth.
**cursor trail**: fading dots, ribbon or particles behind the cursor. Decorative only.

## Background loops

**gradient drift / mesh gradient**: slow colour movement, 10–20s loops. **aurora**: soft colour bands that wave.
**noise / grain overlay**: animated grain at 3–6% opacity. **floating blobs**: soft shapes slowly drifting.
**perspective grid / infinite grid**: retro or tech floor grid scrolling toward the horizon.
**particle field / star field / constellation**: dots that drift and connect. Canvas; pause when off-screen.
**marquee**: endless horizontal text or logo strip (client logos, claims). Pause on hover.

## Loaders

**spinner / arc spinner** for unknown waits. **progress bar / circular progress** must show real progress when known.
**skeleton** is better than a spinner for content layouts. **logo loader**: brand mark draws or pulses (stroke draw-on).
**dot / bounce / wave loader**: three dots in stagger. **step progress**: numbered steps fill as each one completes.
Loaders must stop the moment the work finishes or fails.

## Reduced motion (always)

Respect `prefers-reduced-motion` (web) and Reduce Motion (iOS/Android). Replace parallax, zoom, big slides, 3D flips, camera moves and loops with an instant change or a ≤150ms fade. Meaning must survive without motion: status always also shown with text, icon or colour.
