"use client";
import {useStudioLanguage} from "@/components/studio-language";
import {useMemo,useState} from "react";
import {ArrowRight,X} from "lucide-react";
import {RadarMap} from "@/components/radar-map";
import {RadarMedia} from "@/components/radar-media";
import {radarLocations,type RadarLocation,type RadarSport} from "@/lib/radar-locations";

const sportLabel=(sport:RadarSport)=>({Basketball:"Koszykówka",Football:"Piłka nożna",Multisport:"Wielofunkcyjne"})[sport];
const filters:["All"|RadarSport,string][]=[["All","Wszystkie"],["Basketball","Koszykówka"],["Football","Piłka nożna"],["Multisport","Wielofunkcyjne"]];

function ConceptCard({location}: {location:RadarLocation}){
 const {display:tr,href}=useStudioLanguage();
 return <article className="radar-concept-card">
  <a className="radar-card-image" href={href(`/radar/${location.slug}`)}><RadarMedia src={location.afterStreet} alt={`${location.name} — ${tr("koncepcja Gamefields")}`} label={tr("PODGLĄD KONCEPCJI")} kind="concept" demo={location.mediaStatus==="demo"}/></a>
  <div className="radar-card-copy"><span>{tr(location.city)} / {location.district}</span><h3>{location.name}</h3><div className="radar-card-meta"><b>{tr(sportLabel(location.sport))}</b><i>{tr(location.type)}</i></div><p>{tr(location.shortDescription)}</p><a href={href(`/radar/${location.slug}`)}>{tr("ZOBACZ KONCEPCJĘ")} <ArrowRight size={17}/></a></div>
 </article>
}

export function RadarExperience(){
 const {display:tr,href}=useStudioLanguage();
 const [filter,setFilter]=useState<"All"|RadarSport>("All");
 const visible=useMemo(()=>filter==="All"?radarLocations:radarLocations.filter(item=>item.sport===filter),[filter]);
 const [selectedId,setSelectedId]=useState(radarLocations[0].id);
 const [panelOpen,setPanelOpen]=useState(true);
 const selected=visible.find(item=>item.id===selectedId)??visible[0];
 function chooseFilter(next:"All"|RadarSport){setFilter(next);const first=next==="All"?radarLocations[0]:radarLocations.find(item=>item.sport===next);if(first)setSelectedId(first.id);setPanelOpen(true)}
 function selectLocation(id:string){setSelectedId(id);setPanelOpen(true)}
 return <>
  <div className="radar-filters" role="group" aria-label={tr("Filtruj koncepcje według sportu")}>{filters.map(([id,label])=><button key={id} aria-pressed={filter===id} className={filter===id?"active":""} onClick={()=>chooseFilter(id)}>{tr(label)}</button>)}</div>
  <section className="radar-map-shell">
   <RadarMap locations={visible} selectedId={selected.id} onSelect={selectLocation}/>
   <aside className={`radar-map-card ${panelOpen?"open":""}`} aria-live="polite">
    <button className="radar-sheet-close" aria-label={tr("Zamknij kartę lokalizacji")} onClick={()=>setPanelOpen(false)}><X size={18}/></button>
    <RadarMedia src={selected.afterAerial} alt={`${selected.name} — ${tr("widok koncepcji")}`} label={tr("PODGLĄD")} kind="concept" demo={selected.mediaStatus==="demo"}/>
    <div className="radar-map-card-copy"><span>{tr(selected.city)} / {selected.district}</span><h2>{selected.name}</h2><div><b>{tr(sportLabel(selected.sport))}</b><i>{tr(selected.status)}</i></div><p>{tr(selected.shortDescription)}</p><small>{tr("PODGLĄD")} <em>/</em> {tr("MATERIAŁ DEMO")}</small><a className="radar-project-link" href={href(`/radar/${selected.slug}`)}>{tr("ZOBACZ KONCEPCJĘ")} <ArrowRight size={18}/></a></div>
   </aside>
  </section>
  <section className="radar-concepts"><header><span>{tr("WYBRANE PRZEZ GAMEFIELDS")}</span><h2>{tr("Poznaj koncepcje")}</h2><p>{tr("Niezależne wizje rzeczywistych miejskich przestrzeni. Każda koncepcja jest zaproszeniem do rozmowy i wymaga dalszych uzgodnień.")}</p></header><div className="radar-concept-grid">{visible.map(location=><ConceptCard key={location.id} location={location}/>)}</div></section>
 </>
}
