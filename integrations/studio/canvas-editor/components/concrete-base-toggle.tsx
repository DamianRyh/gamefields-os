"use client";
import type {Project} from "@/lib/project";
import {CONCRETE_BASE_EXCLUDES,CONCRETE_BASE_INCLUDES,CONCRETE_BASE_LABEL,CONCRETE_BASE_NET,concreteBaseNet} from "@/lib/concrete-base";
import {SHOW_PRICE_RANGE} from "@/lib/price-range";

const money=(v:number)=>new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN",maximumFractionDigits:0}).format(v);

/** Concrete base without finish: included with the construction by default, the customer can remove it. Finishes come next. */
export function ConcreteBaseToggle({project:p,update}:{project:Project;update:(patch:Partial<Project>)=>void}){
 const net=concreteBaseNet(p.arenaModel,p.modular);
 if(net===null||!p.arenaModel)return null;
 return <section className="studio-concrete-base" aria-label={CONCRETE_BASE_LABEL}>
  <label><input type="checkbox" checked={p.concreteBase!==false} onChange={e=>update({concreteBase:e.target.checked?undefined:false})}/>
   <span><b>Nawierzchnia betonowa</b>{SHOW_PRICE_RANGE?<small>{money(net)} netto · ok. {CONCRETE_BASE_NET[p.arenaModel].areaM2} m² · cena osobno od konstrukcji</small>:null}<small>Płyta 12 cm z podbudową, bez wykończenia. Podstawa pod wykończenie: malowanie, płytki sportowe lub sztuczną trawę (wybór wkrótce). Odznacz, jeśli masz już podłoże.</small></span></label>
  <details><summary>Co obejmuje</summary><ul>{CONCRETE_BASE_INCLUDES.map(t=><li key={t}>{t}</li>)}</ul><p>Nie obejmuje:</p><ul>{CONCRETE_BASE_EXCLUDES.map(t=><li key={t}>{t}</li>)}</ul></details>
 </section>;
}
