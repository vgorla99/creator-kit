// Style rounds: Claude writes reels/style/round.json, you rate each option Keep / Maybe / Drop with a note,
// then submit. Ported from the kit author's Style Lab page, itself built on Shaan Johari's Style Lab template (@viashaan).
import { useEffect, useRef, useState } from "react";
import type { StyleCard, StyleData, StyleRating, Verdict } from "../../shared/src/index.ts";
import { api, styleUrl } from "./api.ts";
import { Banner } from "./ui.tsx";

const LOCAL_KEY = "creator-kit-style-example";
const VERDICTS: { v: Exclude<Verdict, "">; label: string; on: string }[] = [
  { v: "keep", label: "Keep", on: "border-keep bg-keep/15 text-keep" },
  { v: "maybe", label: "Maybe", on: "border-stone-200 bg-stone-100/10 text-stone-100" },
  { v: "drop", label: "Drop", on: "border-stone-500 bg-stone-500/20 text-stone-200" },
];
// Instagram Reels safe area on a 1080x1920 frame (clear of the top bar, the name row and the button column).
const IG_SAFE = "M91 237H990V997H899V1650H366V1479H91Z";

const touched = (r: StyleRating | undefined): boolean => Boolean(r && (r.v || r.note.trim()));
const ratio = (c: StyleCard, fallback: string): string => (c.aspect ?? fallback).replace(":", " / ");
const isVideo = (f: string): boolean => /\.(mp4|webm|mov)$/i.test(f);

function readLocal(): Record<string, StyleRating> {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "{}") as Record<string, StyleRating>; } catch { return {}; }
}

