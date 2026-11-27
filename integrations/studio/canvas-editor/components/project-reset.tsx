'use client';
import {useStudioLanguage} from "@/components/studio-language";
import {useEffect,useId,useRef,useState} from 'react';
export function ProjectReset({onReset}:{onReset:()=>Promise<void>}){
 const {display:tr}=useStudioLanguage();
 const [confirming,setConfirming]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const title=useId(),cancel=useRef<HTMLButtonElement>(null),trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(confirming)cancel.current?.focus()},[confirming]);
 function close(){setConfirming(false);trigger.current?.focus()}
 async function reset(){if(busy)return;setBusy(true);setMessage('');try{await onReset();setConfirming(false);setMessage('Rozpoczęto nowy projekt. Poprzedni szkic jest zachowany; możesz użyć Cofnij.')}catch(error){setMessage((error as Error).message)}finally{setBusy(false)}}
 return <section className="studio-project-reset"><button ref={trigger} type="button" onClick={()=>{setMessage('');setConfirming(true)}}>{tr("Zacznij od nowa")}</button>{confirming?<div role="alertdialog" aria-modal="false" aria-labelledby={title} className="studio-reset-confirm"><h3 id={title}>{tr("Rozpocząć nowy projekt?")}</h3><p>{tr("Najpierw zachowamy bieżący szkic. Powrót będzie możliwy przez Cofnij lub odzyskanie poprzedniego szkicu.")}</p><button ref={cancel} type="button" disabled={busy} onClick={close}>{tr("Zachowaj bieżący projekt")}</button><button type="button" disabled={busy} onClick={reset}>{tr(busy?'Zachowuję szkic…':'Zachowaj szkic i zacznij od nowa')}</button></div>:null}{message?<p role="status">{tr(message)}</p>:null}</section>;
}
