# Reels with Remotion

> Part of [Creator Kit](../README.md). This guide covers the Remotion reel studio in `reels/studio-remotion/`: the starter reel, monthly plans, the footage engine, captions and audio.

The studio makes **1080×1920 Instagram / TikTok reels at 30 fps, up to 60 seconds**, in your brand colours. Every render is checked against that spec.

There are two ways to make a reel:

| Way | Good for | You write |
|---|---|---|
| **Monthly plan** (most people) | a steady posting rhythm | a `plan.json` with hooks, beats and voice-over lines; the engine builds every video, carousel and post text |
| **Hand-built reel** | a one-off piece with its own moves | a small React file, starting from the starter reel |

All commands run from the `creator-kit` folder (the one with `brand/` in it). You never need to open `reels/studio-remotion/` in a terminal.

## Commands at a glance

| Command | What it does |
|---|---|
| `npm install` | installs everything (once, and after updates) |
| `npm run brand:check` | checks `brand/brand.yaml` and lists anything to fix in plain English |
| `npm start` | opens Remotion Studio in your browser to scrub every reel |
| `npm run starter` | renders the starter reel + its review sheet |
| `npm run produce -- example --only V01` | renders the example month's video (works on a fresh copy) |
| `npm run produce -- <month> --week 1` | silent drafts for a week of your plan |
| `npm run produce -- <month> --final V01` | after you record the voice-over: cut it and render `final.mp4` |
| `npm run doc -- <month>` | an HTML checklist for the month: scripts, captions, posting steps |
| `npm run new -- <slug>` | a new hand-built reel, copied from the starter |
| `npm run reel -- <Id>` | renders a hand-built reel + spec check + review sheet |
| `npm run pexels -- search "<words>"` | finds portrait stock clips (needs `PEXELS_API_KEY` in `.env`) |
| `npm run library -- list` | your own clips in the asset library |
| `npm run typecheck` · `npm run check:captions` | self-checks for contributors |

`<month>` is a folder name in `reels/content/`, such as `example` or `2026-03`. Renders land in `reels/studio-remotion/out/<month>/<ID>-<slug>/`.

## Where things live

```
brand/brand.yaml              your name, handle, colours, wordmark, language: the ONLY file to reskin
reels/
├─ content/                   what you post
│  ├─ 00_Ideas/ 00_Ready/ 01_Live/   one folder per stage of a post
│  ├─ _metrics/metrics.csv    one row per post with its numbers
│  ├─ example/                a demo month (plan.json + vo.json) that renders on a fresh copy
│  └─ <yyyy-mm>/              your month plans
├─ sounds/SOUND-LIBRARY.md    how to get sound effects + the index Claude reads
└─ studio-remotion/           the Remotion studio
   ├─ src/kit/                the motion language: easing, springs, transitions, type, review sheets
   ├─ src/footage/            footage engine: clips or brand stages, overlays, blocks, captions
   ├─ src/plan/               month plan → reels and 4:5 carousels
   ├─ src/reels/_starter/     the starter reel that `npm run new` copies
   ├─ scripts/                produce, doc, pexels, library, vo, publora, reel, new
   ├─ public/                 audio and clips you add (git-ignored)
   └─ out/                    your renders (git-ignored)
```

## 1. Make it yours: `brand/brand.yaml`

Run `/brand-intake` in Claude Code, or edit [`brand/brand.yaml`](../brand/brand.yaml) by hand and run `npm run brand:check`. The reels read these fields (the full list and rules are in [`schema/brand.schema.json`](../schema/brand.schema.json)):

```yaml
brand:
  name: Kiln Hour          # bottom-right on every frame
  handle: "@kilnhour"      # bottom-left on every frame + the starter's CTA button
  language: en             # captions match number words in this language (en or de; English if unset)
visual:
  colors:
    dark: "#1B1714"        # deep stage + ink on light stages
    light: "#F6EFE6"       # light stage + type on dark stages
    primary: "#E8743F"     # highlights, the accent dot, CTA buttons: bright, glows on dark
    secondary: "#5E8F7E"   # wipes, rings, second-tier data
    tertiary: "#3B2850"    # deep stage for stats and the CTA
  wordmark:                # optional; default = name split into bold first words + light last word
    prefix: KILN
    suffix: HOUR
  end_card:
    button: Follow for more  # the button on a carousel's last slide (default "LINK IN BIO")
motion:
  music: null              # or "audio/bed.mp3" under reels/studio-remotion/public/ (licensed tracks only)
```

