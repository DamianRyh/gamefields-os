import catalog from "../public/catalog/product-names.json" with {type:"json"};
export const productNames=Object.fromEntries(catalog.products.map(p=>[p.id,p.name]));
// Only known automatic titles change. User-authored project names stay intact.
export function canonicalProjectName(name,model){
 const p=catalog.products.find(p=>p.id===model);if(!p)return name;
 for(const alias of p.aliases){
  if(name===alias+" — projekt"||name.startsWith(alias+" · ")&&name.endsWith(" — projekt"))return p.name+" — projekt";
 }
 return name;
}
