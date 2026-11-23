# Pick your reel engine: Remotion or HyperFrames

> Part of [Creator Kit](../README.md). Both engines read the same `brand/brand.yaml`, use the same `reels/content/` folders and the same sound library. Neither is the default: pick the one that fits how you like to work. You can switch later, or use both.

## Side by side

| | **Remotion** | **HyperFrames** |
|---|---|---|
| Folder | [`reels/studio-remotion/`](../reels/studio-remotion/) | [`reels/studio-hyperframes/`](../reels/studio-hyperframes/README.md) |
| A reel is | a React component (TypeScript) | a web page: HTML + CSS, animated with GSAP |
| Starter reel | `npm run starter` (from the `creator-kit` folder) | `npm run render` (inside `reels/studio-hyperframes/`) |
| Preview | Remotion Studio (`npm start`) | HyperFrames Studio (`npm run preview`) |
| Built-in checks | spec check + review sheet per render | `npm run check`: safe area, contrast, text held long enough, timing |
| What comes ready | monthly plans from a `plan.json`, footage engine, 10 animated blocks, carousels, post texts | a 3-scene starter (hook, tip, end card) you shape scene by scene |
| Captions | word-timed captions built in (`remotion-captions` skill) | `embedded-captions` skill for talking-head clips (setup installs it) |
| Claude skills setup adds | video-shotcraft, remotion-captions, remotion-best-practices | motionmaxxing, the HyperFrames bundle, embedded-captions |
| Licence | free for individuals and companies up to 3 people; bigger companies need a [Remotion company license](https://www.remotion.dev/license) | Apache-2.0, free for everyone |
| Needs | Node 20+, FFmpeg | Node 22+, FFmpeg |

## Pick Remotion if

- you want to **plan a whole month at once**: write hooks and beats in one `plan.json` and let the engine build every video, carousel and caption
- you post **real footage** (your own clips, stock B-roll) cut to a voice-over, with burned-in word captions
- you want one consistent series look across dozens of reels

## Pick HyperFrames if

- you make **one-off motion pieces**: launch teasers, stat reveals, title cards, kinetic type, a promo with its own moves
- you or Claude find **HTML and CSS** easier to change than React code
- you talk to camera and want **designed captions** over that clip
- you want the motion-design skills (motionmaxxing) that review their own render before you see it

Not sure? Start with the engine whose starter reel you like more. Render both and compare.

## How Claude routes a reel

When you ask Claude Code for a reel, it reads `motion.engine` in `brand/brand.yaml` (`remotion` or `hyperframes`, set during `/brand-intake`) and follows that engine's path. Say the other engine's name in your request to use it for one reel.

| Step | Remotion path | HyperFrames path |
|---|---|---|
| 1. Brief | `motion-brief`: the request restated as a short plan (beats, timing, words), you say OK | same |
| 2. Build | a new reel from the starter (`npm run new -- <slug>`) or a month in `plan.json` | a new scene in `film/` or a new project from the starter; motionmaxxing for full motion films |
| 3. Stills | review sheet with key frames, you say OK | `npm run snapshot`, you say OK |
| 4. Render | `npm run reel -- <Id>` or `npm run produce` | `npm run check`, then `npm run render` |
| 5. Captions | built in, from your voice-over timings | talking-head clip → `/embedded-captions` |
| 6. Package | the finished files move to `reels/content/00_Ready/<reel>/`: video, cover, caption text | same |
| 7. Post | native app, or Postiz: see [posting-native.md](posting-native.md), [postiz-self-host.md](postiz-self-host.md), [postiz-cloud.md](postiz-cloud.md) | same |

## Guides

- Remotion: [reels-remotion.md](reels-remotion.md)
- HyperFrames: [reels/studio-hyperframes/README.md](../reels/studio-hyperframes/README.md)
