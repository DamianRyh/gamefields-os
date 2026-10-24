"use client";

import {useEffect,useId,useMemo,useRef,useState} from "react";
import type {Project} from "@/lib/project";
import {PatternArt} from "@/components/pattern-art";
import {SurfaceAppearance} from "@/components/surface-material";
import {isTurf,surfaceLabel} from "@/lib/surface-materials";
import {getPatternFamily,getPatternPalette} from "@/lib/pattern-library";

const SCENE_WIDTH=1672;
const SCENE_HEIGHT=941;
const PIXELS_PER_METER=40;

const COURT_GEOMETRY={
 length:15,
 width:10,
 lineWidth:.075,
 lineInset:.25,
 centerCircleRadius:1.2,
 goalAreaDepth:2.25,
 goalAreaWidth:5,
 goalWidth:3,
 goalDepth:.6
} as const;
const COURT_WIDTH=COURT_GEOMETRY.length*PIXELS_PER_METER;
const COURT_HEIGHT=COURT_GEOMETRY.width*PIXELS_PER_METER;

type Point={x:number;y:number};
type Homography=[number,number,number,number,number,number,number,number,number];
type RealisticView="perspective"|"aerial"|"ground";
import {REALISTIC_LOCATIONS,type RealisticLocation} from "@/lib/realistic-locations";
export {REALISTIC_LOCATIONS,type RealisticLocation} from "@/lib/realistic-locations";
type SceneConfig={src:string;quad:[Point,Point,Point,Point];label:string;goalHeights:[number,number];lighting:[number,number]};

// Each clean plate is calibrated against the four corners of its 15 × 10 m surface.
const VIEW_CONFIGS:Record<RealisticView,Omit<SceneConfig,"src">>={
 perspective:{
  quad:[{x:282,y:462},{x:976,y:228},{x:1435,y:462},{x:628,y:842}],
  label:"widok realistyczny boczny",
  goalHeights:[70,54],
  lighting:[.07,.13]
 },
 aerial:{
  quad:[{x:535,y:258},{x:1141,y:258},{x:1141,y:662},{x:535,y:662}],
  label:"centralny widok z lotu ptaka",
  goalHeights:[16,16],
  lighting:[.04,.08]
 },
 ground:{
  quad:[{x:47,y:454},{x:957,y:335},{x:1651,y:413},{x:733,y:823}],
  label:"widok z boiska na wysokości człowieka",
  goalHeights:[88,65],
  lighting:[.08,.15]
 }
};

const WARSAW_PKiN_VIEWS:Record<RealisticView,Omit<SceneConfig,"src">>={
 perspective:{
  // Elevated side camera, matching the school/park framing; measured on the v2 plate.
  quad:[{x:285,y:466},{x:970,y:259},{x:1434,y:463},{x:633,y:840}],
  label:"widok realistyczny boczny przy Pałacu Kultury i Nauki",
  goalHeights:[70,54],
  lighting:[.055,.1]
 },
 aerial:{
  quad:[{x:640,y:336},{x:1032,y:336},{x:1032,y:596},{x:640,y:596}],
  label:"centralny widok mapowy przy Pałacu Kultury i Nauki",
  goalHeights:[15,15],
  lighting:[.035,.07]
 },
 ground:{
  quad:[{x:96,y:562},{x:928,y:498},{x:1556,y:556},{x:764,y:852}],
  label:"widok z boiska przy Pałacu Kultury i Nauki",
  goalHeights:[90,66],
  lighting:[.06,.11]
 }
};

const KRAKOW_RYNEK_VIEWS:Record<RealisticView,Omit<SceneConfig,"src">>={
 perspective:{...VIEW_CONFIGS.perspective,quad:[{x:285,y:467},{x:970,y:261},{x:1434,y:463},{x:632,y:840}]},
 // Keep the actual projected surface exactly 3:2; it fully covers the blank plate.
 aerial:{...VIEW_CONFIGS.aerial,quad:[{x:639,y:327},{x:1065,y:327},{x:1065,y:611},{x:639,y:611}]},
 ground:{...WARSAW_PKiN_VIEWS.ground,label:"widok z boiska przy Rynku Głównym w Krakowie",quad:[{x:90,y:566},{x:829,y:518},{x:1583,y:577},{x:737,y:842}]}
};

