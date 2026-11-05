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
 const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json','.woff2':'font/woff2'};
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve('dist/client','.'+path),root=resolve('dist/client')+'/';if(file.startsWith(root)&&!path.startsWith('/api/')){try{const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(bytes);return;}catch{}}
 const response=await mf.dispatchFetch(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers});res.statusCode=response.status;for(const [k,v]of response.headers)if(k!=='set-cookie')res.setHeader(k,v);res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{}),args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
 await mkdir('outputs/product-viewer',{recursive:true});const errors=[];
 for(const arena of ['octagon','street-field'])for(const part of ['side','end','net']){
 const page=await browser.newPage({viewport:{width:390,height:260}});page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/product-viewer?arena='+arena+'&part='+part+'&compact=1');await page.locator('.construction-viewer[data-ready="true"]').waitFor({timeout:60000});const canvas=page.locator('canvas');assert.equal(await canvas.getAttribute('data-view'),part);assert.equal(await canvas.getAttribute('data-goal-count'),part==='net'?'1':'0');await canvas.evaluate(c=>c.dataset.identity='same');for(const [name,coat]of [['Czerwony','red'],['Niebieski','blue'],['Zielony','green']]){await page.getByRole('radio',{name,exact:true}).click();await page.waitForFunction(coat=>document.querySelector('canvas').dataset.coat===coat,coat);assert.equal(await canvas.getAttribute('data-identity'),'same')}await page.screenshot({path:'outputs/product-viewer/'+arena+'-'+part+'.png'});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));console.log('PASS',arena,part);await page.close();}
 assert.deepEqual(errors,[]);
}finally{await browser?.close();await new Promise(r=>server?server.close(r):r());await mf.dispose()}
