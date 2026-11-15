import assert from 'node:assert/strict';
import {readFile,readdir,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve,extname} from 'node:path';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=await import(wranglerRequire.resolve('miniflare'));
const files=(await readdir('dist/server',{recursive:true})).filter(f=>/\.m?js$/.test(f));
const mf=new Miniflare({modules:['index.js',...files.filter(f=>f!=='index.js')].map(f=>({type:'ESModule',path:resolve('dist/server',f)})),modulesRoot:resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{SALES_MARGIN:'0',INTERNAL_COST_CARD:await readFile(process.env.GF_TEST_RATES||'tests/fixtures/rates.json','utf8')}});
let browser,server;
try{
 const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve('dist/client','.'+path),root=resolve('dist/client')+'/';if(file.startsWith(root)&&!path.startsWith('/api/')){try{const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(bytes);return;}catch{}}
 const chunks=[];for await(const c of req)chunks.push(c);const response=await mf.dispatchFetch(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});res.statusCode=response.status;for(const [k,v]of response.headers)if(k!=='set-cookie')res.setHeader(k,v);const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle",'--use-angle='+(process.env.GF_TEST_ANGLE||'swiftshader')],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
 // Training mat as a product (owner 15.11.2026): any size, rubber variant, Studio drills, no concrete.
 const W=Number(process.env.GF_TEST_WIDTH||1440);
 const page=await browser.newPage({viewport:{width:W,height:900}});
 const shot=n=>page.screenshot({path:`test-results/${n}-${W}.png`}).catch(()=>{});
 const badgeIs=t=>page.waitForFunction(t=>new RegExp(t).test((document.querySelector('.studio-quote-badge b')?.textContent||'').replace(/ /g,' ')),t,{timeout:30000});
 await page.goto(base+'/');await page.waitForTimeout(3000);
 const tile=page.getByRole('button',{name:'Maty treningowe',exact:true});await tile.waitFor();
 assert.match(await page.locator('.hub26-mat').innerText(),/od 600\s?zł netto/);
 await tile.click();
 const panel=page.locator('.studio-mat-panel');await panel.waitFor({timeout:60000});
 assert.equal(await page.getByRole('navigation',{name:'Kroki projektu'}).count(),0,'no court steps for a mat');
 await badgeIs('^Mata 1100 zł netto$');
 await panel.getByRole('button',{name:/^2 × 2 m/}).click();await badgeIs('^Mata 700 zł netto$');
 await panel.getByRole('radio',{name:/^Premium/}).check();await badgeIs('^Mata 1400 zł netto$');
 await panel.getByLabel('Długość (m)').fill('2,5');await panel.getByLabel('Szerokość (m)').fill('1,5');await badgeIs('^Mata 1300 zł netto$');
 await panel.getByLabel('Szerokość (m)').fill('0,7');assert.equal(await panel.getByLabel('Szerokość (m)').getAttribute('aria-invalid'),'true');
 await panel.getByLabel('Szerokość (m)').fill('2');await badgeIs('^Mata 1700 zł netto$');
 await page.getByRole('button',{name:/^Dodaj: Slalom/}).first().click();await page.waitForTimeout(1500);
 assert.match(await page.locator('.studio-mat-warning').innerText(),/Nie mieści się na macie 2,5 × 2 m: Slalom/,'oversized drill flagged');
 await badgeIs('^Mata 2100 zł netto$');
 // Order: own size (2,5 × 2 m) goes by inquiry with the gross price; shipping quoted after the address.
 const order=panel.locator('.studio-shop-order');await order.waitFor();
 assert.match(await order.innerText(),/2\s?583\s?zł[\s\S]*wysyłkę wyceniamy po podaniu adresu/);
 const cta=order.locator('.studio-shop-cta');assert.match(await cta.innerText(),/Zamów/);assert.match(await cta.getAttribute('href'),/kontakt/);
 assert.match(decodeURIComponent((await cta.getAttribute('href')).replace(/\+/g,' ')),/Mata treningowa 2,5 × 2 m · Premium · ćwiczenia: Slalom/);
 await shot('mat-editor');
 await page.getByRole('button',{name:'Podsumowanie',exact:true}).first().click();
 const text=await page.locator('.studio-project-quote').first().innerText();
 assert.match(text,/Cena maty/);assert.match(text,/Mata treningowa · Premium[\s\S]*1700\s?zł netto/);assert.match(text,/Nadruk ćwiczeń[\s\S]*400\s?zł netto/);assert.match(text,/Razem: 2100\s?zł netto/);assert.match(text,/Wysyłkę wyceniamy po podaniu adresu/);assert.doesNotMatch(text,/betonow|Konstrukcja boiska/);
 await shot('mat-summary');
 await page.evaluate(()=>{window.print=()=>{}});
 const b=page.getByRole('button',{name:'Pobierz kartę projektu (PDF)'});await b.waitFor({state:'visible'});await page.waitForTimeout(1500);await b.click();
 await page.waitForFunction(()=>Array.from(document.querySelectorAll('iframe')).some(f=>f.contentDocument?.title?.startsWith('Gamefields — karta projektu')),null,{timeout:60000});
 const card=await page.evaluate(()=>{const f=Array.from(document.querySelectorAll('iframe')).find(x=>x.contentDocument?.title?.startsWith('Gamefields — karta projektu'));return {text:f.contentDocument.body.innerText,html:f.contentDocument.documentElement.outerHTML,img:f.contentDocument.querySelector('.img img')?.getAttribute('src')?.slice(0,26)}});
 assert.match(card.text,/Mata treningowa/);assert.match(card.text,/Wymiary\s+2,5 × 2 m/);assert.match(card.text,/Ćwiczenia\s+.*Slalom/);assert.match(card.text,/Cena maty \(netto\)/);assert.match(card.text,/Nadruk ćwiczeń na macie\s+400\s?zł/);assert.match(card.text,/Razem\s+2100\s?zł/);
 assert.doesNotMatch(card.text,/Konstrukcja|betonow/);assert.equal(card.img,'data:image/svg+xml;charset','2D plan of the mat on the card');
 const c=await browser.newPage({viewport:{width:794,height:1123}});await c.setContent(card.html);await c.waitForTimeout(500);await c.screenshot({path:`test-results/mat-card-${W}.png`}).catch(()=>{});
 console.log('PASS: training mat from the hub: sizes, rubber variants, drills, price without concrete, summary and PDF card with the 2D plan');
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose();}
