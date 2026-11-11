import type {Mesh} from './renderer';
import {requiredSportEquipment} from '../lib/primary-sports.ts';
import type {Project} from '@/lib/project';
export async function loadSportEquipment(p:Pick<Project,'surfaceModel'|'arenaModel'>,signal:AbortSignal):Promise<Mesh[]>{
 const required=requiredSportEquipment(p);if(!required.length)return [];
 const {asset,quantity}=required[0];const response=await fetch('/sport-equipment/'+asset+'.json',{signal});if(!response.ok)throw Error('Equipment unavailable');const data=await response.json() as Mesh[];
 return Array.from({length:quantity},(_,index)=>data.map(mesh=>({...mesh,id:`sport-${index}-${mesh.id}`,v:mesh.v.map(([x,y,z])=>{
  if(p.surfaceModel==='teqball')return [x,y,z];
  if(p.surfaceModel==='basketball-3x3')return [-z,y,x-3.425];
  return index===0?[x-12.425,y,z]:[-x+12.425,y,-z];
 })}))).flat();
}
export function sportEquipmentColor(group:string){return group==='equipment-table'?'#6336f5':group==='equipment-rim'?'#ee744e':group==='equipment-board'?'#f2eee7':group==='equipment-net'?'#e0e0d8':group==='equipment-frame'?'#30363c':null}
