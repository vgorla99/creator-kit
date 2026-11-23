// Reads post folders into Items. Folders are the source of truth; nothing is cached on disk.
//
// A post folder is any folder holding post.txt, caption.txt or a video, found at most two levels
// below a stage root (so both 00_Ready/<ID-slug>/ and 00_Ready/<month>/<ID-slug>/ work).
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { parsePlan, parsePostTxt, splitSections } from "../../shared/src/index.ts";
import type { CaptionFile, DashState, Item, ItemType, Media, PlanEntry, Stage } from "../../shared/src/index.ts";
import { CONTENT, STUDIO_OUT } from "./config.ts";

export interface ScannedItem {
  item: Item;
  /** Absolute post folder (dash.json lives here). */
  dir: string;
}

interface Root { stage: Stage; dir: string }

const REAL_ROOTS: Root[] = [
  { stage: "draft", dir: STUDIO_OUT },
  { stage: "ready", dir: join(CONTENT, "00_Ready") },
  { stage: "live", dir: join(CONTENT, "01_Live") },
];
const EXAMPLE = join(CONTENT, "example");
const EXAMPLE_ROOTS: Root[] = [
  { stage: "draft", dir: join(EXAMPLE, "drafts") },
  { stage: "ready", dir: join(EXAMPLE, "00_Ready") },
  { stage: "live", dir: join(EXAMPLE, "01_Live") },
];

const POST_DIR = /^([A-Z]+\d+)-(.+)$/;
const SKIP = new Set(["node_modules", ".git"]);
const isDir = (p: string): boolean => {
  try { return statSync(p).isDirectory(); } catch { return false; }
};
const list = (p: string): string[] => {
  try { return readdirSync(p); } catch { return []; }
};
const isPost = (dir: string): boolean => list(dir).some((f) => f === "post.txt" || f === "caption.txt" || /\.mp4$/i.test(f));

function findPosts(root: string, depth = 0): string[] {
  if (depth > 2 || !isDir(root)) return [];
  if (depth > 0 && isPost(root)) return [root];
  return list(root).filter((f) => !SKIP.has(f) && !f.startsWith(".")).flatMap((f) => findPosts(join(root, f), depth + 1));
}

export function readDash(dir: string): DashState {
  const file = join(dir, "dash.json");
  const empty: DashState = { approved: false, notes: "", editedAt: null };
  if (!existsSync(file)) return empty;
  try {
    const raw = JSON.parse(readFileSync(file, "utf8")) as Partial<DashState>;
    return {
      approved: raw.approved === true,
      notes: typeof raw.notes === "string" ? raw.notes : "",
      editedAt: typeof raw.editedAt === "string" ? raw.editedAt : null,
    };
  } catch {
    return empty;
  }
}

const IMG = /\.(png|jpe?g|webp|svg)$/i;
const NO_PREVIEW = /^(reel-no-music|no-music)\.mp4$/i;

function mediaIn(dir: string): { media: Media; type: ItemType } {
  const files = list(dir);
  const slides = files
    .filter((f) => /^slide-\d+\.(png|jpe?g|webp|svg)$/i.test(f))
    .sort((a, b) => Number(/\d+/.exec(a)?.[0]) - Number(/\d+/.exec(b)?.[0]));
  const videos = files.filter((f) => /\.mp4$/i.test(f) && !NO_PREVIEW.test(f));
  const video = ["final.mp4", "reel.mp4", "video.mp4"].find((f) => videos.includes(f)) ?? videos[0] ?? null;
  const cover = files.find((f) => /^cover\./i.test(f) && IMG.test(f)) ?? files.find((f) => IMG.test(f) && !/^(review|slide-)/i.test(f)) ?? null;
  const type: ItemType = video ? "video" : slides.length ? "carousel" : cover ? "image" : "unknown";
  return {
    media: {
      video,
      cover: cover ?? slides[0] ?? null,
      slides,
      review: files.find((f) => /^review\.(png|jpe?g|svg)$/i.test(f)) ?? null,
      extras: videos.filter((f) => f !== video),
    },
    type,
  };
}

