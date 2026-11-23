---
name: motion-vocabulary
description: Shared dictionary of motion design terms (principles, easing, timing, entrances and exits, transitions, camera, kinetic type, captions, shape and texture effects, composition, sound sync, footage effects, and UI/web motion for apps and websites: microinteractions, scroll, cursor, page transitions, loaders), each with when to use it and how to build it in Hyperframes/GSAP or Remotion. Use whenever a motion video, reel, animation, transition or caption is planned, briefed, built or critiqued, whatever skill or command started it (motion-brief, reel-pipeline, motionmaxxing, hyperframes, video-shotcraft, remotion), and to turn a non-technical request ("make it pop", "smooth", "fun") into precise terms.
---

# motion-vocabulary

The naming layer for every motion job. The brief picks terms from here; the engine skill builds them.

## How to use

1. Read the index below. Pick terms for every beat, transition and caption in the brief.
2. Open only the category files you picked from. Each entry has: what it is, use when, avoid, build.
3. Write terms into the brief: `<beat ... terms="overshoot, stagger(40ms)">`. At most 3 terms per beat; one clear idea beats a pile of effects.
4. Plain-language request: translate with the table below. If the user names terms themselves (an editor), use theirs.
5. Project rules win: terms in `brand/brand.yaml` (`motion.locked_terms`, `motion.rejected_terms`) or `brand/STYLE.md` override this file.
6. Building with motionmaxxing: its `references/motion.md` and `references/transitions.md` hold measured curves and durations. Use those values for the term named here.

7. Naming a custom preset: driver + technique + direction + behaviour, e.g. "Frame-Driven Mask Reveal Up, snap", "Scroll-Linked Gradient Wipe Left".
8. App or website motion (not video): use `references/ui-web-motion.md` and write its UI spec instead of video beats.

## Plain words → terms

| User says | Use |
|---|---|
| pop, fun, playful, bouncy | overshoot, scale-in, squash and stretch, stagger |
| smooth, premium, elegant, calm | ease-in-out (sine/power2), fade-through, long holds, slow push in |
| fast, punchy, energetic, hype | snap, cut on beat, whip pan, smear frame, speed ramp |
| clean, minimal, corporate | mask reveal, slide, linear wipe, grid system, negative space |
| techy, digital, futuristic | scramble/decode, glitch, scan lines, chromatic aberration |
| cinematic, epic | dolly in, parallax, depth of field, light sweep, letterbox |
| handmade, organic | boil, stroke draw-on, on twos, paper texture, collage |
| satisfying | morph, match cut, seamless loop, follow-through |
| make them read it | hold, read time, word-by-word highlight, type hierarchy |
| more impact | anticipation, silence before hit, camera shake on impact, flash frame |

## Index

### Principles → `references/principles.md`
squash and stretch · anticipation · staging · straight ahead vs pose to pose · follow-through · overlapping action · slow-in slow-out · arcs · secondary action · timing · exaggeration · solid drawing · appeal · weight · silhouette · hierarchy of motion · motion with purpose

### Easing and timing → `references/easing-timing.md`
linear · ease-in · ease-out · ease-in-out · expo · overshoot · elastic · bounce · spring · snap · stepped · custom bezier · spacing · hold · stagger · offset · cascade · rhythm · pacing · loop · ping-pong · speed ramp · time remap · freeze frame · on twos · frame rate

### Entrances and exits → `references/entrances-exits.md`
fade · scale-in · pop · slide · mask reveal · clip-path reveal · grow from point · stroke draw-on · write-on · build-up · drop-in · rise · unfold · flip · blur-in · iris in · pixelate in · scatter/assemble · exit with motion carry

### Transitions → `references/transitions.md`
hard cut · jump cut · cut on beat · cut on action · match cut · graphic match · smash cut · crossfade · dip to colour · fade-through · wipe · shape wipe · iris wipe · push · whip pan · zoom transition · spin transition · morph transition · mask transition · luma fade · light leak · flash frame · glitch transition · ink transition · film burn · split-screen · object-led transition · seamless transition · barn-door · venetian-blind · checkerboard/grid wipe · clock wipe · brush wipe · paper-tear · liquid wipe · curtain/shutter · text/logo wipe · light streak · crash zoom · infinite zoom · zoom blur · cube turn · page curl · door swing · z-axis push · shatter · RGB split · pixel sort · datamosh · CRT on/off · static burst

### Camera → `references/camera.md`
pan · tilt · truck · pedestal · dolly in/out · push in · pull out · zoom · dolly zoom · orbit · crane · handheld · camera shake on impact · rack focus · depth of field · parallax · 2.5D · multiplane · Ken Burns · fly-through · POV · overhead · Dutch angle · establishing shot · close-up · extreme close-up · wide · letterbox

### Type and captions → `references/type-captions.md`
kinetic typography · type on · lock-up · word by word · line by line · letter stagger · scramble/decode · split text · text mask reveal · text on path · stretch type · variable font animation · outline to fill · highlight sweep · underline draw · number roll · slot-machine roll · lower third · title card · end card · supers · callout · burned-in captions · word-by-word highlight · karaoke captions · pop-on captions · roll-up captions · emphasis words · safe zone · read time · kerning · tracking · leading · type hierarchy

### Shape, texture and effects → `references/shape-texture-fx.md`
morph · path follow · trim path · repeater · grid system · mask · track matte · blend mode · glow · bloom · blur · motion blur · smear frame · grain · noise · boil · halftone · dither · chromatic aberration · glitch · scan lines · VHS · light sweep · lens flare · vignette · gradient mesh · liquid/blob · particles · trails · echo · displacement · shatter · duotone · colour blocking · cel shading · 3D extrude · isometric · line art · stop-motion look · collage/cutout · paper texture · ink bleed

### Composition and story → `references/composition.md`
rule of thirds · centre framing · symmetry · negative space · leading lines · focal point · depth layers · visual hierarchy · scale contrast · colour script · style frame · storyboard · animatic · hook · build · reveal · payoff · call to action · logo reveal · logo sting · bumper · explainer · product hero · UI demo · data viz animation · aspect ratio · title/action safe

### Footage and talking-head effects → `references/footage-effects.md`
orbit · couch wall (text behind subject) · UI world · frame break · digital zoom · phone mockup · checklist · headline wall · zoom-through cut · chart grow · pull-back reveal · green screen · paper cut · doodle boil · vertigo · cover story · glass type · text swap · punch zoom

### UI and web motion (apps, websites) → `references/ui-web-motion.md`
UI motion spec · defaults and tokens · scroll-triggered vs scroll-linked · pointer and gesture drivers · microinteractions (hover lift, press, ripple, toggle, error shake, heart pop, icon morph, skeleton, toast, sheet) · shared element / FLIP / container transform · scroll effects (reveal, sticky story, pin, parallax, image-sequence scrub) · cursor effects · background loops · loaders · reduced motion

### Sound sync → `references/sound-sync.md`
hit · accent · whoosh · riser · impact · drop · stinger · sound logo · room tone · ducking · beat grid · downbeat · on vs off the beat · silence before hit · foley · UI sounds · music bed · stem · loudness (LUFS) · peak · audio J-cut and L-cut
