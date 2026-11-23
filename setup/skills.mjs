// node setup/skills.mjs --parts reels,sites --engine remotion [--yes] [--optional a,b] [--list]
//
// Installs the third-party skills and plugins in setup/skills.lock.yaml that the
// chosen parts need. Each skill is checked out from its own repo at the pinned
// commit, patched if the lock says so, and copied to .claude/skills/<name>/
// (git-ignored). Safe to run again: a skill already at its pinned commit is skipped.
//
// --yes       never ask; install required skills only (plus --optional names)
// --optional  comma-separated optional skills to install without asking
// --list      print what would be installed and exit

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const SKILLS = join(REPO, ".claude", "skills");
const CACHE = join(REPO, "setup", ".cache");
const MARKER = ".creator-kit.json";
const PARTS = ["reels", "sites"];
const ENGINES = ["remotion", "hyperframes"];

function fail(msg) {
  console.error(`\n✖ ${msg}`);
  process.exit(1);
}

function args() {
  const out = { parts: [], engine: "remotion", yes: false, optional: [], list: false };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--yes") out.yes = true;
    else if (a === "--list") out.list = true;
    else if (a === "--parts") out.parts = (argv[++i] ?? "").split(",").filter(Boolean);
    else if (a === "--engine") out.engine = argv[++i] ?? "";
    else if (a === "--optional") out.optional = (argv[++i] ?? "").split(",").filter(Boolean);
    else fail(`Unknown option "${a}". Usage: node setup/skills.mjs --parts reels,sites --engine remotion [--yes]`);
  }
  if (!out.parts.length || out.parts.some((p) => !PARTS.includes(p))) fail(`--parts must be reels, sites or reels,sites (got "${out.parts.join(",")}").`);
  if (!ENGINES.includes(out.engine)) fail(`--engine must be remotion or hyperframes (got "${out.engine}").`);
  return out;
}

function readLock() {
  const lock = parse(readFileSync(join(REPO, "setup", "skills.lock.yaml"), "utf8"));
  const skills = lock?.skills ?? [];
  const plugins = lock?.plugins ?? [];
  for (const s of skills) {
    for (const k of ["name", "repo", "path", "commit", "licence", "for", "engine"]) {
      if (!s[k] || typeof s[k] !== "string") fail(`setup/skills.lock.yaml: skill "${s.name ?? "?"}" is missing "${k}".`);
    }
    if (!/^[a-z0-9-]+$/.test(s.name)) fail(`setup/skills.lock.yaml: "${s.name}" is not a valid skill name.`);
    if (!/^[0-9a-f]{40}$/.test(s.commit)) fail(`setup/skills.lock.yaml: "${s.name}" needs a full 40-character commit.`);
    if (!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(s.repo)) fail(`setup/skills.lock.yaml: "${s.name}" repo must be https://github.com/<owner>/<repo>.`);
    if (s.path.split(/[\\/]/).includes("..")) fail(`setup/skills.lock.yaml: "${s.name}" path may not contain "..".`);
  }
  return { skills, plugins };
}

const wanted = (item, o) => (item.for === "all" || o.parts.includes(item.for)) && (!item.engine || item.engine === "any" || (o.parts.includes("reels") && item.engine === o.engine));

// git runs directly. Other tools (claude) may be a .cmd shim on Windows, which needs a
// shell; their arguments are fixed words from the lock file, checked below.
function run(cmd, argv, cwd) {
  const viaShell = process.platform === "win32" && cmd !== "git";
  if (viaShell && !argv.every((a) => /^[\w.@:/-]+$/.test(a))) fail(`Refusing to run ${cmd} with unexpected characters: ${argv.join(" ")}`);
  const res = viaShell
    ? spawnSync([cmd, ...argv].join(" "), { cwd, encoding: "utf8", shell: true })
    : spawnSync(cmd, argv, { cwd, encoding: "utf8" });
  return { ok: res.status === 0, out: `${res.stdout ?? ""}${res.stderr ?? ""}`.trim() };
}

function git(cwd, ...argv) {
  const res = run("git", ["-c", "core.autocrlf=false", "-c", "core.longpaths=true", "-c", "advice.detachedHead=false", ...argv], cwd);
  if (!res.ok) throw new Error(`git ${argv[0]} failed: ${res.out.split("\n").slice(-3).join(" ")}`);
  return res.out;
}

function patchHash(s) {
  if (!s.patch) return null;
  const file = join(REPO, "setup", "patches", s.patch);
  if (!existsSync(file)) fail(`setup/patches/${s.patch} (listed for ${s.name}) is missing.`);
  return createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 16);
}

function upToDate(s) {
  const marker = join(SKILLS, s.name, MARKER);
  if (!existsSync(marker)) return false;
  const m = JSON.parse(readFileSync(marker, "utf8"));
  return m.repo === s.repo && m.path === s.path && m.commit === s.commit && m.patch === patchHash(s);
}

