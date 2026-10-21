/** Commercial rates are supplied by the owner, never inferred from preview colours or scene. */
export type RateCard={notice?:string;version:string;currency:"PLN";vatRate?:number;surfaces:Record<string,{materialNetPerM2:number;installationNetPerM2:number}>;patternNetPerM2:Record<string,number>;linesNet:number;brandingNetPerItem:number;arenaNet:Record<string,number>;arenaInstallationNet?:Record<string,number>;finishNet?:Record<string,number>;equipmentNet:Record<string,number>;designNet:number;transportNet:number;exclusions:string[]};
export type QuoteInput={arenaModel?:string;length:number;width:number;courtShape?:string;diameter?:number;surface:string;lines:boolean;patternFamily?:string;patternVariant?:number;shadowIntensity?:number;graphicOpacity:number;arenaDesign?:{finish:string;text:string;src?:string};objects:{kind:string;name:string;text?:string;src?:string}[]};
export type QuoteItem={id:string;label:string;quantity:number;unit:string;unitNet:number|null;totalNet:number|null;note?:string};
export type ProjectQuote={constructionPrices?:Record<string,number>;notice?:string;schemaVersion:2;status:"estimated"|"partial"|"unpriced";currency:"PLN";rateVersion:string|null;priceNet:number|null;priceGross:number|null;vatRate:number|null;knownSubtotalNet:number|null;area:number;areaLabel:string;items:QuoteItem[];exclusions:string[];assumptions:string[]};
// Shared source-derived geometry; keep this re-export for existing consumers.
import {arenaSurfaceQuantities} from './arena-geometry-data.mjs';
export {arenaSurfaceQuantities} from './arena-geometry-data.mjs';
const money=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
const rate=(v:unknown):v is number=>typeof v==="number"&&Number.isFinite(v)&&v>=0&&v<=1e8;
export function parseRateCard(raw:string|undefined):RateCard|null{
 if(!raw)return null;
 const c=JSON.parse(raw);
 if(!c||typeof c!=="object"||typeof c.version!=="string"||!c.version.trim()||c.version.length>100||c.currency!=="PLN")throw Error("Invalid rate card identity");
 if(c.notice!==undefined&&(typeof c.notice!=="string"||c.notice.length>1000))throw Error("Invalid notice");
 if(c.vatRate!==undefined&&(!rate(c.vatRate)||c.vatRate>1))throw Error("Invalid VAT");
 for(const key of ["linesNet","brandingNetPerItem","designNet","transportNet"])if(c[key]!==undefined&&!rate(c[key]))throw Error("Invalid rate");
 for(const key of ["arenaNet","arenaInstallationNet","finishNet","equipmentNet","patternNetPerM2"]){if(c[key]!==undefined&&(!c[key]||typeof c[key]!=="object"||Array.isArray(c[key])||!Object.values(c[key]).every(rate)))throw Error("Invalid rates");}
 if(c.surfaces!==undefined){if(!c.surfaces||typeof c.surfaces!=="object"||Array.isArray(c.surfaces))throw Error("Invalid surfaces");for(const s of Object.values(c.surfaces) as Record<string,unknown>[]){if(!s||typeof s!=="object"||["materialNetPerM2","installationNetPerM2"].some(k=>s[k]!==undefined&&!rate(s[k])))throw Error("Invalid surface rate");}}
 if(c.exclusions!==undefined&&(!Array.isArray(c.exclusions)||c.exclusions.length>30||!c.exclusions.every((s:unknown)=>typeof s==="string"&&s.length<500)))throw Error("Invalid exclusions");
 return {...c,surfaces:c.surfaces||{},arenaNet:c.arenaNet||{},equipmentNet:c.equipmentNet||{},patternNetPerM2:c.patternNetPerM2||{},exclusions:c.exclusions||[]};
}
export function calculateProjectQuote(p:QuoteInput,c:RateCard|null,complexity:number):ProjectQuote{
 const area=p.arenaModel&&arenaSurfaceQuantities[p.arenaModel]?arenaSurfaceQuantities[p.arenaModel].area:p.courtShape==="circle"?Math.PI*(p.diameter??p.length)**2/4:p.length*p.width;
 if(!Number.isFinite(area)||area<=0||area>2400)throw Error("Invalid quantity");
 const items:QuoteItem[]=[];
 function add(id:string,label:string,quantity:number,unit:string,value:unknown,note?:string){const r=rate(value)?value:null;items.push({id,label,quantity,unit,unitNet:r,totalNet:r===null?null:money(quantity*r),...(note?{note}:{} )});}
 const billableArea=money(area); // Same two-decimal quantity displayed to the customer.
 const material=c?.surfaces[p.surface];
 add("surface","Materiał nawierzchni",billableArea,"m²",material?.materialNetPerM2);
 add("installation","Ułożenie nawierzchni",billableArea,"m²",material?.installationNetPerM2);
 const painted=!["Sztuczna trawa 60 mm","Piasek sportowy"].includes(p.surface)&&p.graphicOpacity>0;
 if(painted)add("pattern",`Grafika nawierzchni · wykonanie ${complexity}/4`,billableArea,"m²",c?.patternNetPerM2[String(complexity)]);
 if(p.lines)add("lines","Linie sportowe",1,"kpl.",c?.linesNet);
 if(p.arenaModel){add("arena","Konstrukcja z bramkami",1,"kpl.",c?.arenaNet[p.arenaModel],"Cena modelu bazowego; obejmuje wbudowane bramki.");add("arena-installation","Montaż konstrukcji",1,"kpl.",c?.arenaInstallationNet?.[p.arenaModel]);}
 const equipment=new Map<string,number>();let bundledGoals=p.arenaModel?2:0;
 for(const o of p.objects.filter(o=>o.kind==="equipment")){
  if(o.name==="Bramka"&&bundledGoals>0){bundledGoals--;continue;}
  equipment.set(o.name,(equipment.get(o.name)||0)+1);
 }
 for(const [name,quantity] of equipment)add(`equipment:${name}`,name,quantity,"szt.",Object.hasOwn(c?.equipmentNet||{},name)?c?.equipmentNet[name]:undefined);
 const branding=p.objects.filter(o=>o.kind!=="equipment").length+(p.arenaDesign?.text?1:0)+(p.arenaDesign?.src?1:0);
 if(branding)add("branding","Logo i napisy",branding,"element",c?.brandingNetPerItem);
 if(p.arenaDesign&&p.arenaDesign.finish!=="matte")add("finish","Dopłata za wykończenie konstrukcji",1,"kpl.",c?.finishNet?.[p.arenaDesign.finish],"Dopłata do wykończenia bazowego matowego.");
 add("design","Przygotowanie projektu",1,"kpl.",c?.designNet);
 add("transport","Transport",1,"kpl.",c?.transportNet,"Założenie transportowe wymaga potwierdzenia lokalizacji.");
 const known=items.filter(i=>i.totalNet!==null);const missing=items.length-known.length;
 const subtotal=known.length?money(known.reduce((sum,i)=>sum+i.totalNet!,0)):null;
 const priceNet=missing?null:subtotal;
 const assumptions=["Orientacyjny koszt wybranego zakresu; cena końcowa po sprawdzeniu lokalizacji i podłoża.","Kolor i sceneria podglądu nie zmieniają ceny. Skala i pozycja wyposażenia nie zmieniają liczby sztuk."];
 if(p.arenaModel)assumptions.push("Ilość nawierzchni z obrysu warstwy w modelu Blender, wraz z zapasem pod konstrukcją. Grubość wizualnej warstwy nie określa technologii wykonania.","Standardowe kolory konstrukcji w cenie bazowej; wykończenie specjalne i montaż są osobnymi pozycjami.");
 return {...(c?{constructionPrices:{...c.arenaNet}}:{}),...(c?.notice?{notice:c.notice}:{}),schemaVersion:2,status:missing?(known.length?"partial":"unpriced"):"estimated",currency:"PLN",rateVersion:c?.version||null,priceNet,priceGross:priceNet!==null&&c?.vatRate!==undefined?money(priceNet*(1+c.vatRate)):null,vatRate:c?.vatRate??null,knownSubtotalNet:subtotal,area,areaLabel:p.arenaModel?"Powierzchnia nawierzchni z modelu":"Powierzchnia projektu",items,assumptions,exclusions:["Przygotowanie terenu, podbudowa, fundamenty, przyłącza i formalności nie są ujęte w tej kalkulacji.",...(c?.exclusions||[])]};
}
