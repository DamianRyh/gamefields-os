import type {RateCard} from './quote-engine';
/** Server use only. Construct a new allow-listed sales card; never spread cost metadata. */
export function salesRateCard(cost:RateCard|null,rawMargin:string|undefined):RateCard|null{
 if(!cost)return null;
 const margin=rawMargin?.trim();
 if(!margin||!/^\d+(?:\.\d+)?$/.test(margin))throw Error('Sales configuration unavailable');
 const m=Number(margin);if(!Number.isFinite(m)||m<0||m>=.95)throw Error('Sales configuration unavailable');
 const sale=(n:number)=>{const v=Math.round((n/(1-m)+Number.EPSILON)*100)/100;if(!Number.isFinite(v)||v<0||v>1e8)throw Error('Sales configuration unavailable');return v};
 const map=(v:Record<string,number>|undefined)=>Object.fromEntries(Object.entries(v||{}).map(([k,n])=>[k,sale(n)]));
 const scalar=(key:'linesNet'|'brandingNetPerItem'|'designNet'|'transportNet')=>cost[key]===undefined?{}:{[key]:sale(cost[key])};
 const surfaces=Object.fromEntries(Object.entries(cost.surfaces).map(([key,s])=>[key,{...(s.materialNetPerM2===undefined?{}:{materialNetPerM2:sale(s.materialNetPerM2)}),...(s.installationNetPerM2===undefined?{}:{installationNetPerM2:sale(s.installationNetPerM2)})}]));
 return {version:'GF-SALES-2026-10-23-v1',currency:'PLN',workingAssumptions:true,
  notice:'Ceny sprzedaży są orientacyjne. Ostateczną ofertę potwierdzimy po sprawdzeniu specyfikacji i miejsca realizacji.',
  ...(cost.vatRate===undefined?{}:{vatRate:cost.vatRate}),surfaces,arenaNet:map(cost.arenaNet),arenaInstallationNet:map(cost.arenaInstallationNet),equipmentNet:map(cost.equipmentNet),finishNet:map(cost.finishNet),patternNetPerM2:map(cost.patternNetPerM2),
  ...(cost.colorPolicy?{colorPolicy:{includedColors:cost.colorPolicy.includedColors,additionalColorNetPerM2:sale(cost.colorPolicy.additionalColorNetPerM2)}}:{}),
  ...scalar('linesNet'),...scalar('brandingNetPerItem'),...scalar('designNet'),...scalar('transportNet'),
  exclusions:['Cena dotyczy wybranego zakresu. Kotwienie, fundamenty, przygotowanie podłoża, przyłącza i formalności wymagają odrębnego ustalenia.','Transport i montaż wymagają potwierdzenia warunków lokalizacji.','Grafika i paleta wymagają potwierdzenia technologii wykonania.']
 } as RateCard;
}
