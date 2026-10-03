import { and, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { playAvailability } from "@/db/play-discovery";
import { courtCheckins, courtReportSupports, courtReports, courts, gamePlayers, games, homeCourts, playerSports, users } from "@/db/schema";
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
    const id = String(url.searchParams.get("id") || "");
    const slug = String(url.searchParams.get("slug") || "");
    const sport = String(url.searchParams.get("sport") || "football");
    if (!isPlaySport(sport)) return json({ ok: false, error: "INVALID_SPORT" }, 400);
    if (!id && !slug) return json({ ok: false, error: "COURT_REQUIRED" }, 400);

    const court = (await db.select().from(courts).where(id ? eq(courts.id, id) : eq(courts.slug, slug)).limit(1))[0];
    if (!court) return json({ ok: false, error: "COURT_NOT_FOUND" }, 404);

    const now = new Date();
    const livePlayers = await db
      .select({ userId: users.id, nickname: users.nickname, displayName: users.displayName, avatarUrl: users.avatarUrl })
      .from(courtCheckins)
      .innerJoin(users, eq(users.id, courtCheckins.userId))
      .where(and(eq(courtCheckins.courtId, court.id), gt(courtCheckins.expiresAt, now)))
      .limit(50);

    const readyPlayers = await db
      .select({
        userId: users.id,
        nickname: users.nickname,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        availableUntil: playAvailability.availableUntil,
        elo: playerSports.elo,
      })
      .from(playAvailability)
      .innerJoin(users, eq(users.id, playAvailability.userId))
      .leftJoin(playerSports, and(eq(playerSports.userId, users.id), eq(playerSports.sport, sport)))
      .where(and(eq(playAvailability.courtId, court.id), eq(playAvailability.sport, sport), gt(playAvailability.availableUntil, now)))
      .orderBy(desc(playerSports.elo))
      .limit(50);

    const upcomingGames = await db
      .select({
        id: games.id,
        sport: games.sport,
        format: games.format,
        level: games.level,
        startsAt: games.startsAt,
        maxPlayers: games.maxPlayers,
        status: games.status,
        playerCount: sql<number>`count(${gamePlayers.id})`,
      })
      .from(games)
      .leftJoin(gamePlayers, eq(gamePlayers.gameId, games.id))
      .where(and(eq(games.courtId, court.id), eq(games.sport, sport), gt(games.startsAt, new Date(now.getTime() - 60 * 60 * 1000))))
      .groupBy(games.id)
      .orderBy(games.startsAt)
      .limit(12);

    const ranking = await db
      .select({
        userId: users.id,
        nickname: users.nickname,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        elo: playerSports.elo,
        games: playerSports.games,
        wins: playerSports.wins,
        localGames: sql<number>`count(distinct ${games.id})`,
      })
      .from(gamePlayers)
      .innerJoin(games, eq(games.id, gamePlayers.gameId))
      .innerJoin(users, eq(users.id, gamePlayers.userId))
      .innerJoin(playerSports, and(eq(playerSports.userId, users.id), eq(playerSports.sport, sport)))
      .where(and(eq(games.courtId, court.id), eq(games.sport, sport), eq(games.status, "completed")))
      .groupBy(users.id, playerSports.id)
      .orderBy(desc(playerSports.elo))
      .limit(50);

    const homeCount = Number((await db.select({ count: sql<number>`count(*)` }).from(homeCourts).where(and(eq(homeCourts.courtId, court.id), eq(homeCourts.sport, sport))))[0]?.count || 0);
    const myHome = Boolean((await db.select({ id: homeCourts.id }).from(homeCourts).where(and(eq(homeCourts.userId, current.id), eq(homeCourts.courtId, court.id), eq(homeCourts.sport, sport))).limit(1))[0]);
    const myCheckin = Boolean((await db.select({ id: courtCheckins.id }).from(courtCheckins).where(and(eq(courtCheckins.userId, current.id), eq(courtCheckins.courtId, court.id), gt(courtCheckins.expiresAt, now))).limit(1))[0]);
    const myReady = (await db.select({ id: playAvailability.id, availableUntil: playAvailability.availableUntil }).from(playAvailability).where(and(eq(playAvailability.userId, current.id), eq(playAvailability.courtId, court.id), eq(playAvailability.sport, sport), gt(playAvailability.availableUntil, now))).limit(1))[0] || null;

    const reports = await db
      .select({
        id: courtReports.id,
        category: courtReports.category,
        description: courtReports.description,
        status: courtReports.status,
        createdAt: courtReports.createdAt,
        reporterNickname: users.nickname,
        supportCount: sql<number>`count(${courtReportSupports.id})`,
      })
      .from(courtReports)
      .innerJoin(users, eq(users.id, courtReports.userId))
      .leftJoin(courtReportSupports, eq(courtReportSupports.reportId, courtReports.id))
      .where(eq(courtReports.courtId, court.id))
      .groupBy(courtReports.id)
      .orderBy(desc(courtReports.createdAt))
      .limit(20);

    const reportIds = reports.map((report) => report.id);
    const mySupports = reportIds.length
      ? await db.select({ reportId: courtReportSupports.reportId }).from(courtReportSupports).where(and(eq(courtReportSupports.userId, current.id), inArray(courtReportSupports.reportId, reportIds)))
      : [];
    const supportedIds = new Set(mySupports.map((support) => support.reportId));

    return json({
      ok: true,
      court,
      sport,
      livePlayers,
      readyPlayers: readyPlayers.map((player) => ({ ...player, elo: player.elo ?? 1000, tier: playerTier(player.elo ?? 1000) })),
      upcomingGames,
      ranking: ranking.map((item, index) => ({ ...item, rank: index + 1, tier: playerTier(item.elo), winRate: item.games ? Math.round((item.wins / item.games) * 100) : 0 })),
      courtKing: ranking[0] ? { ...ranking[0], tier: playerTier(ranking[0].elo) } : null,
      homePlayers: homeCount,
      myHome,
      myCheckin,
      myReady: Boolean(myReady),
      myReadyUntil: myReady?.availableUntil || null,
      reports: reports.map((report) => ({ ...report, supportCount: Number(report.supportCount || 0), supportedByMe: supportedIds.has(report.id) })),
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return json({ ok: false, error: code }, code === "UNAUTHENTICATED" ? 401 : 400);
  }
}
