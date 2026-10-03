import { getD1 } from "@/db";
import { requireCurrentPlayUser } from "@/lib/play-auth";
import { isPlaySport } from "@/lib/play-engine";
import { playError } from "@/lib/play-http";

type Standing = {
  userId: string;
  nickname: string;
  avatarUrl: string | null;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  eloDelta: number;
};

function monthWindow(offset:number) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset + 1, 1));
  return {
    from: Math.floor(start.getTime()/1000),
    to: Math.floor(end.getTime()/1000),
    key: `${start.getUTCFullYear()}-${String(start.getUTCMonth()+1).padStart(2,"0")}`,
    label: start.toLocaleDateString("pl-PL",{month:"long",year:"numeric",timeZone:"UTC"}),
  };
}

export async function GET(request: Request) {
  try {
    const user = await requireCurrentPlayUser();
    const db = getD1();
    const url = new URL(request.url);
    const sport = url.searchParams.get("sport") || "football";
    if (!isPlaySport(sport)) throw new Error("INVALID_SPORT");

    const home = await db.prepare(
      "SELECT c.id,c.name,c.city,c.district FROM home_courts h JOIN courts c ON c.id=h.court_id WHERE h.user_id=? AND h.sport=?"
    ).bind(user.id, sport).first<{id:string;name:string;city:string;district:string|null}>();

    const scope = url.searchParams.get("scope") || "court";
    if (!["court","district","city"].includes(scope)) throw new Error("INVALID_SCOPE");

    const city = url.searchParams.get("city") || home?.city || user.city;
    const district = url.searchParams.get("district") || home?.district || "";
    const courtId = url.searchParams.get("courtId") || home?.id || "";
    const rawPeriod = url.searchParams.get("period") || "season";
    const period = ["season","previous","30d","all"].includes(rawPeriod) ? rawPeriod : "season";
    const currentSeason = monthWindow(0);
    const previousSeason = monthWindow(-1);
    const season = period === "previous" ? previousSeason : currentSeason;
    const since = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;

    let scopeSql = "c.city=?";
    let scopeArgs: unknown[] = [city];
    if (scope === "district") {
      if (!district) throw new Error("DISTRICT_REQUIRED");
      scopeSql = "c.city=? AND c.district=?";
      scopeArgs = [city,district];
    }
    if (scope === "court") {
      if (!courtId) throw new Error("COURT_REQUIRED");
      scopeSql = "g.court_id=?";
      scopeArgs = [courtId];
    }

    let periodSql = "";
    let periodArgs: unknown[] = [];
    if (period === "30d") {
      periodSql = "AND g.result_confirmed_at>=?";
      periodArgs = [since];
    } else if (period === "season" || period === "previous") {
      periodSql = "AND g.result_confirmed_at>=? AND g.result_confirmed_at<?";
      periodArgs = [season.from,season.to];
    }
    const args = [sport, ...scopeArgs, ...periodArgs];

    const sql = `
      WITH eligible AS (
        SELECT
          gp.user_id AS userId,
          u.nickname AS nickname,
          u.avatar_url AS avatarUrl,
          gp.team AS team,
          g.id AS gameId,
          g.score_a AS scoreA,
          g.score_b AS scoreB,
          COALESCE(e.change,0) AS eloDelta
        FROM game_players gp
        JOIN games g ON g.id=gp.game_id
        JOIN users u ON u.id=gp.user_id
        JOIN courts c ON c.id=g.court_id
        LEFT JOIN elo_history e ON e.game_id=g.id AND e.user_id=gp.user_id
        WHERE g.sport=?
          AND g.status='completed'
          AND g.result_confirmed_at IS NOT NULL
          AND ${scopeSql}
          ${periodSql}
      )
      SELECT
        userId,
        nickname,
        avatarUrl,
        COUNT(*) AS matches,
        SUM(CASE WHEN scoreA=scoreB THEN 0 WHEN (team='A' AND scoreA>scoreB) OR (team='B' AND scoreB>scoreA) THEN 1 ELSE 0 END) AS wins,
        SUM(CASE WHEN scoreA=scoreB THEN 1 ELSE 0 END) AS draws,
        SUM(CASE WHEN scoreA=scoreB THEN 0 WHEN (team='A' AND scoreA>scoreB) OR (team='B' AND scoreB>scoreA) THEN 0 ELSE 1 END) AS losses,
        SUM(CASE WHEN team='A' THEN scoreA ELSE scoreB END) AS goalsFor,
        SUM(CASE WHEN team='A' THEN scoreB ELSE scoreA END) AS goalsAgainst,
        SUM(CASE WHEN scoreA=scoreB THEN 1 WHEN (team='A' AND scoreA>scoreB) OR (team='B' AND scoreB>scoreA) THEN 3 ELSE 0 END) AS points,
        SUM(eloDelta) AS eloDelta
      FROM eligible
      GROUP BY userId,nickname,avatarUrl
      ORDER BY points DESC,wins DESC,(goalsFor-goalsAgainst) DESC,eloDelta DESC,nickname ASC
      LIMIT 200
    `;

    const rows = (await db.prepare(sql).bind(...args).all<Standing>()).results;
    const standings = rows.map((row,index)=>({
      ...row,
      rank:index+1,
      goalDifference: Number(row.goalsFor)-Number(row.goalsAgainst),
      isMe: row.userId===user.id,
    }));

    const context = scope === "court"
      ? {label: home?.id===courtId ? home.name : "Court league",courtId}
      : scope === "district"
        ? {label: `${district}, ${city}`,district,city}
        : {label: city,city};

    return Response.json({
      ok:true,
      sport,
      scope,
      period,
      season:(period==="season"||period==="previous")?season:null,
      currentSeason,
      previousSeason,
      context,
      homeCourt:home,
      rules:{win:3,draw:1,loss:0,source:"confirmed_games"},
      myPosition:standings.find(row=>row.userId===user.id)?.rank || null,
      champion:standings[0] || null,
      standings,
    },{headers:{"Cache-Control":"no-store"}});
  } catch (error) {
    return playError(error);
  }
}
