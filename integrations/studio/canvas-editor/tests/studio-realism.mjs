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
 await mkdir('outputs/studio-realism',{recursive:true});const errors=[];
 for(const width of [390,1440])for(const model of ['o1','p1']){
 const page=await browser.newPage({viewport:{width,height:950},acceptDownloads:true});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGLProgram/.test(m.text()))errors.push(m.text())});
 await page.goto(base+'/?arena='+model);const stage=page.locator(`[data-model="${model}"][data-ready="true"]`);await stage.waitFor({timeout:30000});
 await page.waitForFunction(()=>{const e=document.querySelector('.panna-studio-model');return e?.getAttribute('data-render-complete')===e?.getAttribute('data-render-request')});
 const canvas=page.locator('.panna-model-overlay');await page.waitForFunction(()=>document.querySelector('.panna-model-overlay')?.getAttribute('data-render-quality')==='settled');assert.equal(await canvas.getAttribute('data-product-renderer'),'three-pbr');
 if(width===390&&model==='o1'){const guide=page.getByRole('button',{name:'Wybierz przewodnika Ola: Technologia',exact:true});await guide.click();const tips=page.getByRole('region',{name:'Podpowiedzi: Ola',exact:true});await tips.waitFor();await guide.focus();await page.keyboard.press('Escape');assert.equal(await tips.count(),0);}
 const info=await canvas.evaluate(c=>{const g=(c.getContext('webgl2')||c.getContext('webgl')),pixels=new Uint8Array(c.width*c.height*4);g.readPixels(0,0,c.width,c.height,g.RGBA,g.UNSIGNED_BYTE,pixels);return {error:g.getError(),stencil:g.getContextAttributes().stencil,visible:pixels.filter((v,i)=>i%4===3&&v>0).length}});assert.equal(info.error,0);assert.ok(info.visible>100);
 await page.locator('.studio-orbit-canvas').focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(300);
 await stage.screenshot({path:`outputs/studio-realism/${model}-${width}.png`});
 await page.getByRole('navigation',{name:'Narzędzia edycji'}).getByRole('button',{name:'Konstrukcja',exact:true}).click();await page.getByRole('navigation',{name:'Ustawienia konstrukcji'}).getByRole('button',{name:'Kolory',exact:true}).click();
 await page.getByLabel('Kolor: Bandy',{exact:true}).fill('#245e87');await page.waitForTimeout(300);
 assert.equal(await canvas.evaluate(c=>(c.getContext('webgl2')||c.getContext('webgl')).getError()),0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 await page.getByText('Logo i detale konstrukcji',{exact:true}).click();await page.getByLabel('Tekst na bandach',{exact:true}).fill('QA — Gamefields');await page.waitForFunction(()=>{const e=document.querySelector('.panna-studio-model');return e?.getAttribute('data-render-complete')===e?.getAttribute('data-render-request')});
 await page.getByText('Więcej ustawień band',{exact:true}).click();for(const finish of ['metal','gloss','matte']){await page.getByLabel('Wykończenie band',{exact:true}).selectOption(finish);await page.waitForFunction(()=>{const e=document.querySelector('.panna-studio-model');return e?.getAttribute('data-render-complete')===e?.getAttribute('data-render-request')});assert.equal(await canvas.evaluate(c=>(c.getContext('webgl2')||c.getContext('webgl')).getError()),0);}
 await page.getByRole('navigation',{name:'Narzędzia edycji'}).getByRole('button',{name:'Nawierzchnia',exact:true}).click();
 await page.getByRole('navigation',{name:'Ustawienia nawierzchni'}).getByRole('button',{name:'Materiał',exact:true}).click();
 for(const material of ['Nawierzchnia EPDM wylewana','Płytki sportowe PP','Sztuczna trawa','Malowanie farbą sportową']){
  await page.locator('[data-visual-carousel="Materiał nawierzchni"]').getByRole('button',{name:material,exact:true}).click();
  await page.waitForFunction(()=>{const e=document.querySelector('.panna-studio-model');return e?.getAttribute('data-render-complete')===e?.getAttribute('data-render-request')});
  assert.equal(await canvas.evaluate(c=>(c.getContext('webgl2')||c.getContext('webgl')).getError()),0);
 }
 await page.waitForFunction(()=>document.querySelector('.panna-model-overlay')?.getAttribute('data-render-quality')==='settled');const frames=await canvas.getAttribute('data-render-frames');await page.waitForTimeout(600);assert.equal(await canvas.getAttribute('data-render-frames'),frames,'Idle view must not run a permanent rendering loop');console.log(JSON.stringify({width,model,...info,materials:4,idle:true}));await page.close();
 }
 const low=await browser.newPage({viewport:{width:390,height:950}});await low.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){if(kind==='webgl2')return null;return original.call(this,kind,...args)}});await low.goto(base+'/?arena=o1');await low.locator('[data-model="o1"][data-ready="true"]').waitFor({timeout:45000});assert.equal(await low.locator('.panna-model-overlay').getAttribute('data-product-renderer'),'standard');await low.close();console.log('WebGL1 fallback PASS');
 assert.deepEqual(errors,[]);console.log('Studio realism PASS');
}finally{await browser?.close();await new Promise(r=>server?.close(r));await mf.dispose();}
