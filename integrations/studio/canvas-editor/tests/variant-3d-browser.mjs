import assert from 'node:assert/strict';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve,extname} from 'node:path';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=await import(wranglerRequire.resolve('miniflare'));
const files=(await readdir('dist/server',{recursive:true})).filter(f=>/\.m?js$/.test(f));
const mf=new Miniflare({modules:['index.js',...files.filter(f=>f!=='index.js')].map(f=>({type:'ESModule',path:resolve('dist/server',f)})),modulesRoot:resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{SALES_MARGIN:'0',INTERNAL_COST_CARD:JSON.stringify({version:'TEST-VARIANTS-NOT-FOR-SALE',currency:'PLN',arenaNet:{octagon:1234,'circle-cage-1':2345}})}});
let browser,server;const report={status:'running',cases:[],errors:[]};
try{
 const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve('dist/client','.'+path),root=resolve('dist/client')+'/';if(file.startsWith(root)&&!path.startsWith('/api/')){try{const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(bytes);return;}catch{}}
 const chunks=[];for await(const c of req)chunks.push(c);const response=await mf.dispatchFetch(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});res.statusCode=response.status;for(const [k,v]of response.headers)if(k!=='set-cookie')res.setHeader(k,v);const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader"],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
 const {arenaGeometry}=await import('../lib/arena-geometry-data.mjs');
 for(const width of [375,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},deviceScaleFactor:1,acceptDownloads:true});
  await context.addInitScript(()=>{
   const q=window.variantQA={texts:[],logos:[],fills:[],reset(){this.texts=[];this.logos=[];this.fills=[]}};
   for(const name of ['fillText','fillRect','drawImage']){
    const original=CanvasRenderingContext2D.prototype[name];
    CanvasRenderingContext2D.prototype[name]=function(...args){
     if(name==='fillText')q.texts.push(String(args[0]));
     if(name==='fillRect')q.fills.push(this.fillStyle);
     if(name==='drawImage'&&args[0] instanceof HTMLImageElement)q.logos.push(args[0].src);
     return original.apply(this,args);
    };
   }
  });
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  try{
   await page.goto(base+'/?arena=octagon');
   await page.waitForFunction(()=>document.querySelector('.panna-studio-model')?.dataset.ready==='true');
   const downloadButton=async button=>{const event=page.waitForEvent('download');await button.click();return JSON.parse(await readFile(await(await event).path(),'utf8'))};
   const activeProject=()=>downloadButton(page.getByRole('button',{name:'Pobierz projekt',exact:true}).first());
   const before=await activeProject();
   const logos=await page.evaluate(()=>['#ee4422','#2266dd'].map(color=>{const c=document.createElement('canvas');c.width=61;c.height=37;const x=c.getContext('2d');x.fillStyle=color;x.fillRect(0,0,61,37);x.fillStyle='#ffffff';x.fillRect(4,6,19,11);return c.toDataURL('image/png')}));
   const object=(id,kind,name,target)=>({id,kind,name,target,x:200,y:200,scale:80,rotation:0,opacity:100,color:'#ffffff',...(kind==='text'?{text:name}:{})});
   const makeBase=(id,name,model,index)=>({id,name,createdAt:'2026-10-23T12:00:00Z',modelRevision:arenaGeometry[model].sourceRevision,project:{...before,id:'PROJECT-'+id,arenaModel:model,...(index?{length:6,width:6,diameter:6,courtShape:'circle'}:{}),surface:index?'Moduły sportowe':'EPDM',base:index?'#225577':'#776622',zone:'#bb7733',outside:'#eecc88',arenaDesign:{panelColor:index?'#204f86':'#7f2255',frameColor:'#30363c',goalColor:'#30363c',finish:'matte',side:'both',text:index?'VARIANT B PANEL':'VARIANT A PANEL',src:logos[index]},objects:[object('eq-'+id,'equipment','Sprzęt '+id,'court'),object('band-'+id,'text','Napis poza nawierzchnią '+id,'band-top'),object('court-'+id,'text','Napis nawierzchni '+id,'court')]}});
   const {projectDimensions}=await import('../lib/project-dimensions.ts');
   const make=(...args)=>{const item=makeBase(...args);if(process.env.TEST_MODULAR_VARIANTS){item.project.modular={revision:'GF-STUDIO-MODULAR-2',long:5,short:3,goals:2,entries:1,levels:1};item.modelRevision=projectDimensions(item.project).model.sourceRevision;}return item};
   const a=make('first','Octa A','octagon',0),b=make('second','Circle B','circle-cage-1',1),old={...a,id:'third',name:'Stara rewizja',modelRevision:'0'.repeat(64)};
   const library={schemaVersion:1,items:[a,b,old]};
   const readLibrary=()=>page.evaluate(async()=>new Promise((resolve,reject)=>{const r=indexedDB.open('gamefields-studio-library',1);r.onsuccess=()=>{const db=r.result,tx=db.transaction('records','readonly'),q=tx.objectStore('records').get('named-variants-v1');q.onsuccess=()=>resolve(q.result);tx.oncomplete=()=>db.close();tx.onerror=()=>reject(tx.error)}}));
   await page.evaluate(async library=>new Promise((resolve,reject)=>{const r=indexedDB.open('gamefields-studio-library',1);r.onupgradeneeded=()=>r.result.createObjectStore('records');r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction('records','readwrite');tx.objectStore('records').put(library,'named-variants-v1');tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)}}),library);
   await page.getByRole('button',{name:'Pliki projektu',exact:true}).click();
   const variants=page.locator('.project-variants');
   await variants.getByLabel('Porównaj: Octa A',{exact:true}).check();await variants.getByLabel('Porównaj: Circle B',{exact:true}).check();
   const comparison=page.locator('.variant-3d-comparison');
   await comparison.waitFor();assert.equal(await comparison.locator('canvas').count(),0,'No comparison WebGL before opt-in');
   const ready=async(model,view)=>{
    await page.waitForFunction(({model,view})=>{const root=document.querySelector('.variant-3d-comparison'),e=root?.querySelector('.panna-studio-model');return e?.dataset.model===model&&e.dataset.renderModel===model&&e.dataset.ready==='true'&&e.dataset.renderRequest===e.dataset.renderComplete&&root.querySelector('.blender-clean-scene')?.dataset.view===view;},{model,view},{timeout:45000});
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    assert.equal(await comparison.locator('.panna-model-overlay').count(),1,'Single optional comparison canvas');
   };
   const pixels=()=>comparison.locator('.panna-model-overlay').evaluate(async c=>{const gl=c.getContext('webgl'),p=new Uint8Array(c.width*c.height*4);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,p);if(gl.getError())throw Error('WebGL error');return {width:c.width,height:c.height,hash:Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',p))).map(v=>v.toString(16).padStart(2,'0')).join('')}});
   const verifyPaint=async item=>{
    const paint=await page.evaluate(()=>({texts:window.variantQA.texts,logos:window.variantQA.logos,fills:window.variantQA.fills}));
    assert.ok(paint.texts.includes(item.project.arenaDesign.text),'Snapshot panel text reaches artwork drawing');
    assert.ok(paint.logos.includes(item.project.arenaDesign.src),'Snapshot logo reaches artwork drawing');
    assert.ok(paint.fills.includes(item.project.arenaDesign.panelColor),'Snapshot panel colour reaches artwork drawing');
    const detail=variants.locator('.project-variants-comparison>article').filter({has:page.getByRole('heading',{name:item.name,exact:true})});
    assert.ok((await detail.innerText()).includes(item.project.surface));

    const note=comparison.locator('.variant-3d-coverage');assert.ok((await note.innerText()).includes('(1)'));
    assert.equal(await note.locator('li').count(),1);assert.equal((await note.innerText()).includes('Sprzęt '+item.id),false);assert.ok((await note.innerText()).includes('Napis poza nawierzchnią '+item.id));assert.equal((await note.innerText()).includes('Napis nawierzchni '+item.id),false,'Court graphics are not labelled omitted');
   };
   await page.evaluate(()=>window.variantQA.reset());await comparison.getByRole('button',{name:'Włącz porównanie 3D',exact:true}).click();await ready('octagon','perspective');await verifyPaint(a);
   const views=[['Model 3D','perspective']],states=[];
   for(const [label,view]of views){
    assert.equal(await comparison.getByRole('group',{name:'Kamera porównania'}).count(),0);await ready('octagon',view);const first=await pixels();
    await page.evaluate(()=>window.variantQA.reset());await comparison.getByRole('button',{name:'B: Circle B',exact:true}).click();await ready('circle-cage-1',view);await verifyPaint(b);
    await page.evaluate(()=>window.variantQA.reset());await comparison.getByRole('button',{name:'A: Octa A',exact:true}).click();await ready('octagon',view);await verifyPaint(a);assert.deepEqual(await pixels(),first,'A state returns exactly in the shared camera');states.push({view,a:first});
   }
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Comparison has no horizontal document overflow');
   await mkdir('outputs',{recursive:true});
   await comparison.getByRole('group',{name:'Wariant w podglądzie 3D',exact:true}).scrollIntoViewIfNeeded();
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   await page.screenshot({path:`outputs/variant3d-${width}.png`});
   await comparison.getByRole('button',{name:'Zamknij porównanie 3D',exact:true}).click();await comparison.locator('canvas').waitFor({state:'detached'});assert.equal(await comparison.locator('canvas').count(),0,'Close unmounts canvas');
   await comparison.getByRole('button',{name:'Włącz porównanie 3D',exact:true}).click();await ready('octagon','perspective');
   await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('dialog.variant-3d-dialog'));assert.ok(await comparison.getByRole('button',{name:'Włącz porównanie 3D',exact:true}).evaluate(e=>e===document.activeElement),'Escape restores opening control');await variants.getByLabel('Porównaj: Circle B',{exact:true}).uncheck();assert.equal(await comparison.count(),0,'Deselect removes comparison and its canvas');
   await variants.getByLabel('Porównaj: Stara rewizja',{exact:true}).check();await comparison.getByRole('button',{name:'Włącz porównanie 3D',exact:true}).click();await ready('octagon','perspective');
   await comparison.getByRole('button',{name:'B: Stara rewizja',exact:true}).click();await comparison.getByRole('status').filter({hasText:'Rewizja modelu zmieniła się.'}).waitFor();assert.equal(await comparison.locator('canvas').count(),0,'Old revision cannot use current geometry');
   await comparison.getByRole('button',{name:'Zamknij porównanie 3D',exact:true}).click();await variants.getByLabel('Porównaj: Stara rewizja',{exact:true}).uncheck();
   for(const item of [a,b])assert.deepEqual(await downloadButton(variants.getByRole('button',{name:'Pobierz JSON: '+item.name,exact:true})),item.project,'Full snapshot data preserved');
   assert.deepEqual(await activeProject(),before,'Comparison never replaces active Studio project');assert.deepEqual(await readLibrary(),library,'Comparison never mutates IndexedDB snapshots');
   report.cases.push({width,status:'passed',states,scope:['explicit opt-in','one canvas','A/B source model','shared interactive camera','actual panel paint text/logo/colour','full snapshot surface/design preserved','old revision guard','accurate omitted list','unmount','immutable active Project and IndexedDB','no overflow','native modal focus and Escape'],manufacturingApproved:false});
   console.log('PASS variant 3D '+width);
  }finally{await context.close()}
 }
 assert.deepEqual(report.errors,[]);report.status='passed';report.manufacturingApproved=false;
}catch(e){report.status='failed';report.errors.push(String(e));throw e;}finally{await mkdir('docs/priorities-2026-10-23',{recursive:true});await writeFile(process.env.TEST_MODULAR_VARIANTS?'outputs/studio-ux/variant3d-modular.json':'outputs/studio-ux/variant3d.json',JSON.stringify(report,null,2)+'\n');await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose()}
