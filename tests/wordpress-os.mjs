import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {chromium} from 'playwright';
const url=process.env.GF_OS_TEST_URL||'https://www.gamefields.eu/os/';
const bridge=process.env.GF_RENDER_BRIDGE_URL;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox','--enable-unsafe-swiftshader']});
await mkdir('outputs/os',{recursive:true});
try{for(const width of [1440,1024,390]){
 const page=await browser.newPage({viewport:{width,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{const request=route.request();if(!['GET','HEAD'].includes(request.method()))return route.abort();if(!process.env.GF_OS_IFRAMES&&['damianryh.github.io','gamefields-studio.ryhfs90.chatgpt.site'].includes(new URL(request.url()).hostname))return route.abort();if(!bridge)return route.continue();try{const r=await fetch(bridge+'?url='+encodeURIComponent(request.url())+(process.env.GF_WP_PREVIEW_AUTH==='1'?'&auth=1':''));const d=await r.json();await route.fulfill({status:d.status,headers:d.headers,body:Buffer.from(d.body,'base64')})}catch{await route.abort()}});
 await page.goto(url,{waitUntil:'load',timeout:90000});assert.equal(await page.locator('.os-tabs button').count(),8);
 for(const [key,part] of [['kids','view=panna-kids'],['w1','product=boisko-w1'],['models','view=source'],['parts','view=library'],['modular','view=viewer'],['objects','court-objects/index.html'],['studio','home=1'],['p1','product=boisko-p1']]){
  await page.locator(`[data-os="${key}"]`).click();const src=await page.locator('#gf-os-frame').getAttribute('src');assert.ok(src.includes(part),src);assert.equal(await page.locator('.os-tabs button[aria-pressed=true]').count(),1);assert.equal(await page.locator('#gf-os-open').getAttribute('href'),src);assert.ok((await page.locator('#gf-os-selection').innerText()).length>3);
 }
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 if(process.env.GF_OS_IFRAMES){for(const [key,file] of [['p1','boisko-p1.glb'],['kids','panna-kids.glb']]){await page.locator(`[data-os="${key}"]`).click();await page.locator('#gf-os-frame').scrollIntoViewIfNeeded();const handle=await page.locator('#gf-os-frame').elementHandle(),frame=await handle.contentFrame();await frame.waitForFunction(file=>{const d=document.querySelector('[data-testid="source-glb-viewer"]')?.dataset;return d?.loaded==='true'&&d.backgroundReady==='true'&&d.assetUrl.includes(file)},file,{timeout:90000});await frame.locator('[data-testid="source-glb-viewer"]').scrollIntoViewIfNeeded();await page.locator('#gf-os-frame').screenshot({path:`outputs/os/${key}-${width}.png`})}}
 await page.screenshot({path:`outputs/os/portal-${width}.png`});assert.deepEqual(errors,[]);await page.close();
}console.log('PASS: OS WordPress portal, eight modules, links, selection state and no overflow at 1440/1024/390px'+(process.env.GF_OS_IFRAMES?'; live P1 and Kids 3D with backgrounds.':'.')+' No form submitted.');}finally{await browser.close()}
