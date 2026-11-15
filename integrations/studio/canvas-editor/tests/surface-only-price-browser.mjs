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
 // A standalone surface (no construction) is priced from the same lists on its own area +10% (owner 14.11.2026).
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto(base+'/');await page.waitForTimeout(3000);
 await page.locator('button,a',{hasText:'Wybierz wzór'}).last().click();
 await page.locator('.panna-studio-model[data-ready="true"]').first().waitFor({timeout:90000});
 await page.waitForFunction(()=>/^Nawierzchnia [\d\s]+zł netto$/.test(document.querySelector('.studio-quote-badge b')?.textContent?.replace(/ /g,' ')||''),null,{timeout:30000});
 const steps=page.getByRole('navigation',{name:'Kroki projektu'});
 await steps.getByRole('button',{name:/Nawierzchnia/}).click();
 await page.getByRole('navigation',{name:'Ustawienia nawierzchni'}).getByRole('button',{name:'Materiał'}).click();
 assert.ok(await page.getByRole('checkbox',{name:/Nawierzchnia betonowa/}).isChecked(),'concrete offered for a standalone surface');
 assert.match(await page.locator('.studio-material-list').innerText(),/Sztuczna trawa\s+od [\d\s]+zł netto/);
 await steps.getByRole('button',{name:'Podsumowanie',exact:true}).click();
 const text=await page.locator('.studio-project-quote').first().innerText();
 assert.match(text,/Cena nawierzchni/);assert.doesNotMatch(text,/Konstrukcja boiska/);assert.match(text,/Nawierzchnia betonowa[\s\S]*zł netto/);assert.match(text,/Malowanie ·/);assert.match(text,/Razem: [\d\s]+zł netto/);
 assert.match(await page.locator('.studio-finish-compare').innerText(),/Ta sama nawierzchnia z innym wykończeniem/);
 await page.evaluate(()=>{window.print=()=>{}});
 const b=page.getByRole('button',{name:'Pobierz kartę projektu (PDF)'});await b.waitFor({state:'visible'});await page.waitForTimeout(2000);await b.click();
 await page.waitForFunction(()=>Array.from(document.querySelectorAll('iframe')).some(f=>f.contentDocument?.title?.startsWith('Gamefields — karta projektu')),null,{timeout:90000});
 const card=await page.evaluate(()=>Array.from(document.querySelectorAll('iframe')).find(f=>f.contentDocument?.title?.startsWith('Gamefields — karta projektu')).contentDocument.body.innerText);
 assert.match(card,/Cena nawierzchni \(netto\)/);assert.doesNotMatch(card,/Konstrukcja/);assert.match(card,/Razem\s+[\d\s]+zł/);assert.match(card,/Format\s+/);
 console.log('PASS: standalone surface priced (concrete + finish) in the badge, summary, comparison and card, without any construction');
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose();}
