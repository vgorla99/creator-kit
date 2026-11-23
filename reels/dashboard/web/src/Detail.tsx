import { useState } from "react";
import type { Item, PostizPost } from "../../shared/src/index.ts";
import { score } from "../../shared/src/index.ts";
import { api, fmt, mediaUrl } from "./api.ts";
import type { Metric } from "./api.ts";
import type { PostizStatus } from "./App.tsx";
import { Chip, H2, STAGE, stateOf } from "./ui.tsx";

type Props = { item: Item; posts: PostizPost[]; postizStatus: PostizStatus; metrics: Metric[]; onChange: (item: Item) => void };

const PLAN_FIELDS = [["pillar", "Pillar"], ["hookType", "Hook type"], ["hook", "Hook"], ["line", "Line"], ["format", "Format"]] as const;

export function Detail({ item, posts, postizStatus, metrics, onChange }: Props) {
  const videos = [item.media.video, ...item.media.extras].filter((v): v is string => Boolean(v));
  const [video, setVideo] = useState(videos[0] ?? null);
  const poster = item.media.cover ? mediaUrl(item.key, item.media.cover) : undefined;

  return (
    <article className="space-y-6">
      <a className="inline-flex items-center gap-1 text-sm text-stone-400 hover:text-stone-100" href="#/library">← Library</a>
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone={STAGE[item.stage].tone}>{STAGE[item.stage].label}</Chip>
          <span className="font-mono text-sm text-stone-400">{item.code}</span>
          <span className="text-sm text-stone-500">{item.date ?? item.month} · {item.type}</span>
          {item.aiLabel && <Chip tone="info">turn on the AI label</Chip>}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{item.title}</h1>
        <p className="font-mono text-xs break-all text-stone-500">{item.folder}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
        <section aria-label="Media" className="space-y-3">
          <div className="mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-2xl border border-stone-800 bg-black md:max-w-none">
            {video ? (
              <video key={video} src={mediaUrl(item.key, video)} controls preload="metadata" playsInline poster={poster} className="size-full object-contain" />
            ) : poster ? (
              <img src={poster} alt="Cover" className="size-full object-contain" />
            ) : (
              <p className="grid size-full place-items-center p-6 text-center text-sm text-stone-500">No video or cover in this folder yet.</p>
            )}
          </div>
          {!video && item.type !== "carousel" && (
            <p className="text-xs text-stone-500">No video rendered yet. Render it with <code className="text-stone-300">npm run produce</code> and it shows up here.</p>
          )}
          {videos.length > 1 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Video versions">
              {videos.map((v) => (
                <button key={v} onClick={() => setVideo(v)} aria-pressed={v === video}
                  className={`rounded-lg border px-2.5 py-1 font-mono text-xs ${v === video ? "border-brand text-stone-50" : "border-stone-700 text-stone-400"}`}>{v}</button>
              ))}
            </div>
          )}
          {item.media.slides.length > 0 && (
            <div className="flex snap-x gap-2 overflow-x-auto pb-2">
              {item.media.slides.map((s, n) => (
                <a key={s} href={mediaUrl(item.key, s)} target="_blank" rel="noopener noreferrer" className="w-28 shrink-0 snap-start">
                  <img src={mediaUrl(item.key, s)} alt={`Slide ${n + 1}`} loading="lazy" className="aspect-[4/5] w-full rounded-lg border border-stone-800 object-cover" />
                </a>
              ))}
            </div>
          )}
          {item.media.review && (
            <details className="box">
              <summary className="cursor-pointer text-sm">Review sheet</summary>
              <img src={mediaUrl(item.key, item.media.review)} alt="Review sheet" loading="lazy" className="mt-3 w-full rounded-lg" />
            </details>
          )}
        </section>

        <div className="space-y-4">
          <Approval item={item} onChange={onChange} />
          <PostizBox posts={posts} status={postizStatus} />
          {item.plan && (
            <div className="box">
              <H2>Plan · {item.plan.folder}</H2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                {PLAN_FIELDS.filter(([k]) => item.plan?.[k]).map(([k, label]) => (
                  <div key={k} className="contents"><dt className="text-stone-500">{label}</dt><dd>{item.plan?.[k]}</dd></div>
                ))}
              </dl>
            </div>
          )}
          {item.header.length > 0 && (
            <div className="box">
              <H2>Posting notes</H2>
              <ul className="space-y-1 text-sm text-stone-300">{item.header.map((h) => <li key={h}>{h}</li>)}</ul>
            </div>
          )}
          {metrics.length > 0 && (
            <div className="box overflow-x-auto">
              <H2>Performance</H2>
              <table className="w-full text-sm tabular-nums">
                <thead className="text-left text-xs text-stone-500"><tr><th className="py-1 font-medium">Date</th><th className="font-medium">Where</th><th className="text-right font-medium">Views</th><th className="text-right font-medium">Watch s</th><th className="text-right font-medium">Score</th></tr></thead>
                <tbody>
                  {metrics.map((m, n) => (
                    <tr key={n} className="border-t border-stone-800">
                      <td className="py-1.5">{m.date}</td><td>{m.platform}</td>
                      <td className="text-right">{m.views?.toLocaleString("en-GB") ?? "–"}</td>
                      <td className="text-right">{m.avgWatchS ?? "–"}</td>
                      <td className="text-right">{score(m) ?? "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <section aria-labelledby="cap-h" className="space-y-4">
        <h2 id="cap-h" className="text-lg font-semibold">Captions</h2>
        {item.captionFiles.map((f) => (
          <div key={f.file} className="space-y-3">
            <p className="font-mono text-xs text-stone-500">{f.file}</p>
            <div className="grid gap-3 lg:grid-cols-2">
              {f.sections.map((s) => (
                <CaptionEditor key={`${f.file}|${s.name}`} item={item} file={f.file} section={s.name} initial={s.body} onChange={onChange} />
              ))}
            </div>
          </div>
        ))}
        {item.captionFiles.length === 0 && <p className="text-sm text-stone-500">No post.txt or caption.txt in this folder.</p>}
      </section>
    </article>
  );
}

function Approval({ item, onChange }: { item: Item; onChange: (i: Item) => void }) {
  const [notes, setNotes] = useState(item.dash.notes);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const save = async (patch: { approved?: boolean; notes?: string }): Promise<void> => {
    setBusy(true);
    setMsg(null);
    try {
      const dash = await api.saveDash(item.key, patch);
      onChange({ ...item, dash });
      setMsg("Saved");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };
  const approved = item.dash.approved;
  return (
    <div className={`box space-y-3 ${approved ? "border-emerald-800 bg-emerald-950/30" : ""}`}>
      <button disabled={busy} onClick={() => save({ approved: !approved })}
        className={approved ? "btn w-full border-emerald-700 text-emerald-300" : "btn-brand w-full"}>
        {approved ? "✓ Approved · undo" : "Approve"}
      </button>
      <label htmlFor="notes" className="block text-sm font-medium">Change notes</label>
      <textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What should change? Claude reads this."
        className="field w-full py-2" />
      <div className="flex items-center gap-3">
        <button className="btn" disabled={busy || notes === item.dash.notes} onClick={() => save({ notes })}>Save notes</button>
        <span className="text-xs text-stone-500" aria-live="polite">{msg ?? (item.dash.editedAt ? `edited ${fmt.when(item.dash.editedAt)}` : "")}</span>
      </div>
    </div>
  );
}

function PostizBox({ posts, status }: { posts: PostizPost[]; status: PostizStatus }) {
  return (
    <div className="box">
      <H2>Postiz</H2>
      {status.kind === "off" && <p className="text-sm text-stone-400">Not connected. Add <code className="text-stone-200">POSTIZ_API_KEY</code> to <code className="text-stone-200">.env</code> to see the posting state here.</p>}
      {status.kind === "error" && <p className="text-sm text-red-300">{status.message}</p>}
      {status.kind === "on" && posts.length === 0 && <p className="text-sm text-stone-400">Not in Postiz yet (matched on the first caption line).</p>}
      <ul className="space-y-2">
        {posts.map((p) => {
          const st = stateOf(p.error ? "ERROR" : p.state);
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-2 text-sm">
              <Chip tone={st.tone}>{st.label}</Chip>
              <strong>{p.channel}</strong>
              <span className="text-stone-400">{fmt.when(p.publishDate)}</span>
              {p.releaseURL && <a className="text-brand underline" href={p.releaseURL} target="_blank" rel="noopener noreferrer">open</a>}
              {p.error && <pre className="w-full overflow-x-auto rounded bg-red-950/50 p-2 text-xs whitespace-pre-wrap text-red-200">{p.error}</pre>}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-stone-500">Read-only. The dashboard never posts or schedules.</p>
    </div>
  );
}

type EditorProps = { item: Item; file: string; section: string; initial: string; onChange: (i: Item) => void };
function CaptionEditor({ item, file, section, initial, onChange }: EditorProps) {
  const [text, setText] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [status, setStatus] = useState<string | null>(null);
  const dirty = text !== saved;
  const id = `cap-${file}-${section}`.replace(/\W+/g, "-");
  const save = async (): Promise<void> => {
    setStatus("Saving…");
    try {
      const next = await api.saveCaption(item.key, file, section, text);
      setSaved(text);
      setStatus("Saved to the file (backup kept)");
      onChange(next);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Save failed");
    }
  };
  return (
    <div className="box space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold">{section}</label>
        <span className="text-xs text-stone-500 tabular-nums">{text.length} chars</span>
      </div>
      <textarea id={id} value={text} rows={Math.min(14, Math.max(3, text.split("\n").length + 1))} onChange={(e) => setText(e.target.value)}
        className="field w-full py-2 leading-relaxed" />
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn" disabled={!dirty} onClick={save}>Save</button>
        {dirty && <button className="btn border-transparent bg-transparent" onClick={() => setText(saved)}>Revert</button>}
        {status && <span className="text-xs text-stone-500" aria-live="polite">{status}</span>}
      </div>
    </div>
  );
}
