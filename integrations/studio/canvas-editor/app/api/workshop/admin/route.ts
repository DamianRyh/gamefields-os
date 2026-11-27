import {env} from 'cloudflare:workers';
import {wjson,sha,validWorkId,smallBody} from '@/lib/workshop-server';
/* Owner panel API: every Workshop design with pseudonym, social media consent, contest, likes and "Stworzono podobnych";
   marks finalists and the winner, hides a design. Requires the WORKSHOP_ADMIN_KEY secret in the x-gf-admin header. */
const db=()=>{if(!env.DB)throw Error('Database unavailable');return env.DB};
async function authorised(r:Request){const key=env.WORKSHOP_ADMIN_KEY,given=r.headers.get('x-gf-admin')||'';if(!key)return 'unset';if(given.length<8)return false;return (await sha(given))===(await sha(key))}
const deny=(a:'unset'|boolean)=>a==='unset'?wjson({error:'Panel nie jest skonfigurowany: ustaw sekret WORKSHOP_ADMIN_KEY.'},503):wjson({error:'Nieprawidłowy klucz'},401);
export async function GET(request:Request){const a=await authorised(request);if(a!==true)return deny(a);try{const u=new URL(request.url),contest=u.searchParams.get('contest')||'',consent=u.searchParams.get('consent')==='1';
 if(contest&&!/^\d{4}-\d{2}$/.test(contest))return wjson({error:'Nieprawidłowy konkurs'},400);
 const where=['1=1'],args:unknown[]=[];if(contest){where.push('contest=?');args.push(contest)}if(consent)where.push('social_consent=1');
 const rows=await db().prepare('SELECT id,title,created_at,nickname,social_consent,contest,likes,remixes,featured,hidden FROM studio_workshop_designs WHERE '+where.join(' AND ')+' ORDER BY likes DESC,remixes DESC,created_at DESC LIMIT 200').bind(...args).all();
 type R={id:string;title:string;created_at:number;nickname:string|null;social_consent:number;contest:string|null;likes:number;remixes:number;featured:string|null;hidden:number};
 return wjson({items:(rows.results as R[]).map((r)=>({id:r.id,title:r.title,createdAt:new Date(r.created_at).toISOString(),nickname:r.nickname,consent:!!r.social_consent,contest:r.contest,likes:r.likes,remixes:r.remixes,featured:r.featured,hidden:!!r.hidden}))})}catch{return wjson({error:'Baza jest chwilowo niedostępna'},503)}}
export async function POST(request:Request){const a=await authorised(request);if(a!==true)return deny(a);try{const raw=await smallBody(request,300);const b=JSON.parse(raw||'{}');if(!validWorkId(b.id))return wjson({error:'Nie znaleziono projektu'},404);
 if('featured' in b){if(![null,'finalist','winner'].includes(b.featured))return wjson({error:'Nieprawidłowe wyróżnienie'},400);await db().prepare('UPDATE studio_workshop_designs SET featured=? WHERE id=?').bind(b.featured,b.id).run()}
 if('hidden' in b)await db().prepare('UPDATE studio_workshop_designs SET hidden=? WHERE id=?').bind(b.hidden?1:0,b.id).run();
 return wjson({ok:true})}catch{return wjson({error:'Nie udało się zapisać zmiany'},503)}}
