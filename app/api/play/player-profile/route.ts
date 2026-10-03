import { and, desc, eq, gt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { courts, eloHistory, games, homeCourts, playerSports, users } from "@/db/schema";
import { requireCurrentPlayUser } from "@/lib/play-auth";
import { isPlaySport, playerTier } from "@/lib/play-engine";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  try {
    const db = getDb();
    const current = await requireCurrentPlayUser();
    const url = new URL(request.url);
    const nickname = String(url.searchParams.get("nickname") || current.nickname).trim();
    const sport = String(url.searchParams.get("sport") || "football");
    if (!isPlaySport(sport)) return json({ ok: false, error: "INVALID_SPORT" }, 400);

    const player = (await db.select().from(users).where(eq(users.nickname, nickname)).limit(1))[0];
    if (!player) return json({ ok: false, error: "PLAYER_NOT_FOUND" }, 404);

    const sports = await db.select().from(playerSports).where(eq(playerSports.userId, player.id));
    const selected = sports.find((item) => item.sport === sport) || null;
    const home = (await db
      .select({ courtId: homeCourts.courtId, courtName: courts.name, district: courts.district })
      .from(homeCourts)
      .innerJoin(courts, eq(courts.id, homeCourts.courtId))
      .where(and(eq(homeCourts.userId, player.id), eq(homeCourts.sport, sport)))
      .limit(1))[0] || null;

    const cityRank = selected
      ? Number((await db.select({ count: sql<number>`count(*)` }).from(playerSports)
          .innerJoin(users, eq(users.id, playerSports.userId))
          .where(and(eq(playerSports.sport, sport), eq(users.city, player.city), gt(playerSports.elo, selected.elo))))[0]?.count || 0) + 1
      : null;

    let courtRank: number | null = null;
    if (selected && home) {
      courtRank = Number((await db.select({ count: sql<number>`count(*)` }).from(playerSports)
        .innerJoin(homeCourts, and(eq(homeCourts.userId, playerSports.userId), eq(homeCourts.sport, sport)))
        .where(and(eq(playerSports.sport, sport), eq(homeCourts.courtId, home.courtId), gt(playerSports.elo, selected.elo))))[0]?.count || 0) + 1;
    }

    const history = await db
      .select({
        gameId: eloHistory.gameId,
        before: eloHistory.before,
        after: eloHistory.after,
        change: eloHistory.change,
        createdAt: eloHistory.createdAt,
        scoreA: games.scoreA,
        scoreB: games.scoreB,
        courtId: games.courtId,
        courtName: courts.name,
      })
      .from(eloHistory)
      .innerJoin(games, eq(games.id, eloHistory.gameId))
      .innerJoin(courts, eq(courts.id, games.courtId))
      .where(and(eq(eloHistory.userId, player.id), eq(eloHistory.sport, sport)))
      .orderBy(desc(eloHistory.createdAt))
      .limit(20);

    return json({
      ok: true,
      isMe: current.id === player.id,
      player: {
        id: player.id,
        nickname: player.nickname,
        displayName: player.displayName,
        avatarUrl: player.avatarUrl,
        city: player.city,
        coins: current.id === player.id ? player.coins : undefined,
      },
      sport,
      rating: selected ? {
        elo: selected.elo,
        tier: playerTier(selected.elo),
        skillLevel: selected.skillLevel,
        games: selected.games,
        wins: selected.wins,
        losses: selected.losses,
        draws: selected.draws,
        winRate: selected.games ? Math.round((selected.wins / selected.games) * 100) : 0,
        cityRank,
        courtRank,
      } : null,
      sports: sports.map((item) => ({ ...item, tier: playerTier(item.elo) })),
      homeCourt: home,
      history,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return json({ ok: false, error: code }, code === "UNAUTHENTICATED" ? 401 : 400);
  }
}
