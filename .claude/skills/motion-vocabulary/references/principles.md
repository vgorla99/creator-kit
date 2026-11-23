# Principles

The rules under every good move. Name them in a beat when the feel matters more than the effect.
Build notes: GSAP = Hyperframes timeline (paused, seeked). Remotion = `interpolate` / `spring` on `useCurrentFrame()`.

**squash and stretch**: the shape deforms with speed and impact (taller while moving fast, flatter on landing). Volume stays the same.
Use: bouncy logos, balls, icons, playful brands. Avoid: serious, luxury, finance.
Build: scaleY up while scaleX goes down on the same tween (keep scaleX × scaleY ≈ 1), with transformOrigin at the contact point.

**anticipation**: a small move the opposite way before the main move (wind up before the throw).
Use: before every big entrance or hit, so the eye knows where to look. Avoid: fast UI cuts where it reads as lag.
Build: 4–8 frames of a small reverse move (−5% scale or −10px), then the main move.

**staging**: one clear thing happens at a time, in the place the eye already is.
Use: always. When a frame feels busy, stage it. Build: dim or hold everything except the hero; stagger rather than move all at once.

**straight ahead vs pose to pose**: drawing every frame in order (loose, organic) vs setting key poses then filling between (controlled).
Use: straight ahead for fire, liquid, hand-drawn boil; pose to pose for logos, type, UI. Build: pose to pose = keyframes; straight ahead = per-frame procedural (seeded noise).

**follow-through**: parts keep moving after the main body stops (hair, a tail, a ribbon, a tag on a box).
Use: makes stops feel physical. Avoid: rigid UI. Build: child element on a delayed tween with a slight overshoot, settling 4–10 frames after the parent.

**overlapping action**: different parts move on different timings instead of in lockstep.
Use: groups of icons, letters, characters. Build: stagger plus a slightly different ease or duration per part.

**slow-in slow-out**: things speed up out of a pose and slow down into the next. The cure for robotic motion.
Use: default for almost everything. Build: ease-in-out (power2.inOut / `Easing.inOut(Easing.cubic)`).

**arcs**: natural motion travels on curves, not straight lines.
Use: things thrown, swung, or moving across a frame. Build: motionPath or animate x and y with different eases (x linear, y ease-out = arc).

**secondary action**: a smaller action that supports the main one (the logo lands, a shine sweeps across it).
Use: adds richness to a hero moment. Avoid: competing with the main action. Build: starts on or just after the main action ends, lower contrast.

**timing**: how many frames an action takes, which sets weight and mood. Fewer = light and snappy, more = heavy or calm.
Reference at 30fps: UI snap 6–9f, standard move 12–18f, hero move 20–30f, slow drift 60f+.

**exaggeration**: push the move past realistic so it reads instantly on a small screen.
Use: social reels, thumbnails. Avoid: product accuracy shots.

**solid drawing**: shapes feel like they have volume and sit in a consistent space and light.
Use: 2.5D/3D, characters. Build: consistent light direction, shadows, perspective on all layers.

**appeal**: the design is pleasant and readable at a glance. Simple shapes, clear silhouette, good proportions.

**weight**: heavy things start slow, stop hard and shake the ground; light things float and drift.
Build: heavy = ease-in then a hard stop plus camera shake on impact; light = ease-out with a long settle.

**silhouette**: the shape reads even as a solid black fill. Test any hero pose this way.

**hierarchy of motion**: the most important element gets the biggest or first move; supporting elements move less or later.

**motion with purpose**: every move explains something (where to look, what changed, what connects). If a move has no job, cut it.
