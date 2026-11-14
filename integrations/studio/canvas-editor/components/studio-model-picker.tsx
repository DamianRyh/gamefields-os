"use client";
/* Construction model picker 2026-11-10. Replaces the "Konstrukcja stalowa" carousel: every model is visible at once
   as a product row (image, name, shape, play field, footprint with goals, height), grouped by game format, with a
   comparison table — the way playground and MUGA manufacturers present a range. All figures come from the 3D models. */
import {Check} from "lucide-react";
import type {Project} from "@/lib/project";
import {sportProfiles,type SportProfile} from "@/lib/sport-profiles";
import {constructionProject} from "@/lib/project-options";
import {projectDimensions,formatArea,formatBounds} from "@/lib/project-dimensions";
import "@/app/studio-model-picker.css";

type Model=NonNullable<Project['arenaModel']>;
const metres=new Intl.NumberFormat('pl-PL',{maximumFractionDigits:2}),short=new Intl.NumberFormat('pl-PL',{maximumFractionDigits:1});
const field=(s:SportProfile)=>s.courtShape==='circle'?`Ø ${short.format(s.diameter??s.length)} m`:`${short.format(s.length)} × ${short.format(s.width)} m`;
const shapeOf=(s:SportProfile)=>s.arenaModel==='octagon'?'Ośmiobok':s.courtShape==='circle'?'Okrągła':'Prostokątna';
const GROUPS:{id:string;label:string;note:string;test:(s:SportProfile)=>boolean}[]=[
 {id:'1x1',label:'Panna 1 na 1',note:'Małe areny do pojedynków, na podwórko, do szkoły i na event.',test:s=>s.sport==='Piłka nożna 1×1'},
 {id:'3x3',label:'Street 3 na 3',note:'Pełne boisko miejskie z bandami.',test:s=>s.sport!=='Piłka nożna 1×1'}
];
const countLabel=(n:number)=>n===1?'1 model':n<5?`${n} modele`:`${n} modeli`;

const pln=new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',maximumFractionDigits:0});
export function StudioModelPicker({project:p,onSelect,prices}:{project:Project;onSelect:(id:Model)=>void;prices?:Record<string,number>}){
 const rows=sportProfiles.filter(s=>s.arenaModel).map(s=>{const d=projectDimensions(constructionProject(p,s));return {s,d,b:d.model?.constructionBounds??null}});
 return <section className="gfmp" aria-label="Model konstrukcji">
  {GROUPS.map(g=>{const items=rows.filter(r=>g.test(r.s));if(!items.length)return null;return <div key={g.id} className="gfmp-group">
   <h3 className="gfmp-h">{g.label}<small>{countLabel(items.length)}</small></h3><p className="gfmp-note">{g.note}</p>
   <ul className="gfmp-list" role="list">{items.map(({s,d,b})=>{const on=p.arenaModel===s.arenaModel;return <li key={s.id}>
    <button type="button" className="gfmp-card" aria-pressed={on} aria-label={`${s.label}: ${shapeOf(s).toLowerCase()}, pole gry ${d.reference}${b?`, wysokość ${metres.format(b.y)} m`:''}`} onClick={()=>onSelect(s.arenaModel as Model)}>
     <span className="gfmp-thumb"><img src={`/arenas/thumbnails/${s.arenaModel}.webp`} alt="" width={640} height={400} decoding="async"/></span>
     <span className="gfmp-copy"><b>{s.label}</b>{prices?.[s.arenaModel as string]?<span className="gfmp-price">Konstrukcja {pln.format(prices[s.arenaModel as string])} netto</span>:null}<span>{shapeOf(s)}, pole {field(s)}</span><span className="gfmp-tags">{b?<><i title="Obrys konstrukcji z bramkami">{short.format(Math.max(b.x,b.z))} × {short.format(Math.min(b.x,b.z))} m z bramkami</i><i title="Wysokość konstrukcji">wys. {short.format(b.y)} m</i></>:null}</span></span>
     {on?<i className="gfmp-check" aria-hidden="true"><Check size={14}/></i>:null}
    </button></li>})}</ul></div>})}
  <details className="gfmp-compare"><summary>Porównaj wymiary wszystkich modeli</summary>
   <div className="gfmp-table"><table><thead><tr><th scope="col">Model</th><th scope="col">Pole gry</th><th scope="col">Z bramkami</th><th scope="col">Wys.</th><th scope="col">Nawierzchnia</th></tr></thead>
    <tbody>{rows.map(({s,d,b})=><tr key={s.id} aria-current={p.arenaModel===s.arenaModel?'true':undefined}><th scope="row">{s.label}</th><td>{d.reference}</td><td>{b?formatBounds(b):'—'}</td><td>{b?`${metres.format(b.y)} m`:'—'}</td><td>{d.area===null?'—':formatArea(d.area)}</td></tr>)}</tbody></table></div>
   <p className="gfmp-fine">Wymiary pochodzą z modeli 3D. „Z bramkami” to prostokąt obejmujący całą konstrukcję. Miejsce wokół boiska potwierdzamy przy wycenie.</p>
  </details>
  <p className="gfmp-fine">Ceny konstrukcji z bramkami, netto. Nawierzchnię i wykończenie wybierasz osobno; razem zobaczysz w podsumowaniu.</p>
 </section>;
}
