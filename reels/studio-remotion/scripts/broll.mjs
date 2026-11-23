// B-roll from free sources (Pexels, Pixabay, Wikimedia Commons) -> one preview
// contact sheet for a human to pick from -> the asset library, with source URL,
// author, licence and credit line recorded in assets/manifest.json.
//
//   npm run broll -- search "city street sunrise" [--from pexels,pixabay,wikimedia] [--kind video|image] [--n 8] [--min 3] [--page 1]
//   npm run broll -- get wikimedia:12345 pexels:678 [--name short-name] [--tags a,b]
//   npm run pexels -- search "..." | get <id>        (same, Pexels only)
//
// Keys: PEXELS_API_KEY and PIXABAY_API_KEY in .env (free). Wikimedia needs none.
// Sources without a key are skipped with a note. --kind image works on Wikimedia only.
// Nothing goes into a reel until someone has looked at the sheet and picked.
// Lifestyle only: never use a stock person as if they use or endorse the brand.

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { LIBRARY, ROOT, contactSheet, die, frameAt, probe, readManifest, sha1, slug, writeManifest } from "./lib/media.mjs";
import { GET, SEARCH, SOURCES, UA, missingKey } from "./lib/stock.mjs";

const SHEETS = join(ROOT, "out", "_sheets");
const FRAMES = join(SHEETS, "_frames");

function parseArgs(argv) {
  const pos = [];
  const opt = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) opt[argv[i].slice(2)] = argv[++i] ?? "";
    else pos.push(argv[i]);
  }
  return { pos, opt };
}

async function download(url, out) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`download failed (${res.status}): ${url}`);
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
}

function pickSources(opt) {
  const names = (opt.from ?? Object.keys(SOURCES).join(",")).split(",").map((s) => s.trim().toLowerCase());
  for (const n of names) if (!SOURCES[n]) die(`unknown source "${n}" — use pexels, pixabay or wikimedia`);
  const ready = names.filter((n) => {
    const note = missingKey(n);
    if (note && names.length === 1) die(note);
    if (note) console.log(`- skipping ${n}: no ${SOURCES[n].key} in .env (free key: ${SOURCES[n].signup})`);
    return !note;
  });
  return ready;
}

// Three frames (10/50/90 %) from a small preview video, or the preview stills as they are.
async function previewFrames(c) {
  const key = `${c.source}-${c.id}`;
  if (c.preview.frames) {
    return Promise.all(
      c.preview.frames.slice(0, 3).map(async (url, i) => {
        const out = join(FRAMES, `${key}-${i}${url.match(/\.(png|webp)$/i)?.[0] ?? ".jpg"}`);
        await download(url, out);
        return out;
      }),
    );
  }
  const clip = join(FRAMES, `${key}-preview${c.preview.video.match(/\.\w+$/)?.[0] ?? ".mp4"}`);
  await download(c.preview.video, clip);
  const len = c.duration || probe(clip).duration;
  const frames = [0.1, 0.5, 0.9].map((p, i) => {
    const out = join(FRAMES, `${key}-${i}.jpg`);
    frameAt(clip, (len * p).toFixed(2), out);
    return out;
  });
  rmSync(clip, { force: true });
  return frames;
}

const shape = (c) => (c.kind === "image" ? `${c.width}x${c.height} still` : `${c.width}x${c.height} ${c.duration}s`);

