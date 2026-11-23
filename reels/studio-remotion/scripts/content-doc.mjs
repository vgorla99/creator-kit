// The monthly content document: reels/content/<folder>/plan.json -> one HTML
// file with collapsible cards, copy buttons and checklists, in your brand
// colours. The plan is the single source; never edit the HTML.
//
//   npm run doc -- example
//   npm run doc -- 2026-10

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { CONTENT, REPO, ROOT, die, readBrand } from "./lib/media.mjs";

const folder = process.argv[2];
if (!folder || !/^[A-Za-z0-9_-]+$/.test(folder)) die("usage: npm run doc -- <folder>   (example, or a month like 2026-10)");
const planPath = join(CONTENT, folder, "plan.json");
if (!existsSync(planPath)) die(`there is no reels/content/${folder}/plan.json`);
const plan = JSON.parse(readFileSync(planPath, "utf8"));
const brand = await readBrand();
const OUT_DIR = join(ROOT, "out", folder);
const outFile = join(OUT_DIR, `CONTENT_${folder}.html`);
const manifest = JSON.parse(readFileSync(join(ROOT, "assets", "manifest.json"), "utf8"));
const aiAssets = new Set(manifest.assets.filter((a) => a.ai).map((a) => a.id));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const locale = brand.brand.language ?? "en";
const day = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "short" });
const outRel = relative(REPO, OUT_DIR).replace(/\\/g, "/");
const itemDir = (item) => `${outRel}/${item.id}-${item.slug}/`;
const copy = (text) => `<div class="copy"><button onclick="copyBlock(this)">Copy</button><pre>${esc(text)}</pre></div>`;
const words = (s) => s.split(/\s+/).filter(Boolean).length;
const wps = brand.voice?.words_per_second ?? 2.2;

// ElevenLabs script: one line per beat + the CTA line, separated by break tags
// so `npm run vo` can cut the file at the pauses.
function voScript(v) {
  const lines = [...v.beats.map((b) => b.vo), v.ctaVo];
  return lines.join(`\n${plan.defaults.voBreak}\n`);
}
const seconds = (v) => Math.round([...v.beats.map((b) => b.vo), v.ctaVo].reduce((s, l) => s + words(l) / wps + 1, 0));
const usesAi = (v) => v.beats.some((b) => b.shot?.asset && aiAssets.has(b.shot.asset));

function beatRows(v) {
  return v.beats
    .map((b, i) => {
      const title = i === 0 ? v.hook : b.title;
      const visual = b.shot
        ? b.shot.asset
          ? `your clip: <code>${esc(b.shot.asset)}</code>`
          : `Pexels: "${esc(b.shot.pexels)}"`
        : !b.block || b.block.type === "none"
          ? "graphic: text only"
          : `graphic: ${esc(b.block.type)}${b.block.verdict ? ` (${esc(b.block.verdict)})` : ""}${b.block.items ? ` — ${esc(b.block.items.join(" · "))}` : ""}`;
      const rows = b.rows ? `<div class="rows">${b.rows.map((r) => `${esc(r.label)} <b>${esc(r.value)}</b>`).join(" · ")}</div>` : "";
      return `<tr><td>${i === 0 ? "Hook" : i}</td><td><b>${esc(title[0])}</b><br><span class="accent">${esc(title[1])}</span>${b.note ? `<div class="note">${esc(b.note)}</div>` : ""}${rows}</td><td>${visual}</td><td>${esc(b.vo)}</td></tr>`;
    })
    .concat(`<tr><td>CTA</td><td><b>${esc(plan.defaults.cta.button)}</b><div class="note">${esc(plan.defaults.cta.note)}</div></td><td>wordmark + button</td><td>${esc(v.ctaVo)}</td></tr>`)
    .join("");
}

function checklist(items) {
  return `<div class="checklist">${items.map((t) => `<div class="check" onclick="toggleCheck(this)"><span class="box"></span><span>${t}</span></div>`).join("")}</div>`;
}

