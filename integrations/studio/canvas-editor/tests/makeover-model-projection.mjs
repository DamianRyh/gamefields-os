import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { build } from "esbuild";

const result=await build({entryPoints:["lib/makeover-perspective-camera.ts"],bundle:true,platform:"node",format:"esm",write:false,logLevel:"silent"});
const {estimatePerspectiveCamera,projectWorldPoint}=await import("data:text/javascript;base64,"+Buffer.from(result.outputFiles[0].contents).toString("base64"));
const cases=[
  ["w1",5.09,5.09],
  ["o1",6,6],
  ["p1",7.14,5.57],
];
for(const [model,length,width] of cases){
  const meshes=JSON.parse(await readFile(new URL(`../components/assets-blender/${model}.json`,import.meta.url),"utf8"));
  assert.ok(Array.isArray(meshes)&&meshes.length>0,`${model}: missing mesh`);
  const points=meshes.flatMap(mesh=>mesh.v);
  assert.ok(points.length>10,`${model}: missing vertices`);
  assert.ok(points.every(p=>p.length>=3&&p.every(Number.isFinite)),`${model}: invalid coordinates`);
  const xs=points.map(p=>p[0]),zs=points.map(p=>p[2]),ys=points.map(p=>p[1]);
  const dx=Math.max(...xs)-Math.min(...xs),dz=Math.max(...zs)-Math.min(...zs);
  assert.ok(dx>0&&dz>0&&Math.max(...ys)>Math.min(...ys),`${model}: degenerate bounding box`);
  const factor=Math.min(length/dx,width/dz);
  assert.ok(Number.isFinite(factor)&&factor>0);
  // Synthetic pinhole photo generated from the same coordinate convention used by the renderer.
  const reference={focalPx:950,principalPoint:[800,500],rX:[.9,0,.43589],rY:[0,-1,0],rZ:[-.43589,0,.9],translation:[0,-2,19]};
  const corners=[{x:0,y:0,z:0},{x:length,y:0,z:0},{x:length,y:0,z:width},{x:0,y:0,z:width}];
  const quad=corners.map(p=>projectWorldPoint(reference,p));
  assert.ok(quad.every(Boolean),`${model}: corners behind camera`);
  const camera=estimatePerspectiveCamera({quad,imageWidth:1600,imageHeight:1000,courtLengthMeters:length,courtWidthMeters:width,focalPx:950});
  assert.ok(Number.isFinite(camera.reprojectionRmsPx));
  assert.ok(corners.every(p=>projectWorldPoint(camera,p)),`${model}: missing contact point`);
  console.log(model,{vertices:points.length,footprintMeters:[dx*factor,dz*factor],heightMeters:(Math.max(...ys)-Math.min(...ys))*factor,residualPx:camera.reprojectionRmsPx});
}
console.log("makeover authentic-model projection smoke PASS");
