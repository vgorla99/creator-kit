# The standard: 12 rules for every motion reel

> Part of [Creator Kit](../README.md). The quality bar Claude holds every reel to (it is built into the `reel-pipeline` skill). Use it yourself to judge a draft: if a rule is broken, say which one.

1. **Understand before designing.** Get the real facts and their honest limits first. Write four lines: the problem, who watches, the goal, the feeling. Name the one true thing the reel is for.

2. **One idea from the subject's own world.** Which object, material or gesture belongs only to this topic? Come up with three ideas and pick one for a reason. Test: hide the handle. If a competitor could post it unchanged, it isn't yours yet.

3. **One object that travels.** One thing goes through every beat and changes role on the way. It moves and changes size between scenes; it is never stuck in one spot.

4. **Storyboard before building.** For each beat: what it makes the viewer believe, what moves, how it comes in and goes out, how it hands over to the next. Hook in 3 seconds or less, the proof gets the most time, one moment worth a screenshot, and the end is calmer than the start.

5. **Show, don't caption.** Every claim gets its own picture doing the thing. No slides of statistics, no walls of text.

6. **A world, not a page.** A lit, textured background that fits the subject; objects with shadows. One accent colour that means one thing, and the highlight used once, on the point.

7. **Join scenes with camera moves.** Scenes connect through a camera move, with motion blur at full speed, and the cut lands in the middle of the move. No crossfades between scenes.

8. **Measured motion.** Things arrive fast and settle softly, without bounce unless your brand wants it; exits speed up as they leave. Words appear at the pace of speech. A held shot keeps something alive. No dead frames.

9. **No page clutter.** No corner labels, page dots, counters or progress bars. The end card arrives for a reason, not just because time is up.

10. **Sound made for the picture.** A natural voice at your pace (`voice.words_per_second` in the brand file), music ducked under it, a few hand-placed sound effects with silence before the important one. Mix to about −14 LUFS. More in [sounds.md](sounds.md).

11. **Look honestly before showing.** Render it, look at one frame per second and describe each in one sentence. Measure: length, empty frames, how long the end holds, loudness. Fix in this order: anything untrue → the idea → the joins → what stands out first → timing → finish → sound. Never call your own work perfect.

12. **Your gates stay.** Plan → your OK. Stills → your OK. Then the full render and the package. Nothing is posted without your yes.

## Quick checks before a reel is "ready"

- Everything important sits inside the safe zone (`visual.safe_zone`, see [platforms.md](platforms.md)); the hook reads on mute within 3 seconds.
- Only your brand colours and fonts; at most two kinds of overlay on screen at once.
- Captions show every spoken word in short chunks (4 words or fewer), in sync, never over the end card.
- The end card uses your `visual.end_card` line and button and holds for about 1 second.
