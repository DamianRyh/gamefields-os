'use client';
/* Kreator kampanii do budżetu obywatelskiego jako osobna strona (2026-11-25). Wejście z gamefields.eu/budzet-obywatelski/,
   ze Studio (przycisk „Załóż kampanię”, krok „Finansowanie”) i z gamefields.eu/studio/?kampania=nowa.
   Krok 0: wybór projektu (ten ze Studio albo z galerii Warsztatu), potem kreator z podglądem 3D i opiekunem kampanii. */
import {useEffect,useState} from 'react';
import {projectSchema,type Project} from '@/lib/project';
import {publicWorkshopProject} from '@/lib/workshop-project';
import {readHandOff} from '@/lib/campaign-handoff';
import {PannaStudioPreview} from '@/components/blender-arena-preview';
import {CampaignCreate} from '@/components/campaign-create';
import '../kampania.css';
import './nowa.css';

type Item={id:string;title:string;nickname?:string|null;likes:number};
const GUARDIAN={name:'Damian Gawrych',place:'Grodzisk Mazowiecki',contact:'https://www.gamefields.eu/kontakt/'};
const STUDIO='https://www.gamefields.eu/studio/';
const safe=(raw:unknown):Project|null=>{try{return projectSchema.parse(publicWorkshopProject(raw))}catch{return null}};

function Guardian({compact=false}:{compact?:boolean}){
 return <aside className={'gfn-guard'+(compact?' is-compact':'')} aria-label="Opiekun kampanii">
  <span className="gfn-guard-av" aria-hidden="true">DG</span>
  <div><small>Twój opiekun kampanii</small><b>{GUARDIAN.name}</b><span>{GUARDIAN.place}</span>
   {compact?<p className="gfn-guard-short">Potrzebujesz pomocy przy wniosku? Zaznacz ją w ostatnim kroku.</p>:<p>Pomagam mieszkańcom przejść przez budżet obywatelski: od opisu i kosztorysu boiska po dzień głosowania. Zaznacz w kreatorze „Chcę bezpłatnej pomocy”, a odezwę się osobiście.</p>}
   <a href={GUARDIAN.contact} target="_blank" rel="noopener">Napisz do mnie ↗</a></div></aside>;
}

export default function NewCampaignPage(){
 const [mine,setMine]=useState<Project|null>(null),[ready,setReady]=useState(false);
 const [project,setProject]=useState<Project|null>(null),[items,setItems]=useState<Item[]|null>(null),[picking,setPicking]=useState(''),[error,setError]=useState('');
 useEffect(()=>{const h=readHandOff();const p=h?safe(h.project):null;const t=window.setTimeout(()=>{setMine(p);setReady(true);
   /* a fresh hand-off from the Studio goes straight to the wizard */
   if(p&&h&&Date.now()-h.at<10*60*1000)setProject(p)},0);return()=>window.clearTimeout(t)},[]);
 useEffect(()=>{if(!ready||project||items)return;let on=true;fetch('/api/workshop?page=1&sort=top').then(r=>r.json()).then(d=>{if(on)setItems((d.items||[]).slice(0,6))}).catch(()=>{if(on)setItems([])});return()=>{on=false}},[ready,project,items]);
 useEffect(()=>{window.scrollTo({top:0})},[project]);
 async function pick(id:string){setPicking(id);setError('');try{const r=await fetch('/api/workshop?id='+id);const d=await r.json();const p=r.ok?safe(d.project):null;if(!p)throw Error();setProject(p)}catch{setError('Nie udało się wczytać projektu. Wybierz inny.')}finally{setPicking('')}}

 return <main className="gfk gfn">
  <header className="gfk-top gfn-top"><a className="gfk-logo" href="https://www.gamefields.eu/">gamefields.</a><span>Kampania do budżetu obywatelskiego</span><a className="gfk-own" href="https://www.gamefields.eu/budzet-obywatelski/">Jak to działa?</a></header>
  {project?<div className="gfn-wiz">
   <div className="gfn-wiz-main"><CampaignCreate project={project} page onBack={()=>setProject(null)} hero={<PannaStudioPreview project={project} interactive/>}/></div>
   <Guardian compact/>
  </div>:<>
   <section className="gfn-hero">
    <div><p className="gfk-k">Budżet obywatelski</p><h1>Boisko dla Twojego osiedla. Zbierzmy poparcie razem.</h1>
     <p className="gfn-lead">Zrobisz stronę kampanii z projektem boiska w 3D, licznikiem „Popieram” i kartą techniczną dla urzędu. Przy wniosku pomożemy bezpłatnie.</p>
     <ol className="gfn-how"><li><b>Wybierz projekt</b><span>Swój ze Studio albo gotowy z galerii.</span></li><li><b>Opisz miejsce</b><span>4 krótkie kroki, około 3 minut.</span></li><li><b>Wyślij sąsiadom</b><span>Link, grafiki i film do social mediów.</span></li></ol></div>
    <Guardian/>
   </section>
   <section className="gfn-choose" aria-labelledby="gfn-choose-h">
    <h2 id="gfn-choose-h">Od którego projektu zaczynamy?</h2>
    {!ready?<p role="status">Sprawdzam projekt w tej przeglądarce…</p>:null}
    {mine?<article className="gfn-mine"><div className="gfn-mine-3d"><PannaStudioPreview project={mine}/></div>
     <div><span className="gfk-k">Twój projekt ze Studio</span><h3>{mine.name}</h3><p>Ten projekt jest zapisany w tej przeglądarce. Kampania pokaże układ, wzór i kolory, bez prywatnych napisów i logo.</p>
      <div className="gfn-acts"><button type="button" className="gfn-go" onClick={()=>setProject(mine)}>Użyj tego projektu</button><a href={STUDIO}>Zmień w Studio ↗</a></div></div></article>
    :ready?<article className="gfn-mine is-empty"><div><span className="gfk-k">Nie masz jeszcze projektu?</span><h3>Zaprojektuj boisko w Studio</h3><p>Wybierz konstrukcję, nawierzchnię i kolory. Potem kliknij w Podsumowaniu „Załóż kampanię” i wrócisz tutaj z gotowym projektem.</p>
      <div className="gfn-acts"><a className="gfn-go" href={STUDIO}>Otwórz Studio ↗</a></div></div></article>:null}
    {items&&items.length?<><h3 className="gfn-sub">{mine?'Albo wybierz projekt z galerii Warsztatu':'Albo zacznij od projektu z galerii Warsztatu'}</h3>
     <ul className="gfn-grid">{items.map(it=><li key={it.id}><button type="button" onClick={()=>pick(it.id)} disabled={!!picking} aria-busy={picking===it.id}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={'/api/workshop?id='+it.id+'&format=svg'} alt="" loading="lazy"/><b>{it.title}</b><small>{picking===it.id?'Wczytuję…':(it.nickname?it.nickname+' · ':'')+'♥ '+it.likes}</small></button></li>)}</ul></>:null}
    {error?<p className="gfk-k" role="alert">{error}</p>:null}
   </section>
  </>}
 </main>;
}
