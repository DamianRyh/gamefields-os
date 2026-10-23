import assert from 'node:assert/strict';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve,extname} from 'node:path';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=await import(wranglerRequire.resolve('miniflare'));
const files=(await readdir('dist/server',{recursive:true})).filter(f=>/\.m?js$/.test(f));
const mf=new Miniflare({modules:['index.js',...files.filter(f=>f!=='index.js')].map(f=>({type:'ESModule',path:resolve('dist/server',f)})),modulesRoot:resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{}});
let browser,server;const report={status:'running',cases:[],errors:[]};
try{
 const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve('dist/client','.'+path),root=resolve('dist/client')+'/';if(file.startsWith(root)&&!path.startsWith('/api/')){try{const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(bytes);return;}catch{}}
 const chunks=[];for await(const c of req)chunks.push(c);const response=await mf.dispatchFetch(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});res.statusCode=response.status;for(const [k,v]of response.headers)if(k!=='set-cookie')res.setHeader(k,v);const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader"],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
 await mkdir('outputs/project-owned-reference',{recursive:true});



 const ready=async(page,model)=>page.waitForFunction(model=>{const e=document.querySelector('.panna-studio-model');return e?.dataset.model===model&&e.dataset.renderModel===model&&e.dataset.ready==='true'&&e.dataset.renderRequest===e.dataset.renderComplete},model,{polling:100});
 const frame=page=>page.locator('.panna-model-overlay').evaluate(async c=>{const gl=c.getContext('webgl'),pixels=new Uint8Array(c.width*c.height*4);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);if(gl.getError())throw Error('WebGL');return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',pixels))).join(',')});
 const download=async page=>{const event=page.waitForEvent('download');await page.getByRole('button',{name:'Pobierz projekt',exact:true}).first().click();return JSON.parse(await readFile(await(await event).path(),'utf8'))};
 for(const width of [375,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:true});const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  try{
   await page.clock.install();
   await page.addInitScript(()=>{window.holdFloor=true;window.heldImages=[];window.holdPanel=false;window.heldPanels=[];const descriptor=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',{...descriptor,set(value){if(window.holdFloor&&value.startsWith('data:image/svg+xml')){window.heldImages.push({image:this,value,loaded:this.onload});return}if(window.holdPanel&&value.startsWith('data:image/png')){window.heldPanels.push({image:this,value});return}return descriptor.set.call(this,value)}});window.releasePanels=()=>{window.holdPanel=false;for(const held of window.heldPanels)descriptor.set.call(held.image,held.value);window.heldPanels=[]}});
   await page.goto(base+'/?arena=o1',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.heldImages.length>0);await page.clock.fastForward(21000);
   const retry=page.getByRole('button',{name:'Ponów podgląd 3D',exact:true});await retry.waitFor();
   assert.equal(await page.locator('.panna-studio-model').getAttribute('data-ready'),'false');
   const before=await download(page);await page.evaluate(()=>window.holdFloor=false);await retry.click();await ready(page,'o1');await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const expected=await frame(page),completed=await page.locator('.panna-studio-model').getAttribute('data-render-complete');
   await page.evaluate(()=>{for(const held of window.heldImages)held.loaded?.();window.heldImages=[]});await page.waitForTimeout(100);
   assert.equal(await frame(page),expected,'Late image after timeout/retry must not change pixels');assert.equal(await page.locator('.panna-studio-model').getAttribute('data-render-complete'),completed);assert.deepEqual(await download(page),before);
   const hasLoss=await page.locator('.panna-model-overlay').evaluate(c=>{const ext=c.getContext('webgl').getExtension('WEBGL_lose_context');if(!ext)return false;ext.loseContext();return true});assert.ok(hasLoss,'Test needs actual context loss');await retry.waitFor();assert.equal(await page.locator('.panna-studio-model').getAttribute('data-ready'),'false');await retry.click();await ready(page,'o1');assert.deepEqual(await download(page),before);
   const withLogo=structuredClone(before);withLogo.arenaDesign.src=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=20;c.height=20;const x=c.getContext('2d');x.fillStyle='#123456';x.fillRect(0,0,20,20);return c.toDataURL('image/png')});
   await page.evaluate(()=>window.holdPanel=true);await page.getByRole('button',{name:'Pliki projektu',exact:true}).click();await page.getByLabel('Wczytaj projekt Studio JSON',{exact:true}).setInputFiles({name:'watchdog.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(withLogo))});await page.waitForFunction(()=>window.heldPanels.length>0);await page.clock.fastForward(31000);await retry.waitFor();
   await page.evaluate(()=>window.holdPanel=false);await retry.click();await ready(page,'o1');await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const logoHash=await frame(page),logoComplete=await page.locator('.panna-studio-model').getAttribute('data-render-complete');await page.evaluate(()=>window.releasePanels());await page.waitForTimeout(100);assert.equal(await frame(page),logoHash,'Late abandoned logo cannot alter retried renderer');assert.equal(await page.locator('.panna-studio-model').getAttribute('data-render-complete'),logoComplete);assert.deepEqual(await download(page),withLogo);
   report.cases.push({width,case:'render-watchdog-stalled-logo-late-retry',status:'passed'});
   await context.close();
   const normal=await browser.newContext({viewport:{width,height:1000}}),warm=await normal.newPage();warm.on('pageerror',e=>report.errors.push(e.message));try{for(let i=0;i<10;i++){await warm.goto(base+'/?arena=o1',{waitUntil:'domcontentloaded'});try{await ready(warm,'o1')}catch(error){const diagnostic=await warm.evaluate(()=>{const e=document.querySelector('.panna-studio-model');return {now:performance.now(),ready:e?.dataset.ready,request:e?.dataset.renderRequest,complete:e?.dataset.renderComplete,model:e?.dataset.model,renderModel:e?.dataset.renderModel,predicate:e?.dataset.model==='o1'&&e.dataset.renderModel==='o1'&&e.dataset.ready==='true'&&e.dataset.renderRequest===e.dataset.renderComplete,text:e?.textContent}});report.cases.push({width,case:'warm-after-faults',navigation:i,status:'failed',diagnostic});console.log(JSON.stringify(diagnostic));throw error;}}report.cases.push({width,case:'o1-normal-navigation',navigations:10,status:'passed'});}finally{await normal.close()}
   report.cases.push({width,case:'stalled-floor-timeout-retry-late-work-context-loss',status:'passed'});
  }finally{await context.close()}
  const assetContext=await browser.newContext({viewport:{width,height:1000}}),asset=await assetContext.newPage();asset.on('pageerror',e=>report.errors.push(e.message));try{
   await asset.clock.install();let release;const gate=new Promise(r=>release=r);await asset.route('**/arenas/octagon.json',async route=>{await gate;await route.fulfill({status:503,body:'delayed failure'}).catch(()=>{})});
   await asset.goto(base+'/?arena=octagon',{waitUntil:'domcontentloaded'});await asset.waitForFunction(()=>document.querySelector('.panna-studio-model')?.dataset.model==='octagon');
   await asset.clock.fastForward(16000);const retry=asset.getByRole('button',{name:'Ponów podgląd 3D',exact:true});await retry.waitFor();
   await asset.unroute('**/arenas/octagon.json');release();await retry.click();await ready(asset,'octagon');
   assert.equal(await asset.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);report.cases.push({width,case:'model-fetch-timeout-manual-retry',status:'passed'});
  }finally{await assetContext.close()}
  const materialContext=await browser.newContext({viewport:{width,height:1000}}),material=await materialContext.newPage();material.on('pageerror',e=>report.errors.push(e.message));try{
   await material.clock.install();let release,finished;const gate=new Promise(r=>release=r),done=new Promise(r=>finished=r);
   await material.route('**/surfaces/p1/malowana-normal.png',async route=>{await gate;await route.fulfill({status:503,body:'injected material failure'}).catch(()=>{});finished()});
   await material.goto(base+'/?arena=p1',{waitUntil:'domcontentloaded'});await material.waitForFunction(()=>document.querySelector('.panna-studio-model')?.dataset.renderRequest>0);await material.clock.fastForward(21000);const retry=material.getByRole('button',{name:'Ponów podgląd 3D',exact:true});await retry.waitFor();
   await material.unroute('**/surfaces/p1/malowana-normal.png');release();await done;await retry.click();await ready(material,'p1');assert.equal(await material.locator('.panna-model-recovery').count(),0);report.cases.push({width,case:'material-timeout-cache-eviction-retry',status:'passed'});
  }finally{await materialContext.close()}
  console.log('PASS recovery '+width);
 }
 assert.deepEqual(report.errors,[]);report.status='passed';
}catch(e){report.status='failed';report.errors.push(String(e));throw e;}finally{await mkdir('docs/priorities-2026-10-23',{recursive:true});await writeFile('docs/priorities-2026-10-23/recovery-browser.json',JSON.stringify(report,null,2)+'\n');await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose()}
