'use client';
import {EPDM_MATERIAL,PAINTED_MATERIAL,epdmNet,paintNet} from "@/lib/surface-finish";
import {SHOW_PRICE_RANGE} from "@/lib/price-range";
import type {ReactNode} from 'react';
import type {Project} from '@/lib/project';
import type {QuoteState} from '@/hooks/use-project-quote';
export function OptionPrices({children}:{project:Project;quote:QuoteState;children:ReactNode}){return children}
/** Painting has a price list (owner 13.11.2026): show the cheapest variant for this model. Everything else stays individual. */
export function OptionPrice({candidate,scope}:{candidate:Project;scope:'surface'|'construction'|'graphic'|'material'}){
 const net=!SHOW_PRICE_RANGE||scope!=='material'?null:candidate.surface===PAINTED_MATERIAL?paintNet(candidate.arenaModel,'plain',candidate.modular):candidate.surface===EPDM_MATERIAL?epdmNet(candidate.arenaModel,'standard',candidate.modular):null;
 return <small className="studio-option-price">{net!==null?`od ${new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',maximumFractionDigits:0}).format(net)} netto`:'Do indywidualnej wyceny'}</small>}