- Colours are **contrast-checked when Studio or a render starts**. If a pair would be hard to read, it stops and names the pair to fix.
- Text on any stage picks dark or light ink by actual contrast, so a reskin never needs per-scene colour edits.
- **Fonts** (Space Grotesk + JetBrains Mono) are embedded in the code, so renders never fetch fonts. To change them: `npm i -w reels/studio-remotion @fontsource/<font>`, edit `FONTS` in `reels/studio-remotion/scripts/generate-fonts.mjs` and `FONT` in `src/kit/theme.ts`, then `npm run fonts`.

## 2. Monthly plans

A month is a folder in `reels/content/` with a `plan.json` (what to make) and a `vo.json` (filled in automatically once voice-overs exist). Start by copying `reels/content/example/` to `reels/content/2026-03/`, then register the month in `reels/studio-remotion/src/plan/index.ts` (two import lines and one entry; the file shows how, and Claude Code can do it for you).

### plan.json

```jsonc
{
  "month": "2026-03",            // year-month; reels get ids like 2603-V01
  "title": "March",
  "defaults": {
    "cta": { "button": "LINK IN BIO", "sub": "…", "note": "…" },
    "timezone": "UTC", "videoTime": "18:00", "carouselTime": "12:00",
    "voice": "calm, warm", "voBreak": "<break time=\"1.0s\" />",
    "baseTags": [], "igTags": []
  },
  "weeks": [{ "n": 1, "label": "Week 1", "from": "2026-03-01", "to": "2026-03-07", "approveBy": "2026-02-28" }],
  "videos": [{
    "id": "V01", "slug": "demo", "date": "2026-03-02",
    "line": "motion",            // "motion" = brand stages + blocks · "footage" = library clips
    "hook": ["LINE ONE", "LINE TWO"],
    "beats": [{ "title": ["TWO", "LINES"], "vo": "What the voice says.", "block": { "type": "stat", "value": "12", "label": "pieces" } }],
    "ctaVo": "…",
    "ctaShot": { "asset": "<library id>" }   // footage videos only
  }],
  "carousels": [{ "id": "C01", "slug": "demo", "date": "2026-03-02", "slides": ["Head | sub", "Head | sub"] }]   // 2–10 slides
}
```

The example plan also shows `caption`, `hashtags`, `firstComment`, `igCaption` and `replies`, which go into each post's `post.txt`.

### Blocks (the graphic in the middle of a beat)

| Block | Example |
|---|---|
| `stat` | `{ "type": "stat", "value": "90", "label": "minutes in the kiln" }` |
| `list` | `{ "type": "list", "items": ["One", "Two"] }` |
| `compare` | `{ "type": "compare", "left": { "title": "A", "items": ["…"] }, "right": { "title": "B", "items": ["…"] } }` |
| `verdict` | `{ "type": "verdict", "verdict": "MYTH" }` (`MYTH`, `FACT` or `AVOID`) |
| `jar` | `{ "type": "jar", "label": "PRODUCT", "sub": "DESCRIPTOR" }` (wordmark from your brand) |
| `bars` | `{ "type": "bars", "items": [{ "label": "A", "value": 40, "unit": "g" }] }` |
| `focus` | `{ "type": "focus", "rows": [{ "label": "A", "value": "10 g" }] }` |
| `flow` | `{ "type": "flow", "from": ["A", "B"], "to": "C" }` |
| `tabs` | `{ "type": "tabs", "tabs": [{ "title": "A", "text": "…" }] }` |
| `ruler` | `{ "type": "ruler", "min": 0, "max": 20, "mark": [8, 12], "label": "Range", "unit": "cm" }` |

**Only real numbers**: values come from a label or from numbers the voice-over says. Never invent stats. Plans are checked when Studio or a render starts, so a bad block fails before anything renders.

### Captions

Captions are made from the voice-over: each line is cut into 1–3 word chunks and the spoken word pops in your primary colour. The headline counts as a caption, so a sentence it already says is skipped ("Eight steps" is skipped under an "8 STEPS" headline). A beat's `caption` overrides the automatic text (`""` = none).

Number words are matched in your `brand.language`: English and German tables ship with the kit, English is the default. To add a language, add a table to `NUMBERS` in `src/footage/Captions.tsx`, a line in `langOf()`, and a few cases to `scripts/check-captions.mjs`.

### Audio

