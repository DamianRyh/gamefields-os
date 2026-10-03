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

export async function GET(request:Request){
  try{
    const user=await requireCurrentPlayUser();
    const db=getD1();
    const url=new URL(request.url);
    const sport=url.searchParams.get("sport")||"football";
    if(!isPlaySport(sport)) throw new Error("INVALID_SPORT");
    const city=url.searchParams.get("city")||user.city;
    const scope=url.searchParams.get("scope")==="district"?"district":"court";
    const season=monthWindow(0);

    if(scope==="district"){
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
      `).bind(sport,city,season.from,season.to).all<any>()).results;
      const ranking=rows.map((r:any)=>({...r,score:Number(r.matches)*10+Number(r.players)*3+Number(r.activeDays)*5})).sort((a:any,b:any)=>b.score-a.score||Number(b.matches)-Number(a.matches)||String(a.name).localeCompare(String(b.name))).map((r:any,i:number)=>({...r,rank:i+1}));
      return Response.json({ok:true,scope,sport,city,season,formula:{match:10,player:3,activeDay:5},ranking},{headers:{"Cache-Control":"no-store"}});
    }

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
    `).bind(sport,city,season.from,season.to).all<any>()).results;
    const ranking=rows.map((r:any)=>({...r,score:Number(r.matches)*10+Number(r.players)*3+Number(r.activeDays)*5})).sort((a:any,b:any)=>b.score-a.score||Number(b.matches)-Number(a.matches)||String(a.name).localeCompare(String(b.name))).map((r:any,i:number)=>({...r,rank:i+1}));
    return Response.json({ok:true,scope,sport,city,season,formula:{match:10,player:3,activeDay:5},ranking},{headers:{"Cache-Control":"no-store"}});
  }catch(error){return playError(error);}
}
