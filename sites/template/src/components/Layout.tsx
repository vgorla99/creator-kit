import type { ReactNode } from "react";
import { brand } from "virtual:brand";
import { routes, socialLinks } from "../site";

function Wordmark({ suffixClass = "text-tertiary" }: { suffixClass?: string }) {
  const mark = brand.visual.wordmark;
  if (!mark) return <>{brand.brand.name}</>;
  return (
    <>
      {mark.prefix}
      {mark.suffix && <span className={suffixClass}>{mark.suffix}</span>}
    </>
  );
}

const SOCIAL_LABELS: Record<string, string> = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube" };

export function Layout({ current, children }: { current: string; children: ReactNode }) {
  const nav = routes.filter((r) => r.nav);
  const socials = socialLinks.filter(([key]) => key in SOCIAL_LABELS);
  return (
    <>
      <a href="#main" className="sr-only rounded-lg bg-dark px-4 py-3 text-light focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50">
        Skip to content
      </a>
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4 sm:px-6">
        <a href="/" className="font-display text-xl font-bold tracking-tight">
          <Wordmark />
        </a>
        <nav aria-label="Main">
          <ul className="flex gap-1 text-[15px] font-semibold">
            {nav.map((r) => (
              <li key={r.path}>
                <a
                  href={r.path}
                  aria-current={current === r.path ? "page" : undefined}
                  className="inline-flex min-h-11 items-center rounded-lg px-3 hover:bg-dark/5 aria-[current=page]:underline aria-[current=page]:decoration-primary aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8"
                >
                  {r.nav}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="main">{children}</main>
      <footer className="mt-24 bg-dark text-light">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6">
          <div>
            <p className="font-display text-xl font-bold"><Wordmark suffixClass="text-primary" /></p>
            {brand.site?.offer && <p className="mt-2 max-w-sm text-light/80">{brand.site.offer.charAt(0).toUpperCase() + brand.site.offer.slice(1)}.</p>}
          </div>
          <div className="grid gap-6 sm:justify-items-end">
            {socials.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Social media">
                {socials.map(([key, url]) => (
                  <li key={key}>
                    <a href={url} rel="me noopener" className="inline-flex min-h-11 items-center rounded-lg px-3 font-semibold text-primary underline-offset-4 hover:underline">
                      {SOCIAL_LABELS[key]}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-sm text-light/70">© {new Date().getFullYear()} {brand.brand.name}{brand.brand.location ? ` · ${brand.brand.location}` : ""}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
