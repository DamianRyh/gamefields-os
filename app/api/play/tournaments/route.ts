import { and, asc, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { tournamentEntries, tournamentMatches, tournaments } from "@/db/play-competition";
import { courts, playerSports, users } from "@/db/schema";
import { requireCurrentPlayUser } from "@/lib/play-auth";
import { awardCoins, ensurePlayerSport, isPlaySport, newId, playerTier } from "@/lib/play-engine";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

async function tournamentDetail(tournamentId: string, currentUserId: string) {
  const db = getDb();
  const tournament = (await db
    .select({
      id: tournaments.id,
      organizerUserId: tournaments.organizerUserId,
      organizerNickname: users.nickname,
      courtId: tournaments.courtId,
      courtName: courts.name,
      name: tournaments.name,
      sport: tournaments.sport,
      format: tournaments.format,
      maxEntries: tournaments.maxEntries,
      startsAt: tournaments.startsAt,
      status: tournaments.status,
      createdAt: tournaments.createdAt,
    })
    .from(tournaments)
    .innerJoin(users, eq(users.id, tournaments.organizerUserId))
    .innerJoin(courts, eq(courts.id, tournaments.courtId))
    .where(eq(tournaments.id, tournamentId))
    .limit(1))[0];
  if (!tournament) throw new Error("TOURNAMENT_NOT_FOUND");

  const entries = await db
    .select({
      id: tournamentEntries.id,
      userId: users.id,
      nickname: users.nickname,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      seed: tournamentEntries.seed,
      status: tournamentEntries.status,
      elo: playerSports.elo,
    })
    .from(tournamentEntries)
    .innerJoin(users, eq(users.id, tournamentEntries.userId))
    .leftJoin(playerSports, and(eq(playerSports.userId, users.id), eq(playerSports.sport, tournament.sport)))
    .where(eq(tournamentEntries.tournamentId, tournamentId))
    .orderBy(asc(tournamentEntries.seed), desc(playerSports.elo));

  const matches = await db
    .select({
      id: tournamentMatches.id,
      round: tournamentMatches.round,
      position: tournamentMatches.position,
      playerAUserId: tournamentMatches.playerAUserId,
      playerBUserId: tournamentMatches.playerBUserId,
      scoreA: tournamentMatches.scoreA,
      scoreB: tournamentMatches.scoreB,
      submittedByUserId: tournamentMatches.submittedByUserId,
      resultConfirmedAt: tournamentMatches.resultConfirmedAt,
      winnerUserId: tournamentMatches.winnerUserId,
      nextMatchId: tournamentMatches.nextMatchId,
      status: tournamentMatches.status,
    })
    .from(tournamentMatches)
    .where(eq(tournamentMatches.tournamentId, tournamentId))
    .orderBy(asc(tournamentMatches.round), asc(tournamentMatches.position));

  const names = new Map(entries.map((entry) => [entry.userId, entry.nickname]));
  return {
    tournament,
    entries: entries.map((entry) => ({ ...entry, elo: entry.elo ?? 1000, tier: playerTier(entry.elo ?? 1000) })),
    matches: matches.map((match) => ({
      ...match,
      playerANickname: match.playerAUserId ? names.get(match.playerAUserId) || null : null,
      playerBNickname: match.playerBUserId ? names.get(match.playerBUserId) || null : null,
      winnerNickname: match.winnerUserId ? names.get(match.winnerUserId) || null : null,
    })),
    isOrganizer: tournament.organizerUserId === currentUserId,
    isEntered: entries.some((entry) => entry.userId === currentUserId),
  };
}

export async function GET(request: Request) {
  try {
    const db = getDb();
    const user = await requireCurrentPlayUser();
    const url = new URL(request.url);
    const tournamentId = url.searchParams.get("id");
    if (tournamentId) return json({ ok: true, ...(await tournamentDetail(tournamentId, user.id)) });

    const rows = await db
      .select({
        id: tournaments.id,
        name: tournaments.name,
        sport: tournaments.sport,
        format: tournaments.format,
        maxEntries: tournaments.maxEntries,
        startsAt: tournaments.startsAt,
        status: tournaments.status,
        organizerNickname: users.nickname,
        courtName: courts.name,
        entryCount: sql<number>`count(${tournamentEntries.id})`,
      })
      .from(tournaments)
      .innerJoin(users, eq(users.id, tournaments.organizerUserId))
      .innerJoin(courts, eq(courts.id, tournaments.courtId))
      .leftJoin(tournamentEntries, eq(tournamentEntries.tournamentId, tournaments.id))
      .groupBy(tournaments.id)
      .orderBy(tournaments.startsAt)
      .limit(100);
    return json({ ok: true, tournaments: rows });
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
    const now = new Date();

    if (action === "create") {
      const sport = String(body.sport || "");
      if (!isPlaySport(sport)) throw new Error("INVALID_SPORT");
      const courtId = String(body.courtId || "");
      const court = (await db.select({ id: courts.id }).from(courts).where(eq(courts.id, courtId)).limit(1))[0];
      if (!court) throw new Error("COURT_NOT_FOUND");
      const startsAt = new Date(body.startsAt);
      if (!Number.isFinite(startsAt.getTime())) throw new Error("INVALID_START_TIME");
      const maxEntries = Number(body.maxEntries || 8);
      if (![2, 4, 8, 16, 32].includes(maxEntries)) throw new Error("INVALID_BRACKET_SIZE");
      const tournamentId = newId("tournament");
      await ensurePlayerSport(user.id, sport);
      await db.insert(tournaments).values({
        id: tournamentId,
        organizerUserId: user.id,
        courtId,
        name: String(body.name || "Gamefields Tournament").trim().slice(0, 100),
        sport,
        format: String(body.format || "1v1").slice(0, 12),
        maxEntries,
        startsAt,
        status: "open",
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(tournamentEntries).values({ id: newId("entry"), tournamentId, userId: user.id, status: "active", createdAt: now });
      return json({ ok: true, tournamentId });
    }

    const tournamentId = String(body.tournamentId || "");
    const tournament = (await db.select().from(tournaments).where(eq(tournaments.id, tournamentId)).limit(1))[0];
    if (!tournament) throw new Error("TOURNAMENT_NOT_FOUND");
    if (!isPlaySport(tournament.sport)) throw new Error("INVALID_SPORT");

    if (action === "join") {
      if (tournament.status !== "open") throw new Error("TOURNAMENT_CLOSED");
      const count = Number((await db.select({ count: sql<number>`count(*)` }).from(tournamentEntries).where(eq(tournamentEntries.tournamentId, tournamentId)))[0]?.count || 0);
      if (count >= tournament.maxEntries) throw new Error("TOURNAMENT_FULL");
      const existing = (await db.select({ id: tournamentEntries.id }).from(tournamentEntries).where(and(eq(tournamentEntries.tournamentId, tournamentId), eq(tournamentEntries.userId, user.id))).limit(1))[0];
      if (!existing) {
        await ensurePlayerSport(user.id, tournament.sport);
        await db.insert(tournamentEntries).values({ id: newId("entry"), tournamentId, userId: user.id, status: "active", createdAt: now });
        await awardCoins(user.id, "tournament_join", tournamentId, 10, "Joined tournament");
      }
      return json({ ok: true, ...(await tournamentDetail(tournamentId, user.id)) });
    }

    if (action === "leave") {
      if (tournament.status !== "open") throw new Error("TOURNAMENT_CLOSED");
      if (tournament.organizerUserId === user.id) throw new Error("ORGANIZER_CANNOT_LEAVE");
      await db.delete(tournamentEntries).where(and(eq(tournamentEntries.tournamentId, tournamentId), eq(tournamentEntries.userId, user.id)));
      return json({ ok: true });
    }

    if (action === "start") {
      if (tournament.organizerUserId !== user.id) throw new Error("ORGANIZER_ONLY");
      if (tournament.status !== "open") throw new Error("TOURNAMENT_ALREADY_STARTED");
      const entries = await db
        .select({ entryId: tournamentEntries.id, userId: tournamentEntries.userId, elo: playerSports.elo })
        .from(tournamentEntries)
        .leftJoin(playerSports, and(eq(playerSports.userId, tournamentEntries.userId), eq(playerSports.sport, tournament.sport)))
        .where(eq(tournamentEntries.tournamentId, tournamentId));
      const size = entries.length;
      if (size < 2 || (size & (size - 1)) !== 0) throw new Error("ENTRIES_MUST_BE_POWER_OF_TWO");
      if (size > tournament.maxEntries) throw new Error("TOO_MANY_ENTRIES");
      const seeded = [...entries].sort((a, b) => (b.elo ?? 1000) - (a.elo ?? 1000));
      for (let i = 0; i < seeded.length; i += 1) {
        await db.update(tournamentEntries).set({ seed: i + 1 }).where(eq(tournamentEntries.id, seeded[i].entryId));
      }

      const rounds = Math.log2(size);
      const ids: string[][] = [];
      for (let round = 1; round <= rounds; round += 1) {
        const matchCount = size / 2 ** round;
        ids[round] = Array.from({ length: matchCount }, () => newId("tm"));
      }
      for (let round = 1; round <= rounds; round += 1) {
        const matchCount = size / 2 ** round;
        for (let position = 0; position < matchCount; position += 1) {
          let playerAUserId: string | null = null;
          let playerBUserId: string | null = null;
          if (round === 1) {
            playerAUserId = seeded[position].userId;
            playerBUserId = seeded[size - 1 - position].userId;
          }
          const nextMatchId = round < rounds ? ids[round + 1][Math.floor(position / 2)] : null;
          await db.insert(tournamentMatches).values({
            id: ids[round][position],
            tournamentId,
            round,
            position: position + 1,
            playerAUserId,
            playerBUserId,
            nextMatchId,
            status: round === 1 ? "ready" : "pending",
            createdAt: now,
            updatedAt: now,
          });
        }
      }
      await db.update(tournaments).set({ status: "in_progress", updatedAt: now }).where(eq(tournaments.id, tournamentId));
      return json({ ok: true, ...(await tournamentDetail(tournamentId, user.id)) });
    }

    if (action === "submit_match") {
      const matchId = String(body.matchId || "");
      const match = (await db.select().from(tournamentMatches).where(and(eq(tournamentMatches.id, matchId), eq(tournamentMatches.tournamentId, tournamentId))).limit(1))[0];
      if (!match) throw new Error("MATCH_NOT_FOUND");
      if (!match.playerAUserId || !match.playerBUserId) throw new Error("MATCH_NOT_READY");
      if (user.id !== match.playerAUserId && user.id !== match.playerBUserId && user.id !== tournament.organizerUserId) throw new Error("NOT_MATCH_PARTICIPANT");
      const scoreA = Number(body.scoreA);
      const scoreB = Number(body.scoreB);
      if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0 || scoreA > 99 || scoreB > 99 || scoreA === scoreB) throw new Error("INVALID_SCORE");
      await db.update(tournamentMatches).set({ scoreA, scoreB, submittedByUserId: user.id, status: "awaiting_confirmation", updatedAt: now }).where(eq(tournamentMatches.id, matchId));
      return json({ ok: true });
    }

    if (action === "confirm_match") {
      const matchId = String(body.matchId || "");
      const match = (await db.select().from(tournamentMatches).where(and(eq(tournamentMatches.id, matchId), eq(tournamentMatches.tournamentId, tournamentId))).limit(1))[0];
      if (!match) throw new Error("MATCH_NOT_FOUND");
      if (match.status === "completed") return json({ ok: true, ...(await tournamentDetail(tournamentId, user.id)) });
      if (match.status !== "awaiting_confirmation" || match.scoreA == null || match.scoreB == null || !match.submittedByUserId) throw new Error("RESULT_NOT_SUBMITTED");
      if (user.id === match.submittedByUserId && user.id !== tournament.organizerUserId) throw new Error("SECOND_PARTY_REQUIRED");
      if (user.id !== tournament.organizerUserId && user.id !== match.playerAUserId && user.id !== match.playerBUserId) throw new Error("NOT_MATCH_PARTICIPANT");
      const winnerUserId = match.scoreA > match.scoreB ? match.playerAUserId : match.playerBUserId;
      if (!winnerUserId) throw new Error("WINNER_UNAVAILABLE");
      await db.update(tournamentMatches).set({ winnerUserId, resultConfirmedAt: now, status: "completed", updatedAt: now }).where(eq(tournamentMatches.id, matchId));

      if (match.nextMatchId) {
        const next = (await db.select().from(tournamentMatches).where(eq(tournamentMatches.id, match.nextMatchId)).limit(1))[0];
        if (!next) throw new Error("NEXT_MATCH_NOT_FOUND");
        const setA = !next.playerAUserId;
        await db.update(tournamentMatches).set({
          playerAUserId: setA ? winnerUserId : next.playerAUserId,
          playerBUserId: setA ? next.playerBUserId : winnerUserId,
          status: (setA ? next.playerBUserId : next.playerAUserId) ? "ready" : "pending",
          updatedAt: now,
        }).where(eq(tournamentMatches.id, next.id));
      } else {
        await db.update(tournaments).set({ status: "completed", updatedAt: now }).where(eq(tournaments.id, tournamentId));
        await awardCoins(winnerUserId, "tournament_win", tournamentId, 250, "Tournament champion");
      }
      await awardCoins(winnerUserId, "tournament_match_win", matchId, 25, "Tournament match win");
      return json({ ok: true, ...(await tournamentDetail(tournamentId, user.id)) });
    }

    throw new Error("UNKNOWN_ACTION");
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return json({ ok: false, error: code }, code === "UNAUTHENTICATED" ? 401 : code.endsWith("NOT_FOUND") ? 404 : 400);
  }
}
