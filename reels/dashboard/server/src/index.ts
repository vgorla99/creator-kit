// Creator Kit dashboard API. Local only (127.0.0.1). Reads post folders, streams media, saves
// captions / notes / approvals / style ratings, reads Postiz (GET only, key stays on this server).
import { copyFileSync, createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { Readable } from "node:stream";
import { Hono } from "hono";
import type { Context } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { parseMetrics, replaceSection } from "../../shared/src/index.ts";
import type { BrandInfo, DashState, MetricRow, StyleData, StyleRating, StyleRound, Verdict } from "../../shared/src/index.ts";
import { APP, BACKUP_DIR, CONTENT, HOST, PORT, POSTIZ_KEY, STYLE_DIR, readBrand } from "./config.ts";
import { analytics, posts } from "./postiz.ts";
import { readDash, scanAll } from "./scan.ts";
import type { Scan, ScannedItem } from "./scan.ts";
import { EXAMPLE_ROUND } from "./style-example.ts";

const SCAN_TTL_MS = 3_000;
let scanCache: { at: number; scan: Scan } | null = null;
function scan(): Scan {
  if (scanCache && Date.now() - scanCache.at < SCAN_TTL_MS) return scanCache.scan;
  scanCache = { at: Date.now(), scan: scanAll() };
  return scanCache.scan;
}
const forget = (): void => { scanCache = null; };

function findItem(c: Context): ScannedItem | Response {
  const key = c.req.query("key");
  return scan().items.find((s) => s.item.key === key) ?? c.json({ error: "unknown post" }, 404);
}
/** Resolve a path inside `base`; null if it escapes. */
function inside(base: string, rel: string): string | null {
  const full = resolve(base, rel);
  return full === base || full.startsWith(base + sep) ? full : null;
}
async function body<T>(c: Context): Promise<Partial<T> | null> {
  const b: unknown = await c.req.json().catch(() => null);
  return typeof b === "object" && b !== null && !Array.isArray(b) ? (b as Partial<T>) : null;
}

const app = new Hono();

// DNS-rebinding / cross-site guard: only localhost hosts; writes only from a localhost origin, as JSON.
const LOCAL = new Set(["localhost", "127.0.0.1"]);
const hostName = (h: string): string => h.replace(/:\d+$/, "").toLowerCase();
app.use("*", async (c, next) => {
  if (!LOCAL.has(hostName(c.req.header("host") ?? ""))) return c.text("Forbidden host", 403);
  if (c.req.method !== "GET" && c.req.method !== "HEAD") {
    const origin = c.req.header("origin");
    let ok = false;
    try { ok = !origin || LOCAL.has(new URL(origin).hostname); } catch { ok = false; }
    if (!ok || !(c.req.header("content-type") ?? "").includes("application/json")) return c.text("Forbidden origin", 403);
  }
  await next();
});

app.get("/api/brand", (c) => c.json({ ...readBrand(), example: scan().example, postiz: Boolean(POSTIZ_KEY) } satisfies BrandInfo));
app.get("/api/items", (c) => c.json(scan().items.map((s) => s.item)));
app.get("/api/plans", (c) => c.json(scan().plans));

// ── media (Range support so <video> can seek)
const MIME: Record<string, string> = {
  ".mp4": "video/mp4", ".webm": "video/webm", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".svg": "image/svg+xml", ".mp3": "audio/mpeg", ".gif": "image/gif",
};
function sendFile(c: Context, file: string | null): Response {
  const type = file ? MIME[extname(file).toLowerCase()] : undefined;
  if (!file || !type || !existsSync(file)) return c.json({ error: "no such file" }, 404);
  const size = statSync(file).size;
  // SVGs could carry script; this CSP stops it from running if one is opened directly.
  const headers: Record<string, string> = { "Content-Type": type, "Accept-Ranges": "bytes", "Cache-Control": "no-cache", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data:" };
  const m = /^bytes=(\d*)-(\d*)$/.exec(c.req.header("range") ?? "");
  if (!m || (!m[1] && !m[2])) {
    return new Response(Readable.toWeb(createReadStream(file)) as ReadableStream, { headers: { ...headers, "Content-Length": String(size) } });
  }
  const start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
  const end = m[1] && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
  if (start >= size || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  return new Response(Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream, {
    status: 206,
    headers: { ...headers, "Content-Length": String(end - start + 1), "Content-Range": `bytes ${start}-${end}/${size}` },
  });
}
app.get("/api/media", (c) => {
  const r = findItem(c);
  return r instanceof Response ? r : sendFile(c, inside(r.dir, c.req.query("f") ?? ""));
});

// ── caption save: replace one section (or the whole file for plain caption files). Backup first.
function backup(itemKey: string, rel: string, abs: string): void {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dest = join(BACKUP_DIR, itemKey.replace(/[\\/:]/g, "_"), `${rel.replace(/[\\/:]/g, "_")}.${stamp}.bak`);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(abs, dest);
}
function writeDash(dir: string, patch: Partial<DashState>): DashState {
  const next: DashState = { ...readDash(dir), ...patch, editedAt: new Date().toISOString() };
  writeFileSync(join(dir, "dash.json"), JSON.stringify(next, null, 2) + "\n", "utf8");
  return next;
}
app.put("/api/caption", async (c) => {
  const r = findItem(c);
  if (r instanceof Response) return r;
  const b = await body<{ file: unknown; section: unknown; text: unknown }>(c);
  if (!b || typeof b.file !== "string" || typeof b.text !== "string") return c.json({ error: "file and text required" }, 400);
  if (b.text.length > 20_000) return c.json({ error: "text too long" }, 400);
  const entry = r.item.captionFiles.find((f) => f.file === b.file);
  const path = entry ? inside(r.dir, entry.file) : null;
  if (!entry || !path) return c.json({ error: "not a caption file of this post" }, 400);

  const old = readFileSync(path, "utf8");
  let next: string;
  try {
    if (/^── .+ ──\s*$/m.test(old)) {
      if (typeof b.section !== "string") return c.json({ error: "section required" }, 400);
      next = replaceSection(old, b.section, b.text);
    } else {
      const t = b.text.trim() + "\n";
      next = old.includes("\r\n") ? t.replace(/\r?\n/g, "\r\n") : t;
    }
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : "edit failed" }, 400);
  }
  if (next !== old) {
    backup(r.item.key, entry.file, path);
    writeFileSync(path, next, "utf8");
    writeDash(r.dir, {});
  }
  forget();
  return c.json(scan().items.find((s) => s.item.key === r.item.key)?.item ?? null);
});

app.put("/api/dash", async (c) => {
  const r = findItem(c);
  if (r instanceof Response) return r;
  const b = await body<{ approved: unknown; notes: unknown }>(c);
  if (!b) return c.json({ error: "json body required" }, 400);
  const patch: Partial<DashState> = {};
  if (typeof b.approved === "boolean") patch.approved = b.approved;
  if (typeof b.notes === "string") {
    if (b.notes.length > 10_000) return c.json({ error: "notes too long" }, 400);
    patch.notes = b.notes;
  }
  const dash = writeDash(r.dir, patch);
  forget();
  return c.json(dash);
});

// ── metrics.csv (example mode reads the example numbers)
app.get("/api/metrics", (c) => {
  const s = scan();
  const file = s.example ? join(CONTENT, "example", "metrics.csv") : join(CONTENT, "_metrics", "metrics.csv");
  if (!existsSync(file)) return c.json([]);
  const byId = new Map<string, ScannedItem>();
  for (const it of s.items) {
    byId.set(it.item.folder, it);
    if (!byId.has(it.item.code)) byId.set(it.item.code, it);
  }
  const rows = parseMetrics(readFileSync(file, "utf8")).map((m): MetricRow & { itemKey: string | null } => {
    const it = byId.get(m.reelId.trim());
    // No hook type in the CSV row: fall back to the plan entry of the matched post.
    return { ...m, hookType: m.hookType || it?.item.plan?.hookType || "", itemKey: it?.item.key ?? null };
  });
  return c.json(rows);
});

// ── Postiz (read-only)
function captionMatcher(): (content: string) => string | null {
  const norm = (t: string): string => t.replace(/\s+/g, " ").trim().toLowerCase().slice(0, 60);
  const heads: [string, string][] = [];
  for (const s of scan().items) for (const f of s.item.captionFiles) for (const sec of f.sections) {
    const head = norm(sec.body.split("\n")[0] ?? "");
    if (head.length >= 15) heads.push([head, s.item.key]);
  }
  return (content) => {
    const c = norm(content);
    return heads.find(([h]) => c.startsWith(h))?.[1] ?? null;
  };
}
app.get("/api/postiz/posts", async (c) => c.json(await posts(c.req.query("fresh") === "1", captionMatcher())));
app.get("/api/postiz/analytics", async (c) => c.json(await analytics(c.req.query("fresh") === "1")));

// ── Style tab: reels/style/round.json (written by Claude) + ratings.json + submissions/
const ROUND_FILE = join(STYLE_DIR, "round.json");
const RATINGS_FILE = join(STYLE_DIR, "ratings.json");
const VERDICTS: Verdict[] = ["keep", "maybe", "drop", ""];

function readRound(): StyleRound | null {
  if (!existsSync(ROUND_FILE)) return null;
  try {
    const r = JSON.parse(readFileSync(ROUND_FILE, "utf8")) as Partial<StyleRound>;
    if (!r.round || !Array.isArray(r.sections) || !Array.isArray(r.cards)) throw new Error("needs round, sections and cards");
    return { round: r.round, sections: r.sections, cards: r.cards };
  } catch (e) {
    console.warn(`reels/style/round.json skipped: ${e instanceof Error ? e.message : "invalid"}`);
    return null;
  }
}
function readRatings(): Record<string, StyleRating> {
  try { return JSON.parse(readFileSync(RATINGS_FILE, "utf8")) as Record<string, StyleRating>; } catch { return {}; }
}
app.get("/api/style", (c) => {
  const round = readRound();
  return c.json({ example: !round, data: round ?? EXAMPLE_ROUND, ratings: round ? readRatings() : {} } satisfies StyleData);
});
app.get("/api/style/media", (c) => sendFile(c, inside(STYLE_DIR, c.req.query("f") ?? "")));
app.put("/api/style/rating", async (c) => {
  const round = readRound();
  if (!round) return c.json({ error: "example round: ratings stay in this browser" }, 409);
  const b = await body<{ card: unknown; v: unknown; note: unknown }>(c);
  const v = VERDICTS.find((x) => x === b?.v);
  if (!b || typeof b.card !== "string" || v === undefined || typeof b.note !== "string") return c.json({ error: "card, v and note required" }, 400);
  if (!round.cards.some((x) => x.id === b.card)) return c.json({ error: "unknown card" }, 400);
  if (b.note.length > 5_000) return c.json({ error: "note too long" }, 400);
  const ratings = { ...readRatings(), [b.card]: { v, note: b.note, at: Date.now() } };
  mkdirSync(STYLE_DIR, { recursive: true });
  writeFileSync(RATINGS_FILE, JSON.stringify(ratings, null, 2) + "\n", "utf8");
  return c.json(ratings[b.card]);
});
app.post("/api/style/submit", async (c) => {
  const round = readRound();
  if (!round) return c.json({ error: "example round: nothing to submit" }, 409);
  const b = await body<{ overall: unknown }>(c);
  const overall = typeof b?.overall === "string" ? b.overall.slice(0, 10_000).trim() : "";
  const ratings = readRatings();
  const notes = Object.fromEntries(round.cards.filter((x) => ratings[x.id]).map((x) => [x.id, { label: x.label, section: x.section, ...ratings[x.id] }]));
  const at = Date.now();
  const file = join(STYLE_DIR, "submissions", `round-${String(round.round.round).replace(/[^\w-]/g, "_")}-${at}.json`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify({ at, round: round.round.round, rated: Object.keys(notes).length, overall, notes }, null, 2) + "\n", "utf8");
  return c.json({ rated: Object.keys(notes).length, file: relative(STYLE_DIR, file).split(sep).join("/") });
});

app.all("/api/*", (c) => c.json({ error: "not found" }, 404));

// ── web UI (built by `vite build`)
const dist = join(APP, "web", "dist");
app.use("/*", serveStatic({ root: relative(process.cwd(), dist) }));
app.get("*", (c) => (existsSync(join(dist, "index.html")) ? c.html(readFileSync(join(dist, "index.html"), "utf8")) : c.text("The web UI is not built yet. Run: npm start", 404)));

serve({ fetch: app.fetch, port: PORT, hostname: HOST }, (info) => {
  const s = scan();
  console.log(`\nCreator Kit dashboard → http://localhost:${info.port}`);
  console.log(`  ${s.items.length} posts${s.example ? " (example content: render your own and they replace it)" : ""} · Postiz ${POSTIZ_KEY ? "connected" : "not connected"}`);
  console.log("  Press Ctrl+C to stop.\n");
});
