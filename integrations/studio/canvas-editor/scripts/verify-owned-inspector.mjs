import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {FAMILIES,partIds} from '../lib/vendor/owned-modular/engine.mjs';
import {componentRegistry} from '../lib/component-registry.mjs';
const root=process.argv[2];if(!root)throw Error('Podaj katalog źródeł OS');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const source=await readFile(resolve(root,'components/gamefields/owned-modular/engine.mjs'));
if(hash(source)!==hash(await readFile('lib/vendor/owned-modular/engine.mjs')))throw Error('Engine source changed');
const familyMap={p1:'F01',o1:'F02',w1:'F03',street15:'F04','circle-cage':'F05','street-field':'F06',octagon:'F07'};
const checked=[];
for(const f of Object.values(FAMILIES))for(const alias of partIds(f)){
 const article=componentRegistry.articles.filter(a=>a.family===familyMap[f.id]&&a.alias===alias);if(article.length!==1)throw Error('Ambiguous article: '+alias);
 const runtimePath=alias.startsWith('sf-')||alias.startsWith('oct-')||alias.startsWith('cc-')?'public/models/gamefields/owned-modular/assets/'+alias+'.glb':'public/models/gamefields/components/'+alias+'.glb';
 const sha=hash(await readFile(resolve(root,runtimePath)));if(sha!==article[0].sourceRevision)throw Error('Runtime revision mismatch: '+alias);
 checked.push({family:f.id,alias,articleId:article[0].articleId,runtimePath,sourceRevision:sha});
}
const meta={schema:'GF-OWNED-ENGINE-EVIDENCE-1',verifiedAt:'2026-10-22',sourcePath:'components/gamefields/owned-modular/engine.mjs',engineRevision:hash(source),catalogRevision:hash(await readFile('public/catalog/product-names.json')),registryRevision:componentRegistry.revision,checkedRuntimeAssets:checked};
if(process.argv.includes('--write'))await writeFile('lib/vendor/owned-modular/evidence.json',JSON.stringify(meta,null,2)+'\n');
else if(JSON.stringify(meta)!==JSON.stringify(JSON.parse(await readFile('lib/vendor/owned-modular/evidence.json','utf8'))))throw Error('Evidence needs regeneration');
console.log('PASS: exact engine copy, '+checked.length+' runtime source hashes and family/alias article mappings.');
