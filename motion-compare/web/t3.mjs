import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH, args:['--no-sandbox','--disable-gpu','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'] });
const p = await b.newPage({ viewport:{width:800,height:400} });
p.on('pageerror', e=>console.log('[err]', e.message));
await p.goto('file:///tmp/t3.html', {waitUntil:'load'});
await p.waitForFunction('window.__ready===true',{timeout:15000});
await p.waitForTimeout(300);
await p.screenshot({path:'/tmp/t3.png'});
await b.close();
