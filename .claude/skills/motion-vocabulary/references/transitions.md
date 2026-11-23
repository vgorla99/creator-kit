# Transitions

How one scene becomes the next. The best transitions are motivated: something in scene A leads into scene B.
Default for reels: cut on beat. Use a designed transition only where it carries meaning; one style family per video.
Build notes: in Hyperframes both scenes overlap on the timeline; in Remotion use `<TransitionSeries>` from `@remotion/transitions` or overlapping `<Sequence>`s.

**hard cut**: instant change, 0 frames. The most used transition in film. Clean and confident.

**jump cut**: cut within the same shot, skipping time. Use: talking heads, energetic vlogs, removing pauses.

**cut on beat**: cuts land exactly on music beats. The backbone of reels. Build: place cuts on the beat grid (see sound-sync).

**cut on action**: cut while something is moving, continuing the motion in the next shot. Hides the cut.

**match cut**: cut between two shots that share a shape, motion or idea (a ball becomes the sun). Memorable and smart.

**graphic match**: match cut done with design elements: a circle in scene A scales into the circle in scene B.

**smash cut**: sudden cut from calm to loud (or the reverse) for shock or comedy, usually with a sound hit.

**crossfade**: scene A fades out while B fades in. Soft, for time passing. Avoid overusing; it reads as amateur in fast edits. 10–20f.

**dip to colour**: fade to black or white (or a brand colour), then fade up. Marks a chapter change. White dip = flashback or energy.

**fade-through**: A fades out completely, then B fades in, no overlap. Calmer than a crossfade; standard in Material-style UI.

**wipe**: a straight edge moves across the frame, replacing A with B. Use: clean, corporate, retro. Build: animated `clip-path: inset()` on B.

**shape wipe**: the wipe is a brand shape (circle, logo, diagonal band, stripes). Build: masked SVG shape scaling or sliding over the frame.

**iris wipe**: circle closes on A, opens on B. Cartoon or retro feel; can close on a point of interest.

**push**: B slides in and pushes A out the opposite side. Feels like moving through pages. 12–20f, ease-in-out.

**whip pan**: very fast camera swing with heavy motion blur between shots. High energy. Build: fast translateX with motion blur and a whoosh; cut at the blurriest frame.

**zoom transition**: fast zoom into A (often into a detail) that lands in B, usually with blur. Build: scale A 1 → 3 with blur, B 0.4 → 1, overlap 4–6f.

**spin transition**: rotation blur carries A into B. Energetic, a trend style; use sparingly.

**morph transition**: a shape in A smoothly reshapes into a shape in B. Build: SVG path morph (flubber or MorphSVG) with matched point counts.

**mask transition**: B is revealed through a moving matte (text, a person's silhouette, a phone screen). Build: B inside a clip or mask on the matte layer.

**luma fade**: the transition follows brightness: bright areas of A dissolve first. Organic and dreamy. Build: shader or a gradient-map mask driven by time.

**light leak**: a warm film-light flare washes over the cut. Nostalgic, filmic. Build: blend mode screen or add overlay clip.

**flash frame**: 1–3 white (or colour) frames on the cut. Punch, camera flash, impact. Pair with an impact sound.

**glitch transition**: digital break-up (RGB split, slice offsets, noise) for 4–10f across the cut. Use: tech, gaming, hype.

**ink transition**: ink, paint or smoke spreads to reveal B. Use: artistic, handmade, Asian-ink styles. Build: animated alpha-matte video or a shader.

**film burn**: overexposed burning film frames between shots. Vintage, raw.

**split-screen**: frame divides to show two or more shots at once. Use: before/after, comparisons, conversations.

**object-led transition**: an object moves across the lens (a hand, a person, a door) and B is there after it passes. Hides the cut.

**seamless transition**: umbrella term for transitions that hide the cut entirely by matching motion, colour and position across shots.

## More wipes and reveals

**barn-door wipe**: frame splits from the centre and the two halves slide apart (or close in). Build: two clip-path insets on B, opening from the middle.
**venetian-blind wipe**: B appears through many thin horizontal strips that rotate or grow open in stagger. Build: N strip masks, scaleY 0 → 1, stagger 20–40ms.
**checkerboard / grid wipe**: B appears tile by tile in a grid, in order, random (seeded) or as a cascade from a corner. Same family as the tile wipe.
**clock / radial wipe**: a line sweeps around the centre like a clock hand, revealing B. Build: conic-gradient mask with an animated angle.
**brush / paint wipe**: a painted stroke sweeps across and B shows inside it. Build: brush-stroke alpha video as a mask, or an SVG stroke with a thick round cap.
**paper-tear wipe**: A tears away along a ragged edge to reveal B. Build: jagged SVG path masks moving apart, plus paper shadow.
**liquid wipe**: a wavy, fluid edge flows across. Build: SVG path with animated sine-wave points, or a displacement-map mask.
**curtain / shutter reveal**: panels pull aside (curtain) or slats open (camera shutter) to reveal B.
**text wipe / logo wipe**: big type or the logo scales up until it fills the frame and B is visible inside its shape (track matte).
**light-streak transition**: a bright streak sweeps across with a flash and the scene changes underneath. Build: additive gradient bar + 1–2 flash frames.

## More zooms and 3D

**crash zoom**: a violent, very fast zoom into a detail (3–5f), often with shake and a hit. Comedy, drama, hype.
**infinite zoom**: zoom keeps going into a detail that becomes the next scene, again and again. Build: each scene nested at the focal point of the previous one, continuous scale.
**zoom blur transition**: radial blur out from the centre at peak speed, cut at maximum blur.
**cube turn**: A and B are two faces of a cube that rotates 90°. Build: two planes with `perspective`, rotateY around a shared edge.
**page curl / page turn**: A curls like a book page to reveal B. Build: WebGL shader or a skewed fold mask with a shadow gradient.
**door swing / hinge**: A swings open on one edge like a door. Build: rotateY around the left or right edge.
**z-axis push**: A flies toward the camera and out of frame while B comes from depth. Build: scale and translateZ with blur on A.
**shatter transition**: A breaks into pre-computed shards that fly apart over B. Seed the trajectories.

## Glitch and retro transitions

**RGB split / channel shift**: red, green and blue copies separate horizontally for a few frames on the cut.
**pixel sort**: rows of pixels smear sideways sorted by brightness. Build: shader, or pre-rendered with ffmpeg / Python.
**datamosh**: motion from B smears A's pixels (codec-error look). Pre-render; very loud, use once.
**CRT turn-on / turn-off**: picture collapses to a bright horizontal line, then a dot, then black (or the reverse). Build: scaleY to 0.01, then scaleX to 0, with glow.
**static burst**: 2–4 frames of TV noise between shots. Pair with a crackle sound.
