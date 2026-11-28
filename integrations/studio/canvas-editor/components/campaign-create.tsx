'use client';
/* "Kampania BO" tab of the project library (2026-11-25, kreator 2026-11-25): turns the current design into a public
   campaign page "Boisko dla osiedla X" for a participatory budget. One topic per step (place, vote, reason, publish),
   a live preview of the page the neighbours will see, a draft kept in this browser, errors shown next to the field.
   Public scope as in the Workshop (layout, pattern, colours; no private name, text or logos). E-mail only when the
   organiser asks Gamefields for help with the application. The server validates everything again. */
import {useEffect,useRef,useState,type ReactNode} from 'react';
import type {Project} from '@/lib/project';
import {publicWorkshopProject} from '@/lib/workshop-project';
import {cleanCampaign,CAMPAIGN_LINK,type CampaignInput} from '@/lib/campaign';
import '@/app/campaign-create.css';
import {journey} from '@/lib/journey';
const KEYS='gf-campaign-keys',DRAFT='gf-campaign-draft-v1';
type Saved={id:string;key:string;title:string;createdAt:number};
type Form={title:string;place:string;city:string;budgetName:string;budgetUrl:string;voteUntil:string;organizer:string;about:string;email:string};
type Stage='new'|'submitted'|'unknown';
type Field=keyof Form;
const read=():Saved[]=>{try{return JSON.parse(localStorage.getItem(KEYS)||'[]')}catch{return []}};
const STEPS=['Miejsce','Głosowanie','Dlaczego','Publikacja'] as const;
const REASONS=['Dzieci i młodzież nie mają gdzie grać w piłkę.','Zamiast pustego placu będzie miejsce spotkań dla sąsiadów.','Boisko przyda się szkole i klubom z okolicy.','Bezpieczna nawierzchnia, oświetlenie i ogrodzenie od ulicy.','Mogą z niego korzystać wszyscy, przez cały rok.'];
const STAGES:{id:Stage;label:string;hint:string}[]=[
 {id:'new',label:'Dopiero zgłaszamy',hint:'Wniosek jest w przygotowaniu'},
 {id:'submitted',label:'Projekt jest zgłoszony',hint:'Ma numer albo stronę w budżecie'},
 {id:'unknown',label:'Jeszcze nie wiem',hint:'Uzupełnisz to później'}];
/* the first problem of one field, checked with neutral values in the other required fields */
function fieldError(f:Form,k:Field,help:boolean):string{const base={title:'Boisko dla osiedla',place:'Plac zabaw',city:'Miasto'};
 if(k==='email'&&help&&!f.email.trim())return 'Podaj e-mail, żebyśmy mogli odpisać.';
 try{cleanCampaign({...base,[k]:k==='email'&&!help?null:f[k]});return ''}catch(e){const m=(e as Error).message;return m.startsWith('Uzupełnij')?(EMPTY[k]||m):m}}
const EMPTY:Partial<Record<Field,string>>={city:'Wpisz miasto albo gminę.',place:'Wpisz osiedle, ulicę albo szkołę.',title:'Wpisz tytuł strony (co najmniej 8 znaków).'};
const STEP_FIELDS:Field[][]=[['title','place','city'],['budgetName','budgetUrl','voteUntil'],['about','organizer'],['email']];
const fmtDate=(v:string)=>{try{return new Intl.DateTimeFormat('pl-PL',{day:'numeric',month:'long',year:'numeric'}).format(new Date(v+'T12:00:00'))}catch{return v}};

