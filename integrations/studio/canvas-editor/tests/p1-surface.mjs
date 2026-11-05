import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {p1SurfaceFinish} from '../lib/p1-surface.ts';
const meshes=JSON.parse(await readFile(new URL('../components/assets-blender/p1-surface.json',import.meta.url)));
const v=meshes.flatMap(m=>m.v);
for(const [axis,size]of [[0,5.573],[1,.1],[2,7.139]])assert.ok(Math.abs(Math.max(...v.map(p=>p[axis]))-Math.min(...v.map(p=>p[axis]))-size)<.00001,'Metres and thickness must match Blender');
assert.equal(Math.max(...v.map(p=>p[1])),0,'Construction and slab share top Z=0');
assert.equal(meshes.reduce((n,m)=>n+m.f.length,0),220);
const edges=new Map();
for(const m of meshes)for(const face of m.f){assert.equal(face.length,3);for(const i of face){assert.ok(m.v[i]&&m.normals[i]&&m.uv[i]);assert.ok(Math.abs(Math.hypot(...m.normals[i])-1)<.0001)}for(let i=0;i<3;i++){const key=[m.v[face[i]].join(','),m.v[face[(i+1)%3]].join(',')].sort().join('|');edges.set(key,(edges.get(key)||0)+1)}}
assert.ok([...edges.values()].every(n=>n===2),'The welded slab must be watertight');
for(const name of ['Akryl sportowy','EPDM','Moduły sportowe','Sztuczna trawa 60 mm']){
 const m=p1SurfaceFinish(name);for(const part of ['kolor.jpg','normal.png','orm.png'])assert.ok((await stat(new URL(`../public/surfaces/p1/${m.slug}-${part}`,import.meta.url))).size>1000);
 for(const part of ['normal','orm']){const bytes=await readFile(new URL(`../public/surfaces/p1/${m.slug}-${part}.png`,import.meta.url));assert.equal(bytes.readUInt32BE(16),512);assert.equal(bytes.readUInt32BE(20),512)}
}
assert.equal(p1SurfaceFinish('Moduły sportowe').tileSize,.3);assert.equal(p1SurfaceFinish('Sztuczna trawa 60 mm').turf,true);assert.equal(p1SurfaceFinish('EPDM',false).detail,false);
console.log('PASS: P-1 watertight Blender geometry, 220 triangles, 7.139 × 5.573 × 0.10 m, 4 physically scaled PBR finishes and all mipmap-compatible textures.');
