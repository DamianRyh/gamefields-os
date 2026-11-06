"use client";
import {StudioPrintPreview} from '@/components/studio-print-preview';
import {StudioPrintPanel,printOrder} from '@/components/studio-print-panel';
import {defaultStudioPrint,type StudioPrintDesign} from '@/lib/studio-print';
import '@/app/studio-products.css';
import "@/app/p2.css";
import "@/app/studio-next.css";
import {LazyMedia} from "@/components/lazy-media";
import {OptionPrices,OptionPrice} from "@/components/option-price";
import {constructionProject} from "@/lib/project-options";
import {ProjectSteps} from "@/components/project-steps";
import {projectStepState,type ProjectStep} from "@/lib/project-steps";
import {ProjectReset} from "@/components/project-reset";
import {ProjectLink} from "@/components/project-link";
import {PrimarySportChoices} from "@/components/primary-sport-choices";
import {nextProjectName} from "@/lib/studio-ux.mjs";
import {primarySports} from "@/lib/primary-sports";
import {defaultArena} from "@/components/blender-arena-preview";
import {StudioKnowledge} from "@/components/studio-knowledge";
import {ProjectLibrary} from "@/components/project-library";
import {ProjectImage} from "@/components/project-image";
import {InquiryPackage} from "@/components/inquiry-package";
import {WorkshopSave} from "@/components/workshop-save";
import {sportSurfaces,sportSurface,selectSurface,type SurfaceModel} from "@/lib/sport-surfaces";
import {StudioDesignChoices,StudioMaterialChoices,StudioSurfaceChoices,StudioConstructionChoices,StudioCreativeLines,StudioColorEditor,StudioPaletteChoices} from "@/components/studio-visual-tools";
import {StudioModelThumbnail} from "@/components/studio-model-thumbnail";
import {StudioModularControls} from "@/components/studio-modular-controls";
import {StudioWorldBackground} from "@/components/studio-world-background";
import {modularFamily} from "@/lib/studio-modular";
import "@/app/studio-focus.css";
import {projectDimensions} from "@/lib/project-dimensions";

import {useEffect,useMemo,useRef,useState,type ReactNode} from "react";
import {createPortal} from "react-dom";
import {ArrowLeft,ArrowRight,ArrowUpRight,Check,ChevronDown,ChevronLeft,ChevronRight,Download,FolderOpen,Grid2X2,Goal,MapPin,Minus,Palette,Plus,SlidersHorizontal,Type,Undo2,Redo2,Upload,Trash2,Layers,Camera,Move,Eye,Box,Droplets,Shirt,X} from "lucide-react";
import {ProjectQuote,QuoteBadge} from "@/components/project-quote";
import type {QuoteState} from "@/hooks/use-project-quote";
import type {Project,EditorObject,Target,ArenaDesign} from "@/lib/project";
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
import {StudioKitPanel} from "@/components/studio-kit-panel";
import {StudioKitPreview} from "@/components/studio-kit-preview";
import {defaultKit,kitPresetForProject,kitPreset,kitSizeCounts} from "@/lib/kit";
import "@/app/studio-kit.css";
import {useShop,variantPrice,zl,shippingNote} from "@/lib/shop";
import {StudioShopOrder} from "@/components/studio-shop-order";
import {printFormats} from "@/lib/studio-print";
import "@/app/studio-shop.css";
import {graphicMotifs,motifCategories,motifDataUrl,type GraphicMotif,type MotifCategory} from "@/lib/graphic-motifs";

