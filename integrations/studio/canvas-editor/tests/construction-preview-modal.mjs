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
 await mkdir('outputs/product-viewer',{recursive:true});const errors=[],report=[];
 const patch=JSON.parse(await readFile(resolve('deployment/product-viewer-modal-v13-pending.json'),'utf8'));
 let html=await readFile(process.env.GF_HOMEPAGE_FIXTURE,'utf8');if(!html.includes('GF product-only 3D modal v13')){assert.equal(html.split(patch.old_content).length-1,1);html=html.replace(patch.old_content,patch.new_content)}html=html.replaceAll('https://gamefields-studio.ryhfs90.chatgpt.site',base).replace('<head>','<head><base href="https://www.gamefields.eu/">');
 for(const [width,arena,coat,label]of [[390,'o1','blue','Niebieski'],[1280,'p1','red','Czerwony']]){
  const page=await browser.newPage({viewport:{width,height:1000}});page.on('pageerror',e=>{if(!e.message.includes('wp is not defined'))errors.push(e.message)});const navigations=[];page.on('request',r=>{if(r.isNavigationRequest())navigations.push(r.url())});await page.route(base+'/homepage-fixture',r=>r.fulfill({body:html,contentType:'text/html'}));await page.goto(base+'/homepage-fixture',{waitUntil:'domcontentloaded'});
  await page.locator('[data-select-model="'+arena+'"]').first().click();const selected=page.locator('.gh-model-stage').getByRole('radio',{name:label,exact:true});await selected.click();await page.waitForFunction(label=>[...document.querySelectorAll('.gh-model-stage [role=radio]')].some(e=>e.getAttribute('aria-label')===label&&e.getAttribute('aria-checked')==='true'),label);
  await page.getByRole('button',{name:'Zobacz model 3D',exact:true}).click();const dialog=page.locator('#gh-dialog');await dialog.waitFor();assert.equal(await dialog.locator('iframe').count(),1);const src=await dialog.locator('iframe').getAttribute('src');assert.equal(new URL(src).pathname,'/product-viewer');assert.equal(new URL(src).searchParams.get('arena'),arena);assert.equal(new URL(src).searchParams.get('coat'),coat);assert.equal(await dialog.getByRole('link',{name:'Otwórz Studio w nowej karcie'}).count(),0);assert(!navigations.some(u=>new URL(u).pathname==='/'));
  const preview=page.frameLocator('#gh-dialog iframe');await preview.locator('.construction-viewer[data-ready="true"]').waitFor({timeout:60000});assert.equal(await preview.locator('canvas').getAttribute('data-coat'),coat);assert.equal(await preview.getByRole('navigation',{name:'Narzędzia edycji'}).count(),0);await dialog.screenshot({path:`outputs/product-viewer/modal-${arena}-${coat}-${width}.png`});const cta=dialog.getByRole('link',{name:'Personalizuj w Studio',exact:true});assert.equal(new URL(await cta.getAttribute('href')).searchParams.get('coat'),coat);
  if(width===390){await page.locator('[data-close-dialog]').click();assert.equal(await page.locator('iframe').count(),0);assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Zobacz model 3D');}
  else{await cta.click();await page.waitForURL(u=>u.pathname==='/'&&u.searchParams.get('coat')===coat);await page.locator('[data-model="p1"][data-ready="true"]').waitFor({timeout:60000});await page.getByRole('navigation',{name:'Narzędzia edycji'}).getByRole('button',{name:'Konstrukcja',exact:true}).click();await page.getByRole('navigation',{name:'Ustawienia konstrukcji'}).getByRole('button',{name:'Kolory',exact:true}).click();assert.equal(await page.getByLabel('Kolor: Bandy',{exact:true}).inputValue(),'#c81726')}
  report.push({width,arena,coat,previewOnlyUntilCTA:true,focusRestored:width===390,colourRetainedInStudio:width===1280});await page.close();
 }
 assert.deepEqual(errors,[]);console.log('PASS preview-only modal, selected model/colour, focus/iframe disposal and Studio only after explicit CTA.');console.log(JSON.stringify(report));
}finally{await browser?.close();await new Promise(r=>server?server.close(r):r());await mf.dispose()}
