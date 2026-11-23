# Reels with HyperFrames

> Part of [Creator Kit](../../README.md). Not sure whether to use this or Remotion? See [docs/engines.md](../../docs/engines.md).

This folder makes a **10-second, 1080×1920 starter reel** in your brand: your wordmark, what your account is about, your three content pillars and your end card. Every colour, font and word comes from `brand/brand.yaml`. Change that file, render again, and the reel changes with it.

A HyperFrames reel is a web page. Each scene is a small HTML file, and HyperFrames films it frame by frame into an MP4.

## What you need

- **Node.js 22 or newer** and **FFmpeg** (the Creator Kit setup installs both)
- Internet the first time you render: the brand fonts are downloaded once from Google Fonts and kept in `film/fonts/`

## Render the starter reel

Open a terminal in the `creator-kit` folder, then:

```
npm run hf:render
```

(The setup installs this studio when you pick HyperFrames. If it did not, the first `hf:` command installs it.)

The video lands in `reels/studio-hyperframes/out/starter.mp4`. The first render can take a few minutes while HyperFrames sets itself up; after that a render takes about 30 seconds.

## Preview and edit

Run these from the `creator-kit` folder (inside `reels/studio-hyperframes/` the same commands work without `hf:`):

| Command | What it does |
|---|---|
| `npm run hf:preview` | opens HyperFrames Studio in your browser: play, scrub and click through the timeline |
| `npm run hf:check` | checks the reel (text inside the phone's safe area, contrast, timing) and lists anything to fix |
| `npm run hf:snapshot` | saves one still per scene (plus a contact sheet) into `.hyperframes/artifacts/snapshots/` |
| `npm run hf:render` | renders `out/starter.mp4` |
| `npm run hf:smoke` | saves one test frame to `out/smoke/` (the setup runs this) |

Every command first re-reads `brand/brand.yaml`. The kit turns HyperFrames' anonymous usage data off for these commands; set `HYPERFRAMES_NO_TELEMETRY=0` if you want to share it.

Three ways to change it:

1. **Words and colours:** edit `brand/brand.yaml`, then run `npm run brand:check` from the `creator-kit` folder. The reel uses `visual.colors`, `visual.fonts`, `visual.wordmark`, `visual.end_card`, `visual.safe_zone`, `brand.handle`, `brand.niche`, `content.series` and `content.pillars`.
2. **Ask Claude:** open Claude Code in the `creator-kit` folder and ask, for example: *"In the HyperFrames starter, make the end card stay longer and give the tip scene a slow push-in."*
3. **By hand:** each scene is one file in `film/`:
   - `film/hook.html`: the wordmark and handle (frame 0 is your thumbnail)
   - `film/tip.html`: series name, niche and pillars
   - `film/end.html`: end-card line, button and handle

   Scene lengths and the colour wipes between scenes live in `index.html` (`data-start` and `data-duration`, in seconds).

Do not edit `film/brand.css` or `film/brand.js`: they are rebuilt from `brand.yaml` every time.

## Captions

The starter has no voice, so it has no captions. For a talking-head clip (you speaking to camera), ask Claude: captions are part of the **hyperframes** skill (its `references/captions.md`), which setup installs when you pick HyperFrames as your engine; it is not copied into this repo.

1. Put your clip in a new folder, for example `reels/content/00_Ideas/clay-tip/`.
2. In Claude Code, type: *"/hyperframes add captions to reels/content/00_Ideas/clay-tip/my-clip.mp4"*.
3. It transcribes your voice on your computer (`hyperframes transcribe`, no upload), offers caption styles from the HyperFrames catalog, checks the frames and renders the captioned video.

The first transcription may ask to install a speech model; Claude tells you the command.

## Where things live

```
reels/studio-hyperframes/
├─ index.html          the reel: scene order, lengths, colour wipes
├─ film/               one HTML file per scene (+ generated brand.css, brand.js, fonts/)
├─ scripts/brand.mjs   reads brand/brand.yaml and writes the generated files
├─ hyperframes.json    HyperFrames project settings
└─ out/                your renders (not saved to git)
```

HyperFrames is open source (Apache-2.0) by HeyGen: [github.com/heygen-com/hyperframes](https://github.com/heygen-com/hyperframes). The `hyperframes` package (pinned to 0.9.84) is installed from npm by the setup, not copied here.
