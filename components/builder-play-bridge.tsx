"use client";
import {useEffect,useState} from "react";
import type {Project} from "@/lib/project";
import {playRequest} from "@/components/play-ui";
export type CourtContext={id:string;name:string;city:string;district:string|null;address:string|null;latitude:number;longitude:number;surface:string|null;lighting:boolean;isFree:boolean;sports:string;sport:string;builderSport:string};
export function BuilderPlayBridge({project,onContext}:{project:Project;onContext:(court:CourtContext)=>void}){
 const[context,setContext]=useState<CourtContext|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(""),[published,setPublished]=useState("");
 useEffect(()=>{const p=new URLSearchParams(location.search),id=p.get("court_id")||p.get("court");if(!id||p.get("source")!=="play")return;const sport=p.get("sport")==="basketball"||p.get("sport")==="Koszykówka 3×3"?"basketball":"football";let cancelled=false;playRequest(`/api/play/court?id=${encodeURIComponent(id)}&sport=${sport}`).then(d=>{if(cancelled)return;const c={...d.court,sport,builderSport:sport==="basketball"?"Koszykówka 3×3":"Piłka nożna 3×3"};setContext(c);onContext(c);}).catch(()=>setError("Nie udało się wczytać obiektu. Wróć do jego karty i spróbuj ponownie."));return()=>{cancelled=true;};},[onContext]);
 async function publish(){setBusy(true);setError("");try{const d=await playRequest("/api/projects",{action:"save",courtId:context!.id,source:"play-redesign",project});await playRequest("/api/projects",{action:"publish",id:d.id});setPublished(d.id);}catch{setError("Nie udało się opublikować projektu. Sprawdź nazwę, sport i wielkość grafik.");}finally{setBusy(false);}}
 if(!context&&!error)return null;
 return <aside className="builder-play-context" aria-label="PLAY → BUILDER"><div><strong>{context?.name||"Court → Builder"}</strong><p>{context?.district||context?.city} · {context?.address} {context?`· ${context.latitude.toFixed(5)}, ${context.longitude.toFixed(5)}`:""}</p>{error&&<p role="alert">{error}</p>}</div><div>{context&&<a href={`/play/court?id=${context.id}&sport=${context.sport}`}>← COURT</a>}{published?<a href={`/play/redesign?id=${encodeURIComponent(published)}`}>PROJEKT W COMMUNITY →</a>:<button disabled={busy||!context} onClick={publish}>{busy?"Publikuję…":"PUBLISH TO COMMUNITY"}</button>}</div></aside>;
}
