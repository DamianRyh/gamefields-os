"use client";
import {useStudioLanguage} from "@/components/studio-language";
import {useState,useRef,useEffect,useId,useMemo} from 'react';
import type {Snapshot} from '@/lib/project-vault';
import {projectDimensions} from '@/lib/project-dimensions';
import {PannaStudioPreview} from '@/components/blender-arena-preview';

/** One optional comparison canvas; switching A/B preserves the common camera. */
export function Variant3DComparison({items}:{items:Snapshot[]}){
 const {display:tr}=useStudioLanguage();
 const [open,setOpen]=useState(false),[active,setActive]=useState(items[0].id);
 const dialog=useRef<HTMLDialogElement>(null),titleId=useId();
 useEffect(()=>{const node=dialog.current;if(open&&!node?.open)node?.showModal();return()=>node?.close()},[open]);
 const item=items.find(value=>value.id===active)??items[0],p=item.project;
 const previewProject=useMemo(()=>({...p,objects:p.objects.filter(o=>o.kind!=="equipment")}),[p]);
 const compatible=(projectDimensions(p).model?.sourceRevision??null)===item.modelRevision;
 const omitted=p.objects.filter(object=>object.kind!=='equipment'&&object.target!=='court');
 return <section className="variant-3d-comparison" aria-label={tr("Porównanie 3D wariantów")}>
  <button type="button" aria-expanded={open} onClick={()=>setOpen(true)}>{tr("Włącz porównanie 3D")}</button>
  {open?<dialog ref={dialog} className="variant-3d-dialog" aria-labelledby={titleId} onClose={()=>setOpen(false)}><header><h3 id={titleId}>{tr("Porównanie wariantów 3D")}</h3><button type="button" onClick={()=>dialog.current?.close()}>{tr("Zamknij porównanie 3D")}</button></header><p>{tr("Przełączaj A/B w tej samej perspektywie. Pełne plany 2D i kalkulacje są dostępne po zamknięciu tego okna.")}</p>
   <div className="variant-3d-options" role="group" aria-label={tr("Wariant w podglądzie 3D")}>{items.map((value,index)=><button key={value.id} type="button" aria-pressed={value.id===item.id} onClick={()=>setActive(value.id)}>{index===0?'A':'B'}: {value.name}</button>)}</div>

   <h4>3D — {item.name}</h4>
   {!compatible?<p role="status">{tr("Rewizja modelu zmieniła się. Podgląd historycznej geometrii jest niedostępny; sprawdź plan i zapis JSON.")}</p>:!p.arenaModel&&!p.surfaceModel?<p role="status">{tr("Ten projekt nie ma modelu konstrukcji 3D. Porównaj pełne plany 2D poniżej.")}</p>:<div className="variant-3d-stage"><PannaStudioPreview project={previewProject} view="perspective" interactive studio/></div>}
   <p>{tr("Konstrukcja, kolory i oznaczenia paneli oraz nawierzchnia korzystają z bieżącego modelu 3D. Wizualizacja jest koncepcyjna.")}</p>
   {omitted.length?<div className="variant-3d-coverage" role="note"><b>{tr('Elementy widoczne tylko na planie 2D')} ({omitted.length})</b><ul>{omitted.map(object=><li key={object.id}>{object.name} — {tr(object.kind==='equipment'?'wyposażenie poglądowe':'grafika poza nawierzchnią')}</li>)}</ul></div>:null}
  </dialog>:null}
 </section>;
}
