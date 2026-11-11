import assert from 'node:assert/strict';
import {readFile,readdir,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve,extname} from 'node:path';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=await import(wranglerRequire.resolve('miniflare'));
const files=(await readdir('dist/server',{recursive:true})).filter(f=>/\.m?js$/.test(f));
const mf=new Miniflare({modules:['index.js',...files.filter(f=>f!=='index.js')].map(f=>({type:'ESModule',path:resolve('dist/server',f)})),modulesRoot:resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB']});
let browser,server;
try{
 const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve('dist/client','.'+path),root=resolve('dist/client')+'/';if(file.startsWith(root)&&!path.startsWith('/api/')){try{const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(bytes);return;}catch{}}
 const chunks=[];for await(const c of req)chunks.push(c);const response=await mf.dispatchFetch(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});res.statusCode=response.status;for(const [k,v]of response.headers)if(k!=='set-cookie')res.setHeader(k,v);const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader"],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});

 await mkdir('outputs/primary-sports',{recursive:true});const report={cases:[],errors:[]};
 const {projectSchema}=await import('../lib/project.ts');
 for(const width of [375,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:true});const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  const ready=()=>page.locator('.panna-studio-model[data-ready=true]').waitFor({timeout:45000});
  const download=async()=>{const event=page.waitForEvent('download');await page.getByRole('button',{name:'Pobierz projekt',exact:true}).first().click();return JSON.parse(await readFile(await(await event).path(),'utf8'))};
  await page.goto(base+'/?surface=street-football-3x3');await ready();
  await page.getByRole('navigation',{name:'Kroki projektu'}).getByRole('button',{name:/^Nawierzchnia/}).click();await page.getByRole('navigation',{name:'Ustawienia nawierzchni'}).getByRole('button',{name:'Sport',exact:true}).click();
  const choices=page.getByRole('group',{name:'Wybierz sport Gamefields',exact:true});assert.equal(await choices.getByRole('button').count(),5);
  for(const [name,surface,arena,equipment]of [['Teqball','teqball',undefined,6],['Street Football','street-football-3x3','street15',0],['Panna',undefined,'o1',0],['Koszykówka 3×3','basketball-3x3',undefined,21],['Koszykówka','basketball-full',undefined,42]]){
   await choices.getByRole('button',{name,exact:true}).click();await ready();
   const p=await download();assert.ok(projectSchema.safeParse(p).success);assert.equal(p.surfaceModel,surface);assert.equal(p.arenaModel,arena);if(name==='Panna')assert.equal(p.name,'Panna Play — projekt');if(name==='Koszykówka')assert.equal(p.name,'Koszykówka — pełne boisko — projekt');assert.equal(Number(await page.locator('.panna-studio-model').getAttribute('data-equipment-mesh-count')),equipment);
   assert.equal(await choices.getByRole('button',{name,exact:true}).getAttribute('aria-pressed'),'true');
   const canvas=page.locator('.panna-model-overlay');const image=await canvas.evaluate(c=>{const g=c.getContext('webgl2')||c.getContext('webgl'),v=new Uint8Array(c.width*c.height*4);g.readPixels(0,0,c.width,c.height,g.RGBA,g.UNSIGNED_BYTE,v);return {error:g.getError(),pixels:v.filter((x,i)=>i%4===3&&x>0).length}});assert.equal(image.error,0);assert(image.pixels>500);
   await canvas.focus();await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>Number(document.querySelector('.panna-model-overlay')?.dataset.orbitYaw)!==-.55);
   await page.getByRole('button',{name:'Podsumowanie',exact:true}).click();await page.locator('.studio-quote-total').waitFor();
   await page.locator('.studio-quote-scope summary').filter({hasText:'Składniki kalkulacji'}).click();
   if(equipment){const text=await page.locator('.studio-quote-items').innerText();assert(text.includes(name==='Teqball'?'Stół Teqball':'Kosz'));assert(text.includes('Do ustalenia'));}
   await page.getByRole('button',{name:'Wróć do edycji',exact:true}).click();
   await page.getByRole('button',{name:'Pliki projektu',exact:true}).click();await page.getByLabel('Wczytaj projekt Studio JSON',{exact:true}).setInputFiles({name:'sport.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});await ready();assert.deepEqual(await download(),p);
   await page.getByRole('navigation',{name:'Kroki projektu'}).getByRole('button',{name:/^Nawierzchnia/}).click();await page.getByRole('navigation',{name:'Ustawienia nawierzchni'}).getByRole('button',{name:'Sport',exact:true}).click();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.ok(await choices.getByRole('button').evaluateAll(buttons=>buttons.every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1})), 'Sport cards must fit inside viewport, not merely be clipped');
   await page.screenshot({path:`outputs/primary-sports/${surface||arena}-${width}.png`});
   report.cases.push({width,name,surface,arena,equipment,webgl:image.pixels,json:true,quote:true});console.log('PASS primary sport '+name+' '+width);
  }
  // Gamefields Crew is off for the launch (2026-11-08): the guide bubble must not render.
  await page.goto(base+'/');await ready();assert.equal(await page.getByRole('button',{name:/Wybierz przewodnika/}).count(),0,'CREW must stay hidden for the launch');
  await context.close();
 }
 assert.deepEqual(report.errors,[]);await (await import('node:fs/promises')).writeFile('outputs/primary-sports/verification.json',JSON.stringify({...report,status:'passed'},null,2));console.log('PASS primary sports browser acceptance');
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose();}
