import {nextProjectName} from './studio-ux.mjs';
import {getSportProfile} from './sport-profiles.ts';
import catalog from '../public/sport-surfaces/catalog.json' with {type:'json'};
import manifest from '../public/sport-surfaces/manifest.json' with {type:'json'};
import type {Project} from './project';
export const surfaceIds=['street-football-3x3','basketball-3x3','basketball-full','tennis','padel','volleyball','pickleball','futsal'] as const;
export type SurfaceModel=typeof surfaceIds[number];
export const sportSurfaces=catalog.items;
export const sportSurface=(id?:string)=>sportSurfaces.find(s=>s.id===id);
export function selectSurface(p:Project,id:SurfaceModel):Partial<Project>{const s=sportSurface(id)!;return {name:nextProjectName(p.name,sportSurface(p.surfaceModel)?.name||getSportProfile(p.sport,p.arenaModel).label,s.name),surfaceModel:id,arenaModel:undefined,arenaDesign:undefined,modular:undefined,lines:true,sport:s.sport,length:s.length,width:s.width,courtShape:'rectangle',diameter:undefined,surface:s.material,base:s.base,zone:s.zone};}
export function surfaceGeometry(id:SurfaceModel){const s=sportSurface(id)!,m=manifest.models.find(m=>m.id===id)!;return {area:s.length*s.width,source:'Niezależny model nawierzchni Blender · 20 cm',surfaceBounds:{x:s.length,z:s.width,y:.2},constructionBounds:{x:0,z:0,y:0},sourceRevision:m.files.json,sourceFiles:[{path:`public/sport-surfaces/${id}.json`,sha256:m.files.json}],clearance:null,modulePitch:null};}
