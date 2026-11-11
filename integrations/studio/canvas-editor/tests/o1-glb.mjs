import assert from 'node:assert/strict';
import{readFileSync}from'node:fs';
import{createHash}from'node:crypto';
import{parseO1Glb}from'../components/o1-arena-glb.ts';
const bytes=readFileSync(new URL('../public/arenas/panna-play-o1-v2.glb',import.meta.url));
assert.equal(createHash('sha256').update(bytes).digest('hex'),'280d6ae80365ac4909326aea1df4990c820adbf004b601ef16bee34b62b68b30');
const meshes=parseO1Glb(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
assert.equal(meshes.reduce((sum,m)=>sum+m.f.length,0),288522);
assert.equal(new Set(meshes.map(m=>m.id)).size,meshes.length);
assert.ok(!meshes.some(m=>m.group==='floor'));
for(const side of ['inner','outer']){
 const panels=meshes.filter(m=>m.id.endsWith('-'+side));assert.equal(panels.length,12);
 for(const m of panels){assert.equal(m.group,'panels');assert.ok(m.artwork);assert.ok(m.uv.every(p=>p.every(n=>Number.isFinite(n)&&n>=0&&n<=1)));
  for(const face of m.f){const c=[0,0],n=[0,0];for(const i of face){c[0]+=m.v[i][0];c[1]+=m.v[i][2];n[0]+=m.normals[i][0];n[1]+=m.normals[i][2]}
   assert.ok(side==='inner'?c[0]*n[0]+c[1]*n[1]<0:c[0]*n[0]+c[1]*n[1]>0);
  }
 }
}
assert.ok(meshes.filter(m=>m.label.startsWith('BR1')).every(m=>m.group==='goals'));
const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(const m of meshes)for(const v of m.v)for(let k=0;k<3;k++){assert.ok(Number.isFinite(v[k]));min[k]=Math.min(min[k],v[k]);max[k]=Math.max(max[k],v[k])}
assert.ok(Math.abs(max[0]-min[0]-6.05)<.002);assert.ok(Math.abs(max[2]-min[2]-6.8291)<.002);
console.log('PASS approved O1: exact GLB hash, all triangles retained, 12 inside/outside panel faces, normalized branding UVs, goals, orientation and no ground.');