export function Style() {
  const [data, setData] = useState<StyleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, StyleRating>>({});
  const [onlyTodo, setOnlyTodo] = useState(false);
  const [safe, setSafe] = useState(false);
  const [open, setOpen] = useState<StyleCard | null>(null);
  const [overall, setOverall] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    api.style().then((d) => {
      setData(d);
      setRatings(d.example ? readLocal() : d.ratings);
    }, (e: Error) => setError(e.message));
  }, []);

  if (error) return <Banner tone="bad">{error}</Banner>;
  if (!data) return <p className="py-12 text-center text-stone-400">Loading…</p>;
  const { round, sections, cards } = data.data;
  const aspect = round.aspect ?? "9:16";
  const rateable = cards.filter((c) => !c.locked);
  const done = rateable.filter((c) => touched(ratings[c.id])).length;

  const save = async (id: string, patch: Partial<StyleRating>): Promise<void> => {
    const prev = ratings[id] ?? { v: "", note: "", at: 0 };
    const next: StyleRating = { ...prev, ...patch, at: Date.now() };
    const all = { ...ratings, [id]: next };
    setRatings(all);
    if (data.example) {
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(all)); } catch { /* private window: keep in memory */ }
      return;
    }
    try { await api.rate(id, next.v, next.note); }
    catch (e) { setStatus({ ok: false, text: `A rating did not save (${e instanceof Error ? e.message : "error"}). Try again.` }); }
  };

  const submit = async (): Promise<void> => {
    if (data.example) { setStatus({ ok: false, text: `This is the example round, so nothing was sent (${done} rated). Ask Claude to make your first real round.` }); return; }
    setStatus({ ok: true, text: "Sending…" });
    try {
      const r = await api.submitStyle(overall);
      setStatus({ ok: true, text: `Submitted: ${r.rated} rated, saved to reels/style/${r.file}. Tell Claude "done" in your chat.` });
    } catch (e) {
      setStatus({ ok: false, text: `That didn't save (${e instanceof Error ? e.message : "error"}). Your ratings are kept; try again.` });
    }
  };

  const sorted = [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return (
    <section aria-labelledby="style-h" className="space-y-6">
      <header className="space-y-3">
        <p className="font-mono text-xs tracking-[.14em] text-stone-400 uppercase">Style · {data.example ? "example round" : `round ${round.round}`}</p>
        <h1 id="style-h" className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{round.title}</h1>
        {round.intro && <p className="max-w-2xl text-stone-400">{round.intro}</p>}
        {!!round.notes?.length && (
          <ul className="max-w-3xl space-y-1 rounded-xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm text-stone-400">
            {round.notes.map((n) => <li key={n}>{n}</li>)}
          </ul>
        )}
        {data.example && (
          <div className="max-w-3xl rounded-xl border border-dashed border-stone-600 bg-white/5 px-4 py-3 text-sm">
            <b>This is an example round.</b> Ask Claude in this folder: <i>"make my first Style round"</i>. It writes <code>reels/style/round.json</code> with previews of options for your brand, and they show up here. See <code>reels/style/README.md</code>.
          </div>
        )}
      </header>

      <div className="sticky top-[60px] z-10 -mx-4 flex flex-wrap items-center gap-3 border-y border-stone-800 bg-stone-950/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex min-w-40 flex-1 items-center gap-3 font-mono text-xs text-stone-400 tabular-nums">
          {done} of {rateable.length} rated
          <span className="h-1 max-w-48 flex-1 overflow-hidden rounded bg-stone-800">
            <span className="block h-full origin-left bg-stone-100 transition-transform motion-reduce:transition-none" style={{ transform: `scaleX(${rateable.length ? done / rateable.length : 0})` }} />
          </span>
        </div>
        <button className={`rounded-full border px-3 py-1 text-sm ${safe ? "border-stone-500 bg-stone-800 text-stone-50" : "border-stone-700 text-stone-400"}`} aria-pressed={safe} onClick={() => setSafe(!safe)}>Safe zones</button>
        <button className={`rounded-full border px-3 py-1 text-sm ${onlyTodo ? "border-stone-500 bg-stone-800 text-stone-50" : "border-stone-700 text-stone-400"}`} aria-pressed={onlyTodo} onClick={() => setOnlyTodo(!onlyTodo)}>Unrated only</button>
      </div>

      {sorted.map((s) => {
        const list = cards.filter((c) => c.section === s.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const shown = list.filter((c) => !onlyTodo || c.locked || !touched(ratings[c.id]));
        return (
          <section key={s.id} aria-labelledby={`s-${s.id}`} className="space-y-3 border-t border-stone-800 pt-6 first-of-type:border-t-0">
            <div className="flex flex-wrap items-baseline gap-x-4">
              <h2 id={`s-${s.id}`} className="text-xl font-semibold">{s.name}</h2>
              <span className="ml-auto font-mono text-xs text-stone-500">{list.length} {list.length === 1 ? "option" : "options"}</span>
            </div>
            {s.use && <p className="max-w-3xl text-stone-400">{s.use}</p>}
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] sm:gap-5 sm:overflow-visible sm:px-0">
              {shown.map((c) => (
                <Card key={c.id} card={c} aspect={ratio(c, aspect)} safe={safe} rating={ratings[c.id]} onOpen={() => setOpen(c)} onSave={(p) => save(c.id, p)} />
              ))}
            </div>
          </section>
        );
      })}

      <section aria-labelledby="fin-h" className="max-w-3xl space-y-3 border-t border-stone-800 pt-6">
        <h2 id="fin-h" className="text-xl font-semibold">Done reviewing?</h2>
        <label htmlFor="overall" className="block text-sm text-stone-400">Anything across the whole round (the overall feel, what's missing, what to push further):</label>
        <textarea id="overall" rows={4} value={overall} onChange={(e) => setOverall(e.target.value)} className="field w-full py-2" placeholder="e.g. heavier font for the titles, slower entrances" />
        <button className="rounded-lg bg-stone-100 px-5 py-3 text-sm font-semibold tracking-wide text-stone-950 uppercase hover:bg-white" onClick={submit}>Submit review</button>
        <p aria-live="polite" className={`min-h-5 text-sm ${status?.ok ? "text-keep" : "text-stone-400"}`}>{status?.text}</p>
      </section>
      <p className="text-xs text-stone-500">Ratings save as you go. Style round format based on the Style Lab template by Shaan Johari (<a className="underline" href="https://instagram.com/viashaan" target="_blank" rel="noopener noreferrer">@viashaan</a>).</p>

      {open && <Lightbox card={open} aspect={ratio(open, aspect)} safe={safe} onClose={() => setOpen(null)} />}
    </section>
  );
}

function Preview({ card, full, safe }: { card: StyleCard; full: boolean; safe: boolean }) {
  const file = full ? card.full ?? card.preview : card.preview ?? card.full;
  let media;
  if (card.demo) {
    media = (
      <div className={`ex ex-${card.demo} absolute inset-0 grid place-items-center bg-[radial-gradient(120%_80%_at_30%_20%,#4a4a4c,#1f1f20_70%)]`}>
        <span className={`ex-word font-semibold tracking-wide uppercase ${card.demo === "typed" ? "font-mono" : ""}`}>
          {card.demo === "typed" ? "Style Lab" : <>Your <u className="underline-offset-4">style</u></>}
        </span>
      </div>
    );
  } else if (!file) {
    media = <span className="absolute inset-0 grid place-items-center text-sm text-stone-500">No preview</span>;
  } else if (isVideo(file)) {
    media = full
      ? <video src={styleUrl(file)} playsInline loop controls autoPlay className="absolute inset-0 size-full object-contain" />
      : <video src={styleUrl(file)} muted playsInline loop autoPlay preload="metadata" className="absolute inset-0 size-full object-cover" />;
  } else {
    media = <img src={styleUrl(file)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />;
  }
  return (
    <>
      {media}
      {safe && (
        <svg viewBox="0 0 1080 1920" preserveAspectRatio="none" aria-hidden className="pointer-events-none absolute inset-0 size-full">
          <path fill="rgba(0,0,0,.45)" fillRule="evenodd" d={`M0 0H1080V1920H0Z ${IG_SAFE}`} />
          <path d={IG_SAFE} fill="none" stroke="rgba(255,255,255,.85)" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
    </>
  );
}

type CardProps = { card: StyleCard; aspect: string; safe: boolean; rating: StyleRating | undefined; onOpen: () => void; onSave: (p: Partial<StyleRating>) => void };
function Card({ card, aspect, safe, rating, onOpen, onSave }: CardProps) {
  const [note, setNote] = useState(rating?.note ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flush = (text: string): void => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (text.trim() !== (rating?.note ?? "")) onSave({ note: text.trim() });
  };
  return (
    <article className="relative grid w-[78%] shrink-0 snap-start content-start gap-2.5 rounded-xl border border-stone-800 bg-stone-900 p-3 sm:w-auto">
      <button onClick={onOpen} aria-label={`Play ${card.label} full size`} className="relative w-full overflow-hidden rounded-lg bg-stone-950" style={{ aspectRatio: aspect }}>
        <Preview card={card} full={false} safe={safe && aspect === "9 / 16"} />
        <span className="absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[11px] text-stone-300">{card.id.replace(/^ex-/, "").toUpperCase()}</span>
      </button>
      <h3 className="font-semibold">{card.label}</h3>
      {card.desc && <p className="text-sm leading-snug text-stone-400">{card.desc}</p>}
      {card.source && <p className="font-mono text-xs break-all text-stone-500">{card.source}</p>}
      {card.locked ? <p className="text-sm text-keep">Locked in. Nothing to rate.</p> : (
        <>
          <div className="flex gap-1.5" role="group" aria-label={`Verdict for ${card.label}`}>
            {VERDICTS.map((x) => (
              <button key={x.v} aria-pressed={rating?.v === x.v} onClick={() => onSave({ v: rating?.v === x.v ? "" : x.v })}
                className={`flex-1 rounded-lg border px-1 py-1.5 text-sm ${rating?.v === x.v ? x.on : "border-stone-700 bg-stone-800 text-stone-400"}`}>{x.label}</button>
            ))}
          </div>
          <label className="sr-only" htmlFor={`n-${card.id}`}>Note on {card.label}</label>
          <textarea id={`n-${card.id}`} rows={2} value={note} placeholder="What works, what to change" className="field w-full py-2"
            onChange={(e) => {
              const t = e.target.value;
              setNote(t);
              if (timer.current) clearTimeout(timer.current);
              timer.current = setTimeout(() => flush(t), 900);
            }}
            onBlur={() => flush(note)} />
          <p className="min-h-3 font-mono text-[11px] text-stone-500">{rating?.at ? "Saved" : ""}</p>
        </>
      )}
    </article>
  );
}

function Lightbox({ card, aspect, safe, onClose }: { card: StyleCard; aspect: string; safe: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  const wide = aspect === "16 / 9";
  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }} aria-label="Full quality preview"
      className="m-auto max-h-none max-w-none bg-transparent p-4 backdrop:bg-black/90">
      <figure className="grid justify-items-center gap-3">
        <div className={`relative overflow-hidden rounded-xl bg-black ${wide ? "w-[min(92vw,1100px)]" : "h-[min(84vh,860px)] max-w-[92vw]"}`} style={{ aspectRatio: aspect }}>
          <Preview card={card} full safe={safe && aspect === "9 / 16"} />
        </div>
        <figcaption className="text-sm text-stone-300">{card.id.replace(/^ex-/, "").toUpperCase()} · {card.label}</figcaption>
        <button className="btn" onClick={() => ref.current?.close()} autoFocus>Close</button>
      </figure>
    </dialog>
  );
}
