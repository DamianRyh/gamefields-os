import assert from 'node:assert/strict';
import {renderPro,PRO_FAMILIES,PRO_PALETTES} from '../lib/court-art-pro.mjs';
import {proFamilies,proPalettes,proSignaturePresets,mastersSignaturePresets} from '../lib/pattern-library-pro.ts';
import {patternFamilies,patternPalettes,signaturePresets} from '../lib/pattern-library.ts';

// Counts follow the engine catalogue (court-art-pro.mjs), from which build-studio-files.mjs generates pattern-library-pro.ts.
assert.ok(PRO_FAMILIES.length>=36,'Masters II brought the Pro engine to 36 directions');
assert.deepEqual(proFamilies.map(f=>f.id),PRO_FAMILIES.map(f=>f.id),'pattern-library-pro.ts must match the engine families');
assert.deepEqual(proPalettes.map(p=>p.id),PRO_PALETTES.map(p=>p.id),'pattern-library-pro.ts must match the engine palettes');
assert.equal(proSignaturePresets.length,16);
const mastersII=mastersSignaturePresets.filter(p=>p.eyebrow.startsWith('MASTERS II '));
assert.equal(mastersII.length,8);
assert.equal(mastersSignaturePresets.length-mastersII.length,12);
assert.deepEqual(mastersSignaturePresets.slice(0,mastersII.length),mastersII,'Masters II is shown first');
assert.deepEqual(new Set(mastersSignaturePresets.map(p=>p.familyId)).size,mastersSignaturePresets.length,'one Masters project per new direction');
assert.equal(patternFamilies.filter(f=>!f.id.startsWith('pro-')).length,25);
const proPresetCount=mastersSignaturePresets.length+proSignaturePresets.length;
assert.deepEqual(signaturePresets.slice(0,mastersSignaturePresets.length),mastersSignaturePresets);
assert.deepEqual(signaturePresets.slice(mastersSignaturePresets.length,proPresetCount),proSignaturePresets);
assert.equal(signaturePresets.slice(proPresetCount).length,12);
for(const rows of [patternFamilies,patternPalettes,signaturePresets])assert.equal(new Set(rows.map(row=>row.id)).size,rows.length,'Identifiers must remain unique');
for(const preset of [...mastersSignaturePresets,...proSignaturePresets]){
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
