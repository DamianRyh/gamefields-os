import type {Project} from './project';
type Geometry=Pick<Project,'length'|'width'|'courtShape'|'diameter'>;
export const isRoundCourt=(p:Geometry)=>p.courtShape==='circle';
export const courtArea=(p:Geometry)=>isRoundCourt(p)?Math.PI*(p.diameter??p.length)**2/4:p.length*p.width;
export const courtPerimeter=(p:Geometry)=>isRoundCourt(p)?Math.PI*(p.diameter??p.length):2*(p.length+p.width);
export const courtDimensions=(p:Geometry)=>isRoundCourt(p)?`Ø ${p.diameter??p.length} m`:`${p.length} × ${p.width} m`;
export function clampToCircle(x:number,y:number,radius=300){const dx=x-300,dy=y-300,d=Math.hypot(dx,dy);return d>radius?{x:300+dx*radius/d,y:300+dy*radius/d}:{x,y};}
export function roundBandPosition(o:Pick<import('./project').EditorObject,'target'|'x'|'y'>){
 const t=Math.max(0,Math.min(1,(o.target==='band-left'||o.target==='band-right'?o.y:o.x)/600));
 const angle=o.target==='band-top'?-Math.PI+Math.PI*t:o.target==='band-bottom'?Math.PI-Math.PI*t:o.target==='band-left'?Math.PI/2+Math.PI*t:-Math.PI/2+Math.PI*t;
 return {x:300+322*Math.cos(angle),y:300+322*Math.sin(angle),rotation:angle*180/Math.PI+(o.target==='band-bottom'?-90:90)};
}
