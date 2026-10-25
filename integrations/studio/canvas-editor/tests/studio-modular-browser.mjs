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
 for(const model of ['street-field','octagon','circle-cage-1','circle-cage-2']){
 await page.goto(base+'/?arena='+model);await ready();await page.getByRole('button',{name:'Budowanie modułowe',exact:true}).click();assert.equal(await page.locator('iframe').count(),0);await page.getByRole('navigation',{name:'Ustawienia konstrukcji'}).getByRole('button',{name:'Kolory',exact:true}).click();await page.getByLabel('Kolor: Bandy',{exact:true}).fill('#224466');await page.getByLabel('Kolor: Rama',{exact:true}).fill('#775533');await page.getByLabel('Kolor: Bramki',{exact:true}).fill('#ff6633');await page.getByText('Logo i detale konstrukcji',{exact:true}).click();await page.getByLabel('Tekst na bandach',{exact:true}).fill('GAMEFIELDS QA');
 await page.getByRole('button',{name:'Budowanie modułowe',exact:true}).click();await page.getByRole('button',{name:'Zmniejsz: Bramki',exact:true}).click();await page.locator('.panna-studio-model[data-modular][data-ready=true]').waitFor({timeout:30000});let p=await download();assert(p.modular);assert.equal(p.arenaDesign.panelColor,'#224466');
 const canvas=page.locator('.studio-orbit-canvas');await canvas.focus();await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>Number(document.querySelector('.studio-orbit-canvas')?.dataset.orbitYaw)!==-.55);const yaw=await canvas.getAttribute('data-orbit-yaw');assert(yaw);
 if(model==='street-field'){
 await page.getByRole('button',{name:'Zwiększ: Moduły na długości',exact:true}).click();await page.waitForFunction(()=>{const e=document.querySelector('.panna-studio-model');return e?.dataset.ready==='true'&&JSON.parse(e.dataset.modular||'{}').long===5});p=await download();assert.equal(p.modular.long,5);assert.equal(await canvas.getAttribute('data-orbit-yaw'),yaw);
 await page.getByRole('button',{name:'Cofnij',exact:true}).click();await ready();assert.equal((await download()).modular.long,4);await page.getByRole('button',{name:'Ponów',exact:true}).click();await ready();assert.equal((await download()).modular.long,5);
 }
 await page.getByRole('navigation',{name:'Narzędzia edycji'}).getByRole('button',{name:'Nawierzchnia',exact:true}).click();await page.getByRole('navigation',{name:'Ustawienia nawierzchni'}).getByRole('button',{name:'Kolory',exact:true}).click();await page.getByLabel('Kolor: Pole gry',{exact:true}).fill('#337755');await ready();const edited=await download();assert.equal(edited.base,'#337755');assert(edited.modular);assert.equal(edited.arenaDesign.goalColor,'#ff6633');assert.equal(await canvas.getAttribute('data-orbit-yaw'),yaw);
 const quote=await(await page.request.post(base+'/api/quote',{data:edited})).json();assert.equal(quote.priceNet,null);assert.equal(quote.items.find(i=>i.id==='arena').totalNet,null);assert.equal(quote.items.find(i=>i.id==='arena-installation').totalNet,null);assert(quote.area>0);
 await page.getByRole('button',{name:'Pliki projektu',exact:true}).click();await page.getByLabel('Wczytaj projekt Studio JSON',{exact:true}).setInputFiles({name:'module.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(edited))});await ready();assert.deepEqual(await download(),edited);
 if(model==='street-field'){await page.waitForFunction(()=>document.querySelector('.studio-save')?.textContent==='Zapisano w tej przeglądarce');await page.goto(base+'/');await ready();assert.deepEqual((await download()).modular,edited.modular);}
 await page.getByRole('button',{name:'Budowanie modułowe',exact:true}).click();
 if(model==='circle-cage-1'){await page.getByRole('button',{name:'Zwiększ: Poziomy paneli',exact:true}).click();await page.locator('.panna-studio-model[data-model="circle-cage-2"][data-ready=true]').waitFor();assert.equal((await download()).modular.levels,2);}
 await page.screenshot({path:`outputs/studio-ux/integrated-${model}-${width}.png`});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 report.cases.push({width,model,integrated:true,json:true,priceGuard:true});
 }
 await context.close();
 }
 assert.deepEqual(report.errors,[]);report.status='passed';console.log(JSON.stringify(report));
}catch(error){report.status='failed';report.error=String(error);throw error;}
finally{await writeFile('outputs/studio-ux/integrated-browser.json',JSON.stringify(report,null,2));await browser?.close();await new Promise(r=>server?.close(r));await mf.dispose();}
