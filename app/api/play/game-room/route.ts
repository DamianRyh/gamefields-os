import { and, eq } from "drizzle-orm";
import { getDb, getD1 } from "@/db";
import { gameLifecycle } from "@/lib/play-lifecycle";
import { assertSameOrigin, playError } from "@/lib/play-http";
import { courts, eloHistory, gamePlayers, games, playerSports, users } from "@/db/schema";
import { requireCurrentPlayUser } from "@/lib/play-auth";
import { confirmResultAndApplyElo, generateBalancedTeams, isPlaySport, playerTier } from "@/lib/play-engine";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

async function room(gameId: string, currentUserId: string) {
  const db = getDb();
  const game = (await db
    .select({
      id: games.id,
      creatorUserId: games.creatorUserId,
      courtId: games.courtId,
      courtName: courts.name,
      courtDistrict: courts.district,
      sport: games.sport,
      format: games.format,
      level: games.level,
      startsAt: games.startsAt,
      maxPlayers: games.maxPlayers,
      status: games.status,
      scoreA: games.scoreA,
      scoreB: games.scoreB,
      submittedByUserId: games.submittedByUserId,
      resultConfirmedAt: games.resultConfirmedAt,
    })
    .from(games)
    .innerJoin(courts, eq(courts.id, games.courtId))
    .where(eq(games.id, gameId))
    .limit(1))[0];
  if (!game) throw new Error("GAME_NOT_FOUND");

  const roster = await db
    .select({
      userId: users.id,
      nickname: users.nickname,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      team: gamePlayers.team,
      joinedAt: gamePlayers.joinedAt,
      readyAt: gamePlayers.readyAt,
      elo: playerSports.elo,
      games: playerSports.games,
    })
    .from(gamePlayers)
    .innerJoin(users, eq(users.id, gamePlayers.userId))
    .leftJoin(playerSports, and(eq(playerSports.userId, users.id), eq(playerSports.sport, game.sport)))
    .where(eq(gamePlayers.gameId, gameId));

  const players = roster.map((player) => ({
    ...player,
    elo: player.elo ?? 1000,
    tier: playerTier(player.elo ?? 1000),
  }));
  const me = players.find((player) => player.userId === currentUserId) || null;
  const teamA = players.filter((player) => player.team === "A");
  const teamB = players.filter((player) => player.team === "B");
  const avg = (items: typeof players) => items.length ? Math.round(items.reduce((sum, p) => sum + p.elo, 0) / items.length) : 0;

  const changes=game.status==="completed"?await db.select({userId:eloHistory.userId,before:eloHistory.before,after:eloHistory.after,change:eloHistory.change}).from(eloHistory).where(eq(eloHistory.gameId,gameId)):[];
  return {
    eloChanges:changes,myEloChange:changes.find(c=>c.userId===currentUserId)||null,
    game,
    lifecycle: gameLifecycle(game, players),
    players,
    me,
    isCreator: game.creatorUserId === currentUserId,
    canJoin: game.status === "open" && !me && players.length < game.maxPlayers,
    canConfirm: game.status === "awaiting_confirmation" && !!me?.team && players.find(p=>p.userId===game.submittedByUserId)?.team !== me.team,
    canSubmit: game.status === "in_progress" && !!me,
    teams: { A: teamA, B: teamB, averageA: avg(teamA), averageB: avg(teamB) },
  };
}

