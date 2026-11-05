'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import type {Project} from '@/lib/project';
export function ProjectImage({project,renderCourt}:{project:Project;renderCourt:(p:Project)=>ReactNode}){
 const [snapshot,setSnapshot]=useState<Project|null>(null),[message,setMessage]=useState(''),ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!snapshot)return;let cancelled=false;let url='';void(async()=>{try{
  const svg=ref.current?.querySelector('svg');if(!svg)throw Error('Nie udało się przygotować podglądu.');
  const clone=svg.cloneNode(true) as SVGSVGElement;clone.setAttribute('xmlns','http://www.w3.org/2000/svg');const box=svg.viewBox.baseVal;
  const scale=2000/Math.max(box.width,box.height),width=Math.round(box.width*scale),height=Math.round(box.height*scale);clone.setAttribute('width',String(width));clone.setAttribute('height',String(height));
  url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml;charset=utf-8'}));const image=new Image();image.src=url;await image.decode();if(cancelled)return;
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height+72;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Ta przeglądarka nie obsługuje eksportu obrazu.');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,width,height+72);ctx.drawImage(image,0,0,width,height);ctx.fillStyle='#47132d';ctx.font='20px Arial';ctx.fillText('GAMEFIELDS · wizualizacja koncepcyjna · widok z góry',24,height+42);
  const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='gamefields-'+snapshot.id.replace(/[^a-zA-Z0-9_-]/g,'')+'-wizualizacja.png';a.click();setMessage('Pobrano PNG: koncepcyjny widok z góry z kolorami i grafiką.');
 }catch(e){if(!cancelled)setMessage((e as Error).message)}finally{if(url)URL.revokeObjectURL(url);if(!cancelled)setSnapshot(null)}})();return()=>{cancelled=true;if(url)URL.revokeObjectURL(url)}},[snapshot]);
 return <section aria-label="Wizualizacja do pobrania"><h3>Zabierz projekt na spotkanie</h3><p>Pobierz koncepcyjny widok z góry z kolorami i grafiką. PNG możesz dołączyć do prezentacji; indywidualną ofertę potwierdzimy osobno.</p><button type="button" disabled={!!snapshot} onClick={()=>{setMessage('');setSnapshot(project)}}>{snapshot?'Przygotowuję PNG…':'Pobierz wizualizację PNG'}</button>{message?<p role="status">{message}</p>:null}{snapshot?<div ref={ref} aria-hidden="true" style={{position:'fixed',left:-10000,width:1,height:1,overflow:'hidden',pointerEvents:'none'}}>{renderCourt(snapshot)}</div>:null}</section>;
}
