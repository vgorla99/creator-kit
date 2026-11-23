// Checks the built site (dist/) for the SEO basics. Exits 1 if anything
// must be fixed; warnings are worth a look but do not fail.
// Run after `npm run build`:  npm run check-seo
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { dist, htmlFileFor, loadSite } from "./ssr.mjs";

const site = await loadSite();
const errors = [];
const warnings = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

const meta = (html, attr, name) => new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`).exec(html)?.[1];
const decode = (t) => t.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

// ── JSON-LD ────────────────────────────────────────────────────────────────
const REQUIRED = {
  Organization: ["name", "url"],
  WebSite: ["name", "url"],
  WebPage: ["name", "url"],
  AboutPage: ["name", "url"],
  ContactPage: ["name", "url"],
  Article: ["headline", "datePublished", "dateModified", "author", "image"],
  FAQPage: ["mainEntity"],
  BreadcrumbList: ["itemListElement"],
};

function checkSchema(where, html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (blocks.length === 0) return fail(where, "no JSON-LD structured data");
  for (const [, text] of blocks) {
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return fail(where, `JSON-LD is not valid JSON (${e.message})`);
    }
    if (data["@context"] !== "https://schema.org") fail(where, 'JSON-LD needs "@context": "https://schema.org"');
    const nodes = Array.isArray(data["@graph"]) ? data["@graph"] : [data];
    const ids = new Set(nodes.map((n) => n["@id"]).filter(Boolean));
    for (const node of nodes) {
      const type = node["@type"];
      if (!type) {
        fail(where, "a JSON-LD item has no @type");
        continue;
      }
      for (const key of REQUIRED[type] ?? []) {
        if (node[key] === undefined || node[key] === "") fail(where, `${type} is missing "${key}"`);
      }
      if (type === "FAQPage") {
        for (const q of node.mainEntity ?? []) {
          if (q["@type"] !== "Question" || !q.name || !q.acceptedAnswer?.text) fail(where, "FAQPage has a question without name or answer text");
        }
      }
      for (const ref of JSON.stringify(node).matchAll(/\{"@id":"([^"]+)"\}/g)) {
        if (!ids.has(ref[1])) fail(where, `JSON-LD points to ${ref[1]}, which is not defined on the page`);
      }
    }
  }
}

// ── Each page ──────────────────────────────────────────────────────────────
const knownPaths = new Set(site.routes.map((r) => r.path));
for (const route of site.routes) {
  const where = route.path;
  const file = htmlFileFor(route.path);
  if (!existsSync(file)) {
    fail(where, "page was not built");
    continue;
  }
  const html = readFileSync(file, "utf8");
  const url = site.absolute(route.path);

  if (!/<html lang="[a-z]{2}/.test(html)) fail(where, "<html> has no lang attribute");
  if (!html.includes('name="viewport"')) fail(where, "no viewport meta tag");

  const title = decode(/<title>([^<]*)<\/title>/.exec(html)?.[1] ?? "");
  if (!title) fail(where, "no <title>");
  else if (title.length > 70) fail(where, `title is ${title.length} characters; keep it under 70 (Google cuts the rest)`);
  else if (title.length > 60) warn(where, `title is ${title.length} characters; under 60 shows in full on most screens`);

  const description = decode(meta(html, "name", "description") ?? "");
  if (!description) fail(where, "no meta description");
  else if (description.length < 70 || description.length > 165) warn(where, `meta description is ${description.length} characters; 70-160 reads best in results`);

  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
  if (canonical !== url) fail(where, `canonical should be ${url}, found ${canonical ?? "none"}`);

  for (const prop of ["og:title", "og:description", "og:url", "og:image", "og:type"]) {
    if (!meta(html, "property", prop)) fail(where, `missing ${prop}`);
  }

  const h1s = html.match(/<h1[\s>]/g) ?? [];
  if (h1s.length !== 1) fail(where, `needs exactly one <h1>, found ${h1s.length}`);

  for (const img of html.match(/<img\b[^>]*>/g) ?? []) {
    if (!/\salt="/.test(img)) fail(where, `image without alt text: ${img.slice(0, 80)}`);
  }

  for (const [, href] of html.matchAll(/<a [^>]*href="(\/[^"#]*)/g)) {
    const path = href.endsWith("/") ? href : `${href}/`;
    if (!knownPaths.has(path) && !existsSync(join(dist, href))) fail(where, `link to ${href}, which does not exist`);
  }

  checkSchema(where, html);
}

// ── Site-wide files ────────────────────────────────────────────────────────
const read = (name) => (existsSync(join(dist, name)) ? readFileSync(join(dist, name), "utf8") : null);

const robots = read("robots.txt");
if (!robots) fail("robots.txt", "missing");
else {
  if (!/^Sitemap: https:\/\/\S+\/sitemap\.xml$/m.test(robots)) fail("robots.txt", "needs a full Sitemap: https://.../sitemap.xml line");
  if (/^Disallow:\s*\/\s*$/m.test(robots)) fail("robots.txt", "blocks the whole site (Disallow: /)");
  for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]) {
    if (!robots.includes(bot)) warn("robots.txt", `${bot} is not named; it falls under * (allowed)`);
  }
}

const sitemap = read("sitemap.xml");
if (!sitemap) fail("sitemap.xml", "missing");
else {
  if (!sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) fail("sitemap.xml", "does not start with the XML declaration");
  for (const r of site.routes) {
    if (!sitemap.includes(`<loc>${site.absolute(r.path)}</loc>`)) fail("sitemap.xml", `does not list ${r.path}`);
  }
}

const llms = read("llms.txt");
if (!llms) fail("llms.txt", "missing");
else if (!llms.startsWith("# ")) fail("llms.txt", 'should start with "# " and the site name');

const notFound = read("404.html");
if (!notFound) fail("404.html", "missing (without it, wrong links show the home page)");
else if (!notFound.includes('content="noindex"')) fail("404.html", "should be noindex");

for (const file of ["og.png", "favicon.svg", "apple-touch-icon.png"]) {
  if (!existsSync(join(dist, file))) fail(file, "missing");
}
if (/\.example$|example\.com$/.test(new URL(site.siteUrl).hostname)) {
  warn("site", `domain is ${site.siteUrl}, a placeholder: set site.domain in brand/brand.yaml before launch`);
}

// ── Report ─────────────────────────────────────────────────────────────────
for (const w of warnings) console.log(`  warn  ${w}`);
if (errors.length) {
  for (const e of errors) console.log(`  FAIL  ${e}`);
  console.log(`\ncheck-seo: ${errors.length} problem(s) to fix.`);
  process.exit(1);
}
console.log(`check-seo: ${site.routes.length} pages, sitemap, robots.txt, llms.txt and JSON-LD all pass.`);
