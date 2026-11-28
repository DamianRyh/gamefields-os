import {env} from 'cloudflare:workers';
import {wjson,sha,validWorkId,smallBody} from '@/lib/workshop-server';
/* Owner list of BO campaign pages (sales leads): city, budget, voting date, supporters and, when the organiser asked
   for help with the application, the e-mail. Same WORKSHOP_ADMIN_KEY as the Workshop panel. */
const db=()=>{if(!env.DB)throw Error('Database unavailable');return env.DB};
async function ok(r:Request){const key=env.WORKSHOP_ADMIN_KEY,given=r.headers.get('x-gf-admin')||'';if(!key)return 'unset';if(given.length<8)return false;return (await sha(given))===(await sha(key))}
const deny=(a:'unset'|boolean)=>a==='unset'?wjson({error:'Panel nie jest skonfigurowany: ustaw sekret WORKSHOP_ADMIN_KEY.'},503):wjson({error:'Nieprawidłowy klucz'},401);
type R={id:string;title:string;place:string;city:string;budget_name:string|null;budget_url:string|null;vote_until:string|null;organizer:string|null;contact_email:string|null;supporters:number;approved:number;hidden:number;created_at:number};
export async function GET(request:Request){const a=await ok(request);if(a!==true)return deny(a);try{
 const rows=await db().prepare('SELECT id,title,place,city,budget_name,budget_url,vote_until,organizer,contact_email,supporters,approved,hidden,created_at FROM studio_campaigns ORDER BY created_at DESC LIMIT 200').all();
 return wjson({items:(rows.results as R[]).map(r=>({id:r.id,title:r.title,place:r.place,city:r.city,budgetName:r.budget_name,budgetUrl:r.budget_url,voteUntil:r.vote_until,organizer:r.organizer,email:r.contact_email,supporters:r.supporters,approved:!!r.approved,hidden:!!r.hidden,createdAt:new Date(r.created_at).toISOString()}))})}catch{return wjson({error:'Baza jest chwilowo niedostępna'},503)}}
export async function POST(request:Request){const a=await ok(request);if(a!==true)return deny(a);try{const b=JSON.parse(await smallBody(request,300)||'{}');if(!validWorkId(b.id))return wjson({error:'Nie znaleziono'},404);
 if('hidden' in b)await db().prepare('UPDATE studio_campaigns SET hidden=? WHERE id=?').bind(b.hidden?1:0,b.id).run();
 if('approved' in b)await db().prepare('UPDATE studio_campaigns SET approved=? WHERE id=?').bind(b.approved?1:0,b.id).run();
 return wjson({ok:true})}catch{return wjson({error:'Nie udało się zapisać zmiany'},503)}}
