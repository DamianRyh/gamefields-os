import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..','public','arenas');
const sources=[
 ['o1','panna-play-o1-v2.glb'],
 ['p1','panna-court-v6.glb'],
 ['circle-cage-1','circle-cage-1.json'],
 ['circle-cage-2','circle-cage-2.json'],
 ['octagon','octagon.json'],
 ['street-field','street-field.json'],
 ['street15','street15-r2.json'],
];

function fromJson(file){
 return JSON.parse(fs.readFileSync(file,'utf8')).map(mesh=>({
  category:mesh.group||'frame',position:mesh.v,faces:mesh.f||[],
 })).filter(mesh=>mesh.faces.length&&mesh.position?.length);
}
function fromGlb(file){
 const bytes=fs.readFileSync(file),jsonLength=bytes.readUInt32LE(12);
 const gltf=JSON.parse(bytes.subarray(20,20+jsonLength).toString());
 const binaryStart=20+jsonLength+8;
 const component={5121:[1,'readUInt8'],5123:[2,'readUInt16LE'],5125:[4,'readUInt32LE'],5126:[4,'readFloatLE']};
 const get=(index)=>{
  const accessor=gltf.accessors[index],view=gltf.bufferViews[accessor.bufferView];
  const [size,read]=component[accessor.componentType],length={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[accessor.type];
  const stride=view.byteStride||length*size,start=binaryStart+(view.byteOffset||0)+(accessor.byteOffset||0);
  return Array.from({length:accessor.count},(_,i)=>Array.from({length},(_,j)=>bytes[read](start+i*stride+j*size)));
 };
 const groups=[];
 for(const node of gltf.nodes){
  if(node.mesh===undefined)continue;
  for(const primitive of gltf.meshes[node.mesh].primitives){
   if(primitive.mode!==undefined&&primitive.mode!==4)continue;
   const position=get(primitive.attributes.POSITION),indices=primitive.indices===undefined?position.map((_,i)=>[i]):get(primitive.indices);
   const faces=[];for(let i=0;i+2<indices.length;i+=3)faces.push([indices[i][0],indices[i+1][0],indices[i+2][0]]);
   const label=node.extras?.cad_source||node.name||'';
   const category=/sheet/i.test(label)||node.extras?.category==='sheet'?'panels':/BR1|goal/i.test(label)?'goals':'frame';
   groups.push({category,position,faces});
  }
 }
 return groups;
}
function shrink(groups,maxFaces=10000){
 const triangles=groups.reduce((sum,g)=>sum+g.faces.length,0),ratio=Math.max(1,Math.ceil(triangles/maxFaces));
 const out=[];
 for(const group of groups){
  const vertices=[];
  for(let i=0;i<group.faces.length;i+=ratio){
   const face=group.faces[i];if(face.length!==3)continue;
   for(const index of face){const v=group.position[index];if(!v)continue;vertices.push(...v.map(n=>Math.round(n*1000)/1000));}
  }
  if(vertices.length>=9)out.push({g:group.category,p:vertices});
 }
 return out;
}
const target=process.argv[2];
const outputPath=path.join(root,'carousel-models.json');
const output=target?JSON.parse(fs.readFileSync(outputPath,'utf8')):{version:1,models:{}};
if(target&&!sources.some(([key])=>key===target))throw Error('Unknown carousel model: '+target);
for(const [key,name] of sources){
 if(target&&key!==target)continue;
 const file=path.join(root,name),meshes=name.endsWith('.glb')?fromGlb(file):fromJson(file);
 output.models[key]=shrink(meshes);
 const faces=output.models[key].reduce((n,m)=>n+m.p.length/9,0);
 process.stdout.write(`${key}: ${meshes.length} meshes, ${faces} preview triangles\n`);
}
fs.writeFileSync(outputPath,JSON.stringify(output));
