# Search Console: the monthly check

> Part of [Creator Kit](../README.md). Once your site is online, Google Search Console shows what people typed to find you. Once a month, turn those questions into answers on your pages. Setting it up the first time is step 6 of [Launching your website](sites-launch.md#6-tell-google-search-console).

## Why bother

People type long, real questions: *"how do I stop a pinch pot cracking while it dries"*. If one of your pages almost answers it, Google already shows that page, just low down. Put the exact question on the page and answer it in the first two sentences, and the page often moves up. AI assistants quote pages that answer plainly too.

## When

Monthly, once the site has at least **4 weeks** of data. It takes about 20 minutes.

## Step by step

1. Open [Google Search Console](https://search.google.com/search-console) and pick your site.
2. Click **Performance** → **Search results**.
3. At the top, set the date to **Last 3 months** and click **Average position** so it turns on.
4. Below the chart, open the **Queries** tab.
5. Click **Export** (top right) and download it, or select the table and copy it.
6. Open Claude Code in the kit folder and type `/site-builder`, then *"monthly check"*, and give it the file or paste the table.

Claude then:

- picks queries with **8 or more words**, and queries that are seen but sit below position 10: real questions your site almost answers
- finds the page that already ranks for each one (it may ask you to click the query → **Pages** tab and tell it the page)
- proposes, per page, the question as a heading and a plain, complete answer in the first two sentences, or a new long-answer article if no page fits
- **waits for your OK**, then edits the words, rebuilds, runs `npm run check-seo`, and tells you to upload the new version ([sites-launch.md](sites-launch.md#4-put-it-online-with-cloudflare-pages))
- logs what changed in `sites/research/MONTHLY.md` (stays on your computer), so next month you can see if the position moved

## Good habits

- Answer the question **as asked**, in plain words, before any story.
- One question per heading. Don't stuff the same phrase in five times.
- Only true answers. If you don't know, say so or leave it out.
- Give changes time: positions move over weeks, not days.

## Also useful in Search Console

| Menu | What it tells you |
|---|---|
| **Pages** (under Indexing) | which pages Google has in its index, and why others aren't |
| **Sitemaps** | whether your `sitemap.xml` was read (**Success**) |
| **Core Web Vitals** | whether real visitors find the site fast (needs some traffic) |
| **URL Inspection** (top search bar) | check one page and click **Request indexing** after a big change |
