# Platforms: Instagram, TikTok, YouTube Shorts

> Part of [Creator Kit](../README.md). One vertical video works on all three. This page lists what the kit renders, what each app allows, and where the app's buttons cover your video.

## What the kit renders

| | Value | Why |
|---|---|---|
| Size | 1080 × 1920 pixels (9:16, vertical) | the native size of all three apps |
| Frame rate | 30 fps | smooth, small files |
| Length | 60 seconds or less | the Remotion studio checks it on every render; short reels are watched to the end more often |
| File | MP4 (H.264 video, AAC audio), 50 MB or less | uploads fast everywhere |
| Loudness | about −14 LUFS | what the apps play back at; see [sounds.md](sounds.md) |
| Carousels | 1080 × 1350 (4:5) slides | the tallest photo size Instagram shows in the feed |

You don't need different versions per platform. The same `reel.mp4` goes everywhere.

## What each app allows (late 2026)

The apps change these limits often. Check the official help pages before you plan anything long.

| | Instagram Reels | TikTok | YouTube Shorts |
|---|---|---|---|
| Shape | 9:16 vertical | 9:16 vertical | vertical or square |
| Longest | 3 minutes when made in the app; longer uploads are possible but are not shown to new viewers as reels | 10 minutes in the app, longer when uploaded from a computer | 3 minutes ([YouTube help](https://support.google.com/youtube/answer/15424877)) |
| Caption | 2,200 characters | 4,000 characters | title up to 100 characters |
| Schedule ahead | Meta Business Suite or the Instagram app | 15 minutes to 10 days, on tiktok.com | YouTube Studio |
| Test a hook | **trial reels** (shown to non-followers first, see [playbook.md](playbook.md)) | no built-in test | no built-in test |

How to schedule on each app, for free: [posting-native.md](posting-native.md).

## Safe zones: where the buttons go

Each app draws its own things over your video: the profile name and caption at the bottom, the like/comment/share buttons on the right, and tabs or a search bar at the top. Anything important that sits there gets covered.

```
 ┌──────────────────────────┐  ← top: tabs, search (keep clear)
 │                          │
 │   ┌──────────────────┐   │
 │   │                  │ ▢ │
 │   │   SAFE ZONE:     │ ▢ │  ← right: like, comment, share
 │   │   hook, captions,│ ▢ │
 │   │   faces, numbers │   │
 │   └──────────────────┘   │
 │  @handle · caption ...   │  ← bottom: name, caption, music
 └──────────────────────────┘
```

The kit keeps a margin on each side, in pixels of the 1080 × 1920 frame. You set it in your brand file:

```yaml
visual:
  safe_zone: { top: 288, bottom: 672, left: 120, right: 300 }
```

Those numbers are the HyperFrames studio's default when `safe_zone` is not set: a band that is safe on all three apps at once. The bottom margin is the biggest because the caption grows when it is long.

Rules of thumb:

- The **hook, captions, faces and numbers** go inside the safe zone.
- **Background, texture and motion** can fill the whole frame.
- Keep captions in the upper part of the lower half, not at the very bottom.
- Check it on your phone: post as a private draft or a close-friends story once, and look.

`npm run hf:check` flags text outside the safe area in HyperFrames reels. The dashboard's **Style** tab has an Instagram safe-zone overlay you can switch on while rating options.

## Covers

- Instagram shows the cover cropped to 4:5 on your profile grid and full 9:16 in the reels tab. Keep the cover's title in the middle.
- TikTok and YouTube let you pick a frame from the video or upload an image. The kit writes `cover.png` next to every render.
