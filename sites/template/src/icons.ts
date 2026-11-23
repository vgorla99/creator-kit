// Favicon and social-share image, drawn from the brand colours as SVG.
// scripts/prerender.mjs writes favicon.svg and rasterises the rest to PNG.

import { brand } from "virtual:brand";
import { home } from "./content";

const c = brand.visual.colors;
const initial = (brand.visual.wordmark?.prefix ?? brand.brand.name).trim().charAt(0).toUpperCase();
const esc = (t: string): string => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function faviconSvg(size = 64): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${c.dark}"/><text x="32" y="44" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="36" fill="${c.light}">${esc(initial)}</text><circle cx="49" cy="17" r="6" fill="${c.primary}"/></svg>`;
}

/** Splits a line into rows of at most `max` characters, on word boundaries. */
function wrap(text: string, max: number): string[] {
  const rows: string[] = [];
  for (const word of text.split(" ")) {
    const last = rows.at(-1);
    if (last !== undefined && (last + " " + word).length <= max) rows[rows.length - 1] = `${last} ${word}`;
    else rows.push(word);
  }
  return rows;
}

export function ogSvg(): string {
  const display = brand.visual.fonts?.display ?? "sans-serif";
  const rows = wrap(home.heroLine, 22).slice(0, 3);
  const lines = rows.map((row, i) => `<text x="80" y="${250 + i * 84}" font-family="${esc(display)}, sans-serif" font-weight="700" font-size="72" fill="${c.dark}">${esc(row)}</text>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${c.light}"/><circle cx="1040" cy="520" r="260" fill="${c.primary}"/><circle cx="1090" cy="140" r="90" fill="${c.secondary}"/><rect x="80" y="90" width="64" height="64" rx="14" fill="${c.dark}"/><text x="112" y="137" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="36" fill="${c.light}">${esc(initial)}</text><text x="168" y="134" font-family="${esc(display)}, sans-serif" font-weight="700" font-size="34" fill="${c.dark}">${esc(brand.brand.name)}</text>${lines}<text x="80" y="560" font-family="sans-serif" font-size="28" fill="${c.tertiary}">${esc(brand.site?.domain ?? "")}</text></svg>`;
}
