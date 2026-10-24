"use client";

import {useEffect,useRef,useState,type ReactNode} from "react";
import {ArrowRight,ArrowUpRight,Check,ChevronDown,Download,FolderOpen,Grid2X2,Goal,MapPin,Minus,Palette,Plus,SlidersHorizontal,Type,Undo2,Redo2,Upload,Trash2,Layers,Camera,Move,Eye,Box,Droplets,X} from "lucide-react";
import {ProjectQuote,QuoteBadge,quoteMoney} from "@/components/project-quote";
import type {QuoteState} from "@/hooks/use-project-quote";
import type {Project,EditorObject,Target} from "@/lib/project";
import {sportProfiles,getSportProfile,type SportProfile} from "@/lib/sport-profiles";
import {getPatternFamily,getPatternPalette,patternPalettes,signaturePresets,variants} from "@/lib/pattern-library";
import type {useProjectRecovery} from "@/hooks/use-project-recovery";
import {OwnedConfigurationInspector} from "@/components/owned-configuration-inspector";
import {ProjectVariants} from "@/components/project-variants";
import {ProjectSpecification} from "@/components/project-specification";
import {ProjectDimensions} from "@/components/project-dimensions";
import {courtDimensions} from "@/lib/court-geometry";
import {surfaceLabel} from "@/lib/surface-materials";
import {REALISTIC_LOCATIONS,type RealisticLocation} from "@/lib/realistic-locations";
import {SurfaceMaterialPicker} from "@/components/surface-material";
import {ArenaSettings} from "@/components/blender-arena-preview";
import {isSignaturePresetActive} from "@/lib/studio-ux.mjs";
import {createInquiryTransport,type InquiryState} from "@/lib/inquiry-transport";
import {inquirySummary} from "@/lib/inquiry-summary.mjs";
import {productCodes} from "@/lib/product-names.mjs";

