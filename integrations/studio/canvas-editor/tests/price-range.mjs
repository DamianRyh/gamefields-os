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

// Concrete base without finish (owner price list 13.11.2026): fixed sale price per model, separate from the construction.
import {concreteBasePrice} from '../lib/price-range.ts';
import {CONCRETE_BASE_NET,concreteBaseNet} from '../lib/concrete-base.ts';
import {calculateProjectQuote} from '../lib/quote-engine.ts';
import {readFileSync} from 'node:fs';
const site=JSON.parse(readFileSync(new URL('../../../wordpress/offer/concrete-base.json',import.meta.url),'utf8'));
for(const m of site.models){assert.equal(CONCRETE_BASE_NET[m.id].net,m.net,`Studio and website differ for ${m.name}`);assert.equal(Math.round(m.net*1.23),m.gross);}
assert.equal(Object.keys(CONCRETE_BASE_NET).length,site.models.length);
assert.equal(concreteBaseNet('o1'),8600);assert.equal(concreteBaseNet('o1',{revision:'GF-STUDIO-MODULAR-2'}),null);assert.equal(concreteBaseNet(undefined),null);
const play={arenaModel:'o1',length:5.902,width:5.902,courtShape:'circle',diameter:5.902,surface:'Akryl sportowy',lines:false,graphicOpacity:0,objects:[]};
const without=calculateProjectQuote({...play,concreteBase:false},null,1);
assert.equal(without.items.find(i=>i.id==='concrete-base'),undefined,'customer removed the concrete base');
assert.equal(concreteBasePrice(without),null);
const withBase=calculateProjectQuote(play,null,1);
assert.equal(concreteBasePrice(withBase),8600);
assert(withBase.exclusions[0].includes('płytę 12 cm'),'exclusions describe the concrete scope');
assert.equal(calculateProjectQuote({...play,concreteBase:true,arenaModel:'street15'},null,1).items.find(i=>i.id==='concrete-base').totalNet,46500);
console.log('PASS: concrete base priced per model from the owner list, matches the website file, included by default and removable.');

// Painting on the concrete base (owner price list 13.11.2026): whole slab m² × rate, rounded up to 100 zł.
import {PAINT_VARIANTS,autoPaintVariant,paintNet} from '../lib/surface-finish.ts';
import {surfaceFinish} from '../lib/price-range.ts';
const paintSite=JSON.parse(readFileSync(new URL('../../../wordpress/offer/surface-finish.json',import.meta.url),'utf8'));
for(const v of paintSite.variants)assert.equal(PAINT_VARIANTS[v.id].netPerM2,v.netPerM2,v.name);
for(const m of paintSite.models)for(const [v,net] of Object.entries(m.net))assert.equal(paintNet(m.id,v),net,`${m.name} ${v}`);
assert.deepEqual(['plain','plain-granulate','pattern','pattern-advanced'].map(v=>paintNet('o1',v)),[2400,3100,4600,5600]);
assert.equal(paintNet('street15','plain'),12800);
assert.equal(autoPaintVariant({graphic:false,colors:1,complexity:1}),'plain');
assert.equal(autoPaintVariant({graphic:true,colors:5,complexity:2}),'pattern');
assert.equal(autoPaintVariant({graphic:true,colors:7,complexity:1}),'pattern-advanced');
assert.equal(autoPaintVariant({graphic:true,colors:3,complexity:3}),'pattern-advanced');
assert.equal(autoPaintVariant({graphic:true,colors:3,complexity:1,gradient:true}),'pattern-advanced');
const painted=calculateProjectQuote({...play,surface:'Akryl sportowy',graphicOpacity:0,base:'#1d5147',zone:'#1d5147'},null,1);
assert.deepEqual(surfaceFinish(painted),{label:'Malowanie · Jednokolorowa',net:2400,note:surfaceFinish(painted).note});
assert.equal(surfaceFinish(calculateProjectQuote({...play,surface:'Akryl sportowy',paintVariant:'pattern'},null,1)).net,4600,'customer choice wins');
assert.equal(surfaceFinish(calculateProjectQuote({...play,surface:'Piasek sportowy'},null,1)).net,null,'other materials stay individual');
assert.equal(surfaceFinish(calculateProjectQuote({...play,surface:'Beton sportowy'},null,1)),null,'bare concrete has no finish');
console.log('PASS: painting priced per model and variant from the owner list, matches the website file, auto variant from the design, other finishes individual.');

