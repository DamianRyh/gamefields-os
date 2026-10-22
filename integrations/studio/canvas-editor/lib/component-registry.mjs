import registry from '../public/catalog/component-registry.json' with {type:'json'};
export const componentRegistry=registry;
const articles=new Map(registry.articles.map(a=>[a.articleId,a]));
export const modelFamilies={p1:'F01',o1:'F02',w1:'F03',street15:'F04','circle-cage-1':'F05','circle-cage-2':'F05','street-field':'F06',octagon:'F07'};
/** Digital assembly adapter. Approval remains independent of family membership. */
export function componentBill(input){
 if(!input||input.schema!=='GF-DIGITAL-ASSEMBLY-1'||!Array.isArray(input.instances)||input.instances.length>1000)throw Error('Nieprawidłowe zestawienie elementów');
 if(Object.keys(input).some(k=>!['schema','family','instances'].includes(k)))throw Error('Niedozwolone dane zestawienia');
 if(!Object.values(modelFamilies).includes(input.family))throw Error('Nieznana rodzina');
 const ids=new Set(), rows=new Map();
 for(const instance of input.instances){
  if(!instance||typeof instance.id!=='string'||!instance.id||ids.has(instance.id))throw Error('Nieprawidłowy identyfikator instancji');ids.add(instance.id);
  if(Object.keys(instance).some(k=>!['id','articleId','revision','sourceRevision'].includes(k)))throw Error('Instancja nie może podmieniać zasobu ani skali');
  const article=articles.get(instance.articleId);
  if(!article||article.family!==input.family)throw Error('Element spoza wybranej rodziny');
  if(instance.revision!==article.revision||instance.sourceRevision!==article.sourceRevision)throw Error('Niezgodna rewizja elementu');
  const row=rows.get(article.articleId)||{articleId:article.articleId,family:article.family,revision:article.revision,sourceRevision:article.sourceRevision,quantity:0,unit:article.unit,approval:article.approval};row.quantity++;rows.set(article.articleId,row);
 }
 return {schema:'GF-DIGITAL-BOM-1',family:input.family,approval:'UNCONFIRMED',manufacturingReady:false,rows:[...rows.values()].sort((a,b)=>a.articleId.localeCompare(b.articleId))};
}