type Props={entryTool?:string|null;onProducts?:()=>void;
 resetProject:()=>Promise<void>;recovery:ReturnType<typeof useProjectRecovery>;restoreProject:(p:Project)=>void;downloadProject:(p:Project)=>void;
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

type StudioTool="poster"|"ball"|"kit"|"surface-model"|"model"|"construction"|"surface"|"graphics"|"equipment"|"place"|"files";
const targetNames:Record<Target,string>={court:"Nawierzchnia","band-top":"Banda górna","band-bottom":"Banda dolna","band-left":"Banda lewa","band-right":"Banda prawa"};

type PaintPart='goalPanelColor'|'panelColor'|'frameColor'|'goalColor';
const simpleColors=[['#F8F7F3','Biały'],['#DAD9D5','Jasnoszary'],['#A0A4A5','Szary'],['#30363C','Grafit'],['#17191D','Czarny'],['#D4112A','Czerwony'],['#B90F35','Bordowy'],['#F39236','Pomarańczowy'],['#E9C845','Żółty'],['#647453','Oliwkowy'],['#438B5E','Zielony'],['#2B817E','Turkusowy'],['#78B4DC','Błękitny'],['#286EA9','Niebieski'],['#6336F5','Fioletowy'],['#E58EB2','Różowy']] as const;
const templateCategories={urban:['city-fluid','urban-camo','metro-lines','local-lettering'],sport:['club-heritage','night-signal','play-system'],art:['riviera-court','earth-motion','festival-art'],brand:['brand-stage','raw-architecture']} as const;
const paintParts:{key:PaintPart;label:string;hint:string}[]=[
 {key:'goalPanelColor',label:'Panel bramkowy',hint:'Osłony przy bramce, także podwyższone'},
 {key:'panelColor',label:'Panele boczne',hint:'Bandy wokół pola gry'},
 {key:'goalColor',label:'Bramka',hint:'Konstrukcja bramki'},
 {key:'frameColor',label:'Rama',hint:'Elementy stalowe'},
];
function ScenePaintPanel({project,update,mode,applyPalette,initialSurfacePart='base'}:{project:Project;update:(patch:Partial<Project>)=>void;mode:'surface'|'construction';applyPalette:(id:string)=>void;initialSurfacePart?:'base'|'lineColor'}){
 const [paintMounted,setPaintMounted]=useState(false);useEffect(()=>setPaintMounted(true),[]);
 const [mobilePalette,setMobilePalette]=useState(false);
 useEffect(()=>{if(!mobilePalette)return;const close=(event:PointerEvent)=>{if(!(event.target as HTMLElement).closest('.scene-paint-palette,.scene-mobile-palette-toggle'))setMobilePalette(false)};const key=(event:KeyboardEvent)=>{if(event.key==='Escape')setMobilePalette(false)};document.addEventListener('pointerdown',close);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',key)}},[mobilePalette]);
 const [part,setPart]=useState<PaintPart>('goalPanelColor');
 const [surfacePart,setSurfacePart]=useState<'base'|'zone'|'outside'|'lineColor'>(initialSurfacePart);
 const [side,setSide]=useState<'east'|'west'>('east');
 const design:ArenaDesign=project.arenaDesign||{panelColor:'#b90f35',frameColor:'#30363c',goalColor:'#30363c',finish:'matte',text:'',side:'both'};
 const options=project.arenaModel==='o1'?paintParts:paintParts.filter(item=>item.key!=='goalPanelColor');
 const selected=options.some(item=>item.key===part)?part:'panelColor';
 const surfaceOptions=[{key:'base',label:'Pole gry',hint:'Kolor głównej nawierzchni'},{key:'zone',label:'Strefy',hint:'Kolor dodatkowy'},{key:'outside',label:'Otoczenie',hint:'Obszar poza polem gry'},{key:'lineColor',label:'Linie',hint:'Oznaczenia sportowe'}] as const;
 const color=mode==='surface'?project[surfacePart]:selected==='goalPanelColor'?design.goalPanelColor||design.panelColor:design[selected];
 const focus=(next:'east'|'west'|null)=>window.dispatchEvent(new CustomEvent('gamefields:goal-panel-focus',{detail:{side:next}}));
 return <><section className={`studio-scene-paint ${mode==='surface'?'is-surface-paint':'is-construction-paint'}`} aria-label={mode==='surface'?'Kolory nawierzchni':'Kolory konstrukcji'}>
  <div className="scene-paint-head"><span className="scene-paint-kicker">01 / {mode==='surface'?'KOLORY NAWIERZCHNI':'KOLORY KONSTRUKCJI'}</span><h2>Stwórz swoje boisko</h2><p>Wybierz element i nadaj mu kolor.</p></div>
  <div className="scene-paint-parts" role="group" aria-label="Element do malowania">{mode==='surface'?surfaceOptions.map(item=><button type="button" key={item.key} className="scene-paint-part" aria-pressed={surfacePart===item.key} onClick={()=>setSurfacePart(item.key)}><span className="scene-paint-chip" style={{background:project[item.key]}}/><span><b>{item.label}</b><small>{item.hint}</small></span><ChevronDown size={15}/></button>):options.map(item=><button type="button" key={item.key} className="scene-paint-part" aria-pressed={selected===item.key} onClick={()=>{setPart(item.key);if(item.key==='goalPanelColor')focus(side);else focus(null)}}><span className="scene-paint-chip" style={{background:item.key==='goalPanelColor'?design.goalPanelColor||design.panelColor:design[item.key]}}/><span><b>{item.label}</b><small>{item.hint}</small></span><ChevronDown size={15}/></button>)}</div>
  {mode==='construction'&&project.arenaModel==='o1'&&selected==='goalPanelColor'&&<div className="scene-paint-focus" role="group" aria-label="Zbliżenie paneli bramkowych"><button type="button" aria-pressed={side==='east'} onClick={()=>{setSide('east');focus('east')}}>Bramka 1</button><button type="button" aria-pressed={side==='west'} onClick={()=>{setSide('west');focus('west')}}>Bramka 2</button><button type="button" onClick={()=>focus(null)}>Całość</button></div>}
  <button type="button" className="scene-mobile-palette-toggle" aria-label="Otwórz paletę 16 kolorów" aria-expanded={mobilePalette} onClick={()=>setMobilePalette(v=>!v)}>Zmień kolor</button>
  <details className="scene-paint-advanced"><summary>Więcej kolorów i ustawień <ArrowRight size={14}/></summary>{mode==='surface'?<StudioPaletteChoices project={project} onChange={applyPalette}/>:<ArenaSettings project={project} onChange={update}/>}</details>
 </section>{paintMounted?createPortal(<div className={`scene-paint-palette is-popover is-over-court is-persistent ${mobilePalette?'is-mobile-open':''} ${mode==='construction'?'is-construction':'is-surface'}`} role="group" aria-label="Paleta 16 jednolitych kolorów"><div className="scene-palette-caption">{mode==='construction'?'KOLOR KONSTRUKCJI':'KOLOR NAWIERZCHNI'}<small>{mode==='surface'?surfaceOptions.find(item=>item.key===surfacePart)?.label:options.find(item=>item.key===selected)?.label}</small></div>{simpleColors.map(([value,name])=><button type="button" key={value} aria-label={name} title={name} aria-pressed={color.toLowerCase()===value.toLowerCase()} onClick={()=>{mode==='surface'?update({[surfacePart]:value}):update({arenaDesign:{...design,[selected]:value}});setMobilePalette(false)}}><span style={{backgroundColor:value}}/></button>)}<label className="scene-paint-custom" title="Własny kolor"><input aria-label="Własny kolor" type="color" value={color} onChange={e=>mode==='surface'?update({[surfacePart]:e.target.value}):update({arenaDesign:{...design,[selected]:e.target.value}})}/></label></div>,document.body):null}</>;
}

export function StudioWorkspace(props:Props){
 const {project:p,update}=props;
 const shop=useShop();
 const [kitPlayer,setKitPlayer]=useState(0),[printBrush,setPrintBrush]=useState<string|null>(null);
 const [patternsOpen,setPatternsOpen]=useState(false),[summaryOpen,setSummaryOpen]=useState(false),[editPlan,setEditPlan]=useState(false),[zoom,setZoom]=useState(props.previewMode==="aerial"?170:100);
 const [templateCategory,setTemplateCategory]=useState<"all"|"urban"|"sport"|"art"|"brand">("all");
 const [motifsOpen,setMotifsOpen]=useState(false),[motifCategory,setMotifCategory]=useState<"all"|MotifCategory>("all"),[motifTarget,setMotifTarget]=useState<Target>("court");
 const [activeTool,setActiveTool]=useState<StudioTool>("surface"),[materialOpen,setMaterialOpen]=useState(false),[advancedOpen,setAdvancedOpen]=useState(false);
 const [modularExpanded,setModularExpanded]=useState(true);
 const [completedSteps,setCompletedSteps]=useState<ProjectStep[]>([]);
 const visitedSteps=useRef(new Set<ProjectStep>()),stepInteraction=useRef(false),previousStepState=useRef(projectStepState(p));
 const currentStep:ProjectStep=summaryOpen?"summary":activeTool==="construction"||activeTool==="model"?"construction":activeTool==="graphics"?"graphics":"surface";
 useEffect(()=>{visitedSteps.current.add(currentStep)},[currentStep]);
 useEffect(()=>{const next=projectStepState(p),before=previousStepState.current;previousStepState.current=next;if(!stepInteraction.current)return;const changed=(Object.keys(next) as ProjectStep[]).filter(step=>visitedSteps.current.has(step)&&next[step]!==before[step]);if(changed.length)setCompletedSteps(old=>[...new Set([...old,...changed])])},[p]);
 const [constructionTab,setConstructionTab]=useState<"models"|"modules">("models");
 const [dockMode,setDockMode]=useState<'models'|'surfaces'>('models');
 const arenaProfiles=useMemo(()=>sportProfiles.filter(item=>item.arenaModel),[]);
 const [graphicsTab,setGraphicsTab]=useState<"motifs"|"lines"|"logo"|"text">("motifs");
 const [surfaceTab,setSurfaceTab]=useState<"design"|"material"|"sport">("design");
 const [inquiryError,setInquiryError]=useState("");
 const [fileError,setFileError]=useState("");
 const fileAction=async(action:()=>Promise<void>|void)=>{setFileError("");try{await action()}catch(error){setFileError((error as Error).message)}};
 const [inquiryState,setInquiryState]=useState<InquiryState>("idle"),[inquiryMessage,setInquiryMessage]=useState("");
 const inquiryTransport=useRef<ReturnType<typeof createInquiryTransport>|null>(null);
 const modalTrigger=useRef<HTMLElement|null>(null);
 const showSummary=()=>{modalTrigger.current=document.activeElement as HTMLElement|null;setSummaryOpen(true)};
 const showPatterns=()=>{modalTrigger.current=document.activeElement as HTMLElement|null;setPatternsOpen(true)};
 const showMotifs=()=>{modalTrigger.current=document.activeElement as HTMLElement|null;setMotifsOpen(true)};
 const importRef=useRef<HTMLInputElement>(null),uploadRef=useRef<HTMLInputElement>(null),panelRef=useRef<HTMLElement>(null),workspaceRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{panelRef.current?.scrollTo({top:0})},[activeTool,materialOpen]);
 useEffect(()=>{
  if(!patternsOpen&&!summaryOpen&&!motifsOpen)return;
  const previous=modalTrigger.current;
  const oldOverflow=document.body.style.overflow;
  document.body.style.overflow="hidden";
  if(workspaceRef.current)workspaceRef.current.inert=true;
  const onKey=(event:KeyboardEvent)=>{
   if(event.key==="Escape"){setPatternsOpen(false);setSummaryOpen(false);setMotifsOpen(false)}
   if(event.key!=="Tab")return;
   const controls=[...document.querySelectorAll<HTMLElement>('.studio-modal button:not(:disabled),.studio-modal a[href],.studio-modal input,.studio-modal textarea,.studio-modal select')];
   const first=controls[0],last=controls.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
  };
  document.addEventListener("keydown",onKey);
  return()=>{document.removeEventListener("keydown",onKey);document.body.style.overflow=oldOverflow;if(workspaceRef.current)workspaceRef.current.inert=false;previous?.focus()};
 },[patternsOpen,summaryOpen,motifsOpen]);
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
  let summary:string;try{summary=inquirySummary({...p,objects:p.objects.filter(o=>o.kind!=="equipment")},null)}catch(error){setInquiryError((error as Error).message);return}
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
 const arenaIndex=arenaProfiles.findIndex(item=>item.id===profile.id);
 const changeArena=(direction:-1|1)=>{const nextIndex=arenaIndex<0?(direction===1?0:arenaProfiles.length-1):(arenaIndex+direction+arenaProfiles.length)%arenaProfiles.length;const next=arenaProfiles[nextIndex];if(!next)return;props.selectSport(next);setEditPlan(false);setZoom(100);openTool('construction');setConstructionTab('models')};
 const readyView=(mode:Props["previewMode"])=>{setEditPlan(false);props.setPreviewMode(mode);setZoom(mode==="aerial"?170:100)};
 /* Automatic names follow the product being edited; a name the customer typed is never changed. */
 const autoName=(tool:'poster'|'ball'|'kit'):{name?:string}=>{const next={poster:'Plakat — mój projekt',ball:'Piłka — mój projekt',kit:'Koszulki — mój projekt'}[tool];return / — (mój )?projekt$/.test(p.name)&&p.name!==next?{name:next}:{}};
 const openTool=(tool:StudioTool)=>{if(p.printDesign&&!['poster','ball','files'].includes(tool))update({printDesign:undefined});if(['poster','ball','kit','construction','surface-model','files'].includes(tool)){const url=new URL(window.location.href);url.searchParams.set('tool',tool);window.history.replaceState(null,'',url.pathname+url.search+url.hash)}if((tool==='poster'||tool==='ball')&&p.printDesign?.product!==tool)update({printDesign:defaultStudioPrint(tool),...autoName(tool)});else if(tool==='kit'&&p.kit&&autoName('kit').name)update(autoName('kit'),false);if(tool==="kit"&&!p.kit)update({kit:defaultKit(kitPresetForProject(p)),...autoName('kit')});if(tool==="construction"||tool==="model"){setEditPlan(false);setZoom(100);props.setPreviewMode("ground")}setActiveTool(tool);setMaterialOpen(false);setAdvancedOpen(false);props.selectObject(null);requestAnimationFrame(()=>panelRef.current?.focus({preventScroll:true}))};
 useEffect(()=>{const tool=props.entryTool||new URLSearchParams(window.location.search).get('tool')||p.printDesign?.product;if(tool&&['poster','ball','kit','surface-model','files','construction'].includes(tool))openTool(tool as StudioTool)},[]);
 const openModel=()=>openTool("model");
 const toolLabels:Record<StudioTool,string>={poster:"Plakat",ball:"Piłka",kit:"Koszulki","surface-model":"Wybierz nawierzchnię sportową",model:"Wybierz boisko",construction:"Konstrukcja",surface:"Nawierzchnia",graphics:"Grafika i linie",equipment:"Wyposażenie",place:"Miejsce",files:"Pliki projektu"};
 const selectObject=(id:string)=>{setActiveTool(p.objects.find(o=>o.id===id)?.kind==="equipment"?"equipment":"graphics");setEditPlan(false);setZoom(100);props.selectObject(id)};
 const addMotif=(motif:GraphicMotif)=>{if(p.objects.length>=200)return;const object:EditorObject={id:crypto.randomUUID(),kind:"image",name:motif.name,x:300,y:300*p.width/p.length,scale:75,rotation:0,opacity:100,color:motif.color,src:motifDataUrl(motif),target:motifTarget};update({objects:[...p.objects,object]});setMotifsOpen(false);setActiveTool("graphics");props.selectObject(object.id);setEditPlan(true)};
 const thumb=(q:Project)=>props.renderCourt({...q,objects:[]});
 const constructionPreview=(activeTool==="construction"||activeTool==="model")&&!p.arenaModel;
 const constructionModel=p.arenaModel||"street15";
 const constructionThumbnail=<span className="studio-pattern-thumb">{constructionModel==="w1"?<StudioModelThumbnail model="w1"/>:<img src={`/arenas/thumbnails/${constructionModel}.webp`} alt="" width={240} height={156}/>}</span>;
 const previewConstruction=useMemo<Project>(()=>({...p,surfaceModel:"street-football-3x3",arenaModel:"street15",modular:undefined,courtShape:"rectangle",diameter:undefined,sport:"Piłka nożna 3×3",length:15,width:10,objects:p.surfaceModel==="street-football-3x3"?p.objects:[]}),[p]);
 const modelCode=p.arenaModel?productCodes[p.arenaModel]:undefined;
 const design=p.arenaDesign||{panelColor:"#b90f35",frameColor:"#30363c",goalColor:"#30363c",finish:"matte",text:"",side:"both",src:undefined};
 const summaryColor=(hex:string)=><span className="studio-summary-color"><i style={{background:hex}} aria-hidden="true"/>{hex.toUpperCase()}</span>;
 const productMode=["kit","poster","ball"].includes(activeTool);
 const printTotal=(d:StudioPrintDesign)=>{const q=d.qty||1,u=d.product==='poster'?variantPrice(shop.poster,printFormats[d.fmt]||printFormats[0],99):(shop.ball?.price??999);return `${zl(q*u)} brutto (${q} × ${zl(u)}) · ${shippingNote(shop,q*u)}`};
 const productPrice=(activeTool==='poster'||activeTool==='ball')&&p.printDesign?(()=>{const d=p.printDesign!,q=d.qty||1,u=d.product==='poster'?variantPrice(shop.poster,printFormats[d.fmt]||printFormats[0],99):(shop.ball?.price??999);return zl(q*u)+' brutto'})():activeTool==='kit'&&p.kit?(p.kit.fit==='kids'?'Cena na zapytanie':zl(p.kit.players.length*variantPrice(shop.shirt,'M',599))+' brutto'):undefined;
 const summarySection=(title:string,tool:StudioTool,rows:[string,ReactNode][])=><section className="studio-summary-section"><header><h3>{title}</h3><button aria-label={`Edytuj: ${title}`} onClick={()=>{setSummaryOpen(false);openTool(tool)}}>Edytuj <ArrowRight size={14}/></button></header><dl>{rows.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>;
 return <OptionPrices project={p} quote={props.quote}><main className="studio-shell studio-canvas-editor" data-tool={activeTool} data-print-mode={p.printDesign?"true":undefined} data-product-mode={productMode?"true":undefined} data-expanded={activeTool==="surface"&&(materialOpen||advancedOpen)}>
  <div className="studio-workspace-content" ref={workspaceRef} onChangeCapture={()=>{stepInteraction.current=true}} onClickCapture={()=>{stepInteraction.current=true}}>
  <header className="studio-topbar">
   {props.onProducts&&<button className="studio-product-switch" aria-label="Produkty" onClick={props.onProducts}><ArrowLeft size={16}/><span>Produkty</span></button>}
   <a href="https://www.gamefields.eu/" target="_top" className="studio-logo" aria-label="Gamefields — strona główna">gamefields <span>studio</span></a>
   {props.recovery.blocked?<button className="studio-save studio-recovery-status" aria-label="Otwórz odzyskiwanie projektu" onClick={()=>openTool("files")}>{props.saveStatus}</button>:<span className="studio-save" role="status">{props.saveStatus.startsWith("Zapisano")?<Check size={16}/>:null}{props.saveStatus}</span>}<div className="studio-top-actions"><button aria-label="Pliki projektu" onClick={()=>openTool("files")}><FolderOpen size={18}/></button><button className="studio-save-project" aria-label="Pobierz projekt" title="Pobierz kopię projektu JSON" onClick={props.download}><Download size={18}/><span>Pobierz projekt</span></button>{!p.printDesign&&!productMode&&<ProjectLink project={p}/>}<QuoteBadge quote={props.quote} onClick={showSummary} label={productPrice}/></div>
  </header>
  {!p.printDesign&&!productMode&&<WorkshopSave project={p}/>}
  <div className="studio-screen">
   <nav className="studio-tool-rail" aria-label="Narzędzia edycji">{([[
    "construction","Konstrukcja",Box],["surface","Nawierzchnia",Droplets],["graphics","Grafika",Palette]
   ] as const).map(([tool,label,Icon])=><button key={tool} aria-pressed={activeTool===tool||(tool==="surface"&&activeTool==="surface-model")||(tool==="construction"&&activeTool==="model")} aria-controls="studio-edit-panel" onClick={()=>openTool(tool)}><Icon size={25}/><span>{label}</span></button>)}</nav>
   <section className="studio-visual" aria-label="Podgląd projektu">
    <div className="studio-toolbar">
     <div className="studio-history"><button aria-label="Cofnij" onClick={props.undo} disabled={!props.canUndo}><Undo2 size={18}/><span>Cofnij</span></button><button aria-label="Ponów" onClick={props.redo} disabled={!props.canRedo}><Redo2 size={18}/><span>Ponów</span></button></div>
     <button className="studio-modular-standard" onClick={()=>{openTool("construction");setConstructionTab("modules");setModularExpanded(true);readyView("ground")}}><Grid2X2 size={16}/><span>Budowanie modułowe</span></button>

    </div>
    <div className={"studio-stage "+(editPlan?"is-plan":"is-preview")}><StudioWorldBackground world={activeTool==='construction'||activeTool==='model'?'construct':'creative'}/><input aria-label="Nazwa projektu" maxLength={200} value={p.name} onChange={e=>update({name:e.target.value},false)} className="studio-project-name studio-scene-name"/>
     <div className="studio-render" style={{transform:`scale(${zoom/100})`}}>{(activeTool==='poster'||activeTool==='ball')&&p.printDesign?<StudioPrintPreview design={p.printDesign} brush={printBrush} onChange={patch=>update({printDesign:{...p.printDesign!,...patch}})}/>:activeTool==="kit"&&p.kit?<StudioKitPreview kit={p.kit} player={p.kit.players[kitPlayer]??p.kit.players[0]}/>:editPlan?props.renderCourt(p,true):constructionPreview?<PannaStudioPreview project={previewConstruction} interactive studio/>:props.renderPreview()}</div>
     {constructionPreview&&!editPlan?<div className="studio-construction-preview-note" role="status">Podgląd: Street Arena 15 · 15 × 10 m. Konstrukcja nie jest jeszcze dodana do projektu.</div>:null}
     {editPlan?<div className="studio-plan-note"><Move size={15}/> Przeciągnij element, aby zmienić jego pozycję</div>:null}
     <div className="studio-stage-footer"><div className="studio-project-chip"><Goal size={18}/><span>{constructionPreview&&!editPlan?"Podgląd konstrukcji · Street Arena 15 · 15 × 10 m":`${profile.label} · ${projectDimensions(p).reference} · ${surfaceLabel(p.surface)}`}</span></div><div className="studio-zoom"><button aria-label="Oddal podgląd" disabled={zoom<=70} onClick={()=>setZoom(z=>Math.max(70,z-10))}><Minus size={17}/></button><button aria-label="Przywróć domyślne powiększenie" onClick={()=>setZoom(editPlan||props.previewMode!=="aerial"?100:170)}>{zoom}%</button><button aria-label="Przybliż podgląd" disabled={zoom>=200} onClick={()=>setZoom(z=>Math.min(200,z+10))}><Plus size={17}/></button></div></div>
    </div>

   </section>
   <aside id="studio-edit-panel" className={"studio-panel"+((materialOpen||advancedOpen)?" is-expanded":"")} aria-label="Ustawienia projektu" ref={panelRef} tabIndex={-1}>
    {!["kit","poster","ball"].includes(activeTool)?<ProjectSteps current={currentStep} done={completedSteps} onSelect={step=>{if(step==="summary")showSummary();else openTool(step)}}/>:null}
    {productMode?null:<nav className="studio-panel-tool-tabs" aria-label="Wybierz obszar edycji">{([["construction","Konstrukcja",Box],["surface","Nawierzchnia",Droplets],["graphics","Grafika",Palette]] as const).map(([tool,label,Icon])=><button type="button" key={tool} aria-pressed={activeTool===tool} onClick={()=>openTool(tool)}><Icon size={17}/><span>{label}</span></button>)}</nav>}
    {(['construction','surface','graphics'] as const).includes(activeTool as 'construction'|'surface'|'graphics')?<div className="studio-panel-context" role="status"><span>{activeTool==='construction'?'01 / KONSTRUKCJA':activeTool==='surface'?'02 / NAWIERZCHNIA':'03 / GRAFIKA'}</span><p>{activeTool==='construction'?'Wybierz konstrukcję i dopasuj jej kolory.':activeTool==='surface'?'Wybierz materiał, sport i wygląd powierzchni.':'Dodawaj własne grafiki i edytuj niezależne warstwy.'}</p></div>:null}
    {((activeTool==='construction'&&p.arenaModel)||activeTool==='surface')&&!editPlan&&<ScenePaintPanel key={`${activeTool}:${p.arenaModel}`} mode={activeTool==='construction'?'construction':'surface'} project={p} update={update} applyPalette={props.applyPalette}/>}
    {activeTool==='files'||activeTool==='model'||activeTool==='surface-model'?<div className="studio-dock-heading"><h1>{toolLabels[activeTool]}</h1><button aria-label="Wróć do nawierzchni" onClick={()=>openTool('surface')}><X size={19}/></button></div>:null}
    {activeTool==="surface"?<><nav className="studio-visual-tabs" aria-label="Ustawienia nawierzchni">{([['design','Wzór',Grid2X2],['material','Materiał',Layers],['sport','Sport',Goal]] as const).map(([id,label,Icon])=><button key={id} aria-pressed={surfaceTab===id} onClick={()=>setSurfaceTab(id)}><Icon size={17}/><span>{label}</span></button>)}</nav>
     {surfaceTab==='design'?<><button type="button" className="studio-template-launch" onClick={showPatterns}><Grid2X2 size={17}/><span><b>Gotowe wzory nawierzchni</b><small>Kompozycje obejmujące całe boisko</small></span><ArrowRight size={17}/></button><StudioDesignChoices project={p} update={update} onColors={()=>setSurfaceTab('design')}/></>:null}
     {surfaceTab==='material'?<StudioMaterialChoices project={p} update={update}/>:null}
     {surfaceTab==='sport'?<><PrimarySportChoices project={p} onChange={id=>{if(id==='panna'){const profile=getSportProfile(undefined,'o1');props.selectSport(profile);update({name:nextProjectName(p.name,sportSurface(p.surfaceModel)?.name||getSportProfile(p.sport,p.arenaModel).label,profile.label)},false)}else {const sport=primarySports.find(s=>s.id===id)!;const patch=selectSurface(p,sport.surface as SurfaceModel);update(id==='street-football'?{...patch,arenaModel:'street15',arenaDesign:{...defaultArena}}:patch)}setEditPlan(false);setZoom(100)}}/>{p.sport==='Piłka nożna 1×1'&&!p.surfaceModel?<><p className="studio-visual-note">Panna · wybierz własną arenę. Wymiary pochodzą z jej modelu.</p><StudioConstructionChoices project={p} onChange={id=>props.selectSport(getSportProfile(undefined,id as Project['arenaModel']))}/></>:null}<p className="studio-visual-note">Wybierz rodzaj nawierzchni w dolnej karuzeli. Zmiana sportu może odłączyć konstrukcję; możesz ją cofnąć.</p>{selectedSurface?<details className="studio-technical"><summary>Wymiary i pliki modelu</summary><p className="studio-hint">Pole gry: {selectedSurface.fieldLength} × {selectedSurface.fieldWidth} m · podłoże: {selectedSurface.length} × {selectedSurface.width} m · 20 cm. {selectedSurface.dimensionNote}</p><div className="studio-actions"><a href={`/sport-surfaces/${selectedSurface.id}.glb`} download>Pobierz model GLB</a><a href={selectedSurface.id==="teqball"?"/sport-surfaces/teqball-20cm.blend":"/sport-surfaces/sport-surfaces-20cm.blend"} download>Projekt Blender</a></div></details>:null}{!p.printDesign&&<StudioKnowledge project={p}/>}</>:null}
    </>:null}
    {activeTool==="surface-model"?<section aria-label="Nawierzchnie sportowe"><p className="studio-hint">Wybierz niezależną nawierzchnię 20 cm. Zmiana formatu odłączy konstrukcję; wzór, grafiki i własna nazwa pozostaną. Zmianę możesz cofnąć.</p><div className="studio-models">{sportSurfaces.map(s=><button key={s.id} aria-label={s.name} aria-pressed={p.surfaceModel===s.id} onClick={()=>{update(selectSurface(p,s.id as SurfaceModel));setEditPlan(false);setZoom(100);openTool("surface")}}><span className="studio-model-media"><img src={`/sport-surfaces/${s.id}.webp`} alt="" width={640} height={400} loading="lazy"/></span><span className="studio-model-card-copy"><b>{s.name}</b><OptionPrice candidate={{...p,...selectSurface(p,s.id as SurfaceModel)}} scope="surface"/><small>Pole gry: {s.fieldLength} × {s.fieldWidth} m</small><small>Podłoże: {s.length} × {s.width} m · grubość 20 cm</small></span>{p.surfaceModel===s.id?<Check size={18}/>:null}</button>)}</div></section>:null}
    {activeTool==="model"?<details className="studio-section studio-model-section" open><summary><Goal size={22}/><span>Boisko<small>{profile.label} · {projectDimensions(p).reference}</small></span><ChevronDown size={17}/></summary><div className="studio-section-body">
     <p className="studio-model-guidance">Wybór innego boiska przywróci jego domyślne kolory i ustawienia konstrukcji. Nazwa własnego projektu pozostanie. Zmianę możesz cofnąć.</p><div className="studio-models">{sportProfiles.filter(s=>s.arenaModel).map(s=><button key={s.id} aria-label={s.label} aria-pressed={s.id===profile.id} onClick={()=>{props.selectSport(s);setEditPlan(false);setZoom(100);openTool("construction")}}><span className="studio-model-media"><img src={s.arenaModel?`/arenas/thumbnails/${s.arenaModel}.webp`:"/arenas/thumbnails/surface-project.svg"} alt="" width={640} height={400} loading="lazy" decoding="async"/></span><span className="studio-model-card-copy"><b>{s.label}</b><OptionPrice candidate={constructionProject(p,s)} scope="construction"/>{!s.arenaModel?<small className="studio-model-kind">Projekt nawierzchni</small>:null}<small>{s.arenaModel==="octagon"?"Ośmiokąt":s.courtShape==="circle"?"Okrąg":"Prostokąt"} · {s.courtShape==="circle"?`Ø ${s.diameter} m`:`${s.length} × ${s.width} m`}</small></span>{s.id===profile.id?<Check size={18}/>:null}</button>)}</div>
     {!p.arenaModel&&!p.surfaceModel?<div className="studio-dimensions"><label>Długość (m)<input type="number" min={6} max={60} step={.1} value={p.length} onChange={e=>{const n=Number(e.target.value);if(n>=6&&n<=60)update({length:n})}}/></label><label>Szerokość (m)<input type="number" min={6} max={40} step={.1} value={p.width} onChange={e=>{const n=Number(e.target.value);if(n>=6&&n<=40)update({width:n})}}/></label></div>:null}
     <p className="studio-hint">{p.arenaModel?"Obrys nawierzchni i konstrukcji sprawdzisz w narzędziu Konstrukcja.":"Wymiary zapisujemy w projekcie. Sceneria pokazuje proporcje bazowego boiska 15 × 10 m; zmieniony obrys zobaczysz w planie edycji."}</p>
    </div></details>:null}
    {activeTool==="surface"?<details className="studio-section studio-advanced-section" open={advancedOpen} onToggle={e=>setAdvancedOpen(e.currentTarget.open)}><summary><SlidersHorizontal size={22}/><span>Skala i wykończenie</span><ChevronDown size={17}/></summary><div className="studio-section-body">
     {([["patternDensity","Skala wzoru",60,140,100],["graphicOpacity","Intensywność wzoru",20,100,100],["shadowIntensity","Cień i głębia",0,100,25],["graphicRotation","Obrót grafiki",-180,180,0]] as const).map(([key,label,min,max,fallback])=><label className="studio-range" key={key}><span>{label}<b>{p[key]??fallback}{key==="graphicRotation"?"°":"%"}</b></span><input aria-label={label} type="range" min={min} max={max} step={5} value={p[key]??fallback} onChange={e=>update({[key]:Number(e.target.value),...(key==="shadowIntensity"?{shadowEnabled:Number(e.target.value)>0}:{} )})}/></label>)}
    </div></details>:null}
    {(activeTool==='poster'||activeTool==='ball')&&p.printDesign?<StudioPrintPanel design={p.printDesign} brush={printBrush} onBrush={setPrintBrush} onChange={patch=>update({printDesign:{...p.printDesign!,...patch}})}/>:null}
    {activeTool==="kit"&&p.kit?<StudioKitPanel kit={p.kit} onChange={kit=>update({kit})} selected={Math.min(kitPlayer,p.kit.players.length-1)} onSelect={setKitPlayer} courtPreset={kitPresetForProject(p)}/>:null}
    {activeTool==="graphics"?<section className="studio-graphics-content"><nav className="studio-visual-tabs" aria-label="Ustawienia grafiki">{([['motifs','Motywy'],['lines','Linie'],['logo','Logo'],['text','Tekst']] as const).map(([id,label])=><button key={id} aria-pressed={graphicsTab===id} onClick={()=>setGraphicsTab(id)}>{label}</button>)}</nav>
     {graphicsTab==='motifs'?<><button type="button" className="studio-template-launch" onClick={showMotifs}><Grid2X2 size={17}/><span><b>Wybierz element graficzny</b><small>24 motywy w 6 kategoriach</small></span><ArrowRight size={17}/></button><p className="studio-visual-note">Po dodaniu motywu możesz przeciągać go na boisku, zmieniać rozmiar i kolor.</p></>:graphicsTab==='lines'?<><StudioCreativeLines project={p} update={update}/><div className="studio-visual-line-options"><label className="studio-lines-toggle"><span>Oznaczenia sportowe</span><span><input aria-label="Pokaż linie" type="checkbox" checked={p.lines} onChange={e=>update({lines:e.target.checked})}/>{p.lines?'Włączone':'Wyłączone'}</span></label><p className="studio-hint">Kolor linii ustawisz w zakładce Nawierzchnia.</p></div></>:<><div className="studio-brand-actions">{graphicsTab==='logo'?<button onClick={()=>uploadRef.current?.click()}><Upload size={20}/> Dodaj własne logo</button>:<button onClick={()=>{props.addText();setEditPlan(false)}}><Type size={20}/> Dodaj tekst</button>}</div><p className="studio-visual-note">{graphicsTab==='logo'?'PNG lub statyczne SVG, do 2 MB. Po dodaniu ustaw pozycję na modelu.':'Dodaj napis, wybierz jego treść i ustaw pozycję na modelu.'}</p></>}
     <input ref={uploadRef} hidden multiple type="file" accept=".png,.svg,image/png,image/svg+xml" onChange={e=>{props.upload(e.target.files);setEditPlan(false);e.target.value=''}}/>
     {p.objects.some(o=>o.kind!=='equipment')?<div className="studio-graphic-layers"><h3>Twoje warstwy <small>{p.objects.filter(o=>o.kind!=='equipment').length}</small></h3><div className="studio-object-list" aria-label="Warstwy grafiki">{p.objects.filter(o=>o.kind!=='equipment').map(o=><div key={o.id}><button aria-pressed={props.selected?.id===o.id} onClick={()=>selectObject(o.id)}>{o.kind==='image'&&o.src?<img src={o.src} alt="" width={48} height={36}/>:<Type size={22}/>}<span>{o.kind==='text'?o.text||o.name:o.name}</span></button><button aria-label={`Usuń ${o.name}`} onClick={()=>props.removeObject(o.id)}><Trash2 size={16}/></button></div>)}</div></div>:null}
    </section>:null}
    {activeTool==="construction"?<div className="studio-construction-content"><nav className="studio-visual-tabs" aria-label="Ustawienia konstrukcji">{([['models','Modele'],['modules','Rozbudowa']] as const).map(([id,label])=><button key={id} aria-pressed={constructionTab===id} onClick={()=>setConstructionTab(id)}>{label}</button>)}</nav>
     {constructionTab==='models'?<><p className="studio-visual-note">Zmieniaj konstrukcję strzałkami pod modelem 3D. Tutaj edytuj jej elementy i kolory.</p>{selectedSurface&&p.arenaModel?<button className="studio-dock-link" onClick={()=>update({arenaModel:undefined,arenaDesign:undefined})}>Odłącz konstrukcję</button>:null}</>:null}
     {constructionTab==='models'?<><StudioConstructionChoices project={p} onChange={id=>{props.selectSport(getSportProfile(undefined,id as Project['arenaModel']));setEditPlan(false)}}/><p className="studio-visual-note"><a href="https://www.gamefields.eu/#planer">Sprawdź, czy zmieści się na Twoim placu</a></p></>:null}
     {constructionTab==='modules'?<StudioModularControls project={p} onChange={update} onSelectModel={id=>{props.selectSport(getSportProfile(undefined,id));setEditPlan(false)}}/>:null}
     <details className="studio-technical"><summary>Wymiary i szczegóły</summary><ProjectDimensions project={p}/></details>
    </div>:null}
    {props.selected&&props.selected.kind!=="equipment"?<section className="studio-object-editor"><div><h2>{props.selected.name}</h2><button aria-label="Zamknij edycję elementu" onClick={()=>props.selectObject(null)}><Minus size={17}/></button></div>{props.selected.kind==="text"||props.selected.kind==="sponsor"?<label>Treść<input maxLength={500} value={props.selected.text||""} onChange={e=>props.updateObject(props.selected!.id,{text:e.target.value})}/></label>:null}<div className="studio-actions"><button onClick={()=>props.updateObject(props.selected!.id,{x:300,y:300*p.width/p.length})}>Wyśrodkuj</button><button disabled={p.objects.length>=200} onClick={()=>{const copy={...props.selected!,id:crypto.randomUUID(),name:props.selected!.name+' — kopia'};update({objects:[...p.objects,copy]});props.selectObject(copy.id)}}>Duplikuj</button></div>{props.selected.target!=='court'?<p className="studio-visual-note">Archiwalna grafika bandy pozostaje w projekcie. <button onClick={()=>props.updateObject(props.selected!.id,{target:'court',x:300,y:300*p.width/p.length})}>Umieść na nawierzchni</button></p>:null}<label>Kolor<input type="color" value={props.selected.color} onChange={e=>props.updateObject(props.selected!.id,{color:e.target.value})}/></label>{([['x','Pozycja pozioma',0,600],['y','Pozycja pionowa',0,600*p.width/p.length],['scale','Rozmiar',20,220],["rotation","Obrót",-180,180],["opacity","Widoczność",0,100]] as const).map(([key,label,min,max])=><label className="studio-range" key={key}><span>{label}<b>{key==='x'?Math.round(props.selected!.x/6):key==='y'?Math.round(props.selected!.y/(600*p.width/p.length)*100):props.selected![key]}{key==="rotation"?"°":"%"}</b></span><input aria-label={label} type="range" min={min} max={max} value={props.selected![key]} onChange={e=>{const value=Number(e.target.value);props.updateObject(props.selected!.id,(key==='x'||key==='y')&&isRoundCourt(p)?clampToCircle(key==='x'?value:props.selected!.x,key==='y'?value:props.selected!.y,280):{[key]:value})}}/></label>)}<button className="studio-delete" onClick={()=>props.removeObject(props.selected!.id)}><Trash2 size={15}/> Usuń element</button></section>:null}
    {activeTool==="files"&&p.objects.some(o=>o.kind==="equipment")?<p className="studio-hint">Starsze elementy wyposażenia są zachowane w kopii JSON, ale obecnie nie są prezentowane ani wyceniane.</p>:null}{activeTool==="files"?<p className="studio-file-help">Szkic zapisuje się automatycznie tylko w tej przeglądarce. Pobierz plik JSON, aby mieć kopię lub kontynuować na innym urządzeniu. Wczytanie pliku zastąpi bieżący widok projektu.</p>:null}<div className="studio-panel-actions" hidden={activeTool!=="files"}><button onClick={props.download}><Download size={18}/> Pobierz projekt</button><button onClick={()=>importRef.current?.click()}><FolderOpen size={17}/> Wczytaj projekt JSON</button><input hidden ref={importRef} aria-label="Wczytaj projekt Studio JSON" type="file" accept=".json,.txt,application/json,text/plain" onChange={e=>{props.importProject(e.target.files?.[0]);e.target.value=""}}/></div>
    {activeTool==="files"?<section className="studio-recovery"><h2>Odzyskiwanie szkicu</h2>{props.recovery.message?<p role="alert">{props.recovery.message}</p>:null}<p>Poprzednia poprawna kopia pozostaje w tej przeglądarce. Przywrócenie zastąpi bieżący widok; możesz je cofnąć.</p><button disabled={!props.recovery.previousAvailable} onClick={()=>void fileAction(async()=>props.restoreProject(await props.recovery.recoverPrevious()))}>Przywróć poprzedni szkic</button>{props.recovery.blocked?<><button onClick={()=>void fileAction(props.recovery.downloadOriginal)}>Pobierz zachowane dane szkicu</button><button onClick={()=>void fileAction(props.recovery.authorizeReplacement)}>Kontynuuj z bieżącym projektem</button><p>Kontynuacja zachowa dotychczasowe dane przed wznowieniem zapisu. Jeśli pamięć jest niedostępna, pobierz JSON.</p></>:null}{fileError?<p role="alert">{fileError}</p>:null}</section>:null}
    {activeTool==="files"?<><ProjectReset onReset={async()=>{await props.resetProject();setCompletedSteps([]);stepInteraction.current=false;setEditPlan(false);openTool("surface")}}/><ProjectLibrary project={p} onOpen={async next=>{await props.recovery.preserveCurrent();props.restoreProject(next);openTool("surface")}} variants={<ProjectVariants project={p} onRestore={async next=>{await props.recovery.preserveCurrent();props.restoreProject(next)}} renderCourt={(project,editing)=>props.renderCourt({...project,objects:project.objects.filter(o=>o.kind!=="equipment")},editing)} downloadProject={props.downloadProject}/>}/><OwnedConfigurationInspector project={p}/></>:null}

    {props.selected?.kind==='image'&&graphicMotifs.some(m=>m.name===props.selected?.name)?<section className="studio-motif-recolor"><label>Kolor motywu <input aria-label="Kolor wybranego motywu" type="color" value={props.selected.color} onChange={e=>{const motif=graphicMotifs.find(m=>m.name===props.selected?.name);if(motif&&props.selected)props.updateObject(props.selected.id,{color:e.target.value,src:motifDataUrl(motif,e.target.value)})}}/></label><p>Kolor dotyczy tylko zaznaczonego motywu.</p></section>:null}
    {activeTool==='construction'||activeTool==='surface'||activeTool==='graphics'?<div className="studio-next-step"><span>{activeTool==='construction'?'NASTĘPNY KROK':activeTool==='surface'?'NASTĘPNY KROK':'ZAPISZ SWÓJ PROJEKT'}</span><button onClick={()=>{if(activeTool==='construction')openTool('surface');else if(activeTool==='surface')openTool('graphics');else openTool('files')}}>{activeTool==='construction'?'Dopasuj nawierzchnię':activeTool==='surface'?'Dodaj grafikę':'Otwórz pliki projektu'}<ArrowRight size={16}/></button></div>:null}
   </aside>
   {['kit','poster','ball'].includes(activeTool)?null:dockMode==='models'?<nav className="studio-showroom-nav" aria-label="Wybór konstrukcji strzałkami"><button type="button" className="studio-showroom-arrow" aria-label="Poprzednia konstrukcja" onClick={()=>changeArena(-1)}><ChevronLeft size={26}/></button><div className="studio-showroom-current"><span>WYBIERZ KONSTRUKCJĘ</span><b>{profile.label}</b><small>{arenaIndex<0?'Projekt nawierzchni':`${arenaIndex+1} / ${arenaProfiles.length}`}</small></div><button type="button" className="studio-showroom-arrow" aria-label="Następna konstrukcja" onClick={()=>changeArena(1)}><ChevronRight size={26}/></button><button type="button" className="studio-showroom-surface" onClick={()=>setDockMode('surfaces')}>Nawierzchnie <ChevronDown size={14}/></button></nav>:<section className="studio-bottom-dock" aria-label="Wybierz nawierzchnię"><div className="studio-bottom-dock-head"><span>WYBIERZ NAWIERZCHNIĘ</span><div role="group" aria-label="Rodzaj modeli"><button onClick={()=>setDockMode('models')}>Konstrukcje 3D</button><button aria-pressed="true">Nawierzchnie</button></div></div><div className="studio-bottom-items">{sportSurfaces.map(item=><button key={item.id} className="studio-bottom-item" type="button" aria-pressed={item.id===p.surfaceModel} onClick={()=>{update(selectSurface(p,item.id as SurfaceModel));setEditPlan(false);setZoom(100);openTool('surface')}}><img src={`/sport-surfaces/${item.id}.webp`} alt="" loading="lazy"/><span>{item.name}</span><OptionPrice candidate={{...p,...selectSurface(p,item.id as SurfaceModel)}} scope="surface"/>{item.id===p.surfaceModel?<Check size={15}/>:null}</button>)}</div></section>}
  </div>

  </div>
  {motifsOpen?<div className="studio-modal-backdrop" onClick={()=>setMotifsOpen(false)}><section className="studio-modal studio-motif-library" role="dialog" aria-modal="true" aria-label="Biblioteka pojedynczych elementów graficznych" onClick={e=>e.stopPropagation()}><div className="studio-modal-head"><div><span>GAMEFIELDS · GRAPHIC ELEMENTS 01</span><h2>Dodaj grafikę do projektu</h2><p>Wybierz motyw i powierzchnię. Każdy dodany element można przesuwać, obracać, skalować i powielać niezależnie.</p></div><button autoFocus onClick={()=>setMotifsOpen(false)}>Zamknij</button></div><label className="studio-motif-target">Umieść grafikę na <select value={motifTarget} onChange={e=>setMotifTarget(e.target.value as Target)}><option value="court">Nawierzchni</option><option value="band-top">Panelu górnym</option><option value="band-bottom">Panelu dolnym</option><option value="band-left">Panelu lewym</option><option value="band-right">Panelu prawym</option></select></label><nav className="studio-template-filters" aria-label="Kategorie elementów graficznych"><button type="button" aria-pressed={motifCategory==='all'} onClick={()=>setMotifCategory('all')}>Wszystkie</button>{motifCategories.map(cat=><button type="button" key={cat.id} aria-pressed={motifCategory===cat.id} onClick={()=>setMotifCategory(cat.id)}>{cat.name}</button>)}</nav><div className="studio-template-count">{graphicMotifs.filter(item=>motifCategory==='all'||item.category===motifCategory).length} elementy · kolejne kolekcje będą dodawane</div><div className="studio-motif-grid">{graphicMotifs.filter(item=>motifCategory==='all'||item.category===motifCategory).map(item=><button type="button" key={item.id} disabled={p.objects.length>=200} onClick={()=>addMotif(item)}><span><img src={motifDataUrl(item)} alt="" width={100} height={100}/></span><b>{item.name}</b><small>Dodaj do projektu <Plus size={13}/></small></button>)}</div><p className="studio-motif-note">Nowa grafika staje się osobną warstwą projektu. Gotowe kompozycje całej nawierzchni znajdziesz w zakładce Nawierzchnia.</p></section></div>:null}
  {patternsOpen?<div className="studio-modal-backdrop" onClick={()=>setPatternsOpen(false)}><section className="studio-modal studio-template-library" role="dialog" aria-modal="true" aria-label="Biblioteka wzorów nawierzchni" onClick={e=>e.stopPropagation()}><div className="studio-modal-head"><div><span>GAMEFIELDS SURFACE PATTERNS · KOLEKCJA 01</span><h2>Gotowe wzory nawierzchni</h2><p>Wybierz całościową kompozycję nawierzchni. Osobne elementy dekoracyjne dodasz w zakładce Grafika.</p></div><button autoFocus onClick={()=>setPatternsOpen(false)}>Zamknij</button></div><nav className="studio-template-filters" aria-label="Kategorie szablonów">{([['all','Wszystkie'],['urban','Miasto'],['sport','Sport'],['art','Artystyczne'],['brand','Marka / premium']] as const).map(([id,label])=><button type="button" key={id} aria-pressed={templateCategory===id} onClick={()=>setTemplateCategory(id)}>{label}</button>)}</nav><div className="studio-template-count">{signaturePresets.filter(item=>templateCategory==='all'||(templateCategories[templateCategory] as readonly string[]).includes(item.id)).length} szablonów · kolekcja będzie rozwijana</div><div className="studio-direction-grid">{signaturePresets.filter(item=>templateCategory==='all'||(templateCategories[templateCategory] as readonly string[]).includes(item.id)).map(item=>{const palette=getPatternPalette(item.paletteId);const q={...p,patternFamily:item.familyId,patternVariant:item.variant,patternPalette:item.paletteId,base:palette.colors[4],zone:palette.colors[1]};const active=isSignaturePresetActive(p,item,palette);return <button key={item.id} aria-pressed={active} onClick={()=>props.applyDirection(item.familyId,item.variant,item.paletteId)}><span><LazyMedia>{thumb(q)}</LazyMedia></span><b>{item.name}{active?<Check size={17}/>:null}</b><small>{item.useCase}</small></button>})}</div><div className="studio-template-footer"><span>Wybór szablonu można cofnąć. Linie sportowe i ustawienia konstrukcji pozostają dostępne.</span><button className="studio-primary" onClick={()=>{setPatternsOpen(false);props.openPatterns()}}>Pełna biblioteka wzorów <ArrowRight size={18}/></button></div></section></div>:null}
  {summaryOpen?<div className="studio-modal-backdrop" onClick={()=>setSummaryOpen(false)}><section className="studio-modal studio-summary" role="dialog" aria-modal="true" aria-label="Podsumowanie projektu" onClick={e=>e.stopPropagation()}><div className="studio-modal-head"><div><span>TWÓJ PROJEKT</span><h2>Sprawdź swój projekt</h2></div><button autoFocus onClick={()=>setSummaryOpen(false)}>Wróć do edycji</button></div><p className="studio-summary-name">{p.name}</p><ProjectQuote quote={props.quote}/>
   {!p.printDesign&&<>
   {summarySection("Boisko","model",[["Model",profile.label],["Kod produktu",modelCode||"Projekt indywidualny"]])}<ProjectDimensions project={p}/>
   {summarySection("Nawierzchnia i grafika","surface",[["Materiał",surfaceLabel(p.surface)],["Wzór",`${family.name} · wariant ${p.patternVariant||1}`],["Paleta",getPatternPalette(p.patternPalette).name],["Pole gry",summaryColor(p.base)],["Strefy",summaryColor(p.zone)],["Otoczenie",summaryColor(p.outside)],["Linie",p.lines?summaryColor(p.lineColor):"Wyłączone"]])}
   {p.arenaModel?summarySection("Konstrukcja","construction",[["Kolor paneli",summaryColor(design.panelColor)],["Kolor ramy",summaryColor(design.frameColor)],["Kolor bramek",summaryColor(design.goalColor)],["Wykończenie",({matte:"Matowe",gloss:"Połysk",metal:"Metal lakierowany"})[design.finish]],["Napis na panelach",design.text||"Brak"],["Logo na panelach",design.src?"Dodane":"Brak"],...(design.text||design.src?[["Strona oznaczeń",({both:"Obie strony",inner:"Od wewnątrz",outer:"Na zewnątrz"})[design.side]] as [string,ReactNode]]:[]) ]):null}
   </>}
   {p.printDesign&&summarySection(p.printDesign.product==='poster'?'Plakat':'Piłka',p.printDesign.product,[["Kierunek",p.printDesign.fam],["Kompozycja",String(p.printDesign.v)],["Tytuł / napis",p.printDesign.product==='poster'?p.printDesign.title:p.printDesign.label],...(p.printDesign.product==='poster'?[["Format",(printFormats[p.printDesign.fmt]||printFormats[0])+" · sam print, bez ramy"] as [string,ReactNode]]:[["Rozmiar piłki",p.printDesign.size] as [string,ReactNode]]),["Ilość",String(p.printDesign.qty||1)+" szt."],["Cena",printTotal(p.printDesign)]])}{p.printDesign&&(()=>{const o=printOrder(p.printDesign,shop);return o?<StudioShopOrder shop={shop} {...o}/>:null})()}
   {!p.printDesign&&summarySection("Grafiki i napisy","graphics",[["Elementy projektu",p.objects.filter(o=>o.kind!=="equipment").map(o=>o.name).join(", ")||"Brak dodatkowych grafik"]])}
   {p.kit&&!p.printDesign?summarySection("Koszulki","kit",[["Wzór",kitPreset(p.kit.preset).name],["Liczba koszulek",String(p.kit.players.length)],["Rozmiary",kitSizeCounts(p.kit).map(([size,count])=>`${size} × ${count}`).join(", ")],["Napis z przodu",p.kit.sponsor||"Brak"],["Herb",p.kit.logo?"Dodany — plik przekazywany osobno":"Brak"],["Materiał","Poliester, nadruk sublimacyjny"],["Cena",p.kit.fit==="kids"?"Rozmiary dziecięce: na zapytanie":`${zl(p.kit.players.length*variantPrice(shop.shirt,"M",599))} brutto (${p.kit.players.length} × ${zl(variantPrice(shop.shirt,"M",599))}) · ${shippingNote(shop,p.kit.players.length*variantPrice(shop.shirt,"M",599))}`]]):null}
   {!p.printDesign&&<ProjectImage project={{...p,objects:p.objects.filter(o=>o.kind!=="equipment")}} renderCourt={props.renderCourt}/>}<InquiryPackage project={{...p,objects:p.objects.filter(o=>o.kind!=="equipment")}} quote={props.quote}/>{!p.printDesign&&<StudioKnowledge project={p}/>}{!p.printDesign&&<ProjectSpecification project={{...p,objects:p.objects.filter(o=>o.kind!=="equipment")}}/>}<p className="studio-hint">Parametry projektu dołączymy do zapytania. Pliki logo możesz przesłać w dalszej rozmowie.</p>{inquiryError?<p role="alert">{inquiryError}</p>:null}{inquiryState!=="idle"&&inquiryState!=="error"?<p role="status">{inquiryMessage}</p>:null}<button className="studio-primary" disabled={inquiryState==="waiting"} onClick={requestInquiry}>Wyślij projekt do wyceny <ArrowRight size={18}/></button><button className="studio-export" onClick={props.download}><Download size={16}/> Pobierz kopię projektu JSON</button></section></div>:null}
 </main></OptionPrices>;
}
