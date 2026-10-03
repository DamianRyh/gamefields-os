import { and, desc, eq, gt, like, ne, or } from "drizzle-orm";
import { getDb } from "@/db";
import { playAvailability } from "@/db/play-discovery";
import { courtCheckins, courts, homeCourts, playerSports, users } from "@/db/schema";
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
    const sport = String(url.searchParams.get("sport") || "football");
    const query = String(url.searchParams.get("q") || "").trim().slice(0, 50);
    const city = String(url.searchParams.get("city") || current.city || "Warszawa").slice(0, 80);
    const onlyReady = url.searchParams.get("ready") === "1";
    const onlyLive = url.searchParams.get("live") === "1";
    const homeCourtId = String(url.searchParams.get("homeCourtId") || "");
    const minElo = Math.max(0, Number(url.searchParams.get("minElo") || 0));
    const maxElo = Math.min(4000, Number(url.searchParams.get("maxElo") || 4000));
    const sort = String(url.searchParams.get("sort") || "elo");
    if (!isPlaySport(sport)) return json({ ok: false, error: "INVALID_SPORT" }, 400);

    const now = new Date();
    const where = [eq(playerSports.sport, sport), eq(users.city, city), ne(users.id, current.id)];
    if (query) where.push(or(like(users.nickname, `%${query}%`), like(users.displayName, `%${query}%`))!);

    const rows = await db
      .select({
        userId: users.id,
        nickname: users.nickname,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        city: users.city,
        elo: playerSports.elo,
        skillLevel: playerSports.skillLevel,
        games: playerSports.games,
        wins: playerSports.wins,
        homeCourtId: homeCourts.courtId,
        homeCourtName: courts.name,
      })
      .from(playerSports)
      .innerJoin(users, eq(users.id, playerSports.userId))
      .leftJoin(homeCourts, and(eq(homeCourts.userId, users.id), eq(homeCourts.sport, sport)))
      .leftJoin(courts, eq(courts.id, homeCourts.courtId))
      .where(and(...where))
      .orderBy(desc(playerSports.elo))
      .limit(200);

    const liveRows = await db
      .select({ userId: courtCheckins.userId, courtId: courtCheckins.courtId, expiresAt: courtCheckins.expiresAt })
      .from(courtCheckins)
      .where(gt(courtCheckins.expiresAt, now));
    const readyRows = await db
      .select({ userId: playAvailability.userId, courtId: playAvailability.courtId, availableUntil: playAvailability.availableUntil })
      .from(playAvailability)
      .where(and(eq(playAvailability.sport, sport), gt(playAvailability.availableUntil, now)));

    const liveByUser = new Map(liveRows.map((item) => [item.userId, item]));
    const readyByUser = new Map(readyRows.map((item) => [item.userId, item]));

    let players = rows
      .filter((row) => row.elo >= minElo && row.elo <= maxElo)
      .filter((row) => !homeCourtId || row.homeCourtId === homeCourtId)
      .map((row) => {
        const live = liveByUser.get(row.userId);
        const ready = readyByUser.get(row.userId);
        return {
          ...row,
          tier: playerTier(row.elo),
          winRate: row.games > 0 ? Math.round((row.wins / row.games) * 100) : 0,
          playingNow: Boolean(live),
          liveCourtId: live?.courtId || null,
          readyNow: Boolean(ready),
          readyCourtId: ready?.courtId || null,
          availableUntil: ready?.availableUntil || null,
        };
      })
      .filter((row) => !onlyReady || row.readyNow)
      .filter((row) => !onlyLive || row.playingNow);

    if (sort === "ready") players = players.sort((a, b) => Number(b.readyNow) - Number(a.readyNow) || b.elo - a.elo);
    if (sort === "games") players = players.sort((a, b) => b.games - a.games || b.elo - a.elo);
    if (sort === "win") players = players.sort((a, b) => b.winRate - a.winRate || b.elo - a.elo);

    return json({ ok: true, sport, city, players: players.slice(0, 100) });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return json({ ok: false, error: code }, code === "UNAUTHENTICATED" ? 401 : 400);
  }
}
