# Camera

Virtual camera language. In code, "camera" = transforming a world container (scale, translate, rotate, perspective) while elements live inside it.
Rule: one camera move per shot, ease-in-out, and a reason (reveal, focus, follow, energy).

**pan**: camera turns left or right from a fixed spot. Use: reveal a wide scene. Build: translateX of the world container (2D).

**tilt**: camera turns up or down. Use: reveal height (a tall building, a long list).

**truck**: camera moves sideways along the scene. Combined with layers it creates parallax.

**pedestal**: camera moves straight up or down.

**dolly in/out**: camera physically moves toward or away from the subject. Things in front grow faster than the background. Build: scale layers by depth (near layers more).

**push in**: slow dolly in to build tension or focus. A slow push (1.0 → 1.08 over 3–5s) makes any static shot feel alive.

**pull out**: slow dolly out to reveal context or end a story.

**zoom**: lens zoom: everything scales equally (no parallax). Feels flatter and more mechanical than a dolly. Quick zooms are a social trend.

**dolly zoom**: dolly one way while zooming the other; subject stays the same size while the background warps. Vertigo, realisation moments.

**orbit**: camera circles the subject. Use: product hero shots. Build: 3D (three.js) or rotateY with perspective on 2.5D cards.

**crane**: big rising or falling sweep. Epic openings and endings.

**handheld**: slight organic wobble as if held by a person. Use: documentary, UGC feel. Build: seeded noise on x, y and rotation, 1–4px.

**camera shake on impact**: short, decaying shake on a hit (logo slam, beat drop). 6–12f, amplitude decays to 0. Build: seeded noise × decay envelope.

**rack focus**: focus shifts from one depth layer to another. Guides the eye. Build: blur on the layer losing focus, sharpen the one gaining.

**depth of field**: only one depth range is sharp; closer and further layers blur. Cinematic depth. Build: per-layer `filter: blur()` by distance from focus.

**parallax**: near layers move faster than far ones during camera movement, creating depth from flat art.
Build: layer speed = camera move × depth factor (bg 0.2, mid 0.5, fg 1.2).

**2.5D**: flat 2D layers arranged in 3D space so the camera can move through them. The workhorse of motion design depth.
Build: CSS `perspective` + `translateZ` per layer, or three.js planes.

**multiplane**: classic 2.5D: several painted layers at different distances (Disney multiplane camera).

**Ken Burns**: slow pan and zoom across a still photo. Use: photos, documentaries, testimonials. 1.0 → 1.1 scale over the shot with a small drift.

**fly-through**: camera travels through a scene or into an object (through a logo, into a screen). Build: scale the world strongly around a focal point.

**POV**: point of view. The camera is the eyes of someone.

**overhead**: top-down view. Use: flat lays, maps, tables, board-game moves.

**Dutch angle**: tilted horizon (10–25°). Tension, unease, energy.

**establishing shot**: a wide first shot that shows where we are.

**close-up / extreme close-up / wide**: framing sizes. Close-up = face or product detail; extreme close-up = one feature (an eye, a logo letter); wide = the whole scene.

**letterbox**: black bars top and bottom for a cinematic aspect. Can animate in to signal "cinematic moment".
