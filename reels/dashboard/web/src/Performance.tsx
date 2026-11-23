import { useEffect, useState } from "react";
import type { BrandInfo, Item, PostizChannel, PostizResult } from "../../shared/src/index.ts";
import { hookWins, score } from "../../shared/src/index.ts";
import { api } from "./api.ts";
import type { Metric } from "./api.ts";
import { Banner, Chip, H2 } from "./ui.tsx";

type Props = { metrics: Metric[]; items: Item[]; brand: BrandInfo };
type SortKey = "date" | "platform" | "reelId" | "hookType" | "views" | "avgWatchS" | "shares" | "saves" | "follows" | "score";
const COLS: { key: SortKey; label: string; num?: boolean }[] = [
  { key: "date", label: "Date" },
  { key: "platform", label: "Where" },
  { key: "reelId", label: "Post" },
  { key: "hookType", label: "Hook type" },
  { key: "views", label: "Views", num: true },
  { key: "avgWatchS", label: "Watch s", num: true },
  { key: "shares", label: "Shares", num: true },
  { key: "saves", label: "Saves", num: true },
  { key: "follows", label: "Follows", num: true },
  { key: "score", label: "Score", num: true },
];
const n = (v: number | null): string => (v === null ? "–" : v.toLocaleString("en-GB"));

