const {chromium}=require('playwright');const fs=require('fs');
const jobs=[{id:'play-ndebele',q:'arena=o1&pattern=pro-ndebele&variant=3&palette=ndebele&panel=F4C430&frame=141414',style:'clean',caption:'Model tygodnia',price:40000},
 {id:'cage180-munich',q:'arena=circle-cage-2&pattern=pro-munich&variant=2&palette=aicher&panel=2E9C5E&frame=0F5B3A',style:'street',caption:'Dla klubów',price:58000}];
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const j of jobs){const ctx=await b.newContext({viewport:{width:1440,height:950}});const p=await ctx.newPage();
 await p.goto('http://127.0.0.1:5173/?'+j.q,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>document.querySelector('canvas[data-product-renderer="three-pbr"]')?.dataset.renderQuality==='settled',null,{timeout:120000}).catch(()=>{});await p.waitForTimeout(5000);
 const t0=Date.now();const d=await p.evaluate(async(j)=>{await Promise.all(['500','700','800','900'].map(w=>document.fonts.load(w+' 40px Inter')));
  const reg=await import('/lib/share-media/registry.ts'),media=await import('/lib/share-media/media.ts'),F=await import('/lib/share-media/facts.ts');
  const project=JSON.parse(localStorage.getItem('gamefields-studio-draft-v1'));const r=reg.shareRenderer();const imgs=media.stills(r);
  const blob=await media.film(r,{format:'story',style:j.style,background:'auto',facts:F.shareFacts(project,{price:j.price,caption:j.caption}),showPrice:false,surface:imgs.surface});
  return await new Promise(ok=>{const fr=new FileReader();fr.onload=()=>ok(fr.result);fr.readAsDataURL(blob)})},j);
 fs.writeFileSync(`raw/${j.id}-film.mp4`,Buffer.from(d.split(',')[1],'base64'));console.log(j.id,'film',((Date.now()-t0)/1000|0)+'s');await ctx.close()}
await b.close()})();
