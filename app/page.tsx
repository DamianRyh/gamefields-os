"use client";
import {useEffect,useId,useMemo,useRef,useState} from "react";
import {Grid2X2,Layers,Ruler,Palette,Goal,Paintbrush,CircleDashed,Plus,Check,Download,FolderOpen,RotateCcw,Undo2,Redo2,Upload,Type,Trash2,Move,Sun,Moon,PartyPopper,WalletCards} from "lucide-react";
import {Slider} from "@/components/ui/slider";
import {Switch} from "@/components/ui/switch";
import {Toaster,toast} from "sonner";

import {projectSchema,type Project,type EditorObject,type Target,type ObjectKind} from "@/lib/project";
import {patternFamilies,patternPalettes,patternFilters,signaturePresets,variants as patternVariants,getPatternFamily,getPatternPalette,patternCode,patternComplexity,complexityLabel,patternVariantName,filteredPatternFamilies,PATTERN_COUNT} from "@/lib/pattern-library";
import {PatternArt} from "@/components/pattern-art";
import {sportProfiles,getSportProfile,type SportProfile} from "@/lib/sport-profiles";

const uid=()=>Math.random().toString(36).slice(2,9);
const obj=(kind:ObjectKind,name:string,x:number,y:number,extra:Partial<EditorObject>={}):EditorObject=>({id:uid(),kind,name,x,y,scale:100,rotation:0,opacity:100,color:"#ffffff",target:"court",...extra});
const initial:Project={id:"GF-001",name:"Moje boisko 3×3",type:"Nowe boisko",sport:"Piłka nożna 3×3",length:15,width:10,surface:"Akryl sportowy",base:"#246f70",zone:"#ef744e",outside:"#dedfd4",lineColor:"#ffffff",lines:true,pattern:"Organic Flow",patternFamily:"organic-flow",patternPalette:"miami",patternVariant:1,patternDensity:100,gradientEnabled:false,textureEnabled:false,shadowEnabled:true,artistFinishEnabled:false,creativity:0,shadowIntensity:25,graphicOpacity:100,graphicScale:100,graphicRotation:0,scene:"day",objects:[obj("equipment","Bramka",26,200,{scale:85}),obj("equipment","Bramka",574,200,{scale:85,rotation:180})],status:"Szkic",date:"29.09.2026"};
const modules=[["Boisko",Ruler],["Design",Paintbrush],["Wyposażenie",Goal],["Podsumowanie",WalletCards]] as const;
const sports=sportProfiles.map(x=>x.sport);
const featuredSportIds=["street-football-3x3","basketball-3x3","tennis","padel","pickleball","skate"];
const sportGroups=[
 {label:"Football",ids:["street-football-1x1","futsal"]},
 {label:"Court Sports",ids:["basketball-full","badminton","volleyball","beach-volleyball"]},
 {label:"Urban & Training",ids:["teqball","street-workout"]},
 {label:"Flexible",ids:["multisport","custom"]}
];
const surfaces=["Akryl sportowy","EPDM","Sztuczna trawa 60 mm","Moduły sportowe","Piasek sportowy","Beton sportowy"];
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
function EditorObjectView({o,h,selected,onPointerDown}:{o:EditorObject;h:number;selected:boolean;onPointerDown:(e:React.PointerEvent<SVGElement>,id:string,mode?:"move"|"scale"|"rotate")=>void}){
 let x=o.x,y=o.y,rot=o.rotation;
 if(o.target==="band-top")y=-22;
 if(o.target==="band-bottom")y=h+22;
 if(o.target==="band-left"){x=-22;rot-=90}
 if(o.target==="band-right"){x=622;rot+=90}
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
function Court({p,iso=false,small=false,selectedId,onSelect,onDragStart,onDropEquipment}:{p:Project;iso?:boolean;small?:boolean;selectedId?:string|null;onSelect?:(id:string|null)=>void;onDragStart?:(e:React.PointerEvent<SVGElement>,id:string,mode?:"move"|"scale"|"rotate")=>void;onDropEquipment?:(name:string,x:number,y:number)=>void}){
 const w=600,h=600*p.width/p.length;
 const svgRef=useRef<SVGSVGElement>(null);
 const patternId=useId(),clipId=useId();
 function drop(e:React.DragEvent<SVGSVGElement>){if(!onDropEquipment)return;e.preventDefault();const name=e.dataTransfer.getData("gamefields/equipment");if(!name)return;const svg=svgRef.current;if(!svg)return;const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const ctm=svg.getScreenCTM();if(!ctm)return;const loc=pt.matrixTransform(ctm.inverse());onDropEquipment(name,Math.max(0,Math.min(600,loc.x)),Math.max(0,Math.min(h,loc.y)))}
 return <svg ref={svgRef} role="img" aria-label={"Projekt boiska "+p.length+" na "+p.width+" metrów"} className={"court "+(iso?"iso":"")} viewBox={"-95 -95 "+(w+190)+" "+(h+190)} onPointerDown={e=>{if(e.target===e.currentTarget)onSelect?.(null)}} onDragOver={e=>e.preventDefault()} onDrop={drop}>
  <defs><pattern id={patternId} width="60" height="60" patternUnits="userSpaceOnUse"><rect width="30" height="60" fill="#fff" opacity=".045"/></pattern><clipPath id={clipId}><rect width={w} height={h}/></clipPath></defs>
  <rect x="-40" y="-40" width={w+80} height={h+80} rx="3" fill={p.outside}/>
  <rect width={w} height={h} fill={p.base}/>
  {p.surface.includes("trawa")?<rect width={w} height={h} fill={"url(#"+patternId+")"}/>:null}
  {(p.sport.includes("Piłka nożna")||p.sport==="Futsal")?<path d={"M0 "+h*.25+"h100v"+h*.5+"H0Z M600 "+h*.25+"H500v"+h*.5+"h100Z"} fill={p.zone}/>:null}
  {(p.sport==="Koszykówka"||p.sport==="Koszykówka 3×3")?<path d={p.sport==="Koszykówka 3×3"?"M0 "+(h/2-55)+"H130V"+(h/2+55)+"H0Z":"M0 "+(h/2-55)+"H125V"+(h/2+55)+"H0Z M600 "+(h/2-55)+"H475V"+(h/2+55)+"H600Z"} fill={p.zone}/>:null}
  {["Tenis","Padel","Badminton","Pickleball"].includes(p.sport)?<rect x="175" y="10" width="250" height={h-20} fill={p.zone} opacity=".28"/>:null}
  {(p.sport==="Siatkówka"||p.sport==="Siatkówka plażowa")?<rect x="200" y="10" width="200" height={h-20} fill={p.zone} opacity=".28"/>:null}
  {p.sport==="Teqball"?<rect x="240" y={Math.max(10,h/2-70)} width="120" height="140" rx="18" fill={p.zone} opacity=".34"/>:null}
  {p.sport==="Skate"?<path d={"M50 "+h*.18+"H250L320 "+h*.42+"H550V"+h*.72+"H350L280 "+h*.55+"H50Z"} fill={p.zone} opacity=".32"/>:null}
  {p.sport==="Street Workout"?<><rect x="70" y={h*.15} width="180" height={h*.7} rx="18" fill={p.zone} opacity=".32"/><rect x="350" y={h*.15} width="180" height={h*.7} rx="18" fill={p.zone} opacity=".22"/></>:null}
  <g clipPath={"url(#"+clipId+")"}><PatternArt p={p} h={h}/></g>
  {p.lines?<g fill="none" stroke={p.lineColor} strokeWidth="2.5">
   <rect x="10" y="10" width="580" height={h-20}/>
   {(p.sport.includes("Piłka nożna")||p.sport==="Wielofunkcyjne")?<><path d={"M300 10V"+(h-10)}/><circle cx="300" cy={h/2} r={Math.min(48,h*.18)}/><path d={"M10 "+h*.25+"H100V"+h*.75+"H10 M590 "+h*.25+"H500V"+h*.75+"H590"}/><circle cx="68" cy={h/2} r="2"/><circle cx="532" cy={h/2} r="2"/></>:null}
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
    <rect x="-8" y="-13" width="616" height="18" rx="2" fill="#20352c"/>
    <rect x="-8" y={h-5} width="616" height="18" rx="2" fill="#20352c"/>
    <rect x="-13" y="-5" width="18" height={h+10} rx="2" fill="#20352c"/>
    <rect x="595" y="-5" width="18" height={h+10} rx="2" fill="#20352c"/>
    <text x="300" y="-1" textAnchor="middle" fill="#d8ff77" fontSize="8" fontWeight="900" letterSpacing="2">GAMEFIELDS</text>
    <text x="300" y={h+8} textAnchor="middle" fill="#d8ff77" fontSize="8" fontWeight="900" letterSpacing="2">DESIGN THE GAME</text>
  </g>:null}
  {p.scene==="event"?<EventScene h={h}/>:null}
  {p.objects.map(o=><EditorObjectView key={o.id} o={o} h={h} selected={o.id===selectedId} onPointerDown={onDragStart||(()=>{})}/>)}
  {!small?<g fill={p.scene==="night"?"#d7e1dc":"#66736d"} fontSize="13"><text x="300" y="-68" textAnchor="middle">{p.length} m</text><text x="670" y={h/2} textAnchor="middle">{p.width} m</text></g>:null}
 </svg>;
}

function download(p:Project,wordpress=false){if(wordpress&&!projectSchema.safeParse(p).success){toast.error("Uzupełnij nazwę i sprawdź ustawienia projektu przed eksportem wzoru.");return}const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(p,null,2)],{type:wordpress?"text/plain":"application/json"}));a.download=p.id+(wordpress?"-wzor-gamefields.txt":"-gamefields-v05.json");a.click();URL.revokeObjectURL(a.href)}

