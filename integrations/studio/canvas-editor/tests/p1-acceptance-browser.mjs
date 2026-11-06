import assert from 'node:assert/strict';
import {readFile,readdir,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve,extname} from 'node:path';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=await import(wranglerRequire.resolve('miniflare'));
const files=(await readdir('dist/server',{recursive:true})).filter(f=>/\.m?js$/.test(f));
const mf=new Miniflare({modules:['index.js',...files.filter(f=>f!=='index.js')].map(f=>({type:'ESModule',path:resolve('dist/server',f)})),modulesRoot:resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB']});
let browser,server;
try{
 const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve('dist/client','.'+path),root=resolve('dist/client')+'/';if(file.startsWith(root)&&!path.startsWith('/api/')){try{const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(bytes);return;}catch{}}
 const chunks=[];for await(const c of req)chunks.push(c);const response=await mf.dispatchFetch(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});res.statusCode=response.status;for(const [k,v]of response.headers)if(k!=='set-cookie')res.setHeader(k,v);const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader"],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});

 await mkdir('outputs/p1-2026-10-29',{recursive:true});
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:950},acceptDownloads:true});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const ready=()=>page.locator('.panna-studio-model[data-ready="true"]').waitFor({timeout:45000});
  const download=async()=>{const event=page.waitForEvent('download');await page.getByRole('button',{name:'Pobierz projekt',exact:true}).first().click();return JSON.parse(await readFile(await(await event).path(),'utf8'))};
  await page.goto(base+'/?arena=o1');await ready();const original=await download();
  // A real GPU-context loss must offer recovery without changing any project data.
  assert.ok(await page.locator('.panna-model-overlay').evaluate(c=>{const gl=c.getContext('webgl2')||c.getContext('webgl');const ext=gl.getExtension('WEBGL_lose_context');if(!ext)return false;ext.loseContext();return true}));
  await page.getByRole('button',{name:'Ponów podgląd 3D',exact:true}).click();await ready();assert.deepEqual(await download(),original);
  console.log('PASS P1 context loss/retry '+width);
  // A malformed successful HTTP response must be recoverable, never crash the summary.
  await page.route('**/api/quote',route=>route.fulfill({json:{schemaVersion:2,status:'partial',items:[]}}));
  await page.reload();await ready();await page.getByRole('button',{name:'Podsumowanie',exact:true}).click();
  await page.getByRole('button',{name:'Spróbuj ponownie',exact:true}).waitFor();
  await page.unroute('**/api/quote');await page.getByRole('button',{name:'Spróbuj ponownie',exact:true}).click();
  await page.locator('.studio-quote-total').waitFor();
  await page.getByRole('button',{name:'Wróć do edycji',exact:true}).click();
  // Lost network response: the 15s deadline must leave the spinner and allow retry.
  let release;const gate=new Promise(r=>release=r);let started=false;
  await page.route('**/api/quote',async route=>{started=true;await gate;await route.fulfill({status:503,body:'late'}).catch(()=>{})});
  await page.reload();await ready();await page.waitForFunction(()=>!!document.querySelector('.studio-quote-badge'));
  await page.getByRole('button',{name:'Podsumowanie',exact:true}).click();
  await page.getByRole('button',{name:'Spróbuj ponownie',exact:true}).waitFor({timeout:22000});assert.ok(started);
  await page.unroute('**/api/quote');release();await page.getByRole('button',{name:'Spróbuj ponownie',exact:true}).click();await page.locator('.studio-quote-total').waitFor();
  await page.screenshot({path:`outputs/p1-2026-10-29/quote-retry-${width}.png`});
  await page.getByRole('button',{name:'Wróć do edycji',exact:true}).click();assert.deepEqual(await download(),original);
  console.log('PASS P1 malformed quote / timeout / retry '+width);
  // A linked surface starts independently from a differently named saved project.
  await page.getByLabel('Nazwa projektu',{exact:true}).fill('P1 stary szkic');
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('gamefields-studio-draft-v1')||'{}').name==='P1 stary szkic');
  await page.goto(base+'/?surface=tennis');await ready();const linked=await download();assert.equal(linked.surfaceModel,'tennis');assert.notEqual(linked.name,'P1 stary szkic');
  // Corrupt data survives startup; the UI exposes recovery instead of overwriting it.
  await page.evaluate(()=>localStorage.setItem('gamefields-studio-draft-v1','{"broken":'));
  await page.goto(base+'/');await page.getByRole('button',{name:'Pliki projektu',exact:true}).click();
  await page.getByText('Zapis wstrzymany — odzyskaj szkic',{exact:true}).waitFor();
  assert.equal(await page.evaluate(()=>localStorage.getItem('gamefields-studio-draft-v1')),'{"broken":');
  await page.screenshot({path:`outputs/p1-2026-10-29/draft-recovery-${width}.png`});assert.deepEqual(errors,[]);
  console.log('PASS P1 surface link / corrupt draft preserved '+width);await context.close();
 }

 const slowContext=await browser.newContext({viewport:{width:390,height:950}}),slow=await slowContext.newPage();
 let releaseChunk,chunkHeld=false;const chunkGate=new Promise(r=>releaseChunk=r);
 await slow.route('**/product-renderer-*.js',async route=>{chunkHeld=true;await chunkGate;await route.continue().catch(()=>{})});
 await slow.goto(base+'/?arena=o1',{waitUntil:'domcontentloaded'});
 await slow.locator('.panna-studio-model[data-ready="true"]').waitFor({timeout:45000});
 assert.ok(chunkHeld,'Exercise the lazy renderer startup deadline');
 assert.equal(await slow.locator('.panna-model-overlay').getAttribute('data-product-renderer'),'standard');
 releaseChunk();await slow.waitForTimeout(300);
 assert.equal(await slow.locator('.panna-model-overlay').getAttribute('data-product-renderer'),'standard','Late premium module cannot replace recovered renderer');
 await slowContext.close();console.log('PASS P1 stalled PBR startup / standard fallback / ignored late chunk');
 console.log('PASS P1 browser acceptance: context recovery, quote timeout/schema/retry, unchanged project, explicit surface entry and corrupt draft protection.');
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose();}
