# Troubleshooting

> Part of [Creator Kit](../README.md). Start with the doctor. If that doesn't help, find your message below. Still stuck? Ask Claude (last section).

## First: run the doctor

In a terminal inside the kit's folder:

```
npm run doctor
```

It checks your tools, the kit, your brand file and your keys (whether they are set, never their values). Every problem comes with a **How to fix** line. Do what it says, then run it again until it ends with **Everything is ready**.

Not sure how to open a terminal in the kit's folder? **Windows:** open the folder in File Explorer, click the address bar, type `powershell`, press Enter. **Mac:** open Terminal, type `cd ` (with a space), drag the folder onto the window, press Enter.

## Setup

| What you see | What to do |
|---|---|
| "running scripts is disabled on this system" | Use the exact line from the README: `powershell -ExecutionPolicy Bypass -File setup\setup.ps1`. It allows the setup once, without changing your settings. |
| "was installed, but this window cannot see it yet" | Close the terminal, open a new one in the kit's folder, run the setup again. |
| `winget` not found (older Windows 10) | Install **App Installer** from the Microsoft Store, then run the setup again. |
| `npm` or `node` not found | Node.js isn't installed or the terminal is old. Run the setup again, or open a new terminal. |
| Node.js too old (the dashboard needs 22.18+) | Windows: `winget upgrade OpenJS.NodeJS.LTS`. Mac: `brew upgrade node`. Then open a new terminal. |
| Mac: `brew` not found | The setup installs Homebrew if it's missing; follow its prompts, then open a new terminal. |
| Anything else during setup | Every run writes a log to `setup/logs/` (without your keys). Ask Claude to read the newest one. |

The setup is safe to run again: it only installs what is missing.

## Brand file

| What you see | What to do |
|---|---|
| `brand/brand.yaml needs fixing` | Run `npm run brand:check`. It lists each problem in plain English. |
| A colour pair is "hard to read" | Two of your colours are too similar. Make `dark` darker or `light` lighter, or ask Claude to suggest a fix. |
| Errors after editing by hand | Usually indentation (use spaces, not tabs) or a missing quote around a hex colour (`"#E8743F"`). Or just run `/brand-intake` again. |

## Reels

| What you see | What to do |
|---|---|
| First render is slow or downloads something | Normal: the first render downloads a headless browser (about 100 MB). Later renders are faster. |
| Windows: `remotion-audio-mixing\0.wav: No such file or directory` | A temporary-folder hiccup. Run the same command again. |
| A render stops with a plan or block error | The message names the video and the field. Fix `plan.json`, or ask Claude to. |
| `npm run produce -- 2026-03` says the month doesn't exist | The folder must exist in `reels/content/` and be registered in `reels/studio-remotion/src/plan/index.ts`. Ask Claude: *"register my March plan"*. |
| HyperFrames: fonts look wrong | The first render needs internet to download your fonts. Run it again online. |
| `npm run hf:check` reports problems | Each line names the scene and the problem (safe area, contrast, timing). Ask Claude to fix them. |
| Sound effects not found | Download the pack and unzip it into `reels/sounds/viewcci/` ([sounds.md](sounds.md)). |
| B-roll search finds nothing on Pexels / Pixabay | The key is missing. Add `PEXELS_API_KEY` / `PIXABAY_API_KEY` to `.env` ([privacy.md](privacy.md#keys-only-in-env)). Wikimedia needs no key. |

## Dashboard

| What you see | What to do |
|---|---|
| The page doesn't open | Is the terminal still running `npm run dashboard`? It must stay open. Then go to http://localhost:5180. |
| "port already in use" | Another dashboard is running. Close the other terminal, or press Ctrl+C there. |
| It shows Kiln Hour posts, not mine | It shows the examples until you have your own posts in `reels/content/00_Ready/`, `01_Live/` or renders in `reels/studio-remotion/out/`. |
| Postiz says **not connected** | Add `POSTIZ_API_URL` and `POSTIZ_API_KEY` to `.env`, then stop (Ctrl+C) and start the dashboard again. |

## Website

See the table at the end of [Launching your website](sites-launch.md#something-went-wrong).

## Posting

| What you see | What to do |
|---|---|
| No **Schedule** option on TikTok | TikTok shows it for Business accounts; switch in the app (Settings and privacy → Account). |
| Instagram not in Meta Business Suite | Instagram must be a professional account linked to a Facebook Page ([posting-native.md](posting-native.md)). |
| Postiz channel shows a red marker | Reconnect it from the channel's menu in Postiz. |

## Ask Claude

Open Claude Code in the kit's folder and describe what you did and what you saw. Paste the error text (never a key). Good first message:

> *"I ran `npm run starter` and got this error: … Please run the doctor and help me fix it."*

Claude reads the logs, finds the cause and tells you, step by step, what to do.

Found a real bug? Open an issue on GitHub with the error and what you ran ([CONTRIBUTING.md](CONTRIBUTING.md)).