// One cached checkout per repo, fetched shallow at the pinned commit (blobs on demand).
function checkout(s) {
  const dir = join(CACHE, s.repo.replace("https://github.com/", "").replace("/", "__"));
  mkdirSync(dir, { recursive: true });
  if (!existsSync(join(dir, ".git"))) {
    git(dir, "init", "-q");
    git(dir, "remote", "add", "origin", s.repo);
    // What `git clone --filter=blob:none` sets: fetch file contents only when checked out.
    git(dir, "config", "remote.origin.promisor", "true");
    git(dir, "config", "remote.origin.partialclonefilter", "blob:none");
  }
  git(dir, "fetch", "-q", "--depth", "1", "--filter=blob:none", "origin", s.commit);
  // Sparse checkout: only this skill's folder is downloaded and written to disk.
  if (s.path === ".") git(dir, "sparse-checkout", "disable");
  else git(dir, "sparse-checkout", "set", "--no-cone", `/${s.path}/`);
  git(dir, "checkout", "-q", "--force", s.commit);
  if (s.patch) git(dir, "apply", "--whitespace=nowarn", join(REPO, "setup", "patches", s.patch));
  return join(dir, s.path);
}

function install(s) {
  const dest = join(SKILLS, s.name);
  if (existsSync(dest) && !existsSync(join(dest, MARKER))) {
    throw new Error(`.claude/skills/${s.name} already exists and was not installed by setup, so it was left alone. Rename it and run setup again to install the pinned version.`);
  }
  const src = checkout(s);
  rmSync(dest, { recursive: true, force: true });
  cpSync(src, dest, {
    recursive: true,
    // Skip git metadata and symlinks (Windows may not allow them; no skill here needs one).
    filter: (from) => !relative(src, from).split(sep).includes(".git") && !lstatSync(from).isSymbolicLink(),
  });
  writeFileSync(join(dest, MARKER), `${JSON.stringify({ repo: s.repo, path: s.path, commit: s.commit, licence: s.licence, patch: patchHash(s) }, null, 2)}\n`);
}

async function pickOptional(optional, o) {
  const chosen = optional.filter((s) => o.optional.includes(s.name));
  const rest = optional.filter((s) => !o.optional.includes(s.name));
  if (o.yes || !rest.length || !process.stdin.isTTY) return chosen;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  console.log("\nOptional skills. Answer y or n for each (Enter = no):");
  for (const s of rest) {
    const a = (await rl.question(`  ${s.name}: ${s.why}? [y/N] `)).trim().toLowerCase();
    if (a === "y" || a === "yes") chosen.push(s);
  }
  rl.close();
  return chosen;
}

function installPlugins(plugins) {
  if (!plugins.length) return [];
  if (!run("claude", ["--version"], REPO).ok) {
    console.log(`\n• Claude Code is not installed yet, so these plugins were skipped: ${plugins.map((p) => p.name).join(", ")}.`);
    console.log("  Install Claude Code, then run setup again to add them.");
    return [];
  }
  const failed = [];
  for (const p of plugins) {
    const res = run("claude", ["plugin", "install", p.id, "--scope", "local"], REPO);
    if (res.ok || /already installed/i.test(res.out)) console.log(`  ✔ plugin ${p.name}`);
    else {
      failed.push(p.name);
      console.log(`  ✖ plugin ${p.name}: ${res.out.split("\n").slice(-2).join(" ")}`);
    }
  }
  return failed;
}

async function main() {
  const o = args();
  const { skills, plugins } = readLock();
  const mine = skills.filter((s) => wanted(s, o));
  const required = mine.filter((s) => s.required !== false);
  const optional = mine.filter((s) => s.required === false);
  const myPlugins = plugins.filter((p) => p.required !== false && wanted(p, o));

  if (o.list) {
    console.log(`Skills for ${o.parts.join(" + ")}${o.parts.includes("reels") ? ` (${o.engine})` : ""}:`);
    for (const s of required) console.log(`  ${s.name}  (${s.licence})  ${s.why}`);
    if (optional.length) console.log(`  optional, asked later: ${optional.map((s) => s.name).join(", ")}`);
    if (myPlugins.length) console.log(`Plugins: ${myPlugins.map((p) => p.name).join(", ")}`);
    return;
  }

  const todo = [...required, ...(await pickOptional(optional, o))];
  console.log(`\nInstalling ${todo.length} skills from their own repositories into .claude/skills/:`);
  const failed = [];
  for (const s of todo) {
    if (upToDate(s)) {
      console.log(`  ✔ ${s.name} (already at ${s.commit.slice(0, 7)})`);
      continue;
    }
    try {
      install(s);
      console.log(`  ✔ ${s.name} (${s.licence}, ${s.commit.slice(0, 7)}${s.patch ? `, patched: ${s.patch}` : ""})`);
    } catch (err) {
      failed.push(s.name);
      console.log(`  ✖ ${s.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  failed.push(...installPlugins(myPlugins));

  if (failed.length) {
    fail(`Could not install: ${failed.join(", ")}.\n  Check your internet connection and run setup again. Skills that worked are kept.`);
  }
  console.log("✔ Skills ready.");
}

await main();
