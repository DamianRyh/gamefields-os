import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {chromium} from 'playwright';
const base=process.env.STUDIO_TEST_URL||'http://localhost:5173';
const executablePath=process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
const browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
try{
 const page=await browser.newPage();
 const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve}};
 const a=deferred(),b=deferred(),aStarted=deferred(),bStarted=deferred(),aFinished=deferred();
 let mode='initial';
 let malformed;
 await page.route('**/api/quote',async route=>{
  const requestMode=mode;
  if(requestMode==='A'){aStarted.resolve();await a.promise}
  if(requestMode==='B'){bStarted.resolve();await b.promise}
  if(requestMode==='error')return route.fulfill({status:503,json:{error:'Unavailable'}});
  if(requestMode==='malformed')return route.fulfill({status:200,json:malformed});
  const priceNet=requestMode==='A'?11000:requestMode==='B'?22000:50000;
  // Aborted requests can already be gone when the delayed response is released.
  try{await route.fulfill({json:{priceNet,priceGross:priceNet*1.23,currency:'PLN'}})}catch(error){if(!/closed|aborted|invalid|already handled/i.test(error.message))throw error}finally{if(requestMode==='A')aFinished.resolve()}
 });
 await page.goto(base+'/studio');
 await page.locator('[data-studio-ready="true"]').waitFor();
 await page.getByRole('button').filter({has:page.getByRole('heading',{name:'Street Football 3×3',exact:true})}).click();
 const status=page.locator('.configuration-footer [role="status"]');
 await page.waitForFunction(()=>document.querySelector('.configuration-footer [role="status"] strong')?.textContent.includes('50'));
 const length=page.getByRole('slider',{name:'Długość boiska'});
 mode='A';await length.focus();await page.keyboard.press('ArrowRight');
 assert.match(await status.innerText(),/Obliczam/);
 await aStarted.promise;
 mode='B';await page.keyboard.press('ArrowRight');
 assert.match(await status.innerText(),/Obliczam/);
 await bStarted.promise;
 b.resolve();
 await page.waitForFunction(()=>document.querySelector('.configuration-footer [role="status"] strong')?.textContent.includes('22'));
 a.resolve();await aFinished.promise;
 // Let any late completion process before asserting the current value remains B.
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 assert.match(await status.innerText(),/22\s*000/);
 assert.doesNotMatch(await status.innerText(),/11\s*000|50\s*000/);
 mode='error';await page.keyboard.press('ArrowRight');
 assert.match(await status.innerText(),/Obliczam/);
 await page.waitForFunction(()=>document.querySelector('.configuration-footer [role="status"] strong')?.textContent==='Wymaga wyceny');
 assert.doesNotMatch(await status.innerText(),/22\s*000/);
 const retry=page.getByRole('button',{name:'Ponów wycenę',exact:true});
 await retry.waitFor();
 mode='initial';await retry.click();
 await page.waitForFunction(()=>document.querySelector('.configuration-footer [role="status"] strong')?.textContent.includes('50'));
 assert.match(await status.innerText(),/50\s*000/);
 assert.equal(await retry.count(),0,'Successful retry removes retry action');
 // Invalid HTTP-200 payloads must never become an apparently valid price.
 for(const invalid of [
  {priceNet:'50000',priceGross:61500,currency:'PLN'},
  {priceNet:-1,priceGross:61500,currency:'PLN'},
  {priceNet:50000,priceGross:0,currency:'PLN'},
  {priceNet:50000,priceGross:61500,currency:'EUR'},
  {priceNet:null,priceGross:61500,currency:'PLN'},
 ]){
  mode='malformed';malformed=invalid;
  await length.focus();await page.keyboard.press('ArrowRight');
  assert.match(await status.innerText(),/Obliczam/);
  await page.waitForFunction(()=>document.querySelector('.configuration-footer [role="status"] strong')?.textContent==='Wymaga wyceny');
  assert.doesNotMatch(await status.innerText(),/50\s*000|NaN|Infinity/);
  await retry.waitFor();
 }
 console.log('PASS: stale quote A→B, HTTP 503 fallback and successful retry, malformed HTTP 200 prices rejected. Quote API mocked.');
}finally{await browser.close()}
