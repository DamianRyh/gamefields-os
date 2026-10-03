import fs from "node:fs";

const file = "app/page.tsx";
let source = fs.readFileSync(file, "utf8");

function replaceOnce(needle, replacement, label) {
  const first = source.indexOf(needle);
  if (first < 0) throw new Error(`Builder transform failed: missing ${label}`);
  if (source.indexOf(needle, first + needle.length) >= 0) throw new Error(`Builder transform failed: duplicate ${label}`);
  source = source.slice(0, first) + replacement + source.slice(first + needle.length);
}

replaceOnce(
  'type TemplateCard={id:number;title:string;description:string;image:string|null;link:string};',
  'type TemplateCard={id:number;title:string;description:string;image:string|null;link:string};\ntype SavedProjectRecord={id:string;projectKey:string;courtId:string|null;name:string;sport:string;source:string;visibility:string;status:string;publishedAt:string|null;createdAt:string;updatedAt:string;supportCount:number};',
  'saved project type anchor',
);

const oldState = ' const [p,setP]=useState<Project>(initial),[view,setView]=useState("sport"),[module,setModule]=useState(5),[iso,setIso]=useState(false),[selectedId,setSelectedId]=useState<string|null>(null),[undoStack,setUndo]=useState<Project[]>([]),[redoStack,setRedo]=useState<Project[]>([]),[projects,setProjects]=useState<Project[]>([]);';
const newState = ` const [p,setP]=useState<Project>(initial),[view,setView]=useState("sport"),[module,setModule]=useState(5),[iso,setIso]=useState(false),[selectedId,setSelectedId]=useState<string|null>(null),[undoStack,setUndo]=useState<Project[]>([]),[redoStack,setRedo]=useState<Project[]>([]),[projects,setProjects]=useState<SavedProjectRecord[]>([]),[projectsLoading,setProjectsLoading]=useState(false),[savingProject,setSavingProject]=useState(false);
 async function loadProjects(){
  setProjectsLoading(true);
  try{
   const response=await fetch("/api/projects",{cache:"no-store"});
   const data=await response.json() as {ok?:boolean;projects?:SavedProjectRecord[];error?:string};
   if(response.status===401){setProjects([]);toast.error("Zaloguj się w Gamefields PLAY, aby zobaczyć projekty konta.");return}
   if(!response.ok||!data.ok)throw new Error(data.error||"LOAD_FAILED");
   setProjects(data.projects||[]);
  }catch{toast.error("Nie udało się pobrać projektów konta.")}
  finally{setProjectsLoading(false)}
 }
 async function openSavedProject(recordId:string){
  try{
   const response=await fetch("/api/projects?id="+encodeURIComponent(recordId),{cache:"no-store"});
   const data=await response.json() as {ok?:boolean;projectRecord?:{project:unknown};error?:string};
   if(response.status===401){toast.error("Zaloguj się w Gamefields PLAY, aby otworzyć projekt.");return}
   if(!response.ok||!data.ok||!data.projectRecord)throw new Error(data.error||"LOAD_FAILED");
   const next=projectSchema.parse(data.projectRecord.project);
   finishDrag.current?.();history(p);setP(next);setSelectedId(null);setUndo([]);setRedo([]);setView("builder");
   window.history.replaceState({},"","/?projectId="+encodeURIComponent(recordId));
   toast.success("Projekt otwarty z konta");
  }catch{toast.error("Nie udało się otworzyć projektu.")}
 }
 async function saveProjectToAccount(){
  if(savingProject)return;
  setSavingProject(true);
  try{
   const params=new URLSearchParams(window.location.search);
   const courtId=params.get("court");
   const response=await fetch("/api/projects",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"save",project:p,courtId:courtId||null,source:courtId?"play-redesign":"studio"})});
   const data=await response.json() as {ok?:boolean;id?:string;error?:string};
   if(response.status===401){toast.error("Zaloguj się w Gamefields PLAY, aby zapisać projekt. Eksport JSON nadal działa.");return}
   if(!response.ok||!data.ok||!data.id)throw new Error(data.error||"SAVE_FAILED");
   window.history.replaceState({},"","/?projectId="+encodeURIComponent(data.id));
   toast.success("Projekt zapisany na koncie");
   await loadProjects();
  }catch(e){toast.error(e instanceof Error&&e.message==="PROJECT_TOO_LARGE"?"Projekt jest zbyt duży do zapisu online. Zmniejsz ciężkie grafiki lub użyj eksportu JSON.":"Nie udało się zapisać projektu.")}
  finally{setSavingProject(false)}
 }`;
