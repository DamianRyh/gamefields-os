'use client';
import {useStudioLanguage} from "@/components/studio-language";
import {useState} from 'react';
import {Link as LinkIcon} from 'lucide-react';
import type {Project} from '@/lib/project';
import {projectLink} from '@/lib/project-link';
import {shareProject,parseShareReceipt} from '@/lib/shared-project';
import {studioJson} from '@/lib/studio-http';

export function ProjectLink({project}:{project:Project}){
 const {display:tr}=useStudioLanguage();
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[url,setUrl]=useState(''),[message,setMessage]=useState('');
 async function copy(){
  if(busy)return;setBusy(true);setMessage('');
  try{
   const snapshot=shareProject(project,true);
   const data=await studioJson<{id:string;key:string;deleteKey:string;createdAt:number;expiresAt:number}>('/api/shared',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({project:snapshot,includePrivate:true,consent:true})});
   const receipt=parseShareReceipt({...data,url:location.origin+'/shared?id='+data.id+'#'+data.key},location.origin);
   if(!receipt)throw Error('Serwer nie zwrócił poprawnego linku.');
   try{const old=JSON.parse(localStorage.getItem('gamefields-shared-links-v1')||'[]');localStorage.setItem('gamefields-shared-links-v1',JSON.stringify([receipt,...(Array.isArray(old)?old:[])].slice(0,10)))}catch{}
   const link=projectLink(snapshot,location.origin,receipt);setUrl(link);
   try{await navigator.clipboard.writeText(link);setMessage('Skopiowano link do tej wersji projektu.')}catch{setMessage('Zaznacz i skopiuj adres z pola poniżej.')}
  }catch(error){setMessage((error as Error).message)}finally{setBusy(false)}
 }
 return <div className="studio-project-link"><button type="button" aria-label={tr("Kopiuj link do projektu")} aria-expanded={open} onClick={()=>setOpen(v=>!v)}><LinkIcon size={18}/><span>{tr("Link do projektu")}</span></button>{open?<section className="studio-project-link-popover" aria-label={tr("Link do projektu")}><h2>{tr("Udostępnij tę wersję 1:1")}</h2><p>{tr("Na serwerze zapiszemy cały projekt, także nazwę, napisy i logo. Osoba z linkiem otworzy własną kopię. Link działa 30 dni; wycofasz go w Pliki projektu → Udostępnij.")}</p><button type="button" disabled={busy} onClick={copy}>{tr(busy?'Zapisuję…':'Utwórz i skopiuj link')}</button>{url?<label>{tr("Link do projektu")}<input aria-label={tr("Adres projektu 1:1")} readOnly value={url} onFocus={e=>e.target.select()}/></label>:null}<p role="status">{tr(message)}</p><button type="button" onClick={()=>setOpen(false)}>{tr("Zamknij link")}</button></section>:null}</div>;
}
