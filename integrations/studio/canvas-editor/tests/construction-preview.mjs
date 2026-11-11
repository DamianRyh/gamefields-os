import assert from 'node:assert/strict';
import {previewSelection,previewPaint,constructionMeshes,previewAppearance,goalAssembly} from '../lib/construction-preview.ts';
assert.deepEqual(previewSelection(new URLSearchParams('arena=../../secret&coat=%23ffffff')), {arena:'o1',coat:'gray'});
assert.deepEqual(previewSelection(new URLSearchParams('arena=p1&coat=blue')), {arena:'p1',coat:'blue'});
assert.equal(previewPaint('red','o1'),'#D3152B');assert.equal(previewPaint('red','p1'),'#C81726');
const mesh=(id,group,label=id)=>({id,label,group,v:[[0,0,0],[1,0,0],[0,1,0]],f:[[0,1,2]],uv:[[0,0],[1,0],[0,1]],artwork:false});
const source=[mesh('floor','floor'),mesh('slab','foundation'),mesh('edge','surface-edge'),mesh('sheet','panels'),mesh('frame','frame'),mesh('S1_post','frame'),mesh('goal','goals')],before=JSON.stringify(source);
const kept=constructionMeshes(source,'p1');assert.deepEqual(kept.map(x=>x.id),['sheet','frame','S1_post','goal']);assert.equal(kept[0].perforated,true);assert.equal(JSON.stringify(source),before);
assert.equal(previewAppearance(kept[0],'green','p1').color,'#667451');assert.equal(previewAppearance(kept[1],'blue','p1').color,'#2469A6');assert.equal(previewAppearance(kept[2],'red','p1').color,'#30363c');assert.equal(previewAppearance(kept[3],'red','p1').color,'#bec5ca');
console.log('PASS preview query allowlist, model-specific approved colours, immutable floor-free geometry and independent hardware/goal finishes.');

const shifted=(id,group,x)=>{const m=mesh(id,group);return {...m,v:m.v.map(v=>[v[0]+x,v[1],v[2]])}};
const ends=[shifted('frontGoal','goals',3),shifted('rearGoal','goals',-3),shifted('wholeFrontPanel','panels',2.9),shifted('rearPanel','panels',-3),shifted('side','frame',0)];
const assembly=goalAssembly(ends);assert.equal(assembly.yaw,Math.PI/2);assert.deepEqual(assembly.meshes.map(m=>m.id),['frontGoal','wholeFrontPanel']);assert.equal(assembly.meshes[1].v,ends[2].v);assert.throws(()=>goalAssembly([]));
console.log('PASS complete, unsliced goal-end assembly faces the exterior and excludes the opposite goal.');
