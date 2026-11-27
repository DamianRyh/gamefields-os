'use client';
/* Strona kampanii do budżetu obywatelskiego (2026-11-25): "Boisko dla osiedla X".
   Support counter ("Popieram", one per network, not a vote in the budget), the official vote, a share pack
   (Stories, post, 6 s film from the real 3D design), a technical card for the office (PDF) and the organiser's
   controls. Shared as https://www.gamefields.eu/studio/?kampania=<id>; the Studio sends that here. */
import {use,useEffect,useMemo,useState} from 'react';
import {projectSchema,type Project} from '@/lib/project';
import {type Campaign,CAMPAIGN_LINK,daysLeft} from '@/lib/campaign';
import {shareFacts} from '@/lib/share-media/facts';
import {useProjectQuote} from '@/hooks/use-project-quote';
import {PannaStudioPreview} from '@/components/blender-arena-preview';
import {ShareMediaPanel} from '@/components/share-media-panel';
import {ProjectCard,type CardSection} from '@/components/project-card';
import './kampania.css';

const SUPPORTED='gf-campaign-supported',KEYS='gf-campaign-keys';
const pln=(v:number)=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',maximumFractionDigits:0}).format(v);
const plural=(n:number)=>n===1?'osoba popiera':(n%10>=2&&n%10<=4&&(n%100<12||n%100>14))?'osoby popierają':'osób popiera';
const read=(k:string)=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch{return []}};

export default function CampaignPage({searchParams}:{searchParams:Promise<{id?:string|string[]}>}){
 const raw=use(searchParams).id,id=typeof raw==='string'?raw:'';
 const [data,setData]=useState<{campaign:Campaign;project:Project}|null>(null),[error,setError]=useState(''),[supported,setSupported]=useState(false),[busy,setBusy]=useState(false),[note,setNote]=useState('');
 const [key]=useState<string|null>(()=>{if(typeof localStorage==='undefined')return null;const k=(read(KEYS) as {id:string;key:string}[]).find(r=>r.id===id);return k?.key||null});
 const badId=!/^[0-9a-f-]{36}$/.test(id);
 useEffect(()=>{if(badId)return;let active=true;
  fetch('/api/campaign?id='+id).then(async r=>{const d=await r.json();if(!active)return;if(!r.ok){setError(d.error||'Nie udało się wczytać strony.');return}
   setData({campaign:d.campaign,project:projectSchema.parse(d.project)});setSupported((read(SUPPORTED) as string[]).includes(id));document.title=d.campaign.title+' · kampania · Gamefields'}).catch(()=>{if(active)setError('Nie udało się wczytać strony. Sprawdź połączenie.')});
  return()=>{active=false}},[id,badId]);
 if(badId||error)return <main className="gfk gfk-msg"><a className="gfk-logo" href="https://www.gamefields.eu/">gamefields.</a><h1>{badId?'Nie znaleziono strony kampanii. Sprawdź link.':error}</h1><p><a href="https://www.gamefields.eu/studio/">Zaprojektuj własne boisko ↗</a></p></main>;
 if(!data)return <main className="gfk gfk-msg"><a className="gfk-logo" href="https://www.gamefields.eu/">gamefields.</a><p role="status">Wczytuję stronę kampanii…</p></main>;
 return <Page id={id} campaign={data.campaign} project={data.project} supported={supported} busy={busy} note={note} manageKey={key}
  onSupport={async()=>{if(busy)return;setBusy(true);setNote('');const on=!supported;try{const r=await fetch('/api/campaign/support',{method:on?'POST':'DELETE',headers:{'Content-Type':'text/plain'},body:JSON.stringify({id})});const d=await r.json();if(!r.ok)throw Error(d.error||'Nie udało się zapisać.');
   const list=(read(SUPPORTED) as string[]).filter(x=>x!==id);if(on)list.push(id);try{localStorage.setItem(SUPPORTED,JSON.stringify(list.slice(-200)))}catch{/* optional */}
   setSupported(on);setData(v=>v?{...v,campaign:{...v.campaign,supporters:d.supporters??v.campaign.supporters}}:v);setNote(on?'Dziękujemy! Teraz udostępnij stronę sąsiadom: im więcej osób wie, tym więcej głosów w budżecie.':'Cofnięto poparcie.')}
   catch(e){setNote((e as Error).message)}finally{setBusy(false)}}}/>;
}

