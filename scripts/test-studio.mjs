import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {setTimeout as delay} from 'node:timers/promises';

let server;
let serverExit;
let logs='';
let base=process.env.STUDIO_TEST_URL;
try {
  if (!base) {
    const reservation=createServer();
    await new Promise((resolve,reject)=>{reservation.once('error',reject);reservation.listen(0,'127.0.0.1',resolve)});
    const port=reservation.address().port;
    await new Promise(resolve=>reservation.close(resolve));
    base=`http://127.0.0.1:${port}`;
    server=spawn(process.execPath,['scripts/run-framework.mjs','dev','--port',String(port),'--host','127.0.0.1'],{stdio:['ignore','pipe','pipe']});
    for (const stream of [server.stdout,server.stderr]) stream.on('data',chunk=>{logs=(logs+chunk.toString()).slice(-6000)});
    serverExit=new Promise(resolve=>{server.once('exit',resolve);server.once('error',error=>{logs+=error.message;resolve(1)})});
    let ready=false;
    const deadline=Date.now()+90000;
    while (Date.now()<deadline) {
      if (server.exitCode!==null) throw new Error(`Studio server exited before readiness.\n${logs}`);
      try {
        const response=await fetch(base+'/studio',{signal:AbortSignal.timeout(3000)});
        ready=response.ok&&(await response.text()).includes('data-studio-ready');
        if (ready) break;
      } catch {}
      await delay(250);
    }
    if (!ready) throw new Error(`Studio server did not become ready.\n${logs}`);
  }
  for (const file of ['tests/studio-flow.mjs','tests/studio-quote.mjs']) {
    const child=spawn(process.execPath,[file],{stdio:'inherit',env:{...process.env,STUDIO_TEST_URL:base},timeout:120000,killSignal:'SIGTERM'});
    const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve)});
    if (code!==0) throw new Error(`${file} failed (exit ${code}).`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode=1;
} finally {
  if (server&&server.exitCode===null) {
    server.kill('SIGTERM');
    await Promise.race([serverExit,delay(5000)]);
    if (server.exitCode===null) server.kill('SIGKILL');
  }
}
