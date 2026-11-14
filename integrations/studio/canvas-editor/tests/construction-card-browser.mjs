import assert from 'node:assert/strict';
import {readFile,readdir,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve,extname} from 'node:path';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=await import(wranglerRequire.resolve('miniflare'));
const files=(await readdir('dist/server',{recursive:true})).filter(f=>/\.m?js$/.test(f));
const mf=new Miniflare({modules:['index.js',...files.filter(f=>f!=='index.js')].map(f=>({type:'ESModule',path:resolve('dist/server',f)})),modulesRoot:resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{SALES_MARGIN:'0',INTERNAL_COST_CARD:await readFile('tests/fixtures/rates.json','utf8')}});
let browser,server;
try{
 const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve('dist/client','.'+path),root=resolve('dist/client')+'/';if(file.startsWith(root)&&!path.startsWith('/api/')){try{const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(bytes);return;}catch{}}
 const chunks=[];for await(const c of req)chunks.push(c);const response=await mf.dispatchFetch(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});res.statusCode=response.status;for(const [k,v]of response.headers)if(k!=='set-cookie')res.setHeader(k,v);const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle",'--use-angle='+(process.env.GF_TEST_ANGLE||'swiftshader')],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});

 const page=await browser.newPage({viewport:{width:1200,height:900}});
 await page.goto(base+'/?arena=o1&tool=construction');
 await page.locator('[data-model="o1"][data-ready="true"]').first().waitFor({timeout:90000});
 // Construction only: the card shows only what is ordered.
 await page.getByRole('radio',{name:/Sama konstrukcja/}).check();
 assert.equal(await page.getByRole('checkbox',{name:/Nawierzchnia betonowa/}).count(),0,'no concrete option for construction only');
 await page.getByRole('navigation',{name:'Kroki projektu'}).getByRole('button',{name:'Podsumowanie',exact:true}).click();
 const button=page.getByRole('button',{name:'Pobierz kartę projektu (PDF)'});
 await button.waitFor({state:'visible'});await page.waitForTimeout(2000);await button.click();
 await page.waitForFunction(()=>Array.from(document.querySelectorAll('iframe')).some(f=>f.contentDocument?.title?.startsWith('Gamefields — karta projektu')),null,{timeout:90000});
 await page.getByText('Otworzyło się okno drukowania. Wybierz „Zapisz jako PDF”.').waitFor({timeout:30000});
 const report=await page.evaluate(()=>{let f=Array.from(document.querySelectorAll('iframe')).find(x=>x.contentDocument?.title?.startsWith('Gamefields — karta projektu'));let d=f.contentDocument;let img=d.querySelector('.img img');return {text:d.body.innerText,image:img?.src,complete:img?.complete,width:img?.naturalWidth}});
 assert.match(report.text,/Karta projektu/);assert.doesNotMatch(report.text,/Nawierzchnia|Materiał|Wzór|Paleta|betonow/);assert.match(report.text,/samą konstrukcję z bramkami/);assert.match(report.text,/Cena konstrukcji/);assert.doesNotMatch(report.text,/Materiał nawierzchni|Grafika nawierzchni|Ułożenie nawierzchni/);assert.ok(report.image?.startsWith('data:image/png'));assert.ok(report.width>10);
 const visible=await page.evaluate(async()=>{const f=Array.from(document.querySelectorAll('iframe')).find(x=>x.contentDocument?.title?.startsWith('Gamefields — karta projektu'));const img=f.contentDocument.querySelector('.img img');const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);const p=ctx.getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<p.length;i+=4)if(p[i]>0)n++;return n});assert.ok(visible>100,'construction image must contain visible pixels');
 console.log('PASS: construction-only order: printable card with only the construction, model image without surface and construction price');
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose();}
