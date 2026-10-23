import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve,extname} from 'node:path';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=await import(wranglerRequire.resolve('miniflare'));
const files=(await readdir('dist/server',{recursive:true})).filter(f=>/\.m?js$/.test(f));
const mf=new Miniflare({modules:['index.js',...files.filter(f=>f!=='index.js')].map(f=>({type:'ESModule',path:resolve('dist/server',f)})),modulesRoot:resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB']});
const phase=process.env.PANEL_BATCH_PHASE||'baseline';assert.ok(['baseline','candidate'].includes(phase));
const output=resolve('outputs/batched-panel/'+phase+'.json');await mkdir(resolve('outputs/batched-panel'),{recursive:true});
const report={phase,status:'running',scope:'Instrumented operation counts and exact final state; no GPU/FPS timing claim',browser:null,cases:[],errors:[],builtIndexSha256:createHash('sha256').update(await readFile('dist/server/index.js')).digest('hex')};
report.builtBundles=[];for(const root of ['dist/client','dist/server'])for(const path of await readdir(root,{recursive:true}))if(/\.m?js$/.test(path))report.builtBundles.push({path:root+'/'+path,sha256:createHash('sha256').update(await readFile(root+'/'+path)).digest('hex')});
const baseline=phase==='candidate'?JSON.parse(await readFile(resolve('outputs/batched-panel/baseline.json'),'utf8')):null;
if(baseline)assert.equal(baseline.status,'passed');let browser,server;
try{
 const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve('dist/client','.'+path),root=resolve('dist/client')+'/';if(file.startsWith(root)&&!path.startsWith('/api/')){try{const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(bytes);return;}catch{}}
 const chunks=[];for await(const c of req)chunks.push(c);const response=await mf.dispatchFetch(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});res.statusCode=response.status;for(const [k,v]of response.headers)if(k!=='set-cookie')res.setHeader(k,v);const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader"],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
 const ready=async(page,model,after=0)=>{await page.waitForFunction(({model,after})=>{const e=document.querySelector('.panna-studio-model');return e&&e.dataset.model===model&&e.dataset.renderModel===model&&Number(e.dataset.renderRequest)>after&&e.dataset.renderRequest===e.dataset.renderComplete&&e.dataset.ready==='true';},{model,after},{timeout:45000});return Number(await page.locator('.panna-studio-model').getAttribute('data-render-complete'));};
 report.browser=browser.version();
 for(const width of [375,1440])for(const model of ['circle-cage-1','circle-cage-2']){
  const context=await browser.newContext({viewport:{width,height:1000},deviceScaleFactor:1,acceptDownloads:true});
  await context.addInitScript(()=>{
   const states=new WeakMap(),names=new WeakMap();window.decodeQA={states,counts:{imageCreates:0,panelImageLoads:0,panelUploads:0,allUploads:0,clears:0,drawArrays:0},reset(){for(const k of Object.keys(this.counts))this.counts[k]=0}};
   const q=window.decodeQA,OriginalImage=window.Image;window.Image=new Proxy(OriginalImage,{construct(target,args,newTarget){q.counts.imageCreates++;return Reflect.construct(target,args,newTarget)}});
   const descriptor=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',{...descriptor,set(value){this.addEventListener('load',()=>{if(this.naturalHeight===768&&this.naturalWidth===2048)q.counts.panelImageLoads++},{once:true});descriptor.set.call(this,value)}});
   const state=gl=>{let s=states.get(gl);if(!s){s={buffers:new Map(),units:new Map(),active:gl.TEXTURE0,buffer:null,color:[],draws:[]};states.set(gl,s)}return s};
   function hook(name,fn){const original=WebGLRenderingContext.prototype[name];WebGLRenderingContext.prototype[name]=function(...a){const r=original.apply(this,a);fn.call(this,a,r);return r}}
   hook('getUniformLocation',function(a,r){if(r)names.set(r,a[1])});hook('uniform3fv',function(a){if(names.get(a[0])==='color')state(this).color=Array.from(a[1])});
   hook('activeTexture',function(a){state(this).active=a[0]});hook('bindTexture',function(a){state(this).units.set(state(this).active,a[1])});
   hook('texImage2D',function(a){q.counts.allUploads++;if(a.length===6&&a[5] instanceof HTMLImageElement&&a[5].naturalWidth===2048&&a[5].naturalHeight===768)q.counts.panelUploads++});
   hook('bindBuffer',function(a){if(a[0]===this.ARRAY_BUFFER)state(this).buffer=a[1]});hook('bufferData',function(a){if(a[0]===this.ARRAY_BUFFER&&a[1] instanceof Float32Array)state(this).buffers.set(state(this).buffer,a[1])});hook('deleteBuffer',function(a){state(this).buffers.delete(a[0])});
   hook('clear',function(){q.counts.clears++;state(this).draws=[]});hook('drawArrays',function(){q.counts.drawArrays++;const s=state(this);s.draws.push({buffer:s.buffer,color:[...s.color]})});
  });
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  try{
   await page.goto(base+'/?arena='+model);await ready(page,model);
   const download=async()=>{const event=page.waitForEvent('download');await page.getByRole('button',{name:'Pobierz projekt',exact:true}).first().click();return JSON.parse(await readFile(await(await event).path(),'utf8'))};
   const fixture=await download();const logo=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=73;c.height=39;const x=c.getContext('2d');x.fillStyle='#ef744e';x.fillRect(0,0,73,39);x.fillStyle='#113399';x.fillRect(7,3,19,29);return c.toDataURL('image/png')});
   async function importProject(project){const before=await ready(page,model);await page.getByRole('button',{name:'Pliki projektu',exact:true}).click();await page.getByLabel('Wczytaj projekt Studio JSON',{exact:true}).setInputFiles({name:'decoded-panel.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(project))});await ready(page,model,before);}
   async function settle(){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await ready(page,model);}
   async function capture(side,scenario){const captured=await page.evaluate(async()=>{const c=document.querySelector('.panna-model-overlay'),gl=c.getContext('webgl'),s=window.decodeQA.states.get(gl),sha=async b=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b))).map(x=>x.toString(16).padStart(2,'0')).join('');const bytes=new Uint8Array(c.width*c.height*4);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,bytes);if(gl.getError())throw Error('WebGL error');return {counts:{...window.decodeQA.counts},pixelSha256:await sha(bytes.buffer),pixelWidth:c.width,pixelHeight:c.height,buffers:await Promise.all(s.draws.map(async d=>({sha256:await sha(s.buffers.get(d.buffer).buffer),color:d.color})))}});const project=await download();const result={model,width,side,scenario,...captured,design:project.arenaDesign};const key=v=>[v.model,v.width,v.side,v.scenario].join('/');if(baseline){const before=baseline.cases.find(c=>key(c)===key(result));assert.ok(before,'Missing baseline '+key(result));for(const k of ['pixelSha256','pixelWidth','pixelHeight','buffers','design'])assert.deepEqual(result[k],before[k],key(result)+' '+k);for(const k of ['panelUploads','allUploads','panelImageLoads'])assert.equal(result.counts[k],before.counts[k],key(result)+' '+k);if(scenario!=='remove'){assert.ok(result.counts.clears<before.counts.clears,key(result)+' fewer full redraws');assert.ok(result.counts.drawArrays<before.counts.drawArrays,key(result)+' fewer mesh draw submissions');}else{assert.ok(result.counts.clears<=before.counts.clears,key(result)+' no extra full redraws');assert.ok(result.counts.drawArrays<=before.counts.drawArrays,key(result)+' no extra mesh submissions');}if(scenario!=='remove'){assert.equal(result.counts.panelImageLoads,1,key(result)+' decoded panel sharing');assert.equal(before.counts.panelImageLoads,1,key(result)+' version85 shared decode count');}}report.cases.push(result);await writeFile(output,JSON.stringify(report,null,2)+'\n');}
   for(const side of ['both','inner','outer']){
    let project={...fixture,arenaDesign:{panelColor:'#17654f',frameColor:'#30363c',goalColor:'#30363c',finish:'matte',text:'',side}};await importProject(project);await settle();
    await page.getByRole('navigation',{name:'Narzędzia edycji'}).getByRole('button',{name:'Konstrukcja',exact:true}).click();await settle();await page.evaluate(()=>window.decodeQA.reset());let before=await ready(page,model);await page.getByLabel('Tekst na bandach',{exact:true}).fill('DECODE QA — Łódź');await ready(page,model,before);await capture(side,'text');
    await settle();await page.evaluate(()=>window.decodeQA.reset());before=await ready(page,model);await page.getByLabel('Kolor: Bandy',{exact:true}).fill('#205967');await ready(page,model,before);await capture(side,'colour');
    project={...project,arenaDesign:{...project.arenaDesign,text:'DECODE QA — Łódź',panelColor:'#205967',src:logo}};await page.getByRole('button',{name:'Pliki projektu',exact:true}).click();await settle();await page.evaluate(()=>window.decodeQA.reset());await importProject(project);await capture(side,'logo');
    project={...project,arenaDesign:{...project.arenaDesign,text:'',src:undefined}};await settle();await page.evaluate(()=>window.decodeQA.reset());await importProject(project);await capture(side,'remove');
   }
   console.log(`PASS ${phase} ${model} ${width}px`);
  }finally{await context.close();}
 }
 assert.deepEqual(report.errors,[]);report.status='passed';console.log(`PASS batched-panel ${phase}: ${report.cases.length} cases`);
}catch(e){report.status='failed';report.errors.push(String(e));throw e}finally{await writeFile(output,JSON.stringify(report,null,2)+'\n');await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose();}
