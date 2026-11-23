// Turns the single-page build into one real HTML file per page, so search
// engines and AI crawlers get the full text without running JavaScript.
// Also writes 404.html, favicon.svg, apple-touch-icon.png and og.png.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { dist, htmlFileFor, loadSite, root } from "./ssr.mjs";

const site = await loadSite();
const template = readFileSync(join(dist, "index.html"), "utf8");

function page(head, body) {
  return template.replace("<!--head-->", head).replace("<!--app-->", body);
}

for (const route of site.routes) {
  const file = htmlFileFor(route.path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page(site.headTags(route), site.render(route.path)));
  console.log(`  page  ${route.path}`);
}

const notFoundHead = `<title>Page not found | ${site.siteName}</title>\n    <meta name="robots" content="noindex" />`;
writeFileSync(join(dist, "404.html"), page(notFoundHead, site.render("/404-not-found")).replace("<!--schema-->", ""));

// Icons. resvg uses the fonts installed on this computer plus the brand fonts
// downloaded by the build (public/fonts), falling back to a system sans-serif.
const fontDirs = [join(root, "public", "fonts")];
const png = (svg, width) =>
  new Resvg(svg, { fitTo: { mode: "width", value: width }, font: { loadSystemFonts: true, fontDirs, defaultFontFamily: "Arial" } }).render().asPng();
writeFileSync(join(dist, "favicon.svg"), site.faviconSvg());
writeFileSync(join(dist, "apple-touch-icon.png"), png(site.faviconSvg(180), 180));
writeFileSync(join(dist, "og.png"), png(site.ogSvg(), 1200));
console.log("  icons favicon.svg, apple-touch-icon.png, og.png");
