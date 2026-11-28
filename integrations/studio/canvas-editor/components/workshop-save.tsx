'use client';
/* "Zapisz dla innych" with Projekt miesiąca (2026-11-25): before publishing, an optional pseudonym, the month's contest
   and the consent to show the design on gamefields.eu and in social media. Without the contest the publish stays one
   click away (the form remembers the last pseudonym). The server validates everything again. */
import {useEffect,useId,useRef,useState} from 'react';
import {publicWorkshopProject} from '@/lib/workshop-project';
import {currentContest,cleanNickname,CONTEST_RULES} from '@/lib/workshop-contest';
import type {Project} from '@/lib/project';
import '@/app/workshop-contest.css';
import {journey} from '@/lib/journey';
type Receipt={id:string;key?:string;contest?:string|null};
const NICK='gf-workshop-nickname';
const fmt=(iso:string)=>new Intl.DateTimeFormat('pl-PL',{day:'numeric',month:'long'}).format(new Date(iso+'T12:00:00'));
export function WorkshopSave({project}:{project:Project}){
 const [busy,setBusy]=useState(false),[receipt,setReceipt]=useState<Receipt|null>(null),[message,setMessage]=useState(''),[open,setOpen]=useState(false);
 const [nickname,setNickname]=useState(()=>{try{return typeof localStorage==='undefined'?'':localStorage.getItem(NICK)||''}catch{return ''}}),[contest,setContest]=useState(true),[consent,setConsent]=useState(false);
 const cur=currentContest(),live=cur?.open?cur.contest:null,id=useId(),box=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!open)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)};const out=(e:MouseEvent)=>{if(box.current&&!box.current.contains(e.target as Node))setOpen(false)};document.addEventListener('keydown',close);document.addEventListener('mousedown',out);return()=>{document.removeEventListener('keydown',close);document.removeEventListener('mousedown',out)}},[open]);
 const nickOk=cleanNickname(nickname)!==false,entering=!!live&&contest,ready=nickOk&&(!entering||consent);
 async function publish(){if(busy||!ready)return;setBusy(true);setMessage('');try{
   const clean=cleanNickname(nickname)||null;try{if(clean)localStorage.setItem(NICK,clean)}catch{/* optional */}
   const response=await fetch('/api/workshop',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({project:publicWorkshopProject(project),nickname:clean,consent,contest:entering})});
   const data=await response.json();if(!response.ok)throw Error(data.error||'Nie udało się zapisać');
   let saved:Receipt=data;if(!data.key)try{saved={...data,key:JSON.parse(localStorage.getItem('gf-workshop-receipts')||'[]').find((r:Receipt)=>r.id===data.id)?.key}}catch{/* optional */}
   setReceipt(saved);if(saved.key)try{const old=JSON.parse(localStorage.getItem('gf-workshop-receipts')||'[]');localStorage.setItem('gf-workshop-receipts',JSON.stringify([saved,...old.filter((r:Receipt)=>r.id!==saved.id)].slice(0,30)))}catch{/* optional */}
   journey('publish');setOpen(false);setMessage(data.contest?`Gotowe — projekt bierze udział w Projekcie miesiąca „${live?.title}”.`:'Gotowe — projekt jest już w Warsztacie.');
  }catch(e){setMessage((e as Error).message)}finally{setBusy(false)}}
 async function withdraw(){if(!receipt?.key)return;setBusy(true);try{const r=await fetch('/api/workshop',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:receipt.id,key:receipt.key})});if(!r.ok)throw Error('Nie udało się wycofać. Spróbuj ponownie.');setReceipt(null);setMessage('Projekt wycofany z galerii.')}catch(e){setMessage((e as Error).message)}finally{setBusy(false)}}
 return <div className="studio-workshop-save" ref={box}>
  <button type="button" className="studio-workshop-publish" disabled={busy} aria-expanded={open} aria-controls={id} onClick={()=>setOpen(o=>!o)}>{busy?'Zapisuję…':'Zapisz dla innych'}</button>
  <span className="studio-workshop-note">{live?<>Trwa <b>Projekt miesiąca: {live.title}</b> · do {fmt(live.end)}</>:'Kliknięcie publikuje układ i kolory. Bez prywatnej nazwy, napisów i logo.'}</span>
  {message?<span role="status" className="studio-workshop-message">{message} {receipt?<a href="https://www.gamefields.eu/#warsztat" target="_blank" rel="noopener">Zobacz ↗</a>:null} {receipt?.key?<button type="button" disabled={busy} onClick={withdraw}>Wycofaj</button>:null}</span>:null}
  {open?<div className="gfwc" id={id} role="dialog" aria-label="Opublikuj w Warsztacie">
   {live?<div className="gfwc-theme"><span>Projekt miesiąca · do {fmt(live.end)}</span><b>{live.title}</b><p>{live.brief}</p><small>Nagroda: {live.prize}</small></div>:null}
   <label className="gfwc-l" htmlFor={id+'-nick'}>Pseudonim (opcjonalnie)</label>
   <input id={id+'-nick'} className="gfwc-in" value={nickname} maxLength={24} placeholder="np. Kuba z Mokotowa" aria-invalid={!nickOk} onChange={e=>setNickname(e.target.value)}/>
   <small className={'gfwc-h'+(nickOk?'':' is-err')}>{nickOk?'Bez imienia i nazwiska. Pokażemy go przy projekcie.':'2–24 litery lub cyfry, bez linków i wulgaryzmów.'}</small>
   {live?<label className="gfwc-c"><input type="checkbox" checked={contest} onChange={e=>setContest(e.target.checked)}/><span>Zgłaszam projekt do Projektu miesiąca</span></label>:null}
   <label className="gfwc-c"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>Gamefields może pokazać ten projekt na stronie i w mediach społecznościowych{nickname.trim()?' z moim pseudonimem':''}.{entering?<em> Wymagane w konkursie.</em>:null}</span></label>
   <p className="gfwc-p">Publikujemy układ, wzór i kolory. Bez prywatnej nazwy, napisów i logo. Projekt wycofasz w każdej chwili. <a href={CONTEST_RULES} target="_blank" rel="noopener">Regulamin ↗</a></p>
   <div className="gfwc-a"><button type="button" className="gfwc-go" disabled={busy||!ready} onClick={publish}>{entering?'Opublikuj i zgłoś':'Opublikuj'}</button><button type="button" className="gfwc-no" onClick={()=>setOpen(false)}>Anuluj</button></div>
  </div>:null}
 </div>
}
