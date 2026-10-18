import {readFile,writeFile} from 'node:fs/promises';
const folder=new URL('../integrations/wordpress/products/',import.meta.url);
const products=JSON.parse(await readFile(new URL('products.json',folder),'utf8'));
const css=(await readFile(new URL('gamefields-product-design.css',folder),'utf8')).trim();
const start='/* GAMEFIELDS_PRODUCT_DESIGN_START */',end='/* GAMEFIELDS_PRODUCT_DESIGN_END */';
const block=start+'\n'+css+'\n'+end;
for(const name of ['boiska-street-football',...products.map(p=>p.slug)]){
 const file=new URL(name+'.html',folder),source=await readFile(file,'utf8');
 const from=source.indexOf(start),to=source.indexOf(end);
 if((from<0)!==(to<0)||to<from)throw new Error('Invalid design markers in '+name);
 const next=from<0?source.replace('</style>',block+'\n</style>'):source.slice(0,from)+block+source.slice(to+end.length);
 if(process.argv.includes('--check')){if(next!==source)throw new Error('Run node scripts/sync-wordpress-product-design.mjs: '+name)}
 else if(next!==source)await writeFile(file,next);
}
console.log(process.argv.includes('--check')?'PASS: product styles match shared source':'Synced product styles');
