import { and, desc, eq, gt, like, ne, or } from "drizzle-orm";
import { getDb } from "@/db";
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
    if (!isPlaySport(sport)) return json({ ok: false, error: "INVALID_SPORT" }, 400);

    const now = new Date();
    const where = [eq(playerSports.sport, sport), eq(users.city, city), ne(users.id, current.id)];
    if (query) {
      where.push(or(like(users.nickname, `%${query}%`), like(users.displayName, `%${query}%`))!);
    }

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
        liveCourtId: courtCheckins.courtId,
      })
      .from(playerSports)
      .innerJoin(users, eq(users.id, playerSports.userId))
      .leftJoin(homeCourts, and(eq(homeCourts.userId, users.id), eq(homeCourts.sport, sport)))
      .leftJoin(courts, eq(courts.id, homeCourts.courtId))
      .leftJoin(courtCheckins, and(eq(courtCheckins.userId, users.id), gt(courtCheckins.expiresAt, now)))
      .where(and(...where))
      .orderBy(desc(playerSports.elo))
      .limit(100);

    return json({
      ok: true,
      sport,
      city,
      players: rows.map((row) => ({
        ...row,
        tier: playerTier(row.elo),
        winRate: row.games > 0 ? Math.round((row.wins / row.games) * 100) : 0,
        playingNow: Boolean(row.liveCourtId),
      })),
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return json({ ok: false, error: code }, code === "UNAUTHENTICATED" ? 401 : 400);
  }
}
