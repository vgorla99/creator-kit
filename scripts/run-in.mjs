// node scripts/run-in.mjs <folder> <npm script> [extra args]
//
// Runs an npm script of a kit package that has its own packages (the dashboard,
// the HyperFrames studio) from the kit's main folder, so nobody has to `cd`.
// Checks the Node.js version the package asks for and installs its packages
// first if they are missing. Used by root scripts like `npm run dashboard`.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const [folder, script, ...extra] = process.argv.slice(2);
if (!folder || !script) {
  console.error("Usage: node scripts/run-in.mjs <folder> <npm script> [extra args]");
  process.exit(1);
}
const dir = join(REPO, folder);
const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));

// "engines": { "node": ">=22.18" } → [22, 18]
const want = /(\d+)(?:\.(\d+))?/.exec(pkg.engines?.node ?? "") ?? [];
const [needMajor, needMinor] = [Number(want[1] ?? 0), Number(want[2] ?? 0)];
const [major, minor] = process.versions.node.split(".").map(Number);
if (major < needMajor || (major === needMajor && minor < needMinor)) {
  console.error(`✖ ${folder} needs Node.js ${needMajor}.${needMinor} or newer; you have ${process.versions.node}.`);
  console.error("  How to fix: run the setup again, or install the current Node.js LTS from https://nodejs.org, then open a new terminal.");
  process.exit(1);
}

// HyperFrames sends anonymous usage data unless this is set. The kit keeps it off;
// set HYPERFRAMES_NO_TELEMETRY=0 yourself if you want to share it.
const env = { ...process.env, HYPERFRAMES_NO_TELEMETRY: process.env.HYPERFRAMES_NO_TELEMETRY ?? "1" };

/** Runs npm with these args inside the package folder, output straight to this terminal. @param {string[]} args */
function npm(args) {
  // npm sets npm_execpath when it runs a script: calling it with node avoids a shell (and its quoting).
  const npmCli = process.env.npm_execpath;
  const res = npmCli
    ? spawnSync(process.execPath, [npmCli, ...args], { cwd: dir, env, stdio: "inherit" })
    : spawnSync("npm", args, { cwd: dir, env, stdio: "inherit", shell: true });
  return res.status ?? 1;
}

if (!existsSync(join(dir, "node_modules"))) {
  console.log(`Installing the packages for ${folder} (first time only)…`);
  if (npm(["ci", "--no-audit", "--no-fund"]) !== 0) {
    console.error(`✖ Could not install the packages for ${folder}. Check your internet connection and try again.`);
    process.exit(1);
  }
}

process.exit(npm(["run", script, ...(extra.length ? ["--", ...extra] : [])]));
