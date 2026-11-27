"use client";
import {useStudioLanguage} from "@/components/studio-language";
import {finishAreaFor} from "@/lib/quote-engine";
import type {Project} from "@/lib/project";
import type {QuoteState} from "@/hooks/use-project-quote";
import {netForArea,PAINTED_MATERIAL,PAINT_NOTES,PAINT_VARIANTS,paintNet,type PaintVariant,EPDM_MATERIAL,EPDM_NOTES,EPDM_VARIANTS,epdmNet,type EpdmVariant,TILES_MATERIAL,TILE_NOTES,TILE_VARIANTS,tilesNet,type TileVariant,TURF_MATERIAL,TURF_NOTES,TURF_VARIANTS,turfNet,type TurfVariant,ACRYLIC_MATERIAL,ACRYLIC_NOTES,ACRYLIC_VARIANTS,acrylicNet,type AcrylicVariant,RUBBER_MATERIAL,RUBBER_NOTES,RUBBER_VARIANTS,rubberNet,type RubberVariant,MAT_MATERIAL,MAT_NOTES,MAT_VARIANTS,matNet,type MatVariant} from "@/lib/surface-finish";
import {SHOW_PRICE_RANGE} from "@/lib/price-range";


/** Painting variant on the concrete base. Default: chosen from the design; the customer can pick another. */
export function PaintVariantChoice({project:p,update,quote}:{project:Project;update:(patch:Partial<Project>)=>void;quote:QuoteState}){
 const {display:tr,numberLocale}=useStudioLanguage();
 const formatMoney=(v:number)=>new Intl.NumberFormat(numberLocale,{style:"currency",currency:"PLN",maximumFractionDigits:0}).format(v);
 const formatArea=(v:number)=>new Intl.NumberFormat(numberLocale,{maximumFractionDigits:1}).format(v);
 const fa=finishAreaFor(p);
 if(fa===null)return null;
 if(p.constructionOnly)return <p className="studio-order-note">{tr("Zamawiasz samą konstrukcję. Materiał i wzór są tylko podglądem; nawierzchnię dodasz w kroku Konstrukcja → „Co zamawiasz?”.")}</p>;
 if(p.surface===EPDM_MATERIAL)return <fieldset className="studio-concrete-base studio-paint-variant"><legend>{tr("Nawierzchnia EPDM wylewana")} · {tr("ok.")} {formatArea(fa)} m²</legend>
  {(Object.keys(EPDM_VARIANTS) as EpdmVariant[]).map(id=>{const net=netForArea(fa,EPDM_VARIANTS[id].netPerM2);return <label key={id}><input type="radio" name="epdm-variant" checked={(p.epdmVariant||"standard")===id} onChange={()=>update({epdmVariant:id==="standard"?undefined:id})}/><span><b>{tr(EPDM_VARIANTS[id].label)}</b>{SHOW_PRICE_RANGE&&net!==null?<small>{formatMoney(net)} {tr("netto")}</small>:null}<small>{EPDM_VARIANTS[id].netPerM2} {tr("zł/m²")}. {tr(EPDM_VARIANTS[id].description)}</small></span></label>})}
  {EPDM_NOTES.map(t=><p key={t}>{tr(t)}</p>)}
 </fieldset>;
 if(p.surface===TILES_MATERIAL)return <fieldset className="studio-concrete-base studio-paint-variant"><legend>{tr("Płytki sportowe PP")} · {tr("ok.")} {formatArea(fa)} m²</legend>
  {(Object.keys(TILE_VARIANTS) as TileVariant[]).map(id=>{const net=netForArea(fa,TILE_VARIANTS[id].netPerM2);return <label key={id}><input type="radio" name="tile-variant" checked={(p.tileVariant||"standard")===id} onChange={()=>update({tileVariant:id==="standard"?undefined:id})}/><span><b>{tr(TILE_VARIANTS[id].label)}</b>{SHOW_PRICE_RANGE&&net!==null?<small>{formatMoney(net)} {tr("netto")}</small>:null}<small>{TILE_VARIANTS[id].netPerM2} {tr("zł/m²")}. {tr(TILE_VARIANTS[id].description)}</small></span></label>})}
  {TILE_NOTES.map(t=><p key={t}>{tr(t)}</p>)}
 </fieldset>;
 if(p.surface===TURF_MATERIAL)return <fieldset className="studio-concrete-base studio-paint-variant"><legend>{tr("Sztuczna trawa")} · {tr("ok.")} {formatArea(fa)} m²</legend>
  {(Object.keys(TURF_VARIANTS) as TurfVariant[]).map(id=>{const net=netForArea(fa,TURF_VARIANTS[id].netPerM2);return <label key={id}><input type="radio" name="turf-variant" checked={(p.turfVariant||"standard")===id} onChange={()=>update({turfVariant:id==="standard"?undefined:id})}/><span><b>{tr(TURF_VARIANTS[id].label)}</b>{SHOW_PRICE_RANGE&&net!==null?<small>{formatMoney(net)} {tr("netto")}</small>:null}<small>{TURF_VARIANTS[id].netPerM2} {tr("zł/m²")}. {tr(TURF_VARIANTS[id].description)}</small></span></label>})}
  {TURF_NOTES.map(t=><p key={t}>{tr(t)}</p>)}
 </fieldset>;
 if(p.surface===ACRYLIC_MATERIAL)return <fieldset className="studio-concrete-base studio-paint-variant"><legend>{tr("Akryl Hard Court")} · {tr("ok.")} {formatArea(fa)} m²</legend>
  {(Object.keys(ACRYLIC_VARIANTS) as AcrylicVariant[]).map(id=>{const net=netForArea(fa,ACRYLIC_VARIANTS[id].netPerM2);return <label key={id}><input type="radio" name="acrylic-variant" checked={(p.acrylicVariant||"standard")===id} onChange={()=>update({acrylicVariant:id==="standard"?undefined:id})}/><span><b>{tr(ACRYLIC_VARIANTS[id].label)}</b>{SHOW_PRICE_RANGE&&net!==null?<small>{formatMoney(net)} {tr("netto")}</small>:null}<small>{ACRYLIC_VARIANTS[id].netPerM2} {tr("zł/m²")}. {tr(ACRYLIC_VARIANTS[id].description)}</small></span></label>})}
  {ACRYLIC_NOTES.map(t=><p key={t}>{tr(t)}</p>)}
 </fieldset>;
 if(p.surface===RUBBER_MATERIAL)return <fieldset className="studio-concrete-base studio-paint-variant"><legend>{tr("Płyty gumowe")} · {tr("ok.")} {formatArea(fa)} m²</legend>
  {(Object.keys(RUBBER_VARIANTS) as RubberVariant[]).map(id=>{const net=netForArea(fa,RUBBER_VARIANTS[id].netPerM2);return <label key={id}><input type="radio" name="rubber-variant" checked={(p.rubberVariant||"standard")===id} onChange={()=>update({rubberVariant:id==="standard"?undefined:id})}/><span><b>{tr(RUBBER_VARIANTS[id].label)}</b>{SHOW_PRICE_RANGE&&net!==null?<small>{formatMoney(net)} {tr("netto")}</small>:null}<small>{RUBBER_VARIANTS[id].netPerM2} {tr("zł/m²")}. {tr(RUBBER_VARIANTS[id].description)}</small></span></label>})}
  {RUBBER_NOTES.map(t=><p key={t}>{tr(t)}</p>)}
 </fieldset>;
 if(p.surface===MAT_MATERIAL)return <fieldset className="studio-concrete-base studio-paint-variant"><legend>{tr("Maty gumowe")} · {tr("ok.")} {formatArea(fa)} m²</legend>
  {(Object.keys(MAT_VARIANTS) as MatVariant[]).map(id=>{const net=netForArea(fa,MAT_VARIANTS[id].netPerM2);return <label key={id}><input type="radio" name="mat-variant" checked={(p.matVariant||"standard")===id} onChange={()=>update({matVariant:id==="standard"?undefined:id})}/><span><b>{tr(MAT_VARIANTS[id].label)}</b>{SHOW_PRICE_RANGE&&net!==null?<small>{formatMoney(net)} {tr("netto")}</small>:null}<small>{MAT_VARIANTS[id].netPerM2} {tr("zł/m²")}. {tr(MAT_VARIANTS[id].description)}</small></span></label>})}
  {MAT_NOTES.map(t=><p key={t}>{tr(t)}</p>)}
 </fieldset>;
 if(p.surface!==PAINTED_MATERIAL)return null;
 const auto=quote.data?.items.find(i=>i.id==="paint")?.label.replace(/^Malowanie · /,"");
 const option=(id:PaintVariant|undefined,title:string,detail:string,net:number|null)=><label key={id||"auto"}><input type="radio" name="paint-variant" checked={p.paintVariant===id} onChange={()=>update({paintVariant:id})}/><span><b>{title}</b>{SHOW_PRICE_RANGE&&net!==null?<small>{formatMoney(net)} {tr("netto")}</small>:null}<small>{detail}</small></span></label>;
 return <fieldset className="studio-concrete-base studio-paint-variant"><legend>{tr("Malowanie nawierzchni")} · {tr("ok.")} {formatArea(fa)} m²</legend>
  {option(undefined,`${tr("Dobierz do projektu")}${!p.paintVariant&&auto?`: ${tr(auto)}`:""}`,tr("Wariant wynika z grafiki i liczby kolorów w projekcie."),null)}
  {(Object.keys(PAINT_VARIANTS) as PaintVariant[]).map(id=>option(id,tr(PAINT_VARIANTS[id].label),`${PAINT_VARIANTS[id].netPerM2} ${tr("zł/m²")}. ${tr(PAINT_VARIANTS[id].description)}`,netForArea(fa,PAINT_VARIANTS[id].netPerM2)))}
  <p>{tr(PAINT_NOTES[1])}</p>
 </fieldset>;
}
