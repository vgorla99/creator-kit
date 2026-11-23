import { useState } from "react";
import type { BrandInfo, Item, PostizPost, Stage } from "../../shared/src/index.ts";
import { fmt, mediaUrl, overallState } from "./api.ts";
import type { PostState } from "./api.ts";
import { buildPrompt } from "./prompt.ts";
import { Chip, STAGE, stateOf } from "./ui.tsx";

type Props = { brand: BrandInfo; items: Item[]; byItem: Map<string, PostizPost[]>; postizOn: boolean };
type StatusFilter = "all" | "todo" | "approved" | "notes" | PostState;

const STATUS_LABEL: Record<StatusFilter, string> = {
  all: "Any status",
  todo: "Needs approval",
  approved: "Approved",
  notes: "Has notes",
  ERROR: "Postiz error",
  QUEUE: "Scheduled",
  PUBLISHED: "Published",
  NONE: "Not in Postiz",
};
const STAGES: { id: "review" | "all" | Stage; label: string }[] = [
  { id: "review", label: "To review" },
  { id: "all", label: "All" },
  { id: "draft", label: "Drafts" },
  { id: "ready", label: "Ready" },
  { id: "live", label: "Live" },
];

export function Library({ brand, items, byItem, postizOn }: Props) {
  const [stage, setStage] = useState<(typeof STAGES)[number]["id"]>("review");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<{ text: string; ok: boolean } | null>(null);

  const needle = search.trim().toLowerCase();
  const shown = items.filter((i) => {
    if (stage === "review" ? i.stage === "live" : stage !== "all" && i.stage !== stage) return false;
    if (type !== "all" && i.type !== type) return false;
    if (status === "todo" && i.dash.approved) return false;
    if (status === "approved" && !i.dash.approved) return false;
    if (status === "notes" && !i.dash.notes.trim()) return false;
    if ((status === "ERROR" || status === "QUEUE" || status === "PUBLISHED" || status === "NONE") && overallState(byItem.get(i.key)) !== status) return false;
    return !needle || `${i.code} ${i.title} ${i.slug}`.toLowerCase().includes(needle);
  });
  const count = (id: (typeof STAGES)[number]["id"]): number =>
    items.filter((i) => (id === "review" ? i.stage !== "live" : id === "all" || i.stage === id)).length;

  const copyPrompt = async (): Promise<void> => {
    const text = buildPrompt(brand.name, brand.provider, shown, fmt.day(new Date().toISOString()));
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ text, ok: true });
    } catch {
      setCopied({ text, ok: false });
    }
  };

  return (
    <section aria-labelledby="lib-h" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="lib-h" className="text-2xl font-bold tracking-tight sm:text-3xl">Library</h1>
          <p className="text-sm text-stone-400">Every reel and carousel, from first render to live.</p>
        </div>
        <button className="btn-brand w-full sm:w-auto" onClick={copyPrompt} disabled={!shown.length}
          title="Copies the approvals and notes of the posts shown, ready to paste to Claude">
          Copy prompt for Claude
        </button>
      </div>

      <div role="tablist" aria-label="Stage" className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {STAGES.map((s) => (
          <button key={s.id} role="tab" aria-selected={stage === s.id} onClick={() => setStage(s.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${stage === s.id ? "border-brand bg-brand/15 text-stone-50" : "border-stone-800 text-stone-400 hover:border-stone-600"}`}>
            {s.label} <span className="text-xs tabular-nums text-stone-500">{count(s.id)}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <input type="search" className="field col-span-2 sm:w-64" placeholder="Search ID or title" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search" />
        <select className="field" value={type} onChange={(e) => setType(e.target.value)} aria-label="Type">
          <option value="all">All types</option>
          <option value="video">Videos</option>
          <option value="carousel">Carousels</option>
          <option value="image">Images</option>
        </select>
        <select className="field" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} aria-label="Status">
          {(Object.keys(STATUS_LABEL) as StatusFilter[])
            .filter((s) => postizOn || !["ERROR", "QUEUE", "PUBLISHED", "NONE"].includes(s))
            .map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <span className="col-span-2 self-center text-sm text-stone-500 tabular-nums sm:ml-auto">{shown.length} of {items.length}</span>
      </div>

      {copied && (
        <div className="box space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <strong className="text-sm">Prompt for Claude</strong>
            <span className="text-xs text-stone-400">{copied.ok ? `✓ Copied (${shown.length} posts). Paste it into Claude Code.` : "Copy failed: select the text below and copy it."}</span>
            <button className="btn ml-auto" onClick={() => setCopied(null)}>Close</button>
          </div>
          <textarea readOnly value={copied.text} rows={8} onFocus={(e) => e.currentTarget.select()} aria-label="Prompt for Claude"
            className="field w-full py-2 font-mono text-xs" />
        </div>
      )}

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {shown.map((i) => <Card key={i.key} item={i} posts={byItem.get(i.key)} postizOn={postizOn} />)}
      </ul>
      {shown.length === 0 && <p className="py-12 text-center text-stone-500">No posts match these filters.</p>}
    </section>
  );
}

function Card({ item, posts, postizOn }: { item: Item; posts: PostizPost[] | undefined; postizOn: boolean }) {
  const state = overallState(posts);
  const thumb = item.media.cover ?? item.media.slides[0];
  const stage = STAGE[item.stage];
  return (
    <li>
      <a href={`#/item/${item.key}`}
        className={`group block overflow-hidden rounded-xl border bg-stone-900 transition-colors hover:border-stone-600 ${item.dash.approved ? "border-emerald-800" : "border-stone-800"}`}>
        <div className="relative aspect-[9/16] bg-stone-800">
          {thumb ? (
            <img src={mediaUrl(item.key, thumb)} alt="" loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
          ) : item.media.video ? (
            <video src={`${mediaUrl(item.key, item.media.video)}#t=0.5`} muted preload="metadata" playsInline className="size-full object-cover" />
          ) : (
            <span className="grid size-full place-items-center text-sm text-stone-500">no preview yet</span>
          )}
          <span className="absolute top-2 left-2"><Chip tone={stage.tone}>{stage.label}</Chip></span>
          <span className="absolute top-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-xs text-stone-200">
            {item.type === "carousel" ? `▦ ${item.media.slides.length}` : item.type === "video" ? "▶" : "◻"}
          </span>
        </div>
        <div className="space-y-2 p-3">
          <div className="flex items-baseline justify-between gap-2 text-xs">
            <strong className="font-mono text-stone-300">{item.code}</strong>
            <span className="text-stone-500 tabular-nums">{item.date?.slice(0, 10) ?? item.month}</span>
          </div>
          <p className="line-clamp-2 text-sm leading-snug font-medium">{item.title}</p>
          <div className="flex flex-wrap gap-1">
            {item.dash.approved && <Chip tone="good">approved</Chip>}
            {item.dash.notes.trim() && <Chip tone="warn">notes</Chip>}
            {postizOn && <Chip tone={stateOf(state).tone}>{stateOf(state).label}</Chip>}
            {item.aiLabel && <Chip tone="info">AI label</Chip>}
          </div>
        </div>
      </a>
    </li>
  );
}
