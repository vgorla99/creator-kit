---
name: content-calendar-from-analytics
description: Plan next month's reels from what actually worked. Use when the creator asks "what should I post next month", "plan my calendar", "which hooks work", "how are my reels doing", or at the end of a month. Reads reels/content/_metrics/metrics.csv (plus Postiz numbers if they use it) and brand/brand.yaml, finds which hook types, pillars and days win with honest sample sizes, and drafts a calendar for the creator's OK.
---

# Content calendar from analytics

Plan from the creator's own numbers, not from marketing theory. Short report, then a calendar, then their OK.

## 1. Gather the numbers

1. `reels/content/_metrics/metrics.csv`: one row per post (`date, platform, post_id, reel_id, title, url, views, reach, likes, comments, shares, saves, follows, avg_watch_s, completion_pct`).
2. If `posting.provider` is `postiz-self` or `postiz-cloud`: refresh it first with the `post-video` skill's analytics steps, so views are current (views only grow; old numbers undersell the winners). Add missing rows; update numbers on existing rows.
3. Native posting: ask the creator to paste or screenshot their insights for the posts that have no numbers yet.
4. Fewer than 6 posts with numbers: say the sample is too small to find patterns, then plan from `brand/brand.yaml` alone (pillars, hook types, posting days) and suggest testing two hook types side by side.

Never invent a number. A blank cell stays blank.

## 2. Label every post

For each `reel_id`, find its hook type, pillar and whether it was a trial reel, in this order:
- the month's `plan.json` in `reels/content/<yyyy-mm>/`, or the post folder's `NOTE.md` / `trial-B.txt` in `00_Ready/` or `01_Live/`
- otherwise, classify from the first line of the caption or title, using the names in `content.hook_types` and `content.pillars`, and mark the label as *guessed*

Hook types, if the brand has none: **result first** · **pain first** · **contrarian** · **question** · **list / number** · **story** · **how-to**.

## 3. Find what wins

Compare **medians**, not averages (one viral post distorts an average). For each group report the median views, the median saves + shares per 1,000 views, and the count.

- by hook type
- by pillar
- by weekday and posting hour (in `posting.timezone`)
- trial vs normal reels, if `content.trial_reels` is true
- by length or `completion_pct`, if filled

Be honest about strength:
- a group with fewer than 5 posts is a hint, not a finding
- name the exceptions: "list hooks won 6 of 8 times; the 2 losses were both on Mondays"
- views measure reach; saves, shares and follows measure value. Say when they disagree.

## 4. Report (keep it to one screen)

```
Last 30 days: 14 posts · median 2,340 views
Winning hook type: result first (5 posts, median 4,100) vs question (4 posts, median 1,200)
Best pillar: glaze tests (median saves 18 per 1k views)
Best days: Wed and Sun evenings
Weak spot: Monday posts (3 of 3 under median)
Confidence: medium (most groups have 4-5 posts)
```

## 5. Draft next month

- About 60 % of slots on the 1–2 proven hook types, about 20 % testing one new hook type, the rest on the strongest pillar's evergreen topics.
- Spread pillars so none repeats three posts in a row.
- Use only days in `content.posting_days`; within them, favour the winning days.
- If trial reels are on: give each reel a hook A and hook B of different types (the `ab-hook-tester` skill writes and judges the pair).
- Each slot: date · pillar · hook type · working title · hook A (≤ 6 words) · format (plan block, hand-built, carousel).

Show it as a table and **wait for the creator's OK**. After OK:
- write `reels/content/<yyyy-mm>/CALENDAR.md` (the report + the table)
- offer to turn it into `reels/content/<yyyy-mm>/plan.json` by copying `reels/content/example/` and filling the plan (then `reel-pipeline` takes over).

Suggest changes to `content.hook_types` or `content.pillars` in brand.yaml only as a question; edit brand.yaml only after a yes, then run `npm run brand:check`.
