import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const require=createRequire(import.meta.url);
let worker,server;
let base=process.env.MODULAR_VIEWER_URL;
try {
 if(!base) {
  const wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
  const {Miniflare}=await import(wranglerRequire.resolve('miniflare'));
  const files=(await readdir('dist/server',{recursive:true})).filter(file=>/\.m?js$/.test(file));
  worker=new Miniflare({modules:['index.js',...files.filter(file=>file!=='index.js')].map(file=>({type:'ESModule',path:resolve('dist/server',file)})),modulesRoot:resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB']});
  const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
  server=createServer(async(request,response)=>{
   try {
    const pathname=new URL(request.url,'http://localhost').pathname;
    const file=resolve('dist/client','.'+pathname),root=resolve('dist/client')+'/';
    if(file.startsWith(root)&&!pathname.startsWith('/api/')) {
     try {const bytes=await readFile(file);response.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');response.end(bytes);return;}catch(error){if(!['ENOENT','EISDIR'].includes(error.code))throw error;}
    }
    const chunks=[];for await(const chunk of request)chunks.push(chunk);
    const result=await worker.dispatchFetch(`http://${request.headers.host}${request.url}`,{method:request.method,headers:request.headers,body:chunks.length?Buffer.concat(chunks):undefined});
    response.statusCode=result.status;for(const[name,value]of result.headers)response.setHeader(name,value);
    response.end(Buffer.from(await result.arrayBuffer()));
   }catch(error){response.statusCode=500;response.end(String(error));}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  base=`http://127.0.0.1:${server.address().port}`;
 }
 const test=spawn(process.execPath,['tests/modular-viewer.mjs'],{stdio:'inherit',env:{...process.env,MODULAR_VIEWER_URL:base}});
 const status=await new Promise((resolve,reject)=>{test.on('error',reject);test.on('exit',resolve);});
 if(status!==0)throw new Error('Modular viewer tests failed.');
}finally{if(server)await new Promise(resolve=>server.close(resolve));await worker?.dispose();}
