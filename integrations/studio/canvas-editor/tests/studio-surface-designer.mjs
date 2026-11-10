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
  const d=page.locator('.gfsd');await d.waitFor();
  // one editor, no carousels and no colour popover over the court in surface mode
  assert.equal(await page.locator('.studio-design-flow').count(),0,'old carousels are gone');
  assert.equal(await page.locator('.scene-paint-palette').count(),0,'no colour popover over the court');
  assert.equal(await d.locator('.gfsd-card').count(),8,'first 8 ready projects');
  await d.getByRole('button',{name:'Pokaż wszystkie projekty (40)',exact:true}).click();assert.equal(await d.locator('.gfsd-card').count(),40,'all 40 projects: Masters, Signature Pro and the earlier library');
  await d.getByRole('group',{name:'Zastosowanie'}).getByRole('button',{name:'Szkoła i dzieci',exact:true}).click();const school=await d.locator('.gfsd-card').count();assert(school>=2&&school<40,'filter by use');
  await d.getByRole('group',{name:'Zastosowanie'}).getByRole('button',{name:'Inspiracje mistrzów',exact:true}).click();assert.equal(await d.locator('.gfsd-card').count(),8,'Masters filter starts with 8');await d.getByRole('button',{name:'Pokaż wszystkie projekty (12)',exact:true}).click();assert.equal(await d.locator('.gfsd-card').count(),12,'12 Masters projects');
  await d.getByRole('group',{name:'Zastosowanie'}).getByRole('button',{name:'Wszystkie',exact:true}).click();await d.getByRole('button',{name:'Pokaż wszystkie projekty (40)',exact:true}).click();
  const before=await downloadProject(page);
  await d.getByRole('button',{name:/^City Fluid,/}).click();let p=await downloadProject(page);
  assert.equal(p.patternFamily,'organic-flow');assert.equal(p.patternVariant,6);assert.equal(p.patternPalette,'warsaw');assert.equal(p.base,'#8E1D23');assert.equal(p.patternColors,undefined);
  assert.equal(p.arenaModel,before.arenaModel);assert.deepEqual(p.objects,before.objects);
  await d.getByRole('button',{name:'Następny wariant',exact:true}).click();p=await downloadProject(page);assert.equal(p.patternVariant,7);
  await d.getByRole('button',{name:'Poprzedni wariant',exact:true}).click();await d.getByRole('button',{name:'Poprzedni wariant',exact:true}).click();p=await downloadProject(page);assert.equal(p.patternVariant,5);
  await d.getByRole('button',{name:'Paleta Berlin',exact:true}).click().catch(async()=>{await d.locator('.gfsd-palettes button').nth(3).click()});p=await downloadProject(page);assert.notEqual(p.patternPalette,'warsaw');assert.equal(p.patternColors,undefined);
  // own colours: pattern colour and ground
  const svgBefore=await page.locator('.gfsd-card[aria-pressed=true] svg, .gfsd-thumb svg').first().innerHTML();
  await d.getByRole('group',{name:'Twoje kolory: wybierz element'}).getByRole('button',{name:'Wzór 1',exact:true}).click();await d.getByRole('button',{name:'Wzór 1: Limonka',exact:true}).click();
  p=await downloadProject(page);assert.equal(p.patternColors?.length,5);assert.equal(p.patternColors[0].toLowerCase(),'#d8f24a');
  await d.getByRole('group',{name:'Twoje kolory: wybierz element'}).getByRole('button',{name:'Tło pola',exact:true}).click();await d.getByRole('button',{name:'Tło pola: Granat',exact:true}).click();p=await downloadProject(page);assert.equal(p.base.toLowerCase(),'#1f2a6b');
  assert.equal(await d.locator('.gfsd-colors>button[aria-pressed=true]').count(),1,'one colour marked');
  await d.getByRole('button',{name:'przywróć kolory palety',exact:true}).click();p=await downloadProject(page);assert.equal(p.patternColors,undefined);
  // all directions, collapsed until asked
  assert.equal(await d.locator('.gfsd-more .gfsd-card').count(),0);await d.locator('.gfsd-more>summary').click();await d.locator('.gfsd-more .gfsd-card').first().waitFor();assert.equal(await d.locator('.gfsd-more .gfsd-card').count(),53);
  await d.locator('.gfsd-more').getByRole('button',{name:'Bauhaus',exact:true}).click();p=await downloadProject(page);assert.equal(p.patternFamily,'bauhaus');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'no sideways scroll');
  await d.screenshot({path:`outputs/studio-ux/surface-designer-${width}.png`});
  report.cases.push({width,projects:40,directions:53,ownColours:true});await page.close();
 }
 report.status='passed';console.log(JSON.stringify(report));
}catch(e){report.status='failed';report.error=String(e);console.error(e);process.exitCode=1;}finally{await writeFile('outputs/studio-ux/surface-offers-verification.json',JSON.stringify(report,null,2));await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose();}
