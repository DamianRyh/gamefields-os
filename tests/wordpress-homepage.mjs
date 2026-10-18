import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {chromium} from 'playwright';
const base=process.env.GF_WP_TEST_URL||'https://www.gamefields.eu/';
const bridge=process.env.GF_RENDER_BRIDGE_URL;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
await mkdir('outputs/www-wordpress',{recursive:true});
try{
 for(const width of [1440,768,390]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',async route=>{
   const req=route.request();
   // This is a read-only production UI test; never submit emails or mutate data.
   if(!['GET','HEAD'].includes(req.method()))return route.abort();
   if(!bridge)return route.continue();
   try{
    const response=await fetch(bridge+'?url='+encodeURIComponent(req.url())+(process.env.GF_WP_PREVIEW_AUTH==='1'?'&auth=1':''));
    if(!response.ok)return route.fulfill({status:response.status,body:''});
    const data=await response.json();await route.fulfill({status:data.status,headers:data.headers,body:Buffer.from(data.body,'base64')});
   }catch{await route.abort()}
  });
  await page.goto(base,{waitUntil:'load',timeout:90000});
  assert.equal(await page.locator('h1').innerText(),'Gra zmienia miejsce.');
  assert.equal(await page.locator('#gc-studio-frame').count(),1,'Existing Studio embedding is preserved');
  assert.equal(await page.locator('#gc-studio-frame').getAttribute('src'),'https://gamefields-studio.ryhfs90.chatgpt.site/?home=1');
  assert.equal(await page.locator('.gc-direction').count(),3);
  const message=page.locator('[name="your-message"]');await message.fill('Treść testu interfejsu — bez wysyłki.');
  const existingProject='Boisko: 20 × 12 m; nawierzchnia EPDM; wyposażenie: 2 bramki.';
  await page.locator('[name="project-details"]').evaluate((field,value)=>{field.value=value;field.dispatchEvent(new Event('input',{bubbles:true}))},existingProject);
  for(const name of ['Organic Flow','Urban Contrast','Classic Lines']){
   await page.getByRole('button',{name:'Zapytaj o '+name,exact:true}).click();
   assert.ok((await page.locator('[name="project-details"]').inputValue()).includes(name));
   const details=await page.locator('[name="project-details"]').inputValue();
   assert.ok(details.includes(existingProject),'Existing Studio parameters are preserved');
   assert.equal(details.split('Wstępny kierunek wizualny:').length,2,'Only one direction summary');
   assert.equal(await message.inputValue(),'Treść testu interfejsu — bez wysyłki.');
   assert.equal(await page.locator('[data-gf-inquiry][aria-pressed="true"]').count(),1);
   assert.equal(await page.evaluate(()=>document.activeElement===document.querySelector('[name="your-email"]')),true);
   assert.ok(await page.locator('#gc-attached').isVisible());
   assert.ok((await page.locator('#gc-attached').innerText()).includes(name));
  }
  await page.locator('[name="project-details"]').evaluate(field=>{field.value='Nowy projekt ze Studio';field.dispatchEvent(new Event('input',{bubbles:true}))});
  assert.equal(await page.locator('[data-gf-inquiry][aria-pressed="true"]').count(),0,'New Studio project clears stale gallery selection');
  assert.ok((await page.locator('#gc-attached').innerText()).includes('ze Studio'));
  const faq=page.locator('.gc-faq details').first();await faq.locator('summary').click();assert.ok(await faq.getAttribute('open')!==null);
  if(width<=900){const menu=page.getByRole('button',{name:'Menu',exact:true});await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'true');await page.locator('#gc-nav').getByRole('link',{name:'Kierunki',exact:true}).click();assert.equal(await menu.getAttribute('aria-expanded'),'false')}
  await page.locator('#kierunki').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>[...document.querySelectorAll('.gc-direction img')].every(image=>image.complete&&image.naturalWidth>0));
  await page.locator('.gc-direction img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  assert.ok(await page.locator('.gc-direction img').evaluateAll(images=>images.every(image=>getComputedStyle(image).opacity==='1'&&getComputedStyle(image).visibility==='visible')));
  const size=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));assert.ok(size.document<=width+1,JSON.stringify(size));
  if(process.env.GF_WP_PREVIEW_AUTH==='1')await page.addStyleTag({content:'#wpadminbar{display:none!important}html{margin-top:0!important}'});
  await page.locator('#kierunki').screenshot({path:`outputs/www-wordpress/directions-${width}.png`});
  assert.deepEqual(errors,[]);
  await page.close();
 }
 console.log('PASS: WordPress homepage at 1440/768/390px, three directions, real form prefill, message and Studio parameters preserved, focus, FAQ, mobile menu and no overflow. No form submitted.');
}finally{await browser.close()}
