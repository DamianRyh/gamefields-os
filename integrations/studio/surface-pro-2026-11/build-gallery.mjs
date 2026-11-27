import {readFileSync,writeFileSync} from 'fs';
const here=new URL('.',import.meta.url).pathname;
// the gallery inlines both modules as plain scripts: composer first, then the engine without its import/re-export
const names=['COMPOSER_FAMILIES','renderComposer','composerMasking','composerMetrics'];
const composer='var __K=(function(){\n'+readFileSync(here+'court-composer.mjs','utf8').replace(/^export /gm,'')+'\nreturn {'+names.join(',')+'};})();\nvar '+names.map(n=>n+'=__K.'+n).join(',')+';';
const engine=readFileSync(here+'court-art-pro.mjs','utf8').replace(/^import .*\n/m,'').replace(/^export \{[^}]*\};\n/m,'').replace(/^export /gm,'');
const sig=JSON.stringify([...JSON.parse(readFileSync(here+'signature-murals.json','utf8')),...JSON.parse(readFileSync(here+'signature-composer-2.json','utf8')),...JSON.parse(readFileSync(here+'signature-composer.json','utf8')),...JSON.parse(readFileSync(here+'signature-pro.json','utf8'))]);
const tpl=readFileSync(here+'gallery.template.html','utf8');
writeFileSync(here+'nawierzchnie-pro.html',tpl.replace('/*ENGINE*/',()=>composer+'\n'+engine).replace('/*SIG*/',()=>sig));
// Plan malowania: the same engine plus the paint-plan module, each in its own scope
const planNames=['measureSvg','buildPlan','layerSvg','gridSvg','lightnessOf','pendingTint'];
const plan='var __P=(function(){\n'+readFileSync(here+'paint-plan.mjs','utf8').replace(/^export /gm,'')+'\nreturn {'+planNames.join(',')+'};})();\nvar '+planNames.map(n=>n+'=__P.'+n).join(',')+';';
writeFileSync(here+'plan-malowania.html',readFileSync(here+'plan.template.html','utf8').replace('/*ENGINE*/',()=>composer+'\n'+engine+'\n'+plan));
console.log('ok');
