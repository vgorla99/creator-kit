// `npm run check`
import assert from "node:assert/strict";
import type { Item } from "../../shared/src/index.ts";
import { buildPrompt } from "./prompt.ts";

const item = (code: string, approved: boolean, notes: string): Item =>
  ({ code, title: `T${code}`, date: "2026-01-20 18:00", stage: "ready", folder: `${code}-x`, dash: { approved, notes, editedAt: null } }) as Item;

const p = buildPrompt("Kiln Hour", "postiz-self", [item("V1", true, ""), item("V2", true, "small fix"), item("V3", false, "shorter hook\nand CTA"), item("V4", false, "")], "2026-01-16");
assert.ok(p.startsWith("Dashboard review — Kiln Hour — 2026-01-16 (4 posts)"));
assert.match(p, /schedule on Postiz as planned:\n- V1 \(2026-01-20 18:00\) TV1 \[ready: V1-x\]/);
assert.match(p, /apply them, then schedule on Postiz:\n- V2 .*\n {2}Note: small fix/);
assert.match(p, /not approved yet\):\n- V3 .*\n {2}Note: shorter hook\n {2}and CTA/);
assert.match(p, /leave as is:\n- V4/);
assert.match(buildPrompt("K", "native", [item("A", true, "")], "x"), /give me the posting checklist as planned/);
assert.ok(!buildPrompt("K", "native", [item("A", false, "")], "x").includes("as planned"));
console.log("prompt builder: all checks passed");
