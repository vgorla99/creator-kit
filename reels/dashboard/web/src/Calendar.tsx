import { useState } from "react";
import type { Item, PlanEntry, PostizPost } from "../../shared/src/index.ts";
import { fmt } from "./api.ts";
import type { PostizStatus } from "./App.tsx";
import { Banner, Chip, STAGE, stateOf } from "./ui.tsx";
import type { Tone } from "./ui.tsx";

type Props = { items: Item[]; plans: PlanEntry[]; posts: PostizPost[]; postizStatus: PostizStatus };
type Entry = { key: string; label: string; title: string; time: string; tone: Tone; state: string; error: string | null; href: string | null; channel: string };

const pad = (n: number): string => String(n).padStart(2, "0");
const DOT: Record<Tone, string> = {
  good: "bg-emerald-400", info: "bg-sky-400", bad: "bg-red-400", warn: "bg-amber-400", brand: "bg-brand", neutral: "bg-stone-400", dim: "bg-stone-600",
};

/** All entries by day: Postiz posts (live state), your post folders, and plan entries nothing has been made for yet. */
function entriesByDay(items: Item[], plans: PlanEntry[], posts: PostizPost[]): Map<string, Entry[]> {
  const byDay = new Map<string, Entry[]>();
  const add = (day: string, e: Entry): void => { byDay.set(day, [...(byDay.get(day) ?? []), e]); };
  const inPostiz = new Set<string>();
  for (const p of posts) {
    const item = p.itemKey ? items.find((i) => i.key === p.itemKey) : undefined;
    if (item) inPostiz.add(item.key);
    const st = stateOf(p.error ? "ERROR" : p.state);
    add(fmt.day(p.publishDate), {
      key: p.id, label: item?.code ?? (p.content.slice(0, 24) || "(no caption)"), title: item?.title ?? p.content.slice(0, 80),
      time: fmt.time(p.publishDate), tone: st.tone, state: st.label, error: p.error, href: item ? `#/item/${item.key}` : null, channel: p.channel,
    });
  }
  const made = new Set(items.map((i) => i.folder));
  for (const i of items) {
    if (!i.date || inPostiz.has(i.key)) continue;
    const st = i.stage === "live" ? stateOf("LIVE") : STAGE[i.stage];
    add(i.date.slice(0, 10), { key: i.key, label: i.code, title: i.title, time: i.date.slice(11, 16), tone: st.tone, state: st.label, error: null, href: `#/item/${i.key}`, channel: "" });
  }
  for (const p of plans) {
    if (!p.date || (p.slug && made.has(`${p.id}-${p.slug}`))) continue;
    add(p.date, { key: `plan/${p.folder}/${p.id}`, label: p.id, title: p.title ?? "", time: p.time ?? "", tone: "dim", state: "planned", error: null, href: null, channel: "" });
  }
  for (const list of byDay.values()) list.sort((a, b) => a.time.localeCompare(b.time));
  return byDay;
}

