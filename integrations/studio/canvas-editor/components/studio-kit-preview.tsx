"use client";
import {useEffect,useRef,useState} from "react";
import * as THREE from "three";
import {productLighting,productRelief} from '@/lib/product-lighting';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import type {KitDesign,KitPlayer} from "@/lib/kit";
import {KIT_NUMBER_FONT,drawKitTexture} from "@/lib/kit-texture";

/* Original Blender garment. Real neck, sleeve and hem openings; UV artwork comes from Studio. */

function loadLogo(src?:string){
 return new Promise<HTMLImageElement|null>(resolve=>{if(!src){resolve(null);return;}const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=src;});
}

type Scene3D={front:THREE.MeshStandardMaterial;back:THREE.MeshStandardMaterial;side:THREE.MeshStandardMaterial;trim:THREE.MeshStandardMaterial;group:THREE.Group;turnTo:(side:"front"|"back")=>void;dispose:()=>void};

export function StudioKitPreview({kit,player}:{kit:KitDesign;player:KitPlayer}){
 const host=useRef<HTMLDivElement>(null),canvasRef=useRef<HTMLCanvasElement>(null),scene=useRef<Scene3D|null>(null);
 const [touched,setTouched]=useState(false),[failed,setFailed]=useState(false),[modelReady,setModelReady]=useState(false);

 useEffect(()=>{
  const el=host.current,canvas=canvasRef.current;if(!el||!canvas)return;
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});}catch{setFailed(true);return;}
  renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  const sc=new THREE.Scene(),camera=new THREE.PerspectiveCamera(30,1,0.1,100);
  camera.position.set(0,0.2,10.2);
  sc.add(new THREE.HemisphereLight(0xffffff,0xd9d0d6,.7));
  const key=new THREE.DirectionalLight(0xffffff,2);key.position.set(3,4,6);sc.add(key);
  const rim=new THREE.DirectionalLight(0xffffff,.65);rim.position.set(-4,2,-5);sc.add(rim);

  const disposeLighting=productLighting(renderer,sc),fabric=productRelief('fabric');
  const group=new THREE.Group();sc.add(group);
  const mat=()=>new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.82,metalness:0,bumpMap:fabric,bumpScale:.0005,side:THREE.DoubleSide,visible:false});
  const frontMat=mat(),backMat=mat(),side=mat(),trim=mat();side.visible=trim.visible=true;
  let disposed=false;
  const materialSet=new Set<THREE.Material>([frontMat,backMat,side,trim]);
  new GLTFLoader().load('/kits/koszulka-pilkarska.glb',gltf=>{
   if(disposed){gltf.scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())}});return;}
   gltf.scene.traverse(o=>{if(!(o instanceof THREE.Mesh))return;
    const source=Array.isArray(o.material)?o.material:[o.material];
    const mapped=source.map(m=>{const name=m.name;m.dispose();return name==='GF_Print_Front'||name==='GF_Sleeves_Front'?frontMat:name==='GF_Print_Back'||name==='GF_Sleeves_Back'?backMat:name==='GF_Trim'?trim:side});
    o.material=Array.isArray(o.material)?mapped:mapped[0];
   });
   gltf.scene.position.y=-.375;group.add(gltf.scene);group.scale.setScalar(5.2);setModelReady(true);
  },undefined,()=>{if(!disposed)setFailed(true)});

  const shadowCanvas=document.createElement("canvas");shadowCanvas.width=shadowCanvas.height=128;
  const sx=shadowCanvas.getContext("2d");
  if(sx){const gr=sx.createRadialGradient(64,64,4,64,64,64);gr.addColorStop(0,"rgba(71,19,45,.28)");gr.addColorStop(1,"rgba(71,19,45,0)");sx.fillStyle=gr;sx.fillRect(0,0,128,128);}
  const shadowTex=new THREE.CanvasTexture(shadowCanvas);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(3.6,1.1),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=-2.45;sc.add(shadow);

  const resize=()=>{const r=el.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();};
  const ro=new ResizeObserver(resize);ro.observe(el);resize();

  const still=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let drag:{x:number;y:number;ry:number;rx:number}|null=null,idleAt=0,target:number|null=null,frame=0;
  const down=(e:PointerEvent)=>{if((e.target as HTMLElement).closest(".studio-kit-turn"))return;drag={x:e.clientX,y:e.clientY,ry:group.rotation.y,rx:group.rotation.x};target=null;el.setPointerCapture(e.pointerId);setTouched(true);};
  const move=(e:PointerEvent)=>{if(!drag)return;group.rotation.y=drag.ry+(e.clientX-drag.x)*0.01;group.rotation.x=Math.max(-0.35,Math.min(0.35,drag.rx+(e.clientY-drag.y)*0.004));};
  const up=()=>{drag=null;idleAt=performance.now();};
  el.addEventListener("pointerdown",down);el.addEventListener("pointermove",move);el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up);
  group.rotation.y=-0.5;
  const loop=(t:number)=>{
   frame=requestAnimationFrame(loop);
   if(document.hidden)return;
   if(target!==null){group.rotation.y+=(target-group.rotation.y)*0.12;group.rotation.x*=0.9;if(Math.abs(target-group.rotation.y)<0.002)target=null;}
   else if(!drag){if(!still&&t-idleAt>2500)group.rotation.y+=0.0045;group.rotation.x*=0.96;}
   renderer.render(sc,camera);
  };
  frame=requestAnimationFrame(loop);

  scene.current={front:frontMat,back:backMat,side,trim,group,
   turnTo:to=>{const turns=Math.round(group.rotation.y/(Math.PI*2));target=turns*Math.PI*2+(to==="back"?Math.PI:0);idleAt=performance.now();setTouched(true);},
   dispose:()=>{
    disposed=true;disposeLighting();fabric.dispose();cancelAnimationFrame(frame);ro.disconnect();
    el.removeEventListener("pointerdown",down);el.removeEventListener("pointermove",move);el.removeEventListener("pointerup",up);el.removeEventListener("pointercancel",up);
    sc.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materialSet.add(m));}});
    materialSet.forEach(m=>{(m as THREE.MeshStandardMaterial).map?.dispose();m.dispose();});
    renderer.dispose();
   }};
  return ()=>{scene.current?.dispose();scene.current=null;};
 },[]);

 useEffect(()=>{
  let live=true;if(!modelReady)return;
  const fonts=document.fonts?Promise.all([document.fonts.load(`400 40px ${KIT_NUMBER_FONT}`),document.fonts.load("800 40px Inter")]).catch(()=>null):Promise.resolve(null);
  fonts.then(()=>loadLogo(kit.logo)).then(logo=>Promise.all([drawKitTexture(kit,"front",player,logo,1024,true),drawKitTexture(kit,"back",player,logo,1024,true)])).then(([f,b])=>{
   const s=scene.current;if(!live||!s)return;
   /* a new texture per change: three.js keeps GPU storage immutable once a texture is uploaded */
   const put=(m:THREE.MeshStandardMaterial,c:HTMLCanvasElement|null)=>{if(!c)return;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.flipY=false;t.anisotropy=4;const old=m.map;m.map=t;m.visible=true;m.needsUpdate=true;old?.dispose();};
   put(s.front,f);put(s.back,b);
   s.side.color.set(kit.base);s.trim.color.set(kit.detail);
   s.group.scale.set(kit.fit==="kids"?4.7:5.2,kit.fit==="kids"?4.9:5.2,5.2);
   s.group.traverse(o=>{if(o instanceof THREE.Mesh&&o.morphTargetDictionary&&o.morphTargetInfluences){const index=o.morphTargetDictionary.V_Neck;if(index!==undefined)o.morphTargetInfluences[index]=kit.collar==="v"?1:0;}});
  });
  return ()=>{live=false;};
 },[kit,player,modelReady]);

 if(failed)return <div className="studio-kit-3d is-failed" role="status">Podgląd 3D nie jest dostępny w tej przeglądarce. Projekt koszulki zapisuje się normalnie.</div>;
 return <div className={"studio-kit-3d"+(touched?" is-touched":"")} ref={host}>
  <canvas data-model="blender-jersey-v1" data-ready={modelReady&&!failed} ref={canvasRef} role="img" aria-label={`Model 3D koszulki${player.name?`, ${player.name} ${player.number}`:""}. Przeciągnij, aby obrócić.`}/>
  {!modelReady&&<span role="status">Wczytuję koszulkę 3D…</span>}
  <div className="studio-kit-turn" role="group" aria-label="Obrót koszulki">
   <button type="button" onClick={()=>scene.current?.turnTo("front")}>Przód</button>
   <button type="button" onClick={()=>scene.current?.turnTo("back")}>Tył</button>
  </div>
  <span className="studio-kit-hint" aria-hidden="true">Przeciągnij, aby obrócić</span>
 </div>;
}
