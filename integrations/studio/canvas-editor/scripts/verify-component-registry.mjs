import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {resolve,relative,isAbsolute} from 'node:path';
import registry from '../public/catalog/component-registry.json' with {type:'json'};
const roots=process.argv.slice(2);if(!roots.length)throw Error('Podaj katalog źródeł OS: node scripts/verify-component-registry.mjs /absolutny/katalog');
const bases=roots.map(root=>resolve(root));const ids=new Set();
for(const article of registry.articles){
 if(ids.has(article.articleId))throw Error('Duplikat: '+article.articleId);ids.add(article.articleId);
 const candidates=bases.map(base=>{const path=resolve(base,article.source),rel=relative(base,path);if(rel.startsWith('..')||isAbsolute(rel))throw Error('Ścieżka spoza źródeł');return path});
 const path=candidates.find(p=>existsSync(p));if(!path)throw Error('Brak źródła: '+article.articleId);
 const sha=createHash('sha256').update(await readFile(path)).digest('hex');if(sha!==article.sourceRevision)throw Error('Niezgodne źródło: '+article.articleId);
}
console.log('PASS: verified '+ids.size+' component source hashes and unique article IDs.');
