"use client";
import type {Project} from "@/lib/project";
import type {QuoteState} from "@/hooks/use-project-quote";
import {CONCRETE_BASE_NET} from "@/lib/concrete-base";
import {PAINTED_MATERIAL,PAINT_NOTES,PAINT_VARIANTS,paintNet,type PaintVariant} from "@/lib/surface-finish";
import {SHOW_PRICE_RANGE} from "@/lib/price-range";

const money=(v:number)=>new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN",maximumFractionDigits:0}).format(v);

/** Painting variant on the concrete base. Default: chosen from the design; the customer can pick another. */
export function PaintVariantChoice({project:p,update,quote}:{project:Project;update:(patch:Partial<Project>)=>void;quote:QuoteState}){
 if(!p.arenaModel||p.modular||p.surface!==PAINTED_MATERIAL||!CONCRETE_BASE_NET[p.arenaModel])return null;
 const auto=quote.data?.items.find(i=>i.id==="paint")?.label.replace(/^Malowanie · /,"");
 const option=(id:PaintVariant|undefined,title:string,detail:string,net:number|null)=><label key={id||"auto"}><input type="radio" name="paint-variant" checked={p.paintVariant===id} onChange={()=>update({paintVariant:id})}/><span><b>{title}</b>{SHOW_PRICE_RANGE&&net!==null?<small>{money(net)} netto</small>:null}<small>{detail}</small></span></label>;
 return <fieldset className="studio-concrete-base studio-paint-variant"><legend>Malowanie nawierzchni · ok. {CONCRETE_BASE_NET[p.arenaModel].areaM2} m²</legend>
  {option(undefined,`Dobierz do projektu${!p.paintVariant&&auto?`: ${auto}`:""}`,"Wariant wynika z grafiki i liczby kolorów w projekcie.",null)}
  {(Object.keys(PAINT_VARIANTS) as PaintVariant[]).map(id=>option(id,PAINT_VARIANTS[id].label,`${PAINT_VARIANTS[id].netPerM2} zł/m². ${PAINT_VARIANTS[id].description}`,paintNet(p.arenaModel,id)))}
  <p>{PAINT_NOTES[1]}</p>
 </fieldset>;
}
