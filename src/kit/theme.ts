// ReelsMaker motion system — shared by every reel. The palette comes from
// brand/brand.yaml via src/brand.ts (five roles), contrast-checked at load time.

import { BRAND } from "../brand";
import { contrast } from "../../schema/validate-brand.mjs";

export { BRAND };

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const MAX_FRAMES = 60 * FPS; // Instagram Reels ceiling

export const C = BRAND.colors;

// Contrast maths + the legibility checks live in schema/validate-brand.mjs,
// shared with `npm run brand:check`; src/brand.ts already ran them.
export { contrast };

// Ink for text/shapes sitting on `stage`: whichever of dark/light reads better.
export const inkOn = (stage: string) => (contrast(stage, C.dark) >= contrast(stage, C.light) ? C.dark : C.light);
export const isLight = (stage: string) => inkOn(stage) === C.dark;

// An accent that stays visible on `stage` (for small marks and highlights).
export function accentOn(stage: string): string {
  return [C.secondary, C.primary].find((c) => c !== stage && contrast(c, stage) >= 3) ?? inkOn(stage);
}

export const FONT = {
  display: "'Space Grotesk'", // 500 / 700 — headlines, numbers
  mono: "'JetBrains Mono'", // 500 / 700 — captions, labels (the "annotation" voice)
} as const;

export const MARGIN = 90;
