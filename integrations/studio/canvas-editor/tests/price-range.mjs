import assert from 'node:assert/strict';
import {priceRange,formatPriceRange,constructionPrice,PRICE_MODE,RANGE_LOW,RANGE_HIGH} from '../lib/price-range.ts';

const base={schemaVersion:2,currency:'PLN',rateVersion:'TEST',priceGross:null,vatRate:null,area:27,areaLabel:'x',items:[],exclusions:[],assumptions:[]};

// Full estimate: range around the net price, rounded outwards to whole thousands above 20 000 zł.
let r=priceRange({...base,status:'estimated',priceNet:25335.8,knownSubtotalNet:25335.8,workingAssumptions:true});
assert.deepEqual(r,{low:24000,high:30000,working:true});
assert(r.low<=25335.8*RANGE_LOW&&r.high>=25335.8*RANGE_HIGH);
assert.equal(formatPriceRange(r),'24–30 tys. zł netto');

// Large project keeps thousands; the range always contains the estimate.
r=priceRange({...base,status:'estimated',priceNet:132309.38,knownSubtotalNet:132309.38});
assert.equal(formatPriceRange(r),'125–153 tys. zł netto');
assert.equal(r.working,false);

// Partial: only a floor, never an invented upper bound.
r=priceRange({...base,status:'partial',priceNet:null,knownSubtotalNet:41250.5});
assert.deepEqual(r,{low:41000,high:null,working:false});
assert.equal(formatPriceRange(r),'od 41 tys. zł netto');

// Small amounts stay in złote.
r=priceRange({...base,status:'estimated',priceNet:4200,knownSubtotalNet:4200});
assert.equal(formatPriceRange(r),'3500–5000 zł netto');

// Nothing priced: no range at all.
assert.equal(priceRange({...base,status:'unpriced',priceNet:null,knownSubtotalNet:null}),null);
assert.equal(priceRange(null),null);

// Construction-only mode (owner 13.11.2026): the construction item, nothing else.
assert.equal(PRICE_MODE,'construction');
const withArena={...base,status:'partial',priceNet:null,knownSubtotalNet:42000,items:[{id:'surface',label:'x',quantity:27,unit:'m²',unitNet:null,totalNet:null},{id:'arena',label:'Konstrukcja z bramkami',quantity:1,unit:'kpl.',unitNet:40000,totalNet:40000}]};
assert.equal(constructionPrice(withArena),40000);
assert.equal(constructionPrice({...withArena,items:[{id:'arena',label:'x',quantity:1,unit:'kpl.',unitNet:null,totalNet:null}]}),null,'modular or unpriced construction');
assert.equal(constructionPrice({...base,status:'estimated',priceNet:5000,knownSubtotalNet:5000,items:[]}),null,'surface-only project has no construction price');

console.log('PASS: construction price only from the construction item; price range rounds outwards, keeps the estimate inside, shows only a floor for partial quotes and nothing when unpriced.');
