import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import ts from 'typescript';
import {chromium} from 'playwright';
const models=['w1','o1','p1','circle-cage-1','circle-cage-2','street15','street-field','octagon'];
const jsonModels={};for(const model of models.filter(m=>m!=='w1'))jsonModels[model]=JSON.parse(await readFile(['o1','p1'].includes(model)?`components/assets-blender/${model}.json`:`public/arenas/${model}.json`,'utf8')).filter(m=>m.group==='panels').map(({id,group,v})=>({id,group,v}));
const helper=ts.transpileModule(await readFile('lib/panel-artwork.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const glbReader=ts.transpileModule(await readFile('components/glb-arena.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const glb=await readFile('public/arenas/boisko-w1.glb');
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});const page=await browser.newPage();
 await page.route('http://panel-artwork.test/**',async route=>{if(new URL(route.request().url()).pathname==='/w1.glb')await route.fulfill({body:glb,contentType:'model/gltf-binary'});else await route.fulfill({body:'<!doctype html><html><body>Isolated panel artwork equivalence</body></html>',contentType:'text/html'});});
 await page.goto('http://panel-artwork.test/');
 await page.addScriptTag({content:`(()=>{const exports={};${helper};window.panelArtworkApi=exports;})();(()=>{const exports={};${glbReader};window.glbReaderApi=exports;})();`});
 const result=await page.evaluate(async jsonModels=>{
  function check(ok,message){if(!ok)throw Error(message)}
  // Frozen pre-optimization raster algorithm, including its original angular formula.
  function projectRadius(m){return Math.max(...m.v.map(p=>Math.hypot(p[0],p[2])))}
  async function original(design,m){const angles=m.v.map(p=>Math.atan2(p[0],p[2])),center=Math.atan2(angles.reduce((s,a)=>s+Math.sin(a),0),angles.reduce((s,a)=>s+Math.cos(a),0)),unwrapped=angles.map(a=>center+(a-center+Math.PI)%(Math.PI*2)-Math.PI),height=Math.max(...m.v.map(p=>p[1]))-Math.min(...m.v.map(p=>p[1])),aspect=(projectRadius(m))*(Math.max(...unwrapped)-Math.min(...unwrapped))/height;const c=document.createElement('canvas');c.width=Math.max(64,Math.min(2048,Math.round(768*aspect)));c.height=768;const ctx=c.getContext('2d');ctx.fillStyle=design.panelColor;ctx.fillRect(0,0,c.width,c.height);if(design.src){const img=new Image();await new Promise((ok,no)=>{img.onload=()=>ok();img.onerror=no;img.src=design.src});const scale=Math.min(c.width*.8/img.width,c.height*.5/img.height);ctx.drawImage(img,(c.width-img.width*scale)/2,(c.height-img.height*scale)/2,img.width*scale,img.height*scale)}if(design.text){ctx.fillStyle='white';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`bold ${Math.min(100,c.width*.15)}px Arial`;ctx.fillText(design.text,c.width/2,c.height*(design.src?.78:.5),c.width*.88)}return c.toDataURL('image/png')}
  const meshWidth=m=>{const angles=m.v.map(p=>Math.atan2(p[0],p[2])),center=Math.atan2(angles.reduce((s,a)=>s+Math.sin(a),0),angles.reduce((s,a)=>s+Math.cos(a),0)),u=angles.map(a=>center+(a-center+Math.PI)%(Math.PI*2)-Math.PI),h=Math.max(...m.v.map(p=>p[1]))-Math.min(...m.v.map(p=>p[1]));return Math.max(64,Math.min(2048,Math.round(768*(projectRadius(m)*(Math.max(...u)-Math.min(...u))/h))))};
  const models={...jsonModels,w1:await window.glbReaderApi.loadArenaGlb('/w1.glb')};
  const coverage={},representatives=new Map();for(const[model,meshes]of Object.entries(models)){const panels=meshes.filter(m=>m.group==='panels');check(panels.length>0,`No panels ${model}`);const widths=[...new Set(panels.map(meshWidth))].sort((a,b)=>a-b);coverage[model]={panels:panels.length,widths};for(const m of panels)if(!representatives.has(meshWidth(m)))representatives.set(meshWidth(m),m);}
  const logoCanvas=document.createElement('canvas');logoCanvas.width=73;logoCanvas.height=39;const l=logoCanvas.getContext('2d');l.fillStyle='#fa923a';l.fillRect(0,0,73,39);l.fillStyle='#123456';l.fillRect(7,3,21,29);const logo=logoCanvas.toDataURL('image/png');
  const base={panelColor:'#17654f',frameColor:'#30363c',goalColor:'#30363c',finish:'matte',text:'',side:'both'};
  const fixtures=[{name:'empty',design:base},{name:'text',design:{...base,text:'PERF QA — Łódź 123'}},{name:'logo',design:{...base,src:logo}},{name:'both',design:{...base,text:'PERF QA — Łódź 123',src:logo}}];
  async function pixels(url){const img=new Image();await new Promise((ok,no)=>{img.onload=ok;img.onerror=no;img.src=url});const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);return {width:c.width,height:c.height,data:ctx.getImageData(0,0,c.width,c.height).data};}
  const generationByFixture=new Map(fixtures.map(f=>[f.name,window.panelArtworkApi.createPanelArtwork()]));
  let pixelComparisons=0;for(const[width,m]of representatives)for(const f of fixtures){const expected=await pixels(await original(f.design,m)),actual=await pixels(await generationByFixture.get(f.name)(f.design,m));check(expected.width===actual.width&&expected.height===actual.height,`Dimensions ${width}/${f.name}`);check(expected.data.length===actual.data.length&&expected.data.every((v,i)=>v===actual.data[i]),`Pixel mismatch ${width}/${f.name}`);pixelComparisons++;}
  const originalEncode=HTMLCanvasElement.prototype.toDataURL;let encodes=0;HTMLCanvasElement.prototype.toDataURL=function(...args){encodes++;return originalEncode.apply(this,args)};
  try{
   const panels=models['circle-cage-2'].filter(m=>m.group==='panels'),make=window.panelArtworkApi.createPanelArtwork(),design=fixtures.at(-1).design;
   const concurrent=panels.map(m=>make(design,m));check(concurrent.every(p=>p===concurrent[0]),'Concurrent identical recipes must share the exact promise');await Promise.all(concurrent);check(encodes===1,'Circle cage must encode once per generation');
   const first=concurrent[0];check(make({...design,frameColor:'#ffffff',goalColor:'#888888',finish:'metal',side:'inner'},panels[0])===first,'Irrelevant fields changed cache recipe');
   for(const patch of [{text:'Changed text'},{panelColor:'#205967'},{src:undefined}]){const p=make({...design,...patch},panels[0]);check(p!==first,'Changed raster content reused old promise');await p;}check(encodes===4,'Content invalidation count');
   const secondGeneration=window.panelArtworkApi.createPanelArtwork();check(secondGeneration(design,panels[0])!==first,'Cache must not cross generations');await secondGeneration(design,panels[0]);
   const retry=window.panelArtworkApi.createPanelArtwork(),bad={...base,src:'data:image/png;base64,broken'};let failures=0;let a=retry(bad,panels[0]);try{await a}catch{failures++}let b=retry(bad,panels[0]);check(a!==b,'Rejected promise remained cached');try{await b}catch{failures++}check(failures===2,'Retry fixture must reject twice');
   const recover=window.panelArtworkApi.createPanelArtwork();let failOnce=true;HTMLCanvasElement.prototype.toDataURL=function(...args){if(failOnce){failOnce=false;throw Error('One-shot encode failure')}return originalEncode.apply(this,args)};try{await recover(base,panels[0]);throw Error('Expected encoder failure')}catch(e){check(e.message==='One-shot encode failure','Wrong failure')};check((await recover(base,panels[0])).startsWith('data:image/png;base64,'),'Same-key retry did not recover');
   return {coverage,uniqueWidths:[...representatives.keys()].sort((a,b)=>a-b),fixtures:fixtures.map(f=>f.name),pixelComparisons,concurrentPanels:panels.length,concurrentEncodes:1,retryPassed:true};
  }finally{HTMLCanvasElement.prototype.toDataURL=originalEncode;}
 },jsonModels);
 assert.equal(result.retryPassed,true);await mkdir('outputs/panel-artwork',{recursive:true});await writeFile('outputs/panel-artwork/equivalence.json',JSON.stringify({status:'passed',browser:browser.version(),...result},null,2)+'\n');console.log('PASS panel artwork equivalence',JSON.stringify(result));
}finally{await browser?.close();}
