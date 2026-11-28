const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1350}});
await p.goto('file://'+__dirname+'/slides.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1500);
const ids=await p.$$eval('section.a',s=>s.map(x=>x.id));require('fs').mkdirSync('slides',{recursive:true});
for(const id of ids){await p.locator('#'+id).screenshot({path:`slides/${id}.png`})}
const bad=await p.$$eval('img',im=>im.filter(i=>!i.naturalWidth).map(i=>i.src));console.log(ids.length,'bad imgs',bad);await b.close()})();
