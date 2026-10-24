"use client";
import {graphicSourceError} from "@/lib/graphic-source-policy";
import {useProjectRecovery} from "@/hooks/use-project-recovery";
import {parseVaultProject} from "@/lib/project-vault";
import {useProjectQuote} from "@/hooks/use-project-quote";
import {nextProjectName} from "@/lib/studio-ux.mjs";
/* eslint-disable @next/next/no-html-link-for-pages */
import {useEffect,useId,useMemo,useRef,useState} from "react";
import {Grid2X2,Layers,Ruler,Palette,Goal,Paintbrush,CircleDashed,Plus,Check,Download,FolderOpen,RotateCcw,Undo2,Redo2,Upload,Type,Trash2,Move,Sun,Moon,PartyPopper,MapPin,Camera,SlidersHorizontal,Sparkles} from "lucide-react";
import {StudioWorkspace} from "@/components/studio-workspace";
import {GamefieldsHeader} from "@/components/gamefields-header";
import {Slider} from "@/components/ui/slider";
import {Switch} from "@/components/ui/switch";
import {Toaster,toast} from "sonner";

import {projectSchema,type Project,type EditorObject,type Target,type ObjectKind} from "@/lib/project";
import {patternFamilies,patternPalettes,patternFilters,signaturePresets,variants as patternVariants,getPatternFamily,getPatternPalette,patternCode,patternComplexity,complexityLabel,patternVariantName,filteredPatternFamilies,PATTERN_COUNT} from "@/lib/pattern-library";
import {PatternArt} from "@/components/pattern-art";
import {SurfaceMaterialPicker,SurfaceAppearance} from "@/components/surface-material";
import {isTurf} from "@/lib/surface-materials";
import {StreetFootballRealisticPreview,REALISTIC_LOCATIONS,type RealisticLocation} from "@/components/street-football-realistic-preview";
import {PannaStudioPreview as PannaRealisticPreview,ArenaSettings,SurfaceOrderOptions} from "@/components/blender-arena-preview";
import {isRoundCourt,courtArea,courtDimensions,clampToCircle,roundBandPosition} from "@/lib/court-geometry";
import {sportProfiles,getSportProfile,type SportProfile} from "@/lib/sport-profiles";

const uid=()=>Math.random().toString(36).slice(2,9);
const obj=(kind:ObjectKind,name:string,x:number,y:number,extra:Partial<EditorObject>={}):EditorObject=>({id:uid(),kind,name,x,y,scale:100,rotation:0,opacity:100,color:"#ffffff",target:"court",...extra});
const initial:Project={id:"GF-001",name:"Street Football 3×3 — projekt",type:"Nowe boisko",sport:"Piłka nożna 3×3",length:15,width:10,surface:"EPDM",base:"#6336F5",zone:"#F3E68A",outside:"#4A122B",lineColor:"#ffffff",lines:true,pattern:"Organic Flow",patternFamily:"organic-flow",patternPalette:"court-culture",patternVariant:6,patternDensity:100,gradientEnabled:false,textureEnabled:false,shadowEnabled:true,artistFinishEnabled:false,creativity:0,shadowIntensity:25,graphicOpacity:100,graphicScale:100,graphicRotation:0,scene:"day",objects:[],status:"Szkic",date:"29.09.2026"};
const modules=[["Design",Paintbrush],["Wyposażenie",Goal],["Wymiary i wycena",Ruler]] as const;
const sports=sportProfiles.map(x=>x.sport);
const surfaces=["Akryl sportowy","EPDM","Sztuczna trawa 60 mm","Moduły sportowe","Piasek sportowy","Beton sportowy"];
type RealisticPreview={src:string;alt:string};
const realisticPreviews:Partial<Record<string,Record<string,RealisticPreview>>>= {
 "Piłka nożna 3×3":{
  "organic-flow":{src:"/studio/organic-flow-park.webp",alt:"Realistyczna wizualizacja boiska Street Football 3×3 w parku z wzorem Organic Flow"},
  geometric:{src:"/studio/urban-contrast-park.webp",alt:"Realistyczna wizualizacja boiska Street Football 3×3 w parku z wzorem Urban Contrast"},
  mono:{src:"/studio/classic-lines-park.webp",alt:"Realistyczna wizualizacja boiska Street Football 3×3 w parku z wzorem Classic Lines"}
 },
 "Koszykówka 3×3":{
  "organic-flow":{src:"/studio/basketball-3x3-organic-flow-park-v2.webp",alt:"Realistyczna wizualizacja boiska Basketball 3×3 w parku z wzorem Organic Flow"},
  geometric:{src:"/studio/basketball-3x3-urban-contrast-park-v2.webp",alt:"Realistyczna wizualizacja boiska Basketball 3×3 w parku z wzorem Urban Contrast"},
  mono:{src:"/studio/basketball-3x3-classic-lines-park-v2.webp",alt:"Realistyczna wizualizacja boiska Basketball 3×3 w parku z wzorem Classic Lines"}
 }
};
const targetLabel:Record<Target,string>={"court":"Nawierzchnia","band-top":"Banda górna","band-bottom":"Banda dolna","band-left":"Banda lewa","band-right":"Banda prawa"};

