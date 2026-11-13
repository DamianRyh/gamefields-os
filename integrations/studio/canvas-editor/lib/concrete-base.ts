/**
 * Concrete base without finish, sold with a construction (owner price list 13.11.2026, sale prices, not costs).
 * Fixed per model: base area of the model +15% margin × 283 zł/m², rounded by the owner.
 * The same prices are published for the website in integrations/wordpress/offer/concrete-base.json.
 */
export const CONCRETE_BASE_RATE_NET_PER_M2=283;
export const CONCRETE_BASE_NET:Record<string,{areaM2:number;net:number}>={
 "w1":{areaM2:23,net:6500},
 "o1":{areaM2:32,net:9100},
 "street-field":{areaM2:33,net:9400},
 "circle-cage-1":{areaM2:29,net:8100},
 "octagon":{areaM2:52,net:14600},
 "circle-cage-2":{areaM2:32,net:9100},
 "p1":{areaM2:46,net:13000},
 "street15":{areaM2:173,net:48800},
};
export const CONCRETE_BASE_LABEL="Nawierzchnia betonowa bez wykończenia";
export const CONCRETE_BASE_INCLUDES=[
 "Korytowanie i przygotowanie gruntu",
 "Geowłóknina i podbudowa kruszywowa",
 "Płyta betonowa 12 cm (C20/25) ze spadkami i dylatacjami",
 "Siatka zbrojeniowa",
 "Powierzchnia gotowa pod wykończenie: malowanie, płytki, trawa, EPDM",
 "Zapas powierzchni +15% względem konstrukcji",
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
