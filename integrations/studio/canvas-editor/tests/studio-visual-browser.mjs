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
 await mkdir('outputs/studio-ux',{recursive:true});


 const downloadProject=async page=>{const event=page.waitForEvent('download');await page.getByRole('button',{name:'Pobierz projekt',exact:true}).first().click();return JSON.parse(await readFile(await(await event).path(),'utf8'));};
 const swipe=async(context,page,box,vertical=false)=>{
  const cdp=await context.newCDPSession(page),x=box.x+box.width-18,y=box.y+Math.min(box.height-20,75),dx=vertical?0:-Math.min(260,box.width-36),dy=vertical?-55:0;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let i=1;i<=12;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/12,y:y+dy*i/12}]});await page.waitForTimeout(24);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(650);await cdp.detach();
 };
 for(const width of [390,1440]){
  const height=width===390?844:1000,context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:width===390,deviceScaleFactor:1}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(base+'/?arena=street-field',{waitUntil:'domcontentloaded'});await page.locator('.panna-studio-model[data-ready=true]').waitFor({timeout:30000});
  const tool=name=>page.getByRole('navigation',{name:'Narzędzia edycji'}).getByRole('button',{name,exact:true});
  await tool('Nawierzchnia').click();await page.getByRole('navigation',{name:'Ustawienia nawierzchni'}).getByRole('button',{name:'Wzór',exact:true}).click();
  await page.waitForFunction(()=>!document.querySelector('[data-sonner-toast]'),{},{timeout:10000});await page.locator('.studio-panel').evaluate(e=>e.scrollTop=0);await page.screenshot({path:`outputs/studio-ux/visual-design-${width}.png`});
  const composition=page.locator('[data-visual-carousel="Kompozycja"]'),options=composition.locator('[data-carousel-option]');assert.equal(await options.count(),12);
  assert.equal(await options.locator('svg').evaluateAll(nodes=>new Set(nodes.map(n=>n.innerHTML)).size),12,'All composition cards must show a different composition');
  const current=async()=>Number(await composition.locator('[aria-pressed=true][data-carousel-option]').getAttribute('data-carousel-option'));
  await options.nth(1).click();assert.equal((await downloadProject(page)).patternVariant,2);
  await composition.getByRole('button',{name:'Następna opcja: Kompozycja',exact:true}).click();assert.equal((await downloadProject(page)).patternVariant,3);
  await composition.locator('[data-carousel-option="3"]').focus();await page.keyboard.press('End');assert.equal((await downloadProject(page)).patternVariant,12);
  await composition.locator('[data-carousel-option="12"]').focus();await page.keyboard.press('Home');assert.equal((await downloadProject(page)).patternVariant,1);await page.waitForTimeout(850);
  const rail=composition.locator('[data-carousel-rail]');await rail.scrollIntoViewIfNeeded();await swipe(context,page,await rail.boundingBox());await page.waitForFunction(()=>document.querySelector('[data-visual-carousel="Kompozycja"] [data-carousel-option][aria-pressed=true]')?.getAttribute('data-carousel-option')!=='1',{},{timeout:5000});const swiped=await current();assert.notEqual(swiped,1,'Native horizontal swipe must select another card');assert.equal((await downloadProject(page)).patternVariant,swiped);
  await page.getByRole('button',{name:'Cofnij',exact:true}).click();assert.equal((await downloadProject(page)).patternVariant,1,'One undo must reverse the complete settled swipe');await page.waitForTimeout(850);
  await rail.scrollIntoViewIfNeeded();await swipe(context,page,await rail.boundingBox(),true);assert.equal((await downloadProject(page)).patternVariant,1,'Vertical gesture must not choose a composition');
  await tool('Konstrukcja').click();const construction=page.locator('[data-visual-carousel="Konstrukcja stalowa"]');assert.equal(await construction.locator('img').count(),7);await construction.locator('[data-carousel-option="street15"]').click();await page.locator('.panna-studio-model[data-model="street15"][data-ready=true]').waitFor({timeout:30000});assert.equal((await downloadProject(page)).arenaModel,'street15');
  await page.getByRole('button',{name:'Bandy: Fiolet',exact:true}).click();assert.equal((await downloadProject(page)).arenaDesign.panelColor.toLowerCase(),'#6432ff');
  const colorRail=page.locator('[data-visual-carousel="Odcienie: Bandy"]');const colorCard=colorRail.locator('[data-carousel-option]').first();const colorSize=await colorCard.boundingBox();assert(colorSize.width>=126&&colorSize.height>=100,'Named colour choices must be large rectangular cards');assert.equal(await colorRail.getByText('Bordo',{exact:true}).count(),1);assert.equal(await colorRail.locator('.studio-solid-sample').count(),8);
  await colorRail.scrollIntoViewIfNeeded();await page.locator('[data-sonner-toast]').waitFor({state:'detached',timeout:10000});await page.screenshot({path:`outputs/studio-ux/rectangular-colors-${width}.png`});
  await tool('Nawierzchnia').click();const tabs=page.getByRole('navigation',{name:'Ustawienia nawierzchni'});await tabs.getByRole('button',{name:'Materiał',exact:true}).click();const materials=page.locator('[data-visual-carousel="Materiał nawierzchni"]');assert.equal(await materials.locator('img').count(),3);assert.equal(await materials.locator('[data-carousel-option="Akryl sportowy"] svg').count(),1);for(const img of await materials.locator('img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(async e=>{await e.decode();if(e.naturalWidth<600)throw Error('Material macro missing');});}await page.locator('.studio-panel').evaluate(e=>e.scrollTop=0);const materialName=await materials.locator('.studio-visual-carousel-name').first().boundingBox(),materialPanel=await page.locator('.studio-panel').boundingBox();assert(materialName.y+materialName.height<=materialPanel.y+materialPanel.height,'Material name must be visible with image at panel top');await page.screenshot({path:`outputs/studio-ux/material-macros-${width}.png`});await materials.locator('[data-carousel-option="EPDM"]').click();assert.equal((await downloadProject(page)).surface,'EPDM');
  await tabs.getByRole('button',{name:'Kolory',exact:true}).click();await page.getByRole('button',{name:'Pole gry: Petrol',exact:true}).click();assert.equal((await downloadProject(page)).base.toLowerCase(),'#205a66');
  await tool('Grafika').click();const canvas=page.locator('.studio-orbit-canvas').first();await page.waitForTimeout(500);const before=await canvas.screenshot();await page.locator('[data-visual-carousel="Linie dekoracyjne"] [data-carousel-option="petals"]').click();await page.waitForTimeout(900);const decorated=await downloadProject(page);assert.equal(decorated.decorativeLineStyle,'petals');assert.notDeepEqual(await canvas.screenshot(),before,'Petals must change pixels on the main 3D model');
  assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('.studio-visual')).backgroundColor),'rgb(255, 255, 255)');assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('.blender-clean-scene')).backgroundColor),'rgb(255, 255, 255)');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  if(width===390)assert(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1),'Mobile Studio must fit one viewport');
  await page.waitForFunction(()=>!document.querySelector('[data-sonner-toast]'),{},{timeout:10000});await page.locator('.studio-panel').evaluate(e=>e.scrollTop=0);await page.screenshot({path:`outputs/studio-ux/visual-petals-${width}.png`});report.cases.push({width,compositionPreviews:12,swipedVariant:swiped,swipeUndo:true,verticalGestureSafe:true,construction:'street15',material:'EPDM',decorative:'petals',white:true});await context.close();
 }
 assert.deepEqual(report.errors,[]);report.status='passed';console.log(JSON.stringify(report));
}catch(error){report.status='failed';report.error=String(error);throw error;}
finally{await writeFile('outputs/studio-ux/visual-carousel-browser.json',JSON.stringify(report,null,2));await browser?.close();await new Promise(r=>server?.close(r));await mf.dispose();}
