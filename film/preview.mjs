import puppeteer from 'puppeteer-core';
import {pathToFileURL} from 'node:url';
import fs from 'node:fs';
const file = process.argv[2] || '/workspace/film/res-film.html';
const out = process.argv[3] || '/tmp/prev';
const frames = (process.argv[4]||'0,12,24,36,48,60').split(',').map(Number);
const browser = await puppeteer.launch({executablePath: process.env.CHROME, headless:true, args:['--no-sandbox','--disable-gpu']});
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR', e.message));
page.on('console', m => { if(m.type()==='error') console.log('CONSOLE', m.text()); });
await page.goto(pathToFileURL(file).href+'?bare=1&w=1920',{waitUntil:'load'});
await page.waitForFunction('window.__ready===true||window.__error',{timeout:60000});
const err = await page.evaluate(()=>window.__error||null);
if(err){ console.log('ERROR', err); process.exit(1);}
console.log('meta', JSON.stringify(await page.evaluate(()=>({N:window.__NDRAW,fps:window.__fps,size:window.__size}))));
fs.mkdirSync(out,{recursive:true});
const t0=Date.now();
for(const i of frames){ const d = await page.evaluate(i=>window.__frame(i), i); fs.writeFileSync(`${out}/f${String(i).padStart(4,'0')}.png`, Buffer.from(d.split(',')[1],'base64')); }
console.log(frames.length,'frames in',Date.now()-t0,'ms');
await browser.close();
