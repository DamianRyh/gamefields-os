import { getD1 } from "@/db";
import { requireCurrentPlayUser } from "@/lib/play-auth";
import { isPlaySport } from "@/lib/play-engine";
import { playError } from "@/lib/play-http";

function monthWindow(offset=0){
  const now=new Date();
  const start=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+offset,1));
  const end=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+offset+1,1));
  return {from:Math.floor(start.getTime()/1000),to:Math.floor(end.getTime()/1000),label:start.toLocaleDateString("pl-PL",{month:"long",year:"numeric",timeZone:"UTC"})};
}

function scoreRows(rows:any[],key:"courtId"|"name"){
  return rows
    .map((r:any)=>({...r,score:Number(r.matches)*10+Number(r.players)*3+Number(r.activeDays)*5}))
    .sort((a:any,b:any)=>b.score-a.score||Number(b.matches)-Number(a.matches)||String(a.name).localeCompare(String(b.name)))
    .map((r:any,i:number)=>({...r,rank:i+1,key:String(r[key])}));
}

async function loadDistricts(db:ReturnType<typeof getD1>,sport:string,city:string,window:{from:number;to:number}){
  const rows=(await db.prepare(`
    SELECT
      COALESCE(c.district,'Other') AS name,
      c.city AS city,
      COUNT(DISTINCT g.id) AS matches,
      COUNT(DISTINCT gp.user_id) AS players,
      COUNT(DISTINCT date(g.result_confirmed_at,'unixepoch')) AS activeDays
    FROM games g
    JOIN courts c ON c.id=g.court_id
    JOIN game_players gp ON gp.game_id=g.id
    WHERE g.sport=? AND c.city=? AND g.status='completed' AND g.result_confirmed_at IS NOT NULL
      AND g.result_confirmed_at>=? AND g.result_confirmed_at<?
    GROUP BY COALESCE(c.district,'Other'),c.city
  `).bind(sport,city,window.from,window.to).all<any>()).results;
  return scoreRows(rows,"name");
}

async function loadCourts(db:ReturnType<typeof getD1>,sport:string,city:string,window:{from:number;to:number}){
  const rows=(await db.prepare(`
    SELECT
      c.id AS courtId,
      c.name AS name,
      c.city AS city,
      c.district AS district,
      COUNT(DISTINCT g.id) AS matches,
      COUNT(DISTINCT gp.user_id) AS players,
      COUNT(DISTINCT date(g.result_confirmed_at,'unixepoch')) AS activeDays
    FROM games g
    JOIN courts c ON c.id=g.court_id
    JOIN game_players gp ON gp.game_id=g.id
    WHERE g.sport=? AND c.city=? AND g.status='completed' AND g.result_confirmed_at IS NOT NULL
      AND g.result_confirmed_at>=? AND g.result_confirmed_at<?
    GROUP BY c.id,c.name,c.city,c.district
  `).bind(sport,city,window.from,window.to).all<any>()).results;
  return scoreRows(rows,"courtId");
}

export async function GET(request:Request){
  try{
    const user=await requireCurrentPlayUser();
    const db=getD1();
    const url=new URL(request.url);
    const sport=url.searchParams.get("sport")||"football";
    if(!isPlaySport(sport)) throw new Error("INVALID_SPORT");
    const city=url.searchParams.get("city")||user.city;
    const scope=url.searchParams.get("scope")==="district"?"district":"court";
    const season=monthWindow(0),previousSeason=monthWindow(-1);
    const current=scope==="district"?await loadDistricts(db,sport,city,season):await loadCourts(db,sport,city,season);
    const previous=scope==="district"?await loadDistricts(db,sport,city,previousSeason):await loadCourts(db,sport,city,previousSeason);
    const previousByKey=new Map(previous.map((r:any)=>[r.key,r]));
    const ranking=current.map((r:any)=>{
      const before=previousByKey.get(r.key) as any;
      return {
        ...r,
        previousRank:before?.rank??null,
        previousScore:before?.score??0,
        rankDelta:before?before.rank-r.rank:null,
        scoreDelta:r.score-(before?.score??0),
        trend:!before?"new":before.rank>r.rank?"up":before.rank<r.rank?"down":"flat",
      };
    });
    return Response.json({ok:true,scope,sport,city,season,previousSeason,formula:{match:10,player:3,activeDay:5},ranking},{headers:{"Cache-Control":"no-store"}});
  }catch(error){return playError(error);}
}