1. `npm run produce -- <month> --week 1` writes `vo-script.txt` next to each draft. Record it (for example in ElevenLabs) and **keep the `<break>` tags**: the audio is cut at those pauses.
2. Save the recording as `vo.mp3` in the video's folder in `reels/studio-remotion/out/<month>/<ID>-<slug>/`. Optionally add `music.mp3` (a track you hold a licence for); it sits about 14 dB under the voice.
3. `npm run produce -- <month> --final <ID>` cuts the voice-over and renders `final.mp4`.

For sound effects, see [`reels/sounds/SOUND-LIBRARY.md`](../reels/sounds/SOUND-LIBRARY.md).

### A month, step by step

1. Write the plan (or ask Claude Code to draft it from your brand file).
2. Footage videos: `npm run pexels -- search "…"` then `npm run pexels -- get <id>` adds stock clips to the library (author and licence recorded in `reels/studio-remotion/assets/manifest.json`); `npm run library` adds your own.
3. `npm run produce -- <month> --week N`: silent drafts (video, cover, review sheet, voice-over script, post text, carousel slides).
4. Watch the drafts, record the voice-overs, add music.
5. `npm run produce -- <month> --final <ID>`: `final.mp4`.
6. `npm run doc -- <month>` for an HTML checklist of the month. Posting is always a separate step you approve: see the [posting guides](../README.md#posting).

## 3. Hand-built reels

`npm run new -- my-idea` copies the starter into `reels/studio-remotion/src/reels/my-idea/` and registers it as `MyIdea`. Open `npm start`, pick it, and replace the words and the moves. `npm run reel -- MyIdea` renders it, checks it against the Instagram spec, and saves a review sheet (a grid of frames around every cut) in `reels/studio-remotion/out/`.

The starter shows the whole contract in one file: a timeline in frames, chapters on brand-colour stages, two transitions (`CircleFlood` grows a colour out of a point, `BorderWipe` closes a frame border and reopens it) and a call to action. Make every reel its own idea; keep the kit.

### Kit reference (`reels/studio-remotion/src/kit/`)

| Module | Gives you |
|---|---|
| `theme.ts` | `W H FPS MAX_FRAMES`, palette `C` (from brand), `inkOn` / `accentOn` / `contrast`, `FONT`, `MARGIN`, `BRAND` |
| `anim.ts` | `prog`, `tween`, `ease.*`, `springIn` (optionally bouncy), `hop`, `squash`, `rot`, `mix`, `typed` |
| `svg.tsx` | `<CircleFlood>`, `<BorderWipe>`, `<Ripple>`, `<Grain>`, and `<Protagonist>` (the accent dot the footage engine uses) |
| `text.tsx` | `<MaskLine>` (headline slides up out of a mask), `<Typewriter>` (mono annotation), `<Fade>`, `<Chrome>` (corner wordmark, chapter counter, handle) |
| `audio.tsx` | `<MusicBed>` (fades in and out; silent when `motion.music` is null), `<VoiceOver>` |
| `reel.ts` | `defineReel()`: checks duration ≤ 60 s and the review frames |
| `Review.tsx` | the review sheet, registered as `<Id>-Review` for every reel |

Everything animates from the frame number only (no random numbers, no timers), so renders are repeatable.

## Instagram spec (checked on every render)

| Property | Value | Checked by |
|---|---|---|
| Resolution | 1080 × 1920 (9:16) | every composition, then ffprobe in `npm run reel` / `produce` |
| Frame rate | 30 fps | same |
| Duration | ≤ 60 s (1800 frames) | `defineReel()` and the plan checks stop at load; ffprobe re-checks the file |
| File size | ≤ 50 MB | `produce` (re-renders once at a smaller size if needed) |

## Notes

- **Facts:** every on-screen number needs a source. Put the source on screen or in the caption.
- **Media stays local:** audio, clips, renders and anything you drop in `reels/content/` are git-ignored. Only add music and sounds you hold a licence for.
- **Keys** live in `.env` at the top of the `creator-kit` folder (copy `.env.example`).
- **Troubleshooting:** on Windows a render can fail once with `remotion-audio-mixing\0.wav: No such file or directory`. That's a temporary-folder race; run the command again.
- **Older versions:** JSON-script text-card reels live at tag [`v1.0.0`](https://github.com/vgorla99/creator-kit/tree/v1.0.0); the morphing single-protagonist kit at [`v1.1.0`](https://github.com/vgorla99/creator-kit/tree/v1.1.0).

## License

Code: [MIT](../LICENSE). Fonts: SIL Open Font License.

Remotion has its own license. It's free for individuals and companies of up to 3 people; larger companies need a [Remotion company license](https://www.remotion.dev/license).
