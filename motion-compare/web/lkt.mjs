import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport:{width:1240,height:340} });
page.on('pageerror', e=>console.log('[err]', e.message));
await page.goto('file:///tmp/lk.html', {waitUntil:'load'});
await page.waitForFunction('window.__ready===true',{timeout:15000});
await page.selectOption('body','').catch(()=>{});
await page.screenshot({path:'/tmp/lk.png'});
await browser.close();
