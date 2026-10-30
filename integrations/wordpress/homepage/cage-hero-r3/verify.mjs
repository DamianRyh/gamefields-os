import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {chromium} from '/Users/mac/Documents/Gamefields/work/cage90-quality/node_modules/playwright/index.mjs';
const directory='/Users/mac/Documents/Gamefields/outputs/cage-hero-r3';
const preview=process.env.GF_CAGE_PREVIEW==='1';
const images=preview?Object.fromEntries([90,180].map((m,i)=>['circle-cage-'+(i+1),Object.fromEntries(['gray','red','blue','green'].map(c=>[c,'https://www.gamefields.eu/cage-hero-preview/cage-'+m+'-'+c+'.webp']))])):JSON.parse(await readFile(directory+'/wordpress-images.json','utf8'));
const runtime=(await readFile('/Users/mac/Documents/Gamefields/integrations/wordpress/homepage/cage-hero-r3/runtime.template.js','utf8')).replace('__CAGE_IMAGES__',JSON.stringify(images));
const marker="const studio=(arena=model,params={})=>'/konfigurator-boisk/?'+new URLSearchParams({arena,...params});";
new Function(runtime);const browser=await chromium.launch({headless:true});const report=[];
try{
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  if(preview){
   await page.route('https://www.gamefields.eu/cage-hero-preview/**',async route=>{const name=new URL(route.request().url()).pathname.split('/').pop();await route.fulfill({contentType:'image/webp',body:await readFile(directory+'/'+name)})});
   await page.route('https://www.gamefields.eu/?gf_cage_preview=1',async route=>{const response=await route.fetch();const html=await response.text();assert.equal(html.split(marker).length,2);await route.fulfill({response,body:html.replace(marker,runtime+'\n'+marker)})});
  }
  await page.goto('https://www.gamefields.eu/'+(preview?'?gf_cage_preview=1':''),{waitUntil:'domcontentloaded',timeout:60000});
  for(const [key,label]of [['circle-cage-1','Panna Cage 90'],['circle-cage-2','Panna Cage 180']]){
   await page.locator('[data-select-model="'+key+'"]').click();const stage=page.locator('.gh-model-stage [data-revision="CAGE-HERO-3"]');await stage.waitFor();
   const group=stage.getByRole('radiogroup',{name:'Kolor boiska '+label,exact:true});assert.equal(await group.getByRole('radio').count(),4);
   for(const [coat,name]of [['gray','Szary'],['red','Czerwony'],['blue','Niebieski'],['green','Zielony']]){
    await group.getByRole('radio',{name,exact:true}).click();await page.waitForFunction(({key,url})=>document.querySelector('.gh-model-stage [data-model-media="'+key+'"] img')?.src===url,{key,url:images[key][coat]});await stage.locator('img').evaluate(i=>i.decode());assert.equal(await group.getByRole('radio',{name,exact:true}).getAttribute('aria-checked'),'true');assert.equal(await stage.locator('img').evaluate(i=>i.naturalWidth),1920);
   }
   await group.getByRole('radio',{name:'Zielony',exact:true}).focus();await page.keyboard.press('ArrowLeft');await page.waitForFunction(({key,url})=>document.querySelector('.gh-model-stage [data-model-media="'+key+'"] img')?.src===url,{key,url:images[key].blue});assert.equal(await group.getByRole('radio',{name:'Niebieski',exact:true}).getAttribute('aria-checked'),'true');await group.getByRole('radio',{name:'Zielony',exact:true}).click();await page.waitForFunction(({key,url})=>document.querySelector('.gh-model-stage [data-model-media="'+key+'"] img')?.src===url,{key,url:images[key].green});
   assert.equal(await stage.getByRole('button',{name:'Zobacz kolor ↗',exact:true}).count(),0);
   await stage.locator('img').evaluate(async i=>{await i.decode();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))});await page.waitForTimeout(400);await stage.screenshot({path:directory+'/'+(preview?'preview':'live')+'-'+key+'-'+width+'.png'});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   report.push({width,key,fourColours:true,keyboard:true,fullHD:true});
  }
  await page.locator('[data-select-model="o1"]').click();await page.locator('.gh-model-stage').getByRole('radio',{name:'Zielony',exact:true}).waitFor();assert.equal(await page.locator('.gh-model-stage').getByRole('radio',{name:'Zielony',exact:true}).getAttribute('aria-checked'),'true');
  assert.deepEqual(errors,[]);await page.close();
 }
 await writeFile(directory+'/'+(preview?'preview':'live')+'-verification.json',JSON.stringify(report,null,2)+'\n');console.log('PASS Cage 90/180: 390/1440, 4 decoded Full HD colours, keyboard, retained colour, no horizontal overflow or JS errors.');
}finally{await browser.close()}