function Page({id,campaign:c,project,supported,busy,note,manageKey,onSupport}:{id:string;campaign:Campaign;project:Project;supported:boolean;busy:boolean;note:string;manageKey:string|null;onSupport:()=>void}){
 const facts=useMemo(()=>shareFacts(project),[project]),quote=useProjectQuote(project),link=CAMPAIGN_LINK(id);
 const arena=quote.data?.items.find(i=>i.id==='arena')?.totalNet??null,total=quote.data?.priceNet??null,days=daysLeft(c.voteUntil);
 const until=c.voteUntil?new Intl.DateTimeFormat('pl-PL',{day:'numeric',month:'long',year:'numeric'}).format(new Date(c.voteUntil+'T12:00:00')):null;
 const rows:[string,string][]=[['Model',facts.name],['Pole gry',facts.field],...(facts.footprint?[['Wymiary z bramkami',facts.footprint] as [string,string]]:[]),['Nawierzchnia',project.surface],['Wzór nawierzchni',facts.pattern],
  ['Kolor ramy i paneli',(project.arenaDesign?.frameColor||'—').toUpperCase()+' / '+(project.arenaDesign?.panelColor||'—').toUpperCase()],
  ...(arena!=null?[['Konstrukcja (orientacyjnie)',pln(arena)+' netto'] as [string,string]]:[]),...(total!=null?[['Komplet z nawierzchnią (orientacyjnie)',pln(total)+' netto'] as [string,string]]:[]),
  ['Gwarancja','12 miesięcy na realizację'],['Montaż i transport','wyceniane po zdjęciach miejsca']];
 const sections:CardSection[]=[{title:c.title,rows:[['Miejsce',c.place+', '+c.city],...(c.budgetName?[['Budżet obywatelski',c.budgetName] as [string,string]]:[]),...rows]}];
 const share=encodeURIComponent(`${c.title} (${c.city}). Popieram ten projekt, zagłosuj też: ${link}`);
 return <main className="gfk">
  <header className="gfk-top"><a className="gfk-logo" href="https://www.gamefields.eu/">gamefields.</a><span>Kampania do budżetu obywatelskiego</span><a href="https://www.gamefields.eu/studio/" className="gfk-own">Zaprojektuj własne ↗</a></header>
  <section className="gfk-hero">
   <div className="gfk-copy">
    <p className="gfk-k">{[c.budgetName,c.city].filter(Boolean).join(' · ')}</p>
    <h1>{c.title}</h1>
    <p className="gfk-place">{c.place}, {c.city}</p>
    {c.about?<p className="gfk-about">{c.about}</p>:null}
    {c.organizer?<p className="gfk-org">Organizuje: <b>@{c.organizer}</b></p>:null}
    <div className="gfk-support">
     <div className="gfk-count"><b>{c.supporters}</b><span>{plural(c.supporters)}</span></div>
     <button type="button" className={'gfk-btn'+(supported?' is-on':'')} aria-pressed={supported} disabled={busy} onClick={onSupport}>{supported?'✓ Popierasz ten projekt':'Popieram ten projekt'}</button>
     <p className="gfk-note" role="status">{note||'Jedno kliknięcie, bez logowania i bez podawania danych. To poparcie na tej stronie, nie głos w budżecie.'}</p>
    </div>
   </div>
   <div className="gfk-3d"><PannaStudioPreview project={project} interactive/></div>
  </section>
  {c.budgetUrl||until?<section className="gfk-vote"><div><p className="gfk-k">Oficjalne głosowanie</p><h2>{until?<>Głosujemy do {until}{days!=null&&days>=0?<small> · {days===0?'ostatni dzień':`zostało ${days} ${days===1?'dzień':'dni'}`}</small>:null}</>:'Zagłosuj w budżecie obywatelskim'}</h2>
   <p>Liczą się tylko głosy oddane w oficjalnym głosowaniu {c.budgetName?<>w ramach: <b>{c.budgetName}</b></>:'w Twoim mieście'}.</p></div>
   {c.budgetUrl?<a className="gfk-btn gfk-lime" href={c.budgetUrl} target="_blank" rel="noopener nofollow ugc">Zagłosuj w budżecie ↗</a>:null}</section>:null}
  <section className="gfk-sec"><div className="gfk-head"><p className="gfk-k">Pakiet do udostępnienia</p><h2>Zbierz poparcie sąsiadów.</h2><p>Grafika do Stories i postu albo 6-sekundowy film z tym boiskiem. Link do tej strony skopiuje się sam.</p></div>
   <div className="gfk-quick"><a href={'https://wa.me/?text='+share} target="_blank" rel="noopener">WhatsApp</a><a href={'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(link)} target="_blank" rel="noopener">Facebook</a><a href={'mailto:?subject='+encodeURIComponent(c.title)+'&body='+share}>E-mail</a>
    <button type="button" onClick={()=>navigator.clipboard?.writeText(link).catch(()=>{})}>Kopiuj link</button><code>{link.replace('https://','')}</code></div>
   <div className="gfk-sharebox"><ShareMediaPanel project={project} link={link} defaultCaption="Popieram!" heading="Grafika i film do social mediów"/></div>
  </section>
  <section className="gfk-sec"><div className="gfk-head"><p className="gfk-k">Dla urzędu i komisji</p><h2>Karta techniczna.</h2><p>Parametry do opisu projektu w budżecie. Ceny orientacyjne netto; dokładna wycena po oględzinach miejsca.</p></div>
   <dl className="gfk-card">{rows.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{/^#[0-9A-F]{6}/.test(v)?<>{v.split(' / ').map((h,i)=><span key={i} className="gfk-sw" style={{background:h}}/>)} {v}</>:v}</dd></div>)}</dl>
   <div className="gfk-pdf"><ProjectCard project={project} sections={sections} quote={quote}/></div>
  </section>
  <section className="gfk-cta"><div><h2>Jesteś z urzędu, rady osiedla albo szkoły?</h2><p>Pomagamy w części technicznej wniosku: opis, wymiary, kosztorys i wizualizacje. Po wygranej budujemy boisko.</p></div>
   <a className="gfk-btn gfk-lime" href={'https://www.gamefields.eu/kontakt/?produkt='+encodeURIComponent('Kampania BO: '+c.title+' ('+c.city+') '+link)}>Napisz do Gamefields ↗</a></section>
  <section className="gfk-sec"><div className="gfk-head"><p className="gfk-k">Jak wygrać</p><h2>Trzy kroki do głosów.</h2></div>
   <ol className="gfk-steps"><li><b>Pokaż boisko</b><span>Wrzuć film lub grafikę na grupę osiedla i do Stories, z linkiem do tej strony.</span></li><li><b>Zbierz poparcie</b><span>Poproś sąsiadów o „Popieram”: licznik pokazuje, że projekt ma zwolenników.</span></li><li><b>Przypomnij o głosowaniu</b><span>Tydzień i dzień przed końcem głosowania wyślij link jeszcze raz.</span></li></ol></section>
  {manageKey?<Manage id={id} manageKey={manageKey}/>:null}
  <footer className="gfk-foot">Strona przygotowana w Gamefields Studio przez mieszkańca. Projekt koncepcyjny: kolory, wymiary i ceny mogą się zmienić po oględzinach miejsca. <a href="https://www.gamefields.eu/">gamefields.eu</a></footer>
 </main>
}

function Manage({id,manageKey}:{id:string;manageKey:string}){
 const [msg,setMsg]=useState(''),[confirm,setConfirm]=useState(false);
 return <section className="gfk-manage"><b>Twoja strona kampanii</b><span>Tylko Ty widzisz ten panel (w tej przeglądarce).</span>
  {confirm?<><button type="button" onClick={async()=>{const r=await fetch('/api/campaign',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,key:manageKey})});if(r.ok){try{localStorage.setItem(KEYS,JSON.stringify((read(KEYS) as {id:string}[]).filter(x=>x.id!==id)))}catch{/* optional */}location.reload()}else setMsg('Nie udało się wycofać strony.')}}>Tak, wycofaj stronę</button><button type="button" onClick={()=>setConfirm(false)}>Anuluj</button></>
   :<button type="button" onClick={()=>setConfirm(true)}>Wycofaj stronę</button>}{msg?<span role="alert">{msg}</span>:null}</section>
}
