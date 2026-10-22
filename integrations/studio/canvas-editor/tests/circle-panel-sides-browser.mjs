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
let browser,server;const report={status:'running',cases:[],errors:[]};
try{
 const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve('dist/client','.'+path),root=resolve('dist/client')+'/';if(file.startsWith(root)&&!path.startsWith('/api/')){try{const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(bytes);return;}catch{}}
 const chunks=[];for await(const c of req)chunks.push(c);const response=await mf.dispatchFetch(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});res.statusCode=response.status;for(const [k,v]of response.headers)if(k!=='set-cookie')res.setHeader(k,v);const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader"],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
 await mkdir('outputs/circle-panel-sides',{recursive:true});

 const ready=async(page,model,after=0)=>{await page.waitForFunction(({model,after})=>{const e=document.querySelector('.panna-studio-model');return e&&e.dataset.model===model&&e.dataset.renderModel===model&&Number(e.dataset.renderRequest)>after&&e.dataset.renderRequest===e.dataset.renderComplete&&e.dataset.ready==='true';},{model,after},{timeout:45000});return Number(await page.locator('.panna-studio-model').getAttribute('data-render-complete'));};
 for(const width of [375,1440])for(const model of ['circle-cage-1','circle-cage-2']){
  const context=await browser.newContext({viewport:{width,height:1000},deviceScaleFactor:1,acceptDownloads:true});
  await context.addInitScript(()=>{
   const states=new WeakMap(),locations=new WeakMap();window.qaWebGl=states;
   const state=gl=>{let s=states.get(gl);if(!s){s={buffers:new Map(),textures:new Map(),units:new Map(),active:gl.TEXTURE0,buffer:null,color:[],draws:[]};states.set(gl,s)}return s};
   function hook(name,fn){const original=WebGLRenderingContext.prototype[name];WebGLRenderingContext.prototype[name]=function(...args){const result=original.apply(this,args);fn.call(this,args,result);return result}}
   hook('getUniformLocation',function(a,r){if(r)locations.set(r,a[1])});hook('uniform3fv',function(a){if(locations.get(a[0])==='color')state(this).color=Array.from(a[1])});
   hook('activeTexture',function(a){state(this).active=a[0]});hook('bindTexture',function(a){state(this).units.set(state(this).active,a[1])});
   hook('texImage2D',function(a){const s=state(this),t=s.units.get(s.active);if(t)s.textures.set(t,{art:a.length===6&&a[5] instanceof HTMLImageElement&&a[5].naturalWidth>1})});
   hook('bindBuffer',function(a){if(a[0]===this.ARRAY_BUFFER)state(this).buffer=a[1]});hook('bufferData',function(a){if(a[0]===this.ARRAY_BUFFER&&a[1] instanceof Float32Array)state(this).buffers.set(state(this).buffer,a[1])});
   hook('deleteBuffer',function(a){state(this).buffers.delete(a[0])});hook('deleteTexture',function(a){state(this).textures.delete(a[0])});hook('clear',function(){state(this).draws=[]});
   hook('drawArrays',function(){const s=state(this);s.draws.push({buffer:s.buffer,color:[...s.color],texture:s.units.get(this.TEXTURE0)})});
  });
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  try{
   await page.goto(base+'/?arena='+model);await ready(page,model);
   const download=async()=>{const event=page.waitForEvent('download');await page.getByRole('button',{name:'Pobierz projekt',exact:true}).first().click();return JSON.parse(await readFile(await(await event).path(),'utf8'))};
   const importProject=async(project,target=model)=>{const before=Number(await page.locator('.panna-studio-model').getAttribute('data-render-request'));await page.getByRole('button',{name:'Pliki projektu',exact:true}).click();await page.getByLabel('Wczytaj projekt Studio JSON',{exact:true}).setInputFiles({name:'circle-sides.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(project))});await ready(page,target,before)};
   const logo=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=73;c.height=39;const x=c.getContext('2d');x.fillStyle='#ef744e';x.fillRect(0,0,73,39);x.fillStyle='#113399';x.fillRect(7,3,19,29);return c.toDataURL('image/png')});
   const fixture=await download();fixture.arenaDesign={panelColor:'#17654f',frameColor:'#30363c',goalColor:'#30363c',finish:'matte',text:'SIDE QA — Łódź',src:logo,side:'both'};await importProject(fixture);
   const oracle=async(target,side,art,design)=>page.evaluate(async({target,side,art,design})=>{
    const check=(v,m)=>{if(!v)throw Error(m)};const gl=document.querySelector('.panna-model-overlay').getContext('webgl'),s=window.qaWebGl.get(gl);check(s,'No WebGL capture');window.qaModels??={};const source=window.qaModels[target]??(window.qaModels[target]=await(await fetch('/arenas/'+target+'.json')).json());
    // Independent geometric oracle; no import of circlePanelSides/classifyCirclePanelFace.
    const which=(m,f)=>{const a=m.v[f[0]],b=m.v[f[1]],c=m.v[f[2]],ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,x=(a[0]+b[0]+c[0])/3,z=(a[2]+b[2]+c[2])/3,k=(nx*x+nz*z)/Math.hypot(nx,ny,nz)/Math.hypot(x,z);return k<-.05?'inner':k>.05?'outer':'edge'};
    const expected=[];for(const m of source){if(m.group!=='panels'||side==='both')expected.push({mesh:m,faces:m.f,printed:art&&m.group==='panels'});else{expected.push({mesh:m,faces:m.f.filter(f=>which(m,f)===side),printed:art});expected.push({mesh:m,faces:m.f.filter(f=>which(m,f)!==side),printed:false})}}
    const draws=[...s.draws];check(draws.length===expected.length,`Draw count ${draws.length} != ${expected.length}`);const sha=async v=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',v))).map(x=>x.toString(16).padStart(2,'0')).join('');let printed=0,plain=0,faces=0;
    for(let j=0;j<expected.length;j++){const e=expected[j],m=e.mesh,data=[];for(const f of e.faces){const[a,b,c]=f.map(i=>m.v[i]),u=b.map((x,i)=>x-a[i]),v=c.map((x,i)=>x-a[i]);let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],l=Math.hypot(...n);if(l<1e-10)continue;n=n.map(x=>x/l);for(const i of f)data.push(...m.v[i],...(m.normals?.[i]||n),...m.uv[i]);}const actual=s.buffers.get(draws[j].buffer);check(actual,`Missing buffer ${j}`);check(await sha(new Float32Array(data).buffer)===await sha(actual.buffer),`Geometry/winding/UV mismatch ${j}`);const textured=!!s.textures.get(draws[j].texture)?.art,should=e.printed||m.group==='floor';check(textured===should,`Texture side mismatch ${m.id}/${side}/${j}`);const colour=should?[1,1,1]:[1,3,5].map(k=>parseInt((m.group==='foundation'?'#4b5550':m.group==='panels'?design.panelColor:m.group==='goals'?design.goalColor:design.frameColor).slice(k,k+2),16)/255);check(colour.every((v,i)=>Math.abs(v-draws[j].color[i])<1e-6),`Base colour mismatch ${m.id}/${side}`);if(m.group==='panels'){faces+=e.faces.length;e.printed?printed++:plain++;}}
    const c=document.querySelector('.panna-model-overlay'),pixels=new Uint8Array(c.width*c.height*4);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);check(gl.getError()===0,'WebGL error');check(pixels.some((v,i)=>i%4===3&&v>0),'Empty canvas');check(document.documentElement.scrollWidth<=innerWidth+1,'Horizontal overflow');return {model:target,side,art,draws:draws.length,printed,plain,panelFaces:faces,pixelWidth:c.width,pixelHeight:c.height,sha256:await sha(pixels.buffer)};
   },{target,side,art,design});
   const bothHashes={};
   for(const side of ['both','inner','outer','both']){
    await page.getByRole('navigation',{name:'Narzędzia edycji'}).getByRole('button',{name:'Konstrukcja',exact:true}).click();const details=page.locator('.advanced-options.arena-options');if(await details.getAttribute('open')===null)await details.locator('summary').click();const select=page.getByLabel('Strona band',{exact:true});if(await select.inputValue()!==side){const before=await ready(page,model);await select.selectOption(side);await ready(page,model,before)}
    const exported=await download();assert.equal(exported.arenaDesign.side,side);assert.equal(exported.arenaDesign.src,logo);assert.equal(exported.arenaDesign.text,fixture.arenaDesign.text);assert.equal(exported.arenaDesign.panelColor,fixture.arenaDesign.panelColor);
    for(const camera of ['Boczny','Z góry','Z boiska']){const button=page.getByRole('button',{name:camera,exact:true});if(await button.getAttribute('aria-pressed')!=='true'){const before=await ready(page,model);await button.click();await ready(page,model,before)}const result=await oracle(model,side,true,fixture.arenaDesign);if(side==='both'){if(bothHashes[camera])assert.equal(result.sha256,bothHashes[camera],'Returning to both must restore identical pixels');else bothHashes[camera]=result.sha256;}report.cases.push({width,camera,...result});}
   }
   const unprinted={...fixture,arenaDesign:{...fixture.arenaDesign,side:'outer',panelColor:'#205967',text:'',src:undefined}};await importProject(unprinted);report.cases.push({width,scenario:'remove-artwork',...await oracle(model,'outer',false,unprinted.arenaDesign)});
   const persisted={...fixture,arenaDesign:{...fixture.arenaDesign,side:'inner'}};await importProject(persisted);await page.waitForFunction(()=>document.querySelector('.studio-save')?.textContent==='Zapisano w tej przeglądarce');await page.goto(base+'/');await page.waitForFunction(()=>document.querySelector('.studio-save')?.textContent==='Zapisano w tej przeglądarce');await ready(page,model);assert.equal((await download()).arenaDesign.side,'inner');report.cases.push({width,scenario:'one-sided-draft-reload',...await oracle(model,'inner',true,persisted.arenaDesign)});
   if(model==='circle-cage-1'&&width===1440){const other={...persisted,arenaModel:'circle-cage-2'};await importProject(other,'circle-cage-2');report.cases.push({width,scenario:'switch-cage-while-inner',...await oracle('circle-cage-2','inner',true,other.arenaDesign)});await page.waitForFunction(()=>document.querySelector('.studio-save')?.textContent==='Zapisano w tej przeglądarce');await page.reload();await page.waitForFunction(()=>document.querySelector('.studio-save')?.textContent==='Zapisano w tej przeglądarce');await ready(page,'circle-cage-2');assert.equal((await download()).arenaDesign.side,'inner');report.cases.push({width,scenario:'switched-cage-reload',...await oracle('circle-cage-2','inner',true,other.arenaDesign)});}
   await page.screenshot({path:`outputs/circle-panel-sides/${model}-${width}.png`});console.log(`PASS ${model} ${width}px sides/cameras/return/colour/remove/reload`);
  }finally{await context.close();}
 }
 assert.deepEqual(report.errors,[]);report.status='passed';console.log(`PASS circle panel side browser oracle: ${report.cases.length} cases`);
}catch(e){report.status='failed';report.errors.push(String(e));throw e}
finally{await mkdir('outputs/circle-panel-sides',{recursive:true});await writeFile('outputs/circle-panel-sides/browser.json',JSON.stringify(report,null,2)+'\n');await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose();}
