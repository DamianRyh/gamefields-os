import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createServer} from 'node:http';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import {build} from 'esbuild';
import {createHash} from 'node:crypto';
await build({entryPoints:['scripts/sport-surface-thumbnails.tsx'],bundle:true,format:'iife',platform:'browser',outfile:'outputs/render-catalog-thumbnails.js'});
const server=createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(url.pathname==='/'){res.setHeader('content-type','text/html');res.end('<canvas style="width:640px;height:400px"></canvas><script src="/render.js"></script>');return;}if(url.pathname==='/render.js'){res.setHeader('content-type','text/javascript');res.end(await readFile('outputs/render-catalog-thumbnails.js'));return;}const path=resolve('public','.'+url.pathname);if(!path.startsWith(resolve('public')+'/'))throw Error();res.setHeader('content-type',extname(path)==='.json'?'application/json':'application/octet-stream');res.end(await readFile(path));}catch{res.statusCode=404;res.end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});const page=await browser.newPage({viewport:{width:640,height:400},deviceScaleFactor:1});
try{await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>typeof window.renderCatalogThumbnail==='function');
const catalog=JSON.parse(await readFile('public/sport-surfaces/catalog.json','utf8'));
for(const s of catalog.items){const result=await page.evaluate(id=>window.renderCatalogThumbnail(id),s.id);await writeFile('public/sport-surfaces/'+s.id+'.webp',Buffer.from(result.image.split(',')[1],'base64'));}console.log('Rendered '+catalog.items.length+' surface thumbnails');}
finally{await browser.close();await new Promise(r=>server.close(r))}
