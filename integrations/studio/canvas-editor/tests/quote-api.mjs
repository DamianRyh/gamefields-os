import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=await import(wranglerRequire.resolve('miniflare'));
const files=(await readdir('dist/server',{recursive:true})).filter(f=>/\.m?js$/.test(f));
const card={version:'TEST-NOT-FOR-SALE',currency:'PLN',vatRate:.23,surfaces:{EPDM:{materialNetPerM2:100,installationNetPerM2:20}},patternNetPerM2:{1:10,2:20,3:30,4:40},linesNet:200,brandingNetPerItem:50,equipmentNet:{Bramka:1000},arenaNet:{},designNet:300,transportNet:400};
const fixture={id:'test',name:'Test',type:'Nowe boisko',sport:'Piłka nożna 3×3',length:15,width:10,surface:'EPDM',base:'#000000',zone:'#111111',outside:'#222222',lineColor:'#ffffff',lines:false,pattern:'Organic Flow',patternFamily:'organic-flow',patternVariant:1,graphicOpacity:100,graphicScale:100,graphicRotation:0,scene:'day',objects:[],status:'Szkic',date:''};
for(const config of [undefined,JSON.stringify(card),'INVALID']){
 const mf=new Miniflare({modules:['index.js',...files.filter(f=>f!=='index.js')].map(f=>({type:'ESModule',path:resolve('dist/server',f)})),modulesRoot:resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],bindings:config?{QUOTE_RATE_CARD:config}:{},d1Databases:['DB']});
 try{
  const post=(body)=>mf.dispatchFetch('http://localhost/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:typeof body==='string'?body:JSON.stringify(body)});
  let r=await post(fixture);assert.equal(r.headers.get('cache-control'),'no-store');
  if(config==='INVALID'){assert.equal(r.status,503);continue;}
  assert.equal(r.status,200);const data=await r.json();assert.equal(data.schemaVersion,2);assert.equal(data.status,config?'estimated':'unpriced');assert.equal(data.area,150);assert.equal(config?data.priceGross:data.priceNet,config?28536:null);
  r=await post({...fixture,width:20});const wider=await r.json();assert.equal(wider.area,300);if(config)assert(wider.priceNet>data.priceNet);
  assert.equal((await post('{bad')).status,400);assert.equal((await post({...fixture,length:-1})).status,400);assert.equal((await post({...fixture,patternFamily:'unknown'})).status,400);assert.equal((await post(' '.repeat(256001))).status,413);
 }finally{await mf.dispose();}
}
console.log('PASS: built Worker API contract; valid, missing and malformed rate configuration; recalculation; no-store; invalid/oversized requests. Test rates only.');
