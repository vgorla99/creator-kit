// Self-check for the parsers: `npm run check` (Node runs the .ts directly).
import assert from "node:assert/strict";
import { hookWins, parseCsv, parseMetrics, parsePlan, parsePostTxt, replaceSection, score } from "./parse.ts";

const POST = [
  "V05 — Glazing without a kiln",
  "Date: 2026-01-15 18:00 · post by hand (TikTok + Instagram)",
  "No AI label needed (stock clips / graphics only)",
  "",
  "── TikTok caption ──",
  "TT text",
  "",
  "#a #b",
  "",
  "── Instagram caption ──",
  "IG text",
  "",
].join("\r\n");

const p = parsePostTxt(POST);
assert.equal(p.code, "V05");
assert.equal(p.title, "Glazing without a kiln");
assert.equal(p.date, "2026-01-15 18:00");
assert.equal(p.aiLabel, false);
assert.deepEqual(p.sections.map((s) => s.name), ["TikTok caption", "Instagram caption"]);
assert.equal(p.sections[0].body, "TT text\n\n#a #b");
assert.equal(parsePostTxt('C1 — x\nDate: 2026-10-02 · by hand\n⚠️ Turn on the AI label: "AI-generated content"').aiLabel, true);
assert.equal(parsePostTxt("C1 — x\nDate: 2026-10-02 · by hand").date, "2026-10-02");

// replaceSection keeps everything else byte-for-byte, incl. CRLF
const edited = replaceSection(POST, "TikTok caption", "NEW\n\n#c");
assert.ok(edited.includes("── TikTok caption ──\r\nNEW\r\n\r\n#c\r\n\r\n── Instagram caption ──"));
assert.equal(edited.replace("NEW\r\n\r\n#c", "TT text\r\n\r\n#a #b"), POST);
assert.throws(() => replaceSection(POST, "Nope", "x"));
assert.ok(replaceSection("a\n── X ──\nold", "X", "new").endsWith("── X ──\nnew"));

assert.deepEqual(parseCsv('a,b\n1,"x, ""y"""\n'), [["a", "b"], ["1", 'x, "y"']]);
const m = parseMetrics("date,platform,reel_id,views,shares,saves,follows,avg_watch_s,hook_type\n2026-01-06,instagram,V02,1000,10,20,5,\"6.7\",mistake\n2026-01-08,tiktok,V03,2000,4,6,0,4,before/after\n");
assert.equal(m[0].views, 1000);
assert.equal(m[0].avgWatchS, 6.7);
assert.equal(m[0].reach, null);
assert.equal(score(m[0]), 35);
assert.equal(score({ views: null, shares: 1, saves: 1, follows: 1 }), null);
const wins = hookWins(m);
assert.deepEqual(wins.map((w) => w.hookType), ["mistake", "before/after"]);
assert.equal(wins[0].best?.reelId, "V02");

const plan = parsePlan({ videos: [{ id: "V01", hookType: 2, hook: ["A", "B"] }], carousels: [{ id: "C01" }] }, "example");
assert.equal(plan[0].hookType, "2");
assert.equal(plan[0].hook, "A / B");
assert.equal(plan[1].kind, "carousel");

console.log("shared parsers: all checks passed");
