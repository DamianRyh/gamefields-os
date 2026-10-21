import assert from 'node:assert/strict';
import './inquiry-summary.mjs';
import './inquiry-transport.mjs';
import './project-dimensions.mjs';
import {readFile,readdir,access} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=path=>readFile(resolve(root,path),'utf8');
const {patternFamilies,patternPalettes,signaturePresets,variants,PATTERN_COUNT}=await import('../lib/pattern-library.ts');
assert.equal(PATTERN_COUNT,300);assert.equal(patternFamilies.length,25);assert.equal(patternPalettes.length,19);assert.equal(signaturePresets.length,12);assert.equal(variants.length,12);
const home=await read('app/page.tsx');
assert.ok(!home.includes('/api/projects'));assert.ok(!home.includes('/play'));assert.ok(!home.includes('Object.values(realisticPreviews).forEach'));
assert.ok((await read('app/manifest.ts')).includes('start_url: "/"'));
for(const dir of ['app','components','lib']){
 for(const file of await readdir(resolve(root,dir),{recursive:true}))assert.ok(!/(^|\/)play(?:\/|-)/.test(file),`Retired module: ${dir}/${file}`);
}
const sources=await Promise.all(['app/page.tsx','components/street-football-realistic-preview.tsx','lib/radar-locations.ts'].map(read));
for(const src of new Set(sources.join('\n').match(/\/(?:studio|radar)\/[^"'`\s]+\.(?:png|webp)/g)||[]))await access(resolve(root,'public'+src));
assert.ok((await read('lib/realistic-locations.ts')).includes('enabled:false'));
console.log('PASS: Studio/Radar scope, 300 patterns, 19 palettes, 12 Signature directions, assets present, Kraków hidden, no retired account calls.');

for(const loc of ["park","school","courtyard","warsaw-pkin"])for(const view of ["perspective","aerial","ground"])await access(resolve(root,`public/studio/panna/${loc}-${view}.webp`));
