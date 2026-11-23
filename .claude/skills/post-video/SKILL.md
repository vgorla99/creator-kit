---
name: post-video
description: Schedule or post a finished reel from Creator Kit, or pull post and account numbers. Use when the creator says "post this", "schedule it", "/post-video", "put it on Instagram / TikTok / YouTube", "trial reel", or asks how a post is doing. Works with the provider in brand/brand.yaml: Postiz self-hosted, Postiz Cloud (via the postiz CLI) or native (a step-by-step checklist for each app). Always confirms with the creator before anything goes to a real account.
---

# Post a video

Posting puts something on a real account in public. **Nothing is scheduled or published until the creator says yes to the exact post** (step 3). Rendering never posts.

Read `posting.provider` and `posting.timezone` from `brand/brand.yaml`, and `content.trial_reels`. No provider set? Use `native` and say so.

## 1. Find the post

- Default place: `reels/content/00_Ready/<folder>/` with `reel.mp4`, `cover.png`, `caption.txt`, and for trial reels `reel-trial-B.mp4` + `trial-B.txt`.
- Monthly plans render to `reels/studio-remotion/out/<month>/<ID>-<slug>/` (`final.mp4` or `video.mp4`, `cover.png`, `post.txt`).
- Read the caption from the file. Never rewrite it unless asked. Check it is under the platform's limit (Instagram 2,200 characters, TikTok 4,000, YouTube Shorts title 100).
- Ask for the date and time if no file or plan gives one.

## 2. Pick the route

| `posting.provider` | Route |
|---|---|
| `native` | step 4a: a checklist the creator follows in each app (free) |
| `postiz-self` | step 4b with their own Postiz address |
| `postiz-cloud` | step 4b with Postiz Cloud |

## 3. Confirm (always)

Show one short block and wait for a clear yes:

```
Post: reels/content/00_Ready/2026-03-04_glaze-myths/reel.mp4
Where: Instagram (@handle) · TikTok (@handle)
When: Wed 4 Mar 2026, 18:00 Europe/Lisbon
Type: normal reel  (or: trial reel, shown to non-followers first)
Caption: "Your glaze isn't the problem. Your kiln…" (first words)
```

If the creator already gave every one of these in their message, that is the yes; do not ask again. Any change after the yes (another time, caption or channel) needs a new yes.

## 4a. Native (no tools needed)

Give a numbered checklist for each platform they post to, with the exact file paths and the caption to paste, following `docs/posting-native.md` (Meta Business Suite for Instagram + Facebook, TikTok Studio, YouTube Studio). Times use the computer's time zone; remind them to check it matches `posting.timezone`. Trial reels: Instagram app → share step → "Trial" toggle. Then ask them to tell you when it is scheduled, and continue with step 5.

## 4b. Postiz (self-hosted or Cloud)

Setup, once (ask before installing anything):
- The CLI: `npm install -g postiz` (check first with `postiz --version`).
- Keys live in `.env`, never in chat or brand.yaml: `POSTIZ_API_KEY` (Postiz → Settings → Public API) and, for self-hosted only, `POSTIZ_API_URL` (e.g. `https://post.example.com/api`). If missing, tell the creator which line to fill in `.env`; never ask them to paste the key to you.
- Load them without printing: run every postiz command as `set -a; . ./.env; set +a; postiz …` from the repo root. Never echo, log or show the key.
- Self-hosting guide: `docs/postiz-self-host.md`. Cloud: `docs/postiz-cloud.md`.

Steps:
1. `postiz integrations:list`: pick the channel by platform and profile name. If the channel is not listed, stop: it is not connected yet (connect it in the Postiz web app).
2. Settings the platform needs: `postiz integrations:settings <id>` shows the required fields. Common ones:
   - Instagram reel `{"post_type":"post"}` · story `{"post_type":"story"}`
   - Instagram trial reel `{"post_type":"post","is_trial_reel":true,"graduation_strategy":"MANUAL"}` (MANUAL = the creator decides later whether followers see it)
   - TikTok: fill every required field the schema lists (privacy level, duet, stitch, comments, AI-made flag). New TikTok developer apps may only post privately (`SELF_ONLY`) until TikTok approves them; say so if that is the case.
3. Upload first (platforms reject outside links): `postiz upload "<file.mp4>"`, and use the returned path as media.
4. Create: `postiz posts:create -c "<caption>" -m "<uploaded path>" -s "<ISO time in UTC>" -i <integration id> --settings '<json>'`. Convert the local time in `posting.timezone` to UTC carefully (daylight saving!). Different captions per platform = separate `posts:create` calls. A first comment = a second `-c` without `-m`.
5. Verify with `posts:list`: the post is there at the right time.

On Windows, if a caption with line breaks gets cut, write it to a file and use `postiz posts:create --json post.json`.

## 5. After scheduling

- Tell the creator: platform, time (their time zone) and the post ID or where to see it.
- Once it is live, move the folder from `00_Ready/` to `reels/content/01_Live/`.
- Numbers: `postiz analytics:post <post id>` (posts published through Postiz, after they go live) and `postiz analytics:platform <integration id> -d 30`. Native: ask the creator for the numbers or a screenshot of the insights. Add one row per post to `reels/content/_metrics/metrics.csv`, matching its header exactly; leave unknown columns empty, never guess numbers.

## Never

- Post or schedule without the yes in step 3.
- Print, log or paste a key or token. Read `.env` only through `set -a; . ./.env; set +a`.
- Delete or edit a live post without asking.
- Post another person's video, voice or face without the creator confirming they have the rights.
