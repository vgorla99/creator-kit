# Dashboard

A local web page to plan, review and track your reels. It runs on your own computer only (`http://localhost:5180`), reads your post folders directly, and never posts anything for you.

| Tab | What you do there |
|---|---|
| **Library** | every reel and carousel, from first render (draft) to ready to live; search and filter; **Copy prompt for Claude** turns your approvals and notes into one message |
| **Detail** (click a post) | watch the video, edit captions (saved straight into `post.txt`, with a backup), write change notes, **Approve** |
| **Calendar** | your month: plan entries from `plan.json`, your post folders, and the Postiz queue (published / scheduled / errors) |
| **Performance** | numbers from `reels/content/_metrics/metrics.csv`, which hook types win, and Postiz analytics per channel |
| **Style** | rate Claude's style options Keep / Maybe / Drop, round by round (see [`reels/style/README.md`](../style/README.md)) |

## Start it

Needs Node.js 22.18 or newer (the setup installs it). From the kit folder:

```bash
npm run dashboard
```

It installs its packages the first time, builds the page, then serves it. (Inside `reels/dashboard/`, `npm start` does the same.)

Open **http://localhost:5180**. Stop it with **Ctrl+C**.

On a fresh copy of the kit you see the invented example brand's posts (from `reels/content/example/`). As soon as you have posts of your own, they replace the examples.

## Where it reads and writes

| What | Where |
|---|---|
| Brand name, colours, timezone, hook types | `brand/brand.yaml` |
| Drafts | `reels/studio-remotion/out/<folder>/<ID>-<slug>/` (what `npm run produce` renders) |
| Ready / live posts | `reels/content/00_Ready/` and `reels/content/01_Live/` (one folder per post, optionally inside a month folder) |
| Plan | `reels/content/<month>/plan.json` |
| Numbers | `reels/content/_metrics/metrics.csv` (fill `hook_type` so the hook table works) |
| Approve + notes | `dash.json` next to each post |
| Caption edits | the post's own `post.txt` / `caption.txt` / `trial-B.txt`; a backup goes to `reels/dashboard/backups/` first |
| Style ratings | `reels/style/ratings.json` and `reels/style/submissions/` |

A post folder holds any of: `post.txt` (as `produce` writes it), `caption.txt`, `trial-B.txt`, a video (`final.mp4`, `reel.mp4` or `video.mp4`; others show as extra versions), `cover.png`/`.jpg`/`.svg`, `slide-1.png`…, `review.png`.

## Postiz (optional, read-only)

Without a key, the Postiz panels say **not connected** and everything else works. To connect, add to the `.env` file in the kit folder and restart:

```bash
POSTIZ_API_URL=https://api.postiz.com     # Postiz Cloud; self-hosted: your backend URL, e.g. https://post.example.com/api
POSTIZ_API_KEY=                           # Postiz → Settings → Developers → Public API
```

The key is read by the dashboard's server and never sent to the browser. The dashboard only reads (posts, channels, analytics); scheduling stays with you or Claude.

## Safety

- Listens on `127.0.0.1` only and refuses requests for other host names or from other websites.
- Writes only `dash.json`, the caption files you edit, backups, and the Style files.

## For contributors

```bash
npm run dev         # Vite with hot reload on :5173 (run `npm run server` in a second terminal)
npm run typecheck   # server + web
npm run check       # parser and prompt self-checks
npm run build       # web/dist
```

Layout: `server/` (Node + Hono, runs the TypeScript directly), `web/` (React + Vite + Tailwind), `shared/` (types and parsers used by both). `DASH_EXAMPLE=1` forces the example content; `PORT` changes the port.

Based on the author's own content dashboard, rebuilt for the kit. The Style tab follows the Style Lab template by Shaan Johari ([@viashaan](https://instagram.com/viashaan)).
