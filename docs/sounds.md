# Sounds: voice, music and sound effects

> Part of [Creator Kit](../README.md). No audio ships with the kit. You add your own voice, music you may use, and a sound effects pack that stays on your computer.

## Get the sound effects pack

The kit recommends a free pack of about 20 sound effects (pops, whooshes, risers, reveals). How to download and unzip it, and the index Claude reads to pick a sound for each move: **[`reels/sounds/SOUND-LIBRARY.md`](../reels/sounds/SOUND-LIBRARY.md)**.

Short version: download the zip, unzip it into `reels/sounds/`, rename the folder `viewcci`. Every folder inside `reels/sounds/` is git-ignored, so the files never go to GitHub.

Other packs work the same way: unzip into a new folder in `reels/sounds/` and add a section to the index (the format is in that file).

## Rules for sound effects

- **One sound per move.** If everything makes a noise, nothing stands out.
- **Not on every cut.** Pick the 3 or 4 moves that matter.
- **Silence before the important one.** A short gap makes the hit land.
- **Start a whoosh 2 to 4 frames before** the move it belongs to.
- **End a riser exactly on** the reveal frame.
- **Trim and fade** each sound by 5 to 20 ms at both ends, so nothing clicks.
- **Peaks under −1 dB.**
- Write the moves you like and dislike in your brand file (`motion.locked_terms`, `motion.rejected_terms`). The example brand rejects "whoosh on every cut".

## Voice

- Talk at your natural pace. Your brand file has `voice.words_per_second` (about 2.5 is calm); the kit uses it to check scripts fit the time.
- Monthly plans write a `vo-script.txt` for each video. Record it with your own voice, or with a text-to-speech tool such as ElevenLabs (optional, paid, key in `.env`). **Keep the `<break>` tags**: the kit cuts the audio at those pauses.
- Save it as `vo.mp3` in the video's folder and run the final render. Details: [reels-remotion.md](reels-remotion.md#audio).

## Music

- Only music you hold a licence for, or that the platform's own library lets you add. A song you like is not automatically a song you may use.
- Easiest: post without music from the kit, then add a track inside the Instagram or TikTok app at posting time. Those tracks are licensed by the app.
- To bake music into the file: set `motion.music` in your brand file to a file under `reels/studio-remotion/public/` (or put `music.mp3` next to a monthly video). It plays about 14 dB under the voice and fades in and out.

## Loudness: −14 LUFS

LUFS is a measure of how loud a whole video *feels*, not just its loudest peak. Instagram, TikTok and YouTube play everything at about the same loudness, so a reel mixed much louder gets turned down and sounds squashed; one mixed too quiet sounds weak next to others.

Aim for about **−14 LUFS** for the finished reel, with peaks under −1 dB. To measure a file (FFmpeg is installed by the setup):

```
ffmpeg -i reel.mp4 -af loudnorm=print_format=summary -f null -
```

Look at `Input Integrated` in the output. Between −16 and −12 is fine. Or just ask Claude: *"check the loudness of this reel"*.
