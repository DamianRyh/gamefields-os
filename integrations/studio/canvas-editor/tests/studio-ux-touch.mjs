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


 const context=await browser.newContext({viewport:{width:390,height:1000},isMobile:true,hasTouch:true});const page=await context.newPage();await page.goto(base+'/?arena=octagon');await page.waitForFunction(()=>document.querySelector('.panna-studio-model')?.dataset.ready==='true');await page.getByRole('button',{name:'Model 3D',exact:true}).click();await page.locator('.studio-orbit-canvas').waitFor();await page.waitForTimeout(500);
 const c=page.locator('.studio-orbit-canvas'),b=await c.boundingBox(),client=await context.newCDPSession(page);const before=await c.getAttribute('data-orbit-yaw');
 const point=(x,y)=>({x,y,id:1,radiusX:1,radiusY:1,force:1});
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(b.x+b.width*.35,b.y+b.height*.4)]});
 for(let i=1;i<=6;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point(b.x+b.width*(.35+i*.04),b.y+b.height*.4)]});
 await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForFunction(old=>document.querySelector('.studio-orbit-canvas')?.dataset.orbitYaw!==old,before);assert.notEqual(await c.getAttribute('data-orbit-yaw'),before);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 await page.waitForTimeout(3500);await page.screenshot({path:'outputs/studio-touch-final.png',fullPage:true});report.status='passed';report.cases.push({width:390,model:'octagon',touchDrag:true,noOverflow:true});console.log(JSON.stringify(report));await context.close();
}catch(error){report.status='failed';report.error=String(error);throw error;}
finally{await mkdir('outputs/studio-ux',{recursive:true});await writeFile('outputs/studio-ux/touch.json',JSON.stringify(report,null,2));await browser?.close();await new Promise(r=>server?.close(r));await mf.dispose();}
