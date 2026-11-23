# Sound library

Sound effects (whooshes, pops, risers) make motion feel finished. **No audio ships with Creator Kit.** You download a pack once, unzip it into this folder, and it stays on your computer: every subfolder of `reels/sounds/` is git-ignored, so a pack never ends up on GitHub.

This file is the index Claude reads to pick a sound for a move. Keep one section per pack.

## Get the recommended pack (Viewcci, free, about 20 sounds)

1. Open the Viewcci sound effects pack: **[download link](VIEWCCI_PACK_URL)** <!-- VIEWCCI_PACK_URL: add the public link to the creator's pack here. -->
2. Download it. You get a `.zip` file (Google Drive may call it something like `Viewcci Sound Effects.zip`).
3. Unzip it:
   - **Windows:** right-click the zip → **Extract All…** → choose this folder, `reels/sounds/`.
   - **Mac:** double-click the zip, then drag the new folder into `reels/sounds/`.
4. Rename the unzipped folder to `viewcci`, so you end up with `reels/sounds/viewcci/Popup sounds/Click.MP3` and so on.
5. Read the creator's licence note that comes with the pack. It is free to use in your own videos; check the note before using it in paid ads, and never re-upload the files anywhere.

That's it. The table below already describes this pack.

## Format: one section per pack

```markdown
## <folder name> (<pack name>, from <where>, downloaded <yyyy-mm-dd>)

<one line on the licence>

| File | Length | Motion terms it fits |
|---|---|---|
| <subfolder>/<file> | <seconds>s | <the moves this sound belongs to> |
```

- **File** is the path inside the pack folder, exactly as on disk.
- **Motion terms** are the words you use when you describe a move ("pop", "whoosh", "reveal", "riser into the CTA"). Claude matches your words to this column.
- Add your own packs the same way: unzip into a new subfolder here, add a section.

## viewcci (Viewcci Sound Effects)

Free pack shared by its creator. Check their licence note before using it in paid ads.

| File | Length | Motion terms it fits |
|---|---|---|
| Popup sounds/Click.MP3 | 0.3s | accent, UI sounds, button press, checklist tick, type on |
| Popup sounds/Pop.MP3 | 0.4s | pop, scale-in, badge pop, emphasis words |
| Popup sounds/Pop (deeper).MP3 | 0.2s | pop on heavier elements, number lands, drop-in |
| Popup sounds/Pop (bubbly).MP3 | 2.2s | playful pop, sticker or emoji pop, heart pop |
| Reveal sounds/Reveal.MP3 | 1.8s | reveal, logo reveal, mask reveal |
| Reveal sounds/Reveal 2.MP3 | 2.8s | reveal with a longer tail, product hero |
| Reveal sounds/Magic Reveal.MP3 | 2.1s | sparkle reveal, light sweep, particle assemble |
| Reveal sounds/Reveal (Vine Boom).mp3 | 1.3s | impact, smash cut, punchline, crash zoom |
| Suspense sounds/Riser.MP3 | 4.2s | riser into a reveal (ends on the reveal frame) |
| Suspense sounds/Riser 2.MP3 | 2.7s | short riser, anticipation before a hit |
| Suspense sounds/Riser (long).MP3 | 8.2s | long build, hook or intro tension |
| Suspense sounds/Riser (fades out).MP3 | 6.5s | build that fades instead of hitting, silence before hit |
| Transition sounds/Camera Shutter.MP3 | 0.3s | flash frame, freeze frame, photo cut |
| Transition sounds/Camera Shutter (cinematic).MP3 | 6.5s | flash frame plus tail, scene change |
| Transition sounds/Transition (riser).MP3 | 0.8s | quick transition, push, wipe |
| Transition sounds/Transition (build up).MP3 | 2.1s | build into a transition, zoom transition |
| Zoom sounds/Whoosh.MP3 | 0.9s | whoosh, slide, whip pan |
| Zoom sounds/Whoosh 2.MP3 | 0.4s | fast whoosh, snap, digital zoom |
| Zoom sounds/Whoosh (deep).MP3 | 0.9s | heavy whoosh, punch zoom, crash zoom |
| Zoom sounds/Whoosh (cinematic).MP3 | 2.2s | cinematic whoosh, zoom-through cut, fly-through |

## Rules for using sounds

- Start a whoosh 2–4 frames **before** the move it belongs to.
- End a riser exactly **on** the reveal frame.
- Trim each sound and add a 5–20 ms fade in and out, so nothing clicks.
- Keep peaks under −1 dB, and mix the finished reel to about −14 LUFS (the loudness Instagram and TikTok expect).
- One sound per move. If everything makes a noise, nothing stands out.

To use a sound in a Remotion reel, copy the file into `reels/studio-remotion/public/audio/` (also git-ignored) and play it with Remotion's `<Audio>` at the frame of the move.
