"use client";
import {useStudioLanguage} from "@/components/studio-language";
import type {Project} from "@/lib/project";
import {CONCRETE_BASE_EXCLUDES,CONCRETE_BASE_INCLUDES,CONCRETE_BASE_LABEL,CONCRETE_BASE_RATE_NET_PER_M2} from "@/lib/concrete-base";
import {SHOW_PRICE_RANGE} from "@/lib/price-range";
import {areaLabel,netForArea} from "@/lib/surface-finish";
import {finishAreaFor} from "@/lib/quote-engine";

const money=(v:number)=>new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN",maximumFractionDigits:0}).format(v);

/** Concrete base without finish: included with the construction by default, the customer can remove it. Finishes come next. */
export function ConcreteBaseToggle({project:p,update}:{project:Project;update:(patch:Partial<Project>)=>void}){
 const {display:tr}=useStudioLanguage();
 const fa=finishAreaFor(p);
 if(fa===null)return null;
 const net=netForArea(fa,CONCRETE_BASE_RATE_NET_PER_M2);
 const scope=<fieldset className="studio-order-scope"><legend>{tr("Co zamawiasz?")}</legend>
  <label><input type="radio" name="order-scope" checked={!p.constructionOnly} onChange={()=>update({constructionOnly:undefined})}/><span><b>{tr("Konstrukcja z nawierzchnią")}</b><small>{tr("Arena, podłoże betonowe i wykończenie z kroku Nawierzchnia.")}</small></span></label>
  <label><input type="radio" name="order-scope" checked={!!p.constructionOnly} onChange={()=>update({constructionOnly:true})}/><span><b>{tr("Sama konstrukcja")}</b><small>{tr("Arena z bramkami na Twoje istniejące boisko. Bez nawierzchni.")}</small></span></label>
 </fieldset>;
 if(p.arenaModel&&p.constructionOnly)return scope;
 return <>{p.arenaModel?scope:null}<section className="studio-concrete-base" aria-label={tr(CONCRETE_BASE_LABEL)}>
  <label><input type="checkbox" checked={p.concreteBase!==false} onChange={e=>update({concreteBase:e.target.checked?undefined:false})}/>
   <span><b>{tr("Nawierzchnia betonowa")}</b>{SHOW_PRICE_RANGE?<small>{money(net)} {tr("netto · ok.")} {areaLabel(fa)} m²{p.arenaModel?tr(" · cena osobno od konstrukcji"):""}</small>:null}<small>{tr("Płyta 12 cm z podbudową, bez wykończenia. Podstawa pod każde wykończenie z kroku Nawierzchnia. Odznacz, jeśli masz już równe podłoże betonowe.")}</small></span></label>
  <details><summary>{tr("Co obejmuje")}</summary><ul>{CONCRETE_BASE_INCLUDES.map(t=><li key={t}>{tr(t)}</li>)}</ul><p>{tr("Nie obejmuje:")}</p><ul>{CONCRETE_BASE_EXCLUDES.map(t=><li key={t}>{tr(t)}</li>)}</ul></details>
 </section></>;
}
