import assert from 'node:assert/strict';
import{readFileSync}from'node:fs';
import{createHash}from'node:crypto';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const meshes=JSON.parse(read('public/arenas/p1.json'));
const manifest=JSON.parse(read('public/arenas/panna-court-v6-manifest.json'));
assert.equal(createHash('sha256').update(read('public/arenas/panna-court-v6.glb')).digest('hex'),manifest.sourceSha256);
assert.equal(createHash('sha256').update(read('public/arenas/p1.json')).digest('hex'),manifest.outputSha256);
assert.equal(meshes.filter(m=>m.id.endsWith('_inner')).length,16);
assert.equal(meshes.filter(m=>m.id.endsWith('_outer')).length,16);
assert.ok(!meshes.some(m=>m.group==='floor'));
assert.equal(meshes.reduce((s,m)=>s+m.f.length,0),113961);
for(const m of meshes){
 assert.equal(m.v.length,m.uv.length);assert.equal(m.v.length,m.normals.length);
 for(const f of m.f){assert.equal(f.length,3);assert.ok(f.every(i=>Number.isInteger(i)&&i>=0&&i<m.v.length));}
 assert.ok(m.v.every(v=>v.length===3&&v.every(Number.isFinite)));
 if(m.group==='panels'){
  assert.ok(Math.hypot(...m.perforationDirection)>.99);
  const radial=m.v.reduce((sum,v,i)=>sum+v[0]*m.normals[i][0]+v[2]*m.normals[i][2],0)/m.v.length;
  assert.ok(m.id.endsWith('_inner')?radial<0:radial>0,'Panel face must point to its named side: '+m.id);
 }
}
console.log('PASS Panna Court v6: exact source hash, 16 inward/outward sheet faces, valid indices, planar perforation and no ground.');
