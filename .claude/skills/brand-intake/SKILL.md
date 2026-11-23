---
name: brand-intake
description: Interview the creator one question at a time and write brand/brand.yaml + brand/STYLE.md for Creator Kit, then validate with `npm run brand:check`. Use when someone types /brand-intake, says "set up my brand", "make it mine", "change my colours/handle/name", or opens the kit for the first time with the example brand (Kiln Hour) still in place.
---

# Brand intake

You are helping a non-developer make Creator Kit theirs. They can download, install and follow steps; they cannot debug YAML. Be warm, brief and concrete.

The output is two files:
- `brand/brand.yaml` — the facts. Shape and rules: `schema/brand.schema.json` (read it first; each field's `description` says what a good value looks like).
- `brand/STYLE.md` — the feel, in plain English. Use the existing example `brand/STYLE.md` as the template for its sections.

## Rules

- **One question per message.** Wait for the answer. Never send a list of questions.
- Every question gets a short example answer, so they know the size of answer you want.
- "Skip" or "not sure" is always fine for optional fields: leave the field out. Only `brand.name`, `brand.handle` and the five colours are required.
- Never ask for passwords, API keys or tokens. If they paste one, tell them it belongs in `.env` (not in brand.yaml) and do not write it anywhere.
- Free fonts only (Google Fonts). If they name a paid font, suggest the closest free one.
- If `brand/brand.yaml` already holds a brand that is not the Kiln Hour example, ask whether to start fresh or only change some fields. Changing some fields = ask only those questions.

## Questions, in order

1. **Name** — "What's your brand or channel called?" (e.g. *Kiln Hour*)
2. **Niche** — "In one line, what do you make content about?" (e.g. *hand-built pottery at home, no wheel needed*)
3. **Audience** — "Who is it for?" (e.g. *beginners with a kitchen table and one free evening a week*)
4. **Socials** — "What's your @handle, and the links to your Instagram, TikTok and YouTube? Any you don't use, just skip." Main handle → `brand.handle` (starts with `@`). Links → `socials.*` as full `https://` links; build them from the handle if they only give handles, and say so. Also ask for a website if they mention one.
5. **References** — "Name 3 to 5 accounts, videos or sites whose style you like, and for each one, what you like about it." → `references` (`url` + `why`). Max 5.
6. **Colours** — "Do you have brand colours? Give me hex codes, or send your logo or website and I'll pick them." Map to the five roles: `dark` (very dark background), `light` (very light background), `primary` (bright highlight + button), `secondary` (mid-tone accent), `tertiary` (deep saturated background). If they have fewer than five, propose the rest and show all five with their roles before moving on. If they have none, propose a palette from their niche.
7. **Fonts** — "Any fonts you love? Free Google Fonts only. Or I'll keep the kit's defaults (Space Grotesk + JetBrains Mono)." → `visual.fonts`.
8. **Voice: tone** — "Describe how you sound in a few words." (e.g. *warm, calm, a little nerdy*) → `voice.tone`
9. **Voice: do and don't** — "Two or three things you always do in your videos, and two or three you never do." → `voice.do`, `voice.dont`
10. **Voice: sample caption** — "Paste or write one caption that sounds exactly like you." → `voice.sample_caption`
11. **Pillars** — "What 2 to 5 topics do you keep coming back to?" → `content.pillars`
12. **Posting days** — "Which days do you want to post, and which city's time zone are you in?" → `content.posting_days` (`mon`…`sun`) and `posting.timezone` (e.g. `Europe/Lisbon`).
13. **Engine** — show exactly this, then ask "Which one?":
    > **Remotion**: reels are built from React code and templates in this repo; best if you want the ready-made kit, footage blocks and captions that work today.
    > **HyperFrames**: reels are built as HTML pages with animation; best if you want freer, one-off motion-graphics pieces and are happy to start from a blank starter.

    → `motion.engine` (`remotion` or `hyperframes`). If they pick HyperFrames and there is no `reels/studio-hyperframes/` folder yet, say the HyperFrames starter is still being built and the Remotion reels use their brand in the meantime. Keep `aspect: "9:16"` and `fps: 30` unless they ask otherwise.
14. **Posting** — show these three, then ask "How do you want to post?":
    > **native** (free): you post by hand in each app; the kit prepares the video and caption.
    > **postiz-self** (about €4–6 a month for a small server): your own Postiz scheduler; the kit can schedule for you.
    > **postiz-cloud** (paid app): Postiz hosted for you; same scheduling, no server to run.

    → `posting.provider`. If unsure, pick `native`; it can change later.

Optional extras, only if the conversation makes them natural: series names, hook types, end-card line and button, website domain/offer/lead magnet, motion words they love or hate.

## Write, check, read back

1. Write `brand/brand.yaml`. Keep the comment header from the example file (what the file is, `/brand-intake`, `npm run brand:check`, no keys in here), replacing the "example brand" line. Put hex colours and the handle in double quotes.
2. Write `brand/STYLE.md` with the same sections as the example (In one line · Look · Sound and voice · Motion · Content), in their words. Remove the "Example brand" note.
3. Run `npm run brand:check`.
   - If it fails, fix the file yourself, run it again, and only mention what you changed if it changes their answer (e.g. "your green was too close to your dark background, so I made it a bit lighter: #4F8A78 → #6FA08E"). Contrast failures: nudge the lighter colour lighter or the darker one darker until it passes; keep the hue.
   - Repeat until it prints ✔.
4. Read back exactly 5 lines, then stop:
   ```
   Name: <name> (<handle>)
   About: <niche> — for <audience>
   Colours: dark <hex> · light <hex> · primary <hex> · secondary <hex> · tertiary <hex>
   Voice: <tone>
   Engine: <engine> · Posting: <provider> on <days> (<timezone>)
   ```
   Then ask: "Does this look right? Say OK, or tell me what to change."
5. Wait for OK. Change anything they ask, re-run `npm run brand:check`, read the 5 lines back again.
6. After OK: tell them their reels now use this brand (Studio: `npm start`; a quick check: `npm run starter`, then open `reels/studio-remotion/out/Starter-review.png`). Don't commit or push unless they ask.
