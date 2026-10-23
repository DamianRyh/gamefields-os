import type {Mesh} from './renderer';
/** Reads the Blender GLB directly, preserving its parts, transforms, UVs and normals. */
export async function loadArenaGlb(url:string,signal?:AbortSignal):Promise<Mesh[]>{
 const response=await fetch(url,{signal});if(!response.ok)throw Error('Nie można wczytać GLB');
 const buffer=await response.arrayBuffer(),view=new DataView(buffer);if(view.getUint32(0,true)!==0x46546c67)throw Error('Nieprawidłowy GLB');
 const jsonLength=view.getUint32(12,true),doc=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,20,jsonLength))),bin=28+jsonLength;
 function read(index:number):number[][]{const a=doc.accessors[index],b=doc.bufferViews[a.bufferView],width=({SCALAR:1,VEC2:2,VEC3:3,VEC4:4} as Record<string,number>)[a.type],bytes=a.componentType===5126||a.componentType===5125?4:a.componentType===5123?2:1;return Array.from({length:a.count},(_,i)=>Array.from({length:width},(_,k)=>{const offset=bin+(b.byteOffset||0)+(a.byteOffset||0)+i*(b.byteStride||width*bytes)+k*bytes;return a.componentType===5126?view.getFloat32(offset,true):a.componentType===5125?view.getUint32(offset,true):a.componentType===5123?view.getUint16(offset,true):view.getUint8(offset)}))}
 const meshes:Mesh[]=[];
 for(const node of doc.nodes){if(node.mesh===undefined)continue;const q=node.rotation||[0,0,0,1],s=node.scale||[1,1,1],t=node.translation||[0,0,0];const rotate=(p:number[])=>{const [x,y,z,w]=q,[a,b,c]=p,ux=2*(y*c-z*b),uy=2*(z*a-x*c),uz=2*(x*b-y*a);return [a+w*ux+y*uz-z*uy,b+w*uy+z*ux-x*uz,c+w*uz+x*uy-y*ux]};
 for(const primitive of doc.meshes[node.mesh].primitives){const label=node.name||'Element',v=read(primitive.attributes.POSITION).map(p=>rotate(p.map((x,i)=>x*s[i])).map((x,i)=>x+t[i])),normals=primitive.attributes.NORMAL===undefined?undefined:read(primitive.attributes.NORMAL).map(p=>rotate(p.map((x,i)=>x/s[i]))),uv=primitive.attributes.TEXCOORD_0===undefined?v.map(()=>[0,0]):read(primitive.attributes.TEXCOORD_0),indices=primitive.indices===undefined?v.map((_,i)=>i):read(primitive.indices).flat(),panel=label.includes('blacha'),group=panel?'panels':label.startsWith('BR2')?'goals':'frame';
 const f=Array.from({length:indices.length/3},(_,i)=>indices.slice(i*3,i*3+3));
 if(panel){for(const side of ['inner','outer','edge']){const faces=f.filter(face=>{const center=face.map(i=>v[i]).reduce((a,p)=>a.map((x,k)=>x+p[k]/3),[0,0,0]),normal=normals?.[face[0]]||[0,1,0];return (Math.abs(normal[1])>.3?'edge':normal[0]*center[0]+normal[2]*center[2]<0?'inner':'outer')===side});if(faces.length)meshes.push({id:`glb-${node.mesh}-${side}`,label,group:side==='edge'?'frame':group,v,f:faces,uv,normals,artwork:side!=='edge'})}}
 else meshes.push({id:`glb-${node.mesh}`,label,group,v,f,uv,normals,artwork:false});
 }
 }
 return meshes;
}
