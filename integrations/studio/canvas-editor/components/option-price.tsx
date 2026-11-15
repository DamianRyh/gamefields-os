'use client';
import {EPDM_MATERIAL,PAINTED_MATERIAL,TILES_MATERIAL,TURF_MATERIAL,ACRYLIC_MATERIAL,RUBBER_MATERIAL,MAT_MATERIAL,PAINT_VARIANTS,EPDM_VARIANTS,TILE_VARIANTS,TURF_VARIANTS,ACRYLIC_VARIANTS,RUBBER_VARIANTS,MAT_VARIANTS,netForArea} from "@/lib/surface-finish";
import {finishAreaFor} from "@/lib/quote-engine";
import {SHOW_PRICE_RANGE} from "@/lib/price-range";
import type {ReactNode} from 'react';
import type {Project} from '@/lib/project';
import type {QuoteState} from '@/hooks/use-project-quote';
export function OptionPrices({children}:{project:Project;quote:QuoteState;children:ReactNode}){return children}
/** Painting has a price list (owner 13.11.2026): show the cheapest variant for this model. Everything else stays individual. */
export function OptionPrice({candidate,scope}:{candidate:Project;scope:'surface'|'construction'|'graphic'|'material'}){
 const fa=!SHOW_PRICE_RANGE||scope!=='material'?null:finishAreaFor(candidate);
 const rate:Record<string,number>={[PAINTED_MATERIAL]:PAINT_VARIANTS.plain.netPerM2,[EPDM_MATERIAL]:EPDM_VARIANTS.standard.netPerM2,[TILES_MATERIAL]:TILE_VARIANTS.standard.netPerM2,[TURF_MATERIAL]:TURF_VARIANTS.standard.netPerM2,[ACRYLIC_MATERIAL]:ACRYLIC_VARIANTS.standard.netPerM2,[RUBBER_MATERIAL]:RUBBER_VARIANTS.standard.netPerM2,[MAT_MATERIAL]:MAT_VARIANTS.standard.netPerM2};
 const net=fa!==null&&!candidate.constructionOnly&&rate[candidate.surface]?netForArea(fa,rate[candidate.surface]):null;
 return <small className="studio-option-price">{net!==null?`od ${new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',maximumFractionDigits:0}).format(net)} netto`:'Do indywidualnej wyceny'}</small>}
