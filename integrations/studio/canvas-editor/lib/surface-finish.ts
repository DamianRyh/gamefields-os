import {CONCRETE_BASE_NET} from './concrete-base.ts';

/**
 * Painting on the concrete base (owner price list 13.11.2026, sale prices net, not costs).
 * Priced on the whole concrete slab of the model (the same m² as the concrete base) and rounded up to 100 zł.
 */
export type PaintVariant="plain"|"plain-granulate"|"pattern"|"pattern-advanced";
export const PAINT_VARIANTS:Record<PaintVariant,{label:string;netPerM2:number;description:string}>={
 "plain":{label:"Jednokolorowa",netPerM2:78,description:"Grunt, 2 warstwy farby sportowej i standardowe linie."},
 "plain-granulate":{label:"Jednokolorowa z granulatem",netPerM2:100,description:"Elastyczna powłoka z gumą: lepsza amortyzacja i antypoślizg, z liniami."},
 "pattern":{label:"Wzór średni",netPerM2:150,description:"4–6 kolorów, geometryczne wzory typu Signature, na bazie z granulatem."},
 "pattern-advanced":{label:"Wzór zaawansowany",netPerM2:183,description:"7 i więcej kolorów, złożone grafiki (Organic Flow, gradienty), na bazie z granulatem."},
};
export const PAINT_NOTES=["Ceny netto, do cen dolicza się VAT 23%.","Nie obejmuje napraw podłoża (wypełnianie rys, szlifowanie): wyceniamy po oględzinach."];
/** Surface material in Studio that means painting. Other materials (EPDM, tiles, turf) are priced separately later. */
export const PAINTED_MATERIAL="Akryl sportowy";
/** Bare concrete: no finish. */
export const NO_FINISH_MATERIAL="Beton sportowy";

/** Variant that matches the design: no graphic → plain, a pattern → medium, complex pattern, gradient or 7+ colours → advanced. */
export function autoPaintVariant({graphic,colors,complexity,gradient,granulate}:{graphic:boolean;colors:number;complexity:number;gradient?:boolean;granulate?:boolean}):PaintVariant{
 if(!graphic)return granulate?"plain-granulate":"plain";
 return colors>=7||complexity>=3||gradient?"pattern-advanced":"pattern";
}

export function paintNet(arenaModel:string|undefined,variant:PaintVariant,modular?:unknown):number|null{
 const area=arenaModel&&!modular?CONCRETE_BASE_NET[arenaModel]?.areaM2:undefined;
 if(!area)return null;
 return Math.ceil(area*PAINT_VARIANTS[variant].netPerM2/100)*100;
}
