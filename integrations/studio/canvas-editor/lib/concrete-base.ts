import {FINISH_AREA_M2} from './surface-finish.ts';
/**
 * Concrete base without finish, sold with a construction (owner price list 13.11.2026, sale prices, not costs).
 * Priced on the construction area +10% (owner rule 14.11.2026, earlier +15% table replaced), rounded up to 100 zł.
 * The same prices are published for the website in integrations/wordpress/offer/concrete-base.json.
 */
export const CONCRETE_BASE_RATE_NET_PER_M2=283;
/** Concrete price per model: the finish area (construction area from the model +10%, owner rule 14.11.2026) × the rate,
 * rounded up to 100 zł. Same area as every finish on top of it. */
export const CONCRETE_BASE_NET:Record<string,{areaM2:number;net:number}>=Object.fromEntries(Object.entries(FINISH_AREA_M2).map(([id,areaM2])=>[id,{areaM2,net:Math.ceil(Math.round(areaM2*CONCRETE_BASE_RATE_NET_PER_M2*100)/10000)*100}]));
export const CONCRETE_BASE_LABEL="Nawierzchnia betonowa bez wykończenia";
export const CONCRETE_BASE_INCLUDES=[
 "Korytowanie i przygotowanie gruntu",
 "Geowłóknina i podbudowa kruszywowa",
 "Płyta betonowa 12 cm (C20/25) ze spadkami i dylatacjami",
 "Siatka zbrojeniowa",
 "Powierzchnia gotowa pod wykończenie: malowanie, płytki, trawa, EPDM",
 "Zapas powierzchni +10% względem konstrukcji",
];
export const CONCRETE_BASE_EXCLUDES=[
 "Wykończenie nawierzchni (malowanie, płytki, trawa, EPDM)",
 "Skomplikowany drenaż lub wymiana gruntu głębiej niż 30 cm",
 "Utrudniony dojazd i dodatkowa logistyka",
];
/** Price of the concrete base for this construction, or null (no model, modular or not in the price list). */
export function concreteBaseNet(arenaModel:string|undefined,modular?:unknown):number|null{
 if(!arenaModel||modular)return null;
 return CONCRETE_BASE_NET[arenaModel]?.net??null;
}
