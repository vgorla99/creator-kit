// Checks every relative link and #anchor in README.md, CREDITS.md and docs/*.md.
// Usage: node scripts/check-links.mjs   (exits 1 on a broken link)
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const files = ["README.md", "CREDITS.md", ...readdirSync("docs").filter((f) => f.endsWith(".md")).map((f) => `docs/${f}`)];

const slug = (h) => h.trim().toLowerCase().replace(/<[^>]+>/g, "").replace(/[`*_~]/g, "").replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s/g, "-");
const anchors = (file) => {
  const seen = new Map();
  const out = new Set();
  const text = readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, "");
  for (const m of text.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    const base = slug(m[1]);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    out.add(n ? `${base}-${n}` : base);
  }
  for (const m of text.matchAll(/<a\s+(?:name|id)="([^"]+)"/g)) out.add(m[1]);
  return out;
};

let bad = 0;
for (const file of files) {
  const text = readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
  const links = [...text.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g), ...text.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const link of links) {
    if (/^(https?:|mailto:)/.test(link) || /^[A-Z_]+$/.test(link)) continue;
    const [path, hash] = link.split("#");
    const target = path ? resolve(dirname(file), decodeURI(path)) : resolve(file);
    if (!existsSync(target)) { console.log(`${file}: missing ${link}`); bad++; continue; }
    if (hash && target.endsWith(".md") && statSync(target).isFile() && !anchors(target).has(hash)) { console.log(`${file}: no anchor ${link}`); bad++; }
  }
}
console.log(bad ? `${bad} broken link(s)` : `all links ok (${files.length} files)`);
process.exit(bad ? 1 : 0);
