# Privacy and keys: what stays on your computer

> Part of [Creator Kit](../README.md). The kit runs on your computer. Nothing is uploaded and nothing is posted unless you run a command for it and say yes.

## What stays on your computer

These are **git-ignored**: even if you put your copy of the kit on GitHub, they are never included.

| What | Where |
|---|---|
| Your keys | `.env` (and `sites/template/.env`) |
| Renders | `reels/studio-remotion/out/`, `reels/studio-hyperframes/out/` |
| Your videos, audio, images | `reels/content/` (media files), `reels/studio-remotion/public/` |
| Downloaded B-roll | the studio's asset library |
| Sound packs | `reels/sounds/*/` |
| Style rounds and ratings | `reels/style/` |
| Niche research, monthly SEO notes | `sites/research/` |
| Dashboard caption backups | `reels/dashboard/backups/` |
| Setup logs (never contain keys) | `setup/logs/` |
| Skills setup installs | `.claude/skills/` (except the kit's own) |

Your brand file (`brand/brand.yaml`) and month plans (`plan.json`) are **not** ignored. That's on purpose: they are text you may want to keep in git. Never put a key or password in them.

## Keys: only in `.env`

Some optional services need a key: Pexels and Pixabay (free B-roll), ElevenLabs (voice), Postiz and Publora (scheduling). They all go in one file, `.env`, in the kit folder. The setup creates it from `.env.example`.

- **Open it** in any text editor (Notepad on Windows, TextEdit on Mac), paste the key after the `=`, save.
- **Never** paste a key into chat with Claude, into `brand.yaml`, or into a screenshot you share. If you did by accident, make a new key at the service and delete the old one.
- The kit's scripts read `.env` themselves. `npm run doctor` says whether a key is *set*, never what it is. Claude is told never to read, print or copy it.
- The dashboard reads the Postiz key on its own server part only; it never reaches the browser.
- `sites/template/.env` holds `VITE_FORM_ENDPOINT`, your form address. That one is **public on purpose** (it ends up in your website). Never put a secret there.

## What leaves your computer, and when

| When | What goes where |
|---|---|
| Setup | downloads tools (winget / Homebrew), packages (npm) and skills (GitHub), after your yes |
| B-roll search | your search words to Wikimedia Commons, Pexels or Pixabay |
| Voice-over with ElevenLabs | your script text to ElevenLabs |
| Fonts, first build or render | the font names to Google Fonts (to download them) |
| Posting | the video and caption to Postiz or the platform, **only after you confirm** the exact post |
| Website deploy | the `dist` folder to Cloudflare Pages (or the host you choose), when you upload it |
| Talking to Claude | what you type and the files Claude reads go to Anthropic, as with any Claude Code session |

The HyperFrames tool sends anonymous usage data by default; the kit's `npm run hf:*` commands switch that off.

## Other people's material

- B-roll: `broll-scout` logs the source, author and licence of every clip. `npm run library -- credits` prints the credit lines a post needs.
- Music, fonts and footage must be ones you may use.
- Don't post someone else's face, voice or video without their OK. The `post-video` skill asks you to confirm when it isn't clear.

## Sharing your copy of the kit

If you put your copy on GitHub: run `git status` first and look at the list. If you ever see `.env` in it, stop and ask Claude for help. Never force-add an ignored file.
