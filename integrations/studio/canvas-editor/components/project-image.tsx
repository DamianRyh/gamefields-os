'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import type {Project} from '@/lib/project';
import {courtSvgToPng} from '@/lib/court-png';
export function ProjectImage({project,renderCourt}:{project:Project;renderCourt:(p:Project)=>ReactNode}){
 const [snapshot,setSnapshot]=useState<Project|null>(null),[message,setMessage]=useState(''),ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!snapshot)return;let cancelled=false;void(async()=>{try{
  const svg=ref.current?.querySelector('svg');if(!svg)throw Error('Nie udało się przygotować podglądu.');
  const href=await courtSvgToPng(svg,{edge:2000,caption:true});if(cancelled)return;
  const a=document.createElement('a');a.href=href;a.download='gamefields-'+snapshot.id.replace(/[^a-zA-Z0-9_-]/g,'')+'-wizualizacja.png';a.click();setMessage('Pobrano PNG: koncepcyjny widok z góry z kolorami i grafiką.');
 }catch(e){if(!cancelled)setMessage((e as Error).message)}finally{if(!cancelled)setSnapshot(null)}})();return()=>{cancelled=true}},[snapshot]);
 return <section aria-label="Wizualizacja do pobrania"><h3>Zabierz projekt na spotkanie</h3><p>Pobierz koncepcyjny widok z góry z kolorami i grafiką. PNG możesz dołączyć do prezentacji; indywidualną ofertę potwierdzimy osobno.</p><button type="button" disabled={!!snapshot} onClick={()=>{setMessage('');setSnapshot(project)}}>{snapshot?'Przygotowuję PNG…':'Pobierz wizualizację PNG'}</button>{message?<p role="status">{message}</p>:null}{snapshot?<div ref={ref} aria-hidden="true" style={{position:'fixed',left:-10000,width:1,height:1,overflow:'hidden',pointerEvents:'none'}}>{renderCourt(snapshot)}</div>:null}</section>;
}

/** Off-screen render of the court for the inquiry e-mail: capture(project) resolves to a PNG data URL or null. */
export function useCourtCapture(renderCourt:(p:Project)=>ReactNode){
 const [snapshot,setSnapshot]=useState<Project|null>(null),ref=useRef<HTMLDivElement>(null),resolve=useRef<((v:string|null)=>void)|null>(null);
 useEffect(()=>{if(!snapshot)return;let done=false;void(async()=>{let out:string|null=null;try{const svg=ref.current?.querySelector('svg');if(svg)out=await courtSvgToPng(svg,{edge:1600,caption:true})}catch{out=null}
  if(!done){done=true;resolve.current?.(out);resolve.current=null;setSnapshot(null)}})();return()=>{if(!done){done=true;resolve.current?.(null);resolve.current=null}}},[snapshot]);
 const capture=(project:Project)=>new Promise<string|null>(res=>{resolve.current?.(null);resolve.current=res;setSnapshot(project)});
 const node=snapshot?<div ref={ref} aria-hidden="true" style={{position:'fixed',left:-10000,width:1,height:1,overflow:'hidden',pointerEvents:'none'}}>{renderCourt(snapshot)}</div>:null;
 return {capture,node};
}
