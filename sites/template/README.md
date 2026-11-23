# Site template

React + Vite + TypeScript + Tailwind. Reads `brand/brand.yaml` at build time and builds a static site with SEO built in: one HTML file per page, JSON-LD, `sitemap.xml`, `robots.txt` (AI crawlers allowed), `llms.txt`, Open Graph image, self-hosted brand fonts.

```
npm install
npm run dev          # local preview while editing
npm run build        # dist/: the finished site
npm run check-seo    # must end with "all pass"
npm run preview      # look at dist/ on http://localhost:4173
```

| Where | What |
|---|---|
| `src/content.ts` | every word on the site that is not a brand fact |
| `src/site.ts` | page list, search titles and descriptions, JSON-LD, llms.txt |
| `src/pages/`, `src/components/` | the pages and building blocks |
| `vite/brand.ts` | loads and checks `brand/brand.yaml`, downloads the fonts |
| `scripts/` | `prerender`, `gen-schema`, `gen-sitemap`, `check-seo` |
| `public/` | `robots.txt`, `_headers` (Cloudflare caching and security headers) |
| `.env.example` | the sign-up form address (`VITE_FORM_ENDPOINT`) |

Launch guide: [docs/sites-launch.md](../../docs/sites-launch.md). Claude Code skills: `/niche-research`, `/site-builder`.
