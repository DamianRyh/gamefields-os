"use client";
import {sportSurfaces,sportSurface,selectSurface,type SurfaceModel} from "@/lib/sport-surfaces";
import {StudioDesignChoices,StudioMaterialChoices,StudioSurfaceChoices,StudioConstructionChoices,StudioCreativeLines,StudioColorEditor,StudioPaletteChoices} from "@/components/studio-visual-tools";
import {StudioModelThumbnail} from "@/components/studio-model-thumbnail";
import {StudioModularControls} from "@/components/studio-modular-controls";
import {modularFamily} from "@/lib/studio-modular";
import "@/app/studio-focus.css";
import {projectDimensions} from "@/lib/project-dimensions";

import {useEffect,useMemo,useRef,useState,type ReactNode} from "react";
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
import {clampToCircle,isRoundCourt,courtDimensions} from "@/lib/court-geometry";
import {surfaceLabel} from "@/lib/surface-materials";
import {REALISTIC_LOCATIONS,type RealisticLocation} from "@/lib/realistic-locations";
import {SurfaceMaterialPicker} from "@/components/surface-material";
import {ArenaSettings,PannaStudioPreview} from "@/components/blender-arena-preview";
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

type StudioTool="surface-model"|"model"|"construction"|"surface"|"graphics"|"equipment"|"place"|"files";
const targetNames:Record<Target,string>={court:"Nawierzchnia","band-top":"Banda górna","band-bottom":"Banda dolna","band-left":"Banda lewa","band-right":"Banda prawa"};

