// Free B-roll sources: Pexels, Pixabay, Wikimedia Commons. Each source turns
// its API's answer into the same "candidate" shape, so search, preview and
// download work the same for all three. Used by scripts/broll.mjs.
//
// Terms (checked 2026-11-23; re-check before changing the licence lines):
//   Pexels    https://www.pexels.com/license/  free, credit not required, no implied endorsement.
//             API: show a link to Pexels with results, credit creators when possible, 200 req/h, 20,000/month.
//   Pixabay   https://pixabay.com/service/license-summary/  free, credit not required, no standalone resale,
//             no trademarks/logos in commercial use, nothing immoral with recognisable people.
//             API: show where results come from, download files (no hotlinking), cache results 24 h, ~100 req/min.
//   Wikimedia https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia  every file has its
//             own licence. CC BY / CC BY-SA need author + licence (+ link) in the credit; CC0 / public domain don't.
//             Other rights (personality, trademark) can still apply: see `restrictions`.
//             API: descriptive User-Agent, one request at a time, no key.
//
// candidate = { source, id, kind, title, width, height, duration, author, authorUrl, page,
//               license, licenseUrl, attributionRequired, restrictions, credit,
//               preview: { frames: [url] } | { video: url }, file: { url, ext } | null }

import { env } from "./media.mjs";

// Wikimedia's User-Agent policy wants a client name plus contact info; upload.wikimedia.org
// answers 429 without it. The contact is the kit's public homepage, never the creator's details.
export const UA = "CreatorKit-broll-scout/1.0 (https://github.com/vgorla99/creator-kit) node-fetch";
const TARGET_W = 1080; // portrait reels: closest-to-1080-wide file wins

export const SOURCES = {
  pexels: { key: "PEXELS_API_KEY", signup: "https://www.pexels.com/api/", home: "https://www.pexels.com" },
  pixabay: { key: "PIXABAY_API_KEY", signup: "https://pixabay.com/api/docs/", home: "https://pixabay.com" },
  wikimedia: { key: null, signup: null, home: "https://commons.wikimedia.org" },
};

// Plain-English note for a source that needs a key nobody has set yet (null = ready).
export function missingKey(source) {
  const s = SOURCES[source];
  if (!s.key || env(s.key)) return null;
  const name = source[0].toUpperCase() + source.slice(1);
  return [
    `${name} needs a free API key, and there isn't one yet.`,
    `  1. Make a free account and get your key at ${s.signup}`,
    `  2. Open the file called .env in your Creator Kit folder (copy .env.example to .env if it isn't there).`,
    `  3. Add a line: ${s.key}=your-key-here   then save and run this again.`,
    `  Wikimedia Commons works without a key: add --from wikimedia`,
  ].join("\n");
}

