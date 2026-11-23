import type {
  BrandInfo, DashState, Item, MetricRow, PlanEntry, PostizChannel, PostizPost, PostizResult, StyleData, StyleRating, Verdict,
} from "../../shared/src/index.ts";

export type Metric = MetricRow & { itemKey: string | null };

async function json<T>(res: Response): Promise<T> {
  const body = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
  return body as T;
}
const get = <T,>(url: string): Promise<T> => fetch(url).then((r) => json<T>(r));
const send = <T,>(method: "PUT" | "POST", url: string, data: unknown): Promise<T> =>
  fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(data) }).then((r) => json<T>(r));
const k = (key: string): string => `key=${encodeURIComponent(key)}`;

export const api = {
  brand: (): Promise<BrandInfo> => get("/api/brand"),
  items: (): Promise<Item[]> => get("/api/items"),
  plans: (): Promise<PlanEntry[]> => get("/api/plans"),
  metrics: (): Promise<Metric[]> => get("/api/metrics"),
  postizPosts: (fresh = false): Promise<PostizResult<PostizPost[]>> => get(`/api/postiz/posts${fresh ? "?fresh=1" : ""}`),
  postizAnalytics: (fresh = false): Promise<PostizResult<PostizChannel[]>> => get(`/api/postiz/analytics${fresh ? "?fresh=1" : ""}`),
  saveCaption: (key: string, file: string, section: string, text: string): Promise<Item> => send("PUT", `/api/caption?${k(key)}`, { file, section, text }),
  saveDash: (key: string, patch: Partial<Pick<DashState, "approved" | "notes">>): Promise<DashState> => send("PUT", `/api/dash?${k(key)}`, patch),
  style: (): Promise<StyleData> => get("/api/style"),
  rate: (card: string, v: Verdict, note: string): Promise<StyleRating> => send("PUT", "/api/style/rating", { card, v, note }),
  submitStyle: (overall: string): Promise<{ rated: number; file: string }> => send("POST", "/api/style/submit", { overall }),
};

export const mediaUrl = (key: string, file: string): string => `/api/media?${k(key)}&f=${encodeURIComponent(file)}`;
export const styleUrl = (file: string): string => `/api/style/media?f=${encodeURIComponent(file)}`;

/** Postiz posts per item key. */
export function postizByItem(posts: PostizPost[]): Map<string, PostizPost[]> {
  const map = new Map<string, PostizPost[]>();
  for (const p of posts) if (p.itemKey) map.set(p.itemKey, [...(map.get(p.itemKey) ?? []), p]);
  return map;
}

export type PostState = "ERROR" | "QUEUE" | "PUBLISHED" | "NONE";
/** Overall state of an item from its Postiz posts: ERROR beats QUEUE beats PUBLISHED. */
export function overallState(posts: PostizPost[] | undefined): PostState {
  if (!posts?.length) return "NONE";
  if (posts.some((p) => p.state === "ERROR" || p.error)) return "ERROR";
  if (posts.some((p) => p.state === "QUEUE")) return "QUEUE";
  return "PUBLISHED";
}

/** Formatting in the brand's timezone (brand.yaml posting.timezone). */
export const fmt = {
  tz: "UTC",
  when: (iso: string): string =>
    new Date(iso).toLocaleString("en-GB", { timeZone: fmt.tz, day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
  day: (iso: string): string => new Date(iso).toLocaleDateString("en-CA", { timeZone: fmt.tz }),
  time: (iso: string): string => new Date(iso).toLocaleTimeString("en-GB", { timeZone: fmt.tz, hour: "2-digit", minute: "2-digit" }),
};
