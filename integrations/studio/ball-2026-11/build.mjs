import {readFileSync,writeFileSync} from 'fs';
const here=new URL('.',import.meta.url).pathname;
const engine=readFileSync(here+'../surface-pro-2026-11/court-art-pro.mjs','utf8').replace(/^export /gm,'');
writeFileSync(here+'pilka-gamefields.html',readFileSync(here+'ball.template.html','utf8').replace('/*ENGINE*/',()=>engine));
console.log('ok');
