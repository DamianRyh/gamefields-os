'use client';
/* Owner panel for the Workshop and Projekt miesiąca (2026-11-25). Lists designs with pseudonym, social media consent,
   likes and "Stworzono podobnych"; marks finalists and the winner (shown on gamefields.eu), hides a design, and opens
   one in the Studio, where "Udostępnij projekt" makes the Stories, post and film with the author's pseudonym.
   Access: the WORKSHOP_ADMIN_KEY secret, kept in this tab only (sessionStorage). Not linked from anywhere public. */
import {useCallback,useEffect,useState} from 'react';
import {allContests} from '@/lib/workshop-contest';
import './workshop-admin.css';
type Item={id:string;title:string;createdAt:string;nickname:string|null;consent:boolean;contest:string|null;likes:number;remixes:number;featured:string|null;hidden:boolean};
const KEY='gf-workshop-admin';
export default function WorkshopAdmin(){
 const [key,setKey]=useState(()=>{try{return typeof sessionStorage==='undefined'?'':sessionStorage.getItem(KEY)||''}catch{return ''}});
 const [draft,setDraft]=useState(''),[items,setItems]=useState<Item[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [contest,setContest]=useState(()=>allContests()[0]?.id||''),[consentOnly,setConsentOnly]=useState(false),[showHidden,setShowHidden]=useState(true);
 const [tick,setTick]=useState(0);
 const load=useCallback(()=>{setBusy(true);setTick(n=>n+1)},[]);
 useEffect(()=>{if(!key)return;let active=true;
  fetch('/api/workshop/admin?'+new URLSearchParams({contest,consent:consentOnly?'1':''}),{headers:{'x-gf-admin':key}}).then(async r=>{const d=await r.json();if(!active)return;
   if(!r.ok){if(r.status===401){try{sessionStorage.removeItem(KEY)}catch{/* optional */}setKey('')}setError(d.error||'Błąd');return}setError('');setItems(d.items)})
   .catch(e=>{if(active)setError((e as Error).message)}).finally(()=>{if(active)setBusy(false)});
  return()=>{active=false}},[key,contest,consentOnly,tick]);
 async function act(id:string,body:Record<string,unknown>){setError('');try{const r=await fetch('/api/workshop/admin',{method:'POST',headers:{'x-gf-admin':key,'Content-Type':'application/json'},body:JSON.stringify({id,...body})});const d=await r.json();if(!r.ok)throw Error(d.error||'Błąd');load()}catch(e){setError((e as Error).message)}}
 if(!key)return <main className="gfwa"><form className="gfwa-login" onSubmit={e=>{e.preventDefault();try{sessionStorage.setItem(KEY,draft)}catch{/* optional */}setKey(draft)}}>
  <h1>Warsztat · panel</h1><p>Wpisz klucz panelu (sekret WORKSHOP_ADMIN_KEY).</p><label htmlFor="gfwa-key">Klucz</label><input id="gfwa-key" type="password" autoComplete="current-password" value={draft} onChange={e=>setDraft(e.target.value)}/><button type="submit" disabled={draft.length<8}>Wejdź</button>{error?<p role="alert">{error}</p>:null}</form></main>;
 const shown=items.filter(i=>showHidden||!i.hidden),consents=items.filter(i=>i.consent).length;
 return <main className="gfwa">
  <header className="gfwa-head"><div><h1>Warsztat · Projekt miesiąca</h1><p>{items.length} prac · {consents} ze zgodą na social media · posortowane: polubienia, potem „Stworzono podobnych”.</p></div>
   <button type="button" onClick={()=>{try{sessionStorage.removeItem(KEY)}catch{/* optional */}setKey('')}}>Wyloguj</button></header>
  <div className="gfwa-filters">
   <label>Konkurs <select value={contest} onChange={e=>setContest(e.target.value)}><option value="">Wszystkie prace</option>{allContests().map(c=><option key={c.id} value={c.id}>{c.id} · {c.title}</option>)}</select></label>
   <label><input type="checkbox" checked={consentOnly} onChange={e=>setConsentOnly(e.target.checked)}/> Tylko ze zgodą</label>
   <label><input type="checkbox" checked={showHidden} onChange={e=>setShowHidden(e.target.checked)}/> Pokaż ukryte</label>
   <button type="button" onClick={load} disabled={busy}>{busy?'Wczytuję…':'Odśwież'}</button>
  </div>
  {error?<p className="gfwa-err" role="alert">{error}</p>:null}
  <ol className="gfwa-list">{shown.map((i,n)=><li key={i.id} className={(i.hidden?'is-hidden ':'')+(i.featured?'is-'+i.featured:'')}>
   <span className="gfwa-rank">{n+1}</span>
   <img src={'/api/workshop?id='+i.id+'&format=svg'} alt="" loading="lazy"/>
   <div className="gfwa-info"><b>{i.nickname?'@'+i.nickname:'bez pseudonimu'}</b><span>{i.title}</span>
    <small>{new Date(i.createdAt).toLocaleDateString('pl-PL')} · {i.contest?'konkurs '+i.contest:'poza konkursem'} · {i.consent?<em className="ok">zgoda na social media</em>:<em className="no">bez zgody: nie publikuj w social mediach</em>}</small></div>
   <div className="gfwa-stats"><span title="Polubienia">❤ {i.likes}</span><span title="Stworzono podobnych">↺ {i.remixes}</span></div>
   <div className="gfwa-acts">
    <select aria-label="Wyróżnienie" value={i.featured||''} onChange={e=>void act(i.id,{featured:e.target.value||null})}><option value="">Bez wyróżnienia</option><option value="finalist">Finalista</option><option value="winner">Zwycięzca</option></select>
    <a href={'/?workshop='+i.id} target="_blank" rel="noopener">Otwórz w Studio ↗</a>
    <button type="button" onClick={()=>void act(i.id,{hidden:!i.hidden})}>{i.hidden?'Pokaż':'Ukryj'}</button>
   </div></li>)}</ol>
  {!shown.length&&!busy?<p>Brak prac dla tych filtrów.</p>:null}
  <CampaignAdmin adminKey={key}/>
  <p className="gfwa-note">Grafiki i film: „Otwórz w Studio”, potem Pliki projektu → Udostępnij. Podpis „@pseudonim” wstawia się sam, gdy autor dał zgodę. Zwycięzca pojawia się na stronie głównej w sekcji Warsztat.</p>
 </main>
}

type Camp={id:string;title:string;place:string;city:string;budgetName:string|null;budgetUrl:string|null;voteUntil:string|null;organizer:string|null;email:string|null;supporters:number;approved:boolean;hidden:boolean;createdAt:string};
/* BO campaign pages: who collects support where, and who asked for help with the application (sales leads). */
function CampaignAdmin({adminKey}:{adminKey:string}){
 const [items,setItems]=useState<Camp[]>([]),[error,setError]=useState(''),[tick,setTick]=useState(0);
 useEffect(()=>{let active=true;fetch('/api/campaign/admin',{headers:{'x-gf-admin':adminKey}}).then(async r=>{const d=await r.json();if(!active)return;if(!r.ok){setError(d.error||'Błąd');return}setError('');setItems(d.items)}).catch(e=>{if(active)setError((e as Error).message)});return()=>{active=false}},[adminKey,tick]);
 async function act(id:string,body:Record<string,unknown>){const r=await fetch('/api/campaign/admin',{method:'POST',headers:{'x-gf-admin':adminKey,'Content-Type':'application/json'},body:JSON.stringify({id,...body})});if(!r.ok)setError('Nie udało się zapisać zmiany');setTick(n=>n+1)}
 const leads=items.filter(i=>i.email).length;
 return <section className="gfwa-camps"><h2>Kampanie do budżetu obywatelskiego</h2><p>{items.length} stron · {leads} z prośbą o pomoc we wniosku (kontakt sprzedażowy).</p>{error?<p className="gfwa-err" role="alert">{error}</p>:null}
  <ol className="gfwa-list">{items.map(i=><li key={i.id} className={(i.hidden?'is-hidden ':'')+(i.email?'is-lead':'')}>
   <span className="gfwa-rank">{i.supporters}</span><img src={'/api/campaign?id='+i.id+'&format=svg'} alt="" loading="lazy"/>
   <div className="gfwa-info"><b>{i.title}</b><span>{i.place}, {i.city}{i.budgetName?' · '+i.budgetName:''}</span>
    <small>{new Date(i.createdAt).toLocaleDateString('pl-PL')}{i.voteUntil?' · głosowanie do '+i.voteUntil:''}{i.organizer?' · @'+i.organizer:''}{i.email?<> · <em className="ok">pomoc we wniosku: <a href={'mailto:'+i.email}>{i.email}</a></em></>:null}</small></div>
   <div className="gfwa-stats"><span title="Popierają">♥ {i.supporters}</span></div>
   <div className="gfwa-acts"><a href={'/kampania?id='+i.id} target="_blank" rel="noopener">Strona ↗</a>{i.budgetUrl?<a href={i.budgetUrl} target="_blank" rel="noopener nofollow">BO ↗</a>:null}<button type="button" onClick={()=>void act(i.id,{hidden:!i.hidden})}>{i.hidden?'Pokaż':'Ukryj'}</button></div></li>)}</ol>
  {!items.length?<p>Brak stron kampanii.</p>:null}</section>
}
