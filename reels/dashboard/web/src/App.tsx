import { useCallback, useEffect, useMemo, useState } from "react";
import type { BrandInfo, Item, PlanEntry, PostizPost } from "../../shared/src/index.ts";
import { api, fmt, postizByItem } from "./api.ts";
import type { Metric } from "./api.ts";
import { Library } from "./Library.tsx";
import { Detail } from "./Detail.tsx";
import { Calendar } from "./Calendar.tsx";
import { Performance } from "./Performance.tsx";
import { Style } from "./Style.tsx";
import { Banner } from "./ui.tsx";

const VIEWS = ["library", "calendar", "performance", "style"] as const;
type View = (typeof VIEWS)[number];

/** Hash route: #/<view>  or  #/item/<key> */
function readHash(): { view: View; key: string | null } {
  const [, a = "library", ...rest] = decodeURIComponent(location.hash.slice(1)).split("/");
  if (a === "item") return { view: "library", key: rest.join("/") || null };
  return { view: VIEWS.find((v) => v === a) ?? "library", key: null };
}

export type PostizStatus = { kind: "loading" } | { kind: "off" } | { kind: "error"; message: string } | { kind: "on" };

export function App() {
  const [route, setRoute] = useState(readHash);
  const [brand, setBrand] = useState<BrandInfo | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [plans, setPlans] = useState<PlanEntry[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [postiz, setPostiz] = useState<PostizPost[]>([]);
  const [postizStatus, setPostizStatus] = useState<PostizStatus>({ kind: "loading" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const on = (): void => setRoute(readHash());
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);

  const loadPostiz = useCallback((fresh: boolean) => {
    setPostizStatus({ kind: "loading" });
    api.postizPosts(fresh).then(
      (r) => {
        if (!r.connected) setPostizStatus({ kind: "off" });
        else if ("error" in r) setPostizStatus({ kind: "error", message: r.error });
        else { setPostiz(r.data); setPostizStatus({ kind: "on" }); }
      },
      (e: Error) => setPostizStatus({ kind: "error", message: e.message }),
    );
  }, []);

  useEffect(() => {
    api.brand().then((b) => {
      fmt.tz = b.timezone;
      const root = document.documentElement.style;
      root.setProperty("--color-brand", b.colors.primary);
      root.setProperty("--color-brand-ink", b.colors.dark);
      root.setProperty("--color-brand-2", b.colors.secondary);
      root.setProperty("--color-brand-3", b.colors.tertiary);
      document.title = `${b.name} · dashboard`;
      setBrand(b);
    }, (e: Error) => setError(`The dashboard server did not answer (${e.message}). Is it running?`));
    api.items().then(setItems, (e: Error) => setError(e.message));
    api.plans().then(setPlans, () => setPlans([]));
    api.metrics().then(setMetrics, () => setMetrics([]));
    loadPostiz(false);
  }, [loadPostiz]);

  const byItem = useMemo(() => postizByItem(postiz), [postiz]);
  const replaceItem = (next: Item): void => setItems((list) => list?.map((i) => (i.key === next.key ? next : i)) ?? null);
  const current = route.key ? items?.find((i) => i.key === route.key) ?? null : null;

  return (
    <div className="mx-auto min-h-dvh max-w-7xl px-4 pb-16 sm:px-6">
      <header className="sticky top-0 z-20 -mx-4 mb-6 border-b border-stone-800 bg-stone-950/90 px-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
          <a href="#/library" className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight">{brand?.name ?? "Creator Kit"}</span>
            <span className="text-xs text-stone-500">{brand?.handle}</span>
          </a>
          <nav aria-label="Views" className="-mx-1 flex max-w-full gap-1 overflow-x-auto">
            {VIEWS.map((v) => {
              const on = route.view === v && !route.key;
              return (
                <a key={v} href={`#/${v}`} aria-current={on ? "page" : undefined}
                  className={`rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap capitalize transition-colors ${on ? "bg-stone-800 text-stone-50" : "text-stone-400 hover:text-stone-100"}`}>
                  {v}
                </a>
              );
            })}
          </nav>
          <span className="ml-auto flex items-center gap-2 text-xs text-stone-400">
            <span aria-hidden className={`size-2 rounded-full ${postizStatus.kind === "on" ? "bg-emerald-400" : postizStatus.kind === "error" ? "bg-red-400" : "bg-stone-600"}`} />
            {postizStatus.kind === "on" ? "Postiz connected" : postizStatus.kind === "error" ? "Postiz error" : postizStatus.kind === "off" ? "Postiz not connected" : "Postiz…"}
            {postizStatus.kind !== "off" && (
              <button className="rounded px-1.5 py-1 hover:bg-stone-800" onClick={() => loadPostiz(true)} aria-label="Reload Postiz">↻</button>
            )}
          </span>
        </div>
      </header>

      <div className="mb-6 space-y-3 empty:hidden">
        {error && <Banner tone="bad">{error}</Banner>}
        {postizStatus.kind === "error" && <Banner tone="warn">Postiz: {postizStatus.message}. Showing folder data only.</Banner>}
        {brand?.example && !route.key && route.view !== "style" && (
          <Banner tone="info">
            You are looking at the <b>example posts</b> in <code className="text-stone-200">reels/content/example/</code>. Render your own reels
            (<code className="text-stone-200">npm run produce</code>) or put post folders in <code className="text-stone-200">reels/content/00_Ready/</code>, and they replace these.
          </Banner>
        )}
      </div>

      {!items && !error && <p className="py-12 text-center text-stone-400">Loading…</p>}

      {items && brand && (
        <main>
          {route.key ? (
            current ? (
              <Detail key={current.key} item={current} posts={byItem.get(current.key) ?? []} postizStatus={postizStatus}
                metrics={metrics.filter((m) => m.itemKey === current.key)} onChange={replaceItem} />
            ) : (
              <p className="py-12 text-center">Post not found. <a className="text-brand underline" href="#/library">Back to the library</a></p>
            )
          ) : route.view === "calendar" ? (
            <Calendar items={items} plans={plans} posts={postiz} postizStatus={postizStatus} />
          ) : route.view === "performance" ? (
            <Performance metrics={metrics} items={items} brand={brand} />
          ) : route.view === "style" ? (
            <Style />
          ) : (
            <Library brand={brand} items={items} byItem={byItem} postizOn={postizStatus.kind === "on"} />
          )}
        </main>
      )}
    </div>
  );
}