function videoCard(v, n) {
  const ai = usesAi(v);
  const scheduled = v.posting === "publora";
  const pexels = v.beats.filter((b) => b.shot?.pexels).map((b) => b.shot.pexels);
  const steps = [
    `Watch the silent draft: <code>${itemDir(v)}video.mp4</code> + <code>cover.png</code>`,
    `Record the voice-over (script below, keep the break tags) and save it as <code>vo.mp3</code> in that folder`,
    `Tell Claude "the VO for ${v.id} is in" (or run <code>npm run produce -- ${esc(folder)} --final ${v.id}</code>) to render <code>final.mp4</code>`,
    ...(scheduled
      ? [`Approve the schedule: Publora posts TikTok on ${esc(v.date)} ${esc(plan.defaults.videoTime)}`, `Post the Instagram Reel by hand (Instagram caption below, cover = <code>cover.png</code>)`]
      : [`Post on TikTok at ${esc(plan.defaults.videoTime)} · cover = first frame`, `Post the Instagram Reel (Instagram caption below, cover = <code>cover.png</code>)`]),
    ...(ai ? ['⚠️ Turn on the AI label: "AI-generated content" (your own AI clips are in this video)'] : []),
    "Post the first comment right away and pin it",
    "After 1 hour: answer comments (templates below)",
  ];
  return `
<section class="card" id="${v.id}">
  <header onclick="toggleCard(this)">
    <div class="num">${n}</div>
    <div class="info"><div class="name">${esc(day(v.date))} · ${esc(v.id)} — ${esc(v.title)}</div><div class="sub">${esc(v.hook.join(" "))}</div></div>
    <div class="badges">
      <span class="badge ${v.line}">${v.line === "footage" ? "🎬 Footage" : "✨ Motion"}</span>
      <span class="badge ${scheduled ? "sched" : "manual"}">${scheduled ? "📅 Scheduled" : "✋ By hand"}</span>
      ${ai ? '<span class="badge ai">AI label</span>' : ""}
      <span class="badge time">${esc(plan.defaults.videoTime)}</span>
    </div>
  </header>
  <div class="body">
    <div class="facts"><div><label>Post</label>${esc(plan.defaults.videoTime)}</div><div><label>Length</label>~${seconds(v)} s</div><div><label>Format</label>9:16 · 1080×1920</div><div><label>Folder</label><code>${itemDir(v)}</code></div></div>
    <div class="block why"><b>Why:</b> ${esc(v.why)}</div>
    <h4>🖼️ Cover = first frame</h4>
    <div class="block"><b>Cover text (A):</b> ${esc(v.hook.join(" "))} &nbsp;·&nbsp; <b>A/B alternative (B):</b> ${esc(v.hookAlt.join(" "))}<br><small>The video opens on the finished hook, so no separate cover image is needed. <code>cover.png</code> is in the folder for Instagram.</small></div>
    <h4>🎞️ Beats</h4>
    <table><thead><tr><th>#</th><th>Text on screen</th><th>Picture</th><th>Voice-over</th></tr></thead><tbody>${beatRows(v)}</tbody></table>
    <h4>🎤 Voice-over script</h4>
    <div class="block"><b>Voice:</b> ${esc(plan.defaults.voice)}. Don't delete the <code>&lt;break&gt;</code> tags: the audio is cut automatically at those pauses.</div>
    ${copy(voScript(v))}
    ${pexels.length ? `<h4>🔎 Pexels searches (Claude picks the clips)</h4><div class="block">${pexels.map((q) => `"${esc(q)}"`).join(" · ")}</div>` : ""}
    <h4>📱 TikTok caption</h4>
    ${copy(`${v.caption}\n\n${[...v.hashtags, ...plan.defaults.baseTags].join(" ")}`)}
    <h4>📌 First comment</h4>
    ${copy(v.firstComment)}
    <h4>📷 Instagram caption</h4>
    ${copy(`${v.igCaption}\n\n${[...v.hashtags, ...(plan.defaults.igTags ?? [])].join(" ").toLowerCase()}`)}
    <h4>💬 Reply templates</h4>
    <ul class="replies">${v.replies.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
    <h4>📋 Checklist</h4>
    ${checklist(steps)}
  </div>
</section>`;
}

