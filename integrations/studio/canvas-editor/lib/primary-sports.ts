import type {Project} from './project';
export const primarySports=[{id:'teqball',label:'Teqball',surface:'teqball'},{id:'street-football',label:'Street Football',surface:'street-football-3x3'},{id:'panna',label:'Panna',surface:null},{id:'basketball-3x3',label:'Koszykówka 3×3',surface:'basketball-3x3'},{id:'basketball',label:'Koszykówka',surface:'basketball-full'}] as const;
export function primarySport(p:Pick<Project,'surfaceModel'|'arenaModel'|'sport'>){if(p.sport==='Piłka nożna 1×1'&&!p.surfaceModel)return 'panna';return primarySports.find(s=>s.surface===p.surfaceModel)?.id||(p.arenaModel==='street15'?'street-football':null)}
export function requiredSportEquipment(p:{surfaceModel?:string;arenaModel?:string}){
 if(p.surfaceModel==='teqball')return [{name:'Stół Teqball',quantity:1,asset:'teq-table' as const}];
 if(p.surfaceModel==='basketball-3x3')return [{name:'Kosz',quantity:1,asset:'basketball-hoop' as const}];
 if(p.surfaceModel==='basketball-full')return [{name:'Kosz',quantity:2,asset:'basketball-hoop' as const}];
 return [];
}
