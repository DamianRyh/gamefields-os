import assert from 'node:assert/strict';
import {renderPro} from '../lib/court-art-pro.mjs';
import {proFamilies,proPalettes,proSignaturePresets,mastersSignaturePresets,composerSignaturePresets,muralSignaturePresets,polishSignaturePresets} from '../lib/pattern-library-pro.ts';
import {composerMetrics,proExecution} from '../lib/court-art-pro.mjs';
import {POOL,MURAL} from '../lib/court-composer.mjs';
import {measureLabels,buildPlan} from '../lib/paint-plan.mjs';
import {patternFamilies,patternPalettes,signaturePresets} from '../lib/pattern-library.ts';

// 16 Signature Pro + 12 Masters + 8 Masters II + 32 Composer families (Kompozytor I, II, III Murale, IV Wzory polskie)
assert.equal(proFamilies.length,68);
assert.equal(proPalettes.length,28);
assert.equal(proSignaturePresets.length,16);
assert.equal(mastersSignaturePresets.length,20,'Masters II (8) then Masters (12)');
assert.equal(composerSignaturePresets.length,16,'Kompozytor II (8) then Kompozytor (8)');
assert.equal(muralSignaturePresets.length,8);
assert.equal(polishSignaturePresets.length,8);
assert.equal(new Set([...composerSignaturePresets,...muralSignaturePresets,...polishSignaturePresets].map(p=>p.familyId)).size,32,'one preset per Composer family');
assert.equal(patternFamilies.filter(f=>!f.id.startsWith('pro-')).length,25);
const order=[...polishSignaturePresets,...muralSignaturePresets,...composerSignaturePresets,...mastersSignaturePresets,...proSignaturePresets];
assert.deepEqual(signaturePresets.slice(0,order.length),order,'Polskie, Murale, Kompozytor, Masters, Pro, then the legacy presets');
assert.equal(signaturePresets.slice(order.length).length,12);
for(const rows of [patternFamilies,patternPalettes,signaturePresets])assert.equal(new Set(rows.map(row=>row.id)).size,rows.length,'Identifiers must remain unique');
for(const preset of order){
 assert.ok(proFamilies.some(f=>f.id===preset.familyId));
 assert.ok(proPalettes.some(p=>p.id===preset.paletteId));
 assert.ok(preset.variant>=1&&preset.variant<=12);
}
let rendered=0;
for(const family of proFamilies)for(let variant=1;variant<=12;variant++){
 const colors=proPalettes[variant%proPalettes.length].colors;
 const svg=renderPro(family.id,variant,400,colors,{uid:'test'});
 assert.equal(svg,renderPro(family.id,variant,400,colors,{uid:'test'}),'A saved pattern must render deterministically');
 assert.ok(svg.length>100);
 assert.ok(!/NaN|Infinity|undefined|<filter|<linearGradient|<radialGradient|<script|<foreignObject/.test(svg),'Pro must produce finite, flat paintable SVG');
 rendered++;
}
// Composer: every shown variant comes from the checked pool and carries measurements
const composer=proFamilies.filter(f=>/^pro-[kmp]-/.test(f.id));
assert.equal(composer.length,32);
for(const f of composer){
 assert.ok(POOL[f.id]&&POOL[f.id].length>=12,`${f.id}: at least 12 checked seeds`);
 const m=composerMetrics(f.id,1,proPalettes[0].colors,{area:150});
 assert.ok(m&&m.colors>=2&&m.colors<=5&&m.tape>0&&m.minWidthCm===20,`${f.id}: measured paints and tape`);
 assert.equal(proExecution(f.id,1,400,proPalettes[0].colors).masking,m.masking);
}
assert.equal([...MURAL].length,8);
// Wzory polskie carry the measured slot adjacency used for the colour plan
for(const f of composer.filter(f=>f.id.startsWith('pro-p-')))assert.ok(POOL[f.id].every(e=>Array.isArray(e.m.e)&&e.m.e.length===10),`${f.id}: adjacency for the colour plan`);
// Paint plan: exact on known shapes (15 x 10 m court at 40 px per metre)
const plan=(W,H,fn,cols)=>{const lab=new Uint8Array(W*H);for(let y=0;y<H;y++)for(let x=0;x<W;x++)lab[y*W+x]=fn(x,y);return buildPlan({colours:cols,...measureLabels(lab,W,H,cols.length)},{length:15,width:10})};
const q=plan(600,400,(x,y)=>x<300?0:(y<200?1:2),['#F4F1EA','#111111','#E63A2E']);
assert.equal(q.layers[0].m2,150,'ground covers the whole court');assert.deepEqual(q.layers.map(l=>l.tape),[0,5,13],'tape only against paint already down');
const c=plan(1200,800,(x,y)=>Math.hypot(x-600,y-400)<240?1:0,['#F4F1EA','#E63A2E']);
assert.ok(Math.abs(c.layers[1].tape-18.85)<0.6&&Math.abs(c.layers[1].m2-28.27)<0.2,'circle r 3 m: perimeter and area');
console.log(`PASS: ${rendered} deterministic Pro patterns, flat finite SVG, unique identifiers, Polskie/Murale/Kompozytor/Masters/Pro preset order, ${composer.length} Composer families from checked pools, paint plan measures.`);
