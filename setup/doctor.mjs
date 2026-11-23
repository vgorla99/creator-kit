// node setup/doctor.mjs   (or: npm run doctor)
//
// Checks that this computer has everything Creator Kit needs and explains, in
// plain English, how to fix anything that is missing. Exits 1 if a check fails.
// Reads setup/.choices.json (written by setup) to know which parts you chose.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const WIN = process.platform === "win32";
const SETUP = WIN ? "powershell -ExecutionPolicy Bypass -File setup\\setup.ps1" : "bash setup/setup.sh";

/** @param {string} cmd @param {string[]} args @param {string} [cwd] */
function run(cmd, args, cwd = REPO) {
  // Fixed commands only. A shell lets Windows find .cmd shims (npm, claude).
  const res = spawnSync([cmd, ...args].join(" "), { cwd, encoding: "utf8", shell: true, timeout: 60_000 });
  return { ok: res.status === 0, out: `${res.stdout ?? ""}${res.stderr ?? ""}`.trim() };
}

/** First "major.minor" in a tool's version output, or null. @param {string} text */
function version(text) {
  const m = /(\d+)\.(\d+)/.exec(text);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

/** @param {[number, number] | null} v @param {number} major @param {number} minor */
const atLeast = (v, major, minor) => v !== null && (v[0] > major || (v[0] === major && v[1] >= minor));

/** @param {string} name @param {string} win @param {string} mac */
const install = (name, win, mac) => `Run the setup again (${SETUP}): it installs ${name}. Or install it yourself: ${WIN ? win : mac}`;

function readChoices() {
  const file = join(REPO, "setup", ".choices.json");
  if (!existsSync(file)) return { parts: [], engine: "" };
  try {
    const c = JSON.parse(readFileSync(file, "utf8"));
    return { parts: Array.isArray(c.parts) ? c.parts.map(String) : [], engine: String(c.engine ?? "") };
  } catch {
    return { parts: [], engine: "" };
  }
}

/** @typedef {{ name: string, check: () => { ok: boolean, detail: string }, fix: string }} Check */

/** @returns {Check[]} */
function checks() {
  const choices = readChoices();
  /** @type {Check[]} */
  const list = [
    {
      name: "Node.js 22 or newer",
      check: () => ({ ok: atLeast(version(process.versions.node), 22, 0), detail: `you have ${process.versions.node}` }),
      fix: install("Node.js", "winget install OpenJS.NodeJS.LTS", "brew install node"),
    },
    {
      name: "Python 3.12 or newer",
      check: () => {
        // "python" on Windows may be the Microsoft Store shortcut, which is not Python.
        for (const [cmd, args] of /** @type {[string, string[]][]} */ ([["python3", ["--version"]], ["python", ["--version"]], ["py", ["-3", "--version"]]])) {
          const r = run(cmd, args);
          if (r.ok && /^Python \d/.test(r.out) && atLeast(version(r.out), 3, 12)) return { ok: true, detail: r.out };
        }
        return { ok: false, detail: "not found (or older than 3.12)" };
      },
      fix: install("Python", "winget install Python.Python.3.13", "brew install python@3.13"),
    },
    {
      name: "uv (runs the kit's small Python helpers)",
      check: () => {
        const r = run("uv", ["--version"]);
        return { ok: r.ok, detail: r.ok ? r.out : "not found" };
      },
      fix: install("uv", "winget install astral-sh.uv", "brew install uv"),
    },
    {
      name: "ffmpeg (checks and cuts video)",
      check: () => {
        const r = run("ffmpeg", ["-version"]);
        return { ok: r.ok, detail: r.ok ? (r.out.split("\n")[0] ?? "").slice(0, 40) : "not found" };
      },
      fix: install("ffmpeg", "winget install Gyan.FFmpeg", "brew install ffmpeg"),
    },
    {
      name: "git (downloads the skills)",
      check: () => {
        const r = run("git", ["--version"]);
        return { ok: r.ok, detail: r.ok ? r.out : "not found" };
      },
      fix: install("git", "winget install Git.Git", "brew install git"),
    },
    {
      name: "Claude Code",
      check: () => {
        const r = run("claude", ["--version"]);
        return { ok: r.ok, detail: r.ok ? r.out : "not found" };
      },
      fix: `Install Claude Code from https://claude.com/claude-code (you need a Claude Pro plan or higher), open a new terminal, then run the setup again so it can add the plugins.`,
    },
    {
      name: "Kit packages installed",
      check: () => {
        const ok = existsSync(join(REPO, "node_modules", "yaml")) && existsSync(join(REPO, "node_modules", "ajv"));
        return { ok, detail: ok ? "node_modules is there" : "node_modules is missing" };
      },
      fix: `Run the setup again (${SETUP}), or run \`npm ci\` in this folder.`,
    },
    {
      name: "Brand file (brand/brand.yaml)",
      check: () => {
        const r = run("node", ["scripts/brand-check.mjs"]);
        return { ok: r.ok, detail: r.out.split("\n").slice(0, 6).join(" ") };
      },
      fix: "Open Claude Code in this folder and type /brand-intake, or fix the lines listed above and run `npm run brand:check`.",
    },
  ];

  if (choices.parts.includes("reels")) {
    list.push({
      name: "Reel studio installed (Remotion)",
      check: () => {
        const ok = existsSync(join(REPO, "node_modules", "@remotion", "cli"));
        return { ok, detail: ok ? "found" : "missing" };
      },
      fix: `Run the setup again (${SETUP}), or run \`npm ci\` in this folder.`,
    });
  }
  if (choices.parts.includes("sites")) {
    list.push({
      name: "Site template installed",
      check: () => {
        const ok = existsSync(join(REPO, "sites", "template", "node_modules", "vite"));
        return { ok, detail: ok ? "found" : "missing" };
      },
      fix: `Run the setup again (${SETUP}), or run \`npm ci\` inside sites/template.`,
    });
  }
  if (choices.parts.length) {
    list.push({
      name: "Skills installed",
      check: () => {
        const parts = choices.parts.join(",");
        const r = run("node", ["setup/skills.mjs", "--parts", parts, "--engine", choices.engine || "remotion", "--list"]);
        if (!r.ok) return { ok: false, detail: r.out.slice(-200) };
        const names = [...r.out.matchAll(/^ {2}([a-z0-9-]+) {2}\(/gm)].map((m) => m[1] ?? "");
        const missing = names.filter((n) => !existsSync(join(REPO, ".claude", "skills", n, "SKILL.md")));
        return { ok: missing.length === 0, detail: missing.length ? `missing: ${missing.join(", ")}` : `${names.length} skills` };
      },
      fix: `Run the setup again (${SETUP}). It downloads only what is missing.`,
    });
  }
  list.push({
    name: "Your keys file (.env)",
    check: () => {
      const ok = existsSync(join(REPO, ".env"));
      return { ok, detail: ok ? "found (not shown)" : "missing" };
    },
    fix: "Copy .env.example to .env. Every key in it is optional; add only the ones you use.",
  });
  return list;
}

let failed = 0;
console.log("Creator Kit doctor\n");
for (const c of checks()) {
  const { ok, detail } = c.check();
  console.log(`${ok ? "✔" : "✖"} ${c.name}${detail ? `  (${detail})` : ""}`);
  if (!ok) {
    failed++;
    console.log(`   How to fix: ${c.fix}`);
  }
}
console.log(failed ? `\n${failed} thing${failed === 1 ? "" : "s"} to fix. Fix them, then run \`npm run doctor\` again.` : "\n✔ Everything is ready.");
process.exit(failed ? 1 : 0);
