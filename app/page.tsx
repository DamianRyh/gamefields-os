"use client";
import {useEffect,useId,useMemo,useRef,useState} from "react";
import {Grid2X2,Layers,Ruler,Palette,Goal,Paintbrush,CircleDashed,Plus,Check,Download,FolderOpen,RotateCcw,Undo2,Redo2,Upload,Type,Copy,Trash2,Move,Sun,Moon,PartyPopper,WalletCards} from "lucide-react";
import {Slider} from "@/components/ui/slider";
import {Switch} from "@/components/ui/switch";
import {Toaster,toast} from "sonner";

import {projectSchema,type Project,type EditorObject,type Target,type ObjectKind} from "@/lib/project";
import {patternFamilies,patternPalettes,patternFilters,variants as patternVariants,getPatternFamily,getPatternPalette,patternCode,patternComplexity,filteredPatternFamilies,PATTERN_COUNT} from "@/lib/pattern-library";

const uid=()=>Math.random().toString(36).slice(2,9);
const obj=(kind:ObjectKind,name:string,x:number,y:number,extra:Partial<EditorObject>={}):EditorObject=>({id:uid(),kind,name,x,y,scale:100,rotation:0,opacity:100,color:"#ffffff",target:"court",...extra});
const initial:Project={id:"GF-001",name:"Moje boisko 3×3",type:"Nowe boisko",sport:"Piłka nożna 3×3",length:15,width:10,surface:"Akryl sportowy",base:"#246f70",zone:"#ef744e",outside:"#dedfd4",lineColor:"#ffffff",lines:true,pattern:"Organic Flow",patternFamily:"organic-flow",patternPalette:"miami",patternVariant:1,patternDensity:100,graphicOpacity:100,graphicScale:100,graphicRotation:0,scene:"day",objects:[obj("equipment","Bramka",26,200,{scale:85}),obj("equipment","Bramka",574,200,{scale:85,rotation:180})],status:"Szkic",date:"29.09.2026"};
const modules=[["Wymiary",Ruler],["Nawierzchnia",Layers],["Kolory",Palette],["Linie",CircleDashed],["Wyposażenie",Goal],["Studio",Paintbrush]] as const;
const sports=["Piłka nożna 3×3","Koszykówka","Siatkówka","Wielofunkcyjne"];
const surfaces=["Akryl sportowy","EPDM","Sztuczna trawa 60 mm","Moduły sportowe"];
const sponsors=[["GAMEFIELDS","#d7ff74"],["WARSAW FC","#ff6b45"],["ADIDAS","#ffffff"],["NIKE","#ffffff"],["RED BULL","#f5d747"],["CITY","#86c7ff"]];
const equipmentLibrary=["Bramka","Kosz","Ławka","Lampa","Piłkochwyt","Banda","Namiot","DJ booth","Totem","Trybuna"];
const targetLabel:Record<Target,string>={"court":"Nawierzchnia","band-top":"Banda górna","band-bottom":"Banda dolna","band-left":"Banda lewa","band-right":"Banda prawa"};

