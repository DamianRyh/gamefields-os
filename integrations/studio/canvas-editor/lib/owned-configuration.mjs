import {FAMILIES,normalize,assemble} from './vendor/owned-modular/engine.mjs';
import evidence from './vendor/owned-modular/evidence.json' with {type:'json'};
import {componentRegistry,componentBill} from './component-registry.mjs';
const schema='GF-OWNED-ASSEMBLY-1';
const familyMap={p1:'F01',o1:'F02',w1:'F03',street15:'F04','circle-cage':'F05','street-field':'F06',octagon:'F07'};
const configKeys=['schema','family','mode','part','color','long','short','goals','entries','levels'];
function object(value){return value!==null&&typeof value==='object'&&!Array.isArray(value)&&(Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null)}
export function inspectOwnedConfiguration(input){
 if(typeof input==='string'){if(new TextEncoder().encode(input).length>100000)throw Error('Plik konfiguracji OS może mieć maksymalnie 100 kB.');try{input=JSON.parse(input)}catch{throw Error('Nieprawidłowy plik JSON konfiguracji OS.')}}
 if(!object(input)||input.schema!==schema||Object.keys(input).some(k=>!['schema','config','bom'].includes(k)))throw Error('Wybierz eksport GF-OWNED-ASSEMBLY-1 z Systemu modułowego.');
 const c=input.config;
 if(!object(c)||configKeys.some(k=>!Object.hasOwn(c,k))||Object.keys(c).some(k=>!configKeys.includes(k))||c.schema!==schema)throw Error('Niepełna lub nieobsługiwana konfiguracja OS. Pobierz ponownie plik z Systemu modułowego.');
 if(typeof c.family!=='string'||!Object.hasOwn(FAMILIES,c.family)||!['assembly','part'].includes(c.mode)||typeof c.part!=='string'||typeof c.color!=='string'||!/^#[a-f0-9]{6}$/i.test(c.color))throw Error('Nieprawidłowa rodzina, tryb, komponent lub kolor OS.');
 for(const [key,min,max] of [['long',2,10],['short',2,8],['goals',0,2],['entries',0,2],['levels',1,2]])if(!Number.isInteger(c[key])||c[key]<min||c[key]>max)throw Error('Niedozwolony parametr OS: '+key+'.');
 const config=normalize(c);
 if(FAMILIES[config.family].kind==='source'&&config.mode==='assembly')throw Error('Ta rodzina ma model całości bez potwierdzonego podziału na instancje. W OS wybierz tryb Komponent.');
 if(evidence.registryRevision!==componentRegistry.revision)throw Error('Niezgodna rewizja rejestru inspektora.');
 const plan=assemble(config),family=familyMap[config.family];
 const instances=plan.instances.map(instance=>{
  const matches=componentRegistry.articles.filter(a=>a.family===family&&a.alias===instance.asset);
  if(matches.length!==1)throw Error('Brak jednoznacznego artykułu: '+instance.asset);
  const a=matches[0],verified=evidence.checkedRuntimeAssets.find(e=>e.family===config.family&&e.alias===instance.asset);
  if(!verified||verified.articleId!==a.articleId||verified.sourceRevision!==a.sourceRevision)throw Error('Niezgodna rewizja źródła komponentu: '+instance.asset);
  return {id:instance.id,articleId:a.articleId,revision:a.revision,sourceRevision:a.sourceRevision};
 });
 const bill=componentBill({schema:'GF-DIGITAL-ASSEMBLY-1',family,instances});
 return {schema:'GF-OWNED-INSPECTION-1',config,engineRevision:evidence.engineRevision,catalogRevision:evidence.catalogRevision,registryRevision:componentRegistry.revision,family,label:FAMILIES[config.family].label,instances,bill,ignoredInputBom:Object.hasOwn(input,'bom'),geometry:{floor:plan.floor,referenceDimensions:plan.dimensions??null},scope:'DIGITAL_INSTANCES_ONLY',verifiedSourcesAt:evidence.verifiedAt,limitations:['Ilości wygenerowano z config, pomijając wejściowe bom.','Wynik jest niezależny od aktywnego projektu Studio i jego wyceny.','To nie jest zatwierdzony BOM wykonawczy; połączenia wymagają potwierdzenia.','Rewizje wskazują źródła sprawdzone przy wydaniu inspektora, nie historyczną rewizję pliku OS.']};
}
