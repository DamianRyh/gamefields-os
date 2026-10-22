import {parseVaultProject} from './project-vault.ts';
import {projectDimensions} from './project-dimensions.ts';
import {productNames,productCodes} from './product-names.mjs';
import {componentRegistry,modelFamilies} from './component-registry.mjs';
import type {Project} from './project';
export function canonicalConfiguration(value:unknown):string {
 if(Array.isArray(value))return '['+value.map(canonicalConfiguration).join(',')+']';
 if(value!==null&&typeof value==='object')return '{'+Object.entries(value).filter(([,v])=>v!==undefined).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+canonicalConfiguration(v)).join(',')+'}';
 return JSON.stringify(value);
}
export async function projectSpecification(input:Project){
 const project=parseVaultProject(input),dimensions=projectDimensions(project);
 const bytes=new TextEncoder().encode(canonicalConfiguration(project));
 const configurationRevision=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');
 const family=project.arenaModel?modelFamilies[project.arenaModel]:null;
 return {schema:'GF-PROJECT-SPECIFICATION-1',generatedAt:new Date().toISOString(),configurationRevision,project,
  product:{id:project.arenaModel??null,name:project.arenaModel?productNames[project.arenaModel]:project.sport,code:project.arenaModel?productCodes[project.arenaModel]:null,family,modelSourceRevision:dimensions.model?.sourceRevision??null},
  quantities:{referenceDimensions:dimensions.reference,surfaceAreaM2:dimensions.area,surfaceBounds:dimensions.model?.surfaceBounds??null,constructionBounds:dimensions.model?.constructionBounds??null,clearance:null,modulePitch:null},
  componentRegistry:{schema:componentRegistry.schema,revision:componentRegistry.revision,availableFamilyArticleIds:family?componentRegistry.articles.filter(a=>a.family===family).map(a=>a.articleId):[],status:'DIGITAL_SOURCE_INVENTORY'},
  technicalBill:{status:'UNCONFIRMED',manufacturingReady:false,rows:null,reason:'Projekt Studio nie zawiera zatwierdzonych instancji artykułów. Katalog rodziny nie oznacza elementów użytych w tym boisku.'},
  freeObjects:project.objects.map(o=>({id:o.id,name:o.name,kind:o.kind,classification:'DECORATIVE_OR_CONCEPTUAL',technicalArticleId:null})),
  pricing:{status:'NOT_INCLUDED',reason:'Aktualną orientacyjną kalkulację sprawdź w Studio. Brakujące zakresy wymagają wyceny.'},
  limitations:['Specyfikacja konfiguracji cyfrowej; nie dokumentacja wykonawcza.','Rejestr komponentów nie potwierdza połączeń, kotwienia, obciążeń ani dopuszczeń.','Plik zawiera pełny projekt i grafiki. Udostępniaj go świadomie.']};
}
