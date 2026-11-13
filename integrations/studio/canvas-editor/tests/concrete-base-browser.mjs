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
 const rates=JSON.parse(await readFile(process.env.GF_TEST_RATES||'tests/fixtures/rates.json','utf8')),arena=rates.arenaNet.o1;
 const pl=n=>new Intl.NumberFormat('pl-PL',{maximumFractionDigits:0}).format(n).replace(/\s/g,'\\s?');
 const shot=name=>page.screenshot({path:`test-results/${name}.png`}).catch(()=>{});
 const page=await browser.newPage({viewport:{width:Number(process.env.GF_TEST_WIDTH||1200),height:900}});
 await page.goto(base+'/?arena=o1&tool=construction');
 await page.locator('[data-model="o1"][data-ready="true"]').first().waitFor({timeout:90000});
 const badgeIs=t=>page.waitForFunction(t=>new RegExp(t).test(document.querySelector('.studio-quote-badge b')?.textContent||''),t,{timeout:30000});
 const steps=page.getByRole('navigation',{name:'Kroki projektu'});
 // Concrete base: included by default, own price next to the construction.
 const toggle=page.getByRole('checkbox',{name:/Nawierzchnia betonowa/});
 await toggle.waitFor({state:'visible',timeout:30000});
 assert.ok(await toggle.isChecked(),'concrete base included by default');
 assert.match(await page.locator('.studio-concrete-base').first().innerText(),/9\s?100\s?zł netto/);
 await badgeIs(`^Konstrukcja ${pl(arena)}\\s?zł · Nawierzchnia `);
 await shot('concrete-toggle');
 // Painting: choose variants in Nawierzchnia → Materiał.
 await steps.getByRole('button',{name:/Nawierzchnia/}).click();
 await page.getByRole('navigation',{name:'Ustawienia nawierzchni'}).getByRole('button',{name:'Materiał'}).click();
 const auto=page.getByRole('radio',{name:/Dobierz do projektu/});await auto.waitFor({timeout:30000});
 assert.ok(await auto.isChecked(),'variant chosen from the design by default');
 await page.getByRole('radio',{name:/^Jednokolorowa(?! z)/}).check();
 await badgeIs(`Nawierzchnia ${pl(9100+2500)}\\s?zł netto$`);
 await page.getByRole('radio',{name:/Wzór zaawansowany/}).check();
 await badgeIs(`Nawierzchnia ${pl(9100+5900)}\\s?zł netto$`);
 await page.locator('.studio-paint-variant').scrollIntoViewIfNeeded();await shot('paint-choice');
 // Summary: separate rows and the total.
 await steps.getByRole('button',{name:'Podsumowanie',exact:true}).click();
 const summary=page.locator('.studio-project-quote').first();await summary.waitFor();
 const text=await summary.innerText();
 assert.match(text,/Cena konstrukcji i nawierzchni/);
 assert.match(text,new RegExp(`Konstrukcja boiska[\\s\\S]*${pl(arena)}\\s?zł netto`));
 assert.match(text,/Nawierzchnia betonowa[\s\S]*9\s?100\s?zł netto/);
 assert.match(text,/Malowanie · Wzór zaawansowany[\s\S]*5\s?900\s?zł netto/);
 assert.match(text,new RegExp(`Razem: ${pl(arena+15000)}\\s?zł netto`));
 await shot('concrete-summary');
 // PDF card: the same rows.
 const button=page.getByRole('button',{name:'Pobierz kartę konstrukcji (PDF)'});
 await button.waitFor({state:'visible'});await page.waitForTimeout(2000);await button.click();
 await page.waitForFunction(()=>Array.from(document.querySelectorAll('iframe')).some(f=>f.contentDocument?.title?.startsWith('Gamefields — karta projektu')),null,{timeout:90000});
 const card=await page.evaluate(()=>{const f=Array.from(document.querySelectorAll('iframe')).find(x=>x.contentDocument?.title?.startsWith('Gamefields — karta projektu'));return {text:f.contentDocument.body.innerText,html:f.contentDocument.documentElement.outerHTML}});
 assert.match(card.text,/Cena konstrukcji i nawierzchni/);assert.match(card.text,/Malowanie · Wzór zaawansowany\s+5\s?900/);assert.match(card.text,new RegExp(`Razem\\s+${pl(arena+15000)}\\s?zł`));assert.match(card.text,/Nawierzchnia betonowa\s+Tak, bez wykończenia/);
 const c=await browser.newPage({viewport:{width:794,height:1123}});await c.setContent(card.html);await c.screenshot({path:'test-results/concrete-card.png'}).catch(()=>{});
 // Without concrete (own base): painting stays, concrete row goes.
 await page.keyboard.press('Escape').catch(()=>{});
 await page.goto(base+'/?arena=o1&tool=construction');await toggle.waitFor({timeout:60000});
 await toggle.uncheck();await badgeIs(`Nawierzchnia ${pl(5900)}\\s?zł netto$`);
 console.log('PASS: construction, concrete base and painting priced separately in the badge, summary and card; concrete removable, painting variant from the design or chosen by the customer');
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose();}