replaceOnce(oldState, newState, 'Builder state');

replaceOnce(
  '   const params=new URLSearchParams(window.location.search);\n   const familyId=params.get("pattern"),paletteId=params.get("palette"),sport=params.get("sport"),shadowRaw=Number(params.get("shadow"));',
  '   const params=new URLSearchParams(window.location.search);\n   const projectId=params.get("projectId");\n   if(projectId){void openSavedProject(projectId);return}\n   const familyId=params.get("pattern"),paletteId=params.get("palette"),sport=params.get("sport"),shadowRaw=Number(params.get("shadow"));',
  'projectId loader',
);

replaceOnce(
  '<button className={view==="projects"?"active":""} onClick={()=>setView("projects")}>Projekty</button>',
  '<button className={view==="projects"?"active":""} onClick={()=>{setView("projects");void loadProjects()}}>Projekty</button>',
  'projects nav',
);

replaceOnce(
  '<button className="btn dark" onClick={()=>{setProjects(x=>[p,...x.filter(q=>q.id!==p.id)]);toast.success("Projekt zapisany w tej sesji")}}>Zapisz projekt</button>',
  '<button className="btn dark" disabled={savingProject} onClick={()=>void saveProjectToAccount()}>{savingProject?"Zapisywanie…":"Zapisz na koncie"}</button>',
  'top save button',
);

replaceOnce(
  '<button className="btn dark full" onClick={()=>{setProjects(x=>[p,...x.filter(q=>q.id!==p.id)]);toast.success("Projekt zapisany")}}>Zapisz projekt</button>',
  '<button className="btn dark full" disabled={savingProject} onClick={()=>void saveProjectToAccount()}>{savingProject?"Zapisywanie…":"Zapisz na koncie"}</button>',
  'summary save button',
);

const marker = ':<main className="os"><div className="oshead"><div><span className="eyebrow">GAMEFIELDS OS</span><h1>Twoje projekty</h1>';
const start = source.lastIndexOf(marker);
if (start < 0) throw new Error("Builder transform failed: projects view marker missing");
const endNeedle = '</main>}\n </>;';
const end = source.indexOf(endNeedle, start);
if (end < 0) throw new Error("Builder transform failed: projects view end missing");
const replacement = `:<main className="os"><div className="oshead"><div><span className="eyebrow">GAMEFIELDS OS / ACCOUNT</span><h1>Twoje projekty</h1><p className="sessionnote">Projekty są zapisane na Twoim koncie w Gamefields. Eksport JSON pozostaje kopią zapasową.</p></div><div className="actions"><a className="btn subtle" href="/projects">Zarządzaj projektami</a><button className="btn dark" onClick={()=>setView("builder")}><Plus size={17}/> Wróć do Studio</button></div></div>{projectsLoading?<div className="empty"><FolderOpen size={32}/><h2>Ładowanie projektów…</h2></div>:projects.length?<div className="projectgrid">{projects.map(x=><button className="projectcard" key={x.id} onClick={()=>void openSavedProject(x.id)}><section><span className="eyebrow">{x.visibility==="public"?"PUBLIC REDESIGN":"DRAFT"} · {x.projectKey}</span><h3>{x.name}</h3><p>{x.sport} · {x.supportCount} supporters</p><small>{new Date(x.updatedAt).toLocaleString("pl-PL")}</small></section></button>)}</div>:<div className="empty"><FolderOpen size={32}/><h2>Brak projektów na koncie</h2><p>Zapisz projekt w Studio albo zaimportuj istniejący JSON w Gamefields OS.</p><div className="actions"><button className="btn dark" onClick={()=>setView("builder")}>Przejdź do Studio</button><a className="btn subtle" href="/projects">Importuj JSON</a></div></div>}</main>}\n </>;`;
source = source.slice(0, start) + replacement + source.slice(end + endNeedle.length);

fs.writeFileSync(file, source);
console.log("Builder persistence transform applied successfully");