async function search(query, opt) {
  const kind = opt.kind === "image" ? "image" : "video";
  const sources = pickSources(opt).filter((s) => kind === "video" || s === "wikimedia");
  if (!sources.length) die(kind === "image" ? "--kind image needs wikimedia in --from" : "no source is ready (see the notes above)");
  const n = Number(opt.n ?? 8);
  const min = Number(opt.min ?? 3);
  const found = [];
  for (const s of sources) {
    try {
      const got = (await SEARCH[s](query, { n, page: Number(opt.page ?? 1), kind })).filter(
        (c) => c.file && (kind === "image" || c.duration >= min),
      );
      console.log(`${s}: ${got.length} result(s) from ${SOURCES[s].home}`);
      found.push(...got);
    } catch (e) {
      console.error(`! ${s} search failed: ${e.message}`);
    }
  }
  if (!found.length) die(`nothing found for "${query}" (try other words, --min 1, or another --from)`);

  mkdirSync(FRAMES, { recursive: true });
  const rows = [];
  for (const c of found) {
    let frames = [];
    try {
      frames = await previewFrames(c);
    } catch (e) {
      console.error(`! no preview for ${c.source}:${c.id}: ${String(e.message).slice(-120)}`);
    }
    const warn = c.restrictions ? ` ! ${c.restrictions}` : c.attributionRequired ? " CREDIT" : "";
    rows.push({ label: `${c.source}:${c.id} ${shape(c)} | ${c.license}${warn} · ${c.author}`, frames });
    console.log(`${c.source}:${c.id}\t${shape(c)}\t${c.license}${c.attributionRequired ? " (credit required)" : ""}\t${c.author}\t${c.page}`);
  }
  const base = join(SHEETS, `broll-${slug(query)}`);
  writeFileSync(`${base}.json`, `${JSON.stringify({ query, kind, searched: new Date().toISOString(), candidates: found }, null, 2)}\n`);
  contactSheet(rows, `${base}.jpg`);
  console.log(`candidates (source, author, licence per clip): ${base}.json`);
  console.log(`next: look at the sheet, pick, then  npm run broll -- get <source:id> ...`);
}

async function get(refs, opt) {
  const m = readManifest();
  for (const ref of refs) {
    const [source, id] = ref.includes(":") ? ref.split(":") : [opt.from, ref];
    if (!SOURCES[source]) die(`"${ref}": write it as source:id, e.g. wikimedia:12345`);
    const note = missingKey(source);
    if (note) die(note);
    if (m.assets.some((a) => a.source === source && String(a.sourceId ?? a.pexelsId) === id)) {
      console.log(`= ${source}:${id} already in library`);
      continue;
    }
    const c = await GET[source](id).catch((e) => die(`${source}:${id}: ${e.message}`));
    if (!c.file) die(`${source}:${id} has no file we can use (Pexels: portrait mp4 >= 720 wide; Wikimedia: webm/mp4 or a still)`);
    const name = slug(opt.name && refs.length === 1 ? opt.name : c.title) || "clip";
    const assetId = `${source}-${name}-${id}`;
    const file = `library/${source}/${assetId}${c.file.ext}`;
    mkdirSync(join(LIBRARY, source), { recursive: true });
    const dest = join(ROOT, "public", file);
    await download(c.file.url, dest).catch((e) => die(e.message));
    const meta = probe(dest);
    const issues = [
      c.restrictions && `check before use: ${c.restrictions}`,
      Math.min(meta.width, meta.height) < 720 && `low resolution (${meta.width}x${meta.height}), may look soft full-screen`,
    ].filter(Boolean);
    m.assets.push({
      id: assetId,
      file,
      kind: c.kind,
      source,
      ...meta,
      ai: false,
      license: c.license,
      licenseUrl: c.licenseUrl,
      attributionRequired: c.attributionRequired,
      credit: c.credit,
      author: c.author,
      authorUrl: c.authorUrl,
      url: c.page,
      sourceId: id,
      restrictions: c.restrictions,
      tags: opt.tags ? opt.tags.split(",").map((t) => t.trim()) : [],
      issues: issues.join("; "),
      sha1: sha1(dest),
    });
    console.log(`+ ${assetId}  (${meta.width}x${meta.height} ${meta.duration}s, ${c.license}${c.attributionRequired ? ", credit required" : ""}, ${c.author})`);
  }
  writeManifest(m);
}

const { pos, opt } = parseArgs(process.argv.slice(2)); // `npm run pexels` = this script with --from pexels
const what = pos.shift();
const usage =
  'usage: npm run broll -- search "<words>" [--from pexels,pixabay,wikimedia] [--kind video|image] [--n 8] [--min 3]\n' +
  "       npm run broll -- get <source:id>... [--name x] [--tags a,b]";
if (what === "search" && pos.length) await search(pos.join(" "), opt);
else if (what === "get" && pos.length) await get(pos, opt);
else die(usage);
