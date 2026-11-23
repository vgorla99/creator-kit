# Launching your website

> Part of [Creator Kit](../README.md). Takes about an hour the first time. Costs nothing except a domain (about €10 a year), which is optional.

Your site lives in `sites/template/`. It reads your colours, fonts, name and offer from [`brand/brand.yaml`](../brand/brand.yaml), so you never edit code to change them. The words on the pages live in `sites/template/src/content.ts`. The easiest way to write them is to open Claude Code in the repo and type `/site-builder`. It plans the site with you and waits for your OK before writing anything.

This guide covers the steps you do yourself: build, put the site online, connect a domain, and tell Google about it.

## What you need

- The kit downloaded, and **Node.js 22** or newer (the setup script installs it; check with `node -v` in a terminal).
- A free [Cloudflare](https://dash.cloudflare.com/sign-up) account.
- A Google account, for Search Console.
- Optional: a domain name. You can buy one at Cloudflare (Dashboard → **Domain Registration** → **Register Domains**) or anywhere else.

## 1. Fill in the site block of your brand file

Open `brand/brand.yaml` and check the `site:` section:

```yaml
site:
  domain: yourdomain.com          # no https://, no www
  pages: [home, about, workshops, free guide]
  offer: small online workshops, 6 people per group
  lead_magnet: "free PDF: the 10 tools you already have in your kitchen"
```

No domain yet? Leave the example for now and come back to it in step 4. Your sitemap and share links use this domain, so the site has to be built again once you set the real one.

Then run `npm run brand:check` in the repo folder. It tells you in plain English if anything is wrong.

## 2. Connect the sign-up form

The lead form and the pop-up need somewhere to send email addresses. Any form service that accepts a normal web form works, for example [Formspree](https://formspree.io), [Tally](https://tally.so) or [Basin](https://usebasin.com). Most have a free plan.

1. Create a form in the service of your choice. It gives you a form address that looks like `https://formspree.io/f/abc123`.
2. In `sites/template/`, copy `.env.example` to a new file called `.env`.
3. Paste the address after `VITE_FORM_ENDPOINT=` and save.

This address is not a secret: it ends up in your public site, which is normal. Never put passwords or API keys in this file.

If you skip this step, the forms show "not connected yet" and nobody's email is lost silently.

## 3. Build the site

Open a terminal in `sites/template/` and run:

```
npm install
npm run build
npm run check-seo
```

- `npm install` only needs to run once (the setup script may already have done it).
- `npm run build` creates the finished website in the `dist` folder: one page per file, plus `sitemap.xml`, `robots.txt`, `llms.txt`, the share image and the icons.
- `npm run check-seo` checks every page (titles, descriptions, structured data, sitemap, robots.txt). It should end with **all pass**. A warning about an `.example` domain just means step 1 still uses the example domain.

**Look at it before it goes online:** run `npm run preview` and open the link it prints (usually `http://localhost:4173`). Press `Ctrl+C` in the terminal to stop it.

**Optional speed check:** while the preview runs, open a second terminal and run `npx lighthouse http://localhost:4173/ --view`. A report opens in your browser. The template scores 90 or more on all four scores on mobile. If you add large photos and a score drops, ask Claude to fix it.

## 4. Put it online with Cloudflare Pages

Cloudflare Pages is free, has no traffic limit and allows business sites. Pick **one** of the two ways.

### Option A: drag and drop (simplest)

1. Go to the [Cloudflare dashboard](https://dash.cloudflare.com) → **Workers & Pages**.
2. Click **Create application** → **Pages** → **Drag and drop your files** (Cloudflare moves these buttons around now and then; look for "upload" or "drag and drop").
3. Give the project a name, for example `kilnhour`. This becomes `kilnhour.pages.dev`.
4. Drag the **`dist`** folder from `sites/template/` into the upload box, then click **Deploy site**.

**You should see** a link like `https://kilnhour.pages.dev`. Open it: that is your live site.

To update the site later: change things, run `npm run build` again, then in the dashboard open the project → **Create deployment** (or **Upload assets**) and drag the new `dist` folder in.

### Option B: connect GitHub (updates itself)

Only if your copy of the kit is on your own GitHub account.

1. **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**, and pick your repository.
2. Build settings:

   | Setting | Value |
   |---|---|
   | Framework preset | None |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory (advanced) | `sites/template` |

3. Under **Environment variables**, add `VITE_FORM_ENDPOINT` with your form address (from step 2), and `NODE_VERSION` with the value `22`.
4. Click **Save and Deploy**.

From then on, every change you push to GitHub rebuilds and publishes the site by itself.

## 5. Connect your domain

1. In the dashboard, open your Pages project → **Custom domains** → **Set up a custom domain**.
2. Type your domain (for example `yourdomain.com`) and continue.
   - **Domain bought at Cloudflare, or its DNS is on Cloudflare:** Cloudflare adds the record for you. Click **Activate domain**.
   - **Domain somewhere else:** Cloudflare shows a **CNAME** record. Log in where you bought the domain, open its DNS settings, and add that record exactly as shown. It can take from a few minutes to a few hours to work.
3. Add `www.yourdomain.com` the same way, so both addresses work.

**You should see** the domain marked **Active**, and `https://yourdomain.com` opening your site with a padlock. The certificate (HTTPS) is free and automatic.

If you changed the domain in `brand.yaml` in step 1, make sure you built and uploaded **after** that change.

## 6. Tell Google: Search Console

1. Go to [Google Search Console](https://search.google.com/search-console) and click **Add property**.
2. Choose **Domain**, type `yourdomain.com` (no https, no www) and click **Continue**.
3. Google asks you to prove you own the domain with a DNS **TXT** record.
   - If the domain's DNS is on Cloudflare, Google usually offers **Start verification** with Cloudflare: log in, approve, done.
   - Otherwise, copy the TXT record, add it in your domain's DNS settings, wait a few minutes and click **Verify**.
4. In the left menu, open **Sitemaps**. Type `sitemap.xml` in the box and click **Submit**.

**You should see** the status **Success** next to the sitemap, sometimes after a day. Google then starts reading your pages. Search data appears after a few days.

**Optional, five minutes:** in [Bing Webmaster Tools](https://www.bing.com/webmasters), choose **Import from Google Search Console**. Bing's index feeds several AI assistants, so this is worth doing.

## 7. Launch checklist

- [ ] `site.domain` in `brand/brand.yaml` is your real domain, and you rebuilt after setting it
- [ ] `npm run check-seo` ends with **all pass**
- [ ] You sent yourself a test sign-up and it arrived in your form service
- [ ] The site opens at `https://yourdomain.com` and at `https://www.yourdomain.com`
- [ ] Search Console is verified and the sitemap shows **Success**
- [ ] Pasting your link in a chat app shows a preview card with your title and image

## Every month

Once the site has a few weeks of data, open Claude Code and type `/site-builder` then "monthly check". It asks you to export your Search Console queries and finds the long questions people typed to find you. It then proposes a short, direct answer at the top of the page that ranks for each one. Answering real questions is the cheapest way to grow search traffic and to get quoted by AI answers.

## Other hosts

The `dist` folder is a plain static website, so any static host works:

- **Netlify**: drag `dist` into [app.netlify.com/drop](https://app.netlify.com/drop), or connect Git with base directory `sites/template`, build command `npm run build`, publish directory `dist`. The free plan allows commercial sites, with monthly limits on bandwidth and build minutes.
- **Vercel**: import the repo with root directory `sites/template` (Vite is detected). The free Hobby plan is for **non-commercial** use only, so a business site needs the Pro plan.

## Something went wrong?

| What you see | What to do |
|---|---|
| `brand/brand.yaml needs fixing before the site can build` | Run `npm run brand:check` in the repo folder and fix what it lists. |
| `font "..." not downloaded` | The build could not reach Google Fonts (offline?) or the font name is not a Google Font. The site still works with system fonts; check the name in `brand.yaml` and build again when online. |
| `check-seo` shows **FAIL** | Each line names the page and the problem. Ask Claude: "fix the check-seo failures". |
| The form says "not connected yet" | Step 2: `.env` is missing or `VITE_FORM_ENDPOINT` is empty. Build again after fixing. On Cloudflare with GitHub, set it under **Environment variables** and redeploy. |
| The site shows old content | Build again and upload the new `dist`, or push to GitHub (option B). Then hard-refresh the browser (`Ctrl+Shift+R`). |
| Domain stuck on "Pending" | DNS changes can take a few hours. Check the CNAME record matches exactly what Cloudflare shows. |
