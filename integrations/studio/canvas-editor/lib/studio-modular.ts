import {assemble} from './studio-modular-engine.mjs';
import type {Project,StudioModules} from './project';
import bounds from './studio-modular-sources.json' with {type:'json'};
export const modularDefaults:StudioModules={revision:'GF-STUDIO-MODULAR-2',long:4,short:3,goals:2,entries:1,levels:1};
export const modularFamily=(model?:string)=>model?.startsWith('circle-cage')?'circle-cage':['street-field','octagon'].includes(model||'')?model:null;
export function modularPlan(p:Pick<Project,'arenaModel'|'modular'>){
 if(!p.modular)return null;const family=modularFamily(p.arenaModel);
 if(!family||p.modular.revision!=='GF-STUDIO-MODULAR-2'||p.modular.levels!==(p.arenaModel==='circle-cage-2'?2:1))throw Error('Niezgodna rodzina lub rewizja układu modułowego.');
 return assemble({...p.modular,family,mode:'assembly'});
}

export function modularGeometry(p:Pick<Project,'arenaModel'|'modular'>){
 const plan=modularPlan(p);if(!plan?.floor)return null;const f=plan.floor;
 const size=f.kind==='rectangle'?{x:f.x!,z:f.z!}: {x:2*f.radius!*(f.kind==='octagon'?Math.cos(Math.PI/8):1),z:2*f.radius!*(f.kind==='octagon'?Math.cos(Math.PI/8):1)};
 const area=f.kind==='rectangle'?f.x!*f.z!:f.kind==='circle'?Math.PI*f.radius!**2:4*Math.sin(Math.PI/4)*f.radius!**2;
 const vertices=plan.instances.flatMap(i=>{const b=bounds.parts[i.asset as keyof typeof bounds.parts],c=Math.cos(i.rotationY),s=Math.sin(i.rotationY);return b.min.flatMap((_,axis)=>axis?[]:[0,1].flatMap(x=>[0,1].flatMap(y=>[0,1].map(z=>{const a=[x?b.max[0]:b.min[0],y?b.max[1]:b.min[1],z?b.max[2]:b.min[2]];return [c*a[0]+s*a[2]+i.position[0],a[1]+i.position[1],-s*a[0]+c*a[2]+i.position[2]]}))))});
 const extent=(axis:number)=>Math.max(...vertices.map(v=>v[axis]))-Math.min(...vertices.map(v=>v[axis]));
 return {area,source:'Moduły Blender / Studio v2',surfaceBounds:{...size,y:.2},constructionBounds:{x:extent(0),y:extent(1),z:extent(2)},sourceRevision:bounds.revision,sourceFiles:[],clearance:null,modulePitch:null};
}
