import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {existsSync} from 'node:fs';
import {chromium} from 'playwright';
const root=resolve('dist/modular-review');
const server=createServer(async(req,res)=>{let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(path==='/')path='/index.html';const file=resolve(root,'.'+path);if(!file.startsWith(root+'/'))return res.writeHead(400).end();try{const bytes=await readFile(file);res.setHeader('Content-Type',file.endsWith('.png')?'image/png':file.endsWith('.glb')?'model/gltf-binary':'text/html');res.end(bytes)}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox','--enable-unsafe-swiftshader']});
await mkdir('outputs/backgrounds',{recursive:true});
try{
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const [id,url,meshes] of [['p1','?view=viewer&product=boisko-p1&scene=urban','358'],['kids','?view=panna-kids&scene=school','172']]){
   await page.goto(base+'/'+url);await page.waitForFunction(()=>{const d=document.querySelector('[data-testid="source-glb-viewer"]')?.dataset;return d?.loaded==='true'&&d?.backgroundReady==='true'&&d?.cameraMode==='fixed-scene'},{},{timeout:60000});
   const viewer=page.getByTestId('source-glb-viewer');assert.equal(await viewer.getAttribute('data-mesh-count'),meshes);assert.equal(await viewer.getAttribute('data-instance-scales'),'1,1,1');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await viewer.screenshot({path:`outputs/backgrounds/${id}-${width}.png`});
   if(id==='kids'){await page.getByRole('button',{name:'Obróć model 3D',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[data-testid="source-glb-viewer"]')?.dataset.cameraMode==='orbit');await page.getByRole('button',{name:'Na dziedzińcu',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[data-testid="source-glb-viewer"]')?.dataset.backgroundReady==='true')}
  }
  for(const [id,model,meshes] of [['p1','boisko-p1','358'],['kids','panna-kids-o1','172'],['w1','boisko-w1','118']]){
   await page.goto(base+'/?view=source&model='+model);
   await page.waitForFunction(model=>{const d=document.querySelector('[data-testid="source-glb-viewer"]')?.dataset;return d?.loaded==='true'&&d?.assetUrl.includes(model)&&d?.playingSurface==='true'},model,{timeout:60000});
   const viewer=page.getByTestId('source-glb-viewer');assert.equal(await viewer.getAttribute('data-mesh-count'),meshes);assert.equal(await viewer.getAttribute('data-camera-mode'),'orbit');assert.equal(await viewer.getAttribute('data-instance-scales'),'1,1,1');
   const extent=(await viewer.getAttribute('data-projected-extent')).split(',').map(Number);assert.ok(extent.every(v=>Number.isFinite(v)&&v>0&&v<1),'Whole model must fit inside the viewport');
   await viewer.screenshot({path:`outputs/backgrounds/${id}-studio-${width}.png`});
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 const page=await browser.newPage();await page.route('**/panna-kids-school.png',route=>route.fulfill({status:404,body:''}));await page.goto(base+'/?view=panna-kids&scene=school');await page.waitForFunction(()=>{const d=document.querySelector('[data-testid="source-glb-viewer"]')?.dataset;return d?.loaded==='true'&&d?.backgroundReady==='false'&&d?.cameraMode==='orbit'});assert.ok(await page.getByText('Tło jest niedostępne.',{exact:false}).isVisible());await page.close();
 for(const path of ['source/boisko-w1.glb','components/k1.glb'])assert.equal((await fetch(base+'/models/gamefields/'+path)).status,200);
 console.log('PASS: P1 and Kids in backgrounds at 1440/390, original geometry, neutral-view switch, failed-background fallback, owner-approved library endpoints available.');
}finally{await browser.close();await new Promise(r=>server.close(r))}
