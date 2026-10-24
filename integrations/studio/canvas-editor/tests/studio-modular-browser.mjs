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
 const context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:true});const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(base+'/?arena=p1');await page.locator('.studio-orbit-canvas').waitFor();
 assert.equal(await page.getByRole('button',{name:'Boczny',exact:true}).count(),0);assert.equal(await page.getByRole('button',{name:'Z góry',exact:true}).count(),0);
 await page.getByRole('navigation',{name:'Narzędzia edycji'}).getByRole('button',{name:'Konstrukcja',exact:true}).click();assert.equal(await page.locator('.studio-construction-colors .studio-color').count(),3);
 await page.getByLabel('Kolor: Bandy',{exact:true}).fill('#224466');
 await page.getByRole('button',{name:'Budowanie modułowe',exact:true}).click();const frame=page.frameLocator('iframe[title="Edytor zgodnych modułów konstrukcji"]');
 await frame.locator('canvas[data-ready=true]').waitFor({timeout:30000});assert.equal(await frame.locator('#family option').count(),3);assert.equal(await frame.locator('canvas').getAttribute('data-family'),'street-field');const count=Number(await frame.locator('canvas').getAttribute('data-instance-count'));
 await frame.getByLabel('Moduły na długości',{exact:true}).fill('6');await frame.locator('canvas[data-ready=true]').waitFor();assert(Number(await frame.locator('canvas').getAttribute('data-instance-count'))>count);assert.equal(await frame.locator('canvas').getAttribute('data-scales'),'1,1,1');
 const event=page.waitForEvent('download');await frame.getByRole('button',{name:'Pobierz projekt',exact:true}).click();const saved=JSON.parse(await readFile(await(await event).path(),'utf8'));assert.equal(saved.config.long,6);assert.equal(saved.config.family,'street-field');
 await frame.locator('#family').selectOption('circle-cage');await frame.locator('canvas[data-family="circle-cage"][data-ready=true]').waitFor();await frame.getByLabel('Poziomy paneli',{exact:true}).fill('2');await frame.locator('canvas[data-ready=true]').waitFor();assert.equal(await frame.locator('canvas').getAttribute('data-instance-count'),'16');
 await frame.locator('#family').selectOption('octagon');await frame.locator('canvas[data-family="octagon"][data-ready=true]').waitFor();assert.equal(await frame.getByLabel('Moduły na długości',{exact:true}).count(),0);
 await frame.locator('#import').setInputFiles({name:'config.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(saved))});await frame.locator('canvas[data-family="street-field"][data-ready=true]').waitFor();assert.equal(await frame.getByLabel('Moduły na długości',{exact:true}).inputValue(),'6');
 await page.screenshot({path:`outputs/studio-ux/modular-${width}.png`});await page.getByRole('button',{name:'Wróć do modelu 3D',exact:true}).click();await page.getByRole('button',{name:'Budowanie modułowe',exact:true}).click();await frame.locator('canvas[data-ready=true]').waitFor();assert.equal(await frame.getByLabel('Moduły na długości',{exact:true}).inputValue(),'6');await page.getByRole('button',{name:'Wróć do modelu 3D',exact:true}).click();assert.equal(await page.getByLabel('Kolor: Bandy',{exact:true}).inputValue(),'#224466');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 report.cases.push({width,status:'passed',families:3,growth:6,exportImport:true,recovery:true});await context.close();
 }
 assert.deepEqual(report.errors,[]);report.status='passed';console.log(JSON.stringify(report));
}catch(error){report.status='failed';report.error=String(error);throw error;}
finally{await writeFile('outputs/studio-ux/modular-browser.json',JSON.stringify(report,null,2));await browser?.close();await new Promise(r=>server?.close(r));await mf.dispose();}
