"use client";

import {useEffect,useMemo,useRef,useState} from 'react';
import type {Group,WebGLRenderer} from 'three';

type PreviewPart={g:string;p:number[]};
type PreviewFile={version:number;models:Record<string,PreviewPart[]>};
export type FloatingArena={id:string;model:string;label:string};

export function FloatingArenaCarousel({items,selected,onSelect}:{items:FloatingArena[];selected:string;onSelect:(id:string)=>void}){
 const visibleItems=useMemo(()=>items.filter(item=>item.id!==selected),[items,selected]);
 const canvas=useRef<HTMLCanvasElement>(null);
 const [fallback,setFallback]=useState(false);
 const [ready,setReady]=useState(false);
 const [hovered,setHovered]=useState<string|null>(null);
 const selectedRef=useRef(selected),hoverRef=useRef<string|null>(null);
 selectedRef.current=selected;hoverRef.current=hovered;
 useEffect(()=>{
  let disposed=false,frame=0,renderer:WebGLRenderer|undefined,root:Group|undefined;
  const controller=new AbortController();
  async function init(){
   try{
    const [THREE,response]=await Promise.all([import('three'),fetch('/arenas/carousel-models.json',{signal:controller.signal})]);
    if(!response.ok)throw Error('Preview asset unavailable');
    const data=await response.json() as PreviewFile;
    if(disposed||!canvas.current)return;
    renderer=new THREE.WebGLRenderer({canvas:canvas.current,alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(visibleItems.length*196,132,false);
    renderer.setClearColor(0xffffff,0);
    const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-visibleItems.length*1.45,visibleItems.length*1.45,1.08,-1.08,.1,150);
    camera.position.set((visibleItems.length-1)*2.9/2,4.6,11);camera.lookAt((visibleItems.length-1)*2.9/2,0,0);
    root=new THREE.Group();scene.add(root);
    scene.add(new THREE.AmbientLight(0xffffff,2.2));const light=new THREE.DirectionalLight(0xffffff,2.4);light.position.set(-3,8,6);scene.add(light);
    const materials={panels:new THREE.MeshStandardMaterial({color:'#a7b6d1',metalness:.25,roughness:.65,side:THREE.DoubleSide}),frame:new THREE.MeshStandardMaterial({color:'#525769',metalness:.42,roughness:.52,side:THREE.DoubleSide}),goals:new THREE.MeshStandardMaterial({color:'#e4e8ec',metalness:.2,roughness:.6,side:THREE.DoubleSide}),floor:new THREE.MeshStandardMaterial({color:'#c6c9cf',metalness:.04,roughness:1,side:THREE.DoubleSide})};
    const groups:Group[]=[];
    for(const [index,item] of visibleItems.entries()){
     const holder=new THREE.Group(),geometryRoot=new THREE.Group();holder.add(geometryRoot);
     for(const part of data.models[item.model]||[]){
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(part.p,3));g.computeVertexNormals();
      const category=part.g==='panels'?'panels':part.g==='goals'?'goals':part.g==='floor'?'floor':'frame';
      geometryRoot.add(new THREE.Mesh(g,materials[category]));
     }
     const bounds=new THREE.Box3().setFromObject(geometryRoot),size=new THREE.Vector3();bounds.getSize(size);
     const center=new THREE.Vector3();bounds.getCenter(center);
     geometryRoot.position.sub(center);geometryRoot.scale.setScalar(2.75/Math.max(.001,size.x,size.y,size.z));
     holder.position.x=index*2.9;root.add(holder);groups.push(holder);
    }
    setReady(true);
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let last=performance.now();
    const draw=(now:number)=>{
     if(disposed||!renderer)return;
     const dt=Math.min(.06,(now-last)/1000);last=now;
     groups.forEach((group,index)=>{
      const item=visibleItems[index],active=item.id===selectedRef.current,over=item.id===hoverRef.current;
      const target=active?1.18:over?1.1:1;
      const scale=group.scale.x+(target-group.scale.x)*Math.min(1,dt*9);group.scale.setScalar(scale);
      // Keep each court at its original readable angle; only a soft vertical float.
      if(!reduce)group.position.y=Math.sin(now*.0011+index*.75)*.045;
     });
     renderer.render(scene,camera);frame=requestAnimationFrame(draw);
    };
    frame=requestAnimationFrame(draw);
   }catch(error){if(!disposed){setFallback(true);setReady(false);}}
  }
  void init();
  return()=>{disposed=true;controller.abort();cancelAnimationFrame(frame);if(root)root.traverse(object=>{if('geometry'in object)(object as {geometry?:{dispose:()=>void}}).geometry?.dispose()});renderer?.dispose()};
 },[visibleItems]);
 return <div className={'floating-arena-view'+(fallback?' has-fallback':'')} aria-label="Lewitujące modele boisk 3D">
  <canvas ref={canvas} aria-hidden="true" width={visibleItems.length*196} height={132}/>
  <div className="floating-arena-actions" role="group" aria-label="Wybierz konstrukcję">{visibleItems.map(item=><button key={item.id} type="button" aria-label={`Powiększ ${item.label}`} onMouseEnter={()=>setHovered(item.id)} onMouseLeave={()=>setHovered(null)} onFocus={()=>setHovered(item.id)} onBlur={()=>setHovered(null)} onClick={()=>onSelect(item.id)}><span className="floating-arena-name">{item.label}</span>{fallback?<img src={`/arenas/showroom/${item.model}.webp`} alt="" loading="lazy"/>:null}</button>)}</div>
  {!ready&&!fallback?<span className="floating-arena-loading">Wczytujemy miniaturowe modele 3D…</span>:null}
 </div>;
}
