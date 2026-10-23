import assert from 'node:assert/strict';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve,extname} from 'node:path';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=await import(wranglerRequire.resolve('miniflare'));
const files=(await readdir('dist/server',{recursive:true})).filter(f=>/\.m?js$/.test(f));
const mf=new Miniflare({modules:['index.js',...files.filter(f=>f!=='index.js')].map(f=>({type:'ESModule',path:resolve('dist/server',f)})),modulesRoot:resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{QUOTE_RATE_CARD:await readFile('pricing/rate-card-working-colors-2026-10-23.json','utf8')}});
let browser,server;const report={status:'running',cases:[],errors:[]};
try{
 const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve('dist/client','.'+path),root=resolve('dist/client')+'/';if(file.startsWith(root)&&!path.startsWith('/api/')){try{const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(bytes);return;}catch{}}
 const chunks=[];for await(const c of req)chunks.push(c);const response=await mf.dispatchFetch(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});res.statusCode=response.status;for(const [k,v]of response.headers)if(k!=='set-cookie')res.setHeader(k,v);const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader"],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
 await mkdir('outputs/project-owned-reference',{recursive:true});


 for(const width of [375,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:true});const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(base+'/?arena=octagon');
  await page.waitForFunction(()=>document.querySelector('.panna-studio-model')?.dataset.ready==='true');
  await page.getByRole('button',{name:'Nawierzchnia',exact:true}).first().click();
  const input=page.getByLabel('Kolor: Strefy',{exact:true});await input.waitFor();
  const {getPatternPalette}=await import('../lib/pattern-library.ts');const color=getPatternPalette().colors[0].toLowerCase();
  async function setColor(value){const result=page.waitForResponse(r=>r.url().endsWith('/api/quote')&&r.request().method()==='POST'&&r.request().postDataJSON().zone.toLowerCase()===value);await input.fill(value);const response=await result;assert.equal(response.status(),200);const data=await response.json();assert.equal(data.rateVersion,'GF-WORKING-2026-10-23-v2');assert.equal(data.workingAssumptions,true);return data;}
  await setColor('#000001');const fewer=await setColor(color),more=await setColor('#000002');
  const row=q=>q.items.find(x=>x.id==='palette-colors');assert.equal(row(more).unitNet,row(fewer).unitNet+5);assert.equal(Math.round((more.priceNet-fewer.priceNet)*100)/100,149.1);
  await page.getByRole('button',{name:'Podsumowanie',exact:true}).first().click();await page.getByText(/Składniki kalkulacji/).first().click();await page.locator('.studio-quote-items dt').filter({hasText:row(more).label}).waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  report.cases.push({width,status:'passed',lower:fewer.priceNet,higher:more.priceNet,delta:149.1});await context.close();
 }
 assert.deepEqual(report.errors,[]);report.status='passed';console.log(JSON.stringify(report));
}catch(error){report.status='failed';report.error=String(error);throw error;}
finally{await mkdir('outputs/palette-pricing',{recursive:true});await writeFile('outputs/palette-pricing/browser.json',JSON.stringify(report,null,2));await browser?.close();await new Promise(r=>server?.close(r));await mf.dispose();}
