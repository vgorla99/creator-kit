// Postiz, read-only. Only GET requests; this server never posts, schedules or deletes anything.
// The API key is read from .env here and never leaves this process (not in responses, not in logs).
import type { PostizChannel, PostizMetric, PostizPost, PostizResult } from "../../shared/src/index.ts";
import { POSTIZ_KEY, POSTIZ_URL } from "./config.ts";

const TTL_MS = 60_000;
const cache = new Map<string, { at: number; value: unknown }>();

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${POSTIZ_URL}/public/v1${path}`, {
    method: "GET",
    headers: { Authorization: POSTIZ_KEY, Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  // Only the status code goes back to the browser: Postiz error bodies could echo request details.
  if (res.status === 401 || res.status === 403) throw new Error("Postiz refused the API key (check POSTIZ_API_KEY in .env)");
  if (!res.ok) throw new Error(`Postiz answered ${res.status}`);
  return (await res.json()) as T;
}

async function cached<T>(key: string, fresh: boolean, load: () => Promise<T>): Promise<PostizResult<T>> {
  if (!POSTIZ_KEY) return { connected: false };
  const hit = cache.get(key);
  if (!fresh && hit && Date.now() - hit.at < TTL_MS) return { connected: true, data: hit.value as T };
  try {
    const value = await load();
    cache.set(key, { at: Date.now(), value });
    return { connected: true, data: value };
  } catch (e) {
    const msg = e instanceof Error && e.name !== "TypeError" ? e.message : "Postiz could not be reached (check POSTIZ_API_URL in .env)";
    return { connected: true, error: e instanceof Error && e.name === "TimeoutError" ? "Postiz did not answer in 15 s" : msg };
  }
}

interface RawIntegration { id: string; name?: string; identifier?: string; picture?: string | null; disabled?: boolean }
interface RawPost {
  id: string; content?: string; publishDate: string; state: string; error?: string | null; releaseURL?: string | null;
  integration?: { id: string; name?: string; providerIdentifier?: string };
}
interface RawAnalytics { label?: string; data?: { total?: string | number; date?: string }[]; percentageChange?: number }

const strip = (t: string): string => t.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/** Posts from 90 days back to 45 days ahead. `match` links a post to an item key by its caption. */
export function posts(fresh: boolean, match: (content: string) => string | null): Promise<PostizResult<PostizPost[]>> {
  const from = new Date(Date.now() - 90 * 864e5).toISOString();
  const to = new Date(Date.now() + 45 * 864e5).toISOString();
  return cached(`posts|${from.slice(0, 10)}`, fresh, async () => {
    const j = await get<{ posts?: RawPost[] } | RawPost[]>(`/posts?startDate=${encodeURIComponent(from)}&endDate=${encodeURIComponent(to)}`);
    const raw = Array.isArray(j) ? j : j.posts ?? [];
    return raw
      .map((p) => {
        const content = strip(p.content ?? "");
        return {
          id: p.id,
          channel: p.integration?.name ?? p.integration?.providerIdentifier ?? "?",
          publishDate: p.publishDate,
          state: p.state,
          error: p.error ?? null,
          releaseURL: p.releaseURL?.startsWith("https://") ? p.releaseURL : null,
          content: content.slice(0, 400),
          itemKey: match(content),
        };
      })
      .sort((a, b) => a.publishDate.localeCompare(b.publishDate));
  });
}

const toNum = (v: string | number | undefined): number | null => {
  const n = typeof v === "number" ? v : Number(v);
  return v === undefined || v === "" || !Number.isFinite(n) ? null : n;
};

/** Channels with their last-30-day metrics (followers, impressions … whatever the platform reports). */
export function analytics(fresh: boolean): Promise<PostizResult<PostizChannel[]>> {
  return cached("analytics", fresh, async () => {
    const integrations = await get<RawIntegration[]>("/integrations");
    return Promise.all(integrations.map(async (i): Promise<PostizChannel> => {
      const base = { id: i.id, name: i.name ?? "?", identifier: i.identifier ?? "", picture: i.picture?.startsWith("https://") ? i.picture : null, disabled: i.disabled === true };
      if (base.disabled) return { ...base, metrics: [], error: null };
      try {
        const rows = await get<RawAnalytics[]>(`/analytics/${encodeURIComponent(i.id)}?date=30`);
        const metrics: PostizMetric[] = (Array.isArray(rows) ? rows : []).map((r) => {
          const data = r.data ?? [];
          // "Followers"-like series are levels (take the last value); the rest are per-day counts (sum them).
          const level = /follower|subscriber|fans/i.test(r.label ?? "");
          const values = data.map((d) => toNum(d.total)).filter((n): n is number => n !== null);
          const total = values.length ? (level ? values[values.length - 1] : values.reduce((a, b) => a + b, 0)) : null;
          return { label: r.label ?? "?", total, change: typeof r.percentageChange === "number" ? r.percentageChange : null };
        });
        return { ...base, metrics, error: null };
      } catch (e) {
        return { ...base, metrics: [], error: e instanceof Error ? e.message : "no analytics" };
      }
    }));
  });
}
