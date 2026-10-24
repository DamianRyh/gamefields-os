import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=await import(wranglerRequire.resolve('miniflare'));
const files=(await readdir('dist/server',{recursive:true})).filter(f=>/\.m?js$/.test(f));
const card={version:'CONFIDENTIAL_TEST_COST',currency:'PLN',notice:'CONFIDENTIAL_TEST_NOTICE',exclusions:['CONFIDENTIAL_TEST_EXCLUSION'],surfaces:{EPDM:{materialNetPerM2:80,installationNetPerM2:40}},patternNetPerM2:{3:8},linesNet:40,brandingNetPerItem:20,equipmentNet:{},arenaNet:{octagon:800},arenaInstallationNet:{octagon:80},designNet:80,transportNet:40};
const fixture={id:'test',name:'Test',sport:'Piłka nożna 3×3',length:15,width:10,surface:'EPDM',base:'#000000',zone:'#111111',outside:'#222222',lineColor:'#ffffff',lines:false,pattern:'Organic Flow',patternFamily:'organic-flow',patternVariant:1,graphicOpacity:0,graphicScale:100,graphicRotation:0,scene:'day',objects:[]};
for(const config of ['missing','valid','bad-card','bad-margin','missing-margin','legacy-only']){
 const bindings=config==='legacy-only'?{QUOTE_RATE_CARD:JSON.stringify(card)}:config==='missing'?{}:{INTERNAL_COST_CARD:config==='bad-card'?'INVALID':JSON.stringify(card),...(config==='missing-margin'?{}:{SALES_MARGIN:config==='bad-margin'?'1':'0.20'})};
 const mf=new Miniflare({modules:['index.js',...files.filter(f=>f!=='index.js')].map(f=>({type:'ESModule',path:resolve('dist/server',f)})),modulesRoot:resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],bindings,d1Databases:['DB']});
 try{
 const post=body=>mf.dispatchFetch('http://localhost/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:typeof body==='string'?body:JSON.stringify(body)});
 const r=await post(fixture);assert.equal(r.headers.get('cache-control'),'no-store');const raw=await r.text();assert(!raw.includes('CONFIDENTIAL_TEST'));assert(!raw.includes('INTERNAL_COST_CARD'));assert(!raw.includes('SALES_MARGIN'));assert(!raw.includes('"margin"'));
 if(['bad-card','bad-margin','missing-margin'].includes(config)){assert.equal(r.status,503);continue;}
 assert.equal(r.status,200);const q=JSON.parse(raw);if(config==='valid'){assert.equal(q.priceNet,22650);assert.equal(q.constructionPrices.octagon,1000);assert.equal(q.priceGross,null);assert.equal(q.rateVersion,'GF-SALES-2026-10-23-v1');}else{assert.equal(q.status,'unpriced');assert.equal(q.priceNet,null);assert(!q.constructionPrices);}
 for(const [body,status] of [['{bad',400],[{...fixture,length:-1},400],[{...fixture,patternFamily:'unknown'},400],[' '.repeat(256001),413]])assert.equal((await post(body)).status,status);
 }finally{await mf.dispose();}
}
console.log('PASS: built Worker hides confidential cost metadata, returns sales-only amounts, ignores legacy public card, fails closed on invalid margin/card, no-store and input guards.');
