import * as THREE from 'three';
import type {Mesh} from '@/components/renderer';
/** Preserve authored corner normals/UVs and face order; share only identical corners. */
export function productGeometry(source:Mesh){
 const positions:number[]=[],normals:number[]=[],uvs:number[]=[],indices:number[]=[],corners=new Map<string,number>();
 for(const face of source.f){if(face.length!==3)continue;const [a,b,c]=face.map(i=>new THREE.Vector3(...source.v[i] as [number,number,number]));const normal=new THREE.Vector3().subVectors(b,a).cross(new THREE.Vector3().subVectors(c,a)).normalize().toArray();
  for(const i of face){const n=source.normals?.[i]||normal,key=source.normals?String(i):i+':'+n.join(',');let index=corners.get(key);if(index===undefined){index=positions.length/3;corners.set(key,index);positions.push(...source.v[i]);normals.push(...n);uvs.push(...(source.uv?.[i]||[0,0]));}indices.push(index);}
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeBoundingBox();return geometry;
}
