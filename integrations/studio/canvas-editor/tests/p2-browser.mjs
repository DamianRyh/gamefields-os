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
 const db=await mf.getD1Database('DB');for(const file of ['drizzle/0011_studio_workshop.sql','drizzle/0013_studio_shared_projects.sql'])for(const sql of (await readFile(file,'utf8')).split('--> statement-breakpoint'))if(sql.trim())await db.exec(sql.replaceAll('\n',' '));
 const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve('dist/client','.'+path),root=resolve('dist/client')+'/';if(file.startsWith(root)&&!path.startsWith('/api/')){try{const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(bytes);return;}catch{}}
 const chunks=[];for await(const c of req)chunks.push(c);const response=await mf.dispatchFetch(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});res.statusCode=response.status;for(const [k,v]of response.headers)if(k!=='set-cookie')res.setHeader(k,v);const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader"],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});


 await mkdir('outputs/p2',{recursive:true});const errors=[];
 const context=await browser.newContext({viewport:{width:390,height:1000},acceptDownloads:true});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const ready=()=>page.locator('.panna-studio-model[data-ready=true]').waitFor({timeout:45000});
 const download=async(name)=>{const event=page.waitForEvent('download');await page.getByRole('button',{name,exact:true}).first().click();return JSON.parse(await readFile(await(await event).path(),'utf8'))};
 await page.goto(base+'/?arena=o1');await ready();await page.getByLabel('Nazwa projektu',{exact:true}).fill('P2 prywatny projekt');
 await page.waitForTimeout(900);
 let workshopRequests=0;page.on('request',r=>{if(r.url().includes('/api/workshop?page='))workshopRequests++});
 await page.getByRole('button',{name:'Pliki projektu',exact:true}).click();
 const original=await download('Pobierz projekt');
 assert.equal(workshopRequests,0,'Workshop list is lazy');
 await page.getByRole('navigation',{name:'Biblioteka projektów'}).getByRole('button',{name:'Udostępnij',exact:true}).click();
 const share=page.getByRole('region',{name:'Udostępnianie projektu'});assert(await share.getByRole('button',{name:'Utwórz link do projektu'}).isDisabled());
 await share.getByRole('checkbox').last().check();await share.getByRole('button',{name:'Utwórz link do projektu'}).click();
 const link=share.getByRole('textbox',{name:'Link do udostępnionego projektu'});await link.waitFor();const url=await link.inputValue();
 const draft=await page.evaluate(()=>localStorage.getItem('gamefields-studio-draft-v1'));assert(draft,'Author draft must exist before opening the read-only link');
 const view=await page.context().newPage();await view.goto(url);await view.locator('.panna-studio-model[data-ready=true]').waitFor({timeout:45000});assert.equal(await view.getByRole('heading',{level:1}).innerText(),'Projekt Gamefields');assert.equal(await view.evaluate(()=>localStorage.getItem('gamefields-studio-draft-v1')),draft);
 await view.getByRole('link',{name:'Otwórz własną kopię w Studio →'}).click();await view.getByLabel('Nazwa projektu',{exact:true}).waitFor();await view.waitForFunction(()=>document.querySelector('[aria-label="Nazwa projektu"]').value.includes('kopia'));await view.close();
 // Revoke through the author's retained receipt, even after a different tab opened its copy.
 await share.getByRole('button',{name:'Wycofaj link'}).click();await page.getByText('Link wycofany. Zapisana kopia na serwerze została usunięta.',{exact:true}).waitFor();
 const revoked=await browser.newPage();await revoked.goto(url);await revoked.getByRole('heading',{name:'Nie możemy otworzyć projektu'}).waitFor();await revoked.close();
 await page.goto(base+'/');await ready();await page.getByRole('button',{name:'Pliki projektu',exact:true}).click();
 // Seed deterministic public projects; no external publication or commercial inquiry is sent.
 for(let i=0;i<14;i++)await db.prepare('INSERT INTO studio_workshop_designs(id,title,project_json,created_at,submitter_hash,fingerprint,delete_key_hash) VALUES(?,?,?,?,?,?,?)').bind(crypto.randomUUID(),i===13?'Teqball wzór':'Projekt '+i,JSON.stringify({...original,arenaDesign:{...original.arenaDesign,goalPanelColor:'#112233'}}),Date.now()+i,'test',String(i),'test').run();
 await page.getByRole('navigation',{name:'Biblioteka projektów'}).getByRole('button',{name:'Warsztat',exact:true}).click();const list=page.getByRole('region',{name:'Przeglądaj Warsztat'});await list.getByText('1 / 2',{exact:true}).waitFor();assert.equal(await list.getByRole('article').count(),12);assert.equal(await page.locator('.panna-model-overlay').count(),1);
 await list.getByRole('button',{name:'Następna strona'}).click();await list.getByText('2 / 2',{exact:true}).waitFor();await page.waitForFunction(()=>document.querySelectorAll('.studio-p2-grid article').length===2);assert.equal(await list.getByRole('article').count(),2);
 await list.getByLabel('Szukaj projektu').fill('Teqball');await list.getByRole('button',{name:'Szukaj w Warsztacie'}).click();await list.getByText('1 / 1',{exact:true}).waitFor();await page.waitForFunction(()=>document.querySelectorAll('.studio-p2-grid article').length===1);assert.equal(await list.getByRole('article').count(),1);
 await list.getByRole('button',{name:'Otwórz własną kopię'}).click();await page.waitForFunction(()=>document.querySelector('[aria-label="Nazwa projektu"]').value.includes('moja wersja'));await ready();assert((await page.getByLabel('Nazwa projektu',{exact:true}).inputValue()).includes('moja wersja'));await page.getByRole('button',{name:'Pliki projektu',exact:true}).click();const copy=await download('Pobierz projekt');assert.equal(copy.arenaDesign.goalPanelColor,'#112233');assert.notEqual(copy.id,original.id);
 await page.getByRole('button',{name:'Podsumowanie',exact:true}).click();await page.locator('.studio-quote-total').waitFor();const pack=await download('Pobierz pakiet do zapytania');assert.equal(pack.schema,'GF-INQUIRY-PACKAGE-1');assert.equal(pack.configurationHash.length,64);assert.equal(pack.request.name,copy.name);await page.screenshot({path:'outputs/p2/inquiry-mobile.png'});await page.getByRole('button',{name:'Wróć do edycji'}).click();
 assert.deepEqual(errors,[]);console.log('PASS P2 browser: lazy Workshop, sharing consent/read-only/copy/revoke, draft isolation, 12-item pagination/search, own-copy identity and independent goal colour, inquiry package.');
 await page.close();
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose();}
