import type {Project} from './project';
import {MAT_VARIANTS,netForArea,type MatVariant} from './surface-finish.ts';

export const MAT_PRODUCT_NET_PER_M2:Record<MatVariant,number>={'standard':167,'standard-plus':233,'premium':333};
export const MAT_PRINT_NET_PER_M2=78;
export const MAT_PRODUCT_NOTES=['Mata wysyłana w całości, gotowa do rozłożenia. Bez podłoża i montażu.','Wysyłkę wyceniamy po podaniu adresu.'];

/**
 * Training mat as a product (owner 15.11.2026): rubber mat with training drills from the Studio printed on it,
 * any size from about 2 m², shipped ready, no concrete and no installation.
 * Prices (owner 15.11.2026, sale prices net per m² of the mat, rounded up to 100 zł):
 * - rubber without installation: Standard 167, Standard+ 233, Premium 333 zł/m²;
 * - printing of the drills: 78 zł/m² of the mat, only when the mat carries drills;
 * - shipping quoted after the address.
 */
/** Owner 16.11.2026: the mat as a standalone product is withdrawn for now. Rubber mats stay a surface finish on concrete
 * (MAT_VARIANTS in surface-finish.ts). The product code stays dormant: hidden on the hub, reachable only with ?all=1. */
export const MAT_PRODUCT_ENABLED=false;
export const MAT_FORMATS:[number,number][]=[[2,1],[2,2],[3,2],[4,3],[5,4]];
export const MAT_LIMITS={min:1,max:10,step:0.5,maxArea:50};
export const MAT_LABEL="Mata treningowa";

export const matArea=(p:Pick<Project,'length'|'width'>)=>Math.round(p.length*p.width*100)/100;
export const matNet=(p:Pick<Project,'length'|'width'|'matVariant'>,variant?:MatVariant)=>netForArea(matArea(p),MAT_PRODUCT_NET_PER_M2[variant||p.matVariant||'standard']);
export const matPrintNet=(p:Pick<Project,'length'|'width'>)=>netForArea(matArea(p),MAT_PRINT_NET_PER_M2);
/** Drills printed on the mat (graphic elements, not equipment). */
export const matDrills=(p:Pick<Project,'objects'>)=>p.objects.filter(o=>o.kind!=='equipment');
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

/* Shop (owner 15.11.2026): ready formats go to the cart as variants of one WooCommerce product, always with the
   drills printed; own sizes go by inquiry. Variant value: "2 × 1 m · Standard". Gross = net × 1,23, whole złote. */
export const MAT_SHOP_SLUG='mata-treningowa';
export const MAT_SHOP_ATTRIBUTE='wariant';
const dim=(v:number)=>String(v).replace('.',',');
export const matShopValue=(l:number,w:number,v:MatVariant)=>`${dim(l)} × ${dim(w)} m · ${MAT_VARIANTS[v].label}`;
export const matGross=(l:number,w:number,v:MatVariant)=>Math.round((matNet({length:l,width:w},v)+matPrintNet({length:l,width:w}))*1.23);
export const matShopVariants=()=>MAT_FORMATS.flatMap(([l,w])=>(Object.keys(MAT_VARIANTS) as MatVariant[]).map(v=>({value:matShopValue(l,w,v),net:matNet({length:l,width:w},v)+matPrintNet({length:l,width:w}),gross:matGross(l,w,v)})));
export const isMatFormat=(l:number,w:number)=>MAT_FORMATS.some(([a,b])=>a===l&&b===w);
