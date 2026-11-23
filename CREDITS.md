# Credits

Creator Kit's own code, docs and skills are [MIT](LICENSE). Everything below belongs to its authors and keeps its own licence. **None of it is copied into this repository:** setup downloads each skill from its own repository at the pinned commit (see [`setup/skills.lock.yaml`](setup/skills.lock.yaml)) into `.claude/skills/`, which git ignores.

## Skills installed by setup

| Skill | Repository | Licence | Pinned commit | Installed for |
|---|---|---|---|---|
| virality | [Ootto-AI/claude-content-skills](https://github.com/Ootto-AI/claude-content-skills) (`skills/virality`) | MIT | `691875ac3eafaf84ec0bdb0283728c85d2cb3413` | reels · patched, see below |
| ab-hook-tester | [Ootto-AI/claude-content-skills](https://github.com/Ootto-AI/claude-content-skills) (`skills/ab-hook-tester`) | MIT | `691875ac3eafaf84ec0bdb0283728c85d2cb3413` | reels |
| humanizer | [blader/humanizer](https://github.com/blader/humanizer) | MIT | `a32f24407364c74c812b43c15926d638bee1e072` | reels, sites |
| watch | [bradautomates/claude-video](https://github.com/bradautomates/claude-video) (`skills/watch`) | MIT | `03ceb42f7fa2c4439aca01752118044baabffb8f` | reels |
| video-shotcraft | [Vincentwei1021/video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) | Apache-2.0 | `59f3e9b9e936ff2bce0e18446226d770a3f2f61f` | reels (Remotion) |
| remotion-best-practices | [vercel-labs/json-render](https://github.com/vercel-labs/json-render) (`skills/remotion-best-practices`) | Apache-2.0 | `c926907855d95dde328264350ac5464b60be201d` | reels (Remotion) |
| motionmaxxing | [Tejashmakwana/motionmaxxing](https://github.com/Tejashmakwana/motionmaxxing) | Apache-2.0 | `8c8ec0f2a6f6c9a0da15cd24f7b1298ab298368c` | reels (HyperFrames) |
| hyperframes, hyperframes-cli, hyperframes-registry, media-use | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) (`skills/…`) | Apache-2.0 | `8c31cb3f400b20710ff76fda53354d7abfd6faca` | reels (HyperFrames) |
| anatomy | [wheresryan22/anatomy](https://github.com/wheresryan22/anatomy) | MIT | `1482e8469b0a9e0d8cc18ea2740a01423d29ae80` | reels, optional |
| review-responder, complaint-de-escalation | [Ootto-AI/claude-support-skills](https://github.com/Ootto-AI/claude-support-skills) (`skills/…`) | MIT | `0b45fdcd8674d10a0c4ee74ababc9f17de0a1325` | optional |
| impeccable | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (`.claude/skills/impeccable`) | Apache-2.0 | `b49177d32788f2dc585c42831d845dacf1ebed2c` | sites |
| ui-ux-pro-max | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (`.claude/skills/ui-ux-pro-max`) | MIT | `281e4537afb11333ac9947783779aaf314ebfbf2` | sites |
| modern-web-guidance | [GoogleChrome/modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance) (`skills/modern-web-guidance`) | Apache-2.0 | `64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65` | sites |
| seo | [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) (`skills/seo`) | MIT | `4adeee6732a12d1540f49a4d50a38ce8c97f9a53` | sites |
| web-design-guidelines | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) (`skills/web-design-guidelines`) | MIT (stated in the README; no LICENSE file) | `5a37a6329fbad3666c3207392a6a7c0110e92efb` | sites, optional |

### Patches

| Patch | Skill | What it changes |
|---|---|---|
| [`setup/patches/virality-no-ads.patch`](setup/patches/virality-no-ads.patch) | virality | Removes the "Fill the boxes" section about selling ads and the two lines that point to it. The upstream licence and the "Made by Ootto" credit stay. |

## Claude Code plugins (added by setup with `claude plugin install --scope local`)

| Plugin | Source | Licence |
|---|---|---|
| superpowers | [obra/superpowers](https://github.com/obra/superpowers), via `claude-plugins-official` | MIT |
| frontend-design (sites) | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) (`plugins/frontend-design`) | Apache-2.0 |

## Programs setup installs if missing (winget on Windows, Homebrew on macOS)

| Program | Licence |
|---|---|
| [Node.js](https://nodejs.org) | MIT |
| [Python](https://www.python.org) | PSF License |
| [uv](https://github.com/astral-sh/uv) | MIT or Apache-2.0 |
| [FFmpeg](https://ffmpeg.org) (Windows build by [gyan.dev](https://www.gyan.dev/ffmpeg/builds/)) | GPL / LGPL |
| [Git](https://git-scm.com) | GPL-2.0 |
| [GitHub CLI](https://github.com/cli/cli) | MIT |
| [Homebrew](https://brew.sh) (macOS, only if missing) | BSD-2-Clause |

## Libraries and services the kit uses

| What | Licence / terms |
|---|---|
| [Remotion](https://www.remotion.dev) (npm dependency of the reel studio) | [Remotion License](https://www.remotion.dev/license): free for individuals and companies of up to 3 people |
| [HyperFrames](https://github.com/heygen-com/hyperframes) CLI (npm dependency of the HyperFrames studio, pinned `0.9.84`; the kit's commands turn its anonymous telemetry off) | Apache-2.0 |
| [GSAP](https://gsap.com) (loaded by the HyperFrames starter from jsDelivr, `3.15.0`) | [GSAP standard license](https://gsap.com/standard-license/): free, including commercial use |
| Dashboard: [Hono](https://hono.dev), [React](https://react.dev), [Vite](https://vite.dev), [Tailwind CSS](https://tailwindcss.com), [yaml](https://eemeli.org/yaml/) (npm dependencies of `reels/dashboard`) | MIT, ISC (yaml) |
| [Postiz](https://github.com/gitroomhq/postiz-app) and its CLI | AGPL-3.0. Only documented and run by you; never bundled |
| Fonts (Space Grotesk, Inter, JetBrains Mono and others via Fontsource / Google Fonts) | SIL Open Font License |
| Stock footage searched by `broll-scout`: [Wikimedia Commons](https://commons.wikimedia.org), [Pexels](https://www.pexels.com/license/), [Pixabay](https://pixabay.com/service/license-summary/) | Each clip keeps its own licence; `broll-scout` logs source, author and licence per clip in `reels/studio-remotion/assets/manifest.json`, and `npm run library -- credits` prints the credit lines |

## Designs and ideas we build on

| What | Credit |
|---|---|
| **Style Lab** (the dashboard's Style tab and the `reels/style/` round format) | Based on the Style Lab template by Shaan Johari ([@viashaan](https://instagram.com/viashaan)), reused with permission and credit. |

## Not included, and why

| Skill | Reason |
|---|---|
| story-audit ([Ootto-AI/claude-story-audit](https://github.com/Ootto-AI/claude-story-audit)) | The repository has no licence, so it cannot be installed by default. `content-calendar-from-analytics` (our own) covers analytics-based planning. |
| remotion-captions ([remotion-dev/skills](https://github.com/remotion-dev/skills)) | The repository declares no licence. The Remotion studio has its own caption layer. |
| embedded-captions, music-to-video, talking-head-recut | Removed from the HyperFrames repository; captions are now part of its `hyperframes` skill. |
| get-brolls | Needs a licence from its author. Our own `broll-scout` skill replaces it. |