export function Performance({ metrics, items, brand }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "date", desc: true });
  const [platform, setPlatform] = useState("all");

  const rows = metrics
    .filter((m) => platform === "all" || m.platform === platform)
    .map((m) => ({ ...m, score: score(m) }))
    .sort((a, b) => {
      const x = a[sort.key] ?? -Infinity;
      const y = b[sort.key] ?? -Infinity;
      const c = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
      return sort.desc ? -c : c;
    });
  const total = (k: "views" | "shares" | "saves" | "follows"): number => rows.reduce((s, r) => s + (r[k] ?? 0), 0);
  const wins = hookWins(rows);
  const tried = new Set(wins.map((w) => w.hookType));
  const untried = brand.hookTypes.filter((h) => !tried.has(h));
  const titleOf = new Map(items.map((i) => [i.key, `${i.code} ${i.title}`]));

  return (
    <section aria-labelledby="perf-h" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="perf-h" className="text-2xl font-bold tracking-tight sm:text-3xl">Performance</h1>
          <p className="text-sm text-stone-400">From <code className="text-stone-300">reels/content/{brand.example ? "example/metrics.csv" : "_metrics/metrics.csv"}</code>. One row per post and platform.</p>
        </div>
        {metrics.length > 0 && (
          <select className="field" value={platform} onChange={(e) => setPlatform(e.target.value)} aria-label="Platform">
            <option value="all">All platforms</option>
            {[...new Set(metrics.map((m) => m.platform))].map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        )}
      </div>

      {!metrics.length ? (
        <Banner tone="info">No numbers yet. After a post has been live for a few days, add a row to <code>reels/content/_metrics/metrics.csv</code> (or ask Claude to). Fill <code>hook_type</code> so the dashboard can tell which hooks win.</Banner>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["views", "shares", "saves", "follows"] as const).map((k) => (
              <div key={k} className="box">
                <dt className="text-xs tracking-widest text-stone-500 uppercase">{k}</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums">{total(k).toLocaleString("en-GB")}</dd>
              </div>
            ))}
          </dl>

          <div className="box">
            <H2>Hook types that win</H2>
            <p className="mb-3 text-xs text-stone-500">Score = (shares + saves + follows) per 1,000 views, averaged per hook type. Higher is better.</p>
            <ol className="space-y-2">
              {wins.map((w, i) => {
                const best = wins[0]?.avgScore ?? 0;
                const pct = best && w.avgScore ? Math.max(4, (w.avgScore / best) * 100) : 4;
                return (
                  <li key={w.hookType} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 sm:grid-cols-[12rem_1fr_15rem]">
                    <span className="flex items-center gap-2 text-sm font-medium">{w.hookType}{i === 0 && w.avgScore !== null && <Chip tone="brand">winning</Chip>}</span>
                    <span className="order-3 col-span-2 h-2 overflow-hidden rounded-full bg-stone-800 sm:order-none sm:col-span-1">
                      <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%`, opacity: i === 0 ? 1 : 0.55 }} />
                    </span>
                    <span className="text-right text-xs text-stone-400 tabular-nums">
                      <b className="text-sm text-stone-100">{w.avgScore ?? "–"}</b> · {w.posts} post{w.posts === 1 ? "" : "s"} · {n(w.views)} views
                    </span>
                  </li>
                );
              })}
            </ol>
            {untried.length > 0 && <p className="mt-3 text-xs text-stone-500">Not tried yet (from brand.yaml): {untried.join(", ")}</p>}
          </div>

          <div className="box overflow-x-auto p-0">
            <table className="w-full min-w-[720px] text-sm tabular-nums">
              <thead className="border-b border-stone-800 text-xs text-stone-500">
                <tr>
                  {COLS.map((c) => (
                    <th key={c.key} className={`px-3 py-2 font-medium ${c.num ? "text-right" : "text-left"}`}
                      aria-sort={sort.key === c.key ? (sort.desc ? "descending" : "ascending") : undefined}>
                      <button className="hover:text-stone-200" onClick={() => setSort({ key: c.key, desc: sort.key === c.key ? !sort.desc : true })}>
                        {c.label}{sort.key === c.key ? (sort.desc ? " ↓" : " ↑") : ""}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-stone-800/70 hover:bg-stone-800/40">
                    <td className="px-3 py-2">{r.date}</td>
                    <td className="px-3">{r.platform}</td>
                    <td className="px-3 font-mono">{r.itemKey ? <a className="text-brand hover:underline" href={`#/item/${r.itemKey}`} title={titleOf.get(r.itemKey)}>{r.reelId}</a> : r.reelId || "–"}</td>
                    <td className="px-3">{r.hookType || "–"}</td>
                    <td className="px-3 text-right">{n(r.views)}</td>
                    <td className="px-3 text-right">{n(r.avgWatchS)}</td>
                    <td className="px-3 text-right">{n(r.shares)}</td>
                    <td className="px-3 text-right">{n(r.saves)}</td>
                    <td className="px-3 text-right">{n(r.follows)}</td>
                    <td className="px-3 text-right font-semibold">{n(r.score)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <PostizAnalytics />
    </section>
  );
}

function PostizAnalytics() {
  const [res, setRes] = useState<PostizResult<PostizChannel[]> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const load = (fresh: boolean): void => {
    setRes(null);
    setErr(null);
    api.postizAnalytics(fresh).then(setRes, (e: Error) => setErr(e.message));
  };
  useEffect(() => load(false), []);

  return (
    <div className="box">
      <div className="mb-3 flex items-center gap-3">
        <H2>Postiz analytics · last 30 days</H2>
        {res?.connected && <button className="btn ml-auto min-h-8 px-2 text-xs" onClick={() => load(true)}>Reload</button>}
      </div>
      {!res && !err && <p className="text-sm text-stone-500">Loading…</p>}
      {err && <p className="text-sm text-red-300">{err}</p>}
      {res && !res.connected && (
        <div className="space-y-1 text-sm text-stone-400">
          <p><Chip tone="dim">not connected</Chip></p>
          <p>To see followers and reach per channel, add two lines to the <code className="text-stone-200">.env</code> file in the kit folder and restart the dashboard:</p>
          <pre className="overflow-x-auto rounded-lg bg-stone-950 p-3 font-mono text-xs text-stone-300">POSTIZ_API_URL=https://api.postiz.com{"\n"}POSTIZ_API_KEY=your-key-from-postiz-settings</pre>
          <p className="text-xs">Self-hosted: use your Postiz backend address instead. The key stays on your computer and is never sent to the browser.</p>
        </div>
      )}
      {res?.connected && "error" in res && <p className="text-sm text-red-300">{res.error}</p>}
      {res?.connected && "data" in res && (
        res.data.length === 0 ? <p className="text-sm text-stone-400">Postiz has no channels yet. Connect one in Postiz with Add Channel.</p> : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {res.data.map((ch) => (
              <li key={ch.id} className="rounded-lg border border-stone-800 p-3">
                <div className="mb-2 flex items-center gap-2">
                  {ch.picture ? <img src={ch.picture} alt="" className="size-7 rounded-full" referrerPolicy="no-referrer" /> : <span className="size-7 rounded-full bg-stone-700" />}
                  <strong className="truncate text-sm">{ch.name}</strong>
                  <span className="ml-auto text-xs text-stone-500">{ch.identifier}</span>
                </div>
                {ch.disabled && <p className="text-xs text-stone-500">Channel disabled in Postiz.</p>}
                {ch.error && <p className="text-xs text-red-300">{ch.error}</p>}
                {!ch.disabled && !ch.error && ch.metrics.length === 0 && <p className="text-xs text-stone-500">No analytics for this platform.</p>}
                <dl className="grid grid-cols-2 gap-2">
                  {ch.metrics.map((m) => (
                    <div key={m.label}>
                      <dt className="text-xs text-stone-500">{m.label}</dt>
                      <dd className="font-semibold tabular-nums">
                        {n(m.total)}
                        {m.change !== null && <span className={`ml-1 text-xs ${m.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>{m.change >= 0 ? "+" : ""}{m.change}%</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
