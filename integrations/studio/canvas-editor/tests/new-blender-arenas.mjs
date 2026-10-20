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
 await mkdir('outputs/new-arenas',{recursive:true});
 const errors=[];
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:1000}});page.on('pageerror',e=>errors.push(e.message));
  for(const arena of ['circle-cage-1','circle-cage-2','street-field','octagon','street15']){
   await page.goto(base+'/?arena='+arena);
   const ready=()=>page.locator('[data-model="'+arena+'"][data-ready="true"]').waitFor({timeout:45000});await ready();
   await page.getByRole('navigation',{name:'Narzędzia edycji'}).getByRole('button',{name:'Konstrukcja',exact:true}).click();
   assert.equal(await page.getByLabel('Tekst na bandach',{exact:true}).inputValue(),'');
   await page.getByLabel('Kolor: Bandy',{exact:true}).fill('#205967');
   await page.getByLabel('Kolor: Rama',{exact:true}).fill('#30363c');await ready();
   await page.getByRole('navigation',{name:'Narzędzia edycji'}).getByRole('button',{name:'Nawierzchnia',exact:true}).click();
   await page.locator('.studio-material-trigger').click();
   await page.getByRole('button',{name:/^Granulat —/}).click();await ready();
   await page.getByRole('navigation',{name:'Narzędzia edycji'}).getByRole('button',{name:'Grafika',exact:true}).click();
   await page.getByLabel('Pokaż linie',{exact:true}).check();await ready();
   await page.getByLabel('Pokaż linie',{exact:true}).uncheck();await ready();
   await page.locator('.studio-section > summary').filter({hasText:/^Zaawansowane/}).click();
   await page.getByRole('button',{name:'Wariant 2',exact:true}).click();await ready();
   const event=page.waitForEvent('download');await page.getByRole('button',{name:'Zapisz projekt',exact:true}).first().click();
   const exported=JSON.parse(await readFile(await(await event).path(),'utf8'));
   assert.equal(exported.arenaModel,arena);assert.equal(exported.arenaDesign.panelColor,'#205967');assert.equal(exported.lines,false);
   assert.equal(exported.surface,'EPDM');assert.equal(exported.patternVariant,2);
   const {projectSchema}=await import('../lib/project.ts');const parsed=projectSchema.parse(exported);assert.equal(parsed.arenaModel,arena);if(arena==='octagon'){assert.equal(parsed.length,4.962);assert.equal(parsed.width,4.962)}if(arena==='street-field'){assert.equal(parsed.length,6.214);assert.equal(parsed.width,4.648);assert.equal(parsed.courtShape,'rectangle')}
   if(arena.startsWith('circle-cage-')){assert.equal(parsed.diameter,6);assert.equal(parsed.length,6);assert.equal(parsed.width,6)}
   assert.equal(await page.locator('[data-model="'+arena+'"]').getAttribute('data-slab-thickness'),'0.20');
   await page.getByRole('navigation',{name:'Narzędzia edycji'}).getByRole('button',{name:'Nawierzchnia',exact:true}).click();
   for(const view of ['Boczny','Z góry','Z boiska']){await page.getByRole('button',{name:view,exact:true}).click();await ready();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    const visible=await page.locator('.panna-model-overlay').evaluate(canvas=>{const gl=canvas.getContext('webgl'),p=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,p);return p.filter((v,i)=>i%4===3&&v>0).length});assert.ok(visible>100);
   }
   await page.locator('[data-model="'+arena+'"]').screenshot({path:'outputs/new-arenas/'+arena+'-'+width+'.png'});
   await page.getByRole('button',{name:'Zmień boisko',exact:true}).click();
   assert.ok(await page.getByRole('button',{name:'Panna Circle Cage 2.0',exact:false}).count());
  }
  await page.close();
 }
 assert.deepEqual(errors,[]);console.log('PASS: five Blender arenas in shared Studio, 390/1440 px, live colors, blank lettering/lines, 20 cm slab, schema/JSON preservation, all three cameras and visible WebGL output.');
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose();}
