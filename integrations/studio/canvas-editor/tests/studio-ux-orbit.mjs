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
 const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve('dist/client','.'+path),root=resolve('dist/client')+'/';if(file.startsWith(root)&&!path.startsWith('/api/')){try{const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(bytes);return;}catch{}}
 const chunks=[];for await(const c of req)chunks.push(c);const response=await mf.dispatchFetch(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});res.statusCode=response.status;for(const [k,v]of response.headers)if(k!=='set-cookie')res.setHeader(k,v);const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader"],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
 await mkdir('outputs/project-owned-reference',{recursive:true});


 for(const width of [375,1440]){
  const context=await browser.newContext({viewport:{width,height:1100},hasTouch:true,acceptDownloads:true});const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  const ready=()=>page.waitForFunction(()=>document.querySelector('.panna-studio-model')?.dataset.ready==='true');
  const download=async()=>{const event=page.waitForEvent('download');await page.getByRole('button',{name:'Pobierz projekt',exact:true}).first().click();return JSON.parse(await readFile(await(await event).path(),'utf8'))};
  for(const model of ['w1','o1','p1','street15','circle-cage-1','circle-cage-2','street-field','octagon']){
   await page.goto(base+'/?arena='+(model==='w1'?'p1':model));await ready();
   if(model==='w1'){const legacy=await download();Object.assign(legacy,{arenaModel:'w1',sport:'Piłka nożna 1×1',courtShape:'circle',diameter:4.99,length:4.99,width:4.99});legacy.objects.push({id:'legacy-equipment',kind:'equipment',name:'Legacy bench',target:'court',x:10,y:10,scale:100,rotation:0,opacity:100,color:'#ffffff'});await page.getByRole('button',{name:'Pliki projektu',exact:true}).click();await page.getByLabel('Wczytaj projekt Studio JSON',{exact:true}).setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});await page.waitForFunction(()=>document.querySelector('.panna-studio-model')?.dataset.model==='w1'&&document.querySelector('.panna-studio-model')?.dataset.ready==='true');await page.getByRole('navigation',{name:'Narzędzia edycji'}).getByRole('button',{name:'Nawierzchnia',exact:true}).click();}

   assert.equal(await page.getByRole('button',{name:'Wyposażenie',exact:true}).count(),0);assert.equal(await page.getByLabel('Miejsce wizualizacji',{exact:true}).count(),0);assert.equal(await page.getByRole('button',{name:'Z boiska',exact:true}).count(),0);
   await page.getByRole('button',{name:'Model 3D',exact:true}).click();await ready();const canvas=page.locator('.studio-orbit-canvas');await canvas.waitFor();await page.waitForTimeout(800);await ready();const before=await download();
   const generation=await page.locator('.panna-studio-model').getAttribute('data-render-request');
   const pixels=()=>canvas.evaluate(c=>c.toDataURL());const imageA=await pixels();
   await canvas.focus();await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>Number(document.querySelector('.studio-orbit-canvas')?.dataset.orbitYaw)>-.55);assert.notEqual(await pixels(),imageA,'Orbit must change rendered pixels');
   const box=await canvas.boundingBox();await page.mouse.move(box.x+box.width*.5,box.y+box.height*.45);await page.mouse.down();await page.mouse.move(box.x+box.width*.65,box.y+box.height*.5,{steps:6});await page.mouse.up();
   assert.equal(await page.locator('.panna-studio-model').getAttribute('data-render-request'),generation,'Orbit must not regenerate textures');
   const yaw=await canvas.getAttribute('data-orbit-yaw');const imageBeforeEdit=await pixels();assert.deepEqual(await download(),before,'Camera must not mutate project');
   await page.getByRole('navigation',{name:'Narzędzia edycji'}).getByRole('button',{name:'Konstrukcja',exact:true}).click();
   if(model==='p1')await page.screenshot({path:`outputs/studio-construction-${width}.png`,fullPage:true});
   for(const label of ['Bandy','Rama','Bramki']){const font=await page.locator('.technical-color-card b').filter({hasText:label}).evaluate(e=>parseFloat(getComputedStyle(e).fontSize));assert(font>=22);}
   await page.getByLabel('Kolor: Bandy',{exact:true}).fill('#2266bb');await page.getByLabel('Tekst na bandach',{exact:true}).fill('ORBIT QA');await ready();
   await page.getByRole('navigation',{name:'Narzędzia edycji'}).getByRole('button',{name:'Nawierzchnia',exact:true}).click();await page.getByLabel('Kolor: Pole gry',{exact:true}).fill('#773355');await ready();
   assert.equal(await canvas.getAttribute('data-orbit-yaw'),yaw,'Project edits preserve orbit');assert.notEqual(await pixels(),imageBeforeEdit);const changed=await download();assert.equal(changed.base,'#773355');assert.equal(changed.arenaDesign.text,'ORBIT QA');
   await page.getByRole('button',{name:'Przywróć obrót',exact:true}).click();assert.equal(Number(await canvas.getAttribute('data-orbit-yaw')),-.55);
   await canvas.focus();await page.keyboard.press('ArrowUp');await page.keyboard.press('Home');await page.waitForFunction(()=>Number(document.querySelector('.studio-orbit-canvas')?.dataset.orbitYaw)===-.55);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   report.cases.push({width,model,status:'passed'});
  }
  await page.screenshot({path:`outputs/studio-ux-${width}.png`,fullPage:true});await context.close();
 }
 assert.deepEqual(report.errors,[]);report.status='passed';console.log(JSON.stringify(report));
}catch(error){report.status='failed';report.error=String(error);throw error;}
finally{await mkdir('outputs/studio-ux',{recursive:true});await writeFile('outputs/studio-ux/browser.json',JSON.stringify(report,null,2));await browser?.close();await new Promise(r=>server?.close(r));await mf.dispose();}
