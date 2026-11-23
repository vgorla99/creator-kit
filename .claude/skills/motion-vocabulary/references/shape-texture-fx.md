# Shape, texture and effects

Effects are seasoning. Pick one texture family per video and stay in it. All randomness seeded so renders repeat.

## Shape

**morph**: one shape smoothly turns into another (circle → logo). Build: SVG path interpolation (flubber or GSAP MorphSVG), similar point counts.

**path follow**: an object travels along a drawn path, rotating with it. Use: maps, journeys, flows. Build: GSAP MotionPath (`autoRotate`).

**trim path**: show only part of a stroke and animate the start or end. Lines that grow, chase or loop. Build: `stroke-dasharray` + `stroke-dashoffset`.

**repeater**: one shape duplicated in a pattern (radial, grid, line) with offset timing. Kaleidoscopes, loaders, backgrounds.

**grid system**: elements snap to an invisible grid; motion moves cell by cell. Clean, Swiss, corporate.

**mask**: a shape that defines which part of a layer is visible. **track matte**: one layer's shape or brightness masks another (text filled with video).
Build: `clip-path`, `mask-image`, or SVG `<mask>`.

**blend mode**: how a layer mixes with what's under it. Screen/add = light, flares, glows; multiply = shadows, ink, paper; overlay = texture.

## Light and blur

**glow**: soft light around bright elements. **bloom**: bright areas bleed light into the frame. Use for neon, energy, night. Avoid on body text.
Build: duplicate layer with blur + screen blend, or `filter: drop-shadow`.

**blur**: softens a layer (depth, focus, transitions). **motion blur**: blur along the direction of fast movement; makes fast motion feel real and smooth.
Build: Hyperframes/Remotion support sub-frame sampling (Remotion `<CameraMotionBlur>`); or a directional blur proportional to velocity.

**smear frame**: 1–2 frames where a fast object is drawn stretched along its path. Cartoon speed. Build: scale along the motion vector for those frames.

**light sweep**: a shine bar slides across a logo or metal surface. Premium finish for logo reveals. Build: gradient band in a mask, translateX.

**lens flare**: light artifacts from a bright source. Cinematic, sci-fi. Use one, subtle.

**vignette**: edges darker than centre. Pulls focus inward, filmic.

## Texture

**grain**: film-like noise overlay. Removes the sterile digital look. 3–8% opacity, animated per frame (seeded).

**noise**: procedural randomness for organic movement or texture. Build: seeded simplex noise of time.

**boil**: lines jitter slightly every 2–3 frames like hand-drawn animation. Build: re-seed a small displacement on twos or threes.

**halftone**: image made of dots (print, comic, pop-art). **dither**: colour made of pixel patterns (retro, 1-bit, Game Boy).

**chromatic aberration**: RGB channels split slightly at edges. Tech, glitch, lens realism. Keep it subtle except on hits.

**glitch**: digital corruption: slice offsets, RGB split, blocky noise, flicker. Use in bursts of 2–8f, synced to sound.

**scan lines**: horizontal lines like an old CRT screen. **VHS**: tape look: colour bleed, tracking lines, wobble, date stamp.

**paper texture**: paper grain over flat colour; handmade, editorial. **ink bleed**: edges spread like ink on paper.

**gradient mesh**: smooth, multi-point colour gradients that slowly shift. Modern backgrounds. Keep motion slow.

**liquid/blob**: organic shapes that wobble and merge (metaballs). Build: SVG goo filter (blur + contrast) or a shader.

**particles**: many small elements with simple physics (dust, sparks, confetti, snow). Build: pre-simulated or computed purely from time.

**trails / echo**: copies of a moving object fade behind it. Speed and energy. Build: render the object at t, t−2f, t−4f with falling opacity.

**displacement**: an image or noise pushes pixels around (heat haze, water, distortion). Build: SVG `feDisplacementMap` or a shader.

**shatter**: object breaks into pieces that fly apart. Pre-compute pieces and seeded trajectories.

**heat haze / ripple / twirl / bulge**: distortions of an image by displacement (shimmer, water ripple, swirl, fisheye bulge). Build: SVG `feTurbulence` + `feDisplacementMap`, or a shader.
**frosted-glass reveal**: content sharpens behind a blurred glass panel that wipes away. Build: animated `backdrop-filter` blur, or a blurred copy in a moving mask.
**neon flicker / neon trace**: tube light that flickers on (stepped opacity 1-0-1-0-1) or a glow tracing along a path.
**hue shift / colour cycle / duotone shift**: colours rotate or swap between brand colours over time. Build: CSS `hue-rotate`, or interpolate the duotone map.
**particle assemble / dissolve**: logo or text forms from (or breaks into) particles. Sample points from the shape, seed positions, interpolate.
**metaball / blob merge**: soft blobs merge and split like liquid. Build: blur + contrast "goo" filter, or a shader.
**organic growth**: lines grow like roots or veins (branching stroke draw-on). Build: L-system or pre-drawn branching paths with staggered trim.

## Styles

**duotone**: image in two colours only (brand colours). **colour blocking**: large flat areas of bold colour.
**cel shading**: flat colour with hard shadow shapes (cartoon). **line art**: outlines only.
**3D extrude**: flat logo or text given depth. **isometric**: 3D drawn without perspective at fixed angles; tech and infographics.
**stop-motion look**: stepped timing (on twos or threes) + slight jitter + handmade textures.
**collage/cutout**: cut paper, photo pieces, torn edges, moving in stepped jumps. Editorial, punk, music.
