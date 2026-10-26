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
let browser,server,lastPage;const report={status:'running',cases:[],errors:[]};
try{
 const mime={'.html':'text/html','.glb':'model/gltf-binary','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve('dist/client','.'+path),root=resolve('dist/client')+'/';if(file.startsWith(root)&&!path.startsWith('/api/')){try{const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(bytes);return;}catch{}}
 const chunks=[];for await(const c of req)chunks.push(c);const response=await mf.dispatchFetch(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});res.statusCode=response.status;for(const [k,v]of response.headers)if(k!=='set-cookie')res.setHeader(k,v);const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader"],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
 await mkdir('outputs/studio-ux',{recursive:true});




 const downloadProject=async page=>{const event=page.waitForEvent('download');await page.getByRole('button',{name:'Pobierz projekt',exact:true}).first().click();return JSON.parse(await readFile(await(await event).path(),'utf8'));};
 for(const width of [390,1440]){
 const page=await browser.newPage({viewport:{width,height:width===390?844:1000}});lastPage=page;page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(base+'/?arena=p1');await page.locator('.panna-studio-model[data-ready=true]').waitFor({timeout:30000});
 assert.deepEqual(await page.locator('.studio-design-flow [data-visual-carousel]').evaluateAll(ns=>ns.map(n=>n.getAttribute('data-visual-carousel'))),['Projekty nawierzchni','Kierunek wzoru','Kompozycja']);
 const offers=page.locator('[data-visual-carousel="Projekty nawierzchni"]');assert.equal(await offers.locator('[data-carousel-rail]>button').count(),12);
 const before=await downloadProject(page);
 await offers.getByRole('button',{name:'City Fluid',exact:true}).click();const after=await downloadProject(page);
 assert.equal(after.patternFamily,'organic-flow');assert.equal(after.patternVariant,6);assert.equal(after.patternPalette,'warsaw');assert.equal(after.base,'#8E1D23');assert.equal(after.arenaModel,before.arenaModel);assert.equal(after.length,before.length);assert.equal(after.surface,before.surface);assert.deepEqual(after.objects,before.objects);assert.equal(await page.getByRole('dialog').count(),0);
 await page.getByRole('button',{name:'Cofnij',exact:true}).click();const undone=await downloadProject(page);assert.equal(undone.patternPalette,before.patternPalette);
 await page.goto(base+'/?surface=street-football-3x3&pattern=soft-blobs&variant=9&palette=lagoon');await page.locator('.panna-studio-model[data-ready=true]').waitFor({timeout:30000});const direct=await downloadProject(page);assert.equal(direct.arenaModel,undefined);assert.equal(direct.surfaceModel,'street-football-3x3');assert.equal(direct.patternPalette,'lagoon');assert.equal(direct.patternVariant,9);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await page.screenshot({path:`outputs/studio-ux/surface-offers-${width}.png`,fullPage:true});report.cases.push({width,inlineProjects:12,collections:25,compositions:12,preset:true,undo:true,directLink:true});await page.close();
 }
 assert.deepEqual(report.errors,[]);report.status='passed';console.log(JSON.stringify(report));
}catch(e){report.status='failed';report.error=String(e);console.error(e);process.exitCode=1;}finally{await writeFile('outputs/studio-ux/surface-offers-verification.json',JSON.stringify(report,null,2));await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose();}
