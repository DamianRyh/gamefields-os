// Paint plan from the Studio summary: choose a Murale project, open the summary, print the plan, read the printed document.
import assert from 'node:assert/strict';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve,extname} from 'node:path';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=await import(wranglerRequire.resolve('miniflare'));
const files=(await readdir('dist/server',{recursive:true})).filter(f=>/\.m?js$/.test(f));
const mf=new Miniflare({modules:['index.js',...files.filter(f=>f!=='index.js')].map(f=>({type:'ESModule',path:resolve('dist/server',f)})),modulesRoot:resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{SALES_MARGIN:'0',INTERNAL_COST_CARD:JSON.stringify({version:'TEST-VARIANTS-NOT-FOR-SALE',currency:'PLN',workingAssumptions:true,arenaNet:{octagon:1234,'circle-cage-1':2345}})}});
let browser,server,lastPage;const report={status:'running',cases:[],errors:[]};
try{
 const mime={'.html':'text/html','.glb':'model/gltf-binary','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve('dist/client','.'+path),root=resolve('dist/client')+'/';if(file.startsWith(root)&&!path.startsWith('/api/')){try{const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(bytes);return;}catch{}}
 const chunks=[];for await(const c of req)chunks.push(c);const response=await mf.dispatchFetch(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});res.statusCode=response.status;for(const [k,v]of response.headers)if(k!=='set-cookie')res.setHeader(k,v);const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader"],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});

 await mkdir('outputs/studio-ux',{recursive:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errs=[];page.on('pageerror',e=>errs.push(e.message));
 await page.addInitScript(()=>{const d=Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype,'contentWindow');Object.defineProperty(HTMLIFrameElement.prototype,'contentWindow',{get(){const w=d.get.call(this);if(w&&!w.__patched){w.__patched=true;const f=this;w.print=()=>{window.__printed=f.contentDocument.documentElement.outerHTML;};}return w;}});});
 await page.goto(base+'/?arena=p1');await page.locator('.panna-studio-model[data-ready=true]').waitFor({timeout:30000});
 const d=page.locator('.gfsd');await d.waitFor();
 await d.getByRole('group',{name:'Zastosowanie'}).getByRole('button',{name:'Murale',exact:true}).click();
 await d.locator('.gfsd-card').nth(3).click(); // Pejzaż
 await page.getByRole('button',{name:/Podsumowanie/}).first().click();
 const btn=page.getByRole('button',{name:'Pobierz plan malowania (PDF)'});await btn.waitFor({timeout:20000});await btn.click();
 await page.waitForFunction(()=>!!window.__printed,null,{timeout:30000});
 const html=await page.evaluate(()=>window.__printed);const status=await page.locator('section[aria-label="Plan malowania dla wykonawcy"] [role=status]').textContent();
 await mkdir('outputs/studio-ux',{recursive:true});await writeFile('outputs/studio-ux/paint-plan.html',html);
 const sheets=(html.match(/class="sheet"/g)||[]).length,rows=(html.match(/<tr><td>\d/g)||[]).length;
 assert.equal(sheets,3,'three A4 sheets');assert.ok(rows>=3&&rows<=6,'3–5 paints in the plan');assert.match(status,/farb, ok\. [\d,]+ l, taśma \d+ m/);assert.deepEqual(errs,[]);
 assert.match(html,/Pejzaż/,'plan names the customer\'s pattern');assert.match(html,/7,1 × 5,6 m/,'plan uses the project dimensions');
 // scope as on the live Studio v206: no plan for round or polygonal play areas (O1 here)
 const o1=await browser.newPage({viewport:{width:1440,height:1000}});await o1.goto(base+'/?arena=o1');await o1.locator('.panna-studio-model[data-ready=true]').waitFor({timeout:30000});
 await o1.getByRole('button',{name:/Podsumowanie/}).first().click();await o1.getByRole('button',{name:/Pobierz kartę projektu/}).first().waitFor({timeout:20000});
 assert.equal(await o1.getByRole('button',{name:'Pobierz plan malowania (PDF)'}).count(),0,'no paint plan on O1');
 console.log(JSON.stringify({status:'passed',sheets,rows,message:status,o1:'no plan card'}));
}catch(e){console.error(e);process.exitCode=1;}finally{await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose();}
