// Weekly production: renders a week of a month plan into one folder per post.
//
//   npm run produce -- example --only V01        the example month on a fresh clone
//   npm run produce -- 2026-10 --week 1          silent drafts for week 1 (videos + carousels)
//   npm run produce -- 2026-10 --only V01,C01    just these
//   npm run produce -- 2026-10 --final V01       vo.mp3 (+ optional music.mp3) in the folder -> cut -> final.mp4
//
// The first word is a folder in reels/content/ that holds a plan.json.
//
// reels/studio-remotion/out/<folder>/<ID>-<slug>/
//   video.mp4   silent draft (frame 0 = cover)      final.mp4   with the voice-over
//   cover.png   frame 0, for Instagram / manual posts
//   review.png  contact sheet of the reel
//   vo-script.txt  ElevenLabs script (keep the <break> tags)
//   post.txt    caption + hashtags, first comment, IG caption, posting notes, credits
//   slide-N.png (carousels)

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { CLI, CONTENT, REPO, ROOT, die } from "./lib/media.mjs";

const MAX_MB = 50; // a safe upload size for most schedulers
const USAGE = "usage: npm run produce -- <folder> --week N | --only V01,C02 | --final V01   (folder = example or a month like 2026-10)";
const [folder, ...args] = process.argv.slice(2);
if (!folder || !/^[A-Za-z0-9_-]+$/.test(folder)) die(USAGE);
const opt = Object.fromEntries(args.reduce((acc, a, i) => (a.startsWith("--") ? [...acc, [a.slice(2), args[i + 1] ?? ""]] : acc), []));

const planPath = join(CONTENT, folder, "plan.json");
if (!existsSync(planPath)) {
  const have = existsSync(CONTENT) ? readdirSync(CONTENT).filter((d) => existsSync(join(CONTENT, d, "plan.json"))) : [];
  die(`there is no reels/content/${folder}/plan.json. Folders with a plan: ${have.join(", ") || "none yet"}.`);
}
const voPath = join(CONTENT, folder, "vo.json");
const plan = JSON.parse(readFileSync(planPath, "utf8"));
const manifest = JSON.parse(readFileSync(join(ROOT, "assets", "manifest.json"), "utf8"));
const assetById = new Map(manifest.assets.map((a) => [a.id, a]));
const prefix = `${plan.month.slice(2, 4)}${plan.month.slice(5, 7)}`; // same as reelId() in src/plan/fromPlan.ts
const compId = (item) => `${prefix}-${item.id}`;
const outDir = join(ROOT, "out", folder);
const folderOf = (item) => join(outDir, `${item.id}-${item.slug}`);

