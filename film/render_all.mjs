// Parallel renderer: N Chrome pages, each rendering a contiguous range of frames
// straight into its own ffmpeg (image2pipe), then the segments are concatenated.
import puppeteer from 'puppeteer-core';
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const FILE = process.argv[2] || '/workspace/film/res-film.html';
const OUTDIR = process.argv[3] || '/workspace/film/out';
const WORKERS = Number(process.env.WORKERS || 4);
const CHROME = process.env.CHROME;
mkdirSync(OUTDIR, { recursive: true });
const segDir = path.join(OUTDIR, 'seg');
rmSync(segDir, { recursive: true, force: true });
mkdirSync(segDir, { recursive: true });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-gpu'] });
const probe = await browser.newPage();
probe.on('pageerror', e => console.log('PAGEERROR', e.message));
await probe.goto(pathToFileURL(FILE).href + '?bare=1&w=1920', { waitUntil: 'load' });
await probe.waitForFunction('window.__ready===true||window.__error', { timeout: 120000 });
const err = await probe.evaluate(() => window.__error || null);
if (err) throw new Error(err);
const meta = await probe.evaluate(() => ({ N: window.__NDRAW, fps: window.__fps, size: window.__size }));
console.log('film', JSON.stringify(meta));
await probe.close();

const N = meta.N, FPS = meta.fps;
const per = Math.ceil(N / WORKERS);
const ranges = [];
for (let k = 0; k < WORKERS; k++) {
  const a = k * per, b = Math.min(N, a + per);
  if (a < b) ranges.push([a, b]);
}

async function renderRange(k, a, b) {
  const page = await browser.newPage();
  page.on('pageerror', e => { throw new Error(e.message); });
  await page.goto(pathToFileURL(FILE).href + '?bare=1&w=1920', { waitUntil: 'load' });
  await page.waitForFunction('window.__ready===true||window.__error', { timeout: 120000 });
  const seg = path.join(segDir, `seg${String(k).padStart(2, '0')}.mp4`);
  const ff = spawn(FFMPEG, ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-g', '48', seg]);
  const done = new Promise((res, rej) => { ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg ' + c))); ff.on('error', rej); });
  const t0 = Date.now();
  for (let i = a; i < b; i++) {
    const data = await page.evaluate(i => window.__frame(i), i);
    const buf = Buffer.from(data.slice(data.indexOf(',') + 1), 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((i - a) % 500 === 499) console.log(`worker ${k}: ${i - a + 1}/${b - a}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await done;
  await page.close();
  console.log(`worker ${k} done: frames ${a}..${b - 1} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  return seg;
}

const segs = await Promise.all(ranges.map(([a, b], k) => renderRange(k, a, b)));
await browser.close();

const listFile = path.join(segDir, 'list.txt');
writeFileSync(listFile, segs.map(s => `file '${s}'`).join('\n') + '\n');
const film = path.join(OUTDIR, 'res-film.mp4');
execFileSync(FFMPEG, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', film]);
console.log('wrote', film);
if (existsSync('/workspace/film/out/narration.wav')) {
  const final = path.join(OUTDIR, 'res-film-final.mp4');
  execFileSync(FFMPEG, ['-v', 'error', '-y', '-i', film, '-i', '/workspace/film/out/narration.wav',
    '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', final]);
  console.log('wrote', final);
}