export function Calendar({ items, plans, posts, postizStatus }: Props) {
  const today = fmt.day(new Date().toISOString());
  const byDay = entriesByDay(items, plans, posts);
  // Start on this month if it has anything, else on the latest month that does (e.g. the example month).
  const months = [...new Set([...byDay.keys()].map((d) => d.slice(0, 7)))].sort();
  const [ym, setYm] = useState(months.includes(today.slice(0, 7)) || !months.length ? today.slice(0, 7) : months[months.length - 1]);
  const [y, m] = ym.split("-").map(Number);
  const shift = (d: number): void => {
    const t = new Date(Date.UTC(y, m - 1 + d, 1));
    setYm(`${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}`);
  };

  const first = new Date(Date.UTC(y, m - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7; // Monday first
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (string | null)[] = [...Array<null>(lead).fill(null), ...Array.from({ length: days }, (_, d) => `${ym}-${pad(d + 1)}`)];
  const monthName = first.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  const errors = posts.filter((p) => (p.error || p.state === "ERROR") && fmt.day(p.publishDate).startsWith(ym));
  const inMonth = [...byDay.keys()].filter((d) => d.startsWith(ym)).reduce((n, d) => n + (byDay.get(d)?.length ?? 0), 0);
  const legend: [Tone, string][] = [["good", "live / published"], ["info", "scheduled in Postiz"], ["brand", "ready"], ["warn", "draft"], ["dim", "planned, not made yet"], ["bad", "error"]];

  return (
    <section aria-labelledby="cal-h" className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 id="cal-h" className="mr-auto text-2xl font-bold tracking-tight sm:text-3xl">{monthName}</h1>
        <button className="btn" onClick={() => shift(-1)} aria-label="Previous month">←</button>
        <button className="btn" onClick={() => setYm(today.slice(0, 7))}>Today</button>
        <button className="btn" onClick={() => shift(1)} aria-label="Next month">→</button>
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-400" aria-label="Legend">
        {legend.map(([t, l]) => <li key={l} className="flex items-center gap-1.5"><span className={`size-2 rounded-full ${DOT[t]}`} />{l}</li>)}
      </ul>
      {postizStatus.kind === "off" && <Banner tone="info">Postiz is not connected, so the calendar shows your plan and post folders only. Add <code>POSTIZ_API_KEY</code> to <code>.env</code> to see the posting queue.</Banner>}
      {errors.length > 0 && (
        <Banner tone="bad">
          {errors.length} Postiz error{errors.length > 1 ? "s" : ""} this month:
          <ul className="mt-1 list-disc pl-5">{errors.map((p) => <li key={p.id}>{fmt.when(p.publishDate)} {p.channel}: {p.error ?? "state ERROR"}</li>)}</ul>
        </Banner>
      )}

      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-7 sm:gap-1.5">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <li key={d} className="hidden px-2 text-xs font-medium text-stone-500 sm:block">{d}</li>)}
        {cells.map((day, n) => {
          const entries = day ? byDay.get(day) ?? [] : [];
          if (!day) return <li key={`pad${n}`} className="hidden sm:block" aria-hidden />;
          const isToday = day === today;
          return (
            <li key={day} className={`${entries.length ? "" : "hidden sm:block"} rounded-lg sm:min-h-24 border p-2 ${isToday ? "border-brand" : "border-stone-800"} ${entries.length ? "bg-stone-900" : "bg-stone-900/40"}`}>
              <p className={`mb-1.5 text-xs tabular-nums ${isToday ? "font-bold text-brand" : "text-stone-500"}`}>
                {Number(day.slice(8))} <span className="sm:hidden">{new Date(`${day}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" })}</span>
              </p>
              <ul className="space-y-1">
                {entries.map((e) => {
                  const body = (
                    <>
                      <span className={`size-2 shrink-0 rounded-full ${DOT[e.tone]}`} aria-hidden />
                      <b className="font-mono">{e.label}</b>
                      <span className="truncate text-stone-400 sm:hidden">{e.title}</span>
                      <span className="ml-auto shrink-0 text-stone-500">{e.channel ? `${e.channel} ` : ""}{e.time}</span>
                    </>
                  );
                  const cls = "flex items-center gap-1.5 rounded-md bg-stone-800/70 px-1.5 py-1 text-xs";
                  return (
                    <li key={e.key} title={`${e.title} · ${e.state}${e.error ? `: ${e.error}` : ""}`}>
                      {e.href ? <a href={e.href} className={`${cls} hover:bg-stone-700`}>{body}</a> : <span className={cls}>{body}</span>}
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>
      {inMonth === 0 && <p className="text-center text-sm text-stone-500 sm:hidden">Nothing planned or posted this month.</p>}
      {months.length > 0 && !months.includes(ym) && (
        <p className="text-center text-sm text-stone-500">Months with posts: {months.map((mo) => <button key={mo} className="mx-1 text-brand underline" onClick={() => setYm(mo)}>{mo}</button>)}</p>
      )}
      <p className="text-xs text-stone-500">Times in {fmt.tz}. <Chip tone="dim">planned</Chip> comes from <code>reels/content/&lt;month&gt;/plan.json</code>.</p>
    </section>
  );
}
