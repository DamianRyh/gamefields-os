import { getD1 } from "@/db";
import { requireCurrentPlayUser } from "@/lib/play-auth";
import { isPlaySport, playerTier } from "@/lib/play-engine";
import { playError } from "@/lib/play-http";

export async function GET(request: Request) {
  try {
    const user = await requireCurrentPlayUser(), db = getD1();
    const url = new URL(request.url), sport = url.searchParams.get("sport") || "football";
    if (!isPlaySport(sport)) throw new Error("INVALID_SPORT");
    const home = await db.prepare("SELECT c.id,c.name,c.city,c.district FROM home_courts h JOIN courts c ON c.id=h.court_id WHERE h.user_id=? AND h.sport=?").bind(user.id,sport).first<{id:string;name:string;city:string;district:string|null}>();
    const city = url.searchParams.get("city") || user.city;
    const courtId = url.searchParams.get("courtId") || home?.id || "";
    const district = url.searchParams.get("district") || home?.district || "";
    const filters: Record<string,{sql:string;args:unknown[]}> = {
      city: {sql:"u.city=?",args:[city]},
      district: {sql:"EXISTS (SELECT 1 FROM home_courts h JOIN courts c ON c.id=h.court_id WHERE h.user_id=u.id AND h.sport=p.sport AND c.city=? AND c.district=?)",args:[city,district]},
      court: {sql:"(EXISTS (SELECT 1 FROM home_courts h WHERE h.user_id=u.id AND h.sport=p.sport AND h.court_id=?) OR EXISTS (SELECT 1 FROM game_players gp JOIN games g ON g.id=gp.game_id WHERE gp.user_id=u.id AND g.sport=p.sport AND g.court_id=? AND g.status='completed'))",args:[courtId,courtId]},
      friends: {sql:"(u.id=? OR EXISTS (SELECT 1 FROM play_player_follows f WHERE f.follower_user_id=? AND f.following_user_id=u.id))",args:[user.id,user.id]},
    };
    const scope = url.searchParams.get("scope") || "city";
    if (!filters[scope]) throw new Error("INVALID_SCOPE");
    const query = (name:string) => {
      const filter=filters[name];
      return db.prepare(`SELECT u.id AS userId,u.nickname,u.avatar_url AS avatarUrl,p.elo,p.games,p.wins,ROW_NUMBER() OVER (ORDER BY p.elo DESC,p.games DESC,u.nickname) AS rank FROM player_sports p JOIN users u ON u.id=p.user_id WHERE p.sport=? AND ${filter.sql}`).bind(sport,...filter.args);
    };
    const all = await Promise.all(Object.keys(filters).map(async name=>({name,rows:(await query(name).all<{userId:string;nickname:string;avatarUrl:string|null;elo:number;games:number;wins:number;rank:number}>()).results})));
    const ranks = Object.fromEntries(all.map(x=>[x.name,x.rows.find(p=>p.userId===user.id)?.rank || null]));
    const history = (await db.prepare("SELECT e.change AS delta FROM elo_history e JOIN games g ON g.id=e.game_id WHERE e.user_id=? AND e.sport=? ORDER BY g.result_confirmed_at DESC LIMIT 30").bind(user.id,sport).all<{delta:number}>()).results;
    let streak=0; for(const row of history){if(row.delta<=0)break;streak++;}
    return Response.json({ok:true,sport,scope,city,district,homeCourt:home,myRanks:ranks,streak,players:all.find(x=>x.name===scope)!.rows.slice(0,100).map(p=>({...p,tier:playerTier(p.elo),winRate:p.games?Math.round(p.wins/p.games*100):0}))},{headers:{"Cache-Control":"no-store"}});
  } catch(error){return playError(error);}
}
