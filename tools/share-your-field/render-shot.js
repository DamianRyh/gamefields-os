const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root=__dirname;const srv=http.createServer((q,s)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){s.writeHead(404);return s.end()}s.writeHead(200,{'Content-Type':f.endsWith('.js')?'text/javascript':f.endsWith('.html')?'text/html':'application/octet-stream'});s.end(d)})}).listen(8765);
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [name,qs] of JSON.parse(process.argv[2])){const p=await b.newPage();p.on('console',m=>console.log(m.text()));p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8765/render.html?'+qs);await p.waitForFunction(()=>document.title.startsWith('done'),null,{timeout:180000});console.log(name,await p.title());
const data=await p.evaluate(()=>document.querySelector('canvas').toDataURL('image/png'));fs.writeFileSync(path.join(root,name),Buffer.from(data.split(',')[1],'base64'));await p.close()}
await b.close();srv.close()})();
