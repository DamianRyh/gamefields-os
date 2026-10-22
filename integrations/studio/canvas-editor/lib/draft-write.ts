import {DRAFT_KEY,parseVaultProject} from './project-vault.ts';
import type {Project} from './project';
export async function persistDraft(storage:Pick<Storage,'getItem'|'setItem'>,expected:string|null,project:Project,backup:(raw:string)=>Promise<void>,current:()=>boolean=()=>true,allowInvalid=false,exclusive?:(run:()=>Promise<string|null>)=>Promise<string|null>){
 const run=async()=>{
 const raw=storage.getItem(DRAFT_KEY);
 if(raw!==expected)throw Error('Szkic zmienił się w innej karcie. Pobierz bieżący projekt lub wybierz, który zapis zachować.');
 const next=JSON.stringify(parseVaultProject(project));
 if(raw===next)return next;
 if(raw!==null){
  let valid=false;try{parseVaultProject(raw);valid=true}catch{if(!allowInvalid)throw Error('Nie można nadpisać nieczytelnego szkicu. Wybierz sposób odzyskania.');}
  if(valid)await backup(raw);
 }
 if(!current())return null;
 if(storage.getItem(DRAFT_KEY)!==raw)throw Error('Szkic zmienił się w innej karcie. Automatyczny zapis został wstrzymany.');
 storage.setItem(DRAFT_KEY,next);return next;
 };
 if(exclusive)return exclusive(run);
 if(typeof navigator!=='undefined'&&navigator.locks)return navigator.locks.request('gamefields-studio-draft-write',run);
 return run();
}