const LOCATION_ASSETS:Record<RealisticLocation,Record<RealisticView,string>>={
 park:{
  perspective:"/studio/street-football-3x3-green-screen-clean.png",
  aerial:"/studio/street-football-3x3-aerial-green-screen-clean-v2.png",
  ground:"/studio/street-football-3x3-ground-green-screen-clean.png"
 },
 school:{
  perspective:"/studio/street-football-3x3-school-perspective-green-screen.png",
  aerial:"/studio/street-football-3x3-school-aerial-green-screen.png",
  ground:"/studio/street-football-3x3-school-ground-green-screen.png"
 },
 courtyard:{
  perspective:"/studio/street-football-3x3-courtyard-perspective-green-screen.png",
  aerial:"/studio/street-football-3x3-courtyard-aerial-green-screen.png",
  ground:"/studio/street-football-3x3-courtyard-ground-green-screen.png"
 },
 "warsaw-pkin":{
  perspective:"/studio/street-football-3x3-warsaw-pkin-perspective-green-screen-v2.png",
  aerial:"/studio/street-football-3x3-warsaw-pkin-aerial-green-screen.png",
  ground:"/studio/street-football-3x3-warsaw-pkin-ground-green-screen.png"
 },
 "krakow-rynek":{
  perspective:"/studio/street-football-3x3-krakow-rynek-perspective-green-screen.png",
  aerial:"/studio/street-football-3x3-krakow-rynek-aerial-green-screen.png",
  ground:"/studio/street-football-3x3-krakow-rynek-ground-green-screen.png"
 }
};

const LOCATION_LABELS:Record<RealisticLocation,string>={park:"Park",school:"Szkoła",courtyard:"Podwórko","warsaw-pkin":"Warszawa · PKiN","krakow-rynek":"Kraków · Rynek Główny"};

function solveLinearSystem(matrix:number[][],values:number[]){
 const size=values.length;
 const rows=matrix.map((row,index)=>[...row,values[index]]);
 for(let column=0;column<size;column++){
  let pivot=column;
  for(let row=column+1;row<size;row++)if(Math.abs(rows[row][column])>Math.abs(rows[pivot][column]))pivot=row;
  [rows[column],rows[pivot]]=[rows[pivot],rows[column]];
  const divisor=rows[column][column];
  if(Math.abs(divisor)<1e-10)throw new Error("Nie można skalibrować perspektywy boiska.");
  for(let index=column;index<=size;index++)rows[column][index]/=divisor;
  for(let row=0;row<size;row++)if(row!==column){
   const factor=rows[row][column];
   for(let index=column;index<=size;index++)rows[row][index]-=factor*rows[column][index];
  }
 }
 return rows.map(row=>row[size]);
}

function createHomography(quad:SceneConfig["quad"]):Homography{
 const source:[Point,Point,Point,Point]=[{x:0,y:0},{x:COURT_WIDTH,y:0},{x:COURT_WIDTH,y:COURT_HEIGHT},{x:0,y:COURT_HEIGHT}];
 const matrix:number[][]=[],values:number[]=[];
 source.forEach((point,index)=>{
  const target=quad[index],{x,y}=point;
  matrix.push([x,y,1,0,0,0,-target.x*x,-target.x*y]);values.push(target.x);
  matrix.push([0,0,0,x,y,1,-target.y*x,-target.y*y]);values.push(target.y);
 });
 const solution=solveLinearSystem(matrix,values);
 return [...solution,1] as Homography;
}

function projectPoint(homography:Homography,point:Point){
 const denominator=homography[6]*point.x+homography[7]*point.y+homography[8];
 return {
  x:(homography[0]*point.x+homography[1]*point.y+homography[2])/denominator,
  y:(homography[3]*point.x+homography[4]*point.y+homography[5])/denominator
 };
}

// Offset clipping edges, not texture coordinates: adjacent mesh triangles overlap
// by one scene pixel instead of exposing the chroma plate through antialias seams.
function expandClip(points:Point[],padding:number){
 const area=points.reduce((sum,p,index)=>{const q=points[(index+1)%points.length];return sum+p.x*q.y-q.x*p.y},0);
 const normals=points.map((p,index)=>{const q=points[(index+1)%points.length],dx=q.x-p.x,dy=q.y-p.y,length=Math.hypot(dx,dy),sign=area>0?1:-1;return {x:sign*dy/length,y:-sign*dx/length}});
 return points.map((p,index)=>{const a=normals[(index+points.length-1)%points.length],b=normals[index],factor=padding/(1+a.x*b.x+a.y*b.y);return {x:p.x+(a.x+b.x)*factor,y:p.y+(a.y+b.y)*factor}});
}

