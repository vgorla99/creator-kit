// Adds JSON-LD structured data (schema.org) to every built page.
import { readFileSync, writeFileSync } from "node:fs";
import { htmlFileFor, loadSite } from "./ssr.mjs";

const site = await loadSite();
for (const route of site.routes) {
  const file = htmlFileFor(route.path);
  const html = readFileSync(file, "utf8");
  // "<" is escaped so text can never close the script tag early.
  const json = JSON.stringify(site.schemaFor(route)).replace(/</g, "\u003c");
  writeFileSync(file, html.replace("<!--schema-->", `<script type="application/ld+json">${json}</script>`));
  console.log(`  schema ${route.path}`);
}
