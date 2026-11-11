import ts from 'typescript';
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
 const parser=ts.transpileModule(await readFile('components/o1-arena-glb.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;const {parseO1Glb}=await import('data:text/javascript;base64,'+Buffer.from(parser).toString('base64'));const bytes=await readFile('public/arenas/panna-play-o1-v2.glb');const o1=JSON.stringify(parseO1Glb(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)));
 const chunk=(await readdir('dist/client/_next/static/chunks')).find(f=>f.startsWith('product-renderer-'));
 const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname;if(path==='/quality-o1.json'){res.setHeader('Content-Type','application/json');res.end(o1);return;}if(path==='/quality-fixture'){res.setHeader('Content-Type','text/html');res.end(`<!doctype html><html><body style="margin:0;background:white"><canvas style="width:1100px;height:720px"></canvas><script type="module">import {ProductRenderer} from '/_next/static/chunks/${chunk}';window.create=async model=>{const meshes=(await(await fetch(model==='o1'?'/quality-o1.json':'/arenas/p1.json')).json()).filter(m=>m.group!=='floor').map(m=>({...m,perforated:m.group==='panels'}));const r=new ProductRenderer(document.querySelector('canvas'),meshes);r.yaw=-.55;r.pitch=.52;r.placement={cx:836,cy:570,scale:180};r.appearances=Object.fromEntries(meshes.map(m=>[m.id,{color:m.group==='panels'?'#ef7b73':m.group==='goals'?'#c5c9cc':'#383d40',finish:'matte',visible:true,text:'',u:.5,v:.5,scale:1,rotation:0}]));window.product=r;r.draw();};</script></body></html>`);return;}const file=resolve('dist/client','.'+path),root=resolve('dist/client')+'/';if(file.startsWith(root)&&!path.startsWith('/api/')){try{const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(bytes);return;}catch{}}
 const chunks=[];for await(const c of req)chunks.push(c);const response=await mf.dispatchFetch(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});res.statusCode=response.status;for(const [k,v]of response.headers)if(k!=='set-cookie')res.setHeader(k,v);const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader"],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
 await mkdir('outputs/product-quality',{recursive:true});const errors=[];
 for(const model of ['o1','p1']){
 const page=await browser.newPage({viewport:{width:1100,height:720},deviceScaleFactor:1});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().startsWith('[vinext] Initial RSC fetch'))errors.push(m.text())});
 await page.goto(base+'/quality-fixture');await page.waitForFunction(()=>typeof window.create==='function');await page.evaluate(model=>window.create(model),model);
 await page.locator('canvas[data-render-quality="settled"]').waitFor({timeout:45000});await page.screenshot({path:`outputs/product-quality/${model}-reference-pbr.png`});
 const draws=await page.evaluate(()=>{const g=window.product.gl,p=new Uint8Array(g.drawingBufferWidth*g.drawingBufferHeight*4);g.readPixels(0,0,g.drawingBufferWidth,g.drawingBufferHeight,g.RGBA,g.UNSIGNED_BYTE,p);return{error:g.getError(),visible:p.filter((v,i)=>i%4===3&&v>20).length}});assert.equal(draws.error,0);assert.ok(draws.visible>10000,'Reference frame must contain construction, not an empty canvas');
 await page.evaluate(()=>window.product.dispose());await page.close();
 }
 assert.deepEqual(errors,[]);console.log('Product quality fixture PASS');
}finally{await browser?.close();await new Promise(r=>server?.close(r));await mf.dispose();}
