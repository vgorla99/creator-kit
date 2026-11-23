import type { ReactNode } from "react";

export type Tone = "neutral" | "good" | "warn" | "bad" | "brand" | "info" | "dim";

const TONES: Record<Tone, string> = {
  neutral: "border-stone-700 text-stone-300",
  good: "border-emerald-700/70 bg-emerald-950/60 text-emerald-300",
  warn: "border-amber-700/70 bg-amber-950/50 text-amber-300",
  bad: "border-red-700/70 bg-red-950/60 text-red-300",
  brand: "border-brand/60 bg-brand/15 text-brand",
  info: "border-sky-700/70 bg-sky-950/50 text-sky-300",
  dim: "border-stone-800 text-stone-500",
};

export function Chip({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${TONES[tone]}`}>{children}</span>;
}

/** Postiz / plan state → chip tone + label. */
export const STATE: Record<string, { tone: Tone; label: string }> = {
  PUBLISHED: { tone: "good", label: "published" },
  QUEUE: { tone: "info", label: "scheduled" },
  ERROR: { tone: "bad", label: "error" },
  DRAFT: { tone: "neutral", label: "Postiz draft" },
  PLANNED: { tone: "dim", label: "planned" },
  LIVE: { tone: "good", label: "live" },
  NONE: { tone: "dim", label: "not in Postiz" },
};
export const stateOf = (s: string): { tone: Tone; label: string } => STATE[s] ?? { tone: "neutral", label: s.toLowerCase() };

export const STAGE: Record<string, { tone: Tone; label: string }> = {
  draft: { tone: "warn", label: "draft" },
  ready: { tone: "brand", label: "ready" },
  live: { tone: "good", label: "live" },
};

export function Banner({ tone, children }: { tone: "warn" | "bad" | "info"; children: ReactNode }) {
  const cls = tone === "bad" ? "border-red-800 bg-red-950/60 text-red-200" : tone === "warn" ? "border-amber-800 bg-amber-950/50 text-amber-200" : "border-stone-700 bg-stone-900 text-stone-300";
  return <div role={tone === "bad" ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-sm ${cls}`}>{children}</div>;
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 text-xs font-semibold tracking-widest text-stone-400 uppercase">{children}</h2>;
}
