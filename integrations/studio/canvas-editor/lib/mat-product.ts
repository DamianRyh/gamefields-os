import type {Project} from './project';
import {MAT_VARIANTS,netForArea,type MatVariant} from './surface-finish.ts';

/**
 * Training mat as a product (owner 15.11.2026): rubber mat with training drills from the Studio printed on it,
 * any size from about 2 m², no concrete and no installation. Priced for now from the rubber mats list
 * (MAT_VARIANTS, per m², owner decision "na start cennik mat ze Studio") on the exact mat area. Ordered by inquiry.
 */
export const MAT_FORMATS:[number,number][]=[[2,1],[2,2],[3,2],[4,3],[5,4]];
export const MAT_LIMITS={min:1,max:10,step:0.5,maxArea:50};
export const MAT_LABEL="Mata treningowa";

export const matArea=(p:Pick<Project,'length'|'width'>)=>Math.round(p.length*p.width*100)/100;
export const matNet=(p:Pick<Project,'length'|'width'|'matVariant'>,variant?:MatVariant)=>netForArea(matArea(p),MAT_VARIANTS[variant||p.matVariant||'standard'].netPerM2);
export const validMatSize=(l:number,w:number)=>[l,w].every(v=>v>=MAT_LIMITS.min&&v<=MAT_LIMITS.max&&Math.abs(v*2-Math.round(v*2))<1e-9)&&l*w<=MAT_LIMITS.maxArea;

/** Turn the current project into a new training mat (keeps id and colours, drops construction and patterns). */
export function matProject(v:Project):Project{
 return {...v,matProduct:true,name:`${MAT_LABEL} — mój projekt`,arenaModel:undefined,arenaDesign:undefined,surfaceModel:undefined,modular:undefined,constructionOnly:undefined,
  sport:'Custom Court',courtShape:'rectangle',diameter:undefined,length:3,width:2,surface:'Maty gumowe',concreteBase:false,graphicOpacity:0,lines:false,decorativeLineStyle:undefined,
  base:'#2b2e33',zone:'#2b2e33',outside:'#2b2e33',objects:[],printDesign:undefined,kit:undefined};
}

/** Drills that do not fit on the mat (real size of the element in metres vs the mat, either orientation). */
export function oversizedOnMat(p:Pick<Project,'length'|'width'|'objects'>):{name:string;w:number;h:number}[]{
 return p.objects.filter(o=>o.kind!=='equipment'&&o.asset).map(o=>({name:o.name,w:o.asset!.w,h:o.asset!.h}))
  .filter(a=>!((a.w<=p.length+1e-6&&a.h<=p.width+1e-6)||(a.w<=p.width+1e-6&&a.h<=p.length+1e-6)));
}
