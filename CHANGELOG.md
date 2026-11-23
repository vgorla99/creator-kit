# Changelog

## v2.0.0: Creator Kit (2026-11)

ReelsMaker becomes **Creator Kit**: one brand file in, reels and websites out. The repository was renamed from `reelsmaker`; old links redirect.

### What v2 adds over v1.1.0

| Area | v1.1.0 (ReelsMaker) | v2.0.0 (Creator Kit) |
|---|---|---|
| Brand | `src/brand.ts`: name, handle, 5 colours | `brand/brand.yaml` + `brand/STYLE.md`, checked against a schema (`npm run brand:check`), filled by the guided `/brand-intake` skill. Example brand: the invented **Kiln Hour**. |
| Reel engines | Remotion, one morphing protagonist | **Remotion** (`reels/studio-remotion`): footage engine, monthly plans, carousels, spoken captions. **HyperFrames** (`reels/studio-hyperframes`, HTML + GSAP) as a second engine. Pick either during intake. |
| Captions and sound | none | Word-timed captions (English and German), sound library format and mix rules; the recommended sound pack is a download, never committed. |
| B-roll | none | `broll-scout`: clips from your own footage, Wikimedia Commons, Pexels and Pixabay, with every licence logged. |
| Review and posting | review sheet | Gates for plan, stills and post; `post-video` schedules through Postiz (self-hosted or cloud), `content-calendar-from-analytics` plans the next month from the numbers; rendering never posts. |
| Dashboard | none | Local dashboard (`npm run dashboard`): library, review notes, captions, calendar, performance, Style rounds. Keys stay server-side. |
| Websites | none | `sites/template`: React + Vite + Tailwind, SEO and schema built in, Cloudflare Pages deploy; `niche-research` and `site-builder` skills. |
| Setup | `npm install` | One command for Windows (`setup/setup.ps1`) and macOS (`setup/setup.sh`), pinned third-party skills (`setup/skills.lock.yaml`), and `npm run doctor`. |
| Docs | README | Guides for every part in `docs/`, a link checker (`scripts/check-links.mjs`) and `CREDITS.md`. |

### Removed

- The v1 "morphing protagonist" style. It stays available at tag [`v1.1.0`](https://github.com/vgorla99/creator-kit/tree/v1.1.0).

### Known limits

- The macOS setup script is syntax-checked but not yet run on a Mac.
- The Postiz self-host guide has not yet been tested end to end on a fresh server.

## v1.1.0

ReelsMaker: morphing single-protagonist motion kit for Remotion.

## v1.0.0

ReelsMaker: JSON-script text-card reels.
