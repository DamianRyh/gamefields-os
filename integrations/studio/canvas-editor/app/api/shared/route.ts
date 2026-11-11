import {env} from 'cloudflare:workers';
import {shareProject,SHARE_MAX_BYTES,SHARE_LIFETIME,validShareId,validShareKey,shareHash,sharedRevision} from '@/lib/shared-project';
import {boundedText} from '@/lib/studio-http';
const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'};
const json=(value:unknown,status=200)=>Response.json(value,{status,headers});
const db=()=>{if(!env.DB)throw Error('Database unavailable');return env.DB};
const allowed=(request:Request)=>request.headers.get('origin')===new URL(request.url).origin;
export async function GET(request:Request){
 const id=new URL(request.url).searchParams.get('id')||'',key=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';
 if(!validShareId(id)||!validShareKey(key))return json({error:'Link jest nieprawidłowy, wygasł lub został wycofany.'},404);
 try{await db().prepare('DELETE FROM studio_shared_projects WHERE id=? AND expires_at<=?').bind(id,Date.now()).run();const row=await db().prepare('SELECT project_json,model_revision,created_at,expires_at FROM studio_shared_projects WHERE id=? AND read_hash=? AND revoked_at IS NULL AND expires_at>?').bind(id,await shareHash(key),Date.now()).first<{project_json:string;model_revision:string|null;created_at:number;expires_at:number}>();if(!row)return json({error:'Link jest nieprawidłowy, wygasł lub został wycofany.'},404);const project=shareProject(JSON.parse(row.project_json),true);return json({project,sourceChanged:sharedRevision(project)!==row.model_revision,createdAt:row.created_at,expiresAt:row.expires_at})}catch{return json({error:'Podgląd jest chwilowo niedostępny. Spróbuj ponownie.'},503)}
}
export async function POST(request:Request){
 if(!allowed(request))return json({error:'Niedozwolone źródło'},403);
 try{const raw=await boundedText(request,SHARE_MAX_BYTES);if(raw===null)return json({error:'Projekt przekracza 1,8 MB. Pobierz JSON lub udostępnij wersję bez logo i napisów.'},413);
  let p;try{const body=JSON.parse(raw||'');if(body.consent!==true||typeof body.includePrivate!=='boolean')throw Error();p=shareProject(body.project,body.includePrivate)}catch{return json({error:'Sprawdź projekt i potwierdź zakres udostępnienia.'},400)}
  const now=Date.now(),id=crypto.randomUUID(),key=crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-',''),deleteKey=crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
  const bucket=await shareHash((request.headers.get('cf-connecting-ip')||'local')+new Date(now).toISOString().slice(0,10));
  await db().prepare('DELETE FROM studio_shared_projects WHERE expires_at<=?').bind(now).run();
  const result=await db().prepare('INSERT INTO studio_shared_projects(id,project_json,model_revision,read_hash,delete_hash,created_at,expires_at,submitter_hash) SELECT ?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM studio_shared_projects WHERE submitter_hash=? AND created_at>?)<5').bind(id,JSON.stringify(p),sharedRevision(p),await shareHash(key),await shareHash(deleteKey),now,now+SHARE_LIFETIME,bucket,bucket,now-600000).run();
  if(!result.meta.changes)return json({error:'Utworzono już kilka linków. Spróbuj za kilka minut.'},429);
  return json({id,key,deleteKey,createdAt:now,expiresAt:now+SHARE_LIFETIME},201);
 }catch{return json({error:'Nie udało się utworzyć linku. Spróbuj ponownie.'},503)}
}
export async function DELETE(request:Request){
 if(!allowed(request))return json({error:'Niedozwolone źródło'},403);
 try{const raw=await boundedText(request,300);if(raw===null)return json({error:'Nieprawidłowe dane'},400);const {id,deleteKey}=JSON.parse(raw||'');if(typeof id!=='string'||typeof deleteKey!=='string'||!validShareId(id)||!validShareKey(deleteKey))return json({error:'Brak uprawnienia'},403);
  const result=await db().prepare("UPDATE studio_shared_projects SET revoked_at=?,project_json='{}' WHERE id=? AND delete_hash=? AND revoked_at IS NULL").bind(Date.now(),id,await shareHash(deleteKey)).run();if(!result.meta.changes)return json({error:'Brak uprawnienia lub link już wycofany.'},403);return json({revoked:true});
 }catch{return json({error:'Nie udało się wycofać linku.'},503)}
}
