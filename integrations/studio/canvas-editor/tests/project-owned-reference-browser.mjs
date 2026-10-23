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
 await mkdir('outputs/project-owned-reference',{recursive:true});

 const os={schema:'GF-OWNED-ASSEMBLY-1',config:{schema:'GF-OWNED-ASSEMBLY-1',family:'street-field',mode:'assembly',part:'sf-long',color:'#30363c',long:4,short:3,goals:2,entries:1,levels:1}};
 const jsonFile=(name,value)=>({name,mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))});
 for(const width of [375,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:true});
  const page=await context.newPage(),quoteBodies=[];page.on('pageerror',e=>report.errors.push(e.message));
  page.on('request',request=>{if(new URL(request.url()).pathname==='/api/quote')quoteBodies.push(request.postData())});
  try{
   await page.goto(base+'/?arena=street-field');await page.getByRole('button',{name:'Pliki projektu',exact:true}).click();
   const inspector=page.locator('.owned-inspector');await inspector.locator('summary').first().click();
   const download=async(button)=>{const event=page.waitForEvent('download');await button.click();return JSON.parse(await readFile(await(await event).path(),'utf8'))};
   const projectDownload=()=>download(page.getByRole('button',{name:'Pobierz projekt',exact:true}).first());
   await page.waitForFunction(()=>{const e=document.getElementById('studio-quote-amount');return e&&e.textContent!=='Przeliczam…'});
   const seed=await projectDownload();
   const logo='data:image/svg+xml;base64,'+Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4"><path fill="#123456" d="M0 0h4v4z"/></svg>').toString('base64');
   seed.objects.push({id:'reference-logo',kind:'image',name:'Pełne logo Łódź',src:logo,x:10,y:20,scale:100,rotation:0,opacity:100,color:'#ffffff',target:'court'});
   const seededQuote=page.waitForResponse(response=>new URL(response.url()).pathname==='/api/quote'&&response.request().postData()?.includes('Pełne logo Łódź'));
   await page.getByLabel('Wczytaj projekt Studio JSON',{exact:true}).setInputFiles(jsonFile('full-project.json',seed));
   await (await seededQuote).finished();
   await page.waitForFunction(()=>document.querySelector('.studio-save')?.textContent==='Zapisano w tej przeglądarce');
   await page.waitForFunction(()=>{const e=document.getElementById('studio-quote-amount');return e&&e.textContent!=='Przeliczam…'});
   const before=await projectDownload(),quoteTextBefore=await page.locator('#studio-quote-amount').textContent();
   assert.equal(before.objects.at(-1).src,logo);
   const countBefore=quoteBodies.length,quotesBefore=[...quoteBodies];
   const loadOs=async(value)=>{await page.getByLabel('Konfiguracja OS JSON',{exact:true}).setInputFiles(jsonFile('qa-os.json',value));await expectVisible(inspector.getByRole('region',{name:'Wynik inspekcji OS'}));};
   await loadOs(os);
   await inspector.getByRole('button',{name:'Utwórz powiązanie z bieżącym projektem',exact:true}).click();
   const reference=inspector.getByRole('region',{name:'Powiązanie snapshotów Studio i OS'});
   await expectVisible(reference.getByText('Bieżący projekt jest zgodny ze snapshotem manifestu.',{exact:true}));
   const manifest=await download(inspector.getByRole('button',{name:'Pobierz manifest powiązania JSON',exact:true}));
   assert.deepEqual(manifest.studio.project,before,'Manifest contains the exact full active Project, including images and objects');
   assert.equal(manifest.schema,'GF-PROJECT-OWNED-REFERENCE-1');assert.equal(manifest.manufacturingReady,false);assert.equal(manifest.technicalBill.rows,null);assert.equal(manifest.pricing.status,'NOT_INCLUDED');
   report.cases.push({width,scenario:'create-export-current',schema:manifest.schema});
   const manifestInput=page.getByLabel('Manifest powiązania Studio OS JSON',{exact:true});
   await manifestInput.setInputFiles(jsonFile('own-reference.json',manifest));
   await expectVisible(reference.getByText('Bieżący projekt jest zgodny ze snapshotem manifestu.',{exact:true}));
   assert.deepEqual(await projectDownload(),before,'Inspect/create/import/export must preserve active full Project');
   assert.deepEqual(quoteBodies,quotesBefore,'Reference operations must not request another quote');
   await page.getByLabel('Nazwa projektu',{exact:true}).fill('QA — zmieniony snapshot');
   await expectVisible(reference.getByText('Manifest historyczny — bieżący projekt różni się od zapisanego snapshotu.',{exact:true}));
   const changed=await projectDownload();assert.equal(changed.name,'QA — zmieniony snapshot');
   await page.getByLabel('Nazwa projektu',{exact:true}).fill(before.name);
   await expectVisible(reference.getByText('Bieżący projekt jest zgodny ze snapshotem manifestu.',{exact:true}));
   report.cases.push({width,scenario:'project-change-stale-and-return'});
   await reference.screenshot({path:`outputs/project-owned-reference/success-${width}.png`});
   const tampered=structuredClone(manifest);tampered.manifestRevision='0'.repeat(64);
   await manifestInput.setInputFiles(jsonFile('tampered.json',tampered));
   await expectVisible(inspector.getByRole('alert'));assert.equal(await reference.count(),0,'Failed manifest import clears old success');
   assert.equal(await inspector.getByRole('button',{name:'Pobierz manifest powiązania JSON',exact:true}).count(),0);
   assert.deepEqual(await projectDownload(),before,'Tampered import must preserve active Project');
   report.cases.push({width,scenario:'tampered-clears-success'});
   await loadOs({...os,config:{...os.config,family:'octagon',part:'oct-standard'}});
   await inspector.getByRole('button',{name:'Utwórz powiązanie z bieżącym projektem',exact:true}).click();
   await expectVisible(inspector.getByRole('alert'));assert.equal(await reference.count(),0,'Wrong-family creation must not leave manifest');
   assert.deepEqual(await projectDownload(),before);assert.equal(quoteBodies.length,countBefore,'No pricing changes or quote requests after all operations');
   assert.equal(await page.locator('#studio-quote-amount').textContent(),quoteTextBefore,'Displayed quote remains unchanged');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
   report.cases.push({width,scenario:'wrong-family-rejected-project-quote-preserved'});
   await page.evaluate(()=>{const original=File.prototype.text;File.prototype.text=async function(){if(this.name==='slow-os.json')await new Promise(r=>setTimeout(r,500));return original.call(this)}});
   await page.getByLabel('Konfiguracja OS JSON',{exact:true}).setInputFiles(jsonFile('slow-os.json',os));
   await page.getByLabel('Konfiguracja OS JSON',{exact:true}).setInputFiles({name:'new-invalid.json',mimeType:'application/json',buffer:Buffer.from('{broken')});
   await expectVisible(inspector.getByRole('alert'));
   await page.waitForTimeout(650);
   assert.equal(await inspector.getByRole('region',{name:'Wynik inspekcji OS'}).count(),0,'Late older read cannot replace the newest failure');
   assert.match(await inspector.getByRole('alert').textContent(),/new-invalid/);
   assert.deepEqual(await projectDownload(),before);
   report.cases.push({width,scenario:'late-file-read-cannot-replace-newer-failure'});
   await page.screenshot({path:`outputs/project-owned-reference/reference-${width}.png`});
  }finally{await context.close()}
 }
 assert.deepEqual(report.errors,[]);report.status='passed';console.log(`PASS project-owned reference browser: ${report.cases.length} cases`);
}catch(e){report.status='failed';report.errors.push(String(e));throw e}
finally{await mkdir('outputs/project-owned-reference',{recursive:true});await writeFile('outputs/project-owned-reference/browser.json',JSON.stringify(report,null,2)+'\n');await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose();}
async function expectVisible(locator){await locator.waitFor({state:'visible',timeout:15000})}
