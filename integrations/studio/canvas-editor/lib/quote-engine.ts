import {requiredSportEquipment} from './primary-sports.ts';
import {sportSurface} from './sport-surfaces.ts';
import {modularGeometry} from './studio-modular.ts';
import {creativeLineOptions,type DecorativeLineStyle} from './creative-lines.ts';
/** Commercial rates are supplied by the owner, never inferred from preview colours or scene. */
export type RateCard={workingAssumptions?:boolean;notice?:string;version:string;currency:"PLN";vatRate?:number;surfaces:Record<string,{materialNetPerM2:number;installationNetPerM2:number}>;patternNetPerM2:Record<string,number>;colorPolicy?:{includedColors:number;additionalColorNetPerM2:number};linesNet:number;brandingNetPerItem:number;arenaNet:Record<string,number>;arenaInstallationNet?:Record<string,number>;finishNet?:Record<string,number>;equipmentNet:Record<string,number>;designNet:number;transportNet:number;exclusions:string[]};
export type QuoteInput={matVariant?:MatVariant;rubberVariant?:RubberVariant;acrylicVariant?:AcrylicVariant;turfVariant?:TurfVariant;tileVariant?:TileVariant;epdmVariant?:EpdmVariant;paintVariant?:PaintVariant;gradientEnabled?:boolean;concreteBase?:boolean;decorativeLineStyle?:DecorativeLineStyle;surfaceModel?:import("./sport-surfaces").SurfaceModel;modular?:import("./project").StudioModules;arenaModel?:string;length:number;width:number;courtShape?:string;diameter?:number;surface:string;lines:boolean;patternFamily?:string;patternVariant?:number;shadowIntensity?:number;graphicOpacity:number;base?:string;zone?:string;outside?:string;patternPalette?:string;arenaDesign?:{finish:string;text:string;src?:string};objects:{kind:string;name:string;text?:string;src?:string;asset?:{colors?:string[]}}[]};
export type QuoteItem={id:string;label:string;quantity:number;unit:string;unitNet:number|null;totalNet:number|null;note?:string};
export type ProjectQuote={workingAssumptions?:boolean;constructionPrices?:Record<string,number>;notice?:string;schemaVersion:2;status:"estimated"|"partial"|"unpriced";currency:"PLN";rateVersion:string|null;priceNet:number|null;priceGross:number|null;vatRate:number|null;knownSubtotalNet:number|null;area:number;areaLabel:string;items:QuoteItem[];exclusions:string[];assumptions:string[]};
// Shared source-derived geometry; keep this re-export for existing consumers.
import {projectPatternColors} from './pattern-library.ts';
import {hasSurfaceAssets,surfaceAssetColors} from './plain-surface.ts';
import {arenaSurfaceQuantities} from './arena-geometry-data.mjs';
import {PAINTED_MATERIAL,NO_FINISH_MATERIAL,PAINT_VARIANTS,autoPaintVariant,paintNet,type PaintVariant,EPDM_MATERIAL,EPDM_VARIANTS,epdmNet,type EpdmVariant,TILES_MATERIAL,TILE_VARIANTS,TILE_AREA_M2,tilesNet,type TileVariant,TURF_MATERIAL,TURF_VARIANTS,turfNet,type TurfVariant,ACRYLIC_MATERIAL,ACRYLIC_VARIANTS,acrylicNet,type AcrylicVariant,RUBBER_MATERIAL,RUBBER_VARIANTS,rubberNet,type RubberVariant,MAT_MATERIAL,MAT_VARIANTS,matNet,type MatVariant} from './surface-finish.ts';
import {surfaceLabel} from './surface-materials.ts';
import {CONCRETE_BASE_LABEL,CONCRETE_BASE_NET,CONCRETE_BASE_RATE_NET_PER_M2,concreteBaseNet} from './concrete-base.ts';
export {arenaSurfaceQuantities} from './arena-geometry-data.mjs';
const money=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
const rate=(v:unknown):v is number=>typeof v==="number"&&Number.isFinite(v)&&v>=0&&v<=1e8;
export function parseRateCard(raw:string|undefined):RateCard|null{
 if(!raw)return null;
 const c=JSON.parse(raw);
 if(!c||typeof c!=="object"||typeof c.version!=="string"||!c.version.trim()||c.version.length>100||c.currency!=="PLN")throw Error("Invalid rate card identity");
 if(c.workingAssumptions!==undefined&&typeof c.workingAssumptions!=="boolean")throw Error("Invalid working assumptions status");
 if(c.notice!==undefined&&(typeof c.notice!=="string"||c.notice.length>1000))throw Error("Invalid notice");
 if(c.vatRate!==undefined&&(!rate(c.vatRate)||c.vatRate>1))throw Error("Invalid VAT");
 for(const key of ["linesNet","brandingNetPerItem","designNet","transportNet"])if(c[key]!==undefined&&!rate(c[key]))throw Error("Invalid rate");
 for(const key of ["arenaNet","arenaInstallationNet","finishNet","equipmentNet","patternNetPerM2"]){if(c[key]!==undefined&&(!c[key]||typeof c[key]!=="object"||Array.isArray(c[key])||!Object.values(c[key]).every(rate)))throw Error("Invalid rates");}
 if(c.colorPolicy!==undefined){const v=c.colorPolicy;if(!v||typeof v!=="object"||Array.isArray(v)||!Number.isInteger(v.includedColors)||v.includedColors<1||v.includedColors>6||!rate(v.additionalColorNetPerM2))throw Error("Invalid color policy");}
 if(c.surfaces!==undefined){if(!c.surfaces||typeof c.surfaces!=="object"||Array.isArray(c.surfaces))throw Error("Invalid surfaces");for(const s of Object.values(c.surfaces) as Record<string,unknown>[]){if(!s||typeof s!=="object"||["materialNetPerM2","installationNetPerM2"].some(k=>s[k]!==undefined&&!rate(s[k])))throw Error("Invalid surface rate");}}
 if(c.exclusions!==undefined&&(!Array.isArray(c.exclusions)||c.exclusions.length>30||!c.exclusions.every((s:unknown)=>typeof s==="string"&&s.length<500)))throw Error("Invalid exclusions");
 return {...c,surfaces:c.surfaces||{},arenaNet:c.arenaNet||{},equipmentNet:c.equipmentNet||{},patternNetPerM2:c.patternNetPerM2||{},exclusions:c.exclusions||[]};
}
export function calculateProjectQuote(p:QuoteInput,c:RateCard|null,complexity:number):ProjectQuote{
 const selectedSurface=sportSurface(p.surfaceModel);
 const area=selectedSurface?selectedSurface.length*selectedSurface.width:modularGeometry({arenaModel:p.arenaModel as import("./project").Project["arenaModel"],modular:p.modular})?.area??(p.arenaModel&&arenaSurfaceQuantities[p.arenaModel]?arenaSurfaceQuantities[p.arenaModel].area:p.courtShape==="circle"?Math.PI*(p.diameter??p.length)**2/4:p.length*p.width);
 if(!Number.isFinite(area)||area<=0||area>2400)throw Error("Invalid quantity");
 const items:QuoteItem[]=[];
 function add(id:string,label:string,quantity:number,unit:string,value:unknown,note?:string){const r=rate(value)?value:null;items.push({id,label,quantity,unit,unitNet:r,totalNet:r===null?null:money(quantity*r),...(note?{note}:{} )});}
 const billableArea=money(area); // Same two-decimal quantity displayed to the customer.
 const material=c?.surfaces[p.surface];
 add("surface","Materiał nawierzchni",billableArea,"m²",material?.materialNetPerM2);
 add("installation","Ułożenie nawierzchni",billableArea,"m²",material?.installationNetPerM2);
 const painted=!["Sztuczna trawa 60 mm","Piasek sportowy"].includes(p.surface)&&p.graphicOpacity>0;
 if(painted)add("pattern",`Grafika nawierzchni · wykonanie ${complexity}/4`,billableArea,"m²",c?.patternNetPerM2[String(complexity)]);
 if(painted&&c?.colorPolicy){
  const own=projectPatternColors(p);
  // Budget selected palette, not visible pixel colours or an approved paint recipe.
  // Elements from the Grafika library sit on a single-colour surface: budget the base plus the elements' colours.
  const selected=hasSurfaceAssets(p)?[p.base,...surfaceAssetColors(p),...(!p.arenaModel?[p.outside]:[])]:[p.base,p.zone,own[0],own[2],own[3],...(!p.arenaModel?[p.outside]:[])];
  const colors=new Set(selected.filter((v):v is string=>typeof v==="string"&&/^#[0-9a-f]{6}$/i.test(v)).map(v=>v.toLowerCase()));
  const extra=Math.max(0,colors.size-c.colorPolicy.includedColors);
  add("palette-colors",`Paleta projektu · ${colors.size} kolorów · ${extra} ponad pakiet`,billableArea,"m²",money(extra*c.colorPolicy.additionalColorNetPerM2),`Budżet wybranej palety, nie pomiar widocznych kolorów ani receptura farb. Pakiet: ${c.colorPolicy.includedColors}; każdy dodatkowy kolor: ${c.colorPolicy.additionalColorNetPerM2} PLN/m². Linie, logo, napisy, gradienty i cienie rozliczane lub weryfikowane oddzielnie.`);
 }
 if(p.lines)add("lines","Linie sportowe",1,"kpl.",c?.linesNet);
 // Decorative strokes have no approved execution rate; never treat the sport-line price as their price.
 if(p.decorativeLineStyle&&p.decorativeLineStyle!=="none"){
  const name=creativeLineOptions.find(option=>option.id===p.decorativeLineStyle)?.name||"Wzór indywidualny";
  add("decorative-lines",`Linie dekoracyjne · ${name}`,1,"kpl.",undefined,"Wykonanie dekoracyjnych linii wymaga indywidualnej wyceny. Nie jest ujęte w cenie standardowych linii sportowych ani grafiki nawierzchni.");
 }
 if(p.arenaModel){add("arena","Konstrukcja z bramkami",1,"kpl.",p.modular?undefined:c?.arenaNet[p.arenaModel],p.modular?"Konstrukcja modułowa wymaga wyceny z liczby komponentów.":"Cena modelu bazowego; obejmuje wbudowane bramki.");add("arena-installation","Montaż konstrukcji",1,"kpl.",p.modular?undefined:c?.arenaInstallationNet?.[p.arenaModel]);}
 if(p.arenaModel&&p.concreteBase!==false){const net=concreteBaseNet(p.arenaModel,p.modular);add("concrete-base",CONCRETE_BASE_LABEL,1,"kpl.",net??undefined,net===null?"Podłoże pod konstrukcję modułową wyceniamy indywidualnie.":`Około ${CONCRETE_BASE_NET[p.arenaModel].areaM2} m² (z zapasem 15%), ${CONCRETE_BASE_RATE_NET_PER_M2} zł/m² netto. Bez wykończenia.`);}
 if(p.arenaModel&&!p.modular&&CONCRETE_BASE_NET[p.arenaModel]){
  // Finish on the concrete base: painting priced from the owner list, other materials still individual.
  if(p.surface===PAINTED_MATERIAL){
   const own=projectPatternColors(p);const assets=hasSurfaceAssets(p);
   const colors=new Set((assets?[p.base,...surfaceAssetColors(p)]:[p.base,p.zone,own[0],own[2],own[3]]).filter((v):v is string=>typeof v==="string"&&/^#[0-9a-f]{6}$/i.test(v)).map(v=>v.toLowerCase())).size;
   const variant=p.paintVariant||autoPaintVariant({graphic:assets||p.graphicOpacity>0,colors,complexity,gradient:p.gradientEnabled});
   add("paint",`Malowanie · ${PAINT_VARIANTS[variant].label}`,1,"kpl.",paintNet(p.arenaModel,variant)??undefined,`Około ${CONCRETE_BASE_NET[p.arenaModel].areaM2} m² × ${PAINT_VARIANTS[variant].netPerM2} zł/m² netto. ${PAINT_VARIANTS[variant].description}${p.paintVariant?"":" Wariant dobrany do projektu."}`);
  }else if(p.surface===EPDM_MATERIAL){
   const variant=p.epdmVariant||"standard";
   add("epdm",`Nawierzchnia PU/EPDM · ${EPDM_VARIANTS[variant].label}`,1,"kpl.",epdmNet(p.arenaModel,variant)??undefined,`Około ${CONCRETE_BASE_NET[p.arenaModel].areaM2} m² × ${EPDM_VARIANTS[variant].netPerM2} zł/m² netto. ${EPDM_VARIANTS[variant].description}`);
  }else if(p.surface===TILES_MATERIAL&&TILE_AREA_M2[p.arenaModel]){
   const variant=p.tileVariant||"standard";
   add("tiles",`Płytki sportowe · ${TILE_VARIANTS[variant].label}`,1,"kpl.",tilesNet(p.arenaModel,variant)??undefined,`Około ${String(TILE_AREA_M2[p.arenaModel]).replace('.',',')} m² × ${TILE_VARIANTS[variant].netPerM2} zł/m² netto. ${TILE_VARIANTS[variant].description}`);
  }else if(p.surface===TURF_MATERIAL&&TILE_AREA_M2[p.arenaModel]){
   const variant=p.turfVariant||"standard";
   add("turf",`Sztuczna trawa · ${TURF_VARIANTS[variant].label}`,1,"kpl.",turfNet(p.arenaModel,variant)??undefined,`Około ${String(TILE_AREA_M2[p.arenaModel]).replace('.',',')} m² × ${TURF_VARIANTS[variant].netPerM2} zł/m² netto. ${TURF_VARIANTS[variant].description}`);
  }else if(p.surface===ACRYLIC_MATERIAL&&TILE_AREA_M2[p.arenaModel]){
   const variant=p.acrylicVariant||"standard";
   add("acrylic",`Akryl Hard Court · ${ACRYLIC_VARIANTS[variant].label}`,1,"kpl.",acrylicNet(p.arenaModel,variant)??undefined,`Około ${String(TILE_AREA_M2[p.arenaModel]).replace('.',',')} m² × ${ACRYLIC_VARIANTS[variant].netPerM2} zł/m² netto. ${ACRYLIC_VARIANTS[variant].description}`);
  }else if(p.surface===RUBBER_MATERIAL&&TILE_AREA_M2[p.arenaModel]){
   const variant=p.rubberVariant||"standard";
   add("rubber",`Płyty gumowe · ${RUBBER_VARIANTS[variant].label}`,1,"kpl.",rubberNet(p.arenaModel,variant)??undefined,`Około ${String(TILE_AREA_M2[p.arenaModel]).replace('.',',')} m² × ${RUBBER_VARIANTS[variant].netPerM2} zł/m² netto. ${RUBBER_VARIANTS[variant].description}`);
  }else if(p.surface===MAT_MATERIAL&&TILE_AREA_M2[p.arenaModel]){
   const variant=p.matVariant||"standard";
   add("mats",`Maty gumowe · ${MAT_VARIANTS[variant].label}`,1,"kpl.",matNet(p.arenaModel,variant)??undefined,`Około ${String(TILE_AREA_M2[p.arenaModel]).replace('.',',')} m² × ${MAT_VARIANTS[variant].netPerM2} zł/m² netto. ${MAT_VARIANTS[variant].description}`);
  }else if(p.surface!==NO_FINISH_MATERIAL)add("finish-surface",`Wykończenie · ${surfaceLabel(p.surface)}`,1,"kpl.",undefined,"Cenę tego wykończenia podamy indywidualnie.");
 }
 const equipment=new Map<string,number>(requiredSportEquipment(p).map(item=>[item.name,item.quantity]));let bundledGoals=p.arenaModel?2:0;
 for(const o of p.objects.filter(o=>o.kind==="equipment")){
  if(o.name==="Bramka"&&bundledGoals>0){bundledGoals--;continue;}
  equipment.set(o.name,(equipment.get(o.name)||0)+1);
 }
 for(const [name,quantity] of equipment)add(`equipment:${name}`,name,quantity,"szt.",Object.hasOwn(c?.equipmentNet||{},name)?c?.equipmentNet[name]:undefined);
 const branding=p.objects.filter(o=>o.kind!=="equipment").length+(!p.surfaceModel||p.arenaModel?((p.arenaDesign?.text?1:0)+(p.arenaDesign?.src?1:0)):0);
 if(branding)add("branding","Logo i napisy",branding,"element",c?.brandingNetPerItem);
 if((!p.surfaceModel||p.arenaModel)&&p.arenaDesign&&p.arenaDesign.finish!=="matte")add("finish","Dopłata za wykończenie konstrukcji",1,"kpl.",c?.finishNet?.[p.arenaDesign.finish],"Dopłata do wykończenia bazowego matowego.");
 add("design","Przygotowanie projektu",1,"kpl.",c?.designNet);
 add("transport","Transport",1,"kpl.",c?.transportNet,"Założenie transportowe wymaga potwierdzenia lokalizacji.");
 const known=items.filter(i=>i.totalNet!==null);const missing=items.length-known.length;
 const subtotal=known.length?money(known.reduce((sum,i)=>sum+i.totalNet!,0)):null;
 const priceNet=missing?null:subtotal;
 const assumptions=["Orientacyjny koszt wybranego zakresu; cena końcowa po sprawdzeniu lokalizacji i podłoża.",c?.colorPolicy?"Zmiana odcienia przy tej samej liczbie kolorów nie zmienia dopłaty. Liczymy unikalne kolory wybranej palety, nie widoczne piksele; projekt wykonawczy może wymagać innego budżetu. Sceneria oraz pozycja wyposażenia nie zmieniają ceny.":"Kolor i sceneria podglądu nie zmieniają ceny. Skala i pozycja wyposażenia nie zmieniają liczby sztuk."];
 if(p.surfaceModel)assumptions.push("Ilość materiału obejmuje całą niezależną płytę wraz z przyjętymi wybiegami. Wizualna grubość 20 cm nie określa technologii wykonania ani kosztu podbudowy.");
 if(p.modular)assumptions.push("Układ modułowy: konstrukcja i montaż wymagają osobnej wyceny. Ceny modelu bazowego nie są sumą tego wariantu.");
 if(p.arenaModel&&!p.surfaceModel)assumptions.push("Ilość nawierzchni z obrysu warstwy w modelu Blender, wraz z zapasem pod konstrukcją. Grubość wizualnej warstwy nie określa technologii wykonania.","Standardowe kolory konstrukcji w cenie bazowej; wykończenie specjalne i montaż są osobnymi pozycjami.");
 return {...(c?.workingAssumptions?{workingAssumptions:true}:{}),...(c?{constructionPrices:{...c.arenaNet}}:{}),...(c?.notice?{notice:c.notice}:{}),schemaVersion:2,status:missing?(known.length?"partial":"unpriced"):"estimated",currency:"PLN",rateVersion:c?.version||null,priceNet,priceGross:priceNet!==null&&c?.vatRate!==undefined?money(priceNet*(1+c.vatRate)):null,vatRate:c?.vatRate??null,knownSubtotalNet:subtotal,area,areaLabel:p.surfaceModel?"Powierzchnia niezależnej nawierzchni 20 cm":p.modular?"Powierzchnia nawierzchni konfiguracji modułowej":p.arenaModel?"Powierzchnia nawierzchni z modelu":"Powierzchnia projektu",items,assumptions,exclusions:[...(p.arenaModel&&p.concreteBase!==false&&concreteBaseNet(p.arenaModel,p.modular)!==null?["Nawierzchnia betonowa obejmuje przygotowanie gruntu, podbudowę i płytę 12 cm. Nie obejmuje wykończenia, skomplikowanego drenażu, wymiany gruntu głębiej niż 30 cm ani utrudnionego dojazdu.","Przyłącza i formalności nie są ujęte w tej kalkulacji."]:["Przygotowanie terenu, podbudowa, fundamenty, przyłącza i formalności nie są ujęte w tej kalkulacji."]),...(c?.exclusions||[])]};
}
