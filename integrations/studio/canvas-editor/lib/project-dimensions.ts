import {modularGeometry,modularPlan} from './studio-modular.ts';
import {arenaGeometry} from './arena-geometry-data.mjs';
import type {Project} from './project';
type GeometryInput=Pick<Project,'length'|'width'|'courtShape'|'diameter'|'arenaModel'|'modular'>;
type Bounds={x:number;z:number;y:number};
type ModelGeometry={area:number;source:string;surfaceBounds:Bounds;constructionBounds:Bounds;sourceRevision:string;sourceFiles:{path:string;sha256:string}[];clearance:null;modulePitch:null};
const models:Record<string,ModelGeometry>=arenaGeometry;
const metres=new Intl.NumberFormat('pl-PL',{maximumFractionDigits:3});
const areas=new Intl.NumberFormat('pl-PL',{maximumFractionDigits:2});
export const formatArea=(area:number)=>`${areas.format(area)} m²`;
export const formatBounds=(bounds:Bounds)=>`${metres.format(Math.max(bounds.x,bounds.z))} × ${metres.format(Math.min(bounds.x,bounds.z))} m`;
export function projectDimensions(p:GeometryInput){
 const plan=modularPlan(p);
 const reference=plan?.dimensions?plan.dimensions.map(v=>metres.format(v)).join(" × ")+" m":p.courtShape==='circle'?`Ø ${metres.format(p.diameter??p.length)} m`:`${metres.format(p.length)} × ${metres.format(p.width)} m`;
 const model=modularGeometry(p)||(p.arenaModel?models[p.arenaModel]:undefined);
 return {reference,model:model||null,area:model?.area??(p.arenaModel?null:p.courtShape==='circle'?Math.PI*(p.diameter??p.length)**2/4:p.length*p.width)};
}
