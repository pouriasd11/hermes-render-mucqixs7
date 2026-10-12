import puppeteer from 'puppeteer-core';
import {pathToFileURL} from 'node:url';
import fs from 'node:fs';
const browser = await puppeteer.launch({executablePath: process.env.CHROME, headless:true, args:['--no-sandbox','--disable-gpu']});
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR', e.message));
page.on('console', m => { if(m.type()==='error') console.log('CONSOLE', m.text().slice(0,200)); });
await page.goto(pathToFileURL('/workspace/film/res-film.html').href+'?bare=1&w=1920',{waitUntil:'load'});
await page.waitForFunction('window.__ready===true||window.__error',{timeout:60000});
console.log('meta', JSON.stringify(await page.evaluate(()=>({N:window.__NDRAW,size:window.__size}))));
const marks = await page.evaluate(()=>{ const T=window.__FILM.timeline; let acc=0; const out=[]; for(const s of T){ out.push({name:s.name, dur:s.dur, start:acc}); acc+=s.dur; } return out; });
const targets=[];
for(const m of marks){ for(const f of [0.35,0.7,0.95]) targets.push([m.name, Math.round((m.start+m.dur*f)*24)]); }
fs.mkdirSync('/tmp/scenes',{recursive:true});
for(const [name,i] of targets){ const d=await page.evaluate(i=>window.__frame(i), i); fs.writeFileSync(`/tmp/scenes/${name}_${String(i).padStart(4,'0')}.png`, Buffer.from(d.split(',')[1],'base64')); }
console.log('wrote', targets.length, 'frames');
await browser.close();
