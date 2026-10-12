import {spawn} from 'node:child_process';
import {setTimeout} from 'node:timers/promises';
let base=process.env.MODULAR_VIEWER_URL;
let server;
let output='';
try {
 if(!base) {
  try {
   const response=await fetch('http://127.0.0.1:5173/engineering/modular-3d',{signal:AbortSignal.timeout(2500)});
   if(response.ok && (await response.text()).includes('data-testid="modular-scene"')) base='http://127.0.0.1:5173';
  }catch{}
 }
 if(!base) {
  server=spawn('pnpm',['dev','--hostname','127.0.0.1','--port','5187'],{stdio:['ignore','pipe','pipe'],detached:true});
  server.stdout.on('data',chunk=>{output=(output+chunk).slice(-12000);});
  server.stderr.on('data',chunk=>{output=(output+chunk).slice(-12000);});
  let ready=false;
  for(let attempt=0;attempt<90;attempt++) {
   if(server.exitCode!==null)throw new Error('Viewer server exited: '+output);
   try {const response=await fetch('http://127.0.0.1:5187/engineering/modular-3d',{signal:AbortSignal.timeout(2500)});if(response.ok){ready=true;break;}}catch{}
   await setTimeout(500);
  }
  if(!ready)throw new Error('Viewer server did not become ready: '+output);
 }
 const test=spawn(process.execPath,['tests/modular-viewer.mjs'],{stdio:'inherit',env:{...process.env,MODULAR_VIEWER_URL:base||'http://127.0.0.1:5187'}});
 const status=await new Promise((resolve,reject)=>{test.on('error',reject);test.on('exit',resolve);});
 if(status!==0)throw new Error('Modular viewer tests failed.');
}finally{if(server?.pid){try{process.kill(-server.pid,'SIGTERM');}catch(error){if(error.code!=='ESRCH')throw error;}}}
