# Contributing

> Part of [Creator Kit](../README.md). Thanks for helping. Bug reports from non-developers are just as welcome as code.

## Report a problem

Open an [issue](https://github.com/vgorla99/creator-kit/issues) with:

- what you ran (the exact command, or what you asked Claude)
- what you saw (the error text; a screenshot is fine)
- your system (Windows or Mac) and the output of `npm run doctor`

**Never include keys, passwords or the contents of `.env`.** Check screenshots before you post them.

## Suggest an idea

Open an issue that starts with "Idea:". Say what you are trying to make and where the kit gets in the way.

## Change code or docs

1. Fork the repository and make a branch: `feat/…`, `fix/…` or `docs/…`.
2. Run the setup once (`setup\setup.ps1` / `setup/setup.sh`) so you have every part.
3. Make the change. Keep it small and focused on one thing.
4. Run the checks for what you touched:

   | You changed | Run |
   |---|---|
   | anything | `npm run brand:check` and `npm run doctor` |
   | `reels/studio-remotion/` | `npm run typecheck`, `npm run check:captions`, `npm run check:stock`, and render what you changed (`npm run starter` or `npm run produce -- example --only V01`), then look at it |
   | `reels/studio-hyperframes/` | `npm run hf:check`, then `npm run hf:render` and look at it |
   | `reels/dashboard/` | in that folder: `npm run typecheck`, `npm run check`, `npm run build` |
   | `sites/template/` | in that folder: `npm run build && npm run check-seo` |
   | `schema/` | update `brand.schema.json` and `validate-brand.d.mts` together, then `npm run brand:check` |
   | docs or README | `node scripts/check-links.mjs` |

5. Commit with a [conventional commit](https://www.conventionalcommits.org) message (`feat: …`, `fix: …`, `docs: …`, `chore: …`) and open a pull request to `main`. Describe what changed and how you checked it; add a screenshot for anything visual.

## House rules

- **Strict TypeScript, no `any`.** UI uses Tailwind, mobile first.
- **Animations are pure functions of the frame**: no timers, no unseeded random numbers. Renders must be repeatable.
- **Plain English** in docs and messages: short sentences, explain a term the first time, say what the reader should see.
- **The example brand is invented** (Kiln Hour). Never add real brands, people's footage, real metrics or personal data to examples, docs or screenshots.
- **No secrets** in the repo: keys go in `.env`, which is git-ignored.
- **No media in git**: renders, footage, audio and sound packs stay out.
- **Third-party skills are installed, not copied.** To add one, check it has a licence (no licence = leave it out), add an entry pinned to a commit in [`setup/skills.lock.yaml`](../setup/skills.lock.yaml) (its header explains each field), and add a row to [CREDITS.md](../CREDITS.md). Changes to their text go in `setup/patches/`.
- Changes to the gates (OK before building, OK before rendering, yes before posting) need a very good reason.

## Licence

By contributing you agree that your contribution is released under the [MIT licence](../LICENSE).
