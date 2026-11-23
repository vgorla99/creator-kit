// Writes dist/sitemap.xml and dist/llms.txt, and puts the real address of the
// sitemap into dist/robots.txt.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { dist, loadSite } from "./ssr.mjs";

const site = await loadSite();
const xmlEscape = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const urls = site.routes
  .map((r) => `  <url>\n    <loc>${xmlEscape(site.absolute(r.path))}</loc>${r.updated ? `\n    <lastmod>${r.updated}</lastmod>` : ""}\n  </url>`)
  .join("\n");
writeFileSync(join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

const robotsFile = join(dist, "robots.txt");
writeFileSync(robotsFile, readFileSync(robotsFile, "utf8").replace("%SITEMAP_URL%", site.absolute("/sitemap.xml")));
writeFileSync(join(dist, "llms.txt"), site.llmsTxt());
console.log(`  sitemap.xml (${site.routes.length} pages), llms.txt, robots.txt -> ${site.siteUrl}`);
