import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
const require=createRequire('/Users/mac/Documents/Gamefields/work/studio-street15/package.json');
const {chromium}=require('playwright');
const dir='/Users/mac/Documents/Gamefields/integrations/wordpress/homepage/premium-2026-10-26';
const out='/Users/mac/Documents/Gamefields/outputs/homepage-surface-offers-2026-10-26';
const report={cases:[],errors:[]};let browser,server;
try{
await mkdir(out,{recursive:true});const content=await readFile(dir+'/preview.html','utf8');
server=createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(content);});await new Promise(r=>server.listen(0,'127.0.0.1',r));
browser=await chromium.launch({headless:true});
for(const width of [375,390,430,768,1440]){
const p=await browser.newPage({viewport:{width,height:width<760?844:960}});p.on('pageerror',e=>report.errors.push(e.message));
await p.goto(`http://localhost:${server.address().port}`,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
assert.equal(await p.locator('h1').count(),1);assert.equal(await p.locator('iframe').count(),0);
assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Horizontal overflow '+width);
await p.locator('[data-select-model="octagon"]').click();assert.equal(await p.locator('#gh-model-name').textContent(),'Panna Octa');
assert((await p.locator('[data-current-studio]').first().getAttribute('href')).includes('arena=octagon'));
await p.locator('[data-catalog]').click();assert.equal(await p.locator('.gh-catalog article').count(),8);assert.deepEqual(await p.locator('.gh-catalog h3').allTextContents(),['Panna Play','Panna Court','Panna Cage 90','Panna Cage 180','Panna Octa','Panna Grid','Panna Ring','Street Arena 15']);await p.keyboard.press('Escape');assert.equal(await p.locator('#gh-dialog').evaluate(n=>n.open),false);
await p.locator('[data-detail="street15"]').click();assert.equal(await p.locator('#gh-dialog-title').textContent(),'Street Arena 15');await p.locator('[data-close-dialog]').click();
await p.locator('[data-material-name="Granulat"]').click();await p.locator('#gh-dialog-body img').evaluate(n=>n.decode());await p.keyboard.press('Escape');
await p.locator('[data-layer="surface"]').click();assert((await p.locator('.gh-system-image img').getAttribute('src')).includes('street-football-3x3'));
await p.locator('[data-layer="structure"]').click();
if(width<760){await p.locator('.gh-menu').click();assert.equal(await p.locator('.gh-menu').getAttribute('aria-expanded'),'true');await p.locator('#gh-nav-links a[href="#boiska"]').click();assert.equal(await p.locator('.gh-menu').getAttribute('aria-expanded'),'false');}
assert.equal(await p.locator('[name="your-email"]').count(),1);assert.equal(await p.locator('[name="project-details"]').count(),1);
await p.goto(`http://localhost:${server.address().port}/?gf_product=octagon#kontakt`,{waitUntil:'networkidle'});
assert((await p.locator('[name="project-details"]').inputValue()).includes('Panna Octa'));
await p.locator('#gc-project-review summary').click();await p.locator('#gc-clear-project').click();assert.equal(await p.locator('[name="project-details"]').inputValue(),'');
await p.locator('[data-select-model="o1"]').click();await p.evaluate(()=>scrollTo(0,0));
await p.locator('.gh-hero-image').evaluate(n=>n.decode());
await p.screenshot({path:out+`/preview-${width}.png`,fullPage:true});
assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
report.cases.push({width,status:'passed',modelSelection:true,catalogue:8,materials:true,contactPreserved:true,projectRemoval:true});await p.close();}
assert.deepEqual(report.errors,[]);report.status='passed';console.log(JSON.stringify(report));
}catch(e){report.status='failed';report.error=String(e);throw e;}finally{await writeFile(out+'/verification.json',JSON.stringify(report,null,2));await browser?.close();await new Promise(r=>server?.close(r));}
