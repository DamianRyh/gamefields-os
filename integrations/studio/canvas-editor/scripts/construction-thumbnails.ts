import {Renderer,type Mesh} from '../components/renderer';
import {orbitBounds,orbitPlacement} from '../lib/arena-orbit';
import o1 from '../components/assets-blender/o1.json';
import p1 from '../components/assets-blender/p1.json';
const canvas=document.querySelector('canvas')!;
(window as any).renderCatalogThumbnail=async(model:string)=>{
 const raw:Mesh[]=model==='o1'?o1 as Mesh[]:model==='p1'?p1 as Mesh[]:await(await fetch('/arenas/'+model+'.json')).json();
 const meshes=raw.filter(m=>m.group!=='floor').map(m=>({...m,perforated:['o1','p1'].includes(model)&&m.group==='panels'}));
 const renderer=new Renderer(canvas,meshes);renderer.yaw=-.55;renderer.pitch=.365;renderer.placement=orbitPlacement(orbitBounds(meshes),renderer.yaw,renderer.pitch,640/400);
 renderer.appearances=Object.fromEntries(meshes.map(m=>[m.id,{color:m.group==='panels'?'#b90f35':m.group==='foundation'?'#59605c':'#30363c',finish:'matte',visible:true,text:'',u:.5,v:.5,scale:1,rotation:0}]));renderer.draw();
 const image=canvas.toDataURL('image/webp',.92);renderer.dispose();return {image,meshCount:meshes.length};
};
