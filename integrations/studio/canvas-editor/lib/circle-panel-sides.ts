import type {Mesh} from '../components/renderer';
export type CirclePanelSide='inner'|'outer'|'edge';
/** Visual face classification around the model's existing XZ origin, not manufacturing data. */
export function classifyCirclePanelFace(mesh:Mesh,face:number[]):CirclePanelSide{
 if(face.length!==3)throw Error(`Panel ${mesh.id}: expected a triangle`);
 const points=face.map(i=>{const p=mesh.v[i];if(!Number.isInteger(i)||!p||p.length!==3||!p.every(Number.isFinite))throw Error(`Panel ${mesh.id}: invalid triangle vertex`);return p});
 const[a,b,c]=points,u=b.map((x,i)=>x-a[i]),v=c.map((x,i)=>x-a[i]),normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],normalLength=Math.hypot(...normal);
 if(normalLength<1e-10)throw Error(`Panel ${mesh.id}: degenerate triangle`);
 const x=(a[0]+b[0]+c[0])/3,z=(a[2]+b[2]+c[2])/3,radialLength=Math.hypot(x,z);
 if(radialLength<1e-10)throw Error(`Panel ${mesh.id}: radial origin is undefined`);
 const dot=(normal[0]*x+normal[2]*z)/(normalLength*radialLength);
 return dot<-.05?'inner':dot>.05?'outer':'edge';
}
/** Keeps both unchanged; splits only the two Circle Cage runtime previews for one-sided artwork. */
export function circlePanelSides(meshes:Mesh[],model:string,side:'both'|'inner'|'outer'):Mesh[]{
 if(!['circle-cage-1','circle-cage-2'].includes(model)||side==='both')return meshes;
 if(side!=='inner'&&side!=='outer')throw Error('Unknown circle artwork side');
 const ids=new Set(meshes.map(m=>m.id));
 if(ids.size!==meshes.length)throw Error('Duplicate source mesh ID');
 if(!meshes.some(m=>m.group==='panels'))throw Error('Circle panel geometry is missing');
 return meshes.flatMap(mesh=>{
  if(mesh.group!=='panels')return [mesh];
  const selected:number[][]=[],unprinted:number[][]=[];
  for(const face of mesh.f)(classifyCirclePanelFace(mesh,face)===side?selected:unprinted).push(face);
  if(!selected.length||!unprinted.length)throw Error(`Panel ${mesh.id}: both visual sides are required`);
  const selectedId=`${mesh.id}--artwork-${side}`,unprintedId=`${mesh.id}--unprinted`;
  if(ids.has(selectedId)||ids.has(unprintedId))throw Error(`Panel ${mesh.id}: duplicate runtime side ID`);
  ids.add(selectedId);ids.add(unprintedId);
  return [{...mesh,id:selectedId,f:selected},{...mesh,id:unprintedId,f:unprinted}];
 });
}
