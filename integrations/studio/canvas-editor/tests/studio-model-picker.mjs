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
  await page.goto(base+'/?arena=p1&tool=construction');await page.locator('.panna-studio-model[data-ready=true]').waitFor({timeout:30000});
  const tabs=page.getByRole('navigation',{name:'Ustawienia konstrukcji'});
  assert.deepEqual(await tabs.getByRole('button').allTextContents(),['Model','Kolory','Rozbudowa'],'construction is split into model, colours, extension');
  const m=page.locator('.gfmp');await m.waitFor();
  assert.equal(await page.locator('[data-visual-carousel="Konstrukcja stalowa"]').count(),0,'old carousel is gone');
  assert.equal(await m.locator('.gfmp-card').count(),7,'every model visible at once');
  assert.deepEqual(await m.locator('.gfmp-h').evaluateAll(n=>n.map(x=>x.firstChild.textContent)),['Panna 1 na 1','Street 3 na 3']);
  assert.equal(await m.locator('.gfmp-card[aria-pressed=true]').count(),1);assert.match(await m.locator('.gfmp-card[aria-pressed=true]').getAttribute('aria-label'),/^Panna Court:/);
  for(const img of await m.locator('.gfmp-card img').all())await img.scrollIntoViewIfNeeded();
  assert.equal(await m.locator('.gfmp-card img').evaluateAll(n=>n.filter(i=>i.complete&&i.naturalWidth>0).length),7,'all thumbnails load');
  assert.ok(!/\d\.\d/.test((await m.locator('.gfmp-list').allInnerTexts()).join(' ')),'Polish decimal commas on cards');
  await m.getByRole('button',{name:/^Panna Octa:/}).click();await page.locator('.panna-studio-model[data-model="octagon"][data-ready=true]').waitFor({timeout:30000});
  assert.match(await m.locator('.gfmp-card[aria-pressed=true]').getAttribute('aria-label'),/^Panna Octa:/);
  assert.equal((await downloadProject(page)).arenaModel,'octagon');
  await m.locator('.gfmp-compare>summary').click();assert.equal(await m.locator('.gfmp-table tbody tr').count(),7);assert.match(await m.locator('.gfmp-table tr[aria-current=true] th').innerText(),/Panna Octa/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no sideways scroll');
  const fine=await m.locator('.gfmp-compare .gfmp-fine').boundingBox();assert.ok(fine.x+fine.width<=width+1,'footnote fits the screen');
  await page.screenshot({path:`outputs/studio-ux/model-picker-${width}.png`});
  await page.getByRole('button',{name:/Dalej: kolory konstrukcji/}).click();
  assert.equal(await tabs.getByRole('button',{name:'Kolory',exact:true}).getAttribute('aria-pressed'),'true');
  await page.locator('.scene-paint-advanced > summary').click();assert.equal(await page.locator('.studio-color-part').count(),3,'construction parts to colour');
  report.cases.push({width,models:7,switched:'octagon',colours:true});await page.close();
 }
 report.status='passed';
}catch(e){report.status='failed';report.errors.push(String(e.stack||e));if(lastPage)await lastPage.screenshot({path:'outputs/studio-ux/model-picker-failure.png'}).catch(()=>{})}finally{await browser?.close();server?.close();await mf.dispose();console.log(JSON.stringify(report));if(report.status!=='passed')process.exitCode=1}