function pln(n:number){return new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN",maximumFractionDigits:0}).format(n)}
function shadowPatch(value:number):Partial<Project>{
 const shadowIntensity=Math.max(0,Math.min(100,value));
 return {
  shadowIntensity,
  shadowEnabled:shadowIntensity>0,
  gradientEnabled:false,
  textureEnabled:false,
  artistFinishEnabled:false,
  creativity:0
 };
}

function EquipmentShape({name}:{name:string}){
 if(name==="Bramka")return <g fill="#e9efec" stroke="#18372e" strokeWidth="3"><rect x="-24" y="-38" width="48" height="76" rx="3"/><path d="M-24-38l-12 10v56l12 10M24-38l12 10v56L24 38" fill="none"/></g>;
 if(name==="Kosz")return <g fill="none" stroke="#ffdf8a" strokeWidth="5"><path d="M0 22V-24"/><rect x="-24" y="-29" width="48" height="10"/><circle cx="0" cy="-10" r="13"/></g>;
 if(name==="Ławka")return <g fill="#b48b59"><rect x="-38" y="-10" width="76" height="13" rx="2"/><rect x="-33" y="4" width="7" height="18"/><rect x="26" y="4" width="7" height="18"/></g>;
 if(name==="Lampa")return <g><circle r="13" fill="#ffe46a"/><circle r="5" fill="#273733"/><path d="M0 13v45" stroke="#273733" strokeWidth="5"/></g>;
 if(name==="Siatka")return <g fill="none" stroke="#e9efec" strokeWidth="2"><path d="M-52 0H52"/><path d="M-52-22V22M52-22V22"/>{[-36,-18,0,18,36].map(x=><path key={x} d={"M"+x+" -15V15"} opacity=".55"/>)}<path d="M-52-10H52M-52 10H52" opacity=".55"/></g>;
 if(name==="Słupki tenisowe")return <g fill="#33453f"><rect x="-42" y="-30" width="7" height="60" rx="2"/><rect x="35" y="-30" width="7" height="60" rx="2"/></g>;
 if(name==="Szkło padel")return <g fill="rgba(183,225,235,.22)" stroke="#5d7b78" strokeWidth="3"><rect x="-56" y="-34" width="112" height="68" rx="3"/><path d="M0-34V34M-56 0H56"/></g>;
 if(name==="Krzesło sędziowskie")return <g fill="none" stroke="#4a5b55" strokeWidth="4"><path d="M-18 30L10-34M18 30L-10-34M-10-20H14V-7H-15"/></g>;
 if(name==="Bramka futsal")return <g fill="none" stroke="#eef2ef" strokeWidth="4"><rect x="-30" y="-38" width="60" height="76" rx="2"/><path d="M-30-38l-12 10v56l12 10M30-38l12 10v56L30 38" opacity=".65"/></g>;
 if(name==="Siatka badminton")return <g fill="none" stroke="#f3f4ef" strokeWidth="1.6"><path d="M-48 0H48"/><path d="M-48-13V13M48-13V13"/><path d="M-32-13V13M-16-13V13M0-13V13M16-13V13M32-13V13" opacity=".55"/><path d="M-48-7H48M-48 7H48" opacity=".55"/></g>;
 if(name==="Słupki badmintonowe")return <g fill="#394a44"><rect x="-44" y="-24" width="6" height="48" rx="2"/><rect x="38" y="-24" width="6" height="48" rx="2"/></g>;
 if(name==="Siatka beach")return <g fill="none" stroke="#fff" strokeWidth="2.5"><path d="M-56 0H56"/><path d="M-56-17V17M56-17V17"/><path d="M-42-17V17M-28-17V17M-14-17V17M0-17V17M14-17V17M28-17V17M42-17V17" opacity=".55"/><path d="M-56-9H56M-56 9H56" opacity=".55"/></g>;
 if(name==="Słupki beach")return <g fill="#374c45"><rect x="-50" y="-30" width="8" height="60" rx="3"/><rect x="42" y="-30" width="8" height="60" rx="3"/></g>;
 if(name==="Stół Teqball")return <g><path d="M-48 6Q0-20 48 6V18Q0-8-48 18Z" fill="#243832" stroke="#d8ff77" strokeWidth="3"/><path d="M0 0V25" stroke="#e9efe9" strokeWidth="3"/><rect x="-4" y="-12" width="8" height="25" fill="#e9efe9"/></g>;
 if(name==="Piłkochwyt")return <rect x="-55" y="-10" width="110" height="20" fill="none" stroke="#54786a" strokeWidth="3" strokeDasharray="6 5"/>;
 if(name==="Banda")return <rect x="-60" y="-10" width="120" height="20" rx="2" fill="#263934"/>;
 if(name==="Namiot")return <g><path d="M-45 20L0-35L45 20Z" fill="#f0efe6" stroke="#273933" strokeWidth="3"/><path d="M-38 20v35M38 20v35" stroke="#273933" strokeWidth="4"/></g>;
 if(name==="DJ booth")return <g><rect x="-42" y="-24" width="84" height="48" rx="4" fill="#222d2a"/><circle cx="-20" cy="0" r="11" fill="#d8ff77"/><circle cx="20" cy="0" r="11" fill="#ff7757"/></g>;
 if(name==="Quarter pipe")return <g fill="#aeb4b0" stroke="#465650" strokeWidth="3"><path d="M-50 34V10Q-50-34-6-34H50V34Z"/><path d="M-38 26Q-34-19 8-22H45" fill="none"/></g>;
 if(name==="Funbox")return <g fill="#aeb4b0" stroke="#465650" strokeWidth="3"><path d="M-52 28L-34-28H34L52 28Z"/><rect x="-18" y="-28" width="36" height="56" fill="#c8ccc9"/></g>;
 if(name==="Rail skate")return <g fill="none" stroke="#495a53" strokeWidth="5"><path d="M-48 0H48M-38 0V28M38 0V28"/></g>;
 if(name==="Ledge")return <g fill="#9fa7a2" stroke="#43544d" strokeWidth="3"><rect x="-50" y="-18" width="100" height="36" rx="3"/><path d="M-50-8H50"/></g>;
 if(name==="Bank")return <g fill="#b4bab6" stroke="#485952" strokeWidth="3"><path d="M-50 28L-20-28H50V28Z"/></g>;
 if(name==="Drążki")return <g fill="none" stroke="#e5ece7" strokeWidth="5"><path d="M-42 35V-30M42 35V-30M-42-25H42"/></g>;
 if(name==="Poręcze")return <g fill="none" stroke="#e5ece7" strokeWidth="5"><path d="M-42-15H42M-42 15H42M-34-15V30M34-15V30M-34 15V30M34 15V30"/></g>;
 if(name==="Monkey bars")return <g fill="none" stroke="#e5ece7" strokeWidth="4"><rect x="-48" y="-24" width="96" height="48" rx="3"/><path d="M-32-24V24M-16-24V24M0-24V24M16-24V24M32-24V24"/></g>;
 if(name==="Box treningowy")return <g fill="#62716a" stroke="#d8ff77" strokeWidth="3"><rect x="-34" y="-28" width="68" height="56" rx="4"/><path d="M-34 0H34"/></g>;
 if(name==="Kółka treningowe")return <g fill="none" stroke="#e9efea" strokeWidth="4"><path d="M-22-35V-12M22-35V-12"/><circle cx="-22" cy="4" r="16"/><circle cx="22" cy="4" r="16"/></g>;
 if(name==="Totem")return <rect x="-15" y="-48" width="30" height="96" rx="3" fill="#d8ff77" stroke="#273933" strokeWidth="3"/>;
 if(name==="Trybuna")return <g fill="#66726d">{[0,1,2].map(i=><rect key={i} x={-55+i*8} y={-25+i*16} width={110-i*16} height="12"/>)}</g>;
 return <circle r="20" fill="#d8ff77"/>;
}
function EditorObjectView({o,h,round=false,selected,onPointerDown}:{o:EditorObject;h:number;round?:boolean;selected:boolean;onPointerDown:(e:React.PointerEvent<SVGElement>,id:string,mode?:"move"|"scale"|"rotate")=>void}){
 let x=o.x,y=o.y,rot=o.rotation;
 if(o.target==="band-top")y=-22;
 if(o.target==="band-bottom")y=h+22;
 if(o.target==="band-left"){x=-22;rot-=90}
 if(o.target==="band-right"){x=622;rot+=90}
 if(round&&o.target!=="court"){const pos=roundBandPosition(o);x=pos.x;y=pos.y;rot=o.rotation+pos.rotation;}
 const tr="translate("+x+" "+y+") rotate("+rot+") scale("+o.scale/100+")";
 return <g className={"editable-object "+(selected?"selected":"")} transform={tr} opacity={o.opacity/100} onPointerDown={e=>onPointerDown(e,o.id,"move")}>
   {o.kind==="image"&&o.src?<image href={o.src} x="-55" y="-55" width="110" height="110" preserveAspectRatio="xMidYMid meet"/>:null}
   {o.kind==="text"?<text textAnchor="middle" dominantBaseline="middle" fill={o.color} fontSize="34" fontWeight="800">{o.text||"TWÓJ TEKST"}</text>:null}
   {o.kind==="sponsor"?<g><rect x="-58" y="-22" width="116" height="44" rx="5" fill="#18221f" stroke={o.color} strokeWidth="2"/><text textAnchor="middle" dominantBaseline="middle" fill={o.color} fontSize="17" fontWeight="900" letterSpacing="1">{o.text||o.name}</text></g>:null}
   {o.kind==="equipment"?<EquipmentShape name={o.name}/>:null}
   {selected?<g className="transform-ui" opacity="1">
     <rect x="-66" y="-66" width="132" height="132" rx="4" fill="none" stroke="#d8ff77" strokeWidth="3" strokeDasharray="7 5" vectorEffect="non-scaling-stroke"/>
     <line x1="0" y1="-66" x2="0" y2="-87" stroke="#d8ff77" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
     <circle className="transform-handle rotate-handle" cx="0" cy="-94" r="8" fill="#20352c" stroke="#d8ff77" strokeWidth="3" vectorEffect="non-scaling-stroke" onPointerDown={e=>{e.stopPropagation();onPointerDown(e,o.id,"rotate")}}/>
     <circle className="transform-handle scale-handle" cx="70" cy="70" r="9" fill="#d8ff77" stroke="#20352c" strokeWidth="3" vectorEffect="non-scaling-stroke" onPointerDown={e=>{e.stopPropagation();onPointerDown(e,o.id,"scale")}}/>
   </g>:null}
 </g>;
}
function EventScene({h}:{h:number}){
 const people=[[-45,40],[-48,85],[-50,135],[-48,190],[-42,250],[645,45],[650,95],[646,150],[650,205],[646,260],[120,-48],[190,-46],[260,-50],[340,-47],[420,-50],[490,-46]];
 return <g className="event-scene">
   <g transform={"translate(-70 "+h/2+") rotate(-90) scale(.9)"}><EquipmentShape name="Trybuna"/></g>
   <g transform={"translate(670 "+h/2+") rotate(90) scale(.9)"}><EquipmentShape name="Trybuna"/></g>
   {people.map(([x,y],i)=><g key={i} transform={"translate("+x+" "+y+")"}><circle r="8" fill={i%3===0?"#ff7757":i%3===1?"#d8ff77":"#e8ece9"}/><path d="M0 8v20M-10 15L0 23l10-8" stroke="#283733" strokeWidth="4" fill="none"/></g>)}
   <g transform={"translate(130 "+(h+58)+")"}><EquipmentShape name="DJ booth"/></g>
   <g transform={"translate(490 "+(h+58)+") scale(.75)"}><EquipmentShape name="Namiot"/></g>
   <g transform={"translate(300 -55)"}><rect x="-120" y="-18" width="240" height="36" rx="4" fill="#20352c"/><text textAnchor="middle" dominantBaseline="middle" fill="#d8ff77" fontSize="16" fontWeight="900" letterSpacing="3">GAMEFIELDS / LIVE</text></g>
   <g transform={"translate(300 "+(h+58)+")"}><rect x="-115" y="-15" width="230" height="30" rx="3" fill="#ffffff" stroke="#20352c" strokeWidth="2"/><text textAnchor="middle" dominantBaseline="middle" fill="#20352c" fontSize="13" fontWeight="900" letterSpacing="2">COMMUNITY · MUSIC · GAME</text></g>
 </g>;
}
export function Court({p,iso=false,small=false,selectedId,onSelect,onDragStart,onDropEquipment}:{p:Project;iso?:boolean;small?:boolean;selectedId?:string|null;onSelect?:(id:string|null)=>void;onDragStart?:(e:React.PointerEvent<SVGElement>,id:string,mode?:"move"|"scale"|"rotate")=>void;onDropEquipment?:(name:string,x:number,y:number)=>void}){
 const round=isRoundCourt(p),w=600,h=600*p.width/p.length;
 const svgRef=useRef<SVGSVGElement>(null);
 const patternId=useId(),clipId=useId();
 function drop(e:React.DragEvent<SVGSVGElement>){if(!onDropEquipment)return;e.preventDefault();const name=e.dataTransfer.getData("gamefields/equipment");if(!name)return;const svg=svgRef.current;if(!svg)return;const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const ctm=svg.getScreenCTM();if(!ctm)return;const loc=pt.matrixTransform(ctm.inverse());onDropEquipment(name,Math.max(0,Math.min(600,loc.x)),Math.max(0,Math.min(h,loc.y)))}
 return <svg ref={svgRef} role="img" aria-label={"Projekt boiska "+courtDimensions(p)} className={"court "+(iso?"iso":"")} viewBox={"-95 -95 "+(w+190)+" "+(h+190)} onPointerDown={e=>{if(e.target===e.currentTarget)onSelect?.(null)}} onDragOver={e=>e.preventDefault()} onDrop={drop}>
  <defs><pattern id={patternId} width="60" height="60" patternUnits="userSpaceOnUse"><rect width="30" height="60" fill="#fff" opacity=".045"/></pattern><clipPath id={clipId}>{round?<circle cx="300" cy="300" r="300"/>:<rect width={w} height={h}/>}</clipPath></defs>
  {round?<circle cx="300" cy="300" r="340" fill={p.outside}/>:<rect x="-40" y="-40" width={w+80} height={h+80} rx="3" fill={p.outside}/>}
  {round?<circle cx="300" cy="300" r="300" fill={p.base}/>:<rect width={w} height={h} fill={p.base}/>}
  {p.surface.includes("trawa")?<rect width={w} height={h} fill={"url(#"+patternId+")"}/>:null}
  {!round&&(p.sport.includes("Piłka nożna")||p.sport==="Futsal")?<path d={"M0 "+h*.25+"h100v"+h*.5+"H0Z M600 "+h*.25+"H500v"+h*.5+"h100Z"} fill={p.zone}/>:null}
  {(p.sport==="Koszykówka"||p.sport==="Koszykówka 3×3")?<path d={p.sport==="Koszykówka 3×3"?"M0 "+(h/2-55)+"H130V"+(h/2+55)+"H0Z":"M0 "+(h/2-55)+"H125V"+(h/2+55)+"H0Z M600 "+(h/2-55)+"H475V"+(h/2+55)+"H600Z"} fill={p.zone}/>:null}
  {["Tenis","Padel","Badminton","Pickleball"].includes(p.sport)?<rect x="175" y="10" width="250" height={h-20} fill={p.zone} opacity=".28"/>:null}
  {(p.sport==="Siatkówka"||p.sport==="Siatkówka plażowa")?<rect x="200" y="10" width="200" height={h-20} fill={p.zone} opacity=".28"/>:null}
  {p.sport==="Teqball"?<rect x="240" y={Math.max(10,h/2-70)} width="120" height="140" rx="18" fill={p.zone} opacity=".34"/>:null}
  {p.sport==="Skate"?<path d={"M50 "+h*.18+"H250L320 "+h*.42+"H550V"+h*.72+"H350L280 "+h*.55+"H50Z"} fill={p.zone} opacity=".32"/>:null}
  {p.sport==="Street Workout"?<><rect x="70" y={h*.15} width="180" height={h*.7} rx="18" fill={p.zone} opacity=".32"/><rect x="350" y={h*.15} width="180" height={h*.7} rx="18" fill={p.zone} opacity=".22"/></>:null}
  <g clipPath={"url(#"+clipId+")"}>{!p.sport.includes("Piłka nożna")||!isTurf(p.surface)?<PatternArt p={p} h={h}/>:null}{p.sport.includes("Piłka nożna")?<SurfaceAppearance surface={p.surface} id={patternId.replace(/:/g,"")} height={h} length={p.length}/>:null}</g>
  {p.lines?<g fill="none" stroke={p.lineColor} strokeWidth="2.5">
   {round?<circle cx="300" cy="300" r="290"/>:<rect x="10" y="10" width="580" height={h-20}/>}
   {!round&&(p.sport.includes("Piłka nożna")||p.sport==="Wielofunkcyjne")?<><path d={"M300 10V"+(h-10)}/><circle cx="300" cy={h/2} r={Math.min(48,h*.18)}/><path d={"M10 "+h*.25+"H100V"+h*.75+"H10 M590 "+h*.25+"H500V"+h*.75+"H590"}/><circle cx="68" cy={h/2} r="2"/><circle cx="532" cy={h/2} r="2"/></>:null}
   {p.sport==="Koszykówka"?<><path d={"M300 10V"+(h-10)}/><circle cx="300" cy={h/2} r={Math.min(48,h*.18)}/><path d={"M10 "+h*.16+"Q235 "+h/2+" 10 "+h*.84+" M590 "+h*.16+"Q365 "+h/2+" 590 "+h*.84}/><rect x="10" y={h/2-48} width="108" height="96"/><rect x="482" y={h/2-48} width="108" height="96"/></>:null}
   {p.sport==="Koszykówka 3×3"?<><path d={"M10 "+h*.12+"Q270 "+h/2+" 10 "+h*.88}/><rect x="10" y={h/2-50} width="118" height="100"/><path d={"M128 "+(h/2-50)+"A50 50 0 0 1 128 "+(h/2+50)}/><circle cx="42" cy={h/2} r="3"/></>:null}
   {p.sport==="Tenis"?<><path d={"M300 10V"+(h-10)}/><path d={"M10 "+h*.16+"H590 M10 "+h*.84+"H590"}/><path d={"M190 "+h*.16+"V"+h*.84+" M410 "+h*.16+"V"+h*.84}/><path d={"M190 "+h/2+"H410"}/></>:null}
   {p.sport==="Padel"?<><path d={"M300 10V"+(h-10)}/><path d={"M175 10V"+(h-10)+" M425 10V"+(h-10)}/><path d={"M175 "+h/2+"H425"}/></>:null}
   {p.sport==="Siatkówka"?<><path d={"M300 10V"+(h-10)}/><path d={"M200 10V"+(h-10)+" M400 10V"+(h-10)}/></>:null}
   {p.sport==="Pickleball"?<><path d={"M300 10V"+(h-10)}/><path d={"M210 10V"+(h-10)+" M390 10V"+(h-10)}/><path d={"M10 "+h/2+"H210 M390 "+h/2+"H590"}/></>:null}
   {p.sport==="Futsal"?<><path d={"M300 10V"+(h-10)}/><circle cx="300" cy={h/2} r={Math.min(50,h*.14)}/><path d={"M10 "+h*.22+"Q135 "+h/2+" 10 "+h*.78+" M590 "+h*.22+"Q465 "+h/2+" 590 "+h*.78}/><circle cx="95" cy={h/2} r="3"/><circle cx="505" cy={h/2} r="3"/></>:null}
   {p.sport==="Badminton"?<><path d={"M300 10V"+(h-10)}/><path d={"M10 "+h*.08+"H590 M10 "+h*.92+"H590"}/><path d={"M75 10V"+(h-10)+" M525 10V"+(h-10)}/><path d={"M210 10V"+(h-10)+" M390 10V"+(h-10)}/><path d={"M75 "+h/2+"H210 M390 "+h/2+"H525"}/></>:null}
   {p.sport==="Siatkówka plażowa"?<path d={"M300 10V"+(h-10)}/>:null}
   {p.sport==="Teqball"?<><path d={"M300 10V"+(h-10)}/><path d={"M10 "+h/2+"H590"} opacity=".5"/></>:null}
   {p.sport==="Wielofunkcyjne"?<><path d={"M10 "+h*.18+"Q240 "+h/2+" 10 "+h*.82+" M590 "+h*.18+"Q360 "+h/2+" 590 "+h*.82} opacity=".7"/><rect x="10" y={h/2-45} width="100" height="90" opacity=".7"/><rect x="490" y={h/2-45} width="100" height="90" opacity=".7"/></>:null}
  </g>:null}
  {(p.sport.includes("Piłka nożna")||p.sport==="Padel"||p.sport==="Wielofunkcyjne"||p.sport==="Custom Court")?<g className="band-shell">
    {round?<circle cx="300" cy="300" r="305" fill="none" stroke={p.arenaDesign?.panelColor||"#20352c"} strokeWidth="18"/>:<><rect x="-8" y="-13" width="616" height="18" rx="2" fill="#20352c"/>
    <rect x="-8" y={h-5} width="616" height="18" rx="2" fill="#20352c"/>
    <rect x="-13" y="-5" width="18" height={h+10} rx="2" fill="#20352c"/>
    <rect x="595" y="-5" width="18" height={h+10} rx="2" fill="#20352c"/>
    <text x="300" y="-1" textAnchor="middle" fill="#d8ff77" fontSize="8" fontWeight="900" letterSpacing="2">GAMEFIELDS</text>
    <text x="300" y={h+8} textAnchor="middle" fill="#d8ff77" fontSize="8" fontWeight="900" letterSpacing="2">DESIGN THE GAME</text></>}
  </g>:null}
  {p.scene==="event"?<EventScene h={h}/>:null}
  {p.objects.filter(o=>o.kind!=="equipment").map(o=><g key={o.id} clipPath={round&&o.target==="court"&&o.kind!=="equipment"?"url(#"+clipId+")":undefined}><EditorObjectView o={o} h={h} round={round} selected={o.id===selectedId} onPointerDown={onDragStart||(()=>{})}/></g>)}
  {!small?<g fill={p.scene==="night"?"#d7e1dc":"#66736d"} fontSize="13"><text x="300" y="-68" textAnchor="middle">{round?courtDimensions(p):p.length+" m"}</text><text x="670" y={h/2} textAnchor="middle">{round?"Panna 1×1":p.width+" m"}</text></g>:null}
 </svg>;
}

function download(p:Project,wordpress=false){if(wordpress&&!projectSchema.safeParse(p).success){toast.error("Uzupełnij nazwę i sprawdź ustawienia projektu przed eksportem wzoru.");return}const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(p,null,2)],{type:wordpress?"text/plain":"application/json"}));a.download=p.id+(wordpress?"-wzor-gamefields.txt":"-gamefields-v05.json");a.click();URL.revokeObjectURL(a.href)}

