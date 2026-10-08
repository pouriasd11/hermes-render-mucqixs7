// Generic deterministic frame-capture harness.
// Renders an HTML page frame-by-frame via Playwright (remotion's headless
// shell), saves PNGs, then encodes them with FFmpeg.
//
// Usage: node harness.mjs <htmlFile> <outFile> [fps] [frames] [width] [height]
import { chromium } from "playwright";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [, , htmlFile, outFile, fpsArg, framesArg, wArg, hArg] = process.argv;
if (!htmlFile || !outFile) {
  console.error("usage: node harness.mjs <htmlFile> <outFile> [fps] [frames] [w] [h]");
  process.exit(1);
}
const fps = Number(fpsArg) || 30;
const total = Number(framesArg) || 90;
const width = Number(wArg) || 1280;
const height = Number(hArg) || 720;

const framesDir = path.join("/tmp", "mc-frames-" + path.basename(htmlFile));
fs.rmSync(framesDir, { recursive: true, force: true });
fs.mkdirSync(framesDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH,
  args: [
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--allow-file-access-from-files",
  ],
});
const page = await browser.newPage({
  viewport: { width, height },
  deviceScaleFactor: 1,
});
page.on("console", (m) => console.log("[browser]", m.text()));
page.on("pageerror", (e) => console.error("[pageerror]", e.message));

await page.goto("file://" + path.resolve(htmlFile), { waitUntil: "load" });
await page.waitForFunction("window.__ready === true", { timeout: 30000 });

for (let i = 0; i < total; i++) {
  await page.evaluate(([idx, t]) => window.renderFrame(idx, t), [i, total]);
  await page.screenshot({
    path: path.join(framesDir, String(i).padStart(5, "0") + ".png"),
  });
  if (i % 15 === 0) console.log(`captured ${i}/${total}`);
}
await browser.close();

const ff = process.env.FFMPEG || "ffmpeg";
const res = spawnSync(
  ff,
  [
    "-y",
    "-framerate",
    String(fps),
    "-i",
    path.join(framesDir, "%05d.png"),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-crf",
    "18",
    outFile,
  ],
  { stdio: "inherit" },
);
if (res.status !== 0) {
  console.error("ffmpeg failed");
  process.exit(1);
}
console.log("DONE:", outFile);
