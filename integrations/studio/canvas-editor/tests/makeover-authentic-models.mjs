import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const configs=[
 ["W-1","components/assets-blender/w1.json",5.09,5.8314],
 ["Panna Circle","public/arenas/circle-cage-1.json",6.722908,6.12],
 ["P-1","public/arenas/p1.json",5.73267,8.09267]
];
for(const [name,path,expectedX,expectedZ] of configs){
 const meshes=JSON.parse(readFileSync(path,"utf8"));
 let min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity],vertices=0,triangles=0;
 for(const mesh of meshes){
  assert.ok(Array.isArray(mesh.v)&&Array.isArray(mesh.f),`${name}: invalid mesh shape`);
  for(const p of mesh.v){vertices++;assert.ok(p.length===3&&p.every(Number.isFinite),`${name}: invalid coordinate`);
   for(let i=0;i<3;i++){min[i]=Math.min(min[i],p[i]);max[i]=Math.max(max[i],p[i]);}}
  for(const face of mesh.f){triangles++;assert.ok(face.length===3&&face.every(i=>Number.isInteger(i)&&i>=0&&i<mesh.v.length),`${name}: invalid triangle`);}
 }
 assert.ok(vertices>10&&triangles>10);
 const x=max[0]-min[0],z=max[2]-min[2],height=max[1]-min[1];
 assert.ok(Math.abs(x-expectedX)<0.0001,`${name}: changed X footprint ${x}`);
 assert.ok(Math.abs(z-expectedZ)<0.0001,`${name}: changed Z footprint ${z}`);
 assert.ok(height>0);
 console.log(name,{vertices,triangles,footprintMeters:[x,z],heightMeters:height});
}
console.log("makeover-authentic-models PASS");
