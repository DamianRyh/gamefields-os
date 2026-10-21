import assert from 'node:assert/strict';
import {readFile,readdir,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve,extname} from 'node:path';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=await import(wranglerRequire.resolve('miniflare'));
const files=(await readdir('dist/server',{recursive:true})).filter(f=>/\.m?js$/.test(f));
const mf=new Miniflare({modules:['index.js',...files.filter(f=>f!=='index.js')].map(f=>({type:'ESModule',path:resolve('dist/server',f)})),modulesRoot:resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB']});
let browser,server;
try{
 const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
 server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,file=resolve('dist/client','.'+path),root=resolve('dist/client')+'/';if(file.startsWith(root)&&!path.startsWith('/api/')){try{const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(bytes);return;}catch{}}
 const chunks=[];for await(const c of req)chunks.push(c);const response=await mf.dispatchFetch(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});res.statusCode=response.status;for(const [k,v]of response.headers)if(k!=='set-cookie')res.setHeader(k,v);const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.statusCode=500;res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`;
 browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader"],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});

 await mkdir('outputs/studio-surface-readability',{recursive:true});
 const errors=[],evidence=[];
 const expected={patternVariant:11,patternDensity:110,graphicOpacity:80,shadowIntensity:45,shadowEnabled:true,graphicRotation:30};
 const svg=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="15" fill="#6336f5"/></svg>');
 for(const viewport of [{width:375,height:1000},{width:390,height:1000},{width:430,height:1000},{width:810,height:1000},{width:1024,height:1000},{width:1440,height:1000},{width:844,height:390}]){
  const key=`${viewport.width}x${viewport.height}`,page=await browser.newPage({viewport});
  page.on('pageerror',e=>errors.push(`${key}: ${e.message}`));
  await page.goto(base+'/?arena=octagon');
  const ready=()=>page.locator('.panna-studio-model[data-ready="true"]').waitFor({timeout:45000});
  await ready();
  const panel=page.locator('#studio-edit-panel');
  const surface=page.getByRole('navigation',{name:'Narzędzia edycji'}).getByRole('button',{name:'Nawierzchnia',exact:true});
  await surface.click();
  await panel.getByRole('heading',{name:'Nawierzchnia',exact:true}).waitFor();
  const advanced=panel.locator('.studio-advanced-section');
  await advanced.waitFor();
  if(!await advanced.evaluate(el=>el.open))await advanced.locator('summary').click();
  // A locator can be visible while another sticky layer intercepts interaction.
  const reachable=async(locator,label,{font=14,input=false}={})=>{
   await locator.scrollIntoViewIfNeeded();
   await locator.waitFor({state:'visible'});
   const result=await locator.evaluate(el=>{
    const r=el.getBoundingClientRect(),style=getComputedStyle(el),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    return {hit:hit?.outerHTML.slice(0,240),top:r.top,bottom:r.bottom,width:r.width,height:r.height,font:parseFloat(style.fontSize),covered:!hit||!(el===hit||el.contains(hit)),inside:r.left>=-.5&&r.right<=innerWidth+.5&&r.top>=-.5&&r.bottom<=innerHeight+.5};
   });
   assert.ok(result.inside,`${key}: ${label} remains inside viewport after scroll`);
   if(result.covered){console.log(JSON.stringify({key,label,result}));await page.screenshot({path:`outputs/studio-surface-readability/failure-${key}.png`});}assert.equal(result.covered,false,`${key}: ${label} is not covered`);
   assert.ok(result.width>=43.9&&result.height>=43.9,`${key}: ${label} requires 44px target (${result.width}x${result.height})`);
   assert.ok(result.font>=(input?16:font)-.01,`${key}: ${label} font ${result.font}px`);
   return result;
  };
  await reachable(advanced.locator('summary'),'advanced section');
  const variant=advanced.getByRole('button',{name:'Wariant 11',exact:true});
  await reachable(variant,'composition variant');await variant.click();
  assert.equal(await variant.getAttribute('aria-pressed'),'true');
  const measurements={};
  for(const [label,value] of [['Skala wzoru',110],['Intensywność wzoru',80],['Cień i głębia',45],['Obrót grafiki',30]]){
   const slider=advanced.getByRole('slider',{name:label,exact:true});
   measurements[label]=await reachable(slider,label,{input:true});
   const text=await slider.locator('..').locator('span').first().evaluate(el=>({font:parseFloat(getComputedStyle(el).fontSize),line:parseFloat(getComputedStyle(el).lineHeight)}));
   assert.ok(text.font>=14,`${key}: ${label} label at least14px`);
   assert.ok(text.line>=text.font*1.3,`${key}: ${label} has legible line height`);
   await slider.focus();await page.keyboard.press('Home');
   const min=Number(await slider.getAttribute('min')),step=Number(await slider.getAttribute('step'))||1;
   for(let n=min;n<value;n+=step)await page.keyboard.press('ArrowRight');
   assert.equal(Number(await slider.inputValue()),value,`${key}: keyboard sets ${label}`);
  }
  const logo=advanced.getByRole('button',{name:'Dodaj własne logo',exact:true});
  await reachable(logo,'upload logo');
  await reachable(advanced.getByRole('button',{name:'Dodaj tekst',exact:true}),'add text');
  await page.screenshot({path:`outputs/studio-surface-readability/controls-${key}.png`});
  const chooser=page.waitForEvent('filechooser');await logo.click();
  await(await chooser).setFiles({name:'surface-audit.svg',mimeType:'image/svg+xml',buffer:svg});
  await panel.getByRole('heading',{name:'surface-audit.svg',exact:true}).waitFor();
  const exported=async()=>{
   const download=page.waitForEvent('download');
   await page.getByRole('button',{name:'Pobierz projekt',exact:true}).first().click();
   return JSON.parse(await readFile(await(await download).path(),'utf8'));
  };
  const assertState=project=>{
   for(const [field,value]of Object.entries(expected))assert.equal(project[field],value,`${key}: ${field} persists`);
   const image=project.objects.find(o=>o.name==='surface-audit.svg');
   assert.ok(image,`${key}: logo in exported project`);assert.equal(image.kind,'image');assert.equal(image.target,'court');
   assert.equal(image.src,'data:image/svg+xml;base64,'+svg.toString('base64'));
  };
  const project=await exported();assertState(project);
  await page.getByRole('button',{name:'Pliki projektu',exact:true}).click();
  await page.locator('input[type=file][accept*="application/json"]').setInputFiles({name:'surface-roundtrip.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(project))});
  for(const view of ['Boczny','Z góry','Z boiska']){
   const camera=page.getByRole('button',{name:view,exact:true});
   await reachable(camera,view);await camera.click();await ready();
   assertState(await exported());
  }
  await surface.click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${key}: no horizontal overflow`);
  evidence.push({viewport,measurements,result:'PASS'});
  await page.close();
 }
 assert.deepEqual(errors,[]);
 const {writeFile}=await import('node:fs/promises');
 await writeFile('outputs/studio-surface-readability/results.json',JSON.stringify(evidence,null,2));
 console.log('PASS: Surface controls and safe SVG logo reachable without Graphics at seven viewport sizes; keyboard settings persist through JSON import/export and three cameras; 44px hit targets,16px inputs,14px labels, no horizontal overflow or runtime errors.');
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r));await mf.dispose();}