/** page: full-page wizard (/kampania/nowa) — no intro, step 0 goes back to the project choice, preview shows `hero`. */
export function CampaignCreate({project,page=false,hero,onBack}:{project:Project;page?:boolean;hero?:ReactNode;onBack?:()=>void}){
 useEffect(()=>{journey('financing')},[]);
 const init=():{f:Form;stage:Stage;step:number;help:boolean}=>{const empty={title:'',place:'',city:'',budgetName:'',budgetUrl:'',voteUntil:'',organizer:'',about:'',email:''};
  try{const d=JSON.parse(localStorage.getItem(DRAFT)||'null');if(d?.f)return {f:{...empty,...d.f},stage:d.stage||'new',step:Math.min(3,d.step||0),help:!!d.help}}catch{/* no draft */}
  let nick='';try{nick=localStorage.getItem('gf-workshop-nickname')||''}catch{/* optional */}
  return {f:{...empty,organizer:nick},stage:'new',step:page?0:-1,help:false}};
 const [first]=useState(init);
 const [f,setF]=useState<Form>(first.f),[stage,setStage]=useState<Stage>(first.stage),[step,setStep]=useState(first.step),[help,setHelp]=useState(first.help);
 const [titleTouched,setTitleTouched]=useState(!!first.f.title),[shown,setShown]=useState<Set<Field>>(new Set()),[pub,setPub]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[done,setDone]=useState<Saved|null>(null),[mine,setMine]=useState<Saved[]>(()=>typeof localStorage==='undefined'?[]:read()),[copied,setCopied]=useState(false);
 const head=useRef<HTMLHeadingElement>(null);
 let projectOk=true;try{publicWorkshopProject(project)}catch{projectOk=false}
 /* draft survives closing the panel */
 useEffect(()=>{if(step<0||done)return;try{localStorage.setItem(DRAFT,JSON.stringify({f,stage,step,help}))}catch{/* optional */}},[f,stage,step,help,done]);
 useEffect(()=>{head.current?.focus()},[step,done]);
 const autoTitle=(raw:string)=>{const v=raw.trim().replace(/\s+/g,' ');if(!v)return '';let t:string;
  if(/^os(iedle|\.)\s+/i.test(v))t='Boisko dla osiedla '+v.replace(/^os(iedle|\.)\s+/i,'');
  else if(/^(ul\.|ulica|ulicy|al\.|aleja)\s+/i.test(v))t='Boisko przy ul. '+v.replace(/^(ul\.|ulica|ulicy|al\.|aleja)\s+/i,'');
  else if(/^(szko|przedszk|park|plac|podw|skwer|boisk)/i.test(v))t='Nowe boisko: '+v;
  else t='Boisko dla osiedla '+v;return t.slice(0,70)};
 const set=(k:Field)=>(e:{target:{value:string}})=>{const v=e.target.value;setF(o=>({...o,[k]:v,...(k==='place'&&!titleTouched?{title:autoTitle(v)}:{})}));if(k==='title')setTitleTouched(true)};
 const err=(k:Field)=>shown.has(k)?fieldError(f,k,help):'';
 const blur=(k:Field)=>()=>{if(f[k])setShown(s=>new Set(s).add(k))};
 const stepErrors=(i:number)=>STEP_FIELDS[i].filter(k=>fieldError(f,k,help));
 function next(){const bad=stepErrors(step);if(bad.length){setShown(s=>{const n=new Set(s);bad.forEach(k=>n.add(k));return n});document.getElementById('gfcc-'+bad[0])?.focus();return}setStep(step+1)}
 const back=()=>setStep(s=>s-1);
 const go=(i:number)=>{for(let j=0;j<i;j++)if(stepErrors(j).length){setStep(j);setShown(s=>{const n=new Set(s);stepErrors(j).forEach(k=>n.add(k));return n});return}setStep(i)};
 async function create(){if(busy)return;for(let j=0;j<4;j++)if(stepErrors(j).length){go(j+1);return}
  if(!pub){setError('Zaznacz zgodę na publiczną stronę.');return}
  setBusy(true);setError('');try{
   const campaign:CampaignInput={...f,budgetUrl:stage==='submitted'?f.budgetUrl:'',email:help?f.email:null};
   const r=await fetch('/api/campaign',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({project:publicWorkshopProject(project),campaign,publicConsent:pub,helpConsent:help})});
   const d=await r.json();if(!r.ok)throw Error(d.error||'Nie udało się utworzyć strony.');
   const saved={id:d.id,key:d.key,title:f.title.trim(),createdAt:Date.now()},list=[saved,...read().filter(x=>x.id!==d.id)].slice(0,20);
   try{localStorage.setItem(KEYS,JSON.stringify(list));localStorage.removeItem(DRAFT)}catch{/* optional */}setMine(list);setDone(saved);
  }catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 const copy=(t:string)=>{navigator.clipboard?.writeText(t).then(()=>{setCopied(true);window.setTimeout(()=>setCopied(false),2000)}).catch(()=>{})};
 const openShare=()=>{window.dispatchEvent(new CustomEvent('gf-library-tab',{detail:{tab:'share'}}))};
 const restart=()=>{setDone(null);setStep(0);setPub(false);setShown(new Set());setF(o=>({...o,title:'',place:'',about:'',budgetUrl:'',voteUntil:''}));setTitleTouched(false)};

 const input=(k:Field,label:string,props:Record<string,unknown>={},hint?:string)=>{const e=err(k);return <div className={'gfcc-f'+(e?' is-err':'')}>
  <label htmlFor={'gfcc-'+k}>{label}</label>{hint?<small id={'gfcc-'+k+'-h'}>{hint}</small>:null}
  {props.rows?<textarea id={'gfcc-'+k} value={f[k]} onChange={set(k)} onBlur={blur(k)} aria-invalid={!!e} aria-describedby={[hint?'gfcc-'+k+'-h':'',e?'gfcc-'+k+'-e':''].join(' ').trim()||undefined} {...props}/>
   :<input id={'gfcc-'+k} value={f[k]} onChange={set(k)} onBlur={blur(k)} aria-invalid={!!e} aria-describedby={[hint?'gfcc-'+k+'-h':'',e?'gfcc-'+k+'-e':''].join(' ').trim()||undefined} {...props}/>}
  {e?<p className="gfcc-err" id={'gfcc-'+k+'-e'}>{e}</p>:null}</div>};

 const accent=project.arenaDesign?.panelColor||'#6336f5';
 const preview=<aside className="gfcc-pv" aria-label="Podgląd strony kampanii">
  <span className="gfcc-pv-tag">Podgląd · tak zobaczą to sąsiedzi</span>
  <div className="gfcc-pv-page">
   <div className={'gfcc-pv-hero'+(hero?' is-3d':'')} style={{['--gfcc-acc' as string]:accent}}>{hero||<span className="gfcc-pv-field" aria-hidden="true"><i/></span>}</div>
   <small className="gfcc-pv-kicker">{f.budgetName.trim()||'Budżet obywatelski'}</small>
   <b className={'gfcc-pv-title'+(f.title.trim()?'':' is-empty')}>{f.title.trim()||'Boisko dla osiedla…'}</b>
   <span className="gfcc-pv-place">{[f.place.trim(),f.city.trim()].filter(Boolean).join(' · ')||'Miejsce · miasto'}</span>
   <div className="gfcc-pv-support"><span><b>0</b> osób popiera</span><span className="gfcc-pv-btn">Popieram</span></div>
   {f.voteUntil?<span className="gfcc-pv-vote">Głosowanie do {fmtDate(f.voteUntil)}</span>:null}
   {f.about.trim()?<p className="gfcc-pv-about">{f.about.trim()}</p>:null}
   {f.organizer.trim()?<small className="gfcc-pv-org">Organizuje: {f.organizer.trim()}</small>:null}
  </div></aside>;

 const list=mine.length?<div className="gfcc-mine"><h3>Twoje strony kampanii</h3><ul>{mine.map(m=><li key={m.id}><span>{m.title}</span><a href={'/kampania?id='+m.id} target="_blank" rel="noopener">Otwórz ↗</a><button type="button" onClick={()=>copy(CAMPAIGN_LINK(m.id))}>Kopiuj link</button></li>)}</ul></div>:null;

 if(done)return <section className={(page?'gfcc-page ':'studio-p2-section ')+'gfcc'} aria-label="Kampania do budżetu obywatelskiego">
  <div className="gfcc-done" role="status"><span className="gfcc-done-icon" aria-hidden="true">✓</span><h2 ref={head} tabIndex={-1}>Strona „{done.title}” jest gotowa</h2>
   <p>Teraz zbierz pierwsze poparcia. Najlepiej działa wiadomość na grupie osiedla i plakat przy placu.</p>
   <div className="gfcc-link"><code>{CAMPAIGN_LINK(done.id)}</code><button type="button" className="studio-primary" onClick={()=>copy(CAMPAIGN_LINK(done.id))}>{copied?'Skopiowano ✓':'Kopiuj link'}</button></div>
   <ol className="gfcc-todo">
    <li><b>Wyślij link sąsiadom</b><span>Grupa osiedla na Facebooku, WhatsApp, rada rodziców w szkole.</span></li>
    <li><b>Dodaj grafikę albo film</b><span>Gotowe formaty do Stories i postów z Twoim boiskiem{page?' znajdziesz na stronie kampanii.':'.'}</span>{page?null:<button type="button" onClick={openShare}>Przygotuj grafiki →</button>}</li>
    <li><b>Sprawdź stronę</b><span>Kartę techniczną PDF dla urzędu pobierzesz na stronie kampanii.</span><a href={'/kampania?id='+done.id} target="_blank" rel="noopener">Otwórz stronę ↗</a></li>
   </ol>
   <button type="button" className="gfcc-ghost" onClick={restart}>Utwórz kolejną kampanię</button></div>
  {list}</section>;

 if(step<0)return <section className={(page?'gfcc-page ':'studio-p2-section ')+'gfcc'} aria-label="Kampania do budżetu obywatelskiego">
  <div className="gfcc-intro"><span className="gfcc-eyebrow">Budżet obywatelski</span><h2 ref={head} tabIndex={-1}>Zbierz poparcie sąsiadów dla tego boiska</h2>
   <p>W 3 minuty zrobisz z tego projektu stronę kampanii, którą wyślesz na grupę osiedla. Bez logowania i bez kosztów.</p>
   <ul className="gfcc-get">
    <li><span aria-hidden="true">👍</span><b>Strona z licznikiem „Popieram”</b><small>Sąsiedzi popierają jednym kliknięciem, bez zakładania konta.</small></li>
    <li><span aria-hidden="true">📱</span><b>Grafiki i film do social mediów</b><small>Twoje boisko w 3D, gotowe do Stories i postów.</small></li>
    <li><span aria-hidden="true">📄</span><b>Karta techniczna dla urzędu</b><small>Wymiary, nawierzchnia i koszt w jednym PDF do wniosku.</small></li>
   </ul>
   {!projectOk?<p className="gfcc-warn" role="alert">Najpierw wybierz w projekcie konstrukcję, wzór nawierzchni i paletę kolorów, potem wróć tutaj.</p>:null}
   <button type="button" className="studio-primary gfcc-start" disabled={!projectOk} onClick={()=>setStep(0)}>Zaczynamy</button>
   <small className="gfcc-fine">4 krótkie kroki. Postęp zapisuje się w tej przeglądarce.</small></div>
  {list}</section>;

 return <section className={(page?'gfcc-page ':'studio-p2-section ')+'gfcc'} aria-label="Kampania do budżetu obywatelskiego">
  <nav className="gfcc-steps" aria-label="Kroki kampanii"><ol>{STEPS.map((s,i)=><li key={s} className={i<step?'is-done':i===step?'is-now':''}><button type="button" onClick={()=>go(i)} aria-current={i===step?'step':undefined}><span>{i<step?'✓':i+1}</span>{s}</button></li>)}</ol></nav>
  <div className="gfcc-grid">
   <form className="gfcc-form" noValidate onSubmit={e=>{e.preventDefault();if(step<3)next();else void create()}}>
    {step===0?<>
     <h3 ref={head} tabIndex={-1}>Gdzie ma stanąć boisko?</h3>
     <p className="gfcc-lead">Podaj miejsce tak, jak mówią o nim sąsiedzi. Tytuł podpowiemy sami.</p>
     <div className="gfcc-2">{input('city','Miasto lub gmina',{maxLength:50,placeholder:'np. Lublin',autoComplete:'address-level2'})}{input('place','Osiedle, ulica albo szkoła',{maxLength:80,placeholder:'np. Słoneczne'})}</div>
     {input('title','Tytuł strony',{maxLength:70,placeholder:'Boisko dla osiedla Słoneczne'},'Krótko i konkretnie. Ten napis zobaczą wszyscy jako pierwszy.')}
    </>:step===1?<>
     <h3 ref={head} tabIndex={-1}>Na jakim etapie jest wniosek?</h3>
     <p className="gfcc-lead">Dzięki temu strona pokaże sąsiadom, kiedy i gdzie mogą zagłosować.</p>
     <div className="gfcc-choice" role="radiogroup" aria-label="Etap wniosku">{STAGES.map(s=><button key={s.id} type="button" role="radio" aria-checked={stage===s.id} onClick={()=>setStage(s.id)}><b>{s.label}</b><small>{s.hint}</small></button>)}</div>
     {stage!=='unknown'?<>
      <div className="gfcc-2">{input('budgetName','Nazwa budżetu',{maxLength:80,placeholder:'np. Budżet obywatelski Lublina 2027'},'Opcjonalnie')}{input('voteUntil','Koniec głosowania',{type:'date'},'Opcjonalnie. Pokażemy odliczanie.')}</div>
      {stage==='submitted'?input('budgetUrl','Link do projektu na stronie budżetu',{maxLength:300,placeholder:'https://…',inputMode:'url',type:'url'},'Opcjonalnie. Sąsiedzi przejdą stąd prosto do głosowania.'):<p className="gfcc-tip">Wniosek jeszcze w przygotowaniu? W ostatnim kroku możesz poprosić nas o bezpłatną pomoc w części technicznej.</p>}
     </>:<p className="gfcc-tip">W porządku. Termin i link dodasz, kiedy będą znane: wystarczy utworzyć kampanię jeszcze raz z tego samego projektu.</p>}
    </>:step===2?<>
     <h3 ref={head} tabIndex={-1}>Dlaczego to boisko jest potrzebne?</h3>
     <p className="gfcc-lead">Dwa, trzy zdania wystarczą. Kliknij podpowiedź, żeby ją dodać, i zmień po swojemu.</p>
     <div className="gfcc-chips">{REASONS.map(r=>{const on=f.about.includes(r);return <button key={r} type="button" aria-pressed={on} disabled={!on&&(f.about+' '+r).length>400} onClick={()=>setF(o=>({...o,about:on?o.about.replace(r,'').replace(/\s{2,}/g,' ').trim():(o.about.trim()+' '+r).trim()}))}>{on?'✓ ':'+ '}{r}</button>})}</div>
     {input('about','Opis',{rows:4,maxLength:400,placeholder:'Dla kogo jest boisko i co zmieni na osiedlu.'},`Bez nazwisk i danych kontaktowych. ${f.about.length}/400`)}
     {input('organizer','Kto organizuje?',{maxLength:24,placeholder:'np. Sąsiedzi z Lipowej'},'Opcjonalnie. Pseudonim albo nazwa grupy, bez imienia i nazwiska.')}
    </>:<>
     <h3 ref={head} tabIndex={-1}>Ostatni krok</h3>
     <dl className="gfcc-sum">
      <div><dt>Miejsce</dt><dd>{f.title}<br/><small>{f.place} · {f.city}</small></dd><button type="button" onClick={()=>setStep(0)}>Zmień</button></div>
      <div><dt>Głosowanie</dt><dd>{stage==='unknown'?'Uzupełnisz później':[f.budgetName||'Budżet obywatelski',f.voteUntil?'do '+fmtDate(f.voteUntil):''].filter(Boolean).join(', ')}</dd><button type="button" onClick={()=>setStep(1)}>Zmień</button></div>
      <div><dt>Opis</dt><dd>{f.about?f.about.slice(0,90)+(f.about.length>90?'…':''):'Bez opisu'}{f.organizer?<><br/><small>Organizuje: {f.organizer}</small></>:null}</dd><button type="button" onClick={()=>setStep(2)}>Zmień</button></div>
     </dl>
     <div className={'gfcc-help'+(help?' is-on':'')}>
      <label className="gfcc-c"><input type="checkbox" checked={help} onChange={e=>setHelp(e.target.checked)}/><span><b>Chcę bezpłatnej pomocy przy wniosku</b><small>Przygotujemy opis techniczny, wymiary i kosztorys do budżetu obywatelskiego.</small></span></label>
      {help?input('email','E-mail do kontaktu',{type:'email',maxLength:120,placeholder:'twoj@email.pl',autoComplete:'email'},'Widzi go tylko Gamefields. Nie pokażemy go na stronie.'):null}
     </div>
     <label className="gfcc-c gfcc-consent"><input type="checkbox" checked={pub} onChange={e=>{setPub(e.target.checked);if(e.target.checked)setError('')}}/><span>Strona będzie publiczna pod linkiem (bez wyszukiwarek): tytuł, miejsce, opis, pseudonim i projekt boiska. Mogę ją wycofać w każdej chwili.</span></label>
     {error?<p className="gfcc-warn" role="alert">{error}</p>:null}
    </>}
    <div className="gfcc-nav">
     {step>0?<button type="button" className="gfcc-ghost" onClick={back}>← Wstecz</button>:<button type="button" className="gfcc-ghost" onClick={()=>page?onBack?.():setStep(-1)}>{page?'← Zmień projekt':'← Wstecz'}</button>}
     {step<3?<button type="submit" className="studio-primary">Dalej</button>:<button type="submit" className="studio-primary" disabled={busy}>{busy?'Tworzę stronę…':'Utwórz stronę kampanii'}</button>}
    </div>
   </form>
   {preview}
  </div>
  {list}</section>;
}
