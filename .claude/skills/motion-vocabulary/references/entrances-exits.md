# Entrances and exits

How elements appear and leave. Default rule: enter with ease-out, exit with ease-in, exits faster than entrances (about 70% of the duration).
Combine at most two (e.g. slide + fade). Durations at 30fps.

**fade**: opacity 0 → 1. The quietest option; pair with a small move so it doesn't feel lazy. 8–15f.
Build: `autoAlpha: 0 → 1` · `interpolate(frame, [0, 12], [0, 1])`.

**scale-in**: grows from smaller (0.8–0.9) to full size. Calm and modern. Use 0 → 1 only for small icons; big elements look cheap from 0.

**pop**: fast scale-in with overshoot (0 → 1.1 → 1). Playful, attention-grabbing. 8–14f. Build: `back.out(2)` or spring.

**slide**: moves in from an edge or offset (20–80px for UI, off-frame for scenes). Direction should mean something (forward = right in LTR reading).

**mask reveal**: the element slides out from behind an invisible edge, as if it was hidden behind a line. Clean, premium, the classic for text.
Build: parent `overflow: hidden`, child `yPercent: 100 → 0` · Remotion translateY in a clipped container.

**clip-path reveal**: a shape (rectangle, circle, diagonal) grows to uncover the element. Build: animate `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)` or `circle(0% → 150%)`.

**grow from point**: scales from a specific origin (a button, a cursor, a corner) to show cause and effect. Build: `transformOrigin` at that point.

**stroke draw-on**: a line or outline draws itself along its path. Use: logos, icons, maps, signatures, arrows.
Build: SVG `stroke-dasharray` = path length, animate `stroke-dashoffset` length → 0 (GSAP DrawSVG or manual).

**write-on**: handwriting or text appears as if being written, stroke by stroke. Build: stroke draw-on per letter path, staggered.

**build-up**: a graphic assembles piece by piece (bars grow, parts fly in, icon assembles). Use: infographics, product exploded views.

**drop-in**: falls from above and lands with weight (ease-in then a small bounce or squash). Use: playful titles, stickers.

**rise**: floats up from slightly below with a fade. The default gentle entrance for text lines. 20–40px, 12–18f.

**unfold**: opens like paper or a panel (scaleY from top edge, or 3D rotateX). Use: cards, menus, maps.

**flip**: rotates in 3D around X or Y to reveal the face. Use: cards, before/after, number changes. Needs `perspective` on the parent.

**blur-in**: starts blurred and sharpens while fading in. Soft, dreamy, cinematic. Build: `filter: blur(12px) → blur(0)`.

**iris in**: a circle opens from a point to reveal the scene (classic cartoon). Build: `clip-path: circle()`.

**pixelate in**: starts as large pixels and resolves. Use: tech, retro, gaming. Build: canvas downscale-upscale or SVG filter steps.

**scatter/assemble**: pieces fly in from random positions to form the shape, or the shape breaks apart on exit. Use seeded randomness so renders match.

**exit with motion carry**: the exit continues the direction of the next scene's entrance so the two feel connected (exit left, next enters from right).
