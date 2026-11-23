// Types shared by server and web. No runtime code here.

/** Where a post folder lives: draft = studio render (studio-remotion/out), ready = content/00_Ready, live = content/01_Live. */
export type Stage = "draft" | "ready" | "live";

export interface Section {
  name: string;
  body: string;
}

export interface ParsedPost {
  code: string;
  title: string;
  /** "YYYY-MM-DD HH:MM" or "YYYY-MM-DD", or null */
  date: string | null;
  /** Header lines before the first "── Name ──" section (Date, AI label, Cover …), raw. */
  header: string[];
  /** true = turn the AI label on, false = not needed, null = not stated */
  aiLabel: boolean | null;
  sections: Section[];
}

export interface DashState {
  approved: boolean;
  notes: string;
  editedAt: string | null;
}

export interface PlanEntry {
  id: string;
  kind: "video" | "carousel";
  /** Folder in reels/content that holds the plan.json (e.g. "2026-01" or "example"). */
  folder: string;
  slug?: string;
  date?: string;
  time?: string;
  title?: string;
  pillar?: string;
  hookType?: string;
  line?: string;
  format?: string;
  hook?: string;
}

export interface MetricRow {
  date: string;
  platform: string;
  postId: string;
  /** Post folder name ("V02-pinch-pot-crack") or post ID ("V02"). */
  reelId: string;
  title: string;
  url: string;
  views: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  follows: number | null;
  avgWatchS: number | null;
  completionPct: number | null;
  hookType: string;
}

export type ItemType = "video" | "carousel" | "image" | "unknown";

export interface Media {
  video: string | null;
  cover: string | null;
  slides: string[];
  review: string | null;
  /** Other videos in the folder (e.g. reel-trial-B.mp4, final.mp4 next to video.mp4). */
  extras: string[];
}

export interface CaptionFile {
  file: string;
  sections: Section[];
}

export interface Item {
  /** Unique: "<stage>/<path below the stage root>", e.g. "ready/V05-glaze-without-kiln". */
  key: string;
  stage: Stage;
  /** Post folder name, e.g. "V05-glaze-without-kiln". */
  folder: string;
  code: string;
  slug: string;
  type: ItemType;
  title: string;
  date: string | null;
  /** YYYY-MM of the date (or of the folder's last change). */
  month: string;
  aiLabel: boolean | null;
  header: string[];
  captionFiles: CaptionFile[];
  /** Media paths relative to the item folder (served via /api/media). */
  media: Media;
  plan: PlanEntry | null;
  dash: DashState;
}

export interface BrandInfo {
  name: string;
  handle: string;
  colors: { dark: string; light: string; primary: string; secondary: string; tertiary: string };
  timezone: string;
  hookTypes: string[];
  provider: string;
  /** true when no posts of your own exist yet and the dashboard shows reels/content/example. */
  example: boolean;
  /** true when POSTIZ_API_KEY is set on the server (the key itself never leaves the server). */
  postiz: boolean;
}

export type PostizState = "QUEUE" | "PUBLISHED" | "ERROR" | "DRAFT" | string;

export interface PostizPost {
  id: string;
  channel: string;
  publishDate: string;
  state: PostizState;
  error: string | null;
  releaseURL: string | null;
  content: string;
  /** Item key this post belongs to (matched on the first caption line). */
  itemKey: string | null;
}

export interface PostizMetric {
  label: string;
  total: number | null;
  change: number | null;
}

export interface PostizChannel {
  id: string;
  name: string;
  identifier: string;
  picture: string | null;
  disabled: boolean;
  metrics: PostizMetric[];
  error: string | null;
}

/** Postiz answers: either data, or why there is none. Never contains the key. */
export type PostizResult<T> = { connected: false } | { connected: true; error: string } | { connected: true; data: T };

// ── Style tab (format of reels/style/round.json, see reels/style/README.md)
export type Verdict = "keep" | "maybe" | "drop" | "";

export interface StyleSection {
  id: string;
  name: string;
  use?: string;
  order?: number;
}

export interface StyleCard {
  id: string;
  section: string;
  label: string;
  desc?: string;
  /** Path relative to reels/style/ (e.g. "media/r1-01a.mp4"), shown muted on loop in the grid. */
  preview?: string;
  /** Full-quality file (with sound) for the big view. Falls back to preview. */
  full?: string;
  source?: string;
  aspect?: string;
  locked?: boolean;
  order?: number;
  /** Example round only: a CSS-drawn preview ("pop" | "slide" | "typed"). */
  demo?: string;
}

export interface StyleRound {
  round: { title: string; round: string; intro?: string; notes?: string[]; aspect?: string };
  sections: StyleSection[];
  cards: StyleCard[];
}

export interface StyleRating {
  v: Verdict;
  note: string;
  at: number;
}

export interface StyleData {
  example: boolean;
  data: StyleRound;
  ratings: Record<string, StyleRating>;
}
