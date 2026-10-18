import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
const products=JSON.parse(await readFile('integrations/wordpress/products/products.json','utf8'));
const stage=process.env.GF_PRODUCT_STAGE?JSON.parse(await readFile(process.env.GF_PRODUCT_STAGE,'utf8')):[];
const bridge=process.env.GF_RENDER_BRIDGE_URL;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
await mkdir('outputs/www-wordpress',{recursive:true});
try{
 for(const width of [1440,1024,768,390]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async route=>{
   const req=route.request();if(!['GET','HEAD'].includes(req.method()))return route.abort();
   // These checks cover WordPress product and inquiry UI. Studio has its own acceptance tests.
   if(new URL(req.url()).hostname==='gamefields-studio.ryhfs90.chatgpt.site')return route.abort();
   let url=new URL(req.url());
   const match=stage.find(p=>new URL(p.url).origin===url.origin&&(p.id===3462?url.pathname==='/':url.pathname==='/'+(p.id===3465?'boiska-street-football':products.find(x=>x.id===p.id)?.slug)+'/'));
   if(match){const target=new URL(match.url);url.searchParams.forEach((v,k)=>target.searchParams.set(k,v));url=target;}
   if(!bridge)return route.continue({url:url.href});
   try{const r=await fetch(bridge+'?url='+encodeURIComponent(url.href)+(stage.length?'&auth=1':''));const d=await r.json();await route.fulfill({status:d.status,headers:d.headers,body:Buffer.from(d.body,'base64')})}catch{await route.abort()}
  });
  const noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No page overflow');
  await page.goto('https://www.gamefields.eu/boiska-street-football/',{waitUntil:'load',timeout:90000});
  assert.equal(await page.locator('.card[data-shape]').count(),7);assert.equal(await page.locator('.card img[alt]').count(),7);assert.equal(await page.locator('.gfcatalog .hero').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(243, 230, 138)');assert.equal(await page.locator('h1').evaluate(el=>getComputedStyle(el).textTransform),'none');
  for(const [label,count] of [['Okrąg',4],['Prostokąt',2],['Oktagon',1],['Wszystkie',7]]){
   await page.getByRole('button',{name:label,exact:true}).click();
   assert.equal(await page.locator('.card[data-shape]:visible').count(),count);
   assert.equal(await page.locator('[data-shape-filter][aria-pressed="true"]').count(),1);
   assert.ok((await page.locator('#gf-filter-status').innerText()).startsWith(String(count)));
  }
  assert.equal(await page.locator('tbody tr').count(),7);assert.equal(await page.locator('.gf-product-footer a[href="/boiska-street-football/#porownanie"]').count(),1);await noOverflow();
  await page.locator('.card').first().scrollIntoViewIfNeeded();await page.locator('.card img').first().evaluate(img=>img.decode());
  await page.screenshot({path:`outputs/www-wordpress/catalog-${width}.png`});await page.locator('#porownanie').screenshot({path:`outputs/www-wordpress/product-comparison-${width}.png`});
  for(const product of products){
   await page.goto('https://www.gamefields.eu/'+product.slug+'/',{waitUntil:'load',timeout:90000});
   assert.equal(await page.locator('h1').textContent(),product.name);
   await page.locator('.photo img').evaluate(img=>img.decode());assert.equal(await page.locator('.photo img').evaluate(img=>getComputedStyle(img).objectFit),'contain');assert.ok((await page.locator('.photo img').getAttribute('alt')).includes(product.name));assert.equal(await page.locator('.gf-breadcrumb [aria-current="page"]').textContent(),product.name);const cta=page.locator('.copy .btn');assert.equal(await cta.getAttribute('href'),'/?gf_product='+product.slug+'#kontakt');
   assert.equal(await page.locator('a[href="/#builder"]').count(),0);assert.equal(await page.locator('.gf-product-footer a[href="/polityka-prywatnosci/"]').count(),1);
   await noOverflow();if(width<=900){const nav=await page.locator('.nav').boundingBox(),bar=await page.locator('.bar').boundingBox();assert.ok(nav.y+nav.height<=bar.y+bar.height+1,'Mobile navigation stays inside its background: '+product.slug+' at '+width)}
   if(product.id===3473)await page.screenshot({path:`outputs/www-wordpress/product-${width}.png`});
  }
  // Follow a real CTA; mapping to a draft (when supplied) retains the browser URL contract.
  await page.locator('.copy .btn').click();await page.waitForSelector('[name="project-details"]',{state:'attached',timeout:90000});
  const details=page.locator('[name="project-details"]');assert.ok((await details.inputValue()).includes(products.at(-1).name));
  assert.ok(await page.locator('#gc-attached').isVisible());
  assert.equal(await page.evaluate(()=>document.activeElement?.name),'your-email');assert.ok((await page.locator('#gc-project-text').textContent()).includes(products.at(-1).name));
  const message=page.locator('[name="your-message"]');await message.fill('Moja wiadomość — bez wysyłki.');
  await page.getByRole('button',{name:'Zapytaj o Organic Flow',exact:true}).click();
  assert.ok((await details.inputValue()).includes(products.at(-1).name));assert.ok((await details.inputValue()).includes('Organic Flow'));assert.ok((await page.locator('#gc-attached').innerText()).includes(products.at(-1).name));
  await page.getByRole('button',{name:'Zapytaj o Classic Lines',exact:true}).click();
  assert.ok((await details.inputValue()).includes(products.at(-1).name));assert.ok(!(await details.inputValue()).includes('Organic Flow'));
  assert.equal(await message.inputValue(),'Moja wiadomość — bez wysyłki.');await noOverflow();
  await page.locator('#kontakt').screenshot({path:`outputs/www-wordpress/product-inquiry-${width}.png`});
  await details.evaluate(field=>{field.value='Nowy projekt ze Studio';field.dispatchEvent(new Event('input',{bubbles:true}))});assert.equal(await page.locator('#gf-culture').getAttribute('data-gf-product-name'),null);await page.getByRole('button',{name:'Zapytaj o Organic Flow',exact:true}).click();assert.ok(!(await details.inputValue()).includes(products.at(-1).name));assert.ok(!(await page.locator('#gc-attached').innerText()).includes(products.at(-1).name));await page.locator('#gc-project-review summary').click();await page.getByRole('button',{name:'Usuń dołączone parametry',exact:true}).click();assert.equal(await details.inputValue(),'');assert.equal(new URL(page.url()).searchParams.get('gf_product'),null);assert.equal(await message.inputValue(),'Moja wiadomość — bez wysyłki.');assert.deepEqual(errors,[]);await page.close();
 }
 // Every allowlisted model and an unknown query value; no arbitrary input accepted.
 const page=await browser.newPage();
 await page.route('**/*',async route=>{const u=new URL(route.request().url());if(!['GET','HEAD'].includes(route.request().method())||u.hostname==='gamefields-studio.ryhfs90.chatgpt.site')return route.abort();if(u.hostname==='www.gamefields.eu'&&u.pathname==='/'&&stage.length){u.searchParams.set('page_id',String(stage.find(p=>p.id===3462).draft));u.searchParams.set('preview','true')}
 if(!bridge)return route.continue({url:u.href});try{const r=await fetch(bridge+'?url='+encodeURIComponent(u.href)+(stage.length?'&auth=1':''));const d=await r.json();await route.fulfill({status:d.status,headers:d.headers,body:Buffer.from(d.body,'base64')})}catch{await route.abort()}});
 for(const p of [...products,{slug:'unknown<script>',name:null}]){await page.goto('https://www.gamefields.eu/?gf_product='+encodeURIComponent(p.slug)+'#kontakt',{waitUntil:'load',timeout:90000});const value=await page.locator('[name="project-details"]').inputValue();assert.ok(p.name?value.includes(p.name):!value.includes('Wybrany model:'))}
 await page.close();console.log('PASS: 7 product cards, 4 shape filters, comparison table, model inquiry, direction/message retention and unknown query at 1440/1024/768/390px. No form submitted.');
}finally{await browser.close()}
