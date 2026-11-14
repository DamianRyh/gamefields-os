"use client";
import type {Project} from "@/lib/project";
import type {QuoteState} from "@/hooks/use-project-quote";
import {CONCRETE_BASE_NET} from "@/lib/concrete-base";
import {PAINTED_MATERIAL,PAINT_NOTES,PAINT_VARIANTS,paintNet,type PaintVariant,EPDM_MATERIAL,EPDM_NOTES,EPDM_VARIANTS,epdmNet,type EpdmVariant,TILES_MATERIAL,TILE_AREA_M2,TILE_NOTES,TILE_VARIANTS,tilesNet,type TileVariant,TURF_MATERIAL,TURF_NOTES,TURF_VARIANTS,turfNet,type TurfVariant} from "@/lib/surface-finish";
import {SHOW_PRICE_RANGE} from "@/lib/price-range";

const money=(v:number)=>new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN",maximumFractionDigits:0}).format(v);

/** Painting variant on the concrete base. Default: chosen from the design; the customer can pick another. */
export function PaintVariantChoice({project:p,update,quote}:{project:Project;update:(patch:Partial<Project>)=>void;quote:QuoteState}){
 if(!p.arenaModel||p.modular||!CONCRETE_BASE_NET[p.arenaModel])return null;
 if(p.surface===EPDM_MATERIAL)return <fieldset className="studio-concrete-base studio-paint-variant"><legend>Nawierzchnia PU/EPDM · ok. {CONCRETE_BASE_NET[p.arenaModel].areaM2} m²</legend>
  {(Object.keys(EPDM_VARIANTS) as EpdmVariant[]).map(id=>{const net=epdmNet(p.arenaModel,id);return <label key={id}><input type="radio" name="epdm-variant" checked={(p.epdmVariant||"standard")===id} onChange={()=>update({epdmVariant:id==="standard"?undefined:id})}/><span><b>{EPDM_VARIANTS[id].label}</b>{SHOW_PRICE_RANGE&&net!==null?<small>{money(net)} netto</small>:null}<small>{EPDM_VARIANTS[id].netPerM2} zł/m². {EPDM_VARIANTS[id].description}</small></span></label>})}
  {EPDM_NOTES.map(t=><p key={t}>{t}</p>)}
 </fieldset>;
 if(p.surface===TILES_MATERIAL&&TILE_AREA_M2[p.arenaModel])return <fieldset className="studio-concrete-base studio-paint-variant"><legend>Płytki sportowe · ok. {String(TILE_AREA_M2[p.arenaModel]).replace('.',',')} m²</legend>
  {(Object.keys(TILE_VARIANTS) as TileVariant[]).map(id=>{const net=tilesNet(p.arenaModel,id);return <label key={id}><input type="radio" name="tile-variant" checked={(p.tileVariant||"standard")===id} onChange={()=>update({tileVariant:id==="standard"?undefined:id})}/><span><b>{TILE_VARIANTS[id].label}</b>{SHOW_PRICE_RANGE&&net!==null?<small>{money(net)} netto</small>:null}<small>{TILE_VARIANTS[id].netPerM2} zł/m². {TILE_VARIANTS[id].description}</small></span></label>})}
  {TILE_NOTES.map(t=><p key={t}>{t}</p>)}
 </fieldset>;
 if(p.surface===TURF_MATERIAL&&TILE_AREA_M2[p.arenaModel])return <fieldset className="studio-concrete-base studio-paint-variant"><legend>Sztuczna trawa · ok. {String(TILE_AREA_M2[p.arenaModel]).replace('.',',')} m²</legend>
  {(Object.keys(TURF_VARIANTS) as TurfVariant[]).map(id=>{const net=turfNet(p.arenaModel,id);return <label key={id}><input type="radio" name="turf-variant" checked={(p.turfVariant||"standard")===id} onChange={()=>update({turfVariant:id==="standard"?undefined:id})}/><span><b>{TURF_VARIANTS[id].label}</b>{SHOW_PRICE_RANGE&&net!==null?<small>{money(net)} netto</small>:null}<small>{TURF_VARIANTS[id].netPerM2} zł/m². {TURF_VARIANTS[id].description}</small></span></label>})}
  {TURF_NOTES.map(t=><p key={t}>{t}</p>)}
 </fieldset>;
 if(p.surface!==PAINTED_MATERIAL)return null;
 const auto=quote.data?.items.find(i=>i.id==="paint")?.label.replace(/^Malowanie · /,"");
 const option=(id:PaintVariant|undefined,title:string,detail:string,net:number|null)=><label key={id||"auto"}><input type="radio" name="paint-variant" checked={p.paintVariant===id} onChange={()=>update({paintVariant:id})}/><span><b>{title}</b>{SHOW_PRICE_RANGE&&net!==null?<small>{money(net)} netto</small>:null}<small>{detail}</small></span></label>;
 return <fieldset className="studio-concrete-base studio-paint-variant"><legend>Malowanie nawierzchni · ok. {CONCRETE_BASE_NET[p.arenaModel].areaM2} m²</legend>
  {option(undefined,`Dobierz do projektu${!p.paintVariant&&auto?`: ${auto}`:""}`,"Wariant wynika z grafiki i liczby kolorów w projekcie.",null)}
  {(Object.keys(PAINT_VARIANTS) as PaintVariant[]).map(id=>option(id,PAINT_VARIANTS[id].label,`${PAINT_VARIANTS[id].netPerM2} zł/m². ${PAINT_VARIANTS[id].description}`,paintNet(p.arenaModel,id)))}
  <p>{PAINT_NOTES[1]}</p>
 </fieldset>;
}