export function StudioWorkspace(props:Props){
 const {project:p,update}=props;
 const [patternsOpen,setPatternsOpen]=useState(false),[summaryOpen,setSummaryOpen]=useState(false),[editPlan,setEditPlan]=useState(false),[zoom,setZoom]=useState(props.previewMode==="aerial"?170:100);
 const [activeTool,setActiveTool]=useState<StudioTool>("surface"),[materialOpen,setMaterialOpen]=useState(false),[advancedOpen,setAdvancedOpen]=useState(false);
 const [modularExpanded,setModularExpanded]=useState(true);
 const [constructionTab,setConstructionTab]=useState<"models"|"colors"|"modules">("models");
 const [graphicsTab,setGraphicsTab]=useState<"lines"|"logo"|"text">("lines");
 const [surfaceTab,setSurfaceTab]=useState<"design"|"colors"|"material"|"sport">("design");
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
  const root=document.documentElement;
  const fit=()=>{const height=Math.round(Math.min(window.innerHeight,window.visualViewport?.height||Infinity,window.screen.availHeight||Infinity));if(height>0)root.style.setProperty("--studio-viewport-height",`${height}px`)};
  fit();window.addEventListener("resize",fit);window.visualViewport?.addEventListener("resize",fit);
  return()=>{window.removeEventListener("resize",fit);window.visualViewport?.removeEventListener("resize",fit);root.style.removeProperty("--studio-viewport-height")};
 },[]);
 const selectedSurface=sportSurface(p.surfaceModel);
 const baseProfile=getSportProfile(p.sport,p.arenaModel),profile=selectedSurface&&!p.arenaModel?{...baseProfile,label:selectedSurface.name}:baseProfile,family=getPatternFamily(p.patternFamily),location=REALISTIC_LOCATIONS.find(l=>l.id===props.location);
 const readyView=(mode:Props["previewMode"])=>{setEditPlan(false);props.setPreviewMode(mode);setZoom(mode==="aerial"?170:100)};
 const color=(key:"base"|"zone"|"outside"|"lineColor",label:string)=><label className="studio-color" key={key}><input type="color" aria-label={`Kolor: ${label}`} value={p[key]} onChange={e=>update({[key]:e.target.value})}/><span>{label}<small>{p[key].toUpperCase()}</small></span></label>;
 const openTool=(tool:StudioTool)=>{if(tool==="construction"||tool==="model"){setEditPlan(false);setZoom(100);props.setPreviewMode("ground")}setActiveTool(tool);setMaterialOpen(false);setAdvancedOpen(false);props.selectObject(null);requestAnimationFrame(()=>panelRef.current?.focus({preventScroll:true}))};
 const openModel=()=>openTool("model");
 const toolLabels:Record<StudioTool,string>={"surface-model":"Wybierz nawierzchnię sportową",model:"Wybierz boisko",construction:"Konstrukcja",surface:"Nawierzchnia",graphics:"Grafika i linie",equipment:"Wyposażenie",place:"Miejsce",files:"Pliki projektu"};
 const selectObject=(id:string)=>{setActiveTool(p.objects.find(o=>o.id===id)?.kind==="equipment"?"equipment":"graphics");setEditPlan(false);setZoom(100);props.selectObject(id)};
 const thumb=(q:Project)=>props.renderCourt({...q,objects:[]});
 const constructionPreview=(activeTool==="construction"||activeTool==="model")&&!p.arenaModel;
 const constructionModel=p.arenaModel||"street15";
 const constructionThumbnail=<span className="studio-pattern-thumb">{constructionModel==="w1"?<StudioModelThumbnail model="w1"/>:<img src={`/arenas/thumbnails/${constructionModel}.webp`} alt="" width={240} height={156}/>}</span>;
 const previewConstruction=useMemo<Project>(()=>({...p,surfaceModel:"street-football-3x3",arenaModel:"street15",modular:undefined,courtShape:"rectangle",diameter:undefined,sport:"Piłka nożna 3×3",length:15,width:10,objects:p.surfaceModel==="street-football-3x3"?p.objects:[]}),[p]);
 const modelCode=p.arenaModel?productCodes[p.arenaModel]:undefined;
 const design=p.arenaDesign||{panelColor:"#b90f35",frameColor:"#30363c",goalColor:"#30363c",finish:"matte",text:"",side:"both",src:undefined};
 const summaryColor=(hex:string)=><span className="studio-summary-color"><i style={{background:hex}} aria-hidden="true"/>{hex.toUpperCase()}</span>;
 const summarySection=(title:string,tool:StudioTool,rows:[string,ReactNode][])=><section className="studio-summary-section"><header><h3>{title}</h3><button aria-label={`Edytuj: ${title}`} onClick={()=>{setSummaryOpen(false);openTool(tool)}}>Edytuj <ArrowRight size={14}/></button></header><dl>{rows.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>;
 return <main className="studio-shell studio-canvas-editor" data-tool={activeTool} data-expanded={activeTool==="surface"&&(materialOpen||advancedOpen)}>
  <div className="studio-workspace-content" ref={workspaceRef}>
  <header className="studio-topbar">
   <a href="https://www.gamefields.eu/" target="_top" className="studio-logo" aria-label="Gamefields — strona główna">gamefields <span>studio</span></a>
   {props.recovery.blocked?<button className="studio-save studio-recovery-status" aria-label="Otwórz odzyskiwanie projektu" onClick={()=>openTool("files")}>{props.saveStatus}</button>:<span className="studio-save" role="status">{props.saveStatus.startsWith("Zapisano")?<Check size={16}/>:null}{props.saveStatus}</span>}<div className="studio-top-actions"><button aria-label="Pliki projektu" onClick={()=>openTool("files")}><FolderOpen size={18}/></button><button className="studio-save-project" aria-label="Pobierz projekt" title="Pobierz kopię projektu JSON" onClick={props.download}><Download size={18}/><span>Pobierz projekt</span></button><QuoteBadge quote={props.quote} onClick={showSummary}/></div>
  </header>
  <div className="studio-screen">
   <nav className="studio-tool-rail" aria-label="Narzędzia edycji">{([[
    "construction","Konstrukcja",Box],["surface","Nawierzchnia",Droplets],["graphics","Grafika",Palette]
   ] as const).map(([tool,label,Icon])=><button key={tool} aria-pressed={activeTool===tool||(tool==="surface"&&activeTool==="surface-model")||(tool==="construction"&&activeTool==="model")} aria-controls="studio-edit-panel" onClick={()=>openTool(tool)}><Icon size={25}/><span>{label}</span></button>)}</nav>
   <section className="studio-visual" aria-label="Podgląd projektu">
    <div className="studio-toolbar">
     <div className="studio-history"><button aria-label="Cofnij" onClick={props.undo} disabled={!props.canUndo}><Undo2 size={18}/><span>Cofnij</span></button><button aria-label="Ponów" onClick={props.redo} disabled={!props.canRedo}><Redo2 size={18}/><span>Ponów</span></button></div>
     <button className="studio-modular-standard" onClick={()=>{openTool("construction");setConstructionTab("modules");setModularExpanded(true);readyView("ground")}}><Grid2X2 size={16}/><span>Budowanie modułowe</span></button>

    </div>
    <div className={"studio-stage "+(editPlan?"is-plan":"is-preview")}><input aria-label="Nazwa projektu" maxLength={200} value={p.name} onChange={e=>update({name:e.target.value},false)} className="studio-project-name studio-scene-name"/>
     <div className="studio-render" style={{transform:`scale(${zoom/100})`}}>{editPlan?props.renderCourt(p,true):constructionPreview?<PannaStudioPreview project={previewConstruction} interactive studio/>:props.renderPreview()}</div>
     {constructionPreview&&!editPlan?<div className="studio-construction-preview-note" role="status">Podgląd: Street Arena 15 · 15 × 10 m. Konstrukcja nie jest jeszcze dodana do projektu.</div>:null}
     {editPlan?<div className="studio-plan-note"><Move size={15}/> Przeciągnij element, aby zmienić jego pozycję</div>:null}
     <div className="studio-stage-footer"><div className="studio-project-chip"><Goal size={18}/><span>{constructionPreview&&!editPlan?"Podgląd konstrukcji · Street Arena 15 · 15 × 10 m":`${profile.label} · ${projectDimensions(p).reference} · ${surfaceLabel(p.surface)}`}</span></div><div className="studio-zoom"><button aria-label="Oddal podgląd" disabled={zoom<=70} onClick={()=>setZoom(z=>Math.max(70,z-10))}><Minus size={17}/></button><button aria-label="Przywróć domyślne powiększenie" onClick={()=>setZoom(editPlan||props.previewMode!=="aerial"?100:170)}>{zoom}%</button><button aria-label="Przybliż podgląd" disabled={zoom>=200} onClick={()=>setZoom(z=>Math.min(200,z+10))}><Plus size={17}/></button></div></div>
    </div>

   </section>
   <aside id="studio-edit-panel" className={"studio-panel"+((materialOpen||advancedOpen)?" is-expanded":"")} aria-label="Ustawienia projektu" ref={panelRef} tabIndex={-1}>
    {activeTool==='files'||activeTool==='model'||activeTool==='surface-model'?<div className="studio-dock-heading"><h1>{toolLabels[activeTool]}</h1><button aria-label="Wróć do nawierzchni" onClick={()=>openTool('surface')}><X size={19}/></button></div>:null}
    {activeTool==="surface"?<><nav className="studio-visual-tabs" aria-label="Ustawienia nawierzchni">{([['design','Wzór'],['colors','Kolory'],['material','Materiał'],['sport','Sport']] as const).map(([id,label])=><button key={id} aria-pressed={surfaceTab===id} onClick={()=>setSurfaceTab(id)}>{label}</button>)}</nav>
     {surfaceTab==='design'?<><StudioDesignChoices project={p} update={update} onColors={()=>setSurfaceTab('colors')}/></>:null}
     {surfaceTab==='colors'?<><StudioColorEditor parts={[{key:'base',name:'Pole gry',value:p.base},{key:'zone',name:'Strefy',value:p.zone},{key:'outside',name:'Otoczenie',value:p.outside}]} onChange={(key,value)=>update({[key]:value})}/><StudioPaletteChoices project={p} onChange={props.applyPalette}/></>:null}
     {surfaceTab==='material'?<StudioMaterialChoices project={p} update={update}/>:null}
     {surfaceTab==='sport'?<><StudioSurfaceChoices project={p} onChange={id=>{update(selectSurface(p,id as SurfaceModel));setEditPlan(false);setZoom(100)}}/><p className="studio-visual-note">Zmiana sportu odłącza konstrukcję. Wzór i grafiki pozostają; zmianę możesz cofnąć.</p>{selectedSurface?<details className="studio-technical"><summary>Wymiary i pliki modelu</summary><p className="studio-hint">Pole gry: {selectedSurface.fieldLength} × {selectedSurface.fieldWidth} m · podłoże: {selectedSurface.length} × {selectedSurface.width} m · 20 cm. {selectedSurface.dimensionNote}</p><div className="studio-actions"><a href={`/sport-surfaces/${selectedSurface.id}.glb`} download>Pobierz model GLB</a><a href="/sport-surfaces/sport-surfaces-20cm.blend" download>Projekt Blender</a></div></details>:null}</>:null}
    </>:null}
    {activeTool==="surface-model"?<section aria-label="Nawierzchnie sportowe"><p className="studio-hint">Wybierz niezależną nawierzchnię 20 cm. Zmiana formatu odłączy konstrukcję; wzór, grafiki i własna nazwa pozostaną. Zmianę możesz cofnąć.</p><div className="studio-models">{sportSurfaces.map(s=><button key={s.id} aria-label={s.name} aria-pressed={p.surfaceModel===s.id} onClick={()=>{update(selectSurface(p,s.id as SurfaceModel));setEditPlan(false);setZoom(100);openTool("surface")}}><span className="studio-model-media"><img src={`/sport-surfaces/${s.id}.webp`} alt="" width={640} height={400} loading="lazy"/></span><span className="studio-model-card-copy"><b>{s.name}</b><small>Pole gry: {s.fieldLength} × {s.fieldWidth} m</small><small>Podłoże: {s.length} × {s.width} m · grubość 20 cm</small></span>{p.surfaceModel===s.id?<Check size={18}/>:null}</button>)}</div></section>:null}
    {activeTool==="model"?<details className="studio-section studio-model-section" open><summary><Goal size={22}/><span>Boisko<small>{profile.label} · {projectDimensions(p).reference}</small></span><ChevronDown size={17}/></summary><div className="studio-section-body">
     <p className="studio-model-guidance">Wybór innego boiska przywróci jego domyślne kolory i ustawienia konstrukcji. Nazwa własnego projektu pozostanie. Zmianę możesz cofnąć.</p>{props.quote.data?.notice?<p className="studio-hint">{props.quote.data.notice}</p>:null}<div className="studio-models">{sportProfiles.filter(s=>s.arenaModel).map(s=><button key={s.id} aria-label={s.label} aria-describedby={s.arenaModel&&props.quote.data?.constructionPrices?.[s.arenaModel]!=null?`studio-model-price-${s.id}`:undefined} aria-pressed={s.id===profile.id} onClick={()=>{props.selectSport(s);setEditPlan(false);setZoom(100);openTool("construction")}}><span className="studio-model-media"><img src={s.arenaModel?`/arenas/thumbnails/${s.arenaModel}.webp`:"/arenas/thumbnails/surface-project.svg"} alt="" width={640} height={400} loading="lazy" decoding="async"/></span><span className="studio-model-card-copy"><b>{s.label}</b>{!s.arenaModel?<small className="studio-model-kind">Projekt nawierzchni</small>:null}{s.arenaModel&&props.quote.data?.constructionPrices?.[s.arenaModel]!=null?<small id={`studio-model-price-${s.id}`} className="studio-model-price">Konstrukcja: {quoteMoney(props.quote.data.constructionPrices[s.arenaModel])} netto · orientacyjnie</small>:null}<small>{s.arenaModel==="octagon"?"Ośmiokąt":s.courtShape==="circle"?"Okrąg":"Prostokąt"} · {s.courtShape==="circle"?`Ø ${s.diameter} m`:`${s.length} × ${s.width} m`}</small></span>{s.id===profile.id?<Check size={18}/>:null}</button>)}</div>
     {!p.arenaModel&&!p.surfaceModel?<div className="studio-dimensions"><label>Długość (m)<input type="number" min={6} max={60} step={.1} value={p.length} onChange={e=>{const n=Number(e.target.value);if(n>=6&&n<=60)update({length:n})}}/></label><label>Szerokość (m)<input type="number" min={6} max={40} step={.1} value={p.width} onChange={e=>{const n=Number(e.target.value);if(n>=6&&n<=40)update({width:n})}}/></label></div>:null}
     <p className="studio-hint">{p.arenaModel?"Obrys nawierzchni i konstrukcji sprawdzisz w narzędziu Konstrukcja.":"Wymiary zapisujemy w projekcie. Sceneria pokazuje proporcje bazowego boiska 15 × 10 m; zmieniony obrys zobaczysz w planie edycji."}</p>
    </div></details>:null}
    {activeTool==="surface"?<details className="studio-section studio-advanced-section" open={advancedOpen} onToggle={e=>setAdvancedOpen(e.currentTarget.open)}><summary><SlidersHorizontal size={22}/><span>Skala i wykończenie</span><ChevronDown size={17}/></summary><div className="studio-section-body">
     {([["patternDensity","Skala wzoru",60,140,100],["graphicOpacity","Intensywność wzoru",20,100,100],["shadowIntensity","Cień i głębia",0,100,25],["graphicRotation","Obrót grafiki",-180,180,0]] as const).map(([key,label,min,max,fallback])=><label className="studio-range" key={key}><span>{label}<b>{p[key]??fallback}{key==="graphicRotation"?"°":"%"}</b></span><input aria-label={label} type="range" min={min} max={max} step={5} value={p[key]??fallback} onChange={e=>update({[key]:Number(e.target.value),...(key==="shadowIntensity"?{shadowEnabled:Number(e.target.value)>0}:{} )})}/></label>)}
    </div></details>:null}
    {activeTool==="graphics"?<section className="studio-graphics-content"><nav className="studio-visual-tabs" aria-label="Ustawienia grafiki">{([['lines','Linie'],['logo','Logo'],['text','Tekst']] as const).map(([id,label])=><button key={id} aria-pressed={graphicsTab===id} onClick={()=>setGraphicsTab(id)}>{label}</button>)}</nav>
     {graphicsTab==='lines'?<><StudioCreativeLines project={p} update={update}/><div className="studio-visual-line-options"><label className="studio-lines-toggle"><span>Oznaczenia sportowe</span><span><input aria-label="Pokaż linie" type="checkbox" checked={p.lines} onChange={e=>update({lines:e.target.checked})}/>{p.lines?'Włączone':'Wyłączone'}</span></label>{color('lineColor','Kolor linii')}</div></>:<><div className="studio-brand-actions">{graphicsTab==='logo'?<button onClick={()=>uploadRef.current?.click()}><Upload size={20}/> Dodaj własne logo</button>:<button onClick={()=>{props.addText();setEditPlan(false)}}><Type size={20}/> Dodaj tekst</button>}</div><p className="studio-visual-note">{graphicsTab==='logo'?'PNG lub statyczne SVG, do 2 MB. Po dodaniu ustaw pozycję na modelu.':'Dodaj napis, wybierz jego treść i ustaw pozycję na modelu.'}</p></>}
     <input ref={uploadRef} hidden multiple type="file" accept=".png,.svg,image/png,image/svg+xml" onChange={e=>{props.upload(e.target.files);setEditPlan(false);e.target.value=''}}/>
     {graphicsTab!=='lines'?<div className="studio-object-list" aria-label="Warstwy grafiki">{p.objects.filter(o=>o.kind!=='equipment').map(o=><div key={o.id}><button aria-pressed={props.selected?.id===o.id} onClick={()=>selectObject(o.id)}>{o.kind==='image'&&o.src?<img src={o.src} alt="" width={48} height={36}/>:<Type size={22}/>}<span>{o.kind==='text'?o.text||o.name:o.name}</span></button><button aria-label={`Usuń ${o.name}`} onClick={()=>props.removeObject(o.id)}><Trash2 size={16}/></button></div>)}</div>:null}
    </section>:null}
    {activeTool==="construction"?<div className="studio-construction-content"><nav className="studio-visual-tabs" aria-label="Ustawienia konstrukcji">{([['models','Modele'],['colors','Kolory'],['modules','Rozbudowa']] as const).map(([id,label])=><button key={id} aria-pressed={constructionTab===id} onClick={()=>setConstructionTab(id)}>{label}</button>)}</nav>
     {constructionTab==='models'?<><StudioConstructionChoices project={p} onChange={id=>{if(id==='street15'&&p.surfaceModel==='street-football-3x3')update({arenaModel:'street15',arenaDesign:{panelColor:'#b90f35',frameColor:'#30363c',goalColor:'#30363c',finish:'matte',text:'',side:'both'}});else props.selectSport(getSportProfile(undefined,id as Project['arenaModel']));setEditPlan(false);setZoom(100)}}/>{selectedSurface&&p.arenaModel?<button className="studio-dock-link" onClick={()=>update({arenaModel:undefined,arenaDesign:undefined})}>Odłącz konstrukcję</button>:null}</>:null}
     {constructionTab==='colors'?(p.arenaModel?<ArenaSettings project={p} onChange={update} modelSelector={<span className="studio-selected-model-label">{profile.label}</span>}/>:<p className="studio-visual-note">Wybierz konstrukcję, aby zmienić jej kolory.</p>):null}
     {constructionTab==='modules'?<StudioModularControls project={p} onChange={update} onSelectModel={id=>{props.selectSport(getSportProfile(undefined,id));setEditPlan(false)}}/>:null}
     <details className="studio-technical"><summary>Wymiary i szczegóły</summary><ProjectDimensions project={p}/></details>
    </div>:null}
    {props.selected&&props.selected.kind!=="equipment"?<section className="studio-object-editor"><div><h2>{props.selected.name}</h2><button aria-label="Zamknij edycję elementu" onClick={()=>props.selectObject(null)}><Minus size={17}/></button></div>{props.selected.kind==="text"||props.selected.kind==="sponsor"?<label>Treść<input maxLength={500} value={props.selected.text||""} onChange={e=>props.updateObject(props.selected!.id,{text:e.target.value})}/></label>:null}<div className="studio-actions"><button onClick={()=>props.updateObject(props.selected!.id,{x:300,y:300*p.width/p.length})}>Wyśrodkuj</button><button disabled={p.objects.length>=200} onClick={()=>{const copy={...props.selected!,id:crypto.randomUUID(),name:props.selected!.name+' — kopia'};update({objects:[...p.objects,copy]});props.selectObject(copy.id)}}>Duplikuj</button></div>{props.selected.target!=='court'?<p className="studio-visual-note">Archiwalna grafika bandy pozostaje w projekcie. <button onClick={()=>props.updateObject(props.selected!.id,{target:'court',x:300,y:300*p.width/p.length})}>Umieść na nawierzchni</button></p>:null}<label>Kolor<input type="color" value={props.selected.color} onChange={e=>props.updateObject(props.selected!.id,{color:e.target.value})}/></label>{([['x','Pozycja pozioma',0,600],['y','Pozycja pionowa',0,600*p.width/p.length],['scale','Rozmiar',20,220],["rotation","Obrót",-180,180],["opacity","Widoczność",0,100]] as const).map(([key,label,min,max])=><label className="studio-range" key={key}><span>{label}<b>{key==='x'?Math.round(props.selected!.x/6):key==='y'?Math.round(props.selected!.y/(600*p.width/p.length)*100):props.selected![key]}{key==="rotation"?"°":"%"}</b></span><input aria-label={label} type="range" min={min} max={max} value={props.selected![key]} onChange={e=>{const value=Number(e.target.value);props.updateObject(props.selected!.id,(key==='x'||key==='y')&&isRoundCourt(p)?clampToCircle(key==='x'?value:props.selected!.x,key==='y'?value:props.selected!.y,280):{[key]:value})}}/></label>)}<button className="studio-delete" onClick={()=>props.removeObject(props.selected!.id)}><Trash2 size={15}/> Usuń element</button></section>:null}
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
