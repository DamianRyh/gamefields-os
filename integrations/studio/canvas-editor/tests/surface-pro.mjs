import assert from 'node:assert/strict';
import {renderPro} from '../lib/court-art-pro.mjs';
import {proFamilies,proPalettes,proSignaturePresets} from '../lib/pattern-library-pro.ts';
import {patternFamilies,patternPalettes,signaturePresets} from '../lib/pattern-library.ts';

assert.equal(proFamilies.length,16);
assert.equal(proPalettes.length,12);
assert.equal(proSignaturePresets.length,16);
assert.equal(patternFamilies.filter(f=>!f.id.startsWith('pro-')).length,25);
assert.deepEqual(signaturePresets.slice(0,16),proSignaturePresets);
assert.equal(signaturePresets.slice(16).length,12);
for(const rows of [patternFamilies,patternPalettes,signaturePresets])assert.equal(new Set(rows.map(row=>row.id)).size,rows.length,'Identifiers must remain unique');
for(const preset of proSignaturePresets){
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
console.log(`PASS: ${rendered} deterministic Pro patterns, flat finite SVG, unique catalogue identifiers and Pro-first presets.`);
