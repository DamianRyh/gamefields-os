import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
const base=process.env.STUDIO_TEST_URL||'http://localhost:5173';
const executablePath=process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
const browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
const directions=[['Organic Flow','organic-flow'],['Urban Contrast','urban-contrast'],['Classic Lines','classic-lines']];
const quote={priceNet:50000,priceGross:61500,currency:'PLN'};
async function start(page,sport='Street Football 3×3'){
 await page.goto(base+'/studio');
 await page.locator('[data-studio-ready="true"]').waitFor();
 await page.getByRole('button').filter({has:page.getByRole('heading',{name:sport,exact:true})}).click();
}
async function visual(locator){
 return locator.evaluate(svg=>{
  const copy=svg.cloneNode(true);
  // The full plan adds dimension labels; miniature SVGs intentionally omit them.
  for(const g of copy.querySelectorAll(':scope > g[font-size="13"], .transform-ui'))g.remove();
  for(const node of copy.querySelectorAll('.editable-object.selected'))node.setAttribute('class','editable-object ');
  let markup=copy.innerHTML;
  [...copy.querySelectorAll('[id]')].forEach((node,i)=>{markup=markup.split(node.id).join(`stable-id-${i}`)});
  return markup;
 });
}
try{
 await mkdir('outputs/studio-review',{recursive:true});
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  let lastProject;
  await page.route('**/api/quote',r=>{lastProject=r.request().postDataJSON();return r.fulfill({json:quote})});
  for(const [sport,prefix] of [['Street Football 3×3',''],['Basketball 3×3','basketball-3x3-']]){
   await start(page,sport);
   await page.getByRole('button',{name:'Dalej: design'}).click();
   for(const [name,file] of directions){
    const card=page.locator('.direction-card').filter({hasText:name});
    await card.click();
    await page.getByRole('button',{name:'Inspiracja w otoczeniu'}).click();
    assert.equal(await page.locator('.realistic-stage img').getAttribute('src'),`/studio/${prefix}${file}-park.webp`);
    await page.getByRole('button',{name:'Plan projektu',exact:true}).click();
    assert.equal(await visual(card.locator('svg.court')),await visual(page.locator('.editing-area svg.court')),`${sport}: ${name} miniature must match selected plan`);
   }
  }
  // Unsupported sport must never inherit a football or basketball reference.
  await start(page,'Tennis');
  await page.getByRole('button',{name:'Dalej: design'}).click();
  await page.locator('.direction-card').first().click();
  assert.ok(await page.getByRole('button',{name:'Inspiracja w otoczeniu'}).isDisabled());
  assert.equal(await page.locator('.realistic-stage img').count(),0);
  await page.getByRole('button',{name:'Boisko',exact:true}).click();
  await page.getByRole('slider',{name:'Długość boiska'}).focus();await page.keyboard.press('ArrowRight');
  await page.getByRole('button',{name:'EPDM',exact:true}).click();
  await page.getByRole('button',{name:'Dalej: design'}).click();
  await page.getByRole('button',{name:'Dalej: wyposażenie'}).click();
  await page.locator('.equipmentgrid button').first().click();
  await page.waitForResponse(r=>r.url().endsWith('/api/quote')&&r.request().postDataJSON().surface==='EPDM');
  const before=structuredClone(lastProject);
  await page.getByRole('button',{name:'Porównaj kierunki',exact:true}).click();
  const dialog=page.getByRole('dialog');await dialog.waitFor();
  assert.equal(await dialog.locator('article').count(),3);
  const comparisonVisual=await visual(dialog.locator('article').nth(1).locator('svg.court'));
  const nextQuote=page.waitForResponse(r=>r.url().endsWith('/api/quote')&&r.request().postDataJSON().patternFamily==='geometric');
  await dialog.getByRole('button',{name:'Wybierz Urban Contrast'}).click();
  await nextQuote;
  for(const key of ['sport','length','width','surface','objects'])assert.deepEqual(lastProject[key],before[key],`Comparison preserves ${key}`);
  assert.equal(await visual(page.locator('.editing-area svg.court')),comparisonVisual,'Comparison matches applied project');
  if(await page.locator(".inspector-close").count())await page.locator(".inspector-close").click();
  await page.screenshot({path:`outputs/studio-review/design-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'Dalej: wyposażenie'}).click();
  await page.getByRole('button',{name:'Dalej: podsumowanie'}).click();
  await page.getByRole('button',{name:'Pobierz projekt',exact:true}).waitFor();
  assert.ok(!(await page.locator('.project-readiness').innerText()).includes('100%'));
  const size=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,viewport:innerWidth}));
  assert.ok(size.doc<=size.viewport+1,`Overflow at ${width}: ${JSON.stringify(size)}`);
  assert.deepEqual(errors,[]);
  await page.close();
 }
 console.log('PASS: Studio directions across football/basketball, tennis fallback, visual consistency, comparison preservation, four steps and responsive layout. Quote API mocked.');
}finally{await browser.close()}
