"use client";
import type {Project} from "@/lib/project";
import type {QuoteState} from "@/hooks/use-project-quote";
import {FINISH_AREA_M2,areaLabel,PAINTED_MATERIAL,PAINT_NOTES,PAINT_VARIANTS,paintNet,type PaintVariant,EPDM_MATERIAL,EPDM_NOTES,EPDM_VARIANTS,epdmNet,type EpdmVariant,TILES_MATERIAL,TILE_NOTES,TILE_VARIANTS,tilesNet,type TileVariant,TURF_MATERIAL,TURF_NOTES,TURF_VARIANTS,turfNet,type TurfVariant,ACRYLIC_MATERIAL,ACRYLIC_NOTES,ACRYLIC_VARIANTS,acrylicNet,type AcrylicVariant,RUBBER_MATERIAL,RUBBER_NOTES,RUBBER_VARIANTS,rubberNet,type RubberVariant,MAT_MATERIAL,MAT_NOTES,MAT_VARIANTS,matNet,type MatVariant} from "@/lib/surface-finish";
import {SHOW_PRICE_RANGE} from "@/lib/price-range";

const money=(v:number)=>new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN",maximumFractionDigits:0}).format(v);

/** Painting variant on the concrete base. Default: chosen from the design; the customer can pick another. */
export function PaintVariantChoice({project:p,update,quote}:{project:Project;update:(patch:Partial<Project>)=>void;quote:QuoteState}){
 if(!p.arenaModel||p.modular||!FINISH_AREA_M2[p.arenaModel])return null;
 if(p.constructionOnly)return <p className="studio-order-note">Zamawiasz samą konstrukcję. Materiał i wzór są tylko podglądem; nawierzchnię dodasz w kroku Konstrukcja → „Co zamawiasz?”.</p>;
 if(p.surface===EPDM_MATERIAL)return <fieldset className="studio-concrete-base studio-paint-variant"><legend>Nawierzchnia EPDM wylewana · ok. {areaLabel(FINISH_AREA_M2[p.arenaModel])} m²</legend>
  {(Object.keys(EPDM_VARIANTS) as EpdmVariant[]).map(id=>{const net=epdmNet(p.arenaModel,id);return <label key={id}><input type="radio" name="epdm-variant" checked={(p.epdmVariant||"standard")===id} onChange={()=>update({epdmVariant:id==="standard"?undefined:id})}/><span><b>{EPDM_VARIANTS[id].label}</b>{SHOW_PRICE_RANGE&&net!==null?<small>{money(net)} netto</small>:null}<small>{EPDM_VARIANTS[id].netPerM2} zł/m². {EPDM_VARIANTS[id].description}</small></span></label>})}
  {EPDM_NOTES.map(t=><p key={t}>{t}</p>)}
 </fieldset>;
 if(p.surface===TILES_MATERIAL&&FINISH_AREA_M2[p.arenaModel])return <fieldset className="studio-concrete-base studio-paint-variant"><legend>Płytki sportowe PP · ok. {areaLabel(FINISH_AREA_M2[p.arenaModel])} m²</legend>
  {(Object.keys(TILE_VARIANTS) as TileVariant[]).map(id=>{const net=tilesNet(p.arenaModel,id);return <label key={id}><input type="radio" name="tile-variant" checked={(p.tileVariant||"standard")===id} onChange={()=>update({tileVariant:id==="standard"?undefined:id})}/><span><b>{TILE_VARIANTS[id].label}</b>{SHOW_PRICE_RANGE&&net!==null?<small>{money(net)} netto</small>:null}<small>{TILE_VARIANTS[id].netPerM2} zł/m². {TILE_VARIANTS[id].description}</small></span></label>})}
  {TILE_NOTES.map(t=><p key={t}>{t}</p>)}
 </fieldset>;
 if(p.surface===TURF_MATERIAL&&FINISH_AREA_M2[p.arenaModel])return <fieldset className="studio-concrete-base studio-paint-variant"><legend>Sztuczna trawa · ok. {areaLabel(FINISH_AREA_M2[p.arenaModel])} m²</legend>
  {(Object.keys(TURF_VARIANTS) as TurfVariant[]).map(id=>{const net=turfNet(p.arenaModel,id);return <label key={id}><input type="radio" name="turf-variant" checked={(p.turfVariant||"standard")===id} onChange={()=>update({turfVariant:id==="standard"?undefined:id})}/><span><b>{TURF_VARIANTS[id].label}</b>{SHOW_PRICE_RANGE&&net!==null?<small>{money(net)} netto</small>:null}<small>{TURF_VARIANTS[id].netPerM2} zł/m². {TURF_VARIANTS[id].description}</small></span></label>})}
  {TURF_NOTES.map(t=><p key={t}>{t}</p>)}
 </fieldset>;
 if(p.surface===ACRYLIC_MATERIAL&&FINISH_AREA_M2[p.arenaModel])return <fieldset className="studio-concrete-base studio-paint-variant"><legend>Akryl Hard Court · ok. {areaLabel(FINISH_AREA_M2[p.arenaModel])} m²</legend>
  {(Object.keys(ACRYLIC_VARIANTS) as AcrylicVariant[]).map(id=>{const net=acrylicNet(p.arenaModel,id);return <label key={id}><input type="radio" name="acrylic-variant" checked={(p.acrylicVariant||"standard")===id} onChange={()=>update({acrylicVariant:id==="standard"?undefined:id})}/><span><b>{ACRYLIC_VARIANTS[id].label}</b>{SHOW_PRICE_RANGE&&net!==null?<small>{money(net)} netto</small>:null}<small>{ACRYLIC_VARIANTS[id].netPerM2} zł/m². {ACRYLIC_VARIANTS[id].description}</small></span></label>})}
  {ACRYLIC_NOTES.map(t=><p key={t}>{t}</p>)}
 </fieldset>;
 if(p.surface===RUBBER_MATERIAL&&FINISH_AREA_M2[p.arenaModel])return <fieldset className="studio-concrete-base studio-paint-variant"><legend>Płyty gumowe · ok. {areaLabel(FINISH_AREA_M2[p.arenaModel])} m²</legend>
  {(Object.keys(RUBBER_VARIANTS) as RubberVariant[]).map(id=>{const net=rubberNet(p.arenaModel,id);return <label key={id}><input type="radio" name="rubber-variant" checked={(p.rubberVariant||"standard")===id} onChange={()=>update({rubberVariant:id==="standard"?undefined:id})}/><span><b>{RUBBER_VARIANTS[id].label}</b>{SHOW_PRICE_RANGE&&net!==null?<small>{money(net)} netto</small>:null}<small>{RUBBER_VARIANTS[id].netPerM2} zł/m². {RUBBER_VARIANTS[id].description}</small></span></label>})}
  {RUBBER_NOTES.map(t=><p key={t}>{t}</p>)}
 </fieldset>;
 if(p.surface===MAT_MATERIAL&&FINISH_AREA_M2[p.arenaModel])return <fieldset className="studio-concrete-base studio-paint-variant"><legend>Maty gumowe · ok. {areaLabel(FINISH_AREA_M2[p.arenaModel])} m²</legend>
  {(Object.keys(MAT_VARIANTS) as MatVariant[]).map(id=>{const net=matNet(p.arenaModel,id);return <label key={id}><input type="radio" name="mat-variant" checked={(p.matVariant||"standard")===id} onChange={()=>update({matVariant:id==="standard"?undefined:id})}/><span><b>{MAT_VARIANTS[id].label}</b>{SHOW_PRICE_RANGE&&net!==null?<small>{money(net)} netto</small>:null}<small>{MAT_VARIANTS[id].netPerM2} zł/m². {MAT_VARIANTS[id].description}</small></span></label>})}
  {MAT_NOTES.map(t=><p key={t}>{t}</p>)}
 </fieldset>;
 if(p.surface!==PAINTED_MATERIAL)return null;
 const auto=quote.data?.items.find(i=>i.id==="paint")?.label.replace(/^Malowanie · /,"");
 const option=(id:PaintVariant|undefined,title:string,detail:string,net:number|null)=><label key={id||"auto"}><input type="radio" name="paint-variant" checked={p.paintVariant===id} onChange={()=>update({paintVariant:id})}/><span><b>{title}</b>{SHOW_PRICE_RANGE&&net!==null?<small>{money(net)} netto</small>:null}<small>{detail}</small></span></label>;
 return <fieldset className="studio-concrete-base studio-paint-variant"><legend>Malowanie nawierzchni · ok. {areaLabel(FINISH_AREA_M2[p.arenaModel])} m²</legend>
  {option(undefined,`Dobierz do projektu${!p.paintVariant&&auto?`: ${auto}`:""}`,"Wariant wynika z grafiki i liczby kolorów w projekcie.",null)}
  {(Object.keys(PAINT_VARIANTS) as PaintVariant[]).map(id=>option(id,PAINT_VARIANTS[id].label,`${PAINT_VARIANTS[id].netPerM2} zł/m². ${PAINT_VARIANTS[id].description}`,paintNet(p.arenaModel,id)))}
  <p>{PAINT_NOTES[1]}</p>
 </fieldset>;
}
