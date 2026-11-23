// npm run brand:check [path/to/brand.yaml]
// Checks brand/brand.yaml against schema/brand.schema.json and the colour
// contrast rules, and explains every problem in plain English.

import { readFileSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { checkBrand } from "../schema/validate-brand.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const file = process.argv[2] ?? join(root, "brand", "brand.yaml");
const rel = relative(process.cwd(), file);
const shown = rel && !rel.startsWith("..") ? rel : file;

if (!existsSync(file)) {
  console.error(`✖ ${shown} not found. Run /brand-intake in Claude Code, or copy the example from the repo.`);
  process.exit(1);
}

const schema = JSON.parse(readFileSync(join(root, "schema", "brand.schema.json"), "utf8"));
const result = checkBrand(readFileSync(file, "utf8"), schema);

if (!result.ok) {
  console.error(`✖ ${shown} needs ${result.errors.length === 1 ? "one fix" : `${result.errors.length} fixes`}:\n`);
  for (const line of result.errors) console.error(`  • ${line}`);
  console.error("\nFix the lines above, save, and run `npm run brand:check` again.");
  process.exit(1);
}

const { brand, motion } = result.brand;
console.log(`✔ ${shown} is valid: ${brand.name} (${brand.handle}), engine ${motion?.engine ?? "not chosen yet"}, colours pass contrast.`);
