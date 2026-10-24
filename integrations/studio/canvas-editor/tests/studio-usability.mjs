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

 await mkdir('outputs/studio-ux-regression',{recursive:true});
 const errors=[];
 for(const width of [375,390,430,1440]){
  const page=await browser.newPage({viewport:{width,height:1000}});
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'/?arena=octagon');
  const ready=()=>page.locator('.panna-studio-model[data-ready="true"]').waitFor({timeout:45000});
  await ready();
  const tool=name=>page.getByRole('navigation',{name:'Narzędzia edycji'}).getByRole('button',{name,exact:true});
  const undo=page.getByRole('button',{name:'Cofnij',exact:true}),redo=page.getByRole('button',{name:'Ponów',exact:true});
  const assertTarget=async(locator,label)=>{
   assert.equal(await locator.isVisible(),true,`${width}: ${label} visible`);
   const box=await locator.boundingBox();assert.ok(box.width>=43.9&&box.height>=43.9,`${width}: ${label} needs 44px target (${box.width} × ${box.height})`);
  };
  await assertTarget(redo,'Redo');
  for(const label of ['Boczny','Z góry','Z boiska'])await assertTarget(page.getByRole('button',{name:label,exact:true}),label);
  for(const label of ['Pole gry','Strefy','Otoczenie'])await assertTarget(page.getByLabel(`Kolor: ${label}`,{exact:true}),label);
  await page.waitForFunction(()=>document.querySelector('.studio-save')?.textContent.includes('Zapisano'));
  assert.equal(await page.locator('.studio-save').isVisible(),true,`${width}: autosave status remains visible`);
  const lines=page.getByLabel('Pokaż linie',{exact:true});
  assert.equal(await lines.isChecked(),false);
  await lines.check();await ready();assert.equal(await lines.isChecked(),true);
  await undo.click();await ready();assert.equal(await lines.isChecked(),false,'Undo restores line setting');
  await redo.click();await ready();assert.equal(await lines.isChecked(),true,'Redo restores line setting');
  await page.getByLabel('Nazwa projektu',{exact:true}).fill('Boisko szkoły — własna nazwa');
  await page.getByRole('navigation',{name:'Narzędzia edycji'}).getByRole('button',{name:'Konstrukcja',exact:true}).click();await page.getByRole('button',{name:'Zmień boisko',exact:true}).click();
  await page.getByRole('button',{name:'Panna Grid',exact:true}).click();await ready();
  assert.equal(await page.getByLabel('Nazwa projektu',{exact:true}).inputValue(),'Boisko szkoły — własna nazwa');
  await undo.click();await ready();
  assert.equal(await page.locator('.panna-studio-model').getAttribute('data-model'),'octagon');
  assert.equal(await page.getByLabel('Nazwa projektu',{exact:true}).inputValue(),'Boisko szkoły — własna nazwa');
  await tool('Konstrukcja').click();
  await page.getByLabel('Kolor: Bandy',{exact:true}).fill('#205967');
  await page.getByLabel('Tekst na bandach',{exact:true}).fill('SZKOŁA 12');
  await ready();
  const openSummary=page.getByRole('button',{name:'Podsumowanie',exact:true});
  await openSummary.click();
  const dialog=page.getByRole('dialog',{name:'Podsumowanie projektu',exact:true});
  await dialog.waitFor();
  assert.equal(await page.locator('.studio-workspace-content').evaluate(el=>el.inert),true,'Modal makes workspace inert');
  const row=label=>dialog.locator('dl > div').filter({has:page.locator('dt',{hasText:new RegExp('^'+label+'$')})}).locator('dd');
  for(const [label,value] of [['Model','Panna Octa'],['Kod produktu','GF-CT-008'],['Kolor paneli','#205967'],['Kolor ramy','#30363C'],['Kolor bramek','#30363C'],['Wykończenie','Matowe'],['Napis na panelach','SZKOŁA 12'],['Logo na panelach','Brak']]){
   assert.equal((await row(label).innerText()).trim().toLowerCase(),value.toLowerCase(),`${width}: summary ${label}`);
  }
  assert.notEqual((await row('Linie').innerText()).trim(),'Wyłączone','Summary reflects enabled lines');
  await page.keyboard.press('Shift+Tab');
  assert.equal(await dialog.evaluate(el=>el.contains(document.activeElement)),true,'Tab remains inside dialog');
  await page.screenshot({path:`outputs/studio-ux-regression/summary-${width}.png`});
  await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});
  assert.equal(await page.locator('.studio-workspace-content').evaluate(el=>el.inert),false);
  assert.equal(await openSummary.evaluate(el=>document.activeElement===el),true,'Escape restores trigger focus');
  await tool('Nawierzchnia').click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${width}: no horizontal overflow`);
  await page.screenshot({path:`outputs/studio-ux-regression/editor-${width}.png`});
  const download=page.waitForEvent('download');
  await page.getByRole('button',{name:'Pobierz projekt',exact:true}).first().click();
  const saved=JSON.parse(await readFile(await(await download).path(),'utf8'));
  assert.equal(saved.name,'Boisko szkoły — własna nazwa');assert.equal(saved.lines,true);assert.equal(saved.arenaDesign.text,'SZKOŁA 12');
  await page.close();
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: Studio usability at 375/390/430/1440 px, visible 44px editing controls and autosave, Undo/Redo, custom-name preservation, truthful summary, inert dialog and focus restoration, JSON export; no inquiry submitted.');
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose();}
