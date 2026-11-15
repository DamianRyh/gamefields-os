"use client";
import {useState} from "react";
import type {Project} from "@/lib/project";
import {MAT_FORMATS,MAT_LIMITS,matArea,matNet,oversizedOnMat,validMatSize} from "@/lib/mat-product";
import {MAT_VARIANTS,type MatVariant} from "@/lib/surface-finish";
import {SHOW_PRICE_RANGE} from "@/lib/price-range";

const money=(v:number)=>new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN",maximumFractionDigits:0}).format(v);
const m=(v:number)=>new Intl.NumberFormat("pl-PL",{maximumFractionDigits:2}).format(v);

/** Training mat: size (ready formats or own, every 0,5 m) and rubber variant with the price. Drills are added below. */
export function MatProductPanel({project:p,update,priced}:{project:Project;update:(patch:Partial<Project>)=>void;priced:boolean}){
 const [len,setLen]=useState(String(p.length)),[wid,setWid]=useState(String(p.width));
 const own=!MAT_FORMATS.some(([l,w])=>l===p.length&&w===p.width);
 const apply=(l:number,w:number)=>{if(validMatSize(l,w)){update({length:l,width:w});setLen(String(l));setWid(String(w))}};
 const typed=(l:string,w:string)=>{setLen(l);setWid(w);const a=Number(l.replace(',','.')),b=Number(w.replace(',','.'));if(validMatSize(a,b))update({length:a,width:b})};
 const okTyped=validMatSize(Number(len.replace(',','.')),Number(wid.replace(',','.')));
 const big=oversizedOnMat(p);
 return <section className="studio-mat-panel" aria-label="Mata treningowa">
  {big.length?<p className="studio-mat-warning" role="alert">Nie mieści się na macie {m(p.length)} × {m(p.width)} m: {big.map(b=>`${b.name} (${m(b.w)} × ${m(b.h)} m)`).join(", ")}. Zmniejsz liczbę pachołków albo odstępy w ustawieniach ćwiczenia lub powiększ matę.</p>:null}
  <h3>Mata treningowa</h3>
  <p className="studio-mat-lead">Gumowa mata z ćwiczeniami ze Studio, bez betonu i montażu. Wybierz wielkość i rodzaj gumy, a ćwiczenia dodaj poniżej.</p>
  <fieldset className="studio-mat-sizes"><legend>Wielkość</legend>
   <div className="studio-mat-formats">{MAT_FORMATS.map(([l,w])=>{const on=p.length===l&&p.width===w;return <button key={`${l}x${w}`} type="button" aria-pressed={on} onClick={()=>apply(l,w)}><b>{m(l)} × {m(w)} m</b><small>{m(l*w)} m²</small></button>})}</div>
   <div className="studio-mat-own"><span>{own?"Własne wymiary":"Albo własne wymiary"}</span>
    <label>Długość (m)<input inputMode="decimal" value={len} onChange={e=>typed(e.target.value,wid)} aria-invalid={!okTyped}/></label>
    <label>Szerokość (m)<input inputMode="decimal" value={wid} onChange={e=>typed(len,e.target.value)} aria-invalid={!okTyped}/></label>
   </div>
   <small className={okTyped?"studio-mat-hint":"studio-mat-hint studio-mat-error"}>Od {MAT_LIMITS.min} do {MAT_LIMITS.max} m, co {m(MAT_LIMITS.step)} m, do {MAT_LIMITS.maxArea} m². Teraz: {m(matArea(p))} m².</small>
  </fieldset>
  <fieldset className="studio-mat-variants"><legend>Rodzaj gumy</legend>
   {(Object.keys(MAT_VARIANTS) as MatVariant[]).map(id=><label key={id}><input type="radio" name="mat-product-variant" checked={(p.matVariant||"standard")===id} onChange={()=>update({matVariant:id==="standard"?undefined:id})}/><span><b>{MAT_VARIANTS[id].label}</b>{SHOW_PRICE_RANGE&&priced?<small className="studio-mat-price">{money(matNet(p,id))} netto</small>:null}<small>{MAT_VARIANTS[id].netPerM2} zł/m². {MAT_VARIANTS[id].description}</small></span></label>)}
  </fieldset>
 </section>;
}
