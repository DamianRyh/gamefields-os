import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url);
const wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=await import(wranglerRequire.resolve('miniflare'));
const moduleFiles=(await readdir('dist/server',{recursive:true})).filter(f=>/\.m?js$/.test(f));
const modules=['index.js',...moduleFiles.filter(f=>f!=='index.js')].map(f=>({type:'ESModule',path:resolve('dist/server',f)}));
const mf=new Miniflare({modules,modulesRoot:resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{PLAY_ADMIN_USER_IDS:'smoke_admin'},log:undefined});
try{
 const db=await mf.getD1Database('DB');
 for(const file of (await readdir('drizzle')).filter(f=>/^\d+.*\.sql$/.test(f)).sort()){
  const sql=await readFile(`drizzle/${file}`,'utf8');
  // Existing numbered migrations contain several statements; D1 exec handles the full migration file.
  await db.exec(sql.replace(/--[^\n]*\n/g,'\n').replace(/\n/g,' '));
 }
 let checks=0;
 const jar=new Map();
 async function call(account,path,body,expected=200){const headers=new Headers({'Origin':'https://gamefields.test'});if(jar.get(account))headers.set('Cookie',jar.get(account));if(body)headers.set('Content-Type','application/json');const r=await mf.dispatchFetch('https://gamefields.test'+path,{method:body?'POST':'GET',headers,body:body?JSON.stringify(body):undefined});const content=await r.text();let d;try{d=JSON.parse(content);}catch{throw new Error(`${path}: ${r.status} ${content.slice(0,180)}`);}assert.equal(r.status,expected,`${path} ${body?.action||''}: ${JSON.stringify(d)}`);if(expected===200)assert.notEqual(d.ok,false,JSON.stringify(d));const cookies=r.headers.getSetCookie();const session=cookies.find(c=>c.startsWith('gf_play_session='));if(session)jar.set(account,session.split(';')[0]);checks++;return d;}
 const health=await call('', '/api/play/health');assert.equal(health.schemaReady,true);
 const password='Smoke-'+crypto.randomUUID();
 const accounts=[];
 for(let i=0;i<4;i++){const d=await call(i,'/api/play/auth',{action:'register',email:`pilot-${i}@example.test`,password,displayName:`Pilot ${i}`});accounts.push(d.user.id);}
 await db.prepare("INSERT INTO users (id,email,nickname,city,coins,created_at,updated_at) VALUES ('smoke_admin','moderator@example.test','smoke_moderator','Warszawa',0,1,1)").run();
 const adminToken=crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
 const tokenHash=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(adminToken))).toString('base64url');
 await db.prepare('INSERT INTO play_sessions (id,user_id,token_hash,expires_at,created_at,last_seen_at) VALUES (?,?,?,?,?,?)').bind('smoke_session','smoke_admin',tokenHash,Math.floor(Date.now()/1000)+3600,1,1).run();jar.set('admin',`gf_play_session=${adminToken}`);
 await call(0,'/api/play/auth',{action:'logout'});assert.equal((await call(0,'/api/play/auth')).authenticated,false);await call(0,'/api/play/auth',{action:'login',email:'pilot-0@example.test',password});
 for(let i=0;i<2;i++){assert.equal((await call(i,'/api/play/auth')).user.id,accounts[i]);await call(i,'/api/play',{action:'update_profile',nickname:`pilot_${i}`,city:'Warszawa'});await call(i,'/api/play',{action:'set_home_court',courtId:'court_lazienkowski',sport:'football'});await call(i,'/api/play',{action:'checkin',courtId:'court_lazienkowski'});await call(i,'/api/play/discovery',{action:'set_ready',courtId:'court_lazienkowski',sport:'football'});}
 const discovery=await call(0,'/api/play/discovery?sport=football');assert.equal(discovery.courts.find(c=>c.id==='court_lazienkowski').readyNow,2);assert.equal(discovery.courts.find(c=>c.id==='court_lazienkowski').playersNow,2);
 const start=new Date(Date.now()+600000).toISOString();
 const game=await call(0,'/api/play',{action:'create_game',courtId:'court_lazienkowski',sport:'football',format:'1v1',startsAt:start});
 const action=(who,act,extra={},expected=200)=>call(who,'/api/play/game-room',{action:act,gameId:game.gameId,...extra},expected);
 await action(1,'join_game');assert.equal((await call(0,`/api/play/game-room?gameId=${game.gameId}`)).lifecycle,'full');await action(2,'join_game',{},400);await action(0,'start_game',{},400);await action(0,'generate_teams');await action(0,'set_game_ready');await action(1,'set_game_ready');assert.equal((await call(0,`/api/play/game-room?gameId=${game.gameId}`)).lifecycle,'ready');await action(0,'start_game');await action(1,'leave_game',{},400);await action(0,'submit_result',{scoreA:3,scoreB:1});await action(0,'confirm_result',{},400);
 await Promise.all([action(1,'confirm_result'),action(1,'confirm_result')]);
 const completed=await call(0,`/api/play/game-room?gameId=${game.gameId}`);assert.equal(completed.game.status,'completed');await action(1,'confirm_result');
 assert.equal((await db.prepare('SELECT count(*) n FROM elo_history WHERE game_id=?').bind(game.gameId).first()).n,2);
 assert.equal((await db.prepare('SELECT count(*) n FROM play_game_settlements WHERE game_id=?').bind(game.gameId).first()).n,1);
 for(const id of accounts.slice(0,2))assert.equal((await db.prepare("SELECT games FROM player_sports WHERE user_id=? AND sport='football'").bind(id).first()).games,1);
 assert.equal((await call(0,'/api/play/rankings?sport=football&scope=court')).players.length,2);
 // Quick Match never auto-joins a game outside the player's local city.
 await db.prepare("INSERT INTO courts (id,slug,name,city,latitude,longitude,sports,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)").bind('court_quick_remote','quick-remote','Quick Match remote court','Łódź',51.76,19.46,'["football"]',1,1).run();
 const quickStart=minutes=>new Date(Date.now()+minutes*60000).toISOString();
 const quickCreate=(courtId,minutes=10,format='1v1')=>call(0,'/api/play',{action:'create_game',courtId,sport:'football',format,startsAt:quickStart(minutes)});
 const remoteGame=await quickCreate('court_quick_remote',3);
 assert.equal((await call(1,'/api/play/quick-match',{sport:'football',format:'1v1'})).matched,false);
 assert.equal((await call(0,`/api/play/game-room?gameId=${remoteGame.gameId}`)).players.length,1);
 const cityGame=await quickCreate('court_agrykola',4);
 const homeGame=await quickCreate('court_lazienkowski',10);
 assert.equal((await call(1,'/api/play/quick-match',{sport:'football',format:'1v1'})).gameId,homeGame.gameId,'Home Court takes priority over an earlier game in the same city');
 assert.equal((await call(2,'/api/play/quick-match',{sport:'football',format:'1v1'})).gameId,cityGame.gameId,'Without Home Court, use the profile city and skip earlier remote games');
 await call(3,'/api/play',{action:'update_profile',city:'Łódź'});
 assert.equal((await call(3,'/api/play/quick-match',{sport:'football',format:'1v1'})).gameId,remoteGame.gameId,'Profile city can match its own local game');
 assert.equal((await call(2,'/api/play/quick-match',{sport:'football',format:'1v1'})).matched,false,'Full games are excluded');
 const homeCityGame=await quickCreate('court_agrykola',10,'2v2');
 await call(3,'/api/play',{action:'set_home_court',courtId:'court_lazienkowski',sport:'football'});
 assert.equal((await call(3,'/api/play/quick-match',{sport:'football',format:'2v2'})).gameId,homeCityGame.gameId,'Home Court city takes priority over the profile city');
 await call(3,'/api/play',{action:'update_profile',city:'Warszawa'});
 await db.prepare("UPDATE games SET status='cancelled' WHERE id IN (?,?,?,?)").bind(remoteGame.gameId,cityGame.gameId,homeGame.gameId,homeCityGame.gameId).run();
 const challenge=await call(0,'/api/play',{action:'create_challenge',courtId:'court_lazienkowski',sport:'football',format:'1v1',startsAt:start,invitedUserIds:[accounts[1]],message:'Gramy?'});assert.ok((await call(1,'/api/play/social')).notifications.some(n=>n.entityId===challenge.challengeId));const accepted=await call(1,'/api/play',{action:'respond_challenge',challengeId:challenge.challengeId,response:'accepted'});assert.ok(accepted.gameId);await call(1,'/api/play',{action:'respond_challenge',challengeId:challenge.challengeId,response:'accepted'});assert.equal((await db.prepare('SELECT count(*) n FROM games WHERE id=?').bind(accepted.gameId).first()).n,1);assert.equal((await call(0,`/api/play/game-room?gameId=${accepted.gameId}`)).players.length,2);
 const tournament=await call(0,'/api/play/tournaments',{action:'create',courtId:'court_lazienkowski',sport:'football',name:'Pilot bracket',format:'1v1',maxEntries:4,startsAt:start});for(let i=1;i<4;i++)await call(i,'/api/play/tournaments',{action:'join',tournamentId:tournament.tournamentId});let t=await call(0,'/api/play/tournaments',{action:'start',tournamentId:tournament.tournamentId});assert.equal(t.matches.length,3);
 const first=t.matches.filter(m=>m.round===1);for(const m of first){const a=accounts.indexOf(m.playerAUserId),b=accounts.indexOf(m.playerBUserId);await call(a,'/api/play/tournaments',{action:'submit_match',tournamentId:tournament.tournamentId,matchId:m.id,scoreA:2,scoreB:1});await call(a,'/api/play/tournaments',{action:'confirm_match',tournamentId:tournament.tournamentId,matchId:m.id},400);t=await call(b,'/api/play/tournaments',{action:'confirm_match',tournamentId:tournament.tournamentId,matchId:m.id});await call(a,'/api/play/tournaments',{action:'submit_match',tournamentId:tournament.tournamentId,matchId:m.id,scoreA:1,scoreB:3},400);}
 const final=t.matches.find(m=>m.round===2);assert.ok(final.playerAUserId&&final.playerBUserId);assert.equal(final.status,'ready');const fa=accounts.indexOf(final.playerAUserId),fb=accounts.indexOf(final.playerBUserId);await call(fa,'/api/play/tournaments',{action:'submit_match',tournamentId:tournament.tournamentId,matchId:final.id,scoreA:4,scoreB:1});t=await call(fb,'/api/play/tournaments',{action:'confirm_match',tournamentId:tournament.tournamentId,matchId:final.id});assert.equal(t.tournament.status,'completed');
 const submission=await call(0,'/api/play/courts/submissions',{name:'Pilot verification court',city:'Warszawa',district:'Mokotów',latitude:52.19,longitude:21.01,sports:['football'],surface:'hard',lighting:true,isFree:true},201);assert.equal((await call(0,'/api/play/discovery?sport=football')).courts.some(c=>c.name==='Pilot verification court'),false);await call(0,'/api/play/courts/moderate',{},403);const approved=await call('admin','/api/play/courts/moderate',{action:'approve',submissionId:submission.id});assert.ok(approved.courtId);assert.ok((await call(0,'/api/play/discovery?sport=football')).courts.some(c=>c.id===approved.courtId));
 const dup=await call(0,'/api/play/courts/submissions',{name:'Duplicate pilot court',city:'Warszawa',latitude:52.19001,longitude:21.01001,sports:['football'],surface:'hard',isFree:true},201);await call('admin','/api/play/courts/moderate',{action:'approve',submissionId:dup.id},409);await call('admin','/api/play/courts/moderate',{action:'link',submissionId:dup.id,courtId:approved.courtId});
 const report=await call(0,'/api/play',{action:'report_court',courtId:'court_lazienkowski',category:'surface',description:'Nawierzchnia wymaga naprawy.'});await call(1,'/api/play',{action:'support_report',reportId:report.reportId});await call(1,'/api/play',{action:'support_report',reportId:report.reportId});assert.equal((await call(0,'/api/play/court?id=court_lazienkowski&sport=football')).reports.find(r=>r.id===report.reportId).supportCount,1);
 const project={id:'GF-smoke',name:'Redesign Łazienkowski',type:'Renowacja',sport:'Piłka nożna 3×3',length:15,width:10,surface:'Akryl sportowy',base:'#246f70',zone:'#ef744e',outside:'#dedfd4',lineColor:'#ffffff',lines:true,pattern:'Organic Flow',graphicOpacity:100,graphicScale:100,graphicRotation:0,scene:'day',objects:[],status:'Szkic',date:'3.10.2026'};const redesign=await call(0,'/api/projects',{action:'save',courtId:'court_lazienkowski',source:'play-redesign',project},201);await call(0,'/api/projects',{action:'publish',id:redesign.id});for(let i=0;i<2;i++)await call(1,'/api/projects',{action:'support',id:redesign.id});assert.equal((await call(1,`/api/projects?id=${redesign.id}`)).projectRecord.supportCount,1);
 const csrf=await mf.dispatchFetch('https://gamefields.test/api/play',{method:'POST',headers:{Origin:'https://unrelated.test',Cookie:jar.get(0),'Content-Type':'application/json'},body:JSON.stringify({action:'checkout'})});assert.equal(csrf.status,403);
 console.log(`PASS: ${checks} HTTP checks; four independent accounts; login/logout, onboarding, READY, game lifecycle, concurrent ELO confirmation, rankings, local Quick Match, challenge, 4-player bracket, moderated submissions, duplicate detection, report/support and Builder publication.`);
}finally{await mf.dispose();}