// PU/EPDM on the concrete base (owner price list 14.11.2026): same area and rounding, Standard by default.
import {EPDM_VARIANTS,epdmNet} from '../lib/surface-finish.ts';
for(const v of paintSite.epdm.variants)assert.equal(EPDM_VARIANTS[v.id].netPerM2,v.netPerM2,v.name);
for(const m of paintSite.epdm.models)for(const [v,net] of Object.entries(m.net))assert.equal(epdmNet(m.id,v),net,`${m.name} ${v}`);
assert.deepEqual(['standard','standard-plus','premium'].map(v=>epdmNet('o1',v)),[7600,9600,12100]);
const epdm=surfaceFinish(calculateProjectQuote({...play,surface:'EPDM'},null,1));
assert.equal(epdm.label,'Nawierzchnia EPDM wylewana · Standard (natrysk)');assert.equal(epdm.net,7600);
assert.equal(surfaceFinish(calculateProjectQuote({...play,surface:'EPDM',epdmVariant:'premium'},null,1)).net,12100);
console.log('PASS: PU/EPDM priced per model and variant from the owner list, matches the website file, Standard by default.');

// Sports tiles (owner price list 14.11.2026): owner's tiled area per model, Standard by default.
import {TILE_VARIANTS,tilesNet} from '../lib/surface-finish.ts';
for(const v of paintSite.tiles.variants)assert.equal(TILE_VARIANTS[v.id].netPerM2,v.netPerM2,v.name);
for(const m of paintSite.tiles.models)for(const [v,net] of Object.entries(m.net))assert.equal(tilesNet(m.id,v),net,`${m.name} ${v}`);
assert.deepEqual(['standard','standard-plus','premium'].map(v=>tilesNet('o1',v)),[8300,9800,12100]);
assert.equal(tilesNet('street15','standard'),45200);
const tiles=surfaceFinish(calculateProjectQuote({...play,surface:'Moduły sportowe'},null,1));
assert.equal(tiles.label,'Płytki sportowe PP · Standard');assert.equal(tiles.net,8300);
assert.equal(surfaceFinish(calculateProjectQuote({...play,surface:'Moduły sportowe',tileVariant:'premium'},null,1)).net,12100);
import {tileCount} from '../lib/surface-finish.ts';
for(const m of paintSite.tiles.models)assert.equal(tileCount(m.areaM2),paintSite.tiles.internalTakeOff.tilesPerModel[m.id],`${m.name} tiles`);
assert.equal(tileCount(150),1650);assert.doesNotMatch(tiles.note,/płytek/,'tile count is internal');assert.match(tiles.note,/Około 30,1 m²/);
console.log('PASS: sports tiles priced per model and variant from the owner list, matches the website file, Standard by default.');

// Artificial turf (owner price list 14.11.2026): playing area as tiles, Standard by default.
import {TURF_VARIANTS,turfNet} from '../lib/surface-finish.ts';
for(const v of paintSite.turf.variants)assert.equal(TURF_VARIANTS[v.id].netPerM2,v.netPerM2,v.name);
for(const m of paintSite.turf.models)for(const [v,net] of Object.entries(m.net))assert.equal(turfNet(m.id,v),net,`${m.name} ${v}`);
assert.deepEqual(['standard','standard-plus','premium'].map(v=>turfNet('o1',v)),[5100,6800,8800]);
assert.equal(turfNet('street15','standard'),27500);
const turf=surfaceFinish(calculateProjectQuote({...play,surface:'Sztuczna trawa 60 mm'},null,1));
assert.equal(turf.label,'Sztuczna trawa · Standard');assert.equal(turf.net,5100);
assert.equal(surfaceFinish(calculateProjectQuote({...play,surface:'Sztuczna trawa 60 mm',turfVariant:'premium'},null,1)).net,8800);
console.log('PASS: artificial turf priced per model and variant from the owner list, matches the website file, Standard by default.');