function carouselCard(c, n) {
  const slides = c.slides.map((s, i) => {
    const [head, sub] = s.split(" | ");
    return `<li><span class="sn">${i + 1}</span><b>${esc(head)}</b>${sub ? ` — ${esc(sub)}` : ""}</li>`;
  });
  return `
<section class="card carousel" id="${c.id}">
  <header onclick="toggleCard(this)">
    <div class="num c">${n}</div>
    <div class="info"><div class="name">${esc(day(c.date))} · ${esc(c.id)} — ${esc(c.title)}</div><div class="sub">${c.slides.length} slides · 4:5</div></div>
    <div class="badges"><span class="badge carousel">🖼️ Carousel</span><span class="badge manual">✋ By hand</span><span class="badge time">${esc(plan.defaults.carouselTime)}</span></div>
  </header>
  <div class="body">
    <div class="facts"><div><label>Post</label>${esc(plan.defaults.carouselTime)}</div><div><label>Format</label>4:5 · 1080×1350</div><div><label>Folder</label><code>${itemDir(c)}</code></div></div>
    <h4>🖼️ Slides</h4>
    <ol class="slides">${slides.join("")}</ol>
    <h4>📱 Caption (TikTok + Instagram)</h4>
    ${copy(`${c.caption}\n\n${c.hashtags.join(" ")}`)}
    <h4>📋 Checklist</h4>
    ${checklist([`Check the slides: <code>${itemDir(c)}slide-1.png</code> …`, "TikTok: photo mode, add quiet music", "Instagram: post as a carousel", "After 1 hour: answer comments"])}
  </div>
</section>`;
}

function weekSection(w, items) {
  const cards = items.map(({ kind, item }) => (kind === "video" ? videoCard(item, item.id.slice(1)) : carouselCard(item, item.id.slice(1)))).join("");
  return `<h2 class="week">${esc(w.label)} · ${esc(day(w.from))} – ${esc(day(w.to))} <span>approve by ${esc(day(w.approveBy))}</span></h2>${cards}`;
}

const all = [...plan.videos.map((item) => ({ kind: "video", item })), ...plan.carousels.map((item) => ({ kind: "carousel", item }))].sort(
  (a, b) => a.item.date.localeCompare(b.item.date) || (a.kind === "carousel" ? -1 : 1),
);
const weeks = plan.weeks.map((w) => weekSection(w, all.filter(({ item }) => item.date >= w.from && item.date <= w.to))).join("");
const nFoot = plan.videos.filter((v) => v.line === "footage").length;
const nMotion = plan.videos.length - nFoot;
const nScheduled = plan.videos.filter((v) => v.posting === "publora").length;
const c = brand.visual.colors;
const mark = brand.visual.wordmark ?? { prefix: brand.brand.name, suffix: "" };

