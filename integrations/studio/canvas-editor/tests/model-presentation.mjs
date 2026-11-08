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
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle",'--use-angle='+(process.env.GF_TEST_ANGLE||'swiftshader')],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
 await mkdir('outputs/model-improvements',{recursive:true});const errors=[];
 for(const [width,models] of [[1440,['p1','street-field','octagon','street15','circle-cage-2']],[390,['p1']]]){
 for(const model of models){
 const page=await browser.newPage({viewport:{width,height:1058}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/?arena='+model);const canvas=page.locator('.studio-orbit-canvas[data-product-renderer="three-pbr"]');await canvas.waitFor({timeout:60000});
 await page.waitForFunction(()=>{const s=document.querySelector('.panna-studio-model');return s?.dataset.renderComplete&&s.dataset.renderComplete===s.dataset.renderRequest},{},{timeout:60000});
 assert.ok(Number(await canvas.getAttribute('data-geometry-bytes'))>0);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 if(width>800){const modelRect=await canvas.boundingBox(),panelRect=await page.locator('.studio-panel').boundingBox();assert.ok(modelRect.x+modelRect.width<panelRect.x,'Canvas must fit beside inspector');}
 const result=await canvas.evaluate(c=>{const g=c.getContext('webgl2')||c.getContext('webgl'),p=new Uint8Array(c.width*c.height*4);g.readPixels(0,0,c.width,c.height,g.RGBA,g.UNSIGNED_BYTE,p);return{error:g.getError(),pixels:p.filter((v,i)=>i%4===3&&v>0).length}});assert.equal(result.error,0);assert.ok(result.pixels>1000);
 await page.screenshot({path:`outputs/model-improvements/${model}-${width}.png`});await page.close();console.log('PASS model',model,width);
 }}assert.deepEqual(errors,[]);
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose();}