// Acrylic hard court (owner price list 14.11.2026): separate material, playing area, Standard by default.
import {ACRYLIC_VARIANTS,acrylicNet} from '../lib/surface-finish.ts';
for(const v of paintSite.acrylic.variants)assert.equal(ACRYLIC_VARIANTS[v.id].netPerM2,v.netPerM2,v.name);
for(const m of paintSite.acrylic.models)for(const [v,net] of Object.entries(m.net))assert.equal(acrylicNet(m.id,v),net,`${m.name} ${v}`);
assert.deepEqual(['standard','standard-plus','premium'].map(v=>acrylicNet('o1',v)),[6100,8100,10300]);
const acrylic=surfaceFinish(calculateProjectQuote({...play,surface:'Akryl Hard Court'},null,1));
assert.equal(acrylic.label,'Akryl Hard Court · Standard (Hard Court)');assert.equal(acrylic.net,6100);
assert.equal(surfaceFinish(calculateProjectQuote({...play,surface:'Akryl Hard Court',acrylicVariant:'premium'},null,1)).net,10300);
assert.equal(surfaceFinish(calculateProjectQuote({...play,surface:'Akryl sportowy',paintVariant:'plain'},null,1)).net,2400,'painting unchanged');
console.log('PASS: acrylic hard court priced per model and variant from the owner list, matches the website file, separate from painting.');

// Rubber slabs SBR / EPDM (owner price list 14.11.2026): separate material, playing area, Standard by default.
import {RUBBER_VARIANTS,rubberNet} from '../lib/surface-finish.ts';
for(const v of paintSite.rubber.variants)assert.equal(RUBBER_VARIANTS[v.id].netPerM2,v.netPerM2,v.name);
for(const m of paintSite.rubber.models)for(const [v,net] of Object.entries(m.net))assert.equal(rubberNet(m.id,v),net,`${m.name} ${v}`);
assert.deepEqual(['standard','standard-plus','premium'].map(v=>rubberNet('o1',v)),[10300,12100,14900]);
assert.equal(rubberNet('p1','standard'),14800);assert.equal(rubberNet('street15','standard'),56200);
const rubber=surfaceFinish(calculateProjectQuote({...play,surface:'Płyty gumowe'},null,1));
assert.equal(rubber.label,'Płyty gumowe · Standard (SBR 40 mm)');assert.equal(rubber.net,10300);
assert.equal(surfaceFinish(calculateProjectQuote({...play,surface:'Płyty gumowe',rubberVariant:'premium'},null,1)).net,14900);
console.log('PASS: rubber slabs priced per model and variant from the owner list, matches the website file, separate material.');

// Rubber mats / rolls (owner price list 14.11.2026): separate material, playing area, Standard by default.
import {MAT_VARIANTS,matNet} from '../lib/surface-finish.ts';
for(const v of paintSite.mats.variants)assert.equal(MAT_VARIANTS[v.id].netPerM2,v.netPerM2,v.name);
for(const m of paintSite.mats.models)for(const [v,net] of Object.entries(m.net))assert.equal(matNet(m.id,v),net,`${m.name} ${v}`);
assert.deepEqual(['standard','standard-plus','premium'].map(v=>matNet('o1',v)),[7300,9600,12800]);
const mats=surfaceFinish(calculateProjectQuote({...play,surface:'Maty gumowe'},null,1));
assert.equal(mats.label,'Maty gumowe · Standard');assert.equal(mats.net,7300);
assert.equal(surfaceFinish(calculateProjectQuote({...play,surface:'Maty gumowe',matVariant:'premium'},null,1)).net,12800);
console.log('PASS: rubber mats priced per model and variant from the owner list, matches the website file, separate material.');

// Owner rule 14.11.2026: every finish on the construction area from the model +10%, same for all shapes.
import {FINISH_AREA_M2} from '../lib/surface-finish.ts';
import {arenaSurfaceQuantities} from '../lib/arena-geometry-data.mjs';
for(const [id,q] of Object.entries(arenaSurfaceQuantities))assert.equal(FINISH_AREA_M2[id],Math.round(q.area*1.1*10)/10,id);
assert.equal(FINISH_AREA_M2.o1,30.1);assert.equal(FINISH_AREA_M2.street15,164.1);
console.log('PASS: one finish area per model (construction area +10%) for every material.');
