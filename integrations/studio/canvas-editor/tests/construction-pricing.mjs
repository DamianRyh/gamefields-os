import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {models,anchors,fx,heightReference,scaleConstruction} from '../pricing/scaling-2026.mjs';
import {parseRateCard,calculateProjectQuote} from '../lib/quote-engine.ts';
for(const a of anchors){const family=a.name.startsWith('Panna')?'panna':'rectangular';assert.equal(heightReference(family,a.height),a.eur);assert.equal(scaleConstruction({family,perimeter:family==='panna'?6*Math.PI:50,height:a.height}).eur,a.eur,'Each reference anchor reproduced exactly');}
assert.equal(fx.eurPln,4.3641);assert.equal(fx.date,'2026-10-21');
const raw=JSON.parse(await readFile('pricing/rate-card-2026-10-21.json','utf8')),card=parseRateCard(JSON.stringify(raw));
const expected={w1:13100,o1:10500,p1:22300,street15:26200,'circle-cage-1':14000,'circle-cage-2':22700,'street-field':16600,octagon:15300};
assert.deepEqual(card.arenaNet,expected);assert.equal(card.vatRate,undefined);assert(card.notice.includes('Przyjęto kwoty netto'));
for(const m of models){assert.equal(scaleConstruction(m).pln,expected[m.id]);const p={arenaModel:m.id,length:15,width:10,surface:'Akryl sportowy',lines:false,graphicOpacity:100,objects:[{kind:'equipment',name:'Bramka'},{kind:'equipment',name:'Bramka'}]};const q=calculateProjectQuote(p,card,3);assert.equal(q.status,'partial');assert.equal(q.knownSubtotalNet,expected[m.id]);assert.equal(q.priceNet,null);assert.equal(q.priceGross,null);assert.deepEqual(q.constructionPrices,expected);assert.equal(q.items.filter(i=>i.totalNet!==null).length,1);assert.equal(q.items.find(i=>i.id==='arena-installation').totalNet,null);assert(q.notice);}
assert.throws(()=>parseRateCard(JSON.stringify({...raw,notice:42})));
console.log('PASS: 5 exact EUR anchors; 8 scaled construction prices; frozen FX; construction-only subtotals and catalogue; no invented VAT/surface/installation/transport.');
