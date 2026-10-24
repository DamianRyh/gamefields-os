import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseRateCard,calculateProjectQuote} from '../lib/quote-engine.ts';
const card=parseRateCard(await readFile('tests/fixtures/rates.json','utf8'));
let n=0;for(const arenaModel of Object.keys(card.arenaNet))for(const surface of Object.keys(card.surfaces))for(const complexity of [1,2,3,4]){const q=calculateProjectQuote({arenaModel,length:10,width:10,surface,lines:true,graphicOpacity:100,objects:[]},card,complexity);assert.equal(q.status,'estimated');assert.equal(q.items.find(x=>x.id==='arena').unitNet,10);assert.equal(q.priceGross,null);n++;}assert.equal(n,192);console.log('PASS: 192 combinations with artificial TEST rates, source surface quantity and no VAT. Production rates are private.');
