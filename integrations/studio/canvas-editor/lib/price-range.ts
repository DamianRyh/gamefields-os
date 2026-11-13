import type {ProjectQuote} from "./quote-engine";

/** Owner switch. false = Studio shows "Indywidualna wycena" again, without any amount. */
export const SHOW_PRICE_RANGE=true;

/**
 * What the customer sees (owner decision 13.11.2026: surface rates are not ready yet).
 * "construction": only the construction-with-goals price; surface, installation and transport are quoted individually.
 * "range": the full-project range around the estimate (use once surface rates are approved).
 */
export const PRICE_MODE:"construction"|"range"="construction";

/** Sale price of the construction with goals in this project, or null (no construction, modular, or not priced). */
export function constructionPrice(q:ProjectQuote|null|undefined):number|null{
 if(!SHOW_PRICE_RANGE||!q)return null;
 const arena=q.items.find(i=>i.id==="arena");
 return arena&&arena.totalNet!==null&&arena.totalNet>0?arena.totalNet:null;
}

/** Sale price of the concrete base without finish, when the customer added it to the construction; otherwise null. */
export function concreteBasePrice(q:ProjectQuote|null|undefined):number|null{
 if(!SHOW_PRICE_RANGE||!q)return null;
 const item=q.items.find(i=>i.id==="concrete-base");
 return item&&item.totalNet!==null&&item.totalNet>0?item.totalNet:null;
}

/** Finish on the concrete base (painting, or another material still to be priced); null when there is none. */
export function surfaceFinish(q:ProjectQuote|null|undefined):{label:string;net:number|null;note?:string}|null{
 if(!SHOW_PRICE_RANGE||!q)return null;
 const item=q.items.find(i=>i.id==="paint"||i.id==="finish-surface");
 return item?{label:item.label,net:item.totalNet!==null&&item.totalNet>0?item.totalNet:null,note:item.note}:null;
}

/**
 * The estimate covers the configured scope only (no site preparation, base or foundations).
 * The customer sees a range around it, not a to-the-grosz figure: a little below for simpler execution,
 * more above for typical site differences. Owner can tune both factors.
 */
export const RANGE_LOW=0.95;
export const RANGE_HIGH=1.15;

export type PriceRange={low:number;high:number|null;working:boolean};

const step=(n:number)=>n>=20000?1000:n>=2000?500:50;

export function priceRange(q:ProjectQuote|null|undefined):PriceRange|null{
 if(!SHOW_PRICE_RANGE||!q)return null;
 const working=Boolean(q.workingAssumptions);
 if(q.priceNet!==null&&q.priceNet>0){
  const lo=q.priceNet*RANGE_LOW,hi=q.priceNet*RANGE_HIGH;
  return {low:Math.floor(lo/step(lo))*step(lo),high:Math.ceil(hi/step(hi))*step(hi),working};
 }
 // Some items still need an individual quote: show only the known part as a floor.
 if(q.knownSubtotalNet!==null&&q.knownSubtotalNet>0){
  const lo=q.knownSubtotalNet;
  return {low:Math.floor(lo/step(lo))*step(lo),high:null,working};
 }
 return null;
}

const plain=(n:number)=>new Intl.NumberFormat("pl-PL",{maximumFractionDigits:0}).format(n);
const thousands=(n:number)=>new Intl.NumberFormat("pl-PL",{maximumFractionDigits:1}).format(n/1000);

/** "25–29 tys. zł netto", "od 25 tys. zł netto", or full amounts below 10 000 zł. */
export function formatPriceRange(r:PriceRange):string{
 const big=r.low>=10000;
 const f=big?thousands:plain,unit=big?" tys. zł netto":" zł netto";
 if(r.high===null)return `od ${f(r.low)}${unit}`;
 return `${f(r.low)}–${f(r.high)}${unit}`;
}
