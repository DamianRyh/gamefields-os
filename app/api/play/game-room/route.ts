import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { courts, gamePlayers, games, playerSports, users } from "@/db/schema";
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

  return {
    game,
    players,
    me,
    isCreator: game.creatorUserId === currentUserId,
    canJoin: game.status === "open" && !me && players.length < game.maxPlayers,
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
    const db = getDb();
    const user = await requireCurrentPlayUser();
    const body = await request.json();
    const action = String(body.action || "");
    const gameId = String(body.gameId || "");
    const game = (await db.select().from(games).where(eq(games.id, gameId)).limit(1))[0];
    if (!game) throw new Error("GAME_NOT_FOUND");
    if (!isPlaySport(game.sport)) throw new Error("INVALID_SPORT");

    if (action === "generate_teams") {
      if (game.creatorUserId !== user.id) throw new Error("CREATOR_ONLY");
      await generateBalancedTeams(gameId);
      return json({ ok: true, ...(await room(gameId, user.id)) });
    }

    if (action === "start_game") {
      if (game.creatorUserId !== user.id) throw new Error("CREATOR_ONLY");
      if (game.status !== "open") throw new Error("GAME_NOT_OPEN");
      const state = await room(gameId, user.id);
      if (state.players.length < 2) throw new Error("NOT_ENOUGH_PLAYERS");
      if (state.players.some((player) => player.team !== "A" && player.team !== "B")) await generateBalancedTeams(gameId);
      await db.update(games).set({ status: "in_progress", updatedAt: new Date() }).where(eq(games.id, gameId));
      return json({ ok: true, ...(await room(gameId, user.id)) });
    }

    if (action === "submit_result") {
      const player = (await db.select().from(gamePlayers).where(and(eq(gamePlayers.gameId, gameId), eq(gamePlayers.userId, user.id))).limit(1))[0];
      if (!player) throw new Error("NOT_IN_GAME");
      if (game.status !== "in_progress" && game.status !== "awaiting_confirmation") throw new Error("GAME_NOT_IN_PROGRESS");
      const scoreA = Number(body.scoreA);
      const scoreB = Number(body.scoreB);
      if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0 || scoreA > 99 || scoreB > 99) throw new Error("INVALID_SCORE");
      await db.update(games).set({ scoreA, scoreB, submittedByUserId: user.id, status: "awaiting_confirmation", updatedAt: new Date() }).where(eq(games.id, gameId));
      return json({ ok: true, ...(await room(gameId, user.id)) });
    }

    if (action === "confirm_result") {
      const result = await confirmResultAndApplyElo(gameId, user.id);
      return json({ ok: true, result, ...(await room(gameId, user.id)) });
    }

    throw new Error("UNKNOWN_ACTION");
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return json({ ok: false, error: code }, code === "UNAUTHENTICATED" ? 401 : code.endsWith("NOT_FOUND") ? 404 : 400);
  }
}