type TemplateCard={id:number;title:string;description:string;image:string|null;link:string};
export default function Home(){
 const [templates,setTemplates]=useState<TemplateCard[]>([]),[templatesLoading,setTemplatesLoading]=useState(false),[templateError,setTemplateError]=useState(""),[templatePage,setTemplatePage]=useState(1),[templateTotal,setTemplateTotal]=useState(1),[openingTemplate,setOpeningTemplate]=useState<number|null>(null);
 const [patternFilter,setPatternFilter]=useState("all"),[patternSearch,setPatternSearch]=useState(""),[patternPage,setPatternPage]=useState(1),[patternMode,setPatternMode]=useState<"random"|"signature"|"all">("random"),[randomPick,setRandomPick]=useState({familyId:"organic-flow",variant:6,paletteId:"warsaw"});
 const templateRequest=useRef(0);
 async function loadTemplates(page=1){const request=++templateRequest.current;setTemplatesLoading(true);setTemplateError("");try{const r=await fetch("/api/templates?page="+page,{cache:"no-store"});if(!r.ok)throw new Error();const data=await r.json() as {items:TemplateCard[];pages:number};if(request!==templateRequest.current)return;setTemplates(data.items);setTemplatePage(page);setTemplateTotal(data.pages)}catch{if(request===templateRequest.current)setTemplateError("Nie udało się pobrać katalogu. Spróbuj ponownie.")}finally{if(request===templateRequest.current)setTemplatesLoading(false)}}
 function showTemplates(){setView("templates");void loadTemplates(1)}
 async function openTemplate(item:TemplateCard){if(openingTemplate!==null)return;setOpeningTemplate(item.id);try{const r=await fetch("/api/templates?id="+item.id,{cache:"no-store"});if(!r.ok)throw new Error();const data=await r.json() as {project:unknown};const original=projectSchema.parse(data.project);const copy={...original,id:"GF-"+uid(),name:item.title.slice(0,190)+" — kopia",objects:original.objects.map(o=>({...o,id:uid()}))};finishDrag.current?.();history(p);setP(copy);setSelectedId(null);setView("builder");toast.success("Otworzono kopię wzoru. Oryginał pozostaje bez zmian.")}catch{toast.error("Ten wzór nie ma poprawnego pliku projektu lub został wycofany.")}finally{setOpeningTemplate(null)}}
 useEffect(()=>{if(new URLSearchParams(window.location.search).get("view")==="templates"){setView("templates");void loadTemplates(1)}},[]);

 const [p,setP]=useState<Project>(initial),[view,setView]=useState("sport"),[module,setModule]=useState(5),[iso,setIso]=useState(false),[selectedId,setSelectedId]=useState<string|null>(null),[undoStack,setUndo]=useState<Project[]>([]),[redoStack,setRedo]=useState<Project[]>([]),[projects,setProjects]=useState<Project[]>([]);
 useEffect(()=>{
   const params=new URLSearchParams(window.location.search);
   const familyId=params.get("pattern"),paletteId=params.get("palette"),sport=params.get("sport"),shadowRaw=Number(params.get("shadow"));
   const variantRaw=Number(params.get("variant")||"1");
   if(familyId&&patternFamilies.some(x=>x.id===familyId)){
     const family=getPatternFamily(familyId);
     const variant=Math.max(1,Math.min(12,Number.isFinite(variantRaw)?variantRaw:1));
     const palette=patternPalettes.some(x=>x.id===paletteId)?getPatternPalette(paletteId||"miami"):getPatternPalette("miami");
     setP(v=>{const shadowIntensity=Number.isFinite(shadowRaw)?Math.max(0,Math.min(100,shadowRaw)):(v.shadowIntensity??25);return {...v,pattern:family.name,patternFamily:family.id,patternVariant:variant,patternPalette:palette.id,base:palette.colors[4],zone:palette.colors[1],sport:sport&&sports.includes(sport)?sport:v.sport,...shadowPatch(shadowIntensity),graphicOpacity:100}});
     setModule(5);setView("builder");
   }
 },[]);
 const uploadRef=useRef<HTMLInputElement>(null),importRef=useRef<HTMLInputElement>(null);
 async function importProject(file?:File){if(!file)return;if(file.size>12000000){toast.error("Plik projektu może mieć maksymalnie 12 MB.");return}try{const next=projectSchema.parse(JSON.parse(await file.text()));if(new Set(next.objects.map(o=>o.id)).size!==next.objects.length)throw new Error("ids");history(p);setP(next);setSelectedId(null);setView("builder");toast.success("Wczytano projekt")}catch{toast.error("Nieprawidłowy plik projektu. Wybierz eksport JSON z edytora v0.5.")}}
 const dragStart=useRef<Project|null>(null);
 const finishDrag=useRef<(()=>void)|null>(null);
 const area=p.length*p.width;
 const [quote,setQuote]=useState<{priceNet:number;priceGross:number;currency:string}|null>(null),[quoteLoading,setQuoteLoading]=useState(true);
 useEffect(()=>{
  const controller=new AbortController();
  const timer=window.setTimeout(async()=>{
   setQuoteLoading(true);
   try{
    const safeProject={...p,objects:p.objects.map(({src,...o})=>o)};
    const response=await fetch("/api/quote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(safeProject),cache:"no-store",signal:controller.signal});
    if(!response.ok)throw new Error("quote");
    const data=await response.json() as {priceNet:number;priceGross:number;currency:string};
    setQuote(data);
   }catch(e){if(!controller.signal.aborted)setQuote(null)}
   finally{if(!controller.signal.aborted)setQuoteLoading(false)}
  },320);
  return()=>{window.clearTimeout(timer);controller.abort()};
 },[p]);
 const selected=p.objects.find(o=>o.id===selectedId)||null;
 const patternCatalog=useMemo(()=>filteredPatternFamilies(patternFilter).flatMap(family=>patternVariants.map(v=>({family,variant:v.variant,name:patternVariantName(family.id,v.variant)}))).filter(item=>!patternSearch.trim()||[item.family.name,item.family.description,...item.family.tags,patternCode(item.family.id,item.variant)].join(" ").toLowerCase().includes(patternSearch.toLowerCase())),[patternFilter,patternSearch]);
 const patternPages=Math.max(1,Math.ceil(patternCatalog.length/24));
 const visiblePatterns=patternCatalog.slice((patternPage-1)*24,patternPage*24);
 function history(prev:Project){setUndo(s=>[...s.slice(-39),prev]);setRedo([])}
 function update(patch:Partial<Project>,track=true){if(track)history(p);setP(v=>({...v,...patch}))}
 function selectSport(profile:SportProfile){
  const h=600*profile.width/profile.length;
  const objects:EditorObject[]=[];
  if(profile.sport.includes("Piłka nożna"))objects.push(obj("equipment","Bramka",26,h/2,{scale:85}),obj("equipment","Bramka",574,h/2,{scale:85,rotation:180}));
  if(profile.sport==="Futsal")objects.push(obj("equipment","Bramka futsal",26,h/2,{scale:85}),obj("equipment","Bramka futsal",574,h/2,{scale:85,rotation:180}));
  if(profile.sport==="Koszykówka 3×3")objects.push(obj("equipment","Kosz",38,h/2,{scale:88}));
  if(profile.sport==="Koszykówka")objects.push(obj("equipment","Kosz",38,h/2,{scale:88}),obj("equipment","Kosz",562,h/2,{scale:88,rotation:180}));
  if(["Tenis","Padel","Siatkówka","Pickleball"].includes(profile.sport))objects.push(obj("equipment","Siatka",300,h/2,{scale:110,rotation:90}));
  if(profile.sport==="Badminton")objects.push(obj("equipment","Siatka badminton",300,h/2,{scale:110,rotation:90}));
  if(profile.sport==="Siatkówka plażowa")objects.push(obj("equipment","Siatka beach",300,h/2,{scale:115,rotation:90}));
  if(profile.sport==="Teqball")objects.push(obj("equipment","Stół Teqball",300,h/2,{scale:110}));
  if(profile.sport==="Skate")objects.push(obj("equipment","Funbox",300,h/2,{scale:105}),obj("equipment","Rail skate",180,h*.68,{scale:85}),obj("equipment","Ledge",430,h*.3,{scale:90}));
  if(profile.sport==="Street Workout")objects.push(obj("equipment","Drążki",180,h/2,{scale:100}),obj("equipment","Poręcze",390,h*.62,{scale:95}),obj("equipment","Monkey bars",390,h*.3,{scale:90}));
  setP(v=>({...v,name:profile.label+" — projekt",sport:profile.sport,length:profile.length,width:profile.width,surface:profile.surface,base:profile.base,zone:profile.zone,outside:profile.outside,lineColor:profile.lineColor,lines:!["Skate","Street Workout"].includes(profile.sport),objects}));
  setModule(0);setView("builder");setSelectedId(null);setUndo([]);setRedo([]);
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
   const center={x:startObj.target==="band-left"?-22:startObj.target==="band-right"?622:startObj.x,y:startObj.target==="band-top"?-22:startObj.target==="band-bottom"?h+22:startObj.y};
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
       return {...o,x:Math.max(-50,Math.min(650,startObj.x+loc.x-first.x)),y:Math.max(-60,Math.min(600*v.width/v.length+70,startObj.y+loc.y-first.y))}
     })}))
   };
   const up=()=>{if(moved&&dragStart.current)history(dragStart.current);dragStart.current=null;window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",up);finishDrag.current=null};
   finishDrag.current=up;
   window.addEventListener("pointermove",move);window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up)
 }
 function handleUploads(files:FileList|null){if(!files)return;[...files].forEach((f,i)=>{if(!["image/png","image/svg+xml"].includes(f.type)){toast.error("Obsługiwane są pliki PNG i SVG.");return}if(f.size>2000000){toast.error("Logo może mieć maksymalnie 2 MB.");return}const r=new FileReader();r.onerror=()=>toast.error("Nie udało się odczytać logo.");r.onload=()=>addObject(obj("image",f.name,300+i*25,300*p.width/p.length,{src:String(r.result),scale:90}));r.readAsDataURL(f)})}
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
   setView("builder");setModule(5);toast.success(patternCode(familyId,variant)+" zastosowany");
 }
 function shufflePattern(similar=false){
   const source=similar?[getPatternFamily(p.patternFamily)]:patternFamilies;
   const family=source[Math.floor(Math.random()*source.length)],variant=1+Math.floor(Math.random()*12);
   const palette=similar?getPatternPalette(p.patternPalette):patternPalettes[Math.floor(Math.random()*patternPalettes.length)];
   applyPattern(family.id,variant,palette.id);
 }
 const choices=(items:string[],value:string,change:(s:string)=>void)=><div className="choices compact">{items.map(s=><button key={s} className={value===s?"choice selected":"choice"} onClick={()=>change(s)}><span>{s}</span>{value===s?<Check size={15}/>:null}</button>)}</div>;
 return <><Toaster position="bottom-right"/>
 <header className="header"><button className="brand" onClick={()=>setView("builder")}><span className="brand-icon"><Grid2X2 size={21}/></span>gamefields<span className="brand-studio">STUDIO</span></button><nav><button className={view==="builder"?"active":""} onClick={()=>setView("builder")}>Studio</button><button className={view==="patterns"?"active":""} onClick={()=>{setPatternPage(1);setView("patterns")}}>Wzory</button><button className={view==="projects"?"active":""} onClick={()=>setView("projects")}>Projekty</button></nav><a className="site-link" href="https://www.gamefields.eu/" target="_top">← Gamefields.eu</a><span className="version">v2.2</span></header>
 {view==="sport"?<main className="sport-start"><section className="sport-start-head"><span className="eyebrow">GAMEFIELDS / SPORT ENGINE</span><h1>Co chcesz zaprojektować?</h1><p>Wybierz dyscyplinę. Resztę ustawimy automatycznie — geometrię, wymiary startowe, linie, wyposażenie i nawierzchnię.</p></section><section className="sport-grid featured">{sportProfiles.filter(profile=>featuredSportIds.includes(profile.id)).map(profile=>{const preview={...p,sport:profile.sport,length:profile.length,width:profile.width,surface:profile.surface,base:profile.base,zone:profile.zone,outside:profile.outside,lineColor:profile.lineColor,objects:[]};return <button className="sport-card" key={profile.id} onClick={()=>selectSport(profile)}><div className="sport-preview"><Court p={preview} small/></div><div className="sport-card-copy"><span className="eyebrow">{profile.eyebrow}</span><h2>{profile.label}</h2><p>{profile.description}</p><div className="sport-meta"><span>{profile.length} × {profile.width} m</span><span>{profile.tags.slice(0,2).join(" · ")}</span></div></div></button>})}</section><details className="more-sports"><summary>Więcej dyscyplin <span>+</span></summary><div className="sport-groups">{sportGroups.map(group=><section key={group.label}><h2>{group.label}</h2><div className="sport-compact-grid">{sportProfiles.filter(profile=>group.ids.includes(profile.id)).map(profile=><button key={profile.id} onClick={()=>selectSport(profile)}><span>{profile.label}</span><small>{profile.length} × {profile.width} m</small></button>)}</div></section>)}</div></details></main>:null}
 {view==="builder"?<>
 <div className="projectbar v03bar"><div><span className="eyebrow">PROJEKT / {getSportProfile(p.sport).label}</span><input className="projectname" aria-label="Nazwa projektu" maxLength={200} value={p.name} onChange={e=>update({name:e.target.value},false)}/></div><div className="history-actions"><button onClick={undo} disabled={!undoStack.length}><Undo2 size={17}/> Cofnij</button><button onClick={redo} disabled={!redoStack.length}><Redo2 size={17}/> Ponów</button></div><div className="actions"><button className="btn dark" onClick={()=>{setProjects(x=>[p,...x.filter(q=>q.id!==p.id)]);toast.success("Projekt zapisany w tej sesji")}}>Zapisz projekt</button><details className="more-actions"><summary>•••</summary><div><input hidden ref={importRef} type="file" accept=".json,.txt,application/json,text/plain" onChange={e=>{void importProject(e.target.files?.[0]);e.target.value=""}}/><button onClick={()=>importRef.current?.click()}>Wczytaj JSON</button><button onClick={()=>download(p,true)}>Wzór do WordPress</button><button onClick={()=>download(p)}>Eksport JSON</button></div></details></div></div>
 <div className={"builder v03builder "+(selected?"has-inspector":"")}>
 <aside className="rail">{modules.map(([name,Icon],i)=><button key={name} className={i===module?"module active":"module"} onClick={()=>setModule(i)}><Icon size={22}/><span>{name}</span></button>)}</aside>
 <section className="settings"><div className="paneltitle"><span className="eyebrow">0{module+1} / 04</span><h1>{modules[module][0]}</h1><p>{["Sport, wymiary, nawierzchnia i linie.","Wzór, kolory i charakter projektu.","Tylko wyposażenie właściwe dla tej dyscypliny.","Sprawdź projekt i orientacyjną cenę realizacji."][module]}</p></div><div className="panelbody">
  {module===0?<>
   <div className="sport-summary-card"><span className="eyebrow">{getSportProfile(p.sport).eyebrow}</span><strong>{getSportProfile(p.sport).label}</strong><small>{p.length} × {p.width} m · {area} m²</small><button className="textbtn compact" onClick={()=>setView("sport")}>Zmień dyscyplinę</button></div>
   <div className="dimension"><label>Długość <strong>{p.length} m</strong></label><Slider min={6} max={60} value={[p.length]} onValueChange={v=>update({length:v[0]})}/></div>
   <div className="dimension"><label>Szerokość <strong>{p.width} m</strong></label><Slider min={6} max={40} value={[p.width]} onValueChange={v=>update({width:v[0]})}/></div>
   <h3>Nawierzchnia</h3>{choices(surfaces,p.surface,s=>update({surface:s}),true)}
   <details className="advanced-options"><summary>Linie i ustawienia techniczne</summary><div><label className="switchrow">Pokaż linie<Switch checked={p.lines} onCheckedChange={v=>update({lines:v})}/></label><label className="colorrow"><span>Kolor linii</span><input type="color" value={p.lineColor} onChange={e=>update({lineColor:e.target.value})}/></label></div></details>
  </>:null}
  {module===1?<>
   <div className="pattern-current simple"><span className="eyebrow">AKTUALNY KIERUNEK</span><strong>{getPatternFamily(p.patternFamily).name}</strong><small>{getPatternPalette(p.patternPalette).name} · {patternCode(p.patternFamily||"organic-flow",p.patternVariant||1)}</small></div>
   <div className="design-primary-actions"><button className="btn dark full" onClick={()=>shufflePattern(false)}>🎲 Losuj kierunek</button><button className="btn subtle full" onClick={()=>shufflePattern(true)}>↻ Podobny</button><button className="btn subtle full" onClick={()=>{setPatternPage(1);setView("patterns")}}>Zobacz więcej wzorów</button></div>
   <h3>Kolorystyka</h3><div className="palette-quick clean">{patternPalettes.slice(0,6).map(pal=><button key={pal.id} className={(p.patternPalette||"miami")===pal.id?"selected":""} onClick={()=>applyPalette(pal.id)} title={pal.name}>{pal.colors.map(col=><i key={col} style={{background:col}}/>)}</button>)}</div>
   <details className="advanced-options"><summary>Zaawansowane ustawienia designu</summary><div>
    <h3>Wariant kompozycji</h3><div className="variant-number-grid compact">{patternVariants.map(v=><button key={v.variant} className={(p.patternVariant||1)===v.variant?"selected":""} onClick={()=>update({patternVariant:v.variant})}><b>{String(v.variant).padStart(2,"0")}</b></button>)}</div>
    <div className="dimension"><label>Cień / głębia <strong>{p.shadowIntensity??25}</strong></label><Slider min={0} max={100} step={5} value={[p.shadowIntensity??25]} onValueChange={v=>update(shadowPatch(v[0]))}/></div>
    <div className="dimension"><label>Intensywność wzoru <strong>{p.graphicOpacity}%</strong></label><Slider min={20} max={100} value={[p.graphicOpacity]} onValueChange={v=>update({graphicOpacity:v[0]})}/></div>
    <div className="dimension"><label>Skala wzoru <strong>{p.patternDensity||100}%</strong></label><Slider min={60} max={140} value={[p.patternDensity||100]} onValueChange={v=>update({patternDensity:v[0]})}/></div>
    <h3>Kolory techniczne</h3>{(["base","zone","outside"] as const).map((k,i)=><label className="colorrow" key={k}><span>{["Pole gry","Strefy","Otoczenie"][i]}</span><input type="color" value={p[k]} onChange={e=>update({[k]:e.target.value})}/></label>)}
    <div className="studio-divider"/><div className="studio-actions"><button className="btn subtle full" onClick={()=>uploadRef.current?.click()}><Upload size={17}/> Dodaj własne logo</button><input ref={uploadRef} hidden multiple type="file" accept=".png,.svg,image/png,image/svg+xml" onChange={e=>{handleUploads(e.target.files);e.target.value=""}}/><button className="btn subtle full" onClick={addText}><Type size={17}/> Dodaj tekst</button></div>
   </div></details>
  </>:null}
  {module===2?<>
   <div className="libraryhint"><Move size={16}/><span>Pokazujemy tylko elementy właściwe dla <b>{getSportProfile(p.sport).label}</b>.</span></div>
   <div className="equipmentgrid">{getSportProfile(p.sport).equipment.map(name=><button key={name} draggable onDragStart={e=>e.dataTransfer.setData("gamefields/equipment",name)} onClick={()=>addEquipment(name)}><span className="equipmenticon"><svg viewBox="-70 -65 140 130" aria-hidden="true"><EquipmentShape name={name}/></svg></span><b>{name}</b></button>)}</div>
   {p.objects.length?<div className="current-objects"><h3>Dodane elementy</h3>{p.objects.map((o,i)=><button key={o.id} className={o.id===selectedId?"selected":""} onClick={()=>setSelectedId(o.id)}><span>{i+1}. {o.name}</span><small>Edytuj →</small></button>)}</div>:null}
  </>:null}
  {module===3?<>
   <div className="summary-card"><span className="eyebrow">TWÓJ PROJEKT</span><h2>{getSportProfile(p.sport).label}</h2><div className="summary-specs"><span><b>{p.length} × {p.width} m</b> wymiary</span><span><b>{area} m²</b> powierzchnia</span><span><b>{p.surface}</b> nawierzchnia</span><span><b>{getPatternFamily(p.patternFamily).name}</b> wzór</span><span><b>{p.objects.length}</b> elementów</span></div></div>
   <div className="summary-price"><span>SZACOWANA CENA REALIZACJI</span><strong>{quoteLoading?"Obliczam…":quote?pln(quote.priceNet):"Do wyceny"}</strong><small>{quote?"netto · aktualizowana wraz z projektem":"Cena pojawi się po przeliczeniu konfiguracji"}</small></div>
   <button className="btn dark full" onClick={()=>{setProjects(x=>[p,...x.filter(q=>q.id!==p.id)]);toast.success("Projekt zapisany")}}>Zapisz projekt</button>
   <button className="btn subtle full" onClick={()=>download(p)}>Pobierz projekt</button>
   <p className="summary-note">Finalna cena jest potwierdzana po weryfikacji miejsca i warunków realizacji.</p>
  </>:null}
 </div></section>
 <section className={"canvas editorcanvas "+p.scene}><div className="canvashead"><span><i/> PODGLĄD NA ŻYWO</span>{selected?<button type="button" className="btn danger canvas-delete" onClick={removeSelected}><Trash2 size={16}/> Usuń: {selected.name}</button>:null}<div className="scene-controls"><button className={p.scene==="day"?"active":""} onClick={()=>update({scene:"day"})}><Sun size={14}/> Dzień</button><button className={p.scene==="night"?"active":""} onClick={()=>update({scene:"night"})}><Moon size={14}/> Noc</button><button className={p.scene==="event"?"active":""} onClick={()=>update({scene:"event"})}><PartyPopper size={14}/> Event</button><button onClick={()=>setIso(!iso)} className={iso?"active":""}><RotateCcw size={14}/> {iso?"Plan":"3D"}</button></div></div>
 <div className="drawing editing-area"><Court p={p} iso={iso} selectedId={selectedId} onSelect={setSelectedId} onDragStart={startDrag} onDropEquipment={addEquipment}/></div>
 {iso?<p className="viewhint">Widok poglądowy. Do przeciągania obiektów wybierz Plan.</p>:null}<div className="canvasmeta"><span>{p.sport} · {p.length} × {p.width} m</span><strong>{quoteLoading?"Przeliczam…":quote?pln(quote.priceNet)+" netto":"Do wyceny"}</strong></div>
 </section>
 {selected?<aside className="inspector contextual"><div className="inspectorhead"><span className="eyebrow">EDYCJA ELEMENTU</span><h2>{selected.name}</h2><button className="inspector-close" onClick={()=>setSelectedId(null)}>×</button></div><div className="inspectorbody"><div className="object-type">{selected.kind.toUpperCase()} <span>{targetLabel[selected.target]}</span></div>{(selected.kind==="text"||selected.kind==="sponsor")?<label>Treść<input value={selected.text||""} onChange={e=>updateObject(selected.id,{text:e.target.value})}/></label>:null}<label>Miejsce<select value={selected.target} onChange={e=>updateObject(selected.id,{target:e.target.value as Target})}>{Object.keys(targetLabel).map(k=><option key={k} value={k}>{targetLabel[k as Target]}</option>)}</select></label>{selected.kind!=="equipment"?<label className="colorrow"><span>Kolor</span><input type="color" value={selected.color} onChange={e=>updateObject(selected.id,{color:e.target.value})}/></label>:null}<div className="dimension"><label>Rozmiar <strong>{selected.scale}%</strong></label><Slider min={20} max={220} value={[selected.scale]} onValueChange={v=>updateObject(selected.id,{scale:v[0]})}/></div><div className="dimension"><label>Obrót <strong>{selected.rotation}°</strong></label><Slider min={-180} max={180} step={5} value={[selected.rotation]} onValueChange={v=>updateObject(selected.id,{rotation:v[0]})}/></div><button className="btn danger full" onClick={removeSelected}><Trash2 size={16}/> Usuń element</button></div></aside>:null}
 </div></>:view==="patterns"?<main className="pattern-library-page"><div className="pattern-hero"><div><span className="eyebrow">GAMEFIELDS DESIGN LIBRARY / {PATTERN_COUNT} WZORÓW</span><h1>Wybierz kierunek. Resztę dopasujesz w Studio.</h1><p>Najpierw zobacz kuratorowaną kolekcję Signature — najbardziej dopracowane kierunki do realnych realizacji. Potem możesz wejść w pełne 300 wariantów.</p></div><div className="pattern-hero-actions"><button className="btn dark" onClick={()=>shufflePattern(false)}>🎲 Losuj wzór</button><button className="btn subtle" onClick={()=>setView("builder")}>Wróć do Studio</button></div></div><div className="pattern-mode"><button className={patternMode==="random"?"active":""} onClick={()=>setPatternMode("random")}>Losuj wzór</button><button className={patternMode==="signature"?"active":""} onClick={()=>setPatternMode("signature")}>Signature / 12 kierunków</button><button className={patternMode==="all"?"active":""} onClick={()=>setPatternMode("all")}>Pełna biblioteka / {PATTERN_COUNT}</button></div>{patternMode==="random"?(()=>{const family=getPatternFamily(randomPick.familyId),palette=getPatternPalette(randomPick.paletteId),preview={...p,id:patternCode(randomPick.familyId,randomPick.variant),pattern:family.name,patternFamily:randomPick.familyId,patternVariant:randomPick.variant,patternPalette:randomPick.paletteId,objects:[],scene:"day" as const};return <section className="pattern-randomizer"><div className="randomizer-stage"><Court p={preview} small/></div><aside className="randomizer-info"><span className="eyebrow">LOSOWY KIERUNEK / {patternCode(randomPick.familyId,randomPick.variant)}</span><h2>{family.name} / {patternVariantName(randomPick.familyId,randomPick.variant)}</h2><p>{family.description}</p><div className="randomizer-palette"><span>{palette.name}</span>{palette.colors.map(col=><i key={col} style={{background:col}}/>)}</div><div className="library-price-note">Cena jest liczona po zastosowaniu wzoru w Studio i zależy od całej konfiguracji projektu.</div><div className="randomizer-actions"><button className="btn dark" onClick={()=>randomizeLibrary(false)}>🎲 Losuj nowy wzór</button><button className="btn subtle" onClick={()=>randomizeLibrary(true)}>↻ Podobny kierunek</button><button className="btn subtle" onClick={()=>applyPattern(randomPick.familyId,randomPick.variant,randomPick.paletteId)}>Projektuj w Studio</button></div></aside></section>})():patternMode==="signature"?<><div className="signature-intro"><span className="eyebrow">CURATED BY GAMEFIELDS</span><h2>12 kierunków, które powinny otwierać rozmowę z klientem</h2><p>To nie są przypadkowe wariacje. Każdy preset ma inny charakter, zastosowanie i poziom ekspresji.</p></div><div className="signature-grid">{signaturePresets.map(preset=>{const preview={...p,pattern:getPatternFamily(preset.familyId).name,patternFamily:preset.familyId,patternVariant:preset.variant,patternPalette:preset.paletteId,objects:[],scene:"day" as const};return <article className="signature-card" key={preset.id}><button className="signature-preview" onClick={()=>applySignature(preset.id)}><Court p={preview} small/></button><section><span className="eyebrow">{preset.eyebrow}</span><h2>{preset.name}</h2><div className="signature-use">{preset.useCase}</div><p>{preset.note}</p><div className="signature-code">{patternCode(preset.familyId,preset.variant)} · {getPatternPalette(preset.paletteId).name}</div><button className="btn dark full" onClick={()=>applySignature(preset.id)}>Otwórz w Studio</button></section></article>})}</div></>:<><div className="pattern-toolbar"><div className="pattern-filters">{patternFilters.map(f=><button key={f.id} className={patternFilter===f.id?"active":""} onClick={()=>{setPatternFilter(f.id);setPatternPage(1)}}>{f.label}</button>)}</div><input aria-label="Szukaj wzoru" placeholder="Szukaj: organic, street, premium…" value={patternSearch} onChange={e=>{setPatternSearch(e.target.value);setPatternPage(1)}}/></div><div className="pattern-result-head"><strong>{patternCatalog.length} wzorów</strong><span>Strona {patternPage} / {patternPages}</span></div><div className="pattern-grid">{visiblePatterns.map(item=>{const preview={...p,id:patternCode(item.family.id,item.variant),pattern:item.family.name,patternFamily:item.family.id,patternVariant:item.variant,patternPalette:p.patternPalette||"miami",objects:[],scene:"day" as const};return <article className="pattern-card" key={item.family.id+"-"+item.variant}><button className="pattern-preview" onClick={()=>applyPattern(item.family.id,item.variant)}><Court p={preview} small/></button><section><div><span className="eyebrow">{patternCode(item.family.id,item.variant)}</span><h2>{item.family.name} / {item.name}</h2></div><div className="pattern-meta"><span>{item.family.group}</span><span>wykonanie {patternComplexity(item.family.id,item.variant)}/4</span></div><p>{item.family.description}</p><button className="btn dark full" onClick={()=>applyPattern(item.family.id,item.variant)}>Zastosuj wzór</button></section></article>})}</div><div className="catalog-pages"><button className="btn subtle" disabled={patternPage<=1} onClick={()=>setPatternPage(x=>Math.max(1,x-1))}>Poprzednie</button><span>{patternPage} / {patternPages}</span><button className="btn subtle" disabled={patternPage>=patternPages} onClick={()=>setPatternPage(x=>Math.min(patternPages,x+1))}>Następne</button></div></>}</main>:view==="templates"?<main className="os template-catalog"><div className="oshead"><div><span className="eyebrow">KOLEKCJA GAMEFIELDS</span><h1>Gotowe projekty</h1><p>Wybierz przygotowany wzór i dopasuj go do swojej przestrzeni.</p></div><button className="btn subtle" disabled={templatesLoading} onClick={()=>void loadTemplates(templatePage)}>Odśwież listę</button></div>{templatesLoading?<p role="status">Wczytywanie projektów…</p>:templateError?<div role="alert" className="empty"><p>{templateError}</p><button className="btn dark" onClick={()=>void loadTemplates(templatePage)}>Spróbuj ponownie</button></div>:templates.length?<><div className="projectgrid">{templates.map(item=><article className="template-card" key={item.id}><div className="template-image">{item.image?<img src={item.image} alt={item.title} loading="lazy"/>:<div className="template-no-image"><Grid2X2 size={42}/><span>Podgląd w edytorze</span></div>}</div><section><h2>{item.title}</h2>{item.description?<p>{item.description}</p>:null}<button className="btn dark full" disabled={openingTemplate!==null} onClick={()=>void openTemplate(item)}>{openingTemplate===item.id?"Otwieranie…":"Edytuj ten wzór"}</button><a className="textbtn" href={item.link} target="_blank" rel="noopener">Opis projektu ↗</a></section></article>)}</div><div className="catalog-pages"><button className="btn subtle" disabled={templatePage<=1} onClick={()=>void loadTemplates(templatePage-1)}>Poprzednie</button><span>{templatePage} / {templateTotal}</span><button className="btn subtle" disabled={templatePage>=templateTotal} onClick={()=>void loadTemplates(templatePage+1)}>Następne</button></div></>:<div className="empty"><Grid2X2 size={36}/><h2>Wzory pojawią się tutaj</h2><p>Przygotowujemy kolekcję projektów. W tym czasie możesz stworzyć własny.</p><button className="btn dark" onClick={()=>setView("builder")}>Przejdź do Studio</button></div>}</main>:<main className="os"><div className="oshead"><div><span className="eyebrow">GAMEFIELDS OS</span><h1>Twoje projekty</h1><p className="sessionnote">Lista działa w tej sesji. Pobierz JSON przed zamknięciem strony; wczytaj go później w Studio.</p></div><button className="btn dark" onClick={()=>setView("builder")}><Plus size={17}/> Wróć do Studio</button></div>{projects.length?<div className="projectgrid">{projects.map(x=><button className="projectcard" key={x.id} onClick={()=>{setP(x);setSelectedId(null);setUndo([]);setRedo([]);setView("builder")}}><div><Court p={x} small/></div><section><span className="eyebrow">{x.id}</span><h3>{x.name}</h3><p>{x.length*x.width} m² · wycena po otwarciu</p></section></button>)}</div>:<div className="empty"><FolderOpen size={32}/><h2>Brak zapisanych projektów</h2><p>Zapisz projekt w Studio, żeby zobaczyć go tutaj.</p></div>}</main>}
 </>;
}
