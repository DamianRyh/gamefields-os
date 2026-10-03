import { asc, eq } from "drizzle-orm";
import { getDb, getD1 } from "@/db";
import { courtSubmissions } from "@/db/play-courts";
import { courts, users } from "@/db/schema";
import { requirePlayAdmin } from "@/lib/play-admin";
import { requireCurrentPlayUser } from "@/lib/play-auth";
import { courtDuplicates } from "@/lib/play-courts";
import { assertSameOrigin, playError } from "@/lib/play-http";

const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function GET() {
 try {
  const db=getDb();await requirePlayAdmin(await requireCurrentPlayUser());
  const [rows,existing]=await Promise.all([
   db.select({submission:courtSubmissions,submitterNickname:users.nickname,submitterEmail:users.email}).from(courtSubmissions).innerJoin(users,eq(users.id,courtSubmissions.submitterUserId)).where(eq(courtSubmissions.status,"pending")).orderBy(asc(courtSubmissions.createdAt)).limit(100),
   db.select().from(courts),
  ]);
  return json({ok:true,submissions:rows.map(r=>({...r.submission,sports:JSON.parse(r.submission.sports),submitterNickname:r.submitterNickname,submitterEmail:r.submitterEmail,duplicates:courtDuplicates(r.submission,existing)}))});
 }catch(e){return playError(e);}
}
export async function POST(request:Request) {
 try {
  assertSameOrigin(request);
  const db=getDb(),d1=getD1(),user=await requirePlayAdmin(await requireCurrentPlayUser()),body=await request.json();
  const submission=(await db.select().from(courtSubmissions).where(eq(courtSubmissions.id,String(body.submissionId||""))).limit(1))[0];
  if(!submission)throw new Error("SUBMISSION_NOT_FOUND");
  if(submission.status!=="pending")return json({ok:true,status:submission.status,courtId:submission.publishedCourtId});
  const action=String(body.action||""),stamp=Math.floor(Date.now()/1000),note=String(body.note||"").trim().slice(0,500)||null;
  if(action==="reject") {
   await d1.prepare("UPDATE play_court_submissions SET status='rejected',reviewed_by_user_id=?,reviewed_at=?,updated_at=?,review_note=? WHERE id=? AND status='pending'").bind(user.id,stamp,stamp,note,submission.id).run();
   return json({ok:true,status:"rejected"});
  }
  const existing=await db.select().from(courts),duplicates=courtDuplicates(submission,existing);
  if(action==="link") {
   const courtId=String(body.courtId||"");
   if(!duplicates.some(d=>d.id===courtId))throw new Error("DUPLICATE_NOT_FOUND");
   await d1.prepare("UPDATE play_court_submissions SET status='approved',published_court_id=?,reviewed_by_user_id=?,reviewed_at=?,updated_at=?,review_note=? WHERE id=? AND status='pending'").bind(courtId,user.id,stamp,stamp,note||"Połączono z istniejącym obiektem",submission.id).run();
   return json({ok:true,status:"approved",courtId,linked:true});
  }
  if(action!=="approve")throw new Error("UNKNOWN_ACTION");
  if(duplicates.length)return json({ok:false,error:"DUPLICATE_COURT",duplicates},409);
  const courtId=`court_${submission.id}`;
  const slug=submission.name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,50)+"-"+submission.id.slice(-8);
  const sportChecks=(JSON.parse(submission.sports) as string[]).map(()=>"instr(c.sports,?)>0").join(" OR ");
  const results=await d1.batch([
   d1.prepare(`INSERT OR IGNORE INTO courts (id,slug,name,city,district,address,latitude,longitude,sports,surface,lighting,is_free,image_url,created_at,updated_at) SELECT ?,?,name,city,district,address,latitude,longitude,sports,surface,lighting,is_free,image_url,?,? FROM play_court_submissions s WHERE id=? AND status='pending' AND NOT EXISTS (SELECT 1 FROM courts c WHERE abs(c.latitude-s.latitude)<0.00072 AND abs(c.longitude-s.longitude)<0.00116 AND (${sportChecks}))`).bind(courtId,slug,stamp,stamp,submission.id,...JSON.parse(submission.sports).map((s:string)=>`"${s}"`)),
   d1.prepare("UPDATE play_court_submissions SET status='approved',published_court_id=?,reviewed_by_user_id=?,reviewed_at=?,updated_at=?,review_note=? WHERE id=? AND status='pending' AND EXISTS (SELECT 1 FROM courts WHERE id=?)").bind(courtId,user.id,stamp,stamp,note,submission.id,courtId),
  ]);
  if(!results[1].meta.changes)throw new Error("DUPLICATE_COURT");
  return json({ok:true,status:"approved",courtId,slug});
 }catch(e){return playError(e);}
}
