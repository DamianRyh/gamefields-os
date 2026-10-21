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
 const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve('dist/client','.'+path),root=resolve('dist/client')+'/';if(file.startsWith(root)&&!path.startsWith('/api/')){try{const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(bytes);return;}catch{}}
 const chunks=[];for await(const c of req)chunks.push(c);const response=await mf.dispatchFetch(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});res.statusCode=response.status;for(const [k,v]of response.headers)if(k!=='set-cookie')res.setHeader(k,v);const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader"],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
 await mkdir('outputs/reflow-keyboard',{recursive:true});
 const evidence=[],errors=[];
 for(const viewport of [{width:720,height:500},{width:320,height:500}]){
  const page=await browser.newPage({viewport});page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/?arena=octagon');await page.locator('.panna-studio-model[data-ready="true"]').waitFor({timeout:45000});
  const assertReflow=async label=>{const m=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert.ok(m.scroll<=m.width+1,label+JSON.stringify(m));};
  await assertReflow('Studio reflow');
  const header=await page.locator('.studio-topbar').evaluate(el=>{const r=el.getBoundingClientRect();return [...el.children].every(child=>{const c=child.getBoundingClientRect();return c.top>=r.top-1&&c.bottom<=r.bottom+1;});});assert.ok(header,'All header controls fit within the header');
  const summary=page.getByRole('button',{name:'Podsumowanie',exact:true});await summary.focus();await page.keyboard.press('Enter');
  const dialog=page.getByRole('dialog',{name:'Podsumowanie projektu'});await dialog.waitFor();
  for(let i=0;i<25;i++){await page.keyboard.press('Tab');assert.ok(await dialog.evaluate(el=>el.contains(document.activeElement)));}
  await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});assert.ok(await summary.evaluate(el=>el===document.activeElement));
  const pattern=page.locator('.studio-current-pattern').first();await pattern.focus();await page.keyboard.press('Enter');
  const patterns=page.getByRole('dialog',{name:'Wybierz wzór',exact:true});await patterns.waitFor();
  for(let i=0;i<20;i++){await page.keyboard.press(i%2?'Tab':'Shift+Tab');assert.ok(await patterns.evaluate(el=>el.contains(document.activeElement)));}
  await assertReflow('Pattern dialog reflow');await page.keyboard.press('Escape');await patterns.waitFor({state:'detached'});assert.ok(await pattern.evaluate(el=>el===document.activeElement));
  await page.screenshot({path:`outputs/reflow-keyboard/studio-${viewport.width}.png`,fullPage:true});
  await page.goto(base+'/radar');await assertReflow('Radar reflow');
  const football=page.getByRole('button',{name:'Piłka nożna',exact:true});await football.focus();await page.keyboard.press('Enter');assert.equal(await football.getAttribute('aria-pressed'),'true');
  const link=page.locator('.radar-project-link');await link.focus();await page.keyboard.press('Enter');await page.waitForURL('**/radar/*');await assertReflow('Radar detail reflow');
  const back=page.getByRole('link',{name:'WRÓĆ DO MAPY'});await back.focus();await page.keyboard.press('Enter');await page.waitForURL('**/radar');
  await page.screenshot({path:`outputs/reflow-keyboard/radar-${viewport.width}.png`,fullPage:true});evidence.push({viewport,result:'PASS',method:'CSS viewport approximation of200% browser zoom; not physical-device testing'});await page.close();
 }
 assert.deepEqual(errors,[]);const {writeFile}=await import('node:fs/promises');await writeFile('outputs/reflow-keyboard/results.json',JSON.stringify(evidence,null,2));console.log('PASS:720x500 and320x500 CSS reflow, keyboard dialogs/focus restoration, Radar filter/detail/back; no page horizontal overflow or runtime errors.');
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose();}
