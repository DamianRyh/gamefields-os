import { and, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { getDb, getD1 } from "@/db";
import { POST as gameRoomPost } from "@/app/api/play/game-room/route";
import { formatCapacity } from "@/lib/play-lifecycle";
import { assertSameOrigin, playError, validImageUrl } from "@/lib/play-http";
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

const fail = playError;

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
      myGames: await db.select({id:games.id,courtId:games.courtId,courtName:courts.name,sport:games.sport,format:games.format,startsAt:games.startsAt,status:games.status,maxPlayers:games.maxPlayers,playerCount:sql<number>`(SELECT count(*) FROM game_players WHERE game_id=${games.id})`}).from(gamePlayers).innerJoin(games,eq(games.id,gamePlayers.gameId)).innerJoin(courts,eq(courts.id,games.courtId)).where(eq(gamePlayers.userId,user.id)).orderBy(desc(games.updatedAt)).limit(20),
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
    assertSameOrigin(request);
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
        avatarUrl: body.avatarUrl ? validImageUrl(body.avatarUrl) : user.avatarUrl,
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
      if (!court.sports.includes(sport)) throw new Error("COURT_SPORT_MISMATCH");
      await db.insert(homeCourts).values({ id: newId("home"), userId: user.id, courtId, sport, createdAt: now }).onConflictDoUpdate({ target: [homeCourts.userId, homeCourts.sport], set: { courtId } });
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
      if (!court.sports.includes(sport)) throw new Error("COURT_SPORT_MISMATCH");
      if (startsAt.getTime() < Date.now() - 5 * 60 * 1000) throw new Error("INVALID_START_TIME");
      const format = String(body.format || "3v3");
      const maxPlayers = formatCapacity(format);
      const gameId = newId("game");
      await ensurePlayerSport(user.id, sport);
      await db.batch([db.insert(games).values({
        id: gameId,
        creatorUserId: user.id,
        courtId,
        sport,
        format,
        level: String(body.level || "open").slice(0, 24),
        startsAt,
        maxPlayers,
        status: "open",
        createdAt: now,
        updatedAt: now,
      }), db.insert(gamePlayers).values({ id: newId("gp"), gameId, userId: user.id, joinedAt: now })]);
      return json({ ok: true, gameId });
    }

    if (["join_game", "leave_game", "generate_teams", "start_game", "set_game_ready", "submit_result", "confirm_result"].includes(action)) {
      return gameRoomPost(new Request(request.url, {method:"POST",headers:request.headers,body:JSON.stringify(body)}));
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
      if (!court.sports.includes(sport)) throw new Error("COURT_SPORT_MISMATCH");
      if (startsAt.getTime() < Date.now() - 5 * 60 * 1000) throw new Error("INVALID_START_TIME");
      const capacity = formatCapacity(body.format || "1v1");
      if (unique.size + 1 !== capacity || [...unique.values()].filter(x=>x==="A").length + 1 !== capacity/2 || [...unique.values()].filter(x=>x==="B").length !== capacity/2) throw new Error("CHALLENGE_CAPACITY");
      const invitedIds = [...unique.keys()];
      const existingUsers = await db.select({ id: users.id }).from(users).where(inArray(users.id, invitedIds));
      if (existingUsers.length !== invitedIds.length) throw new Error("PLAYER_NOT_FOUND");

      const challengeId = newId("challenge");
      const writes = [db.insert(challenges).values({
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
      }), db.insert(challengePlayers).values({
        id: newId("cp"), challengeId, userId: user.id, side: "A", role: "creator", status: "accepted", createdAt: now, respondedAt: now,
      })];
      for (const [invitedUserId, side] of unique) {
        writes.push(db.insert(challengePlayers).values({
          id: newId("cp"), challengeId, userId: invitedUserId, side, role: "invitee", status: "pending", createdAt: now,
        }));
      }
      await db.batch(writes as [typeof writes[number], ...typeof writes[number][]]);
      return json({ ok: true, challengeId });
    }

    if (action === "respond_challenge") {
      const challengeId = String(body.challengeId || "");
      const response = String(body.response || "");
      if (response !== "accepted" && response !== "declined") throw new Error("INVALID_RESPONSE");
      const challenge = (await db.select().from(challenges).where(eq(challenges.id, challengeId)).limit(1))[0];
      if (!challenge) throw new Error("CHALLENGE_NOT_FOUND");
      if (challenge.status === "accepted") {
        const member=(await db.select({id:challengePlayers.id}).from(challengePlayers).where(and(eq(challengePlayers.challengeId,challengeId),eq(challengePlayers.userId,user.id))).limit(1))[0];
        if(!member) throw new Error("NOT_IN_CHALLENGE");
        return json({ok:true,status:"accepted",gameId:challenge.gameId});
      }
      if (challenge.status !== "pending") throw new Error("CHALLENGE_CLOSED");
      const link = (await db.select().from(challengePlayers).where(and(eq(challengePlayers.challengeId, challengeId), eq(challengePlayers.userId, user.id))).limit(1))[0];
      if (!link || link.role === "creator") throw new Error("NOT_CHALLENGE_INVITEE");
      if (link.status !== "pending") throw new Error("ALREADY_RESPONDED");

      if (response === "declined") {
        const d1=getD1(),stamp=Math.floor(now.getTime()/1000);
        await d1.batch([
          d1.prepare("UPDATE challenge_players SET status='declined',responded_at=? WHERE id=? AND status='pending' AND EXISTS (SELECT 1 FROM challenges WHERE id=? AND status='pending')").bind(stamp,link.id,challengeId),
          d1.prepare("UPDATE challenges SET status='declined',updated_at=? WHERE id=? AND status='pending' AND EXISTS (SELECT 1 FROM challenge_players WHERE id=? AND status='declined')").bind(stamp,challengeId,link.id),
        ]);
        return json({ok:true,status:"declined"});
      }
      await db.update(challengePlayers).set({status:response,respondedAt:now}).where(and(eq(challengePlayers.id,link.id),eq(challengePlayers.status,"pending"),sql`EXISTS (SELECT 1 FROM challenges WHERE id=${challengeId} AND status='pending')`));
      const allLinks=await db.select().from(challengePlayers).where(eq(challengePlayers.challengeId,challengeId));
      if (allLinks.some(p=>p.status!=="accepted")) return json({ok:true,status:"pending"});
      if (!isPlaySport(challenge.sport)) throw new Error("INVALID_SPORT");
      for (const p of allLinks) await ensurePlayerSport(p.userId,challenge.sport);
      const gameId = `game_challenge_${challengeId}`;
      const d1=getD1(), stamp=Math.floor(now.getTime()/1000);
      const batch=[d1.prepare("INSERT OR IGNORE INTO games (id,creator_user_id,court_id,sport,format,level,starts_at,max_players,status,created_at,updated_at) SELECT ?,creator_user_id,court_id,sport,format,'challenge',starts_at,?,'open',?,? FROM challenges WHERE id=? AND status='pending' AND NOT EXISTS (SELECT 1 FROM challenge_players WHERE challenge_id=? AND status!='accepted')").bind(gameId,allLinks.length,stamp,stamp,challengeId,challengeId)];
      for (const p of allLinks) batch.push(d1.prepare("INSERT OR IGNORE INTO game_players (id,game_id,user_id,team,joined_at) SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM games WHERE id=?)").bind(newId("gp"),gameId,p.userId,p.side,stamp,gameId));
      batch.push(d1.prepare("UPDATE challenges SET status='accepted', game_id=?, updated_at=? WHERE id=? AND status='pending' AND EXISTS (SELECT 1 FROM games WHERE id=?)").bind(gameId,stamp,challengeId,gameId));
      await d1.batch(batch);
      const finalized=(await db.select().from(challenges).where(eq(challenges.id,challengeId)).limit(1))[0];
      if (finalized.status!=="accepted") throw new Error("CHALLENGE_CLOSED");
      for(const p of allLinks) await awardCoins(p.userId,"challenge_ready",challengeId,5,"Challenge accepted");
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
      await db.batch([db.delete(courtCheckins).where(eq(courtCheckins.userId, user.id)), db.insert(courtCheckins).values({
        id: newId("checkin"), userId: user.id, courtId, checkedInAt: now,
        expiresAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      })]);
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
        photoUrl: validImageUrl(body.photoUrl),
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
      if (!exists[0]) await db.insert(courtReportSupports).values({ id: newId("support"), reportId, userId: user.id, createdAt: now }).onConflictDoNothing();
      return json({ ok: true });
    }

    throw new Error("UNKNOWN_ACTION");
  } catch (error) {
    return fail(error);
  }
}
