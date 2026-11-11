import {readFileSync,writeFileSync} from 'fs';
const here=new URL('.',import.meta.url).pathname;
const engine=readFileSync(here+'court-art-pro.mjs','utf8').replace(/^export /gm,'');
const sig=readFileSync(here+'signature-pro.json','utf8');
const tpl=readFileSync(here+'gallery.template.html','utf8');
writeFileSync(here+'nawierzchnie-pro.html',tpl.replace('/*ENGINE*/',()=>engine).replace('/*SIG*/',()=>sig.trim()));
console.log('ok');
