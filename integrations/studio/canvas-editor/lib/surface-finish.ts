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

/**
 * Polyurethane surface PU/EPDM on the concrete base (owner price list 14.11.2026, sale prices net, not costs).
 * Same area and rounding as painting. Concrete base, sports lines and transport are separate items.
 */
export type EpdmVariant="standard"|"standard-plus"|"premium";
export const EPDM_MATERIAL="EPDM";
export const EPDM_VARIANTS:Record<EpdmVariant,{label:string;netPerM2:number;description:string}>={
 "standard":{label:"Standard (natrysk)",netPerM2:250,description:"System natryskowy: baza SBR + natrysk EPDM, min. 13 mm, przepuszczalny. Boiska wielofunkcyjne, szkoły, rekreacja. Trwałość 8–12 lat."},
 "standard-plus":{label:"Standard+ (system 2S)",netPerM2:317,description:"Dwie warstwy: grubsza baza SBR + EPDM, 14–16 mm, lepsza amortyzacja. Intensywne użytkowanie. Trwałość 10–15 lat."},
 "premium":{label:"Premium (sandwich / EPDM premium)",netPerM2:400,description:"System sandwich lub EPDM premium, 13–16 mm, wysoka odporność na ścieranie, strefy wielokolorowe. Trwałość 12–20 lat."},
};
export const EPDM_NOTES=["Zgodnie z PN-EN 14877. Układana na równym podłożu betonowym ze spadkami 0,5–1%.","Linie sportowe (farba PU), transport i przygotowanie podłoża wyceniamy osobno. Montaż w temperaturze 10–25°C, utwardzanie 24–72 h."];

export function epdmNet(arenaModel:string|undefined,variant:EpdmVariant,modular?:unknown):number|null{
 const area=arenaModel&&!modular?CONCRETE_BASE_NET[arenaModel]?.areaM2:undefined;
 if(!area)return null;
 return Math.ceil(area*EPDM_VARIANTS[variant].netPerM2/100)*100;
}

/**
 * Modular sports tiles (PP interlocking, laid loose on the concrete base). Owner price list 14.11.2026, sale prices net.
 * Area per model from the owner's table (the tiled playing area, smaller than the concrete slab), rounded up to 100 zł.
 */
export type TileVariant="standard"|"standard-plus"|"premium";
export const TILES_MATERIAL="Moduły sportowe";
export const TILE_VARIANTS:Record<TileVariant,{label:string;netPerM2:number;description:string}>={
 "standard":{label:"Standard",netPerM2:275,description:"Płytki PP 15–18 mm, outdoor multi-sport, podstawowe kolory i linie, drenaż."},
 "standard-plus":{label:"Standard+",netPerM2:325,description:"Płytki PP 18–19 mm, lepsza amortyzacja i odporność UV, więcej kolorów oznakowania."},
 "premium":{label:"Premium",netPerM2:400,description:"Płytki PP 19 mm+, wysoka amortyzacja, gwarancja 5–10 lat."},
};
export const TILE_AREA_M2:Record<string,number>={"w1":19.6,"o1":28.3,"p1":39.8,"street15":150,"circle-cage-1":25,"circle-cage-2":28,"street-field":28.9,"octagon":45};
export const TILE_NOTES=["Cena obejmuje płytki, montaż, profile krawędziowe i podstawowe oznakowanie linii.","Płytki układamy luzem na płaskim betonie ze spadkami, bez klejenia. Podłoże betonowe wyceniamy osobno."];

/** Internal quantity take-off only, never shown to the customer (owner 14.11.2026): 11 tiles per m² (30,5 × 30,5 cm,
 * Gerflor PowerGame+ type); order +5–8% for cuts and waste. The customer sees only the m² of the surface. */
export const TILES_PER_M2=11;
export const TILE_SIZE_LABEL="30,5 × 30,5 cm";
export function tileCount(area:number){return Math.ceil(Math.round(area*TILES_PER_M2*100)/100);}

export function tilesNet(arenaModel:string|undefined,variant:TileVariant,modular?:unknown):number|null{
 const area=arenaModel&&!modular?TILE_AREA_M2[arenaModel]:undefined;
 if(!area)return null;
 return Math.ceil(area*TILE_VARIANTS[variant].netPerM2/100)*100;
}

/**
 * Artificial turf glued on the concrete base. Owner price list 14.11.2026, sale prices net.
 * Same playing area per model as the tiles (TILE_AREA_M2), rounded up to 100 zł.
 */
export type TurfVariant="standard"|"standard-plus"|"premium";
export const TURF_MATERIAL="Sztuczna trawa 60 mm";
export const TURF_VARIANTS:Record<TurfVariant,{label:string;netPerM2:number;description:string}>={
 "standard":{label:"Standard",netPerM2:167,description:"Trawa syntetyczna z montażem na betonie: klejenie pasów, podstawowy zasyp, szczotkowanie i podstawowe linie."},
 "standard-plus":{label:"Standard+",netPerM2:225,description:"Trawa wyższej klasy: gęstsze włókno i większa odporność na intensywne użytkowanie. Montaż jak w Standard."},
 "premium":{label:"Premium",netPerM2:292,description:"Trawa najwyższej klasy do najbardziej wymagających obiektów. Montaż jak w Standard."},
};
export const TURF_NOTES=["Cena obejmuje trawę, montaż na betonie (klejenie pasów), podstawowy zasyp, szczotkowanie i podstawowe linie.","Podłoże betonowe wyceniamy osobno."];

export function turfNet(arenaModel:string|undefined,variant:TurfVariant,modular?:unknown):number|null{
 const area=arenaModel&&!modular?TILE_AREA_M2[arenaModel]:undefined;
 if(!area)return null;
 return Math.ceil(Math.round(area*TURF_VARIANTS[variant].netPerM2*100)/10000)*100;
}

/**
 * Acrylic hard court system on the concrete base (owner price list 14.11.2026, sale prices net).
 * Separate material from painting. Playing area per model as tiles and turf, rounded up to 100 zł.
 */
export type AcrylicVariant="standard"|"standard-plus"|"premium";
export const ACRYLIC_MATERIAL="Akryl Hard Court";
export const ACRYLIC_VARIANTS:Record<AcrylicVariant,{label:string;netPerM2:number;description:string}>={
 "standard":{label:"Standard (Hard Court)",netPerM2:200,description:"Klasyczny hard court: 4–6 warstw, ok. 1–2 mm, twardy i szybki. Korty tenisowe, koszykówka, boiska wielofunkcyjne."},
 "standard-plus":{label:"Standard+ (wzmocniony)",netPerM2:267,description:"Więcej warstw i lekka amortyzacja, ok. 2–3,5 mm. Lepszy komfort przy intensywnym użytkowaniu."},
 "premium":{label:"Premium (Cushioned)",netPerM2:342,description:"Z warstwami gumowymi, 4–8 mm: wysoka amortyzacja i ochrona stawów, klasa systemów Plexipave / Laykold."},
};
export const ACRYLIC_NOTES=["Cena obejmuje nawierzchnię akrylową na gotowym betonie i podstawowe linie.","Przygotowanie podłoża (frezowanie, naprawa pęknięć) i transport wyceniamy osobno."];

export function acrylicNet(arenaModel:string|undefined,variant:AcrylicVariant,modular?:unknown):number|null{
 const area=arenaModel&&!modular?TILE_AREA_M2[arenaModel]:undefined;
 if(!area)return null;
 return Math.ceil(Math.round(area*ACRYLIC_VARIANTS[variant].netPerM2*100)/10000)*100;
}
