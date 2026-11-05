import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=await import(wr.resolve('miniflare'));
const files=(await readdir('dist/server',{recursive:true})).filter(f=>/\.m?js$/.test(f));
let calls=0,last;
const mf=new Miniflare({modules:['index.js',...files.filter(f=>f!=='index.js')].map(f=>({type:'ESModule',path:resolve('dist/server',f)})),modulesRoot:resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{OPENAI_API_KEY:'test-placeholder'},outboundService:async request=>{assert.equal(new URL(request.url).hostname,'api.openai.com');calls++;last=await request.json();return Response.json({output:[{content:[{type:'output_text',text:'Sprawdź równość i odwodnienie podłoża.'}]}]})}});
try{
 const db=await mf.getD1Database('DB');for(const sql of (await readFile('drizzle/0013_studio_shared_projects.sql','utf8')).split('--> statement-breakpoint'))if(sql.trim())await db.exec(sql.replaceAll('\n',' '));
 const project={id:'private-id',name:'Prywatny klient',date:'2026-10-29',sport:'Piłka nożna 1×1',arenaModel:'o1',length:15,width:10,surface:'EPDM',base:'#000000',zone:'#111111',outside:'#222222',lineColor:'#ffffff',lines:false,pattern:'Organic Flow',patternFamily:'organic-flow',patternVariant:1,graphicOpacity:0,graphicScale:100,graphicRotation:0,scene:'day',objects:[],arenaDesign:{panelColor:'#ff0000',goalPanelColor:'#112233',frameColor:'#30363c',goalColor:'#30363c',finish:'matte',text:'Poufna nazwa',side:'both'}};
 const send=(path,body,headers={},method='POST')=>mf.dispatchFetch('http://localhost'+path,{method,headers:{origin:'http://localhost','Content-Type':'application/json',...headers},body:typeof body==='string'?body:JSON.stringify(body)});
 assert.equal((await send('/api/shared',{project,consent:true,includePrivate:false},{origin:'https://foreign.example'})).status,403);
 assert.equal((await send('/api/shared',{project,consent:false,includePrivate:false})).status,400);
 assert.equal((await send('/api/shared',' '.repeat(1800001))).status,413);
 const response=await send('/api/shared',{project,consent:true,includePrivate:false});assert.equal(response.status,201);const receipt=await response.json();assert.equal(receipt.key.length,64);
 const get=key=>mf.dispatchFetch('http://localhost/api/shared?id='+receipt.id,{headers:{authorization:'Bearer '+key}});
 assert.equal((await get('0'.repeat(64))).status,404);
 let r=await get(receipt.key);assert.equal(r.headers.get('cache-control'),'no-store');let shared=await r.json();assert.equal(shared.project.name,'Projekt Gamefields');assert.equal(shared.project.arenaDesign.text,'');assert.equal(shared.project.arenaDesign.goalPanelColor,'#112233');assert.equal(shared.sourceChanged,false);assert(!JSON.stringify(shared).includes('Poufna'));
 const stored=await db.prepare('SELECT * FROM studio_shared_projects WHERE id=?').bind(receipt.id).first();assert.notEqual(stored.read_hash,receipt.key);assert.notEqual(stored.delete_hash,receipt.deleteKey);
 await db.prepare('UPDATE studio_shared_projects SET model_revision=? WHERE id=?').bind('old-model',receipt.id).run();assert.equal((await(await get(receipt.key)).json()).sourceChanged,true);
 assert.equal((await send('/api/shared',{id:receipt.id,deleteKey:'0'.repeat(64)},{},'DELETE')).status,403);
 assert.equal((await send('/api/shared',{id:receipt.id,deleteKey:receipt.deleteKey},{},'DELETE')).status,200);assert.equal((await get(receipt.key)).status,404);assert.equal((await db.prepare('SELECT project_json FROM studio_shared_projects WHERE id=?').bind(receipt.id).first()).project_json,'{}');
 for(let i=0;i<4;i++)assert.equal((await send('/api/shared',{project,consent:true,includePrivate:true})).status,201);assert.equal((await send('/api/shared',{project,consent:true,includePrivate:true})).status,429);
 const guide='ola';const msg={guide,messages:[{role:'user',content:'Jak przygotować podłoże?'}],context:{sport:'Teqball',area:192}};
 assert.equal((await send('/api/crew',msg,{origin:'https://foreign.example'})).status,403);assert.equal((await send('/api/crew',' '.repeat(16001))).status,413);
 for(let i=0;i<12;i++){const result=await send('/api/crew',msg);assert.equal(result.status,200,await result.clone().text());assert((await result.json()).answer.includes('odwodnienie'))}
 assert.equal((await send('/api/crew',msg)).status,429);assert.equal(calls,12);assert.equal(last.store,false);assert.equal(last.reasoning.effort,'none');assert(last.instructions.includes('Teqball'));
 console.log('PASS P2 API: consent, origin/body bounds, private-field sanitization, independent goal colour, secret hashes, source revisions, revoke/erase, rate limits, CREW Responses context and reasoning.');
}finally{await mf.dispose()}
