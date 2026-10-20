"use client";

import {useEffect,useRef,useState,type ReactNode} from "react";
import {ArrowRight,ArrowUpRight,Check,ChevronDown,Download,FolderOpen,Grid2X2,Goal,MapPin,Minus,Palette,Plus,SlidersHorizontal,Type,Undo2,Redo2,Upload,Trash2,Layers,Camera,Move,Eye,Box,Droplets,X} from "lucide-react";
import type {Project,EditorObject,Target} from "@/lib/project";
import {sportProfiles,getSportProfile,type SportProfile} from "@/lib/sport-profiles";
import {getPatternFamily,getPatternPalette,patternPalettes,signaturePresets,variants} from "@/lib/pattern-library";
import {courtDimensions,courtArea} from "@/lib/court-geometry";
import {surfaceLabel} from "@/lib/surface-materials";
import {REALISTIC_LOCATIONS,type RealisticLocation} from "@/lib/realistic-locations";
import {SurfaceMaterialPicker} from "@/components/surface-material";
import {ArenaSettings} from "@/components/blender-arena-preview";

type Props={
 project:Project;saveStatus:string;selected:EditorObject|null;canUndo:boolean;canRedo:boolean;
 previewMode:"realistic"|"aerial"|"ground";location:RealisticLocation;hasLivePreview:boolean;
 update:(patch:Partial<Project>,track?:boolean)=>void;selectSport:(profile:SportProfile,enter?:boolean)=>void;
 setPreviewMode:(mode:"realistic"|"aerial"|"ground")=>void;setLocation:(location:RealisticLocation)=>void;
 undo:()=>void;redo:()=>void;download:()=>void;importProject:(file?:File)=>void;
 openPatterns:()=>void;applyDirection:(family:string,variant:number,palette:string)=>void;applyPalette:(id:string)=>void;
 addEquipment:(name:string)=>void;addText:()=>void;upload:(files:FileList|null)=>void;
 selectObject:(id:string|null)=>void;updateObject:(id:string,patch:Partial<EditorObject>)=>void;removeObject:(id:string)=>void;
 renderPreview:()=>ReactNode;renderCourt:(project:Project,editing?:boolean)=>ReactNode;
};

type StudioTool="model"|"construction"|"surface"|"graphics"|"equipment"|"place"|"files";
const targetNames:Record<Target,string>={court:"Nawierzchnia","band-top":"Banda górna","band-bottom":"Banda dolna","band-left":"Banda lewa","band-right":"Banda prawa"};

