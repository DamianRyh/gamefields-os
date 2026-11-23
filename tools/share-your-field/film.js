const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');const {spawn}=require('child_process');
const root=__dirname;const srv=http.createServer((q,s)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){s.writeHead(404);return s.end()}s.writeHead(200,{'Content-Type':f.endsWith('.js')?'text/javascript':f.endsWith('.html')?'text/html':'application/octet-stream'});s.end(d)})}).listen(8766);
const [sty,fmt,preset,frames,out]=process.argv.slice(2);const N=+frames;
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8766/film.html');await p.evaluate(()=>document.fonts.load('900 40px Inter'));await p.waitForFunction(()=>window.setup);
console.log('crop',await p.evaluate(([pr,n])=>setup(pr,n),[preset,N]));
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','30','-i','-','-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p','-profile:v','high','-level','4.1','-movflags','+faststart','-r','30',out]);
const t0=Date.now();for(let i=0;i<N;i++){const d=await p.evaluate(([i,n,s,f])=>frame(i,n,s,f),[i,N,sty,fmt]);if(!ff.stdin.write(Buffer.from(d.split(',')[1],'base64')))await new Promise(r=>ff.stdin.once('drain',r));if(i%30==0)console.log(i,((Date.now()-t0)/1000).toFixed(0)+'s')}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();srv.close();console.log('done',out)})();