function drawTriangle(ctx:CanvasRenderingContext2D,image:CanvasImageSource,source:[Point,Point,Point],target:[Point,Point,Point]){
 const[s0,s1,s2]=source,[d0,d1,d2]=target;
 const denominator=s0.x*(s1.y-s2.y)+s1.x*(s2.y-s0.y)+s2.x*(s0.y-s1.y);
 if(!denominator)return;
 const a=(d0.x*(s1.y-s2.y)+d1.x*(s2.y-s0.y)+d2.x*(s0.y-s1.y))/denominator;
 const b=(d0.y*(s1.y-s2.y)+d1.y*(s2.y-s0.y)+d2.y*(s0.y-s1.y))/denominator;
 const c=(d0.x*(s2.x-s1.x)+d1.x*(s0.x-s2.x)+d2.x*(s1.x-s0.x))/denominator;
 const d=(d0.y*(s2.x-s1.x)+d1.y*(s0.x-s2.x)+d2.y*(s1.x-s0.x))/denominator;
 const e=(d0.x*(s1.x*s2.y-s2.x*s1.y)+d1.x*(s2.x*s0.y-s0.x*s2.y)+d2.x*(s0.x*s1.y-s1.x*s0.y))/denominator;
 const f=(d0.y*(s1.x*s2.y-s2.x*s1.y)+d1.y*(s2.x*s0.y-s0.x*s2.y)+d2.y*(s0.x*s1.y-s1.x*s0.y))/denominator;
 ctx.save();
 ctx.beginPath();expandClip(target,1).forEach((point,index)=>index?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y));ctx.closePath();ctx.clip();
 ctx.setTransform(a,b,c,d,e,f);
 ctx.drawImage(image,0,0);
 ctx.restore();
}

function projectTexture(ctx:CanvasRenderingContext2D,image:CanvasImageSource,homography:Homography,baseColor:string){
 const boundary=[{x:0,y:0},{x:COURT_WIDTH,y:0},{x:COURT_WIDTH,y:COURT_HEIGHT},{x:0,y:COURT_HEIGHT}].map(point=>projectPoint(homography,point));
 ctx.save();ctx.beginPath();expandClip(boundary,1).forEach((point,index)=>index?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y));ctx.closePath();ctx.clip();
 ctx.fillStyle=baseColor;ctx.fillRect(0,0,SCENE_WIDTH,SCENE_HEIGHT);
 const columns=32,rows=24;
 for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){
  const u0=column/columns,u1=(column+1)/columns,v0=row/rows,v1=(row+1)/rows;
  const s00={x:u0*COURT_WIDTH,y:v0*COURT_HEIGHT},s10={x:u1*COURT_WIDTH,y:v0*COURT_HEIGHT};
  const s11={x:u1*COURT_WIDTH,y:v1*COURT_HEIGHT},s01={x:u0*COURT_WIDTH,y:v1*COURT_HEIGHT};
  const d00=projectPoint(homography,s00),d10=projectPoint(homography,s10),d11=projectPoint(homography,s11),d01=projectPoint(homography,s01);
  drawTriangle(ctx,image,[s00,s10,s11],[d00,d10,d11]);
  drawTriangle(ctx,image,[s00,s11,s01],[d00,d11,d01]);
 }
 ctx.restore();
}

function integrateSurfaceLighting(ctx:CanvasRenderingContext2D,scene:SceneConfig){
 const[topLight,bottomShade]=scene.lighting;
 ctx.save();
 ctx.beginPath();scene.quad.forEach((point,index)=>index?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y));ctx.closePath();ctx.clip();
 const gradient=ctx.createLinearGradient(SCENE_WIDTH*.25,SCENE_HEIGHT*.18,SCENE_WIDTH*.72,SCENE_HEIGHT*.88);
 gradient.addColorStop(0,`rgba(255,245,214,${topLight})`);
 gradient.addColorStop(.48,"rgba(255,255,255,0)");
 gradient.addColorStop(1,`rgba(20,43,35,${bottomShade})`);
 ctx.globalCompositeOperation="soft-light";ctx.fillStyle=gradient;ctx.fillRect(0,0,SCENE_WIDTH,SCENE_HEIGHT);
 ctx.restore();
}