export async function GET(request: Request) {
  try {
    const user = await requireCurrentPlayUser();
    const gameId = new URL(request.url).searchParams.get("gameId") || "";
    if (!gameId) return json({ ok: false, error: "GAME_ID_REQUIRED" }, 400);
    return json({ ok: true, ...(await room(gameId, user.id)) });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return json({ ok: false, error: code }, code === "UNAUTHENTICATED" ? 401 : code.endsWith("NOT_FOUND") ? 404 : 400);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const db = getDb(), d1=getD1();
    const user = await requireCurrentPlayUser();
    const body=await request.json();
    const action=String(body.action||""),gameId=String(body.gameId||"");
    const game=(await db.select().from(games).where(eq(games.id,gameId)).limit(1))[0];
    if(!game) throw new Error("GAME_NOT_FOUND");
    if(!isPlaySport(game.sport)) throw new Error("INVALID_SPORT");
    const state=await room(gameId,user.id), stamp=Math.floor(Date.now()/1000);
    if (action === "join_game") {
      if(state.me) return json({ok:true,...state});
      if(game.status!=="open") throw new Error("GAME_NOT_OPEN");
      await import("@/lib/play-engine").then(m=>m.ensurePlayerSport(user.id,game.sport as "football"|"basketball"));
      const id=crypto.randomUUID();
      const results=await d1.batch([
        d1.prepare("INSERT OR IGNORE INTO game_players (id,game_id,user_id,joined_at) SELECT ?,id,?,? FROM games WHERE id=? AND status='open' AND (SELECT count(*) FROM game_players WHERE game_id=?)<max_players").bind(id,user.id,stamp,gameId,gameId),
        d1.prepare("UPDATE game_players SET team=NULL,ready_at=NULL WHERE game_id=? AND EXISTS (SELECT 1 FROM game_players WHERE id=?)").bind(gameId,id),
      ]);
      if(!results[0].meta.changes) throw new Error("GAME_FULL");
    } else if(action === "leave_game") {
      if(game.status!=="open") throw new Error("GAME_NOT_OPEN");
      if(game.creatorUserId===user.id) throw new Error("CREATOR_CANNOT_LEAVE");
      await d1.batch([
        d1.prepare("DELETE FROM game_players WHERE game_id=? AND user_id=? AND EXISTS (SELECT 1 FROM games WHERE id=? AND status='open')").bind(gameId,user.id,gameId),
        d1.prepare("UPDATE game_players SET team=NULL,ready_at=NULL WHERE game_id=? AND EXISTS (SELECT 1 FROM games WHERE id=? AND status='open')").bind(gameId,gameId),
      ]);
    } else if(action === "generate_teams") {
      if(game.creatorUserId!==user.id) throw new Error("CREATOR_ONLY");
      await generateBalancedTeams(gameId);
    } else if(action === "set_game_ready") {
      if(!state.me) throw new Error("NOT_IN_GAME");
      const result=await d1.prepare("UPDATE game_players SET ready_at=? WHERE game_id=? AND user_id=? AND team IN ('A','B') AND EXISTS (SELECT 1 FROM games WHERE id=? AND status='open' AND max_players=(SELECT count(*) FROM game_players WHERE game_id=?))").bind(body.ready===false?null:stamp,gameId,user.id,gameId,gameId).run();
      if(!result.meta.changes) throw new Error("TEAMS_NOT_SET");
    } else if(action === "start_game") {
      if(game.creatorUserId!==user.id) throw new Error("CREATOR_ONLY");
      const result=await d1.prepare("UPDATE games SET status='in_progress',updated_at=? WHERE id=? AND status='open' AND max_players=(SELECT count(*) FROM game_players WHERE game_id=?) AND NOT EXISTS (SELECT 1 FROM game_players WHERE game_id=? AND (team IS NULL OR ready_at IS NULL))").bind(stamp,gameId,gameId,gameId).run();
      if(!result.meta.changes) throw new Error("ALL_PLAYERS_MUST_BE_READY");
    } else if(action === "submit_result") {
      if(!state.me) throw new Error("NOT_IN_GAME");
      const scoreA=Number(body.scoreA),scoreB=Number(body.scoreB);
      if(!Number.isInteger(scoreA)||!Number.isInteger(scoreB)||scoreA<0||scoreB<0||scoreA>99||scoreB>99) throw new Error("INVALID_SCORE");
      const result=await d1.prepare("UPDATE games SET score_a=?,score_b=?,submitted_by_user_id=?,status='awaiting_confirmation',updated_at=? WHERE id=? AND status='in_progress' AND result_confirmed_at IS NULL").bind(scoreA,scoreB,user.id,stamp,gameId).run();
      if(!result.meta.changes) throw new Error("GAME_NOT_IN_PROGRESS");
    } else if(action === "dispute_result") {
      if(!state.canConfirm) throw new Error("OPPOSING_TEAM_REQUIRED");
      await d1.prepare("UPDATE games SET score_a=NULL,score_b=NULL,submitted_by_user_id=NULL,status='in_progress',updated_at=? WHERE id=? AND status='awaiting_confirmation' AND result_confirmed_at IS NULL").bind(stamp,gameId).run();
    } else if(action === "confirm_result") {
      const result=await confirmResultAndApplyElo(gameId,user.id);
      return json({ok:true,result,...await room(gameId,user.id)});
    } else throw new Error("UNKNOWN_ACTION");
    return json({ok:true,...await room(gameId,user.id)});
  } catch(error) { return playError(error); }
}
