// Headless render harness for Motion Canvas.
// 1. starts the vite dev server (motion-canvas + ffmpeg plugins)
// 2. loads /render.html in headless Chromium (Playwright)
// 3. collects PNG frames via an exposed function
// 4. encodes them with FFmpeg
import { chromium } from "playwright";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const OUT = process.env.OUT || "/workspace/motion-compare/outputs/02-motion-canvas.mp4";
const PORT = Number(process.env.PORT) || 5199;
const FPS = 30;
const framesDir = "/tmp/mc-motion-canvas-frames";
fs.rmSync(framesDir, { recursive: true, force: true });
fs.mkdirSync(framesDir, { recursive: true });

const vite = spawn(
  "npx",
  ["vite", "--port", String(PORT), "--strictPort", "--host", "127.0.0.1"],
  { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"] },
);
vite.stdout.on("data", (d) => process.stdout.write("[vite] " + d));
vite.stderr.on("data", (d) => process.stderr.write("[vite] " + d));

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/render.html`);
      if (res.ok) return;
    } catch {}
    await wait(500);
  }
  throw new Error("vite server did not start");
}

let browser;
try {
  await waitForServer();
  console.log("vite up; launching browser");

  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on("console", (m) => console.log("[browser]", m.text()));
  page.on("pageerror", (e) => console.error("[pageerror]", e.message));

  let count = 0;
  await page.exposeFunction("__capture", (frame, dataUrl) => {
    const b64 = dataUrl.split(",")[1];
    fs.writeFileSync(
      path.join(framesDir, String(frame).padStart(6, "0") + ".png"),
      Buffer.from(b64, "base64"),
    );
    count++;
  });

  await page.goto(`http://127.0.0.1:${PORT}/render.html`, { waitUntil: "load" });
  await page.waitForFunction("window.__done === true", { timeout: 180000 });
  const err = await page.evaluate("window.__error");
  if (err) throw new Error("render failed: " + err);
  console.log(`captured ${count} frames`);
} finally {
  if (browser) await browser.close();
  vite.kill("SIGKILL");
}

const ff = process.env.FFMPEG || "ffmpeg";
const res = spawnSync(
  ff,
  [
    "-y",
    "-framerate",
    String(FPS),
    "-i",
    path.join(framesDir, "%06d.png"),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-crf",
    "18",
    OUT,
  ],
  { stdio: "inherit" },
);
if (res.status !== 0) process.exit(1);
console.log("DONE:", OUT);
