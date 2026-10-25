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
 const mime={'.html':'text/html','.glb':'model/gltf-binary','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve('dist/client','.'+path),root=resolve('dist/client')+'/';if(file.startsWith(root)&&!path.startsWith('/api/')){try{const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(bytes);return;}catch{}}
 const chunks=[];for await(const c of req)chunks.push(c);const response=await mf.dispatchFetch(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});res.statusCode=response.status;for(const [k,v]of response.headers)if(k!=='set-cookie')res.setHeader(k,v);const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader"],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
 await mkdir('outputs/project-owned-reference',{recursive:true});


 for(const [width,height] of [[320,568],[375,812],[390,844],[430,932],[844,390]]){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.goto(base+'/?arena=street-field');const ready=()=>page.locator('.panna-studio-model[data-ready=true]').waitFor({timeout:30000});await ready();
 const measure=()=>page.evaluate(()=>{const root=document.querySelector('.studio-shell'),panel=document.querySelector('.studio-panel'),visual=document.querySelector('.studio-visual'),canvas=document.querySelector('.panna-model-overlay');return {viewport:innerHeight,root:root.getBoundingClientRect().height,document:document.documentElement.scrollHeight,scroll:scrollY,white:getComputedStyle(visual).backgroundColor,scene:getComputedStyle(document.querySelector('.blender-clean-scene')).backgroundColor,visual:visual.getBoundingClientRect().toJSON(),panel:panel.getBoundingClientRect().toJSON(),canvas:canvas.getBoundingClientRect().toJSON(),panelScroll:panel.scrollTop,panelContent:panel.scrollHeight,panelHeight:panel.clientHeight}});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);let m=await measure();assert(m.root<=height+1);assert(m.document<=height+1);assert.equal(m.white,'rgb(255, 255, 255)');assert.equal(m.scene,'rgb(255, 255, 255)');assert(m.canvas.height>55);assert(m.panel.height>90);assert(m.visual.bottom<=m.panel.top+1||m.visual.right<=m.panel.left+1);
 await page.getByRole('button',{name:'Budowanie modułowe',exact:true}).click();await page.getByRole('button',{name:'Włącz budowanie modułowe',exact:true}).click();await page.locator('.panna-studio-model[data-modular][data-ready=true]').waitFor();m=await measure();assert.equal(m.scene,'rgb(255, 255, 255)');assert(m.document<=height+1);
 const panel=page.locator('.studio-panel');await panel.evaluate(e=>e.scrollTop=0);const box=await panel.boundingBox(),cdp=await context.newCDPSession(page),x=box.x+6,y=box.y+box.height-20,end=box.y+20;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+(end-y)*i/8}]});await page.waitForTimeout(20)}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForFunction(()=>document.querySelector('.studio-panel').scrollTop>0);
 const after=await measure();assert(after.panelScroll>0);assert.equal(after.scroll,0);assert(after.document<=height+1);assert(Math.abs(after.visual.y-m.visual.y)<1);assert(Math.abs(after.visual.height-m.visual.height)<1);
 await page.locator('.studio-orbit-canvas').focus();await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>Number(document.querySelector('.studio-orbit-canvas')?.dataset.orbitYaw)!==-.55);
 if(width===390){await page.setViewportSize({width:844,height:390});await page.waitForFunction(()=>document.querySelector('.studio-shell').getBoundingClientRect().height<=391);assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight),390);await page.setViewportSize({width,height});await page.waitForFunction(()=>Math.abs(document.querySelector('.studio-shell').getBoundingClientRect().height-innerHeight)<1);}
 await page.screenshot({path:`outputs/studio-ux/white-mobile-${width}x${height}.png`});report.cases.push({width,height,before:m,after,touchScroll:true,orbit:true,modularWhite:true});await context.close();
 }
 assert.deepEqual(report.errors,[]);report.status='passed';console.log(JSON.stringify(report));
}catch(error){report.status='failed';report.error=String(error);throw error;}
finally{await writeFile('outputs/studio-ux/white-mobile-layout.json',JSON.stringify(report,null,2));await browser?.close();await new Promise(r=>server?.close(r));await mf.dispose();}
