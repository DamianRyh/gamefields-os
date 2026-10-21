import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const sources={w1:['components/assets-blender/w1.json','public/arenas/boisko-w1.glb'],o1:['components/assets-blender/o1.json'],p1:['components/assets-blender/p1.json','components/assets-blender/p1-surface.json'],street15:['public/arenas/street15.json'],'circle-cage-1':['public/arenas/circle-cage-1.json'],'circle-cage-2':['public/arenas/circle-cage-2.json'],'street-field':['public/arenas/street-field.json'],octagon:['public/arenas/octagon.json']};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const rounded=n=>Math.round(n*1e6)/1e6;
function bounds(vertices){
 if(!vertices.length)throw Error('Empty geometry');
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const v of vertices)for(let k=0;k<3;k++){if(!Number.isFinite(v[k]))throw Error('Nonfinite geometry');min[k]=Math.min(min[k],v[k]);max[k]=Math.max(max[k],v[k])}
 return {x:rounded(max[0]-min[0]),z:rounded(max[2]-min[2]),y:rounded(max[1]-min[1])};
}
// Same per-node transform convention as the current W1 runtime loader.
function glbVertices(bytes){
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 if(view.getUint32(0,true)!==0x46546c67)throw Error('Invalid GLB');
 const jsonLength=view.getUint32(12,true),doc=JSON.parse(bytes.subarray(20,20+jsonLength).toString()),bin=28+jsonLength,vertices=[];
 for(const node of doc.nodes){if(node.mesh===undefined)continue;
  const [x,y,z,w]=node.rotation||[0,0,0,1],s=node.scale||[1,1,1],t=node.translation||[0,0,0];
  for(const primitive of doc.meshes[node.mesh].primitives){
   const a=doc.accessors[primitive.attributes.POSITION],b=doc.bufferViews[a.bufferView];
   if(a.type!=='VEC3'||a.componentType!==5126||a.sparse||node.matrix)throw Error('Unsupported GLB layout; verify runtime adapter');
   for(let i=0;i<a.count;i++){
    const offset=bin+(b.byteOffset||0)+(a.byteOffset||0)+i*(b.byteStride||12);
    const [u,v,q]=[0,1,2].map(k=>view.getFloat32(offset+k*4,true)*s[k]);
    const ux=2*(y*q-z*v),uy=2*(z*u-x*q),uz=2*(x*v-y*u);
    vertices.push([u+w*ux+y*uz-z*uy+t[0],v+w*uy+z*ux-x*uz+t[1],q+w*uz+x*uy-y*ux+t[2]]);
   }
  }
 }
 return vertices;
}
export async function measureArenaGeometry(){
 const catalog={};
 for(const [id,paths] of Object.entries(sources)){
  const files=await Promise.all(paths.map(async path=>{const bytes=await readFile(resolve(root,path));return {path,sha256:hash(bytes),bytes}}));
  const floorFile=id==='p1'?files[1]:files[0],floor=JSON.parse(floorFile.bytes).filter(m=>m.group==='floor');
  let area=0;
  for(const mesh of floor){const top=Math.max(...mesh.v.map(v=>v[1]));for(const face of mesh.f){if(face.length!==3)throw Error('Triangulate source floor');const [a,b,c]=face.map(i=>mesh.v[i]);if([a,b,c].every(v=>Math.abs(v[1]-top)<1e-4))area+=Math.abs((b[0]-a[0])*(c[2]-a[2])-(c[0]-a[0])*(b[2]-a[2]))/2}}
  const construction=id==='w1'?glbVertices(files[1].bytes):JSON.parse(files[0].bytes).filter(m=>m.group!=='floor').flatMap(m=>m.v);
  const sourceFiles=files.map(({path,sha256})=>({path,sha256}));
  catalog[id]={area:rounded(area),source:floorFile.path,surfaceBounds:bounds(floor.flatMap(m=>m.v)),constructionBounds:bounds(construction),sourceFiles,sourceRevision:hash(JSON.stringify(sourceFiles)),clearance:null,modulePitch:null};
 }
 return catalog;
}
export function serializeGeometry(catalog){return '// Generated from the live Studio assets; run node scripts/build-arena-geometry.mjs.\nexport const arenaGeometry = '+JSON.stringify(catalog,null,2)+';\nexport const arenaSurfaceQuantities = Object.fromEntries(Object.entries(arenaGeometry).map(([id, model]) => [id, {area: model.area, source: model.source}]));\n'}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const catalog=await measureArenaGeometry();await writeFile(resolve(root,'lib/arena-geometry-data.mjs'),serializeGeometry(catalog));console.log('Generated geometry for '+Object.keys(catalog).length+' current Studio models.');
}
