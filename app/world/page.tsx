"use client";
import {useEffect,useRef,useState} from "react";
import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {WORLD_COURTS,WORLD_ENVIRONMENTS} from "@/lib/world/catalog";

const variants = [
  {name:"Organic Flow", colors:["#173d34","#b9e168","#ece8df"]},
  {name:"Urban Contrast",colors:["#20252b","#ff7753","#e8e5d9"]},
  {name:"Ocean",colors:["#133e91","#27bcbd","#ffcf4b"]},
];
function paintPattern(index:number){
 const canvas=document.createElement("canvas");canvas.width=1024;canvas.height=768;
 const c=canvas.getContext("2d")!,v=variants[index],w=canvas.width,h=canvas.height;
 c.fillStyle=v.colors[0];c.fillRect(0,0,w,h);
 for(let band=0;band<4;band++){
  c.beginPath();const base=h*(.17+band*.21);
  for(let x=0;x<=w;x+=5){const y=base+Math.sin(x/w*Math.PI*2+band*.9)*h*.075;
    x===0?c.moveTo(x,y):c.lineTo(x,y)}
  for(let x=w;x>=0;x-=5){const y=base+h*.11+Math.sin(x/w*Math.PI*2+band*.9)*h*.075;
    c.lineTo(x,y)}
  c.closePath();c.fillStyle=v.colors[(band%2)+1];c.fill();
 }
 c.strokeStyle="#ffffff";c.lineWidth=7;c.strokeRect(32,32,w-64,h-64);
 c.beginPath();c.moveTo(w/2,32);c.lineTo(w/2,h-32);c.stroke();
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
export default function WorldLab(){
 const host=useRef<HTMLDivElement>(null),api=useRef<{setPattern:(n:number)=>void;setPlace:(p:number)=>void;reset:()=>void}|null>(null);
 const [pattern,setPattern]=useState(0),[place,setPlace]=useState(0),[loaded,setLoaded]=useState("Wczytuję scenę…");
 const [fps,setFps]=useState(0);
 useEffect(()=>{
  const el=host.current;if(!el)return;
  const scene=new THREE.Scene();scene.background=new THREE.Color("#e5e4de");
  const camera=new THREE.PerspectiveCamera(43,1,.1,160);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:"high-performance"});
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<800?1.5:2));
  el.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xffffff,0x7c8f7a,2.3));
  const sun=new THREE.DirectionalLight(0xffffff,2.1);sun.position.set(-9,19,14);scene.add(sun);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(120,120),new THREE.MeshStandardMaterial({color:"#d8d8cc",roughness:1}));
  ground.rotation.x=-Math.PI/2;ground.position.y=-.045;scene.add(ground);
  const courtMaterial=new THREE.MeshStandardMaterial({map:paintPattern(0),roughness:.92,metalness:0,side:THREE.DoubleSide});
  const court=new THREE.Mesh(new THREE.PlaneGeometry(15,10),courtMaterial);
  court.rotation.x=-Math.PI/2;court.position.y=.016;scene.add(court);
  const environment=new THREE.Group();scene.add(environment);
  const modelRoot=new THREE.Group();scene.add(modelRoot);
  // Geometry is real GLB from our repository; do not mutate the production asset.
  const loader=new GLTFLoader();
  let disposed=false;
  loader.load("/products/street-football-15x10/konstrukcja.glb",gltf=>{
    if(disposed)return;
    const model=gltf.scene;
    const bounds=new THREE.Box3().setFromObject(model),size=new THREE.Vector3();bounds.getSize(size);
    if(!Number.isFinite(size.x)||size.length()===0){setLoaded("Model nie ma poprawnej geometrii");return}
    // Keep native proportions; align to the center, do not rescale axes independently.
    const center=bounds.getCenter(new THREE.Vector3());model.position.sub(center);
    modelRoot.add(model);
    setLoaded("Konstrukcja GLB załadowana · model testowy");
  },undefined,()=>setLoaded("Nie udało się wczytać GLB — widoczna jest nawierzchnia testowa"));
  const trunkMat=new THREE.MeshStandardMaterial({color:"#6d685d"}),leafMat=new THREE.MeshStandardMaterial({color:"#5c8364"});
  const treeGeo=new THREE.ConeGeometry(1.15,3.8,7),trunkGeo=new THREE.CylinderGeometry(.12,.18,1.5,6);
  function drawPlace(p:number){environment.clear();if(p===0)return;
    for(let i=0;i<12;i++){
      const x=(i%6-2.5)*4.2,z=(i<6?-9:9);
      const tree=new THREE.Group();
      const trunk=new THREE.Mesh(trunkGeo,trunkMat);trunk.position.y=.75;tree.add(trunk);
      const leaf=new THREE.Mesh(treeGeo,leafMat);leaf.position.y=3.15;tree.add(leaf);
      tree.position.set(x,0,z);environment.add(tree);
    }
    if(p===2)for(let i=0;i<4;i++){
      const building=new THREE.Mesh(new THREE.BoxGeometry(10,8+(i%2)*4,5),new THREE.MeshStandardMaterial({color:i%2?"#c9bcaa":"#e8e0d5"}));
      building.position.set((i-1.5)*12,4+(i%2)*2,-20);environment.add(building);
    }
  }
  let yaw=-.65,pitch=.66,distance=27,drag=false,lastX=0,lastY=0,dirty=true,raf=0,observed=0,last=performance.now(),count=0;
  const updateCamera=()=>{camera.position.set(Math.sin(yaw)*Math.cos(pitch)*distance,Math.sin(pitch)*distance,Math.cos(yaw)*Math.cos(pitch)*distance);camera.lookAt(0,0,0);dirty=true};
  updateCamera();
  const down=(e:PointerEvent)=>{drag=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)};
  const move=(e:PointerEvent)=>{if(!drag)return;yaw-=(e.clientX-lastX)*.006;pitch=Math.max(.19,Math.min(1.35,pitch+(e.clientY-lastY)*.006));lastX=e.clientX;lastY=e.clientY;updateCamera()};
  const up=()=>drag=false;
  const wheel=(e:WheelEvent)=>{e.preventDefault();distance=Math.max(16,Math.min(47,distance+e.deltaY*.025));updateCamera()};
  const resize=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();dirty=true};
  const ro=new ResizeObserver(resize);ro.observe(el);
  const pointer=renderer.domElement;pointer.style.touchAction="none";
  pointer.addEventListener("pointerdown",down);pointer.addEventListener("pointermove",move);pointer.addEventListener("pointerup",up);pointer.addEventListener("wheel",wheel,{passive:false});
  api.current={setPattern:n=>{courtMaterial.map?.dispose();courtMaterial.map=paintPattern(n);courtMaterial.needsUpdate=true;dirty=true},setPlace:n=>{drawPlace(n);dirty=true},reset:()=>{yaw=-.65;pitch=.66;distance=27;updateCamera()}};
  function frame(now:number){if(disposed)return;raf=requestAnimationFrame(frame);if(dirty){renderer.render(scene,camera);dirty=false;count++}
    if(now-last>1000){observed=count*1000/(now-last);last=now;count=0;if(observed>0)setFps(Math.round(observed))}}
  raf=requestAnimationFrame(frame);resize();
  return()=>{disposed=true;cancelAnimationFrame(raf);ro.disconnect();pointer.removeEventListener("pointerdown",down);pointer.removeEventListener("pointermove",move);pointer.removeEventListener("pointerup",up);pointer.removeEventListener("wheel",wheel);courtMaterial.map?.dispose();courtMaterial.dispose();court.geometry.dispose();ground.geometry.dispose();renderer.dispose();pointer.remove();api.current=null};
 },[]);
 return <main style={{position:"relative",height:"100dvh",background:"#e5e4de",overflow:"hidden",fontFamily:"system-ui"}}>
   <div ref={host} style={{position:"absolute",inset:0}} aria-label="Interaktywny świat 3D GAMEFIELDS"/>
   <header style={{position:"absolute",top:0,left:0,right:0,padding:"18px 4%",display:"flex",justifyContent:"space-between",alignItems:"center",pointerEvents:"none"}}>
     <strong style={{letterSpacing:".14em",fontSize:15}}>GAMEFIELDS / WORLD LAB</strong>
     <a href="/studio" style={{pointerEvents:"auto",background:"white",borderRadius:30,padding:"12px 17px",color:"#231c2b",textDecoration:"none"}}>Obecne Studio ↗</a>
   </header>
   <div style={{position:"absolute",left:"4%",bottom:20,right:"4%",maxWidth:640,padding:"20px",borderRadius:25,background:"#fffdf4e8",backdropFilter:"blur(18px)"}}>
     <h1 style={{fontSize:"clamp(22px,4vw,38px)",margin:"0 0 5px"}}>Zaprojektuj swój świat.</h1>
     <p style={{margin:"0 0 13px",fontSize:13}}>{loaded}. Obróć boisko palcem lub myszą.</p>
     <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
       {variants.map((v,i)=><button key={v.name} onClick={()=>{setPattern(i);api.current?.setPattern(i)}} style={{border:pattern===i?"2px solid #5a3aff":"1px solid #aaa",borderRadius:16,padding:"12px 15px",background:v.colors[0],color:"white"}}>{v.name}</button>)}
       <button onClick={()=>{const n=(place+1)%3;setPlace(n);api.current?.setPlace(n)}} style={{border:0,borderRadius:16,padding:"12px",background:"#eae5ff"}}>Miejsce: {WORLD_ENVIRONMENTS[place].name}</button>
       <button onClick={()=>api.current?.reset()} style={{border:0,borderRadius:16,padding:"12px",background:"#eee"}}>Reset widoku</button>
     </div>
     <small style={{display:"block",marginTop:10,opacity:.7}}>Eksperyment · {WORLD_COURTS[0].name} · {fps} renderów/s (renderowanie na żądanie, nie FPS animacji)</small>
   </div>
 </main>
}
