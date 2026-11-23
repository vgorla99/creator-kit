// Every page, its search-result text, and its structured data (JSON-LD).
// The build scripts (prerender, gen-sitemap, gen-schema, check-seo) read the
// compiled version of this file, so adding a page here is enough for it to
// get HTML, a sitemap entry, an llms.txt line and schema.

import { brand } from "virtual:brand";
import { about, article, contact, home } from "./content";

export type PageKind = "home" | "about" | "contact" | "article";

export interface Route {
  path: string;
  kind: PageKind;
  /** Short page title; the brand name is appended in <title>. */
  title: string;
  description: string;
  /** In the main menu? */
  nav?: string;
  /** ISO date of the last real change, for the sitemap. */
  updated?: string;
}

const domain = brand.site?.domain ?? new URL(brand.socials?.website ?? "https://example.com").hostname;
export const siteUrl = `https://${domain}`;
export const siteName = brand.brand.name;
/** Social profile URLs (not the website itself). */
export const socialLinks: [string, string][] = Object.entries(brand.socials ?? {}).filter(
  (e): e is [string, string] => typeof e[1] === "string" && !e[1].includes(domain),
);

export const routes: Route[] = [
  { path: "/", kind: "home", title: home.title, description: home.description },
  { path: "/about/", kind: "about", title: about.title, description: about.description, nav: "About" },
  { path: `/guides/${article.slug}/`, kind: "article", title: article.title, description: article.description, nav: "Guide", updated: article.updated },
  { path: "/contact/", kind: "contact", title: contact.title, description: contact.description, nav: "Contact" },
];

export function findRoute(path: string): Route | undefined {
  const normal = path.endsWith("/") ? path : `${path}/`;
  return routes.find((r) => r.path === normal);
}

export const absolute = (path: string): string => new URL(path, siteUrl).href;

export function fullTitle(route: Route): string {
  return route.kind === "home" ? `${siteName}: ${route.title}` : `${route.title} | ${siteName}`;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** <title>, description, canonical and Open Graph / social tags for one page. */
export function headTags(route: Route): string {
  const url = absolute(route.path);
  const title = escapeHtml(fullTitle(route));
  const description = escapeHtml(route.description);
  const image = absolute("/og.png");
  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta name="theme-color" content="${brand.visual.colors.light}" />`,
    `<meta property="og:type" content="${route.kind === "article" ? "article" : "website"}" />`,
    `<meta property="og:site_name" content="${escapeHtml(siteName)}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapeHtml(`${siteName}: ${home.title}`)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ].join("\n    ");
}

// ── Structured data ────────────────────────────────────────────────────────
type JsonLd = { [key: string]: string | number | JsonLd | JsonLd[] | string[] };

const orgId = `${siteUrl}/#organization`;
const websiteId = `${siteUrl}/#website`;

function organization(): JsonLd {
  const sameAs = socialLinks.map(([, url]) => url);
  const org: JsonLd = {
    "@type": "Organization",
    "@id": orgId,
    name: siteName,
    url: `${siteUrl}/`,
    logo: absolute("/apple-touch-icon.png"),
  };
  if (brand.brand.niche) org.description = brand.brand.niche;
  if (sameAs.length) org.sameAs = sameAs;
  return org;
}

function breadcrumbs(route: Route): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: route.nav ?? route.title, item: absolute(route.path) },
    ],
  };
}

function faqPage(faqs: { q: string; a: string }[], url: string): JsonLd {
  return {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

/** One JSON-LD @graph per page: who publishes it, what the page is, and how it sits in the site. */
export function schemaFor(route: Route): JsonLd {
  const url = absolute(route.path);
  const page: JsonLd = {
    "@type": route.kind === "about" ? "AboutPage" : route.kind === "contact" ? "ContactPage" : "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: fullTitle(route),
    description: route.description,
    isPartOf: { "@id": websiteId },
    inLanguage: brand.brand.language ?? "en",
  };
  const graph: JsonLd[] = [organization(), { "@type": "WebSite", "@id": websiteId, url: `${siteUrl}/`, name: siteName, publisher: { "@id": orgId } }, page];

  if (route.kind === "home") {
    page.about = { "@id": orgId };
    graph.push(faqPage(home.faqs, url));
  } else {
    graph.push(breadcrumbs(route));
  }
  if (route.kind === "article") {
    graph.push({
      "@type": "Article",
      "@id": `${url}#article`,
      headline: article.question,
      description: article.description,
      datePublished: article.published,
      dateModified: article.updated,
      mainEntityOfPage: { "@id": `${url}#webpage` },
      author: { "@id": orgId },
      publisher: { "@id": orgId },
      image: absolute("/og.png"),
      inLanguage: brand.brand.language ?? "en",
    });
    graph.push(faqPage(article.faqs, url));
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

/** llms.txt: a plain map of the site for AI assistants (https://llmstxt.org). */
export function llmsTxt(): string {
  const lines = [`# ${siteName}`, "", `> ${home.description}`, ""];
  if (brand.site?.offer) lines.push(`Offer: ${brand.site.offer}.`);
  if (brand.site?.lead_magnet) lines.push(`Free: ${brand.site.lead_magnet}.`);
  if (brand.brand.location) lines.push(`Based in ${brand.brand.location}.`);
  lines.push("", "## Pages", "");
  for (const r of routes) lines.push(`- [${r.kind === "home" ? siteName : r.title}](${absolute(r.path)}): ${r.description}`);
  if (socialLinks.length) {
    lines.push("", "## Elsewhere", "");
    for (const [name, url] of socialLinks) lines.push(`- [${name}](${url})`);
  }
  return lines.join("\n") + "\n";
}
