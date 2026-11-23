// Self-check for src/footage/Captions.tsx: sentences the headline / CTA button
// already shows are skipped, everything else is captioned in 1–3 word chunks.
// Number words are matched per language (brand.language): English and German.
//
//   npm run check:captions

import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { buildSync } from "esbuild";
import { ROOT } from "./lib/media.mjs";

const out = join(ROOT, "out", "_tmp", "captions-check.mjs");
mkdirSync(join(ROOT, "out", "_tmp"), { recursive: true });
buildSync({ entryPoints: [join(ROOT, "src", "footage", "Captions.tsx")], bundle: true, platform: "node", format: "esm", packages: "external", loader: { ".yaml": "text" }, outfile: out, logLevel: "error" });
const { captionChunks, langOf } = await import(pathToFileURL(out).href);

const line = { from: 0, to: 120, at: 0 };
const shown = (text, head, lang = "en") => captionChunks([line], [{ text, head }], lang).map((c) => c.words.map((w) => w.text).join(" "));

// Language tags from brand.language.
assert.equal(langOf(undefined), "en");
assert.equal(langOf("en-GB"), "en");
assert.equal(langOf("de-AT"), "de");
assert.equal(langOf("pt"), "en"); // no table yet -> English

// ── English (the default) ──
// Number words match the headline's digits; the new part of the line stays.
assert.deepEqual(shown("Eight steps. One plan. What is inside?", "8 STEPS. 1 PLAN."), ["What is inside?"]);
assert.deepEqual(shown("Three: shorter, but more often. Two small rounds instead of one big one.", "3. SHORTER, BUT MORE OFTEN."), [
  "Two small rounds",
  "instead of one",
  "big one.",
]);
// Filler words don't keep a sentence the headline already says.
assert.deepEqual(shown("Coffee is a treat. Your body notices.", "COFFEE: A TREAT."), ["Your body notices."]);
assert.deepEqual(shown("Sadly a myth.", "SADLY A MYTH."), []);
// The CTA button covers "link in bio."
assert.deepEqual(shown("All the details: link in bio.", "LINK IN BIO"), ["All the details:"]);
// No headline -> everything is captioned.
assert.deepEqual(shown("I have got your back.", ""), ["I have got", "your back."]);
// A sentence that is mostly new stays whole; filler-only scraps between skipped sentences go.
assert.deepEqual(shown("The whole recipe is behind the link in bio.", "LINK IN BIO"), ["The whole recipe", "is behind the", "link in bio."]);
assert.deepEqual(shown("And: keep your shoulders loose. That gives more calm.", "KEEP YOUR SHOULDERS LOOSE."), ["That gives more calm."]);
// The table follows the language: English number words mean nothing in German, and the other way round.
assert.deepEqual(shown("Twelve tips.", "12 TIPS"), []);
assert.deepEqual(shown("Twelve tips.", "12 TIPS", "de"), ["Twelve tips."]);

// ── German ──
assert.deepEqual(shown("Acht Schritte. Ein Plan. Was steckt drin?", "8 SCHRITTE. 1 PLAN.", "de"), ["Was steckt drin?"]);
assert.deepEqual(shown("Eins: kürzer, dafür öfter. Drei kleine Runden statt einer großen.", "1. KÜRZER, DAFÜR ÖFTER.", "de"), ["Drei kleine Runden", "statt einer großen."]);
assert.deepEqual(shown("Kaffee ist ein Genussmittel. Der Körper merkt es.", "KAFFEE: GENUSSMITTEL.", "de"), ["Der Körper merkt es."]);
assert.deepEqual(shown("Leider ein Mythos.", "LEIDER EIN MYTHOS.", "de"), []);
assert.deepEqual(shown("Alle Details: Link in Bio.", "LINK IN BIO", "de"), ["Alle Details:"]);
assert.deepEqual(shown("Ich passe auf dich auf.", "", "de"), ["Ich passe auf", "dich auf."]);
assert.deepEqual(shown("Das ganze Rezept findest du über den Link in Bio.", "LINK IN BIO", "de"), ["Das ganze Rezept", "findest du über", "den Link in Bio."]);
assert.deepEqual(shown("Und: Schultern locker lassen. Das gibt mehr Ruhe.", "SCHULTERN LOCKER LASSEN.", "de"), ["Das gibt mehr Ruhe."]);
assert.deepEqual(shown("Zwölf Tipps.", "12 TIPPS", "de"), []);
assert.deepEqual(shown("Zwölf Tipps.", "12 TIPPS"), ["Zwölf Tipps."]);

console.log("✔ captions check passed (English + German)");
