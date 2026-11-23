// Types for validate-brand.mjs. Mirrors schema/brand.schema.json — keep the two in step.

export type Hex = `#${string}`;
export type ColorRole = "dark" | "light" | "primary" | "secondary" | "tertiary";
export type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface BrandFile {
  brand: {
    name: string;
    handle: string;
    niche?: string;
    audience?: string;
    language?: string;
    location?: string;
  };
  socials?: { instagram?: string; tiktok?: string; youtube?: string; website?: string };
  voice?: {
    tone?: string;
    do?: string[];
    dont?: string[];
    sample_caption?: string;
    words_per_second?: number;
    cta_style?: string;
  };
  visual: {
    colors: Record<ColorRole, Hex>;
    fonts?: { display?: string; body?: string; mono?: string };
    logo?: string;
    wordmark?: { prefix: string; suffix?: string };
    safe_zone?: { top?: number; bottom?: number; left?: number; right?: number };
    end_card?: { line?: string; button?: string };
  };
  references?: { url: string; why: string }[];
  motion?: {
    engine?: "remotion" | "hyperframes";
    aspect?: "9:16" | "4:5" | "1:1" | "16:9";
    fps?: 24 | 25 | 30 | 60;
    locked_terms?: string[];
    rejected_terms?: string[];
    music?: string | null;
  };
  content?: {
    pillars?: string[];
    series?: string[];
    hook_types?: string[];
    posting_days?: Day[];
    trial_reels?: boolean;
  };
  posting?: { provider?: "postiz-self" | "postiz-cloud" | "native"; timezone?: string };
  site?: { domain?: string; pages?: string[]; offer?: string; lead_magnet?: string };
}

export type BrandCheck = { ok: true; brand: BrandFile } | { ok: false; errors: string[] };

export function checkBrand(yamlText: string, schema: object): BrandCheck;
export function contrast(a: string, b: string): number;
export function contrastProblems(colors: Record<ColorRole, string>): string[];
