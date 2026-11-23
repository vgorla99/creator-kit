// Reads brand/brand.yaml (repo root), checks it with the same validator as
// `npm run brand:check`, downloads the brand fonts once, and writes two files
// the film loads:
//   film/brand.css  colours, fonts and safe zone as CSS variables
//   film/brand.js   names and words (window.BRAND) for the scenes
// Both are generated: edit brand.yaml, not them. Runs before preview/check/render.

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const STUDIO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = resolve(STUDIO, "../..");
const FILM = join(STUDIO, "film");
const BRAND_FILE = resolve(REPO, process.env.BRAND_FILE ?? "brand/brand.yaml");

// The app buttons, caption and handle cover these edges (px on a 1080×1920 canvas).
// Default = the band TikTok, Instagram Reels and YouTube Shorts all leave clear
// (the one `hyperframes check` tests); TikTok's action rail sets the right edge.
const SAFE_ZONE = { top: 288, bottom: 672, left: 120, right: 300 };
const FONT_WEIGHTS = { display: "500;700", body: "400;600", mono: "400;500" };
const FALLBACK = {
  display: "ui-sans-serif, system-ui, sans-serif",
  body: "ui-sans-serif, system-ui, sans-serif",
  mono: "ui-monospace, Menlo, monospace",
};
// A modern browser user agent makes Google Fonts return woff2 files.
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

async function loadBrand() {
  // ponytail: the validator imports `ajv` and `yaml` by bare name, which Node
  // resolves next to the file. A copy under node_modules finds this studio's
  // copies (same trick as sites/template/vite/brand.ts).
  const cache = join(STUDIO, "node_modules", ".creator-kit");
  mkdirSync(cache, { recursive: true });
  const validator = join(cache, "validate-brand.mjs");
  copyFileSync(join(REPO, "schema", "validate-brand.mjs"), validator);
  const { checkBrand } = await import(pathToFileURL(validator).href);

  if (!existsSync(BRAND_FILE)) throw new Error(`Brand file not found: ${BRAND_FILE}`);
  const schema = JSON.parse(readFileSync(join(REPO, "schema", "brand.schema.json"), "utf8"));
  const result = checkBrand(readFileSync(BRAND_FILE, "utf8"), schema);
  if (!result.ok) throw new Error(`brand/brand.yaml needs fixing first:\n- ${result.errors.join("\n- ")}`);
  return result.brand;
}

const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function fetchCss(family, weights) {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@${weights}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (res.ok) return res.text();
  // Some families ship one weight only: ask for the default instead.
  const plain = await fetch(url.replace(/:wght@.*$/, ""), { headers: { "User-Agent": UA } });
  if (!plain.ok) throw new Error(`Google Fonts has no family called "${family}"`);
  return plain.text();
}

/** Downloads the latin files of one family into film/fonts/<slug>/ and returns its @font-face CSS. */
async function selfHost(family, weights) {
  const dir = join(FILM, "fonts", slug(family));
  const cssFile = join(dir, "fonts.css");
  if (existsSync(cssFile) && readdirSync(dir).some((f) => f.endsWith(".woff2"))) return readFileSync(cssFile, "utf8");

  const css = await fetchCss(family, weights);
  const blocks = [...css.matchAll(/\/\*\s*([a-z-]+)\s*\*\/\s*(@font-face\s*{[^}]*})/g)].filter(
    (m) => m[1] === "latin" || m[1] === "latin-ext",
  );
  if (blocks.length === 0) throw new Error(`no latin files for "${family}"`);
  mkdirSync(dir, { recursive: true });
  const files = new Map(); // variable fonts list one file under several weights
  const out = [];
  for (const [, subset, block] of blocks) {
    const src = /url\((https:[^)]+\.woff2)\)/.exec(block)?.[1];
    if (!src) continue;
    let file = files.get(src);
    if (!file) {
      file = `${slug(family)}-${subset}-${files.size}.woff2`;
      const res = await fetch(src);
      if (!res.ok) throw new Error(`download failed for ${family} (HTTP ${res.status})`);
      writeFileSync(join(dir, file), Buffer.from(await res.arrayBuffer()));
      files.set(src, file);
    }
    // Path is relative to film/brand.css, which is where this CSS ends up.
    out.push(block.replace(src, `fonts/${slug(family)}/${file}`).replace(/font-display:\s*\w+;?/, "font-display: block;"));
  }
  writeFileSync(cssFile, out.join("\n"));
  return out.join("\n");
}

async function fontCss(fonts) {
  const faces = new Map();
  const vars = [];
  for (const role of /** @type {const} */ (["display", "body", "mono"])) {
    const family = fonts[role];
    if (!family) {
      vars.push(`--font-${role}: ${FALLBACK[role]};`);
      continue;
    }
    if (!faces.has(family)) {
      try {
        faces.set(family, await selfHost(family, FONT_WEIGHTS[role]));
      } catch (err) {
        console.warn(`! ${family}: ${err.message}. Using a system font for now (needs internet once).`);
        faces.set(family, "");
      }
    }
    vars.push(`--font-${role}: "${family}", ${FALLBACK[role]};`);
  }
  return { faces: [...faces.values()].filter(Boolean).join("\n"), vars };
}

let brand;
try {
  brand = await loadBrand();
} catch (err) {
  console.error(`✖ ${err.message}`);
  process.exit(1);
}
const { colors, fonts = {}, wordmark, end_card: endCard = {}, safe_zone: safe = {} } = brand.visual;
const zone = { ...SAFE_ZONE, ...safe };
const font = await fontCss(fonts);

const css = `/* Generated by scripts/brand.mjs from brand/brand.yaml. Do not edit: change brand.yaml. */
${font.faces}
:root {
${Object.entries(colors).map(([role, hex]) => `  --${role}: ${hex};`).join("\n")}
${font.vars.map((v) => `  ${v}`).join("\n")}
${Object.entries(zone).map(([edge, px]) => `  --safe-${edge}: ${px}px;`).join("\n")}
}
`;

const words = {
  name: brand.brand.name,
  handle: brand.brand.handle,
  niche: brand.brand.niche ?? "",
  wordmark: { prefix: wordmark?.prefix ?? brand.brand.name, suffix: wordmark?.suffix ?? "" },
  series: brand.content?.series?.[0] ?? "",
  pillars: (brand.content?.pillars ?? []).slice(0, 3),
  endCard: { line: endCard.line ?? `Follow ${brand.brand.handle}`, button: endCard.button ?? "Follow for more" },
};

writeFileSync(join(FILM, "brand.css"), css);
writeFileSync(
  join(FILM, "brand.js"),
  `// Generated by scripts/brand.mjs from brand/brand.yaml. Do not edit: change brand.yaml.\nwindow.BRAND = ${JSON.stringify(words, null, 2)};\n`,
);
console.log(`✓ ${words.name}: film/brand.css + film/brand.js written from ${relative(REPO, BRAND_FILE)}`);
