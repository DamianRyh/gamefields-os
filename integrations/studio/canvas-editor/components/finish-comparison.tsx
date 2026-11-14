"use client";
import type {Project} from "@/lib/project";
import {surfaceMaterials} from "@/lib/surface-materials";
import {CONCRETE_BASE_RATE_NET_PER_M2} from "@/lib/concrete-base";
import {finishAreaFor} from "@/lib/quote-engine";
import {SHOW_PRICE_RANGE} from "@/lib/price-range";
import {areaLabel,netForArea,PAINTED_MATERIAL,EPDM_MATERIAL,TILES_MATERIAL,TURF_MATERIAL,ACRYLIC_MATERIAL,RUBBER_MATERIAL,MAT_MATERIAL,PAINT_VARIANTS,EPDM_VARIANTS,TILE_VARIANTS,TURF_VARIANTS,ACRYLIC_VARIANTS,RUBBER_VARIANTS,MAT_VARIANTS} from "@/lib/surface-finish";

const money=(v:number)=>new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN",maximumFractionDigits:0}).format(v);
/** Cheapest variant of each finish for this model. */
const FROM:Record<string,number>={
 [PAINTED_MATERIAL]:PAINT_VARIANTS.plain.netPerM2,[EPDM_MATERIAL]:EPDM_VARIANTS.standard.netPerM2,[TILES_MATERIAL]:TILE_VARIANTS.standard.netPerM2,
 [TURF_MATERIAL]:TURF_VARIANTS.standard.netPerM2,[ACRYLIC_MATERIAL]:ACRYLIC_VARIANTS.standard.netPerM2,[RUBBER_MATERIAL]:RUBBER_VARIANTS.standard.netPerM2,[MAT_MATERIAL]:MAT_VARIANTS.standard.netPerM2,
};

/** "The same court with another finish": every material with its price from for this model, one click to switch. */
/** `priced`: the Studio has a rate card; without it the summary shows no amounts at all. */
export function FinishComparison({project:p,update,priced}:{project:Project;update:(patch:Partial<Project>)=>void;priced:boolean}){
 const fa=finishAreaFor(p);
 if(!priced||p.constructionOnly||!SHOW_PRICE_RANGE||fa===null)return null;
 const concrete=p.concreteBase!==false?netForArea(fa,CONCRETE_BASE_RATE_NET_PER_M2):null;
 const rows=surfaceMaterials.map(m=>({m,net:FROM[m.value]?netForArea(fa,FROM[m.value]):null})).filter(r=>r.net!==null).sort((a,b)=>a.net!-b.net!);
 return <section className="studio-finish-compare" aria-label="Porównanie wykończeń">
  <h3>{p.arenaModel?"Ta sama arena z innym wykończeniem":"Ta sama nawierzchnia z innym wykończeniem"}</h3>
  <p>Ceny „od” dla ok. {areaLabel(fa)} m²{concrete!==null?`, razem z nawierzchnią betonową ${money(concrete)}`:""}.{p.arenaModel?" Konstrukcja bez zmian.":""}</p>
  <ul role="list">{rows.map(({m,net})=>{const on=p.surface===m.value;return <li key={m.value} aria-current={on?"true":undefined}>
   <span><b>{m.label}</b><small>{m.audience}</small></span>
   <span className="studio-finish-compare-price">od {money(net!+(concrete??0))}<small>{concrete!==null?"z betonem, netto":"netto"}</small></span>
   {on?<span className="studio-finish-compare-on">Wybrane</span>:<button type="button" onClick={()=>update({surface:m.value})} aria-label={`Wybierz: ${m.label}`}>Wybierz</button>}
  </li>})}</ul>
 </section>;
}
