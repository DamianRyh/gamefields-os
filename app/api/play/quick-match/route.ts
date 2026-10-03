import { getD1 } from "@/db";
import { requireCurrentPlayUser } from "@/lib/play-auth";
import { assertSameOrigin, playError } from "@/lib/play-http";
import { isPlaySport } from "@/lib/play-engine";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireCurrentPlayUser();
    const body = await request.json();
    const sport = String(body?.sport || "football");
    const format = String(body?.format || "");
    if (!isPlaySport(sport)) throw new Error("INVALID_SPORT");

    const d1 = getD1();
    const now = Math.floor(Date.now() / 1000);
    const horizon = now + 7 * 24 * 60 * 60;

    const home = await d1.prepare(
      "SELECT c.id,c.city FROM home_courts h JOIN courts c ON c.id=h.court_id WHERE h.user_id=? AND h.sport=?"
    ).bind(user.id, sport).first<{id:string;city:string}>();

    const rows = (await d1.prepare(`
      SELECT
        g.id,
        g.court_id AS courtId,
        g.format,
        g.starts_at AS startsAt,
        c.city,
        CASE WHEN g.court_id=? THEN 0 WHEN c.city=? THEN 1 ELSE 2 END AS priority,
        (SELECT count(*) FROM game_players gp WHERE gp.game_id=g.id) AS playerCount
      FROM games g
      JOIN courts c ON c.id=g.court_id
      WHERE g.sport=?
        AND g.status='open'
        AND g.starts_at>=?
        AND g.starts_at<=?
        AND (?='' OR g.format=?)
        AND NOT EXISTS (SELECT 1 FROM game_players mine WHERE mine.game_id=g.id AND mine.user_id=?)
        AND (SELECT count(*) FROM game_players gp2 WHERE gp2.game_id=g.id) < g.max_players
      ORDER BY priority ASC, g.starts_at ASC, playerCount DESC
      LIMIT 20
    `).bind(home?.id || "", home?.city || user.city, sport, now - 300, horizon, format, format, user.id)
      .all<{id:string;courtId:string;format:string;startsAt:number;city:string;priority:number;playerCount:number}>()).results;

    const candidate = rows[0];
    if (!candidate) return Response.json({ok:true,matched:false,reason:"NO_OPEN_GAME"},{headers:{"Cache-Control":"no-store"}});

    const stamp = Math.floor(Date.now() / 1000);
    const playerId = crypto.randomUUID();
    const inserted = await d1.prepare(`
      INSERT OR IGNORE INTO game_players (id,game_id,user_id,joined_at)
      SELECT ?,id,?,? FROM games
      WHERE id=? AND status='open'
        AND (SELECT count(*) FROM game_players WHERE game_id=?)<max_players
    `).bind(playerId,user.id,stamp,candidate.id,candidate.id).run();

    if (!inserted.meta.changes) throw new Error("STATE_CHANGED");

    await d1.prepare(
      "INSERT OR IGNORE INTO player_sports (id,user_id,sport,skill_level,elo,games,wins,losses,draws,provisional_games,updated_at) VALUES (?,?,?,?,1000,0,0,0,0,0,?)"
    ).bind(crypto.randomUUID(),user.id,sport,"beginner",stamp).run();

    return Response.json({ok:true,matched:true,gameId:candidate.id,format:candidate.format,courtId:candidate.courtId},{headers:{"Cache-Control":"no-store"}});
  } catch (error) {
    return playError(error);
  }
}
