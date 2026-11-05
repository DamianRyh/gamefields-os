'use client';
import {useEffect,useId,useRef,useState} from 'react';
export function ProjectReset({onReset}:{onReset:()=>Promise<void>}){
 const [confirming,setConfirming]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const title=useId(),cancel=useRef<HTMLButtonElement>(null),trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(confirming)cancel.current?.focus()},[confirming]);
 function close(){setConfirming(false);trigger.current?.focus()}
 async function reset(){if(busy)return;setBusy(true);setMessage('');try{await onReset();setConfirming(false);setMessage('Rozpoczęto nowy projekt. Poprzedni szkic jest zachowany; możesz użyć Cofnij.')}catch(error){setMessage((error as Error).message)}finally{setBusy(false)}}
 return <section className="studio-project-reset"><button ref={trigger} type="button" onClick={()=>{setMessage('');setConfirming(true)}}>Zacznij od nowa</button>{confirming?<div role="alertdialog" aria-modal="false" aria-labelledby={title} className="studio-reset-confirm"><h3 id={title}>Rozpocząć nowy projekt?</h3><p>Najpierw zachowamy bieżący szkic. Powrót będzie możliwy przez Cofnij lub odzyskanie poprzedniego szkicu.</p><button ref={cancel} type="button" disabled={busy} onClick={close}>Zachowaj bieżący projekt</button><button type="button" disabled={busy} onClick={reset}>{busy?'Zachowuję szkic…':'Zachowaj szkic i zacznij od nowa'}</button></div>:null}{message?<p role="status">{message}</p>:null}</section>;
}