async function getJson(url, headers = {}) {
  const res = await fetch(url, { headers: { "User-Agent": UA, ...headers } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} from ${new URL(url).host}: ${(await res.text()).slice(0, 160)}`);
  return { data: await res.json(), headers: res.headers };
}

const stripHtml = (s) =>
  String(s ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// ---------- Pexels ----------

// Portrait mp4 closest to 1080 wide, 30 fps or less preferred.
export function pexelsFile(video) {
  const files = video.video_files.filter((f) => f.file_type === "video/mp4" && f.height > f.width && f.width >= 720);
  const score = (f) => Math.abs(f.width - TARGET_W) + (f.fps > 31 ? 500 : 0);
  return files.sort((a, b) => score(a) - score(b))[0] ?? null;
}

export function fromPexels(v) {
  const f = pexelsFile(v);
  const pics = v.video_pictures.filter((_, i, all) => [0, Math.floor(all.length / 2), all.length - 1].includes(i));
  return {
    source: "pexels",
    id: String(v.id),
    kind: "video",
    title: v.url.split("/").filter(Boolean).pop().replace(/-\d+$/, ""),
    width: f?.width ?? v.width,
    height: f?.height ?? v.height,
    duration: v.duration,
    author: v.user.name,
    authorUrl: v.user.url,
    page: v.url,
    license: "Pexels License",
    licenseUrl: "https://www.pexels.com/license/",
    attributionRequired: false,
    restrictions: "",
    credit: `Video by ${v.user.name} on Pexels (${v.url})`,
    preview: { frames: [...new Set(pics.map((p) => p.picture))] },
    file: f ? { url: f.link, ext: ".mp4" } : null,
  };
}

async function pexels(path) {
  const { data, headers } = await getJson(`https://api.pexels.com${path}`, { Authorization: env("PEXELS_API_KEY") });
  const left = headers.get("x-ratelimit-remaining");
  if (left !== null && Number(left) < 50) console.warn(`! Pexels quota low: ${left} requests left this month`);
  return data;
}

// Pexels is the only source with an orientation filter, so it only returns portrait clips.
async function searchPexels(query, { n, page }) {
  const q = new URLSearchParams({ query, orientation: "portrait", size: "medium", per_page: String(n), page: String(page) });
  return (await pexels(`/videos/search?${q}`)).videos.map(fromPexels);
}

const getPexels = async (id) => fromPexels(await pexels(`/videos/videos/${encodeURIComponent(id)}`));

// ---------- Pixabay ----------

export function fromPixabay(h) {
  const f = [h.videos.large, h.videos.medium, h.videos.small].find((x) => x?.url);
  return {
    source: "pixabay",
    id: String(h.id),
    kind: "video",
    title: h.tags,
    width: f?.width ?? 0,
    height: f?.height ?? 0,
    duration: h.duration,
    author: h.user,
    authorUrl: `https://pixabay.com/users/${h.user}-${h.user_id}/`,
    page: h.pageURL,
    license: "Pixabay Content License",
    licenseUrl: "https://pixabay.com/service/license-summary/",
    attributionRequired: false,
    restrictions: "",
    credit: `Video by ${h.user} on Pixabay (${h.pageURL})`,
    preview: h.videos.tiny?.url ? { video: h.videos.tiny.url } : { frames: [f?.thumbnail].filter(Boolean) },
    file: f ? { url: f.url, ext: ".mp4" } : null,
  };
}

async function pixabay(params) {
  const q = new URLSearchParams({ key: env("PIXABAY_API_KEY"), safesearch: "true", ...params });
  const { data, headers } = await getJson(`https://pixabay.com/api/videos/?${q}`);
  const left = headers.get("x-ratelimit-remaining");
  if (left !== null && Number(left) < 10) console.warn(`! Pixabay rate limit close: ${left} requests left this minute`);
  return data.hits.map(fromPixabay);
}

// Pixabay wants per_page between 3 and 200, and a query of at most 100 characters.
const searchPixabay = (query, { n, page }) =>
  pixabay({ q: query.slice(0, 100), per_page: String(Math.min(200, Math.max(3, n))), page: String(page) });

async function getPixabay(id) {
  const [hit] = await pixabay({ id });
  if (!hit) throw new Error(`no Pixabay video with id ${id}`);
  return hit;
}

// ---------- Wikimedia Commons ----------

// Largest VP9 WebM transcode up to 1080 high, else the original if it is already webm/mp4.
export function wikimediaFile(ii, derivatives) {
  const webm = derivatives.filter((d) => d.type.startsWith("video/webm") && d.type.includes("vp9") && d.height <= 1080);
  const best = webm.sort((a, b) => b.height - a.height)[0];
  if (best) return { url: best.src, ext: ".webm", width: best.width, height: best.height };
  const ext = { "video/webm": ".webm", "video/mp4": ".mp4" }[ii.mime];
  return ext ? { url: ii.url.split("?")[0], ext, width: ii.width, height: ii.height } : null;
}

export function fromWikimedia(p) {
  const ii = p.imageinfo?.[0];
  if (!ii) return null;
  const meta = (k) => stripHtml(ii.extmetadata?.[k]?.value);
  const license = meta("LicenseShortName");
  if (!license || meta("NonFree") === "true") return null; // no clear free licence: skip it
  const kind = ii.mediatype === "VIDEO" ? "video" : "image";
  const attributionRequired = meta("AttributionRequired") !== "false";
  const author = meta("Artist") || meta("Credit") || "unknown author";
  const title = meta("ObjectName") || p.title.replace(/^File:/, "");
  const licenseUrl = meta("LicenseUrl");
  const page = ii.descriptionurl;
  const derivatives = p.videoinfo?.[0]?.derivatives ?? [];
  const small = derivatives.filter((d) => d.height <= 360).sort((a, b) => a.height - b.height)[0];
  const thumb = ii.thumburl?.split("?")[0];
  const video = kind === "video" ? wikimediaFile(ii, derivatives) : null; // size shown = size you get
  return {
    source: "wikimedia",
    id: String(p.pageid),
    kind,
    title,
    width: video?.width ?? ii.width,
    height: video?.height ?? ii.height,
    duration: kind === "video" ? Number(Number(ii.duration ?? 0).toFixed(1)) : 0,
    author,
    authorUrl: "",
    page,
    license,
    licenseUrl,
    attributionRequired,
    restrictions: meta("Restrictions").replace(/\|/g, ", "),
    // CC 4.0 asks you to say the work was changed; reels always trim and crop.
    credit: attributionRequired
      ? `"${title}" by ${author}, ${license}${licenseUrl ? ` (${licenseUrl})` : ""}, via Wikimedia Commons (${page}), edited`
      : `"${title}" by ${author} (${license}), via Wikimedia Commons (${page})`,
    preview: kind === "video" && small ? { video: small.src } : { frames: [thumb].filter(Boolean) },
    file: kind === "video" ? video : thumb ? { url: thumb, ext: thumb.match(/\.\w+$/)?.[0].toLowerCase() ?? ".jpg" } : null,
  };
}

async function wikimedia(params, thumbWidth) {
  const q = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "imageinfo|videoinfo",
    iiprop: "url|size|mime|mediatype|extmetadata",
    iiextmetadatafilter: "ObjectName|Artist|Credit|LicenseShortName|LicenseUrl|AttributionRequired|NonFree|Restrictions",
    iiurlwidth: String(thumbWidth),
    viprop: "derivatives",
    maxlag: "5",
    ...params,
  });
  const { data } = await getJson(`https://commons.wikimedia.org/w/api.php?${q}`);
  if (data.error) throw new Error(`Wikimedia: ${data.error.info}`);
  return (data.query?.pages ?? []).sort((a, b) => (a.index ?? 0) - (b.index ?? 0)).map(fromWikimedia).filter(Boolean);
}

const searchWikimedia = (query, { n, page, kind }) =>
  wikimedia(
    {
      generator: "search",
      gsrnamespace: "6",
      gsrsearch: `${query} filetype:${kind === "image" ? "bitmap" : "video"}`,
      gsrlimit: String(Math.min(50, n)),
      gsroffset: String((page - 1) * n),
    },
    240,
  );

async function getWikimedia(id) {
  const [c] = await wikimedia({ pageids: String(id) }, 1920); // stills: a 1920-wide copy is plenty for a reel
  if (!c) throw new Error(`no freely licensed Wikimedia Commons file with page id ${id}`);
  return c;
}

export const SEARCH = { pexels: searchPexels, pixabay: searchPixabay, wikimedia: searchWikimedia };
export const GET = { pexels: getPexels, pixabay: getPixabay, wikimedia: getWikimedia };
