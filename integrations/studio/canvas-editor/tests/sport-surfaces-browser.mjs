import assert from 'node:assert/strict';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve,extname} from 'node:path';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=await import(wranglerRequire.resolve('miniflare'));
const files=(await readdir('dist/server',{recursive:true})).filter(f=>/\.m?js$/.test(f));
const mf=new Miniflare({modules:['index.js',...files.filter(f=>f!=='index.js')].map(f=>({type:'ESModule',path:resolve('dist/server',f)})),modulesRoot:resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{SALES_MARGIN:'0',INTERNAL_COST_CARD:JSON.stringify({version:'TEST-VARIANTS-NOT-FOR-SALE',currency:'PLN',workingAssumptions:true,arenaNet:{octagon:1234,'circle-cage-1':2345}})}});
let browser,server;const report={status:'running',cases:[],errors:[]};
try{
 const mime={'.html':'text/html','.glb':'model/gltf-binary','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve('dist/client','.'+path),root=resolve('dist/client')+'/';if(file.startsWith(root)&&!path.startsWith('/api/')){try{const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(bytes);return;}catch{}}
 const chunks=[];for await(const c of req)chunks.push(c);const response=await mf.dispatchFetch(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});res.statusCode=response.status;for(const [k,v]of response.headers)if(k!=='set-cookie')res.setHeader(k,v);const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader"],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
 await mkdir('outputs/project-owned-reference',{recursive:true});


 for(const width of [390,1440]){
 const context=await browser.newContext({viewport:{width,height:1100},acceptDownloads:true});const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 const download=async()=>{const event=page.waitForEvent('download');await page.getByRole('button',{name:'Pobierz projekt',exact:true}).first().click();return JSON.parse(await readFile(await(await event).path(),'utf8'))};
 const ready=()=>page.locator('.panna-studio-model[data-ready=true]').waitFor({timeout:30000});
 for(const surface of JSON.parse(await readFile('public/sport-surfaces/catalog.json','utf8')).items){
 await page.goto(base+'/?arena=octagon');await ready();await page.getByRole('navigation',{name:'Narzędzia edycji'}).getByRole('button',{name:'Nawierzchnia',exact:true}).click();await page.getByRole('button',{name:'Zmień nawierzchnię sportową',exact:true}).click();assert.equal(await page.locator('.studio-models button').count(),8);await page.getByRole('button',{name:surface.name,exact:true}).click();await ready();assert.equal(await page.locator('.panna-studio-model').getAttribute('data-surface-model'),surface.id);assert.equal(await page.locator('.panna-studio-model').getAttribute('data-mesh-count'),'2');
 let p=await download();assert.equal(p.surfaceModel,surface.id);assert.equal(p.arenaModel,undefined);assert.equal(p.length,surface.length);assert.equal(p.width,surface.width);assert.equal(p.lines,true);
 const canvas=page.locator('.studio-orbit-canvas');await canvas.focus();await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>Number(document.querySelector('.studio-orbit-canvas')?.dataset.orbitYaw)!==-.55);
 const pixels=await canvas.evaluate(canvas=>{const gl=canvas.getContext('webgl'),p=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,p);return {error:gl.getError(),visible:p.filter((v,i)=>i%4===3&&v>0).length}});assert.equal(pixels.error,0);assert(pixels.visible>1000);
 assert.equal(await page.locator('.studio-shell').getAttribute('data-tool'),'surface');await page.getByRole('navigation',{name:'Narzędzia edycji'}).getByRole('button',{name:'Konstrukcja',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Zmień nawierzchnię sportową',exact:true}).count(),0);await page.locator('.panna-studio-model[data-model=street15][data-ready=true]').waitFor();const thumbnail=page.getByRole('button',{name:'Zmień boisko',exact:true}).locator('img');await thumbnail.evaluate(e=>e.decode());assert.equal(await thumbnail.getAttribute('src'),'/arenas/thumbnails/street15.webp');assert.deepEqual(await download(),p,'Opening construction preview must not change the project');
 if(surface.id==='street-football-3x3'){await page.getByRole('button',{name:'Dodaj Street Arena 15',exact:true}).click();await ready();p=await download();assert.equal(p.arenaModel,'street15');assert(Number(await page.locator('.panna-studio-model').getAttribute('data-mesh-count'))>2);await page.getByLabel('Kolor: Bandy',{exact:true}).fill('#224466');await ready();await page.getByRole('button',{name:'Odłącz konstrukcję',exact:true}).click();await ready();assert.equal((await download()).surfaceModel,surface.id);assert.equal((await download()).arenaModel,undefined);}
 await page.getByRole('navigation',{name:'Narzędzia edycji'}).getByRole('button',{name:'Nawierzchnia',exact:true}).click();await page.locator('.panna-studio-model[data-mesh-count="2"][data-ready=true]').waitFor();await page.getByLabel('Kolor: Pole gry',{exact:true}).fill('#337755');await ready();p=await download();assert.equal(p.base,'#337755');assert.equal(p.surfaceModel,surface.id);
 const quote=await(await page.request.post(base+'/api/quote',{data:p})).json();assert.equal(quote.area,surface.length*surface.width);assert(!quote.items.some(i=>i.id==='arena'));
 if(surface.id==='futsal'){await page.waitForFunction(()=>document.querySelector('.studio-save')?.textContent==='Zapisano w tej przeglądarce');await page.goto(base+'/');await ready();assert.equal((await download()).surfaceModel,surface.id);await page.getByRole('button',{name:'Pliki projektu',exact:true}).click();await page.getByLabel('Wczytaj projekt Studio JSON',{exact:true}).setInputFiles({name:'surface.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});await ready();assert.deepEqual(await download(),p);}
 await page.screenshot({path:`outputs/studio-ux/surface-${surface.id}-${width}.png`});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 report.cases.push({width,surface:surface.id,webgl:pixels,json:true,priceArea:true});
 }
 await context.close();
 }
 assert.deepEqual(report.errors,[]);report.status='passed';console.log(JSON.stringify(report));
}catch(error){report.status='failed';report.error=String(error);throw error;}
finally{await writeFile('outputs/studio-ux/sport-surfaces-browser.json',JSON.stringify(report,null,2));await browser?.close();await new Promise(r=>server?.close(r));await mf.dispose();}