function budget(p:Project){
 const area=p.length*p.width;
 const surfaceRate:Record<string,number>={"Akryl sportowy":330,"EPDM":520,"Sztuczna trawa 60 mm":610,"Moduły sportowe":690};
 const eq:Record<string,number>={"Bramka":6500,"Kosz":9000,"Ławka":2500,"Lampa":14000,"Piłkochwyt":18000,"Banda":22000,"Namiot":4500,"DJ booth":8500,"Totem":1800,"Trybuna":16000};
 const base=area*(surfaceRate[p.surface]||400);
 const equipment=p.objects.filter(o=>o.kind==="equipment").reduce((a,o)=>a+(eq[o.name]||2500),0);
 const branding=p.objects.filter(o=>o.kind!=="equipment").length*1200;
 const event=p.scene==="event"?18000:0;
 const total=base+equipment+branding+event;
 return {total,min:Math.round(total*.9/1000)*1000,max:Math.round(total*1.12/1000)*1000};
}
function pln(n:number){return new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN",maximumFractionDigits:0}).format(n)}

function Pattern({p,h}:{p:Project;h:number}){
 const family=getPatternFamily(p.patternFamily),palette=getPatternPalette(p.patternPalette),v=p.patternVariant||1;
 const opacity=p.graphicOpacity/100,scale=(p.graphicScale/100)*((p.patternDensity||100)/100);
 const [a,b,c,d,e]=palette.colors;
 const turn=(v%6)*7-14,dx=((v*47)%120)-60,dy=((v*31)%90)-45;
 const transform=`translate(${dx} ${dy}) rotate(${p.graphicRotation+turn} 300 ${h/2}) scale(${scale})`;
 const blobs=<g opacity={opacity} transform={transform}>
   <path d={`M-90 40 C70 -80 165 25 250 120 S390 255 520 90 S700 20 720 -100 L720 -130H-90Z`} fill={a}/>
   <path d={`M-80 ${h*.78} C80 ${h*.45} 165 ${h*.95} 285 ${h*.63} S470 ${h*.25} 700 ${h*.55} L700 ${h+90}H-80Z`} fill={b}/>
   <path d={`M360 -90 C300 35 440 90 395 170 S300 260 390 ${h+60} H690V-90Z`} fill={c}/>
   <circle cx={90+(v*17)%100} cy={85+(v*13)%70} r={44+(v%3)*14} fill={d}/>
   <ellipse cx={430+(v%4)*34} cy={h*.62} rx={45+(v%3)*15} ry={30+(v%4)*9} fill={e}/>
 </g>;
 switch(family.renderer){
  case "organic": return blobs;
  case "blobs": return <g opacity={opacity} transform={transform}>{[0,1,2,3,4].map((n)=><ellipse key={n} cx={80+n*130+(v%3)*18} cy={h*(.2+((n*23+v*9)%60)/100)} rx={70+(n%2)*30} ry={48+((n+v)%3)*18} fill={[a,b,c,d,e][n]}/>)}</g>;
  case "geometry": return <g opacity={opacity} transform={transform}><path d={`M-60 0H210L410 ${h}H140Z`} fill={a}/><path d={`M260 0H540L650 ${h*.62} 430 ${h}Z`} fill={b}/><circle cx="455" cy={h*.24} r="78" fill={c}/><rect x="40" y={h*.58} width="155" height={h*.34} fill={d}/></g>;
  case "bauhaus": return <g opacity={opacity} transform={transform}><rect x="-20" y="-20" width="250" height={h*.55} fill={a}/><circle cx="210" cy={h*.65} r="125" fill={b}/><path d={`M330 0H620V${h*.45}H500A170 170 0 0 1 330 ${h*.15}Z`} fill={c}/><circle cx="490" cy={h*.77} r="54" fill={d}/><rect x="285" y={h*.42} width="88" height={h*.58} fill={e}/></g>;
  case "blocks": return <g opacity={opacity} transform={transform}><rect width="210" height={h} fill={a}/><rect x="210" width="180" height={h*.5} fill={b}/><rect x="210" y={h*.5} width="180" height={h*.5} fill={c}/><rect x="390" width="230" height={h*.65} fill={d}/><rect x="390" y={h*.65} width="230" height={h*.35} fill={e}/></g>;
  case "waves": return <g opacity={opacity} transform={transform} fill="none" strokeLinecap="round">{[a,b,c,d,e].map((col,i)=><path key={col} d={`M-80 ${h*(.15+i*.17)} Q110 ${h*(.02+i*.14)} 290 ${h*(.17+i*.14)} T680 ${h*(.12+i*.16)}`} stroke={col} strokeWidth={42-(i%2)*10}/>)}</g>;
  case "contour": return <g opacity={opacity} transform={transform} fill="none" stroke={b} strokeWidth="7">{Array.from({length:9}).map((_,i)=><ellipse key={i} cx={300+(i%2)*18} cy={h/2} rx={55+i*38} ry={30+i*24} />)}</g>;
  case "camo": return <g opacity={opacity} transform={transform}>{Array.from({length:13}).map((_,i)=><path key={i} d={`M${(i*91)%620-80} ${(i*57)%h-40} q${70+(i%3)*25} -45 ${125+(i%4)*28} 12 t${-20+(i%2)*50} 105 q-95 55 -165 8z`} fill={[a,b,c,d,e][i%5]}/>)}</g>;
  case "grid": return <g opacity={opacity} transform={transform}>{Array.from({length:30}).map((_,i)=>{const x=(i%6)*105-10,y=Math.floor(i/6)*(h/5);return <rect key={i} x={x} y={y} width={75+(i%3)*18} height={h/7} fill={[a,b,c,d,e][(i+v)%5]}/>})}</g>;
  case "pixel": return <g opacity={opacity} transform={transform}>{Array.from({length:48}).map((_,i)=>{const x=(i%8)*78-10,y=Math.floor(i/8)*(h/6);return <rect key={i} x={x} y={y} width="58" height={h/8} fill={[a,b,c,d,e][(i*3+v)%5]} opacity={.45+((i+v)%4)*.16}/>})}</g>;
  case "diagonal": return <g opacity={opacity} transform={transform}>{[0,1,2,3,4].map((i)=><path key={i} d={`M${i*150-210} -40 H${i*150-80} L${i*150+140} ${h+40} H${i*150+10}Z`} fill={[a,b,c,d,e][i]}/>)}</g>;
  case "radial": return <g opacity={opacity} transform={transform}>{[a,b,c,d,e,a,b,c].map((col,i)=><path key={i} d={`M300 ${h/2} L${300+520*Math.cos(i*Math.PI/4)} ${h/2+520*Math.sin(i*Math.PI/4)} L${300+520*Math.cos((i+1)*Math.PI/4)} ${h/2+520*Math.sin((i+1)*Math.PI/4)}Z`} fill={col}/>)}</g>;
  case "sunset": return <g opacity={opacity} transform={transform}>{[e,d,c,b,a].map((col,i)=><path key={col} d={`M-60 ${h*(.15+i*.16)} Q150 ${h*(.02+i*.14)} 320 ${h*(.18+i*.14)} T660 ${h*(.12+i*.16)} V${h+70}H-60Z`} fill={col}/>)}</g>;
  case "neon": return <g opacity={opacity} transform={transform} fill="none" strokeLinecap="round">{[b,c,d,e].map((col,i)=><path key={col} d={`M${-80+i*25} ${h*(.2+i*.17)} C140 ${h*(.05+i*.08)} 380 ${h*(.85-i*.12)} 680 ${h*(.2+i*.16)}`} stroke={col} strokeWidth={12+i*5}/>)}</g>;
  case "mono": return <g opacity={opacity*.8} transform={transform}>{[0,1,2,3,4].map(i=><path key={i} d={`M${-120+i*110} -40 C${40+i*95} ${h*.2} ${20+i*120} ${h*.8} ${180+i*105} ${h+40}H${330+i*80}V-40Z`} fill={[a,b,c,d,e][i]}/>)}</g>;
  case "concrete": return <g opacity={opacity*.65} transform={transform}><rect x="-40" y="-40" width="680" height={h*.3} fill={a}/><rect x="350" y={h*.3} width="290" height={h*.7} fill={b}/><circle cx="160" cy={h*.7} r="92" fill={c}/></g>;
  case "graffiti": return <g opacity={opacity} transform={transform} fill="none" strokeLinecap="round">{[a,b,c,d,e].map((col,i)=><path key={col} d={`M${-40+i*15} ${h*(.18+i*.11)} C120 ${h*(.8-i*.06)} 260 ${-20+i*35} 390 ${h*(.72-i*.05)} S570 ${h*(.08+i*.08)} 660 ${h*(.58-i*.03)}`} stroke={col} strokeWidth={26-(i%3)*5}/>)}</g>;
  case "type": return <g opacity={opacity} transform={transform}><text x="300" y={h*.48} textAnchor="middle" fill={a} fontSize="112" fontWeight="900" letterSpacing="-7">PLAY</text><text x="300" y={h*.72} textAnchor="middle" fill={b} fontSize="55" fontWeight="900" letterSpacing="8">THE CITY</text></g>;
  case "local": return <g opacity={opacity} transform={transform}><rect width="600" height={h} fill={a}/><path d={`M0 ${h*.62} L600 ${h*.18} V${h}H0Z`} fill={b}/><text x="300" y={h*.57} textAnchor="middle" fill={c} fontSize="88" fontWeight="900" letterSpacing="4">CITY</text></g>;
  case "nature": return <g opacity={opacity} transform={transform}>{[0,1,2,3,4,5].map((i)=><path key={i} d={`M${30+i*95} ${h+45} Q${80+i*75} ${h*.35} ${125+i*80} ${h*.08} Q${190+i*60} ${h*.48} ${210+i*75} ${h+45}Z`} fill={[a,b,c,d,e][i%5]}/>)}</g>;
  case "kids": return <g opacity={opacity} transform={transform}>{Array.from({length:18}).map((_,i)=>i%3===0?<circle key={i} cx={(i*71)%620} cy={(i*47)%h} r={22+(i%4)*8} fill={[a,b,c,d,e][i%5]}/>:<rect key={i} x={(i*83)%620} y={(i*39)%h} width={35+(i%3)*20} height={35+(i%2)*20} rx={i%2?18:4} fill={[a,b,c,d,e][i%5]}/>)}</g>;
  case "premium": return <g opacity={opacity*.88} transform={transform}><rect width="600" height={h} fill={a}/><path d={`M0 ${h*.75} L220 0 H390L160 ${h}H0Z`} fill={b}/><circle cx="485" cy={h*.28} r="95" fill={c}/><rect x="410" y={h*.62} width="190" height={h*.38} fill={d}/></g>;
  case "brand": return <g opacity={opacity} transform={transform}><rect width="600" height={h} fill={a}/><path d={`M0 0H210L420 ${h}H210Z`} fill={b}/><rect x="390" y={h*.12} width="170" height={h*.76} rx="16" fill={c}/><rect x="414" y={h*.35} width="122" height={h*.3} rx="10" fill={d}/></g>;
  case "ribbons": return <g opacity={opacity} transform={transform} fill="none" strokeLinecap="round">{[a,b,c,d].map((col,i)=><path key={col} d={`M-80 ${h*(.2+i*.13)} C130 ${h*(.85-i*.08)} 250 ${h*(-.1+i*.11)} 680 ${h*(.65-i*.08)}`} stroke={col} strokeWidth={52-i*7}/>)}</g>;
  case "terrazzo": return <g opacity={opacity} transform={transform}>{Array.from({length:42}).map((_,i)=>{const x=(i*97)%640-20,y=(i*53)%h,r=8+(i%5)*4;return <path key={i} d={`M${x-r} ${y} q${r} -${r*1.6} ${r*2} 0 q-${r*.3} ${r*1.8} -${r*2} 0z`} fill={[a,b,c,d,e][i%5]}/>})}</g>;
  default:return blobs;
 }
}
function EquipmentShape({name}:{name:string}){
 if(name==="Bramka")return <g fill="#e9efec" stroke="#18372e" strokeWidth="3"><rect x="-24" y="-38" width="48" height="76" rx="3"/><path d="M-24-38l-12 10v56l12 10M24-38l12 10v56L24 38" fill="none"/></g>;
 if(name==="Kosz")return <g fill="none" stroke="#ffdf8a" strokeWidth="5"><path d="M0 22V-24"/><rect x="-24" y="-29" width="48" height="10"/><circle cx="0" cy="-10" r="13"/></g>;
 if(name==="Ławka")return <g fill="#b48b59"><rect x="-38" y="-10" width="76" height="13" rx="2"/><rect x="-33" y="4" width="7" height="18"/><rect x="26" y="4" width="7" height="18"/></g>;
 if(name==="Lampa")return <g><circle r="13" fill="#ffe46a"/><circle r="5" fill="#273733"/><path d="M0 13v45" stroke="#273733" strokeWidth="5"/></g>;
 if(name==="Piłkochwyt")return <rect x="-55" y="-10" width="110" height="20" fill="none" stroke="#54786a" strokeWidth="3" strokeDasharray="6 5"/>;
 if(name==="Banda")return <rect x="-60" y="-10" width="120" height="20" rx="2" fill="#263934"/>;
 if(name==="Namiot")return <g><path d="M-45 20L0-35L45 20Z" fill="#f0efe6" stroke="#273933" strokeWidth="3"/><path d="M-38 20v35M38 20v35" stroke="#273933" strokeWidth="4"/></g>;
 if(name==="DJ booth")return <g><rect x="-42" y="-24" width="84" height="48" rx="4" fill="#222d2a"/><circle cx="-20" cy="0" r="11" fill="#d8ff77"/><circle cx="20" cy="0" r="11" fill="#ff7757"/></g>;
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
  <path d={"M0 "+h*.25+"h100v"+h*.5+"H0Z M600 "+h*.25+"H500v"+h*.5+"h100Z"} fill={p.zone}/>
  <g clipPath={"url(#"+clipId+")"}><Pattern p={p} h={h}/></g>
  {p.lines?<g fill="none" stroke={p.lineColor} strokeWidth="2.5"><rect x="10" y="10" width="580" height={h-20}/><path d={"M300 10V"+(h-10)}/><circle cx="300" cy={h/2} r={Math.min(48,h*.18)}/>{(p.sport.includes("nożna")||p.sport==="Wielofunkcyjne")?<><path d={"M10 "+h*.25+"H100V"+h*.75+"H10 M590 "+h*.25+"H500V"+h*.75+"H590"}/><circle cx="68" cy={h/2} r="2"/><circle cx="532" cy={h/2} r="2"/></>:null}{(p.sport==="Koszykówka"||p.sport==="Wielofunkcyjne")?<><path d={"M10 "+h*.2+"Q240 "+h/2+" 10 "+h*.8+" M590 "+h*.2+"Q360 "+h/2+" 590 "+h*.8}/><rect x="10" y={h/2-45} width="100" height="90"/><rect x="490" y={h/2-45} width="100" height="90"/></>:null}</g>:null}
  <g className="band-shell">
    <rect x="-8" y="-13" width="616" height="18" rx="2" fill="#20352c"/>
    <rect x="-8" y={h-5} width="616" height="18" rx="2" fill="#20352c"/>
    <rect x="-13" y="-5" width="18" height={h+10} rx="2" fill="#20352c"/>
    <rect x="595" y="-5" width="18" height={h+10} rx="2" fill="#20352c"/>
    <text x="300" y="-1" textAnchor="middle" fill="#d8ff77" fontSize="8" fontWeight="900" letterSpacing="2">GAMEFIELDS</text>
    <text x="300" y={h+8} textAnchor="middle" fill="#d8ff77" fontSize="8" fontWeight="900" letterSpacing="2">DESIGN THE GAME</text>
  </g>
  {p.scene==="event"?<EventScene h={h}/>:null}
  {p.objects.map(o=><EditorObjectView key={o.id} o={o} h={h} selected={o.id===selectedId} onPointerDown={onDragStart||(()=>{})}/>)}
  {!small?<g fill={p.scene==="night"?"#d7e1dc":"#66736d"} fontSize="13"><text x="300" y="-68" textAnchor="middle">{p.length} m</text><text x="670" y={h/2} textAnchor="middle">{p.width} m</text></g>:null}
 </svg>;
}

function download(p:Project,wordpress=false){if(wordpress&&!projectSchema.safeParse(p).success){toast.error("Uzupełnij nazwę i sprawdź ustawienia projektu przed eksportem wzoru.");return}const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(p,null,2)],{type:wordpress?"text/plain":"application/json"}));a.download=p.id+(wordpress?"-wzor-gamefields.txt":"-gamefields-v05.json");a.click();URL.revokeObjectURL(a.href)}

