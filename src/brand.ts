// ─────────────────────────────────────────────────────────────
//  Don't edit this file to rebrand: edit brand/brand.yaml (or run
//  /brand-intake in Claude Code). This file reads that yaml when Studio
//  or a render starts, checks it against schema/brand.schema.json and the
//  colour-contrast rules, and stops with a plain-English list of fixes if
//  anything is wrong. Same checks as `npm run brand:check`.
// ─────────────────────────────────────────────────────────────

import raw from "../brand/brand.yaml";
import schema from "../schema/brand.schema.json";
import { checkBrand, type BrandFile, type ColorRole, type Hex } from "../schema/validate-brand.mjs";

export interface Brand {
  name: string; // bottom-right on every frame
  handle: string; // bottom-left on every frame + CTA button
  mark: { prefix: string; suffix: string }; // top-left wordmark; suffix is accented
  colors: Record<ColorRole, Hex>; // dark · light · primary · secondary · tertiary
  music: string | null; // e.g. "audio/bed.mp3" under public/ — only tracks you're licensed for
}

const result = checkBrand(raw, schema);
if (!result.ok) {
  throw new Error(`brand/brand.yaml needs fixing:\n- ${result.errors.join("\n- ")}\n(Run \`npm run brand:check\` for the same list.)`);
}

/** Text logo: visual.wordmark if set, else the name split into bold first words + light last word. */
function wordmark(file: BrandFile): Brand["mark"] {
  if (file.visual.wordmark) return { prefix: file.visual.wordmark.prefix, suffix: file.visual.wordmark.suffix ?? "" };
  const words = file.brand.name.toUpperCase().split(/\s+/);
  return words.length > 1 ? { prefix: words.slice(0, -1).join(" "), suffix: words[words.length - 1] } : { prefix: words[0], suffix: "" };
}

export const BRAND: Brand = {
  name: result.brand.brand.name,
  handle: result.brand.brand.handle,
  mark: wordmark(result.brand),
  colors: result.brand.visual.colors,
  music: result.brand.motion?.music ?? null,
};

/** The whole validated brand.yaml, for code that needs more than the reel basics. */
export const BRAND_FILE: BrandFile = result.brand;