type TemplateCard={id:number;title:string;description:string;image:string|null;link:string};
export default function Home(){
 const [templates,setTemplates]=useState<TemplateCard[]>([]),[templatesLoading,setTemplatesLoading]=useState(false),[templateError,setTemplateError]=useState(""),[templatePage,setTemplatePage]=useState(1),[templateTotal,setTemplateTotal]=useState(1),[openingTemplate,setOpeningTemplate]=useState<number|null>(null);
 const [patternFilter,setPatternFilter]=useState("all"),[patternSearch,setPatternSearch]=useState(""),[patternPage,setPatternPage]=useState(1),[patternMode,setPatternMode]=useState<"random"|"signature"|"all">("signature"),[randomPick,setRandomPick]=useState({familyId:"organic-flow",variant:6,paletteId:"warsaw"});
 const templateRequest=useRef(0);
 async function loadTemplates(page=1){const request=++templateRequest.current;setTemplatesLoading(true);setTemplateError("");try{const r=await fetch("/api/templates?page="+page,{cache:"no-store"});if(!r.ok)throw new Error();const data=await r.json() as {items:TemplateCard[];pages:number};if(request!==templateRequest.current)return;setTemplates(data.items);setTemplatePage(page);setTemplateTotal(data.pages)}catch{if(request===templateRequest.current)setTemplateError("Nie udało się pobrać katalogu. Spróbuj ponownie.")}finally{if(request===templateRequest.current)setTemplatesLoading(false)}}
 function showTemplates(){setView("templates");void loadTemplates(1)}
 async function openTemplate(item:TemplateCard){if(openingTemplate!==null)return;setOpeningTemplate(item.id);let readyToReplace=false;try{const r=await fetch("/api/templates?id="+item.id,{cache:"no-store"});if(!r.ok)throw new Error();const data=await r.json() as {project:unknown};const original=projectSchema.parse(data.project);const copy={...original,id:"GF-"+uid(),name:item.title.slice(0,190)+" — kopia",objects:original.objects.map(o=>({...o,id:uid()}))};readyToReplace=true;await recovery.preserveCurrent();finishDrag.current?.();history(p);setP(copy);setSelectedId(null);setView("builder");toast.success("Otworzono kopię wzoru. Oryginał pozostaje bez zmian.")}catch(error){toast.error(readyToReplace?(error as Error).message:"Ten wzór nie ma poprawnego pliku projektu lub został wycofany.")}finally{setOpeningTemplate(null)}}
 useEffect(()=>{if(new URLSearchParams(window.location.search).get("view")==="templates"){setView("templates");void loadTemplates(1)}},[]);

 const [homeEmbed,setHomeEmbed]=useState(false);
 useEffect(()=>{const embedded=new URLSearchParams(window.location.search).get("home")==="1";setHomeEmbed(embedded);if(embedded)setView("builder")},[]);
 const [p,setP]=useState<Project>(initial),[view,setView]=useState("builder"),[module,setModule]=useState(0),[iso,setIso]=useState(false),[previewMode,setPreviewMode]=useState<"realistic"|"aerial"|"ground">("ground"),[previewLocation,setPreviewLocation]=useState<RealisticLocation>("park"),[selectedId,setSelectedId]=useState<string|null>(null),[undoStack,setUndo]=useState<Project[]>([]),[redoStack,setRedo]=useState<Project[]>([]);
 const recovery=useProjectRecovery(p,setP);
 const saveStatus=recovery.saveStatus;
 useEffect(()=>{if(!REALISTIC_LOCATIONS.some(location=>location.id===previewLocation&&location.enabled))setPreviewLocation("park")},[previewLocation]);
 useEffect(()=>{
   const params=new URLSearchParams(window.location.search);
   const familyId=params.get("pattern"),paletteId=params.get("palette"),sport=params.get("sport"),shadowRaw=Number(params.get("shadow"));
   const variantRaw=Number(params.get("variant")||"1");
   const arena=params.get("arena");if(arena&&["o1","p1","circle-cage-1","circle-cage-2","street-field","octagon","street15"].includes(arena))selectSport(getSportProfile(undefined,arena),params.get("home")!=="1");else if(sport==="Piłka nożna 1×1")selectSport(getSportProfile(sport),params.get("home")!=="1");
   if(familyId&&patternFamilies.some(x=>x.id===familyId)){
     const family=getPatternFamily(familyId);
     const variant=Math.max(1,Math.min(12,Number.isFinite(variantRaw)?variantRaw:1));
     const palette=patternPalettes.some(x=>x.id===paletteId)?getPatternPalette(paletteId||"miami"):getPatternPalette("miami");
     setP(v=>{const shadowIntensity=Number.isFinite(shadowRaw)?Math.max(0,Math.min(100,shadowRaw)):(v.shadowIntensity??25);return {...v,pattern:family.name,patternFamily:family.id,patternVariant:variant,patternPalette:palette.id,base:palette.colors[4],zone:palette.colors[1],sport:sport&&sports.includes(sport)?sport:v.sport,...shadowPatch(shadowIntensity),graphicOpacity:100}});
     setModule(0);if(params.get("home")!=="1")setView("builder");
   }
 },[]);
 const uploadRef=useRef<HTMLInputElement>(null),importRef=useRef<HTMLInputElement>(null);
 async function importProject(file?:File){if(!file)return;if(file.size>12000000){toast.error("Plik projektu może mieć maksymalnie 12 MB.");return}let readyToReplace=false;try{const next=parseVaultProject(await file.text());readyToReplace=true;await recovery.preserveCurrent();finishDrag.current?.();history(p);setP(next);setSelectedId(null);setView("builder");toast.success("Wczytano projekt")}catch(error){const artworkIssue=(error as {issues?:{path:(string|number)[];message:string}[]}).issues?.find(issue=>issue.path.includes("src"));toast.error(readyToReplace?(error as Error).message:artworkIssue?"Nie można wczytać projektu: "+artworkIssue.message:"Nieprawidłowy plik projektu. Wybierz eksport JSON z edytora v0.5.")}}
 const dragStart=useRef<Project|null>(null);
 const finishDrag=useRef<(()=>void)|null>(null);
 const area=Math.round(courtArea(p)*100)/100;
 const previewProject=useMemo(()=>({...p,objects:p.objects.filter(o=>o.kind!=="equipment")}),[p]);
 const quote=useProjectQuote(p);
 const selected=p.objects.find(o=>o.id===selectedId)||null;
 const selectedCharacter=signaturePresets.find(preset=>preset.familyId===p.patternFamily);
 useEffect(()=>{setPreviewMode(p.arenaModel?"ground":"realistic")},[p.arenaModel]);
 const selectedRealisticPreview=realisticPreviews[p.sport]?.[p.patternFamily||""];
 const hasLiveCompositor=!!p.arenaModel||p.sport==="Piłka nożna 3×3"||isRoundCourt(p);
 const RealisticPreviewComponent=p.arenaModel?PannaRealisticPreview:StreetFootballRealisticPreview;
 const selectedLocation=REALISTIC_LOCATIONS.find(location=>location.id===previewLocation&&location.enabled)||REALISTIC_LOCATIONS[0];
 const landmarkPreview=selectedLocation.concept;
 const hasRealisticPreview=hasLiveCompositor||Boolean(selectedRealisticPreview);
 const showAerialPreview=previewMode==="aerial"&&hasLiveCompositor;
 const showGroundPreview=previewMode==="ground"&&hasLiveCompositor;
 const showRealisticPreview=(previewMode==="realistic"&&hasRealisticPreview)||showAerialPreview||showGroundPreview;
 const patternCatalog=useMemo(()=>filteredPatternFamilies(patternFilter).flatMap(family=>patternVariants.map(v=>({family,variant:v.variant,name:patternVariantName(family.id,v.variant)}))).filter(item=>!patternSearch.trim()||[item.family.name,item.family.description,...item.family.tags,patternCode(item.family.id,item.variant)].join(" ").toLowerCase().includes(patternSearch.toLowerCase())),[patternFilter,patternSearch]);
 const patternPages=Math.max(1,Math.ceil(patternCatalog.length/24));
 const visiblePatterns=patternCatalog.slice((patternPage-1)*24,patternPage*24);
 function history(prev:Project){setUndo(s=>[...s.slice(-39),prev]);setRedo([])}
 function update(patch:Partial<Project>,track=true){if(track)history(p);setP(v=>({...v,...patch}))}
 function selectSport(profile:SportProfile,enterBuilder=true){
  if(profile.sport===p.sport&&profile.arenaModel===p.arenaModel){if(enterBuilder)setView("builder");return;}
  finishDrag.current?.();history(p);
  const h=600*profile.width/profile.length;
  const objects:EditorObject[]=[];
  setP(v=>({...v,name:nextProjectName(v.name,getSportProfile(v.sport,v.arenaModel).label,profile.label),arenaModel:profile.arenaModel,sport:profile.sport,courtShape:profile.courtShape,diameter:profile.diameter,arenaDesign:profile.arenaModel?{panelColor:"#b90f35",frameColor:"#30363c",goalColor:"#30363c",finish:"matte",text:"",side:"both"}:undefined,length:profile.length,width:profile.width,surface:profile.surface,base:profile.base,zone:profile.zone,outside:profile.outside,lineColor:profile.lineColor,lines:!["circle-cage-1","circle-cage-2","street-field","octagon","street15"].includes(profile.arenaModel||"")&&!["Skate","Street Workout"].includes(profile.sport),objects}));
  setModule(0);if(enterBuilder)setView("builder");setSelectedId(null);toast.success("Wybrano "+profile.label+". Przywrócono ustawienia modelu. Możesz użyć Cofnij.");
 }
 function updateObject(id:string,patch:Partial<EditorObject>,track=true){if(track)history(p);setP(v=>({...v,objects:v.objects.map(o=>o.id===id?{...o,...patch}:o)}))}
 function addObject(o:EditorObject){history(p);setP(v=>({...v,objects:[...v.objects,o]}));setSelectedId(o.id)}
 function removeObject(id:string){if(!p.objects.some(o=>o.id===id))return;finishDrag.current?.();history(p);setP(v=>({...v,objects:v.objects.filter(o=>o.id!==id)}));setSelectedId(current=>current===id?null:current);toast.success("Usunięto element. Możesz użyć Cofnij.")}
 function removeSelected(){if(selectedId)removeObject(selectedId)}
 useEffect(()=>{const keydown=(e:KeyboardEvent)=>{const target=e.target as HTMLElement|null;if(view!=="builder"||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||target?.closest('input,textarea,select,[contenteditable="true"],[role="slider"],[role="combobox"],[role="textbox"]'))return;if((e.key==="Delete"||e.key==="Backspace")&&selectedId){e.preventDefault();removeObject(selectedId)}};window.addEventListener("keydown",keydown);return()=>window.removeEventListener("keydown",keydown)});
 useEffect(()=>()=>finishDrag.current?.(),[]);
 function undo(){const prev=undoStack[undoStack.length-1];if(!prev)return;setRedo(r=>[...r,p]);setUndo(s=>s.slice(0,-1));setP(prev);setSelectedId(null)}
 function redo(){const next=redoStack[redoStack.length-1];if(!next)return;setUndo(s=>[...s,p]);setRedo(s=>s.slice(0,-1));setP(next);setSelectedId(null)}
 function randomizeLibrary(similar=false){const family=similar?getPatternFamily(randomPick.familyId):patternFamilies[Math.floor(Math.random()*patternFamilies.length)];const variant=1+Math.floor(Math.random()*12);const palette=similar?getPatternPalette(randomPick.paletteId):patternPalettes[Math.floor(Math.random()*patternPalettes.length)];setRandomPick({familyId:family.id,variant,paletteId:palette.id});}
 function startDrag(e:React.PointerEvent<SVGElement>,id:string,mode:"move"|"scale"|"rotate"="move"){
   if(iso){setSelectedId(id);toast.info("Przełącz na plan 2D, aby przesuwać obiekt.");return;}
   e.stopPropagation();finishDrag.current?.();setSelectedId(id);
   const startProject=p,startObj=p.objects.find(o=>o.id===id);if(!startObj)return;
   dragStart.current=startProject;
   const svg=e.currentTarget.ownerSVGElement;if(!svg)return;
   const h=600*p.width/p.length;
   const center=isRoundCourt(p)&&startObj.target!=="court"?roundBandPosition(startObj):{x:startObj.target==="band-left"?-22:startObj.target==="band-right"?622:startObj.x,y:startObj.target==="band-top"?-22:startObj.target==="band-bottom"?h+22:startObj.y};
   const point=(clientX:number,clientY:number)=>{const pt=svg.createSVGPoint();pt.x=clientX;pt.y=clientY;const ctm=svg.getScreenCTM();return ctm?pt.matrixTransform(ctm.inverse()):null};
   const first=point(e.clientX,e.clientY);if(!first)return;
   const startDist=Math.max(10,Math.hypot(first.x-center.x,first.y-center.y));
   const startAngle=Math.atan2(first.y-center.y,first.x-center.x)*180/Math.PI;
   let moved=false;
   const move=(ev:PointerEvent)=>{if(ev.pointerId!==e.pointerId)return;moved=true;const loc=point(ev.clientX,ev.clientY);if(!loc)return;
     setP(v=>({...v,objects:v.objects.map(o=>{
       if(o.id!==id)return o;
       if(mode==="scale"){const dist=Math.hypot(loc.x-center.x,loc.y-center.y);return {...o,scale:Math.max(20,Math.min(220,Math.round(startObj.scale*dist/startDist)))}} 
       if(mode==="rotate"){const angle=Math.atan2(loc.y-center.y,loc.x-center.x)*180/Math.PI;return {...o,rotation:((Math.round(startObj.rotation+(angle-startAngle))+540)%360)-180}}
       if(isRoundCourt(v)&&o.target==="court"&&o.kind!=="equipment")return {...o,...clampToCircle(startObj.x+loc.x-first.x,startObj.y+loc.y-first.y,280)};
       return {...o,x:Math.max(-50,Math.min(650,startObj.x+loc.x-first.x)),y:Math.max(-60,Math.min(600*v.width/v.length+70,startObj.y+loc.y-first.y))}
     })}))
   };
   const up=()=>{if(moved&&dragStart.current)history(dragStart.current);dragStart.current=null;window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",up);finishDrag.current=null};
   finishDrag.current=up;
   window.addEventListener("pointermove",move);window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up)
 }
 function handleUploads(files:FileList|null){if(!files)return;[...files].forEach((f,i)=>{if(!["image/png","image/svg+xml"].includes(f.type)){toast.error(`${f.name}: obsługiwane są pliki PNG i statyczne SVG.`);return}if(f.size>2000000){toast.error(`${f.name}: logo może mieć maksymalnie 2 MB.`);return}const r=new FileReader();r.onerror=()=>toast.error(`${f.name}: nie udało się odczytać logo.`);r.onload=()=>{const src=String(r.result),error=graphicSourceError(src);if(error){toast.error(`${f.name}: ${error}`);return}addObject(obj("image",f.name,300+i*25,300*p.width/p.length,{src,scale:90}))};r.readAsDataURL(f)})}
 function addText(){const o=obj("text","Tekst",300,180,{text:"TWOJE MIASTO",color:"#ffffff",scale:100});addObject(o)}
 function addEquipment(name:string,x=300,y=180){addObject(obj("equipment",name,x,y,{scale:name==="Banda"?100:85}))}
 function applyPalette(id:string,track=true){const pal=getPatternPalette(id);update({patternPalette:id,base:pal.colors[4],zone:pal.colors[1]},track)}
 function applySignature(id:string){
   const preset=signaturePresets.find(x=>x.id===id);if(!preset)return;
   applyPattern(preset.familyId,preset.variant,preset.paletteId);
 }
 function applyPattern(familyId:string,variant=1,paletteId=p.patternPalette||"miami"){
   const family=getPatternFamily(familyId),pal=getPatternPalette(paletteId);
   history(p);setP(v=>({...v,pattern:family.name,patternFamily:familyId,patternVariant:variant,patternPalette:paletteId,base:pal.colors[4],zone:pal.colors[1],graphicOpacity:100}));
   setView("builder");setModule(0);toast.success(patternCode(familyId,variant)+" zastosowany");
 }
 function applyDesignDirection(familyId:string,variant:number,paletteId:string){
   const family=getPatternFamily(familyId),pal=getPatternPalette(paletteId);
   update({pattern:family.name,patternFamily:familyId,patternVariant:variant,patternPalette:paletteId,base:pal.colors[4],zone:pal.colors[1],graphicOpacity:100});
 }
 function shufflePattern(similar=false){
   const source=similar?[getPatternFamily(p.patternFamily)]:patternFamilies;
   const family=source[Math.floor(Math.random()*source.length)],variant=1+Math.floor(Math.random()*12);
   const palette=similar?getPatternPalette(p.patternPalette):patternPalettes[Math.floor(Math.random()*patternPalettes.length)];
   applyPattern(family.id,variant,palette.id);
 }
 const choices=(items:string[],value:string,change:(s:string)=>void)=><div className="choices compact">{items.map(s=><button key={s} className={value===s?"choice selected":"choice"} onClick={()=>change(s)}><span>{s}</span>{value===s?<Check size={15}/>:null}</button>)}</div>;
 return <><Toaster position="bottom-right"/>
 {!homeEmbed&&view!=="builder"&&<GamefieldsHeader section="studio" studioView={view} onStudioNavigate={next=>{if(next==="patterns")setPatternPage(1);setView(next)}}/>}
 {view==="sport"?<main className={"builder-entry "+(homeEmbed?"entry-home":"")}>
 <section className="entry-copy">{!homeEmbed?<div className="entry-sports" role="group" aria-label="Dyscyplina">{sportProfiles.filter(profile=>profile.arenaModel||profile.id==="street-football-3x3").map(profile=><button key={profile.id} aria-pressed={p.arenaModel? p.arenaModel===profile.arenaModel:p.sport===profile.sport} onClick={()=>selectSport(profile,false)}><b>{profile.label}</b>{profile.sport==="Piłka nożna 1×1"?<small>Street Football 1×1</small>:null}</button>)}</div>:null}<span className="eyebrow">{p.sport==="Piłka nożna 1×1"?"GAMEFIELDS STUDIO / PANNA FOOTBALL 1×1":homeEmbed?"GAMEFIELDS STUDIO / BOISKA DO PIŁKI NOŻNEJ 3 NA 3":"GAMEFIELDS STUDIO / STREET FOOTBALL 3×3"}</span>{p.sport==="Piłka nożna 1×1"?(homeEmbed?<h2>Jeden na jednego.<br/>Zaprojektuj swoją arenę.</h2>:<h1>Jeden na jednego.<br/>Twoja arena.</h1>):homeEmbed?<h2>Zaprojektuj<br/>swoje boisko.</h2>:<h1>Twoje miejsce.<br/>Twoje boisko.</h1>}<p>{p.sport==="Piłka nożna 1×1"?"Modele boisk Panna z podglądem 3D. Wybierz konstrukcję i jej kolory. Dobierz dodatkową nawierzchnię i kolory swojej areny Panna. Zobacz ją w podglądzie 3D i przygotuj miejsce do gry jeden na jednego.":homeEmbed?"Wybierz wzór i kolory. Zobacz swoje boisko w realistycznym podglądzie i sprawdź orientacyjny koszt realizacji.":"Wybierz charakter. Dopasuj nawierzchnię i kolory. Zobacz, jak może wyglądać Twoje boisko."}</p>{homeEmbed?<a className="entry-start" target="_top" href={"https://gamefields-studio.ryhfs90.chatgpt.site/?"+new URLSearchParams({sport:p.sport,...(p.arenaModel?{arena:p.arenaModel}:{}),pattern:p.patternFamily||"organic-flow",variant:String(p.patternVariant||1),palette:p.patternPalette||"miami",shadow:String(p.shadowIntensity??25)}).toString()}>{p.sport==="Piłka nożna 1×1"?"Projektuj Panna 1 na 1":"Projektuj boisko 3 na 3"} <span>↗</span></a>:<button className="entry-start" onClick={()=>{setView("builder");setModule(0)}}>Projektuj boisko <span>↗</span></button>}<div className="entry-steps" aria-label="Etapy projektu"><span><b>01</b> Design</span><span><b>02</b> Konstrukcja</span><span><b>03</b> Wymiary i wycena</span></div><a className="entry-radar" href="/radar" target={homeEmbed?"_top":undefined}>Masz już miejsce? Zobacz Radar →</a></section>
 <section className="entry-workspace" aria-label={"Podgląd boiska "+getSportProfile(p.sport,p.arenaModel).label}><div className="entry-preview-head"><span><i/> {p.sport==="Piłka nożna 1×1"?"TWÓJ PROJEKT PANNA 1×1":homeEmbed?"TWÓJ PROJEKT BOISKA 3 NA 3":"PODGLĄD TWOJEGO BOISKA"}</span><span>{p.sport==="Piłka nożna 1×1"?"1 × 1 / PANNA":homeEmbed?"PARK / WIDOK BOCZNY":"3 × 3 / FOOTBALL"}</span></div><div className={hasLiveCompositor?"entry-realistic":"entry-court"}>{hasLiveCompositor?<RealisticPreviewComponent project={p} view="perspective" location="park"/>:<Court p={p}/>}</div><div className="entry-preview-meta"><span>{courtDimensions(p)} · {p.surface}</span><span>{getPatternFamily(p.patternFamily).name}</span></div><div className="entry-directions"><span>{homeEmbed?"WYBIERZ STYL SWOJEGO BOISKA":"WYBIERZ PIERWSZY KIERUNEK"}</span><div>{signaturePresets.slice(0,3).map(preset=><button key={preset.id} aria-pressed={p.patternFamily===preset.familyId&&p.patternVariant===preset.variant} onClick={()=>applyDesignDirection(preset.familyId,preset.variant,preset.paletteId)}><span className="entry-swatches">{getPatternPalette(preset.paletteId).colors.slice(0,3).map((color,i)=><i key={i} style={{background:color}}/>)}</span><b>{preset.name}</b><span className="entry-direction-mark">{p.patternFamily===preset.familyId&&p.patternVariant===preset.variant?"✓":"↗"}</span></button>)}</div></div></section>
 </main>:null}
 {view==="builder"?<StudioWorkspace
  project={p} recovery={recovery} restoreProject={next=>{const restored=parseVaultProject(next);finishDrag.current?.();history(p);setP(restored);setSelectedId(null)}} downloadProject={project=>download(project)} quote={quote} saveStatus={saveStatus} selected={selected} canUndo={!!undoStack.length} canRedo={!!redoStack.length}
  previewMode={previewMode} location={previewLocation} hasLivePreview={hasRealisticPreview}
  update={update} selectSport={selectSport} setPreviewMode={setPreviewMode} setLocation={setPreviewLocation}
  undo={undo} redo={redo} download={()=>download(p)} importProject={file=>{void importProject(file)}}
  openPatterns={()=>{setPatternPage(1);setView("patterns")}} applyDirection={applyDesignDirection} applyPalette={applyPalette}
  addEquipment={addEquipment} addText={addText} upload={handleUploads} selectObject={setSelectedId} updateObject={updateObject} removeObject={removeObject}
  renderCourt={(project,editing=false)=><Court p={project} small={!editing} selectedId={editing?selectedId:undefined} onSelect={editing?setSelectedId:undefined} onDragStart={editing?startDrag:undefined} onDropEquipment={undefined}/>}
  renderPreview={()=>p.arenaModel?<PannaRealisticPreview project={previewProject} studio interactive view={showAerialPreview?"aerial":"perspective"}/>:hasLiveCompositor?<StreetFootballRealisticPreview project={previewProject} studio view={showAerialPreview?"aerial":"perspective"}/>:<Court p={p}/>}
 />:view==="patterns"?<main className="pattern-library-page"><div className="pattern-hero"><div><span className="eyebrow">GAMEFIELDS DESIGN LIBRARY / {PATTERN_COUNT} WZORÓW</span><h1>Wybierz kierunek. Resztę dopasujesz w Studio.</h1><p>Najpierw zobacz kuratorowaną kolekcję Signature — najbardziej dopracowane kierunki do realnych realizacji. Potem możesz wejść w pełne 300 wariantów.</p></div><div className="pattern-hero-actions"><button className="btn dark" onClick={()=>shufflePattern(false)}>🎲 Losuj wzór</button><button className="btn subtle" onClick={()=>setView("builder")}>Wróć do Studio</button></div></div><div className="pattern-mode"><button className={patternMode==="random"?"active":""} onClick={()=>setPatternMode("random")}>Losuj wzór</button><button className={patternMode==="signature"?"active":""} onClick={()=>setPatternMode("signature")}>Signature / 12 kierunków</button><button className={patternMode==="all"?"active":""} onClick={()=>setPatternMode("all")}>Pełna biblioteka / {PATTERN_COUNT}</button></div>{patternMode==="random"?(()=>{const family=getPatternFamily(randomPick.familyId),palette=getPatternPalette(randomPick.paletteId),preview={...p,id:patternCode(randomPick.familyId,randomPick.variant),pattern:family.name,patternFamily:randomPick.familyId,patternVariant:randomPick.variant,patternPalette:randomPick.paletteId,objects:[],scene:"day" as const};return <section className="pattern-randomizer"><div className="randomizer-stage"><Court p={preview} small/></div><aside className="randomizer-info"><span className="eyebrow">LOSOWY KIERUNEK / {patternCode(randomPick.familyId,randomPick.variant)}</span><h2>{family.name} / {patternVariantName(randomPick.familyId,randomPick.variant)}</h2><p>{family.description}</p><div className="randomizer-palette"><span>{palette.name}</span>{palette.colors.map(col=><i key={col} style={{background:col}}/>)}</div><div className="library-price-note">Kalkulacja w Studio pokazuje wycenione pozycje i zakres do ustalenia. Kwota zależy od nawierzchni, wzoru, konstrukcji i grafiki.</div><div className="randomizer-actions"><button className="btn dark" onClick={()=>randomizeLibrary(false)}>🎲 Losuj nowy wzór</button><button className="btn subtle" onClick={()=>randomizeLibrary(true)}>↻ Podobny kierunek</button><button className="btn subtle" onClick={()=>applyPattern(randomPick.familyId,randomPick.variant,randomPick.paletteId)}>Projektuj w Studio</button></div></aside></section>})():patternMode==="signature"?<><div className="signature-intro"><span className="eyebrow">CURATED BY GAMEFIELDS</span><h2>12 kierunków, które powinny otwierać rozmowę z klientem</h2><p>To nie są przypadkowe wariacje. Każdy preset ma inny charakter, zastosowanie i poziom ekspresji.</p></div><div className="signature-grid">{signaturePresets.map(preset=>{const preview={...p,pattern:getPatternFamily(preset.familyId).name,patternFamily:preset.familyId,patternVariant:preset.variant,patternPalette:preset.paletteId,objects:[],scene:"day" as const};return <article className="signature-card" key={preset.id}><button className="signature-preview" onClick={()=>applySignature(preset.id)}><Court p={preview} small/></button><section><span className="eyebrow">{preset.eyebrow}</span><h2>{preset.name}</h2><div className="signature-use">{preset.useCase}</div><p>{preset.note}</p><div className="signature-code">{patternCode(preset.familyId,preset.variant)} · {getPatternPalette(preset.paletteId).name}</div><button className="btn dark full" onClick={()=>applySignature(preset.id)}>Otwórz w Studio</button></section></article>})}</div></>:<><div className="pattern-toolbar"><div className="pattern-filters">{patternFilters.map(f=><button key={f.id} className={patternFilter===f.id?"active":""} onClick={()=>{setPatternFilter(f.id);setPatternPage(1)}}>{f.label}</button>)}</div><input aria-label="Szukaj wzoru" placeholder="Szukaj: organic, street, premium…" value={patternSearch} onChange={e=>{setPatternSearch(e.target.value);setPatternPage(1)}}/></div><div className="pattern-result-head"><strong>{patternCatalog.length} wzorów</strong><span>Strona {patternPage} / {patternPages}</span></div><div className="pattern-grid">{visiblePatterns.map(item=>{const preview={...p,id:patternCode(item.family.id,item.variant),pattern:item.family.name,patternFamily:item.family.id,patternVariant:item.variant,patternPalette:p.patternPalette||"miami",objects:[],scene:"day" as const};return <article className="pattern-card" key={item.family.id+"-"+item.variant}><button className="pattern-preview" onClick={()=>applyPattern(item.family.id,item.variant)}><Court p={preview} small/></button><section><div><span className="eyebrow">{patternCode(item.family.id,item.variant)}</span><h2>{item.family.name} / {item.name}</h2></div><div className="pattern-meta"><span>{item.family.group}</span><span>wykonanie {patternComplexity(item.family.id,item.variant)}/4</span></div><p>{item.family.description}</p><button className="btn dark full" onClick={()=>applyPattern(item.family.id,item.variant)}>Zastosuj wzór</button></section></article>})}</div><div className="catalog-pages"><button className="btn subtle" disabled={patternPage<=1} onClick={()=>setPatternPage(x=>Math.max(1,x-1))}>Poprzednie</button><span>{patternPage} / {patternPages}</span><button className="btn subtle" disabled={patternPage>=patternPages} onClick={()=>setPatternPage(x=>Math.min(patternPages,x+1))}>Następne</button></div></>}</main>:view==="templates"?<main className="os template-catalog"><div className="oshead"><div><span className="eyebrow">KOLEKCJA GAMEFIELDS</span><h1>Gotowe projekty</h1><p>Wybierz przygotowany wzór i dopasuj go do swojej przestrzeni.</p></div><button className="btn subtle" disabled={templatesLoading} onClick={()=>void loadTemplates(templatePage)}>Odśwież listę</button></div>{templatesLoading?<p role="status">Wczytywanie projektów…</p>:templateError?<div role="alert" className="empty"><p>{templateError}</p><button className="btn dark" onClick={()=>void loadTemplates(templatePage)}>Spróbuj ponownie</button></div>:templates.length?<><div className="projectgrid">{templates.map(item=><article className="template-card" key={item.id}><div className="template-image">{item.image?<img src={item.image} alt={item.title} loading="lazy"/>:<div className="template-no-image"><Grid2X2 size={42}/><span>Podgląd w edytorze</span></div>}</div><section><h2>{item.title}</h2>{item.description?<p>{item.description}</p>:null}<button className="btn dark full" disabled={openingTemplate!==null} onClick={()=>void openTemplate(item)}>{openingTemplate===item.id?"Otwieranie…":"Edytuj ten wzór"}</button><a className="textbtn" href={item.link} target="_blank" rel="noopener">Opis projektu ↗</a></section></article>)}</div><div className="catalog-pages"><button className="btn subtle" disabled={templatePage<=1} onClick={()=>void loadTemplates(templatePage-1)}>Poprzednie</button><span>{templatePage} / {templateTotal}</span><button className="btn subtle" disabled={templatePage>=templateTotal} onClick={()=>void loadTemplates(templatePage+1)}>Następne</button></div></>:<div className="empty"><Grid2X2 size={36}/><h2>Wzory pojawią się tutaj</h2><p>Przygotowujemy kolekcję projektów. W tym czasie możesz stworzyć własny.</p><button className="btn dark" onClick={()=>setView("builder")}>Przejdź do Studio</button></div>}</main>:null}
 </>;
}
