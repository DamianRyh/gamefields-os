import assert from 'node:assert/strict';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve,extname} from 'node:path';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=await import(wranglerRequire.resolve('miniflare'));
const files=(await readdir('dist/server',{recursive:true})).filter(f=>/\.m?js$/.test(f));
const mf=new Miniflare({modules:['index.js',...files.filter(f=>f!=='index.js')].map(f=>({type:'ESModule',path:resolve('dist/server',f)})),modulesRoot:resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{}});
let browser,server;const report={status:'running',cases:[],errors:[]};
try{
 const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve('dist/client','.'+path),root=resolve('dist/client')+'/';if(file.startsWith(root)&&!path.startsWith('/api/')){try{const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(bytes);return;}catch{}}
 const chunks=[];for await(const c of req)chunks.push(c);const response=await mf.dispatchFetch(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});res.statusCode=response.status;for(const [k,v]of response.headers)if(k!=='set-cookie')res.setHeader(k,v);const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader"],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
 await mkdir('outputs/project-owned-reference',{recursive:true});




 for(const width of [375,1440]){
 const context=await browser.newContext({viewport:{width,height:1000}});await context.addInitScript(()=>{window.imageTrace=[];const descriptor=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',{...descriptor,set(value){const trace={type:value.slice(0,35),length:value.length,start:performance.now()};window.imageTrace.push(trace);this.addEventListener('load',()=>{trace.loaded=performance.now();trace.size=[this.naturalWidth,this.naturalHeight]},{once:true});this.addEventListener('error',()=>{trace.error=performance.now()},{once:true});return descriptor.set.call(this,value)}})});
 const page=await context.newPage(),warnings=[];page.on('console',e=>{if(['error','warning'].includes(e.type()))warnings.push(e.text())});page.on('pageerror',e=>report.errors.push(e.message));
 try{for(let i=0;i<20;i++){
 await page.goto(base+'/?arena=o1',{waitUntil:'domcontentloaded'});
 try{await page.waitForFunction(()=>{const e=document.querySelector('.panna-studio-model');return e?.dataset.model==='o1'&&e.dataset.renderModel==='o1'&&e.dataset.ready==='true'&&e.dataset.renderRequest===e.dataset.renderComplete},{},{timeout:35000,polling:100});report.cases.push({width,navigation:i,status:'passed'})}catch(error){report.cases.push({width,navigation:i,status:'failed',diagnostics:await page.evaluate(()=>({images:window.imageTrace,stages:Array.from(document.querySelectorAll('.panna-studio-model')).map(e=>({attributes:Object.fromEntries(Array.from(e.attributes).map(a=>[a.name,a.value])),text:e.textContent,contextLost:e.querySelector('canvas')?.getContext('webgl')?.isContextLost()})),body:document.body.innerText.slice(-4000)})),warnings});console.log(JSON.stringify(report.cases.at(-1),null,2));throw error;}
 }console.log('PASS20normalO1navigations '+width)}finally{await context.close()}
 }
 assert.deepEqual(report.errors,[]);report.status='passed';
}catch(e){report.status='failed';report.errors.push(String(e));throw e;}finally{await mkdir('docs/priorities-2026-10-23',{recursive:true});await writeFile('docs/priorities-2026-10-23/o1-navigation.json',JSON.stringify(report,null,2)+'\n');await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose()}
