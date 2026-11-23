// Shared brand.yaml validator: used by `npm run brand:check` (Node) and by
// src/brand.ts when Remotion loads (browser). Plain JS so both can import it;
// types live in validate-brand.d.mts.
//
// Every error is one plain-English line naming the field, what it should be
// (the field's `description` in brand.schema.json) and what was written.

import Ajv from "ajv";
import { parse, YAMLParseError } from "yaml";

/** @param {string} instancePath e.g. "/visual/colors/0" -> "visual.colors[0]" */
function dotPath(instancePath) {
  return instancePath
    .split("/")
    .slice(1)
    .map((seg) => seg.replace(/~1/g, "/").replace(/~0/g, "~"))
    .reduce((acc, seg) => (/^\d+$/.test(seg) ? `${acc}[${seg}]` : acc ? `${acc}.${seg}` : seg), "");
}

function shown(value) {
  if (value === null) return "null";
  if (typeof value === "object") return Array.isArray(value) ? "a list" : "a section";
  return JSON.stringify(value);
}

/** @param {import("ajv").ErrorObject} err */
function describe(err) {
  const path = dotPath(err.instancePath);
  const where = path || "the file";
  const hint = err.parentSchema && typeof err.parentSchema.description === "string" ? err.parentSchema.description : null;

  if (err.keyword === "required") {
    const field = err.params.missingProperty;
    const child = err.parentSchema?.properties?.[field]?.description;
    const full = path ? `${path}.${field}` : field;
    return `${full} is missing${child ? ` — it should be ${child}` : ""}.`;
  }
  if (err.keyword === "additionalProperties") {
    const known = Object.keys(err.parentSchema?.properties ?? {}).join(", ");
    return `${where} has a field called "${err.params.additionalProperty}" that Creator Kit does not know. Check the spelling and indentation (allowed here: ${known}).`;
  }
  if (err.keyword === "maxItems") return `${where} has too many entries — keep it to ${err.params.limit} at most.`;
  if (err.keyword === "uniqueItems") return `${where} lists the same entry twice — remove the duplicate.`;
  if (hint) return `${where} must be ${hint}; you wrote ${shown(err.data)}.`;
  return `${where} ${err.message ?? "is not valid"}; you wrote ${shown(err.data)}.`;
}

// ── Contrast (WCAG) ────────────────────────────────────────────────────────
function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * ch((n >> 16) & 255) + 0.7152 * ch((n >> 8) & 255) + 0.0722 * ch(n & 255);
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Every pair below is used somewhere in the reels, so an illegible pair fails.
const CONTRAST_CHECKS = [
  ["light", "dark", 7, "body text on dark and light backgrounds"],
  ["primary", "dark", 4.5, "highlights on the dark background"],
  ["light", "tertiary", 4.5, "text on the tertiary background"],
  ["primary", "tertiary", 3, "highlights and the button on the tertiary background"],
  ["secondary", "dark", 3, "secondary accents on dark"],
  ["secondary", "light", 3, "secondary accents on light"],
];

export function contrastProblems(colors) {
  return CONTRAST_CHECKS.flatMap(([a, b, min, use]) => {
    const r = contrast(colors[a], colors[b]);
    return r < min
      ? [`visual.colors.${a} (${colors[a]}) and visual.colors.${b} (${colors[b]}) are too close: contrast ${r.toFixed(2)}:1, needs at least ${min}:1 for ${use}. Make one of them lighter or darker.`]
      : [];
  });
}

// ── Entry point ────────────────────────────────────────────────────────────
let compiled = null;

export function checkBrand(yamlText, schema) {
  let data;
  try {
    data = parse(yamlText);
  } catch (e) {
    if (e instanceof YAMLParseError) {
      const line = e.linePos?.[0]?.line;
      // yaml's first line ends with " at line N, column M:" — we say the line ourselves.
      const first = e.message.split("\n")[0].replace(/ at line \d+, column \d+:?\s*$/, "");
      return { ok: false, errors: [`The file is not valid YAML${line ? ` near line ${line}` : ""}: ${first}. Check indentation (2 spaces, no tabs) and that text with a colon is in "quotes".`] };
    }
    throw e;
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, errors: ["The file is empty or not a set of sections. Start from the example: brand:, visual: ..."] };
  }

  if (!compiled) compiled = new Ajv({ allErrors: true, verbose: true, strict: true }).compile(schema);
  if (!compiled(data)) {
    // One line per problem; ajv can report the same thing twice.
    const lines = [...new Set((compiled.errors ?? []).map(describe))];
    return { ok: false, errors: lines };
  }

  const problems = contrastProblems(data.visual.colors);
  return problems.length ? { ok: false, errors: problems } : { ok: true, brand: data };
}
