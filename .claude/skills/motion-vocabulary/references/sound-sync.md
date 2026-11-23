# Sound sync

Sound sells motion. Every major visual hit gets a sound; every sound gets a visual reason.
Use the kit's sound index first: `reels/sounds/SOUND-LIBRARY.md` maps every sound file the creator has downloaded to these terms; details on mixing in motionmaxxing `references/sound-sync.md` (when the HyperFrames engine is installed).

**hit**: a short sound locked to a visual impact (logo lands, text slams). **accent**: lighter sound on a minor move (pop, tick, click).
**whoosh**: air sound for fast moves and transitions. Starts 2–4f before the move and peaks at its fastest frame.
**riser**: sound that builds in pitch or volume toward a moment. Ends exactly on the reveal frame.
**impact**: heavy low hit (boom, thud) for big moments, often with camera shake on impact.
**drop**: the moment music hits full energy after a build. Put the biggest visual change here.
**stinger**: very short musical phrase for a transition or reveal. **sound logo**: the brand's signature sound with the logo sting.
**room tone**: quiet ambient bed so silence doesn't feel dead.
**ducking**: music volume dips automatically under voice-over (−8 to −12 dB).
**beat grid**: the music's beat times; cuts and hits snap to it. Build: detect BPM and beats (aubio or librosa) or tap them; store as frame numbers.
**downbeat**: the first, strongest beat of a bar. Put scene changes on downbeats.
**on vs off the beat**: on the beat = punchy, satisfying; slightly off = loose, human. Pick deliberately.
**silence before hit**: cut all audio 2–6f before a big moment for more impact.
**foley**: real-world sounds recreated (paper, clicks, cloth, footsteps). **UI sounds**: taps, swipes and notifications for app demos.
**music bed**: background music under the whole piece. **stem**: one separated part of the music (drums, bass) for precise syncing.
**loudness (LUFS)**: perceived loudness. Target about −14 LUFS for social and YouTube, −16 for voice-led. **peak**: keep true peaks under −1 dBTP.
Build: ffmpeg `loudnorm=I=-14:TP=-1:LRA=11`.
**fade in/out**: short audio fades (5–20ms) on every clip edge to avoid clicks; longer fades at the end of the piece.
**audio J-cut and L-cut**: J = next scene's audio starts before its picture; L = current audio continues over the next picture. Smooths cuts.
