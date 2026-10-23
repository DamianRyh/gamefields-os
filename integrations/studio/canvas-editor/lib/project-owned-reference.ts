import {projectSpecification,canonicalConfiguration} from './project-specification.ts';
import {inspectOwnedConfiguration} from './owned-configuration.mjs';
import type {Project} from './project';

const SCHEMA='GF-PROJECT-OWNED-REFERENCE-1';
const MAX_BYTES=13_000_000;
const nativeSchema='GF-OWNED-ASSEMBLY-1';
const digest=async(value:unknown)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonicalConfiguration(value))))).map(x=>x.toString(16).padStart(2,'0')).join('');
function boundedJson(value:unknown):unknown {
 let text:string;
 try{text=typeof value==='string'?value:JSON.stringify(value)}catch{throw Error('Nieprawidłowy dokument powiązania JSON.');}
 if(typeof text!=='string'||new TextEncoder().encode(text).length>MAX_BYTES)throw Error('Dokument powiązania może mieć maksymalnie 13 MB.');
 let parsed:unknown;try{parsed=JSON.parse(text)}catch{throw Error('Nieprawidłowy dokument powiązania JSON.');}
 // Reject non-JSON values before a round trip can silently discard unknown fields.
 const validate=(input:unknown)=>{let count=0;const walk=(v:unknown,depth=0)=>{if(++count>200000||depth>64)throw Error('Zbyt złożony dokument powiązania.');if(v===null||typeof v==='string'||typeof v==='boolean')return;if(typeof v==='number'&&Number.isFinite(v))return;if(typeof v!=='object')throw Error('Dokument zawiera dane spoza formatu JSON.');if(!Array.isArray(v)&&Object.getPrototypeOf(v)!==Object.prototype&&Object.getPrototypeOf(v)!==null)throw Error('Nieprawidłowy obiekt JSON.');for(const child of Object.values(v))walk(child,depth+1)};walk(input)};
 if(typeof value!=='string')validate(value);validate(parsed);
 return parsed;
}
function freeze<T>(value:T):T {if(value&&typeof value==='object'){Object.freeze(value);for(const child of Object.values(value))freeze(child);}return value;}

/** Associates two exact digital snapshots; never assigns OS quantities to the Studio bill. */
export async function createProjectOwnedReference(project:Project,rawNativeOS:unknown){
 const spec=await projectSpecification(project);
 if(!spec.product.id||!spec.product.family||!spec.product.modelSourceRevision)throw Error('Powiązanie wymaga projektu Studio z przypiętym modelem konstrukcji.');
 const input=boundedJson(rawNativeOS);
 const checked=inspectOwnedConfiguration(input);
 if(checked.config.mode!=='assembly')throw Error('Powiązanie wymaga całej konfiguracji OS, nie pojedynczego komponentu.');
 if(checked.family!==spec.product.family)throw Error('Projekt Studio i konfiguracja OS należą do różnych rodzin.');
 if((spec.product.id==='circle-cage-1'&&checked.config.levels!==1)||(spec.product.id==='circle-cage-2'&&checked.config.levels!==2))throw Error('Liczba poziomów OS nie odpowiada wybranemu modelowi Circle Cage.');
 // Re-inspect the normalized native config. The supplied BOM is neither retained nor trusted.
 const nativeConfiguration={schema:nativeSchema,config:checked.config};
 const inspection=inspectOwnedConfiguration(nativeConfiguration);
 const content={schema:SCHEMA,relationship:'USER_ASSOCIATED_SNAPSHOTS',geometryCorrespondence:'UNCONFIRMED',manufacturingReady:false,
  studio:{project:spec.project,configurationRevision:spec.configurationRevision,modelSourceRevision:spec.product.modelSourceRevision,modelId:spec.product.id,family:spec.product.family},
  owned:{nativeConfiguration,configurationRevision:await digest(inspection.config),engineRevision:inspection.engineRevision,catalogRevision:inspection.catalogRevision,registryRevision:inspection.registryRevision,evidenceRevision:await digest(inspection),inspection},
  technicalBill:{status:'UNCONFIRMED',rows:null},pricing:{status:'NOT_INCLUDED'}};
 const manifest={...content,createdAt:new Date().toISOString(),manifestRevision:await digest(content)};
 // Project images are retained; no reduced snapshot is substituted when the envelope is too large.
 return freeze(boundedJson(JSON.stringify(manifest)) as typeof manifest);
}

/** Rebuilds all evidence with current pinned sources, rejecting edits and stale revisions. */
export async function verifyProjectOwnedReference(rawManifest:unknown,currentProject?:Project){
 const value=boundedJson(rawManifest) as Record<string,unknown>;
 if(!value||typeof value!=='object'||Array.isArray(value)||value.schema!==SCHEMA)throw Error('Wybierz dokument GF-PROJECT-OWNED-REFERENCE-1.');
 const keys=['schema','relationship','geometryCorrespondence','manufacturingReady','studio','owned','technicalBill','pricing','createdAt','manifestRevision'];
 if(Object.keys(value).length!==keys.length||Object.keys(value).some(k=>!keys.includes(k)))throw Error('Nieobsługiwane pola dokumentu powiązania.');
 if(typeof value.createdAt!=='string'||!Number.isFinite(Date.parse(value.createdAt))||new Date(value.createdAt).toISOString()!==value.createdAt)throw Error('Nieprawidłowa data dokumentu powiązania.');
 const studio=value.studio as Record<string,unknown>,owned=value.owned as Record<string,unknown>;
 if(!studio||typeof studio!=='object'||!owned||typeof owned!=='object')throw Error('Brak snapshotów powiązania.');
 const regenerated=await createProjectOwnedReference(studio.project as Project,owned.nativeConfiguration);
 const expected={...regenerated,createdAt:value.createdAt};
 if(canonicalConfiguration(value)!==canonicalConfiguration(expected))throw Error('Powiązanie zmieniono lub jego rewizje nie odpowiadają bieżącym źródłom.');
 const manifest=freeze(expected);
 let currentProjectMatches:boolean|null=null;
 if(currentProject!==undefined){const current=await projectSpecification(currentProject);currentProjectMatches=current.configurationRevision===manifest.studio.configurationRevision&&current.product.modelSourceRevision===manifest.studio.modelSourceRevision;}
 return {manifest,currentProjectMatches};
}
export type ProjectOwnedReference=Awaited<ReturnType<typeof createProjectOwnedReference>>;
