import assert from 'node:assert/strict';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve,extname} from 'node:path';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=await import(wranglerRequire.resolve('miniflare'));
const files=(await readdir('dist/server',{recursive:true})).filter(f=>/\.m?js$/.test(f));
const mf=new Miniflare({modules:['index.js',...files.filter(f=>f!=='index.js')].map(f=>({type:'ESModule',path:resolve('dist/server',f)})),modulesRoot:resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{QUOTE_RATE_CARD:JSON.stringify({version:'TEST-VARIANTS-NOT-FOR-SALE',currency:'PLN',workingAssumptions:true,arenaNet:{octagon:1234,'circle-cage-1':2345}})}});
let browser,server;const report={status:'running',cases:[],errors:[]};
try{
 const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve('dist/client','.'+path),root=resolve('dist/client')+'/';if(file.startsWith(root)&&!path.startsWith('/api/')){try{const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(bytes);return;}catch{}}
 const chunks=[];for await(const c of req)chunks.push(c);const response=await mf.dispatchFetch(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});res.statusCode=response.status;for(const [k,v]of response.headers)if(k!=='set-cookie')res.setHeader(k,v);const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader"],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
 await mkdir('outputs/project-owned-reference',{recursive:true});


 const {arenaGeometry}=await import('../lib/arena-geometry-data.mjs');
 for(const width of [375,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:true});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  try{
   await page.goto(base+'/?arena=octagon');
   const download=async()=>{const event=page.waitForEvent('download');await page.getByRole('button',{name:'Pobierz projekt',exact:true}).first().click();return JSON.parse(await readFile(await(await event).path(),'utf8'))};
   await page.waitForFunction(()=>document.querySelector('.panna-studio-model')?.getAttribute('data-ready')==='true');
   const before=await download();
   const first={id:'first',name:'Octa A',createdAt:'2026-10-23T12:00:00Z',project:before,modelRevision:arenaGeometry.octagon.sourceRevision};
   const second={...first,id:'second',name:'Circle B',project:{...before,id:'SECOND',arenaModel:'circle-cage-1',length:6,width:6,diameter:6,courtShape:'circle'},modelRevision:arenaGeometry['circle-cage-1'].sourceRevision};
   const third={...first,id:'third',name:'Stara rewizja',modelRevision:'0'.repeat(64)};
   const library={schemaVersion:1,items:[first,second,third]};
   const readLibrary=()=>page.evaluate(async()=>new Promise((resolve,reject)=>{const r=indexedDB.open('gamefields-studio-library',1);r.onsuccess=()=>{const db=r.result,tx=db.transaction('records','readonly'),q=tx.objectStore('records').get('named-variants-v1');q.onsuccess=()=>resolve(q.result);tx.oncomplete=()=>db.close();tx.onerror=()=>reject(tx.error)}}));
   await page.evaluate(async library=>new Promise((resolve,reject)=>{const r=indexedDB.open('gamefields-studio-library',1);r.onupgradeneeded=()=>r.result.createObjectStore('records');r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction('records','readwrite');tx.objectStore('records').put(library,'named-variants-v1');tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)}}),library);
   const expectedA=await(await page.request.post(base+'/api/quote',{data:first.project})).json(),expectedB=await(await page.request.post(base+'/api/quote',{data:second.project})).json();assert.notEqual(expectedA.knownSubtotalNet,expectedB.knownSubtotalNet);
   await page.getByRole('button',{name:'Pliki projektu',exact:true}).click();
   const variants=page.locator('.project-variants');
   await variants.getByLabel('Porównaj: Octa A',{exact:true}).check();
   let failed=true;const bodies=[];
   await page.route('**/api/quote',async route=>{const body=route.request().postDataJSON();bodies.push(body);if(body.arenaModel==='circle-cage-1'&&failed){failed=false;await route.fulfill({status:503,body:'unavailable'});return}await route.continue()});
   await variants.getByLabel('Porównaj: Circle B',{exact:true}).check();
   const a=page.getByRole('region',{name:'Kalkulacja wariantu: Octa A',exact:true}),b=page.getByRole('region',{name:'Kalkulacja wariantu: Circle B',exact:true});
   await a.locator('.studio-quote-total').waitFor();assert.ok(await a.getByText('Stawki robocze — do potwierdzenia',{exact:true}).isVisible());await b.getByRole('button',{name:'Spróbuj ponownie',exact:true}).waitFor();
   const money=n=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',maximumFractionDigits:2}).format(n);
   assert.equal(await a.locator('.studio-quote-total strong').textContent(),money(expectedA.knownSubtotalNet));
   assert.ok(await a.getByText('Pozycje „Do ustalenia” nie są wliczone. Pełną cenę otrzymasz po ich wycenie.',{exact:true}).isVisible());
   await b.getByRole('button',{name:'Spróbuj ponownie',exact:true}).click();await b.locator('.studio-quote-total').waitFor();assert.equal(await b.locator('.studio-quote-total strong').textContent(),money(expectedB.knownSubtotalNet));
   assert.ok(bodies.some(x=>x.arenaModel==='octagon'));assert.ok(bodies.some(x=>x.arenaModel==='circle-cage-1'));assert.ok(bodies.every(x=>x.objects.every(o=>o.src===undefined)));
   await variants.getByLabel('Porównaj: Circle B',{exact:true}).uncheck();const count=bodies.length;
   await variants.getByLabel('Porównaj: Stara rewizja',{exact:true}).check();const old=page.getByRole('region',{name:'Kalkulacja wariantu: Stara rewizja',exact:true});await old.getByText('Rewizja modelu zmieniła się.',{exact:false}).waitFor();
   await page.waitForTimeout(600);assert.equal(await old.locator('.studio-quote-total').count(),0);assert.ok(bodies.length-count<=1,'Stale revision must not request its own price');
   await variants.getByLabel('Porównaj: Stara rewizja',{exact:true}).uncheck();
   let release,pending=false;const gate=new Promise(r=>release=r);await page.unroute('**/api/quote');
   await page.route('**/api/quote',async route=>{if(route.request().postDataJSON().arenaModel==='circle-cage-1'){pending=true;await gate;await route.fulfill({json:expectedB}).catch(()=>{});}else await route.continue()});
   await variants.getByLabel('Porównaj: Circle B',{exact:true}).check();await page.waitForTimeout(600);assert.ok(pending);await variants.getByLabel('Porównaj: Circle B',{exact:true}).uncheck();release();await page.waitForTimeout(150);
   assert.equal(await b.count(),0,'Late response cannot revive deselected comparison');assert.deepEqual(await download(),before,'Comparison must not replace active Project');assert.deepEqual(await readLibrary(),library,'Comparison must not rewrite snapshots');
   await variants.getByLabel('Porównaj: Circle B',{exact:true}).check();await b.locator('.studio-quote-total').waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   await page.getByRole('button',{name:'Pokaż porównanie dwóch wariantów',exact:true}).click();await a.scrollIntoViewIfNeeded();await page.screenshot({path:`outputs/variant-pricing-${width}.png`});
   report.cases.push({width,status:'passed',scope:['two independent current quotes','partial totals and unknowns','isolated error/retry','revision guard','late response after deselection','Project and library immutable','reflow']});console.log('PASS variant pricing '+width);
  }finally{await context.close()}
 }
 assert.deepEqual(report.errors,[]);report.status='passed';
}catch(e){report.status='failed';report.errors.push(String(e));throw e;}finally{await mkdir('docs/variant-pricing-2026-10-23',{recursive:true});await writeFile('docs/variant-pricing-2026-10-23/browser.json',JSON.stringify(report,null,2)+'\n');await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose()}