function path(points:Point[]){return points.map((point,index)=>`${index?"L":"M"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");}

function GoalOverlay({scene,homography}:{scene:SceneConfig;homography:Homography}){
 const goalWidth=COURT_GEOMETRY.goalWidth*PIXELS_PER_METER;
 const depth=COURT_GEOMETRY.goalDepth*PIXELS_PER_METER;
 const y1=(COURT_HEIGHT-goalWidth)/2,y2=(COURT_HEIGHT+goalWidth)/2;
 return <svg className="realistic-goals" viewBox={`0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs><filter id="goal-shadow" x="-30%" y="-30%" width="180%" height="180%"><feGaussianBlur stdDeviation="7"/></filter></defs>
  {(["left","right"] as const).map((side,index)=>{
   const frontX=side==="left"?0:COURT_WIDTH,backX=side==="left"?-depth:COURT_WIDTH+depth;
   const frontA=projectPoint(homography,{x:frontX,y:y1}),frontB=projectPoint(homography,{x:frontX,y:y2});
   const backA=projectPoint(homography,{x:backX,y:y1}),backB=projectPoint(homography,{x:backX,y:y2});
   const height=scene.goalHeights[index],rearHeight=height*.72;
   const topA={x:frontA.x,y:frontA.y-height},topB={x:frontB.x,y:frontB.y-height};
   const rearTopA={x:backA.x,y:backA.y-rearHeight},rearTopB={x:backB.x,y:backB.y-rearHeight};
   const shadowOffset={x:18,y:13};
   return <g key={side}>
    <path className="goal-shadow" d={`${path([frontA,frontB,backB,backA])} Z`} transform={`translate(${shadowOffset.x} ${shadowOffset.y})`}/>
    <g className="goal-net">
     <path d={path([topA,topB,rearTopB,rearTopA,topA])}/>
     <path d={path([frontA,backA,rearTopA])}/><path d={path([frontB,backB,rearTopB])}/>
     <path d={path([{x:(topA.x+topB.x)/2,y:(topA.y+topB.y)/2},{x:(rearTopA.x+rearTopB.x)/2,y:(rearTopA.y+rearTopB.y)/2}])}/>
     <path d={path([{x:(frontA.x+backA.x)/2,y:(frontA.y+backA.y)/2},{x:(topA.x+rearTopA.x)/2,y:(topA.y+rearTopA.y)/2}])}/>
     <path d={path([{x:(frontB.x+backB.x)/2,y:(frontB.y+backB.y)/2},{x:(topB.x+rearTopB.x)/2,y:(topB.y+rearTopB.y)/2}])}/>
    </g>
    <g className="goal-frame"><path d={path([frontA,topA,topB,frontB])}/><path d={path([topA,rearTopA,rearTopB,topB])}/><path d={path([rearTopA,backA])}/><path d={path([rearTopB,backB])}/></g>
   </g>;
  })}
 </svg>;
}

function SurfaceObjects({p}:{p:Project}){
 return <>{p.objects.filter(object=>object.target==="court"&&object.kind!=="equipment").map(object=>{
  const transform=`translate(${object.x} ${object.y}) rotate(${object.rotation}) scale(${object.scale/100})`;
  if(object.kind==="image"&&object.src)return <image key={object.id} href={object.src} x="-55" y="-55" width="110" height="110" preserveAspectRatio="xMidYMid meet" transform={transform} opacity={object.opacity/100}/>;
  if(object.kind==="text")return <text key={object.id} x={object.x} y={object.y} fill={object.color} fontSize="34" fontWeight="800" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${object.rotation} ${object.x} ${object.y})`} opacity={object.opacity/100}>{object.text||"TWÓJ TEKST"}</text>;
  if(object.kind==="sponsor")return <g key={object.id} transform={transform} opacity={object.opacity/100}><rect x="-58" y="-22" width="116" height="44" rx="5" fill="#18221f" stroke={object.color} strokeWidth="2"/><text textAnchor="middle" dominantBaseline="middle" fill={object.color} fontSize="17" fontWeight="900">{object.text||object.name}</text></g>;
  return null;
 })}</>;
}

// Bound decoded-photo memory; do not fetch scenes that the visitor has not selected.
const sceneImages=new Map<string,Promise<HTMLImageElement>>();
function loadScene(src:string){
 const cached=sceneImages.get(src);
 if(cached){sceneImages.delete(src);sceneImages.set(src,cached);return cached}
 const image=new Image();image.decoding="async";
 const promise=new Promise<HTMLImageElement>((resolve,reject)=>{image.onload=()=>resolve(image);image.onerror=()=>{sceneImages.delete(src);reject(new Error("Scene unavailable"))}});
 sceneImages.set(src,promise);image.src=src;
 while(sceneImages.size>3)sceneImages.delete(sceneImages.keys().next().value!);
 return promise;
}

export function StreetFootballRealisticPreview({project,view="perspective",location="park",studio=false}:{project:Project;view?:RealisticView;location?:RealisticLocation;studio?:boolean}){
 const canvasRef=useRef<HTMLCanvasElement>(null);
 const textureRef=useRef<SVGSVGElement>(null);
 const [readySignature,setReadySignature]=useState("");
 const [failedSignature,setFailedSignature]=useState(""),[retry,setRetry]=useState(0);
 const textureId=useId().replace(/:/g,"");
 const sceneConfig=useMemo<SceneConfig>(()=>({...(location==="warsaw-pkin"?WARSAW_PKiN_VIEWS[view]:location==="krakow-rynek"?KRAKOW_RYNEK_VIEWS[view]:VIEW_CONFIGS[view]),src:LOCATION_ASSETS[location][view]}),[location,view]);
 const homography=useMemo(()=>createHomography(sceneConfig.quad),[sceneConfig]);
 const renderSignature=`${studio}:${location}:${view}:${retry}:${JSON.stringify(project)}`;
 const ready=readySignature===renderSignature;

 useEffect(()=>{
  let cancelled=false;
  const timer=window.setTimeout(async()=>{
   let scene:HTMLImageElement;
   try{scene=studio?null as unknown as HTMLImageElement:await loadScene(sceneConfig.src)}catch{if(!cancelled)setFailedSignature(renderSignature);return}
   if(cancelled||!textureRef.current||!canvasRef.current)return;
   const serialized=new XMLSerializer().serializeToString(textureRef.current);
   const url=URL.createObjectURL(new Blob([serialized],{type:"image/svg+xml;charset=utf-8"}));
   const texture=new Image();texture.decoding="async";texture.src=url;
   try{await texture.decode()}catch{URL.revokeObjectURL(url);if(!cancelled)setFailedSignature(renderSignature);return}
   if(cancelled){URL.revokeObjectURL(url);return}
   const canvas=canvasRef.current,ctx=canvas?.getContext("2d");
   if(!canvas||!ctx){URL.revokeObjectURL(url);return}
   ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";ctx.clearRect(0,0,SCENE_WIDTH,SCENE_HEIGHT);
   if(studio){ctx.fillStyle="#eeede8";ctx.fillRect(0,0,SCENE_WIDTH,SCENE_HEIGHT)}else ctx.drawImage(scene,0,0,SCENE_WIDTH,SCENE_HEIGHT);
   projectTexture(ctx,texture,homography,project.base);
   if(!studio)integrateSurfaceLighting(ctx,sceneConfig);
   if(project.scene==="night"){
    ctx.save();ctx.globalCompositeOperation="multiply";ctx.fillStyle="#253d57";ctx.globalAlpha=.55;ctx.fillRect(0,0,SCENE_WIDTH,SCENE_HEIGHT);ctx.restore();
    ctx.save();ctx.globalCompositeOperation="screen";ctx.fillStyle="#9fd3ff";ctx.globalAlpha=.12;ctx.fillRect(0,0,SCENE_WIDTH,SCENE_HEIGHT);ctx.restore();
   }else if(project.scene==="event"){
    const glow=ctx.createRadialGradient(835,460,50,835,460,780);glow.addColorStop(0,"rgba(255,215,115,.18)");glow.addColorStop(1,"rgba(95,35,110,.22)");ctx.fillStyle=glow;ctx.fillRect(0,0,SCENE_WIDTH,SCENE_HEIGHT);
   }
   URL.revokeObjectURL(url);setReadySignature(renderSignature);
  },60);
  return()=>{cancelled=true;window.clearTimeout(timer)};
 },[homography,project,renderSignature,sceneConfig,textureId]);

 const family=getPatternFamily(project.patternFamily),palette=getPatternPalette(project.patternPalette);
 const accessibleLabel=`Street Football 3×3, ${studio?"neutralne tło":LOCATION_LABELS[location]}, ${sceneConfig.label}: ${isTurf(project.surface)?"zielona murawa i oznaczenia":`${family.name}, paleta ${palette.name}`}, ${surfaceLabel(project.surface)}`;
 const meter=(value:number)=>value*PIXELS_PER_METER;
 const inset=meter(COURT_GEOMETRY.lineInset),goalAreaY=meter((COURT_GEOMETRY.width-COURT_GEOMETRY.goalAreaWidth)/2);
 const goalAreaDepth=meter(COURT_GEOMETRY.goalAreaDepth),goalAreaHeight=meter(COURT_GEOMETRY.goalAreaWidth);
 return <div className="realistic-stage green-screen-stage" data-ready={ready} role="img" aria-label={accessibleLabel} aria-busy={!ready}>
  <div className="green-screen-scene">
  <canvas ref={canvasRef} width={SCENE_WIDTH} height={SCENE_HEIGHT} aria-hidden="true"/>
  {ready?<GoalOverlay scene={sceneConfig} homography={homography}/>:null}
  {!ready?failedSignature===renderSignature?<div className="green-screen-loading" role="alert">Nie udało się wczytać podglądu. <button className="btn subtle" onClick={()=>setRetry(value=>value+1)}>Spróbuj ponownie</button></div>:<div className="green-screen-loading" role="status">Przeliczam perspektywę…</div>:null}
  </div>
  <svg ref={textureRef} className="green-screen-texture" xmlns="http://www.w3.org/2000/svg" width={COURT_WIDTH} height={COURT_HEIGHT} viewBox="0 0 600 400" aria-hidden="true">
   <defs>
    <clipPath id={`${textureId}-court`}><rect width="600" height="400"/></clipPath>
   </defs>
   <rect width="600" height="400" fill={project.base}/>
   <path d={`M0 ${goalAreaY}H${inset+goalAreaDepth}V${goalAreaY+goalAreaHeight}H0Z M${COURT_WIDTH} ${goalAreaY}H${COURT_WIDTH-inset-goalAreaDepth}V${goalAreaY+goalAreaHeight}H${COURT_WIDTH}Z`} fill={project.zone}/>
   <g clipPath={`url(#${textureId}-court)`}>{!isTurf(project.surface)?<PatternArt p={project} h={400}/>:null}<SurfaceAppearance surface={project.surface} id={textureId}/><SurfaceObjects p={project}/></g>
   {project.lines?<g fill="none" stroke={project.lineColor} strokeWidth={meter(COURT_GEOMETRY.lineWidth)} strokeLinejoin="round">
    <rect x={inset} y={inset} width={COURT_WIDTH-inset*2} height={COURT_HEIGHT-inset*2}/>
    <path d={`M${COURT_WIDTH/2} ${inset}V${COURT_HEIGHT-inset}`}/>
    <circle cx={COURT_WIDTH/2} cy={COURT_HEIGHT/2} r={meter(COURT_GEOMETRY.centerCircleRadius)}/>
    <path d={`M${inset} ${goalAreaY}H${inset+goalAreaDepth}V${goalAreaY+goalAreaHeight}H${inset} M${COURT_WIDTH-inset} ${goalAreaY}H${COURT_WIDTH-inset-goalAreaDepth}V${goalAreaY+goalAreaHeight}H${COURT_WIDTH-inset}`}/>
    <circle cx={meter(1.7)} cy={COURT_HEIGHT/2} r="2" fill={project.lineColor}/><circle cx={COURT_WIDTH-meter(1.7)} cy={COURT_HEIGHT/2} r="2" fill={project.lineColor}/>
   </g>:null}
  </svg>
  <div className="green-screen-status"><span>STREET FOOTBALL 3×3 · {LOCATION_LABELS[location].toUpperCase()} · {view==="aerial"?"Z GÓRY":view==="ground"?"Z BOISKA":"WIDOK BOCZNY"}</span><b>{isTurf(project.surface)?"Sztuczna murawa":family.name}</b><small>{isTurf(project.surface)?"Zieleń i oznaczenia":palette.name} · {surfaceLabel(project.surface)} · projekt 15 × 10 m</small></div>
 </div>;
}
