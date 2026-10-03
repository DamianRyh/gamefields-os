import { and, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  challengeMessages,
  challengePlayers,
  challenges,
  courtCheckins,
  courtReportSupports,
  courtReports,
  courts,
  gamePlayers,
  games,
  homeCourts,
  playerSports,
  users,
} from "@/db/schema";
import { requireCurrentPlayUser } from "@/lib/play-auth";
import {
  awardCoins,
  confirmResultAndApplyElo,
  ensurePlayerSport,
  generateBalancedTeams,
  isPlaySport,
  isSkillLevel,
  newId,
  normalizeNickname,
  playerTier,
  setPlayerSkillLevel,
} from "@/lib/play-engine";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function fail(error: unknown) {
  const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
  const status = code === "UNAUTHENTICATED" ? 401 : code.endsWith("NOT_FOUND") ? 404 : 400;
  return json({ ok: false, error: code }, status);
}

export async function GET() {
  try {
    const db = getDb();
    const user = await requireCurrentPlayUser();
    await ensurePlayerSport(user.id, "football");
    await ensurePlayerSport(user.id, "basketball");

    const now = new Date();
    const allCourts = await db.select().from(courts).orderBy(courts.name);
    const openGames = await db
      .select({
        id: games.id,
        courtId: games.courtId,
        courtName: courts.name,
        sport: games.sport,
        format: games.format,
        level: games.level,
        startsAt: games.startsAt,
        maxPlayers: games.maxPlayers,
        status: games.status,
        playerCount: sql<number>`count(${gamePlayers.id})`,
      })
      .from(games)
      .innerJoin(courts, eq(games.courtId, courts.id))
      .leftJoin(gamePlayers, eq(gamePlayers.gameId, games.id))
      .where(and(gt(games.startsAt, new Date(now.getTime() - 3 * 60 * 60 * 1000)), eq(games.status, "open")))
      .groupBy(games.id)
      .orderBy(games.startsAt);

    const rawRankings = await db
      .select({
        userId: playerSports.userId,
        nickname: users.nickname,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        sport: playerSports.sport,
        skillLevel: playerSports.skillLevel,
        elo: playerSports.elo,
        games: playerSports.games,
        wins: playerSports.wins,
      })
      .from(playerSports)
      .innerJoin(users, eq(users.id, playerSports.userId))
      .orderBy(desc(playerSports.elo))
      .limit(100);

    const activeCheckins = await db
      .select({ courtId: courtCheckins.courtId, playersNow: sql<number>`count(${courtCheckins.id})` })
      .from(courtCheckins)
      .where(gt(courtCheckins.expiresAt, now))
      .groupBy(courtCheckins.courtId);

    const rawSports = await db.select().from(playerSports).where(eq(playerSports.userId, user.id));
    const home = await db.select().from(homeCourts).where(eq(homeCourts.userId, user.id));
    const myChallengeLinks = await db.select().from(challengePlayers).where(eq(challengePlayers.userId, user.id));
    const challengeIds = myChallengeLinks.map((item) => item.challengeId);

    let myChallenges: Array<Record<string, unknown>> = [];
    if (challengeIds.length) {
      const challengeRows = await db.select().from(challenges).where(inArray(challenges.id, challengeIds)).orderBy(desc(challenges.createdAt));
      const participantRows = await db
        .select({
          challengeId: challengePlayers.challengeId,
          userId: challengePlayers.userId,
          side: challengePlayers.side,
          role: challengePlayers.role,
          status: challengePlayers.status,
          nickname: users.nickname,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        })
        .from(challengePlayers)
        .innerJoin(users, eq(users.id, challengePlayers.userId))
        .where(inArray(challengePlayers.challengeId, challengeIds));
      const courtById = new Map(allCourts.map((court) => [court.id, court]));
      myChallenges = challengeRows.map((challenge) => ({
        ...challenge,
        courtName: courtById.get(challenge.courtId)?.name || "Court",
        participants: participantRows.filter((player) => player.challengeId === challenge.id),
      }));
    }

    return json({
      ok: true,
      user,
      coins: user.coins,
      sports: rawSports.map((item) => ({ ...item, tier: playerTier(item.elo) })),
      homeCourts: home,
      courts: allCourts,
      games: openGames,
      rankings: rawRankings.map((item) => ({ ...item, tier: playerTier(item.elo) })),
      activeCheckins,
      challenges: myChallenges,
    });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const user = await requireCurrentPlayUser();
    const body = await request.json();
    const action = String(body?.action || "");
    const now = new Date();

    if (action === "update_profile") {
      const nickname = normalizeNickname(String(body.nickname || user.nickname));
      const conflict = await db.select({ id: users.id }).from(users).where(eq(users.nickname, nickname)).limit(1);
      if (conflict[0] && conflict[0].id !== user.id) throw new Error("NICKNAME_TAKEN");
      await db.update(users).set({
        nickname,
        displayName: body.displayName ? String(body.displayName).slice(0, 80) : user.displayName,
        city: body.city ? String(body.city).slice(0, 80) : user.city,
        avatarUrl: body.avatarUrl ? String(body.avatarUrl).slice(0, 500) : user.avatarUrl,
        updatedAt: now,
      }).where(eq(users.id, user.id));
      return json({ ok: true });
    }

    if (action === "set_skill_level") {
      const sport = String(body.sport || "");
      const skillLevel = String(body.skillLevel || "");
      if (!isPlaySport(sport)) throw new Error("INVALID_SPORT");
      if (!isSkillLevel(skillLevel)) throw new Error("INVALID_SKILL_LEVEL");
      return json({ ok: true, ...(await setPlayerSkillLevel(user.id, sport, skillLevel)) });
    }

    if (action === "set_home_court") {
      const sport = String(body.sport || "");
      const courtId = String(body.courtId || "");
      if (!isPlaySport(sport)) throw new Error("INVALID_SPORT");
      const court = (await db.select().from(courts).where(eq(courts.id, courtId)).limit(1))[0];
      if (!court) throw new Error("COURT_NOT_FOUND");
      await db.delete(homeCourts).where(and(eq(homeCourts.userId, user.id), eq(homeCourts.sport, sport)));
      await db.insert(homeCourts).values({ id: newId("home"), userId: user.id, courtId, sport, createdAt: now });
      return json({ ok: true });
    }

    if (action === "create_game") {
      const sport = String(body.sport || "");
      const courtId = String(body.courtId || "");
      if (!isPlaySport(sport)) throw new Error("INVALID_SPORT");
      const court = (await db.select().from(courts).where(eq(courts.id, courtId)).limit(1))[0];
      if (!court) throw new Error("COURT_NOT_FOUND");
      const startsAt = new Date(body.startsAt);
      if (!Number.isFinite(startsAt.getTime())) throw new Error("INVALID_START_TIME");
      const maxPlayers = Math.max(2, Math.min(30, Number(body.maxPlayers || 6)));
      const gameId = newId("game");
      await ensurePlayerSport(user.id, sport);
      await db.insert(games).values({
        id: gameId,
        creatorUserId: user.id,
        courtId,
        sport,
        format: String(body.format || "3v3").slice(0, 12),
        level: String(body.level || "open").slice(0, 24),
        startsAt,
        maxPlayers,
        status: "open",
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(gamePlayers).values({ id: newId("gp"), gameId, userId: user.id, joinedAt: now });
      return json({ ok: true, gameId });
    }

    if (action === "join_game") {
      const gameId = String(body.gameId || "");
      const game = (await db.select().from(games).where(eq(games.id, gameId)).limit(1))[0];
      if (!game) throw new Error("GAME_NOT_FOUND");
      if (game.status !== "open") throw new Error("GAME_NOT_OPEN");
      if (!isPlaySport(game.sport)) throw new Error("INVALID_SPORT");
      const count = await db.select({ count: sql<number>`count(*)` }).from(gamePlayers).where(eq(gamePlayers.gameId, gameId));
      if ((count[0]?.count || 0) >= game.maxPlayers) throw new Error("GAME_FULL");
      const exists = await db.select({ id: gamePlayers.id }).from(gamePlayers).where(and(eq(gamePlayers.gameId, gameId), eq(gamePlayers.userId, user.id))).limit(1);
      if (!exists[0]) {
        await ensurePlayerSport(user.id, game.sport);
        await db.insert(gamePlayers).values({ id: newId("gp"), gameId, userId: user.id, joinedAt: now });
      }
      return json({ ok: true });
    }

    if (action === "leave_game") {
      const gameId = String(body.gameId || "");
      const game = (await db.select().from(games).where(eq(games.id, gameId)).limit(1))[0];
      if (!game) throw new Error("GAME_NOT_FOUND");
      if (game.status !== "open") throw new Error("GAME_NOT_OPEN");
      if (game.creatorUserId === user.id) throw new Error("CREATOR_CANNOT_LEAVE");
      await db.delete(gamePlayers).where(and(eq(gamePlayers.gameId, gameId), eq(gamePlayers.userId, user.id)));
      return json({ ok: true });
    }

    if (action === "generate_teams") {
      const gameId = String(body.gameId || "");
      const game = (await db.select().from(games).where(eq(games.id, gameId)).limit(1))[0];
      if (!game) throw new Error("GAME_NOT_FOUND");
      if (game.creatorUserId !== user.id) throw new Error("CREATOR_ONLY");
      return json({ ok: true, ...(await generateBalancedTeams(gameId)) });
    }

    if (action === "submit_result") {
      const gameId = String(body.gameId || "");
      const scoreA = Math.max(0, Math.min(99, Number(body.scoreA)));
      const scoreB = Math.max(0, Math.min(99, Number(body.scoreB)));
      if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB)) throw new Error("INVALID_SCORE");
      const player = (await db.select().from(gamePlayers).where(and(eq(gamePlayers.gameId, gameId), eq(gamePlayers.userId, user.id))).limit(1))[0];
      if (!player) throw new Error("NOT_IN_GAME");
      await db.update(games).set({ scoreA, scoreB, submittedByUserId: user.id, status: "awaiting_confirmation", updatedAt: now }).where(eq(games.id, gameId));
      return json({ ok: true });
    }

    if (action === "confirm_result") {
      return json({ ok: true, result: await confirmResultAndApplyElo(String(body.gameId || ""), user.id) });
    }

    if (action === "create_challenge") {
      const sport = String(body.sport || "");
      const courtId = String(body.courtId || "");
      if (!isPlaySport(sport)) throw new Error("INVALID_SPORT");
      const court = (await db.select().from(courts).where(eq(courts.id, courtId)).limit(1))[0];
      if (!court) throw new Error("COURT_NOT_FOUND");
      const startsAt = new Date(body.startsAt);
      if (!Number.isFinite(startsAt.getTime())) throw new Error("INVALID_START_TIME");

      const incoming = Array.isArray(body.participants)
        ? body.participants
        : Array.isArray(body.invitedUserIds)
          ? body.invitedUserIds.map((userId: unknown) => ({ userId, side: "B" }))
          : [];
      const unique = new Map<string, "A" | "B">();
      for (const item of incoming.slice(0, 15)) {
        const userId = String(item?.userId || "");
        if (!userId || userId === user.id) continue;
        unique.set(userId, item?.side === "A" ? "A" : "B");
      }
      if (!unique.size) throw new Error("CHALLENGE_NEEDS_PLAYERS");
      const invitedIds = [...unique.keys()];
      const existingUsers = await db.select({ id: users.id }).from(users).where(inArray(users.id, invitedIds));
      if (existingUsers.length !== invitedIds.length) throw new Error("PLAYER_NOT_FOUND");

      const challengeId = newId("challenge");
      await db.insert(challenges).values({
        id: challengeId,
        creatorUserId: user.id,
        courtId,
        sport,
        format: String(body.format || "1v1").slice(0, 12),
        startsAt,
        status: "pending",
        message: body.message ? String(body.message).slice(0, 500) : null,
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(challengePlayers).values({
        id: newId("cp"), challengeId, userId: user.id, side: "A", role: "creator", status: "accepted", createdAt: now, respondedAt: now,
      });
      for (const [invitedUserId, side] of unique) {
        await db.insert(challengePlayers).values({
          id: newId("cp"), challengeId, userId: invitedUserId, side, role: "invitee", status: "pending", createdAt: now,
        });
      }
      return json({ ok: true, challengeId });
    }

    if (action === "respond_challenge") {
      const challengeId = String(body.challengeId || "");
      const response = String(body.response || "");
      if (response !== "accepted" && response !== "declined") throw new Error("INVALID_RESPONSE");
      const challenge = (await db.select().from(challenges).where(eq(challenges.id, challengeId)).limit(1))[0];
      if (!challenge) throw new Error("CHALLENGE_NOT_FOUND");
      if (challenge.status !== "pending") throw new Error("CHALLENGE_CLOSED");
      const link = (await db.select().from(challengePlayers).where(and(eq(challengePlayers.challengeId, challengeId), eq(challengePlayers.userId, user.id))).limit(1))[0];
      if (!link || link.role === "creator") throw new Error("NOT_CHALLENGE_INVITEE");
      if (link.status !== "pending") throw new Error("ALREADY_RESPONDED");

      await db.update(challengePlayers).set({ status: response, respondedAt: now }).where(eq(challengePlayers.id, link.id));
      if (response === "declined") {
        await db.update(challenges).set({ status: "declined", updatedAt: now }).where(eq(challenges.id, challengeId));
        return json({ ok: true, status: "declined" });
      }

      const allLinks = await db.select().from(challengePlayers).where(eq(challengePlayers.challengeId, challengeId));
      const pendingOthers = allLinks.filter((item) => item.id !== link.id && item.status === "pending");
      if (pendingOthers.length) return json({ ok: true, status: "pending" });
      if (!isPlaySport(challenge.sport)) throw new Error("INVALID_SPORT");

      const gameId = newId("game");
      await db.insert(games).values({
        id: gameId,
        creatorUserId: challenge.creatorUserId,
        courtId: challenge.courtId,
        sport: challenge.sport,
        format: challenge.format,
        level: "challenge",
        startsAt: challenge.startsAt,
        maxPlayers: allLinks.length,
        status: "open",
        createdAt: now,
        updatedAt: now,
      });
      for (const participant of allLinks) {
        await ensurePlayerSport(participant.userId, challenge.sport);
        await db.insert(gamePlayers).values({
          id: newId("gp"), gameId, userId: participant.userId, team: participant.side, joinedAt: now,
        });
        await awardCoins(participant.userId, "challenge_ready", challengeId, 5, "Challenge accepted");
      }
      await db.update(challenges).set({ status: "accepted", gameId, updatedAt: now }).where(eq(challenges.id, challengeId));
      return json({ ok: true, status: "accepted", gameId });
    }

    if (action === "send_challenge_message") {
      const challengeId = String(body.challengeId || "");
      const message = String(body.message || "").trim().slice(0, 1000);
      if (!message) throw new Error("EMPTY_MESSAGE");
      const member = await db.select({ id: challengePlayers.id }).from(challengePlayers).where(and(eq(challengePlayers.challengeId, challengeId), eq(challengePlayers.userId, user.id))).limit(1);
      if (!member[0]) throw new Error("NOT_IN_CHALLENGE");
      await db.insert(challengeMessages).values({ id: newId("cm"), challengeId, userId: user.id, body: message, createdAt: now });
      return json({ ok: true });
    }

    if (action === "checkin") {
      const courtId = String(body.courtId || "");
      const court = (await db.select().from(courts).where(eq(courts.id, courtId)).limit(1))[0];
      if (!court) throw new Error("COURT_NOT_FOUND");
      await db.delete(courtCheckins).where(eq(courtCheckins.userId, user.id));
      await db.insert(courtCheckins).values({
        id: newId("checkin"), userId: user.id, courtId, checkedInAt: now,
        expiresAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      });
      await awardCoins(user.id, "court_checkin", `${courtId}:${now.toISOString().slice(0, 10)}`, 5, "Court check-in");
      return json({ ok: true });
    }

    if (action === "checkout") {
      await db.delete(courtCheckins).where(eq(courtCheckins.userId, user.id));
      return json({ ok: true });
    }

    if (action === "report_court") {
      const courtId = String(body.courtId || "");
      const category = String(body.category || "other").slice(0, 40);
      const court = (await db.select().from(courts).where(eq(courts.id, courtId)).limit(1))[0];
      if (!court) throw new Error("COURT_NOT_FOUND");
      const reportId = newId("report");
      await db.insert(courtReports).values({
        id: reportId,
        courtId,
        userId: user.id,
        category,
        description: body.description ? String(body.description).slice(0, 2000) : null,
        photoUrl: body.photoUrl ? String(body.photoUrl).slice(0, 500) : null,
        status: "open",
        createdAt: now,
      });
      await awardCoins(user.id, "court_report", reportId, 10, "Court improvement report");
      return json({ ok: true, reportId });
    }

    if (action === "support_report") {
      const reportId = String(body.reportId || "");
      const report = (await db.select().from(courtReports).where(eq(courtReports.id, reportId)).limit(1))[0];
      if (!report) throw new Error("REPORT_NOT_FOUND");
      const exists = await db.select({ id: courtReportSupports.id }).from(courtReportSupports).where(and(eq(courtReportSupports.reportId, reportId), eq(courtReportSupports.userId, user.id))).limit(1);
      if (!exists[0]) await db.insert(courtReportSupports).values({ id: newId("support"), reportId, userId: user.id, createdAt: now });
      return json({ ok: true });
    }

    throw new Error("UNKNOWN_ACTION");
  } catch (error) {
    return fail(error);
  }
}
