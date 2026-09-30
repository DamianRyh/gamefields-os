"use client";
import {useId,useMemo,useRef,useState} from "react";
import {Grid2X2,Layers,Ruler,Palette,Goal,Paintbrush,CircleDashed,Plus,Check,Download,FolderOpen,LayoutDashboard,ChevronLeft,RotateCcw,Undo2,Redo2,Upload,Type,Image as ImageIcon,Copy,Trash2,Move,Sun,Moon,PartyPopper,Users,WalletCards} from "lucide-react";
import {Slider} from "@/components/ui/slider";
import {Switch} from "@/components/ui/switch";
import {Toaster,toast} from "sonner";
import {z} from "zod";

type Scene="day"|"night"|"event";
type Target="court"|"band-top"|"band-bottom"|"band-left"|"band-right";
type ObjectKind="image"|"text"|"sponsor"|"equipment";
type EditorObject={id:string;kind:ObjectKind;name:string;x:number;y:number;scale:number;rotation:number;opacity:number;color:string;text?:string;src?:string;target:Target};
type Project={id:string;name:string;type:string;sport:string;length:number;width:number;surface:string;base:string;zone:string;outside:string;lineColor:string;lines:boolean;pattern:string;graphicOpacity:number;graphicScale:number;graphicRotation:number;scene:Scene;objects:EditorObject[];status:string;date:string};

