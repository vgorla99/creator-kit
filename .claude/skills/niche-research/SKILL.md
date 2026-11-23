---
name: niche-research
description: Research a creator's niche before building their website or planning content. Finds competitors' sites and offers, the long questions people type (8+ words), keywords, gaps that AI answers and search results handle badly, and 3 to 5 references, then writes sites/research/NICHE.md. Use when someone types /niche-research, says "research my niche", "who are my competitors", "what should my site be about", or before /site-builder when sites/research/NICHE.md does not exist yet.
---

# Niche research

You are helping a non-developer understand their niche well enough to build a website that gets found and to plan content that answers what people actually ask. Be concrete, cite every source, and never invent numbers.

**Input:** `brand/brand.yaml` (read `brand.niche`, `brand.audience`, `brand.location`, `brand.language`, `site.offer`, `site.lead_magnet`, `references`). If `brand.niche` is missing, ask for it first, in one line, with an example (*hand-built pottery at home, no wheel needed*), or suggest `/brand-intake`.

**Output:** `sites/research/NICHE.md` (git-ignored: it stays on this computer). Raw notes may go in `sites/research/notes/`.

## Rules

- **Only use what you can open.** Every competitor, question and claim gets a source link. If a page will not load, say so; do not guess what it says.
- **No made-up metrics.** You cannot see search volumes. Say "often asked" when you saw a question in several places, never "1,200 searches a month". If the creator has a keyword tool, ask them to paste numbers in.
- **Their language and market.** Search in `brand.language` and, when it matters, their country (from `brand.location`).
- **Do not copy.** Note what competitors do and why it works; never paste their copy, images or prices into the creator's site.
- **Stop and check in** after step 2 with a five-line summary, and ask whether the direction is right before going deeper.

## Steps

1. **Frame it** (no searching yet). Write down, in one line each: who the audience is, what they want to achieve, what they are afraid of or stuck on, and what the creator sells (`site.offer`). Show this to the creator and ask: "Is this right?"

2. **Competitors (5 to 8).** Search for the offer the way a customer would ("online pottery class for beginners", "learn pottery at home"). Include:
   - 3 to 5 sites that sell something close to `site.offer`;
   - 1 or 2 big content sites that rank for the niche (blogs, magazines, forums);
   - accounts in `references` that have a website.
   For each: URL, what they sell and the price range if public, their main promise (headline), their lead magnet, what their site does well, what it does badly (slow, vague, no answers, no proof). Then send the five-line check-in.

3. **Long questions (15 to 30).** Collect real questions of **8 or more words**, the way people type them. Sources: Google's "People also ask" and autocomplete, Reddit and forum threads, YouTube comments under popular niche videos, Quora, and questions in the creator's own comments or DMs (ask them for a few). Keep the exact wording. Group them by theme. Mark questions you saw in 3+ places as **often asked**.

4. **Answer gaps.** For the 10 strongest questions, ask an AI assistant or look at search results and note: is there a clear, complete answer in the first result? Is it current? Is it written for a beginner? A gap is a question where the best available answer is vague, outdated, buried, or written for experts. These become article ideas: each one is a page whose H1 is the question and whose first paragraph fully answers it.

5. **Keywords.** List 10 to 20 short phrases (2 to 4 words) customers use for the offer and the topic, grouped as: *buying* (ready to pay: "pottery workshop online"), *learning* (want to know how: "how to fix cracked clay"), *local* (if `brand.location` matters: "pottery class Lisbon"). No volumes unless the creator gives them.

6. **Positioning.** From all of the above, write: the one promise competitors are not making (or making badly), three proof points the creator can honestly show, and the lead magnet angle that fits the gaps.

7. **Write `sites/research/NICHE.md`** in the format below, then read back the positioning and the top 5 article ideas, and ask: "Shall I use this to plan your site?" On yes, suggest `/site-builder`.

## NICHE.md format

```markdown
# Niche research: <brand.name>
Date: <YYYY-MM-DD> · Language/market: <language, country>

## Audience in one paragraph
## Competitors
| Site | Sells | Promise | Lead magnet | Strong | Weak |
## Long questions (8+ words)
### <theme>
- <exact question> (often asked) — <source links>
## Answer gaps → article ideas
1. <question as H1> — gap: <why current answers fall short> — sources
## Keywords
- Buying: ...
- Learning: ...
- Local: ...
## Positioning
- Promise nobody else makes well:
- Proof we can show:
- Lead magnet angle:
## Sources
```

## Monthly refresh

Once the site is live and Search Console has data (see `docs/sites-launch.md`), the `site-builder` monthly loop replaces guesswork: real queries beat research. Re-run this skill only when the offer or audience changes.