type TemplateCard={id:number;title:string;description:string;image:string|null;link:string};
export default function Home(){
 const [templates,setTemplates]=useState<TemplateCard[]>([]),[templatesLoading,setTemplatesLoading]=useState(false),[templateError,setTemplateError]=useState(""),[templatePage,setTemplatePage]=useState(1),[templateTotal,setTemplateTotal]=useState(1),[openingTemplate,setOpeningTemplate]=useState<number|null>(null);\n const [patternFilter,setPatternFilter]=useState("all"),[patternSearch,setPatternSearch]=useState(""),[patternPage,setPatternPage]=useState(1);
 const templateRequest=useRef(0);
 async function loadTemplates(page=1){const request=++templateRequest.current;setTemplatesLoading(true);setTemplateError("");try{const r=await fetch("/api/templates?page="+page,{cache:"no-store"});if(!r.ok)throw new Error();const data=await r.json() as {items:TemplateCard[];pages:number};if(request!==templateRequest.current)return;setTemplates(data.items);setTemplatePage(page);setTemplateTotal(data.pages)}catch{if(request===templateRequest.current)setTemplateError("Nie udało się pobrać katalogu. Spróbuj ponownie.")}finally{if(request===templateRequest.current)setTemplatesLoading(false)}}
 function showTemplates(){setView("templates");void loadTemplates(1)}
 async function openTemplate(item:TemplateCard){if(openingTemplate!==null)return;setOpeningTemplate(item.id);try{const r=await fetch("/api/templates?id="+item.id,{cache:"no-store"});if(!r.ok)throw new Error();const data=await r.json() as {project:unknown};const original=projectSchema.parse(data.project);const copy={...original,id:"GF-"+uid(),name:item.title.slice(0,190)+" — kopia",objects:original.objects.map(o=>({...o,id:uid()}))};finishDrag.current?.();history(p);setP(copy);setSelectedId(null);setView("builder");toast.success("Otworzono kopię wzoru. Oryginał pozostaje bez zmian.")}catch{toast.error("Ten wzór nie ma poprawnego pliku projektu lub został wycofany.")}finally{setOpeningTemplate(null)}}
 useEffect(()=>{if(new URLSearchParams(window.location.search).get("view")==="templates"){setView("templates");void loadTemplates(1)}},[]);

 const [p,setP]=useState<Project>(initial),[view,setView]=useState("builder"),[module,setModule]=useState(5),[iso,setIso]=useState(false),[selectedId,setSelectedId]=useState<string|null>(null),[undoStack,setUndo]=useState<Project[]>([]),[redoStack,setRedo]=useState<Project[]>([]),[projects,setProjects]=useState<Project[]>([]),[activeVariant,setActiveVariant]=useState(0),[variants,setVariants]=useState<Project[]>([{...initial,name:"Wariant A"},{...initial,id:"GF-B",name:"Wariant B",pattern:"Bauhaus",patternFamily:"bauhaus",patternPalette:"club",patternVariant:4,base:"#1E2D55",zone:"#E9D44D"},{...initial,id:"GF-C",name:"Wariant C",pattern:"Court Camo",patternFamily:"court-camo",patternPalette:"berlin",patternVariant:7,base:"#101414",zone:"#B9FF3D"}]);
 const uploadRef=useRef<HTMLInputElement>(null),importRef=useRef<HTMLInputElement>(null);
 async function importProject(file?:File){if(!file)return;if(file.size>12000000){toast.error("Plik projektu może mieć maksymalnie 12 MB.");return}try{const next=projectSchema.parse(JSON.parse(await file.text()));if(new Set(next.objects.map(o=>o.id)).size!==next.objects.length)throw new Error("ids");history(p);setP(next);setSelectedId(null);setView("builder");toast.success("Wczytano projekt")}catch{toast.error("Nieprawidłowy plik projektu. Wybierz eksport JSON z edytora v0.5.")}}
 const dragStart=useRef<Project|null>(null);
 const finishDrag=useRef<(()=>void)|null>(null);
 const area=p.length*p.width,b=useMemo(()=>budget(p),[p]);
 const selected=p.objects.find(o=>o.id===selectedId)||null;
 const patternCatalog=useMemo(()=>filteredPatternFamilies(patternFilter).flatMap(family=>patternVariants.map(v=>({family,variant:v.variant,name:v.name}))).filter(item=>!patternSearch.trim()||[item.family.name,item.family.description,...item.family.tags,patternCode(item.family.id,item.variant)].join(" ").toLowerCase().includes(patternSearch.toLowerCase())),[patternFilter,patternSearch]);
 const patternPages=Math.max(1,Math.ceil(patternCatalog.length/24));
 const visiblePatterns=patternCatalog.slice((patternPage-1)*24,patternPage*24);
 function history(prev:Project){setUndo(s=>[...s.slice(-39),prev]);setRedo([])}
 function update(patch:Partial<Project>,track=true){if(track)history(p);setP(v=>({...v,...patch}))}
 function updateObject(id:string,patch:Partial<EditorObject>,track=true){if(track)history(p);setP(v=>({...v,objects:v.objects.map(o=>o.id===id?{...o,...patch}:o)}))}
 function addObject(o:EditorObject){history(p);setP(v=>({...v,objects:[...v.objects,o]}));setSelectedId(o.id)}
 function removeObject(id:string){if(!p.objects.some(o=>o.id===id))return;finishDrag.current?.();history(p);setP(v=>({...v,objects:v.objects.filter(o=>o.id!==id)}));setSelectedId(current=>current===id?null:current);toast.success("Usunięto element. Możesz użyć Cofnij.")}
 function removeSelected(){if(selectedId)removeObject(selectedId)}
 useEffect(()=>{const keydown=(e:KeyboardEvent)=>{const target=e.target as HTMLElement|null;if(view!=="builder"||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||target?.closest('input,textarea,select,[contenteditable="true"],[role="slider"],[role="combobox"],[role="textbox"]'))return;if((e.key==="Delete"||e.key==="Backspace")&&selectedId){e.preventDefault();removeObject(selectedId)}};window.addEventListener("keydown",keydown);return()=>window.removeEventListener("keydown",keydown)});
 useEffect(()=>()=>finishDrag.current?.(),[]);
 function undo(){const prev=undoStack[undoStack.length-1];if(!prev)return;setRedo(r=>[...r,p]);setUndo(s=>s.slice(0,-1));setP(prev);setSelectedId(null)}
 function redo(){const next=redoStack[redoStack.length-1];if(!next)return;setUndo(s=>[...s,p]);setRedo(s=>s.slice(0,-1));setP(next);setSelectedId(null)}
 function switchVariant(i:number){if(i===activeVariant)return;const next=[...variants];next[activeVariant]={...p,name:"Wariant "+String.fromCharCode(65+activeVariant)};setVariants(next);setP(next[i]);setActiveVariant(i);setSelectedId(null);setUndo([]);setRedo([])}
 function copyVariant(i:number){const next=[...variants];next[i]={...p,id:"GF-"+String.fromCharCode(65+i),name:"Wariant "+String.fromCharCode(65+i),objects:p.objects.map(o=>({...o,id:uid()}))};setVariants(next);toast.success("Skopiowano projekt do wariantu "+String.fromCharCode(65+i))}
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
 function addSponsor(name:string,color:string){addObject(obj("sponsor",name,300,220,{text:name,color,scale:90}))}
 function addEquipment(name:string,x=300,y=180){addObject(obj("equipment",name,x,y,{scale:name==="Banda"?100:85}))}
 function applyPalette(id:string,track=true){const pal=getPatternPalette(id);update({patternPalette:id,base:pal.colors[4],zone:pal.colors[1]},track)}
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
 <header className="header"><button className="brand" onClick={()=>setView("builder")}><span className="brand-icon"><Grid2X2 size={21}/></span>gamefields<span className="brand-studio">STUDIO</span></button><nav><button className={view==="builder"?"active":""} onClick={()=>setView("builder")}>Studio</button><button className={view==="patterns"?"active":""} onClick={()=>{setPatternPage(1);setView("patterns")}}>Biblioteka wzorów <span className="navcount">{PATTERN_COUNT}</span></button><button className={view==="templates"?"active":""} onClick={showTemplates}>Gotowe projekty</button><button className={view==="projects"?"active":""} onClick={()=>setView("projects")}>Gamefields OS</button></nav><a className="site-link" href="https://www.gamefields.eu/" target="_top">← Gamefields.eu</a><span className="version">v0.5</span></header>
 {view==="builder"?<>
 <div className="projectbar v03bar"><div><span className="eyebrow">PROJEKT / {p.id}</span><input className="projectname" aria-label="Nazwa projektu" maxLength={200} value={p.name} onChange={e=>update({name:e.target.value},false)}/></div><div className="history-actions"><button onClick={undo} disabled={!undoStack.length}><Undo2 size={17}/> Cofnij</button><button onClick={redo} disabled={!redoStack.length}><Redo2 size={17}/> Ponów</button></div><div className="actions"><input hidden ref={importRef} type="file" accept=".json,.txt,application/json,text/plain" onChange={e=>{void importProject(e.target.files?.[0]);e.target.value=""}}/><button className="btn subtle" onClick={()=>importRef.current?.click()}>Wczytaj JSON</button><button className="btn subtle" onClick={()=>{setProjects(x=>[p,...x.filter(q=>q.id!==p.id)]);toast.success("Projekt zapisany w tej sesji")}}>Zapisz</button><button className="btn subtle" onClick={()=>download(p,true)} title="Pobierz konfigurację do dodania w WordPressie">Wzór do WordPress</button><button className="btn dark" onClick={()=>download(p)}><Download size={16}/> Eksport JSON</button></div></div>
 <div className="variantstrip">{variants.map((v,i)=>{const pv=i===activeVariant?p:v;return <div key={i} className={"variantcard "+(i===activeVariant?"active":"")}><button className="variantpreview" onClick={()=>switchVariant(i)}><Court p={pv} small/><span>WARIANT {String.fromCharCode(65+i)}</span></button>{i!==activeVariant?<button className="copyvariant" onClick={()=>copyVariant(i)}><Copy size={12}/> Kopiuj tutaj</button>:<span className="editing">EDYTUJESZ</span>}</div>})}</div>
 <div className="builder v03builder"><aside className="rail">{modules.map(([name,Icon],i)=><button key={name} className={i===module?"module active":"module"} onClick={()=>setModule(i)}><Icon size={22}/><span>{name}</span></button>)}</aside>
 <section className="settings"><div className="paneltitle"><span className="eyebrow">0{module+1} / EDYTOR</span><h1>{modules[module][0]}</h1><p>{["Ustal skalę i proporcje przestrzeni.","Wybierz system nawierzchni.","Zbuduj paletę całej przestrzeni.","Ustaw oznakowanie sportowe.","Przeciągaj elementy bezpośrednio na boisko.","Logo, tekst, sponsorzy i warstwy."][module]}</p></div><div className="panelbody">
 {module===0?<><div className="dimension"><label>Długość <strong>{p.length} m</strong></label><Slider min={6} max={60} value={[p.length]} onValueChange={v=>update({length:v[0]})}/></div><div className="dimension"><label>Szerokość <strong>{p.width} m</strong></label><Slider min={6} max={40} value={[p.width]} onValueChange={v=>update({width:v[0]})}/></div><div className="area"><span>Powierzchnia</span><strong>{area} m²</strong></div>{choices(sports,p.sport,s=>update({sport:s}))}</>:null}
 {module===1?<>{choices(surfaces,p.surface,s=>update({surface:s}))}<div className="note">Budżet uwzględnia orientacyjną stawkę dla wybranego systemu nawierzchni.</div></>:null}
 {module===2?<><h3>Palety Gamefields</h3><div className="palette-library">{patternPalettes.map(pal=><button key={pal.id} className={(p.patternPalette||"miami")===pal.id?"palette-chip selected":"palette-chip"} onClick={()=>applyPalette(pal.id)}><span className="palette-dots">{pal.colors.map(col=><i key={col} style={{background:col}}/>)}</span><b>{pal.name}</b><small>{pal.tone}</small></button>)}</div><h3>Kolory techniczne</h3>{(["base","zone","outside"] as const).map((k,i)=><label className="colorrow" key={k}><span>{["Pole gry","Strefy","Otoczenie"][i]}<small>{p[k]}</small></span><input type="color" value={p[k]} onChange={e=>update({[k]:e.target.value})}/></label>)}</>:null}
 {module===3?<><label className="switchrow">Pokaż linie<Switch checked={p.lines} onCheckedChange={v=>update({lines:v})}/></label><label className="colorrow"><span>Kolor linii</span><input type="color" value={p.lineColor} onChange={e=>update({lineColor:e.target.value})}/></label>{choices(sports,p.sport,s=>update({sport:s}))}</>:null}
 {module===4?<><div className="libraryhint"><Move size={16}/><span>Przeciągnij element na boisko albo kliknij, aby dodać go na środku.</span></div><div className="equipmentgrid">{equipmentLibrary.map(name=><button key={name} draggable onDragStart={e=>e.dataTransfer.setData("gamefields/equipment",name)} onClick={()=>addEquipment(name)}><span className="equipmenticon"><svg viewBox="-70 -65 140 130" aria-hidden="true"><EquipmentShape name={name}/></svg></span><b>{name}</b></button>)}</div></>:null}
 {module===5?<><div className="pattern-current"><span className="eyebrow">PATTERN ENGINE</span><strong>{patternCode(p.patternFamily||"organic-flow",p.patternVariant||1)}</strong><small>{getPatternFamily(p.patternFamily).name} · {getPatternPalette(p.patternPalette).name} · poziom {patternComplexity(p.patternFamily||"organic-flow",p.patternVariant||1)}/4</small></div><div className="studio-actions pattern-actions"><button className="btn dark full" onClick={()=>{setPatternPage(1);setView("patterns")}}>Otwórz {PATTERN_COUNT} wzorów</button><button className="btn subtle full" onClick={()=>shufflePattern(false)}>🎲 Losuj nowy kierunek</button><button className="btn subtle full" onClick={()=>shufflePattern(true)}>↻ Wariant podobny</button></div><h3>Wariant kompozycji</h3><div className="variant-number-grid">{patternVariants.map(v=><button key={v.variant} className={(p.patternVariant||1)===v.variant?"selected":""} onClick={()=>update({patternVariant:v.variant})}><b>{String(v.variant).padStart(2,"0")}</b><small>{v.name}</small></button>)}</div><h3>Paleta wzoru</h3><div className="palette-quick">{patternPalettes.slice(0,10).map(pal=><button key={pal.id} className={(p.patternPalette||"miami")===pal.id?"selected":""} onClick={()=>applyPalette(pal.id)} title={pal.name}>{pal.colors.map(col=><i key={col} style={{background:col}}/>)}</button>)}</div><div className="dimension"><label>Intensywność <strong>{p.graphicOpacity}%</strong></label><Slider min={20} max={100} value={[p.graphicOpacity]} onValueChange={v=>update({graphicOpacity:v[0]})}/></div><div className="dimension"><label>Skala wzoru <strong>{p.patternDensity||100}%</strong></label><Slider min={60} max={140} value={[p.patternDensity||100]} onValueChange={v=>update({patternDensity:v[0]})}/></div><div className="studio-divider"/><div className="studio-actions"><button className="btn subtle full" onClick={()=>uploadRef.current?.click()}><Upload size={17}/> Dodaj logo PNG / SVG</button><input ref={uploadRef} hidden multiple type="file" accept=".png,.svg,image/png,image/svg+xml" onChange={e=>{handleUploads(e.target.files);e.target.value=""}}/><button className="btn subtle full" onClick={addText}><Type size={17}/> Dodaj tekst</button></div><h3>Sponsorzy</h3><div className="sponsorgrid">{sponsors.map(([name,color])=><button key={name} style={{borderColor:color}} onClick={()=>addSponsor(name,color)}><b>{name}</b><small>DODAJ</small></button>)}</div></>:null}
 </div></section>
 <section className={"canvas editorcanvas "+p.scene}><div className="canvashead"><span><i/> EDYTOR NA ŻYWO</span>{selected?<button type="button" className="btn danger canvas-delete" onClick={removeSelected}><Trash2 size={16}/> Usuń: {selected.name}</button>:null}<div className="scene-controls"><button className={p.scene==="day"?"active":""} onClick={()=>update({scene:"day"})}><Sun size={14}/> Dzień</button><button className={p.scene==="night"?"active":""} onClick={()=>update({scene:"night"})}><Moon size={14}/> Noc</button><button className={p.scene==="event"?"active":""} onClick={()=>update({scene:"event"})}><PartyPopper size={14}/> Event</button><button onClick={()=>setIso(!iso)} className={iso?"active":""}><RotateCcw size={14}/> {iso?"Plan":"3D"}</button></div></div>
 <div className="drawing editing-area"><Court p={p} iso={iso} selectedId={selectedId} onSelect={setSelectedId} onDragStart={startDrag} onDropEquipment={addEquipment}/></div>
 {iso?<p className="viewhint">Widok poglądowy. Do przeciągania obiektów wybierz Plan.</p>:null}<div className="canvasmeta"><span>{p.sport} · {p.length} × {p.width} m · {area} m²</span><span>{p.objects.length} obiektów</span></div>
 </section>
 <aside className="inspector"><section className="object-list" aria-label="Elementy projektu"><h2>Elementy ({p.objects.length})</h2><p>Wybierz element z listy lub usuń go koszem.</p>{p.objects.length?<ul>{p.objects.map((o,i)=><li key={o.id} className={o.id===selectedId?"selected":""}><button type="button" aria-pressed={o.id===selectedId} onClick={()=>setSelectedId(o.id)}><span>{i+1}. {o.name}</span><small>{targetLabel[o.target]}</small></button><button type="button" className="object-delete" aria-label={"Usuń "+o.name+" ("+(i+1)+")"} title={"Usuń "+o.name} onClick={()=>removeObject(o.id)}><Trash2 size={18}/></button></li>)}</ul>:<p>Brak elementów. Dodaj je w Wyposażeniu lub Studio.</p>}</section><div className="inspectorhead"><span className="eyebrow">WŁAŚCIWOŚCI</span><h2>{selected?selected.name:"Wybierz obiekt"}</h2><p>{selected?"Edycja zaznaczonego elementu.":"Kliknij logo, tekst, sponsora lub element wyposażenia na boisku."}</p></div>{selected?<div className="inspectorbody"><div className="object-type">{selected.kind.toUpperCase()} <span>{targetLabel[selected.target]}</span></div>{(selected.kind==="text"||selected.kind==="sponsor")?<label>Treść<input value={selected.text||""} onChange={e=>updateObject(selected.id,{text:e.target.value})}/></label>:null}<label>Miejsce<select value={selected.target} onChange={e=>updateObject(selected.id,{target:e.target.value as Target})}>{Object.keys(targetLabel).map(k=><option key={k} value={k}>{targetLabel[k as Target]}</option>)}</select></label>{selected.kind!=="equipment"?<label className="colorrow"><span>Kolor</span><input type="color" value={selected.color} onChange={e=>updateObject(selected.id,{color:e.target.value})}/></label>:null}<div className="dimension"><label>Rozmiar <strong>{selected.scale}%</strong></label><Slider min={20} max={220} value={[selected.scale]} onValueChange={v=>updateObject(selected.id,{scale:v[0]})}/></div><div className="dimension"><label>Obrót <strong>{selected.rotation}°</strong></label><Slider min={-180} max={180} step={5} value={[selected.rotation]} onValueChange={v=>updateObject(selected.id,{rotation:v[0]})}/></div><div className="dimension"><label>Widoczność <strong>{selected.opacity}%</strong></label><Slider min={10} max={100} value={[selected.opacity]} onValueChange={v=>updateObject(selected.id,{opacity:v[0]})}/></div><div className="xy"><label>X<input type="number" value={Math.round(selected.x)} onChange={e=>updateObject(selected.id,{x:Number(e.target.value)})}/></label><label>Y<input type="number" value={Math.round(selected.y)} onChange={e=>updateObject(selected.id,{y:Number(e.target.value)})}/></label></div><button className="btn danger full" onClick={removeSelected}><Trash2 size={16}/> Usuń obiekt</button></div>:null}
 <div className="budgetbox"><div className="budgettitle"><WalletCards size={18}/><span>BUDŻET ORIENTACYJNY</span></div><strong>{pln(b.min)} – {pln(b.max)}</strong><small>Orientacyjny budżet koncepcyjny</small><div><span>Nawierzchnia + baza</span><b>{area} m²</b></div><div><span>Obiekty</span><b>{p.objects.length}</b></div><div><span>Tryb event</span><b>{p.scene==="event"?"TAK":"NIE"}</b></div><p>Stawki demonstracyjne. To nie jest oferta handlowa. Finalna wycena wymaga weryfikacji lokalizacji, podbudowy, transportu i montażu.</p></div></aside>
 </div></>:view==="patterns"?<main className="pattern-library-page"><div className="pattern-hero"><div><span className="eyebrow">GAMEFIELDS DESIGN LIBRARY / {PATTERN_COUNT} WZORÓW</span><h1>Wybierz kierunek. Resztę dopasujesz w Studio.</h1><p>25 rodzin × 12 kompozycji. Każdy wzór działa z dowolną paletą, sportem i wymiarem boiska.</p></div><div className="pattern-hero-actions"><button className="btn dark" onClick={()=>shufflePattern(false)}>🎲 Losuj wzór</button><button className="btn subtle" onClick={()=>setView("builder")}>Wróć do Studio</button></div></div><div className="pattern-toolbar"><div className="pattern-filters">{patternFilters.map(f=><button key={f.id} className={patternFilter===f.id?"active":""} onClick={()=>{setPatternFilter(f.id);setPatternPage(1)}}>{f.label}</button>)}</div><input aria-label="Szukaj wzoru" placeholder="Szukaj: organic, street, premium…" value={patternSearch} onChange={e=>{setPatternSearch(e.target.value);setPatternPage(1)}}/></div><div className="pattern-result-head"><strong>{patternCatalog.length} wzorów</strong><span>Strona {patternPage} / {patternPages}</span></div><div className="pattern-grid">{visiblePatterns.map(item=>{const preview={...p,id:patternCode(item.family.id,item.variant),pattern:item.family.name,patternFamily:item.family.id,patternVariant:item.variant,patternPalette:p.patternPalette||"miami",objects:[],scene:"day" as const};return <article className="pattern-card" key={item.family.id+"-"+item.variant}><button className="pattern-preview" onClick={()=>applyPattern(item.family.id,item.variant)}><Court p={preview} small/></button><section><div><span className="eyebrow">{patternCode(item.family.id,item.variant)}</span><h2>{item.family.name} / {item.name}</h2></div><div className="pattern-meta"><span>{item.family.group}</span><span>wykonanie {patternComplexity(item.family.id,item.variant)}/4</span></div><p>{item.family.description}</p><button className="btn dark full" onClick={()=>applyPattern(item.family.id,item.variant)}>Zastosuj wzór</button></section></article>})}</div><div className="catalog-pages"><button className="btn subtle" disabled={patternPage<=1} onClick={()=>setPatternPage(x=>Math.max(1,x-1))}>Poprzednie</button><span>{patternPage} / {patternPages}</span><button className="btn subtle" disabled={patternPage>=patternPages} onClick={()=>setPatternPage(x=>Math.min(patternPages,x+1))}>Następne</button></div></main>:view==="templates"?<main className="os template-catalog"><div className="oshead"><div><span className="eyebrow">KOLEKCJA GAMEFIELDS</span><h1>Gotowe projekty</h1><p>Wybierz przygotowany wzór i dopasuj go do swojej przestrzeni.</p></div><button className="btn subtle" disabled={templatesLoading} onClick={()=>void loadTemplates(templatePage)}>Odśwież listę</button></div>{templatesLoading?<p role="status">Wczytywanie projektów…</p>:templateError?<div role="alert" className="empty"><p>{templateError}</p><button className="btn dark" onClick={()=>void loadTemplates(templatePage)}>Spróbuj ponownie</button></div>:templates.length?<><div className="projectgrid">{templates.map(item=><article className="template-card" key={item.id}><div className="template-image">{item.image?<img src={item.image} alt={item.title} loading="lazy"/>:<div className="template-no-image"><Grid2X2 size={42}/><span>Podgląd w edytorze</span></div>}</div><section><h2>{item.title}</h2>{item.description?<p>{item.description}</p>:null}<button className="btn dark full" disabled={openingTemplate!==null} onClick={()=>void openTemplate(item)}>{openingTemplate===item.id?"Otwieranie…":"Edytuj ten wzór"}</button><a className="textbtn" href={item.link} target="_blank" rel="noopener">Opis projektu ↗</a></section></article>)}</div><div className="catalog-pages"><button className="btn subtle" disabled={templatePage<=1} onClick={()=>void loadTemplates(templatePage-1)}>Poprzednie</button><span>{templatePage} / {templateTotal}</span><button className="btn subtle" disabled={templatePage>=templateTotal} onClick={()=>void loadTemplates(templatePage+1)}>Następne</button></div></>:<div className="empty"><Grid2X2 size={36}/><h2>Wzory pojawią się tutaj</h2><p>Przygotowujemy kolekcję projektów. W tym czasie możesz stworzyć własny.</p><button className="btn dark" onClick={()=>setView("builder")}>Przejdź do Studio</button></div>}</main>:<main className="os"><div className="oshead"><div><span className="eyebrow">GAMEFIELDS OS</span><h1>Twoje projekty</h1><p className="sessionnote">Lista działa w tej sesji. Pobierz JSON przed zamknięciem strony; wczytaj go później w Studio.</p></div><button className="btn dark" onClick={()=>setView("builder")}><Plus size={17}/> Wróć do Studio</button></div>{projects.length?<div className="projectgrid">{projects.map(x=><button className="projectcard" key={x.id} onClick={()=>{setP(x);setSelectedId(null);setUndo([]);setRedo([]);setView("builder")}}><div><Court p={x} small/></div><section><span className="eyebrow">{x.id}</span><h3>{x.name}</h3><p>{x.length*x.width} m² · {pln(budget(x).min)}+</p></section></button>)}</div>:<div className="empty"><FolderOpen size={32}/><h2>Brak zapisanych projektów</h2><p>Zapisz projekt w Studio, żeby zobaczyć go tutaj.</p></div>}</main>}
 </>;
}
