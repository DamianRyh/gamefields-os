const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');const {spawn}=require('child_process');
const root=__dirname;const srv=http.createServer((q,s)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){s.writeHead(404);return s.end()}s.writeHead(200,{'Content-Type':f.endsWith('.js')?'text/javascript':f.endsWith('.html')?'text/html':'application/octet-stream'});s.end(d)})}).listen(8767);
// usage: node film2.js <clean|street> <story|post> <frames> <out.mp4> [only=i,j,...]
const [sty,fmt,frames,out,only]=process.argv.slice(2);const N=+frames,SECS=N/30,SUB=4;
const CH={clean:{fov:24,az:34,el0:54,el1:24,k0:1.18,spin:200,drift:4,end:.86,margin:1.04},street:{fov:28,az:22,el0:40,el1:13,k0:1.04,spin:220,drift:5,end:.86,margin:.98}}[sty];
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8767/film-kino.html');await p.evaluate(()=>Promise.all(['500','600','700','800','900'].map(w=>document.fonts.load(w+' 40px Inter'))));await p.waitForFunction(()=>window.setup);
console.log('3d',await p.evaluate(([s,f,c])=>setup(s,f,c),[sty,fmt,CH]));
if(only){for(const i of only.split(',').map(Number)){const d=await p.evaluate(([i,n,s,t])=>frame(i,n,s,t),[i,N,SUB,SECS]);fs.writeFileSync(out.replace('.mp4',`-f${i}.jpg`),Buffer.from(d.split(',')[1],'base64'))}await b.close();srv.close();return}
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','30','-i','-','-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p','-profile:v','high','-level','4.1','-movflags','+faststart',out]);
const t0=Date.now();for(let i=0;i<N;i++){const d=await p.evaluate(([i,n,s,t])=>frame(i,n,s,t),[i,N,SUB,SECS]);if(!ff.stdin.write(Buffer.from(d.split(',')[1],'base64')))await new Promise(r=>ff.stdin.once('drain',r));if(i%60==0)console.log(i,((Date.now()-t0)/1000).toFixed(0)+'s')}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();srv.close();console.log('done',out)})();
