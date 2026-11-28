import {env} from 'cloudflare:workers';
import {wjson,sha,validWorkId,voteOrigin,smallBody,workshopHeaders} from '@/lib/workshop-server';
/* "Podoba mi się" for Workshop designs: one like per design per network (hash of the IP, the address itself is not stored),
   at most 60 likes an hour from one network. POST likes, DELETE takes the like back. text/plain body, so the homepage
   on gamefields.eu calls it without a CORS preflight. */
const db=()=>{if(!env.DB)throw Error('Database unavailable');return env.DB};
async function parse(r:Request){if(!voteOrigin(r))return {error:wjson({error:'Niedozwolone źródło'},403)};const raw=await smallBody(r,200);let id:unknown;try{id=JSON.parse(raw||'{}').id}catch{}if(!validWorkId(id))return {error:wjson({error:'Nie znaleziono projektu'},404)};return {id,voter:await sha('like:'+(r.headers.get('cf-connecting-ip')||'local-preview'))}}
async function likes(id:string){const row=await db().prepare('SELECT likes FROM studio_workshop_designs WHERE id=? AND hidden=0').bind(id).first<{likes:number}>();return row?row.likes:null}
export async function POST(request:Request){try{const p=await parse(request);if(p.error)return p.error;const {id,voter}=p as {id:string;voter:string};
 if(await likes(id)===null)return wjson({error:'Projekt został wycofany'},404);
 const recent=await db().prepare("SELECT COUNT(*) AS n FROM studio_workshop_votes WHERE voter_hash=? AND kind='like' AND created_at>?").bind(voter,Date.now()-3600000).first<{n:number}>();if((recent?.n||0)>=60)return wjson({error:'Za dużo polubień naraz. Spróbuj za chwilę.'},429);
 const r=await db().prepare("INSERT OR IGNORE INTO studio_workshop_votes(design_id,voter_hash,kind,created_at) VALUES(?,?,'like',?)").bind(id,voter,Date.now()).run();if(r.meta.changes)await db().prepare('UPDATE studio_workshop_designs SET likes=likes+1 WHERE id=?').bind(id).run();
 return wjson({id,liked:true,likes:await likes(id)})}catch{return wjson({error:'Nie udało się zapisać polubienia'},503)}}
export async function DELETE(request:Request){try{const p=await parse(request);if(p.error)return p.error;const {id,voter}=p as {id:string;voter:string};
 const r=await db().prepare("DELETE FROM studio_workshop_votes WHERE design_id=? AND voter_hash=? AND kind='like'").bind(id,voter).run();if(r.meta.changes)await db().prepare('UPDATE studio_workshop_designs SET likes=MAX(0,likes-1) WHERE id=?').bind(id).run();
 return wjson({id,liked:false,likes:await likes(id)})}catch{return wjson({error:'Nie udało się cofnąć polubienia'},503)}}
export function OPTIONS(){return new Response(null,{status:204,headers:{...workshopHeaders,'Access-Control-Allow-Methods':'POST, DELETE','Access-Control-Allow-Headers':'Content-Type'}})}