function captionsIn(dir: string): { files: CaptionFile[]; post: ReturnType<typeof parsePostTxt> | null } {
  const names = list(dir);
  const out: CaptionFile[] = [];
  let post: ReturnType<typeof parsePostTxt> | null = null;
  if (names.includes("post.txt")) {
    post = parsePostTxt(readFileSync(join(dir, "post.txt"), "utf8"));
    out.push({ file: "post.txt", sections: post.sections });
  }
  // Plain caption files (trial reels): the whole file is one caption unless it has "── … ──" sections.
  for (const file of names.filter((f) => f === "caption.txt" || /^trial-[A-Z]\.txt$/.test(f)).sort()) {
    const text = readFileSync(join(dir, file), "utf8").replace(/\r\n/g, "\n");
    const { sections } = splitSections(text);
    out.push({ file, sections: sections.length ? sections : [{ name: file === "caption.txt" ? "Caption" : file.replace(".txt", ""), body: text.trim() }] });
  }
  return { files: out, post };
}

/** Plans from reels/content/<folder>/plan.json, keyed by "<id>-<slug>" (= the post folder name `produce` writes). */
export function readPlans(example: boolean): PlanEntry[] {
  return list(CONTENT)
    .filter((f) => (example ? f === "example" : f !== "example") && existsSync(join(CONTENT, f, "plan.json")))
    .flatMap((f) => {
      try { return parsePlan(JSON.parse(readFileSync(join(CONTENT, f, "plan.json"), "utf8")), f); }
      catch { console.warn(`reels/content/${f}/plan.json is not valid JSON; skipped.`); return []; }
    });
}

function toItem(root: Root, dir: string, plans: Map<string, PlanEntry>): ScannedItem {
  const folder = dir.split(sep).pop() ?? dir;
  const m = POST_DIR.exec(folder);
  const { media, type: found } = mediaIn(dir);
  // Not rendered yet: the ID says what it will be (V = video, C = carousel, as in plan.json).
  const type: ItemType = found !== "image" && found !== "unknown" ? found : m?.[1].startsWith("V") ? "video" : m?.[1].startsWith("C") ? "carousel" : found;
  const { files, post } = captionsIn(dir);
  const plan = plans.get(folder) ?? null;
  const planDate = plan?.date ? `${plan.date}${plan.time ? ` ${plan.time}` : ""}` : null;
  const date = post?.date ?? planDate ?? /\d{4}-\d{2}-\d{2}/.exec(folder)?.[0] ?? null;
  const firstLine = files[0]?.sections[0]?.body.split("\n")[0] ?? "";
  const rel = relative(root.dir, dir).split(sep).join("/");
  return {
    dir,
    item: {
      key: `${root.stage}/${rel}`,
      stage: root.stage,
      folder,
      code: post?.code || m?.[1] || folder,
      slug: m?.[2] ?? folder,
      type,
      title: post?.title || plan?.title || firstLine || folder,
      date,
      month: (date ?? statSync(dir).mtime.toISOString()).slice(0, 7),
      aiLabel: post?.aiLabel ?? null,
      header: post?.header ?? [],
      captionFiles: files,
      media,
      plan,
      dash: readDash(dir),
    },
  };
}

export interface Scan {
  example: boolean;
  items: ScannedItem[];
  plans: PlanEntry[];
}

/** Your own posts; if there are none yet (or DASH_EXAMPLE=1), the example posts in reels/content/example. */
export function scanAll(): Scan {
  const run = (roots: Root[], example: boolean): Scan => {
    const plans = readPlans(example);
    const byFolder = new Map(plans.filter((p) => p.slug).map((p) => [`${p.id}-${p.slug}`, p]));
    const items = roots.flatMap((r) => findPosts(r.dir).map((d) => toItem(r, d, byFolder)));
    items.sort((a, b) => (b.item.date ?? b.item.month).localeCompare(a.item.date ?? a.item.month));
    return { example, items, plans };
  };
  if (process.env.DASH_EXAMPLE !== "1") {
    const own = run(REAL_ROOTS, false);
    if (own.items.length) return own;
  }
  return run(EXAMPLE_ROOTS, true);
}