const html = `<!doctype html>
<html lang="${esc(locale)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(brand.brand.name)} · Content ${esc(plan.title)}</title>
<style>
:root{--accent:${c.primary};--dark:${c.dark};--deep:${c.tertiary};--mid:${c.secondary};--paper:${c.light};--line:#0000001a;--text:#16181B;--muted:#6B6F76;--green:#2E9E5B;--orange:#D9822B;--purple:#7D5BD0}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:var(--paper);color:var(--text);line-height:1.5}
.top{background:var(--dark);color:#fff;padding:18px 24px;border-bottom:3px solid var(--accent);position:sticky;top:0;z-index:10;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.top .logo{font-size:1.4rem}.top .logo b{font-weight:700}.top .logo span{font-weight:300}.top .meta{color:#ffffff88;font-size:.85rem}
.progress{height:6px;background:#ffffff22;border-radius:3px;flex:1;min-width:160px;max-width:360px;overflow:hidden}.progress i{display:block;height:100%;background:var(--accent);width:0}
main{max-width:960px;margin:0 auto;padding:28px 16px 80px}
.intro{background:#fff;border:1px solid var(--line);border-radius:16px;padding:24px;margin-bottom:28px}
.intro h1{font-size:1.5rem;margin-bottom:6px}.intro p{color:var(--muted);margin-bottom:14px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:16px 0}
.grid div{background:var(--paper);border-radius:12px;padding:14px}.grid b{display:block;font-size:1.6rem;color:var(--deep)}
.intro ul{padding-left:20px;margin:6px 0 14px}.intro li{margin:4px 0}
h2.week{font-size:1.1rem;margin:36px 0 14px;padding-bottom:8px;border-bottom:2px solid var(--accent);display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}
h2.week span{font-weight:500;font-size:.85rem;color:var(--muted)}
.card{background:#fff;border:1px solid var(--line);border-radius:16px;margin-bottom:16px;overflow:hidden}
.card header{display:flex;gap:14px;align-items:center;padding:16px 20px;background:var(--dark);cursor:pointer}
.card.carousel header{background:var(--deep)}
.num{width:42px;height:42px;border-radius:50%;background:var(--accent);color:var(--dark);font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.num.c{background:var(--mid);color:#fff}.card.done .num{background:var(--green);color:#fff}
.info{flex:1;min-width:0}.name{color:#fff;font-weight:700}.sub{color:#ffffff88;font-size:.85rem}
.badges{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.badge{font-size:.72rem;font-weight:600;padding:3px 10px;border-radius:99px;border:1px solid #ffffff33;color:#fff;white-space:nowrap}
.badge.footage{border-color:var(--orange);color:#F2B36B}.badge.motion{border-color:var(--accent);color:var(--accent)}.badge.sched{border-color:var(--green);color:#7FD6A3}
.badge.manual{color:#ffffffaa}.badge.ai{border-color:var(--purple);color:#B9A4F0}.badge.carousel{border-color:var(--mid);color:#fff}
.body{display:none;padding:22px}.card.open .body{display:block}
h4{font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:var(--deep);margin:22px 0 8px}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.facts div{background:var(--paper);border-radius:10px;padding:10px 12px;font-weight:600;overflow-wrap:anywhere}.facts label{display:block;font-size:.7rem;color:var(--muted);font-weight:500;text-transform:uppercase;letter-spacing:.08em}
.block{background:var(--paper);border-left:3px solid var(--accent);border-radius:8px;padding:12px 14px}.block.why{margin-top:14px;border-color:var(--orange)}
table{width:100%;border-collapse:collapse;font-size:.9rem}th,td{text-align:left;padding:8px;border-bottom:1px solid var(--line);vertical-align:top}th{font-size:.72rem;color:var(--muted);text-transform:uppercase}
.accent{color:var(--deep);font-weight:700}.note{color:var(--muted);font-size:.8rem}.rows{font-size:.8rem;margin-top:4px}
code{font-size:.8rem;background:#0000000d;padding:1px 5px;border-radius:4px;overflow-wrap:anywhere}
.copy{position:relative;background:var(--dark);border-radius:10px;padding:14px;margin-top:6px}
.copy pre{color:#EDEBE6;white-space:pre-wrap;font-family:inherit;font-size:.9rem;padding-right:64px}
.copy button{position:absolute;top:10px;right:10px;background:var(--accent);color:var(--dark);border:0;border-radius:6px;padding:4px 10px;font:600 .75rem system-ui,sans-serif;cursor:pointer}
.copy button.ok{background:var(--green);color:#fff}
.replies{padding-left:20px}.replies li{margin:4px 0}
.slides{list-style:none}.slides li{padding:8px 0;border-bottom:1px solid var(--line)}.sn{display:inline-block;width:24px;height:24px;border-radius:50%;background:var(--mid);color:#fff;font-size:.75rem;text-align:center;line-height:24px;margin-right:8px}
.check{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);cursor:pointer}.check:last-child{border:0}
.box{width:20px;height:20px;border:2px solid var(--accent);border-radius:5px;flex-shrink:0;margin-top:2px}.check.on .box{background:var(--green);border-color:var(--green)}.check.on span:last-child{color:var(--muted);text-decoration:line-through}
@media (max-width:600px){.card header{flex-wrap:wrap}.badges{justify-content:flex-start;width:100%}table,thead,tbody,tr,td,th{display:block}thead{display:none}td{border:0;padding:4px 0}tr{border-bottom:1px solid var(--line);padding:8px 0}}
</style></head><body>
<div class="top"><div class="logo"><b>${esc(mark.prefix)}</b><span>${esc(mark.suffix ?? "")}</span> · Content ${esc(plan.title)}</div><div class="progress" title="Done"><i id="bar"></i></div><div class="meta">${plan.videos.length} videos · ${plan.carousels.length} carousels · ${esc(plan.status)}</div></div>
<main>
<div class="intro">
<h1>Content plan: ${esc(plan.title)}</h1>
<p>Made from <code>reels/content/${esc(folder)}/plan.json</code>. Change things there, then run <code>npm run doc -- ${esc(folder)}</code> again.</p>
<div class="grid">
<div><b>${nFoot}</b>footage videos (stock + your own clips)</div>
<div><b>${nMotion}</b>motion videos (graphics only)</div>
<div><b>${nScheduled}</b>scheduled automatically · the rest by hand</div>
<div><b>${plan.carousels.length}</b>carousels 4:5 · by hand</div>
<div><b>${esc(plan.defaults.videoTime)}</b>videos · carousels ${esc(plan.defaults.carouselTime)}</div>
</div>
<h4>How a week works</h4>
<ul>
<li>Claude renders the week's videos and carousels as <b>silent drafts</b> into <code>${outRel}/&lt;ID&gt;-&lt;slug&gt;/</code>.</li>
<li>You watch them, record the voice-overs (scripts below) and save each one as <code>vo.mp3</code> in its folder.</li>
<li>Claude cuts the audio at the pauses and renders <code>final.mp4</code>. Nothing is posted until you approve it.</li>
</ul>
<h4>Rules</h4>
<ul>${plan.rules.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
</div>
${weeks}
</main>
<script>
const KEY="creator-kit-${esc(folder)}";
let state={};try{state=JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
function toggleCard(h){h.parentElement.classList.toggle("open")}
function copyBlock(b){navigator.clipboard.writeText(b.nextElementSibling.textContent).then(()=>{b.textContent="Copied!";b.classList.add("ok");setTimeout(()=>{b.textContent="Copy";b.classList.remove("ok")},1500)})}
function toggleCheck(el){el.classList.toggle("on");state[el.dataset.k]=el.classList.contains("on");save();update()}
function update(){const all=document.querySelectorAll(".check"),on=document.querySelectorAll(".check.on");document.getElementById("bar").style.width=(all.length?on.length/all.length*100:0)+"%";
document.querySelectorAll(".card").forEach(c=>{const cs=c.querySelectorAll(".check");c.classList.toggle("done",cs.length>0&&[...cs].every(x=>x.classList.contains("on")))})}
document.querySelectorAll(".card").forEach(c=>c.querySelectorAll(".check").forEach((el,i)=>{el.dataset.k=c.id+"-"+i;if(state[el.dataset.k])el.classList.add("on")}));
update();
</script>
</body></html>
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(outFile, html);
console.log(`✔ ${relative(REPO, outFile)}  (${plan.videos.length} videos, ${plan.carousels.length} carousels)`);
