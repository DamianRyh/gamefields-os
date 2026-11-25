'use client';
/* "Kampania BO" tab of the project library (2026-11-25): turns the current design into a public campaign page
   "Boisko dla osiedla X" for a participatory budget. Public scope as in the Workshop (layout, pattern, colours;
   no private name, text or logos). E-mail only when the organiser asks Gamefields for help with the application. */
import {useEffect,useState} from 'react';
import type {Project} from '@/lib/project';
import {publicWorkshopProject} from '@/lib/workshop-project';
import {cleanCampaign,CAMPAIGN_LINK} from '@/lib/campaign';
import '@/app/campaign-create.css';
import {journey} from '@/lib/journey';
const KEYS='gf-campaign-keys';
type Saved={id:string;key:string;title:string;createdAt:number};
const read=():Saved[]=>{try{return JSON.parse(localStorage.getItem(KEYS)||'[]')}catch{return []}};
export function CampaignCreate({project}:{project:Project}){
 useEffect(()=>{journey('financing')},[]);
 const [f,setF]=useState(()=>({title:'Boisko dla osiedla ',place:'',city:'',budgetName:'',budgetUrl:'',voteUntil:'',organizer:(()=>{try{return localStorage.getItem('gf-workshop-nickname')||''}catch{return ''}})(),about:'',email:''}));
 const [help,setHelp]=useState(false),[pub,setPub]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[done,setDone]=useState<Saved|null>(null),[mine,setMine]=useState<Saved[]>(()=>typeof localStorage==='undefined'?[]:read());
 const set=(k:keyof typeof f)=>(e:{target:{value:string}})=>setF(v=>({...v,[k]:e.target.value}));
 let check='';try{cleanCampaign({...f,email:help?f.email:null})}catch(e){check=(e as Error).message}
 let projectOk=true;try{publicWorkshopProject(project)}catch{projectOk=false}
 async function create(){if(busy)return;setBusy(true);setError('');try{
   const r=await fetch('/api/campaign',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({project:publicWorkshopProject(project),campaign:{...f,email:help?f.email:null},publicConsent:pub,helpConsent:help})});
   const d=await r.json();if(!r.ok)throw Error(d.error||'Nie udało się utworzyć strony.');
   const saved={id:d.id,key:d.key,title:f.title.trim(),createdAt:Date.now()},list=[saved,...read().filter(x=>x.id!==d.id)].slice(0,20);try{localStorage.setItem(KEYS,JSON.stringify(list))}catch{/* optional */}setMine(list);setDone(saved);
  }catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 const copy=(t:string)=>navigator.clipboard?.writeText(t).catch(()=>{});
 return <section className="studio-p2-section gfcc" aria-label="Kampania do budżetu obywatelskiego">
  <h2>Kampania do budżetu obywatelskiego</h2>
  <p>Zgłaszasz boisko do budżetu obywatelskiego? Zrób z tego projektu stronę „Boisko dla osiedla…” z licznikiem poparcia, grafikami do social mediów i kartą techniczną dla urzędu. Bez logowania.</p>
  {!projectOk?<p className="gfcc-warn" role="alert">Wybierz w projekcie konstrukcję, wzór nawierzchni i paletę kolorów, potem wróć tutaj.</p>:null}
  {done?<div className="gfcc-done" role="status"><b>Strona kampanii jest gotowa.</b><p>Wyślij ten link sąsiadom i wrzuć go na grupę osiedla:</p><code>{CAMPAIGN_LINK(done.id)}</code>
   <div className="gfcc-acts"><button type="button" className="studio-primary" onClick={()=>copy(CAMPAIGN_LINK(done.id))}>Kopiuj link</button><a href={'/kampania?id='+done.id} target="_blank" rel="noopener">Otwórz stronę ↗</a><button type="button" onClick={()=>setDone(null)}>Utwórz kolejną</button></div></div>:
  <form className="gfcc-form" onSubmit={e=>{e.preventDefault();void create()}}>
   <label>Tytuł strony<input value={f.title} maxLength={70} onChange={set('title')} placeholder="Boisko dla osiedla Słoneczne"/></label>
   <div className="gfcc-2"><label>Miejsce<input value={f.place} maxLength={80} onChange={set('place')} placeholder="np. podwórko przy ul. Lipowej 12"/></label><label>Miasto lub gmina<input value={f.city} maxLength={50} onChange={set('city')} placeholder="np. Warszawa, Ursynów"/></label></div>
   <div className="gfcc-2"><label>Nazwa budżetu (opcjonalnie)<input value={f.budgetName} maxLength={80} onChange={set('budgetName')} placeholder="np. Budżet obywatelski 2027"/></label><label>Koniec głosowania (opcjonalnie)<input type="date" value={f.voteUntil} onChange={set('voteUntil')}/></label></div>
   <label>Link do projektu w budżecie (opcjonalnie)<input value={f.budgetUrl} maxLength={300} onChange={set('budgetUrl')} placeholder="https://…" inputMode="url"/></label>
   <label>Dlaczego to boisko? (opcjonalnie)<textarea value={f.about} maxLength={400} rows={3} onChange={set('about')} placeholder="Dla kogo jest i co zmieni na osiedlu. Bez nazwisk i danych kontaktowych."/></label>
   <label>Pseudonim organizatora (opcjonalnie)<input value={f.organizer} maxLength={24} onChange={set('organizer')} placeholder="np. Sąsiedzi z Lipowej"/></label>
   <label className="gfcc-c"><input type="checkbox" checked={help} onChange={e=>setHelp(e.target.checked)}/><span>Chcę bezpłatnej pomocy Gamefields w części technicznej wniosku (opis, wymiary, kosztorys). Napiszcie do mnie na e-mail.</span></label>
   {help?<label>E-mail do kontaktu (widzi go tylko Gamefields)<input type="email" value={f.email} maxLength={120} onChange={set('email')} placeholder="twoj@email.pl" autoComplete="email"/></label>:null}
   <label className="gfcc-c"><input type="checkbox" checked={pub} onChange={e=>setPub(e.target.checked)}/><span>Rozumiem, że strona będzie publiczna (pod linkiem, bez wyszukiwarek): tytuł, miejsce, opis, pseudonim i projekt boiska. Mogę ją wycofać w każdej chwili.</span></label>
   {check?<p className="gfcc-hint">{check}</p>:null}{error?<p className="gfcc-warn" role="alert">{error}</p>:null}
   <button type="submit" className="studio-primary" disabled={busy||!!check||!pub||!projectOk}>{busy?'Tworzę stronę…':'Utwórz stronę kampanii'}</button>
  </form>}
  {mine.length?<div className="gfcc-mine"><h3>Twoje strony kampanii</h3><ul>{mine.map(m=><li key={m.id}><span>{m.title}</span><a href={'/kampania?id='+m.id} target="_blank" rel="noopener">Otwórz ↗</a><button type="button" onClick={()=>copy(CAMPAIGN_LINK(m.id))}>Kopiuj link</button></li>)}</ul></div>:null}
 </section>
}
