// Paths, brand.yaml and .env. Secrets are read here and never sent to the browser.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import type { BrandInfo } from "../../shared/src/index.ts";

/** reels/dashboard */
export const APP = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
/** Repo root (the folder with brand/ and reels/). */
export const REPO = resolve(process.env.CREATOR_KIT_ROOT ?? join(APP, "../.."));
export const CONTENT = resolve(process.env.CONTENT_DIR ?? join(REPO, "reels", "content"));
export const STUDIO_OUT = join(REPO, "reels", "studio-remotion", "out");
export const STYLE_DIR = resolve(process.env.STYLE_DIR ?? join(REPO, "reels", "style"));
export const BACKUP_DIR = join(APP, "backups");
export const PORT = Number(process.env.PORT ?? 5180);
/** Only this machine. Never 0.0.0.0: the dashboard has no login. */
export const HOST = "127.0.0.1";

// Root .env (same file the studio scripts use). Existing environment variables win.
const envFile = join(REPO, ".env");
if (existsSync(envFile)) {
  try { process.loadEnvFile(envFile); } catch { console.warn("Could not read .env; Postiz stays off."); }
}

export const POSTIZ_KEY = (process.env.POSTIZ_API_KEY ?? "").trim();
/** Base URL without /public/v1. Postiz Cloud by default; self-hosted = your backend URL (e.g. https://post.example.com/api). */
export const POSTIZ_URL = (process.env.POSTIZ_API_URL ?? "https://api.postiz.com").trim().replace(/\/+$/, "");

const HEX = /^#[0-9a-fA-F]{6}$/;
const FALLBACK_COLORS: BrandInfo["colors"] = { dark: "#18181B", light: "#FAFAFA", primary: "#E8743F", secondary: "#5E8F7E", tertiary: "#3B2850" };

type Rec = Record<string, unknown>;
const rec = (v: unknown): Rec => (typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Rec) : {});
const str = (v: unknown, fallback: string): string => (typeof v === "string" && v.trim() ? v.trim() : fallback);

/** Read brand/brand.yaml (only the fields the dashboard shows). Run `npm run brand:check` at the root for full validation. */
export function readBrand(): Omit<BrandInfo, "example" | "postiz"> {
  const file = join(REPO, "brand", "brand.yaml");
  let doc: Rec = {};
  try { doc = rec(parse(readFileSync(file, "utf8"))); }
  catch (e) { console.warn(`brand/brand.yaml could not be read (${e instanceof Error ? e.message : "error"}); using defaults.`); }
  const brand = rec(doc.brand);
  const colors = rec(rec(doc.visual).colors);
  const pick = (k: keyof BrandInfo["colors"]): string => (typeof colors[k] === "string" && HEX.test(colors[k]) ? colors[k] : FALLBACK_COLORS[k]);
  const hookTypes = rec(doc.content).hook_types;
  return {
    name: str(brand.name, "My brand"),
    handle: str(brand.handle, ""),
    colors: { dark: pick("dark"), light: pick("light"), primary: pick("primary"), secondary: pick("secondary"), tertiary: pick("tertiary") },
    timezone: str(rec(doc.posting).timezone, "UTC"),
    hookTypes: Array.isArray(hookTypes) ? hookTypes.filter((h): h is string => typeof h === "string") : [],
    provider: str(rec(doc.posting).provider, "native"),
  };
}
