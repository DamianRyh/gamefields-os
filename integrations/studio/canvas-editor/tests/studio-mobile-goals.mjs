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
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle",'--use-angle='+(process.env.GF_TEST_ANGLE||'swiftshader')],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
 await mkdir('outputs/mobile',{recursive:true});
 const errors=[];
 for(const width of (process.env.GF_TEST_WIDTHS?process.env.GF_TEST_WIDTHS.split(',').map(Number):[375,390,430,1440])){
  const page=await browser.newPage({viewport:{width,height:1000}});page.on('pageerror',e=>errors.push(e.message));
  for(const arena of ['o1','p1']){
   await page.goto(base+'/?arena='+arena);
   const ready=()=>page.locator('[data-model="'+arena+'"][data-ready="true"]').waitFor({timeout:90000});await ready();
   await page.getByRole('navigation',{name:'Kroki projektu'}).getByRole('button',{name:/^Konstrukcja/}).click();
   await page.locator('.scene-paint-advanced > summary').click();assert.equal(await page.locator('.studio-color-part').count(),3);await page.locator('.studio-panel').screenshot({path:`outputs/mobile/construction-panel-${arena}-${width}.png`});
   await page.getByLabel('Kolor: Bandy',{exact:true}).fill('#1d7056');await page.getByText('Logo i detale konstrukcji',{exact:true}).click();await page.getByLabel('Tekst na bandach',{exact:true}).fill(arena.toUpperCase());await ready();
   const event=page.waitForEvent('download');await page.getByRole('button',{name:'Pobierz projekt',exact:true}).first().click();const project=JSON.parse(await readFile(await(await event).path(),'utf8'));assert.equal(project.arenaModel,arena);
   await page.getByRole('button',{name:'Pliki projektu',exact:true}).click();await page.getByLabel('Wczytaj projekt Studio JSON',{exact:true}).setInputFiles({name:'arena.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(project))});await ready();
   if(arena==='p1'){
    await page.getByRole('navigation',{name:'Kroki projektu'}).getByRole('button',{name:/^Nawierzchnia/}).click();
    if(width<=800)await page.getByRole('button',{name:'Otwórz paletę 16 kolorów',exact:true}).click();await page.getByLabel('Własny kolor',{exact:true}).fill('#245e87');await page.keyboard.press('Escape');await page.getByRole('navigation',{name:'Ustawienia nawierzchni'}).getByRole('button',{name:'Materiał',exact:true}).click();
    for(const [label,slug,surface] of [['Malowana','malowana','Akryl sportowy'],['Granulat','granulat-epdm','EPDM'],['Płytki modułowe','plytki-modulowe','Moduły sportowe'],['Sztuczna murawa','sztuczna-murawa','Sztuczna trawa 60 mm']]){
     await page.locator('[data-visual-carousel="Materiał nawierzchni"]').getByRole('button',{name:label,exact:true}).click();
     console.log('Checking material',width,slug);
     await page.locator(`[data-model="p1"][data-surface="${slug}"][data-ready="true"]`).waitFor({timeout:90000});
     assert.equal(await page.locator('[data-model="p1"]').getAttribute('data-slab-thickness'),'0.10');
     const glResult=await page.locator('.panna-model-overlay').evaluate(canvas=>{const gl=(canvas.getContext('webgl2')||canvas.getContext('webgl')),p=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,p);return {error:gl.getError(),visible:p.filter((v,i)=>i%4===3&&v>0).length}});
     assert.equal(glResult.error,0,'PBR shader must render without WebGL errors');assert.ok(glResult.visible>100,'Construction and slab must be visible');
     const download=page.waitForEvent('download');await page.getByRole('button',{name:'Pobierz projekt',exact:true}).first().click();const exported=JSON.parse(await readFile(await(await download).path(),'utf8'));
     assert.equal(exported.surface,surface);assert.equal(exported.base,'#245e87');assert.equal(exported.arenaModel,'p1');
     if(width===1440)await page.screenshot({animations:'disabled',path:`outputs/mobile/gamefields-p1-${slug}.jpg`,type:'jpeg',quality:85});
    }
    await page.locator('[data-visual-carousel="Materiał nawierzchni"]').getByRole('button',{name:'Granulat',exact:true}).click();await ready();
    await page.getByRole('navigation',{name:'Ustawienia nawierzchni'}).getByRole('button',{name:'Wzór',exact:true}).click();
   }
   assert.equal(await page.getByLabel('Miejsce wizualizacji',{exact:true}).count(),0);
   assert.equal(await page.getByRole('button',{name:'Wyposażenie',exact:true}).count(),0);
   await page.locator('.studio-orbit-canvas').focus();await page.keyboard.press('ArrowRight');await ready();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   assert.equal(await page.locator('.panna-stage').count(),0);
  }
  await page.getByRole('navigation',{name:'Kroki projektu'}).getByRole('button',{name:/^Nawierzchnia/}).click();await page.getByRole('navigation',{name:'Ustawienia nawierzchni'}).getByRole('button',{name:'Sport',exact:true}).click();await page.getByRole('group',{name:'Wybierz sport Gamefields'}).getByRole('button',{name:'Street Football',exact:true}).click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Header overflow');
  await page.locator('.panna-studio-model[data-surface-model="street-football-3x3"][data-ready="true"]').waitFor({timeout:90000});
  assert.equal(await page.locator('.studio-orbit-canvas').count(),1);
  assert.equal(await page.locator('.panna-studio-model').getAttribute('data-slab-thickness'),'0.20');
  await page.getByLabel('Nazwa projektu',{exact:true}).fill('CI — zachowany szkic');
  await page.waitForFunction(()=>document.querySelector('.studio-save')?.textContent==='Zapisano w tej przeglądarce');
  await page.goto(base+'/');
  await page.getByRole('button',{name:'Kontynuuj projekt',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('[aria-label="Nazwa projektu"]')?.value==='CI — zachowany szkic');
  assert.equal(await page.getByLabel('Nazwa projektu',{exact:true}).inputValue(),'CI — zachowany szkic','Browser draft must survive a reload');
  await page.getByRole('navigation',{name:'Kroki projektu'}).getByRole('button',{name:/^Nawierzchnia/}).click();await page.getByRole('navigation',{name:'Ustawienia nawierzchni'}).getByRole('button',{name:'Sport',exact:true}).click();await page.getByRole('group',{name:'Wybierz sport Gamefields'}).getByRole('button',{name:'Street Football',exact:true}).click();
  assert.equal(await page.getByLabel('Nazwa projektu',{exact:true}).inputValue(),'CI — zachowany szkic','Selecting the current model must not reset the draft');
  await page.locator('.panna-studio-model[data-ready="true"]').waitFor({timeout:90000});
  await page.screenshot({path:`outputs/mobile/studio-${width}.jpg`,type:'jpeg',quality:85});
  await page.getByRole('navigation',{name:'Kroki projektu'}).getByRole('button',{name:/^Nawierzchnia/}).click();await page.goto(base+'/radar');
  await page.waitForURL('**/radar');
  await page.getByRole('button',{name:'Piłka nożna',exact:true}).click();
  await page.locator('.radar-project-link').click();
  await page.waitForURL('**/radar/*');
  await page.getByRole('link',{name:'WRÓĆ DO MAPY'}).click();
  await page.waitForURL('**/radar');
  await page.getByRole('link',{name:'Boiska',exact:true}).click();
  await page.waitForURL(base+'/');await page.getByRole('button',{name:'Boiska',exact:true}).click();
  await page.locator('.panna-studio-model[data-ready="true"]').waitFor({timeout:90000});
  if(await page.locator('button.entry-start').isVisible())await page.locator('button.entry-start').click();
  await page.getByRole('navigation',{name:'Kroki projektu',exact:true}).getByRole('button',{name:'Podsumowanie',exact:true}).click();
  const summary=page.getByRole('dialog',{name:'Podsumowanie projektu'});
  assert.match(await summary.innerText(),/indywidualn.{0,4} wycen/i);
  assert.equal(/\d[\d\s.,]*\s*(?:zł|PLN)(?![A-Za-z])/i.test(await summary.innerText()),false,'Customer summary must not show a quoted amount');
  assert.equal(await summary.getByRole('link',{name:/Skontaktuj się w sprawie wyceny/}).count(),1);
  await page.getByRole('button',{name:'Wróć do edycji',exact:true}).click();
  await page.locator('.panna-studio-model[data-ready="true"]').waitFor({timeout:90000});
  await page.close();
 }
 assert.deepEqual(errors,[]);console.log('PASS: O1/P1 views, material switches, visible WebGL, preserved JSON colours, source slabs, cameras and Radar navigation. Viewports: '+(process.env.GF_TEST_WIDTHS||'375,390,430,1440'));
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose();}
