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


 let html=await readFile('outputs/p2-live-homepage.html','utf8');html=html.replaceAll('https://gamefields-studio.ryhfs90.chatgpt.site',base).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,script=>script.includes('gf-contact-ready')||script.includes('id="gh-data"')?script:'');
 const context=await browser.newContext({viewport:{width:390,height:1000}});let sent=0;await context.route('https://www.gamefields.eu/**',route=>{if(route.request().method()!=='GET'){sent++;return route.abort()}return route.request().isNavigationRequest()?route.fulfill({contentType:'text/html',body:html}):route.abort()});
 const page=await context.newPage();await page.goto(base+'/?arena=o1');await page.locator('.panna-studio-model[data-ready=true]').waitFor({timeout:45000});await page.getByRole('navigation',{name:'Kroki projektu'}).getByRole('button',{name:'Podsumowanie',exact:true}).click();await page.locator('.studio-quote-total').waitFor();
 const popupEvent=page.waitForEvent('popup');await page.getByRole('button',{name:'Wyślij projekt do wyceny',exact:true}).click();const popup=await popupEvent;await popup.getByLabel('E-mail',{exact:false}).count();await popup.waitForFunction(()=>document.querySelector('[name="project-details"]')?.value.includes('arenaModel'));
 const details=JSON.parse(await popup.locator('[name="project-details"]').inputValue());assert.equal(details.arenaModel,'o1');assert(details.estimate,'Estimate accompanies the configuration');assert.equal(sent,0);assert.equal(await popup.locator('#gc-attached').getAttribute('hidden'),null);await page.waitForFunction(()=>[...document.querySelectorAll('.studio-summary [role="status"]')].some(e=>e.textContent.includes('dołącz')));
 console.log('PASS inquiry browser: actual current WordPress bridge in a local fixture receives configuration + estimate, acknowledges exact payload; no form submission or outgoing commercial message.');await context.close();
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose();}
