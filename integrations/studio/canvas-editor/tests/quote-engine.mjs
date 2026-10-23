import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {calculateProjectQuote,parseRateCard,arenaSurfaceQuantities} from '../lib/quote-engine.ts';
// Deliberately artificial fixture prices, not a commercial Gamefields rate card.
const card=parseRateCard(JSON.stringify({version:'TEST-NOT-FOR-SALE',currency:'PLN',vatRate:.23,surfaces:{EPDM:{materialNetPerM2:100,installationNetPerM2:20}},patternNetPerM2:{1:10,2:20,3:30,4:40},linesNet:200,brandingNetPerItem:50,arenaNet:{octagon:10000},arenaInstallationNet:{octagon:500},equipmentNet:{Bramka:1000,Ławka:200},designNet:300,transportNet:400}));
const p={length:15,width:10,surface:'EPDM',lines:false,graphicOpacity:100,objects:[]};
let q=calculateProjectQuote(p,card,1);
assert.equal(q.priceNet,20200);assert.equal(q.priceGross,24846);assert.equal(q.status,'estimated');
assert.equal(calculateProjectQuote({...p,width:20},card,1).priceNet,39700);
assert.equal(calculateProjectQuote({...p,lines:true},card,1).priceNet,20400);
assert.equal(calculateProjectQuote(p,card,4).priceNet,24700);
assert.equal(calculateProjectQuote({...p,objects:[{kind:'equipment',name:'Ławka'}]},card,1).priceNet,20400);
assert.equal(calculateProjectQuote({...p,objects:[{kind:'image',name:'Logo'}]},card,1).priceNet,20250);
q=calculateProjectQuote({...p,objects:[{kind:'equipment',name:'Nieznany'}]},card,1);
assert.equal(q.status,'partial');assert.equal(q.priceNet,null);assert.equal(q.priceGross,null);assert.equal(q.knownSubtotalNet,20200);
q=calculateProjectQuote(p,null,1);assert.equal(q.status,'unpriced');assert.equal(q.knownSubtotalNet,null);assert(q.items.every(i=>i.totalNet===null));
q=calculateProjectQuote({...p,arenaModel:'octagon',objects:[{kind:'equipment',name:'Bramka'},{kind:'equipment',name:'Bramka'},{kind:'equipment',name:'Bramka'}]},card,1);
assert.equal(q.area,29.823379);assert.equal(q.items.find(i=>i.id==='surface').quantity,29.82);assert.equal(q.items.find(i=>i.id==='surface').totalNet,2982);assert.equal(q.items.find(i=>i.id==='equipment:Bramka').quantity,1);assert.equal(q.items.find(i=>i.id==='arena').totalNet,10000);
assert.equal(calculateProjectQuote({...p,arenaModel:'octagon',length:60},card,1).area,q.area,'Imported dimensions cannot scale source model pricing');
q=calculateProjectQuote({...p,surface:'Sztuczna trawa 60 mm',lines:false},card,4);assert(!q.items.some(i=>i.id==='pattern'));assert.equal(q.status,'partial');
assert.equal(calculateProjectQuote(p,{...card,vatRate:undefined},1).priceGross,null);
assert.equal(calculateProjectQuote(p,{...card,vatRate:0},1).priceGross,20200);
assert.throws(()=>parseRateCard('{bad'));assert.throws(()=>parseRateCard(JSON.stringify({...card,designNet:-1})));assert.throws(()=>parseRateCard(JSON.stringify({...card,vatRate:23})));assert.throws(()=>parseRateCard(JSON.stringify({...card,equipmentNet:{x:'100'}})));
assert.equal(calculateProjectQuote({...p,courtShape:'circle',diameter:6},card,1).area,Math.PI*9);
// Verify frozen quantities against actual floor top faces, including polygon corners.
for(const [id,{area,source}] of Object.entries(arenaSurfaceQuantities)){
 const data=JSON.parse(await readFile(source,'utf8'));let measured=0;
 for(const mesh of data.filter(m=>m.group==='floor')){
  const top=Math.max(...mesh.v.map(v=>v[1]));
  for(const f of mesh.f){if(f.length!==3)continue;const [a,b,c]=f.map(i=>mesh.v[i]);if([a,b,c].every(v=>Math.abs(v[1]-top)<1e-4))measured+=Math.abs((b[0]-a[0])*(c[2]-a[2])-(c[0]-a[0])*(b[2]-a[2]))/2;}
 }
 assert(Math.abs(area-measured)<.000001,`${id}: quantity must match source floor mesh`);
}
console.log('PASS: quantity/source mesh, dimension/material/complexity/line/equipment changes, included goals, VAT/cents, partial/unknown rates, invalid rate cards. Fixture rates are not commercial.');

const working=parseRateCard(JSON.stringify({version:'TEST-WORKING',currency:'PLN',workingAssumptions:true,arenaNet:{octagon:10}}));assert.equal(calculateProjectQuote({...p,arenaModel:'octagon'},working,1).workingAssumptions,true);assert.throws(()=>parseRateCard(JSON.stringify({version:'TEST-WORKING',currency:'PLN',workingAssumptions:'approved'})));
