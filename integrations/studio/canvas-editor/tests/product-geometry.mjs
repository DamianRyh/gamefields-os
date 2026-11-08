import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {productGeometry} from '../lib/product-geometry.ts';
import {loadArenaGlb} from '../components/glb-arena.ts';
const source=JSON.parse(await readFile('public/arenas/p1.json','utf8'));
const fetchBefore=globalThis.fetch;globalThis.fetch=async path=>{const b=await readFile('public'+path);return {ok:true,arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)}};
const exported=await loadArenaGlb('/arenas/panna-court-web.glb');globalThis.fetch=fetchBefore;
assert.equal(exported.length,source.length);let bytesBefore=0,bytesAfter=0;
for(let k=0;k<source.length;k++){
 const a=source[k],b=exported[k];assert.equal(b.id,a.id);assert.equal(b.group,a.group);assert.equal(b.artwork,a.artwork);assert.deepEqual(b.f,a.f);
 for(const key of ['v','uv','normals'])for(let i=0;i<a[key].length;i++)for(let j=0;j<a[key][i].length;j++)assert.ok(Math.abs(a[key][i][j]-b[key][i][j])<.000001,key+' drift');
 const g=productGeometry(a);assert.equal(g.index.count,a.f.length*3);
 for(let i=0;i<a.f.length;i++)for(let j=0;j<3;j++){const original=a.f[i][j],idx=g.index.getX(i*3+j);for(let d=0;d<3;d++)assert.ok(Math.abs(g.attributes.position.array[idx*3+d]-a.v[original][d])<.000001);}
 bytesBefore+=a.f.length*3*32;bytesAfter+=Object.values(g.attributes).reduce((n,x)=>n+x.array.byteLength,0)+g.index.array.byteLength;g.dispose();
}
const hard={id:'test',group:'frame',label:'test',artwork:false,v:[[0,0,0],[1,0,0],[0,1,0],[0,0,1]],uv:[[0,0],[1,0],[0,1],[1,1]],f:[[0,1,2],[0,3,1]]};const hardGeometry=productGeometry(hard);assert.equal(hardGeometry.attributes.position.count,6,'Hard edges must remain split');hardGeometry.dispose();
const manifest=JSON.parse(await readFile('public/arenas/panna-court-web-manifest.json','utf8'));assert.ok(manifest.outputBytes<manifest.sourceBytes*.5);assert.ok(bytesAfter<bytesBefore);
await mkdir('outputs/model-improvements',{recursive:true});await writeFile('outputs/model-improvements/geometry-check.json',JSON.stringify({parts:source.length,triangles:manifest.triangles,bytesBefore,bytesAfter,sourceBytes:manifest.sourceBytes,webBytes:manifest.outputBytes,geometryAndIdsPreserved:true},null,2));
console.log('PASS: P1 binary roundtrip, all source IDs/faces/UV/normals, indexed GPU geometry, hard edges; '+bytesBefore+' → '+bytesAfter+' GPU bytes.');

globalThis.fetch=async path=>{const b=await readFile('public'+path);return {ok:true,arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)}};
const cages=[];
for(const file of ['panna-cage-90-v2.glb','panna-cage-180-v2.glb']){const parts=await loadArenaGlb('/arenas/'+file);let before=0,after=0,triangles=0;for(const part of parts){const g=productGeometry(part);before+=part.f.length*3*32;after+=Object.values(g.attributes).reduce((n,x)=>n+x.array.byteLength,0)+g.index.array.byteLength;triangles+=part.f.length;assert.equal(g.index.count,part.f.length*3);g.dispose();}assert.ok(after<before*.65);cages.push({file,triangles,before,after});}
globalThis.fetch=fetchBefore;await writeFile('outputs/model-improvements/cage-gpu-check.json',JSON.stringify(cages,null,2));console.log('PASS indexed Cage geometry:',JSON.stringify(cages));
