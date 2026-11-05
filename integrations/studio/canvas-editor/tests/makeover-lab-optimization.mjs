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
 await mkdir('outputs/perspective-lab',{recursive:true});
 const errors=[];const evidence=[];
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:844},acceptDownloads:true});page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.__meshUploads=0;const original=WebGLRenderingContext.prototype.bufferData;WebGLRenderingContext.prototype.bufferData=function(...args){window.__meshUploads++;return original.apply(this,args)};});
  await page.goto(base+'/makeover-perspective-lab');
  await page.getByText('Model gotowy do renderowania.',{exact:false}).waitFor();
  const initial=await page.locator('canvas').boundingBox();assert.ok(initial);if(width===390)assert.ok(initial.y<650,'Mobile preview must appear on first screen');
  const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1280;c.height=800;const ctx=c.getContext('2d');ctx.fillStyle='#c8c6be';ctx.fillRect(0,0,1280,800);return c.toDataURL('image/png').split(',')[1]});
  const file={name:'courtyard.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')};
  await page.locator('input[type=file]').setInputFiles(file);
  await page.getByText('Zdjęcie gotowe.',{exact:false}).waitFor();
  const canvas=page.locator('canvas'),rect=await canvas.boundingBox();
  for(const [x,y]of [[.3,.35],[.7,.35],[.8,.7],[.2,.7]])await canvas.click({position:{x:rect.width*x,y:rect.height*y}});
  const downloadButton=page.getByRole('button',{name:/Pobierz PNG/});await downloadButton.waitFor();await page.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(x=>x.textContent.includes('Pobierz PNG')).disabled);
  const uploads=await page.evaluate(()=>window.__meshUploads);assert.ok(uploads>0);
  await page.getByLabel('Krycie modelu',{exact:true}).fill('45');await page.getByRole('button',{name:'Pokaż zdjęcie przed zmianą'}).click();await page.getByRole('button',{name:'Pokaż projekt 3D'}).click();
  assert.equal(await page.evaluate(()=>window.__meshUploads),uploads,'Opacity and before/after must not upload mesh again');
  await page.locator('select').selectOption('o1');await page.getByText('Model gotowy do renderowania.',{exact:false}).waitFor();await page.waitForFunction(()=>window.__meshUploads>0);assert.match(await page.locator('.lab-controls').innerText(),/4\/4/,'Keep calibration when switching model');
  await page.getByLabel('Krycie modelu',{exact:true}).fill('100');
  await page.getByText('Zaawansowane dopasowanie',{exact:true}).click();
  await page.getByLabel('Siła cienia',{exact:true}).fill('0');await page.waitForTimeout(250);
  const withoutShadow=await canvas.evaluate(c=>c.toDataURL());
  await page.getByLabel('Siła cienia',{exact:true}).fill('40');await page.waitForTimeout(250);
  const withShadow=await canvas.evaluate(c=>c.toDataURL());assert.notEqual(withShadow,withoutShadow,'Shadow must change rendered pixels');
  await page.getByLabel('Kierunek światła',{exact:true}).fill('180');await page.waitForTimeout(250);
  assert.notEqual(await canvas.evaluate(c=>c.toDataURL()),withShadow,'Lighting direction must change render');
  await canvas.screenshot({path:`outputs/perspective-lab/shadow-${width}.png`});
  const download=page.waitForEvent('download');await downloadButton.click();assert.ok((await(await download).path()));
  await page.locator('input[type=file]').setInputFiles(file);await page.getByText('Zdjęcie gotowe.',{exact:false}).waitFor();assert.equal(await downloadButton.isEnabled(),false,'New photo clears stale export');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  await page.screenshot({path:`outputs/perspective-lab/optimized-${width}.png`,fullPage:true});
  evidence.push({width,initialPreviewTop:initial.y,meshUploads:uploads,compositingReuploads:0,export:true,overflow:false});await page.close();
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify(evidence));console.log('perspective-lab optimization PASS');
}finally{await browser?.close();await new Promise(r=>server?.close(r));await mf.dispose();}
