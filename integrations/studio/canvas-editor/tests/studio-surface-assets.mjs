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
  await page.goto(base+'/?arena=street15');await page.locator('.realistic-stage[data-ready=true],[data-ready=true]').first().waitFor({timeout:60000});
  await page.getByRole('navigation',{name:'Kroki projektu'}).getByRole('button',{name:/^Grafika/}).click();
  const tabs=page.getByRole('navigation',{name:'Ustawienia grafiki'});
  assert.deepEqual(await tabs.getByRole('button').allTextContents(),['Elementy','Linie','Logo i tekst']);
  const lib=page.locator('.gfal');await lib.waitFor();
  assert.equal(await page.getByRole('button',{name:/Wybierz element graficzny/}).count(),0,'old motif modal launcher is gone');
  const chips=lib.getByRole('group',{name:'Rodzaj elementów'});
  assert.deepEqual(await chips.getByRole('button').allTextContents(),['Prowadzenie i slalom','Podania i strzały','Koordynacja','Tor przeszkód','Strefy i kształty','Gry podwórkowe','Symbole']);
  assert.equal(await lib.locator('.gfal-card').count(),4,'dribbling first: slalom, gates, figure eight, duel');
  assert.equal(await lib.locator('.gfal-layout').count(),6,'six ready layouts on a 15 m court');
  const count=()=>page.evaluate(()=>document.querySelectorAll('.editable-object').length);
  await lib.getByRole('button',{name:'Dodaj układ: Tor kontroli piłki'}).click();await page.waitForTimeout(300);const course=await count();assert.ok(course>=12,'obstacle course adds its stations');
  await chips.getByRole('button',{name:'Prowadzenie i slalom'}).click();await lib.getByRole('button',{name:/^Dodaj: Slalom,/}).click();
  const sed=page.locator('.gfae');await sed.waitFor();
  await sed.getByRole('slider',{name:'Pachołki'}).fill('8');await sed.getByRole('slider',{name:'Odstęp'}).fill('2');await sed.getByRole('group',{name:'Układ'}).getByRole('button',{name:'Zygzak'}).click();await sed.getByRole('slider',{name:'Wychylenie'}).fill('1.5');
  assert.match(await sed.locator('header small').innerText(),/14,3 × 1,8 m/,'slalom size follows cones and spacing');
  assert.equal(await sed.getByRole('slider',{name:'Rozmiar w metrach'}).count(),0,'parametric drill has no free size');
  await sed.getByRole('button',{name:'Zamknij edycję elementu'}).click();assert.equal(await count(),course+1);
  await chips.getByRole('button',{name:'Gry podwórkowe'}).click();await lib.getByRole('button',{name:/^Dodaj: Klasy, 1,2 × 4,4 m/}).click();
  const ed=page.locator('.gfae');await ed.waitFor();assert.match(await ed.locator('header').innerText(),/Klasy\s+1,2 × 4,4 m/);
  await ed.getByRole('slider',{name:'Rozmiar w metrach'}).fill('3');assert.match(await ed.locator('header small').innerText(),/0,82 × 3 m|0,8 × 3 m/);
  await ed.getByRole('button',{name:'Kolor 2'}).click();await ed.getByRole('button',{name:'Kolor 2: Limonka'}).click();
  await ed.getByRole('group',{name:'Obrót'}).getByRole('button',{name:'90°'}).click();
  await ed.getByRole('button',{name:'Lustrzana kopia'}).click();assert.equal(await count(),course+3);
  await ed.getByRole('button',{name:'Pod spód'}).click();
  const project=await downloadProject(page);const assets=project.objects.filter(o=>o.asset);assert.equal(assets.length,course+3,'assets saved in the project JSON');const slalom=assets.find(o=>o.asset.id==='tr-slalom'&&o.asset.opts?.n===8);assert.ok(slalom&&slalom.asset.opts.gap===2&&slalom.asset.opts.mode===1&&slalom.asset.w===14.3,'slalom settings saved');
  const hop=assets.filter(o=>o.asset.id==='g-hopscotch');assert.equal(hop.length,2);
  assert.ok(hop.every(o=>Math.max(o.asset.w,o.asset.h)===3&&o.asset.colors[1]==='#D8F24A'),'size and colour saved');
  assert.equal(Math.round(hop[0].x+hop[1].x),600,'mirror copy is point-symmetric');assert.ok(Math.abs(Math.abs(hop[0].rotation-hop[1].rotation)-180)<1);
  assert.equal(project.objects.filter(o=>o.kind!=='equipment')[0].asset.id,'g-hopscotch','"Pod spód" moves the copy to the bottom layer');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no sideways scroll');
  await page.screenshot({path:`outputs/studio-ux/surface-assets-${width}.png`});
  // the 3D preview is one click away and keeps the assets
  const view=page.getByRole('group',{name:'Widok'});await view.getByRole('button',{name:'Podgląd 3D'}).click();assert.equal(await view.getByRole('button',{name:'Podgląd 3D'}).getAttribute('aria-pressed'),'true');await page.locator('[data-ready=true]').first().waitFor({timeout:60000});await page.waitForTimeout(2500);assert.equal(await page.locator('.gfae').count(),0,'editor closes in 3D');
  await page.screenshot({path:`outputs/studio-ux/surface-assets-3d-${width}.png`});
  report.cases.push({width,assets:course+3,layout:true,slalom:true,mirror:true});await page.close();
 }
 report.status='passed';
}catch(e){report.status='failed';report.errors.push(String(e.stack||e));if(lastPage)await lastPage.screenshot({path:'outputs/studio-ux/surface-assets-failure.png'}).catch(()=>{})}finally{await browser?.close();server?.close();await mf.dispose();console.log(JSON.stringify(report));if(report.status!=='passed'||report.errors.length)process.exitCode=1}
