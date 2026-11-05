import type {Mesh} from './renderer';
/** Approved O1 revision 2: baked GLB coordinates, one inner sheet per panel. */
export function parseO1Glb(buffer:ArrayBuffer):Mesh[]{
 const view=new DataView(buffer);
 if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2)throw Error('Invalid O1 GLB');
 const length=view.getUint32(12,true),doc=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,20,length))),bin=28+length;
 function read(index:number):number[][]{
  const a=doc.accessors[index],b=doc.bufferViews[a.bufferView],width=({SCALAR:1,VEC2:2,VEC3:3} as Record<string,number>)[a.type];
  if(!width||a.sparse||![5126,5125,5123,5121].includes(a.componentType))throw Error('Unsupported O1 accessor');
  const bytes=a.componentType===5126||a.componentType===5125?4:a.componentType===5123?2:1;
  return Array.from({length:a.count},(_,i)=>Array.from({length:width},(_,k)=>{const offset=bin+(b.byteOffset||0)+(a.byteOffset||0)+i*(b.byteStride||width*bytes)+k*bytes;return a.componentType===5126?view.getFloat32(offset,true):a.componentType===5125?view.getUint32(offset,true):a.componentType===5123?view.getUint16(offset,true):view.getUint8(offset)}));
 }
 // Match the existing Studio convention: short axis X, goals along Z, Y up.
 const rotate=(p:number[])=>[-p[2],p[1],p[0]],meshes:Mesh[]=[];let sheets=0;
 for(const node of doc.nodes){
  if(['matrix','rotation','translation','scale'].some(k=>node[k]!==undefined))throw Error('O1 requires baked node transforms');
  if(node.mesh===undefined)continue;
  const label=node.extras?.cad_source||node.name,sheet=node.extras?.category==='sheet';if(sheet)sheets++;
  if(!label||/floor|turf|ground/i.test(label))throw Error('Unexpected O1 construction element');
  for(const [primitiveIndex,primitive] of doc.meshes[node.mesh].primitives.entries()){
   if((primitive.mode??4)!==4)throw Error('O1 must be triangulated');
   const v=read(primitive.attributes.POSITION).map(rotate),normals=read(primitive.attributes.NORMAL).map(rotate),indices=read(primitive.indices).flat();
   const f=Array.from({length:indices.length/3},(_,i)=>indices.slice(i*3,i*3+3));
   let uv=v.map(()=>[0,0]);
   if(sheet){
    // Perforation UVs already follow each curved panel; normalize only for artwork.
    const raw=read(primitive.attributes.TEXCOORD_0),lo=[Infinity,Infinity],hi=[-Infinity,-Infinity];
    for(const p of raw)for(let k=0;k<2;k++){lo[k]=Math.min(lo[k],p[k]);hi[k]=Math.max(hi[k],p[k])}
    uv=raw.map(p=>p.map((x,k)=>(x-lo[k])/Math.max(hi[k]-lo[k],1e-9)));
    const sides:Record<string,number[][]>={inner:[],outer:[],edge:[]};
    for(const face of f){const center=[0,0,0],normal=[0,0,0];for(const i of face)for(let k=0;k<3;k++){center[k]+=v[i][k]/3;normal[k]+=normals[i][k]/3}
     const radial=normal[0]*center[0]+normal[2]*center[2],side=Math.abs(normal[1])<.15&&Math.abs(radial)>1?(radial<0?'inner':'outer'):'edge';sides[side].push(face);
    }
    for(const [side,faces] of Object.entries(sides))if(faces.length)meshes.push({id:`o1-${node.mesh}-${primitiveIndex}-${side}`,label,group:side==='edge'?'frame':'panels',v,f:faces,uv,normals,artwork:side!=='edge'});
   }else meshes.push({id:`o1-${node.mesh}-${primitiveIndex}`,label,group:label.startsWith('BR1')?'goals':'frame',v,f,uv,normals,artwork:false});
  }
 }
 if(sheets!==12)throw Error('Expected 12 single O1 sheets');
 return meshes;
}
export async function loadO1Glb(url:string,signal?:AbortSignal):Promise<Mesh[]>{
 const response=await fetch(url,{signal});if(!response.ok)throw Error('Nie można wczytać modelu O1');return parseO1Glb(await response.arrayBuffer());
}
