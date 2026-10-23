import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {calculateProjectQuote,parseRateCard} from '../lib/quote-engine.ts';
import {sportProfiles} from '../lib/sport-profiles.ts';
const raw=await readFile('pricing/rate-card-working-2026-10-23.json','utf8'),card=parseRateCard(raw),original=JSON.parse(await readFile('pricing/rate-card-2026-10-21.json','utf8'));
assert.equal(card.workingAssumptions,true);assert.equal(JSON.parse(raw).commerciallyApproved,false);assert.equal(card.vatRate,undefined);assert.deepEqual(card.arenaNet,original.arenaNet);
assert.deepEqual(Object.keys(card.equipmentNet).sort(),[...new Set(sportProfiles.flatMap(p=>p.equipment))].sort());
const project={arenaModel:'octagon',length:4.962,width:4.962,surface:'Akryl sportowy',lines:false,graphicOpacity:100,objects:[]};
const q=calculateProjectQuote(project,card,1);assert.equal(q.priceNet,23829.3);assert.equal(q.priceGross,null);assert.equal(q.workingAssumptions,true);assert.equal(q.status,'estimated');
assert.equal(calculateProjectQuote({...project,objects:[{kind:'equipment',name:'Ławka'}]},card,1).priceNet,q.priceNet+1200);
assert.equal(calculateProjectQuote({...project,objects:[{kind:'equipment',name:'Bramka'},{kind:'equipment',name:'Bramka'}]},card,1).priceNet,q.priceNet);
const unknown=calculateProjectQuote({...project,objects:[{kind:'equipment',name:'Niestandardowy obiekt'}]},card,1);assert.equal(unknown.status,'partial');assert.equal(unknown.priceNet,null);
for(const arenaModel of Object.keys(card.arenaNet))for(const surface of Object.keys(card.surfaces))for(const complexity of [1,2,3,4]){
 const quote=calculateProjectQuote({...project,arenaModel,surface,lines:true},card,complexity);assert.equal(quote.status,'estimated');assert(quote.items.every(item=>item.totalNet!==null));assert(quote.priceNet>0);assert.equal(quote.priceGross,null);
}
console.log('PASS working assumptions: 192 model/surface/complexity combinations; exact Octa23829.30; all29 equipment keys; preserved8 construction prices; no VAT; bundled goals; unknown custom remains partial.');
