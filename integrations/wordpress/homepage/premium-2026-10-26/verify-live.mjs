import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire('/Users/mac/Documents/Gamefields/work/studio-street15/package.json');
const {chromium}=require('playwright');
const out='/Users/mac/Documents/Gamefields/outputs/homepage-surface-offers-2026-10-26';
const report={url:'https://www.gamefields.eu/',cases:[],errors:[]};const browser=await chromium.launch({headless:true});
try{for(const width of [390,1440]){
const p=await browser.newPage({viewport:{width,height:width===390?844:960}});p.on('pageerror',e=>report.errors.push(e.message));
await p.goto(report.url+'?gh_verify=20261026',{waitUntil:'domcontentloaded'});
await p.locator('.gf-premium').waitFor();await p.locator('.gh-hero-image').evaluate(n=>n.decode());await p.evaluate(()=>document.fonts.ready);
assert.equal(await p.locator('h1:visible').count(),1);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
assert.equal(await p.locator('.gf-premium iframe').count(),0);
await p.locator('[data-select-model="octagon"]').click();await p.locator('.gh-hero-image').evaluate(n=>n.decode());assert.equal(await p.locator('#gh-model-name').textContent(),'Panna Octa');
await p.locator('[data-open-3d]').click();const frame=p.locator('#gh-dialog iframe');await frame.waitFor();assert((await frame.getAttribute('src')).includes('arena=octagon'));await p.locator('[data-close-dialog]').click();assert.equal(await p.locator('#gh-dialog iframe').count(),0);
await p.locator('[data-catalog]').click();assert.equal(await p.locator('.gh-catalog article').count(),8);assert.deepEqual(await p.locator('.gh-catalog h3').allTextContents(),['Panna Play','Panna Court','Panna Cage 90','Panna Cage 180','Panna Octa','Panna Grid','Panna Ring','Street Arena 15']);await p.keyboard.press('Escape');
await p.locator('[data-select-model="o1"]').click();await p.locator('.gh-hero-image').evaluate(n=>n.decode());
assert.equal(await p.locator('[data-surface-offer]').count(),12);
const offer=p.locator('[data-surface-offer="city-fluid"]');await offer.scrollIntoViewIfNeeded();await p.mouse.move(0,0);assert.equal(await offer.locator('.gh-context-toggle').getAttribute('aria-pressed'),'false');await offer.locator('[data-toggle-context]').click();assert.equal(await offer.locator('[data-toggle-context]').getAttribute('aria-pressed'),'true');await offer.locator('[data-toggle-context]').click();assert.equal(await offer.locator('[data-toggle-context]').getAttribute('aria-pressed'),'false');assert((await offer.locator('a').getAttribute('href')).includes('surface=street-football-3x3'));if(width===1440){await offer.hover();await p.waitForTimeout(300);assert.equal(await offer.locator('.gh-surface-context').evaluate(n=>getComputedStyle(n).opacity),'1');}
assert.equal(await p.locator('[name="your-email"]').count(),1);
await p.evaluate(async()=>{for(const i of document.querySelectorAll('.gf-premium img')){i.loading='eager';await i.decode();if(!i.naturalWidth)throw Error('Missing image');}});
await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:out+`/live-${width}.png`,fullPage:true});
report.cases.push({width,status:'passed',images:true,lazy3D:true,selectedModel:true,catalogue:8,contact:true});await p.close();}
assert.deepEqual(report.errors,[]);report.status='passed';console.log(JSON.stringify(report));
}catch(e){report.status='failed';report.error=String(e);throw e;}finally{await writeFile(out+'/live-verification.json',JSON.stringify(report,null,2));await browser.close();}