function remotion(cmdArgs) {
  const res = spawnSync(process.execPath, [CLI, ...cmdArgs], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
  if (res.status !== 0) throw new Error(`remotion ${cmdArgs.slice(0, 3).join(" ")} failed:\n${(res.stderr || res.stdout || "").slice(-800)}`);
  return res.stdout;
}

// 1080x1920, 30 fps, <= 60 s, <= 50 MB.
function checkVideo(file) {
  const out = JSON.parse(remotion(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate:format=duration", "-of", "json", file]));
  const s = out.streams?.[0] ?? {};
  const secs = Number(out.format?.duration ?? 0);
  const mb = statSync(file).size / 1048576;
  const problems = [];
  if (s.width !== 1080 || s.height !== 1920) problems.push(`${s.width}x${s.height}`);
  if (s.r_frame_rate !== "30/1") problems.push(`fps ${s.r_frame_rate}`);
  if (secs > 60) problems.push(`${secs.toFixed(1)} s > 60 s`);
  if (mb > MAX_MB) problems.push(`${mb.toFixed(1)} MB > ${MAX_MB} MB`);
  if (problems.length) throw new Error(`${file}: ${problems.join(", ")}`);
  return `${secs.toFixed(1)} s, ${mb.toFixed(1)} MB`;
}

const voScript = (v) => [...v.beats.map((b) => b.vo), v.ctaVo].join(`\n${plan.defaults.voBreak}\n`);
const aiUsed = (v) => v.beats.some((b) => b.shot?.asset && assetById.get(b.shot.asset)?.ai);

function postText(v) {
  // Stock clips (Pexels, Pixabay, Wikimedia) carry a credit line from scripts/broll.mjs; older Pexels records don't.
  const stock = [...new Set(v.beats.map((b) => b.shot?.asset && assetById.get(b.shot.asset)).filter((a) => a?.credit || a?.source === "pexels"))];
  const credit = (a) => a.credit ?? `${a.author} — ${a.url}`;
  const required = stock.filter((a) => a.attributionRequired);
  const courtesy = stock.filter((a) => !a.attributionRequired);
  return [
    `${v.id} — ${v.title}`,
    `Date: ${v.date} ${plan.defaults.videoTime} · ${v.posting === "publora" ? "Publora schedules TikTok (after you approve), Instagram by hand" : "post by hand (TikTok + Instagram)"}`,
    aiUsed(v) ? "⚠️ Turn on the AI label: \"AI-generated content\" (your own AI clips are in this video)" : "No AI label needed (stock clips / graphics only)",
    "Cover: TikTok = first frame · Instagram = cover.png",
    "",
    "── TikTok caption ──",
    `${v.caption}\n\n${[...v.hashtags, ...plan.defaults.baseTags].join(" ")}`,
    "",
    "── First comment (pin it) ──",
    v.firstComment,
    "",
    "── Instagram caption ──",
    `${v.igCaption}\n\n${[...v.hashtags, ...(plan.defaults.igTags ?? [])].join(" ").toLowerCase()}`,
    "",
    "── Reply templates ──",
    ...v.replies.map((r) => `• ${r}`),
    ...(required.length ? ["", "── Footage credits: REQUIRED, add to the caption ──", ...required.map((a) => `• ${credit(a)}`)] : []),
    ...(courtesy.length ? ["", "── Footage credits (not required, appreciated) ──", ...courtesy.map((a) => `• ${credit(a)}`)] : []),
    "",
  ].join("\n");
}

function draftVideo(v) {
  const dir = folderOf(v);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "vo-script.txt"),
    `Voice: ${plan.defaults.voice}\nKeep the break tags: the audio is cut at those pauses. Save the file as vo.mp3 (or vo-XX.mp3) in this folder.\n\n${voScript(v)}\n`,
  );
  writeFileSync(join(dir, "post.txt"), postText(v));
  const id = compId(v);
  remotion(["render", "src/index.ts", id, join(dir, "video.mp4"), "--muted", "--log=error"]);
  const info = checkVideo(join(dir, "video.mp4"));
  remotion(["still", "src/index.ts", id, join(dir, "cover.png"), "--frame=0", "--log=error"]);
  remotion(["still", "src/index.ts", `${id}-Review`, join(dir, "review.png"), "--frame=0", "--log=error"]);
  return info;
}

function draftCarousel(c) {
  const dir = folderOf(c);
  mkdirSync(dir, { recursive: true });
  c.slides.forEach((_, i) => remotion(["still", "src/index.ts", compId(c), join(dir, `slide-${i + 1}.png`), `--frame=${i}`, "--log=error"]));
  writeFileSync(
    join(dir, "post.txt"),
    [`${c.id} — ${c.title}`, `Date: ${c.date} ${plan.defaults.carouselTime} · post by hand (TikTok photo mode + Instagram carousel)`, "", "── Caption ──", `${c.caption}\n\n${c.hashtags.join(" ")}`, ""].join("\n"),
  );
  return `${c.slides.length} slides`;
}

function finalVideo(v) {
  const dir = folderOf(v);
  const found = existsSync(dir) ? readdirSync(dir).filter((f) => /^vo.*\.mp3$/i.test(f)) : []; // vo.mp3, vo-01.mp3, ...
  if (found.length !== 1) die(`${v.id}: put exactly one vo*.mp3 in ${dir} (found ${found.length})`);
  const mp3 = join(dir, found[0]);
  const lines = v.beats.length + 1;
  const cutFile = join(dir, "vo-cut.json");
  const textFile = join(dir, "vo-lines.json"); // fallback cut when the break pauses got lost
  writeFileSync(textFile, `${JSON.stringify([...v.beats.map((b) => b.vo), v.ctaVo], null, 2)}\n`);
  const voArgs = [join(ROOT, "scripts", "vo.mjs"), mp3, "--lines", String(lines), "--out", cutFile, "--text", textFile];
  const res = spawnSync(process.execPath, voArgs, { cwd: ROOT, encoding: "utf8", stdio: "inherit" });
  if (res.status !== 0) die(`${v.id}: cutting the voice-over failed (see above)`);
  const cut = JSON.parse(readFileSync(cutFile, "utf8"));
  const audioRel = `audio/${prefix}/${v.id}.mp3`;
  mkdirSync(join(ROOT, "public", "audio", prefix), { recursive: true });
  copyFileSync(mp3, join(ROOT, "public", audioRel));
  const vo = existsSync(voPath) ? JSON.parse(readFileSync(voPath, "utf8")) : {};
  vo[v.id] = { src: audioRel, lines: cut.lines };
  const musicMp3 = join(dir, "music.mp3"); // optional licensed bed, mixed low under the VO
  if (existsSync(musicMp3)) {
    vo[v.id].music = `audio/${prefix}/${v.id}-music.mp3`;
    copyFileSync(musicMp3, join(ROOT, "public", vo[v.id].music));
  }
  writeFileSync(voPath, `${JSON.stringify(vo, null, 2)}\n`);
  const id = compId(v);
  const out = join(dir, "final.mp4");
  remotion(["render", "src/index.ts", id, out, "--log=error"]);
  // Footage-heavy finals can pass the size limit at Remotion's default CRF 18; one retry at 23 roughly halves the size.
  if (statSync(out).size / 1048576 > MAX_MB) remotion(["render", "src/index.ts", id, out, "--crf=23", "--log=error"]);
  const info = checkVideo(out);
  remotion(["still", "src/index.ts", id, join(dir, "cover.png"), "--frame=0", "--log=error"]);
  return info;
}

// Which items?
const all = [...plan.videos.map((item) => ({ kind: "video", item })), ...plan.carousels.map((item) => ({ kind: "carousel", item }))];
let picked;
if (opt.final) picked = all.filter(({ kind, item }) => kind === "video" && opt.final.split(",").includes(item.id));
else if (opt.only) picked = all.filter(({ item }) => opt.only.split(",").includes(item.id));
else if (opt.week) {
  const w = plan.weeks.find((x) => String(x.n) === opt.week);
  if (!w) die(`there is no week ${opt.week} in the plan`);
  picked = all.filter(({ item }) => item.date >= w.from && item.date <= w.to);
} else die(USAGE);
if (!picked.length) die(`nothing in the plan matches. IDs in this plan: ${all.map(({ item }) => item.id).join(", ")}`);
picked.sort((a, b) => a.item.date.localeCompare(b.item.date));

let failed = 0;
for (const { kind, item } of picked) {
  const t0 = Date.now();
  try {
    if (kind === "video" && !opt.final && item.line === "footage" && item.beats.some((b) => b.shot && !b.shot.asset)) {
      throw new Error("clips not picked yet (run the Pexels search for this video first)");
    }
    const info = opt.final ? finalVideo(item) : kind === "video" ? draftVideo(item) : draftCarousel(item);
    console.log(`✔ ${item.id} ${item.slug} — ${info} (${Math.round((Date.now() - t0) / 1000)} s)`);
  } catch (e) {
    failed++;
    console.error(`✖ ${item.id} ${item.slug} — ${e.message}`);
  }
}
console.log(`\n${picked.length - failed}/${picked.length} done → ${relative(REPO, outDir)}`);
if (failed) process.exit(1);
