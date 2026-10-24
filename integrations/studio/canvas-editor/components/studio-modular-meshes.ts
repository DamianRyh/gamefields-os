import {modularPlan} from '@/lib/studio-modular';
import type {Project} from '@/lib/project';
import {loadArenaGlb} from './glb-arena';
import type {Mesh} from './renderer';
import {classifyCirclePanelFace} from '@/lib/circle-panel-sides';
export function modularFloor(f:{kind:string;x?:number;z?:number;radius?:number}):Mesh{
 const points=f.kind==='rectangle'?[[-f.x!/2,-f.z!/2],[f.x!/2,-f.z!/2],[f.x!/2,f.z!/2],[-f.x!/2,f.z!/2]]:Array.from({length:f.kind==='circle'?96:8},(_,i)=>{const a=i*2*Math.PI/(f.kind==='circle'?96:8)+(f.kind==='circle'?0:Math.PI/8);return [f.radius!*Math.cos(a),f.radius!*Math.sin(a)]});
 const v:number[][]=[],faces:number[][]=[],uv:number[][]=[],normals:number[][]=[];const sx=Math.max(...points.map(p=>Math.abs(p[0])))*2,sz=Math.max(...points.map(p=>Math.abs(p[1])))*2;
 const tri=(a:number[],b:number[],c:number[],n:number[])=>{const start=v.length;for(const p of [a,b,c]){v.push(p);uv.push([p[0]/sx+.5,p[2]/sz+.5]);normals.push(n)}faces.push([start,start+1,start+2])};
 points.forEach((a,i)=>{const b=points[(i+1)%points.length],a0=[a[0],0,a[1]],b0=[b[0],0,b[1]],a1=[a[0],-.2,a[1]],b1=[b[0],-.2,b[1]],n=[a[0]+b[0],0,a[1]+b[1]],l=Math.hypot(...n);tri([0,0,0],b0,a0,[0,1,0]);tri([0,-.2,0],a1,b1,[0,-1,0]);tri(a0,b0,b1,n.map(x=>x/l));tri(a0,b1,a1,n.map(x=>x/l))});
 return {id:'floor',label:'Nawierzchnia modułowa 20 cm',group:'floor',v,f:faces,uv,normals,artwork:false};
}
export async function loadStudioModular(project:Project,signal:AbortSignal):Promise<Mesh[]>{
 const plan=modularPlan(project);if(!plan)return [];
 const assets=[...new Set(plan.instances.map(i=>i.asset))];const templates=new Map(await Promise.all(assets.map(async asset=>[asset,await loadArenaGlb('/modular/assets/'+asset+'.glb',signal)] as const)));
 const meshes=plan.instances.flatMap(i=>templates.get(i.asset)!.map(m=>{const c=Math.cos(i.rotationY),s=Math.sin(i.rotationY),rotate=(p:number[])=>[c*p[0]+s*p[2],p[1],-s*p[0]+c*p[2]];const panel=/wypelnienie|siatka|blacha/i.test(m.label),goal=/bramka|^BR\d/i.test(m.label);return {...m,id:i.id+'-'+m.id,group:goal?'goals':panel?'panels':'frame',artwork:panel,v:m.v.map(p=>rotate(p).map((x,k)=>x+i.position[k])),normals:m.normals?.map(rotate)}}));
 const sided=meshes.flatMap(m=>m.group!=='panels'?[m]:(['inner','outer','edge'] as const).flatMap(side=>{const f=m.f.filter(face=>{try{return classifyCirclePanelFace(m,face)===side}catch{return side==='edge'}});return f.length?[{...m,id:m.id+'-'+side,f,artwork:side!=='edge'}]:[]}));
 return plan.floor?[...sided,modularFloor(plan.floor)]:sided;
}
