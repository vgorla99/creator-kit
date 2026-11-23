// Offline check of the B-roll source adapters in lib/stock.mjs: each API's
// documented answer shape -> the shared candidate (file pick, author, licence,
// credit line). No network, no keys.   npm run check:stock

import assert from "node:assert/strict";
import { fromPexels, fromPixabay, fromWikimedia, missingKey } from "./lib/stock.mjs";

const pexels = fromPexels({
  id: 857195,
  width: 1080,
  height: 1920,
  duration: 12,
  url: "https://www.pexels.com/video/waves-on-the-shore-857195/",
  user: { name: "Ana Example", url: "https://www.pexels.com/@ana" },
  video_files: [
    { file_type: "video/mp4", width: 2160, height: 3840, fps: 30, link: "https://x/uhd.mp4" },
    { file_type: "video/mp4", width: 1080, height: 1920, fps: 60, link: "https://x/hd60.mp4" },
    { file_type: "video/mp4", width: 720, height: 1280, fps: 30, link: "https://x/hd30.mp4" },
    { file_type: "video/mp4", width: 1920, height: 1080, fps: 30, link: "https://x/landscape.mp4" },
  ],
  video_pictures: [0, 1, 2, 3, 4].map((i) => ({ picture: `https://x/p${i}.jpg` })),
});
assert.equal(pexels.file.url, "https://x/hd30.mp4", "pexels: portrait, <=30 fps beats 60 fps at 1080");
assert.deepEqual(pexels.preview.frames, ["https://x/p0.jpg", "https://x/p2.jpg", "https://x/p4.jpg"]);
assert.equal(pexels.title, "waves-on-the-shore");
assert.equal(pexels.attributionRequired, false);
assert.match(pexels.credit, /^Video by Ana Example on Pexels/);

const pixabay = fromPixabay({
  id: 1234,
  pageURL: "https://pixabay.com/videos/waves-sea-1234/",
  tags: "waves, sea, beach",
  duration: 9,
  user: "sam_ex",
  user_id: 42,
  videos: {
    large: { url: "", width: 0, height: 0, thumbnail: "" },
    medium: { url: "https://x/m.mp4", width: 1920, height: 1080, thumbnail: "https://x/m.jpg" },
    small: { url: "https://x/s.mp4", width: 1280, height: 720, thumbnail: "https://x/s.jpg" },
    tiny: { url: "https://x/t.mp4", width: 640, height: 360, thumbnail: "https://x/t.jpg" },
  },
});
assert.equal(pixabay.file.url, "https://x/m.mp4", "pixabay: empty large falls back to medium");
assert.equal(pixabay.preview.video, "https://x/t.mp4");
assert.equal(pixabay.authorUrl, "https://pixabay.com/users/sam_ex-42/");
assert.equal(pixabay.license, "Pixabay Content License");

const ext = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { value: v }]));
const page = (meta, extra = {}) => ({
  pageid: 7,
  title: "File:Harbour at dawn.webm",
  imageinfo: [
    {
      mediatype: "VIDEO",
      mime: "video/webm",
      width: 1920,
      height: 1080,
      duration: 8.04,
      url: "https://upload/orig.webm?utm=1",
      descriptionurl: "https://commons.wikimedia.org/wiki/File:Harbour_at_dawn.webm",
      thumburl: "https://thumb/t.jpg?utm=1",
      extmetadata: ext(meta),
    },
  ],
  videoinfo: [
    {
      derivatives: [
        { src: "https://up/240.webm", type: 'video/webm; codecs="vp9, opus"', width: 426, height: 240 },
        { src: "https://up/360.mov", type: 'video/quicktime; codecs="mp4v"', width: 640, height: 360 },
        { src: "https://up/1080.webm", type: 'video/webm; codecs="vp9, opus"', width: 1920, height: 1080 },
        { src: "https://up/2160.webm", type: 'video/webm; codecs="vp9, opus"', width: 3840, height: 2160 },
      ],
    },
  ],
  ...extra,
});
const ccby = fromWikimedia(
  page({
    ObjectName: "Harbour at dawn",
    Artist: '<a href="//commons.wikimedia.org/wiki/User:Kim">Kim &amp; Lee</a>',
    LicenseShortName: "CC BY-SA 4.0",
    LicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    AttributionRequired: "true",
    Restrictions: "personality|trademarked",
  }),
);
assert.equal(ccby.file.url, "https://up/1080.webm", "wikimedia: largest vp9 webm up to 1080 high");
assert.equal(ccby.width, 1920, "size shown is the size downloaded");
assert.equal(ccby.preview.video, "https://up/240.webm");
assert.equal(ccby.author, "Kim & Lee", "HTML stripped from Artist");
assert.equal(ccby.restrictions, "personality, trademarked");
assert.equal(ccby.credit, '"Harbour at dawn" by Kim & Lee, CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0), via Wikimedia Commons (https://commons.wikimedia.org/wiki/File:Harbour_at_dawn.webm), edited');

const cc0 = fromWikimedia(page({ Artist: "Kim", LicenseShortName: "CC0", AttributionRequired: "false" }));
assert.equal(cc0.attributionRequired, false);
assert.equal(cc0.title, "Harbour at dawn.webm", "title falls back to the file name");
assert.equal(fromWikimedia(page({ Artist: "Kim" })), null, "no licence -> skipped");
assert.equal(fromWikimedia(page({ LicenseShortName: "Fair use", NonFree: "true" })), null, "non-free -> skipped");

const stillPage = page({ Artist: "Kim", LicenseShortName: "CC BY 4.0" }, { videoinfo: undefined });
stillPage.imageinfo[0] = { ...stillPage.imageinfo[0], mediatype: "BITMAP", mime: "image/jpeg", thumburl: "https://thumb/1920px-Kiln.JPG?utm=1" };
const still = fromWikimedia(stillPage);
assert.equal(still.kind, "image");
assert.deepEqual(still.file, { url: "https://thumb/1920px-Kiln.JPG", ext: ".jpg" });
assert.equal(still.attributionRequired, true, "missing AttributionRequired = assume credit is needed");

assert.equal(missingKey("wikimedia"), null, "wikimedia needs no key");

console.log("✔ stock adapters: pexels, pixabay, wikimedia");
