"use client";
import type {Project} from "@/lib/project";
import {surfaceMaterials} from "@/lib/surface-materials";
import {concreteBaseNet} from "@/lib/concrete-base";
import {SHOW_PRICE_RANGE} from "@/lib/price-range";
import {FINISH_AREA_M2,areaLabel,PAINTED_MATERIAL,EPDM_MATERIAL,TILES_MATERIAL,TURF_MATERIAL,ACRYLIC_MATERIAL,RUBBER_MATERIAL,MAT_MATERIAL,paintNet,epdmNet,tilesNet,turfNet,acrylicNet,rubberNet,matNet} from "@/lib/surface-finish";

const money=(v:number)=>new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN",maximumFractionDigits:0}).format(v);
/** Cheapest variant of each finish for this model. */
const FROM:Record<string,(m:string)=>number|null>={
 [PAINTED_MATERIAL]:m=>paintNet(m,"plain"),[EPDM_MATERIAL]:m=>epdmNet(m,"standard"),[TILES_MATERIAL]:m=>tilesNet(m,"standard"),
 [TURF_MATERIAL]:m=>turfNet(m,"standard"),[ACRYLIC_MATERIAL]:m=>acrylicNet(m,"standard"),[RUBBER_MATERIAL]:m=>rubberNet(m,"standard"),[MAT_MATERIAL]:m=>matNet(m,"standard"),
};

/** "The same court with another finish": every material with its price from for this model, one click to switch. */
/** `priced`: the Studio has a rate card; without it the summary shows no amounts at all. */
export function FinishComparison({project:p,update,priced}:{project:Project;update:(patch:Partial<Project>)=>void;priced:boolean}){
 if(!priced||!SHOW_PRICE_RANGE||!p.arenaModel||p.modular||!FINISH_AREA_M2[p.arenaModel])return null;
 const model=p.arenaModel,concrete=p.concreteBase!==false?concreteBaseNet(model):null;
 const rows=surfaceMaterials.map(m=>({m,net:FROM[m.value]?.(model)??null})).filter(r=>r.net!==null).sort((a,b)=>a.net!-b.net!);
 return <section className="studio-finish-compare" aria-label="Porównanie wykończeń">
  <h3>Ta sama arena z innym wykończeniem</h3>
  <p>Ceny „od” dla ok. {areaLabel(FINISH_AREA_M2[model])} m²{concrete!==null?`, razem z nawierzchnią betonową ${money(concrete)}`:""}. Konstrukcja bez zmian.</p>
  <ul role="list">{rows.map(({m,net})=>{const on=p.surface===m.value;return <li key={m.value} aria-current={on?"true":undefined}>
   <span><b>{m.label}</b><small>{m.audience}</small></span>
   <span className="studio-finish-compare-price">od {money(net!+(concrete??0))}<small>{concrete!==null?"z betonem, netto":"netto"}</small></span>
   {on?<span className="studio-finish-compare-on">Wybrane</span>:<button type="button" onClick={()=>update({surface:m.value})} aria-label={`Wybierz: ${m.label}`}>Wybierz</button>}
  </li>})}</ul>
 </section>;
}
