import {env} from 'cloudflare:workers';
import {publicWorkshopProject} from '@/lib/workshop-project';
import {workshopThumbnail} from '@/lib/generated/workshop-thumbnail.mjs';
import {cleanCampaign} from '@/lib/campaign';
import {wjson,sha,validWorkId,smallBody,workshopHeaders} from '@/lib/workshop-server';
/* BO campaign pages: POST creates one (sanitised design, the same public scope as the Workshop: no private name,
   text or logos), GET ?id= reads it (never the e-mail), GET ?id=&format=svg is the top-view thumbnail,
   DELETE withdraws it with the organiser's key. At most 3 new pages per network in 10 minutes. */
const db=()=>{if(!env.DB)throw Error('Database unavailable');return env.DB};
type Row={id:string;project_json:string;title:string;place:string;city:string;budget_name:string|null;budget_url:string|null;vote_until:string|null;organizer:string|null;about:string|null;supporters:number;created_at:number};
const sameOrigin=(r:Request)=>r.headers.get('origin')===new URL(r.url).origin;
export async function GET(request:Request){try{const u=new URL(request.url),id=u.searchParams.get('id');if(!validWorkId(id))return wjson({error:'Nie znaleziono strony kampanii'},404);
 const r=await db().prepare('SELECT id,project_json,title,place,city,budget_name,budget_url,vote_until,organizer,about,supporters,created_at FROM studio_campaigns WHERE id=? AND hidden=0').bind(id).first<Row>();
 if(!r)return wjson({error:'Ta strona kampanii została wycofana.'},404);const project=publicWorkshopProject(JSON.parse(r.project_json));
 if(u.searchParams.get('format')==='svg')return new Response(workshopThumbnail(project),{headers:{...workshopHeaders,'Content-Type':'image/svg+xml;charset=utf-8','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; sandbox"}});
 return wjson({campaign:{id:r.id,title:r.title,place:r.place,city:r.city,budgetName:r.budget_name,budgetUrl:r.budget_url,voteUntil:r.vote_until,organizer:r.organizer,about:r.about,supporters:r.supporters,createdAt:new Date(r.created_at).toISOString()},project})}
 catch{return wjson({error:'Strona kampanii jest chwilowo niedostępna'},503)}}
export async function POST(request:Request){if(!sameOrigin(request))return wjson({error:'Niedozwolone źródło'},403);try{
 const raw=await smallBody(request,40000);if(raw===null)return wjson({error:'Projekt jest zbyt duży'},413);
 let body:{project?:unknown;campaign?:Record<string,unknown>;publicConsent?:unknown;helpConsent?:unknown};try{body=JSON.parse(raw)}catch{return wjson({error:'Nieprawidłowe dane'},400)}
 if(body.publicConsent!==true)return wjson({error:'Potwierdź, że strona kampanii będzie publiczna.'},400);
 let project,c;try{project=publicWorkshopProject(body.project)}catch{return wjson({error:'Wybierz w projekcie konstrukcję, wzór i paletę.'},400)}
 try{c=cleanCampaign(body.campaign||{})}catch(e){return wjson({error:(e as Error).message},400)}
 const email=body.helpConsent===true?c.email:null;if(body.helpConsent===true&&!email)return wjson({error:'Podaj e-mail, jeśli chcesz pomocy we wniosku.'},400);
 const now=Date.now(),bucket=await sha('campaign:'+(request.headers.get('cf-connecting-ip')||'local-preview')+new Date().toISOString().slice(0,10)),id=crypto.randomUUID(),key=crypto.randomUUID();
 const res=await db().prepare('INSERT INTO studio_campaigns(id,project_json,title,place,city,budget_name,budget_url,vote_until,organizer,about,contact_email,created_at,submitter_hash,edit_key_hash) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM studio_campaigns WHERE submitter_hash=? AND created_at>?)<3')
  .bind(id,JSON.stringify(project),c.title,c.place,c.city,c.budgetName??null,c.budgetUrl??null,c.voteUntil??null,c.organizer??null,c.about??null,email,now,bucket,await sha(key),bucket,now-600000).run();
 if(!res.meta.changes)return wjson({error:'Utwórz kolejną stronę za kilka minut.'},429);
 return wjson({id,key},201)}catch{return wjson({error:'Nie udało się utworzyć strony. Spróbuj ponownie.'},503)}}
export async function DELETE(request:Request){if(!sameOrigin(request))return wjson({error:'Niedozwolone źródło'},403);try{const b=JSON.parse(await smallBody(request,300)||'{}');
 if(!validWorkId(b.id)||!validWorkId(b.key))return wjson({error:'Brak uprawnienia'},403);
 const r=await db().prepare('DELETE FROM studio_campaigns WHERE id=? AND edit_key_hash=?').bind(b.id,await sha(b.key)).run();if(!r.meta.changes)return wjson({error:'Brak uprawnienia lub strona już wycofana'},403);
 await db().prepare('DELETE FROM studio_campaign_support WHERE campaign_id=?').bind(b.id).run();return wjson({deleted:true})}catch{return wjson({error:'Nie udało się wycofać strony'},503)}}
