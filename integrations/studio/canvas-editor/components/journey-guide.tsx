'use client';
/* "Twoja ścieżka" (2026-11-25): a collapsible checklist of the Studio path and one contextual nudge at a time from
   the Studio guides (Marek, Kuba, Ola, Alex). Steps are detected from the project (model, surface, colours) and from
   features announcing completion (lib/journey.ts). Nudges: tied to events, each shown once, one every 90 s at most,
   held while the user drags or types, muted after two dismissals in a row. Open by default on the first visit. */
import {useEffect,useRef,useState,useCallback} from 'react';
import type {Project} from '@/lib/project';
import {JOURNEY,readJourney,writeJourney,journeyEvent,type JourneyState,type JourneyStep} from '@/lib/journey';
import {currentContest} from '@/lib/workshop-contest';
import '@/app/journey-guide.css';

type Guide='marek'|'kuba'|'ola'|'alex';
const GUIDES:Record<Guide,{name:string;role:string;emoji:string;accent:string}>={
 marek:{name:'Marek',role:'Formalności',emoji:'👨🏻‍💼',accent:'#92bed8'},kuba:{name:'Kuba',role:'Zgłoś boisko',emoji:'🧢',accent:'#a995ff'},
 ola:{name:'Ola',role:'Technologia',emoji:'👷🏻‍♀️',accent:'#ffc16b'},alex:{name:'Alex',role:'Sport i gra',emoji:'⚽',accent:'#f7a3b6'}};
type Nudge={id:string;guide:Guide;text:string;action:string;step:JourneyStep};
const GAP=90000;
const sig=(p:Project)=>({model:String(p.arenaModel||p.surfaceModel||''),surface:[p.patternFamily,p.patternVariant,p.patternPalette,p.surface,p.base,p.zone].join('|'),colors:[p.arenaDesign?.panelColor,p.arenaDesign?.frameColor].join('|')});

