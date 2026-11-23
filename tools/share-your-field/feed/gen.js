const {chromium}=require('playwright');const fs=require('fs');
const cfgs=JSON.parse(fs.readFileSync('configs.json','utf8'));const only=process.argv[2];
const save=(n,d)=>fs.writeFileSync('raw/'+n,Buffer.from(d.split(',')[1],'base64'));
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const c of cfgs){if(only&&!only.split(',').includes(c.id))continue;const ctx=await b.newContext({viewport:{width:1440,height:950}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:5173/?'+c.q,{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>{const cv=document.querySelector('canvas[data-product-renderer="three-pbr"]');return cv&&cv.dataset.renderQuality==='settled'},null,{timeout:120000}).catch(()=>console.log('no settle',c.id));
 await p.waitForTimeout(5000);
 const out=await p.evaluate(async(c)=>{await Promise.all(['500','700','800','900'].map(w=>document.fonts.load(w+' 40px Inter')));
  const reg=await import('/lib/share-media/registry.ts'),media=await import('/lib/share-media/media.ts'),C=await import('/lib/share-media/compose.ts'),F=await import('/lib/share-media/facts.ts');
  const project=JSON.parse(localStorage.getItem('gamefields-studio-draft-v1'));const r=reg.shareRenderer();if(!r)return {err:'no renderer'};
  const imgs=media.stills(r);const url=x=>{const cv=document.createElement('canvas');cv.width=x.width;cv.height=x.height;cv.getContext('2d').drawImage(x,0,0);return cv.toDataURL('image/png')};
  const res={facts:F.shareFacts(project,{price:c.price}),hero:url(imgs.hero),low:url(imgs.low),top:url(imgs.top),surface:imgs.surface?url(imgs.surface):null,posts:{}};
  for(const po of c.posts){const cv=document.createElement('canvas');const facts=F.shareFacts(project,{price:c.price,caption:po.caption});C.compose(cv,{format:po.format,style:po.style,background:po.bg,facts,images:imgs,showPrice:po.showPrice});res.posts[po.name]=cv.toDataURL('image/png')}
  return res},c);
 if(out.err){console.log(c.id,out.err);continue}
 for(const k of ['hero','low','top','surface'])if(out[k])save(`${c.id}-${k}.png`,out[k]);for(const [k,v] of Object.entries(out.posts))save(`${c.id}-post-${k}.png`,v);
 fs.writeFileSync(`raw/${c.id}-facts.json`,JSON.stringify(out.facts,null,1));console.log(c.id,'ok',out.facts.name,out.facts.field,out.facts.pattern,errs.slice(0,2));await ctx.close()}
await b.close()})();
