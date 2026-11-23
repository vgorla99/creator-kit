# The reel pipeline

> Part of [Creator Kit](../README.md). What happens, step by step, when you ask Claude for a reel. Claude follows this with the `reel-pipeline` skill; you only need to say OK (or "change this") at the gates.

```
idea → hook → brief → stills → render → package → review → post → learn
         ▲ you OK     ▲ you OK                    ▲ you OK  ▲ you OK
```

Start by telling Claude Code what you have: *"make a reel about why pinch pots crack"*, a script, your own clips, a link, or *"plan next month"*.

## 1. Idea

Claude reads your brand file (`brand/brand.yaml`) and style notes (`brand/STYLE.md`), then works out which kind of reel this is:

| You bring | Claude makes |
|---|---|
| a month of tips or myths | a monthly plan (`plan.json`): every video, carousel and caption at once |
| your own clips | a reel cut from your footage, with captions |
| "I need B-roll" | a search with `/broll-scout`: your footage, Wikimedia Commons, Pexels, Pixabay, licences logged |
| one idea that deserves its own look | a hand-built reel from the starter |
| a product or website to promote | a product promo |
| a cheat sheet or list | a carousel (4:5 slides) |

Which engine builds it (Remotion or HyperFrames) comes from `motion.engine` in your brand file. See [engines.md](engines.md).

## 2. Hook (gate: your OK)

Claude proposes hook A and hook B (two hook types, 6 words max), the beats, the words on screen and the call to action. Short, in chat. See [playbook.md](playbook.md). **Nothing is built until you say OK.**

## 3. Brief

For anything that moves, Claude writes a short motion brief (`motion-brief` skill): each beat with its timing, how things enter and leave, the sound. It uses the motion words you locked in your brand file (`motion.locked_terms`) and avoids the ones you rejected.

## 4. Stills (gate: your OK)

Before the full render, Claude shows you the key frames as one picture (a contact sheet or review sheet). Check the words, the colours, the safe zone. This is the cheap moment to change things. **The full render waits for your OK.**

## 5. Render

- Remotion: `npm run reel -- <Id>` or `npm run produce -- <month> --final <ID>`. Every render is checked: 1080×1920, 30 fps, 60 seconds max.
- HyperFrames: `npm run hf:check`, then `npm run hf:render`.

Monthly plans render silent drafts first. You record the voice-over from `vo-script.txt`, save it as `vo.mp3`, and the final render cuts it in. Details: [reels-remotion.md](reels-remotion.md).

## 6. Package

The finished reel goes into its own folder in `reels/content/00_Ready/`:

| File | What |
|---|---|
| `reel.mp4` | the video |
| `cover.png` | the cover |
| `caption.txt` | the caption, in your voice |
| `reel-trial-B.mp4`, `trial-B.txt` | the hook-B version, if trial reels are on |
| `NOTE.md` | the idea, each beat, what is real and what is illustration |

Videos and images stay on your computer; git ignores them.

## 7. Review

Open the dashboard (`npm run dashboard`, then http://localhost:5180). Watch the video, fix the caption, write notes, press **Approve**. **Copy prompt for Claude** turns your notes into one message to paste back to Claude.

## 8. Post (gate: your OK)

Posting is always a separate step. Ask Claude to post or schedule (`post-video`). It shows you the exact file, channel, time and caption and waits for your yes. Three ways to post: [native schedulers](posting-native.md), [Postiz self-hosted](postiz-self-host.md), [Postiz Cloud](postiz-cloud.md). After it goes live, the folder moves to `reels/content/01_Live/`.

## 9. Learn

When the numbers come in, add one row per post to `reels/content/_metrics/metrics.csv` (Claude can do it from Postiz or from a screenshot of your insights). Once a month, ask Claude to plan next month from them. See [analytics.md](analytics.md).

## The quality bar

Every motion reel is checked against the kit's 12 rules: [the-standard.md](the-standard.md).
