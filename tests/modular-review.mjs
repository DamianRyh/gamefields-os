import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
const html=await readFile('dist/modular-review/index.html');
const server=createServer((request,response)=>{response.setHeader('Content-Type','text/html; charset=utf-8');response.end(html);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[],external=[];
 page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(!request.url().startsWith(base))external.push(request.url());});
 await page.goto(base);await page.locator('[data-instance-id]').first().waitFor();
 const count=await page.locator('[data-instance-id]').count();const budget=await page.getByTestId('live-budget').innerText();
 await page.getByRole('slider',{name:/^Długość/}).press('ArrowRight');
 await page.waitForFunction(count=>document.querySelectorAll('[data-instance-id]').length>count,count);
 assert.notEqual(await page.getByTestId('live-budget').innerText(),budget);
 assert.ok(await page.locator('[data-component="PANEL_STANDARD"]').evaluateAll(nodes=>nodes.every(node=>node.style.width==='51px')));
 await page.getByRole('slider',{name:/^Piłkochwyt/}).press('Home');await page.waitForFunction(()=>!document.querySelector('[data-component="BALLSTOP_POST"]'));
 await page.getByRole('link',{name:'COMPONENT LIBRARY v1.0 ↗'}).click();await page.getByRole('heading',{name:'Komponenty, nie skalowany model.'}).waitFor();assert.equal(await page.locator('article').count(),12);
 await page.getByRole('link',{name:'← MODULAR PRODUCT'}).click();await page.getByTestId('live-bom').waitFor();
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 console.log('PASS: static public review, live modular growth, budget, fixed panel sizes, upper layer, catalogue navigation and mobile; no external requests or runtime errors.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
