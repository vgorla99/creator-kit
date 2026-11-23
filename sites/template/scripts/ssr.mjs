// Shared by the build scripts: the compiled site (build/ssr) and dist paths.
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const dist = join(root, "dist");
const entry = join(root, "build", "ssr", "entry-server.js");

/** @returns {Promise<typeof import("../src/entry-server")>} */
export async function loadSite() {
  if (!existsSync(entry)) throw new Error("build/ssr is missing. Run `npm run build` first.");
  return import(pathToFileURL(entry).href);
}

/** dist/about/index.html for "/about/". */
export const htmlFileFor = (path) => join(dist, ...path.split("/").filter(Boolean), "index.html");

/** Every .html file under dist/. */
export function htmlFiles(dir = dist) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return htmlFiles(full);
    return name.endsWith(".html") ? [full] : [];
  });
}
