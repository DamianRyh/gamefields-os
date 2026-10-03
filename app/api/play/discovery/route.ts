import { and, desc, eq, gt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { playAvailability } from "@/db/play-discovery";
import { courtCheckins, courts, gamePlayers, games, playerSports, users } from "@/db/schema";
import { requireCurrentPlayUser } from "@/lib/play-auth";
import { ensurePlayerSport, isPlaySport, newId, playerTier } from "@/lib/play-engine";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  try {
    const db = getDb();
    const current = await requireCurrentPlayUser();
    const url = new URL(request.url);
    const sport = String(url.searchParams.get("sport") || "football");
    if (!isPlaySport(sport)) return json({ ok: false, error: "INVALID_SPORT" }, 400);

    const now = new Date();
    await ensurePlayerSport(current.id, sport);

    const allCourts = await db.select().from(courts).orderBy(courts.name);
    const checkins = await db
      .select({ courtId: courtCheckins.courtId, count: sql<number>`count(${courtCheckins.id})` })
      .from(courtCheckins)
      .where(gt(courtCheckins.expiresAt, now))
      .groupBy(courtCheckins.courtId);

    const ready = await db
      .select({
        userId: users.id,
        nickname: users.nickname,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        courtId: playAvailability.courtId,
        availableUntil: playAvailability.availableUntil,
        elo: playerSports.elo,
        games: playerSports.games,
      })
      .from(playAvailability)
      .innerJoin(users, eq(users.id, playAvailability.userId))
      .innerJoin(playerSports, and(eq(playerSports.userId, users.id), eq(playerSports.sport, sport)))
      .where(and(eq(playAvailability.sport, sport), gt(playAvailability.availableUntil, now)))
      .orderBy(desc(playerSports.elo))
      .limit(100);

    const openGames = await db
      .select({
        id: games.id,
        courtId: games.courtId,
        format: games.format,
        startsAt: games.startsAt,
        maxPlayers: games.maxPlayers,
        playerCount: sql<number>`count(${gamePlayers.id})`,
      })
      .from(games)
      .leftJoin(gamePlayers, eq(gamePlayers.gameId, games.id))
      .where(and(eq(games.sport, sport), eq(games.status, "open"), gt(games.startsAt, new Date(now.getTime() - 60 * 60 * 1000))))
      .groupBy(games.id)
      .orderBy(games.startsAt)
      .limit(100);

    const myReady = ready.find((item) => item.userId === current.id) || null;
    const checkinMap = new Map(checkins.map((item) => [item.courtId, Number(item.count)]));
    const readyCount = new Map<string, number>();
    for (const item of ready) {
      if (!item.courtId) continue;
      readyCount.set(item.courtId, (readyCount.get(item.courtId) || 0) + 1);
    }

    return json({
      ok: true,
      sport,
      now: now.toISOString(),
      me: {
        userId: current.id,
        ready: Boolean(myReady),
        courtId: myReady?.courtId || null,
        availableUntil: myReady?.availableUntil || null,
      },
      courts: allCourts
        .filter((court) => court.sports.includes(sport))
        .map((court) => ({
          ...court,
          playersNow: checkinMap.get(court.id) || 0,
          readyNow: readyCount.get(court.id) || 0,
          openGames: openGames.filter((game) => game.courtId === court.id),
        })),
      readyPlayers: ready.map((item) => ({ ...item, tier: playerTier(item.elo) })),
      openGames,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return json({ ok: false, error: code }, code === "UNAUTHENTICATED" ? 401 : 400);
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const current = await requireCurrentPlayUser();
    const body = await request.json();
    const action = String(body.action || "");
    const sport = String(body.sport || "football");
    if (!isPlaySport(sport)) throw new Error("INVALID_SPORT");

    if (action === "clear_ready") {
      await db.delete(playAvailability).where(and(eq(playAvailability.userId, current.id), eq(playAvailability.sport, sport)));
      return json({ ok: true });
    }

    if (action === "set_ready") {
      const courtId = body.courtId ? String(body.courtId) : null;
      if (courtId) {
        const court = (await db.select({ id: courts.id, sports: courts.sports }).from(courts).where(eq(courts.id, courtId)).limit(1))[0];
        if (!court) throw new Error("COURT_NOT_FOUND");
        if (!court.sports.includes(sport)) throw new Error("COURT_SPORT_MISMATCH");
      }

      await ensurePlayerSport(current.id, sport);
      const minutes = Math.max(15, Math.min(180, Number(body.minutes || 60)));
      const now = new Date();
      const availableUntil = new Date(now.getTime() + minutes * 60 * 1000);
      await db.delete(playAvailability).where(and(eq(playAvailability.userId, current.id), eq(playAvailability.sport, sport)));
      await db.insert(playAvailability).values({
        id: newId("ready"),
        userId: current.id,
        sport,
        courtId,
        availableUntil,
        createdAt: now,
        updatedAt: now,
      });
      return json({ ok: true, availableUntil, courtId });
    }

    throw new Error("UNKNOWN_ACTION");
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return json({ ok: false, error: code }, code === "UNAUTHENTICATED" ? 401 : 400);
  }
}