const projectSchema=z.object({
 id:z.string().min(1).max(100),name:z.string().min(1).max(200),
 length:z.number().min(6).max(60),width:z.number().min(6).max(40),
 sport:z.enum(["Piłka nożna 3×3","Koszykówka","Siatkówka","Wielofunkcyjne"]),
 surface:z.enum(["Akryl sportowy","EPDM","Sztuczna trawa 60 mm","Moduły sportowe"]),
 base:z.string().regex(/^#[0-9a-f]{6}$/i),zone:z.string().regex(/^#[0-9a-f]{6}$/i),outside:z.string().regex(/^#[0-9a-f]{6}$/i),lineColor:z.string().regex(/^#[0-9a-f]{6}$/i),
 lines:z.boolean(),pattern:z.string().max(40),graphicOpacity:z.number().min(0).max(100),graphicScale:z.number().min(20).max(220),graphicRotation:z.number().min(-360).max(360),scene:z.enum(["day","night","event"]),
 objects:z.array(z.object({id:z.string().max(100),kind:z.enum(["image","text","sponsor","equipment"]),name:z.string().max(200),x:z.number().finite(),y:z.number().finite(),scale:z.number().min(20).max(220),rotation:z.number().finite(),opacity:z.number().min(0).max(100),color:z.string().regex(/^#[0-9a-f]{6}$/i),text:z.string().max(500).optional(),src:z.string().max(3000000).regex(/^data:image\/(png|svg\+xml);base64,[A-Za-z0-9+/=]+$/).optional(),target:z.enum(["court","band-top","band-bottom","band-left","band-right"])})).max(200),
 type:z.string().max(100).default("Nowe boisko"),status:z.string().max(50).default("Szkic"),date:z.string().max(30).default("")
});

const uid=()=>Math.random().toString(36).slice(2,9);
const obj=(kind:ObjectKind,name:string,x:number,y:number,extra:Partial<EditorObject>={}):EditorObject=>({id:uid(),kind,name,x,y,scale:100,rotation:0,opacity:100,color:"#ffffff",target:"court",...extra});
const initial:Project={id:"GF-001",name:"Moje boisko 3×3",type:"Nowe boisko",sport:"Piłka nożna 3×3",length:15,width:10,surface:"Akryl sportowy",base:"#246f70",zone:"#ef744e",outside:"#dedfd4",lineColor:"#ffffff",lines:true,pattern:"Diagonal",graphicOpacity:45,graphicScale:100,graphicRotation:0,scene:"day",objects:[obj("equipment","Bramka",26,200,{scale:85}),obj("equipment","Bramka",574,200,{scale:85,rotation:180})],status:"Szkic",date:"29.09.2026"};
const modules=[["Wymiary",Ruler],["Nawierzchnia",Layers],["Kolory",Palette],["Linie",CircleDashed],["Wyposażenie",Goal],["Studio",Paintbrush]] as const;
const sports=["Piłka nożna 3×3","Koszykówka","Siatkówka","Wielofunkcyjne"];
const surfaces=["Akryl sportowy","EPDM","Sztuczna trawa 60 mm","Moduły sportowe"];
const patterns=["Bez grafiki","Geometria","Kręgi","Diagonal","Checker","Waves","Target","Street"];
const designPacks=[{name:"URBAN",base:"#263834",zone:"#ef744e",outside:"#cfd3ca",pattern:"Diagonal"},{name:"NIGHT",base:"#1f2a2b",zone:"#b8e36f",outside:"#59615f",pattern:"Target"},{name:"CLUB",base:"#3157b7",zone:"#e9d44d",outside:"#d9dde7",pattern:"Checker"},{name:"STREET",base:"#a94f3d",zone:"#f1a86d",outside:"#ded5c8",pattern:"Street"},{name:"MINIMAL",base:"#5f6a65",zone:"#b9c1bc",outside:"#e4e6e2",pattern:"Bez grafiki"},{name:"ELECTRIC",base:"#315ac4",zone:"#9ed646",outside:"#c9d2df",pattern:"Waves"}] as const;
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
 const opacity=p.graphicOpacity/100,scale=p.graphicScale/100,transform="rotate("+p.graphicRotation+" 300 "+h/2+") scale("+scale+")";
 if(p.pattern==="Geometria")return <path d={"M0 0L230 "+h+"H330L100 0Z M400 0L600 "+h+"V"+h*.5+"L500 0Z"} fill={p.zone} opacity={opacity}/>;
 if(p.pattern==="Kręgi")return <g fill="none" stroke={p.zone} strokeWidth="24" opacity={opacity} transform={transform}><circle cx="300" cy={h/2} r="100"/><circle cx="300" cy={h/2} r="160"/></g>;
 if(p.pattern==="Diagonal")return <g opacity={opacity} transform={transform} fill={p.zone}>{[0,120,240,360,480].map(x=><path key={x} d={"M"+(x-120)+" 0 L"+(x+40)+" 0 L"+(x+220)+" "+h+" L"+(x+60)+" "+h+" Z"}/>)}</g>;
 if(p.pattern==="Checker")return <g opacity={opacity} transform={transform} fill={p.zone}>{Array.from({length:24}).map((_,i)=>{const c=i%6,r=Math.floor(i/6);return(c+r)%2===0?<rect key={i} x={c*100} y={r*h/4} width="100" height={h/4}/>:null})}</g>;
 if(p.pattern==="Waves")return <g fill="none" stroke={p.zone} strokeWidth="28" opacity={opacity} transform={transform}>{[.25,.5,.75].map((yy,i)=><path key={i} d={"M-20 "+h*yy+" Q130 "+h*(yy-.18)+" 280 "+h*yy+" T620 "+h*yy}/>)}</g>;
 if(p.pattern==="Target")return <g fill="none" stroke={p.zone} strokeWidth="22" opacity={opacity} transform={transform}>{[55,110,165,220].map(r=><circle key={r} cx="300" cy={h/2} r={r}/>)}</g>;
 if(p.pattern==="Street")return <text x="300" y={h/2+42} textAnchor="middle" fill={p.zone} opacity={opacity} transform={"rotate("+(-12+p.graphicRotation)+" 300 "+h/2+") scale("+scale+")"} fontSize="105" fontWeight="900" letterSpacing="-5">PLAY HERE</text>;
 return null;
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

function download(p:Project){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(p,null,2)],{type:"application/json"}));a.download=p.id+"-gamefields-v03.json";a.click();URL.revokeObjectURL(a.href)}

export default function Home(){
 const [p,setP]=useState<Project>(initial),[view,setView]=useState("builder"),[module,setModule]=useState(5),[iso,setIso]=useState(false),[selectedId,setSelectedId]=useState<string|null>(null),[undoStack,setUndo]=useState<Project[]>([]),[redoStack,setRedo]=useState<Project[]>([]),[projects,setProjects]=useState<Project[]>([]),[activeVariant,setActiveVariant]=useState(0),[variants,setVariants]=useState<Project[]>([{...initial,name:"Wariant A"},{...initial,id:"GF-B",name:"Wariant B",base:"#3157b7",zone:"#e9d44d"},{...initial,id:"GF-C",name:"Wariant C",base:"#1f2a2b",zone:"#b8e36f",pattern:"Target"}]);
 const uploadRef=useRef<HTMLInputElement>(null),importRef=useRef<HTMLInputElement>(null);
 async function importProject(file?:File){if(!file)return;if(file.size>12000000){toast.error("Plik projektu może mieć maksymalnie 12 MB.");return}try{const next=projectSchema.parse(JSON.parse(await file.text()));if(new Set(next.objects.map(o=>o.id)).size!==next.objects.length)throw new Error("ids");history(p);setP(next);setSelectedId(null);setView("builder");toast.success("Wczytano projekt")}catch{toast.error("Nieprawidłowy plik projektu. Wybierz eksport JSON z edytora v0.3.")}}
 const dragStart=useRef<Project|null>(null);
 const area=p.length*p.width,b=useMemo(()=>budget(p),[p]);
 const selected=p.objects.find(o=>o.id===selectedId)||null;
 function history(prev:Project){setUndo(s=>[...s.slice(-39),prev]);setRedo([])}
 function update(patch:Partial<Project>,track=true){if(track)history(p);setP(v=>({...v,...patch}))}
 function updateObject(id:string,patch:Partial<EditorObject>,track=true){if(track)history(p);setP(v=>({...v,objects:v.objects.map(o=>o.id===id?{...o,...patch}:o)}))}
 function addObject(o:EditorObject){history(p);setP(v=>({...v,objects:[...v.objects,o]}));setSelectedId(o.id)}
 function removeSelected(){if(!selected)return;history(p);setP(v=>({...v,objects:v.objects.filter(o=>o.id!==selected.id)}));setSelectedId(null)}
 function undo(){const prev=undoStack[undoStack.length-1];if(!prev)return;setRedo(r=>[...r,p]);setUndo(s=>s.slice(0,-1));setP(prev);setSelectedId(null)}
 function redo(){const next=redoStack[redoStack.length-1];if(!next)return;setUndo(s=>[...s,p]);setRedo(s=>s.slice(0,-1));setP(next);setSelectedId(null)}
 function switchVariant(i:number){if(i===activeVariant)return;const next=[...variants];next[activeVariant]={...p,name:"Wariant "+String.fromCharCode(65+activeVariant)};setVariants(next);setP(next[i]);setActiveVariant(i);setSelectedId(null);setUndo([]);setRedo([])}
 function copyVariant(i:number){const next=[...variants];next[i]={...p,id:"GF-"+String.fromCharCode(65+i),name:"Wariant "+String.fromCharCode(65+i),objects:p.objects.map(o=>({...o,id:uid()}))};setVariants(next);toast.success("Skopiowano projekt do wariantu "+String.fromCharCode(65+i))}
 function startDrag(e:React.PointerEvent<SVGElement>,id:string,mode:"move"|"scale"|"rotate"="move"){
   if(iso){setSelectedId(id);toast.info("Przełącz na plan 2D, aby przesuwać obiekt.");return;}
   e.stopPropagation();setSelectedId(id);
   const startProject=p,startObj=p.objects.find(o=>o.id===id);if(!startObj)return;
   dragStart.current=startProject;
   const svg=e.currentTarget.ownerSVGElement;if(!svg)return;
   const h=600*p.width/p.length;
   const center={x:startObj.target==="band-left"?-22:startObj.target==="band-right"?622:startObj.x,y:startObj.target==="band-top"?-22:startObj.target==="band-bottom"?h+22:startObj.y};
   const point=(clientX:number,clientY:number)=>{const pt=svg.createSVGPoint();pt.x=clientX;pt.y=clientY;const ctm=svg.getScreenCTM();return ctm?pt.matrixTransform(ctm.inverse()):null};
   const first=point(e.clientX,e.clientY);if(!first)return;
   const startDist=Math.max(10,Math.hypot(first.x-center.x,first.y-center.y));
   const startAngle=Math.atan2(first.y-center.y,first.x-center.x)*180/Math.PI;
   const move=(ev:PointerEvent)=>{const loc=point(ev.clientX,ev.clientY);if(!loc)return;
     setP(v=>({...v,objects:v.objects.map(o=>{
       if(o.id!==id)return o;
       if(mode==="scale"){const dist=Math.hypot(loc.x-center.x,loc.y-center.y);return {...o,scale:Math.max(20,Math.min(220,Math.round(startObj.scale*dist/startDist)))}} 
       if(mode==="rotate"){const angle=Math.atan2(loc.y-center.y,loc.x-center.x)*180/Math.PI;return {...o,rotation:((Math.round(startObj.rotation+(angle-startAngle))+540)%360)-180}}
       return {...o,x:Math.max(-50,Math.min(650,startObj.x+loc.x-first.x)),y:Math.max(-60,Math.min(600*v.width/v.length+70,startObj.y+loc.y-first.y))}
     })}))
   };
   const up=()=>{if(dragStart.current)history(dragStart.current);dragStart.current=null;window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",up)};
   window.addEventListener("pointermove",move);window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up)
 }
 function handleUploads(files:FileList|null){if(!files)return;[...files].forEach((f,i)=>{if(!["image/png","image/svg+xml"].includes(f.type)){toast.error("Obsługiwane są pliki PNG i SVG.");return}if(f.size>2000000){toast.error("Logo może mieć maksymalnie 2 MB.");return}const r=new FileReader();r.onerror=()=>toast.error("Nie udało się odczytać logo.");r.onload=()=>addObject(obj("image",f.name,300+i*25,300*p.width/p.length,{src:String(r.result),scale:90}));r.readAsDataURL(f)})}
 function addText(){const o=obj("text","Tekst",300,180,{text:"TWOJE MIASTO",color:"#ffffff",scale:100});addObject(o)}
 function addSponsor(name:string,color:string){addObject(obj("sponsor",name,300,220,{text:name,color,scale:90}))}
 function addEquipment(name:string,x=300,y=180){addObject(obj("equipment",name,x,y,{scale:name==="Banda"?100:85}))}
 const choices=(items:string[],value:string,change:(s:string)=>void)=><div className="choices compact">{items.map(s=><button key={s} className={value===s?"choice selected":"choice"} onClick={()=>change(s)}><span>{s}</span>{value===s?<Check size={15}/>:null}</button>)}</div>;
 return <><Toaster position="bottom-right"/>
 <header className="header"><button className="brand" onClick={()=>setView("builder")}><span className="brand-icon"><Grid2X2 size={21}/></span>gamefields<span className="brand-studio">STUDIO</span></button><nav><button className={view==="builder"?"active":""} onClick={()=>setView("builder")}>Studio</button><button className={view==="projects"?"active":""} onClick={()=>setView("projects")}>Gamefields OS</button></nav><a className="site-link" href="https://www.gamefields.eu/" target="_top">← Gamefields.eu</a><span className="version">v0.3.1</span></header>
 {view==="builder"?<>
 <div className="projectbar v03bar"><div><span className="eyebrow">PROJEKT / {p.id}</span><input className="projectname" aria-label="Nazwa projektu" maxLength={200} value={p.name} onChange={e=>update({name:e.target.value},false)}/></div><div className="history-actions"><button onClick={undo} disabled={!undoStack.length}><Undo2 size={17}/> Cofnij</button><button onClick={redo} disabled={!redoStack.length}><Redo2 size={17}/> Ponów</button></div><div className="actions"><input hidden ref={importRef} type="file" accept=".json,application/json" onChange={e=>{void importProject(e.target.files?.[0]);e.target.value=""}}/><button className="btn subtle" onClick={()=>importRef.current?.click()}>Wczytaj JSON</button><button className="btn subtle" onClick={()=>{setProjects(x=>[p,...x.filter(q=>q.id!==p.id)]);toast.success("Projekt zapisany w tej sesji")}}>Zapisz</button><button className="btn dark" onClick={()=>download(p)}><Download size={16}/> Eksport JSON</button></div></div>
 <div className="variantstrip">{variants.map((v,i)=>{const pv=i===activeVariant?p:v;return <div key={i} className={"variantcard "+(i===activeVariant?"active":"")}><button className="variantpreview" onClick={()=>switchVariant(i)}><Court p={pv} small/><span>WARIANT {String.fromCharCode(65+i)}</span></button>{i!==activeVariant?<button className="copyvariant" onClick={()=>copyVariant(i)}><Copy size={12}/> Kopiuj tutaj</button>:<span className="editing">EDYTUJESZ</span>}</div>})}</div>
 <div className="builder v03builder"><aside className="rail">{modules.map(([name,Icon],i)=><button key={name} className={i===module?"module active":"module"} onClick={()=>setModule(i)}><Icon size={22}/><span>{name}</span></button>)}</aside>
 <section className="settings"><div className="paneltitle"><span className="eyebrow">0{module+1} / EDYTOR</span><h1>{modules[module][0]}</h1><p>{["Ustal skalę i proporcje przestrzeni.","Wybierz system nawierzchni.","Zbuduj paletę całej przestrzeni.","Ustaw oznakowanie sportowe.","Przeciągaj elementy bezpośrednio na boisko.","Logo, tekst, sponsorzy i warstwy."][module]}</p></div><div className="panelbody">
 {module===0?<><div className="dimension"><label>Długość <strong>{p.length} m</strong></label><Slider min={6} max={60} value={[p.length]} onValueChange={v=>update({length:v[0]})}/></div><div className="dimension"><label>Szerokość <strong>{p.width} m</strong></label><Slider min={6} max={40} value={[p.width]} onValueChange={v=>update({width:v[0]})}/></div><div className="area"><span>Powierzchnia</span><strong>{area} m²</strong></div>{choices(sports,p.sport,s=>update({sport:s}))}</>:null}
 {module===1?<>{choices(surfaces,p.surface,s=>update({surface:s}))}<div className="note">Budżet uwzględnia orientacyjną stawkę dla wybranego systemu nawierzchni.</div></>:null}
 {module===2?<><h3>Gotowe kompozycje</h3><div className="packgrid">{designPacks.map(d=><button key={d.name} className="pack" onClick={()=>update({base:d.base,zone:d.zone,outside:d.outside,pattern:d.pattern})}><span style={{background:"linear-gradient(135deg,"+d.base+" 0 60%,"+d.zone+" 60% 78%,"+d.outside+" 78%)"}}/><b>{d.name}</b></button>)}</div>{(["base","zone","outside"] as const).map((k,i)=><label className="colorrow" key={k}><span>{["Pole gry","Strefy","Otoczenie"][i]}<small>{p[k]}</small></span><input type="color" value={p[k]} onChange={e=>update({[k]:e.target.value})}/></label>)}</>:null}
 {module===3?<><label className="switchrow">Pokaż linie<Switch checked={p.lines} onCheckedChange={v=>update({lines:v})}/></label><label className="colorrow"><span>Kolor linii</span><input type="color" value={p.lineColor} onChange={e=>update({lineColor:e.target.value})}/></label>{choices(sports,p.sport,s=>update({sport:s}))}</>:null}
 {module===4?<><div className="libraryhint"><Move size={16}/><span>Przeciągnij element na boisko albo kliknij, aby dodać go na środku.</span></div><div className="equipmentgrid">{equipmentLibrary.map(name=><button key={name} draggable onDragStart={e=>e.dataTransfer.setData("gamefields/equipment",name)} onClick={()=>addEquipment(name)}><span className="equipmenticon"><svg viewBox="-70 -65 140 130" aria-hidden="true"><EquipmentShape name={name}/></svg></span><b>{name}</b></button>)}</div></>:null}
 {module===5?<><div className="studio-actions"><button className="btn dark full" onClick={()=>uploadRef.current?.click()}><Upload size={17}/> Dodaj logo PNG / SVG</button><input ref={uploadRef} hidden multiple type="file" accept=".png,.svg,image/png,image/svg+xml" onChange={e=>{handleUploads(e.target.files);e.target.value=""}}/><button className="btn subtle full" onClick={addText}><Type size={17}/> Dodaj tekst na boisko</button></div><h3>Biblioteka sponsorów</h3><div className="sponsorgrid">{sponsors.map(([name,color])=><button key={name} style={{borderColor:color}} onClick={()=>addSponsor(name,color)}><b>{name}</b><small>DODAJ</small></button>)}</div><h3>Grafika nawierzchni</h3>{choices(patterns,p.pattern,s=>update({pattern:s}))}<div className="dimension"><label>Widoczność wzoru <strong>{p.graphicOpacity}%</strong></label><Slider min={0} max={100} value={[p.graphicOpacity]} onValueChange={v=>update({graphicOpacity:v[0]})}/></div></>:null}
 </div></section>
 <section className={"canvas editorcanvas "+p.scene}><div className="canvashead"><span><i/> EDYTOR NA ŻYWO</span><div className="scene-controls"><button className={p.scene==="day"?"active":""} onClick={()=>update({scene:"day"})}><Sun size={14}/> Dzień</button><button className={p.scene==="night"?"active":""} onClick={()=>update({scene:"night"})}><Moon size={14}/> Noc</button><button className={p.scene==="event"?"active":""} onClick={()=>update({scene:"event"})}><PartyPopper size={14}/> Event</button><button onClick={()=>setIso(!iso)} className={iso?"active":""}><RotateCcw size={14}/> {iso?"Plan":"3D"}</button></div></div>
 <div className="drawing editing-area"><Court p={p} iso={iso} selectedId={selectedId} onSelect={setSelectedId} onDragStart={startDrag} onDropEquipment={addEquipment}/></div>
 {iso?<p className="viewhint">Widok poglądowy. Do przeciągania obiektów wybierz Plan.</p>:null}<div className="canvasmeta"><span>{p.sport} · {p.length} × {p.width} m · {area} m²</span><span>{p.objects.length} obiektów</span></div>
 </section>
 <aside className="inspector"><div className="inspectorhead"><span className="eyebrow">WŁAŚCIWOŚCI</span><h2>{selected?selected.name:"Wybierz obiekt"}</h2><p>{selected?"Edycja zaznaczonego elementu.":"Kliknij logo, tekst, sponsora lub element wyposażenia na boisku."}</p></div>{selected?<div className="inspectorbody"><div className="object-type">{selected.kind.toUpperCase()} <span>{targetLabel[selected.target]}</span></div>{(selected.kind==="text"||selected.kind==="sponsor")?<label>Treść<input value={selected.text||""} onChange={e=>updateObject(selected.id,{text:e.target.value})}/></label>:null}<label>Miejsce<select value={selected.target} onChange={e=>updateObject(selected.id,{target:e.target.value as Target})}>{Object.keys(targetLabel).map(k=><option key={k} value={k}>{targetLabel[k as Target]}</option>)}</select></label>{selected.kind!=="equipment"?<label className="colorrow"><span>Kolor</span><input type="color" value={selected.color} onChange={e=>updateObject(selected.id,{color:e.target.value})}/></label>:null}<div className="dimension"><label>Rozmiar <strong>{selected.scale}%</strong></label><Slider min={20} max={220} value={[selected.scale]} onValueChange={v=>updateObject(selected.id,{scale:v[0]})}/></div><div className="dimension"><label>Obrót <strong>{selected.rotation}°</strong></label><Slider min={-180} max={180} step={5} value={[selected.rotation]} onValueChange={v=>updateObject(selected.id,{rotation:v[0]})}/></div><div className="dimension"><label>Widoczność <strong>{selected.opacity}%</strong></label><Slider min={10} max={100} value={[selected.opacity]} onValueChange={v=>updateObject(selected.id,{opacity:v[0]})}/></div><div className="xy"><label>X<input type="number" value={Math.round(selected.x)} onChange={e=>updateObject(selected.id,{x:Number(e.target.value)})}/></label><label>Y<input type="number" value={Math.round(selected.y)} onChange={e=>updateObject(selected.id,{y:Number(e.target.value)})}/></label></div><button className="btn danger full" onClick={removeSelected}><Trash2 size={16}/> Usuń obiekt</button></div>:null}
 <div className="budgetbox"><div className="budgettitle"><WalletCards size={18}/><span>BUDŻET ORIENTACYJNY</span></div><strong>{pln(b.min)} – {pln(b.max)}</strong><small>Orientacyjny budżet koncepcyjny</small><div><span>Nawierzchnia + baza</span><b>{area} m²</b></div><div><span>Obiekty</span><b>{p.objects.length}</b></div><div><span>Tryb event</span><b>{p.scene==="event"?"TAK":"NIE"}</b></div><p>Stawki demonstracyjne. To nie jest oferta handlowa. Finalna wycena wymaga weryfikacji lokalizacji, podbudowy, transportu i montażu.</p></div></aside>
 </div></>:<main className="os"><div className="oshead"><div><span className="eyebrow">GAMEFIELDS OS</span><h1>Twoje projekty</h1><p className="sessionnote">Lista działa w tej sesji. Pobierz JSON przed zamknięciem strony; wczytaj go później w Studio.</p></div><button className="btn dark" onClick={()=>setView("builder")}><Plus size={17}/> Wróć do Studio</button></div>{projects.length?<div className="projectgrid">{projects.map(x=><button className="projectcard" key={x.id} onClick={()=>{setP(x);setSelectedId(null);setUndo([]);setRedo([]);setView("builder")}}><div><Court p={x} small/></div><section><span className="eyebrow">{x.id}</span><h3>{x.name}</h3><p>{x.length*x.width} m² · {pln(budget(x).min)}+</p></section></button>)}</div>:<div className="empty"><FolderOpen size={32}/><h2>Brak zapisanych projektów</h2><p>Zapisz projekt w Studio, żeby zobaczyć go tutaj.</p></div>}</main>}
 </>;
}
