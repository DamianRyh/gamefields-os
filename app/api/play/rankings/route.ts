import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { playerFollows } from "@/db/play-social";
import { courts, gamePlayers, games, homeCourts, playerSports, users } from "@/db/schema";
import { requireCurrentPlayUser } from "@/lib/play-auth";
import { isPlaySport, playerTier } from "@/lib/play-engine";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

type RankRow = {
  userId: string;
  nickname: string;
  displayName: string | null;
  avatarUrl: string | null;
  city: string;
  elo: number;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  localGames?: number;
};

function enrich(rows: RankRow[], currentUserId: string) {
  const mapped = rows.map((row, index) => ({
    ...row,
    rank: index + 1,
    tier: playerTier(row.elo),
    winRate: row.games > 0 ? Math.round((row.wins / row.games) * 100) : 0,
  }));
  const myIndex = mapped.findIndex((row) => row.userId === currentUserId);
  return {
    rows: mapped,
    myRank: myIndex >= 0 ? myIndex + 1 : null,
    me: myIndex >= 0 ? mapped[myIndex] : null,
    nextTarget: myIndex > 0 ? mapped[myIndex - 1] : null,
  };
}

export async function GET(request: Request) {
  try {
    const db = getDb();
    const current = await requireCurrentPlayUser();
    const url = new URL(request.url);
    const sport = String(url.searchParams.get("sport") || "football");
    const scope = String(url.searchParams.get("scope") || "city");
    if (!isPlaySport(sport)) return json({ ok: false, error: "INVALID_SPORT" }, 400);
    if (!["city", "district", "court", "friends"].includes(scope)) return json({ ok: false, error: "INVALID_SCOPE" }, 400);

    const myHome = (await db
      .select({ courtId: homeCourts.courtId, district: courts.district, courtName: courts.name })
      .from(homeCourts)
      .innerJoin(courts, eq(courts.id, homeCourts.courtId))
      .where(and(eq(homeCourts.userId, current.id), eq(homeCourts.sport, sport)))
      .limit(1))[0] || null;

    let context: Record<string, unknown> = { city: current.city };
    let rows: RankRow[] = [];

    if (scope === "city") {
      rows = await db
        .select({
          userId: users.id,
          nickname: users.nickname,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          city: users.city,
          elo: playerSports.elo,
          games: playerSports.games,
          wins: playerSports.wins,
          losses: playerSports.losses,
          draws: playerSports.draws,
        })
        .from(playerSports)
        .innerJoin(users, eq(users.id, playerSports.userId))
        .where(and(eq(playerSports.sport, sport), eq(users.city, current.city)))
        .orderBy(desc(playerSports.elo))
        .limit(250);
    }

    if (scope === "district") {
      const district = String(url.searchParams.get("district") || myHome?.district || "").trim();
      if (!district) return json({ ok: true, sport, scope, context: { city: current.city, district: null }, rows: [], myRank: null, me: null, nextTarget: null });
      context = { city: current.city, district };
      rows = await db
        .select({
          userId: users.id,
          nickname: users.nickname,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          city: users.city,
          elo: playerSports.elo,
          games: playerSports.games,
          wins: playerSports.wins,
          losses: playerSports.losses,
          draws: playerSports.draws,
        })
        .from(homeCourts)
        .innerJoin(users, eq(users.id, homeCourts.userId))
        .innerJoin(playerSports, and(eq(playerSports.userId, users.id), eq(playerSports.sport, sport)))
        .innerJoin(courts, eq(courts.id, homeCourts.courtId))
        .where(and(eq(homeCourts.sport, sport), eq(courts.city, current.city), eq(courts.district, district)))
        .orderBy(desc(playerSports.elo))
        .limit(250);
    }

    if (scope === "court") {
      const courtId = String(url.searchParams.get("courtId") || myHome?.courtId || "").trim();
      if (!courtId) return json({ ok: true, sport, scope, context: { courtId: null, courtName: null }, rows: [], myRank: null, me: null, nextTarget: null });
      const court = (await db.select({ id: courts.id, name: courts.name, district: courts.district }).from(courts).where(eq(courts.id, courtId)).limit(1))[0];
      if (!court) return json({ ok: false, error: "COURT_NOT_FOUND" }, 404);
      context = { courtId: court.id, courtName: court.name, district: court.district };
      rows = await db
        .select({
          userId: users.id,
          nickname: users.nickname,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          city: users.city,
          elo: playerSports.elo,
          games: playerSports.games,
          wins: playerSports.wins,
          losses: playerSports.losses,
          draws: playerSports.draws,
          localGames: sql<number>`count(distinct ${games.id})`,
        })
        .from(gamePlayers)
        .innerJoin(games, eq(games.id, gamePlayers.gameId))
        .innerJoin(users, eq(users.id, gamePlayers.userId))
        .innerJoin(playerSports, and(eq(playerSports.userId, users.id), eq(playerSports.sport, sport)))
        .where(and(eq(games.courtId, courtId), eq(games.sport, sport), eq(games.status, "completed")))
        .groupBy(users.id, playerSports.id)
        .orderBy(desc(playerSports.elo))
        .limit(250);
    }

    if (scope === "friends") {
      const followed = await db.select({ id: playerFollows.followingUserId }).from(playerFollows).where(eq(playerFollows.followerUserId, current.id));
      const ids = [...new Set([current.id, ...followed.map((item) => item.id)])];
      context = { count: ids.length };
      rows = await db
        .select({
          userId: users.id,
          nickname: users.nickname,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          city: users.city,
          elo: playerSports.elo,
          games: playerSports.games,
          wins: playerSports.wins,
          losses: playerSports.losses,
          draws: playerSports.draws,
        })
        .from(playerSports)
        .innerJoin(users, eq(users.id, playerSports.userId))
        .where(and(eq(playerSports.sport, sport), inArray(users.id, ids)))
        .orderBy(desc(playerSports.elo))
        .limit(250);
    }

    return json({ ok: true, sport, scope, context, ...enrich(rows, current.id) });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return json({ ok: false, error: code }, code === "UNAUTHENTICATED" ? 401 : 400);
  }
}
