# Creator Kit: how Claude works in this repo

The person you are helping is a creator, usually not a developer. They can install things and follow steps; they cannot debug code. Be brief, plain and concrete. One question at a time. Explain any term the first time you use it.

## Start here

- The brand lives in `brand/brand.yaml` (facts) and `brand/STYLE.md` (feel). Read both before making anything. If they still hold the invented example brand **Kiln Hour**, suggest `/brand-intake` first.
- Something not working on their computer? Run `npm run doctor` and follow its "How to fix" lines. Missing tools or skills: `powershell -ExecutionPolicy Bypass -File setup\setup.ps1` (Windows) or `bash setup/setup.sh` (Mac). Both are safe to run again.

## Skills (in `.claude/skills/`)

| Need | Skill |
|---|---|
| set up or change the brand | `brand-intake` |
| make a reel, start to finish | `reel-pipeline` (it calls the others) |
| write a motion brief before building | `motion-brief` + `motion-vocabulary` |
| find B-roll (own footage, Wikimedia, Pexels, Pixabay), licences logged | `broll-scout` |
| schedule or post, pull numbers | `post-video` |
| plan next month from the numbers | `content-calendar-from-analytics` |
| research a niche for a site | `niche-research` |
| build and launch the website | `site-builder` |

Third-party skills (virality, ab-hook-tester, humanizer, watch, the engine and site skills) are installed by setup from their own repos, pinned in `setup/skills.lock.yaml`. Never copy their files into the repo, never edit them in place: changes go in `setup/patches/`.

## Gates: stop and wait for the creator's OK

1. **Brand** read-back after `/brand-intake`.
2. **Plan**: hooks, beats, words on screen (and the motion brief) before building.
3. **Stills**: a contact sheet of key frames before the full render.
4. **Post**: the exact file, channel, time and caption before anything is scheduled or published (`post-video`). Rendering never posts.
5. **Site plan** before building pages; **deploy** before going live (`site-builder`).

## Folders

| Path | What |
|---|---|
| `brand/` | brand.yaml + STYLE.md (validate with `npm run brand:check`) |
| `schema/` | the rules for brand.yaml |
| `reels/studio-remotion/` | Remotion studio; renders land in `reels/studio-remotion/out/` |
| `reels/studio-hyperframes/` | HyperFrames studio (HTML + GSAP), engine `hyperframes`: `npm run hf:preview`, `hf:snapshot`, `hf:check`, `hf:render` from the root |
| `reels/dashboard/` | local dashboard (review, captions, calendar, numbers, Style rounds): `npm run dashboard` → http://localhost:5180 |
| `reels/content/` | `00_Ideas` → `00_Ready` → `01_Live`, `_metrics/metrics.csv`, month plans `<yyyy-mm>/` |
| `reels/sounds/` | sound index; packs stay local |
| `sites/template/` | the website (React + Vite + Tailwind) |
| `setup/` | setup scripts, doctor, skills lock and patches |
| `docs/` | guides for humans: reels, posting, site launch |

## Rules

- **Secrets:** keys live only in `.env` (git-ignored; template `.env.example`). Never read, print, paste or commit them. Scripts that need keys load `.env` themselves. If the creator pastes a key in chat, tell them it belongs in `.env` and do not repeat it.
- **Never commit** `.env`, renders, footage, audio, sound packs, `sites/research/` or anything in `.claude/skills/` that setup installed.
- **Ask before** deleting files, installing global tools, changing shared kit code other reels use, or editing brand.yaml outside `/brand-intake`.
- **Git:** only commit or push when the creator asks. Use a branch and a pull request, never push to `main`. Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`).
- **Code:** strict TypeScript, no `any`. Animations are pure functions of the frame (no timers, no unseeded random). Sites use Tailwind, mobile first.
- **Checks before saying done:** `npm run brand:check`; `npm run typecheck` if studio code changed; `npm run hf:check` for HyperFrames work; render and look at the result for video work; `npm run build && npm run check-seo` in `sites/template` for site work.
- **Language:** reply in the creator's language; repo files and docs stay in English.
- **Licences:** Remotion is free for individuals and companies up to 3 people. Music, footage and fonts must be ones the creator may use; log the source of every stock clip.
