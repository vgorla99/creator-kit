# Footage and talking-head effects

Graphics that interact with real footage (a person talking, product video). Most need a **person matte**: a per-frame mask of the subject so graphics can sit behind them.
Build the matte once per clip: `rembg` / MediaPipe Selfie Segmentation / RobustVideoMatting → PNG sequence or alpha video, then layer: background → graphics → subject → foreground graphics.
Word timings from Whisper drive when each effect fires. Hold each effect ≥ its read time.

**orbit**: cards, screenshots or icons circle around the subject in 3D, passing behind and in front of them. Use: listing tools, features, examples.
Build: items on an ellipse, scale and z-order by angle; items at the back go under the person matte.

**couch wall / text behind subject**: big text placed on the wall or set behind the person, so they occlude it. Feels like the words are in the room.
Build: huge type layer under the person matte, matched to the room perspective, slight parallax.

**UI world**: the subject is surrounded by or placed inside a big app interface (a chat window, a dashboard) that frames them.
Build: UI layer behind the matte, the subject cut out inside the UI's content area, UI animates in with mask reveal.

**frame break**: the shot shrinks into a card or frame, and part of the subject (a hand, the head) pops out over the frame edge. Strong depth trick.
Build: video inside a rounded rect, plus the person matte drawn again on top, masked only where it leaves the frame.

**digital zoom**: punch-in on the footage (1.0 → 1.2–1.5) on an emphasis word, often instant or 3–5f. The cheapest energy boost for talking heads.
Build: scale the video layer, keep the face in frame; cut back out on the next sentence.

**phone mockup**: the footage or an app screen plays inside a phone that slides or tilts in beside the subject.

**checklist**: a list appears and items tick off one by one as the speaker says them. Build: rows stagger in, check marks draw on (stroke draw-on) on word timings.

**headline wall**: news-style headlines, tweets or screenshots pop up around the subject as proof. Stagger them, slight rotation, drop shadow.

**zoom-through cut**: the camera zooms into a detail (an eye, a screen, a letter) and comes out in the next scene. Build: scale toward a point with blur, cut on the blurriest frame.

**chart grow**: a line or bar chart draws itself over the footage, synced to a number being said. Build: stroke draw-on + number roll.

**pull-back reveal**: start tight on the footage, then zoom out to reveal it was inside something bigger (a phone, an editor UI, a wall of screens). Twist moment.

**green screen**: subject cut out and placed on a new background (a screenshot, a brand colour, a scene). Build: person matte over any layer; add a soft shadow so it doesn't look pasted.

**paper cut**: footage or the subject treated as cut paper: white outline around the matte, paper texture, slight drop shadow, stepped motion.

**doodle boil**: hand-drawn doodles (arrows, circles, stars, underlines) around the subject that jitter on twos. Build: SVG strokes draw on, then boil.

**vertigo**: dolly zoom on footage: the subject stays the same size while the background stretches or shrinks. Build: scale the background plate and the subject matte in opposite directions.

**cover story**: the frame becomes a magazine cover: masthead behind the subject's head, cover lines around them. Build: masthead under the person matte, cover lines over.

**glass type**: text on a frosted glass panel over footage (blurred background through the panel, subtle border and highlight). Build: `backdrop-filter: blur()` panel, or blur a copy of the footage inside a mask.

**text swap**: one word changes into another in place (rolls up, flips or morphs), keeping the rest of the line. Build: masked word slot, old word exits up, new word enters from below.

**punch zoom**: a fast zoom into the product or key element for impact (4–8f, ease-out), usually on a beat or hit.
