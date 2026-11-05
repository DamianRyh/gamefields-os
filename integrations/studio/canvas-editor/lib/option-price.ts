import type {ProjectQuote} from './quote-engine';
export type PriceScope='construction'|'surface'|'material';
/** An unknown affected rate never becomes zero; unrelated unknown transport can remain outside the delta. */
export function optionPriceDelta(current:ProjectQuote,candidate:ProjectQuote,scope:PriceScope):number|null{
 if(!current.rateVersion||current.rateVersion!==candidate.rateVersion)return null;
 if(current.priceNet!==null&&candidate.priceNet!==null)return Math.round((candidate.priceNet-current.priceNet)*100)/100;
 const affected=(id:string)=>scope==='material'?['surface','installation','pattern','palette-colors'].includes(id):!['transport','design'].includes(id);
 if([...current.items,...candidate.items].filter(i=>affected(i.id)).some(i=>i.totalNet===null))return null;
 const before=new Map(current.items.map(i=>[i.id,i])),after=new Map(candidate.items.map(i=>[i.id,i]));
 let delta=0;
 for(const id of new Set([...before.keys(),...after.keys()])){
  const a=before.get(id),b=after.get(id);
  if(a?.totalNet===null||b?.totalNet===null){if(!a||!b||a.quantity!==b.quantity||a.unitNet!==b.unitNet)return null;continue;}
  delta+=(b?.totalNet??0)-(a?.totalNet??0);
 }
 return Math.round(delta*100)/100;
}