export function StudioWorkspace(props:Props){
 const {project:p,update}=props;
 const [patternsOpen,setPatternsOpen]=useState(false),[summaryOpen,setSummaryOpen]=useState(false),[editPlan,setEditPlan]=useState(false),[zoom,setZoom]=useState(props.previewMode==="aerial"?170:100);
 const [activeTool,setActiveTool]=useState<StudioTool>("surface"),[materialOpen,setMaterialOpen]=useState(false);
 const contactWindow=useRef<Window|null>(null);
 const importRef=useRef<HTMLInputElement>(null),uploadRef=useRef<HTMLInputElement>(null),panelRef=useRef<HTMLElement>(null);
 useEffect(()=>{panelRef.current?.scrollTo({top:0})},[activeTool,materialOpen]);
 useEffect(()=>{
  if(!patternsOpen&&!summaryOpen)return;
  const previous=document.activeElement as HTMLElement|null;
  const onKey=(event:KeyboardEvent)=>{
   if(event.key==="Escape"){setPatternsOpen(false);setSummaryOpen(false)}
   if(event.key!=="Tab")return;
   const controls=[...document.querySelectorAll<HTMLElement>('.studio-modal button:not(:disabled),.studio-modal a[href],.studio-modal input,.studio-modal textarea,.studio-modal select')];
   const first=controls[0],last=controls.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
  };
  document.addEventListener("keydown",onKey);
  return()=>{document.removeEventListener("keydown",onKey);previous?.focus()};
 },[patternsOpen,summaryOpen]);
 useEffect(()=>{
  const onReady=(event:MessageEvent)=>{
   if(event.origin!=="https://www.gamefields.eu"||event.source!==contactWindow.current||event.data?.type!=="gf-contact-ready")return;
   const summary=JSON.stringify({...p,objects:p.objects.map(({src,...object})=>object)},null,2);
   contactWindow.current?.postMessage({type:"gf-inquiry",summary:summary.slice(0,18000)},"https://www.gamefields.eu");
  };
  window.addEventListener("message",onReady);return()=>window.removeEventListener("message",onReady);
 },[p]);
 const requestInquiry=()=>{
  const summary=JSON.stringify({...p,objects:p.objects.map(({src,...object})=>object)},null,2).slice(0,18000);
  if(window.parent!==window){window.parent.postMessage({type:"gf-inquiry",summary},"https://www.gamefields.eu");setSummaryOpen(false);}
  else contactWindow.current=window.open("https://www.gamefields.eu/#kontakt","gamefields-inquiry");
 };
 useEffect(()=>{
  if(window.parent===window)return;
  const send=()=>{if(window.innerWidth<800)window.parent.postMessage({type:"gf-height",height:document.querySelector(".studio-shell")?.scrollHeight||1800},"https://www.gamefields.eu")};
  const observer=new ResizeObserver(send);const shell=document.querySelector(".studio-shell");if(shell)observer.observe(shell);send();return()=>observer.disconnect();
 },[]);
 const profile=getSportProfile(p.sport,p.arenaModel),family=getPatternFamily(p.patternFamily),location=REALISTIC_LOCATIONS.find(l=>l.id===props.location);
 const readyView=(mode:Props["previewMode"])=>{setEditPlan(false);props.setPreviewMode(mode);setZoom(mode==="aerial"?170:100)};
 const color=(key:"base"|"zone"|"outside"|"lineColor",label:string)=><label className="studio-color" key={key}><input type="color" aria-label={`Kolor: ${label}`} value={p[key]} onChange={e=>update({[key]:e.target.value})}/><span>{label}<small>{p[key].toUpperCase()}</small></span></label>;
 const openTool=(tool:StudioTool)=>{setActiveTool(tool);setMaterialOpen(false);props.selectObject(null)};
 const openModel=()=>openTool("model");
 const toolLabels:Record<StudioTool,string>={model:"Wybierz boisko",construction:"Konstrukcja",surface:"Kolory nawierzchni",graphics:"Grafika i linie",equipment:"Wyposażenie",place:"Miejsce",files:"Pliki projektu"};
 const selectObject=(id:string)=>{setActiveTool("equipment");setEditPlan(true);setZoom(100);props.selectObject(id)};
 const thumb=(q:Project)=>props.renderCourt({...q,objects:[]});
 return <main className="studio-shell studio-canvas-editor" data-tool={activeTool}>
  <header className="studio-topbar">
   <a href="https://www.gamefields.eu/" target="_top" className="studio-logo" aria-label="Gamefields — strona główna">gamefields <span>studio</span></a>
   <input aria-label="Nazwa projektu" maxLength={200} value={p.name} onChange={e=>update({name:e.target.value},false)} className="studio-project-name"/>
   <div className="studio-top-actions"><span className="studio-save" role="status"><Check size={16}/>{props.saveStatus}</span><button className="studio-save-project" aria-label="Zapisz projekt" onClick={props.download}><FolderOpen size={18}/><span>Zapisz projekt</span></button><button className="studio-primary" onClick={()=>setSummaryOpen(true)}>Podsumowanie i wycena <ArrowRight size={18}/></button></div>
  </header>
  <div className="studio-screen">
   <nav className="studio-tool-rail" aria-label="Narzędzia edycji">{([[
    "construction","Konstrukcja",Box],["surface","Nawierzchnia",Droplets],["graphics","Grafika",Palette],["equipment","Wyposażenie",Goal]
   ] as const).map(([tool,label,Icon])=><button key={tool} aria-pressed={activeTool===tool} aria-controls="studio-edit-panel" onClick={()=>openTool(tool)}><Icon size={25}/><span>{label}</span></button>)}</nav>
   <section className="studio-visual" aria-label="Podgląd projektu">
    <div className="studio-toolbar">
     <div className="studio-history"><button aria-label="Cofnij" onClick={props.undo} disabled={!props.canUndo}><Undo2 size={18}/><span>Cofnij</span></button><button aria-label="Ponów" onClick={props.redo} disabled={!props.canRedo}><Redo2 size={18}/><span>Ponów</span></button></div>
     <div className="studio-cameras" role="group" aria-label="Perspektywa wizualizacji">{([["realistic","Boczny"],["aerial","Z góry"],["ground","Z boiska"]] as const).map(([mode,label])=><button key={mode} aria-pressed={!editPlan&&props.previewMode===mode} disabled={!props.hasLivePreview} onClick={()=>readyView(mode)}>{mode==="aerial"?<Grid2X2 size={18}/>:mode==="ground"?<Eye size={18}/>:<Camera size={18}/>}<span>{label}</span></button>)}</div>
     <button className="studio-mobile-place" aria-label="Wybierz miejsce" onClick={()=>openTool("place")}><MapPin size={18}/></button><label className="studio-location-short"><MapPin size={17}/><select aria-label="Miejsce wizualizacji" value={props.location} onChange={e=>props.setLocation(e.target.value as RealisticLocation)}>{REALISTIC_LOCATIONS.filter(l=>l.enabled).map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select><ChevronDown size={14}/></label>
    </div>
    <div className={"studio-stage "+(editPlan?"is-plan":"is-preview")}>
     <div className="studio-render" style={{transform:`scale(${zoom/100})`}}>{editPlan?props.renderCourt(p,true):props.renderPreview()}</div>
     {editPlan?<div className="studio-plan-note"><Move size={15}/> Przeciągnij element, aby zmienić jego pozycję</div>:null}
     {!editPlan&&p.arenaModel?<div className="studio-hotspots" aria-label="Edytuj część boiska"><button className="studio-hotspot-surface" aria-pressed={activeTool==="surface"} onClick={()=>openTool("surface")}><Droplets size={18}/>Nawierzchnia</button><button className="studio-hotspot-panels" aria-pressed={activeTool==="construction"} onClick={()=>openTool("construction")}><Box size={18}/>Panele</button></div>:null}
     <div className="studio-stage-footer"><button className="studio-project-chip" onClick={openModel}><Goal size={18}/><span>{profile.label} · {courtDimensions(p)} · {surfaceLabel(p.surface)}</span></button><div className="studio-zoom"><button aria-label="Oddal podgląd" disabled={zoom<=70} onClick={()=>setZoom(z=>Math.max(70,z-10))}><Minus size={17}/></button><button aria-label="Przywróć domyślne powiększenie" onClick={()=>setZoom(editPlan||props.previewMode!=="aerial"?100:170)}>{zoom}%</button><button aria-label="Przybliż podgląd" disabled={zoom>=200} onClick={()=>setZoom(z=>Math.min(200,z+10))}><Plus size={17}/></button></div></div>
    </div>
    <footer className="studio-visual-footer"><button onClick={openModel}>Zmień boisko <ArrowRight size={14}/></button><button aria-pressed={editPlan} onClick={()=>{setEditPlan(v=>!v);setZoom(100)}}><Move size={15}/> {editPlan?"Wróć do podglądu":"Plan edycji obiektów"}</button><a href="/radar">Radar · mapa <ArrowUpRight size={14}/></a></footer>
   </section>
   <aside id="studio-edit-panel" className={"studio-panel"+(materialOpen?" is-expanded":"")} aria-label="Ustawienia projektu" ref={panelRef} tabIndex={-1}>
    <div className="studio-dock-heading"><h1>{toolLabels[activeTool]}</h1><div><button className="studio-dock-link" aria-label="Pliki projektu" onClick={()=>openTool("files")}><FolderOpen size={16}/><span>Pliki</span></button>{activeTool!=="surface"?<button aria-label="Wróć do nawierzchni" onClick={()=>openTool("surface")}><X size={19}/></button>:null}</div></div>
    {activeTool==="surface"?<><div className="studio-surface-bar">
     <button className="studio-current-pattern" onClick={()=>setPatternsOpen(true)}><span className="studio-pattern-thumb">{thumb(p)}</span><span><b>{family.name}</b><small>Zmień wzór <ArrowRight size={14}/></small></span></button>
     <div className="studio-surface-colors">{color("base","Pole gry")}{color("zone","Strefy")}{color("outside","Otoczenie")}</div>
     <label className="studio-lines-toggle"><span>Linie</span><span><input aria-label="Pokaż linie" type="checkbox" checked={p.lines} onChange={e=>update({lines:e.target.checked})}/>{p.lines?"Włączone":"Wyłączone"}</span></label>
     <button className="studio-material-trigger" aria-expanded={materialOpen} onClick={()=>setMaterialOpen(!materialOpen)}><Layers size={18}/><span>{surfaceLabel(p.surface)}<small>Zmień materiał</small></span><ChevronDown size={15}/></button>
    </div>{materialOpen?<div className="studio-material-expanded"><SurfaceMaterialPicker value={p.surface} onChange={surface=>update({surface})}/></div>:null}</>:null}
    {activeTool==="model"?<details className="studio-section studio-model-section" open><summary><Goal size={22}/><span>Boisko<small>{profile.label} · {courtDimensions(p)}</small></span><ChevronDown size={17}/></summary><div className="studio-section-body">
     <div className="studio-models">{sportProfiles.filter(s=>s.arenaModel||s.id==="street-football-3x3").map(s=><button key={s.id} aria-pressed={s.id===profile.id} onClick={()=>{props.selectSport(s);setEditPlan(false);setZoom(100);openTool("surface")}}>{s.label}{s.id===profile.id?<Check size={15}/>:null}</button>)}</div>
     {!p.arenaModel?<div className="studio-dimensions"><label>Długość (m)<input type="number" min={6} max={60} step={.1} value={p.length} onChange={e=>{const n=Number(e.target.value);if(n>=6&&n<=60)update({length:n})}}/></label><label>Szerokość (m)<input type="number" min={6} max={40} step={.1} value={p.width} onChange={e=>{const n=Number(e.target.value);if(n>=6&&n<=40)update({width:n})}}/></label></div>:null}
     <p className="studio-hint">{p.arenaModel?"Wymiary zgodne z wybraną konstrukcją.":"Wymiary zapisujemy w projekcie. Sceneria pokazuje proporcje bazowego boiska 15 × 10 m; zmieniony obrys zobaczysz w planie edycji."}</p>
    </div></details>:null}
    {activeTool==="graphics"?<details className="studio-section studio-design-section" open><summary><Palette size={22}/><span>Wzór i kolory<small>{family.name} · {getPatternPalette(p.patternPalette).name}</small></span><ChevronDown size={17}/></summary><div className="studio-section-body">
     <button className="studio-current-pattern" onClick={()=>setPatternsOpen(true)}><span className="studio-pattern-thumb">{thumb(p)}</span><span><b>{family.name}</b><small>Zmień wzór <ArrowRight size={14}/></small></span><Check size={19}/></button>
     <div className="studio-colors"><p>Kolory wzoru</p><div>{color("base","Pole gry")}{color("zone","Strefy")}{color("outside","Otoczenie")}</div></div>
     <details className="studio-palette-details"><summary>Palety kolorów <ChevronDown size={15}/></summary><div className="studio-palettes">{patternPalettes.map(pal=><button key={pal.id} aria-pressed={p.patternPalette===pal.id} onClick={()=>props.applyPalette(pal.id)}><span>{pal.colors.map((c,i)=><i key={i} style={{background:c}}/>)}</span>{pal.name}{p.patternPalette===pal.id?<Check size={13}/>:null}</button>)}</div></details>
    </div></details>:null}

    {activeTool==="graphics"?<details className="studio-section studio-lines-section" open><summary><Grid2X2 size={22}/><span>Linie<small>{p.lines?"Włączone":"Wyłączone"} · {p.lineColor.toUpperCase()}</small></span><ChevronDown size={17}/></summary><div className="studio-section-body"><label className="studio-switch">Pokaż linie<input type="checkbox" checked={p.lines} onChange={e=>update({lines:e.target.checked})}/></label>{color("lineColor","Linie")}</div></details>:null}
    {activeTool==="graphics"?<details className="studio-section studio-advanced-section"><summary><SlidersHorizontal size={22}/><span>Zaawansowane: skala i logo</span><ChevronDown size={17}/></summary><div className="studio-section-body">
     <h2>Wariant kompozycji</h2><div className="studio-variants">{variants.map(v=><button key={v.variant} aria-label={`Wariant ${v.variant}`} aria-pressed={(p.patternVariant||1)===v.variant} onClick={()=>update({patternVariant:v.variant})}>{v.variant}</button>)}</div>
     {([["patternDensity","Skala wzoru",60,140],["graphicOpacity","Intensywność wzoru",20,100],["shadowIntensity","Cień i głębia",0,100],["graphicRotation","Obrót grafiki",-180,180]] as const).map(([key,label,min,max])=><label className="studio-range" key={key}><span>{label}<b>{p[key]??25}{key==="graphicRotation"?"°":"%"}</b></span><input type="range" min={min} max={max} step={5} value={p[key]??25} onChange={e=>update({[key]:Number(e.target.value),...(key==="shadowIntensity"?{shadowEnabled:Number(e.target.value)>0}:{} )})}/></label>)}
     <div className="studio-brand-actions"><button onClick={()=>uploadRef.current?.click()}><Upload size={17}/> Dodaj własne logo</button><button onClick={()=>{props.addText();setEditPlan(true);setZoom(100)}}><Type size={17}/> Dodaj tekst</button><input ref={uploadRef} hidden multiple type="file" accept=".png,.svg,image/png,image/svg+xml" onChange={e=>{props.upload(e.target.files);setEditPlan(true);setZoom(100);e.target.value=""}}/></div><p className="studio-hint">Logo PNG lub SVG, do 2 MB. Pozycję i rozmiar zmienisz w planie edycji.</p>
    </div></details>:null}
    {activeTool==="equipment"?<details className="studio-section studio-equipment-section" open><summary><Goal size={22}/><span>Wyposażenie<small>{p.objects.filter(o=>o.kind==="equipment").length} elementów</small></span><ChevronDown size={17}/></summary><div className="studio-section-body"><div className="studio-equipment">{profile.equipment.map(name=><button key={name} onClick={()=>{props.addEquipment(name);setEditPlan(true);setZoom(100)}}><Plus size={15}/>{name}</button>)}</div><div className="studio-object-list">{p.objects.map(o=><div key={o.id}><button onClick={()=>selectObject(o.id)}>{o.name}<small>Edytuj</small></button><button aria-label={`Usuń ${o.name}`} onClick={()=>props.removeObject(o.id)}><Trash2 size={15}/></button></div>)}</div></div></details>:null}
    {activeTool==="place"?<details className="studio-section studio-place-section" open><summary><MapPin size={22}/><span>Miejsce<small>{location?.name}</small></span><ChevronDown size={17}/></summary><div className="studio-section-body"><div className="studio-locations">{REALISTIC_LOCATIONS.filter(l=>l.enabled).map(l=><button key={l.id} aria-pressed={props.location===l.id} aria-label={l.label} onClick={()=>props.setLocation(l.id)}>{l.name}{props.location===l.id?<Check size={15}/>:null}</button>)}</div><p className="studio-hint">Scenerie poglądowe. Koncepcja wymaga potwierdzenia warunków miejsca.</p></div></details>:null}
    {activeTool==="construction"?<div className="studio-construction-content">{p.arenaModel?<ArenaSettings project={p} onChange={update}/>:<p>Wybierz model konstrukcji, aby edytować jej kolory.</p>}<button className="studio-change-model" onClick={openModel}>Zmień boisko <ArrowRight size={15}/></button></div>:null}
    {props.selected?<section className="studio-object-editor"><div><h2>{props.selected.name}</h2><button aria-label="Zamknij edycję elementu" onClick={()=>props.selectObject(null)}><Minus size={17}/></button></div>{props.selected.kind==="text"||props.selected.kind==="sponsor"?<label>Treść<input value={props.selected.text||""} onChange={e=>props.updateObject(props.selected!.id,{text:e.target.value})}/></label>:null}<label>Miejsce<select value={props.selected.target} onChange={e=>props.updateObject(props.selected!.id,{target:e.target.value as Target})}>{Object.entries(targetNames).map(([key,value])=><option key={key} value={key}>{value}</option>)}</select></label>{props.selected.kind!=="equipment"?<label>Kolor<input type="color" value={props.selected.color} onChange={e=>props.updateObject(props.selected!.id,{color:e.target.value})}/></label>:null}{([["scale","Rozmiar",20,220],["rotation","Obrót",-180,180],["opacity","Widoczność",0,100]] as const).map(([key,label,min,max])=><label className="studio-range" key={key}><span>{label}<b>{props.selected![key]}{key==="rotation"?"°":"%"}</b></span><input type="range" min={min} max={max} value={props.selected![key]} onChange={e=>props.updateObject(props.selected!.id,{[key]:Number(e.target.value)})}/></label>)}<button className="studio-delete" onClick={()=>props.removeObject(props.selected!.id)}><Trash2 size={15}/> Usuń element</button></section>:null}
    <div className="studio-panel-actions" hidden={activeTool!=="files"}><button onClick={props.download}><Download size={18}/> Pobierz projekt</button><button onClick={()=>importRef.current?.click()}><FolderOpen size={17}/> Wczytaj projekt JSON</button><input hidden ref={importRef} type="file" accept=".json,.txt,application/json,text/plain" onChange={e=>{props.importProject(e.target.files?.[0]);e.target.value=""}}/></div>
   </aside>
  </div>
  {patternsOpen?<div className="studio-modal-backdrop" onClick={()=>setPatternsOpen(false)}><section className="studio-modal" role="dialog" aria-modal="true" aria-label="Wybierz wzór" onClick={e=>e.stopPropagation()}><div className="studio-modal-head"><div><span>GAMEFIELDS DESIGN ENGINE</span><h2>Wybierz charakter boiska</h2></div><button autoFocus onClick={()=>setPatternsOpen(false)}>Zamknij</button></div><div className="studio-direction-grid">{signaturePresets.map(item=>{const q={...p,patternFamily:item.familyId,patternVariant:item.variant,patternPalette:item.paletteId,base:getPatternPalette(item.paletteId).colors[4],zone:getPatternPalette(item.paletteId).colors[1]};const active=item.familyId===p.patternFamily;return <button key={item.id} aria-pressed={active} onClick={()=>{props.applyDirection(item.familyId,item.variant,item.paletteId);setPatternsOpen(false)}}><span>{thumb(q)}</span><b>{item.name}{active?<Check size={17}/>:null}</b><small>{item.useCase}</small></button>})}</div><button className="studio-primary" onClick={()=>{setPatternsOpen(false);props.openPatterns()}}>Wszystkie 300 wzorów <ArrowRight size={18}/></button></section></div>:null}
  {summaryOpen?<div className="studio-modal-backdrop" onClick={()=>setSummaryOpen(false)}><section className="studio-modal studio-summary" role="dialog" aria-modal="true" aria-label="Podsumowanie projektu" onClick={e=>e.stopPropagation()}><div className="studio-modal-head"><div><span>TWÓJ PROJEKT</span><h2>Podsumowanie</h2></div><button autoFocus onClick={()=>setSummaryOpen(false)}>Wróć do edycji</button></div><h3>{p.name}</h3><dl>{[["Boisko",profile.label],["Wymiary",courtDimensions(p)],["Powierzchnia",`${Math.round(courtArea(p)*100)/100} m²`],["Wzór",`${family.name} · wariant ${p.patternVariant||1}`],["Nawierzchnia",surfaceLabel(p.surface)],["Paleta",getPatternPalette(p.patternPalette).name],["Sceneria",location?.name||"Park"],["Elementy",String(p.objects.length)]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><div className="studio-summary-quote"><h3>Wycena indywidualna</h3><p>Parametry projektu dołączymy do formularza. Cenę potwierdzimy po sprawdzeniu miejsca, podłoża i zakresu prac. Pliki logo możesz przesłać osobno w dalszej rozmowie.</p></div><button className="studio-primary" onClick={requestInquiry}>Zapytaj o realizację <ArrowRight size={18}/></button><button className="studio-export" onClick={props.download}><Download size={16}/> Zapisz kopię projektu JSON</button></section></div>:null}
 </main>;
}
