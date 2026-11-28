"use client";
import {useStudioLanguage} from "@/components/studio-language";
import {useState} from "react";
import type {Project} from "@/lib/project";
import {MAT_FORMATS,MAT_LIMITS,MAT_PRINT_NET_PER_M2,MAT_PRODUCT_NET_PER_M2,MAT_PRODUCT_NOTES,isMatFormat,matArea,matDrills,matNet,matPrintNet,matShopValue,oversizedOnMat,validMatSize} from "@/lib/mat-product";
import {MAT_VARIANTS,type MatVariant} from "@/lib/surface-finish";
import {SHOW_PRICE_RANGE} from "@/lib/price-range";
import {fallbackMat,useShop,zl} from "@/lib/shop";
import {StudioShopOrder} from "@/components/studio-shop-order";


/** Training mat: size (ready formats or own, every 0,5 m) and rubber variant with the price. Drills are added below. */
export function MatProductPanel({project:p,update,priced}:{project:Project;update:(patch:Partial<Project>)=>void;priced:boolean}){
 const {locale,numberLocale,display:tr}=useStudioLanguage();
 const money=(v:number)=>locale==="en"?"PLN "+Math.round(v).toLocaleString(numberLocale):new Intl.NumberFormat(numberLocale,{style:"currency",currency:"PLN",maximumFractionDigits:0}).format(v);
 const m=(v:number)=>new Intl.NumberFormat(numberLocale,{maximumFractionDigits:2}).format(v);
 const rate=(v:number)=>locale==="en"?`PLN ${m(v)}/m²`:`${v} zł/m²`;
 const [len,setLen]=useState(String(p.length)),[wid,setWid]=useState(String(p.width));
 const own=!MAT_FORMATS.some(([l,w])=>l===p.length&&w===p.width);
 const apply=(l:number,w:number)=>{if(validMatSize(l,w)){update({length:l,width:w});setLen(String(l));setWid(String(w))}};
 const typed=(l:string,w:string)=>{setLen(l);setWid(w);const a=Number(l.replace(',','.')),b=Number(w.replace(',','.'));if(validMatSize(a,b))update({length:a,width:b})};
 const okTyped=validMatSize(Number(len.replace(',','.')),Number(wid.replace(',','.')));
 const big=oversizedOnMat(p),shop=useShop(),[qty,setQty]=useState(1),variant=(p.matVariant||"standard") as MatVariant,drills=matDrills(p);
 const product=shop.mat||fallbackMat(),preset=isMatFormat(p.length,p.width)&&drills.length>0,value=matShopValue(p.length,p.width,variant);
 const net=matNet(p,variant)+(drills.length?matPrintNet(p):0),gross=Math.round(net*1.23);
 // Ready formats with drills can go to the cart; own sizes (or a mat without drills) go by inquiry with the same price.
 const line={product:preset?product:{...product,published:false},value,qty,price:preset?(product.variants?.find(v=>v.value===value)?.price??gross):gross};
 const note=locale==="en"?`Training mat ${m(p.length)} × ${m(p.width)} m · ${tr(MAT_VARIANTS[variant].label)}${drills.length?" · drills: "+drills.map(d=>tr(d.name)).join(", "):" · no drills"}`:`Mata treningowa ${value}${drills.length?" · ćwiczenia: "+drills.map(d=>d.name).join(", "):" · bez ćwiczeń"}`;
 return <section className="studio-mat-panel" aria-label={tr("Mata treningowa")}>
  {big.length?<p className="studio-mat-warning" role="alert">{tr("Nie mieści się na macie")} {m(p.length)} × {m(p.width)} m: {big.map(b=>`${tr(b.name)} (${m(b.w)} × ${m(b.h)} m)`).join(", ")}. {tr("Zmniejsz liczbę pachołków albo odstępy w ustawieniach ćwiczenia lub powiększ matę.")}</p>:null}
  <h3>{tr("Mata treningowa")}</h3>
  <p className="studio-mat-lead">{tr("Gumowa mata z ćwiczeniami ze Studio, wysyłana w całości i gotowa do rozłożenia. Wybierz wielkość i rodzaj gumy, a ćwiczenia dodaj poniżej.")}</p>
  <fieldset className="studio-mat-sizes"><legend>{tr("Wielkość")}</legend>
   <div className="studio-mat-formats">{MAT_FORMATS.map(([l,w])=>{const on=p.length===l&&p.width===w;return <button key={`${l}x${w}`} type="button" aria-pressed={on} onClick={()=>apply(l,w)}><b>{m(l)} × {m(w)} m</b><small>{m(l*w)} m²</small></button>})}</div>
   <div className="studio-mat-own"><span>{tr(own?"Własne wymiary":"Albo własne wymiary")}</span>
    <label>{tr("Długość (m)")}<input inputMode="decimal" value={len} onChange={e=>typed(e.target.value,wid)} aria-invalid={!okTyped}/></label>
    <label>{tr("Szerokość (m)")}<input inputMode="decimal" value={wid} onChange={e=>typed(len,e.target.value)} aria-invalid={!okTyped}/></label>
   </div>
   <small className={okTyped?"studio-mat-hint":"studio-mat-hint studio-mat-error"}>{locale==="en"?`From ${MAT_LIMITS.min} to ${MAT_LIMITS.max} m, in ${m(MAT_LIMITS.step)} m increments, up to ${MAT_LIMITS.maxArea} m². Current area: ${m(matArea(p))} m².`:`Od ${MAT_LIMITS.min} do ${MAT_LIMITS.max} m, co ${m(MAT_LIMITS.step)} m, do ${MAT_LIMITS.maxArea} m². Teraz: ${m(matArea(p))} m².`}</small>
  </fieldset>
  <fieldset className="studio-mat-variants"><legend>{tr("Rodzaj gumy")}</legend>
   {(Object.keys(MAT_VARIANTS) as MatVariant[]).map(id=><label key={id}><input type="radio" name="mat-product-variant" checked={(p.matVariant||"standard")===id} onChange={()=>update({matVariant:id==="standard"?undefined:id})}/><span><b>{tr(MAT_VARIANTS[id].label)}</b>{SHOW_PRICE_RANGE&&priced?<small className="studio-mat-price">{money(matNet(p,id))} {tr("netto")}</small>:null}<small>{rate(MAT_PRODUCT_NET_PER_M2[id])}. {tr(MAT_VARIANTS[id].description)}</small></span></label>)}
  </fieldset>
  <p className="studio-mat-print">{SHOW_PRICE_RANGE&&priced?<b>{tr("Nadruk ćwiczeń")}: +{money(matPrintNet(p))} {tr("netto")}</b>:<b>{tr("Nadruk ćwiczeń")}</b>}<small>{locale==="en"?`${rate(MAT_PRINT_NET_PER_M2)} of mat area, added when drills are included${drills.length?` (currently: ${drills.length})`:" (add them below)"}.`:`${MAT_PRINT_NET_PER_M2} zł/m² maty, doliczany, gdy na macie są ćwiczenia${matDrills(p).length?` (teraz: ${matDrills(p).length})`:" (dodaj je poniżej)"}.`}</small></p>
  <ul className="studio-mat-notes">{MAT_PRODUCT_NOTES.map(t=><li key={t}>{tr(t)}</li>)}</ul>
  {SHOW_PRICE_RANGE&&priced?<StudioShopOrder shop={shop} lines={[line]} note={note} qty={qty} onQty={setQty} unitLabel="matę" shipping="wysyłkę wyceniamy po podaniu adresu" extra={locale==="en"?`${money(net)} excl. VAT + 23% VAT${preset?"":` · ${(isMatFormat(p.length,p.width)?"add drills to buy directly":"custom dimensions: order by enquiry")}`}`:`${zl(net)} netto + VAT 23%${preset?"":isMatFormat(p.length,p.width)?" · dodaj ćwiczenia, aby kupić od razu":" · własny wymiar: zamówienie przez formularz"}`}/>:null}
 </section>;
}
