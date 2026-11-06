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
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||'/usr/bin/chromium',args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
 await mkdir('public/product-goals/v14',{recursive:true});const errors=[],report=[];
 for(const arena of ['o1','p1','circle-cage-1','circle-cage-2','octagon','street-field']){
  const page=await browser.newPage({viewport:{width:1000,height:460}});page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/product-viewer?arena='+arena+'&coat=gray&view=goal');await page.locator('.construction-viewer[data-ready="true"]').waitFor({timeout:60000});const canvas=page.locator('canvas');assert.equal(await canvas.getAttribute('data-goal-count'),'1');assert.equal(await canvas.getAttribute('data-pitch'),'0');
  for(const [coat,name]of [['gray','Szary'],['red','Czerwony'],['blue','Niebieski'],['green','Zielony']]){
   await page.getByRole('radio',{name,exact:true}).click();await page.waitForFunction(coat=>document.querySelector('canvas').dataset.coat===coat,coat);if(['o1','p1'].includes(arena))await page.waitForFunction(()=>document.querySelector('canvas').dataset.renderQuality==='settled');
   const png=await canvas.evaluate(c=>{const sample=document.createElement('canvas');sample.width=1000;sample.height=Math.round(c.clientHeight/c.clientWidth*1000);const ctx=sample.getContext('2d');ctx.drawImage(c,0,0,sample.width,sample.height);const data=ctx.getImageData(0,0,sample.width,sample.height).data;let x0=sample.width,y0=sample.height,x1=-1,y1=-1;for(let y=0;y<sample.height;y++)for(let x=0;x<sample.width;x++)if(data[(y*sample.width+x)*4+3]>20){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}if(x1<=x0||y1<=y0)throw Error('Empty goal panel render');const out=document.createElement('canvas');out.width=720;out.height=320;const w=x1-x0+1,h=y1-y0+1,scale=Math.min(688/w,288/h);out.getContext('2d').drawImage(sample,x0,y0,w,h,(720-w*scale)/2,(320-h*scale)/2,w*scale,h*scale);return out.toDataURL('image/png').split(',')[1]});
   const target='public/product-goals/v14/'+arena+'-'+coat+'.png';await (await import('node:fs/promises')).writeFile(target,Buffer.from(png,'base64'));console.log('GOAL THUMB READY',arena,coat);report.push({arena,coat,yaw:await canvas.getAttribute('data-yaw'),goalCount:1,sourceMeshes:Number(await canvas.getAttribute('data-mesh-count')),file:target});
  }
  await page.close();
 }
 assert.deepEqual(errors,[]);await (await import('node:fs/promises')).writeFile('public/product-goals/v14/manifest.json',JSON.stringify({view:'orthographic exterior elevation',geometry:'complete existing native objects; no panel slicing',renders:report},null,2));console.log('PASS: 24 front-facing whole goal-panel thumbnails generated from approved geometry.');
}finally{await browser?.close();await new Promise(r=>server?server.close(r):r());await mf.dispose()}