type Props={
 recovery:ReturnType<typeof useProjectRecovery>;restoreProject:(p:Project)=>void;downloadProject:(p:Project)=>void;
 quote:QuoteState;project:Project;saveStatus:string;selected:EditorObject|null;canUndo:boolean;canRedo:boolean;
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
 const [activeTool,setActiveTool]=useState<StudioTool>("surface"),[materialOpen,setMaterialOpen]=useState(false),[advancedOpen,setAdvancedOpen]=useState(false);
 const [inquiryError,setInquiryError]=useState("");
 const [fileError,setFileError]=useState("");
 const fileAction=async(action:()=>Promise<void>|void)=>{setFileError("");try{await action()}catch(error){setFileError((error as Error).message)}};
 const [inquiryState,setInquiryState]=useState<InquiryState>("idle"),[inquiryMessage,setInquiryMessage]=useState("");
 const inquiryTransport=useRef<ReturnType<typeof createInquiryTransport>|null>(null);
 const modalTrigger=useRef<HTMLElement|null>(null);
 const showSummary=()=>{modalTrigger.current=document.activeElement as HTMLElement|null;setSummaryOpen(true)};
 const showPatterns=()=>{modalTrigger.current=document.activeElement as HTMLElement|null;setPatternsOpen(true)};
 const importRef=useRef<HTMLInputElement>(null),uploadRef=useRef<HTMLInputElement>(null),panelRef=useRef<HTMLElement>(null),workspaceRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{panelRef.current?.scrollTo({top:0})},[activeTool,materialOpen]);
 useEffect(()=>{
  if(!patternsOpen&&!summaryOpen)return;
  const previous=modalTrigger.current;
  const oldOverflow=document.body.style.overflow;
  document.body.style.overflow="hidden";
  if(workspaceRef.current)workspaceRef.current.inert=true;
  const onKey=(event:KeyboardEvent)=>{
   if(event.key==="Escape"){setPatternsOpen(false);setSummaryOpen(false)}
   if(event.key!=="Tab")return;
   const controls=[...document.querySelectorAll<HTMLElement>('.studio-modal button:not(:disabled),.studio-modal a[href],.studio-modal input,.studio-modal textarea,.studio-modal select')];
   const first=controls[0],last=controls.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
  };
  document.addEventListener("keydown",onKey);
  return()=>{document.removeEventListener("keydown",onKey);document.body.style.overflow=oldOverflow;if(workspaceRef.current)workspaceRef.current.inert=false;previous?.focus()};
 },[patternsOpen,summaryOpen]);
 useEffect(()=>{
  const transport=createInquiryTransport({onState:(state,message)=>{
   setInquiryState(state);setInquiryMessage(message);
   if(state==="error"){setInquiryError(message);setSummaryOpen(true)}
   if(state==="attached"&&window.parent!==window)setSummaryOpen(false);
  }});
  inquiryTransport.current=transport;
  const onMessage=(event:MessageEvent)=>transport.receive(event);
  window.addEventListener("message",onMessage);
  return()=>{window.removeEventListener("message",onMessage);transport.dispose();inquiryTransport.current=null};
 },[]);
 const requestInquiry=()=>{
  setInquiryError("");setInquiryState("idle");setInquiryMessage("");
  let summary:string;try{summary=inquirySummary({...p,objects:p.objects.filter(o=>o.kind!=="equipment")},props.quote.loading||props.quote.error?null:props.quote.data)}catch(error){setInquiryError((error as Error).message);return}
  if(window.parent!==window)inquiryTransport.current?.start(window.parent,summary);
  else {
   const contactWindow=window.open("https://www.gamefields.eu/#kontakt",`gamefields-inquiry-${crypto.randomUUID()}`);
   if(!contactWindow){setInquiryError("Przeglądarka zablokowała formularz. Zezwól na otwarcie okna i spróbuj ponownie.");return}
   inquiryTransport.current?.start(contactWindow,summary,true);
  }
 };
 useEffect(()=>{
  if(window.parent===window)return;
  const send=()=>{if(window.innerWidth<800)window.parent.postMessage({type:"gf-height",height:document.querySelector(".studio-shell")?.scrollHeight||1800},"https://www.gamefields.eu")};
  const observer=new ResizeObserver(send);const shell=document.querySelector(".studio-shell");if(shell)observer.observe(shell);send();return()=>observer.disconnect();
 },[]);
 const profile=getSportProfile(p.sport,p.arenaModel),family=getPatternFamily(p.patternFamily),location=REALISTIC_LOCATIONS.find(l=>l.id===props.location);
 const readyView=(mode:Props["previewMode"])=>{setEditPlan(false);props.setPreviewMode(mode);setZoom(mode==="aerial"?170:100)};
 const color=(key:"base"|"zone"|"outside"|"lineColor",label:string)=><label className="studio-color" key={key}><input type="color" aria-label={`Kolor: ${label}`} value={p[key]} onChange={e=>update({[key]:e.target.value})}/><span>{label}<small>{p[key].toUpperCase()}</small></span></label>;
 const openTool=(tool:StudioTool)=>{setActiveTool(tool);setMaterialOpen(false);setAdvancedOpen(false);props.selectObject(null);requestAnimationFrame(()=>panelRef.current?.focus({preventScroll:true}))};
 const openModel=()=>openTool("model");
 const toolLabels:Record<StudioTool,string>={model:"Wybierz boisko",construction:"Konstrukcja",surface:"Nawierzchnia",graphics:"Grafika i linie",equipment:"Wyposażenie",place:"Miejsce",files:"Pliki projektu"};
 const selectObject=(id:string)=>{setActiveTool(p.objects.find(o=>o.id===id)?.kind==="equipment"?"equipment":"graphics");setEditPlan(true);setZoom(100);props.selectObject(id)};
 const thumb=(q:Project)=>props.renderCourt({...q,objects:[]});
 const modelCode=p.arenaModel?productCodes[p.arenaModel]:undefined;
 const design=p.arenaDesign||{panelColor:"#b90f35",frameColor:"#30363c",goalColor:"#30363c",finish:"matte",text:"",side:"both",src:undefined};
 const summaryColor=(hex:string)=><span className="studio-summary-color"><i style={{background:hex}} aria-hidden="true"/>{hex.toUpperCase()}</span>;
 const summarySection=(title:string,tool:StudioTool,rows:[string,ReactNode][])=><section className="studio-summary-section"><header><h3>{title}</h3><button aria-label={`Edytuj: ${title}`} onClick={()=>{setSummaryOpen(false);openTool(tool)}}>Edytuj <ArrowRight size={14}/></button></header><dl>{rows.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>;
 return <main className="studio-shell studio-canvas-editor" data-tool={activeTool} data-expanded={activeTool==="surface"&&(materialOpen||advancedOpen)}>
  <div className="studio-workspace-content" ref={workspaceRef}>
  <header className="studio-topbar">
   <a href="https://www.gamefields.eu/" target="_top" className="studio-logo" aria-label="Gamefields — strona główna">gamefields <span>studio</span></a>
   <input aria-label="Nazwa projektu" maxLength={200} value={p.name} onChange={e=>update({name:e.target.value},false)} className="studio-project-name"/>
   {props.recovery.blocked?<button className="studio-save studio-recovery-status" aria-label="Otwórz odzyskiwanie projektu" onClick={()=>openTool("files")}>{props.saveStatus}</button>:<span className="studio-save" role="status">{props.saveStatus.startsWith("Zapisano")?<Check size={16}/>:null}{props.saveStatus}</span>}<div className="studio-top-actions"><button className="studio-save-project" aria-label="Pobierz projekt" title="Pobierz kopię projektu JSON" onClick={props.download}><Download size={18}/><span>Pobierz projekt</span></button><QuoteBadge quote={props.quote} onClick={showSummary}/></div>
  </header>
  <div className="studio-screen">
   <nav className="studio-tool-rail" aria-label="Narzędzia edycji">{([[
    "construction","Konstrukcja",Box],["surface","Nawierzchnia",Droplets],["graphics","Grafika",Palette]
   ] as const).map(([tool,label,Icon])=><button key={tool} aria-pressed={activeTool===tool} aria-controls="studio-edit-panel" onClick={()=>openTool(tool)}><Icon size={25}/><span>{label}</span></button>)}</nav>
   <section className="studio-visual" aria-label="Podgląd projektu">
    <div className="studio-toolbar">
     <div className="studio-history"><button aria-label="Cofnij" onClick={props.undo} disabled={!props.canUndo}><Undo2 size={18}/><span>Cofnij</span></button><button aria-label="Ponów" onClick={props.redo} disabled={!props.canRedo}><Redo2 size={18}/><span>Ponów</span></button></div>
     <div className="studio-cameras" role="group" aria-label="Perspektywa wizualizacji">{([["realistic","Boczny"],["aerial","Z góry"],["ground","Model 3D"]] as const).map(([mode,label])=><button key={mode} aria-pressed={!editPlan&&props.previewMode===mode} disabled={!props.hasLivePreview||(mode==="ground"&&!p.arenaModel)} title={mode==="ground"&&!p.arenaModel?"Wybierz model konstrukcji, aby obracać go w 3D":undefined} onClick={()=>readyView(mode)}>{mode==="aerial"?<Grid2X2 size={18}/>:mode==="ground"?<Box size={18}/>:<Camera size={18}/>}<span>{label}</span></button>)}</div>

    </div>
    <div className={"studio-stage "+(editPlan?"is-plan":"is-preview")}>
     <div className="studio-render" style={{transform:`scale(${zoom/100})`}}>{editPlan?props.renderCourt(p,true):props.renderPreview()}</div>
     {editPlan?<div className="studio-plan-note"><Move size={15}/> Przeciągnij element, aby zmienić jego pozycję</div>:null}
     {!editPlan&&p.arenaModel?<div className="studio-hotspots" aria-label="Edytuj część boiska"><button className="studio-hotspot-surface" aria-pressed={activeTool==="surface"} onClick={()=>openTool("surface")}><Droplets size={18}/>Nawierzchnia</button><button className="studio-hotspot-panels" aria-pressed={activeTool==="construction"} onClick={()=>openTool("construction")}><Box size={18}/>Panele</button></div>:null}
     <div className="studio-stage-footer"><button className="studio-project-chip" onClick={openModel}><Goal size={18}/><span>{profile.label} · {courtDimensions(p)} · {surfaceLabel(p.surface)}</span></button><div className="studio-zoom"><button aria-label="Oddal podgląd" disabled={zoom<=70} onClick={()=>setZoom(z=>Math.max(70,z-10))}><Minus size={17}/></button><button aria-label="Przywróć domyślne powiększenie" onClick={()=>setZoom(editPlan||props.previewMode!=="aerial"?100:170)}>{zoom}%</button><button aria-label="Przybliż podgląd" disabled={zoom>=200} onClick={()=>setZoom(z=>Math.min(200,z+10))}><Plus size={17}/></button></div></div>
    </div>
    <footer className="studio-visual-footer"><button onClick={openModel}>Zmień boisko <ArrowRight size={14}/></button><button aria-pressed={editPlan} onClick={()=>{setEditPlan(v=>!v);setZoom(100)}}><Move size={15}/> {editPlan?"Wróć do podglądu":"Plan edycji obiektów"}</button><a href="/radar">Radar · mapa <ArrowUpRight size={14}/></a></footer>
   </section>
   <aside id="studio-edit-panel" className={"studio-panel"+((materialOpen||advancedOpen)?" is-expanded":"")} aria-label="Ustawienia projektu" ref={panelRef} tabIndex={-1}>
    <div className="studio-dock-heading"><h1>{toolLabels[activeTool]}</h1><div><button className="studio-dock-link" aria-label="Pliki projektu" onClick={()=>openTool("files")}><FolderOpen size={16}/><span>Pliki</span></button>{activeTool!=="surface"?<button aria-label="Wróć do nawierzchni" onClick={()=>openTool("surface")}><X size={19}/></button>:null}</div></div>
    {activeTool==="surface"?<><div className="studio-surface-bar">
     <button className="studio-current-pattern" onClick={showPatterns}><span className="studio-pattern-thumb">{thumb(p)}</span><span><b>{family.name}</b><small>Zmień wzór <ArrowRight size={14}/></small></span></button>
     <div className="studio-surface-colors">{color("base","Pole gry")}{color("zone","Strefy")}{color("outside","Otoczenie")}</div>
     <label className="studio-lines-toggle"><span>Linie</span><span><input aria-label="Pokaż linie" type="checkbox" checked={p.lines} onChange={e=>update({lines:e.target.checked})}/>{p.lines?"Włączone":"Wyłączone"}</span></label>
     <button className="studio-material-trigger" aria-expanded={materialOpen} onClick={()=>setMaterialOpen(!materialOpen)}><Layers size={18}/><span>{surfaceLabel(p.surface)}<small>Zmień materiał</small></span><ChevronDown size={15}/></button>
    </div>{props.quote.data?.items.some(item=>item.id==="palette-colors")?<p className="studio-hint">Budżet palety zależy od liczby wybranych kolorów. Zmiana odcienia przy tej samej liczbie nie zwiększa dopłaty. Szczegóły w Podsumowaniu.</p>:null}{materialOpen?<div className="studio-material-expanded"><SurfaceMaterialPicker value={p.surface} onChange={surface=>update({surface})}/></div>:null}</>:null}
    {activeTool==="model"?<details className="studio-section studio-model-section" open><summary><Goal size={22}/><span>Boisko<small>{profile.label} · {courtDimensions(p)}</small></span><ChevronDown size={17}/></summary><div className="studio-section-body">
     <p className="studio-model-guidance">Wybór innego boiska przywróci jego domyślne kolory i wyposażenie. Nazwa własnego projektu pozostanie. Zmianę możesz cofnąć.</p>{props.quote.data?.notice?<p className="studio-hint">{props.quote.data.notice}</p>:null}<div className="studio-models">{sportProfiles.filter(s=>s.arenaModel||s.id==="street-football-3x3").map(s=><button key={s.id} aria-label={s.label} aria-describedby={s.arenaModel&&props.quote.data?.constructionPrices?.[s.arenaModel]!=null?`studio-model-price-${s.id}`:undefined} aria-pressed={s.id===profile.id} onClick={()=>{props.selectSport(s);setEditPlan(false);setZoom(100);openTool("surface")}}><span><b>{s.label}</b>{s.arenaModel&&props.quote.data?.constructionPrices?.[s.arenaModel]!=null?<small id={`studio-model-price-${s.id}`} className="studio-model-price">Konstrukcja: {quoteMoney(props.quote.data.constructionPrices[s.arenaModel])} netto · orientacyjnie</small>:null}<small>{s.arenaModel==="octagon"?"Ośmiokąt":s.courtShape==="circle"?"Okrąg":"Prostokąt"} · {s.courtShape==="circle"?`Ø ${s.diameter} m`:`${s.length} × ${s.width} m`}</small></span>{s.id===profile.id?<Check size={18}/>:null}</button>)}</div>
     {!p.arenaModel?<div className="studio-dimensions"><label>Długość (m)<input type="number" min={6} max={60} step={.1} value={p.length} onChange={e=>{const n=Number(e.target.value);if(n>=6&&n<=60)update({length:n})}}/></label><label>Szerokość (m)<input type="number" min={6} max={40} step={.1} value={p.width} onChange={e=>{const n=Number(e.target.value);if(n>=6&&n<=40)update({width:n})}}/></label></div>:null}
     <p className="studio-hint">{p.arenaModel?"Obrys nawierzchni i konstrukcji sprawdzisz w narzędziu Konstrukcja.":"Wymiary zapisujemy w projekcie. Sceneria pokazuje proporcje bazowego boiska 15 × 10 m; zmieniony obrys zobaczysz w planie edycji."}</p>
    </div></details>:null}
    {activeTool==="surface"?<div className="studio-surface-options"><details className="studio-palette-details"><summary>Palety kolorów <ChevronDown size={15}/></summary><div className="studio-palettes">{patternPalettes.map(pal=><button key={pal.id} aria-pressed={p.patternPalette===pal.id} onClick={()=>props.applyPalette(pal.id)}><span>{pal.colors.map((c,i)=><i key={i} style={{background:c}}/>)}</span>{pal.name}{p.patternPalette===pal.id?<Check size={13}/>:null}</button>)}</div></details><div className="studio-line-color">{color("lineColor","Kolor linii")}</div></div>:null}
    {activeTool==="surface"?<details className="studio-section studio-advanced-section" open={advancedOpen} onToggle={e=>setAdvancedOpen(e.currentTarget.open)}><summary><SlidersHorizontal size={22}/><span>Zaawansowane: skala i logo</span><ChevronDown size={17}/></summary><div className="studio-section-body">
     <div className="studio-composition"><h2>Wariant kompozycji</h2><div className="studio-variants">{variants.map(v=><button key={v.variant} aria-label={`Wariant ${v.variant}`} aria-pressed={(p.patternVariant||1)===v.variant} onClick={()=>update({patternVariant:v.variant})}>{v.variant}</button>)}</div></div>
     {([["patternDensity","Skala wzoru",60,140,100],["graphicOpacity","Intensywność wzoru",20,100,100],["shadowIntensity","Cień i głębia",0,100,25],["graphicRotation","Obrót grafiki",-180,180,0]] as const).map(([key,label,min,max,fallback])=><label className="studio-range" key={key}><span>{label}<b>{p[key]??fallback}{key==="graphicRotation"?"°":"%"}</b></span><input aria-label={label} type="range" min={min} max={max} step={5} value={p[key]??fallback} onChange={e=>update({[key]:Number(e.target.value),...(key==="shadowIntensity"?{shadowEnabled:Number(e.target.value)>0}:{} )})}/></label>)}
     <div className="studio-brand-actions"><button onClick={()=>uploadRef.current?.click()}><Upload size={17}/> Dodaj własne logo</button><button onClick={()=>{props.addText();setEditPlan(true);setZoom(100)}}><Type size={17}/> Dodaj tekst</button><input ref={uploadRef} hidden multiple type="file" accept=".png,.svg,image/png,image/svg+xml" onChange={e=>{props.upload(e.target.files);setEditPlan(true);setZoom(100);e.target.value=""}}/></div><p className="studio-hint">Logo PNG lub statyczne SVG, do 2 MB. SVG nie może zawierać skryptów, animacji ani odwołań zewnętrznych. Pozycję i rozmiar zmienisz w planie edycji.</p>
    </div></details>:null}
    {activeTool==="graphics"?<section className="studio-graphics-content"><h2>Logo i napisy na nawierzchni</h2><p className="studio-hint">Dodaj grafikę w Nawierzchni, a tutaj wybierz element, aby zmienić jego pozycję, rozmiar i obrót.</p><button className="studio-change-model" onClick={()=>{openTool("surface");setAdvancedOpen(true)}}>Dodaj logo lub tekst <ArrowRight size={15}/></button><div className="studio-object-list">{p.objects.filter(o=>o.kind!=="equipment").map(o=><div key={o.id}><button onClick={()=>selectObject(o.id)}>{o.name}<small>Edytuj</small></button><button aria-label={`Usuń ${o.name}`} onClick={()=>props.removeObject(o.id)}><Trash2 size={15}/></button></div>)}</div></section>:null}
    {activeTool==="construction"?<div className="studio-construction-content"><ProjectDimensions project={p} collapsed/>{p.arenaModel?<ArenaSettings project={p} onChange={update}/>:<p>Wybierz model konstrukcji, aby edytować jej kolory.</p>}<button className="studio-change-model" onClick={openModel}>Zmień boisko <ArrowRight size={15}/></button></div>:null}
    {props.selected&&props.selected.kind!=="equipment"?<section className="studio-object-editor"><div><h2>{props.selected.name}</h2><button aria-label="Zamknij edycję elementu" onClick={()=>props.selectObject(null)}><Minus size={17}/></button></div>{props.selected.kind==="text"||props.selected.kind==="sponsor"?<label>Treść<input value={props.selected.text||""} onChange={e=>props.updateObject(props.selected!.id,{text:e.target.value})}/></label>:null}<label>Miejsce<select value={props.selected.target} onChange={e=>props.updateObject(props.selected!.id,{target:e.target.value as Target})}>{Object.entries(targetNames).map(([key,value])=><option key={key} value={key}>{value}</option>)}</select></label><label>Kolor<input type="color" value={props.selected.color} onChange={e=>props.updateObject(props.selected!.id,{color:e.target.value})}/></label>{([["scale","Rozmiar",20,220],["rotation","Obrót",-180,180],["opacity","Widoczność",0,100]] as const).map(([key,label,min,max])=><label className="studio-range" key={key}><span>{label}<b>{props.selected![key]}{key==="rotation"?"°":"%"}</b></span><input type="range" min={min} max={max} value={props.selected![key]} onChange={e=>props.updateObject(props.selected!.id,{[key]:Number(e.target.value)})}/></label>)}<button className="studio-delete" onClick={()=>props.removeObject(props.selected!.id)}><Trash2 size={15}/> Usuń element</button></section>:null}
    {activeTool==="files"&&p.objects.some(o=>o.kind==="equipment")?<p className="studio-hint">Starsze elementy wyposażenia są zachowane w kopii JSON, ale obecnie nie są prezentowane ani wyceniane.</p>:null}{activeTool==="files"?<p className="studio-file-help">Szkic zapisuje się automatycznie tylko w tej przeglądarce. Pobierz plik JSON, aby mieć kopię lub kontynuować na innym urządzeniu. Wczytanie pliku zastąpi bieżący widok projektu.</p>:null}<div className="studio-panel-actions" hidden={activeTool!=="files"}><button onClick={props.download}><Download size={18}/> Pobierz projekt</button><button onClick={()=>importRef.current?.click()}><FolderOpen size={17}/> Wczytaj projekt JSON</button><input hidden ref={importRef} aria-label="Wczytaj projekt Studio JSON" type="file" accept=".json,.txt,application/json,text/plain" onChange={e=>{props.importProject(e.target.files?.[0]);e.target.value=""}}/></div>
    {activeTool==="files"?<section className="studio-recovery"><h2>Odzyskiwanie szkicu</h2>{props.recovery.message?<p role="alert">{props.recovery.message}</p>:null}<p>Poprzednia poprawna kopia pozostaje w tej przeglądarce. Przywrócenie zastąpi bieżący widok; możesz je cofnąć.</p><button disabled={!props.recovery.previousAvailable} onClick={()=>void fileAction(async()=>props.restoreProject(await props.recovery.recoverPrevious()))}>Przywróć poprzedni szkic</button>{props.recovery.blocked?<><button onClick={()=>void fileAction(props.recovery.downloadOriginal)}>Pobierz zachowane dane szkicu</button><button onClick={()=>void fileAction(props.recovery.authorizeReplacement)}>Kontynuuj z bieżącym projektem</button><p>Kontynuacja zachowa dotychczasowe dane przed wznowieniem zapisu. Jeśli pamięć jest niedostępna, pobierz JSON.</p></>:null}{fileError?<p role="alert">{fileError}</p>:null}</section>:null}
    {activeTool==="files"?<><ProjectVariants project={p} onRestore={async next=>{await props.recovery.preserveCurrent();props.restoreProject(next)}} renderCourt={(project,editing)=>props.renderCourt({...project,objects:project.objects.filter(o=>o.kind!=="equipment")},editing)} downloadProject={props.downloadProject}/><OwnedConfigurationInspector project={p}/></>:null}

   </aside>
  </div>
  </div>
  {patternsOpen?<div className="studio-modal-backdrop" onClick={()=>setPatternsOpen(false)}><section className="studio-modal" role="dialog" aria-modal="true" aria-label="Wybierz wzór" onClick={e=>e.stopPropagation()}><div className="studio-modal-head"><div><span>GAMEFIELDS DESIGN ENGINE</span><h2>Wybierz charakter boiska</h2></div><button autoFocus onClick={()=>setPatternsOpen(false)}>Zamknij</button></div><div className="studio-direction-grid">{signaturePresets.map(item=>{const q={...p,patternFamily:item.familyId,patternVariant:item.variant,patternPalette:item.paletteId,base:getPatternPalette(item.paletteId).colors[4],zone:getPatternPalette(item.paletteId).colors[1]};const active=isSignaturePresetActive(p,item,getPatternPalette(item.paletteId));return <button key={item.id} aria-pressed={active} onClick={()=>{props.applyDirection(item.familyId,item.variant,item.paletteId);setPatternsOpen(false)}}><span>{thumb(q)}</span><b>{item.name}{active?<Check size={17}/>:null}</b><small>{item.useCase}</small></button>})}</div><button className="studio-primary" onClick={()=>{setPatternsOpen(false);props.openPatterns()}}>Wszystkie 300 wzorów <ArrowRight size={18}/></button></section></div>:null}
  {summaryOpen?<div className="studio-modal-backdrop" onClick={()=>setSummaryOpen(false)}><section className="studio-modal studio-summary" role="dialog" aria-modal="true" aria-label="Podsumowanie projektu" onClick={e=>e.stopPropagation()}><div className="studio-modal-head"><div><span>TWÓJ PROJEKT</span><h2>Sprawdź swój projekt</h2></div><button autoFocus onClick={()=>setSummaryOpen(false)}>Wróć do edycji</button></div><p className="studio-summary-name">{p.name}</p><ProjectQuote quote={props.quote}/>
   {summarySection("Boisko","model",[["Model",profile.label],["Kod produktu",modelCode||"Projekt indywidualny"]])}<ProjectDimensions project={p}/>
   {summarySection("Nawierzchnia i grafika","surface",[["Materiał",surfaceLabel(p.surface)],["Wzór",`${family.name} · wariant ${p.patternVariant||1}`],["Paleta",getPatternPalette(p.patternPalette).name],["Pole gry",summaryColor(p.base)],["Strefy",summaryColor(p.zone)],["Otoczenie",summaryColor(p.outside)],["Linie",p.lines?summaryColor(p.lineColor):"Wyłączone"]])}
   {p.arenaModel?summarySection("Konstrukcja","construction",[["Kolor paneli",summaryColor(design.panelColor)],["Kolor ramy",summaryColor(design.frameColor)],["Kolor bramek",summaryColor(design.goalColor)],["Wykończenie",({matte:"Matowe",gloss:"Połysk",metal:"Metal lakierowany"})[design.finish]],["Napis na panelach",design.text||"Brak"],["Logo na panelach",design.src?"Dodane":"Brak"],...(design.text||design.src?[["Strona oznaczeń",({both:"Obie strony",inner:"Od wewnątrz",outer:"Na zewnątrz"})[design.side]] as [string,ReactNode]]:[]) ]):null}
   {summarySection("Grafiki i napisy","graphics",[["Elementy projektu",p.objects.filter(o=>o.kind!=="equipment").map(o=>o.name).join(", ")||"Brak dodatkowych grafik"]])}
   <ProjectSpecification project={{...p,objects:p.objects.filter(o=>o.kind!=="equipment")}}/><p className="studio-hint">Parametry projektu i bieżącą kalkulację dołączymy do zapytania. Pliki logo możesz przesłać w dalszej rozmowie.</p>{inquiryError?<p role="alert">{inquiryError}</p>:null}{inquiryState!=="idle"&&inquiryState!=="error"?<p role="status">{inquiryMessage}</p>:null}<button className="studio-primary" disabled={inquiryState==="waiting"} onClick={requestInquiry}>Zapytaj o realizację <ArrowRight size={18}/></button><button className="studio-export" onClick={props.download}><Download size={16}/> Pobierz kopię projektu JSON</button></section></div>:null}
 </main>;
}
