import type {Project} from './project';
type Geometry=Pick<Project,'length'|'width'|'courtShape'|'diameter'>;
export const isRoundCourt=(p:Geometry)=>p.courtShape==='circle';
export const courtArea=(p:Geometry)=>isRoundCourt(p)?Math.PI*(p.diameter??p.length)**2/4:p.length*p.width;
export const courtPerimeter=(p:Geometry)=>isRoundCourt(p)?Math.PI*(p.diameter??p.length):2*(p.length+p.width);
export const courtDimensions=(p:Geometry)=>isRoundCourt(p)?`Ø ${p.diameter??p.length} m`:`${p.length} × ${p.width} m`;
export function clampToCircle(x:number,y:number,radius=300){const dx=x-300,dy=y-300,d=Math.hypot(dx,dy);return d>radius?{x:300+dx*radius/d,y:300+dy*radius/d}:{x,y};}
