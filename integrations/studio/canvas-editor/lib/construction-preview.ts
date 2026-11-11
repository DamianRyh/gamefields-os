import type {Mesh,Appearance} from '../components/renderer';
export const previewArenas=['o1','p1','circle-cage-1','circle-cage-2','octagon','street-field'] as const;
export type PreviewArena=typeof previewArenas[number];
export const previewCoats=['gray','red','blue','green'] as const;
export type PreviewCoat=typeof previewCoats[number];
export function previewSelection(q:URLSearchParams):{arena:PreviewArena;coat:PreviewCoat}{
 const arena=q.get('arena'),coat=q.get('coat');return {arena:previewArenas.includes(arena as PreviewArena)?arena as PreviewArena:'o1',coat:previewCoats.includes(coat as PreviewCoat)?coat as PreviewCoat:'gray'};
}
export function previewPaint(coat:PreviewCoat,arena:string){return ({gray:'#929696',red:arena==='o1'?'#D3152B':'#C81726',blue:'#2469A6',green:'#667451'})[coat];}
export function constructionMeshes(meshes:Mesh[],arena:PreviewArena){return meshes.filter(m=>!['floor','foundation','surface-edge'].includes(m.group)&&!/^floor$|murawa|nawierzchnia|podłoże|podloze/i.test(m.label)).map(m=>({...m,perforated:(arena==='o1'||arena==='p1')&&m.group==='panels'}));}
export function previewAppearance(mesh:Mesh,coat:PreviewCoat,arena:PreviewArena):Appearance{
 const metal=/bolt|fastener|\bM8_/i.test(mesh.id+' '+mesh.label);
 const hardware=/słupek|slupek|slup[-_ ]|post|anchor|bolt|fastener|stopa|foot|\bS1_/i.test(mesh.id+' '+mesh.label);
 return {color:mesh.group==='goals'||metal?'#bec5ca':hardware?'#30363c':previewPaint(coat,arena),finish:mesh.group==='goals'||metal?'metal':'matte',visible:true,text:'',u:.5,v:.5,scale:1,rotation:0};
}
/** A bounded silhouette sample fits curved courts without the empty corners of a box. */
export function previewPoints(meshes:Mesh[]):number[][]{
 const seen=new Set<number[][]>(),points:number[][]=[];
 for(const mesh of meshes){if(seen.has(mesh.v))continue;seen.add(mesh.v);const step=Math.max(1,Math.ceil(mesh.v.length/192));for(let i=0;i<mesh.v.length;i+=step)points.push(mesh.v[i]);if(mesh.v.length)points.push(mesh.v[mesh.v.length-1]);}
 return points;
}
export function fitPreview(points:number[][],yaw:number,pitch:number,aspect:number){
 let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
 for(const p of points){const x=p[0]*cy-p[2]*sy,y=p[1]*cp-(p[0]*sy+p[2]*cy)*sp;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 const scale=Math.min(1672*.86/Math.max(x1-x0,.1),(1672/aspect)*(.86*5/6)/Math.max(y1-y0,.1));
 return {cx:836-(x0+x1)/2*scale,cy:470.5+(y0+y1)/2*scale*941*aspect/1672,scale};
}
/** Keep complete native objects at one goal end; never slice panel geometry. */
export function goalAssembly(meshes:Mesh[]){
 const goals=meshes.filter(m=>m.group==='goals');if(!goals.length)throw Error('Brak panelu bramkowego.');
 const first=goals[0],center=[0,0,0];for(const v of first.v)for(let i=0;i<3;i++)center[i]+=v[i]/first.v.length;
 const axis=Math.abs(center[0])>Math.abs(center[2])?0:2,sign=center[axis]>=0?1:-1;const mouth=first.v.reduce((value,v)=>Math.min(value,v[axis]*sign),Infinity);
 const selected=meshes.filter(m=>m.v.reduce((sum,v)=>sum+v[axis]*sign,0)/m.v.length>=mouth*.82);
 return {meshes:selected,yaw:axis===0?sign*Math.PI/2:sign>0?0:Math.PI,axis,sign};
}

export type PreviewPart='side'|'end'|'net';
/** Isolate existing native objects, retaining their unmodified vertices and faces. */
export function constructionPart(meshes:Mesh[],part:PreviewPart){
 const end=goalAssembly(meshes);
 if(part==='net')return {...end,meshes:end.meshes.filter(m=>m.group==='goals')};
 if(part==='end')return {...end,meshes:end.meshes.filter(m=>m.group!=='goals')};
 const panels=meshes.filter(m=>m.group==='panels'&&!end.meshes.includes(m));
 const candidate=panels.find(m=>/^PO1_0_0|^K1_N_0/.test(m.label))||panels.sort((a,b)=>Math.abs(a.v.reduce((s,v)=>s+v[end.axis],0)/a.v.length)-Math.abs(b.v.reduce((s,v)=>s+v[end.axis],0)/b.v.length))[0];
 if(!candidate)throw Error('Brak panelu bocznego.');
 const prefix=(m:Mesh)=>m.label.replace(/_(frame|sheet).*$/,'').replace(/ (rama|siatka|bramka|wypelnienie|wypełnienie).*$/,'');
 const selected=meshes.filter(m=>prefix(m)===prefix(candidate));
 const center=selected.flatMap(m=>m.v).reduce((s,v)=>[s[0]+v[0],s[1]+v[2]],[0,0]);
 return {meshes:selected,yaw:Math.atan2(center[0],center[1])};
}