export function JourneyGuide({project,onOpen}:{project:Project;onOpen:(step:JourneyStep)=>void}){
 const [s,setS]=useState<JourneyState>(()=>typeof localStorage==='undefined'?{done:[],shown:[],dismissStreak:0,muted:false,open:null}:readJourney());
 const [nudge,setNudgeState]=useState<Nudge|null>(null),nudgeRef=useRef<Nudge|null>(null);
 const setNudge=useCallback((n:Nudge|null)=>{nudgeRef.current=n;setNudgeState(n)},[]);
 const state=useRef(s);state.current=s;
 const last=useRef(0),busy=useRef(false),queue=useRef<Nudge[]>([]),prev=useRef(sig(project)),firstChange=useRef(0);
 const save=useCallback((next:JourneyState)=>{state.current=next;setS(next);writeJourney(next)},[]);
 const contest=currentContest();
 const done=useCallback((step:JourneyStep)=>{const cur=state.current;if(cur.done.includes(step))return;save({...cur,done:[...cur.done,step]});journeyEvent('step_done',step);react(step)},[save]);// eslint-disable-line react-hooks/exhaustive-deps

 /* show the next queued nudge when allowed */
 const pump=useCallback(()=>{const cur=state.current;if(nudgeRef.current||cur.muted||!queue.current.length)return;
  const typing=document.activeElement?.matches?.('input,textarea,select,[contenteditable=true]');if(busy.current||typing||Date.now()-last.current<GAP){window.setTimeout(()=>pump(),4000);return}
  const n=queue.current.shift()!;if(cur.shown.includes(n.id)||cur.done.includes(n.step)){pump();return}
  last.current=Date.now();save({...cur,shown:[...cur.shown,n.id]});setNudge(n);journeyEvent('nudge_shown',n.id)},[save,setNudge]);
 const offer=useCallback((n:Nudge)=>{const cur=state.current;if(cur.muted||cur.shown.includes(n.id)||cur.done.includes(n.step)||queue.current.some(q=>q.id===n.id))return;queue.current.push(n);window.setTimeout(()=>pump(),1500)},[pump]);
 function react(step:JourneyStep){const d=state.current.done;
  if(step==='colors'&&!d.includes('save'))offer({id:'save-after-colors',guide:'ola',text:'Ładnie! Zapisz projekt, żeby go nie zgubić. Plik albo link pozwolą wrócić z innego urządzenia.',action:'Zapisz projekt',step:'save'});
  if(step==='surface'&&contest?.open)offer({id:'contest-'+contest.contest.id,guide:'kuba',text:`Trwa Projekt miesiąca „${contest.contest.title}”. Zgłoś swój projekt i zbieraj polubienia.`,action:'Zgłoś projekt',step:'publish'});
  if(step==='publish')offer({id:'share-after-publish',guide:'alex',text:'Pokaż swoje boisko znajomym: grafika do Stories albo 6-sekundowy film z obrotem kamery.',action:'Udostępnij',step:'share'});}

 /* steps from the project itself */
 useEffect(()=>{const n=sig(project),p=prev.current;prev.current=n;if(!firstChange.current&&(n.model!==p.model||n.surface!==p.surface||n.colors!==p.colors))firstChange.current=Date.now();
  if(n.model!==p.model)done('model');if(n.surface!==p.surface){done('model');done('surface')}if(n.colors!==p.colors){done('model');done('colors')}},[project,done]);
 /* steps from features, the summary, share events, drag state */
 useEffect(()=>{
  const onStep=(e:Event)=>{const step=(e as CustomEvent).detail?.step;if(JOURNEY.some(j=>j.id===step))done(step)};
  const onShare=(e:Event)=>{const n=(e as CustomEvent).detail?.name;if(['share_png_download','share_film_download','share_native_open','share_link_copy'].includes(n))done('share')};
  const onSummary=()=>{const d=state.current.done;
   if(!d.includes('card'))offer({id:'card-in-summary',guide:'marek',text:'Pobierz kartę projektu PDF: wymiary, nawierzchnia i cena na jednej stronie. Przyda się do rozmowy z zarządcą albo urzędem.',action:'Pobierz kartę PDF',step:'card'});
   if(!d.includes('financing'))offer({id:'financing-in-summary',guide:'marek',text:'Boisko może sfinansować gmina. Zgłoś je do budżetu obywatelskiego: zrobimy stronę kampanii z licznikiem poparcia.',action:'Zobacz finansowanie',step:'financing'});};
  const down=()=>{busy.current=true},up=()=>{busy.current=false};
  window.addEventListener('gf-journey',onStep);window.addEventListener('gf-share',onShare);window.addEventListener('gf-journey-summary',onSummary);
  document.addEventListener('pointerdown',down,true);document.addEventListener('pointerup',up,true);document.addEventListener('pointercancel',up,true);
  const idle=window.setInterval(()=>{if(firstChange.current&&Date.now()-firstChange.current>240000&&!state.current.done.includes('save'))offer({id:'unsaved-4min',guide:'ola',text:'Projekt jest zapisany tylko w tej przeglądarce. Pobierz plik albo skopiuj link, żeby go nie stracić.',action:'Zapisz projekt',step:'save'})},30000);
  return()=>{window.removeEventListener('gf-journey',onStep);window.removeEventListener('gf-share',onShare);window.removeEventListener('gf-journey-summary',onSummary);document.removeEventListener('pointerdown',down,true);document.removeEventListener('pointerup',up,true);document.removeEventListener('pointercancel',up,true);window.clearInterval(idle)}},[done,offer]);
 /* a nudge disappears by itself after 15 s (not counted as a dismissal) */
 useEffect(()=>{if(!nudge)return;const t=window.setTimeout(()=>{setNudge(null);pump()},15000);const esc=(e:KeyboardEvent)=>{if(e.key==='Escape')dismiss()};window.addEventListener('keydown',esc);return()=>{window.clearTimeout(t);window.removeEventListener('keydown',esc)}});

 function dismiss(){if(!nudge)return;const cur=state.current,streak=cur.dismissStreak+1;save({...cur,dismissStreak:streak,muted:streak>=2});journeyEvent(streak>=2?'nudges_muted':'nudge_dismiss',nudge.id);setNudge(null)}
 function act(n:Nudge){const cur=state.current;save({...cur,dismissStreak:0});journeyEvent('nudge_click',n.id);setNudge(null);onOpen(n.step)}
 const [phone]=useState(()=>typeof matchMedia==='function'&&matchMedia('(max-width:800px)').matches);
 const open=(s.open===null?!phone:s.open)&&!nudge,count=s.done.length,total=JOURNEY.length;
 const toggle=()=>{if(nudge)setNudge(null);save({...state.current,open:!open});journeyEvent(open?'path_close':'path_open')};
 return <div className="gfj" data-open={open}>
  {nudge?<div className="gfj-nudge" role="status" aria-live="polite" style={{['--gfj-accent' as string]:GUIDES[nudge.guide].accent}}>
   <span className="gfj-avatar" aria-hidden="true">{GUIDES[nudge.guide].emoji}</span>
   <div className="gfj-nudge-body"><b>{GUIDES[nudge.guide].name} <small>· {GUIDES[nudge.guide].role}</small></b><p>{nudge.text}</p>
    <div className="gfj-nudge-acts"><button type="button" className="gfj-go" onClick={()=>act(nudge)}>{nudge.action}</button><button type="button" className="gfj-later" onClick={dismiss}>Nie teraz</button></div></div>
   <button type="button" className="gfj-x" aria-label="Zamknij podpowiedź" onClick={dismiss}>×</button></div>:null}
  {open?<section className="gfj-card" aria-label="Twoja ścieżka">
   <header><div><b>Twoja ścieżka</b><span>{count} z {total}</span></div><button type="button" className="gfj-x" aria-label="Zwiń ścieżkę" onClick={toggle}>–</button></header>
   <div className="gfj-bar" aria-hidden="true"><i style={{width:`${count/total*100}%`}}/></div>
   <ol>{JOURNEY.map(j=>{const ok=s.done.includes(j.id),next=JOURNEY.find(x=>!s.done.includes(x.id))?.id===j.id;return <li key={j.id} className={ok?'is-done':next?'is-next':''}><button type="button" onClick={()=>{journeyEvent('path_click',j.id);onOpen(j.id)}}>
    <span className="gfj-dot" aria-hidden="true">{ok?'✓':''}</span><span className="gfj-t"><b>{j.label}</b>{next?<small>{j.id==='publish'&&contest?.open?`Teraz: „${contest.contest.title}”`:j.hint}</small>:null}</span><span className="sr-only">{ok?' (zrobione)':''}</span></button></li>})}</ol>
   <footer>{s.muted?<button type="button" onClick={()=>save({...state.current,muted:false,dismissStreak:0})}>Włącz podpowiedzi</button>:<button type="button" onClick={()=>save({...state.current,muted:true})}>Wycisz podpowiedzi</button>}</footer>
  </section>:<button type="button" className="gfj-pill" onClick={toggle} aria-label={`Twoja ścieżka: ${count} z ${total}. Rozwiń`}><span className="gfj-ring" style={{['--p' as string]:count/total}}/>Ścieżka {count}/{total}</button>}
 </div>
}
