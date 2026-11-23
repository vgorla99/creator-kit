// Pure parsers (no fs). Used by the server and by check.ts.
import type { MetricRow, ParsedPost, PlanEntry, Section } from "./types.ts";

const SECTION_RE = /^── (.+?) ──\s*$/;

/** Split text into header lines (before the first "── Name ──") and sections. Line endings normalised to \n. */
export function splitSections(text: string): { header: string[]; sections: Section[] } {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const header: string[] = [];
  const sections: Section[] = [];
  let current: { name: string; lines: string[] } | null = null;
  const flush = (): void => {
    if (current) sections.push({ name: current.name, body: current.lines.join("\n").trim() });
  };
  for (const line of lines) {
    const m = SECTION_RE.exec(line);
    if (m) {
      flush();
      current = { name: m[1], lines: [] };
    } else if (current) current.lines.push(line);
    else header.push(line);
  }
  flush();
  return { header: header.filter((l) => l.trim() !== ""), sections };
}

/** post.txt as written by `npm run produce`: "V01 — Title", "Date: 2026-01-02 18:00 · …", AI-label line, then sections. */
export function parsePostTxt(text: string): ParsedPost {
  const { header, sections } = splitSections(text);
  const first = header[0] ?? "";
  const tm = /^(\S+)\s+[—–-]\s+(.*)$/.exec(first);
  const dateLine = header.find((l) => /^date:/i.test(l)) ?? "";
  const dm = /(\d{4}-\d{2}-\d{2})(?:\D+?(\d{1,2}:\d{2}))?/.exec(dateLine);
  const date = dm ? (dm[2] ? `${dm[1]} ${dm[2].padStart(5, "0")}` : dm[1]) : null;

  let aiLabel: boolean | null = null;
  for (const l of header) {
    if (/no AI label/i.test(l)) aiLabel = false;
    else if (/AI label/i.test(l)) aiLabel = true;
  }
  return {
    code: tm ? tm[1] : first.split(/\s/)[0] ?? "",
    title: tm ? tm[2].trim() : first,
    date,
    header: header.slice(1),
    aiLabel,
    sections,
  };
}

/**
 * Replace the body of section `name` (first occurrence), keeping everything else
 * byte-for-byte (incl. CRLF). Throws if the section does not exist.
 */
export function replaceSection(text: string, name: string, body: string): string {
  const crlf = text.includes("\r\n");
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const start = lines.findIndex((l) => SECTION_RE.exec(l)?.[1] === name);
  if (start < 0) throw new Error(`Section "${name}" not found`);
  let end = lines.findIndex((l, i) => i > start && SECTION_RE.test(l));
  if (end < 0) end = lines.length;
  const tail = lines.slice(end);
  const next = [...lines.slice(0, start + 1), ...body.trim().split("\n"), ...(tail.length ? [""] : []), ...tail];
  const out = next.join("\n");
  return crlf ? out.replace(/\n/g, "\r\n") : out;
}

/** plan.json → entries (videos + carousels). Unknown shapes are ignored. */
export function parsePlan(json: unknown, folder: string): PlanEntry[] {
  const out: PlanEntry[] = [];
  if (typeof json !== "object" || json === null) return out;
  const rec = json as Record<string, unknown>;
  for (const [kind, list] of [["video", rec.videos], ["carousel", rec.carousels]] as const) {
    if (!Array.isArray(list)) continue;
    for (const raw of list) {
      if (typeof raw !== "object" || raw === null) continue;
      const r = raw as Record<string, unknown>;
      if (typeof r.id !== "string") continue;
      const s = (k: string): string | undefined => {
        const v = r[k];
        if (typeof v === "string") return v;
        if (Array.isArray(v)) return v.filter((x) => typeof x === "string").join(" / ");
        return v == null ? undefined : String(v);
      };
      out.push({
        id: r.id, kind, folder,
        slug: s("slug"), date: s("date"), time: s("time"), title: s("title"),
        pillar: s("pillar"), hookType: s("hookType"), line: s("line"), format: s("format"), hook: s("hook"),
      });
    }
  }
  return out;
}

/** Minimal RFC-4180 CSV parser (quotes, escaped quotes, newlines in quotes). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f !== "")) rows.push(row);
  return rows;
}

const num = (s: string): number | null => {
  if (s.trim() === "") return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

/** reels/content/_metrics/metrics.csv → rows. Columns are found by header name, so order does not matter. */
export function parseMetrics(text: string): MetricRow[] {
  const [head, ...rows] = parseCsv(text.replace(/^﻿/, ""));
  if (!head) return [];
  const names = head.map((h) => h.trim().toLowerCase());
  const get = (r: string[], name: string): string => r[names.indexOf(name)] ?? "";
  return rows.map((r) => ({
    date: get(r, "date"),
    platform: get(r, "platform"),
    postId: get(r, "post_id"),
    reelId: get(r, "reel_id"),
    title: get(r, "title"),
    url: get(r, "url"),
    views: num(get(r, "views")),
    reach: num(get(r, "reach")),
    likes: num(get(r, "likes")),
    comments: num(get(r, "comments")),
    shares: num(get(r, "shares")),
    saves: num(get(r, "saves")),
    follows: num(get(r, "follows")),
    avgWatchS: num(get(r, "avg_watch_s")),
    completionPct: num(get(r, "completion_pct")),
    hookType: get(r, "hook_type").trim(),
  }));
}

/** Engagement score: (shares + saves + follows) per 1,000 views. null when views are missing. */
export function score(m: Pick<MetricRow, "views" | "shares" | "saves" | "follows">): number | null {
  if (!m.views) return null;
  return Math.round((((m.shares ?? 0) + (m.saves ?? 0) + (m.follows ?? 0)) / m.views) * 10000) / 10;
}

export interface HookWin {
  hookType: string;
  posts: number;
  views: number;
  avgScore: number | null;
  avgWatchS: number | null;
  /** Best-scoring row of this hook type. */
  best: MetricRow | null;
}

const avg = (xs: number[]): number | null => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null);

/** Group rows by hook type, best average score first. Rows without a hook type go to "(no hook type)". */
export function hookWins(rows: MetricRow[]): HookWin[] {
  const groups = new Map<string, MetricRow[]>();
  for (const r of rows) {
    const k = r.hookType || "(no hook type)";
    groups.set(k, [...(groups.get(k) ?? []), r]);
  }
  return [...groups].map(([hookType, rs]) => {
    const scored = rs.filter((r) => score(r) !== null);
    return {
      hookType,
      posts: new Set(rs.map((r) => r.reelId || r.postId || r.title)).size,
      views: rs.reduce((s, r) => s + (r.views ?? 0), 0),
      avgScore: avg(scored.map((r) => score(r) ?? 0)),
      avgWatchS: avg(rs.flatMap((r) => (r.avgWatchS === null ? [] : [r.avgWatchS]))),
      best: [...scored].sort((a, b) => (score(b) ?? 0) - (score(a) ?? 0))[0] ?? null,
    };
  }).sort((a, b) => (b.avgScore ?? -1) - (a.avgScore ?? -1));
}
