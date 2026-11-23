---
name: site-builder
description: Plan, build, SEO-check and launch a creator's website from brand/brand.yaml with the Creator Kit template in sites/template (React + Vite + Tailwind, Cloudflare Pages). Plans first and waits for OK, then writes the copy and pages, runs the SEO pack (sitemap, robots.txt, llms.txt, JSON-LD, meta), checks Lighthouse and walks the launch checklist. Also runs the monthly Search Console loop that turns long real queries into answers. Use when someone types /site-builder, says "build my website", "make my site", "add a page", "launch my site", or "do the monthly SEO check".
---

# Site builder

You are building a fast, findable website for a non-developer. They can follow steps and click buttons; they cannot debug a build. Work in small, visible steps and stop at the gates marked **WAIT**.

## What exists already

- `brand/brand.yaml`: name, colours, fonts, socials, and the `site` block (`domain`, `pages`, `offer`, `lead_magnet`). The site reads it at build time; colours and fonts need no code changes.
- `sites/template/`: the site.
  - `src/content.ts`: **every word a visitor reads** that is not a brand fact. Most builds only change this file.
  - `src/site.ts`: the page list (`routes`), titles and descriptions for search results, and the JSON-LD for each page.
  - `src/pages/`: Home (hero, offer, proof, lead form, FAQ), About, Contact, Article (long answer), NotFound. `src/components/`: Layout, LeadForm, LeadPopup, Reveal (scroll motion), HeroArt, ui.
  - `scripts/`: `prerender` (one HTML file per page), `gen-schema` (JSON-LD), `gen-sitemap` (sitemap.xml, llms.txt, robots.txt), `check-seo`.
- `sites/research/NICHE.md` from `/niche-research` (if missing, offer to run it first; you may continue without it if they say so).
- `docs/sites-launch.md`: the launch guide the creator follows. Point them to it instead of re-explaining.

## Rules

- **Plan first. WAIT for an explicit OK before writing any page.**
- Read `brand/brand.yaml`; if it still holds the Kiln Hour example, stop and suggest `/brand-intake`.
- Only real proof. Testimonials, numbers and logos must come from the creator. If they have none yet, use honest facts (group size, what is included) and leave quotes out.
- Every page: one H1, a title under about 48 characters (the brand name is added), a meta description of 70 to 160 characters, the most important sentence first.
- Colours: keep the role mapping in the components (buttons `bg-primary text-dark`, accent text `text-tertiary` on light, `text-primary` on dark). The brand checker guarantees these pairs are readable; other pairs may not be.
- Motion: only `transform` and `opacity`, only inside `prefers-reduced-motion: no-preference` (see `src/index.css`), never on the H1 or main text. Use the `Reveal` component for scroll reveals.
- Strict TypeScript, no `any`. Tailwind classes, no new CSS files. Do not add dependencies without asking.
- No secrets in the site. The form endpoint in `.env` is public by design; nothing else goes there.
- Never deploy, buy a domain or submit to Search Console for them: give the exact step from `docs/sites-launch.md` and let them click.

## 1. Plan → WAIT

Write the plan in chat (short), using `brand.yaml` and `NICHE.md`:

1. **Sitemap**: the pages, from `site.pages` plus the template's Home, About, Contact and at least one long-answer article. One line per page: path, goal (what the visitor should do next), main keyword.
2. **Home outline**: hero line (the promise, under 10 words), sub-line, the 3 offer steps, proof you actually have, lead magnet heading, 3 FAQs taken from real long questions.
3. **Article(s)**: the exact long question (8+ words) as H1, the 2–3 sentence short answer, the section headings, 3 related questions. Pick from the answer gaps in `NICHE.md`.
4. **Pop-up offer**: the lead magnet line and when it opens (default: half-way down the page or after 30 seconds, once per visitor).
5. **Motion plan** in UI terms: e.g. "hero art floats slowly; offer cards fade up on scroll; buttons press in on tap". Nothing that moves text the visitor is reading.
6. **Form**: where sign-ups go (Formspree, Tally, Basin...). They create the form; you only need its URL.

Ask: "Shall I build this?" Change the plan until they say yes.

## 2. Build

1. Rewrite `sites/template/src/content.ts` with the approved copy (keep the types). Match `voice.tone`, `voice.do` and `voice.dont` from `brand.yaml`.
2. For extra pages: add a page component in `src/pages/`, a `PageKind`, an entry in `PAGES` (`src/App.tsx`) and in `routes` (`src/site.ts`) with `nav` if it belongs in the menu. For more articles, turn `article` into a list and give each its own route.
3. Swap `HeroArt` for a real photo only if they have one: put it in `public/`, use `<img>` with `width`, `height`, a real `alt`, and `fetchpriority="high"` for the hero.
4. Form: copy `sites/template/.env.example` to `.env` and set `VITE_FORM_ENDPOINT`.
5. Run in `sites/template`: `npm install` (first time), then `npm run dev` and send them the local link to look at. Fix what they ask.

## 3. SEO pack

Run in `sites/template`:

```
npm run build
npm run check-seo
```

`build` writes every page as HTML, the JSON-LD, `sitemap.xml`, `llms.txt` and `robots.txt` (AI crawlers allowed). `check-seo` must say **all pass**. Fix every FAIL; fix warnings unless there is a reason (the `.example` domain warning goes away once `site.domain` is real).

Then measure with Lighthouse (mobile) on the built site: `npm run preview` in one terminal, then `npx lighthouse http://localhost:4173/ --view` in another. Performance, Accessibility, Best Practices and SEO must each be **90 or more**. Tell them the four scores.

## 4. Launch checklist

Walk them through `docs/sites-launch.md`, one section at a time, and tick these off together:

- [ ] `site.domain` in `brand/brand.yaml` is their real domain; rebuilt after changing it
- [ ] `check-seo` all pass; Lighthouse ≥ 90 ×4
- [ ] Form tested once with their own email
- [ ] Deployed to Cloudflare Pages; the `pages.dev` link works
- [ ] Domain connected; `https://` works with and without `www`
- [ ] Search Console verified; `sitemap.xml` submitted
- [ ] Optional: Bing Webmaster Tools imported from Search Console (Bing feeds several AI assistants)
- [ ] Share link tested (the preview card shows title, text and image)

## 5. Monthly loop (Search Console)

Once a month, when the site has at least 4 weeks of data:

1. Ask them to open Search Console → **Performance** → **Search results**, set the date to the last 3 months, turn on **Average position**, open the **Queries** tab, and export (top right) or paste the table here.
2. Find queries with **8 or more words**, and queries with impressions but a position worse than 10. These are real questions the site almost answers.
3. For each, find the page that already ranks for it (Search Console → click the query → **Pages** tab).
4. Propose, per page: put the exact question as an H2 (or the H1 for an article) and answer it **in the first two sentences** under it, plain and complete. If no page fits, propose a new long-answer article.
5. **WAIT** for OK, edit `content.ts`, rebuild, run `check-seo`, update the article's `updated` date, and redeploy.
6. Keep a dated log in `sites/research/MONTHLY.md`: query, page, what changed. Next month, check whether the position moved.
