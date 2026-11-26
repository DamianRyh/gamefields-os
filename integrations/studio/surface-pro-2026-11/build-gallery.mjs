import {readFileSync,writeFileSync} from 'fs';
const here=new URL('.',import.meta.url).pathname;
// the gallery inlines both modules as plain scripts: composer first, then the engine without its import/re-export
const composer=readFileSync(here+'court-composer.mjs','utf8').replace(/^export /gm,'');
const engine=readFileSync(here+'court-art-pro.mjs','utf8').replace(/^import .*\n/m,'').replace(/^export \{[^}]*\};\n/m,'').replace(/^export /gm,'');
const sig=JSON.stringify([...JSON.parse(readFileSync(here+'signature-composer.json','utf8')),...JSON.parse(readFileSync(here+'signature-pro.json','utf8'))]);
const tpl=readFileSync(here+'gallery.template.html','utf8');
writeFileSync(here+'nawierzchnie-pro.html',tpl.replace('/*ENGINE*/',()=>composer+'\n'+engine).replace('/*SIG*/',()=>sig));
console.log('ok');
