import {projectSchema,type Project} from './project.ts';
import {arenaGeometry} from './arena-geometry-data.mjs';
export const DRAFT_KEY='gamefields-studio-draft-v1';
export const PREVIOUS_KEY='previous-draft';
export const UNREADABLE_KEY='unreadable-draft';
export const VARIANTS_KEY='named-variants-v1';
export type Snapshot={id:string;name:string;createdAt:string;project:Project;modelRevision:string|null};
export type Snapshots={schemaVersion:1;items:Snapshot[]};
export function parseVaultProject(value:unknown):Project{
 const project=projectSchema.parse(typeof value==='string'?JSON.parse(value):value);
 if(new Set(project.objects.map(o=>o.id)).size!==project.objects.length)throw Error('Powtórzone identyfikatory elementów projektu.');
 return project;
}
const revision=(p:Project)=>p.arenaModel?(arenaGeometry as Record<string,{sourceRevision:string}>)[p.arenaModel]?.sourceRevision??null:null;
export function createSnapshot(project:Project,name:string,id:string,createdAt:string):Snapshot{
 const label=name.trim();if(!label||label.length>80)throw Error('Podaj nazwę wariantu (do 80 znaków).');
 const copy=parseVaultProject(JSON.stringify(project));
 return {id,name:label,createdAt,project:copy,modelRevision:revision(copy)};
}
export function parseSnapshots(value:unknown):Snapshots{
 if(value===undefined)return {schemaVersion:1,items:[]};
 const data=value as Snapshots;
 if(!data||data.schemaVersion!==1||!Array.isArray(data.items)||data.items.length>6)throw Error('Nieobsługiwana biblioteka wariantów. Zachowane dane nie zostały zmienione.');
 const ids=new Set<string>();
 const items=data.items.map(item=>{
  if(!item||typeof item.id!=='string'||!item.id||item.id.length>100||ids.has(item.id)||typeof item.name!=='string'||!item.name.trim()||item.name.length>80||typeof item.createdAt!=='string'||!Number.isFinite(Date.parse(item.createdAt))||!(item.modelRevision===null||typeof item.modelRevision==='string'&&/^[a-f0-9]{64}$/.test(item.modelRevision)))throw Error('Nieprawidłowy zapis wariantu. Zachowane dane nie zostały zmienione.');
  ids.add(item.id);return {...item,project:parseVaultProject(item.project)};
 });
 return {schemaVersion:1,items};
}
export function addSnapshot(envelope:unknown,snapshot:Snapshot):Snapshots{
 const current=parseSnapshots(envelope);
 if(current.items.length>=6)throw Error('Możesz zachować do 6 wariantów. Pobierz lub usuń wybrany zapis przed dodaniem kolejnego.');
 return parseSnapshots({schemaVersion:1,items:[...current.items,snapshot]});
}
export function removeSnapshot(envelope:unknown,id:string):Snapshots{const current=parseSnapshots(envelope);return {schemaVersion:1,items:current.items.filter(item=>item.id!==id)}}
export function restoreSnapshot(snapshot:Snapshot):Project{
 const record=parseSnapshots({schemaVersion:1,items:[snapshot]}).items[0];
 if(record.modelRevision!==revision(record.project))throw Error('Ten wariant korzysta z innej rewizji modelu. Pobierz jego JSON; przywrócenie wymaga sprawdzenia zgodności.');
 return parseVaultProject(JSON.stringify(record.project));
}
