// Build-time brand loader. Reads the shared brand/brand.yaml (repo root),
// checks it with the same validator as `npm run brand:check`, downloads the
// brand fonts once so the site self-hosts them, and hands everything to the
// app as the virtual module "virtual:brand". Nothing here ships to visitors
// except the resulting values.

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Plugin } from "vite";
import type { BrandCheck, BrandFile } from "../../../schema/validate-brand.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const templateDir = resolve(here, "..");
const repoRoot = resolve(templateDir, "../..");
const VIRTUAL_ID = "virtual:brand";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

export const brandFilePath = resolve(repoRoot, process.env.BRAND_FILE ?? "brand/brand.yaml");

async function loadBrand(): Promise<BrandFile> {
  // ponytail: the validator imports `ajv` and `yaml` by bare name, which Node
  // resolves next to the file. Copying it under this template's node_modules
  // makes it use our copies, so sites/ builds without the reels' dependencies.
  // If the validator ever splits into several files, copy the folder instead.
  const cacheDir = join(templateDir, "node_modules", ".creator-kit");
  mkdirSync(cacheDir, { recursive: true });
  const validator = join(cacheDir, "validate-brand.mjs");
  copyFileSync(join(repoRoot, "schema", "validate-brand.mjs"), validator);
  const { checkBrand } = (await import(pathToFileURL(validator).href)) as {
    checkBrand: (yamlText: string, schema: object) => BrandCheck;
  };

  if (!existsSync(brandFilePath)) throw new Error(`Brand file not found: ${brandFilePath}`);
  const schema = JSON.parse(readFileSync(join(repoRoot, "schema", "brand.schema.json"), "utf8")) as object;
  const result = checkBrand(readFileSync(brandFilePath, "utf8"), schema);
  if (!result.ok) {
    throw new Error(`brand/brand.yaml needs fixing before the site can build:\n- ${result.errors.join("\n- ")}`);
  }
  return result.brand;
}

// ── Fonts ──────────────────────────────────────────────────────────────────
// Google Fonts are downloaded at build time and served from the site itself:
// faster (no third-party connection) and no visitor data sent to Google.
const FONT_FALLBACK = {
  display: "ui-sans-serif, system-ui, sans-serif",
  body: "ui-sans-serif, system-ui, sans-serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;
type FontRole = keyof typeof FONT_FALLBACK;
const FONT_WEIGHTS: Record<FontRole, string> = { display: "500;700", body: "400;600", mono: "400" };
// A modern browser user agent makes Google return woff2 files.
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function fetchFontCss(family: string, weights: string): Promise<string> {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@${weights}&display=swap`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (res.ok) return res.text();
  // Some families have one weight only; ask for the default instead of failing.
  const plain = await fetch(url.replace(/:wght@[^&]+/, ""), { headers: { "User-Agent": UA } });
  if (!plain.ok) throw new Error(`Google Fonts has no family called "${family}" (HTTP ${plain.status})`);
  return plain.text();
}

/** Downloads the latin subset of one family into public/fonts/<slug>/ and returns its @font-face CSS. */
async function selfHostFamily(family: string, weights: string): Promise<string> {
  const dir = join(templateDir, "public", "fonts", slug(family));
  const cssFile = join(dir, "fonts.css");
  if (existsSync(cssFile) && readdirSync(dir).some((f) => f.endsWith(".woff2"))) return readFileSync(cssFile, "utf8");

  const css = await fetchFontCss(family, weights);
  // Google labels each block with a comment: /* latin */, /* cyrillic */ ...
  const blocks = [...css.matchAll(/\/\*\s*([a-z-]+)\s*\*\/\s*(@font-face\s*{[^}]*})/g)].filter(
    (m) => m[1] === "latin" || m[1] === "latin-ext",
  );
  if (blocks.length === 0) throw new Error(`no latin files for "${family}"`);

  mkdirSync(dir, { recursive: true });
  // Variable fonts list one file under several weights: download each file once.
  const files = new Map<string, string>();
  const out: string[] = [];
  for (const [, subset, block] of blocks) {
    const src = /url\((https:[^)]+\.woff2)\)/.exec(block)?.[1];
    if (!src) continue;
    let file = files.get(src);
    if (!file) {
      file = `${slug(family)}-${subset}-${files.size}.woff2`;
      const res = await fetch(src);
      if (!res.ok) throw new Error(`download failed for ${src} (HTTP ${res.status})`);
      writeFileSync(join(dir, file), Buffer.from(await res.arrayBuffer()));
      files.set(src, file);
    }
    // "optional" never swaps fonts after the page is drawn, so text cannot
    // jump (no layout shift). With the preload below, the brand font is
    // almost always ready in time; on a very slow first visit the system
    // font is used for that one page view.
    out.push(block.replace(src, `/fonts/${slug(family)}/${file}`).replace(/font-display:\s*swap/, "font-display: optional"));
  }
  const result = out.join("\n");
  writeFileSync(cssFile, result);
  return result;
}

interface Fonts {
  faces: string;
  vars: string;
  /** Latin font files for the display and body fonts, preloaded in <head>. */
  preload: string[];
}

async function fontCss(brand: BrandFile): Promise<Fonts> {
  const fonts = brand.visual.fonts ?? {};
  const done = new Map<string, string>();
  const vars: string[] = [];
  const preload = new Set<string>();
  for (const role of Object.keys(FONT_FALLBACK) as FontRole[]) {
    const family = fonts[role];
    if (!family) {
      vars.push(`--brand-font-${role}:${FONT_FALLBACK[role]}`);
      continue;
    }
    if (!done.has(family)) {
      try {
        done.set(family, await selfHostFamily(family, FONT_WEIGHTS[role]));
      } catch (err) {
        // Offline or unknown font: the site still builds with system fonts.
        console.warn(`[brand] font "${family}" not downloaded (${(err as Error).message}); using system fonts.`);
        done.set(family, "");
      }
    }
    if (role !== "mono") {
      for (const m of (done.get(family) ?? "").matchAll(/url\((\/fonts\/[^)]+-latin-\d+\.woff2)\)/g)) preload.add(m[1]);
    }
    vars.push(`--brand-font-${role}:"${family}",${FONT_FALLBACK[role]}`);
  }
  return { faces: [...done.values()].filter(Boolean).join("\n"), vars: vars.join(";"), preload: [...preload] };
}

/** Font preloads, then CSS variables for colours and fonts plus @font-face rules. */
function themeHead(brand: BrandFile, fonts: Fonts): string {
  const c = brand.visual.colors;
  const colors = (Object.keys(c) as (keyof typeof c)[]).map((role) => `--brand-${role}:${c[role]}`).join(";");
  const links = fonts.preload.map((href) => `<link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin />`);
  return [...links, `<style id="brand-theme">${fonts.faces}\n:root{${colors};${fonts.vars}}</style>`].join("\n    ");
}

export function brandPlugin(): Plugin {
  let brand: BrandFile | null = null;
  let style = "";
  return {
    name: "creator-kit-brand",
    async buildStart() {
      brand = await loadBrand();
      style = themeHead(brand, await fontCss(brand));
      this.addWatchFile(brandFilePath);
    },
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },
    load(id) {
      if (id !== RESOLVED_ID || !brand) return null;
      return `export const brand = ${JSON.stringify(brand)};`;
    },
    transformIndexHtml(html) {
      const lang = brand?.brand.language ?? "en";
      return html.replace('<html lang="en">', `<html lang="${lang}">`).replace("<!--brand-theme-->", style);
    },
    handleHotUpdate({ file, server }) {
      if (resolve(file) === brandFilePath) server.restart();
    },
  };
}
