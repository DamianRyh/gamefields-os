import {env} from 'cloudflare:workers';
import {wjson,sha,validWorkId,voteOrigin,smallBody,workshopHeaders} from '@/lib/workshop-server';
/* "Popieram": one show of support per campaign per network (hash of the IP, the address is not stored), at most 60 an
   hour from one network. It is not a vote in the participatory budget; the page says so. */
const db=()=>{if(!env.DB)throw Error('Database unavailable');return env.DB};
async function parse(r:Request){if(!voteOrigin(r))return {error:wjson({error:'Niedozwolone źródło'},403)};let id:unknown;try{id=JSON.parse(await smallBody(r,200)||'{}').id}catch{}if(!validWorkId(id))return {error:wjson({error:'Nie znaleziono strony kampanii'},404)};return {id,voter:await sha('support:'+(r.headers.get('cf-connecting-ip')||'local-preview'))}}
const count=async(id:string)=>(await db().prepare('SELECT supporters FROM studio_campaigns WHERE id=? AND hidden=0').bind(id).first<{supporters:number}>())?.supporters??null;
export async function POST(request:Request){try{const p=await parse(request);if('error' in p)return p.error;const {id,voter}=p as {id:string;voter:string};
 if(await count(id)===null)return wjson({error:'Ta strona kampanii została wycofana.'},404);
 const recent=await db().prepare('SELECT COUNT(*) AS n FROM studio_campaign_support WHERE voter_hash=? AND created_at>?').bind(voter,Date.now()-3600000).first<{n:number}>();if((recent?.n||0)>=60)return wjson({error:'Spróbuj za chwilę.'},429);
 const r=await db().prepare('INSERT OR IGNORE INTO studio_campaign_support(campaign_id,voter_hash,created_at) VALUES(?,?,?)').bind(id,voter,Date.now()).run();if(r.meta.changes)await db().prepare('UPDATE studio_campaigns SET supporters=supporters+1 WHERE id=?').bind(id).run();
 return wjson({id,supported:true,supporters:await count(id),already:!r.meta.changes})}catch{return wjson({error:'Nie udało się zapisać poparcia'},503)}}
export async function DELETE(request:Request){try{const p=await parse(request);if('error' in p)return p.error;const {id,voter}=p as {id:string;voter:string};
 const r=await db().prepare('DELETE FROM studio_campaign_support WHERE campaign_id=? AND voter_hash=?').bind(id,voter).run();if(r.meta.changes)await db().prepare('UPDATE studio_campaigns SET supporters=MAX(0,supporters-1) WHERE id=?').bind(id).run();
 return wjson({id,supported:false,supporters:await count(id)})}catch{return wjson({error:'Nie udało się cofnąć poparcia'},503)}}
export function OPTIONS(){return new Response(null,{status:204,headers:{...workshopHeaders,'Access-Control-Allow-Methods':'POST, DELETE','Access-Control-Allow-Headers':'Content-Type'}})}
