// Spoken captions: each VO line is split into 1–3 word chunks shown in the
// safe band; the word being spoken pops in the accent colour. Word timing is estimated
// from the line's length in the VO cut (free — no transcript): every word
// gets time in proportion to its letters, plus a pause after punctuation.
// The headline counts as caption: a sentence the on-screen headline (or the
// CTA button) already says is not repeated underneath.

import React from "react";
import { ease, mix, prog, springIn } from "../kit/anim";
import type { VoLine } from "../kit/audio";
import { BRAND_FILE } from "../brand";
import { C, FONT } from "../kit/theme";
import { CAPTION_W, CAPTION_Y } from "./layout";

const MAX_WORDS = 3;
const MAX_CHARS = 20; // still ~74 px at full length; lower leaves one-word orphans
const ORPHAN_MAX = 24; // a lone word may join its neighbour up to this length (the font shrinks to fit)
const SIZE = 76;
const LEAD_IN = 3; // a chunk shows this many frames before its first word
const HOLD = 10; // the last chunk of a line stays this long after the line ends
const EM = 0.56; // display face, bold, mixed case: average advance per character (estimated)

interface Word {
  text: string;
  at: number;
  end: number;
}
export interface Chunk {
  words: readonly Word[];
  from: number;
  to: number;
}

const weight = (w: string) => w.replace(/[^\p{L}\p{N}]/gu, "").length + 2 + (/[.!?]$/.test(w) ? 5 : /[,:;]$/.test(w) ? 3 : 0);

function wordsOf(text: string, line: VoLine): Word[] {
  const ws = text.split(/\s+/).filter(Boolean);
  const total = ws.reduce((sum, w) => sum + weight(w), 0);
  const span = Math.max(1, line.to - line.from - 2);
  let t = line.at + 2; // vo.mjs keeps 2 frames of pre-roll before the first sound
  return ws.map((w) => {
    const d = (span * weight(w)) / total;
    const word = { text: w, at: t, end: t + d };
    t += d;
    return word;
  });
}

function chunksOf(words: readonly Word[]): Word[][] {
  const out: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    const chars = cur.reduce((n, x) => n + x.text.length + 1, 0) + w.text.length;
    if (cur.length && (cur.length >= MAX_WORDS || chars > MAX_CHARS)) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
    if (/[.!?:]$/.test(w.text) || (/,$/.test(w.text) && cur.length >= 2)) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  // A lone word reads as a glitch: fold it into a neighbour when the pair still fits.
  const len = (ws: readonly Word[]) => ws.reduce((n, w) => n + w.text.length + 1, -1);
  const merged: Word[][] = [];
  for (const g of out) {
    const prev = merged[merged.length - 1];
    if (prev && (g.length === 1 || prev.length === 1) && len(prev) + 1 + len(g) <= ORPHAN_MAX) merged[merged.length - 1] = [...prev, ...g];
    else merged.push(g);
  }
  return merged;
}

// Number words match the digits a headline uses ("Eight steps" = "8 STEPS").
// One table per language; brand.language picks it (English when unset).
// Add a language by adding a table and a line in langOf().
const NUMBERS = {
  en: {
    zero: "0", one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10",
    eleven: "11", twelve: "12", fifteen: "15", twenty: "20", thirty: "30", forty: "40", fifty: "50", ninety: "90", hundred: "100",
  },
  de: {
    null: "0", ein: "1", eine: "1", eins: "1", einem: "1", zwei: "2", drei: "3", vier: "4", fünf: "5", sechs: "6", sieben: "7",
    acht: "8", neun: "9", zehn: "10", elf: "11", zwölf: "12", zwanzig: "20", dreißig: "30", fünfzig: "50", neunzig: "90", hundert: "100",
  },
} as const satisfies Record<string, Readonly<Record<string, string>>>;
export type CaptionLang = keyof typeof NUMBERS;
/** "en", "en-GB", undefined -> "en"; "de", "de-AT" -> "de". */
export const langOf = (tag: string | undefined): CaptionLang => (tag?.toLowerCase().startsWith("de") ? "de" : "en");
const BRAND_LANG = langOf(BRAND_FILE.brand.language);

