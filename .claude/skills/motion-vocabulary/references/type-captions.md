# Type and captions

## Kinetic type

**kinetic typography**: text whose motion carries meaning and rhythm (words grow on stress, shake on anger, fly to the beat).
Rule: motion follows the voice or music; readability first.

**type on**: letters appear one by one like typing. Use: tech, terminal, messages. Add a blinking cursor (stepped). Speed 20–40 chars/s.

**lock-up**: a fixed arrangement of words, sizes and logo that moves as one unit. Animate parts in, then hold the lock-up.

**word by word**: each word appears on its own, usually synced to speech. The standard for talking reels.

**line by line**: each line enters in turn (rise or mask reveal, stagger 80–120ms). Calm, premium.

**letter stagger**: each letter animates with a small delay (20–40ms). Build: split into spans (SplitText or manual split), stagger.

**scramble/decode**: random characters cycle and resolve into the real text. Tech, hacker, reveal. Use seeded random per frame.

**split text**: a word or line splits apart (top and bottom halves slide opposite ways) to reveal something between.

**text mask reveal**: text rises from behind an invisible line (see mask reveal). The default premium text entrance.

**text on path**: text flows along a curve or shape. Build: SVG `<textPath>` with animated `startOffset`.

**stretch type**: letters stretch on one axis to fill space or show speed. Build: scaleX or scaleY, or a variable font width axis.

**variable font animation**: animate weight, width or slant of a variable font. Smooth emphasis without swapping fonts. Build: `font-variation-settings`.

**outline to fill**: text starts as an outline, then fills. Build: stroke draw-on, then fill opacity.

**highlight sweep**: a colour bar sweeps behind words like a marker. Use: emphasis in explainers. Build: scaleX 0 → 1 from left on a block behind the text.

**underline draw**: an underline draws under a key word. Build: scaleX from left or stroke draw-on.

**number roll**: a counter animates from 0 to the value (stats, prices). Use ease-out so it slows near the final number; round to the right unit.

**slot-machine roll**: each digit rolls vertically like a slot machine. Build: a column of digits in a masked box, translateY per digit.

**lower third**: name and title bar in the lower third of the frame. Enter 12–18f, hold 3–5s, exit faster.

**title card / end card**: full-screen text at the start or end (title, CTA, handle, logo).

**supers**: text superimposed on footage (claims, locations, labels).

**callout**: line or arrow pointing to a detail, with a label. Build: stroke draw-on for the line, then the label pops in.

## Captions

**burned-in captions**: captions rendered into the video pixels (open captions). Required for social; most people watch muted.

**word-by-word highlight**: the full line is visible; the spoken word changes colour or scale as it's said. The current reels standard.
Build: transcript word timings (Whisper `word_timestamps`) → style the active word per frame.

**karaoke captions**: colour fills through each word gradually as it's spoken. Build: per-word gradient or clip that fills over the word's duration.

**pop-on captions**: each caption chunk (1–4 words) pops in as a block when it starts. Punchy, high-energy reels.

**roll-up captions**: lines roll upward as new lines arrive (TV live captions). Use: long speech, interviews.

**emphasis words**: key words get a different colour, size, weight or an emoji/icon. Max 1–2 per sentence or nothing stands out.

**safe zone**: keep captions and key text inside the area that platform UI does not cover.
9:16 reels: keep clear of the top ~14% and bottom ~20%, and the right ~12% (buttons). Captions centre to lower-middle.

**read time**: minimum time text stays on screen. Rule: 0.3s per word + 0.5s, minimum 1s. A caption chunk lasts at least 0.7s.

**caption chunking**: split lines at natural phrase breaks, max ~32 characters per line for 9:16, max 2 lines.

## Typography basics

**kerning**: space between two specific letters. Fix it on big titles and logos.
**tracking**: overall letter spacing. Wide tracking = elegant or calm; tight = punchy. Animating tracking open is a classic title move.
**leading**: line spacing. Tighter for big titles (0.9–1.05), looser for body (1.3–1.5).
**type hierarchy**: size, weight and colour show what to read first. One hero size, one support size, one small label size.
