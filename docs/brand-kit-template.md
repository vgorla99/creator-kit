# Brand kit template

> Part of [Creator Kit](../README.md). Fill this in before you run `/brand-intake`, and the interview takes five minutes. Copy it into a note, answer what you can, skip what you don't know: Claude proposes the rest.

The answers end up in two files: [`brand/brand.yaml`](../brand/brand.yaml) (the facts the kit reads) and [`brand/STYLE.md`](../brand/STYLE.md) (the feel, in words). Each answer below shows where it goes. The examples are from the invented brand Kiln Hour.

## 1. Who you are

| Question | Your answer | Example | Goes to |
|---|---|---|---|
| Brand or channel name | | Kiln Hour | `brand.name` |
| Main @handle | | @kilnhour | `brand.handle` |
| What you make content about, in one line | | hand-built pottery at home, no wheel needed | `brand.niche` |
| Who it is for | | beginners with a kitchen table and one free evening a week | `brand.audience` |
| Language | | en | `brand.language` |
| City, and its time zone | | Lisbon · Europe/Lisbon | `brand.location`, `posting.timezone` |
| Links: Instagram, TikTok, YouTube, website | | https://instagram.com/kilnhour … | `socials` |

## 2. What you like

3 to 5 accounts, videos or sites whose style you like, and **why** (the why matters more than the link).

| Link | What you like about it |
|---|---|
| | *slow, close-up hand shots with no music, only the sound of the clay* |
| | |
| | |

Goes to `references`.

## 3. How it looks

**Colours.** Five roles. Give hex codes (like `#E8743F`), or send your logo or website and Claude picks them.

| Role | Used for | Your colour | Example |
|---|---|---|---|
| dark | very dark background, text on light | | `#1B1714` warm charcoal |
| light | very light background, text on dark | | `#F6EFE6` clay cream |
| primary | the bright highlight and buttons | | `#E8743F` terracotta |
| secondary | a mid-tone second accent | | `#5E8F7E` celadon |
| tertiary | a deep, saturated background | | `#3B2850` plum |

`npm run brand:check` makes sure the pairs are readable together.

**Fonts.** Free Google Fonts only. Display (headlines), body (text), mono (small labels). Example: Space Grotesk / Inter / JetBrains Mono. Not sure? Keep the defaults.

**End card.** The last line and button of every reel. Example: *New clay night every Thursday* · *Follow for more*. Goes to `visual.end_card`.

## 4. How you sound

| Question | Your answer | Example |
|---|---|---|
| Your tone, in a few words | | warm, calm, a little nerdy about clay |
| 2 or 3 things you always do | | show the messy middle; one tip per video; say when something failed |
| 2 or 3 things you never do | | no "you're doing it wrong" hooks; no gear-shaming |
| One caption that sounds exactly like you | | "Cracked at the handle again. Turns out the fix is slip, patience and a damp towel overnight." |
| How you ask for the follow or save | | soft: save it for your next clay night |

Goes to `voice`.

## 5. What you post

| Question | Your answer | Example |
|---|---|---|
| 2 to 5 topics you keep coming back to | | beginner techniques; fixing cracks; glazing without a kiln |
| Recurring series (optional) | | Clay night in 60 seconds; Why did this crack? |
| Hook types you use (optional, see [playbook.md](playbook.md)) | | mistake; before/after; one-tool challenge |
| Days you want to post | | tue, thu, sun |
| Test two hooks with trial reels? | yes / no | yes |

Goes to `content`.

## 6. Motion and sound

| Question | Your answer | Example |
|---|---|---|
| Moves you love | | spring pop, slow push-in, wipe reveal |
| Moves you never want | | glitch, rgb split, whoosh on every cut |
| Background music? (only tracks you may use) | | none |

Goes to `motion.locked_terms`, `motion.rejected_terms`, `motion.music`. Not sure yet? Leave it empty and do a [Style Lab](style-lab.md) round.

## 7. Engine and posting

- **Engine:** Remotion (monthly plans, footage, consistent series) or HyperFrames (one-off motion pieces, HTML). See [engines.md](engines.md). → `motion.engine`
- **Posting:** native apps (free), Postiz on your own server, or Postiz Cloud. See [posting-native.md](posting-native.md). → `posting.provider`

## 8. Website (only if you want one)

| Question | Your answer | Example |
|---|---|---|
| Domain (no https) | | kilnhour.example |
| Pages | | home, about, workshops, free guide |
| What you sell or offer | | small online hand-building workshops, 6 people per group |
| Free thing for an email address | | free PDF: the 10 tools you already have in your kitchen |

Goes to `site`. More in [sites-launch.md](sites-launch.md).

## Never in the brand file

Passwords, API keys, tokens. Those go in `.env` ([privacy.md](privacy.md)).