const COVERED = 0.6; // share of a sentence's words already on screen that makes it skip
const norm = (w: string, lang: CaptionLang) => {
  const t = w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const table: Readonly<Record<string, string>> = NUMBERS[lang];
  return table[t] ?? t;
};
// Same word, or the same stem (plan / plans, schedule / scheduled).
const onScreen = (t: string, head: readonly string[]) => head.some((h) => h === t || (Math.min(h.length, t.length) >= 5 && (h.startsWith(t) || t.startsWith(h))));

function notOnScreen(words: readonly Word[], head: string, lang: CaptionLang): Word[] {
  const heads = head.split(/\s+/).map((w) => norm(w, lang)).filter(Boolean);
  const out: Word[] = [];
  let sentence: Word[] = [];
  const flush = () => {
    // Short filler words (is, and, the, in…) don't decide; number words (-> digits) do.
    const toks = sentence.map((w) => norm(w.text, lang)).filter((t) => t.length > 3 || /^\d+$/.test(t));
    const hit = toks.filter((t) => onScreen(t, heads)).length;
    // Skip what the screen already says, and filler-only scraps ("Und:") left between skipped sentences.
    if (toks.length > 0 && hit / toks.length < COVERED) out.push(...sentence);
    sentence = [];
  };
  for (const w of words) {
    sentence.push(w);
    if (/[.!?:]$/.test(w.text)) flush();
  }
  flush();
  return out;
}

export interface CaptionLine {
  text: string; // what the VO says
  head: string; // what the screen already says meanwhile (headline / CTA button)
}

// Placed VO lines (frames on the reel's timeline) + the spoken text of each.
// `lang` defaults to brand.language; the caption check passes it explicitly.
export function captionChunks(lines: readonly VoLine[], captions: readonly CaptionLine[], lang: CaptionLang = BRAND_LANG): Chunk[] {
  return lines.flatMap((line, i) => {
    const c = captions[i] ?? { text: "", head: "" };
    const groups = chunksOf(notOnScreen(wordsOf(c.text, line), c.head, lang));
    return groups.map((words, k) => ({
      words,
      from: Math.floor(words[0].at) - LEAD_IN,
      to: k + 1 < groups.length ? Math.floor(groups[k + 1][0].at) - LEAD_IN : Math.ceil(words[words.length - 1].end) + HOLD,
    }));
  });
}

const OUTLINE = [
  [3, 0],
  [-3, 0],
  [0, 3],
  [0, -3],
  [2, 2],
  [-2, 2],
  [2, -2],
  [-2, -2],
]
  .map(([x, y]) => `${x}px ${y}px 0 ${C.dark}`)
  .concat(`0 8px 24px ${C.dark}CC`)
  .join(", ");

export const Captions: React.FC<{ f: number; chunks: readonly Chunk[] }> = ({ f, chunks }) => {
  const c = chunks.find((x) => f >= x.from && f < x.to);
  if (!c) return null;
  const chars = c.words.reduce((n, w) => n + w.text.length + 0.7, 0); // + the word margins
  const size = Math.min(SIZE, Math.floor(CAPTION_W / (chars * EM)));
  const pin = springIn(f, c.from);
  const last = c.words[c.words.length - 1];
  return (
    <div
      style={{
        position: "absolute",
        top: CAPTION_Y,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        whiteSpace: "nowrap",
        fontFamily: FONT.display,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.1,
        letterSpacing: "-0.01em",
        textShadow: OUTLINE,
        opacity: Math.min(1, pin * 2),
        transform: `translateY(${(1 - pin) * 24}px) scale(${0.86 + 0.14 * pin})`,
      }}
    >
      {c.words.map((w) => {
        // The spoken word pops up in the accent colour; the chunk's last word keeps it until the chunk leaves.
        const end = w === last ? c.to : w.end;
        const on = f >= w.at && f < end ? springIn(f, Math.floor(w.at), true) : f >= end ? 1 - prog(f, end, end + 6, ease.outCubic) : 0;
        const k = Math.max(0, Math.min(1, on));
        return (
          <span
            key={`${w.text}-${w.at}`}
            // Side margins wider than the pop's growth (8% of a long word), so a popped word never touches its neighbour.
            style={{ display: "inline-block", margin: "0 0.19em", color: mix(C.light, C.primary, k), transform: `translateY(${-10 * on}px) scale(${1 + 0.08 * on})` }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
