"use client";
import {useMemo,useState} from "react";
import {ArrowRight,X} from "lucide-react";
import {RadarMap} from "@/components/radar-map";
import {RadarMedia} from "@/components/radar-media";
import {radarLocations,type RadarLocation,type RadarSport} from "@/lib/radar-locations";

const sportLabel=(sport:RadarSport)=>({Basketball:"Koszykówka",Football:"Piłka nożna",Multisport:"Wielofunkcyjne"})[sport];
const filters:["All"|RadarSport,string][]=[["All","Wszystkie"],["Basketball","Koszykówka"],["Football","Piłka nożna"],["Multisport","Wielofunkcyjne"]];

function ConceptCard({location}: {location:RadarLocation}){
 return <article className="radar-concept-card">
  <a className="radar-card-image" href={`/radar/${location.slug}`}><RadarMedia src={location.afterStreet} alt={`${location.name} — koncepcja Gamefields`} label="PODGLĄD KONCEPCJI" kind="concept" demo={location.mediaStatus==="demo"}/></a>
  <div className="radar-card-copy"><span>{location.city} / {location.district}</span><h3>{location.name}</h3><div className="radar-card-meta"><b>{sportLabel(location.sport)}</b><i>{location.type}</i></div><p>{location.shortDescription}</p><a href={`/radar/${location.slug}`}>ZOBACZ KONCEPCJĘ <ArrowRight size={17}/></a></div>
 </article>
}

export function RadarExperience(){
 const [filter,setFilter]=useState<"All"|RadarSport>("All");
 const visible=useMemo(()=>filter==="All"?radarLocations:radarLocations.filter(item=>item.sport===filter),[filter]);
 const [selectedId,setSelectedId]=useState(radarLocations[0].id);
 const [panelOpen,setPanelOpen]=useState(true);
 const selected=visible.find(item=>item.id===selectedId)??visible[0];
 function chooseFilter(next:"All"|RadarSport){setFilter(next);const first=next==="All"?radarLocations[0]:radarLocations.find(item=>item.sport===next);if(first)setSelectedId(first.id);setPanelOpen(true)}
 function selectLocation(id:string){setSelectedId(id);setPanelOpen(true)}
 return <>
  <div className="radar-filters" role="group" aria-label="Filtruj koncepcje według sportu">{filters.map(([id,label])=><button key={id} aria-pressed={filter===id} className={filter===id?"active":""} onClick={()=>chooseFilter(id)}>{label}</button>)}</div>
  <section className="radar-map-shell">
   <RadarMap locations={visible} selectedId={selected.id} onSelect={selectLocation}/>
   <aside className={`radar-map-card ${panelOpen?"open":""}`} aria-live="polite">
    <button className="radar-sheet-close" aria-label="Zamknij kartę lokalizacji" onClick={()=>setPanelOpen(false)}><X size={18}/></button>
    <RadarMedia src={selected.afterAerial} alt={`${selected.name} — widok koncepcji`} label="PODGLĄD" kind="concept" demo={selected.mediaStatus==="demo"}/>
    <div className="radar-map-card-copy"><span>{selected.city} / {selected.district}</span><h2>{selected.name}</h2><div><b>{sportLabel(selected.sport)}</b><i>{selected.status}</i></div><p>{selected.shortDescription}</p><small>PODGLĄD <em>/</em> MATERIAŁ DEMO</small><a className="radar-project-link" href={`/radar/${selected.slug}`}>ZOBACZ KONCEPCJĘ <ArrowRight size={18}/></a></div>
   </aside>
  </section>
  <section className="radar-concepts"><header><span>WYBRANE PRZEZ GAMEFIELDS</span><h2>Poznaj koncepcje</h2><p>Niezależne wizje rzeczywistych miejskich przestrzeni. Każda koncepcja jest zaproszeniem do rozmowy i wymaga dalszych uzgodnień.</p></header><div className="radar-concept-grid">{visible.map(location=><ConceptCard key={location.id} location={location}/>)}</div></section>
 </>
}
