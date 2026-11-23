---
name: broll-scout
description: Find free B-roll for a reel beat in Creator Kit — the creator's own footage first, then Wikimedia Commons (no key), Pexels and Pixabay — show a preview sheet, wait for the creator to pick, then add only the picked clips to the asset library with source, author and licence logged. Use when someone types /broll-scout, asks for B-roll, stock footage, cutaways, "a clip of X for this beat", or a plan beat has a `shot.pexels` search phrase but no `shot.asset`.
---

# B-roll scout

You help a non-developer find short supporting clips (B-roll) for a reel. They pick; you search, preview, download and keep the paperwork. Be brief and concrete. Run every command from the Creator Kit folder.

## The one rule

**Nothing goes into a reel until the creator has seen the preview sheet and named the clips they want.** Never run `get` on clips they did not pick, and never put a clip in `reels/content/**/plan.json` before it is in the library.

## 1. Pin down the beat

Get, in one short exchange if it is not already clear:
- what the viewer should see (e.g. *hands shaping wet clay, close up*),
- roughly how long (most beats are 2–5 s),
- video or still (stills suit history, places, objects).

Turn it into 2–4 search phrases of 2–3 plain English words each (*clay hands*, *pottery wheel close*). Concrete nouns beat moods.

## 2. Their own footage first

1. Clips already in the library: `npm run library -- list` (and `npm run library -- sheet --tag <tag>` to see them).
2. A folder of their own footage, if they have one: `npm run library -- scan "<folder>" --match "<word>"` makes a contact sheet without adding anything. If they like one, add it: `npm run library -- add "<file>" --source own-real --tags <a,b>` (`own-ai` for AI-made clips; these turn on the AI label at posting time).

Their own footage always wins over stock: it is theirs, needs no credit and looks like them.

## 3. Free sources

```
npm run broll -- search "<phrase>"                     all sources that are ready
npm run broll -- search "<phrase>" --from wikimedia    one source (pexels, pixabay, wikimedia)
npm run broll -- search "<phrase>" --kind image --from wikimedia    stills
```
Useful options: `--n 8` results per source, `--min 3` shortest clip in seconds, `--page 2` for more.

- **Wikimedia Commons** needs no key: real places, events, history, science, nature. Mostly landscape; some need a credit line.
- **Pexels** (portrait clips, lifestyle) and **Pixabay** (all orientations) need free keys `PEXELS_API_KEY` / `PIXABAY_API_KEY` in `.env`. Without a key the command skips that source and says how to get one. Pass that on in plain words; never ask them to paste a key into the chat.

Each search writes two files in `reels/studio-remotion/out/_sheets/`:
- `broll-<phrase>.jpg`: the contact sheet, three frames per clip, labelled `source:id`, size, length, licence and author;
- `broll-<phrase>.json`: every candidate with its page URL, author, licence and credit line.

## 4. Show, then wait

Open the sheet image and show it. Give at most 5 picks of your own in one line each: `source:id`, why it fits, and any of these flags:
- **credit required** (CC BY / CC BY-SA): a credit line must go in the caption;
- **! restriction** (personality rights, trademark): avoid unless the creator accepts the risk;
- **landscape**: will be cropped to 9:16, so check the subject sits in the middle third;
- a person's face in frame: stock people may only appear as "people", never as if they use or recommend the creator's product.

Then ask which ones they want. Wait for the answer.

## 5. Add the picks

```
npm run broll -- get wikimedia:12345 pexels:678 --tags clay,hands
```
This downloads the full clip (Pexels: portrait mp4 near 1080 wide; Pixabay: the largest mp4; Wikimedia: the best web transcode up to 1080p, or a 1920-wide still) into `reels/studio-remotion/public/library/<source>/` (not committed) and records it in `reels/studio-remotion/assets/manifest.json`: `url` (source page), `author`, `license`, `licenseUrl`, `attributionRequired`, `credit`, `restrictions`, `issues`. That manifest entry is the licence log; do not hand-edit it.

If `issues` says *low resolution*, tell them it may look soft full-screen and offer to look for another.

Put the clip in the plan beat: `"shot": { "asset": "<library id>" }` (optional `trim`, `zoom`, `pan`).

## 6. Credits

`npm run library -- credits` prints the credit lines. Lines under **Credit REQUIRED** must go in the post caption or description when that clip is used (`npm run produce` also adds them to the post text). Pexels, Pixabay, CC0 and public-domain clips need no credit; adding it is a kind gesture.

## Licence cheat sheet (what you tell the creator)

| Source | Credit | Watch out for |
|---|---|---|
| Own footage | none | people in it agreed to be filmed |
| Pexels | not required | no implied endorsement by people or brands in the clip; don't resell unchanged |
| Pixabay | not required | no recognisable logos or brands in commercial posts; nothing offensive with recognisable people |
| Wikimedia CC0 / public domain | not required | other rights (faces, logos) can still apply |
| Wikimedia CC BY / CC BY-SA | **required**: title, author, licence + link, source, "edited" | CC BY-SA: the credit must name the licence; avoid if they plan to sell the video itself |

Source pages are the final word: Pexels licence `pexels.com/license`, Pixabay `pixabay.com/service/license-summary`, Wikimedia each file's own page. If a file page and the log disagree, trust the page and tell the creator.

## Don't

- Don't use YouTube, TikTok, Instagram or random websites: no licence to reuse.
- Don't download clips nobody picked, and don't run dozens of searches in a loop (each source has rate limits).
- Don't put API keys anywhere except `.env`.
