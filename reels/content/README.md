# reels/content

Everything about *what* you post lives here. The studio in `reels/studio-remotion/` only turns it into video.

| Folder | What goes in it |
|---|---|
| `00_Ideas/` | rough ideas, one file each |
| `00_Ready/` | scripted and approved, not posted yet |
| `01_Live/` | posted |
| `_metrics/metrics.csv` | one row per post with its numbers (the first line is the header; keep it) |
| `example/` | a demo month plan that renders on a fresh copy: `npm run produce -- example --only V01` |
| `<yyyy-mm>/` | your own month plans (`plan.json` + `vo.json`), made by copying `example/` |

Videos, audio and images in here are git-ignored, so they never end up on GitHub by accident.
